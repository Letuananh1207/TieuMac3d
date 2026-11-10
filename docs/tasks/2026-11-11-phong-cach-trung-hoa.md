# Phong cách Trung Hoa — dựng lại kiến trúc, cây, đồ trang trí, nhân vật theo bản mẫu
- Yêu cầu: thiết kế 2026-11-11.1, phần "Cần code" (`design/scene/phong_cach.md`, bản mẫu
  `design/source/PhongCach-KienTruc.dc.html`, `PhongCach-CayNhanVat.dc.html`). Người dùng chọn: **làm trước mốc 3**,
  **đổi nhân vật sang đệ tử** (gấu khối giữ làm bản dự phòng trong code).
- Loại: sửa hình (cảnh 3D) + thêm kiểu vật + nhân vật mới · Cỡ: lớn · Trạng thái: xong (thiết kế 2026-11-11.2 đã bật kiểu mới, đã áp)

## Mục tiêu

Mọi thứ dựng bằng hình khối trong code (không gói ngoài, không texture ảnh, Lambert, không shadow), đúng tinh thần
粉牆黛瓦 · 朱柱青檐. Cả cảnh `scene.json` hiện tại (6 khu) ≤ 150 draw call ở 3 góc sau khi thay hình.

## Phạm vi
**Sẽ sửa**
- `web/src/scene/buildings.ts` → tách `web/src/scene/kien_truc/` (hoặc `buildings/`) theo kiểu: `dien` (nền đá 1 m +
  bậc 4 m + lan can trụ thấp, cột son 3,6 m cách 2,5 m, cửa bức bàn, dải xà lục + lam + chấm vàng, **mái hiên kép**:
  hiên dưới vươn 3,5 m, đầu đao; mái trên yết sơn, hai đầu nóc cong; biển giữa hai tầng mái; đèn lồng góc hiên) ·
  `giang-duong` (cùng ngôn ngữ, một tầng mái + đầu đao — **thay dáng mái xiên cũ**) · `nha-nho` (mái hai mái nóc
  thẳng vểnh, khung gỗ lộ, cửa giữa, 2 cửa sổ tròn song chữ thập, nền 0,5 m) · `thap` (thân bát giác, hẹp 0,4 m/bên
  mỗi tầng, vành hiên cong, chóp + hồ lô 2 bầu).
- `web/src/scene/gate.ts`: cổng **3 gian 4 trụ**, gian giữa = `width`, gian bên 3,5 m, gian giữa cao hơn, 3 mái nhỏ,
  **xà thấp nhất ≥ 6 m**, chân trụ đá; va chạm 4 trụ. Trường mới `gates[].hanTitle` (biển chữ Hán, vd. "文淵宗").
- `web/src/scene/walls.ts`: `walls.style` = `gach` (mặc định, như cũ) · `voi` (tường vôi trơn + chân đá + mái ngói
  nhỏ trên đỉnh, màu `walls.color`); `voi` → mỗi khe cổng thành **cổng trăng** (vòm tròn viền đá, đường kính = bề
  rộng khe), cửa sổ hoa rải dọc tường (`walls.windows` khoảng cách, 0 = không có).
- `web/src/scene/trees.ts`: kiểu `tung` (thân cong, lá "đám mây" dẹt xếp tầng, mặt trên sáng), `lieu` (tán vòm +
  dải rủ đung đưa), `mai` (cành gãy khúc, chùm hoa hồng); màu `trees.pine`, `trees.willow`, `trees.plum`. Giữ `tan`, `truc`.
- `web/src/scene/props.ts` (+ tách nếu > 400 dòng): `da-thai-ho`, `den-da` (ô sáng vàng ấm), `dinh-dong` (khói hương
  như lò đan). Có va chạm.
- `web/src/player/discipleCharacter.ts` (mới): đệ tử chibi — đầu ≈ 1/2,5 chiều cao, tóc búi + trâm vàng + dải tóc lam
  bay, đạo bào giao lĩnh `#DCE8EE` viền / đai `#3F5FA0`, tay áo rộng rủ, ngọc bội lục; thân nhún khi đi, tay áo + dải
  tóc đung đưa. Qua `Character`, **không sửa** `PlayerController`. `main.ts` dùng đệ tử; gấu khối giữ làm dự phòng.
- `web/src/scene/spec.ts`, `specCheck.ts`: trường mới (mặc định = cảnh hiện tại: `walls.style: gach`, `hanTitle`
  không có, màu cây mới…). `check-scene.mjs`, skill `ui-design` (bảng trường), `web_scene.md`, ADR 0002.

**Cần kiểm tra** `scene/merge.ts` (vật liệu mới gộp được), `designPreview.ts` (va chạm cổng 4 trụ, cổng trăng),
`ui/hud.ts` (nhãn tên theo chiều cao đệ tử), `player/controller.ts` (không đổi).

**Không đụng** bố cục `scene.json` (phiên thiết kế), địa hình / bậc / thác (đợt 2), cầu nối, Flutter, nội dung bài.

