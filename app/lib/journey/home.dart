/// Nhà của ta (R-NHA-2, R-NHA-3, R-NHA-4 — V-69 trang trí tự do): một món đã đặt, kiểm danh sách món trước khi lưu
/// (số món mỗi vật ≤ số cái sở hữu), chuyển dữ liệu sở hữu từ bản có ô. Thuần Dart, không lưu (lưu: `progress_store.dart`).
/// Toạ độ / chỗ hợp lệ do trang kiểm (R-NHA-7, `web/src/zones/decorPlace.ts`); Flutter chỉ giữ bất biến số cái.
library;

import 'wallet.dart' show starterDecor;

/// Trần món gửi qua `setHome` (sân 40 + gian trong 20 — docs/bridge.md).
const maxHomeItems = 60;

/// Một món đặt ở nhà: vật, cảnh, tâm (m, bội 0,5), hướng (độ, bội 45).
class PlacedDecor {
  const PlacedDecor({required this.item, required this.scene, required this.x, required this.z, required this.rot});

  final String item;
  final String scene;
  final double x;
  final double z;
  final int rot;

  /// Đọc một món từ JSON (`setHome` / khoá `nha.do`); sai dạng → `null`.
  static PlacedDecor? fromJson(Object? j) {
    if (j is! Map) return null;
    final item = j['item'];
    final scene = j['scene'];
    final x = j['x'];
    final z = j['z'];
    final rot = j['rot'];
    if (item is! String || item.isEmpty || scene is! String || scene.isEmpty) return null;
    if (x is! num || z is! num || rot is! num || !x.isFinite || !z.isFinite) return null;
    final r = rot.round();
    if (r % 45 != 0) return null;
    return PlacedDecor(item: item, scene: scene, x: x.toDouble(), z: z.toDouble(), rot: ((r % 360) + 360) % 360);
  }

  Map<String, Object> toJson() => {'item': item, 'scene': scene, 'x': _num(x), 'z': _num(z), 'rot': rot};

  static num _num(double v) => v == v.roundToDouble() ? v.round() : v;

  @override
  bool operator ==(Object other) =>
      other is PlacedDecor && other.item == item && other.scene == scene && other.x == x && other.z == z && other.rot == rot;

  @override
  int get hashCode => Object.hash(item, scene, x, z, rot);

  @override
  String toString() => 'PlacedDecor($item, $scene, $x, $z, $rot)';
}

/// Số món đang đặt của mỗi vật (mọi cảnh).
Map<String, int> placedCounts(Iterable<PlacedDecor> items) {
  final out = <String, int>{};
  for (final i in items) {
    out[i.item] = (out[i.item] ?? 0) + 1;
  }
  return out;
}

/// Danh sách món từ `setHome` (R-NHA-3): đọc được hết, ≤ [maxHomeItems], **mỗi vật số món ≤ số cái [owned]** (R-NHA-4) → danh
/// sách; sai bất kỳ chỗ nào → `null` (không ghi).
List<PlacedDecor>? checkHomeItems(Object? raw, Map<String, int> owned) {
  if (raw is! List || raw.length > maxHomeItems) return null;
  final items = <PlacedDecor>[];
  for (final j in raw) {
    final p = PlacedDecor.fromJson(j);
    if (p == null) return null;
    items.add(p);
  }
  for (final e in placedCounts(items).entries) {
    if (e.value > (owned[e.key] ?? 0)) return null;
  }
  return items;
}

/// Số cái mỗi vật khi lên bản trang trí tự do (R-NHA-4, V-69): mỗi vật đã sở hữu ([oldOwned], khoá `nha.so-huu`) = 1 cái; vật
/// đang đặt ở nhiều ô cũ ([oldPlaced] = vật của từng ô) → số cái = số ô (tặng thêm để không mất đồ). Chưa có [oldOwned] (mới
/// cài / bản trước Văn tiền) → 3 vật khởi đầu 1 cái + vật đang đặt theo số ô.
Map<String, int> migrateOwnedCounts(List<String>? oldOwned, Iterable<String> oldPlaced) {
  final out = <String, int>{for (final id in oldOwned ?? starterDecor) id: 1};
  final perItem = <String, int>{};
  for (final id in oldPlaced) {
    if (id.isNotEmpty) perItem[id] = (perItem[id] ?? 0) + 1;
  }
  for (final e in perItem.entries) {
    if (e.value > (out[e.key] ?? 0)) out[e.key] = e.value;
  }
  return out;
}
