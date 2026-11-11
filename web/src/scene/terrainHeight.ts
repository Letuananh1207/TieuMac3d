/**
 * Tính lưới độ cao từ đặc tả (`terrain` + `paths`). Thuần toán (không three, không DOM) để `scene:check` chạy được.
 * Thứ tự: đất tự nhiên (nhiễu + đỉnh) → ép phẳng bục khu / lối lát → đổ xuống vực ngoài mép cao nguyên.
 * Xem docs/tham_khao/dia-hinh-tong-mon.md.
 */
import { Heightfield } from '../collision/heightfield';
import type { PathSpec, PlateauSpec, SceneSpec, StairSpec, XZ } from './spec';

type Terrain = SceneSpec['terrain'];

/** Độ cao mặt đất tại (x, z) để đặt vật lên địa hình; cảnh phẳng = luôn 0. */
export type GroundY = (x: number, z: number) => number;

/* ---------- nhiễu giá trị có hạt giống (không gói ngoài) ---------- */

function hash(ix: number, iz: number, seed: number): number {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263) ^ Math.imul(seed, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const smooth = (t: number): number => t * t * (3 - 2 * t);

function valueNoise(x: number, z: number, seed: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = smooth(x - ix);
  const fz = smooth(z - iz);
  const a = hash(ix, iz, seed);
  const b = hash(ix + 1, iz, seed);
  const c = hash(ix, iz + 1, seed);
  const d = hash(ix + 1, iz + 1, seed);
  return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
}

/** Nhiễu nhiều tầng, -1 … 1. */
export function fbm(x: number, z: number, seed: number): number {
  let sum = 0;
  let amp = 1;
  let norm = 0;
  for (let o = 0; o < 3; o++) {
    sum += (valueNoise(x, z, seed + o * 101) * 2 - 1) * amp;
    norm += amp;
    x *= 2.03;
    z *= 2.03;
    amp *= 0.5;
  }
  return sum / norm;
}

const clamp01 = (t: number): number => Math.min(1, Math.max(0, t));

/* ---------- vùng ép phẳng: bục khu (chữ nhật) + lối lát (dải) ---------- */

interface FlatZone {
  /** khoảng cách (m) từ điểm tới vùng; 0 = ở trong */
  dist(x: number, z: number): number;
  /** độ cao mặt phẳng tại điểm (lối lát dốc đều giữa hai đầu) */
  y(x: number, z: number): number;
  blend: number;
}

function plateauZone(p: PlateauSpec, blend: number): FlatZone {
  const x0 = Math.min(p.from[0], p.to[0]);
  const x1 = Math.max(p.from[0], p.to[0]);
  const z0 = Math.min(p.from[1], p.to[1]);
  const z1 = Math.max(p.from[1], p.to[1]);
  return {
    dist: (x, z) => Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(z0 - z, 0, z - z1)),
    y: () => p.y,
    blend: p.blend ?? blend,
  };
}

/** Độ cao bục chứa điểm (bục khai báo trước thắng); không bục nào → null. */
function plateauAt(plateaus: PlateauSpec[], [x, z]: XZ): number | null {
  for (const p of plateaus) {
    if (x >= Math.min(p.from[0], p.to[0]) && x <= Math.max(p.from[0], p.to[0]) && z >= Math.min(p.from[1], p.to[1]) && z <= Math.max(p.from[1], p.to[1])) {
      return p.y;
    }
  }
  return null;
}

function pathZone(path: PathSpec, plateaus: PlateauSpec[], blend: number): FlatZone {
  const [ax, az] = path.from;
  const [bx, bz] = path.to;
  const dx = bx - ax;
  const dz = bz - az;
  const len2 = dx * dx + dz * dz || 1;
  const ya = plateauAt(plateaus, path.from) ?? 0;
  const yb = plateauAt(plateaus, path.to) ?? ya;
  const along = (x: number, z: number): number => clamp01(((x - ax) * dx + (z - az) * dz) / len2);
  return {
    dist: (x, z) => {
      const t = along(x, z);
      return Math.max(0, Math.hypot(x - (ax + dx * t), z - (az + dz * t)) - path.width / 2);
    },
    y: (x, z) => ya + (yb - ya) * along(x, z),
    blend,
  };
}

