# NPC khất nhi + người gõ mõ báo giờ
- Yêu cầu: "tôi cần thêm 2 nhân vật là NPC Ăn mày khất nhi, gõ mõ báo giờ đi quanh map"
- Việc: V-20261114-31 · nhánh `viec/npc-khat-nhi-mo`
- Loại: thêm (NPC, luật tiền, âm thanh, cầu nối) · Cỡ: lớn · Trạng thái: chờ duyệt (phần hình chờ thiết kế: phiếu ảnh
  `2026-11-14-anh-khat-nhi`, `2026-11-14-anh-go-mo`)
- Người dùng đã chọn: ngoại hình **chờ model AI** (bộ ảnh 4 góc → Hunyuan3D trên máy người dùng), **không dựng khối tạm
  trong cảnh app**. Khất nhi ngồi một chỗ, xin Văn tiền mỗi ngày một lần, cho thì được mẹo / tin đồn. Người gõ mõ đi vòng
  cố định cả ngày, đầu mỗi giờ GMT+7 gõ mõ và rao giờ, nói chuyện được, tiếng mõ nhỏ dần theo khoảng cách.
- Hồ sơ khảo cứu: `docs/tham_khao/khat-nhi-go-mo.md`. Tên trong game chỉ tiếng Việt (luật V-28): **Tiểu Khất**
  (mã `khat-nhi`), **Lão Canh** (mã `go-mo`).

## Phạm vi
**Sẽ sửa** (mới):
- `web/src/zones/gioVN.ts`: giờ GMT+7 (từ `Date.now()`, không theo múi giờ máy), mã ngày VN, canh giờ / canh đêm, câu rao,
  số tiếng mõ. Thuần, có vitest. Dùng chung với ngày đêm V-27: bên nào gộp trước thì tạo, bên sau dùng lại.
- `web/src/player/npcRoute.ts`: đường đi vòng (polyline khép kín), vị trí theo đồng hồ thật, dừng đầu giờ, chờ khi bị chặn,
  đuổi kịp sau khi thoại. Thuần, có vitest.
- `web/src/zones/alms.ts`: luật cho tiền Tiểu Khất (số tiền, mỗi ngày một lần, đếm số lần đã cho) + chọn tin đồn trong ngày.
  `web/src/zones/tinDon.ts`: danh sách mẹo / tin đồn, mỗi câu ghi mã luật mà nó nói tới.
- `web/src/zones/moGo.ts`: âm lượng và độ lệch trái / phải theo khoảng cách, nhịp tiếng gõ (thuần).
- `web/src/ui/moSound.ts`: phát tiếng mõ bằng Web Audio (`AudioBuffer` → `GainNode` → `StereoPannerNode`). Mở tiếng ở lần
  chạm đầu tiên; dừng khi app xuống nền, tab ẩn hoặc màn che (như `ambientMusic.ts`).
- `web/src/nhac/mo.wav` + `web/scripts/mo-wav.mjs`: tiếng mõ tự tổng hợp bằng script trong repo, giấy phép CC0 (tự tạo).
  File để trong thư mục nhạc sẵn có, không thêm thư mục.
- `web/src/townNpcs.ts`: file ghép riêng (như `chatRoom.ts`). Lo NPC đi, vật cản di động, gọi báo giờ, thoại Tiểu Khất,
  tiếng mõ. `main.ts` chỉ thêm vài dòng.

**Sẽ sửa** (có sẵn):
- `web/src/scene/spec.ts`: thêm `'khat-nhi'`, `'go-mo'` vào `NPC_IDS`; trong `NpcSpec` thêm `pose?: 'dung' | 'ngoi'`,
  `scale?` (mặc định 1), `route?: [x, z][]`, `speed?`. Thiếu trường thì như cũ, cảnh cũ không đổi (quy tắc 8).
- `web/src/player/npc.ts`: NPC ngồi (tư thế `sit` sẵn có của dáng chibi), cỡ riêng, số đo xương (`NPC_RIGS`) cho hai model
  mới (đo sau khi có model).
