# Tông môn — đợt 1 (mặt phẳng): đủ kiểu vật cho 6 khu
- Yêu cầu: thiết kế 2026-11-10.3 "Đề xuất quy hoạch tông môn" (`design/scene/tong_mon.md`, mục "Cần code"),
  người dùng chọn: **đợt 1 (mặt phẳng) trước mốc 3**, đợt 2 (địa hình: bục phẳng theo khu + bậc đá) sau mốc 3.
- Loại: thêm (kiểu vật mới trong đặc tả cảnh) · Cỡ: lớn · Trạng thái: xong (6 khu đặt ở thiết kế 2026-11-11.1, đã áp)

## Mục tiêu

Phiên code chỉ **thêm khả năng** vào `SceneSpec` (mỗi trường mới có mặc định = cảnh hiện tại, nên `scene.json`
đang có vẫn đúng, app không đổi). Sau đó phiên thiết kế tự đặt 6 khu phẳng (Ngoại Môn, Sơn Môn, Diễn Võ Trường,
Đệ Tử Cư Xá, Linh Dược Viên, Luyện Đan Phòng) bằng `scene.json` trên Canvas 3D. Đợt này **không** đặt khu nào thay
thiết kế.

Việc của `tong_mon.md` thuộc đợt 1: 1 (tường đoạn + khe, lối lát đá, nền rộng), 4 (kiểu nhà), 5 (cổng sơn môn),
6 (ao — phần phẳng), 7 (vật trang trí), 8 (rừng trúc), 9 (đảo nổi + mây), 10 (hiệu năng). Đợt 2: 2, 3, thác (6).

## Phạm vi
**Sẽ sửa**
- `web/src/scene/spec.ts` (+ tách `specCheck.ts` để mỗi file < 400 dòng): trường mới, kiểm dữ liệu.
- `web/src/scene/walls.ts`: vòng tường ±half có **khe cổng** (`walls.gates`) + **đoạn tường thêm** (`wallSegments`).
- `web/src/scene/environment.ts`: nền phủ rộng (`ground.size`), **lối lát đá** (`paths`).
- `web/src/scene/buildings.ts` → tách theo kiểu: `buildings/` hoặc `buildingKinds.ts`: `kind` = `giang-duong`
  (mặc định, như cũ) · `dien` (điện lớn mái hai tầng) · `thap` (tháp nhiều tầng, `floors`) · `nha-nho` (nhà đệ tử);
  `roof` = `chop` (mặc định) · `cong` (mái cong đầu đao).
- `web/src/scene/gate.ts` (mới): cổng sơn môn — mái, hai cột, bảng hiệu chữ lớn; va chạm chỉ ở hai cột.
- `web/src/scene/water.ts` (mới): ao / hồ (tròn hoặc chữ nhật), mặt nước phẳng, không đi xuống được.
- `web/src/scene/props.ts` (mới): đài tỉ thí, giá binh khí, luống thuốc, lò đan (khói nhẹ chuyển động).
- `web/src/scene/trees.ts`: kiểu cây `tan` (mặc định) · `truc`; **cụm cây** (`trees.groves`: vùng chữ nhật + số cây).
- `web/src/scene/sky.ts` (mới): đảo nổi + mây, trôi chậm, không va chạm.
- `web/src/scene/world.ts`: `World.update(dt)` cho thứ chuyển động (khói, mây); `main.ts` + `designPreview.ts` gọi.
- `web/src/collision/colliders.ts`: thêm **vật cản tròn** (`addCircle`) cho ao tròn, đài, lò đan (thay vì hộp vuông lẹm góc).
- `web/scripts/check-scene.mjs`: in thêm cổng, đoạn tường, ao, vật, cụm cây.
- `web/src/designPreview.ts`: khung va chạm tròn; số vật theo loại.
- `docs/testing/quy_tac.md`: R-VA-1 (xem dưới). Skill `ui-design` (mục Cảnh 3D: trường mới), `hoc-xa-3d-dev/web_scene.md`.

**Cần kiểm tra** `player/controller.ts` (gọi `colliders.resolve`), `input/tapToMove.ts` (nền rộng hơn),
`scene/renderer.ts` (far 200 — cảnh ~140×150 m vẫn trong tầm; sương che xa), `zones/` (không đổi).

**Không đụng** độ cao / bậc đá / thác / camera theo độ cao (đợt 2), nội dung bài học, HUD, cầu nối, Flutter,
`design/` (phiên thiết kế đặt khu sau).

