# Phiếu: Dòng gợi ý HUD — bỏ "chạm mặt đất để đi tới đó"
- Trạng thái: chờ thiết kế (code đã sửa trước — chỉ bỏ một vế, không thêm chữ mới)
- Đã vẽ: 2026-11-13.19
- Đợi bởi: không (đồng bộ canvas với code)

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Sửa chữ dòng gợi ý lần đầu trên HUD (Học Xá 3D)

Chạm mặt sân không còn làm nhân vật đi (luật R-DIEU-2 đổi 2026-11-13: "Chạm ngắn vào mặt sân không làm nhân vật đi — nhân
vật chỉ đi bằng joystick hoặc bàn phím."). Dòng gợi ý lần đầu còn vế sai.
Cũ:  "Kéo nửa trái để đi · kéo nửa phải để xoay · chạm mặt đất để đi tới đó · chụm 2 ngón để zoom"
Mới (code đang dùng, web/index.html #hint): "Kéo nửa trái để đi · kéo nửa phải để xoay · chụm 2 ngón để zoom"
Sửa ở: source/HUD-doc.dc.html, HUD-ngang.dc.html (và HUD-A/B/C nếu còn dùng), design/l10n/vi.arb nếu có khoá này.
Tuỳ chọn: thêm gợi ý nút hành động (Nhảy / Chào / Thiền) nếu muốn — khi đó ghi chuỗi mới, code áp sau.
```
