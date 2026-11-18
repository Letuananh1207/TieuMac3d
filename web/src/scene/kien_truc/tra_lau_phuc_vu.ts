/**
 * Mốc phục vụ của trà lâu cho tiểu nhị mang trà (R-TRA-1), toạ độ nhà (mặt trước nhìn +z) — chỉ là số xuất ra, không dựng
 * hình. `tra_lau.ts` gom "vật cản mịn" (mặt bàn + đôn tròn thay hộp bao, sập, bàn nhỏ, cột, quầy, tường) từng tầng lúc dựng,
 * rồi gọi `teaServiceLocal`: đoạn cố định sau quầy, cửa, mốc thang, và mỗi chỗ ngồi một **chỗ đứng rót** (QĐ3 2026-11-16:
 * chếch trước – phải, cách 1,4–1,6 m — chỗ chật: xa nhất có thể; phải < 1,4 m mà trái xa hơn → trước – trái; ghế lan can: tính từ
 * mắt, bên phải). `scene/teaPath.ts` đổi sang toạ độ cảnh + dựng đường.
 */
import type { Box, Circle } from '../../collision/colliders';
import { clearanceAt } from '../routeCheck';
import { RAIL_REACH, type LocalSeat } from './do_pho';

export type XZ = readonly [number, number];

/** Vật cản mịn + vùng đi được của một tầng (toạ độ nhà). `y` = mặt sàn (từ chân nhà). */
export interface ServiceFloor {
  y: number;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  boxes: Box[];
  circles: Circle[];
}

export interface ServiceSeat {
  floor: 1 | 2;
  /** chỗ tiểu nhị đứng rót */
  stand: XZ;
  /** hướng mặt (yaw) khi rót: nhìn về chỗ ngồi */
  face: number;
  /** góc chỗ đứng so với hướng nhìn của người ngồi (độ, dương = bên phải) — để test / in */
  angle: number;
}

export interface TeaServiceLocal {
  /** sau quầy: từ chỗ tiểu nhị (đặc tả NPC) ra **đầu quầy** — mỗi đầu một lối (hồi phải trước, hồi trái sau); điểm cuối =
   *  đầu lưới tầng 1. Đường chọn lối nào ngắn hơn. */
  behind: XZ[][];
  /** trước mặt tiền, gian phía hồi phải (trên dốc) — tầng 1 ra đây rồi theo `stairs` */
  door: XZ;
  /** cửa → góc ngoài → chân thang → giữa chiếu nghỉ → đầu cầu nối trong sàn tầng 2 (điểm cuối = đầu lưới tầng 2) */
  stairs: XZ[];
  floors: readonly [ServiceFloor, ServiceFloor];
  /** cùng thứ tự `Shell.seats`; `null` = không tìm được chỗ đứng (không ai mang — cầm chén ngay) */
  seats: (ServiceSeat | null)[];
}

/** Khoảng trống tối thiểu ở chỗ đứng rót (m) — tâm tiểu nhị tới mép bàn / sập. */
export const STAND_CLEAR = 0.2;
/** Chỗ đứng rót không đè lên chỗ ngồi khác (tâm cách tâm, m). */
const OTHER_SEAT = 0.5;
const DEG = Math.PI / 180;
/** Góc thử (độ, so hướng nhìn, dương = phải): gần 45° trước (QĐ3). Bàn bày chật → lấy góc gần nhất còn trống. */
const TABLE_ANGLES = [45, 50, 40, 55, 35, 60, 65, 70, 75, 80, 85];
/**
 * Ghế lan can (duyệt ảnh lần 2): người ngồi nhoài tới lan can → góc + khoảng tính **từ mắt** (`railEye`). Lan can chỉ cách mắt
 * `RAIL_REACH` nên phía trước mắt không có chỗ: tiểu nhị lùi vào trong sàn, ngang bên phải mắt. Góc ≤ 82°: quay đầu 60° (giới
 * hạn nhìn quanh), khung 900 × 600 (FOV 55° → ngang ±38°) thấy trọn bề ngang thân (cả tay, ±0,45 m ở 1,6 m: ±16°). Khoảng
 * lấy xa trước: chibi cao 2,1 m, mắt 1,35 m — càng xa càng ít bị cắt đầu.
 */
const RAIL_ANGLES = [60, 65, 70, 75, 80, 82];
const RAIL_DISTS = [1.6, 1.55, 1.5, 1.45, 1.4];
/** Khoảng đứng rót (m, tâm chỗ ngồi → tâm tiểu nhị) — duyệt ảnh 2026-11-16: 0,8–1,2 m thì đầu chibi chiếm nửa màn. */
const DISTS = [1.5, 1.45, 1.55, 1.4, 1.6];
/** Đủ xa (m): phía phải gần hơn mà phía trái xa hơn → đứng trái (duyệt ảnh lần 2). */
export const NEAR_OK = 1.4;
/** Chỗ chật không đủ 1,4 m: lùi dần từ đây (0,01 m một) xuống `MIN_FALLBACK`, lấy khoảng xa nhất còn đứng được. */
const FALLBACK_FROM = 1.39;
const FALLBACK_STEP = 0.01;
/** Gần nhất còn chấp nhận (m) — gần hơn coi như phía đó bị chắn (sang phía trái / bỏ). */
export const MIN_FALLBACK = 0.8;

