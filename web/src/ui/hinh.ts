/**
 * Hình minh hoạ đất sét (thiết kế 2026-11-16.2, V-72) thay biểu tượng nét trên HUD. Ảnh WebP alpha đóng gói (`public/hinh/`,
 * sinh bởi `scripts/hinh.mjs`) — không mạng. Trạng thái (mờ / nhấn / đang mở) bằng CSS `.hinh` ở style.css, một ảnh cho mọi
 * trạng thái. Dựng bằng createElement (quy tắc 6).
 */
import { hinhUrl, type HinhId } from './hinh.g';

export type { HinhId } from './hinh.g';

/** Hình đợt 1 đang hiện trên HUD (thanh công cụ + nút hành động / cột phải) — nạp sẵn trong màn tải. */
export const HINH_HUD: readonly HinhId[] = [
  'ban-do', 've-nha', 'bieu-cam', 'tui-do', 'nhiem-vu',
  'nhay-nut', 'chao-nut', 'ngoi-on-nut', 'tro-chuyen', 'trang-tri', 'doc-sach-nut',
];

/** `<img class="hinh …">` cỡ `size` px (trang trí — `alt=""`, nút mang nhãn riêng). */
export function hinhImg(id: HinhId, size: number, cls = ''): HTMLImageElement {
  const img = document.createElement('img');
  img.className = cls ? `hinh ${cls}` : 'hinh';
  img.src = hinhUrl(id, size * 3); // đủ nét ở mật độ điểm ảnh 3; chỉ có 160 → dùng 160
  img.alt = '';
  img.width = size;
  img.height = size;
  img.decoding = 'async';
  img.draggable = false;
  img.setAttribute('aria-hidden', 'true');
  return img;
}

/** Tải + giải mã sẵn (màn tải) để nút hiện hình ngay khung đầu; lỗi một hình không chặn (nút vẫn có nhãn). */
export async function preloadHinh(ids: readonly HinhId[]): Promise<void> {
  await Promise.allSettled(
    ids.map((id) => {
      const img = new Image();
      img.src = hinhUrl(id); // cùng URL với hinhImg ở cỡ HUD (≤ 53 px → 160)
      return img.decode();
    }),
  );
}
