/**
 * Măng trong rừng Trúc Lâm (R-MANG-1…3): búp măng = 3 lớp bẹ nón chồng nhau (nâu sẫm → vàng nâu → đầu xanh non), măng to
 * vỏ vàng sẫm cao gấp đôi. Hai InstancedMesh (thường + to) = **2 draw call** cho mọi măng; ẩn / hiện / nhú (0,6 s) bằng cỡ
 * từng instance. Màu theo đỉnh, Lambert (decisions/0005). Chỗ mọc tính ở `zones/mang.ts` (nơi ghép đưa vào).
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Colliders } from '../collision/colliders';
import { markDynamic } from './merge';
import type { SceneSpec, XZ } from './spec';
import type { GroundY } from './terrainHeight';

/** Một búp măng cần vẽ: chỗ + to / thường + mức nhú 0…1 (0 = không vẽ). */
export interface MangView {
  x: number;
  z: number;
  big: boolean;
  k: number;
}

const SMALL = { layers: ['#5d4a2c', '#8a6b3a', '#7f9a46'], h: 0.34, r: 0.11 };
const BIG = { layers: ['#7a5a22', '#b08a3c', '#c9a64e'], h: 0.68, r: 0.17 };

/** Búp măng: 3 nón chồng, mỗi lớp hẹp + cao dần, hơi lệch xoay — gộp một hình, màu theo đỉnh. */
export function mangGeometry(look: { layers: string[]; h: number; r: number }): THREE.BufferGeometry {
  const c = new THREE.Color();
  const parts = look.layers.map((hex, i) => {
    const k = 1 - i * 0.28;
    const g = new THREE.ConeGeometry(look.r * k, look.h * (0.55 + i * 0.22), 7, 1).toNonIndexed();
    g.rotateY(i * 0.45);
    g.translate(0, (look.h * (0.55 + i * 0.22)) / 2 + i * look.h * 0.12, 0);
    c.set(hex);
    const n = g.getAttribute('position').count;
    const col = new Float32Array(n * 3);
    for (let v = 0; v < n; v++) col.set([c.r, c.g, c.b], v * 3);
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.deleteAttribute('uv');
    return g;
  });
  const merged = mergeGeometries(parts) ?? parts[0];
  for (const p of parts) if (p !== merged) p.dispose();
  return merged;
}

/** Cách mép lối ≥ 1 m để thấy được (R-MANG-1). */
const PATH_CLEAR = 1;

function segDist(x: number, z: number, a: XZ, b: XZ): number {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const L = dx * dx + dz * dz;
  const k = L > 0 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L)) : 0;
  return Math.hypot(x - (a[0] + k * dx), z - (a[1] + k * dz));
}

/**
 * Chỗ măng mọc được (R-MANG-1): không trên lối (cách mép ≥ 1 m), không trên đài đá, không trong vật cản / nước / ngoài ranh
 * (vật cản đã dựng trong [colliders]). Dùng ở `haiMang.ts` và `scripts/check-scene.mjs`.
 */
export function mangSpotOk(spec: Pick<SceneSpec, 'paths' | 'terraces'>, colliders: Colliders, groundY: GroundY): (x: number, z: number) => boolean {
  return (x, z) => {
    for (const p of spec.paths) if (segDist(x, z, p.from, p.to) < p.width / 2 + PATH_CLEAR) return false;
    for (const t of spec.terraces) if (Math.abs(x - t.x) < t.w / 2 + 1 && Math.abs(z - t.z) < t.d / 2 + 1) return false;
    const probe = { x, z };
    colliders.resolve(probe, 0.45, groundY(x, z));
    return Math.hypot(probe.x - x, probe.z - z) < 1e-3;
  };
}

export interface MangLam {
  /** Vẽ lại các búp (gọi khi đổi: hái, nhú, sang lứa) */
  set(list: readonly MangView[]): void;
  readonly meshes: readonly THREE.InstancedMesh[];
}

/** Dựng 2 InstancedMesh măng (sức chứa [small] / [big] búp). */
export function addMangLam(scene: THREE.Scene, groundY: GroundY, small = 16, big = 4): MangLam {
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const meshes = [new THREE.InstancedMesh(mangGeometry(SMALL), mat, small), new THREE.InstancedMesh(mangGeometry(BIG), mat, big)];
  const o = new THREE.Object3D();
  for (const m of meshes) {
    markDynamic(m);
    m.frustumCulled = false; // ít búp, rải rộng — khỏi tính khung bao
    m.count = 0;
    scene.add(m);
  }
  return {
    meshes,
    set(list) {
      const n = [0, 0];
      for (const v of list) {
        const which = v.big ? 1 : 0;
        if (!(v.k > 0) || n[which] >= meshes[which].instanceMatrix.count) continue;
        o.position.set(v.x, groundY(v.x, v.z) - 0.02, v.z);
        o.rotation.set(Math.sin(v.x * 3.1) * 0.12, v.x * 1.7 + v.z * 0.9, Math.cos(v.z * 2.3) * 0.12);
        o.scale.set(v.k, v.k * (0.7 + 0.3 * v.k), v.k);
        o.updateMatrix();
        meshes[which].setMatrixAt(n[which]++, o.matrix);
      }
      meshes.forEach((m, i) => {
        m.count = n[i];
        m.instanceMatrix.needsUpdate = true;
      });
    },
  };
}
