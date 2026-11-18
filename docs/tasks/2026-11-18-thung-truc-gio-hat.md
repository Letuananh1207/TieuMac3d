# V-20261118-113 — Thung Trúc Gió Hát: Tháp Sáo Trúc (vùng `rung-truc`)

Yêu cầu (người dùng 2026-11-18, sau khi chốt concept — `design/CHANGELOG.md` 2026-11-18.2): "tiến hành xây". Nguồn:
`design/concept/thung-truc-gio-hat/{vao,cong-trinh}.png` (không có toàn cảnh), phiếu
`docs/phieu_thiet_ke/2026-11-17-concept-thung-truc-gio-hat.md`, ý tưởng `docs/y_tuong/2026-11-17-the-gioi-moi.md` (dòng `rung-truc`).

## Phạm vi

- **Làm**: Tháp Sáo Trúc giữa Bãi giữa (ngã tư (0; 4)) — bó ống trúc, lỗ sáo, dây, lụa đỉnh bay theo gió, đế đá hai bậc
  đứng lên được, 5 cọc nơ; vài giá chuông gió tre + khóm trúc; sương sớm gần hơn; tiếng sáo gió khi đến gần (R-AM-3 có sẵn).
- **Giữ**: mã cảnh, địa hình V-66 B2, 4 công trình B3, 3 trò B4, NPC, bãi hạc, 3 cổng, tên vùng (V-107).
- **Không làm**: NPC mới, trò "Trúc hát" (chờ chủ đề từ vựng), bản đồ lớn vẽ tháp.

## Nhiệm vụ

| # | Việc | File | Trạng thái |
|---|---|---|---|
| 1 | Trường `fluteTower` (mặc định tắt), kiểm đặc tả (cỡ, đế rộng hơn bó ống, chuông ngoài đế, góc bội 90°) | `web/src/scene/thapSaoSpec.ts`, `spec.ts`, `specCheck.ts` | xong |
| 2 | Dựng tháp + cọc nơ (khối tĩnh gộp màu theo đỉnh), đế = 2 tấm tròn, va chạm | `web/src/scene/thapSao.ts`, ghép `world.ts` | xong |
| 3 | Lụa + chuông gió lay bằng shader (1 lưới `aSway`) | `web/src/scene/swayGeo.ts`, `chuongGio.ts` | xong |
| 4 | Sáo gió theo khoảng cách tới tháp | `web/src/ui/lamSound.ts`, `miniGames.ts` | xong |
| 5 | Đặc tả cảnh, chụp góc concept + toàn cảnh, chỉnh | `design/scene/rung-truc.json`, `design/screens/Canh-thung-truc-*.png` | xong |
| 6 | Luật R-VA-1, R-VA-2, R-AM-3 (sổ + online) + test | `docs/testing/quy_tac.md`, `web/src/thapSao.test.ts`, `ui/lamSound.test.ts` | xong |
| 7 | Mục CHANGELOG 2026-11-18.10, build | `design/CHANGELOG.md` | xong |

## Chờ

- Thử máy: fps Android tầm trung ở bãi hạc / cạnh tháp (+3 draw call, +9,6k tam giác góc vào); nghe sáo gió (âm lượng 0,18 × mức).
- Đăng lại Canvas 3D sau khi gộp; bản đồ lớn vùng này chưa vẽ tháp.
