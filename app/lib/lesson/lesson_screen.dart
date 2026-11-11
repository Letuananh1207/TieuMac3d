import 'package:flutter/material.dart';

import '../scene/scene_event.dart';
import '../theme/app_colors.dart';
import '../theme/app_fonts.g.dart';
import '../theme/app_text_size.dart';

/// Màn bài học chữ Hán (native), che toàn bộ cảnh 3D.
/// Thiết kế: design/docs/screen_specs.md mục "Màn bài học" (artboard `BaiHoc-doc`, `BaiHoc-ngang`).
/// Mở khi trang gửi `openLesson` (docs/bridge.md); "Ra sân" / nút quay lại của máy → đóng, cảnh chạy tiếp (R-VUNG-3).
class LessonScreen extends StatelessWidget {
  const LessonScreen({super.key, required this.lesson});

  final Lesson lesson;

  /// Mở bằng hiệu ứng mờ dần (không trượt — cảnh 3D phía sau như "dừng lại" chứ không đổi trang).
  static Route<void> route(Lesson lesson) => PageRouteBuilder<void>(
        transitionDuration: const Duration(milliseconds: 220),
        reverseTransitionDuration: const Duration(milliseconds: 180),
        pageBuilder: (_, _, _) => LessonScreen(lesson: lesson),
        transitionsBuilder: (_, a, _, child) => FadeTransition(opacity: a, child: child),
      );

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    final landscape = mq.size.width > mq.size.height;
    final safe = mq.viewPadding;
    // dọc: trên 12 + vùng an toàn, hai bên 16, dưới 16 + vùng an toàn · ngang: hai bên 12 + vùng an toàn, trên / dưới 12
    final padding = landscape
        ? EdgeInsets.fromLTRB(safe.left + 12, safe.top + 12, safe.right + 12, safe.bottom + 12)
        : EdgeInsets.fromLTRB(safe.left + 16, safe.top + 12, safe.right + 16, safe.bottom + 16);
    void back() => Navigator.of(context).pop();

    return Scaffold(
      backgroundColor: AppColors.sceneBackground,
      body: Stack(
        fit: StackFit.expand,
        children: [
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: _Mountains(landscape: landscape),
          ),
          Padding(
            padding: padding,
            child: landscape
                ? Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(child: _Card(lesson: lesson, landscape: true)),
                      const SizedBox(width: 16),
                      SizedBox(
                        width: 150,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const SizedBox(height: 10),
                            const _Eyebrow(align: TextAlign.start),
                            const Spacer(),
                            _BackButton(onPressed: back),
                          ],
                        ),
                      ),
                    ],
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const _Eyebrow(align: TextAlign.center),
                      const SizedBox(height: 16),
                      Expanded(child: _Card(lesson: lesson, landscape: false)),
                      const SizedBox(height: 16),
                      _BackButton(onPressed: back),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}

const _ui = TextStyle(fontFamily: AppFonts.ui, fontFamilyFallback: AppFonts.uiFallback, color: AppColors.slate);

class _Eyebrow extends StatelessWidget {
  const _Eyebrow({required this.align});

  final TextAlign align;

  @override
  Widget build(BuildContext context) => Text(
        'Bài học chữ Hán'.toUpperCase(), // lessonEyebrow; thiết kế in hoa giãn chữ
        textAlign: align,
        style: _ui.copyWith(fontSize: AppTextSize.eyebrow, fontWeight: FontWeight.w700, letterSpacing: AppTextSize.eyebrow * .12),
      );
}

/// Tấm "lụa": chữ lớn + pinyin + nghĩa, vạch chấm vàng, các dòng phụ nhãn → giá trị.
class _Card extends StatelessWidget {
  const _Card({required this.lesson, required this.landscape});

  final Lesson lesson;
  final bool landscape;

  @override
  Widget build(BuildContext context) {
    final hero = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          lesson.han,
          style: const TextStyle(
            // chữ Hán chia nhiều họ theo bảng mã → để Flutter tìm trong cả danh sách
            fontFamilyFallback: AppFonts.han,
            fontWeight: FontWeight.w700,
            fontSize: AppTextSize.hanHero,
            height: 1,
            color: AppColors.jade,
          ),
        ),
        SizedBox(height: landscape ? 6 : 8),
        Text(
          lesson.pinyin,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontFamily: AppFonts.display,
            fontFamilyFallback: AppFonts.displayFallback,
            fontWeight: FontWeight.w700,
            fontSize: AppTextSize.accent,
            color: AppColors.lacquer,
          ),
        ),
      ],
    );
    final meaning = Text(
      lesson.meaning,
      textAlign: landscape ? TextAlign.start : TextAlign.center,
      style: _ui.copyWith(fontSize: AppTextSize.cardTitle, fontWeight: FontWeight.w700),
    );
    final info = _InfoTable(rows: lesson.info, landscape: landscape);

    final Widget content = landscape
        ? Row(
            children: [
              SizedBox(width: 170, child: hero),
              const SizedBox(width: 24),
              const _Rule(vertical: true),
              const SizedBox(width: 24),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [meaning, const SizedBox(height: 14), info],
                ),
              ),
            ],
          )
        : Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              hero,
              const SizedBox(height: 8),
              meaning,
              const SizedBox(height: 22),
              const _Rule(vertical: false),
              const SizedBox(height: 22),
              info,
            ],
          );

    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.frostStrong,
        border: Border.all(color: AppColors.frostOutline),
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [BoxShadow(color: AppColors.cardShadow, offset: Offset(0, 12), blurRadius: 32)],
      ),
      // màn thấp / chữ dài: cuộn trong thẻ thay vì tràn
      child: LayoutBuilder(
        builder: (context, box) => SingleChildScrollView(
          padding: landscape
              ? const EdgeInsets.symmetric(horizontal: 24, vertical: 16)
              : const EdgeInsets.symmetric(horizontal: 22, vertical: 24),
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: box.maxHeight - (landscape ? 32 : 48)),
            child: Center(child: content),
          ),
        ),
      ),
    );
  }
}

