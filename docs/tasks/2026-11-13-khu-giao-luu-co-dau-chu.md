# Khu giao lưu: Ngũ Tử Kỳ + Đấu chữ với NPC

- Yêu cầu: "khu giao lưu ở bãi phía tây Sơn Môn: cờ chung với NPC + trò chơi chữ Hán"
- Loại: thêm · Cỡ: lớn · Trạng thái: chờ thiết kế

Người dùng đã chọn (2026-11-13): cờ **Ngũ Tử Kỳ 五子棋** (caro 5, bàn 13 × 13) · trò chữ **Đấu chữ với NPC** (một bộ
thủ + 4 nghĩa, thay phiên, 10 câu) · **chỉ ôn bộ đã học** (không mở bài mới, không tính tiến độ — R-VUNG-1 thêm một ý) ·
chơi **trên bàn 3D trong cảnh** (ngồi vào bàn, camera nhìn xuống bàn, chạm trên bàn). Bãi: nền phẳng cỏ x −63…−8,
z 22…58 (chỗ Thị Tập cũ, L-4).

## Phạm vi

**Sẽ sửa**
- `docs/testing/quy_tac.md` + tài liệu online — R-VUNG-1 sửa, luật mới R-GIAO-1 (ngồi vào bàn), R-CO-1..3, R-DAU-1..3.
- `design/scene/scene.json` — khu mới trong `site.areas`, nền lát, lối từ Sơn Môn, 2 bàn chơi, 2 NPC đối thủ.
- `web/src/games/` (**thư mục mới**, logic thuần: không three, không DOM) — `gomoku.ts` (bàn, luật thắng, NPC chấm điểm
  ô), `charDuel.ts` (ra câu từ bộ đã học, chấm, NPC trả lời đúng ~70 %, điểm).
- `.claude/skills/hoc-xa-3d-dev/decisions/0001-kien-truc.md` + `LAYERS` trong `tool/check.dart` — thêm lớp `games/`
  (phụ thuộc: `zones` để lấy dữ liệu bộ thủ).
- `web/src/scene/spec.ts` — kiểu bàn chơi (`tables[]` hoặc `buildings[].kind` mới), mặc định rỗng giữ cảnh cũ.
- `web/src/scene/gameTable.ts` (mới) + `kien_truc/ban_co.ts` (mới) — bàn đá, ghế đôn, lưới 13 × 13, quân (InstancedMesh),
  bàn đấu chữ có thẻ bộ thủ; chỗ ngồi giống `rapPhim.ts` (`Seat`).
- `web/src/input/tapToMove.ts` — chạm trúng ô bàn cờ khi đang ngồi chơi → trả ô (không đi tới).
- `web/src/main.ts` — ngồi vào bàn (mở rộng `sitOrWatch`), camera nhìn xuống bàn, vòng lượt người / NPC, đứng dậy = bỏ ván.
  `main.ts` đã 419 dòng → tách phần trò chơi ra `web/src/gamePlay.ts` (ghép lớp, cùng tầng với `main.ts`).
- `web/src/ui/` — HUD trò chơi (lượt, điểm, câu hỏi + 4 nghĩa, kết quả, nút Rời bàn) → **chờ thiết kế** (phiếu mới).
- `web/package.json` — `vitest` (ghim cố định) để test logic `games/` (hiện **chưa có** trình chạy test TS).
- `.claude/skills/lead/SKILL.md` — thêm dòng Bản đồ tính năng.

**Cần kiểm tra**
- `web/src/scene/rapPhim.ts`, `main.ts` `sitOrWatch` — Ngồi ở rạp vẫn như R-RAP-1; xa bàn và rạp vẫn ngồi thiền (R-DIEU-7).
- `web/src/player/npc.ts` — NPC đối thủ đứng / ngồi sau bàn, không chặn chỗ ngồi; nút "Nói chuyện" (R-NPC-2) không chồng
  nút Ngồi.
- `web/src/bridge/flutterBridge.ts` `getProgress` — lấy `radicals` đã học (không đổi cầu nối).
- Ngân sách: +2 bàn ≈ +6 draw call (bàn, ghế gộp; lưới 1; quân 2 InstancedMesh; thẻ 1) — dưới 150.

**Không đụng**
- Cầu nối `docs/bridge.md` (dùng `getProgress` có sẵn) · tiến độ Flutter (`progress_store.dart` — trò chơi không ghi gì) ·
  Rừng trúc / tu luyện R-HANH-3 · rạp phim.

## Giả định / cần quyết định

1. **NPC đối thủ** — đề xuất: **tạm dùng model có sẵn** (Tiểu Mặc ngồi bàn cờ, một bản Mặc Ông ngồi bàn đấu chữ, NPC
   gốc vẫn đứng chỗ cũ), sau đó `/tai-nguyen` tạo 2 đệ tử riêng. Cách khác: tạo model trước rồi mới làm.
