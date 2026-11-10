# Phiếu: Khởi tạo cảnh 3D (đặc tả + Canvas 3D)

- Trạng thái: chờ thiết kế
- Đợi bởi: kế hoạch `docs/tasks/2026-11-10-thiet-ke-3d.md` (việc 7)

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Khởi tạo cảnh 3D (Học Xá 3D)

Lệnh: /ui-design canh khởi tạo — làm theo mục "Cảnh 3D" trong skill ui-design.

Cần gì:
- Tạo design/scene/scene.json rút từ code: cd web && npm ci && npm run build:design, chép
  web/dist-design/scene.default.json thành design/scene/scene.json. KHÔNG đổi giá trị nào (giống lần khởi tạo
  token: chỉ đưa cảnh hiện tại ra file).
- npm run scene:check → phải "Không có lỗi"; vùng lop-hsk3 tâm (0; -6,4) r 2,6 và thu-vien tâm (-8,6; 4) r 2,4.
- Tạo Canvas 3D: đăng web/dist-design/design.html (files: mọi file web/dist-design/assets/* ở đường dẫn assets/<tên>)
  thành một artifact mới tên "Canvas 3D Học Xá". Mở thử: bảng bên trái báo "Đọc từ design/scene/scene.json",
  "Không có lỗi"; bật/tắt khung va chạm, vùng, lưới; ba nút góc nhìn.
- Tạo design/scene/README.md: dòng "Canvas 3D: <link>", một đoạn ngắn: file này là gì, ai ghi (phiên thiết kế),
  code đọc thẳng lúc build, kiểm bằng npm run scene:check, khuôn ở web/src/scene/spec.ts.
- Sửa design/README.md: thêm dòng bảng cho scene/ (đặc tả cảnh 3D + Canvas 3D); câu "Cảnh 3D không vẽ trên canvas"
  → "Cảnh 3D không vẽ trên canvas 2D: thiết kế bằng scene/scene.json + Canvas 3D".
- Chốt: CHANGELOG mục mới, loại "cảnh 3D", ghi "ngoại hình + bố cục: không đổi so với code (khởi tạo)".

Luật phải theo (không được đổi ở lần khởi tạo):
- R-VA-1: Nhân vật (bán kính 0,5) không đi xuyên tường, nhà, giếng và cây trong sân; cây vòng ngoài tường không có
  va chạm. Ví dụ: mặt trong tường bắc ở z = −20,5 → đi thẳng lên bắc thì dừng ở z = −20,0.
- R-VUNG-1: Nhân vật đứng cách tâm vùng nhỏ hơn bán kính thì hiện thẻ mời của vùng đó; ra ngoài thì thẻ ẩn.
  Ví dụ: vùng lớp HSK 3 tâm (0; −6,4), bán kính 2,6.

Dùng lại: token màu trong design/tokens/design_tokens.json (bảng Canvas 3D đã theo token).
App đang có: cảnh dựng ở web/src/scene/*, đọc đặc tả ở web/src/scene/loadSpec.ts; chưa có file thì dùng
DEFAULT_SCENE trong web/src/scene/spec.ts (đúng bằng cảnh hiện tại).
```
