import 'package:shared_preferences/shared_preferences.dart';

import 'journey.dart';

/// Lưu tiến độ học trên máy (R-HANH-1: giữ qua những lần mở app sau). Dùng `shared_preferences` — kho khoá–giá trị
/// nhỏ của nền tảng (Android SharedPreferences, iOS NSUserDefaults, web localStorage).
class ProgressStore {
  ProgressStore(this._prefs) : _progress = _read(_prefs);

  static const _charsKey = 'hanh-trinh.chu';
  static const _radicalsKey = 'hanh-trinh.bo-thu';

  final SharedPreferences _prefs;
  Progress _progress;

  static Future<ProgressStore> open() async => ProgressStore(await SharedPreferences.getInstance());

  Progress get progress => _progress;

  static Progress _read(SharedPreferences p) => Progress(
        chars: {...?p.getStringList(_charsKey)},
        radicals: {...?p.getStringList(_radicalsKey)},
      );

  /// Ghi chữ [han] là đã học (lần đầu mở bài — tạm, tới khi có nút "Đã thuộc"). Học rồi → không đổi, trả `false`.
  Future<bool> learnChar(String han) async {
    if (han.isEmpty || _progress.chars.contains(han)) return false;
    final chars = {..._progress.chars, han};
    _progress = Progress(chars: chars, radicals: _progress.radicals);
    await _prefs.setStringList(_charsKey, chars.toList());
    return true;
  }

  /// Ghi bộ thủ [id] là đã học (nút "Đã học · khắc vào bia" — R-HANH-3). Học rồi → không đổi, trả `false`.
  Future<bool> learnRadical(String id) async {
    if (id.isEmpty || _progress.radicals.contains(id)) return false;
    final radicals = {..._progress.radicals, id};
    _progress = Progress(chars: _progress.chars, radicals: radicals);
    await _prefs.setStringList(_radicalsKey, radicals.toList());
    return true;
  }
}
