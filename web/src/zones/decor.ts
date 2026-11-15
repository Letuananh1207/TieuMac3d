/**
 * Nhà của ta: danh mục đồ trang trí + sở hữu **theo cái** + món đã đặt tự do (R-NHA-2, R-NHA-3, R-NHA-4 — V-69) + giá ở Tạp hoá
 * (R-TIEN-4 — **một nguồn giá**, Flutter nhận qua `openShop`; luật mua ở Dart `wallet.dart`). Thuần dữ liệu — không three, không
 * DOM. Chỗ hợp lệ: `decorPlace.ts`; thao tác: `decorEdit.ts`; lưu ở Flutter (`getHome` / `setHome`, docs/bridge.md).
 */

/** Nơi đặt của vật (2A): ngoài trời (sân / vườn) hoặc trong nhà (gian trong) — cùng chuỗi `decorArea.where` của cảnh. */
export type DecorWhere = 'ngoai' | 'trong';

export interface DecorItem {
  /** mã ASCII — Flutter lưu mã này; không đổi mã vật đã phát hành */
  id: string;
  /** tên tiếng Việt trên thẻ (không kèm chữ Hán — R-HUD-4) */
  name: string;
  where: DecorWhere;
  /** vật to chặn người đi (R-NHA-2) */
  blocks: boolean;
  /** giá ở Tạp hoá, Văn tiền (R-TIEN-4) */
  price: number;
}

const item = (id: string, name: string, where: DecorWhere, price: number, blocks = false): DecorItem => ({ id, name, where, blocks, price });

/** Danh mục 13 vật theo thứ tự hiện (R-NHA-4) + giá Tạp hoá (R-TIEN-4, thiết kế 2026-11-14.12). */
export const DECOR_ITEMS: readonly DecorItem[] = [
  item('truc-canh', 'Trúc cảnh', 'ngoai', 30),
  item('mai', 'Mai', 'ngoai', 60),
  item('tung', 'Tùng', 'ngoai', 80),
  item('da-thai-ho', 'Đá Thái Hồ', 'ngoai', 160, true),
  item('ao-sen', 'Ao sen', 'ngoai', 200, true),
  item('den-long', 'Đèn lồng', 'ngoai', 30),
  item('ban-tra', 'Bàn trà', 'ngoai', 100, true),
  item('chau-lan', 'Chậu lan', 'ngoai', 50),
  item('lu-huong', 'Lư hương', 'ngoai', 70),
  item('tranh-chu', 'Tranh chữ', 'trong', 40),
  item('ke-sach', 'Kệ sách', 'trong', 120, true),
  item('an-doc', 'Án đọc', 'trong', 90),
  item('binh-phong', 'Bình phong', 'trong', 150, true),
];

/** Vật có sẵn khi mới cài app, mỗi vật 1 cái (R-NHA-4) — trùng `starterDecor` ở Dart `wallet.dart`. */
export const STARTER_DECOR: readonly string[] = ['truc-canh', 'den-long', 'tranh-chu'];

const BY_ID = new Map(DECOR_ITEMS.map((i) => [i.id, i]));

export function decorItem(id: string): DecorItem | undefined {
  return BY_ID.get(id);
}

/** Một món đã đặt (R-NHA-2, R-NHA-3): vật, cảnh, tâm (bội 0,5 m), hướng (độ, bội 45; 0 = mặt trước nhìn +z). */
export interface PlacedDecor {
  item: string;
  scene: string;
  x: number;
  z: number;
  rot: number;
}

/** Số cái mỗi vật (đang đặt + trong túi). */
export type DecorCounts = Readonly<Record<string, number>>;

/** Nhà: món đang đặt ở mọi nơi + số cái sở hữu mỗi vật. Trong túi = sở hữu − đang đặt (tính ra, không lưu riêng). */
export interface HomeState {
  items: readonly PlacedDecor[];
  owned: DecorCounts;
}

export const STARTER_COUNTS: DecorCounts = Object.fromEntries(STARTER_DECOR.map((id) => [id, 1]));

/** Nhà mới cài app: chưa món nào (R-NHA-3), 1 cái mỗi vật khởi đầu trong túi (R-NHA-4). */
export const NEW_HOME: HomeState = { items: [], owned: STARTER_COUNTS };

/** Số món vật [id] đang đặt (mọi nơi). */
export function placedCount(items: readonly PlacedDecor[], id: string): number {
  let n = 0;
  for (const p of items) if (p.item === id) n++;
  return n;
}

/** Số cái vật [id] trong túi (≥ 0). */
export function inBag(home: HomeState, id: string): number {
  return Math.max(0, (home.owned[id] ?? 0) - placedCount(home.items, id));
}

/**
 * Số cái khi lên bản trang trí tự do (R-NHA-4) — như `migrateOwnedCounts` ở Dart: mỗi vật đã sở hữu (danh sách cũ) = 1 cái;
 * vật ở nhiều ô cũ → số ô; chưa có danh sách (bản trước Văn tiền) → 3 vật khởi đầu + vật đang đặt theo số ô.
 */
