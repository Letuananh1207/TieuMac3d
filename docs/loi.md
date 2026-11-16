# Sổ lỗi — Học Xá 3D

| Lệnh | Làm gì |
|---|---|
| `/loi` | Liệt kê lỗi chưa `xong`, xếp theo mức độ rồi theo mã. |
| `/loi <mô tả>` | Ghi lỗi mới, chưa sửa. |
| `/loi sua [L-…]` | Sửa lỗi đó (không mã → lỗi đầu danh sách mở). |
| `/loi xong L-…` | Thử trên máy thật đạt → `xong`. |
| `/loi mo L-…` | Thử trên máy vẫn lỗi → mở lại. |

Trạng thái: `mới` → `đang sửa` → `chờ thử máy` → `xong` · `không sửa (<lý do>)`.
Mã `L-<số>` tăng dần, không dùng lại. Trong worktree (làm song song) ghi tạm `L-?1`, `L-?2`… — `dart tool/viec.dart
gop` cấp số thật khi gộp vào main.

Mức độ:
- **chặn dùng** — văng app, màn trắng / scene không hiện, nhân vật không đi được hoặc kẹt cứng, không vào được bài học.
- **khó chịu** — điều khiển sai hướng / giật, thẻ mời hiện sai lúc, va chạm xuyên vật, chữ vỡ dấu, HUD bị tai thỏ che, tụt fps rõ.
- **nhỏ** — lệch màu, lệch vài pixel, chữ sai chính tả, thứ chỉ thấy khi cố tìm.

## Đang mở

### L-22 · Hạc cưỡi (model Tripo) nằm phục khi đáp — phải đứng trên hai chân rồi mới bay

- Trạng thái: chờ thử máy · Mức độ: khó chịu (hoạt cảnh truyền tống trông sai dáng, không chặn dùng) · Phần: cưỡi hạc (`scene/hac.ts`, `scene/hacModel.ts`, `cuoiHac.ts`) · Quy tắc: R-HANH-5
- Báo: 2026-11-16 — "tôi muốn lúc hạc đến phải giống như ban đầu nghĩa là đứng rồi mới bay"
- Các bước: 1. Mở bản đồ truyền tống, chọn nơi đến. 2. Xem hạc sà xuống trước mặt. 3. Tới nơi, xem hạc hạ cánh thả nhân vật.
- Mong đợi / thực tế: hạc đáp xuống **đứng trên hai chân** (thân nâng, cổ ngẩng, cánh xếp), nhân vật nhảy lên / xuống, rồi hạc nhún chân bật lên bay (chân thu ra sau) / model Tripo tư thế bay, chân duỗi ra sau → lúc đáp chỉ gập cánh, bụng sát đất như "nằm phục".
- Bằng chứng: `design/screens/Hac-model-dat.png` (hàng "Đứng đáp", cột phải).

**Sửa**
- Nguyên nhân: model không có dáng đứng; `hacModel.ts` chỉ tự tách 5 xương (gốc, vai, đầu cánh), không có xương chân → `fold` chỉ gập cánh.
- Cách (người dùng chọn 2026-11-16): code tự tách hai chân như cánh, bẻ chân thẳng đứng khi đáp, nâng thân; cất cánh nhún + thu chân. 0 coin.
- Đo `hac.glb` (sau chuẩn hoá, chưa nhân scale 1,25): hông y 0,29 z −1,19 · cổ chân y 0,10 z −2,23 · ngón z −2,57 · |x| chân 0,14 · bán kính ống chân 0,095 / bàn chân 0,073 → đứng: thân nâng ~1,15 m (chỗ ngồi y 1,34 → ~2,7, tức ~3,3 m trên đất sau scale), ngẩng 0,35 rad.
- Hành vi đúng: R-HANH-5 không đổi chữ, mốc `CRANE_TIMING` giữ nguyên → không sửa sổ quy tắc.
- Test: `web/src/scene/hacChan.test.ts` — `'R-HANH-5 (L-22): hạc model đáp xuống đứng trên hai chân — đo chân, dáng đứng'` (lưới giả chân duỗi sau `hacGia.ts`: tìm chân, trọng số + dải chuyển mềm ở hông, đứng chạm y = 0, chân gần thẳng đứng, nhún giữ bàn chân); `web/src/scene/hacModel.test.ts` — `'R-HANH-5 (L-22): hạc model đáp xuống đứng trên hai chân, không nằm phục'` (`Crane.stand` qua xương thật: dáng bay đặt dưới đất = nằm phục, đứng → bàn chân chạm đất, lưng nâng ≥ 0,6 m, chỗ ngồi theo lưng, stand = 0 về đúng dáng bay, bản khối không đổi); `web/src/cuoiHacChan.test.ts` (nhịp chân trong mốc R-HANH-5: chân thẳng trước khi chạm, nhún đỡ hết trước khi nhân vật lên xong, nhún → bật → thu chân xong trước khi mây phủ). Trước sửa: `Crane` không có `stand` / xương chân → test không chạy được (đỏ).
- Code: `web/src/scene/hacChan.ts` (mới — tìm chân bằng hình chiếu mặt bên + "mở" hình, trọng số chân, `standPose`), `hacCanh.ts` (9 xương, trọng số chân), `hacModel.ts` (xương hông + cổ chân), `hac.ts` (`stand`, `squat`, chỗ ngồi theo thân, `standLift`), `hacDuong.ts` (`arriveStand`, `absorbSquat`, `launchLegs`), `cuoiHac.ts` (khúc `cat` / `ha` / bay đi: chân duỗi xuống trước khi chạm, nhún đỡ, đứng khi nhảy lên / xuống, nhún → bật → thu chân; đường bay lên chờ hết nhịp nhún; camera nhìn theo chỗ ngồi cao hơn), `hacPreview.ts` (`&chan`, `&nhun`, `&cao`, `&goc=cheo`). Vẫn 1 SkinnedMesh, vật liệu như cũ. Ảnh `design/screens/Hac-dung.png`.
- Thử máy: 1. App (bản build mới) → Bản đồ truyền tống → chọn nơi đến: hạc sà xuống, chân duỗi xuống trước khi chạm, **đứng trên hai chân**, nhân vật nhảy lên lưng, hạc nhún rồi bật lên, chân thu ra sau. 2. Tới nơi: hạc hạ đứng, nhân vật nhảy xuống, hạc nhún bật bay đi. Còn lỗi → quay màn / chụp lúc hạc đứng (bên, sau) + log `chrome://inspect`.
- Commit: nhánh `viec/hac-dung`.

**Lịch sử**
- 2026-11-16: ghi, người dùng chọn "code bẻ chân".
- 2026-11-16: sửa (9 xương: thêm hông + cổ chân hai bên), chờ thử máy.

### L-21 · Lưng nhân vật chính cong / vặn theo hai tay khi đi, chạy

- Trạng thái: chờ thử máy · Mức độ: khó chịu (thấy suốt khi di chuyển, nhìn từ sau lưng) · Phần: nhân vật (`player/dang7.ts` `tronDiCu` / `diCuDang`, `player/mixamoRig.ts` trọng số da) · Quy tắc: R-DIEU-5
- Báo: 2026-11-16 (thử máy sau L-20) — "ở dáng đi chạy và đi bộ có 1 chỗ tôi không ưng là lưng không thẳng mà bị cong theo hai tay đung đưa"; người dùng chọn: **lưng thẳng hoàn toàn** — bỏ vặn thân khi bước, chỉ tay + chân chuyển động, lưng thẳng đứng + sửa trọng số lưng bám tay
- Các bước: 1. App, nhân vật chính bản Tripo 2. Đi bộ / chạy, nhìn từ sau lưng
- Mong đợi / thực tế: lưng thẳng, đai ngang / lưng vặn chéo, đai lệch theo nhịp tay
- Bằng chứng: ảnh người dùng gửi trong chat (sau lưng, đai lệch chéo)
- Nghi nguyên nhân: (1) góc xoay hông `hipsY` của dáng đi cũ (autoRig: xoay cả người cứng) nay chia cho spine / chest / upperChest → lưng vặn cong; (2) đỉnh lưng sau vai bám xương tay (L-19 mới chuyển phần sườn dưới nách)

**Sửa**
- Nguyên nhân (ba phần cộng lại):
  1. Dáng: `tronDiCu` cộng `hipsY` của dáng đi cũ (±0,1 đi, ±0,18 chạy) vào xương `Hips` (Mixamo: cha của cả thân) và đầu quay ngược `headY` — thân vặn trái / phải theo nhịp tay, đầu vặn ngược lại. Không chia cho spine / chest / upperChest như nghi (chỉ `tronDang7` chia; đi / chạy không qua đó); `DongTac` (`tuDi`) để lại nghiêng ngang dồn trọng tâm (`sh`) ở hông / spine / chest tắt dần ~1 s sau khi bước.
  2. Da lưng bám tay (đo `design/models/nhan-vat.glb`, tư thế gốc; khớp `LeftArm` x 0,121 y 0,522 z −0,006, cỡ ống tay áo r = 0,045): mặt sau thân phía trong vai, dưới vai tới `Spine2` (y 0,48–0,52): tổng trọng số tay 25,2 (61 đỉnh, tới 0,79) → sau L-19 còn 11,3 (tới 0,61); vùng lưng sau trục tay > 1 r (y `Spine1` 0,40 → vai + r): sau L-19 còn 71 đỉnh, tổng 17,0, tới 0,84 (đỉnh nếp nách sau x ≈ ±0,11, z ≈ −0,055, cách trục tay chỉ 1,2–1,5 r nên L-19 — "xa trục tay > 1,6 r", "phía trong khớp vai" — chỉ chuyển một phần). Tay vung trước / sau kéo nếp lưng sau nách theo.
  3. Da đai bám chân (tìm thêm khi chụp: sau khi bỏ vặn dáng, đi bộ pha 6 đai vẫn lệch chéo): mặt lưng ngang đai (y 0,36–0,42, khớp háng y 0,247) bám `UpLeg` 0,11–0,32, ngay trên háng (0,30–0,36) tới 0,6 → đùi vung ±0,55 (chạy ±0,9) kéo một bên đai xuống / lùi, bên kia lên.
