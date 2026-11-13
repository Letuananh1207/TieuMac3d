# Bàn dài nhiều ghế ở Kỳ Văn Uyển
- Yêu cầu: "bên trong bài trí không chỉ 1 ghế mà nhiều ghế để chơi" → (trả lời) "bàn dài và nhiều ghế sau này các người chơi có thể chơi với nhau hoặc npc và không cần có npc ở bên cạnh 1 chỗ như hiện tại"
- Loại: sửa hành vi + cảnh · Cỡ: vừa · Trạng thái: xong

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` — R-GIAO-1 (vị trí mới, bàn dài, ghế hai phía, NPC không đứng ở bàn) → chép lên tài liệu online → `--mark-synced R-GIAO-1`.
- `web/src/scene/spec.ts` + `specCheck.ts` — `GameTableSpec` thêm `boards` (số chỗ chơi dọc bàn, 1–4, mặc định 1 = như cũ) và
  `npcStand` (mặc định `true` = NPC đứng như cũ); kiểm nền phẳng theo chiều dài bàn.
- `web/src/scene/gameTable.ts` — bàn đá dài, mỗi chỗ một bàn cờ / thẻ bộ thủ riêng, **hai bồ đoàn đối diện** mỗi chỗ;
  `GameTable` (mỗi chỗ một cái) đổi `seat` → `seats` (2 ghế); thẻ bộ thủ xoay theo phía người ngồi.
- `web/src/gamePlay.ts` — tìm ghế gần nhất trong mọi `seats`, nhớ phía đang ngồi (camera nhìn xuống bàn từ phía đó);
  không dựng NPC cạnh bàn khi `npcStand: false` (NPC vẫn đi nước / chọn nghĩa và nói qua khung thoại).
- `web/src/gamePlay.test.ts` — sửa khuôn bàn giả; thêm test ngồi ghế phía đối diện + bàn nhiều chỗ.
- `design/scene/scene.json` (việc `/canh`) — 2 bàn dài trong sân (bàn cờ, bàn Đấu chữ), mỗi bàn 3 chỗ → 6 ghế / bàn, 12 ghế cả sân.
**Cần kiểm tra** `main.ts` (gọi `trySit`, `placeCamera`, `placeNpcs`), Canvas 3D (`designPreview.ts` nếu đọc `seat`).
**Không đụng** luật chơi R-CO-1..3, R-DAU-1..2; cầu nối; NPC của đặc tả (`npcs`: Tiểu Mặc ở bảng, Sư phụ ở quảng trường).
**Không làm bây giờ** người chơi đấu với nhau — cần nhiều người chơi trực tuyến (ngoài phạm vi giai đoạn này). Bố cục ghế
hai phía để sau này thêm được: ghế đối diện là chỗ cho người thứ hai.

## Giả định / cần quyết định
- Mỗi bàn 3 chỗ (dài ≈ 6,6 m, rộng 1,6 m), 2 bàn → 12 ghế. Ngồi ghế nào cũng chơi với NPC của bàn (cờ: Tiểu Mặc,
  Đấu chữ: Mặc Ông) — họ không đứng ở bàn, chỉ nói qua khung thoại.
- Bỏ NPC cạnh bàn bớt ≈ 32k tam giác trong app (mỗi NPC 16k).

## Nhiệm vụ
- [x] 1. Sổ R-GIAO-1 + tài liệu online + `--mark-synced` (docs · xong khi rule_trace sạch).
- [x] 2. Test đỏ: ngồi ghế phía đối diện, bàn 3 chỗ, không NPC (gamePlay.test.ts · test).
- [x] 3. Đặc tả `boards`, `npcStand` + kiểm (spec.ts, specCheck.ts · scene).
- [x] 4. Bàn dài, ghế hai phía (gameTable.ts · scene) — Canvas 3D thấy 12 bồ đoàn.
- [x] 5. gamePlay: ghế nhiều, phía ngồi, bỏ NPC đứng (gamePlay.ts · gốc) — test xanh.
- [x] 6. `scene.json` 2 bàn dài; build + Canvas 3D + ngân sách.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/rule_trace.dart

## Kết quả
- Duyệt 2026-11-13. R-GIAO-1 sửa sổ + tài liệu online (ô Xác nhận: Chờ) + `--mark-synced`; App `ok`.
- `GameTableSpec.boards` / `npcStand`, `GAME_SLOT` 2,2 m; `addGameTable` trả một `GameTable` mỗi chỗ chơi (`seats` 1–2,
  `npcSpot` có thể `null`); `gamePlay` chọn ghế gần nhất mọi phía, camera sau lưng ghế, thẻ quay theo ghế.
- `scene.json`: bàn cờ dài (−40; 6), bàn Đấu chữ dài (−40; 13), mỗi bàn 3 chỗ × 2 ghế = 12 ghế; không NPC đứng.
- Test: 5 test mới R-GIAO-1, `npm test` 56/56 xanh; tsc sạch; `npm run build` xong.
- Đo Canvas 3D: trên xuống 114 draw call · 149 922 tam giác (bớt 2 tùng sau Nội Môn); app còn nhẹ hơn ≈ 32k vì bỏ 2 NPC bàn.
