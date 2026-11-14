/**
 * Đồ phố chợ / trà lâu (2026-11-13.13): bàn trà + đôn, sạp ô giấy, cờ dọc, bảng vinh danh. Dùng cho `props`
 * (đặt lẻ trong cảnh) và trong nhà vào được (trà lâu). Màu gỗ / gốm là màu đồ đạc (như `noi_that.ts`), màu ô theo
 * `buildingStyle.cloth`. Toạ độ theo nhóm `g`, chân ở `y0`.
 */
import * as THREE from 'three';
import { lambert } from '../materials';
import { markDynamic } from '../merge';
import { signMesh } from '../signAtlas';
import { drawBanner, drawBoard, drawSign } from '../textures';
import type { Style } from './chi_tiet';
import { box, column } from './hinh';
import type { LocalBox } from './noi_that';

const TABLE = '#6b4a2e';
const STOOL = '#8a5a3c';
const POT = '#5a3a2a';
const CUP = '#f3e6c8';

/**
 * L-8: bàn ghế làm theo cỡ người thật ~1,65 m trông như đồ chơi cạnh nhân vật chibi cao 2,1 m → mọi bàn ghế ngồi được
 * (bàn trà, đôn, sập, ghế đơn, bàn dài, bồ đoàn) nhân hệ số này: kích thước, độ cao, khoảng ghế – bàn, khoảng giữa ghế.
 * Ấm, chén giữ cỡ cũ. `tra_lau.ts`, `lau_sach.ts`, `gameTable.ts` dùng chung.
 */
export const FURN = 1.3;
const k = (v: number): number => v * FURN;
/** Bán kính bồ đoàn ngồi bệt (m) — chung mọi nơi (L-8). */
export const CUSHION_R = 0.42;

/** Cao mặt đôn trống (m) — ngồi đôn bàn trà (R-NHAC-2). */
export const STOOL_H = 0.58; // L-8: 0,45 × FURN ≈ 0,58 (R-NHAC-2)
const TEA_TOP = k(0.75);
const TEA_W = k(1.2);
const STOOL_AT = k(0.95);
/** Vị trí 4 đôn quanh tâm bàn trà (đông, tây, nam, bắc). */
export const TEA_STOOLS: readonly (readonly [number, number])[] = [
  [STOOL_AT, 0],
  [-STOOL_AT, 0],
  [0, STOOL_AT],
  [0, -STOOL_AT],
];

/** Bàn trà vuông `TEA_W` cao `TEA_TOP` + 4 đôn trống + ấm, 2 chén. Trả về hộp va chạm (bàn + đôn) theo toạ độ `g`. */
export function teaTable(g: THREE.Group, x: number, z: number, y0 = 0): LocalBox {
  const leg = TEA_TOP - 0.08;
  g.add(box(TEA_W, 0.08, TEA_W, TABLE, x, y0 + TEA_TOP - 0.04, z));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.1, leg, 0.1, TABLE, x + sx * (TEA_W / 2 - 0.1), y0 + leg / 2, z + sz * (TEA_W / 2 - 0.1)));
  for (const [dx, dz] of TEA_STOOLS) g.add(column(k(0.24), STOOL_H, STOOL, x + dx, y0, z + dz));
  const pot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), lambert(POT));
  pot.position.set(x - 0.15, y0 + TEA_TOP + 0.11, z);
  pot.scale.y = 0.8;
  g.add(pot);
  for (const dx of [0.2, 0.38]) g.add(column(0.05, 0.07, CUP, x + dx, y0 + TEA_TOP, z + 0.1, 6));
  const span = 2 * (STOOL_AT + k(0.24)) + 0.02;
  return { x, z, w: span, d: span };
}

