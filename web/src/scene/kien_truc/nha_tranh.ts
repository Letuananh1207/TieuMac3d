import * as THREE from 'three';
import { lambert } from '../materials';
import type { BuildingSpec } from '../spec';
import type { Style } from './chi_tiet';
import { box, column, frustum, windowBox } from './hinh';

/**
 * Nhà tranh (茅廬 — Trúc Lư, V-66 B3; hồ sơ `docs/tham_khao/lam-lai-vung.md` mục 5): ba gian thấp trên nền đất nện, vách
 * trúc (thân trúc khô dựng sát, nẹp ngang), cửa gian giữa đóng (không vào), hai ô cửa sổ song giấy, mái tranh bốn mái dày
 * vươn rộng, nóc bó rơm. Mặt trước +z. `roofColor` = màu tranh, `pillarColor` = màu trúc vách (thiếu → trúc khô); nền đá
 * `buildingStyle.stone`.
 * Va chạm: hộp nền (buildings.ts, như nhà nhỏ).
 */

// bảng màu dùng chung với vật trúc / rào trúc / đình (`vat_truc.ts`, `fenceStyle`) — cùng màu thì gộp chung một draw call
const BAMBOO_DRY = '#c8b27a';
const KNOT = '#6b4a2e';
const DOOR = '#6b4a2e';
const PAPER = '#f3e9d2';
/** Vách cao (m), mái cao (m), nền cao (m). */
const WALL_H = 2.3;
const ROOF_H = 2.1;
const BASE_H = 0.25;

export function nhaTranh(g: THREE.Group, b: BuildingSpec, style: Style): void {
  const { w, d } = b;
  const bamboo = b.pillarColor ?? BAMBOO_DRY;
  g.add(box(w + 0.6, BASE_H, d + 0.6, style.stone, 0, BASE_H / 2, 0));
  const y0 = BASE_H;
  // thân vách trúc + nẹp ngang (chân, giữa, đầu vách) + cột trúc góc
  g.add(box(w, WALL_H, d, bamboo, 0, y0 + WALL_H / 2, 0));
  for (const y of [0.15, WALL_H * 0.55, WALL_H - 0.12]) {
    g.add(box(w + 0.06, 0.08, d + 0.06, KNOT, 0, y0 + y, 0));
  }
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    g.add(column(0.12, WALL_H + 0.2, KNOT, sx * (w / 2), y0, sz * (d / 2), 6));
  }
  // thân trúc dựng mặt trước (sọc dọc) — chừa cửa giữa
  const door = 1.1;
  for (let x = -w / 2 + 0.35; x < w / 2 - 0.2; x += 0.55) {
    if (Math.abs(x) < door / 2 + 0.2) continue;
    g.add(column(0.045, WALL_H - 0.1, KNOT, x, y0, d / 2 + 0.03, 4));
  }
  // cửa gian giữa đóng: hai cánh ván + khung
  g.add(box(door, 1.95, 0.08, DOOR, 0, y0 + 0.975, d / 2 + 0.04));
  g.add(box(0.05, 1.95, 0.1, KNOT, 0, y0 + 0.975, d / 2 + 0.06));
  g.add(box(door + 0.24, 0.12, 0.12, KNOT, 0, y0 + 2.0, d / 2 + 0.05));
  // hai cửa sổ song giấy gian hai bên (sáng ấm ban đêm)
  for (const sx of [-1, 1]) {
    const x = sx * (w / 4 + 0.3);
    g.add(windowBox(0.9, 0.7, 0.06, PAPER, x, y0 + 1.35, d / 2 + 0.04));
    for (let i = -1; i <= 1; i++) g.add(box(0.04, 0.72, 0.07, KNOT, x + i * 0.26, y0 + 1.35, d / 2 + 0.06));
    g.add(box(1.02, 0.07, 0.08, KNOT, x, y0 + 1.72, d / 2 + 0.06));
    g.add(box(1.02, 0.07, 0.08, KNOT, x, y0 + 0.98, d / 2 + 0.06));
  }
  // mái tranh bốn mái (chái): lớp dày mép (chóp cụt thấp) + thân mái; nóc bó rơm
  const thatch = lambert(b.roofColor, { flatShading: true });
  const bw = w + 1.6;
  const bd = d + 1.8;
  const yr = y0 + WALL_H - 0.05;
  const lip = new THREE.Mesh(frustum(bw, bd, bw - 0.5, bd - 0.5, 0.35), thatch);
  lip.position.y = yr - 0.25;
  const body = new THREE.Mesh(frustum(bw - 0.5, bd - 0.5, Math.max(0.6, bw - bd), 0, ROOF_H), thatch);
  body.position.y = yr + 0.1;
  g.add(lip, body);
  const ridgeLen = Math.max(0.6, bw - bd) + 0.5;
  const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, ridgeLen, 6), lambert(KNOT));
  ridge.rotation.z = Math.PI / 2;
  ridge.position.y = yr + 0.1 + ROOF_H;
  g.add(ridge);
  for (const sx of [-1, 1]) g.add(box(0.1, 0.5, 0.1, KNOT, sx * (ridgeLen / 2 - 0.05), yr + ROOF_H + 0.25, 0));
}

/** Nhà tranh cao bao nhiêu (m) tính cả nóc. Thuần. */
export const NHA_TRANH_HEIGHT = BASE_H + WALL_H - 0.05 + 0.1 + ROOF_H + 0.16;
