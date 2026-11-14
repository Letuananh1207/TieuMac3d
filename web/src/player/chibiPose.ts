/**
 * Dáng của nhân vật chibi (`chibiCharacter.ts`) — hàm thuần, không three: góc từng khớp theo pha bước và độ hoà các
 * trạng thái của `CharacterState` (chạy R-DIEU-5, nhảy R-DIEU-6, ngồi xếp bằng / chào R-DIEU-7, đứng lâu R-DIEU-8).
 * Mỗi dáng là một bộ góc đích; dáng cuối = dáng đi / đứng, lần lượt nội suy tuyến tính sang nhảy → ngồi → chào →
 * vươn vai theo độ hoà 0..1 (độ hoà đã mượt sẵn — controller / `chibiCharacter.ts`), nên chuyển dáng không giật.
 * Ngồi: tay cầm hai đầu cuộn sách Ngồi ôn ở đúng chỗ `cuonSach.ts` đặt nó (`CUON_CAO`, `CUON_TRUOC`).
 */
import { CUON_CAO, CUON_NUA_NGANG, CUON_TRUOC } from '../scene/cuonSachNhip';

/** Khớp vai trong khung thân (m): (±x, y, 0). */
export const SHOULDER_X = 0.25;
export const SHOULDER_Y = 1.1;
/** Vai → tâm bàn tay (m), dọc −y của khớp tay. */
export const ARM_LEN = 0.6;
/** Góc dang tay chữ A khi đứng (rad, quanh z của vai). */
export const ARM_A = 0.62;
/** Khớp hông (m) trong khung `facing`. */
export const HIP_X = 0.15;
export const HIP_Y = 0.36;
/** Ngồi xếp bằng: thân hạ xuống (m) — như nhân vật cũ / camera (`orbitCamera.ts` SIT_DROP 0,3); gấu áo lún nhẹ vào đệm. */
export const SIT_DROP = 0.28;
/** Bán kính bàn tay (m) — tay cầm ngoài đầu trục cuộn chừng này. */
const HAND_R = 0.075;
/** Độ cao điểm xoay khi cúi / đổ người (m) — quanh hông: gấu áo không văng ra sau. */
export const LEAN_Y = 0.45;

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Góc một tay: `z` dang (quanh z của vai, dương = ra ngoài với tay phía +x), `x` vung (âm = đưa ra trước). */
export interface ArmPose {
  z: number;
  x: number;
}

/** Góc một chân (Euler thứ tự ZXY: x gập trước / sau, z dang) + dời khớp hông (ngồi: hạ xuống, đưa ra trước). */
export interface LegPose {
  x: number;
  z: number;
  posY: number;
  posZ: number;
}

export interface ChibiPose {
  /** thân: dời (y, z) + cúi `rx` / xoay `ry` — cúi quanh hông (`LEAN_Y`), không quanh gấu áo */
  body: { y: number; z: number; rx: number; ry: number };
  head: Vec3;
  /** [0] = tay phía −x, [1] = tay phía +x (theo thứ tự dựng `for s of [-1, 1]`) */
  arms: [ArmPose, ArmPose];
  legs: [LegPose, LegPose];
}

/** Độ hoà các trạng thái, 0..1 (đã mượt), + pha bước. */
export interface PoseMix {
  /** cường độ bước (đi bộ hết tốc = 1) */
  move: number;
  /** đi bộ → chạy */
  run: number;
  air: number;
  sit: number;
  bow: number;
  /** vươn vai (R-DIEU-8) */
  stretch: number;
  /** nhìn quanh: −1..1 (hướng quay đầu) */
  look: number;
  /** pha bước (rad) */
  walkT: number;
  /** đồng hồ (s) — thở, đầu nghiêng khi đứng */
  time: number;
}

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
/** nhanh dần rồi chậm dần (smoothstep), kẹp 0..1 */
export const ease = (x: number): number => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/**
 * Động tác khi đứng lâu (R-DIEU-8, như `glbCharacter.ts`): sau 6 s đứng yên, mỗi 8 s một lần, xen kẽ vươn vai rồi nhìn
 * quanh; mỗi lần 2,5 s. `stretch` 0 → 1 → 0, `look` −1..1 (quay sang một bên rồi bên kia).
 */
