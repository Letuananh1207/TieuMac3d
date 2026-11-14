# Ngồi: nhìn từ mắt nhân vật (ngôi 1) — hai bàn tay + cuộn sách tương tác
- Việc: V-20261114-21 · nhánh `viec/ngoi-goc-mat`
- Yêu cầu: "tôi muốn khi ngồi góc camera phải đổi như nhìn từ mắt nhân vật chính và thấy 2 bàn tay + tài liệu đọc hay
  gì đó có thể tương tác trên tài liệu, còn người bên ngoài nhìn thì sẽ giống như hiện tại"
- Người dùng đã chọn: áp cho **mọi kiểu ngồi** (Ngồi ôn tại chỗ, bồ đoàn khu tự học, án thư / bàn trà / đôn / sập /
  ghế lan can trà lâu, ghế bàn chơi) · tài liệu = **cuộn sách 3D thay bảng chọn HUD** (chạm thẳng lên chữ trên cuộn, tay
  giở / trỏ) · hai bàn tay **dựng bằng khối trong code** (tay áo cùng màu áo) · **kéo để nhìn quanh có giới hạn**
  (~±60° ngang, ngẩng / cúi giới hạn), thả tay thì từ từ nhìn lại tài liệu · "người bên ngoài thấy như cũ" = thân nhân
  vật vẫn ngồi đúng dáng cũ trong cảnh, chỉ camera của mình đổi, đầu / thân mình ẩn khỏi camera mình.
- Loại: sửa hành vi + giao diện mới · Cỡ: lớn · Trạng thái: **đang làm** (đợt 1; phần chữ trên cuộn + cầu nối: chờ thiết kế —
  phiếu `docs/phieu_thiet_ke/2026-11-14-ngoi-goc-mat.md`)

## Phạm vi

**Sẽ sửa**
- `docs/testing/quy_tac.md` — R-DIEU-7 (camera Ngồi ôn), R-NGOI-1 (camera án thư / bàn trà), R-ON-8 (bảng chọn →
  cuộn sách 3D), R-GIAO-1 (camera bàn chơi), R-VA-4 (ghế lan can "camera sau lưng nhìn ra ngoài", bồ đoàn khu tự học),
  R-DIEU-1 (đang ngồi: kéo = nhìn quanh). Nháp ở mục "Luật nháp" dưới — **chưa ghi sổ**.
- `docs/bridge.md` — `openStudy` thôi mở bảng chọn Flutter; thêm `openLearned` (xem Q4). Hai phía cùng lúc.
- `web/src/scene/spec.ts` — thêm `camera.firstPerson` (mắt, góc, giới hạn nhìn quanh, thời gian chuyển, màu tay áo
  mặc định) + giá trị mặc định (quy tắc 8; `scene.json` thiếu trường → cảnh cũ không đổi). `scripts/check-scene.mjs` nếu
  kiểm dạng `camera`.
- `web/src/input/eyeCamera.ts` (**mới**, thuần + test) — tư thế camera ở mắt, nhìn quanh kẹp giới hạn, lò xo nhìn lại,
  trộn mượt ngôi 3 ↔ ngôi 1.
- `web/src/input/orbitCamera.ts` — giữ `sit()` để nhớ / trả góc cũ khi đứng dậy; thêm cách đọc tư thế hiện tại để trộn;
  đang ngôi 1 thì không zoom.
- `web/src/input/pointers.ts` — đang ngôi 1: kéo → `eyeCamera.look` (không `orbit.rotate`), chụm / lăn bỏ qua; chạm
  ngắn → chạm cuộn / bàn.
- `web/src/scene/tayNgoi.ts` + `tayNgoiDang.ts` (**mới**) — hai bàn tay khối + dáng (cầm cuộn, giở, trỏ, đặt bàn, đặt
  gối, cầm quân); dáng là hàm thuần có test.
- `web/src/scene/cuonSachMat.ts` (**mới**) — cuộn sách lớn trước mắt (dùng lại hình trục / giấy của `cuonSach.ts` —
  tách hàm dựng chung), giấy có `CanvasTexture`, đặt vừa khung theo tỉ lệ màn, raycast → toạ độ (u, v) trên giấy.
- `web/src/scene/cuonSach.ts` — tách hàm dựng trục / giấy dùng chung; cuộn trước ngực giữ nguyên cho "người ngoài nhìn".
- `web/src/scene/layers.ts` (**mới**, vài dòng) — số lớp render: `THAN` (thân mình + cuộn trước ngực), `MAT` (tay +
  cuộn ngôi 1).
- `web/src/ngoiMat.ts` (**mới**, file ghép gốc như `gamePlay.ts`) — trạng thái ngồi theo loại chỗ → camera mắt, lớp
  render, tay, cuộn, chạm.
