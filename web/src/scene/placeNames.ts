/**
 * Tên vùng một nguồn (R-HANH-1, V-50): `site.name` của từng đặc tả cảnh phải trùng `ten` của nơi cùng mã trong
 * `design/scene/ban-do/ban-do.json` (bản đồ truyền tống, màn tải, lớp chữ cưỡi hạc, chip khu cùng đọc một tên).
 * Tên nơi ngắn, một dòng, chỉ chữ Việt (R-HUD-4). Thuần — `scripts/check-scene.mjs` gọi.
 */

/** Dài nhất của tên nơi (ký tự): nhãn bản đồ, màn tải, thẻ "sắp mở" một dòng. Tên vùng dài nhất hiện có 16 ("Khởi Nguyên Trấn"; vùng: 13 "Nhạn Môn Quan"). */
export const PLACE_NAME_MAX = 20;

/** Mã cảnh → mã nơi trên bản đồ (tông môn là `tong-mon` trong app, `van-uyen` trên giấy). */
export function mapPlaceId(sceneId: string): string {
  return sceneId === 'tong-mon' ? 'van-uyen' : sceneId;
}

const HAN = /\p{Script=Han}/u;

/**
 * Lỗi tên nơi. `scenes` = mã cảnh → `site.name` (cảnh không có nơi trên bản đồ thì bỏ qua); `places` = `noi` của
 * ban-do.json. Trả danh sách lỗi (rỗng = đúng).
 */
export function checkPlaceNames(
  scenes: ReadonlyMap<string, string>,
  places: readonly { id: string; ten: string }[],
): string[] {
  const out: string[] = [];
  for (const p of places) {
    const len = [...p.ten].length;
    if (len === 0 || len > PLACE_NAME_MAX) out.push(`ban-do.json noi "${p.id}": tên "${p.ten}" ${len} ký tự — cần 1…${PLACE_NAME_MAX}`);
    if (HAN.test(p.ten)) out.push(`ban-do.json noi "${p.id}": tên "${p.ten}" có chữ Hán — tên nơi chỉ tiếng Việt (R-HUD-4)`);
  }
  for (const [scene, name] of scenes) {
    const place = places.find((p) => p.id === mapPlaceId(scene));
    if (!place) continue;
    if (place.ten !== name) {
      out.push(`site.name của cảnh "${scene}" là "${name}" nhưng ban-do.json gọi là "${place.ten}" — hai nơi phải cùng một tên (R-HANH-1)`);
    }
  }
  return out;
}

/** Cảnh nhà riêng (Nhà của ta): cổng tới đó ghi "Về nhà", không ghi tên nơi (R-HANH-4); nút Về nhà đi tới đây (R-HANH-7). */
export const HOME_OF_PLAYER = 'nha-ta';

/**
 * Gian trong của Nhà của ta (V-68): cảnh riêng, tới bằng cổng đi bộ ở cửa nhà chính (R-NHA-1, R-HANH-4). Không có nơi
 * riêng trên bản đồ truyền tống — vẫn là "Nhà của ta" (nút Về nhà mờ R-HANH-7, bản đồ "Bạn đang ở đây").
 */
export const HOME_INSIDE = 'nha-ta-trong';

/** Cảnh thuộc Nhà của ta (sân + gian trong). */
export function isHomeScene(sceneId: string | null | undefined): boolean {
  return sceneId === HOME_OF_PLAYER || sceneId === HOME_INSIDE;
}

/**
 * Nhãn vòng sáng cổng đi bộ (R-HANH-4, V-59): cổng tới một nơi trên bản đồ ghi đúng `ten` của nơi đó (một nguồn tên —
 * như `placeName`); riêng cổng về Nhà của ta ghi "Về nhà". `portals` = mã cảnh → cổng của cảnh đó. Trả danh sách lỗi.
 */
export function checkPortalLabels(
  portals: ReadonlyMap<string, readonly { scene: string; label?: string }[]>,
  places: readonly { id: string; ten: string }[],
): string[] {
  const out: string[] = [];
  for (const [from, list] of portals) {
    for (const p of list) {
      // về nhà: "Về nhà"; cửa nhà chính ↔ gian trong (cùng một nơi): nhãn cửa "Vào nhà" / "Ra sân" (V-68)
      if (!p.label || isHomeScene(p.scene)) continue;
      const place = places.find((q) => q.id === mapPlaceId(p.scene));
      if (place && place.ten !== p.label) {
        out.push(`cổng ở "${from}" → "${p.scene}": nhãn "${p.label}" nhưng ban-do.json gọi nơi đó là "${place.ten}" — nhãn phải là tên nơi đến (R-HANH-4)`);
      }
    }
  }
  return out;
}
