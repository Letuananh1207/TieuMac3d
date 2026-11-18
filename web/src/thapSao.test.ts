import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from './collision/colliders';
import { LayeredGround, type Ground } from './collision/ground';
import { canStep } from './player/controller';
import { loadScene } from './scene/loadSpec';
import { addBounds } from './scene/ranhDi';
import { DEFAULT_SCENE } from './scene/spec';
import { addFluteTower } from './scene/thapSao';
import { BUNDLE_R, checkFluteTower, DEFAULT_FLUTE_TOWER, postSpots } from './scene/thapSaoSpec';
import { buildHeightfield } from './scene/terrainHeight';

/**
 * Tháp Sáo Trúc (V-113) giữa Bãi giữa Thung Trúc Gió Hát: bó ống trúc chặn, đế đá hai bậc đứng lên được, 5 cọc nơ + giá chuông
 * gió chặn; lối chính bãi hạc → đèo vẫn đi được vòng quanh tháp (R-VA-1, R-VA-3).
 */
const spec = loadScene('rung-truc').spec;
const t = spec.fluteTower;
const hf = buildHeightfield(spec.terrain, spec.paths);
const groundY = (x: number, z: number): number => {
  const h = hf.heightAt(x, z);
  return Number.isFinite(h) ? h : 0;
};
const colliders = new Colliders();
addBounds(colliders, spec.bounds);
const tower = addFluteTower(new THREE.Scene(), colliders, t, groundY);
const ground: Ground = new LayeredGround(hf, tower.pads);

/** Đi thẳng từ (x, z) theo (dx, dz) tối đa `dist` m, bước 5 cm: dốc / bậc chặn (R-VA-2/3), vật cản đẩy ra (R-VA-1). */
function walk(x: number, z: number, dx: number, dz: number, dist: number): { x: number; z: number; y: number; maxY: number } {
  const p = { x, z, y: ground.heightAt(x, z), maxY: -Infinity };
  for (let s = 0; s < dist / 0.05; s++) {
    const nx = p.x + dx * 0.05;
    const nz = p.z + dz * 0.05;
    if (!canStep(ground, p.x, p.z, nx, nz, p.y)) break;
    const q = { x: nx, z: nz };
    colliders.resolve(q, 0.5, p.y);
    p.x = q.x;
    p.z = q.z;
    p.y = ground.heightAt(q.x, q.z, p.y);
    p.maxY = Math.max(p.maxY, p.y);
  }
  return p;
}

describe('Thung Trúc Gió Hát — Tháp Sáo Trúc (V-113)', () => {
  it('đặc tả: tháp giữa Bãi giữa (0; 4) cao 15 m, đế ∅ 8,4 m, 5 cọc nơ, 3 giá chuông gió; mặc định tắt (cảnh khác không đổi)', () => {
    expect(t).toMatchObject({ enabled: true, x: 0, z: 4, height: 15, base: 4.2, posts: true });
    expect(t.chimes).toHaveLength(3);
    expect(DEFAULT_SCENE.fluteTower.enabled).toBe(false);
    expect(checkFluteTower(t)).toEqual([]);
    expect(checkFluteTower({ ...DEFAULT_FLUTE_TOWER, enabled: true, height: 20, base: 2, chimes: [{ x: 1, z: 1, rotY: 45 }] })).toHaveLength(5);
  });

  it('R-VA-1: từ bãi hạc đi thẳng bắc theo lối chính → bước lên đế đá (bậc 0,25 → 0,5 m), dừng trước bó ống', () => {
    const p = walk(0, 34, 0, -1, 40);
    expect(p.z).toBeGreaterThan(t.z + BUNDLE_R);
    expect(p.z).toBeLessThan(t.z + t.base * 0.8);
    expect(p.y).toBeCloseTo(0.5, 2);
    expect(ground.heightAt(0, t.z + t.base - 0.2)).toBeCloseTo(0.25, 2);
  });

  it('R-VA-1: vòng qua tháp (x −6) rồi về lối chính lên hết bậc đá bắc tới đèo; cọc nơ không nằm trên lối lát', () => {
    const a = walk(-6, 20, 0, -1, 26);
    expect(a.z).toBeLessThanOrEqual(-5.9);
    const b = walk(0, -1, 0, -1, 50);
    expect(b.z).toBeLessThanOrEqual(-46);
    expect(b.y).toBeCloseTo(8, 1);
    for (const [x] of postSpots(t)) expect(Math.abs(x)).toBeGreaterThan(1.75 + 0.3); // lối nam rộng 3,5 m
  });

  it('R-VA-1: cọc nơ và cột giá chuông gió chặn; tháp không lấn chỗ ngồi đàn cầm, vùng măng, NPC', () => {
    for (const [x, z] of postSpots(t)) {
      const q = { x, z: z + 0.05 };
      colliders.resolve(q, 0.5);
      expect(Math.hypot(q.x - x, q.z - z)).toBeGreaterThanOrEqual(0.79);
    }
    const c = t.chimes[0];
    const q = { x: c.x - 0.75, z: c.z + 0.05 };
    colliders.resolve(q, 0.5);
    expect(Math.hypot(q.x - (c.x - 0.75), q.z - c.z)).toBeGreaterThanOrEqual(0.64);
    const keep = t.base + 1.5;
    for (const n of spec.npcs) expect(Math.hypot(n.x - t.x, n.z - t.z)).toBeGreaterThan(keep);
    const dan = spec.props.find((p) => p.kind === 'dan-cam')!;
    expect(Math.hypot(dan.x - t.x, dan.z - t.z)).toBeGreaterThan(keep);
    for (const g of spec.miniGames)
      if (g.kind === 'hai-mang') for (const a of g.areas) expect(t.x + keep < a.from[0] || t.x - keep > a.to[0] || t.z + keep < a.from[1] || t.z - keep > a.to[1]).toBe(true);
  });
});
