import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from './collision/colliders';
import { LayeredGround, type Ground } from './collision/ground';
import { canStep } from './player/controller';
import { addBridges } from './scene/bridges';
import { addBuilding } from './scene/buildings';
import { addOutdoorSeats, onTerraces, terracePads } from './scene/daiDa';
import { dinhHeight } from './scene/kien_truc/dinh';
import { addFences } from './scene/lanCan';
import { loadScene } from './scene/loadSpec';
import { addBounds } from './scene/ranhDi';
import type { Seat } from './scene/seat';
import { buildHeightfield } from './scene/terrainHeight';
import { buildAreaMap } from './zones/areaMap';
import { seatInRange } from './zones/seats';

/**
 * Trúc Lâm — kiến trúc đợt 1 (V-66 B3): Vọng Trúc Đình trên đỉnh gò, cầu đá vòm trên quan đạo đông, Khúc Thuỷ Đài ở bãi
 * chân thác, Trúc Lư ở bãi tây nam. Dựng đúng như cảnh (nhà, cầu, đài, chỗ ngồi — không cần WebGL) rồi đi bộ thử
 * (R-VA-1, R-VA-2, R-NGOI-1).
 */
const spec = loadScene('rung-truc').spec;
const hf = buildHeightfield(spec.terrain, spec.paths);
const groundY = (x: number, z: number): number => {
  const h = hf.heightAt(x, z);
  return Number.isFinite(h) ? h : 0;
};
const scene = new THREE.Scene();
const colliders = new Colliders();
addBounds(colliders, spec.bounds);
const seats: Seat[] = [];
const pads = [...addBridges(scene, colliders, spec.bridges, spec.buildingStyle, groundY), ...terracePads(spec.terraces, groundY)];
for (const b of spec.buildings) {
  const extra = addBuilding(scene, colliders, b, spec.buildingStyle, groundY(b.x, b.z));
  seats.push(...extra.seats);
  pads.push(...extra.pads);
}
addFences(scene, colliders, spec, groundY);
seats.push(...addOutdoorSeats(scene, spec.seats, spec.buildingStyle.stone, onTerraces(spec.terraces, groundY)));
const ground: Ground = new LayeredGround(hf, pads);

/** Đi thẳng từ (x, z) theo (dx, dz) tối đa `dist` m, bước 5 cm: dốc chặn (R-VA-2), vật cản đẩy ra (R-VA-1). */
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

const dinh = spec.buildings.find((b) => b.id === 'vong-truc-dinh')!;
const lu = spec.buildings.find((b) => b.id === 'truc-lu')!;

