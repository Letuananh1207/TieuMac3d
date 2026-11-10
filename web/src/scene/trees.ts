import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { lambert } from './materials';
import { addPine, addPlum, addWillow } from './cay_moi';
import type { Updater } from './props';
import { seededRandom } from './random';
import type { GroveSpec, SceneSpec, TreePlace } from './spec';

export { seededRandom };

const trunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 2.2, 6);
const leafGeo = new THREE.IcosahedronGeometry(1.8, 0);
const LEAF_TIERS = 3;
const stalkGeo = new THREE.CylinderGeometry(0.07, 0.09, 1, 5); // cao 1, kéo theo chiều cao từng cây trúc
const tuftGeo = new THREE.ConeGeometry(0.45, 1.3, 5);
const STALKS = 5; // số thân trong một khóm trúc

export interface Placed {
  x: number;
  z: number;
  scale: number;
  collide: boolean;
}

/** Cụm cây rải trong hình chữ nhật. Mỗi cụm một dãy ngẫu nhiên riêng: thêm cụm không xê dịch cây có sẵn. */
function groveTrees(g: GroveSpec, seed: number, index: number): Placed[] {
  const rand = seededRandom(seed * 7919 + index + 1);
  return Array.from({ length: g.count }, () => ({
    x: g.x + (rand() - 0.5) * g.w,
    z: g.z + (rand() - 0.5) * g.d,
    scale: 0.8 + rand() * 0.5,
    collide: g.collide ?? true,
  }));
}

/** Cây tán: 4 InstancedMesh (thân + 3 tầng lá) cho mọi cây — 4 draw call cả rừng. */
function broadleaf(scene: THREE.Scene, spec: SceneSpec['trees'], all: Placed[], rand: () => number): void {
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
  finish(scene, [trunks, ...leaves]);
}

/** Trúc: mỗi khóm 5 thân cao gầy, ngọn có túm lá — 2 InstancedMesh cho mọi khóm. */
function bamboo(scene: THREE.Scene, spec: SceneSpec['trees'], all: Placed[], seed: number): void {
  if (all.length === 0) return;
  const rand = seededRandom(seed * 104729 + 3);
  const n = all.length * STALKS;
  const stalks = new THREE.InstancedMesh(stalkGeo, lambert(spec.bamboo[0]), n);
  const tufts = new THREE.InstancedMesh(tuftGeo, lambert(spec.bamboo[1]), n);
  const m = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const size = new THREE.Vector3();
  let i = 0;
  for (const t of all) {
    for (let k = 0; k < STALKS; k++, i++) {
      const h = (4 + rand() * 3) * t.scale;
      const lean = (rand() - 0.5) * 0.18;
      const x = t.x + (rand() - 0.5) * 0.9 * t.scale;
      const z = t.z + (rand() - 0.5) * 0.9 * t.scale;
      quat.setFromEuler(euler.set(lean, 0, lean));
      stalks.setMatrixAt(i, m.compose(pos.set(x, h / 2, z), quat, size.set(t.scale, h, t.scale)));
      tufts.setMatrixAt(i, m.compose(pos.set(x, h - 0.2, z), quat, size.setScalar(t.scale)));
    }
  }
  finish(scene, [stalks, tufts]);
}

export function finish(scene: THREE.Scene, meshes: THREE.InstancedMesh[]): void {
  for (const m of meshes) {
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere(); // để three cắt cả cụm khi ra khỏi khung nhìn
    scene.add(m);
  }
}

/**
 * Cây lẻ (`yard`, có va chạm), cụm cây (`groves`), vòng cây ngoài tường (`ring`, chỉ trang trí).
 * Kiểu `tan` (mặc định) · `truc` · `tung` · `lieu` · `mai`; mỗi kiểu dãy ngẫu nhiên riêng nên thêm kiểu không xê dịch
 * cây `tan` có sẵn. Trả về hàm cập nhật (liễu đung đưa).
 */
export function addTrees(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec['trees']): Updater {
  const rand = seededRandom(spec.seed);
  const { ring } = spec;
  const ringTrees: Placed[] = [];
  for (let i = 0; i < ring.count; i++) {
    const a = (i / ring.count) * Math.PI * 2;
    const r = ring.radius + rand() * ring.spread;
    const scale = ring.scaleMin + rand() * (ring.scaleMax - ring.scaleMin);
    ringTrees.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, scale, collide: false });
  }
  const byKind: Record<NonNullable<TreePlace['kind']>, Placed[]> = { tan: [], truc: [], tung: [], lieu: [], mai: [] };
  const put = (kind: TreePlace['kind'], p: Placed): void => void byKind[kind ?? 'tan'].push(p);
  for (const t of spec.yard) put(t.kind, { ...t, collide: true });
  byKind.tan.push(...ringTrees);
  spec.groves.forEach((g, i) => groveTrees(g, spec.seed, i).forEach((p) => put(g.kind, p)));

  broadleaf(scene, spec, byKind.tan, rand);
  bamboo(scene, spec, byKind.truc, spec.seed);
  addPine(scene, spec, byKind.tung, spec.seed);
  addPlum(scene, spec, byKind.mai, spec.seed);
  const sway = addWillow(scene, spec, byKind.lieu, spec.seed);
  // va chạm: thân cây, to nhỏ theo kiểu
  const trunkSize = { tan: 0.8, truc: 1.2, tung: 0.9, lieu: 0.8, mai: 0.5 } as const;
  for (const [kind, list] of Object.entries(byKind) as [keyof typeof trunkSize, Placed[]][]) {
    for (const t of list) if (t.collide) colliders.add(t.x, t.z, trunkSize[kind] * t.scale, trunkSize[kind] * t.scale);
  }
  return sway;
}
