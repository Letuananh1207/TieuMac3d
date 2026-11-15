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
