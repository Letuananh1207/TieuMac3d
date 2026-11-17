import { describe, expect, it } from 'vitest';
import {
  MANG_PICK_RANGE,
  MANG_WAVES,
  mangChip,
  mangInRange,
  mangOfDay,
  mangOn,
  mangPickLabel,
  mangQuestion,
  mangWord,
  mangSellLabel,
  parseMang,
  parseMangReply,
  pickMang,
  rainAt,
  sellMang,
  sproutK,
  wavesOpen,
  freshMang,
} from './mang';
import { tuTheoMa } from './tuVung/tu';

const AREAS = [{ from: [-20, -20] as [number, number], to: [20, 20] as [number, number] }];
/** Giờ VN h:m ngày 15/11/2026 → ms UTC. */
const vn = (h: number, m = 0): number => Date.UTC(2026, 10, 15, h - 7, m);
const DAY = Math.floor((vn(10) + 7 * 3_600_000) / 86_400_000);

describe('Măng — chỗ mọc (R-MANG-1)', () => {
  it('R-MANG-1: cùng ngày → cùng chỗ (mọi máy); ngày khác → chỗ khác', () => {
    const a = mangOfDay(DAY, AREAS, () => true);
    const b = mangOfDay(DAY, AREAS, () => true);
    expect(a).toEqual(b);
    const c = mangOfDay(DAY + 1, AREAS, () => true);
    expect(c[0].x).not.toBeCloseTo(a[0].x, 3);
  });

  it('R-MANG-1: 8 + 6 măng, số 0 mỗi lứa là măng to, cách nhau ≥ 3 m, trong vùng, tránh chỗ cấm', () => {
    const banned = (x: number): boolean => x > -2 && x < 2; // "lối" giữa vùng
    const s = mangOfDay(DAY, AREAS, (x) => !banned(x));
    expect(s.filter((m) => m.wave === 0)).toHaveLength(8);
    expect(s.filter((m) => m.wave === 1)).toHaveLength(6);
    expect(s.filter((m) => m.big).map((m) => m.id)).toEqual([`${DAY}-0-0`, `${DAY}-1-0`]);
    for (const m of s) {
      expect(banned(m.x)).toBe(false);
      expect(Math.abs(m.x)).toBeLessThanOrEqual(20);
      for (const o of s) if (o !== m) expect(Math.hypot(o.x - m.x, o.z - m.z)).toBeGreaterThanOrEqual(3);
    }
    expect(MANG_WAVES.map((w) => [w.at / 3600, w.count])).toEqual([[5, 8], [15, 6]]);
  });

  it('R-MANG-1: cảnh chật → ít măng hơn, không lỗi', () => {
    expect(mangOfDay(DAY, [{ from: [0, 0], to: [2, 2] }], () => true).length).toBeLessThan(3);
    expect(mangOfDay(DAY, [], () => true)).toEqual([]);
  });

  it('R-MANG-1: trước 5:00 không lứa nào; 5:00 lứa sáng; 15:00 thêm lứa chiều', () => {
    expect(wavesOpen(4 * 3600 + 3599)).toBe(0);
    expect(wavesOpen(5 * 3600)).toBe(1);
    expect(wavesOpen(15 * 3600)).toBe(2);
  });

  it('R-MANG-1: sang ngày → măng đã hái hôm trước bỏ, túi giữ', () => {
    expect(mangOn({ day: 1, picked: ['1-0-2'], bag: { mang: 3 } }, 2)).toEqual({ day: 2, picked: [], bag: { mang: 3 } });
  });
});

describe('Măng — mưa phùn (R-MANG-2)', () => {
  it('R-MANG-2: 14:50 → 15:00 mưa; 15:00 tạnh, măng chiều nhú trong 0,6 s', () => {
    expect(rainAt(14 * 3600 + 49 * 60 + 59)).toBe(false);
    expect(rainAt(14 * 3600 + 50 * 60)).toBe(true);
    expect(rainAt(15 * 3600 - 0.001)).toBe(true);
    expect(rainAt(15 * 3600)).toBe(false);
    expect(sproutK(15 * 3600, 1)).toBe(0);
    expect(sproutK(15 * 3600 + 0.3, 1)).toBeCloseTo(0.5);
    expect(sproutK(15 * 3600 + 5, 1)).toBe(1);
  });
});

