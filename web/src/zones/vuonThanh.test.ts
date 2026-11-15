import { describe, expect, it } from 'vitest';
import { freshGarden, type Garden, type Plot } from './vuon';
import { fits, holdAfter, nextSeed, queueAdd, queueNext, seedGrid, standSpot, STAND_OFF, TOOLS, toolSlots } from './vuonThanh';

const vn = (d: number, h: number, m = 0): number => Date.UTC(2026, 10, d, h - 7, m);
const t0 = vn(14, 8);
const plot = (crop: Plot['crop'], plantedAt: number, more: Partial<Plot> = {}): Plot => ({ crop, plantedAt, watered: 0, boost: 0, bug: 0, weed: 0, ...more });
const withPlots = (g: Garden, ps: Record<string, Plot>): Garden => ({ ...g, plots: { ...g.plots, ...ps } });

describe('thanh nông cụ (R-VUON-2)', () => {
  it('R-VUON-2: 6 ô Tay · Bình tưới · Hạt giống · Bắt sâu · Nhổ cỏ · Phân bón; số góc ô hạt / phân', () => {
    expect(TOOLS.map((t) => t.name)).toEqual(['Tay', 'Bình tưới', 'Hạt giống', 'Bắt sâu', 'Nhổ cỏ', 'Phân bón']);
    const s = toolSlots(freshGarden(), { tool: 'binh' }, 0);
    expect(s.map((x) => x.count)).toEqual([null, null, 3, null, null, 3]);
    expect(s.find((x) => x.id === 'binh')?.on).toBe(true);
    // vườn mới: chỉ gieo được → Hạt giống sáng, còn lại mờ
    expect(s.map((x) => x.lit)).toEqual([false, false, true, false, false, false]);
  });

  it('R-VUON-2: Lúa o-4 gieo 8:00, lúc 11:00 → Tay sáng (chín), Bắt sâu + Nhổ cỏ sáng, Bình mờ (chín)', () => {
    const g = withPlots(freshGarden(), { 'o-4': plot('lua', t0) });
    const lit = Object.fromEntries(toolSlots(g, null, vn(14, 11)).map((x) => [x.id, x.lit]));
    expect(lit).toMatchObject({ tay: true, binh: false, sau: true, co: true, phan: false });
  });
});

describe('công cụ hợp luống (R-VUON-2/3/5/10/11/12)', () => {
  const g = withPlots(freshGarden(), { 'o-2': plot('lua', t0), 'o-3': plot('lua', t0, { watered: 1 }), 'o-5': plot('cai', t0) });
  it('R-VUON-3: cầm hạt Cải ngọt: luống trống → gieo; luống có cây → "Luống đã có cây"; hết hạt → dừng', () => {
    expect(fits(g, 'o-1', { tool: 'hat', crop: 'cai' }, t0)).toEqual({ ok: true, act: { act: 'sow', plot: 'o-1', crop: 'cai' }, work: 'gieo' });
    expect(fits(g, 'o-2', { tool: 'hat', crop: 'cai' }, t0)).toEqual({ ok: false, why: 'Luống đã có cây', stop: false });
    expect(fits(g, 'o-1', { tool: 'hat', crop: 'ngo' }, t0)).toEqual({ ok: false, why: 'Hết hạt Ngô', stop: true });
    expect(fits(g, 'o-8', { tool: 'hat', crop: 'cai' }, t0)).toMatchObject({ ok: false, stop: false });
  });

  it('R-VUON-5: Bình tưới: đất khô → tưới; đất ẩm → "Đất còn ẩm"; chín → dùng Tay; trống', () => {
    expect(fits(g, 'o-2', { tool: 'binh' }, vn(14, 8, 10))).toMatchObject({ ok: true, work: 'tuoi' });
    expect(fits(g, 'o-3', { tool: 'binh' }, vn(14, 8, 10))).toMatchObject({ ok: false, why: 'Đất còn ẩm' });
    expect(fits(g, 'o-5', { tool: 'binh' }, vn(14, 9))).toMatchObject({ ok: false, why: 'Cây đã chín — dùng Tay để thu' });
    expect(fits(g, 'o-1', { tool: 'binh' }, t0)).toMatchObject({ ok: false, why: 'Luống trống' });
  });

  it('R-VUON-10/11: Bắt sâu / Nhổ cỏ chỉ khi đang có; Tay: chưa chín → nhãn "{cây} · còn …"', () => {
    expect(fits(g, 'o-2', { tool: 'sau' }, vn(14, 8, 58))).toEqual({ ok: true, act: { act: 'bug', plot: 'o-2' }, work: 'bat' });
    expect(fits(g, 'o-2', { tool: 'sau' }, vn(14, 8, 57))).toMatchObject({ ok: false, why: 'Không có sâu' });
    expect(fits(g, 'o-3', { tool: 'co' }, vn(14, 10, 5))).toMatchObject({ ok: true, work: 'nho' });
    expect(fits(g, 'o-2', { tool: 'co' }, vn(14, 10, 5))).toMatchObject({ ok: false, why: 'Không có cỏ' });
    expect(fits(g, 'o-2', { tool: 'tay' }, vn(14, 9, 40))).toMatchObject({ ok: false, why: 'Lúa · còn 1 giờ 20 phút' });
    expect(fits(g, 'o-5', { tool: 'tay' }, vn(14, 9))).toMatchObject({ ok: true, work: 'thu' });
  });

  it('R-VUON-12: Phân bón: cây đang lớn chưa bón → bón; đã bón → "Cây này bón rồi"; hết phân → dừng', () => {
    expect(fits(g, 'o-2', { tool: 'phan' }, vn(14, 9))).toMatchObject({ ok: true, work: 'bon' });
    const b = withPlots(g, { 'o-2': plot('lua', t0, { boost: 1000 }) });
    expect(fits(b, 'o-2', { tool: 'phan' }, vn(14, 9))).toMatchObject({ ok: false, why: 'Cây này bón rồi' });
    expect(fits({ ...g, fert: 0 }, 'o-2', { tool: 'phan' }, vn(14, 9))).toEqual({ ok: false, why: 'Hết phân bón — mua ở Tạp hoá trấn', stop: true });
  });
});

