import { describe, expect, it } from 'vitest';
import { freshGarden, type Garden, type Plot } from './vuon';
import { fits, pickSeed, pickSlot, RING, ringView, seedGrid, standSpot, STAND_OFF, whenChosen } from './vuonVong';

const vn = (d: number, h: number, m = 0): number => Date.UTC(2026, 10, d, h - 7, m);
const t0 = vn(14, 8);
const plot = (crop: Plot['crop'], plantedAt: number, more: Partial<Plot> = {}): Plot => ({ crop, plantedAt, watered: 0, boost: 0, bug: 0, weed: 0, ...more });
const withPlots = (g: Garden, ps: Record<string, Plot>): Garden => ({ ...g, plots: { ...g.plots, ...ps } });
const litOf = (g: Garden, id: string, now: number): Record<string, boolean> => Object.fromEntries(ringView(g, id, now).slots.map((s) => [s.id, s.lit]));

describe('vòng công cụ quanh luống (R-VUON-2)', () => {
  it('R-VUON-2: Tay ở giữa; quanh theo chiều kim đồng hồ từ trên Hạt giống · Bình tưới · Bắt sâu · Nhổ cỏ · Phân bón; phím 1–6', () => {
    expect(RING.map((t) => t.name)).toEqual(['Tay', 'Hạt giống', 'Bình tưới', 'Bắt sâu', 'Nhổ cỏ', 'Phân bón']);
    const v = ringView(freshGarden(), 'o-1', t0);
    expect(v.wild).toBe(false);
    expect(v.slots.map((s) => s.at)).toEqual([null, 0, 72, 144, 216, 288]);
    expect(v.slots.map((s) => s.key)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(v.slots.map((s) => s.count)).toEqual([null, 3, null, null, null, 3]);
  });

  it('R-VUON-2: vườn mới, luống 1 trống → chỉ Hạt giống sáng; Bình tưới mờ "Luống trống"', () => {
    const v = ringView(freshGarden(), 'o-1', t0);
    expect(litOf(freshGarden(), 'o-1', t0)).toEqual({ tay: false, hat: true, binh: false, sau: false, co: false, phan: false });
    expect(v.slots.find((s) => s.id === 'binh')?.why).toBe('Luống trống');
    expect(v.slots.find((s) => s.id === 'hat')?.why).toBeNull();
  });

  it('R-VUON-2: Lúa luống 4 gieo 8:00, lúc 11:00 → Tay sáng (chín), Bắt sâu + Nhổ cỏ sáng, Bình tưới + Hạt giống mờ', () => {
    const g = withPlots(freshGarden(), { 'o-4': plot('lua', t0) });
    expect(litOf(g, 'o-4', vn(14, 11))).toEqual({ tay: true, hat: false, binh: false, sau: true, co: true, phan: false });
  });

  it('R-VUON-2: luống hoang → vòng chỉ ô giữa "Mở ô" (hộp xác nhận R-VUON-8)', () => {
    const v = ringView(freshGarden(), 'o-9', t0);
    expect(v).toEqual({ plot: 'o-9', wild: true, slots: [{ id: 'mo', name: 'Mở ô', key: 1, at: null, lit: true, why: null, count: null }] });
    expect(pickSlot(freshGarden(), 'o-9', 'mo', t0)).toEqual({ kind: 'open' });
    expect(pickSlot(freshGarden(), 'o-9', 'binh', t0)).toMatchObject({ kind: 'no' });
  });

  it('R-VUON-2: chọn ô sáng → việc lên đúng luống; ô mờ → câu báo', () => {
    const g = withPlots(freshGarden(), { 'o-3': plot('lua', t0) });
    expect(pickSlot(g, 'o-3', 'binh', vn(14, 8, 10))).toEqual({ kind: 'job', plot: 'o-3', act: { act: 'water', plot: 'o-3' }, work: 'tuoi' });
    expect(pickSlot(g, 'o-3', 'tay', vn(14, 9, 40))).toEqual({ kind: 'no', why: 'Lúa · còn 1 giờ 20 phút' });
  });
});

describe('việc lên luống (R-VUON-5/10/11/12)', () => {
  const g = withPlots(freshGarden(), { 'o-2': plot('lua', t0), 'o-3': plot('lua', t0, { watered: 1 }), 'o-5': plot('cai', t0) });

  it('R-VUON-5: Bình tưới: đất khô → tưới; đất ẩm → "Đất còn ẩm"; chín → dùng Tay; trống', () => {
    expect(fits(g, 'o-2', 'binh', vn(14, 8, 10))).toMatchObject({ ok: true, work: 'tuoi' });
    expect(fits(g, 'o-3', 'binh', vn(14, 8, 10))).toEqual({ ok: false, why: 'Đất còn ẩm' });
    expect(fits(g, 'o-5', 'binh', vn(14, 9))).toEqual({ ok: false, why: 'Cây đã chín — dùng Tay để thu' });
    expect(fits(g, 'o-1', 'binh', t0)).toEqual({ ok: false, why: 'Luống trống' });
  });

  it('R-VUON-10/11: Bắt sâu / Nhổ cỏ chỉ khi đang có; Tay: chín → thu', () => {
    expect(fits(g, 'o-2', 'sau', vn(14, 8, 58))).toEqual({ ok: true, act: { act: 'bug', plot: 'o-2' }, work: 'bat' });
    expect(fits(g, 'o-2', 'sau', vn(14, 8, 57))).toEqual({ ok: false, why: 'Không có sâu' });
    expect(fits(g, 'o-3', 'co', vn(14, 10, 5))).toMatchObject({ ok: true, work: 'nho' });
    expect(fits(g, 'o-2', 'co', vn(14, 10, 5))).toEqual({ ok: false, why: 'Không có cỏ' });
    expect(fits(g, 'o-5', 'tay', vn(14, 9))).toMatchObject({ ok: true, work: 'thu' });
    expect(fits(g, 'o-1', 'tay', t0)).toEqual({ ok: false, why: 'Luống trống — chọn Hạt giống để gieo' });
  });

  it('R-VUON-12: Phân bón: cây đang lớn chưa bón → bón; đã bón → "Cây này bón rồi"; hết phân → mờ', () => {
    expect(fits(g, 'o-2', 'phan', vn(14, 9))).toMatchObject({ ok: true, work: 'bon' });
    const b = withPlots(g, { 'o-2': plot('lua', t0, { boost: 1000 }) });
    expect(fits(b, 'o-2', 'phan', vn(14, 9))).toEqual({ ok: false, why: 'Cây này bón rồi' });
    const none = { ...g, fert: 0 };
    expect(fits(none, 'o-2', 'phan', vn(14, 9))).toEqual({ ok: false, why: 'Hết phân bón — mua ở Tạp hoá trấn' });
    expect(ringView(none, 'o-2', vn(14, 9)).slots.find((s) => s.id === 'phan')).toMatchObject({ lit: false, count: 0 });
  });
});

describe('gieo từ vòng (R-VUON-3)', () => {
  it('R-VUON-3: mới cài, luống 1 → Hạt giống → lưới chỉ "Cải ngọt 3" → chọn → gieo đúng luống 1', () => {
    const g = freshGarden();
    expect(pickSlot(g, 'o-1', 'hat', t0)).toEqual({ kind: 'grid', seeds: [{ crop: 'cai', name: 'Cải ngọt', count: 3 }] });
    expect(pickSeed(g, 'o-1', 'cai', t0)).toEqual({ kind: 'job', plot: 'o-1', act: { act: 'sow', plot: 'o-1', crop: 'cai' }, work: 'gieo' });
  });

  it('R-VUON-3: luống có cây → Hạt giống mờ "Luống đã có cây"; túi trống → mờ "Túi hạt trống …"; loại hết → "Hết hạt {cây}"', () => {
    const g = withPlots(freshGarden(), { 'o-1': plot('cai', t0) });
    expect(pickSlot(g, 'o-1', 'hat', t0)).toEqual({ kind: 'no', why: 'Luống đã có cây' });
    const empty: Garden = { ...g, seeds: {} };
    expect(ringView(empty, 'o-2', t0).slots.find((s) => s.id === 'hat')).toMatchObject({ lit: false, why: 'Túi hạt trống — mua hạt ở Tạp hoá trấn', count: 0 });
    expect(pickSeed(empty, 'o-2', 'cai', t0)).toEqual({ kind: 'no', why: 'Hết hạt Cải ngọt' });
  });

  it('R-VUON-3: lưới hạt chỉ loại đang có, theo thứ tự bảng cây', () => {
    const g: Garden = { ...freshGarden(), seeds: { cai: 2, ngo: 5 } };
    expect(seedGrid(g)).toEqual([
      { crop: 'cai', name: 'Cải ngọt', count: 2 },
      { crop: 'ngo', name: 'Ngô', count: 5 },
    ]);
  });
});

describe('một việc mỗi lần + điểm đứng (R-VUON-13)', () => {
  it('R-VUON-13: rảnh → đi làm; đang đi tới → đổi việc; đang diễn → chờ diễn xong', () => {
    expect(whenChosen(null)).toBe('di');
    expect(whenChosen('walk')).toBe('doi');
    expect(whenChosen('work')).toBe('cho');
  });

  it('R-VUON-13: điểm đứng ở mép luống phía người chơi, mặt nhìn tâm luống', () => {
    const s = standSpot({ x: 10, z: -5 }, { x: 10, z: 0 });
    expect(s).toEqual({ x: 10, z: -5 + STAND_OFF, faceX: 10, faceZ: -5 });
    expect(standSpot({ x: 0, z: 0 }, { x: 0, z: 0 }).z).toBeCloseTo(STAND_OFF);
  });
});
