import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { lambert } from './materials';

const trunkMat = lambert(0x4a3222);
const leafMats = [lambert(0x2f4a2c), lambert(0x37552f), lambert(0x26402a)];
const trunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 2.2, 6);
const leafGeo = new THREE.IcosahedronGeometry(1.8, 0);

/** Cây trong sân (có va chạm): [x, z, tỉ lệ]. */
export const YARD_TREES: [number, number, number][] = [
  [14, -14, 1.2],
  [15, 12, 1.1],
  [-15, 15, 1.3],
  [8, 8, 0.9],
  [-6, 12, 1],
];

// TODO mốc 4: gộp bằng InstancedMesh. Hiện mỗi cây tốn 4 draw call.
export function addTree(scene: THREE.Scene, x: number, z: number, s: number, colliders?: Colliders): void {
  const t = new THREE.Group();
  t.position.set(x, 0, z);
  t.scale.setScalar(s);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.1;
  t.add(trunk);
  for (let i = 0; i < 3; i++) {
    const l = new THREE.Mesh(leafGeo, leafMats[i]);
    l.position.set((Math.random() - 0.5) * 1.4, 2.8 + i * 0.7, (Math.random() - 0.5) * 1.4);
    l.rotation.set(Math.random(), Math.random(), 0);
    l.scale.setScalar(1 - i * 0.18);
    t.add(l);
  }
  scene.add(t);
  colliders?.add(x, z, 0.8 * s, 0.8 * s);
}

export function addTrees(scene: THREE.Scene, colliders: Colliders): void {
  for (const [x, z, s] of YARD_TREES) addTree(scene, x, z, s, colliders);
  // vòng cây ngoài tường, chỉ để trang trí (không va chạm)
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const r = 25 + Math.random() * 6;
    addTree(scene, Math.cos(a) * r, Math.sin(a) * r, 1.6 + Math.random() * 0.8);
  }
}
