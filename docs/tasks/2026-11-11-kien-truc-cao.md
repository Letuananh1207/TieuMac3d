# Kiến trúc cao hơn cho đúng tỉ lệ (`buildingStyle.heightScale`)

- Yêu cầu: "Kiến trúc cao hơn cho đúng tỉ lệ: thêm trường đặc tả hệ số chiều cao kiến trúc (vd.
  buildingStyle.heightScale, mặc định 1 — cảnh cũ không đổi), nhân vào chiều cao cột, tường thân nhà, cửa, mái, tầng
  tháp, cổng sơn môn, nền nhà; cổng trăng theo chiều cao tường. Nội thất: bảng đen, bục to theo nhà; án thư, kệ, án đọc
  giữ cỡ người nhưng thêm hàng / thêm kệ cho đầy phòng to. Thiết kế sẽ đặt 1,6. Lưu ý: design/scene/scene.json trong
  máy đã phóng bố cục ×1,6 (chưa commit) — ví dụ của R-VA-1, R-HUD-1 và test nào đọc toạ độ từ scene.json sẽ lệch, cần
  cập nhật."
- Loại: dữ liệu (trường đặc tả mới) + sửa cảnh · Cỡ: vừa · Trạng thái: xong, chờ thiết kế đặt 1,6 + xem trên máy

## Phạm vi

**Sẽ sửa**
- `web/src/scene/spec.ts`, `scene/specCheck.ts` — `buildingStyle.heightScale` (số, mặc định 1; kiểm 0,5–3).
- `web/src/scene/kien_truc/dien.ts` — điện, giảng đường: nền, cột, tường, mái (cao), thân trên điện; `HALL_FLOOR`
  thành hàm theo hệ số (sàn trong nhà).
- `web/src/scene/kien_truc/chi_tiet.ts` — bậc: thêm số bậc theo chiều cao nền (mỗi bậc giữ cỡ người); cửa theo chiều
  cao cột (đã theo `colH`); biển, đèn lồng, lan can giữ cỡ.
- `web/src/scene/kien_truc/nha_thap.ts` — nhà nhỏ (nền, tường, khung, cửa, mái; cửa sổ tròn giữ tròn), tháp (chân, mỗi
  tầng, vành hiên, mái nhọn, cột đồng).
- `web/src/scene/gate.ts` — cổng sơn môn: chiều cao trụ, xà, mái ×hệ số (bề rộng giữ).
- `web/src/scene/kien_truc/tuong.ts` — cổng trăng theo chiều cao tường (xem quyết định 1).
- `web/src/scene/rooms.ts` — sàn + dốc bậc theo nền mới (dốc ≤ 35°, R-VA-2), va chạm cửa / lan can giữ.
- `web/src/scene/kien_truc/noi_that.ts` — bảng đen, bục to theo nhà; án thư xếp thêm hàng / cột, kệ thêm theo chiều dài
  tường, án đọc giữ cỡ (thư viện to thì thêm kệ đứng giữa phòng nếu còn chỗ).
- `docs/testing/quy_tac.md` — ví dụ toạ độ theo bố cục ×1,6: R-VUNG-1, R-VUNG-2, R-VA-1, R-VA-3, R-HUD-1, R-HUD-3 →
  tài liệu online (nội dung đổi → ô Xác nhận về Chờ) → `--mark-synced`.

**Cần kiểm tra**: `scene/buildings.ts` (`notice` cao 1,9 m — giữ cỡ người), `scene/world.ts` (bục nhà, `zoneAnchors`),
`main.ts` (thầy đứng trên bục — y theo bục), `orbitCamera` trong nhà (≤ 6 m — R-HUD-2 giữ; nhà cao ~5 m vẫn vừa),
`check-scene.mjs` (in hệ số), Canvas 3D đo draw call (≤ 150).

