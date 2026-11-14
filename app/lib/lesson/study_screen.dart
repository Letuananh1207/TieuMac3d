import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../journey/journey.dart';
import '../scene/review_event.dart';
import '../scene/scene_event.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'learned_screen.dart';
import 'radical_screen.dart';
import 'reward_overlay.dart';
import 'screen_parts.dart';
import 'study_board.dart';
import 'study_parts.dart';

/// Bảng chọn cuộn sách Ngồi ôn (native, đè lên cảnh — cảnh tối 16 %) — R-ON-8, R-ON-5, R-HANH-3.
/// Thiết kế: design/docs/screen_specs.md "Ngồi ôn" (artboard `NgoiOn-doc-*`, `NgoiOn-ngang-*`): cuộn treo nửa trên (dọc)
/// / bên phải (ngang) để luôn thấy nhân vật ngồi. Chọn mục → màn ôn / thẻ bộ thủ / Bộ đã học mở đè lên; đóng → bảng
/// hiện lại, tính lại theo kho tiến độ. Bảng chỉ đóng bằng "Đứng dậy" (Esc, nút quay lại của máy) → SceneView gửi
/// `resume {stand: true}` (docs/bridge.md `openStudy`).
class StudyScreen extends StatefulWidget {
  const StudyScreen({
    super.key,
    required this.request,
    required this.read,
    required this.onReview,
    required this.onLearn,
    this.rewards,
  });

  final OpenStudyRequest request;

  /// tiến độ mới nhất (gọi lại sau mỗi lần học / ôn)
  final StudyProgress Function() read;

  /// mở màn ôn câu đố các bộ đến hạn (chấm vào lịch ôn — R-ON-2); xong khi đóng
  final Future<void> Function(List<ReviewItem> items) onReview;

  /// ghi bộ thủ đã học ("Đã lĩnh hội" lần đầu — R-HANH-3)
  final Future<void> Function(String id) onLearn;

  /// khoản thưởng học bộ mới (+10 — R-TIEN-2) cho thẻ bộ thủ mở từ đây
  final RewardFeed? rewards;

  static Route<void> route(
    OpenStudyRequest request,
    StudyProgress Function() read,
    Future<void> Function(List<ReviewItem>) onReview,
    Future<void> Function(String) onLearn, {
    RewardFeed? rewards,
  }) =>
      PageRouteBuilder<void>(
        opaque: false,
        barrierColor: AppColors.sceneDim,
        transitionDuration: const Duration(milliseconds: 200),
        reverseTransitionDuration: const Duration(milliseconds: 150),
        pageBuilder: (_, _, _) => StudyScreen(request: request, read: read, onReview: onReview, onLearn: onLearn, rewards: rewards),
        // mờ → rõ + trượt xuống 12 px
        transitionsBuilder: (_, a, _, child) => FadeTransition(
          opacity: a,
          child: AnimatedBuilder(
            animation: a,
            builder: (_, c) => Transform.translate(offset: Offset(0, -12 * (1 - a.value)), child: c),
            child: child,
          ),
        ),
      );

  @override
  State<StudyScreen> createState() => _StudyScreenState();
}

class _StudyScreenState extends State<StudyScreen> {
  late StudyBoard _board = _read();
  bool _busy = false;

  StudyBoard _read() => StudyBoard.of(widget.request, widget.read());

  void _standUp() => Navigator.of(context).maybePop();

  /// Mở màn con; đóng → vẫn ngồi, bảng tính lại (R-ON-5, R-HANH-3).
  Future<void> _run(Future<void> Function(NavigatorState nav) open) async {
    if (_busy) return;
    _busy = true;
    try {
      await open(Navigator.of(context));
    } finally {
      _busy = false;
      if (mounted) setState(() => _board = _read());
    }
  }

  Route<bool> _card(Radical r, {required bool learned}) => RadicalScreen.route(
        OpenRadicalRequest(radical: r, learned: learned, region: widget.request.region),
        () => widget.onLearn(r.id),
        rewards: widget.rewards,
      );

