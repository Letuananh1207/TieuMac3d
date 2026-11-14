#!/usr/bin/env node
/**
 * Đo hiệu năng tự động (kế hoạch docs/tasks/2026-11-14-muot-ma-nhu-game.md) — không cần điện thoại.
 *
 *   cd web && npm run build && npm run bench            # cả hai hồ sơ
 *   npm run bench -- --ho-so yeu                         # chỉ "máy yếu"
 *   npm run bench -- --ghi                               # ghi thêm kết quả vào docs/perf/bench.md
 *
 * Mở bản build (`vite preview`) trong Chrome headless qua giao thức gỡ lỗi (CDP), màn điện thoại 390×844 @3x
 * (app tự kẹp pixelRatio ≤ 1,5), bật `?debug` rồi tự đi một lộ trình bằng phím / chuột, đọc bảng gỡ lỗi (#fps) mỗi 0,5 s.
 *
 * Hồ sơ:
 *   may-tinh — GPU thật của máy tính: số tuyệt đối đẹp hơn điện thoại nhiều, dùng để so TRƯỚC / SAU.
 *   yeu      — GPU giả lập bằng phần mềm (SwiftShader) + CPU chậm ×4: gần "điện thoại yếu", nhạy với số điểm ảnh / tam giác.
 * Số đo trên máy tính KHÔNG thay được đo máy thật — chỉ so tương đối giữa các lần sửa trên cùng máy.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, appendFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const only = args.includes('--ho-so') ? args[args.indexOf('--ho-so') + 1] : null;
const write = args.includes('--ghi');
/** thêm vào địa chỉ trang, vd. `--q o=24` (thử tham số) */
/** mật độ điểm ảnh màn giả lập (app kẹp ≤ 1,5): `--dpr 1` để thử độ phân giải thấp */
const DPR = args.includes('--dpr') ? Number(args[args.indexOf('--dpr') + 1]) : 3;
const extraQ = args.includes('--q') ? `&${args[args.indexOf('--q') + 1]}` : '';
const PORT = 4173;
const DBG = 9333;

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => existsSync(p));
if (!CHROME) throw new Error('Không thấy Chrome');
if (!existsSync(join(ROOT, 'dist/index.html'))) throw new Error('Chưa build: cd web && npm run build');

const PROFILES = {
  'may-tinh': { name: 'GPU máy tính', flags: [], cpu: 1 },
  yeu: { name: 'Máy yếu (SwiftShader + CPU ×4)', flags: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'], cpu: 4 },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitHttp(url, ms = 20000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      const r = await fetch(url);
      if (r.ok) return r;
    } catch {
      /* chưa lên */
    }
    await sleep(250);
  }
  throw new Error(`Không mở được ${url}`);
}

/** Kết nối CDP tới một trang; `send(method, params)` → Promise kết quả. */
async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((ok, bad) => {
    ws.onopen = ok;
    ws.onerror = bad;
  });
  let id = 0;
  const wait = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && wait.has(msg.id)) {
      const { ok, bad } = wait.get(msg.id);
      wait.delete(msg.id);
      if (msg.error) bad(new Error(msg.error.message));
      else ok(msg.result);
    }
  };
  const send = (method, params = {}) =>
    new Promise((ok, bad) => {
      wait.set(++id, { ok, bad });
      ws.send(JSON.stringify({ id, method, params }));
    });
  return { send, close: () => ws.close() };
}

const KEYS = { w: 87, a: 65, s: 83, d: 68 };
const key = (send, k, down) =>
  send('Input.dispatchKeyEvent', { type: down ? 'keyDown' : 'keyUp', key: k, code: `Key${k.toUpperCase()}`, windowsVirtualKeyCode: KEYS[k] });

/** Đọc bảng gỡ lỗi: "58 fps · 17.2 ms (1%: 33) · khựng 0 · 113 dc · 131k ▲\nGPU · 1.5× · 585×1266". */
async function readPanel(send) {
  const r = await send('Runtime.evaluate', { expression: "document.getElementById('fps')?.textContent ?? ''", returnByValue: true });
  const text = r.result.value ?? '';
  const m = text.match(/(\d+) fps · ([\d.]+) ms \(1%: (\d+)\) · khựng (\d+) · (\d+) dc · (\d+)(k?) ▲/);
  if (!m) return { text };
  return {
    text,
    fps: +m[1],
    ms: +m[2],
    low: +m[3],
    hitch: +m[4],
    dc: +m[5],
    tri: +m[6] * (m[7] ? 1000 : 1),
    info: text.split('\n')[1] ?? '',
  };
}

