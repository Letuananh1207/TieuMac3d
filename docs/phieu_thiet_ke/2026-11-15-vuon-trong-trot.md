# Phiếu: Vườn rau ở Nhà của ta — nút nổi luống, bảng chọn hạt (túi hạt), kho + bán, mở ô, tấm báo, mục Hạt giống ở Tạp hoá (HUD)
- Trạng thái: đã áp (2026-11-15.29)
- Đã vẽ: 2026-11-15.29 (20 artboard: nút nổi 5 trạng thái, chọn hạt, kho + bán, mở ô, tấm báo, Tạp hoá Hạt giống — đặc tả `design/docs/screen_specs.md` mục "Vườn rau"; đề xuất luật: chọn × 1 · × 5 · × 10 khi mua hạt)
- Đợi bởi: kế hoạch `docs/tasks/2026-11-15-vuon-trong-trot.md` (nhiệm vụ 10). Luật, cầu nối, lưu, cảnh 3D (luống, rào, thùng thu
  mua, hình cây Kenney) **đã làm** (NV1–9, nhánh `viec/vuon`) — phiếu này chỉ còn phần HUD.
- Đã sửa theo lựa chọn người dùng 2026-11-15: **Q1 — mua hạt ở Tạp hoá trấn, bán ở vườn** (có **túi hạt**; bảng chọn hạt chỉ hiện
  hạt đang có) · trần bán 60 / ngày · cây bằng gói Kenney CC0 (Đậu xanh → **Ngô** vì gói không có) · không thông báo khi tắt app.
- Luật nguyên văn: `docs/testing/quy_tac.md` mục VUON (R-VUON-1…9, Xác nhận `chờ`).

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Vườn rau ở Nhà của ta (Học Xá 3D) · HUD lớp nổi trên cảnh 3D (web, không phải màn Flutter) + mục "Hạt giống"
trong màn Tạp hoá (Flutter + bản web, cùng thiết kế 2026-11-14.12)

Bối cảnh: Nhà của ta là đảo nhỏ trên biển mây (V-48). Bãi cỏ phía đông có khu "Vườn rau": rào tre thấp, nền đất nện,
12 luống đất 1,6 × 1,6 m xếp 3 cột × 4 hàng (6 mở sẵn, 6 đất hoang có cọc gỗ + cỏ dại), cạnh cổng vườn (mép tây) có thùng
thu mua bằng gỗ. Người chơi MUA HẠT Ở TẠP HOÁ TRẤN (vào túi hạt), về vườn gieo từ túi hạt, tưới (không bắt buộc, tưới thì thu
nhiều hơn), chờ cây lớn theo GIỜ THẬT (30 phút – 8 giờ, tắt app vẫn lớn), thu hoạch vào kho, bán ở thùng thu mua lấy Văn
tiền, mở thêm luống bằng Văn tiền. Mới cài túi có sẵn 3 hạt Cải ngọt.
Trồng thuần — KHÔNG có chữ Hán ở đâu trong phiếu này (tên cây, nhãn, biển chỉ tiếng Việt — R-HUD-4).
Cảm hứng cơ chế: 摩尔庄园 (chỉ cơ chế, không chép hình). Tông: ấm, nhẹ nhàng, không thúc ép — cây không bao giờ chết.
Hình cây 3D đã có (gói Kenney Nature Kit, xem ảnh Canvas 3D ?vung=nha-ta&dang=vuon-rau) — hình nhỏ trên thẻ có thể là ảnh
chụp cây 3D hoặc bản vẽ phẳng cùng dáng.

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

