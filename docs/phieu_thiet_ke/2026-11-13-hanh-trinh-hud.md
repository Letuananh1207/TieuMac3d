# Phiếu: Hành trình — cuộn bản đồ truyền tống + thẻ học bộ thủ
- Trạng thái: chờ thiết kế
- Đã vẽ: 2026-11-13.9
- Đợi bởi: kế hoạch `docs/tasks/2026-11-13-hanh-trinh-nhieu-vung.md` (đợt 1b nhiệm vụ 19–20: bản đồ; nhiệm vụ 14: bộ thủ)
- Sửa 2026-11-13: bỏ "nhãn cột trận khoá" (đài không còn 6 cột — người dùng đổi kiểu truyền tống), thay bằng bản đồ.

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Hành trình nhiều vùng (Học Xá 3D) · tiếp mục 2026-11-13.6

THAY ĐỔI QUYẾT ĐỊNH (người dùng, 2026-11-13, sau khi thử máy): KHÔNG còn 6 cột / 6 vòng trận mỗi vùng một vòng.
Truyền Tống Đài chỉ còn MỘT vòng trận lớn giữa sân (phù hiệu 文淵 trong vòng). Bước vào vòng → hiệu ứng chung
(vòng sáng dần, cột sáng bốc lên, hạt xoáy ~1,2 s) → một CUỘN BẢN ĐỒ LỚN bay lên trước mặt, mở ra → chạm vùng để đi.
Vòng trận ở mỗi vùng (vd. Rừng trúc) cũng mở cùng bản đồ này (về Văn Uyên Tông hoặc đi thẳng vùng khác).
Ghi đè câu "không có màn bản đồ" trong design/scene/hanh_trinh.md.

1) CUỘN BẢN ĐỒ TRUYỀN TỐNG — vật 3D trong cảnh (không phải màn phủ)
- Dạng: cuộn tranh ngang (hai trục cuộn gỗ / ngọc hai đầu, tấm giấy ở giữa) lơ lửng trước nhân vật, quay mặt về
  camera; cỡ trong cảnh ≈ 6 × 3,5 m. Code dựng cuộn + hiệu ứng; THIẾT KẾ VẼ TẤM GIẤY (hình bản đồ).
- Cần vẽ: tấm giấy bản đồ tỉ lệ ≈ 16:9 (xuất PNG 2048 × 1152 hoặc lớn hơn), phong cách thuỷ mặc / sơn thuỷ cổ
  (hợp design/scene/phong_cach.md), có 7 nơi, mỗi nơi một biểu tượng hình + chữ Hán + tên Việt:
  文淵 Văn Uyên Tông (nhà) · 竹林 Rừng trúc (lá trúc) · 江南 Giang Nam (cầu vòm) · 蓬萊 Bồng Lai (đảo nổi) ·
  長城 Trường Thành (tháp canh) · 紫禁 Tử Cấm Thành (mái vàng) · 絲路 Con đường tơ lụa (lạc đà).
  Bố cục gợi ý: một hành trình từ tông môn ra xa (lối đi / dòng sông nối các nơi theo thứ tự).
- Trạng thái mỗi nơi phải vẽ (code chồng lên hoặc đổi lớp — thiết kế chọn cách, ghi rõ): đã mở (sáng, chạm được) ·
  khoá ("Cần 300 chữ" / "Cần học xong bộ thủ Rừng trúc", mờ) · đã mở nhưng chưa có cảnh ("Sắp mở") · ĐANG Ở ĐÂY
  (dấu vị trí hiện tại) · đang chọn / vừa chạm vào nơi khoá (nhấp nháy).
  → Xuất ảnh nền (không trạng thái) + vị trí (toạ độ px) từng nơi + dạng dấu trạng thái, để code vẽ trạng thái lên.
