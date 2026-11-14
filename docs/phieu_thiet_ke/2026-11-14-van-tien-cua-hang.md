# Phiếu: Ví Văn tiền 文錢 (HUD) · hiệu ứng nhận tiền · Cửa hàng đồ trang trí
- Trạng thái: chờ thiết kế
- Đã vẽ: 2026-11-14.12
- Đợi bởi: ý tưởng `docs/y_tuong/2026-11-14-van-tien.md` (hướng A); kế hoạch `/lead Văn tiền — ví và luật thưởng` (chưa
  mở). Liên quan phiếu `2026-11-14-nha-nguoi-dung.md` (HUD trang trí — bảng danh mục chừa chỗ giá / tiền: hai phiếu nên
  dùng chung một kiểu thẻ vật).

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Ví Văn tiền 文錢 + Cửa hàng đồ trang trí (Học Xá 3D)

Bối cảnh: người chơi kiếm Văn tiền (đồng xu đồng lỗ vuông) khi học bộ mới, ôn đúng hạn, xong nhiệm vụ ngày, giữ chuỗi
ngày, chơi trò chữ; tiêu vào đồ trang trí Nhà của ta (13 vật). Nguồn lớn nhất luôn là HỌC. Không tiền thật, không hộp
ngẫu nhiên, không trao đổi, không trừ tiền khi nghỉ. Chưa có mạng — một người chơi, lưu trên máy.

1) VÍ TRÊN HUD (web, lớp nổi trên cảnh 3D)
   - Viên nhỏ: đồng xu lỗ vuông + số dư (vd. "1 280"). Luôn hiện khi đi lại; ẩn khi mở bài / màn ôn / bản đồ / thoại NPC /
     bàn cờ (như các nút HUD khác). Chạm ví → (tuỳ thiết kế) thẻ nhỏ "Văn tiền kiếm từ đâu" hoặc không làm gì.
   - Chỗ đặt do thiết kế chọn, KHÔNG che joystick (trái dưới), cụm nút hành động + nút Trò chuyện (phải dưới), khung kênh
     chung thu gọn. R-HUD-1 chỉ cấm chip tên khu và nút đổi góc nhìn ở góc trên — góc trên đặt ví được, nhưng các bản HUD
     gần đây để góc trên trống: thiết kế cân nhắc.
   - Trạng thái: thường · số lớn (99 999) · vừa cộng (số nảy + "+20") · vừa trừ khi mua · 0.

2) HIỆU ỨNG NHẬN TIỀN
   - Khi được thưởng: 1–5 đồng xu bay từ nguồn (thẻ học / màn ôn / bảng nhiệm vụ / bàn trò) vào ví, số dư đếm lên.
   - Đồng xu khắc chữ: mặt trước 文錢, mặt sau CHỮ / BỘ THỦ vừa học hoặc vừa ôn (vd. 竹) — đồng xu là "thẻ chữ" nhỏ.
   - Nhãn ngắn kèm lý do: "+10 · Học bộ 竹", "+5 · Ôn đúng 木", "+20 · Xong nhiệm vụ ngày", "+50 · Chuỗi 7 ngày",
     "+8 · Thắng Đấu chữ". Thưởng trò đã chạm trần ngày: nhãn "Hôm nay trò chơi đã đủ thưởng" (không có xu).
   - Cần vẽ: khung hình hiệu ứng (vài khung / mô tả thời lượng) trên màn thẻ học bộ thủ (Flutter) và trên HUD (web).

3) CỬA HÀNG ĐỒ TRANG TRÍ (màn mới)
   - Mở khi: nói chuyện với chủ tiệm / chạm nút nổi ở tiệm tạp hoá phố chợ Khởi Nguyên Trấn (công trình `cua-hang` có sẵn).
     Đóng: nút đóng / quay lại → về cảnh, nhân vật đứng yên khi màn mở.
   - Đầu màn: tên tiệm (thiết kế đặt, vd. "Tạp hoá" + chữ Hán 雜貨 hoặc 錢) + ví (số dư).
   - Lọc theo loại ô: Vườn · Sân · Trong nhà (hoặc tất cả).
   - Lưới thẻ vật: hình nhỏ, tên Việt, chữ Hán, giá (số + số chữ Hán nhỏ, vd. "50 · 五十文"), trạng thái:
     chưa có (nút "Mua") · đã có (nhãn "Đã có", không mua lại) · chưa đủ tiền (nút mờ + "Còn thiếu 30").
   - Chạm "Mua" → xác nhận (hình vật, giá, số dư sau khi mua) → mua xong: tiền trừ, thẻ đổi "Đã có", gợi ý "Về nhà đặt
     vật" (không tự đưa về nhà).
   - Trạng thái phải vẽ: vài vật đã có + đủ tiền · nghèo (hầu hết chưa đủ tiền) · đã mua hết · hộp xác nhận · vừa mua xong.
   - Dọc 390×844 + ngang 844×390.

