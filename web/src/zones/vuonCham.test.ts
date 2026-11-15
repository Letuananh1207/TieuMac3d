import { describe, expect, it } from 'vitest';
import { catchBug, cropOf, fertilize, freshGarden, harvest, hasBug, parseGarden, plotState, pullWeed, remainingMs, water, weedsOf, type Garden, type GardenResult, type Plot } from './vuon';
import { fertLabel, fnv1a, pestsOf, yieldFrom } from './vuonCham';
import { harvestFloat, lookText, plotLook } from './vuonHud';
import { gardenTrialAct, newTrial, parseTrial } from './walletRules';

// Cùng ví dụ sổ + cùng vector với app/test/rules/vuon_cham_test.dart (luật web chép Dart — lệch là đỏ).

const vn = (d: number, h: number, m = 0): number => Date.UTC(2026, 10, d, h - 7, m);
const t0 = vn(14, 8);
const plot = (crop: Plot['crop'], plantedAt: number, more: Partial<Plot> = {}): Plot => ({ crop, plantedAt, watered: 0, boost: 0, bug: 0, weed: 0, ...more });
const withPlot = (g: Garden, id: string, p: Plot): Garden => ({ ...g, plots: { ...g.plots, [id]: p } });
const lua = (id: string, watered = 0): Garden => withPlot(freshGarden(), id, plot('lua', t0, { watered }));
const ok = (r: GardenResult): Extract<GardenResult, { ok: true }> => {
  if (!r.ok) throw new Error(`không được: ${r.reason}`);
  return r;
};

describe('hàm băm định sẵn (R-VUON-10/11)', () => {
  it('R-VUON-10: FNV-1a 32-bit cùng vector với Dart', () => {
    expect(fnv1a('')).toBe(2166136261);
    expect(fnv1a('a')).toBe(3826002220);
    expect(fnv1a('o-3@1794013200000')).toBe(417460559);
    expect(t0).toBe(1794618000000);
  });

  it('R-VUON-10: gieo 8:00 14/11 — o-1 sạch, o-2 sâu 318 ‰, o-3 cỏ 691 ‰ (2 bụi), o-4 sâu 220 ‰ + cỏ 714 ‰ (3 bụi)', () => {
    const s = [1, 2, 3, 4].map((i) => pestsOf(`o-${i}`, t0));
    expect(s.map((p) => p.bugAt)).toEqual([-1, 318, -1, 220]);
    expect(s.map((p) => p.weedAt)).toEqual([-1, -1, 691, 714]);
    expect(s[2].weeds).toBe(2);
    expect(s[3].weeds).toBe(3);
  });
});

describe('sâu ăn lá (R-VUON-10)', () => {
  it('R-VUON-10: Lúa o-2 gieo 8:00 → 8:57 chưa có sâu, 8:58 có; bắt → hết, "no-bug" lần sau', () => {
    const g = lua('o-2');
    expect(hasBug(g.plots['o-2'], 'o-2', vn(14, 8, 57))).toBe(false);
    expect(hasBug(g.plots['o-2'], 'o-2', vn(14, 8, 58))).toBe(true);
    expect(catchBug(g, 'o-2', vn(14, 8, 57))).toMatchObject({ reason: 'no-bug' });
    const after = ok(catchBug(g, 'o-2', vn(14, 8, 58))).garden;
    expect(hasBug(after.plots['o-2'], 'o-2', vn(14, 12))).toBe(false);
    expect(catchBug(freshGarden(), 'o-2', 0)).toMatchObject({ reason: 'empty' });
    expect(catchBug(freshGarden(), 'o-8', 0)).toMatchObject({ reason: 'locked' });
  });

  it('R-VUON-10: ?vuon=60 → mốc sâu tính theo thời gian đã nhân (Lúa 3 phút: sâu từ giây 57,3)', () => {
    const g = lua('o-2');
    expect(hasBug(g.plots['o-2'], 'o-2', t0 + 57_000, 60)).toBe(false);
    expect(hasBug(g.plots['o-2'], 'o-2', t0 + 58_000, 60)).toBe(true);
  });
});

