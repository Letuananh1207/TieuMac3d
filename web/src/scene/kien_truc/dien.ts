/**
 * Điện (`dien`) và giảng đường (`giang-duong`) theo bản mẫu `design/source/PhongCach-KienTruc.dc.html`:
 * nền đá trắng có bậc + lan can, cột son, cửa bức bàn, dải xà lục – lam – chấm vàng.
 * Điện: mái hiên kép (hiên dưới vươn 3,5 m, thân trên, mái yết sơn); giảng đường: một tầng mái yết sơn.
 */
import type * as THREE from 'three';
import type { BuildingSpec } from '../spec';
import { addBeamBand, addDoors, addLanterns, addRailing, addSign, addSteps, type Style } from './chi_tiet';
import { box, column } from './hinh';
import { cornerTips, gableHipRoof, skirt } from './mai';

/** Vị trí cột dọc chiều rộng `w`, khoảng `spacing` m. */
function columnXs(w: number, spacing: number): number[] {
  const n = Math.max(2, Math.round(w / spacing));
  return Array.from({ length: n + 1 }, (_, i) => -w / 2 + 0.3 + (i * (w - 0.6)) / n);
}

/** Nền + thân một tầng (cột, cửa, tường, xà). Trả về độ cao đỉnh dải xà. */
function hallBody(g: THREE.Group, b: BuildingSpec, style: Style, plat: number, margin: number, colH: number): number {
  const { w, d } = b;
  const pw = w + 2 * margin;
  const pd = d + 2 * margin;
  g.add(box(pw, plat, pd, style.base, 0, plat / 2, 0));
  addSteps(g, 4, pd / 2, plat, style);
  addRailing(g, pw, pd, plat, 4.4, style);
  g.add(box(w - 0.8, colH, d - 0.8, style.wall, 0, plat + colH / 2, 0));
  const xs = columnXs(w, 2.5);
  for (const x of xs) {
    for (const z of [-d / 2 + 0.3, d / 2 - 0.3]) g.add(column(0.2, colH, style.pillar, x, plat, z));
  }
  addDoors(g, xs, plat, colH, (d - 0.8) / 2 + 0.07, style);
  addBeamBand(g, w, d, plat + colH, style);
  return plat + colH + 0.5;
}

export function giangDuong(g: THREE.Group, b: BuildingSpec, style: Style): void {
  const colH = 3.2;
  const y = hallBody(g, b, style, 0.6, 1, colH);
  gableHipRoof(g, { y, w: b.w, d: b.d, over: 1.8, h: 2.6, color: b.roofColor, ridgeColor: style.ridge });
  addSign(g, b.title, y - 1.05, b.d / 2 - 0.05);
  const hw = b.w / 2 + 1.5;
  const hd = b.d / 2 + 1.5;
  addLanterns(g, [[-hw, y - 0.45, hd], [hw, y - 0.45, hd]], style);
}

export function dien(g: THREE.Group, b: BuildingSpec, style: Style): void {
  const { w, d } = b;
  const y = hallBody(g, b, style, 1, 1.5, 3.6);
  // hiên dưới: rộng hơn thân 3,5 m mỗi bên, dốc lên tới chân thân trên
  const uw = w * 0.75;
  const ud = d * 0.65;
  const lowH = 1.3;
  skirt(g, y, w + 7, d + 7, uw + 0.4, ud + 0.4, lowH, b.roofColor);
  cornerTips(g, y, w / 2 + 3.4, d / 2 + 3.4, style.ridge, 1.3);
  // thân trên + xà + mái yết sơn
  const y2 = y + lowH - 0.4;
  g.add(box(uw, 1.6, ud, style.wall, 0, y2 + 0.8, 0));
  addBeamBand(g, uw, ud, y2 + 1.6, style);
  gableHipRoof(g, { y: y2 + 2.1, w: uw, d: ud, over: 1.5, h: 2.4, color: b.roofColor, ridgeColor: style.ridge });
  addSign(g, b.title, y2 + 0.85, ud / 2 + 0.06, 1.1);
  const hw = w / 2 + 3.2;
  const hd = d / 2 + 3.2;
  addLanterns(g, [[-hw, y - 0.35, hd], [hw, y - 0.35, hd]], style);
}
