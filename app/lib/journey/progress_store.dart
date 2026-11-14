import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'daily.dart';
import 'journey.dart';
import 'review.dart';

/// Lưu tiến độ học trên máy (R-HANH-1: giữ qua những lần mở app sau). Dùng `shared_preferences` — kho khoá–giá trị
/// nhỏ của nền tảng (Android SharedPreferences, iOS NSUserDefaults, web localStorage).
/// Kèm lịch ôn từng bộ thủ (R-ON-1…4), các ngày đã xong nhiệm vụ hằng ngày (R-NV-1, R-NV-2), sổ từ đang mượn ở Tàng
/// Thư Các và trang đang đọc của từng cuốn (R-SACH-1…4).
class ProgressStore {
  /// [clock] = đồng hồ (test truyền giờ giả để đi qua nhiều ngày).
  ProgressStore(this._prefs, {DateTime Function()? clock})
      : _clock = clock ?? DateTime.now,
        _progress = _read(_prefs),
        _cards = _readCards(_prefs),
        _doneDays = {...?_prefs.getStringList(_doneKey)?.map(int.tryParse).whereType<int>()} {
    _adoptLegacy();
  }

  static const _charsKey = 'hanh-trinh.chu';
  static const _radicalsKey = 'hanh-trinh.bo-thu';
  static const _cardsKey = 'on-tap.lich';
  static const _doneKey = 'nhiem-vu.ngay-xong';
  static const _bookKey = 'tang-thu.dang-muon';
  static const _pagesKey = 'tang-thu.trang';
  static const _homeKey = 'nha.dat';

  final SharedPreferences _prefs;
  final DateTime Function() _clock;
  Progress _progress;
  final Map<String, ReviewCard> _cards;
  final Set<int> _doneDays;

  static Future<ProgressStore> open({DateTime Function()? clock}) async =>
      ProgressStore(await SharedPreferences.getInstance(), clock: clock);

  Progress get progress => _progress;

  /// Giờ máy (theo đồng hồ của kho — test truyền giờ giả).
  DateTime get now => _clock();

  /// Hôm nay (số ngày theo giờ máy).
  int get today => dayOf(_clock());

  /// Lịch ôn từng bộ thủ đã học.
  Map<String, ReviewCard> get cards => Map.unmodifiable(_cards);

  /// Các bộ đến hạn hôm nay theo thứ tự hỏi (R-ON-4); thứ tự học = thứ tự đã học.
  List<String> get dueRadicals => dueOrder(_cards, _progress.radicals.toList(), today);

  /// Hai việc hôm nay (R-NV-1).
  DailyStatus get daily => dailyStatus(_cards, rungTrucRadicalCount, today);

  /// Chuỗi ngày và kỷ lục (R-NV-2).
  ({int current, int best}) get streak => streakOf(_doneDays, today);

  /// Các ngày đã xong cả 2 việc (R-NV-2) — dải 7 ngày của bảng nhiệm vụ.
  Set<int> get doneDays => Set.unmodifiable(_doneDays);

  /// Bộ thủ học mới hôm nay, theo thứ tự đã học (việc Lĩnh hội — R-NV-1).
  List<String> get learnedToday => [
        for (final id in _progress.radicals)
          if (_cards[id]?.learnedDay == today) id,
      ];

  static Progress _read(SharedPreferences p) => Progress(
        chars: {...?p.getStringList(_charsKey)},
        radicals: {...?p.getStringList(_radicalsKey)},
      );

  static Map<String, ReviewCard> _readCards(SharedPreferences p) {
    final raw = p.getString(_cardsKey);
    if (raw == null) return {};
    try {
      final j = jsonDecode(raw);
      if (j is! Map) return {};
      return {
        for (final e in j.entries)
          if (e.key is String && ReviewCard.fromJson(e.value) != null) e.key as String: ReviewCard.fromJson(e.value)!,
      };
    } on FormatException {
      return {};
    }
  }

  /// Bộ đã học từ trước khi có lịch ôn → bậc 1, hạn hôm nay (R-ON-1).
  void _adoptLegacy() {
    final missing = _progress.radicals.where((id) => !_cards.containsKey(id)).toList();
    if (missing.isEmpty) return;
    for (final id in missing) {
      _cards[id] = ReviewCard.legacy(today);
    }
    _saveCards();
  }

  /// Ghi chữ [han] là đã học (lần đầu mở bài — tạm, tới khi có nút "Đã thuộc"). Học rồi → không đổi, trả `false`.
  Future<bool> learnChar(String han) async {
    if (han.isEmpty || _progress.chars.contains(han)) return false;
    final chars = {..._progress.chars, han};
    _progress = Progress(chars: chars, radicals: _progress.radicals);
    await _prefs.setStringList(_charsKey, chars.toList());
    return true;
  }

