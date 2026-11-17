import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/daily.dart';
import 'package:hoc_xa_3d/journey/review.dart';
import 'package:hoc_xa_3d/lesson/daily_screen.dart';
import 'package:hoc_xa_3d/scene/review_event.dart';
import 'package:hoc_xa_3d/scene/word_event.dart';

// Thứ Sáu 13/11/2026
final _now = DateTime(2026, 11, 13, 9);
final _today = dayOf(_now);

ReviewItem _item(String id) => ReviewItem(
      word: Word(id: id, han: id, pinyin: id, meaning: id),
      questions: const [ReviewQuestion(kind: 'chu-nghia', options: ['a', 'b', 'c', 'd'], answer: 0)],
    );

Future<List<List<ReviewItem>>> _open(WidgetTester tester, Size size, DailyView view, {OpenDailyRequest? request}) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  final reviews = <List<ReviewItem>>[];
  final req = request ?? const OpenDailyRequest();
  await tester.pumpWidget(MaterialApp(
    home: Builder(
      builder: (context) => Scaffold(
        body: TextButton(
          onPressed: () => Navigator.of(context).push(DailyScreen.route(req, () => view, (items) async => reviews.add(items))),
          child: const Text('mở'),
        ),
      ),
    ),
  ));
  await tester.tap(find.text('mở'));
  await tester.pumpAndSettle();
  return reviews;
}

void main() {
  final dueView = DailyView(
    status: const DailyStatus(newToday: 0, dueLeft: 2, allLearned: false),
    streak: (current: 5, best: 7),
    doneDays: {for (var d = _today - 5; d < _today; d++) d},
    today: _today,
    now: _now,
    dueIds: const ['你', '谢谢'],
    learnedTotal: 8,
  );
  final request = OpenDailyRequest(review: [_item('你'), _item('谢谢')]);

  for (final size in const [Size(390, 844), Size(844, 390)]) {
    final tag = size.width > size.height ? 'ngang' : 'dọc';
    testWidgets('R-NV-3 ($tag): 2 việc + chuỗi; có từ đến hạn → "Ôn ngay" mở lượt ôn đúng thứ tự', (tester) async {
      final reviews = await _open(tester, size, dueView, request: request);
      expect(find.text('0/1'), findsOneWidget);
      expect(find.text('còn 2'), findsOneWidget);
      expect(find.text('5'), findsOneWidget);
      expect(find.bySemanticsLabel('Hôm nay đã xong'), findsNothing);
      await tester.tap(find.text('Ôn ngay'));
      await tester.pumpAndSettle();
      expect(reviews.single.map((i) => i.word.id), ['你', '谢谢']);
    });
  }

  testWidgets('R-NV-1/2: xong cả 2 → triện "Xong" (R-HUD-4), kỷ lục mới; không có nút "Ôn ngay"', (tester) async {
    await _open(
      tester,
      const Size(390, 844),
      DailyView(
        status: const DailyStatus(newToday: 1, dueLeft: 0, allLearned: false),
        streak: (current: 23, best: 23),
        doneDays: {for (var d = _today - 22; d <= _today; d++) d},
        today: _today,
        now: _now,
        learnedTotal: 30,
        reviewedToday: true,
      ),
    );
    expect(find.bySemanticsLabel('Hôm nay đã xong'), findsOneWidget);
    expect(find.text('Kỷ lục mới'), findsOneWidget);
    expect(find.text('Xong'), findsOneWidget); // triện chữ Việt
    expect(find.text('Nhiệm vụ hằng ngày'), findsOneWidget); // tiêu đề chữ Việt, không 日課榜
    expect(find.textContaining(RegExp(r'[\u4e00-\u9fff]')), findsNothing);
    expect(find.text('Ôn ngay'), findsNothing);
    expect(find.text('Đã ôn hết từ đến hạn.'), findsOneWidget);
    await tester.tap(find.text('Đóng bảng'));
    await tester.pumpAndSettle();
    expect(find.text('mở'), findsOneWidget);
  });

  testWidgets('mới cài: Lĩnh hội 0/1 dòng "bài đầu tiên", không có từ đến hạn', (tester) async {
    await _open(
      tester,
      const Size(390, 844),
      DailyView(
        status: const DailyStatus(newToday: 0, dueLeft: 0, allLearned: false),
        streak: (current: 0, best: 0),
        doneDays: const {},
        today: _today,
        now: _now,
      ),
    );
    expect(find.text('0/1'), findsOneWidget);
    expect(find.textContaining('bài đầu tiên'), findsOneWidget);
    expect(find.text('Không có từ nào đến hạn.'), findsOneWidget);
    expect(find.text('Xong cả 2 việc hôm nay để bắt đầu chuỗi.'), findsOneWidget);
  });
}
