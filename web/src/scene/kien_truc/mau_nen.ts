/**
 * Nền, lan can, bậc — phần nối đợt 3 của bộ asset chuẩn (`danh_muc_dot3.ts`). Nền thường gọi lại `nen` (`bo_phan.ts`);
 * bệ tu di dựng đủ 6 lớp theo tỉ lệ 51 phần (`TU_DI_51`); Tam Đài hình chữ 土 3 tầng; lan can gỗ / đá trắng / đá chạm
 * có đầu 螭首; bậc 如意 (3 mặt) · 垂帶 (đá xiên hai bên) · 御路 (phiến giữa). Bậc 0,15 × 0,32, lan can 0,9 / 1,1 — cỡ
 * người, không nhân K. Toạ độ hệ mẫu, mặt trước +z. Dùng cho Catalog 3D; map chuyển sang ở GĐ 5.
 */
import * as THREE from 'three';
import { nen as nenThuong, type Build } from './bo_phan';
import type { Style } from './chi_tiet';
import { box, frustum } from './hinh';

const MARBLE = '#e6e2d6';
/** Phiến chạm nổi trên lan can đá / phiến 御路 — đá trắng sẫm hơn một chút. */
const MARBLE_CARVE = '#d3cdbf';

/* ---------------- tu di 須彌座 ---------------- */

/**
 * Bệ tu di chia 51 phần (《清式營造則例》), dưới → trên: 圭角 10 · 下枋 8 · 下梟 7 · 束腰 10 · 上梟 7 · 上枋 9.
 * `TU_DI_LUI` = mỗi lớp lùi vào bao nhiêu mét so với mép (梟 là mặt xiên giữa hai lớp kề).
 */
export const TU_DI_51 = [10, 8, 7, 10, 7, 9] as const;
const TU_DI_LUI = [0, 0.08, 0, 0.32, 0, -0.04];

/** Độ cao từng lớp tu di của bệ cao `h` (thuần — test). */
export const lopTuDi = (h: number): number[] => TU_DI_51.map((p) => (p / 51) * h);

/** Một bệ tu di hình chữ nhật `w` × `d` tâm (x, z), đáy `y`, cao `h`: 6 lớp, hai lớp 梟 là chóp cụt xiên. */
function tuDi(g: THREE.Group, x: number, z: number, w: number, d: number, y: number, h: number, style: Style): void {
  const hs = lopTuDi(h);
  const mats = [style.base, style.base, style.stone, style.stone, style.stone, style.base];
  let yy = y;
  hs.forEach((lh, i) => {
    if (i === 2 || i === 4) {
      // 梟: từ lớp dưới (lùi a) lên lớp trên (lùi b)
      const a = TU_DI_LUI[i - 1];
      const b = TU_DI_LUI[i + 1];
      const m = new THREE.Mesh(frustum(w - 2 * a, d - 2 * a, w - 2 * b, d - 2 * b, lh), new THREE.MeshLambertMaterial({ color: mats[i] }));
      m.position.set(x, yy, z);
      g.add(m);
    } else {
      const lui = TU_DI_LUI[i];
      g.add(box(w - 2 * lui, lh, d - 2 * lui, mats[i], x, yy + lh / 2, z));
    }
    yy += lh;
  });
}

/* ---------------- bậc 踏跺 ---------------- */

export const BAC = { cao: 0.15, sau: 0.32 };

/** Số bậc + cao mỗi bậc cho nền cao `h` (thuần — test): bậc gần 0,15 nhất. */
export function soBac(h: number): { n: number; rise: number } {
  const n = Math.max(1, Math.round(h / BAC.cao));
  return { n, rise: h / n };
}

/** Khối đá xiên (垂帶 / 御路) rộng `w` tâm x: tam giác từ mép nền (z0, cao h) xuống đất ở z0 + `len`, nhô trên mũi bậc `lift`. */
function xien(g: THREE.Group, x: number, w: number, z0: number, len: number, h: number, lift: number, color: string, y0: number): void {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0, h + lift);
  s.lineTo(len, lift);
  s.lineTo(len, 0);
  s.closePath();
  // hình vẽ trong mặt xy (x hình = z cục bộ) → quay để hình nằm trong mặt zy, đùn theo x
  const geo = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false }).rotateY(-Math.PI / 2).translate(x + w / 2, y0, z0);
  g.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color })));
}

export type KieuBac = 'nhu-y' | 'chui-dai' | 'ngu-lo';

