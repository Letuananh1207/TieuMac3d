// Đo / sửa mắt LÉ trên texture model nhân vật (L-24): tròng đen lệch trong ổ mắt (lòng trắng hai bên không đều).
//   cd web && npm run model:mat-sua -- <tên>                     # CHỈ ĐO (mặc định): lòng trắng trái / phải, lệch tâm tròng (% bề ngang ổ)
//   npm run model:mat-sua -- <tên> --sua [--muc 0.6] --ra <ra.glb> # THỬ NGHIỆM: dời tròng + vá lòng trắng, ghi glb mới
//   --file <vào.glb>                                              # model khác design/models/<tên>.glb
//   --anh <thư mục>                                               # ảnh soát <tên>-mat-sua.png: vùng mắt trên texture trước | sau, phóng ×6
// Kết quả đo (2026-11-16, ảnh mặt 640 px): cam-nu gốc lòng trắng 29 % | 0 % và 0 % | 31 % (lệch tâm ±15–16 %) → bản đã sửa
// (L-24, glb hiện tại) 22 % | 2 % và 5 % | 24 % (±9–10 %, nhìn thẳng tự nhiên trên Canvas 3D).
// ⚠ Chế độ --sua CHƯA ĐẠT (soát Canvas 3D 2026-11-16): viền tròng gốc bị khuất mí phía mũi → dời ra lộ cạnh bằng, còn vệt chấm tối
// của viền cũ. Glb cam-nu hiện tại KHÔNG sinh từ chế độ này (bản sửa của phiên trước, script đó không được lưu). Dùng --sua phải
// soát ảnh Canvas 3D kỹ; hướng cải tiến: dựng lại đĩa tròng đối xứng (lấp phần khuất), gộp hết nét viền tròng vào mặt nạ.
// Cách làm (chỉ đổi texture — lưới / UV / xương / meshopt / unlit giữ nguyên, số đỉnh không đổi → mat.json vẫn khớp):
// 1. Dựng ảnh mặt trước của chính model (`chupMat`), dò cặp mắt (`doMat`) như `npm run model:mat`.
// 2. Mỗi mắt: khớp phép affine ảnh mặt → texel (bình phương nhỏ nhất, lọc điểm khác mảng UV) — biết hướng "ngang mặt" trên texture.
// 3. Trên texture: phân lớp quanh mắt — lòng trắng (sáng, ít màu), tròng (xám tối, ít màu), viền / mi (tối, ngả nâu), da; tròng =
//    mảng tròng lớn nhất giữa mắt + lấp lỗ (đốm sáng nằm trong tròng đi theo tròng).
// 4. Đo theo hướng ngang mặt ở dải giữa tròng: mép ổ (lòng trắng ∪ tròng) hai bên và mép tròng hai bên → độ lệch tâm.
// 5. (--sua) Vá: tròng cũ điền bằng nội suy điều hoà từ lòng trắng xung quanh (mi / da không kéo vào); dán tròng dời đi
//    (song tuyến, mặt nạ mềm), cắt trong ổ mắt → không đè lên mi / da.
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import { Matrix4, Vector3 } from 'three';
import { build } from 'esbuild';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');
const MODELS = resolve(WEB, '../design/models');

const out = await build({ stdin: { contents: "export * from './src/player/matDo.ts';", resolveDir: WEB, loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'error' });
const { chupMat, doMat, apChinh, MAT_CHINH } = await import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);

const args = process.argv.slice(2);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const ten = args.find((a, i) => !a.startsWith('--') && !(i > 0 && ['--anh', '--file', '--ra', '--muc'].includes(args[i - 1])));
if (!ten) { console.error('cách dùng: npm run model:mat-sua -- <tên> [--file vào.glb] [--anh thư-mục] [--sua --muc 0.6 --ra ra.glb]'); process.exit(2); }
const fileVao = resolve(opt('file') ?? join(MODELS, `${ten}.glb`));
const fileRa = resolve(opt('ra') ?? join(anhDirTam(), `${ten}-sua.glb`));
const chiDo = !args.includes('--sua');
const muc = Number(opt('muc') ?? 1);
function anhDirTam() { return resolve(opt('anh') ?? join(tmpdir(), 'hocxa-mat-sua')); }
const anhDir = resolve(opt('anh') ?? join(tmpdir(), 'hocxa-mat-sua'));
mkdirSync(anhDir, { recursive: true });

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(fileVao);
const root = doc.getRoot();
const prim = root.listMeshes()[0].listPrimitives()[0];
const soDinh = prim.getAttribute('POSITION').getCount();
const texture = root.listMaterials()[0].getBaseColorTexture();
if (!texture) throw new Error('model không có texture màu');
const mime = texture.getMimeType();
const { data: goc, info } = await sharp(Buffer.from(texture.getImage())).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const TW = info.width;
const TH = info.height;

