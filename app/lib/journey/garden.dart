/// Vườn rau ở Nhà của ta (R-VUON-1…9): bảng 8 cây, giá mở ô, túi hạt, kho nông sản, luật gieo / tưới / thu / bán / mở ô /
/// mua hạt. **Một nguồn luật + bảng cây** — bản TS chép ở `web/src/zones/vuon.ts` (đổi luật → sửa cả hai, test cùng ví dụ
/// sổ). Thuần Dart, không lưu (lưu: `progress_store.dart`, khoá `vuon.state`). Giờ tính bằng mili giây epoch UTC; chỉ trần
/// bán theo ngày giờ VN (`vnDay` ở `wallet.dart`).
library;

/// Một loại cây trồng. Tên chỉ tiếng Việt (R-HUD-4).
class Crop {
  const Crop(this.id, this.name, this.minutes, this.seed, this.sell);

  /// mã ASCII — lưu mã này; không đổi mã đã phát hành
  final String id;
  final String name;

  /// thời gian lớn tới chín (phút giờ thật — R-VUON-4)
  final int minutes;

  /// giá 1 hạt ở Tạp hoá (R-VUON-9)
  final int seed;

  /// giá bán 1 nông sản ở thùng thu mua (R-VUON-7)
  final int sell;

  int get growMs => minutes * 60000;
}

/// 8 cây theo thứ tự bảng (R-VUON-4/7/9). Mọi cây không lỗ kể cả không tưới: 2 × [Crop.sell] ≥ [Crop.seed].
const crops = <Crop>[
  Crop('cai', 'Cải ngọt', 30, 4, 3),
  Crop('cu-cai', 'Củ cải', 60, 6, 4),
  Crop('ngo', 'Ngô', 120, 8, 5),
  Crop('lua', 'Lúa', 180, 10, 6),
  Crop('bi', 'Bí đỏ', 240, 12, 7),
  Crop('cuc', 'Hoa cúc', 300, 14, 8),
  Crop('dua', 'Dưa hấu', 360, 16, 9),
  Crop('tra', 'Trà', 480, 20, 11),
];

Crop? cropOf(String? id) {
  for (final c in crops) {
    if (c.id == id) return c;
  }
  return null;
}

/// Số luống (R-VUON-1), số mở sẵn khi mới cài, giá mở ô 7 → 12 (R-VUON-8).
const plotCount = 12;
const startOpen = 6;
const openPrices = [50, 80, 120, 160, 200, 250];

/// Trần bán nông sản mỗi ngày giờ VN (R-VUON-7).
const sellDailyCap = 60;

/// Sản lượng gốc + tối đa lượt tưới (R-VUON-5/6).
const baseYield = 2;
const maxWater = 2;

/// Túi hạt khi mới cài (R-VUON-3).
const starterSeeds = {'cai': 3};

/// Mã luống thứ [n] (1 … 12).
String plotId(int n) => 'o-$n';

/// Số thứ tự của mã luống `o-n`; mã lạ → 0.
int plotIndex(String id) => id.startsWith('o-') ? int.tryParse(id.substring(2)) ?? 0 : 0;

class Plot {
  const Plot({this.crop, this.plantedAt = 0, this.watered = 0});

  static const empty = Plot();

  /// mã cây đang trồng; `null` = luống trống
  final String? crop;

  /// lúc gieo (ms epoch UTC)
  final int plantedAt;

  /// số lượt đã tưới 0 … 2
  final int watered;

  Map<String, Object?> toJson() => {'crop': crop, 'plantedAt': plantedAt, 'watered': watered};

  static Plot fromJson(Object? j) {
    if (j is! Map) return empty;
    final c = j['crop'], t = j['plantedAt'], w = j['watered'];
    if (c is! String || cropOf(c) == null || t is! num) return empty;
    return Plot(crop: c, plantedAt: t.toInt(), watered: w is num ? w.toInt().clamp(0, maxWater) : 0);
  }

  @override
  bool operator ==(Object other) => other is Plot && other.crop == crop && other.plantedAt == plantedAt && other.watered == watered;

  @override
  int get hashCode => Object.hash(crop, plantedAt, watered);
}

class Garden {
  const Garden({required this.open, required this.plots, required this.seeds, required this.barn, this.sellDay = -1, this.soldToday = 0});

