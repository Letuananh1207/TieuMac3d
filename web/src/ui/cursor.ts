/**
 * Con trỏ chuột hoạt hình (L-9): nhúng thẳng SVG thành data URI thay cho `url(./cursor/*.svg)`.
 * Ảnh là file riêng → trình duyệt có lúc phải hỏi lại máy chủ (dev: `Cache-Control: no-cache`); khi DOM dưới chuột đổi
 * (bong bóng, nhãn tên…) mà ảnh chưa sẵn thì Chrome dùng con trỏ dự phòng `default` tới lần di chuột kế tiếp.
 * Data URI không cần tải → không bao giờ rơi về con trỏ máy.
 */

/** Giá trị CSS `cursor` cho một SVG, điểm nhấn (x, y), dự phòng `fallback`. */
export function cursorValue(svg: string, x: number, y: number, fallback: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg.trim())}") ${x} ${y}, ${fallback}`;
}

/** Đặt biến `--cur` (mũi tên ngọc lục) và `--cur-btn` (trên nút bấm được) cho style.css. */
export function installCursors(arrowSvg: string, buttonSvg: string): void {
  const root = document.documentElement.style;
  root.setProperty('--cur', cursorValue(arrowSvg, 5, 4, 'default'));
  root.setProperty('--cur-btn', cursorValue(buttonSvg, 5, 4, 'pointer'));
}
