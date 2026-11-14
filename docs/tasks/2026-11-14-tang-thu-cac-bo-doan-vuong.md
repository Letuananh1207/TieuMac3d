# Tàng Thư Các tầng 2: chỉ bồ đoàn vuông
- Yêu cầu: "tôi muốn ở tầng trên của tàng thư các không có bàn mà chỉ có các bồ đoàn và nên đặt nhiều hơn và hình dạng là vuông"
- Loại: sửa hành vi · Cỡ: nhỏ · Trạng thái: xong

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` (+ tài liệu online) — R-VA-4: bỏ án, 24 bồ đoàn vuông 4 × 6, nhìn nam, không chặn.
- `web/src/lauSach.test.ts` — test R-VA-4 theo luật mới.
- `web/src/scene/kien_truc/lau_sach.ts` — bỏ `studyDesk` + va chạm án, dựng lưới bồ đoàn vuông.

**Cần kiểm tra** `web/src/scene/zfight.test.ts` (dựng `lauSach`), `zones/seats.ts` (`nearestSeat`).

**Không đụng** tầng 1 Tàng Thư Các, trà lâu (bồ đoàn tròn giữ nguyên), `do_pho.ts`.

## Giả định / cần quyết định
- Người dùng chọn: 24 chỗ (4 hàng × 6), tất cả nhìn về nam.
- Cạnh bồ đoàn 1,9 × `CUSHION_R` ≈ 0,8 m, dày 0,12; x = −7…3 (bước 2), z = −2,7 / −1 / 0,7 / 2,4.
- Draw call: 24 hộp thay ~64 mesh (8 án × 7 + 8 bồ đoàn) → giảm.

## Nhiệm vụ
- [x] 1. Sửa R-VA-4 trong sổ, chép lên tài liệu online, `--mark-synced R-VA-4`.
- [x] 2. Test: 24 chỗ 4 × 6, nhìn nam, trong lan can, dải đông trống; đi xuyên cột bồ đoàn không bị chặn.
- [x] 3. Code `lau_sach.ts` (lớp scene).
- [x] 4. `npm run build`.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/rule_trace.dart
