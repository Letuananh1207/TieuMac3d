// Kiểm mọi đặc tả cảnh design/scene/*.json (scene.json = tông môn, <mã vùng>.json = vùng) bằng đúng code của app (scene/spec.ts + zones/zones.ts).
// In lỗi, vùng sự kiện và bố cục; có lỗi → thoát 1 (chặn `npm run build` của app).
// Dùng: cd web && npm run scene:check   (xem decisions/0002-thiet-ke-3d.md)
//       npm run scene:check -- --thu-npc   thêm bản thử Tiểu Khất + Lão Canh (scene/npcDraft.ts) vào tông môn để kiểm đường đi
import { build } from 'esbuild';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = resolve(web, '..', 'design', 'scene');

// Kiểm đường đi NPC (R-NPC-7) cần vật cản thật → dựng cảnh trong node: canvas 2D giả, không cửa sổ, `import.meta.glob` rỗng
const ctx2d = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : key === 'getImageData' ? () => ({ data: new Uint8ClampedArray(4) }) : () => ctx2d) });
globalThis.document ??= { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx2d }) };
globalThis.window ??= { devicePixelRatio: 1, innerWidth: 390, innerHeight: 844, addEventListener: () => {} };
globalThis.__viteGlob = () => ({});
const thuNpc = process.argv.includes('--thu-npc');

