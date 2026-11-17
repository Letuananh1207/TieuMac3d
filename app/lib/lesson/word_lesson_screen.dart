import 'package:flutter/material.dart';

import '../scene/word_event.dart';
import '../theme/app_colors.dart';
import '../theme/app_fonts.g.dart';
import '../theme/app_text_size.dart';
import 'lesson_screen.dart';
import 'reward_overlay.dart';

/// Màn bài từ (native), che toàn bộ cảnh 3D — R-HANH-3, R-TU-1. **Tạm dùng khung "Thẻ học bộ thủ"**
/// (design/docs/screen_specs.md, artboard `TheBoThu-*`) tới khi có thiết kế màn bài từ (phiếu
/// `docs/phieu_thiet_ke/2026-11-17-hoc-tu-vung.md` mục 1): mỗi từ một trang — chữ to, pinyin, nghĩa, câu ví dụ; lật
/// "‹ Trước" / "Tiếp ›"; trang cuối có "Đã lĩnh hội" → [onLearn] (cả bài vào lịch ôn) rồi đóng. Chưa có: loa (R-AM-5),
/// "Nói theo" (R-TU-3), câu nhanh cuối bài. Bài đã học / mở lại một từ (`learned`) → huy hiệu "Đã học", nút "Xuất định"
/// → đóng, trả `true` (nhân vật đứng dậy). Nút quay lại của máy → đóng, không ghi học (lần sau học lại từ đầu bài).
class WordLessonScreen extends StatefulWidget {
  const WordLessonScreen({super.key, required this.request, required this.onLearn, this.rewards});

  final OpenWordLessonRequest request;
  final Future<void> Function() onLearn;
  final RewardFeed? rewards;

  static Route<bool> route(OpenWordLessonRequest request, Future<void> Function() onLearn, {RewardFeed? rewards}) =>
      PageRouteBuilder<bool>(
        transitionDuration: const Duration(milliseconds: 220),
        reverseTransitionDuration: const Duration(milliseconds: 180),
        pageBuilder: (_, _, _) => WordLessonScreen(request: request, onLearn: onLearn, rewards: rewards),
        transitionsBuilder: (_, a, _, child) => FadeTransition(opacity: a, child: child),
      );

  @override
  State<WordLessonScreen> createState() => _WordLessonScreenState();
}

class _WordLessonScreenState extends State<WordLessonScreen> {
  int _page = 0;

  OpenWordLessonRequest get _r => widget.request;
  bool get _last => _page >= _r.words.length - 1;

  Future<void> _finish() async {
    final nav = Navigator.of(context);
    if (!_r.learned) {
      await widget.onLearn();
      if (mounted) playRewards(context, widget.rewards);
    }
    nav.pop(_r.learned); // "Xuất định" (đã học) → đứng dậy; "Đã lĩnh hội" → khung thoại Trúc Lão mở lại
  }

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    final landscape = mq.size.width > mq.size.height;
    final safe = mq.viewPadding;
    final padding = landscape
        ? EdgeInsets.fromLTRB(safe.left + 12, safe.top + 12, safe.right + 12, safe.bottom + 12)
        : EdgeInsets.fromLTRB(safe.left + 16, safe.top + 12, safe.right + 16, safe.bottom + 16);
    final single = _r.words.length == 1;
    final eyebrow = single ? 'Từ đã học · ${_r.title}' : 'Bài ${_r.index} · ${_r.title} · Từ ${_page + 1} / ${_r.words.length}';
    final card = _Card(word: _r.words[_page], learned: _r.learned, landscape: landscape);
    final buttons = _Buttons(
      canBack: _page > 0,
      last: _last,
      learned: _r.learned,
      onBack: () => setState(() => _page--),
      onNext: () => setState(() => _page++),
      onFinish: _finish,
    );
    return Scaffold(
      backgroundColor: AppColors.sceneBackground,
      body: Stack(
        fit: StackFit.expand,
        children: [
          Positioned(left: 0, right: 0, bottom: 0, child: LessonMountains(landscape: landscape)),
          Padding(
            padding: padding,
            child: landscape
                ? Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(child: card),
                      const SizedBox(width: 16),
                      SizedBox(
                        width: 170,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [const SizedBox(height: 10), _Eyebrow(text: eyebrow, align: TextAlign.start), const Spacer(), buttons],
                        ),
                      ),
                    ],
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _Eyebrow(text: eyebrow, align: TextAlign.center),
                      const SizedBox(height: 16),
                      Expanded(child: card),
                      const SizedBox(height: 16),
                      buttons,
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}

const _ui = TextStyle(fontFamily: AppFonts.ui, fontFamilyFallback: AppFonts.uiFallback, color: AppColors.slate);
const _han = TextStyle(fontFamilyFallback: AppFonts.han, fontWeight: FontWeight.w700, color: AppColors.slate);

class _Eyebrow extends StatelessWidget {
  const _Eyebrow({required this.text, required this.align});

  final String text;
  final TextAlign align;

  @override
  Widget build(BuildContext context) => Text(
        text.toUpperCase(),
        textAlign: align,
        style: _ui.copyWith(fontSize: AppTextSize.eyebrow, fontWeight: FontWeight.w700, letterSpacing: AppTextSize.eyebrow * .12),
      );
}

class _Card extends StatelessWidget {
  const _Card({required this.word, required this.learned, required this.landscape});

  final Word word;
  final bool learned;
  final bool landscape;

  @override
  Widget build(BuildContext context) {
    final heroSize = landscape ? 96.0 : AppTextSize.radicalHero;
    final hero = FittedBox(
      fit: BoxFit.scaleDown,
      child: Text(word.han, maxLines: 1, style: _han.copyWith(fontSize: heroSize, height: 1.1, color: AppColors.jade)),
    );
    final names = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          word.pinyin,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: AppFonts.display,
            fontFamilyFallback: AppFonts.displayFallback,
            fontWeight: FontWeight.w700,
            fontSize: landscape ? 20 : AppTextSize.accent,
            color: AppColors.lacquer,
          ),
        ),
        const SizedBox(height: 4),
        Text(word.meaning, textAlign: TextAlign.center, style: _ui.copyWith(fontSize: landscape ? 16 : AppTextSize.cardTitle, fontWeight: FontWeight.w700)),
      ],
    );
    final size = landscape ? AppTextSize.detail : AppTextSize.body;
    final label = _ui.copyWith(fontSize: size, height: 1.45, fontWeight: FontWeight.w700, color: AppColors.jade);
    final value = _ui.copyWith(fontSize: size, height: 1.45, fontWeight: FontWeight.w500);
    final example = word.example.han.isEmpty
        ? const SizedBox.shrink()
        : Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Câu ví dụ', style: label), // wordExample
              const SizedBox(height: 4),
              Text(word.example.han, style: _han.copyWith(fontSize: AppTextSize.hanExample, fontWeight: FontWeight.w500)),
              Text(word.example.pinyin, style: value.copyWith(color: AppColors.lacquer)),
              Text(word.example.meaning, style: value),
            ],
          );
    final Widget content = landscape
        ? Row(
            children: [
              SizedBox(width: 200, child: Column(mainAxisSize: MainAxisSize.min, children: [hero, const SizedBox(height: 8), names])),
              const SizedBox(width: 20),
              const GoldRule(vertical: true),
              const SizedBox(width: 20),
              Expanded(child: example),
            ],
          )
        : Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [hero, const SizedBox(height: 14), names, const SizedBox(height: 14), const GoldRule(vertical: false), const SizedBox(height: 14), example],
          );
    return Stack(
      children: [
        Positioned.fill(
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: AppColors.frostStrong,
              border: Border.all(color: AppColors.frostOutline),
              borderRadius: BorderRadius.circular(16),
              boxShadow: const [BoxShadow(color: AppColors.cardShadow, offset: Offset(0, 12), blurRadius: 32)],
            ),
            child: LayoutBuilder(
              builder: (context, box) => SingleChildScrollView(
                padding: landscape ? const EdgeInsets.symmetric(horizontal: 22, vertical: 14) : const EdgeInsets.fromLTRB(22, 22, 22, 20),
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: box.maxHeight - (landscape ? 28 : 42)),
                  child: Center(child: content),
                ),
              ),
            ),
          ),
        ),
        if (learned) const Positioned(right: 14, top: 14, child: _LearnedBadge()),
      ],
    );
  }
}

