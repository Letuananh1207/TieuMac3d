/// Hái măng sau mưa ở Trúc Lâm (R-MANG-1…5): hai lứa / ngày giờ VN, mã măng, hái (măng chữ ×2), túi Lâm sản, bán cho
/// Măng bà bà. **Một nguồn luật** hái / bán / giá — bản TS chép ở `web/src/zones/mang.ts` (đổi luật → sửa cả hai, test hai
/// phía cùng ví dụ sổ). **Chỗ mọc** chỉ tính ở trang (cần cảnh); Dart chỉ kiểm mã măng có hợp lệ với ngày / giờ không.
/// Thuần Dart, không lưu (lưu: `progress_store.dart` khoá `mang.state`).
library;

import 'wallet.dart' show vnDay;

/// Một lứa măng: giây trong ngày giờ VN lúc nhú + số măng (măng số 0 là măng to — R-MANG-1).
typedef MangWave = ({int at, int count});

/// Lứa sáng 5:00 (8 măng) và lứa sau mưa 15:00 (6 măng) — R-MANG-1, R-MANG-2.
const List<MangWave> mangWaves = [(at: 5 * 3600, count: 8), (at: 15 * 3600, count: 6)];

/// Giá bán cho Măng bà bà (R-MANG-5) — Văn tiền / cái.
const mangPrices = {'mang': 3, 'mang-to': 8};

/// Giây trong ngày giờ VN (GMT+7) của [now].
int vnSecond(DateTime now) => ((now.toUtc().millisecondsSinceEpoch ~/ 1000) + 7 * 3600) % 86400;

class MangState {
  const MangState({required this.day, this.picked = const [], this.bag = const {}});

  /// Mới: chưa hái gì, túi trống.
  factory MangState.fresh(int day) => MangState(day: day);

  /// Ngày giờ VN của [picked].
  final int day;

  /// Mã măng đã hái hôm [day] (`<ngày>-<lứa>-<số>`).
  final List<String> picked;

  /// Túi Lâm sản: `mang`, `mang-to` → số cái.
  final Map<String, int> bag;

  /// Sang ngày [today]: măng đã hái hôm trước không còn ý nghĩa (măng cũ héo — R-MANG-1), túi giữ nguyên.
  MangState on(int today) => today == day ? this : MangState(day: today, bag: bag);

  Map<String, Object?> toJson() => {'day': day, 'picked': picked, 'bag': bag};

  /// Đọc bản đã lưu; sai dạng → túi trống, chưa hái (ngày −1).
  factory MangState.fromJson(Object? j) {
    if (j is! Map) return const MangState(day: -1);
    final day = j['day'] is int ? j['day'] as int : -1;
    final picked = [for (final p in (j['picked'] is List ? j['picked'] as List : const [])) if (p is String) p];
    final bag = <String, int>{};
    final b = j['bag'];
    if (b is Map) {
      for (final e in b.entries) {
        if (mangPrices.containsKey(e.key) && e.value is int && (e.value as int) > 0) bag[e.key as String] = e.value as int;
      }
    }
    return MangState(day: day, picked: picked.toSet().toList(), bag: bag);
  }
}

/// Mã măng → (ngày, lứa, số); sai dạng → `null`.
({int day, int wave, int index})? parseMangId(String id) {
  final m = RegExp(r'^(\d+)-(\d+)-(\d+)$').firstMatch(id);
  if (m == null) return null;
  return (day: int.parse(m[1]!), wave: int.parse(m[2]!), index: int.parse(m[3]!));
}

/// Măng to = măng số 0 của lứa (R-MANG-1).
bool isBigMang(int index) => index == 0;

/// Lỗi — `wire` là `reason` trên cầu nối `mangAct` (docs/bridge.md).
enum MangError {
  picked('picked'),
  day('day'),
  notYet('not-yet'),
  empty('empty'),
  bad('bad');

  const MangError(this.wire);

  final String wire;
}

sealed class MangResult {
  const MangResult();
}

/// Làm được: trạng thái mới; [amount] Văn tiền cộng (bán); [got] số măng vào túi (hái) / số cái đã bán.
class MangDone extends MangResult {
  const MangDone(this.mang, {this.amount = 0, this.got = 0});

  final MangState mang;
  final int amount;
  final int got;
}

class MangRefused extends MangResult {
  const MangRefused(this.error);

  final MangError error;

  @override
  bool operator ==(Object other) => other is MangRefused && other.error == error;

  @override
  int get hashCode => error.hashCode;

  @override
  String toString() => 'MangRefused($error)';
}

/// Hái măng [id] lúc [now] (R-MANG-3, R-MANG-4). [right] = trả lời đúng câu măng chữ; [learnedAny] = đã học ≥ 1 bộ
/// (chưa học → măng to không có chữ, không ×2).
MangResult pickMang(MangState s, String id, DateTime now, {bool right = false, bool learnedAny = false}) {
  final p = parseMangId(id);
  if (p == null || p.wave >= mangWaves.length) return const MangRefused(MangError.bad);
  final today = vnDay(now);
  if (p.day != today) return const MangRefused(MangError.day);
  final w = mangWaves[p.wave];
  if (vnSecond(now) < w.at || p.index >= w.count) return const MangRefused(MangError.notYet);
  final cur = s.on(today);
  if (cur.picked.contains(id)) return const MangRefused(MangError.picked);
  final big = isBigMang(p.index);
  final kind = big ? 'mang-to' : 'mang';
  final got = big && right && learnedAny ? 2 : 1;
  return MangDone(
    MangState(day: today, picked: [...cur.picked, id], bag: {...cur.bag, kind: (cur.bag[kind] ?? 0) + got}),
    got: got,
  );
}

/// Bán măng cho Măng bà bà (R-MANG-5): [kind] `mang` / `mang-to`, `null` = bán hết. Không trần, không tính trần trò chơi.
MangResult sellMang(MangState s, String? kind) {
  if (kind != null && !mangPrices.containsKey(kind)) return const MangRefused(MangError.bad);
  final kinds = kind == null ? mangPrices.keys : [kind];
  var amount = 0;
  var got = 0;
  final bag = {...s.bag};
  for (final k in kinds) {
    final n = bag[k] ?? 0;
    if (n <= 0) continue;
    amount += n * mangPrices[k]!;
    got += n;
    bag.remove(k);
  }
  if (got == 0) return const MangRefused(MangError.empty);
  return MangDone(MangState(day: s.day, picked: s.picked, bag: bag), amount: amount, got: got);
}

/// Nhãn bán (R-TIEN-5): "+23 · Bán măng".
String mangSellLabel(int amount) => '+$amount · Bán măng';
