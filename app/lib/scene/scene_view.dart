import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

import '../theme/app_colors.dart';
import 'safe_area_script.dart';
import 'scene_event.dart';

/// Màn chính: WebView phủ toàn màn hình, hiển thị scene 3D.
class SceneView extends StatefulWidget {
  const SceneView({super.key, required this.url, this.onOpenLesson});

  final WebUri url;

  /// Mở màn bài học native; Future xong khi người chơi đóng màn → gửi `resume` cho trang.
  /// `null` (chưa có màn — phiếu 2026-11-10-man-bai-hoc chờ thiết kế) → trả `false`, trang tự mở bảng HTML.
  final Future<void> Function(BuildContext context, OpenLessonRequest request)? onOpenLesson;

  @override
  State<SceneView> createState() => _SceneViewState();
}

class _SceneViewState extends State<SceneView> {
  InAppWebViewController? _controller;
  bool _loaded = false;
  EdgeInsets? _sentInsets;
  String? _error;

  /// Theo dõi app xuống nền / hiện lại → báo trang dừng vòng lặp vẽ (docs/bridge.md `lifecycle`).
  late final AppLifecycleListener _lifecycle = AppLifecycleListener(
    onHide: () => _send(lifecycleScript(visible: false)),
    onShow: () => _send(lifecycleScript(visible: true)),
  );

  void _send(String js) {
    final c = _controller;
    if (_loaded && c != null) c.evaluateJavascript(source: js);
  }

  @override
  void initState() {
    super.initState();
    _lifecycle; // tạo listener ngay
  }

  @override
  void dispose() {
    _lifecycle.dispose();
    super.dispose();
  }

  static final _settings = InAppWebViewSettings(
    // Trang tự lo cảm ứng (joystick, xoay, chụm): tắt mọi zoom / cuộn / menu của WebView.
    supportZoom: false,
    builtInZoomControls: false,
    displayZoomControls: false,
    disableHorizontalScroll: true,
    disableVerticalScroll: true,
    verticalScrollBarEnabled: false,
    horizontalScrollBarEnabled: false,
    overScrollMode: OverScrollMode.NEVER,
    disallowOverScroll: true,
    disableContextMenu: true,
    disableLongPressContextMenuOnLinks: true,
    supportMultipleWindows: false,
    // Nền trong suốt: lúc chưa tải thấy màu nền Flutter (cùng màu trang) thay vì chớp trắng.
    transparentBackground: true,
    // iOS: không tự chừa lề cho tai thỏ — trang tự xử lý safe area.
    contentInsetAdjustmentBehavior: ScrollViewContentInsetAdjustmentBehavior.NEVER,
    // iOS 16.4+: cho Safari Web Inspector soi ở bản debug. Android bật ở main.dart.
    isInspectable: kDebugMode,
  );

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _sendInsets(); // xoay máy / đổi thanh hệ thống → MediaQuery đổi → gọi lại
  }

  void _sendInsets() {
    final insets = MediaQuery.viewPaddingOf(context);
    final c = _controller;
    if (!_loaded || c == null || insets == _sentInsets) return;
    _sentInsets = insets;
    c.evaluateJavascript(source: safeAreaScript(insets));
  }

  /// Sự kiện từ trang (docs/bridge.md). Giá trị trả về là kết quả `callHandler` phía JS.
  bool _onSceneEvent(List<dynamic> args) {
    final open = widget.onOpenLesson;
    final request = OpenLessonRequest.parse(args);
    if (open == null || request == null) return false;
    // mở màn native; trang ngừng vẽ tới khi nhận resume
    open(context, request).whenComplete(() => _controller?.evaluateJavascript(source: resumeScript));
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.sceneBackground,
      body: Stack(
        fit: StackFit.expand,
        children: [
          InAppWebView(
            initialUrlRequest: URLRequest(url: widget.url),
            initialSettings: _settings,
            // Mọi chạm đi thẳng vào WebView, Flutter không giữ lại để đoán cử chỉ.
            gestureRecognizers: {Factory<OneSequenceGestureRecognizer>(EagerGestureRecognizer.new)},
            onWebViewCreated: (c) {
              _controller = c;
              c.addJavaScriptHandler(handlerName: sceneEventHandler, callback: _onSceneEvent);
            },
            onLoadStop: (c, url) {
              _loaded = true;
              _sentInsets = null;
              _sendInsets();
              // bản debug: bảng gỡ lỗi (fps · draw call · tam giác) — bản phát hành không bật
              if (kDebugMode) c.evaluateJavascript(source: debugScript(on: true));
            },
            onReceivedError: (c, request, error) {
              if (request.isForMainFrame ?? true) {
                setState(() => _error = error.description);
              }
            },
            onConsoleMessage: kDebugMode ? (c, m) => debugPrint('[scene] ${m.message}') : null,
          ),
          if (_error != null) SceneErrorView(detail: _error!),
        ],
      ),
    );
  }
}

/// Báo lỗi khi không tải được cảnh 3D.
class SceneErrorView extends StatelessWidget {
  const SceneErrorView({super.key, required this.detail});

  final String detail;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: AppColors.errorBackground,
      child: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Không tải được cảnh 3D',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppColors.paper),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Bản dựng cảnh có thể chưa được chép vào app (chạy npm run build trong web/).\n$detail',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.paper),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