// ---------- 1. ảnh mặt trước + dò mắt (như mat-do.mjs) ----------
const { luoi, headNode } = luoiDau(prim, root.listSkins()[0]);
const rgba = Buffer.alloc(TW * TH * 4);
for (let i = 0; i < TW * TH; i++) { rgba[i * 4] = goc[i * 3]; rgba[i * 4 + 1] = goc[i * 3 + 1]; rgba[i * 4 + 2] = goc[i * 3 + 2]; rgba[i * 4 + 3] = 255; }
const ANH = 640;
const img = chupMat(luoi, { w: TW, h: TH, data: rgba }, ANH);
const midX = new Vector3().setFromMatrixPosition(new Matrix4().fromArray(headNode.getWorldMatrix())).x;
const kq = doMat(img, midX);
if (!kq.mat) throw new Error(`không dò được mắt: ${kq.loi}`);
const elips = kq.mat.map((e) => apChinh(e, MAT_CHINH[ten]));

const moi = Buffer.from(goc);
const bao = [];
for (const [i, e] of elips.entries()) {
  const r = suaMat(e, i === 0 ? 'trái' : 'phải');
  if (r) bao.push(r);
}
await anhSoat(join(anhDir, `${ten}-mat-sua.png`), bao);
if (chiDo) { console.log(`(chỉ đo — thêm --sua để thử sửa) ảnh soát: ${anhDir}`); process.exit(0); }

// ---------- ghi texture mới, giữ dạng ảnh; glb giữ nén meshopt / unlit ----------
const enc = sharp(moi, { raw: { width: TW, height: TH, channels: 3 } });
const buf = mime === 'image/png' ? await enc.png().toBuffer() : await enc.jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true }).toBuffer();
texture.setImage(new Uint8Array(buf));
await io.write(fileRa, doc);
const kiem = (await io.read(fileRa)).getRoot().listMeshes()[0].listPrimitives()[0].getAttribute('POSITION').getCount();
if (kiem !== soDinh) throw new Error(`số đỉnh đổi ${soDinh} → ${kiem}`);
console.log(`→ ${fileRa} · texture ${mime} ${(buf.length / 1024).toFixed(0)} KB · ${soDinh} đỉnh (không đổi) · ảnh soát: ${anhDir}`);
console.log('THỬ NGHIỆM — soát Canvas 3D kỹ trước khi chép vào design/models/, rồi `npm run model:mat -- ' + ten + '`.');

// =====================================================================================================

