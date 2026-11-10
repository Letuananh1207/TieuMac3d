import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/scene/scene_view.dart';

void main() {
  testWidgets('báo lỗi tải cảnh bằng tiếng Việt kèm chi tiết', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: SceneErrorView(detail: 'net::ERR_CONNECTION_REFUSED'))));

    expect(find.text('Không tải được cảnh 3D'), findsOneWidget);
    expect(find.textContaining('npm run build'), findsOneWidget);
    expect(find.textContaining('ERR_CONNECTION_REFUSED'), findsOneWidget);
  });
}
