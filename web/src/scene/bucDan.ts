/**
 * Bục đàn (`props[].kind = 'buc-dan'`, R-NPC-9): số đo bục + đàn cổ tranh + chỗ nhạc công ngồi. Thuần (không three) —
 * `vat_dan_tranh.ts` dựng hình, `danTranh.ts` (gốc) đặt nhạc công + tiếng đàn, test đọc cùng số.
 * Toạ độ cục bộ: gốc ở tâm bục, mặt trước (phía khán giả) +z — `rotY` 180 thì nhìn về −z.
 */
import { rotateXZ, type PropSpec } from './spec';

/** Bục gỗ thấp kiểu sân diễn nhỏ: rộng (x) × sâu (z) × cao (m). */
export const BUC_DAN = { w: 3.4, d: 2.6, h: 0.4 } as const;

/** Đàn cổ tranh 21 dây: dài (x), rộng (z), tâm đàn (z cục bộ), mặt đàn cao hơn sàn bục (m). */
export const DAN_TRANH = { len: 1.7, wide: 0.36, z: 0.2, top: 0.42, strings: 21 } as const;

/** Chỗ nhạc công ngồi sau đàn (z cục bộ) — mặt nhìn +z, đàn nằm ngang trước mặt. */
export const DAN_SEAT_Z = -0.55;

export interface DanSeat {
  x: number;
  z: number;
  /** độ cao mặt bục (m) — nhạc công ngồi ở đây */
  y: number;
  /** hướng nhìn (độ), như `rotY` của bục */
  rotY: number;
}

/** Chỗ ngồi của nhạc công trên bục `p` (đã tính `scale`, `rotY`); `groundY` = mặt đất tại tâm bục khi bục không có `y`. */
export function bucDanSeat(p: PropSpec, groundY: (x: number, z: number) => number): DanSeat {
  const s = p.scale ?? 1;
  const rot = p.rotY ?? 0;
  const [dx, dz] = rotateXZ(0, DAN_SEAT_Z * s, rot);
  const base = p.y ?? groundY(p.x, p.z);
  return { x: p.x + dx, z: p.z + dz, y: (Number.isFinite(base) ? base : 0) + BUC_DAN.h * s, rotY: rot };
}

/** Các bục đàn trong danh sách vật. */
export const bucDanList = (props: readonly PropSpec[]): PropSpec[] => props.filter((p) => p.kind === 'buc-dan');
