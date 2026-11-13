# Camera tự động: xoay ra sau lưng khi đi + tránh tường
- Yêu cầu: "khi nhân vật di chuyển góc nhìn phải tự điều chỉnh bằng tay rất phiền tôi muốn góc nhìn phải tự động giống
  cách các trò chơi chuyên nghiệp làm" · chọn thêm: tránh tường.
- Loại: sửa hành vi · Cỡ: vừa · Trạng thái: xong
- Luật mới: R-DIEU-3 (tự xoay ra sau lưng, chờ 1,5 s sau khi kéo, không xoay khi đi về phía camera ≥ 120°), R-DIEU-4
  (tường / nhà chắn → camera kéo vào ~0,1 s, lùi ra ~1 s; vật thấp không tính) — đã đồng bộ online.

## Nhiệm vụ
- [x] 1. Sổ quy tắc + tài liệu online + `--mark-synced`.
- [x] 2. `collision/colliders.ts`: hộp có độ cao che tầm nhìn `h` (mặc định 0), `sightBlock()` (cắt đoạn với hộp theo slab).
- [x] 3. Độ cao che: tường vôi + cổng trăng (`kien_truc/tuong.ts`), nhà (`buildings.ts`), tường nhà vào được (`rooms.ts`).
- [x] 4. `input/orbitCamera.ts`: `follow(dt, dx, dz)` (R-DIEU-3), tránh vật chắn trong `update(…, sight)` (R-DIEU-4).
- [x] 5. `main.ts`: gọi `follow` sau `player.update`, truyền `sight`.
- [x] 6. Kiểm: mô phỏng bằng mã thật qua esbuild (9 ca theo ví dụ của luật, đạt) · `tsc` · `check.dart` · build.

## Còn
- Tường gạch kiểu `gach` (`scene/walls.ts`) chưa khai báo độ cao che — cảnh hiện dùng tường vôi; thêm khi đổi kiểu tường.
- Thử máy: giữ joystick đi vòng quanh sân, kéo camera rồi đi, đứng sát tường xoay camera ra ngoài, đi sau nhà.