- Hành vi đúng: R-DIEU-5 không đổi chữ; người dùng chọn lưng thẳng hoàn toàn → không sửa sổ quy tắc.
- Code:
  - `web/src/player/dang7.ts` `tronDiCu` — không cộng `hipsY` / `headY` nữa (vẫn tính trong `diCuDang` cho nhánh `autoRig`, không đổi); khi bước duỗi y (vặn) và z (nghiêng ngang) của `hips · spine · chest · upperChest` theo trọng số `min(1, 2·move)·(1 − ngồi)`. Giữ: vung tay từ vai (L-20), chân, nhún, đổ người (`bob.rotation.x` — nghiêng cả thân cứng), cúi / ngửa x của lưng (dáng lưng, thở). Biểu cảm / làm vườn / chào / vươn vai trộn sau (khi đứng) không đổi; NPC không qua `tronDiCu`.
  - `web/src/player/mixamoRig.ts` `chuyenTrongSoNach` — thêm điều kiện lưng / bả vai: phía trong trục tay (so với điểm trục ngang tầm — tay buông chếch ra ngoài), sau trục tay 0,8 r → 1,2 r, cách trục > r (hết ở 1,2 r), thấp hơn khớp vai hay cao hơn tới một r; lấy max với điều kiện L-19. Mặt sau ống tay áo (cách trục ≤ r) và mặt sau đỉnh vai (cao hơn khớp > r) giữ. Đo lại: đỉnh đổi 434 → 495; vùng lưng sau trục tay: 71 đỉnh / tổng 17,0 / max 0,84 → 53 / 6,1 / 0,49 (còn lại là nếp nách sát ống tay áo, chuyển một phần cho khỏi rách).
  - `chuyenTrongSoEo` (mới) + gọi trong `suaNach` (như L-19: áp cho mọi model Tripo — cả NPC; dáng NPC không đổi): trọng số xương chân (`UpLeg / Leg / Foot / ToeBase`) của đỉnh cao hơn 30 % khoảng háng → `Spine1` chuyển dần sang `Spine`, hết ở 75 % (`nhan-vat.glb`: y 0,293 → 0,362; 770 đỉnh); vạt áo dưới giữ theo chân. Đo: mặt lưng y 0,36–0,42 bám chân 0,11–0,32 → 0; y 0,32–0,34 tb 0,34 → 0,17. Không đỉnh tay / ống tay áo nào bị đụng. Phần chuyển trọng số chung tách thành `chuyen()`.
- Test: `web/src/player/diCu.test.ts` — `'R-DIEU-5 (L-21): nhân vật chính đi bộ / chạy — hông, spine, chest, upperChest không vặn (y), không nghiêng ngang (z); đầu không quay ngược'` (đứng 20 s dồn trọng tâm rồi đi; đổ người bob vẫn > 0,04 / 0,2), `'R-DIEU-5 (L-21): trên xương thật — ngực (`Spine2`) chỉ cúi / ngửa…'` (xương giả chữ A, trục ngang Hips / Spine / Spine1 / Spine2 giữ nằm ngang); test L-18 đổi: hông y = 0 thay vì `hipsY` cũ. `web/src/player/mixamoRig.test.ts` — `'R-DIEU-5 (L-21): đỉnh lưng sau bả vai bám tay → chuyển sang Spine2, tổng 1; ống tay áo, mặt sau đỉnh vai giữ'`, `'R-DIEU-5 (L-21): đỉnh đai / lưng trên háng bám chân → chuyển sang Spine…'`. Đỏ trước khi sửa: hông y 0,042 (đi) / −0,064 (chạy), trọng số tay lưng 0,39 (> 0,2); test eo đỏ vì hàm chưa có. Toàn bộ `npm test` xanh (1187).
- Ảnh: `design/screens/Loi-L21-sau-lung.png` (sau lưng, trước / sau: đi bộ pha 2, 6, chạy pha 3, 5, vươn vai, vẫy tay) — sau sửa: đai ngang, lưng cân hai bên ở mọi pha, không rách; vươn vai / vẫy tay như trước (L-19 giữ). `design/screens/Loi-L21-ngang.png` (nhìn ngang: đi, chạy, ngồi ôn, nhảy) — đổ người khi chạy giữ, vạt áo khi ngồi / nhảy không kéo rách.
- Thử máy: `cd web && npm run build` → app → đi bộ (đẩy nửa cần) và chạy (đẩy hết) vài vòng, xoay camera ra sau lưng: đai ngang, lưng không vặn theo tay; nhìn ngang vẫn đổ người khi chạy, tay vung từ vai, chân thẳng. Đứng chờ vươn vai, vẫy tay, ngồi ôn, nhảy: thân / vạt áo không méo. Đi gần thủ thư / sư phụ / Tiểu Mặc (cùng sửa trọng số): vạt áo khi NPC đi không rách. Còn lỗi → chụp sau lưng lúc đi + quay màn 5 giây.

**Lịch sử**
- 2026-11-16: ghi, sửa ngay (người dùng chọn).

### L-20 · Dáng chạy / đi kỳ quặc: chân không thẳng, chỉ cẳng tay đung đưa (cánh tay trên đứng yên)

- Trạng thái: chờ thử máy · Mức độ: khó chịu (dáng di chuyển thấy suốt lúc chơi) · Phần: nhân vật (`player/dang7.ts` `tronDiCu`, `mixamoCharacter.ts`, `dongTac.ts` `CHAY`) · Quy tắc: R-DIEU-5
- Báo: 2026-11-16 (thử máy sau sửa L-18) — "dáng chạy rất kỳ quặc chân không được thẳng, tay đung đưa cũng kỳ quặc chỉ mình phần dưới gần bàn tay là đung đưa, còn phần trên thì không"; người dùng chọn: bỏ gối co + khuỷu gập, tay vung nguyên cánh từ vai, chân thẳng như dáng cũ — **cả đi bộ lẫn chạy**; các dáng khác (biểu cảm, làm vườn, chắp tay…) vẫn dùng khuỷu
- Các bước: 1. App, nhân vật chính bản Tripo (sau gộp L-18 `f57db3d`) 2. Chạy (đẩy hết cần) / đi bộ
- Mong đợi / thực tế: chân thẳng, cả cánh tay vung từ vai như dáng cũ / gối co (đi 0,75, chạy +0,8), khuỷu gập + trễ nhịp → chỉ cẳng tay lắc, cánh tay trên gần như đứng
- Bằng chứng: người dùng thử máy 2026-11-16

**Sửa**
- Nguyên nhân: nhánh Mixamo của nhân vật chính (L-18) cộng dáng đi cũ lên nền `DongTac` nhưng (1) `tronDiCu` thêm gối co theo nhịp (`DI_CU_GOI` 0,75 đi / +0,8 chạy) → chân không thẳng; (2) khuỷu vẫn lấy từ `DongTac` (`bent` = `khuyuCong` 0,28 khi đi, lên tới `CHAY.khuyu` 1,2 khi chạy — cờ `tuDi` chỉ tắt phần theo bước, không tắt khuỷu) → cánh tay trên có vung đúng ±0,34 / ±0,79 từ vai (đo bằng test: góc xương `LeftArm` đúng `diCuDang`), nhưng cẳng tay gập lệch hướng cánh tay trên nên mắt chỉ thấy bàn tay / cẳng tay lắc. Hàm `elbow` của `tronDang7` không dính vào đi / chạy.
- Hành vi đúng: R-DIEU-5 không đổi chữ; người dùng chọn chân thẳng + tay thẳng vung từ vai như dáng 7 khớp cũ → không sửa sổ quy tắc.
- Code: `web/src/player/dang7.ts` `tronDiCu` — bỏ `DI_CU_GOI`; khi bước, gối (`legL/legR`) và khuỷu (`foreL/foreR`, kể cả khuỷu chạy) duỗi về 0 theo trọng số `min(1, 2·move)·(1 − nhảy)·(1 − ngồi)` (đứng ↔ đi chuyển mượt; nhảy / ngồi giữ gối / khuỷu của dáng đó); vung tay vẫn đặt vào `armL/armR` (cánh tay trên). Biểu cảm, làm vườn, chắp tay, gõ mõ, gảy đàn trộn đè sau nên giữ khuỷu như cũ; NPC không đi qua `tronDiCu` (không đổi); nhánh `autoRig` không đổi.
- Test: `web/src/player/diCu.test.ts` — `'R-DIEU-5 (L-20): nhân vật chính đi bộ / chạy — chân thẳng (gối 0), cả cánh tay vung từ vai, cẳng tay đi theo (khuỷu 0)'` chạy `mixamoCharacter` + `mixamoRig` thật trên xương giả chữ A, đo hướng xương thế giới: đùi ∥ cẳng chân, cẳng tay ∥ cánh tay trên, góc ra trước của `LeftArm` (khung ngực) = tay đưa trước + vung tay dáng cũ từng khung, biên độ hai chiều. Đỏ trước khi sửa (gối 0,03…0,31 rad; khuỷu 0,21 đi / 0,89 chạy). Toàn bộ `npm test` xanh.
- Ảnh: `design/screens/Loi-L20-dang-di.png` (bản cũ Hunyuan autoRig · trước sửa · sau sửa; đi bộ pha 2/4/6, chạy pha 3/4/5, nhìn ngang) — sau sửa: chân thẳng, tay thẳng vung trước / sau từ vai (rõ nhất chạy pha 4), không xuyên thân.
- Thử máy: `cd web && npm run build` → app → đi bộ (đẩy nửa cần) và chạy (đẩy hết) vài vòng, nhìn ngang: chân thẳng, cả cánh tay vung từ vai; dừng lại → đứng / vươn vai / biểu cảm chuyển mượt, khuỷu biểu cảm vẫn gập. Còn lỗi → quay màn 5 giây khi đi + chạy.

**Lịch sử**
- 2026-11-16: ghi, sửa ngay (người dùng chọn). Liên quan L-18 (hai chỗ "tự chọn khác bản cũ" của L-18 bị bỏ).

### L-18 · Dáng đi nhân vật chính (bản Tripo) kém dáng đi cũ — trả về đúng dáng đi cũ

- Trạng thái: chờ thử máy · Mức độ: khó chịu (dáng đi thấy suốt lúc chơi) · Phần: nhân vật (`player/mixamoCharacter.ts`, `dongTac.ts`, `dang7.ts`) · Quy tắc: R-DIEU-5 (dáng đi / chạy), R-NPC-10
- Báo: 2026-11-16 — "tôi chưa hài lòng với dáng đi hiện nay của nhân vật tôi cảm giác ban đầu trước đó vẫn tốt hơn"; người dùng chọn: trả về đúng dáng đi cũ (nhịp, vung tay, nhún như trước khi đổi model), các dáng khác giữ nguyên
- Các bước: 1. Mở app (nhân vật chính bản Tripo, sau đợt 2 `b69fdbd`) 2. Đi bộ / chạy
- Mong đợi / thực tế: dáng đi như bản cũ (nhánh `autoRig` của `glbCharacter.ts`: nhịp `2,4·max(mps, 2,2)`, đùi 0,55 (+0,35 chạy), vung tay 0,34 (+0,45), nhún |sin|·0,05, đổ người 0,05 (+0,2)) / dáng `hoat-bat` của `dongTac` (nhanh, nhún nhiều, vung rộng)
- Bằng chứng: người dùng thử máy 2026-11-16

