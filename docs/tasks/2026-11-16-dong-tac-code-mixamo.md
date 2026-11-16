# Động tác bằng code cho nhân vật xương Mixamo (Tripo)
- Yêu cầu: "Động tác bằng code cho nhân vật xương Mixamo (Tripo): (1) lớp nối xương Mixamo vào hợp đồng Character;
  (2) đi / đứng mềm bằng code; (3) NPC quay đầu nhìn người chơi khi lại gần + gật đầu khi nói chuyện; (4) phòng thử động tác
  trên Canvas 3D có thanh trượt để người dùng chỉnh rồi chốt; (5) áp cho NPC thu-thu trước, sau đó các NPC khác và nhân vật
  chính." — người dùng chê động tác sẵn của Tripo "đi đứng cứng" (2026-11-16).
- Loại: thêm + sửa hành vi (R-NPC-1, R-NPC-2) · Cỡ: lớn · Trạng thái: xong (2026-11-16 — NV7: người dùng thử "tạm ổn", giữ bộ số mặc định)

## Bối cảnh
- Model Tripo (`design/models/thu-thu.glb`): xương `mixamorig:*` 65 khớp (Hips, Spine/Spine1/Spine2, Neck, Head, Shoulder,
  Arm, ForeArm, Hand, ngón, UpLeg, Leg, Foot), tư thế chữ A, clip `idle` / `walk` (người dùng không dùng).
- Hiện nay: `autoRig.ts` tự gắn 7 xương cho model không xương; `glbCharacter.ts` có clip → phát clip, không thì dáng code
  trên 7 xương (đi, đứng, nhảy, ngồi, chào, biểu cảm, làm vườn, gõ mõ, gảy đàn); `npc.ts` `createNpc` (NPC đứng) thở + nhìn quanh.

## Phạm vi
**Sẽ sửa / thêm**
- `web/src/player/dongTac.ts` (mới, thuần, không three) — toán dáng: chu kỳ bước, nhún hông, vai ngược hông, tay vung từ
  vai + khuỷu trễ nhịp, đổ người theo tốc độ, nghiêng khi rẽ, đà bắt đầu / dừng; đứng: thở lan cột sống, dồn trọng tâm,
  nhìn quanh; nhìn người chơi (giới hạn góc, mắt → cổ → lưng) + gật đầu. Ra góc từng khớp. Bộ "tính cách" (tham số mẫu).
- `web/src/player/dongTac.test.ts` (mới, vitest).
- `web/src/player/mixamoRig.ts` (mới) — tìm xương `mixamorig:*`, nhớ tư thế gốc, áp góc của `dongTac` theo quy ước trục
  chung (tay trước / sau, khép / giang…) bất kể trục riêng từng xương; hạ tay từ chữ A.
- `web/src/player/glbCharacter.ts` — model có xương Mixamo → `mixamoRig` + `dongTac` (bỏ qua clip Tripo); model khác giữ như cũ.
- `web/src/player/npc.ts` — NPC đứng có xương Mixamo → `dongTac` (đứng mềm, nhìn người chơi, gật khi nói); bảng tính cách
  theo mã NPC (`NPC_TINH`, như `NPC_RIGS`); `Npc` thêm tuỳ chọn `watch(player, talking)`.
- `web/src/main.ts` — vài dòng: truyền vị trí người chơi + NPC đang thoại vào `npc.watch`.
- `web/src/dongTacPreview.ts` (mới) + `web/src/designPreview.ts` (một nhánh) — Canvas 3D `?dang=dong-tac&nv=<mã>`:
  nhân vật đi vòng / dừng / đứng, người chơi giả đi tới gần để thử nhìn + gật; bảng thanh trượt; nút "Chốt" chép bộ số
  (JSON) để dán lại cho Claude ghi vào `dongTac.ts`.
- `docs/testing/quy_tac.md` — sửa R-NPC-1, R-NPC-2 (nhìn người chơi, gật đầu); thêm R-NPC-10 (dáng đi / đứng mềm cho
  model có xương chuẩn) → `/dong-bo-quy-tac`.

**Cần kiểm tra**: `townNpcs.ts` (NPC đi / ngồi dùng `loadGlbCharacter`), `danTranh.ts` (cam-nu `pluck`), `gardenWork.ts` +
`doLamVuon.ts` (đồ cầm tay gắn `rig.armR` — chỉ nhân vật chính, chưa Mixamo), `bieuCamPreview.ts`, test `autoRig`,
`npcVisibility`, `npcRoute`, `townNpcs`.