describe('hàng đợi lướt (R-VUON-13)', () => {
  it('R-VUON-13: lướt o-1, o-2, o-1, o-3 → bỏ trùng, giữ thứ tự; luống đang làm không thêm lại', () => {
    let q: string[] = [];
    for (const id of ['o-1', 'o-2', 'o-1', 'o-3']) q = queueAdd(q, id, null);
    expect(q).toEqual(['o-1', 'o-2', 'o-3']);
    expect(queueAdd(['o-2'], 'o-1', 'o-1')).toEqual(['o-2']);
  });

  it('R-VUON-3: lướt 4 luống trống với 3 hạt: làm 3 luống, luống có cây bị bỏ qua; hết hạt → dừng + "Hết hạt Cải ngọt"', () => {
    const g = withPlots(freshGarden(), { 'o-2': plot('lua', t0) });
    const r = queueNext(['o-2', 'o-1', 'o-3'], g, { tool: 'hat', crop: 'cai' }, t0);
    expect(r.job?.plot).toBe('o-1');
    expect(r.rest).toEqual(['o-3']);
    expect(r.skipped).toEqual([{ plot: 'o-2', why: 'Luống đã có cây' }]);
    const empty = { ...g, seeds: {} };
    expect(queueNext(['o-3', 'o-4'], empty, { tool: 'hat', crop: 'cai' }, t0)).toMatchObject({ job: null, rest: [], stop: 'Hết hạt Cải ngọt' });
    expect(holdAfter(empty, { tool: 'hat', crop: 'cai' })).toEqual({ holding: null, why: 'Hết hạt Cải ngọt' });
    expect(holdAfter(g, { tool: 'hat', crop: 'cai' }).holding).toEqual({ tool: 'hat', crop: 'cai' });
  });
});

describe('lưới hạt + điểm đứng (R-VUON-3, R-VUON-13)', () => {
  it('R-VUON-3: lưới hạt chỉ loại đang có; bấm lại ô Hạt giống → loại kế (vòng)', () => {
    const g: Garden = { ...freshGarden(), seeds: { cai: 2, ngo: 5 } };
    expect(seedGrid(g)).toEqual([
      { crop: 'cai', name: 'Cải ngọt', count: 2 },
      { crop: 'ngo', name: 'Ngô', count: 5 },
    ]);
    expect(nextSeed(g, undefined)).toBe('cai');
    expect(nextSeed(g, 'cai')).toBe('ngo');
    expect(nextSeed(g, 'ngo')).toBe('cai');
    expect(nextSeed({ ...g, seeds: {} }, 'cai')).toBeUndefined();
  });

  it('R-VUON-13: điểm đứng ở mép luống phía người chơi, mặt nhìn tâm luống', () => {
    const s = standSpot({ x: 10, z: -5 }, { x: 10, z: 0 });
    expect(s).toEqual({ x: 10, z: -5 + STAND_OFF, faceX: 10, faceZ: -5 });
    expect(standSpot({ x: 0, z: 0 }, { x: 0, z: 0 }).z).toBeCloseTo(STAND_OFF);
  });
});
