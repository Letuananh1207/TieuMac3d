# Phiếu: HUD làm lại toàn bộ (3 hướng để chọn)

- Trạng thái: chờ thiết kế
- Đợi bởi: kế hoạch `docs/tasks/2026-11-11-nang-cap-do-hoa.md` (C1, C2)
- Liên quan: phiếu `2026-11-10-man-bai-hoc.md` (màn bài học vẽ cùng chất liệu với hướng được chọn)

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — HUD làm lại toàn bộ (Học Xá 3D)

Lệnh: /ui-design HUD làm lại — vẽ 3 hướng, người dùng chọn một rồi vẽ đủ.
Đọc trước: docs/tham_khao/hud-co-trang.md (bố cục, 3 hướng, chữ, sai thường gặp),
design/scene/phong_cach.md (bảng màu cảnh), design/tokens/design_tokens.json, design/docs/components.md.

Màn / widget: lớp HUD nổi trên cảnh 3D (toàn màn hình, cảnh ban ngày, nền sáng: trời lam, tường vôi trắng).

Cần gì:
- Người dùng thấy HUD hiện tại "không chuyên nghiệp": mỗi thành phần một chất liệu (chip kính mờ, thẻ gỗ, bảng đen),
  màu lấy từ bản chạng vạng cũ trong khi cảnh nay là ban ngày.
- Làm lại thành MỘT bộ thống nhất, hợp phong cách tông môn tiên hiệp, ít thứ trên màn, đọc rõ trên nền sáng.

Bước 1 — 3 hướng (vẽ cùng một màn mẫu: Ngoại Môn, đứng trước giảng đường, thẻ mời đang hiện; dọc 390×844):
  A. Giấy dó · mực tàu (水墨) — giấy ngà, viền nét bút, nút chính là dấu ấn đỏ.
  B. Gỗ son · vàng kim (朱漆描金) — gỗ sẫm viền vàng mảnh, mây lành ở góc.
  C. Ngọc bích · lụa (青玉) — kính mờ lạnh, đường mảnh, điểm vàng nhỏ.
  Mỗi hướng một artboard. Dừng chờ người dùng chọn.

Bước 2 — hướng đã chọn, vẽ đủ các thành phần và trạng thái (dọc 390×844 VÀ ngang 844×390; tai thỏ có thể ở trái hoặc phải):
  1. Chip tên khu (trên trái): "Văn Uyên Tông · Ngoại Môn"; ngoài mọi khu chỉ "Văn Uyên Tông"; tên khu dài nhất "Văn Uyên Tông · Linh Dược Viên".
  2. Thẻ tên khu (MỚI): hiện lớn giữa màn ~2 s khi bước vào khu mới, chữ Hán + tên Việt (vd. 外門 · Ngoại Môn), rồi mờ.
  3. Joystick: vòng nền + núm (hiện ở chỗ ngón chạm) và dấu gợi ý "kéo để đi" khi chưa chạm.
  4. Nhãn tên trên đầu nhân vật ("Tuấn Anh").
  5. Dòng hướng dẫn lần đầu ("Kéo nửa trái để đi · kéo nửa phải để xoay · chạm mặt đất để đi tới đó · chụm 2 ngón để zoom").
  6. Thẻ mời: eyebrow ("Tùng tùng tùng! Giờ giảng"), tiêu đề có chữ Hán ("Thầy giảng chữ 快 ở giảng đường"),
     nút chính ("Vào nghe giảng") + nút phụ ("Để sau"). Thêm trạng thái tiêu đề dài 2 dòng.
  7. Nút góc nhìn ("Góc nhìn: gần" / "Góc nhìn: cả sân").
  8. Màn tải (MỚI): lúc mở app, trước khi cảnh 3D hiện (vài giây): tên nơi, chữ Hán 文淵宗, tiến trình.
  9. fps: chỉ chế độ gỡ lỗi — vẽ một kiểu nhỏ, kín đáo.

Luật phải theo:
- R-DIEU-1: Ngón tay chạm vào 45% bên trái màn hình thì thành joystick (mỗi lúc một joystick); chạm chỗ khác thì kéo để
  xoay camera, hai ngón thì chụm để zoom. Chuột không dùng joystick.
- R-VUNG-2: Bấm "Để sau" thì thẻ ẩn và không hiện lại khi còn đứng trong vùng đó; ra khỏi vùng rồi quay lại thì hiện lại.
- R-VUNG-3: Bấm nút chính trên thẻ thì mở bài học của vùng; khi bài học đang mở, nhân vật đứng yên (joystick, phím,
  điểm chạm đều không có tác dụng); đóng bài học thì thẻ không hiện lại cho tới khi ra khỏi vùng.
- R-HUD-1: Chip góc trên trái hiện "<tên nơi> · <tên khu>" khi nhân vật đứng trong một khu (hình chữ nhật đặt trong
  đặc tả cảnh); đứng ngoài mọi khu thì chỉ hiện "<tên nơi>". Hai khu chồng nhau thì lấy khu khai báo trước. Đổi chữ
  ngay khi bước qua ranh giới.
- R-MAN-1: App xoay tự do theo máy (dọc và ngang). Cảnh 3D phủ kín màn hình, kể cả dưới tai thỏ và thanh hệ thống;
  chữ và nút của HUD luôn nằm ngoài vùng bị che.
- Nút chạm ≥ 44 pt; chữ tương phản ≥ 4,5 : 1 trên cả nền trời sáng lẫn tường vôi trắng.

Chuỗi có sẵn: mọi chữ ở trên (index.html, ui/*.ts, zones.ts); tên nơi / khu trong design/l10n/vi.arb (siteName, area*).
Chuỗi mới cần đặt: chữ Hán cho từng khu (外門, 山門, 演武場, 弟子居, 靈藥園, 煉丹房 — có trong design/scene/tong_mon.md);
chữ màn tải → design/l10n/vi.arb.

Dùng lại được: bảng màu cảnh (son #A8322A, vàng kim #D4A64A, ngọc lục #2B5446, giấy #F3E6C8, mực #1F1610), font
Be Vietnam Pro (thân, tiếng Việt), Lora (tiêu đề), chữ Hán thư pháp chỉ cho chữ Hán (font thư pháp không có dấu tiếng Việt).
Thống nhất một màu son + một màu vàng (token cũ #B5352B / #E0AE4C lệch với cảnh) → cập nhật design_tokens.json.

Gợi ý (không bắt buộc): khuyên A hoặc C cho cảnh ban ngày; hoạ tiết 1–2 thứ, ở góc; hoạ tiết vẽ được bằng SVG/CSS
(không ảnh bitmap). Có thể dùng ảnh AI làm ý tưởng hoạ tiết rồi vẽ lại.

App đang có gì: web/index.html (DOM HUD), web/src/style.css (77 dòng, token CSS ở :root, safe area --sa-*),
web/src/ui/hud.ts (PlaceChip, NameTag, FpsCounter, hint, nút góc nhìn), web/src/ui/eventCard.ts (thẻ mời),
web/src/input/joystick.ts. Ảnh cảnh: design/screens/Canh-giang-duong.png.
```