**Sửa**
- Nguyên nhân: đổi sang model Tripo (xương Mixamo, `b69fdbd`) thì nhân vật chính đi bằng `DongTac` bảng `hoat-bat` (`mixamoCharacter.ts`, `opts.player`): nhịp `3,1·mps` (đi bộ 9,9 rad/s thay vì 7,7), nhún `0,05·(|cos|−0,64)` + gối co 0,75, vung tay 0,42 kèm khuỷu trễ, xoay vai / hông, nghiêng khi rẽ — khác hẳn dáng 7 khớp cũ của nhánh `autoRig` (`glbCharacter.ts`).
- Hành vi đúng: R-DIEU-5 (đi / chạy theo tốc độ) không đổi chữ; người dùng chọn trả về đúng dáng cũ → không sửa sổ quy tắc.
- Code: dáng đi / chạy cũ rút thành hàm thuần ở `web/src/player/dang7.ts` — `diCuTien` (cường độ bước, hoà chạy, nhảy, pha `2,4·max(mps, 2,2)`), `diCuDang` (đùi 0,55 (+0,35), vung tay 0,34 (+0,45), tay dạng |sin|·0,07, nhún |sin|·(0,05 + 0,06), đổ người 0,05 (+0,2), hông 0,1 (+0,08), đầu −0,06 — số chép nguyên); nhánh `autoRig` của `glbCharacter.ts` gọi lại hai hàm này (không đổi hành vi). Nhánh Mixamo nhân vật chính: `DongTac.update(…, { tuDi: true })` (`dongTac.ts` — cờ mới tắt mọi phần theo bước, giữ đứng / thở / nhảy / ngồi / khuỷu) + `tronDiCu` cộng dáng cũ vào 18 khớp (đùi, gối co đúng nhịp `walkT` 0,75 (+0,8 chạy) vì xương mới có gối, bàn chân bù, vung tay, hông / cổ / đầu xoay, nhún) + `bob.rotation.x` = đổ người như cũ. NPC không đổi (không bật `tuDi`). Canvas 3D: `?pha=<n>&dung` giữ nguyên một khung đi (`&dang=chay` → chạy) để chụp so dáng (`designPreview.ts`).
- Test: `web/src/player/diCu.test.ts` — `'R-DIEU-5 (L-18): nhân vật chính đi bộ / chạy — đùi, vung tay, nhún, đổ người, xoay hông bằng dáng đi cũ'` (so từng khung với công thức cũ chép nguyên văn), `'R-DIEU-5 (L-18): nhịp bước như cũ…'` (đỏ trước khi sửa: 3 test), `'R-NPC-10 (L-18): NPC giữ dáng đi theo tính cách…'`, `'R-DIEU-8 (L-18): đứng yên…'`. Toàn bộ `npm test` xanh.
- Ảnh: `design/screens/Loi-L18-dang-di.png` (bản cũ Hunyuan · trước sửa · sau sửa, đi bộ + chạy cùng pha) — sau sửa đổ người, nhún, sải chân như bản cũ.
- Còn khác bản cũ (cố ý): gối co theo nhịp + khuỷu gập khi chạy (`CHAY.khuyu` của `dongTac`) vì xương Tripo có gối / khuỷu, model Hunyuan cũ không có — muốn bỏ thì báo.
- Thử máy: `cd web && npm run build` → app → đi bộ (đẩy nửa cần) và chạy (đẩy hết) vài vòng sân, nhìn ngang; so với cảm giác dáng đi trước khi đổi model. Còn lỗi → quay màn 5 giây khi đi + chạy.

**Lịch sử**
- 2026-11-16: ghi, sửa ngay (người dùng chọn).

### L-19 · Thân nhân vật chính phồng / méo khi vươn vai (đứng yên lâu)

- Trạng thái: chờ thử máy · Mức độ: khó chịu (méo hình rõ, lặp mỗi 16 giây khi đứng) · Phần: xương Mixamo (`player/mixamoRig.ts`, trọng số da model Tripo) · Quy tắc: R-DIEU-8
- Báo: 2026-11-16 — "khi nhân vật dang tay thì bị phồng thân hình rất xấu" (ảnh người dùng: nhìn sau lưng, hai tay giơ ngang, thân / nách phình ra); xảy ra khi **vươn vai khi đứng lâu**
- Các bước: 1. Đứng yên > 6 giây 2. Nhân vật vươn vai (hai tay giơ cao)
- Mong đợi / thực tế: tay giơ lên, thân giữ dáng / thân và nách phồng ra theo tay
- Bằng chứng: ảnh người dùng gửi trong chat (2026-11-16); nghi nguyên nhân: Tripo cho đỉnh thân / vai bám xương `LeftArm` / `RightArm` (trọng số da), tay giơ cao kéo theo thân

**Sửa**
- Tái hiện: Canvas 3D `?dang=vuon` chụp sau lưng + chính diện — sườn dưới nách phình theo tay như cánh dơi (ảnh trước ở `design/screens/Loi-L19-vuon-vai.png`).
- Nguyên nhân (đo trọng số `nhan-vat.glb` ở tư thế gốc): ~400 đỉnh thân phía trong khớp vai (x 0,04…0,12, khớp `LeftArm` x 0,121) dưới vai tới ngực / sườn bám `LeftArm` (trung bình 0,1–0,3), thêm 144 đỉnh sườn bám `LeftForeArm` / `LeftHand` (tới 0,47) — tay giơ thì kéo sườn theo. `thu-thu`, `su-phu`, `tieu-mac` cùng kiểu (do Tripo tự gắn xương). Chọn hướng (a) sửa trọng số lúc nạp (đúng nguyên nhân, chung mọi model Tripo, không làm lại file); không cần (b) giảm biên độ vươn vai.
- Code: `web/src/player/mixamoRig.ts` — `chuyenTrongSoNach` (thuần) + `suaNach` gọi trong `mixamoRig()` lúc nạp: đỉnh "thuộc thân" (phía trong khớp vai theo x · thấp hơn khớp vai · xa trục cánh tay hơn cỡ ống tay áo `r` = trung vị khoảng cách của đỉnh bám chính cánh tay; mỗi điều kiện chuyển mềm qua dải 0,5 r / 0,6 r) chuyển phần trọng số xương tay (cánh tay, cẳng tay, bàn tay, ngón) sang `Spine2`, chuẩn hoá tổng = 1. Ống tay áo, đỉnh vai (trên khớp) giữ nguyên.
- Test: `web/src/player/mixamoRig.test.ts` — `'R-DIEU-8 (L-19): đỉnh thân cạnh nách bám tay → chuyển sang Spine2, tổng 1; ống tay áo và đỉnh vai giữ nguyên'`, `'R-DIEU-8 (L-19): đỉnh ở dải chuyển … chỉ chuyển một phần, tổng vẫn 1'` (lưới giả). Hình dạng khi biến dạng chỉ khoá bằng ảnh chụp (cần GPU).
- Ảnh: `design/screens/Loi-L19-vuon-vai.png` (sau lưng / chính diện, trước / sau) — sườn dưới nách hết phình, thân thẳng xuống đai; vai trên khớp vẫn tròn theo tay (cơ vai, cố ý). `design/screens/Loi-L19-soat-dang-khac.png` — vẫy tay, nhảy, thủ thư, sư phụ vươn vai: không rách, thân gọn hơn.
- Thử máy: `cd web && npm run build` → app → đứng yên > 6 s chờ vươn vai, xoay camera ra sau lưng + chính diện; thử vẫy tay, Vui mừng (nhảy mừng); đi gần thủ thư / sư phụ xem dáng NPC. Còn phình → chụp màn lúc tay giơ cao.

**Lịch sử**
- 2026-11-16: ghi, sửa ngay (người dùng chọn).

### L-17 · Cỏ mọc trên sàn gỗ tầng 1 trong trà lâu Phẩm Minh Các

- Trạng thái: mới · Mức độ: nhỏ (lệch hình, không ảnh hưởng điều khiển) · Phần: cỏ hoa có gió (`scene/coHoa.ts`) ↔ vùng loại trừ trong nhà (`rooms`) · Quy tắc: chưa có
- Báo: 2026-11-16 — subagent đặt tiểu nhị (V-84) thấy khi chụp; người dùng chọn ghi lỗi — "Cỏ (búi cỏ / lá) mọc trên sàn gỗ tầng 1 bên trong trà lâu Phẩm Minh Các… Đúng phải là: trong nhà không có cỏ."
- Các bước: 1. Khởi Nguyên Trấn, vào trà lâu Phẩm Minh Các tầng 1 2. Đứng trước quầy trà nhìn vào trong
- Mong đợi / thực tế: sàn gỗ trong nhà không có cỏ / vài búi cỏ, lá mọc xuyên sàn gỗ
- Bằng chứng: `design/screens/Canh-tieu-nhi-noi-chuyen.png` (Canvas 3D, chụp headless); có từ trước việc đặt tiểu nhị

**Sửa**

**Lịch sử**
- 2026-11-16: ghi.

### L-15 · `viec.dart gop` thay cả chữ mẫu `L-?1`, `L-?2` ở đầu docs/loi.md bằng số thật

- Trạng thái: xong · Mức độ: nhỏ (công cụ; lần gộp sau cấp nhầm số, lệch đánh số) · Phần: `tool/viec.dart` (hàm cấp mã, dòng ~77) · Quy tắc: chưa có
- Báo: 2026-11-16 — phiên điều phối /task thấy khi gộp V-78
- Các bước: 1. Một nhánh việc sửa `docs/loi.md` (bất kỳ) 2. `dart tool/viec.dart gop`
- Mong đợi / thực tế: chỉ cấp số cho mã tạm trong mục lỗi mới / dòng hướng dẫn "ghi tạm `L-?1`, `L-?2`…" bị đổi thành "`L-14`, `L-15`…" (in "L-?1 → L-14, L-?2 → L-15" dù việc không có lỗi mới)
- Bằng chứng: commit dc62fb2 (đã trả dòng hướng dẫn về tay)

**Sửa**
- Nguyên nhân: `assignBugIds` gom **mọi** chuỗi `L-?n` trong cả nội dung các file nhánh đã đổi (kể cả dòng cũ của main
  như hướng dẫn đầu sổ, chú thích tool / skill) rồi thay hết → nhánh nào chạm `docs/loi.md` cũng "cấp" số cho chữ mẫu.
  Thêm nữa thứ tự xếp theo chữ (`L-?10` trước `L-?2`).
- Code: `tool/viec.dart` — chỉ cấp số cho mã có tiêu đề mục lỗi `### L-?n ·` nằm ở dòng nhánh thêm (`git diff -U0
  main...HEAD`); chỉ thay ở các dòng nhánh thêm / sửa; bỏ qua dòng chữ mẫu kiểu "ghi tạm `L-?1`" / "mã tạm `L-?1`" dù nhánh sửa dòng đó; không có
  mục lỗi mới → không cấp, không commit. Đánh số theo thứ tự số. Phần thuần tách thành hàm (`addedLineNumbers`,
  `tempIdsWithHeading`, `numberTempIds`, `replaceTempIds`).
- Test: `tool/` chưa có chỗ test → bài kiểm chạy tay (2026-11-16, 14/14 đạt): script Dart import `viec.dart`, kiểm các
  hàm thuần (hunk `-U0`, thứ tự số, CRLF, giữ dòng mẫu) + chạy thật `assignBugIds` trong repo git tạm: nhánh chỉ sửa sổ
  không có lỗi mới → 0 mã, hướng dẫn giữ nguyên; nhánh thêm `### L-?2`, `### L-?1` + tham chiếu ở file `.ts` và sửa
  dòng hướng dẫn → cấp L-15, L-16 ở tiêu đề + tham chiếu, dòng hướng dẫn và chú thích cũ giữ `L-?1`, commit
  `chore: cấp mã lỗi L-15, L-16`.
