import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from './collision/colliders';
import { canStep } from './player/controller';
import { clearanceAt } from './scene/routeCheck';

/**
 * Cung Ngọc Đáy Biển (V-110, cảnh `bong-lai`): cảnh thật đủ lớp (Cung Vỏ Sò trên nền san hô hai bậc, hang đá, vỏ trai,
 * cột cửa lặn — R-HANH-10, R-VA-1, R-VA-3). Từ bãi hạc đi bộ tới cổng "Chợ Đêm Đèn Hoa" và lên nền cung tới trước cửa.
 */
// canvas 2D giả (biển, vôi, ngói vẽ bằng canvas): mọi lệnh vẽ trả lại chính nó
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : key === 'getImageData' ? () => ({ data: new Uint8ClampedArray(4) }) : () => ctx) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx }) });
vi.stubGlobal('window', { devicePixelRatio: 1, innerWidth: 390, innerHeight: 844, addEventListener: () => {} });

const { loadScene } = await import('./scene/loadSpec');
const { buildWorld } = await import('./scene/world');
const { portalRect } = await import('./scene/portals');
const { buildAreaMap } = await import('./zones/areaMap');
const { palaceToWorld, DEFAULT_SEA_FLOOR } = await import('./scene/cungNgocSpec');
const { DEFAULT_SCENE } = await import('./scene/spec');
const { addSeaFloor } = await import('./scene/vat_cung_ngoc');

const spec = loadScene('bong-lai').spec;
const sea = spec.seaFloor;
const p = sea.palace;
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
      if (seen.has(k) || Math.abs(ni * STEP) > 40 || Math.abs(nj * STEP - 18) > 40) continue;
      if (clearanceAt(colliders, ni * STEP, nj * STEP) <= 0.45) continue;
      if (!canStep(world.surface, i * STEP, j * STEP, ni * STEP, nj * STEP)) continue;
      seen.add(k);
      queue.push([ni, nj]);
    }
  }
  return seen;
}

describe('Cung Ngọc Đáy Biển — đi được (V-110)', () => {
  const start = spec.player.start;
  const ok = reach(start[0], start[1]);
  const at = (x: number, z: number): boolean => ok.has(key(Math.round(x / STEP), Math.round(z / STEP)));

  it('R-HANH-10: giữ bãi hạc (0; 39), chỗ xuất phát (−1,25; 39) và cổng "Chợ Đêm Đèn Hoa" (−9; 42,2); đi bộ tới tâm vùng cổng', () => {
    expect(spec.stoneYard).toMatchObject({ enabled: true, center: [0, 39] });
    expect(start).toEqual([-1.25, 39]);
    expect(spec.portals).toHaveLength(1);
    const r = portalRect(spec.portals[0]);
    expect(spec.portals[0].label).toBe('Chợ Đêm Đèn Hoa');
    expect([(r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2]).toEqual([-9, 42.2]);
    expect(at(-9, 42.2)).toBe(true);
    // chỗ đứng khi từ Chợ Đêm tới không vướng cột san hô
    expect(clearanceAt(colliders, ...spec.portals[0].arrive.at)).toBeGreaterThan(0.5);
  });

  it('R-HANH-10: Cung Vỏ Sò (4; 4) trên nền san hô hai bậc (mỗi bậc 0,5 m) — bước lên được tới trước cửa, mặt nền cao 1 m', () => {
    expect(p).toMatchObject({ enabled: true, x: 4, z: 4, plinthR: 10, plinthH: 1 });
    const [sx, sz] = palaceToWorld(p, 0, p.plinthR + 2); // trước bậc tím, ngoài nền
    const [tx, tz] = palaceToWorld(p, 0, p.plinthR - 2.5); // trên nền, trước cửa
    expect(at(sx, sz)).toBe(true);
    expect(at(tx, tz)).toBe(true);
    expect(world.surface.heightAt(tx, tz)).toBeCloseTo(1, 5);
    expect(world.surface.heightAt(...palaceToWorld(p, 0, p.plinthR - 0.4))).toBeCloseTo(0.5, 5);
    // đi vòng sang hông nền cũng lên được (nền bậc quanh)
    expect(at(...palaceToWorld(p, p.plinthR - 1.5, 4))).toBe(true);
  });

  it('R-HANH-10: cửa vòm chỉ để nhìn — thân ốc, môi cửa, cột, đèn ngọc chặn; không vào trong ốc', () => {
    expect(at(...palaceToWorld(p, 0, 4))).toBe(false); // lòng cửa
    expect(at(...palaceToWorld(p, p.shellAt[0], p.shellAt[1]))).toBe(false); // tâm thân ốc
    expect(clearanceAt(colliders, ...palaceToWorld(p, 0, 5))).toBeLessThanOrEqual(0.45);
  });

  it('R-VA-1: hang đá, vỏ trai, cột cửa lặn chặn; bãi cát, lối cát san hô, san hô, rong đi qua được', () => {
    for (const c of sea.caves) expect(at(c.x, c.z)).toBe(false);
    for (const c of sea.clams) expect(at(c.x, c.z)).toBe(false);
    for (const c of sea.pillars) expect(at(c.x, c.z)).toBe(false);
    expect(sea.caves.length).toBeGreaterThanOrEqual(4);
    expect(at(11, 24)).toBe(true); // giữa bãi cát đông
    expect(at(-4, 28)).toBe(true); // trên lối cát
  });

  it('R-HANH-10: ranh đi được — không ra ngoài vùng sương', () => {
    expect(at(0, 52)).toBe(false);
    expect(at(-34, 20)).toBe(false);
  });
});

describe('Cung Ngọc Đáy Biển — cảnh (V-110)', () => {
  it('R-NGAY-1: đáy biển luôn sáng — giờ cố định 11:00; không đàn chim, không đảo nổi, không núi xa', () => {
    expect(spec.dayNight.enabled).toBe(true);
    expect(spec.dayNight.gioCoDinh).toBe(11);
    expect(spec.flocks).toEqual([]);
    expect(spec.floating.islands).toEqual([]);
    expect(spec.farMountains.layers).toEqual([]);
  });

  it('R-BANDO-2: bản đồ lớn — 4 tên khu, dấu cổng "Chợ Đêm Đèn Hoa", không vòng trận', () => {
    const m = buildAreaMap(spec, { sceneNames: {} });
    expect(m.labels.filter((l) => l.kind === 'khu').map((l) => l.text)).toEqual(['Cung Vỏ Sò', 'Bãi Hạc', 'Sân Cát Trắng', 'Hang Cá']);
    expect(m.icons.filter((i) => i.kind === 'cong-canh')).toHaveLength(1);
    expect(m.icons.some((i) => i.kind === 'vong-tran')).toBe(false);
  });

  it('đặc tả mặc định không có đáy biển — cảnh cũ không thêm vật nào', () => {
    expect(DEFAULT_SCENE.seaFloor).toBe(DEFAULT_SEA_FLOOR);
    const scene = new THREE.Scene();
    const c = new Colliders();
    const out = addSeaFloor(scene, c, DEFAULT_SCENE, () => 0);
    expect(scene.children).toHaveLength(0);
    expect(out.pads).toEqual([]);
    expect(c.circles).toHaveLength(0);
  });
});