**Không đụng**: nhân vật (cao ~2,2 m — chính là thước chuẩn), tốc độ, tường sân (chiều cao do thiết kế đặt ở
`walls.height`), cây, địa hình, HUD.

## Giả định / cần quyết định

1. **Cổng trăng** — đã chọn (2026-11-11): **thu vòm vừa tường** — vòm vẫn tròn, bán kính theo chiều cao tường (đỉnh vòm cách mái tường 0,6 m), tấm cổng bằng tường; lối đi hẹp lại tương ứng. Bối cảnh: tường sân trong máy cao 4,5 m, khe cổng 6,4 m → vòm tròn đường kính 6,4 m đỉnh ở
   5,1 m, cao hơn tường; code hiện đẩy tấm cổng nhô lên 5,7 m.
2. Cách làm (đã chọn): hệ số truyền vào từng phần qua `style.heightScale`, không kéo giãn cả nhóm (kéo giãn làm méo
   biển chữ, đèn lồng, cửa sổ tròn, và dốc bậc vượt 35° → không vào được nhà).
3. Giữ cỡ người (không nhân hệ số): bậc (mỗi bậc ~0,15 m — thêm bậc), lan can, đèn lồng, biển chữ, cửa sổ tròn, bảng
   thông báo, án thư, bồ đoàn, kệ (chiều cao kệ nhân nhẹ? — giữ 2 m), án đọc, bục (cao 0,2 m; rộng theo nhà).
4. Camera trong nhà vẫn tối đa 6 m (R-HUD-2 không đổi).
5. Hệ số mặc định 1 → cảnh cũ y nguyên (Canvas 3D bản không có trường phải giống trước).

## Nhiệm vụ

- [x] 1. Trường `heightScale` (spec + specCheck + check-scene in ra) — xong khi `scene:check` báo đọc được, mặc định 1.
- [x] 2. Điện + giảng đường + chi tiết (bậc theo nền) — lớp scene · xong khi hệ số 1 giống hệt, 1,6 cao đúng.
- [x] 3. Nhà nhỏ + tháp.
- [x] 4. Cổng sơn môn.
- [x] 5. Cổng trăng theo quyết định 1.
- [x] 6. Nhà vào được: sàn, dốc bậc (≤ 35°), va chạm; thầy đứng đúng trên bục.
- [x] 7. Nội thất: bảng, bục theo nhà; án thư / kệ thêm hàng; điểm học + hộp chạm theo bảng mới.
- [x] 8. Sổ: cập nhật ví dụ 6 luật theo toạ độ `scene:check` + đo trong code → online → `--mark-synced`.
- [x] 9. Build + Canvas 3D: draw call (ước +0–5: nội thất mới gộp theo vật liệu), chụp giảng đường / thư viện / cổng.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npm run scene:check && npx tsc --noEmit && npm run build && npm run build:design ·
cd app && flutter analyze · dart tool/rule_trace.dart

## Kết quả (2026-11-11)

- Thử với hệ số 1,6 (tạm ép trong Canvas 3D, đã hoàn lại): giảng đường 5 bậc, nền 0,96 m, 24 án thư (6 × 4), bảng 6,4 × 2,56 m; thư viện kệ bên dài 6,6 m + 2 kệ đứng; cổng trăng đỉnh 3,9 m, lối đi 3,9 m.
- Nhà cỡ gốc với hệ số 1: nội thất ra đúng mặt bằng cũ (4 án, kệ bên 3 m, không kệ đứng) — kiểm bằng script.
- Draw call trên xuống 141 (≤ 150). Tam giác ~182,5k: **vượt ngân sách 150k từ trước** (địa hình + bố cục ×1,6; hệ số 1 cũng 182,9k); việc này chỉ thêm ~3–4k.
- Sổ: ví dụ R-VUNG-1, R-VUNG-2, R-VA-1, R-VA-3, R-HUD-1, R-HUD-3 theo bố cục ×1,6 + hệ số 1,6, đã đồng bộ online (Chờ).
