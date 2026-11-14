/**
 * Bộ phận dùng chung của bộ asset chuẩn (`danh_muc.ts`): nền (thường / tu di 1–3 tầng), thân nhà (cột theo gian, tường,
 * cửa, dải xà, đấu củng theo cấp). Mẫu nhà (`mau_nha.ts`) ghép từ đây + mái `mai_giong.ts`. Toạ độ hệ nhà, mặt trước +z.
 * Gọi lại `chi_tiet.ts` (bậc, lan can, cửa, dải xà) — không viết lại.
 */
import * as THREE from 'three';
import { lambert } from '../materials';
import { addBeamBand, addDoors, addRailing, type Style } from './chi_tiet';
import { cotSon, nenCao, type Cap, type CoMau, type Giong, type Mau } from './danh_muc';
import { box, column } from './hinh';

/** Hàm dựng một mẫu ở một cỡ, một giọng vào nhóm `g` (mẫu đợt 1: `mau_nha.ts`; đợt 2: `mau_nha_2.ts`, `mau_bien.ts`). */
export type Build = (g: THREE.Group, m: Mau, c: CoMau, giong: Giong, style: Style) => void;

/** Gạch xám Minh (Trường Thành), đá viền, lỗ tối — dùng chung với vật biên ải cũ (`vat_bien_ai.ts`) để gộp cùng màu. */
export const GACH = { brick: '#6a6e69', brickDark: '#5a5e59', cap: '#8a8a82', dark: '#24282a' };

/**
 * Cửa vòm tối dán trước một mặt: tâm `x`, đáy `y`, mặt phẳng ở `z` (đã cộng 2 cm ra ngoài mặt tường để không trùng mặt),
 * rộng `w`, cao `h`; `ry` xoay theo mặt (0 = mặt +z, π = mặt −z, ±π/2 = mặt ±x).
 */
export function cuaVom(g: THREE.Object3D, x: number, y: number, z: number, w: number, h: number, ry = 0): void {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(-w / 2, h - w / 2);
  s.absarc(0, h - w / 2, w / 2, Math.PI, 0, true);
  s.lineTo(w / 2, 0);
  s.closePath();
  const m = new THREE.Mesh(new THREE.ShapeGeometry(s, 5), lambert(GACH.dark));
  m.position.set(x, y, z);
  m.rotation.y = ry;
  g.add(m);
}

/**
 * Răng cưa (đoạ khẩu 垛口) quanh mép một mặt bằng `w` × `d` ở độ cao `y`: răng 1 × 1,1 × 0,5 m cách nhau ~2 m, mặt ngoài
 * lùi `inset` so với mép (để không trùng mặt đá viền / thân).
 */
export function rangCua(g: THREE.Object3D, w: number, d: number, y: number, color: string, inset = 0.1): void {
  const mat = lambert(color);
  const side = (len: number, fixed: number, alongX: boolean): void => {
    const n = Math.max(2, Math.round(len / 2));
    const geo = alongX ? new THREE.BoxGeometry(1, 1.1, 0.5) : new THREE.BoxGeometry(0.5, 1.1, 1);
    for (let i = 0; i < n; i++) {
      const t = -len / 2 + 0.5 + (i * (len - 1)) / (n - 1);
      for (const s of [-1, 1]) {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(alongX ? t : s * fixed, y + 0.55, alongX ? s * fixed : t);
        g.add(m);
      }
    }
  };
  side(w - 2 * inset, d / 2 - inset - 0.25, true);
  side(d - 2 * inset - 1, w / 2 - inset - 0.25, false);
}

/** Tỉ lệ các lớp bệ tu di (《清式營造則例》, chia 51 phần): đế 圭角 + 下枋 · eo 下梟 + 束腰 + 上梟 · mặt 上枋. */
const TU_DI = { de: 18 / 51, eo: 24 / 51, mat: 9 / 51 };
/** Mỗi tầng nền tu di thu vào bao nhiêu mét mỗi bên (Tam Đài). */
const TIER_IN = 2;
const RISE = 0.18;

/**
 * Nền theo cấp dưới thân `w` × `d` (đã cộng lề `margin` mỗi bên): C1 tu di 3 tầng, C2 tu di 1 tầng, còn lại khối đá.
 * Bậc giữa mặt trước (rộng `stepW`), lan can đá khi nền cao ≥ 1 m. Trả về độ cao mặt nền.
 */
