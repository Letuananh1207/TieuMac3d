import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

import '../theme/app_colors.dart';
import 'garden_event.dart';
import 'mang_event.dart';
import 'nong_event.dart';
import 'library_event.dart';
import 'review_event.dart';
import 'safe_area_script.dart';
import 'scene_event.dart';
import 'word_event.dart';
import 'shop_event.dart';

/// Màn chính: WebView phủ toàn màn hình, hiển thị scene 3D.
class SceneView extends StatefulWidget {
  const SceneView({
    super.key,
    required this.url,
    this.onOpenLesson,
    this.onOpenWordLesson,
    this.onGetProgress,
    this.onBorrowBook,
    this.onReturnBook,
    this.onGetHome,
    this.onSetHome,
    this.onOpenReview,
    this.onOpenDaily,
    this.onOpenLearned,
    this.onOpenLibrary,
    this.onOpenBook,
    this.onEarnGame,
    this.onGiveAlms,
    this.onOpenShop,
    this.onGetGarden,
    this.onGardenAct,
    this.onGetMang,
    this.onMangAct,
    this.onGetNong,
    this.onNongAct,
  });

  final WebUri url;

  /// Mở màn bài học native; Future xong khi người chơi đóng màn → gửi `resume` cho trang.
  /// `null` (chưa có màn — phiếu 2026-11-10-man-bai-hoc chờ thiết kế) → trả `false`, trang tự mở bảng HTML.
  final Future<void> Function(BuildContext context, OpenLessonRequest request)? onOpenLesson;

  /// Mở màn bài từ native (`openWordLesson` — R-HANH-3); Future xong khi đóng → gửi `resume`. `null` → trả `false`, trang
  /// dùng bảng HTML. Kết quả `true` = đóng bằng "Xuất định" → `resume {stand: true}` (nhân vật đứng dậy).
  final Future<bool?> Function(BuildContext context, OpenWordLessonRequest request)? onOpenWordLesson;

  /// Trả lời `getProgress` (vùng đã mở — R-HANH-1). `null` → trang dùng mặc định (chỉ Rừng trúc).
  final Map<String, Object?> Function()? onGetProgress;

  /// Ghi sổ từ đang mượn (`borrowBook` — R-SACH-1). `null` → trả `false`, trang giữ trong bộ nhớ trang.
  final Future<bool> Function(String id)? onBorrowBook;

  /// Trả sổ từ đang mượn (`returnBook` — R-SACH-4). `null` → trả `false`.
  final Future<bool> Function()? onReturnBook;

  /// Trả lời `getHome` — nhà của ta đã lưu (R-NHA-3). `null` → trang coi như nhà trống.
  final Map<String, Object?> Function()? onGetHome;

  /// Ghi cả danh sách món của nhà (`setHome` — R-NHA-2, R-NHA-3; dạng thô, kho kiểm). `null` → trả `false`, trang giữ trong bộ
  /// nhớ trang.
  final Future<bool> Function(List<Object?> items)? onSetHome;

  /// Mở màn ôn câu đố (`openReview` — R-ON-5); Future xong khi đóng → gửi `resume`. `null` → trả `false`, trang mở lại
  /// khung thoại.
  final Future<void> Function(BuildContext context, OpenReviewRequest request)? onOpenReview;

  /// Mở bảng nhiệm vụ 日課榜 (`openDaily` — R-NV-3); đóng → `resume`. `null` → trả `false`, Tiểu Mặc đọc bảng.
  final Future<void> Function(BuildContext context, OpenDailyRequest request)? onOpenDaily;

  /// Mở màn "Từ đã học" từ cuộn Tĩnh toạ 3D (`openLearned` — R-ON-8); đóng → `resume` (vẫn ngồi, cuộn hiện lại).
  /// `null` → trả `false`, trang mở bảng HTML.
  final Future<void> Function(BuildContext context, OpenLearnedRequest request)? onOpenLearned;

  /// Mở danh mục sách Tàng Thư Các (`openLibrary` — R-SACH-1); chọn "Mượn" → Flutter ghi mượn → đóng → `resume`.
  /// `null` → trả `false`, trang cho chọn cuốn trong khung thoại.
  final Future<void> Function(BuildContext context, OpenLibraryRequest request)? onOpenLibrary;

  /// Mở sổ từ cuốn đang mượn (`openBook` — R-SACH-3); đóng → ghi trang → `resume`. `null` → trả `false`.
  final Future<void> Function(BuildContext context, OpenBookRequest request)? onOpenBook;

  /// Hết một ván ở bàn chơi (`earnGame` — R-TIEN-3): Flutter tính + ghi thưởng, trả `earnGameReply`. `null` → trả `null`
  /// (trang không thưởng, ví ẩn).
  final Future<Map<String, Object?>> Function(String game, String outcome, String? song)? onEarnGame;

  /// Cho Tiểu Líu Lo (`giveAlms` — R-TIEN-8): Flutter tính + ghi, trả `giveAlmsReply`. `null` → trả `null` (không cho được).
  final Future<Map<String, Object?>> Function()? onGiveAlms;

  /// Mở Tạp hoá (`openShop` — R-TIEN-4, R-TIEN-6); đóng → `resume`. `null` → trả `false`, trang báo "Tiệm chưa mở".
  final Future<void> Function(BuildContext context, OpenShopRequest request)? onOpenShop;

  /// Trả lời `getGarden` — vườn rau đã lưu (R-VUON-1…9). `null` → trả `null`, trang coi vườn mới chỉ xem.
  final Map<String, Object?> Function()? onGetGarden;

  /// Một thao tác ở vườn (`gardenAct`): Flutter tính + ghi, trả `gardenActReply`. `null` → trả `null` (không làm gì).
  final Future<Map<String, Object?>> Function(GardenActArgs args)? onGardenAct;

