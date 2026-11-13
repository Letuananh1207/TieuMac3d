# Trà lâu lên được tầng 2, thoáng như Tàng Thư Các
- Yêu cầu: "tầng 2 của trà lâu tôi cũng muốn thoáng như ở tàng thư các"
- Loại: sửa hành vi · Cỡ: vừa · Trạng thái: xong

## Phạm vi
**Sẽ sửa** `docs/testing/quy_tac.md` (R-VA-3, R-VA-4) + tài liệu online · `web/src/scene/kien_truc/tra_lau.ts` (cầu thang
gian hồi phải, sàn + cột + lan can tầng 2, `fadeLow`, bàn trà + bồ đoàn tầng 2, va chạm theo tầng) · test thang
(`cau_thang` / `flightSlope`) · `npm run build`.
**Cần kiểm tra** `scene/rooms.ts` `addWalkIn` (truyền `fadeLow`, `upperY`, `seats` cho mọi kiểu) · `main.ts` ngồi bồ đoàn (R-VA-4).
**Không đụng** Tàng Thư Các, cửa hàng, hí đài.

## Quyết định (người dùng 2026-11-13)
- Tầng 2: bàn trà thấp ngồi được (bồ đoàn, như án thư R-VA-4).
- Tầng 1: cầu thang ở gian hồi phải; bàn trà gian đó bỏ → 2 bàn (gian trái + giữa), quầy trà giữ.

## Nhiệm vụ
- [x] 1. Sổ quy tắc + online + `--mark-synced R-VA-3 R-VA-4`.
- [x] 2. `tra_lau.ts` tầng 2 + cầu thang + chỗ ngồi.
- [x] 3. Test thang trà lâu ≤ 35°; chụp kiểm; build.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/rule_trace.dart

## Kết quả
- `web/src/traLau.test.ts` 6 test (thang ≤ 35°, lên tầng 2, lan can mặt tiền, tầng 1 dưới sàn, mờ theo tầng, 12 chỗ ngồi) — đỏ trước, xanh sau; `lauSach.test.ts` vẫn xanh.
- `lau_sach.ts` mở `upperRail` dùng chung. Ảnh kiểm Canvas 3D (scratchpad).
