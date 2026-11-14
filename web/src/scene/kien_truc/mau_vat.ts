/**
 * Vật sân đợt 4 của bộ asset chuẩn (`danh_muc_dot4.ts`), phần 1: chiếu bích `chieu-bich` (S tường vôi · L Cửu Long Bích),
 * sư tử `su-tu` (cặp), hoa biểu `hoa-bieu` (cặp), cột cờ `cot-co` (cặp, chân kẹp đá), đống củi báo hiệu `cui-bao-hieu`.
 * Phần 2: `mau_vat_2.ts`. Toạ độ hệ mẫu, mặt trước nhìn +z; vật đi cặp bày cả cặp (đông = +x, tây = −x). Dùng cho Catalog
 * 3D; map chuyển sang ở GĐ 5 (thay các vật cũ ở cột "Thay").
 */
import * as THREE from 'three';
import { lambert } from '../materials';
import type { Build } from './bo_phan';
import type { Style } from './chi_tiet';
import { cotSon, ngoi } from './danh_muc';
import { box, column } from './hinh';
import { dungMai, hinhMai } from './mai_giong';
import { EARTH_DARK, REED_LINE } from './mau_bien';
import { tuDi } from './mau_nen';

/** Đá trắng (cùng màu `mau_nen.ts`, `cung_dien.ts`) + đá chạm sẫm hơn một chút. */
export const MARBLE = '#e6e2d6';
export const MARBLE_CARVE = '#d3cdbf';
/** Vải đỏ (phướn), son cung — cùng màu tường son của `mau_noi.ts`. */
const RED = '#9b2f24';
/** Nền lam ngọc Cửu Long Bích + sóng nước lục (cùng màu ngói lục `danh_muc.ts`). */
const GLAZE_BLUE = '#3f5fa0';
const GLAZE_GREEN = '#2B5446';

/** Đặt một khối hình `geo` màu `color` tại (x, y, z) vào `g`. */
export function put(g: THREE.Object3D, geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(geo, lambert(color));
  m.position.set(x, y, z);
  g.add(m);
  return m;
}

/** Hai vị trí của một cặp vật trên bề ngang `w`, lề `inset` mỗi bên: [đông (+x), tây (−x)]. */
export const capX = (w: number, inset: number): [number, number] => [w / 2 - inset, -(w / 2 - inset)];

/* ---------------- chiếu bích 照壁 ---------------- */

/** Một con rồng nổi trên mặt tường: thân ống lượn hình chữ S (`len` ngang), đầu, ngọc. Mặt phẳng tường ở `z`. */
function rong(g: THREE.Group, x: number, y: number, z: number, len: number, h: number, color: string, flip: number): void {
  const pts = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    return new THREE.Vector3(x + flip * (t - 0.5) * len, y + Math.sin(t * Math.PI * 2.2) * h * 0.32, z + 0.18);
  });
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.16, 5), lambert(color)));
  const head = pts[pts.length - 1];
  put(g, new THREE.SphereGeometry(0.3, 7, 5), color, head.x, head.y + 0.1, z + 0.2);
  put(g, new THREE.SphereGeometry(0.16, 6, 4), MARBLE, x, y + h * 0.42, z + 0.2); // ngọc
}

/**
 * Chiếu bích: chân đá (S) / bệ tu di (L), thân tường, mũ ngói (S huyền sơn · L vũ điện ngói vàng) — đỉnh mái đúng `cot`.
 * S: thân vôi, khung đá nổi và ô thoi lam giữa hai mặt. L Cửu Long Bích: nền lam, dải sóng lục dưới chân, 9 rồng nổi
 * mặt trước (vàng xen trắng), dải gờ sẫm dưới mái.
 */