- `web/src/zones/dialogs.ts`: thoại Tiểu Khất (có trạng thái: chưa cho / đã cho hôm nay / thiếu tiền), thoại Lão Canh (hỏi
  giờ thì đọc giờ hiện tại). Thêm `action: 'alms'` trong `DialogChoice`.
- `web/src/chat/npcChatter.ts`: thêm câu có sẵn cho Tiểu Khất. Lão Canh không nói câu ngẫu nhiên, chỉ rao giờ.
- `web/src/zones/walletRules.ts` + `app/lib/journey/wallet.dart`: luật cho tiền, sửa cả hai file cùng ví dụ sổ (R-TIEN-7).
  `TrialWallet` thêm `alms`.
- `app/lib/journey/progress_store.dart`: lưu `alms: {lastDay, count}`. `app/lib/scene/`: xử lý sự kiện `giveAlms`.
- `docs/bridge.md` + `web/src/bridge/`: sự kiện mới `giveAlms`; `getProgress` thêm `alms`.
- `web/scripts/check-scene.mjs`: kiểm `route` (khép kín, mỗi đoạn cách vật cản ≥ 0,6 m, nằm trên nền đi được, dốc ≤ 35°).
- `web/src/designPreview` / `web/design.html`: Canvas 3D `?dang=go-mo` vẽ đường đi và cho NPC thế chạy thử.
- `docs/testing/quy_tac.md`: R-NPC-6, R-NPC-7, R-NPC-8, R-TIEN-8, R-AM-1 (nháp bên dưới). Sửa R-NPC-1 (có NPC đi / ngồi),
  R-CHAT-3 (Lão Canh chỉ rao giờ), R-TIEN-1 (ví ẩn khi thoại vẫn giữ).
- Bảng "Bản đồ tính năng" trong `.claude/skills/lead/SKILL.md`: thêm một dòng.

**Cần kiểm tra**: `main.ts` (vòng lặp NPC, `npcInTalkRange`: NPC đi thì vị trí đổi mỗi khung), `chatRoom.ts` (neo bong
bóng theo `root.position`, đã đúng với NPC đi), `collision/colliders.ts` (`Circle` sửa được x, z; không cần API mới),
`ui/ambientMusic.ts` (cùng cách mở tiếng), `walletRoom.ts` (hiệu ứng "−n" ở ví HUD), bản đồ (R-BANDO: không vẽ NPC, giữ
nguyên), `gamePlay.ts` (NPC bàn chơi không đụng).

**Không đụng**: `PlayerController` (NPC không chạy qua controller, xem điểm quyết 2), `reference/`, `design/`
(thiết kế chỉ đọc; đặt NPC vào `scene.json` là việc `/canh` sau khi có model), các vùng khác ngoài Khởi Nguyên Trấn.

## Đường đi đề xuất (Lão Canh, vòng B)
Vòng khép kín một chiều, đi bên phải đường, tránh mọi vật đang có. Không đi qua khu đông (V-26 đang dời Truyền Tống Đài và
mở cổng mới) và khu tây (V-29 đang xoay khu vui chơi). Trên Thiên Bậc chỉ đi giữa bậc (V-30 lập khu tiện ích hai bên).
Không xuống lối núi V-23: quay đầu ở z 34, trước cổng "Xuống núi" (z 41) và biển gỗ (3,4; 37,6).

| # | (x; z) | Chỗ | Ghi chú |
|---|---|---|---|
| 0 | (2,5; 34) | cuối đường Cổng Trấn, làn đông | cách biển gỗ ≥ 3,6 m, đèn đá (4,6; 39,4) ≥ 5 m |
| 1 | (−2,5; 34) | quay sang làn tây | người chơi mới vào ở (0; 36): thấy Lão Canh ngay |
| 2 | (−2,5; 18) | qua cổng nam Quảng Trường | cổng rộng 9,6 m (x −4,8 … 4,8) |
| 3 | (−8; 10) | vào Quảng Trường | cách tùng (−12,5; 12) 4,9 m |
| 4 | (−8; −8) | dọc phía tây trong sân | cách bồn hoa (−3,5; ±3,5) ≥ 4,5 m |
| 5 | (−2,5; −14) | tới cổng bắc | cách tùng (−12,5; −12,5) ≥ 6 m |
| 6 | (−2,5; −19) | chân Thiên Bậc | bậc từ z −20 tới −53, rộng 6,4 m |
| 7 | (−1,5; −52) | lên đỉnh bậc (cao 11 m) | không vào sân trà lâu (mặt trước z −54,4) |
| 8 | (1,5; −52) | quay đầu | |
| 9 | (1,5; −20) | xuống bậc, làn đông | |
| 10 | (2,5; −14) | qua cổng bắc vào sân | |
| 11 | (8; −8) | phía đông trong sân | sư phụ ở (21,5; −4,5) ngoài tường, không vướng |
| 12 | (8; 8) | | cách tùng (12,5; 10) 4,9 m |
| 13 | (2,5; 14) | ra cổng nam | cách Tiểu Mặc (7,6; 13,6) ≥ 3,5 m, cách bảng nhiệm vụ (5,5; 15,2) ≥ 3 m |
| 14 | (2,5; 18) | | rồi về điểm 0 |

