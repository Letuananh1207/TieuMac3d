/**
 * Mẫu nhà của bộ asset chuẩn (`danh_muc.ts`) — đợt 1 (đợt 2: `mau_nha_2.ts` vườn / thờ / cổng, `mau_bien.ts` biên ải). Mỗi mẫu dựng từ bộ phận chung (`bo_phan.ts`) + mái chuẩn
 * (`mai_giong.ts`) theo cỡ S / M / L và giọng vùng. Mẫu vào được (`lau`, `cua-hang`, `hi-dai`) gọi hàm dựng hiện có ở
 * cỡ chuẩn (ruột, thang, chỗ ngồi giữ nguyên — đã có test). Dùng cho Catalog 3D; map chuyển sang ở GĐ 5.
 */
import * as THREE from 'three';
import type { BuildingSpec, SceneSpec } from '../spec';
import { cotTheoGian, nen, than, type Build } from './bo_phan';
import { addBeamBand, addRailing, type Style } from './chi_tiet';
import { DOC, K, maiDua, mau, ngoi, type Co, type Giong } from './danh_muc';
import { box, column, frustum } from './hinh';
import { cuaHang } from './cua_hang';
import { hiDai } from './hi_dai';
import { lauSach } from './lau_sach';
import { roofMat } from './mai';
import { dungMai, hienDuoi } from './mai_giong';
import { BUILD_BIEN } from './mau_bien';
import { BUILD_2 } from './mau_nha_2';
import { traLau } from './tra_lau';

/** Điện: nền theo cấp, thân vách kín, mái đơn hoặc kép (thân trên 0,78 × 0,7). */
const dien: Build = (g, m, c, giong, style) => {
  const y0 = nen(g, c.w, c.d, c.cap, style, 1.5);
  let y = than(g, { w: c.w, d: c.d, y0, cot: c.cot, gian: c.gian, cap: c.cap, kieu: 'vach' }, style);
  const roof = ngoi(c.cap, giong);
  let w = c.w;
  let d = c.d;
  if (c.kep) {
    const uw = c.w * 0.78;
    const ud = c.d * 0.7;
    const y2 = hienDuoi(g, c.w, c.d, y, maiDua(c.cap, c.cot) * 1.6, uw, ud, giong, roof);
    const upH = c.cot * 0.4;
    g.add(box(uw, upH, ud, style.wall, 0, y2 + upH / 2, 0));
    addBeamBand(g, uw, ud, y2 + upH, style);
    y = y2 + upH + 0.5;
    w = uw;
    d = ud;
  }
  dungMai(g, { kieu: c.mai ?? m.mai, w, d, y, over: maiDua(c.cap, c.cot), giong, color: roof, ridgeColor: style.ridge, mat: c.mat });
};

/** Sảnh: như điện một tầng mái, nền thấp hơn. */
const sanh: Build = (g, m, c, giong, style) => {
  const y0 = nen(g, c.w, c.d, c.cap, style, 1);
  const y = than(g, { w: c.w, d: c.d, y0, cot: c.cot, gian: c.gian, cap: c.cap, kieu: 'vach' }, style);
  dungMai(g, { kieu: c.mai ?? m.mai, w: c.w, d: c.d, y, over: maiDua(c.cap, c.cot), giong, color: ngoi(c.cap, giong), ridgeColor: style.ridge });
};

/** Các: vuông nhiều tầng; mỗi tầng trên có ban công vòng 平坐 (sàn nhô 0,9 m + lan can) và hiên lửng giữa hai tầng. */
const cac: Build = (g, m, c, giong, style) => {
  const roof = ngoi(c.cap, giong);
  let y = nen(g, c.w, c.d, c.cap, style, 1);
  const floors = c.tang ?? 2;
  let w = c.w;
  for (let t = 0; t < floors; t++) {
    const top = than(g, { w, d: w, y0: y, cot: c.cot, gian: c.gian, cap: c.cap, kieu: t === 0 ? 'vach' : 'mo' }, style);
    if (t < floors - 1) {
      // hiên lửng giữa hai tầng + sàn ban công tầng trên (lan can gỗ)
      const over = maiDua(c.cap, c.cot);
      const sk = new THREE.Mesh(frustum(w + 2 * over, w + 2 * over, w + 0.2, w + 0.2, 0.7), roofMat(roof));
      sk.position.y = top;
      g.add(sk);
      const deck = top + 0.7;
      const nw = w * 0.88;
      g.add(box(nw + 1.8, 0.25, nw + 1.8, style.timber, 0, deck + 0.125, 0));
      addRailing(g, nw + 1.8, nw + 1.8, deck + 0.25, 0, { ...style, base: style.timber });
      y = deck + 0.25;
      w = nw;
    } else {
      dungMai(g, { kieu: c.mai ?? m.mai, w, d: w, y: top, over: maiDua(c.cap, c.cot), giong, color: roof, ridgeColor: style.ridge, mat: c.mat });
    }
  }
};

