/// Sự kiện vườn rau qua cầu nối (docs/bridge.md `getGarden`, `gardenAct`) — R-VUON-1…9. Luật ở `journey/garden.dart`.
library;

import '../journey/garden.dart';
import 'shop_event.dart';

/// Thao tác `gardenAct`: `act` + luống / cây (tuỳ thao tác). Sai dạng → `null` (trả `bad`).
typedef GardenActArgs = ({String act, String? plot, String? crop, int count});

GardenActArgs? gardenActArgs(List<dynamic> args) {
  if (args.isEmpty) return null;
  final e = args.first;
  if (e is! Map || e['type'] != 'gardenAct') return null;
  final p = e['payload'];
  if (p is! Map) return null;
  final act = p['act'], plot = p['plot'], crop = p['crop'], count = p['count'];
  if (act is! String) return null;
  // `count` (mua hạt × 1 · × 5 · × 10 — R-VUON-9): thiếu → 1; số lạ → luật trả `bad`
  return (act: act, plot: plot is String ? plot : null, crop: crop is String ? crop : null, count: count is num ? count.toInt() : 1);
}

/// Sự kiện `getGarden` (payload rỗng)?
bool isGetGarden(List<dynamic> args) => args.isNotEmpty && args.first is Map && (args.first as Map)['type'] == 'getGarden';

/// Trả lời `getGarden`: vườn + giờ máy (ms).
Map<String, Object?> gardenReply(Garden g, DateTime now) => {'garden': g.toJson(), 'now': now.millisecondsSinceEpoch};

/// Trả lời `gardenAct`: được → vườn mới + số dư + tiền đổi (+ `got`); không → lý do + số dư (+ `short`).
Map<String, Object?> gardenActReply(GardenResult r, int balance) => switch (r) {
      GardenDone(:final garden, :final amount, :final got) => {
          'ok': true,
          'garden': garden.toJson(),
          'balance': balance,
          'amount': amount,
          if (got > 0) 'got': got,
        },
      GardenRefused(:final error, :final short) => {
          'ok': false,
          'reason': error.wire,
          'balance': balance,
          if (short > 0) 'short': short,
        },
    };

/// Thẻ hạt giống ở Tạp hoá (R-VUON-9) — mã `hat-<cây>`, giá 1 hạt.
const seedItemPrefix = 'hat-';

List<ShopItem> seedShopItems() => [for (final c in crops) ShopItem(id: '$seedItemPrefix${c.id}', name: 'Hạt ${c.name}', slot: SlotKind.hat, price: c.seed)];

/// Mã cây của thẻ hạt; thẻ khác → `null`.
String? seedCrop(ShopItem i) => i.slot == SlotKind.hat && i.id.startsWith(seedItemPrefix) ? i.id.substring(seedItemPrefix.length) : null;
