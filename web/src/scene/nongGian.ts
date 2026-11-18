/**
 * Giàn bầu bí (V-114 — R-NONG-1, R-NONG-6): 3 vòm tre qua lối trục (đi qua dưới được, cột chặn), thanh dọc, ụ đất hai gốc,
 * dây cũ thưa luôn có; lá + quả theo gốc (`VineLeaves`); mờ khi camera chui dưới vòm (như mái nhà — R-HUD-2).
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { lambert } from './materials';
import type { FarmSpec } from './nongSpec';
import type { GroundY } from './terrainHeight';
import { addStatic, cucumberGeometry, gourdGeometry, VineLeaves, type Rect } from './nongVat';

const CYL = new THREE.CylinderGeometry(1, 1, 1, 6);
const SPHERE = new THREE.SphereGeometry(1, 8, 6);
const BLOB = new THREE.IcosahedronGeometry(1, 0);

export function addTrellis(scene: THREE.Scene, colliders: Colliders, f: FarmSpec, groundY: GroundY) {
  const g = new THREE.Group();
  const c = f.colors;
  const t = f.trellis;
  const y = groundY(t.x, (t.z0 + t.z1) / 2);
  const h = t.half;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-h, 0, 0),
    new THREE.Vector3(-h, 1.9, 0),
    new THREE.Vector3(-h * 0.65, t.height - 0.3, 0),
    new THREE.Vector3(0, t.height, 0),
    new THREE.Vector3(h * 0.65, t.height - 0.3, 0),
    new THREE.Vector3(h, 1.9, 0),
    new THREE.Vector3(h, 0, 0),
  ]);
  const arch = new THREE.TubeGeometry(curve, 28, 0.055, 5, false);
  const zs = [t.z0, (t.z0 + t.z1) / 2, t.z1];
  for (const z of zs) {
    const m = new THREE.Mesh(arch, lambert(c.bamboo));
    m.position.set(t.x, y, z);
    g.add(m);
    for (const s of [-1, 1]) colliders.add(t.x + s * h, z, 0.3, 0.3);
  }
  // thanh dọc nối các vòm
  const len = t.z1 - t.z0 + 0.4;
  for (const u of [0.12, 0.25, 0.37, 0.5, 0.63, 0.75, 0.88]) {
    const p = curve.getPoint(u);
    const m = new THREE.Mesh(CYL, lambert(c.bamboo));
    m.position.set(t.x + p.x, y + p.y, (t.z0 + t.z1) / 2);
    m.rotation.x = Math.PI / 2;
    m.scale.set(0.035, len, 0.035);
    g.add(m);
  }
  // ụ đất hai gốc
  const roots = { bau: new THREE.Vector3(t.x - h - 0.3, y, zs[1]), 'dua-leo': new THREE.Vector3(t.x + h + 0.3, y, zs[1]) };
  for (const r of Object.values(roots)) {
    const mound = new THREE.Mesh(SPHERE, lambert('#6e5238'));
    mound.position.set(r.x, y + 0.01, r.z);
    mound.scale.set(0.3, 0.07, 0.42);
    g.add(mound);
  }
  // dây cũ quấn giàn (luôn có — giàn không trơ khi gốc trống): vài chùm lá thưa trên cột và vòm
  for (const z of zs)
    for (const u of [0.04, 0.1, 0.17, 0.3, 0.5, 0.7, 0.83, 0.9, 0.96]) {
      const p = curve.getPoint(u);
      const lf = new THREE.Mesh(BLOB, lambert('#5f8a44'));
      lf.position.set(t.x + p.x + (u < 0.5 ? 0.05 : -0.05), y + p.y, z + ((u * 13) % 1 - 0.5) * 0.3);
      lf.scale.set(0.16, 0.07, 0.2);
      lf.rotation.set(u * 5, u * 9, 0);
      g.add(lf);
    }
  addStatic(scene, g);
  const frame = g;
  // lá theo gốc: tây = bầu (nửa u 0 → 0,55), đông = dưa leo (u 1 → 0,45); quả treo dưới vòm
  const side = (u0: number, u1: number): THREE.Vector3[] => {
    const out: THREE.Vector3[] = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const u = u0 + ((u1 - u0) * i) / steps;
      const p = curve.getPoint(u);
      for (const z of zs) out.push(new THREE.Vector3(t.x + p.x, y + p.y, z));
    }
    return out;
  };
  const hang = (u: number, z: number): THREE.Vector3 => {
    const p = curve.getPoint(u);
    return new THREE.Vector3(t.x + p.x, y + p.y - 0.05, z);
  };
  const bau = new VineLeaves(scene, side(0, 0.55), [hang(0.3, t.z0 + 0.5), hang(0.36, zs[1] + 0.3), hang(0.28, t.z1 - 0.4)], c.leaf, gourdGeometry());
  const dua = new VineLeaves(scene, side(1, 0.45), [hang(0.7, t.z0 + 0.7), hang(0.66, zs[1] - 0.2), hang(0.73, t.z1 - 0.3), hang(0.62, zs[1] + 0.5)], c.leaf, cucumberGeometry());
  const rect: Rect = { x0: t.x - h - 0.8, x1: t.x + h + 0.8, z0: t.z0 - 0.4, z1: t.z1 + 0.4 };
  // camera chui dưới vòm (mới vào nhà, camera sau lưng) → giàn mờ dần như mái nhà khi vào trong (R-HUD-2) để không che nhìn
  const mats: THREE.Material[] = [];
  for (const o of [frame, bau.leaves, bau.fruit, dua.leaves, dua.fruit])
    o.traverse((m) => {
      if (m instanceof THREE.Mesh && !Array.isArray(m.material)) mats.push(m.material);
    });
  let k = 1;
  const fade = (dt: number, eye?: { x: number; y: number; z: number }): void => {
    const inside = !!eye && eye.x > rect.x0 && eye.x < rect.x1 && eye.z > rect.z0 - 0.6 && eye.z < rect.z1 + 0.6 && eye.y < y + t.height + 0.6;
    const want = inside ? 0.2 : 1;
    if (k === want) return;
    k = want > k ? Math.min(want, k + dt / 0.3) : Math.max(want, k - dt / 0.3);
    for (const m of mats) {
      m.transparent = k < 1;
      m.opacity = k;
      m.depthWrite = k >= 1;
    }
  };
  return { rect, roots, vines: { bau, 'dua-leo': dua }, fade };
}