/// Huy hiệu "Đã học" góc trên phải thẻ (viền ngọc lục, chấm vàng).
class _LearnedBadge extends StatelessWidget {
  const _LearnedBadge();

  @override
  Widget build(BuildContext context) => Container(
        height: 26,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: BoxDecoration(border: Border.all(color: AppColors.jade), borderRadius: BorderRadius.circular(999)),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 5, height: 5, decoration: const BoxDecoration(color: AppColors.gold, shape: BoxShape.circle)),
            const SizedBox(width: 6),
            Text('Đã học', style: _ui.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700, color: AppColors.jade)),
          ],
        ),
      );
}

/// Hàng nút: "‹ Trước" (từ trang 2) + "Tiếp ›" / trang cuối "✓ Đã lĩnh hội" (đã học: "‹ Xuất định").
class _Buttons extends StatelessWidget {
  const _Buttons({
    required this.canBack,
    required this.last,
    required this.learned,
    required this.onBack,
    required this.onNext,
    required this.onFinish,
  });

  final bool canBack;
  final bool last;
  final bool learned;
  final VoidCallback onBack;
  final VoidCallback onNext;
  final VoidCallback onFinish;

  @override
  Widget build(BuildContext context) {
    const text = TextStyle(fontFamily: AppFonts.ui, fontFamilyFallback: AppFonts.uiFallback, fontSize: AppTextSize.body, fontWeight: FontWeight.w700);
    final shape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(12));
    final main = FilledButton.icon(
      onPressed: last ? onFinish : onNext,
      icon: Icon(last ? (learned ? Icons.chevron_left : Icons.check) : Icons.chevron_right, size: 20),
      label: Text(last ? (learned ? 'Xuất định' : 'Đã lĩnh hội') : 'Tiếp'), // radicalBack / radicalLearn / wordNext
      style: FilledButton.styleFrom(
        minimumSize: const Size.fromHeight(52),
        backgroundColor: AppColors.jade,
        foregroundColor: AppColors.onJade,
        shape: shape,
        textStyle: text,
      ),
    );
    if (!canBack) return main;
    final back = OutlinedButton.icon(
      onPressed: onBack,
      icon: const Icon(Icons.chevron_left, size: 20),
      label: const Text('Trước'), // wordPrev
      style: OutlinedButton.styleFrom(
        minimumSize: const Size.fromHeight(52),
        foregroundColor: AppColors.jade,
        side: const BorderSide(color: AppColors.jade),
        shape: shape,
        textStyle: text,
      ),
    );
    return Row(children: [Expanded(flex: 2, child: back), const SizedBox(width: 10), Expanded(flex: 3, child: main)]);
  }
}
