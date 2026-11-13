# 0004 — Video rạp phim tải từ mạng (ngoại lệ "chạy offline")

Ngày: 2026-11-13 · Trạng thái: đã chốt (người dùng) · Kế hoạch: `docs/tasks/2026-11-13-rap-phim-nghe-nhac-on-tap.md`

## Bối cảnh

Văn Uyên Tông có rạp phim ngoài trời: ngồi vào ghế thì phim chạy trên màn trong cảnh 3D. Người dùng chọn: danh sách phim
cố định, file `.mp4` / `.webm` **trên mạng** (không đóng gói — app nhẹ, phim dài được), video **chạy trên màn 3D**.

## Quyết định

- Chỉ **nội dung video của rạp** được tải từ mạng, lúc người chơi ngồi xem. Mã, CSS, font, nhạc, model vẫn đóng gói;
  quy tắc cứng 2 (không CDN) giữ nguyên cho mọi thứ khác. Máy kiểm `E-CDN` quét mã / CSS / font — link video nằm trong
  dữ liệu `web/src/zones/videos.ts`, không phải `import` hay `<script>`.
- Phát bằng `HTMLVideoElement` (`crossOrigin = 'anonymous'`, `playsInline`, bắt đầu tắt tiếng — WebView chỉ cho phát
  tiếng sau một lần chạm) → `THREE.VideoTexture` trên mặt màn. Không thư viện mới.
- Link phải: (1) **cho phép nhúng** — máy chủ trả `Access-Control-Allow-Origin` (thiếu → WebGL không đọc được khung
  hình); (2) **được phép chiếu** — phạm vi công cộng / giấy phép mở, ghi giấy phép cạnh link. YouTube / Bilibili không
  dùng được (không có file trực tiếp, không CORS).
- Không mạng / link lỗi → màn hiện chữ "Cần kết nối mạng để xem phim" (R-RAP-3), không treo; cảnh còn lại chạy offline.
- Dừng phát khi đứng dậy, khi app xuống nền (`lifecycle`) — không tốn pin / dữ liệu.

## Hệ quả

- App cần quyền Internet (Android đã có cho WebView; iOS không cần khai thêm với HTTPS).
- Chỉ dùng link `https://`.
- Multiplayer (xem cùng người thật) vẫn ngoài phạm vi (CLAUDE.md) — ghế dư chừa cho sau.
