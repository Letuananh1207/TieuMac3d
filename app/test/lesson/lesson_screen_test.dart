import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/lesson/lesson_screen.dart';
import 'package:hoc_xa_3d/scene/scene_event.dart';

const _kuai = Lesson(
  han: '快',
  pinyin: 'kuài',
  meaning: 'nhanh; vui vẻ',
  info: [('Bộ', '忄 tâm đứng'), ('Nét', '7'), ('Từ', '快乐 kuàilè · vui vẻ'), ('HSK', '2')],
);

Future<void> _open(WidgetTester tester, Size size) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(MaterialApp(
    home: Builder(
      builder: (context) => Scaffold(
        body: TextButton(
          onPressed: () => Navigator.of(context).push(LessonScreen.route(_kuai)),
          child: const Text('mở'),
        ),
      ),
    ),
  ));
  await tester.tap(find.text('mở'));
  await tester.pumpAndSettle();
}

void main() {
  for (final (name, size) in [('dọc 390×844', const Size(390, 844)), ('ngang 844×390', const Size(844, 390))]) {
    testWidgets('màn bài học $name: đủ chữ, pinyin, nghĩa, dòng phụ, không tràn', (tester) async {
      await _open(tester, size);
      expect(find.text('快'), findsOneWidget);
      expect(find.text('kuài'), findsOneWidget);
      expect(find.text('nhanh; vui vẻ'), findsOneWidget);
      for (final label in ['Bộ', 'Nét', 'Từ', 'HSK']) {
        expect(find.text(label), findsOneWidget);
      }
      expect(find.text('快乐 kuàilè · vui vẻ'), findsOneWidget);
      expect(tester.takeException(), isNull); // tràn bố cục báo lỗi ở đây
      expect(tester.getSize(find.widgetWithText(FilledButton, 'Ra sân')).height, greaterThanOrEqualTo(44));
    });
  }

  testWidgets('R-VUNG-3: bấm "Ra sân" → đóng màn bài học, về cảnh', (tester) async {
    await _open(tester, const Size(390, 844));
    await tester.tap(find.text('Ra sân'));
    await tester.pumpAndSettle();
    expect(find.byType(LessonScreen), findsNothing);
    expect(find.text('mở'), findsOneWidget);
  });
}