Dài ≈ 192 m (tính cả dốc bậc). Đi 1,1 m/s, một vòng ≈ 175 s (≈ 3 phút), cộng 12 s dừng ở đầu mỗi giờ. Toạ độ chốt lại
bằng `npm run scene:check` khi `/canh` ghi `route` vào `scene.json`. Nếu V-26 / V-29 / V-30 gộp trước và đặt vật lên làn
đường thì máy kiểm báo, chỉnh vài điểm.

**Tiểu Khất ngồi ở (−6,2; 25,6), mặt nhìn về đông (`rotY` 90)**: ven đường Cổng Trấn, chéo trước cửa Tạp hoá (cửa ở
x ≈ −8, z 30; cách 4,6 m nên nút "Vào tiệm" và nút "Nói chuyện" không chồng nhau), cạnh đèn đá (−4,5; 27,5). Cách làn tây
của Lão Canh 3,7 m.

## Thiết kế kỹ thuật (tóm tắt)
- **Đồng hồ chung GMT+7**: `vnNow = Date.now()/1000 + 7·3600`, lấy giờ, phút, mã ngày từ đó. Máy đặt múi giờ nào cũng như
  nhau, và sau này nhiều người chơi thấy cùng một giờ (giống đài phát R-NHAC-1, ngày đêm V-27).
- **NPC đi theo đồng hồ** (`npcRoute.ts`): giây đã đi trong ngày = giây VN từ 0 giờ trừ 12 s cho mỗi đầu giờ đã qua. Quãng
  `s = giây_đi × speed mod dài_vòng` cho ra điểm trên polyline và hướng nhìn theo đoạn (xoay mượt ở góc). Độ cao lấy từ
  `groundAt`. Vì vậy NPC ẩn ở ngoài 35 m vẫn "đi" đúng chỗ, mở lại app cũng thấy ông đúng chỗ của giờ đó.
- **Lệch cục bộ**: khi đang thoại hoặc bị người chơi chặn, NPC đứng lại và tích "nợ" quãng đường. Sau đó đi nhanh ×1,3
  tới khi hết nợ. Nếu NPC đang ẩn thì nhảy thẳng về đúng chỗ, không ai thấy.
- **Bị chặn**: người chơi đứng phía trước, trong cung ±60°, cách < 1,3 m → NPC đứng chờ. Chờ quá 3 s thì nói một lần trên
  bong bóng: "Đạo hữu nhường lão một bước nhé." Vật cản tròn bán kính 0,45 dời theo NPC mỗi khung (sửa `Circle.x/z`).
  NPC không đi xuyên người chơi, người chơi không đi xuyên NPC.
- **Dáng**: dùng `loadGlbCharacter` (hợp đồng `Character`, xương tự gắn `autoRig` có sẵn dáng đi) và
  `animate(dt, speed, {mps})`. Gõ mõ: thêm `strike` 0..1 không bắt buộc vào `CharacterState` (tay phải giơ dùi, tay trái
  đưa mõ ra trước). Nhân vật chính bỏ qua trường này. Tiểu Khất ngồi: `state.sit = 1` của dáng có sẵn.
