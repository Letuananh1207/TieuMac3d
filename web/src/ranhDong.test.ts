import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from './collision/colliders';
import { canStep } from './player/controller';
import { clearanceAt } from './scene/routeCheck';

/**
 * V-49 (người dùng 2026-11-15 "bỏ tường, thay hàng trúc / tùng"): mép đông trấn (x 42,4; dày ở đất phẳng z −25,2 … −9, thưa ở chân
 * núi — sườn dốc chặn) và nam Mặc Trì (z 25,2) là hàng trúc xen tùng có va chạm, x 17 (z 17 … 25) là hàng chè thấp. Cảnh thật đủ lớp (nhà, cây, lan can, địa hình — R-VA-1 + R-VA-2):
 * đi thẳng / chéo từ trong trấn ra không lọt khe nào.
 */
// canvas 2D giả (biển, vôi, ngói vẽ bằng canvas): mọi lệnh vẽ trả lại chính nó
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : key === 'getImageData' ? () => ({ data: new Uint8ClampedArray(4) }) : () => ctx) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx }) });
vi.stubGlobal('window', { devicePixelRatio: 1, innerWidth: 390, innerHeight: 844, addEventListener: () => {} });

const { loadScene, HOME_SCENE } = await import('./scene/loadSpec');
const { buildWorld } = await import('./scene/world');

const spec = loadScene(HOME_SCENE).spec;
const colliders = new Colliders();
const world = buildWorld(new THREE.Scene(), colliders, spec);

/** Đi thẳng từ (x, z) theo (dx, dz), bước 5 cm: dốc > 35° chặn (R-VA-2), vật cản đẩy ra (R-VA-1). */
function walk(x: number, z: number, dx: number, dz: number, dist: number): { x: number; z: number } {
  const p = { x, z };
  const len = Math.hypot(dx, dz);
  for (let s = 0; s < dist / 0.05; s++) {
    const nx = p.x + (dx / len) * 0.05;
    const nz = p.z + (dz / len) * 0.05;
    if (!canStep(world.surface, p.x, p.z, nx, nz)) break;
    p.x = nx;
    p.z = nz;
    colliders.resolve(p, 0.5);
  }
  return p;
}

/** Chỗ đứng hợp lệ (không chồng vật cản) — điểm xuất phát của mỗi lần đi thử. */
const free = (x: number, z: number): boolean => clearanceAt(colliders, x, z) > 0.5;

describe('R-VA-1 (V-49): ranh giới cây phía đông trấn — không đi ra ngoài', () => {
  it('R-VA-1: từ Sân Cổ Thụ đi về đông (thẳng và chéo) dừng trước hàng cây dày x 42,4 (z −26 … −11), kể cả góc chân trà lâu', () => {
    let tried = 0;
    for (let z = -26; z <= -11; z += 0.25) {
      for (const dz of [0, -0.5, 0.5]) {
        if (!free(40.9, z)) continue;
        tried++;
        expect(walk(40.9, z, 1, dz, 12).x, `z ${z} dz ${dz}`).toBeLessThan(42.2);
      }
    }
    expect(tried).toBeGreaterThan(100);
  });

  it('R-VA-2: đoạn chân núi (z −11 … 25) cây thưa (z 0 · 8 · 16) — lọt giữa hai cây thì sườn dốc > 35° chặn, không quá x 44,5', () => {
    for (let z = -11; z <= 24.5; z += 0.25) {
      for (const dz of [0, -0.5, 0.5]) {
        if (!free(40.9, z)) continue;
        expect(walk(40.9, z, 1, dz, 12).x, `z ${z} dz ${dz}`).toBeLessThan(44.5);
      }
    }
  });

  it('R-VA-1: từ Mặc Trì đi về nam (thẳng và chéo) dừng trước hàng cây z 25,2', () => {
    for (let x = 17.5; x <= 42; x += 0.25) {
      for (const dx of [0, -0.5, 0.5]) {
        if (!free(x, 23.4)) continue;
        expect(walk(x, 23.4, dx, 1, 12).z, `x ${x} dx ${dx}`).toBeLessThan(25);
      }
    }
  });

  it('R-VA-1: hàng chè x 17 (z 17 … 25) nối góc lan can Quảng Trường với hàng trúc nam — không lọt qua lại', () => {
    for (let z = 16.75; z <= 24.5; z += 0.25) {
      if (free(18.2, z)) expect(walk(18.2, z, -1, 0, 6).x, `tây z ${z}`).toBeGreaterThan(16.6);
      if (free(15.8, z)) expect(walk(15.8, z, 1, 0, 6).x, `đông z ${z}`).toBeLessThan(17.4);
    }
  });
});
