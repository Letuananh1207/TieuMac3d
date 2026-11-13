# Phiếu: Rạp phim (chọn phim + điều khiển) · Phòng nghe nhạc · Phòng ôn tập
- Trạng thái: chờ thiết kế
- Đã vẽ: 2026-11-13.31 (chỉ phần 2 nghe nhạc; phần 1 rạp phim bỏ — đã xoá .30; phần 3 ôn tập chuyển sang phiếu "Ngồi ôn")
- Đợi bởi: kế hoạch `docs/tasks/2026-11-13-rap-phim-nghe-nhac-on-tap.md` (đợt 2). Đợt 1 đã code: rạp phim 影戲臺 ở trục
  bắc quảng trường (0; −12), ngồi bồ đoàn bằng nút Ngồi thiền có sẵn → phim tự phát trên màn 3D (R-RAP-1..3).

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Tiện ích thực dùng của Văn Uyên Tông (Học Xá 3D)

Bối cảnh: tông môn không có lớp học; là nơi tụ tập. Ba tiện ích dưới đây đã có (hoặc sẽ có) chỗ trong cảnh 3D, thiếu
giao diện. Chất liệu HUD C (kính sương, ngọc lục, chữ lam xám; design/tokens/design_tokens.json). Dọc 390×844 + ngang
844×390, safe area (R-MAN-1). Nhân vật đứng yên khi các bảng này mở (như R-VUNG-3).

1) RẠP PHIM 影戲臺 — đang ngồi xem (màn 3D phía trước chiếm giữa màn hình, KHÔNG che màn chiếu)
   - Nút "Ngồi xem" riêng (thay việc dùng nút Ngồi thiền) hiện khi đứng gần bồ đoàn — kiểu nút nổi như "Nói chuyện".
   - Khi đang ngồi: thanh điều khiển gọn mép dưới: phát / dừng, tua (thanh thời gian), bật / tắt tiếng (bắt đầu tắt —
     WebView cần một lần chạm), "Danh sách phim", "Đứng dậy".
   - Danh sách phim: 3 phim hiện có (tên + thời lượng + dòng ghi công / giấy phép — phim CC BY-SA bắt buộc ghi công):
     鐵扇公主 · Công chúa Quạt Sắt (1941) — phạm vi công cộng; Wonders of China — CC BY-SA 3.0; 磨墨 · Mài mực — CC0.
   - Trạng thái: đang tải, không có mạng ("Cần kết nối mạng để xem phim" — R-RAP-3), hết danh sách.
   - Ngang: chỗ trống của màn chiếu lớn hơn — điều khiển sang mép phải.

2) PHÒNG NGHE NHẠC 樂坊 (trà lâu cũ) — ngồi bàn trà, nghe nhạc cổ phong / thiền, nhạc đóng gói offline
   - Nút nổi "Nghe nhạc" khi ngồi cạnh bàn trà; trình phát nhỏ: tên bài, phát / dừng, bài trước / sau, lặp; nhạc tiếp
     tục khi đứng dậy đi dạo? (đề xuất: tiếp tục trong tông môn, tắt khi sang vùng khác — hỏi người dùng).
   - Danh sách 5–8 bài (cổ cầm, sáo trúc, tiếng mưa…) — tên giữ chỗ, file chưa có.

3) PHÒNG ÔN TẬP 藏書閣 — tra / ôn lại chữ và bộ thủ ĐÃ HỌC (không phải bài mới, không phải lớp học)
   - Đứng trước kệ sách / án đọc → nút "Ôn chữ" → màn Flutter (như màn bài học): lưới các chữ đã học, lọc theo vùng /
     bộ thủ, chạm một chữ → thẻ chữ (chữ lớn, pinyin, nghĩa, nét); có thể "ôn nhanh" (lật thẻ).
   - Trạng thái: chưa học chữ nào (gợi ý đi Rừng trúc), vài chữ, rất nhiều chữ (cuộn).

Luật liên quan: R-RAP-1..3 (docs/testing/quy_tac.md), R-VUNG-1 (tông môn không có lớp học), R-DIEU-7 (ngồi / đứng),
R-NPC-2 (kiểu nút nổi "Nói chuyện"), R-MAN-1. Luật mới cho nghe nhạc / ôn tập: đề xuất kèm thiết kế.
App đang có: web/src/scene/videoScreen.ts (phát / dừng / tiếp, tắt tiếng), web/src/zones/videos.ts (danh sách),
app/lib/journey/progress_store.dart (chữ đã học), app/lib/lesson/ (khung màn bài học).
```
