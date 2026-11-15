/**
 * Vườn rau ở Nhà của ta (R-VUON-1…9): bảng 8 cây, luật gieo / tưới / thu / bán / mở ô / mua hạt, chữ hiển thị, chọn nút ở
 * luống gần nhất. **Bản TS chép luật `app/lib/journey/garden.dart`** (Dart là gốc — đổi luật sửa cả hai, test hai phía
 * cùng ví dụ sổ: `vuon.test.ts` ↔ `app/test/rules/vuon_test.dart`). Có Flutter: trang chỉ **vẽ** giai đoạn từ vườn Flutter
 * gửi (`getGarden`) + `Date.now()`; không Flutter: luật chạy trên ví thử (`walletRules.ts`, R-TIEN-7). Thuần — không three,
 * không DOM. Hệ số `speed` (`?vuon=60`) chỉ dùng ở chế độ thử.
 */
import { maNgayVN } from './gioVN';

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
}

export const EMPTY_PLOT: Plot = { crop: null, plantedAt: 0, watered: 0 };

export interface Garden {
  open: number;
  plots: Record<string, Plot>;
  seeds: Partial<Record<CropId, number>>;
  barn: Partial<Record<CropId, number>>;
  /** ngày giờ VN (`maNgayVN`) của `soldToday` */
  sellDay: number;
  soldToday: number;
}

/** Vườn mới: 6 luống trống, túi 3 hạt Cải ngọt, kho rỗng (R-VUON-1, R-VUON-3). */
export function freshGarden(): Garden {
  const plots: Record<string, Plot> = {};
  for (let i = 1; i <= PLOT_COUNT; i++) plots[plotId(i)] = { ...EMPTY_PLOT };
  return { open: START_OPEN, plots, seeds: { ...STARTER_SEEDS }, barn: {}, sellDay: -1, soldToday: 0 };
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
  return { crop: c.id, plantedAt: t, watered: Math.max(0, Math.min(MAX_WATER, Math.floor(w))) };
}

/** Đọc vườn (Flutter gửi / ví thử); hỏng → vườn mới. Như `Garden.fromJson` ở Dart. */
export function parseGarden(v: unknown): Garden {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return freshGarden();
  const o = v as Record<string, unknown>;
  const open = Math.max(START_OPEN, Math.min(PLOT_COUNT, Math.floor(num(o.open) ?? START_OPEN)));
  const raw = o.plots && typeof o.plots === 'object' ? (o.plots as Record<string, unknown>) : {};
  const plots: Record<string, Plot> = {};
  for (let i = 1; i <= PLOT_COUNT; i++) plots[plotId(i)] = i <= open ? parsePlot(raw[plotId(i)]) : { ...EMPTY_PLOT };
  const sold = num(o.soldToday);
  return { open, plots, seeds: counts(o.seeds), barn: counts(o.barn), sellDay: Math.floor(num(o.sellDay) ?? -1), soldToday: sold && sold > 0 ? Math.floor(sold) : 0 };
}

export const plotOf = (g: Garden, id: string): Plot => g.plots[id] ?? EMPTY_PLOT;
export const soldOn = (g: Garden, today: number): number => (g.sellDay === today ? g.soldToday : 0);

/** Trạng thái luống — chuỗi như `PlotState.wire` ở Dart. */
export type PlotState = 'hoang' | 'trong' | 'vua-gieo' | 'mam' | 'lon' | 'chin';

/** Thời gian lớn (ms) theo hệ số [speed] (`?vuon=60` → 60 lần nhanh). */
export const growMs = (c: Crop, speed = 1): number => (c.minutes * 60000) / speed;
export const elapsedMs = (p: Plot, now: number): number => Math.max(0, now - p.plantedAt);

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

export const yieldOf = (p: Plot): number => BASE_YIELD + Math.max(0, Math.min(MAX_WATER, p.watered));

export function remainingMs(p: Plot, now: number, speed = 1): number {
  const c = cropOf(p.crop);
  return c ? Math.max(0, growMs(c, speed) - elapsedMs(p, now)) : 0;
}

export type GardenReason = 'short' | 'busy' | 'empty' | 'not-ripe' | 'dry' | 'cap' | 'full' | 'locked' | 'no-seed' | 'bad';
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
  return done({ ...withPlot(g, id, { crop: c.id, plantedAt: now, watered: 0 }), seeds: { ...g.seeds, [c.id]: have - 1 } });
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

