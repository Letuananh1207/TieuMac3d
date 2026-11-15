import * as THREE from 'three';
import type { Heightfield } from '../collision/heightfield';
import { onBuilt } from './grass';
import type { LookSpec } from './look';
import { softMaterial } from './materials';
import { seededRandom } from './random';
import type { PathSpec, SceneSpec } from './spec';
import { finish } from './trees';

type Terrain = SceneSpec['terrain'];

/** Tối đa cho điện thoại (kế hoạch 2026-11-14-canh-dep NV9): mỗi loại một InstancedMesh = một draw call. */
export const MAX_SOFT_TUFTS = 1500;
export const MAX_FLOWERS = 600;
const GRASS_SLOPE = 25;
/** chiều cao búi cỏ mềm (m) — gió lay theo tỉ lệ độ cao / số này */
const TUFT_H = 0.5;

/** Cạnh ô chia cỏ (m): mỗi ô một InstancedMesh → ô ngoài khung nhìn không vẽ (cỏ trải cả cao nguyên). */
export const GRASS_TILE = 60;

/** Búi cỏ mềm: 4 lá (mỗi lá 1 tam giác hơi ngả), gốc tối → ngọn sáng (màu đỉnh, nhân với màu búi); pháp tuyến hướng lên. */
export function softTuftGeometry(): THREE.BufferGeometry {
  const pos: number[] = [];
  const col: number[] = [];
  const shadeAt = (y: number): number => 0.55 + 0.6 * (y / TUFT_H);
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI * 2) / 4 + 0.3;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const out = 0.06 + 0.05 * (k % 2); // ngả ra ngoài
    const w = 0.05;
    const b0 = [-w * s, 0, w * c];
    const b1 = [w * s, 0, -w * c];
    const tip = [out * 2.6 * c, TUFT_H * (0.85 + 0.15 * (k % 2)), out * 2.6 * s];
    for (const v of [b0, b1, tip]) {
      pos.push(v[0], v[1], v[2]);
      const g = shadeAt(v[1]);
      col.push(g, g, g);
    }
  }
  return withUpNormals(pos, col);
}

/** Bông hoa: 5 cánh dẹt quanh nhị, cao 0,28 m trên đất; nhị ngả vàng (màu đỉnh nhân với màu bông). 5 tam giác. */
export function flowerGeometry(): THREE.BufferGeometry {
  const pos: number[] = [];
  const col: number[] = [];
  const y = 0.3;
  const r = 0.16;
  for (let k = 0; k < 5; k++) {
    const a0 = (k / 5) * Math.PI * 2;
    const a1 = ((k + 1) / 5) * Math.PI * 2;
    pos.push(0, y + 0.02, 0, Math.cos(a1) * r, y + 0.035, Math.sin(a1) * r, Math.cos(a0) * r, y + 0.035, Math.sin(a0) * r);
    col.push(1, 0.92, 0.55, 1, 1, 1, 1, 1, 1);
  }
  return withUpNormals(pos, col);
}

function withUpNormals(pos: number[], col: number[]): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(pos.map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  return geo;
}

/**
 * Cỏ mềm + hoa thành khóm cho cảnh "mềm" (NV9): cỏ theo `terrain.grass` (mật độ × `detail`), hoa theo `look.flowers`
 * (khóm 5–14 bông quanh tâm khóm, mật độ × `detail`). Chỉ trên đất cỏ thoải (< 25°), ngoài bục lát / lối / bậc — như cỏ cũ.
 * Gió lay ngọn (`look.wind`). Mức Thấp `detail` 0,5 → thưa một nửa (R-HIEU-1). Hoa 1 draw call; cỏ mỗi ô `GRASS_TILE` một
 * draw call, chỉ ô trong khung nhìn được vẽ.
 */
