import '../journey/journey.dart';
import 'word_event.dart';

/// Sự kiện ôn tập + bảng nhiệm vụ + Từ đã học qua cầu nối (docs/bridge.md `openReview`, `openDaily`, `openLearned`). Câu đố
/// do trang dựng (`web/src/zones/tuVung/cauHoi.ts` — R-TU-2); Flutter hiện màn, chấm, lưu lịch ôn.

/// Một câu đố (R-TU-2): [kind] = `chu-nghia` (a) · `nghe-nghia` (b) · `chu-pinyin` (c) · `nghia-chu` (d) · `nghe-chu` (e);
/// 4 phương án, [answer] = chỉ số đáp án.
class ReviewQuestion {
  const ReviewQuestion({required this.kind, required this.options, required this.answer});

  final String kind;
  final List<String> options;
  final int answer;

  /// phương án là pinyin (c)
  bool get isPinyin => kind == 'chu-pinyin';

  /// phương án là chữ Hán (d, e)
  bool get optionsHan => kind == 'nghia-chu' || kind == 'nghe-chu';

  /// câu nghe (b, e) — cần âm (R-AM-5); màn ôn chưa có nút loa → chờ thiết kế
  bool get listening => kind == 'nghe-nghia' || kind == 'nghe-chu';
}

/// Một từ đến hạn và 2 câu đố của nó.
class ReviewItem {
  const ReviewItem({required this.word, required this.questions});

  final Word word;
  final List<ReviewQuestion> questions;
}

/// JS nhờ mở màn ôn câu đố (thầy Trúc Lão ở Trúc Lâm — R-HANH-8; "Ôn ngay" ở bảng nhiệm vụ do Flutter tự mở — R-ON-5).
class OpenReviewRequest {
  const OpenReviewRequest({required this.items, required this.region});

  final List<ReviewItem> items;
  final String region;

  /// Sai dạng / không có từ nào → `null` (Flutter trả `false`, trang mở lại khung thoại).
  static OpenReviewRequest? parse(List<dynamic> args) {
    final p = _payload(args, 'openReview');
    if (p == null) return null;
    final items = parseReviewItems(p['items']);
    if (items.isEmpty) return null;
    return OpenReviewRequest(items: items, region: p['region'] is String ? p['region'] as String : firstRegion);
  }
}

/// JS nhờ mở bảng nhiệm vụ (R-NV-3): kèm sẵn câu đố của các từ đến hạn để "Ôn ngay" mở màn ôn tại chỗ.
class OpenDailyRequest {
  const OpenDailyRequest({this.review = const []});

  final List<ReviewItem> review;

  static OpenDailyRequest? parse(List<dynamic> args) {
    final p = _payload(args, 'openDaily');
    if (p == null) return null;
    return OpenDailyRequest(review: parseReviewItems(p['review']));
  }
}

/// JS nhờ mở màn "Từ đã học" (chạm ô trên cuộn Tĩnh toạ — R-ON-8, docs/bridge.md `openLearned`).
class OpenLearnedRequest {
  const OpenLearnedRequest({required this.words, this.lessons = const [], required this.region});

  /// các từ đã học, theo thứ tự giáo trình
  final List<Word> words;

  /// các bài đã học (mã, tên) — nhóm theo bài
  final List<({String id, String title})> lessons;
  final String region;

  /// Sai dạng → `null` (Flutter trả `false`, trang tự mở bảng HTML).
  static OpenLearnedRequest? parse(List<dynamic> args) {
    final p = _payload(args, 'openLearned');
    final words = p?['words'];
    if (p == null || words is! List) return null;
    final ls = p['lessons'];
    return OpenLearnedRequest(
      words: parseWords(words),
      lessons: ls is List
          ? [
              for (final l in ls)
                if (l is Map && l['id'] is String && l['title'] is String) (id: l['id'] as String, title: l['title'] as String),
            ]
          : const [],
      region: p['region'] is String ? p['region'] as String : firstRegion,
    );
  }
}

/// Đọc danh sách `items` của `openReview`; mục sai dạng bị bỏ qua.
List<ReviewItem> parseReviewItems(Object? v) {
  if (v is! List) return const [];
  final out = <ReviewItem>[];
  for (final it in v) {
    if (it is! Map) continue;
    final word = parseWord(it['word']);
    final qs = it['questions'];
    if (word == null || qs is! List) continue;
    final questions = <ReviewQuestion>[];
    for (final q in qs) {
      if (q is! Map) continue;
      final kind = q['kind'], options = q['options'], answer = q['answer'];
      if (kind is! String || options is! List || answer is! num) continue;
      final opts = [for (final o in options) if (o is String) o];
      final a = answer.toInt();
      if (opts.length != options.length || a < 0 || a >= opts.length) continue;
      questions.add(ReviewQuestion(kind: kind, options: opts, answer: a));
    }
    if (questions.isNotEmpty) out.add(ReviewItem(word: word, questions: questions));
  }
  return out;
}

Map<dynamic, dynamic>? _payload(List<dynamic> args, String type) {
  if (args.isEmpty) return null;
  final e = args.first;
  if (e is! Map || e['type'] != type) return null;
  final p = e['payload'];
  return p is Map ? p : null;
}
