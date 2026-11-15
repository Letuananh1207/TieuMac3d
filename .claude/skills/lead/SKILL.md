---
name: lead
description: Trưởng nhóm — nhận yêu cầu tính năng bằng lời (thêm / sửa hành vi / xoá / giao diện / dữ liệu), khoanh phạm vi trước khi đọc code, chia nhiệm vụ, ghi kế hoạch vào docs/tasks/, duyệt rồi làm. Dùng khi người dùng gõ /lead hoặc nhờ làm một tính năng / mốc mới. "/lead tiếp" làm tiếp kế hoạch dở.
argument-hint: "<yêu cầu bằng lời>"
---

# /lead — từ yêu cầu bằng lời đến nhiệm vụ

Yêu cầu: $ARGUMENTS

Không có tham số hoặc `tiếp` → mở kế hoạch mới nhất trong `docs/tasks/` chưa `xong`, làm tiếp từ nhiệm vụ `- [ ]` đầu tiên.

Việc chính: **khoanh đúng phạm vi trước khi đọc code.** Viết code theo skill `hoc-xa-3d-dev`.

## 1. Hiểu yêu cầu (chưa đọc code)

- Phân loại: thêm · sửa hành vi · xoá · chỉ giao diện · sửa lỗi · dữ liệu.
- Dịch tên người dùng nói → tên trong code bằng **Bản đồ tính năng** cuối file.
- Hai cách hiểu cho ra hai kế hoạch khác nhau → hỏi tối đa 2 câu. Chỗ cần người dùng quyết định (dọc/ngang,
  chọn thư viện…) → hỏi, không đoán; mỗi thư viện đề xuất kèm một câu "vì sao".
- Không sửa tay: `app/assets/scene/` (chạy `npm run build`), `reference/hoc-xa-3d.html`.
- Báo một lỗi cụ thể → chuyển sang `/loi`. `/lead` chỉ nhận lỗi khi `/loi` chuyển sang vì việc sửa lớn.
- Yêu cầu đồng bộ thiết kế ("thiết kế vừa cập nhật", "áp thiết kế") → chuyển sang `/ui-apply`.
- Giai đoạn này không làm multiplayer, đăng nhập, backend — yêu cầu chạm tới thì báo lại trước.

## 2. Khoanh phạm vi (rẻ → đắt, đủ thì dừng)

1. `dart .claude/skills/lead/scripts/impact.dart <từ khoá>... [--depth N]` (từ khoá lấy ở Bản đồ tính năng).
2. Grep có mục tiêu.
3. Read chỉ file sẽ sửa, chỉ đoạn cần.

Không dùng subagent để dò, trừ khi yêu cầu chạm ≥ 3 tính năng. Kết quả 3 nhóm:
**Sẽ sửa** (mỗi file một dòng lý do) · **Cần kiểm tra** (file dùng phần sẽ sửa) · **Không đụng** (chỉ khi người
dùng có thể nghĩ là có đụng).

## 3. Chia nhiệm vụ

Theo lớp, từ dưới lên: dữ liệu (`zones/`) → logic (`collision/`, `player/`, `input/`) → cảnh (`scene/`) →
HUD (`ui/`, `index.html`, `style.css`) → ghép (`main.ts`) → cầu nối (`docs/bridge.md`, `web/src/bridge/`) →
Flutter (`app/lib/`) → test → build (`npm run build`).

Mỗi nhiệm vụ: mục tiêu một câu · file · lớp (để đọc đúng reference) · chuỗi giao diện mới · test · "xong khi".

Cờ cảnh báo:
- đổi hành vi nghiệp vụ → sửa `docs/testing/quy_tac.md` trước, chạy skill `/dong-bo-quy-tac` (tự chép lên tài liệu
  online, không nhờ người dùng), rồi test, rồi code;
