import { describe, expect, it } from 'vitest';
import { CHOP, ChopMat, doChop, KHONG_CHOP, LIM_DIM_S, mucBieuCam, NGU_GAT_S, type MucMat } from './chopMat';

const DT = 1 / 60;

/** Chạy `giay` giây, ghi các lần chớp (lúc bắt đầu, độ dài khép > 0). */
function chay(c: ChopMat, giay: number, dich?: (t: number) => MucMat): { bat: number[]; dai: number[]; tren: number[] } {
  const bat: number[] = [];
  const dai: number[] = [];
  const tren: number[] = [];
  let dang = -1;
  for (let i = 0; i < giay / DT; i++) {
    const t = i * DT;
    const r = c.update(DT, dich?.(t));
    tren.push(r.tren);
    if (c.chop > 0 && dang < 0) {
      dang = t;
      bat.push(t);
    } else if (c.chop === 0 && dang >= 0) {
      dai.push(t - dang);
      dang = -1;
    }
  }
  return { bat, dai, tren };
}

describe('Chớp mắt (R-MAT-1)', () => {
  it('R-MAT-1: đồ thị một lần chớp — khép rồi mở trong ~0,15 s', () => {
    expect(doChop(0)).toBe(0);
    expect(doChop(CHOP.khep)).toBe(1);
    expect(doChop(CHOP.khep + CHOP.giu / 2)).toBe(1);
    expect(doChop(0.1501)).toBe(0);
    expect(doChop(0.12)).toBeGreaterThan(0);
    expect(CHOP.khep + CHOP.giu + CHOP.mo).toBeCloseTo(0.15, 9);
  });

  it('R-MAT-1: đứng xem 20 giây → 3–6 lần chớp (đếm chớp đôi là một), cách 3–6 s, không đều; mở hẳn → không khép', () => {
    for (const seed of [0, 1.3, 4.07, 12.5, 33.1]) {
      const c = new ChopMat(seed);
      const { bat, dai, tren } = chay(c, 20);
      const lan = bat.filter((t, i) => i === 0 || t - bat[i - 1] > 0.5);
      expect(lan.length).toBeGreaterThanOrEqual(3);
      expect(lan.length).toBeLessThanOrEqual(7);
      for (const d of dai) expect(d).toBeLessThanOrEqual(0.17);
      const cach = lan.slice(1).map((t, i) => t - lan[i]);
      for (const g of cach) {
        expect(g).toBeGreaterThan(CHOP.cachMin - 0.2);
        expect(g).toBeLessThan(CHOP.cachMax + 0.4);
      }
      expect(new Set(cach.map((g) => g.toFixed(1))).size).toBeGreaterThan(1); // không đều
      expect(Math.min(...tren)).toBe(0);
    }
  });

  it('R-MAT-1: thỉnh thoảng chớp đôi (hai lần cách ~0,2 s)', () => {
    let doi = 0;
    for (let s = 0; s < 20; s++) {
      const { bat } = chay(new ChopMat(s * 1.7 + 0.3), 30);
      doi += bat.filter((t, i) => i > 0 && t - bat[i - 1] < 0.5).length;
    }
    expect(doi).toBeGreaterThan(5);
  });

  it('R-MAT-1: hai nhân vật khác hạt giống (Tiểu Mặc, Mặc Ông) không chớp cùng nhịp', () => {
    const a = chay(new ChopMat(-4.4 * 0.37 + 19 * 0.11), 20).bat;
    const b = chay(new ChopMat(6 * 0.37 + 12 * 0.11), 20).bat;
    const trung = a.filter((t) => b.some((u) => Math.abs(t - u) < 0.1)).length;
    expect(trung).toBeLessThanOrEqual(1);
  });

  it('R-MAT-1: NPC gật khi thoại → chớp ngay cùng lúc', () => {
    const c = new ChopMat(5);
    c.update(DT);
    c.chopNgay();
    let max = 0;
    for (let i = 0; i < 6; i++) max = Math.max(max, c.update(DT).tren);
    expect(max).toBe(1);
  });
});

