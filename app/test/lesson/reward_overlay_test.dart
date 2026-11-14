import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/wallet.dart';
import 'package:hoc_xa_3d/lesson/coin.dart';
import 'package:hoc_xa_3d/lesson/reward_overlay.dart';
import 'package:hoc_xa_3d/lesson/wallet_chip.dart';

void main() {
  Widget host(Widget child, {bool reduce = false}) => MaterialApp(
        home: MediaQuery(
          data: MediaQueryData(size: const Size(390, 844), disableAnimations: reduce),
          child: Scaffold(body: child),
        ),
      );

  final flying = find.byWidgetPredicate((w) => w.key is ValueKey<String> && (w.key! as ValueKey<String>).value.startsWith('xu-bay'));

  testWidgets('R-TIEN-1: ví — số ngăn nghìn, trợ năng "Văn tiền: n", vừa trừ hiện "−n"', (tester) async {
    await tester.pumpWidget(host(const Center(child: WalletChip(balance: 1140, delta: -160))));
    await tester.pumpAndSettle();
    expect(find.text('1 140'), findsOneWidget);
    expect(find.text('−160'), findsOneWidget);
    expect(find.bySemanticsLabel('Văn tiền: 1 140'), findsOneWidget);
    await tester.pumpWidget(host(const Center(child: WalletChip(balance: 0))));
    await tester.pumpAndSettle();
    expect(find.text('0'), findsOneWidget);
  });

  testWidgets('R-TIEN-5: +10 rồi +20 — 2 xu bay rồi nhãn, 4 xu rồi nhãn; ví đếm tới số dư; xong tự gỡ', (tester) async {
    var done = false;
    await tester.pumpWidget(host(RewardOverlay(
      rewards: const [Reward(RewardKind.learn, 10, char: '竹'), Reward(RewardKind.daily, 20)],
      balance: 130,
      from: const Offset(195, 700),
      onDone: () => done = true,
    )));
    await tester.pump(); // khung đầu → bắt đầu chạy
    expect(find.text('100'), findsOneWidget); // số dư trước khi cộng
    // chạy từng khung 16 ms tới khi thấy điều cần thấy
    Future<int> until(bool Function() ok) async {
      for (var i = 0; i < 300; i++) {
        if (ok()) return i;
        await tester.pump(const Duration(milliseconds: 16));
      }
      fail('quá 300 khung');
    }

    await until(() => flying.evaluate().length == 2); // khoản 1: +10 → 2 xu
    await until(() => find.text('+10 · Học bộ 竹').evaluate().isNotEmpty);
    expect(flying, findsNothing); // nhãn hiện sau khi xu đã vào ví
    await until(() => flying.evaluate().length == 4); // khoản 2: +20 → 4 xu
    await until(() => find.text('+20 · Xong nhiệm vụ ngày').evaluate().isNotEmpty);
    await tester.pumpAndSettle();
    expect(find.text('130'), findsOneWidget);
    expect(done, isTrue);
  });

  testWidgets('R-TIEN-5: giảm chuyển động → không bay, chỉ đếm số + nhãn', (tester) async {
    await tester.pumpWidget(host(
      const RewardOverlay(rewards: [Reward(RewardKind.streak, 50, days: 7)], balance: 50),
      reduce: true,
    ));
    await tester.pump();
    for (var i = 0; i < 30; i++) {
      await tester.pump(const Duration(milliseconds: 16));
      expect(flying, findsNothing);
    }
    expect(find.text('+50 · Chuỗi 7 ngày'), findsOneWidget);
    expect(find.text('50'), findsOneWidget);
    await tester.pumpAndSettle();
  });

  testWidgets('R-TIEN-3: đủ trần trò chơi → nhãn mờ, không xu', (tester) async {
    await tester.pumpWidget(host(Center(child: RewardLabel(reward: gameReward('dau-chu', 'thang', 0)))));
    expect(find.text('Hôm nay trò chơi đã đủ thưởng'), findsOneWidget);
    expect(find.byType(Coin), findsNothing);
    await tester.pumpWidget(host(Center(child: RewardLabel(reward: gameReward('dau-chu', 'thang', 8)))));
    expect(find.text('+8 · Thắng Đấu chữ'), findsOneWidget);
    expect(find.byType(Coin), findsOneWidget);
  });

  testWidgets('đồng xu: vẽ được cả cỡ nhỏ (không khắc) lẫn lớn (khắc chữ)', (tester) async {
    await tester.pumpWidget(host(const Row(children: [Coin(size: 26), Coin(size: 96), Coin(size: 96, char: '竹')])));
    expect(find.byType(Coin), findsNWidgets(3));
    expect(tester.takeException(), isNull);
  });
}
