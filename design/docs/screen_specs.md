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
  trạng thái: `design/scene/ban-do/ban-do.json`. Đường đi "rắn": hàng dưới trái → phải (Văn Uyên · Rừng trúc · Giang Nam ·
  Bồng Lai), rẽ lên Trường Thành, hàng trên phải → trái (Tử Cấm Thành · Tơ lụa). Chữ trên giấy: Hán 92 Noto Serif SC
  `slate`, Việt 62 Be Vietnam Pro 700 `jade`, viền giấy 14.
- **Lớp trạng thái** (code vẽ chồng lên giấy, theo `ban-do.json`): đã mở (vòng ngọc lục + chấm vàng) · đang ở đây (như mở
  + triện son 此) · sắp mở (vòng nét đứt + huy hiệu đồng hồ) · khoá (đĩa giấy mờ + huy hiệu khoá) · vừa chạm nơi khoá
  (vòng son nhấp nháy 2 lần / 0,6 s). Ảnh mẫu: `screens/BanDo-trang-thai.png`. **Chữ yêu cầu không vẽ trên giấy** (dọc
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
- Trạng thái: **lần đầu** — nút "Đã học · khắc vào bia" (dấu ✓) → bia viền vàng; **đã học** — huy hiệu "Đã học" góc trên
  phải thẻ (viền `jade`, chấm vàng), nút "Về rừng trúc" (mũi tên trái); **hai dạng** (氵/水); **một dạng** (石 — lưu ý 竹
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
- Không đè: nút học nổi + nút "Nói chuyện" bám vật trong cảnh (phía trên); joystick nửa trái; chip + nút góc nhìn ở trên.
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
- Đang thoại: ẩn joystick, cụm nút hành động, nút góc nhìn, nút "Nói chuyện"; giữ chip tên khu; cảnh tối 18 %.
- Đã vẽ: câu chào (3 lựa chọn) · câu dài nhất "tu-chu" (2 lựa chọn) · ngang.
- Chuỗi: `talk`; lời thoại giữ trong dữ liệu hội thoại (`web/src/zones/dialogs.ts`).
- Ảnh: chưa có ảnh.
