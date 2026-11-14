/**
 * Tiếng mõ Lão Canh (R-AM-1, R-NPC-8): âm lượng theo khoảng cách, lệch tai trái / phải theo hướng camera, nhịp gõ + lúc
 * rao trong 12 s dừng đầu giờ. Thuần (không DOM, không Web Audio) — `ui/moSound.ts` phát, `townNpcs.ts` ghép.
 */
import { soTiengMo } from './gioVN';

/** Gần hơn chừng này (m) → đầy; xa từ `MO_SILENT` trở lên → không nghe. */
export const MO_FULL = 3;
export const MO_SILENT = 30;
/** Lệch tai tối đa (−1 trái … 1 phải). */
export const MO_PAN_MAX = 0.6;
/** Tiếng gõ đầu tiên sau đầu giờ (s), khoảng giữa hai tiếng (s). */
export const MO_FIRST = 1;
export const MO_GAP = 0.9;
/** Rao sau tiếng gõ cuối chừng này giây. */
export const RAO_AFTER = 0.7;

/** Âm lượng 0…1 theo khoảng cách (chỉ x, z): ≤ 3 m → 1, giảm đều, ≥ 30 m → 0. */
export function moVolume(dist: number): number {
  if (!(dist > MO_FULL)) return 1;
  if (dist >= MO_SILENT) return 0;
  return (MO_SILENT - dist) / (MO_SILENT - MO_FULL);
}

/**
 * Lệch tai: `right` = vectơ bên phải camera trên mặt đất (x, z), `dx, dz` = từ người nghe tới Lão Canh. Ông bên trái màn
 * hình → âm (tai trái), bên phải → dương; trước / sau mặt → 0.
 */
export function moPan(rightX: number, rightZ: number, dx: number, dz: number): number {
  const d = Math.hypot(dx, dz);
  const r = Math.hypot(rightX, rightZ);
  if (d < 1e-6 || r < 1e-6) return 0;
  return (MO_PAN_MAX * (rightX * dx + rightZ * dz)) / (d * r);
}

/** Lúc (giây tính từ đầu giờ) của từng tiếng gõ ở đầu giờ `h` — đêm số canh, ngày 3 tiếng (R-NPC-8). */
export function moStrikes(h: number): number[] {
  return Array.from({ length: soTiengMo(h) }, (_, i) => MO_FIRST + i * MO_GAP);
}

/** Lúc rao (giây từ đầu giờ) — sau tiếng gõ cuối. */
export function raoAt(h: number): number {
  const s = moStrikes(h);
  return s[s.length - 1] + RAO_AFTER;
}

/**
 * Các tiếng gõ rơi vào khoảng (`from`, `to`] giây trong giờ (lấy từ khung trước tới khung này). Khoảng quá dài (app vừa
 * về từ nền, khung bị lỡ) → không phát bù: chỉ nhận khi khung ngắn hơn `maxGap` s (R-AM-1).
 */
export function strikesBetween(h: number, from: number, to: number, maxGap = 0.5): number {
  if (!(to > from) || to - from > maxGap) return 0;
  return moStrikes(h).filter((t) => t > from && t <= to).length;
}
