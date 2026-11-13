/**
 * Cầu thang lên tầng 2 (Tàng Thư Các, trà lâu — R-VA-3), toạ độ nhà (mặt trước nhìn +z). L-6 (2026-11-13): thang cũ gấp
 * khúc hai vế trong gian hẹp có tường → khó lái, quay đầu ở chiếu nghỉ, camera sau lưng bị tường + sàn che. Nay: **thang
 * thẳng một vế ngoài trời** dọc đầu hồi bên phải, cách tường một khe (ngoài mép mái hiên lửng): đi từ mặt đất phía trước
 * thẳng về sau (−z), lên chiếu nghỉ sát mép sau nền, rẽ trái qua cầu nối vào sàn tầng 2. Sau lưng người leo là trời → camera
 * thoáng. `stairLayout` = toán thuần (tấm đi được, vật cản theo độ cao) để test; `addStairs` dựng khối.
 */
import * as THREE from 'three';
import type { Style } from './chi_tiet';
import { box } from './hinh';
import type { LocalBox } from './noi_that';
import type { LocalPad } from './vao_trong';

/** rộng vế · sâu chiếu nghỉ / cầu nối · dốc (≤ 35°, R-VA-2) · cao bậc */
const WIDTH = 1.8;
const LANDING = 1.8;
const SLOPE_DEG = 30;
const RISE = 0.18;
/** lan can tay vịn cao bao nhiêu trên mặt bậc / sàn; dày cầu nối */
const RAIL_H = 0.9;
const RAIL = '#5a3a24';
const BRIDGE = 0.3;
/** cầu nối lấn vào trong mép nền bao nhiêu (phủ khe giữa mép sàn tầng 2 và thang) */
const BRIDGE_IN = 0.15;
/** vào thang dài bao nhiêu thì chân đã cao hơn mức "người dưới đất" (hộp chặn gầm thang chỉ chặn người dưới đất) */
const FOOT = 1.5;
const GROUND_ONLY = 0.3;

export interface StairInput {
  /** mặt ngoài nền nhà ở đầu hồi phải (x) */
  xWall: number;
  /** khe từ mặt ngoài nền tới mép trong thang (để thang nằm ngoài mép mái hiên) */
  clear: number;
  /** mép sau nền nhà (z) — chiếu nghỉ sát đây */
  zBack: number;
  /** mặt sàn tầng 2 (m, từ chân nhà; chân thang ở mặt đất y = 0) */
  yTop: number;
  /** mép sàn tầng 2 đi được phía hồi phải (x) — cầu nối chạy từ đây ra chiếu nghỉ */
  floorX: number;
}

export interface StairLayout {
  /** vế thang: x từ `x0` (mép trong, phía nhà) tới `x1` (mép ngoài) */
  x0: number;
  x1: number;
  /** chân thang (mặt đất) · đỉnh vế = mép trước chiếu nghỉ · mép sau chiếu nghỉ */
  zStart: number;
  zTop: number;
  zBack: number;
  yTop: number;
  /** dài vế (m) */
  run: number;
  xWall: number;
  floorX: number;
  /** tấm đi được (tầng trên): vế, chiếu nghỉ, cầu nối */
  pads: LocalPad[];
  /** vật cản (có khoảng cao): gầm thang (người dưới đất), lan can hai bên vế, lan can chiếu nghỉ + cầu nối */
  boxes: LocalBox[];
}

/** Dốc vế (độ) — test kiểm ≤ 35°. */
export const flightSlope = (l: StairLayout): number => (Math.atan(l.yTop / l.run) * 180) / Math.PI;

export function stairLayout(o: StairInput): StairLayout {
  const x0 = o.xWall + o.clear;
  const x1 = x0 + WIDTH;
  const xc = (x0 + x1) / 2;
  const zBack = o.zBack;
  const zTop = zBack + LANDING;
  const run = o.yTop / Math.tan((SLOPE_DEG * Math.PI) / 180);
  const zStart = zTop + run;
  const zl = (zBack + zTop) / 2;
  const pads: LocalPad[] = [
    { x: xc, z: (zTop + zStart) / 2, w: WIDTH, d: run, y: 0, ramp: { axis: 'z', at0: zStart, at1: zTop, y1: o.yTop }, upper: true },
    { x: xc, z: zl, w: WIDTH, d: LANDING, y: o.yTop, upper: true },
    { x: (o.floorX + x0) / 2, z: zl, w: x0 - o.floorX, d: LANDING, y: o.yTop, upper: true },
  ];
  const top = o.yTop - 0.4;
  const boxes: LocalBox[] = [
    // gầm thang + khe giữa thang và nhà: chặn người dưới đất (người trên thang đã cao hơn sau `FOOT` m)
    { x: (o.xWall + x1) / 2, z: (zBack + zStart - FOOT) / 2, w: x1 - o.xWall, d: zStart - FOOT - zBack, maxY: GROUND_ONLY },
    // lan can hai bên vế (người trên thang không rơi ra ngoài / xuống khe)
    { x: x1 + 0.05, z: (zBack + zStart) / 2, w: 0.1, d: zStart - zBack, minY: GROUND_ONLY + 0.1 },
    { x: x0 - 0.05, z: (zTop + zStart) / 2, w: 0.1, d: run, minY: GROUND_ONLY + 0.1 },
    // chiếu nghỉ + cầu nối: lan can phía sau, mép trước cầu nối (trên khe)
    { x: (o.floorX + x1) / 2, z: zBack - 0.05, w: x1 - o.floorX, d: 0.1, minY: top },
    { x: (o.xWall + x0) / 2, z: zTop + 0.05, w: x0 - o.xWall, d: 0.1, minY: top },
  ];
  return { x0, x1, zStart, zTop, zBack, yTop: o.yTop, run, xWall: o.xWall, floorX: o.floorX, pads, boxes };
}

