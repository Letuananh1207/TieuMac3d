# Phiếu: Màn bài học (Flutter, mốc 3)

- Trạng thái: đã áp (2026-11-11.10)
- Đã vẽ: 2026-11-11.10
- Đợi bởi: mốc 3 (cầu nối Flutter ↔ 3D) — chưa có kế hoạch `docs/tasks/`

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Màn bài học (Học Xá 3D)

Màn / widget: Màn bài học chữ Hán, màn Flutter native che toàn bộ cảnh 3D.

Cần gì:
- Mở khi người chơi đứng trong vùng lớp học, bấm nút chính trên thẻ mời ("Vào nghe giảng" / "Vào đọc sách").
- Hiện một chữ Hán: chữ lớn, pinyin, nghĩa tiếng Việt, và các dòng thông tin phụ dạng nhãn → giá trị.
- Có nút quay lại sân. Đóng màn thì cảnh 3D chạy tiếp đúng chỗ cũ.

Các trạng thái phải vẽ:
1. Dọc 390×844 — chữ 快 (4 dòng phụ: Bộ "忄 tâm đứng", Nét "7", Từ "快乐 kuàilè · vui vẻ", HSK "2").
2. Ngang 844×390 — cùng nội dung (app xoay tự do; chiều cao chỉ 390, tai thỏ có thể ở bên trái hoặc phải).
3. Dọc — chữ 書 (dòng "Giản thể: 书", từ dài "图书馆 túshūguǎn · thư viện") để thấy chữ dài xuống dòng.
Chừa vùng an toàn: thanh trạng thái / tai thỏ phía trên (dọc), hai bên (ngang), thanh điều hướng phía dưới.

Luật phải theo:
- R-VUNG-3: Bấm nút chính trên thẻ thì mở bài học của vùng; khi bài học đang mở, nhân vật đứng yên (joystick, phím,
  điểm chạm đều không có tác dụng); đóng bài học thì thẻ không hiện lại cho tới khi ra khỏi vùng.
- R-MAN-1: App xoay tự do theo máy (dọc và ngang). Cảnh 3D phủ kín màn hình, kể cả dưới tai thỏ và thanh hệ thống;
  chữ và nút của HUD luôn nằm ngoài vùng bị che.

Chuỗi có sẵn: "Ra sân" (nút quay lại), nhãn "Bộ", "Nét", "Từ", "HSK", "Giản thể".
Chuỗi mới: tuỳ thiết kế (vd. tiêu đề màn) — ghi vào design/l10n/vi.arb.

Dùng lại được: token bảng đen (board #2F3A2C, board-frame #5A3B22, board-chalk #F5F1E3, board-text #DFE6D6),
gold #E0AE4C cho pinyin / nhãn, nút chính lacquer #B5352B bo pill, font Lora (pinyin), Be Vietnam Pro (chữ),
Noto Serif SC (chữ Hán). Xem artboard "Bảng token" và design/docs/components.md.

Gợi ý (không bắt buộc): giữ cảm giác "bảng đen trong lớp học" của bản HTML hiện tại; màn ngang có thể đặt chữ lớn
bên trái, thông tin bên phải; nút "Ra sân" đủ lớn (≥ 44 px) và dễ với bằng ngón cái.

App đang có gì: bảng bài học HTML trong scene (web/src/ui/lessonBoard.ts, CSS .board trong web/src/style.css) —
bảng đen khung gỗ giữa màn, lớp phủ tối phía sau, chữ Hán 140 px, pinyin vàng, nghĩa, danh sách nhãn → giá trị,
nút đỏ "Ra sân". Mốc 3 thay bảng này bằng màn Flutter.
```
