/// Nhiệm vụ hằng ngày của bảng 日課榜 (R-NV-1, R-NV-2) — quy luật mang từ Hán Tự Ký (R-DD-1, R-DD-3), điểm danh tự động.
/// Thuần Dart, ngày là số ngày ([dayOf] trong `review.dart`).
library;

import 'review.dart';

/// Mục tiêu việc Lĩnh hội: số bài từ mới mỗi ngày (R-NV-1).
const dailyNewGoal = 1;

/// Hai việc của một ngày.
class DailyStatus {
  const DailyStatus({required this.newToday, required this.dueLeft, required this.allLearned, this.reviewedToday = 0});

  /// số bài bấm "Đã lĩnh hội" lần đầu trong ngày
  final int newToday;

  /// số từ còn đến hạn ôn hôm nay — 0 khi hôm nay đã ôn đủ [reviewSessionCap] từ (R-NV-1)
  final int dueLeft;

  /// đã học hết giáo trình → việc Lĩnh hội tự xong
  final bool allLearned;

  /// số từ đã ôn (chấm) hôm nay
  final int reviewedToday;

  bool get learnDone => allLearned || newToday >= dailyNewGoal;
  bool get reviewDone => dueLeft == 0;
  bool get done => learnDone && reviewDone;
}

/// Trạng thái hai việc hôm [today] (R-NV-1): [lessonDays] = mã bài đã học → ngày học; [cards] = lịch ôn từng từ;
/// [totalLessons] = số bài của giáo trình. Ôn tập xong khi hết từ đến hạn **hoặc** hôm nay đã ôn đủ 20 từ (R-ON-4).
DailyStatus dailyStatus(Map<String, ReviewCard> cards, Map<String, int> lessonDays, int totalLessons, int today) {
  final reviewed = cards.values.where((c) => c.lastDay == today).length;
  return DailyStatus(
    newToday: lessonDays.values.where((d) => d == today).length,
    dueLeft: reviewed >= reviewSessionCap ? 0 : cards.values.where((c) => c.isDue(today)).length,
    allLearned: lessonDays.length >= totalLessons,
    reviewedToday: reviewed,
  );
}

/// Chuỗi ngày (R-NV-2): [current] = số ngày xong liên tiếp tới hôm nay (hôm nay chưa xong → tính tới hôm qua);
/// [best] = chuỗi dài nhất từng có.
({int current, int best}) streakOf(Set<int> doneDays, int today) {
  var current = 0;
  for (var d = doneDays.contains(today) ? today : today - 1; doneDays.contains(d); d--) {
    current++;
  }
  var best = 0;
  for (final d in doneDays) {
    if (doneDays.contains(d - 1)) continue; // không phải đầu chuỗi
    var n = 0;
    while (doneDays.contains(d + n)) {
      n++;
    }
    if (n > best) best = n;
  }
  return (current: current, best: best);
}

/// Một ô trong dải 7 ngày của bảng nhiệm vụ (thiết kế 2026-11-13.25).
enum DayMark {
  /// ngày đã được tính vào chuỗi (trước hôm nay)
  counted,

  /// hôm nay, chưa xong cả 2 việc
  today,

  /// hôm nay, đã xong (được tính)
  todayDone,

  /// ngày đã qua mà không xong
  missed,

  /// ngày chưa tới
  future,
}

/// Dải 7 ngày Thứ Hai → Chủ nhật của tuần chứa [today]; [weekday] = thứ của hôm nay (1 = Thứ Hai … 7 = Chủ nhật, như
/// `DateTime.weekday`).
List<DayMark> weekStrip(Set<int> doneDays, int today, int weekday) {
  final monday = today - (weekday - 1);
  return [
    for (var d = monday; d < monday + 7; d++)
      if (d == today)
        doneDays.contains(d) ? DayMark.todayDone : DayMark.today
      else if (d > today)
        DayMark.future
      else
        doneDays.contains(d) ? DayMark.counted : DayMark.missed,
  ];
}

/// Viên "Kỷ lục mới": hôm nay vừa được tính và chuỗi hiện tại bằng kỷ lục (R-NV-2, thiết kế 2026-11-13.25).
bool isNewRecord(Set<int> doneDays, int today, ({int current, int best}) streak) =>
    doneDays.contains(today) && streak.current > 0 && streak.current == streak.best;
