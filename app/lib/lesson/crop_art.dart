import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'crop_colors.dart';

/// Hình cây phẳng 8 loại + gói hạt (thiết kế 2026-11-15.29 `CuaHang-hat-*`, `VuonRau-*`): khung `-24 -44 48 48` (gốc cây ở
/// (0, 0)), cùng dữ liệu với `web/src/ui/cropArt.ts` — đổi hình sửa cả hai. Dưa hấu + Trà artboard chưa vẽ → dựng cùng kiểu.

sealed class _Shape {
  const _Shape();
}

/// Elip tâm (cx, cy), bán trục rx × ry, xoay [rot] độ quanh tâm.
class _E extends _Shape {
  const _E(this.cx, this.cy, this.rx, this.ry, this.rot, this.fill, [this.stroke]);
  final double cx, cy, rx, ry, rot;
  final Color fill;
  final Color? stroke;
}

class _R extends _Shape {
  const _R(this.x, this.y, this.w, this.h, this.fill);
  final double x, y, w, h;
  final Color fill;
}

class _C extends _Shape {
  const _C(this.cx, this.cy, this.r, this.fill);
  final double cx, cy, r;
  final Color fill;
}

/// Đoạn thẳng (nét).
class _L extends _Shape {
  const _L(this.x1, this.y1, this.x2, this.y2, this.stroke, this.w);
  final double x1, y1, x2, y2, w;
  final Color stroke;
}

/// Cong bậc 2 (nét).
class _Q extends _Shape {
  const _Q(this.x1, this.y1, this.qx, this.qy, this.x2, this.y2, this.stroke, this.w);
  final double x1, y1, qx, qy, x2, y2, w;
  final Color stroke;
}

/// 8 cánh hoa cúc quanh tâm.
List<_Shape> _daisy(double cx, double cy, double d, double rx, double ry, double rc) => [
      for (var k = 0; k < 8; k++) _E(cx + d * math.cos(k * math.pi / 4), cy + d * math.sin(k * math.pi / 4), rx, ry, 90.0 + 45 * k, CropColors.daisy),
      _C(cx, cy, rc, CropColors.daisyHeart),
    ];

final Map<String, List<_Shape>> _art = {
  'cai': const [
    _E(-7, -12, 5.4, 12, -50, CropColors.leaf),
    _E(-2.8, -12, 5.4, 12, -20, CropColors.leafLight),
    _E(2.8, -12, 5.4, 12, 20, CropColors.leaf),
    _E(7, -12, 5.4, 12, 50, CropColors.leafLight),
    _E(0, -18, 5.4, 12, 0, CropColors.leaf),
    _R(-3, -8, 6, 8, CropColors.caiStem),
  ],
  'cu-cai': const [
    _E(0, -6, 9, 8, 0, CropColors.radish, CropColors.radishEdge),
    _L(0, 2, 0, 8, CropColors.radishEdge, 2),
    _E(-6, -22, 4.5, 10, -30, CropColors.leaf),
    _E(0, -22, 4.5, 10, 0, CropColors.leaf),
    _E(6, -22, 4.5, 10, 30, CropColors.leaf),
  ],
  'ngo': const [
    _L(0, 0, 0, -40, CropColors.leafDark, 3.5),
    _E(-7, -18, 4.95, 11, -40, CropColors.leafLight),
    _E(7, -26, 4.95, 11, 40, CropColors.leafDark),
    _E(5, -30, 4, 9, 0, CropColors.corn, CropColors.cornEdge),
    _L(5, -40, 7, -44, CropColors.cornSilk, 1.5),
  ],
  'lua': const [
    _Q(-10, 0, -9, -20, -4, -30, CropColors.rice, 2),
    _E(-3, -30, 2.6, 6, 30, CropColors.riceEar),
    _Q(-4, 0, -3, -20, 2, -32, CropColors.rice, 2),
    _E(3, -32, 2.6, 6, 30, CropColors.riceEar),
    _Q(2, 0, 3, -20, 8, -34, CropColors.rice, 2),
    _E(9, -34, 2.6, 6, 30, CropColors.riceEar),
    _Q(8, 0, 9, -20, 14, -36, CropColors.rice, 2),
    _E(15, -36, 2.6, 6, 30, CropColors.riceEar),
  ],
  'bi': const [
    _E(-14, -6, 4.05, 9, -60, CropColors.leaf),
    _E(14, -6, 4.05, 9, 60, CropColors.leafDark),
    _E(-5, -10, 8, 10, 0, CropColors.pumpkinDark),
    _E(5, -10, 8, 10, 0, CropColors.pumpkin),
    _E(0, -10, 6, 10, 0, CropColors.pumpkinLight),
    _R(-1.5, -23, 3, 5, CropColors.pumpkinStem),
  ],
  'cuc': [
    const _L(0, 0, 0, -22, CropColors.leaf, 2),
    const _L(-8, 0, -8, -16, CropColors.leaf, 2),
    const _L(8, 0, 8, -18, CropColors.leaf, 2),
    ..._daisy(0, -26, 4.9, 1.73, 3.85, 2.45),
    ..._daisy(-8, -19, 3.85, 1.36, 3.03, 1.93),
    ..._daisy(8, -21, 4.2, 1.49, 3.3, 2.1),
  ],
  'dua': const [
    _E(-16, -4, 4, 8, -60, CropColors.leaf),
    _E(16, -4, 4, 8, 60, CropColors.leafDark),
    _E(0, -11, 14, 10, 0, CropColors.melon, CropColors.melonEdge),
    _Q(-8, -19, -10, -11, -8, -3, CropColors.melonStripe, 2),
    _Q(0, -21, -1, -11, 0, -1, CropColors.melonStripe, 2),
    _Q(8, -19, 10, -11, 8, -3, CropColors.melonStripe, 2),
    _E(-6, -15, 3, 1.6, -30, CropColors.melonShine),
  ],
  'tra': const [
    _R(-1.5, -5, 3, 5, CropColors.teaTrunk),
    _C(-8, -13, 9, CropColors.teaDark),
    _C(8, -13, 9, CropColors.teaDark),
    _C(0, -20, 10, CropColors.leaf),
    _E(-6, -26, 2, 3.6, -20, CropColors.teaBud),
    _E(5, -28, 2, 3.6, 15, CropColors.teaBud),
    _E(12, -18, 2, 3.6, 40, CropColors.teaBud),
  ],
};

