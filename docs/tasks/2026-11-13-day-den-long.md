# Dây đèn lồng đỏ trên sân Kỳ Văn Uyển
- Yêu cầu: "đặt vào linh dược viên và đổi tên linh dược viên vì giờ không dùng nữa ngoài ra không cần cổng cho phần vui chơi và phía trên nên giăng dây đỏ hay gì đó văn hóa trung hoa"
- Loại: thêm (kiểu vật cảnh mới) · Cỡ: vừa · Trạng thái: xong

## Phạm vi
**Sẽ sửa** `web/src/scene/spec.ts` (trường `lanternStrings`, `lanternStyle` + mặc định rỗng — cảnh cũ giữ nguyên) ·
`web/src/scene/specCheck.ts` (đọc danh sách, kiểm độ cao đèn thấp nhất ≥ 2,4 m, dây ≥ 2 m) ·
`web/src/scene/dayDenLong.ts` (mới: cột gỗ, dây võng, đèn lồng) · `web/src/scene/world.ts` (ghép).
Bố cục (`design/scene/scene.json`, việc `/canh`): sân quây tường x −52…−28, z 0…18 ở chỗ vườn thuốc cũ, khe mặt bắc
6 m không cổng; khu "Linh Dược Viên" đổi thành "Kỳ Văn Uyển 棋文苑"; 4 dây đèn.
**Không đụng** luật chơi bàn (R-GIAO-1, R-CO-*, R-DAU-*), cầu nối.

## Nhiệm vụ
- [x] 1. Trường đặc tả + kiểm (spec.ts, specCheck.ts · scene) — xong khi `scene:check` sạch.
- [x] 2. `dayDenLong.ts` + ghép `world.ts` (scene) — xong khi Canvas 3D thấy dây đèn, ngân sách ≤ 150 draw call / 150k tam giác.
- [x] 3. `npm run build`.

## Kết quả
- Dây võng parabol (14 đoạn), đèn trụ 6 cạnh + chóp + tua vàng cách 1,8 m; cột cao 4,6 m có vật cản tròn 0,3 m.
- Đo: trên xuống 106 draw call · 149 898 tam giác; trong sân 70 · 91 560 (đã bớt 2 tùng mỗi cụm núi xa để vừa trần).
- Đợt 2 (người dùng: "thay tường … hợp lý hơn", "đèn lồng không đan chéo … dây tua rua … trần cao", "quây tường toàn bộ
  phần có gạch"): `lanternStyle.hang` `den | tua` + `drop` + `lanternEvery`; trường mới `fences` + `fenceStyle`
  (`scene/lanCan.ts` — lan can gỗ son thấp 1 m, trụ chóp vàng, vật cản dày 0,3). Sân Kỳ Văn Uyển: tường → lan can, 4 dây
  song song cao 6,5 m, dải tua 1,4 m, cứ 4 dải 1 đèn. Tường vôi (wallSegments) bao cả khu lát gạch phía tây
  (x −61…−21, z −46…22, gồm Tàng Thư Các), một bục lát chung; vào qua cổng tây Ngoại Môn.
  Đo: trên xuống 108 draw call · 149 926 tam giác; trong sân 74 · 123 588.
- Còn: R-GIAO-1 còn ví dụ toạ độ cũ (−22; 34) → khi chốt sửa sổ thành bàn cờ (−45; 9), bàn Đấu chữ (−33; 9).