  /// Trả lời `getMang` — măng Trúc Lâm đã lưu (R-MANG-1…5). `null` → trả `null`, trang coi túi trống chỉ xem.
  final Map<String, Object?> Function()? onGetMang;

  /// Một thao tác măng (`mangAct`): Flutter tính + ghi, trả `mangActReply`. `null` → trả `null` (không làm gì).
  final Future<Map<String, Object?>> Function(MangActArgs args)? onMangAct;

  /// Trả lời `getNong` — nông trại Nhà của ta đã lưu (R-NONG-1…8). `null` → trả `null`, trang coi nông trại trống chỉ xem.
  final Map<String, Object?> Function()? onGetNong;

  /// Một thao tác nông trại (`nongAct`): Flutter tính + ghi, trả `nongActReply`. `null` → trả `null` (không làm gì).
  final Future<Map<String, Object?>> Function(NongActArgs args)? onNongAct;

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
  Object? _onSceneEvent(List<dynamic> args) {
    final type = sceneEventType(args);
    if (type == 'getProgress') return widget.onGetProgress?.call();
    // Future<bool> → callHandler phía JS nhận true / false khi ghi xong
    if (type == 'borrowBook') {
      final id = borrowBookId(args);
      final borrow = widget.onBorrowBook;
      return borrow != null && id != null ? borrow(id) : false;
    }
    if (type == 'returnBook') return widget.onReturnBook?.call() ?? false;
    if (type == 'getHome') return widget.onGetHome?.call();
    if (type == 'setHome') {
      final a = setHomeArgs(args);
      final set = widget.onSetHome;
      return set != null && a != null ? set(a) : false;
    }
    if (type == 'openLibrary' || type == 'openBook') {
      final Future<void>? opened = type == 'openLibrary'
          ? switch ((widget.onOpenLibrary, OpenLibraryRequest.parse(args))) {
              (final f?, final req?) => f(context, req),
              _ => null,
            }
          : switch ((widget.onOpenBook, OpenBookRequest.parse(args))) {
              (final f?, final req?) => f(context, req),
              _ => null,
            };
      if (opened == null) return false;
      opened.whenComplete(() => _controller?.evaluateJavascript(source: resumeScript()));
      return true;
    }
    if (type == 'earnGame') {
      final a = earnGameArgs(args);
      final earn = widget.onEarnGame;
      return earn != null && a != null ? earn(a.game, a.outcome, earnGameSong(args)) : null;
    }
    if (type == 'getMang' && isGetMang(args)) return widget.onGetMang?.call();
    if (type == 'mangAct') {
      final a = mangActArgs(args);
      final act = widget.onMangAct;
      return act != null && a != null ? act(a) : null;
    }
    if (type == 'getNong' && isGetNong(args)) return widget.onGetNong?.call();
    if (type == 'nongAct') {
      final a = nongActArgs(args);
      final act = widget.onNongAct;
      return act != null && a != null ? act(a) : null;
    }
    if (type == 'giveAlms' && isGiveAlms(args)) {
      final give = widget.onGiveAlms;
      return give?.call();
    }
    if (type == 'getGarden' && isGetGarden(args)) return widget.onGetGarden?.call();
    if (type == 'gardenAct') {
      final a = gardenActArgs(args);
      final act = widget.onGardenAct;
      return act != null && a != null ? act(a) : null;
    }
    if (type == 'openShop') {
      final f = widget.onOpenShop;
      final req = OpenShopRequest.parse(args);
      if (f == null || req == null) return false;
      f(context, req).whenComplete(() => _controller?.evaluateJavascript(source: resumeScript()));
      return true;
    }
    if (type == 'openReview') {
      final f = widget.onOpenReview;
      final req = OpenReviewRequest.parse(args);
      if (f == null || req == null) return false;
      f(context, req).whenComplete(() => _controller?.evaluateJavascript(source: resumeScript()));
      return true;
    }
    if (type == 'openLearned') {
      final f = widget.onOpenLearned;
      final req = OpenLearnedRequest.parse(args);
      if (f == null || req == null) return false;
      f(context, req).whenComplete(() => _controller?.evaluateJavascript(source: resumeScript()));
      return true;
    }
    if (type == 'openDaily') {
      final f = widget.onOpenDaily;
      final req = OpenDailyRequest.parse(args);
      if (f == null || req == null) return false;
      f(context, req).whenComplete(() => _controller?.evaluateJavascript(source: resumeScript()));
      return true;
    }
    if (type == 'openWordLesson') {
      final openR = widget.onOpenWordLesson;
      final req = OpenWordLessonRequest.parse(args);
      if (openR == null || req == null) return false;
      openR(context, req).then(
        (stand) => _controller?.evaluateJavascript(source: resumeScript(stand: stand == true)),
        onError: (_) => _controller?.evaluateJavascript(source: resumeScript()),
      );
      return true;
    }
    final open = widget.onOpenLesson;
    final request = OpenLessonRequest.parse(args);
    if (open == null || request == null) return false;
    // mở màn native; trang ngừng vẽ tới khi nhận resume
    open(context, request).whenComplete(() => _controller?.evaluateJavascript(source: resumeScript()));
    return true;
  }

  /// Nút quay lại của máy: hỏi trang trước (đóng bản đồ truyền tống — docs/bridge.md `back`); trang không xử lý → thoát.
  Future<void> _onBack() async {
    final c = _controller;
    var handled = false;
    if (_loaded && c != null) {
      try {
        handled = await c.evaluateJavascript(source: backScript) == true;
      } catch (_) {
        handled = false;
      }
    }
    if (!handled) await SystemNavigator.pop();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _onBack();
      },
      child: _scaffold(context),
    );
  }

  Widget _scaffold(BuildContext context) {
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
