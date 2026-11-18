/**
 * Luật Văn tiền 文錢 cho **chế độ thử trên trình duyệt** (R-TIEN-7 — không có Flutter): bản TypeScript của phần luật cần dùng
 * trong `app/lib/journey/wallet.dart` (thưởng trò + trần 60 / ngày — R-TIEN-3, +10 học bài mới — R-TIEN-2, mua — R-TIEN-4)
 * + ví thử `TrialWallet`. **Đổi luật tiền → sửa sổ → sửa cả hai file** (test hai phía dùng cùng ví dụ sổ:
 * `walletRules.test.ts` ↔ `app/test/rules/tien_test.dart`). Có Flutter thì Dart là nguồn thật, file này không chạy.
 * Thuần — không DOM, không lưu (lưu: `bridge/browserStore.ts`). Giá một nguồn ở `decor.ts`.
 */
import { cleanHome, decorItem, STARTER_COUNTS, type DecorCounts, type PlacedDecor } from './decor';
import { applyAct, freshGarden, parseGarden, type Garden, type GardenAct, type GardenResult } from './vuon';
import { freshMang, parseMang, pickMang, sellMang, type MangAct, type MangResult, type MangState } from './mang';
import type { GameEarning } from './wallet';

/** Học 1 bài từ mới (R-TIEN-2) — `learnCoins` ở Dart. */
export const LEARN_COINS = 10;

/** Trò chơi cộng lại tối đa chừng này mỗi ngày (R-TIEN-3) — `gameDailyCap` ở Dart. */
export const GAME_DAILY_CAP = 60;

/** Ví thử mới mở có sẵn chừng này để thử mua (R-TIEN-7, quyết định 2); app thật bắt đầu 0. */
export const TRIAL_START_COINS = 300;

/** Thưởng gốc của một ván (chưa tính trần): `dau-chu`, `luu-thuong` 8 / 5 / 3 (R-LUU-5), `co` 3, `dan-cam` 5 / 3 / 1
 *  (R-CAM-4); lạ → 0. */
export function gameBase(game: string, outcome: string): number {
  if (game === 'dau-chu' || game === 'luu-thuong') return ({ thang: 8, hoa: 5, thua: 3 } as Record<string, number>)[outcome] ?? 0;
  if (game === 'dan-cam') return ({ thang: 5, hoa: 3, thua: 1 } as Record<string, number>)[outcome] ?? 0;
  if (game === 'co') return outcome === 'thang' || outcome === 'hoa' || outcome === 'thua' ? 3 : 0;
  return 0;
}

/** Ba bài Đàn cầm theo bài (R-CAM-3) — `camSongs` ở Dart, `SONGS` ở `games/danCam.ts`. */
export const CAM_SONGS = ['suoi-truc', 'mua-mang', 'trang-tren-go'] as const;

/** Bài đàn đã thưởng trong ngày giờ VN `day` (R-CAM-4). */
export interface CamRecord {
  day: number;
  songs: string[];
}

export const NO_CAM: CamRecord = { day: -1, songs: [] };

/** Bài [song] hôm [today] (mã ngày VN) đã thưởng chưa (mỗi bài 1 lần / ngày — R-CAM-4). */
export const camSongDone = (r: CamRecord, today: number, song: string): boolean => r.day === today && r.songs.includes(song);

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

/** Nhãn thưởng học (R-TIEN-5, chuỗi `rewardLearn`): "+10 · Học bài Chào hỏi". */
export function learnRewardLabel(title: string, amount: number): string {
  return `+${amount} · Học bài ${title}`;
}

export type BuyRefusal = 'invalid' | 'short';
export type BuyResult =
  | { ok: true; balance: number; owned: DecorCounts }
  | { ok: false; reason: BuyRefusal; /** còn thiếu bao nhiêu (chỉ khi `short`) */ short: number };

/** Mua 1 cái [item] giá [price] (R-TIEN-4, V-69): đủ tiền → trừ đúng giá, số cái + 1 (vào túi); thiếu → không mua. Mua lặp được. */
export function buyDecor(a: { balance: number; owned: DecorCounts; item: string; price: number }): BuyResult {
  if (!a.item || !(a.price > 0)) return { ok: false, reason: 'invalid', short: 0 };
  if (a.balance < a.price) return { ok: false, reason: 'short', short: a.price - a.balance };
  return { ok: true, balance: a.balance - a.price, owned: { ...a.owned, [a.item]: (a.owned[a.item] ?? 0) + 1 } };
}

