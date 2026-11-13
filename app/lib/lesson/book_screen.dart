import 'package:flutter/material.dart';

import '../scene/library_event.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'lesson_screen.dart';
import 'screen_parts.dart';

/// Cỡ chữ của từ trên trang sổ từ (thiết kế 2026-11-13.28): 1–2 chữ 104 · 3–4 chữ 64 · từ hai phần (虽然…但是) hoặc dài hơn 52.
/// Màn ngang nhỏ hơn một bậc.
double wordSize(String han, {bool landscape = false}) {
  final chars = han.replaceAll(RegExp(r'[…\.\s·]'), '').runes.length;
  final full = han.contains('…') || chars > 4 ? AppTextSize.wordLong : (chars <= 2 ? AppTextSize.wordShort : AppTextSize.wordMid);
  return landscape ? full * .62 : full;
}

/// Sổ từ — màn đọc (native) — R-SACH-3. Thiết kế: design/docs/screen_specs.md "Sổ từ — màn đọc" (artboard `SoTu-*`). Mở ở
/// trang [startPage] (đếm từ 0); đóng (× / nút quay lại) → [onClose] ghi trang đang đọc.
class BookScreen extends StatefulWidget {
  const BookScreen({super.key, required this.request, required this.startPage, required this.onClose});

  final OpenBookRequest request;
  final int startPage;
  final Future<void> Function(int page) onClose;

  static Route<void> route(OpenBookRequest request, int startPage, Future<void> Function(int page) onClose) =>
      fadeRoute(BookScreen(request: request, startPage: startPage, onClose: onClose));

  @override
  State<BookScreen> createState() => _BookScreenState();
}

class _BookScreenState extends State<BookScreen> {
  late int _page = widget.startPage.clamp(0, _count - 1);
  bool _saved = false;

  int get _count => widget.request.words.length;

  void _go(int p) => setState(() => _page = p.clamp(0, _count - 1));

  Future<void> _save() async {
    if (_saved) return;
    _saved = true;
    await widget.onClose(_page);
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.request;
    return PopScope(
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) _save(); // nút quay lại của máy cũng ghi trang (R-SACH-3)
      },
      child: ScreenFrame(builder: (context, landscape) {
        final close = _RoundClose(onTap: () => Navigator.of(context).maybePop());
        final title = Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('${r.title} · ${r.subtitle}', maxLines: 1, overflow: TextOverflow.ellipsis, style: uiText.copyWith(fontSize: landscape ? AppTextSize.small : AppTextSize.detail, fontWeight: FontWeight.w700)),
            Text(landscape ? 'Trang ${_page + 1} / $_count' : 'Sổ từ · 简体', style: uiText.copyWith(fontSize: AppTextSize.caption)), // bookSub / bookPage
          ],
        );
        final slider = _PageSlider(page: _page, count: _count, onChanged: _go);
        final prev = SecondaryButton(label: 'Trang trước', icon: Icons.chevron_left, onPressed: _page > 0 ? () => _go(_page - 1) : null); // bookPrev
        final next = PrimaryButton(label: 'Trang sau', trailing: Icons.chevron_right, onPressed: _page < _count - 1 ? () => _go(_page + 1) : null); // bookNext
        final page = GestureDetector(
          onHorizontalDragEnd: (d) {
            final v = d.primaryVelocity ?? 0;
            if (v < -200) _go(_page + 1);
            if (v > 200) _go(_page - 1);
          },
          child: _Page(word: r.words[_page], landscape: landscape),
        );
        if (landscape) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(child: page),
              const SizedBox(width: 14),
              SizedBox(
                width: 180,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(children: [close, const SizedBox(width: 10), Expanded(child: title)]),
                    const SizedBox(height: 10),
                    slider,
                    const Spacer(),
                    next,
                    const SizedBox(height: 10),
                    SizedBox(height: 48, child: prev),
                  ],
                ),
              ),
            ],
          );
        }
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(children: [close, const SizedBox(width: 10), Expanded(child: title), _PagePill(text: 'Trang ${_page + 1} / $_count')]),
            const SizedBox(height: 14),
            Expanded(child: page),
            const SizedBox(height: 14),
            slider,
            const SizedBox(height: 6),
            Row(children: [Expanded(child: prev), const SizedBox(width: 10), Expanded(child: next)]),
          ],
        );
      }),
    );
  }
}