- `web/src/main.ts` — vài dòng: thay các lời gọi `orbit.sit(true, …)` / `gamePlay.placeCamera` bằng `ngoiMat`; `study()`
  mở cuộn web thay `bridge.openStudy`.
- `web/src/gamePlay.ts` — `placeCamera` theo Q1; tay đặt quân.
- `web/src/ui/` — **chờ thiết kế**: vẽ chữ / mục lên canvas giấy cuộn (`ui/cuonMuc.ts` mới — dựng canvas 2D theo thiết
  kế, vùng chạm theo (u, v)).
- `web/src/designPreview.ts` — Canvas 3D thêm `?dang=ngoi-mat` để phiên thiết kế chụp khung ngôi 1 bằng đúng code app.
- Flutter (chờ Q4): `app/lib/scene/` đón `openLearned`; `app/lib/lesson/study_screen.dart` thôi dùng (giữ / xoá theo Q4).

**Cần kiểm tra**
- `input/orbitCamera.test.ts` (R-DIEU-7, R-NGOI-1 camera cũ) — test đổi theo luật mới.
- `designPreview.ts` gọi `orbit.sit(true, …)` (`?dang=ngoi`) — vẫn biên dịch.
- `zones/studyMenu.ts` — dữ liệu mục giữ nguyên, chỉ đổi nơi vẽ.
- `scene/nhapDinh.ts` — vòng sáng dưới đệm vẫn hiện (thấy được khi cúi), cuộn trước ngực sang lớp `THAN`.
- `player/glbCharacter.ts`, `chibiCharacter.ts`, `discipleCharacter.ts` — gán lớp `THAN` cho cả cây con của `root`
  (bóng tròn dưới chân cũng ẩn — chấp nhận); hợp đồng `Character` thêm trường **không bắt buộc** `palette?` (màu tay
  áo / da) — controller không đổi (quy tắc 5).
- `input/tapToMove.ts` `pickObject`, `gamePlay.tap` — `Raycaster` mặc định lớp 0: tay / cuộn lớp `MAT` không chắn chạm
  bàn; raycast cuộn dùng raycaster riêng bật lớp `MAT`.
- `chatRoom.ts` / `ui/chatBubbles.ts` — bong bóng thoại trên đầu **chính mình** ẩn khi ngôi 1 (không thì nổi giữa màn).
- `scene/renderer.ts` — `near` 0,1 m giữ nguyên (vật gần nhất ≥ 0,18 m; hạ near làm xa bị chớp z).
- `ui/joystick`, `actionButtons` — luật hiện / ẩn giữ như cũ (R-ON-8, R-GIAO-1).
- Mờ mái trong nhà (R-HUD-2) — theo vị trí nhân vật, ngôi 1 vẫn đúng; tường sau lưng không cần tránh nữa.

**Không đụng**
- Bản đồ vùng (V-20 làm song song — `ui/mapHud.ts`, `scene/banDo.ts`): khi ngồi vốn ẩn, không sửa.
- Dáng ngồi của nhân vật, `PlayerController`, vị trí ngồi, tầm nút nổi Ngồi, luật trò chơi (`games/`), dữ liệu bộ thủ.
- Đọc sách HSK (R-SACH-3 — đứng đọc, màn Flutter): không đổi lần này.
- `design/` (chỉ đọc), `reference/`.

## Giả định (không cần hỏi — sửa được khi thử máy)
- Mắt người ngồi: cao hơn chân ~1,35 m (chibi đầu to; ngồi hạ 0,3 m), lệch trước tâm thân 0,08 m — đặt trong
  `camera.firstPerson`, chỉnh theo model.
- FOV ngôi 1 = FOV cảnh (55° dọc). Màn dọc chỉ ~27° ngang → cuộn / bàn đặt theo **khung vừa màn** (tính khoảng cách từ
  FOV ngang như `placeCamera` đang làm), không đặt cố định theo mét.
- Nhìn quanh: ngang ±60° quanh hướng mặt, ngẩng tối đa +20°, cúi tối đa −70°; thả tay **1 giây** rồi nhìn lại trong
  **~0,6 giây** (êm dần); tốc độ xoay tối đa 90°/s như R-DIEU-3. Ngồi: chụm / lăn chuột không làm gì.
- Chuyển ngôi: **0,4 s** êm đầu-cuối (smoothstep), vị trí trộn tuyến tính, hướng trộn quaternion; thân ẩn ở 60 % đường
  (camera đã sát đầu) — đứng dậy thì hiện thân ngay khi bắt đầu lùi ra. Không lắc đầu theo nhịp thở (chống chóng mặt).
