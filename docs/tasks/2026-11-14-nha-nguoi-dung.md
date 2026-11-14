# Nhà người dùng — Nhà của ta (nhà riêng, vườn, trang trí)
- Yêu cầu: "tạo 1 khu map riêng gọi là nhà người dùng cho phép người dùng có nhà riêng vườn và trang trí được"
- Loại: thêm · Cỡ: lớn · Trạng thái: đang làm

Đã chọn (người dùng, 2026-11-14):
- Đi tới bằng **một nơi mới trên bản đồ truyền tống** (như các vùng; vòng trận ở chỗ xuất hiện để quay về).
- Mốc đầu trang trí bằng **ô đặt sẵn + danh mục** (chạm ô → chọn vật / gỡ). Đặt tự do để mốc sau.
- Đồ trang trí **sau này mua bằng tiền tệ riêng** (kiếm bằng chơi game…). Mốc này chưa có tiền: mọi vật trong danh
  mục đều sở hữu sẵn, nhưng dữ liệu đã tách "sở hữu" khỏi "đang đặt" và mỗi vật có trường `price` để gắn cửa hàng sau.

## Phạm vi
**Sẽ sửa**
- `web/src/scene/spec.ts` + `scene/decorSlots.ts` (kiểm ô) — trường mới `decorSlots` (ô trang trí: mã, loại ô `vuon | san | trong`, x, z, hướng),
  mặc định rỗng → cảnh cũ không đổi.
- `web/scripts/check-scene.mjs` — kiểm ô: trùng mã, nằm trong nền, không đè tường / lối đi, cách nhau đủ.
- `web/src/zones/decor.ts` (mới) — danh mục vật (mã, tên Việt, chữ Hán, loại ô nhận được, `price`) + luật thuần:
  đặt / gỡ / thay, vật hợp loại ô, trạng thái `{placed, owned}`; test vitest.
- `web/src/scene/decorItems.ts` (mới) — dựng mesh từng vật bằng khối có sẵn (`cay_moi`, `do_pho`, `noi_that`…),
  vật va chạm thì thêm collider; dựng lại một ô khi đổi.
- `web/src/homeDecor.ts` (mới) — ghép: ô sáng khi tới gần, nút / chế độ trang trí, gọi cầu nối, dựng lại ô.
- `web/src/main.ts` — gọi `homeDecor` khi cảnh hiện tại có `decorSlots`.
- `web/src/ui/` — HUD trang trí (**chờ thiết kế**, phiếu `2026-11-14-nha-nguoi-dung`).
- `web/src/bridge/flutterBridge.ts` + `docs/bridge.md` — sự kiện `getHome`, `setDecor`.
- `app/lib/journey/progress_store.dart` — khoá `nha.dat` (ô → vật), hàm `placeDecor` — chưa lưu "sở hữu" (giai đoạn này sở hữu hết; có tiền tệ thì thêm khoá `nha.so-huu`).
- `app/lib/scene/scene_event.dart`, `app/lib/main.dart` — xử lý hai sự kiện mới.
- `docs/testing/quy_tac.md` — mục mới **NHA** (R-NHA-1…4).
- Test: `web/src/zones/decor.test.ts`, `app/test/rules/nha_test.dart`, `app/test/scene/scene_event_test.dart`.

**Cần kiểm tra**: `web/src/scene/loadSpec.ts` (`REGION_SCENES` tự nhận file `design/scene/nha-ta.json`),
`web/src/zones/journeyMap.ts` + `ui/mapHud.ts` (nơi mới trên bản đồ), `zones/areaTracker.ts` (tên khu),
`designPreview.ts` (Canvas 3D hiện ô trang trí), `tool/check.dart` (file mới đúng lớp).

**Không đụng**: cảnh tông môn và 6 vùng; nhân vật / controller; luật học, ôn, nhiệm vụ; chat. Không có thăm nhà
người khác (cần multiplayer / backend — ngoài giai đoạn này).

