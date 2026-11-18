/**
 * Toán chỗ đặt đồ trang trí tự do (R-NHA-7, R-NHA-2 — V-69): lưới 0,5 m, xoay bước 45°, chân món theo hướng (chữ nhật xoay), kiểm chỗ
 * hợp lệ (vùng đặt, vùng cấm, vật của cảnh, món khác, dốc, trần món, còn đường đi), tìm chỗ hợp lệ gần nhất. Thuần — không three,
 * không DOM. Vùng đặt dựng từ đặc tả cảnh ở `scene/decorArea.ts` (cùng dạng `PlaceArea`), ghép ở lớp gốc.
 */
import type { Box, Circle } from '../collision/colliders';
import { boxRect, pointInPolygon, pointInRect, rectCircleOverlap, rectInPolygon, rectsOverlap, type Rect, type XZ } from '../collision/footprint';
import { decorItem, type DecorWhere, type PlacedDecor } from './decor';

/** Bước lưới (m) và bước xoay (độ). */
export const GRID = 0.5;
export const ROT_STEP = 45;

/** Bán kính người khi tìm đường (m) — nhỏ hơn bán kính va chạm 0,5 một chút để khe 1,6 m (cổng vườn) vẫn qua. */
const WALKER_R = 0.4;

/** Toạ độ về lưới 0,5 m. */
export function snap(v: number): number {
  return Math.round(v / GRID) * GRID + 0; // + 0: bỏ −0
}

/** Xoay [rot] thêm [delta] độ, kết quả 0 … 315 bước 45. */
export function rotStep(rot: number, delta: number): number {
  return ((Math.round((rot + delta) / ROT_STEP) * ROT_STEP) % 360 + 360) % 360;
}

/** Khung chân một vật (m, khi quay 0): rộng w theo x, sâu d theo z; `round` = chân tròn đường kính w. */
export interface DecorShape {
  w: number;
  d: number;
  round?: boolean;
}

/** Chỗ của món: tâm + hướng. */
export interface Spot {
  x: number;
  z: number;
  rot: number;
}

/** Vùng cấm: chữ nhật (có thể xoay) hoặc tròn, kèm lý do hiện khi đỏ ("Lối đi", "Cửa nhà", …). */
export interface KeepOut {
  label: string;
  rect?: Rect;
  circle?: Circle;
}

/** Một đích phải còn đường đi tới (R-NHA-7): tới được một ô cách [at] ≤ [r] m. */
export interface PathGoal {
  at: XZ;
  r: number;
}

/** Vùng đặt của một cảnh (dựng từ `decorArea` của đặc tả — `scene/decorArea.ts`). */
export interface PlaceArea {
  scene: string;
  where: DecorWhere;
  /** đa giác cho phép */
  bounds: readonly XZ[];
  keepOut: readonly KeepOut[];
  maxItems: number;
  maxSlope: number;
  /** vật cản tĩnh của cảnh (nhà, rào, cây, lan can) — không gồm món trang trí */
  boxes: readonly Box[];
  circles: readonly Circle[];
  /** chỗ xuất phát + các đích phải còn lối (gian trong: thảm cửa) */
  start: XZ;
  goals: readonly PathGoal[];
  /** độ cao nền (dốc); thiếu = phẳng */
  heightAt?: (x: number, z: number) => number;
}

/** Vì sao không đặt được (R-NHA-7). */
export type Problem = 'het' | 'saiNoi' | 'ngoaiVung' | 'vungCam' | 'vatCanh' | 'deVat' | 'doc' | 'chanLoi';

export type SpotCheck = { ok: true } | { ok: false; problem: Problem; label: string };

/** Chân món theo hướng: tròn → hình vuông w × w (không đổi khi xoay); còn lại chữ nhật xoay đúng góc. */
export function footprint(shape: DecorShape, spot: Spot): Rect {
  return { x: spot.x, z: spot.z, w: shape.w, d: shape.round ? shape.w : shape.d, rot: shape.round ? 0 : spot.rot };
}