  /// Ghi bộ thủ [id] là đã học (nút đã học ở thẻ bộ thủ — R-HANH-3): vào lịch ôn (R-ON-1), tính vào việc Lĩnh hội hôm
  /// nay (R-NV-1). Học rồi → không đổi, trả `false`.
  Future<bool> learnRadical(String id) async {
    if (id.isEmpty || _progress.radicals.contains(id)) return false;
    final radicals = {..._progress.radicals, id};
    _progress = Progress(chars: _progress.chars, radicals: radicals);
    _cards[id] = ReviewCard.learned(today);
    await _prefs.setStringList(_radicalsKey, radicals.toList());
    await _saveCards();
    await checkDaily();
    return true;
  }

  /// Chấm lượt ôn bộ [id] với [correct] câu đúng / 2 (R-ON-2). Bộ chưa học hoặc chưa đến hạn → không đổi, `false`.
  Future<bool> reviewRadical(String id, int correct) async {
    final card = _cards[id];
    if (card == null || !card.isDue(today)) return false;
    _cards[id] = card.grade(correct, today);
    await _saveCards();
    await checkDaily();
    return true;
  }

  /// Xong cả hai việc hôm nay → ghi ngày này vào chuỗi (R-NV-2). Gọi sau mỗi lần học / ôn và khi trang hỏi tiến độ.
  Future<void> checkDaily() async {
    final d = today;
    if (_doneDays.contains(d) || !daily.done) return;
    _doneDays.add(d);
    await _prefs.setStringList(_doneKey, [for (final x in _doneDays) '$x']);
  }

  /// Mã sổ từ đang mượn (R-SACH-2); `null` = không mượn.
  String? get borrowedBook => _prefs.getString(_bookKey);

  /// Mượn cuốn [id] (R-SACH-1). Đang mượn cuốn khác / mã rỗng → không đổi, `false` (trang đã kiểm cuốn đã soạn).
  Future<bool> borrowBook(String id) async {
    if (id.isEmpty || borrowedBook != null) return false;
    await _prefs.setString(_bookKey, id);
    return true;
  }

  /// Trả cuốn đang mượn (R-SACH-4); trang đã đọc của cuốn đó vẫn giữ (R-SACH-3). Không mượn → `false`.
  Future<bool> returnBook() async {
    if (borrowedBook == null) return false;
    await _prefs.remove(_bookKey);
    return true;
  }

  /// Trang đang đọc (đếm từ 0) của cuốn [id]; chưa đọc → 0 (R-SACH-3).
  int bookPage(String id) => _pages()[id] ?? 0;

  /// Ghi trang [page] của cuốn [id] khi đóng sổ (R-SACH-3); kẹp trong 0 … [pageCount] − 1.
  Future<void> setBookPage(String id, int page, int pageCount) async {
    final pages = _pages()..[id] = page.clamp(0, pageCount > 0 ? pageCount - 1 : 0);
    await _prefs.setString(_pagesKey, jsonEncode(pages));
  }

  Map<String, int> _pages() {
    final raw = _prefs.getString(_pagesKey);
    if (raw == null) return {};
    try {
      final j = jsonDecode(raw);
      if (j is! Map) return {};
      return {for (final e in j.entries) if (e.key is String && e.value is int) e.key as String: e.value as int};
    } on FormatException {
      return {};
    }
  }

  /// Nhà của ta: mã ô → mã vật đang đặt (R-NHA-3). Không kiểm mã — trang bỏ ô / vật không còn (`cleanHome`).
  /// Chưa lưu "sở hữu": giai đoạn này sở hữu sẵn mọi vật (R-NHA-4).
  Map<String, String> get homePlaced {
    final raw = _prefs.getString(_homeKey);
    if (raw == null) return {};
    try {
      final j = jsonDecode(raw);
      if (j is! Map) return {};
      return {for (final e in j.entries) if (e.key is String && e.value is String) e.key as String: e.value as String};
    } on FormatException {
      return {};
    }
  }

  /// Đặt / thay vật [item] ở ô [slot]; [item] `null` = gỡ (R-NHA-2). Mã ô rỗng → không đổi, `false`.
  Future<bool> placeDecor(String slot, String? item) async {
    if (slot.isEmpty || item == '') return false;
    final placed = homePlaced;
    if (item == null) {
      placed.remove(slot);
    } else {
      placed[slot] = item;
    }
    await _prefs.setString(_homeKey, jsonEncode(placed));
    return true;
  }

  Future<void> _saveCards() =>
      _prefs.setString(_cardsKey, jsonEncode({for (final e in _cards.entries) e.key: e.value.toJson()}));
}