- đổi tên / dạng sự kiện cầu nối → sửa `docs/bridge.md` trước, hai phía cùng lúc;
- thêm thư mục trong `web/src` → bảng phụ thuộc (`decisions/0001`) + `LAYERS` trong `tool/check.dart`;
- ảnh hưởng hiệu năng (thêm mesh, đèn, texture lớn) → ghi số draw call ước tính;
- **giao diện chưa có thiết kế** (màn / thành phần HUD mới không có trong `design/docs/screen_specs.md`) → **không
  dựng tạm**: soạn phiếu theo `/ui-apply phieu` (`docs/phieu_thiet_ke/`), nhiệm vụ đó ghi `chờ thiết kế (<phiếu>)`,
  kế hoạch trạng thái `chờ thiết kế` nếu không còn việc nào làm được; phần không dính giao diện hỏi người dùng làm
  trước hay đợi. Có sẵn phiếu cho việc đó thì dùng, không soạn trùng;
- xoá tính năng → liệt kê chuỗi, DOM, CSS, dữ liệu `ZONES`, test sẽ thành rác.

## 4. Ghi kế hoạch

`docs/tasks/<YYYY-MM-DD>-<ten-khong-dau>.md`:

```markdown
# <tên>
- Yêu cầu: "<nguyên văn>"
- Loại: … · Cỡ: nhỏ | vừa | lớn · Trạng thái: chờ duyệt | đang làm | chờ thiết kế | xong

## Phạm vi
**Sẽ sửa** … **Cần kiểm tra** … **Không đụng** …

## Giả định / cần quyết định
- …

## Nhiệm vụ
- [ ] 1. … (file · lớp · test · xong khi …)

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm run build · cd app && flutter analyze ·
flutter test -r failures-only test/<phần> · dart tool/rule_trace.dart
```

## 5. Duyệt rồi làm

- **Nhỏ** (≤ 2 file, không đổi cầu nối, không xoá, không điểm cần quyết định): báo một dòng rồi làm luôn.
- **Vừa / lớn**: trình tóm tắt (phạm vi + nhiệm vụ + điểm cần quyết định) rồi **dừng chờ duyệt**.
- Khi làm: đánh `[x]` ngay khi xong từng nhiệm vụ. Gặp việc ngoài phạm vi → dừng, báo, không tự mở rộng.
- Cuối: chạy Kiểm tra cuối, trạng thái `xong`, báo đã sửa gì / còn chờ gì / cần thử trên máy gì.
- Các mốc của dự án: xong mốc nào báo người dùng rồi mới sang mốc sau.
- **Worktree** (CLAUDE.md "Làm song song"): duyệt xong, trước khi sửa file → `EnterWorktree` + `dart tool/viec.dart
  chuan-bi`; commit trên nhánh việc; xong → `viec.dart gop` → ExitWorktree "remove". Push chỉ
  khi được bảo.

## Bản đồ tính năng

