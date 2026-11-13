import { describe, expect, it } from 'vitest';
import { BOOKS, bookWords } from './books';

const TONE = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/;
/** trợ từ chỉ có thanh nhẹ */
const NEUTRAL = new Set(['吧', '的', '了', '吗', '呢', '得', '过', '着']);

describe('Danh mục Tàng Thư Các', () => {
  it('R-SACH-1: 6 cuốn HSK 1 … HSK 6 theo thứ tự cấp, số từ chuẩn 150 · 150 · 300 · 600 · 1300 · 2500', () => {
    expect(BOOKS.map((b) => b.title)).toEqual(['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6']);
    expect(BOOKS.map((b) => b.planned)).toEqual([150, 150, 300, 600, 1300, 2500]);
  });

  it('R-SACH-1: HSK 1, HSK 2 đã soạn (~150 từ); cuốn chưa soạn không mượn được', () => {
    for (const b of BOOKS) {
      expect(b.ready).toBe(b.words > 0);
      if (b.ready) expect(Math.abs(b.words - b.planned)).toBeLessThanOrEqual(5);
    }
    expect(BOOKS.filter((b) => b.ready).map((b) => b.id)).toEqual(['hsk1', 'hsk2']);
    expect(bookWords('hsk3')).toEqual([]);
    expect(bookWords('khong-co')).toEqual([]);
  });
});

describe('Sổ từ', () => {
  const all = BOOKS.filter((b) => b.ready).flatMap((b) => bookWords(b.id).map((w) => ({ book: b.id, ...w })));

  it('R-SACH-3: trang 1 của HSK 1 là 爱 ài — yêu', () => {
    const w = bookWords('hsk1')[0];
    expect([w.han, w.pinyin, w.meaning]).toEqual(['爱', 'ài', 'yêu']);
  });

  it('R-SACH-3: không trùng từ trong một cuốn hay giữa các cuốn', () => {
    const seen = new Map<string, string>();
    for (const w of all) {
      expect(seen.get(w.han), `${w.han} trùng (${w.book})`).toBeUndefined();
      seen.set(w.han, w.book);
    }
  });

  it('R-SACH-3: đủ chữ, pinyin có dấu thanh, nghĩa, câu ví dụ chứa từ', () => {
    for (const w of all) {
      const label = `${w.book} ${w.han}`;
      expect(w.han, label).toMatch(/^[\u4e00-\u9fff…]+$/);
      if (!NEUTRAL.has(w.han)) expect(w.pinyin, label).toMatch(TONE);
      expect(w.meaning.length, label).toBeGreaterThan(0);
      for (const part of w.han.split('…')) expect(w.example.han, label).toContain(part);
      expect(w.example.pinyin, label).toMatch(TONE);
      expect(w.example.meaning, label).toMatch(/[.!?]$/);
      expect(w.example.han, label).toMatch(/[。！？]$/);
    }
  });
});
