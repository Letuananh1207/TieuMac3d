import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ALMS_DECLINED, almsGreeting, almsShortChoice, almsState, almsThanks, khatNhiDialog } from './alms';
import { checkDialog, DialogRunner } from './dialogs';
import { maNgayVN } from './gioVN';
import { TIN_DON, tinDonCuaNgay } from './tinDon';
import { almsLabel, giveAlms, NO_ALMS, parseAlms } from './walletRules';

const vn = (d: number, h: number, mi = 0): number => Date.UTC(2026, 10, d, h - 7, mi);
const day14 = maNgayVN(vn(14, 10));

describe('Cho Tiểu Khất (R-TIEN-8)', () => {
  it('R-TIEN-8: có 12, 10 giờ ngày 14 → cho → còn 7; 23:59 cùng ngày → không cho được; 0:01 ngày 15 → cho lại được', () => {
    const r = giveAlms(12, NO_ALMS, day14);
    expect(r).toEqual({ ok: true, balance: 7, alms: { lastDay: day14, count: 1 } });
    if (!r.ok) return;
    expect(giveAlms(7, r.alms, maNgayVN(vn(14, 23, 59)))).toEqual({ ok: false, reason: 'given', balance: 7 });
    const r2 = giveAlms(7, r.alms, maNgayVN(vn(15, 0, 1)));
    expect(r2).toEqual({ ok: true, balance: 2, alms: { lastDay: day14 + 1, count: 2 } });
  });

  it('R-TIEN-8: có 3 → "Ta chỉ còn 3 văn…", ví vẫn 3', () => {
    expect(giveAlms(3, NO_ALMS, day14)).toEqual({ ok: false, reason: 'short', balance: 3 });
    expect(almsState(NO_ALMS, day14, 3)).toBe('thieu');
    expect(almsShortChoice(3)).toBe('Ta chỉ còn 3 văn…');
  });

  it('R-TIEN-8: máy múi giờ London 18 giờ ngày 14 = 1 giờ sáng ngày 15 VN → đã sang ngày mới, cho lại được', () => {
    const r = giveAlms(20, NO_ALMS, day14);
    if (!r.ok) throw new Error('phải cho được');
    const london = maNgayVN(Date.UTC(2026, 10, 14, 18, 0));
    expect(giveAlms(r.balance, r.alms, london).ok).toBe(true);
  });

  it('R-TIEN-5: nhãn ví HUD "−5 · Cho Tiểu Khất"', () => {
    expect(almsLabel()).toBe('−5 · Cho Tiểu Khất');
  });

  it('R-TIEN-8: bản ghi lưu hỏng → chưa cho lần nào', () => {
    expect(parseAlms(null)).toEqual(NO_ALMS);
    expect(parseAlms({ lastDay: 'x', count: -2 })).toEqual(NO_ALMS);
    expect(parseAlms({ lastDay: day14, count: 4 })).toEqual({ lastDay: day14, count: 4 });
  });
});

describe('Thoại Tiểu Khất (R-NPC-6)', () => {
  it('R-NPC-6: chưa cho → xin tiền; đã cho hôm nay → "Hôm nay đạo hữu cho rồi, mai ghé nhé!"', () => {
    expect(almsState(NO_ALMS, day14, 12)).toBe('chua-cho');
    expect(almsGreeting('chua-cho', 0).startsWith('Đạo hữu ơi, cho tiểu khất xin vài văn mua bánh')).toBe(true);
    const given = { lastDay: day14, count: 1 };
    expect(almsState(given, day14, 7)).toBe('da-cho');
    expect(almsGreeting('da-cho', 1).startsWith('Hôm nay đạo hữu cho rồi, mai ghé nhé!')).toBe(true);
  });

  it('R-NPC-6: đủ 3 lần → "Ân nhân lại tới!"; đủ 10 lần → thêm "Tiểu khất nhớ ơn đạo hữu mãi."', () => {
    expect(almsGreeting('chua-cho', 2).includes('Ân nhân')).toBe(false);
    expect(almsGreeting('chua-cho', 3).startsWith('Ân nhân lại tới!')).toBe(true);
    expect(almsGreeting('chua-cho', 9).includes('nhớ ơn')).toBe(false);
    expect(almsGreeting('chua-cho', 10)).toContain('Tiểu khất nhớ ơn đạo hữu mãi.');
  });

  it('R-NPC-6: cho xong → "Đa tạ đạo hữu!" + tin đồn của ngày; tin đổi mỗi ngày theo lượt, hết thì quay lại', () => {
    expect(almsThanks(day14)).toBe(`Đa tạ đạo hữu! ${tinDonCuaNgay(day14).text}`);
    const n = TIN_DON.length;
    const seen = new Set(Array.from({ length: n }, (_, i) => tinDonCuaNgay(day14 + i).text));
    expect(seen.size).toBe(n);
    expect(tinDonCuaNgay(day14 + n)).toBe(tinDonCuaNgay(day14));
  });

  it('R-NPC-6: mỗi tin đồn ghi mã luật có trong sổ, không chữ Hán (R-HUD-4)', () => {
    const book = readFileSync(new URL('../../../docs/testing/quy_tac.md', import.meta.url), 'utf8');
    for (const t of TIN_DON) {
      expect(book.includes(`| ${t.rule} |`), t.rule).toBe(true);
      expect(/\p{Script=Han}/u.test(t.text), t.text).toBe(false);
    }
  });
});

describe('Khung thoại Tiểu Khất (R-NPC-6)', () => {
  const choices = (d: ReturnType<typeof khatNhiDialog>): string[] => d.lines[0].choices.map((c) => c.text);

  it('R-NPC-6: chưa cho → "Cho 5 văn" (action alms), "Hôm nay ta không có tiền lẻ", "Tạm biệt"', () => {
    const d = khatNhiDialog(NO_ALMS, day14, 12);
    expect(checkDialog(d)).toEqual([]);
    expect(choices(d)).toEqual(['Cho 5 văn', 'Hôm nay ta không có tiền lẻ', 'Tạm biệt']);
    expect(d.lines[0].choices[0].action).toBe('alms');
    const r = new DialogRunner(d);
    r.start();
    expect(r.choose(1)?.text).toBe(ALMS_DECLINED);
  });

  it('R-TIEN-8: thiếu tiền → "Ta chỉ còn 3 văn…" thay "Cho 5 văn", không có action', () => {
    const d = khatNhiDialog(NO_ALMS, day14, 3);
    expect(checkDialog(d)).toEqual([]);
    expect(choices(d)[0]).toBe('Ta chỉ còn 3 văn…');
    expect(d.lines[0].choices.some((c) => c.action === 'alms')).toBe(false);
  });

  it('R-NPC-6: đã cho hôm nay → "Nhắc lại tin hôm nay" kể đúng tin của ngày', () => {
    const d = khatNhiDialog({ lastDay: day14, count: 1 }, day14, 7);
    expect(checkDialog(d)).toEqual([]);
    expect(choices(d)).toEqual(['Nhắc lại tin hôm nay', 'Tạm biệt']);
    const r = new DialogRunner(d);
    r.start();
    expect(r.choose(0)?.text).toContain(tinDonCuaNgay(day14).text);
  });
});
