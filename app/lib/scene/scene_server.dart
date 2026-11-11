import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

/// Thư mục bản build cảnh trong asset của app (sinh bởi `npm run build` trong web/).
const sceneAssetDir = 'assets/scene/';

/// Địa chỉ trang cảnh 3D.
///
/// - Android / iOS: qua máy chủ nội bộ `http://localhost:<port>/` — trang dùng `<script type="module">`, mà trình
///   duyệt chặn ES module tải từ `file://`.
/// - Web (trình duyệt): app đã được phục vụ qua http, asset nằm ở `<base>/assets/<đường dẫn asset>` cùng nguồn —
///   mở thẳng, không cần (và không có) máy chủ nội bộ: `InAppLocalhostServer` dùng `dart:io`, trình duyệt không có (L-1).
Uri sceneUrl({required bool web, required Uri base, required int port}) =>
    web ? base.resolve('assets/${sceneAssetDir}index.html') : Uri.parse('http://localhost:$port/index.html');

/// Phục vụ bản build cảnh cho WebView. Server chỉ nghe 127.0.0.1, không ra mạng ngoài; trên web không dùng.
class SceneServer {
  SceneServer({this.port = 8080})
      : _server = kIsWeb ? null : InAppLocalhostServer(port: port, documentRoot: sceneAssetDir);

  final int port;
  final InAppLocalhostServer? _server;

  WebUri get url => WebUri.uri(sceneUrl(web: kIsWeb, base: Uri.base, port: port));

  /// Khởi động server (web: không có gì để khởi động). Có giới hạn thời gian vì thư viện không báo lỗi khi cổng bận —
  /// nó treo mãi.
  Future<void> start() async {
    final s = _server;
    if (s == null) return;
    await s.start().timeout(const Duration(seconds: 5));
  }
}
