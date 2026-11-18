# Kế hoạch: Túi đồ kiểu 摩尔 — mẫu "Giấy + son" (V-20261118-116)

- Yêu cầu: làm lại giao diện Túi đồ theo thiết kế 2026-11-18.13 (`design/concept/tui-do-kieu-moly/giay-son.png`,
  phiếu `docs/phieu_thiet_ke/2026-11-18-anh-tui-do-kieu-moly.md`). Người dùng đã chọn mẫu → làm luôn.
- Phạm vi: **chỉ lớp giao diện** (`web/src/ui/bagPanel.ts`, `bag.css`, khung `#bagPanel` trong `toolbar.css`) + renderer
  nhân vật nhỏ `web/src/ui/bagPortrait.ts`; ghép ở `thanhCongCu.ts` / `main.ts` (vài dòng). Dữ liệu / luật túi
  (`zones/tuiDo.ts`) giữ nguyên — V-114 (nông trại) đang thêm món nông sản, giao diện tự hiện mọi món từ `BagView`.

## Bố cục

- Cuốn sổ mở giữa màn (giấy kem, viền gỗ nâu, gáy giữa). Trang trái: dải tên → khung ảnh nhân vật 3D (kéo ngang để
  xoay; nền trời kem + đồi cỏ CSS; huy hiệu ngọc góc dưới phải) → dòng tiền đồng + số Văn tiền.
- Trang phải: lưới 3×4 ô giấy kem viền nâu, hình món + số góc dưới phải; ô chọn viền son; dòng chi tiết dưới lưới
  (chưa chọn → dòng gợi ý "Chỉ xem…" / ngăn trống); lật trang "‹ 1/1 ›" (12 món / trang).
- Cột tab chỉ hình dọc mép phải ngoài sổ, tab chọn nền đỏ son: giữ đủ 6 ngăn đang có theo thứ tự `BAG_TABS`
  (Hạt giống · Đồ làm vườn · Nông sản · Lâm sản · Sách · Trang trí). Đồ làm vườn = 5 nông cụ (không số) + Phân bón × n
  trong cùng lưới; Trang trí = ô vật, số = trong túi, chi tiết "Trong túi n · Đang đặt m"; Sách = ô sách, chi tiết có nút "Đọc".
- Nút đóng tròn đỏ son góc trên phải sổ. Đóng: nút đóng, chạm cảnh, nút quay lại / Esc, bấm lại Túi đồ (bỏ kéo tấm xuống).
- Màn dọc: thẻ nhân vật thu gọn thành một hàng trên lưới (ảnh nhân vật nhỏ bên trái, tên + tiền bên phải).

## Nhân vật 3D

- `BagPortrait` (ui): WebGLRenderer riêng trên `<canvas>` trong khung, nền trong suốt, pixelRatio ≤ 1,5, chỉ chạy
  vòng vẽ khi túi mở; đóng → dừng vòng + giải phóng renderer (`forceContextLoss`). Model là **một bản nhân vật thứ hai**
  từ `createPlayerCharacter(?nhan-vat)` (nạp một lần lúc mở túi lần đầu) — ui không import player: nhận hàm dựng qua tham số.

## Luật

- Sửa R-TUI-1 (bố cục mới + đóng) → đồng bộ online → `--mark-synced`.

## Kiểm

- `tsc`, `npm test` (thêm test lật trang `ui/bagPages.test.ts`), `npm run build`, `flutter analyze`, `check.dart`, `rule_trace`.
- Chụp ngang 900×600 + dọc 390×844 (Canvas 3D `?dang=hai-mang&hud=tui`) → `design/screens/TuiDo-moly-{ngang,doc}.png`.
