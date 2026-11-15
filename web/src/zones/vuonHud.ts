/**
 * Dữ liệu HUD Vườn rau (thiết kế 2026-11-15.29, đặc tả `design/docs/screen_specs.md` mục "Vườn rau"): chọn việc ở chỗ đứng,
 * thẻ hạt, bảng kho (bán theo trần), hộp mở ô, chữ tấm báo. Luật ở `vuon.ts` (R-VUON-1…9) — ở đây chỉ dựng chữ / số để vẽ;
 * chuỗi chép `design/l10n/vi.arb` (`garden*`). Thuần — không DOM (dựng: `ui/gardenHud.ts`, `ui/gardenPanel.ts`).
 */
import {
  canWater,
  CROPS,
  cropOf,
  elapsedMs,
  growMs,
  hasBug,
  nextOpenPrice,
  plotOf,
  plotState,
  PLOT_COUNT,
  remainingMs,
  sell,
  sellCapped,
  SELL_DAILY_CAP,
  soldOn,
  weedsOf,
  yieldOf,
  type Crop,
  type CropId,
  type Garden,
  type PlotState,
} from './vuon';
import { pestsOf } from './vuonCham';
import { formatCoins } from './wallet';

/** Thời gian lớn trên thẻ hạt: "30 phút" · "1 giờ" · "2 giờ" (`gardenTimeM` / `gardenTimeHM`). */
export function growText(c: Crop): string {
  const h = Math.floor(c.minutes / 60);
  const m = c.minutes % 60;
  if (h === 0) return `${m} phút`;
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}

/* ---------- chỗ đứng (R-VUON-2, R-VUON-7) ---------- */

/** Việc ở chỗ đứng khi vòng công cụ đóng: nhãn luống đang lớn, hay nút "Bán" ở thùng (luống làm qua vòng — R-VUON-2). */
export type GardenSpot =
  | { kind: 'grow'; plot: string; crop: Crop; /** "còn 1 giờ 20 phút" bỏ chữ "còn" → `gardenGrowing` */ text: string; frac: number; dist: number }
  | { kind: 'bin'; dist: number };

/**
 * Chọn việc (R-VUON-2, R-VUON-7): luống gần nhất trong tầm [near] và thùng thu mua cách [binDist] — **vật gần hơn thắng**;
 * thùng chỉ trong tầm dưới 2,5 m. Luống có cây chưa chín → nhãn "{cây} · còn {thời gian}"; luống khác không nút (chạm luống →
 * vòng công cụ). Không gì → `null`.
 */
export function pickSpot(g: Garden, near: { id: string; dist: number } | null, binDist: number, now: number, speed = 1): GardenSpot | null {
  if (binDist < BIN_RANGE && (!near || binDist < near.dist)) return { kind: 'bin', dist: binDist };
  if (!near) return null;
  const st = plotState(g, near.id, now, speed);
  const p = plotOf(g, near.id);
  const c = cropOf(p.crop);
  if (!c || st === 'hoang' || st === 'trong' || st === 'chin') return null;
  const ms = remainingMs(p, now, speed);
  return { kind: 'grow', plot: near.id, crop: c, text: remainText(ms), frac: Math.min(1, elapsedMs(p, now) / growMs(c, speed)), dist: near.dist };
}

