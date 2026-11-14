import 'package:flutter/material.dart';

import '../scene/scene_event.dart';
import '../theme/app_colors.dart';
import '../theme/app_fonts.g.dart';
import '../theme/app_text_size.dart';
import 'lesson_screen.dart';
import 'reward_overlay.dart';
import 'svg_strokes.dart';

/// Thẻ học bộ thủ (native), che toàn bộ cảnh 3D — R-HANH-3.
/// Thiết kế: design/docs/screen_specs.md "Thẻ học bộ thủ" (artboard `TheBoThu-doc`, `TheBoThu-doc-on`, `TheBoThu-ngang`);
/// khung như màn bài học. Lần đầu: nút "Đã lĩnh hội" → [onLearn] rồi đóng, vẫn ngồi; đã học: huy hiệu "Đã học", nút
/// "Xuất định" → đóng, trả `true` (nhân vật đứng dậy — R-HANH-3, thiết kế 2026-11-13.19). Nút quay lại của máy → đóng,
/// không ghi học, không đứng dậy. Học lần đầu có thưởng ([rewards]) → hiệu ứng "+10 · Học bộ 竹" chạy trên lớp phủ gốc,
/// thẻ vẫn đóng ngay (R-TIEN-5).
class RadicalScreen extends StatelessWidget {
  const RadicalScreen({super.key, required this.request, required this.onLearn, this.rewards});

  final OpenRadicalRequest request;
  final Future<void> Function() onLearn;
  final RewardFeed? rewards;

  static Route<bool> route(OpenRadicalRequest request, Future<void> Function() onLearn, {RewardFeed? rewards}) =>
      PageRouteBuilder<bool>(
        transitionDuration: const Duration(milliseconds: 220),
        reverseTransitionDuration: const Duration(milliseconds: 180),
        pageBuilder: (_, _, _) => RadicalScreen(request: request, onLearn: onLearn, rewards: rewards),
        transitionsBuilder: (_, a, _, child) => FadeTransition(opacity: a, child: child),
      );

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    final landscape = mq.size.width > mq.size.height;
    final safe = mq.viewPadding;
    final padding = landscape
        ? EdgeInsets.fromLTRB(safe.left + 12, safe.top + 12, safe.right + 12, safe.bottom + 12)
        : EdgeInsets.fromLTRB(safe.left + 16, safe.top + 12, safe.right + 16, safe.bottom + 16);
    final eyebrow = 'Bộ thủ · ${request.region}'; // radicalEyebrow
    final button = _MainButton(
      learned: request.learned,
      onPressed: () async {
        final nav = Navigator.of(context);
        if (!request.learned) {
          await onLearn();
          if (context.mounted) playRewards(context, rewards);
        }
        nav.pop(request.learned); // "Xuất định" (đã học) → đứng dậy; "Đã lĩnh hội" → vẫn ngồi
      },
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
                      Expanded(child: _Card(request: request, landscape: true)),
                      const SizedBox(width: 16),
                      SizedBox(
                        width: 150,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const SizedBox(height: 10),
                            _Eyebrow(text: eyebrow, align: TextAlign.start),
                            const Spacer(),
                            button,
                          ],
                        ),
                      ),
                    ],
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _Eyebrow(text: eyebrow, align: TextAlign.center),
                      const SizedBox(height: 16),
                      Expanded(child: _Card(request: request, landscape: false)),
                      const SizedBox(height: 16),
                      button,
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
  const _Card({required this.request, required this.landscape});

  final OpenRadicalRequest request;
  final bool landscape;

  @override
  Widget build(BuildContext context) {
    final r = request.radical;
    final heroSize = landscape ? 104.0 : AppTextSize.radicalHero;
    final hero = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(r.form, style: _han.copyWith(fontSize: heroSize, height: 1, color: AppColors.jade)),
        if (r.full != null) ...[
          SizedBox(width: landscape ? 12 : 18),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('dạng đủ', style: _ui.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700)), // radicalFullForm
              Text(r.full!, style: _han.copyWith(fontSize: landscape ? 40 : AppTextSize.radicalFull, height: 1.1)),
            ],
          ),
        ],
      ],
    );
    final names = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          r.pinyin,
          style: TextStyle(
            fontFamily: AppFonts.display,
            fontFamilyFallback: AppFonts.displayFallback,
            fontWeight: FontWeight.w700,
            fontSize: landscape ? 20 : AppTextSize.accent,
            color: AppColors.lacquer,
          ),
        ),
        const SizedBox(height: 4),
        Text('${r.name} — ${r.meaning}', textAlign: TextAlign.center, style: _ui.copyWith(fontSize: landscape ? 16 : AppTextSize.cardTitle, fontWeight: FontWeight.w700)),
      ],
    );
    final strokes = r.full != null && r.fullStrokes != null ? '${r.fullStrokes} (${r.full}) · ${r.strokes} (${r.form})' : '${r.strokes}';
    final table = _Table(strokes: strokes, examples: r.examples, landscape: landscape);
    final evolution = r.hinh.isEmpty ? null : _Evolution(radical: r, landscape: landscape);

    final Widget content = landscape
        ? Row(
            children: [
              SizedBox(width: 168, child: Column(mainAxisSize: MainAxisSize.min, children: [hero, const SizedBox(height: 8), names])),
              const SizedBox(width: 20),
              const GoldRule(vertical: true),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [if (evolution != null) ...[evolution, const SizedBox(height: 12)], table],
                ),
              ),
            ],
          )
        : Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              hero,
              const SizedBox(height: 14),
              names,
              const SizedBox(height: 14),
              const GoldRule(vertical: false),
              const SizedBox(height: 14),
              if (evolution != null) ...[evolution, const SizedBox(height: 14)],
              table,
            ],
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
        if (request.learned) const Positioned(right: 14, top: 14, child: _LearnedBadge()),
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
            Text('Đã học', style: _ui.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700, color: AppColors.jade)), // radicalLearned
          ],
        ),
      );
}

