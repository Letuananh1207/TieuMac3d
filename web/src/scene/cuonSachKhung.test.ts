import { describe, expect, it } from 'vitest';
import { CUON_GAN, CUON_XA, fitScroll } from './cuonSachNhip';

const HALF_W = 0.165;
const HALF_H = 0.142;
const frac = (fov: number, aspect: number, d: number, side = 0): { w: number; h: number; left: number; right: number } => {
  const tv = Math.tan((fov * Math.PI) / 360);
  const th = tv * aspect;
  return { w: HALF_W / (th * d), h: HALF_H / (tv * d), left: (side - HALF_W) / (th * d), right: (side + HALF_W) / (th * d) };
};

describe('R-ON-8: cuộn sách trước mắt vừa khung màn', () => {
  it('R-ON-8: màn dọc 390×844 (FOV nới 70°) — cuộn gần hết bề ngang, không tràn, trong tầm tay', () => {
    const a = 390 / 844;
    const { dist, side } = fitScroll(70.2, a, HALF_W, HALF_H);
    const f = frac(70.2, a, dist, side);
    expect(f.w).toBeLessThanOrEqual(0.9);
    expect(f.w).toBeGreaterThan(0.8);
    expect(side).toBe(0);
    expect(dist).toBeGreaterThanOrEqual(CUON_GAN);
    expect(dist).toBeLessThanOrEqual(CUON_XA);
  });

  it('R-ON-8: màn ngang 844×390 — cuộn cao vừa, lệch phải, cả cuộn vẫn trong màn', () => {
    const a = 844 / 390;
    const { dist, side } = fitScroll(55, a, HALF_W, HALF_H);
    const f = frac(55, a, dist, side);
    expect(f.h).toBeLessThanOrEqual(0.63);
    expect(side).toBeGreaterThan(0);
    expect(f.left).toBeGreaterThan(-1);
    expect(f.right).toBeLessThan(1);
  });
});
