import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/home.dart';
import 'package:hoc_xa_3d/journey/progress_store.dart';
import 'package:hoc_xa_3d/journey/wallet.dart';
import 'package:hoc_xa_3d/scene/scene_event.dart';
import 'package:shared_preferences/shared_preferences.dart';

Map<String, Object> _mon(String item, double x, double z, {String scene = 'nha-ta', int rot = 0}) =>
    {'item': item, 'scene': scene, 'x': x, 'z': z, 'rot': rot};

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('R-NHA-3: mới cài app → chưa món nào; getHome không gửi ô cũ', () async {
    final store = await ProgressStore.open();
    expect(store.homeItems, isEmpty);
    expect(homeReply(items: store.homeItems, owned: store.ownedDecor, placed: store.homePlaced), {
      'items': <Object>[],
      'owned': {'truc-canh': 1, 'den-long': 1, 'tranh-chu': 1},
    });
  });

  test('R-NHA-3: Mai ở (8; 4) quay 45°, Đèn lồng ở (−11; −3) → tắt app mở lại đúng chỗ, đúng hướng', () async {
    SharedPreferences.setMockInitialValues({'nha.so-luong': '{"mai": 1, "den-long": 1}'});
    final store = await ProgressStore.open();
    expect(await store.setHomeItems([_mon('mai', 8, 4, rot: 45), _mon('den-long', -11, -3)]), isTrue);
    final reopened = await ProgressStore.open(); // cùng kho trên máy
    expect(reopened.homeItems, [
      const PlacedDecor(item: 'mai', scene: 'nha-ta', x: 8, z: 4, rot: 45),
      const PlacedDecor(item: 'den-long', scene: 'nha-ta', x: -11, z: -3, rot: 0),
    ]);
    expect(homeReply(items: reopened.homeItems, owned: reopened.ownedDecor)['items'], [
      {'item': 'mai', 'scene': 'nha-ta', 'x': 8, 'z': 4, 'rot': 45},
      {'item': 'den-long', 'scene': 'nha-ta', 'x': -11, 'z': -3, 'rot': 0},
    ]);
  });

  test('R-NHA-2: mỗi cái đặt một chỗ — 2 Mai đặt được 2 cây, cây thứ 3 không ghi', () async {
    SharedPreferences.setMockInitialValues({'nha.so-luong': '{"mai": 2}'});
    final store = await ProgressStore.open();
    expect(await store.setHomeItems([_mon('mai', 8, 4), _mon('mai', 10, 4)]), isTrue);
    expect(await store.setHomeItems([_mon('mai', 8, 4), _mon('mai', 10, 4), _mon('mai', 12, 4)]), isFalse);
    expect(store.homeItems, hasLength(2));
    // cất một cây → danh sách còn 1 (túi 1 — trang tính)
    expect(await store.setHomeItems([_mon('mai', 8, 4)]), isTrue);
    expect(placedCounts(store.homeItems), {'mai': 1});
  });

  test('R-NHA-3: món sai dạng (góc lẻ, thiếu cảnh, vật chưa có) → không ghi; dữ liệu lưu hỏng → nhà trống', () async {
    final store = await ProgressStore.open();
    expect(await store.setHomeItems([_mon('truc-canh', 1, 1, rot: 30)]), isFalse);
    expect(await store.setHomeItems([{'item': 'truc-canh', 'x': 1, 'z': 1, 'rot': 0}]), isFalse);
    expect(await store.setHomeItems([_mon('tung', 1, 1)]), isFalse);
    expect(await store.setHomeItems('hỏng'), isFalse);
    expect(store.homeItems, isEmpty);
    SharedPreferences.setMockInitialValues({'nha.do': '[{hỏng'});
    expect((await ProgressStore.open()).homeItems, isEmpty);
  });

  test('R-NHA-4: mới cài app → 1 Trúc cảnh, 1 Đèn lồng, 1 Tranh chữ', () async {
    final store = await ProgressStore.open();
    expect(store.ownedDecor, {'truc-canh': 1, 'den-long': 1, 'tranh-chu': 1});
    expect(starterCounts, store.ownedDecor);
  });

  test('R-NHA-4: bản cũ sở hữu Mai, Tùng; Mai ở 3 ô → Mai 3, Tùng 1; ô cũ gửi kèm getHome tới khi trang setHome', () async {
    SharedPreferences.setMockInitialValues({
      'nha.so-huu': ['truc-canh', 'den-long', 'tranh-chu', 'mai', 'tung'],
      'nha.dat': '{"vuon-1": "mai", "vuon-2": "mai", "san-3": "mai", "trong-2": "tranh-chu"}',
    });
    final store = await ProgressStore.open();
    expect(store.ownedDecor, {'truc-canh': 1, 'den-long': 1, 'tranh-chu': 1, 'mai': 3, 'tung': 1});
    final reply = homeReply(items: store.homeItems, owned: store.ownedDecor, placed: store.hasHomeItems ? null : store.homePlaced);
    expect(reply['placed'], {'vuon-1': 'mai', 'vuon-2': 'mai', 'san-3': 'mai', 'trong-2': 'tranh-chu'});
    // trang chuyển ô → món rồi setHome một lần → xoá ô cũ, không chuyển lại
    final moved = [_mon('mai', -6, -13), _mon('mai', -5.5, -7), _mon('mai', -4, 8.5), _mon('tranh-chu', 0, -3.5, scene: 'nha-ta-trong')];
    expect(await store.setHomeItems(moved), isTrue);
    final reopened = await ProgressStore.open();
    expect(reopened.homePlaced, isEmpty);
    expect(reopened.hasHomeItems, isTrue);
    expect(reopened.ownedDecor['mai'], 3);
    expect(homeReply(items: reopened.homeItems, owned: reopened.ownedDecor).containsKey('placed'), isFalse);
  });

  test('R-NHA-4: bản trước Văn tiền (chưa có sở hữu) → 3 vật khởi đầu 1 cái + vật đang đặt theo số ô', () async {
    SharedPreferences.setMockInitialValues({'nha.dat': '{"vuon-1": "tung", "vuon-2": "truc-canh", "san-1": "tung", "vuon-3": "truc-canh"}'});
    final store = await ProgressStore.open();
    expect(store.ownedDecor, {'truc-canh': 2, 'den-long': 1, 'tranh-chu': 1, 'tung': 2});
    expect(migrateOwnedCounts(['mai'], ['mai', 'mai', 'den-long']), {'mai': 2, 'den-long': 1});
    expect(migrateOwnedCounts(null, const []), starterCounts);
  });

  test('R-NHA-4: cất vật về túi không mất cái nào; số cái giữ qua mở lại', () async {
    SharedPreferences.setMockInitialValues({'tien.so-du': 120});
    final store = await ProgressStore.open();
    expect(await store.buyDecor('mai', 60), isA<Bought>());
    expect(await store.buyDecor('mai', 60), isA<Bought>());
    expect(await store.setHomeItems([_mon('mai', 8, 4)]), isTrue);
    expect(await store.setHomeItems(const []), isTrue);
    final reopened = await ProgressStore.open();
    expect(reopened.ownedDecor['mai'], 2);
    expect(reopened.homeItems, isEmpty);
  });
}
