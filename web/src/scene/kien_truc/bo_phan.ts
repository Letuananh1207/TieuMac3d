/**
 * Bộ phận dùng chung của bộ asset chuẩn (`danh_muc.ts`): nền (thường / tu di 1–3 tầng), thân nhà (cột theo gian, tường,
 * cửa, dải xà, đấu củng theo cấp). Mẫu nhà (`mau_nha.ts`) ghép từ đây + mái `mai_giong.ts`. Toạ độ hệ nhà, mặt trước +z.
 * Gọi lại `chi_tiet.ts` (bậc, lan can, cửa, dải xà) — không viết lại.
 */
import * as THREE from 'three';
import { addBeamBand, addDoors, addRailing, type Style } from './chi_tiet';
import { cotSon, nenCao, type Cap } from './danh_muc';
import { box, column } from './hinh';

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
