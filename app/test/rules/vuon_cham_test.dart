import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/garden.dart';
import 'package:hoc_xa_3d/journey/progress_store.dart';
import 'package:hoc_xa_3d/journey/wallet.dart';
import 'package:hoc_xa_3d/scene/garden_event.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Giờ Việt Nam (GMT+7) ngày [d] tháng 11/2026 → ms epoch UTC.
int vn(int d, int h, [int m = 0, int s = 0]) => DateTime.utc(2026, 11, d, h - 7, m, s).millisecondsSinceEpoch;

Garden withPlot(Garden g, String id, Plot p) => g.copyWith(plots: {...g.plots, id: p});

Garden done(GardenResult r) => (r as GardenDone).garden;

/// Ví dụ sổ (V-73): gieo 8:00 ngày 14/11 — o-1 sạch; o-2 sâu từ 318 ‰; o-3 2 bụi cỏ từ 691 ‰; o-4 sâu 220 ‰ + 3 bụi cỏ 714 ‰.
final t0 = vn(14, 8);

Garden lua(String id, {int watered = 0}) => withPlot(Garden.fresh(), id, Plot(crop: 'lua', plantedAt: t0, watered: watered));

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  group('hàm băm định sẵn (R-VUON-10/11)', () {
    test('R-VUON-10: FNV-1a 32-bit cùng vector với web (vuonCham.test.ts)', () {
      expect(fnv1a(''), 2166136261);
      expect(fnv1a('a'), 3826002220);
      expect(fnv1a('o-3@1794013200000'), 417460559);
      expect(t0, 1794618000000);
    });

    test('R-VUON-10: gieo 8:00 14/11 — o-1 sạch, o-2 sâu 318 ‰, o-3 cỏ 691 ‰ (2 bụi), o-4 sâu 220 ‰ + cỏ 714 ‰ (3 bụi)', () {
      final s = [for (var i = 1; i <= 4; i++) pestsOf('o-$i', t0)];
      expect([for (final p in s) p.bugAt], [-1, 318, -1, 220]);
      expect([for (final p in s) p.weedAt], [-1, -1, 691, 714]);
      expect(s[2].weeds, 2);
      expect(s[3].weeds, 3);
    });
  });

  group('sâu ăn lá (R-VUON-10)', () {
    test('R-VUON-10: Lúa o-2 gieo 8:00 → 8:57 chưa có sâu, 8:58 có; bắt → hết, "no-bug" lần sau', () {
      final g = lua('o-2');
      expect(hasBug(g.plot('o-2'), 'o-2', vn(14, 8, 57)), isFalse);
      expect(hasBug(g.plot('o-2'), 'o-2', vn(14, 8, 58)), isTrue);
      expect(catchBug(g, 'o-2', vn(14, 8, 57)), const GardenRefused(GardenError.noBug));
      final after = done(catchBug(g, 'o-2', vn(14, 8, 58)));
      expect(hasBug(after.plot('o-2'), 'o-2', vn(14, 12)), isFalse);
      expect(catchBug(after, 'o-2', vn(14, 9)), const GardenRefused(GardenError.noBug));
      expect(catchBug(Garden.fresh(), 'o-2', 0), const GardenRefused(GardenError.empty));
      expect(catchBug(Garden.fresh(), 'o-8', 0), const GardenRefused(GardenError.locked));
    });

    test('R-VUON-10: sâu không làm chậm lớn; cây o-1 không bao giờ có sâu', () {
      final g = withPlot(lua('o-2'), 'o-1', Plot(crop: 'lua', plantedAt: t0));
      expect(plotState(g, 'o-2', vn(14, 11)), PlotState.ripe);
      expect(hasBug(g.plot('o-1'), 'o-1', vn(14, 11)), isFalse);
    });
  });

  group('cỏ dại (R-VUON-11)', () {
    test('R-VUON-11: Lúa o-3 gieo 8:00 → 10:04 chưa, 10:05 có 2 bụi cỏ; nhổ → sạch', () {
      final g = lua('o-3');
      expect(weedsOf(g.plot('o-3'), 'o-3', vn(14, 10, 4)), 0);
      expect(weedsOf(g.plot('o-3'), 'o-3', vn(14, 10, 5)), 2);
      expect(pullWeed(g, 'o-3', vn(14, 10, 4)), const GardenRefused(GardenError.noWeed));
      final after = done(pullWeed(g, 'o-3', vn(14, 10, 5)));
      expect(weedsOf(after.plot('o-3'), 'o-3', vn(14, 12)), 0);
    });
  });

  group('sản lượng (R-VUON-6)', () {
    test('R-VUON-6: Lúa o-4 tưới 2 lượt — bỏ mặc sâu + cỏ → 2; bắt sâu → 3; bắt sâu + nhổ cỏ → 4', () {
      var g = lua('o-4', watered: 2);
      expect((harvest(g, 'o-4', vn(14, 11)) as GardenDone).got, 2);
      g = done(catchBug(g, 'o-4', vn(14, 9)));
      expect((harvest(g, 'o-4', vn(14, 11)) as GardenDone).got, 3);
      g = done(pullWeed(g, 'o-4', vn(14, 10, 30)));
      expect((harvest(g, 'o-4', vn(14, 11)) as GardenDone).got, 4);
    });

    test('R-VUON-6: không tưới + có sâu → vẫn 2 (thấp nhất 2); cao nhất 4', () {
      expect((harvest(lua('o-2'), 'o-2', vn(14, 11)) as GardenDone).got, 2);
      expect(yieldFrom(2, bugLeft: false, weedLeft: false), 4);
      expect(yieldFrom(0, bugLeft: true, weedLeft: true), 2);
    });
  });

  group('đất khô / ẩm (R-VUON-5)', () {
    test('R-VUON-5: Cải ngọt gieo 9:00 → khô ngay; tưới → ẩm; 9:15 khô lại; tưới → ẩm tới chín', () {
      var g = withPlot(Garden.fresh(), 'o-1', Plot(crop: 'cai', plantedAt: vn(14, 9)));
      expect(isDry(g.plot('o-1'), vn(14, 9)), isTrue);
      g = done(water(g, 'o-1', vn(14, 9, 1)));
      expect(isDry(g.plot('o-1'), vn(14, 9, 10)), isFalse);
      expect(isDry(g.plot('o-1'), vn(14, 9, 15)), isTrue);
      g = done(water(g, 'o-1', vn(14, 9, 16)));
      expect(isDry(g.plot('o-1'), vn(14, 9, 29)), isFalse);
      expect(isDry(g.plot('o-1'), vn(14, 9, 30)), isFalse); // chín → đất thường
    });
  });

  group('phân bón (R-VUON-12)', () {
    test('R-VUON-12: Trà 8 giờ gieo 8:00, bón 10:00 → còn 6 giờ thành 3 giờ → chín 13:00; túi 3 → 2', () {
      final g0 = withPlot(Garden.fresh(), 'o-1', Plot(crop: 'tra', plantedAt: t0));
      expect(g0.fert, 3);
      final g = done(fertilize(g0, 'o-1', vn(14, 10)));
      expect(g.fert, 2);
      expect(remainingMs(g.plot('o-1'), vn(14, 10)), 3 * 3600000);
      expect(plotState(g, 'o-1', vn(14, 12, 59)), isNot(PlotState.ripe));
      expect(plotState(g, 'o-1', vn(14, 13)), PlotState.ripe);
    });

    test('R-VUON-12: bón rồi / chín → fert-done; luống trống → empty; hết phân → no-fert; không thêm sản lượng', () {
      final g0 = withPlot(Garden.fresh(), 'o-1', Plot(crop: 'tra', plantedAt: t0, bug: 1, weed: 1));
      final g = done(fertilize(g0, 'o-1', vn(14, 10)));
      expect(fertilize(g, 'o-1', vn(14, 11)), const GardenRefused(GardenError.fertDone));
      expect(fertilize(g0, 'o-1', vn(14, 16)), const GardenRefused(GardenError.fertDone));
      expect(fertilize(g0, 'o-2', vn(14, 10)), const GardenRefused(GardenError.empty));
      expect(fertilize(g0.copyWith(fert: 0), 'o-1', vn(14, 10)), const GardenRefused(GardenError.noFert));
      expect((harvest(g, 'o-1', vn(14, 13)) as GardenDone).got, 2);
    });

    test('R-VUON-12: mua phân 10 Văn / bao × 1 · × 5 · × 10; có 40, × 5 (50) → còn thiếu 10; nhãn "−50 · Phân bón"', () async {
      expect(buyFert(Garden.fresh(), 40, count: 5), const GardenRefused(GardenError.short, short: 10));
      expect(buyFert(Garden.fresh(), 500, count: 3), const GardenRefused(GardenError.bad));
      final r = buyFert(Garden.fresh(), 60, count: 5) as GardenDone;
      expect(r.amount, -50);
      expect(r.garden.fert, 8);
      expect(fertLabel(5), '−50 · Phân bón');
      SharedPreferences.setMockInitialValues({'tien.so-du': 25});
      final store = await ProgressStore.open();
      expect(await store.buyFert(), isA<Bought>());
      expect(store.coins, 15);
      expect(store.garden.fert, 4);
      expect(seedShopItems().last.name, 'Phân bón');
      expect(gardenActArgs([
        {'type': 'gardenAct', 'payload': {'act': 'buy', 'item': 'phan', 'count': 5}},
      ])?.item, 'phan');
    });
  });

  group('chuyển dữ liệu bản cũ (V-73)', () {
    test('R-VUON-12: vườn lưu bản cũ (không bug / weed / boost / fert) → giữ cây đang trồng, 3 bao phân, không sâu / cỏ', () async {
      SharedPreferences.setMockInitialValues({
        'vuon.state': '{"open":6,"plots":{"o-4":{"crop":"lua","plantedAt":$t0,"watered":2}},"seeds":{"cai":1}}',
      });
      final store = await ProgressStore.open(clock: () => DateTime.fromMillisecondsSinceEpoch(vn(14, 11), isUtc: true));
      final g = store.garden;
      expect(g.plot('o-4').crop, 'lua');
      expect(g.plot('o-4').watered, 2);
      expect(g.fert, 3);
      expect(hasBug(g.plot('o-4'), 'o-4', vn(14, 11)), isFalse);
      expect(weedsOf(g.plot('o-4'), 'o-4', vn(14, 11)), 0);
      final r = await store.gardenAct('harvest', plot: 'o-4') as GardenDone;
      expect(r.got, 4);
    });

    test('R-VUON-12: ghi rồi đọc lại giữ boost / bug / weed / fert', () {
      final g = done(fertilize(lua('o-4'), 'o-4', vn(14, 9)));
      final back = Garden.fromJson(g.toJson());
      expect(back.plot('o-4'), g.plot('o-4'));
      expect(back.fert, 2);
      expect(vnDay(DateTime.fromMillisecondsSinceEpoch(t0, isUtc: true)), isPositive);
    });
  });

  group('cầu nối gardenAct (bug / weed / fert)', () {
    test('R-VUON-10: gardenAct bug / weed / fert qua ProgressStore; lý do mới trên cầu nối', () async {
      final store = await ProgressStore.open(clock: () => DateTime.fromMillisecondsSinceEpoch(t0, isUtc: true));
      await store.gardenAct('sow', plot: 'o-4', crop: 'cai');
      final r = await store.gardenAct('bug', plot: 'o-4');
      expect(gardenActReply(r, store.coins)['reason'], 'no-bug');
      expect(gardenActReply(await store.gardenAct('weed', plot: 'o-4'), 0)['reason'], 'no-weed');
      expect(await store.gardenAct('fert', plot: 'o-4'), isA<GardenDone>());
      expect(gardenActReply(await store.gardenAct('fert', plot: 'o-4'), 0)['reason'], 'fert-done');
    });
  });
}
