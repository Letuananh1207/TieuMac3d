# Catalog 3D bộ asset kiến trúc chuẩn
- Yêu cầu: "Catalog 3D cho bộ asset kiến trúc chuẩn … trang riêng chạy đúng code app … lưới các mẫu ở cả 3 cỡ, nhân vật
  đứng cạnh mỗi mẫu, nhãn mã + cỡ + cấp + draw call / tam giác, chọn giọng vùng để mái đổi dốc; dựng các mẫu từ bộ phận
  dùng chung … không đổi cảnh các map lúc này … đăng artifact để người dùng duyệt từng mẫu." (GĐ 2 + đầu GĐ 4 của
  `2026-11-14-kien-truc-chuan-bai-tri.md`; danh mục đã duyệt `design/kien_truc/danh_muc.md`)
- Loại: thêm (code mới, trang thiết kế) · Cỡ: lớn · Trạng thái: đợt 1 đã duyệt 2026-11-14 · **đợt 2 đã duyệt 2026-11-14 (cả 8 mẫu; `leu-chi-huy` tách mẫu riêng — đồng ý) — tiếp: đợt 3**
  (https://claude.ai/artifact/VHdbpqKax8q8Ya5fUxeGXc, nút "Đợt 2" hoặc `?dot=2`)

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
- [x] 1. `danh_muc.ts`: bảng mẫu + cỡ + cấp từ `danh_muc.md`, hằng K; test (số gian lẻ trừ tàng thư, gian phụ = 0,8 gian
  giữa, cột = 0,8 gian giữa, cỡ S < M < L). (scene · `kien_truc/danh_muc.test.ts`)
- [x] 2. `mai_giong.ts`: 7 kiểu mái × hiên đơn / kép × 4 giọng; test dốc theo giọng (Tống 30–34°, Thanh 27→42°, Giang Nam đầu
  đao cao, Đường ≈ 25°) + không trùng mặt. (scene)
- [x] 3. `bo_phan.ts`: nền / tu di, cột, xà + đấu củng theo cấp, tường, cửa, lan can, bậc. (scene)
- [x] 4. Trang Catalog: `catalog.html`, `catalogPreview.ts`, vite build; lưới, nhân vật, nhãn, đếm draw call / tam giác, chọn
  giọng / cỡ / nhóm. (ghép, như `designPreview.ts`)
- [x] 5. Đợt 1 — 8 nhà hay dùng: `dien` (+ vuông toản tiêm), `sanh`, `cac`, `thap`, `dinh`, `ta`, `nha-day`,
  `nha-giang-nam`; + `lau`, `cua-hang`, `hi-dai` từ hàm hiện có ở cỡ chuẩn. Build, chụp, **đăng Catalog → người dùng duyệt**.
  **Đợt 1 đã duyệt 2026-11-14** (cả 8 mẫu dựng mới; 3 mẫu vào được bày bằng hàm cũ — duyệt lại khi chuyển mẫu).
- [x] 6. Đợt 2 — `lang`, `phuong`, `nha-dat`, `tu-mieu`, `lau-thanh`, `dich-lau`, `phong-hoa`, `leu`. Đăng → duyệt.
  Đã đăng 2026-11-14 — **chờ duyệt**. Bảng `danh_muc_dot2.ts`; dựng `mau_nha_2.ts` (vườn / thờ / cổng), `mau_bien.ts`
  (biên ải, tạm); test `danh_muc.test.ts` (ngân sách tam giác, đôn / bò núi / chiều cao, răng cưa, mặt trùng).
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
- Soát lại khi đánh dấu nhiệm vụ 1–5: code có đủ; riêng nhiệm vụ 4 trang Catalog chọn **giọng** + **đợt** (thêm ở đợt 2),
  chưa có nút chọn cỡ / nhóm (lưới đã bày đủ 3 cỡ cạnh nhau; nhóm hiện chỉ có nhà — thêm khi có đợt 3–4).

## Ghi chú đợt 2 (2026-11-14)
- Tam giác (gộp như Catalog, giọng Tống): lang 0,4k / 0,2k / 1,3k · phuong 1,3k · nha-dat 0,2k / 0,3k / 0,8k · tu-mieu
  1,5k / 2,8k · lau-thanh 1,0k / 1,8k / 2,5k · dich-lau 1,0k · phong-hoa 0,3k / 0,4k · leu 0,1k ×3 · leu-chi-huy 0,1k —
  tất cả dưới ngân sách (có test).
- Cách hiểu danh mục (người dùng xem lại khi duyệt): `lang` S/M/L bày 3 / 3 / 5 gian × 3,75 m; M ven kênh mái một dốc;
  L bò núi mỗi gian cao 0,6 m · `leu` L có hai mẫu → L = lều tròn, lều chỉ huy 8 × 10 tách thành `leu-chi-huy` (như
  `dien-vuong`) · `phong-hoa` M ghi 13 × 20 (tháp đáy 9 + sân 13 × 11 phía trước) · `nha-dat` M 2 ô (gian chẵn có chủ
  đích) · `dich-lau` cấp [C5, C6]: thân C6, chòi C5 · `lau-thanh` L (Ngọ Môn) chưa có hành lang cánh 雁翅樓, chỉ 2 đình
  đầu cánh · `tu-mieu` cổng + hưởng đường nền C4, chỉ điện theo cấp; mũ tường ngói như cổng.
- Bộ phận thêm: `cuaVom`, `rangCua`, kiểu `Build`, màu `GACH` (`bo_phan.ts`); `ngoi` sang `danh_muc.ts`, `hienDuoi` sang
  `mai_giong.ts` (dùng chung đợt 1–2). Màu gạch / đất / vải trùng vật biên ải cũ để gộp lần vẽ.
- Tầng trên có cửa (lầu thành M, đuôi thạch phảng) cần sàn khối dưới chân: mặt đáy tấm vách + chân cửa (`addDoors`) trùng
  nhau, ở đất thì bị che, trên cao thì lộ (L-10 quét ra) — đã thêm sàn.
