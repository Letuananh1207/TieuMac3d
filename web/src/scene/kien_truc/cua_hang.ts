/**
 * Cửa hàng phố chợ 市街 (`cua-hang`, bản mẫu design/source/TienIch-kien-truc.dc.html): nhà hai tầng mặt tiền hẹp
 * (`w` 4–8 m) — dưới bán, trên ở. Tầng 1 mở: ván cửa (排門板) xếp một bên, quầy giữa, kệ sát tường sau, hàng bày theo
 * `goods`; đi vào đứng trước quầy được. Mái hiên lửng trước mặt tiền; tầng 2 khung gỗ sẫm + cửa song; mái hai mái.
 * Biển ngang `title` trên mặt tiền; cờ dọc `sign` (một chữ Hán) treo cần ngang ở góc phải.
 */
import * as THREE from 'three';
import { lambert } from '../materials';
import { signMesh } from '../signAtlas';
import type { BuildingSpec } from '../spec';
import { drawBanner } from '../textures';
import { addLanterns, addSign, hk, type Style } from './chi_tiet';
import { box, column } from './hinh';
import { gableRoof } from './mai';
import type { LocalBox } from './noi_that';
import { frontRamp, type Shell } from './vao_trong';

const PLAT = 0.25;
const RAMP = 0.7;
const WALL = 0.22;
/** Màu hàng bày (đồ vật — như màu đồ đạc ở `noi_that.ts`). */
const SHUTTER = '#6b4a2e';
const CLOTH = ['#3f5fa0', '#e88aa4', '#e8e1d2', '#2f6f73'];
const PAPER = '#d4a64a';
const SEAL = '#a8322a';
const JAR = '#4f5a63';
const BARREL = '#8a5a3c';

/** Hàng bày trên mặt quầy (`yTop`) và các tầng kệ (`shelfZ`). */
function addGoods(g: THREE.Group, b: BuildingSpec, style: Style, w: number, yTop: number, counterZ: number, shelfZ: number): void {
  const kind = b.goods ?? 'thung';
  const n = Math.max(2, Math.floor(w / 1.2));
  for (let i = 0; i < n; i++) {
    const x = -w * 0.32 + (i * w * 0.64) / (n - 1);
    for (const [y, z] of [
      [yTop, counterZ],
      [yTop + 0.55, shelfZ],
      [yTop + 1.15, shelfZ],
    ]) {
      if (kind === 'but') {
        g.add(column(0.09, 0.22, style.timber, x, y, z, 6));
        g.add(box(0.03, 0.22, 0.03, style.wall, x, y + 0.3, z));
      } else if (kind === 'vai') g.add(box(0.5, 0.16, 0.34, CLOTH[i % CLOTH.length], x, y + 0.08, z));
      else if (kind === 'bua') {
        g.add(box(0.36, 0.08, 0.26, PAPER, x, y + 0.04, z));
        g.add(box(0.1, 0.02, 0.1, SEAL, x, y + 0.09, z));
      } else if (kind === 'thuoc') {
        g.add(column(0.13, 0.3, JAR, x, y, z, 8));
        g.add(box(0.2, 0.1, 0.12, style.herb, x + 0.25, y + 0.05, z));
      } else g.add(column(0.18, 0.36, BARREL, x, y, z, 8));
    }
  }
}

