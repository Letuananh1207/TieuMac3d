import * as THREE from 'three';
import type { Heightfield } from '../collision/heightfield';
import { brickTexture, paveTileM } from './environment';
import { lambert } from './materials';
import type { SceneSpec } from './spec';

/** Sân lát nổi trên mặt đất một chút để không nhấp nháy (z-fighting). */
const PAVE_LIFT = 0.03;

function hash(i: number, j: number): number {
  const h = Math.imul(i, 73856093) ^ Math.imul(j, 19349663);
  return ((h ^ (h >>> 13)) >>> 0) % 3;
}

/**
 * Lưới địa hình: mỗi tam giác một màu theo độ dốc + độ cao (flat shading, kiểu low-poly), một draw call.
 * Cách chia tam giác khớp `collision/heightfield.ts`. Trả về lưới để dò điểm chạm (chạm để đi).
 */
export function addTerrain(scene: THREE.Scene, spec: SceneSpec, hf: Heightfield): THREE.Mesh {
  const t = spec.terrain;
  const { nx, nz, cell, originX, originZ } = hf;
  const tris = nx * nz * 2;
  const pos = new Float32Array(tris * 9);
  const col = new Float32Array(tris * 9);
  const grass = t.colors.grass.map((c) => new THREE.Color(c));
  const dirt = new THREE.Color(t.colors.dirt);
  const rock = new THREE.Color(t.colors.rock);
  const high = new THREE.Color(t.colors.highRock);
  const cosDirt = Math.cos((t.slopeDirt * Math.PI) / 180);
  const cosRock = Math.cos((t.slopeRock * Math.PI) / 180);
  const e1 = new THREE.Vector3();
  const e2 = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  let k = 0;

  const tri = (ax: number, az: number, bx: number, bz: number, cx: number, cz: number, i: number, j: number): void => {
    const ay = hf.vertex(ax, az);
    const by = hf.vertex(bx, bz);
    const cy = hf.vertex(cx, cz);
    const P = [
      [originX + ax * cell, ay, originZ + az * cell],
      [originX + bx * cell, by, originZ + bz * cell],
      [originX + cx * cell, cy, originZ + cz * cell],
    ];
    e1.set(P[1][0] - P[0][0], P[1][1] - P[0][1], P[1][2] - P[0][2]);
    e2.set(P[2][0] - P[0][0], P[2][1] - P[0][1], P[2][2] - P[0][2]);
    nrm.crossVectors(e1, e2).normalize();
    const ny = Math.abs(nrm.y);
    const avg = (ay + by + cy) / 3;
    let c: THREE.Color;
    if (ny >= cosDirt) c = grass[hash(i, j)];
    else if (ny >= cosRock) c = dirt;
    else c = avg > t.colors.highFrom ? high : rock;
    for (const p of P) {
      pos[k] = p[0];
      pos[k + 1] = p[1];
      pos[k + 2] = p[2];
      col[k] = c.r;
      col[k + 1] = c.g;
      col[k + 2] = c.b;
      k += 3;
    }
  };

  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      // a = (i, j), b = (i+1, j), c = (i, j+1), d = (i+1, j+1); tam giác (a, c, b) và (b, c, d) — mặt hướng lên
      tri(i, j, i, j + 1, i + 1, j, i, j);
      tri(i + 1, j, i, j + 1, i + 1, j + 1, i + 1, j);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals(); // lưới không chia sẻ đỉnh → pháp tuyến từng mặt (flat)
  const mesh = new THREE.Mesh(geo, lambert(0xffffff, { vertexColors: true, flatShading: true }));
  scene.add(mesh);

  addPaving(scene, spec);
  return mesh;
}

/** Sân lát gạch trên các bục `pave`; cùng một texture, UV theo mét → gộp được thành một draw call. */
function addPaving(scene: THREE.Scene, spec: SceneSpec): void {
  const paved = spec.terrain.plateaus.filter((p) => p.pave);
  if (!paved.length) return;
  const tex = brickTexture(spec.ground);
  const tile = paveTileM(spec.ground);
  const mat = lambert(0xffffff, { map: tex });
  for (const p of paved) {
    const w = Math.abs(p.to[0] - p.from[0]);
    const d = Math.abs(p.to[1] - p.from[1]);
    const geo = new THREE.PlaneGeometry(w, d);
    const uv = geo.getAttribute('uv') as THREE.BufferAttribute;
    const cx = (p.from[0] + p.to[0]) / 2;
    const cz = (p.from[1] + p.to[1]) / 2;
    // UV theo toạ độ cảnh (x, −z): mạch gạch các bục và lối lát `pathLook: "san"` (paths.ts) liền nhau
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (cx + (uv.getX(i) - 0.5) * w) / tile, (-cz + (uv.getY(i) - 0.5) * d) / tile);
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(cx, p.y + PAVE_LIFT, cz);
    scene.add(m);
  }
}