/**
 * Bậc lên nền cao `h` trước mặt z = `z0`, đi ra +z, lối rộng `W` tâm x = 0. `nhu-y` 如意: mỗi bậc vòng ba mặt (rộng ra hai
 * bên) · `chui-dai` 垂帶: một dải bậc giữa hai khối đá xiên · `ngu-lo` 御路: hai dải bậc kẹp phiến đá xiên giữa (rộng
 * 0,35 × W) + 垂帶 hai bên ngoài. Chân bậc ở `y0` (bậc tầng trên Tam Đài). Trả về độ dài bậc theo z.
 */
export function bac(g: THREE.Group, kieu: KieuBac, W: number, h: number, z0: number, style: Style, y0 = 0): number {
  const { n, rise } = soBac(h);
  const T = BAC.sau;
  const step = (x: number, w: number, k: number, grow: number): void => {
    const depth = (n - k) * T;
    g.add(box(w + 2 * grow * depth, k * rise, depth, style.base, x, y0 + (k * rise) / 2, z0 + depth / 2));
  };
  const len = (n - 1) * T + T;
  if (kieu === 'nhu-y') {
    for (let k = 1; k < n; k++) step(0, W, k, 1);
    return (n - 1) * T;
  }
  const side = 0.45;
  if (kieu === 'chui-dai') {
    for (let k = 1; k < n; k++) step(0, W, k, 0);
  } else {
    const mid = W * 0.35;
    const fw = (W - mid) / 2;
    for (const s of [-1, 1]) for (let k = 1; k < n; k++) step(s * (mid / 2 + fw / 2), fw, k, 0);
    xien(g, 0, mid, z0, len, h, 0.04, MARBLE_CARVE, y0);
  }
  for (const s of [-1, 1]) xien(g, s * (W / 2 + side / 2), side, z0, len, h, 0.12, style.stone, y0);
  return len;
}

/* ---------------- lan can 欄杆 ---------------- */

export type KieuLanCan = 'go' | 'da' | 'cham';

/**
 * Một đoạn lan can thẳng trục từ (x0, z0) tới (x1, z1) ở mặt `y`, cao `h`. `go`: trụ gỗ 0,12 cách ~1,6 m, ba thanh
 * ngang, song đứng · `da` 尋杖欄杆: đế, trụ vọng 望柱 cách 1,9 m (mũ cao 0,25), tấm lan bản 欄板, bình đỡ, tay vịn ·
 * `cham`: như `da` + phiến chạm nổi trên tấm, mũ trụ to; `chiThu` (mặt ngoài +1 / −1 theo pháp tuyến) thêm đầu 螭首 nhô
 * ra dưới mỗi trụ (ở `y` − 0,2).
 */
export function lanCan(g: THREE.Group, kieu: KieuLanCan, a: [number, number], b: [number, number], y: number, h: number, style: Style, chiThu = 0): void {
  const alongX = a[1] === b[1];
  const len = Math.abs(alongX ? b[0] - a[0] : b[1] - a[1]);
  const cx = (a[0] + b[0]) / 2;
  const cz = (a[1] + b[1]) / 2;
  const run = (l: number, hh: number, t: number, yc: number, color: string, at = 0): void =>
    void g.add(alongX ? box(l, hh, t, color, cx + at, yc, cz) : box(t, hh, l, color, cx, yc, cz + at));
  const post = (at: number, pw: number, ph: number, color: string, y0 = y): void =>
    void g.add(alongX ? box(pw, ph, pw, color, cx + at, y0 + ph / 2, cz) : box(pw, ph, pw, color, cx, y0 + ph / 2, cz + at));
  if (kieu === 'go') {
    const n = Math.max(1, Math.round(len / 1.6));
    for (let i = 0; i <= n; i++) post(-len / 2 + (i * len) / n, 0.12, h + 0.08, style.timber);
    for (const yy of [0.12, h * 0.55, h - 0.05]) run(len, 0.07, 0.08, y + yy, style.timber);
    const bars = Math.round(len / 0.3);
    for (let i = 1; i < bars; i++) {
      const at = -len / 2 + (i * len) / bars;
      g.add(alongX ? box(0.04, h * 0.43, 0.04, style.timber, cx + at, y + 0.12 + h * 0.215, cz) : box(0.04, h * 0.43, 0.04, style.timber, cx, y + 0.12 + h * 0.215, cz + at));
    }
    return;
  }
  const cham = kieu === 'cham';
  run(len + 0.3, 0.12, 0.3, y + 0.06, MARBLE); // đế
  const n = Math.max(1, Math.round(len / 1.9));
  for (let i = 0; i <= n; i++) {
    const at = -len / 2 + (i * len) / n;
    post(at, 0.24, h, MARBLE);
    post(at, cham ? 0.3 : 0.2, 0.25, cham ? MARBLE_CARVE : MARBLE, y + h);
    if (chiThu) {
      // 螭首: đầu rồng nhô khỏi mép nền dưới chân trụ (góc to hơn)
      const corner = i === 0 || i === n;
      const s = corner ? 0.34 : 0.22;
      const out = corner ? 0.9 : 0.65;
      const [px, pz] = alongX ? [cx + at, cz + chiThu * (out / 2)] : [cx + chiThu * (out / 2), cz + at];
      g.add(alongX ? box(s, s, out, MARBLE, px, y - 0.2, pz) : box(out, s, s, MARBLE, px, y - 0.2, pz));
    }
  }
  const panel = h * 0.52;
  run(len, panel, 0.14, y + 0.12 + panel / 2, MARBLE);
  if (cham) run(len - 0.3, panel * 0.55, 0.18, y + 0.12 + panel / 2, MARBLE_CARVE);
  run(len, 0.12, 0.18, y + h - 0.12, MARBLE); // tay vịn 尋杖
  const vases = n; // một bình đỡ 淨瓶 giữa mỗi mô-đun (Tam Đài dài ≈ 400 m lan can — giữ dưới ngân sách C1)
  for (let i = 0; i < vases; i++) {
    const at = -len / 2 + ((i + 0.5) * len) / vases;
    const vh = h - 0.18 - (0.12 + panel);
    g.add(alongX ? box(0.12, vh, 0.12, MARBLE, cx + at, y + 0.12 + panel + vh / 2, cz) : box(0.12, vh, 0.12, MARBLE, cx, y + 0.12 + panel + vh / 2, cz + at));
  }
}

