import 'dart:convert';

/// Sự kiện qua cầu nối Flutter ↔ scene web. Hợp đồng (tên, dạng): docs/bridge.md.
/// Tên handler JS gọi sang: `window.flutter_inappwebview.callHandler('sceneEvent', {type, payload})`.
const sceneEventHandler = 'sceneEvent';

/// Bài học một chữ Hán — cùng dạng kiểu `Lesson` của web (web/src/zones/zones.ts).
class Lesson {
  const Lesson({required this.han, required this.pinyin, required this.meaning, required this.info});

  final String han;
  final String pinyin;
  final String meaning;

  /// Các dòng phụ: (nhãn, giá trị), vd. ('Bộ', '忄 tâm đứng').
  final List<(String, String)> info;
}

/// JS nhờ mở màn bài học của vùng [zoneId].
class OpenLessonRequest {
  const OpenLessonRequest({required this.zoneId, required this.lesson});

  final String zoneId;
  final Lesson lesson;

  /// Đọc tham số handler gửi sang (`args` của `addJavaScriptHandler`). Sai dạng / loại khác → `null`.
  static OpenLessonRequest? parse(List<dynamic> args) {
    if (args.isEmpty) return null;
    final event = args.first;
    if (event is! Map || event['type'] != 'openLesson') return null;
    final payload = event['payload'];
    if (payload is! Map) return null;
    final zoneId = payload['zoneId'];
    final l = payload['lesson'];
    if (zoneId is! String || l is! Map) return null;
    final han = l['han'], pinyin = l['pinyin'], meaning = l['meaning'], info = l['info'];
    if (han is! String || pinyin is! String || meaning is! String || info is! List) return null;
    final rows = <(String, String)>[];
    for (final row in info) {
      if (row is! List || row.length != 2 || row[0] is! String || row[1] is! String) return null;
      rows.add((row[0] as String, row[1] as String));
    }
    return OpenLessonRequest(
      zoneId: zoneId,
      lesson: Lesson(han: han, pinyin: pinyin, meaning: meaning, info: rows),
    );
  }
}

/// Đoạn JS gửi một sự kiện sang trang: `window.scene.handle({type, payload})`.
/// Trang chưa sẵn sàng (chưa có `window.scene`) thì bỏ qua, không văng lỗi.
String sceneEventScript(String type, [Map<String, Object?> payload = const {}]) =>
    'window.scene&&window.scene.handle(${jsonEncode({'type': type, 'payload': payload})});';

/// Đóng màn bài học → cảnh chạy tiếp.
final resumeScript = sceneEventScript('resume');

/// App xuống nền / hiện lại → trang dừng / chạy vòng lặp vẽ (mốc 4).
String lifecycleScript({required bool visible}) =>
    sceneEventScript('lifecycle', {'state': visible ? 'visible' : 'hidden'});

/// Bật / tắt bảng gỡ lỗi (fps · draw call · tam giác).
String debugScript({required bool on}) => sceneEventScript('debug', {'on': on});
