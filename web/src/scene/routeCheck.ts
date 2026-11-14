/**
 * Kiểm đường đi của NPC biết đi (R-NPC-7) trên vật cản thật của cảnh: khép kín, mỗi đoạn cách vật cản ≥ 0,6 m, nằm trên
 * nền đi được (có độ cao), dốc ≤ 35°. Thuần (không three, không DOM) — `scripts/check-scene.mjs` và test cảnh gọi.
 */
import type { Box, Circle } from '../collision/colliders';
import type { XZ } from './spec';

/** Khoảng trống tối thiểu từ đường (tâm NPC) tới mép vật cản (m). */
export const ROUTE_CLEARANCE = 0.6;
/** Dốc tối đa của đường (độ) — như mặt đất đi được (R-VA-2). */
export const ROUTE_MAX_SLOPE_DEG = 35;
const STEP = 0.25;

export interface RouteObstacles {
  readonly boxes: readonly Box[];
  readonly circles: readonly Circle[];
}

const n = (v: number): string => String(+v.toFixed(2)).replace('.', ',');

/** Khoảng cách từ (x, z) tới mép vật cản gần nhất có khoảng cao chứa `y` (âm = nằm trong). `skip`: bỏ vật này. */
export function clearanceAt(obs: RouteObstacles, x: number, z: number, y?: number, skip?: (c: Circle) => boolean): number {
  let best = Infinity;
  for (const b of obs.boxes) {
    if (y !== undefined && ((b.minY !== undefined && y < b.minY) || (b.maxY !== undefined && y > b.maxY))) continue;
    const dx = Math.max(b.minX - x, 0, x - b.maxX);
    const dz = Math.max(b.minZ - z, 0, z - b.maxZ);
    const inside = dx === 0 && dz === 0;
    const d = inside ? -Math.min(x - b.minX, b.maxX - x, z - b.minZ, b.maxZ - z) : Math.hypot(dx, dz);
    if (d < best) best = d;
  }
  for (const c of obs.circles) {
    if (skip?.(c)) continue;
    const d = Math.hypot(x - c.x, z - c.z) - c.r;
    if (d < best) best = d;
  }
  return best;
}

/** Chiều dài đường khép kín, tính cả độ dốc (m). */
export function routeLength(route: readonly XZ[], ground?: (x: number, z: number) => number): number {
  let len = 0;
  for (let i = 0; i < route.length; i++) {
    const [ax, az] = route[i];
    const [bx, bz] = route[(i + 1) % route.length];
    const flat = Math.hypot(bx - ax, bz - az);
    const steps = Math.max(1, Math.ceil(flat / STEP));
    let px = ax;
    let pz = az;
    let py = ground ? ground(ax, az) : 0;
    for (let k = 1; k <= steps; k++) {
      const x = ax + ((bx - ax) * k) / steps;
      const z = az + ((bz - az) * k) / steps;
      const y = ground ? ground(x, z) : 0;
      len += Math.hypot(x - px, z - pz, Number.isFinite(y - py) ? y - py : 0);
      [px, pz, py] = [x, z, y];
    }
  }
  return len;
}

/**
 * Lỗi của đường (rỗng = hợp lệ). `obstacles` không gồm vật cản của chính NPC đó (hoặc truyền `skip`).
 * Báo mỗi đoạn một lỗi đầu tiên gặp (đủ để biết dời điểm nào).
 */
export function checkRoute(
  label: string,
  route: readonly XZ[],
  obstacles: RouteObstacles,
  ground: (x: number, z: number) => number,
  skip?: (c: Circle) => boolean,
): string[] {
  const out: string[] = [];
  if (route.length < 3) return [`${label}: đường cần ít nhất 3 điểm (khép kín)`];
  const maxSlope = Math.tan((ROUTE_MAX_SLOPE_DEG * Math.PI) / 180);
  for (let i = 0; i < route.length; i++) {
    const j = (i + 1) % route.length;
    const [ax, az] = route[i];
    const [bx, bz] = route[j];
    const flat = Math.hypot(bx - ax, bz - az);
    const seg = `${label}: đoạn ${i}→${j} (${n(ax)}; ${n(az)}) → (${n(bx)}; ${n(bz)})`;
    if (flat < 0.05) {
      out.push(`${seg}: hai điểm trùng nhau`);
      continue;
    }
    const steps = Math.max(1, Math.ceil(flat / STEP));
    let prevY = ground(ax, az);
    for (let k = 0; k <= steps; k++) {
      const x = ax + ((bx - ax) * k) / steps;
      const z = az + ((bz - az) * k) / steps;
      const y = ground(x, z);
      if (!Number.isFinite(y)) {
        out.push(`${seg}: ra ngoài nền đi được ở (${n(x)}; ${n(z)})`);
        break;
      }
      if (k > 0 && Math.abs(y - prevY) / (flat / steps) > maxSlope) {
        out.push(`${seg}: dốc quá ${ROUTE_MAX_SLOPE_DEG}° ở (${n(x)}; ${n(z)})`);
        break;
      }
      prevY = y;
      const c = clearanceAt(obstacles, x, z, y, skip);
      if (c < ROUTE_CLEARANCE) {
        out.push(`${seg}: cách vật cản ${n(c)} m < ${n(ROUTE_CLEARANCE)} m ở (${n(x)}; ${n(z)})`);
        break;
      }
    }
  }
  return out;
}