- Ngồi ôn: ngồi xuống là sang ngôi 1 ngay; cuộn mở ở giây thứ 1 như nhịp cũ (0,3 → 1 s), cuộn lúc đầu trống chữ.
- "Người ngoài nhìn": dáng ngồi + cuộn trước ngực vẫn dựng như nay trên lớp `THAN` — mai có nhiều người chơi thì máy
  người khác vẽ đúng cái đó; không gửi gì mới qua mạng (chưa có mạng).
- Màu tay áo: `Character.palette?.sleeve`; model `.glb` (màu nướng sẵn trong ảnh) không có → `camera.firstPerson.sleeve`
  (mặc định = màu áo đệ tử chibi `DE_TU`); da = màu da chibi.
- Trình duyệt (không Flutter): cuộn vẫn có mục; mục cần màn Flutter làm như dự phòng hiện nay (Ôn → thẻ bộ mới nếu
  học được ở đây; Xem bộ đã học → mở bảng HTML thẻ bộ chọn — theo Q4).

## Điểm cần quyết định

**Q1. Bàn chơi (Ngũ Tử Kỳ, Đấu chữ) — nhìn thế nào?** Đo: mắt ngồi cao hơn mặt bàn ~0,85 m, bàn cờ 1,2 m bắt đầu cách
0,8 m → hàng xa nghiêng 23°, mỗi ô xa chỉ ~8 px trên màn dọc; bàn cờ rộng 46° mà màn dọc thấy 27° ngang → **ngồi đúng
tầm mắt không thấy hết bàn, khó bấm trúng giao điểm**.
- A. Đúng mắt người ngồi, kéo nhìn quanh để thấy phần bàn bị khuất. Thật nhất; bấm sai nhiều (hàng xa, màn dọc).
- B. Lai: chờ lượt Tiểu Mặc → đúng mắt; tới lượt mình → "cúi nhìn bàn" (mục C) tự trượt vào 0,4 s.
- **C. (đề xuất)** "Cúi nhìn bàn": camera từ mắt mình cúi nhoài ra trên mép bàn phía mình, nhìn xuống chỗ chơi ~70°,
  bàn vừa khít bề ngang màn (như góc bàn chơi hiện nay nhưng từ chỗ mắt mình, không thấy lưng mình); hai bàn tay ở mép
  dưới, tay phải đưa quân tới giao điểm khi đặt; không nhìn quanh (chạm = chạm bàn, như R-GIAO-1).
- Duyệt C xong người dùng thấy: vào bàn → camera trượt từ sau lưng vào mắt rồi cúi xuống bàn; không thấy đầu mình; hai
  tay áo ở đáy màn; chạm giao điểm → tay phải đặt quân rồi rút về.

**Q2. Đấu chữ — chọn nghĩa ở đâu?**
- **A. (đề xuất)** Giữ HUD câu hỏi + 4 nghĩa như thiết kế 2026-11-13.27 (R-DAU-2 không đổi); chỉ đổi góc nhìn (Q1) +
  hai tay cầm thẻ bộ thủ trên bàn.
- B. 4 thẻ nghĩa đặt trên bàn, tay trỏ chạm thẻ — giao diện mới, sửa R-DAU-2 / R-CO-3, chờ thiết kế (thêm vào phiếu).
- Duyệt A xong: ngồi Đấu chữ thấy thẻ bộ thủ trên bàn trong hai tay; HUD nghĩa vẫn ở đáy màn như nay.

**Q3. Án thư / bàn trà / đôn / sập / ghế lan can — tay làm gì?** (hiện không có cuộn sách — R-NGOI-1, R-VA-4, R-NHAC-2)
- A. Chỉ hai tay đặt lên bàn (chỗ không bàn: đặt trên gối), nhìn ra phía trước.
- **B. (đề xuất)** Như A + vật cầm trang trí theo chỗ, **không tương tác, không đổi luật**: bàn trà / đôn / sập → tay
  phải cầm chén trà, thỉnh thoảng nâng lên (~8 s); án thư Tàng Thư Các → quyển sách mở trên án, tay đặt hai bên;
  ghế lan can → tay đặt lan can, nhìn ra núi.
- C. Mở cuộn sách Ngồi ôn ở cả các chỗ này — **đổi luật** R-NGOI-1 / R-ON-8 ("không mở cuộn sách"), cần quyết riêng.
- Duyệt B xong: ngồi bàn trà thấy bàn + chén trà trong tay phải, nhìn qua bàn sang chỗ đối diện; ngồi lan can thấy
  hai tay trên lan can, cảnh núi phía trước; không có mục nào để bấm.

