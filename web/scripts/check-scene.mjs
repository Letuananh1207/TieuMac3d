// Kiểm đặc tả cảnh design/scene/scene.json bằng đúng code của app (scene/spec.ts + zones/zones.ts).
// In lỗi, vùng sự kiện và bố cục; có lỗi → thoát 1 (chặn `npm run build` của app).
// Dùng: cd web && npm run scene:check   (xem decisions/0002-thiet-ke-3d.md)
import { build } from 'esbuild';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = resolve(web, '..', 'design', 'scene', 'scene.json');

const out = await build({
  stdin: {
    contents:
      "export { roomKinds, zoneAnchors } from './src/scene/spec.ts';\n" +
      "export { resolveSceneSpec } from './src/scene/specCheck.ts';\n" +
      "export { placeZones, ZONE_CONTENT } from './src/zones/zones.ts';\n",
    resolveDir: web,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'error',
});
const { resolveSceneSpec, roomKinds, zoneAnchors, placeZones, ZONE_CONTENT } = await import(
  `data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`
);

let raw;
const rel = 'design/scene/scene.json';
if (existsSync(file)) {
  try {
    raw = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`${rel}: không đọc được JSON — ${e.message}`);
    process.exit(1);
  }
  console.log(`Đặc tả: ${rel}`);
} else {
  console.log(`Chưa có ${rel} — dùng cảnh mặc định trong code.`);
}

const { spec, problems } = resolveSceneSpec(raw);
// nhà vào được (nội thất theo nội dung bài): vùng học nằm trong nhà, như app
const rooms = roomKinds(spec.buildings, Object.fromEntries(ZONE_CONTENT.map((c) => [c.id, { kind: c.interior }])));
const placed = placeZones(ZONE_CONTENT, zoneAnchors(spec.buildings, rooms));
const all = [...problems, ...placed.problems];

const n = (v) => String(v).replace('.', ',');
console.log(`Tường: ±${n(spec.walls.half)} kiểu ${spec.walls.style} · người chơi bắt đầu (${n(spec.player.start[0])}; ${n(spec.player.start[1])})`);
console.log(`Nơi: ${spec.site.name}${spec.site.areas.length ? ` · khu: ${spec.site.areas.map((a) => a.name).join(', ')}` : ''}`);
for (const b of spec.buildings) {
  console.log(`Nhà ${b.id} (${b.kind ?? 'giang-duong'}): tâm (${n(b.x)}; ${n(b.z)}) ${n(b.w)}×${n(b.d)} quay ${b.rotY ?? 0}°`);
}
for (const z of placed.zones) console.log(`Vùng ${z.id}: tâm (${n(z.x)}; ${n(z.z)}) bán kính ${n(z.r)}${rooms[z.id] ? ` · trong nhà (${rooms[z.id]})` : ""}`);
console.log(`Cây lẻ: ${spec.trees.yard.length} · cụm cây: ${spec.trees.groves.length} · giếng (${n(spec.well.x)}; ${n(spec.well.z)})`);
for (const g of spec.walls.gates) console.log(`Khe cổng tường ${g.side}: tâm ${n(g.at)}, rộng ${n(g.width)}`);
for (const s of spec.wallSegments) console.log(`Đoạn tường (${n(s.from[0])}; ${n(s.from[1])}) → (${n(s.to[0])}; ${n(s.to[1])})`);
for (const g of spec.gates) console.log(`Cổng ${g.id}: tâm (${n(g.x)}; ${n(g.z)}) rộng ${n(g.width)} quay ${g.rotY ?? 0}°`);
for (const w of spec.water) console.log(`Ao (${n(w.x)}; ${n(w.z)}) ${w.r !== undefined ? `tròn r ${n(w.r)}` : `${n(w.w)}×${n(w.d)}`}`);
const kinds = {};
for (const p of spec.props) kinds[p.kind] = (kinds[p.kind] ?? 0) + 1;
if (spec.props.length) console.log(`Vật trang trí: ${Object.entries(kinds).map(([k, c]) => `${k} ×${c}`).join(' · ')}`);
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

if (all.length) {
  console.error(`\n${all.length} lỗi:\n- ${all.join('\n- ')}`);
  process.exit(1);
}
console.log('Không có lỗi.');
