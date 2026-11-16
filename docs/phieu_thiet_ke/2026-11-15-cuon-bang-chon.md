# Phiếu: Cuộn Ngồi ôn thành bảng chọn lưới ô (trải ngang)
- Trạng thái: chờ thiết kế   (→ đã áp (<mã>) · bỏ (<lý do>))
- Đã vẽ: 2026-11-16.12 (Q3 = "Tĩnh toạ" / ấn "Tĩnh"; giấy 16 : 9 giữ)
- Đợi bởi: kế hoạch `docs/tasks/2026-11-15-cuon-bang-chon.md` (V-20261114-45; nhiệm vụ 4, 5, 6). **Duyệt 2026-11-16**: Q1-A Trúc
  Lão, Q2 có ô Nhiệm vụ, Q4 model tạm (khối). **Q3 chưa chốt** — code giữ "Ngồi ôn" / "Đang ôn" / ấn "Ôn"; thiết kế đề xuất tên
  (người dùng gợi ý "Học", kế hoạch đề xuất "Tĩnh toạ") để người dùng chọn.
- Code đã có (nhánh `viec/cuon-bang-chon`): hành vi + dữ liệu 3 mục, in tạm theo kiểu 3 dòng của 2026-11-14.21 trên giấy cũ
  0,26 × 0,35 (ngón trỏ tay phải). Luật đã chép vào sổ: R-ON-8, R-HANH-8 (mã mới — thay "R-HANH-6" trong bản nháp), R-DIEU-7…
- Cảnh đổi sau khi soạn phiếu: vùng tên **Trúc Lâm**, không còn "Cửa rừng" — Trúc Lão đứng ở mép bắc **bãi hạc đáp** (−3,6; 33,2).
- Thay: phần "mục trên cuộn" của thiết kế 2026-11-14.21 (`NgoiMat-*`) + chỉnh V-43 (giấy 0,26 × 0,35).
- Điểm học bộ mới ở Rừng trúc (Trúc Lão) **không cần UI mới** — dùng khung thoại + nút "Nói chuyện" đã có (R-NPC-2). Chỉ cần
  ảnh cận mặt nếu làm model riêng (`/tai-nguyen`, ngoài phiếu này).

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Cuộn bảng chọn lưới ô khi ngồi (Học Xá 3D)

Màn: khung cảnh 3D nhìn từ mắt lúc NGỒI (R-DIEU-7) — hai tay cầm cuộn tay mở trước mặt; chữ / hình vẽ LÊN giấy cuộn
(canvas 2D dán lên mặt giấy 3D). THAY bố cục 3 dòng mục "Ôn bộ đến hạn / Học bộ mới / Xem bộ đã học" của 2026-11-14.21.

Cần gì: cuộn giống BẢNG CHỌN CHỨC NĂNG trong game, không còn danh sách dòng. Giấy trải NGANG rộng; các chức năng thành
Ô VUÔNG có hình vẽ + tên; "Đứng dậy" ở góc. Ôn và học bộ mới KHÔNG còn trên cuộn (học ở thầy Trúc Lão — Trúc Lâm;
ôn ở bảng nhiệm vụ "Ôn ngay").
Mở khi: ngồi tại chỗ (nút "Tĩnh toạ" — tên mới đề xuất của "Ngồi ôn"; phím C) đủ 1 giây ở bất kỳ đâu, hoặc ngồi bồ đoàn khu
tự học tầng 2 Tàng Thư Các. Đóng khi: "Đứng dậy", joystick, bấm lại nút, Esc / nút quay lại.

Hình 3D trong code (vẽ lên đó; chụp nền bằng Canvas 3D ?dang=ngoi-mat):
- Giấy mới 0,48 × 0,27 m (≈ 16 : 9; cũ 0,26 × 0,35) — được đề xuất tỉ lệ khác nếu cần (ghi rõ). Hai trục gỗ đứng ở hai mép
  trái / phải (dài 0,29 m), đầu trục jade viền gold; hai tay cầm hai trục NGOÀI mép giấy.