  /// Vườn khi mới cài: 6 luống trống, túi 3 hạt Cải ngọt, kho rỗng (R-VUON-1, R-VUON-3).
  factory Garden.fresh() => Garden(open: startOpen, plots: {for (var i = 1; i <= plotCount; i++) plotId(i): Plot.empty}, seeds: {...starterSeeds}, barn: const {});

  /// số luống đã mở (6 … 12); luống `o-n` với n > [open] là đất hoang
  final int open;
  final Map<String, Plot> plots;

  /// túi hạt: mã cây → số hạt
  final Map<String, int> seeds;

  /// kho nông sản: mã cây → số cái
  final Map<String, int> barn;

  /// ngày giờ VN của [soldToday]; khác hôm nay → hôm nay chưa bán
  final int sellDay;
  final int soldToday;

  Plot plot(String id) => plots[id] ?? Plot.empty;

  /// Văn tiền đã bán trong ngày [today] (ngày giờ VN).
  int soldOn(int today) => sellDay == today ? soldToday : 0;

  Garden copyWith({int? open, Map<String, Plot>? plots, Map<String, int>? seeds, Map<String, int>? barn, int? sellDay, int? soldToday}) => Garden(
        open: open ?? this.open,
        plots: plots ?? this.plots,
        seeds: seeds ?? this.seeds,
        barn: barn ?? this.barn,
        sellDay: sellDay ?? this.sellDay,
        soldToday: soldToday ?? this.soldToday,
      );

  Map<String, Object?> toJson() => {
        'open': open,
        'plots': {for (var i = 1; i <= plotCount; i++) plotId(i): plot(plotId(i)).toJson()},
        'seeds': {for (final e in seeds.entries) if (e.value > 0) e.key: e.value},
        'barn': {for (final e in barn.entries) if (e.value > 0) e.key: e.value},
        'sellDay': sellDay,
        'soldToday': soldToday,
      };

  /// Đọc vườn đã lưu; thiếu / hỏng → [Garden.fresh]. Luống hoang (quá [open]) luôn trống; mã cây lạ → bỏ.
  static Garden fromJson(Object? j) {
    if (j is! Map) return Garden.fresh();
    final o = j['open'];
    final open = o is num ? o.toInt().clamp(startOpen, plotCount) : startOpen;
    final raw = j['plots'];
    final plots = <String, Plot>{
      for (var i = 1; i <= plotCount; i++) plotId(i): i <= open && raw is Map ? Plot.fromJson(raw[plotId(i)]) : Plot.empty,
    };
    final day = j['sellDay'], sold = j['soldToday'];
    return Garden(
      open: open,
      plots: plots,
      seeds: _counts(j['seeds']),
      barn: _counts(j['barn']),
      sellDay: day is num ? day.toInt() : -1,
      soldToday: sold is num && sold > 0 ? sold.toInt() : 0,
    );
  }
}

Map<String, int> _counts(Object? j) => {
      if (j is Map)
        for (final e in j.entries)
          if (e.key is String && cropOf(e.key as String) != null && e.value is num && (e.value as num) > 0) e.key as String: (e.value as num).toInt(),
    };

/// Trạng thái luống (R-VUON-2/4). `name` = chuỗi trên cầu nối / bản TS.
enum PlotState {
  locked('hoang'),
  empty('trong'),
  sown('vua-gieo'),
  sprout('mam'),
  growing('lon'),
  ripe('chin');

  const PlotState(this.wire);

  final String wire;
}

/// Thời gian đã lớn (ms), giờ máy lùi về trước lúc gieo → 0 (R-VUON-4).
int elapsedMs(Plot p, int now) => now > p.plantedAt ? now - p.plantedAt : 0;

/// Trạng thái luống [id] lúc [now]: hoang / trống / 4 dáng (vừa gieo < 10 % · mầm < 50 % · đang lớn < 100 % · chín).
PlotState plotState(Garden g, String id, int now) {
  if (plotIndex(id) > g.open) return PlotState.locked;
  final p = g.plot(id);
  final c = cropOf(p.crop);
  if (c == null) return PlotState.empty;
  final f = elapsedMs(p, now) / c.growMs;
  if (f >= 1) return PlotState.ripe;
  if (f >= .5) return PlotState.growing;
  if (f >= .1) return PlotState.sprout;
  return PlotState.sown;
}

