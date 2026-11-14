/**
 * Nhà ở 3 gian 正房 (`nha-o`) — nhà chính của "Nhà của ta" (R-NHA-1): một tầng, nền thấp + dốc trước, tường sau +
 * hồi kín, mặt trước gian giữa để cửa mở (đi vào được), hai gian bên tường thấp + song cửa sổ. Trong trống —
 * đồ trong nhà do người chơi đặt vào ô `decorSlots` loại `trong` (R-NHA-2). Mái hai mái + biển `title` mờ khi ở trong.
 */
import type * as THREE from 'three';
import type { BuildingSpec } from '../spec';
import { addLanterns, addSign, hk, type Style } from './chi_tiet';
import { box, column } from './hinh';
import { gableRoof } from './mai';
import type { LocalBox } from './noi_that';
import { frontRamp, type Shell } from './vao_trong';

const PLAT = 0.3;
const RAMP = 0.8;
const WALL = 0.22;
/** giấy dán song cửa sổ (chi tiết hình dạng, như màu đồ đạc ở `noi_that.ts`) */
const PAPER = '#efe4c8';

export function nhaO(g: THREE.Group, b: BuildingSpec, style: Style, fade: THREE.Group): Shell {
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
    g.add(box(side - 0.3, 1.2, 0.08, PAPER, cx, PLAT + 1.5, zf)); // giấy dán song
    for (let i = 1; i < 4; i++) g.add(box(0.05, 1.2, 0.12, style.timber, cx - side / 2 + 0.15 + (i * (side - 0.3)) / 4, PLAT + 1.5, zf + 0.02));
    boxes.push({ x: cx, z: zf, w: side, d: 0.3, h: Infinity });
  }
  for (const x of [-w / 2, -door / 2, door / 2, w / 2]) g.add(column(0.15, h, pillar, x, PLAT, d / 2 + 0.2, 8));
  g.add(box(w + 0.2, 0.26, 0.26, style.timber, 0, PLAT + h - 0.13, d / 2 + 0.2)); // xà hiên

  /* ---------- mái + biển (mờ khi ở trong) ---------- */
  gableRoof(fade, { y: PLAT + h, w, d: d + 0.6, over: 0.6, h: 1.5 * k, color: b.roofColor, ridgeColor: trim });
  addSign(fade, b.title, PLAT + h - 0.55, d / 2 + 0.36, Math.min(0.55, w / 7));
  addLanterns(fade, [[-door / 2, PLAT + h - 0.6, d / 2 + 0.5], [door / 2, PLAT + h - 0.6, d / 2 + 0.5]], style);

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
