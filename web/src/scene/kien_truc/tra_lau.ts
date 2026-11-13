/**
 * Trà lâu 茶樓 (`tra-lau`, bản mẫu design/source/TienIch-kien-truc.dc.html): hai tầng, 3 gian. Tầng 1 mở hết mặt
 * tiền (chỉ cột) — đi vào ngồi được: 3 bàn trà + đôn, quầy trà sát tường sau. Lên được tầng 2 (R-VA-3) bằng thang
 * thẳng ngoài trời dọc đầu hồi phải (`cau_thang.ts`, như Tàng Thư Các — L-6); tầng 2 **mở bốn phía** — chỉ cột +
 * lan can gỗ thấp — 6 bàn trà thấp, mỗi bàn 2 bồ đoàn ngồi được (R-VA-4). Hiên lửng (腰檐) giữa hai tầng; mái yết sơn;
 * biển treo dưới xà mặt tiền tầng 2; đèn lồng góc hiên. Cờ 茶 là `props` riêng.
 */
import type * as THREE from 'three';
import type { BuildingSpec } from '../spec';
import { addBeamBand, addLanterns, addSign, hk, type Style } from './chi_tiet';
import { addStairs, gapForBridge, stairLayout, type StairLayout } from './cau_thang';
import { columnXs } from './dien';
import { teaTable } from './do_pho';
import { box, column } from './hinh';
import { upperRail } from './lau_sach';
import { gableHipRoof, skirt } from './mai';
import type { LocalBox } from './noi_that';
import { frontRamp, type Shell } from './vao_trong';

/** Nền thấp (m) — một bậc; dốc trước mặt tiền dài `RAMP` để bước lên. */
const PLAT = 0.3;
const RAMP = 0.9;
const WALL = 0.25;
/** dày sàn lầu */
const SLAB = 0.3;
/** nền nhô ra ngoài tường · sàn tầng 2 nhô ra ngoài tường · hiên lửng: vươn ra hai bên / phía hồi phải (thang) */
const PLAT_OVER = 0.3;
const SLAB_OVER = 0.2;
const EAVE_OVER = 1.1;
const EAVE_IN = 0.15;
/** Bàn trà thấp tầng 2 (ngồi bồ đoàn): cạnh, cao; bồ đoàn cách tâm bàn; hai hàng (z); bước giữa các bàn (x) */
const LOW_W = 1;
const LOW_H = 0.4;
const SEAT_GAP = 0.75;
const LOW_ROWS = [-2.3, 2.1];
const LOW_STEP = 3.6;
const LOW_PER_ROW = 3;
const CUSHION = '#8a3b2c';
const POT = '#5a3a2a';
const CUP = '#f3e6c8';

/** Số đo dùng chung cho dựng + test: nền tầng 1, sàn tầng 2 (lòng `iw` × `id`), thang ngoài đầu hồi phải. */
export function traLauLayout(
  b: BuildingSpec,
  style: Style,
): { plat: number; h1: number; yf: number; iw: number; id: number; stairs: StairLayout; slabEdge: number; eaveRight: number } {
  const h1 = 2.4 * hk(style);
  const yf = PLAT + h1 + SLAB;
  const iw = b.w - 0.55;
  const id = b.d - 0.55;
  // L-6: thang áp sát mép nền đầu hồi phải (không còn khe ~1 m nhìn xuống hiên); chiếu nghỉ trước mặt trong tường sau để
  // cầu nối không vướng tường. Hiên lửng phía hồi phải lùi vào sát tường (`eaveRight`) để không đâm vào thang.
  const stairs = stairLayout({ xWall: b.w / 2 + PLAT_OVER, clear: 0, zBack: -id / 2 + 0.05, yTop: yf, floorX: iw / 2 });
  return { plat: PLAT, h1, yf, iw, id, stairs, slabEdge: b.w / 2 + SLAB_OVER, eaveRight: b.w / 2 + EAVE_IN };
}

/** Bàn trà thấp tâm (x, z) trên sàn `y`: mặt bàn, 4 chân, ấm + 2 chén; bồ đoàn phía bắc và phía nam. */
function lowTeaTable(g: THREE.Group, x: number, z: number, y: number, wood: string): void {
  g.add(box(LOW_W, 0.06, LOW_W, wood, x, y + LOW_H - 0.03, z));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.06, LOW_H - 0.06, 0.06, wood, x + sx * (LOW_W / 2 - 0.08), y + (LOW_H - 0.06) / 2, z + sz * (LOW_W / 2 - 0.08)));
  g.add(column(0.11, 0.16, POT, x - 0.15, y + LOW_H, z, 8));
  for (const dz of [-0.2, 0.2]) g.add(column(0.05, 0.06, CUP, x + 0.2, y + LOW_H, z + dz, 6));
  for (const s of [-1, 1]) g.add(column(0.34, 0.12, CUSHION, x, y, z + s * SEAT_GAP));
}