export function cuaHang(g: THREE.Group, b: BuildingSpec, style: Style, fade: THREE.Group): Shell {
  const { w, d } = b;
  const k = hk(style);
  const h1 = 2.2 * k;
  const h2 = 1.8 * k;
  const trim = b.trim ?? style.ridge;
  const boxes: LocalBox[] = [];

  /* ---------- tầng 1: nền, sàn, tường sau + bên, cột góc, ván cửa ---------- */
  g.add(box(w + 0.2, PLAT, d + 0.2, style.base, 0, PLAT / 2, 0));
  g.add(box(w - 0.3, 0.04, d - 0.3, style.floor, 0, PLAT + 0.02, 0));
  g.add(box(w, h1, WALL, style.wall, 0, PLAT + h1 / 2, -d / 2 + WALL / 2));
  boxes.push({ x: 0, z: -d / 2 + WALL / 2, w, d: 0.3, h: Infinity });
  for (const s of [-1, 1]) {
    g.add(box(WALL, h1, d, style.wall, s * (w / 2 - WALL / 2), PLAT + h1 / 2, 0));
    boxes.push({ x: s * (w / 2 - WALL / 2), z: 0, w: 0.3, d, h: Infinity });
    g.add(box(0.26, h1, 0.26, style.timber, s * (w / 2 - 0.13), PLAT + h1 / 2, d / 2 - 0.13));
  }
  g.add(box(w, 0.3, 0.3, style.timber, 0, PLAT + h1 - 0.15, d / 2 - 0.15)); // xà mặt tiền
  // ván cửa xếp chồng sát mép trái mặt tiền
  g.add(box(0.5, h1 - 0.4, 0.32, SHUTTER, -w / 2 + 0.55, PLAT + (h1 - 0.4) / 2, d / 2 - 0.45));
  for (const f of [-0.15, 0, 0.15]) g.add(box(0.04, h1 - 0.4, 0.34, style.timber, -w / 2 + 0.55 + f, PLAT + (h1 - 0.4) / 2, d / 2 - 0.45));
  boxes.push({ x: -w / 2 + 0.55, z: d / 2 - 0.45, w: 0.55, d: 0.4 });

  /* ---------- quầy + kệ + hàng ---------- */
  const counterZ = -d / 2 + 2;
  const shelfZ = -d / 2 + 0.45;
  const cw = Math.max(1.6, w - 1.8);
  g.add(box(cw, 0.9, 0.6, style.timber, 0, PLAT + 0.45, counterZ));
  boxes.push({ x: 0, z: counterZ, w: cw, d: 0.7 });
  for (const y of [0.9, 1.45, 2.05]) g.add(box(w - 0.6, 0.06, 0.5, SHUTTER, 0, PLAT + y, shelfZ));
  g.add(box(w - 0.6, 2.2, 0.06, style.timber, 0, PLAT + 1.1, shelfZ - 0.25));
  boxes.push({ x: 0, z: shelfZ, w: w - 0.6, d: 0.5 });
  addGoods(g, b, style, w, PLAT + 0.9, counterZ, shelfZ);

  /* ---------- hiên lửng trước, tầng 2, mái (mờ khi ở trong) ---------- */
  const y1 = PLAT + h1;
  fade.add(box(w + 0.2, 0.22, d + 0.5, style.timber, 0, y1 + 0.11, 0.15));
  const lean = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.08, 1.3), lambert(b.roofColor));
  lean.position.set(0, y1 - 0.05, d / 2 + 0.65);
  lean.rotation.x = 0.38;
  fade.add(lean);
  const yf = y1 + 0.22;
  fade.add(box(w, h2, d, style.wall, 0, yf + h2 / 2, 0.1));
  for (const s of [-1, 1]) fade.add(box(0.24, h2, 0.24, style.timber, s * (w / 2 - 0.12), yf + h2 / 2, d / 2 + 0.1));
  fade.add(box(w, 0.2, 0.26, style.timber, 0, yf + h2 - 0.1, d / 2 + 0.1));
  const ww = Math.min(w - 1.2, 2.6);
  fade.add(box(ww, h2 * 0.5, 0.08, style.floor, 0, yf + h2 * 0.55, d / 2 + 0.16));
  for (const f of [-1 / 3, 0, 1 / 3]) fade.add(box(0.05, h2 * 0.5, 0.12, style.timber, ww * f, yf + h2 * 0.55, d / 2 + 0.18));
  fade.add(box(ww, 0.05, 0.12, style.timber, 0, yf + h2 * 0.55, d / 2 + 0.18));
  gableRoof(fade, { y: yf + h2, w, d: d + 0.2, over: 0.55, h: 1.4 * k, color: b.roofColor, ridgeColor: trim });
  addSign(fade, b.title, yf + 0.32, d / 2 + 0.28, Math.min(0.6, w / 6));
  addLanterns(fade, [[-w / 2 + 0.4, y1 - 0.45, d / 2 + 0.6], [w / 2 - 0.4, y1 - 0.45, d / 2 + 0.6]], style);

  /* ---------- cờ dọc 幌子 trên cần ngang góc phải mặt tiền (vuông góc với phố: đi dọc phố thấy chữ) ---------- */
  if (b.sign) {
    const text = b.sign;
    g.add(box(0.08, 0.08, 1.1, style.timber, w / 2 - 0.2, y1 - 0.2, d / 2 + 0.45));
    const flag = signMesh(0.55, 1.65, 160, 480, (c, cw2, ch) => drawBanner(c, cw2, ch, text));
    flag.position.set(w / 2 - 0.2, y1 - 1.08, d / 2 + 0.6);
    flag.rotation.y = Math.PI / 2;
    const back = new THREE.Mesh(flag.geometry, flag.material);
    back.position.copy(flag.position);
    back.rotation.y = -Math.PI / 2;
    g.add(flag, back);
  }

  return {
    boxes,
    circles: [],
    pads: [
      { x: 0, z: 0, w: w + 0.2, d: d + 0.2, y: PLAT },
      frontRamp(w + 0.2, (d + 0.2) / 2, RAMP, PLAT),
    ],
    floor: { x: 0, z: 0, w: w - 0.6, d: d - 0.6 },
  };
}
