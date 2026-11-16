# Tiểu nhị mang trà tới chỗ ngồi ở trà lâu (R-TRA-1)
- Yêu cầu: "Tiểu nhị mang trà tới chỗ ngồi ở trà lâu" — đợt 2 của `docs/tasks/2026-11-13-npc-cong-trinh.md`. Người dùng đã
  chọn (2026-11-13): phục vụ **mọi chỗ ngồi trong trà lâu** (tầng 1 đôn + tầng 2). Sổ việc V-20261116-105.
- Loại: thêm hành vi (NPC biết đi theo việc, không theo đồng hồ) + sửa hành vi ngồi nhìn từ mắt · Cỡ: lớn ·
  Trạng thái: đang làm — người dùng duyệt 2026-11-16: QĐ1 đi 2,4 m/s + câu báo · QĐ2 chén chỉ có sau khi rót (ghế lan can: tay phải chén, tay trái lan can) · QĐ3 đứng rót chếch trước – phải · QĐ4 miễn phí

## Hiện trạng đã kiểm bằng code (2026-11-16) — khác bản nháp 2026-11-13
- **Model có rồi**: `design/models/tieu-nhi.glb` (Tripo, xương Mixamo, ~15 300 tam giác, CHANGELOG 2026-11-16.8). Đặt ở
  `design/scene/scene.json` `npcs` → `tieu-nhi` (42,1; −36), `rotY` 270 (nhìn tây, ra cửa), sau quầy trà (2026-11-16.9). Hiện
  dựng bằng `player/npc.ts` `createNpc` → `standingMixamoNpc` (đứng, nhìn người chơi + gật — R-NPC-10, chớp — R-MAT-1).
  ⇒ **Bỏ** lựa chọn cũ "thiếu model → đệ tử khối áo lam tạp dề": thiếu model thì như R-NPC-1 (bỏ NPC) → không ai mang trà,
  chén có ngay như cũ.
- **NPC biết đi đã có** (Lão Canh, V-84): `player/npc.ts` `createMovingNpc` (`loadGlbCharacter` → `mixamoCharacter`: dáng đi
  theo `motion.mps`, có `work` / `hold` đồ cầm tay — dùng cho làm vườn), `player/npcRoute.ts` (`buildRoute`, `pointAt` xoay mượt
  ở góc, `isBlocking`), ghép `web/src/townNpcs.ts` (đặt vị trí, `facing`, `motion`, dời `block`). `RouteWalker` bám **đồng hồ**,
  vòng khép kín → **không** hợp tiểu nhị (đi theo việc) — chỉ dùng lại `pointAt` / `isBlocking` / dáng đi.
  `MovingNpc` hiện **không** nhìn người chơi / gật (thiếu `watch`) → phải bù để tiểu nhị đứng quầy vẫn đúng R-NPC-10.
- **Trà lâu** (`scene/kien_truc/tra_lau.ts`, nhà `tra-lau` ở (37; −36), 19,2 × 11,2, `rotY` 270 → mặt tiền nhìn **tây**, hồi
  phải = **nam**): nền 0,3; **chỉ mặt tiền mở** (tường sau + hai hồi kín) → muốn lên lầu phải ra cửa tây, vòng sang hồi nam,
  lên thang ngoài (dốc 30°, vế ≈ 7,7 m, chiếu nghỉ sát tường sau), qua cầu nối vào sàn tầng 2 (y ≈ 4,44). Quầy (x 41,1…41,9
  thế giới) cách tường sau ≈ 0,43 m — tiểu nhị đứng trong khe này. **30 chỗ ngồi**: tầng 1 3 bàn × 4 đôn = 12 (`hold: 'tra'`,
  R-NHAC-2); tầng 2 18 (R-VA-4): 2 sập × 2 + bàn dài 6 + 2 bàn đôi × 2 (`'tra'`) và 4 ghế đơn lan can (`'lan-can'`).
  Mọi bàn / kỷ đã có **chén trang trí** gộp sẵn trong lưới nhà (không ẩn riêng được).
