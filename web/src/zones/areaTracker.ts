import type { PointXZ } from '../collision/colliders';

/** Một khu có tên: hình chữ nhật từ góc `from` tới góc `to` ([x, z]). Trùng hình với `scene/spec` `AreaSpec`. */
export interface Area {
  name: string;
  /** chữ Hán của khu (dữ liệu đặc tả; thẻ tên khu đã bỏ — R-HUD-3) */
  han?: string;
  from: [number, number];
  to: [number, number];
}

function inside(a: Area, p: PointXZ): boolean {
  const [x1, z1] = a.from;
  const [x2, z2] = a.to;
  return p.x >= Math.min(x1, x2) && p.x <= Math.max(x1, x2) && p.z >= Math.min(z1, z2) && p.z <= Math.max(z1, z2);
}

/** Khu chứa `p` (khu khai báo trước thắng), không có thì null. */
export function areaAt(areas: readonly Area[], p: PointXZ): Area | null {
  return areas.find((a) => inside(a, p)) ?? null;
}
