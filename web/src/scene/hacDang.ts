/**
 * Dáng đứng của hạc model (L-22) — thuần, mọi góc quay quanh trục x (như three: quay θ làm góc véc-tơ (dz, dy) giảm θ).
 * - Thân ngẩng `STAND.pitch` quanh hông (chân mọc ở phía đuôi → ngẩng để thân dồn về sau, trên hai chân).
 * - Chân khuỵu kiểu chim: bàn chân đặt dưới khoảng giữa thân (giữa bàn chân ngay dưới chỗ ngồi), hông hạ để chỗ ngồi cao
 *   `STAND.seat`; gối gập ra sau (giải hai đoạn hông → gối → cổ chân), bàn chân nằm ngang chạm y = 0.
 * - Cổ ngẩng lên (`NECK.angle` so với mặt đất), đầu gập lại giữ mỏ hướng trước hơi chúc → cổ cong chữ S nhẹ.
 * `s` 0 (bay — mọi góc 0, đúng dáng model) → 1 (đứng); `squat` nhún (hông hạ thêm, thân chúi, bàn chân giữ chỗ).
 */
import { angleOf, FOOT_TILT, wrap, type CraneLegs } from './hacChan';
import type { CraneNeck } from './hacCo';

/** pitch (rad, mũi ngẩng) · seat: chỗ ngồi cao (m, toạ độ hạc chưa nhân scale) · squat: hông hạ thêm khi nhún (m) */
export const STAND = { pitch: 0.38, seat: 2.08, squat: 0.25, squatPitch: 0.3 };
/** cổ khi đứng: hướng gốc cổ → khớp đầu so với mặt đất (rad) · đầu chúc · nhúc nhích lúc chờ (biên độ rad, nhịp) */
export const NECK = { angle: 1.15, headDown: 0.12, sway: 0.05, swaySpeed: 1.3 };

export interface StandPose {
  /** xương gốc (thân): quay quanh x + dời (y, z) */
  pitch: number;
  dy: number;
  dz: number;
  /** quay quanh x so với xương cha: hông (cha = thân) · gối (cha = hông) · cổ chân (cha = gối) */
  hip: number;
  knee: number;
  foot: number;
}

/** quay (y, z) quanh x góc θ như three */
export const rot = (y: number, z: number, t: number): [number, number] => [y * Math.cos(t) - z * Math.sin(t), y * Math.sin(t) + z * Math.cos(t)];

const dist = (a: [number, number], b: [number, number]): number => Math.hypot(a[0] - b[0], a[1] - b[1]);

/**
 * Dáng chân + thân. `seat` = chỗ ngồi lúc bay (y, z). Đứng hẳn (`s` = 1): giữa bàn chân ngay dưới chỗ ngồi, chỗ ngồi cao
 * `STAND.seat` (chân không với tới → hông hạ cho tới khi với tới).
 */
export function standPose(L: CraneLegs, seat: [number, number], s: number, squat = 0): StandPose {
  // (z, y)
  const H: [number, number] = [L.hip[2], L.hip[1]];
  const K: [number, number] = [L.knee[2], L.knee[1]];
  const A: [number, number] = [L.ankle[2], L.ankle[1]];
  const T: [number, number] = [L.toe[2], L.toe[1]];
  const a = dist(H, K);
  const b = dist(K, A);
  const q = squat * s;
  // chỗ ngồi so với hông khi đứng (chưa nhún) → chỗ đặt bàn chân, độ cao hông
  const [sy, sz] = rot(seat[0] - H[1], seat[1] - H[0], -STAND.pitch);
  const ankle: [number, number] = [H[0] + sz - dist(A, T) / 2, L.footDrop];
  const hip: [number, number] = [H[0], STAND.seat - sy - q * STAND.squat];
  const reach = (a + b) * 0.98;
  const dz = ankle[0] - hip[0];
  if (Math.hypot(dz, hip[1] - ankle[1]) > reach) hip[1] = ankle[1] + Math.sqrt(Math.max(0, reach * reach - dz * dz));
  // hai đoạn: gối nằm sau đường hông → cổ chân (gối chim gập ra sau)
  const d = Math.max(Math.abs(a - b) * 1.02 + 1e-6, Math.min(dist(hip, ankle), a + b - 1e-6));
  const phi = angleOf(ankle[0] - hip[0], ankle[1] - hip[1]);
  const alpha = Math.acos(Math.min(1, Math.max(-1, (a * a + d * d - b * b) / (2 * a * d))));
  const up = phi - alpha;
  const knee: [number, number] = [hip[0] + a * Math.cos(up), hip[1] + a * Math.sin(up)];
  const low = angleOf(ankle[0] - knee[0], ankle[1] - knee[1]);
  const tu = s * wrap(angleOf(K[0] - H[0], K[1] - H[1]) - up);
  const tl = s * wrap(angleOf(A[0] - K[0], A[1] - K[1]) - low);
  const tf = s * wrap(angleOf(T[0] - A[0], T[1] - A[1]) + FOOT_TILT);
  const pitch = -STAND.pitch * s + q * STAND.squatPitch;
  const hz = H[0] + (hip[0] - H[0]) * s;
  const hy = H[1] + (hip[1] - H[1]) * s;
  const [ry, rz] = rot(H[1], H[0], pitch);
  return { pitch, dy: hy - ry, dz: hz - rz, hip: tu - pitch, knee: tl - tu, foot: tf - tl };
}

/** Điểm (y, z) của thân sau dáng `p` (vd. chỗ ngồi). */
export function bodyPoint(p: StandPose, y: number, z: number): [number, number] {
  const [ry, rz] = rot(y, z, p.pitch);
  return [ry + p.dy, rz + p.dz];
}

/**
 * Góc xương cổ (cha = thân) + xương đầu (cha = cổ) khi đứng: cổ hướng `NECK.angle` so với mặt đất, đầu về đúng hướng lúc
 * bay rồi chúc `NECK.headDown`. `t` giây — cổ nhúc nhích nhẹ lúc đứng chờ.
 */
export function neckPose(N: CraneNeck, bodyPitch: number, s: number, t = 0): { neck: number; head: number } {
  const rest = angleOf(N.head[2] - N.base[2], N.head[1] - N.base[1]);
  const sway = Math.sin(t * NECK.swaySpeed) * NECK.sway * s;
  const total = s * wrap(rest - NECK.angle) + sway;
  return { neck: total - bodyPitch, head: s * NECK.headDown - total - sway * 0.5 };
}