/** Sạp ô giấy: ô ∅ 2,4 trên cột 2,4 m + bàn 1,8 × 0,9 bày hàng. Trả về hộp va chạm (bàn). */
export function umbrellaStall(g: THREE.Group, style: Style): LocalBox {
  g.add(box(1.8, 0.08, 0.9, TABLE, 0, 0.78, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.08, 0.74, 0.08, TABLE, sx * 0.8, 0.37, sz * 0.35));
  g.add(box(0.3, 0.16, 0.24, style.lantern, -0.5, 0.9, 0));
  g.add(box(0.3, 0.12, 0.24, style.gold, -0.1, 0.88, 0.05));
  g.add(box(0.36, 0.14, 0.26, style.herb, 0.4, 0.89, -0.05));
  g.add(column(0.04, 2.4, style.timber, 0.95, 0, 0, 5));
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.25, 0.55, 10), lambert(style.cloth, { side: THREE.DoubleSide }));
  canopy.position.set(0.95, 2.55, 0);
  g.add(canopy);
  return { x: 0, z: 0, w: 1.9, d: 1 };
}

/**
 * Cờ dọc 幌子 trên cột cao `h`: vải 0,8 × 2,4 m, một chữ Hán, phấp phới nhẹ (xoay quanh cán). Hai mặt (vải mỏng).
 * `phase` lệch nhịp giữa các cờ. Trả về hàm cập nhật.
 */
export function banner(g: THREE.Group, style: Style, text: string, h: number, phase = 0): (dt: number) => void {
  g.add(column(0.07, h, style.timber, 0, 0, 0, 6));
  g.add(box(1, 0.08, 0.08, style.timber, 0.5, h - 0.2, 0));
  const cloth = new THREE.Group();
  cloth.position.set(0.12, h - 0.25, 0);
  const front = signMesh(0.8, 2.4, 160, 480, (c, w, hh) => drawBanner(c, w, hh, text));
  front.position.set(0.45, -1.2, 0);
  const back = new THREE.Mesh(front.geometry, front.material);
  back.position.copy(front.position);
  back.rotation.y = Math.PI;
  cloth.add(front, back);
  markDynamic(cloth);
  g.add(cloth);
  let t = phase;
  return (dt) => {
    t += dt;
    cloth.rotation.y = Math.sin(t * 1.3) * 0.18;
  };
}

/** Bảng vinh danh: khung gỗ 3 × 2,4 m, hai cột son, mái nhỏ, giấy kẻ dòng (danh sách chờ thiết kế). */
export function honorBoard(g: THREE.Group, style: Style, title: string): LocalBox {
  for (const sx of [-1, 1]) g.add(column(0.12, 2.9, style.pillar, sx * 1.55, 0, 0));
  g.add(box(3.4, 0.14, 0.3, style.timber, 0, 2.9, 0));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 0.5, 4, 1).rotateY(Math.PI / 4), lambert(style.ridge));
  roof.scale.set(1, 1, 0.3);
  roof.position.y = 3.2;
  g.add(roof);
  g.add(box(3.1, 2.1, 0.12, style.timber, 0, 1.75, 0));
  const paper = signMesh(2.8, 1.8, 448, 288, (c, w, h) => drawBoard(c, w, h, title));
  paper.position.set(0, 1.75, 0.07);
  g.add(paper);
  return { x: 0, z: 0, w: 3.4, d: 0.5 };
}

/**
 * Biển tên trò chơi (R-GIAO-2): biển gỗ đứng 1,8 m — hai trụ, xà trên, tấm giấy ngà viền vàng ghi tên trò, hai mặt
 * đều đọc được. Có `han` → hai dòng (Hán lớn + Việt nhỏ); `han` rỗng → một dòng tên Việt. Mặt trước nhìn +z. Trả về hộp
 * va chạm theo toạ độ `g`.
 */
export function gameSign(g: THREE.Group, style: Style, han: string, name: string): LocalBox {
  for (const sx of [-1, 1]) g.add(column(0.06, 1.75, style.timber, sx * 0.8, 0, 0, 6));
  g.add(box(1.9, 0.1, 0.16, style.timber, 0, 1.78, 0));
  g.add(box(1.62, 0.84, 0.08, style.timber, 0, 1.22, 0));
  const [main, sub] = han ? [han, name] : [name, undefined];
  const front = signMesh(1.5, 0.75, 512, 256, (c, w, h) => drawSign(c, w, h, main, sub, { paper: true }));
  front.position.set(0, 1.22, 0.05);
  const back = new THREE.Mesh(front.geometry, front.material);
  back.position.set(0, 1.22, -0.05);
  back.rotation.y = Math.PI;
  g.add(front, back);
  return { x: 0, z: 0, w: 1.8, d: 0.3 };
}

