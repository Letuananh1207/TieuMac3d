import 'package:flutter/material.dart';

import '../journey/daily.dart';
import '../scene/review_event.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'lesson_screen.dart';
import 'review_parts.dart';
import 'review_session.dart';
import 'reward_overlay.dart';
import 'screen_parts.dart';

/// Màn ôn câu đố (native) — R-ON-1…5. Thiết kế: design/docs/screen_specs.md "Màn ôn câu đố" (artboard `OnTap-*`).
/// Mỗi bộ 2 câu Pinyin → Nghĩa; chọn → "Kiểm tra" → phản hồi → "Câu tiếp". Câu cuối của bộ kiểm tra xong → chấm ngay
/// ([onGrade] lưu lịch ôn, trả số ngày tới hạn kế). Thoát (× / nút quay lại của máy) đóng ngay, không hỏi lại: bộ đã chấm
/// giữ kết quả, bộ chưa chấm vẫn đến hạn (R-ON-5). Chấm xong một bộ có thưởng ([rewards]) → "+5 · Ôn đúng 木"… (R-TIEN-5).
class ReviewScreen extends StatefulWidget {
  const ReviewScreen({super.key, required this.items, required this.onGrade, this.daily, this.rewards});

  final List<ReviewItem> items;

  /// Chấm bộ [id] với [correct] câu đúng → số ngày tới lần ôn kế (`null` = không lưu được).
  final Future<int?> Function(String id, int correct) onGrade;

  /// Hai việc hôm nay sau lượt ôn — dòng gợi ý của tổng kết.
  final DailyStatus? Function()? daily;

  /// khoản thưởng vừa cộng (ôn +5 / +2, xong nhiệm vụ +20, chuỗi +50 — R-TIEN-2)
  final RewardFeed? rewards;

  static Route<void> route(
    List<ReviewItem> items,
    Future<int?> Function(String, int) onGrade, {
    DailyStatus? Function()? daily,
    RewardFeed? rewards,
  }) =>
      fadeRoute(ReviewScreen(items: items, onGrade: onGrade, daily: daily, rewards: rewards));

