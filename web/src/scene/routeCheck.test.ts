import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from '../collision/colliders';
import { checkRoute, clearanceAt, routeLength } from './routeCheck';
import { resolveSceneSpec } from './specCheck';
import type { XZ } from './spec';

// canvas 2D giả (biển, vôi, ngói vẽ bằng canvas): mọi lệnh vẽ trả lại chính nó
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : key === 'getImageData' ? () => ({ data: new Uint8ClampedArray(4) }) : () => ctx) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx }) });
vi.stubGlobal('window', { devicePixelRatio: 1, innerWidth: 390, innerHeight: 844, addEventListener: () => {} });

const { loadScene, HOME_SCENE } = await import('./loadSpec');
const { buildWorld } = await import('./world');
const { DRAFT_GO_MO, DRAFT_KHAT_NHI } = await import('./npcDraft');

const flat = (): number => 0;
const square: XZ[] = [
  [0, 0],
  [0, 10],
  [10, 10],
  [10, 0],
];

describe('Kiểm đường đi NPC', () => {
  it('R-NPC-7: đường thoáng, phẳng → hợp lệ; dài 40 m', () => {
    const c = new Colliders();
    c.addCircle(5, 5, 1);
    expect(checkRoute('t', square, c, flat)).toEqual([]);
    expect(routeLength(square)).toBeCloseTo(40, 9);
  });

  it('R-NPC-7: đoạn đi sát vật cản (< 0,6 m tới mép) → báo đoạn đó', () => {
    const c = new Colliders();
    c.addCircle(0.9, 5, 0.5); // mép cách đoạn 0→1 là 0,4 m
    c.add(10, 5, 0.4, 2); // hộp chạm đoạn 2→3
    const p = checkRoute('t', square, c, flat);
    expect(p).toHaveLength(2);
    expect(p[0]).toContain('đoạn 0→1');
    expect(p[1]).toContain('đoạn 2→3');
    expect(clearanceAt(c, 10, 5)).toBeLessThan(0);
  });

  it('R-NPC-7: dốc quá 35° hoặc ra ngoài nền → báo', () => {
    const steep = (x: number): number => x * 1.2; // ~50° theo x
    expect(checkRoute('t', square, new Colliders(), steep).some((s) => s.includes('dốc'))).toBe(true);
    const hole = (_x: number, z: number): number => (z > 8 ? Number.NaN : 0);
    expect(checkRoute('t', square, new Colliders(), hole).some((s) => s.includes('ngoài nền'))).toBe(true);
  });

  it('R-NPC-7: đặc tả — route có thì ≥ 3 điểm; thiếu route / pose / scale / speed thì như cũ', () => {
    const ok = resolveSceneSpec({ npcs: [{ id: 'go-mo', x: 0, z: 0, route: square, speed: 1.1 }, { id: 'khat-nhi', x: 1, z: 2, pose: 'ngoi', scale: 0.8 }] });
    expect(ok.problems).toEqual([]);
    expect(ok.spec.npcs[0].route).toHaveLength(4);
    expect(ok.spec.npcs[1].pose).toBe('ngoi');
    const old = resolveSceneSpec({ npcs: [{ id: 'tieu-mac', x: 7.6, z: 13.6 }] });
    expect(old.spec.npcs[0]).toEqual({ id: 'tieu-mac', x: 7.6, z: 13.6 });
    const bad = resolveSceneSpec({ npcs: [{ id: 'go-mo', x: 0, z: 0, route: [[0, 0], [1, 1]] }, { id: 'khat-nhi', x: 0, z: 0, pose: 'nam' }] });
    expect(bad.spec.npcs).toHaveLength(0);
    expect(bad.problems.join('\n')).toContain('route');
  });
});

describe('Bản thử đường vòng B trên Khởi Nguyên Trấn', () => {
  it('R-NPC-7: đường Lão Canh không vướng vật cản, trên nền, dốc ≤ 35°; Tiểu Khất cách làn tây ≥ 3 m', () => {
    const spec = loadScene(HOME_SCENE).spec;
    const colliders = new Colliders();
    const world = buildWorld(new THREE.Scene(), colliders, spec);
    // NPC đứng là vật cản; NPC có đường đi (Lão Canh đã vào đặc tả 2026-11-16) thì không — như `check-scene.mjs`
    for (const p of spec.npcs) if (!p.route) colliders.addCircle(p.x, p.z, 0.45);
    colliders.addCircle(DRAFT_KHAT_NHI.x, DRAFT_KHAT_NHI.z, 0.45);
    // đặc tả có Lão Canh thì đúng đường vòng B đã duyệt (bản thử)
    const inSpec = spec.npcs.find((p) => p.id === 'go-mo');
    if (inSpec) expect(inSpec.route).toEqual(DRAFT_GO_MO.route);
    // Tiểu Khất trong đặc tả (khi đưa lại — đang tạm gỡ, V-20261116-102) = đúng bản thử (vị trí, hướng, ngồi, cỡ)
    const kn = spec.npcs.find((p) => p.id === 'khat-nhi');
    if (kn) expect(kn).toEqual(DRAFT_KHAT_NHI);
    const ground = (x: number, z: number): number => world.surface.heightAt(x, z);
    const route = DRAFT_GO_MO.route!;
    const problems = checkRoute('go-mo', route, colliders, ground);
    if (problems.length) console.log(problems.join('\n'));
    expect(problems).toEqual([]);
    // máy kiểm thấy vật cản thật: dời điểm 2 sang sát tường Quảng Trường (−6,5; 18) → báo
    expect(colliders.boxes.length).toBeGreaterThan(20);
    const bad = route.map((p, i): XZ => (i === 2 ? [-6.5, 18] : p));
    expect(checkRoute('go-mo', bad, colliders, ground).length).toBeGreaterThan(0);
    const len = routeLength(route, ground);
    console.log(`Vòng B: ${len.toFixed(1)} m, ${(len / 1.1).toFixed(0)} s / vòng`);
    // V-39: lối Cổng Trấn dài thêm 10 m → vòng dài thêm ~20 m; V-41: Thiên Bậc ngắn lại 17 m → vòng ngắn ~34 m (≈ 176 m)
    expect(len).toBeGreaterThan(160);
    expect(len).toBeLessThan(200);
    expect(Math.abs(DRAFT_KHAT_NHI.x - -2.5)).toBeGreaterThan(3);
    // Tiểu Khất ngồi cách mọi đoạn đường Lão Canh ≥ 1,5 m (không chắn lối, hai NPC không chạm nhau)
    const segDist = ([ax, az]: XZ, [bx, bz]: XZ): number => {
      const dx = bx - ax;
      const dz = bz - az;
      const t = Math.max(0, Math.min(1, ((DRAFT_KHAT_NHI.x - ax) * dx + (DRAFT_KHAT_NHI.z - az) * dz) / (dx * dx + dz * dz)));
      return Math.hypot(DRAFT_KHAT_NHI.x - (ax + dx * t), DRAFT_KHAT_NHI.z - (az + dz * t));
    };
    const nearest = Math.min(...route.map((p, i) => segDist(p, route[(i + 1) % route.length])));
    expect(nearest).toBeGreaterThanOrEqual(1.5);
  }, 120_000);
});
