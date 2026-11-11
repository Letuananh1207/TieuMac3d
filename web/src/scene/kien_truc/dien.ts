/**
 * Điện (`dien`) và giảng đường (`giang-duong`) theo bản mẫu `design/source/PhongCach-KienTruc.dc.html`:
 * nền đá trắng có bậc + lan can, cột son, cửa bức bàn, dải xà lục – lam – chấm vàng.
 * Điện: mái hiên kép (hiên dưới vươn 3,5 m, thân trên, mái yết sơn); giảng đường: một tầng mái yết sơn.
 * Chiều cao nền, cột, thân, mái nhân `buildingStyle.heightScale` (`hk`); bậc, lan can, biển, đèn lồng giữ cỡ người.
 */
import * as THREE from 'three';
import type { BuildingSpec } from '../spec';
import { addBeamBand, addDoors, addLanterns, addRailing, addSign, addSteps, hk, stepCount, type Style } from './chi_tiet';
import { box, column } from './hinh';
import { cornerTips, gableHipRoof, skirt } from './mai';

/** Vị trí cột dọc chiều rộng `w`, khoảng `spacing` m. */
export function columnXs(w: number, spacing: number): number[] {
  const n = Math.max(2, Math.round(w / spacing));
  return Array.from({ length: n + 1 }, (_, i) => -w / 2 + 0.3 + (i * (w - 0.6)) / n);
}

/** Nhà vào được: mái + tường trước tách thành hai nhóm để làm mờ khi người chơi ở trong (R-HUD-2). */
export interface RoomParts {
  roof: THREE.Group;
  front: THREE.Group;
}

/** Độ cao nền đá giảng đường (sàn trong nhà) theo hệ số chiều cao: 0,6 m × hệ số. */
export const hallFloor = (style: Style): number => 0.6 * hk(style);

/** Nền + thân một tầng (cột, cửa, tường, xà). `room` = nhà rỗng có cửa giữa. Trả về độ cao đỉnh dải xà. */
function hallBody(g: THREE.Group, b: BuildingSpec, style: Style, plat: number, margin: number, colH: number, room?: RoomParts): number {
  const { w, d } = b;
  const pw = w + 2 * margin;
  const pd = d + 2 * margin;
  g.add(box(pw, plat, pd, style.base, 0, plat / 2, 0));
  addSteps(g, 4, pd / 2, plat, style, stepCount(style));
  addRailing(g, pw, pd, plat, 4.4, style);
  const iw = w - 0.8;
  const id = d - 0.8;
  if (!room) g.add(box(iw, colH, id, style.wall, 0, plat + colH / 2, 0));
  else {
    // nhà rỗng: sàn gỗ, tường sau + hai tường bên dày 0,25; mặt trước là các tấm cửa (addDoors), gian giữa để trống
    const t = 0.25;
    g.add(box(iw, 0.05, id, style.floor, 0, plat + 0.025, 0));
    g.add(box(iw, colH, t, style.wall, 0, plat + colH / 2, -id / 2 + t / 2));
    for (const s of [-1, 1]) g.add(box(t, colH, id, style.wall, s * (iw / 2 - t / 2), plat + colH / 2, 0));
  }
  const xs = columnXs(w, 2.5);
  for (const x of xs) {
    // nhà vào được: hàng cột trước mờ cùng tường trước (không che camera trong nhà)
    for (const z of [-d / 2 + 0.3, d / 2 - 0.3]) (room && z > 0 ? room.front : g).add(column(0.2, colH, style.pillar, x, plat, z));
  }
  const open = room ? Math.floor((xs.length - 1) / 2) : -1;
  addDoors(room ? room.front : g, xs, plat, colH, (d - 0.8) / 2 + 0.07, style, 3, open);
  addBeamBand(room ? room.roof : g, w, d, plat + colH, style);
  return plat + colH + 0.5;
}

export function giangDuong(g: THREE.Group, b: BuildingSpec, style: Style, room?: RoomParts): void {
  const k = hk(style);
  const y = hallBody(g, b, style, hallFloor(style), 1, 3.2 * k, room);
  const top = room ? room.roof : g;
  gableHipRoof(top, { y, w: b.w, d: b.d, over: 1.8, h: 2.6 * k, color: b.roofColor, ridgeColor: style.ridge });
  addSign(top, b.title, y - 1.05, b.d / 2 - 0.05);
  const hw = b.w / 2 + 1.5;
  const hd = b.d / 2 + 1.5;
  addLanterns(top, [[-hw, y - 0.45, hd], [hw, y - 0.45, hd]], style);
}

export function dien(g: THREE.Group, b: BuildingSpec, style: Style): void {
  const { w, d } = b;
  const k = hk(style);
  const y = hallBody(g, b, style, 1 * k, 1.5, 3.6 * k);
  // hiên dưới: rộng hơn thân 3,5 m mỗi bên, dốc lên tới chân thân trên
  const uw = w * 0.75;
  const ud = d * 0.65;
  const lowH = 1.3 * k;
  skirt(g, y, w + 7, d + 7, uw + 0.4, ud + 0.4, lowH, b.roofColor);
  cornerTips(g, y, w / 2 + 3.4, d / 2 + 3.4, style.ridge, 1.3);
  // thân trên + xà + mái yết sơn
  const y2 = y + lowH - 0.4;
  const upH = 1.6 * k;
  g.add(box(uw, upH, ud, style.wall, 0, y2 + upH / 2, 0));
  addBeamBand(g, uw, ud, y2 + upH, style);
  gableHipRoof(g, { y: y2 + upH + 0.5, w: uw, d: ud, over: 1.5, h: 2.4 * k, color: b.roofColor, ridgeColor: style.ridge });
  addSign(g, b.title, y2 + upH / 2 + 0.05, ud / 2 + 0.06, 1.1);
  const hw = w / 2 + 3.2;
  const hd = d / 2 + 3.2;
  addLanterns(g, [[-hw, y - 0.35, hd], [hw, y - 0.35, hd]], style);
}
