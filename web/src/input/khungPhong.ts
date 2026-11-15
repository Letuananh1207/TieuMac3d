/**
 * Khung phòng (V-71): camera "nhà búp bê" cho gian trong không trần — kiểu nhà riêng 摩尔庄园 / Animal Crossing: camera cao
 * nhìn chếch xuống, lùi vừa đủ để thấy trọn phòng; màn hẹp (điện thoại dọc) không lọt hết bề ngang thì tâm ngắm theo nhân
 * vật nhiều hơn. Thuần (không three, không DOM) — `orbitCamera.ts` dùng, test riêng.
 */

/** Trùng hình với `SceneSpec['camera']['frame']` (lớp input không import scene). */
export interface FrameSettings {
  enabled: boolean;
  center: readonly [number, number];
  half: readonly [number, number];
  height: number;
  /** độ */
  yaw: number;
  /** độ */
  yawLimit: number;
  pitchMin: number;
  pitchMax: number;
  follow: number;
  lookY: number;
}

/** Phần màn hình (NDC) phòng được chiếm tối đa — chừa lề cho HUD / chip tên khu. */
const MARGIN = 0.9;
/** màn hẹp (điện thoại dọc): lùi xa hơn mức lọt bề sâu tối đa bấy nhiêu lần */
const WIDE_SLACK = 2;

type V3 = readonly [number, number, number];

/**
 * Khoảng cách camera (từ điểm ngắm, theo hướng yaw / pitch) để mọi điểm `pts` lọt khung: `w` theo bề ngang, `h` theo bề
 * dọc (m). `fov` dọc (độ), `aspect` = rộng / cao. Tìm chia đôi trong 1 … 200 m.
 */
export function fitDistance(fov: number, aspect: number, yaw: number, pitch: number, target: V3, pts: readonly V3[]): { w: number; h: number } {
  const tanV = Math.tan((fov * Math.PI) / 360) * MARGIN;
  const tanH = tanV * aspect;
  // hướng từ điểm ngắm ra camera; trục phải / lên của camera
  const dir: V3 = [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)];
  const right: V3 = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const upv: V3 = [-Math.sin(yaw) * Math.sin(pitch), Math.cos(pitch), -Math.cos(yaw) * Math.sin(pitch)];
  const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  /** điểm lọt khung (theo trục `axis`) khi camera cách `d` */
  const fits = (d: number, axis: 'w' | 'h'): boolean =>
    pts.every((p) => {
      const r: V3 = [p[0] - target[0], p[1] - target[1], p[2] - target[2]];
      const depth = d - dot(r, dir); // khoảng cách theo hướng nhìn
      if (depth <= 0.1) return false;
      return axis === 'w' ? Math.abs(dot(r, right)) <= depth * tanH : Math.abs(dot(r, upv)) <= depth * tanV;
    });
  const solve = (axis: 'w' | 'h'): number => {
    let lo = 1;
    let hi = 200;
    if (fits(lo, axis)) return lo;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid, axis)) hi = mid;
      else lo = mid;
    }
    return hi;
  };
  return { w: solve('w'), h: solve('h') };
}

/** Góc sàn + đỉnh tường phía xa (phía −z khi yaw 0) của khung phòng. */
export function framePoints(f: FrameSettings): V3[] {
  const [cx, cz] = f.center;
  const [hx, hz] = f.half;
  const back = Math.cos((f.yaw * Math.PI) / 180) >= 0 ? -1 : 1;
  const pts: V3[] = [];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) pts.push([cx + sx * hx, 0, cz + sz * hz]);
    if (f.height > 0) pts.push([cx + sx * hx, f.height, cz + back * hz]);
  }
  return pts;
}

/**
 * Đặt khung: khoảng cách dùng (không xa hơn mức vừa lọt cả phòng — xa nữa chỉ thêm khoảng trống; màn hẹp: lọt bề sâu,
 * lùi thêm chút cho bề ngang) và điểm ngắm (x, z).
 * Mỗi trục: phòng lọt trọn → tâm ngắm theo nhân vật `follow` phần; khoảng cách càng ngắn so với mức lọt trục đó thì theo
 * càng nhiều (tới 1 = theo hẳn) — nhân vật luôn trong màn.
 */
export function placeFrame(
  f: FrameSettings,
  want: number,
  fit: { w: number; h: number },
  player: { x: number; z: number },
): { dist: number; x: number; z: number } {
  // lọt bề sâu phòng (bề dọc màn); màn hẹp không lọt bề ngang thì lùi thêm tối đa WIDE_SLACK lần — thấy rộng hơn
  // mà không phí nửa màn cho khoảng trống trên / dưới phòng
  const dist = Math.min(want, Math.max(fit.h, Math.min(fit.w, fit.h * WIDE_SLACK)));
  const k = (need: number): number => f.follow + (1 - f.follow) * Math.max(0, Math.min(1, 1 - dist / need));
  const [cx, cz] = f.center;
  return { dist, x: cx + (player.x - cx) * k(fit.w), z: cz + (player.z - cz) * k(fit.h) };
}

/** Kẹp yaw (rad) vào `yaw ± yawLimit` của khung (độ). */
export function clampFrameYaw(f: FrameSettings, yaw: number): number {
  const base = (f.yaw * Math.PI) / 180;
  const lim = (f.yawLimit * Math.PI) / 180;
  const off = Math.atan2(Math.sin(yaw - base), Math.cos(yaw - base));
  return base + Math.min(lim, Math.max(-lim, off));
}
