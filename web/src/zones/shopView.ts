/**
 * Tạp hoá 雜貨 bản web (R-TIEN-4, R-TIEN-6 — chế độ thử R-TIEN-7): trạng thái thẻ, tab + nhóm, dải nghèo / đã mua hết, chữ hộp
 * xác nhận + tấm "Đã mua". Bản TS của phần logic `app/lib/lesson/shop_screen.dart` / `shop_parts.dart` / `shop_confirm.dart`;
 * chuỗi `shop*` `slot*` chép đúng `design/l10n/vi.arb`. Thuần — không DOM (dựng: `ui/shopPanel.ts`).
 */
import type { DecorSlotKind } from './decor';
import { CROPS, cropOf, type Crop } from './vuon';
import { formatCoins } from './wallet';

/** Nhóm hàng: ba loại ô đồ trang trí + hạt giống Vườn rau (R-VUON-9). */
export type ShopKind = DecorSlotKind | 'hat';
export type ShopTab = 'all' | ShopKind;

/** Một món bày bán (`DecorItem` hoặc hạt giống). */
export interface ShopEntry {
  id: string;
  name: string;
  slot: ShopKind;
  price: number;
}

/** Tên loại ô (`slotGarden`, `slotYard`, `slotIndoor`) + nhóm hạt (`slotSeed` — chờ thiết kế). */
export const SLOT_NAME: Readonly<Record<ShopKind, string>> = { vuon: 'Vườn', san: 'Sân', trong: 'Trong nhà', hat: 'Hạt giống' };

const KINDS: readonly ShopKind[] = ['vuon', 'san', 'trong', 'hat'];

/** Thẻ hạt giống (R-VUON-9): mã `hat-<cây>`, giá 1 hạt — như `seedShopItems` ở Dart. */
export const SEED_ITEMS: readonly ShopEntry[] = CROPS.map((c) => ({ id: `hat-${c.id}`, name: `Hạt ${c.name}`, slot: 'hat', price: c.seed }));

/** Cây của thẻ hạt; thẻ khác → `undefined`. */
export function seedCrop(item: ShopEntry): Crop | undefined {
  return item.slot === 'hat' && item.id.startsWith('hat-') ? cropOf(item.id.slice(4)) : undefined;
}

/** Tab lọc theo thứ tự (`shopTabAll` + `slot*`). */
export const SHOP_TABS: readonly { tab: ShopTab; label: string }[] = [
  { tab: 'all', label: 'Tất cả' },
  ...KINDS.map((k) => ({ tab: k, label: SLOT_NAME[k] })),
];

export type CardState = 'buy' | 'owned' | 'short';

export interface CardView {
  state: CardState;
  /** chữ nút: "Mua" (`shopBuy`) · "Đã có" (`shopOwned`) · "Còn thiếu n" (`shopShort`) */
  text: string;
  short: number;
}

export function cardState(item: ShopEntry, owned: readonly string[], balance: number): CardView {
  if (item.slot !== 'hat' && owned.includes(item.id)) return { state: 'owned', text: 'Đã có', short: 0 };
  if (balance < item.price) {
    const short = item.price - balance;
    return { state: 'short', text: `Còn thiếu ${formatCoins(short)}`, short };
  }
  return { state: 'buy', text: 'Mua', short: 0 };
}

export interface ShopCard extends CardView {
  item: ShopEntry;
  /** đang chọn (hộp xác nhận mở) → viền ngoài `gold` */
  picked: boolean;
}

export interface ShopGroup {
  kind: ShopKind;
  /** tiêu đề nhóm (chỉ ở tab "Tất cả"); `null` = tab một loại */
  title: string | null;
  cards: ShopCard[];
}

/** Lưới theo tab: "Tất cả" → ba nhóm Vườn · Sân · Trong nhà; một loại → một nhóm không tiêu đề. Thứ tự danh mục. */
export function shopGroups(items: readonly ShopEntry[], owned: readonly string[], balance: number, tab: ShopTab, picked: string | null): ShopGroup[] {
  const kinds = tab === 'all' ? KINDS : [tab];
  return kinds
    .map((kind) => ({
      kind,
      title: tab === 'all' ? SLOT_NAME[kind] : null,
      cards: items.filter((i) => i.slot === kind).map((item) => ({ item, picked: item.id === picked, ...cardState(item, owned, balance) })),
    }))
    .filter((g) => g.cards.length > 0);
}

/** Dải trên lưới: đã có hết → `allBought`; không đủ tiền cho vật rẻ nhất còn thiếu → `poor`; còn lại không dải. */
export function shopBanner(items: readonly ShopEntry[], owned: readonly string[], balance: number): 'poor' | 'allBought' | null {
  const missing = items.filter((i) => i.slot !== 'hat' && !owned.includes(i.id));
  if (missing.length === 0) return 'allBought';
  return missing.every((i) => balance < i.price) ? 'poor' : null;
}

/** Chữ dải nghèo (`shopPoorHint`) chia phần thường / đậm. */
export const POOR_HINT: readonly [string, boolean][] = [
  ['Học bộ mới ', false], ['+10', true], [' · ôn đúng hạn ', false], ['+5', true], [' · xong nhiệm vụ ngày ', false], ['+20', true], ['.', false],
];

/** Chữ dải đã mua hết (`shopAllBought`): phần đậm + phần thường. */
export const ALL_BOUGHT: readonly [string, string] = ['Đã có đủ 13 món.', ' Văn tiền để dành cho đồ mới sắp về (đồ mặc, thức ăn linh thú).'];

export interface ConfirmView {
  /** "Mua {item} với {n} Văn tiền?" (`shopConfirm`) */
  before: string;
  after: string;
  /** `shopConfirmSub` */
  sub: string;
  /** Đang có / Giá / Còn lại (`shopHave`, `shopPrice`, `shopAfter`) */
  rows: [string, string][];
  /** `shopBuyFor` */
  buy: string;
}

export function confirmView(item: ShopEntry, balance: number): ConfirmView {
  const price = formatCoins(item.price);
  return {
    before: `Mua ${item.name}`,
    after: `với ${price} Văn tiền?`,
    sub: item.slot === 'hat' ? 'Mỗi lần mua 1 hạt vào túi hạt · gieo ở Vườn rau' : `Đặt ở ô ${SLOT_NAME[item.slot]} · mua một lần, đặt được nhiều ô`,
    rows: [
      ['Đang có', formatCoins(balance)],
      ['Giá', `−${price}`],
      ['Còn lại', formatCoins(balance - item.price)],
    ],
    buy: `Mua · ${price}`,
  };
}

/** Tấm "Đã mua" 3 s (`shopBought`, `shopBoughtSub`) — không tự đưa về nhà. */
export function boughtView(item: ShopEntry): { title: string; sub: string } {
  const sub = item.slot === 'hat' ? 'Về Vườn rau để gieo — hạt ở trong túi hạt.' : `Về nhà để đặt — chạm ô ${SLOT_NAME[item.slot]} khi trang trí.`;
  return { title: `Đã mua ${item.name}`, sub };
}
