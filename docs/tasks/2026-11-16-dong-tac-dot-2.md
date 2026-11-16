# Động tác đợt 2 — nhân vật chính sang xương Mixamo (Tripo), không mất dáng nào
- Yêu cầu: "đổi nhân vật chính sang model Tripo có xương Mixamo (`design/models/nhan-vat.glb` sẽ được thay bằng bản
  Tripo — người dùng đang tạo, chưa có file; model mẫu cùng loại xương: `design/models/thu-thu.glb`) mà không mất dáng
  nào: chuyển mọi dáng lập trình sẵn của nhân vật chính từ bộ xương tự gắn 7 khớp (`autoRig`) sang xương Mixamo." (V-20261116-83)
- Loại: sửa cách vẽ (hành vi giữ nguyên) + dữ liệu (model) · Cỡ: lớn · Trạng thái: đang làm (duyệt 2026-11-16: Q1 hoat-bat, Q2 không sửa sổ, Q3 Claude tự đặt + duyệt ảnh, Q4 giữ autoRig)
- Tiếp theo: `docs/tasks/2026-11-16-dong-tac-code-mixamo.md` (đợt 1 — đi / đứng / nhìn / gật, đã gộp `main`; NV7 đợt 1
  — người dùng chỉnh bộ số thu-thu — vẫn mở, đợt này không đổi các trường `Tinh` để không vướng bộ số đang chỉnh).

## Bối cảnh
- Nhánh Mixamo của `loadGlbCharacter` (`glbCharacter.ts`, đầu hàm) hiện chỉ có đi / đứng (`dong.update` → `mx.apply`).
  Nó bỏ qua `state.air/sit/bow/idle/strike/pluck/emote/work/hold`, và `toolTip` luôn trả false.
- Nhánh `autoRig` (cùng file) có đủ dáng. Góc theo 7 xương: `aLx/aLz/aRx/aRz` (cả cánh tay, không khuỷu), `hips.x/y`,
  `head.x/y/z`, `legs` (cả chân, không gối), `bob.position.y`. Trong `autoRig`, xương `hips` là cha của đầu, tay và chân.
- Dáng biểu cảm (`bieuCamDang.ts` `EmotePose`) và làm vườn (`lamVuonDang.ts` `WorkPose extends EmotePose`) viết theo
  góc 7 xương đó. `discipleCharacter.ts` (đệ tử khối) cũng dùng chúng.
- `dongTac.ts` ra `Pose` 18 khớp cùng quy ước góc (tay x âm = ra trước, tay trái z âm = khép, thân x dương = cúi). Mỗi
  khớp con tính trong khung khớp cha đã xoay. `mixamoRig.ts` áp lên xương theo local = Wp⁰⁻¹·D·Wp⁰·L⁰.
- Ba chỗ phải lưu ý khi nối:
  1. `Hips` của Mixamo là **cha của hai chân**. Góc cúi `hipsX` mà đổ vào `Hips` thì cả người nghiêng như tấm ván, chân
     rời đất. Phải chia cho `spine / chest / upperChest`.
  2. Góc tay cũ đo từ tư thế chữ A của model Hunyuan (buông = `REST` 0,4). Model Tripo có góc chữ A khác (buông =
     `haTay`). Muốn giữ đúng hướng tay thì **cộng lệch** `haTay − REST`, không nhân tỉ lệ.
  3. Ngồi (`sit`) hạ thân −0,3 m. Chỗ ngồi trong cảnh (bồ đoàn, ghế bàn cờ, đôn trà, bục đàn) đã khớp với độ hạ đó.
     Dáng ngồi Mixamo phải để **đáy hông ở đúng độ cao cũ**.
- Nhìn từ mắt khi ngồi (R-DIEU-7: `ngoiMat.ts`, `input/eyeCamera.ts`, `scene/tayNgoi*.ts`) dùng tay giả riêng, không phụ
  thuộc rig; chỉ cần kiểm lúc chuyển từ ngôi 3 sang ngôi 1.
