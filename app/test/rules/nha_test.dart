import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/progress_store.dart';
import 'package:hoc_xa_3d/journey/wallet.dart';
import 'package:hoc_xa_3d/scene/scene_event.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('R-NHA-3: mới cài app → nhà trống', () async {
    final store = await ProgressStore.open();
    expect(store.homePlaced, isEmpty);
    expect(homeReply(store.homePlaced), {'placed': <String, String>{}});
  });

  test('R-NHA-3: Mai ở ô vườn 1, Đèn lồng ở ô sân 2 → tắt app mở lại vẫn còn', () async {
    final store = await ProgressStore.open();
    expect(await store.placeDecor('vuon-1', 'mai'), isTrue);
    expect(await store.placeDecor('san-2', 'den-long'), isTrue);
    final reopened = await ProgressStore.open(); // cùng kho trên máy
    expect(homeReply(reopened.homePlaced), {
      'placed': {'vuon-1': 'mai', 'san-2': 'den-long'},
    });
  });

  test('R-NHA-2: thay vật trong ô, gỡ → ô trống; mã ô rỗng → không ghi', () async {
    final store = await ProgressStore.open();
    await store.placeDecor('vuon-1', 'mai');
    await store.placeDecor('vuon-1', 'tung');
    expect(store.homePlaced, {'vuon-1': 'tung'});
    expect(await store.placeDecor('vuon-1', null), isTrue);
    expect(store.homePlaced, isEmpty);
    expect(await store.placeDecor('', 'mai'), isFalse);
    expect(store.homePlaced, isEmpty);
  });

  test('R-NHA-3: dữ liệu lưu hỏng → nhà trống, không văng', () async {
    SharedPreferences.setMockInitialValues({'nha.dat': '{hỏng'});
    expect((await ProgressStore.open()).homePlaced, isEmpty);
    SharedPreferences.setMockInitialValues({'nha.dat': '{"vuon-1": 3, "san-2": "den-long"}'});
    expect((await ProgressStore.open()).homePlaced, {'san-2': 'den-long'});
  });

  test('R-NHA-4: mới cài app → sở hữu sẵn Trúc cảnh, Đèn lồng, Tranh chữ; trả kèm getHome', () async {
    final store = await ProgressStore.open();
    expect(store.ownedDecor, ['truc-canh', 'den-long', 'tranh-chu']);
    expect(homeReply(store.homePlaced, owned: store.ownedDecor), {
      'placed': <String, String>{},
      'owned': ['truc-canh', 'den-long', 'tranh-chu'],
    });
  });

  test('R-NHA-4: bản cũ đang đặt Tùng ở ô vườn 1 → lên bản mới sở hữu 3 vật khởi đầu + Tùng', () async {
    SharedPreferences.setMockInitialValues({'nha.dat': '{"vuon-1": "tung", "vuon-2": "truc-canh", "san-1": "tung"}'});
    final store = await ProgressStore.open();
    expect(store.ownedDecor, ['truc-canh', 'den-long', 'tranh-chu', 'tung']);
    expect(migrateOwned(['mai', 'mai', 'den-long']), [...starterDecor, 'mai']);
  });

  test('R-NHA-4: gỡ vật khỏi ô không mất sở hữu; sở hữu giữ qua mở lại', () async {
    SharedPreferences.setMockInitialValues({'tien.so-du': 60});
    final store = await ProgressStore.open();
    expect(await store.buyDecor('mai', 60), isA<Bought>());
    await store.placeDecor('vuon-1', 'mai');
    await store.placeDecor('vuon-1', null);
    final reopened = await ProgressStore.open();
    expect(reopened.ownedDecor, contains('mai'));
    expect(reopened.homePlaced, isEmpty);
  });
}