/**
 * Hộp tường / lan can chạy dọc z ở đầu hồi phải (`b`, tâm x, tâm z = 0 hoặc bất kỳ) → tách chỗ cầu nối đi qua: đoạn đó
 * chỉ chặn người thấp hơn sàn tầng 2 (`maxY`), hai đoạn còn lại giữ nguyên.
 */
export function gapForBridge(b: LocalBox, l: StairLayout): LocalBox[] {
  const z0 = b.z - b.d / 2;
  const z1 = b.z + b.d / 2;
  const g0 = Math.max(z0, l.zBack);
  const g1 = Math.min(z1, l.zTop);
  if (g1 <= g0) return [b];
  const part = (a: number, c: number, extra: Partial<LocalBox> = {}): LocalBox => ({ ...b, z: (a + c) / 2, d: c - a, ...extra });
  const out: LocalBox[] = [];
  if (g0 > z0) out.push(part(z0, g0));
  out.push(part(g0, g1, { maxY: l.yTop - 0.4 }));
  if (z1 > g1) out.push(part(g1, z1));
  return out;
}

/** Tay vịn nghiêng từ (x, yA, zA) tới (x, yB, zB) (cao `RAIL_H` trên mặt bậc), cột mỗi ~1,2 m. */
function slopedRail(g: THREE.Group, x: number, zA: number, yA: number, zB: number, yB: number): void {
  const len = Math.hypot(zB - zA, yB - yA);
  const r = box(0.08, 0.08, len, RAIL, x, (yA + yB) / 2 + RAIL_H, (zA + zB) / 2);
  r.rotation.x = -Math.atan2(yB - yA, zB - zA);
  g.add(r);
  const n = Math.max(1, Math.round(Math.abs(zB - zA) / 1.2));
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    g.add(box(0.1, RAIL_H, 0.1, RAIL, x, yA + (yB - yA) * f + RAIL_H / 2, zA + (zB - zA) * f));
  }
}

/** Lan can thẳng ngang ở độ cao sàn `y` từ (xa, za) tới (xb, zb): tay vịn, thanh dưới, cột hai đầu. */
function flatRail(g: THREE.Group, xa: number, za: number, xb: number, zb: number, y: number): void {
  const w = Math.max(0.08, Math.abs(xb - xa));
  const d = Math.max(0.08, Math.abs(zb - za));
  for (const h of [RAIL_H, 0.35]) g.add(box(w, 0.08, d, RAIL, (xa + xb) / 2, y + h, (za + zb) / 2));
  for (const [x, z] of [
    [xa, za],
    [xb, zb],
  ]) {
    g.add(box(0.1, RAIL_H, 0.1, RAIL, x, y + RAIL_H / 2, z));
  }
}

/**
 * Dựng thang ngoài trời vào `g` (luôn hiện — không mờ theo tầng): bậc đá khối liền từ mặt đất, chiếu nghỉ đá, cầu nối gỗ
 * (từ mặt ngoài nền tới chiếu nghỉ — phần trên nền là sàn tầng 2 của nhà), lan can gỗ.
 */
export function addStairs(g: THREE.Group, l: StairLayout, style: Style): void {
  const xc = (l.x0 + l.x1) / 2;
  const n = Math.max(2, Math.round(l.yTop / RISE));
  const t = l.run / n;
  for (let i = 0; i < n; i++) {
    const top = (i + 0.5) * (l.yTop / n); // mặt bậc giữa dốc đi được: lệch tối đa nửa bậc
    g.add(box(WIDTH, top, t, style.base, xc, top / 2, l.zStart - (i + 0.5) * t));
  }
  g.add(box(WIDTH, l.yTop, LANDING, style.base, xc, l.yTop / 2, (l.zBack + l.zTop) / 2));
  const zl = (l.zBack + l.zTop) / 2;
  // cầu nối gỗ: từ hơi lấn vào trong mép nền (phủ kín chỗ nối với sàn tầng 2 — L-6) tới chiếu nghỉ; mặt thấp hơn sàn
  // một chút để chỗ chồng lên sàn không nhấp nháy
  const xa = l.xWall - BRIDGE_IN;
  g.add(box(l.x0 - xa + 0.05, BRIDGE, LANDING, style.timber, (xa + l.x0 + 0.05) / 2, l.yTop - BRIDGE / 2 - 0.005, zl));
  slopedRail(g, l.x1 - 0.05, l.zStart, 0, l.zTop, l.yTop);
  slopedRail(g, l.x0 + 0.05, l.zStart, 0, l.zTop, l.yTop);
  flatRail(g, l.x1 - 0.05, l.zTop, l.x1 - 0.05, l.zBack + 0.05, l.yTop);
  flatRail(g, l.xWall, l.zBack + 0.05, l.x1 - 0.05, l.zBack + 0.05, l.yTop);
  flatRail(g, l.xWall, l.zTop + 0.05, l.x0 + 0.05, l.zTop + 0.05, l.yTop);
}
