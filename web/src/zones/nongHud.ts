/**
 * Chữ + nút nông trại (R-NONG-1…8) — thuần, test được (`nongHud.test.ts`): công trình gần nhất, nút nổi theo trạng thái,
 * vòng câu cá (phao nhấp 2–6 s → chìm 1,2 s), tấm báo, thẻ chi tiết túi đồ có từ đã học. Nơi ghép: `web/src/nongTrai.ts`.
 */
import {
  FISH_DAILY,
  fishToday,
  HAY,
  NONG_NAMES,
  NONG_PRICES,
  NONG_WORDS,
  PEN_PRODUCT,
  PEN_YIELD,
  penFedToday,
  penReady,
  VINE_MINUTES,
  vineFrac,
  vineStage,
  type NongAct,
  type NongItem,
  type NongProduct,
  type NongReason,
  type NongState,
  type Pen,
  type Vine,
} from './nong';
import { remainText } from './vuonHud';

/** Tầm hiện nút quanh rào sân gà / chuồng bò (m — R-NONG-1). */
export const PEN_RANGE = 1.8;
/** Phao nhấp ngẫu nhiên trong khoảng này (s) rồi chìm [BITE_S] s (R-NONG-3). */
export const WAIT_MIN_S = 2;
export const WAIT_MAX_S = 6;
export const BITE_S = 1.2;

