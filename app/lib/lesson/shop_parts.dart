import 'package:flutter/material.dart';

import '../journey/wallet.dart';
import '../scene/shop_event.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'coin.dart';
import 'reward_overlay.dart' show paintDashedRRect;
import 'screen_parts.dart';

/// Phần của màn Tạp hoá (thiết kế 2026-11-14.12, artboard `CuaHang-*`): thẻ vật, hình vật, hộp xác nhận, tấm "vừa mua",
/// dải gợi ý.

/// Trạng thái nút của một thẻ (R-TIEN-4).
enum ItemState { buy, owned, short }

/// Hình vật trên thẻ — **bản vẽ giữ chỗ** (biểu tượng Material theo vật, `slate-muted`); sau thay bằng ảnh chụp vật 3D.
class ItemArt extends StatelessWidget {
  const ItemArt({super.key, required this.item, required this.size});

  final ShopItem item;
  final double size;

  static const _icons = <String, IconData>{
    'truc-canh': Icons.grass,
    'mai': Icons.local_florist,
    'tung': Icons.park,
    'da-thai-ho': Icons.landscape,
    'ao-sen': Icons.water,
    'den-long': Icons.light,
    'ban-tra': Icons.emoji_food_beverage,
    'chau-lan': Icons.spa,
    'lu-huong': Icons.local_fire_department,
    'tranh-chu': Icons.brush,
    'ke-sach': Icons.shelves,
    'an-doc': Icons.menu_book,
    'binh-phong': Icons.view_week,
  };

  @override
  Widget build(BuildContext context) => Icon(
        _icons[item.id] ?? switch (item.slot) { SlotKind.vuon => Icons.park, SlotKind.san => Icons.deck, SlotKind.trong => Icons.chair },
        size: size,
        color: AppColors.slateMuted.withValues(alpha: .75),
      );
}

/// Ô hình nền `map-paper` bo 10 + chữ Hán 16 `jade` góc trên phải.
class ItemPicture extends StatelessWidget {
  const ItemPicture({super.key, required this.item, required this.height, this.han = true, this.radius = 10});

  final ShopItem item;
  final double height;
  final bool han;
  final double radius;

  @override
  Widget build(BuildContext context) => Container(
        height: height,
        decoration: BoxDecoration(color: AppColors.mapPaper, borderRadius: BorderRadius.circular(radius)),
        child: Stack(
          alignment: Alignment.center,
          children: [
            ItemArt(item: item, size: height * .6),
            if (han)
              Positioned(
                right: 6,
                top: 3,
                child: Text(item.han, style: hanText.copyWith(fontSize: AppTextSize.itemHan, height: 1.2)),
              ),
          ],
        ),
      );
}

/// Thẻ vật (bo 14, đệm 8; chưa có: trắng, đã có: trắng 55 %; viền `slate` 14 %; đang chọn: viền ngoài `gold` 3 cách 2).
class ShopCard extends StatelessWidget {
  const ShopCard({super.key, required this.item, required this.state, required this.short, required this.picked, required this.landscape, required this.onBuy});

  final ShopItem item;
  final ItemState state;
  final int short;
  final bool picked;
  final bool landscape;
  final VoidCallback onBuy;

  @override
  Widget build(BuildContext context) {
    final card = Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: state == ItemState.owned ? AppColors.onJade.withValues(alpha: .55) : AppColors.onJade,
        border: Border.all(color: AppColors.slate.withValues(alpha: .14)),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          ItemPicture(item: item, height: landscape ? 50 : 64),
          const SizedBox(height: 4),
          Text(item.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: uiText.copyWith(fontSize: AppTextSize.small, fontWeight: FontWeight.w700, height: 1.25)),
          const SizedBox(height: 4),
          PriceLine(item: item),
          const SizedBox(height: 4),
          _button(),
        ],
      ),
    );
    return Semantics(
      label: '${item.name} ${item.han}, ${item.price} Văn tiền',
      child: picked
          ? DecoratedBox(
              position: DecorationPosition.foreground,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.gold, width: 3, strokeAlign: BorderSide.strokeAlignOutside),
              ),
              child: card,
            )
          : card,
    );
  }

  Widget _button() {
    final label = uiText.copyWith(fontSize: AppTextSize.small, fontWeight: FontWeight.w700);
    switch (state) {
      case ItemState.buy:
        return SizedBox(
          height: 34,
          child: FilledButton(
            onPressed: onBuy,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.jade,
              foregroundColor: AppColors.onJade,
              padding: EdgeInsets.zero,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              textStyle: label,
            ),
            child: const Text('Mua'), // shopBuy
          ),
        );
      case ItemState.owned:
        return Container(
          height: 34,
          decoration: BoxDecoration(color: AppColors.answerRightBg, borderRadius: BorderRadius.circular(10)),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check, size: 16, color: AppColors.jade),
              const SizedBox(width: 5),
              Text('Đã có', style: label.copyWith(color: AppColors.jade)), // shopOwned
            ],
          ),
        );
      case ItemState.short:
        return Semantics(
          enabled: false,
          button: true,
          child: CustomPaint(
            painter: _Dashed(),
            child: SizedBox(
              height: 34,
              child: Center(
                child: Text(
                  'Còn thiếu ${formatCoins(short)}', // shopShort
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: uiText.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700, color: AppColors.slateMuted),
                ),
              ),
            ),
          ),
        );
    }
  }
}

