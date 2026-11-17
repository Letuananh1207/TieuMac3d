import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'daily.dart';
import 'garden.dart' show Garden, GardenDone, GardenError, GardenRefused, GardenResult;
import 'garden.dart' as vuon;
import 'home.dart';
import 'journey.dart';
import 'mang.dart';
import 'review.dart';
import 'wallet.dart';
import 'wallet.dart' as wallet show buyDecor;
import 'wallet.dart' as rules show giveAlms;

/// Lưu tiến độ học trên máy (R-HANH-1: giữ qua những lần mở app sau). Dùng `shared_preferences` — kho khoá–giá trị
/// nhỏ của nền tảng (Android SharedPreferences, iOS NSUserDefaults, web localStorage).
/// Kèm bài / từ đã học + lịch ôn từng từ (R-TU-1, R-ON-1…4; tiến độ bộ thủ bản cũ cất, không đọc — R-TU-5), các ngày đã xong nhiệm vụ hằng ngày (R-NV-1, R-NV-2), sổ từ đang mượn ở Tàng
/// Thư Các và trang đang đọc của từng cuốn (R-SACH-1…4), nhà của ta (R-NHA-3, R-NHA-4), ví Văn tiền (R-TIEN-1…4), vườn rau
/// (R-VUON-1…9, khoá `vuon.state`), măng Trúc Lâm (R-MANG-1…5, khoá `mang.state`), bài đàn cầm đã thưởng (R-CAM-4).
class ProgressStore {
  /// [clock] = đồng hồ (test truyền giờ giả để đi qua nhiều ngày).
  ProgressStore(this._prefs, {DateTime Function()? clock})
      : _clock = clock ?? DateTime.now,
        _lessonDays = _readLessons(_prefs),
        _words = [...?_prefs.getStringList(_wordsKey)],
        _cards = _readCards(_prefs),
        _doneDays = {...?_prefs.getStringList(_doneKey)?.map(int.tryParse).whereType<int>()} {
    _adoptOwned();
  }

  // Tiến độ bộ thủ bản cũ ('hanh-trinh.chu', 'hanh-trinh.bo-thu', 'on-tap.lich') **cất**, không đọc, không xoá (R-TU-5).
  /// bài đã học: JSON {mã bài: ngày học} theo thứ tự học
  static const _lessonsKey = 'tu-vung.bai';
  /// từ đã học (mã từ) theo thứ tự học
  static const _wordsKey = 'tu-vung.da-hoc';
  /// lịch ôn từng từ
  static const _cardsKey = 'tu-vung.lich';
  /// thưởng ôn đã nhận hôm nay (trần 20 — R-TIEN-2): {day, n}
  static const _reviewPaidKey = 'tu-vung.thuong-on';
  static const _doneKey = 'nhiem-vu.ngay-xong';
  static const _bookKey = 'tang-thu.dang-muon';
  static const _pagesKey = 'tang-thu.trang';
  static const _homeKey = 'nha.dat';
  static const _ownedKey = 'nha.so-huu';
  static const _countKey = 'nha.so-luong';
  static const _itemsKey = 'nha.do';
  static const _coinsKey = 'tien.so-du';
  static const _gameDayKey = 'tien.tro-ngay';
  static const _streakPaidKey = 'tien.chuoi-da-thuong';
  static const _almsKey = 'tien.cho-tieu-khat';
  static const _gardenKey = 'vuon.state';
  static const _mangKey = 'mang.state';
  static const _camKey = 'tien.dan-cam';

  final SharedPreferences _prefs;
  final DateTime Function() _clock;
  final Map<String, int> _lessonDays;
  final List<String> _words;
  final Map<String, ReviewCard> _cards;
  final Set<int> _doneDays;

  /// Khoản thưởng đã cộng vào ví mà màn Flutter chưa chạy hiệu ứng (R-TIEN-5) — lấy ra bằng [takeRewards].
  final List<Reward> _rewards = [];

  static Future<ProgressStore> open({DateTime Function()? clock}) async =>
      ProgressStore(await SharedPreferences.getInstance(), clock: clock);

  Progress get progress => Progress(lessons: _lessonDays.keys.toList(), words: List.unmodifiable(_words));

  /// Giờ máy (theo đồng hồ của kho — test truyền giờ giả).
  DateTime get now => _clock();

  /// Hôm nay (số ngày theo giờ máy).
  int get today => dayOf(_clock());

