# Phiếu: Bảng nhiệm vụ hằng ngày 日課榜 + màn ôn câu đố
- Trạng thái: chờ thiết kế
- Đã vẽ: 2026-11-13.25
- Đợi bởi: kế hoạch `docs/tasks/2026-11-13-nhiem-vu-hang-ngay.md` (nhiệm vụ 7). Logic đã làm: lịch ôn, hai việc mỗi ngày,
  chuỗi ngày (Flutter, có test); câu đố dựng sẵn ở trang (`openReview`); bảng hỏi qua `openDaily`. Hiện Flutter chưa có
  màn → ngồi thiền vẫn ra thẻ bộ mới, "Hôm nay có việc gì?" thì Tiểu Mặc đọc bảng bằng khung thoại. Thay phiếu cũ
  `2026-11-13-bang-vinh-danh.md` (bỏ).

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Bảng nhiệm vụ hằng ngày 日課榜 + màn ôn câu đố (Học Xá 3D)

Bối cảnh: tấm bảng gỗ trước cổng nam sân Ngoại Môn (khung gỗ, giấy ngà kẻ dòng, tiêu đề 日課榜), Tiểu Mặc đứng trông.
Mỗi ngày bảng giao 2 việc; làm xong cả 2 thì ngày đó được tính vào chuỗi. Quy luật lấy từ app Hán Tự Ký (Ôn hôm nay,
mục tiêu ngày, chuỗi điểm danh) — có thể tham khảo cách trình bày bên đó cho quen tay người dùng.

Cần vẽ (dọc 390×844 + ngang 844×390):
1. BẢNG NHIỆM VỤ (màn Flutter phủ cảnh, hoặc tấm giấy mở ra từ bảng):
   - Việc 1 "Lĩnh hội": n/3 bộ thủ mới hôm nay (đủ → dấu xong). Học hết 50 bộ → việc tự xong.
   - Việc 2 "Ôn tập": còn n bộ đến hạn (0 → xong); có bộ đến hạn → nút "Ôn ngay" (mở màn 2 ngay tại tông môn).
   - Chuỗi: "tu liền N ngày" + kỷ lục. Xong cả 2 việc → trạng thái "hôm nay đã xong" (dấu son?).
   - Trạng thái: mới cài (0/3, không bộ nào cần ôn, chuỗi 0) · đang dở · xong cả 2 · chuỗi dài.
   - Nút đóng / nút quay lại của máy.
2. MÀN ÔN CÂU ĐỐ (Flutter): lượt gồm các bộ đến hạn; mỗi bộ 2 câu: PINYIN rồi NGHĨA, mỗi câu 3 phương án.
   - Đầu câu: chữ bộ thủ lớn (vd. 竹). Chọn (đổi được) rồi bấm "Kiểm tra" mới chấm (như Hán Tự Ký).
   - Đúng / sai: phản hồi + đáp án đúng; hết 2 câu → kết quả bộ đó (nhớ rõ 2/2 · một phần 1/2 · chưa nhớ 0/2) và
     hạn ôn kế ("3 ngày nữa").
   - Hết lượt: tổng kết (số bộ nhớ rõ / chưa nhớ), nút về cảnh. Thoát giữa lượt được (bộ chưa chấm vẫn đến hạn).
   - Thanh tiến độ lượt (bộ 2/5).
3. NÚT "XEM BẢNG" nổi gần bảng (đứng dưới 2,5 m) — đề xuất dùng lại kiểu nút "Nói chuyện" (thiết kế 2026-11-13.9).
4. (tuỳ) Chấm báo trên bảng 3D / trên Tiểu Mặc khi hôm nay còn việc chưa xong.

Luật phải theo (docs/testing/quy_tac.md):
- R-NV-1: 2 việc — Lĩnh hội 3 bộ mới / ngày (quá 3 vẫn được), Ôn hết bộ đến hạn; ngày đổi lúc 0 giờ.
- R-NV-2: xong cả 2 → ngày được tính tự động (không có nút điểm danh); bỏ 1 ngày → chuỗi về 0; giữ kỷ lục.
- R-NV-3: mở bảng bằng nút "Xem bảng" hoặc hỏi Tiểu Mặc "Hôm nay có việc gì?"; đang mở nhân vật đứng yên.
- R-ON-1…4: bậc 1·3·7·14·30·60·120 ngày; 2/2 lên bậc, 1/2 lùi bậc, 0/2 về bậc 1; 120 đúng → đã thuộc (180 ngày).
- R-ON-5: ngồi thiền ở Rừng trúc khi còn bộ đến hạn → màn ôn mở thay thẻ bộ mới; nút "Ôn ngay" trên bảng.
- R-MAN-1: HUD ngoài vùng bị che (safe area).

Chuỗi mới: tên 2 việc, "Ôn ngay", "Kiểm tra", "Xem bảng", kết quả 3 mức, "tu liền N ngày", kỷ lục, tổng kết lượt.
Dùng lại: token HUD, khung thoại / nút "Nói chuyện" (2026-11-13.9), thẻ học bộ thủ (2026-11-13.9), màu vàng #d4a64a.
App đang có: app/lib/journey/{review,daily,progress_store}.dart · web/src/zones/review.ts (câu đố) · docs/bridge.md
(`getProgress.daily`, `openReview`, `openDaily`) · app/lib/lesson/radical_screen.dart (thẻ bộ thủ).
Ảnh bảng trong cảnh: design/screens/Canh-tieu-mac-bang.png.
```
