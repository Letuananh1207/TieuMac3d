import { describe, expect, it } from 'vitest';
import { STARTER_DECOR } from './decor';
import { freshGarden } from './vuon';
import {
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
  placeTrial,
  TRIAL_START_COINS,
} from './walletRules';

// Cùng ví dụ sổ với app/test/rules/tien_test.dart (quyết định 4: luật web giống hệt app — lệch là đỏ).

describe('thưởng học (R-TIEN-2)', () => {
  it('R-TIEN-2: học 1 bộ mới +10', () => {
    expect(LEARN_COINS).toBe(10);
    expect(learnRewardLabel('竹', 10)).toBe('+10 · Học bộ 竹');
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
  it('R-TIEN-4: có 100, mua Mai 60 → còn 40, Mai đã có', () => {
    const r = buyDecor({ balance: 100, owned: STARTER_DECOR, item: 'mai', price: 60 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.balance).toBe(40);
    expect(r.owned).toEqual(expect.arrayContaining(['truc-canh', 'den-long', 'tranh-chu', 'mai']));
  });

  it('R-TIEN-4: có 40, Tùng 80 → còn thiếu 40, không mua; đã có → không mua lại', () => {
    expect(buyDecor({ balance: 40, owned: STARTER_DECOR, item: 'tung', price: 80 })).toEqual({ ok: false, reason: 'short', short: 40 });
    expect(buyDecor({ balance: 999, owned: STARTER_DECOR, item: 'truc-canh', price: 30 })).toEqual({ ok: false, reason: 'owned', short: 0 });
    expect(buyDecor({ balance: 999, owned: STARTER_DECOR, item: '', price: 30 })).toEqual({ ok: false, reason: 'invalid', short: 0 });
    expect(buyDecor({ balance: 999, owned: STARTER_DECOR, item: 'mai', price: 0 })).toEqual({ ok: false, reason: 'invalid', short: 0 });
  });
});

describe('chế độ thử trên trình duyệt (R-TIEN-7)', () => {
  const NOW = new Date(2026, 10, 14, 9);

  it('R-TIEN-7: mới mở → ví thử 300, 3 vật khởi đầu, nhà trống, chưa học bộ nào', () => {
    expect(TRIAL_START_COINS).toBe(300);
    const w = newTrial();
    expect(w.coins).toBe(300);
    expect(w.owned).toEqual([...STARTER_DECOR]);
    expect(w.placed).toEqual({});
    expect(w.learned).toEqual([]);
    expect(w.gameToday).toBe(0);
  });

  it('R-TIEN-7: dữ liệu hỏng / sai dạng → ví thử mới (300)', () => {
    for (const raw of [null, undefined, 'abc', 42, [], { coins: 'nhiều' }, { coins: -5 }]) expect(parseTrial(raw)).toEqual(newTrial());
  });

  it('R-TIEN-7: đọc lại ví đã lưu; bỏ mã vật lạ; thiếu `owned` → vật khởi đầu', () => {
    const w = parseTrial({ coins: 240, gameDay: '2026-11-14', gameToday: 8, owned: ['truc-canh', 'mai', 'rong-vang', 7], placed: { 'vuon-1': 'mai', 'x': 3 }, learned: ['truc', 9] });
    expect(w).toEqual({ coins: 240, gameDay: '2026-11-14', gameToday: 8, owned: ['truc-canh', 'mai'], placed: { 'vuon-1': 'mai' }, learned: ['truc'], alms: { lastDay: -1, count: 0 }, garden: freshGarden() });
    expect(parseTrial({ coins: 10 }).owned).toEqual([...STARTER_DECOR]);
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

  it('R-TIEN-7: mở thẻ 竹 lần đầu → +10; mở lại 竹 → 0', () => {
    const a = learnOnce(newTrial(), 'truc');
    expect(a.amount).toBe(10);
    expect(a.wallet.coins).toBe(310);
    expect(a.wallet.learned).toEqual(['truc']);
    const b = learnOnce(a.wallet, 'truc');
    expect(b.amount).toBe(0);
    expect(b.wallet.coins).toBe(310);
  });

  it('R-TIEN-7: có 300, mua Mai 60 → còn 240, Mai đặt được; thiếu tiền không trừ', () => {
    const a = buyTrial(newTrial(), 'mai');
    expect(a.result).toEqual({ ok: true, balance: 240, owned: [...STARTER_DECOR, 'mai'] });
    expect(a.wallet.coins).toBe(240);
    expect(a.wallet.owned).toContain('mai');
    const poor = buyTrial({ ...newTrial(), coins: 40 }, 'tung');
    expect(poor.result).toEqual({ ok: false, reason: 'short', short: 40 });
    expect(poor.wallet.coins).toBe(40);
    expect(buyTrial(newTrial(), 'rong-vang').result).toEqual({ ok: false, reason: 'invalid', short: 0 });
  });

  it('R-TIEN-7: đặt / gỡ vật ở ô ghi vào ví thử (nhà lưu trong trình duyệt — R-NHA-3)', () => {
    const a = placeTrial(newTrial(), 'vuon-1', 'mai');
    expect(a.placed).toEqual({ 'vuon-1': 'mai' });
    expect(placeTrial(a, 'vuon-1', null).placed).toEqual({});
  });
});
