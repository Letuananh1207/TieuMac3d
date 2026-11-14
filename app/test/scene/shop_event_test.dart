import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/scene/shop_event.dart';

void main() {
  // dạng JS gửi (docs/bridge.md `openShop`, web/src/bridge/flutterBridge.ts)
  Map<String, Object?> openShop(List<Object?> items) => {'type': 'openShop', 'payload': {'items': items}};

  test('R-TIEN-4: openShop — đọc vật, loại ô, giá, số chữ Hán', () {
    final r = OpenShopRequest.parse([
      openShop([
        {'id': 'mai', 'name': 'Mai', 'han': '梅', 'slot': 'vuon', 'price': 60, 'priceHan': '六十文'},
        {'id': 'den-long', 'name': 'Đèn lồng', 'han': '燈', 'slot': 'san', 'price': 30, 'priceHan': '三十文'},
      ]),
    ])!;
    expect(r.items.map((i) => i.id), ['mai', 'den-long']);
    expect(r.items.first.slot, SlotKind.vuon);
    expect(r.items.first.slot.label, 'Vườn');
    expect(r.items.first.price, 60);
    expect(r.items.first.priceHan, '六十文');
  });

  test('R-TIEN-4: openShop — vật sai dạng / giá 0 bỏ qua; không còn vật nào → null', () {
    final r = OpenShopRequest.parse([
      openShop([
        {'id': 'mai', 'name': 'Mai', 'han': '梅', 'slot': 'vuon', 'price': 0},
        {'id': 'x', 'name': 'X', 'han': 'X', 'slot': 'mai-nha', 'price': 10},
        {'id': 'tung', 'name': 'Tùng', 'han': '松', 'slot': 'vuon', 'price': 80},
      ]),
    ])!;
    expect(r.items.map((i) => i.id), ['tung']);
    expect(OpenShopRequest.parse([openShop([])]), isNull);
    expect(OpenShopRequest.parse([{'type': 'openLibrary', 'payload': {'items': []}}]), isNull);
    expect(OpenShopRequest.parse([]), isNull);
  });

  test('R-TIEN-3: earnGame — đọc trò + kết quả; trả số vừa cộng, số dư, trò hôm nay, đủ trần', () {
    expect(earnGameArgs([{'type': 'earnGame', 'payload': {'game': 'dau-chu', 'outcome': 'thang'}}]), (game: 'dau-chu', outcome: 'thang'));
    expect(earnGameArgs([{'type': 'earnGame', 'payload': {'game': 3}}]), isNull);
    expect(earnGameArgs([{'type': 'openShop', 'payload': {}}]), isNull);
    expect(earnGameReply((amount: 8, balance: 1288, gameToday: 32, capped: false)), {
      'amount': 8,
      'balance': 1288,
      'gameToday': 32,
      'capped': false,
    });
  });
}
