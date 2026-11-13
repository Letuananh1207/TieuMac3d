import { describe, expect, it } from 'vitest';
import { RADICALS } from './radicals';
import { optionText, REVIEW_OPTIONS, reviewItems } from './review';

/** Số giả ngẫu nhiên có hạt — test lặp lại được. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('Ôn tập — câu đố', () => {
  it('R-ON-2: mỗi bộ 2 câu Pinyin → Nghĩa, 3 phương án khác nhau, đúng một đáp án, nhiễu lấy từ bộ khác', () => {
    const ids = RADICALS.map((r) => r.id);
    for (let seed = 1; seed <= 30; seed++) {
      const items = reviewItems(ids, RADICALS, seeded(seed));
      expect(items).toHaveLength(RADICALS.length);
      for (const it of items) {
        expect(it.questions.map((q) => q.ask)).toEqual(['pinyin', 'meaning']);
        for (const q of it.questions) {
          expect(q.options).toHaveLength(REVIEW_OPTIONS);
          expect(new Set(q.options).size).toBe(REVIEW_OPTIONS);
          expect(q.options[q.answer]).toBe(optionText(q.ask, it.radical));
          for (const [i, o] of q.options.entries()) {
            if (i !== q.answer) expect(RADICALS.some((r) => r.id !== it.radical.id && optionText(q.ask, r) === o)).toBe(true);
          }
        }
      }
    }
  });

  it('R-ON-4: giữ thứ tự hỏi Flutter gửi, bỏ mã lạ', () => {
    expect(reviewItems(['moc', 'khong-co', 'truc']).map((x) => x.radical.id)).toEqual(['moc', 'truc']);
  });
});

describe('Ôn tập — chữ phương án (thiết kế 2026-11-13.25)', () => {
  it('pinyin giữ nguyên; nghĩa = "âm Hán Việt — nghĩa"', () => {
    const thuy = RADICALS.find((r) => r.id === 'thuy');
    expect(thuy).toBeDefined();
    expect(optionText('pinyin', thuy!)).toBe(thuy!.pinyin);
    expect(optionText('meaning', thuy!)).toBe(`${thuy!.name} — ${thuy!.meaning}`);
  });
});
