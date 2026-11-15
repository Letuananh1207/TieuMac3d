# Phiếu: Thanh công cụ đáy màn + bảng Biểu cảm + Túi đồ (HUD)
- Trạng thái: chờ thiết kế
- Đã vẽ: 2026-11-15.35 (15 artboard: thanh 5 nút + HUD dọc nâng 60, ở nhà, đang ngồi, trạng thái nút, bảng Biểu cảm + bong bóng hình, Túi đồ 4 mục cuộn — đặc tả `design/docs/screen_specs.md` mục "Thanh công cụ")
- Đợi bởi: kế hoạch `docs/tasks/2026-11-15-thanh-cong-cu.md` (V-20261115-64, nhiệm vụ 7–10)
- Ghi chú: viết theo phương án đề xuất của kế hoạch (dọc: thanh sát đáy, nâng joystick + cụm ≈ 60 px · ở nhà: Về nhà mờ ·
  Nhiệm vụ là nút riêng · Túi đồ là tấm đáy HTML). Người dùng chọn khác → sửa phiếu trước khi dán. Vòng trận chỉ còn ở
  Khởi Nguyên Trấn (V-65) → ở 6 vùng nút Bản đồ là cách đi nhanh chính.

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Thanh công cụ đáy màn + bảng Biểu cảm + Túi đồ (Học Xá 3D)

Màn: HUD (lớp nổi trên cảnh 3D) — vẽ trên HUD-doc 390×844 (safe trên 47, dưới 34) và HUD-ngang 844×390 (safe trái = phải 47,
dưới 21). Chất liệu hướng C "ngọc bích · lụa" như mọi HUD (frost + frost-line + frost-outline, chữ slate, nhấn jade, chấm gold).

MỤC ĐÍCH (kiểu thanh công cụ của 摩尔庄园): một hàng nút LUÔN HIỆN ở đáy màn để từ bất cứ đâu:
  1. Bản đồ — mở bản đồ truyền tống (cuộn tranh 3D có sẵn, "BanDo-*"), chạm nơi → cưỡi hạc đi luôn. Ở 6 vùng và Nhà của ta
     không còn vòng trận → đây là cách đi nhanh chính.
  2. Về nhà — một chạm, cưỡi hạc về "Nhà của ta".
  3. Biểu cảm — mở bảng 8 động tác nhân vật.
  4. Túi đồ — mở tấm túi đồ (hạt giống, nông sản, sách đang mượn, đồ trang trí).
  5. Nhiệm vụ — mở bảng nhiệm vụ hằng ngày có sẵn ("NhiemVu-*", màn Flutter) — có chấm son số việc còn lại.
Tên nút chỉ tiếng Việt. Mỗi nút: biểu tượng + nhãn ngắn (thiết kế chọn có nhãn luôn hay chỉ biểu tượng). Chạm ≥ 44.

BỐ CỤC — PHẢI SẮP LẠI HUD ĐÁY (đang có, số đo dọc):
  - Joystick gợi ý tròn 110, trái 36, dưới safe+28 (joystick thật hiện ở chỗ chạm trong 45 % trái màn).
  - Cụm hành động góc dưới phải 170×170 (phải 16, dưới safe+16): Nhảy tròn 68 jade · Chào 52 · Ngồi ôn 52 (chấm son).
  - Trò chuyện tròn 48: phải 20, dưới safe+204. Khung kênh thu gọn: trái 16, dưới 184, rộng ≤ 250.
  - Đọc sách (khi đang mượn sách) viên 52: phải 16, dưới safe+198 — đang cùng góc với Trò chuyện, có thể chồng → xếp lại luôn.
  - Trang trí (chỉ ở Nhà của ta) tròn 48: phải 20, dưới safe+276.
  - Góc trên: bản đồ nhỏ trái (148 dọc / 128 ngang), ví Văn tiền phải. Nút nổi bám vật (Nói chuyện, Ngồi, Xem bảng…) ở giữa cảnh.
  Dọc: khe đáy giữa joystick và cụm hành động chỉ ≈ 58 px → không đủ 5 nút.
  ĐỀ XUẤT dọc: thanh sát đáy cả chiều ngang (trên safe dưới), joystick + cụm hành động + cột phải (Trò chuyện, Đọc sách, Trang
  trí) + khung kênh NÂNG LÊN ≈ 60 px cho vừa. Phương án khác để so (vẽ thử nếu muốn): gọn cụm hành động (Chào chuyển vào bảng
  Biểu cảm, Nhảy 60) để thanh nằm khe giữa đáy, joystick giữ chỗ.
  Ngang: khe đáy giữa joystick (trái safe+28, tròn 100) và cụm (phải safe+12) ≈ 175…620 → thanh ở GIỮA ĐÁY, không nâng gì.
  Thanh không được đè: joystick, cụm hành động, Trò chuyện, Đọc sách, Trang trí, gợi ý "Chạm để bỏ qua" của cưỡi hạc. Chạm
  thanh không thành joystick (dù thanh nằm trong 45 % trái).

