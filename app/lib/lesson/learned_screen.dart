import 'package:flutter/material.dart';

import '../journey/journey.dart';
import '../journey/review.dart';
import '../scene/scene_event.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'screen_parts.dart';
import 'study_board.dart';

/// Màn Bộ đã học (native) — mở từ "Xem bộ đã học" trên cuộn sách Ngồi ôn (R-ON-8). Thiết kế:
/// design/docs/screen_specs.md "Bộ đã học" (artboard `BoDaHoc-doc`, `BoDaHoc-doc-day`, `BoDaHoc-ngang`): lưới ô bộ thủ
/// (chữ, tên, 7 chấm bậc nhớ — R-ON-1, hạn ôn), bộ đến hạn viền son. Chạm một ô → đóng màn, trả bộ đó (cuộn sách mở thẻ
/// bộ thủ "Đã học"); ‹ "Về cuộn sách" / nút quay lại của máy → trả `null`.
class LearnedScreen extends StatelessWidget {
  const LearnedScreen({super.key, required this.entries});

  final List<LearnedEntry> entries;

  static Route<Radical> route(List<LearnedEntry> entries) => fadeRoute<Radical>(LearnedScreen(entries: entries));

  @override
  Widget build(BuildContext context) {
    final due = entries.where((e) => e.due).length;
    return ScreenFrame(
      builder: (context, landscape) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _Header(count: entries.length, landscape: landscape),
          const SizedBox(height: 12),
          _Legend(due: due),
          SizedBox(height: landscape ? 8 : 12),
          Expanded(child: _Grid(entries: entries, landscape: landscape)),
        ],
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.count, required this.landscape});

  final int count;
  final bool landscape;

  @override
  Widget build(BuildContext context) {
    final hint = Text(
      'Chạm một bộ để mở lại thẻ', // learnedHint
      style: uiText.copyWith(fontSize: AppTextSize.caption, color: AppColors.slateMuted),
    );
    final title = Text(
      'Bộ đã học', // learnedTitle
      style: displayText.copyWith(fontSize: landscape ? AppTextSize.titleCompact : AppTextSize.accent, color: AppColors.slate),
    );
    final pill = Container(
      height: 28,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      alignment: Alignment.center,
      decoration: BoxDecoration(color: AppColors.jade.withValues(alpha: .10), borderRadius: BorderRadius.circular(999)),
      child: Text(
        '$count / $rungTrucRadicalCount bộ', // learnedCount
        style: uiText.copyWith(fontSize: AppTextSize.small, fontWeight: FontWeight.w700, color: AppColors.jade),
      ),
    );
    final back = Semantics(
      button: true,
      label: 'Về cuộn sách', // learnedBack
      excludeSemantics: true,
      child: Material(
        color: AppColors.frostStrong,
        shape: const CircleBorder(side: BorderSide(color: AppColors.frostOutline)),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: () => Navigator.of(context).maybePop(),
          child: const SizedBox(width: 44, height: 44, child: Icon(Icons.chevron_left, size: 22, color: AppColors.slate)),
        ),
      ),
    );
    return Row(
      children: [
        back,
        const SizedBox(width: 12),
        if (landscape) ...[
          title,
          const SizedBox(width: 12),
          pill,
          const SizedBox(width: 12),
          Expanded(child: Align(alignment: Alignment.centerRight, child: hint)),
        ] else ...[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [title, const SizedBox(height: 1), hint],
            ),
          ),
          const SizedBox(width: 8),
          pill,
        ],
      ],
    );
  }
}

/// Chú thích: mẫu chấm bậc nhớ · số bộ đến hạn (chỉ khi có) · thứ tự xếp.
class _Legend extends StatelessWidget {
  const _Legend({required this.due});

  final int due;

  @override
  Widget build(BuildContext context) {
    final style = uiText.copyWith(fontSize: AppTextSize.caption, color: AppColors.slateMuted);
    return Wrap(
      spacing: 12,
      runSpacing: 4,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        Row(mainAxisSize: MainAxisSize.min, children: [
          const LevelDots(level: 2, count: 3),
          const SizedBox(width: 5),
          Text('bậc nhớ (1 → 7)', style: style), // learnedLegend
        ]),
        if (due > 0)
          Row(mainAxisSize: MainAxisSize.min, children: [
            Container(width: 8, height: 8, decoration: const BoxDecoration(color: AppColors.lacquer, shape: BoxShape.circle)),
            const SizedBox(width: 5),
            Text('$due bộ đến hạn', style: style.copyWith(color: AppColors.lacquer, fontWeight: FontWeight.w700)), // learnedDueCount
          ]),
        Text('Xếp theo thứ tự học', style: style), // learnedOrder
      ],
    );
  }
}

