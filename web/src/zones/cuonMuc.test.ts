import { describe, expect, it } from 'vitest';
import { CUON_SEAL, cuonHit, cuonLayout, cuonUsable, cuonView, fitHint, HINT_PAD_X, HINT_PAD_Y, PAPER_RATIO } from './cuonMuc';
import { RADICALS } from './radicals';
import { studyMenu } from './studyMenu';

const ids = RADICALS.map((r) => r.id);
const text = (sub: { text: string }[]): string => sub.map((s) => s.text).join('');
/** tâm hộp → (u, v) trên giấy */
const uvOf = (l: ReturnType<typeof cuonLayout>, b: { x: number; y: number; w: number; h: number }): [number, number] => [
  (b.x + b.w / 2) / l.w,
  1 - (b.y + b.h / 2) / l.h,
];

describe('cuộn sách Ngồi ôn — mục in trên giấy (R-ON-8, thiết kế 2026-11-14.21)', () => {
  it('R-ON-8: quảng trường, 2 bộ đến hạn, học 5 bộ → "Ôn bộ đến hạn (2)" nổi bật, "Học bộ mới" mờ "Học ở Trúc Lâm", "5 / 50 bộ"', () => {
    const learned = ids.slice(0, 5);
    const due = learned.slice(0, 2);
    const v = cuonView(studyMenu({ due, learned, hasLessons: false }), due, 'Khởi Nguyên Trấn · Quảng Trường');
    expect(v.rows.map((r) => [r.title, r.look])).toEqual([
      ['Ôn bộ đến hạn (2)', 'noi'],
      ['Học bộ mới', 'mo'],
      ['Xem bộ đã học', 'thuong'],
    ]);
    expect(text(v.rows[0]!.sub)).toContain('mỗi bộ 2 câu');
    expect(v.rows[0]!.sub.filter((s) => s.han).map((s) => s.text)).toEqual(due.map((id) => RADICALS.find((r) => r.id === id)!.form));
    expect(text(v.rows[1]!.sub)).toBe('Học ở Trúc Lâm');
    expect(text(v.rows[2]!.sub)).toBe(`5 / ${RADICALS.length} bộ`);
    expect(v.hint).toBeNull();
  });

  it('R-ON-8: chưa học bộ nào → 3 mục mờ, không nổi bật, có dòng gợi ý đi Trúc Lâm', () => {
    const v = cuonView(studyMenu({ due: [], learned: [], hasLessons: false }), [], 'Khởi Nguyên Trấn');
    expect(v.rows.map((r) => r.look)).toEqual(['mo', 'mo', 'mo']);
    expect(text(v.rows[0]!.sub)).toBe('Chưa có bộ nào để ôn');
    expect(text(v.rows[2]!.sub)).toBe('Chưa học bộ nào');
    expect(v.hint).toContain('Trúc Lâm');
  });

  it('R-ON-8: Trúc Lâm, không bộ đến hạn → "Học bộ mới" nổi bật ghi bộ kế tiếp; Ôn mờ "Hôm nay đã ôn xong"', () => {
    const v = cuonView(studyMenu({ due: [], learned: ids.slice(0, 3), hasLessons: true }), [], 'Trúc Lâm');
    expect(v.rows[1]!.look).toBe('noi');
    expect(text(v.rows[1]!.sub)).toContain('Bộ kế tiếp: ');
    expect(text(v.rows[0]!.sub)).toBe('Hôm nay đã ôn xong');
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
      const v = cuonView(studyMenu({ due: [], learned: [], hasLessons: false }), [], 'Tàng Thư Các');
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
    it(`R-ON-8: chạm thẳng vào mục (${landscape ? 'ngang' : 'dọc'}) → đúng mục; "Đứng dậy"; ngoài mục → không gì; mục mờ không dùng được`, () => {
      const l = cuonLayout(landscape);
      expect(l.rows.every((r) => r.h >= 53)).toBe(true);
      expect(l.stand.h).toBeGreaterThanOrEqual(49);
      expect(l.stand.y + l.stand.h).toBeLessThanOrEqual(l.h);
      expect(l.rows[2]!.y + l.rows[2]!.h).toBeLessThanOrEqual(l.stand.y);
      const v = cuonView(studyMenu({ due: [], learned: ids.slice(0, 5), hasLessons: false }), [], 'x');
      expect(cuonHit(l, v, ...uvOf(l, l.rows[0]!))).toBe('review');
      expect(cuonHit(l, v, ...uvOf(l, l.rows[2]!))).toBe('learned');
      expect(cuonHit(l, v, ...uvOf(l, l.stand))).toBe('stand');
      expect(cuonHit(l, v, 0.5, 0.995)).toBeNull(); // đầu cuộn
      expect(cuonUsable(v, 'learn')).toBe(false);
      expect(cuonUsable(v, 'learned')).toBe(true);
    });
  }
});
