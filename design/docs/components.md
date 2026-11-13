# Thành phần dùng lại

Đang có trong app (vẽ mẫu trên artboard "Bảng token"). Màn mới nên dùng lại trước khi nghĩ thành phần mới.

| Thành phần | Trong code | Token |
|---|---|---|
| Chip HUD (chấm trạng thái + chữ) | `web/index.html .chip`, CSS `.chip` | hud-glass, gold-line, paper, hud 13, pill |
| Nhãn tên trên đầu nhân vật | `#nameTag` / `.label`, `web/src/ui/hud.ts` | gold, label-text, label 12, pill |
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
| Nhãn tên | `HUD-thanh-phan` | frost .88, gold 4 px, label 12, pill |
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