2. BẢNG CHỌN HẠT TỪ TÚI HẠT (bấm "Gieo"): dọc = tấm đáy (kiểu bảng danh mục trang trí 2026-11-14.13: bo trên 20, kính .96,
   tay nắm); ngang = cột phải. Đầu: "Chọn hạt để gieo" + dòng phụ "Luống 3 · tưới 2 lượt thì thu được nhiều nhất".
   CHỈ HIỆN LOẠI HẠT ĐANG CÓ trong túi (lưới — dọc 2 hoặc 3 cột, ngang 4 cột tuỳ thiết kế), mỗi thẻ: hình cây chín nhỏ, tên,
   số hạt còn ("còn 3" — chấm đếm), thời gian, "bán 3 / cái". Chạm thẻ → gieo ngay 1 hạt (không hộp xác nhận, không trừ
   tiền), bảng đóng.
   Trạng thái phải vẽ: túi có 2–3 loại · TÚI TRỐNG: "Túi hạt trống — mua hạt ở Tạp hoá trấn" (gợi ý đường đi: Tạp hoá ở
   Cổng Trấn; không có nút mua tại vườn) · mới cài (chỉ "Cải ngọt · còn 3").
   Bảng 8 cây (để thiết kế thẻ, tên chỉ tiếng Việt):
     Cải ngọt 30 phút · hạt 4 · bán 3 — Củ cải 1 giờ · 6 · 4 — Ngô 2 giờ · 8 · 5 — Lúa 3 giờ · 10 · 6
     Bí đỏ 4 giờ · 12 · 7 — Hoa cúc 5 giờ · 14 · 8 — Dưa hấu 6 giờ · 16 · 9 — Trà 8 giờ · 20 · 11

3. NÚT "BÁN" Ở THÙNG THU MUA (đứng dưới 2,5 m — kiểu nút nổi) + BẢNG KHO NÔNG SẢN:
   - Đầu: "Kho nông sản" + dòng "Hôm nay đã bán 20 / 60 Văn tiền" (thanh nhỏ tuỳ ý).
   - Mỗi dòng loại: hình nhỏ, tên, "× 4", "11 / cái", nút "Bán" (nhỏ). Chân: nút lớn "Bán hết · +39".
   - Trạng thái phải vẽ: có hàng · kho trống ("Kho trống — thu hoạch rồi mang tới đây") · đã đủ trần
     ("Hôm nay thu mua đã đủ — mai bán tiếp", nút Bán mờ, hàng vẫn hiện) · vừa bán (ví "+39 · Bán nông sản", có xu bay).
   - Bán vượt trần: chỉ bán số cái vừa trần, phần còn lại ở lại kho (không cần hộp hỏi — nhãn giải thích ngắn).
   - Có thể hiện thêm túi hạt (đang có bao nhiêu hạt mỗi loại) ở cùng tấm — tuỳ thiết kế.

4. HỘP XÁC NHẬN MỞ Ô (bấm "Mở ô"): kiểu hộp xác nhận Tạp hoá 2026-11-14.12 (đang có / giá / còn lại),
   nút "Mở · 50" + "Thôi". Thiếu tiền → nút "Còn thiếu 30" mờ. Ghi rõ "Mở luống 7 / 12".

5. TẤM BÁO (toast, không chặn bấm, tự tắt ~3 s — kiểu tấm báo thẻ khoá của trang trí):
   - Vào Nhà của ta có luống chín: "Vườn rau: 3 luống đã chín"
   - Thu hoạch: "+4 Bí đỏ vào kho"
   - Mở ô xong: "Đã mở luống 7"

6. MỤC "HẠT GIỐNG" Ở TẠP HOÁ (màn Tạp hoá đã có — thiết kế 2026-11-14.12, Flutter + bản web):
   Code đang TẠM dùng thẻ + hộp xác nhận có sẵn: tab "Hạt giống" sau Trong nhà, 8 thẻ "Hạt Cải ngọt · 4"…, hạt mua được
   nhiều lần (không bao giờ "Đã có"), mỗi lần 1 hạt; dòng phụ hộp xác nhận "Mỗi lần mua 1 hạt vào túi hạt · gieo ở Vườn rau";
   tấm "Đã mua Hạt Cải ngọt" + "Về Vườn rau để gieo — hạt ở trong túi hạt."; hình thẻ = mầm hai lá giữ chỗ.
   Cần thiết kế: thẻ hạt có số "Trong túi: 3", hình hạt / cây cho 8 loại, (tuỳ) chọn số lượng 1 · 5 · 10 trong hộp xác nhận,
   dòng phụ tiêu đề Tạp hoá khi có hạt (đang là "Đồ trang trí Nhà của ta · mua một lần, đặt được nhiều ô").

