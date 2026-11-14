import { describe, expect, it } from 'vitest';
import { duneHeight } from './terrainHeight';
import { crescentCircles } from './water';

describe('cồn cát lưỡi liềm', () => {
  const d = { x: 0, z: 0, len: 40, h: 14, width: 40 };
  it('cao nhất ở sống giữa cồn, 0 ở hai đầu và xa sống', () => {
    expect(duneHeight(d, 0, 0)).toBeCloseTo(14);
    expect(duneHeight(d, 20, 0)).toBe(0);
    expect(duneHeight(d, 0, 30)).toBe(0);
  });
  it('mặt khuất (+z) dốc hơn mặt đón gió (−z)', () => {
    const lee = 14 - duneHeight(d, 0, 4);
    const wind = 14 - duneHeight(d, 0, -4);
    expect(lee).toBeGreaterThan(wind * 2);
  });
});

describe('hồ lưỡi liềm', () => {
  it('vòng va chạm nằm trong vòng ngoài, dày ở bụng mỏng ở mũi', () => {
    const cs = crescentCircles(12);
    expect(cs.length).toBeGreaterThan(5);
    for (const [x, z, r] of cs) expect(Math.hypot(x, z) + r).toBeLessThan(12 + 1.5);
    const mid = cs[Math.floor(cs.length / 2)];
    expect(mid[2]).toBeGreaterThan(cs[0][2]);
    expect(mid[1]).toBeGreaterThan(0); // bụng phình về +z
  });
});
