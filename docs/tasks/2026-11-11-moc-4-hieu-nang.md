# Mốc 4 — hiệu năng
- Yêu cầu: mốc 4 trong kế hoạch 5 mốc — "pixelRatio ≤ 1.5, không shadow realtime, InstancedMesh cho cây, < 100 draw
  call, overlay debug bật từ Flutter, dừng render khi app background." Người dùng: "hãy làm tiếp" (2026-11-11).
- Loại: sửa (hiệu năng) · Cỡ: vừa · Trạng thái: đang làm

## Hiện trạng (2026-11-11)
- Đã có từ trước: pixelRatio ≤ 1,5 (`scene/renderer.ts`), không bóng realtime, vật liệu Lambert, gộp khối tĩnh
  (`scene/merge.ts`), cỏ + đá instanced, ngân sách dự án đã nâng lên ≤ 150 draw call / ≤ 150k tam giác (quyết định
  0002 — cảnh tông môn nhiều khu).
- Đo (Canvas 3D, trước việc "kiến trúc cao" của phiên song song): trên xuống 141 draw call, ~126k tam giác. Phiên song
  song báo sau "kiến trúc cao" ~182k tam giác — **vượt** 150k.

## Nhiệm vụ
- [x] 1. Dừng hẳn vòng lặp khi app xuống nền: Flutter `AppLifecycleListener` → `lifecycle {state}` (docs/bridge.md);
      trang cũng dừng khi `document.hidden`; chạy lại bỏ khoảng đã dừng. (`web/src/main.ts`, `bridge/flutterBridge.ts`,
      `app/lib/scene/scene_view.dart`, `scene_event.dart`; test Dart: chuỗi sự kiện.)
- [x] 2. Bảng gỡ lỗi bật từ Flutter: bản debug gửi `debug {on: true}` → "fps · draw call · tam giác"
      (`ui/hud.ts` `FpsCounter`); `?debug` vẫn dùng được trên trình duyệt.
- [x] 3. Đo lại sau khi phiên song song commit "kiến trúc cao"; giảm tam giác về ≤ 150k (ứng viên: cây ngoài tường
      instanced theo kiểu, địa hình bớt ô ở vùng xa, mái / nhà gộp thêm). Chờ phiên kia xong để không sửa cùng file.
- [ ] 4. Đo trên máy Android thật (bản debug hiện bảng gỡ lỗi): fps ở góc chơi / cả sân / trong nhà, nóng máy.

## Đo lại (2026-11-13, phiên đám mây, sau `2026-11-13.32` thu gọn bố cục + `.34` lòng chảo cỏ + trà lâu 18 chỗ)
Canvas 3D (Chromium headless, swiftshader), "không tính lớp phủ":

| Góc | Draw call | Tam giác |
|---|---|---|
| Tông môn `?view=tren` | 113 | 130.776 |
| Tông môn `?view=ca-san` | 88 | 126.410 |
| Tông môn góc chơi | 102 | 130.118 |
| Trà lâu tầng 2 | 56 | 114.758 |
| Trong Tàng Thư Các | 70 | 124.218 |
| Rừng trúc (`?vung=rung-truc`, mọi góc) | 48 | 101.448 |

→ Bước 3 **đạt không cần sửa code**: cao nhất 130,8k ≤ 150k (còn dư ~19k), draw call ≤ 113. Các ứng viên giảm (cây
ngoài tường instanced theo kiểu, địa hình bớt ô vùng xa) để dành khi thêm nội dung làm vượt lại.

## Ghi chú
- Chụp headless trang chính (`dist/index.html`) dừng ở màn tải 80–100 % cả với bản đã commit `90106ff` → giới hạn của
  Chrome headless + swiftshader với màn tải, không phải lỗi mới. Canvas 3D (`design.html`) vẫn chụp được.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm run build · cd app && flutter analyze ·
flutter test · dart tool/rule_trace.dart · đo draw call / tam giác (≤ 150 / ≤ 150k)