export function idleAction(idle: number): { stretch: number; look: number } {
  if (idle <= 6) return { stretch: 0, look: 0 };
  const c = (idle - 6) % 8;
  if (c >= 2.5) return { stretch: 0, look: 0 };
  if (Math.floor((idle - 6) / 8) % 2 === 0) return { stretch: Math.sin((Math.PI * c) / 2.5), look: 0 };
  return { stretch: 0, look: Math.sin((2 * Math.PI * c) / 2.5) };
}

/**
 * Góc để tay (khớp vai: dang `z` rồi vung `x`) chỉ theo hướng `d` (khung thân). Tay nghỉ chỉ −y; sau khi xoay:
 * hướng = (cos x · sin z, −cos x · cos z, −sin x).
 */
export function aimArm(d: Vec3): ArmPose {
  const len = Math.hypot(d.x, d.y, d.z) || 1;
  const nz = d.z / len;
  return { x: -Math.asin(Math.max(-1, Math.min(1, nz))), z: Math.atan2(d.x / len, -d.y / len) };
}

/** Tâm bàn tay (khung thân) của tay phía `s` (−1 / +1) với góc `a` — để kiểm `aimArm`. */
export function handAt(s: -1 | 1, a: ArmPose): Vec3 {
  return {
    x: s * SHOULDER_X + ARM_LEN * Math.cos(a.x) * Math.sin(a.z),
    y: SHOULDER_Y - ARM_LEN * Math.cos(a.x) * Math.cos(a.z),
    z: -ARM_LEN * Math.sin(a.x),
  };
}

/** Chỗ đặt tay phía `s` khi cầm cuộn (khung thân của người đang ngồi — thân hạ `SIT_DROP`). */
export function scrollGrip(s: -1 | 1): Vec3 {
  return { x: s * (CUON_NUA_NGANG + HAND_R * 0.8), y: CUON_CAO + SIT_DROP, z: CUON_TRUOC };
}

const towards = (s: -1 | 1, p: Vec3): ArmPose => aimArm({ x: p.x - s * SHOULDER_X, y: p.y - SHOULDER_Y, z: p.z });
const SIDES = [-1, 1] as const;
/** ngồi: hai tay cầm hai đầu cuộn sách trước ngực */
const SIT_ARMS = SIDES.map((s) => towards(s, scrollGrip(s)));
/** chào 拱手: hai tay chắp trước ngực, ống tay chạm nhau */
const BOW_ARMS = SIDES.map((s) => towards(s, { x: s * 0.06, y: 0.98, z: 0.46 }));

/**
 * Ngồi xếp bằng: ống chân nằm ngang bắt chéo trước bụng, ủng thò ra dưới gấu áo, mũi ủng hướng ra trước. Chân xoay
 * Euler thứ tự ZXY (như vai rồi tay) nên dùng chung `aimArm`.
 */
const SIT_LEGS = SIDES.map((s) => aimArm({ x: -s * 0.85, y: -0.1, z: 0.5 }));