/** Thu (R-VUON-6): 2 + lượt tưới vào kho, luống trống lại. */
export function harvest(g: Garden, id: string, now: number, speed = 1): GardenResult {
  if (badPlot(id)) return no('bad');
  if (plotIndex(id) > g.open) return no('locked');
  const p = plotOf(g, id);
  if (!p.crop) return no('empty');
  if (plotState(g, id, now, speed) !== 'chin') return no('not-ripe');
  const n = yieldOf(p);
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
  | { act: 'water' | 'harvest'; plot: string }
  | { act: 'sell'; crop: CropId | null }
  | { act: 'open' }
  | { act: 'buy'; crop: CropId; /** × 1 · × 5 · × 10 (thiếu = 1) */ count?: number };

/** Chạy một thao tác (chế độ thử — Flutter chạy bản Dart). [today] = ngày VN. */
export function applyAct(g: Garden, a: GardenAct, balance: number, now: number, speed = 1): GardenResult {
  switch (a.act) {
    case 'sow':
      return sow(g, a.plot, a.crop, now);
    case 'water':
      return water(g, a.plot, now, speed);
    case 'harvest':
      return harvest(g, a.plot, now, speed);
    case 'sell':
      return sell(g, a.crop, maNgayVN(now));
    case 'open':
      return openPlot(g, balance);
    case 'buy':
      return buySeed(g, a.crop, balance, a.count ?? 1);
  }
}

/** Đọc câu trả lời `gardenAct`; sai dạng → `null`. */
export function parseActReply(v: unknown): (GardenResult & { balance: number }) | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const balance = num(o.balance);
  if (balance === null || balance < 0) return null;
  if (o.ok === true) return { ok: true, garden: parseGarden(o.garden), amount: num(o.amount) ?? 0, got: num(o.got) ?? 0, balance };
  const reasons: readonly GardenReason[] = ['short', 'busy', 'empty', 'not-ripe', 'dry', 'cap', 'full', 'locked', 'no-seed', 'bad'];
  if (o.ok === false && reasons.includes(o.reason as GardenReason)) return { ok: false, reason: o.reason as GardenReason, short: num(o.short) ?? 0, balance };
  return null;
}

/* ---------- chữ hiển thị (thiết kế 2026-11-15.29; chữ bảng / nút ở `vuonHud.ts`) ---------- */

/** "còn 1 giờ 20 phút" · "còn 20 phút" · "còn 1 giờ" · dưới 1 phút "còn chưa tới 1 phút" · 0 → "đã chín". */
export function remainingText(ms: number): string {
  if (ms <= 0) return 'đã chín';
  const m = Math.ceil(ms / 60000);
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return ms < 60000 ? 'còn chưa tới 1 phút' : `còn ${r} phút`;
  return r ? `còn ${h} giờ ${r} phút` : `còn ${h} giờ`;
}

export const openPlotLabel = (price: number): string => `−${price} · Mở ô đất`;
export const sellLabel = (amount: number): string => `+${amount} · Bán nông sản`;
export const seedLabel = (c: Crop, count = 1): string => `−${c.seed * count} · Hạt ${c.name}`;

/** Tầm hiện nút ở luống / thùng thu mua (R-VUON-2, R-VUON-7). */
export const PLOT_RANGE = 1.6;
export const BIN_RANGE = 2.5;

export type PlotButton = 'gieo' | 'tuoi' | 'thu' | 'mo-o';

/** Nút ở luống theo trạng thái (R-VUON-2): đang lớn không tưới được → không nút, chỉ nhãn. */
export function plotButton(state: PlotState, waterable: boolean): PlotButton | null {
  if (state === 'hoang') return 'mo-o';
  if (state === 'trong') return 'gieo';
  if (state === 'chin') return 'thu';
  return waterable ? 'tuoi' : null;
}

/** Luống gần nhất trong tầm [PLOT_RANGE] (R-VUON-2); không có → `null`. */
export function nearestPlot(plots: readonly { id: string; x: number; z: number }[], x: number, z: number): { id: string; dist: number } | null {
  let best: { id: string; dist: number } | null = null;
  for (const p of plots) {
    const d = Math.hypot(p.x - x, p.z - z);
    if (d < PLOT_RANGE && (!best || d < best.dist)) best = { id: p.id, dist: d };
  }
  return best;
}

/** Hệ số lớn nhanh `?vuon=<n>` (chế độ thử): số dương; thiếu / sai → 1. */
export function gardenSpeed(search: string): number {
  const v = Number(new URLSearchParams(search).get('vuon'));
  return Number.isFinite(v) && v > 0 ? v : 1;
}
