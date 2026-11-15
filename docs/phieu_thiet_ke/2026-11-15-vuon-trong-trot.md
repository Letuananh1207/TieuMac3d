# Phiếu: Vườn rau ở Nhà của ta — nút nổi luống, bảng chọn hạt, kho + bán, mở ô, tấm báo (HUD)
- Trạng thái: chờ thiết kế
- Đợi bởi: kế hoạch `docs/tasks/2026-11-15-vuon-trong-trot.md` (nhiệm vụ 10). Bố cục 3D của vườn (luống, rào, thùng thu mua,
  hình cây) làm riêng bằng `/canh` + code (NV7–8), không thuộc phiếu này.
- Lưu ý: luật R-VUON-* dưới đây là **bản đề xuất** trong kế hoạch, chờ người dùng duyệt Q1–Q4. Nếu người dùng chọn khác (vd. mua
  hạt ở Tạp hoá — Q1-B) thì sửa phiếu trước khi dán.

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Vườn rau ở Nhà của ta (Học Xá 3D) · HUD lớp nổi trên cảnh 3D (web, không phải màn Flutter)

Bối cảnh: Nhà của ta là đảo nhỏ trên biển mây (V-48). Bãi cỏ phía đông có khu "Vườn rau": rào tre thấp, 12 luống đất
1,6 × 1,6 m xếp 3 cột × 4 hàng (6 mở sẵn, 6 đất hoang có cọc gỗ), cạnh cổng vườn có giỏ hạt và thùng thu mua bằng gỗ.
Người chơi gieo hạt (trả Văn tiền lúc gieo), tưới (không bắt buộc, tưới thì thu nhiều hơn), chờ cây lớn theo GIỜ THẬT
(30 phút – 8 giờ, tắt app vẫn lớn), thu hoạch vào kho, bán ở thùng thu mua lấy Văn tiền, mở thêm luống bằng Văn tiền.
Trồng thuần — KHÔNG có chữ Hán ở đâu trong phiếu này (tên cây, nhãn, biển chỉ tiếng Việt — R-HUD-4).
Cảm hứng cơ chế: 摩尔庄园 (chỉ cơ chế, không chép hình). Tông: ấm, nhẹ nhàng, không thúc ép — cây không bao giờ chết.

CẦN VẼ — mỗi mục dọc 390×844 + ngang 844×390 (cảnh nền giữ chỗ: vườn rau trong Nhà của ta)

1. NÚT NỔI Ở LUỐNG (bám trên luống gần nhất, khi đứng cách tâm luống dưới 1,6 m — kiểu nút "Nói chuyện" / "Xem bảng":
   viên thuốc, mũi nhọn xuống). Một nút một lúc, theo trạng thái luống:
   a. luống trống → "Gieo" (biểu tượng hạt / bàn tay rắc hạt)
   b. đang lớn, tưới được → "Tưới" (biểu tượng gáo / bình tưới) + GIỌT NƯỚC nhỏ trên luống (dấu "khát", cả khi chưa đứng gần)
   c. chín → "Thu" (biểu tượng giỏ) + LẤP LÁNH nhỏ trên luống chín (thấy từ xa)
   d. đất hoang → "Mở ô" (biểu tượng cuốc / khoá mở) kèm giá nhỏ "· 50"
   e. đang lớn, không tưới được → KHÔNG nút, chỉ NHÃN nhỏ kính sương "Cải ngọt · còn 20 phút" (+ thanh tiến độ mảnh tuỳ ý)
   Vẽ cả 5 trạng thái trên một artboard trạng thái + một màn dọc / ngang ví dụ (đứng cạnh luống trống).
   Không đè: cụm nút hành động góc dưới phải, nút Trang trí, nút Trò chuyện, joystick, ví góc trên phải, bản đồ nhỏ.

2. BẢNG CHỌN HẠT (bấm "Gieo"): dọc = tấm đáy (kiểu bảng danh mục trang trí 2026-11-14.13: bo trên 20, kính .96, tay nắm);
   ngang = cột phải. Đầu: "Chọn hạt để gieo" + dòng phụ "Luống 3 · tưới 2 lượt thì thu được nhiều nhất".
   8 thẻ hạt (lưới — dọc 2 hoặc 3 cột, ngang 4 cột tuỳ thiết kế), mỗi thẻ: hình cây chín nhỏ, tên, thời gian, giá hạt (xu),
   "bán 3 / cái". Trạng thái thẻ: đủ tiền (bấm được) · thiếu tiền (mờ + "Còn thiếu n"). Dữ liệu mẫu:
     Cải ngọt 30 phút · hạt 4 · bán 3 — Củ cải 1 giờ · 6 · 4 — Đậu xanh 2 giờ · 8 · 5 — Lúa 3 giờ · 10 · 6
     Bí đỏ 4 giờ · 12 · 7 — Hoa cúc 5 giờ · 14 · 8 — Dưa hấu 6 giờ · 16 · 9 — Trà 8 giờ · 20 · 11
   Chạm thẻ đủ tiền → gieo ngay (không hộp xác nhận — giá nhỏ), bảng đóng, ví chạy "−4 · Hạt Cải ngọt".
   Vẽ: bảng mở (đủ tiền hết) · bảng mở khi ví ít (vd. 9: 4 thẻ đầu sáng, 4 thẻ sau mờ "Còn thiếu …").