## Cần quyết định
1. **Chip HUD "Học xá · Sân chính" đổi theo khu đang đứng** (phiên thiết kế gợi ý). Là hành vi mới → luật mới trong
   sổ + dữ liệu ranh giới khu (`areas` trong đặc tả: tên + hình chữ nhật). Đề xuất: **làm trong đợt này** — chữ chip
   = "Văn Uyên Tông · <tên khu>", ngoài mọi khu = "Văn Uyên Tông"; tên khu do phiên thiết kế đặt trong `scene.json`.
   Hoặc để sau.
2. Cổng trăng: lối đi qua được = **dây cung vòm ở mặt đất** (tâm vòm ở 0,6 bán kính → lối ≈ 0,8 × bề rộng khe; khe 4 m
   → đi được 3,2 m). Ví dụ R-VA-1 (khe 4: x = 0 qua, x = 3 dừng ở z = 20,0) **vẫn đúng**; chữ luật không đổi.
3. Màu nhân vật đệ tử để trong code nhân vật (như gấu khối), không đưa vào `scene.json` — nhân vật không phải cảnh.
   Áo theo bậc (ngoại / nội môn) để đợt 2.

## Luật
- R-VA-1: không đổi chữ (va chạm cổng 4 trụ, cổng trăng, props mới nằm trong "cột cổng / vật trang trí có va chạm").
  Kiểm lại ví dụ bằng mô phỏng `Colliders` khi đổi tường.
- Nếu duyệt chip theo khu: luật mới **R-HUD-1** (chip hiện tên khu đang đứng) → sổ → online → `--mark-synced` → code.

## Nhiệm vụ
- [x] 1. Đặc tả: trường mới + mặc định giữ cảnh cũ; `scene:check` với `scene.json` hiện tại "Không có lỗi".
- [x] 2. Mái dùng chung: hiên kép, yết sơn, hai mái, đầu đao, si vẫn (hàm trong `kien_truc/mai.ts`).
- [x] 3. `dien` + `giang-duong` theo bản mẫu (lan can, bậc, cửa bức bàn, xà màu).
- [x] 4. `nha-nho`, `thap` bát giác.
- [x] 5. Cổng 3 gian 4 trụ + `hanTitle`; camera đi qua cổng không lọt sau biển (chụp góc chơi tại cổng).
- [x] 6. Tường vôi + cổng trăng + cửa sổ hoa; mô phỏng R-VA-1.
- [x] 7. Cây `tung`, `lieu` (đung đưa), `mai` — instancing.
- [x] 8. Props `da-thai-ho`, `den-da`, `dinh-dong`.
- [x] 9. Nhân vật đệ tử + đổi trong `main.ts` / Canvas 3D.
- [x] 10. (nếu duyệt) `areas` + chip HUD theo khu + R-HUD-1.
- [x] 11. Đo 3 góc với `scene.json` hiện tại (+ một bản thử dùng kiểu mới: `walls.style voi`, cây mới, props mới) ≤ 150
  draw call; chụp so với bản mẫu, ghi chỗ khác bản mẫu nhiều.
- [x] 12. Skill `ui-design` (trường mới), `web_scene.md`, ADR; phiếu cho phiên thiết kế: bật `walls.style: voi`, đổi
  cây sang `tung` / `lieu` / `mai`, thêm props mới, `hanTitle`, (tên khu nếu làm chip).

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm run scene:check && npm run build &&
npm run build:design · cd app && flutter analyze · flutter test -r failures-only test/scene ·
dart tool/rule_trace.dart · chụp app dọc + ngang, Canvas 3D 3 góc · thử trên máy

## Đã quyết khi duyệt (2026-11-11)
- Chip HUD theo khu: làm trong đợt này → R-HUD-1 (sổ + online + `--mark-synced`), mặc định không có khu = chữ cũ.

## Ghi chú khi làm (2026-11-11)
- Đo `scene.json` hiện tại: 49–77 draw call; cảnh mẫu đủ kiểu mới (`docs/phieu_thiet_ke/2026-11-11-phong-cach-mau.json`,
  dựng trong bản sao tạm): 67–90 draw call, ~66k tam giác.
- Mô phỏng: R-VA-1 với tường gạch và tường vôi (cổng trăng: x = 0, 1 qua; x = 3 dừng z = 20,0); R-HUD-1 đủ ví dụ;
  vùng lop-hsk3 / thu-vien vẫn đứng vào được với nền nhà mới (cách tâm 0,4 / 0,6 m). Chưa khoá bằng test (chưa có vitest).
- Giảng đường đổi dáng (mái yết sơn, nền + lan can): va chạm 14 × 8 → 15 × 9.
- Canvas 3D: `?cam=x,y,z&tam=x,z`, `?nhan-vat=gau`. Nhãn tên cao 2,5 m (trên búi tóc đệ tử).

## Để sau mốc 3 (người dùng chọn, 2026-11-11) — "Cần code" của thiết kế 2026-11-11.2
- [ ] Liễu mềm hơn: dải lá mảnh, cong, so le (`scene/cay_moi.ts` `addWillow`).
- [ ] Đảo nổi có mặt cỏ, cây, đá (`scene/sky.ts`).
- [ ] Khe giữa các đoạn tường khu (`wallSegments`) cũng thành cổng trăng (cần trường khe cho đoạn tường + mô phỏng R-VA-1).
Chi tiết: `design/scene/phong_cach.md` mục "Còn khác bản mẫu".
