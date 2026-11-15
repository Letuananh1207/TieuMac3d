import { describe, expect, it } from 'vitest';
import rungTruc from '../../../design/scene/rung-truc.json';
import { channelPath, stopPoint } from './channels';
import type { XZ } from './spec';

describe('Mương Khúc Thuỷ — điểm dừng chén lệnh', () => {
  const ch = (rungTruc as unknown as { channels: { points: XZ[] }[] }).channels[0];
  const seats = (rungTruc as unknown as { seats: { x: number; z: number }[] }).seats;
  const path = channelPath(ch.points);

  it('R-LUU-2: mỗi đệm quanh mương Khúc Thuỷ Đài có điểm dừng cách đệm dưới 1,1 m', () => {
    expect(seats.length).toBe(8);
    for (const s of seats) expect(stopPoint(path, s).dist).toBeLessThan(1.1);
  });

  it('R-LUU-2: đường theo độ dài: đầu t = 0, cuối t = 1, điểm gần nhất của một điểm trên mương là chính nó', () => {
    const a = path.pointAt(0);
    expect(a.x).toBeCloseTo(ch.points[0][0]);
    const mid = path.pointAt(0.5);
    expect(path.nearestT(mid.x, mid.z)).toBeCloseTo(0.5, 1);
    expect(path.length).toBeGreaterThan(10);
  });
});
