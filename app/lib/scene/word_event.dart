import '../journey/journey.dart';

/// Từ vựng qua cầu nối (docs/bridge.md `openWordLesson`, `openReview`, `openLearned`) — cùng dạng kiểu `Tu` của web
/// (`web/src/zones/tuVung/tu.ts`, R-TU-1). Dữ liệu từ (một nguồn) ở trang; Flutter chỉ hiện + lưu tiến độ theo mã.

/// Một từ: chữ giản thể, pinyin dấu thanh, thanh từng âm tiết, nghĩa Việt, câu ví dụ, có âm hay không (R-AM-5).
class Word {
  const Word({
    required this.id,
    required this.han,
    required this.pinyin,
    this.tones = const [],
    required this.meaning,
    this.example = (han: '', pinyin: '', meaning: ''),
    this.level = 1,
    this.lesson = '',
    this.audio = false,
    this.exampleAudio = false,
  });

  /// mã từ = chữ ('朋友')
  final String id;
  final String han;
  final String pinyin;

  /// thanh từng âm tiết 1–4, 0 = nhẹ (tô màu pinyin — chờ thiết kế)
  final List<int> tones;
  final String meaning;
  final ({String han, String pinyin, String meaning}) example;

  /// cấp HSK
  final int level;

  /// mã bài
  final String lesson;

  /// có file âm từ / âm câu ví dụ (R-AM-5) — chưa có âm: loa mờ
  final bool audio;
  final bool exampleAudio;
}

/// Đọc một từ dạng `Tu` của web; sai dạng → `null`.
Word? parseWord(Object? v) {
  if (v is! Map) return null;
  final id = v['id'], han = v['han'], pinyin = v['pinyin'], meaning = v['meaning'];
  if (id is! String || han is! String || pinyin is! String || meaning is! String || id.isEmpty) return null;
  final ex = v['example'], thanh = v['thanh'], cap = v['cap'], bai = v['bai'];
  String s(Object? m, String k) => m is Map && m[k] is String ? m[k] as String : '';
  return Word(
    id: id,
    han: han,
    pinyin: pinyin,
    tones: thanh is List ? [for (final t in thanh) if (t is num) t.toInt()] : const [],
    meaning: meaning,
    example: (han: s(ex, 'han'), pinyin: s(ex, 'pinyin'), meaning: s(ex, 'meaning')),
    level: cap is num ? cap.toInt() : 1,
    lesson: bai is String ? bai : '',
    audio: v['am'] == true,
    exampleAudio: v['amCau'] == true,
  );
}

/// Danh sách từ; mục sai dạng bỏ qua.
List<Word> parseWords(Object? v) => v is List ? [for (final w in v) ?parseWord(w)] : const [];

/// JS nhờ mở màn bài từ (thầy Trúc Lão — R-HANH-3, R-HANH-8; docs/bridge.md `openWordLesson`).
class OpenWordLessonRequest {
  const OpenWordLessonRequest({
    required this.lessonId,
    required this.title,
    this.index = 1,
    this.total = 1,
    required this.words,
    this.learned = false,
    required this.region,
  });

  /// mã bài (`bai-01`)
  final String lessonId;

  /// chủ đề tiếng Việt ("Chào hỏi")
  final String title;

  /// thứ tự bài trong giáo trình (1…) · tổng số bài
  final int index;
  final int total;

  /// các từ theo thứ tự trang
  final List<Word> words;

  /// bài đã học (mở lại) → không ghi lại, nút "Xuất định"
  final bool learned;
  final String region;

  /// Sai dạng / bài không có từ → `null` (Flutter trả `false`, trang mở bảng HTML).
  static OpenWordLessonRequest? parse(List<dynamic> args) {
    if (args.isEmpty) return null;
    final e = args.first;
    if (e is! Map || e['type'] != 'openWordLesson') return null;
    final p = e['payload'];
    if (p is! Map) return null;
    final l = p['lesson'];
    if (l is! Map || l['id'] is! String || l['title'] is! String) return null;
    final words = parseWords(p['words']);
    if (words.isEmpty) return null;
    final index = l['index'], total = l['total'];
    return OpenWordLessonRequest(
      lessonId: l['id'] as String,
      title: l['title'] as String,
      index: index is num ? index.toInt() : 1,
      total: total is num ? total.toInt() : 1,
      words: words,
      learned: p['learned'] == true,
      region: p['region'] is String ? p['region'] as String : firstRegion,
    );
  }
}
