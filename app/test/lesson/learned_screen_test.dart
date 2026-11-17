import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/review.dart';
import 'package:hoc_xa_3d/lesson/learned_screen.dart';
import 'package:hoc_xa_3d/scene/word_event.dart';

Word _w(String han, String pinyin, String meaning) => Word(id: han, han: han, pinyin: pinyin, meaning: meaning);

void main() {
  const today = 50;
  final cards = {
    '你': const ReviewCard(step: 1, due: 50),
    '好': const ReviewCard(step: 0, due: 51),
    '朋友': const ReviewCard(step: 2, due: 54),
  };
  final three = learnedEntries([_w('你', 'nǐ', 'bạn'), _w('好', 'hǎo', 'tốt'), _w('朋友', 'péngyou', 'bạn bè')], cards, today);
  final fifty = learnedEntries([for (var i = 0; i < 50; i++) Word(id: 'w$i', han: '字', pinyin: 'zì $i', meaning: 'nghĩa')], const {}, today);

  Future<List<Word?>> open(WidgetTester tester, Size size, List<LearnedEntry> entries) async {
    tester.view.physicalSize = size;
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    final picked = <Word?>[];
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
    testWidgets('R-ON-1 ($tag): ô từ đã học — bậc nhớ, "Đến hạn" / "Ôn sau n ngày", đếm từ đến hạn; chạm → trả từ đó', (tester) async {
      final picked = await open(tester, size, three);
      expect(find.text('3 / 304 từ'), findsOneWidget);
      expect(find.text('1 từ đến hạn'), findsOneWidget);
      expect(find.text('Đến hạn'), findsOneWidget);
      expect(find.text('Ôn sau 1 ngày'), findsOneWidget);
      expect(find.text('Ôn sau 4 ngày'), findsOneWidget);
      expect(find.bySemanticsLabel('你 nǐ — bạn, bậc 2, đến hạn ôn'), findsOneWidget);
      expect(find.bySemanticsLabel('好 hǎo — tốt, bậc 1, ôn sau 1 ngày'), findsOneWidget);
      await tester.tap(find.text('朋友'));
      await tester.pumpAndSettle();
      expect(picked.single?.id, '朋友');
    });

    testWidgets('R-ON-8 ($tag): 50 từ cuộn được; "Về cuộn sách" → không chọn từ nào', (tester) async {
      final picked = await open(tester, size, fifty);
      expect(find.text('50 / 304 từ'), findsOneWidget);
      await tester.drag(find.byType(GridView), const Offset(0, -2000));
      await tester.pumpAndSettle();
      expect(find.text('zì 49'), findsOneWidget);
      await tester.tap(find.bySemanticsLabel('Về cuộn sách'));
      await tester.pumpAndSettle();
      expect(picked, [null]);
    });
  }
}