/* ---------- chỗ ngồi tầng 2 trà lâu (R-VA-4): ngồi bệt (xếp bằng) — sập trà, ghế đơn sát lan can, bàn dài ---------- */

const CUSHION = '#8a3b2c';
const MAT = '#c9b48a';

/** Một chỗ ngồi: toạ độ nhóm, `y` mặt ngồi, `rotY` hướng nhìn (0 = +z). */
export interface LocalSeat {
  x: number;
  z: number;
  y: number;
  rotY: number;
}

/** Cao mặt sập trà (m) — chỗ ngồi trên sập cao hơn sàn chừng này (R-VA-4: 0,45). */
export const TEA_BED_H = 0.45;
const BED_W = k(2);
const BED_D = k(1);
/** chỗ ngồi trên sập cách tâm sập (dọc x) */
const BED_SEAT = k(0.6);

/**
 * Sập trà 榻 tâm (x, z) trên sàn `y0`, mặt mở nhìn +z: sập gỗ thấp 2 × 1 m có đệm, tựa ba mặt (sau + hai đầu), kỷ trà
 * thấp ở giữa (ấm + 2 chén), 2 nệm ngồi hai đầu quay mặt vào nhau. Trả về vật cản (cả sập — không bước lên), mặt sập
 * (tấm đi được để người ngồi trên sập đứng đúng cao) và 2 chỗ ngồi.
 */
export function teaBed(
  g: THREE.Group,
  x: number,
  z: number,
  y0: number,
): { box: LocalBox; top: { x: number; z: number; w: number; d: number; y: number }; seats: LocalSeat[] } {
  const top = y0 + TEA_BED_H;
  g.add(box(BED_W, TEA_BED_H - 0.04, BED_D, TABLE, x, y0 + (TEA_BED_H - 0.04) / 2, z));
  g.add(box(BED_W - 0.1, 0.04, BED_D - 0.1, MAT, x, top - 0.02, z));
  g.add(box(BED_W, k(0.4), 0.08, TABLE, x, top + k(0.2), z - BED_D / 2 + 0.04)); // tựa sau
  for (const s of [-1, 1]) g.add(box(0.08, k(0.28), BED_D, TABLE, x + s * (BED_W / 2 - 0.04), top + k(0.14), z)); // tựa hai đầu
  // kỷ trà
  const ky = k(0.2);
  g.add(box(k(0.5), 0.04, k(0.45), TABLE, x, top + ky, z));
  for (const s of [-1, 1]) g.add(box(0.06, ky - 0.02, k(0.4), TABLE, x + s * k(0.2), top + (ky - 0.02) / 2, z));
  g.add(column(0.08, 0.12, POT, x - 0.08, top + ky + 0.02, z, 8));
  for (const dx of [0.1, 0.18]) g.add(column(0.035, 0.05, CUP, x + dx, top + ky + 0.02, z + 0.08, 6));
  const seats: LocalSeat[] = [];
  for (const s of [-1, 1]) {
    g.add(column(k(0.26), 0.06, CUSHION, x + s * BED_SEAT, top, z));
    seats.push({ x: x + s * BED_SEAT, z, y: top, rotY: (-s * Math.PI) / 2 }); // quay vào kỷ
  }
  return { box: { x, z, w: BED_W, d: BED_D }, top: { x, z, w: BED_W, d: BED_D, y: top }, seats };
}

/**
 * Ghế đơn sát lan can tâm bồ đoàn (x, z) trên sàn `y0`, người ngồi nhìn hướng `rotY` (bội 90°) — ra ngoài: bồ đoàn +
 * bàn nhỏ vuông (0,55 m × FURN) phía trước (giữa người và lan can), một chén trà. Trả về vật cản (bàn) và chỗ ngồi.
 */
