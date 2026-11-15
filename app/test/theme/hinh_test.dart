import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/theme/app_hinh.g.dart';
import 'package:hoc_xa_3d/theme/hinh.dart';

void main() {
  testWidgets('Hinh: đúng cỡ, giải mã theo cỡ hiển thị, mờ = xám + 50 %', (tester) async {
    await tester.pumpWidget(const Directionality(
      textDirection: TextDirection.ltr,
      child: Row(children: [Hinh(AppHinh.banDo, size: 44), Hinh(AppHinh.nhayNut, size: 60, off: true)]),
    ));
    expect(tester.getSize(find.byType(Hinh).first), const Size(44, 44));
    final img = tester.widget<Image>(find.byType(Image).first);
    expect((img.image as ResizeImage).width, (44 * tester.view.devicePixelRatio).ceil());
    expect(find.byType(ColorFiltered), findsOneWidget);
    expect(tester.widget<Opacity>(find.byType(Opacity)).opacity, 0.5);
  });

  test('AppHinh: đường dẫn trong assets/scene/hinh/', () {
    expect(AppHinh.banDo, 'assets/scene/hinh/ban-do.webp');
    expect(AppHinh.docSachNut, startsWith(AppHinh.dir));
  });
}
