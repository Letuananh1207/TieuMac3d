# Đổi tên: app "Tiểu Mặc 3D", trung tâm "Khởi Nguyên Trấn"
- Yêu cầu: "tôi không muốn tên là văn uyên tông nữa mà cả ứng dụng tên Tiểu Mặc 3D còn phần trung tâm hãy tìm 1 cái tên
  khác phù hợp với vai trò của nó" → người dùng chọn **Khởi Nguyên Trấn** (起源鎮 — nơi chung, ai cũng bắt đầu ở đây, trung
  tâm nối đi mọi vùng); **chỉ đổi tên hiển thị**, giữ mã nội bộ.
- Loại: sửa (chuỗi giao diện + dữ liệu thiết kế + luật) · Cỡ: vừa · Trạng thái: xong

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` — R-VUNG-1, R-NPC-2 (ví dụ trích lời thoại), R-HANH-2, R-MAN-2: "Văn Uyên Tông" → "Khởi
  Nguyên Trấn"; chép lên tài liệu online (nội dung đổi → ô Xác nhận về Chờ), `--mark-synced`.
- `design/scene/scene.json` — `site.name` "Văn Uyên Tông" → "Khởi Nguyên Trấn"; biển cổng `han` "文淵宗" → "起源鎮".
- `design/scene/ban-do/` — nơi `van-uyen`: `ten` "Khởi Nguyên Trấn", `han` "起源"; vẽ lại ảnh giấy (tên trên bản đồ).
- `design/l10n/vi.arb` — `siteName`, `siteHan`, `placeVanUyen`, `dailyEyebrow`; `design/CHANGELOG.md` mục mới.
- `web/src/zones/dialogs.ts` — 3 câu nhắc tên / "tông" (bảng dưới).
- `web/src/scene/truyenTong.ts` — phù hiệu trong vòng trận 文淵 → 起源; `web/src/designPreview.ts` nạp font chữ mới.
- `web/index.html` — `<title>` "Tiểu Mặc 3D"; nhãn "Văn Uyên Tông · cổng nam" → "Khởi Nguyên Trấn · cổng nam".
- `app/lib/lesson/daily_screen.dart` — nhãn như trên; `app/lib/main.dart` `title`.
- Tên app trên máy: `app/android/app/src/main/AndroidManifest.xml` `android:label`, `app/ios/Runner/Info.plist`
  `CFBundleDisplayName`, `app/web/index.html` + `app/web/manifest.json` (tên, mô tả).
- `app/test/scene/review_event_test.dart` — chuỗi vùng mẫu.

**Không đụng** (người dùng chọn "chỉ tên hiển thị")
- Mã nơi `van-uyen`, cảnh `tong-mon`, tên gói Flutter `hoc_xa_3d`, bundle id, tên skill / thư mục `hoc-xa-3d-*`, chú thích code.
- "Văn Uyên Các" 文淵閣 ở `tu-cam-thanh.json` — toà nhà có thật trong Tử Cấm Thành, không phải tên trung tâm.
- Tài liệu lịch sử (`design/CHANGELOG.md` mục cũ, `docs/tasks/` cũ).

## Lời thoại đổi (đề xuất)
| NPC | Cũ | Mới |
|---|---|---|
| Tiểu Mặc | "Đạo hữu mới đến Văn Uyên Tông à? Tiểu Mặc là đệ tử ngoại môn, hôm nay được giao trông bảng nhiệm vụ hằng ngày của tông đó!" | "Đạo hữu mới đến Khởi Nguyên Trấn à? Ai cũng bắt đầu từ đây đó! Hôm nay Tiểu Mặc được giao trông bảng nhiệm vụ hằng ngày của trấn." |
| Tiểu Mặc | "…Việc tông giao mỗi ngày đều dán ở bảng này…" | "…Việc trấn giao mỗi ngày đều dán ở bảng này…" |
| Mặc Ông | "…Văn Uyên Tông tu bằng chữ — muốn học, con phải đi qua đài sang các vùng." | "…Khởi Nguyên Trấn là nơi mọi người bắt đầu, đường nào cũng qua đây — muốn học, con phải đi qua đài sang các vùng." |
| Mặc Ông | "…chọn Văn Uyên Tông." | "…chọn Khởi Nguyên Trấn." |

## Thêm (người dùng đồng ý)
- Tên khu kiểu môn phái: Sơn Môn → Cổng Trấn, Ngoại Môn → Quảng Trường, Nội Môn → Thượng Trấn; "tông môn" → "trấn" trong
  luật / lời; màn tải "Đang mở sơn môn…" → "Đang mở đường…"; `npcChatter.ts`, `loadingScreen.ts`. 14 quy tắc đổi chữ.

## Nhiệm vụ
- [x] 1. Sổ quy tắc (4 mã) → tài liệu online → `--mark-synced` · xong khi `rule_trace` không báo "Chưa đồng bộ".
- [x] 2. Thiết kế: `scene.json`, `ban-do.json` + vẽ lại giấy, `vi.arb`, mục CHANGELOG · xong khi `npm run scene:check` "Không có lỗi".
- [x] 3. Test đổi chuỗi trước: `review_event_test.dart`; test TS nhắc tên (nếu có).
- [x] 4. Web: `dialogs.ts`, `truyenTong.ts`, `designPreview.ts`, `index.html` · xong khi `tsc` + `npm test` xanh.
- [x] 5. App: `daily_screen.dart`, `main.dart`, Android / iOS / web tên app · xong khi `flutter analyze` + test xanh.
- [x] 6. Kiểm tra cuối + `npm run build`.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · cd app && flutter analyze ·
flutter test -r failures-only test/scene test/rules · dart tool/rule_trace.dart
