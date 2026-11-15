# Thanh công cụ đáy màn (kiểu 摩尔庄园): Bản đồ · Về nhà · Biểu cảm · Túi đồ · Nhiệm vụ
- Yêu cầu: "ở trong game 摩尔 có 1 thanh công cụ để người dùng mở map để di chuyển đến các vùng, về nhà nhanh, biểu cảm,...
  hãy suy nghĩ để thêm vào". Người dùng đã chọn: nút **Bản đồ truyền tống**, **Về nhà**, **Biểu cảm**, **Túi đồ + nhiệm vụ**;
  **đi được ngay từ mọi nơi** (chạm nơi có cảnh → cưỡi hạc luôn; Về nhà một chạm → cưỡi hạc về Nhà của ta; vòng trận + cổng
  đi bộ vẫn giữ); **luôn hiện hàng nút ở đáy màn** (dọc + ngang, không đè joystick / cụm hành động / Trò chuyện / Ngồi ôn —
  sắp lại HUD nếu cần, safe area).
- Việc: V-20261115-64 · nhánh `viec/thanh-cong-cu`
- Loại: thêm (HUD mới + luồng đi lại + động tác nhân vật) · sửa hành vi (R-HANH-2/5, R-NHA-1, R-NV-3) · Cỡ: **lớn**
- Trạng thái: **chờ thiết kế** — phần lõi (1–6, 11) xong trên nhánh `viec/thanh-cong-cu-2`; 7–10 chờ phiếu; 12 bỏ qua. Trước đó: **đã duyệt 2026-11-15** — người dùng chọn 1A (thanh sát đáy, nâng HUD ~60 px), 2A (ở nhà: nút mờ + thẻ), 3A (hai nút Túi đồ / Nhiệm vụ, thanh 5 nút), 4A (túi đồ tấm đáy web); NV1 chờ V-65 gộp (phần HUD: chờ thiết kế — phiếu `docs/phieu_thiet_ke/2026-11-15-thanh-cong-cu.md`)

## Liên quan việc song song V-65 (xoá vòng trận ở 6 vùng)

Người dùng đã quyết (2026-11-15): **chỉ Khởi Nguyên Trấn còn vòng trận** (Truyền Tống Đài); vòng ở cả 6 vùng bị xoá, chỗ
cũ thành sân đá trống làm **bãi hạc đáp**. V-65 sửa R-HANH-2 / R-HANH-5 / R-BANDO-2. Hệ quả cho việc này:
- Ở vùng **không còn cách nào mở bản đồ** ngoài nút Bản đồ trên thanh → nút Bản đồ là **cách đi nhanh chính** khi ở vùng
  (ra khỏi vùng chỉ còn: nút Bản đồ, nút Về nhà, cổng đi bộ nếu cảnh có). Thanh vì thế **không được ẩn lâu** ở vùng: mọi
  trạng thái ẩn đều là tạm (màn phủ / thoại / bàn chơi…), đóng là hiện lại.
- Nháp luật dưới viết theo trạng thái mới (vòng trận chỉ ở trấn). **Nhiệm vụ 1 phải làm sau khi V-65 gộp** (cùng sửa
  R-HANH-2/5): rebase lên main rồi viết lại câu sửa trên chữ mới của V-65; chỗ xuất hiện ở vùng / chỗ hạc đáp lấy theo V-65.

## Đang có / thiếu (khoanh phạm vi 2026-11-15)