- Thử máy: không cần (công cụ); lần `viec.dart gop` tới của một nhánh không có lỗi mới phải in "không có mã tạm".

**Lịch sử**
- 2026-11-16: ghi.
- 2026-11-16: sửa (V-20261116-80), bài kiểm chạy tay đạt.

### L-14 · `tool/guard.dart` báo "tsc (web/) chưa cài node_modules" khi chạy trong worktree

- Trạng thái: xong · Mức độ: nhỏ (công cụ; chốt chặn báo đỏ sai trong mọi worktree) · Phần: `tool/guard.dart` · Quy tắc: chưa có
- Báo: 2026-11-16 — subagent V-78 và V-79 cùng gặp
- Các bước: 1. Trong `.claude/worktrees/<việc>` chạy `dart tool/viec.dart chuan-bi` 2. `dart tool/guard.dart`
- Mong đợi / thực tế: tsc chạy và qua (như `npx tsc --noEmit`) / guard tìm cứng `web/node_modules/typescript/bin/tsc`, gói lại nằm ở `.claude/worktrees/node_modules` → báo thiếu
- Hướng sửa: tìm `typescript` ngược lên các thư mục cha như Node (giống `npmDirs()` trong `web/vite.config.ts` của L-12)

**Sửa**
- Nguyên nhân: guard chỉ xét `web/node_modules/typescript/bin/tsc`; worktree không có `web/node_modules` (Node tự tìm
  ngược lên `.claude/worktrees/node_modules`, guard thì không).
- Code: `tool/guard.dart` — hàm `findUp(dir, rel)` tìm `node_modules/typescript/bin/tsc` từ `web/` ngược lên các thư
  mục cha, chạy `node <đường dẫn tuyệt đối>`.
- Test: `tool/` chưa có chỗ test → kiểm tay trong worktree `sua-cong-cu` (không có `web/node_modules`, 2026-11-16):
  thêm tạm `web/src/__l14.ts` có lỗi kiểu → guard in `error TS2322` (trước: "chưa cài node_modules"), thoát 1; bỏ file,
  chạm `web/src/main.ts` không lỗi → guard im, thoát 0.
- Thử máy: không cần (công cụ).

**Lịch sử**
- 2026-11-16: ghi từ báo cáo V-78 / V-79.
- 2026-11-16: sửa (V-20261116-80), kiểm tay đạt.

### L-13 · Bộ quét mặt trùng (zfight) coi InstancedMesh là khối đặc → che mất ~18 chỗ chớp thật ở trấn

- Trạng thái: xong (bộ quét; các chỗ chớp thật còn mở — xem Sửa) · Mức độ: nhỏ (công cụ kiểm; mặt chớp thật có thể lộ khi chơi) · Phần: `web/src/scene/zfightScan.ts`, cảnh trấn · Quy tắc: chưa có
- Báo: 2026-11-15 — subagent V-20261114-58 phát hiện khi chạy `ZFIGHT=1`
- Các bước: 1. `ZFIGHT=1 npm test` (quét đầy đủ tông môn) 2. Sửa bộ quét bỏ qua InstancedMesh khi lấy khung bao
- Mong đợi / thực tế: quét ra đúng các mặt trùng / `Box3.setFromObject` gộp khung bao mọi cây thành một khối phủ cả trấn → báo sai, che 18–19 chỗ thật
- Bằng chứng: các chỗ — khối 48×48 lục cạnh địa hình quanh (−2,5; −35,7); khung gỗ `#8a5a3c` trùng nan `#3a2418` quanh (−7,9; 30); mặt tròn có texture trùng địa hình quanh (9,7; −10,5)

**Sửa**
- Nguyên nhân: khối che (`solids`, để bỏ mặt bị khối khác che) lấy khung bao bằng `Box3.setFromObject` — với
  InstancedMesh hàm này dùng khung bao gộp mọi bản sao (vd. thân cây `cay_moi.ts` là InstancedMesh trụ) → một hộp
  phủ cả vùng cây, mặt chớp nào nằm trong hộp đó bị coi là "bị che"; với khối có vật con, khung bao gộp cả con.
- Code: `web/src/scene/zfightScan.ts` — khung bao lấy từ hình của khối × `matrixWorld`; InstancedMesh: mỗi bản sao
  một khung bao (`getMatrixAt`).
- Test: `web/src/scene/zfightScan.test.ts` — `'(L-13): khoảng trống giữa các cây InstancedMesh không bị coi là khối
  đặc …'`, `'(L-13): khung bao một khối đặc không gộp khung bao vật con của nó'` (đỏ trước, xanh sau) +
  `'(L-13): chỗ chớp nằm trong một cây InstancedMesh thật thì vẫn bị che'` (giữ đúng phần che thật).
- Quét đủ (`ZFIGHT=1 npx vitest run src/scene/zfightRegions.test.ts`, 2026-11-16, trên main e1e9c22): **trước và sau
  khi sửa ra cùng một danh sách** — 37 chỗ ở 4 cảnh (trên main hiện tại không InstancedMesh nào đang che chỗ chớp; các
  chỗ ghi ở Bằng chứng đã lộ sẵn). Bộ quét giờ không che sai nữa nếu cây được đặt lại. Chỗ chớp thật (chưa sửa cảnh —
  việc riêng, thuộc L-10):
  - tong-mon (19): địa hình khối 48×48 (lục `0.19–0.20,0.31,0.10`) × địa hình 97,6×159,5 (xám đá) tại (22,7; 0; −24,3)
    và (−2,7…1,3; 5,5; −35,7); khung gỗ `#8a5a3c` (hộp 2,6×1,44×0,08) × nan `#3a2418` (0,05×1,44×0,12 và 2,6×0,05×0,12)
    quanh (−7,9; 4,9–6,3; 29,1–30,9) — 7 chỗ; mặt tròn có ảnh (Circle 1,4) × địa hình đá quanh (9,7–11,3; 2,5–3,9; −10,0…−11,0) — 8 chỗ.
  - nha-ta-trong (4): xà `#5a4030` (0,1×0,24×9,32 và 13,52×0,24×0,1) × cột trụ `#3a3430` tại (±6,7; 4; −2,4 / 2,4) và (0,1; 4; −4,7).
  - nha-ta (4): tấm `#efe4c8` (3,2×1,2×0,08) × nan `#3a3430` (0,05×1,2×0,12) tại (−18,5 / −19,3 / −11,5 / −12,3; 2; −5,15).
  - rung-truc (10): mặt `#9d9686` (4,4×0,12×3,64) × khối `#8f8b80` (0,3×0,63×3,64) quanh (24,7–29,3; 0,4–0,8; 1,8 và 6,2) — 8 chỗ;
    `#3a3f3a` (0,26×0,06×0,21) × `#c8b27a` (1,15×0,008×0,11) tại (−7,5; 0,56; −5,0); que `#6b4a2e` (0,03×0,46×0,03) × tấm `#f3e9d2` (0,4×0,04×0,4) tại (−32,0; 0,97; 28,7).
- Thử máy: không cần (công cụ kiểm chạy trong test).

**Lịch sử**
- 2026-11-15: ghi từ báo cáo V-58.
- 2026-11-16: V-78 sửa bộ quét; quét đủ liệt kê 37 chỗ thật ở 4 cảnh (chưa dập).

### L-12 · Tiêu đề "Ngồi ôn" trên cuộn sách 3D bị tách dấu ("Ngô`i ôn")

- Trạng thái: chờ thử máy · Mức độ: nhỏ (chữ vẫn đọc được, chỉ xấu) · Phần: cuộn sách Ngồi ôn (`web/src/ui/cuonMucPaint.ts`, font Lora vẽ canvas) · Quy tắc: R-ON-8, R-HUD-4
- Báo: 2026-11-15 — subagent V-20261114-43 thấy trong ảnh chụp (trước và sau khi sửa cuộn), người dùng chưa báo
- Các bước: 1. Ngồi bồ đoàn tầng 2 Tàng Thư Các (hoặc Ngồi ôn) 2. Nhìn tiêu đề cuộn
- Mong đợi / thực tế: "Ngồi ôn" dấu huyền nằm trên chữ "ô" / dấu tách ra thành "Ngô`i"
- Bằng chứng: `C:/Users/admin/AppData/Local/Temp/claude/651327167d39025b/51df7f0c-c8dd-448d-8a23-6df66204bf24/scratchpad/cuon-ngoi-to/sau-tuhoc-ngang_.png` (Chrome headless); chưa kiểm máy thật

