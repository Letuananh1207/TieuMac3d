import { describe, expect, it } from 'vitest';
import { knockSamples, loopSamples, ramp, snapSamples, waterVolume } from './lamSound';
import { pluckSamples, TIMBRES } from './zitherSound';

const peak = (a: Float32Array, from = 0, to = a.length): number => {
  let m = 0;
  for (let i = from; i < to; i++) m = Math.max(m, Math.abs(a[i]));
  return m;
};

describe('Tiếng Thung Trúc Gió Hát tự tổng hợp', () => {
  it('R-AM-3: róc rách ≤ 4 m đầy, 9,5 m → 0,5, ≥ 15 m tắt', () => {
    expect(waterVolume(3)).toBe(1);
    expect(waterVolume(9.5)).toBeCloseTo(0.5);
    expect(waterVolume(15)).toBe(0);
    expect(waterVolume(40)).toBe(0);
  });

  it('R-AM-3: mờ về 0 trong 1 giây, mưa lên / xuống 2 giây', () => {
    expect(ramp(1, 0, 0.5)).toBeCloseTo(0.5);
    expect(ramp(0, 0.25, 0.5, 2)).toBeCloseTo(0.25);
    expect(ramp(0.2, 0.25, 0.5, 2)).toBe(0.25);
  });

  it('R-AM-3: mẫu nước / mưa / gỗ / rắc tự sinh, đỉnh ≤ 1, đầu cuối về 0, lần nào cũng như nhau', () => {
    for (const a of [loopSamples('nuoc', 8000, 1), loopSamples('mua', 8000, 1), knockSamples(8000), snapSamples(8000)]) {
      expect(peak(a)).toBeGreaterThan(0.85);
      expect(peak(a)).toBeLessThanOrEqual(1 + 1e-6);
      expect(Math.abs(a[0])).toBe(0);
      expect(Math.abs(a[a.length - 1])).toBeLessThan(1e-6);
    }
    expect(loopSamples('nuoc', 8000, 1)).toEqual(loopSamples('nuoc', 8000, 1));
    expect(knockSamples(8000).length).toBe(Math.round(8000 * 0.18));
  });

  it('R-AM-3: cổ cầm thấp hơn cổ tranh một quãng tám, ngân 4–5 giây, bớt sáng', () => {
    expect(TIMBRES.cam.octave).toBe(-1);
    expect(TIMBRES.cam.seconds).toBeGreaterThanOrEqual(4);
    expect(TIMBRES.cam.seconds).toBeLessThanOrEqual(5);
    expect(TIMBRES.cam.bright).toBeLessThan(TIMBRES.tranh.bright);
    const rate = 8000;
    const cam = pluckSamples(146.83, rate, TIMBRES.cam.seconds, 3, TIMBRES.cam);
    const tranh = pluckSamples(146.83, rate, 2.2, 3);
    // 2 giây sau gảy: cổ cầm còn ngân rõ hơn cổ tranh
    expect(peak(cam, 2 * rate, 2.2 * rate)).toBeGreaterThan(peak(tranh, 2 * rate - 800, 2 * rate));
    expect(cam.length).toBe(Math.round(rate * TIMBRES.cam.seconds));
  });
});