/** Ví thử lưu trong trình duyệt (R-TIEN-7): số dư, thưởng trò hôm nay, đồ sở hữu, nhà, bài đã học trên bảng HTML. */
export interface TrialWallet {
  coins: number;
  /** ngày của `gameToday` (`dayKey`) */
  gameDay: string;
  gameToday: number;
  /** số cái mỗi vật trang trí (đang đặt + trong túi — R-NHA-4) */
  owned: DecorCounts;
  /** món đang đặt ở nhà (như `getHome.items`) */
  items: PlacedDecor[];
  /** ô cũ chưa chuyển (ví thử của bản có ô: mã ô → mã vật); rỗng sau khi trang chuyển (R-NHA-3) */
  placed: Record<string, string>;
  /** mã bài đã mở bảng HTML (R-TIEN-2 — +10 lần đầu); khoá `learned` (bộ thủ) bản cũ không đọc — R-TU-5 */
  lessons: string[];
  /** đã cho Tiểu Líu Lo (R-TIEN-8) */
  alms: AlmsRecord;
  /** vườn rau (R-VUON-1…9) */
  garden: Garden;
  /** măng Trúc Lâm: đã hái hôm nay + túi Lâm sản (R-MANG-3/5) */
  mang: MangState;
  /** bài đàn cầm đã thưởng hôm nay (R-CAM-4) */
  cam: CamRecord;
}

/** Ví thử mới: 300 Văn tiền, 3 vật khởi đầu mỗi vật 1 cái, nhà trống, chưa học bài nào, vườn mới (6 luống trống, 3 hạt Cải ngọt), túi măng trống. */
export function newTrial(): TrialWallet {
  return { coins: TRIAL_START_COINS, gameDay: '', gameToday: 0, owned: { ...STARTER_COUNTS }, items: [], placed: {}, lessons: [], alms: { ...NO_ALMS }, garden: freshGarden(), mang: freshMang(), cam: { ...NO_CAM, songs: [] } };
}

function parseCam(v: unknown): CamRecord {
  if (!v || typeof v !== 'object') return { ...NO_CAM, songs: [] };
  const o = v as Record<string, unknown>;
  return { day: typeof o.day === 'number' && Number.isInteger(o.day) ? o.day : -1, songs: strings(o.songs) };
}

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const count = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);

/**
 * Đọc ví thử đã lưu; hỏng / sai dạng / số dư lạ → ví mới. Đồ trang trí như `cleanHome` (R-NHA-3/4): `owned` mảng (ví thử bản cũ) →
 * số cái như Flutter chuyển (`migrateOwnedCounts`); ô cũ giữ ở `placed` tới khi trang chuyển.
 */
export function parseTrial(raw: unknown): TrialWallet {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return newTrial();
  const o = raw as Record<string, unknown>;
  if (typeof o.coins !== 'number' || !Number.isFinite(o.coins) || o.coins < 0) return newTrial();
  const home = cleanHome({ items: o.items, placed: o.placed, owned: o.owned });
  return {
    coins: Math.floor(o.coins),
    gameDay: typeof o.gameDay === 'string' ? o.gameDay : '',
    gameToday: count(o.gameToday),
    owned: home.owned,
    items: [...home.items],
    placed: { ...home.legacy },
    lessons: [...new Set(strings(o.lessons))],
    alms: parseAlms(o.alms),
    garden: parseGarden(o.garden),
    mang: parseMang(o.mang),
    cam: parseCam(o.cam),
  };
}

/** Thưởng trò đã nhận trong ngày [day]; ví ghi ngày khác → 0. */
export function gameTodayOn(w: TrialWallet, day: string): number {
  return w.gameDay === day ? w.gameToday : 0;
}

/**
 * Hết một ván (R-TIEN-3) ở chế độ thử: tính như `earnGame` của Flutter, trả ví mới + câu trả lời cùng dạng. `dan-cam` cần
 * [song]; bài đã thưởng hôm nay (ngày giờ VN) → 0 + `songDone` (R-CAM-4).
 */
export function earnTrialGame(w: TrialWallet, game: string, outcome: string, now: Date, song?: string): { wallet: TrialWallet; earning: GameEarning } {
  const day = dayKey(now);
  const today = gameTodayOn(w, day);
  const vn = Math.floor((now.getTime() + 7 * 3_600_000) / 86_400_000);
  const cam = game === 'dan-cam';
  const none = (songDone: boolean): { wallet: TrialWallet; earning: GameEarning } => ({
    wallet: w,
    earning: { amount: 0, balance: w.coins, gameToday: today, capped: today >= GAME_DAILY_CAP, ...(songDone ? { songDone } : {}) },
  });
  if (cam && (!song || !(CAM_SONGS as readonly string[]).includes(song))) return none(false);
  if (cam && song && camSongDone(w.cam, vn, song)) return none(true);
  const { amount, capped } = gameEarn(game, outcome, today);
  const camNext = cam && song && amount > 0 ? { day: vn, songs: [...(w.cam.day === vn ? w.cam.songs : []), song] } : w.cam;
  const wallet = { ...w, coins: w.coins + amount, gameDay: day, gameToday: today + amount, cam: camNext };
  return { wallet, earning: { amount, balance: wallet.coins, gameToday: wallet.gameToday, capped } };
}

