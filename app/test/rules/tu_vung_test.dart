import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/journey.dart';
import 'package:hoc_xa_3d/journey/progress_store.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  test('R-TU-1: giáo trình Flutter khớp trang — số bài = BAI_HOC của web/src/zones/tuVung/bai.ts', () {
    final src = File('../web/src/zones/tuVung/bai.ts').readAsStringSync();
    expect(RegExp(r"^\s*B\((1|2), '", multiLine: true).allMatches(src).length, tuVungLessonCount);
  });

  test('R-TU-1: học theo bài — "Đã lĩnh hội" một bài → mọi từ của bài thành đã học, không trùng từ', () async {
    SharedPreferences.setMockInitialValues({});
    final store = await ProgressStore.open(clock: () => DateTime(2026, 11, 17, 9));
    await store.learnLesson('bai-01', ['你', '我', '好', '谢谢', '再见', '不客气']);
    await store.learnLesson('bai-02', ['对不起', '没关系', '请', '喂', '叫', '名字']);
    expect(store.progress.words, hasLength(12));
    expect(store.progress.lessons, ['bai-01', 'bai-02']);
    expect(store.cards.keys, hasLength(12));
  });

  test('R-TU-5: tiến độ bộ thủ cũ cất, không đọc; Văn tiền, chuỗi ngày, sách đang mượn giữ nguyên', () async {
    SharedPreferences.setMockInitialValues({
      'hanh-trinh.bo-thu': [for (var i = 0; i < 20; i++) 'bo-$i'],
      'hanh-trinh.chu': ['快'],
      'on-tap.lich': '{"bo-0":{"s":2,"d":1}}',
      'tien.so-du': 1280,
      'nhiem-vu.ngay-xong': ['20404', '20405'],
      'tang-thu.dang-muon': 'hsk1',
    });
    final store = await ProgressStore.open(clock: () => DateTime(2026, 11, 17, 9));
    expect(store.progress.lessons, isEmpty);
    expect(store.progress.words, isEmpty);
    expect(store.cards, isEmpty);
    expect(store.dueWords, isEmpty);
    expect(store.coins, 1280);
    expect(store.doneDays, {20404, 20405});
    expect(store.borrowedBook, 'hsk1');
    // khoá cũ vẫn nằm trong máy (cất, không xoá)
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getStringList('hanh-trinh.bo-thu'), hasLength(20));
  });
}