/** Dáng mọi khớp theo độ hoà trạng thái. */
export function chibiPose(m: PoseMix): ChibiPose {
  const step = Math.sin(m.walkT);
  const still = (1 - m.move) * (1 - m.sit) * (1 - m.air);
  const t = m.time;

  /* ---- đi / chạy / đứng ---- */
  const legAmp = (0.6 + 0.3 * m.run) * m.move;
  const armAmp = (0.55 + 0.4 * m.run) * m.move;
  const body = {
    z: 0,
    y: Math.abs(step) * (0.05 + 0.06 * m.run) * m.move * (1 - m.air) + Math.sin(t * 2) * 0.01 * still,
    rx: (0.05 + 0.2 * m.run) * m.move, // đi hơi đổ người, chạy đổ hẳn về trước
    ry: step * (0.08 + 0.06 * m.run) * m.move,
  };
  const head: Vec3 = {
    x: Math.sin(t * 0.7) * 0.03 * still - 0.1 * m.run * m.move, // chạy: ngẩng lại nhìn trước
    y: -step * 0.06 * m.move,
    z: Math.sin(t * 1.1) * 0.05 * still,
  };
  const arms = SIDES.map((s, i) => ({
    z: ARM_A * s,
    x: s * step * armAmp + Math.sin(t * 1.6 + i) * 0.05 * still,
  })) as [ArmPose, ArmPose];
  const legs = SIDES.map((s) => ({ x: -s * step * legAmp, z: 0, posY: HIP_Y, posZ: 0 })) as [LegPose, LegPose];

  /* ---- nhảy: gối trước co lên, chân sau duỗi; tay giang cao giữ thăng bằng ---- */
  const air = (a: ArmPose, s: -1 | 1): void => {
    a.z = lerp(a.z, 1.1 * s, m.air);
    a.x = lerp(a.x, -0.25, m.air);
  };
  air(arms[0], -1);
  air(arms[1], 1);
  legs[0].x = lerp(legs[0].x, -0.9, m.air);
  legs[1].x = lerp(legs[1].x, 0.35, m.air);
  body.rx = lerp(body.rx, 0.1, m.air);

  /* ---- ngồi xếp bằng: thân hạ, hai chân gập ra trước, ống chân bắt chéo; tay cầm cuộn, cúi nhìn ---- */
  body.y = lerp(body.y, -SIT_DROP, m.sit);
  body.rx = lerp(body.rx, 0.04, m.sit);
  body.ry = lerp(body.ry, 0, m.sit);
  head.x = lerp(head.x, 0.2, m.sit);
  SIDES.forEach((s, i) => {
    const a = arms[i];
    a.z = lerp(a.z, SIT_ARMS[i].z, m.sit);
    a.x = lerp(a.x, SIT_ARMS[i].x, m.sit);
    const l = legs[i];
    l.x = lerp(l.x, SIT_LEGS[i].x, m.sit);
    l.z = lerp(l.z, SIT_LEGS[i].z, m.sit);
    // hai ống chân chéo nhau: chân phía −x nằm trên, trước một chút
    l.posY = lerp(l.posY, HIP_Y - SIT_DROP + (s < 0 ? 0.1 : 0.05), m.sit);
    l.posZ = lerp(l.posZ, s < 0 ? 0.34 : 0.3, m.sit);
  });

  /* ---- chào: chắp tay trước ngực, cúi người, gật đầu ---- */
  body.rx = lerp(body.rx, 0.25, m.bow);
  head.x = lerp(head.x, 0.18, m.bow);
  SIDES.forEach((_, i) => {
    arms[i].z = lerp(arms[i].z, BOW_ARMS[i].z, m.bow);
    arms[i].x = lerp(arms[i].x, BOW_ARMS[i].x, m.bow);
  });

  /* ---- đứng lâu: vươn vai (hai tay giơ cao, ngửa ra sau, nhón lên), nhìn quanh ---- */
  SIDES.forEach((s, i) => {
    arms[i].z = lerp(arms[i].z, 2.75 * s, m.stretch);
    arms[i].x = lerp(arms[i].x, 0.1, m.stretch);
  });
  body.rx = lerp(body.rx, -0.08, m.stretch);
  body.y += 0.03 * m.stretch;
  head.x = lerp(head.x, -0.3, m.stretch);
  head.y += m.look * 0.6;
  body.ry += m.look * 0.12;

  // nhóm thân xoay quanh gốc (chân) → dời bù để điểm LEAN_Y đứng yên khi cúi
  body.y += LEAN_Y * (1 - Math.cos(body.rx));
  body.z = -LEAN_Y * Math.sin(body.rx);
  return { body, head, arms, legs };
}
