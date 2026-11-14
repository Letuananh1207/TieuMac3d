import '../journey/progress_store.dart';
import '../journey/review.dart';
import '../scene/review_event.dart';
import '../scene/scene_event.dart';

/// Số liệu bảng chọn cuộn sách Ngồi ôn (R-ON-8) — thuần Dart, test được không cần màn.
/// Trang gửi bảng lúc ngồi đủ 1 giây (`openStudy`); học / ôn ngay trên bảng thì Flutter tự tính lại từ kho tiến độ
/// (trang không gửi lại tới khi đứng dậy).

/// Tiến độ đọc lại sau mỗi lần học / ôn trên bảng.
class StudyProgress {
  const StudyProgress({this.learned = const {}, this.due = const [], this.cards = const {}, this.today = 0});

  factory StudyProgress.of(ProgressStore s) =>
      StudyProgress(learned: s.progress.radicals, due: s.dueRadicals, cards: s.cards, today: s.today);

  /// mã bộ đã học
  final Set<String> learned;

  /// mã bộ còn đến hạn, theo thứ tự hỏi (R-ON-4)
  final List<String> due;

  /// lịch ôn từng bộ (bậc nhớ, hạn — màn Bộ đã học)
  final Map<String, ReviewCard> cards;
  final int today;
}

/// Bảng chọn sau khi áp tiến độ mới nhất lên dữ liệu trang gửi.
class StudyBoard {
  const StudyBoard({
    required this.review,
    required this.learn,
    required this.viewLearned,
    required this.highlight,
    required this.reviewItems,
    required this.next,
    required this.learned,
  });

  /// R-ON-8: Ôn (n = bộ còn đến hạn; n = 0 → mờ, chưa học bộ nào → "Chưa có bộ nào để ôn") · Học bộ mới (chỉ ở vùng
  /// có bài học; hết bộ → "Đã học đủ") · Xem bộ đã học (chưa học → mờ). Nổi bật: Ôn → Học bộ mới → không mục nào.
  factory StudyBoard.of(OpenStudyRequest req, StudyProgress p) {
    final sent = {for (final r in req.learned) r.id};
    final queue = [?req.next, ...req.upcoming];
    final learned = [
      ...req.learned,
      for (final r in queue)
        if (p.learned.contains(r.id) && !sent.contains(r.id)) r,
    ];
    final left = [for (final r in queue) if (!p.learned.contains(r.id)) r];
    final byId = {for (final it in req.review) it.radical.id: it};
    final reviewItems = [for (final id in p.due) ?byId[id]];

    final review = reviewItems.isNotEmpty
        ? StudyItem(id: 'review', enabled: true, count: reviewItems.length)
        : StudyItem(id: 'review', enabled: false, reason: learned.isEmpty ? 'noneLearned' : 'reviewedToday');
    final sentLearn = req.item('learn');
    final hasLessons = sentLearn.enabled || sentLearn.reason == 'allLearned';
    final learn = !hasLessons
        ? const StudyItem(id: 'learn', enabled: false, reason: 'learnInRegion')
        : left.isNotEmpty
            ? StudyItem(id: 'learn', enabled: true, count: left.length)
            : const StudyItem(id: 'learn', enabled: false, reason: 'allLearned');
    final view = learned.isNotEmpty
        ? StudyItem(id: 'learned', enabled: true, count: learned.length)
        : const StudyItem(id: 'learned', enabled: false, reason: 'noneLearned');
    return StudyBoard(
      review: review,
      learn: learn,
      viewLearned: view,
      highlight: review.enabled ? 'review' : (learn.enabled ? 'learn' : null),
      reviewItems: reviewItems,
      next: learn.enabled ? left.first : null,
      learned: learned,
    );
  }

  final StudyItem review;
  final StudyItem learn;
  final StudyItem viewLearned;

  /// `review` · `learn` · `null`
  final String? highlight;

  /// câu đố các bộ còn đến hạn, theo thứ tự hỏi
  final List<ReviewItem> reviewItems;

  /// bộ mở khi chọn "Học bộ mới"
  final Radical? next;

  /// các bộ đã học, theo thứ tự học
  final List<Radical> learned;

  List<StudyItem> get items => [review, learn, viewLearned];

  /// chưa học bộ nào → bảng thêm dòng gợi ý đi Rừng trúc
  bool get noneLearned => learned.isEmpty;

  /// học đủ bộ của vùng → dòng "Đã học đủ 50 bộ thủ Rừng trúc"
  bool get allLearned => learn.reason == 'allLearned';
}

/// Một ô màn Bộ đã học: bậc nhớ 1…7 (R-ON-1), đến hạn hay còn bao nhiêu ngày.
class LearnedEntry {
  const LearnedEntry({required this.radical, required this.level, required this.due, required this.daysLeft});

  final Radical radical;

  /// 1 … 7 ứng với bậc 1 · 3 · 7 · 14 · 30 · 60 · 120 ngày; đã thuộc → 7
  final int level;
  final bool due;

  /// số ngày tới hạn ôn (khi chưa đến hạn)
  final int daysLeft;
}

/// Ô màn Bộ đã học theo thứ tự [learned]; bộ chưa có lịch ôn coi như bậc 1, đến hạn (R-ON-1).
List<LearnedEntry> learnedEntries(List<Radical> learned, Map<String, ReviewCard> cards, int today) => [
      for (final r in learned)
        switch (cards[r.id]) {
          null => LearnedEntry(radical: r, level: 1, due: true, daysLeft: 0),
          final c => LearnedEntry(
              radical: r,
              level: c.mastered ? reviewIntervals.length : c.step + 1,
              due: c.isDue(today),
              daysLeft: c.due - today < 1 ? 1 : c.due - today,
            ),
        },
    ];
