# Phiếu: Hình minh hoạ 3D mềm thay biểu tượng nét (mọi chỗ — HUD web + màn Flutter)
- Trạng thái: chờ thiết kế
- Đã vẽ: 2026-11-16.2 — **đợt 1** (11 hình thanh công cụ + nút hành động, + 4 bản cắt nửa trên `-nut`; phong cách bản 5: cùng chất ảnh đàn cổ tranh, chính diện, nhân vật Tiểu Mặc — `design/icons/`). Đợt 2, 3 chưa vẽ.
- Đợi bởi: kế hoạch `docs/tasks/2026-11-15-hinh-minh-hoa.md` (V-20261115-72)
- Yêu cầu người dùng: "các hình tượng trưng cho chức năng ở thanh chức năng và những chỗ khác đang dùng icon và tôi cảm thấy
  không chuyên nghiệp; ở 摩尔 họ làm rất đẹp, có lẽ là hình ảnh nên tôi cũng muốn".
- Đã chốt với người dùng: phong cách **hình 3D mềm cute kiểu 摩尔** (chỉ học cảm giác, không chép hình) · phạm vi **tất cả mọi
  chỗ** · nguồn **phiên thiết kế vẽ bằng AI tạo ảnh** (như bộ ảnh NPC — Gemini) rồi xuất ảnh nén đóng gói (app offline).
- Còn chờ quyết định (thiết kế đề xuất, người dùng chọn trên canvas): (1) **dấu thao tác nhỏ** (đóng ×, tích, sai, mũi tên,
  xoay, cấm… cỡ 11–22 px) giữ nét SVG hay cũng làm hình — phiếu đề xuất **giữ nét**, có artboard so sánh; (2) bản đồ vùng
  (vẽ trên giấy mực) dùng hình 3D hay giữ nét mực; (3) có thêm token màu tươi cho hình (`hinh-*`) hay chỉ token đang có.

## Kiểm kê biểu tượng đang có (2026-11-15, nhánh `main` 2575f3f)

Cỡ = cỡ hiển thị hiện tại (px CSS) / khung chứa. Trạng thái = những trạng thái hình phải chịu được. **Mã** = tên file hình đề
xuất (`<mã>.webp`). `↺` = dùng lại hình của mã khác.

### 1. Thanh công cụ (đợt 1) — 5 hình

| Mã | Đang là gì (file:dòng) | Ý nghĩa | Cỡ | Trạng thái |
|---|---|---|---|---|
| `ban-do` | `TOOL_ICONS.banDo` cuộn gấp nét — `web/src/ui/toolbarIcons.ts:14`, dựng `toolbar.ts:34` (20 trong đĩa ngọc 34) | mở bản đồ truyền tống | 20 / 34 | thường (nổi bật: đĩa ngọc) · nhấn · mờ · đang mở |
| `ve-nha` | `TOOL_ICONS.veNha` mái nhà — `toolbarIcons.ts:15`; cả tấm báo "Bạn đang ở Nhà của ta" `toolbar.ts:49` (18) | cưỡi hạc về Nhà của ta | 24 / 34 · 18 | thường · nhấn · **mờ** (đang ở nhà) |
| `bieu-cam` | `TOOL_ICONS.bieuCam` mặt cười nét — `toolbarIcons.ts:16` | mở bảng Biểu cảm | 24 / 34 | thường · mờ (đang ngồi) · đang mở |
| `tui-do` | `TOOL_ICONS.tuiDo` túi — `toolbarIcons.ts:17`; vòng đầu tấm Túi đồ `bagPanel.ts:44` (20); nút "Cất" + túi đồ trang trí `decorIcons.ts:44` → `decorHud.ts:98` (22), `decorPanel.ts:68,106` (16, 26) | túi đồ | 24 / 34 · 16–26 | thường · đang mở |
| `nhiem-vu` | `TOOL_ICONS.nhiemVu` thẻ dải — `toolbarIcons.ts:18` | bảng nhiệm vụ hằng ngày | 24 / 34 | thường · **chấm son số** (CSS, `toolbar.css:25`) |

Ngang / máy tính: thanh 56 (`toolbar.css:94`), ô cùng cỡ.

### 2. Nút hành động + cột phải (đợt 1) — 6 hình

| Mã | Đang là gì | Ý nghĩa | Cỡ | Trạng thái |
|---|---|---|---|---|
| `nhay` | mũi tên lên + sóng — `web/index.html:45` (30 trong tròn 68 ngọc) | Nhảy | 30 / 68 | thường · nhấn · mờ (đang bay / ngồi) |
| `chao` | hai tay chắp — `index.html:46` (24 / tròn 52 kính) | Chào | 24 / 52 | thường · mờ · **bật** (đang chào) |
| `ngoi-on` | người ngồi cầm cuộn — `index.html:47` (24 / 52) | Ngồi ôn / Đang ôn | 24 / 52 | thường · mờ · bật (jade viền gold + quầng) · chấm son |
| `tro-chuyen` | bóng thoại — `web/src/ui/chatPanel.ts:83` (24 / tròn 48) | mở kênh trò chuyện | 24 / 48 | thường · nhấn |
| `trang-tri` | nhà + bút — `ICON_DECOR` `decorIcons.ts:28` → `decorHud.ts:64` (24 / 48) | chế độ trang trí (chỉ ở nhà) | 24 / 48 | thường · đang bật |
| `doc-sach` | bìa sách CSS `index.html:57` (`#readBook .cover`), sách nét `ICON_BOOK` `toolbarIcons.ts:22` → `bagPanel.ts:121` (16), `shopPanel.ts:23,229` (20), nút "Cách chơi" khi tự học `index.html:72` `#guideIconBook` (20); Flutter "Mượn" `app/lib/lesson/library_screen.dart:259` | đọc / mượn sách | 16–32 | thường |