/// Trang giấy `map-paper`, gáy trái có bóng trong, dải son đánh dấu mép trên phải.
class _Page extends StatelessWidget {
  const _Page({required this.word, required this.landscape});

  final BookWord word;
  final bool landscape;

  @override
  Widget build(BuildContext context) {
    final w = word;
    final head = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(w.han, textAlign: TextAlign.center, style: hanText.copyWith(fontSize: wordSize(w.han, landscape: landscape), height: 1.1)),
        const SizedBox(height: 6),
        Text(w.pinyin, textAlign: TextAlign.center, style: displayText.copyWith(fontSize: landscape ? AppTextSize.accent : AppTextSize.pinyinLarge, color: AppColors.lacquer)),
        const SizedBox(height: 4),
        Text(w.meaning, textAlign: TextAlign.center, style: uiText.copyWith(fontSize: landscape ? AppTextSize.cardTitle : AppTextSize.meaning, fontWeight: FontWeight.w700)),
      ],
    );
    final ex = w.example;
    final example = ex == null
        ? const SizedBox.shrink()
        : Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('VÍ DỤ', style: uiText.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700, color: AppColors.jade, letterSpacing: AppTextSize.caption * .1)), // bookExample
              const SizedBox(height: 6),
              Text(ex.han, style: hanText.copyWith(fontSize: landscape ? AppTextSize.accent : AppTextSize.exampleHan, height: 1.4, color: AppColors.slate)),
              const SizedBox(height: 6),
              Text(ex.pinyin, style: displayText.copyWith(fontSize: landscape ? AppTextSize.body : AppTextSize.task, color: AppColors.slate)),
              const SizedBox(height: 6),
              Text(ex.meaning, style: uiText.copyWith(fontSize: landscape ? AppTextSize.detail : AppTextSize.body, height: 1.5)),
            ],
          );
    final content = landscape
        ? Row(
            children: [
              SizedBox(width: 230, child: head),
              const SizedBox(width: 20),
              const GoldRule(vertical: true),
              const SizedBox(width: 20),
              Expanded(child: example),
            ],
          )
        : Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [const SizedBox(height: 10), head, const SizedBox(height: 16), const GoldRule(vertical: false), const SizedBox(height: 16), example],
          );
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.mapPaper,
        border: Border.all(color: AppColors.frostOutline),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(6),
          bottomLeft: Radius.circular(6),
          topRight: Radius.circular(14),
          bottomRight: Radius.circular(14),
        ),
        boxShadow: const [BoxShadow(color: AppColors.cardShadow, offset: Offset(0, 12), blurRadius: 28)],
      ),
      child: Stack(
        children: [
          // gáy bên trái: bóng trong
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            width: 14,
            child: DecoratedBox(
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.horizontal(left: Radius.circular(6)),
                gradient: LinearGradient(colors: [AppColors.shelfShadow.withValues(alpha: .3), AppColors.shelfShadow.withValues(alpha: 0)]),
              ),
            ),
          ),
          Positioned.fill(
            child: LayoutBuilder(
              builder: (context, box) => SingleChildScrollView(
                padding: landscape ? const EdgeInsets.symmetric(horizontal: 24, vertical: 18) : const EdgeInsets.fromLTRB(22, 26, 22, 20),
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: (box.maxHeight - (landscape ? 36 : 46)).clamp(0, double.infinity)),
                  child: Center(child: content),
                ),
              ),
            ),
          ),
          const Positioned(right: 10, top: 0, child: _Ribbon()),
        ],
      ),
    );
  }
}

