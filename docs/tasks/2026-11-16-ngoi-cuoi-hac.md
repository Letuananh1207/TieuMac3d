# Nhân vật ngồi cưỡi hạc (R-HANH-5)
- Yêu cầu (người dùng 2026-11-16, V-20261116-99): "tư thế nhân vật đứng trên hạc cũng đang không tự nhiên cần sửa lại cho
  hợp lý, phải giống đang ngồi (2 chân phải xuyên qua cánh áp sát vào hông)". Luật R-HANH-5 đã sửa + đồng bộ.
- Loại: dáng nhân vật (không đổi mốc thời gian `CRANE_TIMING`) · Cỡ: nhỏ–vừa · Trạng thái: chờ duyệt ảnh + thử máy (code xong trên nhánh `viec/cuoi-hac-ngoi`)

## Việc
1. `CharacterState.ride` (0…1): dáng cưỡi thay dáng ngồi xếp bằng khi `sit` > 0.
2. File dáng thuần `web/src/player/cuoiDang.ts` (`tronCuoi`): đùi dạng hai bên thân hạc, gối gập, cẳng chân thả áp sườn,
   tay đặt trước trên cổ / lưng; hông theo lưng hạc (`pitch`), thân trên bù lại gần thẳng đứng. Test `cuoiDang.test.ts` (R-HANH-5).
3. `mixamoCharacter.ts` trộn `tronCuoi`; nhân vật autoRig 7 xương: dáng tương đương nếu dễ.
4. `cuoiHac.ts` `pose(..., ride)`; chỗ ngồi dịch ra sau gốc cánh nếu chân cắm vào cánh khi vỗ.
5. Canvas 3D `?dang=hac` dùng dáng cưỡi; chụp `design/screens/Hac-ngoi-cuoi.png` (bên, ¾, trước, sau-trên; đứng + vỗ lên / xuống).

## Kết quả
- Đo hạc (model, chưa nhân scale 1,25): thân nửa rộng ~0,54 m ở y 0,4–0,8; gốc cánh x 0,58–0,75, y 0,83–1,25, z −0,67…0,48;
  chỗ ngồi y 1,34 z −0,10. Chân nhân vật chính (chibi) chỉ dài ~0,35 m → **không với tới sườn** hạc: đùi dạng gần ngang ôm
  lưng phẳng, cẳng chân thả xuống lẫn vào lông lưng / gốc cánh (gần đúng ý "chân xuyên qua cánh áp sát hông"); háng hạ
  sâu (`CUOI.ha`) để thân ngồi trên lưng, vạt áo xoè phủ lưng. Khi vỗ: không có chân lộ xuyên cánh (ảnh sau-trên vỗ lên / xuống).
- Chỗ ngồi `seat` **không dời** (chân không chạm cánh khi vỗ). Đĩa bóng giả dưới chân tắt khi ngồi trên lưng hạc.
- Nhân vật 7 xương (`autoRig`): `CUOI7` (chân dạng chếch xuống, tay ra trước) — chưa chụp soát. Đệ tử khối / chibi khối: giữ như cũ.
- Ảnh: `design/screens/Hac-ngoi-cuoi.png`. Test `player/cuoiDang.test.ts` (R-HANH-5).
