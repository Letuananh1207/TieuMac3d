# Phiếu: Trúc Lâm — HUD 3 mini game (Lưu Thương Lệnh · Hái măng sau mưa · Đàn cầm) + ngăn Lâm sản trong Túi đồ
- Trạng thái: chờ thiết kế   (→ đã áp (<mã>) · bỏ (<lý do>))
- Đã vẽ: 2026-11-16.13 (đủ 3 trò + Lâm sản + 3 bảng Cách chơi; vài đề xuất nhỏ trong CHANGELOG)
- Đợi bởi: kế hoạch `docs/tasks/2026-11-15-truc-lam-mini-game.md` (nhiệm vụ 15, 16, 17 + phần HUD của 19–21). Luật thuần, dữ liệu,
  cảnh 3D, âm thanh, cầu nối làm được trước, không chờ phiếu.
- Luật: nháp R-LUU-1…5, R-MANG-1…5, R-CAM-1…4 trong kế hoạch mục 4 (**chưa vào sổ** — chờ người dùng chọn 4 điểm quyết định; phiếu
  viết theo phương án khuyên: ghép 1 bộ thủ / 2 lứa măng + mưa / bán măng cho Trúc Ông / đàn tự do + theo bài). Người dùng chọn khác
  → sửa phiếu trước khi dán.

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Trúc Lâm: HUD 3 trò chơi nhỏ (Học Xá 3D) · lớp nổi HTML trên cảnh 3D (web, không phải màn Flutter)
+ ngăn "Lâm sản" trong tấm Túi đồ (2026-11-15.35)

Bối cảnh: Trúc Lâm là vùng đầu của hành trình — thung suối giữa rừng trúc, có Khúc Thuỷ Đài (đài đá thấp chân thác, mương
đá chữ S dài 18 m có chén trôi, 8 đệm cỏ quanh mương), Trúc Lư (nhà tranh, sân đất, rào trúc), bãi giữa với một tảng đá phẳng
đặt cây cổ cầm. Ảnh cảnh: design/screens/Canh-truc-lam-b3-*.png (bai-hac, dinh, khuc-thuy). Ba trò:
  1. LƯU THƯƠNG LỆNH (học chữ): ngồi đệm cỏ cùng 3 văn nhân NPC; chén lệnh trôi theo mương, dừng trước ai người đó GHÉP BỘ THỦ
     THÀNH CHỮ HÁN. 8 lượt / ván (mình 4), hết ván xếp hạng 4 người.
  2. HÁI MĂNG SAU MƯA (lượm mỗi ngày): măng nhú trong rừng trúc 2 lứa / ngày (5:00 và 15:00 giờ VN, lứa chiều sau 10 phút mưa
     phùn); đi tới gần → "Hái"; măng to có khắc một bộ thủ đã học → 1 câu hỏi nhanh, đúng được gấp đôi; mang ra Trúc Lư bán cho
     Trúc Ông lấy Văn tiền.
  3. ĐÀN CẦM (thư giãn): ngồi sau tảng đá đàn cầm; "Đàn tự do" (10 phím ngũ cung, gảy gì cũng êm) hoặc "Theo bài" (nốt rơi 5 làn,
     chạm đúng lúc, 3 bài ngắn 40–60 giây).
Chơi một mình với NPC (chưa có nhiều người). Tông: tao nhã, thong thả, ấm — giấy, trúc, mực, son; không thúc ép, không đếm ngược
gắt (Lưu Thương có giới hạn 20 giây / câu nhưng hiện nhẹ nhàng). Cảm hứng: 曲水流觴 Lan Đình (chén rượu trôi, làm thơ) — chỉ ý,
không chép hình.

R-HUD-4 — CHỈ TIẾNG VIỆT trên mọi chữ trang trí: tên trò, tên NPC, tên bài đàn, tên dây (Cung · Thương · Giốc · Chuỷ · Vũ viết
chữ Việt), nhãn, nút, ấn son. CHỮ HÁN CHỈ là nội dung học: phần chữ trong câu ghép Lưu Thương (chữ, bộ thủ, phần còn lại) và bộ
thủ khắc trên măng to / câu hỏi măng chữ.