TRẠNG THÁI TỔNG HỢP CẦN CÓ: dọc + ngang cho mục 1 (ví dụ), 2, 3, 4, 6; artboard trạng thái nút nổi (1a–e); artboard tấm báo (5).
Ẩn toàn bộ HUD vườn khi: chế độ trang trí, bản đồ, thoại NPC, ngồi, màn Flutter, màn tải.

LUẬT PHẢI THEO (docs/testing/quy_tac.md mục VUON — tóm tắt):
- R-VUON-1: Vườn rau ở Nhà của ta (bãi cỏ phía đông, rào tre thấp), 12 luống 3 cột × 4 hàng; mới cài 6 luống mở (hai hàng
  giữa), 6 luống đất hoang có cọc gỗ. Luống không chặn người đi; rào, thùng thu mua chặn. Chỉ trồng ở Nhà của ta.
- R-VUON-2: đứng cách tâm luống dưới 1,6 m → nút nổi trên luống gần nhất: trống "Gieo"; đang lớn và tưới được "Tưới"; chín
  "Thu"; hoang "Mở ô"; đang lớn không tưới được → không nút, chỉ nhãn "{cây} · còn {thời gian}". Ra xa từ 1,6 m → ẩn. Trong
  tầm nút khác cùng lúc → chỉ nút của vật gần hơn. Đang trang trí / bản đồ / thoại / ngồi → không nút vườn. Bảng mở → nhân
  vật đứng yên.
- R-VUON-3: "Gieo" → bảng chỉ hiện hạt đang có trong túi (tên, số còn, thời gian, giá bán / cái); chạm → dùng 1 hạt, gieo,
  không trừ tiền. Túi trống → "Túi hạt trống — mua hạt ở Tạp hoá trấn". Mới cài túi có 3 hạt Cải ngọt.
- R-VUON-4: lớn theo giờ thật kể cả khi tắt app; 4 dáng: vừa gieo (< 10 %) · mầm (10–50 %) · đang lớn (50–100 %) · chín.
  Cây không chết / héo / hỏng; chín giữ mãi. Không thông báo khi tắt app.
- R-VUON-5: 2 lượt tưới — lượt 1 ngay sau gieo, lượt 2 từ nửa thời gian lớn; chín thì thôi tưới. Luống tưới được hiện giọt
  nước. Mỗi lượt +1 sản lượng; không tưới cây vẫn chín đúng giờ; tưới không tốn tiền, không làm nhanh.
- R-VUON-6: "Thu" → 2 + số lượt đã tưới (2–4) vào kho, luống trống lại, báo "+{n} {cây} vào kho". Kho giữ mãi. Vào nhà có
  luống chín → "Vườn rau: {n} luống đã chín".
- R-VUON-7: thùng thu mua (dưới 2,5 m → "Bán") → bảng kho, bán từng loại / "Bán hết", ví "+{n} · Bán nông sản". Mỗi ngày giờ
  VN tối đa 60 Văn tiền; vượt → chỉ bán số cái vừa trần, còn lại giữ kho, nhãn "Hôm nay thu mua đã đủ". Kho trống → "Kho
  trống — thu hoạch rồi mang tới đây". Không bán nông sản ở Tạp hoá.
- R-VUON-8: "Mở ô" → hộp xác nhận (đang có / giá / còn lại) → mở ô kế tiếp theo thứ tự 7 → 12, giá 50 · 80 · 120 · 160 ·
  200 · 250; ví "−{giá} · Mở ô đất"; thiếu → "Còn thiếu n".
- R-VUON-9: Tạp hoá có mục "Hạt giống" 8 loại, mỗi lần mua 1 hạt (Cải ngọt 4 · Củ cải 6 · Ngô 8 · Lúa 10 · Bí đỏ 12 · Hoa
  cúc 14 · Dưa hấu 16 · Trà 20), mua nhiều lần, không có "Đã có"; thiếu → "Còn thiếu n".
- R-TIEN-5: khoản trừ (mở ô, mua hạt) có nhãn, không xu bay; khoản cộng (bán) có xu bay như thưởng.
- R-HUD-4: chỉ tiếng Việt trên mọi nhãn, tên cây, biển. R-MAN-1: không đè vùng bị che (safe area).