/** Một chặng: chạy `act` (bấm phím…) trong `secs` giây, bỏ 1 s đầu, gom các lần đọc bảng. */
async function stage(send, name, secs, act = async () => {}, undo = async () => {}) {
  await act();
  await sleep(1000);
  const reads = [];
  const end = Date.now() + (secs - 1) * 1000;
  while (Date.now() < end) {
    await sleep(500);
    const p = await readPanel(send);
    if (p.fps !== undefined) reads.push(p);
  }
  await undo();
  if (!reads.length) return { name, fps: NaN };
  const med = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  return {
    name,
    fps: med(reads.map((r) => r.fps)),
    ms: med(reads.map((r) => r.ms)),
    low: Math.max(...reads.map((r) => r.low)),
    hitch: reads.reduce((a, r) => a + r.hitch, 0) / reads.length,
    dc: Math.max(...reads.map((r) => r.dc)),
    tri: Math.max(...reads.map((r) => r.tri)),
    info: reads[reads.length - 1].info,
  };
}

async function runProfile(id) {
  const prof = PROFILES[id];
  const dir = join(tmpdir(), `hocxa-bench-${id}-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  const chrome = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${DBG}`,
    `--user-data-dir=${dir}`,
    '--no-first-run',
    '--disable-extensions',
    '--autoplay-policy=no-user-gesture-required',
    ...prof.flags,
    'about:blank',
  ]);
  try {
    await waitHttp(`http://127.0.0.1:${DBG}/json/version`);
    const pages = await (await fetch(`http://127.0.0.1:${DBG}/json/list`)).json();
    const page = pages.find((p) => p.type === 'page');
    const { send, close } = await connect(page.webSocketDebuggerUrl);
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: DPR, mobile: true });
    if (prof.cpu > 1) await send('Emulation.setCPUThrottlingRate', { rate: prof.cpu });
    await send('Page.navigate', { url: `http://localhost:${PORT}/?debug${extraQ}` });
    // chờ màn tải xong (class `done`), tối đa 120 s (máy yếu dựng chậm)
    const t0 = Date.now();
    let loaded = false;
    while (Date.now() - t0 < 120000) {
      await sleep(500);
      const r = await send('Runtime.evaluate', {
        expression: "(() => { const l = document.querySelector('.done'); return !!l && !!document.getElementById('fps')?.textContent?.includes('fps'); })()",
        returnByValue: true,
      });
      if (r.result.value) {
        loaded = true;
        break;
      }
    }
    const loadSec = (Date.now() - t0) / 1000;
    if (!loaded) {
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const f = join(ROOT, `../docs/perf/bench-ket-${id}.png`);
      mkdirSync(dirname(f), { recursive: true });
      writeFileSync(f, Buffer.from(shot.data, 'base64'));
      throw new Error(`${prof.name}: trang chưa tải xong sau 120 s — ảnh ${f}`);
    }
    // 2 giây đầu sau màn tải: khựng do dịch shader / tải texture lần đầu (bước 3 — biên dịch sẵn)
    await sleep(1900);
    const first = await readPanel(send);
    console.log(`Vào cảnh (2 s đầu): ${first.fps} fps · 1 % chậm ${first.low} ms · khựng ${first.hitch}`);
    if (args.includes('--tam-giac')) {
      // phân tích: vật nào gánh nhiều tam giác, có nằm trong khung nhìn không, có được cắt bỏ không
      const r = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          const { scene, camera } = window.__hocXa;
          const T = scene.constructor; // không có THREE ở window: dùng prototype có sẵn
          camera.updateMatrixWorld();
          const m = camera.projectionMatrix.clone().multiply(camera.matrixWorldInverse);
          const fr = new (Object.getPrototypeOf(camera).constructor === undefined ? Object : Object)();
          const rows = [];
          scene.traverseVisible((o) => {
            if (!o.isMesh && !o.isPoints && !o.isLine) return;
            const g = o.geometry; if (!g) return;
            const per = g.index ? g.index.count / 3 : g.attributes.position.count / 3;
            const n = o.isInstancedMesh ? per * o.count : per;
            let name = o.name || ''; for (let p = o.parent; !name && p && p !== scene; p = p.parent) name = p.name || '';
            g.boundingSphere || g.computeBoundingSphere();
            const r = g.boundingSphere ? g.boundingSphere.radius * o.matrixWorld.getMaxScaleOnAxis() : 0;
            rows.push({ name: name || o.type, tris: Math.round(n), culled: o.frustumCulled, radius: Math.round(r), inst: o.isInstancedMesh ? o.count : 0, mat: o.material?.type ?? '' });
          });
          rows.sort((a, b) => b.tris - a.tris);
          const total = rows.reduce((a, r) => a + r.tris, 0);
          return { total, count: rows.length, top: rows.slice(0, 20) };
        })()`,
      });
      const v = r.result.value;
      console.log(`Tổng ${v.total} tam giác trong ${v.count} vật đang hiện. 20 vật nặng nhất:`);
      for (const t of v.top) console.log(`  ${String(t.tris).padStart(7)}  r=${String(t.radius).padStart(4)} m  ${t.culled ? 'cắt được' : 'LUÔN VẼ '}  ${t.inst ? `inst×${t.inst} ` : ''}${t.mat}  ${t.name}`);
      close();
      return { id, name: prof.name, loadSec, rows: [] };
    }
    const out = [];
    out.push(await stage(send, 'Đứng giữa sân', 6));
    out.push(
      await stage(
        send,
        'Đi + rẽ (W + D)',
        8,
        async () => {
          await key(send, 'w', true);
          await key(send, 'd', true);
        },
        async () => {
          await key(send, 'd', false);
          await key(send, 'w', false);
        },
      ),
    );
    out.push(
      await stage(
        send,
        'Đi thẳng xa (W)',
        8,
        () => key(send, 'w', true),
        () => key(send, 'w', false),
      ),
    );
    // zoom ra hết cỡ: nhìn cả sân (nặng nhất — nhiều thứ trong khung)
    const zoomOut = async () => {
      for (let i = 0; i < 20; i++) {
        await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 300, y: 400, deltaX: 0, deltaY: 400 });
      }
    };
    const zoomIn = async () => {
      for (let i = 0; i < 20; i++) {
        await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 300, y: 400, deltaX: 0, deltaY: -400 });
      }
    };
    out.push(await stage(send, 'Zoom ra cả sân', 6, zoomOut));
    // chụp lúc đang nhìn cả sân — xem lộ trình đi tới đâu, cảnh vẽ đúng chưa
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    mkdirSync(join(ROOT, '../docs/perf'), { recursive: true });
    writeFileSync(join(ROOT, `../docs/perf/bench-${id}.png`), Buffer.from(shot.data, 'base64'));
    await zoomIn();
    close();
    return { id, name: prof.name, loadSec, rows: out };
  } finally {
    chrome.kill();
  }
}

function table(res) {
  const lines = [
    `### ${res.name} — tải ${res.loadSec.toFixed(1)} s · ${res.rows[0]?.info ?? ''}`,
    '',
    '| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |',
    '|---|---|---|---|---|---|---|',
    ...res.rows.map(
      (r) => `| ${r.name} | ${r.fps} | ${r.ms} | ${r.low} | ${(r.hitch ?? 0).toFixed(1)} | ${r.dc} | ${Math.round((r.tri ?? 0) / 1000)}k |`,
    ),
    '',
  ];
  return lines.join('\n');
}

const preview = spawn(process.execPath, [join(ROOT, 'node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: ROOT,
  stdio: 'ignore',
});
try {
  await waitHttp(`http://localhost:${PORT}/`);
  const ids = only ? [only] : Object.keys(PROFILES);
  let md = `## Bench ${new Date().toISOString().slice(0, 16).replace('T', ' ')}\n\n`;
  for (const id of ids) {
    const res = await runProfile(id);
    const t = table(res);
    console.log(t);
    md += t + '\n';
  }
  if (write) {
    const f = join(ROOT, '../docs/perf/bench.md');
    if (!existsSync(f)) writeFileSync(f, '# Kết quả đo hiệu năng tự động (`npm run bench`)\n\nSo TRƯỚC / SAU trên cùng máy — không thay đo máy thật.\n\n');
    appendFileSync(f, md);
    console.log(`→ ghi vào ${f}`);
  }
} finally {
  preview.kill();
}