- **Nhìn từ mắt khi ngồi** (`web/src/ngoiMat.ts`, `scene/tayNgoiDang.ts`): chỗ `hold: 'tra'` → `teaPose` — tay phải cầm chén
  **ngay khi ngồi**, nâng nhấp theo nhịp; `'lan-can'` → hai tay trên lan can. Chén trong tay là lưới của `scene/tayNgoi.ts`
  (lớp `LAYER_MAT`, có sẵn — không thêm draw call). Ngồi không có nút đổi sang nhìn từ ngoài (R-DIEU-7) → **người chơi chỉ
  thấy chén trong tay mình**; "chén hiện trên bàn" của bản nháp chỉ có ý nghĩa cho người khác nhìn (đợt nhiều người chơi).
- `main.ts`: `sitAt(spot)` (ngồi chỗ), `meditate` (đứng dậy → `ngoiMat.stand()`), nút "Nói chuyện" = `npcInTalkRange`
  (đã tắt khi người chơi đang ngồi). Chỗ ngồi gom từ `world.seats` (`scene/rooms.ts` đổi sang toạ độ cảnh) — **mất** thông tin
  "chỗ này thuộc trà lâu". Mặt đất: `world.surface.heightAt(x, z, fromY)` chọn được tầng (tấm `upper`).
- Vật cản tròn NPC (`Colliders.addCircle`) **không** có khoảng cao → để nguyên khi tiểu nhị lên lầu sẽ chặn người ở tầng 1
  ngay dưới ⇒ gỡ vật cản lúc rời quầy, gắn lại khi về.
