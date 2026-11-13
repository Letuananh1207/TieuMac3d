/// Ôn tập theo lịch (R-ON-1…4) — quy luật mang từ Hán Tự Ký (`lib/domain/rules/review_rules.dart`, sổ R-ON).
/// Thuần Dart: ngày là **số ngày** ([dayOf]) để cộng trừ không vướng giờ mùa hè; test được không cần đồng hồ thật.
library;

/// Khoảng ngày của từng bậc (bậc 1 = 1 ngày … bậc 7 = 120 ngày) — R-ON-1.
const reviewIntervals = [1, 3, 7, 14, 30, 60, 120];

/// Bậc cuối đúng 2/2 → đã thuộc, chừng này ngày sau mới hỏi lại (R-ON-3).
const masteredDays = 180;

/// Số câu đố mỗi bộ trong một lượt ôn: Pinyin → Nghĩa (R-ON-2).
const reviewQuestions = 2;

/// Số ngày của [t] theo giờ máy (ngày mới bắt đầu lúc 0 giờ — R-NV-1). Hai thời điểm cùng ngày lịch → cùng số.
int dayOf(DateTime t) => DateTime.utc(t.year, t.month, t.day).difference(DateTime.utc(1970)).inDays;

/// Lịch ôn của một bộ thủ.
class ReviewCard {
  const ReviewCard({
    required this.step,
    required this.due,
    this.lapses = 0,
    this.mastered = false,
    this.learnedDay,
    this.lastDay,
  });

  /// Bấm "đã học" lần đầu hôm [today] → bậc 1, hạn ngày mai (R-ON-1).
  factory ReviewCard.learned(int today) => ReviewCard(step: 0, due: today + 1, learnedDay: today);

  /// Bộ đã học từ trước khi có lịch ôn → bậc 1, hạn hôm nay (R-ON-1). Không tính vào việc Lĩnh hội của ngày nào.
  factory ReviewCard.legacy(int today) => ReviewCard(step: 0, due: today);

  /// chỉ số trong [reviewIntervals] (0 = bậc 1 ngày)
  final int step;

  /// ngày đến hạn ([dayOf])
  final int due;

  /// số lần quên (0/2) — để dành cho "chữ khó" (chưa làm)
  final int lapses;
  final bool mastered;

  /// ngày bấm "đã học" lần đầu; `null` = học từ trước khi có lịch ôn
  final int? learnedDay;

  /// ngày ôn gần nhất
  final int? lastDay;

  /// Số ngày của bậc hiện tại (1 · 3 · … · 120; đã thuộc → 180).
  int get interval => mastered ? masteredDays : reviewIntervals[step];

  /// Đến hạn hôm [today]: hạn ≤ hôm nay (kể cả trễ), chưa ôn hôm nay (R-ON-4).
  bool isDue(int today) => due <= today && lastDay != today;

  /// Chấm lượt ôn hôm [today] với [correct] câu đúng / 2 (R-ON-2, R-ON-3). Hạn mới luôn tính từ hôm ôn.
  ReviewCard grade(int correct, int today) {
    final last = reviewIntervals.length - 1;
    if (correct >= reviewQuestions) {
      if (mastered || step == last) return _with(step: last, due: today + masteredDays, mastered: true, today: today);
      return _with(step: step + 1, due: today + reviewIntervals[step + 1], mastered: false, today: today);
    }
    if (correct <= 0) {
      return _with(step: 0, due: today + reviewIntervals[0], mastered: false, today: today, lapses: lapses + 1);
    }
    // 1/2: lùi một bậc (đã thuộc → về bậc cuối rồi lùi: 120 → 60), thấp nhất bậc 1
    final back = (mastered ? last : step) - 1;
    final s = back < 0 ? 0 : back;
    return _with(step: s, due: today + reviewIntervals[s], mastered: false, today: today);
  }

  ReviewCard _with({required int step, required int due, required bool mastered, required int today, int? lapses}) =>
      ReviewCard(
        step: step,
        due: due,
        lapses: lapses ?? this.lapses,
        mastered: mastered,
        learnedDay: learnedDay,
        lastDay: today,
      );

  Map<String, Object?> toJson() => {
        's': step,
        'd': due,
        if (lapses > 0) 'q': lapses,
        if (mastered) 'm': true,
        if (learnedDay != null) 'h': learnedDay,
        if (lastDay != null) 'o': lastDay,
      };

  /// Đọc lại từ [toJson]; sai dạng → `null` (kho hỏng không làm văng app).
  static ReviewCard? fromJson(Object? j) {
    if (j is! Map) return null;
    final s = j['s'], d = j['d'];
    if (s is! int || d is! int || s < 0 || s >= reviewIntervals.length) return null;
    final q = j['q'], h = j['h'], o = j['o'];
    return ReviewCard(
      step: s,
      due: d,
      lapses: q is int ? q : 0,
      mastered: j['m'] == true,
      learnedDay: h is int ? h : null,
      lastDay: o is int ? o : null,
    );
  }
}

/// Các bộ đến hạn hôm [today], theo thứ tự hỏi (R-ON-4): bậc thấp trước → trễ lâu hơn trước → thứ tự học [order]
/// (bộ không có trong [order] xếp cuối).
List<String> dueOrder(Map<String, ReviewCard> cards, List<String> order, int today) {
  int rank(String id) {
    final i = order.indexOf(id);
    return i < 0 ? order.length : i;
  }

  final due = [
    for (final e in cards.entries)
      if (e.value.isDue(today)) e.key,
  ];
  due.sort((a, b) {
    final ca = cards[a]!, cb = cards[b]!;
    final byStep = (ca.mastered ? reviewIntervals.length : ca.step) - (cb.mastered ? reviewIntervals.length : cb.step);
    if (byStep != 0) return byStep;
    final byLate = ca.due - cb.due; // hạn sớm hơn = trễ lâu hơn
    if (byLate != 0) return byLate;
    return rank(a) - rank(b);
  });
  return due;
}
