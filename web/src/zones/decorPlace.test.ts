import { describe, expect, it } from 'vitest';
import type { Box } from '../collision/colliders';
import { rectsOverlap } from '../collision/footprint';
import type { PlacedDecor } from './decor';
import { checkSpot, footprint, nearestValid, pathOpen, rotStep, settleScene, snap, type DecorShape, type PlaceArea } from './decorPlace';

/** Chân vật như `DECOR_SHAPES` (scene/decorItems.ts) — test zones không import scene. */
const SHAPES: Record<string, DecorShape> = {
  mai: { w: 1.6, d: 1.4 },
  'ban-tra': { w: 1.76, d: 0.9 },
  'chau-lan': { w: 0.6, d: 0.6 },
  'ao-sen': { w: 1.5, d: 1.5, round: true },
  'ke-sach': { w: 1.4, d: 0.45 },
  'den-long': { w: 0.76, d: 0.4 },
};
const shapeOf = (id: string): DecorShape | undefined => SHAPES[id];

const wall = (minX: number, maxX: number, minZ: number, maxZ: number): Box => ({ minX, maxX, minZ, maxZ, h: 2 });

/**
 * Sân thử 20 × 20 m: tường ngang z = 0 chừa khe 2 m ở x −1 … 1; lối đi x −1 … 1 phía nam (z 4 … 10); xuất phát (0; 8), đích (0; −9).
 */
function yard(over: Partial<PlaceArea> = {}): PlaceArea {
  return {
    scene: 'nha-ta',
    where: 'ngoai',
    bounds: [[-10, -10], [10, -10], [10, 10], [-10, 10]],
    keepOut: [{ label: 'Lối đi', rect: { x: 0, z: 7, w: 2, d: 6, rot: 0 } }, { label: 'Luống rau', rect: { x: 6, z: 6, w: 2, d: 2, rot: 0 } }],
    maxItems: 40,
    maxSlope: 0.35,
    boxes: [wall(-10, -1, -0.1, 0.1), wall(1, 10, -0.1, 0.1)],
    circles: [],
    start: [0, 8],
    goals: [{ at: [0, -9], r: 1 }],
    ...over,
  };
}
const mon = (item: string, x: number, z: number, rot = 0): PlacedDecor => ({ item, scene: 'nha-ta', x, z, rot });

describe('Lưới + xoay (R-NHA-2)', () => {
  it('R-NHA-2: toạ độ về lưới 0,5 m', () => {
    expect([snap(1.24), snap(1.26), snap(-3.2), snap(-3.6), snap(-0.1)]).toEqual([1, 1.5, -3, -3.5, 0]);
  });

  it('R-NHA-2: xoay từng 45° đủ 8 hướng, vòng lại 0; R 90°', () => {
    const seen: number[] = [];
    let r = 0;
    for (let i = 0; i < 8; i++) {
      seen.push(r);
      r = rotStep(r, 45);
    }
    expect(seen).toEqual([0, 45, 90, 135, 180, 225, 270, 315]);
    expect(r).toBe(0);
    expect(rotStep(0, -45)).toBe(315);
    expect(rotStep(315, 90)).toBe(45);
  });

  it('R-NHA-7: chân món xoay 45° đúng hình xoay — hai bàn trà chéo sát nhau đè, lệch 1,5 m không đè', () => {
    const s = SHAPES['ban-tra'];
    const a = footprint(s, { x: 0, z: 0, rot: 45 });
    expect(rectsOverlap(a, footprint(s, { x: 1, z: 1, rot: 45 }))).toBe(false); // song song, cách 1,41 m theo pháp tuyến > sâu 0,9
    expect(rectsOverlap(a, footprint(s, { x: 0.5, z: 0, rot: 45 }))).toBe(true);
    expect(rectsOverlap(a, footprint(s, { x: 0.6, z: 0.6, rot: 135 }))).toBe(true); // vuông góc, chéo nhau
    // ao sen tròn: chân không đổi khi xoay
    expect(footprint(SHAPES['ao-sen'], { x: 0, z: 0, rot: 45 })).toEqual({ x: 0, z: 0, w: 1.5, d: 1.5, rot: 0 });
  });
});

