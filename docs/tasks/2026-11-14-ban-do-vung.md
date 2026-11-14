# Bản đồ vùng — bản đồ nhỏ góc màn + bản đồ lớn cả cảnh
- Yêu cầu: "bây giờ khi vào các map tôi nghĩ chúng ta cũng nên có 1 cái gì đó để hiển thị bản đồ của map đó và vị trí chúng ta hiện tại"
- Loại: thêm · Cỡ: vừa · Trạng thái: đang làm (phần HUD: chờ thiết kế — phiếu `docs/phieu_thiet_ke/2026-11-14-ban-do-vung.md`)
- Việc: V-20261114-20

## Đã duyệt 2026-11-14
1. Bản đồ nhỏ **xoay theo camera** (hướng camera nhìn ở phía trên, 北 trên viền chạy theo). Bản đồ lớn bắc lên trên.
2. Tầm bản đồ nhỏ **cố định ~30 m** quanh mình ở mọi cảnh; bản đồ lớn vừa khung, không chụm / kéo.
3. **Ẩn cả khi ngồi** (khác đề xuất): ngồi ghế / bàn trà / thiền / Ngồi ôn / bồ đoàn đều ẩn, cùng màn tải, bản đồ
   truyền tống, bản đồ lớn, màn phủ, thoại NPC, bàn chơi, gõ chat, trang trí.
4. Chạm lên bản đồ lớn **không** đi tới; trong nhà vẫn mặt bằng ngoài trời, nhà đang ở tô đậm + nhãn "Tầng 2"; sửa
   R-HUD-1 ("trừ bản đồ lớn") và R-DIEU-1 ("chạm trúng bản đồ nhỏ không thành joystick").

Đã chọn (người dùng, 2026-11-14):
- **Cả hai**: bản đồ nhỏ tròn ở góc màn luôn hiện (mũi tên = mình, chỉ hướng) → chạm vào mở **bản đồ lớn** cả cảnh, có tên các khu.
- Nội dung: nhà + tên khu; cổng + vòng trận (truyền tống, cổng sang cảnh `portals`, vd. ngõ về nhà); chỗ học / tiệm /
  bàn chơi (chỗ ngồi ôn, khu tự học, Tạp hoá, bàn cờ / Đấu chữ). **Không hiện NPC.**
- Nét vẽ: giấy cổ, nét mực, hợp với bản đồ truyền tống đang có; **tự vẽ từ đặc tả cảnh** (`design/scene/*.json` qua
  `SceneSpec`) → cảnh nào cũng có, sửa cảnh thì bản đồ tự đổi, không chụp ảnh.

## Phạm vi
**Sẽ sửa / thêm**
- `web/src/zones/areaMap.ts` (mới) — lớp dữ liệu thuần: từ một "nguồn cảnh" dạng cấu trúc (tập con của `SceneSpec`,
  như `BuildingLike` của `zones/shop.ts` — `zones/` không import `scene/`) + vài chỗ do `main.ts` đưa vào (chỗ ngồi,
  biển khu tự học, bảng nhiệm vụ) → `AreaMap`: khung (bounds), các lớp hình (mép đất, nước, lối, tường + khe cổng,
  chân nhà), biểu tượng (vòng trận, cổng sang cảnh, bàn chơi, Tạp hoá, khu tự học, chỗ ngồi ôn, bảng nhiệm vụ), nhãn
  (khu, nhà, nơi đến của cổng) có độ ưu tiên. Không three, không DOM.
- `web/src/zones/areaMapView.ts` (mới) — toán thuần: chiếu toạ độ cảnh → điểm bản đồ (bắc = −z lên trên), phép biến
  đổi bản đồ nhỏ (tâm = nhân vật, xoay hay không — theo quyết định 1), góc mũi tên, dấu ở mép cho vòng trận / cổng
  ngoài tầm, bỏ nhãn chồng nhau, "đang ở nhà nào / tầng mấy".
- Test: `web/src/zones/areaMap.test.ts`, `areaMapView.test.ts` (R-BANDO-*), `web/src/areaMapScenes.test.ts` (gốc
  `web/src/` — được import cả `scene/`: dựng bản đồ cho **đủ 8 cảnh** `design/scene/*.json`, không lỗi, mỗi cảnh có
  vòng trận + nhãn khu).
