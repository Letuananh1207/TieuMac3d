import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_fonts.g.dart';
import '../theme/app_text_size.dart';
import 'screen_parts.dart';

/// Phần của cuộn treo (掛軸) bảng chọn Ngồi ôn — thiết kế design/docs/screen_specs.md "Ngồi ôn" (2026-11-14.10).

/// Trục gỗ trên / dưới: rộng hơn giấy 10 mỗi bên, đầu trục ngọc viền vàng nhô ra 14 (ngang 12).
class ScrollRod extends StatelessWidget {
  const ScrollRod({super.key, required this.landscape});

  final bool landscape;

  @override
  Widget build(BuildContext context) {
    final h = landscape ? 12.0 : 14.0;
    final knob = landscape ? 16.0 : 18.0;
    final out = landscape ? 12.0 : 14.0;
    Widget end() => Container(
          width: knob,
          height: knob,
          decoration: BoxDecoration(
            color: AppColors.jade,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.gold, width: 2),
          ),
        );
    return SizedBox(
      height: h,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            left: -10,
            right: -10,
            top: 0,
            bottom: 0,
            child: DecoratedBox(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(h / 2),
                gradient: const LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [AppColors.scrollWoodLight, AppColors.scrollWood, AppColors.scrollWoodDark],
                  stops: [0, .6, 1],
                ),
                boxShadow: [BoxShadow(color: AppColors.scrollWoodDark.withValues(alpha: .35), offset: const Offset(0, 2), blurRadius: 4)],
              ),
            ),
          ),
          Positioned(left: -10 - out, top: (h - knob) / 2, child: end()),
          Positioned(right: -10 - out, top: (h - knob) / 2, child: end()),
        ],
      ),
    );
  }
}

/// Giấy `map-paper` với viền bồi lụa (5 ngọc 12 % trên 6 gỗ 18 %), bóng cả cuộn.
class ScrollPaper extends StatelessWidget {
  const ScrollPaper({super.key, required this.padding, required this.child});

  final EdgeInsets padding;
  final Widget child;

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.symmetric(horizontal: 2),
        foregroundDecoration: BoxDecoration(border: Border.all(color: AppColors.jade.withValues(alpha: .12), width: 5)),
        decoration: BoxDecoration(
          color: AppColors.mapPaper,
          boxShadow: [BoxShadow(color: AppColors.slate.withValues(alpha: .32), offset: const Offset(0, 10), blurRadius: 24)],
        ),
        child: Container(
          foregroundDecoration: BoxDecoration(border: Border.all(color: AppColors.scrollWood.withValues(alpha: .18), width: 6)),
          padding: padding,
          child: child,
        ),
      );
}

/// Ấn son 溫故 chữ dọc ("Ôn cũ biết mới").
class StudySeal extends StatelessWidget {
  const StudySeal({super.key});

  @override
  Widget build(BuildContext context) => Semantics(
        label: 'Ôn cũ biết mới', // reviewScrollSeal
        excludeSemantics: true,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 6),
          decoration: BoxDecoration(color: AppColors.lacquer, borderRadius: BorderRadius.circular(4)),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final c in const ['溫', '故'])
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 1),
                  child: Text(c, style: hanText.copyWith(fontSize: AppTextSize.studySeal, height: 1, color: AppColors.onJade)),
                ),
            ],
          ),
        ),
      );
}

/// Vạch chấm vàng dưới đầu cuộn (như thẻ bộ thủ).
class GoldDotRule extends StatelessWidget {
  const GoldDotRule({super.key});

  @override
  Widget build(BuildContext context) {
    final line = Expanded(child: Container(height: 1, color: AppColors.scrollWood.withValues(alpha: .22)));
    return Row(children: [line, const SizedBox(width: 8), const GoldDot(), const SizedBox(width: 8), line]);
  }
}

class GoldDot extends StatelessWidget {
  const GoldDot({super.key});