describe('Chỗ đặt hợp lệ (R-NHA-7)', () => {
  it('R-NHA-7: bãi cỏ trống → được; trên lối đi → đỏ "Lối đi"; luống → "Luống rau"', () => {
    const a = yard();
    expect(checkSpot(a, [], shapeOf, 'mai', { x: -5, z: 5, rot: 0 })).toEqual({ ok: true });
    expect(checkSpot(a, [], shapeOf, 'mai', { x: 0, z: 6, rot: 0 })).toMatchObject({ ok: false, problem: 'vungCam', label: 'Lối đi' });
    expect(checkSpot(a, [], shapeOf, 'chau-lan', { x: 6.5, z: 6.5, rot: 0 })).toMatchObject({ ok: false, label: 'Luống rau' });
  });

  it('R-NHA-7: mép vùng — chân lòi ra ngoài đa giác → "Ngoài chỗ đặt"; vừa trong → được', () => {
    const a = yard();
    expect(checkSpot(a, [], shapeOf, 'mai', { x: 9.5, z: -5, rot: 0 })).toMatchObject({ ok: false, problem: 'ngoaiVung', label: 'Ngoài chỗ đặt' });
    expect(checkSpot(a, [], shapeOf, 'mai', { x: 9, z: -5, rot: 0 })).toEqual({ ok: true });
    // xoay 45° chân to hơn theo trục → lòi ra
    expect(checkSpot(a, [], shapeOf, 'mai', { x: 9, z: -5, rot: 45 }).ok).toBe(false);
  });

  it('R-NHA-7: đè tường / vật cảnh → "Đè vật khác"; Mai sát Mai khác → "Đè vật khác"', () => {
    const a = yard();
    expect(checkSpot(a, [], shapeOf, 'mai', { x: -5, z: 0.5, rot: 0 })).toMatchObject({ problem: 'vatCanh', label: 'Đè vật khác' });
    expect(checkSpot(a, [mon('mai', -5, 5)], shapeOf, 'mai', { x: -4, z: 5, rot: 0 })).toMatchObject({ problem: 'deVat', label: 'Đè vật khác' });
    expect(checkSpot(a, [mon('mai', -5, 5)], shapeOf, 'mai', { x: -3, z: 5, rot: 0 })).toEqual({ ok: true });
  });

  it('R-NHA-7: dốc — chênh cao trong chân > 0,35 m → "Dốc quá"', () => {
    const a = yard({ heightAt: (x) => (x > 3 ? (x - 3) * 0.5 : 0) });
    expect(checkSpot(a, [], shapeOf, 'mai', { x: -5, z: 5, rot: 0 })).toEqual({ ok: true });
    expect(checkSpot(a, [], shapeOf, 'mai', { x: 5, z: -5, rot: 0 })).toMatchObject({ problem: 'doc', label: 'Dốc quá' });
  });

  it('R-NHA-7: vật trong nhà không đặt ở sân (sai nơi); trần món → "Đã đủ 40 món" (gian trong 20)', () => {
    const a = yard();
    expect(checkSpot(a, [], shapeOf, 'ke-sach', { x: -5, z: 5, rot: 0 })).toMatchObject({ problem: 'saiNoi' });
    const full = Array.from({ length: 40 }, (_, i) => mon('chau-lan', -9 + (i % 10) * 1.5, -9 + Math.floor(i / 10) * 1.5));
    expect(checkSpot(a, full, shapeOf, 'chau-lan', { x: 5, z: 5, rot: 0 })).toMatchObject({ problem: 'het', label: 'Đã đủ 40 món' });
    expect(checkSpot({ ...yard({ maxItems: 20 }) }, full.slice(0, 20), shapeOf, 'chau-lan', { x: 5, z: 5, rot: 0 })).toMatchObject({ label: 'Đã đủ 20 món' });
  });

  it('R-NHA-7: bàn trà bịt khe tường (lối duy nhất tới đích) → "Chắn lối"; vật nhỏ ở khe không chặn', () => {
    const a = yard();
    expect(pathOpen(a, [])).toBe(true);
    expect(checkSpot(a, [], shapeOf, 'ban-tra', { x: 0, z: 1, rot: 0 })).toMatchObject({ ok: false, problem: 'chanLoi', label: 'Chắn lối' });
    expect(checkSpot(a, [], shapeOf, 'den-long', { x: 0, z: 1, rot: 0 })).toEqual({ ok: true });
    expect(checkSpot(a, [], shapeOf, 'ban-tra', { x: -4, z: 2, rot: 0 })).toEqual({ ok: true });
  });

  it('R-NHA-7: hàng bàn trà quây kín chỗ xuất phát → bàn cuối đỏ "Chắn lối"', () => {
    // khe 3 m (x −1,5 … 1,5): một bàn chưa kín, bàn thứ hai cạnh nó bịt nốt
    const a = yard({ boxes: [wall(-10, -1.5, -0.1, 0.1), wall(1.5, 10, -0.1, 0.1)], keepOut: [] });
    expect(checkSpot(a, [], shapeOf, 'ban-tra', { x: -0.9, z: 1, rot: 0 }).ok).toBe(true);
    expect(checkSpot(a, [mon('ban-tra', -0.9, 1)], shapeOf, 'ban-tra', { x: 1, z: 1, rot: 0 })).toMatchObject({ problem: 'chanLoi', label: 'Chắn lối' });
  });

  it('R-NHA-7: đích vốn không tới được (không có lối từ đầu) → không đòi, không đỏ oan', () => {
    const a = yard({ boxes: [wall(-10, 10, -0.1, 0.1)] });
    expect(checkSpot(a, [], shapeOf, 'ban-tra', { x: 0, z: 2, rot: 0 })).toEqual({ ok: true });
  });
});