## Quyết định nhỏ (đề xuất, đổi được khi duyệt)
1. Tường và vật có va chạm chỉ quay **bội 90°** như nhà (va chạm hộp thẳng trục); lối lát đá, mây, đảo: góc tự do.
2. Khe cổng tính theo cạnh: `{ side: "bac"|"nam"|"dong"|"tay", at, width }` (tâm khe theo trục dọc cạnh).
3. Khói lò đan, mây: vài mặt phẳng / khối mờ chuyển động, không dùng hệ hạt; vẫn Lambert / Basic, không shadow.
4. Tên kiểu (`kind`) viết tiếng Việt không dấu, gạch nối — như mã nhà hiện có.

## Luật
- **R-VA-1** đổi chữ, không đổi ý: "Nhân vật (bán kính 0,5) không đi xuyên tường, nhà, cổng (cột), giếng, ao / hồ,
  vật trang trí có va chạm và cây trong sân / cụm cây có va chạm; khe cổng đi qua được; cây vòng ngoài tường, lối
  lát đá, đảo nổi, mây không có va chạm." Ví dụ giữ nguyên (tường bắc liền ở x = 0) + thêm ví dụ khe cổng.
  Quy trình: sửa sổ → chép lên tài liệu xác nhận online (ô Xác nhận về Chờ) → `--mark-synced R-VA-1` → code.
  Chưa có trình chạy test TS → kiểm bằng `scene:check` + chụp Canvas 3D (như 3D-a); ghi rõ "chưa khoá bằng test".
- R-VUNG-1, R-DIEU-*: không đổi.

## Nhiệm vụ
- [x] 1. R-VA-1: sửa sổ → online → `--mark-synced`.
- [x] 2. `collision`: vật cản tròn · xong khi `resolve` đẩy đúng ra ngoài tròn (kiểm bằng script esbuild như 3D-a).
- [x] 3. `spec.ts` / `specCheck.ts`: mọi trường mới + mặc định rỗng / như cũ · xong khi `scene:check` với
  `scene.json` hiện tại vẫn "Không có lỗi", cảnh chụp không đổi.
- [x] 4. Tường: khe cổng + đoạn thêm; nền rộng + lối lát đá.
- [x] 5. Kiểu nhà `dien`, `thap`, `nha-nho`, mái `cong`.
- [x] 6. Cổng sơn môn.
- [x] 7. Ao / hồ.
- [x] 8. Vật trang trí (4 loại) + `World.update` cho khói.
- [x] 9. Rừng trúc + cụm cây (instancing theo kiểu).
- [x] 10. Đảo nổi + mây.
- [x] 11. Canvas 3D + `scene:check` hiện vật mới; **cảnh mẫu thử** (file tạm, không ghi `design/`): mỗi kiểu
  vật một cái + 6 khu ước theo `tong_mon.md` → đo draw call / tam giác / fps (headless + `npm run dev` trên điện
  thoại). Ngân sách: ≤ 150 draw call, ≤ 150k tam giác; vượt → instancing thêm / giảm chi tiết trước khi xong.
- [x] 12. Skill `ui-design` (khuôn trường mới, ví dụ JSON từng kiểu), `web_scene.md`, ADR 0002 (thêm mục đợt 1).
- [x] 13. Phiếu cho phiên thiết kế: "đặt 6 khu phẳng theo `tong_mon.md` bằng `scene.json`" (bố cục → cửa kiểm `/ui-apply`).

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm run scene:check && npm run build &&
npm run build:design · cd app && flutter analyze · flutter test -r failures-only test/scene ·
dart tool/rule_trace.dart · chụp Canvas 3D trước / sau (cảnh mặc định không đổi) · thử trên máy (dọc + ngang)

## Ghi chú khi làm (2026-11-11)
- R-VA-1: sửa sổ + tài liệu online (ô Xác nhận vẫn Chờ), `--mark-synced`. Ví dụ kiểm bằng mô phỏng `Colliders` +
  `ringRuns`: tường bắc liền dừng z = −20; khe nam x = 0 qua; x = 3 dừng z = 20,0. Chưa khoá bằng test (chưa có vitest).
- Cảnh mẫu 6 khu (`docs/phieu_thiet_ke/2026-11-11-tong-mon-dot-1-mau.json`, dựng trong bản sao tạm, không đụng
  `design/`): 41–65 draw call, ~20k tam giác — nhờ gộp khối `merge.ts` (trước gộp: ~280–380).
- Cảnh hiện tại (`scene.json` 2026-11-10.2) chụp lại giống trước.
- Phát hiện: mái chóp prototype xiên hình thoi khi nhìn từ trên (xoay sau khi kéo giãn). Giữ cho giảng đường /
  thư viện (`legacy`), kiểu nhà mới làm mái thẳng — hỏi người dùng có sửa luôn mái cũ không.
- Canvas 3D: `?view=tren | ca-san`, tắt sương khi nhìn từ trên, số liệu không tính lớp phủ, fps.
