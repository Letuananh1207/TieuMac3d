/// Nông trại ở Nhà của ta (R-NONG-1…8): chuồng gà (rắc thóc → trứng), chuồng bò con (cỏ khô → sữa), ao cá (5 cá / ngày),
/// giàn bầu bí (2 gốc), kho sản phẩm + bán ở thùng thu mua. **Một nguồn luật** — bản TS chép ở `web/src/zones/nong.ts`
/// (đổi luật → sửa cả hai, test hai phía cùng ví dụ sổ). Nhịp ngày theo ngày giờ VN (`vnDay`). Thuần Dart, không lưu
/// (lưu: `progress_store.dart` khoá `nong.state`).
library;

import 'garden.dart' show Garden;

/// Giá bán ở thùng thu mua (R-NONG-7) — Văn tiền / cái; không tính trần 60 của vườn. Cỏ khô không bán.
const nongPrices = {'trung': 4, 'ca-diec': 3, 'ca-chep': 6, 'ca-vang': 12, 'sua': 12, 'bau': 8, 'dua-leo': 6};

/// Cỏ khô (R-NONG-5) — chỉ cho bò ăn.
const hayItem = 'co-kho';

/// Mọi mã trong kho nông trại.
const nongItems = [...['trung', 'ca-diec', 'ca-chep', 'ca-vang', 'sua', 'bau', 'dua-leo'], hayItem];

/// Mỗi lần nhặt: 3 trứng (R-NONG-2), 1 sữa (R-NONG-4).
const penYield = {'ga': 3, 'bo': 1};

/// Sản phẩm của chuồng.
const penProduct = {'ga': 'trung', 'bo': 'sua'};

/// Tối đa cá / ngày VN (R-NONG-3).
const fishDaily = 5;

/// Phút giờ thật tới chín của 2 gốc giàn (R-NONG-6) + số quả mỗi lần hái.
const vineMinutes = {'bau': 240, 'dua-leo': 180};
const vineYield = 3;

/// Loại cá con thứ [n] (từ 0) của ngày VN [day] (R-NONG-3): `(ngày × 7 + n × 3) mod 10` → 0–5 diếc · 6–8 chép · 9 vàng.
String fishKind(int day, int n) {
  final k = (day * 7 + n * 3) % 10;
  return k <= 5 ? 'ca-diec' : (k <= 8 ? 'ca-chep' : 'ca-vang');
}

class NongState {
  const NongState({this.gaFed = -1, this.boFed = -1, this.fishDay = -1, this.fishN = 0, this.vines = const {}, this.kho = const {}});

  /// Mới: chưa cho ăn, chưa câu, giàn trống, kho trống.
  static const fresh = NongState();

  /// Ngày VN lần rắc thóc / cho cỏ còn chờ lấy sản phẩm; −1 = không.
  final int gaFed;
  final int boFed;

  /// Ngày VN + số cá đã câu hôm đó.
  final int fishDay;
  final int fishN;

  /// Lúc gieo (ms) gốc `bau` / `dua-leo`; không có = trống.
  final Map<String, int> vines;

  /// Kho nông trại: mã → số cái.
  final Map<String, int> kho;

  int fedOf(String pen) => pen == 'ga' ? gaFed : boFed;

  NongState copyWith({int? gaFed, int? boFed, int? fishDay, int? fishN, Map<String, int>? vines, Map<String, int>? kho}) => NongState(
        gaFed: gaFed ?? this.gaFed,
        boFed: boFed ?? this.boFed,
        fishDay: fishDay ?? this.fishDay,
        fishN: fishN ?? this.fishN,
        vines: vines ?? this.vines,
        kho: kho ?? this.kho,
      );

  NongState withFed(String pen, int day) => pen == 'ga' ? copyWith(gaFed: day) : copyWith(boFed: day);

  Map<String, Object?> toJson() => {
        'gaFed': gaFed,
        'boFed': boFed,
        'fishDay': fishDay,
        'fishN': fishN,
        'vines': vines,
        'kho': {for (final e in kho.entries) if (e.value > 0) e.key: e.value},
      };

  /// Đọc bản đã lưu; sai dạng → mặc định; mã lạ / số ≤ 0 bỏ.
  factory NongState.fromJson(Object? j) {
    if (j is! Map) return fresh;
    int i(Object? v, int d) => v is int ? v : d;
    final vines = <String, int>{};
    final v = j['vines'];
    if (v is Map) {
      for (final e in v.entries) {
        if (vineMinutes.containsKey(e.key) && e.value is int && (e.value as int) > 0) vines[e.key as String] = e.value as int;
      }
    }
    final kho = <String, int>{};
    final k = j['kho'];
    if (k is Map) {
      for (final e in k.entries) {
        if (nongItems.contains(e.key) && e.value is int && (e.value as int) > 0) kho[e.key as String] = e.value as int;
      }
    }
    return NongState(gaFed: i(j['gaFed'], -1), boFed: i(j['boFed'], -1), fishDay: i(j['fishDay'], -1), fishN: i(j['fishN'], 0), vines: vines, kho: kho);
  }
}

/// Lỗi — `wire` là `reason` trên cầu nối `nongAct` (docs/bridge.md).
enum NongError {
  noFeed('no-feed'),
  fed('fed'),
  ready('ready'),
  none('none'),
  limit('limit'),
  busy('busy'),
  notRipe('not-ripe'),
  empty('empty'),
  bad('bad');

  const NongError(this.wire);

  final String wire;
}

sealed class NongResult {
  const NongResult();
}

