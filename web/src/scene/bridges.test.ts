import { describe, expect, it } from 'vitest';
import { LayeredGround } from '../collision/ground';
import { bridgePads, bridgeRails, RAIL } from './bridges';
import { alongPath } from './fauna';
import { resolveSceneSpec } from './specCheck';
import type { BridgeSpec } from './spec';
import { followPieces, FOLLOW_STEP } from './walls';

// R-VA-1: cầu vòm Giang Nam qua kênh ở x = 0 — lên lưng cầu rồi xuống bờ bên kia; lan can chặn hai bên
describe('cầu (R-VA-1)', () => {
  const vom: BridgeSpec = { kind: 'vom', x: 0, z: -8, length: 10, width: 4, rise: 1.6 };

  it('cầu vòm: hai đầu bằng mặt đất, giữa cầu cao rise, dốc đều', () => {
    const g = new LayeredGround(null, bridgePads(vom, 0));
    expect(g.heightAt(0, -3)).toBeCloseTo(0);
    expect(g.heightAt(0, -8)).toBeCloseTo(1.6);
    expect(g.heightAt(0, -13)).toBeCloseTo(0);
    expect(g.heightAt(0, -5.5)).toBeCloseTo(0.8);
    expect(g.heightAt(1.5, -10.5)).toBeCloseTo(0.8);
    expect(g.slopeAt(0, -6)).toBeLessThan(35);
  });

  it('cầu quay 90°: dốc theo trục x', () => {
    const g = new LayeredGround(null, bridgePads({ ...vom, x: 10, z: 0, rotY: 90 }, 2));
    expect(g.heightAt(5, 0)).toBeCloseTo(2);
    expect(g.heightAt(10, 0)).toBeCloseTo(3.6);
    expect(g.heightAt(15, 0)).toBeCloseTo(2);
  });

  it('lan can hai bên nằm trong bề rộng cầu, dài suốt cầu', () => {
    const [l, r] = bridgeRails(vom).sort((a, b) => a.x - b.x);
    expect(l.x - l.w / 2).toBeCloseTo(-2);
    expect(l.w).toBeCloseTo(RAIL);
    expect(r.x + r.w / 2).toBeCloseTo(2);
    expect(l.d).toBeCloseTo(10);
  });

  it('cầu treo / cầu đá: mặt phẳng (đá cao rise, treo bằng đầu cầu)', () => {
    expect(new LayeredGround(null, bridgePads({ kind: 'treo', x: 0, z: 0, length: 12, width: 2 }, 3)).heightAt(0, 4)).toBeCloseTo(3);
    expect(new LayeredGround(null, bridgePads({ kind: 'da', x: 0, z: 0, length: 6, width: 4 }, 0)).heightAt(0, 2)).toBeCloseTo(0.3);
  });

  it('đặc tả: lưng cầu dốc quá 35° thì báo lỗi, bỏ cầu', () => {
    const { spec, problems } = resolveSceneSpec({ bridges: [{ kind: 'vom', x: 0, z: 0, length: 4, width: 3, rise: 2 }] });
    expect(spec.bridges).toHaveLength(0);
    expect(problems.some((p) => p.includes('35°'))).toBe(true);
  });
});

describe('đặc tả: danh sách điểm dài tuỳ ý', () => {
  it('thuyền và mương nhận nhiều hơn 2 điểm; thiếu điểm thì bỏ', () => {
    const pts = [[0, 0], [5, 1], [9, -2], [12, 0]];
    const { spec, problems } = resolveSceneSpec({
      boats: [{ path: pts, speed: 1 }, { path: [[0, 0]] }],
      channels: [{ points: pts, cups: 4 }],
    });
    expect(spec.boats).toHaveLength(1);
    expect(spec.boats[0].path).toHaveLength(4);
    expect(spec.channels[0].points).toHaveLength(4);
    expect(problems.some((p) => p.includes('boats[1].path'))).toBe(true);
  });
});

describe('tường bám đất', () => {
  it('chia khúc ~2 m, đỉnh mỗi khúc = đất cao nhất dưới khúc + cao tường', () => {
    const run = { axis: 'x' as const, fixed: 0, a: 0, b: 20, height: 6, thickness: 1 };
    const pieces = followPieces(run, (x) => x * 0.5);
    expect(pieces).toHaveLength(20 / FOLLOW_STEP);
    expect(pieces[0].top).toBeCloseTo(1 + 6);
    expect(pieces[9].top).toBeCloseTo(10 + 6);
    expect(pieces[9].bottom).toBeLessThan(9);
  });
});

describe('thuyền trôi', () => {
  const path: [number, number][] = [[0, 0], [10, 0], [10, 5]];
  it('đi dọc đường rồi quay đầu lại', () => {
    expect(alongPath(path, 5)).toMatchObject({ x: 5, z: 0 });
    expect(alongPath(path, 12).z).toBeCloseTo(2);
    const back = alongPath(path, 18); // tổng 15 → quay đầu, còn 12 m từ đầu: (10; 2), đi về −z
    expect(back.x).toBeCloseTo(10);
    expect(back.z).toBeCloseTo(2);
    expect(Math.cos(back.heading)).toBeCloseTo(-1);
    const home = alongPath(path, 27); // còn 3 m: (3; 0), đi về −x
    expect(home.x).toBeCloseTo(3);
    expect(Math.sin(home.heading)).toBeCloseTo(-1);
  });
});