KHUNG MÀN PHẢI VẼ — mỗi màn chính đủ 3 khung:
  · điện thoại dọc 390×844 · điện thoại ngang 844×390 (safe area tai thỏ hai bên) ·
  · MÁY TÍNH 1280×800 dùng chuột: thanh công cụ sát TRÁI đáy, ô chat luôn hiện bên trái ngay trên thanh (V-67, V-70), không
    joystick; phím tắt hiện dạng phím chữ nổi (kiểu dải gợi ý phím 2026-11-15.42).
Khi đang chơi (ngồi tiệc / ngồi đàn / mở bảng bán): thanh công cụ, bản đồ nhỏ, ví ẨN (như ngồi bàn chơi Kỳ Văn Uyển — R-THANH-1,
R-TIEN-1); khi đi lại hái măng: HUD thường vẫn hiện (thanh, bản đồ nhỏ, ví, joystick) — HUD măng không được đè chúng.

═══ 1. LƯU THƯƠNG LỆNH ═══

Vào: nói chuyện với Thi Ông (khung thoại có sẵn — R-NPC-2) → lựa chọn "Dự tiệc Lưu Thương" · "Cách chơi" · "Thôi" → nhân vật
ngồi đệm trống gần nhất; camera chéo cao nhìn xuống đài từ sau lưng mình (thấy mương, chén, 3 văn nhân). NPC: Thi Ông (chủ tiệc,
cụ đồ râu bạc, áo lam) · Tú Tài (thư sinh trẻ, áo ngà) · Tài Nữ (nữ văn nhân, áo lục nhạt) — chưa có model: chân dung giữ chỗ.

1a. ĐANG CHƠI — khung chung:
   - Viên tiến độ "Lượt n / 8" + 8 chấm (mình đúng / sai / NPC đúng / sai / chưa tới — gợi ý: chấm của mình to hơn) — dùng lại
     Viên tiến độ 10 câu (2026-11-13.27).
   - BẢNG ĐIỂM 4 NGƯỜI (mới, gọn): 4 thẻ điểm nhỏ — chân dung + tên + điểm; người tới lượt viền jade; vừa ghi điểm nháy gold.
     Dùng lại Thẻ điểm người chơi / NPC (2026-11-13.27) thu nhỏ. Dọc: hàng ngang trên cùng; ngang / máy: cột dọc một bên.
   - Nút "Rời tiệc" (dùng lại nút Rời bàn).
   - Chỉ dấu trên cảnh: chén lệnh viền vàng (vật 3D) + mũi tên / quầng nhỏ trên đầu người tới lượt (gợi ý).
1b. CHÉN ĐANG TRÔI: viên lượt "Chén lệnh đang trôi…" (dùng lại Viên lượt + 3 chấm). Không chặn nhìn mương.
1c. LƯỢT MÌNH — THẺ CÂU GHÉP CHỮ (mới, trọng tâm của phiếu):
   - Khung ghép chữ ô vuông lớn (ô giấy map-paper, lưới mờ chia theo kiểu ghép): PHẦN CÒN LẠI hiện đúng chỗ (vd. 可 bên phải),
     Ô BỘ THỦ TRỐNG nét đứt ở chỗ còn lại (bên trái). Ba kiểu ghép phải vẽ: trái-phải (氵+可 → 河), trên-dưới (艹+化 → 花),
     bao (门/門+口 → 問 — bao ngoài).
   - Dưới khung: nghĩa + pinyin "sông · hé" (chữ Việt to, pinyin nhỏ).
   - 4 Ô BỘ THỦ (1 đúng + 3 nhiễu): mỗi ô chữ bộ thủ to + âm Hán Việt nhỏ dưới ("氵 thuỷ") — dùng lại Ô nghĩa giấy (2026-11-13.27)
     với chữ Hán là nội dung. Chạm là chọn (không nút kiểm tra).
   - Thời gian 20 giây: vạch mảnh chạy quanh khung hoặc dưới khung, màu dịu (không đỏ chói); còn 5 giây hơi đậm hơn.
   - Dọc: thẻ ở nửa dưới màn, cảnh mương còn thấy phía trên. Ngang: thẻ một bên, cảnh bên kia. Máy: thẻ giữa-phải, phím 1–4 chọn ô.
