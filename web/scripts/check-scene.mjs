// Kiểm mọi đặc tả cảnh design/scene/*.json (scene.json = tông môn, <mã vùng>.json = vùng) bằng đúng code của app (scene/spec.ts + zones/zones.ts).
// In lỗi, vùng sự kiện và bố cục; có lỗi → thoát 1 (chặn `npm run build` của app).
// Dùng: cd web && npm run scene:check   (xem decisions/0002-thiet-ke-3d.md)
import { build } from 'esbuild';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = resolve(web, '..', 'design', 'scene');

const out = await build({
  stdin: {
    contents:
      "export { roomKinds, zoneAnchors } from './src/scene/spec.ts';\n" +
      "export { resolveSceneSpec } from './src/scene/specCheck.ts';\n" +
      "export { placeZones, ZONE_CONTENT } from './src/zones/zones.ts';\n" +
      "export { moonRadius, gateOpening, lauClearHeight } from './src/scene/kien_truc/tuong.ts';\n" +
      "export { wallGates } from './src/scene/walls.ts';\n" +
      "export { ringTrigger, arrivalSpot, daisLayout } from './src/scene/teleportLayout.ts';\n" +
      "export { RADICALS, checkRadicals } from './src/zones/radicals.ts';\n",
    resolveDir: web,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'error',
});
const { resolveSceneSpec, roomKinds, zoneAnchors, placeZones, ZONE_CONTENT, moonRadius, gateOpening, lauClearHeight, wallGates, ringTrigger, arrivalSpot, daisLayout, RADICALS, checkRadicals } = await import(
  `data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`
);

const n = (v) => String(v).replace('.', ',');
const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort((a, b) => (a === 'scene.json' ? -1 : b === 'scene.json' ? 1 : a.localeCompare(b))) : [];
if (!files.includes('scene.json')) files.unshift('');
let errors = 0;
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
}
if (errors) process.exit(1);

/** In bố cục một cảnh; trả số lỗi. */
function checkScene(rel, raw) {
  const { spec, problems } = resolveSceneSpec(raw);
  // nhà vào được (nội thất theo nội dung bài): vùng học nằm trong nhà, như app
  const rooms = roomKinds(spec.buildings, Object.fromEntries(ZONE_CONTENT.map((c) => [c.id, { kind: c.interior }])));
  const placed = placeZones(ZONE_CONTENT, zoneAnchors(spec.buildings, rooms));
  // bài học (快, 書) chỉ ở tông môn; cảnh vùng không có nhà học → không đòi vùng học
  const home = rel.endsWith('/scene.json');
  const all = [...problems, ...(home ? placed.problems : [])];

  console.log(`Hệ số chiều cao kiến trúc: ${n(spec.buildingStyle.heightScale)}`);
  if (!spec.walls.enabled) console.log(`Không tường bao · người chơi bắt đầu (${n(spec.player.start[0])}; ${n(spec.player.start[1])})`);
  else console.log(`Tường: ±${n(spec.walls.half)} cao ${n(spec.walls.height)} dày ${n(spec.walls.thickness)} kiểu ${spec.walls.style} · người chơi bắt đầu (${n(spec.player.start[0])}; ${n(spec.player.start[1])})`);
  console.log(`Nơi: ${spec.site.name}${spec.site.areas.length ? ` · khu: ${spec.site.areas.map((a) => a.name).join(', ')}` : ''}`);
  for (const b of spec.buildings) {
    console.log(`Nhà ${b.id} (${b.kind ?? 'giang-duong'}): tâm (${n(b.x)}; ${n(b.z)}) ${n(b.w)}×${n(b.d)} quay ${b.rotY ?? 0}°`);
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
      const shape = g.kind === 'lau' ? `cổng mái ngói, lối cao ${fix(lauClearHeight(g.height))} m` : `cổng trăng đỉnh ${fix(1.6 * moonRadius(g.width, g.height))} m`;
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
    if (!has) all.push(`npcs: thiếu design/models/${p.id}.glb — app bỏ NPC "${p.id}"`);
    console.log(`NPC ${p.id}: (${n(p.x)}; ${n(p.z)}) nhìn ${n(p.rotY ?? 0)}°${has ? '' : ' — THIẾU MODEL'}`);
  }
  // bàn chơi khu giao lưu (R-GIAO-1): NPC bàn cũng cần model
  for (const t of spec.gameTables) {
    const has = existsSync(resolve(web, '..', 'design', 'models', `${t.npc}.glb`));
    if (!has) all.push(`gameTables: thiếu design/models/${t.npc}.glb — bàn "${t.id}" không có NPC`);
    console.log(`Bàn chơi ${t.id} (${t.kind}): tâm (${n(t.x)}; ${n(t.z)}) quay ${t.rotY ?? 0}° · NPC ${t.npc}${has ? '' : ' — THIẾU MODEL'}`);
  }
  // ô trang trí nhà của ta (R-NHA-2) — lỗi đã kiểm trong resolveSceneSpec (scene/decorSlots.ts)
  for (const t of spec.decorSlots) console.log(`Ô trang trí ${t.id} (${t.kind}): tâm (${n(t.x)}; ${n(t.z)}) quay ${t.rotY ?? 0}°`);
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
    all.push(...checkRadicals(RADICALS));
    console.log(`Tu luyện bộ thủ: Ngồi ôn ≥ 1 giây → cuộn sách, "Học bộ mới" mở bộ chưa học đầu tiên (${RADICALS.length} bộ — R-HANH-3, R-ON-8)`);
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
  }
  if (all.length) {
    console.error(`${rel}: ${all.length} lỗi:\n- ${all.join('\n- ')}`);
    return all.length;
  }
  console.log('Không có lỗi.');
  return 0;
}
