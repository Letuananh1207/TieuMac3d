import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../journey/daily.dart';
import '../journey/progress_store.dart';
import '../scene/review_event.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'lesson_screen.dart';
import 'daily_parts.dart';
import 'screen_parts.dart';

/// Số liệu bảng nhiệm vụ hôm nay (đọc lại sau mỗi lượt ôn).
class DailyView {
  const DailyView({
    required this.status,
    required this.streak,
    required this.doneDays,
    required this.today,
    required this.now,
    this.learnedToday = const [],
    this.dueIds = const [],
    this.learnedTotal = 0,
    this.reviewedToday = false,
  });

  /// Đọc từ kho tiến độ (ghi luôn ngày đã xong nếu vừa đủ — R-NV-2).
  factory DailyView.of(ProgressStore s) {
    s.checkDaily();
    final today = s.today;
    return DailyView(
      status: s.daily,
      streak: s.streak,
      doneDays: s.doneDays,
      today: today,
      now: s.now,
      learnedToday: s.learnedToday,
      dueIds: s.dueRadicals,
      learnedTotal: s.progress.radicals.length,
      reviewedToday: s.cards.values.any((c) => c.lastDay == today),
    );
  }

  final DailyStatus status;
  final ({int current, int best}) streak;
  final Set<int> doneDays;

  /// số ngày ([dayOf]) và giờ máy của hôm nay
  final int today;
  final DateTime now;

  /// mã bộ học mới hôm nay · mã bộ còn đến hạn (thứ tự hỏi)
  final List<String> learnedToday;
  final List<String> dueIds;

  /// tổng số bộ đã học (0 → dòng phụ "bộ đầu tiên")
  final int learnedTotal;

  /// hôm nay đã ôn ít nhất một bộ ("Đã ôn hết" thay vì "Không có bộ nào")
  final bool reviewedToday;
}

const _weekdays = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
const _dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/// Bảng nhiệm vụ hằng ngày 日課榜 (native) — R-NV-1/2/3. Thiết kế: design/docs/screen_specs.md "Bảng nhiệm vụ hằng ngày"
/// (artboard `NhiemVu-doc`, `-doc-moi`, `-doc-xong`, `-ngang`). "Ôn ngay" mở màn ôn tại chỗ ([onReview], R-ON-5); đóng
/// bằng "Đóng bảng" / nút quay lại của máy.
class DailyScreen extends StatefulWidget {
  const DailyScreen({super.key, required this.request, required this.read, required this.onReview});

  final OpenDailyRequest request;
  final DailyView Function() read;
  final Future<void> Function(List<ReviewItem> items) onReview;

  static Route<void> route(OpenDailyRequest request, DailyView Function() read, Future<void> Function(List<ReviewItem>) onReview) =>
      fadeRoute(DailyScreen(request: request, read: read, onReview: onReview));

  @override
  State<DailyScreen> createState() => _DailyScreenState();
}

class _DailyScreenState extends State<DailyScreen> {
  late DailyView _v = widget.read();

  String _form(String id) =>
      widget.request.forms[id] ?? widget.request.review.where((i) => i.radical.id == id).firstOrNull?.radical.form ?? '';

  /// Câu đố của các bộ còn đến hạn, theo thứ tự hỏi.
  List<ReviewItem> get _items {
    final byId = {for (final i in widget.request.review) i.radical.id: i};
    return [for (final id in _v.dueIds) ?byId[id]];
  }

  Future<void> _review() async {
    await widget.onReview(_items);
    if (mounted) setState(() => _v = widget.read());
  }

