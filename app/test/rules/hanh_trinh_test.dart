import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/journey.dart';
import 'package:hoc_xa_3d/journey/progress_store.dart';
import 'package:hoc_xa_3d/scene/scene_event.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// n chữ khác nhau (giả).
Set<String> chars(int n) => {for (var i = 0; i < n; i++) String.fromCharCode(0x4e00 + i)};

void main() {
  test('R-HANH-1: không khoá vùng — tiến độ gửi sang trang không có danh sách vùng mở / mốc', () {
    for (final p in [const Progress(), Progress(chars: chars(3000), radicals: chars(rungTrucRadicalCount))]) {
      final reply = progressReply(p);
      expect(reply.containsKey('open'), isFalse);
      expect(reply.containsKey('need'), isFalse);
    }
  });

  test('R-HANH-1: mở bài một chữ hai lần → vẫn tính 1 chữ; tiến độ còn sau khi mở lại app', () async {
    SharedPreferences.setMockInitialValues({});
    final store = await ProgressStore.open();
    expect(await store.learnChar('快'), isTrue);
    expect(await store.learnChar('快'), isFalse);
    expect(store.progress.chars, {'快'});
    // "mở lại app": đọc lại từ kho
    final again = await ProgressStore.open();
    expect(again.progress.chars, {'快'});
  });

  test('R-HANH-3: bấm "Đã học" một bộ thủ → ghi một lần, còn sau khi mở lại app', () async {
    SharedPreferences.setMockInitialValues({});
    final store = await ProgressStore.open();
    expect(await store.learnRadical('thuy'), isTrue);
    expect(await store.learnRadical('thuy'), isFalse);
    expect((await ProgressStore.open()).progress.radicals, {'thuy'});
  });
}