/** Đất tự nhiên (nhiễu + các đỉnh), chưa ép phẳng, chưa đổ vực. */
function naturalFn(t: Terrain): (x: number, z: number) => number {
  const { seed, amp, scale } = t.noise;
  return (x, z) => {
    let h = amp * fbm(x / scale, z / scale, seed);
    for (const p of t.peaks) {
      const k = 1 - Math.hypot(x - p.x, z - p.z) / p.r;
      if (k <= 0) continue;
      // sườn lõm, đỉnh nhọn (núi Trung Hoa cao hơn rộng) + gợn đá theo nhiễu
      h += p.h * Math.pow(k, 1.6) + p.h * 0.12 * k * fbm(x / 9, z / 9, seed + 7);
    }
    return h;
  };
}

/** Độ cao hai đầu một bậc đá: đầu nằm trên bục → độ cao bục, không thì đất tự nhiên tại đó. */
export function stairEnds(t: Terrain, s: StairSpec): [number, number] {
  const nat = naturalFn(t);
  return [plateauAt(t.plateaus, s.from) ?? nat(...s.from), plateauAt(t.plateaus, s.to) ?? nat(...s.to)];
}

/** Bậc đá: dải ép dốc đều giữa độ cao hai đầu; mép chuyển hẹp (2 m) để vách hai bên bậc rõ. */
function stairZone(t: Terrain, s: StairSpec): FlatZone {
  const [ya, yb] = stairEnds(t, s);
  const z = pathZone({ from: s.from, to: s.to, width: s.width }, [], 2);
  return { ...z, y: (x, zz) => {
    const [ax, az] = s.from;
    const [bx, bz] = s.to;
    const dx = bx - ax;
    const dz = bz - az;
    const k = clamp01(((x - ax) * dx + (zz - az) * dz) / (dx * dx + dz * dz || 1));
    return ya + (yb - ya) * k;
  } };
}

/** Độ cao tại (x, z) theo đặc tả — dùng để lấy mẫu lưới. */
export function terrainHeightFn(t: Terrain, paths: PathSpec[]): (x: number, z: number) => number {
  const zones = [
    ...t.plateaus.map((p) => plateauZone(p, t.blend)),
    ...paths.map((p) => pathZone(p, t.plateaus, t.blend)),
    ...t.stairs.map((s) => stairZone(t, s)),
  ];
  const natural = naturalFn(t);
  const { seed } = t.noise;
  const [cx, cz] = t.center;
  return (x, z) => {
    // 1. đất tự nhiên
    let h = natural(x, z);
    // 2. ép phẳng: vùng gần nhất thắng
    let best: FlatZone | null = null;
    let bestD = Infinity;
    for (const zn of zones) {
      const d = zn.dist(x, z);
      if (d < bestD) {
        bestD = d;
        best = zn;
      }
    }
    if (best && bestD < best.blend) h = best.y(x, z) + (h - best.y(x, z)) * smooth(clamp01(bestD / best.blend));
    else if (best && bestD === 0) h = best.y(x, z);
    // 3. mép cao nguyên đổ xuống vực
    const r = Math.hypot(x - cx, z - cz) + t.edge.wobble * fbm((x - cx) / 25, (z - cz) / 25, seed + 13);
    if (r > t.edge.radius) h += (t.edge.y - h) * smooth(clamp01((r - t.edge.radius) / t.edge.width));
    return h;
  };
}

/** Lưới độ cao của cả vùng địa hình (tâm `terrain.center`, cạnh `size`, ô `cell`). */
export function buildHeightfield(t: Terrain, paths: PathSpec[]): Heightfield {
  const n = Math.max(1, Math.round(t.size / t.cell));
  const cell = t.size / n;
  const ox = t.center[0] - t.size / 2;
  const oz = t.center[1] - t.size / 2;
  const f = terrainHeightFn(t, paths);
  const heights = new Float32Array((n + 1) * (n + 1));
  for (let j = 0; j <= n; j++) {
    for (let i = 0; i <= n; i++) heights[j * (n + 1) + i] = f(ox + i * cell, oz + j * cell);
  }
  return new Heightfield(ox, oz, cell, n, n, heights);
}
