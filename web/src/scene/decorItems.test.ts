import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from '../collision/colliders';
import { DecorLayer, decorFloorY } from './decorLayer';
import { DECOR_BUILT_IDS, DECOR_SHAPES, buildDecorItem, decorBlocks, decorFootprint } from './decorItems';
import { NHA_O_FLOOR } from './kien_truc/nha_o';
import { DEFAULT_SCENE, type SceneSpec } from './spec';

/** Vật to nhất rộng ≈ 1,8 m (giữ hình gọn như thời ô). */
const MAX_SIDE = 1.8;

/** Draw call + tam giác của một nhóm (mỗi Mesh một draw call). */
function stats(g: THREE.Object3D): { calls: number; tris: number } {
  let calls = 0;
  let tris = 0;
  g.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    calls++;
    const geo = o.geometry as THREE.BufferGeometry;
    tris += (geo.index ? geo.index.count : geo.getAttribute('position').count) / 3;
  });
  return { calls, tris };
}

describe('Hình đồ trang trí', () => {
  it('13 vật đều có hình và khung bao; khung ≤ 1,8 m', () => {
    expect(DECOR_BUILT_IDS).toHaveLength(13);
    expect([...DECOR_BUILT_IDS].sort()).toEqual(Object.keys(DECOR_SHAPES).sort());
    for (const s of Object.values(DECOR_SHAPES)) {
      expect(s.w).toBeLessThanOrEqual(MAX_SIDE);
      expect(s.d).toBeLessThanOrEqual(MAX_SIDE);
    }
  });

  it.each(DECOR_BUILT_IDS)('%s: hình nằm gọn trong khung bao, đỉnh sát chiều cao khung; ≤ 2 draw call, ≤ 3000 tam giác', (id) => {
    const g = buildDecorItem(id, DEFAULT_SCENE)!;
    const bb = new THREE.Box3().setFromObject(g);
    const s = DECOR_SHAPES[id];
    const tol = 0.03;
    expect(bb.min.x).toBeGreaterThanOrEqual(-s.w / 2 - tol);
    expect(bb.max.x).toBeLessThanOrEqual(s.w / 2 + tol);
    expect(bb.min.z).toBeGreaterThanOrEqual(-s.d / 2 - tol);
    expect(bb.max.z).toBeLessThanOrEqual(s.d / 2 + tol);
    expect(bb.min.y).toBeGreaterThanOrEqual(-tol);
    expect(Math.abs(bb.max.y - s.h)).toBeLessThan(0.12);
    const { calls, tris } = stats(g);
    expect(calls).toBeLessThanOrEqual(2);
    expect(tris).toBeLessThanOrEqual(3000);
  });

  it('mã lạ → không hình, không khung', () => {
    expect(buildDecorItem('khong-co', DEFAULT_SCENE)).toBeNull();
    expect(decorFootprint('khong-co')).toBeUndefined();
  });

  it('R-NHA-2: va chạm vật to theo khung, quay 90° đổi rộng ↔ sâu; vật nhỏ không chặn; ao sen tròn', () => {
    expect(decorBlocks({ x: 3, z: -2 }, 'ke-sach', true)).toEqual([{ kind: 'box', x: 3, z: -2, w: 1.4, d: 0.45 }]);
    expect(decorBlocks({ x: 3, z: -2, rotY: 90 }, 'ke-sach', true)).toEqual([{ kind: 'box', x: 3, z: -2, w: 0.45, d: 1.4 }]);
    expect(decorBlocks({ x: 3, z: -2, rotY: 270 }, 'binh-phong', true)[0]).toMatchObject({ w: DECOR_SHAPES['binh-phong'].d });
    expect(decorBlocks({ x: 3, z: -2 }, 'den-long', false)).toEqual([]);
    expect(decorBlocks({ x: 1, z: 1, rotY: 45 }, 'ao-sen', true)).toEqual([{ kind: 'circle', x: 1, z: 1, r: DECOR_SHAPES['ao-sen'].w / 2 }]);
  });

  it('R-NHA-7: khung bao 45° = khung bao của hình xoay; vòng tròn vật cản nằm dọc trục dài', () => {
    const f = decorFootprint('ban-tra', 45)!;
    const s = DECOR_SHAPES['ban-tra'];
    expect(f.w).toBeCloseTo((s.w + s.d) * Math.SQRT1_2, 5);
    expect(f.d).toBeCloseTo(f.w, 5);
    const cs = decorBlocks({ x: 0, z: 0, rotY: 45 }, 'ban-tra', true);
    for (const c of cs) if (c.kind === 'circle') expect(Math.abs(c.x + c.z)).toBeLessThan(1e-9); // trục dài rộng (x riêng) quay 45° → đường x = −z
  });
});

