# Phiếu: Bộ ảnh nhiều góc NPC thủ thư Điển Thư 典書 (đầu vào dựng model 3D bằng Hunyuan3D)

- Trạng thái: chờ thiết kế
- Đã vẽ: 2026-11-13.33
- Hồ sơ khảo cứu: `docs/tham_khao/thu-thu.md` (hướng A "nữ văn sĩ trẻ, bối tử thanh lục" — Claude chọn theo luồng một bước)
- Đợi bởi: skill `/tai-nguyen nhan-vat thu-thu` (dựng `design/models/thu-thu.glb`); kế hoạch
  `docs/tasks/2026-11-13-tang-thu-cac-muon-sach.md` nhiệm vụ 10 (thủ thư cho mượn sổ từ HSK ở tầng 1 Tàng Thư Các)

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Bộ ảnh nhiều góc NPC thủ thư Điển Thư 典書 (Học Xá 3D)

Việc: tạo bộ ẢNH (không phải màn giao diện) của NPC thủ thư đứng sau quầy cho mượn sách ở tầng 1 Tàng Thư Các, để
phiên VS Code dựng model 3D bằng Hunyuan3D-2 (bản đa góc) và tô màu bằng chiếu ảnh 4 phía. Ảnh là ĐẦU VÀO cho AI dựng
hình, nên đúng yêu cầu kỹ thuật quan trọng hơn đẹp. Đọc hồ sơ docs/tham_khao/thu-thu.md trước khi tạo.

Nhân vật: nữ văn sĩ trẻ (≈ 20–25 tuổi) thời Tống, điềm đạm, gọn gàng, hiền. Lưng thẳng. Khác hẳn Mặc Ông (ông lão
áo chàm) và Tiểu Mặc (bé trai áo trắng viền xanh) — đặt cạnh hai người này một lần để so (ảnh duyệt, không giao nộp).
- TÓC: đen #1E1C1E, BÚI CAO GỌN trên đỉnh đầu (高髻), tóc là khối liền ôm đầu, mái rẽ giữa ép sát; KHÔNG lọn tóc mai rủ,
  không dải tóc bay. Một TRÂM vàng kim #D4A64A cắm ngang búi (màu tách hẳn khỏi tóc), không tua rủ.
- MẶT: mắt mở hiền (không híp), lông mày mảnh, môi mỉm nhẹ, má hồng nhạt #EBAA9C, da #F2D3BE. Trang điểm nhẹ.
- ÁO KHOÁC: BỐI TỬ (褙子) thanh lục nhạt #B9D0C2 — áo dài thẳng, CỔ ĐỐI KHÂM: hai vạt thẳng song song từ cổ xuống, MỞ
  phía trước, không cài; xẻ hai bên hông; dài tới gần mắt cá (ngắn hơn váy, thấy váy bên dưới). VIỀN lục đậm #2B5446
  chạy dọc cổ + hai vạt trước, cửa tay, gấu. Tay áo rộng vừa, rủ nhẹ.
- ÁO TRONG: giao lĩnh trắng ngà #F4F0E6, VẠT TRÁI ĐÈ VẠT PHẢI (nhìn từ trước thấy chữ "y" ở cổ — lỗi hay gặp, kiểm kỹ),
  lộ ra giữa hai vạt bối tử.
- VÁY dài lục xám #5E7F7A, chấm đất (chừa thấy mũi giày). ĐAI lục đậm #2B5446 thắt nút trước, hai dải buông ngắn.
- Bên phải đai: ngọc bội tròn xanh ngọc #8CCB9E + một THẺ BÀI gỗ nhỏ hình chữ nhật #8A5A3A khắc chữ 典, cả hai treo dây
  ngắn, DÍNH SÁT váy (không đung đưa xa thân).
- GIÀY vải gỗ sẫm #3A2418 mũi tròn.
- Hoạ tiết: tối đa MỘT dải hoạ tiết mây / hoa nhạt ở viền gấu bối tử; còn lại trơn.
- KHÔNG cầm gì (sách / bút / quạt làm vật gắn riêng sau nếu cần).
Tỉ lệ chibi như nhân vật chính (design/models/anh/nhan-vat-truoc.png): đầu ≈ 1/3 chiều cao; cao ngang nhân vật chính
(tính cả búi).

