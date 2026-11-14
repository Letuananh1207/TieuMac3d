# Catalog 3D bộ asset kiến trúc chuẩn
- Yêu cầu: "Catalog 3D cho bộ asset kiến trúc chuẩn … trang riêng chạy đúng code app … lưới các mẫu ở cả 3 cỡ, nhân vật
  đứng cạnh mỗi mẫu, nhãn mã + cỡ + cấp + draw call / tam giác, chọn giọng vùng để mái đổi dốc; dựng các mẫu từ bộ phận
  dùng chung … không đổi cảnh các map lúc này … đăng artifact để người dùng duyệt từng mẫu." (GĐ 2 + đầu GĐ 4 của
  `2026-11-14-kien-truc-chuan-bai-tri.md`; danh mục đã duyệt `design/kien_truc/danh_muc.md`)
- Loại: thêm (code mới, trang thiết kế) · Cỡ: lớn · Trạng thái: đợt 1 đã đăng (https://claude.ai/artifact/VHdbpqKax8q8Ya5fUxeGXc) — chờ người dùng duyệt từng mẫu

## Phạm vi
**Sẽ thêm / sửa**
- `web/src/scene/kien_truc/danh_muc.ts` (mới) — bảng mẫu thuần (mã, nhóm, cỡ S/M/L → số gian, rộng, sâu, cao cột, tầng; cấp
  cho phép; mái theo cấp) đúng `danh_muc.md`; hằng `K = 1,25`; test.
- `web/src/scene/kien_truc/mai_giong.ts` (mới) — mái tham số: 7 kiểu (vũ điện, yết sơn, huyền sơn, ngạnh sơn, toản tiêm
  4 / 6 / 8, quyển bồng, mái bằng) × hiên đơn / kép × 4 giọng dốc (Tống · Thanh · Giang Nam · Đường); dùng lại `hinh.ts`
  (`frustum`, `prism`), `mai.ts` (đầu đao, bờ nóc). Test hình (độ dốc, không trùng mặt — `zfight`).
- `web/src/scene/kien_truc/bo_phan.ts` (mới) — bộ phận dùng chung: nền thường / tu di 1–3 tầng, cột theo gian, dải xà + đấu
  củng theo cấp, tường, cửa bức bàn, lan can (gọi lại `addRailing`, `addSteps`, `addDoors`, `addBeamBand`).
- `web/src/scene/kien_truc/mau_*.ts` (mới, theo đợt) — dựng từng mẫu từ bảng + bộ phận.
- `web/catalog.html` + `web/src/catalogPreview.ts` (mới) — trang Catalog: lưới mẫu, nhân vật cạnh mỗi mẫu, nhãn, số draw
  call / tam giác từng mẫu (gộp `mergeStatic` rồi đếm), chọn giọng / cỡ / nhóm, camera bay quanh (dùng lại cách của
  `designPreview.ts`).
- `web/vite.config.ts` — `--mode design` build thêm `catalog.html` (cùng `dist-design/`, không vào app).

**Cần kiểm tra** — `designPreview.ts` (dùng chung nhân vật, renderer), `merge.ts`, `tool/check.dart` (`E-LOP`: file mới
nằm trong `scene/` và gốc `src/` như `designPreview.ts` — không thêm thư mục).

**Không đụng** — `design/scene/*.json`, các kiểu nhà đang dùng trong cảnh (`dien`, `tra-lau`, `lau-sach`, `nha-nho`…), app
Flutter, cầu nối. Map chuyển sang mẫu mới ở GĐ 5.

## Giả định / cần quyết định
1. **Catalog là artifact riêng** (link mới "Catalog kiến trúc"), không chen vào Canvas 3D — khuyên: tách cho gọn, Canvas 3D
   vẫn để xem từng map.
2. **Mẫu vào được** (`lau` = trà lâu / thư viện, `cua-hang`, `hi-dai`): Catalog dựng bằng **hàm hiện có** ở cỡ chuẩn (ruột,
   thang, chỗ ngồi giữ nguyên — đã có test); chỉ mái đổi theo giọng ở đợt sau. Mẫu khác dựng mới từ bộ phận.
3. **Làm theo đợt, mỗi đợt đăng Catalog cho duyệt**: đợt 1 nền móng + 8 nhà hay dùng · đợt 2 nhà còn lại · đợt 3 phần nối
   · đợt 4 vật sân. Người dùng ghi "đạt / sửa" từng mẫu trên Catalog (ô ghi chú hoặc chat).
4. Ngân sách từng mẫu theo `danh_muc.md` mục 0 (C1–C2 ≤ 8 draw call · C3 ≤ 6 · C4 ≤ 4 · C5–C6 ≤ 3) — Catalog tô đỏ mẫu vượt.

## Nhiệm vụ
- [ ] 1. `danh_muc.ts`: bảng mẫu + cỡ + cấp từ `danh_muc.md`, hằng K; test (số gian lẻ trừ tàng thư, gian phụ = 0,8 gian
  giữa, cột = 0,8 gian giữa, cỡ S < M < L). (scene · `kien_truc/danh_muc.test.ts`)
- [ ] 2. `mai_giong.ts`: 7 kiểu mái × hiên đơn / kép × 4 giọng; test dốc theo giọng (Tống 30–34°, Thanh 27→42°, Giang Nam đầu
  đao cao, Đường ≈ 25°) + không trùng mặt. (scene)
- [ ] 3. `bo_phan.ts`: nền / tu di, cột, xà + đấu củng theo cấp, tường, cửa, lan can, bậc. (scene)
- [ ] 4. Trang Catalog: `catalog.html`, `catalogPreview.ts`, vite build; lưới, nhân vật, nhãn, đếm draw call / tam giác, chọn
  giọng / cỡ / nhóm. (ghép, như `designPreview.ts`)
- [ ] 5. Đợt 1 — 8 nhà hay dùng: `dien` (+ vuông toản tiêm), `sanh`, `cac`, `thap`, `dinh`, `ta`, `nha-day`,
  `nha-giang-nam`; + `lau`, `cua-hang`, `hi-dai` từ hàm hiện có ở cỡ chuẩn. Build, chụp, **đăng Catalog → người dùng duyệt**.
- [ ] 6. Đợt 2 — `lang`, `phuong`, `nha-dat`, `tu-mieu`, `lau-thanh`, `dich-lau`, `phong-hoa`, `leu`. Đăng → duyệt.
- [ ] 7. Đợt 3 — phần nối: `bai-phuong`, `son-mon`, `cong-tuong` (thêm `thuy-hoa`), `tuong` 4 kiểu, `cau` 4 kiểu, `nen`,
  `lan-can`, `bac`. Đăng → duyệt.
- [ ] 8. Đợt 4 — 11 vật sân. Đăng → duyệt. Cập nhật `danh_muc.md` (đánh dấu đạt, chỉnh số đo đã sửa khi xem).

## Kiểm tra cuối (mỗi đợt)
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test · `npm run build:design` (PowerShell) · chụp Catalog ·
không đổi `design/scene/*.json` (`git diff --stat design/scene` trống).

## Ghi chú đợt 1 (2026-11-14)
- Ngân sách: draw call riêng từng nhà = số màu (khối cùng màu cả cảnh gộp chung) → Catalog chỉ xét **tam giác**; đã sửa
  `danh_muc.md` mục 0.
- Mẫu vào được dùng hàm có sẵn có mặt trùng nhau (chớp): `lau` S / M (traLau ở cỡ nhỏ — chi tiết bàn tầng 1), `cua-hang`
  (cột / xà / khung cửa áp tường). Thuộc hàm cũ — quét theo cảnh thật ở `zfightRegions.test.ts`; sửa khi chuyển mẫu (GĐ 4–5).
  `lau` S / M còn vượt ngân sách tam giác C4 (5,2k / 5,6k > 4k) — ruột trà lâu nhiều đồ.
- Sửa sau tự soát: mái quyển bồng (nóc bo tròn thay vì nửa thùng), tháp (hiên vươn rộng + đầu đao từng tầng).
- `node_modules` bị cài dở (thiếu `.bin`) giữa chừng — đã `npm install` theo lockfile (không đổi phiên bản).