export function traLau(g: THREE.Group, b: BuildingSpec, style: Style, fade: THREE.Group, fadeLow: THREE.Group): Shell {
  const { w, d } = b;
  const k = hk(style);
  const { h1, yf, iw, id, stairs, eaveRight } = traLauLayout(b, style);
  const h2 = 2 * k;
  const pillar = b.pillarColor ?? style.pillar;
  const trim = b.trim ?? style.ridge;
  const boxes: LocalBox[] = [];

  /* ---------- tầng 1: nền, sàn, tường sau + bên, cột mặt tiền ---------- */
  g.add(box(w + 2 * PLAT_OVER, PLAT, d + 2 * PLAT_OVER, style.base, 0, PLAT / 2, 0));
  g.add(box(w + 0.6, PLAT / 2, RAMP, style.base, 0, PLAT / 4, (d + 0.6) / 2 + RAMP / 2)); // bậc
  g.add(box(w - 0.4, 0.04, d - 0.4, style.floor, 0, PLAT + 0.02, 0));
  g.add(box(w, h1, WALL, style.wall, 0, PLAT + h1 / 2, -d / 2 + WALL / 2));
  boxes.push({ x: 0, z: -d / 2 + WALL / 2, w, d: 0.3, h: Infinity });
  for (const s of [-1, 1]) {
    g.add(box(WALL, h1, d, style.wall, s * (w / 2 - WALL / 2), PLAT + h1 / 2, 0));
    const wall: LocalBox = { x: s * (w / 2 - WALL / 2), z: 0, w: 0.3, d, h: Infinity };
    boxes.push(...(s > 0 ? gapForBridge(wall, stairs) : [wall])); // hồi phải: cầu nối tầng 2 đi qua đầu tường
  }
  const xs = columnXs(w, w / 3);
  const circles = xs.map((x) => ({ x, z: d / 2 - 0.3, r: 0.28 }));
  for (const c of circles) g.add(column(0.22, h1, pillar, c.x, PLAT, c.z));

  // quầy trà sát tường sau + 3 bàn trà — chỉ chặn người ở tầng 1
  const low = PLAT + 1.5;
  g.add(box(w * 0.45, 0.95, 0.7, style.timber, 0, PLAT + 0.475, -d / 2 + 1.1));
  g.add(box(w * 0.45, 0.06, 0.8, style.floor, 0, PLAT + 0.98, -d / 2 + 1.1));
  boxes.push({ x: 0, z: -d / 2 + 1.1, w: w * 0.45, d: 0.8, maxY: low });
  for (let i = 0; i < xs.length - 1; i++) {
    boxes.push({ ...teaTable(g, (xs[i] + xs[i + 1]) / 2, 0.6, PLAT), maxY: low });
  }
  addStairs(g, stairs, style);

  /* ---------- sàn lầu + tầng 2 mở (hiện khi đứng trên tầng 2, mờ khi ở tầng 1 — R-HUD-2) ---------- */
  const y1 = PLAT + h1;
  fadeLow.add(box(w + 2 * SLAB_OVER, SLAB, d + 0.4, style.timber, 0, y1 + SLAB / 2, 0));
  // hiên lửng: hồi trái vươn EAVE_OVER, hồi phải chỉ tới `eaveRight` (thang sát nhà — L-6); mép trên trái vẫn sát tường
  const left = w / 2 + EAVE_OVER;
  const topLeft = w / 2 + 0.15;
  const dx = (eaveRight - left) / 2;
  skirt(fade, y1 - 0.75, left + eaveRight, d + 2 * EAVE_OVER, 2 * (topLeft + dx), d + 0.3, 0.75, b.roofColor, dx);
  const cx = w / 2 - 0.25;
  const cz = d / 2 - 0.25;
  for (const x of xs) for (const z of [-cz, cz]) fadeLow.add(column(0.15, h2, pillar, x, yf, z));
  for (let i = 0; i < xs.length - 1; i++) for (const z of [-cz, cz]) upperRail(fadeLow, xs[i], z, xs[i + 1], z, yf);
  upperRail(fadeLow, -cx, -cz, -cx, cz, yf);
  upperRail(fadeLow, cx, stairs.zTop, cx, cz, yf); // hồi phải: chừa lối ra cầu nối

  // 6 bàn trà thấp (2 hàng × 3, nửa tây sàn), mỗi bàn 2 bồ đoàn quay mặt vào bàn (R-VA-4)
  const seats: NonNullable<Shell['seats']> = [];
  for (const z of LOW_ROWS) {
    for (let i = 0; i < LOW_PER_ROW; i++) {
      const x = -w / 2 + 2.2 + i * LOW_STEP;
      lowTeaTable(fadeLow, x, z, yf, style.timber);
      boxes.push({ x, z, w: LOW_W, d: LOW_W, minY: yf - 0.4 });
      seats.push({ x, z: z - SEAT_GAP, y: yf, rotY: 0 }, { x, z: z + SEAT_GAP, y: yf, rotY: Math.PI });
    }
  }
  // lan can mặt tiền tầng 2 (hồi + sau trùng tường tầng 1, đã chặn) — chỉ chặn người ở tầng 2
  boxes.push({ x: 0, z: cz, w, d: 0.3, minY: yf - 0.4 }, ...stairs.boxes);

  /* ---------- xà, mái, biển, đèn (mờ khi ở trong) ---------- */
  const y2 = yf + h2;
  addBeamBand(fade, w, d, y2, style);
  gableHipRoof(fade, { y: y2 + 0.5, w, d, over: 1.4, h: 2.2 * k, color: b.roofColor, ridgeColor: trim });
  addSign(fade, b.title, y2 - 0.45, cz + 0.2, 0.8);
  const hw = w / 2 + 1.6;
  const hd = d / 2 + 1.6;
  addLanterns(fade, [[-hw, y2 + 0.2, hd], [hw, y2 + 0.2, hd]], style);

  return {
    boxes,
    circles,
    pads: [
      { x: 0, z: 0, w: w + 0.6, d: d + 0.6, y: PLAT },
      frontRamp(w + 0.6, (d + 0.6) / 2, RAMP, PLAT),
      ...stairs.pads,
      { x: 0, z: 0, w: iw, d: id, y: yf, upper: true },
    ],
    floor: { x: 0, z: 0, w: w - 0.6, d: d - 0.6 },
    upperY: yf - 1,
    seats,
  };
}