4) BẢNG DANH MỤC TRANG TRÍ Ở NHÀ (phiếu 2026-11-14-nha-nguoi-dung, mở rộng)
   - Thẻ vật chưa sở hữu: khoá + giá + "Mua ở Tạp hoá phố chợ" (không mua ngay trong nhà — thiết kế có thể đề xuất khác).
   - Người mới có sẵn vài vật khởi đầu (đề xuất: Trúc cảnh, Đèn lồng, Tranh chữ — chờ luật).

Luật phải theo (docs/testing/quy_tac.md):
- R-NHA-4 (đang có, SẼ SỬA): "Danh mục và sở hữu: danh mục có 13 vật — Vườn: Trúc cảnh 竹, Mai 梅, Tùng 松, Đá Thái Hồ 石,
  Ao sen 蓮 · Sân: Đèn lồng 燈, Bàn trà 茶, Chậu lan 蘭, Lư hương 爐 · Trong nhà: Tranh chữ 書, Kệ sách 架, Án đọc 案, Bình
  phong 屏. Người chơi chỉ đặt được vật đã sở hữu; giai đoạn này người chơi sở hữu sẵn mọi vật (chưa có tiền tệ, chưa có
  cửa hàng — sau này mua bằng tiền tệ riêng, sẽ thêm quy tắc). Sở hữu và đang đặt lưu riêng: gỡ vật khỏi ô không làm mất
  quyền sở hữu." → sẽ đổi thành: có sẵn vài vật khởi đầu, còn lại mua bằng Văn tiền.
- R-NHA-2: "Một vật đặt được ở nhiều ô cùng lúc (không giới hạn số lượng, tới khi có tiền tệ)." → mua một lần là đặt được
  nhiều ô (đề xuất giữ — thiết kế ghi rõ nếu muốn khác).
- R-HUD-1: "Góc trên màn hình không có chip tên nơi / tên khu và không có nút đổi góc nhìn."
- R-MAN-1: "chữ và nút của HUD luôn nằm ngoài vùng bị che."
- (mới, đang soạn — nhóm R-TIEN-*, theo docs/y_tuong/2026-11-14-van-tien.md): nguồn + mức thưởng (học bộ mới +10; ôn
  đúng 2/2 +5, 1/2 +2; xong 2 việc nhiệm vụ ngày +20; chuỗi 7 ngày +50; trò chữ thắng / hoà / thua +8 / +5 / +3, Ngũ Tử Kỳ +3,
  trò cộng lại tối đa 60 / ngày; đọc xong 1 chương +10); mua cần đủ tiền, trừ tiền, vào sở hữu; số dư không âm; không mất
  khi nghỉ. Giá 13 vật 30–200 theo độ hiếm (bảng giá thiết kế đề xuất).

Chuỗi mới (design/l10n/vi.arb): "Văn tiền", "Tạp hoá" (hoặc tên tiệm khác), "Mua", "Đã có", "Còn thiếu {n}", "Mua {vật}
với {n} Văn tiền?", "Đã mua — về nhà để đặt", "Mua ở Tạp hoá phố chợ", nhãn thưởng ("+{n} · Học bộ {chữ}", "+{n} · Ôn đúng
{chữ}", "+{n} · Xong nhiệm vụ ngày", "+{n} · Chuỗi {d} ngày", "+{n} · Thắng / Hoà / Thua {trò}", "Hôm nay trò chơi đã đủ
thưởng"), "Tất cả", "Vườn", "Sân", "Trong nhà".

Dùng lại (design/docs/components.md): chấm son đếm + nút tròn kính (HUD); danh mục sách Tàng Thư Các (DanhMuc-*, màn
Flutter có lưới + xác nhận + "đang giữ") — gần nhất với cửa hàng; thẻ học bộ thủ (nơi hiệu ứng xu bay ra); bảng nhiệm vụ
(nguồn +20); token jade / gold / lacquer / map-paper. Đồng xu: vàng đồng (gold) — chữ vàng trên nền sáng không đủ tương
phản, số dư dùng slate.

Gợi ý (không bắt buộc): ví dạng viên kính nhỏ cạnh nút Trò chuyện hoặc góc trên phải; cửa hàng là màn Flutter như Danh
mục sách; đồng xu mặt sau đổi chữ theo bài vừa học.

App đang có: chưa có tiền tệ. web/src/zones/decor.ts — danh mục 13 vật (id, tên, chữ Hán, loại ô, chặn đường, price = 0
chưa dùng). Danh mục sách: app/lib/lesson/library_screen.dart (màn Flutter tương tự). Thẻ học bộ thủ: app/lib/lesson/radical_screen.dart.
Bảng nhiệm vụ: app/lib/journey/ (Flutter). Công trình cửa hàng cua-hang trong cảnh (vào được).
```
