# Phiếu: Bộ ảnh nhiều góc NPC Quản sự Kỳ Văn Uyển 管事 (đầu vào dựng model 3D bằng Hunyuan3D)

- Trạng thái: chờ thiết kế
- Đã vẽ: 2026-11-14.18
- Hồ sơ khảo cứu: `docs/tham_khao/npc-ky-van-uyen.md` — **người dùng đổi nhân vật (2026-11-14): "một người trẻ năng động", chọn hướng C thiếu nữ ≈ 16 tuổi, mặt dịu dàng** (hai búi dải ngọc, áo ngắn hồng đào viền ngọc lục, váy ngắn + quần bó). Mô tả quản sự trung niên bên dưới KHÔNG còn dùng; mã NPC giữ `quan-su`; câu lệnh thật ở ghi chú `quan-su-cau-lenh` (`design/source/canvas.json`).
- Đợi bởi: `/tai-nguyen nhan-vat quan-su` (dựng `design/models/quan-su.glb`, 8 000 tam giác) — kế hoạch
  `docs/tasks/2026-11-13-npc-cong-trinh.md`

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Bộ ảnh nhiều góc NPC Quản sự Kỳ Văn Uyển 管事 (Học Xá 3D)

Việc: tạo bộ ẢNH (không phải màn giao diện) của NPC người trông coi khu giao lưu Kỳ Văn Uyển 棋文苑 (bàn cờ Ngũ Tử Kỳ, bàn Đấu chữ), để phiên VS Code dựng model 3D bằng Hunyuan3D-2
(bản đa góc) và tô màu bằng chiếu ảnh 4 phía. Ảnh là ĐẦU VÀO cho AI dựng hình, nên đúng yêu cầu kỹ thuật quan trọng
hơn đẹp. Cùng phong cách với Tiểu Mặc, Mặc Ông (design/models/anh/).

Nhân vật: quản sự trung niên (≈ 40 tuổi) thời Tống, chừng mực, nghiêm mà hoà nhã, lưng thẳng.
- ĐẦU: mũ phốc đầu mềm (軟腳幞頭) vải đen #26262A, hai dải mũ mềm rủ sau gáy (không có cánh cứng ngang).
- MẶT: mắt dài, mỉm cười nhẹ, râu ngắn đen gọn trên môi và cằm (khối liền, không sợi lẻ), da #EBC4A8.
- ÁO: viên lĩnh bào (圓領袍) cổ tròn màu chàm xám #4A5A6A dài quá gối, tay áo vừa (không thụng như Mặc Ông),
  cổ áo lót trắng lộ ở cổ tròn.
- ĐAI da nâu #5A3A24 có khoá đồng #C9A35A; một túi gấm nhỏ đỏ son #9C3B2E treo bên phải đai.
- QUẦN trắng ngà lộ dưới gấu áo; GIÀY ủng vải đen #26262A mũi tròn.
- Hoạ tiết: một dải viền vàng nhạt #D9C38A ở gấu và cửa tay; còn lại trơn.
- KHÔNG cầm gì (sổ / bàn tính làm vật gắn riêng sau).
Tỉ lệ chibi như nhân vật chính (design/models/anh/nhan-vat-truoc.png): đầu ≈ 1/3 chiều cao; cao hơn nhân vật chính ≈ 5 %. Đặt cạnh nhân
vật chính một lần để so cỡ (ảnh duyệt, không giao nộp).

Cần 4 ảnh (bắt buộc) + 1 ảnh (nên có):
1. truoc  — nhìn THẲNG từ trước
2. trai   — nhìn NGHIÊNG từ bên trái nhân vật (profile 90°, mặt quay sang trái ảnh)
3. sau    — nhìn THẲNG từ sau (lưng áo bào trơn, gáy mũ, hai dải mũ rủ)
4. phai   — nhìn NGHIÊNG từ bên phải nhân vật (profile 90°)
5. mat    — cận mặt nhìn thẳng, để vẽ chi tiết mặt sắc nét

Yêu cầu kỹ thuật (vì sao):
- CÙNG một tư thế, CÙNG cỡ, chân trên CÙNG một đường đất, nhân vật ở giữa ảnh — 4 góc phải ghép khít thành một khối.
- Tư thế chữ A: tay dang chéo xuống ≈ 35°, TAY ÁO KHÔNG CHẠM THÂN; hai chân hơi tách, thấy rõ hai giày — để gắn xương
  không rách, AI không dính tay vào thân.
- Phép chiếu thẳng (orthographic), KHÔNG phối cảnh xa gần, không nghiêng máy.
- KHÔNG nét viền (outline), không tô phẳng kiểu cel. Kiểu RENDER 3D đồ chơi (vinyl / đất sét, Pop Mart): ánh sáng
  studio mềm đều, có bóng khối nhẹ trên người để AI đoán độ sâu.
- Nền xám nhạt TRƠN một màu (≈ #DDDDDD), không chuyển màu, không bóng đổ dưới đất, không khung.
- KHÔNG chữ, KHÔNG logo, KHÔNG watermark.
- Chuẩn hoá: PNG vuông 1024 × 1024; đỉnh đầu / mũ ở 10 % chiều cao ảnh, đế giày ở 90 %; trục thân giữa ảnh.
- Ít chi tiết nhỏ (model NPC chỉ 8 000 tam giác — kế hoạch docs/tasks/2026-11-13-npc-cong-trinh.md): mảng màu lớn, rõ.

Giao nộp (khi "chốt"):
- design/models/anh/quan-su-truoc.png, -trai.png, -sau.png, -phai.png, -mat.png
- design/models/LICENSES.md: dòng ảnh (công cụ tạo ảnh + phiên bản, ngày) cho bộ ảnh này
- design/CHANGELOG.md: mục mới (loại: tài nguyên 3D — ảnh đầu vào), ghi đáp phiếu 2026-11-13-anh-quan-su
- (nên có) design/screens/QuanSu-bo-anh.png: 4 góc đặt cạnh nhau để người dùng duyệt

Luật liên quan: R-NPC-4 (lời thoại — đã có trong code). Model thiếu thì NPC bị bỏ qua, cảnh vẫn chạy (R-NPC-1); đặt NPC
vào cảnh (design/scene/scene.json `npcs`) là việc /canh sau khi có model.
```
