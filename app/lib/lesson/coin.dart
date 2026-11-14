import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_fonts.g.dart';

/// Đồng xu Văn tiền 文錢 (thiết kế 2026-11-14.12, artboard `VanTien-vi-trang-thai`): tròn, vành `coin-rim`, mặt `gold`,
/// vòng trong, lỗ vuông 24 %. Xu ≥ 30 px khắc chữ `coin-ink`: mặt trước 文 (trên) 錢 (dưới); [char] ≠ `null` → mặt sau
/// một chữ (chữ / bộ thủ vừa học, ôn). Xu trong ví (26) và nhỏ hơn: không khắc. Vẽ bằng [CustomPainter] — không ảnh.
class Coin extends StatelessWidget {
  const Coin({super.key, this.size = 26, this.char});

  final double size;
  final String? char;

  /// từ cỡ này trở lên mới khắc chữ
  static const engraveMin = 30.0;

  @override
  Widget build(BuildContext context) => Semantics(
        label: 'Văn tiền', // coinName
        image: true,
        child: CustomPaint(size: Size.square(size), painter: _CoinPainter(size >= engraveMin ? char : null, engrave: size >= engraveMin)),
      );
}

class _CoinPainter extends CustomPainter {
  _CoinPainter(this.char, {required this.engrave});

  final String? char;
  final bool engrave;

  @override
  void paint(Canvas canvas, Size size) {
    // khung 0 0 100 100 như artboard
    final k = size.width / 100;
    canvas.scale(k);
    const c = Offset(50, 50);
    canvas.drawCircle(c, 48, Paint()..color = AppColors.coinRim);
    canvas.drawCircle(c, 44, Paint()..color = AppColors.gold);
    canvas.drawCircle(
      c,
      38,
      Paint()
        ..color = AppColors.coinRing
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );
    canvas.drawRect(const Rect.fromLTWH(38, 38, 24, 24), Paint()..color = AppColors.coinHoleRim);
    canvas.drawRect(const Rect.fromLTWH(41, 41, 18, 18), Paint()..color = AppColors.coinHole);
    if (!engrave) return;
    final back = char;
    if (back != null && back.isNotEmpty) {
      _text(canvas, back, 24, 30);
    } else {
      _text(canvas, '文', 20, 30);
      _text(canvas, '錢', 20, 88);
    }
  }

  /// Chữ khắc giữa theo chiều ngang, [baseline] như `y` của `<text>` SVG.
  void _text(Canvas canvas, String s, double fontSize, double baseline) {
    final tp = TextPainter(
      text: TextSpan(
        text: s,
        // cỡ trong khung 0..100 của xu (canvas đã co theo cỡ xu) — không phải cỡ chữ giao diện
        style: TextStyle(fontFamilyFallback: AppFonts.han, fontWeight: FontWeight.w700, color: AppColors.coinInk, fontSize: fontSize, height: 1),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    final ascent = tp.computeDistanceToActualBaseline(TextBaseline.alphabetic);
    tp.paint(canvas, Offset(50 - tp.width / 2, baseline - ascent));
  }

  @override
  bool shouldRepaint(_CoinPainter old) => old.char != char || old.engrave != engrave;
}
