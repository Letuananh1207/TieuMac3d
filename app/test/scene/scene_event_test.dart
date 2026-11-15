import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/daily.dart';
import 'package:hoc_xa_3d/journey/home.dart';
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
    expect(resumeScript(), 'window.scene&&window.scene.handle({"type":"resume","payload":{}});');
    // R-HANH-3: thẻ bộ thủ đóng bằng "Xuất định" → nhân vật đứng dậy
    expect(resumeScript(stand: true), 'window.scene&&window.scene.handle({"type":"resume","payload":{"stand":true}});');
  });

  test('lifecycle / debug: đúng tên và dạng trong docs/bridge.md', () {
    expect(lifecycleScript(visible: false), contains('{"type":"lifecycle","payload":{"state":"hidden"}}'));
    expect(lifecycleScript(visible: true), contains('{"type":"lifecycle","payload":{"state":"visible"}}'));
    expect(debugScript(on: true), contains('{"type":"debug","payload":{"on":true}}'));
  });

  test('getProgress: nhận loại sự kiện, trả số chữ, bộ thủ đã học — không khoá vùng (docs/bridge.md, R-HANH-1)', () {
    expect(sceneEventType([{'type': 'getProgress', 'payload': {}}]), 'getProgress');
    expect(sceneEventType([]), isNull);
    expect(sceneEventType(['x']), isNull);
    expect(progressReply(const Progress(chars: {'快', '書'})), {
      'chars': 2,
      'radicals': <String>[],
      'due': <String>[],
      'daily': {'learned': 0, 'goal': 3, 'due': 0, 'streak': 0, 'best': 0},
      'book': null,
    });
  });

  test('getProgress: kèm bộ đến hạn ôn + bảng nhiệm vụ hôm nay (docs/bridge.md, R-ON-4, R-NV-1)', () {
    final r = progressReply(
      const Progress(radicals: {'truc', 'moc'}),
      due: ['moc', 'truc'],
      daily: const DailyStatus(newToday: 1, dueLeft: 2, allLearned: false),
      streak: (current: 4, best: 6),
    );
    expect(r['due'], ['moc', 'truc']);
    expect(r['daily'], {'learned': 1, 'goal': 3, 'due': 2, 'streak': 4, 'best': 6});
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
          'region': 'Trúc Lâm',
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

  test('setHome: đọc danh sách món thô (docs/bridge.md); không phải setHome / thiếu items → null', () {
    final mon = {'item': 'mai', 'scene': 'nha-ta', 'x': 8, 'z': 4, 'rot': 45};
    expect(setHomeArgs([{'type': 'setHome', 'payload': {'items': [mon]}}]), [mon]);
    expect(setHomeArgs([{'type': 'setHome', 'payload': {'items': []}}]), isEmpty);
    expect(setHomeArgs([{'type': 'setHome', 'payload': {}}]), isNull);
    expect(setHomeArgs([{'type': 'setDecor', 'payload': {'items': [mon]}}]), isNull);
    expect(setHomeArgs([]), isNull);
  });

  test('R-TIEN-1: getProgress kèm số dư + Văn tiền trò hôm nay (docs/bridge.md); không có ví → không gửi', () {
    final r = progressReply(const Progress(), coins: 1280, gameCoinsToday: 24);
    expect(r['coins'], 1280);
    expect(r['gameCoinsToday'], 24);
    expect(progressReply(const Progress()).containsKey('coins'), isFalse);
  });

  test('R-NHA-4: getHome kèm số cái mỗi vật + món; ô cũ chỉ khi còn (docs/bridge.md)', () {
    const mai = PlacedDecor(item: 'mai', scene: 'nha-ta', x: 8, z: 4.5, rot: 45);
    expect(homeReply(items: const [mai], owned: {'mai': 3}), {
      'items': [
        {'item': 'mai', 'scene': 'nha-ta', 'x': 8, 'z': 4.5, 'rot': 45},
      ],
      'owned': {'mai': 3},
    });
    expect(homeReply(items: const [], owned: const {}, placed: {'vuon-1': 'mai'})['placed'], {'vuon-1': 'mai'});
    expect(homeReply(items: const [], owned: const {}, placed: const {}).containsKey('placed'), isFalse);
  });
}
