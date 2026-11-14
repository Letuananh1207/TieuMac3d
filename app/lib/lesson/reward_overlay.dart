import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../journey/wallet.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'coin.dart';
import 'screen_parts.dart';
import 'wallet_chip.dart';

/// Hiệu ứng nhận tiền trên màn Flutter (R-TIEN-5, thiết kế 2026-11-14.12 artboard `VanTien-hieu-ung`): màn che HUD → một
/// **ví tạm** trượt vào góc trên phải (0,2 s); mỗi khoản: 1 xu / 5 Văn tiền (tối đa 5) bay cong từ [from] vào ví 0,6 s,
/// cách nhau 0,06 s, xoay, ví nảy 1,08× mỗi xu chạm; rồi nhãn lý do dưới ví (giữ 1,2 s, mờ 0,3 s); nhiều khoản nối hàng;
/// xong ví mờ đi. Giảm chuyển động → không bay, chỉ đếm số + nhãn. Không chặn bấm ([IgnorePointer]).
///
/// Số dư đã cộng sẵn trong kho — đây chỉ là hiệu ứng.
Future<void> showRewards(BuildContext context, List<Reward> rewards, {required int balance, Offset? from}) async {
  if (rewards.isEmpty) return;
  final overlay = Overlay.maybeOf(context, rootOverlay: true);
  if (overlay == null) return;
  late final OverlayEntry entry;
  entry = OverlayEntry(
    builder: (_) => RewardOverlay(rewards: rewards, balance: balance, from: from, onDone: () => entry.remove()),
  );
  overlay.insert(entry);
}

class RewardOverlay extends StatefulWidget {
  const RewardOverlay({super.key, required this.rewards, required this.balance, this.from, this.onDone});

  final List<Reward> rewards;

  /// số dư **sau** khi đã cộng mọi khoản
  final int balance;

  /// điểm xu bật ra (toạ độ trong lớp phủ, vd. giữa nút vừa bấm); `null` → giữa, 3/4 chiều cao màn
  final Offset? from;
  final VoidCallback? onDone;

  /// ví tạm: dọc phải 16 / trên safe + 10; ngang phải safe + 12 / trên 12 (như ví HUD)
  static EdgeInsets walletInsets(MediaQueryData mq) {
    final landscape = mq.size.width > mq.size.height;
    return landscape
        ? EdgeInsets.only(right: mq.viewPadding.right + 12, top: 12)
        : EdgeInsets.only(right: 16, top: mq.viewPadding.top + 10);
  }

  @override
  State<RewardOverlay> createState() => _RewardOverlayState();
}

class _RewardOverlayState extends State<RewardOverlay> with TickerProviderStateMixin {
  static const _flight = 600, _gap = 60;

