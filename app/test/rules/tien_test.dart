import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/progress_store.dart';
import 'package:hoc_xa_3d/journey/journey.dart';
import 'package:hoc_xa_3d/journey/wallet.dart';
import 'package:hoc_xa_3d/scene/scene_event.dart';
import 'package:hoc_xa_3d/scene/shop_event.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  group('ví (R-TIEN-1)', () {
    test('R-TIEN-1: số ngăn nghìn bằng dấu cách', () {
      expect(formatCoins(0), '0');
      expect(formatCoins(160), '160');
      expect(formatCoins(1280), '1 280');
      expect(formatCoins(99999), '99 999');
      expect(formatCoins(1234567), '1 234 567');
    });

    test('R-TIEN-1: mới cài app → 0; có 120 → tắt app mở lại vẫn 120', () async {
      final store = await ProgressStore.open();
      expect(store.coins, 0);
      await store.learnRadical('truc', char: '竹');
      final reopened = await ProgressStore.open(); // cùng kho trên máy
      expect(reopened.coins, store.coins);
      expect(reopened.coins, 10);
    });

    test('R-TIEN-1: đã học 12 bộ ở bản cũ → lên bản mới ví 0, không truy thưởng', () async {
      SharedPreferences.setMockInitialValues({'hanh-trinh.bo-thu': [for (var i = 0; i < 12; i++) 'bo-$i']});
      final store = await ProgressStore.open();
      expect(store.coins, 0);
      expect(store.takeRewards(), isEmpty);
    });

    test('R-TIEN-1: số dư lưu hỏng / âm → 0, không bao giờ âm', () async {
      SharedPreferences.setMockInitialValues({'tien.so-du': -40});
      expect((await ProgressStore.open()).coins, 0);
    });
  });

  group('thưởng học (R-TIEN-2)', () {
    test('R-TIEN-2: bảng thưởng — học +10; ôn 2/2 +5, 1/2 +2, 0/2 không có', () {
      expect(learnReward('竹'), const Reward(RewardKind.learn, 10, char: '竹'));
      expect(reviewReward(2, '木'), const Reward(RewardKind.review, 5, char: '木'));
      expect(reviewReward(1, '木'), const Reward(RewardKind.reviewHalf, 2, char: '木'));
      expect(reviewReward(0, '木'), isNull);
    });

    test('R-TIEN-2: xong nhiệm vụ ngày +20; chuỗi đạt 7, 14, 21… thêm +50', () {
      expect(dailyRewards(1), [const Reward(RewardKind.daily, 20)]);
      expect(dailyRewards(6), [const Reward(RewardKind.daily, 20)]);
      expect(dailyRewards(7), [const Reward(RewardKind.daily, 20), const Reward(RewardKind.streak, 50, days: 7)]);
      expect(dailyRewards(14).last, const Reward(RewardKind.streak, 50, days: 14));
      expect(dailyRewards(15), hasLength(1));
    });

    test('R-TIEN-2: học 竹 → +10; mở lại 竹 → 0', () async {
      final store = await ProgressStore.open();
      expect(await store.learnRadical('truc', char: '竹'), isTrue);
      expect(store.takeRewards(), [const Reward(RewardKind.learn, 10, char: '竹')]);
      expect(await store.learnRadical('truc', char: '竹'), isFalse);
      expect(store.takeRewards(), isEmpty);
      expect(store.coins, 10);
    });

    test('R-TIEN-2: ôn 木 đúng 1/2 → +2; ôn bộ chưa đến hạn → không thưởng', () async {
      var now = DateTime(2026, 11, 13, 9);
      final store = await ProgressStore.open(clock: () => now);
      await store.learnRadical('moc', char: '木');
      store.takeRewards();
      expect(await store.reviewRadical('moc', 2, char: '木'), isFalse); // hạn ngày mai
      expect(store.takeRewards(), isEmpty);
      now = DateTime(2026, 11, 14, 9);
      expect(await store.reviewRadical('moc', 1, char: '木'), isTrue);
      expect(store.takeRewards(), contains(const Reward(RewardKind.reviewHalf, 2, char: '木')));
      expect(store.coins, 10 + 2 + 0); // nhiệm vụ ngày 14 chưa xong (Lĩnh hội 0/3)
    });

    test('R-TIEN-2: ngày thứ 7 liên tiếp xong 2 việc → +20 rồi +50; một lần mỗi ngày', () async {
      // 6 ngày trước đã xong (chuỗi 6), hôm nay học 3 bộ mới → xong ngày thứ 7
      final today = DateTime(2026, 11, 13, 9);
      final store0 = await ProgressStore.open(clock: () => today);
      final t = store0.today;
      SharedPreferences.setMockInitialValues({
        'nhiem-vu.ngay-xong': [for (var d = t - 6; d < t; d++) '$d'],
      });
      final store = await ProgressStore.open(clock: () => today);
      for (final id in ['a', 'b', 'c']) {
        await store.learnRadical(id, char: id);
      }
      final rewards = store.takeRewards();
      expect(rewards.map((r) => r.amount), [10, 10, 10, 20, 50]);
      expect(rewards.last, const Reward(RewardKind.streak, 50, days: 7));
      expect(store.coins, 100);
      await store.checkDaily();
      await store.learnRadical('d', char: 'd');
      expect(store.takeRewards().map((r) => r.amount), [10]); // +20 / +50 không lặp trong ngày
    });
  });

  group('thưởng trò chơi (R-TIEN-3)', () {
    test('R-TIEN-3: Đấu chữ thắng / hoà / thua +8 / +5 / +3; Ngũ Tử Kỳ mọi kết quả +3; lạ → 0', () {
      expect(gameBase('dau-chu', 'thang'), 8);
      expect(gameBase('dau-chu', 'hoa'), 5);
      expect(gameBase('dau-chu', 'thua'), 3);
      for (final o in ['thang', 'hoa', 'thua']) {
        expect(gameBase('co', o), 3);
      }
      expect(gameBase('dau-chu', 'roi-ban'), 0);
      expect(gameBase('xuc-xac', 'thang'), 0);
    });

    test('R-TIEN-3: trần 60 / ngày — 57 → thắng Đấu chữ +3; ván sau 0 + đủ thưởng', () {
      expect(gameEarn('dau-chu', 'thang', 0), (amount: 8, capped: false));
      expect(gameEarn('dau-chu', 'thang', 57), (amount: 3, capped: true));
      expect(gameEarn('co', 'thua', 60), (amount: 0, capped: true));
      expect(gameEarn('dau-chu', 'roi-ban', 10), (amount: 0, capped: false));
    });

    test('R-TIEN-3: kho — ghi ngay, trần theo ngày, sáng mai lại được', () async {
      var now = DateTime(2026, 11, 13, 21);
      SharedPreferences.setMockInitialValues({});
      final probe = await ProgressStore.open(clock: () => now);
      SharedPreferences.setMockInitialValues({
        'tien.tro-ngay': '{"day": ${probe.today}, "total": 57}',
      });
      final store = await ProgressStore.open(clock: () => now);
      expect(store.gameCoinsToday, 57);
      final r1 = await store.earnGame('dau-chu', 'thang');
      expect(r1, (amount: 3, balance: 3, gameToday: 60, capped: true));
      final r2 = await store.earnGame('co', 'thua');
      expect(r2, (amount: 0, balance: 3, gameToday: 60, capped: true));
      now = DateTime(2026, 11, 14, 8);
      expect(store.gameCoinsToday, 0);
      final r3 = await store.earnGame('dau-chu', 'hoa');
      expect(r3, (amount: 5, balance: 8, gameToday: 5, capped: false));
      expect((await ProgressStore.open(clock: () => now)).coins, 8);
    });
  });

  group('Tạp hoá — mua (R-TIEN-4)', () {
    test('R-TIEN-4: có 200, mua Mai 60 → còn 140, Mai 1 cái; mua lần nữa → còn 80, Mai 2 cái', () {
      final r = buyDecor(balance: 200, owned: starterCounts, item: 'mai', price: 60);
      expect(r, isA<Bought>());
      r as Bought;
      expect(r.balance, 140);
      expect(r.owned, {'truc-canh': 1, 'den-long': 1, 'tranh-chu': 1, 'mai': 1});
      final r2 = buyDecor(balance: r.balance, owned: r.owned, item: 'mai', price: 60) as Bought;
      expect(r2.balance, 80);
      expect(r2.owned['mai'], 2);
    });

    test('R-TIEN-4: có 40, Tùng 80 → còn thiếu 40, không mua; vật đã có vẫn mua thêm được', () {
      expect(buyDecor(balance: 40, owned: starterCounts, item: 'tung', price: 80), const BuyRefused(BuyError.short, short: 40));
      final again = buyDecor(balance: 999, owned: starterCounts, item: 'truc-canh', price: 30) as Bought;
      expect(again.owned['truc-canh'], 2);
      expect(buyDecor(balance: 999, owned: starterCounts, item: '', price: 30), const BuyRefused(BuyError.invalid));
      expect(buyDecor(balance: 999, owned: starterCounts, item: 'mai', price: 0), const BuyRefused(BuyError.invalid));
    });

    test('R-TIEN-4: kho — mua trừ đúng giá, số cái giữ qua mở lại; thiếu tiền không trừ', () async {
      SharedPreferences.setMockInitialValues({'tien.so-du': 100});
      final store = await ProgressStore.open();
      expect(await store.buyDecor('tung', 80), isA<Bought>());
      expect(store.coins, 20);
      expect(await store.buyDecor('mai', 60), const BuyRefused(BuyError.short, short: 40));
      expect(store.coins, 20);
      final reopened = await ProgressStore.open();
      expect(reopened.coins, 20);
      expect(reopened.ownedDecor, {'truc-canh': 1, 'den-long': 1, 'tranh-chu': 1, 'tung': 1});
    });
  });

  group('hiệu ứng nhận tiền (R-TIEN-5)', () {
    test('R-TIEN-5: 1 xu / 5 Văn tiền, làm tròn lên, tối đa 5', () {
      expect(coinsToFly(0), 0);
      expect(coinsToFly(2), 1);
      expect(coinsToFly(5), 1);
      expect(coinsToFly(8), 2);
      expect(coinsToFly(10), 2);
      expect(coinsToFly(20), 4);
      expect(coinsToFly(50), 5);
    });

    test('R-TIEN-5: nhãn lý do', () {
      expect(rewardLabel(const Reward(RewardKind.learn, 10, char: '竹')), '+10 · Học bộ 竹');
      expect(rewardLabel(const Reward(RewardKind.review, 5, char: '木')), '+5 · Ôn đúng 木');
      expect(rewardLabel(const Reward(RewardKind.reviewHalf, 2, char: '木')), '+2 · Ôn 木');
      expect(rewardLabel(const Reward(RewardKind.daily, 20)), '+20 · Xong nhiệm vụ ngày');
      expect(rewardLabel(const Reward(RewardKind.streak, 50, days: 7)), '+50 · Chuỗi 7 ngày');
      expect(rewardLabel(gameReward('dau-chu', 'thang', 8)), '+8 · Thắng Đấu chữ');
      expect(rewardLabel(gameReward('co', 'thua', 3)), '+3 · Thua Cờ caro');
      expect(rewardLabel(gameReward('dau-chu', 'hoa', 5)), '+5 · Hoà Đấu chữ');
      expect(rewardLabel(gameReward('co', 'thang', 0)), 'Hôm nay trò chơi đã đủ thưởng');
    });
  });

  group('cho Tiểu Khất (R-TIEN-8)', () {
    DateTime vn(int d, int h, [int mi = 0]) => DateTime.utc(2026, 11, d, h - 7, mi);
    final day14 = vnDay(vn(14, 10));

    test('R-TIEN-8: có 12, 10 giờ ngày 14 → cho → còn 7; 23:59 cùng ngày → không; 0:01 ngày 15 (GMT+7) → cho lại', () {
      final r = giveAlms(12, noAlms, day14)!;
      expect(r.balance, 7);
      expect(r.alms, (lastDay: day14, count: 1));
      expect(giveAlms(7, r.alms, vnDay(vn(14, 23, 59))), isNull);
      expect(almsRefusal(7, r.alms, vnDay(vn(14, 23, 59))), AlmsError.given);
      final r2 = giveAlms(7, r.alms, vnDay(vn(15, 0, 1)))!;
      expect(r2.balance, 2);
      expect(r2.alms, (lastDay: day14 + 1, count: 2));
    });

    test('R-TIEN-8: có 3 → không trừ được, ví vẫn 3', () {
      expect(giveAlms(3, noAlms, day14), isNull);
      expect(almsRefusal(3, noAlms, day14), AlmsError.short);
    });

    test('R-TIEN-8: máy múi giờ London 18 giờ ngày 14 = 1 giờ sáng ngày 15 VN → đã sang ngày mới', () {
      final london = DateTime.utc(2026, 11, 14, 18);
      expect(vnDay(london), vnDay(vn(15, 0, 1)));
      expect(vnDay(london), vnDay(vn(14, 23, 59)) + 1);
      // giờ địa phương của máy không đổi kết quả
      expect(vnDay(london.toLocal()), vnDay(london));
    });

    test('R-TIEN-5: nhãn trừ tiền "−5 · Cho Tiểu Khất"', () {
      expect(almsLabel(), '−5 · Cho Tiểu Khất');
    });
  });

  group('cho Tiểu Khất — lưu + cầu nối (R-TIEN-8)', () {
    test('R-TIEN-8: cho trên app → −5, lưu ngày + số lần qua lần mở lại; cùng ngày không cho lần hai', () async {
      var now = DateTime.utc(2026, 11, 14, 3); // 10 giờ sáng ngày 14 giờ VN
      SharedPreferences.setMockInitialValues({'tien.so-du': 12});
      final store = await ProgressStore.open(clock: () => now);
      final r = await store.giveAlms();
      expect(r.ok, isTrue);
      expect(r.balance, 7);
      final again = await ProgressStore.open(clock: () => now);
      expect(again.coins, 7);
      expect(again.alms.count, 1);
      expect(again.alms.lastDay, vnDay(now));
      now = DateTime.utc(2026, 11, 14, 16, 59); // 23:59 VN
      final same = await again.giveAlms();
      expect((same.ok, same.reason, same.balance), (false, 'given', 7));
      now = DateTime.utc(2026, 11, 14, 17, 1); // 0:01 ngày 15 VN
      expect((await again.giveAlms()).balance, 2);
      expect(again.alms.count, 2);
    });

    test('R-TIEN-8: ví 3 → không trừ, lý do short; lưu hỏng → chưa cho lần nào', () async {
      SharedPreferences.setMockInitialValues({'tien.so-du': 3, 'tien.cho-tieu-khat': '{hỏng'});
      final store = await ProgressStore.open();
      expect(store.alms, noAlms);
      final r = await store.giveAlms();
      expect((r.ok, r.reason, r.balance), (false, 'short', 3));
      expect(giveAlmsReply(r), {'ok': false, 'reason': 'short', 'balance': 3});
      expect(store.coins, 3);
    });

    test('R-TIEN-8: getProgress gửi alms; giveAlms trả {ok, balance, alms}', () {
      final reply = progressReply(const Progress(), coins: 7, alms: (lastDay: 20771, count: 1));
      expect(reply['alms'], {'lastDay': 20771, 'count': 1});
      expect(
        giveAlmsReply((ok: true, reason: null, balance: 7, alms: (lastDay: 20771, count: 1))),
        {'ok': true, 'balance': 7, 'alms': {'lastDay': 20771, 'count': 1}},
      );
      expect(isGiveAlms([{'type': 'giveAlms', 'payload': {}}]), isTrue);
      expect(isGiveAlms([{'type': 'earnGame'}]), isFalse);
    });
  });
}
