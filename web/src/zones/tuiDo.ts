/**
 * Túi đồ (R-TUI-1 — thiết kế 2026-11-15.35 `TuiDo-*`, 2026-11-16.4 `TuiDo-vuon-*`): từ số đã lưu (vườn `getGarden`, nhà
 * `getHome`, sách đang mượn `getProgress.book`, số dư, măng `getMang`) dựng các ngăn **chỉ xem** — 6 tab hình Hạt giống · Đồ
 * làm vườn (nông cụ + Phân bón × n) · Nông sản · Lâm sản (thiết kế 2026-11-16.13) · Sách · Trang trí; ngăn trống → dòng chỉ chỗ lấy.
 * Thuần (không DOM) — test `tuiDo.test.ts`. Tấm đáy: `ui/bagPanel.ts`.
 */
import { cleanHome, DECOR_ITEMS, inBag, placedCount } from './decor';
import type { MangKind } from './mang';
import { CROPS, type CropId, type Garden } from './vuon';
import { OPEN_SLOT_NAME, RING, type SlotId } from './vuonVong';

/** Chuỗi (chỉ tiếng Việt — R-HUD-4), tên khoá như `design/l10n/vi.arb`. */
export const BAG_TEXT = {
  bagTitle: 'Túi đồ',
  bagSeeds: 'Hạt giống',
  bagCrops: 'Nông sản',
  bagBooks: 'Sách',
  bagDecor: 'Đồ trang trí',
  bagSeedsEmpty: 'Chưa có hạt — mua ở Tạp hoá Khởi Nguyên Trấn',
  bagCropsEmpty: 'Kho trống — thu hoạch ở vườn Nhà của ta',
  bagBooksEmpty: 'Chưa mượn sách — mượn ở Tàng Thư Các',
  bagDecorEmpty: 'Chưa có đồ — mua ở Tạp hoá',
  bagForest: 'Lâm sản',
  bagForestEmpty: 'Hái măng ở rừng Trúc Lâm',
  bagForestEmptyTitle: 'Chưa có lâm sản',
  bagForestFoot: 'Chỉ xem — bán măng ở Măng bà bà (Trúc Lư)',
  bagForestWhere: 'Hái ở Trúc Lâm · bán cho Măng bà bà',
  bagClose: 'Đóng',
  bagReadOnly: 'Chỉ xem — gieo ở luống, bán ở thùng thu mua, đặt đồ khi trang trí',
  bagRead: 'Đọc',
  bagTabTools: 'Đồ làm vườn',
  bagTabDecor: 'Trang trí',
  bagToolsSection: 'Nông cụ',
  bagSuppliesSection: 'Vật tư',
  bagToolsHint: 'Nông cụ không hao, không có số. Phân bón × n — mua ở Tạp hoá trấn (tab Làm vườn).',
  bagFert: 'Phân bón',
} as const;

/** 6 tab hình (thiết kế 2026-11-16.4; Lâm sản thứ 4 — 2026-11-16.13): mã, nhãn, hình minh hoạ. */
export type BagTab = 'hat' | 'vuon' | 'nong' | 'lam' | 'sach' | 'trang';
export const BAG_TABS: readonly { tab: BagTab; label: string }[] = [
  { tab: 'hat', label: BAG_TEXT.bagSeeds },
  { tab: 'vuon', label: BAG_TEXT.bagTabTools },
  { tab: 'nong', label: BAG_TEXT.bagCrops },
  { tab: 'lam', label: BAG_TEXT.bagForest },
  { tab: 'sach', label: BAG_TEXT.bagBooks },
  { tab: 'trang', label: BAG_TEXT.bagTabDecor },
];

/** Nông cụ (không hao, không số): 5 ô của vòng công cụ trừ Hạt giống / Phân bón + Mở ô — theo thứ tự đặc tả. */
export const BAG_TOOLS: readonly { id: SlotId; name: string }[] = [
  ...RING.filter((t) => t.id !== 'hat' && t.id !== 'phan').map((t) => ({ id: t.id, name: t.name })),
  { id: 'mo', name: OPEN_SLOT_NAME },
];

/** Số đã lưu để dựng túi. `garden` / `home` null = chưa có / lỗi (coi như trống / vật khởi đầu). */
export interface BagSource {
  garden: Garden | null;
  /** câu trả lời `getHome` nguyên dạng (`{items, owned}`; bản cũ `{placed, owned}`) */
  home: unknown;
  /** cuốn đang mượn (tên + dòng phụ từ `BOOKS`), null = không mượn */
  book: { title: string; subtitle: string } | null;
  /** số dư Văn tiền; null = chưa biết (ví ẩn) */
  coins: number | null;
  /** túi Lâm sản (`getMang.bag` — R-MANG-3/5); thiếu = trống */
  forest?: Partial<Record<MangKind, number>> | null;
}

