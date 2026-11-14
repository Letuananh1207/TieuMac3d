# Thành phần dùng lại

Đang có trong app (vẽ mẫu trên artboard "Bảng token"). Màn mới nên dùng lại trước khi nghĩ thành phần mới.

| Thành phần | Trong code | Token |
|---|---|---|
| Chip HUD (chấm trạng thái + chữ) | `web/index.html .chip`, CSS `.chip` | hud-glass, gold-line, paper, hud 13, pill |
| Nhãn tên trên đầu nhân vật | `#nameTag` / `.label`, `web/src/ui/hud.ts` | chữ trơn ngà #F4F1EA 13/700, viền mực .6 px + bóng mờ, không nền (2026-11-14.3) |
| Nút nổi trên cảnh | `.btns button` (`#btnCam`) | hud-glass, paper-line, hud 13, pill |
| Thẻ mời (eyebrow, tiêu đề có chữ Hán, nút chính + phụ) | `#card`, `web/src/ui/eventCard.ts` | ink, gold-line, eyebrow 11, card-title 17, accent 22, card 14, shadow.card |
| Nút chính / nút phụ | `button.primary` / `button` | lacquer · ink-2 + paper-line, body 15, pill |
| Bảng bài học (bảng đen khung gỗ) | `#lesson .board`, `web/src/ui/lessonBoard.ts` — **sẽ thay bằng màn Flutter ở mốc 3** | board, board-frame, board-chalk, board-text, han-hero, accent, board 6, shadow.board |
| Joystick (vòng + núm) | `#joy`, `#knob`, `#joyGhost`, `web/src/input/joystick.ts` | paper (trong suốt), ink |

## HUD hướng C (từ 2026-11-11.3 — thay các dòng HUD ở trên khi áp)

Một chất liệu: kính mờ `frost*` + viền `frost-line` / `frost-outline`, chữ `slate`, nhấn `jade`, chấm vàng `gold`.

| Thành phần | Artboard | Token |
|---|---|---|
| Chip tên khu (chấm vàng + "<nơi> · <khu>") | `HUD-thanh-phan`, `HUD-doc` | frost, frost-line, frost-outline, slate, jade, gold, hud 13, pill, shadow.hud, blur.hud |
| Nút nổi (góc nhìn) | `HUD-thanh-phan` | như chip; cao 44 |
| Nhãn tên | `HUD-thanh-phan` (cũ) | chữ trơn viền mực, không nền — 2026-11-14.3 |
| ~~Thẻ mời~~ — **bỏ** ở 2026-11-11.4 | — | — |
| Nút học nổi trên vật (chấm vàng + "Học chữ 快", mũi nhọn chỉ xuống) | `TrongNha-doc`, `TrongNha-ngang` | jade, on-jade, frost-line, gold, body 15, han 20, pill, shadow.primary |
| Thẻ tên khu (mới) | `HUD-doc-vao-khu`, `HUD-ngang-vao-khu` | frost-strong .80, area-han 52, area-name 20, jade, slate, gold |
| Dòng hướng dẫn | `HUD-doc`, `HUD-ngang` | frost .84, hud 13, radius 12 |
| Joystick (gợi ý / đang giữ) | `HUD-thanh-phan`, `HUD-doc-vao-khu` | frost-weak, frost-line, frost-outline, jade |
| Vạch trang trí (đường 1 px + chấm vàng giữa) | thẻ tên khu, màn tải | rgba(36,50,58,.3), gold |
| Màn tải (mới) | `ManTai-doc`, `ManTai-ngang` | mist, mist-far, mist-near, jade, slate, gold, loading-han 56, loading-title 24 |
| fps (chỉ gỡ lỗi) | `HUD-thanh-phan` | frost .8, mono 11 |

## Thêm ở 2026-11-13.9

| Thành phần | Artboard | Token |
|---|---|---|
| Cuộn bản đồ (trục + giấy, vật 3D) + lớp trạng thái 5 loại | `BanDo-giay`, `BanDo-doc` | map-paper, scroll-wood, jade, gold, lacquer, slate |
| Thẻ HUD "chưa đi được" (khoá / sắp mở) | `BanDo-doc`, `BanDo-ngang` | frost .92, lacquer 35 %, slate |
| Nút "Đóng bản đồ" (viên thuốc kính + ×) | `BanDo-doc` | frost .92, slate |
| Thẻ học bộ thủ (khung màn bài học) + dải "Từ hình đến chữ" | `TheBoThu-*` | mist, frost-strong, jade, lacquer, map-paper |
| Nút hành động tròn 68 / 52 (chính / kính) + nhãn | `HUD-hanh-dong-*`, `NutHanhDong-trang-thai` | jade, jade-press, frost, gold, action-main, action-sub |
| Nút "Nói chuyện" (kiểu nút học nổi + bảng tên) | `HUD-hanh-dong-*` | jade, frost |
| Khung thoại (chân dung, bảng tên, lời chạy, lựa chọn) | `HoiThoai-*` | frost .94, jade, slate, gold, dialog-option |

