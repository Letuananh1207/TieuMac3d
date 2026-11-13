/**
 * Chỗ ngồi chung cho nút nổi "Ngồi" (R-NGOI-1): ghế bàn chơi, án thư / bàn trà. Thuần — không three, không
 * DOM; `main.ts` gom chỗ ngồi từ cảnh + `gamePlay`, mỗi khung hỏi `seatInRange` để hiện / ẩn nút.
 */

/** `ban-choi` = ghế bàn chơi Kỳ Văn Uyển · `ngoi` = án thư, bàn trà … */
export type SeatKind = 'ban-choi' | 'ngoi';

/** Tầm hiện nút (m) theo loại chỗ (R-NGOI-1). */
export const SEAT_RANGE: Readonly<Record<SeatKind, number>> = { 'ban-choi': 1.5, ngoi: 1.2 };

/** Nhãn nút nổi theo loại chỗ (R-NGOI-1). */
export const SEAT_LABEL: Readonly<Record<SeatKind, string>> = { 'ban-choi': 'Vào bàn', ngoi: 'Ngồi' };

/** Lệch cao quá mức này (m) = khác tầng — không tính (R-VA-4). */
const FLOOR_GAP = 1;

export interface SeatSpot {
  x: number;
  /** độ cao chỗ ngồi; thiếu = không xét tầng */
  y?: number;
  z: number;
  /** hướng nhìn khi ngồi (radian) */
  rotY: number;
  kind: SeatKind;
}

/** Chỗ ngồi gần nhất trong tầm của chính nó, cùng tầng với chân nhân vật `y`; không có → `undefined`. */
export function seatInRange<T extends SeatSpot>(seats: readonly T[], x: number, z: number, y?: number): T | undefined {
  let best: T | undefined;
  let bestD = Infinity;
  for (const s of seats) {
    if (y !== undefined && s.y !== undefined && Math.abs(s.y - y) > FLOOR_GAP) continue;
    const d = Math.hypot(s.x - x, s.z - z);
    if (d < SEAT_RANGE[s.kind] && d < bestD) {
      best = s;
      bestD = d;
    }
  }
  return best;
}

/**
 * Chỗ ngồi gần nhất trong bán kính `r` cố định (không theo loại), không có → undefined. `y` = chân nhân vật: bỏ chỗ
 * ngồi khác tầng (lệch cao > 1 m — R-VA-4).
 */
export function nearestSeat<T extends { x: number; z: number; y?: number }>(
  seats: readonly T[],
  x: number,
  z: number,
  r = 1.2,
  y?: number,
): T | undefined {
  let best: T | undefined;
  let bestD = r;
  for (const s of seats) {
    if (y !== undefined && s.y !== undefined && Math.abs(s.y - y) > FLOOR_GAP) continue;
    const d = Math.hypot(s.x - x, s.z - z);
    if (d < bestD) {
      best = s;
      bestD = d;
    }
  }
  return best;
}