  /// Lịch ôn từng từ đã học.
  Map<String, ReviewCard> get cards => Map.unmodifiable(_cards);

  /// Các từ đến hạn hôm nay theo thứ tự hỏi (R-ON-4) — tổng, chưa cắt 20; thứ tự học = thứ tự giáo trình đã học.
  List<String> get dueWords => dueOrder(_cards, _words, today);

  /// Bậc của từng từ trong [dueWords] (0 = 1 ngày … 6 = 120 ngày, 7 = đã thuộc) — trang chọn dạng câu (R-ON-2).
  List<int> get dueSteps => [for (final id in dueWords) _cards[id]!.mastered ? reviewIntervals.length : _cards[id]!.step];

  /// Hai việc hôm nay (R-NV-1).
  DailyStatus get daily => dailyStatus(_cards, _lessonDays, tuVungLessonCount, today);

  /// Chuỗi ngày và kỷ lục (R-NV-2).
  ({int current, int best}) get streak => streakOf(_doneDays, today);

  /// Các ngày đã xong cả 2 việc (R-NV-2) — dải 7 ngày của bảng nhiệm vụ.
  Set<int> get doneDays => Set.unmodifiable(_doneDays);

  /// Bài học mới hôm nay, theo thứ tự đã học (việc Lĩnh hội — R-NV-1).
  List<String> get learnedToday => [
        for (final e in _lessonDays.entries)
          if (e.value == today) e.key,
      ];

  static Map<String, int> _readLessons(SharedPreferences p) {
    final raw = p.getString(_lessonsKey);
    if (raw == null) return {};
    try {
      final j = jsonDecode(raw);
      if (j is! Map) return {};
      return {for (final e in j.entries) if (e.key is String && e.value is int) e.key as String: e.value as int};
    } on FormatException {
      return {};
    }
  }

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

  /// "Đã lĩnh hội" bài [id] (R-HANH-3) với các từ [words] (mã từ, thứ tự trang): bài thành đã học, mọi từ chưa có lịch vào
  /// lịch ôn bậc 1 hạn mai (R-ON-1), tính vào việc Lĩnh hội hôm nay (R-NV-1), thưởng +10 (R-TIEN-2; [title] cho nhãn).
  /// Bài đã học / mã rỗng / không có từ → không đổi, `false`.
  Future<bool> learnLesson(String id, List<String> words, {String? title}) async {
    if (id.isEmpty || words.isEmpty || _lessonDays.containsKey(id)) return false;
    _lessonDays[id] = today;
    for (final w in words) {
      if (w.isEmpty || _words.contains(w)) continue;
      _words.add(w);
      _cards.putIfAbsent(w, () => ReviewCard.learned(today));
    }
    await _prefs.setString(_lessonsKey, jsonEncode(_lessonDays));
    await _prefs.setStringList(_wordsKey, _words);
    await _saveCards();
    await _credit([learnReward(title ?? id, words.first)]);
    await checkDaily();
    return true;
  }

  /// Thưởng ôn đã nhận hôm nay (R-TIEN-2, trần 20); ngày khác / hỏng → 0.
  int get reviewPaidToday {
    final j = _json(_reviewPaidKey);
    return j is Map && j['day'] == today && j['n'] is int ? j['n'] as int : 0;
  }

  /// Chấm lượt ôn từ [id] với [correct] câu đúng / 2 (R-ON-2); 2/2 → +1 khi hôm nay chưa đủ 20 thưởng ôn (R-TIEN-2).
  /// Từ chưa học hoặc chưa đến hạn → không đổi, không thưởng, `false`.
  Future<bool> reviewWord(String id, int correct) async {
    final card = _cards[id];
    if (card == null || !card.isDue(today)) return false;
    _cards[id] = card.grade(correct, today);
    await _saveCards();
    final paid = reviewPaidToday;
    final reward = reviewReward(correct, id, paidToday: paid);
    if (reward != null) {
      await _prefs.setString(_reviewPaidKey, jsonEncode({'day': today, 'n': paid + reward.amount}));
      await _credit([reward]);
    }
    await checkDaily();
    return true;
  }

