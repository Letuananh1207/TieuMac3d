# Tàng Thư Các lên được tầng 2
- Yêu cầu: "tàng thư các có 2 tầng mà chưa có cầu thang đi lên tầng 2" → người dùng chọn: lên được tầng 2 (cầu thang
  trong nhà + sàn tầng 2 đi lại được, lan can chặn mép).
- Loại: sửa hành vi + thêm (cảnh) · Cỡ: lớn · Trạng thái: xong (chờ thử máy)

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` — R-VA-3 (bỏ "Tầng 2 chỉ nhìn, không lên được", thêm cầu thang + tầng 2), R-HUD-2 (mờ theo tầng).
- `web/src/collision/ground.ts` — mặt đất nhiều tầng: tấm `upper` chỉ tính khi chân nhân vật với tới (≤ y + 0,5 m).
- `web/src/collision/colliders.ts` — hộp va chạm có khoảng cao `minY` / `maxY` (chân nhân vật) — lan can tầng 2 không
  chặn người ở tầng 1, kệ tầng 1 không chặn người ở tầng 2.
- `web/src/player/controller.ts` — truyền độ cao chân hiện tại vào `heightAt` / `resolve`.
- `web/src/scene/kien_truc/vao_trong.ts` — `Shell`: tấm `upper`, hộp có khoảng cao, nhóm mờ thứ hai (mái riêng).
- `web/src/scene/kien_truc/lau_sach.ts` — cầu thang gấp khúc, sàn tầng 2 có lỗ cầu thang, tầng 2 rỗng (tường, song
  cửa, kệ sách), lan can quanh lỗ.
- `web/src/scene/kien_truc/noi_that.ts` — `thuVien`: tuỳ chọn bỏ kệ bên phải (chỗ cầu thang).
- `web/src/scene/rooms.ts` + `web/src/scene/world.ts` — đổi toạ độ phần mới; mờ theo tầng (ở tầng 1: mờ tầng 2 + mái;
  ở tầng 2: chỉ mờ mái + mặt tiền tầng 2).
- Test mới: `web/src/collision/ground.test.ts`, `web/src/collision/colliders.test.ts`, `web/src/lauSach.test.ts`.

**Cần kiểm tra**: trà lâu, hí đài, cửa hàng, lớp học (cùng dùng `Shell` / `LayeredGround` — phải y như cũ);
`main.ts` (`groundAt` cho camera, NPC, chạm để đi — không truyền độ cao → giữ tầng thấp như cũ); `npm run scene:check`.

**Không đụng**: `design/scene/scene.json` (vị trí / cỡ nhà giữ nguyên), cầu nối Flutter, HUD.

## Giả định / cần quyết định
- **Chỗ đặt cầu thang** (đề xuất): gian đầu hồi bên phải (đông), cầu thang **gấp khúc hai vế** — vế 1 đi vào trong
  (bắc) lên chiếu nghỉ sát tường sau, vế 2 quay ra (nam) lên tầng 2. Mỗi vế ~4,6 m, dốc ~30° (≤ 35°, R-VA-2), rộng
  1,4 m. Kệ sách bên phải tầng 1 bỏ, chuyển lên tầng 2. Cách khác: một vế thẳng dọc tường sau (dài ~9 m, che kệ sau).
- Chạm để đi vẫn đi thẳng (không tự tìm đường lên cầu thang) — muốn lên phải tự đi.
- Hình dựng cầu thang, tầng 2 theo cùng kiểu low-poly của lầu sách; duyệt bằng ảnh chụp Canvas 3D trước khi build.
- Ước tính thêm ~40 khối (bậc, lan can, kệ) — gộp theo vật liệu như phần nhà hiện có, draw call tăng không đáng kể.

## Nhiệm vụ
- [x] 1. Quy tắc: sửa R-VA-3, R-HUD-2 trong `docs/testing/quy_tac.md` → chép lên tài liệu xác nhận online (ô Xác
      nhận về Chờ) → `dart tool/rule_trace.dart --mark-synced R-VA-3 R-HUD-2`.
- [x] 2. Mặt đất nhiều tầng (`ground.ts` · collision · test `ground.test.ts`: không truyền độ cao = như cũ; đứng
      tầng 1 dưới sàn tầng 2 → cao tầng 1; đi lên dốc cầu thang → lên tầng 2; ở tầng 2 → cao tầng 2) · xong khi test xanh.
- [x] 3. Va chạm theo độ cao (`colliders.ts` · test `colliders.test.ts`: hộp không khoảng cao chặn mọi độ cao như cũ;
      lan can tầng 2 không chặn chân ở tầng 1) · xong khi test xanh.
- [x] 4. Controller truyền độ cao chân (`controller.ts` · player) · xong khi tsc + test cũ xanh.
- [x] 5. Vỏ nhà + lầu sách (`vao_trong.ts`, `lau_sach.ts`, `noi_that.ts`, `rooms.ts`, `world.ts` · scene · test
      `lauSach.test.ts`: đi bộ mô phỏng từ cửa → cầu thang → tầng 2; tầng 1 đi dưới sàn tầng 2 không bị nhấc lên;
      tầng 2 không rơi xuống lỗ cầu thang, không đi ra ngoài tường) · xong khi test xanh.
- [x] 6. Ảnh chụp Canvas 3D (ngoài nhà, trong tầng 1 thấy chân cầu thang, trên tầng 2) → người dùng duyệt.
- [x] 7. Build (`npm run build`) + kiểm tra cuối.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/rule_trace.dart
· thử máy: đi vào Tàng Thư Các (−39; −34), lên cầu thang bên phải, đi quanh tầng 2, xuống lại.

## Kết quả
- Mới: `web/src/scene/kien_truc/cau_thang.ts` (bố cục + dựng cầu thang), test `collision/ground.test.ts`,
  `collision/colliders.test.ts`, `scene/lauSach.test.ts` (đi bộ mô phỏng lên / xuống tầng 2).
- Canvas 3D: `?nv=x,z,y` đặt nhân vật ở độ cao `y` (vd. `?nv=-37,-34,99` = tầng 2 Tàng Thư Các).
- Gian cầu thang: x −33,8…−30,7, chân thang z ≈ −31,8; mỗi vế dài 4,6 m, dốc 30°; tầng 2 cao 6,26 m trên chân nhà.

## Lượt 2 (2026-11-13) — tầng 2 mở, bàn tự học
- Yêu cầu: "ở tàng thư các tầng 2 sẽ là các bàn tự học và xung quanh tôi không muốn đóng kín như hiện tại mã sẽ chỉ có các cột"
- Người dùng chọn: lan can gỗ thấp giữa các cột · án thư ngồi được, không học · bỏ kệ sách tầng 2.
- [x] Quy tắc: R-VA-3 (tầng 2 không tường, chỉ cột + lan can), R-HUD-2 (tầng 2 chỉ mái mờ), mới R-VA-4 (án thư ngồi
      được, chỉ chỗ cùng tầng) — đã chép online + `--mark-synced`.
- [x] `lau_sach.ts`: bỏ tường + kệ tầng 2; cột bốn phía, lan can, 8 án thư + bồ đoàn; `Shell.seats` → `Room.seats` →
      `World.seats`; `main.ts` nút Ngồi xét cả án thư; `nearestSeat(…, y)` bỏ chỗ khác tầng.
- [x] Test `web/src/lauSach.test.ts` (R-VA-4 ×3), build, ảnh Canvas 3D.
