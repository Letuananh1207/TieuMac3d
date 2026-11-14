import 'package:flutter/material.dart';

import '../journey/wallet.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'coin.dart';
import 'screen_parts.dart';

/// Ví Văn tiền (thiết kế 2026-11-14.12, artboard `VanTien-vi-trang-thai`): viên kính .86 cao 36, đồng xu 26 + số 15/700
/// số đều, ngăn nghìn bằng dấu cách (R-TIEN-1). Dùng ở đầu Tạp hoá và làm **ví tạm** trên màn Flutter khi nhận thưởng.
///
/// Trạng thái: thường · số lớn (viên giãn ngang) · **vừa cộng** ([delta] > 0: viền `jade` 2 + quầng, số đếm lên 0,6 s,
/// viên "+n" `jade` dưới ví) · **vừa trừ** ([delta] < 0: viền + viên "−n" `lacquer`, đếm xuống 0,4 s) · 0 (vẫn hiện).
class WalletChip extends StatelessWidget {
  const WalletChip({super.key, required this.balance, this.delta = 0, this.showTag = true, this.onTap, this.bump = 1});

  final int balance;

  /// khoản vừa đổi: > 0 vừa cộng, < 0 vừa trừ, 0 thường
  final int delta;

  /// hiện viên "+n" / "−n" dưới ví (ví tạm trên màn Flutter tắt — nhãn lý do đã ghi số)
  final bool showTag;

  /// tỉ lệ nảy khi xu chạm ví (1 → 1,08)
  final double bump;

  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final accent = delta > 0 ? AppColors.jade : delta < 0 ? AppColors.lacquer : null;
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final count = Duration(milliseconds: reduce ? 0 : (delta < 0 ? 400 : 600));
    final pill = Container(
      height: AppSize.wallet,
      padding: const EdgeInsets.fromLTRB(5, 0, 12, 0),
      decoration: ShapeDecoration(
        color: AppColors.frostStrong,
        shape: StadiumBorder(side: BorderSide(color: accent ?? AppColors.frostOutline, width: accent == null ? 1 : 2)),
        shadows: [
          if (accent != null) BoxShadow(color: accent.withValues(alpha: .18), spreadRadius: 5),
          const BoxShadow(color: AppColors.hudShadow, offset: Offset(0, 4), blurRadius: 14),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Coin(size: AppSize.walletCoin),
          const SizedBox(width: 7),
          // số đếm lên / xuống từ số cũ (balance − delta) tới số mới
          TweenAnimationBuilder<double>(
            key: ValueKey('$balance/$delta'),
            tween: Tween(begin: (balance - delta).toDouble(), end: balance.toDouble()),
            duration: count,
            builder: (_, v, _) => Text(
              formatCoins(v.round()),
              softWrap: false,
              style: uiText.copyWith(fontSize: AppTextSize.body, fontWeight: FontWeight.w700, fontFeatures: const [FontFeature.tabularFigures()]),
            ),
          ),
        ],
      ),
    );
    return Semantics(
      button: onTap != null,
      label: 'Văn tiền: ${formatCoins(balance)}', // walletLabel
      child: ExcludeSemantics(
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: onTap,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              AnimatedScale(scale: bump, duration: const Duration(milliseconds: 90), child: pill),
              if (accent != null && showTag)
                Positioned(right: 4, top: AppSize.wallet + 6, child: DeltaTag(delta: delta)),
            ],
          ),
        ),
      ),
    );
  }
}

/// Viên "+n" (`jade`) / "−n" (`lacquer`) cao 22, chữ trắng 12/700 dưới ví — hiện 1,5 s rồi mờ (người gọi lo thời gian).
class DeltaTag extends StatelessWidget {
  const DeltaTag({super.key, required this.delta});

  final int delta;

  @override
  Widget build(BuildContext context) => Container(
        height: 22,
        padding: const EdgeInsets.symmetric(horizontal: 9),
        alignment: Alignment.center,
        decoration: ShapeDecoration(color: delta > 0 ? AppColors.jade : AppColors.lacquer, shape: const StadiumBorder()),
        child: Text(
          '${delta > 0 ? '+' : '−'}${formatCoins(delta.abs())}',
          softWrap: false,
          style: uiText.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700, color: AppColors.onJade),
        ),
      );
}