/// Tưới được không (R-VUON-5): có cây chưa chín; lượt 1 ngay, lượt 2 từ nửa thời gian.
bool canWater(Plot p, int now) {
  final c = cropOf(p.crop);
  if (c == null) return false;
  final e = elapsedMs(p, now);
  if (e >= c.growMs) return false;
  return p.watered == 0 || (p.watered == 1 && e * 2 >= c.growMs);
}

/// Sản lượng khi thu: 2 + số lượt đã tưới (R-VUON-6).
int yieldOf(Plot p) => baseYield + p.watered.clamp(0, maxWater);

/// Còn bao lâu tới chín (ms); trống / chín → 0.
int remainingMs(Plot p, int now) {
  final c = cropOf(p.crop);
  if (c == null) return 0;
  final r = c.growMs - elapsedMs(p, now);
  return r > 0 ? r : 0;
}

/// Lỗi thao tác — `wire` là `reason` trên cầu nối `gardenAct` (docs/bridge.md).
enum GardenError {
  short('short'),
  busy('busy'),
  empty('empty'),
  notRipe('not-ripe'),
  dry('dry'),
  cap('cap'),
  full('full'),
  locked('locked'),
  noSeed('no-seed'),
  bad('bad');

  const GardenError(this.wire);

  final String wire;
}

sealed class GardenResult {
  const GardenResult();
}

/// Làm được: vườn mới; [amount] Văn tiền đổi (âm = trừ, dương = cộng); [got] nông sản vừa thu / số cái vừa bán.
class GardenDone extends GardenResult {
  const GardenDone(this.garden, {this.amount = 0, this.got = 0});

  final Garden garden;
  final int amount;
  final int got;
}

class GardenRefused extends GardenResult {
  const GardenRefused(this.error, {this.short = 0});

  final GardenError error;

  /// còn thiếu bao nhiêu Văn tiền ([GardenError.short])
  final int short;

  @override
  bool operator ==(Object other) => other is GardenRefused && other.error == error && other.short == short;

  @override
  int get hashCode => Object.hash(error, short);

  @override
  String toString() => 'GardenRefused($error, $short)';
}

Map<String, Plot> _withPlot(Garden g, String id, Plot p) => {...g.plots, id: p};

/// Gieo [crop] vào luống [id] lúc [now] (R-VUON-3): dùng 1 hạt trong túi, không trừ tiền.
GardenResult sow(Garden g, String id, String crop, int now) {
  if (plotIndex(id) < 1 || plotIndex(id) > plotCount || cropOf(crop) == null) return const GardenRefused(GardenError.bad);
  if (plotIndex(id) > g.open) return const GardenRefused(GardenError.locked);
  if (g.plot(id).crop != null) return const GardenRefused(GardenError.busy);
  final have = g.seeds[crop] ?? 0;
  if (have <= 0) return const GardenRefused(GardenError.noSeed);
  return GardenDone(g.copyWith(plots: _withPlot(g, id, Plot(crop: crop, plantedAt: now)), seeds: {...g.seeds, crop: have - 1}));
}

/// Tưới luống [id] (R-VUON-5): +1 lượt nếu tới lượt.
GardenResult water(Garden g, String id, int now) {
  if (plotIndex(id) < 1 || plotIndex(id) > plotCount) return const GardenRefused(GardenError.bad);
  if (plotIndex(id) > g.open) return const GardenRefused(GardenError.locked);
  final p = g.plot(id);
  if (p.crop == null) return const GardenRefused(GardenError.empty);
  if (!canWater(p, now)) return const GardenRefused(GardenError.dry);
  return GardenDone(g.copyWith(plots: _withPlot(g, id, Plot(crop: p.crop, plantedAt: p.plantedAt, watered: p.watered + 1))));
}

