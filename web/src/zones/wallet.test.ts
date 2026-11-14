import { describe, expect, it } from 'vitest';
import { balanceChange, coinsToFly, deltaText, formatCoins, gameRewardLabel, gameResultLine, parseGameEarning } from './wallet';

describe('ví (R-TIEN-1)', () => {
  it('R-TIEN-1: số ngăn nghìn bằng dấu cách; âm / lạ → 0', () => {
    expect(formatCoins(0)).toBe('0');
    expect(formatCoins(160)).toBe('160');
    expect(formatCoins(1280)).toBe('1 280');
    expect(formatCoins(99999)).toBe('99 999');
    expect(formatCoins(1234567)).toBe('1 234 567');
    expect(formatCoins(-5)).toBe('0');
    expect(formatCoins(Number.NaN)).toBe('0');
  });

  it('R-TIEN-4: về từ Tạp hoá, số dư giảm 160 → ví "−160"; tăng → "+n"; không đổi → không chạy', () => {
    const down = balanceChange(1300, 1140);
    expect(down).toEqual({ kind: 'down', amount: 160 });
    expect(deltaText(down)).toBe('−160');
    expect(deltaText(balanceChange(1280, 1300))).toBe('+20');
    expect(balanceChange(40, 40)).toEqual({ kind: 'same' });
    expect(balanceChange(null, 40)).toEqual({ kind: 'same' });
  });
});

describe('hiệu ứng nhận tiền (R-TIEN-5)', () => {
  it('R-TIEN-5: 1 xu / 5 Văn tiền, làm tròn lên, tối đa 5', () => {
    expect([0, 2, 3, 5, 8, 10, 20, 50].map(coinsToFly)).toEqual([0, 1, 1, 1, 2, 2, 4, 5]);
  });

  it('R-TIEN-5: nhãn lý do của ván; đủ trần → nhãn đủ thưởng (R-TIEN-3)', () => {
    expect(gameRewardLabel('dau-chu', 'thang', 8)).toBe('+8 · Thắng Đấu chữ');
    expect(gameRewardLabel('dau-chu', 'hoa', 5)).toBe('+5 · Hoà Đấu chữ');
    expect(gameRewardLabel('co', 'thua', 3)).toBe('+3 · Thua Cờ caro');
    expect(gameRewardLabel('dau-chu', 'thang', 0)).toBe('Hôm nay trò chơi đã đủ thưởng');
  });

  it('R-TIEN-3: thẻ kết quả ván ghi "+n Văn tiền"; không thưởng → không ghi', () => {
    expect(gameResultLine(8)).toBe('+8 Văn tiền');
    expect(gameResultLine(0)).toBeNull();
  });

  it('R-TIEN-3: đọc câu trả lời earnGame; sai dạng → null', () => {
    expect(parseGameEarning({ amount: 3, balance: 63, gameToday: 60, capped: true })).toEqual({ amount: 3, balance: 63, gameToday: 60, capped: true });
    expect(parseGameEarning({ amount: 3, balance: 63 })).toBeNull();
    expect(parseGameEarning(false)).toBeNull();
    expect(parseGameEarning(null)).toBeNull();
  });
});
