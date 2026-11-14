# Phiếu: Nhà người dùng (Nhà của ta) — nơi trên bản đồ, HUD trang trí
- Trạng thái: đã áp (2026-11-14.13)
- Đã vẽ: 2026-11-14.13 (mục 1–3; mục 4 thẻ tên khu bỏ — R-HUD-3)
- Đợi bởi: kế hoạch `docs/tasks/2026-11-14-nha-nguoi-dung.md` (nhiệm vụ 5, 8, 9). Cảnh 3D của nhà làm riêng bằng
  `/canh` (`design/scene/nha-ta.json`), không thuộc phiếu này.

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Nhà người dùng: Nhà của ta 我家 (Học Xá 3D)

Bối cảnh: mỗi người chơi có một tiểu viện riêng (nhà chính 3 gian + sân trước + vườn bên), đi tới từ bản đồ truyền
tống như các vùng. Trong nhà, sân, vườn có ~12 Ô TRANG TRÍ đặt sẵn; mỗi ô thuộc một loại (Vườn · Sân · Trong nhà) và
chỉ nhận vật hợp loại. Mốc này mọi vật đều có sẵn; SAU NÀY vật mua bằng tiền tệ riêng (kiếm bằng chơi game) — chừa chỗ
cho giá / số tiền nhưng chưa hiện.

Cần vẽ (dọc 390×844 + ngang 844×390):
1. BẢN ĐỒ TRUYỀN TỐNG: thêm nơi "Nhà của ta" (biểu tượng mái nhà nhỏ / cổng viện) — vẽ lại ban-do-goc.png +
   thêm mục "noi" trong ban-do.json. Đề xuất đặt gần Văn Uyên Tông (Trung Nguyên) hoặc một ô riêng ngoài lục địa.
2. NÚT "TRANG TRÍ" trên HUD — chỉ hiện ở Nhà của ta, ẩn khi mở bản đồ / khung thoại / ngồi thiền.
3. CHẾ ĐỘ TRANG TRÍ (bấm nút trên):
   - Trong cảnh các ô hiện dấu (ô trống: khung mờ + dấu "+"; ô có vật: viền sáng). Thiết kế màu / kiểu dấu ô.
   - Chạm một ô → BẢNG DANH MỤC (nửa dưới màn dọc / cột phải màn ngang): lưới thẻ vật hợp loại ô, mỗi thẻ: hình
     nhỏ, tên Việt, chữ Hán; thẻ đang đặt ở ô này có dấu chọn. Có nút "Gỡ" khi ô đang có vật.
   - Chạm thẻ → vật hiện ngay ở ô (xem trước), bảng vẫn mở để đổi tiếp.
   - Nút "Xong" thoát chế độ trang trí. Đang trang trí: nhân vật đứng yên, kéo màn vẫn xoay camera.
   - Chừa chỗ (chưa hiện) cho: giá vật, số tiền đang có, nhãn "Chưa có" / "Mua".
   - Mẫu danh mục: Vườn — Trúc cảnh 竹, Mai 梅, Tùng 松, Đá Thái Hồ 石, Ao sen 蓮 · Sân — Đèn lồng 燈, Bàn trà 茶,
     Chậu lan 蘭, Lư hương 爐 · Trong nhà — Tranh chữ 書, Kệ sách 架, Án đọc 案, Bình phong 屏.
4. (tuỳ) Tên khu khi bước vào: "Nhà của ta" + 我家 (giống chip tên khu đang có).

Luật phải theo (docs/testing/quy_tac.md, mục NHA — đang soạn):
- R-NHA-1: tới Nhà của ta từ bản đồ truyền tống; có vòng trận ở chỗ xuất hiện để đi tiếp.
- R-NHA-2: mỗi ô một vật, chỉ vật hợp loại ô; đặt / thay / gỡ.
- R-NHA-3: nhà giữ nguyên qua tắt app; là của riêng người chơi (không ai khác thấy — chưa có mạng).
- R-NHA-4: danh mục; mốc này sở hữu hết.
- R-MAN-1: HUD ngoài vùng bị che (safe area).

Chuỗi mới: "Nhà của ta", "Trang trí", "Xong", "Gỡ", "Vườn", "Sân", "Trong nhà", tên các vật ở trên.
```