/// Thu luống chín [id] (R-VUON-6): 2 + lượt tưới vào kho, luống trống lại.
GardenResult harvest(Garden g, String id, int now) {
  if (plotIndex(id) < 1 || plotIndex(id) > plotCount) return const GardenRefused(GardenError.bad);
  if (plotIndex(id) > g.open) return const GardenRefused(GardenError.locked);
  final p = g.plot(id);
  final crop = p.crop;
  if (crop == null) return const GardenRefused(GardenError.empty);
  if (plotState(g, id, now) != PlotState.ripe) return const GardenRefused(GardenError.notRipe);
  final n = yieldOf(p);
  return GardenDone(g.copyWith(plots: _withPlot(g, id, Plot.empty), barn: {...g.barn, crop: (g.barn[crop] ?? 0) + n}), got: n);
}

/// Bán [crop] (`null` = "Bán hết", giá cao trước) trong ngày giờ VN [today] (R-VUON-7): mỗi loại bán số cái vừa phần trần
/// còn lại (không bán lẻ nửa cái), phần còn lại giữ kho. Kho trống → `empty`; còn hàng mà không bán nổi cái nào → `cap`.
GardenResult sell(Garden g, String? crop, int today) {
  if (crop != null && cropOf(crop) == null) return const GardenRefused(GardenError.bad);
  final kinds = crop == null ? ([...crops]..sort((a, b) => b.sell.compareTo(a.sell))) : [cropOf(crop)!];
  final stock = [for (final c in kinds) if ((g.barn[c.id] ?? 0) > 0) c];
  if (stock.isEmpty) return const GardenRefused(GardenError.empty);
  var room = sellDailyCap - g.soldOn(today);
  final barn = {...g.barn};
  var amount = 0, got = 0;
  for (final c in stock) {
    final n = [barn[c.id]!, room > 0 ? room ~/ c.sell : 0].reduce((a, b) => a < b ? a : b);
    if (n <= 0) continue;
    barn[c.id] = barn[c.id]! - n;
    amount += n * c.sell;
    got += n;
    room -= n * c.sell;
  }
  if (got == 0) return const GardenRefused(GardenError.cap);
  return GardenDone(g.copyWith(barn: barn, sellDay: today, soldToday: g.soldOn(today) + amount), amount: amount, got: got);
}

/// Hôm nay thu mua đã đủ: còn hàng mà phần trần còn lại nhỏ hơn giá rẻ nhất trong kho (R-VUON-7).
bool sellCapped(Garden g, int today) {
  final prices = [for (final c in crops) if ((g.barn[c.id] ?? 0) > 0) c.sell];
  if (prices.isEmpty) return false;
  return sellDailyCap - g.soldOn(today) < prices.reduce((a, b) => a < b ? a : b);
}

/// Giá mở ô kế tiếp; đủ 12 → `null` (R-VUON-8).
int? nextOpenPrice(Garden g) => g.open >= plotCount ? null : openPrices[g.open - startOpen];

/// Mở ô kế tiếp với số dư [balance] (R-VUON-8).
GardenResult openPlot(Garden g, int balance) {
  final price = nextOpenPrice(g);
  if (price == null) return const GardenRefused(GardenError.full);
  if (balance < price) return GardenRefused(GardenError.short, short: price - balance);
  return GardenDone(g.copyWith(open: g.open + 1), amount: -price);
}

/// Mua 1 hạt [crop] ở Tạp hoá với số dư [balance] (R-VUON-9).
GardenResult buySeed(Garden g, String crop, int balance) {
  final c = cropOf(crop);
  if (c == null) return const GardenRefused(GardenError.bad);
  if (balance < c.seed) return GardenRefused(GardenError.short, short: c.seed - balance);
  return GardenDone(g.copyWith(seeds: {...g.seeds, crop: (g.seeds[crop] ?? 0) + 1}), amount: -c.seed);
}

/// Số luống đã chín (tấm báo "Vườn rau: n luống đã chín" — R-VUON-6).
int ripeCount(Garden g, int now) => [for (var i = 1; i <= g.open; i++) if (plotState(g, plotId(i), now) == PlotState.ripe) i].length;

/// Nhãn ví (R-TIEN-5): "−50 · Mở ô đất", "−4 · Hạt Cải ngọt", "+39 · Bán nông sản" (dấu trừ U+2212).
String openPlotLabel(int price) => '−$price · Mở ô đất';
String seedLabel(Crop c) => '−${c.seed} · Hạt ${c.name}';
String sellLabel(int amount) => '+$amount · Bán nông sản';
