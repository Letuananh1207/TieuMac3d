/**
 * Số + quy tắc vẽ của HUD vòng công cụ (thiết kế 2026-11-16.4 "Vườn rau kiểu Mole", R-VUON-2/5/10/11) — thuần, không DOM:
 * toạ độ ô trên vòng, ô "nên làm" (tối đa 1), hàng dấu trên luống (≤ 3, thứ tự sâu · cỏ · khô), đặt vòng tránh HUD + mũi chỉ.
 * Luật ô sáng / mờ ở `vuonVong.ts`; dựng DOM ở `ui/gardenRing.ts`.
 */
import type { PlotLook } from './vuonHud';
import type { RingView, SlotId } from './vuonVong';

/** Ô giữa 58, ô quanh 48, bán kính tâm–tâm 64; bán kính ngoài để đặt vòng 90 (luống hoang 33). */
export const RING_SIZES = { center: 58, slot: 48, radius: 64, outer: 90, outerWild: 33 } as const;
/** Tâm vòng lệch tâm luống quá bán kính ngoài + chừng này (px) → vẽ mũi chỉ. */
export const POINTER_SLACK = 14;
/** Khoảng cách tối thiểu tới phần HUD khác (px). */
export const HUD_GAP = 8;

/** Toạ độ màn (px) của ô có góc [at] (độ, chiều kim đồng hồ từ đỉnh) so với tâm vòng; `null` = ô giữa. */
export function slotXY(at: number | null, r: number = RING_SIZES.radius): { x: number; y: number } {
  if (at === null) return { x: 0, y: 0 };
  const a = (at * Math.PI) / 180;
  return { x: Math.round(r * Math.sin(a) * 100) / 100, y: Math.round(-r * Math.cos(a) * 100) / 100 };
}

/** Thứ tự ưu tiên ô "nên làm": Tay (chín) › Bình tưới (khô) › Bắt sâu › Nhổ cỏ › Hạt giống (trống). Phân bón không bao giờ. */
const SUGGEST: readonly SlotId[] = ['tay', 'binh', 'sau', 'co', 'hat'];

/** Ô "nên làm" (viền vàng) của vòng — tối đa 1, chỉ trong các ô sáng; luống hoang → Mở ô. */
export function suggestSlot(v: RingView): SlotId | null {
  if (v.wild) return 'mo';
  for (const id of SUGGEST) if (v.slots.some((s) => s.id === id && s.lit)) return id;
  return null;
}

/** Dấu trên luống: khô (giọt) · sâu · cỏ · bón được · chín (lấp lánh). */
export type PlotBadge = 'kho' | 'sau' | 'co' | 'bon' | 'chin';

/**
 * Hàng dấu của luống (≤ 25 m): chín đứng một mình; còn lại thứ tự **sâu · cỏ · khô**, rồi "bón được" chỉ khi vòng của luống này
 * đang mở và ô Phân bón sáng ([fertLit]); tối đa 3. [crowded] (xa / đông) → chỉ dấu đầu.
 */
export function plotBadges(look: PlotLook, ripe: boolean, fertLit = false, crowded = false): PlotBadge[] {
  if (ripe) return ['chin'];
  const out: PlotBadge[] = [];
  if (look.bug) out.push('sau');
  if (look.weeds > 0) out.push('co');
  if (look.soil === 'kho') out.push('kho');
  if (fertLit) out.push('bon');
  return out.slice(0, crowded ? 1 : 3);
}

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface RingPlace {
  x: number;
  y: number;
  /** tâm vòng lệch luống quá xa → vẽ mũi chỉ từ mép vòng tới luống */
  pointer: boolean;
}

/** Hình tròn tâm [c] bán kính [r] chạm hình chữ nhật [b]? */
function hits(c: { x: number; y: number }, r: number, b: Rect): boolean {
  const nx = Math.max(b.left, Math.min(c.x, b.right));
  const ny = Math.max(b.top, Math.min(c.y, b.bottom));
  return Math.hypot(c.x - nx, c.y - ny) < r;
}

/**
 * Đặt vòng (đặc tả "Đặt vòng"): neo [anchor] (điểm màn của tâm luống), bán kính ngoài [r]; kẹp trong [area] (safe area đã trừ
 * lề — dọc 16, ngang 55); không đè [avoid] (bản đồ nhỏ, ví, thanh công cụ, joystick, cụm nút — cách [HUD_GAP]): mỗi lần đè dịch
 * tâm quãng ngắn nhất theo trục bị chạm (ưu tiên lên trên) mà vẫn trong vùng. Lệch neo quá `r + 14` → mũi chỉ.
 */
export function ringPlace(anchor: { x: number; y: number }, r: number, area: Rect, avoid: readonly Rect[]): RingPlace {
  const clampX = (x: number): number => Math.min(Math.max(x, area.left + r), Math.max(area.left + r, area.right - r));
  const clampY = (y: number): number => Math.min(Math.max(y, area.top + r), Math.max(area.top + r, area.bottom - r));
  const c = { x: clampX(anchor.x), y: clampY(anchor.y) };
  const rr = r + HUD_GAP;
  for (let pass = 0; pass < 8; pass++) {
    const b = avoid.find((q) => hits(c, rr, q));
    if (!b) break;
    // các hướng thoát: lên (ưu tiên), xuống, trái, phải — chọn hướng ngắn nhất còn nằm trong vùng
    const moves = [
      { x: c.x, y: b.top - rr, w: 0 },
      { x: c.x, y: b.bottom + rr, w: 0.5 },
      { x: b.left - rr, y: c.y, w: 0.5 },
      { x: b.right + rr, y: c.y, w: 0.5 },
    ]
      .filter((m) => m.x === clampX(m.x) && m.y === clampY(m.y))
      .map((m) => ({ ...m, d: Math.hypot(m.x - c.x, m.y - c.y) + m.w }));
    if (!moves.length) break;
    moves.sort((a, z) => a.d - z.d);
    c.x = moves[0].x;
    c.y = moves[0].y;
  }
  return { x: c.x, y: c.y, pointer: Math.hypot(c.x - anchor.x, c.y - anchor.y) > r + POINTER_SLACK };
}