const chieuBich: Build = (g, m, c, giong, style) => {
  const long = c.bien === 'cuu-long';
  const kieu = c.mai ?? m.mai;
  const over = long ? 0.6 : 0.35;
  // đỉnh bờ nóc (+ sừng) ≈ `cot`: bờ nóc + sừng nhô ≈ 0,7 trên mặt mái (`dungMai`)
  const yRoof = c.cot - hinhMai({ kieu, w: c.w, d: c.d, over, giong }).cao - 0.7;
  const base = long ? 1.1 : 0.6;
  if (long) tuDi(g, 0, 0, c.w + 0.4, c.d + 0.4, 0, base, style);
  else g.add(box(c.w + 0.2, base, c.d + 0.2, style.stone, 0, base / 2, 0));
  const bodyH = yRoof - base - (long ? 0.35 : 0);
  g.add(box(c.w, bodyH, c.d, long ? GLAZE_BLUE : style.wall, 0, base + bodyH / 2, 0));
  if (long) {
    g.add(box(c.w + 0.06, 0.8, c.d + 0.06, GLAZE_GREEN, 0, base + 0.4, 0)); // sóng nước
    g.add(box(c.w + 0.1, 0.35, c.d + 0.1, style.eave, 0, yRoof - 0.175, 0)); // gờ đấu củng dưới mái (trên thân)
    const n = c.gian;
    const pw = c.w / n;
    const yc = base + 0.8 + (bodyH - 0.8) / 2;
    for (let i = 0; i < n; i++) {
      const x = -c.w / 2 + (i + 0.5) * pw;
      rong(g, x, yc, c.d / 2, pw * 0.8, bodyH - 0.8, i % 2 ? MARBLE : style.gold, i % 2 ? -1 : 1);
    }
  } else {
    // khung đá nổi + ô thoi giữa, hai mặt
    const fh = bodyH - 0.5;
    const fy = base + 0.25 + fh / 2;
    for (const s of [-1, 1]) {
      const z = s * (c.d / 2 + 0.02);
      for (const yy of [fy - fh / 2, fy + fh / 2]) g.add(box(c.w - 0.6, 0.14, 0.04, style.stone, 0, yy, z));
      for (const x of [-(c.w - 0.6) / 2, (c.w - 0.6) / 2]) g.add(box(0.14, fh - 0.14, 0.04, style.stone, x, fy, z));
      const dia = box(1.3, 1.3, 0.06, GLAZE_BLUE, 0, fy, s * (c.d / 2 + 0.03));
      dia.rotation.z = Math.PI / 4;
      g.add(dia);
    }
  }
  dungMai(g, { kieu, w: c.w, d: c.d, y: yRoof, over, giong, color: ngoi(c.cap, giong), ridgeColor: style.ridge });
};

/* ---------------- sư tử 石獅 (cặp) ---------------- */

/**
 * Một sư tử ngồi trên bệ, nhìn +z: mông, ngực, bờm, đầu, hai chân trước. Đực: chân phải (−x của con vật) đặt lên tú cầu;
 * cái: chân trái (+x) vờn sư tử con. Đỉnh đầu ≈ `cot`.
 */
function suTu(g: THREE.Group, x: number, cot: number, male: boolean, body: string, mane: string, plinth: string): void {
  const s = new THREE.Group();
  s.position.x = x;
  g.add(s);
  const pb = 0.85; // bệ đá
  s.add(box(1.3, pb, 1.8, plinth, 0, pb / 2, 0));
  const k = (cot - pb) / 1.65; // thân sư tử cao 1,65 ở cỡ chuẩn
  put(s, new THREE.SphereGeometry(0.46 * k, 8, 6).scale(1, 0.8, 1.1), body, 0, pb + 0.37 * k, -0.3 * k);
  put(s, new THREE.SphereGeometry(0.4 * k, 8, 6).scale(1, 1.3, 0.9), body, 0, pb + 0.75 * k, 0.1 * k);
  put(s, new THREE.SphereGeometry(0.44 * k, 8, 6).scale(1.1, 1, 0.75), mane, 0, pb + 1.2 * k, 0.12 * k);
  put(s, new THREE.SphereGeometry(0.33 * k, 8, 6), body, 0, pb + 1.32 * k, 0.4 * k);
  for (const sx of [-1, 1]) s.add(column(0.1 * k, 0.7 * k, body, sx * 0.22 * k, pb, 0.45 * k, 6));
  if (male) put(s, new THREE.SphereGeometry(0.22 * k, 7, 5), body, -0.32 * k, pb + 0.22 * k, 0.6 * k); // tú cầu
  else {
    put(s, new THREE.SphereGeometry(0.18 * k, 6, 4).scale(1, 0.8, 1.2), body, 0.34 * k, pb + 0.16 * k, 0.55 * k); // sư tử con
    put(s, new THREE.SphereGeometry(0.12 * k, 6, 4), mane, 0.34 * k, pb + 0.34 * k, 0.68 * k);
  }
}

