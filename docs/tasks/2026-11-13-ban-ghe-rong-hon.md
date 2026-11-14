# Bàn ghế rộng hơn + camera khi ngồi (L-8)
- Yêu cầu: "bàn ngồi ở các nới đang hơi nhỏ hẹp" — người dùng chọn: mọi nơi (trà lâu, Tàng Thư Các, Kỳ Văn Uyển); hẹp
  kiểu "bàn / ghế nhỏ so người", "ngồi sát nhau", "camera khi ngồi chật"; phóng **×1,3**; camera ngồi **lùi xa + hơi chúc**.
- Loại: sửa ngoại hình + sửa hành vi (camera ngồi) · Cỡ: vừa · Trạng thái: xong (chờ thử máy + chép luật online)

## Phạm vi
**Sẽ sửa**
- `web/src/scene/kien_truc/do_pho.ts` — bàn trà tầng 1 + đôn, sập trà + kỷ, ghế đơn lan can, bàn dài: kích thước ×1,3.
- `web/src/scene/kien_truc/tra_lau.ts` — bàn trà đôi (LOW_W, LOW_H, SEAT_GAP), bồ đoàn, vị trí giữ trong sàn tầng 2.
- `web/src/scene/kien_truc/lau_sach.ts` — án thư (DESK_W/D/H), SEAT_GAP, bồ đoàn.
- `web/src/scene/gameTable.ts` — bàn đá: sâu TOP 1,6 → 2,0, SEAT_Z 1,1 → 1,4, bồ đoàn, mặt cao 0,42 → 0,5.
- `web/src/scene/spec.ts` — `GAME_SLOT` 2,2 → **2,5** (không 2,8: biển tên ở x −29,5 trong `design/scene/scene.json`
  sẽ chạm đầu bàn; `design/` phiên code không sửa); thêm `camera.seated` {dist 5,5, pitch 0,44} có mặc định.
- `web/src/input/orbitCamera.ts` — chế độ ngồi: `sit(on)` dùng dist/pitch ngồi, ngắm thấp hơn 0,3 m; đứng dậy trả góc cũ.
- `web/src/main.ts` — `sitAt` bật camera ngồi; đứng dậy tắt.
- Test: `gamePlay.test.ts`, `zones/seats.test.ts` (toạ độ ghế), `input/orbitCamera.test.ts` (camera ngồi).
- `docs/testing/quy_tac.md` — R-VA-4 (sập 0,35 → 0,45 m), R-NHAC-2 (đôn 0,45 → 0,58 m — phát hiện khi làm), R-GIAO-1 + R-NGOI-1
  (toạ độ ghế), R-NGOI-1 thêm camera ngồi.

**Cần kiểm tra**: `specCheck.ts` (khung bàn chơi = boards × GAME_SLOT + 1), `npm run scene:check`, `zones/seats.ts`
(tầm 1,2 / 1,5 m đo từ ghế — giữ), `gamePlay.ts` `placeCamera` (camera bàn chơi riêng — giữ), lối dải đông tầng 2 trà lâu.

**Không đụng**: bàn học tầng 1 (`noi_that.ts`, không ngồi được), cầm án (không ngồi), bàn cờ / thẻ trên mặt bàn (giữ cỡ).

## Giả định / cần quyết định
- Kỳ Văn Uyển dọc bàn ×1,14 (2,5) thay ×1,3 vì biển tên; ngang bàn vẫn ×1,3. Muốn đủ 2,8 → `/canh` dời biển trước.
- Camera ngồi: lùi 5,5 m (trong nhà tối đa 6 m vẫn giữ), chúc 0,44 rad (~25°). Kéo / zoom khi ngồi vẫn được.

## Nhiệm vụ
- [x] 1. Luật: R-VA-4, R-GIAO-1, R-NGOI-1 (+ camera ngồi) trong `quy_tac.md`.
- [x] 2. Test đỏ: toạ độ ghế bàn chơi (SEAT_Z 1,4, slot 2,5); camera ngồi (orbitCamera).
- [x] 3. `spec.ts`: GAME_SLOT, `camera.seated` + mặc định. `orbitCamera.ts`: `sit(on)`.
- [x] 4. Cảnh: `do_pho.ts`, `tra_lau.ts`, `lau_sach.ts`, `gameTable.ts` ×1,3.
- [x] 5. `main.ts`: bật / tắt camera ngồi.
- [x] 6. Kiểm + `npm run scene:check` + chụp / `npm run dev` xem va chạm, lối đi.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run scene:check && npm run build ·
dart tool/rule_trace.dart

## Kết quả
- Hệ số chung `FURN = 1,3` + `CUSHION_R = 0,42` ở `kien_truc/do_pho.ts`; `tra_lau.ts`, `lau_sach.ts` dùng chung; `gameTable.ts`
  số riêng (TOP_Y 0,5, TOP 2,0, SEAT_Z 1,4, NPC_Z −1,55) + hàm thuần `tableSlots` (test toạ độ ghế thật).
- Tầng 2 trà lâu: sập cách tường sau 0,9 → 1,0; ghế đơn cách mép 1,25 → 1,5. Test "chỗ nào cũng tới được, dải đông trống" xanh.
- Camera ngồi: `OrbitCamera.sit(on)`, `camera.seated` {5,5; 0,44} trong `SceneSpec` (mặc định, scene.json không cần sửa).
- `bàn trà` ngoài sân (`props.ts`, prop `ban-tra`) dùng chung `teaTable` nên cũng ×1,3.
- vitest 145/145, tsc, scene:check không lỗi, build.