describe('Trúc Lâm — kiến trúc đợt 1 (V-66 B3)', () => {
  it('R-VA-1: Vọng Trúc Đình — từ đầu bậc đá gò (−26; −30) đi vào giữa đình, đứng trên nền đá; đi tiếp về tây thì chân cột / ghế tựa chặn', () => {
    expect(dinh).toMatchObject({ kind: 'dinh', sides: 6, eaves: 2, benches: true });
    const p = walk(-26.5, -30, -1, 0, 4.5);
    expect(p.x).toBeCloseTo(-31, 1);
    expect(p.y).toBeCloseTo(8.3, 1); // gò +8 + nền đá 0,3
    // lối vào đông – tây (cạnh trước / sau): đi thẳng qua giữa đình ra phía tây
    const out = walk(-31, -30, -1, 0, 6);
    expect(out.x).toBeLessThan(-34);
    // đi về nam từ giữa đình → ghế tựa (cạnh tây nam / đông nam) chặn trong đình
    const south = walk(-31, -30, 0, 1, 5);
    expect(south.z).toBeLessThan(-27);
  });

  it('R-VA-1 (mốc): mái đình nhô trên ngọn trúc gần (≤ 20 m) — chỏm cao hơn ≥ 1,5 × chiều cao khóm trúc tính từ gốc khóm', () => {
    const apex = groundY(dinh.x, dinh.z) + dinhHeight(dinh, spec.buildingStyle.heightScale);
    expect(apex).toBeGreaterThan(17);
    for (const g of spec.trees.groves) {
      if (Math.hypot(g.x - dinh.x, g.z - dinh.z) > 20) continue;
      const canopy = 6.2 * (g.scale ?? 1);
      expect(apex - groundY(g.x, g.z), `khóm (${g.x}; ${g.z})`).toBeGreaterThanOrEqual(1.5 * canopy);
    }
  });

  it('R-NGOI-1: 4 ghế tựa trong đình — đứng cạnh ghế (≤ 1,2 m, cùng tầng) có chỗ ngồi; dưới chân gò thì không', () => {
    const inDinh = seats.filter((s) => Math.hypot(s.x - dinh.x, s.z - dinh.z) < 4);
    expect(inDinh).toHaveLength(4);
    for (const s of inDinh) {
      expect(s.y).toBeCloseTo(8 + 0.3 + 0.45, 2);
      expect(s.hold).toBe('lan-can');
    }
    const spots = seats.map((s) => ({ ...s, kind: 'ngoi' as const }));
    expect(seatInRange(spots, dinh.x, dinh.z + 1.6, 8.3)).toBeDefined();
    expect(seatInRange(spots, dinh.x, dinh.z + 1.6, 4)).toBeUndefined();
  });

  it('R-VA-1: cầu đá vòm (27; 4) — đi quan đạo đông qua cầu: lên giữa cầu cao ≈ 1 m rồi xuống bờ đông; lan can chặn hai bên', () => {
    expect(spec.bridges).toEqual([expect.objectContaining({ kind: 'vom', x: 27, z: 4, rotY: 90, width: 4.4 })]);
    const p = walk(18, 4, 1, 0, 16);
    expect(p.x).toBeGreaterThan(33);
    expect(p.maxY).toBeCloseTo(1, 1);
    expect(p.y).toBeCloseTo(0, 1);
    // trên cầu đi ngang về nam / bắc → lan can chặn (mép trong lan can z 4 ± 1,9)
    for (const dz of [1, -1]) {
      const side = walk(27, 4, 0, dz, 4);
      expect(Math.abs(side.z - 4)).toBeLessThanOrEqual(1.9 - 0.5 + 1e-3);
    }
  });

  it('R-VA-1: Khúc Thuỷ Đài — đài đá cao 0,4 bước lên được từ lối nhánh; 8 đệm cỏ quanh mương, ngồi được trên mặt đài', () => {
    const t = spec.terraces[0];
    expect(t).toMatchObject({ x: 21, z: -32.5, h: 0.4 });
    const p = walk(19, -26.5, 0, -1, 4);
    expect(p.z).toBeLessThan(-30);
    expect(p.y).toBeCloseTo(0.4, 2);
    const cushions = seats.filter((s) => Math.abs(s.x - t.x) < t.w / 2 && Math.abs(s.z - t.z) < t.d / 2);
    expect(cushions).toHaveLength(8);
    for (const s of cushions) expect(s.y).toBeCloseTo(0.4 + 0.14, 2);
    expect(spec.channels[0].cups).toBeGreaterThan(0);
  });

  it('R-VA-1: Trúc Lư — nhà tranh kín chặn người (không vào), sân đất trước nhà trống, rào trúc chừa lối vào phía đông', () => {
    expect(lu).toMatchObject({ kind: 'nha-tranh', closed: true, rotY: 90 });
    // từ lối nhánh (−25; 24,5) đi về tây qua khe rào, băng sân → dừng trước mặt nhà (nền x −32,45 + bán kính 0,5)
    const p = walk(-25, 24.5, -1, 0, 12);
    expect(p.x).toBeGreaterThan(-32.2);
    expect(p.x).toBeLessThan(-31.5);
    // ở z 21,5 (ngoài khe rào) đi về tây từ ngoài rào → rào đông chặn ở x ≈ −26,4
    const fence = walk(-24, 21.5, -1, 0, 6);
    expect(fence.x).toBeGreaterThan(-26.4);
  });

  it('R-BANDO-2: bản đồ lớn Trúc Lâm — 5 tên khu, chân 2 nhà, cầu đá, một dấu chỗ ngồi ở đình + một cho nhóm đệm cỏ; sân đất không là lối', () => {
    const m = buildAreaMap(spec, { seats });
    expect(m.labels.filter((l) => l.kind === 'khu').map((l) => l.text)).toEqual(['Vọng Trúc Đình', 'Khúc Thuỷ Đài', 'Cầu Đá', 'Trúc Lư', 'Bãi giữa']);
    expect(m.shapes.filter((s) => s.kind === 'nha').map((s) => (s.kind === 'nha' ? s.id : ''))).toEqual(['vong-truc-dinh', 'truc-lu']);
    expect(m.shapes.filter((s) => s.kind === 'cau')).toHaveLength(1);
    const ngoi = m.icons.filter((i) => i.kind === 'cho-ngoi');
    expect(ngoi).toHaveLength(2);
    expect(ngoi.find((i) => i.building === 'vong-truc-dinh')).toMatchObject({ x: -31, z: -30 });
    expect(m.shapes.filter((s) => s.kind === 'loi')).toHaveLength(spec.paths.length - 1);
  });

  it('R-HUD-4: tên khu mới chỉ tiếng Việt, không chữ Hán', () => {
    expect(spec.site.areas.map((a) => a.name)).toEqual(['Vọng Trúc Đình', 'Khúc Thuỷ Đài', 'Cầu Đá', 'Trúc Lư', 'Bãi giữa']);
    for (const a of spec.site.areas) expect(a.han ?? '').toBe('');
  });
});