/* ---------------- mẫu ---------------- */

/** Tam Đài chữ 土 (tầng dưới cùng): khối trước, eo, khối sau — rộng × sâu (m). */
const THO = { truoc: [30, 20], eo: [14, 6], sau: [24, 12] } as const;
/** Mỗi tầng trên lùi vào: hai bên + sau 2 m, mặt trước 4,5 m (chỗ cho bậc 御路 của tầng trên). */
const LUI = { ben: 2, truoc: 4.5 };

interface Khoi {
  hw: number;
  z0: number;
  z1: number;
}

/** Ba khối chữ 土 của tầng `t` (0 = dưới), toạ độ z tuyệt đối (mặt trước khối trước ở +z). */
export function khoiTho(t: number, d: number): { truoc: Khoi; eo: Khoi; sau: Khoi } {
  const front = d / 2 - t * LUI.truoc;
  const back = -d / 2 + t * LUI.ben;
  const tz0 = d / 2 - THO.truoc[1];
  const sz1 = -d / 2 + THO.sau[1];
  return {
    truoc: { hw: THO.truoc[0] / 2 - t * LUI.ben, z0: tz0 + t * LUI.ben, z1: front },
    eo: { hw: THO.eo[0] / 2 - t * LUI.ben, z0: sz1 - t * LUI.ben, z1: tz0 + t * LUI.ben },
    sau: { hw: THO.sau[0] / 2 - t * LUI.ben, z0: back, z1: sz1 - t * LUI.ben },
  };
}

/** Viền ngoài ba khối chữ 土 (đoạn thẳng trục, bỏ chỗ khối chạm nhau), chừa lối `gap` giữa mặt trước. */
function vienTho(k: ReturnType<typeof khoiTho>, inset: number, gap: number): [[number, number], [number, number]][] {
  const { truoc: A, eo: S, sau: B } = k;
  const segs: [[number, number], [number, number]][] = [];
  const ax = A.hw - inset;
  const sx = S.hw - inset;
  const bx = B.hw - inset;
  for (const s of [-1, 1]) {
    segs.push([[s * (gap / 2), A.z1 - inset], [s * ax, A.z1 - inset]]); // mặt trước, hai bên lối
    segs.push([[s * ax, A.z0 + inset], [s * ax, A.z1 - inset]]); // hồi khối trước
    segs.push([[s * sx, A.z0 + inset], [s * ax, A.z0 + inset]]); // sau khối trước
    segs.push([[s * sx, S.z0 - inset], [s * sx, S.z1 + inset]]); // hồi eo
    segs.push([[s * sx, B.z1 - inset], [s * bx, B.z1 - inset]]); // trước khối sau
    segs.push([[s * bx, B.z0 + inset], [s * bx, B.z1 - inset]]); // hồi khối sau
  }
  segs.push([[-bx, B.z0 + inset], [bx, B.z0 + inset]]);
  return segs;
}

