# Phiếu: Học từ vựng — màn bài từ, nút loa, câu nghe, Nói theo, Từ đã học, loa trên sổ từ
- Trạng thái: chờ thiết kế   (→ đã áp (<mã>) · bỏ (<lý do>))
- Đợi bởi: kế hoạch `docs/tasks/2026-11-17-hoc-tu-vung.md` (V-80) — nhiệm vụ 15, 16, 17, 18, 19

## Dán vào canvas

```
PHIẾU THIẾT KẾ — HỌC TỪ VỰNG TIẾNG TRUNG (V-80, 2026-11-17)

Bối cảnh: mục tiêu sản phẩm đổi từ "học bộ thủ / chữ Hán" sang "học TỪ VỰNG tiếng Trung" (HSK 2.0 cấp 1–2, 304 từ,
giản thể). Mỗi từ người học: NGHE + NÓI THEO (âm, thanh điệu), biết NGHĨA tiếng Việt, PINYIN, NHẬN MẶT CHỮ (không tập
viết). Từ xếp thành 50 bài × 6–7 từ theo chủ đề tiếng Việt (bài 1 "Chào hỏi": 你 我 好 谢谢 再见 不客气).
Âm phát âm là file MP3 đóng gói (chưa có — giai đoạn sau), nên mọi nút loa phải có trạng thái "không có âm".
Giữ phong cách cổ trang hiện có (giấy, mực, son, ngọc lục — token design/tokens), chữ Hán chỉ ở nội dung học (R-HUD-4).

Cần vẽ 7 phần (mỗi màn: dọc 390×844 + ngang 844×390; màn nhỏ 360×640 cho các màn có nhiều chữ):

1. MÀN BÀI TỪ (Flutter native) — thay "Thẻ học bộ thủ" (artboard TheBoThu-*).
   Mở khi: chọn "Học bài mới — <chủ đề>" với thầy Trúc Lão (Trúc Lâm). Đóng: "Đã lĩnh hội" (cuối bài) hoặc nút quay lại.
   - Đầu màn: tên bài (chữ Việt, vd. "Bài 1 · Chào hỏi"), vị trí "Từ 3 / 6", nơi đang đứng (Trúc Lâm), nút đóng.
   - TRANG TỪ (mỗi từ một trang, lật tới / lùi bằng nút + vuốt): chữ Hán to (1–5 chữ, giản thể; từ 4–5 chữ như
     公共汽车, 因为…所以 phải vừa 360 px), pinyin có dấu thanh TÔ MÀU THEO THANH (cần token 5 màu: thanh 1–4 + nhẹ —
     dịu, đọc được trên giấy, không chỉ dựa vào màu: có thể thêm dấu nhỏ), nghĩa tiếng Việt (có nghĩa dài 2 dòng),
     NÚT LOA từ (tự phát 1 lần khi lật tới), câu ví dụ (chữ Hán + pinyin + nghĩa) có loa nhỏ riêng, nút "NÓI THEO".
   - CÂU NHANH cuối bài: 6 câu, mỗi từ 1 câu (dạng a hoặc d ở mục 3), chấm tại chỗ, không tính lịch; xong → tóm tắt
     "Đúng 5 / 6" + nút "Đã lĩnh hội".
   - Trạng thái phải vẽ: trang từ 1 chữ (好), 2 chữ (谢谢), dài (公共汽车 / 因为…所以), nghĩa dài; loa đang phát; không có
     âm (loa mờ, Nói theo mờ); câu nhanh chưa chọn / đúng / sai; tóm tắt cuối bài; "mở lại từ đã học" (một trang, nút
     "Xuất định", không câu nhanh, huy hiệu "Đã học").

2. NÚT LOA (thành phần dùng chung — màn bài từ, màn ôn, sổ từ, Đấu chữ, măng chữ)
   3 trạng thái: chờ (chạm để nghe) · đang phát (sóng / vòng chạy) · không có âm (mờ, không chạm được). Cỡ chạm ≥ 44 px.
   Hai cỡ: loa từ (to) và loa câu ví dụ (nhỏ).

3. MÀN ÔN — thêm dạng câu (khung "Màn ôn câu đố" OnTap-* giữ nguyên; mỗi câu 4 phương án thay vì 3)
   a "Từ này nghĩa là gì?" — chữ to (không pinyin), 4 nghĩa          (app đang làm bằng khung cũ)
   b "Nghe — nghĩa là gì?" — chỉ nút loa to tự phát, 4 nghĩa          (CẦN VẼ)
   c "Từ này đọc thế nào?" — chữ to, 4 pinyin (nhiễu cùng âm khác thanh) (app đang làm bằng khung cũ)
   d "Chữ nào là «<nghĩa>»?" — nghĩa Việt, 4 ô CHỮ HÁN (chữ to trong ô) (app đang làm bằng khung cũ — cần duyệt cỡ chữ ô)
   e "Nghe — chữ nào?" — nút loa to, 4 ô chữ Hán                      (CẦN VẼ)
   Sau khi chọn: hiện đáp án + pinyin + nghĩa + loa (phát âm 1 lần). Kết quả từng từ (OnTap-muc-ket-qua): từ thay bộ.
   Trạng thái: b, e chưa chọn / đã chọn đúng / sai; d với từ 4 chữ; màn ngang.

4. "NÓI THEO" (trong màn bài từ — dạng f, tự chấm, không micro)
   Nhịp: chạm "Nói theo" → phát mẫu → đếm 2 giây "Đến lượt đạo hữu" → phát lại mẫu → hai nút "Giống rồi" / "Chưa giống".
   Kết quả không tính điểm, không lịch ôn. Vẽ 4 bước + trạng thái không có âm (nút mờ).

5. MÀN "TỪ ĐÃ HỌC" (Flutter native) — thay "Bộ đã học" (artboard BoDaHoc-*)
   Mở khi: chạm ô "Từ đã học" trên cuộn Tĩnh toạ. Danh sách từ đã học NHÓM THEO BÀI (tiêu đề bài chữ Việt), mỗi từ: chữ +
   pinyin + nghĩa ngắn + loa nhỏ; chạm từ → trang từ (mục 1, "Xuất định"). Trạng thái: ít (6 từ), đầy (304 từ — cuộn,
   tìm nhanh theo bài?), ngang.

6. Ô "TỪ ĐÃ HỌC" TRÊN CUỘN TĨNH TOẠ (cuộn 3D — artboard Cuon-*): đổi ô "Bộ đã học" → "Từ đã học", dòng phụ "n / 304 từ",
   mờ "Chưa học từ nào"; hình minh hoạ ô (hiện là bộ thủ) cần hình mới hợp "từ vựng" (vd. cuộn chữ + loa) theo phong cách
   hình minh hoạ đã duyệt. Dòng gợi ý: "Chưa học từ nào. Sang Trúc Lâm, gặp Trúc Lão ở bãi hạc đáp để học bài đầu tiên."

7. LOA TRÊN SỔ TỪ (màn đọc SoTu-*): loa từ cạnh pinyin, loa nhỏ ở câu ví dụ, dấu "Đã học" (từ đã học); trạng thái không
   có âm.

Luật phải theo (sổ docs/testing/quy_tac.md — chép nguyên văn khi vẽ): R-TU-1, R-TU-2, R-TU-3, R-AM-5, R-HANH-3, R-ON-2,
R-ON-8, R-SACH-3, R-HUD-4, R-VUNG-3.

Chuỗi có sẵn: "Đã lĩnh hội", "Xuất định", "Đã học", "Từ đã học", "n / 304 từ", "Chưa học từ nào", "Học bài mới — <chủ đề>",
"Ôn từ đến hạn (n)". Chuỗi mới cần đặt: tên nút loa (nhãn đọc màn hình), "Nói theo", "Giống rồi", "Chưa giống",
"Đến lượt đạo hữu", tiêu đề câu b / e, tóm tắt câu nhanh.
Dùng lại: khung Thẻ học bộ thủ (TheBoThu), Màn ôn câu đố (OnTap), Bộ đã học (BoDaHoc), Sổ từ (SoTu), token màu
(design/tokens), thành phần ở design/docs/components.md.
Gợi ý (không bắt buộc): màu thanh kiểu sách học (1 đỏ son, 2 lục, 3 lam, 4 tím mực, nhẹ xám); đường thanh điệu nhỏ vẽ
trên pinyin.
App đang có (tạm, chờ thiết kế này): app/lib/lesson/radical_screen.dart — khung thẻ bộ thủ cũ dùng lật từng từ của bài
+ "Đã lĩnh hội" (chưa câu nhanh / loa / Nói theo); app/lib/lesson/review_*.dart — màn ôn dạng a / c / d bằng khung cũ;
app/lib/lesson/learned_screen.dart — "Từ đã học" bằng khung lưới Bộ đã học; sổ từ chưa có loa.
```