| Người dùng nói | Từ khoá cho impact.dart | Thư mục / file |
|---|---|---|
| cảnh, sân, trời, ánh sáng, sương mù, renderer, độ phân giải | `scene/environment`, `scene/renderer` | `web/src/scene/` |
| tường, nhà, giảng đường, thư viện (toà nhà), biển hiệu, đèn lồng | `walls`, `buildings`, `textures` | `web/src/scene/` |
| cây, giếng | `trees`, `well` | `web/src/scene/` |
| nhân vật, đệ tử, con gấu, dáng đi | `player/` | `web/src/player/` (`playerCharacter.ts` chọn: `glbCharacter.ts` · `discipleCharacter.ts`) |
| di chuyển, tốc độ | `controller` | `web/src/player/controller.ts` |
| joystick, cần điều khiển | `joystick`, `pointers` | `web/src/input/` |
| camera, góc nhìn, xoay, zoom, chụm hai ngón | `orbitCamera`, `pointers` | `web/src/input/` |
| chạm để đi | `tapToMove`, `pointers` | `web/src/input/` |
| bàn phím (thử trên máy tính) | `keyboard` | `web/src/input/keyboard.ts` |
| va chạm, đi xuyên, kẹt | `collision` | `web/src/collision/` |
| vùng sự kiện, lớp học, bài học (dữ liệu chữ Hán) | `zones` | `web/src/zones/` (vị trí vùng: nhà trong đặc tả cảnh) |
| đặc tả cảnh, bố cục sân, dời nhà, màu cảnh, Canvas 3D | `scene/spec`, `loadSpec`, `designPreview` | `design/scene/scene.json` (chỉ đọc), `web/src/scene/spec.ts`, `web/design.html`, `web/scripts/check-scene.mjs` |
| tông môn: cổng, ao, lối đá, đài, lò đan, trúc, đảo nổi, mây, kiểu nhà | `gate`, `water`, `paths`, `props`, `sky`, `trees`, `buildings`, `merge` | `web/src/scene/`, kế hoạch `docs/tasks/2026-11-10-tong-mon-dot-1.md` |
| phong cách Trung Hoa: điện, mái, tháp, tường vôi, cổng trăng, tùng, liễu, mai | `kien_truc`, `cay_moi` | `web/src/scene/kien_truc/`, `web/src/scene/cay_moi.ts` |
| địa hình, đồi, núi, chủ phong, vực, biển mây, núi xa, dốc, nhân vật leo / kẹt dốc | `terrain`, `heightfield`, `farMountains` | `web/src/scene/terrain*.ts`, `web/src/collision/heightfield.ts`, `web/src/scene/farMountains.ts`, `player/controller.ts` (`canStep`, R-VA-2) |
| chip "Học xá · Sân chính", tên khu | `areaTracker`, `hud` | `web/src/zones/areaTracker.ts`, `web/src/ui/hud.ts` |
| vào trong nhà, nội thất, bảng đen, thầy, kệ sách, án đọc, mái mờ, cửa | `rooms`, `noi_that`, `dien` | `web/src/scene/rooms.ts`, `web/src/scene/kien_truc/noi_that.ts`, `kien_truc/dien.ts` (`RoomParts`); kế hoạch `docs/tasks/2026-11-11-vao-trong-kien-truc.md` |
| nút học "Học chữ 快", chạm vật để học (thay thẻ mời — đã bỏ) | `learnButton`, `tapToMove` | `web/src/ui/learnButton.ts`, `web/src/input/tapToMove.ts` (`pickObject`), `main.ts` |
| bảng bài học HTML (dự phòng khi không có Flutter) | `lessonBoard` | `web/src/ui/lessonBoard.ts` |
| HUD, fps, nhãn tên, nút góc nhìn | `hud` | `web/src/ui/hud.ts`, `web/index.html`, `web/src/style.css` |
| font, chữ tiếng Việt, safe area, màu giao diện HTML | `style` | `web/src/style.css`, `web/index.html` |
| build web, chép sang app, font Flutter, làm sạch model | — | `web/vite.config.ts`, `web/scripts/{copy-to-app,subset-han,fonts-app,model-clean,check-scene}.mjs` |
| app Flutter, WebView, màn bài học native, vòng đời | `main.dart` | `app/lib/` |
| cầu nối Flutter ↔ 3D, sự kiện, safe area, app xuống nền, bảng gỡ lỗi | `bridge`, `scene_view`, `safe_area`, `scene_event` | `docs/bridge.md`, `app/lib/scene/`, `web/src/bridge/` |
| màn bài học native (mốc 3) | `lesson_screen`, `scene_event` | `app/lib/lesson/`, `app/lib/scene/scene_event.dart`; font: `web/scripts/fonts-app.mjs` |
| thiết kế, token, canvas | — | `design/` (chỉ đọc) → `/ui-apply` |
| thiết kế cảnh (không cần code mới) | — | `/canh` (sửa `design/scene/scene.json`) |
| NPC, Tiểu Mặc, tiểu nhị, quản sự, trận sư, nhân vật đứng trong cảnh | `npc`, `placeNpcs`, `dialogs`, `tranSu` | `web/src/player/npc.ts` (ẩn từ 35 m), `web/src/zones/dialogs.ts` (lời thoại), `web/src/zones/tranSu.ts`, `npcs` trong đặc tả cảnh (R-NPC-1…5); model `design/models/<mã>.glb`, mã thêm ở `NPC_IDS` (`scene/spec.ts`) |
| model .glb: tạo / thay nhân vật / công trình bằng AI | `glbCharacter`, `playerCharacter` | `/tai-nguyen` (Hunyuan3D); code nạp: `web/src/player/glbCharacter.ts`; công trình: `scene/staticModel.ts`, cổng `gates[].model` → `scene/gate.ts` `addGateModel` (nhà / lò đan chưa) |
| hành trình, vùng, Truyền Tống Đài, vòng trận, bản đồ truyền tống, khoá vùng (đã bỏ — `2026-11-13-bo-khoa-vung`), về nhà, Rừng trúc, tiến độ học | `truyenTong`, `teleportLayout`, `ringCharge`, `loadSpec`, `journey`, `progress_store` | `web/src/scene/{truyenTong,teleportLayout,loadSpec}.ts`, `web/src/zones/ringCharge.ts`, `main.ts`; mốc mở + tiến độ: `app/lib/journey/`; cảnh vùng `design/scene/<mã>.json`; kế hoạch `docs/tasks/2026-11-13-hanh-trinh-nhieu-vung.md` |
| tiện ích tông môn: trà lâu, hí đài, sân khấu, Tàng Thư Các, cửa hàng, phố chợ, sạp, bàn trà, cờ, bảng vinh danh, biển chung, cầu thang / tầng 2 | `vao_trong`, `rooms`, `do_pho`, `signAtlas`, `cau_thang`, `ground` | `web/src/scene/kien_truc/{hi_dai,tra_lau,lau_sach,cau_thang,cua_hang,do_pho,vao_trong}.ts`, tầng 2: `collision/ground.ts` (`upper`), `colliders.ts` (`minY`/`maxY`), `scene/rooms.ts` (`addWalkIn`), `scene/signAtlas.ts`; kế hoạch `docs/tasks/2026-11-13-tien-ich-giao-luu.md` |
| khu giao lưu, Kỳ Văn Uyển, bàn cờ, Ngũ Tử Kỳ, caro, Đấu chữ, trò chơi với NPC, ngồi vào bàn | `gamePlay`, `gameTable`, `gomoku`, `charDuel` | `web/src/games/` (luật thuần + NPC, test `npm test`), `web/src/gamePlay.ts` (ghép), `web/src/scene/gameTable.ts`, `gameTables` trong đặc tả cảnh; kế hoạch `docs/tasks/2026-11-13-khu-giao-luu-co-dau-chu.md`; HUD chờ phiếu `2026-11-13-tro-choi-giao-luu` |
| biển tên trò chơi, cách chơi, hướng dẫn trò chơi | `gameGuides`, `guideButton`, `gameSign` | `web/src/zones/gameGuides.ts` (lời giảng, tầm), `web/src/ui/guideButton.ts`, `scene/gameTable.ts` `addGameSign`, `kien_truc/do_pho.ts` `gameSign`, `gameTables[].sign` trong đặc tả cảnh (R-GIAO-2) |
| Tàng Thư Các mượn sách, thủ thư, sổ từ HSK, đọc sách | `books`, `library`, `libraryDesk` | `web/src/zones/{books,library}.ts`, `web/src/zones/sach/hsk*.ts` (dữ liệu), `web/src/libraryDesk.ts` (ghép), `app/lib/journey/progress_store.dart` (đang mượn, trang); cầu nối `borrowBook` `returnBook` `openLibrary` `openBook`; kế hoạch `docs/tasks/2026-11-13-tang-thu-cac-muon-sach.md` |
| bối cảnh 6 vùng (mương khúc thuỷ, kênh có kè, lang bồng, đào tiên, thành ảo, mặt tường đi được, lan can Tam Đài, cồn cát, hồ lưỡi liềm, vách Mạc Cao, đoàn lạc đà) | `channels`, `vat_truc`, `vat_giang_nam`, `vat_bong_lai`, `thanh_luy`, `vat_bien_ai`, `cung_dien`, `vat_sa_mac` | `web/src/scene/{channels,vat_truc,vat_giang_nam,vat_bong_lai,thanh_luy,vat_bien_ai,cung_dien,vat_sa_mac}.ts`; kế hoạch `docs/tasks/2026-11-14-boi-canh-6-vung.md` |
| vật đặc trưng vùng: cầu (vòm / đá / treo), thuyền, hạc bay, hạc / rùa đồng, lạc đà, hang bích hoạ, tường bám núi, cổng thành | `bridges`, `fauna`, `vat_vung`, `walls`, `tuong` | `web/src/scene/{bridges,fauna,vat_vung,walls}.ts`, `kien_truc/tuong.ts` (cổng `thanh`); kế hoạch `docs/tasks/2026-11-14-vat-dac-trung-vung.md` |
| trò chuyện, chat, kênh chung, bong bóng thoại trên đầu, NPC nói trên kênh | `chat`, `chatChannel`, `bubbleTimer`, `npcChatter` | `web/src/chat/` (thuần, vitest; `ChatChannel` → sau thay kênh mạng), ghép `web/src/chatRoom.ts`, HUD `web/src/ui/{chatPanel,chatBubbles,chatText}.ts` + `chat.css` (thiết kế 2026-11-14.9), luật R-CHAT-1..3; kế hoạch `docs/tasks/2026-11-14-tro-chuyen-kenh-chung.md` |
| nhà người dùng, Nhà của ta, nhà riêng, vườn, trang trí, ô trang trí, đồ trang trí | `decor`, `decorItems`, `homeDecor`, `decorSlots` | `web/src/zones/decor.ts` (danh mục + luật), `web/src/scene/decorItems.ts`, `web/src/homeDecor.ts` (ghép), `decorSlots` trong đặc tả cảnh `design/scene/nha-ta.json`, lưu `app/lib/journey/progress_store.dart`; cầu nối `getHome` `setDecor`; kế hoạch `docs/tasks/2026-11-14-nha-nguoi-dung.md`; HUD chờ phiếu `2026-11-14-nha-nguoi-dung` |
| cổng sang cảnh, cổng đi bộ, ngõ về nhà, Nhà của ta đi bộ, ngõ cạnh Tạp hoá | `portal`, `portals` | `web/src/zones/portal.ts` (`PortalTrigger`), `web/src/scene/portals.ts` (kiểm + `arrivalFor`), `portals` trong đặc tả cảnh (`scene.json`, `nha-ta.json`), `main.ts` (`?qua=`, `travel(to, 'cong')`), `scripts/check-scene.mjs` (cặp cổng); kế hoạch `docs/tasks/2026-11-14-ngo-ve-nha.md` |
| Văn tiền, tiền tệ, ví, thưởng, Tạp hoá, cửa hàng, mua đồ | `wallet`, `shop`, `walletRoom`, `reward` | luật `app/lib/journey/wallet.dart` + `progress_store.dart`; Flutter `app/lib/lesson/{coin,wallet_chip,reward_overlay,shop_screen}.dart`, `app/lib/scene/shop_event.dart`; web `web/src/zones/{wallet,shop,decor}.ts`, `web/src/ui/{wallet,shopButton}.ts`, `web/src/walletRoom.ts`; chế độ thử trình duyệt (R-TIEN-7) `web/src/zones/{walletRules,shopView}.ts` (luật chép từ `wallet.dart` — đổi luật sửa cả hai), `web/src/bridge/browserStore.ts`, `web/src/ui/shopPanel.ts` (Tạp hoá HTML); cầu nối `earnGame` `openShop` `getProgress.coins`; sổ R-TIEN-*; kế hoạch `docs/tasks/2026-11-14-van-tien.md`, `docs/tasks/2026-11-14-tien-tren-web.md` |
| ngồi nhìn từ mắt, ngôi 1, hai bàn tay, cuộn sách trước mắt, chén trà, nhìn quanh khi ngồi, ẩn thân mình | `ngoiMat`, `eyeCamera`, `tayNgoi`, `cuonSach`, `layers` | `web/src/ngoiMat.ts` (ghép), `web/src/input/eyeCamera.ts`, `web/src/scene/{tayNgoi,tayNgoiDang,cuonSach,cuonSachNhip,layers}.ts`, `camera.firstPerson` trong đặc tả, `gamePlay.ts` `tableCamera`; Canvas 3D `?dang=ngoi-mat&cho=…`; kế hoạch `docs/tasks/2026-11-14-ngoi-goc-mat.md`; mục trên cuộn `zones/cuonMuc.ts` + `ui/cuonMucPaint.ts` (thiết kế 2026-11-14.21), cầu nối `openLearned` |
| Vườn Bia, bia khắc thơ, rùa đội bia, Đồi Chè, bậc chè, khu hai bên Thiên Bậc | `vat_bia`, `signAtlas` | `web/src/scene/vat_bia.ts` (prop `bia` / `bia-rua`, text "Hán\|pinyin\|nghĩa\|Hán Việt\|nguồn"), tờ ảnh `bia` ở `scene/signAtlas.ts`, đặc tả `props` / `terrain.plateaus` / `trees.autumn`; kế hoạch `docs/tasks/2026-11-14-tien-ich-thien-bac.md` |
| bản đồ nhỏ, bản đồ lớn, bản đồ vùng, vị trí của mình, minimap, phím M | `areaMap`, `areaMapView`, `miniMap`, `areaMapPanel`, `areaMapRoom` | `web/src/zones/{areaMap,areaMapView}.ts` (dữ liệu + toán, test), `web/src/ui/{miniMap,areaMapPanel,areaMapPaint,areaMapIcons}.ts` + `areaMap.css`, ghép `web/src/areaMapRoom.ts`; luật R-BANDO-1…5; thiết kế 2026-11-14.20; kế hoạch `docs/tasks/2026-11-14-ban-do-vung.md` |
| cưỡi hạc, hoạt cảnh truyền tống, bay biển mây, hạ cánh, `?hac`, `den=hac` | `cuoiHac`, `CraneRide`, `CraneFlight`, `bayMay`, `hacDuong`, `buildWorldStepped` | luật thuần `web/src/zones/cuoiHac.ts` (dòng thời gian, bỏ qua, `CRANE_IN_APP`), hạc `web/src/scene/hac.ts`, đường bay / camera `scene/hacDuong.ts`, cảnh bay `scene/bayMay.ts`, ghép `web/src/cuoiHac.ts` (+ `main.ts` `travel` / `boot`), dựng chia bước `scene/world.ts`, màn mây `index.html` `#crane` + `style.css` `.hc-*`, lớp chữ `ui/craneHud.ts` + nhịp `ui/craneView.ts` (thiết kế 2026-11-15.9); đặc tả `crane`; R-HANH-5; kế hoạch `docs/tasks/2026-11-15-cuoi-hac.md` |
| vườn rau, trồng trọt, gieo, tưới, thu hoạch, kho nông sản, bán nông sản, túi hạt, hạt giống, mở ô đất, thùng thu mua, `?vuon=60` | `garden`, `vuon`, `homeGarden`, `cayTrong`, `vuonLuong`, `gardenAct` | luật `app/lib/journey/garden.dart` (gốc) ↔ `web/src/zones/vuon.ts` (chép), lưu `progress_store.dart` (`vuon.state`), cầu nối `getGarden` `gardenAct` (`app/lib/scene/garden_event.dart`, `web/src/bridge/flutterBridge.ts`), ví thử `zones/walletRules.ts`; 3D `web/src/scene/{vuonLuong,cayTrong,vuonLayout}.ts` (cây Kenney `design/models/thuc-vat/vuon/`), ghép `web/src/homeGarden.ts`, đặc tả `garden` trong `design/scene/nha-ta.json`; hạt ở Tạp hoá (`shopView.ts` `SEED_ITEMS`, `shop_screen.dart` `seeds`); Canvas 3D `?dang=vuon-rau`; sổ R-VUON-*; kế hoạch `docs/tasks/2026-11-15-vuon-trong-trot.md`; HUD chờ phiếu `2026-11-15-vuon-trong-trot` |
| hiệu năng, draw call, tam giác (mốc 4) | `merge`, `renderer` | `docs/tasks/2026-11-11-moc-4-hieu-nang.md`, `web/src/scene/merge.ts` |
| cảnh đẹp / hoạt hình mềm, bảng màu ấm, vòm trời, mây phồng, cỏ hoa có gió, nước stylized, quầng đèn, vignette, `?look=cu`, `?muc=` | `look`, `softMaterial`, `mergeSoft`, `coHoa`, `waterShader` | `web/src/scene/{look,bake,materials,merge,skyDome,sky,farMountains,terrainMem,coHoa,khoiMem,waterShader,quangDen}.ts`, `web/src/ui/vignette.ts`; decisions/0005; kế hoạch `docs/tasks/2026-11-14-canh-dep.md` |
| ngày đêm, giờ, giờ Việt Nam, đêm, hoàng hôn, bình minh, trăng sao, đèn sáng tối, cửa sổ sáng, `?gio=`, `?toc=` | `ngayDem`, `dayNight`, `apGio`, `troiDem`, `lampMaterial`, `windowMaterial` | thuần `web/src/scene/ngayDem.ts` (giờ VN, pha, trường `dayNight`, `?gio`); áp lên cảnh `web/src/scene/{apGio,troiDem,environment,skyDome,materials,quangDen}.ts`; ghép `web/src/ngayDem.ts` (+ `main.ts`, thanh trượt `designPreview.ts`); sổ R-NGAY-*; kế hoạch `docs/tasks/2026-11-14-ngay-dem.md` |
| NPC đi / ngồi, Lão Canh, gõ mõ, báo giờ, canh giờ, Tiểu Khất, ăn xin, cho tiền, tin đồn, tiếng mõ, `?dang=go-mo` | `townNpcs`, `npcRoute`, `RouteWalker`, `MovingNpc`, `gioVN`, `moGo`, `MoSound`, `alms`, `giveAlms`, `tinDon` | ghép `web/src/townNpcs.ts` (+ `main.ts`); đường đi `web/src/player/npcRoute.ts`, NPC `player/npc.ts`; đặc tả `NpcSpec.route/pose/scale/speed`, kiểm `scene/routeCheck.ts` + `check-scene --thu-npc`, bản thử `scene/npcDraft.ts`; giờ `zones/gioVN.ts`; tiền `zones/{alms,tinDon,walletRules}.ts` + `app/lib/journey/wallet.dart`, `progress_store.dart`; âm `zones/moGo.ts`, `ui/moSound.ts`, `nhac/mo.wav` (`scripts/mo-wav.mjs`); Canvas 3D `townPreview.ts`; sổ R-NPC-6/7/8, R-TIEN-8, R-AM-1; kế hoạch `docs/tasks/2026-11-14-npc-khat-nhi-go-mo.md` |
| bục đàn, đàn cổ tranh, nhạc công, Cầm Nương, tiếng đàn, `?dang=dan-tranh` | `buc-dan`, `bucDan`, `DanTranh`, `ZitherSound`, `pluckSamples`, `danVolume`, `pluck` | ghép `web/src/danTranh.ts` (+ `main.ts`, Canvas 3D `designPreview.ts`); bục + đàn `scene/vat_dan_tranh.ts`, số đo `scene/bucDan.ts`, prop `buc-dan` trong đặc tả; nhạc `zones/danTranh.ts`, tiếng dây tự tổng hợp `ui/zitherSound.ts`; dáng gảy `CharacterState.pluck` (`player/glbCharacter.ts`); model `cam-nu` (phiếu `2026-11-15-anh-cam-nu`); sổ R-NPC-9, R-AM-2; kế hoạch `docs/tasks/2026-11-15-npc-dan-tranh.md` |
| thanh công cụ đáy màn, nút Bản đồ / Về nhà / Biểu cảm / Túi đồ / Nhiệm vụ, phím T H B I J, biểu cảm (vẫy tay, cúi chào, vỗ tay, ngồi nghỉ…), túi đồ, `?dang=bieu-cam` | `thanhCongCu`, `ThanhCongCu`, `bieuCam`, `emotePose`, `emote`, `travelParams` | luật thuần `web/src/zones/thanhCongCu.ts` (nút sáng / mờ / ẩn, việc khi chạm), `web/src/zones/bieuCam.ts` (8 biểu cảm), ghép `web/src/thanhCongCu.ts` (+ `main.ts` `openMap('thanh')`, `travel(…, 'thanh')`), đi bằng thanh `zones/cuoiHac.ts` (`TravelHow` `thanh`, `wantsCrane` `indoor`), dáng `web/src/player/bieuCamDang.ts` + `player/controller.ts` `emote()` + `glbCharacter.ts`, HUD `ui/toolbar.ts` · `ui/emotePanel.ts` · `ui/emoteBubble.ts` (ghép `chatRoom.ts`) · `ui/bagPanel.ts` + `ui/toolbar.css`, túi đồ thuần `zones/tuiDo.ts`, phím `input/keyboard.ts`; Canvas 3D `web/src/bieuCamPreview.ts`; sổ R-THANH-*, R-HANH-6/7, R-BIEU-*, R-TUI-1; kế hoạch `docs/tasks/2026-11-15-thanh-cong-cu.md`; HUD chờ phiếu `2026-11-15-thanh-cong-cu` |

Thêm tính năng / thư mục mới → thêm một dòng vào bảng này cùng lúc.
