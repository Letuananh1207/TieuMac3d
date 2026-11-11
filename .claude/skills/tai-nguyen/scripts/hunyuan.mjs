// Gọi máy chủ API Hunyuan3D-2 cục bộ (launcher → "API 2.0", mặc định http://127.0.0.1:8081) để tạo model .glb từ ảnh.
//   node .claude/skills/tai-nguyen/scripts/hunyuan.mjs kiem
//   node .claude/skills/tai-nguyen/scripts/hunyuan.mjs tao <anh.png|jpg|webp> --ra <file.glb>
//        [--seed 1234] [--octree 256] [--steps 5] [--texture] [--face 40000] [--cho 900]
// Gửi việc (/send) rồi hỏi tiến độ (/status/<uid>) mỗi 3 giây — tạo lâu không bị đứt kết nối. Chỉ gọi máy cục bộ,
// không cần gói npm nào (Node ≥ 18 có fetch). API tự tách nền ảnh (rembg).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const flag = (name) => args.includes(`--${name}`);
const base = (opt('url', process.env.HUNYUAN_URL ?? 'http://127.0.0.1:8081')).replace(/\/$/, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function alive() {
  try {
    const r = await fetch(`${base}/status/kiem-tra`, { signal: AbortSignal.timeout(4000) });
    return r.ok;
  } catch {
    return false;
  }
}

const cmd = args[0];
if (cmd === 'kiem') {
  const ok = await alive();
  console.log(ok ? `Hunyuan API đang chạy: ${base}` : `Không thấy Hunyuan API ở ${base} — mở launcher, chọn "API 2.0", Save and Start (xem references/hunyuan.md).`);
  process.exit(ok ? 0 : 1);
}

if (cmd !== 'tao' || !args[1]) {
  console.error('Cách dùng: hunyuan.mjs kiem | hunyuan.mjs tao <ảnh> --ra <file.glb> [--seed N] [--octree 256] [--steps 5] [--texture] [--face 40000] [--cho 900]');
  process.exit(1);
}
const image = resolve(args[1]);
if (!existsSync(image)) {
  console.error(`Không thấy ảnh: ${image}`);
  process.exit(1);
}
if (!['.png', '.jpg', '.jpeg', '.webp'].includes(extname(image).toLowerCase())) {
  console.error('Ảnh phải là .png / .jpg / .webp');
  process.exit(1);
}
const out = resolve(opt('ra', image.replace(/\.[^.]+$/, '.glb')));
if (!(await alive())) {
  console.error(`Không thấy Hunyuan API ở ${base} — mở launcher, chọn "API 2.0", Save and Start.`);
  process.exit(1);
}

const params = {
  image: readFileSync(image).toString('base64'),
  seed: Number(opt('seed', 1234)),
  octree_resolution: Number(opt('octree', 256)), // 128 mặc định của API thô; 256 rõ chi tiết hơn (lưới dày — model:clean giảm sau)
  num_inference_steps: Number(opt('steps', 5)), // model mini-turbo: 5 bước là đủ
  texture: flag('texture'), // cần API chạy với "Enable Texture Generation" (MSVC) — không thì bỏ qua
  face_count: Number(opt('face', 40000)),
  type: 'glb',
};
const t0 = Date.now();
const sent = await fetch(`${base}/send`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(params),
});
if (!sent.ok) {
  console.error(`API từ chối (${sent.status}): ${await sent.text()}`);
  process.exit(1);
}
const { uid } = await sent.json();
console.log(`Đã gửi (uid ${uid}, seed ${params.seed}, octree ${params.octree_resolution}${params.texture ? ', có texture' : ''}) — đang tạo…`);

const limit = Number(opt('cho', 900)) * 1000;
while (Date.now() - t0 < limit) {
  await sleep(3000);
  let st;
  try {
    st = await (await fetch(`${base}/status/${uid}`)).json();
  } catch (e) {
    console.error(`Mất kết nối API: ${e.message}`);
    process.exit(1);
  }
  if (st.status === 'completed') {
    mkdirSync(dirname(out), { recursive: true });
    const buf = Buffer.from(st.model_base64, 'base64');
    writeFileSync(out, buf);
    console.log(`Xong sau ${Math.round((Date.now() - t0) / 1000)} s → ${out} (${(buf.length / 1024).toFixed(0)} KB)`);
    process.exit(0);
  }
}
console.error(`Quá ${limit / 1000} s chưa xong — API có thể đã lỗi (xem cửa sổ PowerShell của Hunyuan: Traceback / CUDA out of memory).`);
process.exit(2);