  late final _enter = AnimationController(vsync: this, duration: const Duration(milliseconds: 200));
  late final _fly = AnimationController(vsync: this);
  late final _label = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500));

  int _index = -1;
  bool _labelOn = false;
  int _shown = 0;
  int _delta = 0;

  Reward? get _reward => _index >= 0 && _index < widget.rewards.length ? widget.rewards[_index] : null;

  @override
  void initState() {
    super.initState();
    _shown = widget.balance - widget.rewards.fold(0, (a, r) => a + r.amount);
    WidgetsBinding.instance.addPostFrameCallback((_) => _run());
  }

  Future<void> _run() async {
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    await _enter.forward();
    for (var i = 0; i < widget.rewards.length; i++) {
      if (!mounted) return;
      final r = widget.rewards[i];
      final n = reduce ? 0 : coinsToFly(r.amount);
      setState(() {
        _index = i;
        _labelOn = false;
      });
      if (n > 0) {
        _fly.duration = Duration(milliseconds: _flight + _gap * (n - 1));
        await _fly.forward(from: 0);
        if (!mounted) return;
      }
      setState(() {
        _labelOn = true;
        _shown += r.amount;
        _delta = r.amount;
      });
      await _label.forward(from: 0);
    }
    if (!mounted) return;
    setState(() => _labelOn = false);
    await _enter.reverse();
    widget.onDone?.call();
  }

  @override
  void dispose() {
    _enter.dispose();
    _fly.dispose();
    _label.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    final inset = RewardOverlay.walletInsets(mq);
    final reduce = mq.disableAnimations;
    return IgnorePointer(
      child: LayoutBuilder(builder: (context, box) {
        final target = Offset(box.maxWidth - inset.right - 34, inset.top + AppSize.wallet / 2);
        final from = widget.from ?? Offset(box.maxWidth / 2, box.maxHeight * .75);
        final r = _reward;
        final n = r == null || reduce || _labelOn ? 0 : coinsToFly(r.amount);
        return AnimatedBuilder(
          animation: Listenable.merge([_enter, _fly, _label]),
          builder: (context, _) {
            final elapsed = _fly.value * (_flight + _gap * math.max(0, n - 1));
            // ví nảy khi một xu vừa chạm (trong 90 ms sau lúc tới)
            final bump = [for (var j = 0; j < n; j++) elapsed - (_gap * j + _flight)].any((d) => d >= 0 && d < 90) ? 1.08 : 1.0;
            final labelOpacity = _labelOn ? _fade(_label.value) : 0.0;
            return Stack(
              children: [
                Positioned(
                  right: inset.right,
                  top: inset.top,
                  child: FadeTransition(
                    opacity: _enter,
                    child: SlideTransition(
                      position: Tween(begin: const Offset(.4, 0), end: Offset.zero).animate(_enter),
                      child: WalletChip(balance: _shown, delta: _labelOn ? _delta : 0, showTag: false, bump: bump),
                    ),
                  ),
                ),
                if (r != null && _labelOn)
                  Positioned(
                    right: inset.right,
                    top: inset.top + AppSize.wallet + 8,
                    child: Opacity(opacity: labelOpacity, child: RewardLabel(reward: r)),
                  ),
                for (var j = 0; j < n; j++) _coin(r!, j, elapsed, from, target),
              ],
            );
          },
        );
      }),
    );
  }

  /// Nhãn hiện nhanh 0,1 s, giữ 1,2 s, mờ 0,3 s.
  static double _fade(double t) => t < .07 ? t / .07 : t > .8 ? (1 - t) / .2 : 1;

  Widget _coin(Reward r, int j, double elapsed, Offset from, Offset to) {
    final p = ((elapsed - _gap * j) / _flight).clamp(0.0, 1.0);
    if (p <= 0 || p >= 1) return const SizedBox.shrink();
    final e = Curves.easeInOut.transform(p);
    // đường cong bậc hai: điểm kiểm soát lệch lên trên, phía nguồn
    final ctrl = Offset(from.dx + (to.dx - from.dx) * .2, math.min(from.dy, to.dy) - 40);
    final pos = Offset.lerp(Offset.lerp(from, ctrl, e)!, Offset.lerp(ctrl, to, e)!, e)!;
    const size = 30.0;
    return Positioned(
      key: ValueKey('xu-bay-$j'),
      left: pos.dx - size / 2,
      top: pos.dy - size / 2,
      child: Transform.rotate(angle: e * math.pi * 2, child: Coin(size: size, char: r.char)),
    );
  }
}

/// Nhãn lý do "+10 · Học bộ 竹": viên kính .94 cao 28, viền ngoài `jade` 35 %, xu 20 + chữ 13/700. Đủ trần trò chơi:
/// viền nét đứt, chữ `slate-muted`, không xu.
class RewardLabel extends StatelessWidget {
  const RewardLabel({super.key, required this.reward});

  final Reward reward;

  @override
  Widget build(BuildContext context) {
    final capped = reward.kind == RewardKind.gameCapped;
    final text = Text(
      rewardLabel(reward),
      softWrap: false,
      style: uiText.copyWith(fontSize: AppTextSize.small, fontWeight: FontWeight.w700, color: capped ? AppColors.slateMuted : AppColors.slate),
    );
    if (capped) {
      return CustomPaint(
        painter: _DashedStadium(AppColors.slate.withValues(alpha: .3)),
        child: Container(height: 28, padding: const EdgeInsets.symmetric(horizontal: 12), alignment: Alignment.center, child: text),
      );
    }
    return Container(
      height: 28,
      padding: const EdgeInsets.fromLTRB(6, 0, 12, 0),
      decoration: ShapeDecoration(
        color: AppColors.frostLabel,
        shape: StadiumBorder(side: BorderSide(color: AppColors.jade.withValues(alpha: .35))),
        shadows: const [BoxShadow(color: AppColors.hudShadow, offset: Offset(0, 4), blurRadius: 14)],
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [const Coin(size: 20), const SizedBox(width: 6), text]),
    );
  }
}

/// Viền nét đứt quanh viên bo tròn (nhãn đủ thưởng; nút "Còn thiếu" ở Tạp hoá dùng bo 10 — [radius]).
class _DashedStadium extends CustomPainter {
  _DashedStadium(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) => paintDashedRRect(canvas, size, color, size.height / 2);

  @override
  bool shouldRepaint(_DashedStadium old) => old.color != color;
}

/// Vẽ viền nét đứt (4 / 3) quanh hình chữ nhật bo [radius], nền trong suốt.
void paintDashedRRect(Canvas canvas, Size size, Color color, double radius) {
  final path = Path()..addRRect(RRect.fromRectAndRadius(Offset.zero & size, Radius.circular(radius)).deflate(.5));
  final paint = Paint()
    ..color = color
    ..style = PaintingStyle.stroke
    ..strokeWidth = 1;
  for (final m in path.computeMetrics()) {
    for (var d = 0.0; d < m.length; d += 7) {
      canvas.drawPath(m.extractPath(d, math.min(d + 4, m.length)), paint);
    }
  }
}
