/// Chăm cây ở Vườn rau (V-73, R-VUON-6/10/11/12): sâu / cỏ **định sẵn lúc gieo** bằng hàm băm FNV-1a 32-bit của
/// "mã luống@giờ gieo" — Flutter và web (`web/src/zones/vuonCham.ts`) tính ra **cùng kết quả**, không lưu, chạy đúng cả khi
/// tắt app; công thức sản lượng; phân bón. Thuần Dart, chỉ số nguyên (không lệch làm tròn giữa hai phía).
library;

import 'garden.dart';

/// FNV-1a 32-bit trên mã UTF-16 của [s] (chuỗi ASCII) — trùng `fnv1a` ở TS, test cùng vector.
int fnv1a(String s) {
  var h = 0x811c9dc5;
  for (final c in s.codeUnits) {
    h ^= c;
    h = (h * 0x01000193) & 0xffffffff;
  }
  return h;
}

/// Sâu / cỏ định sẵn cho một lần gieo: mốc hiện tính bằng phần nghìn thời gian lớn; `-1` = không có.
class Pests {
  const Pests(this.bugAt, this.weedAt, this.weeds);

  /// sâu hiện từ phần nghìn này (200 … 450 — R-VUON-10); -1 = cây này không có sâu
  final int bugAt;

  /// cỏ hiện từ phần nghìn này (550 … 850 — R-VUON-11); -1 = không có cỏ
  final int weedAt;

  /// số bụi cỏ (2 … 3)
  final int weeds;
}

/// Sâu / cỏ của cây gieo ở luống [plotId] lúc [plantedAt] (ms): bit 0 → có sâu (½), bit 1 → có cỏ (½), byte 1 → mốc sâu,
/// byte 2 → mốc cỏ, bit 24 → 2 hay 3 bụi.
Pests pestsOf(String plotId, int plantedAt) {
  final h = fnv1a('$plotId@$plantedAt');
  return Pests(
    h & 1 == 1 ? 200 + ((h >> 8) & 0xff) * 250 ~/ 255 : -1,
    (h >> 1) & 1 == 1 ? 550 + ((h >> 16) & 0xff) * 300 ~/ 255 : -1,
    2 + ((h >> 24) & 1),
  );
}

/// Tiến độ [progressMs] trên tổng [growMs] đã tới mốc [permille] chưa (mốc -1 → không bao giờ).
bool reached(int permille, int progressMs, int growMs) => permille >= 0 && progressMs * 1000 >= permille * growMs;

/// Sản lượng (R-VUON-6): 2 + lượt tưới − sâu còn − cỏ còn, thấp nhất 2, cao nhất 4.
int yieldFrom(int watered, {required bool bugLeft, required bool weedLeft}) {
  final n = 2 + watered.clamp(0, 2) - (bugLeft ? 1 : 0) - (weedLeft ? 1 : 0);
  return n.clamp(2, 4);
}

/// Phân bón (R-VUON-12): mới cài tặng 3 bao; giá 1 bao ở Tạp hoá; số bao chọn được mỗi lần mua.
const starterFert = 3;
const fertPrice = 10;
const fertCounts = [1, 5, 10];

/// Mã vật phân bón trên cầu nối (`gardenAct` `{act:'buy', item:'phan'}`).
const fertItem = 'phan';

/// Bón: thời gian còn lại [remainingMs] giảm một nửa → số ms cộng vào tiến độ.
int fertBoost(int remainingMs) => remainingMs ~/ 2;

/// Nhãn ví (R-TIEN-5): "−10 · Phân bón".
String fertLabel([int count = 1]) => '−${fertPrice * count} · Phân bón';

/* ---------- trạng thái + thao tác chăm cây (dùng `Garden` ở garden.dart) ---------- */

/// Đất khô (R-VUON-5): tới mốc tưới mà chưa tưới lượt đó — trùng [canWater].
bool isDry(Plot p, int now) => canWater(p, now);

/// Luống [id] đang có sâu (R-VUON-10): cây này có sâu, đã tới mốc hiện, chưa bắt. Chín rồi mà chưa bắt → vẫn còn.
bool hasBug(Plot p, String id, int now) {
  final c = cropOf(p.crop);
  return c != null && p.bug == 0 && reached(pestsOf(id, p.plantedAt).bugAt, elapsedMs(p, now), c.growMs);
}

/// Số bụi cỏ đang mọc ở luống [id] (R-VUON-11): 0 / 2 / 3.
int weedsOf(Plot p, String id, int now) {
  final c = cropOf(p.crop);
  if (c == null || p.weed != 0) return 0;
  final s = pestsOf(id, p.plantedAt);
  return reached(s.weedAt, elapsedMs(p, now), c.growMs) ? s.weeds : 0;
}

/// Luống có cây để chăm: mã sai → `bad`, hoang → `locked`, trống → `empty`; được → `null`.
GardenRefused? _careRefuse(Garden g, String id) {
  if (plotIndex(id) < 1 || plotIndex(id) > plotCount) return const GardenRefused(GardenError.bad);
  if (plotIndex(id) > g.open) return const GardenRefused(GardenError.locked);
  if (g.plot(id).crop == null) return const GardenRefused(GardenError.empty);
  return null;
}

/// Bắt sâu ở luống [id] (R-VUON-10): sâu đang hiện → hết sâu; không có → `no-bug`.
GardenResult catchBug(Garden g, String id, int now) {
  final no = _careRefuse(g, id);
  if (no != null) return no;
  final p = g.plot(id);
  if (!hasBug(p, id, now)) return const GardenRefused(GardenError.noBug);
  return GardenDone(g.copyWith(plots: withPlot(g, id, p.copyWith(bug: 1))));
}

/// Nhổ cỏ ở luống [id] (R-VUON-11): cỏ đang mọc → sạch; không có → `no-weed`.
GardenResult pullWeed(Garden g, String id, int now) {
  final no = _careRefuse(g, id);
  if (no != null) return no;
  final p = g.plot(id);
  if (weedsOf(p, id, now) == 0) return const GardenRefused(GardenError.noWeed);
  return GardenDone(g.copyWith(plots: withPlot(g, id, p.copyWith(weed: 1))));
}

/// Bón phân luống [id] (R-VUON-12): cây chưa chín, chưa bón ở lần gieo này → thời gian còn lại giảm một nửa, túi −1 bao.
/// Đã bón / đã chín → `fert-done`; hết phân → `no-fert`.
GardenResult fertilize(Garden g, String id, int now) {
  final no = _careRefuse(g, id);
  if (no != null) return no;
  final p = g.plot(id);
  if (p.boost > 0 || remainingMs(p, now) <= 0) return const GardenRefused(GardenError.fertDone);
  if (g.fert <= 0) return const GardenRefused(GardenError.noFert);
  final boost = fertBoost(remainingMs(p, now));
  return GardenDone(g.copyWith(plots: withPlot(g, id, p.copyWith(boost: boost > 0 ? boost : 1)), fert: g.fert - 1));
}

/// Mua [count] bao phân (× 1 · × 5 · × 10) ở Tạp hoá với số dư [balance] (R-VUON-12, R-TIEN-4): 10 Văn / bao.
GardenResult buyFert(Garden g, int balance, {int count = 1}) {
  if (!fertCounts.contains(count)) return const GardenRefused(GardenError.bad);
  final price = fertPrice * count;
  if (balance < price) return GardenRefused(GardenError.short, short: price - balance);
  return GardenDone(g.copyWith(fert: g.fert + count), amount: -price);
}
