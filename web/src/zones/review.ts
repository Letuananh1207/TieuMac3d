/**
 * Câu đố ôn bộ thủ (R-ON-2): mỗi bộ 2 câu Pinyin → Nghĩa, 3 phương án — đáp án + 2 lấy từ bộ khác, không trùng nhau.
 * Trang dựng câu đố, gửi Flutter qua `openReview` (docs/bridge.md); Flutter hiện màn ôn, chấm, lưu lịch ôn. Thuần, không
 * three, không DOM.
 */
import { RADICALS, type Radical } from './radicals';

/** Số phương án mỗi câu. */
export const REVIEW_OPTIONS = 3;

export interface ReviewQuestion {
  ask: 'pinyin' | 'meaning';
  options: string[];
  /** chỉ số đáp án trong `options` */
  answer: number;
}

export interface ReviewItem {
  radical: Radical;
  questions: ReviewQuestion[];
}

/** Chữ của một phương án: pinyin ("shuǐ"), hay âm Hán Việt — nghĩa ("thuỷ — nước", thiết kế 2026-11-13.25 màn ôn). */
export function optionText(ask: ReviewQuestion['ask'], r: Radical): string {
  return ask === 'pinyin' ? r.pinyin : `${r.name} — ${r.meaning}`;
}

/** Một câu hỏi `ask` về bộ `r`: 2 phương án nhiễu khác đáp án, khác nhau, lấy từ các bộ khác trong `pool`. */
export function reviewQuestion(
  ask: ReviewQuestion['ask'],
  r: Radical,
  pool: readonly Radical[] = RADICALS,
  rand: () => number = Math.random,
): ReviewQuestion {
  const right = optionText(ask, r);
  const others = [...new Set(pool.filter((x) => x.id !== r.id).map((x) => optionText(ask, x)))].filter((v) => v !== right);
  const picks: string[] = [];
  while (picks.length < REVIEW_OPTIONS - 1 && others.length) picks.push(others.splice(Math.floor(rand() * others.length), 1)[0]);
  const options = [...picks];
  const answer = Math.floor(rand() * (options.length + 1));
  options.splice(answer, 0, right);
  return { ask, options, answer };
}

/** Lượt ôn cho các bộ `due` (đã theo thứ tự hỏi — R-ON-4); mã lạ bị bỏ qua. */
export function reviewItems(
  due: readonly string[],
  pool: readonly Radical[] = RADICALS,
  rand: () => number = Math.random,
): ReviewItem[] {
  const byId = new Map(pool.map((r) => [r.id, r]));
  const out: ReviewItem[] = [];
  for (const id of due) {
    const r = byId.get(id);
    if (!r) continue;
    out.push({ radical: r, questions: [reviewQuestion('pinyin', r, pool, rand), reviewQuestion('meaning', r, pool, rand)] });
  }
  return out;
}