- Bong bóng thoại bám `npc.root.position` (`chatRoom.ts`) → NPC đi vẫn đúng chỗ. `chat/npcChatter.ts` chưa có câu cho `tieu-nhi`.

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` — **phiên chính** (không phải phiên lập kế hoạch): thêm R-TRA-1 (sau R-NHAC-2); sửa R-NPC-1 (thêm
  tiểu nhị vào ngoại lệ "NPC biết đi"), R-NPC-3 (bỏ "Chưa mang trà tới bàn"), R-NGOI-1 (chén trong tay ở trà lâu chỉ có sau khi
  tiểu nhị rót) → `/dong-bo-quy-tac` → `--mark-synced`.
- `web/src/collision/gridPath.ts` (mới) — tìm đường trên lưới 0,25 m, thuần, nhận hàm "ô này đi được không"; rút gọn điểm.
- `web/src/zones/teaService.ts` (mới) — máy trạng thái thuần của tiểu nhị: ở quầy → chờ 2 s → đi → rót 2 s → về; đứng dậy → quay về.
- `web/src/scene/kien_truc/tra_lau.ts` — xuất mốc phục vụ (`traLauService`: chỗ tiểu nhị, đầu quầy, cửa, chân thang, đỉnh thang,
  đầu cầu nối) + **chỗ đứng rót** cho từng chỗ ngồi, tầng của chỗ ngồi; vật cản "mịn" (mặt bàn + đôn tròn thay hộp bao) cho tiểu nhị.
- `web/src/scene/kien_truc/vao_trong.ts` (`Shell.service?`), `web/src/scene/rooms.ts` (đổi mốc sang toạ độ cảnh, gắn mã nhà
  `serve` vào chỗ ngồi), `web/src/scene/seat.ts` + `web/src/zones/seats.ts` (trường `serve?` — thiếu = không ai mang trà, như cũ).
- `web/src/scene/teaPath.ts` (mới) — dựng đường quầy → chỗ đứng rót cho một chỗ ngồi (lưới tầng 1; tầng 2 = lưới tầng 1 tới cửa
  + mốc thang cố định + lưới tầng 2), có độ cao từng điểm; nhớ đường đã dựng.
- `web/src/player/npc.ts` — `tieu-nhi` dựng bằng `createMovingNpc` (danh sách `SERVING_NPC_IDS`, không đổi đặc tả cảnh);
  `MovingNpc` thêm nhìn người chơi + gật khi đứng yên (R-NPC-10) và đồ cầm tay.
- `web/src/player/character.ts` (`CharacterState.look?`, `nod?`), `web/src/player/mixamoCharacter.ts` (chuyển `look` vào
  `DongTac.update`, gật) — nhân vật chính bỏ qua.
- `web/src/player/lamVuonDang.ts` + `web/src/player/doLamVuon.ts` — thêm động tác `rot` (rót, mượn dáng `tuoi`) và đồ `am-tra`
  (ấm trà khối gộp màu đỉnh, như bình tưới).
- `web/src/scene/tayNgoiDang.ts` (+ dáng "lan can + chén" nếu chọn ở QĐ2), `web/src/ngoiMat.ts` (`setTea(served)`: chưa rót →
  không chén).
- `web/src/tieuNhi.ts` (mới, ghép — như `townNpcs.ts`) · `web/src/main.ts` (~15 dòng) · `web/src/zones/dialogs.ts` (câu `tra`
  nói rõ "ngồi đâu tiểu nhân mang tới đó") · `web/src/chat/npcChatter.ts` (câu "Có ngay!" nếu chọn ở QĐ1 thì là câu riêng, không ngẫu nhiên).
- Canvas 3D: `web/src/townPreview.ts` (hoặc `designPreview.ts`) thêm `?dang=tieu-nhi&cho=<chỉ số>` — xem tiểu nhị đi + rót để
  người dùng duyệt trước khi thử máy.
- Tài liệu: Bản đồ tính năng `.claude/skills/lead/SKILL.md` (dòng NPC đi / tiện ích trà lâu), `docs/viec/so_viec.md`.

**Cần kiểm tra**
- `web/src/traLau.test.ts` (dựng nhà, thang, chỗ ngồi — thêm test đường), `web/src/townNpcs.ts` + `townNpcs.test.ts` (lọc
  `isMoving && spec.route` — tiểu nhị không có `route` nên không bị `RouteWalker` lái; kiểm lại), `player/npcVisibility.test.ts`
  (ẩn từ 35 m), `scene/routeCheck.ts` + `check-scene --thu-npc` (chỉ NPC có `route`), `scene/specCheck.ts`.
- `player/lamVuonDang` / `doLamVuon` test + `zones/vuon*` (thêm `rot` vào `WORK_IDS` có làm lệch danh sách động tác vườn, vòng
  công cụ không — có thể tách `rot` ra khỏi `WORK_IDS` vườn).
- `ngoiMat.ts` các chỗ khác dùng `hold: 'tra'` (chỉ trà lâu — đã grep: `tra_lau.ts`, `do_pho.ts`), `ngoiMatKhung.test.ts`,
  `scene/tayNgoiDang.test.ts`, Canvas 3D `?dang=ngoi-mat&cho=…` (`designPreview.ts` — không có tiểu nhị thì vẫn cầm chén ngay).
- R-HUD-2: tiểu nhị ở tầng 2 khi người chơi ở tầng 1 (tầng 2 `fadeLow` mờ nhưng NPC không mờ) — nhìn có kỳ không; ngược lại.
- `chatRoom.ts` bong bóng theo NPC đi; `apGio.ts` nhuộm vật liệu ngày đêm có quét ấm trà dựng muộn không (dựng ấm lúc nạp).
- Ngân sách khi ngồi trong trà lâu (app, thiết bị): ≤ 150 draw call, ≤ 150k tam giác.

**Không đụng**
- `design/` (vị trí tiểu nhị giữ (42,1; −36) của đặc tả — đường đi bắt đầu từ chỗ đó; hạ quầy 0,95 → 0,75 của 2026-11-16.9 để sau),
  `app/` (Flutter), `docs/bridge.md` (không đổi cầu nối — trà miễn phí, không ghi tiến độ), `web/src/player/npcRoute.ts`
  `RouteWalker` + đường Lão Canh (chỉ gọi lại hàm có sẵn), chén / ấm trang trí gộp sẵn trên bàn (giữ), dáng ngồi nhân vật trong cảnh.
- Không HUD mới (không nút, không bảng) → không cần phiếu thiết kế. Không kiến trúc mới → không cần concept.

## Bản nháp luật (phiên chính ghi vào sổ + đồng bộ online — chưa vào sổ)

Số theo phương án đề xuất ở mục "Cần người dùng quyết định"; người dùng chọn khác thì sửa số trước khi chép.

| R-TRA-1 | **Tiểu nhị mang trà tới chỗ ngồi** (Phẩm Minh Các): tiểu nhị (`tieu-nhi`) đứng chỗ của mình theo đặc tả cảnh — sau quầy trà tầng 1, mặt nhìn ra cửa. Người chơi ngồi vào **bất kỳ chỗ nào trong trà lâu** bằng nút "Ngồi" (R-NGOI-1) — tầng 1: 12 đôn (R-NHAC-2); tầng 2: 18 chỗ (R-VA-4) — thì sau **2 giây** tiểu nhị **cầm ấm trà**, nói trên kênh chung "Có ngay, khách quan đợi chút!", rời quầy và **đi bộ** (≈ 2,4 m/s, dáng đi, quay mặt theo hướng đi; đổi hướng mượt) theo lối trong quán: ra đầu quầy → tránh bàn ghế → tới **chỗ đứng rót** của chỗ ngồi đó. Chỗ tầng 2: ra cửa trước, vòng sang chân thang ngoài hồi phải, lên thang, qua cầu nối, tránh bàn / sập tầng 2 tới chỗ đứng rót. Chỗ đứng rót: cạnh bàn **chếch phía trước bên phải** người ngồi, cách chỗ ngồi 0,8–1,2 m — người ngồi nhìn từ mắt thấy được (ghế lan can: đứng bên phải, quay đầu sang thấy). Tới nơi: quay về phía chỗ ngồi, **rót trà 2 giây** (nghiêng ấm); rót xong → **trên tay phải người ngồi có chén trà** (nhìn từ mắt), thỉnh thoảng nâng lên nhấp như R-NGOI-1; **trước khi rót xong không có chén trong tay** (hai tay đặt trên bàn / lan can). Rồi tiểu nhị đi ngược lối cũ về quầy, quay mặt ra cửa. Người chơi **đứng dậy** trước khi rót xong → tiểu nhị quay về ngay từ chỗ đang đứng (kể cả đang trên thang), không có chén; đứng dậy sau khi có chén → chén mất cùng lúc đứng dậy. **Mỗi lần ngồi** một lần mang trà (đứng dậy ngồi lại → mang lần nữa). Mỗi lúc phục vụ **một** chỗ: đang về mà người chơi đã ngồi chỗ khác → về tới quầy rồi mới đi (lại chờ 2 giây). Trà **miễn phí**, không ghi tiến độ (R-VUNG-1). Khi rời quầy tiểu nhị **không có vật cản** (không chặn ai, kể cả người ở tầng dưới); về quầy thì có lại vật cản tròn 0,45 (R-NPC-1). Đang về mà người chơi đứng chắn ngay phía trước (< 1,3 m) → đứng chờ (như R-NPC-7, không nói). Chỉ khi đứng ở quầy mới có nút "Nói chuyện" (R-NPC-3) và nhìn người chơi / gật (R-NPC-10). Thiếu model tiểu nhị → không ai mang trà, ngồi là cầm chén ngay như R-NGOI-1. Ẩn ngoài 35 m như R-NPC-1 (vẫn đi tiếp). | Ngồi đôn phía cửa (tây) bàn trà giữa tầng 1 → 2 s sau tiểu nhị cầm ấm, bong bóng "Có ngay, khách quan đợi chút!", đi vòng đầu quầy phía nam, qua lối giữa quầy và bàn, tới góc bàn chếch phải trước mặt (≈ 3–4 s), quay về đôn, rót 2 s → tay phải có chén; tiểu nhị về quầy, nhìn tây. Lên tầng 2 ngồi ghế đơn sát lan can mặt trước → tiểu nhị ra cửa tây, vòng sang hồi nam, lên thang, qua cầu nối, đi dọc sàn tới bên phải ghế (≈ 18–22 s), rót, tay phải có chén. Ngồi rồi đứng dậy khi tiểu nhị đang trên thang → tiểu nhị quay đầu xuống thang về quầy, không có chén. Ngồi đôn khác khi tiểu nhị đang về → tiểu nhị về tới quầy, 2 s sau mới đi. Đứng ở tầng 1 ngay dưới chỗ tiểu nhị đang rót trên tầng 2 → không bị chặn. | chờ | sửa |

Sửa kèm (cùng lần chép):
- **R-NPC-1**: "… — **trừ NPC có đường đi (R-NPC-7), NPC ngồi (R-NPC-6) và tiểu nhị đi mang trà (R-TRA-1)**." Câu "Có va chạm tròn
  bán kính 0,45" thêm "(tiểu nhị: chỉ khi đứng ở quầy — R-TRA-1)".
- **R-NPC-3**: thay "Chưa mang trà tới bàn (để đợt sau)." bằng "Ngồi vào một chỗ trong trà lâu thì tiểu nhị mang trà tới (R-TRA-1);
  đang đi / rót thì không có nút "Nói chuyện" (chỉ khi đứng ở quầy)."
- **R-NGOI-1**: "bàn trà / đôn / sập → tay phải cầm **chén trà**, thỉnh thoảng nâng lên" thêm "— trong trà lâu chén chỉ có sau
  khi tiểu nhị rót xong (R-TRA-1); trước đó hai tay đặt trên bàn". Ghế lan can thêm câu theo QĐ2.

## Cần người dùng quyết định
1. **Đường lên tầng 2 dài** (đo theo số dựng: quầy → cửa → chân thang → thang → cầu nối → chỗ ngồi ≈ 43–53 m; tầng 1 chỉ 4–9 m).
   Đi 2 m/s như bản nháp → chờ ≈ 25–30 s mới có trà ở tầng 2.
   - **Đề xuất A**: 2,4 m/s (tiểu nhị "hoạt bát", bước nhanh) + câu "Có ngay, khách quan đợi chút!" trên kênh chung lúc rời quầy
     (người ngồi biết đang có người tới) → tầng 2 ≈ 18–22 s, tầng 1 ≈ 2–4 s.
   - B: chạy lon ton (≈ 3,5 m/s, dáng chạy có sẵn) ở đoạn ngoài trời, đi bộ trong quán và trên thang → tầng 2 ≈ 15 s.
   - C: giữ 2 m/s, không câu báo.
2. **Chén trà khi nhìn từ mắt**.
   - **Đề xuất**: chưa rót → hai tay đặt trên bàn, **không chén**; rót xong → chén hiện trong tay phải (nhịp nâng nhấp bắt đầu
     từ lúc đó). Ghế đơn lan can: rót xong → **tay phải cầm chén, tay trái vẫn trên lan can** (thêm một dáng tay nhỏ).
     Chén "đặt trên bàn" cho người khác nhìn → để đợt nhiều người chơi (bây giờ không ai thấy).
   - B: ghế lan can giữ hai tay trên lan can, không có chén (tiểu nhị vẫn tới rót vào chén trên bàn nhỏ).
   - C: chén đặt xuống bàn trước mặt (mới, +1 draw call), tay không cầm — bỏ dáng nhấp trà.
3. **Chỗ tiểu nhị đứng rót** (người ngồi nhìn từ mắt, cúi 25°, nhìn quanh ±60°).
   - **Đề xuất**: góc bàn chếch **trước – phải** ≈ 40–50°, cách 0,8–1,2 m (đôn tầng 1: góc bàn giữa hai đôn; bàn dài / bàn đôi:
     cạnh bàn phía phải; sập: đầu sập phía trước), màn ngang thấy ngay; màn dọc (hẹp) cần quay đầu nhẹ. Ghế lan can (quay ra
     ngoài, trước mặt là lan can): đứng **bên phải** ≈ 90° — quay đầu sang thấy.
   - B: đứng bên đối diện bàn, ngay trước mặt (thấy rõ nhất, nhưng rót "qua bàn" trông lạ; tầng 1 bàn rộng 1,56 m).
4. **Trà có tốn Văn tiền không**.
   - **Đề xuất**: **miễn phí**, không đổi cầu nối / Flutter (trà lâu là chỗ nghỉ, nghe đàn).
   - B: 1–2 văn mỗi chén (thêm `earnGame`-kiểu "chi" — đổi `docs/bridge.md`, `wallet.dart`, R-TIEN-*; thêm hỏi "Uống trà (2 văn)?"
     → cần phiếu HUD) — để kế hoạch riêng.

## Giả định (không cần hỏi, sửa được lúc duyệt)
- Mỗi lần ngồi mang trà một lần; đứng dậy rồi ngồi lại → mang lần nữa (quán chiều khách).
- Tiểu nhị không có vật cản khi đi (không làm người chơi kẹt trên thang / lối hẹp); đi xuyên đôn trống khi cần (đôn chỉ là
  vật cản cho người chơi). Đang về mà người chơi chắn trước mặt thì đứng chờ (dùng lại `isBlocking`).
- Không dùng clip / model mới: ấm trà dựng bằng khối gộp màu đỉnh như đồ làm vườn; dáng rót mượn dáng tưới (`tuoi`).
- Một người chơi trên máy (chưa nhiều người chơi) → tiểu nhị chạy theo máy mình; ai khác thấy gì để đợt nhiều người chơi.
- Đổi cảnh (truyền tống, về nhà) giữa chừng → mọi thứ dựng lại, tiểu nhị về quầy.

## Ước tính hiệu năng
- Tiểu nhị đã có trong cảnh (~15 300 tam giác, 1 draw call + mí mắt) — chuyển sang dựng bằng `createMovingNpc` không đổi số.
- **Ấm trà** khi cầm: +1 draw call, ≈ 100–200 tam giác (chỉ hiện từ lúc rời quầy tới lúc về). Chén trong tay: lưới có sẵn
  của `tayNgoi.ts` (0 thêm). Câu "Có ngay": bong bóng HTML (0 draw call).
- Tổng: **+1 draw call, +≈ 0,2k tam giác** lúc phục vụ → trấn ≈ 140k → ≈ 140,2k (< 150k); draw call trong trà lâu đo lại ở NV10.
- CPU: tìm đường lưới 0,25 m trên nhà 20 × 12 m (≈ 4 000 ô) mỗi lần ngồi chỗ chưa có đường (< 1 ms), nhớ lại; không chạy mỗi khung.

## Nhiệm vụ
- [x] 1. **Luật** (phiên chính — xong 2026-11-16, đã đồng bộ online): R-TRA-1 + sửa R-NPC-1, R-NPC-3, R-NGOI-1 theo bản nháp (sau khi người dùng chọn QĐ1–4) →
  `/dong-bo-quy-tac` → `dart tool/rule_trace.dart --mark-synced R-TRA-1 …`.
  (`docs/testing/quy_tac.md` · tài liệu · xong khi `rule_trace` báo R-TRA-1 có trong sổ, đã đồng bộ, chờ test.)
- [ ] 2. **Tìm đường lưới** `web/src/collision/gridPath.ts` (lớp `collision/` — thuần): `findPath(from, to, walkable(x, z),
  bounds, cell = 0.25)` (A* 8 hướng) + `simplify` (bỏ điểm giữa khi hai đầu nhìn thấy nhau qua ô đi được).
  Test `collision/gridPath.test.ts`: đi vòng một hộp; không có đường → `null`; điểm đầu / cuối nằm trong ô cấm sát mép → nhích ra
  ô gần nhất; sau rút gọn mọi đoạn vẫn qua ô đi được. Xong khi: `npm test` xanh, `check.dart --changed` sạch.
- [ ] 3. **Máy trạng thái** `web/src/zones/teaService.ts` (lớp `zones/` — thuần): pha `quay` → `cho` (2 s) → `di` → `rot` (2 s)
  → `ve` → `quay`; đầu vào mỗi khung `{ dt, seated: chỗ | null }` + độ dài đường; ra `{ phase, s (m dọc đường), served, canTalk,
  say? }`. Đứng dậy ở `cho` / `di` / `rot` → `ve` từ `s` hiện tại; ngồi chỗ khác lúc `ve` → giữ chỗ chờ, tới quầy mới `cho`.
  Test `zones/teaService.test.ts` theo cột ví dụ R-TRA-1 (đôn tầng 1, ghế lan can tầng 2, đứng dậy giữa thang, đổi chỗ khi đang
  về, ngồi lại sau khi có chén). Xong khi: test đỏ trước khi code (theo sổ), rồi xanh; `rule_trace` nối R-TRA-1 ↔ test.
- [ ] 4. **Mốc phục vụ trong nhà** `scene/kien_truc/tra_lau.ts` (+ `vao_trong.ts` `Shell.service`, `rooms.ts`, `scene/seat.ts`,
  `zones/seats.ts`) — lớp `scene/`: xuất `traLauService(b, style)` toạ độ nhà: đoạn cố định sau quầy (khe 0,43 m — từ chỗ tiểu nhị
  tới đầu quầy phía hồi phải), cửa (giữa mặt tiền, trên dốc), chân thang / đỉnh vế / giữa chiếu nghỉ / đầu cầu nối (từ
  `stairLayout`), vật cản mịn từng tầng (mặt bàn + đôn tròn, sập, bàn dài, bàn đôi, bàn nhỏ lan can, cột, quầy, cầm án), và mỗi
  chỗ ngồi: `floor` (1 | 2) + **chỗ đứng rót** + hướng quay khi rót (QĐ3). `rooms.ts` đổi sang toạ độ cảnh, gắn `serve: b.id`
  vào chỗ ngồi trà lâu. Không đổi hình dựng (chỉ thêm số xuất ra). Test thêm vào `web/src/traLau.test.ts`: 30 chỗ đều có chỗ
  đứng rót; chỗ đứng rót cách chỗ ngồi 0,8–1,2 m, nằm ngoài vật cản mịn, cùng tầng, góc so với hướng nhìn theo QĐ3; cửa / chân
  thang nằm trên tấm đi được. Xong khi test xanh, `npm run scene:check` không đổi kết quả cũ.
- [ ] 5. **Dựng đường** `web/src/scene/teaPath.ts` (lớp `scene/`, dùng `gridPath` + `clearanceAt` của `scene/routeCheck.ts`):
  `teaPath(service, seat)` → điểm `[x, y, z]` toạ độ cảnh: đoạn sau quầy (cố định) + lưới tầng 1 (cách vật cản mịn ≥ 0,3) tới
  chỗ đứng rót (tầng 1) hoặc tới cửa → mốc thang → lưới tầng 2 (ô ngoài sàn tầng 2 cấm) → chỗ đứng rót. Nhớ theo chỉ số chỗ.
  Test (trong `traLau.test.ts` hoặc `scene/teaPath.test.ts`): **cả 30 chỗ** có đường; mỗi điểm lấy mẫu 0,25 m cách vật cản cùng
  tầng ≥ 0,3 (đoạn sau quầy ≥ 0,2) và có mặt đất (`LayeredGround.heightAt(…, fromY)`) lệch ≤ 0,6 so với điểm trước; dốc ≤ 35°;
  dài tầng 1 ≤ 12 m, tầng 2 ≤ 60 m (in độ dài để ghi vào sổ). Xong khi test xanh.
- [ ] 6. **Tiểu nhị biết đi + rót** `player/npc.ts`, `player/character.ts`, `player/mixamoCharacter.ts`, `player/lamVuonDang.ts`,
  `player/doLamVuon.ts` — lớp `player/`: `SERVING_NPC_IDS = ['tieu-nhi']` → `isMovingSpec` true (dựng `createMovingNpc`, không
  cần `route`); `MovingNpc.motion` thêm `look?`, `hold?`, `work?`; `MovingNpc.watch` (đứng yên: `lookYaw` + gật mỗi câu thoại —
  giữ R-NPC-10, mixamoCharacter nhận `CharacterState.look` / `nod`); động tác `rot` (2 s, nghiêng ấm) + đồ `am-tra` (dựng lúc nạp
  để `apGio` nhuộm được — nếu cần). Tách `rot` khỏi danh sách động tác vườn nếu `WORK_IDS` đang được vườn duyệt hết.
  Test: `isMovingSpec({id:'tieu-nhi'})`; dáng `rot` có độ nghiêng > 0 giữa động tác (`lamVuonDang` test), vườn không đổi;
  `townNpcs.test.ts` vẫn xanh (tiểu nhị không có `route` → `TownNpcs` bỏ qua). Xong khi test xanh, Canvas 3D tiểu nhị đứng quầy
  vẫn nhìn người chơi / gật / chớp như trước.
- [ ] 7. **Chén theo lượt rót** `scene/tayNgoiDang.ts`, `ngoiMat.ts` — lớp `scene/` + ghép: `NgoiMat.setTea(served: boolean |
  null)` (`null` = chỗ không có người mang → cầm chén ngay như cũ); chỗ `tra` chưa rót → hai tay đặt trên bàn (`restPose`), rót
  xong → `teaPose` với nhịp tính từ lúc rót; ghế lan can theo QĐ2 (đề xuất: `railTeaPose` — trái trên lan can, phải cầm chén).
  Test `scene/tayNgoiDang.test.ts` (`railTeaPose` có `cup`, tay trái đúng chỗ lan can), `ngoiMatKhung.test.ts` nếu chạm.
  Xong khi Canvas 3D `?dang=ngoi-mat&cho=…` không có tiểu nhị vẫn như cũ.
- [ ] 8. **Ghép** `web/src/tieuNhi.ts` (mới, như `townNpcs.ts`): giữ `TeaService` + đường hiện tại; mỗi khung đặt vị trí theo
  `s` (đường đi rồi về = cùng đường, `s` giảm), y theo `world.surface.heightAt(x, z, yTrước)`, hướng mặt theo đoạn (xoay mượt
  ở góc — dùng lại cách `pointAt`, mở rộng nhận điểm 3D hoặc tách `polylineAt`), `motion.mps`, `hold: 'am-tra'`, `work: 'rot'`
  khi rót, quay về chỗ ngồi lúc rót, gỡ / gắn vật cản (`colliders.remove` / `addCircle`), `isBlocking` khi về; nói "Có ngay…"
  qua `chatSay` (QĐ1); `canTalk` cho nút "Nói chuyện". Test `web/src/tieuNhi.test.ts` (như `townNpcs.test.ts`, NPC giả): ngồi
  → 2 s đứng yên → rời quầy, vật cản gỡ; tới chỗ → rót 2 s → `served`; đứng dậy giữa đường → quay về, không `served`; về tới
  quầy → vật cản gắn lại, `canTalk`.
- [ ] 9. **`main.ts`** (~15 dòng): tạo `TieuNhi` khi cảnh có trà lâu + tiểu nhị là `MovingNpc`; `sitAt` → `tieuNhi.sit(spot)` nếu
  `spot.serve`; `meditate` đứng dậy → `tieuNhi.stand()`; mỗi khung `tieuNhi.update` trước `showNearNpcs`; `ngoiMat.setTea(…)`;
  lọc `npcInTalkRange` bỏ tiểu nhị khi `!canTalk`. `zones/dialogs.ts` câu `tra`: "… khách quan cứ chọn chỗ ngồi, tiểu nhân mang
  trà tới tận nơi!" (test `dialogs.test.ts` nếu so chữ). Xong khi `npx tsc --noEmit` + `npm test` xanh.
- [ ] 10. **Canvas 3D + build + đo**: `?dang=tieu-nhi&cho=<chỉ số 0…29>` (`townPreview.ts`) — tự ngồi chỗ đó, xem tiểu nhị đi /
  rót; chụp 3 ảnh (đôn tầng 1, ghế lan can tầng 2 nhìn từ mắt, tiểu nhị trên thang) cho người dùng duyệt; Bản đồ tính năng thêm
  dòng; `npm run build`; đo draw call / tam giác khi ngồi trong trà lâu (app). Xong khi người dùng duyệt ảnh → sổ việc "chờ thử
  máy": ngồi đôn tầng 1 / sập / ghế lan can tầng 2, đứng dậy giữa chừng, đổi chỗ, nói chuyện với tiểu nhị ở quầy.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · cd app && flutter analyze ·
dart tool/rule_trace.dart · dart tool/guard.dart