| Phần | Đang có | Thiếu |
|---|---|---|
| HUD đáy / góc (dọc 390×844) | joystick gợi ý tròn 110 trái 36 dưới safe+28 (`style.css` `#joyGhost`; joystick thật hiện ở chỗ chạm trong 45 % trái — R-DIEU-1); cụm hành động 170×170 phải 16 dưới safe+16 (Nhảy 68 · Chào 52 · Ngồi ôn 52 — `ui/actionButtons.ts`, `#actions`); Trò chuyện phải 20 dưới safe+204 (`ui/chat.css` `#chatBtn`); khung kênh thu gọn trái 16 dưới safe+184 (`#chatFeed`); Đọc sách phải 16 dưới safe+198 (`#readBook`); Trang trí (chỉ ở nhà) phải 20 dưới safe+276 (`ui/decor.css` `#decorBtn`); bản đồ nhỏ góc trên trái (`ui/miniMap.ts`), ví góc trên phải (`ui/wallet.css`); nút nổi bám vật (Nói chuyện, Ngồi, Xem bảng, Vào tiệm, Cách chơi, luống vườn) | **thanh đáy**; khoảng trống đáy giữa joystick (x 36…146) và cụm hành động (x 204…374) chỉ **≈ 58 px** — không đủ 4–5 nút → phải nâng joystick + cụm + cột phải, hoặc gọn cụm. Ngang 844×390: khoảng đáy giữa ≈ 175…620 — đủ chỗ, không cần nâng |
| Bản đồ truyền tống | cuộn 3D `scene/banDo.ts` (`open(from, states)` bay lên từ `from` rồi trải trước camera), HUD `ui/mapHud.ts` (gợi ý, thẻ "sắp mở", "Đóng bản đồ"); mở chỉ khi nạp vòng trận (`zones/ringCharge.ts`, `main.ts` `openMap` / `onMapTap` / `travel`) | mở từ nơi không có vòng (nhà, vùng xa vòng, trong nhà) — `openMap` đã dùng `world.teleport?.center ?? player.position` nên **gần như sẵn** |
| Cưỡi hạc | `zones/cuoiHac.ts` `wantsCrane` chỉ khi `how === 'vong'`; `craneDeparts(params, how)`; `main.ts` `travel(to, 'vong' \| 'cong')`, về nhà thêm `tu=` | kiểu đi "thanh" (bản đồ / Về nhà từ thanh) cũng cưỡi hạc; **trong nhà / dưới mái / tầng 2 → màn tải** (hạc không sà vào phòng) |
| Về nhà | chỉ qua bản đồ (chạm "Nhà của ta") hoặc đi bộ cổng xuống núi (R-NHA-1); `HOME_SCENE`, `isHome` ở `main.ts` | nút một chạm; trường hợp đang ở nhà |
| Nhiệm vụ hằng ngày | `openDaily` (`main.ts`) → Flutter `bridge.openDaily` (màn 日課榜) / bảng HTML `ui/dailyPanel.ts`; mở từ nút "Xem bảng" ở bảng Cổng Trấn hoặc hỏi Tiểu Mặc (R-NV-3); số việc còn lại `zones/dailyBoard.ts` `tasksLeft` | mở từ bất cứ đâu (gọi lại `openDaily` — không cần cầu nối mới) + chấm son trên nút |
| Túi hạt / kho nông sản | `ui/gardenPanel.ts` (bảng chọn hạt, kho + bán, mở ô) — chỉ ở Nhà của ta, gần luống / thùng; dữ liệu `getGarden` (`seeds`, `barn`) chỉ hỏi ở cảnh có `garden` (`homeGarden.ts`) | xem túi / kho ở mọi cảnh → hỏi `getGarden` ngoài nhà (cầu nối có sẵn, chỉ đổi lúc hỏi) |
| Sách đang mượn | `getProgress.book`, nút "Đọc sách" `ui/readBookButton.ts` (R-SACH-2) | hiện trong túi đồ (+ "Đọc") |
| Đồ trang trí đã có | `getHome.owned` (R-NHA-4), chỉ hỏi ở cảnh có `decorSlots` | ngăn trong túi đồ (chỉ xem) |
| Động tác nhân vật | `CharacterState` (`player/character.ts`): `mps`, `air`, `vy`, `sit`, `bow`, `idle`, (`strike`, `pluck` cho NPC). Nhân vật chính = `design/models/nhan-vat.glb` (model AI **không có xương**) → `player/autoRig.ts` **tự gắn 7 xương**: `root`, `hips`, `head`, `armL`, `armR`, `legL`, `legR` (không khuỷu tay, không ngón). Dáng dựng bằng code trong `player/glbCharacter.ts`: đi / chạy, nhảy, ngồi xếp bằng, chắp tay chào 拱手 1,6 s (`controller.ts` `bow()`, `BOW_TIME`), đứng lâu vươn vai / nhìn quanh (R-DIEU-8), gõ mõ, gảy đàn | biểu cảm (`emote`) — **làm được bằng 7 xương hiện có**, không cần model / clip mới (giải thích ở mục Biểu cảm) |
| Bong bóng trên đầu | `ui/chatBubbles.ts` + `chat/bubbleTimer` (R-CHAT-2: 6 s, 1 bóng / người, >25 m / sau camera không vẽ), 3 kiểu mình / người khác / NPC | kiểu bong bóng **hình** (biểu tượng biểu cảm) |
| Phím máy tính | `input/keyboard.ts` `ACTION_KEYS`: Space nhảy, F chào, C ngồi ôn, E ngồi, Enter chat, M bản đồ lớn, Esc quay lại | phím cho 5 nút (đề xuất T · H · B · I · J) |

Ghi nhận phụ (không thuộc việc này, báo để kiểm): `#readBook` (phải 16, dưới safe+198, cao 52, rộng theo chữ) và
`#chatBtn` (phải 20, dưới safe+204) nằm cùng góc — đang mượn sách có thể chồng nhau. Phiếu nhờ thiết kế xếp lại cả cột phải.

## Phạm vi

