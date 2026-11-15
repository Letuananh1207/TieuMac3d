/**
 * Tạp hoá 雜貨 bản web (R-TIEN-4, R-TIEN-6 — chế độ thử R-TIEN-7; V-69 theo cái, thiết kế 2026-11-15.42): trạng thái thẻ, tab + nhóm, dải nghèo, chữ hộp
 * xác nhận + tấm "Đã mua". Bản TS của phần logic `app/lib/lesson/shop_screen.dart` / `shop_parts.dart` / `shop_confirm.dart`;
 * chuỗi `shop*` `slot*` chép đúng `design/l10n/vi.arb`. Thuần — không DOM (dựng: `ui/shopPanel.ts`).
 */
import { DECOR_ITEMS, type DecorCounts, type DecorWhere } from './decor';
import { CROPS, cropOf, SEED_COUNTS, type Crop, type CropId } from './vuon';
import { FERT_ITEM, FERT_PRICE } from './vuonCham';
import { growText } from './vuonHud';
import { formatCoins } from './wallet';

/** Nhóm hàng: đồ trang trí ngoài trời / trong nhà + hạt giống Vườn rau (R-VUON-9). */
export type ShopKind = DecorWhere | 'hat';
export type ShopTab = 'all' | ShopKind;

/** Một món bày bán (`DecorItem` hoặc hạt giống). */
export interface ShopEntry {
  id: string;
  name: string;
  slot: ShopKind;
  price: number;
}

/** Tên tab / nhóm (`shopTabOutdoor`, `shopTabIndoor`, `shopTabGarden` — V-73 2026-11-16.4: "Hạt giống" → "Làm vườn"). */
export const SLOT_NAME: Readonly<Record<ShopKind, string>> = { ngoai: 'Ngoài trời', trong: 'Trong nhà', hat: 'Làm vườn' };

const KINDS: readonly ShopKind[] = ['ngoai', 'trong', 'hat'];

/** Thẻ đồ trang trí từ danh mục (một nguồn giá — `decor.ts`). */
export const DECOR_ENTRIES: readonly ShopEntry[] = DECOR_ITEMS.map((i) => ({ id: i.id, name: i.name, slot: i.where, price: i.price }));

/** Thẻ hạt giống (R-VUON-9): mã `hat-<cây>`, giá 1 hạt — như `seedShopItems` ở Dart. */
export const FERT_ENTRY: ShopEntry = { id: FERT_ITEM, name: 'Phân bón', slot: 'hat', price: FERT_PRICE };

/** Tab Làm vườn: thẻ **Phân bón** đứng đầu (mã `phan`, 10 Văn / bao — R-VUON-12; thiết kế 2026-11-16.4) rồi 8 thẻ hạt (như Dart). */
export const SEED_ITEMS: readonly ShopEntry[] = [FERT_ENTRY, ...CROPS.map((c): ShopEntry => ({ id: `hat-${c.id}`, name: `Hạt ${c.name}`, slot: 'hat', price: c.seed }))];

/** Dòng phụ đầu Tạp hoá (`shopSubtitle` / `shopSubtitleGarden`). */
export const shopSubtitle = (garden: boolean): string =>
  garden ? 'Đồ trang trí Nhà của ta · hạt giống, phân bón cho Vườn rau' : 'Đồ trang trí Nhà của ta · mỗi cái đặt một chỗ';

/** Thẻ Phân bón: dòng ngắn thay thời gian lớn (`shopFertilizerShort`). */
export const FERT_SHORT = 'chín nhanh gấp đôi';

/** Túi mục vườn: hạt theo mã cây + `phan` = số bao phân. */
export type GardenBag = Partial<Record<CropId | typeof FERT_ITEM, number>>;

export const isFertEntry = (item: ShopEntry): boolean => item.slot === 'hat' && item.id === FERT_ITEM;

/** Khoá túi của thẻ mục vườn: mã cây (hạt) · `phan`; đồ trang trí → `undefined`. */
export function bagKey(item: ShopEntry): CropId | typeof FERT_ITEM | undefined {
  return seedCrop(item)?.id ?? (isFertEntry(item) ? FERT_ITEM : undefined);
}

