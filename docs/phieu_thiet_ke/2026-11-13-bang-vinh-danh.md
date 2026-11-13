# Phiếu: Bảng vinh danh 文淵榜 — chạm xem danh sách
- Trạng thái: bỏ (2026-11-13 — bảng ở (5,5; 19,2) đổi thành bảng nhiệm vụ hằng ngày 日課榜; xem kế hoạch `docs/tasks/2026-11-13-nhiem-vu-hang-ngay.md`)
- Đợi bởi: kế hoạch `docs/tasks/2026-11-13-tien-ich-giao-luu.md` (nhiệm vụ 10). Vật trong cảnh đã dựng (prop `bang`,
  quảng trường Ngoại Môn (5,5; 19,2)); giao diện khi chạm chưa làm.

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Bảng vinh danh 文淵榜 (Học Xá 3D)

Màn: lớp nổi trên cảnh 3D (HUD) hoặc tấm giấy mở ra — khi người chơi chạm vào bảng vinh danh ở quảng trường
Văn Uyên Tông (khung gỗ 3 × 2,4 m, giấy ngà kẻ dòng, tiêu đề 文淵榜).
Cần gì: một tấm bảng đọc được trên điện thoại, cho người chơi thấy thành tích học, gợi cảm giác "tông môn có người".
CẦN QUYẾT TRƯỚC KHI VẼ (hỏi người dùng): app chưa có mạng / đăng nhập (CLAUDE.md) — bảng hiện ghi gì?
  a) chỉ thành tích của chính người chơi (số chữ đã học, bộ thủ đã khắc, số ngày học liền, vùng đã mở);
  b) như (a) + vài đệ tử NPC trong tông môn (Tiểu Mặc…) làm bạn cùng bảng, người chơi tự thấy mình đứng thứ mấy;
  c) để trống chỗ "đồng môn" cho bản có mạng sau này.
Mở khi: đứng gần bảng (≈ dưới 3 m) có nút nổi "Xem bảng" trên bảng, hoặc chạm thẳng vào bảng (như vật học — R-VUNG-2
nói chạm đồ đạc ở tông môn KHÔNG mở bài học; bảng không phải bài học nên cần luật riêng: đề xuất ở mục luật).
Đóng: nút "Đóng" / nút quay lại của máy; trong lúc mở nhân vật đứng yên (như R-VUNG-3).

Trạng thái phải vẽ: dọc 390×844 và ngang 844×390; lần đầu (chưa học chữ nào); đang học (vài chục chữ, vài bộ thủ);
danh sách dài phải cuộn.

Luật liên quan: R-VUNG-1 (tông môn không có lớp học), R-VUNG-2 (chạm đồ đạc ở tông môn không mở bài), R-VUNG-3 (mở
bảng / bài thì đứng yên), R-MAN-1 (safe area). Đề xuất luật mới cho bảng — phiên code hỏi người dùng rồi ghi sổ.
Dùng lại: token HUD C (kính sương, ngọc lục), kiểu khung thoại / bản đồ (design/docs/components.md, screen_specs.md).
App đang có: prop `bang` (web/src/scene/kien_truc/do_pho.ts `honorBoard`), tiến độ học ở app/lib/journey/.
```