- Cầm giữa màn. Màn ngang 844×390: giấy cao ~66 % chiều cao (~258 px), rộng ~458 px — cảnh + hai tay hai bên.
  Màn dọc 390×844: giấy rộng ~90 % bề ngang (~351 px), cao ~197 px, giữa màn (cảnh trên / dưới).
- Bố cục px thiết kế gợi ý (code dùng để tính vùng chạm): dọc 352 × 198 · ngang 464 × 261.

Nội dung giấy:
- Đầu cuộn: dòng nơi đang ngồi ("Khởi Nguyên Trấn · Quảng Trường" / "Trúc Lâm · Bãi giữa") + tiêu đề cuộn + ấn son
  (chữ Việt — R-HUD-4; tiêu đề / ấn đề xuất "Tĩnh toạ" / "Tĩnh" theo Q3) + nút "Đứng dậy" GÓC TRÊN PHẢI.
- Một hàng 4 ô (dọc và ngang cùng 4 ô một hàng):
  1. Đọc sách — hình: cuốn sổ từ / bìa mini màu cuốn (như thẻ "Đọc sách" 2026-11-13.28). Dòng phụ: tên cuốn đang mượn
     ("HSK 1 · Nhập môn"). Chưa mượn → ô mờ, lý do "Mượn ở Tàng Thư Các".
  2. Bộ đã học — hình: chồng thẻ tre / cuộn nhỏ. Dòng phụ "5 / 50 bộ". Chưa học bộ nào → mờ, "Chưa học bộ nào".
  3. Nhiệm vụ hôm nay — hình: bảng gỗ nhỏ. Dòng phụ "Còn 1 việc" / "Đã xong hôm nay"; chấm son = số việc còn lại
     (0 → không chấm). Mở bảng nhiệm vụ (có "Ôn ngay"). [Nếu Q2 = không: ô này thành "Sắp có".]
  4. Sắp có — ô nét đứt, không chữ phụ, không chạm (chừa chỗ chức năng sau).
- Chưa học bộ nào → dòng gợi ý dưới hàng ô, luôn ĐỦ CÂU (xuống dòng, chữ nhỏ lại nếu chật, không cắt):
  "Chưa học bộ nào. Sang Trúc Lâm, gặp Trúc Lão ở bãi hạc đáp để học bộ đầu tiên."

Trạng thái phải vẽ — mỗi trạng thái DỌC 390×844 và NGANG 844×390:
1. Đang mượn sách + đã học 5 bộ + còn 1 việc (ở trấn, Quảng Trường): 3 ô dùng được + "Sắp có".
2. Chưa mượn sách + đã học (ở Trúc Lâm): "Đọc sách" mờ "Mượn ở Tàng Thư Các".
3. Chưa mượn + chưa học bộ nào (mới cài app, ở trấn): "Đọc sách", "Bộ đã học" mờ, Nhiệm vụ dùng được, dòng gợi ý đủ câu.
4. Vừa chạm một ô: ô sáng nhấn, NGÓN TRỎ của tay GẦN ô chạm vào ô (ô 1–2 → tay trái, ô 3–4 → tay phải) — khung trước khi
   màn mở. Vẽ cả trường hợp ô 1 (tay trái) và ô 3 (tay phải).
5. Chạm ô mờ: không mở, không vệt vàng — có cần phản hồi nhẹ (rung / lắc ô) không? đề xuất.
6. Đóng màn (sổ từ / Bộ đã học / bảng nhiệm vụ) → cuộn hiện lại ngay trong tay, ô cập nhật (vd. Nhiệm vụ "Đã xong hôm nay").
7. Bồ đoàn khu tự học tầng 2 Tàng Thư Các: như 1, nền nội thất.
8. Nhìn quanh: kéo lệch 60° sang phải — cuộn trôi ra mép trái (kiểm giấy rộng hơn vẫn đẹp khi trôi).
Màn nhỏ nhất 360×640 dọc và 640×360 ngang: ô ≥ 70 × 90 px, "Đứng dậy" ≥ 44 px cao; ghi cỡ chữ tên ô / dòng phụ ra px màn.
Lúc yên không tay nào đè chữ / ô.