class _Dashed extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) => paintDashedRRect(canvas, size, AppColors.slate.withValues(alpha: .35), 10);

  @override
  bool shouldRepaint(_Dashed old) => false;
}

/// Giá: xu 14 + số 12/700 + số chữ Hán 10 `slate-muted` ("160 · 一百六十文").
class PriceLine extends StatelessWidget {
  const PriceLine({super.key, required this.item});

  final ShopItem item;

  @override
  Widget build(BuildContext context) => Row(
        children: [
          const Coin(size: 14),
          const SizedBox(width: 4),
          Text(formatCoins(item.price), style: uiText.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700, fontFeatures: const [FontFeature.tabularFigures()])),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              item.priceHan,
              maxLines: 1,
              overflow: TextOverflow.clip,
              softWrap: false,
              style: hanText.copyWith(fontSize: AppTextSize.priceHan, color: AppColors.slateMuted),
            ),
          ),
        ],
      );
}

/// Dải gợi ý: nghèo (nền `gold` 14 %, viền `gold`) · đã mua hết (nền `jade` 8 %, viền `jade` 28 %).
class ShopBanner extends StatelessWidget {
  const ShopBanner.poor({super.key}) : allBought = false;
  const ShopBanner.allBought({super.key}) : allBought = true;

  final bool allBought;

  @override
  Widget build(BuildContext context) {
    final base = uiText.copyWith(fontSize: AppTextSize.small, height: 1.45);
    const b = TextStyle(fontWeight: FontWeight.w700);
    final text = allBought
        // shopAllBought
        ? const TextSpan(children: [TextSpan(text: 'Đã có đủ 13 món.', style: b), TextSpan(text: ' Văn tiền để dành cho đồ mới sắp về (đồ mặc, thức ăn linh thú).')])
        // shopPoorHint
        : const TextSpan(children: [
            TextSpan(text: 'Học bộ mới '),
            TextSpan(text: '+10', style: b),
            TextSpan(text: ' · ôn đúng hạn '),
            TextSpan(text: '+5', style: b),
            TextSpan(text: ' · xong nhiệm vụ ngày '),
            TextSpan(text: '+20', style: b),
            TextSpan(text: '.'),
          ]);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: allBought ? AppColors.jade.withValues(alpha: .08) : AppColors.gold.withValues(alpha: .14),
        border: Border.all(color: allBought ? AppColors.jade.withValues(alpha: .28) : AppColors.gold),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          allBought ? const Icon(Icons.check_circle_outline, size: 20, color: AppColors.jade) : const Coin(size: 20),
          const SizedBox(width: 10),
          Expanded(child: Text.rich(text, style: base)),
        ],
      ),
    );
  }
}

/// Tấm "vừa mua" nền `slate` chữ trắng: hình 48 + "Đã mua {vật}" + "Về nhà để đặt — chạm ô {loại} khi trang trí." (3 s).
class BoughtToast extends StatelessWidget {
  const BoughtToast({super.key, required this.item});

  final ShopItem item;

  @override
  Widget build(BuildContext context) {
    final white = uiText.copyWith(fontSize: AppTextSize.detail, color: AppColors.onJade, height: 1.4);
    return Semantics(
      liveRegion: true,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.slate,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [BoxShadow(color: AppColors.slate.withValues(alpha: .35), offset: const Offset(0, 8), blurRadius: 22)],
        ),
        child: Row(
          children: [
            SizedBox(width: 48, child: ItemPicture(item: item, height: 48, han: false)),
            const SizedBox(width: 12),
            Expanded(
              child: Text.rich(
                TextSpan(children: [
                  TextSpan(text: 'Đã mua ${item.name} ', style: const TextStyle(fontWeight: FontWeight.w700)), // shopBought
                  TextSpan(text: item.han, style: hanText.copyWith(color: AppColors.onJade)),
                  const TextSpan(text: '\n'),
                  TextSpan(
                    text: 'Về nhà để đặt — chạm ô ${item.slot.label} khi trang trí.', // shopBoughtSub
                    style: TextStyle(color: AppColors.onJade.withValues(alpha: .85)),
                  ),
                ]),
                style: white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
