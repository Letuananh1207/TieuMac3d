import 'dart:convert';

import '../journey/daily.dart';
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
    final radical = parseRadical(p['radical']);
    if (radical == null) return null;
    return OpenRadicalRequest(
      radical: radical,
      learned: p['learned'] == true,
      region: p['region'] is String ? p['region'] as String : 'Rừng trúc',
    );
  }
}

/// Đọc một bộ thủ dạng `Radical` của web (`openRadical`, `openReview`, `openDaily`); sai dạng → `null`.
Radical? parseRadical(Object? r) {
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
  return Radical(
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
  );
}

/// Loại sự kiện JS gửi sang (`type`), hoặc `null` nếu sai dạng.
String? sceneEventType(List<dynamic> args) {
  if (args.isEmpty) return null;
  final event = args.first;
  if (event is! Map) return null;
  final type = event['type'];
  return type is String ? type : null;
}

/// Trả lời `getProgress` (docs/bridge.md): số chữ, bộ thủ đã học (không khoá vùng — R-HANH-1);
/// [due] = bộ thủ đến hạn ôn theo thứ tự hỏi (R-ON-4); [daily] + [streak] = bảng nhiệm vụ hôm nay (R-NV-1, R-NV-2);
/// [book] = sổ từ đang mượn ở Tàng Thư Các (R-SACH-2); [coins] = số dư Văn tiền, [gameCoinsToday] = Văn tiền trò chơi
/// hôm nay (R-TIEN-1, R-TIEN-3) — [coins] `null` → không gửi (trang ẩn ví).
Map<String, Object?> progressReply(
  Progress p, {
  List<String> due = const [],
  String? book,
  DailyStatus? daily,
  ({int current, int best}) streak = (current: 0, best: 0),
  int? coins,
  int gameCoinsToday = 0,
}) =>
    {
      'chars': p.chars.length,
      'radicals': p.radicals.toList(),
      'due': due,
      'daily': {
        'learned': daily?.newToday ?? 0,
        'goal': dailyNewGoal,
        'due': daily?.dueLeft ?? due.length,
        'streak': streak.current,
        'best': streak.best,
      },
      'book': book,
      if (coins != null) ...{'coins': coins, 'gameCoinsToday': gameCoinsToday},
    };

/// `id` của sự kiện `borrowBook` (docs/bridge.md, R-SACH-1); sai dạng → `null`.
String? borrowBookId(List<dynamic> args) {
  if (args.isEmpty) return null;
  final e = args.first;
  if (e is! Map || e['type'] != 'borrowBook') return null;
  final p = e['payload'];
  final id = p is Map ? p['id'] : null;
  return id is String && id.isNotEmpty ? id : null;
}

/// Trả lời `getHome` (docs/bridge.md, R-NHA-3, R-NHA-4): nhà đã lưu, mã ô → mã vật; [owned] = vật đã sở hữu (`null` →
/// không gửi, trang coi là vật khởi đầu + vật đang đặt).
Map<String, Object?> homeReply(Map<String, String> placed, {List<String>? owned}) => {
      'placed': placed,
      'owned': ?owned,
    };

/// Ô + vật của sự kiện `setDecor` (docs/bridge.md, R-NHA-2); `item` `null` = gỡ. Sai dạng → `null`.
({String slot, String? item})? setDecorArgs(List<dynamic> args) {
  if (args.isEmpty) return null;
  final e = args.first;
  if (e is! Map || e['type'] != 'setDecor') return null;
  final p = e['payload'];
  if (p is! Map) return null;
  final slot = p['slot'];
  final item = p['item'];
  if (slot is! String || slot.isEmpty) return null;
  if (item != null && (item is! String || item.isEmpty)) return null;
  return (slot: slot, item: item as String?);
}

/// Đoạn JS gửi một sự kiện sang trang: `window.scene.handle({type, payload})`.
/// Trang chưa sẵn sàng (chưa có `window.scene`) thì bỏ qua, không văng lỗi.
String sceneEventScript(String type, [Map<String, Object?> payload = const {}]) =>
    'window.scene&&window.scene.handle(${jsonEncode({'type': type, 'payload': payload})});';

/// Nút quay lại của máy: trang trả `true` nếu đã xử lý (đóng bản đồ truyền tống — R-HANH-2), khác → Flutter thoát
/// như thường. Trang chưa sẵn sàng → `false`.
final backScript = 'window.scene?window.scene.handle(${jsonEncode({'type': 'back', 'payload': <String, Object?>{}})})===true:false;';

/// Đóng màn bài học / thẻ bộ thủ → cảnh chạy tiếp. `stand` = thẻ đóng bằng "Xuất định" → nhân vật đang ngồi đứng dậy
/// (R-HANH-3, docs/bridge.md).
String resumeScript({bool stand = false}) => sceneEventScript('resume', stand ? {'stand': true} : const {});

/// App xuống nền / hiện lại → trang dừng / chạy vòng lặp vẽ (mốc 4).
String lifecycleScript({required bool visible}) =>
    sceneEventScript('lifecycle', {'state': visible ? 'visible' : 'hidden'});

/// Bật / tắt bảng gỡ lỗi (fps · draw call · tam giác).
String debugScript({required bool on}) => sceneEventScript('debug', {'on': on});