/// Làm được: nông trại mới; [garden] vườn mới (chỉ khi rắc thóc — kho Lúa trừ 1); [amount] Văn tiền cộng (bán);
/// [got] số cái vào kho / số cái đã bán; [item] loại cá vừa câu.
class NongDone extends NongResult {
  const NongDone(this.nong, {this.garden, this.amount = 0, this.got = 0, this.item});

  final NongState nong;
  final Garden? garden;
  final int amount;
  final int got;
  final String? item;
}

class NongRefused extends NongResult {
  const NongRefused(this.error);

  final NongError error;

  @override
  bool operator ==(Object other) => other is NongRefused && other.error == error;

  @override
  int get hashCode => error.hashCode;

  @override
  String toString() => 'NongRefused($error)';
}

Map<String, int> _add(Map<String, int> m, String k, int n) {
  final out = {...m, k: (m[k] ?? 0) + n};
  if (out[k]! <= 0) out.remove(k);
  return out;
}

/// Chuồng [pen] có sản phẩm chờ lấy hôm [today]: đã cho ăn hôm trước.
bool penReady(NongState s, String pen, int today) => s.fedOf(pen) >= 0 && today > s.fedOf(pen);

/// Rắc thóc (`ga`, 1 Lúa kho vườn — R-NONG-2) / cho cỏ (`bo`, 1 Cỏ khô — R-NONG-4) ngày VN [today].
NongResult feedPen(NongState s, Garden g, String pen, int today) {
  if (!penYield.containsKey(pen)) return const NongRefused(NongError.bad);
  if (penReady(s, pen, today)) return const NongRefused(NongError.ready);
  if (s.fedOf(pen) == today) return const NongRefused(NongError.fed);
  if (pen == 'ga') {
    final lua = g.barn['lua'] ?? 0;
    if (lua <= 0) return const NongRefused(NongError.noFeed);
    return NongDone(s.withFed(pen, today), garden: g.copyWith(barn: _add(g.barn, 'lua', -1)));
  }
  if ((s.kho[hayItem] ?? 0) <= 0) return const NongRefused(NongError.noFeed);
  return NongDone(s.withFed(pen, today).copyWith(kho: _add(s.kho, hayItem, -1)));
}

/// Nhặt trứng / lấy sữa (R-NONG-2, R-NONG-4).
NongResult takePen(NongState s, String pen, int today) {
  if (!penYield.containsKey(pen)) return const NongRefused(NongError.bad);
  if (!penReady(s, pen, today)) return const NongRefused(NongError.none);
  final n = penYield[pen]!;
  return NongDone(s.withFed(pen, -1).copyWith(kho: _add(s.kho, penProduct[pen]!, n)), got: n);
}

/// Số cá đã câu hôm [today].
int fishToday(NongState s, int today) => s.fishDay == today ? s.fishN : 0;

/// Được 1 cá (giật cần đúng lúc — trang canh phao; R-NONG-3).
NongResult catchFish(NongState s, int today) {
  final n = fishToday(s, today);
  if (n >= fishDaily) return const NongRefused(NongError.limit);
  final kind = fishKind(today, n);
  return NongDone(s.copyWith(fishDay: today, fishN: n + 1, kho: _add(s.kho, kind, 1)), got: 1, item: kind);
}

/// Dáng gốc giàn [vine] lúc [now] (ms): `trong` · `mam` (< 10 %) · `leo` (≤ 50 %) · `phu` (< 100 %) · `chin` (R-NONG-6).
/// [speed] chỉ dùng ở chế độ thử.
String vineStage(NongState s, String vine, int now, {double speed = 1}) {
  final t = s.vines[vine];
  final m = vineMinutes[vine];
  if (t == null || m == null) return 'trong';
  final f = (now - t) * speed / (m * 60000);
  if (f >= 1) return 'chin';
  if (f > 0.5) return 'phu';
  if (f >= 0.1) return 'leo';
  return 'mam';
}

/// Gieo gốc [vine] (miễn phí — R-NONG-6).
NongResult sowVine(NongState s, String vine, int now) {
  if (!vineMinutes.containsKey(vine)) return const NongRefused(NongError.bad);
  if (s.vines.containsKey(vine)) return const NongRefused(NongError.busy);
  return NongDone(s.copyWith(vines: {...s.vines, vine: now}));
}

/// Hái gốc [vine] đã chín → +3 quả, gốc trống (R-NONG-6).
NongResult pickVine(NongState s, String vine, int now, {double speed = 1}) {
  if (!vineMinutes.containsKey(vine)) return const NongRefused(NongError.bad);
  if (!s.vines.containsKey(vine)) return const NongRefused(NongError.empty);
  if (vineStage(s, vine, now, speed: speed) != 'chin') return const NongRefused(NongError.notRipe);
  return NongDone(s.copyWith(vines: {...s.vines}..remove(vine), kho: _add(s.kho, vine, vineYield)), got: vineYield);
}

/// +[n] Cỏ khô (nhổ cỏ — R-NONG-5).
NongState addHay(NongState s, int n) => s.copyWith(kho: _add(s.kho, hayItem, n));

/// Bán [item] (`null` = bán hết) ở thùng thu mua — không trần (R-NONG-7).
NongResult sellNong(NongState s, String? item) {
  if (item != null && !nongPrices.containsKey(item)) return const NongRefused(NongError.bad);
  final kinds = item == null ? nongPrices.keys : [item];
  final kho = {...s.kho};
  var amount = 0;
  var got = 0;
  for (final k in kinds) {
    final n = kho[k] ?? 0;
    if (n <= 0) continue;
    amount += n * nongPrices[k]!;
    got += n;
    kho.remove(k);
  }
  if (got == 0) return const NongRefused(NongError.empty);
  return NongDone(s.copyWith(kho: kho), amount: amount, got: got);
}
