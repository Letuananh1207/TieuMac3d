/**
 * Chăm cây ở Vườn rau (V-73, R-VUON-6/10/11/12) — **bản TS chép `app/lib/journey/garden_care.dart`**: sâu / cỏ định sẵn lúc
 * gieo bằng FNV-1a 32-bit của "mã luống@giờ gieo" (hai phía cùng kết quả, không lưu), công thức sản lượng, hằng số phân bón.
 * Thuần, chỉ số nguyên; test cùng vector `vuonCham.test.ts` ↔ `app/test/rules/vuon_cham_test.dart`.
 */

/** FNV-1a 32-bit trên mã UTF-16 của [s] (chuỗi ASCII) — trùng `fnv1a` ở Dart. */
export function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export interface Pests {
  /** sâu hiện từ phần nghìn này (200 … 450 — R-VUON-10); -1 = không có sâu */
  bugAt: number;
  /** cỏ hiện từ phần nghìn này (550 … 850 — R-VUON-11); -1 = không có cỏ */
  weedAt: number;
  /** số bụi cỏ 2 … 3 */
  weeds: 2 | 3;
}

/** Sâu / cỏ của cây gieo ở luống [plotId] lúc [plantedAt] (ms) — như `pestsOf` ở Dart. */
export function pestsOf(plotId: string, plantedAt: number): Pests {
  const h = fnv1a(`${plotId}@${Math.floor(plantedAt)}`);
  return {
    bugAt: (h & 1) === 1 ? 200 + Math.floor((((h >>> 8) & 0xff) * 250) / 255) : -1,
    weedAt: ((h >>> 1) & 1) === 1 ? 550 + Math.floor((((h >>> 16) & 0xff) * 300) / 255) : -1,
    weeds: (2 + ((h >>> 24) & 1)) as 2 | 3,
  };
}

/** Tiến độ [progressMs] / [growMs] đã tới mốc [permille] chưa (mốc -1 → không bao giờ). */
export const reached = (permille: number, progressMs: number, growMs: number): boolean => permille >= 0 && progressMs * 1000 >= permille * growMs;

/** Sản lượng (R-VUON-6): 2 + lượt tưới − sâu còn − cỏ còn, 2 … 4. */
export function yieldFrom(watered: number, bugLeft: boolean, weedLeft: boolean): number {
  const n = 2 + Math.max(0, Math.min(2, watered)) - (bugLeft ? 1 : 0) - (weedLeft ? 1 : 0);
  return Math.max(2, Math.min(4, n));
}

/** Phân bón (R-VUON-12): mới cài tặng 3 bao, 10 Văn / bao, mua × 1 · × 5 · × 10; mã vật trên cầu nối `phan`. */
export const STARTER_FERT = 3;
export const FERT_PRICE = 10;
export const FERT_COUNTS: readonly number[] = [1, 5, 10];
export const FERT_ITEM = 'phan';

/** Bón: thời gian còn lại giảm một nửa → số ms cộng vào tiến độ (ít nhất 1 để đánh dấu "đã bón"). */
export const fertBoost = (remainingMs: number): number => Math.max(1, Math.floor(remainingMs / 2));

/** Nhãn ví (R-TIEN-5): "−10 · Phân bón". */
export const fertLabel = (count = 1): string => `−${FERT_PRICE * count} · Phân bón`;