  @override
  State<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends State<ReviewScreen> {
  late final ReviewSession _s = ReviewSession(widget.items);

  /// số ngày tới hạn kế của từng bộ đã chấm
  final Map<int, int?> _next = {};

  void _check() {
    final graded = _s.check();
    setState(() {});
    if (!graded) return;
    final i = _s.index;
    widget.onGrade(_s.item.radical.id, _s.scores.last).then((days) {
      if (!mounted) return;
      setState(() => _next[i] = days);
      playRewards(context, widget.rewards);
    });
  }

  @override
  Widget build(BuildContext context) {
    void exit() => Navigator.of(context).pop();
    return ScreenFrame(builder: (context, landscape) {
      final bar = ReviewTopBar(index: _s.index, total: _s.items.length, done: _s.scores.length, onExit: exit, stacked: landscape);
      final card = SilkCard(
        padding: landscape ? const EdgeInsets.symmetric(horizontal: 20, vertical: 14) : const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        child: switch (_s.phase) {
          ReviewPhase.asking || ReviewPhase.checked => _question(landscape),
          ReviewPhase.result => _result(landscape),
          ReviewPhase.summary => _summary(landscape),
        },
      );
      final bottom = _bottom(exit);
      if (landscape) {
        return Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(child: card),
            const SizedBox(width: 14),
            SizedBox(width: 150, child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [bar, const Spacer(), bottom])),
          ],
        );
      }
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [bar, const SizedBox(height: 14), Expanded(child: card), const SizedBox(height: 14), bottom],
      );
    });
  }

  Widget _bottom(VoidCallback exit) {
    switch (_s.phase) {
      case ReviewPhase.asking:
        return PrimaryButton(label: 'Kiểm tra', onPressed: _s.canCheck ? _check : null); // reviewCheck
      case ReviewPhase.checked:
        final q = _s.item.questions[_s.picks.length - 1];
        final r = _s.item.radical;
        final answer = q.isPinyin ? r.pinyin : '${r.name} · ${r.meaning}';
        return FeedbackBox(
          right: _s.lastRight,
          text: _s.lastRight ? 'Đúng rồi!' : 'Chưa đúng — $answer', // reviewRight / reviewWrong
          button: 'Câu tiếp', // reviewNext
          onNext: () => setState(_s.next),
        );
      case ReviewPhase.result:
        return PrimaryButton(label: 'Bộ tiếp', trailing: Icons.arrow_forward, onPressed: () => setState(_s.next)); // reviewNextRadical
      case ReviewPhase.summary:
        return PrimaryButton(label: 'Xong', icon: Icons.check, onPressed: exit); // reviewFinish
    }
  }

  Widget _question(bool landscape) {
    final q = _s.current;
    final r = _s.item.radical;
    final checked = _s.phase == ReviewPhase.checked;
    final picked = checked ? _s.picks.last : _s.selected;
    OptionLook look(int i) {
      if (!checked) return i == picked ? OptionLook.selected : OptionLook.normal;
      if (i == q.answer) return OptionLook.right;
      return i == picked ? OptionLook.wrong : OptionLook.faded;
    }

    final head = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(q.isPinyin ? 'Câu 1 / 2 · Pinyin' : 'Câu 2 / 2 · Nghĩa', // reviewStepPinyin / reviewStepMeaning
            style: uiText.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700, color: AppColors.jade)),
        SizedBox(height: landscape ? 8 : 14),
        Text(r.form, style: hanText.copyWith(fontSize: landscape ? AppTextSize.reviewHeroLandscape : AppTextSize.reviewHero, height: 1)),
        SizedBox(height: landscape ? 8 : 14),
        Text(q.isPinyin ? 'Bộ này đọc là gì?' : 'Bộ này nghĩa là gì?', // reviewAskPinyin / reviewAskMeaning
            textAlign: TextAlign.center,
            style: uiText.copyWith(fontSize: landscape ? AppTextSize.task : AppTextSize.question, fontWeight: FontWeight.w700)),
      ],
    );
    final options = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 0; i < q.options.length; i++) ...[
          if (i > 0) SizedBox(height: landscape ? 8 : 10),
          OptionTile(
            text: q.options[i],
            pinyin: q.isPinyin,
            look: look(i),
            minHeight: landscape ? AppSize.optionRowLandscape : AppSize.optionRow,
            onTap: checked ? null : () => setState(() => _s.select(i)),
          ),
        ],
      ],
    );
    if (landscape) {
      return Row(children: [SizedBox(width: 220, child: head), const SizedBox(width: 22), Expanded(child: options)]);
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [head, const SizedBox(height: 14), const Spacer(), options]);
  }

  /// Câu hạn kế ("Lên bậc — ôn lại sau 7 ngày").
  String _nextLine(int level, int? days) {
    final head = switch (level) { 2 => 'Lên bậc', 1 => 'Lùi một bậc', _ => 'Về bậc đầu' };
    if (days == null) return head;
    return days <= 1 ? '$head — mai ôn lại' : '$head — ôn lại sau $days ngày'; // reviewTomorrow / reviewNextIn
  }

  Widget _result(bool landscape) {
    final item = _s.item;
    final r = item.radical;
    final correct = _s.scores.last;
    final level = reviewLevel(correct, item.questions.length);
    final value = uiText.copyWith(fontSize: AppTextSize.detail);
    final key = value.copyWith(fontWeight: FontWeight.w700, color: AppColors.jade);
    final table = Table(
      columnWidths: const {0: IntrinsicColumnWidth(), 1: FlexColumnWidth()},
      children: [
        for (var i = 0; i < item.questions.length; i++)
          TableRow(children: [
            Padding(
              padding: const EdgeInsets.only(right: 14, bottom: 6),
              child: Text(item.questions[i].isPinyin ? 'Pinyin' : 'Nghĩa', style: key),
            ),
            Text(
              _s.picks[i] == item.questions[i].answer ? '✓ đúng' : '✗ chọn "${item.questions[i].options[_s.picks[i]]}"',
              style: value,
            ),
          ]),
      ],
    );
    final hero = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('Kết quả bộ này', style: uiText.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700, color: AppColors.jade)), // reviewResult
        const SizedBox(height: 12),
        Text(r.form, style: hanText.copyWith(fontSize: landscape ? AppTextSize.reviewHeroLandscape : AppTextSize.reviewHero, height: 1)),
        const SizedBox(height: 12),
        Text(r.pinyin, style: displayText.copyWith(fontSize: AppTextSize.accent, color: AppColors.lacquer)),
        Text('${r.name} — ${r.meaning}', textAlign: TextAlign.center, style: uiText.copyWith(fontSize: AppTextSize.cardTitle, fontWeight: FontWeight.w700)),
      ],
    );
    final verdict = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        LevelPill(level: level, correct: correct, total: item.questions.length),
        const SizedBox(height: 12),
        Text(_nextLine(level, _next[_s.index]), textAlign: TextAlign.center, style: uiText.copyWith(fontSize: AppTextSize.body, height: 1.5)),
      ],
    );
    if (landscape) {
      return Row(children: [
        SizedBox(width: 220, child: hero),
        const SizedBox(width: 22),
        Expanded(child: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.stretch, children: [verdict, const SizedBox(height: 14), table])),
      ]);
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [hero, const SizedBox(height: 12), const GoldRule(vertical: false), const SizedBox(height: 12), verdict, const SizedBox(height: 12), const Spacer(), table],
    );
  }

  Widget _summary(bool landscape) {
    final counts = _s.levelCounts;
    final daily = widget.daily?.call();
    final hint = [
      if (counts[0] > 0) 'Bộ "chưa nhớ" sẽ hỏi lại ngày mai.',
      if (daily != null && !daily.learnDone) 'Còn việc Lĩnh hội ${daily.newToday}/$dailyNewGoal — ngồi thiền ở Rừng trúc.',
      if (daily != null && daily.done) 'Hôm nay đã xong cả 2 việc trên bảng.',
    ].join(' ');
    final head = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: AppColors.jade,
            shape: BoxShape.circle,
            boxShadow: [BoxShadow(color: AppColors.gold.withValues(alpha: .35), spreadRadius: 4)],
          ),
          child: const Icon(Icons.check, size: 26, color: AppColors.onJade),
        ),
        const SizedBox(height: 10),
        Text('Ôn xong ${_s.scores.length} bộ', style: uiText.copyWith(fontSize: AppTextSize.accent, fontWeight: FontWeight.w700)), // reviewSummary
        const SizedBox(height: 4),
        if (daily == null || daily.reviewDone)
          Text.rich(
            const TextSpan(children: [
              TextSpan(text: 'Việc '),
              TextSpan(text: 'Ôn tập', style: TextStyle(fontWeight: FontWeight.w700)),
              TextSpan(text: ' hôm nay đã xong.'), // reviewSummaryDone
            ]),
            style: uiText.copyWith(fontSize: AppTextSize.detail),
          ),
      ],
    );
    final body = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(children: [
          for (final level in [2, 1, 0]) ...[
            if (level != 2) const SizedBox(width: 8),
            Expanded(child: LevelCount(level: level, count: counts[level])),
          ],
        ]),
        const SizedBox(height: 16),
        Wrap(spacing: 8, runSpacing: 8, children: [
          for (var i = 0; i < _s.scores.length; i++)
            ResultChip(
              han: _s.items[i].radical.form,
              level: reviewLevel(_s.scores[i], _s.items[i].questions.length),
              correct: _s.scores[i],
              total: _s.items[i].questions.length,
            ),
        ]),
      ],
    );
    final hintText = Text(hint, style: uiText.copyWith(fontSize: AppTextSize.small, height: 1.5));
    if (landscape) {
      return Row(children: [
        SizedBox(width: 220, child: head),
        const SizedBox(width: 22),
        Expanded(child: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.stretch, children: [body, const SizedBox(height: 12), hintText])),
      ]);
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [head, const SizedBox(height: 16), const GoldRule(vertical: false), const SizedBox(height: 16), body, const SizedBox(height: 16), const Spacer(), hintText],
    );
  }
}