/* ---------- Măng Trúc Lâm (R-MANG-3/5) — luật ở `mang.ts` (chép `mang.dart`) ---------- */

/** Một thao tác măng ở chế độ thử: như `mangAct` của Flutter. Không được → ví giữ nguyên. */
export function mangTrialAct(w: TrialWallet, a: MangAct, nowMs: number): { wallet: TrialWallet; result: MangResult } {
  const result = a.act === 'pick' ? pickMang(w.mang, a.id, nowMs, !!a.right, w.lessons.length > 0) : sellMang(w.mang, a.kind);
  return { wallet: result.ok ? { ...w, coins: w.coins + result.amount, mang: result.mang } : w, result };
}

/** Mở bài từ trên bảng HTML: lần đầu +10, đã mở rồi → 0 (R-TIEN-2, R-TIEN-7). */
export function learnOnce(w: TrialWallet, lessonId: string): { wallet: TrialWallet; amount: number } {
  if (!lessonId || w.lessons.includes(lessonId)) return { wallet: w, amount: 0 };
  return { wallet: { ...w, coins: w.coins + LEARN_COINS, lessons: [...w.lessons, lessonId] }, amount: LEARN_COINS };
}

/** Mua vật [itemId] ở Tạp hoá bản web (giá từ `decor.ts`); không mua được → ví giữ nguyên. */
export function buyTrial(w: TrialWallet, itemId: string): { wallet: TrialWallet; result: BuyResult } {
  const it = decorItem(itemId);
  const result = buyDecor({ balance: w.coins, owned: w.owned, item: it ? it.id : '', price: it?.price ?? 0 });
  return { wallet: result.ok ? { ...w, coins: result.balance, owned: result.owned } : w, result };
}

/** Ghi cả danh sách món (như `setHome`) — chỗ đặt + trong túi đã kiểm ở trang; ô cũ (nếu còn) coi như đã chuyển. */
export function setTrialHome(w: TrialWallet, items: readonly PlacedDecor[]): TrialWallet {
  return { ...w, items: [...items], placed: {} };
}

/* ---------- Cho Tiểu Líu Lo (R-TIEN-8) — `almsCoins` / `giveAlms` ở Dart ---------- */

/** Mỗi lần cho đúng chừng này (R-TIEN-8). */
export const ALMS_COINS = 5;

/** Đã cho Tiểu Líu Lo: ngày cho gần nhất (mã ngày VN `maNgayVN`, −1 = chưa cho lần nào) + số lần đã cho. */
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
 * Cho Tiểu Líu Lo 5 văn (R-TIEN-8): mỗi ngày VN tối đa một lần; ví dưới 5 → không trừ. Được → trừ 5, ghi ngày + tăng số lần.
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

/** Nhãn trừ tiền trên ví HUD (R-TIEN-5, R-TIEN-8): "−5 · Cho Tiểu Líu Lo" (dấu trừ U+2212). */
export function almsLabel(amount = ALMS_COINS): string {
  return `−${amount} · Cho Tiểu Líu Lo`;
}

/** Cho Tiểu Líu Lo ở chế độ thử (R-TIEN-7, R-TIEN-8): như `giveAlms` của Flutter; không được → ví giữ nguyên. */
export function giveTrialAlms(w: TrialWallet, today: number): { wallet: TrialWallet; result: AlmsResult } {
  const result = giveAlms(w.coins, w.alms, today);
  return { wallet: result.ok ? { ...w, coins: result.balance, alms: result.alms } : w, result };
}

/* ---------- Vườn rau (R-VUON-1…9) — luật ở `vuon.ts` (chép `garden.dart`) ---------- */

/** Một thao tác vườn ở chế độ thử (R-TIEN-7): như `gardenAct` của Flutter; [speed] = `?vuon=`. Không được → ví giữ nguyên. */
export function gardenTrialAct(w: TrialWallet, a: GardenAct, now: number, speed = 1): { wallet: TrialWallet; result: GardenResult } {
  const result = applyAct(w.garden, a, w.coins, now, speed);
  return { wallet: result.ok ? { ...w, coins: w.coins + result.amount, garden: result.garden } : w, result };
}
