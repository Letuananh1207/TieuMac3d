# Mốc 2 — scene chạy trong Flutter WebView trên Android

- Yêu cầu: "Chạy được scene trong Flutter WebView trên Android. Giữ nguyên điều khiển cảm ứng; tắt zoom/scroll của
  WebView; xử lý safe area." + màn hình: "cho xoay tự do".
- Loại: thêm · Cỡ: vừa · Trạng thái: xong (chờ thử trên máy Android thật)

## Phạm vi

**Sẽ sửa**
- `app/pubspec.yaml` — thêm `flutter_inappwebview` (ghim 6.1.5)
- `app/lib/main.dart` — khởi động server cục bộ, giao diện tràn viền, xoay tự do
- `app/lib/scene/` (mới) — server + màn chứa WebView, đẩy safe area sang JS
- `app/lib/theme/app_colors.dart` (mới) — màu nền khi cảnh chưa tải
- `app/android/app/src/main/AndroidManifest.xml` + `res/xml/network_security_config.xml` — quyền INTERNET, cho phép http tới localhost
- `app/ios/Runner/Info.plist` — cho phép http tới localhost
- `web/src/style.css` — safe area lấy max(env(), biến CSS do Flutter đặt); bố cục màn ngang
- `docs/bridge.md` (mới) — ghi hợp đồng biến CSS safe area
- `app/test/` — thay test mẫu đếm số

**Cần kiểm tra**: `web/index.html` (viewport), `.claude/skills/hoc-xa-3d-dev/references/app_flutter.md` (cập nhật mẫu thật)

**Không đụng**: logic điều khiển trong `web/src/input/` (giữ nguyên hành vi)

## Giả định / cần quyết định
- Giao diện tràn viền, thanh trạng thái trong suốt (không ẩn hẳn) — game toàn màn hình kiểu ẩn thanh thì hỏi sau.
- Cổng server cục bộ 8080.

## Nhiệm vụ
- [x] 1. Thêm gói, quyền mạng cục bộ Android + iOS
- [x] 2. Server cục bộ + màn WebView (tắt zoom/cuộn, gỡ lỗi chrome://inspect ở bản debug)
- [x] 3. Safe area: Flutter đẩy viewPadding thành biến CSS; CSS dùng max(env(), var())
- [x] 4. Bố cục màn ngang (bảng bài học, dòng hướng dẫn)
- [x] 5. Test Dart cho chuỗi JS safe area; `flutter build apk --debug` thành công
- [x] 6. README: chạy trên Android thật, debug WebView

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npm run build · cd app && flutter analyze && flutter test ·
flutter build apk --debug · chụp headless dọc 390×844 và ngang 844×390
