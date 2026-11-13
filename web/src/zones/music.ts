/**
 * Nhạc nền trà lâu (R-NHAC-1): danh sách bài + toán thuần kiểu "đài phát" — bài nào, giây thứ mấy theo đồng hồ thật;
 * âm lượng theo khoảng cách tới sàn trà lâu. Không DOM, không three; `ui/ambientMusic.ts` phát, `main.ts` ghép.
 */

export interface Track {
  /** tên file trong `web/src/nhac/` */
  file: string;
  /** thời lượng (giây) — đài phát cộng dồn theo số này */
  seconds: number;
  title: string;
}

/**
 * Danh sách phát. Đang dùng file im lặng giữ chỗ: người dùng thêm bản thu cổ cầm / sáo trúc có giấy phép (CC0 / phạm vi
 * công cộng) vào `web/src/nhac/` + ghi nguồn ở `web/src/nhac/LICENSES.md`, rồi thay dòng dưới đây (thời lượng đúng bài).
 */
export const TRACKS: readonly Track[] = [{ file: 'giu-cho.wav', seconds: 4, title: 'Giữ chỗ (im lặng)' }];

/** Cách mép sàn từ chừng này (m) trở lên thì tắt hẳn (R-NHAC-1). */
export const MUSIC_FADE_DIST = 8;
/** Lên / xuống từ 0 tới đầy mất chừng này giây (R-NHAC-1). */
export const MUSIC_RAMP_SECONDS = 1.5;

/** Đài phát lúc `nowSec` (giây từ 1970): bài thứ `index`, đang ở giây `offset`. Danh sách rỗng → `undefined`. */
export function radioAt(tracks: readonly Track[], nowSec: number): { index: number; offset: number } | undefined {
  const total = tracks.reduce((s, t) => s + t.seconds, 0);
  if (!(total > 0)) return undefined;
  let t = ((nowSec % total) + total) % total;
  for (let i = 0; i < tracks.length; i++) {
    if (t < tracks[i].seconds) return { index: i, offset: t };
    t -= tracks[i].seconds;
  }
  return { index: 0, offset: 0 }; // sai số làm tròn ở cuối vòng
}

export interface FloorRect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/** Khoảng cách (m) từ (x, z) tới hình chữ nhật sàn; ở trong = 0. */
export function rectDistance(r: FloorRect, x: number, z: number): number {
  const dx = Math.max(r.minX - x, 0, x - r.maxX);
  const dz = Math.max(r.minZ - z, 0, z - r.maxZ);
  return Math.hypot(dx, dz);
}

/** Âm lượng đích (0..1) khi đứng ở (x, z): sàn gần nhất trong `floors`; không có sàn → 0. */
export function musicVolume(floors: readonly FloorRect[], x: number, z: number): number {
  let d = Infinity;
  for (const f of floors) d = Math.min(d, rectDistance(f, x, z));
  return Math.max(0, 1 - d / MUSIC_FADE_DIST);
}

/** Bước âm lượng hiện tại `v` về `target` trong `dt` giây, tốc độ 1 / `MUSIC_RAMP_SECONDS` mỗi giây. */
export function rampVolume(v: number, target: number, dt: number): number {
  const step = dt / MUSIC_RAMP_SECONDS;
  return v < target ? Math.min(target, v + step) : Math.max(target, v - step);
}
