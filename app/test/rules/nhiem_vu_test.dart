import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/daily.dart';
import 'package:hoc_xa_3d/journey/journey.dart';
import 'package:hoc_xa_3d/journey/progress_store.dart';
import 'package:hoc_xa_3d/journey/review.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Kho có sẵn [n] từ đến hạn hôm nay (học hôm qua, bài `bai-00`).
Future<ProgressStore> withDue(int n, DateTime Function() clock) async {
  SharedPreferences.setMockInitialValues({});
  final yesterday = DateTime(2026, 11, 12, 9);
  final s = await ProgressStore.open(clock: () => yesterday);
  await s.learnLesson('bai-00', [for (var i = 0; i < n; i++) 'w$i']);
  return ProgressStore.open(clock: clock);
}

void main() {
  test('R-NV-1: chưa học bài nào, ôn đủ 4 từ đến hạn → còn Lĩnh hội 0/1; học 1 bài → xong cả 2', () async {
    final now = DateTime(2026, 11, 13, 9);
    final store = await withDue(4, () => now);
    for (final id in ['w0', 'w1', 'w2', 'w3']) {
      await store.reviewWord(id, 2);
    }
    expect(store.daily.newToday, 0);
    expect(store.daily.reviewDone, isTrue);
    expect(store.daily.learnDone, isFalse);
    await store.learnLesson('bai-01', ['你', '我']);
    expect(store.daily.done, isTrue);
  });

  test('R-NV-1: 30 từ đến hạn, ôn 20 → Ôn tập xong (10 từ còn lại vẫn đến hạn)', () async {
    final now = DateTime(2026, 11, 13, 9);
    final store = await withDue(30, () => now);
    for (var i = 0; i < 20; i++) {
      await store.reviewWord('w$i', 1);
    }
    expect(store.daily.reviewDone, isTrue);
    expect(store.dueWords, hasLength(10));
  });

  test('R-NV-1: ngày mới chưa học, không có từ đến hạn → Ôn tập xong, Lĩnh hội 0/1', () {
    final s = dailyStatus(const {}, const {}, tuVungLessonCount, 100);
    expect(s.reviewDone, isTrue);
    expect(s.newToday, 0);
    expect(s.learnDone, isFalse);
  });

  test('R-NV-1: đã học hết giáo trình, không có từ đến hạn → xong cả 2; học quá 1 bài vẫn tính', () {
    final all = {for (var i = 0; i < tuVungLessonCount; i++) 'bai-$i': 1};
    final cards = {'w': const ReviewCard(step: 2, due: 200, learnedDay: 1)};
    expect(dailyStatus(cards, all, tuVungLessonCount, 100).done, isTrue);
    final two = {'bai-1': 100, 'bai-2': 100};
    expect(dailyStatus(const {}, two, tuVungLessonCount, 100).newToday, 2);
    expect(dailyStatus(const {}, two, tuVungLessonCount, 100).learnDone, isTrue);
  });

  test('R-NV-1: mở lại bài đã học không tính vào Lĩnh hội', () async {
    SharedPreferences.setMockInitialValues({});
    final store = await ProgressStore.open(clock: () => DateTime(2026, 11, 13));
    await store.learnLesson('bai-01', ['你']);
    await store.learnLesson('bai-01', ['你']);
    expect(store.daily.newToday, 1);
  });

  test('R-NV-2: xong ngày 1, 2, 4 → ngày 4: chuỗi 1, kỷ lục 2', () {
    expect(streakOf({1, 2, 4}, 4), (current: 1, best: 2));
  });

  test('R-NV-2: ngày 3 đang học dở → chuỗi vẫn 2; sang ngày 4 (ngày 3 không xong) → chuỗi 0', () {
    expect(streakOf({1, 2}, 3).current, 2);
    expect(streakOf({1, 2}, 4), (current: 0, best: 2));
  });

  test('R-NV-2: xong cả 2 việc → ngày được tính tự động, giữ qua lần mở app sau', () async {
    SharedPreferences.setMockInitialValues({});
    var now = DateTime(2026, 11, 13, 9);
    final store = await ProgressStore.open(clock: () => now);
    await store.learnLesson('bai-01', ['你', '我', '好']);
    expect(store.streak.current, 1);
    now = DateTime(2026, 11, 14, 9); // hôm sau: 3 từ đến hạn, chưa học → chuỗi vẫn giữ 1
    final again = await ProgressStore.open(clock: () => now);
    expect(again.streak, (current: 1, best: 1));
  });
}