  void _open(String id) => _run((nav) async {
        switch (id) {
          case 'review':
            await widget.onReview(_board.reviewItems);
          case 'learn':
            final next = _board.next;
            if (next != null) await nav.push(_card(next, learned: false));
          case 'learned':
            final p = widget.read();
            final picked = await nav.push(LearnedScreen.route(learnedEntries(_board.learned, p.cards, p.today)));
            // chạm một bộ → thẻ bộ thủ "Đã học"; "Xuất định" đóng thẻ, về cuộn sách (không về lưới — R-HANH-3)
            if (picked != null) await nav.push(_card(picked, learned: true));
        }
      });

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    final landscape = mq.size.width > mq.size.height;
    final safe = mq.viewPadding;
    final scroll = _scroll(landscape);
    final Widget placed = landscape
        ? Align(
            alignment: Alignment.topRight,
            child: Padding(
              padding: EdgeInsets.fromLTRB(0, safe.top + 10, safe.right + 13 < 26 ? 26 : safe.right + 13, safe.bottom + 10),
              child: SizedBox(width: 284, child: scroll),
            ),
          )
        : Align(
            alignment: Alignment.topCenter,
            child: Padding(
              padding: EdgeInsets.fromLTRB(safe.left + 16, safe.top + 10, safe.right + 16, safe.bottom + 10),
              child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 358), child: scroll),
            ),
          );
    return CallbackShortcuts(
      bindings: {const SingleActivator(LogicalKeyboardKey.escape): _standUp},
      child: Focus(
        autofocus: true,
        child: Material(type: MaterialType.transparency, child: placed),
      ),
    );
  }

  Widget _scroll(bool landscape) {
    final b = _board;
    final gap = landscape ? 6.0 : 10.0;
    final section = landscape ? 8.0 : 12.0;
    final paper = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        _header(landscape),
        SizedBox(height: section),
        const GoldDotRule(),
        SizedBox(height: section),
        for (final (i, item) in b.items.indexed) ...[
          if (i > 0) SizedBox(height: gap),
          _option(item, landscape),
        ],
        if (b.noneLearned) ...[SizedBox(height: section), const ForestHint()],
        if (b.allLearned) ...[SizedBox(height: section), const AllLearnedBanner()],
      ],
    );
    return Semantics(
      label: 'Cuộn sách Ngồi ôn',
      container: true,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ScrollRod(landscape: landscape),
          Flexible(
            child: ScrollPaper(
              padding: landscape ? const EdgeInsets.fromLTRB(12, 10, 12, 12) : const EdgeInsets.fromLTRB(16, 16, 16, 18),
              // màn thấp: phần trên cuộn được, "Đứng dậy" luôn thấy
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Flexible(child: SingleChildScrollView(child: paper)),
                  SizedBox(height: section),
                  StandUpButton(landscape: landscape, onPressed: _standUp),
                ],
              ),
            ),
          ),
          ScrollRod(landscape: landscape),
        ],
      ),
    );
  }

  Widget _header(bool landscape) => Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.request.region,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: uiText.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700, color: AppColors.slateMuted),
                ),
                const SizedBox(height: 1),
                Text(
                  'Ngồi ôn', // reviewScroll
                  style: displayText.copyWith(fontSize: landscape ? AppTextSize.cardTitle : AppTextSize.accent, color: AppColors.slate),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          const StudySeal(),
        ],
      );

  Widget _option(StudyItem item, bool landscape) {
    final b = _board;
    final look = !item.enabled ? OptionLook.disabled : (b.highlight == item.id ? OptionLook.highlight : OptionLook.normal);
    final (title, icon) = switch (item.id) {
      // reviewDue / reviewDueNone (n = 0 không ghi "(0)")
      'review' => (item.enabled ? 'Ôn bộ đến hạn (${item.count})' : 'Ôn bộ đến hạn', Icons.sync),
      'learn' => ('Học bộ mới', Icons.edit_outlined), // learnNew
      _ => ('Xem bộ đã học', Icons.grid_view), // viewLearned
    };
    final (reason, reasonIcon, reasonColor) = _reason(item);
    return StudyOption(
      key: ValueKey('study-${item.id}'),
      look: look,
      icon: icon,
      title: title,
      sub: item.enabled ? _sub(item.id) : TextSpan(text: reason),
      reasonIcon: reasonIcon,
      reasonIconColor: reasonColor,
      landscape: landscape,
      onTap: () => _open(item.id),
    );
  }

  /// Dòng phụ khi dùng được: các bộ đến hạn · bộ kế tiếp · số bộ đã học + 4 bộ gần nhất.
  InlineSpan _sub(String id) {
    final b = _board;
    switch (id) {
      case 'review':
        return TextSpan(children: [
          for (final it in b.reviewItems) ...[hanSpan(it.radical.form), TextSpan(text: ' ${it.radical.name} · ')],
          const TextSpan(text: 'mỗi bộ 2 câu'), // reviewDueSub
        ]);
      case 'learn':
        final r = b.next!;
        return TextSpan(children: [
          const TextSpan(text: 'Bộ kế tiếp: '), // learnNewNext
          hanSpan(r.form),
          TextSpan(text: ' ${r.name} — ${r.meaning}'),
        ]);
      default:
        final recent = b.learned.length > 4 ? b.learned.sublist(b.learned.length - 4) : b.learned;
        return TextSpan(children: [
          TextSpan(text: '${b.learned.length} / $rungTrucRadicalCount bộ · '), // viewLearnedSub
          hanSpan(recent.map((r) => r.form).join(' ')),
        ]);
    }
  }

  /// Chuỗi + biểu tượng của lý do mờ (`reason` — docs/bridge.md `openStudy`).
  (String, IconData, Color) _reason(StudyItem item) => switch (item.reason) {
        'reviewedToday' => ('Hôm nay đã ôn xong', Icons.check, AppColors.jade), // reviewDueDone
        'allLearned' => ('Đã học đủ', Icons.check, AppColors.jade), // learnAllDone
        'learnInRegion' => ('Học ở Rừng trúc', Icons.place_outlined, AppColors.slateMuted), // learnAtForest
        // noneLearned: Ôn → reviewDueNothing · Xem → viewLearnedNone
        _ => (item.id == 'review' ? 'Chưa có bộ nào để ôn' : 'Chưa học bộ nào', Icons.remove, AppColors.slateMuted),
      };
}
