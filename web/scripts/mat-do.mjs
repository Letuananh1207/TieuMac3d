// Dò mắt trên model nhân vật xương Mixamo → design/models/mat.json (R-MAT-1, kế hoạch docs/tasks/2026-11-16-chop-mat.md).
//   cd web && npm run model:mat                    # mọi design/models/*.glb có xương mixamorig:Head
//   npm run model:mat -- <tên> [<tên>…]            # chỉ các model này (design/models/<tên>.glb), giữ mục khác
//   npm run model:mat -- --file <x.glb> --ten <tên> # model ngoài design/models (tripo.sh: kèm --thu khi chưa --dat)
//   --anh <thư mục>                                # ghi ảnh soát <tên>-mat-do.png (mặc định thư mục tạm của máy)
//   --thu                                          # chỉ dò + ảnh soát, không ghi mat.json (model chưa đặt vào design/models)
// Ảnh mặt trước dựng từ chính model (lưới + texture), dò cặp mắt (player/matDo.ts), lưới mí theo khung xương Head.
// mat.json là FILE SINH: mỗi model một mục + số đỉnh (đổi model mà quên chạy lại → test matData đỏ, app không chớp).
// Dò lệch → chỉnh `MAT_CHINH` trong web/src/player/matDo.ts (dời / co giãn elip, hoặc `tat` = không chớp) rồi chạy lại.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
import { Matrix4, Vector3 } from 'three';
import { build } from 'esbuild';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');
const MODELS = resolve(WEB, '../design/models');
const OUT = join(MODELS, 'mat.json');

const out = await build({ stdin: { contents: "export * from './src/player/matDo.ts'; export * from './src/player/matLuoi.ts';", resolveDir: WEB, loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'error' });
const { chupMat, doMat, luoiMi, apChinh, MAT_CHINH, MAT_LUOI } = await import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);

const args = process.argv.slice(2);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const anhDir = resolve(opt('anh') ?? join(tmpdir(), 'hocxa-mat-do'));
mkdirSync(anhDir, { recursive: true });
const ten = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--anh', '--file', '--ten'].includes(args[i - 1])));
/** [tên, file] cần dò */
const jobs = opt('file')
  ? [[opt('ten') ?? basename(opt('file'), '.glb'), resolve(opt('file'))]]
  : (ten.length ? ten : readdirSync(MODELS).filter((f) => f.endsWith('.glb')).map((f) => f.slice(0, -4))).map((t) => [t, join(MODELS, `${t}.glb`)]);

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const data = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
delete data.$ghi_chu;
const HEAD = /^mixamorig[:_]?(Head|HeadTop_End|LeftEye|RightEye|Jaw)$/i;
let loi = 0;