**Q4. Sau khi chạm một mục trên cuộn — mở màn gì?**
- **A. (đề xuất)** Chỉ **bảng chọn** lên cuộn 3D; "Ôn bộ đến hạn" / "Học bộ mới" / "Xem bộ đã học" vẫn mở màn Flutter
  như nay (màn ôn, thẻ bộ thủ, Bộ đã học — đã có thiết kế, đã chạy). Cầu nối: trang gửi thẳng `openReview` /
  `openRadical` / **`openLearned`** (mới, dữ liệu = phần `learned` của `openStudy`); đóng màn → `resume` → cuộn hiện
  lại. Bảng chọn Flutter `study_screen.dart` thôi dùng → xoá sau khi chạy ổn trên máy.
- B. Như A nhưng "Xem bộ đã học" cũng trên cuộn (lật trang giấy, lưới bộ thủ; chạm một bộ → thẻ Flutter) — thêm trạng
  thái vào phiếu, thêm việc.
- C. Cả câu đố ôn trên cuộn — việc rất lớn, viết lại màn ôn; không đề xuất lúc này.
- Duyệt A xong: ngồi ôn 1 giây → hai tay mở cuộn trước mặt, các mục in trên giấy; chạm "Ôn bộ đến hạn (2)" → tay phải
  trỏ vào mục → màn ôn Flutter mở như cũ; đóng → lại thấy cuộn trong tay.

**Q5. Có cách quay về nhìn từ ngoài khi đang ngồi không?** (người hay chóng mặt / muốn ngắm nhân vật mình)
- **A. (đề xuất)** Không — ngồi luôn ngôi 1 (nút góc nhìn đã bỏ, R-HUD-1). Thử máy thấy cần thì thêm sau.
- B. Nút nhỏ "Nhìn từ ngoài" khi ngồi (giao diện mới — thêm vào phiếu).
- Duyệt A: không thêm nút nào.

**Q6. Thân mình ẩn đến đâu?**
- **A. (đề xuất)** Ẩn cả nhân vật khỏi camera mình (lớp render) — đơn giản, chắc, không lộ mặt cắt; cúi xuống thấy
  bồ đoàn + vòng sáng, không thấy chân.
- B. Cắt ngang ngực (mặt phẳng cắt trên vật liệu) — cúi xuống thấy gối / chân xếp bằng; model `.glb` một lớp vỏ nên
  nhìn xuống chỗ cắt có thể thấy lỗ rỗng — phải thử.
- Duyệt A: nhìn xuống không thấy thân mình, chỉ có hai tay áo và đệm.

## Đã duyệt 2026-11-14
- Q1 = **C** "cúi nhìn bàn" ~70° từ mắt mình, hai tay ở mép dưới, tay đặt quân.
- Q2 = **A** giữ HUD 4 nghĩa của Đấu chữ; hai tay cầm thẻ bộ thủ.
- Q3 = **B** vật cầm trang trí (chén trà ở bàn trà / đôn / sập; sách mở ở án thư), không tương tác, không đổi luật.
- Q4 = **A** chỉ bảng chọn lên cuộn; màn ôn / thẻ bộ thủ / Bộ đã học vẫn Flutter; thêm `openLearned`, bỏ `StudyScreen`.
- Q5 = **A** không có nút quay về ngôi 3 khi ngồi.
- Q6 = **A** ẩn cả nhân vật khỏi camera mình bằng lớp render.
- Làm: NV1 (ghi sổ, Xác nhận `chờ`, **chưa** đồng bộ online) + đợt 1 (NV2–11). NV12, NV13 chờ thiết kế — trong lúc chờ,
  cuộn trước mắt là **giấy trống**, bảng chọn Ngồi ôn Flutter hiện tại vẫn mở như cũ (người dùng đã được báo).
- main đã có bản đồ vùng V-20 (R-BANDO-1: ẩn bản đồ nhỏ khi ngồi) — không đụng.

## Nhiệm vụ
Ký hiệu: **[trước]** làm được trước thiết kế · **[chờ TK]** chờ thiết kế (phiếu `2026-11-14-ngoi-goc-mat`) ·
**[chờ Q…]** chờ quyết định.

- [x] 1. **[đã ghi sổ, chưa đồng bộ online]** Sổ luật: sửa R-DIEU-7, R-NGOI-1, R-ON-8, R-GIAO-1, R-VA-4, R-DIEU-1 theo nháp đã duyệt →
  `/dong-bo-quy-tac` (tự chép online, `--mark-synced`). (`docs/testing/quy_tac.md` · xong khi `rule_trace --pending`
  sạch)
- [x] 2. **[trước]** Đặc tả: `camera.firstPerson` trong `SceneSpec` + mặc định (mắt cao / trước, góc cúi theo loại chỗ
  `study` 35° · `seat` 25° · `game` 70°, giới hạn nhìn quanh, `blend` 0,4 s, `returnDelay` 1 s, `returnTime` 0,6 s,
  `sleeve`, `skin`). (`scene/spec.ts`, `scripts/check-scene.mjs` · lớp scene · test: `scene:check` qua · xong khi
  `scene.json` không có trường → mặc định, build không đổi cảnh)