## Thêm ở 2026-11-13.19

| Thành phần | Artboard | Token |
|---|---|---|
| Chấm son đếm trên nút tròn | `TuLuyen-nut-trang-thai` | lacquer, count-badge |
| Vòng sáng nhập định (dưới đệm ngồi, vật 3D) + chữ hiện trên đầu | `TuLuyen-nhap-dinh-*`, `TuLuyen-trinh-tu` | aura-light, gold, jade |
| Chữ bay quanh người + hào quang theo tiến độ (người khác thấy) | `TuLuyen-nguoi-khac-thay` | jade, gold |
| Đốm linh tự + nút nổi "Lĩnh hội" (kiểu "Nói chuyện") | `TuLuyen-dom-linh-tu-doc` | aura-light, jade |

## Thêm ở 2026-11-13.25

| Thành phần | Artboard | Token |
|---|---|---|
| Dòng việc (vòng trạng thái 36 + tên + tiến độ chấm) | `NhiemVu-*` | jade, gold, slate |
| Dải chuỗi 7 ngày + số chuỗi + viên "Kỷ lục mới" | `NhiemVu-*` | jade, gold |
| Triện son 畢 "hôm nay đã xong" | `NhiemVu-doc-xong` | lacquer |
| Ô chữ nhỏ 34 (giấy, chữ Hán) | `NhiemVu-doc`, `OnTap-doc-tong-ket` | map-paper, jade |
| Nút phụ viền (Đóng bảng) | `NhiemVu-*` | slate, frost |
| Thanh trên màn ôn (× + "Bộ i / n" + tiến độ chia đoạn) | `OnTap-*` | jade, slate |
| Phương án câu đố (thường / chọn / đúng / sai / mờ) | `OnTap-*` | option-row, answer-right-bg, answer-wrong-bg |
| Khung phản hồi đúng / sai + "Câu tiếp" | `OnTap-doc-dung`, `OnTap-doc-sai` | answer-right-bg, answer-wrong-bg |
| Viên mức nhớ (3 mức) | `OnTap-muc-ket-qua` | answer-*-bg, jade, gold, lacquer |
| Nút nổi "Xem bảng" + chấm đếm | `XemBang-*` | jade, lacquer, count-badge |

## Thêm ở 2026-11-13.27

| Thành phần | Artboard | Token |
|---|---|---|
| Nút "Rời bàn" (viên thuốc kính + biểu tượng cửa ra) | `Co-*`, `Dau-*` | frost, slate |
| Viên tỉ số phiên (quân đen / trắng + số Lora) | `Co-*` | frost, jade |
| Viên lượt (lượt mình / NPC đang nghĩ + 3 chấm) | `Co-*`, `Dau-doc-mo-nghi` | frost, jade |
| Thẻ kết quả ván (chân dung, Thắng / Thua / Hoà, lời NPC, Ván mới / Rời bàn) | `Co-ket-qua`, `Dau-doc-ket-thuc` | frost .95, jade, lacquer |
| Thẻ điểm người chơi / NPC (đang lượt, vừa ghi điểm) | `Dau-*` | jade, gold |
| Viên tiến độ 10 câu | `Dau-*` | jade, lacquer |
| Ô nghĩa giấy (thường / đúng / sai / mờ / huy hiệu NPC chọn) | `Dau-*` | map-paper, jade, lacquer |

## Thêm ở 2026-11-13.28

| Thành phần | Artboard | Token |
|---|---|---|
| Kệ gỗ + bìa sách (mượn được / chọn / đang biên soạn / đang mượn / chỉ xem) | `DanhMuc-*` | shelf-wood, jade, slate, gold, lacquer |
| Thẻ xác nhận mượn (bìa mini + 2 nút) | `DanhMuc-doc-xac-nhan`, `DanhMuc-ngang` | frost .97, jade |
| Lời nhắc vàng (biểu tượng i) | `DanhMuc-doc-dang-giu` | gold |
| Trang sổ từ (giấy, dải son, từ / pinyin / nghĩa / ví dụ) | `SoTu-*` | map-paper, jade, lacquer |
| Thanh kéo tới trang + cặp nút lật trang | `SoTu-*` | jade |
| Thẻ "Đọc sách" (bìa mini + cấp) | `DocSach-*` | frost, jade |
| Nút nổi "Ngồi" / "Vào bàn" / "Ngồi xem" + vòng sáng chỗ ngồi | `NutNgoi-*`, `DocSach-*` | jade, aura-light, gold |