- **Không dùng `PlayerController`**: controller đọc joystick, nhảy, ngồi, va chạm trượt tường; NPC trên đường đã kiểm thì
  không cần. Quy tắc 5 ("di chuyển ở PlayerController") là cho nhân vật người chơi, giữ nguyên.
- **Âm thanh**: một `AudioContext` dùng chung cho cả trang. Mỗi tiếng gõ phát một `AudioBufferSourceNode` từ `mo.wav`
  (≈ 0,25 s, ≈ 20 KB). Âm lượng = 1 khi cách ≤ 3 m, giảm đều về 0 ở 30 m, ngoài 30 m không phát. Lệch trái / phải theo góc
  giữa hướng camera và NPC (−0,6 … 0,6). Lý do không dùng `PannerNode` HRTF: tốn máy, khó viết test; cách tự tính cho phép
  viết hàm thuần có test (như R-NHAC-1).
- **Thoại + ví**: chọn "Cho 5 văn" → đóng khung → gửi `giveAlms` (có Flutter) hoặc tự tính trên ví thử (không Flutter).
  Được thì ví HUD chạy "−5 · Cho Tiểu Khất", rồi Tiểu Khất nói tin đồn của ngày trong khung thoại.
- **Chỉ ở Khởi Nguyên Trấn**: hai NPC nằm trong `npcs` của `design/scene/scene.json`. Các cảnh khác không có.

## Hiệu năng
- Mỗi model NPC (8 000 tam giác, nén meshopt, không-sáng) = 1 draw call. Đạo cụ gộp mỗi NPC một mesh = 1 draw call. Tổng
  **+4 draw call**, ≈ +16 300 tam giác. NPC ẩn khi cách ≥ 35 m (R-NPC-1), nên phần lớn thời gian chỉ 0–2 cái đang vẽ.
- Xương tự gắn: `autoRig` đã chạy cho nhân vật chính và NPC (skinning 6 xương, rẻ). Model AI không có rig sẵn, cũng không có
  clip `walk`: dáng đi là dáng lập trình sẵn trong `glbCharacter.ts`.
- Âm thanh: giải mã `mo.wav` một lần, mỗi giờ gõ 3–5 tiếng. Không đáng kể.
- Mỗi khung: 1 phép tính vị trí trên polyline (15 đoạn) + 1 kiểm chặn. Không đáng kể.

