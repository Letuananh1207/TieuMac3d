import 'package:flutter/material.dart';

import '../journey/wallet.dart';
import '../scene/shop_event.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'coin.dart';
import 'screen_parts.dart';
import 'shop_parts.dart';

/// Hộp xác nhận mua (tấm đáy như Danh mục sách): hình 76 + câu hỏi + bảng Đang có / Giá / Còn lại + "Thôi" / "Mua · n".
class ShopConfirm extends StatelessWidget {
  const ShopConfirm({super.key, required this.item, required this.balance, required this.onCancel, required this.onBuy});

  final ShopItem item;
  final int balance;
  final VoidCallback onCancel;
  final VoidCallback onBuy;

  @override
  Widget build(BuildContext context) {
    final row = uiText.copyWith(fontSize: AppTextSize.detail, fontFeatures: const [FontFeature.tabularFigures()]);
    final bold = row.copyWith(fontWeight: FontWeight.w700);
    TableRow line(String k, String v, {Color? color, bool top = false}) {
      final pad = EdgeInsets.only(top: top ? 4 : 0, bottom: 4);
      final deco = top ? BoxDecoration(border: Border(top: BorderSide(color: AppColors.slate.withValues(alpha: .15)))) : null;
      return TableRow(decoration: deco, children: [
        Padding(padding: pad, child: Text(k, style: row)),
        Padding(padding: pad, child: Text(v, textAlign: TextAlign.right, style: bold.copyWith(color: color))),
      ]);
    }

    return Semantics(
      label: 'Xác nhận mua ${item.name}',
      scopesRoute: true,
      explicitChildNodes: true,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.frostLabel,
          border: Border.all(color: AppColors.frostOutline),
          borderRadius: BorderRadius.circular(16),
          boxShadow: const [BoxShadow(color: AppColors.cardShadow, offset: Offset(0, -6), blurRadius: 24)],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                SizedBox(width: 76, child: ItemPicture(item: item, height: 76, han: false, radius: 12)),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text.rich(
                        TextSpan(children: [
                          TextSpan(text: 'Mua ${item.name} '), // shopConfirm
                          TextSpan(text: item.han, style: hanText),
                          TextSpan(text: ' với ${formatCoins(item.price)} Văn tiền?'),
                        ]),
                        style: uiText.copyWith(fontSize: AppTextSize.task, fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Đặt ở ô ${item.slot.label} · mua một lần, đặt được nhiều ô', // shopConfirmSub
                        style: uiText.copyWith(fontSize: AppTextSize.small, color: AppColors.slateMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Table(
              columnWidths: const {0: FlexColumnWidth(), 1: IntrinsicColumnWidth()},
              children: [
                line('Đang có', formatCoins(balance)), // shopHave
                line('Giá', '−${formatCoins(item.price)}', color: AppColors.lacquer), // shopPrice
                line('Còn lại', formatCoins(balance - item.price), top: true), // shopAfter
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                SecondaryButton(label: 'Thôi', onPressed: onCancel, wide: false), // shopCancel
                const SizedBox(width: 10),
                Expanded(child: _BuyButton(price: item.price, onPressed: onBuy)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// "Mua · n" nền `jade`, xu 20, bóng nút chính.
class _BuyButton extends StatelessWidget {
  const _BuyButton({required this.price, required this.onPressed});

  final int price;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) => DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [BoxShadow(color: AppColors.primaryShadow, offset: Offset(0, 4), blurRadius: 12)],
        ),
        child: FilledButton(
          onPressed: onPressed,
          style: FilledButton.styleFrom(
            minimumSize: const Size.fromHeight(52),
            backgroundColor: AppColors.jade,
            foregroundColor: AppColors.onJade,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            textStyle: uiText.copyWith(fontSize: AppTextSize.body, fontWeight: FontWeight.w700),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [const Coin(size: 20), const SizedBox(width: 8), Text('Mua · ${formatCoins(price)}')], // shopBuyFor
          ),
        ),
      );
}
