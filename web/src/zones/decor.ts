/**
 * Nhà của ta (我家): danh mục đồ trang trí + luật đặt / thay / gỡ vào ô (R-NHA-2, R-NHA-4) + làm sạch nhà đã lưu
 * (R-NHA-3) + giá ở Tạp hoá (R-TIEN-4 — **một nguồn giá**, Flutter nhận qua `openShop`; luật mua ở Dart `wallet.dart`).
 * Thuần dữ liệu — không three, không DOM. Vị trí ô ở đặc tả cảnh (`decorSlots`, `scene/spec.ts`); lưu ở
 * Flutter (`getHome` / `setDecor`, docs/bridge.md).
 */

/** Loại ô — cùng chuỗi với `DECOR_SLOT_KINDS` ở `scene/spec.ts` (hai lớp không import nhau). */
export type DecorSlotKind = 'vuon' | 'san' | 'trong';

/** Ô như cảnh khai báo (chỉ phần luật cần). */
export interface DecorSlot {
  id: string;
  kind: DecorSlotKind;
}

export interface DecorItem {
  /** mã ASCII — Flutter lưu mã này; không đổi mã vật đã phát hành */
  id: string;
  /** tên tiếng Việt trên thẻ danh mục */
  name: string;
  /** một chữ Hán trên thẻ */
  han: string;
  /** loại ô nhận vật này */
  slot: DecorSlotKind;
  /** vật to chặn người đi (R-NHA-2) */
  blocks: boolean;
  /** giá ở Tạp hoá, Văn tiền (R-TIEN-4) */
  price: number;
  /** giá viết số chữ Hán, vd. "一百六十文" (thẻ Tạp hoá) */
  priceHan: string;
}

const DIGITS = '零一二三四五六七八九';

/** Số chữ Hán của giá + 文 (0 < n < 10 000): 30 → 三十文, 160 → 一百六十文, 105 → 一百零五文, 15 → 十五文. */
export function hanPrice(n: number): string {
  const units: [number, string][] = [[1000, '千'], [100, '百'], [10, '十'], [1, '']];
  let out = '';
  let zero = false;
  for (const [u, name] of units) {
    const d = Math.floor(n / u) % 10;
    if (d === 0) {
      if (out) zero = true;
      continue;
    }
    if (zero) out += '零';
    zero = false;
    out += d === 1 && u === 10 && !out ? name : DIGITS[d] + name;
  }
  return out + '文';
}

const item = (id: string, name: string, han: string, slot: DecorSlotKind, price: number, blocks = false): DecorItem => ({
  id,
  name,
  han,
  slot,
  blocks,
  price,
  priceHan: hanPrice(price),
});

/** Danh mục 13 vật theo thứ tự hiện trên bảng (R-NHA-4) + giá Tạp hoá (R-TIEN-4, thiết kế 2026-11-14.12). */
export const DECOR_ITEMS: readonly DecorItem[] = [
  item('truc-canh', 'Trúc cảnh', '竹', 'vuon', 30),
  item('mai', 'Mai', '梅', 'vuon', 60),
  item('tung', 'Tùng', '松', 'vuon', 80),
  item('da-thai-ho', 'Đá Thái Hồ', '石', 'vuon', 160, true),
  item('ao-sen', 'Ao sen', '蓮', 'vuon', 200, true),
  item('den-long', 'Đèn lồng', '燈', 'san', 30),
  item('ban-tra', 'Bàn trà', '茶', 'san', 100, true),
  item('chau-lan', 'Chậu lan', '蘭', 'san', 50),
  item('lu-huong', 'Lư hương', '爐', 'san', 70),
  item('tranh-chu', 'Tranh chữ', '書', 'trong', 40),
  item('ke-sach', 'Kệ sách', '架', 'trong', 120, true),
  item('an-doc', 'Án đọc', '案', 'trong', 90),
  item('binh-phong', 'Bình phong', '屏', 'trong', 150, true),
];

/** Vật sở hữu sẵn khi mới cài app (R-NHA-4) — trùng `starterDecor` ở Dart `wallet.dart`. */
export const STARTER_DECOR: readonly string[] = ['truc-canh', 'den-long', 'tranh-chu'];

const BY_ID = new Map(DECOR_ITEMS.map((i) => [i.id, i]));

export function decorItem(id: string): DecorItem | undefined {
  return BY_ID.get(id);
}

