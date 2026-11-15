import { describe, expect, it } from 'vitest';
import { maNgayVN } from './gioVN';
import {
  buySeed,
  canWater,
  CROPS,
  freshGarden,
  harvest,
  openPlot,
  parseActReply,
  parseGarden,
  plotId,
  plotState,
  remainingMs,
  ripeCount,
  sell,
  sellCapped,
  sow,
  water,
  yieldOf,
  type Garden,
  type GardenResult,
  type Plot,
} from './vuon';
import { gardenSpeed, nearestPlot, openPlotLabel, remainingText, seedLabel, sellLabel } from './vuonHud';
import { gardenTrialAct, newTrial, parseTrial } from './walletRules';

// Cùng ví dụ sổ với app/test/rules/vuon_test.dart (luật web chép Dart — lệch là đỏ).

/** Giờ Việt Nam (GMT+7) ngày [d] tháng 11/2026 → ms epoch UTC. */
const vn = (d: number, h: number, m = 0): number => Date.UTC(2026, 10, d, h - 7, m);
const MIN = 60000;
const withPlot = (g: Garden, id: string, p: Plot): Garden => ({ ...g, plots: { ...g.plots, [id]: p } });
const ok = (r: GardenResult): Extract<GardenResult, { ok: true }> => {
  if (!r.ok) throw new Error(`không được: ${r.reason}`);
  return r;
};

describe('vườn rau (R-VUON-1)', () => {
  it('R-VUON-1: mới cài → 12 luống, 6 mở trống, 6 hoang', () => {
    const g = freshGarden();
    expect(Array.from({ length: 12 }, (_, i) => plotState(g, plotId(i + 1), 0))).toEqual([
      ...Array(6).fill('trong'),
      ...Array(6).fill('hoang'),
    ]);
  });

  it('R-VUON-1: vườn hỏng / thiếu → vườn mới; luống hoang không giữ cây', () => {
    expect(parseGarden('x').open).toBe(6);
    const g = parseGarden({ open: 6, plots: { 'o-7': { crop: 'cai', plantedAt: 1 }, 'o-1': { crop: 'la-lung', plantedAt: 1 } } });
    expect(g.plots['o-7'].crop).toBeNull();
    expect(g.plots['o-1'].crop).toBeNull();
  });
});

describe('luống gần nhất (R-VUON-2)', () => {
  it('R-VUON-2: E mở vòng ở luống gần nhất dưới 1,6 m — cách 1,2 m được; lùi 1,7 m → không; luống gần hơn thắng', () => {
    const plots = [
      { id: 'o-1', x: 0, z: 0 },
      { id: 'o-2', x: 2.4, z: 0 },
    ];
    expect(nearestPlot(plots, 1.2, 0)).toEqual({ id: 'o-1', dist: 1.2 });
    expect(nearestPlot(plots, -1.7, 0)).toBeNull();
    expect(nearestPlot(plots, 1.5, 0)?.id).toBe('o-2');
  });

  it('R-VUON-2: Cải ngọt gieo 10 phút trước, đã tưới 1 lượt → nhãn "còn 20 phút"', () => {
    const p: Plot = { crop: 'cai', plantedAt: vn(14, 9), watered: 1, boost: 0, bug: 0, weed: 0 };
    expect(canWater(p, vn(14, 9, 10))).toBe(false);
    expect(remainingText(remainingMs(p, vn(14, 9, 10)))).toBe('còn 20 phút');
    expect(remainingText(80 * MIN)).toBe('còn 1 giờ 20 phút');
    expect(remainingText(0)).toBe('đã chín');
  });
});

describe('gieo từ túi hạt (R-VUON-3)', () => {
  it('R-VUON-3: mới cài túi 3 hạt Cải ngọt; gieo luống 1 → có Cải ngọt, túi còn 2, không trừ tiền', () => {
    const g = freshGarden();
    expect(g.seeds).toEqual({ cai: 3 });
    const r = ok(sow(g, 'o-1', 'cai', vn(14, 9)));
    expect(r.garden.plots['o-1']).toEqual({ crop: 'cai', plantedAt: vn(14, 9), watered: 0, boost: 0, bug: 0, weed: 0 });
    expect(r.garden.seeds.cai).toBe(2);
    expect(r.amount).toBe(0);
  });

  it('R-VUON-3: gieo hết 3 hạt → no-seed; luống đang có cây → busy; luống hoang → locked', () => {
    let g = freshGarden();
    for (const p of ['o-1', 'o-2', 'o-3']) g = ok(sow(g, p, 'cai', 0)).garden;
    expect(sow(g, 'o-4', 'cai', 0)).toEqual({ ok: false, reason: 'no-seed', short: 0 });
    expect(sow(g, 'o-1', 'cai', 0)).toMatchObject({ reason: 'busy' });
    expect(sow(g, 'o-7', 'cai', 0)).toMatchObject({ reason: 'locked' });
  });
});

