# Động tác cho nhân vật .glb (tự gắn xương)
- Yêu cầu: "nhân vật đang bị lỗi và đang khá cứng đờ tôi cần có động tác" (2026-11-12; phần lỗi hình → L-2)
- Loại: thêm · Cỡ: vừa · Trạng thái: chờ thử máy

## Cách làm (đã chọn — Claude đề xuất, người dùng cần động tác ngay)
Tự gắn xương bằng code lúc nạp model (`web/src/player/autoRig.ts`) thay vì Mixamo / Blender: chạy offline, áp cho mọi
model AI tư thế chữ A, không cần tài khoản. Model có clip `idle` / `walk` thật vẫn dùng clip (ưu tiên).

## Phạm vi
**Sẽ sửa**: `player/autoRig.ts` (mới — 7 xương: gốc, hông, đầu, tay T/P, chân T/P; trọng số mềm theo tỉ lệ chibi;
chuyển thuộc tính lượng tử hoá meshopt sang Float32), `player/glbCharacter.ts` (không clip → autoRig + động tác lập
trình), `designPreview.ts` (`?di=0..1` đi tại chỗ, `?pha=` đặt pha bước để chụp).
**Không đụng**: `PlayerController` (hợp đồng `Character` giữ nguyên), va chạm, tốc độ, luật.

## Nhiệm vụ
- [x] 1. autoRig + động tác: đi (chân so le ±0,55 rad, tay vung ngược ±0,5, hông xoay, đầu bù, đổ người), đứng (thở,
      đầu nghiêng chậm). Kiểm: chụp Canvas 3D `?di=0&pha=1.57` / `4.71` nhìn trước + nghiêng — tư thế đối xứng đúng.
- [ ] 2. Thử trên máy / Chrome (`npm run dev`): đi bằng joystick, dừng lại → về dáng đứng mượt; xoay camera xem không
      rách khớp vai / hông.
- [ ] 3. (sau) clip thật từ Mixamo nếu muốn dáng đi tự nhiên hơn — đặt clip `idle` / `walk` trong .glb, code tự dùng.

## Kiểm tra cuối
cd web && npx tsc --noEmit && npm run build · dart tool/check.dart --changed · chụp Canvas 3D