  @override
  Widget build(BuildContext context) =>
      Container(width: 5, height: 5, decoration: const BoxDecoration(color: AppColors.gold, shape: BoxShape.circle));
}

/// Cách hiện một mục: nổi bật (nền ngọc) · thường · mờ (viền nét đứt, dòng lý do).
enum OptionLook { highlight, normal, disabled }

/// Một mục của bảng chọn: vòng biểu tượng + tiêu đề + dòng phụ (+ mũi tên khi dùng được).
/// Mục mờ: [reasonIcon] trước dòng lý do, không mũi tên, không bấm được.
class StudyOption extends StatelessWidget {
  const StudyOption({
    super.key,
    required this.look,
    required this.icon,
    required this.title,
    required this.sub,
    this.reasonIcon,
    this.reasonIconColor,
    required this.landscape,
    this.onTap,
  });

  final OptionLook look;
  final IconData icon;
  final String title;

  /// dòng phụ (có thể chứa chữ Hán — [TextSpan] riêng)
  final InlineSpan sub;
  final IconData? reasonIcon;
  final Color? reasonIconColor;
  final bool landscape;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final hi = look == OptionLook.highlight;
    final off = look == OptionLook.disabled;
    final fg = hi ? AppColors.onJade : (off ? AppColors.slateMuted : AppColors.slate);
    final subColor = hi ? AppColors.onJade.withValues(alpha: .88) : AppColors.slateMuted;
    final ring = landscape ? 30.0 : 36.0;
    final radius = BorderRadius.circular(12);
    final subStyle = uiText.copyWith(fontSize: landscape ? AppTextSize.caption : AppTextSize.small, color: subColor);
    final subLine = off
        ? Row(children: [
            if (reasonIcon != null) ...[Icon(reasonIcon, size: 14, color: reasonIconColor ?? AppColors.slateMuted), const SizedBox(width: 5)],
            Flexible(child: Text.rich(sub, style: subStyle)),
          ])
        : Text.rich(sub, style: subStyle, maxLines: 1, overflow: TextOverflow.ellipsis);
    final body = ConstrainedBox(
      constraints: BoxConstraints(minHeight: landscape ? 52 : 68),
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 12, vertical: landscape ? 7 : 10),
        child: Row(
          children: [
            Container(
              width: ring,
              height: ring,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: hi
                    ? AppColors.onJade.withValues(alpha: .16)
                    : (off ? AppColors.slate.withValues(alpha: .06) : AppColors.jade.withValues(alpha: .10)),
              ),
              child: Icon(icon, size: landscape ? 18 : 20, color: hi ? AppColors.onJade : (off ? AppColors.slateMuted : AppColors.jade)),
            ),
            SizedBox(width: landscape ? 10 : 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(title, style: uiText.copyWith(fontSize: landscape ? AppTextSize.detail : AppTextSize.task, fontWeight: FontWeight.w700, color: fg)),
                  const SizedBox(height: 2),
                  subLine,
                ],
              ),
            ),
            if (!off) ...[const SizedBox(width: 8), Icon(Icons.chevron_right, size: 18, color: fg)],
          ],
        ),
      ),
    );
    final decorated = switch (look) {
      OptionLook.highlight => DecoratedBox(
          decoration: BoxDecoration(
            color: AppColors.jade,
            borderRadius: radius,
            border: Border.all(color: AppColors.onJade.withValues(alpha: .5)),
            boxShadow: const [BoxShadow(color: AppColors.primaryShadow, offset: Offset(0, 4), blurRadius: 12)],
          ),
          child: body,
        ),
      OptionLook.normal => DecoratedBox(
          decoration: BoxDecoration(
            color: AppColors.onJade.withValues(alpha: .72),
            borderRadius: radius,
            border: Border.all(color: AppColors.scrollWood.withValues(alpha: .22)),
          ),
          child: body,
        ),
      OptionLook.disabled => CustomPaint(
          foregroundPainter: _DashedBorder(AppColors.scrollWood.withValues(alpha: .3)),
          child: DecoratedBox(
            decoration: BoxDecoration(color: AppColors.onJade.withValues(alpha: .3), borderRadius: radius),
            child: body,
          ),
        ),
    };
    return Semantics(
      button: true,
      enabled: !off,
      child: Material(
        type: MaterialType.transparency,
        child: InkWell(borderRadius: radius, onTap: off ? null : onTap, child: decorated),
      ),
    );
  }
}

