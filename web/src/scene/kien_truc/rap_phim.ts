/**
 * Rạp phim ngoài trời (`rap-phim`, R-RAP-1): màn chiếu 8 × 4,5 m trong khung gỗ, hai cột son trên chân đá, mái ngói nhỏ
 * trên đỉnh, biển tên; lưng màn là tấm vôi. Trước màn: chiếu cói + các hàng bồ đoàn (đệm ngồi) — ngồi xếp bằng như ngồi
 * thiền (tư thế có sẵn). Mặt màn trước nhìn +z; người xem ngồi quay về −z.
 */
import * as THREE from 'three';
import { lambert } from '../materials';
import { markDynamic } from '../merge';
import type { BuildingSpec } from '../spec';
import { addLanterns, addSign, type Style } from './chi_tiet';
import { box, column } from './hinh';
import { gableRoof } from './mai';
import type { LocalBox } from './noi_that';

/** Màn chiếu (m) — tỉ lệ 16 : 9. */
const SCREEN_W = 8;
const SCREEN_H = 4.5;
const SCREEN_Y = 1.6;
/** Bồ đoàn: hàng đầu cách tâm rạp, khoảng cách hàng / chỗ, số hàng / chỗ mỗi hàng. */
const FIRST_ROW = -2;
const ROW_GAP = 1.5;
const SEAT_GAP = 1.5;
const ROWS = 4;
const PER_ROW = 6;
const CUSHION = '#8a3b2c';
const MAT = '#c9a57a';

export interface CinemaShape {
  /** mặt màn (vật liệu do `VideoScreen` gắn) */
  screen: THREE.Mesh;
  /** chỗ ngồi theo toạ độ rạp (người ngồi quay về −z) */
  seats: { x: number; z: number }[];
  boxes: LocalBox[];
  circles: { x: number; z: number; r: number }[];
}

export function rapPhim(g: THREE.Group, b: BuildingSpec, style: Style): CinemaShape {
  const zs = -b.d / 2 + 0.5; // mặt màn
  const top = SCREEN_Y + SCREEN_H;
  const px = SCREEN_W / 2 + 0.45;
  const pillar = b.pillarColor ?? style.pillar;

  /* ---------- màn + khung + cột + mái ---------- */
  for (const s of [-1, 1]) {
    g.add(box(0.9, 0.5, 0.9, style.base, s * px, 0.25, zs));
    g.add(column(0.28, top + 1.1, pillar, s * px, 0.5, zs));
  }
  g.add(box(SCREEN_W + 0.5, 0.3, 0.3, style.timber, 0, top + 0.15, zs)); // khung trên
  g.add(box(SCREEN_W + 0.5, 0.3, 0.3, style.timber, 0, SCREEN_Y - 0.15, zs)); // khung dưới
  for (const s of [-1, 1]) g.add(box(0.25, SCREEN_H, 0.3, style.timber, (s * (SCREEN_W + 0.25)) / 2, SCREEN_Y + SCREEN_H / 2, zs));
  g.add(box(SCREEN_W + 0.9, top + 0.9, 0.2, style.wall, 0, (top + 0.9) / 2, zs - 0.25)); // lưng màn
  g.add(box(SCREEN_W + 1.6, 0.45, 0.45, style.eave, 0, top + 0.75, zs));
  gableRoof(g, { y: top + 1, w: SCREEN_W + 1.6, d: 1.3, over: 0.45, h: 0.95, color: b.roofColor, ridgeColor: b.trim ?? style.ridge });
  addSign(g, b.title, top + 0.75, zs + 0.25, 0.65);
  addLanterns(g, [[-px, top + 0.4, zs + 0.5], [px, top + 0.4, zs + 0.5]], style);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), new THREE.MeshBasicMaterial());
  screen.position.set(0, SCREEN_Y + SCREEN_H / 2, zs + 0.16);
  markDynamic(screen); // vật liệu đổi (khung hình video / chữ) — không gộp
  g.add(screen);

  /* ---------- chiếu cói + bồ đoàn ---------- */
  const rowsEnd = FIRST_ROW + (ROWS - 1) * ROW_GAP;
  const span = (PER_ROW - 1) * SEAT_GAP;
  g.add(box(span + 2, 0.03, rowsEnd - FIRST_ROW + 2, MAT, 0, 0.015, (FIRST_ROW + rowsEnd) / 2));
  const seats: CinemaShape['seats'] = [];
  const cushions = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.36, 0.4, 0.16, 8), lambert(CUSHION), ROWS * PER_ROW);
  const m = new THREE.Matrix4();
  for (let r = 0; r < ROWS; r++) {
    for (let i = 0; i < PER_ROW; i++) {
      const x = -span / 2 + i * SEAT_GAP;
      const z = FIRST_ROW + r * ROW_GAP;
      cushions.setMatrixAt(seats.length, m.makeTranslation(x, 0.11, z));
      seats.push({ x, z });
    }
  }
  cushions.instanceMatrix.needsUpdate = true;
  cushions.computeBoundingSphere();
  g.add(cushions);

  return {
    screen,
    seats,
    // lưng màn che camera (người đi sau màn); cột tròn
    boxes: [{ x: 0, z: zs - 0.25, w: SCREEN_W + 0.9, d: 0.3, h: Infinity }],
    circles: [-1, 1].map((s) => ({ x: s * px, z: zs, r: 0.5 })),
  };
}
