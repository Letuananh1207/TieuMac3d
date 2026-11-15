# Hình minh hoạ 3D mềm thay biểu tượng nét (V-20261115-72)
- Yêu cầu: "các hình tượng trưng cho chức năng ở thanh chức năng và những chỗ khác đang dùng icon và tôi cảm thấy không chuyên
  nghiệp; ở 摩尔 họ làm rất đẹp, có lẽ là hình ảnh nên tôi cũng muốn".
- Đã chốt với người dùng: hình 3D mềm cute kiểu 摩尔 · tất cả mọi chỗ · phiên thiết kế vẽ bằng AI tạo ảnh, xuất ảnh nén đóng gói.
- Loại: giao diện (HUD web + màn Flutter) + công cụ build · Cỡ: vừa–lớn (làm theo 3 đợt hình) · Trạng thái: **NV1–3 + NV6 phần widget `Hinh` xong (đợt 1, 2026-11-16.2)** · **NV4 xong phần có hình (đợt 2, 2026-11-16.3)** — còn "Nói chuyện", "Cách chơi" / "Hướng dẫn", "Ván mới", Cúi chào chờ đợt 2b · NV5–7 chờ thiết kế đợt 3
- Phiếu: `docs/phieu_thiet_ke/2026-11-15-hinh-minh-hoa.md` (kiểm kê 75 hình + đặc tả + khối "Dán vào canvas").
- Không đổi luật nghiệp vụ (chỉ hình); luật chạm: R-HUD-4 (không chữ / chữ Hán trong hình). Không đụng cảnh 3D → fps chỉ kiểm.

## Vì sao làm thế này (cho dev Flutter chưa làm game)
- **Ảnh WebP lẻ thay vì sprite atlas**: atlas có lợi khi vẽ bằng GPU (WebGL — gộp lượt vẽ). HUD của ta là DOM / Flutter widget,
  không có lượt vẽ để gộp; ảnh nạp từ localhost / asset gần như tức thì. File lẻ dễ thay từng hình và Flutter dùng thẳng.
- **Một cỡ 160 (+256 cho đồ vật)**: to nhất trên HUD ≈ 52 px × mật độ điểm ảnh 3 = 156 px. Trình duyệt / Flutter thu nhỏ mượt;
  khỏi quản lý @1x/@2x/@3x.
- **Trạng thái bằng CSS filter** (mờ, đang mở): một hình cho mọi trạng thái → ít file, đổi kiểu một chỗ.
- **Chung một bản ảnh cho web và Flutter**: Vite chép `public/hinh/` nguyên tên → `copy-to-app` đưa vào `app/assets/scene/hinh/`
  → Flutter `Image.asset` đọc cùng chỗ, app không phình gấp đôi.

## Nhiệm vụ (sau khi phiên thiết kế chốt từng đợt — mục CHANGELOG có `design/icons/`)

1. **Script chép + kiểm** (nhỏ–vừa) — `web/scripts/hinh.mjs`, gọi trong `dev` và `build` (sau `subset-han`): đọc
   `design/icons/hinh.json` + `design/icons/xuat/` → kiểm mỗi mã có file đúng cỡ, ≤ 16 KB (160) / ≤ 32 KB (256), tổng ≤ 1,5 MB,
   tên khớp mã → chép vào `web/public/hinh/` → sinh `web/src/ui/hinh.g.ts` (`type HinhId`, `hinhUrl(id, co?)`) và
   `app/lib/theme/app_hinh.g.dart` (hằng đường dẫn). Không cần gói npm mới (chỉ chép + đọc đầu file WebP lấy cỡ). Thêm 3 dòng vào
   bảng "File sinh tự động" của CLAUDE.md (`web/public/hinh/**`, `hinh.g.ts`, `app_hinh.g.dart`). `app/pubspec.yaml` thêm
   `- assets/scene/hinh/`. Test vitest cho hàm kiểm ngân sách.
2. **Hàm dựng hình web** (nhỏ) — `web/src/ui/hinh.ts`: `hinhImg(id, size, cls?)` → `<img decoding="async" alt="" width height
   draggable=false>` (createElement, không innerHTML — quy tắc 6); `preloadHinh(ids)` dùng `Image.decode()`; nạp đợt 1 trong
   màn tải (`loadingScreen.ts`, ghép ở `main.ts` một dòng). CSS chung `.hinh` (drop-shadow nhẹ, trạng thái `.off` grayscale /
   opacity, `.open` nhô) ở `web/src/style.css`. Phụ thuộc lớp theo `decisions/0001-kien-truc.md` (ui/ không nhập scene/).
