import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/scene/scene_event.dart';

void main() {
  // dạng JS gửi (docs/bridge.md, web/src/bridge/flutterBridge.ts)
  Map<String, Object?> openLesson() => {
        'type': 'openLesson',
        'payload': {
          'zoneId': 'lop-hsk3',
          'lesson': {
            'han': '快',
            'pinyin': 'kuài',
            'meaning': 'nhanh; vui',
            'info': [
              ['Bộ', '忄 tâm đứng'],
              ['Nét', '7'],
            ],
          },
        },
      };

  test('openLesson: đọc đủ vùng, chữ, pinyin, nghĩa, các dòng phụ', () {
    final r = OpenLessonRequest.parse([openLesson()])!;
    expect(r.zoneId, 'lop-hsk3');
    expect(r.lesson.han, '快');
    expect(r.lesson.pinyin, 'kuài');
    expect(r.lesson.meaning, 'nhanh; vui');
    expect(r.lesson.info, [('Bộ', '忄 tâm đứng'), ('Nét', '7')]);
  });

  test('sai dạng hoặc loại khác → null (không văng lỗi)', () {
    expect(OpenLessonRequest.parse([]), isNull);
    expect(OpenLessonRequest.parse(['openLesson']), isNull);
    expect(OpenLessonRequest.parse([{'type': 'khac', 'payload': {}}]), isNull);
    final thieuChu = openLesson();
    ((thieuChu['payload'] as Map)['lesson'] as Map).remove('han');
    expect(OpenLessonRequest.parse([thieuChu]), isNull);
    final dongSai = openLesson();
    ((dongSai['payload'] as Map)['lesson'] as Map)['info'] = [
      ['Bộ'],
    ];
    expect(OpenLessonRequest.parse([dongSai]), isNull);
  });

  test('resume: gọi window.scene.handle, trang chưa sẵn sàng thì bỏ qua', () {
    expect(resumeScript, 'window.scene&&window.scene.handle({"type":"resume","payload":{}});');
  });

  test('lifecycle / debug: đúng tên và dạng trong docs/bridge.md', () {
    expect(lifecycleScript(visible: false), contains('{"type":"lifecycle","payload":{"state":"hidden"}}'));
    expect(lifecycleScript(visible: true), contains('{"type":"lifecycle","payload":{"state":"visible"}}'));
    expect(debugScript(on: true), contains('{"type":"debug","payload":{"on":true}}'));
  });
}
