/**
 * Đường bay của hạc truyền tống (R-HANH-5): bãi đáp, đường sà xuống / cất cánh / hạ / bay đi (Bezier bậc ba), cung nhảy
 * lên / xuống lưng hạc, vị trí camera theo thời gian. Thuần (không three) — test `hacDuong.test.ts`.
 *
 * Quy ước hướng như cảnh: `heading` (radian) 0 = nhìn +z; phía trước (sin h, cos h); bên phải (−cos h, sin h).
 */
import type { XZ } from './spec';

export type V3 = [number, number, number];

/** Bãi đáp mặc định: lệch sang phải hướng nhìn lúc xuất hiện bấy nhiêu mét (`crane.padOffset` trong đặc tả). */
export const PAD_OFFSET = 2.5;
/** Khúc cất cánh: hạc đáp trước mặt nhân vật cách bấy nhiêu mét (theo hướng nhìn). */
export const MOUNT_AHEAD = 2.2;

/** Hướng nhìn mặc định lúc xuất hiện (camera yaw 0 → nhân vật nhìn về bắc, −z) — `main.ts`. */
export const START_HEADING = Math.PI;

export const forwardOf =(h: number): XZ => [Math.sin(h), Math.cos(h)];
export const rightOf = (h: number): XZ => [-Math.cos(h), Math.sin(h)];

/** Bãi đáp khi hạ cánh: chỗ xuất hiện + `offset` m về bên phải hướng nhìn. */
export function landingPad(at: XZ, heading: number, offset = PAD_OFFSET): XZ {
  const [rx, rz] = rightOf(heading);
  return [at[0] + rx * offset, at[1] + rz * offset];
}

/** Chỗ hạc đáp lúc đón (khúc cất cánh): trước mặt nhân vật. */
export function mountPad(at: XZ, heading: number, ahead = MOUNT_AHEAD): XZ {
  const [fx, fz] = forwardOf(heading);
  return [at[0] + fx * ahead, at[1] + fz * ahead];
}

/** Bốn điểm điều khiển một đường Bezier bậc ba. */
export type Curve = [V3, V3, V3, V3];

export function bezier(c: Curve, t: number): V3 {
  const k = clamp01(t);
  const u = 1 - k;
  const a = u * u * u;
  const b = 3 * u * u * k;
  const d = 3 * u * k * k;
  const e = k * k * k;
  return [0, 1, 2].map((i) => a * c[0][i] + b * c[1][i] + d * c[2][i] + e * c[3][i]) as V3;
}

/** hướng bay (radian) theo tiếp tuyến mặt phẳng của đường tại t; đứng yên → `fallback` */
export function curveHeading(c: Curve, t: number, fallback: number): number {
  const a = bezier(c, Math.max(0, t - 0.02));
  const b = bezier(c, Math.min(1, t + 0.02));
  const dx = b[0] - a[0];
  const dz = b[2] - a[2];
  return Math.hypot(dx, dz) < 1e-4 ? fallback : Math.atan2(dx, dz);
}

const off = (p: V3, h: number, ahead: number, up: number, right = 0): V3 => {
  const [fx, fz] = forwardOf(h);
  const [rx, rz] = rightOf(h);
  return [p[0] + fx * ahead + rx * right, p[1] + up, p[2] + fz * ahead + rz * right];
};

/** Sà xuống đáp ở `pad` (độ cao `y`), hướng `heading`: tới từ phía trước-trên, vòng lại đáp quay mặt theo `heading`. */
export function arriveCurve(pad: XZ, y: number, heading: number): Curve {
  const p: V3 = [pad[0], y, pad[1]];
  return [off(p, heading, 16, 12, 6), off(p, heading, 9, 7, 3), off(p, heading, -3, 2.5), p];
}

/** Cất cánh từ `pad`: vút lên phía trước. */
export function takeoffCurve(pad: XZ, y: number, heading: number): Curve {
  const p: V3 = [pad[0], y, pad[1]];
  return [p, off(p, heading, 5, 2), off(p, heading, 16, 9), off(p, heading, 34, 24)];
}

