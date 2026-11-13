import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/journey.dart';
import 'package:hoc_xa_3d/journey/progress_store.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// n chữ khác nhau (giả) để thử mốc.
Set<String> chars(int n) => {for (var i = 0; i < n; i++) String.fromCharCode(0x4e00 + i)};

void main() {
  test('R-HANH-1: mới cài app → chỉ Rừng trúc mở', () {
    expect(const Progress().openRegions, ['rung-truc']);
  });

  test('R-HANH-1: 299 chữ → Bồng Lai chưa mở; 300 chữ → mở', () {
    expect(Progress(chars: chars(299)).openRegions, isNot(contains('bong-lai')));
    expect(Progress(chars: chars(300)).openRegions, contains('bong-lai'));
  });

  test('R-HANH-1: mốc Trường Thành 900, Tử Cấm Thành 1 800, Tơ lụa 3 000', () {
    expect(Progress(chars: chars(899)).openRegions, ['rung-truc', 'bong-lai']);
    expect(Progress(chars: chars(1800)).openRegions, ['rung-truc', 'bong-lai', 'truong-thanh', 'tu-cam-thanh']);
    expect(Progress(chars: chars(3000)).openRegions, contains('to-lua'));
  });

  test('R-HANH-1: Giang Nam mở khi học đủ bộ thủ Rừng trúc, không theo số chữ', () {
    expect(Progress(chars: chars(3000)).openRegions, isNot(contains('giang-nam')));
    final r = Progress(radicals: chars(rungTrucRadicalCount));
    expect(r.openRegions, ['rung-truc', 'giang-nam']);
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

  test('R-HANH-3: bấm "Đã học" một bộ thủ → ghi một lần, còn sau khi mở lại app; đủ 50 bộ → Giang Nam mở', () async {
    SharedPreferences.setMockInitialValues({});
    final store = await ProgressStore.open();
    expect(await store.learnRadical('thuy'), isTrue);
    expect(await store.learnRadical('thuy'), isFalse);
    expect((await ProgressStore.open()).progress.radicals, {'thuy'});
    for (var k = 0; k < rungTrucRadicalCount - 2; k++) {
      await store.learnRadical('bo-$k');
    }
    expect(store.progress.openRegions, isNot(contains('giang-nam'))); // 49 bộ
    await store.learnRadical('bo-cuoi');
    expect(store.progress.openRegions, contains('giang-nam')); // 50 bộ
  });
}
