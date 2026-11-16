# Vào nhà bằng vòng sáng + nút / chạm nhà (V-96)
- Yêu cầu: "để vào nhà tôi đề xuất có vòng tròn sáng nhỏ hay gì đó và phải nhấn vào nhà thì mới vào chứ không tự vào như giờ"
  — người dùng chọn: vòng sáng nhỏ + nút "Vào nhà" HOẶC chạm vào nhà. Luật R-NHA-1 (đã sửa + đồng bộ online).
- Loại: sửa hành vi · Cỡ: vừa · Trạng thái: xong

## Phạm vi
**Sẽ sửa**
- `design/scene/nha-ta.json` — cổng cửa nhà chính: `via: "nut"`, vùng = vòng trước cửa, `ring: 0.75` (việc nhỏ, miễn concept).
- `web/src/scene/spec.ts` — trường mới `PortalSpec.ring` (bán kính vòng sáng nhỏ không chữ; thiếu = như cũ).
- `web/src/scene/specCheck.ts` — nhận trường `ring` (số dương).
- `web/src/scene/portals.ts` — `portalContains` (vòng tròn khi có `ring`), `buttonPortalAt` dùng nó; kiểm cổng: `ring`
  vừa trong vùng; cổng bấm nút chỉ cần chỗ đứng ngoài vòng (không cần cách 1 m — không tự sang).
- `web/src/scene/vongCong.ts` — dựng vòng nhỏ không chữ cho cổng có `ring` (đĩa + màn sáng thấp + hạt, cùng vật liệu).
- `web/src/scene/world.ts` — `World.closedHouses` (hộp bao nhà kín `nha-o`, toạ độ cảnh) để bắt chạm nhà (mái / tường / cửa,
  kể cả model — hộp bao phủ cả model vì model co vừa khung `houseFrame`).
- `web/src/input/tapToMove.ts` — `GroundPicker.hitsBox` (tia chạm hộp).
- `web/src/vaoNha.ts` (mới, file ghép) — `HouseDoor`: chạm nhà trong vòng → vào; ngoài vòng → `walkTo` tâm vòng rồi vào;
  joystick giữa chừng → huỷ (cơ chế `PlayerController.walkTo` sẵn có).
- `web/src/main.ts` — vài dòng: tạo `HouseDoor`, gọi trong `onTap`.
- Test: `web/src/vaoNha.test.ts` (mới), sửa `nhaPhamVi.test.ts`, `scene/portals.test.ts`, `scene/vongCong.test.ts`.

**Cần kiểm tra** `scene/decorArea.ts` (vùng cấm đặt đồ theo `area` cổng nút — tự phủ vòng), `zones/areaMap.ts` /
`scene/placeNames.ts` (dấu cửa "Vào nhà" theo tâm vùng), `scripts/check-scene.mjs` (cặp cổng, in toạ độ).

**Không đụng** `ui/exitButton.ts` (dùng lại nguyên — cùng nút "Ra sân", phím E), `homeDecor.ts`, `homeGarden.ts`,
`scene/hac*.ts`, `cuoiHac.ts`, `player/npc.ts`, `glbCharacter.ts`, `mixamoCharacter.ts`.

## Giả định / cần quyết định
- **Chỗ vòng**: tâm (−15; −3,4), bán kính 0,75 m — trên sân ngay chân dốc trước cửa (dốc tới z −4,05; mép bắc vòng
  −4,15 lẩn dưới chân dốc 0,1 m). Chỗ ra sân (−15; −2,6) cách tâm 0,8 m → **ngoài vòng**: vừa ra không hiện nút, lùi một
  bước về cửa là hiện. Không đặt sâu hơn được vì vòng sẽ nằm trên dốc (mặt nghiêng).
- "Trong vòng" = tâm nhân vật cách tâm vòng ≤ bán kính (hình tròn, không phải ô vuông `area`); `area` vẫn là ô bao vòng
  (vùng cấm đặt đồ, dấu trên bản đồ lớn).
- Nút "Vào nhà" dùng lại nguyên nút "Ra sân" (`ExitButton`) — cả hình minh hoạ `ra-san` bên trái nhãn. Muốn hình riêng
  cho "Vào nhà" → phiếu thiết kế (chưa làm).
- Bắt chạm nhà bằng hộp bao nhà (tia ∩ hộp) thay vì từng mảnh lưới: đúng cho cả model `nha-ta.glb` lẫn bản khối, không
  phải chờ model nạp. Chạm trúng vật đặt trước nhà (đồ trang trí) mà tia đi tiếp vào hộp nhà cũng tính là chạm nhà.
- Chưa sửa câu R-HANH-4 "vào = bước vào ô cửa nhà chính là sang" (sổ quy tắc không được sửa trong việc này) — cần sửa sổ
  cho khớp R-NHA-1.

## Nhiệm vụ
- [x] 1. Đặc tả: `PortalSpec.ring` + kiểm + `nha-ta.json` (spec · scene · test portals · xong khi scene:check sạch)
- [x] 2. Luật: `portalContains`, `buttonPortalAt` theo vòng; kiểm cổng nút (portals.ts · scene · test R-NHA-1)
- [x] 3. Vòng sáng nhỏ không chữ (vongCong.ts · scene · test vongCong)
- [x] 4. Chạm nhà: `closedHouses`, `hitsBox`, `HouseDoor` + ghép main (world/input/gốc · test vaoNha R-NHA-1)
- [x] 5. Ảnh Canvas 3D ngày + đêm → `design/screens/Nha-vao-vong.png`
- [x] 6. Kiểm tra cuối + build

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/rule_trace.dart
