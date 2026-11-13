/**
 * Trà lâu 茶樓 (`tra-lau`, bản mẫu design/source/TienIch-kien-truc.dc.html): hai tầng, 3 gian. Tầng 1 mở hết mặt
 * tiền (chỉ cột) — đi vào ngồi được: 3 bàn trà + đôn, quầy trà sát tường sau. Hiên lửng (腰檐) giữa hai tầng; tầng 2
 * lùi vào, hành lang có lan can gỗ quanh; mái yết sơn; biển giữa tầng 2; đèn lồng góc hiên. Cờ 茶 là `props` riêng.
 */
import type * as THREE from 'three';
import type { BuildingSpec } from '../spec';
import { addBeamBand, addLanterns, addRailing, addSign, hk, type Style } from './chi_tiet';
import { columnXs } from './dien';
import { teaTable } from './do_pho';
import { box, column } from './hinh';
import { gableHipRoof, skirt } from './mai';
import type { LocalBox } from './noi_that';
import { frontRamp, type Shell } from './vao_trong';

/** Nền thấp (m) — một bậc; dốc trước mặt tiền dài `RAMP` để bước lên. */
const PLAT = 0.3;
const RAMP = 0.9;
const WALL = 0.25;
/** Hành lang tầng 2 rộng bao nhiêu (tầng 2 lùi vào so với tầng 1). */
const GALLERY = 0.9;

export function traLau(g: THREE.Group, b: BuildingSpec, style: Style, fade: THREE.Group): Shell {
  const { w, d } = b;
  const k = hk(style);
  const h1 = 2.4 * k;
  const h2 = 2 * k;
  const pillar = b.pillarColor ?? style.pillar;
  const trim = b.trim ?? style.ridge;
  const boxes: LocalBox[] = [];

  /* ---------- tầng 1: nền, sàn, tường sau + bên, cột mặt tiền ---------- */
  g.add(box(w + 0.6, PLAT, d + 0.6, style.base, 0, PLAT / 2, 0));
  g.add(box(w + 0.6, PLAT / 2, RAMP, style.base, 0, PLAT / 4, (d + 0.6) / 2 + RAMP / 2)); // bậc
  g.add(box(w - 0.4, 0.04, d - 0.4, style.floor, 0, PLAT + 0.02, 0));
  g.add(box(w, h1, WALL, style.wall, 0, PLAT + h1 / 2, -d / 2 + WALL / 2));
  boxes.push({ x: 0, z: -d / 2 + WALL / 2, w, d: 0.3, h: Infinity });
  for (const s of [-1, 1]) {
    g.add(box(WALL, h1, d, style.wall, s * (w / 2 - WALL / 2), PLAT + h1 / 2, 0));
    boxes.push({ x: s * (w / 2 - WALL / 2), z: 0, w: 0.3, d, h: Infinity });
  }
  const xs = columnXs(w, w / 3);
  const circles = xs.map((x) => ({ x, z: d / 2 - 0.3, r: 0.28 }));
  for (const c of circles) g.add(column(0.22, h1, pillar, c.x, PLAT, c.z));

  // quầy trà sát tường sau + bàn trà giữa mỗi gian
  g.add(box(w * 0.45, 0.95, 0.7, style.timber, 0, PLAT + 0.475, -d / 2 + 1.1));
  g.add(box(w * 0.45, 0.06, 0.8, style.floor, 0, PLAT + 0.98, -d / 2 + 1.1));
  boxes.push({ x: 0, z: -d / 2 + 1.1, w: w * 0.45, d: 0.8 });
  for (let i = 0; i < xs.length - 1; i++) boxes.push(teaTable(g, (xs[i] + xs[i + 1]) / 2, 0.6, PLAT));

  /* ---------- sàn lầu, hiên lửng, tầng 2 (mờ khi ở trong) ---------- */
  const y1 = PLAT + h1;
  fade.add(box(w + 0.4, 0.3, d + 0.4, style.timber, 0, y1 + 0.15, 0));
  skirt(fade, y1 - 0.75, w + 2.2, d + 2.2, w + 0.3, d + 0.3, 0.75, b.roofColor);
  const uw = w - 2 * GALLERY;
  const ud = d - 2 * GALLERY;
  const yf = y1 + 0.3;
  fade.add(box(uw, h2, ud, style.wall, 0, yf + h2 / 2, 0));
  // cửa song tầng 2: khung gỗ mỗi gian, gian giữa để tối (cửa mở)
  const uxs = columnXs(uw, uw / 3);
  for (let i = 0; i < uxs.length - 1; i++) {
    const cx = (uxs[i] + uxs[i + 1]) / 2;
    const bw = uxs[i + 1] - uxs[i] - 0.5;
    const open = i === 1;
    fade.add(box(bw, h2 - 0.9, 0.08, open ? style.timber : style.floor, cx, yf + h2 / 2 + 0.1, ud / 2 + 0.05));
    if (!open) for (const f of [-0.25, 0, 0.25]) fade.add(box(0.06, h2 - 0.9, 0.12, style.timber, cx + bw * f, yf + h2 / 2 + 0.1, ud / 2 + 0.07));
  }
  addRailing(fade, w + 0.4, d + 0.4, yf, 0, { ...style, base: style.timber });
  for (const x of xs) fade.add(column(0.15, h2, pillar, x, yf, (d + 0.4) / 2 - 0.25));
  const y2 = yf + h2;
  addBeamBand(fade, w, d, y2, style);
  gableHipRoof(fade, { y: y2 + 0.5, w, d, over: 1.4, h: 2.2 * k, color: b.roofColor, ridgeColor: trim });
  addSign(fade, b.title, yf + h2 * 0.78, ud / 2 + 0.12, 0.8);
  const hw = w / 2 + 1.6;
  const hd = d / 2 + 1.6;
  addLanterns(fade, [[-hw, y2 + 0.2, hd], [hw, y2 + 0.2, hd]], style);

  return {
    boxes,
    circles,
    pads: [
      { x: 0, z: 0, w: w + 0.6, d: d + 0.6, y: PLAT },
      frontRamp(w + 0.6, (d + 0.6) / 2, RAMP, PLAT),
    ],
    floor: { x: 0, z: 0, w: w - 0.6, d: d - 0.6 },
  };
}
