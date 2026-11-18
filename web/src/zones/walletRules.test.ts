import { describe, expect, it } from 'vitest';
import { STARTER_COUNTS } from './decor';
import { freshGarden } from './vuon';
import { freshMang } from './mang';
import { freshNong } from './nong';
import { gameRewardLabel } from './wallet';
import {
  camSongDone,
  mangTrialAct,
  buyDecor,
  buyTrial,
  dayKey,
  earnTrialGame,
  GAME_DAILY_CAP,
  gameBase,
  gameEarn,
  gameTodayOn,
  LEARN_COINS,
  learnOnce,
  learnRewardLabel,
  newTrial,
  parseTrial,
  setTrialHome,
  TRIAL_START_COINS,
} from './walletRules';

// Cùng ví dụ sổ với app/test/rules/tien_test.dart (quyết định 4: luật web giống hệt app — lệch là đỏ).

describe('thưởng học (R-TIEN-2)', () => {
  it('R-TIEN-2: học 1 bộ mới +10', () => {
    expect(LEARN_COINS).toBe(10);
    expect(learnRewardLabel('Chào hỏi', 10)).toBe('+10 · Học bài Chào hỏi');
  });
});

describe('thưởng trò chơi (R-TIEN-3)', () => {
  it('R-TIEN-3: Đấu chữ thắng / hoà / thua +8 / +5 / +3; Ngũ Tử Kỳ mọi kết quả +3; lạ → 0', () => {
    expect(gameBase('dau-chu', 'thang')).toBe(8);
    expect(gameBase('dau-chu', 'hoa')).toBe(5);
    expect(gameBase('dau-chu', 'thua')).toBe(3);
    for (const o of ['thang', 'hoa', 'thua']) expect(gameBase('co', o)).toBe(3);
    expect(gameBase('dau-chu', 'roi-ban')).toBe(0);
    expect(gameBase('xuc-xac', 'thang')).toBe(0);
  });

  it('R-TIEN-3: trần 60 / ngày — 57 → thắng Đấu chữ +3; ván sau 0 + đủ thưởng', () => {
    expect(GAME_DAILY_CAP).toBe(60);
    expect(gameEarn('dau-chu', 'thang', 0)).toEqual({ amount: 8, capped: false });
    expect(gameEarn('dau-chu', 'thang', 57)).toEqual({ amount: 3, capped: true });
    expect(gameEarn('co', 'thua', 60)).toEqual({ amount: 0, capped: true });
    expect(gameEarn('dau-chu', 'roi-ban', 10)).toEqual({ amount: 0, capped: false });
  });

  it('R-TIEN-3: ngày mới lúc 0 giờ giờ máy', () => {
    expect(dayKey(new Date(2026, 10, 13, 23, 59))).toBe('2026-11-13');
    expect(dayKey(new Date(2026, 10, 14, 0, 0))).toBe('2026-11-14');
    expect(dayKey(new Date(2026, 0, 5, 8))).toBe('2026-01-05');
  });
});

describe('Tạp hoá — mua (R-TIEN-4)', () => {
  it('R-TIEN-4: có 200, mua Mai 60 → còn 140, Mai 1 cái; mua lần nữa → còn 80, Mai 2 cái', () => {
    const r = buyDecor({ balance: 200, owned: STARTER_COUNTS, item: 'mai', price: 60 });
    expect(r).toEqual({ ok: true, balance: 140, owned: { ...STARTER_COUNTS, mai: 1 } });
    if (!r.ok) return;
    const r2 = buyDecor({ balance: r.balance, owned: r.owned, item: 'mai', price: 60 });
    expect(r2).toEqual({ ok: true, balance: 80, owned: { ...STARTER_COUNTS, mai: 2 } });
  });

  it('R-TIEN-4: có 40, Tùng 80 → còn thiếu 40, không mua; vật đã có vẫn mua thêm được', () => {
    expect(buyDecor({ balance: 40, owned: STARTER_COUNTS, item: 'tung', price: 80 })).toEqual({ ok: false, reason: 'short', short: 40 });
    expect(buyDecor({ balance: 999, owned: STARTER_COUNTS, item: 'truc-canh', price: 30 })).toMatchObject({ ok: true, owned: { 'truc-canh': 2 } });
    expect(buyDecor({ balance: 999, owned: STARTER_COUNTS, item: '', price: 30 })).toEqual({ ok: false, reason: 'invalid', short: 0 });
    expect(buyDecor({ balance: 999, owned: STARTER_COUNTS, item: 'mai', price: 0 })).toEqual({ ok: false, reason: 'invalid', short: 0 });
  });
});

