/**
 * Dáng hai bàn tay khi nhìn từ mắt lúc ngồi (R-DIEU-7, R-NGOI-1, R-GIAO-1) — hàm thuần, không three. `tayNgoi.ts` dựng
 * hình theo dáng tính ở đây.
 *
 * Toạ độ "thân" (m): gốc = mắt, x = bên phải người ngồi, y = lên, z = phía trước mặt (theo hướng mặt, không theo hướng
 * đang nhìn quanh — tay gắn với thân, nhìn quanh thì tay ở lại).
 * Mỗi tay: `pos` cổ tay · `palm` hướng lòng bàn tay (không cần đơn vị) · `point` ngón trỏ duỗi (0 co · 1 duỗi).
 */

export type V3 = readonly [number, number, number];

export interface HandPose {
  readonly pos: V3;
  readonly palm: V3;
  readonly point: number;
}

export interface HandsPose {
  readonly left: HandPose;
  readonly right: HandPose;
  /** tay phải cầm chén trà (R-NGOI-1) */
  readonly cup: boolean;
  /** tay phải cầm quân cờ (R-GIAO-1) */
  readonly stone: boolean;
}

/** Vai trái / phải (thân) — gốc ống tay áo. */
export const SHOULDER_L: V3 = [-0.16, -0.36, -0.04];
export const SHOULDER_R: V3 = [0.16, -0.36, -0.04];
/** Cổ tay → đầu ngón trỏ duỗi (m): gốc ngón 0,06 + ngón 0,05. */
export const FINGER = 0.11;
/** Nắm quanh một thanh (trục cuộn, lan can): cổ tay lùi sau thanh `GRIP_BACK` theo hướng cẳng tay, lệch `GRIP_OUT` khỏi
 *  thanh theo hướng ngược lòng bàn tay, thấp hơn `GRIP_DOWN` — ba ngón co móc ôm đúng thanh. */
export const GRIP_BACK = 0.075;
export const GRIP_OUT = 0.026;
export const GRIP_DOWN = 0.012;
/** Không phần nào của tay / vật cầm gần mắt hơn chừng này (near = 0,1 m — vật sát camera bị cắt). */
export const MIN_EYE_DIST = 0.18;

const DOWN: V3 = [0, -1, 0];
const IN_L: V3 = [1, 0, 0];
const IN_R: V3 = [-1, 0, 0];

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const mix = (a: V3, b: V3, t: number): V3 => add(a, scale(sub(b, a), t));
export const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3): V3 => scale(a, 1 / (len(a) || 1));
const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
const ease = (x: number): number => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/** Tay để yên trước ngực / trên gối, lòng úp (án thư, bàn trà, lan can, chưa mở cuộn). */
export function restPose(): HandsPose {
  return {
    left: { pos: [-0.17, -0.38, 0.4], palm: DOWN, point: 0 },
    right: { pos: [0.17, -0.38, 0.4], palm: DOWN, point: 0 },
    cup: false,
    stone: false,
  };
}

/**
 * Hai tay cầm hai trục cuộn sách (Ngồi ôn, bồ đoàn khu tự học — R-ON-8): `center` tâm cuộn (thân), `right` vector đơn
 * vị chiều ngang cuộn (thân), `half` nửa bề ngang giữa hai trục (m, đã nhân độ mở). Lòng bàn tay quay vào trục.
 */
export function scrollPose(center: V3, right: V3, half: number): HandsPose {
  const rodL = add(center, scale(right, -half));
  const rodR = add(center, scale(right, half));
  return {
    left: { pos: add(add(rodL, scale(right, -GRIP_OUT)), [0, -GRIP_DOWN, -GRIP_BACK]), palm: IN_L, point: 0 },
    right: { pos: add(add(rodR, scale(right, GRIP_OUT)), [0, -GRIP_DOWN, -GRIP_BACK]), palm: IN_R, point: 0 },
    cup: false,
    stone: false,
  };
}

/** Chén trà: chu kỳ (s), nâng lên uống trong bao lâu (s). */
export const TEA_CYCLE = 8;
export const TEA_SIP = 1.6;

