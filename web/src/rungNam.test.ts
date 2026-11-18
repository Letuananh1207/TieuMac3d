import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from './collision/colliders';
import { LayeredGround, type Ground } from './collision/ground';
import { canStep } from './player/controller';
import { addBridges } from './scene/bridges';
import { loadScene } from './scene/loadSpec';
import { addMotherMushroom } from './scene/namMe';
import { addBounds } from './scene/ranhDi';
import { motherStair, stairPoint } from './scene/rungNamSpec';
import { buildHeightfield } from './scene/terrainHeight';
import { addMushroomForest, stemRadius } from './scene/vat_rung_nam';

/**
 * Rừng Nấm Tiên (V-109, vùng `tu-cam-thanh`): dựng đúng như cảnh (nấm, nhà nấm, luống, cầu, Nấm Mẹ — không cần WebGL)
 * rồi đi bộ thử: lên thang xoắn quanh thân Nấm Mẹ tới mặt mũ có Lò Thuốc Tiên (R-VA-3), vật cản (R-VA-1).
 */
const spec = loadScene('tu-cam-thanh').spec;
const f = spec.mushroomForest;
const m = f.mother;
const hf = buildHeightfield(spec.terrain, spec.paths);
const groundY = (x: number, z: number): number => {
  const h = hf.heightAt(x, z);
  return Number.isFinite(h) ? h : 0;
};
const scene = new THREE.Scene();
const colliders = new Colliders();
addBounds(colliders, spec.bounds);
const bridgePads = addBridges(scene, colliders, spec.bridges, spec.buildingStyle, groundY);
addMushroomForest(scene, colliders, f, spec.look, groundY, spec.paths);
const base = groundY(m.x, m.z);
const mother = addMotherMushroom(scene, colliders, f, base);
const ground: Ground = new LayeredGround(hf, [...bridgePads, ...mother.pads]);
const st = motherStair(m);
const TOP = base + m.h;

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
  for (let s = 0; s < dist / 0.05; s++) if (!stepTo(p, p.x + (dx / k) * 0.05, p.z + (dz / k) * 0.05)) break;
  return p;
}

/** Đi dọc thang ở bán kính `r` từ góc `t0` tới `t1` (rad tính từ chân thang); trả về chỗ dừng + độ lệch xa nhất khỏi đường thang. */
function climb(p: Step, r: number, t0: number, t1: number): { p: Step; drift: number } {
  let drift = 0;
  const n = Math.ceil((Math.abs(t1 - t0) * r) / 0.05);
  for (let i = 1; i <= n; i++) {
    const [x, , z] = stairPoint(st, t0 + ((t1 - t0) * i) / n, r);
    stepTo(p, x, z);
    drift = Math.max(drift, Math.hypot(p.x - x, p.z - z));
  }
  return { p, drift };
}

const radius = (p: Step): number => Math.hypot(p.x - m.x, p.z - m.z);