describe('chế độ thử trên trình duyệt (R-TIEN-7)', () => {
  const NOW = new Date(2026, 10, 14, 9);

  it('R-TIEN-7: mới mở → ví thử 300, 3 vật khởi đầu, nhà trống, chưa học bộ nào', () => {
    expect(TRIAL_START_COINS).toBe(300);
    const w = newTrial();
    expect(w.coins).toBe(300);
    expect(w.owned).toEqual(STARTER_COUNTS);
    expect(w.items).toEqual([]);
    expect(w.placed).toEqual({});
    expect(w.lessons).toEqual([]);
    expect(w.gameToday).toBe(0);
  });

  it('R-TIEN-7: dữ liệu hỏng / sai dạng → ví thử mới (300)', () => {
    for (const raw of [null, undefined, 'abc', 42, [], { coins: 'nhiều' }, { coins: -5 }]) expect(parseTrial(raw)).toEqual(newTrial());
  });

  it('R-TIEN-7: đọc lại ví đã lưu; ví thử bản có ô (`owned` mảng) → số cái như Flutter (vật ở nhiều ô → số ô); thiếu `owned` → khởi đầu', () => {
    const w = parseTrial({ coins: 240, gameDay: '2026-11-14', gameToday: 8, owned: ['truc-canh', 'mai', 'rong-vang', 7], placed: { 'vuon-1': 'mai', 'vuon-2': 'mai', 'x': 3 }, learned: ['truc'], lessons: ['bai-01', 9] });
    expect(w).toEqual({ coins: 240, gameDay: '2026-11-14', gameToday: 8, owned: { 'truc-canh': 1, mai: 2 }, items: [], placed: { 'vuon-1': 'mai', 'vuon-2': 'mai' }, lessons: ['bai-01'], alms: { lastDay: -1, count: 0 }, garden: freshGarden(), mang: freshMang(), cam: { day: -1, songs: [] }, nong: freshNong() });
    expect(parseTrial({ coins: 10 }).owned).toEqual(STARTER_COUNTS);
    const now = parseTrial({ coins: 10, owned: { mai: 2 }, items: [{ item: 'mai', scene: 'nha-ta', x: 8, z: 4, rot: 45 }] });
    expect(now.items).toEqual([{ item: 'mai', scene: 'nha-ta', x: 8, z: 4, rot: 45 }]);
    expect(now.placed).toEqual({});
  });

  it('R-TIEN-7: ví thử giữ măng (đã hái + túi) và bài đàn đã thưởng', () => {
    const w = parseTrial({ coins: 5, mang: { day: 20771, picked: ['20771-0-1'], bag: { mang: 2 } }, cam: { day: 20771, songs: ['suoi-truc'] } });
    expect(w.mang).toEqual({ day: 20771, picked: ['20771-0-1'], bag: { mang: 2 } });
    expect(w.cam).toEqual({ day: 20771, songs: ['suoi-truc'] });
    expect(newTrial().mang.bag).toEqual({});
  });

  it('R-LUU-5: Lưu Thương thắng / hoà / thua +8 / +5 / +3, chung trần 60 (57 → +3)', () => {
    expect(['thang', 'hoa', 'thua'].map((o) => gameBase('luu-thuong', o))).toEqual([8, 5, 3]);
    const near = { ...newTrial(), gameDay: dayKey(NOW), gameToday: 57 };
    expect(earnTrialGame(near, 'luu-thuong', 'thang', NOW).earning).toEqual({ amount: 3, balance: 303, gameToday: 60, capped: true });
    expect(gameRewardLabel('luu-thuong', 'thang', 8)).toBe('+8 · Thắng Lưu Thương');
  });

  it('R-CAM-4: Đàn cầm +5 / +3 / +1, mỗi bài 1 lần / ngày giờ VN, thiếu bài → 0', () => {
    expect(['thang', 'hoa', 'thua'].map((o) => gameBase('dan-cam', o))).toEqual([5, 3, 1]);
    const a = earnTrialGame(newTrial(), 'dan-cam', 'thang', NOW, 'suoi-truc');
    expect(a.earning.amount).toBe(5);
    const b = earnTrialGame(a.wallet, 'dan-cam', 'thang', NOW, 'suoi-truc');
    expect(b.earning).toEqual({ amount: 0, balance: 305, gameToday: 5, capped: false, songDone: true });
    expect(earnTrialGame(b.wallet, 'dan-cam', 'hoa', NOW, 'mua-mang').earning.amount).toBe(3);
    expect(earnTrialGame(b.wallet, 'dan-cam', 'thang', NOW).earning.amount).toBe(0);
    const tomorrow = new Date(NOW.getTime() + 86_400_000);
    expect(earnTrialGame(b.wallet, 'dan-cam', 'thang', tomorrow, 'suoi-truc').earning.amount).toBe(5);
    expect(gameRewardLabel('dan-cam', 'thang', 5)).toBe('+5 · Tri âm');
    expect(gameRewardLabel('dan-cam', 'thua', 1)).toBe('+1 · Tập đàn');
    expect(camSongDone({ day: 3, songs: ['mua-mang'] }, 3, 'mua-mang')).toBe(true);
  });

  it('R-MANG-5: bán măng ở ví thử cộng ví, không đụng trần trò chơi', () => {
    const nowMs = Date.UTC(2026, 10, 15, 9); // 16:00 giờ VN
    const day = Math.floor((nowMs + 7 * 3_600_000) / 86_400_000);
    let w = { ...newTrial(), gameDay: dayKey(new Date(nowMs)), gameToday: 60 };
    w = mangTrialAct(w, { act: 'pick', id: `${day}-1-2` }, nowMs).wallet;
    w = mangTrialAct(w, { act: 'pick', id: `${day}-0-0` }, nowMs).wallet;
    const r = mangTrialAct(w, { act: 'sell', kind: null }, nowMs);
    expect(r.result).toMatchObject({ ok: true, amount: 11, got: 2 });
    expect(r.wallet.coins).toBe(311);
    expect(r.wallet.gameToday).toBe(60);
  });

  it('R-TIEN-7: thắng Đấu chữ → +8, ví 308; luật trần 60 như app; sáng mai lại được', () => {
    const a = earnTrialGame(newTrial(), 'dau-chu', 'thang', NOW);
    expect(a.earning).toEqual({ amount: 8, balance: 308, gameToday: 8, capped: false });
    const near = { ...a.wallet, gameToday: 57 };
    const b = earnTrialGame(near, 'dau-chu', 'thang', NOW);
    expect(b.earning).toEqual({ amount: 3, balance: 311, gameToday: 60, capped: true });
    const c = earnTrialGame(b.wallet, 'co', 'thua', NOW);
    expect(c.earning).toEqual({ amount: 0, balance: 311, gameToday: 60, capped: true });
    const tomorrow = new Date(2026, 10, 15, 8);
    expect(gameTodayOn(c.wallet, dayKey(tomorrow))).toBe(0);
    const d = earnTrialGame(c.wallet, 'dau-chu', 'hoa', tomorrow);
    expect(d.earning).toEqual({ amount: 5, balance: 316, gameToday: 5, capped: false });
  });

  it('R-TIEN-7: mở bài Chào hỏi lần đầu → +10; mở lại → 0', () => {
    const a = learnOnce(newTrial(), 'bai-01');
    expect(a.amount).toBe(10);
    expect(a.wallet.coins).toBe(310);
    expect(a.wallet.lessons).toEqual(['bai-01']);
    const b = learnOnce(a.wallet, 'bai-01');
    expect(b.amount).toBe(0);
    expect(b.wallet.coins).toBe(310);
  });

  it('R-TIEN-7: có 300, mua Mai 60 → còn 240, Mai 1 cái; mua Mai 2 lần → 2 cái (đặt được 2 cây); thiếu tiền không trừ', () => {
    const a = buyTrial(newTrial(), 'mai');
    expect(a.result).toEqual({ ok: true, balance: 240, owned: { ...STARTER_COUNTS, mai: 1 } });
    expect(a.wallet.coins).toBe(240);
    expect(buyTrial(a.wallet, 'mai').wallet.owned.mai).toBe(2);
    const poor = buyTrial({ ...newTrial(), coins: 40 }, 'tung');
    expect(poor.result).toEqual({ ok: false, reason: 'short', short: 40 });
    expect(poor.wallet.coins).toBe(40);
    expect(buyTrial(newTrial(), 'rong-vang').result).toEqual({ ok: false, reason: 'invalid', short: 0 });
  });

  it('R-TIEN-7: ghi cả danh sách món vào ví thử (nhà lưu trong trình duyệt — R-NHA-3); ô cũ coi như đã chuyển', () => {
    const items = [{ item: 'truc-canh', scene: 'nha-ta', x: 8, z: 4, rot: 0 }];
    const a = setTrialHome({ ...newTrial(), placed: { 'vuon-1': 'truc-canh' } }, items);
    expect(a.items).toEqual(items);
    expect(a.placed).toEqual({});
    expect(parseTrial(JSON.parse(JSON.stringify(a))).items).toEqual(items);
  });
});
