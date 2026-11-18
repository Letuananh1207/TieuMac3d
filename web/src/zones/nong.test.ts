import { describe, expect, it } from 'vitest';
import { maNgayVN } from './gioVN';
import {
  addHay,
  catchFish,
  FISH_DAILY,
  fishKind,
  fishToday,
  feedPen,
  freshNong,
  NONG_PRICES,
  parseNong,
  parseNongReply,
  pickVine,
  sellNong,
  sowVine,
  takePen,
  vineStage,
  type NongResult,
} from './nong';
import { freshGarden, parseGarden, type Garden } from './vuon';
import { nongTrialAct, newTrial } from './walletRules';

/** Giờ VN [h]:[m] ngày [day]/11/2026 → ms. */
const vn = (h: number, m = 0, day = 18): number => Date.UTC(2026, 10, day, h, m) - 7 * 3_600_000;
const withLua = (n: number): Garden => ({ ...freshGarden(), barn: n > 0 ? { lua: n } : {} });
function ok(r: NongResult): Extract<NongResult, { ok: true }> {
  expect(r.ok).toBe(true);
  return r as Extract<NongResult, { ok: true }>;
}
const d18 = maNgayVN(vn(9));
const d19 = maNgayVN(vn(0, 0, 19));

describe('chuồng gà, chuồng bò (R-NONG-2, R-NONG-4, R-NONG-5)', () => {
  it('R-NONG-2: rắc thóc trừ 1 Lúa; 0:00 hôm sau có 3 trứng; nhặt xong cho ăn lại được', () => {
    const r = ok(feedPen(freshNong(), withLua(2), 'ga', d18));
    expect(r.garden!.barn.lua).toBe(1);
    expect(feedPen(r.nong, r.garden!, 'ga', d18)).toEqual({ ok: false, reason: 'fed' });
    expect(takePen(r.nong, 'ga', d18)).toEqual({ ok: false, reason: 'none' });
    expect(maNgayVN(vn(23, 59))).toBe(d18);
    expect(d19).toBe(d18 + 1);
    expect(feedPen(r.nong, r.garden!, 'ga', d19)).toEqual({ ok: false, reason: 'ready' });
    const t = ok(takePen(r.nong, 'ga', d19));
    expect(t.got).toBe(3);
    expect(t.nong.kho.trung).toBe(3);
    expect(feedPen(t.nong, r.garden!, 'ga', d19).ok).toBe(true);
  });

  it('R-NONG-2: không có Lúa → no-feed', () => {
    expect(feedPen(freshNong(), withLua(0), 'ga', d18)).toEqual({ ok: false, reason: 'no-feed' });
  });

  it('R-NONG-4: cho cỏ trừ 1 Cỏ khô; hôm sau 1 Sữa bò', () => {
    expect(feedPen(freshNong(), withLua(5), 'bo', d18)).toEqual({ ok: false, reason: 'no-feed' });
    const r = ok(feedPen(addHay(freshNong(), 1), freshGarden(), 'bo', d18));
    expect(r.garden).toBeUndefined();
    expect(r.nong.kho['co-kho']).toBeUndefined();
    const t = ok(takePen(r.nong, 'bo', d19));
    expect(t.got).toBe(1);
    expect(t.nong.kho.sua).toBe(1);
  });

  it('R-NONG-5: nhổ cỏ → +1 Cỏ khô mỗi lần (ví thử)', () => {
    expect(addHay(addHay(freshNong(), 1), 1).kho['co-kho']).toBe(2);
  });
});

describe('ao cá (R-NONG-3)', () => {
  it('R-NONG-3: loại cá theo (ngày × 7 + n × 3) mod 10 — ví dụ sổ ngày 20775', () => {
    expect([0, 1, 2].map((n) => fishKind(20775, n))).toEqual(['ca-diec', 'ca-chep', 'ca-diec']);
    expect(Array.from({ length: 10 }, (_, n) => fishKind(3, n)).filter((k) => k === 'ca-vang')).toHaveLength(1);
  });

  it('R-NONG-3: tối đa 5 cá / ngày VN; sang ngày mới câu lại', () => {
    let s = freshNong();
    for (let i = 0; i < FISH_DAILY; i++) {
      const r = ok(catchFish(s, d18));
      expect(r.item).toBe(fishKind(d18, i));
      s = r.nong;
    }
    expect(fishToday(s, d18)).toBe(5);
    expect(catchFish(s, d18)).toEqual({ ok: false, reason: 'limit' });
    expect(fishToday(s, d19)).toBe(0);
    expect(catchFish(s, d19).ok).toBe(true);
  });
});

