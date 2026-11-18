/**
 * Nông trại ở Nhà của ta (R-NONG-1…8): chuồng gà, chuồng bò con, ao cá, giàn bầu bí, kho + bán. **Bản TS chép luật
 * `app/lib/journey/nong.dart`** (Dart là gốc — đổi luật sửa cả hai, test hai phía cùng ví dụ sổ: `nong.test.ts` ↔
 * `app/test/rules/nong_test.dart`). Có Flutter: trang gửi `nongAct`; không Flutter: luật chạy trên ví thử (R-TIEN-7).
 * Thêm chữ hiển thị (tên, từ HSK) cho HUD. Thuần — không three, không DOM.
 */
import type { Garden } from './vuon';

/** Giá bán ở thùng thu mua (R-NONG-7) — không tính trần 60 của vườn. */
export const NONG_PRICES = { trung: 4, 'ca-diec': 3, 'ca-chep': 6, 'ca-vang': 12, sua: 12, bau: 8, 'dua-leo': 6 } as const;
export type NongProduct = keyof typeof NONG_PRICES;
export const HAY = 'co-kho';
export type NongItem = NongProduct | typeof HAY;
export const NONG_ITEMS: readonly NongItem[] = [...(Object.keys(NONG_PRICES) as NongProduct[]), HAY];

export type Pen = 'ga' | 'bo';
export const PEN_YIELD: Record<Pen, number> = { ga: 3, bo: 1 };
export const PEN_PRODUCT: Record<Pen, NongProduct> = { ga: 'trung', bo: 'sua' };
export const FISH_DAILY = 5;
export type Vine = 'bau' | 'dua-leo';
export const VINE_MINUTES: Record<Vine, number> = { bau: 240, 'dua-leo': 180 };
export const VINE_YIELD = 3;
export type VineStage = 'trong' | 'mam' | 'leo' | 'phu' | 'chin';

/** Tên tiếng Việt (R-HUD-4). */
export const NONG_NAMES: Record<NongItem, string> = {
  trung: 'Trứng gà',
  'ca-diec': 'Cá diếc',
  'ca-chep': 'Cá chép',
  'ca-vang': 'Cá vàng',
  sua: 'Sữa bò',
  bau: 'Bầu',
  'dua-leo': 'Dưa leo',
  'co-kho': 'Cỏ khô',
};

/** Từ HSK gắn với sản phẩm (R-NONG-8) — chỉ hiện khi đã học. */
export const NONG_WORDS: Partial<Record<NongItem, string>> = { trung: '鸡蛋', 'ca-diec': '鱼', 'ca-chep': '鱼', 'ca-vang': '鱼', sua: '牛奶' };

/** Loại cá con thứ [n] (từ 0) của ngày VN [day] (R-NONG-3). */
export function fishKind(day: number, n: number): NongProduct {
  const k = (((day * 7 + n * 3) % 10) + 10) % 10;
  return k <= 5 ? 'ca-diec' : k <= 8 ? 'ca-chep' : 'ca-vang';
}

export interface NongState {
  gaFed: number;
  boFed: number;
  fishDay: number;
  fishN: number;
  vines: Partial<Record<Vine, number>>;
  kho: Partial<Record<NongItem, number>>;
}

export const freshNong = (): NongState => ({ gaFed: -1, boFed: -1, fishDay: -1, fishN: 0, vines: {}, kho: {} });

const int = (v: unknown, d: number): number => (typeof v === 'number' && Number.isInteger(v) ? v : d);
const isVine = (k: string): k is Vine => k in VINE_MINUTES;
const isItem = (k: string): k is NongItem => (NONG_ITEMS as readonly string[]).includes(k);

/** Đọc bản đã lưu (Flutter gửi / ví thử); sai dạng → trống; mã lạ / số ≤ 0 bỏ. Như `NongState.fromJson`. */
export function parseNong(v: unknown): NongState {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return freshNong();
  const o = v as Record<string, unknown>;
  const vines: NongState['vines'] = {};
  if (o.vines && typeof o.vines === 'object') for (const [k, t] of Object.entries(o.vines)) if (isVine(k) && int(t, 0) > 0) vines[k] = t as number;
  const kho: NongState['kho'] = {};
  if (o.kho && typeof o.kho === 'object') for (const [k, n] of Object.entries(o.kho)) if (isItem(k) && int(n, 0) > 0) kho[k] = n as number;
  return { gaFed: int(o.gaFed, -1), boFed: int(o.boFed, -1), fishDay: int(o.fishDay, -1), fishN: int(o.fishN, 0), vines, kho };
}

