# Phiếu: Bộ ảnh nhiều góc NPC Trận sư 陣師 (đầu vào dựng model 3D bằng Hunyuan3D)

- Trạng thái: chờ thiết kế
- Đã vẽ: 2026-11-14.19 (hướng A theo `docs/tham_khao/tran-su.md`; ảnh trái = lật gương ảnh phải)
- Hồ sơ khảo cứu: `docs/tham_khao/tran-su.md` (đã chọn hướng A — người dùng 2026-11-14).
- Đợi bởi: `/tai-nguyen nhan-vat tran-su` (dựng `design/models/tran-su.glb`, 8 000 tam giác) — kế hoạch
  `docs/tasks/2026-11-13-npc-cong-trinh.md`

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Bộ ảnh nhiều góc NPC Trận sư 陣師 (Học Xá 3D)

Việc: tạo bộ ẢNH (không phải màn giao diện) của NPC người giữ trận đồ Truyền Tống Đài 傳送臺 — đọc tiến độ học, chỉ vùng sắp mở, để phiên VS Code dựng model 3D bằng Hunyuan3D-2
(bản đa góc) và tô màu bằng chiếu ảnh 4 phía. Ảnh là ĐẦU VÀO cho AI dựng hình, nên đúng yêu cầu kỹ thuật quan trọng
hơn đẹp. Cùng phong cách với Tiểu Mặc, Mặc Ông (design/models/anh/).

Nhân vật: đạo sĩ trận pháp trung niên (≈ 45 tuổi), trầm tĩnh, gầy, lưng thẳng, mắt sáng.
- ĐẦU: tóc đen búi đỉnh, cài mão đạo sĩ nhỏ (蓮花冠) màu gỗ vàng #B8945A xuyên trâm; tóc mai đen.
- MẶT: mắt dài nhìn thẳng, lông mày xếch nhẹ, râu dê đen ngắn ở cằm (khối liền), da #EBC4A8.
- ÁO: đạo bào (道袍) xám tro #6E7378 dài chấm đất (chừa thấy mũi giày), tay áo rộng, VIỀN đen #26262A ở cổ, vạt, cửa
  tay, gấu; cổ giao lĩnh VẠT TRÁI ĐÈ VẠT PHẢI, cổ lót trắng.
- ĐAI vải vàng đất #C9A35A thắt nút trước, hai dải buông; một ngọc bội vuông xanh ngọc #8CCB9E bên trái đai.
- Hoạ tiết: MỘT vòng bát quái đơn giản (vòng tròn + 8 vạch quẻ) màu vàng đất giữa lưng; mặt trước trơn.
- GIÀY vải đen mũi vuông đế trắng.
- KHÔNG cầm gì (la bàn / phất trần làm vật gắn riêng sau).
Tỉ lệ chibi như nhân vật chính (design/models/anh/nhan-vat-truoc.png): đầu ≈ 1/3 chiều cao; cao hơn nhân vật chính ≈ 8 %. Đặt cạnh nhân
vật chính một lần để so cỡ (ảnh duyệt, không giao nộp).

Cần 4 ảnh (bắt buộc) + 1 ảnh (nên có):
1. truoc  — nhìn THẲNG từ trước
2. trai   — nhìn NGHIÊNG từ bên trái nhân vật (profile 90°, mặt quay sang trái ảnh)
3. sau    — nhìn THẲNG từ sau (lưng đạo bào có MỘT vòng bát quái đơn giản lớn giữa lưng, búi tóc + mão sau đầu)
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
- design/models/anh/tran-su-truoc.png, -trai.png, -sau.png, -phai.png, -mat.png
- design/models/LICENSES.md: dòng ảnh (công cụ tạo ảnh + phiên bản, ngày) cho bộ ảnh này
- design/CHANGELOG.md: mục mới (loại: tài nguyên 3D — ảnh đầu vào), ghi đáp phiếu 2026-11-13-anh-tran-su
- (nên có) design/screens/TranSu-bo-anh.png: 4 góc đặt cạnh nhau để người dùng duyệt

Luật liên quan: R-NPC-5 (lời thoại — đã có trong code). Model thiếu thì NPC bị bỏ qua, cảnh vẫn chạy (R-NPC-1); đặt NPC
vào cảnh (design/scene/scene.json `npcs`) là việc /canh sau khi có model.
```