**Sẽ sửa**
- `docs/testing/quy_tac.md` — sửa R-HANH-2, R-HANH-5, R-NHA-1, R-NV-3, R-DIEU-1, R-MAN-2; thêm R-HANH-6/7, R-THANH-1/2, R-BIEU-1…4, R-TUI-1 (nháp dưới).
- `web/src/zones/thanhCongCu.ts` (mới, thuần) — trạng thái từng nút theo ngữ cảnh + việc khi chạm (đứng dậy trước / chờ chạm đất / thẻ "đang ở nhà").
- `web/src/zones/bieuCam.ts` (mới, thuần) — danh sách 8 biểu cảm (mã, tên Việt, thời lượng, giữ hay một lần), luật huỷ / thay.
- `web/src/zones/cuoiHac.ts` — `TravelHow` thêm `'thanh'`; `wantsCrane` nhận `indoor` (trong nhà → màn tải).
- `web/src/player/character.ts` — `CharacterState.emote?: { id; t }` (không bắt buộc — nhân vật cũ bỏ qua; hợp đồng `Character` không đổi).
- `web/src/player/controller.ts` — `emote(id)` / `stopEmote()` như `bow()`: đếm thời gian, đi / nhảy / ngồi → thôi.
- `web/src/player/glbCharacter.ts` — dáng 8 biểu cảm bằng 7 xương tự gắn.
- `web/src/thanhCongCu.ts` (mới, file ghép riêng) — mở bản đồ từ mọi nơi, Về nhà, mở nhiệm vụ, biểu cảm, túi đồ; `main.ts` chỉ vài dòng gọi.
- `web/src/main.ts` — `travel(to, how)` nhận `'thanh'`; `openMap(from)` từ nhân vật; chuỗi `mapBack` thêm bảng biểu cảm / túi đồ; cờ trạng thái cho thanh.
- `web/src/input/keyboard.ts` — phím T / H / B / I / J.
- (chờ thiết kế) `web/src/ui/toolbar.ts` + `ui/toolbar.css`, `ui/emotePanel.ts`, `ui/bagPanel.ts`, `ui/chatBubbles.ts` (kiểu hình), `web/index.html`, `style.css` / `chat.css` / `decor.css` (dời joystick, cụm, cột phải, khung kênh).
- `web/src/designPreview.ts` — Canvas 3D `?dang=bieu-cam&bc=<mã>` để duyệt dáng.
- `.claude/skills/lead/SKILL.md` bảng tính năng — thêm dòng "thanh công cụ, biểu cảm, túi đồ" (lúc code).

**Cần kiểm tra**
- `web/src/ui/actionButtons.ts` + test, `ui/chatPanel.ts`, `ui/readBookButton.ts`, `ui/decorHud.ts`, `ui/gardenHud.ts`, `ui/gameHud.ts` (vị trí sau khi dời; lớp `body.*` ẩn / hiện).
- `web/src/homeGarden.ts` (hỏi `getGarden` ngoài nhà không được dựng vườn / nút luống), `homeDecor.ts` (`getHome` ngoài nhà).
- `web/src/ngoiMat.ts`, `gamePlay.ts` (đứng dậy rồi mở bản đồ: camera về ngôi 3 trước khi cuộn trải).
- `web/src/cuoiHac.ts` (cất cánh khi đứng sát tường / dưới cây — hạc đáp 2,5 m trước mặt, không va chạm).
- `web/src/areaMapRoom.ts` (bản đồ lớn đóng khi bản đồ truyền tống chen vào — R-BANDO-5), `ui/miniMap.ts`.
- `web/src/zones/ringCharge.ts` (mở bằng thanh khi đang nạp vòng → `rearm`).
- `docs/bridge.md` — chỉ ghi thêm lúc hỏi `getGarden` / `getHome` (cả ngoài nhà, khi mở túi đồ); không đổi tên / dạng.

**Không đụng**
- Flutter `app/lib/` (nếu quyết định 4 = A: túi đồ bằng HTML; bảng nhiệm vụ dùng màn Flutter có sẵn).
- Luật vườn / ví / sách (`garden.dart`, `wallet.dart`, `vuon.ts`) — túi đồ **chỉ xem**.
- Vòng trận, cổng đi bộ, vòng sáng Về nhà / Khởi Nguyên Trấn — giữ nguyên.
- Model `.glb`, đặc tả cảnh `design/scene/*.json`.
- Multiplayer: biểu cảm chỉ mình thấy, không gửi lên kênh.

## Giả định (đã tự chọn — người dùng sửa nếu khác)
- Đi bằng thanh **miễn phí, không giới hạn lượt** (không tốn Văn tiền).
- Về nhà đi **ngay**, không hỏi lại (một chạm như người dùng muốn); lỡ tay thì cưỡi hạc vẫn bỏ qua được nhưng vẫn tới nhà.
- Đang ngồi (Ngồi ôn kể cả cuộn sách đang mở, chỗ ngồi, bồ đoàn, đôn trà): chạm Bản đồ / Về nhà / Túi đồ / Nhiệm vụ →
  **tự đứng dậy rồi làm** (một chạm); Biểu cảm mờ khi ngồi.
- Ngồi bàn chơi, hội thoại NPC, chế độ trang trí, bảng vườn, ô nhập trò chuyện, mọi màn phủ (bài học, màn Flutter, Tạp hoá,
  bản đồ truyền tống, bản đồ lớn, màn tải, cưỡi hạc) → **thanh ẩn** (các thứ đó đã chiếm đáy màn / là bước phải xong trước).
- Đang nhảy: nút vẫn sáng; chạm → làm ngay khi chạm đất (≤ 0,6 s). Đang đi / chào / biểu cảm → dừng lại rồi làm.
- Trong nhà (dưới mái một nhà vào được, tầng 2) đi bằng thanh → **màn tải** thay hạc (hạc sà xuống trong phòng sẽ xuyên mái).
- Giảm chuyển động: Bản đồ / Về nhà → màn tải như R-HANH-5; biểu cảm **vẫn diễn** (chỉ nhân vật cử động, camera đứng yên);
  bong bóng hiện / tắt không phóng to.
