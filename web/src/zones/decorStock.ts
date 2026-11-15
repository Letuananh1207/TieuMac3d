/**
 * Dải kho trang trí (R-NHA-4, R-NHA-6 — V-75, bố cục học dải kho 摩尔 bản web): **chỉ đồ còn trong túi** của nơi đang ở, tab nhóm
 * (Tất cả + nhóm có món), lật trang theo số ô vừa một hàng. Thuần dữ liệu — không DOM; dựng ở `ui/decorPanel.ts`.
 */
import { bagCards, DECOR_ITEMS, type DecorItem, type DecorWhere, type HomeState } from './decor';

/** Nhóm đồ trang trí (tab của dải kho). */
export type DecorGroup = 'cay' | 'non-bo' | 'do-dung' | 'vat-nho';

/** Nhóm theo thứ tự tab + tên tiếng Việt (R-HUD-4). */
export const DECOR_GROUPS: readonly { id: DecorGroup; name: string }[] = [
  { id: 'cay', name: 'Cây cảnh' },
  { id: 'non-bo', name: 'Đá & ao' },
  { id: 'do-dung', name: 'Đồ dùng' },
  { id: 'vat-nho', name: 'Đèn & vật nhỏ' },
];

/** Nhóm của mỗi vật trong danh mục (`zones/decor.ts` `DECOR_ITEMS`). */
export const GROUP_OF: Readonly<Record<string, DecorGroup>> = {
  'truc-canh': 'cay',
  mai: 'cay',
  tung: 'cay',
  'chau-lan': 'cay',
  'da-thai-ho': 'non-bo',
  'ao-sen': 'non-bo',
  'ban-tra': 'do-dung',
  'ke-sach': 'do-dung',
  'an-doc': 'do-dung',
  'binh-phong': 'do-dung',
  'den-long': 'vat-nho',
  'lu-huong': 'vat-nho',
  'tranh-chu': 'vat-nho',
};

/** Một ô trong dải kho: vật còn trong túi (> 0) + số đang đặt (mọi nơi). */
export interface StockCard {
  item: DecorItem;
  inBag: number;
  placed: number;
}

/** Tab "Tất cả" hoặc một nhóm. */
export type StockTab = 'tat-ca' | DecorGroup;

export interface StockTabInfo {
  id: StockTab;
  name: string;
  /** số vật (ô) trong tab */
  n: number;
}

/**
 * Ô của dải kho ở một nơi (R-NHA-4): chỉ vật hợp nơi **còn trong túi** (ẩn vật chưa mua, vật đã đặt hết), thứ tự danh mục. [held] như
 * `bagCards` — vật đang cầm đã lấy khỏi túi nên trong túi trừ 1.
 */
export function bagStock(home: HomeState, where: DecorWhere, held?: { item: string; lifted: boolean } | null): StockCard[] {
  const bag = bagCards(home, where, held).filter((c) => c.state === 'bag');
  const order = new Map(DECOR_ITEMS.map((it, i) => [it.id, i]));
  return bag
    .map(({ item, inBag, placed }) => ({ item, inBag, placed }))
    .sort((a, b) => (order.get(a.item.id) ?? 0) - (order.get(b.item.id) ?? 0));
}

/** Tab của dải (R-NHA-4): "Tất cả" + nhóm có ít nhất một ô, thứ tự `DECOR_GROUPS`; túi trống → không tab. */
export function stockTabs(cards: readonly StockCard[]): StockTabInfo[] {
  if (!cards.length) return [];
  const tabs: StockTabInfo[] = [{ id: 'tat-ca', name: 'Tất cả', n: cards.length }];
  for (const g of DECOR_GROUPS) {
    const n = cards.filter((c) => GROUP_OF[c.item.id] === g.id).length;
    if (n) tabs.push({ id: g.id, name: g.name, n });
  }
  return tabs;
}

/** Ô của một tab. */
export function tabCards(cards: readonly StockCard[], tab: StockTab): StockCard[] {
  return tab === 'tat-ca' ? [...cards] : cards.filter((c) => GROUP_OF[c.item.id] === tab);
}

/** Số ô vừa một hàng rộng [width] (ô [cell], khe [gap]) — ít nhất 1. */
export function perPage(width: number, cell: number, gap: number): number {
  return Math.max(1, Math.floor((width + gap) / (cell + gap)));
}

/** Một trang của hàng ô: trang bị kẹp vào [0, pages − 1] (đổi tab / cất đồ làm danh sách ngắn lại). */
export function pageSlice<T>(list: readonly T[], per: number, page: number): { items: T[]; page: number; pages: number } {
  const n = Math.max(1, Math.floor(per));
  const pages = Math.max(1, Math.ceil(list.length / n));
  const p = Math.min(pages - 1, Math.max(0, Math.floor(page)));
  return { items: list.slice(p * n, p * n + n), page: p, pages };
}
