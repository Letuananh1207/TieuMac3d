# Đặc tả màn

Mỗi màn đã vẽ trên canvas một mục `## <Màn>` — `/ui-apply` chỉ đọc đúng mục của màn đang áp. Màn chưa có ở đây
thì vẫn theo code (`/ui-apply kiem` bỏ qua).

Mẫu một mục:

```markdown
## <Màn> · artboard `<Tên>.dc.html` · từ mục <mã CHANGELOG>

- Mục đích: …
- Mở khi / đóng khi: … (luật `R-…`)
- Bố cục dọc 390×844: … · ngang 844×390: …
- Trạng thái đã vẽ: bình thường · …
- Số đo: lề, khoảng cách, cỡ chữ (theo token)
- Chuỗi: khoá → chữ
- Ảnh: `screens/<Màn>-doc.png`, `screens/<Màn>-ngang.png`
```

## HUD (lớp nổi trên cảnh 3D) · artboard `HUD-doc.dc.html`, `HUD-ngang.dc.html` · từ mục 2026-11-11.3

- Mục đích: chữ và nút nổi trên cảnh khi chơi. **Một chất liệu cho cả bộ — hướng C "ngọc bích · lụa"**: kính mờ
  trắng sương (`frost*`) + blur, viền trong 1 px `frost-line`, viền ngoài 1 px `frost-outline`; chữ `slate`, nhấn
  `jade`; hoạ tiết duy nhất là chấm vàng `gold` (5–6 px). Thay toàn bộ HUD cũ (chip kính tối, thẻ gỗ, nhãn vàng).
- Artboard: `HUD-doc` (Ngoại Môn, lần đầu có hướng dẫn) · `HUD-doc-vao-khu` (thẻ tên khu, joystick đang
  giữ) · `HUD-doc-the-dai` (tên khu dài nhất, "cả sân") · `HUD-ngang` (tai thỏ trái) ·
  `HUD-ngang-vao-khu` (tai thỏ phải) · `HUD-thanh-phan` (mọi thành phần trên nền trời sáng `#A9C8E8` và tường vôi
  `#EEE9DF`). `HUD-A/B/C-*` chỉ là bản phác 3 hướng — không áp.
- Bố cục dọc 390×844 (safe trên 47, dưới 34):
  - Chip tên khu: trái 16, trên safe + 12; cao 36, pill, padding 0 14 0 12, chấm vàng 6 px + chữ 13/700 `slate`,
    phần " · <khu>" màu `jade`; không xuống dòng (tên dài nhất "Văn Uyên Tông · Linh Dược Viên" vẫn một dòng).
  - Nút góc nhìn: phải 16, trên safe + 8; cao 44, pill, padding 0 16, chữ 13/700.
  - ~~Thẻ mời~~ — **đã bỏ** (2026-11-11.4): học bằng nút nổi trên vật trong nhà, xem mục "Trong nhà".
  - Nhãn tên trên đầu nhân vật (từ 2026-11-14.3): **chữ trơn** kiểu game nhập vai — không nền, không khung, không chấm;
    chữ 13/700 ngà #F4F1EA, giãn .02em, viền mực `slate` .6 px + bóng 0 1 2 `slate` .85 và quầng 6 px .45. Ẩn khi
    chữ nhập định hiện, khi bản đồ truyền tống / màn tải / bài học phủ cảnh (L-11).
  - Dòng hướng dẫn lần đầu: trái/phải 24, dưới 186 (trên vùng joystick); padding 10 14, radius 12, `frost` .84,
    chữ 13 line-height 1.5 giữa.
  - Joystick gợi ý (chưa chạm): tròn 110, trái 36, dưới safe + 28; nền `frost-weak`, núm 40 `jade` 85 %, chữ
    "kéo để đi" 12/700. Đang giữ: vòng 120 hiện **ở chỗ ngón chạm** (tâm vòng = điểm chạm), nền .38, chấm tâm 6 px,
    núm 48 `jade` đặc + viền trắng, lệch theo hướng kéo (tối đa tới mép vòng).
  - fps: chỉ chế độ gỡ lỗi; góc dưới phải (phải 16, dưới safe + 12), mono 11, nền `frost` .8, radius 6.
- Bố cục ngang 844×390 (safe trái = phải 47, dưới 21; tai thỏ có thể ở bên nào cũng được → lề hai bên bằng nhau):
  - Chip: trái safe + 12, trên 12. Nút góc nhìn: phải safe + 12, trên 8.
  - Dòng hướng dẫn: giữa dưới, rộng 420, dưới safe + 12, padding 8 14.
  - Joystick gợi ý: tròn 100 (núm 36), trái safe + 28, dưới safe + 12.
- Trạng thái đã vẽ: trong khu · ngoài mọi khu (chip chỉ "Văn Uyên Tông") · tên khu dài nhất · trong nhà (mục "Trong
  nhà") · góc nhìn gần / cả sân · joystick gợi ý / đang giữ · lần đầu (có dòng hướng dẫn) · gỡ lỗi (fps).
- Tương phản: `slate` trên `frost` ≥ 9 : 1 cả trên trời sáng lẫn tường vôi (frost .82 đủ đặc, **không phụ thuộc blur**
  — WebView không hỗ trợ `backdrop-filter` thì bỏ blur, giữ nền). Trắng trên `jade` 8,4 : 1. Nút chạm ≥ 44.
- Chuỗi: có sẵn trong code (`index.html`, `zones.ts`); thêm vào `l10n/vi.arb`: `camNear`, `camYard`, `joyHint`.
- Luật: `R-DIEU-1` (joystick 45 % trái, hiện ở chỗ chạm), `R-HUD-1` (chip), `R-MAN-1` (safe area).
- Ảnh: chưa có ảnh — dùng `source/HUD-*.dc.html`.

## Thẻ tên khu (mới) · artboard `HUD-doc-vao-khu.dc.html`, `HUD-ngang-vao-khu.dc.html` · từ mục 2026-11-11.3

- Mục đích: "nghi thức" chuyển cảnh — bước vào khu mới thì hiện tên khu lớn bằng chữ Hán + tiếng Việt.
- Mở khi: nhân vật bước qua ranh giới **vào** một khu khác khu trước đó (cùng lúc chip đổi chữ, `R-HUD-1`). Mờ vào
  0,25 s, giữ ~2 s, mờ ra 0,4 s. Ra khỏi mọi khu: không hiện. Đang hiện mà vào khu khác: thay chữ, đếm lại 2 s.
  Không chặn chạm (pointer-events: none). Không hiện khi bước vào / ra một nhà (chip đổi, thẻ không hiện).
  → **đề xuất luật mới `R-HUD-3`** (CHANGELOG 2026-11-11.4; mã `R-HUD-2` đã dùng cho mái mờ).
- Bố cục dọc: giữa ngang, trên 168 (giữa chip và nhân vật); rộng 240, padding 16 20 14, `radius.card`, `frost-strong`
  .80, blur 14, `shadow.card` (.2). Chữ Hán Noto Serif SC 700 52 (`area-han`), giãn .14em, `jade`; dưới là vạch
  160 px: hai đường 1 px rgba(36,50,58,.3) + chấm vàng 5 px giữa; tên Việt Lora 700 20 `slate`.
- Bố cục ngang: giữa ngang, trên 22; rộng 210; chữ Hán 40, vạch 140, tên 18.
- Chuỗi: `areaHan*` + `area*` trong `l10n/vi.arb` (cần trường trong đặc tả cảnh — "Cần code").
- Ảnh: chưa có ảnh.

## Màn tải (mới) · artboard `ManTai-doc.dc.html`, `ManTai-ngang.dc.html` · từ mục 2026-11-11.3

- Mục đích: che lúc mở app, trước khi cảnh 3D hiện (dựng cảnh vài giây).
- Mở khi: app khởi động. Đóng khi: cảnh vẽ khung hình đầu tiên → mờ ra 0,4 s. Không có nút. → **đề xuất `R-MAN-2`**.
- Bố cục dọc: nền `mist`; đáy là 3 lớp núi phẳng (`mist-far`, `mist-near`, mây `#F4F7F6`) cao 300 — SVG, không ảnh.
  Khối giữa, trên 270: 文淵宗 Noto Serif SC 700 56 giãn .16em `jade` · vạch 180 (hai đường + chấm vàng) · "Văn Uyên
  Tông" Lora 700 24 `slate` · cách 48 · thanh tiến trình rộng 200 cao 2 (nền rgba(36,50,58,.15), phần đã tải
  `jade`, đầu là chấm vàng 8 px có quầng .25) · dòng 13/500 "Đang mở sơn môn… 62%".
- Bố cục ngang: núi cao 170; khối giữa trên 70; chữ Hán 48, tên 22, cách thanh 22.
- Tiến trình: theo tiến độ dựng cảnh thật nếu có; không có thì chạy giả tới 90 % rồi chờ khung hình đầu.
- Chuỗi: `siteHan`, `siteName`, `loadingStatus`.
- Ảnh: chưa có ảnh.

## Màn bài học (Flutter native) · artboard `BaiHoc-doc.dc.html`, `BaiHoc-ngang.dc.html`, `BaiHoc-doc-chu-dai.dc.html` · từ mục 2026-11-11.10

- Mục đích: học một chữ Hán; màn Flutter che toàn bộ cảnh 3D (cảnh ngừng vẽ).
- Mở khi: trang gửi `openLesson` (bấm nút học nổi / chạm vật học — `R-VUNG-2`, `R-VUNG-3`; cầu nối `docs/bridge.md`).
  Đóng khi: "Ra sân" hoặc nút quay lại của máy → trang nhận `resume`, nhân vật đi lại được, nút học vẫn hiện nếu còn
  trong vùng (`R-VUNG-3`). Mở / đóng: mờ dần ~0,2 s.
- Chất liệu C: nền `mist` + hai lớp núi phẳng ở đáy (`mist-far`, `mist-near`; dọc viewBox 390 × 300 theo bề ngang,
  ngang cao 160) — như màn tải.
- Bố cục dọc 390×844: lề trên 12 + vùng an toàn, hai bên 16, dưới 16 + vùng an toàn; cột: dòng nhỏ "BÀI HỌC CHỮ HÁN"
  (11/700 giãn .12em `slate`, giữa) · 16 · **thẻ lụa** giãn hết chỗ còn lại · 16 · nút "Ra sân" cao 52 rộng hết.
- Bố cục ngang 844×390: lề hai bên 12 + vùng an toàn, trên 12, dưới 12 + vùng an toàn; hàng: thẻ lụa giãn · 16 · cột
  150 (dòng nhỏ ở trên, cách đỉnh 10; nút "Ra sân" ở đáy).
- Thẻ lụa: nền `frost-strong`, viền 1 `frost-outline`, bo `radius.card` 16, bóng `shadow.card`; đệm 24 × 22 (ngang
  16 × 24); nội dung căn giữa theo chiều cao, cuộn trong thẻ nếu màn thấp.
  - Dọc: chữ Hán 140/700 Noto Serif SC `jade` (cao dòng 1) · 8 · pinyin Lora 700 22 `lacquer` · 8 · nghĩa 18/700
    `slate` (giữa) · 22 · vạch (hai đường rgba(36,50,58,.2) + chấm vàng 5 px) · 22 · bảng dòng phụ.
  - Ngang: cột 170 (chữ Hán 140 + pinyin, cách 6) · 24 · vạch dọc có chấm vàng · 24 · cột phải: nghĩa 18/700 (trái)
    · 14 · bảng dòng phụ (cỡ 14, cách dòng 8).
  - Bảng dòng phụ: hai cột (nhãn tự co, cách 16): nhãn 15/700 `jade` · giá trị 15/500 `slate`, cao dòng 1,45, cách
    dòng 12. Chữ Hán trong giá trị dùng Noto Serif SC. Dài thì xuống dòng trong cột giá trị.
- Nút "Ra sân": nền `jade`, chữ `on-jade` 15/700, mũi tên trái 18, bo `radius.button` 12, cao 52, bóng `shadow.primary`.
- Vàng (`gold`) chỉ dùng cho chấm trang trí — chữ vàng trên nền sáng không đủ tương phản.
- Font (Flutter): đóng gói trong app (`app/assets/fonts/`, sinh bằng `web/scripts/fonts-app.mjs`); nguyên âm pinyin
  dấu mũ ngược (ǎ ǐ ǒ ǔ ǚ) Be Vietnam Pro / Lora không có → lấy từ Noto Serif SC.
- Trạng thái đã vẽ: chữ 快 dọc + ngang; chữ 書 dọc (dòng "Giản thể", từ dài).
- Chuỗi: `lessonEyebrow`, `lessonBack`; nhãn dòng phụ ("Bộ", "Nét", "Từ", "HSK", "Giản thể") đến từ nội dung bài
  (`web/src/zones/zones.ts`).
- Ảnh: `screens/BaiHoc-doc.png`, `screens/BaiHoc-ngang.png`, `screens/BaiHoc-doc-chu-dai.png` (chụp màn Flutter đã áp,
  font thật; bóng thẻ trong ảnh không mờ do trình vẽ của test).

