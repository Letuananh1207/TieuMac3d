/**
 * Văn tiền 文錢 phía trang (R-TIEN-1, R-TIEN-3, R-TIEN-5): định dạng số, số xu bay, nhãn lý do của một ván, so số dư
 * trước / sau. Thuần — không DOM. **Luật tiền (thưởng, trần, mua) ở Dart `app/lib/journey/wallet.dart`**; trang chỉ
 * hiện câu trả lời của Flutter (`earnGame`, `getProgress` — docs/bridge.md), không tính lại.
 */

/** Trò ở bàn chơi Kỳ Văn Uyển (mã như `earnGame`). */
export type GameKind = 'dau-chu' | 'co';
export type GameOutcome = 'thang' | 'hoa' | 'thua';

/** Câu trả lời `earnGame` (docs/bridge.md). */
export interface GameEarning {
  amount: number;
  balance: number;
  gameToday: number;
  capped: boolean;
}

/** Số ngăn nghìn bằng dấu cách: 1280 → "1 280" (R-TIEN-1). Âm / lạ → "0". */
export function formatCoins(n: number): string {
  const v = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Số xu bay của một khoản: 1 xu / 5 Văn tiền, làm tròn lên, tối đa 5 (R-TIEN-5). */
export function coinsToFly(amount: number): number {
  return amount > 0 ? Math.min(5, Math.ceil(amount / 5)) : 0;
}

const GAME_NAME: Record<GameKind, string> = { 'dau-chu': 'Đấu chữ', co: 'Cờ caro' };
const OUTCOME_WORD: Record<GameOutcome, string> = { thang: 'Thắng', hoa: 'Hoà', thua: 'Thua' };

/** Nhãn đủ trần (chuỗi `rewardGameCapped`). */
export const GAME_CAPPED_LABEL = 'Hôm nay trò chơi đã đủ thưởng';

/** Nhãn lý do của một ván (R-TIEN-5): "+8 · Thắng Đấu chữ"; 0 (đủ trần 60 — R-TIEN-3) → nhãn đủ thưởng. */
export function gameRewardLabel(game: GameKind, outcome: GameOutcome, amount: number): string {
  return amount > 0 ? `+${amount} · ${OUTCOME_WORD[outcome]} ${GAME_NAME[game]}` : GAME_CAPPED_LABEL;
}

/** Dòng nhỏ trên thẻ kết quả ván khi ngồi bàn (quyết định 4): "+8 Văn tiền"; không thưởng → `null`. */
export function gameResultLine(amount: number): string | null {
  return amount > 0 ? `+${amount} Văn tiền` : null;
}

/** Số dư đổi giữa hai lần hỏi `getProgress`: "vừa cộng" / "vừa trừ" (ví HUD chạy "+n" / "−n") hay không đổi. */
export type BalanceChange = { kind: 'up' | 'down'; amount: number } | { kind: 'same' };

export function balanceChange(before: number | null, after: number | null): BalanceChange {
  if (before === null || after === null || before === after) return { kind: 'same' };
  return after > before ? { kind: 'up', amount: after - before } : { kind: 'down', amount: before - after };
}

/** Chữ trên viên "+n" / "−n" dưới ví (dấu trừ U+2212 như thiết kế). */
export function deltaText(change: BalanceChange): string {
  if (change.kind === 'same') return '';
  return `${change.kind === 'up' ? '+' : '−'}${formatCoins(change.amount)}`;
}

/** Đọc câu trả lời `earnGame`; sai dạng / không có Flutter → `null` (không thưởng, ví ẩn). */
export function parseGameEarning(v: unknown): GameEarning | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const num = (x: unknown): number | null => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : null);
  const amount = num(o.amount);
  const balance = num(o.balance);
  const gameToday = num(o.gameToday);
  if (amount === null || balance === null || gameToday === null) return null;
  return { amount, balance, gameToday, capped: o.capped === true };
}