## Luật nghiệp vụ NHÁP (chưa vào sổ; duyệt xong mới ghi `docs/testing/quy_tac.md` → `/dong-bo-quy-tac`)
| Mã | Quy tắc | Ví dụ |
|---|---|---|
| R-NPC-6 | **Tiểu Khất** (mã `khat-nhi`): cậu bé ăn xin **ngồi xếp bằng** ven đường Cổng Trấn, chéo trước cửa Tạp hoá, mặt nhìn ra đường, có bát gỗ đặt trước mặt và gậy trúc dựng bên cạnh. Nói chuyện theo R-NPC-2; xưng "tiểu khất", gọi "đạo hữu". **Chưa cho hôm nay**: câu đầu xin tiền; lựa chọn "Cho 5 văn" (R-TIEN-8), "Hôm nay ta không có tiền lẻ", "Tạm biệt". Cho → cảm ơn rồi kể **tin đồn của ngày** (mẹo / tin trong trấn, đúng luật đang có). Không cho → câu vui vẻ khác, không có tin. **Đã cho hôm nay** → "Hôm nay đạo hữu cho rồi, mai ghé nhé!" và có lựa chọn "Nhắc lại tin hôm nay". Tiểu Khất **nhớ số lần** đạo hữu đã cho (giữ qua lần mở app): đủ 3 lần thì chào "Ân nhân lại tới!"; đủ 10 lần thì thêm câu "Tiểu khất nhớ ơn đạo hữu mãi." Tin đồn đổi mỗi ngày theo lượt, hết danh sách mới quay lại. | Ngày 14, chưa cho → "Đạo hữu ơi, cho tiểu khất xin vài văn mua bánh…"; chọn "Cho 5 văn" → ví −5 → "Đa tạ đạo hữu! Nghe đồn Kỳ Văn Uyển đánh một ván Đấu chữ thắng được 8 văn đó…". Nói lại cùng ngày → "Hôm nay đạo hữu cho rồi…". Lần cho thứ 3 (ba ngày khác nhau) → câu đầu "Ân nhân lại tới!". |
| R-TIEN-8 | **Cho Tiểu Khất**: mỗi lần cho đúng **5 Văn tiền**, **mỗi ngày tối đa một lần**. Ngày mới bắt đầu lúc **0 giờ giờ Việt Nam (GMT+7)**, không theo giờ máy. Ví dưới 5 → lựa chọn "Cho 5 văn" thay bằng "Ta chỉ còn n văn…", không trừ được. Cho được → trừ 5 ngay, lưu ngày cho + tăng số lần đã cho (lưu trên máy; chạy trình duyệt không có Flutter thì lưu ở ví thử, R-TIEN-7). Ví HUD chạy "−5 · Cho Tiểu Khất". Không có thưởng tiền ngược lại. | Có 12, 10 giờ sáng ngày 14 → cho → còn 7; 23 giờ 59 cùng ngày → không cho được nữa; 0 giờ 01 ngày 15 (GMT+7) → cho lại được. Có 3 → "Ta chỉ còn 3 văn…", ví vẫn 3. Máy đặt múi giờ London lúc 18 giờ ngày 14 (là 1 giờ sáng ngày 15 ở VN) → đã sang ngày mới. |
| R-NPC-7 | **Lão Canh** (mã `go-mo`): NPC **biết đi**. Đi một vòng cố định quanh Khởi Nguyên Trấn cả ngày (Cổng Trấn → Quảng Trường → lên Thiên Bậc → xuống → Quảng Trường → Cổng Trấn), tốc độ 1,1 m/s, dáng đi bộ, quay mặt theo hướng đi. Chỗ của ông tính theo **đồng hồ thật GMT+7**: mở app lúc nào cũng thấy ông ở đúng chỗ của giờ đó, ẩn ngoài 35 m vẫn đi tiếp. Có vật cản tròn bán kính 0,45 đi theo ông. Người chơi đứng chặn ngay phía trước (< 1,3 m) → ông đứng chờ; chờ quá 3 s thì nói một lần "Đạo hữu nhường lão một bước nhé." Nói chuyện theo R-NPC-2 → **ông dừng tại chỗ, quay về phía người chơi** trong lúc thoại (ngoại lệ của R-NPC-1); đóng khung thì đi tiếp, nhanh hơn một chút tới khi về đúng chỗ theo giờ. Lựa chọn "Bây giờ là giờ gì?" → đọc giờ hiện tại theo R-NPC-8. | 10 giờ 05 → Lão Canh ở đúng một điểm trên vòng, hai máy giống nhau. Đứng chắn trước mặt ông trên Thiên Bậc → ông dừng; 3 s sau bong bóng "Đạo hữu nhường lão…". Thoại 30 s → đóng → ông đi nhanh ×1,3 trong ≈ 100 s rồi đi bình thường. |
| R-NPC-8 | **Báo giờ**: đầu mỗi giờ GMT+7 (hh:00:00), Lão Canh **dừng 12 giây** tại chỗ đang đứng, gõ mõ rồi rao. Ban đêm (19 giờ – 5 giờ sáng) gõ **số tiếng bằng số canh** (canh một 1 tiếng … canh năm 5 tiếng); ban ngày gõ 3 tiếng. Câu rao: tên canh giờ (giờ lẻ là "đầu giờ …", giờ chẵn là "chính giờ …"), kèm giờ hiện đại trong ngoặc, cộng một câu theo buổi. Rao trên **kênh chung** (R-CHAT-3): khung kênh của mọi người trong trấn đều nhận được, bong bóng trên đầu ông chỉ vẽ theo R-CHAT-2. Lão Canh **không** nói câu ngẫu nhiên 40–90 s như NPC khác. | 23:00 → 3 tiếng (canh ba), rao "Canh ba, đầu giờ Tý (11 giờ đêm) — Trời hanh vật khô, cẩn thận đèn đuốc!". 7:00 → 3 tiếng, "Đầu giờ Thìn (7 giờ sáng) — Trời sáng rồi, ai học chữ thì học đi thôi!". 12:00 → "Chính giờ Ngọ (12 giờ trưa) — Nắng đứng bóng, nghỉ tay uống chén trà." |
| R-AM-1 | **Tiếng mõ**: âm thanh đóng gói (không tải mạng), mỗi tiếng gõ phát một lần. Âm lượng theo khoảng cách từ nhân vật tới Lão Canh (chỉ xét x, z): **≤ 3 m đầy**, giảm đều, **≥ 30 m không nghe**. Lệch tai trái / phải theo vị trí ông so với hướng camera. Đang có màn che (bài học / ôn / bảng / Tạp hoá), app xuống nền hoặc tab ẩn → không phát (tiếng lỡ thì bỏ, không phát bù). WebView chặn tiếng khi chưa chạm → mở tiếng ở lần chạm kế tiếp. Không có nút tắt riêng. | Cách 2 m → âm lượng 1; cách 16,5 m → 0,5; cách 30 m → 0. Ông đứng bên trái màn hình → nghe lệch tai trái. Đang mở bài học lúc 9:00 → không nghe gõ. |

