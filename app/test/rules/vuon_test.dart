import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/garden.dart';
import 'package:hoc_xa_3d/journey/progress_store.dart';
import 'package:hoc_xa_3d/journey/wallet.dart';
import 'package:hoc_xa_3d/scene/garden_event.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Giờ Việt Nam (GMT+7) ngày [d] tháng 11/2026 → ms epoch UTC.
int vn(int d, int h, [int m = 0]) => DateTime.utc(2026, 11, d, h - 7, m).millisecondsSinceEpoch;

const min = 60000;

Garden withPlot(Garden g, String id, Plot p) => g.copyWith(plots: {...g.plots, id: p});

Garden done(GardenResult r) => (r as GardenDone).garden;

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  group('vườn rau (R-VUON-1)', () {
    test('R-VUON-1: mới cài → 12 luống, 6 mở (o-1…o-6) trống, 6 hoang', () {
      final g = Garden.fresh();
      expect(g.plots.length, 12);
      expect([for (var i = 1; i <= 12; i++) plotState(g, plotId(i), 0)], [
        for (var i = 1; i <= 6; i++) PlotState.empty,
        for (var i = 7; i <= 12; i++) PlotState.locked,
      ]);
    });

    test('R-VUON-1: vườn lưu hỏng / thiếu → vườn mới; luống hoang không giữ cây', () {
      expect(Garden.fromJson('x').open, 6);
      final g = Garden.fromJson({
        'open': 6,
        'plots': {'o-7': {'crop': 'cai', 'plantedAt': 1, 'watered': 0}, 'o-1': {'crop': 'la-lung', 'plantedAt': 1}},
      });
      expect(g.plot('o-7').crop, isNull);
      expect(g.plot('o-1').crop, isNull);
    });
  });

  group('gieo từ túi hạt (R-VUON-3)', () {
    test('R-VUON-3: mới cài túi có 3 hạt Cải ngọt; gieo luống 1 → có Cải ngọt, túi còn 2', () {
      final g = Garden.fresh();
      expect(g.seeds, {'cai': 3});
      final r = sow(g, 'o-1', 'cai', vn(14, 9)) as GardenDone;
      expect(r.garden.plot('o-1'), Plot(crop: 'cai', plantedAt: vn(14, 9)));
      expect(r.garden.seeds['cai'], 2);
      expect(r.amount, 0); // không trừ tiền lúc gieo
    });

    test('R-VUON-3: gieo hết 3 hạt → luống 4 "Túi hạt trống" (no-seed); luống đang có cây → busy', () {
      var g = Garden.fresh();
      for (final p in ['o-1', 'o-2', 'o-3']) {
        g = done(sow(g, p, 'cai', 0));
      }
      expect(sow(g, 'o-4', 'cai', 0), const GardenRefused(GardenError.noSeed));
      expect(sow(g, 'o-1', 'cai', 0), const GardenRefused(GardenError.busy));
      expect(sow(g, 'o-7', 'cai', 0), const GardenRefused(GardenError.locked));
    });
  });

  group('lớn theo giờ thật (R-VUON-4)', () {
    test('R-VUON-4: Lúa gieo 8:00 → 8:15 vừa gieo, 8:20 mầm, 9:30 đang lớn, 11:00 chín; mở lại 12:00 vẫn chín', () {
      final g = withPlot(Garden.fresh(), 'o-1', Plot(crop: 'lua', plantedAt: vn(14, 8)));
      expect(plotState(g, 'o-1', vn(14, 8, 15)), PlotState.sown);
      expect(plotState(g, 'o-1', vn(14, 8, 20)), PlotState.sprout);
      expect(plotState(g, 'o-1', vn(14, 9, 30)), PlotState.growing);
      expect(plotState(g, 'o-1', vn(14, 11)), PlotState.ripe);
      expect(plotState(g, 'o-1', vn(17, 12)), PlotState.ripe); // không héo
    });

    test('R-VUON-4: giờ máy lùi về trước lúc gieo → như vừa gieo; bảng thời gian 8 cây', () {
      final g = withPlot(Garden.fresh(), 'o-1', Plot(crop: 'cai', plantedAt: vn(14, 9)));
      expect(plotState(g, 'o-1', vn(14, 7)), PlotState.sown);
      expect(remainingMs(g.plot('o-1'), vn(14, 7)), 30 * min);
      expect([for (final c in crops) '${c.name} ${c.minutes}'],
          ['Cải ngọt 30', 'Củ cải 60', 'Ngô 120', 'Lúa 180', 'Bí đỏ 240', 'Hoa cúc 300', 'Dưa hấu 360', 'Trà 480']);
    });
  });

  group('tưới (R-VUON-5)', () {
    test('R-VUON-5: Cải ngọt 9:00 — tưới 9:01; 9:10 chưa tới lượt 2; 9:20 tưới; 9:30 chín thu 4', () {
      var g = withPlot(Garden.fresh(), 'o-1', Plot(crop: 'cai', plantedAt: vn(14, 9)));
      g = done(water(g, 'o-1', vn(14, 9, 1)));
      expect(water(g, 'o-1', vn(14, 9, 10)), const GardenRefused(GardenError.dry));
      g = done(water(g, 'o-1', vn(14, 9, 20)));
      expect(water(g, 'o-1', vn(14, 9, 25)), const GardenRefused(GardenError.dry)); // hết 2 lượt
      final r = harvest(g, 'o-1', vn(14, 9, 30)) as GardenDone;
      expect(r.got, 4);
    });

    test('R-VUON-5: chỉ tưới lượt 1 → thu 3; không tưới → thu 2; chín thì không tưới nữa', () {
      final p = Plot(crop: 'cai', plantedAt: vn(14, 9));
      expect(yieldOf(const Plot(crop: 'cai', watered: 1)), 3);
      expect(yieldOf(p), 2);
      expect(canWater(p, vn(14, 9, 30)), isFalse);
      expect(canWater(p, vn(14, 9)), isTrue);
    });
  });

  group('thu hoạch (R-VUON-6)', () {
    test('R-VUON-6: thu Bí đỏ tưới 2 lượt → +4 vào kho, luống trống; chưa chín → not-ripe', () {
      final g = withPlot(Garden.fresh(), 'o-2', Plot(crop: 'bi', plantedAt: vn(14, 8), watered: 2));
      expect(harvest(g, 'o-2', vn(14, 11)), const GardenRefused(GardenError.notRipe));
      final r = harvest(g, 'o-2', vn(14, 12)) as GardenDone;
      expect(r.got, 4);
      expect(r.garden.barn['bi'], 4);
      expect(r.garden.plot('o-2').crop, isNull);
    });

    test('R-VUON-6: 3 ngày sau 6 luống chín vẫn còn → "6 luống đã chín"', () {
      var g = Garden.fresh();
      for (var i = 1; i <= 6; i++) {
        g = withPlot(g, plotId(i), Plot(crop: 'tra', plantedAt: vn(14, 8)));
      }
      expect(ripeCount(g, vn(17, 8)), 6);
    });

    test('R-VUON-6: kho + vườn giữ qua tắt app (lưu vuon.state)', () async {
      final store = await ProgressStore.open(clock: () => DateTime.fromMillisecondsSinceEpoch(vn(14, 9), isUtc: true));
      await store.gardenAct('sow', plot: 'o-1', crop: 'cai');
      final later = await ProgressStore.open(clock: () => DateTime.fromMillisecondsSinceEpoch(vn(17, 9), isUtc: true));
      expect(later.garden.plot('o-1').crop, 'cai');
      final r = await later.gardenAct('harvest', plot: 'o-1');
      expect((r as GardenDone).got, 2);
      expect((await ProgressStore.open()).garden.barn['cai'], 2);
    });
  });

  group('bán (R-VUON-7)', () {
    test('R-VUON-7: kho 4 Trà + 3 Cải, đã bán 20 → "Bán hết" +39, còn 1 Trà 1 Cải, đã đủ', () {
      final today = vnDay(DateTime.fromMillisecondsSinceEpoch(vn(14, 10), isUtc: true));
      final g = Garden.fresh().copyWith(barn: {'tra': 4, 'cai': 3}, sellDay: today, soldToday: 20);
      final r = sell(g, null, today) as GardenDone;
      expect(r.amount, 39);
      expect(r.garden.soldToday, 59);
      expect(r.garden.barn, {'tra': 1, 'cai': 1});
      expect(sellCapped(r.garden, today), isTrue);
      expect(sell(r.garden, null, today), const GardenRefused(GardenError.cap));
      expect(sellLabel(39), '+39 · Bán nông sản');
    });

    test('R-VUON-7: 0 giờ giờ VN hôm sau → bán lại được; kho trống → empty', () {
      final d14 = vnDay(DateTime.fromMillisecondsSinceEpoch(vn(14, 23, 59), isUtc: true));
      final d15 = vnDay(DateTime.fromMillisecondsSinceEpoch(vn(15, 0, 1), isUtc: true));
      final g = Garden.fresh().copyWith(barn: {'tra': 1}, sellDay: d14, soldToday: 59);
      expect(sell(g, 'tra', d14), const GardenRefused(GardenError.cap));
      expect((sell(g, 'tra', d15) as GardenDone).amount, 11);
      expect(sell(Garden.fresh(), null, d15), const GardenRefused(GardenError.empty));
    });

    test('R-VUON-7: bán trên app → cộng ví ngay', () async {
      SharedPreferences.setMockInitialValues({'vuon.state': '{"open":6,"barn":{"cai":2}}', 'tien.so-du': 10});
      final store = await ProgressStore.open();
      final r = await store.gardenAct('sell') as GardenDone;
      expect(r.amount, 6);
      expect(store.coins, 16);
      expect(gardenActReply(r, store.coins)['balance'], 16);
    });
  });

  group('mở ô (R-VUON-8)', () {
    test('R-VUON-8: 6 ô, có 70 → mở ô 7 (50) còn 20; ô 8 cần 80 → còn thiếu 60', () {
      final r = openPlot(Garden.fresh(), 70) as GardenDone;
      expect(r.amount, -50);
      expect(r.garden.open, 7);
      expect(plotState(r.garden, 'o-7', 0), PlotState.empty);
      expect(openPlot(r.garden, 20), const GardenRefused(GardenError.short, short: 60));
      expect(openPlotLabel(50), '−50 · Mở ô đất');
    });

    test('R-VUON-8: giá 50 · 80 · 120 · 160 · 200 · 250; đủ 12 → full', () {
      var g = Garden.fresh();
      final paid = <int>[];
      for (var i = 0; i < 6; i++) {
        final r = openPlot(g, 1000) as GardenDone;
        paid.add(-r.amount);
        g = r.garden;
      }
      expect(paid, [50, 80, 120, 160, 200, 250]);
      expect(openPlot(g, 1000), const GardenRefused(GardenError.full));
    });
  });

  group('mua hạt ở Tạp hoá (R-VUON-9)', () {
    test('R-VUON-9: có 10, mua hạt Cải ngọt → còn 6, túi +1; mua tiếp → còn 2', () async {
      SharedPreferences.setMockInitialValues({'tien.so-du': 10});
      final store = await ProgressStore.open();
      await store.buySeed('cai');
      expect(store.coins, 6);
      expect(store.garden.seeds['cai'], 4);
      await store.buySeed('cai');
      expect(store.coins, 2);
      expect(store.garden.seeds['cai'], 5);
    });

    test('R-VUON-9: có 7, hạt Ngô (8) → còn thiếu 1; giá hạt 8 cây; không cây nào lỗ', () {
      expect(buySeed(Garden.fresh(), 'ngo', 7), const GardenRefused(GardenError.short, short: 1));
      expect([for (final c in crops) c.seed], [4, 6, 8, 10, 12, 14, 16, 20]);
      for (final c in crops) {
        expect(2 * c.sell >= c.seed, isTrue, reason: c.name);
      }
      expect(seedShopItems().first.name, 'Hạt Cải ngọt');
    });

    test('R-VUON-9: có 50, × 5 Hạt Ngô → trả 40, còn 10, túi +5; × 10 (80) → còn thiếu 30; số lạ → bad', () async {
      SharedPreferences.setMockInitialValues({'tien.so-du': 50});
      final store = await ProgressStore.open();
      expect(await store.buySeed('ngo', count: 5), isA<Bought>());
      expect(store.coins, 10);
      expect(store.garden.seeds['ngo'], 5);
      expect(buySeed(Garden.fresh(), 'ngo', 50, count: 10), const GardenRefused(GardenError.short, short: 30));
      expect(buySeed(Garden.fresh(), 'ngo', 500, count: 3), const GardenRefused(GardenError.bad));
      expect(seedLabel(cropOf('ngo')!, 5), '−40 · Hạt Ngô');
      expect(gardenActArgs([
        {'type': 'gardenAct', 'payload': {'act': 'buy', 'crop': 'ngo', 'count': 10}},
      ])?.count, 10);
    });
  });
}
