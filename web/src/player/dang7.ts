/**
 * Dáng riêng của nhân vật viết theo góc 7 khớp (`autoRig.ts`: hông, đầu, hai cánh tay, hai chân — không khuỷu, không gối) và
 * lớp nối sang `Pose` 18 khớp của xương chuẩn Mixamo (`dongTac.ts`, `mixamoRig.ts`). Thuần (không three).
 *
 * - Các hàm `…Dang` rút từ `glbCharacter.ts` (số giữ nguyên) — nhánh `autoRig` và nhánh Mixamo dùng chung: chào (R-DIEU-8 cũ:
 *   chắp tay), đứng lâu (R-DIEU-8: vươn vai / nhìn quanh), nhảy, ngồi, gõ mõ (R-NPC-8), gảy đàn (R-NPC-9).
 * - `tronDang7` trộn một dáng 7 khớp vào `Pose` 18 khớp (nhánh Mixamo): tay → vai (cộng lệch góc chữ A), khuỷu tuỳ chọn;
 *   cúi / xoay hông → chia cho `spine · chest · upperChest` (không đụng `hips` — Mixamo `Hips` là cha của hai chân, cúi ở đó
 *   thì cả người nghiêng như tấm ván); đầu → `neck · head`; chân → đùi + gối, bàn chân giữ bằng.
 * Quy ước góc như `bieuCamDang.ts`: tay `x` âm = đưa ra trước / lên; tay trái `z` âm = khép vào thân (tay phải ngược dấu);
 * hông `x` dương = cúi; đầu `x` âm = ngửa.
 */
import type { Euler3, Pose } from './dongTac';

/** Tay buông xuôi trong dáng 7 khớp: góc hạ từ tư thế chữ A của model Hunyuan (= `ARM_REST` cũ, `REST` của `bieuCamDang.ts`). */
export const REST = 0.4;

/** Dáng 7 khớp — trường thiếu = giữ dáng nền. */
export interface Dang7 {
  aLx?: number;
  aLz?: number;
  aRx?: number;
  aRz?: number;
  hipsX?: number;
  hipsY?: number;
  headX?: number;
  headY?: number;
  headZ?: number;
  /** nâng cả thân (m) */
  lift?: number;
  /** chân co (x âm = đùi ra trước) */
  legs?: number;
  /** khuỷu (x âm = gập cẳng tay lên / ra trước) — chỉ xương có khuỷu (Mixamo); `autoRig` / đệ tử khối bỏ qua */
  eL?: number;
  eR?: number;
  /** vai x khi có khuỷu (thay `aLx` / `aRx` — cẳng tay đã gập nên cánh tay trên ít phải giơ hơn) */
  aLxE?: number;
  aRxE?: number;
}

/** Hiệu chỉnh theo model: lệch góc chữ A (`haTay` của model − `REST`). */
export interface Cal7 {
  off: number;
}

/** Phần cúi / xoay hông chia cho ba đốt sống (tổng 1). */
export const SPINE_SPLIT: readonly [number, number, number] = [0.45, 0.35, 0.2];
/** Phần góc đầu chia cho cổ / đầu (tổng 1). */
export const HEAD_SPLIT: readonly [number, number] = [0.4, 0.6];
/** Gối gập theo đùi khi co chân (gối = −đùi × hệ số) — bàn chân bù lại cho bằng. */
const KNEE_PER_THIGH = 2;

const mix = (a: number, b: number, w: number): number => a + (b - a) * w;
const to = (e: Euler3, i: number, v: number | undefined, w: number): void => {
  if (v !== undefined) e[i] = mix(e[i], v, w);
};

/**
 * Trộn dáng 7 khớp [d] vào [pose] (tại chỗ) theo trọng số [w] (0 = không đổi). Góc tay cộng lệch `cal.off` để giữ đúng
 * hướng tay trên model có góc chữ A khác (tay buông cũ `−REST` → `−haTay`). Không đụng `hips` (cha của hai chân).
 */
