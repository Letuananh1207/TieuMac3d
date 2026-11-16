# Phiếu: Bộ ảnh nhiều góc của nhân vật chính (đầu vào dựng model 3D bằng Hunyuan3D)

- Trạng thái: đã dựng model (Tripo, 2026-11-16)
- Đã vẽ: 2026-11-12.3 (đợt 1 — nhân vật chính; Tiểu Mặc chưa)
- Đã vẽ: 2026-11-12.13 (đợt 2 — Tiểu Mặc; ảnh sau thiếu dây đỏ, đã chấp nhận)
- Đợi bởi: skill `/tai-nguyen` — nâng model `design/models/nhan-vat.glb` (hiện màu loang ở hông / lưng vì chỉ có ảnh mặt
  trước, xem `design/CHANGELOG.md` mục 2026-11-12.2)

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Bộ ảnh nhiều góc của nhân vật chính (Học Xá 3D)

Việc: vẽ / tạo bộ ẢNH (không phải màn giao diện) của nhân vật chính để phiên VS Code dựng model 3D bằng Hunyuan3D-2
(bản đa góc) và tô màu bằng chiếu ảnh 4 phía. Ảnh là ĐẦU VÀO cho AI dựng hình — đúng yêu cầu kỹ thuật quan trọng hơn đẹp.