describe('Mắt theo biểu cảm (R-MAT-2)', () => {
  const em = (id: string, t: number, len: number) => ({ emote: { id, t, len } });

  it('R-MAT-2: Cười / Nhảy mừng híp cong (mí dưới đẩy lên), Vỗ tay híp nhẹ, Suy nghĩ lim dim + chớp chậm, Vẫy tay mở', () => {
    for (const id of ['cuoi', 'nhay-mung']) {
      const m = mucBieuCam(em(id, 0.9, 1.8));
      expect(m.duoi).toBeGreaterThan(m.tren);
      expect(m.tren + m.duoi).toBeGreaterThanOrEqual(KHONG_CHOP);
    }
    const vo = mucBieuCam(em('vo-tay', 0.8, 1.6));
    expect(vo.tren + vo.duoi).toBeGreaterThan(0.3);
    expect(vo.tren + vo.duoi).toBeLessThan(KHONG_CHOP);
    const nghi = mucBieuCam(em('suy-nghi', 1.2, 2.5));
    expect(nghi.tren).toBeCloseTo(0.5, 5);
    expect(nghi.cham).toBe(true);
    expect(mucBieuCam(em('vay-tay', 0.9, 1.8))).toMatchObject({ tren: 0, duoi: 0 });
  });

  it('R-MAT-2: Cúi chào nhắm theo độ cúi; Chắp tay, vươn vai nhắm theo độ chào / vươn; gảy đàn lim dim, chớp chậm', () => {
    expect(mucBieuCam(em('cui-chao', 0.05, 2)).tren).toBeLessThan(0.1);
    expect(mucBieuCam(em('cui-chao', 0.9, 2)).tren).toBeGreaterThan(0.8);
    expect(mucBieuCam({ bow: 1 }).tren).toBeCloseTo(0.8, 5);
    expect(mucBieuCam({ bow: 0.5 }).tren).toBeCloseTo(0.4, 5);
    expect(mucBieuCam({ stretch: 1 }).tren).toBeCloseTo(0.9, 5);
    expect(mucBieuCam({ pluck: 0.3 })).toMatchObject({ tren: 0.5, cham: true });
  });

  it('R-MAT-2: Ngồi nghỉ — dưới 6 s mở, từ 6 s lim dim, từ 15 s nhắm ngủ gật + đầu gục theo nhịp thở, thỉnh thoảng choàng mở', () => {
    const at = (t: number) => mucBieuCam(em('ngoi-nghi', t, Infinity), 1.6);
    expect(at(3).tren).toBe(0);
    expect(at(3).guc).toBe(0);
    expect(at(LIM_DIM_S + 3).tren).toBeCloseTo(0.55, 5);
    expect(at(LIM_DIM_S + 3).guc).toBe(0);
    expect(at(20).tren).toBeCloseTo(1, 5);
    // đầu gục: luôn cúi, nhấp nhô theo nhịp thở
    const gucs = Array.from({ length: 40 }, (_, i) => at(NGU_GAT_S + 2.2 + i * 0.1).guc);
    expect(Math.min(...gucs)).toBeGreaterThan(0.08);
    expect(Math.max(...gucs) - Math.min(...gucs)).toBeGreaterThan(0.05);
    // choàng mở mắt ngẩng lên một lần trong mỗi chu kỳ 13 s
    const tren = Array.from({ length: 260 }, (_, i) => at(NGU_GAT_S + 2 + i * 0.1).tren);
    expect(Math.min(...tren)).toBeLessThan(0.3);
    expect(tren.filter((x) => x > 0.95).length).toBeGreaterThan(150);
  });

  it('R-MAT-2: đang híp / nhắm thì không chớp; hết biểu cảm mở mắt mượt (không bật)', () => {
    const c = new ChopMat(2);
    const cuoi = { tren: 0.22, duoi: 0.78 };
    const a = chay(c, 12, () => cuoi);
    expect(a.bat.filter((t) => t > 1).length).toBe(0); // sau khi kịp híp: không chớp
    let truoc = c.update(DT, cuoi).tren;
    for (let i = 0; i < 30; i++) {
      const r = c.update(DT).tren;
      expect(Math.abs(r - truoc)).toBeLessThan(0.05); // mỗi khung đổi ít
      truoc = r;
    }
    for (let i = 0; i < 60; i++) c.update(DT);
    expect(c.update(DT).tren + c.update(DT).duoi).toBeLessThan(0.02);
  });
});
