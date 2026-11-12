// Làm sạch model AI (.glb từ Hunyuan3D…) cho app — thay bước Blender "giảm tam giác + nén" trong docs/ai3d.md.
//   cd web && npm run model:clean -- <file.glb> [--loai nhan-vat|cong-trinh] [--ten <tên>] [--ra <file.glb>]
// Mặc định: --loai nhan-vat, --ten = loại → ghi design/models/<tên>.glb (nhân vật chính phải tên nhan-vat.glb).
// Làm: gộp dữ liệu trùng, hàn đỉnh, giảm tam giác về ngân sách (quyết định 0003: nhân vật ≤ 10 000, công trình
// ≤ 20 000) bằng meshoptimizer, bỏ phần thừa, nén meshopt (app giải nén bằng MeshoptDecoder có sẵn trong three).
// In số tam giác / dung lượng / texture trước – sau và báo vượt ngân sách. Chạy offline (gói npm đã ghim).
import { mkdirSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ImageUtils, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, simplify, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');
const BUDGET = {
  'nhan-vat': { tris: 16_000, mb: 1.5, mats: 1 }, // nâng 2026-11-12 (quyết định 0003) để mặt mịn
  'cong-trinh': { tris: 20_000, mb: 3, mats: 2 },
};
const MAX_TEX = 1024;

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const input = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const loai = opt('loai', 'nhan-vat');
if (!input || !BUDGET[loai]) {
  console.error('Cách dùng: npm run model:clean -- <file.glb> [--loai nhan-vat|cong-trinh] [--ten <tên>] [--ra <file.glb>]');
  process.exit(1);
}
const budget = BUDGET[loai];
const out = resolve(opt('ra', join(WEB, '../design/models', `${opt('ten', loai)}.glb`)));

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

/** Số tam giác (primitive kiểu TRIANGLES). */
function triangles(doc) {
  let n = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const p of mesh.listPrimitives()) {
      if (p.getMode() !== 4) continue;
      const idx = p.getIndices();
      n += Math.floor((idx ? idx.getCount() : (p.getAttribute('POSITION')?.getCount() ?? 0)) / 3);
    }
  }
  return n;
}
const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;
const report = (doc) => {
  const root = doc.getRoot();
  const tex = root.listTextures().map((t) => {
    const size = ImageUtils.getSize(t.getImage(), t.getMimeType());
    return size ? `${size[0]}×${size[1]}` : '?';
  });
  return {
    tris: triangles(doc),
    mats: root.listMaterials().length,
    tex,
    anims: root.listAnimations().map((a) => a.getName() || '(không tên)'),
    skins: root.listSkins().length,
  };
};

const doc = await io.read(resolve(input));
const before = report(doc);
console.log(`Vào: ${basename(input)} · ${kb(statSync(input).size)} · ${before.tris.toLocaleString('vi')} tam giác · ` +
  `${before.mats} vật liệu · texture [${before.tex.join(', ') || 'không'}] · xương ${before.skins} · clip [${before.anims.join(', ') || 'không'}]`);

await doc.transform(dedup(), weld());
// giảm dần: tỉ lệ theo ngân sách, nới sai số tới khi đạt (mô hình AI lưới dày → thường đạt ở lượt đầu)
for (const error of [0.001, 0.005, 0.01, 0.02, 0.05]) {
  const tris = triangles(doc);
  if (tris <= budget.tris) break;
  await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: (budget.tris * 0.95) / tris, error }));
}
await doc.transform(prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));

mkdirSync(dirname(out), { recursive: true });
await io.write(out, doc);
const after = report(doc);
const mb = statSync(out).size / 1024 / 1024;
console.log(`Ra:  ${out} · ${kb(statSync(out).size)} · ${after.tris.toLocaleString('vi')} tam giác`);

const warn = [];
if (after.tris > budget.tris) warn.push(`tam giác ${after.tris} > ${budget.tris} (lưới khó giảm — thử ảnh / seed khác)`);
if (mb > budget.mb) warn.push(`dung lượng ${mb.toFixed(2)} MB > ${budget.mb} MB (thường do texture lớn)`);
if (after.mats > budget.mats) warn.push(`${after.mats} vật liệu > ${budget.mats} (gộp texture trong Blender)`);
const bigTex = after.tex.filter((s) => s.split('×').some((v) => Number(v) > MAX_TEX));
if (bigTex.length) warn.push(`texture ${bigTex.join(', ')} > ${MAX_TEX}² (thu nhỏ ảnh texture)`);
if (loai === 'nhan-vat' && !after.anims.some((a) => /idle|walk/i.test(a))) {
  console.log('Ghi chú: không có clip idle / walk → app cho nhân vật nhún khi đi (gắn xương: Mixamo / Rigify — docs/ai3d.md).');
}
if (warn.length) {
  console.log(`VƯỢT NGÂN SÁCH (quyết định 0003):\n  - ${warn.join('\n  - ')}`);
  process.exitCode = 2;
} else {
  console.log('Trong ngân sách.');
}
console.log('Nhớ: thêm một dòng vào design/models/LICENSES.md (công cụ + phiên bản, ảnh đầu vào, ngày, giấy phép).');
