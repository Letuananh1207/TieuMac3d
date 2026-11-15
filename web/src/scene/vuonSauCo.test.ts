import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from '../collision/colliders';
import { BOUNCE_S, bounceScale, FLY_S, flyPath } from './cayTrong';
import { DEFAULT_SCENE } from './spec';
import { resolveSceneSpec } from './specCheck';
import { hatAt, HatPool, HAT_KINDS, makeHats } from './vuonHat';
import { addGarden, soilTint } from './vuonLuong';
import { bugSpot, PestLayer, POP_LEN, popPath, weedOffsets } from './vuonSauCo';
import { seededRandom } from './random';

const NHA = resolveSceneSpec(JSON.parse(readFileSync(new URL('../../../design/scene/nha-ta.json', import.meta.url), 'utf8')));
const g = NHA.spec.garden;
const spot = { x: 6.1, y: 0.2, z: -10.8, size: 1.6 };
const step = (f: (dt: number) => void, s: number): void => {
  for (let t = 0; t < s - 1e-9; t += 1 / 60) f(1 / 60);
};

describe('R-VUON-10/11: sâu + cỏ trên luống', () => {
  it('R-VUON-10: sâu bò vòng nhỏ trên lá, trong luống, cao hơn mặt luống', () => {
    for (const t of [0, 2, 5.5]) {
      const b = bugSpot(spot, 0, t);
      expect(Math.abs(b.x - spot.x)).toBeLessThan(spot.size / 2);
      expect(Math.abs(b.z - spot.z)).toBeLessThan(spot.size / 2);
      expect(b.y).toBeGreaterThan(spot.y + 0.1);
    }
    expect(bugSpot(spot, 0, 1)).not.toEqual(bugSpot(spot, 0, 2));
  });

  it('R-VUON-11: 2–3 bụi cỏ giữa luống, trong mép luống', () => {
    expect(weedOffsets(2, 1.6)).toHaveLength(2);
    expect(weedOffsets(3, 1.6)).toHaveLength(3);
    expect(weedOffsets(0, 1.6)).toHaveLength(0);
    for (const [dx, dz] of weedOffsets(3, 1.6)) expect(Math.max(Math.abs(dx), Math.abs(dz))).toBeLessThan(0.8);
  });

  it('R-VUON-10/11: số instance theo danh sách; không có gì → ẩn (0 draw call)', () => {
    const spots = g.plots.map((p) => ({ x: p.x, y: 0.2, z: p.z, size: g.size }));
    const layer = new PestLayer(new THREE.Scene(), spots, g.fx, NHA.spec.look);
    layer.show(spots.map(() => null));
    expect(layer.counts).toEqual({ bugs: 0, weeds: 0 });
    expect(layer.bugs.visible || layer.weeds.visible).toBe(false);
    layer.show(spots.map((_, i) => (i === 0 ? { bug: true, weeds: 3 } : i === 1 ? { bug: false, weeds: 2 } : i === 2 ? { bug: true, weeds: 0 } : null)));
    expect(layer.counts).toEqual({ bugs: 2, weeds: 5 });
    expect(layer.bugs.visible && layer.weeds.visible).toBe(true);
  });

  it('R-VUON-13: bắt sâu → sâu bay đi (vẫn vẽ trong lúc bay) rồi biến; luật báo hết giữa chừng không cắt ngang', () => {
    const spots = [spot];
    const layer = new PestLayer(new THREE.Scene(), spots, g.fx, NHA.spec.look);
    layer.show([{ bug: true, weeds: 2 }]);
    layer.pop(0, 'bug');
    expect(layer.counts.bugs).toBe(1);
    step((dt) => layer.tick(dt), POP_LEN / 2);
    layer.show([{ bug: false, weeds: 2 }]);
    expect(layer.counts.bugs).toBe(1);
    step((dt) => layer.tick(dt), POP_LEN);
    expect(layer.counts).toEqual({ bugs: 0, weeds: 2 });
    // nhổ cỏ: 2 bụi bay ra rồi hết
    layer.pop(0, 'weed');
    step((dt) => layer.tick(dt), POP_LEN + 0.1);
    expect(layer.counts.weeds).toBe(0);
  });

  it('R-VUON-13: quỹ đạo bay — nảy lên, cuối co về 0', () => {
    expect(popPath('bug', POP_LEN / 2).dy).toBeGreaterThan(0.5);
    expect(popPath('weed', POP_LEN / 2).dy).toBeGreaterThan(0.3);
    expect(popPath('weed', POP_LEN).scale).toBeCloseTo(0);
    expect(Math.abs(popPath('weed', POP_LEN, -1).dx)).toBeGreaterThan(0.5);
  });
});

