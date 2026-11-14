/**
 * Luật Văn tiền 文錢 cho **chế độ thử trên trình duyệt** (R-TIEN-7 — không có Flutter): bản TypeScript của phần luật cần dùng
 * trong `app/lib/journey/wallet.dart` (thưởng trò + trần 60 / ngày — R-TIEN-3, +10 học bộ mới — R-TIEN-2, mua — R-TIEN-4)
 * + ví thử `TrialWallet`. **Đổi luật tiền → sửa sổ → sửa cả hai file** (test hai phía dùng cùng ví dụ sổ:
 * `walletRules.test.ts` ↔ `app/test/rules/tien_test.dart`). Có Flutter thì Dart là nguồn thật, file này không chạy.
 * Thuần — không DOM, không lưu (lưu: `bridge/browserStore.ts`). Giá một nguồn ở `decor.ts`.
 */
import { decorItem, STARTER_DECOR } from './decor';
import type { GameEarning } from './wallet';

/** Học 1 bộ thủ mới (R-TIEN-2) — `learnCoins` ở Dart. */
export const LEARN_COINS = 10;

/** Trò chơi cộng lại tối đa chừng này mỗi ngày (R-TIEN-3) — `gameDailyCap` ở Dart. */
export const GAME_DAILY_CAP = 60;

/** Ví thử mới mở có sẵn chừng này để thử mua (R-TIEN-7, quyết định 2); app thật bắt đầu 0. */
export const TRIAL_START_COINS = 300;

/** Thưởng gốc của một ván (chưa tính trần): `dau-chu` 8 / 5 / 3, `co` 3; lạ → 0. */
export function gameBase(game: string, outcome: string): number {
  if (game === 'dau-chu') return ({ thang: 8, hoa: 5, thua: 3 } as Record<string, number>)[outcome] ?? 0;
  if (game === 'co') return outcome === 'thang' || outcome === 'hoa' || outcome === 'thua' ? 3 : 0;
  return 0;
}

/** Thưởng một ván khi hôm nay trò đã cho [earnedToday]: cắt cho vừa trần 60; `capped` = sau ván này đã đủ trần. */
export function gameEarn(game: string, outcome: string, earnedToday: number): { amount: number; capped: boolean } {
  const base = gameBase(game, outcome);
  if (base === 0) return { amount: 0, capped: earnedToday >= GAME_DAILY_CAP };
  const room = Math.min(GAME_DAILY_CAP, Math.max(0, GAME_DAILY_CAP - earnedToday));
  const amount = Math.min(base, room);
  return { amount, capped: earnedToday + amount >= GAME_DAILY_CAP };
}

/** Mã ngày theo giờ máy (ngày mới lúc 0 giờ — R-TIEN-3): "2026-11-14". */
export function dayKey(d: Date): string {
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Nhãn thưởng học (R-TIEN-5, chuỗi `rewardLearn`): "+10 · Học bộ 竹". */
export function learnRewardLabel(char: string, amount: number): string {
  return `+${amount} · Học bộ ${char}`;
}

export type BuyRefusal = 'invalid' | 'owned' | 'short';
export type BuyResult =
  | { ok: true; balance: number; owned: string[] }
  | { ok: false; reason: BuyRefusal; /** còn thiếu bao nhiêu (chỉ khi `short`) */ short: number };

/** Mua [item] giá [price] (R-TIEN-4): đủ tiền → trừ đúng giá, vật thành đã có; thiếu → không mua; đã có → không mua lại. */
export function buyDecor(a: { balance: number; owned: readonly string[]; item: string; price: number }): BuyResult {
  if (!a.item || !(a.price > 0)) return { ok: false, reason: 'invalid', short: 0 };
  if (a.owned.includes(a.item)) return { ok: false, reason: 'owned', short: 0 };
  if (a.balance < a.price) return { ok: false, reason: 'short', short: a.price - a.balance };
  return { ok: true, balance: a.balance - a.price, owned: [...a.owned, a.item] };
}

/** Ví thử lưu trong trình duyệt (R-TIEN-7): số dư, thưởng trò hôm nay, đồ sở hữu, nhà, bộ đã học trên bảng HTML. */
export interface TrialWallet {
  coins: number;
  /** ngày của `gameToday` (`dayKey`) */
  gameDay: string;
  gameToday: number;
  owned: string[];
  /** mã ô → mã vật (như `getHome.placed`) */
  placed: Record<string, string>;
  /** mã bộ thủ đã mở thẻ HTML (R-TIEN-2 — +10 lần đầu) */
  learned: string[];
  /** đã cho Tiểu Khất (R-TIEN-8) */
  alms: AlmsRecord;
}

/** Ví thử mới: 300 Văn tiền, 3 vật khởi đầu, nhà trống, chưa học bộ nào. */
export function newTrial(): TrialWallet {
  return { coins: TRIAL_START_COINS, gameDay: '', gameToday: 0, owned: [...STARTER_DECOR], placed: {}, learned: [], alms: { ...NO_ALMS } };
}

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const count = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);

/** Đọc ví thử đã lưu; hỏng / sai dạng / số dư lạ → ví mới. Bỏ mã vật lạ; thiếu `owned` → vật khởi đầu. */
export function parseTrial(raw: unknown): TrialWallet {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return newTrial();
  const o = raw as Record<string, unknown>;
  if (typeof o.coins !== 'number' || !Number.isFinite(o.coins) || o.coins < 0) return newTrial();
  const placed: Record<string, string> = {};
  if (o.placed && typeof o.placed === 'object') {
    for (const [slot, item] of Object.entries(o.placed as Record<string, unknown>)) if (typeof item === 'string') placed[slot] = item;
  }
  return {
    coins: Math.floor(o.coins),
    gameDay: typeof o.gameDay === 'string' ? o.gameDay : '',
    gameToday: count(o.gameToday),
    owned: Array.isArray(o.owned) ? [...new Set(strings(o.owned).filter((id) => decorItem(id)))] : [...STARTER_DECOR],
    placed,
    learned: [...new Set(strings(o.learned))],
    alms: parseAlms(o.alms),
  };
}

