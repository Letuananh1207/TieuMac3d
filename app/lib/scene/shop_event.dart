/// Sự kiện Văn tiền qua cầu nối (docs/bridge.md `openShop`, `earnGame`) — R-TIEN-3, R-TIEN-4. Danh mục + giá do trang giữ
/// (`DECOR_ITEMS` ở `web/src/zones/decor.ts` — một nguồn giá); luật tiền ở `journey/wallet.dart`.
library;

/// Nơi đặt của vật (tab Tạp hoá) — cùng chuỗi `DecorWhere` của web (`where` trong `openShop`, V-69).
enum SlotKind {
  ngoai('Ngoài trời'), // shopTabOutdoor
  trong('Trong nhà'), // shopTabIndoor

  /// hạt giống Vườn rau (R-VUON-9) — trang không gửi loại này, Flutter tự thêm từ `garden.dart`
  hat('Hạt giống'); // shopTabSeeds

  const SlotKind(this.label);

  final String label;

  /// `where` của trang (`ngoai` / `trong`); bản trang cũ gửi `slot` (`vuon` / `san` → ngoài trời). `hat` không qua cầu nối.
  static SlotKind? parse(Object? v) => switch (v) {
        'ngoai' || 'vuon' || 'san' => ngoai,
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
  final slot = SlotKind.parse(i['where'] ?? i['slot']);
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

/// Mã bài của `earnGame` `dan-cam` (R-CAM-4); thiếu / sai dạng → `null`.
String? earnGameSong(List<dynamic> args) {
  final s = _payload(args, 'earnGame')?['song'];
  return s is String && s.isNotEmpty ? s : null;
}

/// Trả lời `earnGame` (docs/bridge.md); `songDone` chỉ ghi khi đúng (bài đàn đã thưởng hôm nay).
Map<String, Object?> earnGameReply(({int amount, int balance, int gameToday, bool capped, bool songDone}) r) =>
    {'amount': r.amount, 'balance': r.balance, 'gameToday': r.gameToday, 'capped': r.capped, if (r.songDone) 'songDone': true};

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