Nhân vật: đệ tử nhân vật chính — giữ ĐÚNG thiết kế ảnh design/models/anh/nhan-vat.webp (người dùng tạo bằng Gemini):
- đạo bào lam nhạt (≈ #C9D6E3) viền lam (≈ #4D6DB2) ở cổ giao lĩnh, cổ tay áo, vạt trước, gấu áo; cổ áo lót trắng;
- cổ giao lĩnh: VẠT TRÁI ĐÈ VẠT PHẢI (lỗi hay gặp — xem docs/tham_khao/, khảo cứu trang phục);
- đai lưng xanh đậm (≈ #33456D), ngọc bội vòng tròn xanh ngọc (≈ #8CCB9E) treo dây lam bên phải đai;
- tóc đen búi trên đỉnh, dây buộc búi lam, trâm vàng (≈ #E2B24C) xuyên ngang búi;
- ủng xanh đậm đế trắng; da ≈ #F6D3BD; mặt: mắt đen mở, lông mày, miệng nhỏ, bình thường (không biểu cảm mạnh).
Tỉ lệ chibi như ảnh gốc: đầu ≈ 1/3 chiều cao.

Cần 4 ảnh (bắt buộc) + 1 ảnh (nên có):
1. truoc  — nhìn THẲNG từ trước
2. trai   — nhìn NGHIÊNG từ bên trái nhân vật (profile 90°)
3. sau    — nhìn THẲNG từ sau (lưng: búi tóc, gáy, đai, lưng áo — lưng KHÔNG có ngọc bội, không có vạt chéo)
4. phai   — nhìn NGHIÊNG từ bên phải nhân vật (profile 90°)
5. mat    — cận mặt nhìn thẳng (đầu + cổ), để vẽ chi tiết mặt sắc nét

Yêu cầu kỹ thuật (vì sao):
- CÙNG một tư thế, CÙNG cỡ, chân trên CÙNG một đường đất, nhân vật ở giữa ảnh — 4 góc phải ghép khít thành một khối.
- Tư thế chữ A: tay dang chéo xuống ≈ 35°, TAY ÁO KHÔNG CHẠM THÂN; hai chân hơi tách, thấy rõ hai ủng — để gắn xương đi lại
  không rách, AI không dính tay vào thân.
- Phép chiếu thẳng (orthographic), KHÔNG phối cảnh xa gần, không nghiêng máy.
- KHÔNG nét viền (outline), không tô phẳng kiểu cel: nét viền làm model nổi gờ, màu nhem ở mép. Kiểu RENDER 3D đồ chơi
  (vinyl / đất sét, Pop Mart): ánh sáng studio mềm đều, có bóng khối nhẹ trên người để AI đoán độ sâu.
- Nền xám nhạt TRƠN một màu (≈ #DDDDDD), không chuyển màu, không bóng đổ dưới đất, không khung, không mây.
- KHÔNG chữ, KHÔNG logo, KHÔNG watermark (ảnh Gemini trước có ngôi sao mờ ở góc — phải bỏ).
- PNG vuông 1024 × 1024 (ảnh mat có thể 1024 × 1024 riêng). Nhân vật chiếm ≈ 80 % chiều cao ảnh, chừa lề đều.

Giao nộp (khi "chốt"):
- design/models/anh/nhan-vat-truoc.png, -trai.png, -sau.png, -phai.png, -mat.png
- design/models/LICENSES.md: thêm cột ảnh (công cụ tạo ảnh + phiên bản, ngày) cho bộ ảnh này
- design/CHANGELOG.md: mục mới (loại: tài nguyên 3D — ảnh đầu vào), ghi đáp phiếu 2026-11-12-anh-nhan-vat-3d
- (nên có) design/screens/NhanVat-bo-anh.png: 4 góc đặt cạnh nhau để người dùng duyệt

Đợt 2 (sau, cùng yêu cầu kỹ thuật): NPC Tiểu Mặc — theo tờ thiết kế "小墨 Tiểu Mặc" người dùng đã có (tóc đuôi ngựa dây
đỏ, áo trắng viền lục bích, đai đen, kiếm sau lưng tua đỏ, má hồng). Đặt tên design/models/anh/tieu-mac-*.png.

Luật liên quan: không có luật R-… (ngoại hình nhân vật). Va chạm, cỡ (cao 2,1 m trong cảnh), tốc độ không đổi.
App đang có: design/models/nhan-vat.glb (Hunyuan3D mini-turbo, octree 384, làm mịn, 16 000 tam giác, chiếu 1 ảnh trước);
xem ảnh design/screens/Model-nhan-vat.png — hông và lưng màu loang vì thiếu ảnh 3 góc còn lại.
```

## Câu lệnh Gemini

(Mẫu khối cho `gemini-anh.sh` — thêm 2026-11-16, V-98; dạng khối: `.claude/skills/ui-design/references/gemini.md`. Phiếu ảnh
mới chép mục này rồi sửa phần mô tả. Bộ ảnh nhân vật chính đã chốt — chạy lại phiếu này chỉ để thử công cụ.)

```gemini-cau-hinh
ten: nhan-vat
loai: nhan-vat
tham-chieu: design/models/anh/nhan-vat.webp   # ảnh thiết kế gốc — giữ đúng nhân vật
mau: truoc
rieng: mat
nen: #DDDDDD
```

```gemini chung
Character turnaround image for a 3D modelling AI. Keep EXACTLY the character design of the attached reference image: a cute
chibi young Taoist disciple (head about 1/3 of total height). Light blue Taoist robe #C9D6E3 with blue trim #4D6DB2 on the
cross collar, cuffs, front edge and hem; white inner collar; the LEFT front panel overlaps the RIGHT (traditional Han-style
cross collar). Dark navy sash #33456D, a round jade-green pendant #8CCB9E hanging on a blue cord at the right side of the sash.
Black hair in a solid top bun tied with a blue band and a gold hairpin #E2B24C through the bun; side hair short and pressed
to the head, no loose strands. Dark navy boots with white soles. Skin #F6D3BD, black open eyes, small mouth, calm face.
Pose: A-pose, arms angled down about 35 degrees, sleeves NOT touching the body, legs slightly apart, both boots visible.
Render: soft 3D vinyl / clay toy (Pop Mart style), soft even studio light, gentle shading for depth. NO outlines, NO cel
shading. Orthographic camera at chest height, no perspective. Plain flat light grey background #DDDDDD, no gradient, no floor
shadow, no frame. Square 1:1 image, character centred, about 80% of the image height, feet on the same ground line.
NO text, NO letters, NO Chinese characters, NO logo, NO watermark.
```

```gemini truoc
FRONT view: the character faces the camera straight on, symmetrical.
```

```gemini trai
LEFT side view, exact 90-degree profile: we see the character's LEFT side, the face points to the LEFT edge of the image.
Same pose, same size, same ground line as the attached front view.
```

```gemini sau
BACK view: we see the character's back straight on — bun, nape, sash and plain back of the robe (no pendant, no crossed
front panels visible from behind).
```

```gemini phai
RIGHT side view, exact 90-degree profile: we see the character's RIGHT side, the face points to the RIGHT edge of the image.
The jade pendant on the right side of the sash is visible. Same pose, size and ground line as the attached front view.
```

```gemini mat
mau: truoc
Close-up portrait of the same character's head and neck, facing the camera straight on, sharp facial details, same style.
```
