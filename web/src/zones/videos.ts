/**
 * Danh sách phim của rạp phim Văn Uyên Tông (R-RAP-2): cố định, link video trên mạng (decisions/0004-video-mang.md).
 * Mỗi link phải cho phép nhúng (máy chủ trả CORS) và được phép chiếu (phạm vi công cộng / giấy phép mở — ghi cạnh link).
 */
export interface FilmEntry {
  title: string;
  /** link `https://` tới file video trực tiếp (.mp4 / .webm) */
  url: string;
  /** link dự phòng (định dạng khác) — dùng khi `url` không phát được trên máy này */
  fallback?: string;
  /** giấy phép + nguồn */
  license: string;
}

export const FILMS: FilmEntry[] = [
  {
    title: '鐵扇公主 · Công chúa Quạt Sắt (1941)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/1/13/Princess_Iron_Fan_%28%E9%90%B5%E6%89%87%E5%85%AC%E4%B8%BB%29.webm/Princess_Iron_Fan_%28%E9%90%B5%E6%89%87%E5%85%AC%E4%B8%BB%29.webm.360p.mpeg4.mov',
    fallback: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/1/13/Princess_Iron_Fan_%28%E9%90%B5%E6%89%87%E5%85%AC%E4%B8%BB%29.webm/Princess_Iron_Fan_%28%E9%90%B5%E6%89%87%E5%85%AC%E4%B8%BB%29.webm.480p.vp9.webm',
    license: 'Phạm vi công cộng — Wan Laiming, Wan Guchan; Wikimedia Commons "File:Princess Iron Fan (鐵扇公主).webm"',
  },
  {
    title: 'Wonders of China · Kỳ quan Trung Hoa',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/70/Wonders_of_China.webm/Wonders_of_China.webm.360p.mpeg4.mov',
    fallback: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/70/Wonders_of_China.webm/Wonders_of_China.webm.480p.vp9.webm',
    license: 'CC BY-SA 3.0 — tác giả trên Vimeo, qua Wikimedia Commons "File:Wonders of China.webm" (phải ghi công)',
  },
  {
    title: '磨墨 · Mài mực',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/de/Ink_grinding.webmhd.webm/Ink_grinding.webmhd.webm.360p.mpeg4.mov',
    fallback: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/de/Ink_grinding.webmhd.webm/Ink_grinding.webmhd.webm.480p.vp9.webm',
    license: 'CC0 — Wikimedia Commons "File:Ink grinding.webmhd.webm"',
  },
];

/** Bồ đoàn gần nhất trong bán kính `r` (R-RAP-1: dưới 1,2 m), không có → undefined. Thuần — test được. */
export function nearestSeat<T extends { x: number; z: number }>(seats: readonly T[], x: number, z: number, r = 1.2): T | undefined {
  let best: T | undefined;
  let bestD = r;
  for (const s of seats) {
    const d = Math.hypot(s.x - x, s.z - z);
    if (d < bestD) {
      best = s;
      bestD = d;
    }
  }
  return best;
}