export const NONG_REASONS = ['no-feed', 'fed', 'ready', 'none', 'limit', 'busy', 'not-ripe', 'empty', 'bad'] as const;
export type NongReason = (typeof NONG_REASONS)[number];
export type NongResult =
  | { ok: true; nong: NongState; garden?: Garden; amount: number; got: number; item?: NongProduct }
  | { ok: false; reason: NongReason };

const no = (reason: NongReason): NongResult => ({ ok: false, reason });
const done = (nong: NongState, extra: Partial<{ garden: Garden; amount: number; got: number; item: NongProduct }> = {}): NongResult => ({ ok: true, nong, amount: 0, got: 0, ...extra });

function add<K extends string>(m: Partial<Record<K, number>>, k: K, n: number): Partial<Record<K, number>> {
  const out = { ...m, [k]: (m[k] ?? 0) + n } as Partial<Record<K, number>>;
  if ((out[k] ?? 0) <= 0) delete out[k];
  return out;
}

const fedOf = (s: NongState, pen: Pen): number => (pen === 'ga' ? s.gaFed : s.boFed);
const withFed = (s: NongState, pen: Pen, day: number): NongState => (pen === 'ga' ? { ...s, gaFed: day } : { ...s, boFed: day });

/** Chuồng [pen] có sản phẩm chờ lấy hôm [today]. */
export const penReady = (s: NongState, pen: Pen, today: number): boolean => fedOf(s, pen) >= 0 && today > fedOf(s, pen);
/** Hôm nay đã cho ăn (chờ mai). */
export const penFedToday = (s: NongState, pen: Pen, today: number): boolean => fedOf(s, pen) === today;

/** Rắc thóc (1 Lúa kho vườn) / cho cỏ (1 Cỏ khô) — R-NONG-2, R-NONG-4. */
export function feedPen(s: NongState, g: Garden, pen: string, today: number): NongResult {
  if (pen !== 'ga' && pen !== 'bo') return no('bad');
  if (penReady(s, pen, today)) return no('ready');
  if (fedOf(s, pen) === today) return no('fed');
  if (pen === 'ga') {
    if ((g.barn.lua ?? 0) <= 0) return no('no-feed');
    return done(withFed(s, pen, today), { garden: { ...g, barn: add(g.barn, 'lua', -1) } });
  }
  if ((s.kho[HAY] ?? 0) <= 0) return no('no-feed');
  return done({ ...withFed(s, pen, today), kho: add(s.kho, HAY, -1) });
}

/** Nhặt trứng / lấy sữa. */
export function takePen(s: NongState, pen: string, today: number): NongResult {
  if (pen !== 'ga' && pen !== 'bo') return no('bad');
  if (!penReady(s, pen, today)) return no('none');
  const n = PEN_YIELD[pen];
  return done({ ...withFed(s, pen, -1), kho: add(s.kho, PEN_PRODUCT[pen], n) }, { got: n });
}

export const fishToday = (s: NongState, today: number): number => (s.fishDay === today ? s.fishN : 0);

/** Được 1 cá (R-NONG-3). */
export function catchFish(s: NongState, today: number): NongResult {
  const n = fishToday(s, today);
  if (n >= FISH_DAILY) return no('limit');
  const kind = fishKind(today, n);
  return done({ ...s, fishDay: today, fishN: n + 1, kho: add(s.kho, kind, 1) }, { got: 1, item: kind });
}

/** Tiến độ 0…1+ của gốc [vine] (không có = −1). */
export function vineFrac(s: NongState, vine: Vine, now: number, speed = 1): number {
  const t = s.vines[vine];
  return t === undefined ? -1 : ((now - t) * speed) / (VINE_MINUTES[vine] * 60000);
}