function suaMat(e, ten1) {
  // 2. affine ảnh mặt → texel từ các điểm ảnh trong elip ×1,3 (cùng một mảnh UV)
  const pts = [];
  for (let y = Math.floor(e.cy - 1.3 * e.ry); y <= e.cy + 1.3 * e.ry; y++)
    for (let x = Math.floor(e.cx - 1.3 * e.rx); x <= e.cx + 1.3 * e.rx; x++) {
      if (x < 0 || y < 0 || x >= img.w || y >= img.h) continue;
      const k = y * img.w + x;
      if (img.z[k] === -Infinity) continue;
      if (((x + 0.5 - e.cx) / e.rx) ** 2 + ((y + 0.5 - e.cy) / e.ry) ** 2 > 1.69) continue;
      pts.push([x + 0.5, y + 0.5, img.uv[k * 2] * TW, img.uv[k * 2 + 1] * TH]);
    }
  // giữ mảng UV chứa tâm mắt: lọc dần điểm lệch (đường may UV) rồi khớp lại
  const kc = Math.round(e.cy) * img.w + Math.round(e.cx);
  const tam = [img.uv[kc * 2] * TW, img.uv[kc * 2 + 1] * TH];
  let dung = pts.filter(([, , u, v]) => Math.hypot(u - tam[0], v - tam[1]) < 80);
  let A = khopAffine(dung);
  for (let lap = 0; lap < 4; lap++) {
    dung = pts.filter(([x, y, u, v]) => Math.hypot(A[0] * x + A[1] * y + A[2] - u, A[3] * x + A[4] * y + A[5] - v) < 3);
    A = khopAffine(dung);
  }
  // texel thuộc mảng này: các texel được điểm ảnh khớp affine chạm tới (nới 3 texel)
  const cham = new Set();
  for (const [, , u, v] of dung) for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) cham.add((Math.floor(v) + dy) * TW + Math.floor(u) + dx);
  console.log(`mắt ${ten1}: ${dung.length}/${pts.length} điểm ảnh cùng mảng UV · tỉ lệ ${Math.sqrt(Math.abs(A[0] * A[4] - A[1] * A[3])).toFixed(2)} texel/px`);
  pts.length = 0; pts.push(...dung);
  const sai = Math.sqrt(pts.reduce((s, [x, y, u, v]) => s + (A[0] * x + A[1] * y + A[2] - u) ** 2 + (A[3] * x + A[4] * y + A[5] - v) ** 2, 0) / pts.length);
  if (sai > 2) { console.log(`mắt ${ten1}: UV quanh mắt không liền một mảnh (sai ${sai.toFixed(1)} texel) — bỏ qua`); return null; }
  const det = A[0] * A[4] - A[1] * A[3];
  const veAnh = (u, v) => { const du = u - A[2], dv = v - A[5]; return [(A[4] * du - A[1] * dv) / det, (-A[3] * du + A[0] * dv) / det]; };
  // vùng texel: bao của mắt ×1,6
  let u0 = TW, u1 = 0, v0 = TH, v1 = 0;
  for (let a = 0; a < 64; a++) {
    const x = e.cx + 1.6 * e.rx * Math.cos(a / 10.19), y = e.cy + 1.6 * e.ry * Math.sin(a / 10.19);
    const u = A[0] * x + A[1] * y + A[2], v = A[3] * x + A[4] * y + A[5];
    u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v);
  }
  const X0 = Math.max(0, Math.floor(u0) - 2), Y0 = Math.max(0, Math.floor(v0) - 2);
  const W = Math.min(TW, Math.ceil(u1) + 3) - X0, H = Math.min(TH, Math.ceil(v1) + 3) - Y0;
  const at = (x, y) => (y * W + x);
  const px = (x, y) => ((Y0 + y) * TW + X0 + x) * 3;
  const rho = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const [ix, iy] = veAnh(X0 + x + 0.5, Y0 + y + 0.5);
    rho[at(x, y)] = Math.sqrt(((ix - e.cx) / e.rx) ** 2 + ((iy - e.cy) / e.ry) ** 2);
  }

  // 3. phân lớp: 1 lòng trắng · 2 tròng · 3 sáng (đốm / lòng trắng sáng) · 4 mi / viền · 0 da / khác
  const lop = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (rho[at(x, y)] > 1.45 || !cham.has((Y0 + y) * TW + X0 + x)) continue;
    const o = px(x, y);
    const r = goc[o], g = goc[o + 1], b = goc[o + 2];
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    const sac = Math.max(r, g, b) - Math.min(r, g, b);
    const amMau = r - b; // da / mi ngả đỏ nâu (r > b); lòng trắng / tròng trung tính hoặc ngả xanh
    if (l < 120 && sac < 34 && amMau < 22) lop[at(x, y)] = 2;
    else if (l < 125) lop[at(x, y)] = 4;
    else if (l >= 150 && amMau < 18) lop[at(x, y)] = l > 228 ? 3 : 1;
  }
  // tròng: mảng tròng lớn nhất có điểm trong elip lõi
  const nhan = new Int32Array(W * H).fill(-1);
  let tot = -1, totN = 0;
  for (let k = 0; k < W * H; k++) {
    if (lop[k] !== 2 || nhan[k] >= 0 || rho[k] > 0.9) continue;
    const m = lan(k, (q) => lop[q] === 2, nhan, k, W, H);
    if (m.length > totN) { totN = m.length; tot = k; }
  }
  if (tot < 0) { console.log(`mắt ${ten1}: không thấy tròng — bỏ qua`); return null; }
  const trong = new Uint8Array(W * H);
  for (let k = 0; k < W * H; k++) if (nhan[k] === tot) trong[k] = 1;
  // lấp lỗ (đốm sáng, viền tròng trong) — loang từ mép vùng qua chỗ không phải tròng
  const ngoai = new Int32Array(W * H).fill(-1);
  for (let x = 0; x < W; x++) for (const y of [0, H - 1]) if (!trong[at(x, y)] && ngoai[at(x, y)] < 0) lan(at(x, y), (q) => !trong[q], ngoai, 1, W, H);
  for (let y = 0; y < H; y++) for (const x of [0, W - 1]) if (!trong[at(x, y)] && ngoai[at(x, y)] < 0) lan(at(x, y), (q) => !trong[q], ngoai, 1, W, H);
  for (let k = 0; k < W * H; k++) if (ngoai[k] < 0) trong[k] = 1;
  // viền tròng (nét tối ngả nâu do nén JPEG / nét vẽ) sát tròng → thuộc tròng, nới 2 lượt
  for (let lap = 0; lap < 2; lap++) {
    const them = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const k = at(x, y);
      if (trong[k] || rho[k] > 1.2) continue;
      const p = px(x, y); const l = 0.299 * goc[p] + 0.587 * goc[p + 1] + 0.114 * goc[p + 2];
      if (l < 130 && goc[p] - goc[p + 2] < 35 && (trong[k - 1] || trong[k + 1] || trong[k - W] || trong[k + W])) them.push(k);
    }
    for (const k of them) trong[k] = 1;
  }
  // ổ mắt = tròng ∪ lòng trắng (mảng liền với tròng)
  const o = new Uint8Array(W * H);
  const oNhan = new Int32Array(W * H).fill(-1);
  for (let k = 0; k < W * H; k++) if (trong[k]) { o[k] = 1; }
  for (let k = 0; k < W * H; k++) if (trong[k] && oNhan[k] < 0) lan(k, (q) => trong[q] || lop[q] === 1 || lop[q] === 3, oNhan, 1, W, H);
  for (let k = 0; k < W * H; k++) if (oNhan[k] >= 0) o[k] = 1;

  // 4. đo theo hướng ngang mặt: chiếu lên trục x ảnh, lấy dải quanh tâm tròng (theo y ảnh)
  let sx = 0, sy = 0, n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (trong[at(x, y)]) { const [ix, iy] = veAnh(X0 + x + 0.5, Y0 + y + 0.5); sx += ix; sy += iy; n++; }
  const tcy = sy / n;
  const daiY = 0.25 * e.ry;
  const mep = (mask) => {
    let a = Infinity, b = -Infinity;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!mask[at(x, y)]) continue;
      const [ix, iy] = veAnh(X0 + x + 0.5, Y0 + y + 0.5);
      if (Math.abs(iy - tcy) > daiY) continue;
      a = Math.min(a, ix); b = Math.max(b, ix);
    }
    return [a, b];
  };
  const [oL, oR] = mep(o);
  const [tL, tR] = mep(trong);
  const lech = (tL + tR) / 2 - (oL + oR) / 2; // + = tròng lệch sang phải ảnh
  const rong = oR - oL;
  const dxAnh = -lech * muc;
  const du = A[0] * dxAnh, dv = A[3] * dxAnh;
  const bc = { ten: ten1, lech: lech / rong, trai: (tL - oL) / rong, phai: (oR - tR) / rong, du, dv };
  console.log(`mắt ${ten1}: ổ ${rong.toFixed(1)} px/${ANH} · tròng ${(tR - tL).toFixed(1)} · lòng trắng trái ${(100 * bc.trai).toFixed(0)} % | phải ${(100 * bc.phai).toFixed(0)} % · lệch tâm ${(100 * bc.lech).toFixed(1)} % bề ngang ổ · dời ${du.toFixed(2)}, ${dv.toFixed(2)} texel`);
  const vung = { X0, Y0, W, H };
  if (chiDo || Math.hypot(du, dv) < 0.5) return { ...bc, vung };

  // 5a. vá chỗ tròng cũ: nới 2 texel trong ổ (viền khử răng cưa), nội suy điều hoà từ lòng trắng
  const va = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let gan = false;
    for (let dy = -2; dy <= 2 && !gan; dy++) for (let dx = -2; dx <= 2 && !gan; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < W && yy < H && trong[at(xx, yy)] && dx * dx + dy * dy <= 5) gan = true;
    }
    if (gan && (trong[at(x, y)] || (lop[at(x, y)] !== 4 && lop[at(x, y)] !== 0))) va[at(x, y)] = 1;
    // viền khử răng cưa giữa tròng và lòng trắng (lớp 0 / 4 nhưng sáng vừa, sát tròng) cũng vá
    if (gan && !va[at(x, y)] && o[at(x, y)] === 0) {
      const p = px(x, y); const l = 0.299 * goc[p] + 0.587 * goc[p + 1] + 0.114 * goc[p + 2];
      const amMau = goc[p] - goc[p + 2];
      if (l >= 95 && amMau < 18) va[at(x, y)] = 1;
    }
  }
  const lw = []; // lòng trắng biết (không vá) — màu trung bình làm giá trị đầu
  for (let k = 0; k < W * H; k++) if (!va[k] && (lop[k] === 1) && o[k]) lw.push(k);
  if (!lw.length) { console.log(`mắt ${ten1}: không thấy lòng trắng để vá — bỏ qua`); return { ...bc, vung }; }
  const tb = [0, 1, 2].map((c) => lw.reduce((s, k) => s + goc[px(k % W, (k / W) | 0) + c], 0) / lw.length);
  const f = new Float32Array(W * H * 3);
  for (let k = 0; k < W * H; k++) { const p = px(k % W, (k / W) | 0); for (let c = 0; c < 3; c++) f[k * 3 + c] = va[k] ? tb[c] : goc[p + c]; }
  const biet = (k) => !va[k] && lop[k] === 1 && o[k];
  for (let it = 0; it < 600; it++)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = at(x, y);
      if (!va[k]) continue;
      const acc = [0, 0, 0]; let m = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const q = at(xx, yy);
        if (!va[q] && !biet(q)) continue; // mi / da: biên tự do, không kéo màu tối vào
        for (let c = 0; c < 3; c++) acc[c] += f[q * 3 + c];
        m++;
      }
      if (m) for (let c = 0; c < 3; c++) f[k * 3 + c] = acc[c] / m;
    }
  // 5b. dán tròng dời đi: mặt nạ mềm (làm mờ 1 texel), lấy mẫu song tuyến ở (x − du, y − dv)
  const mm = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, w = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = Math.min(W - 1, Math.max(0, x + dx)), yy = Math.min(H - 1, Math.max(0, y + dy));
      const ww = dx || dy ? (dx && dy ? 0.06 : 0.12) : 0.28;
      s += ww * trong[at(xx, yy)]; w += ww;
    }
    mm[at(x, y)] = s / w;
  }
  const mau = (x, y) => { // song tuyến trên ảnh gốc (toạ độ vùng)
    const x0 = Math.floor(x), y0 = Math.floor(y), ax = x - x0, ay = y - y0;
    const r = [0, 0, 0];
    for (const [dx, dy, w] of [[0, 0, (1 - ax) * (1 - ay)], [1, 0, ax * (1 - ay)], [0, 1, (1 - ax) * ay], [1, 1, ax * ay]]) {
      const xx = Math.min(W - 1, Math.max(0, x0 + dx)), yy = Math.min(H - 1, Math.max(0, y0 + dy));
      const p = px(xx, yy); for (let c = 0; c < 3; c++) r[c] += w * goc[p + c];
    }
    return r;
  };
  const nhanMat = (x, y) => {
    const x0 = Math.floor(x), y0 = Math.floor(y), ax = x - x0, ay = y - y0;
    let r = 0;
    for (const [dx, dy, w] of [[0, 0, (1 - ax) * (1 - ay)], [1, 0, ax * (1 - ay)], [0, 1, (1 - ax) * ay], [1, 1, ax * ay]]) {
      const xx = x0 + dx, yy = y0 + dy;
      if (xx >= 0 && yy >= 0 && xx < W && yy < H) r += w * mm[at(xx, yy)];
    }
    return r;
  };
  // ổ mắt mới mềm: ổ cũ ∪ chỗ đã vá — tròng không tràn ra mi / da
  let doi = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = at(x, y);
    const trongO = o[k] || va[k];
    let a = nhanMat(x - 0.5 - du + 0.5, y - 0.5 - dv + 0.5);
    if (!trongO) a = 0;
    if (!va[k] && !a) continue;
    const src = a > 0 ? mau(x - du, y - dv) : [0, 0, 0];
    const p = px(x, y);
    for (let c = 0; c < 3; c++) {
      const nen = va[k] ? f[k * 3 + c] : goc[p + c];
      moi[p + c] = Math.round(Math.min(255, Math.max(0, a * src[c] + (1 - a) * nen)));
    }
    doi++;
  }
  console.log(`  → đổi ${doi} texel`);
  return { ...bc, vung };
}