/** Hạ cánh xuống `pad`: lượn từ bên phải-trên bay ngang qua trước camera (thấy dáng hạc nghiêng), đáp ở bãi. */
export function landCurve(pad: XZ, y: number, heading: number): Curve {
  const p: V3 = [pad[0], y, pad[1]];
  return [off(p, heading, 8, 24, 30), off(p, heading, 4, 11, 15), off(p, heading, 0.5, 2.5, 4), p];
}

/** Bay đi sau khi thả người: lên cao về phía trước rồi khuất. */
export function leaveCurve(pad: XZ, y: number, heading: number): Curve {
  const p: V3 = [pad[0], y, pad[1]];
  return [p, off(p, heading, 4, 2.5), off(p, heading, 14, 12, 4), off(p, heading, 40, 36, 12)];
}

/** Cung nhảy từ `a` tới `b` (k 0 → 1), đỉnh cao hơn điểm cao hơn `h` m. */
export function jumpArc(a: V3, b: V3, k: number, h = 0.9): V3 {
  const t = clamp01(k);
  const top = Math.max(a[1], b[1]) + h;
  // parabol qua a (t=0), b (t=1), đỉnh ~ top
  const y = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * (2 * top - (a[1] + b[1]) / 2) + t * t * b[1];
  return [a[0] + (b[0] - a[0]) * t, y, a[2] + (b[2] - a[2]) * t];
}

/** Êm hai đầu. */
export const ease = (t: number): number => {
  const k = clamp01(t);
  return k * k * (3 - 2 * k);
};
/** Chậm dần cuối (đáp). */
export const easeOut = (t: number): number => 1 - (1 - clamp01(t)) ** 2;

export const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/**
 * Camera khúc cất cánh: từ chỗ camera đang ở (`from`), lùi dần ra sau lưng chéo 30° và nâng lên, nhìn theo hạc.
 * `k` 0 → 1 trong khúc.
 */
export function departCamera(from: V3, crane: V3, heading: number, k: number): V3 {
  const side = Math.sin((30 * Math.PI) / 180);
  const back = off(crane, heading, -9, 4.5, 9 * side);
  return lerp3(from, back, ease(k));
}

/** Camera khúc bay (nhìn ngang ¾ từ bên phải, hạc ở 1/3 dưới màn): vị trí + điểm nhìn quanh hạc. */
export function flightCamera(crane: V3, heading: number, sway: number): { pos: V3; look: V3 } {
  return { pos: off(crane, heading, 3.2, 1.6 + sway * 0.25, 7.5), look: off(crane, heading, 0.6, 1.9, 0) };
}

/**
 * Camera khúc hạ cánh: đứng sẵn gần bãi đáp nhìn lên hạc đang hạ (`a` < `camBack`), rồi trượt về `home` (vị trí camera
 * sau lưng của trò chơi lúc xuất hiện).
 */
export function landCamera(home: { pos: V3; look: V3 }, crane: V3, rider: V3, k: number): { pos: V3; look: V3 } {
  // lùi xa hơn camera thường 6 m, cao thêm 2,5 m — thấy cả hạc sải cánh lẫn chỗ đáp
  const bx = home.pos[0] - home.look[0];
  const bz = home.pos[2] - home.look[2];
  const n = Math.hypot(bx, bz) || 1;
  const watch = { pos: [home.pos[0] + (bx / n) * 6, home.pos[1] + 2.5, home.pos[2] + (bz / n) * 6] as V3, look: lerp3(crane, rider, 0.4) };
  return { pos: lerp3(watch.pos, home.pos, ease(k)), look: lerp3(watch.look, home.look, ease(k)) };
}

/** Khoảng cách mặt phẳng hai điểm. */
export const distXZ = (a: XZ, b: XZ): number => Math.hypot(a[0] - b[0], a[1] - b[1]);

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