export interface Rect {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

/** Khoảng cách từ (x, z) tới ô [r] (trong ô = 0). */
export function rectDist(r: Rect, x: number, z: number): number {
  const dx = Math.max(r.x0 - x, 0, x - r.x1);
  const dz = Math.max(r.z0 - z, 0, z - r.z1);
  return Math.hypot(dx, dz);
}

export type FarmSpot = 'ga' | 'bo' | 'ben' | Vine;

/** Công trình đang đứng gần (R-NONG-1): trên bến → `ben`; dưới giàn → gốc bên mình; cạnh rào ≤ 1,8 m → chuồng gần hơn. */
export function farmSpotAt(
  p: { x: number; z: number },
  a: { coop: Rect; pen: Rect; pier: Rect; trellis: Rect; trellisX: number },
): FarmSpot | null {
  if (rectDist(a.pier, p.x, p.z) <= 0.3) return 'ben';
  if (rectDist(a.trellis, p.x, p.z) === 0) return p.x < a.trellisX ? 'bau' : 'dua-leo';
  const dc = rectDist(a.coop, p.x, p.z);
  const dp = rectDist(a.pen, p.x, p.z);
  if (Math.min(dc, dp) > PEN_RANGE) return null;
  return dc <= dp ? 'ga' : 'bo';
}

/** Pha câu cá ở trang (R-NONG-3). */
export type FishPhase = { kind: 'idle' } | { kind: 'wait'; left: number } | { kind: 'bite'; left: number };

/** Một bước câu: [dt] giây trôi; [rand] 0…1 cho lần chờ kế. Hết lúc chìm → về `idle` với `missed`. */
export function fishTick(f: FishPhase, dt: number): { phase: FishPhase; missed: boolean } {
  if (f.kind === 'wait') return f.left - dt <= 0 ? { phase: { kind: 'bite', left: BITE_S }, missed: false } : { phase: { kind: 'wait', left: f.left - dt }, missed: false };
  if (f.kind === 'bite') return f.left - dt <= 0 ? { phase: { kind: 'idle' }, missed: true } : { phase: { kind: 'bite', left: f.left - dt }, missed: false };
  return { phase: f, missed: false };
}

export const castPhase = (rand: number): FishPhase => ({ kind: 'wait', left: WAIT_MIN_S + rand * (WAIT_MAX_S - WAIT_MIN_S) });

/** Nút ở công trình: chữ + việc khi bấm (`act` gửi luật; `cast` / `hook` / `early` chỉ ở trang). */
export interface FarmButton {
  label: string;
  sub?: string;
  /** hình vật phẩm (Lúa = hình cây vườn) */
  item?: NongItem | 'lua';
  off?: boolean;
  hot?: boolean;
  act: NongAct | 'cast' | 'hook' | 'early' | null;
}

const PEN_TEXT: Record<Pen, { feed: string; take: string; full: string; food: NongItem | 'lua' }> = {
  ga: { feed: 'Rắc thóc', take: 'Nhặt trứng', full: 'Gà đã no · mai có trứng', food: 'lua' },
  bo: { feed: 'Cho cỏ', take: 'Lấy sữa', full: 'Bò đã no · mai có sữa', food: HAY },
};
const VINE_NAME: Record<Vine, string> = { bau: 'bầu', 'dua-leo': 'dưa leo' };

/** Nút theo trạng thái (R-NONG-2…6). [today] ngày VN, [now] ms, [fish] pha câu. */
export function farmButton(spot: FarmSpot, s: NongState, today: number, now: number, fish: FishPhase, speed = 1): FarmButton {
  if (spot === 'ga' || spot === 'bo') {
    const t = PEN_TEXT[spot];
    if (penReady(s, spot, today)) return { label: t.take, item: PEN_PRODUCT[spot], act: { act: 'take', pen: spot } };
    if (penFedToday(s, spot, today)) {
      const [a, b] = t.full.split(' · ');
      return { label: a, sub: b, item: PEN_PRODUCT[spot], off: true, act: null };
    }
    return { label: t.feed, item: t.food, act: { act: 'feed', pen: spot } };
  }
  if (spot === 'ben') {
    if (fish.kind === 'bite') return { label: 'Giật cần!', hot: true, item: 'ca-chep', act: 'hook' };
    if (fish.kind === 'wait') return { label: 'Đang chờ cá…', sub: 'đợi phao chìm', act: 'early' };
    const left = FISH_DAILY - fishToday(s, today);
    if (left <= 0) return { label: 'Hôm nay cá đã no mồi', sub: 'mai câu tiếp', item: 'ca-diec', off: true, act: null };
    return { label: 'Câu cá', sub: `còn ${left} / ${FISH_DAILY}`, item: 'ca-diec', act: 'cast' };
  }
  const st = vineStage(s, spot, now, speed);
  const name = VINE_NAME[spot];
  if (st === 'trong') return { label: `Gieo ${name}`, item: spot, act: { act: 'sow', vine: spot } };
  if (st === 'chin') return { label: `Hái ${name}`, item: spot, act: { act: 'pick', vine: spot } };
  const left = Math.max(0, (1 - vineFrac(s, spot, now, speed)) * VINE_MINUTES[spot] * 60000 / speed);
  return { label: NONG_NAMES[spot], sub: `còn ${remainText(left)}`, item: spot, off: true, act: null };
}

/** Tấm báo khi bị từ chối (R-NONG-2/4) — `null` = không báo (nút đã phản ánh). */
export function refuseToast(spot: FarmSpot, reason: NongReason): { title: string; sub: string | null; item: NongItem | 'lua' } | null {
  if (reason !== 'no-feed') return null;
  return spot === 'ga'
    ? { title: 'Cần 1 Lúa — trồng Lúa ở vườn rau', sub: 'Thu Lúa ở luống rồi quay lại rắc thóc', item: 'lua' }
    : { title: 'Cần 1 Cỏ khô — nhổ cỏ ở vườn rau', sub: 'Mỗi lần nhổ cỏ ở luống được 1 Cỏ khô', item: HAY };
}

/** Chữ nổi sau khi làm được. */
export function doneFloat(a: NongAct, got: number, item?: NongProduct): string {
  switch (a.act) {
    case 'feed':
      return a.pen === 'ga' ? '−1 Lúa' : '−1 Cỏ khô';
    case 'take':
      return `+${got} ${NONG_NAMES[PEN_PRODUCT[a.pen]]}`;
    case 'fish':
      return `+1 ${NONG_NAMES[item ?? 'ca-diec']}`;
    case 'sow':
      return 'Đã gieo';
    case 'pick':
      return `+${got} ${NONG_NAMES[a.vine]}`;
    case 'sell':
      return '';
  }
}

export const takeYield = (pen: Pen): number => PEN_YIELD[pen];

/** Hàng bán ở thùng (R-NONG-7): sản phẩm có trong kho theo thứ tự giá bảng; Cỏ khô không bán. */
export function farmStoreRows(s: NongState): { item: NongProduct; name: string; count: number; price: number }[] {
  return (Object.keys(NONG_PRICES) as NongProduct[]).filter((k) => (s.kho[k] ?? 0) > 0).map((k) => ({ item: k, name: NONG_NAMES[k], count: s.kho[k]!, price: NONG_PRICES[k] }));
}

/** Ô túi đồ ngăn Nông sản (R-NONG-8): sản phẩm + Cỏ khô theo thứ tự; số ≤ 0 bỏ. */
export function farmBagItems(kho: NongState['kho'] | null | undefined): { item: NongItem; name: string; n: number }[] {
  const order: NongItem[] = [...(Object.keys(NONG_PRICES) as NongProduct[]), HAY];
  return order.filter((k) => (kho?.[k] ?? 0) > 0).map((k) => ({ item: k, name: NONG_NAMES[k], n: Math.floor(kho![k]!) }));
}

/** Thẻ chi tiết túi đồ (R-NONG-8): giá / công dụng + từ HSK chỉ khi đã học. */
export function farmDetail(item: NongItem, learned: ReadonlySet<string>): { price: string; word: string | null } {
  const price = item === HAY ? 'Cho bò con ăn' : `bán ${NONG_PRICES[item]} / cái`;
  const w = NONG_WORDS[item];
  return { price, word: w && learned.has(w) ? w : null };
}
