# Giao diện HUD cổ trang · tiên hiệp trên điện thoại (國風 UI)
- Ngày: 2026-11-11 · Khu: toàn app (HUD nổi trên cảnh 3D) · Trạng thái: nháp — phiên thiết kế vẽ 3 hướng để người
  dùng chọn (phiếu `docs/phieu_thiet_ke/2026-11-11-hud-lam-lai.md`)

## Một câu

HUD là lớp chữ và nút nổi trên cảnh; muốn "chuyên nghiệp" thì nó phải **thuộc về thế giới tông môn** (chất liệu, chữ,
hoạ tiết) nhưng **không tranh chỗ với cảnh** — ít, gọn, đọc rõ, chạm dễ.

## Đặc điểm nhận diện (thiếu là "không ra chất")

1. **Một chất liệu cho cả bộ**: mọi thành phần cùng một "vật liệu" thế giới (giấy dó, gỗ sơn, ngọc / lụa) — HUD hiện
   tại trộn chip kính mờ + thẻ gỗ + bảng đen, không ra một bộ.
2. **Chữ có thứ bậc**: tiêu đề / tên nơi dùng chữ có nét (Lora hoặc chữ Hán thư pháp), thân chữ sans dễ đọc (Be Vietnam
   Pro). Chữ thư pháp **chỉ cho chữ Hán và tiêu đề ngắn** — đổi chữ quá đà mất khả năng đọc (kinh nghiệm đội mỹ thuật
   NetEase Lôi Hoả với 《忘川風華錄》).
3. **Một hoạ tiết nhận diện, dùng tiết chế**: mây lành (祥雲), góc khung kiểu cửa sổ hoa, hoặc **dấu ấn đỏ (印章)** — chọn
   1–2, đặt ở góc / điểm nhấn, không phủ khắp.
4. **Màu theo cảnh**: cảnh giờ là **ban ngày, nền lạnh** (trời lam, sương xám, tường vôi) → HUD tối nặng (gỗ sẫm của
   bản chạng vạng) trông "dán lên". Nền lạnh + điểm ấm nhỏ (son, vàng) như cảnh.
5. **Ít thứ trên màn**: app học chữ, không phải MMO. Trái với thói quen giao diện Trung Quốc "dày thông tin, mọi nút trên
   màn chính" — khi đem ra thị trường khác dễ thành rối. Màn chơi chỉ: tên khu, joystick, 1–2 nút, thẻ mời khi cần.
6. **Chuyển cảnh có nghi thức**: vào khu mới hiện tên khu lớn bằng chữ Hán + Việt rồi mờ dần (thẻ tên khu) — quy ước
   rất phổ biến của game cổ trang, rẻ mà "đắt".

## Bố cục màn chơi (dọc 390×844 · ngang 844×390)

| Vị trí | Thành phần | Quy ước / nguồn |
|---|---|---|
| trên trái | tên khu (chip) | tránh tai thỏ: cộng safe area |
| trên phải | nút phụ (cài đặt / góc nhìn), fps chỉ ở chế độ gỡ lỗi | |
| dưới trái | joystick nổi (hiện ở chỗ chạm, vùng 45 % trái — luật R-DIEU-1) | joystick nổi: theo ngón cái, ít rối màn hơn joystick cố định |
| dưới phải | nút hành động chính (nếu có) | hành động chính ở góc dưới, nơi ngón cái tới |
| giữa trên | thẻ mời khi đứng trong vùng | không che nhân vật (nhân vật ở giữa / dưới giữa) |
| trên đầu nhân vật | nhãn tên | |

Kích thước chạm tối thiểu **44 pt (iOS) / 48 dp (Android)**; biểu tượng có thể nhỏ hơn nhưng vùng chạm phải đủ, vùng chạm
không chồng nhau. Mọi neo mép dùng safe area (`--sa-*`), không viết cứng px — tai thỏ, bo góc, thanh cử chỉ ăn vào mép.