3. NÚT "BÁN" Ở THÙNG THU MUA (đứng dưới 2,5 m — kiểu nút nổi) + BẢNG KHO NÔNG SẢN:
   - Đầu: "Kho nông sản" + dòng "Hôm nay đã bán 20 / 60 Văn tiền" (thanh nhỏ tuỳ ý).
   - Mỗi dòng loại: hình nhỏ, tên, "× 4", "11 / cái", nút "Bán" (nhỏ). Chân: nút lớn "Bán hết · +39".
   - Trạng thái phải vẽ: có hàng · kho trống ("Kho trống — thu hoạch rồi mang tới đây") · đã đủ trần
     ("Hôm nay thu mua đã đủ — mai bán tiếp", nút Bán mờ, hàng vẫn hiện) · vừa bán (ví "+39 · Bán nông sản").
   - Bán vượt trần: chỉ bán số cái vừa trần, phần còn lại ở lại kho (không cần hộp hỏi — nhãn giải thích ngắn).

4. HỘP XÁC NHẬN MỞ Ô (bấm "Mở ô"): kiểu hộp xác nhận Tạp hoá 2026-11-14.12 (đang có / giá / còn lại),
   nút "Mở · 50" + "Thôi". Thiếu tiền → nút "Còn thiếu 30" mờ. Ghi rõ "Mở luống 7 / 12".

5. TẤM BÁO (toast, không chặn bấm, tự tắt ~3 s — kiểu tấm báo thẻ khoá của trang trí):
   - Vào Nhà của ta có luống chín: "Vườn rau: 3 luống đã chín"
   - Thu hoạch: "+4 Bí đỏ vào kho"
   - Mở ô xong: "Đã mở luống 7"

TRẠNG THÁI TỔNG HỢP CẦN CÓ: dọc + ngang cho mục 1 (ví dụ), 2, 3, 4; artboard trạng thái nút nổi (1a–e); artboard tấm báo (5).
Ẩn toàn bộ HUD vườn khi: chế độ trang trí, bản đồ, thoại NPC, ngồi, màn Flutter, màn tải.

LUẬT PHẢI THEO (đề xuất, docs/testing/quy_tac.md mục VUON — chép nguyên văn từ kế hoạch):
- R-VUON-1: Vườn rau ở Nhà của ta (bãi cỏ phía đông, rào tre thấp), 12 luống 3 cột × 4 hàng; mới cài 6 luống mở (hai hàng
  giữa), 6 luống đất hoang có cọc gỗ. Luống không chặn người đi; rào, giỏ hạt, thùng thu mua chặn. Chỉ trồng ở Nhà của ta.
- R-VUON-2: đứng cách tâm luống dưới 1,6 m → nút nổi trên luống gần nhất: trống "Gieo"; đang lớn và tưới được "Tưới"; chín
  "Thu"; hoang "Mở ô"; đang lớn không tưới được → không nút, chỉ nhãn "{cây} · còn {thời gian}". Ra xa từ 1,6 m → ẩn. Trong
  tầm nút khác cùng lúc → chỉ nút của vật gần hơn. Đang trang trí / bản đồ / thoại / ngồi → không nút vườn. Bảng mở → nhân
  vật đứng yên.
- R-VUON-3: "Gieo" → bảng 8 hạt (tên, thời gian, giá hạt, giá bán / cái); chạm hạt đủ tiền → trừ giá ngay, gieo, ví
  "−{giá} · Hạt {cây}"; thiếu → thẻ mờ "Còn thiếu n". Không có túi hạt: mua lúc gieo.
- R-VUON-4: lớn theo giờ thật kể cả khi tắt app; 4 dáng: vừa gieo (< 10 %) · mầm (10–50 %) · đang lớn (50–100 %) · chín.
  Cây không chết / héo / hỏng; chín giữ mãi.
