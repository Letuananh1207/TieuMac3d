/**
 * Đường tiểu nhị mang trà (R-TRA-1), toạ độ cảnh: chỗ tiểu nhị → sau quầy (cố định) → lưới tầng 1 tránh bàn ghế → chỗ đứng
 * rót (tầng 1); chỗ tầng 2: lưới tầng 1 tới cửa → mốc thang cố định → lưới tầng 2 → chỗ đứng rót. Lưới 0,25 m (`gridPath`),
 * cách vật cản mịn ≥ 0,3 m. Dựng một lần mỗi chỗ ngồi rồi nhớ (`TeaPaths`). `polylineAt` = điểm + hướng mặt dọc đường hở
 * (xoay mượt ở góc như `npcRoute.pointAt`). Độ cao do nơi gọi lấy từ mặt đất (`heightAt(x, z, yTrước)` chọn đúng tầng).
 */
import type { Box, Circle } from '../collision/colliders';
import { findPath, type GridBounds, type XZ } from '../collision/gridPath';
import type { LocalSeat } from './kien_truc/do_pho';
import type { ServiceFloor, TeaServiceLocal } from './kien_truc/tra_lau_phuc_vu';
import { clearanceAt } from './routeCheck';
import { rotateXZ, type BuildingSpec } from './spec';

/** Khoảng trống tối thiểu từ tâm tiểu nhị tới vật cản trên lưới (m). */
export const PATH_CLEAR = 0.3;
/** Người đang ngồi: vật cản tròn bán kính này khi dựng đường (không đi xuyên khách). */
const SITTER_R = 0.35;
/** Xoay mượt ở góc: bắt đầu xoay trước góc / xong sau góc chừng này mét (như `npcRoute.TURN_RADIUS`). */
const TURN = 0.6;

export interface TeaFloor {
  y: number;
  bounds: GridBounds;
  boxes: Box[];
  circles: Circle[];
}

export interface TeaSeat {
  floor: 1 | 2;
  /** chỗ ngồi (toạ độ cảnh) */
  seat: XZ;
  /** chỗ đứng rót */
  stand: XZ;
  /** hướng mặt khi rót (yaw cảnh) */
  face: number;
  /** góc chỗ đứng so hướng nhìn người ngồi (độ, dương = phải) */
  angle: number;
}

/** Mốc phục vụ của một trà lâu, toạ độ cảnh. */
export interface TeaService {
  /** mã nhà */
  room: string;
  /** sau quầy ra mỗi đầu quầy (lối thay nhau) */
  behind: XZ[][];
  door: XZ;
  stairs: XZ[];
  floors: readonly [TeaFloor, TeaFloor];
  /** cùng thứ tự chỗ ngồi của nhà; `null` = không ai mang */
  seats: (TeaSeat | null)[];
}

