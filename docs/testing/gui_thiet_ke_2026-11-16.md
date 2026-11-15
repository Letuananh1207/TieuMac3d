# Gửi lại thiết kế — 2026-11-16

Code đi trước thiết kế theo yêu cầu người dùng → phiên `/ui-design` vẽ lại artboard cho khớp khi tiện.

## Thanh công cụ bản máy tính kiểu dải đáy 摩尔 bản web (V-20261116-74)

Người dùng gửi ảnh 摩尔庄园 bản web, muốn thanh công cụ **bản máy tính** (`body.ban-may`, màn ngang) trình bày như vậy;
chọn làm thẳng trong code rồi duyệt ảnh. Điện thoại dọc / ngang giữ thanh 5 ô thiết kế 2026-11-15.35. Chỉ học bố cục,
không chép hình / màu thương hiệu.

| Mục thiết kế | Thiết kế vẽ gì | Luật nói gì | Code đang làm |
|---|---|---|---|
| 2026-11-15.35 Thanh công cụ (máy tính: theo người dùng 2026-11-15, chưa vẽ) | viên kính 5 ô sát trái đáy, ô trò chuyện ngay trên (V-70) | R-THANH-1, R-CHAT-3 (sửa 2026-11-16, V-74) | **dải gỗ đặc suốt ngang đáy** cao 52 (`shelf-wood` → `shelf-shadow`, chỉ vàng 2 mép trên, vệt sáng trong + bóng lên trên); trái: ô trò chuyện dài `clamp(280px, 34vw, 460px)` (kính sáng viền vàng mảnh trên nền gỗ); phải: **Biểu cảm · Về nhà · Túi đồ · Nhiệm vụ** hình 76 không khung nhô khỏi dải, đứng trên **ru-băng ngọc viền vàng** chữ trắng 12/700 (đang mở: ru-băng vàng chữ slate; mờ: ru-băng xám; di chuột: hình nhô 3); không có nút Biểu cảm nhỏ cạnh ô chat; **Bản đồ** hình 100 + ru-băng riêng góc trái ngay trên dải; ô phím T / H / B / I / J nhỏ góc trên trái mỗi hình; cụm hành động nâng đáy safe + 108, Đọc sách + 290, Trang trí + 354; bảng Biểu cảm 420 nổi trên hàng hình (đáy + 102), bên trái cụm hành động, mũi trỏ hình Biểu cảm; tấm báo nhà giữa màn trên dải; khung tin / khung kênh trên ô nhập chừa hình Bản đồ — `web/src/ui/toolbarMay.css`. Xin vẽ `ThanhCongCu-may` (thường / đang gõ / Biểu cảm mở / ở nhà) + token ru-băng |

### Sửa V-20261116-76 (người dùng 2026-11-16): Bản đồ vào hàng, phím tiếng Anh, thanh không màu

Thay hàng V-74 ở trên (phần còn lại giữ nguyên):

| Mục thiết kế | Thiết kế vẽ gì | Luật nói gì | Code đang làm |
|---|---|---|---|
| 2026-11-15.35 Thanh công cụ (máy tính) | như trên | R-THANH-1, R-HANH-6, R-BANDO-5, R-CHAT-3, R-BIEU-1 (sửa V-76) | **thanh trong suốt**: bỏ dải gỗ (không nền, viền, bóng; chỗ trống của dải không bắt chạm — chạm xuống cảnh); **một hàng 5 hình 76 Bản đồ · Biểu cảm · Về nhà · Túi đồ · Nhiệm vụ** sát phải (bỏ hình Bản đồ 100 riêng góc trái); ru-băng chữ **đá đen bán trong suốt** `rgba(36,50,58,.72)` chữ trắng có bóng chữ (đọc rõ trên cảnh ngày + đêm; đang mở: vàng chữ slate; mờ: xám bán trong suốt); ô trò chuyện giữ kính sáng riêng; khung tin / khung kênh thẳng mép trái ô nhập (bỏ dịch phải); ô phím **M / G / H / B / J** (Map · Gesture · Home · Bag · Journal), bản đồ lớn chuyển phím **N** — `web/src/ui/toolbarMay.css`, `zones/thanhCongCu.ts`, `input/keyboard.ts`. Xin vẽ `ThanhCongCu-may` theo bản này |
