# Học bằng tu luyện (ngồi thiền) thay bia bộ thủ
- Yêu cầu: "thay đổi cách học ở các màn thay vì bia như hiện nay vì nhìn rất mệt" → sau này nhiều người chung một
  vùng → chốt hướng "tu luyện": cảnh là của chung, việc học là của riêng (người dùng "đồng ý", 2026-11-13).
- Loại: sửa hành vi + xoá (bia) · Cỡ: lớn · Trạng thái: xong (phần nhìn chờ thiết kế — phiếu 2026-11-13-tu-luyen)

## Nguyên tắc (giữ cho lúc có nhiều người chơi)
- **Cảnh chung** (`design/scene/*.json`): rừng, suối, đình, NPC, linh địa — không chứa bài học, không có trạng thái
  theo người học.
- **Lớp riêng** (chỉ máy mình vẽ, theo tiến độ của mình): thẻ học, đốm linh tự, nút học. Không đặt vào `scene.json`.
- **Người khác thấy kết quả** trên nhân vật: chữ bay quanh khi đang tu, hào quang — làm sau khi có thiết kế.

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` — viết lại R-HANH-3 (bia → tu luyện); sửa ví dụ có "bia" ở R-VUNG-1, R-VUNG-2, R-DIEU-2;
  R-DIEU-7 thêm "ở vùng có bài học, ngồi thiền = tu luyện" (+ đồng bộ online cùng 7 mã đang treo).
- `web/src/main.ts` — bỏ nút "Học bộ …" cạnh bia + chạm bia; thêm: ngồi thiền ở vùng có bộ thủ → mở thẻ bộ thủ **chưa
  học đầu tiên** theo thứ tự `RADICALS`.
- `web/src/scene/bia.ts` (xoá), `scene/world.ts` (bỏ dựng bia), `scene/spec.ts` + `specCheck.ts` (bỏ trường `stele`,
  `steles`), `web/scripts/check-scene.mjs` (nếu in bia), `web/src/designPreview.ts` (nếu có nút bia).
- `design/scene/rung-truc.json` — bỏ `stele`, `steles` (phiên VS Code làm thay `/canh`, chụp cho duyệt) + mục CHANGELOG.
- `docs/bridge.md` — `openRadical`: đổi dòng "khi nào" (ngồi tu thay vì bia); `getProgress`: bỏ chữ "bia viền vàng".
- Vùng có bộ thủ: trường đặc tả mới `lessons: { radicals: true }` (mặc định tắt → tông môn ngồi thiền chỉ là ngồi)
  — hoặc gắn theo mã vùng `rung-truc`; chọn trường đặc tả (quy tắc 8: số liệu cảnh từ `SceneSpec`).

**Cần kiểm tra**: `web/src/zones/radicals.ts` (thứ tự học, giữ nguyên) · `app/lib/journey/` (mốc 50 bộ, giữ) ·
`web/src/ui/learnButton.ts` (còn dùng cho vùng khác?) · `player/controller.ts` (`isSitting`, `toggleSit`) ·
`web/src/fonts` (chữ Hán quét từ `steles` → nay quét từ `RADICALS`).

**Không đụng**: thẻ học bộ thủ Flutter (chỉ đổi chữ — qua phiếu), tiến độ đã lưu (mã bộ thủ giữ nguyên), Tiểu Mặc /
Sư phụ, tông môn.

**Thành rác khi xoá bia**: `scene/bia.ts`, `SteleSpec`, màu `stele` trong đặc tả, `STELE_NEAR` / `STELE_TAP` /
`nearestStele` / chạm bia trong `main.ts`, `hanText` lấy từ `spec.steles`, ảnh `design/screens/Canh-rung-truc-bia.png`
(giữ làm lịch sử), luật "bia viền vàng".

## Giả định / cần quyết định
1. **Mở thẻ khi nào**: ngồi xuống xong (≈ 1 giây "nhập định") thì thẻ mở — hay ngồi xuống rồi hiện nút "Tu luyện" để
   bấm? Đề xuất: **tự mở sau ≈ 1 giây** (ít bấm, đúng cảm giác nhập định); đứng dậy trước 1 giây → không mở.
2. **Học đủ 50 bộ** rồi ngồi thiền ở Rừng trúc → chỉ ngồi (không mở gì). Ôn lại bộ đã học: làm sau (bản đồ / sổ chữ).
3. **Linh địa** (chỗ đẹp khuyến khích ngồi) và **đốm linh tự** (lớp riêng, gắn bộ thủ với vật trong cảnh): đợt 2 —
   cần `/canh` + thiết kế. Đợt này: ngồi ở đâu trong Rừng trúc cũng tu được.
4. Giao diện mới **chờ thiết kế** — phiếu `docs/phieu_thiet_ke/2026-11-13-tu-luyen.md`: thẻ học khi ngồi tu (chữ trên
   nút Flutter "Đã học · khắc vào bia" → vd. "Đã lĩnh hội"; "Về rừng trúc" → "Xuất định"), hiệu ứng nhập định, chữ bay
   quanh người, nút Thiền ở vùng có bài học (nhãn "Tu luyện"?), đốm linh tự. Đợt này dùng thẻ hiện có, không dựng tạm
   hiệu ứng mới.

## Nhiệm vụ
- [x] 1. Sổ quy tắc: viết lại R-HANH-3, sửa ví dụ R-VUNG-1/2, R-DIEU-2, R-DIEU-7 → chép lên tài liệu online (ô Xác
      nhận về Chờ) → `--mark-synced` (kèm 7 mã đang treo nếu người dùng cho đồng bộ).
- [x] 2. Đặc tả: trường `lessons` (spec.ts + mặc định tắt + specCheck); bỏ `stele`/`steles`; xoá `bia.ts`, bỏ ở
      `world.ts`, `designPreview.ts`, `check-scene.mjs` (scene · tsc · `scene:check` không lỗi).
- [x] 3. `rung-truc.json`: bỏ bia, bật `lessons.radicals`; chụp lối rừng không bia → duyệt → CHANGELOG (design).
- [x] 4. `main.ts`: ngồi thiền ≥ 1 giây ở vùng có bộ thủ → `openRadical(bộ chưa học đầu tiên)`; đóng thẻ → vẫn ngồi;
      bỏ code bia; chữ Hán cho font lấy từ `RADICALS` (ghép · tsc · thử tay: C → 1 giây → thẻ 竹; đứng dậy sớm → không).
- [x] 5. `docs/bridge.md`: cập nhật "khi nào" của `openRadical`, mô tả `getProgress.radicals` (không đổi tên / dạng).
- [x] 6. Phiếu `/ui-design` `2026-11-13-tu-luyen.md` (chờ thiết kế): mục 4 ở trên.
- [x] 7. `npm run build` + Kiểm tra cuối.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm run scene:check && npm run build ·
cd app && flutter analyze && flutter test -r failures-only test/rules · dart tool/rule_trace.dart ·
thử tay ở Rừng trúc (`?vung=rung-truc` hoặc truyền tống): lối không còn bia; ngồi → thẻ bộ đầu chưa học; đã học → bộ sau.