export function tronDang7(pose: Pose, d: Dang7, w: number, cal: Cal7): void {
  if (!(w > 0)) return;
  const j = pose.j;
  const elbowL = d.eL !== undefined;
  const elbowR = d.eR !== undefined;
  to(j.armL, 0, elbowL ? (d.aLxE ?? d.aLx) : d.aLx, w);
  to(j.armR, 0, elbowR ? (d.aRxE ?? d.aRx) : d.aRx, w);
  if (d.aLx !== undefined || d.aLz !== undefined) to(j.armL, 1, 0, w);
  if (d.aRx !== undefined || d.aRz !== undefined) to(j.armR, 1, 0, w);
  to(j.armL, 2, d.aLz === undefined ? undefined : d.aLz - cal.off, w);
  to(j.armR, 2, d.aRz === undefined ? undefined : d.aRz + cal.off, w);
  if (elbowL) elbow(j.foreL, d.eL!, j.armL[2], w);
  if (elbowR) elbow(j.foreR, d.eR!, j.armR[2], w);
  const spine = [j.spine, j.chest, j.upperChest];
  spine.forEach((e, i) => {
    to(e, 0, d.hipsX === undefined ? undefined : d.hipsX * SPINE_SPLIT[i], w);
    to(e, 1, d.hipsY === undefined ? undefined : d.hipsY * SPINE_SPLIT[i], w);
  });
  [j.neck, j.head].forEach((e, i) => {
    to(e, 0, d.headX === undefined ? undefined : d.headX * HEAD_SPLIT[i], w);
    to(e, 1, d.headY === undefined ? undefined : d.headY * HEAD_SPLIT[i], w);
    to(e, 2, d.headZ === undefined ? undefined : d.headZ * HEAD_SPLIT[i], w);
  });
  if (d.legs !== undefined) {
    const knee = Math.max(0, -d.legs * KNEE_PER_THIGH);
    for (const [up, leg, foot] of [[j.upLegL, j.legL, j.footL], [j.upLegR, j.legR, j.footR]]) {
      to(up, 0, d.legs, w);
      to(leg, 0, knee, w);
      to(foot, 0, -(d.legs + knee), w);
    }
  }
  if (d.lift !== undefined) pose.lift += d.lift * w;
}

/**
 * Gập khuỷu [e] rad trong mặt phẳng của cánh tay: cánh tay đã khép / dạng `z` quanh trục trước — gập quanh trục x của khung
 * nhân vật thì cẳng tay quay ngang (lệch trục). Gập quanh trục x đã xoay theo `z` (Rz(−z)·Rx(e)·Rz(z)) → cẳng tay đi tiếp
 * như một cánh tay thẳng có góc trước `x + e`, cùng góc khép `z`. Trộn về góc Euler XYZ đó theo [w].
 */
function elbow(fore: Euler3, e: number, z: number, w: number): void {
  const ax = Math.cos(z);
  const ay = -Math.sin(z);
  const c = Math.cos(e);
  const s = Math.sin(e);
  const t = 1 - c;
  // ma trận xoay quanh trục (ax, ay, 0) góc e → Euler XYZ (như three.js)
  const m11 = t * ax * ax + c;
  const m12 = t * ax * ay;
  const m13 = s * ay;
  const m23 = -s * ax;
  const m33 = c;
  const y = Math.asin(Math.max(-1, Math.min(1, m13)));
  const x = Math.atan2(-m23, m33);
  const zz = Math.atan2(-m12, m11);
  to(fore, 0, x, w);
  to(fore, 1, y, w);
  to(fore, 2, zz, w);
}

/* ---------------- dáng đi / chạy cũ (L-18: nhân vật chính trả về dáng đi trước khi đổi model Tripo) ---------------- */

/** Tốc độ (m/s) — bằng `WALK_SPEED` / `RUN_SPEED` của `controller.ts` (file này thuần, không nạp controller). */
const DI_BO = 3.2;
const CHAY_HET = 7;

/** Trạng thái dáng đi cũ của một nhân vật — nhánh `autoRig` của `glbCharacter.ts` (R-DIEU-5), số giữ nguyên. */
export interface DiCu {
  /** 0…1: cường độ bước (đi bộ hết tốc = 1), mượt */
  move: number;
  /** 0…1: hoà dáng chạy */
  runB: number;
  /** 0…1: dáng nhảy */
  airB: number;
  /** pha bước (rad) */
  walkT: number;
}

export const diCuMoi = (): DiCu => ({ move: 0, runB: 0, airB: 0, walkT: 0 });