## Ba hướng để vẽ (phiên thiết kế vẽ cả ba trên cùng màn mẫu, người dùng chọn)

| | A. Giấy dó · mực tàu (水墨) | B. Gỗ son · vàng kim (朱漆描金) | C. Ngọc bích · lụa (青玉) |
|---|---|---|---|
| Cảm giác | thanh, văn nhân, hợp "học xá" | trang trọng, cổ điển, giống game cổ trang phổ biến | tiên khí, hiện đại, nhẹ nhất |
| Nền thành phần | giấy dó ngà `#F3E6C8` trong ~90 %, mép xơ / viền nét bút | gỗ sẫm `#1F1610` + viền vàng mảnh `#D4A64A` | kính mờ lạnh trắng sương / ngọc lục nhạt, viền 1 px sáng |
| Chữ | mực `#1F1610`, tiêu đề Lora / thư pháp Hán | giấy `#F3E6C8` trên gỗ, tiêu đề vàng | chữ sẫm lam `#24323A`, tiêu đề Lora |
| Nút chính | **dấu ấn đỏ** vuông `#A8322A`, chữ trắng | nút son bo tròn viền vàng | nút ngọc lục `#2B5446` / viền vàng nhỏ |
| Hoạ tiết | vệt mực, ấn triện | mây lành ở góc, góc khung kiểu cửa sổ hoa | đường mảnh, một chấm vàng; gần như không hoạ tiết |
| Hợp cảnh ban ngày | tốt (sáng) | kém hơn (tối) — cần viền / bóng rõ | tốt |
| Rủi ro | chữ sẫm trên giấy sáng khó đọc trên trời sáng → cần nền đặc hơn | nặng, "Tết", lấn cảnh | nhạt quá, thiếu chất cổ trang |

Cả ba giữ: bảng màu cảnh (`design/scene/phong_cach.md`), font đóng gói, tương phản chữ ≥ 4,5 : 1 trên **cả nền trời sáng
lẫn tường vôi trắng** (phần lớn khung hình ban ngày rất sáng).

## Màu (đối chiếu)

| Vai trò | Hex | Có trong token / phong_cach? |
|---|---|---|
| Giấy dó | `#F3E6C8` | có (`paper`) |
| Gỗ sẫm / mực | `#1F1610` | có (`ink`) |
| Son (nút, ấn) | `#A8322A` (cột son cảnh) · `#B5352B` (token cũ) | có — nên thống nhất một màu son |
| Vàng kim | `#D4A64A` (cảnh) · `#E0AE4C` (token cũ) | có — nên thống nhất |
| Ngọc lục | `#2B5446` | có (mái lưu ly) |
| Lam xám chữ | `#24323A` | chưa — đề xuất cho hướng C |

Token HUD (`design/tokens/design_tokens.json`) rút từ bản chạng vạng; cảnh đã đổi bảng màu ở 2026-11-11.1 → HUD mới nên
lấy màu từ bảng cảnh, cập nhật token.

## Chữ

| Dùng | Font | Ghi chú |
|---|---|---|
| Thân, nút, tiếng Việt | Be Vietnam Pro 500 / 700 (đang có) | đủ dấu tiếng Việt |
| Tiêu đề Việt, pinyin | Lora 700 (đang có) | có dấu tiếng Việt |
| Chữ Hán tiêu đề (tên khu, chữ bài học) | thư pháp: Ma Shan Zheng / Zhi Mang Xing / Long Cang (Google Fonts, OFL) | **font thư pháp không có dấu tiếng Việt** — chỉ cho chữ Hán; font CJK đầy đủ nặng vài MB → chỉ đóng gói tập chữ cần dùng (cắt font lúc build — cần code) |

## Sai thường gặp cần tránh

