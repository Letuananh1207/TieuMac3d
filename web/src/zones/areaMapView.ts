/**
 * Bản đồ vùng — toán hiển thị + trạng thái (R-BANDO-1, 3, 4, 5; R-DIEU-1). Thuần — không three, không DOM; HUD
 * (`ui/`, chờ thiết kế) chỉ đổi `transform` theo số ở đây, không vẽ lại.
 *
 * Quy ước góc: hướng trong cảnh đo như `rotation.y` của three — θ nhìn về (sin θ, cos θ) trên (x, z); 0 = +z (nam),
 * π = −z (bắc). Trên bản đồ: x → phải, z → xuống (bắc ở trên). Góc trên màn: radian, 0 = chỉ lên, dương = theo kim đồng hồ
 * (như CSS `rotate`).
 */
import { inRect, footprint, type AreaMap, type Bounds, type IconKind, type MapLabel } from './areaMap';

/** Bản đồ nhỏ thấy quanh mình bao nhiêu mét, ở mọi cảnh (R-BANDO-3). */
export const MINI_RADIUS = 30;
/** Chân cao hơn mặt đất ngoài trời từ mức này (m) = tầng 2 (R-BANDO-4). */
export const UPPER_FLOOR_MIN = 2;
/** Biểu tượng ngoài tầm có dấu ở mép bản đồ nhỏ (R-BANDO-3). */
export const EDGE_KINDS: readonly IconKind[] = ['vong-tran', 'cong-canh'];
/** Biểu tượng cách mình quá [MINI_RADIUS] − chừng này (m) → dấu mép, không để vành cắt (thiết kế 2026-11-14.20). */
export const EDGE_MARGIN = 2;

const TAU = Math.PI * 2;
const norm = (a: number): number => {
  const r = a % TAU;
  return r < 0 ? r + TAU : r;
};

/** Toạ độ cảnh → điểm trên tấm bản đồ (px), `scale` px / m, gốc ở góc tây bắc của khung. */
export function toMap(b: Bounds, scale: number, x: number, z: number): { x: number; y: number } {
  return { x: (x - b.minX) * scale, y: (z - b.minZ) * scale };
}

/** Tỉ lệ để cả cảnh vừa khung `w` × `h` px (bản đồ lớn, bắc lên trên). */
export function fitScale(b: Bounds, w: number, h: number): number {
  return Math.min(w / (b.maxX - b.minX), h / (b.maxZ - b.minZ));
}

/**
 * Góc xoay tấm bản đồ nhỏ (R-BANDO-3: xoay theo camera — hướng camera nhìn ở phía trên). `view` = hướng camera nhìn
 * (main: `orbit.yaw + π`, cùng hướng nhân vật quay lưng về camera). Dấu 北 trên viền xoay cùng góc này.
 */
export function miniRotation(view: number): number {
  return norm(view + Math.PI);
}

/** Góc mũi tên "mình" trên bản đồ nhỏ: `facing` = hướng nhân vật quay mặt. Cùng hướng camera → chỉ lên. */
export function miniArrow(facing: number, view: number): number {
  return norm(view - facing);
}

/** Góc mũi tên trên bản đồ lớn (bắc lên trên). */
export function bigArrow(facing: number): number {
  return norm(Math.PI - facing);
}

/** Điểm cảnh (x, z) trên bản đồ nhỏ: tính từ tâm vòng, đơn vị = bán kính vòng (1 = mép). */
export function miniPoint(player: { x: number; z: number }, view: number, x: number, z: number): { x: number; y: number } {
  const dx = (x - player.x) / MINI_RADIUS;
  const dy = (z - player.z) / MINI_RADIUS;
  const a = miniRotation(view);
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = (v: number): number => Math.round(v * 1e6) / 1e6;
  return { x: r(dx * c - dy * s), y: r(dx * s + dy * c) };
}

export interface EdgeMark {
  kind: IconKind;
  scene?: string;
  /** góc trên màn từ tâm vòng (0 = lên, theo kim đồng hồ) */
  angle: number;
  /** khoảng cách thật (m) */
  dist: number;
}

/** Vòng trận / cổng sang cảnh ở ngoài [MINI_RADIUS] → dấu ở mép, chỉ về phía đó (R-BANDO-3). */
export function edgeMarks(map: AreaMap, player: { x: number; z: number }, view: number, inner = MINI_RADIUS - EDGE_MARGIN): EdgeMark[] {
  const out: EdgeMark[] = [];
  for (const i of map.icons) {
    if (!EDGE_KINDS.includes(i.kind)) continue;
    const dist = Math.hypot(i.x - player.x, i.z - player.z);
    if (dist <= inner) continue;
    const p = miniPoint(player, view, i.x, i.z);
    out.push({ kind: i.kind, ...(i.scene ? { scene: i.scene } : {}), angle: norm(Math.atan2(p.x, -p.y)), dist });
  }
  return out;
}

/** Nhà đang đứng trong + tầng (R-BANDO-4). `aboveGround` = chân nhân vật cao hơn mặt đất ngoài trời bao nhiêu m. */
export function whereAmI(map: AreaMap, x: number, z: number, aboveGround = 0): { building: string | null; floor: number } {
  for (const s of map.shapes) {
    if (s.kind === 'nha' && inRect(footprint(s), x, z)) return { building: s.id, floor: aboveGround >= UPPER_FLOOR_MIN ? 2 : 1 };
  }
  return { building: null, floor: 1 };
}

export interface PlacedLabel {
  label: MapLabel;
  x: number;
  y: number;
}

