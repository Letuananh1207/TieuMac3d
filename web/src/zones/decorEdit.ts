/**
 * Máy trạng thái trang trí tự do (R-NHA-2, R-NHA-6 — V-69): `xem` (không cầm) → `cam` (món mới lấy từ túi / món đã đặt nhấc lên) →
 * đặt / huỷ / cất; phím máy tính → việc. Thuần — không DOM, không three; chỗ hợp lệ do `decorPlace.ts` kiểm, ghép ở `homeDecor.ts`.
 */
import { decorItem, inBag, type HomeState, type PlacedDecor } from './decor';
import { rotStep, type Spot } from './decorPlace';

/** Món đang cầm: vật + chỗ đang thử; [from] = món đã đặt bị nhấc (huỷ → về đây), `null` = vừa lấy từ túi (huỷ → về túi). */
export interface Held {
  item: string;
  spot: Spot;
  from: PlacedDecor | null;
}

export interface EditState {
  home: HomeState;
  /** cảnh đang trang trí (món mới đặt vào cảnh này) */
  scene: string;
  held: Held | null;
}

export type EditAction =
  | { kind: 'take'; item: string; spot: Spot }
  | { kind: 'lift'; index: number }
  | { kind: 'move'; spot: Spot }
  | { kind: 'rotate'; delta: number }
  | { kind: 'place'; valid: boolean }
  | { kind: 'cancel' }
  | { kind: 'store' };

export interface EditResult {
  state: EditState;
  /** danh sách món đổi → lưu (`setHome`) */
  save: boolean;
  /** không làm được: `bagEmpty` (trong túi 0) · `invalid` (đặt khi đỏ) · `none` (không cầm gì / mã lạ) */
  refused?: 'bagEmpty' | 'invalid' | 'none';
  /** vừa cất vật này về túi (tấm báo "Đã cất {vật} vào túi") */
  stored?: string;
  /** Esc khi không cầm → thoát chế độ trang trí */
  exit?: boolean;
}

/** Trong túi của vật [id] khi đang trang trí: trừ món đang cầm vừa lấy từ túi (túi giảm ngay khi lấy). */
export function bagLeft(s: EditState, id: string): number {
  const held = s.held && !s.held.from && s.held.item === id ? 1 : 0;
  return Math.max(0, inBag(s.home, id) - held);
}

const done = (state: EditState, save = false): EditResult => ({ state, save });

/** Thả món đang cầm (huỷ): món nhấc về chỗ cũ, món mới về túi. */
function drop(s: EditState): EditState {
  const h = s.held;
  if (!h) return s;
  return { ...s, held: null, home: h.from ? { ...s.home, items: [...s.home.items, h.from] } : s.home };
}

/** Một bước của máy trạng thái. */
export function editStep(s: EditState, a: EditAction): EditResult {
  switch (a.kind) {
    case 'take': {
      // chọn thẻ khác khi đang cầm → món đang cầm về túi / chỗ cũ rồi cầm món mới (R-NHA-6)
      const base = drop(s);
      if (!decorItem(a.item)) return { ...done(s), refused: 'none' };
      if (bagLeft(base, a.item) <= 0) return { ...done(base), refused: 'bagEmpty' };
      return done({ ...base, held: { item: a.item, spot: a.spot, from: null } });
    }
    case 'lift': {
      const base = drop(s);
      const p = base.home.items[a.index];
      if (!p || p.scene !== s.scene) return { ...done(s), refused: 'none' };
      const items = base.home.items.filter((_, i) => i !== a.index);
      return done({ ...base, home: { ...base.home, items }, held: { item: p.item, spot: { x: p.x, z: p.z, rot: p.rot }, from: p } });
    }
    case 'move':
      return s.held ? done({ ...s, held: { ...s.held, spot: { ...a.spot, rot: s.held.spot.rot } } }) : { ...done(s), refused: 'none' };
    case 'rotate':
      return s.held ? done({ ...s, held: { ...s.held, spot: { ...s.held.spot, rot: rotStep(s.held.spot.rot, a.delta) } } }) : { ...done(s), refused: 'none' };
    case 'place': {
      const h = s.held;
      if (!h) return { ...done(s), refused: 'none' };
      if (!a.valid) return { ...done(s), refused: 'invalid' };
      const p: PlacedDecor = { item: h.item, scene: s.scene, x: h.spot.x, z: h.spot.z, rot: h.spot.rot };
      const same = h.from && h.from.x === p.x && h.from.z === p.z && h.from.rot === p.rot;
      return done({ ...s, held: null, home: { ...s.home, items: [...s.home.items, p] } }, !same);
    }
    case 'cancel':
      return s.held ? done(drop(s)) : { ...done(s), exit: true };
    case 'store': {
      const h = s.held;
      if (!h) return { ...done(s), refused: 'none' };
      // món nhấc: đã bỏ khỏi danh sách lúc nhấc → lưu; món mới: chưa từng đặt → không đổi danh sách
      return { state: { ...s, held: null }, save: !!h.from, stored: h.item };
    }
  }
}

/** Việc của một phím khi trang trí trên máy tính (R-NHA-6); phím khác → `null`. */
export type KeyVerb = 'rotL' | 'rotR' | 'rot90' | 'place' | 'cancel' | 'store';

export function keyVerb(key: string): KeyVerb | null {
  switch (key.length === 1 ? key.toLowerCase() : key) {
    case 'q':
      return 'rotL';
    case 'e':
      return 'rotR';
    case 'r':
      return 'rot90';
    case 'Enter':
      return 'place';
    case 'Escape':
      return 'cancel';
    case 'Delete':
    case 'Backspace':
      return 'store';
    default:
      return null;
  }
}

/** Góc xoay của phím: Q trái 45° (+45 — quay ngược chiều kim đồng hồ nhìn từ trên), E phải 45°, R 90°. */
export const VERB_ROT: Readonly<Partial<Record<KeyVerb, number>>> = { rotL: 45, rotR: -45, rot90: 90 };