export function addSoftGrassAndFlowers(
  scene: THREE.Scene,
  t: Terrain,
  hf: Heightfield,
  paths: PathSpec[],
  look: LookSpec,
  detail: number,
  /** chỗ có vật trồng (luống chè — V-46): búi / bông rơi vào đó bị bỏ (không dời chỗ khác — cỏ nơi khác giữ nguyên) */
  blocked?: (x: number, z: number) => boolean,
): void {
  const [cx, cz] = t.center;
  const R = t.edge.radius - 2;
  const area = Math.PI * R * R;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const p = new THREE.Vector3();
  const size = new THREE.Vector3();
  const tint = new THREE.Color();
  const ok = (x: number, z: number): number | null => {
    const y = hf.heightAt(x, z);
    if (!Number.isFinite(y) || y < -1 || hf.slopeAt(x, z) > GRASS_SLOPE || onBuilt(t, paths, x, z)) return null;
    return y;
  };
  const sample = (rand: () => number): [number, number] => {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * R;
    return [cx + Math.cos(a) * r, cz + Math.sin(a) * r];
  };

  const tufts = Math.min(MAX_SOFT_TUFTS, Math.round((t.grass.density * area * detail) / 100));
  if (tufts > 0) {
    const rand = seededRandom(t.noise.seed * 31 + 5);
    const mat = softMaterial(look.wrap, THREE.DoubleSide, { amp: look.wind * 2, tip: TUFT_H });
    const geo = softTuftGeometry();
    const colors = t.grass.colors.map((c) => new THREE.Color(c));
    const tiles = new Map<string, { m: THREE.Matrix4; c: THREE.Color }[]>();
    let n = 0;
    for (let tries = 0; tries < tufts * 6 && n < tufts; tries++) {
      const [x, z] = sample(rand);
      const y = ok(x, z);
      if (y === null) continue;
      const s = 0.7 + rand() * 0.8;
      const key = `${Math.floor(x / GRASS_TILE)},${Math.floor(z / GRASS_TILE)}`;
      const it = {
        m: new THREE.Matrix4().compose(p.set(x, y - 0.02, z), q.setFromEuler(e.set(0, rand() * Math.PI * 2, 0)), size.set(s, s * (0.8 + rand() * 0.6), s)),
        c: tint.copy(colors[0]).lerp(colors[1], rand()).clone(),
      };
      n++;
      if (blocked?.(x, z)) continue;
      const list = tiles.get(key) ?? [];
      list.push(it);
      tiles.set(key, list);
    }
    const meshes = [...tiles.values()].map((list) => {
      const mesh = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach((it, i) => {
        mesh.setMatrixAt(i, it.m);
        mesh.setColorAt(i, it.c);
      });
      return mesh;
    });
    if (meshes.length) finish(scene, meshes);
  }

  const flowers = Math.min(MAX_FLOWERS, Math.round((look.flowers.density * area * detail) / 100));
  if (flowers > 0) {
    const rand = seededRandom(t.noise.seed * 71 + 13);
    const mesh = new THREE.InstancedMesh(flowerGeometry(), softMaterial(look.wrap, THREE.DoubleSide, { amp: look.wind }), flowers);
    const colors = look.flowers.colors.map((c) => new THREE.Color(c));
    let n = 0;
    let placed = 0;
    for (let tries = 0; tries < flowers * 4 && n < flowers; tries++) {
      const [x0, z0] = sample(rand);
      if (ok(x0, z0) === null) continue;
      const kind = Math.floor(rand() * colors.length); // một khóm một màu chính, xen ít màu khác
      const count = 5 + Math.floor(rand() * 10);
      for (let f = 0; f < count && n < flowers; f++) {
        const a = rand() * Math.PI * 2;
        const r = Math.sqrt(rand()) * 1.5;
        const x = x0 + Math.cos(a) * r;
        const z = z0 + Math.sin(a) * r;
        const y = ok(x, z);
        if (y === null) continue;
        const s = 0.8 + rand() * 0.5;
        const tilt = q.setFromEuler(e.set((rand() - 0.5) * 0.4, rand() * Math.PI * 2, (rand() - 0.5) * 0.4));
        m.compose(p.set(x, y, z), tilt, size.set(s, s * (0.7 + rand() * 0.6), s));
        const c = colors[rand() < 0.8 ? kind : Math.floor(rand() * colors.length)];
        n++;
        if (blocked?.(x, z)) continue;
        mesh.setMatrixAt(placed, m);
        mesh.setColorAt(placed++, c);
      }
    }
    mesh.count = placed;
    if (placed) finish(scene, [mesh]);
  }
}