- R-VUON-5: 2 lượt tưới — lượt 1 ngay sau gieo, lượt 2 từ nửa thời gian lớn; chín thì thôi tưới. Luống tưới được hiện giọt
  nước. Mỗi lượt +1 sản lượng; không tưới cây vẫn chín đúng giờ; tưới không tốn tiền, không làm nhanh.
- R-VUON-6: "Thu" → 2 + số lượt đã tưới (2–4) vào kho, luống trống lại, báo "+{n} {cây} vào kho". Kho giữ mãi. Vào nhà có
  luống chín → "Vườn rau: {n} luống đã chín".
- R-VUON-7: thùng thu mua (dưới 2,5 m → "Bán") → bảng kho, bán từng loại / "Bán hết", ví "+{n} · Bán nông sản". Mỗi ngày giờ
  VN tối đa 60 Văn tiền; vượt → chỉ bán số cái vừa trần, còn lại giữ kho, nhãn "Hôm nay thu mua đã đủ". Kho trống → "Kho
  trống — thu hoạch rồi mang tới đây".
- R-VUON-8: "Mở ô" → hộp xác nhận (đang có / giá / còn lại) → mở ô kế tiếp theo thứ tự 7 → 12, giá 50 · 80 · 120 · 160 ·
  200 · 250; ví "−{giá} · Mở ô đất"; thiếu → "Còn thiếu n".
- R-TIEN-5: khoản trừ (hạt, mở ô) có nhãn, không xu bay; khoản cộng (bán) có xu bay như thưởng.
- R-HUD-4: chỉ tiếng Việt trên mọi nhãn, tên cây, biển. R-MAN-1: không đè vùng bị che (safe area).

CHUỖI MỚI (đặt tên khoá trong vi.arb): "Vườn rau", "Gieo", "Tưới", "Thu", "Mở ô", "Bán", "Bán hết", "Chọn hạt để gieo",
"Luống {n} · tưới 2 lượt thì thu được nhiều nhất", "{cây} · còn {thời gian}", "còn {h} giờ {m} phút" / "còn {m} phút" /
"đã chín", "bán {n} / cái", "Còn thiếu {n}", "Kho nông sản", "Hôm nay đã bán {n} / 60 Văn tiền", "Kho trống — thu hoạch rồi
mang tới đây", "Hôm nay thu mua đã đủ — mai bán tiếp", "Mở luống {n} / 12", "Mở · {giá}", "Thôi", "Đã mở luống {n}",
"Vườn rau: {n} luống đã chín", "+{n} {cây} vào kho", nhãn ví "−{giá} · Hạt {cây}", "+{n} · Bán nông sản", "−{giá} · Mở ô đất";
tên 8 cây: Cải ngọt, Củ cải, Đậu xanh, Lúa, Bí đỏ, Hoa cúc, Dưa hấu, Trà. Thẻ "Văn tiền kiếm từ đâu" (R-TIEN-1) thêm dòng
"Bán nông sản ở Vườn rau (tối đa 60 / ngày)".

DÙNG LẠI ĐƯỢC (design/docs/components.md, screen_specs.md, token):
- Nút nổi "Nói chuyện" / "Xem bảng" (viên `jade` 46, mũi nhọn, nhãn kính sương) — mục 2026-11-13.25.
- Bảng danh mục trang trí (tấm đáy dọc cao 392 / cột phải ngang rộng 310, thẻ lưới) — mục 2026-11-14.13.
- Thẻ vật có / khoá + hộp xác nhận mua Tạp hoá, ví + hiệu ứng nhận tiền — mục 2026-11-14.12.
- Tấm báo `slate` 3 s (thẻ khoá trang trí). Chấm son `count-badge`. Token: jade, gold, lacquer, slate, aura-light, map-paper.

GỢI Ý (không bắt buộc): hình cây trên thẻ có thể là bản vẽ phẳng giữ chỗ (code sẽ thay ảnh chụp cây 3D); giọt nước / lấp lánh
nên nhỏ, nhịp chậm (không rối khi 12 luống cùng lúc); bảng kho có thể gộp vào cùng kiểu tấm đáy với bảng hạt.

APP ĐANG CÓ:
- HUD trang trí Nhà của ta: web/src/ui/decorHud.ts, decorPanel.ts (nút "Trang trí" dọc phải 20 / dưới 310; bảng danh mục).
- Nút nổi trong cảnh: web/src/ui/learnButton.ts, shopButton.ts ("Vào tiệm"), ví web/src/ui/wallet.ts.
- Cảnh nhà: design/scene/nha-ta.json (đảo V-48, không còn cổng đứng — V-51); ảnh screens/Canh-nha-ta-dao.png, Canh-nha-ta-san.png.
- Chưa có gì về vườn / nông sản trong app.
```
