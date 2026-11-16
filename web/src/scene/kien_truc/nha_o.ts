/**
 * Nhà ở 3 gian 正房 (`nha-o`) — nhà chính của "Nhà của ta" (R-NHA-1): một tầng, nền thấp + dốc trước, tường sau +
 * hồi kín, mặt trước gian giữa để cửa mở (đi vào được), hai gian bên tường thấp + song cửa sổ. Trong trống —
 * đồ trong nhà do người chơi đặt tự do (`decorArea`, R-NHA-2). Mái hai mái + biển `title` mờ khi ở trong.
 * `closed` (V-68): gian giữa là cửa bức bàn đóng, chặn người; mái + biển không mờ — vào trong bằng cổng sang cảnh
 * "Trong nhà" (`gian_trong.ts`, R-NHA-1).
 */
import type * as THREE from 'three';
import type { BuildingSpec } from '../spec';
import { addDoors, addLanterns, addSign, hk, type Style } from './chi_tiet';
import { box, column, windowBox } from './hinh';
import { gableRoof } from './mai';
import type { LocalBox } from './noi_that';
import { frontRamp, type Shell } from './vao_trong';

const PLAT = 0.3;
/** Mặt sàn trong nhà (nền + ván sàn) — chân đồ trang trí ô `trong` (R-NHA-2). */
export const NHA_O_FLOOR = PLAT + 0.04;
const RAMP = 0.8;
const WALL = 0.22;
/** cao cửa bức bàn gian giữa khi nhà kín */
const DOOR_H = 2.3;
/** độ lùi ô cửa tối của nhà kín */
const DOOR_DEPTH = 0.6;
/** giấy dán song cửa sổ (chi tiết hình dạng, như màu đồ đạc ở `noi_that.ts`) */
const PAPER = '#efe4c8';

/** Số đo mặt tiền của nhà ở (toạ độ nhà, mặt trước +z, y từ chân nhà) — model nhà (`scene/nhaModel.ts`) dán biển / đèn / tấm sáng. */
export interface NhaOFront {
  /** cao nền + cao tường (trên nền) */
  plat: number;
  h: number;
  /** rộng gian giữa (cửa) — bậc đá trước cửa cùng bề rộng */
  door: number;
  /** sâu dải bậc / dốc trước nền, mép nền trước ở z = `stepZ` */
  stepRun: number;
  stepZ: number;
  sign: { y: number; z: number; scale: number };
  lanterns: [number, number, number][];
  /** hai ô cửa sổ: tâm (x, y), cỡ, mặt ngoài tường trước ở z */
  windows: { x: number; y: number; w: number; h: number; z: number }[];
}

export function nhaOFront(b: BuildingSpec, style: Style): NhaOFront {
  const { w, d } = b;
  const h = 2.6 * hk(style);
  const door = w / 3;
  const side = (w - door) / 2;
  const cx = door / 2 + side / 2;
  return {
    plat: PLAT,
    h,
    door,
    stepRun: RAMP,
    stepZ: (d + 0.3) / 2,
    sign: { y: PLAT + h - 0.55, z: d / 2 + 0.36, scale: Math.min(0.55, w / 7) },
    lanterns: [[-door / 2, PLAT + h - 0.6, d / 2 + 0.5], [door / 2, PLAT + h - 0.6, d / 2 + 0.5]],
    windows: [-1, 1].map((s) => ({ x: s * cx, y: PLAT + 1.5, w: side - 0.3, h: 1.2, z: d / 2 })),
  };
}

/** Biển `title` + 2 đèn lồng trước hiên (của code, không thuộc model — phiếu `2026-11-16-anh-nha-ta`). */
export function nhaODecor(g: THREE.Group, b: BuildingSpec, style: Style): void {
  const f = nhaOFront(b, style);
  addSign(g, b.title, f.sign.y, f.sign.z, f.sign.scale);
  addLanterns(g, f.lanterns, style);
}

export function nhaO(g: THREE.Group, b: BuildingSpec, style: Style, fade: THREE.Group): Shell {
  const shell = nhaOBody(g, b, style, fade);
  nhaODecor(b.closed ? g : fade, b, style);
  return shell;
}

