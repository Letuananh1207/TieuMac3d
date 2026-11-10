import 'package:flutter_inappwebview/flutter_inappwebview.dart';

/// Phục vụ bản build web (`assets/scene/`, sinh bởi `npm run build` trong web/) qua http://localhost.
///
/// Vì sao không mở thẳng file asset: trang dùng `<script type="module">`, mà trình duyệt chặn ES module
/// tải từ `file://`. Server này chạy ngay trong app, chỉ nghe 127.0.0.1, không ra mạng ngoài.
class SceneServer {
  SceneServer({this.port = 8080})
      : _server = InAppLocalhostServer(port: port, documentRoot: 'assets/scene/');

  final int port;
  final InAppLocalhostServer _server;

  WebUri get url => WebUri('http://localhost:$port/index.html');

  /// Khởi động server. Có giới hạn thời gian vì thư viện không báo lỗi khi cổng bận — nó treo mãi.
  Future<void> start() => _server.start().timeout(const Duration(seconds: 5));
}
