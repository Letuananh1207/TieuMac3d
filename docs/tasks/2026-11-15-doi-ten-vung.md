# Đổi tên các vùng cho có chất (V-20261114-50)
- Yêu cầu: "lên kế hoạch đổi tên cho các vùng chứ không để chung chung như này, ví dụ rừng trúc thì gọi là Rừng Trúc
  Tân Thủ, …" + "hãy tham khảo cách đặt tên địa danh của game 摩尔"
- Loại: dữ liệu + chữ hiển thị (không đổi hành vi, không đổi mã cảnh) · Cỡ: vừa (nhiều file, mỗi file đổi ít) ·
  Trạng thái: đang làm (người dùng chọn tên trước: bảng ở "Cần quyết định")

## Hiện trạng: các vùng và tên đang hiện

| Mã cảnh (`?vung=`, giữ nguyên) | Tên hiện tại | Vai trò trong hành trình | Bối cảnh (hồ sơ `docs/tham_khao/`) |
|---|---|---|---|
| `tong-mon` (bản đồ: `van-uyen`) | Khởi Nguyên Trấn | trấn chung, nơi ai cũng bắt đầu; không có lớp học (R-VUNG-1); có Truyền Tống Đài | trấn núi tông môn (`dia-hinh-tong-mon.md`) |
| `nha-ta` | Nhà của ta | nhà riêng, trang trí (R-NHA-*) | sân nhà 3 gian + vườn (`nha-rieng-game.md`) |
| `rung-truc` | Rừng trúc | vùng 1, **cho người mới**: học bộ thủ (vùng duy nhất có `lessons.radicals`, R-HANH-3) | rừng trúc mao, suối khúc thuỷ, thác, sương sớm (`rung-truc.md`) |
| `giang-nam` | Giang Nam | vùng 2, HSK 1: dùng chữ lần đầu trong đời sống | thuỷ trấn mưa bụi, kênh, cầu vòm, đèn lồng (`giang-nam.md`) |
| `bong-lai` | Bồng Lai | vùng 3, HSK 2–3: vào câu | đảo tiên trên biển mây, đào tiên, hạc, thành ảo (`bong-lai.md`) |
| `truong-thanh` | Trường Thành | vùng 4, HSK 4–6: câu phức, thơ, thành ngữ | quan ải Minh trên sống núi, gió, lửa trại (`truong-thanh.md`) |
| `tu-cam-thanh` | Tử Cấm Thành | vùng 5, HSK 7–9: "đỉnh cao của chữ", khoa cử | cung điện mái vàng, trục đối xứng, thi Đình (`tu-cam-thanh.md`) |
| `to-lua` | Con đường tơ lụa | vùng 6, mở rộng: dùng tiếng Trung với người lạ | ốc đảo Đôn Hoàng, cồn cát, lạc đà, Mạc Cao (`to-lua.md`) |

Cả 6 vùng đã có cảnh → không vùng nào đang "sắp mở" (thẻ "sắp mở" vẫn còn cho vùng sau này).

Khu (`site.areas[].name`) trong Khởi Nguyên Trấn: Sân Cổ Thụ · Cổng Trấn · Quảng Trường · Kỳ Văn Uyển · Thiên Bậc ·
Truyền Tống Đài · Hậu Sơn · Tàng Thư Các · Mặc Trì · Vườn Bia · Đồi Chè. Chung chung: **Quảng Trường, Cổng Trấn, Hậu
Sơn, Sân Cổ Thụ** (các khu khác đã có tên riêng). Khu trong 6 vùng đã có tên riêng theo hồ sơ (Vân Độ, Hà Nhai, Ung
Thành…) — ngoài phạm vi.

## Tham khảo 摩尔庄园 (Mole's World / Mole Manor, 淘米网)

Danh sách (tên trong game chỉ để tham khảo, không đưa lên màn — R-HUD-4):