- Ảnh thế ở Canvas 3D: `?dang=go-mo` (`townPreview.ts`) và `?dang=dan-tranh` (`danTranh.ts` `standIn`) lấy
  `PLAYER_MODEL_URL` làm model thế. Thay `nhan-vat.glb` bằng bản Tripo thì hai trang này **lập tức** đi nhánh Mixamo, nên
  gõ mõ, gảy đàn và ngồi phải xong trước NV9. Sau này `go-mo` và `cam-nu` có model Tripo cũng chạy luôn.

## Phạm vi
**Sẽ sửa / thêm**
- `web/src/player/dongTac.ts`: thêm chạy (hoà theo tốc độ 3,2 → 7 m/s), nhảy (`air`, `vy`), ngồi xếp bằng (`sit` 0…1,
  độ hạ do nơi gọi truyền). Hằng chạy để riêng (`CHAY`), không thêm trường vào `Tinh`. Test thêm ca chạy / nhảy / ngồi.
- `web/src/player/dang7.ts` (mới, thuần) + test: lớp nối "dáng 7 khớp → `Pose` 18 khớp".
  - `tronDang7(pose, d, w, cal)`: tay → `armL/R` (cộng lệch chữ A), khuỷu tuỳ chọn → `foreL/R`; `hipsX/Y` → `spine 0,45 ·
    chest 0,35 · upperChest 0,2` (không đụng `hips`); `headX/Y/Z` → `neck 0,4 · head 0,6`; `legs` → `upLegL/R` + gối
    `legL/R` + bàn chân giữ bằng; `lift` cộng vào `pose.lift`.
  - Các dáng riêng rút khỏi `glbCharacter.ts`, vẫn theo góc 7 khớp: `chaoDang(bow)`, `dungLauDang(idle)` (R-DIEU-8),
    `nhayDang(air)`, `ngoiDang(sit)`, `goMoDang(strike)`, `gayDanDang(pluck, time)`.
- `web/src/player/bieuCamDang.ts`, `lamVuonDang.ts`: thêm `eL?`, `eR?` (khuỷu) cho từng dáng; `autoRig` / đệ tử khối bỏ qua.
- `web/src/player/mixamoRig.ts` + test: `bone(j)`; điểm nắm bàn tay phải; độ cao hông lúc gốc; góc chữ A đo từ xương.
- `web/src/player/doLamVuon.ts`: gắn được vào xương bất kỳ (`RightHand` Mixamo), dựng thẳng theo thân, bù co giãn.
- `web/src/player/glbCharacter.ts`: nhánh Mixamo đủ dáng (cùng thứ tự / trọng số nhánh `autoRig`), đồ cầm tay +
  `toolTip` thật, `opts.player`; nhánh `autoRig` gọi các hàm rút ra, số giữ nguyên.
- `web/src/player/playerCharacter.ts`: `?nhan-vat=<mã>` nạp `design/models/<mã>.glb` làm nhân vật chính (thử trước khi có
  bản Tripo); `playerModelUrl(choice)`; truyền `tinh` (Q1).
- `web/src/townPreview.ts`, `web/src/designPreview.ts` (dòng `dan-tranh`): model thế theo `playerModelUrl(?nhan-vat)`.
- NV9: `design/models/nhan-vat.glb` (Tripo), `LICENSES.md`, `design/CHANGELOG.md`, ảnh so, `npm run build`.

**Cần kiểm tra**: `discipleCharacter.ts`, `gardenWork.ts`, `vuonPreview.ts`, `danTranh.ts`, `townNpcs.ts`, `player/npc.ts`,
`ngoiMat.ts`, `dongTacPreview.ts`, `bieuCamPreview.ts`, `designPreview.ts` `?dang=chay|nhay|ngoi|chao|vuon|nhin|ngoi-mat`;
test `bieuCam`, `lamVuonDang`, `autoRig`, `townNpcs`, `danTranh`, `npcVisibility`.

**Không đụng**: `controller.ts` (hợp đồng `Character` / `CharacterState`), `autoRig.ts`, `zones/bieuCam.ts`, luật vườn,
cầu nối, Flutter, đặc tả cảnh, HUD, tay giả nhìn từ mắt, NPC Hunyuan `su-phu` / `tieu-mac`.

