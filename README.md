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

1. Trên điện thoại: Cài đặt → Thông tin điện thoại → chạm 7 lần vào "Số hiệu bản tạo" để bật Tuỳ chọn nhà phát
   triển → bật **Gỡ lỗi USB**. Cắm cáp, chọn "Cho phép" khi máy hỏi.
2. Kiểm tra máy đã nhận: `flutter devices`.
3. Chạy:

   ```sh
   cd web && npm run build      # luôn build lại sau khi sửa web/
   cd ../app && flutter run     # chọn máy Android nếu có nhiều thiết bị
   ```

App xoay tự do (dọc, ngang). Cảnh vẽ tràn viền; HUD tự tránh tai thỏ và thanh hệ thống.

Cách app hiển thị cảnh: Flutter mở một máy chủ http nhỏ ngay trong app (`InAppLocalhostServer`, chỉ nghe
127.0.0.1:8080) phục vụ `assets/scene/`, rồi WebView mở `http://localhost:8080/`. Không mở thẳng file vì trình
duyệt chặn ES module tải từ `file://`.

## Debug WebView

Ở bản debug (`flutter run`), WebView cho phép soi bằng Chrome trên máy tính:

1. Cắm điện thoại, app đang chạy.
2. Mở Chrome trên máy tính, vào `chrome://inspect/#devices`.
3. Dưới tên máy sẽ có mục `http://localhost:8080/index.html` → bấm **inspect**: xem console, phần tử HTML,
   hiệu năng (tab Performance) như trang web bình thường.

Log `console.log` của scene cũng hiện trong terminal `flutter run` với tiền tố `[scene]`.
iOS (từ 16.4): Safari trên Mac → menu Develop → tên máy → trang scene.

Màn trắng / "Không tải được cảnh 3D": thường do chưa `npm run build` (thư mục `app/assets/scene/` trống).