/** Tiến dáng đi cũ một khung (tại chỗ): cường độ bước, hoà chạy, nhảy, pha bước theo tốc độ thật (đi ~7,7 rad/s, chạy ~17). */
export function diCuTien(s: DiCu, dt: number, mps: number, air: boolean): DiCu {
  const k = Math.min(1, mps / DI_BO);
  const run = Math.min(1, Math.max(0, (mps - DI_BO) / (CHAY_HET - DI_BO)));
  s.move += (k - s.move) * Math.min(1, dt * 8);
  s.runB += (run - s.runB) * Math.min(1, dt * 6);
  s.airB += ((air ? 1 : 0) - s.airB) * Math.min(1, dt * 14);
  if (mps > 0.05) s.walkT += dt * (2.4 * Math.max(mps, 2.2)) * (1 - s.airB);
  else s.walkT *= 0.85;
  return s;
}

/** Góc dáng đi cũ một khung (7 khớp; phần cộng thêm vào dáng đứng). */
export interface DiCuDang {
  /** sin pha bước */
  step: number;
  /** đùi trái / phải (x âm = ra trước) — chưa trộn nhảy / ngồi */
  legL: number;
  legR: number;
  /** vung tay (cộng vào `x` tay trái / phải) */
  armL: number;
  armR: number;
  /** tay dạng ra theo bước (cộng vào độ mở `z` mỗi tay) */
  sway: number;
  /** nhún cả thân (m) */
  lift: number;
  /** đổ người về trước (rad, cả thân quanh bàn chân) */
  lean: number;
  /** hông xoay theo bước, đầu xoay ngược (rad) */
  hipsY: number;
  headY: number;
}

/** Dáng đi / chạy cũ (R-DIEU-5) từ trạng thái [s] — số chép nguyên nhánh `autoRig` của `glbCharacter.ts`. */
export function diCuDang(s: DiCu): DiCuDang {
  const { move, runB, airB } = s;
  const step = Math.sin(s.walkT);
  const amp = (0.55 + 0.35 * runB) * move;
  const swing = (0.34 + 0.45 * runB) * move;
  return {
    step,
    legL: step * amp,
    legR: -step * amp,
    armL: -step * swing,
    armR: step * swing,
    sway: Math.abs(step) * 0.07 * move,
    lift: Math.abs(step) * (0.05 + 0.06 * runB) * move * (1 - airB),
    lean: (0.05 + 0.2 * runB) * move, // đi hơi đổ người, chạy đổ hẳn về trước
    hipsY: step * (0.1 + 0.08 * runB) * move,
    headY: -step * 0.06 * move,
  };
}

/**
 * Cộng dáng đi cũ [d] (trạng thái [s]) vào [pose] 18 khớp (nhánh Mixamo của nhân vật chính, L-18). Dáng nền phải tắt phần
 * bước (`DongTac.update(…, { tuDi: true })`). Trộn với nhảy / ngồi như bản cũ: đùi + tay dạng `mix(…, NHAY7 | NGOI7, …)` →
 * nhân (1 − nhảy)(1 − ngồi); vung tay `mix(…, NGOI7, ngồi)` → nhân (1 − ngồi); hông / đầu xoay, nhún không giảm. Đổ người
 * (`d.lean`) nơi gọi xoay cả thân quanh bàn chân (như `bob.rotation.x` cũ).
 *
 * L-20: như dáng 7 khớp cũ (không gối, không khuỷu) — khi bước, gối và khuỷu duỗi thẳng (kể cả khuỷu gập khi chạy / khuỷu
 * đứng của `DongTac`): chân thẳng, cả cánh tay vung từ vai. Trọng số theo cường độ bước (đứng ↔ đi chuyển mượt), trừ lúc
 * nhảy / ngồi (dáng đó giữ gối / khuỷu của nó).
 */
export function tronDiCu(pose: Pose, s: DiCu, d: DiCuDang, sit: number): void {
  const wLeg = (1 - s.airB) * (1 - sit);
  const wArm = 1 - sit;
  const wStraight = Math.min(1, 2 * s.move) * wLeg;
  const j = pose.j;
  j.upLegL[0] += d.legL * wLeg;
  j.upLegR[0] += d.legR * wLeg;
  for (const e of [j.legL, j.legR, j.foreL, j.foreR]) for (let i = 0; i < 3; i++) e[i] *= 1 - wStraight;
  j.footL[0] -= d.legL * wLeg * 0.6;
  j.footR[0] -= d.legR * wLeg * 0.6;
  j.armL[0] += d.armL * wArm;
  j.armR[0] += d.armR * wArm;
  j.armL[2] += d.sway * wLeg;
  j.armR[2] -= d.sway * wLeg;
  j.hips[1] += d.hipsY;
  j.neck[1] += d.headY * HEAD_SPLIT[0];
  j.head[1] += d.headY * HEAD_SPLIT[1];
  pose.lift += d.lift;
}

