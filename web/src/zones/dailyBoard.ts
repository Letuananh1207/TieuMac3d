/**
 * Bảng nhiệm vụ hằng ngày 日課榜 trong sân (R-NV-3): chỗ đứng bảng, tầm hiện nút "Xem bảng", số việc còn lại hôm nay
 * (chấm son trên nút — thiết kế 2026-11-13.25). Thuần, không three, không DOM.
 */

/** R-NV-3: đứng cách bảng dưới khoảng này (m) thì hiện nút "Xem bảng". */
export const BOARD_RANGE = 2.5;

/** Tiêu đề của bảng nhiệm vụ (prop `bang`). */
export const DAILY_BOARD_TEXT = '日課榜';

/** Vật trong đặc tả cảnh (cùng dạng `PropSpec` của `scene/spec.ts` — zones không import scene). */
export interface PropLike {
  kind: string;
  x: number;
  z: number;
  text?: string;
}

/** Hai việc hôm nay, cùng dạng `getProgress.daily` (docs/bridge.md). */
export interface DailyCount {
  learned: number;
  goal: number;
  due: number;
}

/** Bảng nhiệm vụ trong đặc tả cảnh: prop `bang` ghi 日課榜 (không có → bảng `bang` duy nhất); không có → `null`. */
export function dailyBoardSpot(props: readonly PropLike[]): { x: number; z: number } | null {
  const boards = props.filter((p) => p.kind === 'bang');
  const b = boards.find((p) => p.text === DAILY_BOARD_TEXT) ?? (boards.length === 1 ? boards[0] : undefined);
  return b ? { x: b.x, z: b.z } : null;
}

/** Đứng trong tầm nút "Xem bảng" (dưới [BOARD_RANGE] m, R-NV-3). */
export function nearBoard(board: { x: number; z: number }, x: number, z: number): boolean {
  return Math.hypot(x - board.x, z - board.z) < BOARD_RANGE;
}

/**
 * Số việc còn lại hôm nay (0 · 1 · 2 — R-NV-1): Lĩnh hội chưa đủ mục tiêu (trừ khi đã học hết bộ thủ), Ôn tập còn bộ
 * đến hạn. Không biết tiến độ (không có Flutter) → `null` (nút không có chấm).
 */
export function tasksLeft(d: DailyCount | null, allLearned: boolean): number | null {
  if (!d) return null;
  return (allLearned || d.learned >= d.goal ? 0 : 1) + (d.due > 0 ? 1 : 0);
}