/** Tháp: thân đa giác `mat` cạnh, mỗi tầng thu đều, mỗi tầng một vành hiên, chóp toản tiêm + cột đồng. */
const thap: Build = (g, _m, c, giong, style) => {
  const n = c.mat ?? 8;
  const floors = c.tang ?? 5;
  const roof = ngoi(c.cap, giong);
  let y = nen(g, c.w, c.d, c.cap, style, 1);
  const r0 = c.w / 2;
  const rTop = r0 * 0.55;
  const ap = (r: number): number => r / Math.cos(Math.PI / n);
  for (let t = 0; t < floors; t++) {
    const r = r0 + ((rTop - r0) * t) / Math.max(1, floors - 1);
    const h = c.cot * (1 - 0.04 * t);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(ap(r * 0.97), ap(r), h, n).rotateY(Math.PI / n), new THREE.MeshLambertMaterial({ color: style.wall }));
    body.position.y = y + h / 2;
    g.add(body);
    y += h;
    // vành hiên mỗi tầng (vươn rộng, dày, đầu đao ở góc — dáng tháp lầu các 樓閣式): dải xà sẫm + mái ngói;
    // tầng cuối là mái chóp
    if (t < floors - 1) {
      const over = 1.1 + 0.25 * (r0 / 3.5);
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(ap(r + 0.15), ap(r + 0.15), 0.35, n).rotateY(Math.PI / n), new THREE.MeshLambertMaterial({ color: style.eave })).translateY(y + 0.175));
      const eaveH = over * Math.tan((DOC[giong].hien * Math.PI) / 180);
      const eave = new THREE.Mesh(new THREE.CylinderGeometry(ap(r * 0.92), ap(r + over), eaveH, n, 1, true).rotateY(Math.PI / n), roofMat(roof));
      eave.position.y = y + 0.35 + eaveH / 2 - 0.1;
      g.add(eave);
      const R = ap(r + over) - 0.1;
      const tipsAt = Array.from({ length: n }, (_, i): [number, number] => {
        const a = Math.PI / n + (i * 2 * Math.PI) / n + Math.PI / 2;
        return [Math.cos(a) * R, Math.sin(a) * R];
      });
      for (const [x, z] of tipsAt) {
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.9, 5), new THREE.MeshLambertMaterial({ color: style.ridge }));
        tip.scale.setScalar(DOC[giong].vinh);
        tip.position.set(x, y + 0.35 + 0.2, z);
        tip.rotation.order = 'YXZ';
        tip.rotation.y = Math.atan2(x, z);
        tip.rotation.x = 0.9;
        g.add(tip);
      }
      y += 0.35 + eaveH * 0.6;
    } else {
      dungMai(g, { kieu: 'toan-tiem', w: 2 * r, d: 2 * r, y, over: 0.9, giong, color: roof, ridgeColor: style.ridge, mat: n });
    }
  }
};