- [x] 3. **[trước]** `input/eyeCamera.ts` thuần: `pose(root, yaw, sitB, kind)` → vị trí mắt + hướng; `look(dx, dy)` kẹp
  giới hạn; `update(dt)` lò xo nhìn lại sau `returnDelay`; `blend(t, from, to)` trộn ngôi 3 ↔ ngôi 1. (lớp input ·
  test `eyeCamera.test.ts`: kẹp ±60° / +20° / −70°, thả 1 s rồi về trong 0,6 s, trộn 0 → 1 đúng đầu-cuối, không xoay
  nhanh hơn 90°/s · xong khi vitest xanh)
- [x] 4. **[trước]** `orbitCamera.ts`: đọc tư thế camera hiện tại (để trộn), `sit()` vẫn nhớ / trả góc cũ; đang ngôi 1
  thì `pinch` / `wheel` không đổi `dist`. (lớp input · test `orbitCamera.test.ts` sửa theo luật mới · xong khi đứng dậy
  về đúng khoảng cách / ngẩng / hướng cũ)
- [x] 5. **[trước]** Lớp render + ẩn thân: `scene/layers.ts`; gán `THAN` cho cây `character.root` và cuộn trước ngực;
  camera bật `THAN` khi ngôi 3, tắt khi ngôi 1 (ở 60 % chuyển), bật `MAT` khi ngôi 1. `Character.palette?` (không bắt
  buộc) cho chibi / khối. Bong bóng thoại của chính mình ẩn khi ngôi 1. (lớp scene + player + ghép · test: ngồi ôn →
  `camera.layers` không có `THAN`; đứng dậy → có lại; dáng ngồi `CharacterState.sit` không đổi · xong khi màn mình không
  thấy đầu, Canvas 3D góc ngoài vẫn thấy nhân vật ngồi cầm cuộn)
- [x] 6. **[trước]** `scene/tayNgoi.ts` + `tayNgoiDang.ts`: hai tay low-poly (ống tay áo 6 cạnh loe + viền cổ tay, bàn
  tay hộp vát, ngón cái, 3 ngón gộp + ngón trỏ riêng), màu theo đỉnh, Lambert; dáng: `cam-cuon`, `gio` (tay phải xoay
  trục), `tro(u, v)` (ngón trỏ duỗi tới điểm trên giấy, 0,25 s đi + 0,2 s về), `dat-ban`, `dat-goi`, `cam-quan(x, z)`,
  `cam-chen` (Q3). (lớp scene · test `tayNgoiDang.test.ts`: dáng thuần → góc khớp nằm trong giới hạn, `tro` tới đúng
  điểm ±1 cm · xong khi ≤ 4 draw call, < 600 đỉnh, không vật nào gần mắt dưới 0,18 m)
- [x] 7. **[trước]** `scene/cuonSachMat.ts`: cuộn lớn trước mắt dùng chung hình với `cuonSach.ts` (tách hàm dựng), giấy
  có `CanvasTexture` (tạm: giấy trơn `map-paper`, **không chữ**), đặt vừa khung theo FOV + tỉ lệ màn (dọc: giấy rộng
  ~88 % bề ngang; ngang: cao ~70 % chiều cao, lệch phải), nhịp mở / thu dùng `cuonSachNhip.ts`; `hit(raycaster)` →
  `(u, v)` hoặc null. (lớp scene · test: hàm đặt-vừa-khung thuần cho 390×844 và 844×390 · xong khi cuộn trong khung ở
  cả hai chiều, chạm giấy trả đúng (u, v) trên Canvas 3D)
- [x] 8. **[trước]** Ghép `web/src/ngoiMat.ts` + vài dòng `main.ts`: trạng thái `dung | chuyen-vao | mat | chuyen-ra`
  theo loại chỗ (`on` tại chỗ, `ngoi`, `tu-hoc`, `ban-choi`); điều eyeCamera, lớp, tay, cuộn; `pointers.ts`: ngôi 1 kéo
  = nhìn quanh (bên trái 45 % vẫn là joystick "kéo để đứng dậy" khi joystick đang hiện — R-DIEU-1/7), chạm ngắn = chạm
  cuộn / bàn. (lớp ghép + input · test `ngoiMat.test.ts` nếu tách được hàm thuần trạng thái · xong khi mọi kiểu ngồi
  vào / ra mượt 0,4 s, về đúng góc cũ)