/** Lý do bằng chữ (`decorReason*` — design/l10n/vi.arb). */
export function problemLabel(p: Problem, area: Pick<PlaceArea, 'maxItems'>, keep?: string): string {
  switch (p) {
    case 'het':
      return `Đã đủ ${area.maxItems} món`;
    case 'vungCam':
      return keep ?? 'Lối đi';
    case 'vatCanh':
    case 'deVat':
      return 'Đè vật khác';
    case 'doc':
      return 'Dốc quá';
    case 'chanLoi':
      return 'Chắn lối';
    default:
      return 'Ngoài chỗ đặt';
  }
}

const fail = (area: PlaceArea, problem: Problem, keep?: string): SpotCheck => ({ ok: false, problem, label: problemLabel(problem, area, keep) });

/** Chân món đè vật cản tĩnh của cảnh (hộp chặn ở mặt đất / tròn). */
function hitsScene(area: PlaceArea, r: Rect): boolean {
  for (const b of area.boxes) {
    if (b.minY !== undefined && b.minY > 0.5) continue; // hộp tầng trên (lan can tầng 2) không đè đồ dưới đất
    if (rectsOverlap(r, boxRect(b))) return true;
  }
  return area.circles.some((c) => rectCircleOverlap(r, c));
}

function hitsKeep(k: KeepOut, r: Rect): boolean {
  if (k.rect) return rectsOverlap(r, k.rect);
  return !!k.circle && rectCircleOverlap(r, k.circle);
}

/** Độ chênh cao trong chân món (5 điểm: 4 góc + tâm). */
function slopeOf(area: PlaceArea, r: Rect): number {
  const h = area.heightAt;
  if (!h) return 0;
  const hw = r.w / 2;
  const hd = r.d / 2;
  const ys = [h(r.x, r.z), h(r.x - hw, r.z - hd), h(r.x + hw, r.z - hd), h(r.x + hw, r.z + hd), h(r.x - hw, r.z + hd)];
  return Math.max(...ys) - Math.min(...ys);
}

/**
 * Kiểm chỗ cho món [itemId] ở [spot] (R-NHA-7). [others] = món khác **trong cùng cảnh** (không gồm món đang cầm). [shapeOf] = chân
 * từng vật. Thứ tự lý do: trần → sai nơi → ngoài vùng → vùng cấm → vật cảnh → đè món → dốc → chắn lối (đắt nhất, cuối).
 */
export function checkSpot(area: PlaceArea, others: readonly PlacedDecor[], shapeOf: (id: string) => DecorShape | undefined, itemId: string, spot: Spot): SpotCheck {
  const it = decorItem(itemId);
  const shape = shapeOf(itemId);
  if (others.length >= area.maxItems) return fail(area, 'het');
  if (!it || !shape || it.where !== area.where) return fail(area, 'saiNoi');
  const r = footprint(shape, spot);
  if (!rectInPolygon(r, area.bounds)) return fail(area, 'ngoaiVung');
  const k = area.keepOut.find((kk) => hitsKeep(kk, r));
  if (k) return fail(area, 'vungCam', k.label);
  if (hitsScene(area, r)) return fail(area, 'vatCanh');
  for (const o of others) {
    const os = shapeOf(o.item);
    if (os && rectsOverlap(r, footprint(os, o))) return fail(area, 'deVat');
  }
  if (slopeOf(area, r) > area.maxSlope) return fail(area, 'doc');
  if (it.blocks) {
    const blockers = blockingRects(others, shapeOf);
    blockers.push(r);
    if (!pathOpen(area, blockers)) return fail(area, 'chanLoi');
  }
  return { ok: true };
}

/** Chân các món to (chặn người — R-NHA-2). */
export function blockingRects(items: readonly PlacedDecor[], shapeOf: (id: string) => DecorShape | undefined): Rect[] {
  const out: Rect[] = [];
  for (const o of items) {
    const s = shapeOf(o.item);
    if (s && decorItem(o.item)?.blocks) out.push(footprint(s, o));
  }
  return out;
}