- Chữ trên giấy: thiết kế đặt font / cỡ đọc được trên điện thoại dọc 390 × 844 khi bản đồ chiếm ≈ 90 % bề ngang.
- Vẽ thêm 2 ảnh ghép trên nền cảnh thật: dọc 390×844 và ngang 844×390 — nhân vật đứng trong vòng, bản đồ đang mở.
- Luật (đang sửa theo kiểu mới, sổ docs/testing/quy_tac.md): R-HANH-1 mốc mở — Rừng trúc từ đầu; Giang Nam khi học đủ
  bộ thủ Rừng trúc (≈ 50); Bồng Lai 300 chữ; Trường Thành 900; Tử Cấm Thành 1 800; Con đường tơ lụa 3 000.

2) NÚT ĐÓNG BẢN ĐỒ — HUD (lớp HTML trên cảnh)
- Người dùng muốn đóng RÕ RÀNG bằng nút (không chỉ bước ra khỏi vòng).
- Hiện khi bản đồ mở xong; bấm → bản đồ cuộn lại, bay xuống; nhân vật đi lại được. Thiết kế chọn: nút × góc màn
  hình hay nút "Đóng" / "Ở lại" bám dưới bản đồ. Vẽ dọc 390×844 + ngang 844×390; tôn trọng safe area (R-MAN-1).
- Trong lúc bản đồ mở: nhân vật đứng yên hay đi được? (đề xuất: đứng yên, joystick ẩn — như lúc mở bài học R-VUNG-3).
- Chuỗi mới: nhãn nút đóng; "Cần {n} chữ"; "Cần học xong bộ thủ Rừng trúc"; "Sắp mở"; "Đang ở đây" (nếu dùng chữ).

Dùng lại được: token màu / font trong design/, màn tải (đổi vùng vẫn qua màn tải, tên + chữ Hán vùng),
nút học nổi (kiểu nút nổi trên cảnh). App đang có: web/src/scene/truyenTong.ts (đài 6 cột — sẽ thay),
web/src/ui/learnButton.ts, web/src/ui/loadingScreen.ts. Ảnh đài cũ để so: design/screens/Canh-truyen-tong-*.png.

3) THẺ HỌC BỘ THỦ — ở Rừng trúc
- Mục đích: chạm một bia bộ thủ, hoặc một vật "sống" mang bộ thủ (suối → 水/氵, đá → 石, trúc → 竹, cây → 木…),
  thì hiện bộ thủ đó và cách chữ đi từ hình vẽ ra nét.
- Mở khi: chạm bia / vật (hoặc đứng cạnh bia, bấm nút nổi — phiên thiết kế chọn, xem nút học nổi R-VUNG-1).
  Đóng khi: bấm nút đóng; nhân vật đứng yên trong lúc mở (như R-VUNG-3).
- Nội dung: bộ thủ lớn (vd. 氵) + dạng đầy đủ (水) · tên Việt ("thuỷ — nước") · pinyin · số nét · 2–3 chữ ví dụ
  chứa bộ (河 江 海) · hình vẽ tượng hình → chữ (2–3 bước).
- Trạng thái: lần đầu (đánh dấu "đã học" → bia viền vàng) · đã học rồi (ôn lại) · bộ thủ có hai dạng (水/氵) ·
  bộ thủ một dạng (竹).
- Chọn: thẻ HTML trên cảnh hay màn Flutter native như màn bài học (design/docs/screen_specs.md "Màn bài học")?
  Gợi ý: dùng lại khung màn bài học native cho đồng bộ.
- Chuỗi mới: tên các trường ("Bộ", "Dạng đủ", "Nét", "Chữ có bộ này"), nút đóng.

Dùng lại được: nút học nổi (HUD "Trong nhà"), thẻ tên khu, màn bài học native, token màu / font trong design/.
App đang có: web/src/ui/learnButton.ts (nút nổi bám vật), web/src/ui/areaBanner.ts (thẻ tên khu),
app/lib/lesson/lesson_screen.dart (màn bài học). Màn tải khi đổi vùng dùng lại màn tải có sẵn (tên + chữ Hán vùng) —
chữ "Đang mở sơn môn…" giữ nguyên; muốn chữ riêng cho truyền tống (vd. "Đang truyền tống…") thì đặt thêm.
```