/** Thời gian còn lại không chữ "còn": "1 giờ 20 phút" · "20 phút" · "chưa tới 1 phút" (`gardenTimeHM`, `gardenTimeM`, `gardenTimeUnder1`). */
export function remainText(ms: number): string {
  if (ms < 60000) return 'chưa tới 1 phút';
  const m = Math.ceil(ms / 60000);
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r} phút`;
  return r ? `${h} giờ ${r} phút` : `${h} giờ`;
}

/** Nhãn luống đang lớn: "Ngô · còn 1 giờ 20 phút" (`gardenGrowing`). */
export const growingLabel = (s: { crop: Crop; text: string }): string => `${s.crop.name} · còn ${s.text}`;

/** Chữ nút nổi ở thùng thu mua (`gardenSell`). */
export const SELL_TEXT = 'Bán';

/**
 * HUD vườn hiện khi đi lại bình thường (đặc tả: ẩn khi trang trí, bản đồ, thoại NPC, ngồi, màn Flutter, màn tải); dấu giọt /
 * lấp lánh là cảnh nên vẫn hiện.
 */
export interface GardenBusy {
  decorating: boolean;
  map: boolean;
  talking: boolean;
  sitting: boolean;
  covered: boolean;
  loading: boolean;
}
export const gardenHudShown = (b: GardenBusy): boolean => !(b.decorating || b.map || b.talking || b.sitting || b.covered || b.loading);

/** Dấu luống trong cảnh thấy trong tầm này (m) — hàng dấu ở `vuonVongHud.ts` `plotBadges`. */
export const MARK_RANGE = 25;

/* ---------- bảng chọn hạt (R-VUON-3) ---------- */

export interface SeedCard {
  crop: Crop;
  /** "còn n" */
  left: number;
  time: string;
}

/** Chỉ loại đang có trong túi, theo thứ tự bảng cây. Rỗng → bảng "Túi hạt trống". */
export function seedCards(g: Garden): SeedCard[] {
  return CROPS.filter((c) => (g.seeds[c.id] ?? 0) > 0).map((c) => ({ crop: c, left: g.seeds[c.id]!, time: growText(c) }));
}

/** Chip túi hạt chân bảng kho: "Cải ngọt 2". */
export const bagChips = (g: Garden): { name: string; n: number }[] =>
  CROPS.filter((c) => (g.seeds[c.id] ?? 0) > 0).map((c) => ({ name: c.name, n: g.seeds[c.id]! }));

/* ---------- kho nông sản (R-VUON-7) ---------- */

export interface StoreRow {
  crop: Crop;
  count: number;
  /** còn bán được ít nhất 1 cái hôm nay (phần trần còn lại ≥ giá) */
  canSell: boolean;
}

export interface StoreView {
  rows: StoreRow[];
  /** đã bán hôm nay (Văn tiền) */
  sold: number;
  /** vạch: phần đã bán / 60 */
  frac: number;
  /** "Hôm nay đã bán {n} / 60 Văn tiền" */
  soldText: string;
  /** còn hàng mà không bán nổi cái nào → dải vàng, nút "Bán" nét đứt */
  capped: boolean;
  /** "Bán hết" bán được bao nhiêu Văn tiền (theo trần); 0 khi kho trống / đủ trần */
  sellAll: number;
  /** bán hết vượt phần trần còn lại → nút "Bán · +n" + dòng "Hôm nay còn bán được {room} — …" */
  overCap: boolean;
  /** phần trần còn lại */
  room: number;
}

/** Bảng kho trong ngày VN [today]: hàng theo thứ tự bảng cây; nút lớn tính đúng như "Bán hết" (`sell(…, null)`). */
export function storeView(g: Garden, today: number): StoreView {
  const sold = soldOn(g, today);
  const room = Math.max(0, SELL_DAILY_CAP - sold);
  const rows = CROPS.filter((c) => (g.barn[c.id] ?? 0) > 0).map((c) => ({ crop: c, count: g.barn[c.id]!, canSell: room >= c.sell }));
  const all = sell(g, null, today);
  const sellAll = all.ok ? all.amount : 0;
  const worth = rows.reduce((s, r) => s + r.count * r.crop.sell, 0);
  return {
    rows,
    sold,
    frac: Math.min(1, sold / SELL_DAILY_CAP),
    soldText: `Hôm nay đã bán ${sold} / ${SELL_DAILY_CAP} Văn tiền`,
    capped: sellCapped(g, today),
    sellAll,
    overCap: sellAll > 0 && worth > sellAll,
    room,
  };
}

/** Nút lớn chân bảng kho: "Bán hết · +47" / "Bán · +19" (`gardenSellAll`, `gardenSellUpTo`). */
export const sellAllText = (v: StoreView): string => (v.overCap ? `Bán · +${v.sellAll}` : `Bán hết · +${v.sellAll}`);
/** `gardenCapLeft` */
export const capLeftText = (room: number): string => `Hôm nay còn bán được ${room} — phần còn lại giữ trong kho`;

/* ---------- mở ô (R-VUON-8) ---------- */

export interface UnlockView {
  /** số thứ tự ô sẽ mở (7 … 12) */
  n: number;
  price: number;
  title: string;
  rows: [string, string][];
  /** thiếu → "Còn thiếu n" nét đứt, Còn lại "—" */
  short: number;
  /** "Mở · 50" / "Còn thiếu 30" */
  action: string;
}

/** Hộp mở ô với số dư [balance]; đủ 12 ô → `null`. */
export function unlockView(g: Garden, balance: number): UnlockView | null {
  const price = nextOpenPrice(g);
  if (price === null) return null;
  const n = g.open + 1;
  const short = Math.max(0, price - balance);
  return {
    n,
    price,
    title: `Mở luống ${n} / ${PLOT_COUNT}`,
    rows: [
      ['Đang có', formatCoins(balance)],
      ['Giá', `−${formatCoins(price)}`],
      ['Còn lại', short > 0 ? '—' : formatCoins(balance - price)],
    ],
    short,
    action: short > 0 ? `Còn thiếu ${formatCoins(short)}` : `Mở · ${formatCoins(price)}`,
  };
}

export const UNLOCK_SUB = 'Ô đất kế tiếp · mở xong gieo được ngay. Giá tăng dần: 50 · 80 · 120 · 160 · 200 · 250.';

/* ---------- tấm báo (R-VUON-6, R-VUON-8) ---------- */

export interface GardenToast {
  kind: 'chin' | 'thu' | 'mo-o';
  title: string;
  sub: string | null;
  crop?: CropId;
}

export const ripeToast = (n: number): GardenToast => ({ kind: 'chin', title: `Vườn rau: ${n} luống đã chín`, sub: 'Lấp lánh là luống thu được' });
export const harvestToast = (c: Crop, n: number): GardenToast => ({
  kind: 'thu',
  title: `+${n} ${c.name} vào kho`,
  sub: 'Mang tới thùng thu mua ở cổng vườn để bán',
  crop: c.id,
});
export const unlockedToast = (n: number): GardenToast => ({ kind: 'mo-o', title: `Đã mở luống ${n}`, sub: null });

/* ---------- dáng luống trong cảnh + chữ nổi (V-73: R-VUON-5/10/11/12/13) ---------- */

/** Dáng luống để cảnh vẽ: đất khô / ẩm / thường, sâu, số bụi cỏ, đã bón. */
export interface PlotLook {
  soil: 'kho' | 'am' | 'thuong';
  bug: boolean;
  weeds: 0 | 2 | 3;
  fert: boolean;
}

/** Dáng luống [id] (R-VUON-5): tới mốc tưới mà chưa tưới → khô; có cây chưa chín khác → ẩm; trống / chín / hoang → thường. */
export function plotLook(g: Garden, id: string, now: number, speed = 1): PlotLook {
  const st = plotState(g, id, now, speed);
  const p = plotOf(g, id);
  if (st === 'hoang' || st === 'trong') return { soil: 'thuong', bug: false, weeds: 0, fert: false };
  const soil = st === 'chin' ? 'thuong' : canWater(p, now, speed) ? 'kho' : 'am';
  return { soil, bug: hasBug(p, id, now, speed), weeds: weedsOf(p, id, now, speed), fert: p.boost > 0 };
}

/** Chữ nổi khi làm xong (R-VUON-13): dòng chính + dòng phụ (có thể `null`). Tiếng Việt, không chữ Hán (R-HUD-4). */
export interface FloatText {
  text: string;
  sub: string | null;
}

export const SOW_FLOAT: FloatText = { text: '−1 hạt', sub: null };
export const WATER_FLOAT: FloatText = { text: 'Đất ẩm rồi', sub: null }; // gardenFloatWet
export const BUG_FLOAT: FloatText = { text: 'Bắt được sâu!', sub: null };
export const WEED_FLOAT: FloatText = { text: 'Sạch cỏ!', sub: null };
export const FERT_FLOAT: FloatText = { text: 'Mau lớn!', sub: null };

/**
 * Chữ nổi khi thu luống [id] (trước khi thu — R-VUON-6): "+3 Cải ngọt"; còn sâu / cỏ lúc thu → dòng 2 "ít hơn vì sâu" /
 * "ít hơn vì cỏ" / "ít hơn vì sâu và cỏ" (chỉ khi thật sự bớt — đã ở mức thấp nhất 2 thì không ghi).
 */
export function harvestFloat(g: Garden, id: string, crop: Crop, got: number): FloatText {
  const p = plotOf(g, id);
  const s = pestsOf(id, p.plantedAt);
  const bug = s.bugAt >= 0 && p.bug === 0;
  const weed = s.weedAt >= 0 && p.weed === 0;
  const full = yieldOf({ ...p, bug: 1, weed: 1 }, id);
  const why = bug && weed ? 'sâu và cỏ' : bug ? 'sâu' : 'cỏ';
  return { text: `+${got} ${crop.name}`, sub: got < full && (bug || weed) ? `ít hơn vì ${why}` : null };
}

/** Chuỗi trạng thái cho Console / thử (`__hocXaVuon.look`): "o-3 Lúa · mầm · khô · sâu · 2 cỏ · đã bón". */
export function lookText(g: Garden, id: string, now: number, speed = 1): string {
  const st: PlotState = plotState(g, id, now, speed);
  const c = cropOf(plotOf(g, id).crop);
  const l = plotLook(g, id, now, speed);
  const parts = [`${id} ${c ? c.name : st}`, c ? st : null, l.soil === 'thuong' ? null : l.soil, l.bug ? 'sâu' : null, l.weeds ? `${l.weeds} cỏ` : null, l.fert ? 'đã bón' : null];
  return parts.filter(Boolean).join(' · ');
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
