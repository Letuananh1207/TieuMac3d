import { describe, expect, it } from 'vitest';
import { maNgayVN } from './gioVN';
import { freshGarden, type Garden, type Plot } from './vuon';
import {
  bagChips,
  capLeftText,
  gardenHudShown,
  growingLabel,
  growText,
  harvestToast,
  pickSeedSub,
  pickSpot,
  plotMark,
  remainText,
  ripeToast,
  seedCards,
  sellAllText,
  storeView,
  unlockedToast,
  unlockView,
} from './vuonHud';
import { CROPS } from './vuon';

const vn = (d: number, h: number, m = 0): number => Date.UTC(2026, 10, d, h - 7, m);
const MIN = 60000;
const withPlot = (g: Garden, id: string, p: Plot): Garden => ({ ...g, plots: { ...g.plots, [id]: p } });
const IDLE = { decorating: false, map: false, talking: false, sitting: false, covered: false, loading: false };

describe('nút nổi ở luống (R-VUON-2)', () => {
  it('R-VUON-2: luống trống cách 1,2 m → "Gieo"; không trong tầm → không gì', () => {
    expect(pickSpot(freshGarden(), { id: 'o-1', dist: 1.2 }, 9, 0)).toMatchObject({ kind: 'plot', plot: 'o-1', button: 'gieo' });
    expect(pickSpot(freshGarden(), null, 9, 0)).toBeNull();
    expect(pickSpot(freshGarden(), { id: 'o-7', dist: 1 }, 9, 0)).toMatchObject({ button: 'mo-o' });
  });

  it('R-VUON-2: Cải ngọt gieo 10 phút trước, đã tưới 1 lượt → nhãn "Cải ngọt · còn 20 phút", không nút', () => {
    const t0 = vn(14, 9);
    const g = withPlot(freshGarden(), 'o-2', { crop: 'cai', plantedAt: t0, watered: 1 });
    const s = pickSpot(g, { id: 'o-2', dist: 1 }, 9, t0 + 10 * MIN);
    expect(s?.kind).toBe('grow');
    if (s?.kind !== 'grow') return;
    expect(growingLabel(s)).toBe('Cải ngọt · còn 20 phút');
    expect(s.frac).toBeCloseTo(1 / 3);
  });

  it('R-VUON-2: thùng thu mua và luống cùng trong tầm → vật gần hơn thắng; thùng chỉ dưới 2,5 m', () => {
    const g = freshGarden();
    expect(pickSpot(g, { id: 'o-1', dist: 1.5 }, 1.2, 0)).toMatchObject({ kind: 'bin' });
    expect(pickSpot(g, { id: 'o-1', dist: 0.8 }, 1.2, 0)).toMatchObject({ kind: 'plot' });
    expect(pickSpot(g, null, 2.4, 0)).toMatchObject({ kind: 'bin' });
    expect(pickSpot(g, null, 2.6, 0)).toBeNull();
  });

  it('R-VUON-2: đang trang trí / bản đồ / thoại / ngồi / màn Flutter / màn tải → không HUD vườn', () => {
    expect(gardenHudShown(IDLE)).toBe(true);
    for (const k of Object.keys(IDLE) as (keyof typeof IDLE)[]) expect(gardenHudShown({ ...IDLE, [k]: true })).toBe(false);
  });

  it('R-VUON-5: luống tưới được hiện giọt nước; chín → lấp lánh; trống / hoang → không dấu', () => {
    const t0 = vn(14, 9);
    const g = withPlot(freshGarden(), 'o-1', { crop: 'cai', plantedAt: t0, watered: 0 });
    expect(plotMark(g, 'o-1', t0 + MIN)).toBe('giot');
    expect(plotMark(withPlot(g, 'o-1', { crop: 'cai', plantedAt: t0, watered: 1 }), 'o-1', t0 + 10 * MIN)).toBeNull();
    expect(plotMark(g, 'o-1', t0 + 30 * MIN)).toBe('lap-lanh');
    expect(plotMark(g, 'o-2', t0)).toBeNull();
    expect(plotMark(g, 'o-9', t0)).toBeNull();
  });

  it('R-VUON-4: thời gian còn lại dưới 1 phút / giờ + phút', () => {
    expect(remainText(30000)).toBe('chưa tới 1 phút');
    expect(remainText(80 * MIN)).toBe('1 giờ 20 phút');
    expect(remainText(60 * MIN)).toBe('1 giờ');
  });
});

