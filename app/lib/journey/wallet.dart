/// Văn tiền 文錢 (R-TIEN-1…5): bảng thưởng, trần trò chơi, luật mua đồ trang trí, vật khởi đầu (R-NHA-4).
/// **Một nguồn luật tiền** — trang web không tính lại (docs/bridge.md `earnGame`). Giá + chữ Hán của vật một nguồn ở
/// `web/src/zones/decor.ts`, Flutter nhận qua `openShop`. Thuần Dart, không lưu (lưu: `progress_store.dart`).
///
/// Khoản thưởng là **danh sách** [Reward] để sau này Văn khí 文氣 (hướng B) nghe cùng sự kiện mà không sửa phần này.
library;

/// Học 1 bộ thủ mới (R-TIEN-2).
const learnCoins = 10;

/// Ôn đúng hạn 2/2 · 1/2 (R-TIEN-2).
const reviewFullCoins = 5;
const reviewHalfCoins = 2;

/// Xong cả 2 việc nhiệm vụ hằng ngày, một lần / ngày (R-TIEN-2).
const dailyCoins = 20;

/// Chuỗi ngày đạt bội số của [streakEvery] → [streakCoins], một lần ở ngày đạt mốc (R-TIEN-2).
const streakCoins = 50;
const streakEvery = 7;

/// Trò chơi cộng lại tối đa chừng này mỗi ngày (R-TIEN-3).
const gameDailyCap = 60;

/// Vật sở hữu sẵn khi mới cài app (R-NHA-4): Trúc cảnh, Đèn lồng, Tranh chữ.
const starterDecor = ['truc-canh', 'den-long', 'tranh-chu'];

enum RewardKind { learn, review, reviewHalf, daily, streak, gameWin, gameDraw, gameLose, gameCapped }

/// Một khoản thưởng — để màn Flutter chạy hiệu ứng xu bay + nhãn (R-TIEN-5). Số dư đã cộng sẵn trong kho.
class Reward {
  const Reward(this.kind, this.amount, {this.char, this.days, this.game});

  final RewardKind kind;
  final int amount;

  /// chữ / bộ thủ vừa học, ôn (nhãn "Học bộ 竹", mặt sau đồng xu)
  final String? char;

  /// số ngày chuỗi (nhãn "Chuỗi 7 ngày")
  final int? days;

  /// tên trò ("Đấu chữ", "Cờ caro")
  final String? game;

  @override
  bool operator ==(Object other) =>
      other is Reward && other.kind == kind && other.amount == amount && other.char == char && other.days == days && other.game == game;

  @override
  int get hashCode => Object.hash(kind, amount, char, days, game);

  @override
  String toString() => 'Reward($kind, $amount, $char, $days, $game)';
}

Reward learnReward(String char) => Reward(RewardKind.learn, learnCoins, char: char);

/// Ôn đúng [correct] / 2 → khoản thưởng; 0/2 → `null`.
Reward? reviewReward(int correct, String char) => switch (correct) {
      >= 2 => Reward(RewardKind.review, reviewFullCoins, char: char),
      1 => Reward(RewardKind.reviewHalf, reviewHalfCoins, char: char),
      _ => null,
    };

/// Vừa xong nhiệm vụ ngày, chuỗi hiện tại [streak] ngày → +20, và +50 nếu chuỗi chạm mốc 7, 14, 21…
List<Reward> dailyRewards(int streak) => [
      const Reward(RewardKind.daily, dailyCoins),
      if (streak > 0 && streak % streakEvery == 0) Reward(RewardKind.streak, streakCoins, days: streak),
    ];

/// Thưởng gốc của một ván (chưa tính trần): `game` = `dau-chu` | `co`, `outcome` = `thang` | `hoa` | `thua`; lạ → 0.
int gameBase(String game, String outcome) => switch ((game, outcome)) {
      ('dau-chu', 'thang') => 8,
      ('dau-chu', 'hoa') => 5,
      ('dau-chu', 'thua') => 3,
      ('co', 'thang' || 'hoa' || 'thua') => 3,
      _ => 0,
    };

/// Thưởng một ván khi hôm nay trò đã cho [earnedToday]: cắt cho vừa trần 60. `capped` = sau ván này đã đủ trần.
({int amount, bool capped}) gameEarn(String game, String outcome, int earnedToday) {
  final base = gameBase(game, outcome);
  if (base == 0) return (amount: 0, capped: earnedToday >= gameDailyCap);
  final room = (gameDailyCap - earnedToday).clamp(0, gameDailyCap);
  final amount = base < room ? base : room;
  return (amount: amount, capped: earnedToday + amount >= gameDailyCap);
}

/// Tên trò trên nhãn.
String gameName(String game) => switch (game) {
      'dau-chu' => 'Đấu chữ',
      'co' => 'Cờ caro',
      _ => game,
    };

/// Khoản thưởng của một ván; [amount] 0 → nhãn "đủ thưởng".
Reward gameReward(String game, String outcome, int amount) => Reward(
      amount == 0
          ? RewardKind.gameCapped
          : switch (outcome) {
              'thang' => RewardKind.gameWin,
              'hoa' => RewardKind.gameDraw,
              _ => RewardKind.gameLose,
            },
      amount,
      game: gameName(game),
    );