/** Một dòng Lâm sản (Măng / Măng to). */
export interface BagForest {
  kind: MangKind;
  name: string;
  n: number;
}

export interface BagCrop {
  crop: CropId;
  name: string;
  n: number;
}

export interface BagDecor {
  id: string;
  name: string;
  inBag: number;
  placed: number;
  /** "Trong túi n · Đang đặt m" (`bagDecorCounts`) */
  text: string;
}

export interface BagView {
  coins: number | null;
  seeds: { total: number; items: BagCrop[]; empty: string };
  crops: { total: number; items: BagCrop[]; empty: string };
  book: { title: string; empty: string; item: { title: string } | null };
  decor: { total: number; items: BagDecor[]; empty: string };
  /** ngăn Lâm sản (R-TUI-1, R-MANG-3) */
  forest: { total: number; items: BagForest[]; empty: string };
  /** ngăn Đồ làm vườn: số bao phân (vật tư) — nông cụ cố định `BAG_TOOLS` */
  fert: number;
}

const FOREST_NAME: Record<MangKind, string> = { mang: 'Măng', 'mang-to': 'Măng to' };

/** Lâm sản có trong túi theo thứ tự Măng → Măng to; số ≤ 0 bỏ. */
function forestList(bag: BagSource['forest']): BagForest[] {
  return (Object.keys(FOREST_NAME) as MangKind[]).filter((k) => (bag?.[k] ?? 0) > 0).map((k) => ({ kind: k, name: FOREST_NAME[k], n: Math.floor(bag![k]!) }));
}

/** Cây có trong túi / kho theo thứ tự bảng cây (R-VUON-3, R-VUON-7); số ≤ 0 hoặc mã lạ bỏ. */
function cropList(stock: Partial<Record<CropId, number>> | undefined): BagCrop[] {
  return CROPS.filter((c) => (stock?.[c.id] ?? 0) > 0).map((c) => ({ crop: c.id, name: c.name, n: Math.floor(stock![c.id]!) }));
}

/**
 * Đồ đã có (R-TUI-1, R-NHA-4) theo thứ tự danh mục, mỗi vật "Trong túi n · Đang đặt m" tính mọi nơi ở nhà; vật trong túi 0 mà đang đặt
 * vẫn hiện. Dữ liệu cũ (ô) → như `cleanHome` (ô cũ chưa chuyển tính là đang đặt).
 */
function decorList(raw: unknown): BagDecor[] {
  const home = cleanHome(raw);
  const legacy = Object.values(home.legacy);
  return DECOR_ITEMS.filter((it) => (home.owned[it.id] ?? 0) > 0).map((it) => {
    const placed = placedCount(home.items, it.id) + legacy.filter((id) => id === it.id).length;
    const bag = Math.max(0, inBag(home, it.id) - legacy.filter((id) => id === it.id).length);
    return { id: it.id, name: it.name, inBag: bag, placed, text: `Trong túi ${bag} · Đang đặt ${placed}` };
  });
}

const sum = (xs: readonly BagCrop[]): number => xs.reduce((a, x) => a + x.n, 0);

/** Túi đồ từ số đã lưu (R-TUI-1). */
export function bagView(s: BagSource): BagView {
  const seeds = cropList(s.garden?.seeds);
  const crops = cropList(s.garden?.barn);
  const decor = decorList(s.home);
  const forest = forestList(s.forest);
  return {
    forest: { total: forest.reduce((a, x) => a + x.n, 0), items: forest, empty: BAG_TEXT.bagForestEmpty },
    coins: s.coins === null ? null : Math.max(0, Math.floor(s.coins)),
    seeds: { total: sum(seeds), items: seeds, empty: BAG_TEXT.bagSeedsEmpty },
    crops: { total: sum(crops), items: crops, empty: BAG_TEXT.bagCropsEmpty },
    book: { title: BAG_TEXT.bagBooks, empty: BAG_TEXT.bagBooksEmpty, item: s.book ? { title: `${s.book.title} · ${s.book.subtitle}` } : null },
    decor: { total: decor.length, items: decor, empty: BAG_TEXT.bagDecorEmpty },
    fert: Math.max(0, Math.floor(s.garden?.fert ?? 0)),
  };
}