### 3. Nút nổi bám vật + HUD trò chơi (đợt 2) — 13 hình

Viên ngọc cao 46 (`style.css:264`), biểu tượng 20 bên trái chữ. Hình mới đề xuất 28, nhô nhẹ khỏi viên.

| Mã | Đang là gì | Ý nghĩa | Cỡ | Trạng thái |
|---|---|---|---|---|
| `noi-chuyen` | bóng thoại — `index.html:52` | Nói chuyện với NPC | 20 | thường · nhấn |
| `ngoi` | người ngồi đệm — `index.html:102` | Ngồi (chỗ ngồi) | 20 | thường |
| `ra-san` | cửa + mũi tên — `index.html:106`; ↺ "Rời bàn" `web/src/ui/gameHud.ts:109,225` (18) | Ra sân / Rời bàn | 18–20 | thường |
| `xem-bang` | bảng có chân — `index.html:60` | Xem bảng nhiệm vụ | 20 | thường · chấm son |
| `vao-tiem` | mái hiên tiệm — `index.html:66` | Vào tiệm Tạp hoá | 20 | thường |
| `cach-choi` | vòng + dấu hỏi — `index.html:72` `#guideIconPlay` | Cách chơi trò chơi | 20 | thường |
| `vao-hoc` | chấm tròn — `index.html:40` (`.learn .dot`) | nút học nổi trên vật học | 10 → 26 | thường |
| `gieo` | tay rắc hạt — `ICON_SOW` `cropArt.ts:138` → `gardenHud.ts:103` (20); đầu bảng chọn hạt `gardenPanel.ts:74` | Gieo | 20 | thường |
| `tuoi` | bình tưới — `ICON_WATER` `cropArt.ts:140` | Tưới | 20 | thường · mờ (hết lượt) |
| `thu` | giỏ — `ICON_BASKET` `cropArt.ts:147` | Thu (hái) | 20 | thường |
| `mo-o` | cuốc — `ICON_HOE` `cropArt.ts:149` | Mở ô đất | 20 | thường (kèm viên giá Văn tiền) |
| `ban` | thùng — `ICON_CRATE` `cropArt.ts:153` | Bán ở thùng thu mua | 20 | thường |
| `van-moi` | mũi tên vòng `AGAIN` — `gameHud.ts:221` (18) | Ván mới (Ngũ Tử Kỳ / Đấu chữ) | 18 | thường |

### 4. Biểu cảm (đợt 2) — 8 hình

Đang là hình SVG hai màu 48×48 (`EMOTE_ICONS`, `toolbarIcons.ts:33–52`); bảng 8 ô `emotePanel.ts:33` (32; ngang 28 —
`toolbar.css:97`), bong bóng trên đầu `emoteBubble.ts:38` (34 trong đĩa 52 — `toolbar.css:46`). Mã giữ đúng `EmoteId`:
`vay-tay` · `chap-tay` · `cui-chao` · `vo-tay` · `cuoi` · `nhay-mung` · `suy-nghi` · `ngoi-nghi`. Trạng thái: thường · nhấn.

### 5. Đồ vật: nông sản, hạt, đất, đồ trang trí (đợt 3) — 25 hình

Đang có **hình code vẽ nhiều màu** (khá hơn icon nét, nhưng phẳng, khác chất với hình mới) — đề xuất **thay** cho đồng bộ.

| Mã | Đang là gì | Cỡ | Ghi chú |
|---|---|---|---|
| `cai` `cu-cai` `ngo` `lua` `bi` `cuc` `dua` `tra` (8 nông sản) | `CROP_ART` `web/src/ui/cropArt.ts:28–97` (web) + bản chép tay `app/lib/lesson/crop_art.dart:131` (Flutter) | 34 (túi `bagPanel.ts:85`), 36 (`.bg-crop`), thẻ Tạp hoá / kho | mã = `CropId` |
| `goi-hat` | `SEED_PACK` `cropArt.ts:126` → `shopPanel.ts:46` (26); Flutter `crop_art.dart:188` | 26 | gói giấy trơn; code đặt hình nông sản nhỏ lên góc → không cần 8 gói |
| `o-dat-khoa` | `UNLOCK_PICTURE` `cropArt.ts:170` → `gardenPanel.ts:161` (76) | 76 | luống đất hoang có cọc gỗ |
| `lap-lanh` | `SPARKLE` `cropArt.ts:160` → `gardenHud.ts:143,162` (20, 30) | 20–30 | dấu "đã chín" trên luống |
| `giot-nuoc` | `DROP` `cropArt.ts:165` → `gardenHud.ts:143` (15) | 15 | dấu "khát nước" trên luống |
| 13 đồ trang trí: `truc-canh` `mai` `tung` `da-thai-ho` `ao-sen` `den-long` `ban-tra` `chau-lan` `lu-huong` `tranh-chu` `ke-sach` `an-doc` `binh-phong` | web: `DECOR_PICTURES` `decorIcons.ts:59–72` → `decorPanel.ts:22`, `shopPanel.ts:43`, `bagPanel.ts:85`; **Flutter: Material Icons tạm** `app/lib/lesson/shop_parts.dart:28–45` (`Icons.grass`, `Icons.park`… — chỗ "không chuyên nghiệp" rõ nhất) | 34–64 | mã = id món; `tranh-chu` vẽ tranh thuỷ mặc **không chữ** (R-HUD-4) |