/** Thưởng trò đã nhận trong ngày [day]; ví ghi ngày khác → 0. */
export function gameTodayOn(w: TrialWallet, day: string): number {
  return w.gameDay === day ? w.gameToday : 0;
}

/** Hết một ván (R-TIEN-3) ở chế độ thử: tính như `earnGame` của Flutter, trả ví mới + câu trả lời cùng dạng. */
export function earnTrialGame(w: TrialWallet, game: string, outcome: string, now: Date): { wallet: TrialWallet; earning: GameEarning } {
  const day = dayKey(now);
  const today = gameTodayOn(w, day);
  const { amount, capped } = gameEarn(game, outcome, today);
  const wallet = { ...w, coins: w.coins + amount, gameDay: day, gameToday: today + amount };
  return { wallet, earning: { amount, balance: wallet.coins, gameToday: wallet.gameToday, capped } };
}

/** Mở thẻ bộ thủ trên bảng HTML: lần đầu +10, đã mở rồi → 0 (R-TIEN-2, R-TIEN-7). */
export function learnOnce(w: TrialWallet, radicalId: string): { wallet: TrialWallet; amount: number } {
  if (!radicalId || w.learned.includes(radicalId)) return { wallet: w, amount: 0 };
  return { wallet: { ...w, coins: w.coins + LEARN_COINS, learned: [...w.learned, radicalId] }, amount: LEARN_COINS };
}

/** Mua vật [itemId] ở Tạp hoá bản web (giá từ `decor.ts`); không mua được → ví giữ nguyên. */
export function buyTrial(w: TrialWallet, itemId: string): { wallet: TrialWallet; result: BuyResult } {
  const it = decorItem(itemId);
  const result = buyDecor({ balance: w.coins, owned: w.owned, item: it ? it.id : '', price: it?.price ?? 0 });
  return { wallet: result.ok ? { ...w, coins: result.balance, owned: result.owned } : w, result };
}

/** Đặt / gỡ (`null`) vật ở một ô — luật đặt đã kiểm ở `decor.ts` `placeDecor` trước khi gọi. */
export function placeTrial(w: TrialWallet, slot: string, item: string | null): TrialWallet {
  const { [slot]: _gone, ...rest } = w.placed;
  return { ...w, placed: item ? { ...rest, [slot]: item } : rest };
}

/* ---------- Cho Tiểu Khất (R-TIEN-8) — `almsCoins` / `giveAlms` ở Dart ---------- */

/** Mỗi lần cho đúng chừng này (R-TIEN-8). */
export const ALMS_COINS = 5;

/** Đã cho Tiểu Khất: ngày cho gần nhất (mã ngày VN `maNgayVN`, −1 = chưa cho lần nào) + số lần đã cho. */
export interface AlmsRecord {
  lastDay: number;
  count: number;
}

export const NO_ALMS: AlmsRecord = { lastDay: -1, count: 0 };

export type AlmsResult =
  | { ok: true; balance: number; alms: AlmsRecord }
  | { ok: false; reason: 'given' | 'short'; /** số dư đang có (cho câu "Ta chỉ còn n văn…") */ balance: number };

/** Hôm nay [today] (mã ngày VN) đã cho chưa. */
export function almsGivenOn(a: AlmsRecord, today: number): boolean {
  return a.lastDay === today;
}

/**
 * Cho Tiểu Khất 5 văn (R-TIEN-8): mỗi ngày VN tối đa một lần; ví dưới 5 → không trừ. Được → trừ 5, ghi ngày + tăng số lần.
 */
export function giveAlms(balance: number, alms: AlmsRecord, today: number): AlmsResult {
  if (almsGivenOn(alms, today)) return { ok: false, reason: 'given', balance };
  if (balance < ALMS_COINS) return { ok: false, reason: 'short', balance };
  return { ok: true, balance: balance - ALMS_COINS, alms: { lastDay: today, count: alms.count + 1 } };
}

/** Đọc bản ghi đã lưu (ví thử / `getProgress.alms`); hỏng → chưa cho lần nào. */
export function parseAlms(v: unknown): AlmsRecord {
  if (!v || typeof v !== 'object') return { ...NO_ALMS };
  const o = v as Record<string, unknown>;
  const lastDay = typeof o.lastDay === 'number' && Number.isInteger(o.lastDay) && o.lastDay >= 0 ? o.lastDay : -1;
  return { lastDay, count: count(o.count) };
}

/** Nhãn trừ tiền trên ví HUD (R-TIEN-5, R-TIEN-8): "−5 · Cho Tiểu Khất" (dấu trừ U+2212). */
export function almsLabel(amount = ALMS_COINS): string {
  return `−${amount} · Cho Tiểu Khất`;
}

/** Cho Tiểu Khất ở chế độ thử (R-TIEN-7, R-TIEN-8): như `giveAlms` của Flutter; không được → ví giữ nguyên. */
export function giveTrialAlms(w: TrialWallet, today: number): { wallet: TrialWallet; result: AlmsResult } {
  const result = giveAlms(w.coins, w.alms, today);
  return { wallet: result.ok ? { ...w, coins: result.balance, alms: result.alms } : w, result };
}
