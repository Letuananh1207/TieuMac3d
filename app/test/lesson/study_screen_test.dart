import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/review.dart';
import 'package:hoc_xa_3d/lesson/study_board.dart';
import 'package:hoc_xa_3d/lesson/study_screen.dart';
import 'package:hoc_xa_3d/scene/review_event.dart';
import 'package:hoc_xa_3d/scene/scene_event.dart';

Radical _r(String id, String form, String name, String meaning) =>
    Radical(id: id, form: form, name: name, meaning: meaning, pinyin: id, strokes: 1, examples: const []);

final _truc = _r('truc', '竹', 'trúc', 'tre');
final _moc = _r('moc', '木', 'mộc', 'cây');
final _thuy = _r('thuy', '氵', 'thuỷ', 'nước');
final _son = _r('son', '山', 'sơn', 'núi');

ReviewItem _q(Radical r) =>
    ReviewItem(radical: r, questions: const [ReviewQuestion(ask: 'pinyin', options: ['a', 'b', 'c'], answer: 0)]);

/// Kho giả: học / ôn trên bảng ghi vào đây.
class _Fake {
  _Fake(this.learned, [this.due = const []]);

  final List<String> learned;
  List<String> due;
  final reviews = <List<String>>[];

  StudyProgress read() => StudyProgress(
        learned: learned.toSet(),
        due: due,
        cards: {for (final id in learned) id: ReviewCard(step: 0, due: due.contains(id) ? 10 : 11)},
        today: 10,
      );
}

Future<void> _open(WidgetTester tester, Size size, OpenStudyRequest req, _Fake fake) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(MaterialApp(
    home: Builder(
      builder: (context) => Scaffold(
        body: TextButton(
          onPressed: () async {
            await Navigator.of(context).push(StudyScreen.route(req, fake.read, (items) async {
              fake.reviews.add([for (final i in items) i.radical.id]);
              fake.due = const [];
            }, (id) async => fake.learned.add(id)));
          },
          child: const Text('mở'),
        ),
      ),
    ),
  ));
  await tester.tap(find.text('mở'));
  await tester.pumpAndSettle();
}

OpenStudyRequest _req({required List<StudyItem> items, String? highlight, List<Radical> learned = const [], List<Radical> due = const [], Radical? next, List<Radical> upcoming = const []}) =>
    OpenStudyRequest(items: items, highlight: highlight, review: [for (final r in due) _q(r)], next: next, upcoming: upcoming, learned: learned, region: 'Văn Uyên Tông');