describe('lớn theo giờ thật (R-VUON-4)', () => {
  it('R-VUON-4: Lúa gieo 8:00 → 8:15 vừa gieo, 8:20 mầm, 9:30 đang lớn, 11:00 chín; 3 ngày sau vẫn chín', () => {
    const g = withPlot(freshGarden(), 'o-1', { crop: 'lua', plantedAt: vn(14, 8), watered: 0, boost: 0, bug: 0, weed: 0 });
    expect(plotState(g, 'o-1', vn(14, 8, 15))).toBe('vua-gieo');
    expect(plotState(g, 'o-1', vn(14, 8, 20))).toBe('mam');
    expect(plotState(g, 'o-1', vn(14, 9, 30))).toBe('lon');
    expect(plotState(g, 'o-1', vn(14, 11))).toBe('chin');
    expect(plotState(g, 'o-1', vn(17, 12))).toBe('chin');
  });

  it('R-VUON-4: giờ máy lùi → như vừa gieo; bảng thời gian 8 cây; ?vuon=60 → Cải ngọt chín sau 30 giây', () => {
    const g = withPlot(freshGarden(), 'o-1', { crop: 'cai', plantedAt: vn(14, 9), watered: 0, boost: 0, bug: 0, weed: 0 });
    expect(plotState(g, 'o-1', vn(14, 7))).toBe('vua-gieo');
    expect(remainingMs(g.plots['o-1'], vn(14, 7))).toBe(30 * MIN);
    expect(CROPS.map((c) => `${c.name} ${c.minutes}`)).toEqual([
      'Cải ngọt 30', 'Củ cải 60', 'Ngô 120', 'Lúa 180', 'Bí đỏ 240', 'Hoa cúc 300', 'Dưa hấu 360', 'Trà 480',
    ]);
    const speed = gardenSpeed('?vung=nha-ta&vuon=60');
    expect(speed).toBe(60);
    expect(plotState(g, 'o-1', vn(14, 9) + 30_000, speed)).toBe('chin');
    expect(gardenSpeed('')).toBe(1);
  });
});

describe('tưới (R-VUON-5)', () => {
  it('R-VUON-5: Cải ngọt 9:00 — tưới 9:01; 9:10 chưa tới lượt 2; 9:20 tưới; 9:30 chín thu 4', () => {
    let g = withPlot(freshGarden(), 'o-1', { crop: 'cai', plantedAt: vn(14, 9), watered: 0, boost: 0, bug: 1, weed: 1 }); // đã sạch sâu / cỏ
    g = ok(water(g, 'o-1', vn(14, 9, 1))).garden;
    expect(water(g, 'o-1', vn(14, 9, 10))).toMatchObject({ reason: 'dry' });
    g = ok(water(g, 'o-1', vn(14, 9, 20))).garden;
    expect(water(g, 'o-1', vn(14, 9, 25))).toMatchObject({ reason: 'dry' });
    expect(ok(harvest(g, 'o-1', vn(14, 9, 30))).got).toBe(4);
  });

  it('R-VUON-5: tưới 1 lượt → 3; không tưới → 2; chín thì không tưới nữa', () => {
    const p: Plot = { crop: 'cai', plantedAt: vn(14, 9), watered: 0, boost: 0, bug: 0, weed: 0 };
    expect(yieldOf({ ...p, watered: 1, bug: 1, weed: 1 }, 'o-1')).toBe(3);
    expect(yieldOf(p, 'o-1')).toBe(2);
    expect(canWater(p, vn(14, 9, 30))).toBe(false);
    expect(canWater(p, vn(14, 9))).toBe(true);
  });
});

describe('thu hoạch (R-VUON-6)', () => {
  it('R-VUON-6: thu Bí đỏ tưới 2 lượt → +4 vào kho, luống trống; chưa chín → not-ripe', () => {
    const g = withPlot(freshGarden(), 'o-2', { crop: 'bi', plantedAt: vn(14, 8), watered: 2, boost: 0, bug: 1, weed: 0 });
    expect(harvest(g, 'o-2', vn(14, 11))).toMatchObject({ reason: 'not-ripe' });
    const r = ok(harvest(g, 'o-2', vn(14, 12)));
    expect(r.got).toBe(4);
    expect(r.garden.barn.bi).toBe(4);
    expect(r.garden.plots['o-2'].crop).toBeNull();
  });

  it('R-VUON-6: 3 ngày sau 6 luống chín vẫn còn → 6 luống đã chín', () => {
    let g = freshGarden();
    for (let i = 1; i <= 6; i++) g = withPlot(g, plotId(i), { crop: 'tra', plantedAt: vn(14, 8), watered: 0, boost: 0, bug: 0, weed: 0 });
    expect(ripeCount(g, vn(17, 8))).toBe(6);
  });
});