3. **Đợt 1: thanh công cụ + nút hành động** (vừa) — `toolbar.ts:34,49` thay `svgIcon(TOOL_ICONS…)`; `index.html:45–47` bỏ SVG
   Nhảy / Chào / Ngồi ôn → `<img>` (hoặc JS chèn trong `actionButtons.ts`); `chatPanel.ts:83`, `decorHud.ts:64`, Đọc sách
   (`readBookButton.ts` / `index.html:57`). Chỉnh `toolbar.css` / `style.css` theo cỡ trong `design/docs/components.md` mục
   "Hình minh hoạ". Bỏ `TOOL_ICONS` khi hết chỗ dùng. Kiểm dọc + ngang + máy tính, safe area.
4. **Đợt 2: nút nổi + HUD trò chơi + biểu cảm** (vừa) — `index.html:52,60,66,72,102,106,40`; `gardenHud.ts:19,103`;
   `gameHud.ts:109,221,225`; `emotePanel.ts:33`, `emoteBubble.ts:38` (giữ `EmoteId` làm mã). Bỏ `EMOTE_ICONS`, `ICON_SOW`…
   khi hết chỗ dùng. Test `bieuCam.test.ts` / `actionButtons.test.ts` vẫn xanh (chỉ đổi DOM).
5. **Đợt 3a: đồ vật + Văn tiền (web)** (vừa) — `cropPicture()` (`cropArt.ts:121`) và `DECOR_PICTURES` → ảnh (`@256` ở thẻ to);
   `coinIcon()` `wallet.ts:14` → ảnh (giữ hoạt ảnh xu bay `wallet.ts:252` — `<img>` animate như SVG); `decorPanel.ts`,
   `shopPanel.ts`, `bagPanel.ts`, `gardenPanel.ts`, `gardenHud.ts:106,143,162`, `gameHud.ts:232`.
6. **Đợt 3b: Flutter** (vừa) — widget chung `Hinh(id, size)` = `Image.asset(path, width, height, cacheWidth: (size * dpr).ceil(),
   filterQuality: medium)`; thay `shop_parts.dart:28–45` (Material Icons tạm của đồ trang trí), `crop_art.dart` (`CropArt`,
   seed pack) — giữ tên widget để màn gọi không đổi, `coin.dart` (`Coin`), `study_screen.dart:222–224,269`, `study_parts.dart:179,276`,
   `library_screen.dart:233,259`. Golden / widget test chạy với ảnh thật (`flutter test` nạp asset). Kiểm web build Flutter
   (`flutter run -d chrome`) hiển thị WebP.
7. **Đợt 3c: bản đồ vùng** (nhỏ–vừa, chỉ khi thiết kế chọn hình 3D) — `areaMapIcons.ts:113` `drawMapIcon` → `drawImage` ảnh
   đã `decode()` lên đĩa giấy; chú giải `:148`; giữ `drawMe` + dấu bắc. Ảnh chưa nạp xong → vẽ đĩa trơn (không nháy lỗi).
8. **Dọn + đo** (nhỏ) — xoá SVG / path không còn dùng; `dart tool/check.dart --changed`, `npx tsc --noEmit`, `npm test`,
   `npm run build`, `flutter analyze && flutter test`. Đo: dung lượng `app/assets/scene/hinh/` (≤ 1,5 MB), thời gian màn tải
   trước / sau (Android tầm trung, chênh ≤ 150 ms), fps `npm run bench` trước / sau (không đổi — HUD DOM, không đụng WebGL),
   bộ nhớ ảnh giải mã (~100 KB / hình 160 → nạp lười theo bảng). Ghi số vào báo cáo.
9. **Đóng phiếu** — phiếu `đã áp (<mã>)` theo từng đợt; `docs/thiet_ke_da_ap.md` `appliedVersion`.

## Chờ quyết định (thiết kế đề xuất trên canvas, người dùng chọn)
- Dấu thao tác nhỏ (× , tích, mũi tên…): phiếu đề xuất giữ nét SVG → nếu người dùng muốn hình, thêm ~15 hình vào đợt 3.
- Bản đồ vùng: hình 3D hay giữ nét mực.
- Token màu mới `hinh-*` (nếu thiết kế thêm) → `design_tokens.json`, phiên code chỉ đọc.
- Bản riêng cho trạng thái (vd. `ngoi-on` đang ôn) nếu thiết kế không muốn dùng filter CSS.

## Rủi ro
- Hình AI không đồng nhất giữa các lượt → phiếu yêu cầu cùng một cuộc trò chuyện + đính hình mẫu; bảng tổng duyệt trước khi xuất.
- Tách nền làm mất viền sáng / bóng mềm → kiểm trên nền tối (cảnh đêm `ngayDem.ts`) ở artboard bảng tổng.
- Hình 3D ở 18–24 px khó đọc → artboard thử cỡ thật; chỗ nào không đọc được thì giữ nét.
