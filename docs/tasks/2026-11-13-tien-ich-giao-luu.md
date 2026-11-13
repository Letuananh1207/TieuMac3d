# Tiện ích giao lưu Văn Uyên Tông — hướng A
- Yêu cầu: "tiện ích giao lưu hướng A" (sau design 2026-11-13.13: "Văn Uyên Tông là nơi có nhiều tiện ích để người chơi
  giao lưu chứ không có lớp học"; "kiến trúc các nhà hiện tại quá xấu và hẹp không phù hợp với chức năng")
- Loại: thêm (kiểu nhà, đồ) · sửa hành vi (bỏ vùng học khỏi tông môn) · hiệu năng (gộp biển) · Cỡ: lớn · Trạng thái: xong (chờ thử trên máy + chốt cảnh)

Thiết kế: `design/CHANGELOG.md` 2026-11-13.13 · bản mẫu `design/source/TienIch-kien-truc.dc.html`,
`TienIch-mat-bang.dc.html` · khảo cứu `docs/tham_khao/tien-ich-giao-luu.md`.

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` + tài liệu online — `R-VUNG-1/2/3` (tông môn không còn nơi học), ví dụ `R-HANH-2` (vòng (30; 0)).
- `web/src/zones/zones.ts` — bỏ bài 快 (`lop-hsk3`), 書 (`thu-vien`) khỏi tông môn.
- `web/src/scene/signAtlas.ts` (mới) + `kien_truc/chi_tiet.ts` `addSign` + `buildings.ts` (notice) — mọi biển / cờ vẽ chung một ảnh.
- `web/src/scene/kien_truc/hi_dai.ts`, `tra_lau.ts`, `lau_sach.ts`, `cua_hang.ts` (mới) — 4 kiểu nhà.
- `web/src/scene/buildings.ts` — đăng ký kiểu + hộp va chạm theo kiểu (mặt tiền mở).
- `web/src/scene/props.ts` (+ `kien_truc/do_pho.ts` nếu dài) — `sap-o`, `ban-tra`, `co`, `bang`.
- `web/src/scene/spec.ts`, `specCheck.ts` — `BUILDING_KINDS`, `PROP_KINDS`, trường mới `sign`, `goods`, `text`; mặc định giữ cảnh cũ.
- `.claude/skills/canh/references/truong-dac-ta.md` — tả trường mới.
- `web/scripts/subset-han.mjs` chỉ khi chữ Hán của biển / cờ chưa được cắt font.

**Cần kiểm tra**
- `scene/rooms.ts`, `kien_truc/noi_that.ts`, `ui/learnButton.ts`, `input/tapToMove.ts` (`pickObject`) — chạy đúng khi không còn vùng học.
- `bridge/flutterBridge.ts`, `app/lib/lesson/`, `app/lib/main.dart` — sự kiện mở bài vẫn hợp lệ (không còn ai gửi ở tông môn).
- `designPreview.ts` (Canvas 3D) — bảng "Vùng" rỗng không lỗi.
- `merge.ts` — biển gộp đúng; draw call đo lại.
- `design/scene/rung-truc.json`, `trucMao.ts`, `kien_truc/dinh.ts` — việc của phiên Rừng trúc, không đụng.

**Không đụng**
- Cầu nối (`docs/bridge.md`), màn bài học Flutter — giữ nguyên để các vùng dùng lại.
- `design/` — sắp `scene.json` theo hướng A là việc `/canh` sau khi code xong (nhiệm vụ 9).

## Giả định / cần quyết định
- **Q1 (người dùng 2026-11-13): bỏ hẳn** bài 快 / 書; giữ cầu nối + màn bài học Flutter cho các vùng.
- **Q2 (người dùng 2026-11-13): đi vào được ngay** — tầng 1 trà lâu, cửa hàng, Tàng Thư Các; lên sân khấu hí đài bằng bậc
  hai bên hậu đài. Dùng lại cơ chế `Room` (nền + dốc = `Pad`, va chạm theo phần, camera trong nhà, mái mờ R-HUD-2) nhưng
  tách khỏi vùng học: `Room` không cần `zone`. Tầng 2 chỉ nhìn (không có cầu thang).
- Bảng vinh danh: chỉ dựng vật (khung + giấy kẻ dòng). Chạm xem danh sách là giao diện mới → phiếu `/ui-apply phieu`, chờ thiết kế.
- Cờ phấp phới: lay nhẹ bằng xoay cả tấm (một mesh động / cờ — vài draw call), không biến dạng vải.

## Nhiệm vụ
- [x] 1. Sổ quy tắc: `R-VUNG-1/2/3` → "tông môn không có nơi học; vùng học chỉ có ở cảnh vùng khi đặc tả vùng có nhà
  neo vùng"; ví dụ `R-HANH-2` theo (30; 0) / (24,5; 0). Chép online (ô Xác nhận → Chờ), `--mark-synced`.
  (`docs/testing/quy_tac.md` · docs · xong khi rule_trace sạch)
- [x] 2. Bỏ bài khỏi tông môn: `ZONE_CONTENT` rỗng (hoặc theo Q1); `placeZones` / Canvas 3D không báo lỗi; liệt kê phần
  thành rác (nội thất `lop-hoc`, `thu-vien` trong `noi_that.ts`, `rooms.ts` — giữ code, không còn nhà dùng).
  (`zones/` · dữ liệu · test: tsc + scene:check · xong khi scene:check không đòi `lop-hsk3`)
- [x] 3. Atlas biển: `signAtlas.ts` — một canvas 2048 × 2048, ô 512 × 160 (biển) / 160 × 480 (cờ dọc); `addSign` lấy UV ô;
  một vật liệu chung → `mergeStatic` gộp mọi biển thành 1 draw call. (`scene/` · cảnh · xong khi `?view=tren` ≤ 145 draw call
  với cảnh hiện tại)
- [x] 4. `hi-dai`: nền 1,5 m (× heightScale theo quy ước nền), tiền đài mở 3 mặt, 2 cột trước, tường hậu đài + 2 rèm đỏ +
  bình phong, mái yết sơn đầu hồi ra trước, biển 戲臺 trên đầu hồi, đèn lồng. Va chạm = nền. (`kien_truc/hi_dai.ts`)
- [x] 5. `tra-lau`: 2 tầng 3 gian; tầng 1 mở (cột + 3 bàn trà + đôn, nền trong tối); hiên lửng; tầng 2 lan can + cửa song,
  gian giữa mở; mái yết sơn; biển 茶樓; cờ 茶 trên cột cao. (`kien_truc/tra_lau.ts`)
- [x] 6. `lau-sach`: 2 tầng 6 gian, cột lục, hiên lửng + mái yết sơn ngói đen viền lục (bờ nóc lục), xà lam ô tranh nhạt,
  biển 藏書閣. (`kien_truc/lau_sach.ts`)
- [x] 7. `cua-hang`: 2 tầng, rộng = `w` (4–8), tầng 1 mở + ván cửa xếp một bên + hàng bày theo `goods`
  (`but` · `vai` · `bua` · `thuoc` · `thung`), hiên lửng, mái hai mái; biển ngang `title` + cờ dọc `sign` (một chữ Hán).
  (`kien_truc/cua_hang.ts`)
- [x] 8. Đồ: `sap-o` (ô ∅ 2,4 + bàn), `ban-tra` (bàn + 4 đôn + ấm), `co` (cột + cờ dọc, `text` một chữ, lay nhẹ),
  `bang` (khung gỗ 3 × 2,4, mái nhỏ). Va chạm: bàn, cột, khung. (`props.ts`)
- [x] 9. Đặc tả: kiểu + trường mới trong `spec.ts` (mặc định giữ cảnh cũ), `specCheck.ts`, `truong-dac-ta.md`; Canvas 3D
  build + chụp từng kiểu. Rồi chuyển `/canh` sắp `scene.json` theo mặt bằng hướng A (phiên thiết kế, người dùng duyệt ảnh).
- [x] 10. Phiếu `/ui-apply phieu` "bảng vinh danh — chạm xem danh sách" (chờ thiết kế).
- [x] 11. Đo hiệu năng 3 góc (`?view=tren`, `ca-san`, góc chơi trong phố chợ) ≤ 150 draw call, ≤ 150k tam giác; build cho app.

Ước draw call: biển −14 (atlas) · 4 kiểu nhà + đồ: thêm ≈ 6–10 vật liệu mới sau gộp (gỗ sáng, rèm, ô giấy, vải, hàng) ·
cờ động ≈ 2–4 → tổng dự kiến ≈ 150 → 145.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm run scene:check && npm run build · cd app && flutter analyze ·
flutter test -r failures-only test/scene · dart tool/rule_trace.dart

## Kết quả (2026-11-13)
- Draw call: 155 → **144** (`?view=tren`), 139 góc chơi phố chợ. Biển chung: mọi biển 1 draw call; nhóm mờ gộp màu theo
  đỉnh (~3 draw call / nhà vào được).
- Tam giác ≈ 154k (> 150k): phần tiện ích thêm ≈ 1,5k; trước bố cục mới đã 153k (tăng từ 143k khi cảnh thêm trúc mao
  — phiên Rừng trúc). Cần một lượt giảm tam giác riêng.
- Lệch mặt bằng: hí đài (0; −11) thay vì −12,5 (chân dốc bậc cần ≥ 2 m tới tường bắc); ao trước Tàng Thư Các tách hai
  bên bậc (chưa có kiểu "cầu đá" — Cần code).
- Chờ: thử trên máy (đi vào trà lâu / cửa hàng / Tàng Thư Các, lên sân khấu, camera trong cửa hàng hẹp 4 m); `/canh chot`
  cho bố cục `scene.json`; phiếu bảng vinh danh (chờ thiết kế).