export function migrateOwnedCounts(oldOwned: readonly string[] | null, oldPlaced: Iterable<string>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of oldOwned ?? STARTER_DECOR) out[id] = 1;
  const per: Record<string, number> = {};
  for (const id of oldPlaced) if (id) per[id] = (per[id] ?? 0) + 1;
  for (const [id, n] of Object.entries(per)) if (n > (out[id] ?? 0)) out[id] = n;
  return out;
}

/** Trạng thái thẻ trong túi đồ trang trí (thiết kế 2026-11-15.42): có trong túi · đặt hết · chưa có (khoá). */
export type BagCardState = 'bag' | 'soldOut' | 'locked';

export interface BagCard {
  item: DecorItem;
  inBag: number;
  placed: number;
  state: BagCardState;
}

/**
 * Túi đồ trang trí của một nơi (R-NHA-4): mọi vật hợp nơi; có trong túi trước (thứ tự danh mục), còn lại sau (rẻ → đắt). [held] =
 * vật đang cầm (đã lấy khỏi túi / đã nhấc — trong túi trừ 1, đang đặt trừ 1 nếu nhấc).
 */
export function bagCards(home: HomeState, where: DecorWhere, held?: { item: string; lifted: boolean } | null): BagCard[] {
  const cards = DECOR_ITEMS.filter((i) => i.where === where).map((it) => {
    const placed = placedCount(home.items, it.id) + (held?.lifted && held.item === it.id ? 1 : 0);
    const bag = Math.max(0, (home.owned[it.id] ?? 0) - placed - (held && !held.lifted && held.item === it.id ? 1 : 0));
    const state: BagCardState = bag > 0 ? 'bag' : placed > 0 || (held?.item === it.id) ? 'soldOut' : 'locked';
    return { item: it, inBag: bag, placed, state };
  });
  return [...cards.filter((c) => c.state === 'bag'), ...cards.filter((c) => c.state !== 'bag').sort((a, b) => a.item.price - b.item.price)];
}

const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Góc về 0 … 315, bước 45. */
export function normRot(r: number): number {
  return ((Math.round(r / 45) * 45) % 360 + 360) % 360;
}

/** Một món đọc từ dữ liệu đã lưu; vật lạ / sai dạng → `null`. */
export function parsePlaced(v: unknown): PlacedDecor | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.item !== 'string' || !decorItem(o.item) || typeof o.scene !== 'string' || !o.scene) return null;
  if (!finite(o.x) || !finite(o.z) || !finite(o.rot)) return null;
  return { item: o.item, scene: o.scene, x: o.x, z: o.z, rot: normRot(o.rot) };
}

/** Số cái đọc từ dữ liệu: đối tượng `{mã: n}` → giữ số nguyên > 0 của vật trong danh mục; mảng (bản cũ) → 1 cái mỗi mã. */
function parseCounts(v: unknown, legacyPlaced: readonly string[]): Record<string, number> | null {
  if (Array.isArray(v)) return migrateOwnedCounts(v.filter((id): id is string => typeof id === 'string' && !!decorItem(id)), legacyPlaced);
  if (!v || typeof v !== 'object') return null;
  const out: Record<string, number> = {};
  for (const [id, n] of Object.entries(v as Record<string, unknown>)) if (decorItem(id) && finite(n) && n >= 1) out[id] = Math.floor(n);
  return out;
}

/** Nhà đã làm sạch + ô cũ chưa chuyển (`placed` của bản có ô — `decorLegacy.ts` chuyển). */
export interface CleanHome extends HomeState {
  legacy: Readonly<Record<string, string>>;
}

/**
 * Nhà đã lưu (từ Flutter / ví thử, có thể của bản cũ) → nhà dùng được (R-NHA-3, R-NHA-4): bỏ vật lạ, món sai dạng; số món mỗi vật
 * không vượt số cái (thừa → bỏ, coi như trong túi); `owned` mảng (bản cũ) → mỗi mã 1 cái (vật ở nhiều ô → số ô); thiếu → vật khởi
 * đầu + vật đang đặt. Dữ liệu hỏng → nhà mới.
 */
export function cleanHome(raw: unknown): CleanHome {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const legacy: Record<string, string> = {};
  if (!Array.isArray(o.items) && o.placed && typeof o.placed === 'object') {
    for (const [slot, id] of Object.entries(o.placed as Record<string, unknown>)) if (typeof id === 'string' && decorItem(id)) legacy[slot] = id;
  }
  const owned = parseCounts(o.owned, Object.values(legacy)) ?? migrateOwnedCounts(null, Object.values(legacy));
  const items: PlacedDecor[] = [];
  if (Array.isArray(o.items)) {
    for (const v of o.items) {
      const p = parsePlaced(v);
      if (p && placedCount(items, p.item) < (owned[p.item] ?? 0)) items.push(p);
    }
  }
  return { items, owned, legacy };
}