## Trong nhà (nội thất + nút học) · artboard `TrongNha-doc.dc.html`, `TrongNha-ngang.dc.html`, `NoiThat-mat-bang.dc.html` · từ mục 2026-11-11.4

- Mục đích: thay thẻ mời ngoài sân — người chơi đi vào giảng đường / thư viện, học bằng vật trong nhà. **Đã có trong
  code** (`b3c4cf3`); mục này ghi lại thiết kế làm chuẩn để kiểm lệch.
- Mặt bằng (`NoiThat-mat-bang`): giảng đường 13 × 7 m, cửa giữa 2,4 m — bảng đen 4 m tường sau (chữ Hán bài học),
  bục 6 × 1 m cao 0,2, thầy áo xà lam cạnh trái bảng, 4 án thư 1,6 × 0,6 + bồ đoàn, lối giữa. Thư viện 7 × 6 m, cửa
  2 m — kệ sách tường sau + hai tường bên, án đọc 1,4 × 0,7 có sách mở giữa phòng.
- Khi ở trong: mái + tường trước + cột trước mờ 15 % (0,3 s), camera ≤ 6 m (`R-HUD-2`); chip "Văn Uyên Tông · <tên nhà>"
  (`R-HUD-1`).
- **Nút học nổi trên vật** (thành phần mới): neo phía trên vật học (giảng đường: trên mép trên bảng; thư viện: trên án
  đọc), giữa ngang theo vật. Pill, cao 48 dọc · 44 ngang, padding 0 20 0 16 (ngang 0 18 0 14), nền `jade`, viền 1 px
  `frost-line`, chữ trắng 15/700 + chữ Hán Noto Serif SC 20, chấm vàng 6 px bên trái, `shadow.primary` + 0 6px 16px
  rgba(36,50,58,.3); mũi nhọn tam giác 16 × 9 `jade` chỉ xuống vật. Hiện khi đứng trong vùng học (`R-VUNG-1`); chạm
  vật học cũng mở bài (`R-VUNG-2`); đang mở bài thì nhân vật đứng yên (`R-VUNG-3`).
- Bố cục dọc: chip, nút góc nhìn, joystick gợi ý như HUD; nút học ở trên bảng (≈ 1/3 trên màn), nhãn tên trên đầu
  nhân vật. Ngang: nút học trên án đọc giữa màn; joystick dưới trái.
- Trạng thái đã vẽ: giảng đường đứng gần bảng (dọc) · thư viện đứng gần án đọc (ngang). Chưa vẽ: đứng trong nhà
  nhưng ngoài vùng học (= không có nút học).
- Chuỗi: `lessonActionLearn` "Học chữ", `lessonActionReview` "Ôn chữ" (chữ trên nút: "<action> <chữ Hán>"; nguồn
  thật `ZONE_CONTENT[].action`), `roomGiangDuong`, `roomThuVien`.
- Luật: `R-VUNG-1`, `R-VUNG-2`, `R-VUNG-3`, `R-VA-3`, `R-HUD-1`, `R-HUD-2`.
- Ảnh: `screens/NoiThat-giang-duong-doc.png`, `screens/NoiThat-thu-vien-ngang.png` (chụp Canvas 3D, chưa có HUD).

## Bản đồ truyền tống (cuộn tranh 3D + HUD) · artboard `BanDo-giay.dc.html`, `BanDo-doc.dc.html`, `BanDo-ngang.dc.html` · từ mục 2026-11-13.9

- Mục đích: chọn vùng để truyền tống. Mở khi: nhân vật bước vào vòng trận (giữa Truyền Tống Đài, hoặc vòng trận ở mỗi
  vùng) → hiệu ứng ~1,2 s → cuộn bản đồ bay lên, mở ra trước mặt nhân vật, quay về camera. Đóng khi: bấm "Đóng bản đồ"
  (hoặc nút quay lại của máy) → cuộn lại, bay xuống; hoặc chạm nơi đã mở → màn tải → vùng.
- **Tấm giấy**: `design/scene/ban-do/ban-do-goc.png` 2048 × 1152 (vẽ bằng `ve-ban-do.html`); toạ độ 7 nơi + mọi số đo lớp
  trạng thái: `design/scene/ban-do/ban-do.json`. **Lục địa chia khu** (từ 2026-11-14.2, thay đường "rắn" theo thứ tự):
  mỗi nơi một vùng đất tô màu riêng, ranh giới nét mực nâu, đúng hướng địa lý, không đường nối — Tơ lụa tây bắc,
  Trường Thành bắc, Tử Cấm Thành đông bắc, Rừng trúc tây nam, Văn Uyên Tông giữa (triện 家), Giang Nam đông nam, Bồng
  Lai đảo ngoài biển đông. Sông Hoàng Hà / Trường Giang chảy ra biển, la bàn 北 góc trên phải. Chữ trên giấy: Hán 92
  Noto Serif SC `slate`, Việt 62 Be Vietnam Pro 700 `jade`, viền giấy 16 (đè lên màu khu). **Từ 2026-11-14.4**: mỗi khu một
  mảng nhỏ (elip ≈ 410 × 370) giữa **đất chưa khám phá** (giấy nhạt gạch chéo, núi xám, sương) — chỗ cho nơi mới; biểu
  tượng × 0,8, nhãn Hán 74 / Việt 50, vùng chạm r 130. **Từ 2026-11-14.5**: quan đạo toả từ Văn Uyên Tông tới mép từng
  khu (hình sao, không thứ tự), đường biển sang Bồng Lai, đường cụt nét đứt đi vào sương (nơi mới sau này), Trường
  Thành dọc rìa bắc. **Từ 2026-11-14.6**: nền là **các miền** (Tây Vực, Yên Vân, Kinh Kỳ, Trung Nguyên,
  Ba Thục, Ngô Việt, Đông Hải; Mạc Bắc, Lĩnh Nam, Điền Nam chưa khám phá) — mỗi nơi chỉ là một điểm nhỏ trong miền
  (biểu tượng × 0,6 trên đế giấy, tên Hán 56 / Việt 40, vùng chạm r 105); danh sách vùng ở `ban-do.json` `vung`. **Từ 2026-11-14.7**: trên giấy **chỉ chữ Việt** (không chữ Hán, không
  triện); không còn đường toả về Văn Uyên Tông — chỉ đường biển và đường cụt vào vùng chưa khám phá.
- **Lớp trạng thái** (code vẽ chồng lên giấy, theo `ban-do.json`; từ 2026-11-14.2 **không vòng tròn**): đã mở (không vẽ
  gì) · đang ở đây (ghim tròn đầu nhân vật chính `ban-do-nhan-vat.png`, viền ngọc lục + vàng, đuôi chỉ xuống, trên trái
  biểu tượng) · sắp mở (huy hiệu đồng hồ) · vừa chạm nơi sắp mở (viền huy hiệu đổi son, nhấp nháy 2 lần / 0,6 s). Không
  còn trạng thái khoá (R-HANH-1). Ảnh mẫu: `screens/BanDo-trang-thai.png`. **Chữ yêu cầu không vẽ trên giấy** (dọc
  giấy chỉ ≈ 17 % → chữ quá nhỏ) — hiện ở thẻ HUD.
- **Cuộn** (vật 3D, code dựng): hai trục `scroll-wood` dày ≈ 1/25 bề rộng, đầu trục `jade` viền `gold`; giấy giữa.
- Bố cục dọc: cuộn rộng ≈ 97 % màn (giấy 352 × 198), tâm trên ≈ 40 % chiều cao; trên cuộn dòng gợi ý "Chạm một nơi để
  truyền tống" (viên thuốc `frost-strong`, 13/700); dưới cuộn thẻ HUD khi chạm nơi khoá / sắp mở; nút "Đóng bản đồ"
  giữa, dưới cùng (dưới 24 + safe area), cao 48. Cảnh tối 28 %.
- Bố cục ngang: cuộn cao ≈ 76 % màn (giấy 484 × 272), giữa trên; thẻ HUD góc dưới trái (trái safe + 12); nút đóng góc
  dưới phải (phải safe + 12), cao 44.
- **Thẻ HUD nơi chưa đi được**: kính sương .92, viền ngoài son 35 %, bo 14, đệm 12 × 16; huy hiệu khoá 28 + dòng 15/700
  "<Hán> <tên> — cần N chữ" (hoặc "… — cần học xong bộ thủ Rừng trúc", "… — sắp mở") + dòng 13 "Bạn đã học M chữ.". Tự ẩn
  sau 3 s hoặc khi chạm chỗ khác.
- **Nút "Đóng bản đồ"**: viên thuốc kính sương .92, viền ngoài `slate` 22 %, dấu × 18 + chữ 15/700.
- Trong lúc bản đồ mở: nhân vật đứng yên, joystick + cụm nút hành động ẩn (như `R-VUNG-3`).
- Vùng chạm mỗi nơi: tròn r 150 px giấy → dọc ≈ 51 px, ngang ≈ 72 px.
- Chuỗi: `mapHint`, `mapClose`, `mapNeedChars`, `mapNeedRadicals`, `mapSoon`, `mapLearnedCount`, `mapHere`, `place*`.
- Luật: `R-HANH-1` (mốc mở); đề xuất mới — xem CHANGELOG 2026-11-13.9.
- Ảnh: `screens/BanDo-trang-thai.png` (giấy + trạng thái); màn ghép: chưa có ảnh (nền giữ chỗ là đài cũ 6 cột).

## Thẻ học bộ thủ (Flutter native) · artboard `TheBoThu-doc.dc.html`, `TheBoThu-doc-on.dc.html`, `TheBoThu-ngang.dc.html` · từ mục 2026-11-13.9

- Mục đích: học một bộ thủ ở Rừng trúc. Mở khi: chạm bia bộ thủ hoặc vật "sống" (suối → 氵/水, đá → 石, trúc → ⺮/竹…),
  hoặc nút học nổi cạnh bia. Đóng khi: nút chính / nút quay lại của máy. Nhân vật đứng yên khi thẻ mở (như `R-VUNG-3`).