  /// Xong cả hai việc hôm nay → ghi ngày này vào chuỗi (R-NV-2), thưởng +20 và +50 khi chuỗi chạm mốc 7, 14… (R-TIEN-2,
  /// một lần mỗi ngày). Gọi sau mỗi lần học / ôn và khi trang hỏi tiến độ.
  Future<void> checkDaily() async {
    final d = today;
    if (_doneDays.contains(d) || !daily.done) return;
    _doneDays.add(d);
    await _prefs.setStringList(_doneKey, [for (final x in _doneDays) '$x']);
    final paid = {...?_prefs.getStringList(_streakPaidKey)};
    final rewards = [
      for (final r in dailyRewards(streak.current))
        if (r.kind != RewardKind.streak || !paid.contains('$d')) r,
    ];
    if (rewards.any((r) => r.kind == RewardKind.streak)) {
      await _prefs.setStringList(_streakPaidKey, [...paid, '$d']);
    }
    await _credit(rewards);
  }

  /// Số dư Văn tiền (R-TIEN-1): mới cài / bản cũ → 0; không bao giờ âm.
  int get coins {
    final v = _prefs.get(_coinsKey);
    return v is int && v > 0 ? v : 0;
  }

  /// Lấy (và xoá khỏi hàng) các khoản thưởng chưa chạy hiệu ứng, theo thứ tự cộng (R-TIEN-5).
  List<Reward> takeRewards() {
    final out = List<Reward>.of(_rewards);
    _rewards.clear();
    return out;
  }

  Future<void> _credit(List<Reward> rewards) async {
    final sum = rewards.fold(0, (a, r) => a + r.amount);
    _rewards.addAll(rewards);
    if (sum > 0) await _prefs.setInt(_coinsKey, coins + sum);
  }

  /// Văn tiền trò chơi đã nhận hôm nay (R-TIEN-3); ngày khác → 0.
  int get gameCoinsToday {
    final raw = _prefs.getString(_gameDayKey);
    if (raw == null) return 0;
    try {
      final j = jsonDecode(raw);
      if (j is Map && j['day'] == today && j['total'] is int) return j['total'] as int;
    } on FormatException {
      return 0;
    }
    return 0;
  }

  /// Hết một ván ở bàn chơi / Lưu Thương / một bài Đàn cầm (docs/bridge.md `earnGame`, R-TIEN-3): tính theo bảng thưởng +
  /// trần 60 / ngày, ghi ngay. `dan-cam`: cần [song]; bài đã thưởng hôm nay (ngày giờ VN) → 0 + `songDone` (R-CAM-4).
  Future<({int amount, int balance, int gameToday, bool capped, bool songDone})> earnGame(String game, String outcome, {String? song}) async {
    final before = gameCoinsToday;
    final cam = game == 'dan-cam';
    final vn = vnDay(_clock());
    if (cam && (song == null || !camSongs.contains(song))) {
      return (amount: 0, balance: coins, gameToday: before, capped: before >= gameDailyCap, songDone: false);
    }
    if (cam && camSongDone(camRecord, vn, song!)) {
      return (amount: 0, balance: coins, gameToday: before, capped: before >= gameDailyCap, songDone: true);
    }
    final r = gameEarn(game, outcome, before);
    if (r.amount > 0) {
      await _prefs.setString(_gameDayKey, jsonEncode({'day': today, 'total': before + r.amount}));
      await _prefs.setInt(_coinsKey, coins + r.amount);
      if (cam) {
        final m = camMark(camRecord, vn, song!);
        await _prefs.setString(_camKey, jsonEncode({'day': m.day, 'songs': m.songs}));
      }
    }
    return (amount: r.amount, balance: coins, gameToday: before + r.amount, capped: r.capped, songDone: false);
  }

  /// Bài Đàn cầm đã thưởng (R-CAM-4); chưa có / hỏng → chưa bài nào.
  CamRecord get camRecord {
    final raw = _prefs.getString(_camKey);
    if (raw == null) return noCam;
    try {
      final j = jsonDecode(raw);
      if (j is Map && j['day'] is int && j['songs'] is List) {
        return (day: j['day'] as int, songs: [for (final s in j['songs'] as List) if (s is String) s]);
      }
    } on FormatException {
      return noCam;
    }
    return noCam;
  }

  /// Măng của người chơi (R-MANG-1…5), đã chuyển sang hôm nay (giờ VN); chưa có / hỏng → túi trống.
  MangState get mang {
    final day = vnDay(_clock());
    final raw = _prefs.getString(_mangKey);
    if (raw == null) return MangState.fresh(day);
    try {
      return MangState.fromJson(jsonDecode(raw)).on(day);
    } on FormatException {
      return MangState.fresh(day);
    }
  }

