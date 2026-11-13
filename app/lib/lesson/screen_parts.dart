import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_fonts.g.dart';
import '../theme/app_text_size.dart';
import 'lesson_screen.dart';

/// Phần dùng chung của các màn native theo khung màn bài học (bảng nhiệm vụ, màn ôn — thiết kế 2026-11-13.25):
/// nền `mist` + núi, thẻ lụa, nút chính ngọc bích, nút phụ viền.

const uiText = TextStyle(fontFamily: AppFonts.ui, fontFamilyFallback: AppFonts.uiFallback, color: AppColors.slate);
const hanText = TextStyle(fontFamilyFallback: AppFonts.han, fontWeight: FontWeight.w700, color: AppColors.jade);
const displayText = TextStyle(
  fontFamily: AppFonts.display,
  fontFamilyFallback: AppFonts.displayFallback,
  fontWeight: FontWeight.w700,
  color: AppColors.jade,
);

/// Màn chuyển mờ dần như thẻ bộ thủ.
Route<T> fadeRoute<T>(Widget page) => PageRouteBuilder<T>(
      transitionDuration: const Duration(milliseconds: 220),
      reverseTransitionDuration: const Duration(milliseconds: 180),
      pageBuilder: (_, _, _) => page,
      transitionsBuilder: (_, a, _, child) => FadeTransition(opacity: a, child: child),
    );

/// Nền + núi + lề an toàn (dọc: 16 hai bên, 12 trên, 16 dưới; ngang: 12 mọi phía, cộng safe area).
class ScreenFrame extends StatelessWidget {
  const ScreenFrame({super.key, required this.builder});

  final Widget Function(BuildContext context, bool landscape) builder;

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    final landscape = mq.size.width > mq.size.height;
    final safe = mq.viewPadding;
    final padding = landscape
        ? EdgeInsets.fromLTRB(safe.left + 12, safe.top + 12, safe.right + 12, safe.bottom + 12)
        : EdgeInsets.fromLTRB(safe.left + 16, safe.top + 12, safe.right + 16, safe.bottom + 16);
    return Scaffold(
      backgroundColor: AppColors.sceneBackground,
      body: Stack(
        fit: StackFit.expand,
        children: [
          Positioned(left: 0, right: 0, bottom: 0, child: LessonMountains(landscape: landscape)),
          Padding(padding: padding, child: builder(context, landscape)),
        ],
      ),
    );
  }
}

/// Dòng eyebrow 11/700 hoa, giãn chữ .12em.
class Eyebrow extends StatelessWidget {
  const Eyebrow(this.text, {super.key, this.align = TextAlign.center});

  final String text;
  final TextAlign align;

  @override
  Widget build(BuildContext context) => Text(
        text.toUpperCase(),
        textAlign: align,
        style: uiText.copyWith(fontSize: AppTextSize.eyebrow, fontWeight: FontWeight.w700, letterSpacing: AppTextSize.eyebrow * .12),
      );
}

/// Thẻ lụa `frost` .86 bo 16, bóng thẻ; nội dung cuộn được khi màn thấp.
class SilkCard extends StatelessWidget {
  const SilkCard({super.key, required this.child, required this.padding, this.overlay});

  final Widget child;
  final EdgeInsets padding;

  /// vẽ đè góc thẻ (triện 畢)
  final Widget? overlay;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.frostStrong,
        border: Border.all(color: AppColors.frostOutline),
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [BoxShadow(color: AppColors.cardShadow, offset: Offset(0, 12), blurRadius: 32)],
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: LayoutBuilder(
              builder: (context, box) => SingleChildScrollView(
                padding: padding,
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: (box.maxHeight - padding.vertical).clamp(0, double.infinity)),
                  child: IntrinsicHeight(child: child),
                ),
              ),
            ),
          ),
          ?overlay,
        ],
      ),
    );
  }
}

/// Nút chính ngọc bích (bo 12, bóng ngọc); [onPressed] `null` → vô hiệu (nền ngọc 35 %, không bóng).
class PrimaryButton extends StatelessWidget {
  const PrimaryButton({super.key, required this.label, this.icon, this.trailing, this.onPressed, this.height = 52});

  final String label;
  final IconData? icon;
  final IconData? trailing;
  final VoidCallback? onPressed;
  final double height;

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null;
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        boxShadow: enabled ? const [BoxShadow(color: AppColors.primaryShadow, offset: Offset(0, 4), blurRadius: 12)] : null,
      ),
      child: FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          minimumSize: Size.fromHeight(height),
          backgroundColor: AppColors.jade,
          foregroundColor: AppColors.onJade,
          disabledBackgroundColor: AppColors.jade.withValues(alpha: .35),
          disabledForegroundColor: AppColors.onJade,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: uiText.copyWith(fontSize: AppTextSize.body, fontWeight: FontWeight.w700),
        ),
        child: _label(label, icon, trailing),
      ),
    );
  }
}

/// Nút phụ: viền `slate` 30 %, nền trắng .55 ("Đóng bảng").
class SecondaryButton extends StatelessWidget {
  const SecondaryButton({super.key, required this.label, this.icon, required this.onPressed, this.height = 52});

  final String label;
  final IconData? icon;

  /// `null` → tắt (mờ 40 % — "Trang trước" ở trang đầu)
  final VoidCallback? onPressed;
  final double height;

  @override
  Widget build(BuildContext context) => Opacity(opacity: onPressed == null ? .4 : 1, child: _button());

  Widget _button() => OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          minimumSize: Size.fromHeight(height),
          backgroundColor: AppColors.onJade.withValues(alpha: .55),
          foregroundColor: AppColors.slate,
          disabledForegroundColor: AppColors.slate,
          side: BorderSide(color: AppColors.slate.withValues(alpha: .3)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: uiText.copyWith(fontSize: AppTextSize.body, fontWeight: FontWeight.w700),
        ),
        child: _label(label, icon, null),
      );
}

Widget _label(String label, IconData? icon, IconData? trailing) => Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (icon != null) ...[Icon(icon, size: 20), const SizedBox(width: 8)],
        Flexible(child: Text(label, overflow: TextOverflow.ellipsis)),
        if (trailing != null) ...[const SizedBox(width: 8), Icon(trailing, size: 18)],
      ],
    );

/// Ô chữ Hán nhỏ 34 × 34 nền giấy (bộ đến hạn trên bảng nhiệm vụ).
class HanTile extends StatelessWidget {
  const HanTile(this.han, {super.key});

  final String han;

  @override
  Widget build(BuildContext context) => Container(
        width: 34,
        height: 34,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: AppColors.mapPaper,
          border: Border.all(color: AppColors.frostOutline),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(han, style: hanText.copyWith(fontSize: AppTextSize.hanExample, height: 1)),
      );
}