Trạng thái chung: thường · **khoá** (món chưa mở: ổ khoá nhỏ `decorPanel.ts:156` + mờ) · đang đặt.

### 6. Văn tiền (đợt 3) — 1 hình

| `van-tien` | đồng xu lỗ vuông SVG `coinIcon()` `web/src/ui/wallet.ts:14` (ví 26 `wallet.ts:90`, 20–22, xu bay 30 `wallet.ts:252`), `COIN` `decorIcons.ts:51` (12–14 trên giá), `gameHud.ts:232` (18); Flutter `CustomPaint` `app/lib/lesson/coin.dart:22` (mặt trơn, không chữ — R-HUD-4) | 12–30 | thường · bay (hoạt ảnh CSS / Web Animations giữ nguyên) |

### 7. Bản đồ vùng (đợt 3, **chờ chọn** — mục 2 "còn chờ") — 10 hình

Bộ dấu vẽ bằng `Path2D` trên Canvas 2D, đĩa giấy viền mực (`web/src/ui/areaMapIcons.ts:113` `drawMapIcon`, chú giải `:148`,
dấu mép `:137`), dùng chung bản đồ nhỏ (`miniMap.ts`) + bản đồ lớn (`areaMapPanel.ts`). Kiểu: `ICON_KINDS`
`web/src/zones/areaMap.ts:75` → mã `vong-tran` · `cong-canh` · `son-mon` · `ban-co` · `ban-dau-chu` · `tap-hoa` · `tu-hoc` ·
`cho-ngoi` · `bang-nhiem-vu`, thêm `nha-cua-ta` (biểu tượng tiểu viện trên bản đồ truyền tống, components.md "Biểu tượng bản đồ
Nhà của ta"). Cỡ 18–28 trên đĩa giấy. **Mũi tên "mình"** (`drawMe` `:123`, xoay theo hướng nhân vật) và dấu bắc "B" giữ vẽ code.

### 8. Đầu bảng / ô trống / màn Flutter (đợt 3) — 7 hình

| Mã | Đang là gì | Cỡ |
|---|---|---|
| `kho-nong-san` | `ICON_CRATE` đầu "Kho nông sản" + kho trống — `gardenPanel.ts:102,115` | 20–40 |
| `tui-hat` | `ICON_BAG` (cropArt) túi hạt — `gardenPanel.ts:76,96,140` | 16–40 |
| `goi-y` | "lời nhắc" — `noticeIcon('lua')` `guidePanel.ts:130` (22), lời nhắc vàng (biểu tượng i), Flutter `Icons.info_outline` `library_screen.dart:233` | 18–22 |
| `khoa` | ổ khoá — `ICON_LOCK` `decorIcons.ts:38` (13), thẻ nơi khoá bản đồ `index.html:121` (`.lock` CSS), `ICON_UNLOCK` `cropArt.ts:157` | 13–20 |
| `on-tap` | Flutter `Icons.sync` "Ôn bộ đến hạn" — `app/lib/lesson/study_screen.dart:222` (vòng 18–20, `study_parts.dart:179`) | 18–20 / vòng 40 |
| `hoc-moi` | Flutter `Icons.edit_outlined` "Học bộ mới" — `study_screen.dart:223` | 18–20 |
| `da-hoc` | Flutter `Icons.grid_view` "Xem bộ đã học" — `study_screen.dart:224` | 18–20 |

↺ dùng lại: `noticeIcon('ban-do')` `guidePanel.ts:132` và Flutter `Icons.map_outlined` `study_parts.dart:276`,
`Icons.place_outlined` `study_screen.dart:269` → `ban-do`; Flutter `Icons.menu_book` → `doc-sach`; `Coin` Flutter → `van-tien`;
Tạp hoá Flutter → nhóm 5.

### 9. Dấu thao tác nhỏ — đề xuất GIỮ nét SVG (0 hình, chờ chọn)

Đóng × (`toolbarIcons.ts:21`, `shopPanel.ts:22`, `chatPanel.ts:102`, `areaMapPanel.ts:40`, `index.html:87,97,124,132`, Flutter
`Icons.close`), tích / xong (`decorIcons.ts:32`, `cropArt.ts:155`, `dailyPanel.ts:22`, `gameHud.ts` TICK, `guidePanel.ts:87`,
Flutter `Icons.check` ở `daily_parts.dart:33,143`, `review_parts.dart:41`, `review_screen.dart:110,241`), sai (`gameHud.ts`
CROSS, `review_parts.dart:42,202`), mũi tên / chevron (`chatPanel.ts:305`, `miniMap.ts:77`, Flutter `Icons.arrow_forward`,
`chevron_left/right` ở `book_screen.dart:65–66`, `learned_screen.dart:76`, `lesson_screen.dart:269`, `radical_screen.dart:270,354`,
`study_parts.dart:193`), gửi (`chatPanel.ts:145`), vòng xoay chờ (`chatPanel.ts:64`), xoay / di chuyển / bút / cộng / xoá / cấm
(`decorIcons.ts:30–48` → `decorHud.ts:93–146`), bỏ qua (`index.html:182`), tải lên (`study_parts.dart:328`), gạch (`study_screen.dart:271`).
Lý do giữ: cỡ 11–22 px, là **dấu thao tác** chứ không phải "đồ vật"; hình 3D ở cỡ này nhoè, khó đọc; 摩尔 cũng giữ nút × / tích
phẳng. Đề xuất chỉ **làm lại nét cho cùng họ** (đầu tròn, dày 2,4, `slate` / trắng) — thiết kế chọn trên artboard so sánh.

Không đổi: hình minh hoạ trong bảng Cách chơi (`guidePanel.ts:56` bàn cờ, `:101` người trên đài — đã là tranh), triện son
"Xong" (chữ Việt, CSS), núi màn tải / màn bài học (cảnh, không phải biểu tượng), ảnh mặt NPC hội thoại (đã là ảnh).

### Tổng

| Nhóm | Hình mới | Đợt |
|---|---|---|
| 1 Thanh công cụ | 5 | 1 |
| 2 Nút hành động + cột phải | 6 | 1 |
| 3 Nút nổi + HUD trò chơi | 13 | 2 |
| 4 Biểu cảm | 8 | 2 |
| 5 Đồ vật | 25 | 3 |
| 6 Văn tiền | 1 | 3 |
| 7 Bản đồ vùng (chờ chọn) | 10 | 3 |
| 8 Đầu bảng / Flutter | 7 | 3 |
| **Cộng** | **75** (đợt 1: 11 · đợt 2: 21 · đợt 3: 43) | |

### Bổ sung V-73 — Vườn kiểu 摩尔 (phiếu `2026-11-15-vuon-mole.md`) — +7 hình mới, 2 dùng lại

Thanh nông cụ (ô vuông 48–56, hình lấp gần kín ô — cỡ lớn hơn nút nổi), dấu trạng thái luống trong cảnh (16–20, thấy từ xa),
ngăn "Đồ làm vườn" ở Túi đồ. Gộp vào **đợt 2** (cùng nhóm nút vườn mục 3).

| Mã | Ý nghĩa | Cỡ | Trạng thái | Mô tả hình gợi ý |
|---|---|---|---|---|
| `tay-thu` | nông cụ Tay (thu hoạch) — ô thanh + nút "Dùng" | 48–56 · 28 | thường · đang cầm · nhấn | bàn tay đeo găng vải cầm giỏ tre nhỏ (khác `thu` = giỏ đầy) |
| `binh-tuoi` ↺ `tuoi` | Bình tưới | 48–56 | thường · đang cầm | dùng lại `tuoi` vẽ cỡ to |
| `hat-giong` ↺ `goi-hat` | ô Hạt giống khi chưa chọn loại | 48–56 | thường · đang cầm · mờ (túi trống) | dùng lại `goi-hat`; đã chọn loại → code chồng hình nông sản |
| `bat-sau` | Bắt sâu | 48–56 · 28 | thường · đang cầm | ống tre có nắp + con sâu xanh tròn ló đầu (dễ thương, không ghê) |
| `nho-co` | Nhổ cỏ | 48–56 · 28 | thường · đang cầm | bàn tay nắm bụi cỏ có rễ đất |
| `phan-bon` | Phân bón (vật tiêu hao) — thanh, Túi đồ, thẻ Tạp hoá | 48–56 · 34 · 64 | thường · đang cầm · mờ (0) | bao vải nâu buộc dây, miệng có hạt nâu + mầm xanh nhỏ |
| `dau-kho` | dấu "đất khô" trên luống | 16–20 | nhấp nháy nhẹ | giọt nước xanh rỗng + vệt nứt (khác `garden-water` giọt đầy) |
| `dau-sau` | dấu "có sâu" | 16–20 | nhấp nháy nhẹ | đầu sâu xanh tròn nhỏ |
| `dau-co` | dấu "có cỏ" | 16–20 | nhấp nháy nhẹ | hai lá cỏ nhọn xanh đậm |

Tổng mới: **75 + 7 = 82** (đợt 2: 21 + 7 = 28).

## Đặc tả kỹ thuật (đề xuất — phiên thiết kế chỉnh được, ghi lại khi chốt)

- **Ảnh từ AI**: vuông 1:1 (Gemini ra ~1024), **nền trắng trơn** (AI không cho nền trong suốt ổn định) → **tách nền** bằng
  rembg của bộ Hunyuan3D trên máy người dùng (`hy3dgen.rembg.BackgroundRemover`, như `mv_gen.py`) → cắt sát, căn giữa, chừa lề
  8 % → **bản gốc 512×512 PNG/WebP không mất** ở `design/icons/nguon/<mã>.webp` (giữ để xuất lại).
- **Quy ước vẽ chung**: góc nhìn **3/4 từ trên** (nhìn xuống ~30°, xoay ~30° sang trái) cho mọi đồ vật; hình người / mặt / tay
  nhìn thẳng hơi nghiêng. Ánh sáng **trên-trái**, bóng mềm, viền sáng nhẹ bên phải; **không viền nét đen**, không bóng đổ xuống
  sàn trong ảnh (bóng dưới chân nếu cần → CSS `drop-shadow` chung, một chỗ). Vật chiếm ~80 % khung, trọng tâm giữa. Đọc được ở
  **24 px** (thử: thu nhỏ còn nhận ra) — khối to, ít chi tiết vụn.
- **Màu**: bám token `design/tokens/design_tokens.json` — `jade` #2B5446 (và sắc sáng hơn cho khối lớn), `gold` #D4A64A,
  `lacquer` #A8322A, `map-paper` #F2EADA, `shelf-wood` #8A5A3A, `scroll-wood` #3A2418, `coin-rim` #A9802F; `slate` #24323A chỉ
  cho chi tiết tối nhất. "Màu tươi" kiểu 摩尔 = tăng sáng / bão hoà nhẹ các sắc trên; cần sắc mới → thêm token `hinh-*` có lý do.
- **Không chữ** trong hình (nhãn là HTML / Flutter Text), **không chữ Hán** (R-HUD-4), không logo, không chép hình 摩尔.
- **Xuất**: WebP có kênh alpha, chất lượng ~80. Cỡ **160×160** cho mọi hình (to nhất trên HUD ≈ 52 px × DPR 3 = 156);
  nhóm 5 (đồ vật, cả `o-dat-khoa`) thêm bản **256×256** `<mã>@256.webp` cho thẻ Tạp hoá / bảng (≤ 76 px × DPR 3). Không làm
  @1x riêng — trình duyệt / Flutter tự thu (`cacheWidth` ở Flutter).
- **Ngân sách**: mỗi file 160 ≤ 16 KB, mỗi file 256 ≤ 32 KB; **tổng ≤ 1,5 MB** (ước ~75 × 9 KB + 26 × 18 KB ≈ 1,1 MB). Ảnh
  vào app **một lần** (Flutter dùng chung bản trong `assets/scene/hinh/`, không chép đôi).
- **File lẻ, không sprite atlas**: HUD là DOM (không phải WebGL) → atlas không giảm lượt vẽ; tải từ localhost / asset rất nhanh;
  file lẻ dễ thay từng hình, Flutter `Image.asset` thẳng, cache theo hình. Bù lại: nạp sẵn đợt 1 (11 hình) trong màn tải để
  không "nháy" khi HUD hiện; các bảng nạp khi mở.
- **Trạng thái bằng CSS, không vẽ riêng**: mờ = `filter: grayscale(.6) opacity(.5)`; nhấn = thu 94 % (đang có); đang mở / bật =
  nền đĩa `jade` nhạt + hình nhô lên 2 px; khoá = mờ + ổ khoá chồng; chấm son = CSS đang có. Một ngoại lệ nếu thiết kế muốn:
  `ngoi-on` "Đang ôn" và `ve-nha` có thể có bản riêng — ghi rõ khi chốt.
- **Đặt tên**: `<mã>.webp`, chữ thường không dấu nối gạch, trùng mã id trong code (`ToolId`, `EmoteId`, `CropId`, id món
  trang trí, `IconKind`) để code map thẳng.
- **Nơi lưu (thiết kế)**: `design/icons/nguon/<mã>.webp` (gốc 512) · `design/icons/xuat/<mã>.webp` (+ `@256`) · bảng kê
  `design/icons/hinh.json` (`mã · nhóm · mô tả · cỡ xuất · câu lệnh AI · ngày`) · ảnh bảng tổng `design/screens/HinhMinhHoa-*.png`.
- **Chép sang web / app (phiên code)**: script `web/scripts/hinh.mjs` (chạy trong `npm run build` / `dev`, như font) đọc
  `design/icons/hinh.json` + `xuat/` → kiểm đủ file + ngân sách → chép vào `web/public/hinh/` (Vite giữ tên, không băm) →
  `copy-to-app.mjs` đưa sang `app/assets/scene/hinh/` → Flutter `Image.asset('assets/scene/hinh/<mã>.webp')`. Sinh kiểu
  `HinhId` (TS) + hằng Dart `app/lib/theme/app_hinh.g.dart` để code không gõ tên tay.

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Hình minh hoạ 3D mềm thay biểu tượng nét (Học Xá 3D) · V-20261115-72

MỤC ĐÍCH: người dùng thấy các biểu tượng nét (icon) ở thanh công cụ, nút hành động, nút nổi, bảng, màn Flutter "không chuyên
nghiệp". Thay bằng HÌNH MINH HOẠ 3D MỀM CUTE kiểu 摩尔庄园 (chỉ học cảm giác: vật tròn trịa, mập mạp, bóng mềm, màu tươi — không
chép hình 摩尔), hợp cảnh low-poly hoạt hình + nhân vật vinyl chibi đã có (design/models/anh/nhan-vat-*.png). Vẽ bằng AI tạo ảnh
(Gemini, như bộ ảnh NPC — câu lệnh ghi vào canvas.json), xuất ảnh nén đóng gói (app offline). Nhãn chữ vẫn là HTML, KHÔNG chữ
trong hình, KHÔNG chữ Hán (R-HUD-4: "Biển, tên nơi / khu, chữ trang trí trong game chỉ tiếng Việt; chữ Hán chỉ ở nội dung học").

