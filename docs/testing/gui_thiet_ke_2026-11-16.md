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

### Sửa V-20261116-77 (người dùng 2026-11-16): bỏ ô chat, hình Trò chuyện, thanh sang trái

Thay hàng V-76 ở trên (phần còn lại giữ nguyên):

| Mục thiết kế | Thiết kế vẽ gì | Luật nói gì | Code đang làm |
|---|---|---|---|
| 2026-11-15.35 Thanh công cụ (máy tính) + 2026-11-14.9 Trò chuyện | như trên | R-THANH-1, R-CHAT-3 (sửa V-77) | **bỏ ô chat luôn hiện**; **một hàng 6 hình 76 sát TRÁI đáy** (cách mép trái safe + 12): **Trò chuyện** (hình `tro-chuyen`, ô phím **Enter**) · Bản đồ · Biểu cảm · Về nhà · Túi đồ · Nhiệm vụ — Trò chuyện đầu hàng, đúng chỗ ô chat cũ; bấm hình / Enter → ô nhập 440 × 40 + Gửi nổi ngay trên hàng hình (đáy safe + 102, mép trái thẳng hàng), khung kênh 240 ngay trên ô; ru-băng Trò chuyện vàng khi đang mở; bấm lại hình / Esc / Enter khi ô trống / bấm ra ngoài → đóng (chữ gõ dở giữ). **3 tin gần nhất** hiện cùng chỗ (trên hình Trò chuyện) khi có tin mới, im lặng 10 s thì mờ (như game; nhường chỗ khi bảng Biểu cảm / tấm báo nhà mở). Bảng Biểu cảm 420 nổi trên hàng, mép trái thẳng hàng (đáy + 102), mũi trỏ hình Biểu cảm; tấm báo nhà cùng chỗ. Phải trống → cụm Nhảy · Chào · Ngồi về sát đáy (+ 9), Đọc sách + 189, Trang trí + 253. Màn dọc máy tính (hiếm) và điện thoại: như cũ, nút Trò chuyện tròn — `web/src/ui/toolbarMay.css`, `toolbar.ts`, `chat.css`, `chatPanel.ts`. Xin vẽ `ThanhCongCu-may` theo bản này (thường / ô chat mở / có tin mới / Biểu cảm mở / ở nhà) |

## Dải kho trang trí kiểu 摩尔 bản web (V-20261116-75)

Người dùng gửi ảnh 摩尔 bản web (dải kho đáy khi trang trí nhà), muốn trang trí ngoài sân / trong nhà hiển thị như vậy ở
**mọi màn**, **chỉ đồ còn trong túi**; chọn làm thẳng trong code rồi duyệt ảnh. Chỉ học bố cục, dùng token dự án + tông dải gỗ V-74.

| Mục thiết kế | Thiết kế vẽ gì | Luật nói gì | Code đang làm |
|---|---|---|---|
| 2026-11-15.42 Trang trí tự do — túi đồ (`TrangTriTuDo-*`) | dọc: khay đáy kính một hàng thẻ cuộn ngang + kéo lên tấm 60 % lưới 3 cột; ngang: cột phải 310; máy tính: cột phải 360; thẻ "× n" / "Đặt hết · Mua thêm" / khoá "Mua ở Tạp hoá"; "Xong" viên ngọc dưới ví | R-NHA-4, R-NHA-6 (sửa 2026-11-16, V-75) | **dải kho gỗ đáy mọi màn** (gỗ `shelf-wood` → `shelf-shadow`, chỉ vàng mép trên); hàng tab (Tất cả + nhóm có món: Cây cảnh · Đá & ao · Đồ dùng · Đèn & vật nhỏ — tab chọn nền `gold` chữ slate, tab thường nền tối chữ kem); viên đếm "n / 40 món" (gian trong "Trong nhà · n / 20 món") đầu hàng tab (dọc: nổi trên mép trái dải); khung giấy `map-paper` một hàng **ô vuông** (dọc 64, ngang 52, máy tính 76; nền kem viền vàng nhạt) hình món + **số góc dưới phải** + tên dưới ô; mũi tên tam giác ngọc trái / phải lật trang (mờ ở trang đầu / cuối, ẩn khi một trang) + vuốt ngang / cuộn chuột; nút tròn ngọc viền vàng **"Xong"** nhô góc phải (bỏ viên "Xong" dưới ví); chỉ đồ trong túi, không thẻ khoá / đặt hết; túi trống → dòng "Túi trống — mua đồ ở Tạp hoá"; đủ trần → viên đỏ trên dải; máy tính: dải nổi giữa đáy rộng ≤ 880, dải phím khi cầm ngay trên dải; đang cầm (điện thoại) giữ dải "Đang cầm" như cũ — `web/src/ui/decorPanel.ts`, `decor.css`, `zones/decorStock.ts`. Xin vẽ `TrangTriTuDo-kho` (dọc / ngang / máy tính · nhiều món trang 1–2 · túi trống · đang cầm) + hình minh hoạ cho 13 vật (đang là hình vẽ code giữ chỗ) |
## Túi đồ tab hình thiếu ngăn Lâm sản (2026-11-16.4, V-20261115-73)

| Mục thiết kế | Thiết kế vẽ gì | Luật nói gì | Code đang làm |
|---|---|---|---|
| 2026-11-16.4 Túi đồ (`TuiDo-vuon-{doc,ngang}`) | 5 tab Hạt giống · Đồ làm vườn · Nông sản · Sách · Trang trí — không có Lâm sản | R-TUI-1 có ngăn **Lâm sản** (Măng × n, Măng to × n — R-MANG-3/5) | giữ ngăn Lâm sản thành nhóm "Lâm sản" dưới lưới Nông sản trong tab Nông sản (chip "tên × n", hình măng chờ thiết kế); R-TUI-1 ghi rõ. Xin vẽ: tab Nông sản có nhóm Lâm sản (hoặc tab thứ 6) + hình măng |