**Sửa luật cũ** (cùng lúc): R-NPC-1 thêm "trừ NPC có đường đi (R-NPC-7) và NPC ngồi (R-NPC-6)"; R-CHAT-3 thêm "Lão Canh chỉ
rao giờ (R-NPC-8)"; R-TIEN-5 thêm nhãn "−5 · Cho Tiểu Khất" (nhãn trừ tiền như Tạp hoá).

## Giả định / cần quyết định
Mỗi điểm có 2–3 phương án, **in đậm** là đề xuất.

1. **Đường đi Lão Canh**. A: vòng ngắn Quảng Trường + Cổng Trấn (≈ 110 m, 1 phút 40 s / vòng; người chơi trên Thiên Bậc
   không gặp ông) · **B: vòng trên, có cả Thiên Bậc lên tới trước trà lâu (≈ 192 m, ≈ 3 phút)** · C: vòng cả trấn qua khu
   Truyền Tống Đài và Kỳ Văn Uyển (làm sau khi V-26 / V-29 gộp, phải vẽ lại đường).
   Duyệt B xong người dùng thấy: một ông lão đội nón đi từ cuối đường Cổng Trấn vào Quảng Trường, lên bậc tới trước trà lâu
   rồi quay xuống, chừng 3 phút một vòng.
2. **Cách NPC đi**. **A: theo đồng hồ thật trên đường cố định, đường đã kiểm không vướng gì, chỉ dừng chờ khi bị chặn** ·
   B: mô phỏng tự do trong máy (né vật bằng `colliders.resolve`, đi qua PlayerController): mỗi máy một chỗ, sau này nhiều
   người chơi thấy khác nhau, dễ kẹt góc tường.
   Duyệt A xong người dùng thấy: tắt app rồi mở lại, ông vẫn ở chỗ đúng giờ đó; hai điện thoại mở cùng lúc thấy ông cùng chỗ.
3. **Chỗ ngồi Tiểu Khất**. **A: ven đường Cổng Trấn, chéo trước Tạp hoá (−6,2; 25,6)**, ai mới vào trấn cũng đi qua · B: ngay
   ngoài cổng nam Quảng Trường, sát tường (−6,5; 18,8) · C: chân Thiên Bậc, đường lên trà lâu (−4; −21; V-30 có thể đặt tiện ích ở đây).
   Duyệt A xong người dùng thấy: từ chỗ bắt đầu (0; 36) đi lên vài bước, bên trái có cậu bé ngồi cạnh đèn đá, trước mặt là
   cái bát.
4. **Số tiền xin**. A: 2 văn · **B: 5 văn** (bằng thưởng một lần ôn đúng 2/2; đỡ hơn nửa ván Đấu chữ) · C: người chơi chọn 1 / 5 / 10
   văn, cho nhiều thì tin hay hơn (thêm nhánh thoại, thêm luật).
   Duyệt B xong người dùng thấy: lựa chọn "Cho 5 văn", ví góc trên phải "−5".
