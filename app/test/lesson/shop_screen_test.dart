import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/wallet.dart';
import 'package:hoc_xa_3d/lesson/shop_screen.dart';
import 'package:hoc_xa_3d/scene/shop_event.dart';

/// Danh mục như trang gửi (`DECOR_ITEMS` của web/src/zones/decor.ts).
const _items = [
  ShopItem(id: 'truc-canh', name: 'Trúc cảnh', slot: SlotKind.vuon, price: 30),
  ShopItem(id: 'mai', name: 'Mai', slot: SlotKind.vuon, price: 60),
  ShopItem(id: 'tung', name: 'Tùng', slot: SlotKind.vuon, price: 80),
  ShopItem(id: 'da-thai-ho', name: 'Đá Thái Hồ', slot: SlotKind.vuon, price: 160),
  ShopItem(id: 'ao-sen', name: 'Ao sen', slot: SlotKind.vuon, price: 200),
  ShopItem(id: 'den-long', name: 'Đèn lồng', slot: SlotKind.san, price: 30),
  ShopItem(id: 'ban-tra', name: 'Bàn trà', slot: SlotKind.san, price: 100),
  ShopItem(id: 'chau-lan', name: 'Chậu lan', slot: SlotKind.san, price: 50),
  ShopItem(id: 'lu-huong', name: 'Lư hương', slot: SlotKind.san, price: 70),
  ShopItem(id: 'tranh-chu', name: 'Tranh chữ', slot: SlotKind.trong, price: 40),
  ShopItem(id: 'ke-sach', name: 'Kệ sách', slot: SlotKind.trong, price: 120),
  ShopItem(id: 'an-doc', name: 'Án đọc', slot: SlotKind.trong, price: 90),
  ShopItem(id: 'binh-phong', name: 'Bình phong', slot: SlotKind.trong, price: 150),
];

void main() {
  Future<List<String>> open(WidgetTester tester, {required int balance, List<String> owned = starterDecor, Size size = const Size(390, 844)}) async {
    tester.view.physicalSize = size * 3;
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
    final bought = <String>[];
    var bal = balance;
    var own = [...owned];
    await tester.pumpWidget(MaterialApp(
      home: ShopScreen(
        items: _items,
        balance: balance,
        owned: owned,
        onBuy: (item) async {
          final r = buyDecor(balance: bal, owned: own, item: item.id, price: item.price);
          if (r is Bought) {
            bal = r.balance;
            own = r.owned;
            bought.add(item.id);
          }
          return r;
        },
      ),
    ));
    await tester.pumpAndSettle();
    return bought;
  }

  Finder wallet(int n) => find.bySemanticsLabel('Văn tiền: $n');

  /// nút trong thẻ của vật [name]
  Finder inCard(String name, Finder f) => find.descendant(of: find.ancestor(of: find.text(name), matching: find.byType(Column)).first, matching: f);

  testWidgets('R-TIEN-4: có 100, mua Mai 60 → xác nhận → còn 40, Mai "Đã có", báo "Đã mua Mai"', (tester) async {
    final bought = await open(tester, balance: 100);
    expect(find.text('Tạp hoá'), findsOneWidget);
    expect(wallet(100), findsOneWidget);
    expect(inCard('Trúc cảnh', find.text('Đã có')), findsOneWidget);
    await tester.tap(inCard('Mai', find.text('Mua')));
    await tester.pumpAndSettle();
    // hộp xác nhận: đang có / giá / còn lại
    expect(find.textContaining('với 60 Văn tiền?'), findsOneWidget);
    expect(find.text('−60'), findsOneWidget);
    expect(find.text('40'), findsWidgets);
    await tester.tap(find.text('Mua · 60'));
    await tester.pumpAndSettle();
    expect(bought, ['mai']);
    expect(find.textContaining('Đã mua Mai'), findsOneWidget);
    expect(inCard('Mai', find.text('Đã có')), findsOneWidget);
    await tester.pump(const Duration(seconds: 4)); // tấm "vừa mua" tắt sau 3 s
    await tester.pumpAndSettle();
    expect(find.textContaining('Đã mua Mai'), findsNothing);
    expect(wallet(40), findsOneWidget);
  });

  testWidgets('R-TIEN-4: có 40, Tùng 80 → "Còn thiếu 40", không mua được', (tester) async {
    final bought = await open(tester, balance: 40);
    expect(inCard('Tùng', find.text('Còn thiếu 40')), findsOneWidget);
    await tester.tap(inCard('Tùng', find.text('Còn thiếu 40')));
    await tester.pumpAndSettle();
    expect(find.textContaining('Văn tiền?'), findsNothing);
    expect(bought, isEmpty);
    expect(find.text('Mua'), findsNothing); // 40 không đủ vật nào còn thiếu (rẻ nhất Chậu lan 50)
  });

  testWidgets('R-TIEN-4: "Thôi" đóng hộp xác nhận, không trừ tiền', (tester) async {
    final bought = await open(tester, balance: 100);
    await tester.tap(inCard('Mai', find.text('Mua')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Thôi'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Văn tiền?'), findsNothing);
    expect(bought, isEmpty);
    expect(wallet(100), findsOneWidget);
  });

  testWidgets('R-TIEN-4: nghèo → dải gợi ý cách kiếm', (tester) async {
    await open(tester, balance: 10);
    expect(find.textContaining('ôn đúng hạn'), findsOneWidget);
    expect(find.textContaining('Đã có đủ'), findsNothing);
  });

  testWidgets('R-TIEN-4: đã có đủ 13 món → dải "Đã có đủ 13 món", không còn nút Mua', (tester) async {
    await open(tester, balance: 500, owned: [for (final i in _items) i.id]);
    expect(find.textContaining('ôn đúng hạn'), findsNothing);
    expect(find.textContaining('Đã có đủ 13 món'), findsOneWidget);
    expect(find.text('Mua'), findsNothing);
  });

  testWidgets('R-TIEN-4: tab lọc — Trong nhà chỉ có 4 vật trong nhà', (tester) async {
    await open(tester, balance: 100);
    await tester.tap(find.text('Trong nhà'));
    await tester.pumpAndSettle();
    expect(find.text('Mai'), findsNothing);
    expect(find.text('Kệ sách'), findsOneWidget);
  });

  testWidgets('R-TIEN-4: ngang 844×390 — lưới 5 cột, nút Đóng cùng hàng tab, không tràn', (tester) async {
    await open(tester, balance: 160, size: const Size(844, 390));
    expect(tester.takeException(), isNull);
    final a = tester.getTopLeft(find.text('Trúc cảnh'));
    final b = tester.getTopLeft(find.text('Ao sen'));
    expect(b.dy, closeTo(a.dy, 1)); // 5 vật vườn một hàng
    expect(find.text('Đóng'), findsOneWidget);
  });
}
