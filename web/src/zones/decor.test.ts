import { describe, expect, it } from 'vitest';
import { bagCards, cleanHome, DECOR_ITEMS, inBag, migrateOwnedCounts, NEW_HOME, normRot, placedCount, STARTER_COUNTS, STARTER_DECOR, type HomeState, type PlacedDecor } from './decor';

const mon = (item: string, x: number, z: number, rot = 0, scene = 'nha-ta'): PlacedDecor => ({ item, scene, x, z, rot });

describe('Danh mục + sở hữu theo cái (R-NHA-4)', () => {
  it('R-NHA-4: 13 vật — 9 ngoài trời, 4 trong nhà; mới cài 1 Trúc cảnh, 1 Đèn lồng, 1 Tranh chữ trong túi, chưa món nào', () => {
    expect(DECOR_ITEMS).toHaveLength(13);
    expect(DECOR_ITEMS.filter((i) => i.where === 'ngoai').map((i) => i.name)).toEqual(['Trúc cảnh', 'Mai', 'Tùng', 'Đá Thái Hồ', 'Ao sen', 'Đèn lồng', 'Bàn trà', 'Chậu lan', 'Lư hương']);
    expect(DECOR_ITEMS.filter((i) => i.where === 'trong').map((i) => i.name)).toEqual(['Tranh chữ', 'Kệ sách', 'Án đọc', 'Bình phong']);
    expect(NEW_HOME.items).toEqual([]);
    expect(NEW_HOME.owned).toEqual({ 'truc-canh': 1, 'den-long': 1, 'tranh-chu': 1 });
    for (const id of STARTER_DECOR) expect(inBag(NEW_HOME, id)).toBe(1);
    expect(inBag(NEW_HOME, 'mai')).toBe(0);
  });

  it('R-NHA-4: trong túi = sở hữu − đang đặt (mọi nơi); Mai 3 cái đặt 2 → túi 1', () => {
    const home: HomeState = { items: [mon('mai', 8, 4), mon('mai', 10, 4)], owned: { mai: 3 } };
    expect(placedCount(home.items, 'mai')).toBe(2);
    expect(inBag(home, 'mai')).toBe(1);
  });

  it('R-NHA-4: thẻ túi — có trong túi trước (thứ tự danh mục), còn lại rẻ → đắt; đặt hết = "Đặt hết", chưa có = khoá', () => {
    const cards = bagCards(NEW_HOME, 'ngoai');
    expect(cards.map((c) => `${c.item.id}:${c.state}`)).toEqual([
      'truc-canh:bag',
      'den-long:bag',
      'chau-lan:locked',
      'mai:locked',
      'lu-huong:locked',
      'tung:locked',
      'ban-tra:locked',
      'da-thai-ho:locked',
      'ao-sen:locked',
    ]);
    const placed: HomeState = { items: [mon('truc-canh', 8, 4)], owned: STARTER_COUNTS };
    const truc = bagCards(placed, 'ngoai').find((c) => c.item.id === 'truc-canh')!;
    expect(truc).toMatchObject({ state: 'soldOut', inBag: 0, placed: 1 });
    expect(bagCards(NEW_HOME, 'trong').map((c) => c.item.id)).toEqual(['tranh-chu', 'an-doc', 'ke-sach', 'binh-phong']);
  });

  it('R-NHA-2: đang cầm món vừa lấy → túi giảm ngay; món nhấc → vẫn tính đang đặt', () => {
    const home: HomeState = { items: [], owned: { mai: 2 } };
    const take = bagCards(home, 'ngoai', { item: 'mai', lifted: false }).find((c) => c.item.id === 'mai')!;
    expect(take).toMatchObject({ inBag: 1, state: 'bag' });
    const lift = bagCards({ items: [mon('mai', 1, 1)], owned: { mai: 2 } }, 'ngoai', { item: 'mai', lifted: true }).find((c) => c.item.id === 'mai')!;
    expect(lift).toMatchObject({ inBag: 0, placed: 2 });
  });
});

describe('Lưu nhà — đọc dữ liệu (R-NHA-3, R-NHA-4)', () => {
  it('R-NHA-3: món giữ vật, nơi, chỗ, hướng; vật lạ / sai dạng bỏ; góc về bội 45', () => {
    const h = cleanHome({ items: [mon('mai', 8, 4, 45), { item: 'rong', scene: 'nha-ta', x: 0, z: 0, rot: 0 }, { item: 'mai' }, mon('den-long', -11, -3, 405)], owned: { mai: 1, 'den-long': 1 } });
    expect(h.items).toEqual([mon('mai', 8, 4, 45), mon('den-long', -11, -3, 45)]);
    expect(normRot(-45)).toBe(315);
  });

  it('R-NHA-4: món vượt số cái → bỏ món thừa (bất biến: đang đặt ≤ sở hữu)', () => {
    const h = cleanHome({ items: [mon('mai', 1, 1), mon('mai', 3, 1)], owned: { mai: 1 } });
    expect(h.items).toHaveLength(1);
  });

  it('R-NHA-4: `owned` mảng (bản cũ) → mỗi mã 1 cái, vật ở nhiều ô → số ô; thiếu → khởi đầu + đang đặt', () => {
    const old = cleanHome({ placed: { 'vuon-1': 'mai', 'vuon-2': 'mai', 'vuon-3': 'mai', 'san-1': 'rong' }, owned: ['truc-canh', 'mai', 'tung', 3] });
    expect(old.owned).toEqual({ 'truc-canh': 1, mai: 3, tung: 1 });
    expect(old.legacy).toEqual({ 'vuon-1': 'mai', 'vuon-2': 'mai', 'vuon-3': 'mai' });
    expect(cleanHome({ placed: { 'vuon-1': 'tung' } }).owned).toEqual({ ...STARTER_COUNTS, tung: 1 });
    expect(cleanHome('hỏng')).toEqual({ items: [], owned: STARTER_COUNTS, legacy: {} });
    expect(migrateOwnedCounts(['mai'], ['mai', 'mai', 'den-long'])).toEqual({ mai: 2, 'den-long': 1 });
  });

  it('R-NHA-3: đã có `items` → không đọc ô cũ nữa (đã chuyển không chuyển lại)', () => {
    expect(cleanHome({ items: [], placed: { 'vuon-1': 'mai' }, owned: { mai: 1 } }).legacy).toEqual({});
  });
});
