import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/lesson/radical_screen.dart';
import 'package:hoc_xa_3d/scene/scene_event.dart';

const _truc = Radical(
  id: 'truc',
  form: '竹',
  name: 'trúc',
  meaning: 'tre, trúc',
  pinyin: 'zhú',
  strokes: 6,
  examples: [('笑', 'xiào', 'cười')],
);

/// Mở thẻ, trả về kết quả khi thẻ đóng (`null` = chưa đóng).
Future<List<bool?>> _open(WidgetTester tester, {required bool learned, required List<String> learnedIds}) async {
  tester.view.physicalSize = const Size(390, 844);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  final results = <bool?>[];
  final req = OpenRadicalRequest(radical: _truc, learned: learned, region: 'Rừng trúc');
  await tester.pumpWidget(MaterialApp(
    home: Builder(
      builder: (context) => Scaffold(
        body: TextButton(
          onPressed: () async {
            results.add(await Navigator.of(context).push(RadicalScreen.route(req, () async => learnedIds.add('truc'))));
          },
          child: const Text('mở'),
        ),
      ),
    ),
  ));
  await tester.tap(find.text('mở'));
  await tester.pumpAndSettle();
  return results;
}

void main() {
  testWidgets('R-HANH-3: lần đầu bấm "Đã lĩnh hội" → ghi đã học, đóng thẻ, vẫn ngồi (không đứng dậy)', (tester) async {
    final ids = <String>[];
    final results = await _open(tester, learned: false, learnedIds: ids);
    expect(find.text('Xuất định'), findsNothing);
    await tester.tap(find.text('Đã lĩnh hội'));
    await tester.pumpAndSettle();
    expect(ids, ['truc']);
    expect(results, [false]);
  });

  testWidgets('R-HANH-3: bộ đã học → "Xuất định" đóng thẻ và đứng dậy, không ghi học lại', (tester) async {
    final ids = <String>[];
    final results = await _open(tester, learned: true, learnedIds: ids);
    expect(find.text('Đã lĩnh hội'), findsNothing);
    await tester.tap(find.text('Xuất định'));
    await tester.pumpAndSettle();
    expect(ids, isEmpty);
    expect(results, [true]);
  });
}