- [x] 9. **[chờ Q1]** Bàn chơi: `gamePlay.placeCamera` theo phương án chọn; tay đặt quân (`cam-quan`) khi chạm giao điểm;
  Đấu chữ tay cầm thẻ (Q2-A). (`gamePlay.ts`, `scene/gameTable.ts` chỉ đọc toạ độ · test `gamePlay.test.ts` chạm giao
  điểm vẫn đúng ô · xong khi đặt quân trúng ô ở 390×844)
- [x] 10. **[chờ Q3]** Vật cầm ở án thư / bàn trà / lan can (chén trà, sách mở) — nếu B: dựng khối nhỏ trong `tayNgoi`;
  hình dáng theo phiếu. (lớp scene)
- [x] 11. **[trước]** Canvas 3D: `designPreview.ts` thêm `?dang=ngoi-mat[&cho=on|tra|an|co|dau|tu-hoc]` hiện khung ngôi
  1 bằng code thật (cuộn trống + tay) — phiên thiết kế chụp nền để vẽ chữ lên. (xong khi `npm run build:design` chạy —
  build từ PowerShell)
- [ ] 12. **[chờ TK]** Chữ + mục trên cuộn: `ui/cuonMuc.ts` vẽ canvas 2D theo thiết kế (đầu cuộn, 3 mục, nổi bật / thường
  / mờ + lý do, gợi ý chưa học, "Đứng dậy"), vùng chạm theo (u, v), chạm → tay `tro` → mở mục; máy tính ↑ ↓ Enter, Esc
  = Đứng dậy; trợ năng (nút ẩn trong DOM cho đọc màn hình). `main.ts` `study()` mở cuộn thay `bridge.openStudy`.
  (lớp ui + ghép · test: vùng chạm (u, v) → đúng mục; mục mờ chạm không mở · chuỗi: dùng `reviewDue*`, `learnNew*`,
  `learnAt*`, `viewLearned*`, `hintGoForest`, `standUp` có sẵn; chuỗi mới theo phiếu)
- [ ] 13. **[chờ Q4]** Cầu nối: `docs/bridge.md` thêm `openLearned`, `openStudy` ghi "thôi dùng"; web
  `bridge/flutterBridge.ts`; Flutter `app/lib/scene/` đón `openLearned` → `LearnedScreen`; bỏ `StudyScreen` khỏi luồng.
  (lớp cầu nối + Flutter · test `flutter test` phần scene event · xong khi chạm "Xem bộ đã học" trên cuộn mở màn Bộ đã
  học, đóng → cuộn hiện lại)
- [x] 14. (đợt 1) **[trước]** Kiểm tra cuối + `npm run build`; ghi bảng "Bản đồ tính năng" của `/lead` dòng mới (ngồi, ngôi 1,
  tay, cuộn trước mắt → `ngoiMat`, `eyeCamera`, `tayNgoi`, `cuonSachMat`).

Thứ tự làm: 2 → 3 → 4 → 5 → 6 → 7 → 8 → 11 → 14 (đợt 1, thử máy: ngồi đâu cũng nhìn từ mắt, tay cầm cuộn trống) ·
sau quyết định: 1 → 9 → 10 · sau thiết kế: 12 → 13 → 14.

## Đợt 1 — đã làm (2026-11-14)
- NV4: không cần sửa `orbitCamera.ts` — OrbitCamera vẽ vào camera phụ (`tpCam`), `ngoiMat` trộn ra camera thật; khi ngồi
  OrbitCamera đứng yên nên đứng dậy về đúng góc cũ. `orbit.sit()` chỉ còn Canvas 3D `?dang=ngoi` dùng.
- NV7: không tách file `cuonSachMat.ts` — dùng chung `CuonSach` (lớp vẽ, `setMount`, `setPaper`, `hitUv`); khung vừa màn
  `fitScroll` ở `cuonSachNhip.ts` (test `cuonSachKhung.test.ts`).
- NV9: `tableCamera` (gamePlay.ts) ~70°, tay ở mép bàn / hai góc thẻ, chạm đặt quân → tay phải đưa quân (`takePlayed`).
- NV10: chỗ ngồi ghi `hold` (`tra` ở đôn, sập, bàn dài, bàn trà đôi trà lâu); `sach` dựng sẵn nhưng cảnh chưa có chỗ
  ngồi án thư; ghế lan can: tay để trước người (R-VA-4 còn `sửa`).
- NV11: Canvas 3D `?dang=ngoi-mat&cho=on|tu-hoc|tra|co|dau[&ngoai]` (chưa đăng artifact).
- Trong lúc chờ NV12 / NV13: cuộn trước mắt giấy trơn; bảng chọn Ngồi ôn Flutter vẫn mở như cũ sau 1 giây.

