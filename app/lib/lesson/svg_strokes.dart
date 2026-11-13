import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// Đọc một nét SVG (khung 0 0 100 100) thành [Path] — đủ cho dữ liệu bộ thủ (`web/src/zones/radicals.ts`):
/// M L Q C Z (toạ độ tuyệt đối) và cung `a rx ry 0 1 0 dx dy` dùng để vẽ hình tròn (điểm đầu ở đỉnh tròn → tâm ngay
/// dưới `ry`). Lệnh lạ → bỏ phần còn lại của nét (không văng lỗi).
Path parseStrokes(String d) {
  final path = Path();
  final tokens = RegExp(r'[MLQCZa]|-?\d*\.?\d+').allMatches(d).map((m) => m.group(0)!).toList();
  var i = 0;
  var cx = 0.0, cy = 0.0, sx = 0.0, sy = 0.0;
  double n() => double.parse(tokens[i++]);
  bool isNum() => i < tokens.length && !RegExp(r'^[A-Za-z]$').hasMatch(tokens[i]);
  String cmd = '';
  while (i < tokens.length) {
    if (!isNum()) cmd = tokens[i++];
    switch (cmd) {
      case 'M':
        cx = n();
        cy = n();
        sx = cx;
        sy = cy;
        path.moveTo(cx, cy);
        cmd = 'L'; // số tiếp theo sau M là L
      case 'L':
        cx = n();
        cy = n();
        path.lineTo(cx, cy);
      case 'Q':
        final x1 = n(), y1 = n();
        cx = n();
        cy = n();
        path.quadraticBezierTo(x1, y1, cx, cy);
      case 'C':
        final x1 = n(), y1 = n(), x2 = n(), y2 = n();
        cx = n();
        cy = n();
        path.cubicTo(x1, y1, x2, y2, cx, cy);
      case 'Z':
        path.close();
        cx = sx;
        cy = sy;
      case 'a':
        final rx = n(), ry = n();
        n(); // xoay
        n(); // cung lớn
        n(); // chiều
        final dx = n(), dy = n();
        path.addOval(Rect.fromCircle(center: Offset(cx, cy + ry), radius: rx));
        cx += dx;
        cy += dy;
      default:
        return path;
    }
  }
  return path;
}

/// Vẽ các nét SVG (khung 100) vừa ô [size], nét mực 3,2 / 60 như artboard `TheBoThu-doc`.
class StrokeArt extends StatelessWidget {
  const StrokeArt({super.key, required this.paths, required this.size, required this.label});

  final List<String> paths;
  final double size;
  final String label;

  @override
  Widget build(BuildContext context) => Semantics(
        label: label,
        image: true,
        child: CustomPaint(size: Size.square(size), painter: _StrokePainter(paths)),
      );
}

class _StrokePainter extends CustomPainter {
  _StrokePainter(this.paths);

  final List<String> paths;

  @override
  void paint(Canvas canvas, Size size) {
    final k = size.width / 100;
    canvas.scale(k);
    final paint = Paint()
      ..color = AppColors.slate
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.2 * 100 / 60 // nét 3,2 trong khung 60 của artboard
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    for (final d in paths) {
      canvas.drawPath(parseStrokes(d), paint);
    }
  }

  @override
  bool shouldRepaint(_StrokePainter old) => old.paths != paths;
}
