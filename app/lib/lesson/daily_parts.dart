import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../journey/daily.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'screen_parts.dart';

/// Mẩu giao diện của bảng nhiệm vụ 日課榜 (`daily_screen.dart`, thiết kế 2026-11-13.25).

/// Một việc: vòng trạng thái 36 · tên · tiến độ bên phải · dòng phụ · (ô chữ + nút "Ôn ngay").
class DailyTask extends StatelessWidget {
  const DailyTask({super.key, required this.title, required this.done, required this.progress, required this.sub, this.extra = const []});

  final String title;
  final bool done;
  final Widget? progress;
  final Widget sub;
  final List<Widget> extra;

  @override
  Widget build(BuildContext context) {
    final ring = done
        ? Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.jade,
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: AppColors.gold.withValues(alpha: .35), spreadRadius: 3)],
            ),
            child: const Icon(Icons.check, size: 18, color: AppColors.onJade),
          )
        : Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppColors.slate.withValues(alpha: .3), width: 2)),
          );
    return Semantics(
      label: done ? '$title: đã xong' : title,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ExcludeSemantics(child: ring),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(title, style: uiText.copyWith(fontSize: AppTextSize.task, fontWeight: FontWeight.w700))),
                    ?progress,
                  ],
                ),
                const SizedBox(height: 8),
                sub,
                for (final w in extra) ...[const SizedBox(height: 8), w],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Tiến độ Lĩnh hội: 3 chấm 14 (đã học tô ngọc, chưa viền ngọc 40 %) + "n/3".
class ProgressDots extends StatelessWidget {
  const ProgressDots(this.n, {super.key});

  final int n;

  @override
  Widget build(BuildContext context) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var i = 0; i < dailyNewGoal; i++)
            Container(
              width: 14,
              height: 14,
              margin: const EdgeInsets.only(right: 4),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: i < n ? AppColors.jade : null,
                border: i < n ? null : Border.all(color: AppColors.jade.withValues(alpha: .4), width: 2),
              ),
            ),
          const SizedBox(width: 4),
          Text('$n/$dailyNewGoal', style: uiText.copyWith(fontSize: AppTextSize.detail, fontWeight: FontWeight.w700)),
        ],
      );
}

/// Hàng ô chữ bộ đến hạn — một hàng tối đa [maxDueTiles] ô (vừa cột hẹp nhất: dọc 390, ngang 844), thừa → "+n".
const maxDueTiles = 6;

class DueTiles extends StatelessWidget {
  const DueTiles({super.key, required this.forms});

  final List<String> forms;

  @override
  Widget build(BuildContext context) {
    final shown = forms.length <= maxDueTiles ? forms.length : maxDueTiles - 1;
    return Row(
      children: [
        for (var i = 0; i < shown; i++) Padding(padding: const EdgeInsets.only(right: 6), child: HanTile(forms[i])),
        if (shown < forms.length)
          SizedBox(
            width: 34,
            height: 34,
            child: Center(
              child: Text('+${forms.length - shown}', style: uiText.copyWith(fontSize: AppTextSize.detail, fontWeight: FontWeight.w700, color: AppColors.jade)),
            ),
          ),
      ],
    );
  }
}

/// Một ngày trong dải 7 ngày (vòng 26 + nhãn thứ).
class WeekDay extends StatelessWidget {
  const WeekDay({super.key, required this.mark, required this.label});

  final DayMark mark;
  final String label;

  @override
  Widget build(BuildContext context) {
    final filled = mark == DayMark.counted || mark == DayMark.todayDone;
    final isToday = mark == DayMark.today || mark == DayMark.todayDone;
    final Widget circle = switch (mark) {
      DayMark.counted || DayMark.todayDone => Container(
          width: 26,
          height: 26,
          decoration: BoxDecoration(
            color: AppColors.jade,
            shape: BoxShape.circle,
            boxShadow: mark == DayMark.todayDone ? [BoxShadow(color: AppColors.gold.withValues(alpha: .35), spreadRadius: 3)] : null,
          ),
          child: const Icon(Icons.check, size: 14, color: AppColors.onJade),
        ),
      DayMark.today => const CustomPaint(size: Size(26, 26), painter: DashedRing()),
      DayMark.missed => Container(
          width: 26,
          height: 26,
          decoration: BoxDecoration(color: AppColors.slate.withValues(alpha: .08), shape: BoxShape.circle),
        ),
      DayMark.future => Container(
          width: 26,
          height: 26,
          decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppColors.slate.withValues(alpha: .18))),
        ),
    };
    return Column(
      children: [
        circle,
        const SizedBox(height: 4),
        Text(
          label,
          style: uiText.copyWith(
            fontSize: AppTextSize.eyebrow,
            fontWeight: isToday ? FontWeight.w700 : FontWeight.w500,
            color: isToday && !filled ? AppColors.jade : AppColors.slate,
          ),
        ),
      ],
    );
  }
}

/// Vòng viền đứt ngọc 2 px — hôm nay chưa xong.
class DashedRing extends CustomPainter {
  const DashedRing();

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.jade
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    final rect = Rect.fromLTWH(1, 1, size.width - 2, size.height - 2);
    const dashes = 12;
    const sweep = math.pi * 2 / dashes;
    for (var i = 0; i < dashes; i++) {
      canvas.drawArc(rect, i * sweep, sweep * .55, false, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Viên "Kỷ lục mới" (viền vàng, nền vàng 14 %, chấm vàng).
class RecordPill extends StatelessWidget {
  const RecordPill({super.key});

  @override
  Widget build(BuildContext context) => Container(
        height: 24,
        padding: const EdgeInsets.symmetric(horizontal: 9),
        decoration: BoxDecoration(
          color: AppColors.gold.withValues(alpha: .14),
          border: Border.all(color: AppColors.gold),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 5, height: 5, decoration: const BoxDecoration(color: AppColors.gold, shape: BoxShape.circle)),
            const SizedBox(width: 5),
            Text('Kỷ lục mới', style: uiText.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700)), // dailyNewRecord
          ],
        ),
      );
}

/// Triện son 畢 "hôm nay đã xong" — 62 × 62, xoay −8°.
class DoneSeal extends StatelessWidget {
  const DoneSeal({super.key});

  @override
  Widget build(BuildContext context) => Semantics(
        label: 'Hôm nay đã xong', // dailySealLabel
        child: ExcludeSemantics(
          child: Transform.rotate(
            angle: -8 * math.pi / 180,
            child: Container(
              width: 62,
              height: 62,
              decoration: BoxDecoration(
                color: AppColors.lacquer.withValues(alpha: .06),
                border: Border.all(color: AppColors.lacquer, width: 3),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('畢', style: hanText.copyWith(fontSize: AppTextSize.seal, height: 1, color: AppColors.lacquer)),
                  Text('xong', style: uiText.copyWith(fontSize: AppTextSize.sealCaption, fontWeight: FontWeight.w700, color: AppColors.lacquer)),
                ],
              ),
            ),
          ),
        ),
      );
}