PHONG CÁCH (một bộ, đồng nhất):
  - Vật 3D đất sét / đồ chơi vinyl, khối to tròn, hơi "phồng", mặt mờ mịn; KHÔNG viền nét, không cel-shading.
  - Góc nhìn 3/4 từ trên (nhìn xuống ~30°, xoay ~30° sang trái) cho mọi đồ vật; mặt / tay / người nhìn thẳng hơi nghiêng.
  - Ánh sáng trên-trái, bóng mềm, viền sáng nhẹ bên phải. Không bóng đổ trên sàn trong ảnh (bóng chung làm bằng CSS).
  - Vật chiếm ~80 % khung, đọc được khi thu còn 24 px (khối to, ít chi tiết vụn).
  - Màu bám token: jade #2B5446 (+ sắc sáng hơn cho khối lớn) · gold #D4A64A · lacquer #A8322A · map-paper #F2EADA ·
    shelf-wood #8A5A3A · scroll-wood #3A2418 · coin-rim #A9802F; slate #24323A chỉ cho chi tiết tối nhất. Tươi hơn token một
    chút được; cần sắc mới → thêm token "hinh-*" và ghi lý do. Hơi hướng làng cổ thời Tống, thân thiện trẻ em.
  - Đặt trên nền HUD kính sương (frost) lẫn trên cảnh 3D đều phải nổi: thử cả hai.

