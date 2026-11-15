/** Danh mục đồ trang trí (zones) ↔ hình dựng (scene) khớp nhau — hai lớp không import nhau, chỉ gốc kiểm được. */
import { expect, it } from 'vitest';
import { DECOR_BUILT_IDS, DECOR_SHAPES, decorBlocks } from './scene/decorItems';
import { DECOR_ITEMS } from './zones/decor';

it('R-NHA-4: mọi vật trong danh mục có hình, không hình thừa', () => {
  expect([...DECOR_BUILT_IDS].sort()).toEqual(DECOR_ITEMS.map((i) => i.id).sort());
});

it('R-NHA-2: vật to (bàn trà, kệ sách, bình phong, đá cảnh, ao sen) có vật cản; vật nhỏ không', () => {
  const blocking = DECOR_ITEMS.filter((i) => decorBlocks({ x: 0, z: 0 }, i.id, i.blocks).length > 0).map((i) => i.id);
  expect(blocking.sort()).toEqual(['ao-sen', 'ban-tra', 'binh-phong', 'da-thai-ho', 'ke-sach']);
});

it('R-NHA-7: mọi vật có chân (khung bao) để kiểm chỗ đặt tự do', () => {
  for (const i of DECOR_ITEMS) expect(DECOR_SHAPES[i.id], i.id).toBeDefined();
});
