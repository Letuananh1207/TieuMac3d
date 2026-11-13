/**
 * Tàng Thư Các 藏書閣 (`lau-sach`, bản mẫu design/source/TienIch-kien-truc.dc.html): lầu sách dài và thấp, hai tầng,
 * 6 gian (số chẵn như Thiên Nhất Các); ngói theo `roofColor` (đen), bờ nóc + viền mép mái theo `trim` (lục — đen là
 * thuỷ, như Văn Uyên Các), cột theo `pillarColor` (lục). Tầng 1 vào được qua hai gian giữa: kệ sách + án đọc (nội thất
 * thư viện); nền đá có lan can + bậc như giảng đường. Hiên lửng giữa hai tầng; không treo đèn lồng (lầu sách kỵ lửa).
 */
import type * as THREE from 'three';
import type { BuildingSpec } from '../spec';
import { addBeamBand, addDoors, addRailing, addSign, addSteps, hk, STEP_DEPTH, stepCount, type Style } from './chi_tiet';
import { columnXs, hallFloor } from './dien';
import { box, column } from './hinh';
import { gableHipRoof, skirt } from './mai';
import { addInterior, type LocalBox } from './noi_that';
import type { Shell } from './vao_trong';

const BAYS = 6;
const STEP_W = 4;
const RAIL_GAP = 4.4;
const WALL = 0.25;

/** Viền mép mái: 4 thanh màu `trim` quanh mép hiên `bw` × `bd` ở `y`. */
function eaveTrim(g: THREE.Group, y: number, bw: number, bd: number, trim: string): void {
  for (const s of [-1, 1]) {
    g.add(box(bw, 0.14, 0.18, trim, 0, y, (s * bd) / 2));
    g.add(box(0.18, 0.14, bd, trim, (s * bw) / 2, y, 0));
  }
}

export function lauSach(g: THREE.Group, b: BuildingSpec, style: Style, fade: THREE.Group): Shell {
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
  const furnished = addInterior(g, b, style, 'thu-vien', plat, '');

  /* ---------- trần, hiên lửng, tầng 2, mái (mờ khi ở trong) ---------- */
  const y1 = plat + h1;
  addBeamBand(fade, w, d, y1 - 0.5, style);
  fade.add(box(w, 0.3, d, style.timber, 0, y1 + 0.15, 0));
  skirt(fade, y1 - 0.4, w + 3, d + 3, w + 0.2, d + 0.2, 0.9, b.roofColor);
  eaveTrim(fade, y1 - 0.38, w + 3, d + 3, trim);
  const uw = w - 0.6;
  const ud = d - 0.6;
  const yf = y1 + 0.5;
  fade.add(box(uw, h2, ud, style.wall, 0, yf + h2 / 2, 0));
  const uxs = columnXs(uw, uw / BAYS);
  for (let i = 0; i < BAYS; i++) {
    const cx = (uxs[i] + uxs[i + 1]) / 2;
    const bw = uxs[i + 1] - uxs[i] - 0.5;
    fade.add(box(bw, h2 - 0.8, 0.08, style.floor, cx, yf + h2 / 2, ud / 2 + 0.05));
    for (const f of [-0.25, 0, 0.25]) fade.add(box(0.06, h2 - 0.8, 0.12, style.timber, cx + bw * f, yf + h2 / 2, ud / 2 + 0.07));
  }
  for (const x of uxs) fade.add(column(0.17, h2, pillar, x, yf, ud / 2 - 0.1));
  const y2 = yf + h2;
  addBeamBand(fade, uw, ud, y2, style);
  const over = 1.6;
  gableHipRoof(fade, { y: y2 + 0.5, w: uw, d: ud, over, h: 2.6 * k, color: b.roofColor, ridgeColor: trim });
  eaveTrim(fade, y2 + 0.52, uw + 2 * over, ud + 2 * over, trim);
  addSign(fade, b.title, yf + h2 * 0.5, ud / 2 + 0.14, 0.9);

  /* ---------- va chạm + nền đi được (như giảng đường vào được, cửa = 2 gian giữa) ---------- */
  const boxes: LocalBox[] = [
    { x: 0, z: -pd / 2 + 0.15, w: pw, d: 0.3 },
    { x: -pw / 2 + 0.15, z: 0, w: 0.3, d: pd },
    { x: pw / 2 - 0.15, z: 0, w: 0.3, d: pd },
    ...[-1, 1].map((s) => ({ x: (s * (pw / 2 + RAIL_GAP / 2)) / 2, z: pd / 2 - 0.15, w: pw / 2 - RAIL_GAP / 2, d: 0.3 })),
    { x: 0, z: -id / 2 + 0.125, w: iw, d: 0.3, h: Infinity },
    { x: -iw / 2 + 0.125, z: 0, w: 0.3, d: id, h: Infinity },
    { x: iw / 2 - 0.125, z: 0, w: 0.3, d: id, h: Infinity },
    { x: (-iw / 2 + gapL) / 2, z: id / 2, w: gapL + iw / 2, d: 0.3, h: Infinity },
    { x: (gapR + iw / 2) / 2, z: id / 2, w: iw / 2 - gapR, d: 0.3, h: Infinity },
    ...furnished.boxes,
  ];
  const run = stepCount(style) * STEP_DEPTH;
  return {
    boxes,
    circles,
    pads: [
      { x: 0, z: 0, w: pw, d: pd, y: plat },
      { x: 0, z: pd / 2 + run / 2, w: STEP_W, d: run, y: plat, ramp: { axis: 'z', at0: pd / 2, at1: pd / 2 + run, y1: 0 } },
    ],
    floor: { x: 0, z: 0, w: iw - 0.3, d: id - 0.3 },
  };
}
