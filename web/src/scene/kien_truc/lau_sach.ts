/**
 * Tàng Thư Các 藏書閣 (`lau-sach`, bản mẫu design/source/TienIch-kien-truc.dc.html): lầu sách dài và thấp, hai tầng,
 * 6 gian (số chẵn như Thiên Nhất Các); ngói theo `roofColor` (đen), bờ nóc + viền mép mái theo `trim` (lục — đen là
 * thuỷ, như Văn Uyên Các), cột theo `pillarColor` (lục). Tầng 1 vào được qua hai gian giữa: kệ sách + án đọc (nội thất
 * thư viện); nền đá có lan can + bậc như giảng đường. Hiên lửng giữa hai tầng; không treo đèn lồng (lầu sách kỵ lửa).
 * Lên được tầng 2 (R-VA-3) bằng thang thẳng ngoài trời dọc đầu hồi phải (`cau_thang.ts`, L-6); tầng 2 mở bốn phía (chỉ cột +
 * lan can thấp), 8 án thư tự học ngồi được (R-VA-4).
 */
import type * as THREE from 'three';
import type { BuildingSpec } from '../spec';
import { addBeamBand, addDoors, addRailing, addSign, addSteps, hk, STEP_DEPTH, stepCount, type Style } from './chi_tiet';
import { columnXs, hallFloor } from './dien';
import { box, column } from './hinh';
import { gableHipRoof, skirt } from './mai';
import { addStairs, gapForBridge, stairLayout, type StairLayout } from './cau_thang';
import { addInterior, type LocalBox } from './noi_that';
import type { Shell } from './vao_trong';

const BAYS = 6;
const STEP_W = 4;
const RAIL_GAP = 4.4;
const WALL = 0.25;
/** Án thư tự học tầng 2 (R-VA-4): rộng × sâu × cao, toạ độ tâm (x theo hàng, z theo hai hàng), bồ đoàn cách tâm án về bắc */
const DESK_W = 1.2;
const DESK_D = 0.6;
const DESK_H = 0.4;
const DESK_XS = [-6.5, -3.5, -0.5, 2.5];
const DESK_ROWS = [-1.9, 1.6];
const SEAT_GAP = 0.7;
const DESK_WOOD = '#3a2418';
const PAGE = '#efe6cf';
const CUSHION = '#8a3b2c';
const RAIL_WOOD = '#5a3a24';
const RAIL_H = 0.9;

/** Lan can gỗ thấp tầng 2 từ (xa, za) tới (xb, zb): tay vịn, thanh dưới, song đứng mỗi ~0,5 m. */
export function upperRail(g: THREE.Group, xa: number, za: number, xb: number, zb: number, y: number): void {
  const len = Math.hypot(xb - xa, zb - za);
  const alongX = Math.abs(xb - xa) > Math.abs(zb - za);
  const mx = (xa + xb) / 2;
  const mz = (za + zb) / 2;
  for (const [h, t] of [
    [RAIL_H, 0.1],
    [0.12, 0.08],
  ]) {
    g.add(alongX ? box(len, t, t, RAIL_WOOD, mx, y + h, mz) : box(t, t, len, RAIL_WOOD, mx, y + h, mz));
  }
  const n = Math.max(2, Math.round(len / 0.5));
  for (let i = 1; i < n; i++) {
    const f = i / n;
    g.add(box(0.05, RAIL_H - 0.12, 0.05, RAIL_WOOD, xa + (xb - xa) * f, y + 0.12 + (RAIL_H - 0.12) / 2, za + (zb - za) * f));
  }
}

/** Án thư thấp (ngồi xếp bằng) tâm (x, z): mặt án, 4 chân, sách mở; bồ đoàn phía bắc. */
function studyDesk(g: THREE.Group, x: number, z: number, y: number): void {
  g.add(box(DESK_W, 0.06, DESK_D, DESK_WOOD, x, y + DESK_H - 0.03, z));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.06, DESK_H - 0.06, 0.06, DESK_WOOD, x + sx * (DESK_W / 2 - 0.08), y + (DESK_H - 0.06) / 2, z + sz * (DESK_D / 2 - 0.08)));
  for (const s of [-1, 1]) {
    const page = box(0.28, 0.02, 0.38, PAGE, x + s * 0.15, y + DESK_H + 0.02, z);
    page.rotation.z = -s * 0.12;
    g.add(page);
  }
  g.add(column(0.34, 0.12, CUSHION, x, y, z - SEAT_GAP));
}

