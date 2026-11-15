import { describe, expect, it } from 'vitest';
import { freshGarden, type Garden, type Plot } from './vuon';
import { ringView } from './vuonVong';
import { plotBadges, ringPlace, RING_SIZES, slotXY, suggestSlot } from './vuonVongHud';

const vn = (d: number, h: number, m = 0): number => Date.UTC(2026, 10, d, h - 7, m);
const t0 = vn(14, 8);
const plot = (crop: Plot['crop'], plantedAt: number, more: Partial<Plot> = {}): Plot => ({ crop, plantedAt, watered: 0, boost: 0, bug: 0, weed: 0, ...more });
const withPlots = (g: Garden, ps: Record<string, Plot>): Garden => ({ ...g, plots: { ...g.plots, ...ps } });
const look = (more: Partial<{ soil: 'kho' | 'am' | 'thuong'; bug: boolean; weeds: 0 | 2 | 3; fert: boolean }> = {}) => ({ soil: 'am' as const, bug: false, weeds: 0 as const, fert: false, ...more });

describe('HUD vòng công cụ (R-VUON-2)', () => {
  it('R-VUON-2: 5 ô quanh cách 72°, bán kính 64 — Hạt giống ở đỉnh, Bình tưới bên phải trên', () => {
    expect(slotXY(null)).toEqual({ x: 0, y: 0 });
    expect(slotXY(0)).toEqual({ x: 0, y: -64 });
    const b = slotXY(72);
    expect(b.x).toBeCloseTo(60.87, 1);
    expect(b.y).toBeCloseTo(-19.78, 1);
  });

  it('R-VUON-2: ô "nên làm" tối đa 1 — chín → Tay; luống trống → Hạt giống; hoang → Mở ô', () => {
    expect(suggestSlot(ringView(freshGarden(), 'o-1', t0))).toBe('hat');
    expect(suggestSlot(ringView(freshGarden(), 'o-9', t0))).toBe('mo');
    const g = withPlots(freshGarden(), { 'o-4': plot('lua', t0) });
    expect(suggestSlot(ringView(g, 'o-4', vn(14, 11)))).toBe('tay');
    // Cải ngọt vừa gieo chưa tưới → đất khô → Bình tưới
    const g2 = withPlots(freshGarden(), { 'o-2': plot('cai', t0) });
    expect(suggestSlot(ringView(g2, 'o-2', t0 + 60000))).toBe('binh');
  });

  it('R-VUON-2: túi hạt trống, luống trống → không ô nào "nên làm"', () => {
    const g = { ...freshGarden(), seeds: {} };
    expect(suggestSlot(ringView(g, 'o-1', t0))).toBeNull();
  });

  it('R-VUON-2: vòng ở luống sát mép / sát thanh công cụ → dịch vào trong, lệch xa → mũi chỉ', () => {
    const area = { left: 16, top: 16, right: 374, bottom: 828 };
    const r = RING_SIZES.outer;
    // giữa màn, không vướng → đúng tại luống
    expect(ringPlace({ x: 195, y: 500 }, r, area, [])).toEqual({ x: 195, y: 500, pointer: false });
    // sát mép trái → kẹp vào trong (lệch 60 < 104 → không mũi chỉ)
    expect(ringPlace({ x: 46, y: 500 }, r, area, [])).toMatchObject({ x: 106, y: 500, pointer: false });
    // đè thanh công cụ (đáy 740–800) → đẩy lên trên thanh
    const toolbar = { left: 12, top: 740, right: 378, bottom: 800 };
    expect(ringPlace({ x: 195, y: 700 }, r, area, [toolbar])).toEqual({ x: 195, y: 740 - r - 8, pointer: false });
    const p = ringPlace({ x: 195, y: 770 }, r, area, [toolbar]);
    expect(p.y).toBe(740 - r - 8);
    expect(p.pointer).toBe(true);
  });

  it('R-VUON-2: luống hoang (bán kính 33) cạnh joystick → đẩy ra khỏi joystick', () => {
    const area = { left: 16, top: 16, right: 374, bottom: 828 };
    const joy = { left: 36, top: 625, right: 140, bottom: 729 };
    const p = ringPlace({ x: 90, y: 640 }, RING_SIZES.outerWild, area, [joy]);
    expect(p.y).toBeLessThanOrEqual(625 - 33 - 8);
  });
});

describe('dấu trạng thái luống (R-VUON-5/10/11)', () => {
  it('R-VUON-10: nhiều vấn đề → hàng tối đa 3 dấu thứ tự sâu · cỏ · khô; chín đứng một mình', () => {
    expect(plotBadges(look({ soil: 'kho', bug: true, weeds: 2 }), false)).toEqual(['sau', 'co', 'kho']);
    expect(plotBadges(look({ soil: 'kho', bug: true, weeds: 2 }), false, true)).toEqual(['sau', 'co', 'kho']);
    expect(plotBadges(look({ soil: 'kho' }), false, true)).toEqual(['kho', 'bon']);
    expect(plotBadges(look({ bug: true }), true)).toEqual(['chin']);
    expect(plotBadges(look(), false)).toEqual([]);
  });

  it('R-VUON-5: xa / đông → chỉ dấu đầu', () => {
    expect(plotBadges(look({ soil: 'kho', weeds: 3 }), false, false, true)).toEqual(['co']);
  });
});