/// Viền nét đứt bo 12 của mục mờ (không chỉ giảm độ mờ — thiết kế 2026-11-14.10).
class _DashedBorder extends CustomPainter {
  const _DashedBorder(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    final path = Path()..addRRect(RRect.fromRectAndRadius(Offset.zero & size, const Radius.circular(12)).deflate(.5));
    for (final m in path.computeMetrics()) {
      for (var d = 0.0; d < m.length; d += 7) {
        canvas.drawPath(m.extractPath(d, d + 4), paint);
      }
    }
  }

  @override
  bool shouldRepaint(_DashedBorder old) => old.color != color;
}

/// Khung gợi ý khi chưa học bộ nào: "Đến Truyền Tống Đài, chọn **Rừng trúc** rồi Ngồi ôn…" (R-ON-8).
class ForestHint extends StatelessWidget {
  const ForestHint({super.key});

  @override
  Widget build(BuildContext context) {
    final style = uiText.copyWith(fontSize: AppTextSize.small, height: 1.45);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.jade.withValues(alpha: .08),
        border: Border.all(color: AppColors.jade.withValues(alpha: .28)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(padding: EdgeInsets.only(top: 1), child: Icon(Icons.map_outlined, size: 18, color: AppColors.jade)),
          const SizedBox(width: 8),
          // hintGoForest
          Expanded(
            child: Text.rich(
              TextSpan(children: [
                const TextSpan(text: 'Chưa học bộ nào. Đến Truyền Tống Đài, chọn '),
                TextSpan(text: 'Rừng trúc', style: style.copyWith(fontWeight: FontWeight.w700)),
                const TextSpan(text: ' rồi Ngồi ôn để học bộ đầu tiên.'),
              ]),
              style: style,
            ),
          ),
        ],
      ),
    );
  }
}

/// Dòng "Đã học đủ 50 bộ thủ Rừng trúc" giữa hai chấm vàng.
class AllLearnedBanner extends StatelessWidget {
  const AllLearnedBanner({super.key});

  @override
  Widget build(BuildContext context) => Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const GoldDot(),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              'Đã học đủ 50 bộ thủ Rừng trúc', // learnAllDoneBanner
              textAlign: TextAlign.center,
              style: uiText.copyWith(fontSize: AppTextSize.small, fontWeight: FontWeight.w700, color: AppColors.jade),
            ),
          ),
          const SizedBox(width: 8),
          const GoldDot(),
        ],
      );
}

/// Nút "Đứng dậy": viền `slate` 45 % 1,5, nền trong, mũi tên lên + vạch.
class StandUpButton extends StatelessWidget {
  const StandUpButton({super.key, required this.landscape, required this.onPressed});

  final bool landscape;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) => OutlinedButton.icon(
        onPressed: onPressed,
        icon: const Icon(Icons.upload, size: 18),
        label: const Text('Đứng dậy'), // standUp
        style: OutlinedButton.styleFrom(
          minimumSize: Size.fromHeight(landscape ? 40 : 48),
          foregroundColor: AppColors.slate,
          side: BorderSide(color: AppColors.slate.withValues(alpha: .45), width: 1.5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: uiText.copyWith(fontSize: AppTextSize.body, fontWeight: FontWeight.w700),
        ),
      );
}

/// Chữ Hán trong dòng phụ (Noto Serif SC 700).
TextSpan hanSpan(String han) => TextSpan(text: han, style: const TextStyle(fontFamilyFallback: AppFonts.han, fontWeight: FontWeight.w700));
