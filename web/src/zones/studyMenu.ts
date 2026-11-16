/**
 * Dữ liệu cuộn khi ngồi (R-ON-8, V-45): bảng chọn chức năng — **Đọc sách · Bộ đã học · Nhiệm vụ hôm nay** (`scrollMenu`);
 * cuộn không còn ôn / học bộ mới (học ở thầy Trúc Lão — R-HANH-8, `zones/trucLao.ts`; ôn ở bảng nhiệm vụ — R-ON-5).
 * Cùng tính chấm son nút "Ngồi ôn" (R-DIEU-7 — chỉ số bộ đến hạn). `studyMenu` cũ chỉ còn cho cầu nối `openStudy` (thôi
 * dùng — docs/bridge.md; Flutter vẫn đón, xoá sau khi thử máy). Thuần, không three, không DOM.
 */
import { RADICALS, type Radical } from './radicals';

export type StudyItemId = 'review' | 'learn' | 'learned';

/** Vì sao một mục mờ: ôn hết hôm nay · trấn không học bộ mới · học đủ · chưa học bộ nào (Ôn: "Chưa có bộ nào để ôn"). */
export type StudyReason = 'reviewedToday' | 'learnInRegion' | 'allLearned' | 'noneLearned';

export interface StudyItem {
  id: StudyItemId;
  enabled: boolean;
  reason: StudyReason | null;
  /** review: số bộ đến hạn · learn: số bộ chưa học (0 khi mờ) · learned: số bộ đã học */
  count: number;
}

export interface StudyMenu {
  items: StudyItem[];
  /** mục nổi bật: còn bộ đến hạn → ôn; không thì học bộ mới nếu dùng được */
  highlight: 'review' | 'learn' | null;
  /** bộ sẽ mở khi chọn "Học bộ mới" (bộ chưa học đầu tiên theo thứ tự Rừng trúc — R-HANH-3) */
  next: Radical | null;
  /** các bộ chưa học sau `next`, theo thứ tự Rừng trúc — Flutter học tiếp ngay trên bảng mà không cần trang gửi lại (rỗng khi `next` null) */
  upcoming: Radical[];
}

export interface StudyInput {
  /** mã bộ đến hạn ôn hôm nay (R-ON-4, theo thứ tự hỏi) */
  due: readonly string[];
  /** mã bộ đã học */
  learned: Iterable<string>;
  /** vùng có bài học bộ thủ (`spec.lessons.radicals`) — tông môn: false */
  hasLessons: boolean;
}

function counts(input: StudyInput, pool: readonly Radical[]) {
  const known = new Set(pool.map((r) => r.id));
  const learned = new Set([...input.learned].filter((id) => known.has(id)));
  const due = input.due.filter((id) => known.has(id)).length;
  const left = pool.filter((r) => !learned.has(r.id));
  return { due, learned: learned.size, left };
}

/** Bảng chọn của cuộn sách Ngồi ôn (R-ON-8). */
export function studyMenu(input: StudyInput, pool: readonly Radical[] = RADICALS): StudyMenu {
  const c = counts(input, pool);
  const review: StudyItem = c.due
    ? { id: 'review', enabled: true, reason: null, count: c.due }
    : { id: 'review', enabled: false, reason: c.learned ? 'reviewedToday' : 'noneLearned', count: 0 };
  const canLearn = input.hasLessons && c.left.length > 0;
  const learn: StudyItem = canLearn
    ? { id: 'learn', enabled: true, reason: null, count: c.left.length }
    : { id: 'learn', enabled: false, reason: input.hasLessons ? 'allLearned' : 'learnInRegion', count: 0 };
  const learned: StudyItem = c.learned
    ? { id: 'learned', enabled: true, reason: null, count: c.learned }
    : { id: 'learned', enabled: false, reason: 'noneLearned', count: 0 };
  const highlight = review.enabled ? 'review' : learn.enabled ? 'learn' : null;
  return { items: [review, learn, learned], highlight, next: canLearn ? c.left[0] : null, upcoming: canLearn ? c.left.slice(1) : [] };
}

/** Mục trên cuộn khi ngồi (R-ON-8), theo thứ tự in. */
export type ScrollItemId = 'book' | 'learned' | 'daily';
export const SCROLL_ITEMS: readonly ScrollItemId[] = ['book', 'learned', 'daily'];

/** Vì sao mục mờ: chưa mượn sổ từ ("Mượn ở Tàng Thư Các") · chưa học bộ nào ("Chưa học bộ nào"). */
export type ScrollReason = 'noBook' | 'noneLearned';

export interface ScrollItem {
  id: ScrollItemId;
  enabled: boolean;
  reason: ScrollReason | null;
  /** learned: số bộ đã học · daily: số việc còn hôm nay (`null` = không biết tiến độ) · book: 0 */
  count: number | null;
}

export interface ScrollInput {
  /** sổ từ đang mượn (R-SACH-1) — `null` = chưa mượn */
  book: { title: string; subtitle: string } | null;
  /** mã bộ đã học */
  learned: Iterable<string>;
  /** số việc còn hôm nay (R-NV-1, `zones/dailyBoard.ts` `tasksLeft`); `null` = không biết (không có Flutter) */
  tasksLeft: number | null;
}

/** Ba mục của cuộn khi ngồi (R-ON-8): Đọc sách (mờ khi chưa mượn) · Bộ đã học (mờ khi chưa học) · Nhiệm vụ hôm nay (luôn dùng được). */
export function scrollMenu(input: ScrollInput, pool: readonly Radical[] = RADICALS): ScrollItem[] {
  const known = new Set(pool.map((r) => r.id));
  const learned = new Set([...input.learned].filter((id) => known.has(id))).size;
  return [
    input.book ? { id: 'book', enabled: true, reason: null, count: 0 } : { id: 'book', enabled: false, reason: 'noBook', count: 0 },
    learned ? { id: 'learned', enabled: true, reason: null, count: learned } : { id: 'learned', enabled: false, reason: 'noneLearned', count: 0 },
    { id: 'daily', enabled: true, reason: null, count: input.tasksLeft },
  ];
}

/** Chấm son nút "Ngồi ôn" (R-DIEU-7): số bộ đến hạn. */
export interface SitBadge {
  n: number;
  kind: 'due';
}

/** Chấm son nút "Ngồi ôn" (R-DIEU-7): số bộ đến hạn ôn; không có → không chấm (`null`) — kể cả ở vùng có bài học. */
export function sitBadge(due: readonly string[], pool: readonly Radical[] = RADICALS): SitBadge | null {
  const known = new Set(pool.map((r) => r.id));
  const n = due.filter((id) => known.has(id)).length;
  return n ? { n, kind: 'due' } : null;
}