5. **Giờ sang ngày của Tiểu Khất**. **A: 0 giờ GMT+7**, cùng đồng hồ với Lão Canh và ngày đêm · B: 0 giờ giờ máy, như thưởng trò
   chơi R-TIEN-3 và nhiệm vụ ngày hiện nay. Nếu chọn A, sau này nên đưa R-TIEN-3 / R-NV về GMT+7 luôn (việc riêng, chưa làm).
   Ở Việt Nam hai cách giống hệt nhau; chỉ khác khi máy đặt múi giờ khác.
6. **Cách rao giờ**. **A: canh giờ + giờ hiện đại trong ngoặc** ("Đầu giờ Thìn (7 giờ sáng)…"), ban đêm thêm "canh …". Người
   học hiểu ngay và học luôn tên canh giờ · B: chỉ canh giờ cổ ("Giờ Thìn đã điểm") · C: chỉ giờ hiện đại ("Bảy giờ sáng rồi").
7. **Nguồn tiếng mõ**. **A: tự tổng hợp ra file `mo.wav` bằng script trong repo** (tiếng gỗ rỗng: sóng 900 Hz + bội 2,7 lần,
   tắt nhanh, thêm tiếng tách đầu). Giấy phép CC0 tự tạo, offline, ≈ 20 KB, sửa tiếng bằng cách đổi tham số · B: tổng hợp
   ngay lúc chạy bằng Web Audio, không có file (người dùng có nói "file đóng gói") · C: bản thu thật CC0 trên Freesound
   (tiếng thật hơn, nhưng phải tải về, soát giấy phép từng file, ghi nguồn).
   Duyệt A xong người dùng thấy (nghe): đứng gần ông lúc đầu giờ nghe "cốc · cốc · cốc" rõ, đi xa nhỏ dần, ngoài ≈ 30 m im.
8. **Rao giờ trên kênh chung**. **A: cả trấn nhận dòng rao trong khung kênh** (như chuông trấn, xem giờ được), bong bóng chỉ khi
   gần · B: chỉ người cách ≤ 30 m (nghe được tiếng mõ) mới nhận dòng rao.
9. **Đạo cụ (bát, gậy, mõ, dùi, đèn lồng)**. **A: dựng bằng khối trong code, gắn vào xương tay / đặt trên đất**; model AI để tay
   không, xương tự gắn không rách, đèn lồng bật được ban đêm · B: vẽ luôn vào ảnh cho AI dựng (tay dính vật, không gõ được,
   không bật đèn được).
10. **Tên**. **A: "Tiểu Khất" và "Lão Canh"** · B: "Khất Nhi" và "Lão Mõ" · C: người dùng đặt.
11. **Nhớ người cho**. **A: đếm số lần, câu chào đổi ở 3 và 10 lần, không quà** · B: thêm quà ở mốc 7 lần (một vật trang trí
    "Bát gỗ của Tiểu Khất" vào danh mục nhà; thêm luật R-NHA-4, để đợt sau) · C: không nhớ, ngày nào cũng như nhau.

