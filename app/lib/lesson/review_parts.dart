import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'screen_parts.dart';

/// Mẩu giao diện của màn ôn câu đố (`review_screen.dart`, thiết kế 2026-11-13.25 "Màn ôn câu đố").

/// Trạng thái hiện của một phương án.
enum OptionLook { normal, selected, right, wrong, faded }

/// Màu theo mức nhớ 0 · 1 · 2 (chưa nhớ · một phần · rõ): (viền, nền, chữ).
(Color, Color, Color) levelColors(int level) => switch (level) {
      2 => (AppColors.jade, AppColors.answerRightBg, AppColors.jade),
      1 => (AppColors.gold, AppColors.answerPartialBg, AppColors.slate),
      _ => (AppColors.lacquer, AppColors.answerWrongBg, AppColors.lacquer),
    };

const levelNames = ['Chưa nhớ', 'Nhớ một phần', 'Nhớ rõ']; // reviewLevel0 / 1 / 2

/// Phương án câu đố: cao ≥ `option-row`, bo 14, dấu tròn 20 bên trái. Pinyin chữ Lora 22, nghĩa 16/700.
class OptionTile extends StatelessWidget {
  const OptionTile({super.key, required this.text, required this.pinyin, required this.look, required this.minHeight, this.onTap});

  final String text;
  final bool pinyin;
  final OptionLook look;
  final double minHeight;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final (border, width, bg) = switch (look) {
      OptionLook.selected => (AppColors.jade, 2.0, AppColors.jade.withValues(alpha: .08)),
      OptionLook.right => (AppColors.jade, 2.0, AppColors.answerRightBg),
      OptionLook.wrong => (AppColors.lacquer, 2.0, AppColors.answerWrongBg),
      OptionLook.faded => (AppColors.slate.withValues(alpha: .18), 1.0, AppColors.onJade.withValues(alpha: .4)),
      OptionLook.normal => (AppColors.slate.withValues(alpha: .18), 1.0, AppColors.onJade.withValues(alpha: .75)),
    };
    final Widget mark = switch (look) {
      OptionLook.right => _filledMark(AppColors.jade, Icons.check),
      OptionLook.wrong => _filledMark(AppColors.lacquer, Icons.close),
      OptionLook.selected => Container(
          width: 20,
          height: 20,
          alignment: Alignment.center,
          decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppColors.jade, width: 2)),
          child: Container(width: 10, height: 10, decoration: const BoxDecoration(color: AppColors.jade, shape: BoxShape.circle)),
        ),
      _ => Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppColors.slate.withValues(alpha: .3), width: 2)),
        ),
    };
    final style = pinyin
        ? displayText.copyWith(fontSize: AppTextSize.accent, color: AppColors.slate)
        : uiText.copyWith(fontSize: AppTextSize.task, fontWeight: FontWeight.w700);
    return Semantics(
      button: true,
      selected: look == OptionLook.selected,
      child: Opacity(
        opacity: look == OptionLook.faded ? .6 : 1,
        child: Material(
          color: bg,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: BorderSide(color: border, width: width)),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onTap,
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: minHeight),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    SizedBox(width: 22, child: Center(child: ExcludeSemantics(child: mark))),
                    const SizedBox(width: 12),
                    Expanded(child: Text(text, style: style)),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  static Widget _filledMark(Color c, IconData icon) => Container(
        width: 22,
        height: 22,
        decoration: BoxDecoration(color: c, shape: BoxShape.circle),
        child: Icon(icon, size: 14, color: AppColors.onJade),
      );
}

/// Thanh trên: nút tròn × 44 (kính sương) + "ÔN TẬP" · "Bộ i / n" + tiến độ chia n đoạn.
class ReviewTopBar extends StatelessWidget {
  const ReviewTopBar({super.key, required this.index, required this.total, required this.done, required this.onExit, this.stacked = false});

  /// bộ đang ôn (đếm từ 0) · tổng số bộ · số bộ đã chấm
  final int index;
  final int total;
  final int done;
  final VoidCallback onExit;

  /// ngang: nút × ở trên, tiến độ ở dưới (cột 150)
  final bool stacked;

