/**
 * Bảng nhiệm vụ hằng ngày 日課榜 trong sân (R-NV-3): chỗ đứng bảng, tầm hiện nút "Xem bảng", số việc còn lại hôm nay
 * (chấm son trên nút — thiết kế 2026-11-13.25). Thuần, không three, không DOM.
 */

/** R-NV-3: đứng cách bảng dưới khoảng này (m) thì hiện nút "Xem bảng". */
export const BOARD_RANGE = 2.5;

/** R-NV-1: mục tiêu Lĩnh hội mỗi ngày (số bộ thủ mới). */
export const DAILY_NEW_GOAL = 3;

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

/** Số liệu đủ để vẽ bảng (cùng dạng `getProgress.daily`, docs/bridge.md). */
export interface DailyFull extends DailyCount {
  streak: number;
  best: number;
}

/** Nội dung bảng nhiệm vụ trên web (khi không có màn Flutter) — chữ theo thiết kế 2026-11-13.25 (`daily*`). */
export interface DailyBoardView {
  learn: { done: boolean; dots: number; count: string | null; sub: string };
  review: { done: boolean; left: number; sub: string };
  streak: number;
  best: number;
  allDone: boolean;
  footer: string;
}

/** R-NV-1/2/3: bảng hôm nay từ tiến độ; [learnedTotal] = tổng bộ đã học (0 → gợi ý bộ đầu tiên). */
export function dailyBoardView(d: DailyFull, allLearned: boolean, learnedTotal: number): DailyBoardView {
  const learnDone = allLearned || d.learned >= d.goal;
  const reviewDone = d.due <= 0;
  const allDone = learnDone && reviewDone;
  const learnSub = allLearned
    ? 'Đã học đủ 50 bộ thủ.'
    : learnDone
      ? `Đã học ${d.goal} bộ mới hôm nay.`
      : learnedTotal === 0
        ? `Học ${d.goal} bộ thủ mới. Tới Truyền Tống Đài → Rừng trúc, ngồi thiền để lĩnh hội bộ đầu tiên.`
        : `Học ${d.goal} bộ thủ mới. Ngồi thiền ở Rừng trúc để lĩnh hội bộ kế tiếp.`;
  const dots = Math.min(d.learned, d.goal);
  return {
    learn: { done: learnDone, dots, count: allLearned ? null : `${dots}/${d.goal}`, sub: learnSub },
    review: { done: reviewDone, left: Math.max(0, d.due), sub: reviewDone ? 'Không có bộ nào đến hạn.' : `Còn ${d.due} bộ đến hạn hôm nay.` },
    streak: d.streak,
    best: d.best,
    allDone,
    footer: allDone
      ? 'Hôm nay đã xong — ngày được tính vào chuỗi.'
      : d.streak > 0
        ? `Hôm nay chưa xong — chuỗi vẫn giữ ${d.streak} tới hết ngày.`
        : 'Xong cả 2 việc hôm nay để bắt đầu chuỗi.',
  };
}