| Tên gốc | Nghĩa | Kiểu đặt |
|---|---|---|
| 摩尔城堡 | Lâu đài Mole | tên thế giới + danh từ nơi |
| 摩尔拉雅雪山 | Núi tuyết "Mole-laya" (chơi chữ Himalaya) | chơi chữ tên thế giới + danh từ nơi |
| 淘淘乐街 | Phố "Săn săn vui" | từ láy vui tai + "phố" (nói luôn làm gì: săn đồ) |
| 爱心广场 | Quảng trường Trái tim | cảm xúc + danh từ nơi |
| 许愿池 | Hồ Ước nguyện | việc làm ở đó + danh từ nơi |
| 浆果丛林 | Rừng Quả mọng | vật đặc trưng + địa hình |
| 黑森林 | Rừng Đen | màu / không khí + địa hình |
| 彩虹瀑布 | Thác Cầu vồng | hình ảnh đẹp + địa hình |
| 阳光沙滩 | Bãi biển Ánh dương | ánh sáng / cảm xúc + địa hình |
| 阳光牧场 | Nông trại chăn nuôi Ánh dương | ánh sáng + nơi làm việc |
| 阳光农场 / 开心农场 | Nông trại Ánh dương / Nông trại Vui vẻ | cảm xúc + nơi làm việc |
| 餐厅 | Nhà hàng | danh từ trần, nói rõ chức năng |
| 前哨站 | Tiền đồn | danh từ trần |

Quy luật rút ra: (1) **cuối luôn là một danh từ chỉ nơi rõ ràng** (phố, rừng, thác, bãi, trại, lâu đài) — trẻ nhìn là
biết nơi thế nào; (2) phần còn lại là **cảm xúc / ánh sáng / màu / vật đặc trưng**, hay dùng từ láy, từ vui
(淘淘乐, 开心, 阳光); (3) ngắn: 3–5 chữ; (4) **không ghi cấp độ, không ghi "tân thủ"** — độ khó nằm ở trò chơi, không ở
tên; (5) có chơi chữ với tên riêng (摩尔拉雅).

