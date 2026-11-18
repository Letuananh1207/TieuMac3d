import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from './collision/colliders';
import { canStep } from './player/controller';
import { clearanceAt } from './scene/routeCheck';

/**
 * Chợ Đêm Đèn Hoa (V-108, cảnh `giang-nam`): cảnh thật đủ lớp (sông, ao, cầu, nhà, sạp, Cây Đèn Trăm Tầng — R-VA-1, R-VA-2,
 * R-VA-3). Từ bãi hạc đi bộ tới được ba cổng đi bộ (R-HANH-4) và lên đài cây đèn; đứng trên đài cao hơn sân.
 */
// canvas 2D giả (biển, vôi, ngói vẽ bằng canvas): mọi lệnh vẽ trả lại chính nó
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : key === 'getImageData' ? () => ({ data: new Uint8ClampedArray(4) }) : () => ctx) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx }) });
vi.stubGlobal('window', { devicePixelRatio: 1, innerWidth: 390, innerHeight: 844, addEventListener: () => {} });

const { loadScene } = await import('./scene/loadSpec');
const { buildWorld } = await import('./scene/world');
const { portalRect } = await import('./scene/portals');
const { buildAreaMap } = await import('./zones/areaMap');

const spec = loadScene('giang-nam').spec;
const colliders = new Colliders();
const world = buildWorld(new THREE.Scene(), colliders, spec);

const STEP = 0.5;
const key = (i: number, j: number): string => `${i},${j}`;
/** Ô lưới 0,5 m tới được từ (x0, z0): đứng được (cách vật cản > 0,45 m) và bước được sang (dốc / bậc — `canStep`). */
function reach(x0: number, z0: number): Set<string> {
  const seen = new Set<string>([key(Math.round(x0 / STEP), Math.round(z0 / STEP))]);
  const queue: [number, number][] = [[Math.round(x0 / STEP), Math.round(z0 / STEP)]];
  while (queue.length) {
    const [i, j] = queue.pop()!;
    for (const [di, dj] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const ni = i + di;
      const nj = j + dj;
      const k = key(ni, nj);
      if (seen.has(k) || Math.abs(ni * STEP) > 34 || Math.abs(nj * STEP) > 46) continue;
      if (clearanceAt(colliders, ni * STEP, nj * STEP) <= 0.45) continue;
      if (!canStep(world.surface, i * STEP, j * STEP, ni * STEP, nj * STEP)) continue;
      seen.add(k);
      queue.push([ni, nj]);
    }
  }
  return seen;
}

describe('Chợ Đêm Đèn Hoa — đi được (V-108)', () => {
  const start = spec.player.start;
  const ok = reach(start[0], start[1]);
  const at = (x: number, z: number): boolean => ok.has(key(Math.round(x / STEP), Math.round(z / STEP)));

  it('R-HANH-9: từ bãi hạc đi bộ tới tâm vùng cả ba cổng (Trúc Lâm tây, Tử Cấm Thành qua cầu vòm, Bồng Lai bến đông)', () => {
    expect(spec.portals).toHaveLength(3);
    for (const p of spec.portals) {
      const r = portalRect(p);
      expect(at((r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2), p.scene).toBe(true);
    }
  });

  it('R-HANH-9: lên được đài Cây Đèn (bậc ≤ 0,6 m), mặt đài cao hơn sân; chân trục là vật cản', () => {
    const t = spec.lanternTrees[0];
    expect(at(t.x + 3, t.z)).toBe(true);
    expect(world.surface.heightAt(t.x + 3, t.z)).toBeGreaterThan(world.surface.heightAt(t.x, t.z + t.baseRadius + 3) + 0.4);
    expect(clearanceAt(colliders, t.x, t.z)).toBeLessThanOrEqual(0);
  });

  it('R-HANH-9: sông, ao không lội xuống được (R-VA-1)', () => {
    expect(at(-6, -8)).toBe(false);
    expect(at(-16, 6)).toBe(false);
    expect(at(16, 6)).toBe(false);
  });
});

describe('Chợ Đêm Đèn Hoa — bản đồ lớn (V-108)', () => {
  it('R-BANDO-2: Yên Vũ Lâu — 4 tên khu, chân 11 nhà phố, đủ 3 dấu cổng; sạp và đài cây đèn không vẽ', () => {
    const m = buildAreaMap(spec, { sceneNames: {} });
    expect(m.labels.filter((l) => l.kind === 'khu').map((l) => l.text)).toEqual(['Sân Cây Đèn', 'Bờ bắc', 'Bến sông', 'Phố chợ']);
    expect(m.shapes.filter((s) => s.kind === 'nha')).toHaveLength(11);
    expect(m.icons.filter((i) => i.kind === 'cong-canh')).toHaveLength(3);
    expect(m.icons.some((i) => i.kind === 'vong-tran')).toBe(false);
  });

  it('R-HANH-9: luôn đêm hội — giờ cố định 21:00, không chữ Hán trên nhà (biển nhà tắt)', () => {
    expect(spec.dayNight.enabled).toBe(true);
    expect(spec.dayNight.gioCoDinh).toBe(21);
    expect(spec.buildings.every((b) => b.plaque === false)).toBe(true);
    expect(spec.lanternTrees).toHaveLength(1);
  });
});