describe('Rừng Nấm Tiên — Nấm Mẹ + Lò Thuốc Tiên (V-109)', () => {
  it('R-VA-3: Nấm Mẹ (0; 34) mũ cao 10 m, ∅ 25 m; thang gỗ rộng 1,6 m xoắn 1,25 vòng quanh thân, chân thang phía nam', () => {
    expect(m).toMatchObject({ enabled: true, x: 0, z: 34, h: 10, cap: 12.5, stem: 2.6, stairWidth: 1.6, turns: 1.25, stairAt: 335 });
    expect(base).toBeCloseTo(0, 5);
    // dốc thang ở lối đi giữa ≤ 35° (R-VA-2)
    expect(ground.slopeAt(...xz(stairPoint(st, 1, 3.3)), 1.3)).toBeLessThan(35);
  });

  it('R-VA-3: từ cuối lối bắc (−1; 42) đi thẳng bắc → bước lên chân thang (chân thang không lan can, bậc đầu thấp ≤ 0,6 m)', () => {
    const p = walk({ x: -1, z: 42, y: 0 }, 0, -1, 4.4);
    expect(p.y).toBeGreaterThan(0.05);
    expect(radius(p)).toBeLessThan(st.r1);
  });

  it('R-VA-3: đi dọc thang từ chân lên → không vướng (thân nấm, lan can, gầm thang không chặn người trên thang), lên tới mặt mũ cao 10 m', () => {
    const [x0, , z0] = stairPoint(st, 0.05, 3.3);
    const { p, drift } = climb({ x: x0, z: z0, y: 0 }, 3.3, 0.05, st.span - 0.1);
    expect(drift).toBeLessThan(0.06);
    expect(p.y).toBeCloseTo(TOP - st.rise * 0.1, 1);
    // bậc cuối bước ra ngoài (mở ra mặt mũ) → đứng trên mũ
    const a = st.a0 + st.span - 0.25;
    const out = walk({ ...p }, Math.sin(a), Math.cos(a), 3);
    expect(out.y).toBeCloseTo(TOP, 5);
    expect(radius(out)).toBeGreaterThan(st.r1 + 0.5);
  });

  it('R-VA-3: từ mặt mũ đi xuống theo thang → về mặt đất', () => {
    const [x, , z] = stairPoint(st, st.span - 0.05, 3.3);
    const { p } = climb({ x, z, y: TOP - 0.06 }, 3.3, st.span - 0.05, 0.02);
    expect(p.y).toBeLessThan(0.1);
  });

  it('R-VA-3: đứng trên mũ đi ra mép → rào vô hình chặn (không rơi), vẫn cao 10 m; đi vào giếng thang ngoài cung ra → rào dây chặn', () => {
    const start = { x: m.x + 7, z: m.z + 2, y: TOP };
    const edge = walk({ ...start }, 1, 0.3, 10);
    expect(edge.y).toBeCloseTo(TOP, 5);
    expect(radius(edge)).toBeLessThan(m.cap - 0.5);
    // giếng: từ phía tây (ngược phía cung ra ở đông nam) đi vào tâm
    const well = walk({ x: m.x - 7, z: m.z, y: TOP }, 1, 0, 6);
    expect(well.y).toBeCloseTo(TOP, 5);
    expect(radius(well)).toBeGreaterThan(st.r1);
  });

  it('R-VA-1: lò đỉnh trên mũ chặn người trên mũ; người dưới đất đi qua gầm mũ chỗ dưới lò không bị chặn', () => {
    const [ox, oz] = m.cauldron;
    const top = walk({ x: m.x + ox, z: m.z + oz + 5, y: TOP }, 0, -1, 5);
    expect(top.z - (m.z + oz)).toBeGreaterThan(2.5);
    const under = walk({ x: m.x + ox + 0.5, z: m.z + oz + 3, y: 0 }, 0, -1, 6);
    expect(under.z).toBeLessThan(m.z + oz - 2.5);
  });

  it('R-VA-1: dưới đất ngoài thang đi vào gầm thang thấp (mặt bậc 0,6–2,3 m) → lan can / chắn gầm giữ lại, vẫn ở mặt đất', () => {
    const t = 1.4 / st.rise;
    const a = st.a0 + t;
    const p = walk({ x: m.x + Math.sin(a) * 6, z: m.z + Math.cos(a) * 6, y: 0 }, -Math.sin(a), -Math.cos(a), 4);
    expect(p.y).toBeLessThan(0.1);
    expect(radius(p)).toBeGreaterThan(st.r1);
  });

  it('R-VA-1: nấm khổng lồ, nhà nấm, luống thảo dược chặn; cầu ván qua suối đi được', () => {
    const g = f.giants[0];
    const sr = stemRadius(g.h, g.cap);
    const p = walk({ x: g.x - sr - 3, z: g.z, y: groundY(g.x - sr - 3, g.z) }, 1, 0, 6);
    expect(p.x).toBeLessThan(g.x - sr);
    const h = f.houses[0];
    const q = walk({ x: h.x, z: h.z + 6, y: groundY(h.x, h.z + 6) }, 0, -1, 6);
    expect(q.z - h.z).toBeGreaterThan(2);
    const b = f.herbBeds[0];
    const r = walk({ x: b.x + b.r + 2, z: b.z, y: 0 }, -1, 0, 4);
    expect(r.x - b.x).toBeGreaterThan(b.r);
    // lối chính từ bãi hạc đi bắc qua cầu treo (0; 52) tới chân Nấm Mẹ
    const way = walk({ x: 0, z: 64, y: 0 }, 0, -1, 19);
    expect(way.z).toBeLessThan(46);
  });

  it('R-HANH-4 / R-HANH-2: giữ bãi hạc (0; 70), cổng "Chợ Đêm Đèn Hoa" (0; 81), "Đỉnh Hạc Bay" (−63; 54)', () => {
    expect(spec.stoneYard).toMatchObject({ enabled: true, center: [0, 70] });
    expect(spec.player.start).toEqual([-1.25, 70]);
    expect(spec.portals.map((p) => [p.label, (p.area.from[0] + p.area.to[0]) / 2, (p.area.from[1] + p.area.to[1]) / 2])).toEqual([
      ['Chợ Đêm Đèn Hoa', 0, 81],
      ['Đỉnh Hạc Bay', -63, 54],
    ]);
  });

  it('R-HUD-4: tên khu chỉ tiếng Việt, không chữ Hán', () => {
    expect(spec.site.areas.map((a) => a.name)).toEqual(['Lò Thuốc Tiên', 'Bãi Hạc', 'Vườn Thảo Dược', 'Xóm Nấm']);
    for (const a of spec.site.areas) expect(a.han ?? '').toBe('');
  });
});

function xz(p: [number, number, number]): [number, number] {
  return [p[0], p[2]];
}