Luật phải theo (docs/testing/quy_tac.md — bản ĐỀ XUẤT trong kế hoạch docs/tasks/2026-11-15-cuon-bang-chon.md mục 4, chờ
duyệt — đã chép vào sổ 2026-11-16): R-ON-8 (viết lại: lưới ô), R-DIEU-7 (tên nút, chấm son chỉ số bộ đến hạn, nhìn quanh
±60° / ngẩng 20° / cúi 70° giữ nguyên), R-VA-4 (bồ đoàn: cuộn như R-ON-8), R-SACH-2/3 (ô Đọc sách mở sổ ở trang đã nhớ),
R-NV-3 (ô Nhiệm vụ mở bảng), R-HANH-8 (mới — Trúc Lão), R-HUD-4 (không chữ Hán trên tiêu đề / ấn son / tên ô; chữ Hán chỉ ở
nội dung học — trên cuộn này không có).

Chuỗi có sẵn (design/l10n/vi.arb): standUp, viewLearned (đổi thành "Bộ đã học"?), viewLearnedSub, viewLearnedNone,
readBook ("Đọc sách"), reviewScroll / reviewScrollSeal (tiêu đề / ấn cũ "Ngồi ôn" / "Ôn" — đổi theo Q3).
Chuỗi mới cần đặt: tên ô "Nhiệm vụ hôm nay" + dòng phụ ("Còn {n} việc", "Đã xong hôm nay"); "Sắp có"; lý do "Mượn ở Tàng
Thư Các"; dòng phụ sách "{book} · {subtitle}"; gợi ý mới (thay hintGoForest); tên nút "Tĩnh toạ" / "Đang tĩnh toạ" (Q3);
nhãn trợ năng từng ô (code thêm nút ẩn đọc màn hình).
Chuỗi thôi dùng trên cuộn: reviewDue*, learnNew*, learnAtForest, learnAllDone*.

Dùng lại: giấy map-paper, scroll-wood, jade, gold, lacquer, slate, #5E6A70; kiểu mục 2026-11-14.21 (nổi bật / thường / mờ
nét đứt + lý do) → áp cho ô; bìa mini màu cuốn của thẻ "Đọc sách" (2026-11-13.28); chấm son của nút "Xem bảng" / cụm nút.

Gợi ý (không bắt buộc): ô như "triện gỗ khảm" trên giấy, hình vẽ nét mực đơn giản (code vẽ bằng canvas 2D — hình nên dựng
được bằng đường / khối đơn giản hoặc SVG path); hàng ô có thể bắt nhịp với nếp cuộn (mỗi ô một "khung" giữa hai nếp giấy).

App đang có:
- web/src/scene/cuonSach.ts + cuonSachNhip.ts — cuộn 3D, nhịp mở 0,3 → 1 s, giấy 0,26 × 0,35 (sẽ đổi).
- web/src/zones/cuonMuc.ts + web/src/ui/cuonMucPaint.ts — bố cục + vẽ 3 dòng mục hiện tại (V-43: dọc 343 × 462, ngang 250 × 337).
- web/src/ngoiMat.ts — chạm lên giấy (u, v) → mục; ngón trỏ tay phải chỉ mục.
- web/src/ui/readBookButton.ts — thẻ "Đọc sách" HUD (bìa mini màu cuốn).
- app/lib/lesson/daily_screen.dart — bảng nhiệm vụ ("Ôn ngay"); learned_screen.dart — Bộ đã học; sổ từ Flutter (openBook).
```