CÂU LỆNH MẪU (Gemini — mỗi hình một lượt, CÙNG một cuộc trò chuyện cho cả đợt để giữ phong cách; đính kèm 1–2 hình đã duyệt làm
mẫu từ hình thứ 2 trở đi; chỉnh được):
  Create a single game UI icon illustration of <VẬT>. Style: cute soft 3D clay / vinyl toy render, chunky rounded squashy
  shapes, smooth matte material, soft studio lighting from the upper left, gentle ambient occlusion, a faint light rim on the
  right edge, bright cheerful colours. NO outlines, NO line art, NO cel shading, NO text, NO letters, NO numbers, NO Chinese
  characters, NO logos. Camera: three-quarter view from slightly above (about 30 degrees down, turned 30 degrees to the left),
  object centred and filling about 80% of the square frame, fully visible with an even margin. Palette: jade green #2B5446 with
  lighter jade tints, warm gold #D4A64A, lacquer red #A8322A, cream paper #F2EADA, warm wood #8A5A3A; darkest details #24323A.
  Song-dynasty Chinese village flavour, child-friendly, matching the attached sample icon exactly in style and lighting.
  Background: plain flat pure white #FFFFFF, no gradient, no floor, no cast shadow, no frame, no circle or badge behind it.
  Square 1:1.
  (Hình biểu cảm có người: "a tiny chibi head of the attached character" — đính kèm design/models/anh/nhan-vat-truoc.png.)