## Thêm ở 2026-11-13.31

| Thành phần | Artboard | Token |
|---|---|---|
| Trình phát nhạc (đĩa, tên, thanh thời gian, 5 nút) | `Nhac-*` | frost, jade, map-paper, gold |
| Danh sách bài (dòng đang phát) | `Nhac-doc-danh-sach` | frost, jade |
| Viên "đang phát" thu nhỏ | `Nhac-trang-thai` | frost, jade |
| Nút nổi "Nghe nhạc" | `Nhac-doc-ngoi` | jade |
| Bảng cách chơi (kính sương .92 phủ cảnh tối .28; đầu bảng tên Hán + Việt; hình minh hoạ giấy `map-paper`; mục đánh số vòng `jade` 26; ô mẹo NPC vàng 16 %; nút "Đóng" đáy) | `CachChoi-*` | frost, frost-line, frost-outline, slate, jade, gold, map-paper, answer-right-bg |
| Mục đánh số (vòng `jade` 26 + số trắng 13/700, tiêu đề 15/700, đoạn 14/1,5) | `CachChoi-*` | jade, on-jade, slate |
| Ô mẹo của NPC (chân dung 40 + bong bóng góc trái trên 4, nền vàng 16 %, viền vàng 60 %) | `CachChoi-*` | gold, slate |
| Nút "Trò chuyện" (tròn 48 kính sương, biểu tượng bóng thoại 24, nhãn 11/700 dưới) — trên cụm hành động | `Chat-doc`, `Chat-ngang`, `Chat-trang-thai` | frost, frost-line, frost-outline, slate, shadow.hud |
| Khung kênh thu gọn (3 dòng cuối, viên kính .78 bo 8, chữ 13; mờ .55 / .8 / 1; không bắt chạm) | `Chat-doc`, `Chat-ngang` | frost, map-paper (NPC), jade (tên "Ta", NPC) |
| Khung kênh mở rộng (kính .93 bo 16, đầu 44 "Kênh chung 傳音" + ×, danh sách cuộn, viên "Tin mới") | `Chat-doc-go`, `Chat-trang-thai` | frost, jade, answer-right-bg (dòng của mình), map-paper (NPC) |
| Ô nhập + nút "Gửi" (thanh kính .96 trên bàn phím; ô trắng viền `jade` 2, cao 44; Gửi `jade` 44) | `Chat-doc-go`, `Chat-ngang-go`, `Chat-trang-thai` | jade, slate, lacquer (quá dài) |
| Bong bóng trên đầu (bo 12, đệm 7 11, chữ 14, rộng ≤ 168 dọc / 200 ngang, đuôi 12; mình: viền `jade` 1,5 · người khác: kính · NPC: `map-paper` viền vàng) | `Chat-*` | frost, jade, map-paper, gold |
| Nút "Ngồi ôn" (tròn 52 kính, biểu tượng người ngồi cầm cuộn sách 24; chấm son đếm; bật: `jade` viền `gold` + quầng) — thay nút Thiền / Tu luyện | `NgoiOn-nut-trang-thai`, `NgoiOn-*` | frost, frost-line, frost-outline, slate, jade, gold, lacquer |
| Cuộn treo (bảng chọn): 2 trục `scroll-wood` đầu `jade` viền `gold`, giấy `map-paper` viền bồi `jade` 12 %, ấn son chữ dọc | `NgoiOn-doc-*`, `NgoiOn-ngang-*` | scroll-wood, jade, gold, map-paper, lacquer |
| Mục chọn trên giấy (vòng biểu tượng + tiêu đề + dòng phụ + ›; nổi bật `jade` · thường trắng 72 % · mờ nét đứt + dòng lý do có biểu tượng) | `NgoiOn-doc-*`, `NgoiOn-ngang-*` | jade, slate, map-paper |
| Khung gợi ý (nền `jade` 8 %, viền `jade` 28 %, bo 12, biểu tượng 18) | `NgoiOn-doc-chua-hoc`, `NgoiOn-ngang-chua-hoc` | jade, slate |
| Ô bộ đã học (bo 14 kính .9; chữ Hán 40, tên 14/700, 7 chấm bậc nhớ, viên "Đến hạn" `lacquer` hoặc "Ôn sau n ngày"; đến hạn viền `lacquer` 45 %) | `BoDaHoc-*` | frost, jade, lacquer, slate |
| Cuộn sách trên tay (vật 3D: trục `scroll-wood` + đầu `jade`/`gold`, giấy `map-paper`, ấn son mặt sau) | `NgoiOn-cuon-sach` | scroll-wood, jade, gold, map-paper, lacquer |