1d. ĐÚNG: bộ thủ bay vào ô → chữ đầy đủ 河 hiện to giữa khung, dòng "hà · hé — sông", viên "Đúng rồi! +1 điểm" (dùng lại
   viên báo Đấu chữ), ô đúng ✓. SAI / HẾT GIỜ: ô chọn ×, ô đúng ✓, chữ đầy đủ hiện, viên "Uống phạt một chén!" (vui, không trách);
   nhân vật nâng chén (vật 3D).
1e. LƯỢT NPC: viên lượt "Tài Nữ đang nghĩ…"; thẻ câu của NPC HIỆN NHỎ, MỜ (để mình học theo, chạm không có gì); NPC chọn → ô của
   NPC có huy hiệu chân dung nhỏ (dùng lại huy hiệu NPC chọn — Đấu chữ), rồi đúng / sai như 1d (viên "Tài Nữ đúng · +1").
   Bong bóng trên đầu NPC "…" khi nghĩ (dùng lại Bong bóng trên đầu 2026-11-13.31).
1f. THẺ KẾT QUẢ VÁN: dùng lại Thẻ kết quả ván (2026-11-13.27) mở rộng: hạng của mình to ("Hạng nhất" / "Hạng nhì" / "Hạng ba" /
   "Hạng tư" — hoặc danh hiệu gợi ý "Thi khôi" cho hạng nhất), BẢNG XẾP HẠNG 4 DÒNG (chân dung, tên, điểm; bằng điểm cùng hạng),
   lời Thi Ông, dòng nhỏ "+8 Văn tiền" (hoặc "Hôm nay trò chơi đã đủ thưởng"), 2 nút "Ván mới" · "Rời tiệc".
   Trạng thái: thắng một mình · đồng hạng nhất · hạng tư · đủ trần thưởng.
1g. CHƯA ĐỦ BỘ: Thi Ông nói (khung thoại có sẵn) "Đạo hữu hãy Ngồi ôn học thêm vài bộ thủ, rồi lại đây cùng thả chén." + "Vâng
   (đứng dậy)" — chỉ cần vẽ 1 khung dọc, xác nhận khung thoại dùng lại được.
1h. GỢI Ý (không bắt buộc): khi đang ngồi nghỉ trên đệm Khúc Thuỷ (không có tiệc) — nút nổi nhỏ "Dự tiệc" trên đầu Thi Ông.

═══ 2. HÁI MĂNG SAU MƯA ═══

2a. NÚT NỔI "HÁI" trên măng gần nhất (đứng dưới 1,5 m): dùng lại Nút nổi luống (viên jade 46 + mũi nhọn, 2026-11-15.29), biểu
   tượng mới: măng / bàn tay hái. Hai biến thể: măng thường · măng to (thêm chấm vàng / chữ "Măng to"; măng to có bộ thủ đã học
   khắc mờ — vật 3D, không cần vẽ trên HUD). Máy tính: phím E nổi cạnh nút.
2b. NHÃN BAY khi hái: "+1 Măng" / "+1 Măng to" bay lên từ chỗ măng rồi mờ (cùng họ Nhãn lý do thưởng, không xu).
2c. CHIP LỨA MĂNG (mới, nhỏ, chỉ khi ở Trúc Lâm): "Măng hôm nay · đã hái 5 / 14" hoặc "Lứa chiều nhú sau mưa · 15:00" khi đã hái
   hết lứa sáng; trong lúc mưa: "Đang mưa phùn — măng sắp nhú". Gợi ý đặt cạnh bản đồ nhỏ hoặc dưới chip tên khu; không đè ví.
   Trạng thái: còn măng · hết lứa sáng chờ chiều · đang mưa · hết măng hôm nay ("Mai măng lại nhú").
