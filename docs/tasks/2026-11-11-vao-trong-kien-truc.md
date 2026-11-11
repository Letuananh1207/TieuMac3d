# Vào bên trong kiến trúc (thay thẻ mời)

- Yêu cầu: "Vào bên trong kiến trúc thay cho thẻ mời: bỏ thẻ mời ngoài sân; đi thẳng qua cửa vào giảng đường và thư
  viện (liền mạch, không chuyển cảnh — mái + tường trước mờ khi ở trong); bên trong có bảng đen + thầy (giảng đường),
  kệ sách + án đọc (thư viện); đứng gần hoặc chạm vào vật thì mở bài học. Thiết kế đề xuất trên canvas mục "Vào bên
  trong kiến trúc" (NoiThat-mat-bang, TrongNha-doc, TrongNha-ngang)."
- Loại: sửa hành vi + thêm (nội thất, tương tác) + xoá (thẻ mời) · Cỡ: lớn · Trạng thái: xong (chờ thử trên máy)

## Thiết kế (canvas, bản 1794382355-ee72 — **đề xuất, chưa chốt** vào `design/`)

- Mặt bằng `NoiThat-mat-bang`: giảng đường 13 × 7 m, cửa giữa 2,4 m; bảng đen 4 m ở tường sau (chữ 快), bục giảng
  6 × 1 m cao 0,2 m, thầy áo xà lam cạnh trái bảng, 4 án thư 1,6 × 0,6 m + bồ đoàn, lối giữa 3,6 m; vùng học tâm cách
  bảng 2 m, r 1,8. Thư viện 7 × 6 m (quay 90°), cửa 2 m; kệ sách tường sau 6 m + hai tường bên 3 m; án đọc 1,4 × 0,7
  giữa phòng, sách mở; vùng r 1,6.
- `TrongNha-doc` / `TrongNha-ngang` (HUD hướng C): chip "Văn Uyên Tông · Giảng đường"; nút nổi ngọc lục trên vật
  "Học chữ 快" / "Ôn chữ 書" có mũi nhọn chỉ xuống; mái mờ 15 %.
- Ghi chú canvas: mái + tường trước mờ còn 15 % trong 0,3 s khi bước vào nền nhà; camera trong nhà tự kéo gần ≤ 6 m,
  không xuyên tường; bỏ thẻ mời ngoài sân; đổi luật R-VUNG-1/2/3 → hỏi người dùng.

## Phạm vi

**Sẽ sửa**
- `docs/testing/quy_tac.md` (+ tài liệu online) — luật mới / đổi (bên dưới), trước khi code
- `web/src/scene/spec.ts`, `specCheck.ts` — `buildings[].interior` (`lop-hoc` · `thu-vien`), cửa, điểm học neo theo vật;
  mặc định không có → nhà đặc như cũ
- `web/src/scene/kien_truc/` (+ file mới `noi_that.ts`) — nhà rỗng: nền, tường có khe cửa, mái + tường trước tách riêng
  để mờ được; bảng đen, bục, án thư, bồ đoàn, kệ sách, án đọc, sách
- `web/src/scene/buildings.ts` — va chạm theo đoạn tường + cửa + đồ đạc thay cho một hộp cả nhà; trả về "nhà vào được"
  (đa giác nền, vật mờ, vật học)
- `web/src/player/` — thầy: nhân vật đứng yên dùng lại đệ tử (màu áo xà lam) qua `Character`
- `web/src/zones/` — vùng học neo theo vật trong nhà (thay neo trước cửa); theo dõi "đang ở trong nhà nào"
- `web/src/input/orbitCamera.ts` — trong nhà: khoảng cách ≤ 6 m, không xuyên tường (kéo camera vào trước tường)
- `web/src/input/` (chạm) — chạm trúng vật học → mở bài; trúng mặt đất → đi như cũ
- `web/src/ui/` + `index.html` + `style.css` — **bỏ** `eventCard.ts` + DOM `#card`; **thêm** nút học nổi trên vật
  (kiểu HUD C); chip "· Giảng đường"
- `web/src/main.ts`, `designPreview.ts` — ghép
- `.claude/skills/*` (bản đồ tính năng, bảng trường ui-design), `decisions/0002`

**Cần kiểm tra**: `zones/zones.ts` (`ZONE_CONTENT` giữ nội dung bài, đổi chỗ neo), `merge.ts` (mái / tường trước mờ
phải không bị gộp — `markDynamic`), Canvas 3D, ngân sách draw call (ước +8–12: mỗi nhà 2–3 vật liệu mờ riêng + đồ
đạc gộp), địa hình (nhà trên bục — không đổi).

