/**
 * Túi đồ (R-TUI-1 — thiết kế 2026-11-15.35 `TuiDo-*`): từ số đã lưu (vườn `getGarden`, nhà `getHome`, sách đang mượn
 * `getProgress.book`, số dư) dựng 4 mục **chỉ xem** — Hạt giống, Nông sản, Sách, Đồ trang trí; mục trống → dòng chỉ chỗ lấy.
 * Thuần (không DOM) — test `tuiDo.test.ts`. Tấm đáy: `ui/bagPanel.ts`.
 */
import { cleanHome, DECOR_ITEMS, inBag, placedCount } from './decor';
import { CROPS, type CropId, type Garden } from './vuon';

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
  bagClose: 'Đóng',
  bagReadOnly: 'Chỉ xem — gieo ở luống, bán ở thùng thu mua, đặt đồ khi trang trí',
  bagRead: 'Đọc',
} as const;

/** Số đã lưu để dựng túi. `garden` / `home` null = chưa có / lỗi (coi như trống / vật khởi đầu). */
export interface BagSource {
  garden: Garden | null;
  /** câu trả lời `getHome` nguyên dạng (`{items, owned}`; bản cũ `{placed, owned}`) */
  home: unknown;
  /** cuốn đang mượn (tên + dòng phụ từ `BOOKS`), null = không mượn */
  book: { title: string; subtitle: string } | null;
  /** số dư Văn tiền; null = chưa biết (ví ẩn) */
  coins: number | null;
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
  return {
    coins: s.coins === null ? null : Math.max(0, Math.floor(s.coins)),
    seeds: { total: sum(seeds), items: seeds, empty: BAG_TEXT.bagSeedsEmpty },
    crops: { total: sum(crops), items: crops, empty: BAG_TEXT.bagCropsEmpty },
    book: { title: BAG_TEXT.bagBooks, empty: BAG_TEXT.bagBooksEmpty, item: s.book ? { title: `${s.book.title} · ${s.book.subtitle}` } : null },
    decor: { total: decor.length, items: decor, empty: BAG_TEXT.bagDecorEmpty },
  };
}