class _InfoTable extends StatelessWidget {
  const _InfoTable({required this.rows, required this.landscape});

  final List<(String, String)> rows;
  final bool landscape;

  @override
  Widget build(BuildContext context) {
    final size = landscape ? AppTextSize.detail : AppTextSize.body;
    final gap = landscape ? 8.0 : 12.0;
    return Table(
      columnWidths: const {0: IntrinsicColumnWidth(), 1: FlexColumnWidth()},
      children: [
        for (final (i, (label, value)) in rows.indexed)
          TableRow(
            children: [
              Padding(
                padding: EdgeInsets.only(right: 16, top: i == 0 ? 0 : gap),
                child: Text(label, style: _ui.copyWith(fontSize: size, height: 1.45, fontWeight: FontWeight.w700, color: AppColors.jade)),
              ),
              Padding(
                padding: EdgeInsets.only(top: i == 0 ? 0 : gap),
                child: Text(value, style: _ui.copyWith(fontSize: size, height: 1.45, fontWeight: FontWeight.w500)),
              ),
            ],
          ),
      ],
    );
  }
}

/// Vạch kẻ mảnh có chấm vàng ở giữa (như màn tải).
class _Rule extends StatelessWidget {
  const _Rule({required this.vertical});

  final bool vertical;

  @override
  Widget build(BuildContext context) {
    final line = vertical
        ? const Expanded(child: SizedBox(width: 1, child: ColoredBox(color: AppColors.divider)))
        : const Expanded(child: SizedBox(height: 1, child: ColoredBox(color: AppColors.divider)));
    final dot = Container(
      width: 5,
      height: 5,
      margin: vertical ? const EdgeInsets.symmetric(vertical: 8) : const EdgeInsets.symmetric(horizontal: 8),
      decoration: const BoxDecoration(color: AppColors.gold, shape: BoxShape.circle),
    );
    final children = [line, dot, line];
    return ExcludeSemantics(
      child: vertical
          ? SizedBox(height: 200, child: Column(children: children))
          : Row(children: children),
    );
  }
}

/// Nút chính "Ra sân": ngọc bích, cao 52, bo 12.
class _BackButton extends StatelessWidget {
  const _BackButton({required this.onPressed});

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
        icon: const Icon(Icons.chevron_left, size: 22),
        label: const Text('Ra sân'),
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

/// Hai lớp núi mờ ở chân màn (như màn tải).
class _Mountains extends StatelessWidget {
  const _Mountains({required this.landscape});

  final bool landscape;

  @override
  Widget build(BuildContext context) {
    return ExcludeSemantics(
      child: LayoutBuilder(
        builder: (context, box) {
          final w = box.maxWidth;
          final h = landscape ? 160.0 : w * 300 / 390;
          return CustomPaint(size: Size(w, h), painter: _MountainPainter(landscape));
        },
      ),
    );
  }
}

class _MountainPainter extends CustomPainter {
  _MountainPainter(this.landscape);

  final bool landscape;

  // cùng đường viền với artboard (viewBox 390 × 300 dọc, 844 × 160 ngang)
  static const _far = <double>[0, 150, 40, 110, 78, 132, 130, 70, 170, 112, 205, 92, 250, 128, 300, 64, 350, 118, 390, 96];
  static const _near = <double>[0, 210, 50, 172, 96, 196, 150, 150, 200, 190, 240, 168, 292, 206, 340, 176, 390, 200];
  static const _farWide = <double>[0, 80, 70, 50, 140, 70, 230, 20, 310, 62, 380, 44, 470, 74, 560, 18, 650, 66, 740, 40, 844, 60];
  static const _nearWide = <double>[0, 120, 90, 96, 180, 114, 280, 82, 370, 110, 450, 96, 550, 124, 640, 100, 740, 118, 844, 104];

  @override
  void paint(Canvas canvas, Size size) {
    final vw = landscape ? 844.0 : 390.0;
    final vh = landscape ? 160.0 : 300.0;
    final sx = size.width / vw;
    final sy = size.height / vh;
    void ridge(List<double> pts, Color color) {
      final path = Path()..moveTo(pts[0] * sx, pts[1] * sy);
      for (var i = 2; i < pts.length; i += 2) {
        path.lineTo(pts[i] * sx, pts[i + 1] * sy);
      }
      path
        ..lineTo(size.width, size.height)
        ..lineTo(0, size.height)
        ..close();
      canvas.drawPath(path, Paint()..color = color);
    }

    ridge(landscape ? _farWide : _far, AppColors.mistFar);
    ridge(landscape ? _nearWide : _near, AppColors.mistNear);
  }

  @override
  bool shouldRepaint(_MountainPainter old) => old.landscape != landscape;
}