for (const [name, file] of jobs) {
  if (!existsSync(file)) { console.error(`${name}: không có ${file}`); loi++; continue; }
  const doc = await io.read(file);
  const root = doc.getRoot();
  const skin = root.listSkins()[0];
  const headNode = skin?.listJoints().find((j) => /^mixamorig[:_]?Head$/i.test(j.getName()));
  if (!skin || !headNode) { if (ten.length || opt('file')) console.log(`${name}: không có xương mixamorig:Head — bỏ qua`); continue; }
  const chinh = MAT_CHINH[name];
  if (chinh?.tat) { delete data[name]; console.log(`${name}: TẮT chớp (MAT_CHINH: ${chinh.tat})`); continue; }
  const prim = root.listMeshes()[0].listPrimitives()[0];
  const P = prim.getAttribute('POSITION');
  const UV = prim.getAttribute('TEXCOORD_0');
  const J = prim.getAttribute('JOINTS_0');
  const W = prim.getAttribute('WEIGHTS_0');
  const count = P.getCount();
  // xương ở tư thế gốc: world × nghịch đảo bind
  const joints = skin.listJoints();
  const ibm = skin.getInverseBindMatrices();
  const jm = joints.map((j, i) => new Matrix4().fromArray(j.getWorldMatrix()).multiply(new Matrix4().fromArray(ibm.getElement(i, []))));
  const isHead = joints.map((j) => HEAD.test(j.getName()));
  const pos = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2);
  const dau = new Uint8Array(count);
  const v = new Vector3();
  const acc = new Vector3();
  const tmp = new Vector3();
  for (let i = 0; i < count; i++) {
    const p = P.getElement(i, []);
    const jj = J.getElement(i, []);
    const ww = W.getElement(i, []);
    acc.set(0, 0, 0);
    let hw = 0;
    let sw = 0;
    for (let k = 0; k < 4; k++) {
      if (!ww[k]) continue;
      tmp.set(p[0], p[1], p[2]).applyMatrix4(jm[jj[k]]).multiplyScalar(ww[k]);
      acc.add(tmp);
      sw += ww[k];
      if (isHead[jj[k]]) hw += ww[k];
    }
    v.copy(acc).divideScalar(sw || 1);
    pos.set([v.x, v.y, v.z], i * 3);
    const t = UV.getElement(i, []);
    uv.set(t, i * 2);
    dau[i] = hw / (sw || 1) >= 0.5 ? 1 : 0;
  }
  const index = prim.getIndices().getArray();
  const texImg = root.listMaterials()[0].getBaseColorTexture()?.getImage();
  if (!texImg) { console.error(`${name}: không có texture màu`); loi++; continue; }
  const { data: px, info } = await sharp(Buffer.from(texImg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const tex = { w: info.width, h: info.height, data: px };
  const img = chupMat({ pos, uv, index, dau }, tex, 320);
  const headWorld = new Matrix4().fromArray(headNode.getWorldMatrix());
  const headInv = headWorld.clone().invert();
  const midX = new Vector3().setFromMatrixPosition(headWorld).x;
  const kq = doMat(img, midX);
  const veDau = (p) => { const q = new Vector3(...p).applyMatrix4(headInv); return [q.x, q.y, q.z]; };
  const elips = kq.mat ? kq.mat.map((e) => apChinh(e, chinh)) : null;
  const mats = elips ? elips.map((e) => luoiMi(img, e, kq.da, veDau)) : null;
  await anhSoat(join(anhDir, `${name}-mat-do.png`), img, kq, elips);
  if (!mats || mats.some((m) => !m)) {
    delete data[name];
    console.log(`${name}: KHÔNG dò được mắt (${kq.loi ?? 'thiếu bề mặt quanh mắt'}) — không chớp. Ảnh: ${join(anhDir, `${name}-mat-do.png`)}`);
    continue;
  }
  data[name] = { dinh: count, nu: MAT_LUOI, nv: MAT_LUOI, mat: mats };
  const f = (e) => `(${e.cx.toFixed(0)}; ${e.cy.toFixed(0)}) ${(2 * e.rx).toFixed(0)}×${(2 * e.ry).toFixed(0)}`;
  console.log(`${name}: mắt trái ${f(elips[0])} · phải ${f(elips[1])} px/320 · da rgb(${kq.da.map((c) => c.toFixed(0)).join(', ')}) · ${count} đỉnh`);
}

const sorted = Object.fromEntries(Object.keys(data).sort().map((k) => [k, data[k]]));
if (!args.includes('--thu')) writeFileSync(OUT, `${JSON.stringify({ $ghi_chu: 'FILE SINH — cd web && npm run model:mat (scripts/mat-do.mjs). Không sửa tay.', ...sorted })}\n`);
console.log(`${args.includes('--thu') ? '(thử — không ghi) ' : ''}→ ${OUT} (${Object.keys(sorted).length} model) · ảnh soát: ${anhDir}`);
process.exit(loi ? 1 : 0);

/** Ảnh soát: mặt trước phóng ×2, vùng da tô mờ xanh, elip mắt + khung lưới mí. */
async function anhSoat(file, img, kq, elips) {
  const K = 2;
  const W = img.w * K;
  const buf = Buffer.alloc(W * img.h * K * 3, 40);
  for (let y = 0; y < img.h * K; y++)
    for (let x = 0; x < W; x++) {
      const k = Math.floor(y / K) * img.w + Math.floor(x / K);
      if (img.z[k] === -Infinity) continue;
      const o = (y * W + x) * 3;
      for (let c = 0; c < 3; c++) buf[o + c] = img.rgb[k * 3 + c];
      if (kq.mat_na[k] && (x + y) % 6 === 0) buf[o + 1] = 255;
    }
  const dot = (x, y, col) => {
    const xi = Math.round(x * K), yi = Math.round(y * K);
    if (xi < 0 || yi < 0 || xi >= W || yi >= img.h * K) return;
    buf.set(col, (yi * W + xi) * 3);
  };
  for (const e of elips ?? []) {
    for (let a = 0; a < 720; a++) dot(e.cx + e.rx * Math.cos(a / 114.6), e.cy + e.ry * Math.sin(a / 114.6), [255, 40, 40]);
    for (let x = e.cx - 1.18 * e.rx; x <= e.cx + 1.18 * e.rx; x += 0.25) dot(x, e.may, [40, 160, 255]);
  }
  await sharp(buf, { raw: { width: W, height: img.h * K, channels: 3 } }).png().toFile(file);
}
