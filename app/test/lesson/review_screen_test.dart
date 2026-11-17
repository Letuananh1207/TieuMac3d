import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/lesson/review_screen.dart';
import 'package:hoc_xa_3d/scene/review_event.dart';
import 'package:hoc_xa_3d/scene/word_event.dart';

ReviewItem _item(String id) => ReviewItem(
      word: Word(id: id, han: id, pinyin: 'shuǐ', meaning: 'nước'),
      questions: const [
        ReviewQuestion(kind: 'chu-pinyin', options: ['shū', 'shuǐ', 'shuí', 'shuì'], answer: 1),
        ReviewQuestion(kind: 'chu-nghia', options: ['cây', 'núi', 'nước', 'lửa'], answer: 2),
      ],
    );

Future<List<(String, int)>> _open(WidgetTester tester, Size size, List<ReviewItem> items) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  final graded = <(String, int)>[];
  await tester.pumpWidget(MaterialApp(
    home: Builder(
      builder: (context) => Scaffold(
        body: TextButton(
          onPressed: () => Navigator.of(context).push(ReviewScreen.route(items, (id, c) async {
            graded.add((id, c));
            return c == 2 ? 3 : 1;
          })),
          child: const Text('mở'),
        ),
      ),
    ),
  ));
  await tester.tap(find.text('mở'));
  await tester.pumpAndSettle();
  return graded;
}

Future<void> _tap(WidgetTester tester, String text) async {
  await tester.tap(find.text(text));
  await tester.pumpAndSettle();
}

void main() {
  for (final size in const [Size(390, 844), Size(844, 390)]) {
    final tag = size.width > size.height ? 'ngang' : 'dọc';
    testWidgets('R-ON-2 ($tag): chọn → Kiểm tra → phản hồi → kết quả từ → tổng kết', (tester) async {
      final graded = await _open(tester, size, [_item('水'), _item('水果')]);
      expect(find.text('Từ 1 / 2'), findsOneWidget);
      expect(find.text('Từ này đọc thế nào?'), findsOneWidget);
      await _tap(tester, 'shuǐ');
      await _tap(tester, 'Kiểm tra');
      expect(find.text('Đúng rồi!'), findsOneWidget);
      await _tap(tester, 'Câu tiếp');
      expect(find.text('Từ này nghĩa là gì?'), findsOneWidget);
      await _tap(tester, 'cây');
      await _tap(tester, 'Kiểm tra');
      expect(find.text('Chưa đúng — 水 · shuǐ · nước'), findsOneWidget);
      expect(graded, [('水', 1)]); // chấm ngay khi xong câu 2
      await _tap(tester, 'Câu tiếp');
      expect(find.text('Kết quả từ này'), findsOneWidget);
      expect(find.text('Lùi một bậc — mai ôn lại'), findsOneWidget);
      await _tap(tester, 'Từ tiếp');
      expect(find.text('Từ 2 / 2'), findsOneWidget);
      await _tap(tester, 'shuǐ');
      await _tap(tester, 'Kiểm tra');
      await _tap(tester, 'Câu tiếp');
      await _tap(tester, 'nước');
      await _tap(tester, 'Kiểm tra');
      await _tap(tester, 'Câu tiếp'); // từ cuối → thẳng tổng kết
      expect(find.text('Ôn xong 2 từ'), findsOneWidget);
      expect(graded, [('水', 1), ('水果', 2)]);
      await _tap(tester, 'Xong');
      expect(find.text('mở'), findsOneWidget);
    });
  }

  testWidgets('R-ON-5: × thoát ngay, không hỏi lại; từ chưa xong không bị chấm', (tester) async {
    final graded = await _open(tester, const Size(390, 844), [_item('水')]);
    await _tap(tester, 'shuǐ');
    await _tap(tester, 'Kiểm tra');
    await tester.tap(find.bySemanticsLabel('Thoát lượt ôn'));
    await tester.pumpAndSettle();
    expect(find.text('mở'), findsOneWidget);
    expect(graded, isEmpty);
  });

  testWidgets('R-TU-2: câu d "Chữ nào là «nghĩa»?" — thấy nghĩa, chọn chữ', (tester) async {
    const item = ReviewItem(
      word: Word(id: '朋友', han: '朋友', pinyin: 'péngyou', meaning: 'bạn bè'),
      questions: [ReviewQuestion(kind: 'nghia-chu', options: ['老师', '朋友', '同学', '名字'], answer: 1)],
    );
    final graded = await _open(tester, const Size(390, 844), [item]);
    expect(find.text('Chữ nào là «bạn bè»?'), findsOneWidget);
    expect(find.text('bạn bè'), findsOneWidget);
    await _tap(tester, '朋友');
    await _tap(tester, 'Kiểm tra');
    expect(find.text('Đúng rồi!'), findsOneWidget);
    expect(graded, [('朋友', 1)]);
  });
}