describe('Măng — hái (R-MANG-3, R-MANG-4)', () => {
  it('R-MANG-3: măng gần nhất trong 1,5 m, bỏ măng đã hái', () => {
    const spots = [
      { id: 'a', x: 1, z: 0 },
      { id: 'b', x: 0.5, z: 0 },
    ];
    expect(mangInRange(spots, new Set(), 0, 0)?.id).toBe('b');
    expect(mangInRange(spots, new Set(['b']), 0, 0)?.id).toBe('a');
    expect(mangInRange(spots, new Set(), 1.6 + 1, 0)).toBeNull();
    expect(MANG_PICK_RANGE).toBe(1.5);
  });

  it('R-MANG-3: hái một lần; ngày khác / lứa chưa tới / sai dạng → từ chối (như mang.dart)', () => {
    const r = pickMang(freshMang(DAY), `${DAY}-0-3`, vn(10));
    expect(r).toMatchObject({ ok: true, got: 1 });
    if (!r.ok) throw new Error();
    expect(r.mang.bag).toEqual({ mang: 1 });
    expect(pickMang(r.mang, `${DAY}-0-3`, vn(11))).toEqual({ ok: false, reason: 'picked' });
    expect(pickMang(r.mang, `${DAY - 1}-0-1`, vn(10))).toEqual({ ok: false, reason: 'day' });
    expect(pickMang(r.mang, `${DAY}-1-1`, vn(14, 59))).toEqual({ ok: false, reason: 'not-yet' });
    expect(pickMang(r.mang, `${DAY}-1-6`, vn(16))).toEqual({ ok: false, reason: 'not-yet' });
    expect(pickMang(r.mang, 'x', vn(10))).toEqual({ ok: false, reason: 'bad' });
    expect(mangPickLabel(false, 1)).toBe('+1 Măng');
    expect(mangPickLabel(true, 2)).toBe('+2 Măng to');
  });

  it('R-MANG-4: măng to + đúng + đã học → 2; chưa học → không chữ, 1', () => {
    expect(pickMang(freshMang(DAY), `${DAY}-0-0`, vn(10), true, true)).toMatchObject({ ok: true, got: 2, mang: { bag: { 'mang-to': 2 } } });
    expect(pickMang(freshMang(DAY), `${DAY}-0-0`, vn(10), false, true)).toMatchObject({ got: 1 });
    expect(pickMang(freshMang(DAY), `${DAY}-0-0`, vn(10), true, false)).toMatchObject({ got: 1 });
    expect(mangWord([], DAY, 0)).toBeNull();
    expect(mangWord(['朋友'], DAY, 1)?.id).toBe('朋友');
    expect(mangWord(['不客气', '你'], DAY, 0)?.id).toBe('你'); // ưu tiên từ 1–2 chữ
    expect(mangWord(['不客气'], DAY, 0)?.id).toBe('不客气');
    const t = tuTheoMa('朋友')!;
    const q = mangQuestion(t, ['朋友'], () => 0.4);
    expect(q.options).toHaveLength(4);
    expect(new Set(q.options).size).toBe(4);
    expect(q.options[q.answer]).toBe(t.meaning);
  });
});

describe('Măng — bán (R-MANG-5)', () => {
  it('R-MANG-5: 5 Măng + 1 Măng to → bán hết +23; từng loại; túi trống → empty', () => {
    const s = { day: 1, picked: [], bag: { mang: 5, 'mang-to': 1 } };
    expect(sellMang(s, null)).toEqual({ ok: true, mang: { day: 1, picked: [], bag: {} }, amount: 23, got: 6 });
    expect(sellMang(s, 'mang-to')).toMatchObject({ amount: 8, mang: { bag: { mang: 5 } } });
    expect(sellMang(freshMang(), null)).toEqual({ ok: false, reason: 'empty' });
    expect(mangSellLabel(23)).toBe('+23 · Bán măng');
  });

  it('R-MANG-5: đọc getMang / mangAct; sai dạng → túi trống / null', () => {
    expect(parseMang({ day: 5, picked: ['5-0-1', 3], bag: { mang: 2, ngo: 1, 'mang-to': -1 } })).toEqual({ day: 5, picked: ['5-0-1'], bag: { mang: 2 } });
    expect(parseMang(null)).toEqual(freshMang());
    expect(parseMangReply({ ok: true, mang: { day: 5, picked: [], bag: {} }, balance: 40, amount: 23, got: 6 })).toMatchObject({ ok: true, amount: 23, balance: 40 });
    expect(parseMangReply({ ok: false, reason: 'picked', balance: 4 })).toEqual({ ok: false, reason: 'picked', balance: 4 });
    expect(parseMangReply({ ok: false, reason: 'la', balance: 4 })).toBeNull();
    expect(parseMangReply(null)).toBeNull();
  });
});

describe('chip lứa măng (thiết kế 2026-11-16.13)', () => {
  it('R-MANG-1: chip theo giờ VN + số đã hái — còn măng · chờ lứa chiều · đang mưa · hết', () => {
    const per = [8, 6];
    expect(mangChip(10 * 3600, 5, false, per)).toBe('Măng hôm nay · đã hái 5 / 14');
    expect(mangChip(10 * 3600, 8, false, per)).toBe('Lứa chiều nhú sau mưa · 15:00');
    expect(mangChip(14 * 3600 + 55 * 60, 3, true, per)).toBe('Đang mưa phùn — măng sắp nhú');
    expect(mangChip(16 * 3600, 9, false, per)).toBe('Măng hôm nay · đã hái 9 / 14');
    expect(mangChip(16 * 3600, 14, false, per)).toBe('Đã hái hết · Mai măng lại nhú');
    expect(mangChip(3 * 3600, 0, false, per)).toBe('Măng hôm nay · đã hái 0 / 14');
  });
});
