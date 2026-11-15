import { describe, expect, it } from 'vitest';
import { Colliders } from '../collision/colliders';
import { groveTrees } from './cayTrenNen';
import { inClump } from './grass';
import { addBounds, boundsBoxes, checkBounds } from './ranhDi';
import { DEFAULT_SCENE, type SceneSpec } from './spec';
import { resolveSceneSpec } from './specCheck';
import { STREAM_BANK, streamCut, terrainHeightFn } from './terrainHeight';

// Trường địa hình mới cho vùng làm lại (V-66 B2): lòng suối trũng, bậc cắt qua bục, cỡ cụm cây, cỏ / đá gom cụm, ranh đi được.
// Mọi trường thiếu = như cũ (quy tắc 8 — cảnh cũ không đổi).

const terrain = (patch: Partial<SceneSpec['terrain']>): SceneSpec['terrain'] => ({
  ...DEFAULT_SCENE.terrain,
  enabled: true,
  noise: { seed: 1, amp: 0, scale: 10 },
  ...patch,
});

describe('lòng suối trũng (terrain.streams[].depth)', () => {
  const s = { points: [[0, -20], [0, 20]] as [number, number][], width: 4, depth: 1.5 };
  it('giữa lòng hạ đúng depth, ra hết bờ (width / 2 + 1,5 m) thì 0; thiếu depth = không trũng (như cũ)', () => {
    expect(streamCut(s, 0, 0)).toBeCloseTo(1.5);
    expect(streamCut(s, 2 + STREAM_BANK + 0.01, 0)).toBe(0);
    expect(streamCut(s, 3, 0)).toBeGreaterThan(0);
    expect(streamCut(s, 3, 0)).toBeLessThan(1.5);
    expect(streamCut({ points: s.points, width: 4 }, 0, 0)).toBe(0);
  });
  it('địa hình: đất dọc suối thấp hơn; lối lát cắt qua thì lối ép phẳng đè lên (chỗ chừa cầu)', () => {
    const f = terrainHeightFn(terrain({ streams: [s] }), []);
    expect(f(0, 0)).toBeCloseTo(-1.5);
    expect(f(10, 0)).toBeCloseTo(0);
    const g = terrainHeightFn(terrain({ streams: [s], blend: 2 }), [{ from: [-8, 0], to: [8, 0], width: 3 }]);
    expect(g(0, 0)).toBeCloseTo(0);
  });
});

describe('bậc cắt qua bục (terrain.stairs[].cut)', () => {
  // bục dưới +3 lồng bục trên +6 (bục cao khai trước) — gò hai bậc
  const plateaus = [
    { from: [-10, -10] as [number, number], to: [0, 10] as [number, number], y: 6, blend: 1 },
    { from: [-20, -10] as [number, number], to: [10, 10] as [number, number], y: 3, blend: 1 },
  ];
  const stair = { from: [8, 0] as [number, number], to: [-2, 0] as [number, number], width: 2.4 };
  it('có cut: trên dải bậc độ cao dốc đều từ bục dưới (3) lên bục trên (6)', () => {
    const f = terrainHeightFn(terrain({ plateaus, stairs: [{ ...stair, cut: true }] }), []);
    expect(f(8, 0)).toBeCloseTo(3);
    expect(f(3, 0)).toBeCloseTo(4.5);
    expect(f(-2, 0)).toBeCloseTo(6);
    // ngoài dải bậc: bục thắng như thường
    expect(f(3, 5)).toBeCloseTo(3);
  });
  it('không cut (như cũ): bục thắng bậc chỗ chồng nhau', () => {
    const f = terrainHeightFn(terrain({ plateaus, stairs: [stair] }), []);
    expect(f(3, 0)).toBeCloseTo(3);
  });
  it('specCheck nhận "cut" và "depth", không báo trường lạ', () => {
    const { problems } = resolveSceneSpec({
      terrain: { enabled: true, stairs: [{ ...stair, cut: true }], streams: [{ points: [[0, 0], [5, 5]], width: 2, depth: 0.7 }] },
    });
    expect(problems.filter((p) => p.includes('trường lạ') || p.includes('depth'))).toEqual([]);
  });
});

describe('cỡ cụm cây (trees.groves[].scale)', () => {
  const g = { kind: 'truc' as const, x: 0, z: 0, w: 10, d: 10, count: 6 };
  it('scale nhân cỡ mọi cây, vị trí giữ nguyên; thiếu = như cũ', () => {
    const a = groveTrees(g, 7, 0);
    const b = groveTrees({ ...g, scale: 1.8 }, 7, 0);
    b.forEach((t, i) => {
      expect([t.x, t.z]).toEqual([a[i].x, a[i].z]);
      expect(t.scale).toBeCloseTo(a[i].scale * 1.8);
    });
  });
});

describe('cỏ / đá gom cụm (terrain.grass.clump, rocks.clump)', () => {
  it('clump 0 = mọi chỗ (rải đều như cũ); clump cao thì một phần đất không có', () => {
    const pts = Array.from({ length: 400 }, (_, i) => [(i % 20) * 4, Math.floor(i / 20) * 4] as const);
    expect(pts.every(([x, z]) => inClump(0, x, z, 11))).toBe(true);
    const share = pts.filter(([x, z]) => inClump(0.5, x, z, 11)).length / pts.length;
    expect(share).toBeGreaterThan(0.1);
    expect(share).toBeLessThan(0.9);
  });
});

describe('ranh đi được (bounds)', () => {
  const on = { enabled: true, from: [-50, -50] as [number, number], to: [50, 50] as [number, number] };
  it('tắt (mặc định) = không có hộp nào', () => {
    expect(DEFAULT_SCENE.bounds.enabled).toBe(false);
    expect(boundsBoxes(DEFAULT_SCENE.bounds)).toEqual([]);
  });
  it('R-VA-2: bật = 4 hộp ngay ngoài ranh; nhân vật đi ra ngoài bị đẩy về trong', () => {
    const c = new Colliders();
    addBounds(c, on);
    expect(c.boxes).toHaveLength(4);
    // nhân vật tới sát ranh (một khung hình đi ≤ 0,35 m — tâm không lọt vào hộp)
    for (const p of [{ x: 0, z: 49.8 }, { x: -49.7, z: 10 }, { x: 49.9, z: -49.9 }]) {
      c.resolve(p, 0.5);
      expect(Math.abs(p.x)).toBeLessThanOrEqual(49.5 + 1e-6);
      expect(Math.abs(p.z)).toBeLessThanOrEqual(49.5 + 1e-6);
    }
  });
  it('scene:check: chỗ xuất phát / cổng đi bộ ngoài ranh → báo', () => {
    const s = resolveSceneSpec({
      bounds: on,
      player: { start: [60, 0] },
      portals: [{ scene: 'tong-mon', area: { from: [-52, 0], to: [-50, 2] }, arrive: { at: [-48, 1], rotY: 90 } }],
    }).spec;
    const out = checkBounds(s).join('\n');
    expect(out).toContain('chỗ xuất phát');
    expect(out).toContain('portals[0]');
  });
});
