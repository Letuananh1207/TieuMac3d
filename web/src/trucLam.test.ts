import { describe, expect, it } from 'vitest';
import { Colliders } from './collision/colliders';
import { canStep } from './player/controller';
import { loadScene } from './scene/loadSpec';
import { addBounds } from './scene/ranhDi';
import { buildHeightfield } from './scene/terrainHeight';

/**
 * Trúc Lâm làm lại — địa hình + phạm vi (V-66 B2, phương án A + nét B: "thung suối, bãi giữa"): lõi đi được 100 × 100 m,
 * bãi giữa Ø 26 m, gò tây bắc 2 bậc (+3 / +6) có bậc đá, đèo bắc +8 m, thác đông bắc, suối xuống sông lớn mép nam.
 * Đi trên địa hình theo R-VA-2 (dốc ≤ 35°), ranh đi được `bounds`.
 */
const spec = loadScene('rung-truc').spec;
const hf = buildHeightfield(spec.terrain, spec.paths);

/** Đi thẳng từ (x, z) theo (dx, dz) tối đa `dist` m, bước 5 cm, dừng khi không bước được (R-VA-2). */
function walk(x: number, z: number, dx: number, dz: number, dist: number): { x: number; z: number; y: number; maxSlope: number } {
  const p = { x, z, y: hf.heightAt(x, z), maxSlope: 0 };
  for (let s = 0; s < dist / 0.05; s++) {
    const nx = p.x + dx * 0.05;
    const nz = p.z + dz * 0.05;
    if (!canStep(hf, p.x, p.z, nx, nz)) break;
    p.x = nx;
    p.z = nz;
    p.y = hf.heightAt(nx, nz);
    p.maxSlope = Math.max(p.maxSlope, hf.slopeAt(nx, nz));
  }
  return p;
}

describe('Trúc Lâm — địa hình + phạm vi (V-66 B2)', () => {
  it('R-VA-2: ranh đi được x −50 … 50, z −50 … 50; bãi hạc (sân đá (0; 39)) ở nam, sông lớn ngoài ranh nam', () => {
    expect(spec.bounds).toEqual({ enabled: true, from: [-50, -50], to: [50, 50] });
    expect(spec.stoneYard.center).toEqual([0, 39]);
    // lòng sông thấp hơn bờ: mặt đất giữa sông (z ≈ 58) thấp hơn bãi hạc ≥ 1 m
    expect(hf.heightAt(0, 58.5)).toBeLessThan(hf.heightAt(0, 39) - 1);
    // đi nam từ bãi hạc: đất tới ranh vẫn đi được, tới ranh thì dừng (z ≤ 49,5 — bán kính nhân vật 0,5)
    const p = walk(0, 44, 0, 1, 6);
    expect(p.z).toBeGreaterThanOrEqual(49.5);
    const c = new Colliders();
    addBounds(c, spec.bounds);
    const me = { x: 0, z: 49.8 };
    c.resolve(me, 0.5);
    expect(me.z).toBeLessThanOrEqual(49.5 + 1e-6);
  });

  it('R-VA-2: từ bãi hạc đi thẳng bắc theo lối chính → qua bãi giữa, lên hết bậc đá bắc tới đèo cao 8 m, dốc ≤ 35°', () => {
    const p = walk(0, 34, 0, -1, 82);
    expect(p.z).toBeLessThanOrEqual(-46);
    expect(p.y).toBeCloseTo(8, 1);
    expect(p.maxSlope).toBeLessThanOrEqual(35);
  });

  it('R-VA-2: gò tây bắc — lối nhánh (z −19) + bậc đá lên bậc dưới +4; bậc đá (z −30) lên đỉnh gò +8, dốc ≤ 25°; kè quanh gò chặn', () => {
    const low = walk(-1, -19, -1, 0, 16);
    expect(low.x).toBeLessThanOrEqual(-16.5);
    expect(low.y).toBeCloseTo(4, 1);
    expect(low.maxSlope).toBeLessThanOrEqual(35);
    const top = walk(-16, -30, -1, 0, 14);
    expect(top.x).toBeLessThanOrEqual(-28);
    expect(top.y).toBeCloseTo(8, 1);
    expect(top.maxSlope).toBeLessThanOrEqual(35);
    // bậc đá gò: dốc trung bình ≤ 25°
    for (const s of spec.terrain.stairs) {
      const len = Math.hypot(s.to[0] - s.from[0], s.to[1] - s.from[1]);
      const rise = Math.abs(hf.heightAt(...s.to) - hf.heightAt(...s.from));
      expect((Math.atan2(rise, len) * 180) / Math.PI).toBeLessThanOrEqual(25);
    }
    // không theo bậc: đi về tây ở z −27 → dừng ở chân kè bậc dưới
    const wall = walk(-6, -27, -1, 0, 12);
    expect(wall.x).toBeGreaterThan(-14);
    expect(wall.y).toBeLessThan(1.5);
  });

  it('R-VA-2: bãi giữa (−13 … 13, −9 … 17) phẳng, trống (không cây); P1 đỉnh gò, P2 chân thác, P3 tây nam là nền phẳng trống', () => {
    const flat = (x: number, z: number, y: number): void => {
      expect(hf.heightAt(x, z)).toBeCloseTo(y, 1);
      expect(hf.slopeAt(x, z)).toBeLessThan(3);
    };
    for (const [x, z] of [[0, 4], [-10, -6], [10, 14]] as const) flat(x, z, 0);
    flat(-31, -30, 8); // P1 đỉnh gò
    flat(20, -30, 0); // P2 chân thác (tây ao)
    flat(-32, 26, 0); // P3
    const inside = (x: number, z: number, x0: number, z0: number, x1: number, z1: number): boolean => x >= x0 && x <= x1 && z >= z0 && z <= z1;
    for (const g of spec.trees.groves) {
      const near = (x0: number, z0: number, x1: number, z1: number): boolean =>
        inside(g.x - g.w / 2, g.z - g.d / 2, x0, z0, x1, z1) || inside(g.x + g.w / 2, g.z + g.d / 2, x0, z0, x1, z1) || inside(g.x, g.z, x0, z0, x1, z1);
      expect(near(-13, -9, 13, 17), `cụm cây (${g.x}; ${g.z}) trong bãi giữa`).toBe(false);
      expect(near(-37, -35, -25, -25), `cụm cây (${g.x}; ${g.z}) trên đỉnh gò`).toBe(false);
    }
  });

  it('R-HANH-4: ba cổng đi bộ ở mép đúng hướng, mỗi cổng ở cuối một lối (tây đường mòn 3 m, đông quan đạo 4 m, bắc trên đèo)', () => {
    const at = (scene: string): [number, number] => {
      const p = spec.portals.find((q) => q.scene === scene)!;
      return [(p.area.from[0] + p.area.to[0]) / 2, (p.area.from[1] + p.area.to[1]) / 2];
    };
    expect(at('tong-mon')).toEqual([-47.5, 4]);
    expect(at('giang-nam')).toEqual([47.5, 4]);
    expect(at('truong-thanh')).toEqual([0, -47]);
    const widths = spec.paths.filter((p) => !p.dirt).map((p) => p.width); // sân đất Trúc Lư (B3) không phải lối
    expect(widths.every((w) => w >= 2 && w <= 4)).toBe(true);
    expect(hf.heightAt(0, -47)).toBeCloseTo(8, 1);
  });
});
