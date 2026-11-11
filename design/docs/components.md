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
| Thẻ mời (eyebrow vạch + chấm, tiêu đề có chữ Hán, nút chính + phụ) | `HUD-doc`, `HUD-doc-the-dai`, `HUD-ngang` | frost-strong, jade, on-jade, secondary-bg, card-title 18, accent 24, card 16, button 12, shadow.card, shadow.primary, blur.card |
| Thẻ tên khu (mới) | `HUD-doc-vao-khu`, `HUD-ngang-vao-khu` | frost-strong .80, area-han 52, area-name 20, jade, slate, gold |
| Dòng hướng dẫn | `HUD-doc`, `HUD-ngang` | frost .84, hud 13, radius 12 |
| Joystick (gợi ý / đang giữ) | `HUD-thanh-phan`, `HUD-doc-vao-khu` | frost-weak, frost-line, frost-outline, jade |
| Vạch trang trí (đường 1 px + chấm vàng giữa) | thẻ tên khu, màn tải | rgba(36,50,58,.3), gold |
| Màn tải (mới) | `ManTai-doc`, `ManTai-ngang` | mist, mist-far, mist-near, jade, slate, gold, loading-han 56, loading-title 24 |
| fps (chỉ gỡ lỗi) | `HUD-thanh-phan` | frost .8, mono 11 |