/** Viền mép mái: 4 thanh màu `trim` quanh mép hiên `bw` × `bd` ở `y`. */
function eaveTrim(g: THREE.Group, y: number, bw: number, bd: number, trim: string): void {
  for (const s of [-1, 1]) {
    g.add(box(bw, 0.14, 0.18, trim, 0, y, (s * bd) / 2));
    g.add(box(0.18, 0.14, bd, trim, (s * bw) / 2, y, 0));
  }
}

/** Sàn tầng 2 (m, từ chân nhà) và thang ngoài đầu hồi phải — dùng chung cho dựng + test. */
export function lauSachStairs(b: BuildingSpec, style: Style): StairLayout {
  const yf = hallFloor(style) + 3 * hk(style) + 0.5;
  const iw = b.w - 0.8;
  const id = b.d - 0.8;
  // ngoài mép hiên lửng (rộng w + 3) · chiếu nghỉ trước mặt trong tường sau để cầu nối không vướng tường
  return stairLayout({ xWall: b.w / 2 + 1, clear: 0.7, zBack: -id / 2 + 0.3, yTop: yf, floorX: iw / 2 });
}

export function lauSach(g: THREE.Group, b: BuildingSpec, style: Style, fade: THREE.Group, fadeLow: THREE.Group): Shell {
  const { w, d } = b;
  const k = hk(style);
  const plat = hallFloor(style);
  const h1 = 3 * k;
  const h2 = 2.2 * k;
  const pillar = b.pillarColor ?? style.pillar;
  const trim = b.trim ?? style.ridge;
  const pw = w + 2;
  const pd = d + 2;
  const iw = w - 0.8;
  const id = d - 0.8;

  /* ---------- nền, bậc, lan can, sàn, tường ---------- */
  g.add(box(pw, plat, pd, style.base, 0, plat / 2, 0));
  addSteps(g, STEP_W, pd / 2, plat, style, stepCount(style));
  addRailing(g, pw, pd, plat, RAIL_GAP, style);
  g.add(box(iw, 0.05, id, style.floor, 0, plat + 0.025, 0));
  g.add(box(iw, h1, WALL, style.wall, 0, plat + h1 / 2, -id / 2 + WALL / 2));
  for (const s of [-1, 1]) g.add(box(WALL, h1, id, style.wall, s * (iw / 2 - WALL / 2), plat + h1 / 2, 0));

  /* ---------- 6 gian: cột lục, cửa song 4 gian bên, 2 gian giữa mở ---------- */
  const xs = columnXs(w, w / BAYS);
  const circles: Shell['circles'] = [];
  for (const x of xs) {
    for (const z of [-d / 2 + 0.3, d / 2 - 0.3]) g.add(column(0.22, h1, pillar, x, plat, z));
    circles.push({ x, z: d / 2 - 0.3, r: 0.27 });
  }
  const zDoor = (d - 0.8) / 2 + 0.07;
  addDoors(g, xs.slice(0, 3), plat, h1, zDoor, style, 2);
  addDoors(g, xs.slice(BAYS - 2), plat, h1, zDoor, style, 2);
  const gapL = xs[2];
  const gapR = xs[4];
  const y1 = plat + h1;
  const yf = y1 + 0.5;
  const stairs = lauSachStairs(b, style);
  const furnished = addInterior(g, b, style, 'thu-vien', plat, '');
  addStairs(g, stairs, style);

  /* ---------- trần, hiên lửng, tầng 2, mái (mờ khi ở trong; sàn + tường tầng 2 hiện khi đứng trên tầng 2) ---------- */
  addBeamBand(fade, w, d, y1 - 0.5, style);
  fadeLow.add(box(w, yf - y1, d, style.timber, 0, (y1 + yf) / 2, 0));
  skirt(fade, y1 - 0.4, w + 3, d + 3, w + 0.2, d + 0.2, 0.9, b.roofColor);
  eaveTrim(fade, y1 - 0.38, w + 3, d + 3, trim);
  const uw = w - 0.6;
  const ud = d - 0.6;
  // tầng 2 mở bốn phía: chỉ cột + lan can thấp giữa các cột (R-VA-3); hiện khi đứng trên tầng 2, mờ khi ở tầng 1
  const uxs = columnXs(uw, uw / BAYS);
  const cx = uw / 2 - 0.3; // hàng cột hồi
  const cz = ud / 2 - 0.1; // hàng cột trước / sau
  for (const x of uxs) for (const z of [-cz, cz]) fadeLow.add(column(0.17, h2, pillar, x, yf, z));
  for (const s of [-1, 1]) fadeLow.add(column(0.17, h2, pillar, s * cx, yf, 0));
  for (let i = 0; i < BAYS; i++) for (const z of [-cz, cz]) upperRail(fadeLow, uxs[i], z, uxs[i + 1], z, yf);
  for (const s of [-1, 1]) for (const [za, zb] of [[s > 0 ? stairs.zTop : -cz, 0], [0, cz]]) upperRail(fadeLow, s * cx, za, s * cx, zb, yf); // hồi phải: chừa lối ra cầu nối
  // 8 án thư thấp + bồ đoàn (R-VA-4): người ngồi phía bắc án, nhìn về nam
  const seats: NonNullable<Shell['seats']> = [];
  const deskBoxes: LocalBox[] = [];
  for (const dz of DESK_ROWS) {
    for (const dx of DESK_XS) {
      studyDesk(fadeLow, dx, dz, yf);
      seats.push({ x: dx, z: dz - SEAT_GAP, y: yf, rotY: 0 });
      deskBoxes.push({ x: dx, z: dz, w: DESK_W, d: DESK_D, minY: yf - 0.4 });
    }
  }
  const y2 = yf + h2;
  addBeamBand(fade, uw, ud, y2, style);
  const over = 1.6;
  gableHipRoof(fade, { y: y2 + 0.5, w: uw, d: ud, over, h: 2.6 * k, color: b.roofColor, ridgeColor: trim });
  eaveTrim(fade, y2 + 0.52, uw + 2 * over, ud + 2 * over, trim);
  addSign(fade, b.title, yf + h2 - 0.55, cz + 0.2, 0.9);

  /* ---------- va chạm + nền đi được (như giảng đường vào được, cửa = 2 gian giữa) ---------- */
  const boxes: LocalBox[] = [
    { x: 0, z: -pd / 2 + 0.15, w: pw, d: 0.3 },
    { x: -pw / 2 + 0.15, z: 0, w: 0.3, d: pd },
    ...gapForBridge({ x: pw / 2 - 0.15, z: 0, w: 0.3, d: pd }, stairs),
    ...[-1, 1].map((s) => ({ x: (s * (pw / 2 + RAIL_GAP / 2)) / 2, z: pd / 2 - 0.15, w: pw / 2 - RAIL_GAP / 2, d: 0.3 })),
    { x: 0, z: -id / 2 + 0.125, w: iw, d: 0.3, h: Infinity },
    { x: -iw / 2 + 0.125, z: 0, w: 0.3, d: id, h: Infinity },
    ...gapForBridge({ x: iw / 2 - 0.125, z: 0, w: 0.3, d: id, h: Infinity }, stairs), // cầu nối tầng 2 đi qua đầu tường
    { x: (-iw / 2 + gapL) / 2, z: id / 2, w: gapL + iw / 2, d: 0.3, h: Infinity },
    { x: (gapR + iw / 2) / 2, z: id / 2, w: iw / 2 - gapR, d: 0.3, h: Infinity },
    // nội thất tầng 1 chỉ chặn người ở tầng 1
    ...furnished.boxes.map((f) => ({ ...f, maxY: plat + 1.5 })),
    // tầng 2: lan can mặt tiền (hồi + sau trùng tường tầng 1, đã chặn), án thư — chỉ chặn người ở tầng 2
    { x: 0, z: id / 2, w: iw, d: 0.3, minY: yf - 0.4 },
    ...deskBoxes,
    ...stairs.boxes,
  ];
  const run = stepCount(style) * STEP_DEPTH;
  return {
    boxes,
    circles,
    pads: [
      { x: 0, z: 0, w: pw, d: pd, y: plat },
      { x: 0, z: pd / 2 + run / 2, w: STEP_W, d: run, y: plat, ramp: { axis: 'z', at0: pd / 2, at1: pd / 2 + run, y1: 0 } },
      ...stairs.pads,
      { x: 0, z: 0, w: iw, d: id, y: yf, upper: true },
    ],
    floor: { x: 0, z: 0, w: iw - 0.3, d: id - 0.3 },
    upperY: yf - 1,
    seats,
  };
}
