/**
 * Cuộn sách Ngồi ôn (R-ON-8): ngồi ôn đủ 1 giây → bảng chọn 3 mục — ôn bộ đến hạn · học bộ mới · xem bộ đã học.
 * Trang dựng dữ liệu bảng từ tiến độ + vùng, gửi Flutter qua `openStudy` (docs/bridge.md); chuỗi hiển thị ở phía Flutter
 * theo mã `reason`. Cùng tính chấm son của nút "Ngồi ôn" (R-DIEU-7). Thuần, không three, không DOM.
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
  return { items: [review, learn, learned], highlight, next: canLearn ? c.left[0] : null };
}

/** Không có màn Flutter (trình duyệt): đến hạn → lượt ôn; không thì thẻ bộ mới nếu học được; còn lại không mở (R-ON-8). */
export function fallbackStudy(menu: StudyMenu): 'review' | 'learn' | null {
  return menu.highlight;
}

/** Chấm son nút "Ngồi ôn" (R-DIEU-7): số + loại — `due` = bộ đến hạn ôn, `new` = bộ chưa học (chỉ vùng có bài học). */
export interface SitBadge {
  n: number;
  kind: 'due' | 'new';
}

/** Chấm son nút "Ngồi ôn" (R-DIEU-7): số bộ đến hạn; không có thì ở vùng có bài học → số bộ chưa học; không chấm → null. */
export function sitBadge(input: StudyInput, pool: readonly Radical[] = RADICALS): SitBadge | null {
  const c = counts(input, pool);
  if (c.due) return { n: c.due, kind: 'due' };
  if (input.hasLessons && c.left.length) return { n: c.left.length, kind: 'new' };
  return null;
}