describe('giàn bầu bí (R-NONG-6)', () => {
  it('R-NONG-6: dưa leo 8:00 → 9:30 leo nửa, 11:00 chín → hái +3, gốc trống', () => {
    const s = ok(sowVine(freshNong(), 'dua-leo', vn(8))).nong;
    expect(sowVine(s, 'dua-leo', vn(8))).toEqual({ ok: false, reason: 'busy' });
    expect(vineStage(s, 'dua-leo', vn(9, 30))).toBe('leo');
    expect(pickVine(s, 'dua-leo', vn(10, 59))).toEqual({ ok: false, reason: 'not-ripe' });
    const p = ok(pickVine(s, 'dua-leo', vn(11)));
    expect(p.got).toBe(3);
    expect(p.nong.kho['dua-leo']).toBe(3);
    expect(vineStage(p.nong, 'dua-leo', vn(11))).toBe('trong');
    expect(pickVine(p.nong, 'dua-leo', vn(8))).toEqual({ ok: false, reason: 'empty' });
  });

  it('R-NONG-6: bầu 4 giờ — mầm dưới 10 %, leo tới 50 %, phủ vòm sau đó', () => {
    const s = ok(sowVine(freshNong(), 'bau', vn(8))).nong;
    expect(vineStage(s, 'bau', vn(8, 20))).toBe('mam');
    expect(vineStage(s, 'bau', vn(10))).toBe('leo');
    expect(vineStage(s, 'bau', vn(10, 1))).toBe('phu');
    expect(vineStage(s, 'bau', vn(12))).toBe('chin');
    expect(sowVine(s, 'bi-dao', vn(8))).toEqual({ ok: false, reason: 'bad' });
  });
});

describe('bán + lưu (R-NONG-7, R-NONG-8)', () => {
  it('R-NONG-7: giá; bán hết không tính trần, không bán Cỏ khô', () => {
    expect(NONG_PRICES).toEqual({ trung: 4, 'ca-diec': 3, 'ca-chep': 6, 'ca-vang': 12, sua: 12, bau: 8, 'dua-leo': 6 });
    const s = { ...freshNong(), kho: { trung: 3, sua: 1, 'co-kho': 2 } };
    const r = ok(sellNong(s, null));
    expect([r.amount, r.got]).toEqual([24, 4]);
    expect(r.nong.kho).toEqual({ 'co-kho': 2 });
    expect(sellNong(r.nong, null)).toEqual({ ok: false, reason: 'empty' });
    expect(sellNong(s, 'co-kho')).toEqual({ ok: false, reason: 'bad' });
  });

  it('R-NONG-8: đọc bản hỏng → trống; mã lạ bỏ; trả lời cầu nối', () => {
    const s = parseNong({ gaFed: 'x', kho: { trung: 2, vit: 3, sua: -1 }, vines: { bau: 5 } });
    expect(s.gaFed).toBe(-1);
    expect(s.kho).toEqual({ trung: 2 });
    expect(s.vines).toEqual({ bau: 5 });
    expect(parseNong('?')).toEqual(freshNong());
    expect(parseNongReply({ ok: false, reason: 'fed', balance: 5 }, parseGarden)).toEqual({ ok: false, reason: 'fed', balance: 5 });
    const r = parseNongReply({ ok: true, nong: {}, garden: { open: 6 }, balance: 9, amount: 0, got: 1, item: 'ca-chep' }, parseGarden);
    expect(r && r.ok && r.item).toBe('ca-chep');
    expect(r && r.ok && r.garden?.open).toBe(6);
  });

  it('R-NONG-8: ví thử — rắc thóc trừ Lúa trong vườn ví thử, bán cộng ví', () => {
    const w = { ...newTrial(), garden: withLua(1), nong: { ...freshNong(), kho: { sua: 1 } } };
    const a = nongTrialAct(w, { act: 'feed', pen: 'ga' }, vn(9));
    expect(a.wallet.garden.barn.lua).toBeUndefined();
    expect(a.wallet.nong.gaFed).toBe(d18);
    const b = nongTrialAct(a.wallet, { act: 'sell', item: null }, vn(9));
    expect(b.wallet.coins).toBe(w.coins + 12);
  });
});
