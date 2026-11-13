import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/journey.dart';
import 'package:hoc_xa_3d/journey/progress_store.dart';
import 'package:hoc_xa_3d/scene/scene_event.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('R-SACH-1: chưa mượn → mượn HSK 1; đang mượn thì không mượn thêm cuốn khác', () async {
    final store = await ProgressStore.open();
    expect(store.borrowedBook, isNull);
    expect(await store.borrowBook('hsk1'), isTrue);
    expect(store.borrowedBook, 'hsk1');
    expect(await store.borrowBook('hsk2'), isFalse);
    expect(store.borrowedBook, 'hsk1');
  });

  test('R-SACH-2: sách đang mượn giữ qua tắt app mở lại, trang báo trong getProgress', () async {
    await (await ProgressStore.open()).borrowBook('hsk1');
    final reopened = await ProgressStore.open(); // cùng kho trên máy
    expect(reopened.borrowedBook, 'hsk1');
    expect(progressReply(const Progress(), book: reopened.borrowedBook)['book'], 'hsk1');
  });

  test('R-SACH-4: trả sách → hết đang mượn, mượn được cuốn khác; không mượn mà trả → false', () async {
    final store = await ProgressStore.open();
    expect(await store.returnBook(), isFalse);
    await store.borrowBook('hsk1');
    expect(await store.returnBook(), isTrue);
    expect(store.borrowedBook, isNull);
    expect(progressReply(const Progress(), book: store.borrowedBook)['book'], isNull);
    expect(await store.borrowBook('hsk2'), isTrue);
  });

  test('R-SACH-3: nhớ trang theo cuốn, cả khi trả rồi mượn lại; trang kẹp trong sổ', () async {
    final store = await ProgressStore.open();
    await store.borrowBook('hsk1');
    expect(store.bookPage('hsk1'), 0); // lần đầu → trang 1
    await store.setBookPage('hsk1', 11, 152); // trang 12
    await store.returnBook();
    await store.borrowBook('hsk1');
    expect((await ProgressStore.open()).bookPage('hsk1'), 11);
    expect(store.bookPage('hsk2'), 0);
    await store.setBookPage('hsk1', 500, 152);
    expect(store.bookPage('hsk1'), 151); // trang cuối 152/152
  });

  test('R-SACH-1: đọc sự kiện borrowBook; sai dạng → null', () {
    expect(borrowBookId([
      {'type': 'borrowBook', 'payload': {'id': 'hsk1'}},
    ]), 'hsk1');
    expect(borrowBookId([
      {'type': 'borrowBook', 'payload': {'id': ''}},
    ]), isNull);
    expect(borrowBookId([
      {'type': 'returnBook', 'payload': {}},
    ]), isNull);
    expect(borrowBookId(const []), isNull);
  });
}
