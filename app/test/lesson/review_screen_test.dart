import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/lesson/review_screen.dart';
import 'package:hoc_xa_3d/scene/review_event.dart';
import 'package:hoc_xa_3d/scene/scene_event.dart';

ReviewItem _item(String id, String form) => ReviewItem(
      radical: Radical(id: id, form: form, name: 'thuỷ', meaning: 'nước', pinyin: 'shuǐ', strokes: 3, examples: const []),
      questions: const [
        ReviewQuestion(ask: 'pinyin', options: ['mù', 'shuǐ', 'shān'], answer: 1),
        ReviewQuestion(ask: 'meaning', options: ['mộc — cây', 'sơn — núi', 'thuỷ — nước'], answer: 2),
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
    testWidgets('R-ON-2 ($tag): chọn → Kiểm tra → phản hồi → kết quả bộ → tổng kết', (tester) async {
      final graded = await _open(tester, size, [_item('thuy', '氵'), _item('moc', '木')]);
      expect(find.text('Bộ 1 / 2'), findsOneWidget);
      await _tap(tester, 'shuǐ');
      await _tap(tester, 'Kiểm tra');
      expect(find.text('Đúng rồi!'), findsOneWidget);
      await _tap(tester, 'Câu tiếp');
      await _tap(tester, 'mộc — cây');
      await _tap(tester, 'Kiểm tra');
      expect(find.text('Chưa đúng — thuỷ · nước'), findsOneWidget);
      expect(graded, [('thuy', 1)]); // chấm ngay khi xong câu 2
      await _tap(tester, 'Câu tiếp');
      expect(find.text('Kết quả bộ này'), findsOneWidget);
      expect(find.text('Lùi một bậc — mai ôn lại'), findsOneWidget);
      await _tap(tester, 'Bộ tiếp');
      expect(find.text('Bộ 2 / 2'), findsOneWidget);
      await _tap(tester, 'shuǐ');
      await _tap(tester, 'Kiểm tra');
      await _tap(tester, 'Câu tiếp');
      await _tap(tester, 'thuỷ — nước');
      await _tap(tester, 'Kiểm tra');
      await _tap(tester, 'Câu tiếp'); // bộ cuối → thẳng tổng kết
      expect(find.text('Ôn xong 2 bộ'), findsOneWidget);
      expect(graded, [('thuy', 1), ('moc', 2)]);
      await _tap(tester, 'Xong');
      expect(find.text('mở'), findsOneWidget);
    });
  }

  testWidgets('R-ON-5: × thoát ngay, không hỏi lại; bộ chưa xong không bị chấm', (tester) async {
    final graded = await _open(tester, const Size(390, 844), [_item('thuy', '氵')]);
    await _tap(tester, 'shuǐ');
    await _tap(tester, 'Kiểm tra');
    await tester.tap(find.bySemanticsLabel('Thoát lượt ôn'));
    await tester.pumpAndSettle();
    expect(find.text('mở'), findsOneWidget);
    expect(graded, isEmpty);
  });
}
