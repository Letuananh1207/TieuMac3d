import 'dart:convert';

import '../journey/journey.dart';

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

/// Một bộ thủ (R-HANH-3) — cùng dạng kiểu `Radical` của web (web/src/zones/radicals.ts).
class Radical {
  const Radical({
    required this.id,
    required this.form,
    this.full,
    required this.name,
    required this.meaning,
    required this.pinyin,
    required this.strokes,
    this.fullStrokes,
    required this.examples,
    this.hinh = const [],
    this.trien = const [],
  });

  final String id;
  final String form;
  final String? full;
  final String name;
  final String meaning;
  final String pinyin;
  final int strokes;
  final int? fullStrokes;

  /// Chữ có bộ này: (chữ Hán, pinyin, nghĩa)
  final List<(String, String, String)> examples;

  /// "Từ hình đến chữ": nét SVG (khung 0 0 100 100) của ô hình vẽ và ô chữ triện; rỗng = không có dải hình.
  final List<String> hinh;
  final List<String> trien;
}

/// JS nhờ mở thẻ học bộ thủ (docs/bridge.md `openRadical`).
class OpenRadicalRequest {
  const OpenRadicalRequest({required this.radical, required this.learned, required this.region});

  final Radical radical;
  final bool learned;
  final String region;

  static OpenRadicalRequest? parse(List<dynamic> args) {
    if (args.isEmpty) return null;
    final event = args.first;
    if (event is! Map || event['type'] != 'openRadical') return null;
    final p = event['payload'];
    if (p is! Map) return null;
    final r = p['radical'];
    if (r is! Map) return null;
    final id = r['id'], form = r['form'], name = r['name'], meaning = r['meaning'], pinyin = r['pinyin'], strokes = r['strokes'];
    if (id is! String || form is! String || name is! String || meaning is! String || pinyin is! String || strokes is! num) {
      return null;
    }
    final examples = <(String, String, String)>[];
    final ex = r['examples'];
    if (ex is List) {
      for (final e in ex) {
        if (e is Map && e['han'] is String && e['pinyin'] is String && e['meaning'] is String) {
          examples.add((e['han'] as String, e['pinyin'] as String, e['meaning'] as String));
        }
      }
    }
    List<String> paths(Object? v) => v is List ? [for (final s in v) if (s is String) s] : const [];
    final evo = r['evolution'];
    final full = r['full'], fullStrokes = r['fullStrokes'];
    return OpenRadicalRequest(
      radical: Radical(
        id: id,
        form: form,
        full: full is String ? full : null,
        name: name,
        meaning: meaning,
        pinyin: pinyin,
        strokes: strokes.toInt(),
        fullStrokes: fullStrokes is num ? fullStrokes.toInt() : null,
        examples: examples,
        hinh: evo is Map ? paths(evo['hinh']) : const [],
        trien: evo is Map ? paths(evo['trien']) : const [],
      ),
      learned: p['learned'] == true,
      region: p['region'] is String ? p['region'] as String : 'Rừng trúc',
    );
  }
}

/// Loại sự kiện JS gửi sang (`type`), hoặc `null` nếu sai dạng.
String? sceneEventType(List<dynamic> args) {
  if (args.isEmpty) return null;
  final event = args.first;
  if (event is! Map) return null;
  final type = event['type'];
  return type is String ? type : null;
}

/// Trả lời `getProgress` (docs/bridge.md): vùng đã mở theo thứ tự hành trình, số chữ đã học, mốc vùng còn khoá.
Map<String, Object?> progressReply(Progress p) => {
      'open': p.openRegions,
      'chars': p.chars.length,
      'radicals': p.radicals.toList(),
      'need': p.needs,
    };

/// Đoạn JS gửi một sự kiện sang trang: `window.scene.handle({type, payload})`.
/// Trang chưa sẵn sàng (chưa có `window.scene`) thì bỏ qua, không văng lỗi.
String sceneEventScript(String type, [Map<String, Object?> payload = const {}]) =>
    'window.scene&&window.scene.handle(${jsonEncode({'type': type, 'payload': payload})});';

/// Nút quay lại của máy: trang trả `true` nếu đã xử lý (đóng bản đồ truyền tống — R-HANH-2), khác → Flutter thoát
/// như thường. Trang chưa sẵn sàng → `false`.
final backScript = 'window.scene?window.scene.handle(${jsonEncode({'type': 'back', 'payload': <String, Object?>{}})})===true:false;';

/// Đóng màn bài học → cảnh chạy tiếp.
final resumeScript = sceneEventScript('resume');

/// App xuống nền / hiện lại → trang dừng / chạy vòng lặp vẽ (mốc 4).
String lifecycleScript({required bool visible}) =>
    sceneEventScript('lifecycle', {'state': visible ? 'visible' : 'hidden'});

/// Bật / tắt bảng gỡ lỗi (fps · draw call · tam giác).
String debugScript({required bool on}) => sceneEventScript('debug', {'on': on});
