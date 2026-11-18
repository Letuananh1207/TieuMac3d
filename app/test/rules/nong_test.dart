import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/garden.dart';
import 'package:hoc_xa_3d/journey/nong.dart';
import 'package:hoc_xa_3d/journey/progress_store.dart';
import 'package:hoc_xa_3d/journey/wallet.dart';
import 'package:hoc_xa_3d/scene/nong_event.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Giờ VN [h]:[m] ngày [day]/11/2026 (GMT+7) dưới dạng UTC.
DateTime vn(int h, [int m = 0, int day = 18]) => DateTime.utc(2026, 11, day, h, m).subtract(const Duration(hours: 7));

/// Vườn có [lua] Lúa trong kho.
Garden withLua(int lua) => Garden.fresh().copyWith(barn: lua > 0 ? {'lua': lua} : const {});

NongDone done(NongResult r) {
  expect(r, isA<NongDone>());
  return r as NongDone;
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));
  final d18 = vnDay(vn(9));
  final d19 = vnDay(vn(0, 0, 19));

  group('chuồng gà, chuồng bò (R-NONG-2, R-NONG-4)', () {
    test('R-NONG-2: rắc thóc trừ 1 Lúa; hôm đó chưa có trứng, 0:00 hôm sau có 3 trứng; nhặt xong cho ăn lại được', () {
      final r = done(feedPen(NongState.fresh, withLua(2), 'ga', d18));
      expect(r.garden!.barn['lua'], 1);
      expect(r.nong.gaFed, d18);
      expect(feedPen(r.nong, r.garden!, 'ga', d18), const NongRefused(NongError.fed));
      expect(takePen(r.nong, 'ga', d18), const NongRefused(NongError.none));
      expect(vnDay(vn(23, 59)), d18);
      expect(d19, d18 + 1);
      expect(feedPen(r.nong, r.garden!, 'ga', d19), const NongRefused(NongError.ready));
      final t = done(takePen(r.nong, 'ga', d19));
      expect(t.got, 3);
      expect(t.nong.kho['trung'], 3);
      expect(t.nong.gaFed, -1);
      expect(feedPen(t.nong, r.garden!, 'ga', d19), isA<NongDone>());
    });

    test('R-NONG-2: không có Lúa → no-feed, không trừ gì', () {
      expect(feedPen(NongState.fresh, withLua(0), 'ga', d18), const NongRefused(NongError.noFeed));
    });

    test('R-NONG-4: cho cỏ trừ 1 Cỏ khô; hôm sau lấy 1 Sữa bò; không có Cỏ khô → no-feed', () {
      expect(feedPen(NongState.fresh, withLua(5), 'bo', d18), const NongRefused(NongError.noFeed));
      final s = addHay(NongState.fresh, 1);
      final r = done(feedPen(s, Garden.fresh(), 'bo', d18));
      expect(r.garden, isNull);
      expect(r.nong.kho['co-kho'] ?? 0, 0);
      final t = done(takePen(r.nong, 'bo', d19));
      expect(t.got, 1);
      expect(t.nong.kho['sua'], 1);
    });

    test('R-NONG-5: nhổ cỏ → +1 Cỏ khô (lưu qua kho)', () async {
      final store = await ProgressStore.open(clock: () => vn(9));
      expect(store.nong.kho['co-kho'] ?? 0, 0);
      expect(addHay(addHay(NongState.fresh, 1), 1).kho['co-kho'], 2);
    });
  });

  group('ao cá (R-NONG-3)', () {
    test('R-NONG-3: loại cá theo (ngày × 7 + n × 3) mod 10 — ví dụ sổ ngày 20775', () {
      expect(fishKind(20775, 0), 'ca-diec');
      expect(fishKind(20775, 1), 'ca-chep');
      expect(fishKind(20775, 2), 'ca-diec');
      expect([for (var n = 0; n < 10; n++) fishKind(3, n)].where((k) => k == 'ca-vang').length, 1);
    });

    test('R-NONG-3: tối đa 5 cá / ngày VN; sang ngày mới câu lại', () {
      var s = NongState.fresh;
      for (var i = 0; i < fishDaily; i++) {
        final r = done(catchFish(s, d18));
        expect(r.item, fishKind(d18, i));
        expect(r.got, 1);
        s = r.nong;
      }
      expect(fishToday(s, d18), 5);
      expect(catchFish(s, d18), const NongRefused(NongError.limit));
      expect(fishToday(s, d19), 0);
      expect(catchFish(s, d19), isA<NongDone>());
    });
  });

  group('giàn bầu bí (R-NONG-6)', () {
    final t8 = vn(8).millisecondsSinceEpoch;
    test('R-NONG-6: gieo dưa leo 8:00 → 9:30 leo nửa, 11:00 chín → hái +3, gốc trống', () {
      final r = done(sowVine(NongState.fresh, 'dua-leo', t8));
      expect(sowVine(r.nong, 'dua-leo', t8), const NongRefused(NongError.busy));
      expect(vineStage(r.nong, 'dua-leo', vn(9, 30).millisecondsSinceEpoch), 'leo');
      expect(pickVine(r.nong, 'dua-leo', vn(10, 59).millisecondsSinceEpoch), const NongRefused(NongError.notRipe));
      expect(vineStage(r.nong, 'dua-leo', vn(11).millisecondsSinceEpoch), 'chin');
      final p = done(pickVine(r.nong, 'dua-leo', vn(11).millisecondsSinceEpoch));
      expect(p.got, 3);
      expect(p.nong.kho['dua-leo'], 3);
      expect(vineStage(p.nong, 'dua-leo', vn(11).millisecondsSinceEpoch), 'trong');
      expect(pickVine(p.nong, 'dua-leo', t8), const NongRefused(NongError.empty));
    });

    test('R-NONG-6: bầu 4 giờ; dáng mầm dưới 10 %, leo tới 50 %, phủ vòm sau đó', () {
      final s = done(sowVine(NongState.fresh, 'bau', t8)).nong;
      expect(vineStage(s, 'bau', vn(8, 20).millisecondsSinceEpoch), 'mam');
      expect(vineStage(s, 'bau', vn(10).millisecondsSinceEpoch), 'leo');
      expect(vineStage(s, 'bau', vn(10, 1).millisecondsSinceEpoch), 'phu');
      expect(vineStage(s, 'bau', vn(11, 59).millisecondsSinceEpoch), 'phu');
      expect(vineStage(s, 'bau', vn(12).millisecondsSinceEpoch), 'chin');
      expect(sowVine(s, 'bi-dao', t8), const NongRefused(NongError.bad));
    });
  });

  group('bán (R-NONG-7)', () {
    test('R-NONG-7: giá; bán hết không tính trần, không bán Cỏ khô', () {
      expect(nongPrices, {'trung': 4, 'ca-diec': 3, 'ca-chep': 6, 'ca-vang': 12, 'sua': 12, 'bau': 8, 'dua-leo': 6});
      final s = NongState.fresh.copyWith(kho: {'trung': 3, 'sua': 1, 'co-kho': 2});
      final r = done(sellNong(s, null));
      expect(r.amount, 24);
      expect(r.got, 4);
      expect(r.nong.kho, {'co-kho': 2});
      expect(sellNong(r.nong, null), const NongRefused(NongError.empty));
      expect(sellNong(s, 'co-kho'), const NongRefused(NongError.bad));
      expect(done(sellNong(s, 'trung')).amount, 12);
    });
  });

  group('lưu + cầu nối (R-NONG-8)', () {
    test('R-NONG-8: nongAct ghi nông trại + vườn + số dư, qua lần mở sau', () async {
      SharedPreferences.setMockInitialValues({'vuon.state': '{"open":6,"barn":{"lua":2}}', 'tien.so-du': 10});
      var store = await ProgressStore.open(clock: () => vn(9));
      final r = done(await store.nongAct('feed', pen: 'ga'));
      expect(store.garden.barn['lua'], 1);
      expect(r.garden!.barn['lua'], 1);
      store = await ProgressStore.open(clock: () => vn(9, 0, 19));
      expect(store.nong.gaFed, d18);
      done(await store.nongAct('take', pen: 'ga'));
      final s = done(await store.nongAct('sell'));
      expect(s.amount, 12);
      expect(store.coins, 22);
      expect(store.nong.kho, isEmpty);
    });

    test('R-NONG-5: gardenAct weed thành công → Cỏ khô +1 trong nong.state', () async {
      final store = await ProgressStore.open(clock: () => vn(9));
      expect(await store.addHayFromWeed(), 1);
      expect(store.nong.kho['co-kho'], 1);
    });

    test('R-NONG-8: đọc bản hỏng → nông trại trống; đọc mã lạ bỏ qua', () {
      final s = NongState.fromJson({'gaFed': 'x', 'kho': {'trung': 2, 'vit': 3, 'sua': -1}, 'vines': {'bau': 5}});
      expect(s.gaFed, -1);
      expect(s.kho, {'trung': 2});
      expect(s.vines, {'bau': 5});
      expect(NongState.fromJson('?').kho, isEmpty);
    });

    test('R-NONG-8: sự kiện nongAct đọc đủ tham số; trả lời có garden khi rắc thóc', () {
      final a = nongActArgs([
        {'type': 'nongAct', 'payload': {'act': 'feed', 'pen': 'ga'}},
      ]);
      expect(a, (act: 'feed', pen: 'ga', vine: null, item: null));
      expect(nongActArgs([{'type': 'gardenAct', 'payload': {}}]), isNull);
      expect(isGetNong([{'type': 'getNong'}]), isTrue);
      final reply = nongActReply(const NongRefused(NongError.fed), 5);
      expect(reply, {'ok': false, 'reason': 'fed', 'balance': 5});
    });
  });
}