## Giả định / cần quyết định
- Q1 **Tính cách dáng nhân vật chính.** Đề xuất: `hoat-bat`, **tắt nhìn quanh liên tục** (R-DIEU-8 vẫn là lúc duy nhất
  nhìn quanh); giữ thở, dồn trọng tâm.
- Q2 **Sổ quy tắc.** Đề xuất: **không sửa** — R-DIEU-5…8, R-BIEU-1/2, R-VUON-13, R-NPC-8/9, R-NGOI-1, R-ON-8 tả hành vi,
  không tả bộ xương; đợt này chỉ đổi cách vẽ.
- Q3 **Góc khuỷu từng dáng.** Đề xuất: Claude tự đặt, người dùng duyệt ảnh từng nhóm ở NV8, không thêm thanh trượt. Gợi ý
  ban đầu: chắp tay ≈ −1,3 (vai x ≈ −0,9) · vỗ tay ≈ −0,5 · suy nghĩ (tay phải) ≈ −1,9 · gõ mõ (tay trái) ≈ −1,0 ·
  gảy đàn ≈ −0,8 · chạy ≈ −1,2.
- Q4 **Đường `autoRig`.** Đề xuất: giữ (NPC Hunyuan + dự phòng khi nạp lỗi).
- Góc hạ tay nhân vật chính **đo từ xương** (góc chữ A lúc gốc trừ ~0,06 rad), không dùng số tay trong `TINH`.
- Ngồi: đáy hông ở độ cao dáng cũ; chỉnh trên `?dang=ngoi-mat` (bồ đoàn, ghế bàn chơi, đôn trà) và `?dang=dan-tranh`.
- Hiệu năng: draw call không đổi (1 lưới / 1 vật liệu + bóng giả + đồ cầm tay khi cầm); ~16 000 tam giác, 65 xương
  skinning GPU; CPU 18 khớp / khung. Đo fps Canvas 3D trước / sau ở NV8 và với model thật ở NV9.

## Nhiệm vụ
- [x] 1. `dongTac.ts`: chạy, nhảy, ngồi xếp bằng + test (player · thuần · xong khi `npm test` xanh).
- [x] 2. `dang7.ts` + `eL/eR` trong `bieuCamDang.ts` / `lamVuonDang.ts` + test: `w` = 0 không đổi; `hipsX` chia cho thân,
      `hips` x giữ; tay buông cũ → `−haTay`; `legs` âm → gối dương; `dungLauDang` vươn vai / nhìn quanh; `goMoDang`.
- [ ] 3. Nhánh `autoRig` gọi các hàm rút ra — **không đổi hành vi** (chụp so trước / sau `?dang=chay|nhay|ngoi|chao|vuon|nhin`,
      `bieu-cam`, `lam-vuon` với model Hunyuan hiện tại).
- [ ] 4. `mixamoRig.ts`: `bone(j)`, điểm nắm bàn tay phải, độ cao hông, góc chữ A + test trên khung xương giả.
- [ ] 5. `doLamVuon.ts`: gắn xương bất kỳ, dựng thẳng theo thân, bù co giãn + test.
- [ ] 6. Nhánh Mixamo của `glbCharacter.ts` đủ dáng, đồ cầm tay, `toolTip`, `sitDrop`, `opts.player`.
- [ ] 7. `playerCharacter.ts` `?nhan-vat=<mã>` + `playerModelUrl` cho trang thế.
- [ ] 8. Kiểm Canvas 3D bằng thu-thu từng nhóm (di chuyển · đứng / chào · ngồi · biểu cảm · làm vườn · NPC thế gõ mõ /
      gảy đàn), chụp `design/screens/Dong-tac-nhan-vat-<nhóm>.png`, đo fps; xong khi người dùng duyệt ảnh từng nhóm.
- [ ] 9. **Thay `nhan-vat.glb` bằng bản Tripo** (chờ model): `tripo.sh nhan-vat` → trình → `--dat`; kiểm xương / lưới /
      tam giác; chạy lại NV8 không `?nhan-vat=`; LICENSES, CHANGELOG, ảnh so, `npm run build`.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/guard.dart ·
dart tool/rule_trace.dart
