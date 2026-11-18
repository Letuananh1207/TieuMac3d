/**
 * Lật trang lưới túi đồ (R-TUI-1, thiết kế 2026-11-18.13): 12 ô / trang (3 cột × 4 hàng), "‹ trang/số trang ›". Thuần — test
 * `bagPages.test.ts`.
 */

/** Số ô mỗi trang (lưới 3×4). */
export const BAG_PER_PAGE = 12;

export interface BagPage<T> {
  /** món trên trang (≤ 12) */
  items: T[];
  /** trang đang xem, từ 0 (đã kẹp vào khoảng có) */
  page: number;
  /** số trang, ít nhất 1 (túi trống vẫn "1/1") */
  pages: number;
  /** "‹ 1/1 ›" — chữ giữa */
  label: string;
}

/** Trang [page] của [all]; trang ngoài khoảng → kẹp về trang gần nhất. */
export function bagPage<T>(all: readonly T[], page: number, per = BAG_PER_PAGE): BagPage<T> {
  const pages = Math.max(1, Math.ceil(all.length / per));
  const p = Math.min(pages - 1, Math.max(0, Math.floor(page)));
  return { items: all.slice(p * per, p * per + per), page: p, pages, label: `${p + 1}/${pages}` };
}
