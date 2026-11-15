import 'package:flutter/material.dart';

import '../journey/garden.dart' show seedCounts;
import '../journey/wallet.dart';
import '../scene/shop_event.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'coin.dart';
import 'reward_overlay.dart' show paintDashedRRect;
import 'screen_parts.dart';
import 'shop_parts.dart';

/// Hộp xác nhận mua (tấm đáy như Danh mục sách): hình 76 + câu hỏi + bảng Đang có / Giá / Còn lại + "Thôi" / "Mua · n".
/// Hạt giống (R-VUON-9, thiết kế 2026-11-15.29 `CuaHang-hat-xac-nhan-doc`): hàng chọn số hạt × 1 · × 5 · × 10 ([count],
/// [onCount]), giá nhân theo; thiếu cho số đã chọn → nút "Còn thiếu n" nét đứt, Còn lại "—".
class ShopConfirm extends StatelessWidget {
  const ShopConfirm({super.key, required this.item, required this.balance, required this.onCancel, required this.onBuy, this.count = 1, this.inBag = 0, this.onCount});

  final ShopItem item;
  final int balance;
  final VoidCallback onCancel;
  final VoidCallback onBuy;
  final int count;
  final int inBag;
  final ValueChanged<int>? onCount;

  @override
  Widget build(BuildContext context) {
    final seed = item.slot == SlotKind.hat;
    final total = item.price * (seed ? count : 1);
    final short = total > balance ? total - balance : 0;
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
                SizedBox(width: 76, child: ItemPicture(item: item, height: 76, radius: 12)),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text.rich(
                        TextSpan(children: [
                          TextSpan(text: 'Mua ${item.name}'), // shopConfirm / shopSeedConfirm
                          TextSpan(text: seed ? ' · ${formatCoins(item.price)} Văn tiền / hạt' : ' với ${formatCoins(item.price)} Văn tiền?'),
                        ]),
                        style: uiText.copyWith(fontSize: AppTextSize.task, fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        seed
                            ? 'Hạt vào túi hạt · gieo ở Vườn rau. Trong túi: $inBag.' // shopSeedSub — bỏ "Mỗi lần mua 1 hạt" (chọn số hạt, R-VUON-9)
                            : 'Đặt ở ô ${item.slot.label} · mua một lần, đặt được nhiều ô', // shopConfirmSub
                        style: uiText.copyWith(fontSize: AppTextSize.small, color: AppColors.slateMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (seed) ...[
              const SizedBox(height: 14),
              Text('Số hạt', style: uiText.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700, color: AppColors.slateMuted)), // shopQty
              const SizedBox(height: 6),
              _QtyRow(count: count, onCount: onCount),
            ],
            const SizedBox(height: 14),
            Table(
              columnWidths: const {0: FlexColumnWidth(), 1: IntrinsicColumnWidth()},
              children: [
                line('Đang có', formatCoins(balance)), // shopHave
                line(seed ? 'Giá ($count hạt)' : 'Giá', '−${formatCoins(total)}', color: AppColors.lacquer), // shopPrice
                line('Còn lại', short > 0 ? '—' : formatCoins(balance - total), top: true), // shopAfter
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                SecondaryButton(label: 'Thôi', onPressed: onCancel, wide: false), // shopCancel
                const SizedBox(width: 10),
                Expanded(child: short > 0 ? _ShortButton(short: short) : _BuyButton(price: total, onPressed: onBuy)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Chọn số hạt × 1 · × 5 · × 10 (viên cao 36; đang chọn nền `slate` chữ trắng) — R-VUON-9.
class _QtyRow extends StatelessWidget {
  const _QtyRow({required this.count, required this.onCount});

  final int count;
  final ValueChanged<int>? onCount;

  @override
  Widget build(BuildContext context) => Row(
        children: [
          for (final k in seedCounts) ...[
            if (k != seedCounts.first) const SizedBox(width: 8),
            Expanded(
              child: Semantics(
                selected: k == count,
                button: true,
                child: GestureDetector(
                  onTap: onCount == null ? null : () => onCount!(k),
                  child: Container(
                    height: 36,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: k == count ? AppColors.slate : AppColors.onJade,
                      border: Border.all(color: k == count ? AppColors.slate : AppColors.slate.withValues(alpha: .2)),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text('× $k', style: uiText.copyWith(fontSize: AppTextSize.body, fontWeight: FontWeight.w700, color: k == count ? AppColors.onJade : AppColors.slate)),
                  ),
                ),
              ),
            ),
          ],
        ],
      );
}

/// "Còn thiếu n" nét đứt (thiếu tiền cho số hạt đã chọn).
class _ShortButton extends StatelessWidget {
  const _ShortButton({required this.short});

  final int short;

  @override
  Widget build(BuildContext context) => Semantics(
        enabled: false,
        button: true,
        child: CustomPaint(
          painter: _Dashed(),
          child: SizedBox(
            height: 52,
            child: Center(
              child: Text('Còn thiếu ${formatCoins(short)}', style: uiText.copyWith(fontSize: AppTextSize.body, fontWeight: FontWeight.w700, color: AppColors.slateMuted)), // shopShort
            ),
          ),
        ),
      );
}

class _Dashed extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) => paintDashedRRect(canvas, size, AppColors.slate.withValues(alpha: .35), 12);

  @override
  bool shouldRepaint(_Dashed old) => false;
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
