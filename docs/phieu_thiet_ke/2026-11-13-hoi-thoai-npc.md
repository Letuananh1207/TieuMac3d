# Phiếu: Hội thoại với NPC — nút "Nói chuyện" + khung thoại có lựa chọn
- Trạng thái: đã áp (2026-11-13.9)
- Đã vẽ: 2026-11-13.9
- Đợi bởi: kế hoạch `docs/tasks/2026-11-13-bo-cham-di-hoi-thoai.md` (nhiệm vụ 4 — nối giao diện vào logic đã có),
  luật R-NPC-2 (App: sửa)

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Hội thoại với NPC (Học Xá 3D)

Màn: HUD (lớp nổi trên cảnh 3D) — thêm 2 thành phần, vẽ trên HUD-doc 390×844 và HUD-ngang 844×390.
Cần gì: nói chuyện với NPC kiểu game nhập vai (Genshin…): lại gần NPC → nút "Nói chuyện"; bấm → khung thoại ở
nửa dưới màn hình với lời NPC và các lựa chọn trả lời. Logic + lời thoại đã có; chỉ thiếu giao diện.

1) Nút "Nói chuyện"
- Hiện khi đứng cách NPC dưới 2,5 m (không mở bài học, không ngồi thiền); ra xa thì ẩn.
- Gợi ý vị trí: nổi cạnh NPC hoặc ở nửa phải màn (cạnh cụm nút hành động — phiếu 2026-11-13-nut-hanh-dong); kèm tên NPC.
- Trạng thái: hiện / đang nhấn.

2) Khung thoại
- Tên NPC (Tiểu Mặc · 小墨), lời thoại (1–3 dòng), 1–3 nút lựa chọn xếp dọc; chạm một lựa chọn → lời tiếp theo.
- Câu nào cũng có "Tạm biệt" (đóng). Đang mở: joystick ẩn / mờ (nhân vật đứng yên), các nút khác của HUD ẩn hoặc mờ.
- Trạng thái phải vẽ: câu chào (3 lựa chọn) · câu dài nhất (xem lời dưới) · câu 2 lựa chọn · dọc + ngang · safe area.
- Gợi ý (không bắt buộc): giấy / lụa nền ngà, viền mực, tên NPC dạng bảng gỗ nhỏ; chữ chạy dần (typewriter) — ghi rõ
  nếu muốn, code làm; có thể có chân dung NPC (ảnh design/models/anh/tieu-mac-mat.png).

Luật phải theo (nguyên văn docs/testing/quy_tac.md):
- R-NPC-2: Người chơi đứng cách NPC dưới 2,5 m (không mở bài học, không ngồi thiền) thì hiện nút "Nói chuyện" gần NPC;
  ra xa từ 2,5 m trở lên thì ẩn. Bấm nút → khung thoại: tên NPC, lời thoại, 1–3 lựa chọn; chọn một lựa chọn → lời tiếp
  theo; câu nào cũng có lựa chọn "Tạm biệt" (đóng khung thoại). Đang thoại: nhân vật đứng yên (joystick, phím không có
  tác dụng), NPC nhìn người chơi; đóng xong đi lại được.
- R-DIEU-1: joystick ở 45 % trái màn — khung thoại không được để nút lựa chọn rơi vào vùng đó khi ngang? (khi đang
  thoại joystick không có tác dụng nên được phép phủ, nhưng ghi rõ cách xử lý).
- R-MAN-1: nút và chữ nằm ngoài vùng bị che (safe area).

Lời thoại Tiểu Mặc (đã có trong code web/src/zones/dialogs.ts — dùng đúng chữ):
- [chao] "Đạo hữu mới đến Văn Uyên Tông à? Tiểu Mặc là đệ tử ngoại môn, hôm nay được giao canh cổng Sơn Môn đó!"
  → "Tiểu Mặc canh cổng làm gì?" · "Hôm nay Tiểu Mặc thế nào?" · "Tạm biệt"
- [canh-cong] "Đón người mới chứ sao! Ai bước qua cổng này là bắt đầu đường tu chữ — học thêm một chữ, thêm một phần tu vi."
  → "Tu chữ ở đâu?" · "Hỏi chuyện khác" · "Tạm biệt"
- [tu-chu] (dài nhất) "Vào giảng đường nghe giảng, sang thư viện ôn bài. Cứ đi thẳng qua cổng trăng là tới. Chăm chỉ là
  lên cảnh giới nhanh lắm!" → "Hỏi chuyện khác" · "Tạm biệt"
- [hom-nay] "Vui lắm! Sáng nay Tiểu Mặc luyện kiếm xong còn thuộc thêm ba chữ mới. Đạo hữu cũng cố lên nha!"
  → "Tiểu Mặc giỏi quá!" · "Hỏi chuyện khác" · "Tạm biệt"
- [khen] "Hì hì, đạo hữu khen làm Tiểu Mặc đỏ mặt mất. Mau đi học kẻo trễ giờ giảng đấy!" → "Hỏi chuyện khác" · "Tạm biệt"

Chuỗi mới (design/l10n/vi.arb): "Nói chuyện"; các lời thoại trên (hoặc giữ trong dữ liệu hội thoại — ghi rõ).
Dùng lại: token HUD (frost, bo góc, chữ Be Vietnam Pro / Lora / Han Serif), kiểu nút học nổi (components.md).
App đang có: chưa có khung thoại; nút học nổi web/src/ui/learnButton.ts là thành phần gần nhất (nút nổi trên vật).
```