/// Số xu bay của một khoản: 1 xu / 5 Văn tiền, làm tròn lên, tối đa 5 (R-TIEN-5).
int coinsToFly(int amount) => amount <= 0 ? 0 : ((amount + 4) ~/ 5).clamp(1, 5);

/// Nhãn lý do (R-TIEN-5; chuỗi `reward*` ở design/l10n/vi.arb).
String rewardLabel(Reward r) => switch (r.kind) {
      RewardKind.learn => '+${r.amount} · Học bộ ${r.char ?? ''}',
      RewardKind.review => '+${r.amount} · Ôn đúng ${r.char ?? ''}',
      RewardKind.reviewHalf => '+${r.amount} · Ôn ${r.char ?? ''}',
      RewardKind.daily => '+${r.amount} · Xong nhiệm vụ ngày',
      RewardKind.streak => '+${r.amount} · Chuỗi ${r.days ?? streakEvery} ngày',
      RewardKind.gameWin => '+${r.amount} · Thắng ${r.game ?? ''}',
      RewardKind.gameDraw => '+${r.amount} · Hoà ${r.game ?? ''}',
      RewardKind.gameLose => '+${r.amount} · Thua ${r.game ?? ''}',
      RewardKind.gameCapped => 'Hôm nay trò chơi đã đủ thưởng', // rewardGameCapped
    };

/// Số ngăn nghìn bằng dấu cách: 1280 → "1 280" (R-TIEN-1). Số âm → "0" (ví không âm).
String formatCoins(int n) {
  final s = (n < 0 ? 0 : n).toString();
  final out = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) out.write(' ');
    out.write(s[i]);
  }
  return out.toString();
}

enum BuyError {
  /// mã vật rỗng / giá ≤ 0
  invalid,

  /// thiếu tiền ([BuyRefused.short] = còn thiếu bao nhiêu)
  short,
}

sealed class BuyResult {
  const BuyResult();
}

/// Mua được: số dư mới + số cái sở hữu mỗi vật (R-NHA-4 — đang đặt + trong túi).
class Bought extends BuyResult {
  const Bought(this.balance, this.owned);

  final int balance;
  final Map<String, int> owned;
}

class BuyRefused extends BuyResult {
  const BuyRefused(this.error, {this.short = 0});

  final BuyError error;
  final int short;

  @override
  bool operator ==(Object other) => other is BuyRefused && other.error == error && other.short == short;

  @override
  int get hashCode => Object.hash(error, short);

  @override
  String toString() => 'BuyRefused($error, $short)';
}

/// Mua 1 cái [item] giá [price] (R-TIEN-4, V-69): đủ tiền → trừ đúng giá, `owned[item]` + 1 (cái mới vào túi); thiếu → không
/// mua. Mua lặp không giới hạn.
BuyResult buyDecor({required int balance, required Map<String, int> owned, required String item, required int price}) {
  if (item.isEmpty || price <= 0) return const BuyRefused(BuyError.invalid);
  if (balance < price) return BuyRefused(BuyError.short, short: price - balance);
  return Bought(balance - price, {...owned, item: (owned[item] ?? 0) + 1});
}

/// Số cái khi mới cài app (R-NHA-4): mỗi vật khởi đầu 1 cái, trong túi.
Map<String, int> get starterCounts => {for (final id in starterDecor) id: 1};

/// Cho Tiểu Khất mỗi lần đúng chừng này (R-TIEN-8) — `ALMS_COINS` ở `web/src/zones/walletRules.ts`.
const almsCoins = 5;

/// Mã ngày giờ Việt Nam (GMT+7): số ngày từ 1970-01-01 theo lịch VN, từ mốc UTC — **không** theo múi giờ máy (R-TIEN-8).
/// Như `maNgayVN` ở `web/src/zones/gioVN.ts`.
int vnDay(DateTime now) => (now.toUtc().millisecondsSinceEpoch + 7 * 3600000) ~/ 86400000;

/// Đã cho Tiểu Khất: ngày cho gần nhất ([vnDay], −1 = chưa cho lần nào) + số lần đã cho (R-NPC-6).
typedef AlmsRecord = ({int lastDay, int count});

const AlmsRecord noAlms = (lastDay: -1, count: 0);

enum AlmsError {
  /// hôm nay (ngày VN) đã cho rồi
  given,

  /// ví dưới 5
  short,
}

/// Cho 5 văn (R-TIEN-8): mỗi ngày VN tối đa một lần; ví dưới 5 → không trừ. Được → số dư mới + bản ghi mới; không → lỗi.
({int balance, AlmsRecord alms})? giveAlms(int balance, AlmsRecord alms, int today) =>
    almsRefusal(balance, alms, today) == null ? (balance: balance - almsCoins, alms: (lastDay: today, count: alms.count + 1)) : null;

/// Vì sao không cho được (`null` = cho được).
AlmsError? almsRefusal(int balance, AlmsRecord alms, int today) {
  if (alms.lastDay == today) return AlmsError.given;
  if (balance < almsCoins) return AlmsError.short;
  return null;
}

/// Nhãn trừ tiền (R-TIEN-5): "−5 · Cho Tiểu Khất" (dấu trừ U+2212).
String almsLabel([int amount = almsCoins]) => '−$amount · Cho Tiểu Khất';
