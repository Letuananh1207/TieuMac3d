import 'scene_event.dart';

/// Sự kiện ôn tập + bảng nhiệm vụ qua cầu nối (docs/bridge.md `openReview`, `openDaily`). Câu đố do trang dựng
/// (`web/src/zones/review.ts`); Flutter hiện màn, chấm, lưu lịch ôn.

/// Một câu đố: hỏi pinyin hoặc nghĩa (R-ON-2), 3 phương án, [answer] = chỉ số đáp án.
class ReviewQuestion {
  const ReviewQuestion({required this.ask, required this.options, required this.answer});

  /// `pinyin` · `meaning`
  final String ask;
  final List<String> options;
  final int answer;

  bool get isPinyin => ask == 'pinyin';
}

/// Một bộ thủ đến hạn và 2 câu đố của nó.
class ReviewItem {
  const ReviewItem({required this.radical, required this.questions});

  final Radical radical;
  final List<ReviewQuestion> questions;
}

/// JS nhờ mở màn ôn câu đố (ngồi thiền ở Rừng trúc khi còn bộ đến hạn — R-ON-5).
class OpenReviewRequest {
  const OpenReviewRequest({required this.items, required this.region});

  final List<ReviewItem> items;
  final String region;

  /// Sai dạng / không có bộ nào → `null` (Flutter trả `false`, trang mở thẻ bộ mới như cũ).
  static OpenReviewRequest? parse(List<dynamic> args) {
    final p = _payload(args, 'openReview');
    if (p == null) return null;
    final items = parseReviewItems(p['items']);
    if (items.isEmpty) return null;
    return OpenReviewRequest(items: items, region: p['region'] is String ? p['region'] as String : 'Rừng trúc');
  }
}

/// JS nhờ mở bảng nhiệm vụ 日課榜 (R-NV-3): kèm sẵn câu đố của các bộ đến hạn để "Ôn ngay" mở màn ôn tại chỗ, và chữ
/// của từng bộ thủ (mã → chữ) để bảng hiện các bộ đã học hôm nay.
class OpenDailyRequest {
  const OpenDailyRequest({this.review = const [], this.forms = const {}});

  final List<ReviewItem> review;
  final Map<String, String> forms;

  static OpenDailyRequest? parse(List<dynamic> args) {
    final p = _payload(args, 'openDaily');
    if (p == null) return null;
    final f = p['forms'];
    return OpenDailyRequest(
      review: parseReviewItems(p['review']),
      forms: f is Map ? {for (final e in f.entries) if (e.key is String && e.value is String) e.key as String: e.value as String} : const {},
    );
  }
}

/// Một mục của bảng chọn cuộn sách Ngồi ôn: `review` · `learn` · `learned`; mờ thì [reason] nói vì sao
/// (`reviewedToday` · `learnInRegion` · `allLearned` · `noneLearned` — chuỗi hiển thị do Flutter giữ).
class StudyItem {
  const StudyItem({required this.id, required this.enabled, this.reason, this.count = 0});

  final String id;
  final bool enabled;
  final String? reason;
  final int count;
}

/// JS nhờ mở bảng chọn cuộn sách Ngồi ôn (ngồi ôn đủ 1 giây — R-ON-8). Bảng chỉ đóng bằng "Đứng dậy".
class OpenStudyRequest {
  const OpenStudyRequest({
    required this.items,
    this.highlight,
    this.review = const [],
    this.next,
    this.upcoming = const [],
    this.learned = const [],
    required this.region,
  });

  static const ids = ['review', 'learn', 'learned'];

  /// luôn đủ 3 mục theo thứ tự [ids]
  final List<StudyItem> items;

  /// `review` · `learn` · `null`
  final String? highlight;

  /// câu đố các bộ đến hạn (như `openReview`)
  final List<ReviewItem> review;

  /// bộ mở khi chọn "Học bộ mới"
  final Radical? next;

  /// các bộ chưa học sau [next], theo thứ tự Rừng trúc — học xong [next] trên bảng thì bộ kế lấy từ đây
  final List<Radical> upcoming;

  /// các bộ đã học, theo thứ tự Rừng trúc
  final List<Radical> learned;
  final String region;

  StudyItem item(String id) => items.firstWhere((i) => i.id == id);

  /// Sai dạng / thiếu mục → `null` (Flutter trả `false`, trang tự mở lượt ôn / thẻ bộ mới).
  static OpenStudyRequest? parse(List<dynamic> args) {
    final p = _payload(args, 'openStudy');
    if (p == null) return null;
    final raw = p['items'];
    if (raw is! List) return null;
    final items = <StudyItem>[];
    for (final it in raw) {
      if (it is! Map || it['id'] is! String || it['enabled'] is! bool) continue;
      final reason = it['reason'], count = it['count'];
      items.add(StudyItem(
        id: it['id'] as String,
        enabled: it['enabled'] as bool,
        reason: reason is String ? reason : null,
        count: count is num ? count.toInt() : 0,
      ));
    }
    if (items.map((i) => i.id).join(',') != ids.join(',')) return null;
    final h = p['highlight'], learned = p['learned'], upcoming = p['upcoming'];
    return OpenStudyRequest(
      items: items,
      highlight: h is String && ids.contains(h) ? h : null,
      review: parseReviewItems(p['review']),
      next: parseRadical(p['next']),
      upcoming: upcoming is List ? [for (final r in upcoming) ?parseRadical(r)] : const [],
      learned: learned is List ? [for (final r in learned) ?parseRadical(r)] : const [],
      region: p['region'] is String ? p['region'] as String : 'Rừng trúc',
    );
  }
}

/// Đọc danh sách `items` của `openReview`; mục sai dạng bị bỏ qua.
List<ReviewItem> parseReviewItems(Object? v) {
  if (v is! List) return const [];
  final out = <ReviewItem>[];
  for (final it in v) {
    if (it is! Map) continue;
    final radical = parseRadical(it['radical']);
    final qs = it['questions'];
    if (radical == null || qs is! List) continue;
    final questions = <ReviewQuestion>[];
    for (final q in qs) {
      if (q is! Map) continue;
      final ask = q['ask'], options = q['options'], answer = q['answer'];
      if (ask is! String || options is! List || answer is! num) continue;
      final opts = [for (final o in options) if (o is String) o];
      final a = answer.toInt();
      if (opts.length != options.length || a < 0 || a >= opts.length) continue;
      questions.add(ReviewQuestion(ask: ask, options: opts, answer: a));
    }
    if (questions.isNotEmpty) out.add(ReviewItem(radical: radical, questions: questions));
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
