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
      "export { resolveSceneSpec, zoneAnchors } from './src/scene/spec.ts';\n" +
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
const { resolveSceneSpec, zoneAnchors, placeZones, ZONE_CONTENT } = await import(
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
const placed = placeZones(ZONE_CONTENT, zoneAnchors(spec.buildings));
const all = [...problems, ...placed.problems];

const n = (v) => String(v).replace('.', ',');
console.log(`Tường: ±${n(spec.walls.half)} · người chơi bắt đầu (${n(spec.player.start[0])}; ${n(spec.player.start[1])})`);
for (const b of spec.buildings) {
  console.log(`Nhà ${b.id}: tâm (${n(b.x)}; ${n(b.z)}) ${n(b.w)}×${n(b.d)} quay ${b.rotY ?? 0}°`);
}
for (const z of placed.zones) console.log(`Vùng ${z.id}: tâm (${n(z.x)}; ${n(z.z)}) bán kính ${n(z.r)}`);
console.log(`Cây trong sân: ${spec.trees.yard.length} · giếng (${n(spec.well.x)}; ${n(spec.well.z)})`);

if (all.length) {
  console.error(`\n${all.length} lỗi:\n- ${all.join('\n- ')}`);
  process.exit(1);
}
console.log('Không có lỗi.');