/// Dải son đánh dấu trang 14 × 34, đuôi xẻ.
class _Ribbon extends StatelessWidget {
  const _Ribbon();

  @override
  Widget build(BuildContext context) => ClipPath(clipper: _RibbonClip(), child: const SizedBox(width: 14, height: 34, child: ColoredBox(color: AppColors.lacquer)));
}

class _RibbonClip extends CustomClipper<Path> {
  @override
  Path getClip(Size s) => Path()
    ..moveTo(0, 0)
    ..lineTo(s.width, 0)
    ..lineTo(s.width, s.height)
    ..lineTo(s.width / 2, s.height * .78)
    ..lineTo(0, s.height)
    ..close();

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}

/// Nút tròn × 44 kính sương ("Đóng sổ").
class _RoundClose extends StatelessWidget {
  const _RoundClose({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Semantics(
        button: true,
        label: 'Đóng sổ', // bookClose
        child: Material(
          color: AppColors.frostStrong,
          shape: CircleBorder(side: BorderSide(color: AppColors.slate.withValues(alpha: .16))),
          clipBehavior: Clip.antiAlias,
          child: InkWell(onTap: onTap, child: const SizedBox(width: 44, height: 44, child: Icon(Icons.close, size: 18, color: AppColors.slate))),
        ),
      );
}

/// Viên "Trang n / N" kính sương.
class _PagePill extends StatelessWidget {
  const _PagePill({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) => Container(
        height: 32,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: AppColors.frostStrong,
          border: Border.all(color: AppColors.frostOutline),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(text, style: uiText.copyWith(fontSize: AppTextSize.small, fontWeight: FontWeight.w700)), // bookPage
      );
}

/// Thanh kéo tới trang: rãnh 4, phần đã đọc ngọc, núm 24 trắng viền ngọc.
class _PageSlider extends StatelessWidget {
  const _PageSlider({required this.page, required this.count, required this.onChanged});

  final int page;
  final int count;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) => SliderTheme(
        data: SliderTheme.of(context).copyWith(
          trackHeight: 4,
          activeTrackColor: AppColors.jade,
          inactiveTrackColor: AppColors.slate.withValues(alpha: .15),
          thumbColor: AppColors.onJade,
          overlayShape: SliderComponentShape.noOverlay,
          thumbShape: const _RingThumb(),
          trackShape: const RoundedRectSliderTrackShape(),
        ),
        child: SizedBox(
          height: 24,
          child: Semantics(
            label: 'Kéo để tới trang', // bookSlider
            child: Slider(
              value: page.toDouble(),
              max: (count - 1).toDouble().clamp(1, double.infinity),
              divisions: count > 1 ? count - 1 : null,
              onChanged: count > 1 ? (v) => onChanged(v.round()) : null,
            ),
          ),
        ),
      );
}

/// Núm 24 trắng viền ngọc 2.
class _RingThumb extends SliderComponentShape {
  const _RingThumb();

  @override
  Size getPreferredSize(bool isEnabled, bool isDiscrete) => const Size(24, 24);

  @override
  void paint(PaintingContext context, Offset center,
      {required Animation<double> activationAnimation,
      required Animation<double> enableAnimation,
      required bool isDiscrete,
      required TextPainter labelPainter,
      required RenderBox parentBox,
      required SliderThemeData sliderTheme,
      required TextDirection textDirection,
      required double value,
      required double textScaleFactor,
      required Size sizeWithOverflow}) {
    final c = context.canvas;
    c.drawCircle(center + const Offset(0, 2), 12, Paint()..color = AppColors.cardShadow..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3));
    c.drawCircle(center, 12, Paint()..color = AppColors.onJade);
    c.drawCircle(center, 11, Paint()..color = AppColors.jade..style = PaintingStyle.stroke..strokeWidth = 2);
  }
}
