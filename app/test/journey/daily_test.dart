import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/daily.dart';

void main() {
  // hôm nay = ngày 100, Thứ Sáu (weekday 5) → Thứ Hai = ngày 96
  test('dải 7 ngày: đã tính · bỏ · hôm nay chưa xong · chưa tới', () {
    expect(weekStrip({96, 97, 99}, 100, 5), [
      DayMark.counted,
      DayMark.counted,
      DayMark.missed,
      DayMark.counted,
      DayMark.today,
      DayMark.future,
      DayMark.future,
    ]);
  });

  test('dải 7 ngày: hôm nay xong · Chủ nhật là ô cuối', () {
    expect(weekStrip({100}, 100, 7).last, DayMark.todayDone);
    expect(weekStrip({}, 100, 1).first, DayMark.today);
  });

  test('R-NV-2: "Kỷ lục mới" khi hôm nay được tính và chuỗi = kỷ lục', () {
    final days = {98, 99, 100};
    expect(isNewRecord(days, 100, streakOf(days, 100)), isTrue);
    final older = {90, 91, 92, 93, 99, 100};
    expect(isNewRecord(older, 100, streakOf(older, 100)), isFalse); // chuỗi 2 < kỷ lục 4
    expect(isNewRecord({98, 99}, 100, streakOf({98, 99}, 100)), isFalse); // hôm nay chưa xong
  });
}
