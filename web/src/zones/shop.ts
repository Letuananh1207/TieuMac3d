/**
 * Tiệm Tạp hoá 雜貨 trong cảnh (R-TIEN-6, cảnh 2026-11-14.14): cửa tiệm ở đâu, khi nào hiện nút nổi "Vào tiệm".
 * Thuần — không three, không DOM. Mã nhà `tap-hoa` do thiết kế chốt (design/CHANGELOG.md 2026-11-14.14 — không đổi).
 */

/** Mã nhà Tạp hoá trong đặc tả cảnh (`buildings[].id`). */
export const SHOP_ID = 'tap-hoa';

/** R-TIEN-6: đứng cách cửa tiệm dưới khoảng này (m) thì hiện nút "Vào tiệm" (như "Xem bảng", R-NV-3). */
export const SHOP_RANGE = 2.5;

/** Chữ khung thoại khi không có Flutter (trình duyệt thường — R-TIEN-6). */
export const SHOP_CLOSED_TEXT = 'Tiệm chưa mở';

/** Nhà trong đặc tả cảnh (cùng dạng `BuildingSpec` của `scene/spec.ts` — zones không import scene). */
export interface BuildingLike {
  id: string;
  x: number;
  z: number;
  /** sâu (m) theo trục z trước khi xoay — mặt tiền ở phía +z */
  d: number;
  /** độ, bội 90 */
  rotY?: number;
}

/** Giữa mặt tiền (cửa) tiệm Tạp hoá: tâm nhà + nửa chiều sâu theo hướng mặt tiền; không có tiệm → `null`. */
export function shopDoor(buildings: readonly BuildingLike[]): { x: number; z: number } | null {
  const b = buildings.find((x) => x.id === SHOP_ID);
  if (!b) return null;
  const a = ((b.rotY ?? 0) * Math.PI) / 180;
  const r = (v: number): number => Math.round(v * 1e6) / 1e6;
  return { x: r(b.x + Math.sin(a) * (b.d / 2)), z: r(b.z + Math.cos(a) * (b.d / 2)) };
}

/**
 * Nút "Vào tiệm" hiện không (R-TIEN-6): đang rảnh ([free] — không học / thoại / bản đồ / ngồi / màn tải) và đứng trong
 * tiệm ([inShop] — sàn phòng `tap-hoa`) hoặc cách cửa dưới [SHOP_RANGE] m.
 */
export function shopButtonShown(
  door: { x: number; z: number } | null,
  at: { x: number; z: number; inShop: boolean; free: boolean },
): boolean {
  if (!door || !at.free) return false;
  return at.inShop || Math.hypot(at.x - door.x, at.z - door.z) < SHOP_RANGE;
}