DANH SÁCH HÌNH (mã = tên file <mã>.webp · vật gì · màu chủ đạo). Thứ tự ưu tiên = đợt.

ĐỢT 1 — thanh công cụ (5) + nút hành động / cột phải (6):
  ban-do      cuộn bản đồ giấy mở nửa, hai trục gỗ, vẽ núi xanh + đường chấm son · kem, ngọc, son
  ve-nha      căn nhà nhỏ mái ngói cong vểnh, tường kem, cửa gỗ, đèn lồng đỏ nhỏ · ngọc, kem, son
  bieu-cam    viên mặt cười tròn phồng như bánh bao, má hồng, mắt cong · vàng ấm, hồng
  tui-do      túi gấm buộc dây, nhô một cuộn giấy · ngọc, dây vàng
  nhiem-vu    thẻ tre / cuộn danh sách có dải lụa đỏ và dấu tích vàng (không chữ) · gỗ, son, vàng
  nhay        đôi giày vải bật lên trên đám mây xoáy nhỏ · ngọc, trắng
  chao        hai tay chắp lễ (bao quyền) trong tay áo rộng · ngọc, da
  ngoi-on     đệm ngồi tròn (bồ đoàn) có cuộn sách mở đặt trên · son, kem
  tro-chuyen  hai bong bóng thoại tròn chồng nhau, ba chấm · kem, ngọc
  trang-tri   chậu tùng nhỏ cạnh cây cọ lông · ngọc, gỗ, gốm kem
  doc-sach    quyển sách đóng chỉ bìa ngọc mở hé, dải đánh dấu đỏ · ngọc, kem, son