CHUỖI MỚI (đặt tên khoá trong vi.arb): "Vườn rau", "Gieo", "Tưới", "Thu", "Mở ô", "Bán", "Bán hết", "Chọn hạt để gieo",
"Luống {n} · tưới 2 lượt thì thu được nhiều nhất", "còn {n}" (số hạt), "Túi hạt trống — mua hạt ở Tạp hoá trấn",
"{cây} · còn {thời gian}", "còn {h} giờ {m} phút" / "còn {m} phút" / "còn chưa tới 1 phút" / "đã chín", "bán {n} / cái",
"Còn thiếu {n}", "Kho nông sản", "Hôm nay đã bán {n} / 60 Văn tiền", "Kho trống — thu hoạch rồi mang tới đây",
"Hôm nay thu mua đã đủ — mai bán tiếp", "Mở luống {n} / 12", "Mở · {giá}", "Thôi", "Đã mở luống {n}",
"Vườn rau: {n} luống đã chín", "+{n} {cây} vào kho", nhãn ví "−{giá} · Hạt {cây}", "+{n} · Bán nông sản", "−{giá} · Mở ô đất";
Tạp hoá: "Hạt giống" (tab), "Hạt {cây}", "Trong túi: {n}", "Mỗi lần mua 1 hạt vào túi hạt · gieo ở Vườn rau",
"Về Vườn rau để gieo — hạt ở trong túi hạt.";
tên 8 cây: Cải ngọt, Củ cải, Ngô, Lúa, Bí đỏ, Hoa cúc, Dưa hấu, Trà. Thẻ "Văn tiền kiếm từ đâu" (R-TIEN-1) đã thêm dòng
"Bán nông sản ở Vườn rau · ≤ 60 / ngày" (code tạm — thiết kế xác nhận chữ).

DÙNG LẠI ĐƯỢC (design/docs/components.md, screen_specs.md, token):
- Nút nổi "Nói chuyện" / "Xem bảng" (viên `jade` 46, mũi nhọn, nhãn kính sương) — mục 2026-11-13.25.
- Bảng danh mục trang trí (tấm đáy dọc cao 392 / cột phải ngang rộng 310, thẻ lưới) — mục 2026-11-14.13.
- Thẻ vật có / khoá + hộp xác nhận mua Tạp hoá, ví + hiệu ứng nhận tiền — mục 2026-11-14.12.
- Tấm báo `slate` 3 s (thẻ khoá trang trí). Chấm son `count-badge`. Token: jade, gold, lacquer, slate, aura-light, map-paper.

GỢI Ý (không bắt buộc): giọt nước / lấp lánh nên nhỏ, nhịp chậm (không rối khi 12 luống cùng lúc); bảng kho và túi hạt có
thể gộp vào cùng kiểu tấm đáy với bảng hạt.

APP ĐANG CÓ:
- Vườn 3D: web/src/scene/vuonLuong.ts (luống, đất hoang, rào, thùng), cayTrong.ts (cây Kenney theo dáng); ghép
  web/src/homeGarden.ts (`spot()` trả sẵn nút / nhãn cho HUD — R-VUON-2; thao tác `act()` qua cầu nối `gardenAct`).
  Tạm khi chưa có HUD: `?debug` phím G (thao tác ở luống gần) / B (bán hết ở thùng).
- HUD trang trí Nhà của ta: web/src/ui/decorHud.ts, decorPanel.ts (nút "Trang trí" dọc phải 20 / dưới 310; bảng danh mục).
- Nút nổi trong cảnh: web/src/ui/learnButton.ts, shopButton.ts ("Vào tiệm"), ví web/src/ui/wallet.ts.
- Tạp hoá: app/lib/lesson/shop_screen.dart (+ shop_parts, shop_confirm), web/src/ui/shopPanel.ts — tab "Hạt giống" tạm.
- Cảnh nhà: design/scene/nha-ta.json (khối `garden`); Canvas 3D https://claude.ai/artifact/TyJxrgsBcj5ryHakv7c1so
  `?vung=nha-ta&dang=vuon-rau` (vườn điền sẵn + bảng mẫu 8 cây × 4 dáng ở bãi tây).
```
