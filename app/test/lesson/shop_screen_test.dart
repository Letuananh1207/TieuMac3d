import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/garden.dart';
import 'package:hoc_xa_3d/journey/wallet.dart';
import 'package:hoc_xa_3d/lesson/shop_screen.dart';
import 'package:hoc_xa_3d/scene/garden_event.dart';
import 'package:hoc_xa_3d/scene/shop_event.dart';

/// Danh mục như trang gửi (`DECOR_ITEMS` của web/src/zones/decor.ts).
const _items = [
  ShopItem(id: 'truc-canh', name: 'Trúc cảnh', slot: SlotKind.ngoai, price: 30),
  ShopItem(id: 'mai', name: 'Mai', slot: SlotKind.ngoai, price: 60),
  ShopItem(id: 'tung', name: 'Tùng', slot: SlotKind.ngoai, price: 80),
  ShopItem(id: 'da-thai-ho', name: 'Đá Thái Hồ', slot: SlotKind.ngoai, price: 160),
  ShopItem(id: 'ao-sen', name: 'Ao sen', slot: SlotKind.ngoai, price: 200),
  ShopItem(id: 'den-long', name: 'Đèn lồng', slot: SlotKind.ngoai, price: 30),
  ShopItem(id: 'ban-tra', name: 'Bàn trà', slot: SlotKind.ngoai, price: 100),
  ShopItem(id: 'chau-lan', name: 'Chậu lan', slot: SlotKind.ngoai, price: 50),
  ShopItem(id: 'lu-huong', name: 'Lư hương', slot: SlotKind.ngoai, price: 70),
  ShopItem(id: 'tranh-chu', name: 'Tranh chữ', slot: SlotKind.trong, price: 40),
  ShopItem(id: 'ke-sach', name: 'Kệ sách', slot: SlotKind.trong, price: 120),
  ShopItem(id: 'an-doc', name: 'Án đọc', slot: SlotKind.trong, price: 90),
  ShopItem(id: 'binh-phong', name: 'Bình phong', slot: SlotKind.trong, price: 150),
];

