# Tiện ích thực dùng: rạp phim, phòng nghe nhạc, phòng ôn tập
- Yêu cầu: "đổi hí đài phố chợ hay gì thành những tiện ích thực dùng ví dụ 1 chỗ để mọi người dùng cùng ngồi xem phim
  (có màn hình nhúng link video vào)"
- Quyết định người dùng (2026-11-13): xem **một mình** trước (chưa multiplayer — CLAUDE.md); video **chạy trên màn 3D**;
  **danh sách cố định**; file **.mp4 trên mạng** (không đóng gói); trà lâu → **phòng nghe nhạc**, Tàng Thư Các → **phòng
  ôn tập** (tra / ôn chữ đã học, không phải lớp học); **giữ phố chợ** làm cảnh.
- Loại: thêm · Cỡ: lớn · Trạng thái: đợt 1 xong · đợt 2 chờ thiết kế (`docs/phieu_thiet_ke/2026-11-13-rap-nhac-on-tap.md`)
- Nối tiếp: `docs/tasks/2026-11-13-tien-ich-giao-luu.md` (kiểu nhà vào được, biển chung).

## Phạm vi
**Sẽ sửa**
- `.claude/skills/hoc-xa-3d-dev/decisions/0004-video-mang.md` (mới) — ngoại lệ "chạy offline": chỉ **nội dung video** của
  rạp được tải từ mạng; mã, font, nhạc vẫn đóng gói. Không mạng → màn hiện "Cần kết nối mạng", phần còn lại chạy bình thường.
- `docs/testing/quy_tac.md` + online — luật mới `R-RAP-1..3` (ngồi xem, phát / dừng, không mạng), `R-NHAC-1`, `R-ON-1`
  (đề xuất ở dưới; người dùng duyệt).
- `web/src/zones/videos.ts` (mới) — danh sách phim: tiêu đề, link .mp4, ảnh bìa (tuỳ chọn), giấy phép.
- `web/src/scene/kien_truc/rap_phim.ts` (mới) + `spec.ts` / `specCheck.ts` — kiểu nhà `rap-phim`: rạp ngoài trời, màn
  khung gỗ mái nhỏ 8 × 4,5 m, 4–5 hàng ghế dài bậc thấp dần quay về màn; va chạm ghế; chỗ ngồi = điểm ngồi.
- `web/src/scene/videoScreen.ts` (mới) — `HTMLVideoElement` (crossOrigin, muted tới khi người chơi chạm) → `VideoTexture`
  trên mặt màn (1 draw call, `markDynamic`); chưa phát / lỗi mạng → mặt màn vẽ chữ trên biển chung.
- `web/src/main.ts` — ghép: lại gần ghế → ngồi (dùng `toggleSit` có sẵn) + camera nhìn màn; dừng video khi app xuống nền
  (`lifecycle` có sẵn).
- `design/scene/scene.json` (qua `/canh`) — hí đài → rạp phim ở trục bắc quảng trường; đổi tên trà lâu / Tàng Thư.

**Cần kiểm tra**: `rooms.ts` `addWalkIn` (rạp không mái → không cần mờ), `controller.ts` ngồi / đứng (R-DIEU-7),
`orbitCamera.ts`, `bridge/` (âm thanh khi app xuống nền), `app/lib/journey/progress_store.dart` (chữ đã học — cho ôn tập).

**Không đụng**: multiplayer, đăng nhập, máy chủ; phố chợ; Rừng trúc.

## Giả định / cần quyết định
- **Danh sách phim**: cần link .mp4 **được phép nhúng** (máy chủ trả `Access-Control-Allow-Origin`) và **được phép chiếu**
  (giấy phép). Đề xuất bắt đầu bằng 2–3 phim phạm vi công cộng trên Wikimedia Commons (có CORS); anh/chị gửi link riêng
  sau thì thay. YouTube / Bilibili không dùng được trên màn 3D.
- **Nhạc** (phòng nghe nhạc): đóng gói offline → cần file nhạc CC0 / phạm vi công cộng (cổ cầm, sáo trúc…), vài MB.
- **Giao diện mới — chờ thiết kế** (không dựng tạm): (1) bảng chọn phim + nút phát / dừng / tua khi ngồi xem; (2) trình
  nghe nhạc ở trà lâu; (3) màn ôn tập chữ đã học ở Tàng Thư Các (có thể là màn Flutter như màn bài học). → phiếu
  `docs/phieu_thiet_ke/2026-11-13-rap-nhac-on-tap.md`.