  @override
  Widget build(BuildContext context) {
    final exit = Semantics(
      button: true,
      label: 'Thoát lượt ôn', // reviewExit
      child: Material(
        color: AppColors.frostStrong,
        shape: CircleBorder(side: BorderSide(color: AppColors.slate.withValues(alpha: .16))),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onExit,
          child: const SizedBox(width: 44, height: 44, child: Icon(Icons.close, size: 20, color: AppColors.slate)),
        ),
      ),
    );
    final label = uiText.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700);
    final progress = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            Expanded(
              child: Text('ÔN TẬP', style: label.copyWith(letterSpacing: AppTextSize.caption * .1), overflow: TextOverflow.ellipsis), // reviewTitle
            ),
            Text('Bộ ${index + 1} / $total', style: label), // reviewProgress
          ],
        ),
        const SizedBox(height: 6),
        Semantics(
          label: 'Bộ ${index + 1} trên $total',
          child: Row(
            children: [
              for (var i = 0; i < total; i++) ...[
                if (i > 0) const SizedBox(width: 4),
                Expanded(
                  child: Container(
                    height: 6,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(3),
                      color: i < done
                          ? AppColors.jade
                          : i == index
                              ? AppColors.jade.withValues(alpha: .45)
                              : AppColors.slate.withValues(alpha: .14),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
    if (stacked) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [exit, const SizedBox(height: 8), progress],
      );
    }
    return Row(children: [exit, const SizedBox(width: 12), Expanded(child: progress)]);
  }
}

/// Khung phản hồi sau "Kiểm tra": dòng đúng / sai có dấu + nút "Câu tiếp →".
class FeedbackBox extends StatelessWidget {
  const FeedbackBox({super.key, required this.right, required this.text, required this.button, required this.onNext});

  final bool right;
  final String text;
  final String button;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    final c = right ? AppColors.jade : AppColors.lacquer;
    return Semantics(
      liveRegion: true,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: right ? AppColors.answerRightBg : AppColors.answerWrongBg,
          border: Border.all(color: c),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Icon(right ? Icons.check_circle : Icons.cancel, size: 20, color: c),
                const SizedBox(width: 10),
                Expanded(child: Text(text, style: uiText.copyWith(fontSize: AppTextSize.task, fontWeight: FontWeight.w700, color: c))),
              ],
            ),
            const SizedBox(height: 12),
            PrimaryButton(label: button, trailing: Icons.arrow_forward, height: 46, onPressed: onNext),
          ],
        ),
      ),
    );
  }
}

/// Viên mức nhớ cao 40 ("Nhớ một phần · 1/2").
class LevelPill extends StatelessWidget {
  const LevelPill({super.key, required this.level, required this.correct, required this.total});

  final int level;
  final int correct;
  final int total;

  @override
  Widget build(BuildContext context) {
    final (border, bg, fg) = levelColors(level);
    final style = uiText.copyWith(fontSize: AppTextSize.task, fontWeight: FontWeight.w700, color: fg);
    return Container(
      height: 40,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(color: bg, border: Border.all(color: border, width: 1.5), borderRadius: BorderRadius.circular(999)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Flexible(child: Text(levelNames[level], style: style, overflow: TextOverflow.ellipsis)),
          const SizedBox(width: 8),
          Opacity(opacity: .8, child: Text('· $correct/$total', style: style)),
        ],
      ),
    );
  }
}

/// Ô đếm của tổng kết (số Lora 28 + tên mức).
class LevelCount extends StatelessWidget {
  const LevelCount({super.key, required this.level, required this.count});

  final int level;
  final int count;

  @override
  Widget build(BuildContext context) {
    final (border, _, fg) = levelColors(level);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.onJade.withValues(alpha: .6),
        border: Border.all(color: border, width: 1.5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text('$count', style: displayText.copyWith(fontSize: AppTextSize.countLarge, color: level == 1 ? AppColors.slate : fg)),
          const SizedBox(height: 2),
          Text(levelNames[level], textAlign: TextAlign.center, style: uiText.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

/// Ô chữ của lượt (nền giấy, viền màu mức + "n/2").
class ResultChip extends StatelessWidget {
  const ResultChip({super.key, required this.han, required this.level, required this.correct, required this.total});

  final String han;
  final int level;
  final int correct;
  final int total;

  @override
  Widget build(BuildContext context) => Container(
        height: 34,
        padding: const EdgeInsets.fromLTRB(6, 0, 10, 0),
        decoration: BoxDecoration(
          color: AppColors.mapPaper,
          border: Border.all(color: levelColors(level).$1, width: 1.5),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(han, style: hanText.copyWith(fontSize: AppTextSize.hanExample, height: 1)),
            const SizedBox(width: 6),
            Text('$correct/$total', style: uiText.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700)),
          ],
        ),
      );
}
