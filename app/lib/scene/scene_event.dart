import 'dart:convert';

import '../journey/daily.dart';
import '../journey/home.dart';
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

/// Loại sự kiện JS gửi sang (`type`), hoặc `null` nếu sai dạng.
String? sceneEventType(List<dynamic> args) {
  if (args.isEmpty) return null;
  final event = args.first;
  if (event is! Map) return null;
  final type = event['type'];
  return type is String ? type : null;
}

/// Trả lời `getProgress` (docs/bridge.md): bài + từ đã học (R-TU-1; không khoá vùng — R-HANH-1);
/// [due] = từ đến hạn ôn theo thứ tự hỏi (R-ON-4, tổng — trang cắt lượt 20), [dueSteps] = bậc tương ứng (R-ON-2);
/// [daily] + [streak] = bảng nhiệm vụ hôm nay (R-NV-1, R-NV-2); [book] = sổ từ đang mượn (R-SACH-2); [coins] = số dư Văn
/// tiền, [gameCoinsToday] = Văn tiền trò chơi hôm nay (R-TIEN-1, R-TIEN-3) — [coins] `null` → không gửi (trang ẩn ví);
/// [alms] = đã cho Tiểu Khất (R-TIEN-8).
Map<String, Object?> progressReply(
  Progress p, {
  List<String> due = const [],
  List<int> dueSteps = const [],
  String? book,
  DailyStatus? daily,
  ({int current, int best}) streak = (current: 0, best: 0),
  int? coins,
  int gameCoinsToday = 0,
  ({int lastDay, int count})? alms,
}) =>
    {
      'lessons': p.lessons,
      'words': p.words,
      'due': due,
      'dueSteps': dueSteps,
      'daily': {
        'learned': daily?.newToday ?? 0,
        'goal': dailyNewGoal,
        'due': daily?.dueLeft ?? due.length,
        'streak': streak.current,
        'best': streak.best,
      },
      'book': book,
      if (coins != null) ...{'coins': coins, 'gameCoinsToday': gameCoinsToday},
      if (alms != null) 'alms': {'lastDay': alms.lastDay, 'count': alms.count},
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

/// Trả lời `getHome` (docs/bridge.md, R-NHA-3, R-NHA-4, V-69): [items] = món đang đặt; [owned] = số cái mỗi vật; [placed] =
/// ô cũ (chỉ gửi khi chưa có danh sách món — trang chuyển ô → món rồi `setHome`).
Map<String, Object?> homeReply({required List<PlacedDecor> items, required Map<String, int> owned, Map<String, String>? placed}) => {
      'items': [for (final i in items) i.toJson()],
      'owned': owned,
      if (placed != null && placed.isNotEmpty) 'placed': placed,
    };

/// Danh sách món thô của sự kiện `setHome` (docs/bridge.md, R-NHA-2) — kiểm dạng + số cái ở `ProgressStore.setHomeItems`.
/// Không phải `setHome` / thiếu `items` → `null`.
List<Object?>? setHomeArgs(List<dynamic> args) {
  if (args.isEmpty) return null;
  final e = args.first;
  if (e is! Map || e['type'] != 'setHome') return null;
  final p = e['payload'];
  final items = p is Map ? p['items'] : null;
  return items is List ? [...items] : null;
}

/// Đoạn JS gửi một sự kiện sang trang: `window.scene.handle({type, payload})`.
/// Trang chưa sẵn sàng (chưa có `window.scene`) thì bỏ qua, không văng lỗi.
String sceneEventScript(String type, [Map<String, Object?> payload = const {}]) =>
    'window.scene&&window.scene.handle(${jsonEncode({'type': type, 'payload': payload})});';

/// Nút quay lại của máy: trang trả `true` nếu đã xử lý (đóng bản đồ truyền tống — R-HANH-2), khác → Flutter thoát
/// như thường. Trang chưa sẵn sàng → `false`.
final backScript = 'window.scene?window.scene.handle(${jsonEncode({'type': 'back', 'payload': <String, Object?>{}})})===true:false;';

/// Đóng màn bài học / màn bài từ → cảnh chạy tiếp. `stand` = trang từ đã học đóng bằng "Xuất định" → nhân vật đang ngồi đứng dậy
/// (R-HANH-3, docs/bridge.md).
String resumeScript({bool stand = false}) => sceneEventScript('resume', stand ? {'stand': true} : const {});

/// App xuống nền / hiện lại → trang dừng / chạy vòng lặp vẽ (mốc 4).
String lifecycleScript({required bool visible}) =>
    sceneEventScript('lifecycle', {'state': visible ? 'visible' : 'hidden'});

/// Bật / tắt bảng gỡ lỗi (fps · draw call · tam giác).
String debugScript({required bool on}) => sceneEventScript('debug', {'on': on});
