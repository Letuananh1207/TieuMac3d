# App Flutter (app/)

Flutter 3.41, gói `hoc_xa_3d` (org `com.tieumac`), Android + iOS. Lint `flutter_lints` mặc định.
Chưa có: quản lý trạng thái, router, DI, l10n, lưu trữ, mạng ngoài — không tự thêm, hỏi người dùng.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `lib/main.dart` | khởi động: giao diện tràn viền, bật gỡ lỗi WebView (debug), mở server, `HocXaApp` |
| `lib/scene/` | mọi thứ về scene web: `scene_server.dart`, `scene_view.dart`, `safe_area_script.dart` |
| `lib/theme/app_colors.dart` | màu (`AppColors`) — lấy từ bảng màu web; `Color(0x…)` chỉ viết ở đây (`W-MAU`) |
| `test/<thư mục>/<file>_test.dart` | test cùng đường dẫn với `lib/` |

## Mẫu đang dùng

- Trạng thái: `StatefulWidget` + `setState` (`SceneView`). Chưa có thư viện trạng thái.
- Thứ cần truyền xuống: tham số constructor (`HocXaApp(server: …)`), không singleton.
- Chuỗi giao diện tiếng Việt viết thẳng trong widget (chưa l10n). Chữ lỗi kèm gợi ý cách sửa.
- Comment tiếng Việt, nói vì sao (người dùng mới làm game).

Gửi gì sang trang web → hàm thuần tạo chuỗi JS, test được không cần WebView:

```dart
// lib/scene/safe_area_script.dart
String safeAreaScript(EdgeInsets padding) { … }   // → '(function(s){s.setProperty(…)})(document.documentElement.style);'

// lib/scene/scene_view.dart
@override
void didChangeDependencies() {
  super.didChangeDependencies();
  _sendInsets(); // xoay máy / đổi thanh hệ thống → MediaQuery đổi → gọi lại
}
```

## WebView (`flutter_inappwebview` 6.1.5, ghim cố định)

- Server: `InAppLocalhostServer(port: 8080, documentRoot: 'assets/scene/')`, `start()` bọc `timeout` vì thư viện
  treo khi cổng bận.
- Cài đặt trong `_SceneViewState._settings`: tắt zoom / cuộn / over-scroll / menu chạm giữ; nền trong suốt;
  iOS `contentInsetAdjustmentBehavior: NEVER`.
- `gestureRecognizers: {EagerGestureRecognizer}` để chạm đi thẳng vào trang (joystick đa điểm).
- Gỡ lỗi: Android `InAppWebViewController.setWebContentsDebuggingEnabled(true)` ở `main.dart` (chỉ debug);
  iOS `isInspectable: kDebugMode`.
- Quyền nền tảng: Android `INTERNET` + `res/xml/network_security_config.xml` (http chỉ tới localhost);
  iOS `NSAllowsLocalNetworking` trong `Info.plist`.
- Xoay tự do: không gọi `setPreferredOrientations`.
- **Web** (từ L-1): WebView là `iframe`; không có `InAppLocalhostServer` (dùng `dart:io`) → `sceneUrl(web: kIsWeb, …)` mở
  thẳng `assets/assets/scene/index.html` cùng nguồn. `app/web/index.html` phải nạp `web_support.js` của gói. Code chỉ
  dành cho Android phải loại `kIsWeb` (Chrome Android báo `defaultTargetPlatform == android`). Không làm bản desktop.

## Cầu nối

Hợp đồng ở `docs/bridge.md` (biến CSS `--inset-*` từ mốc 2; sự kiện `sceneEvent` / `window.scene.handle` từ mốc 3).
Thêm / đổi sự kiện → sửa `docs/bridge.md` trước, hai phía cùng lúc.

- Flutter: `lib/scene/scene_event.dart` (đọc sự kiện thuần, chuỗi JS gửi đi — test được không cần WebView);
  `SceneView` đăng ký handler `sceneEvent` ở `onWebViewCreated`, trả `bool` (kết quả `callHandler` phía JS).
- Web: `web/src/bridge/flutterBridge.ts` (chỉ import `zones`); `main.ts` nối với HUD / nhân vật.
- Màn native chưa có → handler trả `false`, trang tự dùng giao diện HTML (không vỡ khi chạy trình duyệt thường).

## Gói mới

`flutter pub add <gói>:<phiên bản>` (ghim cố định như `flutter_inappwebview`); ghi lý do một dòng cho người dùng.
Asset scene: thêm thư mục con trong bản build → thêm dòng `assets:` trong `pubspec.yaml`.