/** Phép affine (u, v) = A·(x, y, 1) khớp bình phương nhỏ nhất. */
function khopAffine(pts) {
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const bu = [0, 0, 0], bv = [0, 0, 0];
  for (const [x, y, u, v] of pts) {
    const r = [x, y, 1];
    for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) M[i][j] += r[i] * r[j]; bu[i] += r[i] * u; bv[i] += r[i] * v; }
  }
  const giai = (b) => { // Cramer 3×3
    const d = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const D = d(M);
    return [0, 1, 2].map((c) => d(M.map((row, i) => row.map((val, j) => (j === c ? b[i] : val)))) / D);
  };
  return [...giai(bu), ...giai(bv)];
}

/** Loang 4 hướng từ `k` qua các ô `ok`, gán `mark = val`; trả các ô đã loang. */
function lan(k, ok, mark, val, W, H) {
  const outp = [];
  const st = [k];
  mark[k] = val;
  while (st.length) {
    const q = st.pop();
    outp.push(q);
    const x = q % W, y = (q - x) / W;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
      const r = yy * W + xx;
      if (mark[r] !== -1 || !ok(r)) continue;
      mark[r] = val;
      st.push(r);
    }
  }
  return outp;
}

/** Lưới đầu ở tư thế gốc (như scripts/mat-do.mjs). */
function luoiDau(p, skin) {
  const HEAD = /^mixamorig[:_]?(Head|HeadTop_End|LeftEye|RightEye|Jaw)$/i;
  const headNode = skin?.listJoints().find((j) => /^mixamorig[:_]?Head$/i.test(j.getName()));
  if (!headNode) throw new Error('model không có xương mixamorig:Head');
  const P = p.getAttribute('POSITION'), UV = p.getAttribute('TEXCOORD_0'), J = p.getAttribute('JOINTS_0'), Wt = p.getAttribute('WEIGHTS_0');
  const count = P.getCount();
  const joints = skin.listJoints();
  const ibm = skin.getInverseBindMatrices();
  const jm = joints.map((j, i) => new Matrix4().fromArray(j.getWorldMatrix()).multiply(new Matrix4().fromArray(ibm.getElement(i, []))));
  const isHead = joints.map((j) => HEAD.test(j.getName()));
  const pos = new Float32Array(count * 3), uv = new Float32Array(count * 2), dau = new Uint8Array(count);
  const acc = new Vector3(), tmp = new Vector3();
  for (let i = 0; i < count; i++) {
    const q = P.getElement(i, []), jj = J.getElement(i, []), ww = Wt.getElement(i, []);
    acc.set(0, 0, 0);
    let hw = 0, sw = 0;
    for (let k = 0; k < 4; k++) {
      if (!ww[k]) continue;
      tmp.set(q[0], q[1], q[2]).applyMatrix4(jm[jj[k]]).multiplyScalar(ww[k]);
      acc.add(tmp); sw += ww[k];
      if (isHead[jj[k]]) hw += ww[k];
    }
    acc.divideScalar(sw || 1);
    pos.set([acc.x, acc.y, acc.z], i * 3);
    uv.set(UV.getElement(i, []), i * 2);
    dau[i] = hw / (sw || 1) >= 0.5 ? 1 : 0;
  }
  return { luoi: { pos, uv, index: p.getIndices().getArray(), dau }, headNode };
}

/** Ảnh soát: mỗi mắt một hàng — texture trước | sau, phóng ×6. */
async function anhSoat(file, ds) {
  const K = 6;
  const rows = [];
  for (const b of ds) {
    const { X0, Y0, W, H } = b.vung;
    const mk = (src) => sharp(src, { raw: { width: TW, height: TH, channels: 3 } }).extract({ left: X0, top: Y0, width: W, height: H })
      .resize(W * K, H * K, { kernel: 'nearest' }).png().toBuffer();
    rows.push({ W: W * K, H: H * K, a: await mk(goc), b: await mk(moi) });
  }
  if (!rows.length) return;
  const WW = Math.max(...rows.map((r) => r.W)) * 2 + 12;
  const HH = rows.reduce((s, r) => s + r.H + 12, 0);
  const comp = [];
  let y = 0;
  for (const r of rows) { comp.push({ input: r.a, left: 0, top: y }, { input: r.b, left: r.W + 12, top: y }); y += r.H + 12; }
  await sharp({ create: { width: WW, height: HH, channels: 3, background: '#ffffff' } }).composite(comp).png().toFile(file);
}
