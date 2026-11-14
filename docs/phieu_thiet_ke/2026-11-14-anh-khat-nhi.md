# Phiếu: Bộ ảnh nhiều góc NPC Tiểu Khất, cậu bé ăn xin (đầu vào dựng model 3D bằng Hunyuan3D)

- Trạng thái: chờ thiết kế
- Hồ sơ khảo cứu: `docs/tham_khao/khat-nhi-go-mo.md`, hướng A "cậu bé lanh lợi, áo vá nhiều màu" (Claude chọn, một bước)
- Đợi bởi: `/tai-nguyen nhan-vat khat-nhi` (dựng `design/models/khat-nhi.glb`, 8 000 tam giác). Kế hoạch
  `docs/tasks/2026-11-14-npc-khat-nhi-go-mo.md` (V-20261114-31)

## Dán vào canvas

```text
PHIẾU THIẾT KẾ: Bộ ảnh nhiều góc NPC Tiểu Khất, cậu bé ăn xin (Học Xá 3D)

Việc: tạo bộ ẢNH (không phải màn giao diện) của NPC cậu bé ăn xin ngồi trước Tạp hoá ở Khởi Nguyên Trấn. Phiên VS Code
dùng bộ ảnh này để dựng model 3D bằng Hunyuan3D-2 (bản đa góc) rồi tô màu bằng cách chiếu ảnh từ 4 phía. Ảnh là ĐẦU VÀO
cho AI dựng hình, nên đúng yêu cầu kỹ thuật quan trọng hơn đẹp. Vẽ cùng phong cách với Tiểu Mặc, Mặc Ông, tiểu nhị
(design/models/anh/).

Nhân vật: cậu bé ăn xin ≈ 9–10 tuổi thời Tống. Lanh lợi, láu lỉnh, vui tính, là "người biết mọi tin vặt trong trấn".
Dễ thương. KHÔNG bi thảm, KHÔNG gầy gò, KHÔNG bẩn ghê người, KHÔNG khóc (đây là game cho người học).
- ĐẦU: tóc đen buộc MỘT túm chỏm nhỏ trên đỉnh bằng dây rơm #D2B06E. Tóc là khối liền ôm đầu, tóc mai ngắn ép sát má,
  KHÔNG có lọn rủ hở khỏi mặt / cổ. Ranh tóc với da rõ. Dây rơm khác màu hẳn với tóc.
- MẶT: mắt to tròn sáng, lông mày rậm, cười hở răng kiểu láu lỉnh. Da hơi rám #E9C2A4, má hồng #E39C8C, một vệt lấm nhỏ
  trên má phải (vệt nhạt, không làm bẩn cả mặt).
- ÁO: áo ngắn tới hông, vải gai bạc màu #9C8664, cổ giao lĩnh VẠT TRÁI ĐÈ VẠT PHẢI (nhìn từ trước cổ áo thành chữ "y"),
  tay áo ngắn tới khuỷu, mép áo hơi sờn. Đai là dây rơm #D2B06E buộc ngang eo.
- MIẾNG VÁ: to, rõ, vuông vức, ĐÚNG CHỖ ở mọi góc ảnh:
  · ngực trái của nhân vật: vá xanh rêu #6F8A6A
  · khuỷu tay phải: vá vàng đất #C29A5E
  · giữa lưng: vá chàm bạc #5E6E86 (to nhất, thấy rõ từ ảnh sau)
  · gối trái của quần: vá vàng đất #C29A5E
- QUẦN: quần ngắn tới gối, ống xắn, nâu #5A4A3A.
- CHÂN: dép rơm #D2B06E, quai buộc qua cổ chân, thấy rõ ngón chân. Không đi giày.
- TAY KHÔNG. Không cầm bát, gậy, túi hay bất cứ thứ gì. Bát và gậy dựng riêng bằng code.
- KHÔNG có chữ (Hán hay Việt) trên áo.
Tỉ lệ chibi như nhân vật chính (design/models/anh/nhan-vat-truoc.png): đầu ≈ 1/3 chiều cao. Người NHỎ: trong game cao
≈ 0,8 lần nhân vật chính (trong ảnh vẫn chuẩn hoá đỉnh tóc 10 %, chân 90 % như mọi bộ ảnh; cỡ chỉnh trong code). Đặt
cạnh nhân vật chính một lần để so cỡ (ảnh duyệt, không giao nộp).

Cần 4 ảnh (bắt buộc) + 1 ảnh (nên có) + 1 ảnh tham khảo:
1. truoc  : nhìn THẲNG từ trước
2. trai   : nhìn NGHIÊNG từ bên trái nhân vật (profile 90°, mặt quay sang trái ảnh)
3. sau    : nhìn THẲNG từ sau (chỏm tóc, gáy, miếng vá chàm giữa lưng, nút dây rơm sau eo)
4. phai   : nhìn NGHIÊNG từ bên phải nhân vật (profile 90°)
5. mat    : cận mặt nhìn thẳng (đầu + cổ), để vẽ chi tiết mặt sắc nét; dùng luôn làm ảnh mặt trên khung thoại
6. dao-cu : (ảnh tham khảo cho code, KHÔNG đưa vào Hunyuan) bát gỗ sứt miệng #8A6A48 và gậy trúc #8FA05A dài ≈ 1,1 m,
            đặt cạnh nhau trên nền trơn, nhìn chếch 3/4

Yêu cầu kỹ thuật (vì sao):
- CÙNG một tư thế, CÙNG cỡ, chân trên CÙNG một đường đất, nhân vật ở giữa ảnh, để 4 góc ghép khít thành một khối.
- Tư thế chữ A: tay dang chéo xuống ≈ 35°, TAY ÁO KHÔNG CHẠM THÂN; hai chân hơi tách, thấy rõ hai bàn chân. Như vậy gắn
  xương mới không rách (trong game bé NGỒI xếp bằng bằng xương tự gắn) và AI không dính tay vào thân.
- Phép chiếu thẳng (orthographic), KHÔNG phối cảnh xa gần, không nghiêng máy.
- KHÔNG nét viền (outline), không tô phẳng kiểu cel. Kiểu RENDER 3D đồ chơi (vinyl / đất sét, Pop Mart): ánh sáng
  studio mềm đều, có bóng khối nhẹ trên người để AI đoán độ sâu.
- Nền xám nhạt TRƠN một màu (≈ #DDDDDD), không chuyển màu, không bóng đổ dưới đất, không khung.
- KHÔNG chữ, KHÔNG logo, KHÔNG watermark.
- Chuẩn hoá: PNG vuông 1024 × 1024; đỉnh chỏm tóc ở 10 % chiều cao ảnh, đế dép ở 90 %; trục thân giữa ảnh; 4 góc cùng tỉ lệ.
- Ít chi tiết nhỏ (model NPC chỉ 8 000 tam giác): mảng màu lớn, rõ. Miếng vá là mảng màu, không cần đường chỉ.
- (nên có) thêm 2 ảnh chếch 45°: khat-nhi-truoc-trai.png, khat-nhi-truoc-phai.png, cùng chuẩn hoá, để phủ vùng thái dương.

Giao nộp (khi "chốt"):
- design/models/anh/khat-nhi-truoc.png, -trai.png, -sau.png, -phai.png, -mat.png (+ -dao-cu.png, + 2 ảnh 45° nếu có)
- design/models/LICENSES.md: dòng ảnh (công cụ tạo ảnh + phiên bản, ngày) cho bộ ảnh này
- design/CHANGELOG.md: mục mới (loại: tài nguyên 3D, ảnh đầu vào), ghi đáp phiếu 2026-11-14-anh-khat-nhi
- (nên có) design/screens/KhatNhi-bo-anh.png: 4 góc đặt cạnh nhau để người dùng duyệt

Luật liên quan: R-NPC-6 (nháp: chỗ ngồi, xin tiền mỗi ngày một lần, tin đồn), R-TIEN-8 (nháp: cho Văn tiền). Model thiếu thì
NPC bị bỏ qua, cảnh vẫn chạy (R-NPC-1). Tên hiện trong game: "Tiểu Khất" (chỉ tiếng Việt, không chữ Hán).
```