/** Nhà của một người chơi: ô → vật đang đặt, và các vật sở hữu. Hai phần lưu riêng (R-NHA-4). */
export interface HomeState {
  placed: Readonly<Record<string, string>>;
  owned: readonly string[];
}

/** Nhà mới cài app: mọi ô trống (R-NHA-3), sở hữu vật khởi đầu (R-NHA-4). */
export const NEW_HOME: HomeState = { placed: {}, owned: STARTER_DECOR };

/** Vật đặt được vào ô loại `kind`: hợp loại + đã sở hữu, theo thứ tự danh mục. */
export function itemsForSlot(home: HomeState, kind: DecorSlotKind): DecorItem[] {
  const owned = new Set(home.owned);
  return DECOR_ITEMS.filter((i) => i.slot === kind && owned.has(i.id));
}

/** Một thẻ của danh mục trang trí: vật + đã có chưa (thẻ khoá "Mua ở Tạp hoá" — R-NHA-4). */
export interface CatalogEntry {
  item: DecorItem;
  owned: boolean;
}

/** Mọi vật hợp loại ô `kind`, cả vật chưa có: đã có trước (thứ tự danh mục), chưa có sau (rẻ → đắt) — R-NHA-4. */
export function catalogForSlot(home: HomeState, kind: DecorSlotKind): CatalogEntry[] {
  const owned = new Set(home.owned);
  const fit = DECOR_ITEMS.filter((i) => i.slot === kind);
  return [
    ...fit.filter((i) => owned.has(i.id)).map((item) => ({ item, owned: true })),
    ...fit
      .filter((i) => !owned.has(i.id))
      .sort((a, b) => a.price - b.price)
      .map((item) => ({ item, owned: false })),
  ];
}

export type PlaceError = 'unknownItem' | 'notOwned' | 'wrongKind';
export type PlaceResult = { ok: true; home: HomeState } | { ok: false; reason: PlaceError };

/**
 * Đặt vật `itemId` vào ô (ô trống → đặt, có vật → thay), `null` = gỡ (R-NHA-2). Không đụng `owned`: vật bị thay / gỡ
 * vẫn sở hữu (R-NHA-4). Một vật đặt được ở nhiều ô cùng lúc.
 */
export function placeDecor(home: HomeState, slot: DecorSlot, itemId: string | null): PlaceResult {
  if (itemId === null) {
    const { [slot.id]: _gone, ...rest } = home.placed;
    return { ok: true, home: { ...home, placed: rest } };
  }
  const it = decorItem(itemId);
  if (!it) return { ok: false, reason: 'unknownItem' };
  if (!home.owned.includes(itemId)) return { ok: false, reason: 'notOwned' };
  if (it.slot !== slot.kind) return { ok: false, reason: 'wrongKind' };
  return { ok: true, home: { ...home, placed: { ...home.placed, [slot.id]: itemId } } };
}

/**
 * Nhà đã lưu (từ Flutter, có thể của bản app cũ) → nhà dùng được với cảnh hiện tại (R-NHA-3): bỏ ô không còn trong
 * cảnh, vật không còn trong danh mục, vật sai loại ô; dữ liệu hỏng → nhà mới. Sở hữu (R-NHA-4): đọc `owned`, bỏ mã lạ;
 * thiếu `owned` (bản cũ) → vật khởi đầu + vật đang đặt.
 */
export function cleanHome(raw: unknown, slots: readonly DecorSlot[]): HomeState {
  const placedRaw = raw && typeof raw === 'object' ? (raw as { placed?: unknown }).placed : undefined;
  const placed: Record<string, string> = {};
  if (placedRaw && typeof placedRaw === 'object') {
    const kindOf = new Map(slots.map((s) => [s.id, s.kind]));
    for (const [slotId, itemId] of Object.entries(placedRaw as Record<string, unknown>)) {
      const it = typeof itemId === 'string' ? decorItem(itemId) : undefined;
      if (it && kindOf.get(slotId) === it.slot) placed[slotId] = it.id;
    }
  }
  const ownedRaw = raw && typeof raw === 'object' ? (raw as { owned?: unknown }).owned : undefined;
  const owned = Array.isArray(ownedRaw)
    ? ownedRaw.filter((id): id is string => typeof id === 'string' && decorItem(id) !== undefined)
    : [...STARTER_DECOR, ...Object.values(placed).filter((id) => !STARTER_DECOR.includes(id))];
  return { placed, owned: [...new Set(owned)] };
}
