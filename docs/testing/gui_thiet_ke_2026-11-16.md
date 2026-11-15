# Gửi lại thiết kế — 2026-11-16

Code đi trước thiết kế theo yêu cầu người dùng → phiên `/ui-design` vẽ lại artboard cho khớp khi tiện.

## Thanh công cụ bản máy tính kiểu dải đáy 摩尔 bản web (V-20261116-74)

Người dùng gửi ảnh 摩尔庄园 bản web, muốn thanh công cụ **bản máy tính** (`body.ban-may`, màn ngang) trình bày như vậy;
chọn làm thẳng trong code rồi duyệt ảnh. Điện thoại dọc / ngang giữ thanh 5 ô thiết kế 2026-11-15.35. Chỉ học bố cục,
không chép hình / màu thương hiệu.

| Mục thiết kế | Thiết kế vẽ gì | Luật nói gì | Code đang làm |
|---|---|---|---|
| 2026-11-15.35 Thanh công cụ (máy tính: theo người dùng 2026-11-15, chưa vẽ) | viên kính 5 ô sát trái đáy, ô trò chuyện ngay trên (V-70) | R-THANH-1, R-CHAT-3 (sửa 2026-11-16, V-74) | **dải kính suốt ngang đáy** cao 52 (mép trên chỉ vàng); trái: ô trò chuyện dài `clamp(280px, 34vw, 460px)` + nút **Biểu cảm** tròn kính 40 ngay cạnh (bỏ Biểu cảm khỏi hàng phải); phải: **Về nhà · Túi đồ · Nhiệm vụ** hình 66 không khung nhô khỏi dải, đứng trên **ru-băng ngọc viền vàng** chữ trắng 12/700 (đang mở: ru-băng vàng chữ slate; mờ: ru-băng xám; di chuột: hình nhô 3); **Bản đồ** hình 90 + ru-băng riêng góc trái ngay trên dải; ô phím T / H / B / I / J nhỏ góc trên trái mỗi hình; cụm hành động nâng đáy safe + 92, Đọc sách + 274, Trang trí + 338; bảng Biểu cảm 420 nổi trên dải canh nút Biểu cảm; tấm báo nhà giữa màn trên dải; khung tin / khung kênh trên ô nhập chừa hình Bản đồ — `web/src/ui/toolbarMay.css`. Xin vẽ `ThanhCongCu-may` (thường / đang gõ / Biểu cảm mở / ở nhà) + token ru-băng |
