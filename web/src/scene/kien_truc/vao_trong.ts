/**
 * Vỏ nhà vào được không gắn bài học (tiện ích tông môn — trà lâu, hí đài, Tàng Thư Các, cửa hàng; 2026-11-13.13).
 * Hàm dựng mỗi kiểu thêm khối vào nhóm nhà (toạ độ nhà, mặt trước nhìn +z) rồi trả về `Shell`: va chạm, nền đi được,
 * sàn trong nhà — `rooms.ts` `addWalkIn` đổi sang toạ độ cảnh. Phần làm mờ khi ở trong (mái, tầng trên) để vào `fade`.
 */
import type * as THREE from 'three';
import type { BuildingSpec } from '../spec';
import type { Style } from './chi_tiet';
import type { LocalBox } from './noi_that';

/** Tấm nền theo toạ độ nhà; `ramp` dốc dọc trục của nhà từ `y` (tại `at0`) xuống `y1` (tại `at1`). */
export interface LocalPad {
  x: number;
  z: number;
  w: number;
  d: number;
  y: number;
  ramp?: { axis: 'x' | 'z'; at0: number; at1: number; y1: number };
  /** tấm tầng trên (sàn tầng 2, cầu thang) — xem `Pad.upper` */
  upper?: boolean;
}

export interface Shell {
  /** vật cản hộp (`h` Infinity = tường che camera, R-DIEU-4) */
  boxes: LocalBox[];
  /** vật cản tròn (cột) */
  circles: { x: number; z: number; r: number }[];
  /** mặt đất đi được: nền nhà, dốc bậc */
  pads: LocalPad[];
  /** sàn trong nhà: đứng trong đây = "ở trong" (mái mờ R-HUD-2, camera ≤ 6 m) */
  floor: LocalBox;
  /** nhà lên được tầng 2: chân cao từ mức này (m, từ chân nhà) trở lên = đang ở tầng 2 → `fadeLow` hiện lại (R-HUD-2) */
  upperY?: number;
  /** chỗ ngồi (bồ đoàn) — bấm Ngồi khi đứng gần thì dời lên đó (R-VA-4); `y` từ chân nhà, `rotY` hướng nhìn (0 = +z) */
  seats?: { x: number; z: number; y: number; rotY: number }[];
}

/**
 * `fade` = nhóm mờ đi khi người chơi ở trong (mái, sàn lầu, tầng 2). `fadeLow` = nhóm chỉ mờ khi ở tầng 1 (sàn, tường,
 * kệ tầng 2 của nhà lên được tầng 2 — đứng trên tầng 2 thì hiện); nhà một tầng không dùng.
 */
export type WalkInBuilder = (g: THREE.Group, b: BuildingSpec, style: Style, fade: THREE.Group, fadeLow: THREE.Group) => Shell;

/** Dốc lên nền thấp trước mặt tiền: dải rộng `w`, từ mép nền `z0` ra +z dài `run`. */
export function frontRamp(w: number, z0: number, run: number, y: number): LocalPad {
  return { x: 0, z: z0 + run / 2, w, d: run, y, ramp: { axis: 'z', at0: z0, at1: z0 + run, y1: 0 } };
}