const HOME: SceneSpec = {
  ...DEFAULT_SCENE,
  buildings: [{ id: 'chinh-phong', kind: 'nha-o', x: 0, z: -8, w: 10.5, d: 6, title: 'Nhà của ta', roofColor: '#3b3f44' }],
};
const COLORS = { jade: '#2B5446', lacquer: '#A8322A' };

/** Số InstancedMesh đang vẽ (có món) — mỗi cái một draw call. */
function instanced(layer: DecorLayer): THREE.InstancedMesh[] {
  return layer.root.children.filter((o): o is THREE.InstancedMesh => o instanceof THREE.InstancedMesh && o.count > 0);
}

describe('Lớp đồ trang trí đặt tự do (R-NHA-2, R-NHA-7)', () => {
  it('chân món trong nhà ở đứng trên sàn nhà, ngoài sân trên đất', () => {
    expect(decorFloorY(HOME, -3.2, -9.8)).toBeCloseTo(NHA_O_FLOOR, 9);
    expect(decorFloorY(HOME, -3.5, -2)).toBe(0);
    expect(decorFloorY(HOME, -3.5, -2, () => 1.5)).toBe(1.5);
  });

  it('R-NHA-2: bàn trà chặn người; đổi sang đèn lồng → hết chặn; bàn trà xoay 45° chặn bằng 2–3 vòng tròn', () => {
    const c = new Colliders();
    const layer = new DecorLayer(new THREE.Scene(), c, HOME, undefined, COLORS);
    layer.setItems([{ item: 'ban-tra', x: -3.5, z: -2, rot: 0, blocks: true }]);
    expect(c.boxes).toHaveLength(1);
    const p = { x: -3.5, z: -2.3 };
    c.resolve(p, 0.5);
    expect(Math.hypot(p.x + 3.5, p.z + 2)).toBeGreaterThan(0.4);
    layer.setItems([{ item: 'den-long', x: -3.5, z: -2, rot: 0, blocks: false }]);
    expect(c.boxes).toHaveLength(0);
    layer.setItems([{ item: 'ban-tra', x: 0, z: 0, rot: 45, blocks: true }]);
    expect(c.boxes).toHaveLength(0);
    expect(c.circles.length).toBeGreaterThanOrEqual(2);
    expect(c.circles.length).toBeLessThanOrEqual(3);
    expect(layer.ownBlocks().size).toBe(c.circles.length);
  });

  it('R-NHA-7: 40 món 13 loại → draw call đồ trang trí ≤ 15 (InstancedMesh theo mã vật)', () => {
    const layer = new DecorLayer(new THREE.Scene(), new Colliders(), HOME, undefined, COLORS);
    const ids = Object.keys(DECOR_SHAPES);
    layer.setItems(Array.from({ length: 40 }, (_, i) => ({ item: ids[i % ids.length], x: (i % 8) * 2.5, z: Math.floor(i / 8) * 2.5, rot: (i % 8) * 45, blocks: false })));
    expect(instanced(layer).reduce((n, m) => n + m.count, 0)).toBeGreaterThanOrEqual(40);
    expect(layer.drawCalls()).toBeLessThanOrEqual(15);
    layer.setGhost({ item: 'mai', x: 1, z: 1, rot: 45, ok: false });
    expect(layer.drawCalls()).toBeLessThanOrEqual(15 + 1 + 5); // + bóng ma + khung chân / mũi tên / lưới / vùng cấm
  });

  it('R-NHA-6: bắt món dưới con trỏ bằng chân món theo hướng', () => {
    const layer = new DecorLayer(new THREE.Scene(), new Colliders(), HOME, undefined, COLORS);
    layer.setItems([
      { item: 'ke-sach', x: 5, z: 5, rot: 90, blocks: true },
      { item: 'mai', x: -5, z: 5, rot: 0, blocks: false },
    ]);
    expect(layer.pick(5, 5.6)).toBe(0); // kệ quay 90°: dài theo z
    expect(layer.pick(5.6, 5)).toBe(-1);
    expect(layer.pick(-5.2, 5.3)).toBe(1);
    expect(layer.pick(0, 0)).toBe(-1);
  });
});
