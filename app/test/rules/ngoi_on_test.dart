import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/review.dart';
import 'package:hoc_xa_3d/lesson/study_board.dart';
import 'package:hoc_xa_3d/scene/review_event.dart';
import 'package:hoc_xa_3d/scene/scene_event.dart';

// Bảng chọn cuộn sách Ngồi ôn tính lại trên Flutter sau mỗi lần học / ôn (R-ON-8, R-ON-5, R-HANH-3).

Radical _r(String id, String form) =>
    Radical(id: id, form: form, name: id, meaning: id, pinyin: id, strokes: 1, examples: const []);

final _truc = _r('truc', '竹'), _moc = _r('moc', '木'), _thuy = _r('thuy', '氵'), _son = _r('son', '山');

ReviewItem _q(Radical r) =>
    ReviewItem(radical: r, questions: const [ReviewQuestion(ask: 'pinyin', options: ['a', 'b', 'c'], answer: 0)]);

/// Dữ liệu trang gửi (`openStudy` — web/src/zones/studyMenu.ts).
OpenStudyRequest _req({
  required bool lessons,
  List<Radical> learned = const [],
  List<Radical> due = const [],
  List<Radical> left = const [],
}) {
  final review = due.isNotEmpty
      ? StudyItem(id: 'review', enabled: true, count: due.length)
      : StudyItem(id: 'review', enabled: false, reason: learned.isEmpty ? 'noneLearned' : 'reviewedToday');
  final learn = !lessons
      ? const StudyItem(id: 'learn', enabled: false, reason: 'learnInRegion')
      : left.isNotEmpty
          ? StudyItem(id: 'learn', enabled: true, count: left.length)
          : const StudyItem(id: 'learn', enabled: false, reason: 'allLearned');
  return OpenStudyRequest(
    items: [
      review,
      learn,
      learned.isEmpty
          ? const StudyItem(id: 'learned', enabled: false, reason: 'noneLearned')
          : StudyItem(id: 'learned', enabled: true, count: learned.length),
    ],
    review: [for (final r in due) _q(r)],
    next: lessons && left.isNotEmpty ? left.first : null,
    upcoming: lessons && left.length > 1 ? left.sublist(1) : const [],
    learned: learned,
    region: lessons ? 'Rừng trúc' : 'Văn Uyên Tông',
  );
}

StudyProgress _p(List<Radical> learned, [List<Radical> due = const []]) =>
    StudyProgress(learned: {for (final r in learned) r.id}, due: [for (final r in due) r.id]);

void main() {
  test('R-ON-8: tông môn, 2 bộ đến hạn → Ôn (2) nổi bật, Học bộ mới mờ "Học ở Rừng trúc", Xem dùng được', () {
    final learned = [_truc, _moc, _thuy, _son];
    final b = StudyBoard.of(_req(lessons: false, learned: learned, due: [_truc, _moc]), _p(learned, [_truc, _moc]));
    expect(b.review.enabled, isTrue);
    expect(b.review.count, 2);
    expect(b.learn.reason, 'learnInRegion');
    expect(b.viewLearned.enabled, isTrue);
    expect(b.highlight, 'review');
    expect(b.reviewItems.map((i) => i.radical.id), ['truc', 'moc']);
    expect(b.noneLearned, isFalse);
  });

  test('R-ON-5: ôn 1 bộ rồi thoát → bảng hiện lại, Ôn còn (1); ôn hết → mờ "Hôm nay đã ôn xong"', () {
    final learned = [_truc, _moc];
    final req = _req(lessons: false, learned: learned, due: [_truc, _moc]);
    final one = StudyBoard.of(req, _p(learned, [_moc]));
    expect(one.review.count, 1);
    expect(one.reviewItems.single.radical.id, 'moc');
    final done = StudyBoard.of(req, _p(learned));
    expect(done.review.enabled, isFalse);
    expect(done.review.reason, 'reviewedToday');
    expect(done.highlight, isNull);
  });

  test('R-ON-8 / R-HANH-3: Rừng trúc, không bộ đến hạn → Học bộ mới nổi bật; học xong → bộ kế tiếp, Xem thêm bộ vừa học', () {
    final req = _req(lessons: true, learned: [_truc], left: [_moc, _thuy, _son]);
    final b = StudyBoard.of(req, _p([_truc]));
    expect(b.highlight, 'learn');
    expect(b.review.reason, 'reviewedToday');
    expect(b.next!.id, 'moc');
    final after = StudyBoard.of(req, _p([_truc, _moc]));
    expect(after.next!.id, 'thuy');
    expect(after.learn.count, 2);
    expect(after.learned.map((r) => r.id), ['truc', 'moc']);
    expect(after.viewLearned.count, 2);
  });

  test('R-ON-8: học bộ cuối trên bảng → Học bộ mới mờ "Đã học đủ", dòng đã học đủ, không mục nổi bật', () {
    final req = _req(lessons: true, learned: [_truc, _moc, _thuy], left: [_son]);
    final b = StudyBoard.of(req, _p([_truc, _moc, _thuy, _son]));
    expect(b.learn.enabled, isFalse);
    expect(b.learn.reason, 'allLearned');
    expect(b.allLearned, isTrue);
    expect(b.next, isNull);
    expect(b.highlight, isNull);
  });

  test('R-ON-8: chưa học bộ nào ở tông môn → cả 3 mục mờ, không mục nổi bật, có gợi ý đi Rừng trúc', () {
    final b = StudyBoard.of(_req(lessons: false), _p(const []));
    expect(b.items.every((i) => !i.enabled), isTrue);
    expect(b.review.reason, 'noneLearned');
    expect(b.learn.reason, 'learnInRegion');
    expect(b.viewLearned.reason, 'noneLearned');
    expect(b.highlight, isNull);
    expect(b.noneLearned, isTrue);
  });

  test('R-ON-1: ô Bộ đã học — bậc nhớ 1…7, đến hạn / ôn sau n ngày', () {
    const today = 100;
    final cards = {
      'truc': const ReviewCard(step: 1, due: 99),
      'moc': const ReviewCard(step: 0, due: 101),
      'thuy': const ReviewCard(step: 6, due: 280, mastered: true),
    };
    final e = learnedEntries([_truc, _moc, _thuy, _son], cards, today);
    expect([for (final x in e) x.level], [2, 1, 7, 1]);
    expect([for (final x in e) x.due], [true, false, false, true]);
    expect(e[1].daysLeft, 1);
    expect(e[2].daysLeft, 180);
  });
}