/** Đình: cột ở các góc đa giác, ghế thấp quanh, mái toản tiêm (kép ở cỡ L). */
const dinh: Build = (g, _m, c, giong, style) => {
  const n = c.mat ?? 4;
  const roof = ngoi(c.cap, giong);
  const y0 = nen(g, c.w, c.d, c.cap, style, 0.4, 1.6);
  const a = c.w / 2;
  const R = a / Math.cos(Math.PI / n);
  const corners = Array.from({ length: n }, (_, i) => {
    const t = Math.PI / n + (i * 2 * Math.PI) / n + Math.PI / 2;
    return [Math.cos(t) * (R - 0.2), Math.sin(t) * (R - 0.2)] as const;
  });
  for (const [x, z] of corners) g.add(column(0.15, c.cot, style.pillar, x, y0, z));
  g.add(box(c.w * 0.9, 0.45, 0.35, style.timber, 0, y0 + 0.225, -a + 0.4)); // ghế tựa phía sau
  let y = y0 + c.cot;
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.35, n).rotateY(Math.PI / n), new THREE.MeshLambertMaterial({ color: style.eave })).translateY(y + 0.175));
  y += 0.35;
  if (c.kep) {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.7, R + 0.9, 0.8, n, 1, true).rotateY(Math.PI / n), roofMat(roof));
    ring.position.y = y + 0.4;
    g.add(ring);
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(R * 0.7, R * 0.7, 1.1, n).rotateY(Math.PI / n), new THREE.MeshLambertMaterial({ color: style.wall })).translateY(y + 0.8 + 0.55));
    y += 1.9;
    dungMai(g, { kieu: 'toan-tiem', w: 2 * a * 0.7, d: 2 * a * 0.7, y, over: 0.6, giong, color: roof, ridgeColor: style.ridge, mat: n });
  } else {
    dungMai(g, { kieu: 'toan-tiem', w: c.w, d: c.d, y, over: 0.9, giong, color: roof, ridgeColor: style.ridge, mat: n });
  }
};

/** Thuỷ tạ: sàn gỗ nửa trên bờ nửa trên nước (cột đá dưới), mặt nước mở, lan can + ghế 美人靠 phía nước, mái quyển bồng. */
const ta: Build = (g, m, c, giong, style) => {
  const roof = ngoi(c.cap, giong);
  // nước phía trước (+z) — chỉ để thấy ý "trên nước" trong Catalog
  g.add(box(c.w + 4, 0.05, c.d * 0.8, style.water, 0, 0.025, c.d * 0.4 + 0.5));
  const y0 = 0.7;
  for (const x of cotTheoGian(c.w, c.gian)) for (const z of [c.d / 2 - 0.3, 0.2]) g.add(column(0.18, y0 - 0.1, style.stone, x, 0, z)); // đỉnh cọc = đáy sàn (không lồng vào sàn)
  g.add(box(c.w, 0.2, c.d, style.timber, 0, y0 - 0.1, 0));
  const y = than(g, { w: c.w, d: c.d, y0, cot: c.cot, gian: c.gian, cap: c.cap, kieu: 'mo' }, style);
  g.add(box(c.w - 0.4, 0.45, 0.35, style.timber, 0, y0 + 0.225, c.d / 2 - 0.35)); // 美人靠 mặt nước
  g.add(box(c.w * 0.6, c.cot * 0.8, 0.2, style.wall, 0, y0 + c.cot * 0.4, -c.d / 2 + 0.3)); // vách sau
  dungMai(g, { kieu: c.mai ?? m.mai, w: c.w, d: c.d, y, over: maiDua(c.cap, c.cot), giong, color: roof, ridgeColor: style.ridge });
};

/** Dãy nhà 1 tầng: tường vôi kín, cột gỗ, cửa mỗi gian, mái ngạnh sơn. */
const nhaDay: Build = (g, m, c, giong, style) => {
  const y0 = nen(g, c.w, c.d, c.cap, style, 0.3, 2);
  const y = than(g, { w: c.w, d: c.d, y0, cot: c.cot, gian: c.gian, cap: c.cap, kieu: 'vach' }, style);
  dungMai(g, { kieu: c.mai ?? m.mai, w: c.w, d: c.d, y, over: maiDua(c.cap, c.cot), giong, color: ngoi(c.cap, giong), ridgeColor: style.ridge });
};

