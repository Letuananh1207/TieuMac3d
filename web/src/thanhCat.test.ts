import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from './collision/colliders';
import { LayeredGround, type Ground } from './collision/ground';
import { canStep } from './player/controller';
import { loadScene } from './scene/loadSpec';
import { buildHeightfield } from './scene/terrainHeight';
import { PARAPET_T, towerZ, wallChunks } from './scene/thanhCatSpec';
import { seededRandom } from './scene/random';
import { addSandCity } from './scene/vat_thanh_cat';
import { addWater } from './scene/water';

/**
 * Thành Cát Ngủ Quên (V-112, vùng `to-lua`): dựng đúng như cảnh (địa hình đụn cát, cổng thành, lạc đà, tường đổ, ao ốc
 * đảo, lều — không cần WebGL) rồi đi bộ thử: qua vòm cổng, lên mặt thành bằng dốc cát (R-VA-3), vật cản (R-VA-1).
 */
const spec = loadScene('to-lua').spec;
const s = spec.sandCity;
const G = s.gate;
const hf = buildHeightfield(spec.terrain, spec.paths);
const groundY = (x: number, z: number): number => {
  const h = hf.heightAt(x, z);
  return Number.isFinite(h) ? h : 0;
};
const scene = new THREE.Scene();
const colliders = new Colliders();
addWater(scene, colliders, spec.water, spec.buildingStyle, groundY);
const pads = addSandCity(scene, colliders, s, groundY);
const ground: Ground = new LayeredGround(hf, pads);
const base = groundY(G.x, G.z);
const TOP = base + G.h;

interface Step {
  x: number;
  z: number;
  y: number;
}

/** Một bước 5 cm tới (nx, nz) như `PlayerController`: dốc chặn (R-VA-2), vật cản đẩy ra (R-VA-1). */
function stepTo(p: Step, nx: number, nz: number): boolean {
  if (!canStep(ground, p.x, p.z, nx, nz, p.y)) return false;
  const q = { x: nx, z: nz };
  colliders.resolve(q, 0.5, p.y);
  p.x = q.x;
  p.z = q.z;
  p.y = ground.heightAt(q.x, q.z, p.y);
  return true;
}

/** Đi thẳng từ `p` theo (dx, dz) tối đa `dist` m. */
function walk(p: Step, dx: number, dz: number, dist: number): Step {
  const k = Math.hypot(dx, dz);
  for (let i = 0; i < dist / 0.05; i++) if (!stepTo(p, p.x + (dx / k) * 0.05, p.z + (dz / k) * 0.05)) break;
  return p;
}

const at = (x: number, z: number): Step => ({ x, z, y: ground.heightAt(x, z) });