2d. THẺ MĂNG CHỮ (hái măng to có bộ đã học): thẻ nhỏ không che hết cảnh — bộ thủ to (vd. 木) trên nền giấy hình vỏ măng (gợi ý),
   "Bộ này nghĩa là gì?", 3 phương án (dùng lại Phương án câu đố 2026-11-13.25 — chạm là chọn), kết quả: đúng "Đúng! ×2 — được 2 Măng
   to" · sai "Chưa đúng — mộc · cây. Vẫn được 1 Măng to". Tự đóng sau ~1,5 giây khi đã trả lời. Nhân vật đứng yên khi thẻ mở.
2e. BẢNG BÁN MĂNG Ở TRÚC ÔNG (thoại Trúc Ông → "Bán măng"): dùng lại Dòng kho nông sản (2026-11-15.29): đầu "Bán măng cho Trúc
   Ông", 2 dòng "Măng × 5 · 3 / cái · Bán" và "Măng to × 1 · 8 / cái · Bán", chân nút lớn "Bán hết · +23". Không có trần.
   Trạng thái: có măng · túi không có măng ("Túi con còn trống. Mưa chiều xong là măng lại nhú." — lời Trúc Ông) · vừa bán (ví
   "+23 · Bán măng", có xu bay). Dọc: tấm đáy · ngang / máy: cột phải. Trúc Ông: lão tiều phu, áo nâu, nón lá (chân dung giữ chỗ).
2f. MƯA PHÙN (chỉ ghi chú cho thiết kế, cảnh 3D lo): HUD không đổi theo mưa (R-NGAY-5) — chỉ chip 2c đổi chữ.
2g. NGĂN "LÂM SẢN" TRONG TÚI ĐỒ (tấm Túi đồ 2026-11-15.35 thêm mục thứ 5, sau Nông sản): chip "Măng × 5", "Măng to × 1"; trống →
   khung nét đứt "Hái măng ở rừng Trúc Lâm". Vẽ: dọc có măng · dọc trống · ngang · máy.

═══ 3. ĐÀN CẦM ═══

Vào: đứng gần tảng đá (dưới 1,2 m) → nút nổi "Ngồi đàn" (dùng lại Nút nổi "Ngồi" 2026-11-13.28, biểu tượng đàn). Ngồi → camera
thấp sau vai nhìn qua cây đàn ra bãi cỏ.
3a. TẤM CHỌN (vừa ngồi): 3 lựa chọn "Đàn tự do" · "Theo bài" · "Đứng dậy" — gợi ý dùng lại Mục chọn trên giấy (cuộn treo
   2026-11-13.31) hoặc khung thoại lựa chọn. "Theo bài" mở danh sách 3 bài (dùng lại Danh sách bài 2026-11-13.31): "Suối trúc" ·
   "Mưa măng" · "Trăng trên gò", mỗi dòng: độ dài (0:45), hạng tốt nhất hôm nay nếu có, dấu "đã thưởng hôm nay".
3b. ĐÀN TỰ DO — BÀN DÂY (mới): 10 phím = 5 dây ngũ cung × 2 quãng (2 hàng: quãng trầm dưới, quãng bổng trên), tên dây chữ Việt
   nhỏ "Cung · Thương · Giốc · Chuỷ · Vũ". Dáng: dây tơ nằm ngang trên thân đàn sơn đen, hoặc 10 phím giấy — tuỳ thiết kế; mỗi
   phím ≥ 44 px chạm, lướt ngón qua nhiều dây = gảy liên tiếp. Chạm → dây rung + gợn sáng (jade / gold nhạt). Nút "Đứng dậy",
   nút "Theo bài" nhỏ. Dọc: bàn dây chiếm 1/3 dưới màn. Ngang: bàn dây đáy rộng hết bề ngang trong safe area. Máy: phím 1–5
   (trầm) + Q W E R T (bổng) hiện trên phím.
3c. THEO BÀI — NỐT RƠI (mới): 5 làn dọc (ứng 5 dây), nốt tròn nhỏ rơi về VẠCH GẢY gần đáy; chạm làn đúng lúc. Phản hồi: "Hay"
   (gold) · "Được" (jade) · trượt (mờ, không chữ đỏ); thanh tiến độ bài mỏng trên cùng; tên bài. Tốc độ chậm (≤ 2 nốt / giây),
   một nốt một lúc. Nút tạm dừng / "Đứng dậy". Dọc: 5 làn giữa màn, cảnh mờ phía sau. Ngang: 5 làn giữa, hai bên thấy cảnh. Máy:
   phím 1–5 ứng 5 làn (D F G H J hoặc 1–5 — đề xuất, thiết kế chốt).