- Nút Chào ở cụm hành động **giữ nguyên** (nếu quyết định 1 chọn A); "Chắp tay" trong bảng biểu cảm gọi cùng động tác.

## Cần người dùng quyết định
1. **Bố cục dọc** (khoảng đáy giữa joystick và cụm chỉ 58 px):
   A. Thanh nằm **sát đáy, cả chiều ngang**; joystick, cụm hành động, cột phải (Trò chuyện, Đọc sách, Trang trí) và khung
   kênh **nâng lên ≈ 60 px**. Ngang: thanh giữa đáy, không nâng gì. **(đề xuất — rõ ràng, giống 摩尔, không bỏ nút nào)**
   B. **Gọn cụm hành động**: chuyển Chào vào bảng Biểu cảm, Nhảy 60, Ngồi ôn đặt cạnh → thanh vừa khe giữa đáy, joystick
   giữ chỗ cũ (đổi R-DIEU-6/7, mất 1 nút quen tay).
   C. Để phiên thiết kế thử cả A và B trên canvas rồi chọn.
2. **Đang ở Nhà của ta bấm Về nhà**:
   A. Nút **mờ**; chạm → thẻ "Bạn đang ở Nhà của ta" 2 giây, không đi đâu. **(đề xuất — nút không đổi nghĩa)**
   B. Ở nhà nút **đổi thành "Về trấn"** (cưỡi hạc về Khởi Nguyên Trấn, đứng ở cổng trấn).
   C. Đưa về **trước cửa nhà** (0; 6,5) — màn tải ngắn (đỡ khi lạc ra Bến mây).
3. **Túi đồ + nhiệm vụ**:
   A. **Hai nút riêng** — thanh 5 nút; nút Nhiệm vụ có chấm son số việc còn lại. **(đề xuất — vòng chơi hằng ngày thấy ngay)**
   B. Một nút "Túi đồ", trong có ngăn "Nhiệm vụ" mở bảng nhiệm vụ (thanh 4 nút, chấm son nằm trên nút Túi đồ).
4. **Túi đồ dựng ở đâu**:
   A. **Tấm đáy HTML trong web** (như bảng Vườn rau) — dữ liệu có sẵn qua `getProgress` / `getGarden` / `getHome`, không cầu
   nối mới, chạy cả chế độ thử trình duyệt. **(đề xuất)**
   B. **Màn Flutter** (như Tạp hoá) — cần sự kiện mới `openBag`, hai phía cùng sửa.

## Biểu cảm đề xuất (8)

Làm **bằng 7 xương tự gắn** (`autoRig.ts`) — mỗi biểu cảm là một hàm dáng theo thời gian `t` trong `glbCharacter.ts`, như
chào / vươn vai đang có. Vì sao không cần gì thêm: model AI không có xương, nhưng dự án đã tự gắn xương vai / hông / đầu /
chân và đã diễn được chào, ngồi, gõ mõ, gảy đàn bằng cách này; không có khuỷu tay nên động tác tay là "cả cánh tay" (kiểu
chibi — hợp phong cách). Không thêm mesh / đèn / texture → draw call không đổi; đo fps trước / sau theo luật 4 cho chắc.
Clip làm sẵn (Mixamo) không dùng được vì model không có xương chuẩn.

| Mã | Tên (chuỗi) | Dáng (7 xương) | Thời lượng | Bong bóng hình |
|---|---|---|---|---|
| `vay-tay` | Vẫy tay | tay phải giơ cao, lắc qua lại 3 nhịp, đầu nghiêng nhẹ | 1,8 s | bàn tay vẫy |
| `chap-tay` | Chắp tay | = Chào 拱手 đang có (`bow`) | 1,6 s | (không — hoặc hình tay chắp) |
| `cui-chao` | Cúi chào | hai tay xuôi trước bụng, hông gập sâu ≈ 45°, giữ 0,6 s rồi đứng | 2 s | (không) |
| `vo-tay` | Vỗ tay | hai tay đưa ra trước, khép – mở 4 nhịp | 1,6 s | hai tay vỗ |
| `cuoi` | Cười | đầu ngửa nhẹ, vai / thân rung nhịp nhanh, tay ôm bụng (tay khép trước) | 1,8 s | mặt cười |
| `nhay-mung` | Nhảy mừng | hai tay giơ chữ V, **bật nhẹ tại chỗ 2 lần** (chỉ dáng — gốc hình lên 0,25 m, không phải nhảy vật lý) | 1,6 s | sao / pháo hoa nhỏ |
| `suy-nghi` | Suy nghĩ | tay phải đưa lên cằm, đầu nghiêng, thân lắc chậm | 2,5 s | "…" / dấu hỏi |
| `ngoi-nghi` | Ngồi nghỉ | ngồi xếp bằng như Ngồi ôn **nhưng không mở cuộn, không tính học**, giữ tới khi đi | giữ | (không) |

- Bong bóng hình: kiểu mới của bong bóng trên đầu (chỉ **hình** — không chữ Hán, R-HUD-4), ~2,5 s; không thay bong bóng tin.
- Chỉ mình thấy (chưa có máy chủ). Sau này multiplayer: gửi `emote` qua kênh như tin chat.
- NPC phản ứng (gợi ý, nhiệm vụ tuỳ chọn 12): NPC đứng trong 4 m, mình quay về phía họ, Vẫy tay / Chắp tay / Cúi chào →
  NPC quay mặt lại + chào đáp (dáng chào có sẵn cho NPC autoRig) + một câu ngắn lên kênh (`chat.npcSay`), mỗi NPC tối đa
  1 lần / 30 s.