## Hiệu năng (ước tính)
- Thêm khi ngôi 1: tay 2–4 draw call (mỗi tay: ống tay + bàn tay gộp màu theo đỉnh; ngón trỏ riêng để trỏ) · cuộn trước
  mắt 5 (như cuộn trước ngực) · vật cầm (Q3) +1 · tổng **+7–10**.
- Bớt khi ngôi 1: nhân vật mình (.glb 1–2) + cuộn trước ngực 5 + bóng chân 1 không vẽ → **−7–8**. Thực tăng ≈ **0–3**.
- Đỉnh: tay < 600, cuộn ~500. Texture: canvas giấy 1024 × 704 (~2,9 MB GPU), vẽ lại chỉ khi mục đổi — không mỗi khung;
  mipmap + anisotropy 4 cho chữ nghiêng đọc rõ.
- Raycast chỉ khi chạm (1 mesh giấy), không mỗi khung. Không đèn, không bóng mới (quy tắc 4).

## Rủi ro
- **Vật sát camera bị cắt**: near = 0,1 m — giữ mọi phần tay / cuộn ≥ 0,18 m từ mắt (kiểm trong test dáng); không hạ
  near (chớp z ở núi xa). Cuộn đặt theo khung màn nên màn dọc cuộn lùi xa hơn (≈ 0,45 m) — tay "duỗi" ra; chấp nhận.
- **Chóng mặt khi chuyển ngôi**: trượt 0,4 s êm đầu-cuối, không xoay quá 90°/s, không lắc đầu theo thở, nhìn lại sau
  khi thả tay êm 0,6 s; không cắt cảnh đột ngột. Nếu thử máy vẫn khó chịu → Q5-B.
- **Màn dọc hẹp** (~27° ngang): bàn cờ / cuộn không vừa nếu đặt theo mét → đặt theo khung (Q1-C, nhiệm vụ 7).
- **Mắt chui vào tường / mái** khi ngồi sát tường (ghế lan can, sập trà sát tường sau): mắt lệch trước 0,08 m nên
  khó; thử từng loại chỗ ở Canvas 3D.
- **Chữ trên giấy nghiêng mờ / răng cưa**: canvas đủ lớn + mipmap; giấy ngửa ≤ 20° về mắt.
- **Hai cuộn cùng lúc**: cuộn trước ngực (lớp `THAN`) và cuộn trước mắt (lớp `MAT`) không bao giờ cùng hiện trên một
  camera — kiểm Canvas 3D góc ngoài chỉ thấy cuộn ngực.
- **Đụng V-20 bản đồ vùng** ở `main.ts`: chỉ thêm vài dòng ghép, không sửa đoạn bản đồ; gộp sau thì rebase.

## Luật nháp (CHƯA ghi sổ — duyệt Q1–Q4 xong mới sửa `quy_tac.md`)

**R-DIEU-7** — thay đoạn "**Camera lúc Ngồi ôn** … dùng cùng camera này.":
> **Góc nhìn lúc ngồi — từ mắt nhân vật** (mọi kiểu ngồi: Ngồi ôn tại chỗ, chỗ ngồi R-NGOI-1, bồ đoàn khu tự học
> R-VA-4, ghế bàn chơi R-GIAO-1): ngồi xuống → camera trượt mượt trong khoảng **0,4 giây** từ chỗ đang đứng tới **mắt
> nhân vật**, nhìn theo hướng mặt; Ngồi ôn cúi xuống khoảng 35° — thấy **hai bàn tay** (tay áo cùng màu áo) cầm cuộn
> sách giữa màn. Trên màn của mình **không thấy đầu, thân mình**; dáng ngồi của nhân vật trong cảnh không đổi (người
> khác nhìn vẫn thấy ngồi xếp bằng cầm cuộn trước ngực). Kéo màn (ngoài vùng cần điều khiển) → **nhìn quanh**: ngang tối
> đa khoảng **60°** mỗi bên so với hướng mặt, ngẩng tối đa khoảng 20°, cúi tối đa khoảng 70°; thả tay khoảng 1 giây thì
> từ từ (khoảng 0,6 giây) nhìn lại tài liệu / bàn. Đang ngồi chụm / lăn chuột không zoom. Đứng dậy → camera trượt mượt
> khoảng 0,4 giây về đúng khoảng cách, góc ngẩng và hướng như trước khi ngồi.

  Ví dụ (thay ví dụ camera cũ): "Đứng sau lưng nhân vật, bấm C → trong 0,4 s camera vào mắt, thấy hai tay, 1 s → cuộn
  mở trong tay; không thấy đầu mình. Kéo sang phải 300 px → nhìn lệch tối đa 60° rồi dừng; thả tay → 1 s sau nhìn về
  cuộn. Giữ joystick → đứng dậy, camera lùi về đúng góc cũ sau lưng."

