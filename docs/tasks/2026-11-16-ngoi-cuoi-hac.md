# Nhân vật ngồi cưỡi hạc (R-HANH-5)
- Yêu cầu (người dùng 2026-11-16, V-20261116-99): "tư thế nhân vật đứng trên hạc cũng đang không tự nhiên cần sửa lại cho
  hợp lý, phải giống đang ngồi (2 chân phải xuyên qua cánh áp sát vào hông)". Luật R-HANH-5 đã sửa + đồng bộ.
- Loại: dáng nhân vật (không đổi mốc thời gian `CRANE_TIMING`) · Cỡ: nhỏ–vừa · Trạng thái: đang làm (người dùng đã duyệt hướng)

## Việc
1. `CharacterState.ride` (0…1): dáng cưỡi thay dáng ngồi xếp bằng khi `sit` > 0.
2. File dáng thuần `web/src/player/cuoiDang.ts` (`tronCuoi`): đùi dạng hai bên thân hạc, gối gập, cẳng chân thả áp sườn,
   tay đặt trước trên cổ / lưng; hông theo lưng hạc (`pitch`), thân trên bù lại gần thẳng đứng. Test `cuoiDang.test.ts` (R-HANH-5).
3. `mixamoCharacter.ts` trộn `tronCuoi`; nhân vật autoRig 7 xương: dáng tương đương nếu dễ.
4. `cuoiHac.ts` `pose(..., ride)`; chỗ ngồi dịch ra sau gốc cánh nếu chân cắm vào cánh khi vỗ.
5. Canvas 3D `?dang=hac` dùng dáng cưỡi; chụp `design/screens/Hac-ngoi-cuoi.png` (bên, ¾, trước, sau-trên; đứng + vỗ lên / xuống).