describe('bảng chọn hạt (R-VUON-3)', () => {
  it('R-VUON-3: mới cài → chỉ "Cải ngọt · còn 3"; túi trống → không thẻ nào', () => {
    const cards = seedCards(freshGarden());
    expect(cards.map((c) => [c.crop.name, c.left, c.time])).toEqual([['Cải ngọt', 3, '30 phút']]);
    expect(seedCards({ ...freshGarden(), seeds: {} })).toEqual([]);
    expect(pickSeedSub('o-3')).toBe('Luống 3 · tưới 2 lượt thì thu được nhiều nhất');
    expect(CROPS.map(growText)).toEqual(['30 phút', '1 giờ', '2 giờ', '3 giờ', '4 giờ', '5 giờ', '6 giờ', '8 giờ']);
  });
});

describe('kho nông sản (R-VUON-7)', () => {
  const today = maNgayVN(vn(14, 10));

  it('R-VUON-7: đã bán 0, kho 4 Bí + 3 Cải + 2 Ngô → "Bán hết · +47"; chip túi hạt', () => {
    const g: Garden = { ...freshGarden(), barn: { bi: 4, cai: 3, ngo: 2 }, seeds: { cai: 2, ngo: 1 } };
    const v = storeView(g, today);
    expect(v.soldText).toBe('Hôm nay đã bán 0 / 60 Văn tiền');
    expect(v.rows.map((r) => [r.crop.name, r.count])).toEqual([['Cải ngọt', 3], ['Ngô', 2], ['Bí đỏ', 4]]);
    expect(v.overCap).toBe(false);
    expect(sellAllText(v)).toBe('Bán hết · +47');
    expect(bagChips(g)).toEqual([{ name: 'Cải ngọt', n: 2 }, { name: 'Ngô', n: 1 }]);
  });

  it('R-VUON-7: đã bán 40, kho 4 Bí đỏ + 2 Ngô → "Bán · +19" + "Hôm nay còn bán được 20 — …"', () => {
    const g: Garden = { ...freshGarden(), barn: { bi: 4, ngo: 2 }, sellDay: today, soldToday: 40 };
    const v = storeView(g, today);
    expect(v.overCap).toBe(true);
    expect(sellAllText(v)).toBe('Bán · +19');
    expect(capLeftText(v.room)).toBe('Hôm nay còn bán được 20 — phần còn lại giữ trong kho');
    expect(v.frac).toBeCloseTo(40 / 60);
  });

  it('R-VUON-7: đã bán 60 → đủ trần: nút nét đứt, hàng vẫn hiện; kho trống → không hàng', () => {
    const g: Garden = { ...freshGarden(), barn: { bi: 4 }, sellDay: today, soldToday: 60 };
    const v = storeView(g, today);
    expect(v.capped).toBe(true);
    expect(v.rows).toHaveLength(1);
    expect(v.rows[0].canSell).toBe(false);
    expect(v.sellAll).toBe(0);
    expect(storeView(freshGarden(), today).rows).toEqual([]);
  });
});

describe('mở ô + tấm báo (R-VUON-8, R-VUON-6)', () => {
  it('R-VUON-8: 6 ô, có 1 280 → "Mở luống 7 / 12", còn lại 1 230; có 20 → "Còn thiếu 30", còn lại "—"; đủ 12 → không hộp', () => {
    const v = unlockView(freshGarden(), 1280)!;
    expect(v.title).toBe('Mở luống 7 / 12');
    expect(v.rows).toEqual([['Đang có', '1 280'], ['Giá', '−50'], ['Còn lại', '1 230']]);
    expect(v.action).toBe('Mở · 50');
    const s = unlockView(freshGarden(), 20)!;
    expect(s.action).toBe('Còn thiếu 30');
    expect(s.rows[2]).toEqual(['Còn lại', '—']);
    expect(unlockView({ ...freshGarden(), open: 12 }, 999)).toBeNull();
  });

  it('R-VUON-6: tấm báo "Vườn rau: 6 luống đã chín" · "+4 Bí đỏ vào kho"; R-VUON-8: "Đã mở luống 7"', () => {
    expect(ripeToast(6).title).toBe('Vườn rau: 6 luống đã chín');
    expect(harvestToast(CROPS[4], 4).title).toBe('+4 Bí đỏ vào kho');
    expect(unlockedToast(7).title).toBe('Đã mở luống 7');
  });
});