describe('cỏ dại (R-VUON-11)', () => {
  it('R-VUON-11: Lúa o-3 gieo 8:00 → 10:04 chưa, 10:05 có 2 bụi cỏ; nhổ → sạch', () => {
    const g = lua('o-3');
    expect(weedsOf(g.plots['o-3'], 'o-3', vn(14, 10, 4))).toBe(0);
    expect(weedsOf(g.plots['o-3'], 'o-3', vn(14, 10, 5))).toBe(2);
    expect(pullWeed(g, 'o-3', vn(14, 10, 4))).toMatchObject({ reason: 'no-weed' });
    const after = ok(pullWeed(g, 'o-3', vn(14, 10, 5))).garden;
    expect(weedsOf(after.plots['o-3'], 'o-3', vn(14, 12))).toBe(0);
  });
});

describe('sản lượng (R-VUON-6)', () => {
  it('R-VUON-6: Lúa o-4 tưới 2 lượt — bỏ mặc sâu + cỏ → 2; bắt sâu → 3; bắt sâu + nhổ cỏ → 4', () => {
    let g = lua('o-4', 2);
    expect(ok(harvest(g, 'o-4', vn(14, 11))).got).toBe(2);
    g = ok(catchBug(g, 'o-4', vn(14, 9))).garden;
    expect(ok(harvest(g, 'o-4', vn(14, 11))).got).toBe(3);
    g = ok(pullWeed(g, 'o-4', vn(14, 10, 30))).garden;
    expect(ok(harvest(g, 'o-4', vn(14, 11))).got).toBe(4);
  });

  it('R-VUON-6: không tưới + có sâu → vẫn 2; chữ nổi "+2 Lúa" + "ít hơn vì sâu và cỏ" chỉ khi thật sự bớt', () => {
    expect(ok(harvest(lua('o-2'), 'o-2', vn(14, 11))).got).toBe(2);
    expect(yieldFrom(2, false, false)).toBe(4);
    expect(yieldFrom(0, true, true)).toBe(2);
    const g = lua('o-4', 2);
    expect(harvestFloat(g, 'o-4', cropOf('lua')!, 2)).toEqual({ text: '+2 Lúa', sub: 'ít hơn vì sâu và cỏ' });
    expect(harvestFloat(lua('o-2'), 'o-2', cropOf('lua')!, 2)).toEqual({ text: '+2 Lúa', sub: null });
  });
});

describe('đất khô / ẩm (R-VUON-5)', () => {
  it('R-VUON-5: Cải ngọt gieo 9:00 → khô ngay; tưới → ẩm; 9:15 khô lại; tưới → ẩm; chín → thường', () => {
    let g = withPlot(freshGarden(), 'o-1', plot('cai', vn(14, 9)));
    expect(plotLook(g, 'o-1', vn(14, 9)).soil).toBe('kho');
    g = ok(water(g, 'o-1', vn(14, 9, 1))).garden;
    expect(plotLook(g, 'o-1', vn(14, 9, 10)).soil).toBe('am');
    expect(plotLook(g, 'o-1', vn(14, 9, 15)).soil).toBe('kho');
    g = ok(water(g, 'o-1', vn(14, 9, 16))).garden;
    expect(plotLook(g, 'o-1', vn(14, 9, 29)).soil).toBe('am');
    expect(plotLook(g, 'o-1', vn(14, 9, 30)).soil).toBe('thuong');
    expect(plotLook(freshGarden(), 'o-1', 0)).toEqual({ soil: 'thuong', bug: false, weeds: 0, fert: false });
  });
});