## Nhiệm vụ
**Làm được trước khi có model** (logic, luật, âm thanh có test thuần; chỉ xem bằng model cũ `nhan-vat.glb` trong vitest /
Canvas 3D `?dang=go-mo`, **không** đưa vào cảnh app):
- [ ] 1. Ghi luật R-NPC-6/7/8, R-TIEN-8, R-AM-1 + sửa R-NPC-1, R-CHAT-3, R-TIEN-5 vào sổ → `/dong-bo-quy-tac` (`docs/testing/quy_tac.md` · xong khi `rule_trace --pending` trống)
- [ ] 2. Đồng hồ GMT+7 + canh giờ + câu rao + số tiếng gõ (`zones/gioVN.ts` · zones · vitest: 23:00, 0:00, 7:00, 12:00, 4:59, múi giờ máy khác · xong khi test đủ ví dụ sổ; phối hợp V-27 dùng chung)
- [ ] 3. Đường đi theo đồng hồ (`player/npcRoute.ts` · player · vitest: vị trí theo giờ, dừng 12 s đầu giờ, hướng ở góc, chặn → chờ, nợ quãng → ×1,3, nhảy về khi ẩn · xong khi test xanh)
- [ ] 4. Đặc tả: `NPC_IDS` thêm 2 mã; `NpcSpec.pose/scale/route/speed`, mặc định giữ cảnh cũ; `check-scene.mjs` kiểm `route` (`scene/spec.ts`, `scripts/check-scene.mjs` · scene · test spec · xong khi `scene:check` báo đường vòng B hợp lệ trên một bản thử, không sửa `design/`)
- [ ] 5. Luật cho tiền + tin đồn (`zones/alms.ts`, `zones/tinDon.ts`, `zones/walletRules.ts`, `app/lib/journey/wallet.dart` · zones + Flutter · vitest + `flutter test` cùng ví dụ R-TIEN-8 · xong khi hai phía cùng kết quả)
- [ ] 6. Lưu + cầu nối: `progress_store.dart` lưu `alms`; `giveAlms` + `getProgress.alms` ở `docs/bridge.md`, `web/src/bridge/`, `app/lib/scene/`; ví thử `TrialWallet.alms` (`browserStore.ts`) (bridge + Flutter · test Dart + vitest · xong khi cho tiền trên app và trên `npm run dev` đều lưu qua lần mở lại)
- [ ] 7. Thoại Tiểu Khất + Lão Canh (`zones/dialogs.ts` thêm `action: 'alms'`, thoại theo trạng thái; `chat/npcChatter.ts` câu Tiểu Khất · zones · vitest · xong khi thoại đủ 3 nhánh: chưa cho / đã cho / thiếu tiền)
- [ ] 8. Tiếng mõ: `scripts/mo-wav.mjs` → `nhac/mo.wav` (CC0, ghi giấy phép trong `web/src/nhac/` README / LICENSES); `zones/moGo.ts` (âm lượng, lệch tai, nhịp gõ); `ui/moSound.ts` (Web Audio, mở tiếng khi chạm, dừng khi ẩn / che) (zones + ui · vitest cho `moGo` · xong khi `npm run dev` nghe được, tab ẩn thì im)
- [ ] 9. Ghép `townNpcs.ts` + vài dòng `main.ts`: NPC đi, vật cản di động, chặn / thoại dừng, rao giờ lên kênh, gõ mõ; `CharacterState.strike` (không bắt buộc) (ghép · build · xong khi Canvas 3D `?dang=go-mo` thấy model thế đi đúng vòng, đầu giờ gõ + rao; `?gio=08:59:50` để thử, chỉ có trên Canvas 3D)
- [ ] 10. Canvas 3D: vẽ đường đi + toạ độ điểm, NPC thế `nhan-vat.glb` (`web/design.html`, `designPreview` · xong khi chụp được ảnh vòng B cho người dùng duyệt)

**Sau khi có model** (`design/models/khat-nhi.glb`, `go-mo.glb` từ `/task tai-nguyen` trên máy người dùng):
- [ ] 11. Đo dáng hai model → `NPC_RIGS` (xương tự gắn); Tiểu Khất `scale` 0,8 + dáng ngồi; Lão Canh dáng đi + gõ (`player/npc.ts`, `glbCharacter.ts` · chụp headless 6 góc · xong khi không rách tay / vạt áo)
- [ ] 12. Đạo cụ bằng code: bát + gậy (Tiểu Khất), mõ + dùi gắn xương tay, đèn lồng hông sáng ban đêm (theo ngày đêm V-27, chưa có thì luôn tắt) (`scene/` hoặc `player/` · draw call +2 · xong khi ảnh khớp ảnh `-dao-cu.png`)
- [ ] 13. `/canh`: thêm 2 NPC vào `npcs` của `design/scene/scene.json` (vị trí Tiểu Khất, `route` Lão Canh) → `scene:check` (design · xong khi CHANGELOG có mục mới)
- [ ] 14. Ảnh mặt cho khung thoại (`-mat.png` của bộ ảnh) (`main.ts` / thoại · xong khi khung thoại có mặt hai NPC)
- [ ] 15. `npm run build`, thử máy: nghe mõ trên Android (WebView chặn tự phát), app xuống nền thì im, đo fps khi hai NPC cùng hiện

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run scene:check && npm run build ·
cd app && flutter analyze · flutter test -r failures-only test/journey · dart tool/rule_trace.dart