2. **Tên khu** — đề xuất **Kỳ Văn Uyển 棋文苑** ("vườn cờ và chữ"). Có thể đặt tên khác.
3. **Đấu chữ, lượt** — đề xuất: 10 câu, câu lẻ người trả lời, câu chẵn NPC trả lời (NPC "nghĩ" 1–2 giây, đúng ~70 %),
   mỗi câu đúng 1 điểm, hoà được. Nghĩa nhiễu lấy từ cả 50 bộ, câu hỏi chỉ từ bộ đã học (≥ 1 bộ). Chưa học bộ nào →
   NPC nói "Đạo hữu hãy tới Rừng trúc tu luyện trước đã" (dùng khung thoại có sẵn).
4. **Ngũ Tử Kỳ** — người đi trước (quân đen), ≥ 5 quân liền ngang / dọc / chéo thắng, đầy bàn hoà; NPC một mức (chặn
   4, chặn 3 mở, tự nối dài) — thắng được nhưng không dễ.
5. **Test TS** — thêm `vitest` (devDependency, chạy offline, không vào bản build) để khoá luật thắng, NPC chặn nước
   thua, ra câu chỉ từ bộ đã học. Không thêm thì logic chỉ thử tay.

## Nhiệm vụ

- [x] 1. Sổ quy tắc: sửa R-VUNG-1 (khu giao lưu được có trò **ôn** bộ đã học, không mở bài, không tính tiến độ); thêm
  R-GIAO-1, R-CO-1..3, R-DAU-1..3 kèm ví dụ số → chép online (Chờ) → `--mark-synced`. (xong khi `rule_trace` thấy mã mới)
- [x] 2. Thêm `vitest` (`npm install --save-exact -D vitest`), script `npm test`; thêm lớp `games/` vào `decisions/0001` +
  `tool/check.dart`. (xong khi `npm test` chạy được, `check.dart` nhận lớp mới)
- [x] 3. `games/gomoku.ts` + `gomoku.test.ts` — `'R-CO-1: 5 quân liền chéo thắng'`, `'R-CO-2: NPC chặn hàng 4'`, … (lớp
  logic · xong khi test xanh)
- [x] 4. `games/charDuel.ts` + test — `'R-DAU-1: câu hỏi chỉ từ bộ đã học'`, `'R-DAU-2: 4 nghĩa khác nhau, có 1 đúng'`,
  điểm, hoà. (xong khi test xanh)
- [x] 5. Đặc tả cảnh: kiểu bàn chơi trong `spec.ts` (mặc định rỗng) + `check-scene.mjs` kiểm bàn nằm trên nền phẳng, không
  đè nhà / lối; `scene.json` thêm khu, nền lát, lối, 2 bàn, 2 NPC. Ảnh Canvas 3D + mục `design/CHANGELOG.md`. (lớp cảnh ·
  xong khi `scene:check` không lỗi, ảnh duyệt)
- [x] 6. `scene/gameTable.ts` + `kien_truc/ban_co.ts` — dựng bàn, chỗ ngồi, đặt / xoá quân, hiện thẻ bộ thủ trên bàn đấu
  chữ; vật cản. (xong khi chụp thấy bàn, draw call trong ngân sách)
- [x] 7. Ghép (`gamePlay.ts` + `main.ts`): Ngồi gần bàn → ngồi đối diện NPC, camera nhìn xuống bàn; chạm ô → đặt quân,
  NPC đáp; đứng dậy / điều khiển đi → bỏ ván. Thắng / thua tạm báo qua khung thoại NPC có sẵn ("Đạo hữu thắng rồi!") —
  **không** dựng HUD mới. (thử tay `npm run dev` · xong khi chơi trọn một ván cờ)
- [x] 8. Phiếu thiết kế `docs/phieu_thiet_ke/2026-11-13-tro-choi-giao-luu.md` (`/ui-apply phieu`): HUD trong ván (lượt,
  điểm, câu hỏi + 4 nghĩa, kết quả, nút Rời bàn). → **chờ thiết kế**
- [ ] 9. Sau thiết kế: HUD trò chơi (`ui/gameHud.ts`), Đấu chữ chơi được trọn. **chờ thiết kế (phiếu ở nhiệm vụ 8)**
- [x] 10. Bản đồ tính năng trong `lead/SKILL.md`; `npm run build`.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npm test && npx tsc --noEmit && npm run build · cd app && flutter analyze ·
dart tool/rule_trace.dart

## Kết quả (2026-11-13)
- Xong 1–8, 10. Ngũ Tử Kỳ chơi trọn trên bàn 3D (thử bằng Chrome headless qua CDP: ngồi, chạm đặt quân, NPC đáp).
  Đấu chữ: logic + test xong; ngồi vào bàn → Mặc Ông nói (chưa học → R-DAU-1; đã học → "Lão đang soạn đề…" tạm tới khi
  có HUD). Còn **9 — chờ thiết kế** (phiếu `docs/phieu_thiet_ke/2026-11-13-tro-choi-giao-luu.md`).
- Khác kế hoạch: NPC không ngồi được (không có xương) → **đứng** sau bàn (R-GIAO-1 sửa chữ, online đã chép). Dựng bàn
  gộp một file `scene/gameTable.ts` (không tách `kien_truc/ban_co.ts`). Thêm `?dung=x,z` (thử trên trình duyệt).
- Test: `web/src/games/gomoku.test.ts` (11), `charDuel.test.ts` (10), `web/src/gamePlay.test.ts` (8).
