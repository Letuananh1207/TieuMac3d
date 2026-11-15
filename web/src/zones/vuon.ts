/**
 * Vườn rau ở Nhà của ta (R-VUON-1…9): bảng 8 cây, luật gieo / tưới / thu / bán / mở ô / mua hạt, chữ hiển thị, chọn nút ở
 * luống gần nhất. **Bản TS chép luật `app/lib/journey/garden.dart`** (Dart là gốc — đổi luật sửa cả hai, test hai phía
 * cùng ví dụ sổ: `vuon.test.ts` ↔ `app/test/rules/vuon_test.dart`). Có Flutter: trang chỉ **vẽ** giai đoạn từ vườn Flutter
 * gửi (`getGarden`) + `Date.now()`; không Flutter: luật chạy trên ví thử (`walletRules.ts`, R-TIEN-7). Thuần — không three,
 * không DOM. Hệ số `speed` (`?vuon=60`) chỉ dùng ở chế độ thử.
 */
import { maNgayVN } from './gioVN';
import { FERT_COUNTS, FERT_ITEM, FERT_PRICE, fertBoost, pestsOf, reached, STARTER_FERT, yieldFrom } from './vuonCham';

export type CropId = 'cai' | 'cu-cai' | 'ngo' | 'lua' | 'bi' | 'cuc' | 'dua' | 'tra';

export interface Crop {
  id: CropId;
  /** tên tiếng Việt (R-HUD-4) */
  name: string;
  /** phút giờ thật tới chín (R-VUON-4) */
  minutes: number;
  /** giá 1 hạt ở Tạp hoá (R-VUON-9) */
  seed: number;
  /** giá bán / cái ở thùng thu mua (R-VUON-7) */
  sell: number;
}

const crop = (id: CropId, name: string, minutes: number, seed: number, sell: number): Crop => ({ id, name, minutes, seed, sell });

/** 8 cây theo thứ tự bảng — trùng `crops` ở Dart. */
export const CROPS: readonly Crop[] = [
  crop('cai', 'Cải ngọt', 30, 4, 3),
  crop('cu-cai', 'Củ cải', 60, 6, 4),
  crop('ngo', 'Ngô', 120, 8, 5),
  crop('lua', 'Lúa', 180, 10, 6),
  crop('bi', 'Bí đỏ', 240, 12, 7),
  crop('cuc', 'Hoa cúc', 300, 14, 8),
  crop('dua', 'Dưa hấu', 360, 16, 9),
  crop('tra', 'Trà', 480, 20, 11),
];

const BY_ID = new Map<string, Crop>(CROPS.map((c) => [c.id, c]));

export function cropOf(id: unknown): Crop | undefined {
  return typeof id === 'string' ? BY_ID.get(id) : undefined;
}

export const PLOT_COUNT = 12;
export const START_OPEN = 6;
export const OPEN_PRICES: readonly number[] = [50, 80, 120, 160, 200, 250];
export const SELL_DAILY_CAP = 60;
export const BASE_YIELD = 2;
export const MAX_WATER = 2;
export const STARTER_SEEDS: Readonly<Partial<Record<CropId, number>>> = { cai: 3 };

export const plotId = (n: number): string => `o-${n}`;
export function plotIndex(id: string): number {
  const n = id.startsWith('o-') ? Number(id.slice(2)) : 0;
  return Number.isInteger(n) ? n : 0;
}

export interface Plot {
  crop: CropId | null;
  /** lúc gieo, ms epoch UTC */
  plantedAt: number;
  watered: number;
  /** ms cộng vào tiến độ do bón (R-VUON-12); 0 = chưa bón */
  boost: number;
  /** 1 = sâu đã bắt (R-VUON-10) — có sâu hay không tính từ `pestsOf` */
  bug: number;
  /** 1 = cỏ đã nhổ (R-VUON-11) */
  weed: number;
}

export const EMPTY_PLOT: Plot = { crop: null, plantedAt: 0, watered: 0, boost: 0, bug: 0, weed: 0 };