/** Cây của thẻ hạt; thẻ khác → `undefined`. */
export function seedCrop(item: ShopEntry): Crop | undefined {
  return item.slot === 'hat' && item.id.startsWith('hat-') ? cropOf(item.id.slice(4)) : undefined;
}

/** Tab lọc theo thứ tự (`shopTabAll` + `slot*`). */
export const SHOP_TABS: readonly { tab: ShopTab; label: string }[] = [
  { tab: 'all', label: 'Tất cả' },
  ...KINDS.map((k) => ({ tab: k, label: SLOT_NAME[k] })),
];

export type CardState = 'buy' | 'short';

export interface CardView {
  state: CardState;
  /** chữ nút: luôn "Mua" (`shopBuy`) · thiếu tiền "Còn thiếu n" (`shopShort`) — V-69 bỏ "Đã có" */
  text: string;
  short: number;
}

export function cardState(item: ShopEntry, balance: number): CardView {
  if (balance < item.price) {
    const short = item.price - balance;
    return { state: 'short', text: `Còn thiếu ${formatCoins(short)}`, short };
  }
  return { state: 'buy', text: 'Mua', short: 0 };
}

/** Số cái của đồ trang trí: sở hữu (đang đặt + trong túi) + đang đặt. */
export interface DecorStock {
  owned: DecorCounts;
  placed: DecorCounts;
}