void main() {
  final tonMon = _req(
    items: const [
      StudyItem(id: 'review', enabled: true, count: 2),
      StudyItem(id: 'learn', enabled: false, reason: 'learnInRegion'),
      StudyItem(id: 'learned', enabled: true, count: 5),
    ],
    highlight: 'review',
    learned: [_truc, _moc, _thuy, _son, _r('thach', '石', 'thạch', 'đá')],
    due: [_truc, _moc],
  );
  final chuaHoc = _req(items: const [
    StudyItem(id: 'review', enabled: false, reason: 'noneLearned'),
    StudyItem(id: 'learn', enabled: false, reason: 'learnInRegion'),
    StudyItem(id: 'learned', enabled: false, reason: 'noneLearned'),
  ]);

  for (final size in const [Size(390, 844), Size(844, 390), Size(320, 568)]) {
    final tag = '${size.width.toInt()}×${size.height.toInt()}';
    testWidgets('R-ON-8 ($tag): tông môn 2 bộ đến hạn — Ôn (2), "Học ở Rừng trúc", 4 bộ gần nhất; Đứng dậy đóng bảng', (tester) async {
      final fake = _Fake(['truc', 'moc', 'thuy', 'son', 'thach'], ['truc', 'moc']);
      await _open(tester, size, tonMon, fake);
      expect(find.text('Ôn bộ đến hạn (2)'), findsOneWidget);
      expect(find.text('Học ở Rừng trúc'), findsOneWidget);
      expect(find.text('Xem bộ đã học'), findsOneWidget);
      expect(find.textContaining('5 / 50 bộ', findRichText: true), findsOneWidget);
      expect(find.textContaining('木 氵 山 石', findRichText: true), findsOneWidget);
      expect(find.textContaining('mỗi bộ 2 câu', findRichText: true), findsOneWidget);
      expect(find.textContaining('Chưa học bộ nào'), findsNothing);
      await tester.tap(find.text('Đứng dậy'));
      await tester.pumpAndSettle();
      expect(find.byType(StudyScreen), findsNothing);
    });

    testWidgets('R-ON-8 ($tag): chưa học bộ nào — cả 3 mục mờ, không "(0)", có gợi ý đi Rừng trúc', (tester) async {
      await _open(tester, size, chuaHoc, _Fake([]));
      expect(find.text('Ôn bộ đến hạn'), findsOneWidget);
      expect(find.textContaining('(0)'), findsNothing);
      expect(find.text('Chưa có bộ nào để ôn'), findsOneWidget);
      expect(find.text('Chưa học bộ nào'), findsOneWidget);
      expect(find.textContaining('Đến Truyền Tống Đài', findRichText: true), findsOneWidget);
      await tester.tap(find.text('Xem bộ đã học'));
      await tester.pumpAndSettle();
      expect(find.text('Bộ đã học'), findsNothing); // mục mờ không mở
    });
  }

  testWidgets('R-ON-5: chọn Ôn → màn ôn các bộ đến hạn; đóng → bảng hiện lại "Hôm nay đã ôn xong"', (tester) async {
    final fake = _Fake(['truc', 'moc', 'thuy', 'son', 'thach'], ['truc', 'moc']);
    await _open(tester, const Size(390, 844), tonMon, fake);
    await tester.tap(find.text('Ôn bộ đến hạn (2)'));
    await tester.pumpAndSettle();
    expect(fake.reviews, [
      ['truc', 'moc'],
    ]);
    expect(find.text('Hôm nay đã ôn xong'), findsOneWidget);
    expect(find.byType(StudyScreen), findsOneWidget);
  });

  testWidgets('R-HANH-3: Rừng trúc — Học bộ mới → thẻ 木; "Đã lĩnh hội" → về bảng, bộ kế 氵; xem bộ đã học → chạm 竹 → "Xuất định" → về bảng', (tester) async {
    final fake = _Fake(['truc']);
    final req = _req(
      items: const [
        StudyItem(id: 'review', enabled: false, reason: 'reviewedToday'),
        StudyItem(id: 'learn', enabled: true, count: 3),
        StudyItem(id: 'learned', enabled: true, count: 1),
      ],
      highlight: 'learn',
      learned: [_truc],
      next: _moc,
      upcoming: [_thuy, _son],
    );
    await _open(tester, const Size(390, 844), req, fake);
    expect(find.textContaining('Bộ kế tiếp: 木 mộc — cây', findRichText: true), findsOneWidget);
    await tester.tap(find.text('Học bộ mới'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Đã lĩnh hội'));
    await tester.pumpAndSettle();
    expect(fake.learned, ['truc', 'moc']);
    expect(find.textContaining('Bộ kế tiếp: 氵 thuỷ — nước', findRichText: true), findsOneWidget);
    expect(find.textContaining('2 / 50 bộ', findRichText: true), findsOneWidget);

    await tester.tap(find.text('Xem bộ đã học'));
    await tester.pumpAndSettle();
    expect(find.text('Bộ đã học'), findsOneWidget);
    await tester.tap(find.bySemanticsLabel(RegExp('^竹 trúc')));
    await tester.pumpAndSettle();
    expect(find.text('Xuất định'), findsOneWidget);
    await tester.tap(find.text('Xuất định'));
    await tester.pumpAndSettle();
    expect(find.byType(StudyScreen), findsOneWidget);
    expect(find.text('Bộ đã học'), findsNothing);
    expect(fake.learned, ['truc', 'moc']);
  });
}