3d. THẺ KẾT QUẢ BÀI: dùng lại Thẻ kết quả ván: hạng "Tri âm" (≥ 85 %) · "Thanh nhã" (≥ 60 %) · "Tập đàn" (< 60 %), số Hay / Được /
   trượt, %, dòng "+5 Văn tiền" / "Bài này hôm nay đã thưởng", nút "Đàn lại" · "Chọn bài khác" · "Đứng dậy".
   Trạng thái: Tri âm · Tập đàn · đã thưởng hôm nay.

═══ 4. BẢNG CÁCH CHƠI (dùng lại khung Bảng cách chơi 2026-11-13.31, R-GIAO-2) ═══
Vẽ nội dung 3 bảng (dọc là đủ): Lưu Thương Lệnh · Hái măng · Đàn cầm — tên trò chữ Việt (đầu bảng KHÔNG có chữ Hán), mục đánh số,
hình minh hoạ giấy (mương + chén, măng + giỏ, đàn + làn nốt), ô mẹo NPC (Thi Ông / Trúc Ông / không NPC). Nút "Cách chơi" ở đá
khắc "Khúc Thuỷ Đài", đá đàn cầm, và biển gỗ nhỏ "Hái măng" ở rào Trúc Lư (hoặc chỉ qua thoại Trúc Ông — thiết kế chọn).

LUẬT PHẢI THEO (nháp, chưa vào sổ — tóm):
  R-LUU-1 vào qua thoại Thi Ông, ngồi đệm trống gần nhất, cần ≥ 3 bộ đã học; "Rời tiệc" / nút quay lại → đứng dậy.
  R-LUU-2 8 lượt (mình 4, không quá 2 lượt mình liền nhau); chén lệnh viền vàng trôi 3–6 giây, dừng trước người tới lượt.
  R-LUU-3 câu ghép: phần còn lại + nghĩa + pinyin, 4 ô bộ thủ kèm âm Hán Việt, chạm là chọn, đúng +1, sai / quá 20 giây uống phạt.
  R-LUU-4 NPC nghĩ 1,5–3 giây, câu NPC hiện mờ cho mình xem.
  R-LUU-5 hết ván xếp hạng 4 người → +8 / +5 / +3 Văn tiền (chung trần trò chơi 60 / ngày — R-TIEN-3), "Ván mới" · "Rời tiệc".
  R-MANG-1/2 2 lứa (5:00 · 8 măng; 15:00 · 6 măng, sau mưa phùn 14:50–15:00), mỗi lứa 1 măng to; 0:00 măng cũ héo.
  R-MANG-3 hái < 1,5 m, nút "Hái" / phím E, "+1 Măng". R-MANG-4 măng to có bộ đã học → 1 câu 3 phương án, đúng ×2.
  R-MANG-5 bán ở Trúc Ông: Măng 3, Măng to 8 Văn / cái, "Bán" + "Bán hết", không trần.
  R-CAM-1 "Ngồi đàn" 1,2 m, tấm chọn. R-CAM-2 tự do 10 phím. R-CAM-3 theo bài 5 làn, ±0,12 giây Hay, ±0,25 giây Được.
  R-CAM-4 Tri âm / Thanh nhã / Tập đàn → +5 / +3 / +1, mỗi bài 1 lần thưởng / ngày.
  R-TIEN-5 nhãn thưởng: "+8 · Thắng Lưu Thương", "+5 · Tri âm", "+23 · Bán măng". R-TUI-1 Túi đồ thêm ngăn Lâm sản.
  R-HUD-4 chỉ tiếng Việt ngoài nội dung học. R-THANH-1 thanh công cụ ẩn khi đang chơi.

