import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/mang.dart';
import 'package:hoc_xa_3d/journey/progress_store.dart';
import 'package:hoc_xa_3d/journey/wallet.dart';
import 'package:hoc_xa_3d/scene/mang_event.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Giờ VN [h]:[m] ngày 15/11/2026 (GMT+7) dưới dạng UTC.
DateTime vn(int h, [int m = 0, int day = 15]) => DateTime.utc(2026, 11, day, h, m).subtract(const Duration(hours: 7));

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));
  final today = vnDay(vn(10));

  group('hái măng (R-MANG-1, R-MANG-3)', () {
    test('R-MANG-1: hai lứa 5:00 (8) và 15:00 (6); măng số 0 là măng to', () {
      expect(mangWaves, [(at: 5 * 3600, count: 8), (at: 15 * 3600, count: 6)]);
      expect(isBigMang(0), isTrue);
      expect(isBigMang(3), isFalse);
      expect(vnSecond(vn(15)), 15 * 3600);
    });

    test('R-MANG-3: hái được một lần, vào túi; cùng ngày hái lại → từ chối', () {
      final s = MangState.fresh(today);
      final r = pickMang(s, '$today-0-3', vn(10));
      expect(r, isA<MangDone>());
      r as MangDone;
      expect(r.got, 1);
      expect(r.mang.bag, {'mang': 1});
      expect(pickMang(r.mang, '$today-0-3', vn(11)), const MangRefused(MangError.picked));
    });

    test('R-MANG-3: mã ngày khác / lứa chưa tới giờ / số quá lứa / sai dạng → từ chối', () {
      final s = MangState.fresh(today);
      expect(pickMang(s, '${today - 1}-0-1', vn(10)), const MangRefused(MangError.day));
      expect(pickMang(s, '$today-1-1', vn(14, 59)), const MangRefused(MangError.notYet));
      expect(pickMang(s, '$today-0-1', vn(4, 59)), const MangRefused(MangError.notYet));
      expect(pickMang(s, '$today-1-6', vn(16)), const MangRefused(MangError.notYet));
      expect(pickMang(s, 'mang-1', vn(10)), const MangRefused(MangError.bad));
      expect(pickMang(s, '$today-2-0', vn(10)), const MangRefused(MangError.bad));
    });

    test('R-MANG-1: sang ngày → măng đã hái hôm qua không còn, túi giữ nguyên', () {
      const s = MangState(day: 100, picked: ['100-0-1'], bag: {'mang': 4});
      final t = s.on(101);
      expect(t.picked, isEmpty);
      expect(t.bag, {'mang': 4});
      expect(t.day, 101);
    });
  });

  group('măng chữ (R-MANG-4)', () {
    test('R-MANG-4: măng to + đúng câu + đã học → 2 Măng to; sai → 1; chưa học bộ nào → 1', () {
      final s = MangState.fresh(today);
      expect((pickMang(s, '$today-0-0', vn(10), right: true, learnedAny: true) as MangDone).mang.bag, {'mang-to': 2});
      expect((pickMang(s, '$today-0-0', vn(10), learnedAny: true) as MangDone).got, 1);
      expect((pickMang(s, '$today-0-0', vn(10), right: true) as MangDone).got, 1);
      expect((pickMang(s, '$today-0-2', vn(10), right: true, learnedAny: true) as MangDone).got, 1); // măng thường không ×2
    });
  });

  group('bán cho Măng bà bà (R-MANG-5)', () {
    test('R-MANG-5: 5 Măng + 1 Măng to → Bán hết +23, túi trống; bán từng loại; túi trống → empty', () {
      const s = MangState(day: 1, bag: {'mang': 5, 'mang-to': 1});
      final all = sellMang(s, null) as MangDone;
      expect((all.amount, all.got), (23, 6));
      expect(all.mang.bag, isEmpty);
      final one = sellMang(s, 'mang-to') as MangDone;
      expect(one.amount, 8);
      expect(one.mang.bag, {'mang': 5});
      expect(sellMang(all.mang, null), const MangRefused(MangError.empty));
      expect(sellMang(s, 'ngo'), const MangRefused(MangError.bad));
      expect(mangSellLabel(23), '+23 · Bán măng');
    });

    test('R-MANG-5: kho — bán cộng ví ngay, không tính trần trò chơi; tắt app mở lại vẫn giữ', () async {
      final now = vn(16);
      final probe = await ProgressStore.open(clock: () => now);
      SharedPreferences.setMockInitialValues({
        'tien.tro-ngay': '{"day": ${probe.today}, "total": 60}',
        'tu-vung.da-hoc': ['你'], // đã học ≥ 1 từ (R-MANG-4)
      });
      final store = await ProgressStore.open(clock: () => now);
      expect(await store.mangAct('pick', id: '$today-0-0', right: true), isA<MangDone>());
      expect(await store.mangAct('pick', id: '$today-1-1'), isA<MangDone>());
      expect(store.mang.bag, {'mang-to': 2, 'mang': 1});
      final r = await store.mangAct('sell') as MangDone;
      expect(r.amount, 19);
      expect(store.coins, 19);
      expect(store.gameCoinsToday, 60);
      final again = await ProgressStore.open(clock: () => now);
      expect(again.mang.picked, ['$today-0-0', '$today-1-1']);
      expect(again.coins, 19);
    });
  });

  group('cầu nối (getMang / mangAct)', () {
    test('R-MANG-3: đọc mangAct, trả lời đủ trường', () {
      expect(mangActArgs([{'type': 'mangAct', 'payload': {'act': 'pick', 'id': '1-0-0', 'right': true}}]), (act: 'pick', id: '1-0-0', kind: null, right: true));
      expect(mangActArgs([{'type': 'mangAct', 'payload': {'act': 'sell', 'kind': null}}])?.kind, isNull);
      expect(mangActArgs([{'type': 'mangAct', 'payload': {'act': 3}}]), isNull);
      expect(isGetMang([{'type': 'getMang', 'payload': {}}]), isTrue);
      const s = MangState(day: 5, picked: ['5-0-1'], bag: {'mang': 1});
      expect(mangActReply(const MangDone(s, got: 1), 40), {'ok': true, 'mang': s.toJson(), 'balance': 40, 'amount': 0, 'got': 1});
      expect(mangActReply(const MangRefused(MangError.notYet), 40), {'ok': false, 'reason': 'not-yet', 'balance': 40});
      expect(MangState.fromJson({'day': 5, 'picked': ['5-0-1', 3], 'bag': {'mang': 2, 'ngo': 4, 'mang-to': -1}}).toJson(), {
        'day': 5,
        'picked': ['5-0-1'],
        'bag': {'mang': 2},
      });
    });
  });
}