describe('Chỗ gần nhất + xếp lại khi vào cảnh (R-NHA-3)', () => {
  it('R-NHA-3: chỗ nay không hợp lệ → chỗ hợp lệ gần nhất trong 1,5 m; không có → null', () => {
    const a = yard();
    const s = nearestValid(a, [], shapeOf, 'mai', { x: -1.5, z: 6, rot: 0 }, 1.5)!;
    expect(checkSpot(a, [], shapeOf, 'mai', s).ok).toBe(true);
    expect(Math.hypot(s.x + 1.5, s.z - 6)).toBeLessThanOrEqual(1.5);
    expect(nearestValid(a, [], shapeOf, 'mai', { x: 0, z: 7, rot: 0 }, 0.5)).toBeNull();
  });

  it('R-NHA-3: món hợp lệ giữ nguyên; món trên lối dời ≤ 1,5 m; không chỗ → về túi (bỏ khỏi danh sách); món cảnh khác giữ', () => {
    const a = yard();
    const inside: PlacedDecor = { item: 'ke-sach', scene: 'nha-ta-trong', x: 0, z: -3.5, rot: 0 };
    const r = settleScene(a, [mon('mai', -5, 5), mon('chau-lan', -1, 6), mon('mai', 0, 7), inside], shapeOf);
    expect(r.changed).toBe(true);
    expect(r.items[0]).toEqual(mon('mai', -5, 5));
    const lan = r.items.find((p) => p.item === 'chau-lan')!;
    expect(lan.x).toBeLessThanOrEqual(-1.5);
    expect(r.items.filter((p) => p.item === 'mai')).toHaveLength(1); // mai giữa lối (x 0) không có chỗ ≤ 1,5 m → về túi
    expect(r.items).toContainEqual(inside);
    expect(settleScene(a, [mon('mai', -5, 5)], shapeOf).changed).toBe(false);
  });
});