- Âm lượng điện thoại: WebView chỉ cho phát tiếng sau một lần chạm → video bắt đầu tắt tiếng, chạm màn để bật.

## Luật đề xuất (duyệt trước khi code)
- R-RAP-1: Rạp phim ở trục bắc quảng trường Văn Uyên Tông. Đứng cách ghế dưới 1,2 m → nút "Ngồi xem"; bấm → nhân vật
  ngồi xuống ghế, camera quay về màn; đi (joystick) → đứng dậy.
- R-RAP-2: Có người ngồi thì màn phát phim đang chọn (tắt tiếng tới lần chạm đầu); đứng dậy hoặc app xuống nền → dừng,
  ngồi lại → phát tiếp từ chỗ dừng. Hết phim → phim kế tiếp trong danh sách.
- R-RAP-3: Không có mạng hoặc link lỗi → màn hiện "Cần kết nối mạng để xem phim", không treo, đi lại bình thường.
- R-NHAC-1 / R-ON-1: viết sau khi có thiết kế trình nghe nhạc / màn ôn tập.

## Nhiệm vụ
**Đợt 1 — làm ngay (không cần giao diện mới)**
- [x] 1. Quyết định `0004-video-mang.md` + dòng CLAUDE.md "chạy offline (trừ video rạp phim)".
- [x] 2. Sổ quy tắc R-RAP-1..3 → online → `--mark-synced`.
- [x] 3. `zones/videos.ts`: 2–3 phim (link + giấy phép), kiểm link có CORS bằng `curl -I`.
- [x] 4. Kiểu `rap-phim` (màn khung gỗ, mái nhỏ, ghế dài bậc, đèn lồng hai bên) + đặc tả + Canvas 3D.
- [x] 5. `videoScreen.ts`: phát / dừng / tiếp phim, VideoTexture, màn chờ "Cần kết nối mạng".
- [x] 6. `main.ts`: ngồi ghế (dùng nút Thiền / ngồi có sẵn cho tới khi có nút "Ngồi xem" thiết kế), camera về màn, dừng
  khi đứng / xuống nền.
- [x] 7. `/canh`: hí đài → rạp phim, đổi biển trà lâu (樂坊 · phòng nhạc), Tàng Thư Các (giữ tên); ảnh + số đo.
- [x] 8. Phiếu thiết kế 3 giao diện (chọn phim, nghe nhạc, ôn tập).
- [x] 9. Đo hiệu năng (video texture ~ +1 draw call; giải mã video trên điện thoại yếu), build, kiểm tra cuối.

**Đợt 2 — sau khi có thiết kế**: bảng chọn phim, trình nghe nhạc (+ file nhạc), màn ôn tập (Flutter + cầu nối).

Ước: draw call + 2 (màn video, ghế gộp); tam giác + ~2k (ghế); bỏ hí đài − ~1k.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm run scene:check && npm run build · cd app && flutter analyze ·
flutter test -r failures-only · dart tool/rule_trace.dart

## Kết quả đợt 1 (2026-11-13)
- Rạp 影戲臺 tại (0; −12) — dời khỏi (0; −9) vì phiên "Truyền Tống Đài nhiều tầng" đặt đài 2 tầng giữa quảng trường
  (0; 0), chân ∅ ≈ 12,6 m. Bồ đoàn thay ghế dài (ngồi xếp bằng = tư thế ngồi thiền có sẵn). Trà lâu đổi biển 樂坊.
- Phim: 3 phim Wikimedia Commons (PD / CC BY-SA 3.0 / CC0), có CORS (`access-control-allow-origin: *`). Thử Chrome không
  giao diện: bản `.webm` VP9 lên hình; bản `.mov` H.264 chỉ ra tiếng (Chrome không H.264) → `VideoScreen` chọn định dạng
  theo `canPlayType`.
- Hiệu năng `?view=tren`: 138 draw call, ≈ 149,9k tam giác (bồ đoàn 8 cạnh); ngồi xem: 64 draw call.
- Chưa thử được bằng máy: ngồi xem thật (cần bấm nút) — thử trên điện thoại: Android (WebM), iOS (H.264), mất mạng,
  bật tiếng khi chạm, dừng khi app xuống nền.
- Ghi công CC BY-SA (Wonders of China) chưa hiện trong app — chờ thiết kế danh sách phim (phiếu).
