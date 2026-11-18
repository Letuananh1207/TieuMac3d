import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from './collision/colliders';
import { LayeredGround, type Ground } from './collision/ground';
import { canStep } from './player/controller';
import { addDinhHac } from './scene/dinhHac';
import { helixPoint, ledgeArc, peakStairs, type Helix } from './scene/dinhHacSpec';
import { loadScene } from './scene/loadSpec';
import { addBounds } from './scene/ranhDi';
import { buildHeightfield } from './scene/terrainHeight';

/**
 * Đỉnh Hạc Bay (V-111, vùng `truong-thanh`): dựng đúng như cảnh (cột đá, cầu treo, cây, cột chính — không cần WebGL) rồi đi
 * bộ thử: bậc đá xoắn lên gờ, qua cầu treo, bậc thứ hai lên thềm đỉnh có đình (R-VA-3), vật cản / rào mép (R-VA-1).
 */
const spec = loadScene('truong-thanh').spec;
const v = spec.pillarValley;
const p = v.peak;
const hf = buildHeightfield(spec.terrain, spec.paths);
const groundY = (x: number, z: number): number => {
  const h = hf.heightAt(x, z);
  return Number.isFinite(h) ? h : 0;
};
const scene = new THREE.Scene();
const colliders = new Colliders();
addBounds(colliders, spec.bounds);
const pads = addDinhHac(scene, colliders, spec, groundY);
const ground: Ground = new LayeredGround(hf, pads);
const { s1, ledge, s2 } = peakStairs(p, v.ledgeWidth);
const TOP = p.h;
const LEDGE = p.ledge;
const rm = (s1.r0 + s1.r1) / 2;

interface Step {
  x: number;
  z: number;
  y: number;
}

/** Một bước 5 cm tới (nx, nz) như `PlayerController`: dốc chặn (R-VA-2), vật cản đẩy ra (R-VA-1). */
function stepTo(q: Step, nx: number, nz: number): boolean {
  if (!canStep(ground, q.x, q.z, nx, nz, q.y)) return false;
  const at = { x: nx, z: nz };
  colliders.resolve(at, 0.5, q.y);
  q.x = at.x;
  q.z = at.z;
  q.y = ground.heightAt(at.x, at.z, q.y);
  return true;
}

/** Đi thẳng theo (dx, dz) tối đa `dist` m; trả về chỗ dừng + độ cao lớn nhất đã qua. */
function walk(q: Step, dx: number, dz: number, dist: number): Step & { maxY: number } {
  const k = Math.hypot(dx, dz);
  let maxY = q.y;
  for (let s = 0; s < dist / 0.05; s++) {
    if (!stepTo(q, q.x + (dx / k) * 0.05, q.z + (dz / k) * 0.05)) break;
    maxY = Math.max(maxY, q.y);
  }
  return { ...q, maxY };
}

/** Đi dọc vành xoắn `h` ở bán kính `r` từ `t0` tới `t1` (rad); trả về chỗ dừng + độ lệch xa nhất khỏi đường. */
function along(q: Step, h: Helix, r: number, t0: number, t1: number): { q: Step; drift: number } {
  let drift = 0;
  const n = Math.ceil((Math.abs(t1 - t0) * r) / 0.05);
  for (let i = 1; i <= n; i++) {
    const [x, , z] = helixPoint(h, t0 + ((t1 - t0) * i) / n, r);
    stepTo(q, x, z);
    drift = Math.max(drift, Math.hypot(q.x - x, q.z - z));
  }
  return { q, drift };
}