## Nháp luật (chưa ghi sổ — duyệt xong mới chép vào `docs/testing/quy_tac.md` rồi `/dong-bo-quy-tac`)

Viết theo phương án đề xuất (1A, 2A, 3A, 4A); người dùng chọn khác thì sửa chữ tương ứng.

**Sửa**
- **R-DIEU-1** thêm câu: "Chạm lên một nút của thanh công cụ (R-THANH-1) không thành joystick, không xoay camera."
- **R-HANH-2** (trên chữ mới của V-65: vòng trận chỉ ở Truyền Tống Đài, Khởi Nguyên Trấn) — chỗ nói vùng / Nhà của ta
  không có vòng trận → "… đi bằng bản đồ truyền tống mở từ nút Bản đồ trên thanh công cụ (R-HANH-6), nút Về nhà (R-HANH-7)
  hoặc đi bộ …". Thêm câu cuối: "Ngoài vòng trận ở trấn, bản đồ mở được ở mọi nơi bằng nút Bản đồ trên thanh công cụ
  (R-HANH-6) — ở 6 vùng và Nhà của ta đó là cách duy nhất mở bản đồ."
- **R-HANH-5** — "Chỉ có khi đi bằng vòng trận; cổng đi bộ (R-HANH-4), vòng sáng Về nhà, mở app → màn tải." → "Có khi đi
  bằng bản đồ truyền tống (vòng trận ở trấn hoặc nút Bản đồ trên thanh công cụ — R-HANH-6) và nút Về nhà (R-HANH-7), trừ
  khi đang đứng **trong nhà** (dưới mái một nhà vào được, tầng 2) → màn tải; cổng đi bộ (R-HANH-4), vòng sáng Về nhà, mở
  app → màn tải." Cất cánh từ thanh: hạc đáp trước mặt nhân vật ở chỗ đang đứng (không cần bãi hạc); hạ cánh ở nơi đến
  theo V-65 (bãi hạc đáp ở vùng)."
- **R-NHA-1** — "(1) chạm 'Nhà của ta' trên bản đồ truyền tống (R-HANH-2) ở trấn hay ở một vùng" → "(1) chạm 'Nhà của ta'
  trên bản đồ truyền tống (vòng trận ở trấn, hoặc nút Bản đồ ở bất cứ đâu — R-HANH-6), hoặc bấm nút **Về nhà** trên thanh công
  cụ ở bất cứ đâu (R-HANH-7)"; "ở nhà không có chỗ nào mở bản đồ truyền tống" → "ở nhà không có vòng trận — bản đồ chỉ
  mở bằng nút Bản đồ trên thanh công cụ".
- **R-NV-3** thêm cách mở thứ ba: "hoặc bấm nút **Nhiệm vụ** trên thanh công cụ ở bất cứ đâu (R-THANH-1)".
- **R-MAN-2** — "đổi vùng (vòng trận R-HANH-2, cổng đi bộ R-HANH-4)" → "đổi vùng (bản đồ truyền tống R-HANH-2/6, nút Về
  nhà R-HANH-7, cổng đi bộ R-HANH-4)".

**Mới**

