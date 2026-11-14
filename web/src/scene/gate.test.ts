import { describe, expect, it } from 'vitest';
import { gateLayout, gateSpan } from './gate';
import { resolveSceneSpec } from './specCheck';

describe('cổng khối: bố cục dọc (gateLayout)', () => {
  it('thiếu height → cổng sơn môn cũ (xà thấp 6,2 m × hệ số chiều cao, gian bên 3,5 m)', () => {
    const L = gateLayout(5, 1.6);
    expect(L.low).toBeCloseTo(9.92, 6);
    expect(L.midTop).toBeCloseTo(12.48, 6);
    expect(L.mainRoof.h).toBeCloseTo(2.08, 6);
    expect(L.side).toBe(3.5);
    expect(gateSpan(5)).toBeCloseTo(15.3, 6);
  });

  it('height 6,6 → nóc mái 6,6 m, lòng cổng cao hơn camera gần (~2,5 m) và nhân vật; biển nằm giữa hai xà', () => {
    const L = gateLayout(5, 1.6, 6.6);
    expect(L.midTop + L.mainRoof.h).toBeCloseTo(6.6, 6);
    expect(L.low).toBeGreaterThan(3.3);
    expect(L.low).toBeLessThan(3.7);
    const signH = 0.9 * L.signScale;
    expect(L.signY - signH / 2).toBeGreaterThan(L.low + 0.5); // trên xà thấp (cao 0,5)
    expect(L.signY + signH / 2).toBeLessThan(L.upperBeam - 0.2); // dưới xà trên (cao 0,4)
    expect(L.sideTop + L.sideRoofH).toBeLessThan(L.midTop); // mái bên thấp hơn mái giữa
    expect(L.sideBeam).toBeGreaterThan(2.3); // gian bên vẫn lọt người
    expect(gateSpan(5, L.side)).toBeLessThan(13);
  });

  it('scene:check: height ngoài 6–12 m báo lỗi; 6,6 không lỗi', () => {
    const at = (height: number): string[] =>
      resolveSceneSpec({ gates: [{ id: 'g', x: 0, z: 0, width: 5, title: 'Khởi Nguyên Trấn', height }] }).problems.filter((p) =>
        p.startsWith('gates[0].height'),
      );
    expect(at(4)).not.toEqual([]);
    expect(at(13)).not.toEqual([]);
    expect(at(6.6)).toEqual([]);
  });
});