/** Sư tử (cặp): đực phía đông (+x), cái phía tây (−x); đá ở C2–C3, đồng ở C1 (`su-tu-dong` của Tử Cấm Thành). */
const suTuCap: Build = (g, _m, c, _giong, style) => {
  const [dong, tay] = capX(c.w, 0.7);
  const [body, mane] = c.cap <= 1 ? [style.bronze, '#3f4a42'] : [style.stone, style.base];
  suTu(g, dong, c.cot, true, body, mane, MARBLE);
  suTu(g, tay, c.cot, false, body, mane, MARBLE);
};

/* ---------------- hoa biểu 華表 (cặp) ---------------- */

/**
 * Một hoa biểu cao `cot`: bệ tu di vuông 2,4 m + lan can đá thấp quanh bệ, trụ bát giác đá trắng ∅ 1,2 có rồng cuốn
 * (ống xoắn 3 vòng), mây ngang 雲板 xuyên trụ, mâm 承露盤, con hống ngồi trên mâm nhìn ra (+z).
 */
function hoaBieu(g: THREE.Group, x: number, cot: number, style: Style): void {
  const s = new THREE.Group();
  s.position.x = x;
  g.add(s);
  const pb = 1.2;
  tuDi(s, 0, 0, 2.4, 2.4, 0, pb, style);
  // lan can quanh bệ: 4 trụ góc + thanh trên, thanh chân
  const R = 2.1;
  for (const [px, pz] of [[-R, -R], [R, -R], [-R, R], [R, R]] as const) s.add(box(0.26, 1.15, 0.26, MARBLE, px, 0.575, pz));
  for (const yy of [0.1, 0.9]) {
    for (const z of [-R, R]) s.add(box(2 * R, 0.16, 0.14, MARBLE, 0, yy, z));
    for (const xx of [-R, R]) s.add(box(0.14, 0.16, 2 * R - 0.3, MARBLE, xx, yy, 0));
  }
  const top = cot - 1.5; // mâm + hống 1,5 m
  const shaft = top - pb;
  s.add(new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, shaft, 8).translate(0, pb + shaft / 2, 0), lambert(MARBLE)));
  const helix = new THREE.CatmullRomCurve3(
    Array.from({ length: 25 }, (_, i) => {
      const t = i / 24;
      const a = t * Math.PI * 6;
      return new THREE.Vector3(Math.cos(a) * 0.66, pb + 0.5 + t * (shaft - 1.6), Math.sin(a) * 0.66);
    }),
  );
  s.add(new THREE.Mesh(new THREE.TubeGeometry(helix, 48, 0.15, 5), lambert(MARBLE_CARVE)));
  s.add(box(2.8, 0.7, 0.24, MARBLE_CARVE, 0, top - 1.2, 0)); // mây ngang
  put(s, new THREE.CylinderGeometry(0.95, 0.8, 0.3, 10), MARBLE, 0, top + 0.15, 0); // mâm
  put(s, new THREE.CylinderGeometry(0.35, 0.45, 0.35, 8), MARBLE, 0, top + 0.475, 0);
  put(s, new THREE.SphereGeometry(0.42, 8, 6).scale(0.9, 1, 1.1), MARBLE_CARVE, 0, top + 0.95, -0.05); // hống
  put(s, new THREE.SphereGeometry(0.24, 7, 5), MARBLE_CARVE, 0, top + 1.26, 0.25);
}

/** Hoa biểu (cặp) hai bên trục, cách nhau `w` − 2 × 2,2 m. */
const hoaBieuCap: Build = (g, _m, c, _giong, style) => {
  for (const x of capX(c.w, 2.2)) hoaBieu(g, x, c.cot, style);
};

/* ---------------- cột cờ 旗杆 (cặp) ---------------- */

/**
 * Một cột cờ cao `cot` tới đỉnh búp: đá kẹp chân 夾杆石 (hai phiến hai bên cột trên tấm đá nền), cột tròn (son ở C1–C4,
 * gỗ mộc C5–C6), đấu cờ 旗斗 ở 2 / 3 cao, xà ngang ở đỉnh treo phướn đỏ dài 5 m về phía ngoài (`out` = ±1), búp vàng.
 */
