/**
 * Tìm đường trên lưới vuông (tiểu nhị mang trà — R-TRA-1): A* 8 hướng trên các ô cách nhau `cell` m, không cắt góc ô cấm,
 * rồi rút gọn (bỏ điểm giữa khi hai đầu "nhìn thấy nhau" qua ô đi được). Thuần — chỉ nhận hàm "chỗ này đi được không";
 * nơi gọi tự quyết vật cản + khoảng cách an toàn. Chạy một lần mỗi chỗ ngồi rồi nhớ, không chạy mỗi khung.
 */

export type XZ = readonly [number, number];

export interface GridBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/** Điểm đầu / cuối nằm trong ô cấm → tìm ô đi được gần nhất trong bán kính này (số ô). */
const NUDGE_CELLS = 6;
const SQRT2 = Math.SQRT2;

/** Đoạn a → b có qua toàn ô đi được không (lấy mẫu mỗi `step` m, không xét hai đầu). */
export function segmentClear(a: XZ, b: XZ, walkable: (x: number, z: number) => boolean, step = 0.1): boolean {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.ceil(len / step);
  for (let k = 1; k < n; k++) {
    const t = k / n;
    if (!walkable(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)) return false;
  }
  return true;
}

/** Bỏ điểm giữa thừa: từ mỗi điểm giữ, nhảy tới điểm xa nhất còn thấy được. Giữ điểm đầu, điểm cuối. */
export function simplify(points: readonly XZ[], walkable: (x: number, z: number) => boolean): XZ[] {
  if (points.length <= 2) return [...points];
  const out: XZ[] = [points[0]];
  let i = 0;
  while (i < points.length - 1) {
    let j = points.length - 1;
    while (j > i + 1 && !segmentClear(points[i], points[j], walkable)) j--;
    out.push(points[j]);
    i = j;
  }
  return out;
}

/** Hàng đợi ưu tiên nhỏ nhất (đống nhị phân) theo `f`. */
class Heap {
  private readonly items: number[] = [];
  constructor(private readonly f: Float64Array) {}
  get size(): number {
    return this.items.length;
  }
  push(v: number): void {
    const a = this.items;
    a.push(v);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.f[a[p]] <= this.f[a[i]]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop(): number {
    const a = this.items;
    const top = a[0];
    const last = a.pop()!;
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && this.f[a[l]] < this.f[a[m]]) m = l;
        if (r < a.length && this.f[a[r]] < this.f[a[m]]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

/**
 * Đường từ `from` tới `to` (đã rút gọn), điểm đầu / cuối đúng như cho; không có đường → `null`. Điểm đầu / cuối nằm trong ô
 * cấm (sát mép vật) → nối qua ô đi được gần nhất (trong `NUDGE_CELLS` ô).
 */
export function findPath(from: XZ, to: XZ, walkable: (x: number, z: number) => boolean, bounds: GridBounds, cell = 0.25): XZ[] | null {
  const nx = Math.floor((bounds.maxX - bounds.minX) / cell) + 1;
  const nz = Math.floor((bounds.maxZ - bounds.minZ) / cell) + 1;
  const cx = (i: number): number => bounds.minX + i * cell;
  const cz = (j: number): number => bounds.minZ + j * cell;
  const free = new Uint8Array(nx * nz);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) free[j * nx + i] = walkable(cx(i), cz(j)) ? 1 : 0;
  const ok = (i: number, j: number): boolean => i >= 0 && j >= 0 && i < nx && j < nz && free[j * nx + i] === 1;

  /** ô đi được gần điểm p nhất (ưu tiên ô chứa p) */
  const snap = (p: XZ): number | null => {
    const i0 = Math.round((p[0] - bounds.minX) / cell);
    const j0 = Math.round((p[1] - bounds.minZ) / cell);
    let best: number | null = null;
    let bestD = Infinity;
    for (let dj = -NUDGE_CELLS; dj <= NUDGE_CELLS; dj++)
      for (let di = -NUDGE_CELLS; di <= NUDGE_CELLS; di++) {
        const i = i0 + di;
        const j = j0 + dj;
        if (!ok(i, j)) continue;
        const d = Math.hypot(cx(i) - p[0], cz(j) - p[1]);
        if (d < bestD) {
          bestD = d;
          best = j * nx + i;
        }
      }
    return best;
  };
  const s = snap(from);
  const t = snap(to);
  if (s === null || t === null) return null;

  const ti = t % nx;
  const tj = Math.floor(t / nx);
  const h = (n: number): number => {
    const dx = Math.abs((n % nx) - ti);
    const dz = Math.abs(Math.floor(n / nx) - tj);
    return Math.max(dx, dz) + (SQRT2 - 1) * Math.min(dx, dz);
  };
  const g = new Float64Array(nx * nz).fill(Infinity);
  const f = new Float64Array(nx * nz).fill(Infinity);
  const came = new Int32Array(nx * nz).fill(-1);
  const closed = new Uint8Array(nx * nz);
  const open = new Heap(f);
  g[s] = 0;
  f[s] = h(s);
  open.push(s);
  while (open.size > 0) {
    const n = open.pop();
    if (n === t) break;
    if (closed[n]) continue;
    closed[n] = 1;
    const i = n % nx;
    const j = Math.floor(n / nx);
    for (let dj = -1; dj <= 1; dj++)
      for (let di = -1; di <= 1; di++) {
        if ((di === 0 && dj === 0) || !ok(i + di, j + dj)) continue;
        if (di !== 0 && dj !== 0 && (!ok(i + di, j) || !ok(i, j + dj))) continue; // không cắt góc
        const m = (j + dj) * nx + i + di;
        const ng = g[n] + (di !== 0 && dj !== 0 ? SQRT2 : 1);
        if (ng >= g[m]) continue;
        g[m] = ng;
        f[m] = ng + h(m);
        came[m] = n;
        open.push(m);
      }
  }
  if (t !== s && came[t] < 0) return null;

  const cells: XZ[] = [];
  for (let n = t; n >= 0; n = n === s ? -1 : came[n]) cells.push([cx(n % nx), cz(Math.floor(n / nx))]);
  cells.reverse();
  const near = (a: XZ, b: XZ): boolean => Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-9;
  const pts: XZ[] = [from];
  for (const c of cells) if (!near(c, pts[pts.length - 1])) pts.push(c);
  if (!near(to, pts[pts.length - 1])) pts.push(to);
  return simplify(pts, walkable);
}
