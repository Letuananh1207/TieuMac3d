# Nhân vật chibi dựng bằng code (kiểu đồ chơi) — thay model AI
- Yêu cầu: "mục tiêu của tôi là đẹp nhất có thể và phù hợp triển khai" → người dùng đồng ý (2026-11-12) hướng dựng nhân
  vật bằng code kiểu đồ chơi chibi; giữ Hunyuan cho đồ vật / công trình.
- Loại: thêm (nhân vật) · Cỡ: lớn · Trạng thái: xong (chờ thử máy)

## Nguồn thiết kế
- Nhân vật chính: ảnh người dùng tạo bằng Gemini — `design/models/anh/nhan-vat.webp` (đạo bào lam nhạt viền lam, đai
  xanh đậm, ngọc bội vòng, búi tóc dây lam + trâm vàng, ủng xanh đế trắng, tư thế chữ A).
- NPC Tiểu Mặc: tờ thiết kế người dùng gửi (2026-11-12) — tóc đuôi ngựa buộc dây đỏ, áo giao lĩnh trắng viền lục bích,
  đai đen ngọc bội, kiếm sau lưng tua đỏ, má hồng, 6 biểu cảm (chào · đọc to · suy nghĩ · vui mừng · dính mực · ngủ gật),
  đồ đội đầu theo cấp tu đạo (Đạo đồng → Thiên sư).
- **Duyệt**: người dùng duyệt bản mẫu chibi trên Canvas 3D (2026-11-14) → làm nhiệm vụ 4.

## Thiết kế trước, code sau
1. Bản mẫu trên Canvas 3D (`?nhan-vat=chibi`, `?nhan-vat=tieu-mac`, `?bieu-cam=…`, `?di=1`, `?pha=`) → người dùng
   xoay, góp ý → "chốt".
2. Chốt → nhân vật chính mặc định là chibi (model AI giữ, xem bằng `?nhan-vat=glb`), Tiểu Mặc là NPC (vị trí, lời
   thoại: kế hoạch riêng), đồ đội đầu theo cấp (cần dữ liệu cấp tu đạo — chưa có, kế hoạch riêng).

## Phạm vi (bước 1)
**Sẽ sửa**: `web/src/player/chibiCharacter.ts` (mới — bộ dựng + preset), `player/chibiFace.ts` (mới — vẽ mặt + biểu cảm
bằng canvas), `player/playerCharacter.ts` (lựa chọn `chibi`, `tieu-mac`, `glb`), `designPreview.ts` (`?bieu-cam=`).
**Không đụng**: `PlayerController`, va chạm (bán kính 0,5), cao ~2,1 m như cũ, luật.

## Nhiệm vụ
- [x] 1. Bộ dựng chibi: đầu tròn (½ chiều cao), mặt vẽ, tóc + búi / đuôi ngựa, áo xoè (lathe) viền, giao lĩnh, đai,
      ngọc bội, tay áo rộng + bàn tay, ủng; tay / chân / đầu là khớp riêng → đi, đứng, thở. Gộp khối theo màu trong từng
      khớp (≈ 6–8 draw call). Preset: đệ tử (nhân vật chính), Tiểu Mặc (+ kiếm sau lưng).
- [x] 2. 7 biểu cảm (bình thường + 6 của tờ thiết kế) vẽ bằng canvas, đổi tức thì.
- [x] 3. Canvas 3D (bản 17): chụp trước / nghiêng / sau / đi + bảng biểu cảm → người dùng duyệt.
- [x] 4. (sau chốt) mặc định chibi, `npm run build`, thử máy.
      `playerCharacter.ts`: không có / khác `?nhan-vat=` → đệ tử chibi; `glb` = model AI (lỗi / không file → đệ tử
      khối), `khoi`, `gau`, `tieu-mac` giữ. Canvas 3D bỏ mặc định riêng, theo app. Đo (2026-11-14, đếm mesh trong
      vitest tạm): đệ tử 21 draw call · 8,4k tam giác; Tiểu Mặc 23 · 8,3k — **vượt** ước ≈ 6–8 draw call và ngân sách
      5k tam giác (kế hoạch thiết kế 3D); vẫn nhẹ hơn model AI (9,5k). Gộp thêm khối: việc sau nếu máy thật giật.
      Chibi chưa có dáng nhảy / ngồi thiền / chào (`CharacterState` — chỉ nhân vật `.glb` có): thử máy để xem có cần.
- [x] 5. Dáng chibi (V-20261114-06, người dùng chọn "làm dáng cho chibi" 2026-11-14): chạy (R-DIEU-5 — nhịp bước theo
      tốc độ thật, đổ người, vung mạnh), nhảy (R-DIEU-6 — tay giang, gối co), ngồi xếp bằng (R-DIEU-7 — thân hạ 0,28 m
      như nhân vật cũ / camera, ống chân bắt chéo, ủng thò dưới gấu áo, cúi nhìn; hai tay cầm hai đầu cuộn sách Ngồi ôn
      R-ON-8), chào 拱手 (chắp tay trước ngực, cúi quanh hông), đứng lâu (R-DIEU-8 — vươn vai / nhìn quanh) — qua hợp đồng
      `Character` (`CharacterState`), không sửa `PlayerController`, không thêm khối (draw call như cũ).
      Góc khớp: `player/chibiPose.ts` (hàm thuần — độ hoà trạng thái → góc, nội suy tuyến tính trên độ hoà đã mượt, tay /
      chân nhắm điểm bằng `aimArm`) + `chibiPose.test.ts`. Tay + đầu gắn vào thân (cúi / ngồi kéo theo); chân xoay ZXY.
      Chỗ cầm cuộn đưa ra `cuonSachNhip.ts` (`CUON_CAO`, `CUON_TRUOC` 0,55 / 0,55 — trước là 0,30 / 0,18, nằm lọt trong
      thân áo nhân vật cao 2,1 m) để dáng tay tính theo. Canvas 3D: `?dang=ngoi` hiện cả cuộn sách mở hết.
      Kiểm nhìn: chụp Canvas 3D tại máy `?dang=ngoi|chao|nhay|chay|vuon|nhin` (đệ tử + Tiểu Mặc). Thử máy: ngồi ôn,
      chào, nhảy, đứng chờ 6 s; ngồi bồ đoàn / sập trà (độ cao chỗ ngồi); camera sau lưng gần như không thấy cuộn (đầu
      chibi to che) — nếu cần thấy thì chỉnh camera ngồi ôn (việc riêng).

## Kiểm tra cuối
cd web && npx tsc --noEmit && npm run build · dart tool/check.dart --changed · chụp Canvas 3D (draw call nhân vật)