- `web/src/ui/areaMapPaint.ts` (mới) — vẽ `AreaMap` lên **Canvas 2D một lần** lúc vào cảnh (giấy, nét mực, biểu
  tượng) — **chờ thiết kế**.
- `web/src/ui/miniMap.ts` (mới) — HUD bản đồ nhỏ — **chờ thiết kế**.
- `web/src/ui/areaMapPanel.ts` (mới) — HUD bản đồ lớn (lớp phủ, nhãn HTML, nút đóng) — **chờ thiết kế**.
- `web/src/ui/areaMap.css` (mới), `web/index.html` (khung DOM) — **chờ thiết kế**.
- `web/src/areaMapRoom.ts` (mới, file ghép ở gốc như `walletRoom.ts`) + vài dòng `web/src/main.ts`: dựng bản đồ khi
  vào cảnh, cập nhật mỗi khung, ẩn theo trạng thái bận, mở / đóng, chuỗi `onBack`, phím M.
- `docs/testing/quy_tac.md` — nhóm mới **BANDO** (R-BANDO-1…5, nháp ở dưới) + sửa **R-HUD-1** (câu "Màn không báo tên
  khu ở đâu cả" → trừ bản đồ lớn) + **R-DIEU-1** (chạm trúng bản đồ nhỏ không thành joystick).
- `.claude/skills/lead/SKILL.md` — thêm dòng "bản đồ nhỏ, bản đồ lớn, vị trí của mình" vào Bản đồ tính năng.

**Cần kiểm tra**
- `web/src/zones/areaTracker.ts` (`Area` — cùng hình với `AreaSpec`, dùng lại kiểu), `zones/shop.ts` (`shopDoor`),
  `zones/dailyBoard.ts` (`dailyBoardSpot`), `zones/seats.ts` (`SeatSpot.study`, `y` tầng), `zones/gameGuides.ts`
  (`gameSigns`), `scene/world.ts` (`seats`, `studySign`), `scene/rooms.ts` (`roomAt` → `zoneId`, `floor`),
  `scene/portals.ts`, `scene/loadSpec.ts` (`REGION_SCENES` → tên nơi đến của cổng).
- `scene/walls.ts` (cách tính khe cổng theo `side` / `at` — bản đồ phải chừa khe đúng như tường thật).
- HUD đang có để không đè: ví (góc trên phải, `ui/wallet.ts`), viên nhắc trang trí (góc trên trái, chỉ khi trang trí —
  `ui/decorHud.ts`), khung chat ngang khi gõ (trên trái — `ui/chatPanel.ts`), viên gợi ý bản đồ truyền tống (trên giữa
  — `ui/mapHud.ts`), cụm nút hành động + nút Trò chuyện (dưới phải), joystick (dưới trái).
- `web/scripts/subset-han.mjs` — đã quét `design/scene/*.json` → chữ Hán tên khu có sẵn trong font cắt (không sửa).
- `tool/check.dart` — file mới đúng lớp (`zones` ← chỉ `collision`; `ui` ← `zones`).

**Không đụng**
- Bản đồ truyền tống (`scene/banDo.ts`, `ui/mapHud.ts`, `design/scene/ban-do/*`) — giữ nguyên; bản đồ mới chỉ **dùng
  lại** token / màu mực / giấy, không dùng lại ảnh `ban-do-goc.png` (ảnh đó vẽ cả lục địa, không phải mặt bằng cảnh).
- Cầu nối Flutter ↔ JS: **không đổi** — nút quay lại dùng sự kiện `back` có sẵn (thêm một mắt vào chuỗi `onBack`).
- Flutter (`app/lib/`): không đụng. NPC, người chơi khác, ô trang trí, cây lẻ: không vẽ lên bản đồ.
- Renderer / cảnh 3D: không render cảnh thứ hai, không camera nhìn từ trên.

## Cách làm (vì sao)
- **Canvas 2D vẽ một lần, không render 3D lần hai**: bản đồ là hình phẳng vẽ từ số liệu đặc tả lúc vào cảnh (vài
  chục hình → dưới 5 ms). Mỗi khung chỉ đổi `transform` CSS của tấm bản đồ (dịch + xoay) và góc mũi tên — trình duyệt
  ghép lớp bằng GPU, không vẽ lại. Chỉ cập nhật khi nhân vật dời > 5 cm hoặc xoay > 0,5°. **Draw call 3D: +0**.
- **Nhãn bản đồ lớn bằng HTML** (`textContent`, font đóng gói Be Vietnam Pro / Noto Serif SC): nét ở mọi DPR, không
  phải tự đo chữ trên canvas; bản đồ nhỏ không có chữ (trừ 北 nếu thiết kế giữ).
- Ảnh canvas tối đa ~1024 px cạnh dài × pixelRatio ≤ 1,5 (cảnh lớn nhất Tử Cấm Thành ≈ 120 × 176 m → ≈ 4–6 px/m) —
  dưới 5 MB bộ nhớ; bản đồ nhỏ dùng chung ảnh này (thu nhỏ), không vẽ ảnh thứ hai.
- Tách **dữ liệu** (`zones/areaMap*.ts`, test được, làm ngay) khỏi **nét vẽ / HUD** (`ui/`, chờ thiết kế) → thiết kế
  đổi nét không phải sửa phần dữ liệu.

## Giả định / cần quyết định
1. **Bản đồ nhỏ xoay theo camera hay luôn bắc lên trên?**
   - (a) **Xoay theo camera** (hướng camera nhìn luôn ở phía trên bản đồ, chữ 北 trên viền chạy theo) — kiểu đa số game
     nhập vai di động; đẩy joystick lên = đi về phía trên bản đồ. **Đề xuất.**
   - (b) Luôn bắc lên trên, mũi tên xoay — dễ khớp với bản đồ lớn, nhưng camera quay ra sau thì "lên" trên joystick
     không còn là "lên" trên bản đồ.
   - Duyệt xong thấy gì: (a) quay camera → bản đồ nhỏ quay theo, mũi tên gần như luôn chỉ lên; (b) quay camera → bản
     đồ đứng yên, mũi tên quay.
   - Bản đồ lớn: **luôn bắc lên trên** (như bản đồ truyền tống có la bàn 北) — không cần chọn.
2. **Tầm nhìn bản đồ nhỏ** (thu phóng):
   - (a) **Cố định bán kính ~30 m quanh mình** ở mọi cảnh (Nhà của ta nhỏ ≈ 32 × 30 m → gần như thấy cả nhà). **Đề xuất.**
   - (b) Tự theo cỡ cảnh (cảnh lớn nhìn xa hơn) — nhà trông to nhỏ khác nhau giữa các cảnh.
   - (c) Có nút +/− trên bản đồ nhỏ — thêm nút nhỏ khó chạm, rối góc màn.
   - Bản đồ lớn đợt này **vừa khung, không chụm / kéo** (cảnh lớn nhất vẫn đọc được tên khu ở 390 px rộng); cần thì đợt sau.
   - Duyệt xong thấy gì: đứng giữa Quảng Trường (0; 0) thấy trọn Quảng Trường + mép Kỳ Văn Uyển, Truyền Tống Đài (30; 0)
     ở sát mép.
3. **Khi nào ẩn bản đồ nhỏ** — đề xuất ẩn khi: màn tải, bản đồ truyền tống mở, bài học / màn Flutter phủ, thoại NPC,
   ngồi bàn chơi, đang gõ chat, chế độ trang trí, bản đồ lớn đang mở. **Vẫn hiện** khi ngồi ghế / thiền / ngồi bồ đoàn
   (chưa mở cuộn sách). Phương án khác: (b) ẩn cả khi đang ngồi (màn gọn hơn lúc ngồi đọc sách / nghe nhạc).
   - Duyệt xong thấy gì: ngồi bàn trà Phẩm Minh Các → bản đồ nhỏ vẫn ở góc; bấm "Vào bàn" cờ → bản đồ nhỏ ẩn.
4. **Chạm một chỗ trên bản đồ lớn có tự đi tới không?** Đề xuất **KHÔNG** ở đợt này (cần tìm đường vòng qua tường /
   nhà — việc riêng). (b) Chạm chỗ → chỉ hiện tên chỗ đó (thẻ nhỏ) — có thể làm nếu thiết kế muốn. (c) Đi tới bằng
   tìm đường — đợt sau.
   - Duyệt xong thấy gì: chạm lên bản đồ lớn không làm gì (hoặc chỉ hiện tên nếu chọn b); đóng mới đi lại được.
5. **Trong nhà / tầng 2** — đề xuất: bản đồ vẫn là mặt bằng ngoài trời; nhà mình đang ở **tô đậm**, góc bản đồ nhỏ có
   nhãn nhỏ "Tầng 2" khi đang ở tầng trên; chỗ ở tầng 2 (khu tự học) vẽ trong chân nhà, bản đồ lớn ghi kèm "· tầng 2".
   (b) Vào nhà thì bản đồ nhỏ đổi sang mặt bằng trong nhà (bàn, kệ…) — phải thêm dữ liệu nội thất, để sau.
6. **Đổi luật đã chốt**: R-HUD-1 ghi "Màn không báo tên khu ở đâu cả" → cần thêm "trừ bản đồ lớn"; R-DIEU-1 (chạm 45 %
   trái thành joystick) → chạm trúng bản đồ nhỏ là mở bản đồ lớn, không thành joystick. Bản đồ nhỏ **không** ghi tên
   khu (giữ tinh thần R-HUD-3) — trừ khi thiết kế đề xuất khác.
- Giả định (không cần hỏi): mũi tên chỉ **hướng nhân vật quay mặt**; bản đồ nhỏ không hiện biểu tượng ô trang trí;
  NPC / người chơi khác không hiện; máy tính: phím **M** mở / đóng bản đồ lớn, **Esc** đóng.

## Quy tắc nghiệp vụ (đã ghi vào sổ `docs/testing/quy_tac.md` — bản chốt ở sổ; bảng dưới là nháp ban đầu)
Nhóm mới **BANDO — bản đồ vùng (bản đồ nhỏ + bản đồ lớn)**. Đã sửa theo lựa chọn 2026-11-14 (R-BANDO-1: ẩn cả khi ngồi).

| Mã | Quy tắc | Ví dụ |
|---|---|---|
| R-BANDO-1 | **Bản đồ nhỏ**: ở mọi cảnh (Khởi Nguyên Trấn, Nhà của ta, 6 vùng) có một bản đồ nhỏ tròn ở góc trên trái, hiện suốt lúc đi lại. Ẩn khi: màn tải, bản đồ truyền tống mở, bản đồ lớn mở, bài học / màn phủ (thẻ học, màn ôn, bảng), đang thoại NPC, ngồi bàn chơi, **đang ngồi** (ghế, bàn trà, thiền, Ngồi ôn, bồ đoàn), đang gõ chat, đang trang trí. Đứng dậy → hiện lại. Chạm trúng bản đồ nhỏ không thành joystick và không xoay camera (ngoại lệ của R-DIEU-1). | Đứng ở Quảng Trường (0; 12) → bản đồ nhỏ ở góc trên trái, ví ở góc trên phải. Bấm "Nói chuyện" với Tiểu Mặc → bản đồ nhỏ ẩn; đóng thoại → hiện lại. Vào bàn cờ (−34; 4) → ẩn. Ngồi bàn trà Phẩm Minh Các → ẩn; đứng dậy → hiện. |
| R-BANDO-2 | **Nội dung** (vẽ từ đặc tả cảnh, cả hai bản đồ): mép đất, nước, lối lát, tường (chừa khe cổng), chân các nhà đúng hướng; **vòng trận**; **cổng sang cảnh** (bản đồ lớn ghi tên nơi đến); **chỗ**: bàn chơi (theo loại trò), Tạp hoá, khu tự học, chỗ ngồi ôn (gom một dấu cho mỗi nhà / tầng), bảng nhiệm vụ. Không vẽ NPC, người chơi khác, cây lẻ, ô trang trí. Bản đồ lớn thêm **tên các khu** (`site.areas`) và tên nhà. Sửa đặc tả cảnh → bản đồ đổi theo, không phải vẽ lại tay. | Bản đồ lớn Khởi Nguyên Trấn có 8 tên khu: Truyền Tống Đài, Cổng Trấn, Quảng Trường, Kỳ Văn Uyển, Thiên Bậc, Thượng Trấn, Hậu Sơn, Tàng Thư Các; vòng trận ở (30; 0); cổng ngõ (−22; 36) ghi "Nhà của ta"; hai bàn chơi ở (−34; 4) và (−34; 11). Bản đồ lớn Nhà của ta có 3 khu Chính phòng, Vườn, Sân trước; cổng (0; 14) ghi "Khởi Nguyên Trấn". |
| R-BANDO-3 | **Vị trí của mình**: một mũi tên ở đúng chỗ nhân vật, chỉ hướng nhân vật quay mặt. Bản đồ nhỏ: tâm luôn là nhân vật, thấy quanh mình khoảng 30 m, **xoay theo camera** (hướng camera nhìn ở phía trên). Vòng trận / cổng sang cảnh ngoài tầm → một dấu nhỏ ở mép bản đồ nhỏ chỉ về phía đó. Bản đồ lớn: **bắc lên trên**, thấy cả cảnh. | Đứng ở (0; 0) nhìn về đông → bản đồ nhỏ: Truyền Tống Đài (30; 0) ở sát mép trên, mũi tên chỉ lên. Quay camera nhìn về bắc → bản đồ nhỏ quay, Truyền Tống Đài sang mép phải. Mở bản đồ lớn → Thượng Trấn ở trên, Cổng Trấn ở dưới. |
| R-BANDO-4 | **Trong nhà / tầng**: bản đồ luôn là mặt bằng ngoài; đang ở trong một nhà → nhà đó tô đậm; ở tầng 2 → bản đồ nhỏ có nhãn "Tầng 2". Chỗ ở tầng 2 (khu tự học Tàng Thư Các) vẽ trong chân nhà, bản đồ lớn ghi "Khu tự học · tầng 2". | Lên tầng 2 Tàng Thư Các → Tàng Thư Các tô đậm, nhãn "Tầng 2"; xuống tầng 1 → nhãn mất, nhà vẫn tô đậm; ra sân → hết tô. |
| R-BANDO-5 | **Mở / đóng bản đồ lớn**: chạm bản đồ nhỏ (máy tính: phím **M**) → bản đồ lớn mở phủ cảnh; nhân vật đứng yên, joystick + cụm nút ẩn, kéo màn không xoay camera. Chạm lên bản đồ lớn **không** đưa nhân vật đi đâu. Đóng: nút "Đóng", nút quay lại của máy, phím M / Esc → về đúng như trước, bản đồ nhỏ hiện lại. Đang mở mà bị bản đồ truyền tống / màn tải chen vào → bản đồ lớn đóng. | Ở Rừng trúc chạm bản đồ nhỏ → bản đồ lớn cả Rừng trúc, có vòng trận (0; 39); giữ joystick → không đi. Bấm nút quay lại của máy → bản đồ đóng, app không thoát. |

Sửa luật cũ (cùng lúc): **R-HUD-1** "Màn không báo tên khu ở đâu cả (R-HUD-3)" → "… ở đâu cả, trừ bản đồ lớn (R-BANDO-2)";
**R-DIEU-1** thêm "Chạm trúng bản đồ nhỏ (R-BANDO-1) không thành joystick."

## Nhiệm vụ
Làm được **trước thiết kế** (1–4):
- [x] 1. (2026-11-14: đã ghi vào sổ, Xác nhận `chờ`, App `sửa`; **chưa** đồng bộ online — phiên chính chạy `/dong-bo-quy-tac`) Sổ quy tắc: nhóm **BANDO** R-BANDO-1…5 theo lựa chọn của người dùng + sửa R-HUD-1, R-DIEU-1 →
      `/dong-bo-quy-tac` (tự chép lên tài liệu online) → `--mark-synced`. (`docs/testing/quy_tac.md` · xong khi đồng bộ xong)
- [x] 2. `zones/areaMap.ts` — kiểu `AreaMapSource` (tập con cấu trúc của `SceneSpec`: `site.areas`, `buildings`
      (id, x, z, w, d, rotY, title, kind), `walls` (enabled, half, gates), `wallSegments` (from, to, gate), `gates`,
      `water`, `paths`, `bridges`, `teleport` (enabled, center, ringRadius), `portals`, `gameTables`, `props` (bảng),
      `terrain.edge` / `center`) + `AreaMapSpots` (chỗ ngồi đã gom, biển khu tự học, tên nơi đến theo mã cảnh) →
      `buildAreaMap(src, spots): AreaMap` (bounds + lớp hình + biểu tượng + nhãn có ưu tiên). Gom chỗ ngồi: một dấu
      mỗi nhà / tầng. Test R-BANDO-2, R-BANDO-4 bằng số của trấn + Nhà của ta. (zones · vitest · xong khi `npm test` xanh)
- [x] 3. (thêm `miniMapShown` R-BANDO-1, `hitsMiniMap` R-DIEU-1, `BigMapState` R-BANDO-5; tường chừa khe tính lại trong zones — chép cách `scene/walls.ts` `cutRun`) `zones/areaMapView.ts` — `toMap(x, z)`, `miniTransform(player, cameraYaw, radius)` (theo quyết định 1, 2),
      `arrowAngle(facing, cameraYaw)`, `edgeMarks(...)` (dấu ở mép cho vòng trận / cổng ngoài tầm), `fitLabels(...)`
      (bỏ nhãn chồng — ưu tiên khu > nơi đến cổng > nhà > chỗ), `whereAmI(buildings, pos, floor)` (nhà đang ở + tầng).
      Test R-BANDO-3, R-BANDO-4. (zones · vitest)
- [x] 4. `web/src/areaMapScenes.test.ts` — dựng bản đồ cho đủ 8 cảnh `design/scene/*.json` qua `loadSpec`: không lỗi,
      bounds hữu hạn, mỗi cảnh có vòng trận, mọi khu có nhãn, cổng sang cảnh có tên nơi đến (trấn ↔ Nhà của ta).
      (gốc · vitest)

**Chờ thiết kế** (`docs/phieu_thiet_ke/2026-11-14-ban-do-vung.md`):
- [ ] 5. **Thiết kế** bản đồ nhỏ + bản đồ lớn (phiếu) — chờ `/ui-design` chốt mục trong `design/CHANGELOG.md`.
- [ ] 6. `ui/areaMapPaint.ts` — vẽ `AreaMap` lên Canvas 2D một lần theo thiết kế (giấy, nét mực, biểu tượng). (ui ·
      chờ thiết kế · xong khi ảnh 8 cảnh khớp artboard)
- [ ] 7. `ui/miniMap.ts` + `areaMap.css` + khung trong `index.html` — bản đồ nhỏ: vòng tròn cắt, ảnh dịch / xoay bằng
      CSS transform, mũi tên, dấu mép, nhãn "Tầng 2"; dọc + ngang, safe area. (ui · chờ thiết kế)
- [ ] 8. `ui/areaMapPanel.ts` — bản đồ lớn: lớp phủ, ảnh vừa khung, nhãn HTML, mũi tên mình, nút "Đóng". (ui · chờ thiết kế)
- [ ] 9. Ghép `web/src/areaMapRoom.ts` + vài dòng `main.ts`: dựng khi vào cảnh (sau `world`), `update` mỗi khung với
      điều kiện ẩn R-BANDO-1, chặn joystick khi chạm bản đồ nhỏ, `player.update` đứng yên khi bản đồ lớn mở, thêm vào
      `onBack`, phím M / Esc. (ghép · xong khi đi thử đủ 8 cảnh trên `npm run dev`)
- [ ] 10. Thêm dòng vào Bản đồ tính năng (`.claude/skills/lead/SKILL.md`); `npm run build`.

## Hiệu năng
- Draw call 3D: **+0** (toàn bộ là HTML / Canvas 2D). Vẽ canvas một lần mỗi lần vào cảnh (< 5 ms, lúc màn tải còn che).
- Mỗi khung: tối đa 2 lần đổi `style.transform` (tấm bản đồ, mũi tên), chỉ khi có đổi. Không `backdrop-filter` mới
  trên phần tử chuyển động (kính mờ nếu có chỉ ở viền tĩnh).

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/rule_trace.dart ·
đi thử 8 cảnh trên `npm run dev` (dọc + ngang, tầng 2 Tàng Thư Các, ngõ về nhà) · cd app && flutter analyze (không đổi
Dart — chỉ để chắc build chép đúng)