/// Chấm bậc nhớ: chấm thứ k tô ngọc khi [level] ≥ k, còn lại `slate` 18 %.
class LevelDots extends StatelessWidget {
  const LevelDots({super.key, required this.level, this.count = 7});

  final int level;
  final int count;

  @override
  Widget build(BuildContext context) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var k = 1; k <= count; k++) ...[
            if (k > 1) const SizedBox(width: 3),
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: k <= level ? AppColors.jade : AppColors.slate.withValues(alpha: .18),
              ),
            ),
          ],
        ],
      );
}

class _Grid extends StatelessWidget {
  const _Grid({required this.entries, required this.landscape});

  final List<LearnedEntry> entries;
  final bool landscape;

  @override
  Widget build(BuildContext context) {
    final grid = Scrollbar(
      thickness: 4,
      child: GridView.builder(
        padding: const EdgeInsets.only(bottom: 56),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: landscape ? 6 : 3,
          mainAxisSpacing: landscape ? 8 : 9,
          crossAxisSpacing: landscape ? 8 : 9,
          mainAxisExtent: landscape ? 106 : 132,
        ),
        itemCount: entries.length,
        itemBuilder: (context, i) => _Tile(entry: entries[i], landscape: landscape),
      ),
    );
    // mờ đáy 56: còn bộ ở dưới
    return Stack(
      children: [
        Positioned.fill(child: grid),
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          height: 56,
          child: IgnorePointer(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [AppColors.sceneBackground.withValues(alpha: 0), AppColors.sceneBackground],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({required this.entry, required this.landscape});

  final LearnedEntry entry;
  final bool landscape;

  @override
  Widget build(BuildContext context) {
    final r = entry.radical;
    final when = entry.due ? 'đến hạn ôn' : 'ôn sau ${entry.daysLeft} ngày';
    final radius = BorderRadius.circular(14);
    final foot = entry.due
        ? Container(
            height: 20,
            padding: const EdgeInsets.symmetric(horizontal: 8),
            alignment: Alignment.center,
            decoration: BoxDecoration(color: AppColors.lacquer.withValues(alpha: .10), borderRadius: BorderRadius.circular(999)),
            child: Text(
              'Đến hạn', // learnedDue
              style: uiText.copyWith(fontSize: AppTextSize.eyebrow, fontWeight: FontWeight.w700, color: AppColors.lacquer),
            ),
          )
        : Text(
            'Ôn sau ${entry.daysLeft} ngày', // learnedNextIn
            style: uiText.copyWith(fontSize: AppTextSize.eyebrow, color: AppColors.slateMuted),
          );
    return Semantics(
      button: true,
      label: '${r.form} ${r.name} — ${r.meaning}, bậc ${entry.level}, $when', // learnedItemLabel
      excludeSemantics: true,
      child: Material(
        color: AppColors.frostStrong.withValues(alpha: .9),
        shape: RoundedRectangleBorder(
          borderRadius: radius,
          side: BorderSide(color: entry.due ? AppColors.lacquer.withValues(alpha: .45) : AppColors.frostOutline),
        ),
        child: InkWell(
          borderRadius: radius,
          onTap: () => Navigator.of(context).pop(r),
          child: Padding(
            padding: EdgeInsets.fromLTRB(6, landscape ? 6 : 10, 6, landscape ? 6 : 8),
            child: Column(
              children: [
                Text(
                  r.form,
                  style: hanText.copyWith(fontSize: landscape ? AppTextSize.learnedHanLandscape : AppTextSize.learnedHan, height: 1.05),
                ),
                SizedBox(height: landscape ? 2 : 4),
                Text(
                  r.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: uiText.copyWith(
                    fontSize: landscape ? AppTextSize.small : AppTextSize.detail,
                    fontWeight: FontWeight.w700,
                    height: 1.2,
                  ),
                ),
                SizedBox(height: landscape ? 4 : 6),
                LevelDots(level: entry.level, count: reviewIntervals.length),
                const Spacer(),
                SizedBox(height: 20, child: Center(child: foot)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
