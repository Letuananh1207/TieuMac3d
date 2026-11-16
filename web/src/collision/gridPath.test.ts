import { describe, expect, it } from 'vitest';
import { findPath, segmentClear, simplify, type GridBounds, type XZ } from './gridPath';

const bounds: GridBounds = { minX: -5, maxX: 5, minZ: -5, maxZ: 5 };
/** hộp cấm |x| ≤ 1, −3 ≤ z ≤ 3 (tường giữa) */
const wall = (x: number, z: number): boolean => !(Math.abs(x) <= 1 && Math.abs(z) <= 3);

const length = (p: readonly XZ[]): number => p.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0);

describe('Tìm đường trên lưới (gridPath.ts — tiểu nhị, R-TRA-1)', () => {
  it('R-TRA-1: đi vòng một hộp chắn giữa, đầu cuối đúng điểm đã cho', () => {
    const p = findPath([-3, 0], [3, 0], wall, bounds)!;
    expect(p).not.toBeNull();
    expect(p[0]).toEqual([-3, 0]);
    expect(p[p.length - 1]).toEqual([3, 0]);
    // phải vòng qua đầu hộp (|z| > 3)
    expect(p.some(([, z]) => Math.abs(z) > 3)).toBe(true);
    for (let i = 1; i < p.length; i++) expect(segmentClear(p[i - 1], p[i], wall)).toBe(true);
    // gần đường ngắn nhất (qua hai góc: 2·√(2² + 3,25²) + 2 ≈ 9,6)
    expect(length(p)).toBeLessThan(10);
  });

  it('R-TRA-1: không có đường (bị vây kín) → null', () => {
    // đích (3; 0) nằm trong vòng tròn cấm dày 0,6 m
    const ring = (x: number, z: number): boolean => {
      const d = Math.hypot(x - 3, z);
      return d < 0.6 || d > 1.2;
    };
    expect(findPath([-3, 0], [3, 0], (x, z) => wall(x, z) && ring(x, z), bounds)).toBeNull();
  });

  it('R-TRA-1: điểm đầu / cuối nằm trong ô cấm sát mép → nhích ra ô đi được gần nhất, đoạn giữa vẫn qua ô đi được', () => {
    const p = findPath([-1.1, 0], [1.1, 0], (x, z) => !(Math.abs(x) <= 1.2 && Math.abs(z) <= 3), bounds)!;
    expect(p).not.toBeNull();
    expect(p[0]).toEqual([-1.1, 0]);
    expect(p[p.length - 1]).toEqual([1.1, 0]);
    const ok = (x: number, z: number): boolean => !(Math.abs(x) <= 1.2 && Math.abs(z) <= 3);
    // điểm thứ hai nằm ngay cạnh điểm đầu (≤ 2 ô), đi được
    expect(Math.hypot(p[1][0] + 1.1, p[1][1])).toBeLessThan(0.6);
    expect(ok(...p[1])).toBe(true);
    for (let i = 2; i < p.length - 1; i++) expect(segmentClear(p[i - 1], p[i], ok)).toBe(true);
  });

  it('R-TRA-1: rút gọn bỏ điểm giữa khi hai đầu nhìn thấy nhau; mọi đoạn sau rút gọn qua ô đi được', () => {
    const raw: XZ[] = [];
    for (let x = -3; x <= 3; x += 0.25) raw.push([x, 4]);
    expect(simplify(raw, wall)).toEqual([raw[0], raw[raw.length - 1]]);
    const p = findPath([-3, -4], [3, 4], wall, bounds)!;
    expect(p.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < p.length; i++) expect(segmentClear(p[i - 1], p[i], wall)).toBe(true);
  });
});