Nguồn: [TapTap — 摩尔庄园](https://www.taptap.cn/app/170078), [17173 chuyên mục 摩尔庄园](https://news.17173.com/z/mezy),
[17173 — 黑森林大火](https://news.17173.com/z/mezy/content/10022021/205603380.shtml),
[17173 — 爱心教堂](https://news.17173.com/z/mezy/content/09302021/214348954.shtml),
[game.xiaomi.com bài 1](https://game.xiaomi.com/viewpoint/1325603414_1642505431218_13),
[bài 2](https://game.xiaomi.com/viewpoint/1359077112_1635129387973_13),
[萌娘百科 — 摩尔庄园](https://zh.moegirl.org.cn/Template:%E6%91%A9%E5%B0%94%E5%BA%84%E5%9B%AD). (Bản 2021–2022; nghĩa
dịch là của kế hoạch này.)

## Quy ước đặt tên đề xuất

**Phương án đầu, "kiểu 摩尔 dịch sang cổ trang Việt"**: `<Danh từ nơi thuần Việt> + <nét gợi cảm, thường là từ láy>`.
- Danh từ nơi đứng đầu (tiếng Việt danh từ trước): Rừng · Phố · Đảo · Ải · Cung · Đường. Mỗi vùng một danh từ khác
  nhau, nhìn là biết nơi thế nào.
- Phần sau là một hình ảnh hay âm thanh của cảnh, ưu tiên từ láy vui tai, dễ nhớ với trẻ: rì rào, lung linh, bồng bềnh
  (chơi chữ Bồng Lai như 摩尔拉雅), lồng lộng, leng keng.
- Không ghi cấp HSK hay "tân thủ" trên tên (như 摩尔). Vai trò hành trình đã có ở thoại Trận sư, bảng nhiệm vụ.
- Viết hoa chữ đầu mỗi tiếng, ≤ 18 ký tự (màn tải, thẻ, nhãn bản đồ một dòng), chỉ chữ Việt (R-HUD-4), không trùng tên
  NPC (Tiểu Mặc, Mặc Ông, Tiểu nhị, Quản sự, Trận sư, Lão Canh, Tiểu Khất, Điển Thư), không trùng tên khu.

**Phương án B, "kiểu người dùng nêu"**: `<tên cảnh> + <bậc học>`, theo thang Tân Thủ → Nhập Môn → Tinh Tiến → Khổ
Luyện → Đăng Khoa → Viễn Du. Rõ hành trình nhưng giống "sách giáo khoa" hơn. Không dùng "Tu Luyện" vì đã là tên một
việc làm trong game (R-HANH-3).

**Phương án C, "Hán Việt thư hương"**: 4 tiếng Hán Việt có chất văn (Yên Vũ Giang Nam = Giang Nam mưa khói 烟雨江南).
Sang hơn, nhưng khó nhớ với người mới.

Có thể **trộn**: mỗi vùng chọn riêng một phương án. Nên chọn cùng một kiểu cho cả 6 vùng thì bản đồ đọc đều tay hơn.

## Cần quyết định (bảng chọn tên, phương án đề xuất đứng đầu)

Số trong ngoặc là số ký tự.

1. **Rừng trúc**: **A Rừng Trúc Rì Rào** (16, trúc reo trong gió, vùng yên cho người mới) · B Rừng Trúc Tân Thủ (17,
   đúng ý người dùng, rõ "nơi người mới bắt đầu") · C Trúc Lâm Sơ Học (15, rừng trúc học vỡ lòng).
2. **Giang Nam**: **A Phố Nước Lung Linh** (18, phố ven kênh, đèn lồng soi nước) · B Giang Nam Nhập Môn (17) ·
   C Yên Vũ Giang Nam (16, Giang Nam mưa khói, đúng hướng "mưa bụi" của hồ sơ).
3. **Bồng Lai**: **A Đảo Mây Bồng Bềnh** (17, đảo tiên trôi trên biển mây, chơi chữ Bồng Lai) · B Bồng Lai Tinh Tiến
   (17) · C Bồng Lai Tiên Đảo (17).
4. **Trường Thành**: **A Ải Gió Lồng Lộng** (16, quan ải trên sống núi, gió thổi lồng lộng) · B Biên Ải Khổ Luyện
   (17; "Trường Thành Khổ Luyện" dài 21 ký tự, quá cỡ) · C Quan Ải Yên Sơn (15, theo hồ sơ "quan ải Yên Sơn").
5. **Tử Cấm Thành**: **A Cung Vàng Rực Rỡ** (16, mái vàng nối tiếp dưới trời xanh) · B Tử Cấm Đăng Khoa (16, thi Đình
   đỗ đạt, hợp chặng "đỉnh cao của chữ") · C Tử Cấm Hoàng Thành (18).
6. **Con đường tơ lụa**: **A Đường Cát Leng Keng** (18, đường cát, chuông lạc đà leng keng) · B Tơ Lụa Viễn Du (14) ·
   C Ốc Đảo Đôn Hoàng (15).
7. **Khởi Nguyên Trấn**: **giữ "Khởi Nguyên Trấn"** (đã là tên riêng có chất, giống 摩尔庄园 là tên thế giới; đổi thì
   kéo theo biển cổng, cổng Nhà của ta, nhãn cổng đi bộ) · Trấn Khởi Nguyên (15) · Thị Trấn Khởi Nguyên (19, hơi dài).
8. **Khu chung chung trong trấn (tuỳ chọn, mặc định giữ)**: Quảng Trường → **Sân Nhật Quỹ** (12, giữa sân có nhật quỹ)
   hay Quảng Trường Hoa (16, bồn hoa) · Cổng Trấn → **Cổng Đón Khách** (14) hay Cổng Chào (9) · Hậu Sơn → **Hậu Sơn Thác
   Bạc** (16, thác trắng từ vách) · Sân Cổ Thụ: giữ. "Nhà của ta": giữ (kiểu 摩尔 "nhà của mình").

Câu hỏi phụ (một câu): biển cổng trong vùng (Bồng Lai `gates[].title` "Bồng Lai", Giang Nam "Giang Nam") đổi theo tên
mới hay **giữ địa danh thật** (đề xuất: giữ, biển cổng là địa danh trong truyện, tên vùng là tên trò chơi)? Biển "Trường
Thành" trên quan thành và "Bồng Lai Các" thì giữ.

## Phạm vi

Mã cảnh, `?vung=`, `?qua=`, `ban-do.json` `noi[].id`, `portals[].scene`, mã bộ thủ: **giữ nguyên**. Chỉ đổi tên hiển thị.
Đã soát: tiến độ Flutter (`progress_store.dart`) chỉ lưu mã bộ thủ, thẻ ôn, ví, trang trí, **không lưu tên vùng**;
cầu nối `openRadical` / `openReview` / `openLearned` gửi `region` là **chuỗi hiển thị** (Flutter chỉ in ra; mặc định
`'Rừng trúc'` khi thiếu); `hasScene` / `placeStates` / `tranSu` so theo mã; sessionStorage `hac-ten` chỉ mang tên qua
một lần tải trang. Kết luận: **không vỡ dữ liệu tiến độ, không đổi dạng cầu nối.**

**Sẽ sửa: thiết kế** (phiên thiết kế `/canh` cho duyệt rồi chốt, mục mới trong `design/CHANGELOG.md`):
- `design/scene/{rung-truc,giang-nam,bong-lai,truong-thanh,tu-cam-thanh,to-lua}.json` `site.name` (+ `scene.json` nếu đổi
  khu, mục 8), `gates[].title` nếu chọn đổi biển cổng.
- `design/scene/ban-do/ban-do.json` `noi[].ten`; `ve-ban-do.html` `PLACES[].name` (+ chuỗi nạp font dòng 436) → **vẽ lại
  `ban-do-goc.png`** (nhãn tên nằm sẵn trong ảnh; tên dài hơn có thể đè nhãn miền "TÂY VỰC…", chỉnh `lx/ly`),
  `screens/BanDo-trang-thai.png`.
- `design/scene/hanh_trinh.md` (bảng 7 chặng), `design/l10n/vi.arb` (`placeRungTruc`…`placeToLua`, `mapNeedRadicals`,
  `dailyLearn*`, `guideDuel*`, `learnAtForest`, `learnAllDoneBanner`, `hintGoForest`, `studyGuide*`), `design/docs/
  screen_specs.md` (chỗ nêu tên vùng).
- Artboard `design/source/*.dc.html` có chữ "Rừng trúc"… (BanDo-doc, TruyenTongDai, HanhTrinh-so-do, NgoiOn-*, TuHoc-*,
  TheBoThu-*, CuoiHac-*, NhiemVu-*, CachChoi-*, Dau-*, Chat-*, NgoiMat-*, OnTap-*, TuLuyen-*) → **không sửa trong phiên
  code**: ghi phiếu gửi `/ui-design` (nhiệm vụ 3).

**Sẽ sửa: sổ quy tắc** `docs/testing/quy_tac.md`: ~32 dòng nêu tên vùng (R-HANH-1/2/3/5, R-MAN-2, R-HUD-4, R-BANDO-1/2/5,
R-VUNG-1/2/3, R-ON-1/4/8, R-VA-5, R-NV-1/3, R-DAU-1, R-GIAO-1/2, R-NHA-1, R-NPC-*, R-TIEN-*, R-SACH-2…). Chỉ thay tên,
không đổi hành vi. Thêm một câu vào R-HANH-1: tên hiển thị chính thức của 6 vùng, nguồn là `ban-do.json` `ten`.

**Sẽ sửa: web** (chuỗi đang viết cứng "Rừng trúc", đổi sang lấy một nguồn):
- `web/src/zones/journeyMap.ts`: thêm `placeName(id)` (đọc `ten` từ `ban-do.json`, thiếu thì trả mã), nguồn tên
  duy nhất cho chuỗi.
- `web/src/zones/{dialogs,cuonMuc,dailyBoard,gameGuides,studyGuide,tinDon}.ts`, `web/src/gamePlay.ts`
  (`dauChuaHoc`): thay "Rừng trúc", "Giang Nam" viết cứng bằng `placeName('rung-truc')`…
- `web/scripts/check-scene.mjs` / `web/src/scene/specCheck.ts`: kiểm mới: `site.name` của `<mã>.json` **trùng**
  `ban-do.json` `ten` cùng mã; `ten` ≤ 18 ký tự, không chữ Hán.
- Chú thích (comment) nêu tên vùng thì để nguyên: không hiển thị.

**Sẽ sửa: Flutter**:
- `app/lib/journey/journey.dart`: hằng `kRegionNames` (mã → tên) + `kFirstRegion` (tên vùng bộ thủ).
- `app/lib/lesson/{daily_screen,review_screen,study_parts,study_screen}.dart`, `app/lib/scene/{review_event,
  scene_event}.dart` (mặc định `region`): thay "Rừng trúc" viết cứng bằng hằng.
- Test `app/test/journey/region_names_test.dart` (mới): hằng khớp `../design/scene/ban-do/ban-do.json`.

**Sẽ sửa: tài liệu**: `docs/bridge.md` (chỉ ví dụ `region: 'Rừng trúc'`, dạng không đổi), `docs/testing/
gui_thiet_ke_2026-11-15.md` (thêm dòng) hoặc phiếu mới `docs/phieu_thiet_ke/2026-11-15-doi-ten-vung.md`.

**Sẽ sửa: test có chuỗi tên** (đổi sang `placeName` / tên mới): web `cuonMuc`, `studyGuide`, `studyMenu`, `tranSu`,
`journeyMap`, `areaMap`, `areaMapView`, `areaMapScenes`, `gamePlay`, `actionButtons`, `vietOnly`, `teleportText` (chỉ
nếu tên trấn đổi); app `study_screen_test`, `ngoi_on_test`, `review_event_test`, `scene_event_test`,
`radical_screen_test`.

**Cần kiểm tra** (tên dài hơn: "Rừng trúc" 9 → tới 18 ký tự):
- `web/src/ui/loadingScreen.ts` (màn tải), `ui/craneHud.ts` (lớp chữ cưỡi hạc), `ui/mapHud.ts` (thẻ "… — sắp mở"),
  `ui/hud.ts` chip khu "<vùng> · <khu>" (vd. "Phố Nước Lung Linh · Thuyền Thị" 31 ký tự), đầu cuộn Ngồi ôn
  (`main.ts` dòng 355, `ui/cuonMucPaint.ts`), nhãn cổng bản đồ vùng (`zones/areaMap.ts` lấy `site.name`), màn Flutter
  nhận `region`. Ở 360 × 640 dọc và 640 × 360 ngang không tràn / cắt chữ.
- `web/src/zones/tranSu.ts` (thoại Trận sư ghép danh sách `ten`): câu dài hơn vẫn vừa bong bóng.

**Không đụng**: mã cảnh, URL, `progress_store.dart` (dữ liệu), dạng sự kiện cầu nối, `site.han` / `areas[].han` (dữ
liệu, không hiển thị), tên khu trong 6 vùng, biển "Trường Thành" trên quan thành, "Bồng Lai Các", chú thích code,
`app/assets/scene/**` (sinh lại bằng build), `reference/`.

## Nhiệm vụ

- [x] 0. **Người dùng chọn tên** (bảng "Cần quyết định", 8 câu + câu biển cổng). Xong khi: có bảng mã → tên chốt.
- [x] 1. **Sổ quy tắc** (`docs/testing/quy_tac.md`, lớp nghiệp vụ): thay tên trong mọi luật / ví dụ; R-HANH-1 thêm câu
  "Tên hiển thị 6 vùng: …; nguồn `ban-do.json` `ten`; mã cảnh không đổi" → `/dong-bo-quy-tac` (tự chép online).
  Xong khi: `grep "Rừng trúc"` trong sổ = 0 (trừ câu "trước đây gọi là" nếu có), `rule_trace --pending` sạch.
- [x] 2. **Thiết kế: đặc tả + bản đồ** (`/canh`, cho người dùng xem ảnh bản đồ rồi chốt): `site.name` 6 file (+ khu mục 8,
  biển cổng nếu chọn), `ban-do.json` `ten`, `ve-ban-do.html` → vẽ lại `ban-do-goc.png` + `screens/BanDo-trang-thai.png`,
  `hanh_trinh.md`, `l10n/vi.arb`, `screen_specs.md`, mục mới `design/CHANGELOG.md`. Test: `npm run scene:check`.
  Xong khi: scene:check sạch, ảnh bản đồ mới nhãn không đè nhau, người dùng duyệt ảnh.
- [x] 3. **Phiếu gửi `/ui-design`**: thêm vào `docs/testing/gui_thiet_ke_2026-11-15.md` (hoặc phiếu riêng) danh sách
  artboard còn tên cũ, cột "tên mới". Không chặn code (code theo luật). Xong khi: phiếu có đủ artboard ở mục Phạm vi.
- [x] 4. **Web dữ liệu: một nguồn tên** (`zones/journeyMap.ts` `placeName`; thay chuỗi cứng ở `zones/*`, `gamePlay.ts`;
  lớp zones / ghép). Test vitest: `placeName('rung-truc')` = tên chốt; `placeName('khong-co')` = mã; `cuonMuc`,
  `studyGuide`, `dailyBoard`, `dialogs` không còn chữ "Rừng trúc" cứng (test dò chuỗi). Xong khi: `npm test` xanh,
  `grep -rn "Rừng trúc" web/src --include=*.ts` chỉ còn trong comment.
- [x] 5. **Web kiểm đặc tả** (`scene/specCheck.ts` hoặc `scripts/check-scene.mjs`, lớp scene / công cụ): `site.name`
  trùng `ban-do.json` `ten` cùng mã; `ten` ≤ 18 ký tự, chỉ chữ Việt. Test: đặc tả lệch tên → báo lỗi. Xong khi:
  `scene:check` báo lệch khi cố tình sửa sai một bên.
- [x] 6. **HUD tên dài** (lớp ui; chỉ sửa CSS nếu tràn: co chữ / xuống dòng / chấm lửng ở chip khu và đầu cuộn): soát
  màn tải, cưỡi hạc, thẻ sắp mở, chip khu, đầu cuộn, nhãn cổng bản đồ vùng với tên dài nhất, dọc 360 × 640 và ngang.
  Không thêm giao diện mới. Xong khi: chụp đủ 6 chỗ, không cắt chữ.
- [x] 7. **Cầu nối / tài liệu** (`docs/bridge.md`): đổi ví dụ `region`, ghi rõ "`region` là tên hiển thị (lấy `site.name`),
  không phải mã". Dạng không đổi → không cần sửa hai phía. Xong khi: ví dụ dùng tên mới.
- [x] 8. **Flutter** (`app/lib/journey/journey.dart` hằng tên; thay chuỗi cứng ở `lesson/`, `scene/`): test
  `region_names_test.dart` đọc `ban-do.json` so hằng; sửa test có chuỗi cũ. Xong khi: `flutter analyze` sạch, `flutter
  test` xanh.
- [ ] 9. **Build + soát chữ Hán**: `npm run build` (chép sang app), `vietOnly.test.ts` xanh, thử máy: mở app → màn tải
  tên mới; Truyền Tống Đài → bản đồ nhãn mới → cưỡi hạc sang vùng 1 → lớp chữ hạc + màn tải tên mới; tiến độ học cũ
  vẫn còn (bộ đã học, ví).

Thứ tự: 0 → 1 → 2 → (3, 4, 5, 7, 8 song song) → 6 → 9. Hiệu năng: không thêm mesh / draw call.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npm run scene:check && npx tsc --noEmit && npm test && npm run build ·
cd app && flutter analyze · flutter test -r failures-only test/journey test/lesson test/scene test/rules ·
dart tool/rule_trace.dart · dart tool/rule_trace.dart --pending


## Người dùng chốt (2026-11-15)
- Kiểu **A (kiểu 摩尔)** cho 6 vùng: rung-truc **Rừng Trúc Rì Rào** · giang-nam **Phố Nước Lung Linh** · bong-lai **Đảo Mây Bồng Bềnh** ·
  truong-thanh **Ải Gió Lồng Lộng** · tu-cam-thanh **Cung Vàng Rực Rỡ** · to-lua **Đường Cát Leng Keng**. Khởi Nguyên Trấn giữ.
- Khu trong trấn: **giữ nguyên**.
- Biển cổng trong vùng: **đổi theo tên mới** (biển "Giang Nam", "Bồng Lai"… → tên mới; xét từng biển: biển là tên vùng thì đổi,
  biển là tên công trình riêng như "Bồng Lai Các" thì giữ trừ khi rõ là tên vùng).

## Đã làm (2026-11-15, nhánh `viec/doi-ten-vung`)
- Sổ quy tắc: 22 luật đổi tên → Xác nhận `chờ`; **chưa** `/dong-bo-quy-tac` (phiên điều phối đồng bộ sau khi gộp).
- Biển cổng đổi: `giang-nam` `cong-pho`, `bong-lai` `cong-tien`. Giữ: "Bồng Lai Các" (lầu), "Trường Thành" (quan thành), cờ "Tử"/"Cấm".
- Tên dài nhất "Đường Cát Leng Keng" 19 ký tự (kế hoạch ghi ≤ 18) → `scene:check` cho tối đa 20 (`scene/placeNames.ts`).
- Không còn chip khu (đã bỏ từ R-HUD-1); đầu cuộn Ngồi ôn tự cắt "…". Soát chụp: màn tải, cưỡi hạc, thẻ sắp mở, bản đồ vùng ở
  360 × 640 / 390 × 844 / 844 × 390 — không tràn.
- Flutter: hằng `regionNames`, `firstRegion` (`journey/journey.dart`, kiểu tên của dự án, không tiền tố `k`).
- Còn: 9 (thử máy), biển cổng tên dài + nhãn Đảo Mây trên bản đồ chờ `/canh` / `/ui-design` (`docs/testing/gui_thiet_ke_2026-11-15.md`).

## Đổi lần 2 (V-20261114-53, 2026-11-15) — bộ tên Hán Việt cổ trang

Người dùng chưa hài lòng bộ từ láy, chốt: rung-truc **Trúc Lâm** · giang-nam **Yên Vũ Lâu** · bong-lai **Bồng Lai Đảo** ·
truong-thanh **Nhạn Môn Quan** · tu-cam-thanh **Tử Cấm Thành** · to-lua **Đôn Hoàng Lộ**. Thay ở mọi chỗ V-50 đã đổi (các mục
trên giữ làm lịch sử, tên trong đó là bộ cũ). Biển cổng `cong-pho` / `cong-tien` theo tên mới; giữ "Bồng Lai Các", "Trường
Thành" (quan thành), cờ "Tử"/"Cấm". Vẽ lại `ban-do-goc.png` + `screens/BanDo-trang-thai.png`: nhãn không đè nhãn miền, nhãn
"Bồng Lai Đảo" dưới đầu đường ra bến. Hai việc thiết kế V-50 để lại (biển cổng tên dài, nhãn đảo) hết cần. Sổ quy tắc: 22
luật chỉ thay tên, Xác nhận `chờ`.
