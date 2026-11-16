import { describe, expect, it } from 'vitest';
import { CUON_SEAL, cuonHit, cuonLayout, cuonUsable, cuonView, fitHint, HINT_PAD_X, HINT_PAD_Y, PAPER_RATIO } from './cuonMuc';
import { RADICALS } from './radicals';
import { scrollMenu } from './studyMenu';

const ids = RADICALS.map((r) => r.id);
const text = (sub: { text: string }[]): string => sub.map((s) => s.text).join('');
/** tâm hộp → (u, v) trên giấy */
const uvOf = (l: ReturnType<typeof cuonLayout>, b: { x: number; y: number; w: number; h: number }): [number, number] => [
  (b.x + b.w / 2) / l.w,
  1 - (b.y + b.h / 2) / l.h,
];

const HSK1 = { title: 'HSK 1', subtitle: 'Nhập môn' };
/** cuộn theo tiến độ: sổ từ đang mượn, bộ đã học, số việc còn hôm nay */
const view = (book: typeof HSK1 | null, learned: string[], tasksLeft: number | null, place = 'x') =>
  cuonView(scrollMenu({ book, learned, tasksLeft }), place, book);

describe('cuộn khi ngồi — mục in trên giấy (R-ON-8, V-45; thiết kế 2026-11-14.21)', () => {
  it('R-ON-8: quảng trường, mượn HSK 1, học 5 bộ, còn 1 việc → "Đọc sách · HSK 1 · Nhập môn", "Bộ đã học · 5 / 50 bộ", "Nhiệm vụ hôm nay · Còn 1 việc"', () => {
    const v = view(HSK1, ids.slice(0, 5), 1, 'Khởi Nguyên Trấn · Quảng Trường');
    expect(v.rows.map((r) => [r.id, r.title, text(r.sub), r.look])).toEqual([
      ['book', 'Đọc sách', 'HSK 1 · Nhập môn', 'thuong'],
      ['learned', 'Bộ đã học', `5 / ${RADICALS.length} bộ`, 'thuong'],
      ['daily', 'Nhiệm vụ hôm nay', 'Còn 1 việc', 'thuong'],
    ]);
    expect(v.place).toBe('Khởi Nguyên Trấn · Quảng Trường');
    expect(v.hint).toBeNull();
  });

  it('R-ON-8: chưa mượn, chưa học → "Đọc sách" mờ "Mượn ở Tàng Thư Các", "Bộ đã học" mờ, Nhiệm vụ dùng được, gợi ý gặp Trúc Lão', () => {
    const v = view(null, [], 2);
    expect(v.rows.map((r) => [r.id, r.look, text(r.sub)])).toEqual([
      ['book', 'mo', 'Mượn ở Tàng Thư Các'],
      ['learned', 'mo', 'Chưa học bộ nào'],
      ['daily', 'thuong', 'Còn 2 việc'],
    ]);
    expect(v.hint).toBe('Chưa học bộ nào. Sang Trúc Lâm, gặp Trúc Lão ở bãi hạc đáp để học bộ đầu tiên.');
  });

  it('R-ON-8: xong cả 2 việc → "Đã xong hôm nay"; không biết tiến độ → "Xem việc hôm nay"; không mục nào nổi bật, không mục ôn / học', () => {
    expect(text(view(HSK1, ids.slice(0, 3), 0).rows[2]!.sub)).toBe('Đã xong hôm nay');
    const v = view(null, ids.slice(0, 3), null);
    expect(text(v.rows[2]!.sub)).toBe('Xem việc hôm nay');
    expect(v.rows.some((r) => r.look === 'noi')).toBe(false);
    expect(v.rows.map((r) => r.title).join(' ')).not.toMatch(/Ôn bộ|Học bộ mới/);
  });

  it('R-HUD-4: ấn son chữ Việt, không chữ Hán', () => {
    expect(CUON_SEAL).toBe('Ôn');
  });

  it('R-ON-8: giấy dài hơn (V-43) — tỉ lệ 0,26 × 0,35; dọc mục 70 (cũ 56), ngang mục 53', () => {
    expect(PAPER_RATIO).toBeCloseTo(0.35 / 0.26, 6);
    const doc = cuonLayout(false);
    const ngang = cuonLayout(true);
    expect([doc.w, doc.h]).toEqual([343, 462]);
    expect([ngang.w, ngang.h]).toEqual([250, 337]);
    expect(doc.rows.every((r) => r.h === 70)).toBe(true);
    expect(ngang.rows.every((r) => r.h === 53)).toBe(true);
  });

  // đo chữ "thô" rộng hơn Be Vietnam Pro thật (~0,55 em): nếu vừa với số đo này thì vừa với chữ thật
  const wide = (s: string, size: number): number => s.length * size * 0.62;
  for (const landscape of [false, true]) {
    it(`R-ON-8: ô gợi ý chưa học (${landscape ? 'ngang' : 'dọc'}) — đủ mọi chữ, mọi dòng nằm trong ô, không đè "Đứng dậy"`, () => {
      const l = cuonLayout(landscape);
      const v = view(null, [], 2, 'Tàng Thư Các');
      const hint = v.hint!;
      const fit = fitHint(hint, l.hint, landscape ? 11 : 12, wide);
      expect(fit.lines.join(' ')).toBe(hint); // không bỏ chữ nào
      expect(fit.lines.length * fit.lineH + HINT_PAD_Y).toBeLessThanOrEqual(l.hint.h);
      expect(fit.size).toBeGreaterThanOrEqual(landscape ? 10 : 11);
      for (const line of fit.lines) expect(wide(line, fit.size)).toBeLessThanOrEqual(l.hint.w - HINT_PAD_X);
      expect(l.hint.y + l.hint.h).toBeLessThanOrEqual(l.stand.y);
      expect(l.hint.y).toBeGreaterThanOrEqual(l.rows[2]!.y + l.rows[2]!.h);
    });
  }

  it('R-ON-8: ô gợi ý quá dài cho ô — chữ nhỏ dần, vẫn trả đủ mọi chữ (không cắt)', () => {
    const long = Array.from({ length: 40 }, () => 'chữ').join(' ');
    const fit = fitHint(long, { x: 0, y: 0, w: 120, h: 30 }, 12, wide);
    expect(fit.lines.join(' ')).toBe(long);
    expect(fit.size).toBe(9);
  });

  for (const landscape of [false, true]) {
    it(`R-ON-8: chạm thẳng vào mục (${landscape ? 'ngang' : 'dọc'}) → đúng mục; "Đứng dậy"; ngoài mục → không gì; mục mờ (Đọc sách chưa mượn) không dùng được`, () => {
      const l = cuonLayout(landscape);
      expect(l.rows.every((r) => r.h >= 53)).toBe(true);
      expect(l.stand.h).toBeGreaterThanOrEqual(49);
      expect(l.stand.y + l.stand.h).toBeLessThanOrEqual(l.h);
      expect(l.rows[2]!.y + l.rows[2]!.h).toBeLessThanOrEqual(l.stand.y);
      const v = view(null, ids.slice(0, 5), 1);
      expect(cuonHit(l, v, ...uvOf(l, l.rows[0]!))).toBe('book');
      expect(cuonHit(l, v, ...uvOf(l, l.rows[1]!))).toBe('learned');
      expect(cuonHit(l, v, ...uvOf(l, l.rows[2]!))).toBe('daily');
      expect(cuonHit(l, v, ...uvOf(l, l.stand))).toBe('stand');
      expect(cuonHit(l, v, 0.5, 0.995)).toBeNull(); // đầu cuộn
      expect(cuonUsable(v, 'book')).toBe(false); // chưa mượn: mờ
      expect(cuonUsable(v, 'learned')).toBe(true);
      expect(cuonUsable(v, 'daily')).toBe(true);
    });
  }
});