/// Hình cây chín [crop] (mã `cai`, `cu-cai`, … — `journey/garden.dart`) cỡ [size]; mã lạ → trống.
class CropPicture extends StatelessWidget {
  const CropPicture({super.key, required this.crop, required this.size});

  final String crop;
  final double size;

  @override
  Widget build(BuildContext context) => SizedBox.square(dimension: size, child: CustomPaint(painter: _CropPainter(_art[crop] ?? const [])));
}

class _CropPainter extends CustomPainter {
  _CropPainter(this.shapes);

  final List<_Shape> shapes;

  @override
  void paint(Canvas canvas, Size size) {
    final k = size.width / 48;
    canvas
      ..save()
      ..scale(k)
      ..translate(24, 44);
    final fill = Paint()..style = PaintingStyle.fill;
    final line = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.butt;
    for (final s in shapes) {
      switch (s) {
        case _E():
          canvas
            ..save()
            ..translate(s.cx, s.cy)
            ..rotate(s.rot * math.pi / 180);
          final r = Rect.fromCenter(center: Offset.zero, width: s.rx * 2, height: s.ry * 2);
          canvas.drawOval(r, fill..color = s.fill);
          if (s.stroke != null) canvas.drawOval(r, line..color = s.stroke!..strokeWidth = 1);
          canvas.restore();
        case _R():
          canvas.drawRect(Rect.fromLTWH(s.x, s.y, s.w, s.h), fill..color = s.fill);
        case _C():
          canvas.drawCircle(Offset(s.cx, s.cy), s.r, fill..color = s.fill);
        case _L():
          canvas.drawLine(Offset(s.x1, s.y1), Offset(s.x2, s.y2), line..color = s.stroke..strokeWidth = s.w);
        case _Q():
          final p = Path()
            ..moveTo(s.x1, s.y1)
            ..quadraticBezierTo(s.qx, s.qy, s.x2, s.y2);
          canvas.drawPath(p, line..color = s.stroke..strokeWidth = s.w);
      }
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(_CropPainter old) => old.shapes != shapes;
}

/// Gói hạt 26 (góc dưới phải thẻ hạt ở Tạp hoá).
class SeedPack extends StatelessWidget {
  const SeedPack({super.key, this.size = 26});

  final double size;

  @override
  Widget build(BuildContext context) => SizedBox.square(dimension: size, child: CustomPaint(painter: _PackPainter()));
}

class _PackPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    canvas
      ..save()
      ..scale(size.width / 26);
    final body = RRect.fromRectAndCorners(const Rect.fromLTWH(5, 4, 16, 18), bottomLeft: const Radius.circular(2), bottomRight: const Radius.circular(2));
    canvas
      ..drawRRect(body, Paint()..color = CropColors.packPaper)
      ..drawRRect(
        body,
        Paint()
          ..style = PaintingStyle.stroke
          ..color = CropColors.packEdge,
      );
    final dot = Paint()..color = CropColors.packSeed;
    for (final o in const [Offset(10, 14), Offset(15, 12), Offset(14, 17)]) {
      canvas.drawCircle(o, 1.6, dot);
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(_PackPainter old) => false;
}