## Giả định / cần quyết định
- **Tên khu** (người dùng chốt 2026-11-14): **Nhà của ta 我家** — mã cảnh `nha-ta`; 我家 là từ HSK 1.
- Bố cục mốc đầu: một tiểu viện tứ hợp nhỏ (nhà chính 3 gian mở vào được + sân trước + vườn bên), ~12 ô:
  6 ô vườn (cây, hoa, đá cảnh, ao nhỏ), 3 ô sân (đèn lồng, bàn trà, chậu cảnh), 3 ô trong nhà (tranh chữ, kệ, án).
- Danh mục mốc đầu ~12–15 vật, dựng bằng khối low-poly có sẵn (không model AI).
- Lưu trên máy qua Flutter (như tiến độ học). Chạy `npm run dev` không có Flutter → giữ trong bộ nhớ, tắt là mất.
- Hiệu năng: cảnh nhỏ; mỗi vật 1–3 draw call (gộp theo vật liệu) → tối đa +36, cảnh tổng ước < 120 draw call.

## Nhiệm vụ
- [x] 1. Sổ quy tắc mục NHA: R-NHA-1 đi tới / về (nơi trên bản đồ, vòng trận), R-NHA-2 ô + loại ô + đặt / gỡ / thay,
      R-NHA-3 lưu qua tắt app, của riêng từng người, R-NHA-4 danh mục + sở hữu (mốc này sở hữu hết) → chép lên tài
      liệu online → `--mark-synced`. (`docs/testing/quy_tac.md` · xong khi người dùng xác nhận)
- [x] 2. `decorSlots` trong `SceneSpec` + mặc định rỗng + `check-scene.mjs` kiểm ô. (scene/spec · xong khi
      `npm run scene:check` qua với cảnh cũ không đổi)
- [x] 3. Danh mục + luật trang trí thuần `zones/decor.ts` + vitest theo R-NHA-2/4. (zones · `npm test`)
- [ ] 4. (đã dựng, chờ duyệt — cần thêm kiểu nhà `nha-o`: `scene/kien_truc/nha_o.ts`) **Thiết kế cảnh** `design/scene/nha-ta.json` bằng `/canh` (nhà, sân, vườn, vòng trận về, các ô) — cho
      duyệt trên Canvas 3D rồi mới chốt. (design · xong khi chốt mục trong `design/CHANGELOG.md`)
- [ ] 5. **Thiết kế** nơi mới trên bản đồ + HUD trang trí — chờ thiết kế (`docs/phieu_thiet_ke/2026-11-14-nha-nguoi-dung.md`).
- [ ] 6. Dựng mesh vật `scene/decorItems.ts` (+ collider vật to) và ô trống hiện mờ trong chế độ trang trí. (scene)
- [x] 7. Cầu nối `getHome` / `setDecor`: `docs/bridge.md` trước → `flutterBridge.ts` + test → `ProgressStore` +
      `scene_event.dart` + test Dart R-NHA-3. (bridge · app · xong khi test hai phía xanh)
- [ ] 8. Ghép `homeDecor.ts` + `main.ts`; HUD theo thiết kế ở nhiệm vụ 5. (ui · ghép — sau nhiệm vụ 5)
- [ ] 9. Bản đồ: thêm nơi `nha-ta` vào `journeyMap` theo `ban-do.json` mới. (zones · ui — sau nhiệm vụ 5)
- [ ] 10. Build + thử máy: vào Nhà của ta, đặt 3 vật, tắt app mở lại → còn nguyên.

Làm được ngay không chờ thiết kế: 1, 2, 3, 7 (và 6 phần dựng mesh). 4 làm bằng `/canh` (phiên này làm thay được, cho
duyệt). 5 cần `/ui-design` trên canvas; 8–9 đợi 5.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · cd app && flutter analyze ·
flutter test -r failures-only test/rules test/scene · dart tool/rule_trace.dart