/** Chỗ hợp lệ gần [spot] nhất trong [radius] m (xoắn ốc trên lưới, cùng hướng); không có → `null`. */
export function nearestValid(area: PlaceArea, others: readonly PlacedDecor[], shapeOf: (id: string) => DecorShape | undefined, itemId: string, spot: Spot, radius = 1.5): Spot | null {
  const cx = snap(spot.x);
  const cz = snap(spot.z);
  const n = Math.ceil(radius / GRID);
  const offs: [number, number][] = [];
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) if (Math.hypot(i, j) * GRID <= radius + 1e-9) offs.push([i, j]);
  offs.sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1]) || a[1] - b[1] || a[0] - b[0]);
  for (const [i, j] of offs) {
    const s = { x: snap(cx + i * GRID), z: snap(cz + j * GRID), rot: spot.rot };
    if (checkSpot(area, others, shapeOf, itemId, s).ok) return s;
  }
  return null;
}

/* ---------- còn đường đi (3B) ---------- */

interface Grid {
  x0: number;
  z0: number;
  nx: number;
  nz: number;
  /** ô đi được khi chưa có món nào */
  free: Uint8Array;
  /** đích tới được khi chưa có món nào (đích không tới được từ đầu thì không đòi) */
  goals: readonly PathGoal[];
  start: number;
}

const GRIDS = new WeakMap<PlaceArea, Grid>();

function walkRegion(area: PlaceArea, x: number, z: number): boolean {
  if (pointInPolygon(area.bounds, x, z)) return true;
  // lối đi / bến / cửa là vùng cấm đặt nhưng người đi được
  return area.keepOut.some((k) => (k.rect ? pointInRect(k.rect, x, z) : !!k.circle && Math.hypot(x - k.circle.x, z - k.circle.z) <= k.circle.r));
}

function blockedByScene(area: PlaceArea, x: number, z: number): boolean {
  for (const b of area.boxes) {
    if (b.minY !== undefined && b.minY > 0.5) continue;
    const cx = Math.max(b.minX, Math.min(x, b.maxX));
    const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
    if (Math.hypot(x - cx, z - cz) < WALKER_R) return true;
  }
  return area.circles.some((c) => Math.hypot(x - c.x, z - c.z) < c.r + WALKER_R);
}

function bfs(g: Grid, blocked: (i: number) => boolean): Uint8Array {
  const seen = new Uint8Array(g.nx * g.nz);
  if (g.start < 0 || blocked(g.start)) return seen;
  const q = new Int32Array(g.nx * g.nz);
  let head = 0;
  let tail = 0;
  q[tail++] = g.start;
  seen[g.start] = 1;
  while (head < tail) {
    const c = q[head++];
    const ci = c % g.nx;
    const cj = (c - ci) / g.nx;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const i = ci + di;
      const j = cj + dj;
      if (i < 0 || j < 0 || i >= g.nx || j >= g.nz) continue;
      const k = j * g.nx + i;
      if (seen[k] || !g.free[k] || blocked(k)) continue;
      seen[k] = 1;
      q[tail++] = k;
    }
  }
  return seen;
}

function reached(g: Grid, seen: Uint8Array, goal: PathGoal): boolean {
  const n = Math.ceil(goal.r / GRID);
  const gi = Math.round((goal.at[0] - g.x0) / GRID);
  const gj = Math.round((goal.at[1] - g.z0) / GRID);
  for (let j = gj - n; j <= gj + n; j++) {
    for (let i = gi - n; i <= gi + n; i++) {
      if (i < 0 || j < 0 || i >= g.nx || j >= g.nz) continue;
      if (seen[j * g.nx + i] && Math.hypot(g.x0 + i * GRID - goal.at[0], g.z0 + j * GRID - goal.at[1]) <= goal.r + 1e-9) return true;
    }
  }
  return false;
}