**Không đụng**: cầu nối Flutter (mốc 3), màn bài học (vẫn bảng HTML tới mốc 3), địa hình, điều khiển joystick (R-DIEU).

**Thành rác khi bỏ thẻ mời**: `web/src/ui/eventCard.ts`, DOM `#card` `#cardEyebrow` `#cardTitle` `#cardGo` `#cardLater`,
CSS `#card*`, trường `eyebrow` / `title` / `go` trong `ZONE_CONTENT`, chuỗi "Tùng tùng tùng! Giờ giảng", "Vào nghe
giảng", "Để sau", "Thư viện đang mở", "Vào đọc sách"; thẻ mời trong phiếu HUD + artboard HUD C (phiên thiết kế dọn).

## Luật đề xuất (sửa sổ trước, Xác nhận = chờ)

| Mã | Đề xuất |
|---|---|
| R-VUNG-1 (sửa) | Mỗi bài học gắn một vật trong nhà (bảng đen giảng đường, án đọc thư viện). Nhân vật đứng cách điểm học của vật nhỏ hơn bán kính → hiện nút học nổi trên vật ("Học chữ 快" / "Ôn chữ 書"); ra ngoài → nút ẩn. Ngoài sân không còn thẻ mời. |
| R-VUNG-2 (thay "Để sau") | Đang ở trong nhà, chạm vào vật học (bảng đen, thầy · án đọc, kệ sách) → mở bài học của vật đó dù không đứng trong vùng. Chạm chỗ khác → như cũ (đi tới đó / xoay). |
| R-VUNG-3 (sửa chữ) | Mở bài học (nút hoặc chạm vật) → nhân vật đứng yên tới khi đóng; đóng xong vẫn đứng gần thì nút vẫn hiện. |
| R-VA-3 (mới) | Nhà vào được: tường và cột chặn, đi qua cửa được; bảng, bục, án thư, kệ, án đọc, thầy có va chạm. |
| R-HUD-1 (bổ sung) | Đứng trên nền một nhà vào được → chip "<tên nơi> · <tên nhà>" (ưu tiên hơn tên khu). |
| R-HUD-2 (mới) | Bước lên nền nhà vào được → mái + tường trước mờ còn 15 % trong 0,3 s; bước ra → hiện lại. Trong nhà camera ≤ 6 m và không ở sau tường. |

## Đã quyết (người dùng)

1. Code theo đề xuất canvas ngay (chưa chốt vào `design/`).
2. Commit + push địa hình trước (`8ea436e`).

## Kết quả

- Kiểm bằng code app (script tạm): vào giảng đường qua bậc + cửa, dừng trước bục, đứng trong vùng học; x = 3 lan can chặn;
  thư viện (quay 90°) vào từ phía đông, dừng trước án đọc trong vùng.
- Canvas 3D `?nv=0,-10.5`: bảng chữ 快, thầy, án thư, mái + tường trước + cột trước mờ; 91–92 draw call (thư viện 81).
- Chưa thử: chạm vật / nút học trên điện thoại thật; thầy đứng yên, không cử động.

## Nhiệm vụ

- [x] 1. Sổ quy tắc: 6 luật trên → tài liệu online (Chờ) → `--mark-synced`.
- [x] 2. Đặc tả: `buildings[].interior` + `door` + điểm học; `scene:check` in vật học, kiểm vật nằm trong nhà.
- [x] 3. Nhà rỗng + nội thất (`kien_truc/noi_that.ts`), mái / tường trước tách vật liệu riêng (`markDynamic`).
- [x] 4. Va chạm theo tường + cửa + đồ đạc (R-VA-3); kiểm bằng script với code app (đi qua cửa, chặn tường, chặn bàn).
- [x] 5. Thầy (đệ tử áo xà lam, đứng yên, xoay nhìn người chơi khi lại gần — tuỳ chọn).
- [x] 6. Theo dõi trong nhà + mờ mái / tường trước 0,3 s (R-HUD-2); chip tên nhà (R-HUD-1).
- [x] 7. Camera trong nhà ≤ 6 m, không xuyên tường.
- [x] 8. Vùng học neo theo vật (R-VUNG-1), nút nổi trên vật kiểu HUD C, chạm vật mở bài (R-VUNG-2, R-VUNG-3).
- [x] 9. Bỏ thẻ mời (file, DOM, CSS, chuỗi); cập nhật skill, bản đồ tính năng, phiếu HUD.
- [x] 10. Build, Canvas 3D chụp dọc + ngang trong hai nhà, đo draw call.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npm run scene:check && npx tsc --noEmit && npm run build ·
cd app && flutter analyze && flutter test · dart tool/rule_trace.dart · Canvas 3D ≤ 150 draw call