- **Mỗi thành phần một chất liệu** (kính + gỗ + bảng đen) → rời rạc, "nghiệp dư". Một bộ một chất liệu.
- **Hoạ tiết khắp nơi** (mây ở mọi viền) → rối, nặng. 1–2 hoạ tiết, ở góc.
- **Viết tiếng Việt bằng font thư pháp Hán** → mất dấu, vỡ chữ.
- **Nền HUD tối nặng trên cảnh ban ngày** → trông dán lên; hoặc **chữ sáng mỏng trên trời sáng** → không đọc được.
- **fps, chữ gỡ lỗi trên màn thật** → trông chưa xong. Chỉ chế độ gỡ lỗi.
- **Nút nhỏ hơn 44 pt**, nút sát mép bị tai thỏ / thanh cử chỉ ăn.
- **Đỏ + vàng nhiều** → "phố Tàu / Tết", mất tiên khí (`references/nen-tang.md` §6).
- **Dựng lại giao diện của một game cụ thể** (Genshin, Where Winds Meet…) → lấy tinh thần, không chép bố cục / hoạ tiết riêng.

## Đưa vào app

- Thành phần cần vẽ (phiếu HUD): chip tên khu · thẻ tên khu khi vào khu (mới) · joystick (nền + núm) · nhãn tên ·
  dòng hướng dẫn lần đầu · thẻ mời (eyebrow, tiêu đề có chữ Hán, nút chính + phụ) · nút góc nhìn · màn tải (mới, lúc
  khởi động trước khi cảnh hiện) · fps (chỉ gỡ lỗi). Bảng bài học: phiếu riêng `2026-11-10-man-bai-hoc.md` — vẽ cùng
  chất liệu với hướng được chọn.
- Cần code sau khi chốt: token mới; font thư pháp cắt tập chữ (nếu chọn dùng); thẻ tên khu (dùng `AreaTracker` có sẵn);
  màn tải (che trong lúc dựng cảnh); ẩn fps khi không gỡ lỗi; hoạ tiết bằng SVG / CSS, không ảnh bitmap.

## Nguồn

- 中国风元素 trong thiết kế sản phẩm (人人都是产品经理) — https://www.woshipm.com/pd/311599.html — kho yếu tố: mực tàu, mây lành, thư pháp, trúc lan
- Thiết kế chữ thư pháp cho game quốc phong (机核 / NetEase 雷火, 《忘川风华录》) — https://www.gcores.com/articles/153626 — chọn khải / hành thư theo thế giới; đổi chữ quá đà mất khả năng đọc
- Bố cục quốc phong (数英) — https://www.digitaling.com/articles/594257.html — Tống thể / thư pháp, khoảng trống, màu quốc hoạ
- Game UI design principles (Pixune) — https://pixune.com/blog/game-ui-design/ — UI phải thuộc thế giới game, thông tin trước
- Apple HIG — Game controls — https://developer.apple.com/design/human-interface-guidelines/game-controls — đặt nút ảo theo safe area, chỗ dễ với
- Touch controls for mobile games (Cursa) — https://cursa.app/en/page/touch-controls-for-mobile-games-input-patterns-and-feedback — joystick cố định vs nổi; vùng nửa trái
- Responsive game UI (Abratabia) — https://www.abratabia.com/game-ui-design/responsive-game-ui.php — neo HUD theo inset, không px cứng
- Mobile constraints (Cursa) — https://cursa.app/en/page/mobile-game-development-essentials-mobile-constraints-and-design-targets — 44 pt iOS / 48 dp Android
- Culturalization guide — UX issues — https://sites.google.com/view/culturalizationguide/culture-taboos/user-interface/ux-issues — UI Trung Quốc dày thông tin, dễ rối ở thị trường khác
- Where Winds Meet UI (Gfinity) — https://www.gfinityesports.com/article/where-winds-meets-atrocious-ui-is-ruining-an-otherwise-great-wuxia-rpg — phản ví dụ: menu lồng nhau, khó dùng
