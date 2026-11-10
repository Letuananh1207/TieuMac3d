# TieuMac3d — Học Xá 3D

App mobile thử nghiệm: một "học xá" low-poly, người dùng điều khiển một nhân vật đi trong sân,
đến gần lớp học thì hiện thẻ mời vào học chữ Hán.

| Thư mục | Nội dung |
|---|---|
| `web/` | Scene 3D: Three.js + TypeScript + Vite. Build ra file tĩnh, chạy offline. |
| `app/` | App Flutter (Android, iOS), hiển thị scene bằng WebView. |
| `reference/hoc-xa-3d.html` | Prototype gốc (chạy thẳng trên trình duyệt). Chỉ để tham khảo, không sửa. |

## Cài đặt

Cần Node.js ≥ 20 và Flutter (đang dùng 3.41).

```sh
cd web && npm install
cd ../app && flutter pub get
```

## Build scene 3D

```sh
cd web
npm run build   # kiểm kiểu TS → build vào web/dist → tự chép sang app/assets/scene/
```

`app/assets/scene/` là file sinh tự động, không commit, không sửa tay. Clone về máy mới thì phải
chạy `npm run build` trước khi chạy app.

Thử nhanh trên trình duyệt (có hot reload): `npm run dev`, rồi mở địa chỉ "Network" bằng điện thoại
cùng mạng Wi-Fi. Trên máy tính dùng WASD / phím mũi tên và chuột.

## Cấu trúc `web/src/`

| Thư mục | Việc |
|---|---|
| `scene/` | renderer, trời/đèn/sân, tường, giảng đường, cây, giếng |
| `player/` | hình nhân vật (`Character`) và bộ điều khiển di chuyển |
| `input/` | joystick, camera quay quanh nhân vật + chụm zoom, chạm để đi, bàn phím |
| `collision/` | va chạm hình tròn với hộp chữ nhật trên mặt sân |
| `zones/` | dữ liệu vùng sự kiện + bài học, theo dõi vào/ra vùng |
| `ui/` | HUD, thẻ mời, bảng bài học (HTML) |

## Chạy trên máy Android thật

_Mốc 2 sẽ bổ sung mục này (WebView + localhost server)._

## Debug WebView

_Mốc 2 sẽ bổ sung mục này (chrome://inspect)._
