import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { lambert } from './materials';
import type { SceneSpec } from './spec';

const trunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 2.2, 6);
const leafGeo = new THREE.IcosahedronGeometry(1.8, 0);
const LEAF_TIERS = 3;

interface TreePlace {
  x: number;
  z: number;
  scale: number;
}

/** Số giả ngẫu nhiên có hạt giống (mulberry32): cùng `seed` → cùng dãy, nên cây ở Canvas 3D và app giống nhau. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Mọi cây vẽ bằng 4 InstancedMesh (thân + 3 tầng lá): 4 draw call cho cả rừng, thay vì 4 mỗi cây.
 * Cây trong sân có va chạm; vòng cây ngoài tường chỉ để trang trí.
 */
export function addTrees(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec['trees']): void {
  const rand = seededRandom(spec.seed);
  const { ring } = spec;
  const ringTrees: TreePlace[] = [];
  for (let i = 0; i < ring.count; i++) {
    const a = (i / ring.count) * Math.PI * 2;
    const r = ring.radius + rand() * ring.spread;
    const scale = ring.scaleMin + rand() * (ring.scaleMax - ring.scaleMin);
    ringTrees.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, scale });
  }
  const all = [...spec.yard, ...ringTrees];
  if (all.length === 0) return;

  const trunks = new THREE.InstancedMesh(trunkGeo, lambert(spec.trunk), all.length);
  const leaves = spec.leaves.map((c) => new THREE.InstancedMesh(leafGeo, lambert(c), all.length));

  const tree = new THREE.Matrix4();
  const local = new THREE.Matrix4();
  const part = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const size = new THREE.Vector3();
  all.forEach((t, i) => {
    tree.makeTranslation(t.x, 0, t.z).multiply(local.makeScale(t.scale, t.scale, t.scale));
    trunks.setMatrixAt(i, local.copy(tree).multiply(part.makeTranslation(0, 1.1, 0)));
    for (let k = 0; k < LEAF_TIERS; k++) {
      pos.set((rand() - 0.5) * 1.4, 2.8 + k * 0.7, (rand() - 0.5) * 1.4);
      quat.setFromEuler(euler.set(rand(), rand(), 0));
      size.setScalar(1 - k * 0.18);
      leaves[k].setMatrixAt(i, local.copy(tree).multiply(part.compose(pos, quat, size)));
    }
  });
  for (const m of [trunks, ...leaves]) {
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere(); // để three cắt cả cụm khi ra khỏi khung nhìn
    scene.add(m);
  }

  for (const t of spec.yard) colliders.add(t.x, t.z, 0.8 * t.scale, 0.8 * t.scale);
}