**Sửa**
- Nguyên nhân: không phải app. Chuỗi `CUON_TITLE` là NFC; Lora 700 đóng gói có mảnh vietnamese (`style.css`); `loadCuonFonts()`
  chờ `document.fonts.load` rồi vẽ lại giấy. Ảnh V-43 chụp từ `npm run dev` **trong worktree**: gói npm nối ra
  `web/node_modules` của thư mục chính (ngoài `web/` của worktree) → Vite dev chặn file font ("outside of Vite serving
  allow list") → Lora / Be Vietnam Pro không nạp, canvas vẽ bằng Georgia (Windows) — Georgia thiếu "ồ", "ề", "ắ"… dựng
  sẵn nên trình duyệt ghép "ô" + dấu huyền rời → "Ngô`i ôn". Bản build (`app/assets/scene/`) có đủ font, vẽ đúng.
- Test: `web/viteConfig.test.ts` — `'(L-12): file font Lora / Be Vietnam Pro (đường dẫn thật, như Vite tìm) nằm trong
  server.fs.allow'` (đỏ trong worktree trước khi sửa). Ảnh mẫu trước / sau (Chrome headless, dev trong worktree): chữ
  canvas Lora "Ngô`i ôn", "ă´ ê`" → "Ngồi ôn", "ắ ề".
- Code: `web/vite.config.ts` — `npmDirs()` thêm thư mục gói npm thật vào `server.fs.allow`; `web/src/node-fs.d.ts` thêm kiểu.
- Thử máy: `npm run dev` trong một worktree → Ngồi ôn → tiêu đề cuộn "Ngồi ôn" dấu huyền nằm trên "ô"; máy thật (bản
  build) xem lại một lần. Còn lỗi → gửi ảnh + log `chrome://inspect` (tab Network, lọc woff2).

**Lịch sử**
- 2026-11-15: ghi từ báo cáo V-43.
- 2026-11-16: V-79 sửa — Vite dev trong worktree chặn font @fontsource (không phải lỗi app).

### L-10 · Bề mặt chớp sáng liên tục (sàn tầng 2 trong nhà, cổng mái ngói)

- Trạng thái: chờ thử máy (đợt 2: các vùng) · Mức độ: khó chịu (chớp liên tục trên mặt sàn / cổng khi camera di chuyển, khó chịu mắt) · Phần:
  kiến trúc — `scene/kien_truc/tuong.ts` (cổng `lau`), `lau_sach.ts` (hiên lửng), `mai.ts` / `hinh.ts` · Quy tắc: chưa có
- Báo: 2026-11-14 — "đôi khi ở các đồ họa như sàn hoặc cổng lại xuất hiện những chớp sáng liên tục trên bề mặt"
- Các bước: 1. Trình duyệt máy tính. 2. Đứng trong nhà / lên tầng 2 (Thư viện), hoặc nhìn cổng "Bậc lên Trà lâu" (cổng
  bắc, mái ngói) từ trong sân. 3. Xoay / di chuyển camera.
- Mong đợi / thực tế: bề mặt đứng yên một màu / mặt sàn và cạnh trong khung cửa chớp sọc hai màu (z-fighting: hai mặt
  khác màu nằm trùng một mặt phẳng).
- Bằng chứng: ảnh người dùng (cổng bắc — cạnh trong khung cửa phải có vệt sọc sáng); ảnh L-6 lần 3 (sàn tầng 2 Thư viện
  có vệt sọc mảnh). Chạy trên trình duyệt máy tính.

**Sửa**
- Nguyên nhân (quét hình học các khối trong nhà + tường): (1) Tàng Thư Các — hiên lửng tầng 1 (`skirt`, chóp cụt có nắp
  trên) cao đúng tới mặt sàn tầng 2: nắp 18,2 × 9,2 m màu ngói nằm trùng mặt sàn gỗ (y = 6,26) gần như cả sàn. (2) Cổng
  `lau` (門樓): trụ khung gỗ áp mặt trong trụ vôi đúng mép lối đi (x = ±2,9) — hai mặt trùng; xà ngang trên lối có mặt dưới
  trùng mặt dưới mảng tường trên cửa (y = 3,2).
- Test: `web/src/scene/zfight.test.ts` — quét mặt các khối hộp tìm cặp cùng mặt phẳng khác vật liệu:
  `'(L-10): cổng mái ngói — khung gỗ (trụ, xà) không nằm trùng mặt tường vôi của cổng'` (đỏ: 12 cặp → xanh),
  `'(L-10): Tàng Thư Các — hiên lửng tầng 1 thấp hơn mặt sàn tầng 2'` (đỏ: đỉnh hiên 6,26 = mặt sàn → xanh). Toàn bộ 205 test
  web xanh. Chớp thật chỉ thấy khi camera chuyển động trên GPU thật — ảnh tĩnh không bắt được, nên khoá bằng hình học.
- Code: `kien_truc/tuong.ts` (`PROUD` 3 cm: trụ khung gỗ nhô vào lối, xà ngang thò xuống dưới mảng tường, dải xà dưới mái
  hạ dưới đỉnh trụ), `kien_truc/lau_sach.ts` (hiên lửng cao 0,9 → 0,86: nắp thấp hơn sàn tầng 2 4 cm). Đã `npm run build`.
  Trà lâu: hiên lửng đỉnh ở mặt dưới sàn (ngược chiều) — không chớp, không đổi.
- Thử máy: trình duyệt máy tính — (1) đứng trong sân nhìn cổng bắc "Bậc lên Trà lâu" / cổng nam, xoay camera: cạnh trong
  khung cửa và mặt dưới xà không chớp; (2) lên tầng 2 Thư viện, đi quanh, xoay camera: mặt sàn không chớp sọc. Còn chớp ở
  chỗ khác → chụp màn (hoặc quay) gửi, ghi đứng ở đâu.

- **Đợt 2 (2026-11-14, người dùng chọn "sửa tận gốc từng chỗ")** — dò cả cảnh: `web/src/scene/zfightScan.ts` so mặt phẳng
  từng tam giác (tắt gộp khối), tính cả hai khối **cùng ảnh** (vôi, gạch, đá — UV lệch nhau nên vẫn lấm tấm), bỏ mặt bị khối
  khác che, khối vô hình, vật liệu có polygonOffset. Sau lọc còn ~200 chỗ thấy được; nguyên nhân + sửa:
  - Cửa bức bàn (`kien_truc/chi_tiet.ts` `addDoors`, mọi điện / nhà ở Tử Cấm Thành, Bồng Lai, tông môn): chân cửa gỗ rộng đúng
    bằng tấm vôi (mặt đầu trùng), song gỗ có mặt sau trùng mặt sau tấm → chân cửa thò vào cột 1 cm, song lệch ra trước 1 cm.
  - Góc tường (`walls.ts` gạch — Tử Cấm Thành, Con đường tơ lụa; `kien_truc/tuong.ts` vôi — Giang Nam): hai đoạn kéo dài nửa bề
    dày, chồng nhau ở góc → mặt ngoài trùng → đoạn trục x dài thêm, trục z ngắn lại `CORNER_EPS` 5 mm mỗi đầu (vật cản giữ nguyên);
    chân đá xếp dài hơn thân vôi 5 mm mỗi đầu.
  - Cuộn lụa trên sạp (`vat_sa_mac.ts`, ảnh 5): 3 cuộn cùng trục, cùng bán kính, nối đuôi lồng nhau → xếp cạnh nhau.
  - Cổng chào (`gate.ts`): mặt trên xà trên trùng đỉnh cột giữa → hạ xà 1 cm.
  - Lan can thang (`kien_truc/cau_thang.ts`): cột 0,1 áp sát tường thành / đáy trùng đáy bậc → cột 0,096, nhấc 2 mm.
- Test đợt 2: `web/src/scene/zfightRegions.test.ts` — `'(L-10): <cảnh> — không có mặt trùng khác màu'` (đỏ trước khi sửa:
  bong-lai 49, to-lua 19, tu-cam-thanh 129, giang-nam 5 … → 0 cả 7 cảnh). Mặc định chạy to-lua + bong-lai (≈ 3 s mỗi cảnh);
  cả 7 cảnh: `ZFIGHT=1 npx vitest run src/scene/zfightRegions.test.ts` (≈ 2 phút). 208 test web xanh. Đã `npm run build`.
- Chưa khoá được bằng test: ảnh 4 (chân cầu đá trên hồ Giang Nam) và ảnh 1 (góc tường nhà 2 tầng Giang Nam) — máy dò không thấy
  mặt trùng ở đó sau khi sửa; nếu còn chớp có thể là hai mặt **gần** trùng (lệch vài mm) hoặc ảnh lấm tấm của vôi → cần ảnh /
  vị trí đứng để xem tiếp.
- Thử máy đợt 2 (trình duyệt): Tử Cấm Thành — nhìn gần cửa các điện + góc tường thành, thang lên tường; Con đường tơ lụa —
  sạp lều vải (cuộn lụa), góc tường; Giang Nam — cổng chào, chân tường vôi, chân cầu; Bồng Lai — cửa Tàng Thư Các, lan can
  thang. Xoay / đi quanh camera: không còn vệt chớp. Còn chỗ chớp → ảnh + đứng ở đâu (vùng, gần vật gì).

**Lịch sử**
- 2026-11-14: ghi, sửa luôn → chờ thử máy.
- 2026-11-14: thử máy trình duyệt đạt (người dùng `/loi xong L-10`) → xong.
- 2026-11-14: **tái phát ở các vùng** (mở lại) — "hiện nay có 1 số lỗi hiện tượng chớp ở các kiến trúc ở 1 số map như
  giang nam (chân cầu, chân cổng,..), tử cấm thành, mở rộng tôi sẽ gửi ảnh". Trình duyệt máy tính; 5 ảnh: nhà 2 tầng
  Giang Nam (góc tường dưới mái), chân tường / chân cổng đỏ Tử Cấm Thành, chân cầu đá trên hồ, cuộn vải trên sạp (Con
  đường tơ lụa). Dò cả cảnh bằng `web/src/scene/zfightScan.ts` + `zfightRegions.test.ts` (chạy riêng:
  `ZFIGHT=1 npx vitest run src/scene/zfightRegions.test.ts`, tắt gộp khối): tong-mon 259 · bong-lai 164 · giang-nam 137 ·
  rung-truc 27 · to-lua 23 · truong-thanh 13 · tu-cam-thanh 380 chỗ (~195 cặp khối, ~10–15 file dựng). Nhiều nhất: song
  gỗ cửa trên tường đỏ (điện Tử Cấm Thành), cột / khung sẫm chìm trong tường vôi (Giang Nam), kệ trong nhà (0,6×2,4 × nẹp
  gỗ), đài tròn tông môn (mặt nắp trùng mặt bậc), cuộn vải đồng trục cùng bán kính (sạp tơ lụa).
- 2026-11-14: lọc mặt bị che / vô hình / có polygonOffset → còn thật ~200; sửa 5 chỗ dựng (xem Đợt 2) → 0 cả 7 cảnh, chờ thử máy.


### L-11 · Nhãn tên người chơi nổi đè lên bản đồ truyền tống

- Trạng thái: chờ thử máy · Mức độ: nhỏ (nhãn che một phần chữ trên bản đồ) · Phần: HUD — `web/src/ui/hud.ts`
  (`NameTag`), `web/src/main.ts` · Quy tắc: R-HANH-2 (bản đồ mở: nhân vật đứng yên, HUD điều khiển ẩn)
- Báo: 2026-11-14 — "tên người dùng đang bị nổi lên trên cả bản đồ" (ảnh: pill "Tuấn Anh" đè chữ 長城 Trường Thành)
- Các bước: 1. Vào vòng trận Truyền Tống Đài, đứng 1,2 s. 2. Bản đồ mở.
- Mong đợi / thực tế: bản đồ phủ, không có nhãn tên / pill "Tuấn Anh" nằm trên giấy bản đồ.
- Nguyên nhân: nhãn tên là lớp HTML (z-index 4) trên canvas 3D; cuộn bản đồ là vật 3D nên luôn nằm dưới nhãn. `main.ts`
  chỉ ẩn nhãn khi chữ nhập định hiện.
- Sửa: ẩn nhãn tên khi bản đồ mở, màn tải đang hiện, hoặc màn bài học che cảnh (`main.ts`, `nameTag.setVisible`).
  Không có test (vòng lặp khung hình trong `main.ts` — kiểm bằng thử tay).

### L-9 · Để yên chuột trên cảnh thì con trỏ hoạt hình thỉnh thoảng thành chuột máy tính

- Trạng thái: chờ thử máy · Mức độ: nhỏ (chỉ đổi hình con trỏ, vẫn dùng bình thường; di chuột là trở lại) · Phần: HUD /
  con trỏ chuột — `web/src/style.css` (`cursor: url(./cursor/*.svg)`) · Quy tắc: chưa có
- Báo: 2026-11-14 — "bây giờ có 1 vài lúc đôi khi để yên thì chuột lại quay về chuột máy tính sau đó di chuyển thì lại
  trở về chuột hoạt hình"
- Các bước: 1. `npm run dev`, mở trên trình duyệt máy tính. 2. Để chuột đứng yên trên cảnh 3D (không trên nút), chờ.
- Mong đợi / thực tế: con trỏ luôn là mũi tên ngọc lục / thỉnh thoảng thành mũi tên mặc định của máy, di chuột thì trở lại.
- Bằng chứng: chưa có (trình duyệt, `npm run dev`, chuột trên cảnh 3D).

**Sửa**
- Nguyên nhân: con trỏ trỏ tới file ảnh riêng (`url(./cursor/tro.svg)`). Bản dev phục vụ file với `Cache-Control:
  no-cache`, bản build cũng để file riêng (`assetsInlineLimit: 0`) → trình duyệt có lúc phải hỏi lại máy chủ. Để yên
  chuột mà DOM dưới chuột đổi (bong bóng thoại, nhãn tên, NPC nói trên kênh chung…) thì Chrome tính lại con trỏ; ảnh
  chưa sẵn → dùng con trỏ dự phòng `default` và giữ tới lần di chuột kế tiếp.
- Test: `web/src/ui/cursor.test.ts` — `'(L-9): style.css không trỏ con trỏ tới file ảnh riêng …'` (đỏ trước khi sửa),
  `'(L-9): con trỏ là data URI nhúng sẵn …'`. Hiện tượng trên màn (con trỏ đổi khi để yên) chưa khoá được bằng test —
  headless không vẽ con trỏ; đã kiểm `getComputedStyle(...).cursor` = `url("data:image/svg+xml,…")`.
- Code: `web/src/ui/cursor.ts` (`installCursors` → biến `--cur`, `--cur-btn` từ `src/cursor/*.svg?raw`), gọi đầu
  `web/src/main.ts`; `web/src/style.css` dùng `cursor:var(--cur,default)` / `var(--cur-btn,pointer)`;
  `web/src/node-fs.d.ts` (kiểu `readFileSync` cho test). Đã `npm run build`.
- Thử máy: `npm run dev` (tải lại trang, Ctrl+F5), để chuột yên trên cảnh 2–3 phút (gần Tiểu Mặc để có bong bóng hiện /
  mất) → con trỏ luôn là mũi tên ngọc lục. Còn lỗi → quay màn hình lúc con trỏ đổi.
- Commit: chưa (chưa được bảo).

**Lịch sử**
- 2026-11-14: ghi lỗi, sửa luôn (người dùng chọn) → nhúng con trỏ thành data URI, chờ thử máy.

### L-8 · Bàn ngồi ở các nơi nhỏ hẹp: bàn ghế nhỏ so người, ngồi sát nhau, camera khi ngồi chật

- Trạng thái: chờ thử máy · Mức độ: khó chịu (trông như đồ chơi, ngồi chen chúc, nhìn chật chội) · Phần: nội thất + chỗ ngồi —
  `scene/kien_truc/{tra_lau,lau_sach,noi_that}.ts`, `scene/gameTable.ts`, `scene/seat.ts` · Quy tắc: R-VA-4, R-GIAO-1, R-NGOI-1
- Báo: 2026-11-13 — "bàn ngồi ở các nới đang hơi nhỏ hẹp"
- Các bước: 1. Vào trà lâu / Tàng Thư Các tầng 2 / Kỳ Văn Uyển. 2. Đứng cạnh hoặc ngồi vào bàn.
- Mong đợi / thực tế: bàn ghế vừa tầm người, chỗ ngồi thoáng, camera khi ngồi thấy rõ / bàn ghế nhỏ so nhân vật, ngồi
  sát nhau, camera khi ngồi chật. Cả ba nơi (người dùng chọn "tất cả các nơi").
- Bằng chứng: chưa có

**Sửa**
- Nguyên nhân: nhân vật chibi cao 2,1 m nhưng bàn ghế làm theo cỡ người thật ~1,65 m (bàn thấp 0,35–0,4, bồ đoàn ∅ ~0,65,
  ghế cách tâm bàn 0,6–0,8, hai ghế cạnh nhau 1,0–1,2); ngồi xuống camera giữ góc đứng (4,2 m, ngang, ngắm cao 1,2 m).
- Test: `scene/gameTable.test.ts` `'R-GIAO-1 (L-8): …'` (toạ độ ghế thật), `input/orbitCamera.test.ts` `'R-NGOI-1 (L-8): …'`
  (camera ngồi); cập nhật số trong `gamePlay.test.ts`, `zones/seats.test.ts`, `traLau.test.ts`. vitest 145/145.
- Code: kế hoạch `docs/tasks/2026-11-13-ban-ghe-rong-hon.md` — `kien_truc/{do_pho,tra_lau,lau_sach}.ts`, `gameTable.ts`,
  `spec.ts` (GAME_SLOT 2,5, `camera.seated`), `input/orbitCamera.ts` (`sit`), `main.ts`.
- Thử máy: 1. Trà lâu tầng 1 + tầng 2, Tàng Thư Các tầng 2, Kỳ Văn Uyển: bàn ghế vừa tầm nhân vật, ngồi không chen
  nhau. 2. Bấm "Ngồi" ở án thư / bàn trà → camera lùi ra, chúc xuống thấy cả bàn; đi → camera về như cũ. 3. Đi quanh
  bàn tầng 2 trà lâu, lối phía đông → không vướng. Còn lỗi: ảnh chụp chỗ chật.
- Commit: …

**Lịch sử**
- 2026-11-13: ghi; người dùng chọn ghi rồi sửa luôn.
- 2026-11-13: duyệt ×1,3, camera ngồi "lùi xa + hơi chúc", làm cả 3 nơi; Kỳ Văn Uyển dọc bàn 2,5 (biển tên). Sửa xong, build.

### L-7 · Quay đầu đi về phía camera thì chỉ thấy mặt nhân vật, không thấy phía trước

- Trạng thái: chờ thử máy · Mức độ: khó chịu (điều khiển / tầm nhìn sai, không thấy đường đi) · Phần: điều khiển + camera —
  `input/orbitCamera.ts`, `main.ts` · Quy tắc: R-DIEU-3
- Báo: 2026-11-13 — "hiện nay cảm giác camera đang chưa xoay đúng ý đảm bảo tầm nhìn khi người dùng di chuyển, đặc biệt là
  khi quay lại thì lại chỉ thấy mặt nhân vật đi lên chứ không thấy những gì nhân vật đang nhìn thấy"
- Các bước: 1. Đi tới một đoạn. 2. Kéo joystick xuống (quay đầu, đi về phía camera) và giữ.
- Mong đợi / thực tế: camera vòng ra sau lưng, thấy phía trước nhân vật / camera đứng yên, chỉ thấy mặt nhân vật đi tới.
- Bằng chứng: chưa có

**Sửa**
- Nguyên nhân: R-DIEU-3 cũ cố ý không tự xoay khi hướng đi lệch hướng nhìn ≥ 120°, vì hướng joystick tính theo camera
  từng khung hình — camera mà xoay thì "xuống" đổi nghĩa, nhân vật đi vòng. Đổi luật: khoá hướng đi khi giữ joystick
  cùng hướng, nên camera xoay ra sau lưng cả khi đi về phía camera.
- Test: `web/src/input/orbitCamera.test.ts` — `'R-DIEU-3 (L-7): giữ joystick xuống (đi về phía camera) → đi thẳng, camera
  vòng ra sau lưng trong ~1,5 s'` (+ 5 test R-DIEU-3: đi ngang, thả tay bấm lại, đổi hướng ≥ 45°, kéo tay khi đi, chờ 1,5 s).
  Đỏ trước khi sửa, xanh sau (vitest 128/128).
- Code: `orbitCamera.ts` — thêm `steerYaw(ix, iy)` (khoá hướng đi; thả tay / đổi hướng ≥ 45° → theo camera; kéo tay → xoay
  theo), bỏ ngưỡng 120°, lệch càng nhiều xoay càng nhanh (180° → gấp ba). `main.ts` — controller nhận `orbit.steerYaw(…)`
  thay cho `orbit.yaw`. Cảm giác (tốc độ xoay, ngưỡng 45°) chỉ thử máy mới chốt được.
- Thử máy: 0. Đi vòng, rẽ trái / phải → camera xoay êm, không chóng mặt; dừng → camera hãm lại, đứng yên, không tự xoay
  về chính diện. 1. Đi tới vài bước. 2. Kéo joystick xuống và giữ → nhân vật đi thẳng (không vòng), camera vòng êm ra sau
  lưng trong ~3 s, thấy phía trước. 3. Vẫn giữ → đi tiếp đúng hướng. 4. Thả, đẩy lên → đi tới theo camera mới. 5. Đang đi
  dùng ngón kia kéo xoay camera → hướng đi xoay theo. Còn lỗi: quay màn / mô tả lúc nào thấy khó chịu.
- Commit: …

**Lịch sử**
- 2026-11-13: ghi; người dùng chọn "khoá hướng + xoay ra sau".
- 2026-11-13: sửa xong, build; R-DIEU-3 sửa trong sổ, **chưa chép lên tài liệu xác nhận online** (phiên VS Code không có
  công cụ Claude Docs).
- 2026-11-13: thử máy — "camera vẫn bị lệch góc nhìn từ mắt nhân vật": đổi trái / phải rồi dừng thì camera đứng chéo sau
  vai (có ảnh). Nguyên nhân: xoay theo hàm mũ nên càng gần càng chậm, bám theo quãng vừa đi (không theo hướng quay mặt),
  dừng là thôi xoay. Sửa: bám hướng quay mặt bằng lò xo giảm chấn (`AUTO_SMOOTH` 0,22 s → rẽ / quay đầu ~0,8 s lệch
  < 3°), dừng thì xoay nốt 0,8 s; `follow(dt, facing, moving)`. Thêm 3 test (trái/phải liên tục, dừng xoay nốt, kéo tay
  rồi đứng). R-DIEU-3 sửa lần 2 — cần chép lại lên tài liệu online.
- 2026-11-13: thử máy — "nhanh chóng mặt", nhờ bắt chước game cùng thể loại. Làm lại theo kiểu Zelda / Genshin / Mario
  (Cinemachine "recentering"): **dây kéo** (`LEASH` 0,6 — đi ngang thì camera bị kéo vòng theo) + **tự về sau lưng
  chậm** (lò xo `AUTO_SMOOTH` 0,5 s, tối đa 75°/s, gia tốc 200°/s² nên bắt đầu êm) + tổng xoay ≤ 90°/s; dừng thì xoay
  nốt 1,5 s. Rẽ 90° ~2 s, quay đầu ~3 s. `follow(dt, dx, dz, facing, moving)`. 10 test (có kiểm tốc độ xoay ≤ 90°/s,
  0,3 s đầu rẽ < 20°). R-DIEU-3 sửa lần 3.
- 2026-11-13: thử máy — "vẫn còn chóng mặt ở chỗ sau khi nhân vật đứng lại thì camera tự xoay về chính diện". Bỏ xoay
  nốt khi dừng: dừng thì hãm (`AUTO_BRAKE` 400°/s², ~0,2 s) rồi đứng yên, đứng yên không tự xoay (như game cùng thể
  loại). R-DIEU-3 sửa lần 4.

### L-6 · Cầu thang trà lâu + Tàng Thư Các khó đi, đi lên bị che khuất

- Trạng thái: chờ thử máy · Mức độ: khó chịu (lên tầng 2 vất vả, camera bị che) · Phần: nhà vào được — `scene/kien_truc/cau_thang.ts`,
  `lau_sach.ts`, `tra_lau.ts` · Quy tắc: R-VA-3 (+ R-DIEU-4 camera)
- Báo: 2026-11-13 — "cầu thang hiện nay đang rất khó đi ở cả trà lâu và tàng thư các khi hướng lên lại bị che đi đổi
  phong cách khác"
- Các bước: 1. Vào Tàng Thư Các (−39; −34) hoặc trà lâu Phẩm Minh Các (0; −64). 2. Đi lên cầu thang gian phải.
- Mong đợi / thực tế: lên tầng 2 dễ, nhìn rõ / thang gấp khúc hai vế trong gian hẹp ~3 m có tường: khó lái, quay đầu ở
  chiếu nghỉ, camera sau lưng bị tường + sàn tầng 2 che.
- Bằng chứng: lời người dùng; chưa có ảnh.
- Hướng sửa (Claude chọn — người dùng "tiếp tục làm"): thang **thẳng một vế ngoài trời** dọc đầu hồi phải, chiếu nghỉ +
  cầu nối vào sàn tầng 2.

**Sửa**
- Nguyên nhân: thang gấp khúc hai vế (mỗi vế 1,5 m) trong gian hồi kín tường: phải quay đầu 180° ở chiếu nghỉ; camera sau
  lưng nằm trong gian ~3 m bị tường (vật cản che tầm nhìn, R-DIEU-4) và sàn tầng 2 ép sát / che.
- Test: `web/src/lauSach.test.ts`, `web/src/traLau.test.ts` — `'R-VA-3 (L-6): thang thẳng một vế ngoài trời…'`, `'R-VA-3 (L-6):
  đang trên thang đi ngang → lan can hai bên chặn…'`, `'R-VA-3 (L-6): dưới đất không lọt vào gầm thang…'` + leo lên / xuống,
  mép hồi chỉ hở chỗ cầu nối (17 test, xanh). Camera thoáng: chưa khoá được bằng test (cần thử máy).
- Code: `scene/kien_truc/cau_thang.ts` viết lại (`stairLayout` thang thẳng ngoài trời rộng 1,8 m, dốc 30°, chiếu nghỉ + cầu
  nối; `gapForBridge` mở đầu tường cho cầu nối), `lau_sach.ts` (`lauSachStairs`, sàn tầng 2 liền, kệ tầng 1 hết bị gian
  thang cắt), `tra_lau.ts` (tầng 1 lại 3 bàn trà). Luật R-VA-3 sửa (sổ + online, `--mark-synced`). Cảnh: hồ phải Tàng Thư Các
  (−30; −25) rộng 7 → (−31,5; −25) rộng 5 (hồ trái đối xứng −46,5), tùng (−24; −31) → (−22; −31) — không chắn thang
  (design 2026-11-13.26). Ảnh `design/screens/Canh-loi-L6-*.png`.
- Thử máy: trà lâu (0; −64): ra ngoài hồi phải, đi thẳng lên thang → camera không bị che, qua cầu nối vào tầng 2. Tàng Thư
  Các: chân thang ở (−27,4; −25), đi thẳng về bắc lên. Còn khó / bị che → quay màn hình gửi.
- Lần 2 (trà lâu — khe giữa lan can thang và mép sàn tầng 2): thang đặt cách mép nền 1 m (`clear: 1`) để tránh hiên lửng
  → dọc vế thang có khe ~1 m nhìn xuống mái hiên, chỉ đoạn chiếu nghỉ có cầu nối. Người dùng chọn "áp thang sát nhà":
  `tra_lau.ts` `clear: 0` (thang sát mép nền), hiên lửng phía hồi phải lùi vào sát tường (`skirt` thêm tham số `dx` —
  `mai.ts`), cầu nối gỗ lấn 0,15 m vào trong mép nền phủ chỗ nối (`cau_thang.ts`, dùng chung cả Tàng Thư Các). Test:
  `web/src/traLau.test.ts` — `'R-VA-3 (L-6): thang áp sát nhà — … không còn khe hở'`, `'(L-6): mái hiên lửng phía hồi phải
  lùi vào, không đâm vào thang'` (đỏ trước, xanh sau). Tàng Thư Các chưa đổi: thang ở ngoài nền đá rộng 1 m có lan can →
  áp sát vẫn còn khe trên nền; muốn liền phải làm hành lang tầng 2 — chờ người dùng quyết.
- Thử máy (lần 2): trà lâu — leo thang hồi phải, nhìn sang trái: lan can thang sát mép sàn tầng 2, không còn dải hở; qua cầu
  nối vào tầng 2 không thấy khe. Còn hở → chụp màn gửi.
- Lần 3 (Tàng Thư Các — khe giữa cầu nối và sàn tầng 2): nguyên nhân — sàn tầng 2 chỉ tới x = w / 2 (9) mà cầu nối gỗ +
  lan can hai bên bắt đầu từ mặt ngoài nền đá (w / 2 + 1 = 10) → dải hở ~0,85 m nhìn xuống mái hiên, và dải đó không có lan
  can (bước ra là rơi). Sửa: `StairInput.deckX` (mới; thiếu = `xWall`, trà lâu giữ nguyên) — cầu nối, lan can trước / sau
  và hộp chặn mép trước kéo vào tới hàng lan can tầng 2; `lauSachStairs` đặt `deckX` = hàng cột hồi tầng 2 (8,4).
  Test `web/src/lauSach.test.ts` — `'R-VA-3 (L-6): cầu nối + lan can kéo vào tới hàng lan can tầng 2 …'`, `'R-VA-3 (L-6):
  đứng trên cầu nối ở dải giữa sàn tầng 2 và nền đá, đi ra trước → lan can chặn …'` (đỏ trước, xanh sau; 27 test Tàng
  Thư Các + trà lâu xanh). Code: `scene/kien_truc/cau_thang.ts`, `lau_sach.ts`. Đã `npm run build`.
- Thử máy (lần 3): Tàng Thư Các (−33; −22) — lên thang hồi phải tới chiếu nghỉ, nhìn về phía nhà: cầu nối gỗ liền vào sàn
  tầng 2, lan can hai bên chạy tới hàng cột; đi dọc mép trước cầu nối → bị lan can chặn. Còn hở → chụp màn gửi.
- Commit: chưa (chưa được yêu cầu).

**Lịch sử**
- 2026-11-13: ghi, sửa luôn.
- 2026-11-13: thử máy trà lâu — "khoảng cách giữa lan can đến bề mặt tầng 2 có khoảng trống mặc dù vẫn đi qua được" (ảnh: khung lan can cầu nối, mặt lối xám, hở trước sàn tầng 2). Mở lại, sửa luôn.
- 2026-11-13: người dùng báo đã thử máy, đạt → xong.
- 2026-11-14: "cầu thang ở tàng thư các vẫn đang lỗi . Phần cầu thang lên với phần tầng vẫn chưa khớp nhau vẫn còn khoảng
  trống" (ảnh: từ chiếu nghỉ thấy dải mái xám giữa cầu nối và sàn tầng 2). Sửa luôn (lần 3) → chờ thử máy.

## Đã xong

### L-5 · Cổng Sơn Môn (model AI) quá lớn, đế đá chân trụ cao hơn người

- Trạng thái: xong · Mức độ: nhỏ (sai tỉ lệ nhìn thấy rõ nhưng không cản chơi) · Phần: cảnh — cổng `gates[].model`
  (`web/src/scene/gate.ts`) · Quy tắc: chưa có (R-VA-1 cột cổng — va chạm giữ nguyên)
- Báo: 2026-11-13 — "cổng sơn môn hiện tại đang quá lớn đặc biệt là các khối đã ở chân"
- Các bước: 1. Mở app / Canvas 3D. 2. Đi từ chỗ xuất phát (0; 50) lên cổng Sơn Môn (0; 44).
- Mong đợi / thực tế: cổng cỡ như cổng khối cũ (~15 m), đế đá thấp hơn vai nhân vật / cổng rộng 19,9 m, cao 18,8 m, đế đá
  cao ~3 m, rộng 2,1 m (nhân vật 2,1 m).
- Bằng chứng: ảnh chụp Canvas 3D khi làm `docs/tasks/2026-11-13-cong-son-mon-model.md` (scratchpad); trên máy: chưa có.
- Hướng sửa (người dùng chọn): thu nhỏ cả cổng × 0,75 + nén riêng khối đá chân xuống ~1,2 m, hẹp lại.

**Sửa**
- Nguyên nhân: model giữ tỉ lệ ảnh thiết kế (đế đá ≈ 0,16 chiều cao cổng) và được co cho bề ngang bằng cổng khối
  (19,9 m) → cổng cao 18,8 m, đế ~3 m. Co đều cả cổng không đủ: cổng vừa cảnh thì đế vẫn ≈ cao người.
- Test: `web/src/scene/gateFeet.test.ts` — `'(L-5): khối đá chân trụ thấp xuống ~1,2 m và hẹp lại, trụ giữ nguyên bề dày'`,
  `'(L-5): đế đã thấp hơn mức cần → không đổi gì'` (đỏ trước khi có `squashFeet`).
- Code: `web/src/scene/gateFeet.ts` (mới, `squashFeet` — tìm trục trụ + đỉnh đế từ lưới, nén đế về 1,2 m, thu ngang × 0,75,
  hạ phần trên), `scene/staticModel.ts` `bakeTransforms` (toạ độ meshopt lượng tử hoá → số thực), `scene/gate.ts`
  (`FEET`, `modelScale`), `scene/spec.ts` + `specCheck.ts` (`gates[].modelScale`), `design/scene/scene.json`
  `modelScale: 0.75` (design 2026-11-13.22). Kết quả: cổng rộng ≈ 14,9 m, cao ≈ 13 m, đế 1,2 m; ảnh
  `design/screens/Canh-loi-L5.png`.
- Thử máy: `flutter run` → đi từ (0; 50) lên cổng: đế đá thấp hơn vai nhân vật, đi qua khe giữa được, đâm trụ thì dừng.
  Còn lỗi → gửi ảnh chụp màn.
- Commit: chưa (chưa được yêu cầu).

**Lịch sử**
- 2026-11-13: ghi, sửa luôn (người dùng chọn).
- 2026-11-13: người dùng báo đã thử máy, đạt → xong.

### L-4 · Quảng trường Văn Uyên Tông: lư hương + "cục trắng" + cây đặt không hợp lý

- Trạng thái: xong · Mức độ: nhỏ (bố cục / thẩm mỹ, không cản chơi) · Phần: cảnh — bố cục `design/scene/scene.json`
  (props, trees.yard, rạp phim), khói `scene/props.ts` · Quy tắc: chưa có
- Báo: 2026-11-13 — "ở quảng trường có 1 số món đồ đặt không hợp lý như lô hương cục gì trắng nổi lên và cây không
  đúng chỗ" (kèm ảnh: khu rạp phim 影戲臺, bồ đoàn, khối trắng góc phải)
- Các bước: 1. Mở app / Canvas 3D. 2. Đi vào sân Văn Uyên Tông (quanh Truyền Tống Đài, rạp phim).
- Mong đợi / thực tế: đồ vật, cây đặt có chủ ý, cân đối / lư hương đứng lẻ giữa lối, khói như khối trắng đặc, cây chen
  sát hàng ghế rạp và choán góc sân.
- Bằng chứng: ảnh người dùng chụp trên trình duyệt; ảnh Canvas 3D chụp lại.

**Sửa**
- Nguyên nhân: (1) đỉnh đồng `dinh-dong` (0; 12) đứng một mình giữa lối Sơn Môn → đài; khói là khối 20 mặt
  `MeshBasicMaterial` không bóng, nên trông như cục trắng đặc trôi lên. (2) Hai cây mai (±8,5; −9) mọc sát mép hàng
  bồ đoàn rạp phim; tùng (14; −14) to 1,68, hai tùng (±15; 15) to 1,5–1,6 choán góc sân, che tầm nhìn. (3) Rạp (bồ đoàn
  tới z −8,5) chỉ cách bậc bắc Truyền Tống Đài (z −7,2) ≈ 1,3 m.
- Hướng sửa (người dùng chọn): bỏ lư hương; bỏ 3 tùng, 2 mai sang hai bên màn chiếu; rạp sang khu giao lưu vui chơi
  mới **Tụ Hiền Viên 聚賢園** phía đông sân (R-RAP-1 viết lại + online + `--mark-synced`).
- Test: chưa khoá được bằng test (bố cục hình ảnh) — `scene:check` không lỗi; chụp Canvas 3D
  `design/screens/Canh-loi-L4-san.png`, `design/screens/Canh-loi-L4-tu-hien-vien.png`.
- Code: không đổi code — `design/scene/scene.json` (mục thiết kế `2026-11-13.15`), build lại `app/assets/scene/`.
- Thử máy: 1. Vào sân Văn Uyên Tông: không còn lư hương, cây tùng; quanh đài thoáng. 2. Ra cổng đông, rẽ theo lối đá về
  bắc tới Tụ Hiền Viên. 3. Đứng sát bồ đoàn, bấm Ngồi → ngồi lên, phim chạy. Còn lỗi → gửi ảnh chỗ đó.
- Commit: …

**Lịch sử**
- 2026-11-13: ghi; người dùng chọn ghi + sửa luôn. Sửa bằng bố cục, chờ thử máy.
- 2026-11-13: người dùng gửi ảnh khối trắng tròn → là giếng (−15; −15), "xóa khối này" → `well.enabled: false`.
- 2026-11-13: "phần dược các và các luống cây là không cần thiết nên xóa" → bỏ nhà `duoc-cac` (−49; 3) + 4 `luong-thuoc`
  (x −31).
- 2026-11-13: "cỏ và cây ở chỗ ngoài … lộn xộn xấu; phường thị … vô dụng" → xoá khu Thị Tập, cây ngoài xếp đối xứng,
  cỏ búi 6 → 1,5 / 100 m² (mục thiết kế 2026-11-13.15, đợt 3). Khu giao lưu thay chỗ Thị Tập = tính năng mới, chờ `/lead`.
- 2026-11-13: người dùng báo đã thử máy, đạt → xong.

### L-3 · Lối lát đá bị cắt ngang, chìm dưới nền gạch khi nhìn gần

- Trạng thái: xong · Mức độ: khó chịu (thấy ngay ở chỗ xuất phát) · Phần: cảnh — lối đá (`scene/paths.ts`) · Quy tắc: chưa có
- Báo: 2026-11-13 — "ở góc nhìn gần cũng đang xảy ra lỗi khi đường đi bị cắt như ảnh" (kèm ảnh: sân Sơn Môn, lối đá
  dừng giữa chừng, phía trước chỉ còn gạch nâu)
- Các bước: 1. Mở app / Canvas 3D. 2. Đứng ở chỗ xuất phát (0; 80), nhìn về cổng Sơn Môn.
- Mong đợi / thực tế: lối đá liền tới chân / lối đá bị cắt, đoạn gần chìm dưới nền gạch.
- Bằng chứng: ảnh người dùng chụp trên Chrome.

**Sửa**
- Nguyên nhân: mỗi lối đá là MỘT tứ giác phẳng nối hai đầu (Sơn Môn: z 33,6 → 89,6, dài 56 m), độ cao lấy ở hai đầu, ở
  giữa nội suy thẳng; mặt đất ở giữa cao hơn đường nội suy (bục, gờ, nhiễu) → lối chìm dưới nền.
- Test: chưa khoá được bằng test (hình ảnh) — chụp Canvas 3D ở góc người dùng.
- Code: `web/src/scene/paths.ts` — chia lối thành đoạn ≤ 1 m theo chiều dài, 3 điểm theo bề ngang, mỗi điểm lấy độ cao
  mặt đất.
- Thử máy: đứng ở chỗ xuất phát nhìn về cổng; đi dọc lối đá lên Thiên Bậc. Ảnh sau sửa: `design/screens/Canh-loi-L3.png`.
- Commit: …

**Lịch sử**
- 2026-11-13: ghi + sửa.
- 2026-11-13: người dùng báo đã thử máy, đạt → xong.

### L-2 · Nhân vật .glb: mặt loang lổ, sống mũi gồ, vệt trắng ở tai / cạnh đầu

- Trạng thái: xong · Mức độ: khó chịu (nhân vật chính nhìn lỗi ở mọi khung hình) · Phần: nhân vật, model .glb
  (`player/glbCharacter.ts`, `web/scripts/model-paint.mjs`, `tai-nguyen/scripts/atlas.py`) · Quy tắc: chưa có
- Báo: 2026-11-12 — "nhân vật đang bị lỗi và đang khá cứng đờ tôi cần có động tác" (kèm ảnh)
- Các bước: 1. `cd web && npm run dev`, mở Chrome. 2. Nhìn nhân vật ở góc chơi.
- Mong đợi / thực tế: mặt mịn, màu như ảnh gốc / mặt chia mảng sáng tối rõ từng tam giác, mũi gồ, tai và cạnh đầu có
  vệt trắng xám.
- Bằng chứng: ảnh người dùng chụp trên Chrome (`npm run dev`).
- "Cứng đờ, cần động tác" là tính năng mới → kế hoạch `docs/tasks/2026-11-12-dong-tac-nhan-vat.md`.

**Sửa**
- Nguyên nhân: (1) model Hunyuan không có pháp tuyến; `model:paint` tách đỉnh (unweld) rồi app tự tính pháp tuyến →
  mỗi tam giác một pháp tuyến riêng → mặt chia mảng sáng tối. (2) mép model (tai, cạnh đầu, hông) lấy mẫu trúng nền xám
  + nét viền của ảnh chiếu. Mũi gồ là hình khối Hunyuan dựng + giảm còn 9 500 tam giác — giảm nhẹ được, không hết.
- Test: chưa khoá được bằng test (hình ảnh — kiểm bằng chụp Canvas 3D `?chup&nv=0,80&cam=…`, trước / nghiêng / sau).
- Code: `web/scripts/model-paint.mjs` (weld → `normals()` → unweld; lấy mẫu lùi vào 3 %), `.claude/skills/tai-nguyen/
  scripts/atlas.py` (bỏ 3 px mép + lan màu bên trong ra phủ nền), model chạy lại → `design/models/nhan-vat.glb`.
- Còn lại: vạt áo dưới có vài vệt lam (mép áo), mặt hơi gợn — muốn sạch hẳn cần tô màu thật của Hunyuan (MSVC).
- Thử máy: `cd web && npm run dev` → Chrome, nhìn mặt / tai / vạt áo ở góc chơi và khi xoay quanh.
- Commit: …

**Lịch sử**
- 2026-11-12: ghi; sửa pháp tuyến + lan màu mép (chờ thử máy).
- 2026-11-13: người dùng báo đã thử máy, đạt → xong.

### L-1 · Chạy app trên máy tính (Windows) / web báo lỗi build

- Trạng thái: xong · Mức độ: chặn dùng (không mở được app trên máy tính) · Phần: app Flutter, WebView · Quy tắc: chưa có
- Báo: 2026-11-11 — "vì ứng dụng này sẽ chạy được cả trên nền tảng web nhưng hiện tại khi run ở web thì đang báo lỗi"
- Các bước: 1. `cd app && flutter run`, chọn thiết bị Windows. 2. Build lỗi.
- Mong đợi / thực tế: app mở, thấy cảnh 3D / build thất bại `error MSB3073 … NUGET-NOTFOUND install Microsoft.Web.WebView2`,
  dòng đầu "Nuget is not installed! The flutter_inappwebview_windows plugin requires it."
- Bằng chứng: log build người dùng dán (Windows 11, Visual Studio 18 Insiders). Chạy thử trên web (`flutter build web`):
  "This project is not configured for the web."

**Sửa**
- Nguyên nhân:
  1. Windows: máy chưa cài NuGet (`where nuget` không thấy). Gói `flutter_inappwebview_windows` dùng NuGet tải WebView2
     + 2 thư viện C++ khi build → lỗi môi trường, không phải code.
  2. Web (trình duyệt): app chỉ tạo cho android + ios ở mốc 1, chưa bật nền tảng web. Bật lên rồi vẫn hỏng tiếp:
     `InAppLocalhostServer` dùng `dart:io` (mở cổng http) — trình duyệt không có.
- Hướng (người dùng chọn): **chỉ web (trình duyệt)**, không làm bản Windows desktop → không cần NuGet, bỏ `app/windows/`.
- Test: `app/test/scene/scene_server_test.dart` — `'(L-1): trên web nạp cảnh thẳng từ asset cùng nguồn, không dùng máy chủ
  localhost'` (+ chạy ở gốc, + Android / iOS vẫn qua cổng 8080). Đỏ trước khi sửa (chưa có `sceneUrl`).
- Code: `flutter create . --platforms web` (`app/web/`, tên / màu / `viewport-fit=cover` / nạp `web_support.js` của
  flutter_inappwebview); `app/lib/scene/scene_server.dart` — web: không tạo `InAppLocalhostServer`, mở
  `assets/assets/scene/index.html` cùng nguồn; `app/lib/main.dart` — không gọi bật gỡ lỗi WebView Android khi chạy web.
  `flutter build web` thành công; mở `app/build/web/` bằng Chrome headless thấy cảnh 3D trong khung WebView.
- Thử máy: `cd web && npm run build`, rồi `cd ../app && flutter run -d chrome` → thấy cảnh, đi lại được; nếu còn lỗi gửi
  log terminal + ảnh màn, F12 → Console.
- Commit: —

**Lịch sử**
- 2026-11-11: ghi; người dùng chọn "ghi rồi sửa luôn". Log người dùng dán là bản **Windows** (thiếu NuGet); hỏi lại →
  người dùng chọn chỉ web.
- 2026-11-13: người dùng báo đã thử máy, đạt → xong.