  /// Một thao tác măng (docs/bridge.md `mangAct`): `pick` (hái [id], [right] = đúng câu măng chữ) · `sell` ([kind], `null` =
  /// bán hết). Làm được → ghi ngay măng + số dư.
  Future<MangResult> mangAct(String act, {String? id, String? kind, bool right = false}) async {
    final s = mang;
    final MangResult r = switch ((act, id)) {
      ('pick', final i?) => pickMang(s, i, _clock(), right: right, learnedAny: _words.isNotEmpty),
      ('sell', _) => sellMang(s, kind),
      _ => const MangRefused(MangError.bad),
    };
    if (r is MangDone) {
      await _prefs.setString(_mangKey, jsonEncode(r.mang.toJson()));
      if (r.amount != 0) await _prefs.setInt(_coinsKey, coins + r.amount);
    }
    return r;
  }

  /// Đã cho Tiểu Khất (R-NPC-6, R-TIEN-8): ngày VN lần cho gần nhất + số lần; chưa có / hỏng → chưa cho lần nào.
  AlmsRecord get alms {
    final raw = _prefs.getString(_almsKey);
    if (raw == null) return noAlms;
    try {
      final j = jsonDecode(raw);
      if (j is Map && j['lastDay'] is int && j['count'] is int && (j['count'] as int) >= 0) {
        return (lastDay: j['lastDay'] as int, count: j['count'] as int);
      }
    } on FormatException {
      return noAlms;
    }
    return noAlms;
  }

  /// Cho Tiểu Khất 5 văn (docs/bridge.md `giveAlms`, R-TIEN-8): mỗi ngày giờ VN một lần, ví ≥ 5 → trừ + ghi ngay.
  Future<({bool ok, String? reason, int balance, AlmsRecord alms})> giveAlms() async {
    final day = vnDay(_clock());
    final err = almsRefusal(coins, alms, day);
    if (err != null) return (ok: false, reason: err.name, balance: coins, alms: alms);
    final r = rules.giveAlms(coins, alms, day)!;
    await _prefs.setInt(_coinsKey, r.balance);
    await _prefs.setString(_almsKey, jsonEncode({'lastDay': r.alms.lastDay, 'count': r.alms.count}));
    return (ok: true, reason: null, balance: r.balance, alms: r.alms);
  }

  /// Vườn rau đã lưu (R-VUON-1…9); chưa có / hỏng → vườn mới (6 luống trống, túi 3 hạt Cải ngọt).
  Garden get garden {
    final raw = _prefs.getString(_gardenKey);
    if (raw == null) return Garden.fresh();
    try {
      return Garden.fromJson(jsonDecode(raw));
    } on FormatException {
      return Garden.fresh();
    }
  }

  /// Một thao tác ở vườn (docs/bridge.md `gardenAct`): tính theo `garden.dart`, làm được → ghi ngay vườn + số dư.
  /// [act] = `sow` | `water` | `harvest` | `bug` | `weed` | `fert` | `sell` | `open` | `buy` (hạt: [crop]; phân: [item] `phan`);
  /// lạ / thiếu tham số → `bad`.
  Future<GardenResult> gardenAct(String act, {String? plot, String? crop, String? item, int count = 1}) async {
    final g = garden;
    final now = _clock().millisecondsSinceEpoch;
    final GardenResult r = switch ((act, plot, crop)) {
      ('sow', final p?, final c?) => vuon.sow(g, p, c, now),
      ('water', final p?, _) => vuon.water(g, p, now),
      ('harvest', final p?, _) => vuon.harvest(g, p, now),
      ('bug', final p?, _) => vuon.catchBug(g, p, now),
      ('weed', final p?, _) => vuon.pullWeed(g, p, now),
      ('fert', final p?, _) => vuon.fertilize(g, p, now),
      ('sell', _, _) => vuon.sell(g, crop, vnDay(_clock())),
      ('open', _, _) => vuon.openPlot(g, coins),
      ('buy', _, _) when item == vuon.fertItem => vuon.buyFert(g, coins, count: count),
      ('buy', _, final c?) => vuon.buySeed(g, c, coins, count: count),
      _ => const GardenRefused(GardenError.bad),
    };
    if (r is GardenDone) {
      await _prefs.setString(_gardenKey, jsonEncode(r.garden.toJson()));
      if (r.amount != 0) await _prefs.setInt(_coinsKey, coins + r.amount);
    }
    return r;
  }