**Không đụng**: `controller.ts` (hợp đồng `Character` giữ nguyên), đệ tử khối, NPC khối, cầu nối, Flutter, model Hunyuan
đang dùng (vẫn đi đường `autoRig`).

## Giả định / cần quyết định
- Q1 **Nhìn người chơi** trái R-NPC-1 hiện tại ("luôn giữ hướng, không quay theo người chơi"). Đề xuất: **thân giữ hướng**,
  chỉ đầu + cổ + ngực xoay (tối đa ~70°) khi người chơi trong 4 m và ở nửa trước NPC; ra xa / ra sau lưng thì từ từ quay
  về. Mỗi máy tự vẽ NPC nhìn người chơi của máy đó → không vướng nhiều người chơi sau này. Khi thoại: gật nhẹ đầu câu.
- Q2 **Phạm vi đợt này**: đợt 1 = NV1–NV7 (đi / đứng / nhìn / gật + phòng thử, áp `thu-thu` và mọi NPC Tripo về sau). Đợt 2
  (kế hoạch riêng, khi có `nhan-vat` bản Tripo): chuyển các dáng đặc biệt (biểu cảm, làm vườn, gõ mõ, gảy đàn, ngồi, nhảy,
  đồ cầm tay) sang xương Mixamo và đổi nhân vật chính. Trước đợt 2, NPC Tripo **biết đi / ngồi / gõ mõ / gảy đàn** chỉ có
  đi + đứng mềm, dáng đặc biệt chưa có (go-mo, cam-nu cần đợt 2 — hiện chưa có model Tripo nên chưa ảnh hưởng).
- Bộ số chốt từ phòng thử ghi thẳng trong `dongTac.ts` (tham số nhân vật, không phải số cảnh → không vào `SceneSpec`).
- Hiệu năng: mỗi NPC Tripo vẫn 1 draw call (+ bóng giả); tính góc ~20 khớp / NPC / khung — rẻ; NPC ngoài 35 m không cập
  nhật (R-NPC-1). Đo fps Canvas 3D trước / sau với 7 NPC (quy tắc 4).

## Nhiệm vụ
- [x] 1. Sổ quy tắc: sửa R-NPC-1 / R-NPC-2, thêm R-NPC-10 → `/dong-bo-quy-tac` (docs · xong khi tài liệu online đã chép).
- [x] 2. `dongTac.ts` + test: dáng đứng (thở, dồn trọng tâm, nhìn quanh), dáng đi (theo tốc độ, đà, rẽ), nhìn người chơi
      (giới hạn góc, mượt), gật đầu; 4 tính cách mẫu: điềm tĩnh (thủ thư), hoạt bát (tiểu nhị, khất nhi), già (gõ mõ),
      nghiêm (quản sự, trận sư) (player · vitest: chu kỳ bước khớp tốc độ, góc trong giới hạn, đứng yên → về tư thế nghỉ ·
      xong khi `npm test` xanh).
- [x] 3. `mixamoRig.ts`: nhận diện + áp góc theo quy ước chung; hạ tay chữ A (player · vitest với khung xương giả · xong
      khi thu-thu trên Canvas 3D đứng tay buông xuôi, không méo áo).
- [x] 4. `glbCharacter.ts`: nhánh Mixamo dùng `dongTac` (player · xong khi NPC đi thế `?dang=go-mo` bằng thu-thu đi mềm).
- [x] 5. `npc.ts` + `main.ts`: NPC đứng Mixamo thở / nhìn quanh / nhìn người chơi / gật khi thoại; `NPC_TINH` (player, ghép ·
      vitest `npcVisibility` vẫn xanh · xong khi đi tới gần thu-thu đầu quay theo, mở thoại thì gật).
- [x] 6. Phòng thử `?dang=dong-tac&nv=thu-thu[&tinh=…]`: đi vòng / dừng / đứng, người giả lại gần, thanh trượt (nhịp bước,
      vung tay, khuỷu trễ, nhún, đổ người, thở, dồn trọng tâm, tầm nhìn), nút Chốt chép JSON (Canvas 3D · xong khi chạy trên
      `npm run dev` và artifact Canvas 3D).
- [x] 7. Người dùng chỉnh trên phòng thử → chốt → ghi bộ số vào `dongTac.ts`; đo fps trước / sau; chụp ảnh
      `design/screens/Dong-tac-thu-thu-*.png` (xong khi người dùng duyệt).

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/guard.dart ·
dart tool/rule_trace.dart