describe('bán (R-VUON-7)', () => {
  it('R-VUON-7: kho 4 Trà + 3 Cải, đã bán 20 → "Bán hết" +39, còn 1 Trà 1 Cải, đã đủ', () => {
    const today = maNgayVN(vn(14, 10));
    const g: Garden = { ...freshGarden(), barn: { tra: 4, cai: 3 }, sellDay: today, soldToday: 20 };
    const r = ok(sell(g, null, today));
    expect(r.amount).toBe(39);
    expect(r.garden.soldToday).toBe(59);
    expect(r.garden.barn).toEqual({ tra: 1, cai: 1 });
    expect(sellCapped(r.garden, today)).toBe(true);
    expect(sell(r.garden, null, today)).toMatchObject({ reason: 'cap' });
    expect(sellLabel(39)).toBe('+39 · Bán nông sản');
  });

  it('R-VUON-7: 0 giờ VN hôm sau → bán lại được; kho trống → empty', () => {
    const d14 = maNgayVN(vn(14, 23, 59));
    const d15 = maNgayVN(vn(15, 0, 1));
    const g: Garden = { ...freshGarden(), barn: { tra: 1 }, sellDay: d14, soldToday: 59 };
    expect(sell(g, 'tra', d14)).toMatchObject({ reason: 'cap' });
    expect(ok(sell(g, 'tra', d15)).amount).toBe(11);
    expect(sell(freshGarden(), null, d15)).toMatchObject({ reason: 'empty' });
  });
});

describe('mở ô (R-VUON-8)', () => {
  it('R-VUON-8: 6 ô, có 70 → mở ô 7 (50); ô 8 cần 80 → còn thiếu 60', () => {
    const r = ok(openPlot(freshGarden(), 70));
    expect(r.amount).toBe(-50);
    expect(plotState(r.garden, 'o-7', 0)).toBe('trong');
    expect(openPlot(r.garden, 20)).toEqual({ ok: false, reason: 'short', short: 60 });
    expect(openPlotLabel(50)).toBe('−50 · Mở ô đất');
  });

  it('R-VUON-8: giá 50 · 80 · 120 · 160 · 200 · 250; đủ 12 → full', () => {
    let g = freshGarden();
    const paid: number[] = [];
    for (let i = 0; i < 6; i++) {
      const r = ok(openPlot(g, 1000));
      paid.push(-r.amount);
      g = r.garden;
    }
    expect(paid).toEqual([50, 80, 120, 160, 200, 250]);
    expect(openPlot(g, 1000)).toMatchObject({ reason: 'full' });
  });
});

describe('mua hạt (R-VUON-9)', () => {
  it('R-VUON-9: có 10, mua hạt Cải ngọt → còn 6, túi +1; mua tiếp → còn 2', () => {
    let w = { ...newTrial(), coins: 10 };
    w = gardenTrialAct(w, { act: 'buy', crop: 'cai' }, 0).wallet;
    expect(w.coins).toBe(6);
    expect(w.garden.seeds.cai).toBe(4);
    w = gardenTrialAct(w, { act: 'buy', crop: 'cai' }, 0).wallet;
    expect(w.coins).toBe(2);
  });

  it('R-VUON-9: có 7, hạt Ngô (8) → còn thiếu 1; giá hạt; không cây nào lỗ', () => {
    expect(buySeed(freshGarden(), 'ngo', 7)).toEqual({ ok: false, reason: 'short', short: 1 });
    expect(CROPS.map((c) => c.seed)).toEqual([4, 6, 8, 10, 12, 14, 16, 20]);
    for (const c of CROPS) expect(2 * c.sell).toBeGreaterThanOrEqual(c.seed);
  });

  it('R-VUON-9: có 50, × 5 Hạt Ngô → trả 40, còn 10, túi +5; × 10 (80) → còn thiếu 30; số lạ → bad', () => {
    let w = { ...newTrial(), coins: 50 };
    const r = gardenTrialAct(w, { act: 'buy', crop: 'ngo', count: 5 }, 0);
    expect(r.result).toMatchObject({ ok: true, amount: -40 });
    w = r.wallet;
    expect(w.coins).toBe(10);
    expect(w.garden.seeds.ngo).toBe(5);
    expect(buySeed(freshGarden(), 'ngo', 50, 10)).toEqual({ ok: false, reason: 'short', short: 30 });
    expect(buySeed(freshGarden(), 'ngo', 500, 3)).toMatchObject({ ok: false, reason: 'bad' });
    expect(seedLabel(CROPS[2], 5)).toBe('−40 · Hạt Ngô');
  });
});

describe('ví thử + cầu nối (R-TIEN-7, R-VUON-1)', () => {
  it('R-TIEN-7: ví thử mới có vườn mới; vườn giữ qua đọc lại; mở ô trừ ví thử', () => {
    const w = newTrial();
    expect(w.garden.open).toBe(6);
    const r = gardenTrialAct(w, { act: 'open' }, 0);
    expect(r.wallet.coins).toBe(250);
    expect(parseTrial(JSON.parse(JSON.stringify(r.wallet))).garden.open).toBe(7);
  });

  it('R-VUON-1: đọc câu trả lời gardenAct; sai dạng → null', () => {
    expect(parseActReply({ ok: false, reason: 'short', balance: 20, short: 30 })).toEqual({ ok: false, reason: 'short', short: 30, balance: 20 });
    expect(parseActReply({ ok: true, garden: {}, balance: 5, amount: -50 })).toMatchObject({ ok: true, amount: -50, balance: 5 });
    expect(parseActReply({ ok: false, reason: 'la', balance: 1 })).toBeNull();
    expect(parseActReply(null)).toBeNull();
  });
});