  @override
  Widget build(BuildContext context) {
    void close() => Navigator.of(context).pop();
    return ScreenFrame(
      builder: (context, landscape) {
        final seal = _v.status.done ? const Positioned(right: 16, top: 16, child: DoneSeal()) : null;
        if (landscape) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: SilkCard(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  overlay: seal,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(child: Column(mainAxisSize: MainAxisSize.min, children: _tasks(42, 14))),
                      const SizedBox(width: 20),
                      const SizedBox(width: 1, child: ColoredBox(color: AppColors.divider)),
                      const SizedBox(width: 20),
                      SizedBox(
                        width: 250,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [_title(landscape: true), const SizedBox(height: 14), _streak()],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 14),
              SizedBox(
                width: 120,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [SecondaryButton(label: 'Đóng', icon: Icons.close, height: 48, onPressed: close)],
                ),
              ),
            ],
          );
        }
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Eyebrow('Khởi Nguyên Trấn · cổng nam'), // dailyEyebrow
            const SizedBox(height: 14),
            Expanded(
              child: SilkCard(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 18),
                overlay: seal,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _title(landscape: false),
                    const SizedBox(height: 16),
                    const GoldRule(vertical: false),
                    const SizedBox(height: 16),
                    ..._tasks(46, 16),
                    const SizedBox(height: 16),
                    const GoldRule(vertical: false),
                    const SizedBox(height: 16),
                    _streak(),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            SecondaryButton(label: 'Đóng bảng', icon: Icons.close, onPressed: close), // dailyClose
          ],
        );
      },
    );
  }

  Widget _title({required bool landscape}) {
    final n = _v.now;
    final date = '${n.day}/${n.month}';
    return Column(
      children: [
        Text('日課榜', style: hanText.copyWith(fontSize: AppTextSize.dailyTitle, height: 1.1, letterSpacing: AppTextSize.dailyTitle * .08)),
        const SizedBox(height: 2),
        Text(
          landscape ? 'Nhiệm vụ hằng ngày · $date' : 'Nhiệm vụ hằng ngày · ${_weekdays[n.weekday - 1]} $date', // dailyTitle
          textAlign: TextAlign.center,
          style: uiText.copyWith(fontSize: AppTextSize.small, fontWeight: FontWeight.w700),
        ),
      ],
    );
  }

  List<Widget> _tasks(double reviewButton, double gap) {
    final s = _v.status;
    final learnSub = s.allLearned
        ? 'Đã học đủ 50 bộ thủ.' // dailyLearnAll
        : s.learnDone
            ? 'Đã học $dailyNewGoal bộ mới hôm nay${_v.learnedToday.isEmpty ? '' : ': ${_v.learnedToday.map(_form).join(' ')}'}.' // dailyLearnDone
            : _v.learnedTotal == 0
                ? 'Học $dailyNewGoal bộ thủ mới. Tới Truyền Tống Đài → Rừng trúc, ngồi thiền để lĩnh hội bộ đầu tiên.' // dailyLearnFirst
                : 'Học $dailyNewGoal bộ thủ mới. Ngồi thiền ở Rừng trúc để lĩnh hội bộ kế tiếp.'; // dailyLearnSub
    final items = _items;
    return [
      DailyTask(
        title: 'Lĩnh hội', // dailyLearn
        done: s.learnDone,
        progress: s.allLearned ? null : ProgressDots(math.min(s.newToday, dailyNewGoal)),
        sub: Text(learnSub, style: _sub(s.learnDone)),
      ),
      SizedBox(height: gap),
      DailyTask(
        title: 'Ôn tập', // dailyReview
        done: s.reviewDone,
        progress: s.reviewDone ? null : Text('còn ${s.dueLeft}', style: uiText.copyWith(fontSize: AppTextSize.detail, fontWeight: FontWeight.w700)),
        sub: s.reviewDone
            ? Text(_v.reviewedToday ? 'Đã ôn hết bộ đến hạn.' : 'Không có bộ nào đến hạn.', style: _sub(true)) // dailyReviewDone / None
            : Text.rich(
                TextSpan(children: [
                  const TextSpan(text: 'Còn '),
                  TextSpan(text: '${s.dueLeft} bộ', style: const TextStyle(fontWeight: FontWeight.w700)),
                  const TextSpan(text: ' đến hạn hôm nay.'), // dailyReviewDue
                ]),
                style: _sub(false),
              ),
        extra: s.reviewDone || items.isEmpty
            ? const []
            : [
                DueTiles(forms: [for (final id in _v.dueIds) _form(id)]),
                PrimaryButton(label: 'Ôn ngay', trailing: Icons.arrow_forward, height: reviewButton, onPressed: _review), // dailyReviewNow
              ],
      ),
    ];
  }

  TextStyle _sub(bool done) => uiText.copyWith(fontSize: AppTextSize.small, height: 1.45, color: done ? AppColors.jade : AppColors.slate);

  Widget _streak() {
    final st = _v.streak;
    final todayDone = _v.doneDays.contains(_v.today);
    final strip = weekStrip(_v.doneDays, _v.today, _v.now.weekday);
    final label = uiText.copyWith(fontSize: AppTextSize.small, fontWeight: FontWeight.w700);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            // cột hẹp (ngang 250) + viên "Kỷ lục mới" → viên xuống dòng thay vì tràn
            Expanded(
              child: Wrap(
                spacing: 6,
                runSpacing: 4,
                crossAxisAlignment: WrapCrossAlignment.end,
                children: [
                  Text('Tu liền', style: label), // dailyStreak
                  Text('${st.current}', style: displayText.copyWith(fontSize: AppTextSize.dailyTitle, height: 1)),
                  Text('ngày', style: label),
                  if (isNewRecord(_v.doneDays, _v.today, st)) const RecordPill(),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Flexible(
              child: Text.rich(
                TextSpan(children: [
                  const TextSpan(text: 'Kỷ lục '),
                  TextSpan(text: '${st.best}', style: const TextStyle(fontWeight: FontWeight.w700)),
                  const TextSpan(text: ' ngày'), // dailyBest
                ]),
                textAlign: TextAlign.right,
                style: uiText.copyWith(fontSize: AppTextSize.small),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [for (var i = 0; i < 7; i++) WeekDay(mark: strip[i], label: _dayLabels[i])],
        ),
        const SizedBox(height: 10),
        Text.rich(
          todayDone
              ? const TextSpan(text: 'Hôm nay đã xong — ngày được tính vào chuỗi.') // dailyDone
              : st.current > 0
                  ? TextSpan(children: [
                      const TextSpan(text: 'Hôm nay chưa xong — chuỗi vẫn giữ '),
                      TextSpan(text: '${st.current}', style: const TextStyle(fontWeight: FontWeight.w700)),
                      const TextSpan(text: ' tới hết ngày.'), // dailyKeep
                    ])
                  : const TextSpan(text: 'Xong cả 2 việc hôm nay để bắt đầu chuỗi.'), // dailyStart
          style: uiText.copyWith(fontSize: AppTextSize.caption, height: 1.45),
        ),
      ],
    );
  }
}

