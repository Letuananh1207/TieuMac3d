import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from '../collision/colliders';
import { DecorLayer, slotFloorY, slotMark } from './decorLayer';
import { DECOR_BUILT_IDS, DECOR_SHAPES, buildDecorItem, decorBlock, decorFootprint } from './decorItems';
import { NHA_O_FLOOR } from './kien_truc/nha_o';
import { DECOR_SLOT_GAP, DEFAULT_SCENE, type SceneSpec } from './spec';

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
  it('13 vật đều có hình và khung bao; khung ≤ khoảng cách hai ô', () => {
    expect(DECOR_BUILT_IDS).toHaveLength(13);
    expect([...DECOR_BUILT_IDS].sort()).toEqual(Object.keys(DECOR_SHAPES).sort());
    for (const s of Object.values(DECOR_SHAPES)) {
      expect(s.w).toBeLessThanOrEqual(DECOR_SLOT_GAP);
      expect(s.d).toBeLessThanOrEqual(DECOR_SLOT_GAP);
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
    expect(decorBlock({ x: 3, z: -2 }, 'ke-sach', true)).toEqual({ kind: 'box', x: 3, z: -2, w: 1.4, d: 0.45 });
    expect(decorBlock({ x: 3, z: -2, rotY: 90 }, 'ke-sach', true)).toEqual({ kind: 'box', x: 3, z: -2, w: 0.45, d: 1.4 });
    expect(decorBlock({ x: 3, z: -2, rotY: 270 }, 'binh-phong', true)).toMatchObject({ w: DECOR_SHAPES['binh-phong'].d });
    expect(decorBlock({ x: 3, z: -2 }, 'den-long', false)).toBeNull();
    expect(decorBlock({ x: 1, z: 1 }, 'ao-sen', true)).toEqual({ kind: 'circle', x: 1, z: 1, r: DECOR_SHAPES['ao-sen'].w / 2 });
  });
});

const HOME: SceneSpec = {
  ...DEFAULT_SCENE,
  buildings: [{ id: 'chinh-phong', kind: 'nha-o', x: 0, z: -8, w: 10.5, d: 6, title: 'Nhà của ta', roofColor: '#3b3f44' }],
  decorSlots: [
    { id: 'trong-1', kind: 'trong', x: -3.2, z: -9.8 },
    { id: 'san-1', kind: 'san', x: -3.5, z: -2 },
  ],
};

describe('Đặt vật vào ô', () => {
  it('ô trong nhà đứng trên sàn nhà ở, ô sân trên đất', () => {
    expect(slotFloorY(HOME, HOME.decorSlots[0])).toBeCloseTo(NHA_O_FLOOR, 9);
    expect(slotFloorY(HOME, HOME.decorSlots[1])).toBe(0);
    expect(slotFloorY(HOME, HOME.decorSlots[1], () => 1.5)).toBe(1.5);
  });

  it('R-NHA-2: đặt bàn trà → chặn; thay bằng đèn lồng → hết chặn, hình đổi; gỡ → ô trống', () => {
    const scene = new THREE.Scene();
    const c = new Colliders();
    const layer = new DecorLayer(scene, c, HOME);
    const slot = layer.root.children[1];
    layer.set('san-1', { id: 'ban-tra', blocks: true });
    expect(c.boxes).toHaveLength(1);
    expect(slot.children[0].name).toBe('decor:ban-tra');
    const p = { x: -3.5, z: -2.3 };
    c.resolve(p, 0.5);
    expect(Math.hypot(p.x + 3.5, p.z + 2)).toBeGreaterThan(0.4); // bị đẩy khỏi chỗ bàn

    layer.set('san-1', { id: 'den-long', blocks: false });
    expect(c.boxes).toHaveLength(0);
    expect(slot.children.map((o) => o.name)).toEqual(['decor:den-long']);
    expect(layer.anchor('san-1')!.y).toBeCloseTo(DECOR_SHAPES['den-long'].h + 0.15, 9);

    layer.set('san-1', null);
    expect(slot.children).toHaveLength(0);
    expect(layer.anchor('san-1')!.y).toBeCloseTo(0.15, 9);
  });

  it('R-NHA-2: nạp cả nhà — ô không có trong dữ liệu thành trống, ao sen chặn tròn', () => {
    const c = new Colliders();
    const layer = new DecorLayer(new THREE.Scene(), c, HOME);
    const items: Record<string, { id: string; blocks: boolean }> = { 'ao-sen': { id: 'ao-sen', blocks: true }, 'tranh-chu': { id: 'tranh-chu', blocks: false } };
    layer.setAll({ 'san-1': 'ao-sen', 'trong-1': 'tranh-chu' }, (id) => items[id]);
    expect(c.circles).toHaveLength(1);
    layer.setAll({ 'trong-1': 'tranh-chu' }, (id) => items[id]);
    expect(c.circles).toHaveLength(0);
    expect(layer.root.children[0].children).toHaveLength(1);
    expect(layer.root.children[1].children).toHaveLength(0);
  });

  it('dấu ô: đang chọn > có vật > trống', () => {
    expect(slotMark('a', { a: 'mai' }, 'a')).toBe('chon');
    expect(slotMark('a', { a: 'mai' }, 'b')).toBe('co-vat');
    expect(slotMark('b', { a: 'mai' }, null)).toBe('trong');
  });
});
