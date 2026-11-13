import '../scene/review_event.dart';

/// Bước của màn ôn (thiết kế 2026-11-13.25 "Màn ôn câu đố"): đang hỏi → đã kiểm tra (phản hồi đúng / sai) → kết quả một
/// bộ → tổng kết. Bộ cuối: câu 2 xong đi thẳng tổng kết.
enum ReviewPhase { asking, checked, result, summary }

/// Mức nhớ của một bộ sau 2 câu (R-ON-2): 2 = nhớ rõ (2/2), 1 = nhớ một phần (1/2), 0 = chưa nhớ (0/2).
int reviewLevel(int correct, int questions) => correct >= questions ? 2 : (correct > 0 ? 1 : 0);

/// Trạng thái một lượt ôn — thuần Dart, không widget (test được). Chọn được đổi tới khi bấm "Kiểm tra"; chấm bộ ngay khi
/// kiểm tra câu cuối của bộ ([check] trả `true`) để thoát giữa lượt vẫn giữ kết quả bộ đã chấm (R-ON-5).
class ReviewSession {
  ReviewSession(this.items) : assert(items.isNotEmpty);

  final List<ReviewItem> items;

  int index = 0;
  int question = 0;
  int? selected;
  ReviewPhase phase = ReviewPhase.asking;

  /// lựa chọn đã kiểm tra của bộ đang ôn, theo câu
  final List<int> picks = [];

  /// số câu đúng của từng bộ đã chấm, theo thứ tự lượt
  final List<int> scores = [];

  ReviewItem get item => items[index];
  ReviewQuestion get current => item.questions[question];
  bool get lastQuestion => question >= item.questions.length - 1;
  bool get lastItem => index >= items.length - 1;
  bool get canCheck => phase == ReviewPhase.asking && selected != null;

  /// Câu vừa kiểm tra có đúng không (chỉ có nghĩa ở [ReviewPhase.checked]).
  bool get lastRight => picks.isNotEmpty && picks.last == item.questions[picks.length - 1].answer;

  /// Số câu đúng của bộ đang ôn (tính trên các câu đã kiểm tra).
  int get itemCorrect {
    var n = 0;
    for (var i = 0; i < picks.length; i++) {
      if (picks[i] == item.questions[i].answer) n++;
    }
    return n;
  }

  void select(int option) {
    if (phase == ReviewPhase.asking && option >= 0 && option < current.options.length) selected = option;
  }

  /// Bấm "Kiểm tra". Trả `true` khi vừa xong câu cuối của bộ → bên gọi chấm bộ này (lưu lịch ôn).
  bool check() {
    final s = selected;
    if (!canCheck || s == null) return false;
    picks.add(s);
    phase = ReviewPhase.checked;
    if (!lastQuestion) return false;
    scores.add(itemCorrect);
    return true;
  }

  /// "Câu tiếp" (sau phản hồi) / "Bộ tiếp" (sau kết quả bộ).
  void next() {
    switch (phase) {
      case ReviewPhase.checked:
        if (!lastQuestion) {
          question++;
          selected = null;
          phase = ReviewPhase.asking;
        } else {
          phase = lastItem ? ReviewPhase.summary : ReviewPhase.result;
        }
      case ReviewPhase.result:
        if (lastItem) {
          phase = ReviewPhase.summary;
          return;
        }
        index++;
        question = 0;
        selected = null;
        picks.clear();
        phase = ReviewPhase.asking;
      case ReviewPhase.asking:
      case ReviewPhase.summary:
        break;
    }
  }

  /// Đếm số bộ theo mức (chỉ số = mức 0 · 1 · 2).
  List<int> get levelCounts {
    final out = [0, 0, 0];
    for (var i = 0; i < scores.length; i++) {
      out[reviewLevel(scores[i], items[i].questions.length)]++;
    }
    return out;
  }
}
