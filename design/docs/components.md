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