/**
 * Nền: S nền thường theo cấp (`nen` — C3 đá 1,2 m, bậc, lan can) · M tu di 1 tầng cao `cot` + bậc 垂帶 + lan can đá ·
 * L Tam Đài chữ 土: 3 tầng tu di (mỗi tầng `cot` / 3), lan can đá quanh mép từng tầng, bậc 御路 giữa mặt trước mỗi tầng.
 */
const nenMau: Build = (g, _m, c, _giong, style) => {
  if (c.cap >= 3) {
    nenThuong(g, c.w - 2, c.d - 2, c.cap, style, 1, 4);
    return;
  }
  if (c.bien !== 'chu-tho') {
    tuDi(g, 0, 0, c.w, c.d, 0, c.cot, style);
    bac(g, 'chui-dai', 4, c.cot, c.d / 2, style);
    for (const [a, b] of [
      [[-c.w / 2 + 0.2, c.d / 2 - 0.2], [-2.6, c.d / 2 - 0.2]],
      [[2.6, c.d / 2 - 0.2], [c.w / 2 - 0.2, c.d / 2 - 0.2]],
      [[-c.w / 2 + 0.2, -c.d / 2 + 0.2], [c.w / 2 - 0.2, -c.d / 2 + 0.2]],
      [[-c.w / 2 + 0.2, -c.d / 2 + 0.2], [-c.w / 2 + 0.2, c.d / 2 - 0.2]],
      [[c.w / 2 - 0.2, -c.d / 2 + 0.2], [c.w / 2 - 0.2, c.d / 2 - 0.2]],
    ] as [[number, number], [number, number]][])
      lanCan(g, 'da', a, b, c.cot, 1.1, style);
    return;
  }
  const th = c.cot / 3;
  for (let t = 0; t < 3; t++) {
    const k = khoiTho(t, c.d);
    const y = t * th;
    for (const q of [k.truoc, k.eo, k.sau]) {
      // khối eo chồng vào hai khối kề 0,5 m cho kín mối nối
      const z0 = q === k.eo ? q.z0 - 0.5 : q.z0;
      const z1 = q === k.eo ? q.z1 + 0.5 : q.z1;
      tuDi(g, 0, (z0 + z1) / 2, 2 * q.hw, z1 - z0, y, th, style);
    }
    bac(g, 'ngu-lo', 7, th, k.truoc.z1, style, y);
    for (const [a, b] of vienTho(k, 0.2, 7.9)) lanCan(g, 'da', a, b, y + th, 1.1, style);
  }
};

/**
 * Lan can: một đoạn dài `w` dọc mép trước + một đoạn hồi bên phải (thấy góc) trên khối nền sâu `d`. S gỗ cao 0,9 trên
 * sàn gỗ 0,6 · M đá trắng 1,1 trên nền đá 1,2 · L đá chạm + 螭首 trên tu di 2 m (C1–C2).
 */
const lanCanMau: Build = (g, _m, c, _giong, style) => {
  const kieu: KieuLanCan = c.cap >= 4 ? 'go' : c.cap === 3 ? 'da' : 'cham';
  const y = kieu === 'go' ? 0.6 : kieu === 'da' ? 1.2 : 2;
  const W = c.w + 0.6;
  if (kieu === 'cham') tuDi(g, 0, 0, W, c.d, 0, y, style);
  else g.add(box(W, y, c.d, kieu === 'go' ? style.floor : style.base, 0, y / 2, 0));
  const zf = c.d / 2 - 0.2;
  const xr = c.w / 2;
  lanCan(g, kieu, [-xr, zf], [xr, zf], y, c.cot, style, kieu === 'cham' ? 1 : 0);
  lanCan(g, kieu, [xr, -c.d / 2 + 0.2], [xr, zf], y, c.cot, style, kieu === 'cham' ? 1 : 0);
};

/** Bậc: khối nền rộng `w` + 4, sâu `d`, cao `cot` (L là tu di) và bậc kiểu `bien` giữa mặt trước. */
const bacMau: Build = (g, _m, c, _giong, style) => {
  const W = c.w + 4;
  if (c.cap <= 2) tuDi(g, 0, 0, W, c.d, 0, c.cot, style);
  else g.add(box(W, c.cot, c.d, style.base, 0, c.cot / 2, 0));
  bac(g, (c.bien ?? 'nhu-y') as KieuBac, c.w, c.cot, c.d / 2, style);
};

/** Hàm dựng nền / lan can / bậc đợt 3 — `mau_nha.ts` gộp vào bảng chung. */
export const BUILD_NEN: Record<string, Build> = {
  nen: nenMau,
  'lan-can': lanCanMau,
  bac: bacMau,
};
