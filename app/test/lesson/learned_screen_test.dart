import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/review.dart';
import 'package:hoc_xa_3d/lesson/learned_screen.dart';
import 'package:hoc_xa_3d/lesson/study_board.dart';
import 'package:hoc_xa_3d/scene/scene_event.dart';

Radical _r(String id, String form, String name, String meaning) =>
    Radical(id: id, form: form, name: name, meaning: meaning, pinyin: id, strokes: 1, examples: const []);

void main() {
  const today = 50;
  final cards = {
    'truc': const ReviewCard(step: 1, due: 50),
    'moc': const ReviewCard(step: 0, due: 51),
    'thuy': const ReviewCard(step: 2, due: 54),
  };
  final three = learnedEntries([_r('truc', '竹', 'trúc', 'tre'), _r('moc', '木', 'mộc', 'cây'), _r('thuy', '氵', 'thuỷ', 'nước')], cards, today);
  final fifty = learnedEntries([for (var i = 0; i < 50; i++) _r('b$i', '木', 'bộ $i', 'nghĩa')], const {}, today);

  Future<List<Radical?>> open(WidgetTester tester, Size size, List<LearnedEntry> entries) async {
    tester.view.physicalSize = size;
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    final picked = <Radical?>[];
    await tester.pumpWidget(MaterialApp(
      home: Builder(
        builder: (context) => Scaffold(
          body: TextButton(
            onPressed: () async => picked.add(await Navigator.of(context).push(LearnedScreen.route(entries))),
            child: const Text('mở'),
          ),
        ),
      ),
    ));
    await tester.tap(find.text('mở'));
    await tester.pumpAndSettle();
    return picked;
  }

  for (final size in const [Size(390, 844), Size(844, 390)]) {
    final tag = size.width > size.height ? 'ngang' : 'dọc';
    testWidgets('R-ON-1 ($tag): ô bộ đã học — bậc nhớ, "Đến hạn" / "Ôn sau n ngày", đếm bộ đến hạn; chạm → trả bộ đó', (tester) async {
      final picked = await open(tester, size, three);
      expect(find.text('3 / 50 bộ'), findsOneWidget);
      expect(find.text('1 bộ đến hạn'), findsOneWidget);
      expect(find.text('Đến hạn'), findsOneWidget);
      expect(find.text('Ôn sau 1 ngày'), findsOneWidget);
      expect(find.text('Ôn sau 4 ngày'), findsOneWidget);
      expect(find.bySemanticsLabel('竹 trúc — tre, bậc 2, đến hạn ôn'), findsOneWidget);
      expect(find.bySemanticsLabel('木 mộc — cây, bậc 1, ôn sau 1 ngày'), findsOneWidget);
      await tester.tap(find.text('氵'));
      await tester.pumpAndSettle();
      expect(picked.single?.id, 'thuy');
    });

    testWidgets('R-ON-8 ($tag): 50 bộ cuộn được; "Về cuộn sách" → không chọn bộ nào', (tester) async {
      final picked = await open(tester, size, fifty);
      expect(find.text('50 / 50 bộ'), findsOneWidget);
      await tester.drag(find.byType(GridView), const Offset(0, -2000));
      await tester.pumpAndSettle();
      expect(find.text('bộ 49'), findsOneWidget);
      await tester.tap(find.bySemanticsLabel('Về cuộn sách'));
      await tester.pumpAndSettle();
      expect(picked, [null]);
    });
  }
}