const out = await build({
  stdin: {
    contents:
      "export { buildWorld } from './src/scene/world.ts';\n" +
      "export { Colliders } from './src/collision/colliders.ts';\n" +
      "export { checkRoute, routeLength } from './src/scene/routeCheck.ts';\n" +
      "export { DRAFT_TOWN_NPCS } from './src/scene/npcDraft.ts';\n" +
      "export { Scene } from 'three';\n" +
      "export { roomKinds, zoneAnchors } from './src/scene/spec.ts';\n" +
      "export { resolveSceneSpec } from './src/scene/specCheck.ts';\n" +
      "export { placeZones, ZONE_CONTENT } from './src/zones/zones.ts';\n" +
      "export { moonRadius, gateOpening, lauClearHeight, lauTop } from './src/scene/kien_truc/tuong.ts';\n" +
      "export { wallGates } from './src/scene/walls.ts';\n" +
      "export { ringTrigger, arrivalSpot, daisLayout } from './src/scene/teleportLayout.ts';\n" +
      "export { landingPad, START_HEADING } from './src/scene/hacDuong.ts';\n" +
      "export { BAI_HOC } from './src/zones/tuVung/bai.ts';\n" +
      "export { applyVariant } from './src/scene/bienThe.ts';\n" +
      "export { mangSpotOk } from './src/scene/mangLam.ts';\n" +
      "export { mangOfDay, MANG_WAVES } from './src/zones/mang.ts';\n" +
      "export { GAME_NPC_IDS } from './src/scene/spec.ts';\n" +
      "export { checkPlaceNames, checkPortalLabels } from './src/scene/placeNames.ts';\n",
    resolveDir: web,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'error',
  define: { 'import.meta.glob': 'globalThis.__viteGlob' },
  loader: { '.png': 'empty', '.jpg': 'empty', '.glb': 'empty', '.css': 'empty', '.woff2': 'empty' },
});
const { checkPlaceNames, checkPortalLabels, buildWorld, Colliders, checkRoute, routeLength, DRAFT_TOWN_NPCS, Scene, resolveSceneSpec, roomKinds, zoneAnchors, placeZones, ZONE_CONTENT, moonRadius, gateOpening, lauClearHeight, lauTop, wallGates, ringTrigger, arrivalSpot, daisLayout, landingPad, START_HEADING, BAI_HOC, applyVariant, mangSpotOk, mangOfDay, MANG_WAVES, GAME_NPC_IDS } = await import(
  `data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`
);

const n = (v) => String(v).replace('.', ',');
const GAME_NPCS = new Set(GAME_NPC_IDS);
const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort((a, b) => (a === 'scene.json' ? -1 : b === 'scene.json' ? 1 : a.localeCompare(b))) : [];
if (!files.includes('scene.json')) files.unshift('');
let errors = 0;
/** cổng đi bộ mỗi cảnh (mã cảnh → portals) để kiểm chéo cặp cổng sau vòng lặp (R-HANH-4) */
const portalsOf = new Map();
/** mã cảnh → site.name, để so với tên nơi trên bản đồ truyền tống (R-HANH-1) */
const siteNames = new Map();
for (const f of files) {
  const rel = f ? `design/scene/${f}` : 'design/scene/scene.json';
  let raw;
  if (f) {
    try {
      raw = JSON.parse(readFileSync(resolve(dir, f), 'utf8'));
    } catch (e) {
      console.error(`${rel}: không đọc được JSON — ${e.message}`);
      errors++;
      continue;
    }
    console.log(`
=== Đặc tả: ${rel} ===`);
  } else {
    console.log(`
Chưa có ${rel} — dùng cảnh mặc định trong code.`);
  }
  errors += checkScene(rel, raw);
  if (typeof raw?.site?.name === 'string') siteNames.set(f === 'scene.json' ? 'tong-mon' : f.slice(0, -5), raw.site.name);
}
errors += checkPortalPairs();
errors += checkMapNames();
// biến thể bố cục (design/scene/bien_the/*.json — chỉ Canvas 3D `?bocuc=`, scene/bienThe.ts): ghép lên scene.json rồi kiểm như tông môn
const vdir = resolve(dir, 'bien_the');
if (existsSync(vdir) && files.includes('scene.json')) {
  const homeRaw = JSON.parse(readFileSync(resolve(dir, 'scene.json'), 'utf8'));
  for (const f of readdirSync(vdir).filter((x) => x.endsWith('.json')).sort()) {
    const rel = `design/scene/bien_the/${f}`;
    console.log(`\n=== Biến thể: ${rel} (ghép lên design/scene/scene.json — Canvas 3D ?bocuc=${f.slice(0, -5)}) ===`);
    let patch;
    try {
      patch = JSON.parse(readFileSync(resolve(vdir, f), 'utf8'));
    } catch (e) {
      console.error(`${rel}: không đọc được JSON — ${e.message}`);
      errors++;
      continue;
    }
    const merged = [];
    errors += checkScene(rel, applyVariant(homeRaw, patch, merged), { home: true, extra: merged });
  }
}
if (errors) process.exit(1);

/** Cặp cổng giữa các cảnh: cảnh đích phải có file và có cổng về (V-59: thiếu → lỗi); nhãn cổng = tên nơi đến trên bản đồ. */
function checkPortalPairs() {
  let bad = 0;
  for (const [id, portals] of portalsOf) {
    for (const p of portals) {
      if (!portalsOf.has(p.scene)) {
        console.error(`${sceneRel(id)}: cổng → "${p.scene}": không có file ${sceneRel(p.scene)} — app sẽ đưa về Khởi Nguyên Trấn`);
        bad++;
      } else if (!portalsOf.get(p.scene).some((q) => q.scene === id)) {
        // V-59: cổng đi bộ luôn có cặp — thiếu cổng về thì tới nơi đứng ở player.start, không về được bằng cổng
        console.error(`${sceneRel(p.scene)}: không có cổng về "${id}" (cặp của cổng ở ${sceneRel(id)}) — thêm cổng về`);
        bad++;
      }
    }
  }
  const mapFile = resolve(dir, 'ban-do', 'ban-do.json');
  const labels = existsSync(mapFile) ? checkPortalLabels(portalsOf, JSON.parse(readFileSync(mapFile, 'utf8')).noi ?? []) : [];
  for (const e of labels) console.error(e);
  bad += labels.length;
  if (!bad && [...portalsOf.values()].some((l) => l.length)) {
    // cặp có một chiều bấm nút (cửa gian trong ra sân — V-71): ghi "(ra bằng nút)" — vẫn là cặp đủ hai chiều
    const viaButton = (a, b) => portalsOf.get(a).some((q) => q.scene === b && q.via === 'nut');
    const tag = (a, b) => (viaButton(a, b) ? ` (${a} ra bằng nút)` : viaButton(b, a) ? ` (${b} ra bằng nút)` : '');
    const pairs = [...portalsOf].flatMap(([id, l]) => l.filter((p) => id < p.scene).map((p) => `${id} ↔ ${p.scene}${tag(id, p.scene)}`));
    console.log(`\nCổng đi bộ giữa các cảnh: ghép cặp đúng, nhãn = tên nơi đến (${pairs.length} cặp: ${pairs.join(' · ')}).`);
  }
  return bad;
}

/** Tên nơi: site.name từng đặc tả trùng `ten` của ban-do.json cùng mã; tên ngắn, chỉ chữ Việt (R-HANH-1, R-HUD-4). */
function checkMapNames() {
  const mapFile = resolve(dir, 'ban-do', 'ban-do.json');
  if (!existsSync(mapFile)) return 0;
  const places = JSON.parse(readFileSync(mapFile, 'utf8')).noi ?? [];
  const bad = checkPlaceNames(siteNames, places);
  if (bad.length) {
    console.error(`\nTên nơi (design/scene/ban-do/ban-do.json ↔ site.name): ${bad.length} lỗi:\n- ${bad.join('\n- ')}`);
    return bad.length;
  }
  console.log(`\nTên nơi: ${places.map((p) => p.ten).join(' · ')} — đặc tả cảnh và bản đồ cùng tên.`);
  return 0;
}

function sceneRel(id) {
  return `design/scene/${id === 'tong-mon' ? 'scene' : id}.json`;
}

/**
 * Đường đi NPC (R-NPC-7): dựng cảnh lấy vật cản thật (cả NPC đứng, trừ chính NPC đó), kiểm khép kín, cách vật cản
 * ≥ 0,6 m, trên nền, dốc ≤ 35° (`scene/routeCheck.ts`). In dài vòng + thời gian một vòng. Trả danh sách lỗi.
 */
function checkNpcRoutes(spec) {
  const walkers = spec.npcs.filter((p) => p.route);
  if (!walkers.length) return [];
  const colliders = new Colliders();
  const world = buildWorld(new Scene(), colliders, spec);
  const ground = (x, z) => world.surface.heightAt(x, z);
  for (const p of spec.npcs) if (!p.route) colliders.addCircle(p.x, p.z, 0.45);
  const out = [];
  for (const p of walkers) {
    const problems = checkRoute(`npcs ${p.id}.route`, p.route, colliders, ground);
    const len = routeLength(p.route, ground);
    const speed = p.speed ?? 1.1;
    const verdict = problems.length ? `${problems.length} lỗi` : 'hợp lệ (khép kín, cách vật cản ≥ 0,6 m, trên nền, dốc ≤ 35°)';
    console.log(`  đường đi ${p.id}: ${p.route.length} điểm, dài ${n(+len.toFixed(1))} m, ${n(speed)} m/s → ${Math.round(len / speed)} s / vòng — ${verdict}`);
    out.push(...problems);
  }
  return out;
}

/** In bố cục một cảnh; trả số lỗi. */
/**
 * Hái măng (R-MANG-1, V-66 B4): dựng cảnh lấy vật cản thật, tính chỗ mọc 7 ngày liền — mỗi ngày phải đủ 8 + 6 măng (vùng
 * reas đủ rộng, tránh lối / nước / vật cản). In số chỗ + một ngày mẫu.
 */
function checkMang(spec) {
  const m = spec.miniGames.find((g) => g.kind === 'hai-mang');
  if (!m) return [];
  const colliders = new Colliders();
  const world = buildWorld(new Scene(), colliders, spec);
  const ok = mangSpotOk(spec, colliders, (x, z) => world.surface.heightAt(x, z));
  const want = MANG_WAVES.reduce((a, w) => a + w.count, 0);
  const out = [];
  let sample = '';
  for (let d = 20770; d < 20777; d++) {
    const s = mangOfDay(d, m.areas, ok, m.gap ?? 3);
    if (s.length < want) out.push(`miniGames hai-mang: ngày ${d} chỉ đặt được ${s.length}/${want} măng — mở rộng areas`);
    if (!sample) sample = s.map((q) => `(${n(q.x.toFixed(1))}; ${n(q.z.toFixed(1))})${q.big ? '*' : ''}`).join(' ');
  }
  console.log(`Hái măng: ${m.areas.length} vùng, 7 ngày thử ${out.length ? 'THIẾU' : `đủ ${want} măng / ngày`}; ngày 20770: ${sample} (* = măng to)`);
  return out;
}

function checkScene(rel, raw, opt = {}) {
  const { spec, problems } = resolveSceneSpec(raw);
  problems.unshift(...(opt.extra ?? []));
  const home = opt.home ?? rel.endsWith('/scene.json');
  const drafts = new Set();
  if (thuNpc && home) {
    for (const d of DRAFT_TOWN_NPCS) {
      if (spec.npcs.some((p) => p.id === d.id)) continue;
      spec.npcs.push(d);
      drafts.add(d.id);
    }
    console.log(`Bản thử NPC (--thu-npc): ${[...drafts].join(', ') || 'đã có trong đặc tả'}`);
  }
  // nhà vào được (nội thất theo nội dung bài): vùng học nằm trong nhà, như app
  const rooms = roomKinds(spec.buildings, Object.fromEntries(ZONE_CONTENT.map((c) => [c.id, { kind: c.interior }])));
  const placed = placeZones(ZONE_CONTENT, zoneAnchors(spec.buildings, rooms));
  // bài học (快, 書) chỉ ở tông môn; cảnh vùng không có nhà học → không đòi vùng học
  if (!opt.home) portalsOf.set(home ? 'tong-mon' : rel.slice(rel.lastIndexOf('/') + 1, -'.json'.length), spec.portals);
  const all = [...problems, ...(home ? placed.problems : [])];

  console.log(`Hệ số chiều cao kiến trúc: ${n(spec.buildingStyle.heightScale)}`);
  console.log(`Kiểu nhìn: ${spec.look.style === 'mem' ? `mềm (đường màu ${spec.look.colorPipeline === 'cu' ? 'cũ' : 'chuẩn'}, wrap ${n(spec.look.wrap)}, bóng ${n(spec.look.ao)}, hoa ${n(spec.look.flowers.density)}/100 m², vignette ${n(spec.look.vignette)})` : 'cũ'}`);
  {
    const d = spec.dayNight;
    const h = (v) => `${Math.floor(v)}:${String(Math.round((v % 1) * 60)).padStart(2, '0')}`;
    const m = d.moc;
    console.log(d.enabled ? `Ngày đêm (giờ VN): bình minh ${h(m.sangTu)}–${h(m.sangDen)} · ngày → ${h(m.chieuTu)} · hoàng hôn → ${h(m.chieuDen)} · đêm; đèn bật ${h(m.denBatTu)}–${h(m.denBatDen)}, tắt ${h(m.denTatTu)}–${h(m.denTatDen)}` : 'Ngày đêm: tắt (luôn ban ngày)');
  }
  if (!spec.walls.enabled) console.log(`Không tường bao · người chơi bắt đầu (${n(spec.player.start[0])}; ${n(spec.player.start[1])})`);
  else console.log(`Tường: ±${n(spec.walls.half)} cao ${n(spec.walls.height)} dày ${n(spec.walls.thickness)} kiểu ${spec.walls.style} · người chơi bắt đầu (${n(spec.player.start[0])}; ${n(spec.player.start[1])})`);
  console.log(`Nơi: ${spec.site.name}${spec.site.areas.length ? ` · khu: ${spec.site.areas.map((a) => a.name).join(', ')}` : ''}`);
  for (const b of spec.buildings) {
    // model nhà (V-88, Q5): thiếu file → app dựng bản khối, chỉ ghi chú; `khoi-gop` = model thế để thử
    const hasModel = b.model && (b.model === 'khoi-gop' || existsSync(resolve(web, '..', 'design', 'models', `${b.model}.glb`)));
    const model = !b.model ? '' : hasModel ? ` · model ${b.model}` : ` · model ${b.model} — chưa có design/models/${b.model}.glb, app dựng bản khối`;
    console.log(`Nhà ${b.id} (${b.kind ?? 'giang-duong'}): tâm (${n(b.x)}; ${n(b.z)}) ${n(b.w)}×${n(b.d)} quay ${b.rotY ?? 0}°${model}`);
  }
  for (const z of placed.zones) console.log(`Vùng ${z.id}: tâm (${n(z.x)}; ${n(z.z)}) bán kính ${n(z.r)}${rooms[z.id] ? ` · trong nhà (${rooms[z.id]})` : ""}`);
  console.log(`Cây lẻ: ${spec.trees.yard.length} · cụm cây: ${spec.trees.groves.length} ${spec.well.enabled ? ` · giếng (${n(spec.well.x)}; ${n(spec.well.z)})` : ''}`);
  for (const s of spec.wallSegments) {
    const extra = [s.height !== undefined ? `cao ${n(s.height)}` : '', s.thickness !== undefined ? `dày ${n(s.thickness)}` : ''].filter(Boolean).join(' ');
    console.log(`Đoạn tường (${n(s.from[0])}; ${n(s.from[1])}) → (${n(s.to[0])}; ${n(s.to[1])})${extra ? ` ${extra}` : ''}`);
  }
  // cổng trên tường bao + trên đoạn tường thêm: kiểu, lối đi ở mặt đất, biển từng mặt (R-VA-1)
  const fix = (v) => n(+v.toFixed(3));
  for (const g of wallGates(spec.walls, spec.wallSegments)) {
    const where = g.axis === 'x' ? `tường z ${n(g.fixed)}, tâm x ${n(g.at)}` : `tường x ${n(g.fixed)}, tâm z ${n(g.at)}`;
    let how = '';
    if (spec.walls.style === 'voi') {
      const half = gateOpening(g);
      const shape = g.kind === 'lau' ? `cổng ${g.roof === false ? 'khung gỗ (bỏ mái ngói)' : 'mái ngói'}, lối cao ${fix(lauClearHeight(g.height, g.clear))} m, đỉnh trụ ${fix(lauTop(g.height, lauClearHeight(g.height, g.clear)))} m` : `cổng trăng đỉnh ${fix(1.6 * moonRadius(g.width, g.height))} m`;
      how = ` · ${shape}, lối đi ${fix(2 * half)} m (${g.axis} ${fix(g.at - half)} … ${fix(g.at + half)})`;
    }
    const signs = Object.entries(g.signs).filter(([, v]) => v).map(([k, v]) => `${k} ${v}`).join(' · ');
    console.log(`Cổng ${where}, rộng ${n(g.width)}${how}${signs ? ` · biển: ${signs}` : ''}`);
  }
  for (const g of spec.gates) console.log(`Cổng ${g.id}: tâm (${n(g.x)}; ${n(g.z)}) rộng ${n(g.width)} quay ${g.rotY ?? 0}°`);
  for (const w of spec.water) console.log(`Ao (${n(w.x)}; ${n(w.z)}) ${w.r !== undefined ? `tròn r ${n(w.r)}` : `${n(w.w)}×${n(w.d)}`}`);
  const kinds = {};
  for (const p of spec.props) kinds[p.kind] = (kinds[p.kind] ?? 0) + 1;
  if (spec.props.length) console.log(`Vật trang trí: ${Object.entries(kinds).map(([k, c]) => `${k} ×${c}`).join(' · ')}`);
  // NPC (R-NPC-1): mã phải có model design/models/<mã>.glb
  for (const p of spec.npcs) {
    const has = existsSync(resolve(web, '..', 'design', 'models', `${p.id}.glb`));
    // NPC trò chơi (văn nhân, Trúc Ông — V-66 B4): thiếu model → app thế bằng khối (R-NPC-1), chỉ ghi chú, không lỗi
    if (!has && GAME_NPCS.has(p.id)) console.log(`NPC "${p.id}": chưa có design/models/${p.id}.glb — app dựng thế bằng khối (R-NPC-1); bản đẹp qua /tai-nguyen`);
    else if (!has && !drafts.has(p.id)) all.push(`npcs: thiếu design/models/${p.id}.glb — app bỏ NPC "${p.id}"`);
    const pose = p.pose === 'ngoi' ? ' · ngồi' : '';
    const size = p.scale !== undefined && p.scale !== 1 ? ` · cỡ ${n(p.scale)}` : '';
    const miss = drafts.has(p.id) ? ' — chưa có model (bản thử)' : ' — THIẾU MODEL';
    console.log(`NPC ${p.id}: (${n(p.x)}; ${n(p.z)}) nhìn ${n(p.rotY ?? 0)}°${pose}${size}${has ? '' : miss}`);
  }
  all.push(...checkNpcRoutes(spec));
  all.push(...checkMang(spec));
  // bàn chơi khu giao lưu (R-GIAO-1): NPC bàn cũng cần model
  for (const t of spec.gameTables) {
    const has = existsSync(resolve(web, '..', 'design', 'models', `${t.npc}.glb`));
    if (!has) all.push(`gameTables: thiếu design/models/${t.npc}.glb — bàn "${t.id}" không có NPC`);
    console.log(`Bàn chơi ${t.id} (${t.kind}): tâm (${n(t.x)}; ${n(t.z)}) quay ${t.rotY ?? 0}° · NPC ${t.npc}${has ? '' : ' — THIẾU MODEL'}`);
  }
  // vùng đặt đồ trang trí tự do (R-NHA-7) — lỗi đã kiểm trong resolveSceneSpec (scene/decorArea.ts)
  const da = spec.decorArea;
  if (da) {
    console.log(`Vùng trang trí (${da.where}): ${da.bounds.length} đỉnh · trần ${n(da.maxItems)} món · dốc ≤ ${n(da.maxSlope)} m`);
    for (const k of da.keepOut) console.log(`  cấm "${k.label}": (${n(k.from[0])}; ${n(k.from[1])}) … (${n(k.to[0])}; ${n(k.to[1])})`);
  }
  // vườn rau (R-VUON-1) — lỗi đã kiểm trong resolveSceneSpec (scene/vuonLayout.ts)
  const g = spec.garden;
  if (g.enabled) {
    const [fa, fb] = [g.fence.from, g.fence.to];
    console.log(`Vườn rau: rào (${n(fa[0])}; ${n(fa[1])}) … (${n(fb[0])}; ${n(fb[1])}) cao ${n(g.fence.height)}, khe cổng cạnh tây z ${n(g.fence.gate)} rộng ${n(g.fence.gateWidth)} · thùng thu mua (${n(g.bin.x)}; ${n(g.bin.z)})`);
    console.log(`  luống ${n(g.size)} × ${n(g.size)} m: ${g.plots.map((p) => `${p.id} (${n(p.x)}; ${n(p.z)})`).join(' · ')}`);
  }
  if (spec.paths.length) console.log(`Lối lát đá: ${spec.paths.length}`);
  const t = spec.terrain;
  if (t.enabled) {
    console.log(
      `Địa hình: ${n(t.size)} m, ô ${n(t.cell)} m (${Math.round(t.size / t.cell) ** 2 * 2} tam giác) · ${t.plateaus.length} bục · ` +
        `${t.peaks.length} đỉnh (cao nhất ${n(Math.max(0, ...t.peaks.map((p) => p.h)))} m) · mép vực bán kính ${n(t.edge.radius)}`,
    );
  }
  if (t.enabled && t.stairs.length) console.log(`Bậc đá: ${t.stairs.map((s) => `(${n(s.from[0])}; ${n(s.from[1])}) → (${n(s.to[0])}; ${n(s.to[1])}) rộng ${n(s.width)}`).join(' · ')}`);
  if (t.enabled && (t.grass.density || t.rocks.density)) console.log(`Cỏ búi: ${n(t.grass.density)} / 100 m² · đá rải: ${n(t.rocks.density)} / 1000 m²`);
  if (spec.farMountains.layers.length) console.log(`Núi xa: ${spec.farMountains.layers.length} lớp`);
  if (spec.cloudSea.radius > 0) console.log(`Biển mây: y ${n(spec.cloudSea.y)}, bán kính ${n(spec.cloudSea.radius)}`);

  if (spec.lessons.radicals) {
    // dữ liệu từ vựng kiểm ở `npm run tu:check` (R-TU-4)
    const lao = spec.npcs.find((q) => q.id === 'truc-lao');
    if (!lao) all.push('lessons.radicals bật nhưng thiếu NPC "truc-lao" — vùng có bài học từ vựng học qua thầy Trúc Lão (R-HANH-8)');
    console.log(`Học từ vựng: nói chuyện Trúc Lão${lao ? ` (${n(lao.x)}; ${n(lao.z)})` : ''} → "Học bài mới" mở bài chưa học đầu tiên (${BAI_HOC.length} bài — R-HANH-3, R-HANH-8)`);
  }
  const tp = spec.teleport;
  if (tp.enabled) {
    const where = tp.radius > 0 ? `sân ∅ ${n(tp.radius * 2)}, ` : '';
    console.log(`Vòng trận: tâm (${n(tp.center[0])}; ${n(tp.center[1])}) · ${where}vòng bán kính ${n(tp.ringRadius)} (bước vào khi cách tâm < ${n(+ringTrigger(tp).toFixed(2))} m)`);
    if (tp.dais.tiers > 0) {
      const L = daisLayout(tp);
      console.log(`  đài ${tp.dais.tiers} tầng cao ${n(L.height)} m, chân ∅ ${n(+(L.footprint * 2).toFixed(1))} (kể bậc) · ${tp.dais.pillars} trụ phù văn`);
    }
    if (home) {
      const a = arrivalSpot(tp).at;
      console.log(`  về tông môn đứng ở (${n(+a[0].toFixed(2))}; ${n(+a[1].toFixed(2))})`);
    }
  } else console.log('Vòng trận: không có — tới cảnh này bằng bản đồ truyền tống ở nơi khác (R-HANH-2)');
  const yard = spec.stoneYard;
  if (yard.enabled) console.log(`Sân đá trống (bãi hạc đáp, V-65): tâm (${n(yard.center[0])}; ${n(yard.center[1])}) · ∅ ${n(yard.radius * 2)}`);
  // tới bằng bản đồ truyền tống: đứng ở chỗ xuất phát, hạc đáp bên phải (R-HANH-5)
  const pad = landingPad(spec.player.start, START_HEADING, spec.crane.padOffset);
  console.log(`Chỗ xuất phát (${n(spec.player.start[0])}; ${n(spec.player.start[1])}) · hạc đáp (${n(+pad[0].toFixed(2))}; ${n(+pad[1].toFixed(2))})`);
  // cổng đi bộ (R-HANH-4): vùng chạm, cảnh đích, chỗ đứng khi tới từ cảnh đó
  for (const p of spec.portals) {
    const [a, b] = [p.area.from, p.area.to];
    const kind = p.via === 'nut' ? `Cổng bấm nút "${p.label}"` : 'Cổng đi bộ'; // V-71: đứng trong vùng → nút nổi
    console.log(`${kind} → ${p.scene}: vùng ${p.via === 'nut' ? 'hiện nút' : 'chạm'} (${n(a[0])}; ${n(a[1])}) … (${n(b[0])}; ${n(b[1])}) · từ ${p.scene} tới đứng ở (${n(p.arrive.at[0])}; ${n(p.arrive.at[1])}) nhìn ${n(p.arrive.rotY)}°`);
  }
  if (all.length) {
    console.error(`${rel}: ${all.length} lỗi:\n- ${all.join('\n- ')}`);
    return all.length;
  }
  console.log('Không có lỗi.');
  return 0;
}