export interface Garden {
  open: number;
  plots: Record<string, Plot>;
  seeds: Partial<Record<CropId, number>>;
  barn: Partial<Record<CropId, number>>;
  /** ngày giờ VN (`maNgayVN`) của `soldToday` */
  sellDay: number;
  soldToday: number;
  /** túi phân bón: số bao (R-VUON-12) */
  fert: number;
}

/** Vườn mới: 6 luống trống, túi 3 hạt Cải ngọt, 3 bao phân, kho rỗng (R-VUON-1, R-VUON-3, R-VUON-12). */
export function freshGarden(): Garden {
  const plots: Record<string, Plot> = {};
  for (let i = 1; i <= PLOT_COUNT; i++) plots[plotId(i)] = { ...EMPTY_PLOT };
  return { open: START_OPEN, plots, seeds: { ...STARTER_SEEDS }, barn: {}, sellDay: -1, soldToday: 0, fert: STARTER_FERT };
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function counts(v: unknown): Partial<Record<CropId, number>> {
  const out: Partial<Record<CropId, number>> = {};
  if (!v || typeof v !== 'object') return out;
  for (const [k, n] of Object.entries(v as Record<string, unknown>)) {
    const c = cropOf(k);
    const x = num(n);
    if (c && x !== null && x > 0) out[c.id] = Math.floor(x);
  }
  return out;
}

function parsePlot(v: unknown): Plot {
  if (!v || typeof v !== 'object') return { ...EMPTY_PLOT };
  const o = v as Record<string, unknown>;
  const c = cropOf(o.crop);
  const t = num(o.plantedAt);
  if (!c || t === null) return { ...EMPTY_PLOT };
  const w = num(o.watered) ?? 0;
  const b = num(o.boost);
  // bản cũ (trước V-73) thiếu bug / weed → coi như đã sạch (như Dart)
  const flag = (v: unknown): number => (num(v) === null ? 1 : num(v)! > 0 ? 1 : 0);
  return {
    crop: c.id,
    plantedAt: Math.floor(t),
    watered: Math.max(0, Math.min(MAX_WATER, Math.floor(w))),
    boost: b !== null && b > 0 ? Math.floor(b) : 0,
    bug: flag(o.bug),
    weed: flag(o.weed),
  };
}

/** Đọc vườn (Flutter gửi / ví thử); hỏng → vườn mới; thiếu `fert` → 3 bao. Như `Garden.fromJson` ở Dart. */
export function parseGarden(v: unknown): Garden {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return freshGarden();
  const o = v as Record<string, unknown>;
  const open = Math.max(START_OPEN, Math.min(PLOT_COUNT, Math.floor(num(o.open) ?? START_OPEN)));
  const raw = o.plots && typeof o.plots === 'object' ? (o.plots as Record<string, unknown>) : {};
  const plots: Record<string, Plot> = {};
  for (let i = 1; i <= PLOT_COUNT; i++) plots[plotId(i)] = i <= open ? parsePlot(raw[plotId(i)]) : { ...EMPTY_PLOT };
  const sold = num(o.soldToday);
  const fert = num(o.fert);
  return {
    open,
    plots,
    seeds: counts(o.seeds),
    barn: counts(o.barn),
    sellDay: Math.floor(num(o.sellDay) ?? -1),
    soldToday: sold && sold > 0 ? Math.floor(sold) : 0,
    fert: fert === null ? STARTER_FERT : Math.max(0, Math.floor(fert)),
  };
}

export const plotOf = (g: Garden, id: string): Plot => g.plots[id] ?? EMPTY_PLOT;
export const soldOn = (g: Garden, today: number): number => (g.sellDay === today ? g.soldToday : 0);

/** Trạng thái luống — chuỗi như `PlotState.wire` ở Dart. */
export type PlotState = 'hoang' | 'trong' | 'vua-gieo' | 'mam' | 'lon' | 'chin';

/** Thời gian lớn (ms) theo hệ số [speed] (`?vuon=60` → 60 lần nhanh). */
export const growMs = (c: Crop, speed = 1): number => (c.minutes * 60000) / speed;
/** Tiến độ (ms) = từ lúc gieo + phần cộng do bón (R-VUON-12). */
export const elapsedMs = (p: Plot, now: number): number => Math.max(0, now - p.plantedAt) + p.boost;

export function plotState(g: Garden, id: string, now: number, speed = 1): PlotState {
  if (plotIndex(id) > g.open) return 'hoang';
  const p = plotOf(g, id);
  const c = cropOf(p.crop);
  if (!c) return 'trong';
  const f = elapsedMs(p, now) / growMs(c, speed);
  if (f >= 1) return 'chin';
  if (f >= 0.5) return 'lon';
  if (f >= 0.1) return 'mam';
  return 'vua-gieo';
}

/** Tưới được (R-VUON-5): có cây chưa chín; lượt 1 ngay, lượt 2 từ nửa thời gian. */
export function canWater(p: Plot, now: number, speed = 1): boolean {
  const c = cropOf(p.crop);
  if (!c) return false;
  const e = elapsedMs(p, now);
  const t = growMs(c, speed);
  if (e >= t) return false;
  return p.watered === 0 || (p.watered === 1 && e * 2 >= t);
}

/** Luống [id] đang có sâu (R-VUON-10): có sâu, tới mốc, chưa bắt; chín mà chưa bắt → vẫn còn. */
export function hasBug(p: Plot, id: string, now: number, speed = 1): boolean {
  const c = cropOf(p.crop);
  return !!c && p.bug === 0 && reached(pestsOf(id, p.plantedAt).bugAt, elapsedMs(p, now), growMs(c, speed));
}

/** Số bụi cỏ đang mọc ở luống [id] (R-VUON-11): 0 / 2 / 3. */
export function weedsOf(p: Plot, id: string, now: number, speed = 1): 0 | 2 | 3 {
  const c = cropOf(p.crop);
  if (!c || p.weed !== 0) return 0;
  const s = pestsOf(id, p.plantedAt);
  return reached(s.weedAt, elapsedMs(p, now), growMs(c, speed)) ? s.weeds : 0;
}

/** Sản lượng khi thu (R-VUON-6): 2 + lượt tưới − sâu còn − cỏ còn, 2 … 4. [BASE_YIELD] giữ cho chữ HUD. */
export function yieldOf(p: Plot, id: string): number {
  const s = pestsOf(id, p.plantedAt);
  return yieldFrom(p.watered, s.bugAt >= 0 && p.bug === 0, s.weedAt >= 0 && p.weed === 0);
}

export function remainingMs(p: Plot, now: number, speed = 1): number {
  const c = cropOf(p.crop);
  return c ? Math.max(0, growMs(c, speed) - elapsedMs(p, now)) : 0;
}

export const GARDEN_REASONS = ['short', 'busy', 'empty', 'not-ripe', 'dry', 'cap', 'full', 'locked', 'no-seed', 'no-bug', 'no-weed', 'no-fert', 'fert-done', 'bad'] as const;
export type GardenReason = (typeof GARDEN_REASONS)[number];
export type GardenResult =
  | { ok: true; garden: Garden; /** Văn tiền đổi (âm = trừ) */ amount: number; /** nông sản vừa thu / số cái vừa bán */ got: number }
  | { ok: false; reason: GardenReason; short: number };

const done = (garden: Garden, amount = 0, got = 0): GardenResult => ({ ok: true, garden, amount, got });
const no = (reason: GardenReason, short = 0): GardenResult => ({ ok: false, reason, short });
const withPlot = (g: Garden, id: string, p: Plot): Garden => ({ ...g, plots: { ...g.plots, [id]: p } });
const badPlot = (id: string): boolean => plotIndex(id) < 1 || plotIndex(id) > PLOT_COUNT;

/** Gieo (R-VUON-3): dùng 1 hạt trong túi, không trừ tiền. */
export function sow(g: Garden, id: string, cropId: string, now: number): GardenResult {
  const c = cropOf(cropId);
  if (badPlot(id) || !c) return no('bad');
  if (plotIndex(id) > g.open) return no('locked');
  if (plotOf(g, id).crop) return no('busy');
  const have = g.seeds[c.id] ?? 0;
  if (have <= 0) return no('no-seed');
  return done({ ...withPlot(g, id, { ...EMPTY_PLOT, crop: c.id, plantedAt: Math.floor(now) }), seeds: { ...g.seeds, [c.id]: have - 1 } });
}

/** Tưới (R-VUON-5). */
export function water(g: Garden, id: string, now: number, speed = 1): GardenResult {
  if (badPlot(id)) return no('bad');
  if (plotIndex(id) > g.open) return no('locked');
  const p = plotOf(g, id);
  if (!p.crop) return no('empty');
  if (!canWater(p, now, speed)) return no('dry');
  return done(withPlot(g, id, { ...p, watered: p.watered + 1 }));
}

/** Luống có cây để chăm: sai → `bad`, hoang → `locked`, trống → `empty`; được → `null`. */
function careRefuse(g: Garden, id: string): GardenResult | null {
  if (badPlot(id)) return no('bad');
  if (plotIndex(id) > g.open) return no('locked');
  return plotOf(g, id).crop ? null : no('empty');
}

/** Bắt sâu (R-VUON-10). */
export function catchBug(g: Garden, id: string, now: number, speed = 1): GardenResult {
  const p = plotOf(g, id);
  return careRefuse(g, id) ?? (hasBug(p, id, now, speed) ? done(withPlot(g, id, { ...p, bug: 1 })) : no('no-bug'));
}

/** Nhổ cỏ (R-VUON-11). */
export function pullWeed(g: Garden, id: string, now: number, speed = 1): GardenResult {
  const p = plotOf(g, id);
  return careRefuse(g, id) ?? (weedsOf(p, id, now, speed) ? done(withPlot(g, id, { ...p, weed: 1 })) : no('no-weed'));
}

/** Bón (R-VUON-12): chưa chín, chưa bón → thời gian còn lại giảm một nửa, túi −1 bao. */
export function fertilize(g: Garden, id: string, now: number, speed = 1): GardenResult {
  const refused = careRefuse(g, id);
  if (refused) return refused;
  const p = plotOf(g, id);
  const left = remainingMs(p, now, speed);
  if (p.boost > 0 || left <= 0) return no('fert-done');
  if (g.fert <= 0) return no('no-fert');
  return done({ ...withPlot(g, id, { ...p, boost: fertBoost(left) }), fert: g.fert - 1 });
}

/** Mua [count] bao phân (× 1 · × 5 · × 10) — 10 Văn / bao (R-VUON-12). */
export function buyFert(g: Garden, balance: number, count = 1): GardenResult {
  if (!FERT_COUNTS.includes(count)) return no('bad');
  const price = FERT_PRICE * count;
  if (balance < price) return no('short', price - balance);
  return done({ ...g, fert: g.fert + count }, -price);
}

/** Thu (R-VUON-6): 2 + lượt tưới − sâu / cỏ còn vào kho, luống trống lại. */
export function harvest(g: Garden, id: string, now: number, speed = 1): GardenResult {
  if (badPlot(id)) return no('bad');
  if (plotIndex(id) > g.open) return no('locked');
  const p = plotOf(g, id);
  if (!p.crop) return no('empty');
  if (plotState(g, id, now, speed) !== 'chin') return no('not-ripe');
  const n = yieldOf(p, id);
  return done({ ...withPlot(g, id, { ...EMPTY_PLOT }), barn: { ...g.barn, [p.crop]: (g.barn[p.crop] ?? 0) + n } }, 0, n);
}

/** Bán [cropId] (`null` = bán hết, giá cao trước) trong ngày VN [today] (R-VUON-7). */
export function sell(g: Garden, cropId: string | null, today: number): GardenResult {
  if (cropId !== null && !cropOf(cropId)) return no('bad');
  const kinds = cropId === null ? [...CROPS].sort((a, b) => b.sell - a.sell) : [cropOf(cropId)!];
  const stock = kinds.filter((c) => (g.barn[c.id] ?? 0) > 0);
  if (!stock.length) return no('empty');
  let room = SELL_DAILY_CAP - soldOn(g, today);
  const barn = { ...g.barn };
  let amount = 0;
  let got = 0;
  for (const c of stock) {
    const n = Math.min(barn[c.id]!, room > 0 ? Math.floor(room / c.sell) : 0);
    if (n <= 0) continue;
    barn[c.id] = barn[c.id]! - n;
    amount += n * c.sell;
    got += n;
    room -= n * c.sell;
  }
  if (got === 0) return no('cap');
  return done({ ...g, barn, sellDay: today, soldToday: soldOn(g, today) + amount }, amount, got);
}

/** Còn hàng mà phần trần còn lại nhỏ hơn giá rẻ nhất trong kho (R-VUON-7). */
export function sellCapped(g: Garden, today: number): boolean {
  const prices = CROPS.filter((c) => (g.barn[c.id] ?? 0) > 0).map((c) => c.sell);
  return prices.length > 0 && SELL_DAILY_CAP - soldOn(g, today) < Math.min(...prices);
}

export const nextOpenPrice = (g: Garden): number | null => (g.open >= PLOT_COUNT ? null : OPEN_PRICES[g.open - START_OPEN]);

/** Mở ô kế tiếp (R-VUON-8). */
export function openPlot(g: Garden, balance: number): GardenResult {
  const price = nextOpenPrice(g);
  if (price === null) return no('full');
  if (balance < price) return no('short', price - balance);
  return done({ ...g, open: g.open + 1 }, -price);
}

/** Số hạt chọn được mỗi lần mua ở Tạp hoá (R-VUON-9). */
export const SEED_COUNTS: readonly number[] = [1, 5, 10];

/** Mua [count] hạt (× 1 · × 5 · × 10 — R-VUON-9): giá = giá hạt × số; thiếu → `short`. Như `buySeed` ở Dart. */
export function buySeed(g: Garden, cropId: string, balance: number, count = 1): GardenResult {
  const c = cropOf(cropId);
  if (!c || !SEED_COUNTS.includes(count)) return no('bad');
  const price = c.seed * count;
  if (balance < price) return no('short', price - balance);
  return done({ ...g, seeds: { ...g.seeds, [c.id]: (g.seeds[c.id] ?? 0) + count } }, -price);
}

export function ripeCount(g: Garden, now: number, speed = 1): number {
  let n = 0;
  for (let i = 1; i <= g.open; i++) if (plotState(g, plotId(i), now, speed) === 'chin') n++;
  return n;
}

/** Thao tác `gardenAct` (docs/bridge.md). */
export type GardenAct =
  | { act: 'sow'; plot: string; crop: CropId }
  | { act: 'water' | 'harvest' | 'bug' | 'weed' | 'fert'; plot: string }
  | { act: 'sell'; crop: CropId | null }
  | { act: 'open' }
  | { act: 'buy'; crop: CropId; /** × 1 · × 5 · × 10 (thiếu = 1) */ count?: number }
  | { act: 'buy'; item: typeof FERT_ITEM; count?: number };

/** Chạy một thao tác (chế độ thử — Flutter chạy bản Dart). [today] = ngày VN. */
export function applyAct(g: Garden, a: GardenAct, balance: number, now: number, speed = 1): GardenResult {
  switch (a.act) {
    case 'sow':
      return sow(g, a.plot, a.crop, now);
    case 'water':
      return water(g, a.plot, now, speed);
    case 'harvest':
      return harvest(g, a.plot, now, speed);
    case 'bug':
      return catchBug(g, a.plot, now, speed);
    case 'weed':
      return pullWeed(g, a.plot, now, speed);
    case 'fert':
      return fertilize(g, a.plot, now, speed);
    case 'sell':
      return sell(g, a.crop, maNgayVN(now));
    case 'open':
      return openPlot(g, balance);
    case 'buy':
      return 'item' in a ? buyFert(g, balance, a.count ?? 1) : buySeed(g, a.crop, balance, a.count ?? 1);
  }
}

/** Đọc câu trả lời `gardenAct`; sai dạng → `null`. */
export function parseActReply(v: unknown): (GardenResult & { balance: number }) | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const balance = num(o.balance);
  if (balance === null || balance < 0) return null;
  if (o.ok === true) return { ok: true, garden: parseGarden(o.garden), amount: num(o.amount) ?? 0, got: num(o.got) ?? 0, balance };
  if (o.ok === false && (GARDEN_REASONS as readonly unknown[]).includes(o.reason)) return { ok: false, reason: o.reason as GardenReason, short: num(o.short) ?? 0, balance };
  return null;
}