/** Lưới đi lại tĩnh của vùng (dựng một lần, nhớ theo vùng). */
function gridOf(area: PlaceArea): Grid {
  const cached = GRIDS.get(area);
  if (cached) return cached;
  const xs = [...area.bounds.map((p) => p[0]), area.start[0], ...area.goals.map((g) => g.at[0])];
  const zs = [...area.bounds.map((p) => p[1]), area.start[1], ...area.goals.map((g) => g.at[1])];
  for (const k of area.keepOut) {
    if (!k.rect) continue;
    const e = Math.hypot(k.rect.w, k.rect.d) / 2;
    xs.push(k.rect.x - e, k.rect.x + e);
    zs.push(k.rect.z - e, k.rect.z + e);
  }
  const x0 = snap(Math.min(...xs) - 1);
  const z0 = snap(Math.min(...zs) - 1);
  const nx = Math.round((Math.max(...xs) + 1 - x0) / GRID) + 1;
  const nz = Math.round((Math.max(...zs) + 1 - z0) / GRID) + 1;
  const free = new Uint8Array(nx * nz);
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const x = x0 + i * GRID;
      const z = z0 + j * GRID;
      free[j * nx + i] = walkRegion(area, x, z) && !blockedByScene(area, x, z) ? 1 : 0;
    }
  }
  // ô xuất phát: ô đi được gần chỗ xuất phát nhất
  let start = -1;
  let best = Infinity;
  for (let k = 0; k < free.length; k++) {
    if (!free[k]) continue;
    const i = k % nx;
    const d = Math.hypot(x0 + i * GRID - area.start[0], z0 + ((k - i) / nx) * GRID - area.start[1]);
    if (d < best) [best, start] = [d, k];
  }
  const base: Grid = { x0, z0, nx, nz, free, goals: [], start: best <= 1.5 ? start : -1 };
  const seen = bfs(base, () => false);
  const g: Grid = { ...base, goals: area.goals.filter((goal) => reached(base, seen, goal)) };
  GRIDS.set(area, g);
  return g;
}

/** Còn đường đi từ chỗ xuất phát tới mọi đích (đích vốn tới được) khi có các chân món to [blockers]. */
export function pathOpen(area: PlaceArea, blockers: readonly Rect[]): boolean {
  const g = gridOf(area);
  if (g.goals.length === 0) return true;
  const blocked = new Uint8Array(g.nx * g.nz);
  for (const r of blockers) {
    const e = Math.hypot(r.w, r.d) / 2 + WALKER_R;
    const i0 = Math.max(0, Math.floor((r.x - e - g.x0) / GRID));
    const i1 = Math.min(g.nx - 1, Math.ceil((r.x + e - g.x0) / GRID));
    const j0 = Math.max(0, Math.floor((r.z - e - g.z0) / GRID));
    const j1 = Math.min(g.nz - 1, Math.ceil((r.z + e - g.z0) / GRID));
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) if (rectCircleOverlap(r, { x: g.x0 + i * GRID, z: g.z0 + j * GRID, r: WALKER_R })) blocked[j * g.nx + i] = 1;
    }
  }
  const seen = bfs(g, (k) => blocked[k] === 1);
  return g.goals.every((goal) => reached(g, seen, goal));
}

/** Món nay không hợp lệ khi vào cảnh (R-NHA-3) dời xa nhất bấy nhiêu mét tìm chỗ trống (đủ ra khỏi chân nhà chính 10,5 × 6 — V-82). */
export const RELOCATE_RADIUS = 8;

/**
 * Xếp lại món của một cảnh khi vào cảnh (R-NHA-3): lần lượt giữ món hợp lệ; món nay không hợp lệ (cảnh đổi bố cục — V-82; ô cũ) → dời
 * tới chỗ hợp lệ gần nhất trong [radius] m (mặc định `RELOCATE_RADIUS`); không có → về túi (bỏ khỏi danh sách). Món cảnh khác giữ
 * nguyên. `changed` = phải lưu lại.
 */
export function settleScene(
  area: PlaceArea,
  items: readonly PlacedDecor[],
  shapeOf: (id: string) => DecorShape | undefined,
  radius = RELOCATE_RADIUS,
): { items: PlacedDecor[]; changed: boolean } {
  const kept: PlacedDecor[] = [];
  const here: PlacedDecor[] = [];
  let changed = false;
  for (const p of items) {
    if (p.scene !== area.scene) {
      kept.push(p);
      continue;
    }
    const spot = { x: snap(p.x), z: snap(p.z), rot: p.rot };
    const s = checkSpot(area, here, shapeOf, p.item, spot).ok ? spot : nearestValid(area, here, shapeOf, p.item, spot, radius);
    if (!s) {
      changed = true;
      continue;
    }
    if (s.x !== p.x || s.z !== p.z) changed = true;
    const placed = { ...p, ...s };
    here.push(placed);
    kept.push(placed);
  }
  return { items: kept, changed };
}
