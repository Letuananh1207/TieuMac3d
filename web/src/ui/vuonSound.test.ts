import { describe, expect, it } from 'vitest';
import { TIENG_LEN, VUON_TIENG, vuonSamples } from './vuonSound';

const peak = (a: Float32Array, from = 0, to = a.length): number => {
  let m = 0;
  for (let i = Math.max(0, from); i < Math.min(a.length, to); i++) m = Math.max(m, Math.abs(a[i]));
  return m;
};
/** tần số trội ước lượng bằng số lần qua 0 */
const zeroRate = (a: Float32Array, rate: number, from: number, to: number): number => {
  let n = 0;
  for (let i = from + 1; i < to; i++) if (a[i - 1] < 0 !== a[i] < 0) n++;
  return (n / 2) * (rate / (to - from));
};

describe('R-AM-4: tiếng vườn tự tổng hợp', () => {
  it('R-AM-4: đủ 7 tiếng, đỉnh ≤ 1, đầu cuối về 0, đúng độ dài, lần nào cũng như nhau', () => {
    const rate = 8000;
    for (const id of VUON_TIENG) {
      const a = vuonSamples(id, rate);
      expect(a.length).toBe(Math.round(rate * TIENG_LEN[id]));
      // đỉnh chuẩn hoá về 1 trước khi mờ đầu (tiếng gõ có đỉnh ngay đầu → thấp hơn chút)
      expect(peak(a)).toBeGreaterThan(0.5);
      expect(peak(a)).toBeLessThanOrEqual(1 + 1e-6);
      expect(Math.abs(a[0])).toBe(0);
      expect(Math.abs(a[a.length - 1])).toBeLessThan(1e-6);
      expect(vuonSamples(id, rate)).toEqual(a);
    }
  });

  it('R-AM-4: "ting" vừa chín là chuông cao ngân lâu; "tách" bắt sâu tắt nhanh; "pốc" / "bụp" trầm', () => {
    const rate = 16000;
    const ting = vuonSamples('ting', rate);
    expect(peak(ting, 0.5 * rate, 0.6 * rate)).toBeGreaterThan(0.05);
    expect(zeroRate(ting, rate, 0, 0.2 * rate)).toBeGreaterThan(1200);
    const tach = vuonSamples('tach', rate);
    expect(peak(tach, 0.06 * rate, 0.075 * rate)).toBeLessThan(0.05);
    const poc = vuonSamples('poc', rate);
    expect(zeroRate(poc, rate, 0.05 * rate, 0.15 * rate)).toBeLessThan(250);
    const bup = vuonSamples('bup', rate);
    expect(zeroRate(bup, rate, 0.05 * rate, 0.2 * rate)).toBeLessThan(200);
  });

  it('R-AM-4: tưới kéo dài suốt lúc rót (không tắt giữa chừng)', () => {
    const rate = 8000;
    const t = vuonSamples('tuoi', rate);
    for (const s of [0.1, 0.3, 0.5]) expect(peak(t, s * rate, (s + 0.05) * rate)).toBeGreaterThan(0.2);
  });
});