/** Nhà gối sông: 2 tầng, tầng dưới vôi + đế đá xanh, tầng trên gỗ có cửa sổ, mái ngạnh sơn; cỡ L thêm gác chồm nước phía sau. */
const nhaGiangNam: Build = (g, m, c, giong, style) => {
  g.add(box(c.w + 0.4, 0.4, c.d + 0.4, style.stone, 0, 0.2, 0));
  const h1 = c.cot;
  g.add(box(c.w, h1, c.d, style.wall, 0, 0.4 + h1 / 2, 0));
  g.add(box(1.2, 2.2, 0.08, style.timber, 0, 0.4 + 1.1, c.d / 2 + 0.04)); // cửa
  const y1 = 0.4 + h1;
  g.add(box(c.w + 0.5, 0.25, c.d + 0.5, style.timber, 0, y1 + 0.125, 0)); // sàn tầng trên nhô
  const h2 = c.cot * 0.85;
  g.add(box(c.w, h2, c.d, style.timber, 0, y1 + 0.25 + h2 / 2, 0));
  for (const x of cotTheoGian(c.w, Math.max(1, c.gian)).slice(0, -1)) {
    g.add(box(1.0, 0.9, 0.06, style.wall, x + c.w / Math.max(1, c.gian) / 2, y1 + 0.25 + h2 * 0.55, c.d / 2 + 0.03)); // cửa sổ giấy
  }
  const y = y1 + 0.25 + h2;
  dungMai(g, { kieu: c.mai ?? m.mai, w: c.w, d: c.d, y, over: maiDua(c.cap, c.cot), giong, color: ngoi(c.cap, giong), ridgeColor: style.ridge });
  if (c.gian >= 3) {
    // 水閣: gác chồm ra nước phía sau, trên cột đá
    const z = -c.d / 2 - 1.6;
    g.add(box(c.w + 2, 0.05, 4.5, style.water, 0, 0.025, z - 0.6));
    for (const x of [-c.w / 2 + 0.6, c.w / 2 - 0.6]) g.add(column(0.15, y1, style.stone, x, 0, z - 1.2));
    g.add(box(c.w - 0.6, 0.25, 3, style.timber, 0, y1 + 0.125, z));
    g.add(box(c.w - 0.8, 0.9, 0.08, style.timber, 0, y1 + 0.7, z - 1.45));
  }
};

/** Mẫu vào được: gọi hàm dựng hiện có ở cỡ chuẩn, chiều cao theo `K`. */
function vaoDuoc(builder: (g: THREE.Group, b: BuildingSpec, s: Style, fade: THREE.Group, fadeLow: THREE.Group) => unknown): Build {
  return (g, m, c, giong, style) => {
    const b: BuildingSpec = { id: m.ma, x: 0, z: 0, w: c.w, d: c.d, title: m.ten.split(' ')[0], roofColor: ngoi(c.cap, giong) };
    const fade = new THREE.Group();
    const fadeLow = new THREE.Group();
    g.add(fade, fadeLow);
    builder(g, b, { ...style, heightScale: K }, fade, fadeLow);
  };
}

const BUILD: Record<string, Build> = {
  dien,
  'dien-vuong': dien,
  sanh,
  cac,
  thap,
  dinh,
  ta,
  'nha-day': nhaDay,
  'nha-giang-nam': nhaGiangNam,
  lau: (g, m, c, giong, style) => (c.gian === 6 ? vaoDuoc(lauSach) : vaoDuoc(traLau))(g, m, c, giong, style),
  'cua-hang': vaoDuoc((g, b, s, fade) => cuaHang(g, b, s, fade)),
  'hi-dai': vaoDuoc((g, b, s, fade) => hiDai(g, b, s, fade)),
  ...BUILD_2,
  ...BUILD_BIEN,
};

/** Dựng mẫu `ma` ở cỡ `co`, giọng `giong` vào một nhóm mới. Không có mẫu / cỡ → null. */
export function dungMau(ma: string, co: Co, giong: Giong, style: SceneSpec['buildingStyle']): THREE.Group | null {
  const m = mau(ma);
  const c = m?.co[co];
  const build = BUILD[ma];
  if (!m || !c || !build) return null;
  const g = new THREE.Group();
  build(g, m, c, giong, style);
  return g;
}

/** Mã đã có hàm dựng (Catalog chỉ bày những mẫu này). */
export const MAU_DA_DUNG = Object.keys(BUILD);
