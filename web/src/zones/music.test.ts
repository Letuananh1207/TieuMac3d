import { describe, expect, it } from 'vitest';
import { musicVolume, radioAt, rampVolume, TRACKS, type Track } from './music';

const list: Track[] = [
  { file: 'a.ogg', seconds: 120, title: 'A' },
  { file: 'b.ogg', seconds: 90, title: 'B' },
  { file: 'c.ogg', seconds: 150, title: 'C' },
];
const floor = { minX: -9, maxX: 9, minZ: -65, maxZ: -55 };

describe('Nhạc nền trà lâu', () => {
  it('R-NHAC-1: giây 3 600 + 130 từ 1970, danh sách 120 / 90 / 150 s → bài 2, giây 10', () => {
    const r = radioAt(list, 3600 + 130)!;
    expect(r.index).toBe(1);
    expect(r.offset).toBeCloseTo(10, 6);
  });

  it('R-NHAC-1: hết vòng thì lặp lại từ bài 1; ra vào lại không nghe lại từ đầu (chỉ theo giờ)', () => {
    expect(radioAt(list, 360)).toEqual({ index: 0, offset: 0 });
    expect(radioAt(list, 359.5)!.index).toBe(2);
    expect(radioAt(list, 1000)).toEqual(radioAt(list, 1000 + 360 * 7));
    expect(radioAt([], 10)).toBeUndefined();
  });

  it('R-NHAC-1: giữa sàn → 1; cách mép trước 4 m → 0,5; cách 8 m trở lên → 0', () => {
    expect(musicVolume([floor], 0, -60)).toBe(1);
    expect(musicVolume([floor], 0, -51)).toBeCloseTo(0.5, 6);
    expect(musicVolume([floor], 0, -47)).toBe(0);
    expect(musicVolume([floor], 30, 0)).toBe(0);
    expect(musicVolume([], 0, -60)).toBe(0);
  });

  it('R-NHAC-1: âm lượng từ 0 lên đầy mất ~1,5 giây, mượt từng khung', () => {
    let v = 0;
    for (let i = 0; i < 45; i++) v = rampVolume(v, 1, 1 / 60);
    expect(v).toBeCloseTo(0.5, 6);
    for (let i = 0; i < 45; i++) v = rampVolume(v, 1, 1 / 60);
    expect(v).toBeCloseTo(1, 6);
    v = rampVolume(v, 0, 2);
    expect(v).toBe(0);
  });

  it('R-NHAC-1: nhạc đóng gói sẵn — mọi bài có file và thời lượng', () => {
    expect(TRACKS.length).toBeGreaterThan(0);
    for (const t of TRACKS) expect(t.seconds).toBeGreaterThan(0);
  });
});
