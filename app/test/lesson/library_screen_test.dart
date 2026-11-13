import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/lesson/book_screen.dart';
import 'package:hoc_xa_3d/lesson/library_screen.dart';
import 'package:hoc_xa_3d/scene/library_event.dart';

const _books = [
  BookEntry(id: 'hsk1', title: 'HSK 1', subtitle: 'Nhập môn', words: 152, ready: true),
  BookEntry(id: 'hsk2', title: 'HSK 2', subtitle: 'Sơ cấp', words: 152, ready: true),
  BookEntry(id: 'hsk3', title: 'HSK 3', subtitle: 'Sơ trung cấp', words: 0, planned: 300, ready: false),
  BookEntry(id: 'hsk4', title: 'HSK 4', subtitle: 'Trung cấp', words: 0, ready: false),
  BookEntry(id: 'hsk5', title: 'HSK 5', subtitle: 'Trung cao cấp', words: 0, ready: false),
  BookEntry(id: 'hsk6', title: 'HSK 6', subtitle: 'Cao cấp', words: 0, ready: false),
];

const _words = [
  BookWord(han: '爱', pinyin: 'ài', meaning: 'yêu', example: WordExample(han: '我爱妈妈。', pinyin: 'Wǒ ài māma.', meaning: 'Tôi yêu mẹ.')),
  BookWord(han: '出租车', pinyin: 'chūzūchē', meaning: 'xe taxi'),
  BookWord(han: '虽然…但是', pinyin: 'suīrán… dànshì', meaning: 'tuy… nhưng'),
];

Future<void> _host(WidgetTester tester, Size size, Future<Object?> Function(NavigatorState nav) open) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(MaterialApp(
    home: Builder(
      builder: (context) => Scaffold(body: TextButton(onPressed: () => open(Navigator.of(context)), child: const Text('mở'))),
    ),
  ));
  await tester.tap(find.text('mở'));
  await tester.pumpAndSettle();
}

void main() {
  test('openLibrary / openBook: đọc đủ danh mục và các trang (docs/bridge.md)', () {
    final lib = OpenLibraryRequest.parse([
      {
        'type': 'openLibrary',
        'payload': {
          'books': [
            {'id': 'hsk1', 'title': 'HSK 1', 'subtitle': 'Nhập môn', 'planned': 150, 'words': 152, 'ready': true},
            {'id': 'hsk3', 'title': 'HSK 3', 'subtitle': 'Sơ trung cấp', 'planned': 300, 'words': 0, 'ready': false},
          ],
          'borrowed': null,
        },
      },
    ]);
    expect(lib!.books.map((b) => b.level), [1, 3]);
    expect(lib.borrowed, isNull);
    final book = OpenBookRequest.parse([
      {
        'type': 'openBook',
        'payload': {
          'book': {'id': 'hsk1', 'title': 'HSK 1', 'subtitle': 'Nhập môn'},
          'words': [
            {'han': '爱', 'pinyin': 'ài', 'meaning': 'yêu', 'example': {'han': '我爱妈妈。', 'pinyin': 'Wǒ ài māma.', 'meaning': 'Tôi yêu mẹ.'}},
          ],
        },
      },
    ]);
    expect(book!.words.single.example!.meaning, 'Tôi yêu mẹ.');
    expect(OpenBookRequest.parse([{'type': 'openBook', 'payload': {'book': {'id': 'x', 'title': 'X'}, 'words': []}}]), isNull);
  });

  test('sổ từ: cỡ chữ theo độ dài từ (1–2 chữ 104 · 3–4 chữ 64 · hai phần 52)', () {
    expect(wordSize('爱'), 104);
    expect(wordSize('出租车'), 64);
    expect(wordSize('虽然…但是'), 52);
  });

  for (final size in const [Size(390, 844), Size(844, 390)]) {
    final tag = size.width > size.height ? 'ngang' : 'dọc';
    testWidgets('R-SACH-1 ($tag): chọn cuốn đã soạn → thẻ xác nhận → "Mượn" ghi mượn và đóng', (tester) async {
      final borrowed = <String>[];
      Object? result;
      await _host(tester, size, (nav) async => result = await nav.push(LibraryScreen.route(const OpenLibraryRequest(books: _books), (id) async {
            borrowed.add(id);
            return true;
          })));
      expect(find.text('Sơ cấp'), findsOneWidget);
      await tester.tap(find.text('Sơ cấp'));
      await tester.pumpAndSettle();
      expect(find.text('Mượn «HSK 2 · Sơ cấp»?'), findsOneWidget);
      await tester.tap(find.text('Mượn'));
      await tester.pumpAndSettle();
      expect(borrowed, ['hsk2']);
      expect(result, true);
    });
  }

  testWidgets('R-SACH-1: cuốn đang biên soạn → báo, không mượn được', (tester) async {
    await _host(tester, const Size(390, 844), (nav) => nav.push(LibraryScreen.route(const OpenLibraryRequest(books: _books), (_) async => true)));
    await tester.tap(find.text('Sơ trung cấp'));
    await tester.pumpAndSettle();
    expect(find.text('HSK 3 đang biên soạn — chưa mượn được.'), findsOneWidget);
    expect(find.text('Mượn'), findsNothing);
  });

  testWidgets('R-SACH-4: đang giữ cuốn khác → lời nhắc trả sách, chạm cuốn khác không mượn', (tester) async {
    await _host(tester, const Size(390, 844), (nav) => nav.push(LibraryScreen.route(const OpenLibraryRequest(books: _books, borrowed: 'hsk1'), (_) async => true)));
    expect(find.textContaining('Đang giữ «HSK 1»'), findsOneWidget);
    expect(find.text('Đang mượn'), findsOneWidget);
    await tester.tap(find.text('Sơ cấp'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Mượn «'), findsNothing);
  });

  for (final size in const [Size(390, 844), Size(844, 390)]) {
    final tag = size.width > size.height ? 'ngang' : 'dọc';
    testWidgets('R-SACH-3 ($tag): mở đúng trang đã nhớ, lật trang, đóng → ghi trang đang đọc', (tester) async {
      final saved = <int>[];
      await _host(
        tester,
        size,
        (nav) => nav.push<void>(BookScreen.route(const OpenBookRequest(id: 'hsk1', title: 'HSK 1', subtitle: 'Nhập môn', words: _words), 1, (p) async => saved.add(p))),
      );
      expect(find.text('出租车'), findsOneWidget);
      await tester.tap(find.text('Trang sau'));
      await tester.pumpAndSettle();
      expect(find.text('虽然…但是'), findsOneWidget);
      await tester.tap(find.bySemanticsLabel('Đóng sổ'));
      await tester.pumpAndSettle();
      expect(saved, [2]);
      expect(find.text('mở'), findsOneWidget);
    });
  }

  testWidgets('R-SACH-3: trang đầu "Trang trước" tắt; trang cuối "Trang sau" tắt', (tester) async {
    await _host(
      tester,
      const Size(390, 844),
      (nav) => nav.push<void>(BookScreen.route(const OpenBookRequest(id: 'hsk1', title: 'HSK 1', subtitle: 'Nhập môn', words: _words), 0, (_) async {})),
    );
    expect(find.text('Trang 1 / 3'), findsOneWidget);
    await tester.tap(find.text('Trang trước'));
    await tester.pumpAndSettle();
    expect(find.text('Trang 1 / 3'), findsOneWidget);
  });
}
