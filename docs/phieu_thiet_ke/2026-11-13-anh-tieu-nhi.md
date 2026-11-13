# Phiếu: Bộ ảnh nhiều góc NPC Tiểu nhị 小二 (đầu vào dựng model 3D bằng Hunyuan3D)

- Trạng thái: chờ thiết kế
- Hồ sơ khảo cứu: chưa có — nên chạy `/khao-cuu tiểu nhị trà lâu thời Tống` trước nếu muốn sát cổ trang hơn; mô tả dưới đây là bản đầu.
- Đợi bởi: `/tai-nguyen nhan-vat tieu-nhi` (dựng `design/models/tieu-nhi.glb`, 8 000 tam giác) — kế hoạch
  `docs/tasks/2026-11-13-npc-cong-trinh.md`

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Bộ ảnh nhiều góc NPC Tiểu nhị 小二 (Học Xá 3D)

Việc: tạo bộ ẢNH (không phải màn giao diện) của NPC người hầu bàn trẻ của trà lâu Phẩm Minh Các 品茗閣 (đứng sau quầy trà tầng 1), để phiên VS Code dựng model 3D bằng Hunyuan3D-2
(bản đa góc) và tô màu bằng chiếu ảnh 4 phía. Ảnh là ĐẦU VÀO cho AI dựng hình, nên đúng yêu cầu kỹ thuật quan trọng
hơn đẹp. Cùng phong cách với Tiểu Mặc, Mặc Ông (design/models/anh/).

Nhân vật: tiểu nhị trẻ (≈ 16–18 tuổi) thời Tống, lanh lợi, cười tươi lộ răng, dáng nhanh nhẹn.
- ĐẦU: khăn vấn đầu vải mềm (軟巾) màu nâu xám #6B5E52, buộc gọn, hai dải ngắn sau gáy; tóc đen búi trong khăn.
- MẶT: mắt to tròn, lông mày rậm, má hồng #E9A99A, da #F0CDB5.
- ÁO: áo ngắn chẽn tay (短褐) màu lam nhạt #8FA9C2, cổ giao lĩnh VẠT TRÁI ĐÈ VẠT PHẢI (nhìn từ trước thấy chữ "y"),
  tay áo xắn tới khuỷu.
- TẠP DỀ trắng ngà #EFE8DA từ thắt lưng tới gối, buộc dây sau lưng.
- KHĂN trắng #F7F5F0 vắt trên vai trái.
- QUẦN nâu #5A4636 bó ống bằng xà cạp trắng; GIÀY vải đen #26262A.
- KHÔNG cầm gì (ấm trà / khay làm vật gắn riêng sau — đợt "tiểu nhị mang trà").
Tỉ lệ chibi như nhân vật chính (design/models/anh/nhan-vat-truoc.png): đầu ≈ 1/3 chiều cao; thấp hơn nhân vật chính ≈ 3–5 %. Đặt cạnh nhân
vật chính một lần để so cỡ (ảnh duyệt, không giao nộp).

Cần 4 ảnh (bắt buộc) + 1 ảnh (nên có):
1. truoc  — nhìn THẲNG từ trước
2. trai   — nhìn NGHIÊNG từ bên trái nhân vật (profile 90°, mặt quay sang trái ảnh)
3. sau    — nhìn THẲNG từ sau (lưng áo trơn, nút tạp dề sau lưng, khăn vắt vai rủ sau)
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
- design/models/anh/tieu-nhi-truoc.png, -trai.png, -sau.png, -phai.png, -mat.png
- design/models/LICENSES.md: dòng ảnh (công cụ tạo ảnh + phiên bản, ngày) cho bộ ảnh này
- design/CHANGELOG.md: mục mới (loại: tài nguyên 3D — ảnh đầu vào), ghi đáp phiếu 2026-11-13-anh-tieu-nhi
- (nên có) design/screens/TieuNhi-bo-anh.png: 4 góc đặt cạnh nhau để người dùng duyệt

Luật liên quan: R-NPC-3 (lời thoại — đã có trong code). Model thiếu thì NPC bị bỏ qua, cảnh vẫn chạy (R-NPC-1); đặt NPC
vào cảnh (design/scene/scene.json `npcs`) là việc /canh sau khi có model.
```