/** Dáng gốc giàn (R-NONG-6). */
export function vineStage(s: NongState, vine: string, now: number, speed = 1): VineStage {
  if (!isVine(vine)) return 'trong';
  const f = vineFrac(s, vine, now, speed);
  if (f < 0) return 'trong';
  if (f >= 1) return 'chin';
  if (f > 0.5) return 'phu';
  if (f >= 0.1) return 'leo';
  return 'mam';
}

export function sowVine(s: NongState, vine: string, now: number): NongResult {
  if (!isVine(vine)) return no('bad');
  if (s.vines[vine] !== undefined) return no('busy');
  return done({ ...s, vines: { ...s.vines, [vine]: Math.floor(now) } });
}

export function pickVine(s: NongState, vine: string, now: number, speed = 1): NongResult {
  if (!isVine(vine)) return no('bad');
  if (s.vines[vine] === undefined) return no('empty');
  if (vineStage(s, vine, now, speed) !== 'chin') return no('not-ripe');
  const vines = { ...s.vines };
  delete vines[vine];
  return done({ ...s, vines, kho: add(s.kho, vine, VINE_YIELD) }, { got: VINE_YIELD });
}

/** +[n] Cỏ khô (nhổ cỏ — R-NONG-5). */
export const addHay = (s: NongState, n: number): NongState => ({ ...s, kho: add(s.kho, HAY, n) });

/** Bán [item] (`null` = bán hết) — không trần (R-NONG-7). */
export function sellNong(s: NongState, item: string | null): NongResult {
  if (item !== null && !(item in NONG_PRICES)) return no('bad');
  const kinds = (item === null ? Object.keys(NONG_PRICES) : [item]) as NongProduct[];
  const kho = { ...s.kho };
  let amount = 0;
  let got = 0;
  for (const k of kinds) {
    const n = kho[k] ?? 0;
    if (n <= 0) continue;
    amount += n * NONG_PRICES[k];
    got += n;
    delete kho[k];
  }
  return got === 0 ? no('empty') : done({ ...s, kho }, { amount, got });
}

/** Tổng Văn tiền nếu bán hết sản phẩm nông trại. */
export const nongWorth = (s: NongState): number => (Object.keys(NONG_PRICES) as NongProduct[]).reduce((a, k) => a + (s.kho[k] ?? 0) * NONG_PRICES[k], 0);

/** Thao tác `nongAct` (docs/bridge.md). */
export type NongAct =
  | { act: 'feed' | 'take'; pen: Pen }
  | { act: 'fish' }
  | { act: 'sow' | 'pick'; vine: Vine }
  | { act: 'sell'; item: NongProduct | null };

/** Chạy một thao tác (chế độ thử — Flutter chạy bản Dart). [today] = ngày VN của [now]. */
export function applyNongAct(s: NongState, g: Garden, a: NongAct, now: number, today: number, speed = 1): NongResult {
  switch (a.act) {
    case 'feed':
      return feedPen(s, g, a.pen, today);
    case 'take':
      return takePen(s, a.pen, today);
    case 'fish':
      return catchFish(s, today);
    case 'sow':
      return sowVine(s, a.vine, now);
    case 'pick':
      return pickVine(s, a.vine, now, speed);
    case 'sell':
      return sellNong(s, a.item);
  }
}

/** Đọc câu trả lời `nongAct`; sai dạng → `null`. */
export function parseNongReply(v: unknown, parseGarden: (g: unknown) => Garden): (NongResult & { balance: number }) | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const balance = typeof o.balance === 'number' && o.balance >= 0 ? o.balance : null;
  if (balance === null) return null;
  const n = (x: unknown): number => (typeof x === 'number' && Number.isFinite(x) ? x : 0);
  if (o.ok === true) {
    const item = typeof o.item === 'string' && o.item in NONG_PRICES ? (o.item as NongProduct) : undefined;
    return { ok: true, nong: parseNong(o.nong), ...(o.garden ? { garden: parseGarden(o.garden) } : {}), amount: n(o.amount), got: n(o.got), ...(item ? { item } : {}), balance };
  }
  if (o.ok === false && (NONG_REASONS as readonly unknown[]).includes(o.reason)) return { ok: false, reason: o.reason as NongReason, balance };
  return null;
}