CHUỖI MỚI (đặt tên khoá khi chốt, chỉ tiếng Việt):
  Lưu Thương: "Lưu Thương Lệnh", "Dự tiệc Lưu Thương", "Dự tiệc", "Rời tiệc", "Lượt {n} / 8", "Chén lệnh đang trôi…",
  "{tên} đang nghĩ…", "Ghép bộ thủ thành chữ", "Đúng rồi! +1 điểm", "Uống phạt một chén!", "{tên} đúng · +1",
  "{tên} chưa đúng", "Hạng nhất" / "Hạng nhì" / "Hạng ba" / "Hạng tư", "Thi khôi" (tuỳ), "Ván mới", "+{n} Văn tiền",
  "Hôm nay trò chơi đã đủ thưởng" (có sẵn), lời Thi Ông (thắng: "Hay! Chén này xin kính đạo hữu." · thua: "Ván sau ắt đạo hữu
  hơn lão." · chưa đủ bộ — 1g), tên NPC "Thi Ông", "Tú Tài", "Tài Nữ".
  Hái măng: "Hái", "+1 Măng", "+1 Măng to", "Măng hôm nay · đã hái {n} / {m}", "Lứa chiều nhú sau mưa · 15:00",
  "Đang mưa phùn — măng sắp nhú", "Mai măng lại nhú", "Bộ này nghĩa là gì?", "Đúng! ×2 — được 2 Măng to",
  "Bán măng", "Bán măng cho Trúc Ông", "Bán hết · +{n}", "+{n} · Bán măng", "Lâm sản", "Măng", "Măng to",
  "Hái măng ở rừng Trúc Lâm", tên NPC "Trúc Ông" + lời (2e).
  Đàn cầm: "Ngồi đàn", "Đàn tự do", "Theo bài", "Đứng dậy" (có sẵn), "Cung", "Thương", "Giốc", "Chuỷ", "Vũ", "Suối trúc",
  "Mưa măng", "Trăng trên gò", "Hay", "Được", "Tri âm", "Thanh nhã", "Tập đàn", "Đàn lại", "Chọn bài khác",
  "Bài này hôm nay đã thưởng", "+5 · Tri âm".

DÙNG LẠI (design/docs/components.md): Khung thoại · Nút nổi "Ngồi" / "Nói chuyện" · Nút nổi luống (Vườn rau) · Nút Rời bàn ·
Viên lượt · Viên tiến độ · Thẻ điểm · Thẻ kết quả ván · Ô nghĩa giấy + huy hiệu NPC chọn · Phương án câu đố · Viên báo đúng / sai
Đấu chữ · Bong bóng trên đầu · Nhãn lý do thưởng + xu bay · Dòng kho nông sản · Tấm Túi đồ · Bảng cách chơi · Mục chọn trên giấy /
Danh sách bài · Dải gợi ý phím (máy). Token: frost*, jade, gold, lacquer, map-paper, scroll-wood, slate, answer-right-bg /
answer-wrong-bg.

GỢI Ý (không bắt buộc): thẻ câu ghép như một tờ hoa tiên (giấy thơ) cài trên chén; ô bộ thủ như thẻ trúc (trúc giản) — hợp Trúc
Lâm; bàn dây đàn tối giản, ít chữ; măng chữ: bộ thủ khắc như vết dao trên vỏ.

APP ĐANG CÓ (để biết dùng lại gì):
  web/src/ui/gameHud.ts + gameView — HUD Đấu chữ / Ngũ Tử Kỳ (thẻ điểm, viên lượt, ô nghĩa, thẻ kết quả, Rời bàn) — 2026-11-13.27.
  web/src/ui/bagPanel.ts — Túi đồ 4 ngăn (2026-11-15.35). web/src/zones/vuonHud.ts — nút nổi luống, bảng kho (2026-11-15.29).
  web/src/ui/guideButton.ts + zones/gameGuides.ts — nút + bảng Cách chơi. web/src/ui/chatBubbles.ts — bong bóng trên đầu.
  web/src/ui/wallet.ts — ví, nhãn lý do, xu bay. Cảnh 3D (chén, măng, mưa, đàn, NPC) do code dựng — không cần vẽ.
```