describe('phân bón (R-VUON-12)', () => {
  it('R-VUON-12: Trà 8 giờ gieo 8:00, bón 10:00 → còn 3 giờ → chín 13:00; túi 3 → 2', () => {
    const g0 = withPlot(freshGarden(), 'o-1', plot('tra', t0));
    expect(g0.fert).toBe(3);
    const g = ok(fertilize(g0, 'o-1', vn(14, 10))).garden;
    expect(g.fert).toBe(2);
    expect(remainingMs(g.plots['o-1'], vn(14, 10))).toBe(3 * 3600000);
    expect(plotState(g, 'o-1', vn(14, 12, 59))).not.toBe('chin');
    expect(plotState(g, 'o-1', vn(14, 13))).toBe('chin');
    expect(plotLook(g, 'o-1', vn(14, 11)).fert).toBe(true);
    expect(lookText(g, 'o-1', vn(14, 11))).toBe('o-1 Trà · lon · kho · đã bón');
  });

  it('R-VUON-12: bón rồi / chín → fert-done; trống → empty; hết phân → no-fert; không thêm sản lượng', () => {
    const g0 = withPlot(freshGarden(), 'o-1', plot('tra', t0, { bug: 1, weed: 1 }));
    const g = ok(fertilize(g0, 'o-1', vn(14, 10))).garden;
    expect(fertilize(g, 'o-1', vn(14, 11))).toMatchObject({ reason: 'fert-done' });
    expect(fertilize(g0, 'o-1', vn(14, 16))).toMatchObject({ reason: 'fert-done' });
    expect(fertilize(g0, 'o-2', vn(14, 10))).toMatchObject({ reason: 'empty' });
    expect(fertilize({ ...g0, fert: 0 }, 'o-1', vn(14, 10))).toMatchObject({ reason: 'no-fert' });
    expect(ok(harvest(g, 'o-1', vn(14, 13))).got).toBe(2);
  });

  it('R-VUON-12, R-TIEN-7: ví thử mới có 3 bao; có 40, × 5 (50) → còn thiếu 10; × 1 → −10 · Phân bón', () => {
    let w = { ...newTrial(), coins: 40 };
    expect(w.garden.fert).toBe(3);
    expect(gardenTrialAct(w, { act: 'buy', item: 'phan', count: 5 }, 0).result).toEqual({ ok: false, reason: 'short', short: 10 });
    const r = gardenTrialAct(w, { act: 'buy', item: 'phan' }, 0);
    expect(r.result).toMatchObject({ ok: true, amount: -10 });
    w = r.wallet;
    expect(w.coins).toBe(30);
    expect(w.garden.fert).toBe(4);
    expect(parseTrial(JSON.parse(JSON.stringify(w))).garden.fert).toBe(4);
    expect(fertLabel(5)).toBe('−50 · Phân bón');
  });
});

describe('chuyển dữ liệu bản cũ (V-73)', () => {
  it('R-VUON-12: vườn bản cũ (không bug / weed / boost / fert) → giữ cây, 3 bao phân, không sâu / cỏ, thu đủ 4', () => {
    const g = parseGarden({ open: 6, plots: { 'o-4': { crop: 'lua', plantedAt: t0, watered: 2 } }, seeds: { cai: 1 } });
    expect(g.plots['o-4']).toEqual(plot('lua', t0, { watered: 2, bug: 1, weed: 1 }));
    expect(g.fert).toBe(3);
    expect(hasBug(g.plots['o-4'], 'o-4', vn(14, 11))).toBe(false);
    expect(ok(harvest(g, 'o-4', vn(14, 11))).got).toBe(4);
    // ví thử bản cũ cũng vậy
    const w = parseTrial({ ...newTrial(), garden: { open: 6, plots: { 'o-4': { crop: 'lua', plantedAt: t0, watered: 2 } } } });
    expect(w.garden.plots['o-4'].crop).toBe('lua');
    expect(w.garden.fert).toBe(3);
  });

  it('R-VUON-12: ghi rồi đọc lại giữ boost / bug / weed / fert', () => {
    const g = ok(fertilize(lua('o-4'), 'o-4', vn(14, 9))).garden;
    const back = parseGarden(JSON.parse(JSON.stringify(g)));
    expect(back.plots['o-4']).toEqual(g.plots['o-4']);
    expect(back.fert).toBe(2);
  });
});
