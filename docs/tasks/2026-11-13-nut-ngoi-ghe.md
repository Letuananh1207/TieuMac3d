# Nút "Ngồi" nổi cạnh ghế
- Yêu cầu: "Thay đổi cơ chế ngồi ghế phải nhấn thiền thì lại gần ghế sẽ có hiện nút ngồi xuống hay gì đó" → chọn
  "Nút nổi cạnh ghế" (như nút "Nói chuyện" cạnh NPC; nút Thiền vẫn để thiền)
- Loại: sửa hành vi + giao diện · Cỡ: vừa · Trạng thái: xong (chờ build — cầu thang phiên khác)

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` — luật mới **R-NGOI-1** (đứng cách một chỗ ngồi dưới 1,5 m, không ngồi / thoại / bay → nút nổi
  "Ngồi" trên chỗ đó + vòng sáng dưới bồ đoàn; bấm → ngồi vào đúng chỗ đó; ra xa thì ẩn; nhiều chỗ trong tầm → chỗ gần
  nhất). Sửa R-GIAO-1, R-RAP-1, R-VA-4 (thay "bấm Ngồi" bằng nút nổi), R-DIEU-7 (nút Thiền **luôn** ngồi thiền tại chỗ,
  kể cả cạnh ghế). Chép lên tài liệu online, `--mark-synced`.
- `web/src/zones/seats.ts` (mới, thuần logic) — gom mọi chỗ ngồi (ghế bàn chơi, bồ đoàn rạp, án thư / bàn trà) thành một
  danh sách `{ x, y, z, rotY, kind }`, hàm `seatInRange(seats, pos)` (cùng tầng, < 1,5 m, gần nhất).
- `web/src/gamePlay.ts` — `sitAt(table, seat)` thay `trySit()` tự dò; nút nổi gọi vào.
- `web/src/ui/seatButton.ts` (mới) + `web/index.html` + `web/src/style.css` — nút nổi theo đúng kiểu `TalkButton`
  (`ui/dialogBox.ts`): viên thuốc kính sương, biểu tượng bồ đoàn + nhãn "Ngồi" (rạp: "Ngồi xem", bàn chơi: "Vào bàn").
- `web/src/scene/seatGlow.ts` (mới) — vòng sáng phẳng dưới chỗ ngồi đang nhắm (1 mesh dời chỗ, 1 draw call).
- `web/src/main.ts` — bỏ `sitOrWatch` khỏi nút Thiền / phím C; mỗi khung: tìm chỗ trong tầm → hiện nút + vòng sáng.
  Phím **E** (máy tính) = bấm nút Ngồi.
- Test: `zones/seats.test.ts` (R-NGOI-1), sửa `gamePlay.test.ts` (R-GIAO-1 gọi `sitAt`).
- Phiếu `docs/phieu_thiet_ke/2026-11-13-nut-ngoi.md` — xin canvas vẽ lại nút nổi "Ngồi" + vòng sáng cho khớp (code làm
  trước theo mẫu nút Nói chuyện đã chốt — người dùng chọn).
**Cần kiểm tra** `ui/actionButtons.ts` (nút Thiền), `input/keyboard.ts` (phím C, E), Canvas 3D.
**Không đụng** cầu nối, Flutter.

## Nhiệm vụ
- [x] 1. Sổ: R-NGOI-1 mới + sửa R-GIAO-1, R-RAP-1, R-VA-4, R-DIEU-7 → online → mark-synced.
- [x] 2. Test đỏ `seats.test.ts` + sửa `gamePlay.test.ts`.
- [x] 3. `zones/seats.ts` + `gamePlay.sitAt` — test xanh.
- [x] 4. `seatButton.ts` + DOM/CSS + `seatGlow.ts` (ui, scene).
- [x] 5. Ghép `main.ts`, phím E; nút Thiền chỉ thiền.
- [x] 6. Phiếu thiết kế (`docs/phieu_thiet_ke/2026-11-13-nut-ngoi.md`); build **chặn** — xem Kết quả.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/rule_trace.dart

## Kết quả
- R-NGOI-1 mới; R-DIEU-7, R-GIAO-1, R-RAP-1, R-VA-4 sửa — sổ + online (Xác nhận: Chờ) + mark-synced; App `ok`.
- `zones/seats.ts` (`seatInRange`, `SEAT_RANGE`, `SEAT_LABEL`), `gamePlay.seatSpots/sitAt`, `ui/seatButton.ts` + `#seat`
  (dùng chung CSS `#talk`), `scene/seatGlow.ts` (1 draw call), `main.ts` (nút Thiền / phím C chỉ thiền; phím E = nút nổi).
- Test: `zones/seats.test.ts` 6 + `gamePlay.test.ts` 2 mới — xanh. `npx tsc` sạch phần này.
- **Chưa build được**: `npm run build` dừng ở kiểm kiểu vì `cau_thang.ts` / `tra_lau.ts` / `lau_sach.ts` (+ 2 file test)
  đang sửa dở ở phiên khác (`zFront`, `zLanding`, `floorAroundWell`). Phiên đó xong → `npm run build`.