Tóc và mặt cho 3D (chỗ hay lỗi nhất):
- tóc là khối liền ôm đầu; không lọn rủ hở khỏi mặt / cổ (Hunyuan không dựng được lọn tóc tách rời → dính vào má thành
  vệt sọc); búi được, miễn liền khối;
- ranh tóc – da rõ, tóc tối đều (bóng sáng trên tóc vừa phải), da sáng đều;
- trâm màu tách khỏi tóc (không đen / xám đậm), không che mặt;
- nên có thêm 2 ảnh chếch 45°: thu-thu-truoc-trai.png, thu-thu-truoc-phai.png (cùng chuẩn hoá) — phủ vùng thái dương.

Cần 4 ảnh (bắt buộc) + 1 ảnh (nên có):
1. truoc  — nhìn THẲNG từ trước
2. trai   — nhìn NGHIÊNG từ bên trái nhân vật (profile 90°, mặt quay sang trái ảnh)
3. sau    — nhìn THẲNG từ sau (lưng búi tóc + trâm, gáy, lưng bối tử trơn có đường xẻ hông; lưng KHÔNG có ngọc bội /
            thẻ bài, không thấy vạt chéo áo trong)
4. phai   — nhìn NGHIÊNG từ bên phải nhân vật (profile 90°; thấy ngọc bội + thẻ bài bên đai)
5. mat    — cận mặt nhìn thẳng (búi + mặt), để vẽ chi tiết mặt sắc nét

Yêu cầu kỹ thuật (vì sao):
- CÙNG một tư thế, CÙNG cỡ, chân trên CÙNG một đường đất, nhân vật ở giữa ảnh — 4 góc phải ghép khít thành một khối.
- Tư thế chữ A: tay dang chéo xuống ≈ 35°, TAY ÁO KHÔNG CHẠM THÂN; hai chân hơi tách, thấy rõ hai giày — để gắn xương
  đi lại không rách, AI không dính tay vào thân.
- Phép chiếu thẳng (orthographic), KHÔNG phối cảnh xa gần, không nghiêng máy.
- KHÔNG nét viền (outline), không tô phẳng kiểu cel: nét viền làm model nổi gờ, màu nhem ở mép. Kiểu RENDER 3D đồ chơi
  (vinyl / đất sét, Pop Mart): ánh sáng studio mềm đều, có bóng khối nhẹ trên người để AI đoán độ sâu.
- Nền xám nhạt TRƠN một màu (≈ #DDDDDD), không chuyển màu, không bóng đổ dưới đất, không khung, không mây.
- KHÔNG chữ (trừ chữ 典 nhỏ trên thẻ bài), KHÔNG logo, KHÔNG watermark.
- Chuẩn hoá: PNG vuông 1024 × 1024; đỉnh búi ở 10 % chiều cao ảnh, đế giày ở 90 %; trục thân giữa ảnh; 4 góc cùng tỉ lệ.

Giao nộp (khi "chốt"):
- design/models/anh/thu-thu-truoc.png, -trai.png, -sau.png, -phai.png, -mat.png (+ -truoc-trai.png, -truoc-phai.png
  nếu có)
- design/models/LICENSES.md: dòng ảnh (công cụ tạo ảnh + phiên bản, ngày) cho bộ ảnh này
- design/CHANGELOG.md: mục mới (loại: tài nguyên 3D — ảnh đầu vào), ghi đáp phiếu 2026-11-13-anh-thu-thu
- (nên có) design/screens/ThuThu-bo-anh.png: 4 góc đặt cạnh nhau để người dùng duyệt

Luật liên quan: R-SACH-1, R-SACH-4 (thủ thư cho mượn / nhận trả sách), R-NPC-1/2 (đứng tại chỗ, nói chuyện). Mã NPC
`thu-thu` đã có trong app (`NPC_IDS`); thiếu model thì app bỏ qua NPC này.
```
