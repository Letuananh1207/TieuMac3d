import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/journey.dart';
import 'package:hoc_xa_3d/journey/progress_store.dart';
import 'package:hoc_xa_3d/scene/scene_event.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  test('R-HANH-1: không khoá vùng — tiến độ gửi sang trang không có danh sách vùng mở / mốc', () {
    final all = Progress(lessons: [for (var i = 1; i <= tuVungLessonCount; i++) 'bai-$i'], words: [for (var i = 0; i < tuVungWordCount; i++) 'w$i']);
    for (final p in [const Progress(), all]) {
      final reply = progressReply(p);
      expect(reply.containsKey('open'), isFalse);
      expect(reply.containsKey('need'), isFalse);
    }
  });

  test('R-HANH-3: "Đã lĩnh hội" một bài → cả bài đã học, ghi một lần, còn sau khi mở lại app', () async {
    SharedPreferences.setMockInitialValues({});
    final store = await ProgressStore.open();
    expect(await store.learnLesson('bai-01', ['你', '我', '好'], title: 'Chào hỏi'), isTrue);
    expect(await store.learnLesson('bai-01', ['你', '我', '好']), isFalse);
    final again = await ProgressStore.open();
    expect(again.progress.lessons, ['bai-01']);
    expect(again.progress.words, ['你', '我', '好']);
  });
}
