# Nhân vật chibi dựng bằng code (kiểu đồ chơi) — thay model AI
- Yêu cầu: "mục tiêu của tôi là đẹp nhất có thể và phù hợp triển khai" → người dùng đồng ý (2026-11-12) hướng dựng nhân
  vật bằng code kiểu đồ chơi chibi; giữ Hunyuan cho đồ vật / công trình.
- Loại: thêm (nhân vật) · Cỡ: lớn · Trạng thái: đang làm (bước 1: bản mẫu trên Canvas 3D chờ duyệt)

## Nguồn thiết kế
- Nhân vật chính: ảnh người dùng tạo bằng Gemini — `design/models/anh/nhan-vat.webp` (đạo bào lam nhạt viền lam, đai
  xanh đậm, ngọc bội vòng, búi tóc dây lam + trâm vàng, ủng xanh đế trắng, tư thế chữ A).
- NPC Tiểu Mặc: tờ thiết kế người dùng gửi (2026-11-12) — tóc đuôi ngựa buộc dây đỏ, áo giao lĩnh trắng viền lục bích,
  đai đen ngọc bội, kiếm sau lưng tua đỏ, má hồng, 6 biểu cảm (chào · đọc to · suy nghĩ · vui mừng · dính mực · ngủ gật),
  đồ đội đầu theo cấp tu đạo (Đạo đồng → Thiên sư).

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
- [ ] 4. (sau chốt) mặc định chibi, `npm run build`, thử máy.

## Kiểm tra cuối
cd web && npx tsc --noEmit && npm run build · dart tool/check.dart --changed · chụp Canvas 3D (draw call nhân vật)
