import { describe, expect, it } from 'vitest';
import { squashFeet } from './gateFeet';

/** Cổng giả: 4 trụ tròn bán kính 0,45 cao tới 15 m, mỗi trụ cắm trên khối đá vuông nửa cạnh 1,05, cao 3 m. */
function fakeGate(): { pos: Float32Array; centers: [number, number][] } {
  const centers: [number, number][] = [
    [-7.8, 0],
    [-3.6, 0],
    [3.6, 0],
    [7.8, 0],
  ];
  const p: number[] = [];
  for (const [cx, cz] of centers) {
    for (const y of [0, 1, 2, 3])
      for (const [dx, dz] of [
        [-1.05, -1.05],
        [1.05, -1.05],
        [1.05, 1.05],
        [-1.05, 1.05],
        [0, 1.05],
      ])
        p.push(cx + dx, y, cz + dz);
    for (let y = 3; y <= 15; y += 0.5)
      for (let a = 0; a < 8; a++) p.push(cx + 0.45 * Math.cos(a), y, cz + 0.45 * Math.sin(a));
  }
  return { pos: new Float32Array(p), centers };
}

const pts = (pos: Float32Array): [number, number, number][] =>
  Array.from({ length: pos.length / 3 }, (_, i) => [pos[3 * i], pos[3 * i + 1], pos[3 * i + 2]]);

describe('squashFeet', () => {
  it('(L-5): khối đá chân trụ thấp xuống ~1,2 m và hẹp lại, trụ giữ nguyên bề dày', () => {
    const { pos, centers } = fakeGate();
    const drop = squashFeet(pos, centers, { height: 1.2, shrink: 0.75 });
    expect(drop).toBeCloseTo(1.8, 5);
    const all = pts(pos);
    const near = (x: number, z: number): number => Math.min(...centers.map(([cx, cz]) => Math.hypot(x - cx, z - cz)));
    const base = all.filter(([x, , z]) => near(x, z) > 0.6);
    expect(Math.max(...base.map(([, y]) => y))).toBeLessThanOrEqual(1.2 + 1e-5);
    const half = Math.max(...base.map(([x, , z]) => Math.min(...centers.map(([cx, cz]) => Math.max(Math.abs(x - cx), Math.abs(z - cz))))));
    expect(half).toBeCloseTo(1.05 * 0.75, 4);
    // đỉnh trụ hạ đúng bằng phần đế bớt đi, bán kính trụ không đổi
    expect(Math.max(...all.map(([, y]) => y))).toBeCloseTo(15 - 1.8, 4);
    const top = all.filter(([, y]) => y > 13);
    for (const [x, , z] of top) expect(near(x, z)).toBeCloseTo(0.45, 4);
  });

  it('(L-5): đế đã thấp hơn mức cần → không đổi gì', () => {
    const { pos, centers } = fakeGate();
    const before = Float32Array.from(pos);
    expect(squashFeet(pos, centers, { height: 3.5, shrink: 0.75 })).toBe(0);
    expect(Array.from(pos)).toEqual(Array.from(before));
  });
});
