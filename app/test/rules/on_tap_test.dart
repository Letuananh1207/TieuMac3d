import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/progress_store.dart';
import 'package:hoc_xa_3d/journey/review.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Thẻ ở bậc [days] ngày (1 · 3 · 7 · … · 120), hạn [due].
ReviewCard at(int days, int due, {int? lastDay}) =>
    ReviewCard(step: reviewIntervals.indexOf(days), due: due, lastDay: lastDay);

void main() {
  test('R-ON-1: học lúc 23:59 ngày 1 → bậc 1, hạn ngày 2; ngày theo giờ máy, đổi lúc 0 giờ', () {
    final d1 = dayOf(DateTime(2026, 11, 1, 23, 59));
    expect(dayOf(DateTime(2026, 11, 2, 0, 0)), d1 + 1);
    final c = ReviewCard.learned(d1);
    expect(c.interval, 1);
    expect(c.due, d1 + 1);
  });

  test('R-ON-1: hạn tính từ hôm ôn — bậc 3, hạn ngày 5, ôn ngày 9 đúng 2/2 → bậc 7, hạn ngày 16', () {
    final c = at(3, 5).grade(2, 9);
    expect(c.interval, 7);
    expect(c.due, 16);
  });

  test('R-ON-1: bộ học từ trước khi có lịch ôn → bậc 1, hạn hôm nay', () async {
    SharedPreferences.setMockInitialValues({'hanh-trinh.bo-thu': ['truc', 'moc']});
    final now = DateTime(2026, 11, 13, 9);
    final store = await ProgressStore.open(clock: () => now);
    expect(store.cards['truc']!.due, dayOf(now));
    expect(store.cards['truc']!.learnedDay, isNull);
    expect(store.dueRadicals, ['truc', 'moc']);
  });

  test('R-ON-2: đúng 2/2 → lên 1 bậc; 1/2 → lùi 1 bậc; 0/2 → bậc 1, hạn mai, quên +1', () {
    expect(at(1, 10).grade(2, 10).interval, 3);
    final half = at(14, 10).grade(1, 10);
    expect(half.interval, 7);
    expect(half.due, 17);
    expect(at(1, 10).grade(1, 10).interval, 1); // thấp nhất bậc 1
    final zero = at(30, 10).grade(0, 10);
    expect(zero.interval, 1);
    expect(zero.due, 11);
    expect(zero.lapses, 1);
  });

  test('R-ON-3: bậc 120 đúng 2/2 → đã thuộc, hạn sau 180 ngày; khi đó đúng 1/2 → lùi về 60', () {
    final m = at(120, 1).grade(2, 1);
    expect(m.mastered, isTrue);
    expect(m.due, 181);
    final back = m.grade(1, 181);
    expect(back.mastered, isFalse);
    expect(back.interval, 60);
    expect(m.grade(0, 181).interval, 1);
  });

  test('R-ON-4: đến hạn = hạn ≤ hôm nay (kể cả trễ), chưa ôn hôm nay; bậc thấp trước, trễ lâu trước, rồi thứ tự học', () {
    const today = 20;
    final cards = {
      'truc': at(3, 15), // bậc 3, trễ 5
      'moc': at(1, 19), // bậc 1, trễ 1
      'thuy': at(1, 19), // bậc 1, trễ 1 — học sau 木
      'son': at(1, 21), // chưa tới hạn
      'thach': at(1, 20, lastDay: 20), // đã ôn hôm nay
    };
    expect(dueOrder(cards, ['truc', 'moc', 'thuy', 'son', 'thach'], today), ['moc', 'thuy', 'truc']);
  });

  test('R-ON-4: bỏ 10 ngày → mọi bộ trễ đều đến hạn, không giới hạn số bộ', () {
    final cards = {for (var i = 0; i < 20; i++) 'bo-$i': at(1, 2)};
    expect(dueOrder(cards, const [], 12), hasLength(20));
  });

  test('R-ON-2: ôn qua kho — chấm, lưu, mở lại app còn; bộ chưa đến hạn không chấm', () async {
    SharedPreferences.setMockInitialValues({});
    var now = DateTime(2026, 11, 1, 8);
    final store = await ProgressStore.open(clock: () => now);
    await store.learnRadical('truc');
    expect(await store.reviewRadical('truc', 2), isFalse); // hạn ngày mai
    now = DateTime(2026, 11, 2, 8);
    expect(store.dueRadicals, ['truc']);
    expect(await store.reviewRadical('truc', 2), isTrue);
    expect(store.dueRadicals, isEmpty);
    final again = await ProgressStore.open(clock: () => now);
    expect(again.cards['truc']!.interval, 3);
    expect(again.cards['truc']!.due, dayOf(now) + 3);
  });
}
