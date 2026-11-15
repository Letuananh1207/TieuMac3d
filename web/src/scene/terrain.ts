import * as THREE from 'three';
import type { Heightfield } from '../collision/heightfield';
import { brickTexture, paveTileM } from './environment';
import { lambert, softMaterial } from './materials';
import { isSoft } from './look';
import { shadeGround } from './terrainMem';
import { markDynamic } from './merge';
import type { SceneSpec } from './spec';

/** Sân lát nổi trên mặt đất một chút để không nhấp nháy (z-fighting). */
const PAVE_LIFT = 0.03;
/** Chất nền khu (`terrain.floors`) nổi trên sân lát (lối lát `paths` nằm trên nữa: `PATH_LIFT` 0,05). */
const FLOOR_LIFT = 0.04;

function hash(i: number, j: number): number {
  const h = Math.imul(i, 73856093) ^ Math.imul(j, 19349663);
  return ((h ^ (h >>> 13)) >>> 0) % 3;
}

/**
 * Địa hình chia thành mảnh `TERRAIN_TILE` × `TERRAIN_TILE` ô: mảnh ngoài khung nhìn không vẽ (three tự cắt bỏ theo khung
 * bao từng mảnh). Một lưới liền ~45k tam giác thì mọi khung đều vẽ hết dù màn dọc chỉ nhìn ngang ~27° (bench 2026-11-14,
 * kế hoạch 2026-11-14-muot-ma-nhu-game). Hình dáng, màu không đổi; thêm vài draw call cho các mảnh đang thấy.
 */
export const TERRAIN_TILE = 24;

/**
 * Lưới địa hình: mỗi tam giác một màu theo độ dốc + độ cao (flat shading, kiểu low-poly), chia mảnh `TERRAIN_TILE`.
 * Cách chia tam giác khớp `collision/heightfield.ts`. Trả về nhóm các mảnh để dò điểm chạm (tia dò cần `recursive`).
 */
export function addTerrain(scene: THREE.Scene, spec: SceneSpec, hf: Heightfield): THREE.Group {
  const t = spec.terrain;
  const { nx, nz, cell, originX, originZ } = hf;
  let pos = new Float32Array(0);
  let col = new Float32Array(0);
  let nor = new Float32Array(0);
  // cảnh mềm: màu + pháp tuyến theo đỉnh lưới (chuyển mượt, mảng cỏ lớn) — terrainMem.ts
  const shade = isSoft(spec.look) ? shadeGround(spec, hf) : null;
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
    const grid: [number, number][] = [
      [ax, az],
      [bx, bz],
      [cx, cz],
    ];
    P.forEach((p, v) => {
      pos[k] = p[0];
      pos[k + 1] = p[1];
      pos[k + 2] = p[2];
      if (shade) {
        const s = (grid[v][1] * (nx + 1) + grid[v][0]) * 3;
        col.set(shade.colors.subarray(s, s + 3), k);
        nor.set(shade.normals.subarray(s, s + 3), k);
      } else {
        col[k] = c.r;
        col[k + 1] = c.g;
        col[k + 2] = c.b;
      }
      k += 3;
    });
  };

  const group = new THREE.Group();
  markDynamic(group); // mergeStatic không gộp các mảnh lại thành một (mất cắt bỏ)
  const mat = shade ? softMaterial(spec.look.wrap) : lambert(0xffffff, { vertexColors: true, flatShading: true });
  for (let j0 = 0; j0 < nz; j0 += TERRAIN_TILE) {
    for (let i0 = 0; i0 < nx; i0 += TERRAIN_TILE) {
      const j1 = Math.min(nz, j0 + TERRAIN_TILE);
      const i1 = Math.min(nx, i0 + TERRAIN_TILE);
      const tris = (j1 - j0) * (i1 - i0) * 2;
      pos = new Float32Array(tris * 9);
      col = new Float32Array(tris * 9);
      if (shade) nor = new Float32Array(tris * 9);
      k = 0;
      for (let j = j0; j < j1; j++) {
        for (let i = i0; i < i1; i++) {
          // a = (i, j), b = (i+1, j), c = (i, j+1), d = (i+1, j+1); tam giác (a, c, b) và (b, c, d) — mặt hướng lên
          tri(i, j, i, j + 1, i + 1, j, i, j);
          tri(i + 1, j, i, j + 1, i + 1, j + 1, i + 1, j);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      if (shade) geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); // pháp tuyến mượt theo đỉnh lưới
      else geo.computeVertexNormals(); // lưới không chia sẻ đỉnh → pháp tuyến từng mặt (flat)
      group.add(new THREE.Mesh(geo, mat));
    }
  }
  scene.add(group);

  addPaving(scene, spec);
  addFloors(scene, spec);
  return group;
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

/** Màu gốc của texture chất nền (xám giữa); màu từng khu = màu đỉnh nhân vào (`FLOOR_BASE` × màu đỉnh = `color`). */
const FLOOR_BASE = '#b4b4b4';

/**
 * Chất nền từng khu (`terrain.floors`, V-42): cùng mặt phẳng với sân lát, vẽ đè nhờ polygonOffset (lối lát `paths` —
 * factor −1, units −2 — vẫn nằm trên). Mọi nền cùng kiểu gạch dựng thành **một khối** (một texture xám, màu từng khu nằm ở
 * màu đỉnh) → 1 draw call cho mọi khu cùng kiểu. Các nền không chồng nhau (chồng → chớp).
 */
function addFloors(scene: THREE.Scene, spec: SceneSpec): void {
  const byPattern = new Map<string, SceneSpec['terrain']['floors']>();
  for (const f of spec.terrain.floors) {
    const pat = f.pattern ?? 'vuong';
    byPattern.set(pat, [...(byPattern.get(pat) ?? []), f]);
  }
  const base = new THREE.Color(FLOOR_BASE);
  for (const [pattern, floors] of byPattern) {
    const gs: SceneSpec['ground'] = { ...spec.ground, color: FLOOR_BASE, pattern: pattern as SceneSpec['ground']['pattern'] };
    const tile = paveTileM(gs);
    const pos: number[] = [];
    const uv: number[] = [];
    const col: number[] = [];
    for (const f of floors) {
      const c = new THREE.Color(f.color);
      const tint = [c.r / base.r, c.g / base.g, c.b / base.b];
      const [x0, x1] = [Math.min(f.from[0], f.to[0]), Math.max(f.from[0], f.to[0])];
      const [z0, z1] = [Math.min(f.from[1], f.to[1]), Math.max(f.from[1], f.to[1])];
      // trên mặt sân lát 1 cm (V-44: chỉ nhờ polygonOffset thì nhìn từ xa / từ trên vẫn chớp sọc), dưới lối lát (`PATH_LIFT`)
      const y = (f.y ?? 0) + FLOOR_LIFT;
      // hai tam giác hướng lên: (x0,z1) (x1,z1) (x1,z0) · (x0,z1) (x1,z0) (x0,z0); UV theo toạ độ cảnh (x, −z) như sân lát
      for (const [x, z] of [[x0, z1], [x1, z1], [x1, z0], [x0, z1], [x1, z0], [x0, z0]]) {
        pos.push(x, y, z);
        uv.push(x / tile, -z / tile);
        col.push(...tint);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals();
    const mat = lambert(0xffffff, { map: brickTexture(gs), vertexColors: true, polygonOffset: true, polygonOffsetFactor: -0.5, polygonOffsetUnits: -1 });
    scene.add(new THREE.Mesh(geo, mat));
  }
}