export function soloSeat(g: THREE.Group, x: number, z: number, y0: number, rotY: number): { box: LocalBox; seat: LocalSeat } {
  const off = k(0.6);
  const tw = k(0.55);
  const th = k(0.35);
  const tx = x + Math.round(Math.sin(rotY)) * off;
  const tz = z + Math.round(Math.cos(rotY)) * off;
  g.add(box(tw, 0.05, tw, TABLE, tx, y0 + th - 0.025, tz));
  g.add(box(tw - 0.1, th - 0.05, tw - 0.1, TABLE, tx, y0 + (th - 0.05) / 2, tz));
  g.add(column(0.04, 0.06, CUP, tx, y0 + th, tz, 6));
  g.add(column(CUSHION_R, 0.12, CUSHION, x, y0, z));
  return { box: { x: tx, z: tz, w: tw, d: tw }, seat: { x, z, y: y0, rotY } };
}

/** Bàn dài tụ hội tâm (x, z) trên sàn `y0`: (3 × 0,9 m cao 0,4) × FURN (dọc x), 2 ấm, 6 chén, 3 bồ đoàn mỗi bên quay vào bàn. */
export function longTeaTable(g: THREE.Group, x: number, z: number, y0: number): { box: LocalBox; seats: LocalSeat[] } {
  const w = k(3);
  const d = k(0.9);
  const h = k(0.4);
  const step = k(1);
  const gap = k(0.8);
  g.add(box(w, 0.06, d, TABLE, x, y0 + h - 0.03, z));
  for (const sx of [-1, 0, 1]) for (const sz of [-1, 1]) g.add(box(0.07, h - 0.06, 0.07, TABLE, x + sx * (w / 2 - 0.1), y0 + (h - 0.06) / 2, z + sz * (d / 2 - 0.1)));
  for (const dx of [-0.6, 0.6]) g.add(column(0.1, 0.15, POT, x + dx, y0 + h, z, 8));
  const seats: LocalSeat[] = [];
  for (const i of [-1, 0, 1]) {
    const dx = i * step;
    for (const s of [-1, 1]) {
      g.add(column(0.05, 0.06, CUP, x + dx, y0 + h, z + s * 0.36, 6));
      g.add(column(CUSHION_R, 0.12, CUSHION, x + dx, y0, z + s * gap));
      seats.push({ x: x + dx, z: z + s * gap, y: y0, rotY: s < 0 ? 0 : Math.PI });
    }
  }
  return { box: { x, z, w, d }, seats };
}

/**
 * Cầm án 琴案 tâm (x, z) trên sàn `y0`, người đàn ngồi phía sau (−z) nhìn +z: án thấp 1,4 × 0,5 cao 0,4, cây cổ cầm
 * sơn đen nằm trên (thân dẹt, đầu rộng hơn đuôi, 7 dây + nhạn trục), bồ đoàn phía sau. Trả về vật cản (án + bồ đoàn).
 */
export function guqinTable(g: THREE.Group, x: number, z: number, y0: number): LocalBox {
  const top = y0 + 0.4;
  g.add(box(1.4, 0.05, 0.5, TABLE, x, top - 0.025, z));
  for (const sx of [-1, 1]) g.add(box(0.08, 0.35, 0.4, TABLE, x + sx * 0.6, y0 + 0.175, z));
  g.add(box(1.2, 0.05, 0.18, '#2a1f1a', x, top + 0.025, z)); // thân đàn
  g.add(box(0.25, 0.06, 0.2, '#2a1f1a', x + 0.48, top + 0.03, z)); // đầu đàn (rộng hơn)
  g.add(box(1.15, 0.008, 0.12, '#e8dcc0', x - 0.02, top + 0.054, z)); // dây
  g.add(column(0.32, 0.12, CUSHION, x, y0, z - 0.65));
  return { x, z: z - 0.2, w: 1.4, d: 1.0 };
}