  /// Mua [count] hạt [crop] (× 1 · × 5 · × 10) ở Tạp hoá (R-VUON-9) — dạng kết quả như mua đồ để màn Tạp hoá dùng chung.
  Future<BuyResult> buySeed(String crop, {int count = 1}) async {
    final r = await gardenAct('buy', crop: crop, count: count);
    return switch (r) {
      GardenDone() => Bought(coins, ownedDecor),
      GardenRefused(error: GardenError.short, :final short) => BuyRefused(BuyError.short, short: short),
      GardenRefused() => const BuyRefused(BuyError.invalid),
    };
  }

  /// Mua [count] bao phân bón (× 1 · × 5 · × 10) ở Tạp hoá (R-VUON-12) — dạng kết quả như mua hạt.
  Future<BuyResult> buyFert({int count = 1}) async {
    final r = await gardenAct('buy', item: vuon.fertItem, count: count);
    return switch (r) {
      GardenDone() => Bought(coins, ownedDecor),
      GardenRefused(error: GardenError.short, :final short) => BuyRefused(BuyError.short, short: short),
      GardenRefused() => const BuyRefused(BuyError.invalid),
    };
  }

  /// Số cái sở hữu mỗi vật trang trí (R-NHA-4 — đang đặt + trong túi).
  Map<String, int> get ownedDecor {
    final j = _json(_countKey);
    if (j is! Map) return {};
    return {for (final e in j.entries) if (e.key is String && e.value is int && (e.value as int) > 0) e.key as String: e.value as int};
  }

  /// Mua 1 cái [item] giá [price] ở Tạp hoá (R-TIEN-4): đủ tiền → trừ ví + số cái + 1 (giữ qua tắt app).
  Future<BuyResult> buyDecor(String item, int price) async {
    final r = wallet.buyDecor(balance: coins, owned: ownedDecor, item: item, price: price);
    if (r is Bought) {
      await _prefs.setInt(_coinsKey, r.balance);
      await _prefs.setString(_countKey, jsonEncode(r.owned));
    }
    return r;
  }

  /// Chưa có khoá số cái (mới cài, bản có ô, bản trước Văn tiền — R-NHA-4, V-69): chuyển từ `nha.so-huu` + ô cũ rồi xoá
  /// `nha.so-huu`. Chỗ đặt ô cũ (`nha.dat`) giữ tới khi trang gửi `setHome` (trang chuyển ô → món — R-NHA-3).
  void _adoptOwned() {
    if (_prefs.getString(_countKey) != null) return;
    _prefs.setString(_countKey, jsonEncode(migrateOwnedCounts(_prefs.getStringList(_ownedKey), homePlaced.values)));
    _prefs.remove(_ownedKey);
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

  /// Dữ liệu ô cũ (trước V-69): mã ô → mã vật; chỉ còn khi trang chưa gửi `setHome` lần nào (R-NHA-3 — trang chuyển).
  Map<String, String> get homePlaced {
    final j = _json(_homeKey);
    if (j is! Map) return {};
    return {for (final e in j.entries) if (e.key is String && e.value is String) e.key as String: e.value as String};
  }

  /// Món đang đặt ở mọi nơi trong nhà (R-NHA-3); món hỏng bỏ qua.
  List<PlacedDecor> get homeItems {
    final j = _json(_itemsKey);
    return j is List ? [for (final e in j) ?PlacedDecor.fromJson(e)] : [];
  }

  /// Đã có danh sách món (đã lên bản trang trí tự do) chưa.
  bool get hasHomeItems => _prefs.getString(_itemsKey) != null;

  /// Ghi cả danh sách món (`setHome` — R-NHA-2, R-NHA-3): hợp lệ + mỗi vật ≤ số cái sở hữu → ghi, xoá dữ liệu ô cũ, `true`;
  /// sai → không ghi, `false`.
  Future<bool> setHomeItems(Object? raw) async {
    final items = checkHomeItems(raw, ownedDecor);
    if (items == null) return false;
    await _prefs.setString(_itemsKey, jsonEncode([for (final i in items) i.toJson()]));
    await _prefs.remove(_homeKey);
    return true;
  }

  Object? _json(String key) {
    final raw = _prefs.getString(key);
    if (raw == null) return null;
    try {
      return jsonDecode(raw);
    } on FormatException {
      return null;
    }
  }

  Future<void> _saveCards() =>
      _prefs.setString(_cardsKey, jsonEncode({for (final e in _cards.entries) e.key: e.value.toJson()}));
}
