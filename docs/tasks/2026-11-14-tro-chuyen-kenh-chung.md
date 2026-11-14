# Trò chuyện kênh chung — bong bóng thoại trên đầu nhân vật
- Yêu cầu: "Hãy thêm cho phép người dùng trò chuyện" → làm rõ: "trò chuyện chung, hiện thoại trên đầu nhân vật và
  nhiều người thấy được; hiện tại vẫn chưa có backend nên cứ triển khai ý tưởng trên giao diện trước"
- Loại: thêm · Cỡ: vừa · Trạng thái: xong (chờ thử máy)

## Phạm vi
**Sẽ sửa**
- `web/src/chat/` (mới) — `chatMessage.ts` (kiểu tin, chuẩn hoá + kiểm độ dài, chống gửi dồn), `chatChannel.ts`
  (hợp đồng `ChatChannel` gửi / nhận + `LocalChannel` chạy trong máy — sau này thay bằng kênh mạng, không sửa chỗ khác),
  `bubbleTimer.ts` (bong bóng của ai đang hiện, hết hạn khi nào), test vitest đi kèm.
- `.claude/skills/hoc-xa-3d-dev/decisions/0001-kien-truc.md` + `LAYERS` trong `tool/check.dart` — thêm lớp `chat/`
  (thuần, không three, không DOM; `ui/` được import `chat`).
- `docs/testing/quy_tac.md` — nhóm luật mới `CHAT` (R-CHAT-1 gửi tin, R-CHAT-2 bong bóng, R-CHAT-3 khung kênh chung).
- `web/src/ui/chatBubbles.ts`, `web/src/ui/chatPanel.ts`, `web/src/style.css`, `web/index.html` — **chờ thiết kế**.
- `web/src/main.ts` — ghép: kênh → bong bóng trên đầu người chơi / NPC (neo theo đầu, chiếu ra màn như `learnButton.follow`).
- `web/src/input/keyboard.ts` — đang gõ chat thì phím không điều khiển nhân vật (Enter mở / gửi, Esc đóng).

**Cần kiểm tra**
- `web/src/ui/learnButton.ts`, `dialogBox.ts`, `actionButtons.ts` — chỗ đặt ô chat không đè nút cũ / joystick (R-DIEU-1).
- `web/src/player/npc.ts` — lấy điểm neo đầu NPC (nếu NPC cũng "nói" trên kênh chung).
- Bàn phím ảo trên điện thoại đẩy WebView lên — thử máy (Android + iOS).

**Không đụng**
- Backend, đăng nhập, multiplayer thật — ngoài giai đoạn này. Hợp đồng `ChatChannel` chừa sẵn chỗ cắm.
- Cầu nối Flutter (`docs/bridge.md`, `app/lib/`) — giai đoạn này chat chạy hoàn toàn trong web; khi có backend mới
  quyết định mạng đi qua Flutter hay JS.
- Hộp thoại NPC có lựa chọn (R-NPC-2) — giữ nguyên, khác với chat kênh chung.

## Giả định / cần quyết định
- **Chưa có người chơi khác**: "nhiều người thấy" mô phỏng thế nào? Đề xuất: NPC trong cảnh thỉnh thoảng nói một câu
  có sẵn trên kênh chung (hiện bong bóng trên đầu NPC + dòng trong khung) để cảnh "có người". → hỏi người dùng.
- Tin dài tối đa **60 ký tự** (bong bóng nhỏ, đọc được trên điện thoại); bỏ khoảng trắng thừa; tin rỗng không gửi.
- Bong bóng hiện **6 giây**, tin mới thay tin cũ của cùng người; xa camera quá **25 m** hoặc bị khuất sau lưng camera
  thì không hiện.
- Chống gửi dồn: tối thiểu **1,5 giây** giữa hai tin.
- Khung kênh chung giữ **50 tin** gần nhất, chỉ trong phiên (không lưu máy) — khi có backend mới bàn lưu.
- Lọc từ ngữ xấu: để mốc backend (lọc phía máy chủ).

## Nhiệm vụ
- [x] 1. Sổ quy tắc: thêm nhóm `CHAT` (R-CHAT-1..3) vào `docs/testing/quy_tac.md` → người dùng chép lên tài liệu xác nhận
  online → `dart tool/rule_trace.dart --mark-synced R-CHAT-1` (… 2, 3). (docs · xong khi rule_trace không báo lệch)
- [x] 2. Lớp `chat/`: bảng phụ thuộc `decisions/0001` + `LAYERS` (`tool/check.dart`). (tool · xong khi `check.dart` không
  báo `W-LOPMOI`)
- [x] 3. `chat/chatMessage.ts` + test: chuẩn hoá, cắt / chặn quá 60 ký tự, tin rỗng, chống gửi dồn 1,5 s. (chat · vitest
  R-CHAT-1 · xong khi `npm test` xanh)
- [x] 4. `chat/chatChannel.ts` + `bubbleTimer.ts` + test: `LocalChannel` gửi → mọi người nghe nhận; giữ 50 tin; bong bóng
  6 s, tin mới thay tin cũ. (chat · vitest R-CHAT-2 · xong khi `npm test` xanh)
- [x] 5. (đã duyệt 2026-11-14) NPC nói câu có sẵn trên kênh chung theo nhịp ngẫu nhiên có hạt giống. (`chat/npcChatter.ts`, câu có sẵn `NPC_LINES` · vitest)
- [x] 6. (thiết kế 2026-11-14.1 — `ui/chatPanel.ts`, `ui/chatBubbles.ts`, `ui/chat.css`) HUD: ô nhập + nút gửi + nút mở khung kênh chung + bong bóng trên đầu. **chờ thiết kế
  (`docs/phieu_thiet_ke/2026-11-14-tro-chuyen-kenh-chung.md`)**
- [x] 7. (`chatRoom.ts` ghép, `main.ts` gọi) Ghép ở `main.ts` + bàn phím (Enter / Esc, đang gõ thì không đi). Sau nhiệm vụ 6.
- [x] 8. (build xong; chụp headless dọc + ngang đạt — còn thử bàn phím ảo trên máy thật) `npm run build`; thử máy: bàn phím ảo Android / iOS, dọc + ngang.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npm test && npx tsc --noEmit && npm run build · cd app && flutter analyze ·
dart tool/rule_trace.dart
