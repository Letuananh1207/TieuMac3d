import * as THREE from 'three';
import type { Heightfield } from '../collision/heightfield';
import type { SceneSpec } from './spec';

/**
 * Đất "mềm" (kế hoạch docs/tasks/2026-11-14-canh-dep.md, NV9): thay màu từng tam giác (lốm đốm) bằng màu + pháp tuyến
 * **theo đỉnh lưới** — chuyển mượt giữa cỏ / đất / đá theo độ dốc, cỏ thành mảng lớn 3 sắc theo nhiễu chậm. Không thêm
 * draw call, không thêm tam giác. Tính một lần lúc dựng.
 */
export interface GroundShade {
  /** màu (rgb) và pháp tuyến (xyz) của đỉnh lưới (i, j) ở chỉ số `(j * (nx + 1) + i) * 3` */
  colors: Float32Array;
  normals: Float32Array;
}

const smooth = (a: number, b: number, v: number): number => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Nhiễu chậm 0…1 (mảng cỏ vài chục mét) — tổng sin lệch pha, đủ cho mảng màu, không cần nhiễu Perlin. */
export function patch(x: number, z: number, k = 1): number {
  const v = Math.sin(x * 0.045 * k + Math.sin(z * 0.031 * k) * 2.1) * Math.cos(z * 0.052 * k - x * 0.019 * k);
  return 0.5 + 0.5 * v;
}

/**
 * Màu mặt đất theo độ dốc (độ) + hai giá trị nhiễu: cỏ (3 sắc pha theo nhiễu) → đất (quanh `slopeDirt`) → đá (quanh
 * `slopeRock`, đá sáng khi cao hơn `highFrom`). Chuyển trong ±5° nên không có đường cắt màu.
 */
export function groundColor(t: SceneSpec['terrain'], slope: number, y: number, n1: number, n2: number, out: THREE.Color): THREE.Color {
  const g = t.colors.grass;
  out.set(g[0]).lerp(new THREE.Color(g[1]), smooth(0.3, 0.7, n1)).lerp(new THREE.Color(g[2]), 0.6 * smooth(0.45, 0.85, n2));
  out.lerp(new THREE.Color(t.colors.dirt), smooth(t.slopeDirt - 5, t.slopeDirt + 5, slope));
  const rock = new THREE.Color(y > t.colors.highFrom ? t.colors.highRock : t.colors.rock);
  return out.lerp(rock, smooth(t.slopeRock - 5, t.slopeRock + 5, slope));
}

export function shadeGround(spec: SceneSpec, hf: Heightfield): GroundShade {
  const t = spec.terrain;
  const { nx, nz, cell, originX, originZ } = hf;
  const colors = new Float32Array((nx + 1) * (nz + 1) * 3);
  const normals = new Float32Array((nx + 1) * (nz + 1) * 3);
  const h = (i: number, j: number): number => hf.vertex(Math.min(nx, Math.max(0, i)), Math.min(nz, Math.max(0, j)));
  const n = new THREE.Vector3();
  const c = new THREE.Color();
  for (let j = 0; j <= nz; j++) {
    for (let i = 0; i <= nx; i++) {
      const dx = (h(i + 1, j) - h(i - 1, j)) / (2 * cell);
      const dz = (h(i, j + 1) - h(i, j - 1)) / (2 * cell);
      n.set(-dx, 1, -dz).normalize();
      const slope = (Math.acos(Math.min(1, n.y)) * 180) / Math.PI;
      const x = originX + i * cell;
      const z = originZ + j * cell;
      groundColor(t, slope, h(i, j), patch(x, z), patch(z + 40, x - 25, 1.7), c);
      const k = (j * (nx + 1) + i) * 3;
      colors.set([c.r, c.g, c.b], k);
      normals.set([n.x, n.y, n.z], k);
    }
  }
  return { colors, normals };
}
