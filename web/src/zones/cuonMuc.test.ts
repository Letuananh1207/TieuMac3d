import { describe, expect, it } from 'vitest';
import { cuonA11yItems, CUON_SEAL, CUON_TITLE, cuonHit, cuonLayout, cuonUsable, cuonView, fitHint, HINT_PAD_X, HINT_PAD_Y, PAPER_RATIO, STAND_HIT, TILE_H } from './cuonMuc';
import { TU_VUNG } from './tuVung/tu';
import { scrollMenu } from './studyMenu';

const ids = TU_VUNG.map((t) => t.id);
/** tâm hộp → (u, v) trên giấy */
const uvOf = (l: ReturnType<typeof cuonLayout>, b: { x: number; y: number; w: number; h: number }): [number, number] => [
  (b.x + b.w / 2) / l.w,
  1 - (b.y + b.h / 2) / l.h,
];

const HSK1 = { title: 'HSK 1', subtitle: 'Nhập môn' };
/** cuộn theo tiến độ: sổ từ đang mượn, từ đã học, số việc còn hôm nay */
const view = (book: typeof HSK1 | null, learned: string[], tasksLeft: number | null, place = 'x') =>
  cuonView(scrollMenu({ book, learned, tasksLeft }), place, book);

describe('cuộn Tĩnh toạ — 4 ô trên giấy (R-ON-8; thiết kế 2026-11-16.12 `Cuon-*`)', () => {
  it('R-ON-8: quảng trường, mượn HSK 1, học 5 từ, còn 1 việc → 4 ô: "Đọc sách · HSK 1 · Nhập môn", "Từ đã học · 5 / 304 từ", "Nhiệm vụ hôm nay · Còn 1 việc" (chấm "1"), "Sắp có"', () => {
    const v = view(HSK1, ids.slice(0, 5), 1, 'Khởi Nguyên Trấn · Quảng Trường');
    expect(v.tiles.map((t) => [t.id, t.title, t.sub, t.look, t.badge])).toEqual([
      ['book', 'Đọc sách', 'HSK 1 · Nhập môn', 'thuong', null],
      ['learned', 'Từ đã học', `5 / ${TU_VUNG.length} từ`, 'thuong', null],
      ['daily', 'Nhiệm vụ hôm nay', 'Còn 1 việc', 'thuong', 1],
      ['soon', 'Sắp có', '', 'sap', null],
    ]);
    expect(v.tiles[0]!.mark).toBe('1'); // số cấp trên bìa mini
    expect(v.place).toBe('Khởi Nguyên Trấn · Quảng Trường');
    expect(v.hint).toBeNull();
  });

  it('R-ON-8: chưa mượn, chưa học → "Đọc sách" mờ "Mượn ở Tàng Thư Các", "Từ đã học" mờ, Nhiệm vụ dùng được, gợi ý gặp Trúc Lão', () => {
    const v = view(null, [], 2);
    expect(v.tiles.map((t) => [t.id, t.look, t.sub])).toEqual([
      ['book', 'mo', 'Mượn ở Tàng Thư Các'],
      ['learned', 'mo', 'Chưa học từ nào'],
      ['daily', 'thuong', 'Còn 2 việc'],
      ['soon', 'sap', ''],
    ]);
    expect(v.hint).toBe('Chưa học từ nào. Sang Thung Trúc Gió Hát, gặp Trúc Lão ở bãi hạc đáp để học bài đầu tiên.');
  });

  it('R-ON-8: xong cả 2 việc → "Đã xong hôm nay", không chấm son; không biết tiến độ → "Xem việc hôm nay"; không ô ôn / học', () => {
    const done = view(HSK1, ids.slice(0, 3), 0).tiles[2]!;
    expect([done.sub, done.badge]).toEqual(['Đã xong hôm nay', null]);
    const v = view(null, ids.slice(0, 3), null);
    expect([v.tiles[2]!.sub, v.tiles[2]!.badge]).toEqual(['Xem việc hôm nay', null]);
    expect(v.tiles.map((t) => t.title).join(' ')).not.toMatch(/Ôn từ|Học bài mới/);
  });

  it('R-HUD-4: tiêu đề "Tĩnh toạ", ấn son "Tĩnh" — chữ Việt, không chữ Hán', () => {
    expect(CUON_TITLE).toBe('Tĩnh toạ');
    expect(CUON_SEAL).toBe('Tĩnh');
  });

  it('R-ON-8: giấy trải ngang 16 : 9 — dọc 352 × 198, ô 77 × 98; ngang 464 × 261, ô ~102 × 128; một hàng 4 ô', () => {
    expect(PAPER_RATIO).toBeCloseTo(0.27 / 0.48, 6);
    const doc = cuonLayout(false);
    const ngang = cuonLayout(true);
    expect([doc.w, doc.h]).toEqual([352, 198]);
    expect([ngang.w, ngang.h]).toEqual([464, 261]);
    expect(doc.tiles.map((t) => [Math.round(t.w), t.h])).toEqual(Array(4).fill([77, TILE_H.doc]));
    expect(ngang.tiles.map((t) => [Math.round(t.w), t.h])).toEqual(Array(4).fill([102, TILE_H.ngang]));
    for (const l of [doc, ngang]) {
      expect(new Set(l.tiles.map((t) => t.y)).size).toBe(1); // một hàng
      expect(l.tiles[3]!.x + l.tiles[3]!.w).toBeCloseTo(l.w - l.pad.side, 6);
      expect(l.tiles[0]!.y).toBeGreaterThan(l.ruleY);
    }
  });

  it('R-ON-8: "Đứng dậy" góc trên phải — nút hiện 32 / 36, vùng chạm 48 × 48 tràn lên trên, không đè ô', () => {
    for (const [l, h] of [
      [cuonLayout(false), 32],
      [cuonLayout(true), 36],
    ] as const) {
      expect(l.stand.h).toBe(h);
      expect(l.stand.x + l.stand.w).toBe(l.w - l.pad.side);
      expect(l.stand.y).toBeLessThan(l.ruleY);
      expect(l.standHit.h).toBe(STAND_HIT);
      expect(l.standHit.w).toBeGreaterThanOrEqual(STAND_HIT);
      expect(l.standHit.y).toBeLessThan(l.stand.y);
      expect(l.standHit.y + l.standHit.h).toBeGreaterThan(l.stand.y + l.stand.h);
      expect(l.standHit.y + l.standHit.h).toBeLessThan(l.tiles[0]!.y);
    }
  });

  // đo chữ "thô" rộng hơn Be Vietnam Pro thật (~0,55 em): nếu vừa với số đo này thì vừa với chữ thật
  const wide = (s: string, size: number): number => s.length * size * 0.62;
  for (const landscape of [false, true]) {
    it(`R-ON-8: dòng gợi ý chưa học (${landscape ? 'ngang' : 'dọc'}) — đủ mọi chữ, mọi dòng nằm trong hộp dưới hàng ô, trong giấy`, () => {
      const l = cuonLayout(landscape);
      const v = view(null, [], 2, 'Tàng Thư Các');
      const hint = v.hint!;
      const fit = fitHint(hint, l.hint, l.type.hint, wide);
      expect(fit.lines.join(' ')).toBe(hint); // không bỏ chữ nào
      expect(fit.lines.length * fit.lineH + HINT_PAD_Y).toBeLessThanOrEqual(l.hint.h);
      expect(fit.size).toBeGreaterThanOrEqual(10);
      for (const line of fit.lines) expect(wide(line, fit.size)).toBeLessThanOrEqual(l.hint.w - HINT_PAD_X);
      expect(l.hint.y).toBeGreaterThanOrEqual(l.tiles[0]!.y + l.tiles[0]!.h);
      expect(l.hint.y + l.hint.h).toBeLessThanOrEqual(l.h);
    });
  }

  it('R-ON-8: dòng gợi ý quá dài cho hộp — chữ nhỏ dần, vẫn trả đủ mọi chữ (không cắt)', () => {
    const long = Array.from({ length: 40 }, () => 'chữ').join(' ');
    const fit = fitHint(long, { x: 0, y: 0, w: 120, h: 30 }, 12, wide);
    expect(fit.lines.join(' ')).toBe(long);
    expect(fit.size).toBe(9);
  });

  for (const landscape of [false, true]) {
    it(`R-ON-8: chạm thẳng vào ô (${landscape ? 'ngang' : 'dọc'}) → đúng ô; "Đứng dậy" (cả sát trên nút); "Sắp có" / ngoài ô → không gì; ô mờ không dùng được`, () => {
      const l = cuonLayout(landscape);
      const v = view(null, ids.slice(0, 5), 1);
      expect(cuonHit(l, v, ...uvOf(l, l.tiles[0]!))).toBe('book');
      expect(cuonHit(l, v, ...uvOf(l, l.tiles[1]!))).toBe('learned');
      expect(cuonHit(l, v, ...uvOf(l, l.tiles[2]!))).toBe('daily');
      expect(cuonHit(l, v, ...uvOf(l, l.tiles[3]!))).toBeNull(); // "Sắp có" không chạm
      expect(cuonHit(l, v, ...uvOf(l, l.stand))).toBe('stand');
      const above = l.stand.y - 3; // trên nút, trong vùng chạm 48
      expect(cuonHit(l, v, (l.stand.x + l.stand.w / 2) / l.w, 1 - above / l.h)).toBe('stand');
      expect(cuonHit(l, v, 0.3, 0.995)).toBeNull(); // đầu cuộn (dòng nơi)
      expect(cuonUsable(v, 'book')).toBe(false); // chưa mượn: mờ
      expect(cuonUsable(v, 'learned')).toBe(true);
      expect(cuonUsable(v, 'daily')).toBe(true);
      expect(cuonUsable(v, 'stand')).toBe(true);
    });
  }

  it('R-ON-8: trình đọc màn hình — 3 ô + "Đứng dậy"; ô mờ đọc "chưa dùng được"; ô "Sắp có" không đọc', () => {
    expect(cuonA11yItems(view(null, ids.slice(0, 5), 1))).toEqual([
      { id: 'book', label: 'Đọc sách, Mượn ở Tàng Thư Các, chưa dùng được', enabled: false },
      { id: 'learned', label: `Từ đã học, 5 / ${TU_VUNG.length} từ`, enabled: true },
      { id: 'daily', label: 'Nhiệm vụ hôm nay, Còn 1 việc', enabled: true },
      { id: 'stand', label: 'Đứng dậy', enabled: true },
    ]);
  });
});
