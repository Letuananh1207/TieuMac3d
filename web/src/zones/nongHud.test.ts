import { describe, expect, it } from 'vitest';
import { freshNong, type NongState } from './nong';
import { BITE_S, castPhase, farmBagItems, farmButton, farmDetail, farmSpotAt, farmStoreRows, fishTick, refuseToast, WAIT_MAX_S, WAIT_MIN_S } from './nongHud';

const rect = (x0: number, x1: number, z0: number, z1: number) => ({ x0, x1, z0, z1 });
const AREA = { coop: rect(-16.5, -9.5, -12.5, -7.5), pen: rect(9.5, 14.5, 6, 10), pier: rect(13.6, 16.6, -0.7, 0.7), trellis: rect(-2.6, 2.6, 7.6, 11.4), trellisX: 0 };
const idle = { kind: 'idle' } as const;
const D = 20775;

describe('chỗ đứng + nút (R-NONG-1…6)', () => {
  it('R-NONG-1: trên bến → ben; dưới giàn → gốc bên mình; cạnh rào ≤ 1,8 m → chuồng; xa → không', () => {
    expect(farmSpotAt({ x: 15, z: 0 }, AREA)).toBe('ben');
    expect(farmSpotAt({ x: -0.5, z: 9 }, AREA)).toBe('bau');
    expect(farmSpotAt({ x: 0.5, z: 9 }, AREA)).toBe('dua-leo');
    expect(farmSpotAt({ x: -8, z: -9 }, AREA)).toBe('ga');
    expect(farmSpotAt({ x: 8, z: 8 }, AREA)).toBe('bo');
    expect(farmSpotAt({ x: -7, z: -9 }, AREA)).toBeNull();
    expect(farmSpotAt({ x: 0, z: 5 }, AREA)).toBeNull();
  });

  it('R-NONG-2: chuồng gà — Rắc thóc → (đã cho) nhãn chờ → hôm sau Nhặt trứng', () => {
    const s: NongState = freshNong();
    expect(farmButton('ga', s, D, 0, idle)).toMatchObject({ label: 'Rắc thóc', act: { act: 'feed', pen: 'ga' } });
    expect(farmButton('ga', { ...s, gaFed: D }, D, 0, idle)).toMatchObject({ label: 'Gà đã no', sub: 'mai có trứng', off: true, act: null });
    expect(farmButton('ga', { ...s, gaFed: D }, D + 1, 0, idle)).toMatchObject({ label: 'Nhặt trứng', act: { act: 'take', pen: 'ga' } });
    expect(refuseToast('ga', 'no-feed')?.title).toBe('Cần 1 Lúa — trồng Lúa ở vườn rau');
    expect(refuseToast('bo', 'no-feed')?.title).toBe('Cần 1 Cỏ khô — nhổ cỏ ở vườn rau');
  });

  it('R-NONG-4: chuồng bò — Cho cỏ / Bò đã no / Lấy sữa', () => {
    expect(farmButton('bo', freshNong(), D, 0, idle).label).toBe('Cho cỏ');
    expect(farmButton('bo', { ...freshNong(), boFed: D }, D, 0, idle).label).toBe('Bò đã no');
    expect(farmButton('bo', { ...freshNong(), boFed: D }, D + 1, 0, idle).label).toBe('Lấy sữa');
  });

  it('R-NONG-3: câu cá — còn n / 5; đang chờ (chạm = sớm); phao chìm → Giật cần!; đủ 5 → mai câu tiếp', () => {
    expect(farmButton('ben', freshNong(), D, 0, idle)).toMatchObject({ label: 'Câu cá', sub: 'còn 5 / 5', act: 'cast' });
    expect(farmButton('ben', { ...freshNong(), fishDay: D, fishN: 2 }, D, 0, idle).sub).toBe('còn 3 / 5');
    expect(farmButton('ben', freshNong(), D, 0, { kind: 'wait', left: 1 }).act).toBe('early');
    expect(farmButton('ben', freshNong(), D, 0, { kind: 'bite', left: 1 })).toMatchObject({ label: 'Giật cần!', hot: true, act: 'hook' });
    expect(farmButton('ben', { ...freshNong(), fishDay: D, fishN: 5 }, D, 0, idle)).toMatchObject({ off: true, sub: 'mai câu tiếp' });
  });

  it('R-NONG-3: phao nhấp 2–6 s rồi chìm 1,2 s; quá giờ → hụt', () => {
    expect(castPhase(0)).toEqual({ kind: 'wait', left: WAIT_MIN_S });
    expect(castPhase(1)).toEqual({ kind: 'wait', left: WAIT_MAX_S });
    const b = fishTick({ kind: 'wait', left: 0.1 }, 0.2);
    expect(b.phase).toEqual({ kind: 'bite', left: BITE_S });
    expect(fishTick({ kind: 'bite', left: 0.5 }, 0.4).missed).toBe(false);
    expect(fishTick({ kind: 'bite', left: 0.5 }, 0.6)).toEqual({ phase: { kind: 'idle' }, missed: true });
  });

  it('R-NONG-6: giàn — Gieo / còn thời gian / Hái', () => {
    const t0 = Date.UTC(2026, 10, 18, 1);
    expect(farmButton('dua-leo', freshNong(), D, t0, idle)).toMatchObject({ label: 'Gieo dưa leo', act: { act: 'sow', vine: 'dua-leo' } });
    const s = { ...freshNong(), vines: { 'dua-leo': t0 } };
    const mid = farmButton('dua-leo', s, D, t0 + 60 * 60000, idle);
    expect(mid).toMatchObject({ label: 'Dưa leo', off: true });
    expect(mid.sub).toContain('còn 2');
    expect(farmButton('dua-leo', s, D, t0 + 180 * 60000, idle)).toMatchObject({ label: 'Hái dưa leo', act: { act: 'pick', vine: 'dua-leo' } });
  });
});

describe('bán + túi đồ (R-NONG-7, R-NONG-8)', () => {
  const s = { ...freshNong(), kho: { sua: 1, trung: 3, 'co-kho': 2 } };
  it('R-NONG-7: hàng bán theo thứ tự bảng giá, không có Cỏ khô', () => {
    expect(farmStoreRows(s)).toEqual([
      { item: 'trung', name: 'Trứng gà', count: 3, price: 4 },
      { item: 'sua', name: 'Sữa bò', count: 1, price: 12 },
    ]);
  });
  it('R-NONG-8: ngăn Nông sản có cả Cỏ khô; thẻ chi tiết chỉ hiện từ đã học', () => {
    expect(farmBagItems(s.kho).map((x) => x.name)).toEqual(['Trứng gà', 'Sữa bò', 'Cỏ khô']);
    expect(farmDetail('trung', new Set(['鸡蛋']))).toEqual({ price: 'bán 4 / cái', word: '鸡蛋' });
    expect(farmDetail('trung', new Set())).toEqual({ price: 'bán 4 / cái', word: null });
    expect(farmDetail('ca-vang', new Set(['鱼'])).word).toBe('鱼');
    expect(farmDetail('co-kho', new Set()).price).toBe('Cho bò con ăn');
    expect(farmDetail('bau', new Set(['鸡蛋'])).word).toBeNull();
  });
});