TRẠNG THÁI PHẢI VẼ (đều có dọc 390×844 + ngang 844×390, trừ ghi khác):
  1. Bình thường ở Khởi Nguyên Trấn: thanh 5 nút + HUD đã sắp lại (joystick, cụm, Trò chuyện, khung kênh 3 tin, bản đồ nhỏ, ví).
  2. Đang mượn sách + ở Nhà của ta: có thêm Đọc sách + Trang trí ở cột phải — kiểm không chồng.
  3. Đang ở Nhà của ta: nút Về nhà MỜ (vô hiệu); chạm → thẻ/tấm báo ngắn "Bạn đang ở Nhà của ta" ~2 s (vẽ thẻ).
  4. Nút Nhiệm vụ có chấm son: "2" (còn 2 việc), "1"; xong hết → không chấm. (một artboard trạng thái nút là đủ)
  5. Đang ngồi (Ngồi ôn / chỗ ngồi): thanh vẫn hiện, nút Biểu cảm MỜ; các nút khác sáng (chạm = đứng dậy rồi làm).
  6. Trạng thái từng nút: thường · đang nhấn (thu 94 %) · mờ (kính .6, biểu tượng 45 %, như nút hành động vô hiệu) ·
     đang mở (nút Biểu cảm / Túi đồ khi bảng của nó đang mở).
  7. BẢNG BIỂU CẢM: mở ngay trên thanh (nổi trên nút Biểu cảm hoặc dải trên thanh), 8 ô, mỗi ô 1 hình + tên Việt:
     Vẫy tay · Chắp tay · Cúi chào · Vỗ tay · Cười · Nhảy mừng · Suy nghĩ · Ngồi nghỉ.
     Chạm ô → bảng đóng, nhân vật diễn. Chạm ra ngoài / kéo joystick / nút quay lại → đóng. Dọc + ngang.
  8. BONG BÓNG BIỂU CẢM trên đầu nhân vật: chỉ HÌNH (không chữ), ~2,5 s, neo trên nhãn tên như bong bóng chat ("Chat-*").
     Vẽ 8 hình (hoặc 5 hình cho Vẫy tay, Vỗ tay, Cười, Nhảy mừng, Suy nghĩ — Chắp tay, Cúi chào, Ngồi nghỉ có thể không bóng:
     thiết kế chọn). Vẽ cạnh một bong bóng tin chat đang hiện (hai cái cùng lúc, không thay nhau).
  9. TẤM TÚI ĐỒ (tấm đáy kiểu bảng Vườn rau "VuonRau-kho-*": dọc cao ~392 bo trên 20 + tay nắm; ngang cột phải 310):
     - Đầu: "Túi đồ" + số dư Văn tiền (đồng xu như ví).
     - 4 ngăn (tab hoặc mục cuộn — thiết kế chọn): Hạt giống (loại × số, hình cây như cropArt) · Nông sản (loại × số) ·
       Sách (cuốn đang mượn, ví dụ "HSK 1 · Nhập môn" + nút "Đọc") · Đồ trang trí (vật đã có, đánh dấu "Đang đặt").
     - CHỈ XEM (không nút gieo / bán / đặt; chỉ "Đọc" sách). Mỗi ngăn trống có một dòng chỉ chỗ lấy.
     - Vẽ: đầy (3 loại hạt, 4 loại nông sản, có sách, 5 đồ) · trống hết (người mới) · ngăn Sách trống. Dọc + ngang.
     - Đóng: nút Đóng, kéo tay nắm xuống, chạm cảnh, nút quay lại.
  10. Thanh ẨN (chỉ cần ghi chú, không vẽ riêng): màn tải, cưỡi hạc, bài học / màn Flutter, bản đồ truyền tống, bản đồ lớn,
     hội thoại NPC, ngồi bàn chơi, chế độ trang trí, bảng vườn, ô nhập trò chuyện. Chọn: ẩn hẳn hay trượt xuống (ghi thời gian).

