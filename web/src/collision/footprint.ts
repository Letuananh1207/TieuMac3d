/**
 * Chân vật trên mặt sân (R-NHA-7): hình chữ nhật **xoay được** (OBB — món trang trí quay 45°) và phép hỏi chồng lấn với hộp
 * thẳng trục, hình tròn, đa giác. Thuần toán 2D (x, z) — dùng cho kiểm chỗ đặt (`zones/decorPlace.ts`) và vật cản món
 * (`scene/decorLayer.ts`).
 */
import type { Box, Circle } from './colliders';

/** Chữ nhật tâm (x, z), rộng w theo trục x riêng, sâu d theo trục z riêng, quay `rot` độ quanh trục y (như `rotation.y`). */
export interface Rect {
  x: number;
  z: number;
  w: number;
  d: number;
  rot: number;
}

export type XZ = readonly [number, number];

const RAD = Math.PI / 180;

/** Trục riêng của chữ nhật trên mặt sân: ux (theo rộng), uz (theo sâu) — quay như three (`rotation.y` dương: x → −z). */
function axes(r: Rect): [XZ, XZ] {
  const c = Math.cos(r.rot * RAD);
  const s = Math.sin(r.rot * RAD);
  return [
    [c, -s],
    [s, c],
  ];
}

/** Bốn góc theo thứ tự vòng. */
export function rectCorners(r: Rect): XZ[] {
  const [ux, uz] = axes(r);
  const hw = r.w / 2;
  const hd = r.d / 2;
  return [
    [-hw, -hd],
    [hw, -hd],
    [hw, hd],
    [-hw, hd],
  ].map(([a, b]) => [r.x + ux[0] * a + uz[0] * b, r.z + ux[1] * a + uz[1] * b] as XZ);
}

/** Khung bao thẳng trục của chữ nhật xoay. */
export function rectAabb(r: Rect): { minX: number; maxX: number; minZ: number; maxZ: number } {
  const c = rectCorners(r);
  const xs = c.map((p) => p[0]);
  const zs = c.map((p) => p[1]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs) };
}

/** Điểm (x, z) đổi về hệ trục riêng của chữ nhật. */
function local(r: Rect, x: number, z: number): XZ {
  const [ux, uz] = axes(r);
  const dx = x - r.x;
  const dz = z - r.z;
  return [dx * ux[0] + dz * ux[1], dx * uz[0] + dz * uz[1]];
}

/** Điểm nằm trong chữ nhật (nới [pad] m mỗi phía). */
export function pointInRect(r: Rect, x: number, z: number, pad = 0): boolean {
  const [a, b] = local(r, x, z);
  return Math.abs(a) <= r.w / 2 + pad && Math.abs(b) <= r.d / 2 + pad;
}

function project(pts: readonly XZ[], ax: XZ): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const p of pts) {
    const v = p[0] * ax[0] + p[1] * ax[1];
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  return [lo, hi];
}

/** Hai chữ nhật xoay chồng nhau (định lý trục tách — SAT); chạm mép không tính. */
export function rectsOverlap(a: Rect, b: Rect): boolean {
  const pa = rectCorners(a);
  const pb = rectCorners(b);
  for (const ax of [...axes(a), ...axes(b)]) {
    const [a0, a1] = project(pa, ax);
    const [b0, b1] = project(pb, ax);
    if (a1 <= b0 + 1e-6 || b1 <= a0 + 1e-6) return false;
  }
  return true;
}

/** Hộp thẳng trục (`Colliders`) như chữ nhật không xoay. */
export function boxRect(b: Pick<Box, 'minX' | 'maxX' | 'minZ' | 'maxZ'>): Rect {
  return { x: (b.minX + b.maxX) / 2, z: (b.minZ + b.maxZ) / 2, w: b.maxX - b.minX, d: b.maxZ - b.minZ, rot: 0 };
}

/** Chữ nhật xoay chồng hình tròn. */
export function rectCircleOverlap(r: Rect, c: Circle): boolean {
  const [a, b] = local(r, c.x, c.z);
  const cx = Math.max(-r.w / 2, Math.min(a, r.w / 2));
  const cz = Math.max(-r.d / 2, Math.min(b, r.d / 2));
  return Math.hypot(a - cx, b - cz) < c.r - 1e-6;
}

/** Điểm trong đa giác (tia chẵn lẻ). */
export function pointInPolygon(poly: readonly XZ[], x: number, z: number): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

function segmentsCross(a: XZ, b: XZ, c: XZ, d: XZ): boolean {
  const cross = (p: XZ, q: XZ, r: XZ): number => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

/** Cả chữ nhật nằm trong đa giác: bốn góc ở trong và không cạnh nào cắt cạnh đa giác (đa giác lõm vẫn đúng). */
export function rectInPolygon(r: Rect, poly: readonly XZ[]): boolean {
  const c = rectCorners(r);
  if (!c.every((p) => pointInPolygon(poly, p[0], p[1]))) return false;
  for (let i = 0; i < 4; i++) {
    const a = c[i];
    const b = c[(i + 1) % 4];
    for (let k = 0, j = poly.length - 1; k < poly.length; j = k++) if (segmentsCross(a, b, poly[j], poly[k])) return false;
  }
  return true;
}
