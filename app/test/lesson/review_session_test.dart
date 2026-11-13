import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/lesson/review_session.dart';
import 'package:hoc_xa_3d/scene/review_event.dart';
import 'package:hoc_xa_3d/scene/scene_event.dart';

ReviewItem _item(String id) => ReviewItem(
      radical: Radical(id: id, form: id, name: id, meaning: id, pinyin: id, strokes: 1, examples: const []),
      questions: const [
        ReviewQuestion(ask: 'pinyin', options: ['a', 'b', 'c'], answer: 0),
        ReviewQuestion(ask: 'meaning', options: ['a', 'b', 'c'], answer: 2),
      ],
    );

/// Trả lời một bộ: [first], [second] = phương án chọn; trả về `check()` của câu 2.
bool _answer(ReviewSession s, int first, int second) {
  s.select(first);
  expect(s.check(), isFalse);
  s.next();
  s.select(second);
  return s.check();
}

void main() {
  test('R-ON-2: chọn đổi được tới khi kiểm tra; chưa chọn thì không kiểm tra được', () {
    final s = ReviewSession([_item('x')]);
    expect(s.canCheck, isFalse);
    expect(s.check(), isFalse);
    s.select(1);
    s.select(0);
    expect(s.check(), isFalse); // câu 1 chưa chấm bộ
    expect(s.phase, ReviewPhase.checked);
    expect(s.lastRight, isTrue);
    s.select(2); // đã kiểm tra → không đổi
    expect(s.picks, [0]);
  });

  test('R-ON-2: chấm sau câu 2 — 2/2 nhớ rõ, 1/2 một phần, 0/2 chưa nhớ', () {
    final s = ReviewSession([_item('a'), _item('b'), _item('c')]);
    expect(_answer(s, 0, 2), isTrue);
    expect(s.scores, [2]);
    s.next();
    expect(s.phase, ReviewPhase.result);
    s.next();
    expect(_answer(s, 0, 1), isTrue);
    s.next();
    s.next();
    expect(_answer(s, 1, 1), isTrue);
    expect(s.scores, [2, 1, 0]);
    expect(s.levelCounts, [1, 1, 1]);
    s.next(); // bộ cuối: thẳng tổng kết
    expect(s.phase, ReviewPhase.summary);
  });

  test('R-ON-5: thoát giữa lượt — chỉ bộ đã kiểm tra đủ 2 câu được chấm', () {
    final s = ReviewSession([_item('a'), _item('b')]);
    _answer(s, 0, 2);
    s.next();
    s.next();
    s.select(0);
    s.check(); // bộ b mới xong câu 1 rồi thoát
    expect(s.scores, [2]);
  });

  test('reviewLevel', () {
    expect([reviewLevel(2, 2), reviewLevel(1, 2), reviewLevel(0, 2)], [2, 1, 0]);
  });
}