function cotCo(g: THREE.Group, x: number, cot: number, out: number, pole: string, style: Style): void {
  const s = new THREE.Group();
  s.position.x = x;
  g.add(s);
  s.add(box(1.5, 0.25, 1.5, style.base, 0, 0.125, 0));
  for (const sx of [-1, 1]) s.add(box(0.35, 1.8, 1.1, style.stone, sx * 0.36, 0.25 + 0.9, 0));
  const ph = cot - 0.5;
  s.add(column(0.17, ph, pole, 0, 0.25, 0, 8));
  s.add(box(0.75, 0.45, 0.75, pole, 0, cot * 0.66, 0));
  put(s, new THREE.ConeGeometry(0.2, 0.5, 6), style.gold, 0, cot - 0.25, 0); // búp: đỉnh đúng `cot`
  const yb = ph - 0.6;
  s.add(box(1.4, 0.1, 0.1, pole, out * 0.75, yb, 0));
  s.add(box(0.8, 5, 0.05, RED, out * 1.0, yb - 0.05 - 2.5, 0));
  s.add(box(0.86, 0.3, 0.07, style.gold, out * 1.0, yb - 0.05 - 5, 0)); // dải chân phướn
}

/** Cột cờ (cặp) ngoài cổng; phướn mỗi cột treo ra phía ngoài trục. */
const cotCoCap: Build = (g, _m, c, _giong, style) => {
  const pole = cotSon(c.cap) ? style.pillar : style.timber;
  const [dong, tay] = capX(c.w, 1.6);
  cotCo(g, dong, c.cot, 1, pole, style);
  cotCo(g, tay, c.cot, -1, pole, style);
};

/* ---------------- đống củi báo hiệu 積薪 ---------------- */

/** Bán kính một khúc củi (m). */
const LOG_R = 0.17;

/**
 * Số lớp củi xếp chồng để đống cao `h` (thuần — test): mỗi lớp lún 0,02 m vào lớp dưới, cộng búi lau trên nóc 0,3 m.
 */
export const lopCui = (h: number): number => Math.max(2, Math.round((h - 0.3) / (2 * LOG_R - 0.02)));

/**
 * Đống củi `w` × `d` × cao `cot`: lớp củi xếp chéo nhau (lớp chẵn dọc x, lẻ dọc z), mỗi lớp 4 khúc, búi lau khô trên nóc.
 * Màu đất sẫm / lau sậy của vật biên ải (`mau_bien.ts`) để gộp lần vẽ.
 */
const cuiBaoHieu: Build = (g, _m, c) => {
  const n = lopCui(c.cot);
  const step = 2 * LOG_R - 0.02;
  const mat = lambert(EARTH_DARK);
  const alongX = new THREE.CylinderGeometry(LOG_R, LOG_R, c.w, 6).rotateZ(Math.PI / 2);
  const alongZ = new THREE.CylinderGeometry(LOG_R, LOG_R, c.d, 6).rotateX(Math.PI / 2);
  for (let i = 0; i < n; i++) {
    const y = LOG_R + i * step;
    const even = i % 2 === 0;
    const span = even ? c.d : c.w;
    for (let k = 0; k < 4; k++) {
      const t = -span / 2 + LOG_R + (k * (span - 2 * LOG_R)) / 3;
      const m = new THREE.Mesh(even ? alongX : alongZ, mat);
      m.position.set(even ? 0 : t, y, even ? t : 0);
      g.add(m);
    }
  }
  const yTop = LOG_R + (n - 1) * step + LOG_R;
  put(g, new THREE.ConeGeometry(Math.min(c.w, c.d) * 0.32, c.cot - yTop + 0.02, 7), REED_LINE, 0, yTop - 0.02 + (c.cot - yTop + 0.02) / 2, 0);
};

/** Hàm dựng vật sân đợt 4 (phần 1) — `mau_nha.ts` gộp vào bảng chung. */
export const BUILD_VAT: Record<string, Build> = {
  'chieu-bich': chieuBich,
  'su-tu': suTuCap,
  'hoa-bieu': hoaBieuCap,
  'cot-co': cotCoCap,
  'cui-bao-hieu': cuiBaoHieu,
};
