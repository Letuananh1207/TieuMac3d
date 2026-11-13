# Biển tên trò chơi + xem cách chơi

- Yêu cầu: "ở mỗi trò chơi thì cần có biển tên trò chơi và lại gần để xem hướng dẫn"
- Loại: thêm · Cỡ: vừa · Trạng thái: chờ thiết kế

Người dùng đã chọn (2026-11-13): hướng dẫn = **nút nổi "Cách chơi"** (kiểu nút "Xem bảng" đã thiết kế 2026-11-13.25) +
**NPC của bàn giảng luật trong khung thoại có sẵn**, nhiều trang — không chờ thiết kế mới.

## Phạm vi

**Sẽ sửa**
- `docs/testing/quy_tac.md` + tài liệu online — luật mới `R-GIAO-2` (biển tên, tầm 2,5 m, nút, ai giảng, đang ngồi
  chơi thì không hiện).
- `web/src/scene/spec.ts` — `GameTableSpec.sign?: { x; z; rotY? }` (không có → không biển, giữ cảnh cũ).
- `web/scripts/check-scene.mjs` — biển nằm trong khu, không đè bàn / ghế.
- `design/scene/scene.json` — biển cho 2 bàn: đầu đông mỗi bàn (≈ −35,5; 6) và (≈ −35,5; 13), quay về đông (lối vào)
  + ảnh Canvas 3D + mục `design/CHANGELOG.md` (làm thay phần thiết kế cảnh, cho duyệt ảnh).
- `web/src/scene/kien_truc/do_pho.ts` — `gameSign()`: biển gỗ đứng nhỏ (2 trụ + tấm biển ≈ 1,6 × 0,9 m), chữ
  **五子棋 · Ngũ Tử Kỳ** / **鬥字 · Đấu chữ** vẽ vào ảnh biển chung (`signAtlas` — không thêm draw call).
- `web/src/scene/gameTable.ts` — dựng biển + vật cản tròn khi bàn có `sign`.
- `web/src/zones/gameGuides.ts` (mới) + test — lời giảng từng trò (3–4 trang, nút "Tiếp" / "Đã hiểu"), dựng thành
  `Dialog` cho khung thoại; tầm hiện nút.
- `web/src/ui/guideButton.ts` (mới) + `web/index.html` `#guide` + `style.css` — nút "Cách chơi", nhãn tên trò; dùng
  lại CSS của `#board` (không màu / cỡ mới).
- `web/src/main.ts` — hiện nút khi đứng gần biển (cùng điều kiện nút "Xem bảng"), bấm → `startTalk(guide)`.

**Cần kiểm tra**
- Nút "Vào bàn" (R-GIAO-1, tầm 1,5 m từ ghế) không chồng nút "Cách chơi" — ghế gần biển nhất cách ≈ 2,3 m.
- Nút "Nói chuyện" / "Xem bảng" vẫn như cũ; đang ngồi chơi không hiện nút.

**Không đụng**
- Luật chơi `games/`, HUD trò chơi (thiết kế 2026-11-13.27), cầu nối Flutter, app Flutter.

## Giả định / cần quyết định
- Tên trên biển: 五子棋 Ngũ Tử Kỳ · 鬥字 Đấu chữ (chữ Hán theo tên đã chốt ở R-CO-1 / R-DAU).
- Người giảng: bàn cờ — Tiểu Mặc, bàn Đấu chữ — Mặc Ông (đúng NPC của bàn). Lời giảng tóm đúng R-CO-1…3, R-DAU-1…2.
- Ngân sách: biển gộp vào ảnh biển chung + gỗ gộp tĩnh ≈ +0–1 draw call.

## Nhiệm vụ
- [x] 1. Sổ quy tắc `R-GIAO-2` → online (Chờ) → `--mark-synced R-GIAO-2`.
- [x] 2. `zones/gameGuides.ts` + test `'R-GIAO-2: …'` (lời giảng là thoại hợp lệ, trang cuối "Đã hiểu", tầm 2,5 m).
- [x] 3. Đặc tả: `spec.ts` trường `sign`, `check-scene.mjs`; `scene.json` 2 biển + ảnh + CHANGELOG. (xong khi
  `scene:check` không lỗi, ảnh duyệt)
- [x] 4. Cảnh: `gameSign()` + dựng trong `gameTable.ts`. (xong khi chụp thấy biển, draw call không tăng quá 1)
- [x] 5. HUD + ghép: `guideButton.ts`, `#guide`, `main.ts`. (xong khi đứng gần biển → nút → NPC giảng trọn)
- [x] 6. `npm run build`, Bản đồ tính năng.
- [ ] 7. Người dùng (2026-11-13): "nên có 1 bảng giải thích cách chơi" thay khung thoại — R-GIAO-2 đã sửa (sửa · chờ
  thiết kế). Có thiết kế → dựng bảng, nút "Cách chơi" mở bảng, bỏ lời giảng tạm. **chờ thiết kế (phiếu
  `docs/phieu_thiet_ke/2026-11-13-bang-cach-choi.md`)**

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npm test && npx tsc --noEmit && npm run build · dart tool/rule_trace.dart