ĐỢT 2 — nút nổi bám vật + HUD trò chơi (13) + biểu cảm (8):
  noi-chuyen  một bong bóng thoại kem có ba chấm vàng · kem, vàng
  ngoi        ghế đôn gỗ tròn có đệm · gỗ, ngọc
  ra-san      cánh cửa gỗ mở hé, ánh nắng + lá xanh lọt vào (dùng cả cho "Rời bàn") · gỗ, vàng
  xem-bang    bảng gỗ có tờ giấy dán, ghim son · gỗ, kem, son
  vao-tiem    mái hiên tiệm nhỏ, rèm sọc, bao gạo trước cửa · ngọc, kem, gỗ
  cach-choi   hai quân cờ đen trắng trên góc bàn cờ nhỏ · gỗ, đen, trắng
  vao-hoc     bút lông dựa nghiên mực · gỗ, đen, son
  gieo        túi hạt nghiêng rơi vài hạt vàng · vải nâu, vàng
  tuoi        bình tưới gốm có giọt nước · ngọc, xanh nước
  thu         giỏ tre đầy rau củ · tre vàng, cam, xanh
  mo-o        cuốc gỗ cắm trên ụ đất có mầm non · gỗ, đất, xanh
  ban         thùng gỗ thu mua có đồng xu vàng trên nắp · gỗ, vàng
  van-moi     quân cờ đặt xuống bàn với vòng lấp lánh · vàng, đen
  vay-tay     bàn tay mập vẫy + vệt chuyển động vàng · da, vàng
  chap-tay    hai tay chắp trước ngực, tay áo ngọc · da, ngọc
  cui-chao    đầu chibi nhân vật đang cúi, vệt cong lễ · tóc đen, son
  vo-tay      hai bàn tay vỗ + tia vàng · da, vàng
  cuoi        mặt cười tươi há miệng (viên tròn vàng) · vàng, son
  nhay-mung   đầu chibi nhân vật nhảy lên, pháo giấy nhỏ · son, vàng
  suy-nghi    đầu chibi nhân vật nghiêng, bong bóng suy nghĩ ba chấm · kem, ngọc
  ngoi-nghi   đầu chibi nhân vật mắt nhắm trên đệm, "z" thay bằng mây nhỏ (không chữ) · ngọc, kem

ĐỢT 3 — đồ vật (25), Văn tiền (1), bản đồ vùng (10), đầu bảng / Flutter (7):
  cai cu-cai ngo lua bi cuc dua tra   8 nông sản (cải ngọt, củ cải, bắp ngô, bó lúa, quả bí, bông cúc, quả dưa, cành trà) —
                                      màu theo hình đang có cropArt.ts / crop_art.dart
  goi-hat     gói hạt giấy kem trơn buộc dây (code đặt hình nông sản nhỏ lên góc) · kem, gỗ
  o-dat-khoa  luống đất hoang có cọc gỗ, cỏ dại · đất, gỗ
  lap-lanh    ngôi sao lấp lánh 4 cánh (dấu "đã chín") · vàng
  giot-nuoc   giọt nước tròn (dấu "khát nước") · xanh nước
  truc-canh mai tung da-thai-ho ao-sen den-long ban-tra chau-lan lu-huong tranh-chu ke-sach an-doc binh-phong
              13 đồ trang trí theo hình đang có decorIcons.ts (tranh-chu: tranh thuỷ mặc KHÔNG chữ)
  van-tien    đồng xu tròn lỗ vuông, mặt trơn không chữ · vàng coin-rim
  vong-tran cong-canh son-mon ban-co ban-dau-chu tap-hoa tu-hoc cho-ngoi bang-nhiem-vu nha-cua-ta
              10 dấu bản đồ (vòng trận, cổng cảnh, cờ sơn môn, bàn cờ, bàn Đấu chữ — ô giấy viền ngọc, không chữ, tiệm Tạp hoá,
              chỗ tự học, chỗ ngồi, bảng nhiệm vụ, tiểu viện) — CHỜ CHỌN: hình 3D trên đĩa giấy hay giữ nét mực (vẽ cả hai)
  kho-nong-san  thùng gỗ đầy nông sản · gỗ, cam, xanh
  tui-hat     túi vải nhỏ đầy hạt · vải nâu, vàng
  goi-y       đèn lồng nhỏ / ngọn nến sáng (lời nhắc, thay "i") · vàng, son
  khoa        ổ khoá đồng tròn · đồng vàng
  on-tap      cuộn sách có mũi tên vòng ngọc (ôn bộ đến hạn) · kem, ngọc
  hoc-moi     bút lông trên tờ giấy mới · kem, đen
  da-hoc      chồng thẻ chữ xếp gọn có dải lụa (không chữ) · kem, ngọc
  Dùng lại: ban-do cho "chỗ học ở vùng" / gợi ý bản đồ; doc-sach cho "Mượn" sách, Cách chơi khi tự học; van-tien mọi chỗ có xu.

DẤU THAO TÁC NHỎ (đóng ×, tích, sai, mũi tên, chevron, gửi, xoay, di chuyển, bút, cộng, xoá, cấm, bỏ qua, tải lên — 11–22 px):
  ĐỀ XUẤT GIỮ NÉT SVG (đầu tròn, dày 2,4, slate / trắng) — cỡ nhỏ hình 3D nhoè; vẽ một artboard so sánh 6 dấu nét vs hình
  để người dùng chọn.

