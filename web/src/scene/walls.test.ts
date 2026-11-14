import { describe, expect, it } from 'vitest';
import { Colliders } from '../collision/colliders';
import { gateOpening, lauClearHeight, lauTop, plasterWallBoxes } from './kien_truc/tuong';
import { DEFAULT_SCENE, type SceneSpec, type WallSegment } from './spec';
import { HOME_SCENE, loadScene } from './loadSpec';
import { ringRuns, segmentRuns, wallGates } from './walls';

/** Tường Quảng Trường như ví dụ R-VA-1: ±17, cao 5,2, dày 0,5; cổng mái ngói nam / bắc rộng 9,6 lối cao 4 (V-20261114-19),
 *  cổng trăng đông (tâm z −9 — Sân Đông, sân Truyền Tống Đài cũ: V-20261114-26, V-38) / tây rộng 6,4. */
const walls: SceneSpec['walls'] = {
  ...DEFAULT_SCENE.walls,
  half: 17,
  height: 5.2,
  thickness: 0.5,
  style: 'voi',
  gates: [
    { side: 'nam', at: 0, width: 9.6, kind: 'lau', clearHeight: 4, signs: { nam: '外門', bac: '山門' } },
    { side: 'bac', at: 0, width: 9.6, kind: 'lau', clearHeight: 4 },
    { side: 'dong', at: -9, width: 6.4 },
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

  it('R-VA-1: cổng trăng đông (x 17, tâm z −9) lối 4,6 m: z −9 qua được, z −6 dừng ở x 16,25; cổng trăng tây (tâm z −6): z −6 qua được', () => {
    const dong = wallGates(walls, [])[2];
    expect(2 * gateOpening(dong)).toBeCloseTo(4.6, 6);
    expect(walk(world(), 0, -9, 1, 0, 25).x).toBeGreaterThan(20);
    expect(walk(world(), 0, -6, 1, 0, 25).x).toBeCloseTo(16.25, 2);
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

describe('R-VA-1: cổng trăng thứ hai trên tường tây Quảng Trường, ngang bàn chơi Kỳ Văn Uyển (cảnh thật)', () => {
  const spec = loadScene(HOME_SCENE).spec;
  const real = (): Colliders => {
    const c = new Colliders();
    for (const b of plasterWallBoxes(spec.walls, spec.wallSegments)) c.add(b.x, b.z, b.w, b.d, b.h);
    return c;
  };

  it('R-VA-1: x −17 tâm z 4 rộng 6,4, lối 4,6 m; từ (−15; 4) đi tây qua được, z 0 / z 7,5 dừng ở x −16,25', () => {
    const west = wallGates(spec.walls, spec.wallSegments).filter((g) => g.axis === 'z' && g.fixed === -17);
    expect(west.map((g) => g.at).sort((a, b) => a - b)).toEqual([-6, 4]);
    const gate = west.find((g) => g.at === 4)!;
    expect([gate.width, gate.kind]).toEqual([6.4, 'trang']);
    expect(2 * gateOpening(gate)).toBeCloseTo(4.6, 6);
    expect(walk(real(), -15, 4, -1, 0, 10).x).toBeLessThan(-24);
    expect(walk(real(), -15, 0, -1, 0, 10).x).toBeCloseTo(-16.25, 2);
    expect(walk(real(), -15, 7.5, -1, 0, 10).x).toBeCloseTo(-16.25, 2);
    // ngược lại: từ sân chơi đi đông qua cổng ra Quảng Trường
    expect(walk(real(), -24, 4, 1, 0, 10).x).toBeGreaterThan(-15);
  });

  it('tường ngoài x −51 kín (bỏ cổng đặt nhầm 2026-11-14.24)', () => {
    expect(wallGates(spec.walls, spec.wallSegments).some((g) => g.axis === 'z' && g.fixed === -51)).toBe(false);
    expect(walk(real(), -49, -26.5, -1, 0, 10).x).toBeCloseTo(-50.25, 2);
  });
});

describe('R-VA-1: tường đông Quảng Trường — cổng Sân Đông + cổng Mặc Trì, hai sân có tường (cảnh thật, V-20261114-26)', () => {
  const spec = loadScene(HOME_SCENE).spec;
  const real = (): Colliders => {
    const c = new Colliders();
    for (const b of plasterWallBoxes(spec.walls, spec.wallSegments)) c.add(b.x, b.z, b.w, b.d, b.h);
    return c;
  };

  it('R-VA-1: x 17 có hai cổng trăng rộng 6,4 (lối 4,6 m) tâm z −9 và z 8; z −9 / z 8 qua được, z 0 dừng ở x 16,25', () => {
    const east = wallGates(spec.walls, spec.wallSegments).filter((g) => g.axis === 'z' && g.fixed === 17);
    expect(east.map((g) => g.at).sort((a, b) => a - b)).toEqual([-9, 8]);
    for (const g of east) {
      expect([g.width, g.kind]).toEqual([6.4, 'trang']);
      expect(2 * gateOpening(g)).toBeCloseTo(4.6, 6);
    }
    expect(walk(real(), 15, -9, 1, 0, 6).x).toBeGreaterThan(20);
    expect(walk(real(), 15, 8, 1, 0, 6).x).toBeGreaterThan(20);
    expect(walk(real(), 15, 0, 1, 0, 6).x).toBeCloseTo(16.25, 2);
  });

  it('R-VA-1: Sân Đông x 17…42, z −22…3 và sân Mặc Trì z 3…25 có tường bao (Mặc Trì chỉ thông ra Quảng Trường)', () => {
    // Sân Đông: đi bắc ở x 40 dừng ở z −21,25; đi nam dừng ở z 2,25 (tường ngăn hai sân); đi đông dừng ở x 41,25
    expect(walk(real(), 40, -5, 0, -1, 25).z).toBeCloseTo(-21.25, 2);
    expect(walk(real(), 40, -5, 0, 1, 15).z).toBeCloseTo(2.25, 2);
    expect(walk(real(), 35, -2, 1, 0, 15).x).toBeCloseTo(41.25, 2);
    // Mặc Trì: đi nam dừng ở z 24,25; đi đông dừng ở x 41,25; đi bắc dừng ở z 3,75
    expect(walk(real(), 30, 22, 0, 1, 10).z).toBeCloseTo(24.25, 2);
    expect(walk(real(), 35, 23, 1, 0, 15).x).toBeCloseTo(41.25, 2);
    expect(walk(real(), 40, 10, 0, -1, 15).z).toBeCloseTo(3.75, 2);
    // tường nối hai đầu tường đông Quảng Trường: x 17 từ z −22 tới −17 và từ 17 tới 25
    expect(walk(real(), 15, -20, 1, 0, 10).x).toBeCloseTo(16.25, 2);
    expect(walk(real(), 15, 21, 1, 0, 10).x).toBeCloseTo(16.25, 2);
  });
});

describe('R-VA-1: cổng bắc Sân Đông + cổng hậu Tàng Thư Các (cảnh thật, V-20261114-30)', () => {
  const spec = loadScene(HOME_SCENE).spec;
  const real = (): Colliders => {
    const c = new Colliders();
    for (const b of plasterWallBoxes(spec.walls, spec.wallSegments)) c.add(b.x, b.z, b.w, b.d, b.h);
    return c;
  };
  const gate = (fixed: number, at: number) => wallGates(spec.walls, spec.wallSegments).find((g) => g.axis === 'x' && g.fixed === fixed && g.at === at);

  it('R-VA-1: tường bắc Sân Đông z −22 có cổng trăng tâm x 30 rộng 5, lối 4 m; từ (30; −18) đi bắc qua được ra bãi đông, x 40 vẫn dừng ở z −21,25', () => {
    const g = gate(-22, 30)!;
    expect([g.width, g.kind]).toEqual([5, 'trang']);
    expect(2 * gateOpening(g)).toBeCloseTo(4, 6);
    expect(walk(real(), 30, -18, 0, -1, 10).z).toBeLessThan(-26);
    expect(walk(real(), 30, -26, 0, 1, 8).z).toBeGreaterThan(-19); // ngược lại: từ bãi đông vào Sân Đông
    expect(walk(real(), 40, -5, 0, -1, 25).z).toBeCloseTo(-21.25, 2);
  });

  it('R-VA-1: tường bắc Tàng Thư Các z −32 có cổng trăng hậu tâm x −33 rộng 5, lối 4 m; từ (−33; −29) đi bắc qua được ra Vườn Bia, x −37 dừng ở z −31,25', () => {
    const g = gate(-32, -33)!;
    expect([g.width, g.kind]).toEqual([5, 'trang']);
    expect(2 * gateOpening(g)).toBeCloseTo(4, 6);
    expect(walk(real(), -33, -29, 0, -1, 8).z).toBeLessThan(-35);
    expect(walk(real(), -37, -29, 0, -1, 8).z).toBeCloseTo(-31.25, 2);
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
