import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SHOP_ID, shopButtonShown, shopDoor, type BuildingLike } from './shop';

const scene = JSON.parse(readFileSync(new URL('../../../design/scene/scene.json', import.meta.url), 'utf8')) as {
  buildings: BuildingLike[];
};

describe('nút "Vào tiệm" Tạp hoá (R-TIEN-6)', () => {
  it('R-TIEN-6: cửa tiệm ở giữa mặt tiền — Tạp hoá trong đặc tả cảnh (−11; 30) quay 90° → cửa (−8; 30)', () => {
    expect(scene.buildings.some((b) => b.id === SHOP_ID)).toBe(true);
    expect(shopDoor(scene.buildings)).toEqual({ x: -8, z: 30 });
    expect(shopDoor([{ id: SHOP_ID, x: 0, z: 0, d: 6 }])).toEqual({ x: 0, z: 3 }); // không xoay: mặt tiền phía +z
    expect(shopDoor([{ id: 'hieu-but', x: 0, z: 0, d: 6 }])).toBeNull();
  });

  it('R-TIEN-6: đứng trước cửa cách 2 m → hiện; lùi ra 3 m → ẩn; trong tiệm → hiện', () => {
    const door = { x: -8, z: 30 };
    const at = (x: number, z: number, inShop = false, free = true) => ({ x, z, inShop, free });
    expect(shopButtonShown(door, at(-6, 30))).toBe(true);
    expect(shopButtonShown(door, at(-5, 30))).toBe(false);
    expect(shopButtonShown(door, at(-12, 28, true))).toBe(true);
  });

  it('R-TIEN-6: đang bận (thoại, học, ngồi, bản đồ) hoặc cảnh không có tiệm → ẩn', () => {
    expect(shopButtonShown({ x: -8, z: 30 }, { x: -7, z: 30, inShop: false, free: false })).toBe(false);
    expect(shopButtonShown(null, { x: -7, z: 30, inShop: true, free: true })).toBe(false);
  });
});