/**
 * Bỏ nhãn chồng nhau (R-BANDO-2): giữ theo ưu tiên khu > nơi đến cổng > nhà > chỗ, cùng cấp thì theo thứ tự trong
 * bản đồ. `place` = tâm nhãn trên màn (px); `measure` = cỡ hộp chữ (px) do HUD đo.
 */
export function fitLabels(
  labels: readonly MapLabel[],
  place: (l: MapLabel) => { x: number; y: number },
  measure: (l: MapLabel) => { w: number; h: number },
  priority: (l: MapLabel) => number,
): PlacedLabel[] {
  const order = labels.map((l, i) => ({ l, i })).sort((a, b) => priority(a.l) - priority(b.l) || a.i - b.i);
  const kept: { p: PlacedLabel; w: number; h: number }[] = [];
  for (const { l } of order) {
    const at = place(l);
    const m = measure(l);
    const hit = kept.some((k) => Math.abs(k.p.x - at.x) * 2 < k.w + m.w && Math.abs(k.p.y - at.y) * 2 < k.h + m.h);
    if (!hit) kept.push({ p: { label: l, x: at.x, y: at.y }, w: m.w, h: m.h });
  }
  return kept.map((k) => k.p);
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const overlaps = (a: Box, b: Box): boolean => Math.abs(a.x - b.x) * 2 < a.w + b.w && Math.abs(a.y - b.y) * 2 < a.h + b.h;

/**
 * Đặt chữ bản đồ lớn (thiết kế 2026-11-14.20): xét theo `priority` tăng dần; mỗi chữ thử lần lượt các chỗ trong
 * `spots` (tâm hộp, px) — chỗ đầu không đè biểu tượng (`blocks`) / chữ đã đặt thì lấy; không chỗ nào → bỏ chữ.
 */
export function placeLabels<T>(
  items: readonly { item: T; priority: number; w: number; h: number; spots: readonly { x: number; y: number }[]; keep?: boolean }[],
  blocks: readonly Box[],
): { item: T; x: number; y: number }[] {
  const order = items.map((it, i) => ({ it, i })).sort((a, b) => a.it.priority - b.it.priority || a.i - b.i);
  const taken: Box[] = [];
  const out: { item: T; x: number; y: number }[] = [];
  for (const { it } of order) {
    const free = it.spots.find((s) => {
      const box = { x: s.x, y: s.y, w: it.w, h: it.h };
      return !blocks.some((b) => overlaps(b, box)) && !taken.some((b) => overlaps(b, box));
    });
    // `keep` (tên khu — cấp cao nhất): không chỗ nào trống vẫn đặt ở chỗ không đè chữ đã đặt, hoặc chỗ đầu
    const s = free ?? (it.keep ? (it.spots.find((q) => !taken.some((b) => overlaps(b, { x: q.x, y: q.y, w: it.w, h: it.h }))) ?? it.spots[0]) : undefined);
    if (!s) continue;
    taken.push({ x: s.x, y: s.y, w: it.w, h: it.h });
    out.push({ item: it.item, x: s.x, y: s.y });
  }
  return out;
}

/** Trạng thái màn — bản đồ nhỏ ẩn khi một cờ bật (R-BANDO-1). */
export interface MapBusy {
  loading?: boolean;
  /** bản đồ truyền tống */
  travelMap?: boolean;
  bigMap?: boolean;
  /** bài học / màn Flutter / bảng phủ cảnh */
  covered?: boolean;
  talking?: boolean;
  gameTable?: boolean;
  /** ngồi ghế, bàn trà, thiền, Ngồi ôn, bồ đoàn */
  sitting?: boolean;
  chatTyping?: boolean;
  decorating?: boolean;
}

/** Bản đồ nhỏ có hiện không (R-BANDO-1). */
export function miniMapShown(s: MapBusy): boolean {
  return !(s.loading || s.travelMap || s.bigMap || s.covered || s.talking || s.gameTable || s.sitting || s.chatTyping || s.decorating);
}

/** Điểm chạm (px) trúng bản đồ nhỏ tròn tâm (cx, cy) bán kính r → mở bản đồ lớn, không thành joystick (R-DIEU-1). */
export function hitsMiniMap(px: number, py: number, circle: { cx: number; cy: number; r: number }): boolean {
  return Math.hypot(px - circle.cx, py - circle.cy) <= circle.r;
}

/** Mở / đóng bản đồ lớn (R-BANDO-5). Đang mở: nhân vật đứng yên (`freezes`). */
export class BigMapState {
  private on = false;

  get open(): boolean {
    return this.on;
  }

  /** nhân vật đứng yên, joystick + cụm nút ẩn, kéo màn không xoay camera */
  get freezes(): boolean {
    return this.on;
  }

  /** Chạm bản đồ nhỏ / phím M khi đang đóng: chỉ mở được khi bản đồ nhỏ đang hiện. Phím M khi đang mở → đóng. */
  toggle(busy: MapBusy): boolean {
    if (this.on) this.on = false;
    else if (miniMapShown({ ...busy, bigMap: false })) this.on = true;
    return this.on;
  }

  /** Nút "Đóng" / Esc / nút quay lại của máy: `true` = đã đóng bản đồ (nút quay lại không thoát app). */
  back(): boolean {
    if (!this.on) return false;
    this.on = false;
    return true;
  }

  /** Mỗi khung: bản đồ truyền tống / màn tải chen vào → đóng. */
  update(busy: MapBusy): void {
    if (this.on && (busy.travelMap || busy.loading)) this.on = false;
  }
}
