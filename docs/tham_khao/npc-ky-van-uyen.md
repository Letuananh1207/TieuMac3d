# NPC khu trò chơi Kỳ Văn Uyển 棋文苑 — thiếu nữ hoạt bát (小妹)
- Ngày: 2026-11-14 · Khu: Kỳ Văn Uyển (sân chơi Ngũ Tử Kỳ + Đấu chữ) · Trạng thái: đã chọn hướng C (người dùng 2026-11-14) ·
  đã chuyển phiếu ảnh `docs/phieu_thiet_ke/2026-11-13-anh-quan-su.md` (design 2026-11-14.18) (mã NPC giữ `quan-su` cho tới khi phiên code đổi)

## Một câu
NPC trông coi sân chơi Kỳ Văn Uyển: không phải quản sự trung niên như phiếu cũ mà là **một người trẻ năng động** (yêu cầu người
dùng 2026-11-14): thiếu nữ ≈ 16 tuổi, nhanh nhảu, hay đố người chơi — "chủ trò" của sân.

## Đặc điểm nhận diện
1. **Hai búi tóc** tròn hai bên đỉnh đầu (雙髻 — kiểu tóc thiếu nữ / thị nữ trẻ trong tranh Tống), buộc dải xanh ngọc rủ ngắn.
2. **Áo ngắn giao lĩnh** (短衫) hồng đào, viền ngọc lục ở cổ và cửa tay; **vạt trái đè vạt phải** (chữ "y").
3. **Váy ngắn quá gối** xanh ngọc thẫm trên **quần bó** ngà (váy ngắn + quần để chạy nhảy — quy ước nhân vật trẻ trong phim
   cổ trang; suy luận, không phải lễ phục Tống).
4. **Đai** ngọc lục thắt nút trước, hai đuôi ngắn.
5. Giày vải nâu. Mặt tròn, **nét mặt dịu dàng** (người dùng 2026-11-14): mắt hiền cong nhẹ, mỉm cười khép miệng, lông mày thư thái — dáng người nhanh nhẹn nhưng mặt hiền.

## Hướng (đã trình 3, người dùng chọn C)
- A thiếu niên kỳ thủ (đen + dải ô cờ, đuôi ngựa) — bỏ.
- B thiếu niên áo bó màu hạnh (khăn buộc trán, ủng) — bỏ.
- **C thiếu nữ hoạt bát — chọn**: thêm một NPC nữ trẻ (hiện chỉ có thủ thư), màu ấm sáng tách khỏi Mặc Ông (chàm), Tiểu Mặc
  (trắng), thủ thư (thanh lục), Tiểu nhị (màu trà).

## Màu
| Vai trò | Hex | Ghi chú |
|---|---|---|
| Áo ngắn | `#E7A3A8` hồng đào | màu chủ |
| Viền cổ, cửa tay, đai | `#2B5446` | jade của dự án |
| Váy | `#4F8C7A` xanh ngọc thẫm | |
| Dải buộc tóc | `#3FA58A` | |
| Quần bó | `#F4F0E6` ngà | |
| Giày | `#3A2418` | |
| Tóc | `#1E1C1E` | tối đều cho bước nướng |
| Da / má | `#F0CDB5` / `#E9A99A` | |

## Đưa vào cảnh / luật
- Model: `/tai-nguyen nhan-vat quan-su` (giữ mã để khớp `npcs` trong đặc tả; đổi mã là việc phiên code).
- Luật R-NPC-4 hiện xưng "tại hạ", gọi "đạo hữu", tên "Quản sự 管事" → **đề xuất** đổi: tên gọi thiếu nữ (vd. "Kỳ Muội 棋妹"),
  xưng "muội", gọi "đạo hữu"; nội dung lựa chọn giữ nguyên. Phiên code hỏi người dùng rồi sửa sổ + `dialogs.ts`.

## Sai thường gặp cần tránh
- Cổ áo vạt phải đè trái (左衽).
- Dải tóc dài bay rời — giữ ngắn, sát đầu.
- Váy xoè rộng che mất hai chân — để thấy rõ hai giày (gắn xương).

## Nguồn
- Yuanlingshan / Panling Lanshan (Wikipedia) — https://en.wikipedia.org/wiki/Yuanlingshan — loại áo cổ tròn Tống (đã xét cho hướng B, bỏ)
- List of hanfu headwear — https://en.wikipedia.org/wiki/List_of_hanfu_headwear — búi / khăn đầu
- Song Clothing (ancient-history-sites) — https://www.ancient-history-sites.com/song/daily-life/work-and-community-life/clothing-and-personal-care/ — trang phục thường ngày, áo ngắn cho người lao động / trẻ
