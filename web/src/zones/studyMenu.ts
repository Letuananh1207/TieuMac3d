/**
 * Dữ liệu cuộn khi ngồi (R-ON-8, V-45): bảng chọn chức năng — **Đọc sách · Từ đã học · Nhiệm vụ hôm nay** (`scrollMenu`);
 * cuộn không có ôn / học bài mới (học ở thầy Trúc Lão — R-HANH-8, `zones/trucLao.ts`; ôn ở bảng nhiệm vụ — R-ON-5).
 * Cùng tính chấm son nút "Tĩnh toạ" (R-DIEU-7 — số từ đến hạn). Thuần, không three, không DOM.
 */
import { TU_VUNG, type Tu } from './tuVung/tu';

/** Mục trên cuộn khi ngồi (R-ON-8), theo thứ tự in. */
export type ScrollItemId = 'book' | 'learned' | 'daily';
export const SCROLL_ITEMS: readonly ScrollItemId[] = ['book', 'learned', 'daily'];

/** Vì sao mục mờ: chưa mượn sổ từ ("Mượn ở Tàng Thư Các") · chưa học từ nào ("Chưa học từ nào"). */
export type ScrollReason = 'noBook' | 'noneLearned';

export interface ScrollItem {
  id: ScrollItemId;
  enabled: boolean;
  reason: ScrollReason | null;
  /** learned: số từ đã học · daily: số việc còn hôm nay (`null` = không biết tiến độ) · book: 0 */
  count: number | null;
}

export interface ScrollInput {
  /** sổ từ đang mượn (R-SACH-1) — `null` = chưa mượn */
  book: { title: string; subtitle: string } | null;
  /** mã từ đã học */
  learned: Iterable<string>;
  /** số việc còn hôm nay (R-NV-1, `zones/dailyBoard.ts` `tasksLeft`); `null` = không biết (không có Flutter) */
  tasksLeft: number | null;
}

/** Ba mục của cuộn khi ngồi (R-ON-8): Đọc sách (mờ khi chưa mượn) · Từ đã học (mờ khi chưa học) · Nhiệm vụ hôm nay (luôn dùng được). */
export function scrollMenu(input: ScrollInput, pool: readonly Tu[] = TU_VUNG): ScrollItem[] {
  const known = new Set(pool.map((t) => t.id));
  const learned = new Set([...input.learned].filter((id) => known.has(id))).size;
  return [
    input.book ? { id: 'book', enabled: true, reason: null, count: 0 } : { id: 'book', enabled: false, reason: 'noBook', count: 0 },
    learned ? { id: 'learned', enabled: true, reason: null, count: learned } : { id: 'learned', enabled: false, reason: 'noneLearned', count: 0 },
    { id: 'daily', enabled: true, reason: null, count: input.tasksLeft },
  ];
}

/** Chấm son nút "Tĩnh toạ" (R-DIEU-7): số từ đến hạn. */
export interface SitBadge {
  n: number;
  kind: 'due';
}

/** Chấm son nút "Tĩnh toạ" (R-DIEU-7): số từ đến hạn ôn; không có → không chấm (`null`) — kể cả ở vùng có bài học. */
export function sitBadge(due: readonly string[], pool: readonly Tu[] = TU_VUNG): SitBadge | null {
  const known = new Set(pool.map((t) => t.id));
  const n = due.filter((id) => known.has(id)).length;
  return n ? { n, kind: 'due' } : null;
}