/** Bàn trà / đôn / sập (R-NGOI-1): tay phải cầm chén trà, cứ `TEA_CYCLE` giây nâng lên một lần; `t` = giây đã ngồi. */
export function teaPose(t: number): HandsPose {
  const r = restPose();
  const k = (t % TEA_CYCLE) - (TEA_CYCLE - TEA_SIP);
  const lift = k > 0 ? Math.sin((k / TEA_SIP) * Math.PI) : 0; // 0 → 1 → 0
  const hold: V3 = [0.1, -0.34, 0.4];
  const sip: V3 = [0.05, -0.22, 0.32];
  return { ...r, right: { pos: mix(hold, sip, ease(lift)), palm: IN_R, point: 0 }, cup: true };
}

/** Án thư (R-NGOI-1): quyển sách mở ở `book` (thân) — hai tay đặt hai bên trang. */
export function bookPose(book: V3): HandsPose {
  return {
    left: { pos: add(book, [-0.2, 0.03, -0.06]), palm: DOWN, point: 0 },
    right: { pos: add(book, [0.2, 0.03, -0.06]), palm: DOWN, point: 0 },
    cup: false,
    stone: false,
  };
}

/**
 * Ghế lan can (R-VA-4): hai tay đặt lên thanh lan can ở `z` trước mắt, cao `y` (thân), lòng úp, ngón co ôm mép thanh.
 */
export function railPose(z: number, y: number): HandsPose {
  const at = (x: number): V3 => [x, y + 0.02, z - GRIP_BACK * 0.8];
  return { left: { pos: at(-0.17), palm: DOWN, point: 0 }, right: { pos: at(0.17), palm: DOWN, point: 0 }, cup: false, stone: false };
}

/**
 * Ghế lan can trà lâu sau khi tiểu nhị rót (R-TRA-1, QĐ2): tay trái vẫn trên lan can như `railPose`, tay phải cầm chén trà
 * và nâng nhấp như `teaPose` (`t` = giây kể từ lúc rót xong).
 */
export function railTeaPose(z: number, y: number, t: number): HandsPose {
  return { ...railPose(z, y), right: teaPose(t).right, cup: true };
}

/** Bàn chơi (R-GIAO-1): hai tay đặt ở `l`, `r` (thân — mép bàn phía mình / hai góc thẻ bộ thủ), lòng úp. */
export function tablePose(l: V3, r: V3): HandsPose {
  return { left: { pos: l, palm: DOWN, point: 0 }, right: { pos: r, palm: DOWN, point: 0 }, cup: false, stone: false };
}

/** Nhịp trỏ / đặt quân (giây): đưa tay tới, giữ, rút về. */
export const REACH_GO = 0.25;
export const REACH_HOLD = 0.2;
export const REACH_BACK = 0.25;
export const REACH_TOTAL = REACH_GO + REACH_HOLD + REACH_BACK;

/** Mức với tới theo giây `k` kể từ lúc chạm: 0 → 1 (đi) · 1 (giữ) · 1 → 0 (về). */
export function reachPhase(k: number): number {
  if (k <= 0 || k >= REACH_TOTAL) return 0;
  if (k < REACH_GO) return ease(k / REACH_GO);
  if (k < REACH_GO + REACH_HOLD) return 1;
  return 1 - ease((k - REACH_GO - REACH_HOLD) / REACH_BACK);
}

/**
 * Một tay với tới `target` (thân) theo mức `e` (0..1): đầu ngón trỏ chạm đúng điểm khi `e` = 1 — ngón trỏ duỗi, cổ tay
 * lùi lại `FINGER` theo hướng từ vai tới điểm. `stone` = cầm quân cờ (đặt quân — tay phải). `side` = tay nào (cuộn Tĩnh
 * toạ: ô nửa trái → tay trái, thiết kế 2026-11-16.12); tay kia giữ nguyên dáng.
 */
export function reach(base: HandsPose, target: V3, e: number, stone = false, side: 'left' | 'right' = 'right'): HandsPose {
  if (e <= 0) return base;
  const from = base[side];
  const dir = norm(sub(target, side === 'left' ? SHOULDER_L : SHOULDER_R));
  const wrist = sub(target, scale(dir, FINGER));
  const hand: HandPose = { pos: mix(from.pos, wrist, e), palm: mix(from.palm, DOWN, e), point: e };
  return side === 'left' ? { ...base, left: hand, stone } : { ...base, right: hand, stone };
}

/** Đầu ngón trỏ (thân) của tay có cổ tay `wrist` khi duỗi, theo hướng vai → cổ tay. */
export function fingertip(wrist: V3, shoulder: V3 = SHOULDER_R): V3 {
  return add(wrist, scale(norm(sub(wrist, shoulder)), FINGER));
}
