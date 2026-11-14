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
  - Nhãn tên trên đầu nhân vật: cao 24, pill, padding 0 10, `frost` .88, chấm vàng 4 px + chữ 12/700 `slate`.
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
  Noto Serif SC `slate`, Việt 62 Be Vietnam Pro 700 `jade`, viền giấy 16 (đè lên màu khu).
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
