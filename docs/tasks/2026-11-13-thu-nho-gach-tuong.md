# Thu nhỏ khu đất, sửa lối đá bị cắt, gạch xanh xám + tường vôi
- Yêu cầu: "tỉ lệ và kích thước của vùng đất đang quá lớn tôi muốn thu hẹp lại và ngoài ra ở góc nhìn gần cũng đang
  xảy ra lỗi khi đường đi bị cắt như ảnh, tôi cũng muốn cải thiện chất lượng của các viên gạch và tường"
- Loại: sửa lỗi + bố cục cảnh + giao diện cảnh · Cỡ: lớn · Trạng thái: xong
- Đã chọn (2026-11-13): thu ×0,625 (bỏ lần phóng ×1,6 của 2026-11-11.11) · nhà / cổng / tường / đồ / cây giữ cỡ, chỉ
  khoảng cách ngắn lại (địa hình thu cả chiều cao để giữ độ dốc) · sân gạch xanh xám cổ (青磚) + tường vôi.

## Nhiệm vụ
- [x] 1. L-3: `scene/paths.ts` — lối đá bám mặt đất (chia đoạn).
- [x] 2. Gạch sân + gạch lối + tường vôi: texture mới (`scene/textures.ts`, `terrain.ts`, `kien_truc/tuong.ts`), màu qua đặc tả.
- [x] 3. `design/scene/scene.json` thu ×0,625 (làm thay `/canh`), sửa chỗ chồng / tràn bục theo `scene:check`.
- [x] 4. Sổ quy tắc: cập nhật toạ độ trong ví dụ (R-VUNG-1, R-VA-1, R-VA-3, R-HUD-1, R-HUD-3, R-NPC-1) → online → mark-synced.
- [x] 5. Chụp Canvas 3D so trước / sau, build, CHANGELOG.
