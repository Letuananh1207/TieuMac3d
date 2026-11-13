# Nhiệm vụ hằng ngày (日課榜) + ôn tập theo lịch
- Yêu cầu: "Tiểu Mặc sẽ đứng ở bảng thông báo" → "bảng … là nhiệm vụ hàng ngày" → "đồng ý hãy lần lượt làm". Chốt
  2026-11-13: việc = **lĩnh hội từ mới + ôn tập**; **3 mới/ngày + ôn theo ngày lấy quy luật Hán Tự Ký**
  (`Start up/Han_tu_ky` — `lib/domain/rules/review_rules.dart`, sổ R-ON-1…7, R-DD-1/3); ôn **bằng câu đố**; thưởng =
  **chuỗi ngày liên tiếp**; mở bảng **cả hai** cách (nút ở bảng + hỏi Tiểu Mặc).
- Loại: thêm · Cỡ: lớn · Trạng thái: xong (giao diện áp từ thiết kế 2026-11-13.25)

## Quy luật mang sang (Hán Tự Ký → Học Xá 3D)
| Hán Tự Ký | Học Xá 3D (đề xuất) |
|---|---|
| R-HOC-4: học xong → lịch ôn, hạn ngày mai | bấm "đã học" ở thẻ bộ thủ → bậc 1 ngày, hạn ngày mai |
| R-ON-1: bậc 1 · 3 · 7 · 14 · 30 · 60 · 120 ngày; hạn tính từ **hôm ôn**, trễ không phạt | giữ nguyên |
| R-ON-2: mỗi chữ 2 câu **Pinyin → Nghĩa**, chấm sau câu 2; đúng 2/2 → lên 1 bậc | giữ (3 phương án: đáp án + 2 của bộ khác) |
| R-ON-3/4: 1/2 → lùi 1 bậc; 0/2 → bậc 1, hạn mai, quên +1 | giữ |
| R-ON-5: bậc 120 đúng 2/2 → đã thuộc, 180 ngày mới hỏi lại | giữ |
| R-ON-6: quên ≥ 3 → chữ khó (mẹo nhớ, xếp đầu) | **để sau** (bộ thủ chưa có dữ liệu mẹo nhớ) — chỉ đếm "quên" |
| R-ON-7: đến hạn = hạn ≤ hôm nay, chưa ôn hôm nay; không giới hạn; thứ tự bậc thấp → trễ lâu → thứ tự học | giữ (bỏ "chữ khó") |
| R-DD-1: mỗi ngày 2 việc Học (mục tiêu 3) + Ôn (hết đến hạn; không có = xong) | giữ, mục tiêu 3 cố định; học hết 50 bộ → việc Học tự xong |
| R-DD-2: điểm danh bấm 到 mới tính | **tự tính**: xong cả 2 việc → ngày đó tính (không có nút điểm danh) |
| R-DD-3: chuỗi liên tiếp, bỏ 1 ngày về 0, giữ kỷ lục | giữ |

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` — nhóm mới **R-NV** (bảng, 2 việc, chuỗi, cách mở) + **R-ON** (lịch ôn, câu đố); R-HANH-3
  (ngồi thiền: còn bộ đến hạn → lượt ôn trước, hết đến hạn → thẻ bộ mới) → online → `--mark-synced`.
- `app/lib/journey/` — `review.dart` (mới: bậc, hạn, chấm, thứ tự đến hạn — thuần Dart), `daily.dart` (mới: 2 việc
  trong ngày, chuỗi), `progress_store.dart` (lưu lịch ôn từng bộ, số bộ mới hôm nay, ngày đã xong, chuỗi / kỷ lục).
  Bộ đã học trước đợt này → vào lịch, bậc 1, hạn hôm nay.
- `app/test/rules/` — test R-ON, R-NV theo ví dụ trong sổ (giờ giả, không chờ ngày thật).
- `docs/bridge.md` + `web/src/bridge/flutterBridge.ts` + `app/lib/scene/` — `getProgress` thêm `due` (số bộ đến hạn);
  sự kiện mới `openReview` (JS → Flutter, mở lượt ôn) và `openDaily` (JS → Flutter, mở bảng nhiệm vụ).
- `web/src/main.ts` — `meditate`: `due > 0` → `openReview`, ngược lại thẻ bộ mới như cũ; đứng gần bảng → nút "Xem bảng".
- `web/src/zones/dialogs.ts` — lựa chọn có hành động (Tiểu Mặc: "Hôm nay có việc gì?" → mở bảng); `DialogChoice` thêm
  trường `action`.
- `docs/phieu_thiet_ke/2026-11-13-nhiem-vu-hang-ngay.md` (mới) — bảng nhiệm vụ, màn ôn câu đố, nút "Xem bảng", chuỗi ngày.
  Phiếu cũ `2026-11-13-bang-vinh-danh.md` → trạng thái **bỏ** (bảng đổi công năng).

**Cần kiểm tra**: `app/lib/lesson/radical_screen.dart` (nút đã học → ghi lịch ôn) · `zones/radicals.ts` (pinyin, nghĩa
đủ cho câu đố) · `ui/actionButtons.ts` (nút nổi gần vật — dùng lại kiểu "Nói chuyện") · R-HANH-1 (mốc Giang Nam vẫn theo
số bộ đã học, không theo ôn).

**Không đụng**: thứ tự học bộ thủ, mốc mở vùng, cảnh (bảng đã có ở (5,5; 19,2)), Sư phụ.

## Giả định / cần quyết định
1. **Ôn ở đâu**: ngồi thiền ở Rừng trúc — còn bộ đến hạn thì lượt ôn câu đố mở trước, ôn hết mới tới bộ mới. Bảng
   nhiệm vụ có thêm nút "Ôn ngay" (ôn tại tông môn, không phải sang Rừng trúc). Đề xuất: **cả hai**.
2. **Học quá 3 bộ/ngày** được (ngồi tiếp vẫn ra bộ mới); 3 chỉ là mục tiêu của việc "Học".
3. **Ngày** theo giờ máy, đổi lúc 0 giờ.
4. Giao diện bảng + màn câu đố là **màn Flutter mới → chờ thiết kế**. Phần làm được ngay: luật, lịch ôn + chuỗi (Dart,
   có test), cầu nối, định tuyến ngồi thiền, lựa chọn hội thoại. Trước khi có thiết kế, `openReview` / `openDaily` chưa
   có màn đón → ngồi thiền khi có bộ đến hạn **vẫn mở thẻ bộ mới** (cờ tắt) để không kẹt.

## Nhiệm vụ
- [x] 1. Sổ quy tắc: R-NV-1…4, R-ON-1…6, sửa R-HANH-3 → online (Chờ) → `--mark-synced`.
- [x] 2. `app/lib/journey/review.dart` + `daily.dart` + test (`app/test/rules/on_tap_test.dart`, `nhiem_vu_test.dart`)
      — đỏ trước, rồi code (Flutter · test theo ví dụ sổ).
- [x] 3. `progress_store.dart`: lưu lịch ôn / ngày / chuỗi; chuyển bộ đã học cũ vào lịch (test).
- [x] 4. Cầu nối: `docs/bridge.md` trước → `getProgress.due`, `openReview`, `openDaily` hai phía (scene_event test).
- [x] 5. Web: `DialogChoice.action`; Tiểu Mặc "Hôm nay có việc gì?"; `meditate` định tuyến theo `due` (sau cờ).
- [x] 6. Phiếu `/ui-design` nhiệm vụ hằng ngày (chờ thiết kế); phiếu bảng vinh danh → bỏ.
- [x] 7. Màn bảng nhiệm vụ + màn ôn câu đố + nút "Xem bảng" — áp 2026-11-13.25 (/ui-apply).
- [x] 8. `npm run build` + Kiểm tra cuối.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm run build · cd app && flutter analyze ·
flutter test -r failures-only test/rules test/scene · dart tool/rule_trace.dart
