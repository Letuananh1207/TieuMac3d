import { describe, expect, it } from 'vitest';
import { cleanHome, inBag } from './decor';
import { LEGACY_SLOTS, migrateHome } from './decorLegacy';

describe('Chuyển nhà từ bản có ô (R-NHA-3)', () => {
  it('R-NHA-3: 12 ô cũ đóng băng — 9 ở sân, 3 ở gian trong; mỗi ô → đúng toạ độ (lưới 0,5) + góc ô', () => {
    expect(LEGACY_SLOTS.filter((s) => s.scene === 'nha-ta')).toHaveLength(9);
    expect(LEGACY_SLOTS.filter((s) => s.scene === 'nha-ta-trong')).toHaveLength(3);
    const all = Object.fromEntries(LEGACY_SLOTS.map((s) => [s.id, s.scene === 'nha-ta' ? 'chau-lan' : 'an-doc']));
    const items = migrateHome([], all, { 'chau-lan': 9, 'an-doc': 3 });
    expect(items).toHaveLength(12);
    expect(items[0]).toEqual({ item: 'chau-lan', scene: 'nha-ta', x: -19, z: -3, rot: 0 }); // san-1 (−19; −3,2)
    expect(items.find((p) => p.x === -6 && p.z === -13)).toBeDefined(); // vuon-1
    expect(items.filter((p) => p.scene === 'nha-ta-trong').map((p) => [p.x, p.z])).toEqual([[-4, -3.5], [0, -3.5], [4, -3.5]]);
  });

  it('R-NHA-3: Mai ở ô vuon-1 (−6; −13), Tranh chữ ở trong-2 → Mai (−6; −13) ở sân, Tranh chữ (0; −3,5) gian trong', () => {
    expect(migrateHome([], { 'vuon-1': 'mai', 'trong-2': 'tranh-chu' }, { mai: 1, 'tranh-chu': 1 })).toEqual([
      { item: 'mai', scene: 'nha-ta', x: -6, z: -13, rot: 0 },
      { item: 'tranh-chu', scene: 'nha-ta-trong', x: 0, z: -3.5, rot: 0 },
    ]);
  });

  it('R-NHA-4: Mai ở 3 ô + Mai 3 cái (Flutter đã chuyển số cái) → 3 món, túi 0; không mất cái nào', () => {
    const raw = { placed: { 'vuon-1': 'mai', 'vuon-2': 'mai', 'san-3': 'mai' }, owned: { mai: 3, tung: 1 } };
    const clean = cleanHome(raw);
    const items = migrateHome(clean.items, clean.legacy, clean.owned);
    const home = { items, owned: clean.owned };
    expect(items).toHaveLength(3);
    expect(inBag(home, 'mai')).toBe(0);
    expect(inBag(home, 'tung')).toBe(1);
  });

  it('R-NHA-4: ví thử / Flutter rất cũ (`owned` mảng) — Mai ở 3 ô → 3 cái, 3 món', () => {
    const clean = cleanHome({ placed: { 'vuon-1': 'mai', 'vuon-2': 'mai', 'san-3': 'mai' }, owned: ['truc-canh', 'mai'] });
    expect(clean.owned.mai).toBe(3);
    expect(migrateHome([], clean.legacy, clean.owned)).toHaveLength(3);
  });

  it('R-NHA-3: ô lạ (bỏ từ trước) + vật lạ bỏ qua; vật sai nơi của ô bỏ (về túi)', () => {
    expect(migrateHome([], { 'o-cu': 'mai', 'vuon-1': 'rong', 'trong-1': 'mai' }, { mai: 1 })).toEqual([]);
  });

  it('R-NHA-3: đã có món → nối sau, không vượt số cái', () => {
    const had = [{ item: 'mai', scene: 'nha-ta', x: 8, z: 4, rot: 45 }];
    expect(migrateHome(had, { 'vuon-1': 'mai' }, { mai: 1 })).toEqual(had);
  });
});