const radius = (q: Step): number => Math.hypot(q.x - p.x, q.z - p.z);
/** Góc (rad từ đầu vành `h`) của hướng (x, z) quanh tâm cột. */
const tOf = (h: Helix, x: number, z: number): number => ((((Math.atan2(x - p.x, z - p.z) - h.a0) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2));
/** Đứng ở cuối bậc 1 (trên gờ). */
function onLedge(): Step {
  const [x, y, z] = helixPoint(s1, 0.05, rm);
  return along({ x, z, y }, s1, rm, 0.05, s1.span - 0.02).q;
}

describe('Đỉnh Hạc Bay — cột chính, gờ, cầu treo (V-111)', () => {
  it('R-VA-3: cột chính (0; −4) cao 40 m, ∅ 15 m; gờ 10,5 m; bậc rộng 1,6 m dốc 32°; chân bậc phía nam lệch tây; mặt đất chân cột y = 0', () => {
    expect(p).toMatchObject({ enabled: true, x: 0, z: -4, h: 40, r: 7.5, ledge: 10.5, stairWidth: 1.6, stairSlope: 32, stairAt: 330 });
    expect(groundY(p.x, p.z)).toBeCloseTo(0, 5);
    expect(ground.slopeAt(...xz(helixPoint(s1, 1, rm)), 4)).toBeLessThan(35);
    expect(ground.slopeAt(...xz(helixPoint(s2, 1, s2.r0 + 0.05)), LEDGE + 4)).toBeLessThan(35);
  });

  it('R-VA-3: từ cuối lối (−3,9; 6) đi thẳng bắc → bước lên chân bậc (chân bậc không lan can)', () => {
    const q = walk({ x: -3.9, z: 6, y: 0 }, 0, -1, 3);
    expect(q.maxY).toBeGreaterThan(0.2);
  });

  it('R-VA-3: đi dọc bậc 1 từ chân lên → không vướng, tới gờ cao 10,5 m; đi tiếp ra gờ', () => {
    const [x, y, z] = helixPoint(s1, 0.05, rm);
    const { q, drift } = along({ x, z, y }, s1, rm, 0.05, s1.span - 0.02);
    expect(drift).toBeLessThan(0.06);
    expect(q.y).toBeCloseTo(LEDGE - s1.rise * 0.02, 1);
    const g = along(q, ledge, ledge.r1 - 0.8, 0.05, 1.2).q;
    expect(g.y).toBeCloseTo(LEDGE, 5);
  });

  it('R-VA-1: trên gờ đi ra mép ngoài → rào vô hình chặn (không rơi), vẫn cao 10,5 m; đi lùi về đầu gờ phía ngoài bậc → chặn', () => {
    const q = onLedge();
    const north = along(q, ledge, ledge.r1 - 0.8, 0.05, Math.PI / 2).q; // phía bắc cột
    const out = walk({ ...north }, north.x - p.x, north.z - p.z, 5);
    expect(out.y).toBeCloseTo(LEDGE, 5);
    expect(radius(out)).toBeLessThan(ledge.r1);
    const at = along(onLedge(), ledge, ledge.r1 - 1, 0.05, 0.3).q;
    const a = ledge.a0 + 0.3;
    const back = walk(at, -Math.cos(a), Math.sin(a), 4);
    expect(back.y).toBeCloseTo(LEDGE, 5);
  });

  it('R-VA-1: từ gờ qua cầu treo đông (z = −9) sang gờ cột đông (24; −9); đi tiếp vào thân cột → thân chặn, vẫn trên gờ', () => {
    const q = along(onLedge(), ledge, 9.0, 0.05, tOf(ledge, 7.6, -9));
    expect(q.q.y).toBeCloseTo(LEDGE, 5);
    const go = walk({ ...q.q }, 1, 0, 14);
    expect(go.y).toBeCloseTo(LEDGE, 5);
    expect(go.x).toBeGreaterThan(17.5);
    expect(go.x).toBeLessThan(24 - 4.5);
    // trên cầu đi ngang ra mép → lan can chặn
    const side = walk({ x: 13, z: -9, y: LEDGE }, 0, 1, 3);
    expect(side.y).toBeCloseTo(LEDGE, 5);
    expect(side.z).toBeLessThan(-9 + v.bridgeWidth / 2);
  });

  it('R-VA-1: cầu treo tây sang gờ cột (−24; −5), rồi cầu bắc sang đỉnh cột (−24; −28) cao 10,5 m', () => {
    const q = along(onLedge(), ledge, 9.3, 0.05, tOf(ledge, -9.25, -5)).q;
    const west = walk({ ...q, z: -5 }, -1, 0, 12);
    expect(west.y).toBeCloseTo(LEDGE, 5);
    expect(west.x).toBeLessThan(-17.5);
    const arc = ledgeArc(v, v.pillars[1]);
    expect(arc).not.toBeNull();
    const north = walk({ x: -24, z: -10.6, y: LEDGE }, 0, -1, 16);
    expect(north.y).toBeCloseTo(LEDGE, 5);
    expect(north.z).toBeLessThan(-23);
    // đỉnh cột (−24; −28): đi ra mép → rào chặn
    const edge = walk({ ...north }, 0, -1, 8);
    expect(edge.y).toBeCloseTo(LEDGE, 5);
    expect(edge.z).toBeGreaterThan(-28 - 5);
  });

  it('R-VA-3: từ cuối gờ lên bậc 2 tới thềm đỉnh cao 40 m; bước vào trong thềm', () => {
    const start = along(onLedge(), ledge, rm, 0.05, ledge.span - 0.02).q;
    expect(start.y).toBeCloseTo(LEDGE, 5);
    const { q, drift } = along(start, s2, rm, 0.02, s2.span - 0.05);
    expect(drift).toBeLessThan(0.06);
    expect(q.y).toBeCloseTo(TOP - s2.rise * 0.05, 1);
    const a = s2.a0 + s2.span - 0.2;
    const top = walk({ ...q }, -Math.sin(a), -Math.cos(a), 3);
    expect(top.y).toBeCloseTo(TOP, 5);
    expect(radius(top)).toBeLessThan(p.r - 0.5);
  });

  it('R-VA-1: trên thềm đỉnh đi ra mép → rào chặn (không rơi); vào đình qua lối nam → lên nền đình; lan can đình chặn', () => {
    const edge = walk({ x: p.x + 4, z: p.z - 2, y: TOP }, 1, -0.2, 8);
    expect(edge.y).toBeCloseTo(TOP, 5);
    expect(radius(edge)).toBeLessThan(p.r);
    const [px, pz] = p.pavilion.at;
    const inside = walk({ x: p.x + px, z: p.z + pz + 3.6, y: TOP }, 0, -1, 3.6);
    expect(inside.y).toBeCloseTo(TOP + 0.45, 5);
    expect(inside.z).toBeLessThan(p.z + pz + 0.5);
    const rail = walk({ x: p.x + px, z: p.z + pz, y: TOP + 0.45 }, 1, 0, 5);
    expect(rail.x - (p.x + px)).toBeLessThan(p.pavilion.r);
  });

  it('R-VA-3: từ thềm đi xuống bậc 2, gờ, bậc 1 → về mặt đất', () => {
    const [x, , z] = helixPoint(s2, s2.span - 0.05, rm);
    const down = along({ x, z, y: TOP - 0.2 }, s2, rm, s2.span - 0.05, 0.02).q;
    expect(down.y).toBeCloseTo(LEDGE + s2.rise * 0.02, 1);
    const back = along(down, ledge, rm, ledge.span - 0.02, 0.02).q;
    const foot = along(back, s1, rm, s1.span - 0.05, 0.02).q;
    expect(foot.y).toBeLessThan(0.15);
  });

  it('R-VA-1: dưới đất đi vào gầm bậc thấp / thân cột → chặn, vẫn ở mặt đất; đi dưới cầu treo không bị cầu nâng lên', () => {
    const t = 1.4 / s1.rise;
    const a = s1.a0 + t;
    const low = walk({ x: p.x + Math.sin(a) * 10, z: p.z + Math.cos(a) * 10, y: 0 }, -Math.sin(a), -Math.cos(a), 6);
    expect(low.y).toBeLessThan(0.1);
    expect(radius(low)).toBeGreaterThan(s1.r1);
    const body = walk({ x: 0, z: 12, y: 0 }, 0, -1, 16);
    expect(body.y).toBeLessThan(0.1);
    expect(radius(body)).toBeGreaterThan(p.r * 0.9);
    const under = walk({ x: 10, z: -9, y: 0 }, 1, 0, 6);
    expect(under.x).toBeGreaterThan(15.5);
    expect(under.y).toBeLessThan(0.5);
  });

  it('R-VA-1: tùng lá kim, cột đá phụ chặn người dưới đất', () => {
    const c = v.pillars[3];
    const q = walk({ x: c.x, z: c.z + c.r + 4, y: groundY(c.x, c.z + c.r + 4) }, 0, -1, 8);
    expect(q.z - c.z).toBeGreaterThan(c.r * 0.9);
  });

  it('R-HANH-4 / R-HANH-2: giữ bãi hạc (0; 39), chỗ xuất phát (−1,25; 39), 3 cổng', () => {
    expect(spec.stoneYard).toMatchObject({ enabled: true, center: [0, 39] });
    expect(spec.player.start).toEqual([-1.25, 39]);
    expect(spec.portals.map((q) => [q.label, (q.area.from[0] + q.area.to[0]) / 2, (q.area.from[1] + q.area.to[1]) / 2])).toEqual([
      ['Thung Trúc Gió Hát', 0, 49],
      ['Thành Cát Ngủ Quên', -43.2, -3],
      ['Rừng Nấm Tiên', 43.2, -3],
    ]);
  });

  it('R-HUD-4: tên khu chỉ tiếng Việt, không chữ Hán', () => {
    expect(spec.site.areas.map((a) => a.name)).toEqual(['Bãi Hạc', 'Cột Đình Hạc', 'Cầu Treo']);
    for (const a of spec.site.areas) expect(a.han ?? '').toBe('');
  });
});

function xz(q: [number, number, number]): [number, number] {
  return [q[0], q[2]];
}
