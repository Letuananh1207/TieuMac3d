import { describe, expect, it } from 'vitest';
import { moPan, moStrikes, moVolume, raoAt, strikesBetween } from './moGo';

describe('Tiếng mõ (R-AM-1)', () => {
  it('R-AM-1: cách 2 m → 1; 16,5 m → 0,5; 30 m → 0; xa hơn vẫn 0', () => {
    expect(moVolume(2)).toBe(1);
    expect(moVolume(3)).toBe(1);
    expect(moVolume(16.5)).toBeCloseTo(0.5, 9);
    expect(moVolume(30)).toBe(0);
    expect(moVolume(80)).toBe(0);
  });

  it('R-AM-1: ông bên trái màn hình → lệch tai trái; bên phải → tai phải; ngay trước → giữa', () => {
    // camera nhìn về −z → bên phải là +x
    expect(moPan(1, 0, -5, -5)).toBeLessThan(0);
    expect(moPan(1, 0, 5, -5)).toBeGreaterThan(0);
    expect(moPan(1, 0, 0, -5)).toBeCloseTo(0, 9);
    expect(moPan(1, 0, -5, 0)).toBeCloseTo(-0.6, 9);
  });

  it('R-NPC-8: 23:00 gõ 3 tiếng, 3:00 gõ 5 tiếng, 19:00 gõ 1 tiếng; rao sau tiếng cuối, trong 12 s dừng', () => {
    expect(moStrikes(23)).toHaveLength(3);
    expect(moStrikes(3)).toHaveLength(5);
    expect(moStrikes(19)).toHaveLength(1);
    expect(raoAt(3)).toBeLessThan(12);
    expect(raoAt(19)).toBeGreaterThan(moStrikes(19)[0]);
  });

  it('R-AM-1: tiếng lỡ (app vừa về từ nền, khung dài) không phát bù', () => {
    expect(strikesBetween(7, 0.95, 1.01)).toBe(1);
    expect(strikesBetween(7, 0, 5)).toBe(0); // khoảng 5 s → bỏ
    expect(strikesBetween(7, 1.01, 1.05)).toBe(0);
  });
});
