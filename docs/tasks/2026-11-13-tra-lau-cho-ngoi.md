# Trà lâu: thêm kiểu chỗ ngồi
- Yêu cầu: "Ở trà lâu thì chỉ có bàn ghế ngồi 2 người nhưng tôi muốn có các sự lựa chọn khác" → chọn: **sập trà (kỷ trà)**,
  **ghế đơn sát lan can**, **bàn dài tụ hội**
- Loại: sửa cảnh + hành vi · Cỡ: vừa · Trạng thái: chờ duyệt (làm sau `2026-11-13-nut-ngoi-ghe` — dùng nút nổi)

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` — R-VA-4 phần trà lâu: tầng 2 Phẩm Minh Các bày lại thành
  - **2 sập trà**: sập gỗ thấp (cao 0,35) có tựa ba mặt, kỷ trà ở giữa, 2 chỗ ngồi đối diện trên sập;
  - **4 ghế đơn sát lan can** (2 mặt trước, 2 mặt hồi): bàn nhỏ + bồ đoàn, người ngồi **quay ra ngoài** nhìn núi, camera
    nhìn ra cảnh;
  - **1 bàn dài tụ hội** 6 chỗ (3 mỗi bên);
  - giữ **2 bàn trà đôi** cũ. Tổng ≈ 18 chỗ (cũ 12). Số đo chốt khi đọc kích thước tầng 2 trong `traLauLayout`.
  Ngồi bằng nút nổi (R-NGOI-1). Dáng ngồi: xếp bằng như bồ đoàn (nhân vật chưa có dáng ngồi ghế cao — sập / ghế đơn đều
  là ngồi bệt, hợp cổ trang).
- `web/src/scene/kien_truc/do_pho.ts` — thêm `teaBed()` (sập + kỷ), `soloSeat()` (bàn nhỏ + bồ đoàn), `longTeaTable()`.
- `web/src/scene/kien_truc/tra_lau.ts` — bày tầng 2 mới, trả `seats` (có y sập), vật cản.
- `web/src/scene/kien_truc/tra_lau.test.ts` (nếu có) / test bố cục: số chỗ, ghế lan can nhìn ra ngoài, không chặn cầu thang.
**Cần kiểm tra** `rooms.ts` (`addWalkIn` đọc `seats`), ngân sách (đồ gỗ đứng yên → gộp, ≈ +2 draw call, +2–3k tam giác).
**Không đụng** tầng 1, quầy trà (tiểu nhị — kế hoạch NPC).

## Nhiệm vụ
- [ ] 1. Sổ R-VA-4 → online → mark-synced.
- [ ] 2. Test đỏ bố cục chỗ ngồi tầng 2.
- [ ] 3. Đồ gỗ mới `do_pho.ts`.
- [ ] 4. Bày tầng 2 `tra_lau.ts` — test xanh.
- [ ] 5. Build + Canvas 3D (chụp tầng 2) + ngân sách.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/rule_trace.dart
