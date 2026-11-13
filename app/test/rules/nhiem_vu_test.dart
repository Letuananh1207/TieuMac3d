import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/daily.dart';
import 'package:hoc_xa_3d/journey/journey.dart';
import 'package:hoc_xa_3d/journey/progress_store.dart';
import 'package:hoc_xa_3d/journey/review.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  test('R-NV-1: học 2 bộ + ôn đủ 4 bộ đến hạn → còn Lĩnh hội 2/3; học thêm 1 → xong cả 2', () async {
    SharedPreferences.setMockInitialValues({'hanh-trinh.bo-thu': ['a', 'b', 'c', 'd']}); // 4 bộ cũ, đến hạn hôm nay
    final now = DateTime(2026, 11, 13, 9);
    final store = await ProgressStore.open(clock: () => now);
    await store.learnRadical('e');
    await store.learnRadical('f');
    for (final id in ['a', 'b', 'c', 'd']) {
      await store.reviewRadical(id, 2);
    }
    expect(store.daily.newToday, 2);
    expect(store.daily.reviewDone, isTrue);
    expect(store.daily.learnDone, isFalse);
    expect(store.daily.done, isFalse);
    await store.learnRadical('g');
    expect(store.daily.done, isTrue);
  });

  test('R-NV-1: ngày mới chưa học, không có bộ đến hạn → Ôn tập xong, Lĩnh hội 0/3', () {
    final s = dailyStatus(const {}, rungTrucRadicalCount, 100);
    expect(s.reviewDone, isTrue);
    expect(s.newToday, 0);
    expect(s.learnDone, isFalse);
  });

  test('R-NV-1: đã học đủ 50 bộ, không có bộ đến hạn → xong cả 2; học quá 3 bộ vẫn tính', () {
    final all = {for (var i = 0; i < rungTrucRadicalCount; i++) 'bo-$i': ReviewCard(step: 2, due: 200, learnedDay: 1)};
    expect(dailyStatus(all, rungTrucRadicalCount, 100).done, isTrue);
    final five = {for (var i = 0; i < 5; i++) 'bo-$i': ReviewCard.learned(100)};
    expect(dailyStatus(five, rungTrucRadicalCount, 100).newToday, 5);
    expect(dailyStatus(five, rungTrucRadicalCount, 100).learnDone, isTrue);
  });

  test('R-NV-1: mở lại bộ đã học không tính vào Lĩnh hội', () async {
    SharedPreferences.setMockInitialValues({});
    final store = await ProgressStore.open(clock: () => DateTime(2026, 11, 13));
    await store.learnRadical('truc');
    await store.learnRadical('truc');
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
    for (final id in ['a', 'b', 'c']) {
      await store.learnRadical(id);
    }
    expect(store.streak.current, 1);
    now = DateTime(2026, 11, 14, 9); // hôm sau: 3 bộ đến hạn, chưa học → chuỗi vẫn giữ 1
    final again = await ProgressStore.open(clock: () => now);
    expect(again.streak, (current: 1, best: 1));
  });
}
