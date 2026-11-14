import { describe, expect, it } from 'vitest';
import { Colliders } from '../collision/colliders';
import { gateOpening, lauClearHeight, lauTop, plasterWallBoxes } from './kien_truc/tuong';
import { DEFAULT_SCENE, type SceneSpec, type WallSegment } from './spec';
import { ringRuns, segmentRuns, wallGates } from './walls';

/** Tường Quảng Trường như ví dụ R-VA-1: ±17, cao 5,2, dày 0,5; cổng mái ngói nam / bắc rộng 9,6 lối cao 4 (V-20261114-19),
 *  cổng trăng đông / tây rộng 6,4. */
const walls: SceneSpec['walls'] = {
  ...DEFAULT_SCENE.walls,
  half: 17,
  height: 5.2,
  thickness: 0.5,
  style: 'voi',
  gates: [
    { side: 'nam', at: 0, width: 9.6, kind: 'lau', clearHeight: 4, signs: { nam: '外門', bac: '山門' } },
    { side: 'bac', at: 0, width: 9.6, kind: 'lau', clearHeight: 4 },
    { side: 'dong', at: 0, width: 6.4 },
    { side: 'tay', at: -6, width: 6.4 },
  ],
};
/** Đoạn tường thêm giả có cổng trăng (cảnh thật đã bỏ tường chia sân, 2026-11-13): z −11, cao 3, dày 0,35, cổng x −33 rộng 4. */
const partition: WallSegment = { from: [-51, -11], to: [-17, -11], height: 3, thickness: 0.35, gate: { at: -33, width: 4 } };

function world(): Colliders {
  const c = new Colliders();
  for (const b of plasterWallBoxes(walls, [partition])) c.add(b.x, b.z, b.w, b.d, b.h);
  return c;
}

/** Nhân vật bán kính 0,5 đi thẳng từ (x, z) theo hướng (dx, dz) `dist` mét, bước 5 cm, va chạm sau mỗi bước. */
function walk(c: Colliders, x: number, z: number, dx: number, dz: number, dist: number): { x: number; z: number } {
  const pos = { x, z };
  for (let s = 0; s < dist / 0.05; s++) {
    pos.x += dx * 0.05;
    pos.z += dz * 0.05;
    c.resolve(pos, 0.5);
  }
  return pos;
}

describe('R-VA-1: tường mỏng + cổng', () => {
  it('R-VA-1: mặt trong tường bắc dày 0,5 ở z −16,75 → đi lên bắc ở x 12 dừng ở z −16,25', () => {
    expect(walk(world(), 12, 0, 0, -1, 20).z).toBeCloseTo(-16.25, 2);
  });

  it('R-VA-1: cổng mái ngói nam rộng 9,6 → lối đi 9 m; x 0 và x 4 qua được, x 5 (trụ cổng dày 0,8) dừng ở z 16,1', () => {
    const nam = wallGates(walls, [])[0];
    expect(2 * gateOpening(nam)).toBeCloseTo(9, 6);
    expect(walk(world(), 0, 0, 0, 1, 25).z).toBeGreaterThan(20);
    expect(walk(world(), 4, 0, 0, 1, 25).z).toBeGreaterThan(20);
    expect(walk(world(), 5, 0, 0, 1, 25).z).toBeCloseTo(16.1, 2);
  });

  it('R-VA-1: cổng trăng đông (x 17, tâm z 0) lối 4,6 m: z 0 qua được, z 3 dừng ở x 16,25; cổng trăng tây (tâm z −6): z −6 qua được', () => {
    const dong = wallGates(walls, [])[2];
    expect(2 * gateOpening(dong)).toBeCloseTo(4.6, 6);
    expect(walk(world(), 0, 0, 1, 0, 25).x).toBeGreaterThan(20);
    expect(walk(world(), 0, 3, 1, 0, 25).x).toBeCloseTo(16.25, 2);
    expect(walk(world(), 0, -6, -1, 0, 25).x).toBeLessThan(-20);
  });

  it('R-VA-1: cổng bắc mái ngói → x 0 đi lên bắc qua cổng ra chân Thiên Bậc', () => {
    expect(walk(world(), 0, 0, 0, -1, 25).z).toBeLessThan(-20);
  });

});

describe('cổng trên đoạn tường thêm', () => {
  it('đoạn z −11 dày 0,35 cao 3, cổng trăng x −33 lối 2,4 m: x −33 qua được, x −36 dừng ở z −10,325', () => {
    const [gate] = wallGates({ ...walls, enabled: false }, [partition]);
    expect(2 * gateOpening(gate)).toBeCloseTo(2.4, 6);
    expect(walk(world(), -33, -5, 0, -1, 12).z).toBeLessThan(-14);
    expect(walk(world(), -36, -5, 0, -1, 12).z).toBeCloseTo(-10.325, 2);
  });
});

describe('đoạn tường theo độ dày', () => {
  it('góc tường bao chồng nửa bề dày; đoạn thêm thiếu dày / cao thì theo tường bao', () => {
    const north = ringRuns({ ...walls, gates: [] })[0];
    expect([north.a, north.b, north.thickness]).toEqual([-17.25, 17.25, 0.5]);
    const [run] = segmentRuns({ from: [-51, 17], to: [-17, 17] }, walls);
    expect([run.a, run.b, run.height, run.thickness]).toEqual([-51.25, -16.75, 5.2, 0.5]);
  });

  it('đoạn có cổng bị cắt khe (nới thêm pad mỗi bên)', () => {
    const runs = segmentRuns(partition, walls, 1);
    expect(runs.map((r) => [r.a, r.b])).toEqual([
      [-51.175, -36],
      [-30, -16.825],
    ]);
  });

  it('biển cổng giữ theo hướng mặt nhìn; thiếu kind = cổng trăng', () => {
    const [nam] = wallGates(walls, []);
    expect(nam.signs).toEqual({ nam: '外門', bac: '山門' });
    expect(wallGates({ ...walls, enabled: false }, [partition])[0].kind).toBe('trang');
  });
});

describe('cổng mái ngói: lối cao (clearHeight)', () => {
  it('thiếu / 0 = 3,2 nhưng thấp hơn tường ≥ 1; đỉnh trụ = tường + 0,6 (cảnh cũ không đổi)', () => {
    expect(lauClearHeight(5.2)).toBe(3.2);
    expect(lauClearHeight(3.6)).toBeCloseTo(2.6, 6);
    expect(lauTop(5.2, 3.2)).toBeCloseTo(5.8, 6);
    expect(lauTop(3.6, 2.6)).toBeCloseTo(4.2, 6);
    const old = wallGates({ ...walls, gates: [{ side: 'nam', at: 0, width: 6.4, kind: 'lau', clearHeight: 0 }] }, [])[0];
    expect(old.clear).toBeUndefined();
  });

  it('lối 4 m trên tường 5,2 → đỉnh trụ vẫn 5,8; lối 4,6 → trụ + mái nâng lên 6,2, vật cản cao theo', () => {
    const [nam] = wallGates(walls, []);
    expect(lauClearHeight(nam.height, nam.clear)).toBe(4);
    expect(lauTop(5.2, 4)).toBeCloseTo(5.8, 6);
    expect(lauTop(5.2, 4.6)).toBeCloseTo(6.2, 6);
    const tall = { ...walls, gates: [{ side: 'nam' as const, at: 0, width: 9.6, kind: 'lau' as const, clearHeight: 4.6 }] };
    const pier = plasterWallBoxes(tall, []).find((b) => b.z === 17 && b.x > 4.5 && b.x < 6)!;
    expect(pier.h).toBeCloseTo(6.7, 6);
  });
});