export function nen(g: THREE.Group, w: number, d: number, cap: Cap, style: Style, margin = 1, stepW = 4): number {
  const { cao, tuDi } = nenCao(cap);
  if (cao <= 0) return 0;
  const tiers = Math.max(1, tuDi);
  const th = cao / tiers;
  let y = 0;
  for (let t = 0; t < tiers; t++) {
    const inset = (tiers - 1 - t) * TIER_IN; // tầng dưới rộng nhất
    const pw = w + 2 * margin + 2 * inset;
    const pd = d + 2 * margin + 2 * inset;
    if (tuDi > 0) {
      g.add(box(pw, th * TU_DI.de, pd, style.base, 0, y + (th * TU_DI.de) / 2, 0));
      g.add(box(pw - 0.5, th * TU_DI.eo, pd - 0.5, style.stone, 0, y + th * (TU_DI.de + TU_DI.eo / 2), 0));
      g.add(box(pw + 0.1, th * TU_DI.mat, pd + 0.1, style.base, 0, y + th * (1 - TU_DI.mat / 2), 0));
    } else {
      g.add(box(pw, th, pd, style.base, 0, y + th / 2, 0));
    }
    // bậc: mỗi tầng một dải bậc giữa mặt trước, cao dần tới mặt tầng
    const steps = Math.max(2, Math.round(th / RISE));
    for (let i = 0; i < steps; i++) {
      const sh = (th * (steps - i)) / steps;
      g.add(box(stepW, sh, 0.32, style.base, 0, y + sh / 2, pd / 2 + 0.16 + i * 0.32));
    }
    y += th;
    if (cao >= 1) addRailing(g, pw, pd, y, stepW + 0.4, style);
  }
  return y;
}

/** Vị trí cột theo `gian` gian trên bề rộng `w`: gian giữa rộng nhất, gian phụ = 0,8 × gian giữa (lẻ / chẵn đều được). */
export function cotTheoGian(w: number, gian: number): number[] {
  const n = Math.max(1, gian);
  const widths = Array.from({ length: n }, (_, i) => {
    const mid = (n - 1) / 2;
    return Math.abs(i - mid) < 0.6 ? 1 : 0.8;
  });
  const sum = widths.reduce((a, b) => a + b, 0);
  const xs = [-w / 2];
  for (const wi of widths) xs.push(xs[xs.length - 1] + (wi / sum) * w);
  return xs;
}

export interface ThanInput {
  w: number;
  d: number;
  /** chân cột (mặt nền / sàn tầng) */
  y0: number;
  cot: number;
  gian: number;
  cap: Cap;
  /** `vach`: tường vôi kín + cửa bức bàn mặt trước · `mo`: chỉ cột (đình, thuỷ tạ, tầng trên) */
  kieu: 'vach' | 'mo';
}

/**
 * Thân một tầng: cột quanh mép theo gian (son từ C4, gỗ mộc C5–C6), tường lùi vào 0,4 m + cửa giữa (kiểu `vach`), dải xà
 * (C1–C4 xà vẽ lục – lam – chấm vàng, C5 dải gỗ), đấu củng (C1–C3: dải khối sẫm dưới hiên). Trả về độ cao chân mái.
 */
export function than(g: THREE.Group, o: ThanInput, style: Style): number {
  const pillar = cotSon(o.cap) ? style.pillar : style.timber;
  const xs = cotTheoGian(o.w, o.gian);
  const r = Math.max(0.12, o.cot / 22);
  const zs = [-o.d / 2 + r, o.d / 2 - r];
  for (const x of xs) for (const z of zs) g.add(column(r, o.cot, pillar, x, o.y0, z));
  // cột hồi (giữa hai đầu) khi nhà sâu
  if (o.d > 7) for (const x of [xs[0], xs[xs.length - 1]]) g.add(column(r, o.cot, pillar, x, o.y0, 0));
  if (o.kieu === 'vach') {
    const iw = o.w - 0.8;
    const id = o.d - 0.8;
    g.add(box(iw, o.cot, id, style.wall, 0, o.y0 + o.cot / 2, 0));
    const inner = xs.map((x) => x * (iw / o.w));
    addDoors(g, inner, o.y0, o.cot, id / 2 + 0.07, style, Math.min(3, o.gian));
  }
  let y = o.y0 + o.cot;
  if (o.cap <= 4) {
    addBeamBand(g, o.w, o.d, y, style);
    y += 0.5;
  } else {
    g.add(box(o.w + 0.2, 0.3, o.d + 0.2, style.timber, 0, y + 0.15, 0));
    y += 0.3;
  }
  if (o.cap <= 3) {
    // đấu củng: dải khối sẫm nhô ra dưới hiên — "nặng" dưới mái
    const h = o.cap === 1 ? 0.8 : 0.55;
    g.add(box(o.w + 0.9, h, o.d + 0.9, style.timber, 0, y + h / 2, 0));
    y += h;
  }
  return y;
}