/* ---------------- dáng riêng (số rút từ glbCharacter.ts, giữ nguyên) ---------------- */

/** Chắp tay chào (拱手): hai tay lên trước ngực, khép vào giữa; cúi người, cúi đầu. Trọng số = `bow`. */
export const CHAO = {
  aLx: -1.35,
  aRx: -1.35,
  aLz: -(REST + 0.55),
  aRz: REST + 0.55,
  hipsX: 0.28,
  headX: 0.12,
  // Mixamo: cánh tay trên ra trước vừa phải, cẳng tay gập lên ngực
  aLxE: -0.5,
  aRxE: -0.5,
  eL: -1.3,
  eR: -1.3,
} satisfies Dang7;

/** Vươn vai (R-DIEU-8): hai tay giơ cao, ngửa đầu. Trọng số = `stretch` của `dungLauDang`; chỉ đổi `z` tay + đầu. */
export const VUON_VAI = { aLz: 1.5, aRz: -1.5, headX: -0.25, eL: -0.25, eR: -0.25 } satisfies Dang7;
/** Nhìn quanh (R-DIEU-8): đầu quay tối đa (rad) — cộng vào góc đầu. */
export const NHIN_QUANH = 0.6;

/** Đứng lâu (R-DIEU-8): sau 6 s, mỗi 8 s một lần — vươn vai, rồi nhìn quanh. `stretch` 0…1, `look` −1…1. */
export function dungLauDang(idle: number): { stretch: number; look: number } {
  let stretch = 0;
  let look = 0;
  if (idle > 6) {
    const c = (idle - 6) % 8;
    const env = c < 2.5 ? Math.sin((Math.PI * c) / 2.5) : 0;
    if (Math.floor((idle - 6) / 8) % 2 === 0) stretch = env;
    else look = Math.sin((2 * Math.PI * c) / 2.5) * (c < 2.5 ? 1 : 0);
  }
  return { stretch, look };
}

/** Nhảy (7 khớp): gối trước co lên, chân sau duỗi; tay giang ra (z tuyệt đối). Trọng số = `air`. */
export const NHAY7 = { legL: -0.8, legR: 0.35, aLz: 0.15, aRz: -0.15 };

/** Ngồi thiền (7 khớp): hai chân xếp ra trước + dạng, tay đặt lên gối, cúi đầu nhẹ, hạ thân. Trọng số = `sit`. */
export const NGOI7 = { legs: -1.45, legZ: 0.45, aLx: -0.75, aRx: -0.75, aLz: -(REST + 0.1), aRz: REST + 0.1, headX: 0.15, drop: 0.3 };

/**
 * Gõ mõ (R-NPC-8): tay trái đưa mõ ra trước ngang ngực, tay phải giơ dùi cao theo `strike` (0 chạm mõ … 1 giơ cao). Đè hẳn
 * dáng tay (trọng số 1).
 */
export function goMoDang(strike: number) {
  return {
    aLx: -1.1,
    aLz: -(REST + 0.35),
    aRx: -0.9 - 0.9 * strike,
    aRz: REST + 0.25,
    // Mixamo: tay trái gập khuỷu đỡ mõ trước ngực; tay phải gập nhẹ cầm dùi
    aLxE: -0.6,
    eL: -1.0,
    eR: -0.5,
  };
}

/**
 * Gảy đàn (R-NPC-9): hai tay đưa ra trước, hạ xuống mặt đàn; tay trái nhấn dây đung đưa chậm (rung tiếng), tay phải nhấc
 * theo `pluck` (0 = vừa gảy); `time` = đồng hồ của nhân vật (s). Đè hẳn dáng tay.
 */
export function gayDanDang(pluck: number, time: number) {
  return {
    aLx: -0.95 + Math.sin(time * 2.3) * 0.05,
    aLz: -(REST + 0.28) + Math.sin(time * 1.7) * 0.03,
    aRx: -0.95 - 0.18 * pluck,
    aRz: REST + 0.28,
    aLxE: -0.85 + Math.sin(time * 2.3) * 0.05,
    aRxE: -0.85 - 0.18 * pluck,
    eL: -0.55,
    eR: -0.55 - 0.25 * pluck,
  };
}