describe('Thành Cát Ngủ Quên — Cổng Thành Vùi Cát (V-112)', () => {
  it('R-VA-1: cổng (0; 0) rộng 20, dày 11, mặt thành cao 8 m; vòm rộng 3,6 cao 3,8 — nền lối vòm là mặt cát phẳng', () => {
    expect(G).toMatchObject({ enabled: true, x: 0, z: 0, w: 20, d: 11, h: 8, arch: [3.6, 3.8], climb: 'tay' });
    expect(base).toBeCloseTo(0, 5);
  });

  it('R-VA-1: từ cuối lối đá cổ (0; 30) đi thẳng bắc → xuyên qua vòm cổng ra phía bắc, vẫn đi dưới đất', () => {
    const p = walk(at(0, 30), 0, -1, 40);
    expect(p.z).toBeLessThan(G.z - G.d / 2 - 2);
    expect(p.y).toBeLessThan(0.6);
  });

  it('R-VA-1: đi bắc ngoài vòm (x = 5) → thân cổng chặn ở mặt nam', () => {
    const p = walk(at(5, 12), 0, -1, 12);
    expect(p.z).toBeGreaterThan(G.z + G.d / 2);
  });

  it('R-VA-3: theo sống đụn cát phía tây (x = −10,6) đi bắc lên tới mép cổng, bước sang đông → đứng trên mặt thành cao 8 m', () => {
    const p = walk(at(-10.6, 26), 0, -1, 26);
    expect(p.z).toBeLessThan(1);
    expect(p.y).toBeGreaterThan(TOP - 0.6);
    const top = walk(p, 1, 0, 3);
    expect(top.y).toBeCloseTo(TOP, 5);
    expect(top.x).toBeGreaterThan(G.x - G.w / 2 + 1);
  });

  it('R-VA-3: trên mặt thành → răng cưa nam chặn (không rơi xuống), lầu cổng chặn; đi dọc lối trước lầu sang tới mép đông', () => {
    const south = walk({ x: -6, z: 0, y: TOP }, 0, 1, 8);
    expect(south.y).toBeCloseTo(TOP, 5);
    expect(south.z).toBeLessThan(G.z + G.d / 2 - PARAPET_T);
    const tower = walk({ x: -8, z: towerZ(G), y: TOP }, 1, 0, 6);
    expect(tower.x).toBeLessThan(G.x - G.tower.w / 2);
    const front = walk({ x: -8, z: G.z + G.d / 2 - 1.4, y: TOP }, 1, 0, 20);
    expect(front.y).toBeCloseTo(TOP, 5);
    expect(front.x).toBeGreaterThan(G.x + G.w / 2 - 1.5);
    expect(front.x).toBeLessThan(G.x + G.w / 2 - PARAPET_T);
  });

  it('R-VA-3: từ mặt thành đi ra phía tây → xuống lại theo dốc cát', () => {
    const p = walk({ x: -8, z: 0, y: TOP }, -1, 0.6, 16);
    expect(p.x).toBeLessThan(-18);
    expect(p.y).toBeLessThan(TOP - 3);
  });

  it('R-VA-1: đầu lạc đà đá (cổ) chặn người đi', () => {
    const C = s.camel;
    const k = C.h / 6.6;
    const a = (C.rotY * Math.PI) / 180;
    const [cx, cz] = [C.x - Math.sin(a) * 0.4 * k, C.z - Math.cos(a) * 0.4 * k];
    const p = walk(at(cx, cz + 7), 0, -1, 7);
    expect(Math.hypot(p.x - cx, p.z - cz)).toBeGreaterThan(1.9 * k);
  });

  it('R-VA-1: đoạn tường thành đổ chặn; khe sập giữa hai đoạn đi qua được', () => {
    const w = s.walls[0];
    const chunks = wallChunks(w, seededRandom(s.seed + 21));
    const c = chunks[1];
    const z = w.from[1];
    const blocked = walk(at(c.x, z + 7), 0, -1, 8);
    expect(blocked.z).toBeGreaterThan(z + 1);
    const gap = (chunks[1].x + chunks[1].len / 2 + chunks[2].x - chunks[2].len / 2) / 2;
    const through = walk(at(gap, z + 7), 0, -1, 12);
    expect(through.z).toBeLessThan(z - 2);
  });

  it('R-VA-1: ao ốc đảo (−25; 31) và lều vải chặn', () => {
    const pond = walk(at(-25, 40), 0, -1, 8);
    expect(pond.z).toBeGreaterThan(31 + 4.6);
    const t = s.tents[0];
    const tent = walk(at(t.x + 4, t.z), -1, 0, 4);
    expect(tent.x).toBeGreaterThan(t.x + 1.2);
  });

  it('R-HANH-4: từ bãi hạc theo lối đất đi tới cổng "Đỉnh Hạc Bay" (46,6; 19,5) — giữ bãi hạc (0; 56) và cổng cũ', () => {
    expect(spec.stoneYard).toMatchObject({ enabled: true, center: [0, 56] });
    expect(spec.player.start).toEqual([-1.25, 56]);
    expect(spec.portals.map((p) => p.label)).toEqual(['Đỉnh Hạc Bay']);
    const [a] = spec.portals;
    expect((a.area.from[0] + a.area.to[0]) / 2).toBeCloseTo(46.6, 5);
    expect((a.area.from[1] + a.area.to[1]) / 2).toBeCloseTo(19.5, 5);
    const p = walk(at(4, 53), 45 - 4, 19.8 - 53, Math.hypot(45 - 4, 19.8 - 53));
    expect(Math.hypot(p.x - 45, p.z - 19.8)).toBeLessThan(1);
    const end = walk(p, 1, 0, 1.5);
    expect(end.x).toBeGreaterThan(45.4);
  });

  it('R-NGAY-1: cảnh luôn chiều muộn 16:30 (giờ cố định), không theo đồng hồ', () => {
    expect(spec.dayNight).toMatchObject({ enabled: true, gioCoDinh: 16.5 });
  });

  it('R-HUD-4: tên khu chỉ tiếng Việt, không chữ Hán', () => {
    expect(spec.site.areas.map((a) => a.name)).toEqual(['Cổng Thành Vùi Cát', 'Bãi Hạc', 'Lối Đá Cổ', 'Ốc Đảo']);
    for (const a of spec.site.areas) expect(a.han ?? '').toBe('');
  });
});