LUẬT PHẢI THEO (nháp — chờ người dùng duyệt; chép nguyên văn):
  R-THANH-1 Thanh công cụ: ở mọi cảnh (Khởi Nguyên Trấn, Nhà của ta, 6 vùng) đáy màn luôn có thanh 5 nút Bản đồ · Về nhà ·
    Biểu cảm · Túi đồ · Nhiệm vụ, trong safe area, không đè joystick, cụm nút hành động, Trò chuyện, Đọc sách, Trang trí
    (dọc: các nút đó nằm trên thanh; ngang: thanh ở giữa đáy). Ẩn khi: màn tải, cưỡi hạc, bài học / thẻ bộ thủ / màn Flutter
    phủ cảnh, bản đồ truyền tống, bản đồ lớn, hội thoại NPC, ngồi bàn chơi, chế độ trang trí, bảng vườn, ô nhập trò chuyện.
    Nút Nhiệm vụ có chấm son = số việc hôm nay còn lại (như "Xem bảng" — R-NV-3); xong cả 2 → không chấm. Máy tính: phím T
    (Bản đồ), H (Về nhà), B (Biểu cảm), I (Túi đồ), J (Nhiệm vụ).
  R-THANH-2 Chạm nút khi đang làm việc khác: đang ngồi (Ngồi ôn kể cả cuộn sách đang mở, chỗ ngồi, bồ đoàn, đôn trà) → chạm
    Bản đồ / Về nhà / Túi đồ / Nhiệm vụ: nhân vật đứng dậy rồi làm luôn, một chạm; Biểu cảm mờ khi đang ngồi. Đang nhảy →
    nút vẫn sáng, chạm thì làm ngay khi chạm đất. Đang đi / chào / biểu cảm → dừng lại rồi làm.
  R-HANH-6 Bản đồ truyền tống từ mọi nơi: bấm nút Bản đồ ở bất cứ đâu → bản đồ truyền tống mở như khi đứng trong vòng trận
    (cuộn bay lên từ chỗ nhân vật rồi trải trước camera; nhân vật đứng yên; chạm nơi có cảnh → đi; sắp mở → thẻ "<tên> — sắp
    mở"; nơi đang ở → không có gì; "Đóng bản đồ" / nút quay lại → đóng). Đi: cưỡi hạc; giảm chuyển động hoặc đang trong nhà →
    màn tải. Không tốn Văn tiền, không giới hạn lượt. Vòng trận (chỉ ở Truyền Tống Đài, trấn) và cổng đi bộ vẫn như cũ.
  R-HANH-7 Về nhà một chạm: bấm Về nhà ở bất cứ đâu ngoài Nhà của ta → đi ngay (không hỏi lại): cưỡi hạc (giảm chuyển động /
    trong nhà → màn tải "Nhà của ta") → đứng trước sân nhà, nhìn nhà chính. Đang ở Nhà của ta → nút Về nhà mờ; chạm → thẻ
    "Bạn đang ở Nhà của ta" khoảng 2 giây, không đi đâu.
  R-BIEU-1 Bảng biểu cảm: bấm Biểu cảm → bảng 8 biểu cảm mở ngay trên thanh: Vẫy tay · Chắp tay · Cúi chào · Vỗ tay · Cười ·
    Nhảy mừng · Suy nghĩ · Ngồi nghỉ (tên chỉ tiếng Việt, mỗi ô một hình). Chạm một → bảng đóng, nhân vật làm động tác tại
    chỗ + bong bóng hình trên đầu (chỉ hình — R-HUD-4) khoảng 2,5 giây. Chạm ra ngoài, kéo joystick, bấm lại Biểu cảm hoặc nút
    quay lại → bảng đóng, không làm gì. Đang bay / đang ngồi → nút Biểu cảm mờ.
  R-BIEU-2 Diễn và thôi: mỗi biểu cảm diễn một lần (Vẫy tay 1,8 s · Chắp tay 1,6 s · Cúi chào 2 s · Vỗ tay 1,6 s · Cười 1,8 s ·
    Nhảy mừng 1,6 s · Suy nghĩ 2,5 s) rồi về dáng đứng; Ngồi nghỉ ngồi xếp bằng tới khi đi — không mở cuộn sách, không tính
    học. Đi, nhảy, Ngồi ôn, Chào → thôi ngay; chọn biểu cảm khác → thay ngay.
  R-BIEU-3 Ai thấy: chỉ trên máy mình (chưa có máy chủ), không gửi lên kênh chung. Bong bóng hình theo cách vẽ của R-CHAT-2
    (cách camera > 25 m hoặc sau camera → không vẽ) và không thay bong bóng tin đang hiện. Giảm chuyển động → bong bóng hiện /
    tắt không phóng to.
  R-TUI-1 Túi đồ: bấm Túi đồ ở bất cứ đâu → tấm túi đồ mở: số dư Văn tiền + 4 ngăn Hạt giống (túi hạt), Nông sản (kho), Sách
    (cuốn đang mượn, nút "Đọc"), Đồ trang trí (vật đã có, đánh dấu vật đang đặt). Chỉ xem: gieo ở luống, bán ở thùng thu mua,
    đặt đồ ở chế độ trang trí, mua ở Tạp hoá. Ngăn trống → một dòng chỉ chỗ lấy. Đang mở: nhân vật đứng yên; đóng bằng nút
    Đóng, kéo tấm xuống, chạm cảnh hoặc nút quay lại.
  R-HUD-4 Chỉ tiếng Việt trên biển, tên và chữ trang trí — HUD không có chữ Hán (chữ Hán chỉ ở nội dung học).
  R-DIEU-1 Joystick ở 45 % trái màn, hiện ở chỗ chạm — chạm nút của thanh không thành joystick.
  R-MAN-1 Chữ và nút HUD luôn nằm ngoài vùng bị che (tai thỏ trái / phải, thanh hệ thống).

CHUỖI CÓ SẴN: "Đóng bản đồ", "Chạm một nơi để truyền tống", "<tên> — sắp mở" (map*); "Đọc sách", "Đọc"; tên cây hạt / nông
  sản (garden*), "Túi hạt", "Kho nông sản"; tên đồ trang trí (decor*); "Nhà của ta"; "Bảng nhiệm vụ hằng ngày".
CHUỖI MỚI CẦN ĐẶT (gợi ý tên khoá):
  toolbarMap "Bản đồ" · toolbarHome "Về nhà" · toolbarEmote "Biểu cảm" · toolbarBag "Túi đồ" · toolbarDaily "Nhiệm vụ" ·
  toolbarDailyAria "Nhiệm vụ, còn {n} việc" · homeHere "Bạn đang ở Nhà của ta" ·
  emoteWave "Vẫy tay" · emoteBow "Chắp tay" · emoteDeepBow "Cúi chào" · emoteClap "Vỗ tay" · emoteLaugh "Cười" ·
  emoteCheer "Nhảy mừng" · emoteThink "Suy nghĩ" · emoteRest "Ngồi nghỉ" ·
  bagTitle "Túi đồ" · bagSeeds "Hạt giống" · bagCrops "Nông sản" · bagBooks "Sách" · bagDecor "Đồ trang trí" ·
  bagPlaced "Đang đặt" · bagSeedsEmpty "Chưa có hạt — mua ở Tạp hoá Khởi Nguyên Trấn" · bagCropsEmpty "Kho trống — thu hoạch
  ở vườn Nhà của ta" · bagBooksEmpty "Chưa mượn sách — mượn ở Tàng Thư Các" · bagDecorEmpty "Chưa có đồ — mua ở Tạp hoá" ·
  bagClose "Đóng". (Thiết kế sửa câu chữ thoải mái.)

DÙNG LẠI: nút tròn kính 48–52 (Chào / Ngồi ôn / Trò chuyện — components.md), chấm son badge (Ngồi ôn, Xem bảng), tấm đáy +
  tay nắm (Vườn rau, Danh mục trang trí), thẻ đồ trang trí (TrangTri-the-vat), hình cây (VuonRau), đồng xu (VanTien), bong
  bóng chat (Chat-*), tấm báo (VuonRau-tam-bao). Token: frost, frost-strong, frost-line, frost-outline, slate, jade,
  jade-press, gold, lacquer, map-paper; radius.pill / card / button; shadow.hud; layout.touch-target, layout.safe-area.

GỢI Ý (không bắt buộc): thanh kiểu "viên thuốc kính" nổi, 5 ô đều nhau; nút Bản đồ có thể nổi bật hơn (cách đi chính ở vùng);
  biểu tượng nét 2 px như bộ nút hiện có (cuộn bản đồ, mái nhà, mặt cười, túi vải, cuộn trúc / lá cờ). Hình biểu cảm vẽ SVG
  đơn sắc / hai màu (không emoji hệ thống — app chạy offline, emoji mỗi máy một khác).

APP ĐANG CÓ:
  web/index.html + web/src/style.css (#joyGhost, #actions, #readBook), web/src/ui/chat.css (#chatBtn, #chatFeed),
  web/src/ui/decor.css (#decorBtn), web/src/ui/areaMap.css (bản đồ nhỏ), web/src/ui/wallet.css (ví) — vị trí như mục Bố cục.
  Bản đồ truyền tống: web/src/scene/banDo.ts (cuộn 3D) + web/src/ui/mapHud.ts (gợi ý, thẻ sắp mở, Đóng bản đồ).
  Bảng vườn: web/src/ui/gardenPanel.ts + garden.css (tấm đáy hạt / kho). Bong bóng: web/src/ui/chatBubbles.ts.
  Chưa có: thanh công cụ, bảng biểu cảm, bong bóng hình, túi đồ, thẻ "đang ở nhà".
```