| Mã | Quy tắc | Ví dụ |
|---|---|---|
| R-THANH-1 | **Thanh công cụ**: ở mọi cảnh (Khởi Nguyên Trấn, Nhà của ta, 6 vùng) đáy màn luôn có thanh 5 nút **Bản đồ · Về nhà · Biểu cảm · Túi đồ · Nhiệm vụ**, trong safe area, không đè joystick, cụm nút hành động, Trò chuyện, Đọc sách, Trang trí (dọc: các nút đó nằm trên thanh; ngang: thanh ở giữa đáy). **Ẩn** khi: màn tải, cưỡi hạc, bài học / thẻ bộ thủ / màn Flutter phủ cảnh, bản đồ truyền tống, bản đồ lớn, hội thoại NPC, ngồi bàn chơi, chế độ trang trí, bảng vườn, ô nhập trò chuyện. Nút Nhiệm vụ có chấm son = số việc hôm nay còn lại (như "Xem bảng" — R-NV-3); xong cả 2 → không chấm. Máy tính: phím T (Bản đồ), H (Về nhà), B (Biểu cảm), I (Túi đồ), J (Nhiệm vụ). | Ở Trúc Lâm còn 2 việc → thanh 5 nút ở đáy, Nhiệm vụ chấm "2". Nói chuyện với Tiểu Mặc → thanh ẩn; đóng khung → hiện lại. Ngồi vào bàn cờ → thanh ẩn; "Rời bàn" → hiện. Chạm nút Túi đồ nằm trong 45 % trái màn → không hiện joystick. |
| R-THANH-2 | **Chạm nút khi đang làm việc khác**: đang ngồi (Ngồi ôn kể cả cuộn sách đang mở, chỗ ngồi, bồ đoàn, đôn trà) → chạm Bản đồ / Về nhà / Túi đồ / Nhiệm vụ: nhân vật đứng dậy (camera về như khi đứng dậy — R-DIEU-7) rồi làm luôn, một chạm; Biểu cảm mờ khi đang ngồi. Đang nhảy → nút vẫn sáng, chạm thì làm ngay khi chạm đất. Đang đi / chào / biểu cảm → dừng lại rồi làm. Đang nạp vòng trận → huỷ nạp, bản đồ mở (đóng bản đồ rồi muốn nạp lại phải ra khỏi vòng rồi vào — R-HANH-2). | Ngồi ôn, cuộn đang mở, bấm Về nhà → đứng dậy, cưỡi hạc về nhà. Đang ngồi đôn trà bấm Biểu cảm → không có gì (nút mờ). Nhảy lên, giữa không trung bấm Bản đồ → chạm đất là bản đồ mở. |
| R-HANH-6 | **Bản đồ truyền tống từ mọi nơi**: bấm nút Bản đồ trên thanh công cụ ở bất cứ đâu (trấn, nhà, vùng, trong nhà, tầng 2) → bản đồ truyền tống mở **như khi đứng trong vòng trận** (R-HANH-2): cuộn bay lên từ chỗ nhân vật rồi trải trước camera; nhân vật đứng yên; chạm nơi có cảnh → đi; sắp mở → thẻ "<tên> — sắp mở"; nơi đang ở → không có gì; "Đóng bản đồ" / nút quay lại → đóng, đi lại được. Đi: cưỡi hạc (R-HANH-5); giảm chuyển động hoặc đang trong nhà → màn tải. Nơi đến đứng đúng chỗ xuất hiện của R-HANH-2. Không tốn Văn tiền, không giới hạn lượt. Vòng trận (chỉ ở Truyền Tống Đài, trấn) và cổng đi bộ vẫn như cũ; ở 6 vùng và Nhà của ta đây là cách duy nhất mở bản đồ. | Đứng giữa phố chợ (xa Truyền Tống Đài) bấm Bản đồ → cuộn mở; chạm Trúc Lâm → hạc đáp trước mặt → bay → hạ ở bãi hạc đáp, đứng ở chỗ xuất phát Trúc Lâm. Ở Trúc Lâm (không còn vòng trận) bấm Bản đồ → chạm Khởi Nguyên Trấn → hạ ở (0; 48). Ở Nhà của ta bấm Bản đồ → "Nhà của ta" là nơi đang ở; chạm Khởi Nguyên Trấn → hạ ở (0; 48). Trên tầng 2 Tàng Thư Các chạm Trúc Lâm → màn tải "Trúc Lâm" (không hạc). |
| R-HANH-7 | **Về nhà một chạm**: bấm nút Về nhà ở bất cứ đâu ngoài Nhà của ta → đi ngay (không hỏi lại) như chạm "Nhà của ta" trên bản đồ: cưỡi hạc (giảm chuyển động / trong nhà → màn tải "Nhà của ta") → đứng (0; 6,5) trên lối lát trước sân, nhìn nhà chính, hạc đáp (2,5; 6,5). **Đang ở Nhà của ta** → nút Về nhà mờ; chạm → thẻ "Bạn đang ở Nhà của ta" khoảng 2 giây, không đi đâu. | Ở Trúc Lâm bấm Về nhà → ≈ 5,7 s sau đứng ở (0; 6,5) (máy nhanh). Ở Bến mây Nhà của ta bấm Về nhà → thẻ "Bạn đang ở Nhà của ta", nhân vật không dịch. Bật giảm chuyển động, ở trấn bấm Về nhà → màn tải "Nhà của ta". |
| R-BIEU-1 | **Bảng biểu cảm**: bấm Biểu cảm → bảng 8 biểu cảm mở ngay trên thanh: Vẫy tay · Chắp tay · Cúi chào · Vỗ tay · Cười · Nhảy mừng · Suy nghĩ · Ngồi nghỉ (tên chỉ tiếng Việt, mỗi ô một hình). Chạm một → bảng đóng, nhân vật làm động tác **tại chỗ** + bong bóng **hình** trên đầu (chỉ hình — R-HUD-4) khoảng 2,5 giây. Chạm ra ngoài, kéo joystick, bấm lại Biểu cảm hoặc nút quay lại → bảng đóng, không làm gì. Đang bay / đang ngồi → nút Biểu cảm mờ. | Bấm Biểu cảm → 8 ô; chạm Vẫy tay → bảng đóng, tay phải giơ vẫy 3 nhịp, bóng hình bàn tay trên đầu. Bấm Biểu cảm rồi kéo joystick → bảng đóng, nhân vật đi. |
| R-BIEU-2 | **Diễn và thôi**: mỗi biểu cảm diễn một lần theo thời lượng (Vẫy tay 1,8 s · Chắp tay 1,6 s = Chào R-DIEU-7 · Cúi chào 2 s · Vỗ tay 1,6 s · Cười 1,8 s · Nhảy mừng 1,6 s · Suy nghĩ 2,5 s) rồi về dáng đứng; **Ngồi nghỉ** ngồi xếp bằng tới khi đi — không mở cuộn sách, không tính học, nút Ngồi ôn không sáng. Đi (joystick, phím), nhảy, Ngồi ôn, Chào → thôi biểu cảm ngay; chọn biểu cảm khác khi đang diễn → thay ngay. "Nhảy mừng" chỉ là dáng (bật nhẹ tại chỗ), không phải nhảy, không vượt vật cản. Sau biểu cảm, đếm đứng lâu (R-DIEU-8) lại từ 0. | Chọn Suy nghĩ, giây thứ 1 kéo joystick → thôi ngay, đi. Chọn Ngồi nghỉ → ngồi xếp bằng, 10 s sau vẫn ngồi, không có cuộn sách; kéo joystick → đứng dậy đi. Đang Vỗ tay chọn Cười → đổi ngay sang Cười. |
| R-BIEU-3 | **Ai thấy biểu cảm**: chỉ trên máy mình (chưa có máy chủ), không gửi lên kênh chung. Bong bóng hình theo cách vẽ của R-CHAT-2 (cách camera > 25 m hoặc sau camera → không vẽ) và không thay bong bóng tin đang hiện. Giảm chuyển động → vẫn diễn, bong bóng hiện / tắt không phóng to. | Đang có bong bóng tin "chào" → chọn Vỗ tay → cả hai cùng hiện. |
| R-BIEU-4 | *(tuỳ chọn — chưa làm)* **NPC đáp lại**: NPC đứng cách dưới 4 m, ở trước mặt mình (lệch hướng mặt < 60°), mình Vẫy tay / Chắp tay / Cúi chào → NPC quay mặt về phía mình, chắp tay chào đáp và nói một câu ngắn trên kênh chung; mỗi NPC tối đa một lần mỗi 30 giây. | Đứng cách Tiểu Mặc 2 m, nhìn về Tiểu Mặc, Vẫy tay → Tiểu Mặc quay lại chào, kênh: "Tiểu Mặc: Chào sư huynh!". |
| R-TUI-1 | **Túi đồ**: bấm Túi đồ ở bất cứ đâu → tấm túi đồ mở: số dư Văn tiền + 4 ngăn **Hạt giống** (túi hạt — R-VUON-3), **Nông sản** (kho — R-VUON-7), **Sách** (cuốn đang mượn — R-SACH-2, nút "Đọc" như nút Đọc sách), **Đồ trang trí** (vật đã có, đánh dấu vật đang đặt — R-NHA-4). **Chỉ xem**: gieo ở luống, bán ở thùng thu mua, đặt đồ ở chế độ trang trí, mua ở Tạp hoá. Ngăn trống → một dòng chỉ chỗ lấy (vd. "Mua hạt ở Tạp hoá Khởi Nguyên Trấn"). Mở ở cảnh nào cũng thấy đúng số đã lưu. Đang mở: nhân vật đứng yên; đóng bằng nút Đóng, kéo tấm xuống, chạm cảnh hoặc nút quay lại. | Ở Trúc Lâm, túi 3 hạt Cải ngọt, kho 4 Ngô, đang mượn HSK 1 → bấm Túi đồ: Hạt giống "Cải ngọt × 3", Nông sản "Ngô × 4", Sách "HSK 1" + "Đọc"; chạm "Đọc" → mở sổ từ HSK 1. Chưa có hạt → ngăn Hạt giống ghi dòng chỉ Tạp hoá. |