/** Box thẳng trục theo tâm + cỡ (toạ độ nhà). */
export const rect = (x: number, z: number, w: number, d: number): Box => ({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, h: 0 });

const inBounds = (f: ServiceFloor, x: number, z: number, m: number): boolean =>
  x >= f.bounds.minX + m && x <= f.bounds.maxX - m && z >= f.bounds.minZ + m && z <= f.bounds.maxZ - m;

/**
 * Gốc đo khoảng / góc đứng rót: chỗ ngồi — ghế lan can: **mắt** người ngồi đang nhoài tới lan can (`ngoiMat.ts`: mắt trước
 * chỗ ngồi `max(eyeFwd, rail.d − RAIL_REACH)`; lan can trà lâu cách 1,5 m nên eyeFwd 0,08 không đổi gì).
 */
export function railEye(s: LocalSeat): XZ {
  const k = s.hold === 'lan-can' && s.rail ? Math.max(0, s.rail.d - RAIL_REACH) : 0;
  return [s.x + Math.sin(s.rotY) * k, s.z + Math.cos(s.rotY) * k];
}

/**
 * Chỗ đứng rót cho chỗ ngồi `s` (R-TRA-1): mỗi phía (phải trước), thử các góc gần 45° phía trước (ghế lan can: 60–82° tính
 * từ mắt), khoảng 1,4–1,6 m, lấy chỗ đầu tiên cách vật cản ≥ `STAND_CLEAR`, trong sàn, không đè chỗ ngồi khác; không có (bàn
 * bày chật) → khoảng **xa nhất** dưới 1,4 m còn đứng được (góc nào cũng được, ưu tiên gần 45°), không gần hơn `MIN_FALLBACK`.
 * Phía phải đạt 1,4 m → phải. Không thì phía trái xa hơn (kể cả phải bị chắn hết — sập quay lưng ra tường) → trái. Không có → `null`.
 * `angle` trả về: góc thật so với hướng nhìn **từ chỗ ngồi**.
 */
export function standFor(s: LocalSeat, floor: ServiceFloor, others: readonly LocalSeat[]): { stand: XZ; angle: number } | null {
  const fx = Math.sin(s.rotY);
  const fz = Math.cos(s.rotY);
  const rx = -Math.cos(s.rotY); // bên phải người ngồi (nhìn +z thì phải là −x)
  const rz = Math.sin(s.rotY);
  const rail = s.hold === 'lan-can';
  const [ox, oz] = railEye(s);
  const angles = rail ? RAIL_ANGLES : TABLE_ANGLES;
  const dists = rail ? RAIL_DISTS : DISTS;
  const obs = { boxes: floor.boxes, circles: floor.circles };
  const tryAt = (side: number, a: number, d: number): XZ | null => {
    const ang = side * a * DEG;
    const x = ox + (fx * Math.cos(ang) + rx * Math.sin(ang)) * d;
    const z = oz + (fz * Math.cos(ang) + rz * Math.sin(ang)) * d;
    if (!inBounds(floor, x, z, STAND_CLEAR) || clearanceAt(obs, x, z) < STAND_CLEAR) return null;
    if (others.some((o) => o !== s && Math.hypot(o.x - x, o.z - z) < OTHER_SEAT)) return null;
    return [x, z];
  };
  const search = (side: number): { p: XZ; d: number } | null => {
    for (const a of angles) for (const d of dists) { const p = tryAt(side, a, d); if (p) return { p, d }; }
    for (let k = 0; FALLBACK_FROM - k * FALLBACK_STEP >= MIN_FALLBACK - 1e-9; k++) {
      const d = FALLBACK_FROM - k * FALLBACK_STEP;
      for (const a of angles) { const p = tryAt(side, a, d); if (p) return { p, d }; }
    }
    return null;
  };
  const right = search(1);
  let best = right;
  if (!right || right.d < NEAR_OK - 1e-9) {
    const left = search(-1);
    if (left && (!right || left.d > right.d + 1e-9)) best = left;
  }
  if (!best) return null;
  const vx = best.p[0] - s.x;
  const vz = best.p[1] - s.z;
  return { stand: best.p, angle: Math.atan2(rx * vx + rz * vz, fx * vx + fz * vz) / DEG };
}

/** Gắn chỗ đứng rót cho mọi chỗ ngồi; chỗ nào không tìm được → bỏ khỏi phục vụ (tiểu nhị không mang — cầm chén ngay). */
export function teaServiceLocal(
  base: Omit<TeaServiceLocal, 'seats'>,
  seats: readonly LocalSeat[],
  floorOf: (s: LocalSeat) => 1 | 2,
): TeaServiceLocal {
  return {
    ...base,
    seats: seats.map((s) => {
      const floor = floorOf(s);
      const p = standFor(s, base.floors[floor - 1], seats);
      if (!p) return null;
      return { floor, stand: p.stand, angle: p.angle, face: Math.atan2(s.x - p.stand[0], s.z - p.stand[1]) };
    }),
  };
}
