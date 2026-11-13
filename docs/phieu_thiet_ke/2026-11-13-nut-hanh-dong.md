# Phiếu: Nút hành động trên HUD — nhảy, chào, ngồi thiền
- Trạng thái: chờ thiết kế
- Đợi bởi: kế hoạch `docs/tasks/2026-11-13-chay-nhay-hanh-dong.md` (nhiệm vụ 6 — nối nút vào logic đã có)

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Nút hành động trên HUD (Học Xá 3D)

Màn: HUD (lớp nổi trên cảnh 3D) — sửa artboard HUD-doc, HUD-ngang (mục 2026-11-11.3), thêm trạng thái.
Cần gì: ba nút hành động cho điện thoại — logic đã làm xong, trên máy tính đang dùng phím:
  1. NHẢY (phím Space) — bấm thường xuyên nhất, cần to và dễ với ngón cái phải.
  2. CHÀO — chắp tay chào kiểu cổ trang 拱手 (phím F).
  3. NGỒI THIỀN — bấm để ngồi xếp bằng, bấm lại (hoặc đi) để đứng dậy (phím C). Nút có trạng thái "đang ngồi".
Mở khi: luôn hiện khi đang chơi; ẩn khi mở bài học và khi màn tải còn hiện (R-MAN-2, R-VUNG-3).

Trạng thái phải vẽ:
- Dọc 390×844 và ngang 844×390, theo đúng HUD hiện có (chip góc trên trái, nút góc nhìn, joystick dưới trái).
- Nút bình thường / đang nhấn / NGỒI THIỀN đang bật (khác hẳn khi tắt) / nút bị vô hiệu (đang bay không chào / ngồi được).
- HUD có cùng lúc: nút học nổi (R-VUNG-1) và các thành phần HUD hành trình (phiếu 2026-11-13-hanh-trinh-hud) —
  xếp sao không đè nhau.

Luật phải theo (nguyên văn trong docs/testing/quy_tac.md):
- R-DIEU-1: Ngón tay chạm vào 45% bên trái màn hình thì thành joystick (mỗi lúc một joystick); chạm chỗ khác thì kéo để
  xoay camera, hai ngón thì chụm để zoom. → các nút đặt ở NỬA PHẢI, chạm nút không được tính là kéo xoay camera.
- R-DIEU-6: Nhảy … chỉ nhảy được khi đang đứng trên đất, không ngồi, không mở bài học.
- R-DIEU-7: Ngồi thiền … bấm lại hoặc điều khiển đi thì đứng dậy rồi đi. Chào … khoảng 1,6 giây; đi thì thôi chào.
  Đang bay không ngồi / chào được.
- R-MAN-1: chữ và nút của HUD luôn nằm ngoài vùng bị che (tai thỏ, thanh hệ thống; dùng safe area).

Chuỗi: không bắt buộc có chữ (biểu tượng là đủ); nếu có nhãn nhỏ: "Nhảy", "Chào", "Thiền" (chuỗi mới — thêm design/l10n/vi.arb).
Dùng lại: token màu / bo góc / frost của HUD (design/tokens/design_tokens.json), kiểu nút góc nhìn hiện có
(design/docs/components.md).
Gợi ý (không bắt buộc): cụm nút góc dưới phải như game hành động di động — nút Nhảy lớn (≈ 64–72 px), Chào và Thiền
nhỏ hơn xếp vòng cung quanh nó; biểu tượng nét cổ trang (đám mây / bàn tay chắp / đệm thiền).
App đang có: web/src/ui/hud.ts (chip, nút góc nhìn, dòng hướng dẫn), web/src/input/joystick.ts (joystick nửa trái);
nhảy / chào / ngồi gọi PlayerController.jump() / bow() / toggleSit() (web/src/player/controller.ts).
```