## Nhiệm vụ

Làm được ngay (sau khi duyệt) — 1…6, 11; chờ thiết kế (phiếu `2026-11-15-thanh-cong-cu`) — 7…10; tuỳ chọn — 12.

- [x] 1. **Luật** (2026-11-15: đã ghi sổ — sửa R-DIEU-1, R-HANH-2/4/5, R-NHA-1, R-NV-3, R-MAN-2; thêm R-THANH-1/2, R-HANH-6/7, R-BIEU-1/2/3, R-TUI-1; R-BIEU-4 **không ghi** (NV12 chưa làm); R-HANH-4 sửa thêm (câu "cổng đi bộ là đường duy nhất" của V-65); **chưa đồng bộ online** — phiên chính chạy `/dong-bo-quy-tac` sau khi gộp) (sau khi V-65 gộp — cùng sửa R-HANH-2/5): chép nháp trên vào `docs/testing/quy_tac.md` (sửa R-DIEU-1, R-HANH-2/5, R-NHA-1, R-NV-3, R-MAN-2; thêm
  R-THANH-1/2, R-HANH-6/7, R-BIEU-1…4, R-TUI-1 — cột App `sửa`, R-BIEU-4 `chưa làm`) → `/dong-bo-quy-tac`. (sổ · xong khi
  `rule_trace --pending` trống)
- [x] 2. **Trạng thái thanh thuần** `web/src/zones/thanhCongCu.ts`: vào cờ ngữ cảnh (`hidden`-các màn, `sitting`, `air`,
  `atHome`, `tasksLeft`) → từng nút `on | off` + chấm; khi chạm → việc (`stand-then`, `after-land`, `home-here`). (zones ·
  test `thanhCongCu.test.ts` R-THANH-1/2, R-HANH-7 · xong khi đỏ → xanh)