void main() {
  Future<List<String>> open(WidgetTester tester, {required int balance, Map<String, int>? owned, Map<String, int> placed = const {}, Size size = const Size(390, 844)}) async {
    tester.view.physicalSize = size * 3;
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
    final bought = <String>[];
    var bal = balance;
    var own = owned ?? starterCounts;
    await tester.pumpWidget(MaterialApp(
      home: ShopScreen(
        items: _items,
        balance: balance,
        owned: own,
        placed: placed,
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

  testWidgets('R-TIEN-4: có 200, mua Mai 60 → còn 140, "Trong túi: 1"; mua lần nữa → còn 80, "Trong túi: 2"', (tester) async {
    final bought = await open(tester, balance: 200);
    expect(find.text('Tạp hoá'), findsOneWidget);
    expect(wallet(200), findsOneWidget);
    expect(inCard('Trúc cảnh', find.text('Trong túi: 1 · Đang đặt: 0')), findsOneWidget);
    expect(inCard('Mai', find.text('Chưa có')), findsOneWidget);
    expect(find.text('Đã có'), findsNothing);
    await tester.tap(inCard('Mai', find.text('Mua')));
    await tester.pumpAndSettle();
    // hộp xác nhận × 1: đang có / giá / còn lại
    expect(find.textContaining('với 60 Văn tiền?'), findsOneWidget);
    expect(find.textContaining('Mỗi lần mua 1 cái vào túi · đặt ở sân Nhà của ta. Đang có: 0 trong túi, 0 đang đặt.'), findsOneWidget);
    expect(find.text('× 5'), findsNothing);
    expect(find.text('−60'), findsOneWidget);
    await tester.tap(find.text('Mua · 60'));
    await tester.pumpAndSettle();
    expect(bought, ['mai']);
    expect(find.textContaining('Đã mua Mai'), findsOneWidget);
    expect(find.textContaining('Trong túi 1 · về nhà để đặt'), findsOneWidget);
    expect(inCard('Mai', find.text('Trong túi: 1 · Đang đặt: 0')), findsOneWidget);
    await tester.pump(const Duration(seconds: 4)); // tấm "vừa mua" tắt sau 3 s
    await tester.pumpAndSettle();
    expect(find.textContaining('Đã mua Mai'), findsNothing);
    await tester.tap(inCard('Mai', find.text('Mua')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Mua · 60'));
    await tester.pumpAndSettle();
    expect(bought, ['mai', 'mai']);
    expect(inCard('Mai', find.text('Trong túi: 2 · Đang đặt: 0')), findsOneWidget);
    expect(wallet(80), findsOneWidget);
  });

  testWidgets('R-TIEN-4: Mai 2 cái, 1 đang đặt → thẻ "Trong túi: 1 · Đang đặt: 1", vẫn "Mua"', (tester) async {
    await open(tester, balance: 100, owned: {'mai': 2}, placed: {'mai': 1});
    expect(inCard('Mai', find.text('Trong túi: 1 · Đang đặt: 1')), findsOneWidget);
    expect(inCard('Mai', find.text('Mua')), findsOneWidget);
  });

  testWidgets('R-TIEN-4: có 40, Tùng 80 → "Còn thiếu 40", không mua được', (tester) async {
    final bought = await open(tester, balance: 40);
    expect(inCard('Tùng', find.text('Còn thiếu 40')), findsOneWidget);
    await tester.tap(inCard('Tùng', find.text('Còn thiếu 40')));
    await tester.pumpAndSettle();
    expect(find.textContaining('Văn tiền?'), findsNothing);
    expect(bought, isEmpty);
    expect(inCard('Trúc cảnh', find.text('Mua')), findsOneWidget); // 30 ≤ 40: vật đã có vẫn mua thêm được
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

  testWidgets('R-TIEN-4: nghèo → dải gợi ý cách kiếm; không còn "đã mua hết"', (tester) async {
    await open(tester, balance: 10);
    expect(find.textContaining('ôn đúng hạn'), findsOneWidget);
  });

  testWidgets('R-TIEN-4: có đủ cả 13 vật vẫn mua thêm được — không có dải "Đã có đủ"', (tester) async {
    await open(tester, balance: 5000, owned: {for (final i in _items) i.id: 3});
    expect(find.textContaining('Đã có đủ'), findsNothing);
    expect(find.text('Mua'), findsWidgets);
  });

  testWidgets('R-TIEN-4: tab lọc — Trong nhà chỉ có 4 vật trong nhà', (tester) async {
    await open(tester, balance: 100);
    await tester.tap(find.text('Trong nhà'));
    await tester.pumpAndSettle();
    expect(find.text('Mai'), findsNothing);
    expect(find.text('Kệ sách'), findsOneWidget);
  });

  /// Tạp hoá có tab Làm vườn (R-VUON-9, trước "Hạt giống"): mua qua luật `buySeed` của garden.dart.
  Future<List<int>> openSeeds(WidgetTester tester, {required int balance, Map<String, int> bag = const {'ngo': 1}, Size size = const Size(390, 844)}) async {
    tester.view.physicalSize = size * 3;
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
    final counts = <int>[];
    var g = Garden.fresh().copyWith(seeds: bag);
    var bal = balance;
    await tester.pumpWidget(MaterialApp(
      home: ShopScreen(
        items: _items,
        balance: balance,
        owned: starterCounts,
        onBuy: (item) async => const BuyRefused(BuyError.invalid),
        seeds: seedShopItems(),
        bag: bag,
        onBuySeed: (item, count) async {
          final r = buySeed(g, seedCrop(item)!, bal, count: count);
          if (r is! GardenDone) return const BuyRefused(BuyError.invalid);
          g = r.garden;
          bal += r.amount;
          counts.add(count);
          return Bought(bal, starterCounts);
        },
      ),
    ));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Làm vườn')); // tab cuối hàng (hàng tab cuộn ngang)
    await tester.pumpAndSettle();
    await tester.tap(find.text('Làm vườn'));
    await tester.pumpAndSettle();
    return counts;
  }

  testWidgets('R-VUON-9: có 1 280, × 5 Hạt Ngô → "Giá (5 hạt) −40", "Mua · 40" → túi Ngô 6, ví 1 240', (tester) async {
    final counts = await openSeeds(tester, balance: 1280);
    expect(find.textContaining('hạt giống, phân bón cho Vườn rau'), findsOneWidget);
    expect(inCard('Phân bón', find.text('Trong túi: 0')), findsOneWidget); // thẻ Phân bón đứng đầu (2026-11-16.4)
    expect(inCard('Hạt Ngô', find.text('Trong túi: 1')), findsOneWidget);
    expect(inCard('Hạt Củ cải', find.text('Trong túi: 0')), findsOneWidget);
    await tester.tap(inCard('Hạt Ngô', find.text('Mua')));
    await tester.pumpAndSettle();
    expect(find.textContaining('8 Văn tiền / hạt'), findsOneWidget);
    expect(find.text('Mua · 8'), findsOneWidget); // mặc định × 1
    await tester.tap(find.text('× 5'));
    await tester.pumpAndSettle();
    expect(find.text('Giá (5 hạt)'), findsOneWidget);
    expect(find.text('−40'), findsOneWidget);
    await tester.tap(find.text('Mua · 40'));
    await tester.pumpAndSettle();
    expect(counts, [5]);
    expect(inCard('Hạt Ngô', find.text('Trong túi: 6')), findsOneWidget);
    expect(find.bySemanticsLabel(RegExp(r'Văn tiền: 1.240')), findsOneWidget);
  });

  testWidgets('R-VUON-9: có 50, × 10 Hạt Ngô (80) → "Còn thiếu 30", không mua; × 1 vẫn mua được', (tester) async {
    final counts = await openSeeds(tester, balance: 50);
    await tester.tap(inCard('Hạt Ngô', find.text('Mua')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('× 10'));
    await tester.pumpAndSettle();
    expect(find.text('Còn thiếu 30'), findsOneWidget);
    expect(find.text('—'), findsOneWidget);
    await tester.tap(find.text('Còn thiếu 30'));
    await tester.pumpAndSettle();
    expect(counts, isEmpty);
    await tester.tap(find.text('× 1'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Mua · 8'));
    await tester.pumpAndSettle();
    expect(counts, [1]);
  });

  testWidgets('R-VUON-9: ngang 844×390 — hộp xác nhận hạt không tràn', (tester) async {
    await openSeeds(tester, balance: 300, size: const Size(844, 390));
    await tester.tap(inCard('Hạt Ngô', find.text('Mua')));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    expect(find.text('× 5'), findsOneWidget);
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
