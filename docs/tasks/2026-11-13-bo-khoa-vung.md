# Bỏ khoá vùng theo tiến độ học
- Yêu cầu: "Tôi muốn bỏ cơ chế khóa map cấp độ học như hiện tại thay vào đó mọi người có thể đi khắp nơi"
- Loại: xoá (cơ chế mở vùng theo số chữ / bộ thủ) · Cỡ: vừa · Trạng thái: xong
- Quyết định của người dùng: **xoá hẳn** (không giữ code khoá để bật lại).

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` — R-HANH-1 (bỏ mốc, mọi vùng mở; chỉ còn điều kiện "đã dựng cảnh"), R-HANH-2 (bỏ "nơi khoá"
  + thẻ "cần … chữ"), R-HANH-3 (bỏ câu "Học đủ 50 bộ thủ → Giang Nam mở").
- `docs/bridge.md` — `getProgress`: bỏ `open`, `need`.
- `app/lib/journey/journey.dart` — xoá `Region`, `regions`, `Progress.openRegions`, `Progress.needs`; giữ
  `rungTrucRadicalCount` (bảng nhiệm vụ còn dùng) và `Progress` (chữ, bộ thủ đã học).
- `app/lib/scene/scene_event.dart` — `progressReply` bỏ `open`, `need`.
- `app/lib/main.dart` — sửa chú thích "chỉ Rừng trúc mở".
- `web/src/bridge/flutterBridge.ts` — `JourneyProgress` bỏ `open`, `need`; `parseProgress` không đòi `open` nữa.
- `web/src/zones/journeyMap.ts` — bỏ trạng thái `khoa`, `placeStates` bỏ tham số `open`.
- `web/src/scene/banDo.ts` — bỏ nhánh vẽ `khoa` (đĩa mờ + huy hiệu khoá); hiệu ứng "vừa chạm" giữ cho `sapMo`.
- `web/src/ui/mapHud.ts` — thẻ chỉ còn "<chữ Hán> <tên> — sắp mở"; bỏ `chars` / `radicals` và dòng "Bạn đã học N chữ".
- `web/src/main.ts` — bỏ `fallbackOpen`, `?mo=`, `openList`, biến `open`; nhánh chạm nơi chưa có cảnh.
- `web/src/designPreview.ts`, `web/src/scene/loadSpec.ts` — gọi `placeStates` mới, sửa chú thích.
- Test: `app/test/rules/hanh_trinh_test.dart`, `app/test/scene/scene_event_test.dart`, `web/src/bridge/flutterBridge.test.ts`.

**Cần kiểm tra** `app/lib/journey/progress_store.dart` (dùng `Progress`, `rungTrucRadicalCount`), `nhiem_vu_test.dart`.

**Không đụng**
- Vùng chưa dựng cảnh (Giang Nam, Bồng Lai, Trường Thành, Tử Cấm Thành, Tơ lụa) vẫn "sắp mở", chưa đi được — chỉ đi
  được Rừng trúc + tông môn cho tới khi `/canh` dựng thêm vùng.
- Đếm chữ / bộ thủ đã học, lịch ôn, bảng nhiệm vụ vẫn giữ (là tiến độ học, không phải khoá).
- `design/scene/ban-do/` còn kiểu vẽ `khoa` — phiên code không sửa `design/`; trường thừa, code bỏ qua.
- Học bộ mới chỉ ở Rừng trúc (R-VUNG-1) — giữ.

## Giả định / cần quyết định
- Thẻ "sắp mở" bỏ dòng "Bạn đã học N chữ." (dòng đó chỉ có nghĩa khi còn mốc).

## Nhiệm vụ
- [x] 1. Sổ quy tắc: sửa R-HANH-1/2/3 (App = `sửa`), chép lên tài liệu online (ô Xác nhận về Chờ), `--mark-synced`.
- [x] 2. `docs/bridge.md`: `getProgress` bỏ `open`, `need`.
- [x] 3. Test Dart đỏ trước: `hanh_trinh_test` (không còn mốc; tiến độ chữ vẫn lưu), `scene_event_test` (không `open`/`need`).
- [x] 4. Dart: `journey.dart`, `scene_event.dart`, `main.dart` (lớp `app/lib`) · xong khi `flutter test` xanh.
- [x] 5. Web: `flutterBridge.ts` + test → `journeyMap.ts` → `banDo.ts` → `mapHud.ts` → `main.ts`, `designPreview.ts`,
  `loadSpec.ts` · xong khi `tsc` + `npm test` xanh; bản đồ: Rừng trúc + tông môn đi được, nơi khác "sắp mở".
- [x] 6. Kiểm tra cuối + `npm run build`.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · cd app && flutter analyze ·
flutter test -r failures-only test/rules test/scene · dart tool/rule_trace.dart
