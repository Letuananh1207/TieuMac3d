import { describe, expect, it } from 'vitest';
import { DECOR_ITEMS, NEW_HOME, type HomeState, type PlacedDecor } from './decor';
import { bagStock, DECOR_GROUPS, GROUP_OF, pageSlice, perPage, stockTabs, tabCards } from './decorStock';

const mon = (item: string, x: number, z: number, scene = 'nha-ta'): PlacedDecor => ({ item, scene, x, z, rot: 0 });
const allOwned = (n: number): Record<string, number> => Object.fromEntries(DECOR_ITEMS.map((i) => [i.id, n]));

describe('Dải kho trang trí — chỉ đồ trong túi, tab, lật trang (R-NHA-4, R-NHA-6)', () => {
  it('R-NHA-4: mới cài → sân chỉ Trúc cảnh, Đèn lồng (× 1); gian trong chỉ Tranh chữ; vật chưa mua không hiện', () => {
    expect(bagStock(NEW_HOME, 'ngoai').map((c) => `${c.item.id}×${c.inBag}`)).toEqual(['truc-canh×1', 'den-long×1']);
    expect(bagStock(NEW_HOME, 'trong').map((c) => c.item.id)).toEqual(['tranh-chu']);
  });

  it('R-NHA-4: vật đã đặt hết ẩn khỏi dải; còn trong túi thì hiện số còn lại', () => {
    const home: HomeState = { items: [mon('mai', 8, 4), mon('truc-canh', 2, 2)], owned: { mai: 3, 'truc-canh': 1 } };
    expect(bagStock(home, 'ngoai').map((c) => `${c.item.id}×${c.inBag}`)).toEqual(['mai×2']);
  });

  it('R-NHA-4: đang cầm món vừa lấy → túi trừ 1; lấy cái cuối → vật biến khỏi dải', () => {
    const home: HomeState = { items: [], owned: { mai: 1, tung: 2 } };
    expect(bagStock(home, 'ngoai', { item: 'mai', lifted: false }).map((c) => `${c.item.id}×${c.inBag}`)).toEqual(['tung×2']);
    expect(bagStock(home, 'ngoai', { item: 'tung', lifted: false }).map((c) => `${c.item.id}×${c.inBag}`)).toEqual(['mai×1', 'tung×1']);
  });

  it('R-NHA-4: túi trống (mọi món đã đặt) → không ô, không tab', () => {
    const home: HomeState = { items: [mon('truc-canh', 1, 1), mon('den-long', 3, 1)], owned: { 'truc-canh': 1, 'den-long': 1 } };
    expect(bagStock(home, 'ngoai')).toEqual([]);
    expect(stockTabs([])).toEqual([]);
  });

  it('R-NHA-4: mọi vật có nhóm; tab = Tất cả + nhóm có món theo nơi (R-NHA-2: gian trong chỉ đồ trong nhà)', () => {
    for (const it of DECOR_ITEMS) expect(DECOR_GROUPS.map((g) => g.id)).toContain(GROUP_OF[it.id]);
    const home: HomeState = { items: [], owned: allOwned(2) };
    const san = bagStock(home, 'ngoai');
    expect(stockTabs(san).map((t) => `${t.name}:${t.n}`)).toEqual(['Tất cả:9', 'Cây cảnh:4', 'Đá & ao:2', 'Đồ dùng:1', 'Đèn & vật nhỏ:2']);
    const trong = bagStock(home, 'trong');
    expect(trong.every((c) => c.item.where === 'trong')).toBe(true);
    expect(stockTabs(trong).map((t) => `${t.name}:${t.n}`)).toEqual(['Tất cả:4', 'Đồ dùng:3', 'Đèn & vật nhỏ:1']);
    expect(tabCards(san, 'cay').map((c) => c.item.name)).toEqual(['Trúc cảnh', 'Mai', 'Tùng', 'Chậu lan']);
    // chỉ có cây → không tab "Đá & ao"
    expect(stockTabs(bagStock({ items: [], owned: { mai: 1 } }, 'ngoai')).map((t) => t.id)).toEqual(['tat-ca', 'cay']);
  });

  it('R-NHA-6: lật trang — số ô vừa một hàng, trang kẹp khi danh sách ngắn lại', () => {
    expect(perPage(300, 64, 8)).toBe(4);
    expect(perPage(20, 64, 8)).toBe(1);
    const list = Array.from({ length: 13 }, (_, i) => i);
    expect(pageSlice(list, 5, 0)).toEqual({ items: [0, 1, 2, 3, 4], page: 0, pages: 3 });
    expect(pageSlice(list, 5, 2)).toEqual({ items: [10, 11, 12], page: 2, pages: 3 });
    expect(pageSlice(list, 5, 9).page).toBe(2);
    expect(pageSlice(list, 5, -1).page).toBe(0);
    expect(pageSlice([], 5, 3)).toEqual({ items: [], page: 0, pages: 1 });
  });
});
