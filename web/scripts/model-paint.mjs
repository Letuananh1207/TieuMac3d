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
import { meshopt, unweld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : d);
const [input, atlasPath] = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
if (!input || !atlasPath) {
  console.error('Cách dùng: npm run model:paint -- <model.glb> <atlas.png> [--ra <file.glb>]');
  process.exit(1);
}
const out = resolve(opt('ra', input));
const MARGIN = 0.012; // lấy mẫu lùi vào trong một chút: mép model không ăn nền / nét viền

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(resolve(input));
await doc.transform(unweld());

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