/** Dòng thẻ đồ trang trí (R-TIEN-4): "Trong túi: n · Đang đặt: m" (`shopInBagPlaced`); chưa có cái nào → "Chưa có" (`shopNotOwned`). */
export function stockLine(item: ShopEntry, stock: DecorStock): { inBag: number; placed: number; text: string; has: boolean } | null {
  if (item.slot === 'hat') return null;
  const placed = stock.placed[item.id] ?? 0;
  const inBag = Math.max(0, (stock.owned[item.id] ?? 0) - placed);
  const has = inBag + placed > 0;
  return { inBag, placed, has, text: has ? `Trong túi: ${inBag} · Đang đặt: ${placed}` : 'Chưa có' };
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

/** Lưới theo tab: "Tất cả" → nhóm Ngoài trời · Trong nhà · Hạt giống; một loại → một nhóm không tiêu đề. Thứ tự danh mục. */
export function shopGroups(items: readonly ShopEntry[], balance: number, tab: ShopTab, picked: string | null): ShopGroup[] {
  const kinds = tab === 'all' ? KINDS : [tab];
  return kinds
    .map((kind) => ({
      kind,
      title: tab === 'all' ? SLOT_NAME[kind] : null,
      cards: items.filter((i) => i.slot === kind).map((item) => ({ item, picked: item.id === picked, ...cardState(item, balance) })),
    }))
    .filter((g) => g.cards.length > 0);
}

/** Dải trên lưới: không đủ tiền cho đồ trang trí rẻ nhất → `poor`; còn lại không dải (V-69 bỏ "đã mua hết" — mua lặp được). */
export function shopBanner(items: readonly ShopEntry[], balance: number): 'poor' | null {
  const decor = items.filter((i) => i.slot !== 'hat');
  return decor.length > 0 && decor.every((i) => balance < i.price) ? 'poor' : null;
}

/** Chữ dải nghèo (`shopPoorHint`) chia phần thường / đậm. */
export const POOR_HINT: readonly [string, boolean][] = [
  ['Học bộ mới ', false], ['+10', true], [' · ôn đúng hạn ', false], ['+5', true], [' · xong nhiệm vụ ngày ', false], ['+20', true], ['.', false],
];


export interface ConfirmView {
  /** "Mua {item}" (`shopConfirm`) · hạt: "Mua Hạt {cây}" (`shopSeedConfirm`) */
  before: string;
  /** "với {n} Văn tiền?" · hạt: "· {giá} Văn tiền / hạt" */
  after: string;
  /** `shopConfirmSub` · hạt: túi hạt + số đang có */
  sub: string;
  /** Đang có / Giá (hạt: "Giá ({k} hạt)") / Còn lại (`shopHave`, `shopPrice`, `shopAfter`); thiếu → Còn lại "—" */
  rows: [string, string][];
  /** `shopBuyFor` · thiếu cho số hạt đã chọn → "Còn thiếu n" */
  buy: string;
  /** còn thiếu (chỉ hạt × 5 / × 10 mới thiếu được — thẻ thiếu cả 1 hạt không mở hộp) */
  short: number;
}

/** Số hạt chọn được trong hộp xác nhận (R-VUON-9: × 1 · × 5 · × 10; mặc định × 1). */
export const SEED_QTY: readonly number[] = SEED_COUNTS;

/** Dòng trên lưới tab Hạt giống (`shopSeedSub` — sửa theo luật chọn số hạt, xem gui_thiet_ke_2026-11-15). */
export const SEED_GRID_HINT = 'Hạt vào túi hạt · gieo ở Vườn rau · mua × 1 · × 5 · × 10, mua được nhiều lần';

/** Thẻ hạt: "Trong túi: n" (`shopInBag`) + thời gian lớn; thẻ đồ trang trí → `null`. */
export function seedLine(item: ShopEntry, bag: GardenBag): { inBag: number; text: string; time: string | null } | null {
  const k = bagKey(item);
  if (!k) return null;
  const inBag = bag[k] ?? 0;
  const c = seedCrop(item);
  return { inBag, text: `Trong túi: ${inBag}`, time: c ? growText(c) : null };
}

/** Hộp xác nhận; hạt: [seed] = số hạt đang chọn + số đang có trong túi; đồ trang trí: [stock] = số cái (dòng "Đang có: n trong túi, m đang đặt"). */
export function confirmView(item: ShopEntry, balance: number, seed?: { count: number; inBag: number }, stock?: DecorStock): ConfirmView {
  const unit = formatCoins(item.price);
  const k = bagKey(item) ? (seed?.count ?? 1) : 1;
  const fert = isFertEntry(item);
  const per = fert ? 'bao' : 'hạt';
  const total = item.price * k;
  const short = Math.max(0, total - balance);
  const isSeed = item.slot === 'hat';
  return {
    before: `Mua ${item.name}`,
    after: isSeed ? `· ${unit} Văn tiền / ${per}` : `với ${unit} Văn tiền?`,
    sub: fert ? `Phân vào túi · bón ở Vườn rau cho mau lớn. Trong túi: ${seed?.inBag ?? 0}.` : isSeed ? `Hạt vào túi hạt · gieo ở Vườn rau. Trong túi: ${seed?.inBag ?? 0}.` : decorConfirmSub(item, stock),
    rows: [
      ['Đang có', formatCoins(balance)],
      [isSeed ? `Giá (${k} ${per})` : 'Giá', `−${formatCoins(total)}`],
      ['Còn lại', short > 0 ? '—' : formatCoins(balance - total)],
    ],
    buy: short > 0 ? `Còn thiếu ${formatCoins(short)}` : `Mua · ${formatCoins(total)}`,
    short,
  };
}
/** `shopDecorConfirmSub`: "Mỗi lần mua 1 cái vào túi · đặt ở {sân / gian trong} Nhà của ta. Đang có: n trong túi, m đang đặt." */
function decorConfirmSub(item: ShopEntry, stock?: DecorStock): string {
  const line = stock ? stockLine(item, stock) : null;
  const place = item.slot === 'trong' ? 'gian trong' : 'sân';
  return `Mỗi lần mua 1 cái vào túi · đặt ở ${place} Nhà của ta. Đang có: ${line?.inBag ?? 0} trong túi, ${line?.placed ?? 0} đang đặt.`;
}

/** Tấm "Đã mua" 3 s (`shopBought`, `shopDecorBoughtSub`) — không tự đưa về nhà; [inBag] = số cái trong túi sau khi mua. */
export function boughtView(item: ShopEntry, inBag = 1): { title: string; sub: string } {
  const sub = isFertEntry(item) ? 'Về Vườn rau để bón — phân ở trong túi.' : item.slot === 'hat' ? 'Về Vườn rau để gieo — hạt ở trong túi hạt.' : `Trong túi ${inBag} · về nhà để đặt`;
  return { title: `Đã mua ${item.name}`, sub };
}