/// "Từ hình đến chữ": hình vẽ → chữ triện → chữ khải, nối bằng mũi tên.
class _Evolution extends StatelessWidget {
  const _Evolution({required this.radical, required this.landscape});

  final Radical radical;
  final bool landscape;

  @override
  Widget build(BuildContext context) {
    final cell = landscape ? 62.0 : 78.0;
    Widget box(Widget child, String caption) => Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: cell,
              height: cell,
              decoration: BoxDecoration(
                color: AppColors.mapPaper,
                border: Border.all(color: AppColors.frostOutline),
                borderRadius: BorderRadius.circular(12),
              ),
              alignment: Alignment.center,
              child: child,
            ),
            const SizedBox(height: 4),
            Text(caption, style: _ui.copyWith(fontSize: AppTextSize.caption)),
          ],
        );
    final art = cell * 0.77;
    const arrow = Icon(Icons.arrow_forward, size: 16, color: AppColors.jade);
    final full = radical.full ?? radical.form;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('Từ hình đến chữ', style: _ui.copyWith(fontSize: AppTextSize.body, fontWeight: FontWeight.w700, color: AppColors.jade)), // radicalEvolution
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            box(StrokeArt(paths: radical.hinh, size: art, label: 'Hình vẽ ${radical.meaning}'), 'hình ${radical.meaning.split(',').first}'),
            arrow,
            box(StrokeArt(paths: radical.trien, size: art, label: 'Chữ triện $full'), 'chữ triện'),
            arrow,
            box(Text(full, style: _han.copyWith(fontSize: cell * 0.59, height: 1, color: AppColors.jade)), 'chữ khải'),
          ],
        ),
      ],
    );
  }
}

/// Bảng phụ: "Nét", "Chữ có bộ này" (chữ Hán + pinyin · nghĩa).
class _Table extends StatelessWidget {
  const _Table({required this.strokes, required this.examples, required this.landscape});

  final String strokes;
  final List<(String, String, String)> examples;
  final bool landscape;

  @override
  Widget build(BuildContext context) {
    final size = landscape ? AppTextSize.detail : AppTextSize.body;
    final label = _ui.copyWith(fontSize: size, height: 1.45, fontWeight: FontWeight.w700, color: AppColors.jade);
    final value = _ui.copyWith(fontSize: size, height: 1.45, fontWeight: FontWeight.w500);
    return Table(
      columnWidths: const {0: IntrinsicColumnWidth(), 1: FlexColumnWidth()},
      defaultVerticalAlignment: TableCellVerticalAlignment.top,
      children: [
        TableRow(children: [
          Padding(padding: const EdgeInsets.only(right: 16), child: Text('Nét', style: label)), // radicalStrokes
          Text(strokes, style: value),
        ]),
        TableRow(children: [
          Padding(padding: EdgeInsets.only(right: 16, top: landscape ? 8 : 12), child: Text('Chữ có bộ này', style: label)), // radicalExamples
          Padding(
            padding: EdgeInsets.only(top: landscape ? 8 : 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (final (han, py, vi) in examples)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Text.rich(TextSpan(children: [
                      TextSpan(text: han, style: _han.copyWith(fontSize: AppTextSize.hanExample, fontWeight: FontWeight.w500)),
                      TextSpan(text: ' $py · $vi', style: value),
                    ])),
                  ),
              ],
            ),
          ),
        ]),
      ],
    );
  }
}

/// Nút chính: lần đầu "✓ Đã lĩnh hội"; đã học "‹ Xuất định".
class _MainButton extends StatelessWidget {
  const _MainButton({required this.learned, required this.onPressed});

  final bool learned;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [BoxShadow(color: AppColors.primaryShadow, offset: Offset(0, 4), blurRadius: 12)],
      ),
      child: FilledButton.icon(
        onPressed: onPressed,
        icon: Icon(learned ? Icons.chevron_left : Icons.check, size: 20),
        label: Text(learned ? 'Xuất định' : 'Đã lĩnh hội'), // radicalBack / radicalLearn
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          backgroundColor: AppColors.jade,
          foregroundColor: AppColors.onJade,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(
            fontFamily: AppFonts.ui,
            fontFamilyFallback: AppFonts.uiFallback,
            fontSize: AppTextSize.body,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
