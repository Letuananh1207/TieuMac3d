// Tô màu model Hunyuan (không có texture) bằng cách CHIẾU ảnh đầu vào từ phía trước — thay bước tô màu cần MSVC.
//   cd web && npm run model:paint -- <model.glb> <atlas.png> [--ra <file.glb>]
// atlas.png = 2 nửa: trái ảnh nhìn trước (cắt sát nhân vật), phải mặt sau (tạo bằng .claude/skills/tai-nguyen/scripts/atlas.py).
// Mỗi tam giác: pháp tuyến hướng +z (trước) → nửa trái, hướng −z → nửa phải; UV = vị trí (x, y) chuẩn hoá theo khung
// bao model. Tách đỉnh (unweld) để tam giác hai nửa không kéo UV qua giữa. Vật liệu không kim loại, nhám tối đa.
// Kết quả nén meshopt như model:clean. Hướng trước của model Hunyuan: +z (như ảnh nhìn chính diện).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt, normals, unweld, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : d);
const [input, atlasPath] = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
if (!input || !atlasPath) {
  console.error('Cách dùng: npm run model:paint -- <model.glb> <atlas.png> [--ra <file.glb>]');
  process.exit(1);
}
const out = resolve(opt('ra', input));
const MARGIN = 0.03; // lấy mẫu lùi vào trong một chút: mép model không ăn nền / nét viền

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(resolve(input));
// pháp tuyến mịn tính trên lưới còn hàn đỉnh (L-2): tách đỉnh rồi mới tính → mỗi tam giác sáng một kiểu, mặt loang lổ
await doc.transform(weld(), normals({ overwrite: true }), unweld());

const root = doc.getRoot();
const tex = doc.createTexture('chieu-truoc').setImage(readFileSync(resolve(atlasPath))).setMimeType('image/png');
const mat = doc.createMaterial('to-mau').setBaseColorTexture(tex).setMetallicFactor(0).setRoughnessFactor(1);

// khung bao chung của mọi lưới (x, y)
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
for (const mesh of root.listMeshes())
  for (const p of mesh.listPrimitives()) {
    const pos = p.getAttribute('POSITION');
    for (let i = 0; i < pos.getCount(); i++) {
      const [x, y] = pos.getElement(i, []);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
const W = maxX - minX, H = maxY - minY;

// --4goc: atlas 2 × 2 (trước | trái / sau | phải — .claude/skills/tai-nguyen/scripts/atlas4.py) từ bộ ảnh đã chuẩn hoá:
// đỉnh 10 %, đế 90 %, trục thân (tâm ủng) giữa ảnh, chiếu thẳng cùng tỉ lệ. Mỗi tam giác lấy ảnh của phía nó quay về.
// Model: mặt trước +z, bên trái nhân vật +x (ảnh "trái" chụp từ +x: mặt quay sang trái ảnh).
if (args.includes('--4goc')) {
  let minZ = Infinity, maxZ = -Infinity, fx = 0, fz = 0, fn = 0;
  const all = [];
  for (const mesh of root.listMeshes())
    for (const p of mesh.listPrimitives()) {
      const pos = p.getAttribute('POSITION');
      for (let i = 0; i < pos.getCount(); i++) all.push(pos.getElement(i, []));
    }
  for (const [, y, z] of all) { minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); }
  for (const [x, y, z] of all) if (y < minY + 0.08 * H) { fx += x; fz += z; fn++; } // tâm ủng = trục thân
  fx /= fn || 1; fz /= fn || 1;
  const s = 0.8 / H; // ảnh: thân cao 80 % khung
  const count = { truoc: 0, trai: 0, sau: 0, phai: 0 };
  const clamp = (v) => Math.min(0.998, Math.max(0.002, v));
  for (const mesh of root.listMeshes())
    for (const p of mesh.listPrimitives()) {
      const pos = p.getAttribute('POSITION');
      const n = pos.getCount();
      const uv = new Float32Array(n * 2);
      const a = [], b = [], c = [];
      for (let t = 0; t + 2 < n; t += 3) {
        pos.getElement(t, a); pos.getElement(t + 1, b); pos.getElement(t + 2, c);
        const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
        const nx = e1[1] * e2[2] - e1[2] * e2[1];
        const nz = e1[0] * e2[1] - e1[1] * e2[0];
        const pick = [['truoc', nz], ['sau', -nz], ['trai', nx], ['phai', -nx]].sort((m, k) => k[1] - m[1])[0][0];
        count[pick]++;
        const [qx, qy] = { truoc: [0, 0], trai: [0.5, 0], sau: [0, 0.5], phai: [0.5, 0.5] }[pick];
        for (const [k, v] of [[t, a], [t + 1, b], [t + 2, c]]) {
          const ui = { truoc: 0.5 + (v[0] - fx) * s, sau: 0.5 - (v[0] - fx) * s, trai: 0.5 - (v[2] - fz) * s, phai: 0.5 + (v[2] - fz) * s }[pick];
          const vi = 0.1 + (0.8 * (maxY - v[1])) / H;
          uv[k * 2] = qx + clamp(ui) * 0.5;
          uv[k * 2 + 1] = qy + clamp(vi) * 0.5;
        }
      }
      p.setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(uv).setBuffer(root.listBuffers()[0]));
      p.setMaterial(mat);
    }
  await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  await io.write(out, doc);
  console.log(`model:paint --4goc: ${JSON.stringify(count)} → ${out}`);
  process.exit(0);
}

let front = 0, back = 0;
for (const mesh of root.listMeshes())
  for (const p of mesh.listPrimitives()) {
    const pos = p.getAttribute('POSITION');
    const n = pos.getCount();
    const uv = new Float32Array(n * 2);
    const a = [], b = [], c = [];
    for (let t = 0; t + 2 < n; t += 3) {
      pos.getElement(t, a); pos.getElement(t + 1, b); pos.getElement(t + 2, c);
      // pháp tuyến mặt (thành phần z): (b−a) × (c−a)
      const nz = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      const isBack = nz < 0;
      isBack ? back++ : front++;
      for (const [k, v] of [[t, a], [t + 1, b], [t + 2, c]]) {
        const u = MARGIN + (1 - 2 * MARGIN) * ((v[0] - minX) / W);
        const w = MARGIN + (1 - 2 * MARGIN) * ((maxY - v[1]) / H);
        uv[k * 2] = isBack ? 0.5 + u * 0.5 : u * 0.5;
        uv[k * 2 + 1] = w;
      }
    }
    p.setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(uv).setBuffer(root.listBuffers()[0]));
    p.setMaterial(mat);
  }
await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
await io.write(out, doc);
console.log(`model:paint: ${front} tam giác trước, ${back} sau → ${out}`);
