import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/lesson/svg_strokes.dart';

void main() {
  test('đọc nét thẳng, cong, khép kín', () {
    final b = parseStrokes('M10 20 L90 20 Q50 60 10 90 Z').getBounds();
    expect(b.left, closeTo(10, 0.01));
    expect(b.right, closeTo(90, 0.01));
    expect(b.top, closeTo(20, 0.01));
    expect(b.bottom, closeTo(90, 0.01));
  });

  test('cung "a" = hình tròn có đỉnh ở điểm đầu', () {
    final b = parseStrokes('M50 15 a35 35 0 1 0 0.1 0').getBounds();
    expect(b.center.dx, closeTo(50, 0.01));
    expect(b.center.dy, closeTo(50, 0.01));
    expect(b.width, closeTo(70, 0.01));
  });

  test('lệnh lạ → dừng, không văng lỗi', () {
    expect(() => parseStrokes('M10 10 L20 20 X 5 5'), returnsNormally);
  });
}