/** Nhà ở không biển / đèn lồng: hình khối + va chạm + nền (model nhà dùng va chạm, khung đo; dự phòng khi nạp lỗi). */
export function nhaOBody(g: THREE.Group, b: BuildingSpec, style: Style, fade: THREE.Group): Shell {
  const { w, d } = b;
  const k = hk(style);
  const h = 2.6 * k;
  const trim = b.trim ?? style.ridge;
  const pillar = b.pillarColor ?? style.pillar;
  const door = w / 3; // gian giữa
  const side = (w - door) / 2;
  const boxes: LocalBox[] = [];

  /* ---------- nền, sàn, tường sau + hồi ---------- */
  g.add(box(w + 0.3, PLAT, d + 0.3, style.base, 0, PLAT / 2, 0));
  g.add(box(w - 0.3, 0.04, d - 0.3, style.floor, 0, PLAT + 0.02, 0));
  g.add(box(w, h, WALL, style.wall, 0, PLAT + h / 2, -d / 2 + WALL / 2));
  boxes.push({ x: 0, z: -d / 2 + WALL / 2, w, d: 0.3, h: Infinity });
  for (const s of [-1, 1]) {
    g.add(box(WALL, h, d, style.wall, s * (w / 2 - WALL / 2), PLAT + h / 2, 0));
    boxes.push({ x: s * (w / 2 - WALL / 2), z: 0, w: 0.3, d, h: Infinity });
  }

  /* ---------- mặt trước: hai gian bên tường + song cửa sổ, gian giữa mở; 4 cột hiên ---------- */
  const zf = d / 2 - WALL / 2;
  for (const s of [-1, 1]) {
    const cx = s * (door / 2 + side / 2);
    g.add(box(side, 0.9, WALL, style.wall, cx, PLAT + 0.45, zf)); // chân tường
    g.add(box(side, h - 2.1, WALL, style.wall, cx, PLAT + h - (h - 2.1) / 2, zf)); // trên song
    g.add(windowBox(side - 0.3, 1.2, 0.08, PAPER, cx, PLAT + 1.5, zf)); // giấy dán song
    for (let i = 1; i < 4; i++) g.add(box(0.05, 1.2, 0.12, style.timber, cx - side / 2 + 0.15 + (i * (side - 0.3)) / 4, PLAT + 1.5, zf + 0.02));
    boxes.push({ x: cx, z: zf, w: side, d: 0.3, h: Infinity });
  }
  if (b.closed) {
    // nhà kín (V-68): gian giữa hai cánh cửa bức bàn hai bên, giữa là ô cửa mở tối (bóng trong nhà) lùi `DOOR_DEPTH` — bước
    // vào ô cửa là sang cảnh gian trong (cổng đi bộ); vách tối cuối ô cửa + hai cánh chặn như tường
    const leaf = door * 0.3;
    const open = door - 2 * leaf;
    for (const s of [-1, 1]) {
      const edge = s * (door / 2);
      addDoors(g, s < 0 ? [edge, edge + leaf] : [edge - leaf, edge], PLAT, DOOR_H, zf, style, 1);
      boxes.push({ x: s * (door / 2 - leaf / 2), z: zf, w: leaf, d: 0.3, h: Infinity });
      g.add(box(0.05, DOOR_H, DOOR_DEPTH, style.ridge, s * (open / 2), PLAT + DOOR_H / 2, zf - DOOR_DEPTH / 2)); // má cửa tối
    }
    g.add(box(open, DOOR_H, 0.05, style.ridge, 0, PLAT + DOOR_H / 2, zf - DOOR_DEPTH));
    g.add(box(open, 0.05, DOOR_DEPTH, style.ridge, 0, PLAT + DOOR_H, zf - DOOR_DEPTH / 2));
    boxes.push({ x: 0, z: zf - DOOR_DEPTH, w: open, d: 0.3, h: Infinity });
    g.add(box(door, h - DOOR_H, WALL, style.wall, 0, PLAT + DOOR_H + (h - DOOR_H) / 2, zf));
  }
  for (const x of [-w / 2, -door / 2, door / 2, w / 2]) g.add(column(0.15, h, pillar, x, PLAT, d / 2 + 0.2, 8));
  g.add(box(w + 0.2, 0.26, 0.26, style.timber, 0, PLAT + h - 0.13, d / 2 + 0.2)); // xà hiên

  /* ---------- mái (mờ khi ở trong; nhà kín: không mờ — gộp chung khối nhà); biển + đèn: `nhaODecor` ---------- */
  const top = b.closed ? g : fade;
  gableRoof(top, { y: PLAT + h, w, d: d + 0.6, over: 0.6, h: 1.5 * k, color: b.roofColor, ridgeColor: trim });

  return {
    boxes,
    // cột hiên: hai cột giữa chừa cửa rộng `door`
    circles: [-w / 2, -door / 2, door / 2, w / 2].map((x) => ({ x, z: d / 2 + 0.2, r: 0.2 })),
    pads: [
      { x: 0, z: 0, w: w + 0.3, d: d + 0.3, y: PLAT },
      frontRamp(door, (d + 0.3) / 2, RAMP, PLAT),
    ],
    floor: { x: 0, z: 0, w: w - 0.6, d: d - 0.6 },
  };
}