describe('R-VUON-13: bể hạt', () => {
  it('R-VUON-13: hạt giống ném xiên rồi rơi, chạm mặt luống nằm lại; hết tuổi thì biến', () => {
    const [h] = makeHats('seed', { x: 0, y: 1, z: 0 }, seededRandom(1), { floor: 0.8, count: 1 });
    const p0 = hatAt(h)!;
    expect(p0.y).toBeCloseTo(1);
    h.t = 0.4;
    const p1 = hatAt(h)!;
    expect(p1.y).toBe(0.8);
    h.t = h.life;
    expect(hatAt(h)).toBeNull();
  });

  it('R-VUON-13: tia nước bay theo hướng miệng bình', () => {
    const hats = makeHats('water', { x: 0, y: 1, z: 0 }, seededRandom(2), { dir: { x: 0, y: 0, z: 1 }, count: 20 });
    for (const h of hats) {
      h.t = 0.2;
      const p = hatAt(h)!;
      expect(p.z).toBeGreaterThan(0.2);
      expect(p.y).toBeLessThan(1);
    }
  });

  it('R-VUON-13: lấp lánh bay lên; bể không vượt số hạt tối đa; không có hạt → ẩn', () => {
    expect(HAT_KINDS.gold.gravity).toBeGreaterThan(0);
    const pool = new HatPool(new THREE.Scene(), { ...g.fx, pool: 20 });
    expect(pool.points.visible).toBe(false);
    for (let i = 0; i < 5; i++) pool.emit('dust', { x: 0, y: 0, z: 0 });
    expect(pool.live).toBe(20);
    pool.tick(1 / 60);
    expect(pool.points.visible).toBe(true);
    expect(pool.points.geometry.drawRange.count).toBe(20);
    step((dt) => pool.tick(dt), 2);
    expect(pool.live).toBe(0);
    expect(pool.points.visible).toBe(false);
  });

  it('R-VUON-13: tia nước liên tục ~70 hạt / giây; lấp lánh vàng ~2 đốm / giây / cây chín', () => {
    const pool = new HatPool(new THREE.Scene(), { ...g.fx, pool: 500 });
    step((dt) => pool.stream({ x: 0, y: 1, z: 0 }, { x: 0, y: -0.3, z: 1 }, dt), 0.5);
    expect(pool.live).toBeGreaterThanOrEqual(33);
    expect(pool.live).toBeLessThanOrEqual(36);
    const glow = new HatPool(new THREE.Scene(), { ...g.fx, pool: 500 });
    step((dt) => glow.glow([{ x: 0, y: 1, z: 0 }, { x: 2, y: 1, z: 0 }], dt), 2);
    expect(glow.live).toBeGreaterThanOrEqual(7);
    expect(glow.live).toBeLessThanOrEqual(9);
  });
});

describe('R-VUON-5/13: đất khô / ẩm, nảy, quả bay', () => {
  it('R-VUON-5: mặc định có màu đất khô (nhạt hơn) và ẩm (sẫm hơn) đất luống', () => {
    const fx = DEFAULT_SCENE.garden.fx;
    const l = (h: string): number => new THREE.Color(h).getHSL({ h: 0, s: 0, l: 0 }).l;
    expect(l(fx.dry)).toBeGreaterThan(l(DEFAULT_SCENE.garden.colors.soil));
    expect(l(fx.wet)).toBeLessThan(l(DEFAULT_SCENE.garden.colors.soil));
    expect(g.fx).toEqual(fx);
  });

  it('R-VUON-5: setSoil đổi màu instance luống (không thêm lưới); luống hoang giữ màu hoang', () => {
    const scene = new THREE.Scene();
    const garden = addGarden(scene, new Colliders(), g, NHA.spec.look);
    const before = scene.children.length;
    const beds = garden.beds.meshes[0] as THREE.InstancedMesh;
    const c = new THREE.Color();
    garden.beds.setOpen(6);
    garden.beds.setSoil(0, 'am');
    beds.getColorAt(0, c);
    expect(c.getHex()).toBe(soilTint(g.colors.soil, g.fx.wet).getHex());
    garden.beds.setSoil(0, 'thuong');
    beds.getColorAt(0, c);
    expect(c.getHex()).toBe(0xffffff);
    garden.beds.setSoil(8, 'kho'); // o-9 hoang
    beds.getColorAt(8, c);
    expect(c.getHex()).toBe(soilTint(g.colors.soil, g.colors.wild).getHex());
    garden.beds.setOpen(9); // mở → màu khô đã đặt hiện ra
    beds.getColorAt(8, c);
    expect(c.getHex()).toBe(soilTint(g.colors.soil, g.fx.dry).getHex());
    expect(scene.children.length).toBe(before);
  });

  it('R-VUON-13: nảy mạnh vươn cao rồi về 1; quả bay lên ~1,4 m rồi về đích, co nhỏ', () => {
    let top = 0;
    for (let t = 0; t < BOUNCE_S; t += 0.01) top = Math.max(top, bounceScale(t).y);
    expect(top).toBeGreaterThan(1.2);
    expect(bounceScale(BOUNCE_S)).toEqual({ xz: 1, y: 1 });
    const from = { x: 0, y: 0, z: 0 };
    const to = { x: 5, y: 3, z: 0 };
    expect(flyPath(FLY_S * 0.4, from, to).y).toBeCloseTo(1.4);
    const end = flyPath(FLY_S, from, to);
    expect(end.x).toBeCloseTo(5);
    expect(end.scale).toBeCloseTo(0.25);
  });

  it('R-VUON-13: thu → hình cây bay (1 lưới), chỗ cũ trống ngay; giảm chuyển động → không bay', () => {
    const scene = new THREE.Scene();
    const garden = addGarden(scene, new Colliders(), g, NHA.spec.look, () => 0, true);
    const crops = garden.crops;
    crops.show(g.plots.map((_, i) => (i === 0 ? { crop: 'cai', stage: 'chin' } : null)));
    const full = crops.triangles;
    expect(full).toBeGreaterThan(0);
    crops.flyHarvest(0, { x: 0, y: 5, z: 0 });
    expect(crops.triangles).toBe(0);
    crops.tick(1 / 60);
    expect(crops.flyMesh.visible).toBe(true);
    step((dt) => crops.tick(dt), FLY_S + 0.1);
    expect(crops.flyMesh.visible).toBe(false);
    crops.show(g.plots.map(() => null));
    crops.reduced = true;
    crops.show(g.plots.map((_, i) => (i === 0 ? { crop: 'cai', stage: 'chin' } : null)));
    crops.flyHarvest(0);
    crops.tick(1 / 60);
    expect(crops.flyMesh.visible).toBe(false);
  });
});