ARTBOARD CẦN VẼ ĐỂ DUYỆT:
  1. HinhMinhHoa-bang-tong: mọi hình đã vẽ, lưới theo nhóm, mỗi hình 2 cỡ (hiển thị thật 24–34 và 64), trên 2 nền: kính
     sương frost và ảnh chụp cảnh thật (Canvas 3D ?chup — Khởi Nguyên Trấn ban ngày + Nhà của ta). Ghi mã dưới mỗi hình.
  2. HinhMinhHoa-trang-thai: 5 nút thanh × thường / nhấn / mờ / đang mở / chấm son; Chào + Ngồi ôn bật; món khoá — trạng thái
     làm bằng CSS (mờ = grayscale .6 + opacity .5; đang mở = đĩa jade nhạt + hình nhô 2 px) — kiểm còn đọc được.
  3. HinhMinhHoa-HUD-doc 390×844 + HinhMinhHoa-HUD-ngang 844×390 (safe trên 47 / dưới 34; ngang hai bên 47 / dưới 21):
     HUD Khởi Nguyên Trấn đầy đủ (thanh công cụ, cụm hành động, Trò chuyện, một nút nổi "Nói chuyện", ví Văn tiền, bản đồ nhỏ)
     với hình mới, giữ nguyên bố cục + cỡ nút ThanhCongCu-* / HUD-hanh-dong-* (hình có thể nhô khỏi đĩa ~4 px).
  4. HinhMinhHoa-HUD-may-tinh 1280×800: như 3, bản máy tính (phím tắt Space / F / C cạnh nút).
  5. HinhMinhHoa-dot2-doc + -ngang: bảng Biểu cảm 8 ô + bong bóng trên đầu; dãy nút nổi (Ngồi, Xem bảng có chấm, Vào tiệm,
     Cách chơi, Gieo / Tưới / Thu / Mở ô / Bán).
  6. HinhMinhHoa-dot3-doc + -ngang: Túi đồ (nông sản, đồ trang trí), thẻ Tạp hoá (bản Flutter CuaHang-*), màn Ngồi ôn
     (Ôn bộ đến hạn / Học bộ mới / Xem bộ đã học), bản đồ nhỏ 2 phương án.
  7. HinhMinhHoa-dau-thao-tac: so sánh dấu nét vs hình (mục trên).

QUY CÁCH XUẤT (khi chốt):
  - Ảnh AI nền trắng → tách nền (rembg của bộ Hunyuan3D trên máy người dùng) → cắt sát, căn giữa, lề 8 % → gốc 512×512
    design/icons/nguon/<mã>.webp (không mất).
  - Xuất design/icons/xuat/<mã>.webp 160×160 WebP alpha q≈80 (mọi hình); nhóm đồ vật + o-dat-khoa thêm <mã>@256.webp.
  - Ngân sách: ≤ 16 KB / file 160, ≤ 32 KB / file 256, tổng ≤ 1,5 MB. Không sprite atlas (file lẻ).
  - Bảng kê design/icons/hinh.json: mỗi hình { "ma", "nhom", "dot", "mo_ta", "co": [160] hoặc [160,256], "cau_lenh", "ngay" }.
  - Câu lệnh Gemini đã dùng → ghi chú trong canvas.json (như "cau-lenh-gemini" của NPC).
  - Ảnh artboard → design/screens/HinhMinhHoa-*.png; components.md: mục "Hình minh hoạ" (cỡ hiển thị theo chỗ, trạng thái CSS).
  - Có thể chốt theo đợt (đợt 1 trước → phiên code áp luôn), mỗi đợt một mục CHANGELOG.

APP ĐANG CÓ GÌ:
  - Biểu tượng nét 24×24 currentColor dựng bằng createElementNS: web/src/ui/toolbarIcons.ts (5 nút thanh, 8 hình biểu cảm hai
    màu 48×48), decorIcons.ts (trang trí, khoá, Văn tiền, 13 hình đồ trang trí 64×64 vẽ code), cropArt.ts (Gieo/Tưới/Thu/Mở ô/
    Bán, 8 nông sản vẽ code, gói hạt, lấp lánh, giọt nước, ô đất khoá), wallet.ts (đồng xu), gameHud.ts, chatPanel.ts,
    guidePanel.ts; SVG viết thẳng trong web/index.html (Nhảy, Chào, Ngồi ôn, Nói chuyện, Xem bảng, Vào tiệm, Cách chơi, Ngồi,
    Ra sân, Đóng). Bản đồ vùng vẽ Path2D trên Canvas 2D (areaMapIcons.ts).
  - Flutter: Material Icons (Icons.close/check/arrow_forward/chevron…, Icons.sync/edit_outlined/grid_view ở màn Ngồi ôn, và
    Material Icons TẠM cho 13 đồ trang trí ở Tạp hoá — app/lib/lesson/shop_parts.dart:28), CustomPaint cho nông sản
    (crop_art.dart) và đồng xu (coin.dart).
  - Kiểm kê đầy đủ (file:dòng, cỡ, trạng thái từng chỗ): docs/phieu_thiet_ke/2026-11-15-hinh-minh-hoa.md mục "Kiểm kê".
```