- Khung: dùng lại **màn bài học** (nền `mist` + núi, eyebrow, thẻ lụa, nút chính đáy) — cùng số đo lề / thẻ / nút.
- Nội dung thẻ (dọc, từ trên): bộ thủ 120/700 Noto Serif SC `jade` + (nếu hai dạng) cột "dạng đủ" 12/700 + chữ 56 ·
  pinyin Lora 22 `lacquer` · tên "thuỷ — nước" 18/700 · vạch chấm vàng · "Từ hình đến chữ" 15/700 `jade` + 3 ô 78 × 78
  nền `map-paper` (hình vẽ nét 3,2 → chữ triện → chữ khải `jade`) nối bằng mũi tên · bảng dòng phụ ("Nét", "Chữ có bộ
  này": 2–3 chữ, chữ Hán 20 + pinyin + nghĩa).
- Ngang: cột trái 168 (bộ thủ 104 + dạng đủ 40, pinyin 20, tên 16) · vạch dọc · cột phải (dải hình 62 × 62, bảng 14) ·
  cột nút 150 bên phải (eyebrow trên, nút đáy).
- Trạng thái: **lần đầu** — nút "Đã lĩnh hội" (dấu ✓; từ 2026-11-13.19); **đã học** — huy hiệu "Đã học" góc trên
  phải thẻ (viền `jade`, chấm vàng), nút "Xuất định" (mũi tên trái); **hai dạng** (氵/水); **một dạng** (石 — lưu ý 竹
  có dạng ⺮ khi đứng trên).
- Hình "từ hình đến chữ": SVG nét (dữ liệu bộ thủ), không ảnh bitmap.
- Chuỗi: `radicalEyebrow`, `radicalFullForm`, `radicalEvolution`, `radicalStrokes`, `radicalExamples`, `radicalLearn`,
  `radicalBack`, `radicalLearned`; nội dung bộ thủ (tên, pinyin, ví dụ) ở dữ liệu.
- Ảnh: chưa có ảnh (dùng `source/TheBoThu-*.dc.html`).

## Nút hành động (HUD) · artboard `HUD-hanh-dong-doc.dc.html`, `HUD-hanh-dong-ngang.dc.html`, `NutHanhDong-trang-thai.dc.html` · từ mục 2026-11-13.9

- Cụm góc dưới phải (nửa phải màn — `R-DIEU-1`; chạm nút không tính là kéo xoay camera): **Nhảy** tròn 68 nền `jade`
  viền trắng 2, biểu tượng mũi tên lên trên gợn mây 30 trắng, sát góc (dọc: phải 16, dưới 16 + safe; ngang: phải safe +
  12, dưới safe + 9); **Chào** tròn 52 kính sương, trái Nhảy (cách tâm ≈ 86 px), biểu tượng tay chắp 拱手; **Ngồi thiền**
  tròn 52 kính sương, trên Nhảy (≈ 96 px), biểu tượng người ngồi trên đệm. Nhãn 11/700 dưới mỗi nút (viên thuốc kính .82).
- Trạng thái: bình thường · đang nhấn (thu 94 %; Nhảy `jade-press`, nút kính nền tối hơn) · **Thiền đang bật** (nền
  `jade`, viền `gold` 2 + quầng vàng 4, nhãn "Đang thiền" `jade`) · Chào đang diễn 1,6 s (như bật) · vô hiệu (kính .6,
  biểu tượng 45 %, không bóng) — Nhảy khi đang ngồi / không đứng trên đất; Chào, Thiền khi đang bay (`R-DIEU-6/7`).
- Ẩn khi: mở bài học / thẻ bộ thủ, màn tải, bản đồ mở, đang hội thoại.
- Không đè: nút học nổi + nút "Nói chuyện" bám vật trong cảnh (phía trên); joystick nửa trái; góc trên trống (R-HUD-1).
- Chuỗi: `actionJump`, `actionBow`, `actionSit`, `actionSitting`, `actionSitLabel` (nhãn trợ năng).
- Ảnh: chưa có ảnh.

## Hội thoại NPC (HUD) · artboard `HoiThoai-doc.dc.html`, `HoiThoai-doc-dai.dc.html`, `HoiThoai-ngang.dc.html` · từ mục 2026-11-13.9

- **Nút "Nói chuyện"** (`R-NPC-2`): kiểu nút học nổi — viên thuốc `jade` cao 46, biểu tượng bóng thoại 20 + chữ 15/700,
  mũi nhọn chỉ xuống NPC, dưới là bảng tên kính sương 24 "Tiểu Mặc 小墨"; bám trên đầu NPC. Đang nhấn: `jade-press`.
- **Khung thoại**: tấm kính sương .94 đáy màn (dọc: trái / phải 12, dưới 12 + safe; ngang: trái / phải safe + 12, dưới
  safe + 12), bo 16, đệm 26 × 18 × 16, bóng ngược lên. Chân dung tròn 64 (ảnh mặt NPC, viền trắng 3) chồng mép trên trái
  (trái 4, trên −36); bảng tên `jade` cao 32 "Tiểu Mặc 小墨" 14/700 cạnh chân dung (trái 76, trên −16).
- Lời: 16/500 `slate`, cao dòng 1,55, **chạy dần ≈ 40 chữ / giây**; chạm vào khung khi đang chạy → hiện hết; hết lời có
  chấm `jade` 8 cuối câu. Lựa chọn hiện khi lời đã hiện hết.
- Lựa chọn: xếp dọc, cách 8, cao ≥ 46, bo 12, chữ 15/700 trái; thường: nền trắng .7 viền `slate` 18 % + chấm vàng 6;
  "Tạm biệt" luôn cuối: nền trong suốt, viền `slate` 30 %, dấu × 16.
- Ngang: lời bên trái (giãn), cột lựa chọn 270 bên phải. Khung được phủ vùng joystick vì khi thoại joystick không có
  tác dụng (`R-NPC-2`).
- Đang thoại: ẩn joystick, cụm nút hành động, nút "Nói chuyện"; cảnh tối 18 % (chip tên khu, nút góc nhìn đã bỏ — R-HUD-1).
- Đã vẽ: câu chào (3 lựa chọn) · câu dài nhất "tu-chu" (2 lựa chọn) · ngang.
- Chuỗi: `talk`; lời thoại giữ trong dữ liệu hội thoại (`web/src/zones/dialogs.ts`).
- Ảnh: chưa có ảnh.

## Tu luyện (hiệu ứng cảnh + nút ngồi) · artboard `TuLuyen-nhap-dinh-doc.dc.html`, `TuLuyen-nhap-dinh-ngang.dc.html`, `TuLuyen-trinh-tu.dc.html`, `TuLuyen-nut-trang-thai.dc.html`, `TuLuyen-nguoi-khac-thay.dc.html`, `TuLuyen-dom-linh-tu-doc.dc.html` · từ mục 2026-11-13.19

- Mục đích: học bộ thủ bằng ngồi thiền ở vùng có bài học (`R-HANH-3`). Cảnh là của chung, việc học của riêng: nhập
  định + thẻ chỉ máy mình thấy; người khác chỉ thấy kết quả trên nhân vật.
- **Nút ngồi** (cụm nút hành động, cùng chỗ / cỡ 52): tông môn và vùng đã học đủ → "Thiền" như cũ. Vùng có bài học còn
  bộ chưa học → nhãn **"Tu luyện"** + chấm son đếm `count-badge` 22 ở góc trên phải nút (số bộ còn lại; ≥ 100 → "99+");
  trợ năng "Tu luyện, còn N bộ thủ chưa học". Đang ngồi → như "Đang thiền" (`R-DIEU-7`: nền `jade`, viền `gold` + quầng)
  nhãn **"Đang tu luyện"**, ẩn chấm đếm. Đang bay: mờ.
- **Nhập định** (1 s từ lúc ngồi tới lúc thẻ mở; vật 3D / lớp cảnh, không phải HUD):
  - 0 → 0,3 s: **vòng sáng** nở dưới đệm ngồi — elip phẳng trên mặt đất ≈ 1,6 m × 0,45 m (rộng ≈ 1,3 × vai nhân vật),
    lõi `aura-light` mờ dần ra ngoài, viền `gold` .85 nét mảnh + vòng trong trắng .8. Sau đó "thở" nhẹ (co giãn 4 %, 2 s).
  - 0,3 → 1 s: **chữ của bộ sắp học** hiện dần trên đầu (≈ 0,5 m trên đỉnh đầu, cao ≈ 0,5 m), màu `jade`, quầng trắng →
    vàng; mờ 0 → 0,7.
  - 1 s: chữ lớn lên 1,15 lần, sáng hẳn rồi tan (0,15 s) → thẻ học bộ thủ mở. Không có thanh tiến trình.
  - Đứng dậy trước 1 s: vòng sáng + chữ tắt dần 0,2 s, không mở thẻ.
  - Vùng không có bài (tông môn) hoặc đã học đủ: không có vòng sáng / chữ.
- HUD khi đang tu: joystick vẫn hiện (kéo = đứng dậy, chữ "kéo để đứng dậy"), Nhảy mờ, Chào thường.
- **Thẻ học bộ thủ**: nút "Đã lĩnh hội" (lần đầu) — đóng thẻ, **vẫn ngồi** (`R-HANH-3`); "Xuất định" (bộ đã học) —
  đóng thẻ và **đứng dậy** nếu đang ngồi (đề xuất luật, xem CHANGELOG 2026-11-13.19).
- **Người khác thấy** (chốt hướng, code làm sau — `TuLuyen-nguoi-khac-thay`): đang tu → 2–3 chữ đã học bay vòng ngang
  ngực (bán kính ≈ 1,1 m, 1 vòng / 8 s, mờ 75 %, viền trắng mảnh), chữ của người khác mờ 60 %; học xong một bộ → chữ mới
  từ trên đầu thu vào ngực 0,6 s, hào quang sau lưng sáng một nhịp; hào quang theo số bộ đã học (mờ 8 % / 16 % / 28 %
  ở 10 / 25 / 50 bộ, `gold`, không tia); xa > 12 m chỉ còn vòng sáng; mỗi người tối đa 3 chữ.
- **Đốm linh tự** (đợt 2, chốt hướng — `TuLuyen-dom-linh-tu-doc`): đốm sáng ≈ 0,25 m (`aura-light`) ở vật hợp nghĩa,
  chữ bộ thủ mờ 55 % phía trên; đứng trong ≈ 2 m → nút nổi "Lĩnh hội 木" (kiểu nút "Nói chuyện"). Không mở bằng chạm vào
  cảnh (`R-VUNG-2`). Chỉ người đó thấy.
- **Linh địa** gợi ý cho `/canh` (3–5 chỗ ở Rừng trúc): đình trúc, bờ suối (氵), chân thác, gốc trúc già (竹 / 木), mỏm đá
  ngắm núi (山 / 石).
- Chuỗi: `actionCultivate`, `actionCultivating`, `actionCultivateLabel`, `radicalLeft`, `radicalLearn`, `radicalBack`,
  `spiritTap`.
- Ảnh: nền giữ chỗ `screens/Canh-rung-truc-tu-luyen.png` (nhân vật trong ảnh đang đứng); màn ghép chưa có ảnh.

## Bảng nhiệm vụ hằng ngày 日課榜 (Flutter native) · artboard `NhiemVu-doc.dc.html`, `NhiemVu-doc-moi.dc.html`, `NhiemVu-doc-xong.dc.html`, `NhiemVu-ngang.dc.html` · từ mục 2026-11-13.25

- Mục đích: xem 2 việc hôm nay + chuỗi ngày (`R-NV-1/2`). Mở khi: nút "Xem bảng" gần bảng (dưới 2,5 m) hoặc chọn "Hôm nay
  có việc gì?" với Tiểu Mặc (`openDaily`, `R-NV-3`). Đóng: "Đóng bảng" / nút quay lại của máy. Nhân vật đứng yên khi mở.
- Khung: **màn bài học** (nền `mist` + núi, eyebrow 11/700 hoa "Văn Uyên Tông · cổng nam", thẻ lụa `frost` .86 bo 16,
  nút đáy 52). Nút đáy là nút **phụ** (viền `slate` 30 %, nền trắng .55, dấu ×) — hành động chính là "Ôn ngay" trong thẻ.
- Thẻ (dọc, từ trên): tiêu đề 日課榜 40 Noto Serif SC `jade` giãn chữ .08em + dòng "Nhiệm vụ hằng ngày · <thứ> <ngày/tháng>"
  13/700 · vạch chấm vàng · **việc 1 "Lĩnh hội"** · **việc 2 "Ôn tập"** · vạch chấm vàng · **chuỗi**.
- Một việc: vòng trạng thái 36 (chưa xong: viền `slate` 30 % 2 px; xong: nền `jade` + ✓ trắng + quầng vàng 3) · tên
  16/700 · phải: tiến độ (Lĩnh hội: 3 chấm 14 — đã học tô `jade`, chưa viền `jade` 40 % — + "n/3" 14/700; Ôn tập: "còn n")
  · dòng phụ 13 (xong → chữ `jade`). Ôn tập có bộ đến hạn: hàng ô chữ 34 × 34 nền `map-paper` (chữ Hán 20 `jade`, tối đa
  một hàng, thừa → "+n") + nút **"Ôn ngay"** chính cao 46 rộng hết cột (mở màn ôn tại chỗ — `R-ON-5`).
- Chuỗi: "Tu liền" 13/700 + số Lora 40 `jade` + "ngày"; phải "Kỷ lục **n** ngày" 13. Dải 7 ngày (T2 … CN) vòng 26: đã
  tính = `jade` + ✓; hôm nay chưa xong = viền đứt `jade` 2; hôm nay đã xong = như đã tính + quầng vàng; bỏ ngày = nền
  `slate` 8 %; chưa tới = viền mảnh. Dòng phụ 12 theo trạng thái (`dailyKeep` / `dailyDone` / `dailyStart`). Chuỗi
  hôm nay = kỷ lục và vừa tăng → viên "Kỷ lục mới" (viền `gold`, nền vàng 14 %, chấm vàng, chữ `slate`).
- **Xong cả 2**: triện son 62 × 62 xoay −8° góc trên phải thẻ (viền `lacquer` 3, chữ 畢 30 + "xong" 9/700), trợ năng
  "Hôm nay đã xong".
- Trạng thái đã vẽ: đang dở (2/3, còn 4 bộ, chuỗi 5 / kỷ lục 7) · mới cài (0/3, không bộ đến hạn → Ôn tập xong, chuỗi 0)
  · xong cả 2 + chuỗi dài (23, kỷ lục mới). Học đủ 50 bộ: Lĩnh hội xong, dòng phụ `dailyLearnAll`.
- Ngang: một thẻ hai cột — trái 2 việc (nút "Ôn ngay" cao 42), vạch dọc, phải 250 (tiêu đề + chuỗi); cột nút 120 phải,
  nút "Đóng" cao 48 ở đáy.
- Chuỗi: `daily*`, `boardOpen`, `boardOpenLabel`. Luật: `R-NV-1/2/3`, `R-ON-5`, `R-MAN-1`.
- Ảnh: chưa có ảnh.

## Màn ôn câu đố (Flutter native) · artboard `OnTap-doc-chua-chon.dc.html`, `OnTap-doc.dc.html`, `OnTap-doc-dung.dc.html`, `OnTap-doc-sai.dc.html`, `OnTap-doc-ket-qua-bo.dc.html`, `OnTap-doc-tong-ket.dc.html`, `OnTap-ngang.dc.html`, `OnTap-muc-ket-qua.dc.html` · từ mục 2026-11-13.25

- Mục đích: ôn các bộ đến hạn (`R-ON-1…5`, dữ liệu `openReview`). Mở khi: ngồi thiền ở Rừng trúc còn bộ đến hạn, hoặc
  "Ôn ngay" trên bảng nhiệm vụ. Nhân vật đứng yên khi mở.
- Khung: màn bài học (như trên) nhưng **không eyebrow** — thay bằng thanh trên: nút tròn × 44 (kính sương, "Thoát lượt
  ôn") + cột: dòng "ÔN TẬP" 12/700 hoa · "Bộ i / n" phải, dưới là thanh tiến độ chia n đoạn cao 6 cách 4 (đã xong
  `jade`, đang làm `jade` 45 %, chưa `slate` 14 %).
- Thẻ câu hỏi: "Câu 1 / 2 · Pinyin" (hoặc "Câu 2 / 2 · Nghĩa") 12/700 `jade` · bộ thủ 110 Noto Serif SC `jade` · câu hỏi
  17/700 ("Bộ này đọc là gì?" / "Bộ này nghĩa là gì?") · 3 phương án dồn đáy thẻ, cách 10.
- Phương án: cao ≥ `option-row` 58, bo 14, đệm ngang 16, nền trắng .75, viền `slate` 18 % 1 px; dấu tròn 20 bên trái;
  chữ: pinyin Lora 22, nghĩa 16/700 ("thuỷ — nước"). **Đang chọn**: viền `jade` 2, nền `jade` 8 %, dấu tròn có chấm
  `jade`. Đổi được tới khi bấm "Kiểm tra".
- Nút đáy **"Kiểm tra"** (chính 52): chưa chọn → vô hiệu (nền `jade` 35 %, không bóng).
- Sau khi kiểm tra: đáp án đúng viền `jade` 2 + nền `answer-right-bg` + dấu ✓ tròn `jade`; chọn sai viền `lacquer` 2 + nền
  `answer-wrong-bg` + dấu × tròn `lacquer`; các phương án khác mờ 60 %. Nút "Kiểm tra" thay bằng **khung phản hồi**
  (bo 14, đệm 14 × 16, viền + nền theo đúng / sai): dòng 16/700 có dấu ("Đúng rồi!" / "Chưa đúng — thuỷ · nước") + nút
  chính "Câu tiếp →".
- **Kết quả một bộ** (sau câu 2): thẻ giữa — "Kết quả bộ này" 12/700 `jade`, bộ thủ 110, pinyin Lora 22 `lacquer`, tên 18/700,
  vạch chấm vàng, **viên mức** cao 40 (Nhớ rõ · 2/2 — `jade` / nền `answer-right-bg`; Nhớ một phần · 1/2 — viền `gold`,
  nền `answer-partial-bg`, chữ `slate`; Chưa nhớ · 0/2 — `lacquer` / nền `answer-wrong-bg`), câu hạn kế 15
  ("Lên bậc — ôn lại sau 7 ngày", "Lùi một bậc — ôn lại sau 3 ngày", "Về bậc đầu — mai ôn lại"; số ngày từ dữ liệu),
  bảng nhỏ Pinyin / Nghĩa đúng-sai. Nút "Bộ tiếp →" (bộ cuối: thẳng tổng kết).
- **Tổng kết**: vòng ✓ 48 `jade` + quầng vàng, "Ôn xong n bộ" 22/700, "Việc Ôn tập hôm nay đã xong." · 3 ô đếm (Lora 28)
  theo 3 mức · các ô chữ của lượt (nền `map-paper`, viền màu mức + "n/2") · dòng gợi ý việc còn lại · nút "✓ Xong".
- Thoát giữa lượt (×): đóng ngay, **không hỏi lại** — bộ đã chấm giữ kết quả, bộ chưa chấm vẫn đến hạn (`R-ON-5`).
- Ngang: thẻ hai cột — trái 220 (bước, bộ thủ 96, câu hỏi), phải 3 phương án cao 50; cột phải 150: thanh tiến độ trên,
  nút "Kiểm tra" / "Câu tiếp" đáy.
- Chuỗi: `review*`. Luật: `R-ON-1…5`, `R-NV-1`, `R-MAN-1`.
- Ảnh: chưa có ảnh.

## Nút "Xem bảng" (HUD) · artboard `XemBang-doc.dc.html`, `XemBang-ngang.dc.html` · từ mục 2026-11-13.25

- Kiểu nút "Nói chuyện" (viên thuốc `jade` 46, biểu tượng bảng 20, mũi nhọn xuống) bám trên bảng 日課榜, dưới là nhãn
  kính sương "Nhiệm vụ hằng ngày 日課榜". Hiện khi đứng dưới 2,5 m (`R-NV-3`). Còn việc hôm nay → chấm son `count-badge`
  số việc còn (1 / 2); xong cả 2 → không chấm. Trợ năng `boardOpenLabel`.
- Ảnh nền giữ chỗ `screens/Canh-tieu-mac-bang.png` (bảng trong ảnh còn ghi 文淵榜).

## Trò chơi Kỳ Văn Uyển — Ngũ Tử Kỳ 五子棋 (HUD) · artboard `Co-doc-luot.dc.html`, `Co-doc-nghi.dc.html`, `Co-doc-thang.dc.html`, `Co-ngang.dc.html`, `Co-ket-qua.dc.html` · từ mục 2026-11-13.27

- Mở khi: ngồi vào ghế bàn cờ ("Vào bàn", `R-NGOI-1`, `R-GIAO-1`); camera nhìn xuống bàn 13 × 13. Ẩn khi rời bàn.
- **Khi ngồi chơi ẩn joystick + cụm Nhảy / Chào / Thiền** — cả màn là bàn, chạm là chạm bàn. Rời: nút **"Rời bàn"**
  (đề xuất đổi luật, xem CHANGELOG 2026-11-13.27).
- Dọc: dải trên (trên 8 + safe): trái nút "Rời bàn" viên thuốc kính sương cao 44 (biểu tượng cửa ra 18 + chữ 14/700); phải
  viên tỉ số phiên cao 44 ("● Đạo hữu **2** : **1** Tiểu Mặc ○" — số Lora 20 `jade`, quân đen / trắng 14). Đáy (dưới 12 +
  safe, giữa): **viên lượt** cao 48 — lượt mình: chấm `jade` 10 + quầng + "Lượt đạo hữu" 14/700 + "· ● chạm giao điểm để
  đặt" 14/500; NPC nghĩ: chân dung 32 + "Tiểu Mặc đang nghĩ" + 3 chấm nhấp nháy (1,2 s).
- Trên bàn 3D (code cảnh): quân vừa đi có chấm son `lacquer` ≈ 1/3 đường kính; hết ván → 5 quân thắng viền `gold` sáng.
- **Thẻ kết quả ván** (thay khung thoại "Vâng"): tấm kính sương .95 đáy màn (trái / phải 16), bo 16, đệm 34 × 18 × 16; chân dung
  56 chồng mép trên trái (−30), bảng tên `jade` 28; dòng "Thắng" (`jade`) / "Thua" (`lacquer`) / "Hoà" (`slate`) 24/700 +
  "Tỉ số a : b" 14/700; lời NPC 16/500 trong ngoặc kép (R-CO-3); hàng nút: **"Ván mới"** chính 48 (giãn) + **"Rời bàn"** phụ.
  "Ván mới" = đóng (R-CO-3: bàn dọn, ván mới, người đi trước).
- Ngang: bàn giữa; "Rời bàn" góc trên trái, tỉ số góc trên phải, viên lượt góc dưới phải (bỏ vế "chạm giao điểm…").
- Chuỗi: `game*`, `gomokuHint`. Luật: `R-GIAO-1`, `R-CO-1/2/3`, `R-MAN-1`.
- Ảnh: nền giữ chỗ `screens/Ky-van-uyen-ngu-tu-ky.png` (cắt bỏ HUD cũ; NPC trong ảnh còn đứng ở bàn); màn ghép chưa có ảnh.

## Trò chơi Kỳ Văn Uyển — Đấu chữ 鬥字 (HUD) · artboard `Dau-doc-luot.dc.html`, `Dau-doc-dung.dc.html`, `Dau-doc-sai.dc.html`, `Dau-doc-mo-nghi.dc.html`, `Dau-doc-mo-chon.dc.html`, `Dau-doc-ket-thuc.dc.html`, `Dau-doc-chua-hoc.dc.html`, `Dau-ngang.dc.html` · từ mục 2026-11-13.27

- Mở khi: ngồi vào ghế bàn Đấu chữ. Ẩn joystick + cụm nút hành động như Ngũ Tử Kỳ; "Rời bàn" góc trên trái.
- Dọc, trên xuống: hàng 1 (trên 8 + safe) "Rời bàn" + viên tiến độ cao 44 ("Câu n / 10" 13/700 + 10 chấm 10: đúng `jade`, sai
  `lacquer`, câu hiện tại `jade` 45 % viền trắng, chưa `slate` 18 %); hàng 2 (trên 64 + safe) **hai thẻ điểm** 52: trái Mặc
  Ông (chân dung 36 · tên 13/700 · số Lora 24 `jade`), phải Đạo hữu (đối xứng); đang tới lượt ai → viền `jade` 2; vừa được
  điểm → quầng vàng 4. Giữa: thẻ bộ thủ trên bàn 3D lật ngửa (giấy `map-paper`, viền `jade`, chữ lớn — code cảnh).
- Đáy (trái / phải 16, dưới 12 + safe): **ô câu hỏi** kính sương bo 14 ("Bộ 木 nghĩa là gì?" 18/700, chữ Hán 22 `jade`; dòng
  phụ 12: "Lượt đạo hữu · chạm một nghĩa" / sau khi chấm: "mộc · mù — cây" / NPC nghĩ: chân dung + "Mặc Ông đang nghĩ…")
  + **4 ô nghĩa** lưới 2 × 2 cách 10: cao ≥ 64, bo 14, nền `map-paper`, viền `slate` 20 %, chữ 16/700, bóng nhẹ.
- **Chạm là chọn** (không có "Kiểm tra" — nhịp đấu nhanh, khác màn ôn). Sau khi chọn ~1 s (R-DAU-2): ô đúng viền `jade` 2
  nền #E3EBE4 + dấu ✓; ô chọn sai viền `lacquer` 2 nền #F3E1DC + dấu ×; ô khác mờ 55 %; viên báo giữa màn (trên ô câu hỏi)
  "Đúng rồi! +1 điểm" / "Chưa đúng — mộc · cây" (cao 44, viền + chữ theo đúng / sai).
- Lượt Mặc Ông: 4 ô mờ, không chạm được; thẻ điểm Mặc Ông viền `jade`; khi chọn xong ô đó gắn huy hiệu "Mặc Ông" (chân dung
  20 trên nền `slate`) rồi chấm như trên ("Mặc Ông đúng · +1" / "Mặc Ông sai — …").
- Cuối ván: thẻ kết quả như Ngũ Tử Kỳ (chân dung Mặc Ông, "Thắng 4 : 3", lời kết từ dữ liệu hội thoại, "Ván mới" / "Rời bàn").
- Chưa học bộ nào (`R-DAU-1`): không thẻ, không thẻ điểm; khung thoại NPC sẵn có (cảnh tối 18 %) với câu của luật + lựa chọn
  "Vâng, con đi đây (rời bàn)".
- Ngang: bàn giữa; cột trái 200 ("Rời bàn", 2 thẻ điểm xếp dọc, tiến độ ở đáy); cột phải 236 (ô câu hỏi + 4 nghĩa xếp dọc cao ≥ 48).
- Chuỗi: `game*`, `duel*`. Luật: `R-GIAO-1`, `R-DAU-1/2`, `R-VUNG-1`, `R-MAN-1`.
- Ảnh: nền giữ chỗ `screens/Ky-van-uyen-dau-chu.png` (cắt bỏ khung thoại); màn ghép chưa có ảnh.

## Danh mục sách Tàng Thư Các (Flutter native) · artboard `DanhMuc-doc.dc.html`, `DanhMuc-doc-xac-nhan.dc.html`, `DanhMuc-doc-dang-giu.dc.html`, `DanhMuc-ngang.dc.html` · từ mục 2026-11-13.28

- Mở khi: thoại thủ thư → "Mượn sách" (`openLibrary`, `R-SACH-1`). Đóng: "Đóng" / nút quay lại của máy. Nhân vật đứng yên.
- Khung màn bài học; eyebrow "Tàng Thư Các · quầy mượn sách". Thẻ: 藏書閣 30 Noto Serif SC `jade` giãn .1em · "Sổ từ HSK"
  15/700 · dòng phụ 13 · **kệ gỗ** 2 tầng × 3 cuốn (tầng: thanh `shelf-wood` cao 10, bóng #6B4429 4 px + bóng mờ).
- Bìa cuốn 96 × 128 (bo 4 / 8 / 8 / 4, gáy tối 6 px bên trái, khung chỉ vàng mảnh trong bìa): số cấp chữ Hán 一 … 六 (≈ 35 % rộng)
  + "HSK n" 13/700 + "简体" 9/700 góc dưới phải; dưới bìa: tên cấp 13/700 + số từ 12. Màu bìa cuốn đã soạn: HSK 1 `jade`,
  HSK 2 `slate` (cuốn soạn sau: lấy tiếp từ token, mỗi cuốn một màu).
- Trạng thái cuốn: **mượn được** · **đang chọn** (viền `gold` 3 cách 3) · **Đang biên soạn** (bìa nền trắng .5 viền đứt `slate` 35 %,
  chữ mờ; dòng dưới "Đang biên soạn" `lacquer`; chạm → thẻ báo "HSK 3 đang biên soạn — chưa mượn được") · **đang mượn** (viên
  `gold` "Đang mượn" chồng mép trên bìa) · **chỉ xem** (mờ 55 % khi đang giữ cuốn khác).
- Chọn cuốn → **thẻ xác nhận** đáy (thay nút "Đóng"): bìa mini 44 × 58 + "Mượn «HSK 2 · Sơ cấp»?" 16/700 + "152 từ · chữ giản
  thể 简体 · không hạn trả" 13 · nút phụ "Chọn cuốn khác" + nút chính "Mượn" (biểu tượng sách). Mượn → đóng màn, thủ thư nói
  câu giao sách (khung thoại có sẵn).
- Đang giữ cuốn khác: lời nhắc trên kệ (nền vàng 14 %, viền `gold`, biểu tượng i) "Đang giữ «HSK 1». Trả cuốn đang giữ trước
  đã — nói với thủ thư "Trả sách"." (`R-SACH-4`).
- Ngang: thẻ trái (tiêu đề một dòng + một tầng kệ 6 cuốn 72 × 96); cột phải 190: "Đóng" trên, thẻ xác nhận dưới.
- Chuỗi: `lib*`, `hskLevel1…6`. Luật: `R-SACH-1/4`, `R-MAN-1`. Ảnh: chưa có ảnh.

## Sổ từ — màn đọc (Flutter native) · artboard `SoTu-doc.dc.html`, `SoTu-doc-dai.dc.html`, `SoTu-doc-hai-phan.dc.html`, `SoTu-doc-cuoi.dc.html`, `SoTu-ngang.dc.html` · từ mục 2026-11-13.28

- Mở khi: nút "Đọc sách" (`openBook`, `R-SACH-3`), đúng trang đã đóng lần trước. Đóng: × / nút quay lại. Nhân vật đứng yên.
- Thanh trên: nút tròn × 44 kính sương ("Đóng sổ") · tên cuốn 14/700 + "Sổ từ · 简体" 12 · viên "Trang n / N" 13/700.
- **Trang giấy**: nền `map-paper`, bo 6 / 14 / 14 / 6 (gáy bên trái có bóng trong), dải son đánh dấu 14 × 34 ở mép trên phải.
  Từ: Noto Serif SC `jade` — 1–2 chữ 104, 3–4 chữ 64, từ hai phần (虽然…但是) 52, xuống dòng không cắt chữ; pinyin Lora 26
  `lacquer`; nghĩa 20/700; vạch chấm vàng; "VÍ DỤ" 12/700 `jade`; câu Hán 24 (giản thể, `lang="zh-Hans"`), pinyin Lora 16,
  nghĩa 15.
- Dưới trang: **thanh kéo** tới trang (rãnh 4, phần đã đọc `jade`, núm 24 trắng viền `jade`) · hàng nút: "Trang trước" (phụ) +
  "Trang sau" (chính), cao 52. Trang 1: "Trang trước" tắt (mờ 40 %); trang cuối: "Trang sau" tắt (nền `jade` 35 %). Vuốt
  ngang trên trang cũng lật.
- Ngang: trang hai cột (từ + pinyin + nghĩa trái 230 · vạch · ví dụ phải); cột phải 180: × + tên + trang, thanh kéo, "Trang
  sau", "Trang trước".
- Chuỗi: `book*`. Luật: `R-SACH-3`, `R-MAN-1`. Ảnh: chưa có ảnh.

## Nút "Đọc sách" (HUD) · artboard `DocSach-doc.dc.html`, `DocSach-ngang.dc.html` · từ mục 2026-11-13.28

- Hiện khi đang mượn sách và không mở bài học / bản đồ / khung thoại, không ngồi thiền (`R-SACH-2`); có ở mọi khu, mọi vùng.
- Thẻ kính sương cao 52 bo 14, ngay **trên cụm nút hành động** (dọc: phải 16, dưới 232; ngang: phải safe + 12, dưới 210):
  bìa mini 28 × 36 màu cuốn (chữ 一) + "Đọc sách" 14/700 + "HSK 1" 11/700 `jade`. Trợ năng "Đọc sách — đang mượn HSK 1".
- Chuỗi: `readBook`, `readBookLabel`.

## Nút nổi "Ngồi" (HUD) · artboard `NutNgoi-doc.dc.html`, `NutNgoi-trang-thai.dc.html`, `DocSach-doc.dc.html` · từ mục 2026-11-13.28

- Họ nút "Nói chuyện": viên thuốc `jade` 46, biểu tượng người ngồi trên bồ đoàn 20 (đầu tròn, thân, tay đặt gối, đệm elip;
  nét 2) + chữ 15/700, mũi nhọn chỉ xuống chỗ ngồi; bám trên chỗ ngồi gần nhất trong tầm (`R-NGOI-1`).
- Nhãn: bàn chơi **"Vào bàn"**, án thư / bàn trà **"Ngồi"**.
- Vòng sáng dưới chỗ ngồi (vật 3D): elip phẳng ≈ ∅1,2 m, lõi `aura-light` mờ ra ngoài, viền `gold` .75, thở nhẹ.
- Cùng lúc với "Nói chuyện": mỗi nút bám vật của nó; hai khung chồng nhau → nút Ngồi dịch xuống / sang tới khi cách ≥ 8 px
  (không đè); "Nói chuyện" giữ chỗ trên đầu NPC.
- Chuỗi: `seatSit`, `seatTable`. Luật: `R-NGOI-1`, `R-DIEU-7`, `R-GIAO-1`, `R-VA-4`, `R-MAN-1`. (Nhãn "Ngồi xem" trong
  `NutNgoi-trang-thai` đã bỏ cùng rạp phim — mục 2026-11-13.30.)
- Ảnh nền giữ chỗ: `screens/Canh-thu-vien-trong.png`, `screens/Ky-van-uyen-toan-canh.png` (bản cũ). Màn ghép chưa có ảnh.

## Nghe nhạc ở bàn trà Phẩm Minh Các (HUD) · artboard `Nhac-doc-ngoi.dc.html`, `Nhac-doc-dang-phat.dc.html`, `Nhac-doc-danh-sach.dc.html`, `Nhac-ngang.dc.html`, `Nhac-trang-thai.dc.html` · từ mục 2026-11-13.31

- Mở khi: đang **ngồi bàn trà** tầng 2 trà lâu (`R-VA-4`) → nút nổi **"Nghe nhạc"** (họ "Nói chuyện": viên thuốc `jade` 46,
  biểu tượng nốt nhạc 20, mũi nhọn xuống bàn, nhãn kính sương "Bàn trà · Phẩm Minh Các 品茗閣") → bấm → trình phát mở.
- **Trình phát**: thẻ kính sương .9 bo 18 đáy màn (dọc: trái / phải 12, dưới 12 + safe; ngang: cột phải 330, phải safe + 12),
  đệm 14:
  - hàng đầu: đĩa nhạc 56 (lõi `map-paper`, vành `jade`, chỉ vàng, chữ Hán đầu tên bài) · tên Hán 18 Noto Serif SC `jade` +
    "Đang phát" / "Tạm dừng" 12/700 `jade` · tên Việt 15/700 (một dòng, cắt …) · "loại nhạc · bài i / n" 12 · nút ⌄ 44 (thu nhỏ);
  - thanh thời gian (rãnh 4, đã phát `jade`, núm 20) + "m:ss" hai đầu 11/700;
  - hàng nút: Lặp 44 · Bài trước 44 · **Phát / Dừng** tròn 60 `jade` · Bài sau 44 · Danh sách 44. Nút bật (lặp, danh sách
    đang mở): nền `jade` 12 % + viền `jade` 1,5.
- Nút lặp bấm xoay vòng: lặp cả danh sách (mặc định) → lặp một bài (biểu tượng có số 1) → không lặp (hết bài cuối dừng).
- **Danh sách**: thẻ kính sương mở phía trên trình phát, cảnh tối 18 %: tiêu đề "Nhạc của trà lâu" 15/700 + "n bài · không
  cần mạng" 12; mỗi dòng ≥ 52: số thứ tự (bài đang phát: nốt nhạc `jade` + nền `jade` 10 % + viền) · tên Hán 15 + tên Việt
  14/700 · loại 12 · thời lượng 12/700. Chạm dòng → phát bài đó.
- Mới mở: bài nghe dở lần trước (hoặc bài 1), tạm dừng — WebView cần một lần chạm mới phát tiếng.
- **Thu nhỏ** (⌄): viên kính sương 44 góc trên trái (dưới safe area): đĩa 36 + tên bài + nút dừng 32; chạm → mở lại.
- **Đứng dậy** (joystick / nút ngồi) → nhạc tắt, trình phát đóng (người dùng chọn — đề xuất luật).
- Dữ liệu: 6 cổ khúc giữ chỗ (高山流水, 梅花三弄, 平沙落雁, 雨打芭蕉, 春江花月夜, 竹林清風) — file nhạc chưa có; đóng gói
  offline, cần bản thu có giấy phép.
- Chuỗi: `music*`. Luật: `R-VA-4`, `R-NGOI-1`, `R-DIEU-7`, `R-MAN-1`; luật mới đề xuất (CHANGELOG 2026-11-13.31).
- Ảnh: nền giữ chỗ vẽ tay (chưa có ảnh chụp tầng 2 trà lâu); màn ghép chưa có ảnh.

## Bảng cách chơi Kỳ Văn Uyển (HUD) · artboard `CachChoi-doc-co.dc.html`, `CachChoi-doc-dau.dc.html`, `CachChoi-doc-dau-chua-hoc.dc.html`, `CachChoi-ngang.dc.html` · từ mục 2026-11-13.35

- Mục đích: đọc lướt luật một trò trong một lần — thay lời giảng nhiều trang của NPC (`R-GIAO-2`). Mở khi: bấm nút nổi
  "Cách chơi" trên biển (đứng dưới 2,5 m). Đóng: nút "Đóng" / nút quay lại của máy → về cảnh, đứng chỗ cũ. Nhân vật đứng
  yên khi mở.
- **Lớp phủ HUD web** (như khung thoại), không phải màn Flutter: nút đã ở web (`guideButton.ts`), nội dung là chữ tĩnh,
  chạy cả khi không có Flutter (trang chơi thử, Canvas 3D). Cảnh phía sau tối `rgba(36,50,58,.28)`.
- Một khung cho cả hai trò (dữ liệu theo trò). **Dọc**: tấm kính sương `frost` .92 (blur 14), trái / phải 16, trên 12 + safe,
  dưới 16 + safe, bo 16, viền `frost-line` + outline `frost-outline`, bóng `card`. Từ trên:
  - Đầu bảng (đệm 18 18 12, giữa): eyebrow 11/700 hoa "Kỳ Văn Uyển · Cách chơi" · tên Hán 36 Noto Serif SC `jade` giãn .08em +
    tên Việt Lora 20 cùng hàng (baseline) · dòng giới thiệu 14. Vạch trang trí (1 px + chấm vàng 5).
  - **Vùng cuộn** (đệm 14 18 40, cách 16): hình minh hoạ → 4 mục → ô mẹo. Đáy vùng cuộn mờ dần 40 px; thanh cuộn 3 px
    `slate` 25 %. Đầu bảng + nút đứng yên.
  - Nút **"Đóng"** đáy (đệm 10 18 16): phụ, cao 48, rộng hết, bo 12, nền trắng .55, viền `slate` 30 %, dấu × 18.
- **Hình minh hoạ** (giấy `map-paper`, bo 12, đệm 12, viền `slate` 16 %):
  - Ngũ Tử Kỳ: lưới 7 × 7 trên nền gỗ #E7D6B4 (128 dọc / 104 ngang), 5 quân đen liền chéo viền `gold` 3 + vạch vàng nối,
    4 quân trắng xen; chú thích 13 bên phải.
  - Đấu chữ: thẻ 木 76 × 76 (như thẻ trên bàn: viền `jade` 3, chỉ vàng trong) + 4 nghĩa lưới 2 × 2 (13/700, bo 8); nghĩa đúng
    nền #E3EBE4 viền `jade` 2 chữ `jade` + dấu ✓ tròn 18; 3 nghĩa kia mờ 60 %. Chú thích 13 dưới.
- **4 mục** (cách 16): vòng `jade` 26 số trắng 13/700 · tiêu đề 15/700 · đoạn 14 dòng 1,5; chữ đậm cho ý chính. Thứ tự:
  Mục tiêu · Mỗi lượt · Thắng · thua · hoà · Vào bàn · rời bàn. Nội dung: `guide*` trong `l10n/vi.arb` (đúng `R-CO-1…3`,
  `R-DAU-1…2`, `R-GIAO-1`).
- **Ô mẹo**: chân dung 40 viền trắng 2 (cờ: Tiểu Mặc, Đấu chữ: Mặc Ông) + bong bóng bo 4 14 14 14, nền vàng 16 %, viền vàng
  60 %, "Mẹo của <tên>" 12/700 + lời 14 trong ngoặc kép.
- **Đấu chữ chưa học bộ nào** (`R-DAU-1`): thêm ô báo đầu vùng cuộn (nền vàng 16 %, viền `gold`, biểu tượng ngọn lửa 22,
  tiêu đề 15/700 `guideDuelNoneTitle` + đoạn 14 `guideDuelNoneBody`); phần còn lại như thường (đọc luật trước được).
- **Ngang**: kính sương trái / phải 12 + safe (47), trên 12, dưới 12 + safe (21). Đầu bảng một hàng (đệm 12 16 10): eyebrow +
  tên Hán 28 + Việt Lora 18 + giới thiệu 13 cùng hàng; phải nút "Đóng" cao 44. Thân 2 cột (248 | còn lại, cách 16): trái
  hình minh hoạ (lưới 104) + ô mẹo (chân dung 36, chữ 13); phải 4 mục cuộn (vòng 24, tiêu đề 14, đoạn 14 dòng 1,45).
- Không có nút "Vào bàn" trong bảng: biển cách ghế gần nhất ~2,5 m, chỉ vào bàn được trong 1,5 m của ghế (`R-GIAO-1`).
- Chuỗi: `guide*`. Luật: `R-GIAO-1/2`, `R-CO-1/2/3`, `R-DAU-1/2`, `R-MAN-1`.
- Ảnh: nền giữ chỗ `screens/Canh-bien-ngu-tu-ky.png`, `Canh-bien-tro-choi.png`; màn ghép chưa có ảnh.

## Trò chuyện kênh chung (HUD) · artboard `Chat-doc.dc.html`, `Chat-doc-go.dc.html`, `Chat-ngang.dc.html`, `Chat-ngang-go.dc.html`, `Chat-trang-thai.dc.html` · từ mục 2026-11-14.9

- Mục đích: gõ một câu ngắn lên kênh chung của tông môn → bong bóng trên đầu người nói + một dòng trong khung kênh
  (`R-CHAT-1/2/3`). Chưa có máy chủ: chỉ mình + NPC nói câu có sẵn, nhưng thiết kế như có nhiều người (Vân Nhi, Lâm Phong
  trong artboard là người chơi giả).
- **Nút "Trò chuyện"**: tròn 48 kính sương (như nút Chào / Ngồi ôn), biểu tượng bóng thoại có 2 dòng 24, nhãn 11/700
  "Trò chuyện" dưới. Đặt **bên phải, ngay trên cụm hành động** — dọc: phải 20, dưới 238 (≈ 188 + safe); ngang: phải safe
  + 16, dưới 214. Góc trên vẫn trống (`R-HUD-1`). Đang nhấn: thu 94 %, nền tối hơn.
- **Khung kênh thu gọn** (khi đi lại): trái 16 (ngang: safe + 12), ngay trên joystick (dọc: dưới 184; ngang: dưới 145),
  rộng ≤ 250 (ngang 300). 3 tin cuối, mỗi tin một viên kính `frost` .78 bo 8 đệm 3 9, chữ 13 dòng 1,35, tên đậm; mờ
  .55 / .8 / 1 (cũ → mới). Tin NPC: nền `map-paper` .88, tên `jade` + chữ Hán. Tên mình "Ta" `jade`. **Không bắt chạm**
  (`pointer-events: none`) → không chặn joystick (`R-DIEU-1`). Im lặng 10 giây → mờ hết; tin mới → hiện lại.
- **Bấm nút → ô nhập + khung mở rộng**; bàn phím máy bật lên. Joystick, cụm hành động, khung thu gọn ẩn.
  - Ô nhập: thanh kính .96 sát mép trên bàn phím (cao 64, đệm 10 12; ngang: đệm 10 + safe), ô trắng cao 44 bo 12 viền
    `jade` 2 (đang gõ), chữ 15; gợi ý `chatHint` `slate` 55 %. Nút **"Gửi"** `jade` 44 bo 12, biểu tượng giấy bay 18 +
    chữ 15/700; ô rỗng → mờ (`jade` 35 %).
  - Đếm chữ: **chỉ hiện từ 50 chữ** ("54/60" 12/700 trong ô, phải 10). **Quá 60** (thường do dán): không cắt chữ; viền
    `lacquer` 2, số `lacquer`, dòng dưới `chatTooLong` 12/700 `lacquer`, Gửi mờ.
  - Gửi lại dưới 1,5 giây: Gửi mờ + vòng chờ 18 quay hết 1,5 s, dòng dưới `chatWait` 12/700.
  - **Gửi xong → đóng ô nhập** (bàn phím hạ, về cảnh, thấy ngay bong bóng của mình). Đóng khác: × của khung, chạm cảnh
    phía trên khung, nút quay lại của máy. Máy tính: **Enter** mở / gửi, **Esc** đóng; đang gõ phím không điều khiển nhân vật.
  - Khung mở rộng (dọc): trái / phải 12, đáy cách ô nhập 8, cao 260, kính .93 bo 16. Đầu 44: chấm vàng 6 + "Kênh chung"
    15/700 + 傳音 14 `jade` + nút × 44. Danh sách bám đáy (tin mới nhất dưới cùng), mỗi tin đệm 5 8 bo 10: tên 13/700 +
    giờ 11 (`slate` 70 %), nội dung 14 dòng 1,4. Dòng của mình nền `answer-right-bg`, tên "Ta" `jade`; dòng NPC nền
    `map-paper` .85, tên `jade` + chữ Hán. Mép trên mờ dần 24; thanh cuộn 3 px. Đang cuộn xem tin cũ mà có tin mới →
    viên "Tin mới · n ↓" `jade` cao 32 giữa đáy; chạm → cuộn xuống cuối. Rỗng: `chatEmpty` 14/700 + `chatEmptySub` 13 giữa khung.
  - Ngang (bàn phím ≈ 200): khung gọn trái safe + 12, trên 12, rộng 470, cao 104 (tin một dòng: tên đậm + nội dung 13);
    cột phải 44 có × và 傳音 dọc; ô nhập ngay dưới.
- **Bong bóng trên đầu** (`R-CHAT-2`): neo trên nhãn tên (đuôi cách nhãn 4), đi theo đầu như nút học nổi. Bo 12, đệm 7 11,
  chữ 14/500 dòng 1,4 (ngang 13, đệm 6 10), rộng tối đa 168 (ngang 200) → 60 chữ ≤ 3 dòng; đuôi vuông 12 xoay 45°; bóng
  `0 4px 12px rgba(36,50,58,.18)`. Ba kiểu: **mình** kính .95 viền `jade` 1,5 · **người khác** kính .94 viền
  `frost-outline` · **NPC** `map-paper` viền vàng 75 %. Chữ Hán trong câu: Noto Serif SC 700 `jade`.
  - Vòng đời: hiện phóng 90 → 100 % trong 0,15 s · giữ tới 5 s · mờ dần 1 s cuối. Tin mới cùng người → thay ngay.
  - Hai bong bóng chồng nhau: bong bóng **cũ hơn** đẩy lên tới khi hở 6 px, nối xuống nhãn tên bằng vạch `jade` 1,5 (70 %)
    + chấm 6 thay cho đuôi.
  - Không vẽ: cách camera > 25 m, sau camera, đang mở bài học / thoại NPC / bàn chơi (tin vẫn vào khung).
- Ẩn nút + khung thu gọn khi: bài học / thẻ bộ thủ / bảng phủ, thoại NPC (`R-NPC-2`), ngồi bàn chơi, bản đồ, màn tải.
- Chuỗi: `chat*` trong `l10n/vi.arb`. Luật: `R-CHAT-1/2/3`, `R-DIEU-1`, `R-NPC-2`, `R-HUD-1`, `R-MAN-1`.
- Ảnh: nền giữ chỗ chụp từ Canvas 3D (`?chup&nv=5.6,14.6&cam=6.8,4.6,5.2&tam=6.6,14.6`, dọc 390×844 / ngang 844×390); bàn
  phím trong artboard chỉ là khối giữ chỗ — cao thật khác nhau Android / iOS, thử máy. Màn ghép chưa có ảnh.

## Ngồi ôn — nút, cuộn sách trên tay, bảng chọn (HUD + Flutter native) · artboard `NgoiOn-doc-ton-mon.dc.html`, `NgoiOn-doc-rung-truc.dc.html`, `NgoiOn-doc-chua-hoc.dc.html`, `NgoiOn-doc-du-50.dc.html`, `NgoiOn-ngang-ton-mon.dc.html`, `NgoiOn-ngang-chua-hoc.dc.html`, `NgoiOn-nut-trang-thai.dc.html`, `NgoiOn-cuon-sach.dc.html` · từ mục 2026-11-14.10

- Mục đích: ngồi xuống ở bất kỳ đâu để ôn / học bộ thủ. Thay nút Thiền / Tu luyện và chữ Hán hiện trên đầu lúc nhập
  định (mục 2026-11-13.19 — phần đó bỏ). Luật: `R-DIEU-7`, `R-ON-8`, `R-ON-5`, `R-HANH-3`, `R-VUNG-1`, `R-NGOI-1`.
- **Nút "Ngồi ôn"** (cụm hành động, đúng chỗ + cỡ nút Thiền cũ: tròn 52 kính sương, nhãn 11/700 dưới):
  - Biểu tượng 24 (nét 2): người ngồi xếp bằng trên bồ đoàn, cuộn sách mở trước ngực — đầu tròn r 2,2; hai trục đứng
    x = 6 / 18; giấy 9 × 4,6 với một dòng chữ; chân + đệm như biểu tượng cũ. SVG đúng trong `NgoiOn-nut-trang-thai`.
  - Trạng thái: thường "Ngồi ôn" · chấm son số bộ đến hạn (vd. "4") · không bộ đến hạn mà ở vùng có bài học → số bộ
    chưa học (vd. "47") · từ 100 → "99+" (chấm giãn ngang, min 22) · đang ngồi "Đang ôn" (nền `jade`, viền `gold` 2 +
    quầng 4, chữ nhãn `jade`, ẩn chấm) · đang bay mờ (như Chào). Chấm son giữ nguyên thành phần 2026-11-13.19.
  - Trợ năng: "Ngồi ôn" · "Ngồi ôn, còn {n} bộ đến hạn" · "Ngồi ôn, còn {n} bộ chưa học" · "Đang ôn, bấm để đứng dậy".
    Máy tính: phím C.
- **Cuộn sách trên tay** (vật 3D, code dựng — tờ `NgoiOn-cuon-sach`):
  - Dáng: cuộn tay (手卷) mở ngang — 2 trục đứng + giấy giữa; không bám ngón tay, đặt theo hướng mặt nhân vật.
  - Cỡ (nhân vật đứng ≈ 1 m, ngồi ≈ 0,62 m): trục dài 0,22 m, Ø 0,03 (trụ 8 cạnh), đầu trục cầu Ø 0,04; giấy mở hết
    0,26 × 0,18 m (mặt phẳng; cong 6 đoạn nếu rẻ). Gần đúng — chỉnh theo model nhân vật.
  - Chỗ: tâm cao 0,30 m, trước tâm thân 0,18 m theo hướng mặt; mặt giấy ngửa 30° về phía mặt.
  - Màu: trục `scroll-wood`, đầu trục `jade` viền `gold` (như cuộn bản đồ); giấy `map-paper`; mặt sau (camera
    thường thấy) màu giấy × 0,95 + ấn son `lacquer` 0,03 m ở góc. Lambert, không sáng.
  - Nhịp: 0 s ngồi, nút "Đang ôn", cần điều khiển "kéo để đứng dậy" · 0 → 0,3 s vòng sáng nở dưới đệm (giữ như cũ) ·
    0,3 s hai trục hiện chập nhau (phóng 0 → 1 trong 0,15 s) · 0,45 → 1 s hai trục trượt ra, giấy giãn ngang (chậm dần)
    · 1 s bảng chọn hiện (mờ → rõ + trượt xuống 12 px, 0,2 s).
  - Đứng dậy trước 1 s → vòng sáng + cuộn tắt dần 0,2 s, không có bảng. Bấm "Đứng dậy" trên bảng → bảng mờ 0,15 s →
    hai trục chập về giữa 0,25 s → tắt → đứng. Mở thẻ học / màn ôn / Bộ đã học → cuộn giữ mở; đóng → bảng hiện lại
    ngay (không chạy lại nhịp 1 s).
- **Bảng chọn** (Flutter, đè lên cảnh; cảnh tối 16 % `rgba(36,50,58,.16)`; cần điều khiển + cụm nút + nút Trò chuyện
  ẩn khi bảng mở — nhân vật đứng yên): **cuộn treo (掛軸)**.
  - Trục trên + dưới: cao 14 (ngang 12), rộng hơn giấy 10 mỗi bên, bo 7, gỗ `scroll-wood` (dải sáng #5A3A28 → tối
    #2A190F), bóng 0 2 4; đầu trục tròn 18 (ngang 16) `jade` viền `gold` 2, nhô ra 14 (12).
  - Giấy `map-paper`, viền trong 5 `jade` 12 % + 1 gỗ 18 % (viền bồi lụa); đệm 16 / 16 / 18 (ngang 10 / 12 / 12); bóng
    cả cuộn 0 10 24 `slate` 32 %.
  - Đầu: dòng nơi đang ngồi 12/700 `#5E6A70` (vd. "Quảng trường · Văn Uyên Tông", "Lối Rừng trúc") + "Ngồi ôn" Lora 22
    (ngang 18); bên phải ấn son 溫故 (chữ dọc Noto Serif SC 15, nền `lacquer`, chữ trắng, bo 4, title "Ôn cũ biết mới").
    Dưới: vạch chấm vàng (như thẻ bộ thủ).
  - 3 mục (nút, cao tối thiểu 68 dọc / 52 ngang, bo 12, cách 10 / 6): vòng biểu tượng 36 (30) + tiêu đề 16/700 (14) +
    dòng phụ 13 (12) + mũi tên ›.
    - **Nổi bật**: nền `jade`, chữ trắng, dòng phụ trắng 88 %, bóng như nút chính. Còn bộ đến hạn → Ôn; không thì Học bộ
      mới (nếu dùng được); không mục nào dùng được → không nổi bật.
    - **Thường**: nền trắng 72 %, viền gỗ 22 %, biểu tượng `jade` trên nền `jade` 10 %.
    - **Mờ** (`aria-disabled`): nền trắng 30 %, viền **nét đứt** gỗ 30 %, chữ `#5E6A70` (≥ 4,5:1 trên giấy), dòng lý do
      có biểu tượng 14: ✓ `jade` ("Hôm nay đã ôn xong", "Đã học đủ") · ghim ("Học ở Rừng trúc") · gạch ("Chưa học bộ nào",
      "Chưa có bộ nào để ôn"). Không có mũi tên.
    - Dòng phụ khi dùng được: Ôn → các bộ đến hạn "竹 trúc · 木 mộc · mỗi bộ 2 câu" (cắt "…" nếu dài) · Học bộ mới →
      "Bộ kế tiếp: 山 sơn — núi" · Xem → "5 / 50 bộ · <4 bộ học gần nhất>". Ôn khi n = 0 không ghi "(0)".
  - Chưa học bộ nào: thêm khung gợi ý (nền `jade` 8 %, viền `jade` 28 %, bo 12, biểu tượng bản đồ) "Chưa học bộ nào. Đến
    Truyền Tống Đài, chọn **Rừng trúc** rồi Ngồi ôn để học bộ đầu tiên." Học đủ 50 → dòng `jade` 13/700 giữa hai chấm
    vàng "Đã học đủ 50 bộ thủ Rừng trúc".
  - Cuối: "Đứng dậy" — nút phụ viền `slate` 45 % 1,5, cao 48 (ngang 40), biểu tượng mũi tên lên + vạch. Máy tính: Esc =
    Đứng dậy; ↑ ↓ + Enter chọn mục.
- Bố cục dọc 390×844: cuộn ở **nửa trên** — trái 16, rộng 358, trục trên ở y 57 (dưới safe 47 + 10); cao theo nội dung
  (≈ 440–500). Nhân vật ngồi ở nửa dưới màn, không bị che.
- Bố cục ngang 844×390: cuộn **bên phải** — trái 499, rộng 284 (phải = safe 47 + 13), trên 10; nhân vật giữa-trái.
- Trạng thái đã vẽ: a. tông môn, 2 bộ đến hạn, đã học 5 (Ôn nổi bật, Học mờ "Học ở Rừng trúc") · b. Rừng trúc, không bộ
  đến hạn, đã học 3 (Học nổi bật, Ôn mờ "Hôm nay đã ôn xong") · c. tông môn, chưa học bộ nào (cả 3 mờ + gợi ý) · d. Rừng
  trúc, đủ 50, không bộ đến hạn (Ôn + Học mờ, Xem thường). Ngang: a, c.
- Chuỗi: `actionSit`, `actionSitting`, `actionSitLabel`, `actionSitDueLabel`, `actionSitNewLabel`, `actionSitOnLabel`,
  `reviewScroll`, `reviewScrollSeal`, `reviewDue`, `reviewDueNone`, `reviewDueDone`, `reviewDueNothing`, `reviewDueSub`,
  `learnNew`, `learnNewNext`, `learnAtForest`, `learnAllDone`, `learnAllDoneBanner`, `viewLearned`,
  `viewLearnedSub`, `viewLearnedNone`, `hintGoForest`, `standUp`.
- Ảnh: chưa có ảnh (nền cảnh trong artboard là hình vẽ giữ chỗ — cuộn sách chưa có trong code).

## Bộ đã học (Flutter native) · artboard `BoDaHoc-doc.dc.html`, `BoDaHoc-doc-day.dc.html`, `BoDaHoc-ngang.dc.html` · từ mục 2026-11-14.10

- Mục đích: xem lại các bộ thủ đã học, mở lại thẻ. Mở khi: chọn "Xem bộ đã học" trên cuộn sách Ngồi ôn. Đóng: nút ‹
  "Về cuộn sách" (hoặc nút quay lại của máy) → về bảng chọn, vẫn ngồi (R-ON-8).
- Nền + vùng an toàn như màn ôn câu đố (`#E9EEEC` + hai lớp núi).
- Đầu: nút tròn 44 kính "Về cuộn sách" · "Bộ đã học" Lora 22 (ngang 19) + dòng 12 `#5E6A70` "Chạm một bộ để mở lại
  thẻ" (ngang: dòng này đứng cuối hàng đầu) · viên đếm "{n} / 50 bộ" (cao 28, nền `jade` 10 %, chữ `jade` 13/700).
- Dòng chú thích 12: mẫu chấm "bậc nhớ (1 → 7)" · "{n} bộ đến hạn" (`lacquer` 700, chỉ khi có) · "Xếp theo thứ tự học".
- Lưới: dọc 3 cột cách 9, ô cao 132; ngang 6 cột cách 8, ô cao 106. Cuộn dọc; có mờ đáy 56 + thanh cuộn 4.
- **Ô một bộ** (nút, bo 14, kính .9, viền `slate` 16 %; bộ đến hạn viền `lacquer` 45 %): chữ Noto Serif SC 40 (ngang 30)
  `jade` · tên Hán Việt 14/700 (13) · 7 chấm 6 (cách 3) — chấm thứ k tô `jade` khi bậc ≥ k (bậc 1…7 = 1 · 3 · 7 · 14 ·
  30 · 60 · 120 ngày, R-ON-1), còn lại `slate` 18 % · đáy: viên "Đến hạn" (cao 20, nền `lacquer` 10 %, chữ `lacquer`
  11/700) hoặc "Ôn sau {n} ngày" 11 `#5E6A70`. Trợ năng: "<chữ> <tên> — <nghĩa>, bậc k, đến hạn ôn / ôn sau n ngày".
- Chạm một ô → thẻ học bộ thủ (đã có, 2026-11-13.9) với huy hiệu "Đã học" + nút "Xuất định": đóng thẻ, về cuộn sách
  (đúng R-HANH-3 — không quay lại lưới).
- Trạng thái đã vẽ: 3 bộ (dọc) · 50 bộ cuộn (dọc + ngang). Chưa học bộ nào → không mở được (mục mờ trên cuộn sách).
- Chuỗi: `learnedTitle`, `learnedHint`, `learnedCount`, `learnedLegend`, `learnedDueCount`, `learnedOrder`,
  `learnedDue`, `learnedNextIn`, `learnedBack`, `learnedItemLabel`.
- Ảnh: chưa có ảnh.

## Ví Văn tiền + hiệu ứng nhận tiền (HUD + Flutter) · artboard `VanTien-HUD-doc.dc.html`, `VanTien-HUD-ngang.dc.html`, `VanTien-vi-trang-thai.dc.html`, `VanTien-hieu-ung.dc.html` · từ mục 2026-11-14.12

- Mục đích: cho thấy số Văn tiền 文錢 đang có và mỗi lần được thưởng. Luật: nhóm `R-TIEN-*` (đang soạn — ý tưởng
  `docs/y_tuong/2026-11-14-van-tien.md`), `R-HUD-1`, `R-MAN-1`.
- **Ví**: viên kính sương .86 (viền trắng + ngoài `slate` 16 %, bóng `shadow.hud`), cao 36 (`size.wallet`), đệm 0 12 0 5;
  đồng xu 26 + số 15/700 `slate`, số đều (tabular), ngăn nghìn bằng dấu cách ("1 280", "99 999"). Trợ năng "Văn tiền: {n}".
  - Chỗ: **góc trên phải** — dọc: phải 16, trên safe + 10 (57); ngang: phải safe + 12 (59), trên 12. Lý do: quy ước game,
    ngoài tầm ngón cái, nửa dưới đã kín. R-HUD-1 chỉ cấm chip tên khu + nút đổi góc nhìn.
  - Ẩn khi: mở bài / thẻ học / màn ôn / bản đồ / thoại NPC / bàn cờ / bất kỳ màn Flutter (như các nút HUD khác).
  - Trạng thái: thường · số lớn (viên giãn ngang, không thu chữ) · **vừa cộng**: viền `jade` 2 + quầng 5 `jade` 18 %, số
    đếm lên 0,6 s, viên "+n" `jade` (cao 22, chữ trắng 12/700) dưới ví 1,5 s rồi mờ · **vừa mua**: viền + viên "−n" `lacquer`,
    đếm xuống 0,4 s (hiện khi về cảnh sau khi mua) · 0 (vẫn hiện, không âm).
  - Chạm ví → thẻ "Văn tiền kiếm từ đâu" (rộng 250, kính .96, bo 14): 6 dòng nguồn + mức, dòng "Trò chơi tối đa 60 Văn tiền
    mỗi ngày. Hôm nay: {x} / 60.", "Tiêu ở Tạp hoá phố chợ." Đóng khi chạm chỗ khác hoặc sau 4 s.
- **Đồng xu**: tròn, vành `coin-rim`, mặt `gold`, vòng trong #B88F3A, lỗ vuông 24 % (viền #8A6A2A, lòng ngà #F4F0E6).
  Xu ≥ 30 px khắc chữ `coin-ink` Noto Serif SC: mặt trước 文 (trên) 錢 (dưới); mặt sau một chữ — chữ / bộ thủ của việc vừa
  làm (học, ôn). Nhiệm vụ / chuỗi / trò → mặt trước. Xu trong ví (26) và nhỏ hơn: không khắc.
- **Hiệu ứng nhận tiền**:
  - Số xu bay = 1 xu / 5 Văn tiền, tối đa 5, cách nhau 0,06 s; bay cong từ nguồn tới ví 0,6 s, xoay; mỗi xu chạm ví → ví nảy
    1,08×. Sau đó viên "+n" + **nhãn lý do** dưới ví (cách 8): viên kính .94 cao 28, viền ngoài `jade` 35 %, xu 20 + chữ
    13/700, giữ 1,2 s rồi mờ 0,3 s. Nhiều khoản cùng lúc → nhãn xếp hàng nối nhau.
  - Nguồn trên HUD: điểm màn của vật nguồn (bảng nhiệm vụ, bàn trò). Trên màn Flutter (thẻ học, màn ôn, bảng nhiệm vụ):
    màn che HUD → một **ví tạm** trượt vào góc trên phải màn Flutter (0,2 s), xu bật ra từ nút vừa bấm; xong mờ cùng nhãn.
  - Hiệu ứng không chặn bấm; thẻ học vẫn đóng như R-HANH-3. Giảm chuyển động → không bay, chỉ đếm số + nhãn.
  - Nhãn: "+10 · Học bộ 竹" · "+5 · Ôn đúng 木" (1/2: "+2 · Ôn 木") · "+20 · Xong nhiệm vụ ngày" · "+50 · Chuỗi 7 ngày" ·
    "+8 · Thắng Đấu chữ" / "+5 · Hoà …" / "+3 · Thua …" · "+10 · Đọc xong chương". Trò chạm trần ngày: nhãn mờ (viền nét đứt,
    chữ `slate-muted`, không xu) "Hôm nay trò chơi đã đủ thưởng".
- Chuỗi: `coinName`, `walletLabel`, `walletSourcesTitle`, `walletSource*`, `walletGameCap`, `walletSpendHint`,
  `reward*`, `rewardGameCapped`.
- Ảnh: chưa có ảnh.

## Tạp hoá 雜貨 — cửa hàng đồ trang trí (Flutter native) · artboard `CuaHang-doc.dc.html`, `CuaHang-doc-ngheo.dc.html`, `CuaHang-doc-xac-nhan.dc.html`, `CuaHang-doc-vua-mua.dc.html`, `CuaHang-doc-het.dc.html`, `CuaHang-ngang.dc.html` · từ mục 2026-11-14.12

- Mục đích: mua đồ trang trí Nhà của ta bằng Văn tiền. Mở khi: nói chuyện chủ tiệm / nút nổi ở tiệm tạp hoá phố chợ Khởi
  Nguyên Trấn (`cua-hang`). Đóng: nút "Đóng" / quay lại → về cảnh; màn mở thì nhân vật đứng yên. Luật: `R-TIEN-*` (mua),
  `R-NHA-4` (sở hữu — sẽ sửa), `R-NHA-2`.
- Nền + safe area như Danh mục sách (`#E9EEEC` + hai lớp núi).
- Đầu: ấn son 雜貨 (chữ dọc 15, nền `lacquer`, bo 4) + "Tạp hoá" Lora 22 (ngang 19) + dòng 12 `slate-muted` "Đồ trang trí
  Nhà của ta · mua một lần, đặt được nhiều ô"; bên phải **ví** (như HUD, có trạng thái vừa trừ).
- Tab lọc (viên cao 34, ngang 30; đang chọn nền `slate` chữ trắng; còn lại trắng 60 % viền `slate` 20 %): Tất cả · Vườn ·
  Sân · Trong nhà. "Tất cả" chia nhóm, tiêu đề nhóm 12/700 chữ hoa `slate-muted`.
- Lưới: dọc 3 cột, ngang 5 cột, cách 8; cuộn dọc, mờ đáy 40.
- **Thẻ vật** (bo 14, đệm 8 / 6; chưa có: nền trắng, đã có: trắng 55 %; viền `slate` 14 %): ô hình cao 64 (ngang 50) nền
  `map-paper` bo 10 — hình vật (bản vẽ phẳng giữ chỗ; code có thể thay ảnh chụp vật 3D) + chữ Hán 16 `jade` góc trên phải ·
  tên 13/700 (cắt "…") · giá: xu 14 + số 12/700 + số chữ Hán 10 `slate-muted` ("160 · 一百六十文") · nút cao 34 bo 10:
  - **Mua**: nền `jade`, chữ trắng 13/700.
  - **Đã có**: nền `jade` 10 %, dấu ✓ + "Đã có" `jade`; không bấm được.
  - **Còn thiếu {n}**: viền nét đứt `slate` 35 %, chữ 12/700 `slate-muted`, `aria-disabled`.
  - Đang chọn (hộp xác nhận mở): viền ngoài `gold` 3, cách 2.
- **Xác nhận** (tấm đáy như Danh mục sách, cảnh tối 28 %): hình 76 + "Mua {vật} {chữ} với {n} Văn tiền?" 16/700 + "Đặt ở ô
  {loại} · mua một lần, đặt được nhiều ô" · bảng Đang có / Giá (−n `lacquer`) / Còn lại · nút "Thôi" (phụ) + "Mua · n"
  (`jade`, xu 20).
- **Vừa mua**: tấm báo nền `slate` chữ trắng (hình 48 + "Đã mua {vật}" + "Về nhà để đặt — chạm ô {loại} khi trang trí."),
  3 s; ví trừ ("−160"); thẻ đổi "Đã có". Không tự đưa về nhà.
- **Nghèo**: dải gợi ý (nền `gold` 14 %, viền `gold`) "Học bộ mới +10 · ôn đúng hạn +5 · xong nhiệm vụ ngày +20".
- **Đã mua hết**: dải `jade` 8 % "Đã có đủ 13 món. Văn tiền để dành cho đồ mới sắp về (đồ mặc, thức ăn linh thú)."
- Ngang 844×390: đầu + ví một hàng; tab + nút "Đóng" (cao 30) một hàng; lưới 5 cột.
- **Bảng giá đề xuất** (30–200): Trúc cảnh 竹 30 · Đèn lồng 燈 30 · Tranh chữ 書 40 · Chậu lan 蘭 50 · Mai 梅 60 · Lư hương
  爐 70 · Tùng 松 80 · Án đọc 案 90 · Bàn trà 茶 100 · Kệ sách 架 120 · Bình phong 屏 150 · Đá Thái Hồ 石 160 · Ao sen 蓮 200.
  Số chữ Hán: 三十, 四十, 五十, 六十, 七十, 八十, 九十, 一百, 一百二十, 一百五十, 一百六十, 二百 + 文.
- Chuỗi: `shopName`, `shopSubtitle`, `shopTabAll`, `slotGarden`, `slotYard`, `slotIndoor`, `shopBuy`, `shopOwned`,
  `shopShort`, `shopConfirm`, `shopConfirmSub`, `shopHave`, `shopPrice`, `shopAfter`, `shopCancel`, `shopBuyFor`,
  `shopBought`, `shopBoughtSub`, `shopPoorHint`, `shopAllBought`, `shopClose`.
- Ảnh: chưa có ảnh.

## Danh mục trang trí — thẻ vật có / đang đặt / khoá (mở rộng HUD trang trí) · artboard `TrangTri-the-vat.dc.html` · từ mục 2026-11-14.12

- Bổ sung cho bảng danh mục của phiếu `2026-11-14-nha-nguoi-dung` (chưa vẽ bố cục bảng) khi có tiền tệ.
- Thẻ (rộng theo lưới, bo 14, đệm 8): ô hình 72 nền `map-paper` + chữ Hán 16 góc trên phải · tên 13/700 · dòng trạng thái 12.
  - **Đang đặt ở ô này**: viền `jade` 2, dấu chọn tròn 20 `jade` góc trên trái, dòng "Đang đặt ở ô này" `jade` 700.
  - **Đã có**: thẻ trắng, dòng "Đã có" `slate-muted`. Chạm → đặt / thay (R-NHA-2).
  - **Chưa có**: nền trắng 45 %, viền nét đứt `slate` 35 %, hình xám mờ 45 % + khoá tròn 30 (`slate` 75 %), chữ Hán
    `slate-muted`, dòng "xu + giá · Mua ở Tạp hoá". Chạm → thẻ nhỏ "Mua {vật} ở Tạp hoá phố chợ — {n} Văn tiền (đang có {m})".
    **Không mua trong nhà.**
- Xếp: đã có trước, chưa có sau (rẻ → đắt).
- Vật khởi đầu (đề xuất, chờ luật): Trúc cảnh 竹 · Đèn lồng 燈 · Tranh chữ 書.
- Chuỗi: `decorPlacedHere`, `decorOwned`, `decorBuyAtShop`, `decorBuyAtShopDetail`.
- Ảnh: chưa có ảnh.

## Nhà của ta 我家 — nơi trên bản đồ, nút Trang trí, chế độ trang trí (HUD) · artboard `NhaTa-ban-do.dc.html`, `NhaTa-doc.dc.html`, `NhaTa-doc-trang-tri.dc.html`, `NhaTa-doc-o-trong.dc.html`, `NhaTa-doc-o-co-vat.dc.html`, `NhaTa-doc-the-khoa.dc.html`, `NhaTa-ngang.dc.html`, `NhaTa-ngang-o.dc.html` · từ mục 2026-11-14.13

- Mục đích: tiểu viện riêng của người chơi; đặt / thay / gỡ đồ trang trí vào các ô đặt sẵn. Luật: `R-NHA-1`…`R-NHA-4`,
  `R-HUD-3` (không thẻ tên khu — mục 4 của phiếu bỏ), `R-MAN-1`; thẻ vật theo mục 2026-11-14.12 (Văn tiền).
- **Bản đồ truyền tống**: nơi mới `nha-ta` 我家 "Nhà của ta" trong vùng **Trung Nguyên**, toạ độ ảnh **(1190; 560)**, vùng chạm
  **r 80** (riêng — nhỏ hơn 105 để không chồng vùng chạm Khởi Nguyên Trấn). Biểu tượng tiểu viện (tường viện thấp, nhà mái xám
  cửa son, khóm trúc trái, đèn lồng đỏ phải) trên đĩa giấy, nhãn Việt như các nơi khác. Luôn mở. Đã vẽ lại
  `scene/ban-do/ban-do-goc.png` (`ve-ban-do.html` thêm `PLACES` + `ICONS['nha-ta']`, `r` riêng từng nơi) và thêm mục `noi` +
  vùng `trung-nguyen` trong `ban-do.json`. Ảnh mẫu trạng thái `screens/BanDo-trang-thai.png` vẽ lại.
- Màn tải: thành phần có sẵn, "Nhà của ta" + 我家.
- **Nút "Trang trí"** (chỉ ở Nhà của ta; ẩn khi bản đồ / thoại / ngồi / màn Flutter): tròn 52 kính sương, biểu tượng mái nhà +
  bút 24 (nét 2), nhãn 11/700 dưới. Dọc: phải 20, dưới 310 (trên nút Trò chuyện). Ngang: phải 127, dưới 214 (trái nút Trò chuyện).
- **Chế độ trang trí** (bấm nút): ẩn cần điều khiển, cụm nút hành động, nút Trò chuyện, khung kênh; **giữ ví** (góc trên phải).
  Nhân vật đứng yên; kéo màn vẫn xoay camera (R-NHA-2).
  - Viên nhắc trên trái (dọc: trái 16, trên 57; ngang: trái 59, trên 12): kính .92 cao 36, vòng `jade` 24 biểu tượng bút + chữ
    13/700 "Chạm một ô để đặt vật" (đang chọn ô: tên loại ô, vd. "Ô vườn").
  - Nút **"Xong"**: viên `jade` cao 40, viền trắng 2, ✓ + chữ 14/700; dọc: phải 16, trên 103 (dưới ví); ngang: dưới ví (khi bảng
    mở: sát trái bảng, trên 12).
  - **Dấu ô trong cảnh** (code vẽ, neo theo ô như nút nổi): vòng elip trên nền (rx 34 ry 11 ở dọc): trống = nền trắng 35 % viền trắng
    nét đứt 2,5 · có vật = nền `aura-light` 35 % viền `gold` · đang chọn = nền `jade` 22 % viền `jade` 3 + quầng `jade` 45 %.
    Nút tròn 40 nổi trên ô (trống: cách nền 40; có vật: trên đỉnh vật): kính .9, "+" khi trống / biểu tượng loại ô khi có vật;
    đang chọn: nền `jade` chữ trắng, viền trắng 2 + quầng `jade` 35 %. Huy hiệu loại ô 18 góc dưới phải: lá (Vườn), đèn (Sân),
    mái nhà (Trong nhà).
  - **Chạm ô → bảng danh mục**: dọc = tấm đáy cao 392 (bo trên 20, kính .96, tay nắm 40×4); ngang = cột phải rộng 310 (từ mép
    safe phải, bo trái 20). Đầu: vòng loại ô 34 + "Ô vườn 園" 16/700 + dòng 12 `slate-muted` ("Chọn vật để đặt vào ô" / "Chạm vật
    khác để thay"); nút **"Gỡ"** (viền `lacquer` 60 % 1,5, chữ `lacquer` 13/700, cao 36) chỉ khi ô có vật. Lưới 3 cột cách 8
    thẻ vật hợp loại ô (kiểu thẻ 2026-11-14.12: đang đặt viền `jade` 2 + dấu chọn · đã có · khoá nét đứt + giá "· Tạp hoá"),
    đã có trước, khoá sau. Chân bảng: xu 14 + "Vật có khoá: mua ở Tạp hoá phố chợ · mua một lần, đặt được nhiều ô".
  - Chạm thẻ đã có → vật hiện ngay ở ô, bảng vẫn mở để đổi tiếp. Chạm thẻ khoá → tấm báo `slate` "Mua {vật} ở Tạp hoá phố chợ —
    {n} Văn tiền (đang có {m})", 3 s. Chạm ô khác → bảng đổi theo ô đó. Chạm cảnh trống / kéo tay nắm xuống → đóng bảng (vẫn ở chế
    độ trang trí). "Xong" → thoát hẳn.
- Trạng thái đã vẽ: dọc — đi lại (nút Trang trí) · chế độ trang trí chưa chọn ô · ô vườn trống · ô có vật (Gỡ) · chạm thẻ khoá;
  ngang — đi lại · ô có vật (bảng cột phải).
- Chuỗi: `homeName`, `decorButton`, `decorHint`, `decorDone`, `decorRemove`, `decorSlotGarden`, `decorSlotYard`,
  `decorSlotIndoor`, `decorPick`, `decorReplace`, `decorFooter` (+ `decorPlacedHere`, `decorOwned`, `decorBuyAtShop*` của 2026-11-14.12).
- **Theo cảnh thật** (`design/scene/nha-ta.json`, mục 2026-11-14.15): **Vườn ở phía đông** (bên phải khi đứng ở cổng nhìn vào nhà, sau
  cổng trăng), Sân trước phía tây + trước nhà, ô Trong nhà sát tường sau nhà chính; vòng trận về ở (0; 7) ngay sau cổng. Nền các artboard
  (vườn vẽ bên trái) chỉ là hình giữ chỗ — **vị trí ô, dấu ô, camera lấy theo cảnh**, không theo artboard. Bảng danh mục / nút / viên
  nhắc giữ nguyên số đo ở trên.
- Ảnh: `screens/BanDo-trang-thai.png` (bản đồ có Nhà của ta); cảnh nhà: `screens/Canh-nha-ta.png`, `screens/Canh-nha-ta-tren.png`;
  màn HUD trang trí: chưa có ảnh.
