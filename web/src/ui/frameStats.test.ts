import { describe, expect, it } from 'vitest';
import { frameStats, FrameWindow } from './frameStats';

describe('Thống kê thời gian khung (bảng gỡ lỗi — đo hiệu năng)', () => {
  it('60 khung đều 16,7 ms → 60 fps, trung bình 16,7, 1 % chậm 16,7, không khựng', () => {
    const s = frameStats(Array(60).fill(1000 / 60));
    expect(s.fps).toBeCloseTo(60, 6);
    expect(s.avgMs).toBeCloseTo(16.67, 2);
    expect(s.p99Ms).toBeCloseTo(16.67, 2);
    expect(s.hitches).toBe(0);
  });

  it('200 khung, 2 khung khựng 80 ms → 1 % chậm nhất = 80 ms, đếm 2 lần khựng (> 50 ms)', () => {
    const ms = [...Array(198).fill(16), 80, 80];
    const s = frameStats(ms);
    expect(s.p99Ms).toBe(80);
    expect(s.hitches).toBe(2);
    expect(s.fps).toBeCloseTo(1000 / ((198 * 16 + 160) / 200), 6);
  });

  it('rỗng → số 0, không lỗi', () => {
    expect(frameStats([])).toEqual({ fps: 0, avgMs: 0, p99Ms: 0, hitches: 0 });
  });

  it('cửa sổ trượt chỉ giữ ~2 giây khung gần nhất', () => {
    const w = new FrameWindow(2000);
    for (let i = 0; i < 300; i++) w.push(10); // 3 giây
    expect(w.values.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(2000);
    expect(w.values.length).toBe(200);
  });
});
