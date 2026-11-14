/// Sự kiện Văn tiền qua cầu nối (docs/bridge.md `openShop`, `earnGame`) — R-TIEN-3, R-TIEN-4. Danh mục + giá do trang giữ
/// (`DECOR_ITEMS` ở `web/src/zones/decor.ts` — một nguồn giá); luật tiền ở `journey/wallet.dart`.
library;

/// Loại ô của vật — cùng chuỗi `DecorSlotKind` của web.
enum SlotKind {
  vuon('Vườn'), // slotGarden
  san('Sân'), // slotYard
  trong('Trong nhà'); // slotIndoor

  const SlotKind(this.label);

  final String label;

  static SlotKind? parse(Object? v) => switch (v) {
        'vuon' => vuon,
        'san' => san,
        'trong' => trong,
        _ => null,
      };
}

/// Một vật bày bán ở Tạp hoá.
class ShopItem {
  const ShopItem({required this.id, required this.name, required this.slot, required this.price});

  final String id;

  /// tên Việt (không kèm chữ Hán — R-HUD-4)
  final String name;
  final SlotKind slot;
  final int price;
}

/// JS nhờ mở Tạp hoá (nút "Vào tiệm" — R-TIEN-6).
class OpenShopRequest {
  const OpenShopRequest({required this.items});

  final List<ShopItem> items;

  /// Sai dạng / loại khác / không có vật nào hợp lệ → `null`. Vật sai dạng hoặc giá ≤ 0 → bỏ qua.
  static OpenShopRequest? parse(List<dynamic> args) {
    final p = _payload(args, 'openShop');
    final list = p?['items'];
    if (list is! List) return null;
    final items = [for (final i in list) ?_item(i)];
    return items.isEmpty ? null : OpenShopRequest(items: items);
  }
}

ShopItem? _item(Object? i) {
  if (i is! Map) return null;
  final id = i['id'], name = i['name'], price = i['price'];
  final slot = SlotKind.parse(i['slot']);
  if (id is! String || id.isEmpty || name is! String || price is! num || price <= 0 || slot == null) return null;
  return ShopItem(id: id, name: name, slot: slot, price: price.toInt());
}

/// Trò + kết quả của sự kiện `earnGame`; sai dạng → `null` (luật thưởng tự trả 0 cho trò / kết quả lạ).
({String game, String outcome})? earnGameArgs(List<dynamic> args) {
  final p = _payload(args, 'earnGame');
  final game = p?['game'], outcome = p?['outcome'];
  if (game is! String || outcome is! String) return null;
  return (game: game, outcome: outcome);
}

/// Trả lời `earnGame` (docs/bridge.md).
Map<String, Object?> earnGameReply(({int amount, int balance, int gameToday, bool capped}) r) =>
    {'amount': r.amount, 'balance': r.balance, 'gameToday': r.gameToday, 'capped': r.capped};

/// Trả lời `giveAlms` (docs/bridge.md, R-TIEN-8): được → số dư + bản ghi mới; không → lý do (`given` / `short`) + số dư.
Map<String, Object?> giveAlmsReply(({bool ok, String? reason, int balance, ({int lastDay, int count}) alms}) r) => r.ok
    ? {'ok': true, 'balance': r.balance, 'alms': {'lastDay': r.alms.lastDay, 'count': r.alms.count}}
    : {'ok': false, 'reason': r.reason, 'balance': r.balance};

/// Sự kiện `giveAlms` (payload rỗng)?
bool isGiveAlms(List<dynamic> args) => args.isNotEmpty && args.first is Map && (args.first as Map)['type'] == 'giveAlms';

Map<dynamic, dynamic>? _payload(List<dynamic> args, String type) {
  if (args.isEmpty) return null;
  final e = args.first;
  if (e is! Map || e['type'] != type) return null;
  final p = e['payload'];
  return p is Map ? p : null;
}
