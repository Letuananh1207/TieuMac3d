# Trà lâu: nơi nghe nhạc chung
- Yêu cầu: "tôi muốn biến trà lâu thành nơi nghe nhạc chung và trò chuyện"
- Người dùng chọn: nhạc nền tự phát khi vào trà lâu · file nhạc CC0 đóng gói offline · trò chuyện = với người chơi thật.
- Loại: thêm · Cỡ: vừa · Trạng thái: chờ duyệt

## Ngoài phạm vi (ghi lại để làm sau)
- **Trò chuyện với người chơi thật**: cần multiplayer + máy chủ + đăng nhập — giai đoạn này không làm (CLAUDE.md).
  Phần "nghe chung" dưới đây làm kiểu đài phát theo giờ thật để sau này nhiều người vào cùng lúc nghe cùng một đoạn.
- **Cầm sư NPC ngồi đánh đàn**: cần model mới (`/tai-nguyen`: ảnh 4 góc → Hunyuan3D trên máy người dùng) + dáng ngồi
  cho NPC (NPC hiện chỉ đứng, R-NPC-1). Đợt này chỉ đặt cây đàn cổ cầm trên án.
- Trình phát chọn bài: phiếu `docs/phieu_thiet_ke/2026-11-13-rap-nhac-on-tap.md` (mục 2) vẫn chờ thiết kế.

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` — quy tắc mới R-NHAC-1 (nhạc nền trà lâu), R-NHAC-2 (ngồi đôn bàn trà).
- `web/src/nhac/` (mới, file nhạc + `LICENSES.md`) — 3–5 bài CC0 / phạm vi công cộng, người dùng duyệt danh sách trước.
- `web/src/zones/music.ts` (mới) — danh sách bài, toán thuần: "đài phát" theo giờ thật (bài nào, giây thứ mấy), âm
  lượng theo khoảng cách tới sàn trà lâu. Test `music.test.ts`.
- `web/src/ui/ambientMusic.ts` (mới) — bọc thẻ `<audio>`: lên / xuống âm lượng mượt, khớp giờ phát, dừng / tiếp,
  thử phát lại sau lần chạm kế nếu WebView chặn tự phát.
- `web/src/scene/kien_truc/tra_lau.ts` — cầm án + đàn cổ cầm; chỗ ngồi ở đôn bàn trà (`Shell.seats`, như án thư).
- `web/src/main.ts` — mỗi khung tính âm lượng theo khoảng cách; dừng khi app xuống nền / mở bài học.

**Cần kiểm tra**: rạp phim (cùng nút Ngồi, cùng dừng khi xuống nền), `do_pho.ts` `teaTable` (vị trí đôn),
`npm run build` (file nhạc vào `app/assets/scene/`).

**Không đụng**: cầu nối Flutter, HUD (không thêm nút), `design/scene/scene.json` (biển 品茗閣 giữ nguyên).

## Giả định / cần quyết định
- **Nghe "chung" kiểu đài phát** (đề xuất): bài đang phát tính theo đồng hồ thật — vào lúc nào cũng nghe đúng đoạn
  đang phát, ra rồi vào lại không nghe lại từ đầu; danh sách lặp vòng.
- **Âm lượng**: trong sàn trà lâu = đầy; ra ngoài nhỏ dần, cách mép sàn ≥ 8 m thì dừng hẳn; lên / xuống mượt ~1,5 s.
- **Ngồi đôn bàn trà** (đề xuất): đứng gần đôn bấm Ngồi → ngồi vào bàn trà, nghe nhạc (dùng lại cơ chế án thư R-VA-4).
- Không có nút tắt nhạc riêng (chưa có thiết kế) — tắt bằng âm lượng máy hoặc ra khỏi trà lâu.
- Dung lượng app tăng khoảng 3–6 MB (nhạc nén sẵn .ogg / .mp3; máy không có ffmpeg nên chọn bản đã nén sẵn).
- Draw call: cầm án + đàn ~6 khối, gộp chung vào nhà → không đáng kể.

## Nhiệm vụ
- [ ] 1. Tìm 3–5 bài nhạc cổ cầm / sáo trúc / tiếng nước CC0 hoặc phạm vi công cộng (nguồn, giấy phép, độ dài, cỡ)
      → người dùng duyệt danh sách → tải vào `web/src/nhac/` + `LICENSES.md`.
- [ ] 2. Quy tắc R-NHAC-1, R-NHAC-2 → tài liệu online → `--mark-synced`.
- [ ] 3. `zones/music.ts` + test (đài phát theo giờ, âm lượng theo khoảng cách) · xong khi test xanh.
- [ ] 4. `ui/ambientMusic.ts` (thẻ audio, mượt, khớp giờ, chặn tự phát) · xong khi tsc đạt.
- [ ] 5. `tra_lau.ts`: cầm án + đàn, chỗ ngồi đôn · test ngồi (như `lauSach.test.ts`) · ảnh Canvas 3D.
- [ ] 6. Ghép `main.ts`: âm lượng mỗi khung, dừng khi xuống nền / mở bài học · build.
- [ ] 7. Thử máy (Android WebView: tự phát sau lần chạm đầu, âm lượng khi đi vào / ra, xuống nền rồi lên lại).

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/rule_trace.dart
