// Chuẩn bị model thực vật từ gói low-poly CC0 (Tiny Treats, KayKit — texture "dải màu" dùng chung) cho cảnh mềm:
//   cd web && npm run model:thuc-vat -- <file.gltf|glb> --ra <file.glb> [--ti-le 0.35] [--sai-so 0.02]
// Làm: đọc texture dải màu → ghi vào màu đỉnh COLOR_0 (tuyến tính), bỏ UV / texture / vật liệu thừa, hàn đỉnh, giảm tam
// giác theo tỉ lệ (`--ti-le`, mặc định 0,35), nén meshopt. Cảnh tô lại màu theo độ cao lúc dựng (`scene/luongChe.ts`) —
// màu đỉnh ở đây chỉ giữ phần sáng / tối của gói. Ngân sách thực vật: ≤ 300 tam giác, ≤ 50 KB, 0 texture.
// Chạy offline (gói npm đã ghim: @gltf-transform, meshoptimizer, sharp). File gói tải về là dữ liệu — script không chạy gì trong gói.
import { mkdirSync, statSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, simplify, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const BUDGET = { tris: 300, kb: 50 };
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const input = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const outArg = opt('ra');
const ratio = Number(opt('ti-le', '0.35'));
/** sai số hình cho phép khi giảm (tỉ lệ cỡ model) — tăng thì giảm được sâu hơn, mặt kém tròn hơn */
const error = Number(opt('sai-so', '0.02'));
if (!input || !outArg || !(ratio > 0 && ratio <= 1)) {
  console.error('Cách dùng: npm run model:thuc-vat -- <file.gltf|glb> --ra <file.glb> [--ti-le 0.35] [--sai-so 0.02]');
  process.exit(1);
}
const out = resolve(outArg);

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

const triangles = (doc) =>
  doc
    .getRoot()
    .listMeshes()
    .flatMap((m) => m.listPrimitives())
    .reduce((n, p) => n + Math.floor((p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3), 0);
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

const doc = await io.read(resolve(input));
console.log(`Vào: ${basename(input)} · ${triangles(doc)} tam giác · ${doc.getRoot().listTextures().length} texture`);

// texture dải màu → màu đỉnh (lấy mẫu điểm gần nhất, UV lặp)
const decoded = new Map();
for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const tex = prim.getMaterial()?.getBaseColorTexture();
    const uv = prim.getAttribute('TEXCOORD_0');
    if (!tex || !uv) continue;
    if (!decoded.has(tex)) decoded.set(tex, await sharp(Buffer.from(tex.getImage())).ensureAlpha().raw().toBuffer({ resolveWithObject: true }));
    const { data, info } = decoded.get(tex);
    const n = uv.getCount();
    const col = new Float32Array(n * 3);
    const t = [0, 0];
    for (let i = 0; i < n; i++) {
      uv.getElement(i, t);
      const u = ((t[0] % 1) + 1) % 1;
      const v = ((t[1] % 1) + 1) % 1;
      const px = Math.min(info.width - 1, Math.floor(u * info.width));
      const py = Math.min(info.height - 1, Math.floor(v * info.height));
      const k = (py * info.width + px) * info.channels;
      for (let c = 0; c < 3; c++) col[i * 3 + c] = toLinear(data[k + c] / 255);
    }
    prim.setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(col).setBuffer(uv.getBuffer()));
    prim.setAttribute('TEXCOORD_0', null);
    const mat = prim.getMaterial();
    mat.setBaseColorTexture(null).setBaseColorFactor([1, 1, 1, 1]).setMetallicFactor(0).setRoughnessFactor(1);
    for (const ext of mat.listExtensions()) mat.setExtension(ext.extensionName, null);
  }
}
for (const t of doc.getRoot().listTextures()) t.dispose();

await doc.transform(dedup(), weld());
// mặt đáy (úp xuống, sát chân) nằm trên đất — không ai thấy, bỏ cho đỡ tam giác
let dropped = 0;
for (const prim of doc.getRoot().listMeshes().flatMap((m) => m.listPrimitives())) {
  const pos = prim.getAttribute('POSITION');
  const idx = prim.getIndices();
  if (!pos || !idx) continue;
  const minY = pos.getMin([])[1];
  const maxY = pos.getMax([])[1];
  const low = minY + (maxY - minY) * 0.08;
  const keep = [];
  const v = [[], [], []];
  for (let t = 0; t < idx.getCount(); t += 3) {
    const ids = [idx.getScalar(t), idx.getScalar(t + 1), idx.getScalar(t + 2)];
    ids.forEach((id, k) => pos.getElement(id, v[k]));
    const ax = v[1][0] - v[0][0], ay = v[1][1] - v[0][1], az = v[1][2] - v[0][2];
    const bx = v[2][0] - v[0][0], by = v[2][1] - v[0][1], bz = v[2][2] - v[0][2];
    const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
    const down = ny / (Math.hypot(nx, ny, nz) || 1) < -0.5 && v.every((p) => p[1] < low);
    if (down) dropped++;
    else keep.push(...ids);
  }
  idx.setArray(new Uint32Array(keep));
}
console.log(`Bỏ ${dropped} tam giác mặt đáy`);
await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio, error }));
await doc.transform(prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
mkdirSync(dirname(out), { recursive: true });
await io.write(out, doc);
const tris = triangles(doc);
const kb = statSync(out).size / 1024;
console.log(`Ra:  ${out} · ${tris} tam giác · ${kb.toFixed(1)} KB · 0 texture`);
if (tris > BUDGET.tris || kb > BUDGET.kb) {
  console.log(`VƯỢT NGÂN SÁCH thực vật (≤ ${BUDGET.tris} tam giác, ≤ ${BUDGET.kb} KB) — giảm --ti-le`);
  process.exitCode = 2;
}
console.log('Nhớ: ghi nguồn + giấy phép vào design/models/LICENSES.md, chép License.txt của gói vào cùng thư mục.');
