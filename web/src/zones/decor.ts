/**
 * Nhà của ta (我家): danh mục đồ trang trí + luật đặt / thay / gỡ vào ô (R-NHA-2, R-NHA-4) + làm sạch nhà đã lưu
 * (R-NHA-3). Thuần dữ liệu — không three, không DOM. Vị trí ô ở đặc tả cảnh (`decorSlots`, `scene/spec.ts`); lưu ở
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
  /** giá (tiền tệ riêng — chưa có, R-NHA-4); 0 = chưa định giá */
  price: number;
}

const item = (id: string, name: string, han: string, slot: DecorSlotKind, blocks = false): DecorItem => ({ id, name, han, slot, blocks, price: 0 });

/** Danh mục 13 vật theo thứ tự hiện trên bảng (R-NHA-4). */
export const DECOR_ITEMS: readonly DecorItem[] = [
  item('truc-canh', 'Trúc cảnh', '竹', 'vuon'),
  item('mai', 'Mai', '梅', 'vuon'),
  item('tung', 'Tùng', '松', 'vuon'),
  item('da-thai-ho', 'Đá Thái Hồ', '石', 'vuon', true),
  item('ao-sen', 'Ao sen', '蓮', 'vuon', true),
  item('den-long', 'Đèn lồng', '燈', 'san'),
  item('ban-tra', 'Bàn trà', '茶', 'san', true),
  item('chau-lan', 'Chậu lan', '蘭', 'san'),
  item('lu-huong', 'Lư hương', '爐', 'san'),
  item('tranh-chu', 'Tranh chữ', '書', 'trong'),
  item('ke-sach', 'Kệ sách', '架', 'trong', true),
  item('an-doc', 'Án đọc', '案', 'trong'),
  item('binh-phong', 'Bình phong', '屏', 'trong', true),
];

const BY_ID = new Map(DECOR_ITEMS.map((i) => [i.id, i]));

export function decorItem(id: string): DecorItem | undefined {
  return BY_ID.get(id);
}

/** Nhà của một người chơi: ô → vật đang đặt, và các vật sở hữu. Hai phần lưu riêng (R-NHA-4). */
export interface HomeState {
  placed: Readonly<Record<string, string>>;
  owned: readonly string[];
}

/** Giai đoạn chưa có tiền tệ: sở hữu sẵn mọi vật (R-NHA-4). */
const ALL_OWNED: readonly string[] = DECOR_ITEMS.map((i) => i.id);

/** Nhà mới cài app: mọi ô trống (R-NHA-3). */
export const NEW_HOME: HomeState = { placed: {}, owned: ALL_OWNED };

/** Vật đặt được vào ô loại `kind`: hợp loại + đã sở hữu, theo thứ tự danh mục. */
export function itemsForSlot(home: HomeState, kind: DecorSlotKind): DecorItem[] {
  const owned = new Set(home.owned);
  return DECOR_ITEMS.filter((i) => i.slot === kind && owned.has(i.id));
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
 * cảnh, vật không còn trong danh mục, vật sai loại ô; dữ liệu hỏng → nhà mới. Sở hữu: giai đoạn này luôn đủ mọi vật.
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
  return { placed, owned: ALL_OWNED };
}
