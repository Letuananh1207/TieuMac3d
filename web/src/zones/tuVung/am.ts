/**
 * Âm phát âm đóng gói (R-AM-5) — **chưa có file** (gđ 2 kế hoạch V-80: TTS mã nguồn mở chạy trên máy người dùng, nghe
 * duyệt, đặt `design/am/tu-vung/`, `npm run am` chép sang `web/public/am/` → `app/assets/scene/am/`).
 *
 * Quy cách file: MP3 mono 32 kbps, 22,05 / 24 kHz, đầu / cuối lặng ≤ 0,1 s; giọng chuẩn phổ thông, đọc thanh gốc của từ
 * (câu ví dụ đọc biến điệu tự nhiên). Tên file theo **mã điểm Unicode** của chữ (ASCII, không trùng như pinyin 他 / 她 / 它):
 * `am/tu/670b-53cb.mp3` (朋友), câu ví dụ `am/cau/670b-53cb.mp3`. Danh sách cần đọc: `npm run tu:am-list`.
 *
 * Khi có âm: script `npm run am` sẽ ghi lại hai tập dưới (từ có file). Hiện rỗng → mọi loa mờ, câu nghe đổi sang câu chữ.
 */

/** mã từ có file âm từ */
export const AM_TU: ReadonlySet<string> = new Set<string>();
/** mã từ có file âm câu ví dụ */
export const AM_CAU: ReadonlySet<string> = new Set<string>();

/** Tên tệp (không thư mục) của một mã từ: mã điểm hex từng chữ Hán, nối "-" ("…" bỏ qua). */
export function tenTepAm(id: string): string {
  return [...id]
    .filter((c) => /\p{Script=Han}/u.test(c))
    .map((c) => c.codePointAt(0)!.toString(16))
    .join('-');
}

/** Đường dẫn tương đối (từ `index.html`) của âm từ / âm câu. */
export const amTuPath = (id: string) => `am/tu/${tenTepAm(id)}.mp3`;
export const amCauPath = (id: string) => `am/cau/${tenTepAm(id)}.mp3`;