- [x] 3. **Đi bằng thanh** (Về nhà = `travel('nha-ta', 'thanh')` — `HOME_SCENE` là mã trấn `tong-mon`, không phải nhà; URL tách ra `zones/cuoiHac.ts` `travelParams`; thẻ "Bạn đang ở Nhà của ta" tạm chỉ ghi Console — chờ NV10): `zones/cuoiHac.ts` `TravelHow` thêm `'thanh'`, `wantsCrane({…, indoor})`; `main.ts`
  `travel(to, 'thanh')`, `openMap(from = player)` (cuộn bay từ nhân vật), ring đang nạp → `rearm`; Về nhà = `travel(HOME_SCENE,
  'thanh')` (giữ `tu=`). (zones + ghép · test `cuoiHac.test.ts` R-HANH-5/6/7 · xong khi `?debug` `__hocXaTravel` + phím T/H
  đi được từ phố chợ, nhà, tầng 2 → màn tải)
- [x] 4. **Dữ liệu biểu cảm** (test ở `web/src/bieuCam.test.ts` — cần cả `player/` lẫn `zones/`) `web/src/zones/bieuCam.ts` (8 mã, tên Việt, thời lượng, `hold`), luật thôi / thay. (zones ·
  test `bieuCam.test.ts` R-BIEU-2)
- [x] 5. **Động tác 3D** (dáng ở `player/bieuCamDang.ts`; Canvas 3D `?dang=bieu-cam[&bc=<mã>][&t=<giây>]` qua `bieuCamPreview.ts`; artifact không phục vụ `.glb` → trên link Canvas 3D là đệ tử khối, không thấy dáng — xem bằng `npm run build:design` + `vite preview` trên máy; chờ người dùng duyệt ảnh; fps chưa đo trên Android): `CharacterState.emote?`, `controller.ts` `emote()` / thôi khi đi-nhảy-ngồi-chào (như `bow`),
  `glbCharacter.ts` 8 dáng bằng 7 xương; `chibi` / `disciple` bỏ qua (không lỗi). Canvas 3D `?dang=bieu-cam&bc=<mã>`
  (`designPreview.ts`) để người dùng duyệt dáng. Draw call: +0. (player · thử tay + ảnh 8 dáng · đo fps trước / sau ·
  xong khi người dùng duyệt ảnh)
- [x] 6. **Ghép** (I = Túi đồ chỉ ghi Console tới NV9; B rồi 1…8 trong 4 s) `web/src/thanhCongCu.ts`: nối 2–5 + `openDaily` từ mọi nơi + hỏi `getGarden` / `getHome` ngoài nhà khi
  mở túi; phím T / H / B / I / J (`input/keyboard.ts`); B chọn biểu cảm tạm bằng phím số 1–8 tới khi có bảng; `mapBack`
  đóng bảng biểu cảm / túi trước. `main.ts` thêm vài dòng. (ghép · xong khi trên máy tính dùng được hết bằng phím)
- [ ] 7. **HUD thanh đáy + sắp lại HUD** — chờ thiết kế (`2026-11-15-thanh-cong-cu`): `ui/toolbar.ts` + `ui/toolbar.css`,
  `index.html`; dời `#joyGhost`, `#actions`, `#chatBtn`, `#chatFeed`, `#readBook`, `#decorBtn` theo thiết kế (dọc + ngang,
  safe area); lớp `body.*` ẩn thanh. (ui · `actionButtons.test.ts` vẫn xanh · xem máy dọc + ngang)
- [ ] 8. **Bảng biểu cảm + bong bóng hình** — chờ thiết kế: `ui/emotePanel.ts`, `ui/chatBubbles.ts` kiểu hình, 8 biểu
  tượng SVG (`ui/emoteIcons.ts`). (ui)
- [ ] 9. **Túi đồ** — chờ thiết kế: `zones/tuiDo.ts` (view thuần: ngăn, dòng trống — test R-TUI-1), `ui/bagPanel.ts` (tấm đáy
  kiểu `gardenPanel`). (zones + ui)
- [ ] 10. **Thẻ "Bạn đang ở Nhà của ta"** + nút Về nhà mờ — chờ thiết kế (dùng lại tấm báo nếu thiết kế cho). (ui)
- [x] 11. **Tài liệu** (`getGarden` / `getHome` chưa đổi lúc hỏi — làm cùng NV9; `bridge.md` ghi đổi vùng bằng thanh): `docs/bridge.md` cột "khi" của `getGarden` / `getHome` (thêm: mở túi đồ ở mọi cảnh); bảng tính năng
  `.claude/skills/lead/SKILL.md`. (docs)
- [ ] 12. *(tuỳ chọn)* **NPC đáp lại** R-BIEU-4 — `townNpcs.ts` / `player/npc.ts` quay mặt + chào, `chat.npcSay`. (player + ghép)

Ước lượng: 1–6 + 11 ≈ 1 phiên lớn (luật + logic + 8 dáng); 7–10 ≈ 1 phiên sau khi thiết kế chốt; 12 ≈ nửa phiên.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/guard.dart ·
dart tool/rule_trace.dart · đo fps (Android tầm trung ≥ 30) trước / sau biểu cảm · xem máy dọc + ngang: thanh không đè
joystick / cụm / Trò chuyện / Đọc sách / Trang trí, tai thỏ trái / phải · cd app && flutter analyze (nếu 4B)
