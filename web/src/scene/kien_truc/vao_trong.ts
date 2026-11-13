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
}

/** `fade` = nhóm mờ đi khi người chơi ở trong (mái, sàn lầu, tầng 2). */
export type WalkInBuilder = (g: THREE.Group, b: BuildingSpec, style: Style, fade: THREE.Group) => Shell;

/** Dốc lên nền thấp trước mặt tiền: dải rộng `w`, từ mép nền `z0` ra +z dài `run`. */
export function frontRamp(w: number, z0: number, run: number, y: number): LocalPad {
  return { x: 0, z: z0 + run / 2, w, d: run, y, ramp: { axis: 'z', at0: z0, at1: z0 + run, y1: 0 } };
}
