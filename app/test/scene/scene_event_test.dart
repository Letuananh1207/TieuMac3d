import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/journey.dart';
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

  test('getProgress: nhận loại sự kiện, trả vùng đã mở + số chữ (docs/bridge.md)', () {
    expect(sceneEventType([{'type': 'getProgress', 'payload': {}}]), 'getProgress');
    expect(sceneEventType([]), isNull);
    expect(sceneEventType(['x']), isNull);
    expect(progressReply(const Progress(chars: {'快', '書'})), {
      'open': ['rung-truc'],
      'chars': 2,
      'radicals': <String>[],
      'need': {
        'giang-nam': {'radicals': 50},
        'bong-lai': {'chars': 300},
        'truong-thanh': {'chars': 900},
        'tu-cam-thanh': {'chars': 1800},
        'to-lua': {'chars': 3000},
      },
    });
  });

  test('back: hỏi trang, trả true khi trang đã xử lý (docs/bridge.md)', () {
    expect(backScript, contains('"type":"back"'));
    expect(backScript, contains('===true'));
    expect(backScript, startsWith('window.scene?'));
  });

  test('openRadical: đọc bộ thủ, ví dụ, nét "từ hình đến chữ", đã học (docs/bridge.md)', () {
    final r = OpenRadicalRequest.parse([
      {
        'type': 'openRadical',
        'payload': {
          'radical': {
            'id': 'thuy', 'form': '氵', 'full': '水', 'name': 'thuỷ', 'meaning': 'nước', 'pinyin': 'shuǐ',
            'strokes': 3, 'fullStrokes': 4,
            'examples': [{'han': '河', 'pinyin': 'hé', 'meaning': 'sông'}],
            'evolution': {'hinh': ['M50 10 L50 90'], 'trien': ['M30 10 L30 90']},
          },
          'learned': true,
          'region': 'Rừng trúc',
        },
      }
    ])!;
    expect(r.radical.form, '氵');
    expect(r.radical.full, '水');
    expect(r.radical.fullStrokes, 4);
    expect(r.radical.examples, [('河', 'hé', 'sông')]);
    expect(r.radical.hinh, ['M50 10 L50 90']);
    expect(r.learned, isTrue);
    expect(OpenRadicalRequest.parse([{'type': 'openRadical', 'payload': {'radical': {'id': 'x'}}}]), isNull);
  });
}