**R-NGOI-1** — thay "Ngồi vào án thư / bàn trà → camera lùi ra khoảng 5,5 m … như trước khi ngồi. (Ghế bàn chơi …
R-DIEU-7.)":
> Ngồi vào án thư, bàn trà, đôn, sập, ghế lan can → góc nhìn **từ mắt** như R-DIEU-7, nhìn theo hướng chỗ ngồi, cúi
> khoảng 25° — thấy mặt bàn và chỗ đối diện; **hai tay đặt trên bàn** (chỗ không có bàn: trên gối; ghế lan can: trên
> lan can) [Q3-B: bàn trà / đôn / sập — tay phải cầm chén trà; án thư — quyển sách mở trên án; chỉ để nhìn, không chạm
> được]; nhìn quanh có giới hạn như R-DIEU-7; đứng dậy → camera về như trước khi ngồi.

**R-ON-8** — thay "… nhân vật mở cuộn sách trên tay và hiện bảng chọn 3 mục: …" và các câu về bảng:
> ngồi ôn đủ **1 giây** ở bất kỳ đâu → hai tay mở **cuộn sách trước mặt** (góc nhìn từ mắt, R-DIEU-7); **các mục in
> ngay trên giấy cuộn** (không còn bảng chồng lên cảnh): [3 mục, lý do mờ, mục nổi bật, dòng gợi ý chưa học — giữ
> nguyên chữ]. **Chạm thẳng vào mục trên giấy** → ngón trỏ tay phải chỉ vào mục rồi mở; chạm mục mờ → không mở gì.
> Cuối giấy có **"Đứng dậy"**: hai tay cuộn giấy lại, nhân vật đứng dậy. Kéo (trên giấy hay ngoài giấy) là nhìn quanh,
> không chọn. Đóng thẻ học / màn ôn / Bộ đã học → vẫn ngồi, cuộn hiện lại trong tay (không chạy lại nhịp 1 giây). Đang
> mở cuộn: nhân vật đứng yên; cần điều khiển, cụm nút hành động và nút Trò chuyện ẩn. … [giữ câu về chỗ ngồi / khu tự
> học]. **Không có màn Flutter (trình duyệt)**: cuộn vẫn hiện đủ mục; chọn mục cần màn Flutter → còn bộ đến hạn → thẻ bộ
> mới nếu học được ở đây; "Xem bộ đã học" → [theo Q4].

  Ví dụ thêm: "Cuộn mở → chạm chữ 'Ôn bộ đến hạn (2)' trên giấy → tay phải trỏ vào → màn ôn mở. Kéo ngang trên giấy →
  nhìn quanh, không mở gì. Chạm 'Học bộ mới' mờ → không mở."

**R-GIAO-1** — thay "camera nhìn xuống chỗ chơi đó từ phía mình" (theo Q1-C):
> camera trượt vào **mắt mình** rồi **cúi nhoài nhìn xuống chỗ chơi** (khoảng 70°), bàn cờ / thẻ vừa bề ngang màn; không
> thấy đầu, thân mình; **hai tay** ở mép dưới — đặt quân thì tay phải đưa quân tới giao điểm rồi rút về (Đấu chữ: hai tay
> cầm mép thẻ bộ thủ). [giữ nguyên: ẩn joystick, chạm = chạm bàn, không xoay camera, "Rời bàn"…]

**R-VA-4** — "người ngồi quay ra ngoài nhìn cảnh, camera sau lưng nhìn ra ngoài" → "người ngồi quay ra ngoài nhìn cảnh,
nhìn từ mắt (R-DIEU-7), hai tay trên lan can". Bồ đoàn khu tự học: "nhập định + cuộn sách **trước mặt** + các mục trên
cuộn như Ngồi ôn (R-ON-8)".

**R-DIEU-1** — thêm: "Đang ngồi (không ở bàn chơi): kéo ngoài vùng cần điều khiển = nhìn quanh từ mắt (R-DIEU-7), chụm
không zoom."

Cũng rà khi sửa sổ: R-NHAC-2 (đôn trà lâu), R-VUNG-1 / R-VUNG-2 / R-HANH-3 / R-ON-5 (chữ "cuộn sách Ngồi ôn" vẫn đúng
— chỉ đổi nơi hiện mục), R-SACH-2 ("cuộn sách Ngồi ôn" che nút "Đọc sách" — giữ).

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · npm run build:design
(PowerShell) · cd app && flutter analyze && flutter test -r failures-only test/scene · dart tool/rule_trace.dart ·
thử máy: Android dọc + ngang — mọi kiểu ngồi (C tại chỗ, bồ đoàn tự học, án thư, bàn trà, đôn, sập, lan can, bàn cờ,
Đấu chữ), nhìn quanh, chạm mục trên cuộn, đứng dậy về góc cũ, fps không tụt.