/** Đổi mốc phục vụ toạ độ nhà → cảnh (nhà quay bội 90° — hộp vẫn thẳng trục). */
export function worldService(b: BuildingSpec, svc: TeaServiceLocal, seats: readonly LocalSeat[], y0 = 0): TeaService {
  const rot = b.rotY ?? 0;
  const p = (q: XZ): XZ => {
    const [dx, dz] = rotateXZ(q[0], q[1], rot);
    return [b.x + dx, b.z + dz];
  };
  const swap = rot % 180 !== 0;
  const box = (r: Box): Box => {
    const [cx, cz] = p([(r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2]);
    const [w, d] = swap ? [r.maxZ - r.minZ, r.maxX - r.minX] : [r.maxX - r.minX, r.maxZ - r.minZ];
    return { minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2, h: 0 };
  };
  const floor = (f: ServiceFloor): TeaFloor => {
    const bb = box({ ...f.bounds, h: 0 });
    return {
      y: y0 + f.y,
      bounds: { minX: bb.minX, maxX: bb.maxX, minZ: bb.minZ, maxZ: bb.maxZ },
      boxes: f.boxes.map(box),
      circles: f.circles.map((c) => {
        const [x, z] = p([c.x, c.z]);
        return { x, z, r: c.r };
      }),
    };
  };
  const yaw = (rot * Math.PI) / 180;
  return {
    room: b.id,
    behind: svc.behind.map((l) => l.map(p)),
    door: p(svc.door),
    stairs: svc.stairs.map(p),
    floors: [floor(svc.floors[0]), floor(svc.floors[1])],
    seats: svc.seats.map((s, i) => (s ? { floor: s.floor, seat: p([seats[i].x, seats[i].z]), stand: p(s.stand), face: s.face + yaw, angle: s.angle } : null)),
  };
}

/** Ô (x, z) của tầng `f` đi được: trong sàn (trừ lề) và cách vật cản ≥ `PATH_CLEAR`. */
export function walkableOn(f: TeaFloor, extra: Circle[] = []): (x: number, z: number) => boolean {
  const obs = { boxes: f.boxes, circles: [...f.circles, ...extra] };
  const m = PATH_CLEAR;
  return (x, z) => x >= f.bounds.minX + m && x <= f.bounds.maxX - m && z >= f.bounds.minZ + m && z <= f.bounds.maxZ - m && clearanceAt(obs, x, z) >= m;
}

/**
 * Đường (toạ độ cảnh) từ chỗ tiểu nhị `home` tới chỗ đứng rót của chỗ `i` — ra đầu quầy nào cho đường ngắn hơn; không có
 * → `null`.
 */
export function teaPath(svc: TeaService, i: number, home: XZ): XZ[] | null {
  let best: XZ[] | null = null;
  let bestL = Infinity;
  for (const behind of svc.behind) {
    const p = viaEnd(svc, i, home, behind);
    const l = p ? polyline(p).length : Infinity;
    if (l < bestL) [best, bestL] = [p, l];
  }
  return best;
}

function viaEnd(svc: TeaService, i: number, home: XZ, behind: readonly XZ[]): XZ[] | null {
  const seat = svc.seats[i];
  if (!seat || behind.length === 0) return null;
  const sitter: Circle = { x: seat.seat[0], z: seat.seat[1], r: SITTER_R };
  const [f1, f2] = svc.floors;
  const start = behind[behind.length - 1];
  const out: XZ[] = [home, ...behind.slice(0, -1)];
  const join = (part: XZ[] | null): boolean => {
    if (!part) return false;
    for (const q of part) {
      const l = out[out.length - 1];
      if (Math.hypot(q[0] - l[0], q[1] - l[1]) > 1e-6) out.push(q);
    }
    return true;
  };
  if (seat.floor === 1) {
    if (!join(findPath(start, seat.stand, walkableOn(f1, [sitter]), f1.bounds))) return null;
    return out;
  }
  if (!join(findPath(start, svc.door, walkableOn(f1), f1.bounds))) return null;
  join(svc.stairs);
  if (!join(findPath(svc.stairs[svc.stairs.length - 1], seat.stand, walkableOn(f2, [sitter]), f2.bounds))) return null;
  return out;
}

/** Đường hở đã tính sẵn quãng tích luỹ + hướng từng đoạn. */
export interface Polyline {
  readonly points: readonly XZ[];
  readonly cum: readonly number[];
  readonly yaw: readonly number[];
  readonly length: number;
}

export function polyline(points: readonly XZ[]): Polyline {
  const cum = [0];
  const yaw: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const [ax, az] = points[i - 1];
    const [bx, bz] = points[i];
    cum.push(cum[i - 1] + Math.hypot(bx - ax, bz - az));
    yaw.push(Math.atan2(bx - ax, bz - az));
  }
  return { points, cum, yaw, length: cum[cum.length - 1] };
}

const wrap = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));
const lerpAngle = (a: number, b: number, t: number): number => a + wrap(b - a) * t;

/** Điểm + hướng đi (yaw, 0 = +z) ở quãng `s` (kẹp trong [0, dài]); xoay mượt ±`TURN` quanh mỗi góc. */
export function polylineAt(l: Polyline, s: number): { x: number; z: number; yaw: number } {
  const n = l.points.length;
  if (n < 2) return { x: l.points[0]?.[0] ?? 0, z: l.points[0]?.[1] ?? 0, yaw: 0 };
  const d = Math.min(l.length, Math.max(0, s));
  let i = 0;
  while (i < n - 2 && l.cum[i + 1] <= d) i++;
  const seg = l.cum[i + 1] - l.cum[i];
  const t = seg > 0 ? (d - l.cum[i]) / seg : 0;
  const [ax, az] = l.points[i];
  const [bx, bz] = l.points[i + 1];
  const r = Math.min(TURN, seg / 2);
  const toEnd = seg - (d - l.cum[i]);
  const fromStart = d - l.cum[i];
  let yaw = l.yaw[i];
  if (r > 0 && toEnd < r && i + 1 < l.yaw.length) yaw = lerpAngle(l.yaw[i], l.yaw[i + 1], 0.5 * (1 - toEnd / r));
  else if (r > 0 && fromStart < r && i > 0) yaw = lerpAngle(l.yaw[i - 1], l.yaw[i], 0.5 + 0.5 * (fromStart / r));
  return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, yaw: wrap(yaw) };
}

/** Nhớ đường theo chỗ ngồi (dựng lần đầu cần — < 1 ms / chỗ). */
export class TeaPaths {
  private readonly memo = new Map<number, Polyline | null>();
  constructor(
    readonly service: TeaService,
    private readonly home: XZ,
  ) {}

  get(i: number): Polyline | null {
    if (!this.memo.has(i)) {
      const p = teaPath(this.service, i, this.home);
      this.memo.set(i, p ? polyline(p) : null);
    }
    return this.memo.get(i) ?? null;
  }
}
