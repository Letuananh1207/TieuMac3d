import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { lambert, softMaterial } from './materials';
import { softBlob } from './khoiMem';
import { isSoft, type LookSpec } from './look';
import { addPine, addBush, addPeach, addPlum, addWillow } from './cay_moi';
import { addTallBamboo } from './trucMao';
import { addChumTrees, type ChumUpdate } from './cayChum';
import { seededRandom } from './random';
import { groveTrees, TRUNK_SIZE, type Placed } from './cayTrenNen';
import { addPlanters } from './bonCay';
import type { SceneSpec, TreePlace } from './spec';
import type { GroundY } from './terrainHeight';

export { seededRandom };

const trunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 2.2, 6);
const leafGeo = new THREE.IcosahedronGeometry(1.8, 0);
const LEAF_TIERS = 3;
const stalkGeo = new THREE.CylinderGeometry(0.07, 0.09, 1, 5); // cao 1, kéo theo chiều cao từng cây trúc
const tuftGeo = new THREE.ConeGeometry(0.45, 1.3, 5);
const STALKS = 5; // số thân trong một khóm trúc

export type { Placed };

/** Cây tán: 4 InstancedMesh (thân + 3 tầng lá) cho mọi cây — 4 draw call cả rừng. */
function broadleaf(scene: THREE.Scene, spec: SceneSpec['trees'], all: Placed[], rand: () => number, look?: LookSpec): void {
  if (all.length === 0) return;
  const trunks = new THREE.InstancedMesh(trunkGeo, lambert(spec.trunk), all.length);
  // cảnh mềm: 3 tầng lá cùng một khối tròn sáng trên tối dưới (1 InstancedMesh thay 3), lay gió
  const soft = look && isSoft(look);
  const one = soft
    ? new THREE.InstancedMesh(softBlob(spec.leaves[0], spec.leaves[1], spec.leaves[2], -0.6), softMaterial(look.wrap, THREE.FrontSide, { amp: look.wind * 0.5 }), all.length * LEAF_TIERS)
    : null;
  const leaves = one ? [] : spec.leaves.map((c) => new THREE.InstancedMesh(leafGeo, lambert(c), all.length));
  const tree = new THREE.Matrix4();
  const local = new THREE.Matrix4();
  const part = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const size = new THREE.Vector3();
  all.forEach((t, i) => {
    tree.makeTranslation(t.x, t.y ?? 0, t.z).multiply(local.makeScale(t.scale, t.scale, t.scale));
    trunks.setMatrixAt(i, local.copy(tree).multiply(part.makeTranslation(0, 1.1, 0)));
    for (let k = 0; k < LEAF_TIERS; k++) {
      pos.set((rand() - 0.5) * 1.4, 2.8 + k * 0.7, (rand() - 0.5) * 1.4);
      quat.setFromEuler(euler.set(rand(), rand(), 0));
      size.setScalar(1 - k * 0.18);
      if (one) one.setMatrixAt(i * LEAF_TIERS + k, local.copy(tree).multiply(part.compose(pos, quat, size.multiplyScalar(1.75))));
      else leaves[k].setMatrixAt(i, local.copy(tree).multiply(part.compose(pos, quat, size)));
    }
  });
  finish(scene, one ? [trunks, one] : [trunks, ...leaves]);
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
      stalks.setMatrixAt(i, m.compose(pos.set(x, (t.y ?? 0) + h / 2, z), quat, size.set(t.scale, h, t.scale)));
      tufts.setMatrixAt(i, m.compose(pos.set(x, (t.y ?? 0) + h - 0.2, z), quat, size.setScalar(t.scale)));
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
 * Kiểu `tan` (mặc định) · `truc` · `tung` · `lieu` · `mai` · `truc-mao` (Rừng trúc, cao 12–18 m, đung đưa); mỗi kiểu dãy ngẫu nhiên riêng nên thêm kiểu không xê dịch
 * cây `tan` có sẵn. `trees.crown: "chum"`: mọi kiểu (trừ `truc-mao`) dựng bằng tán chùm nổi, LOD 2 bậc (cayChum.ts). Trả về
 * hàm cập nhật (liễu đung đưa; LOD theo nhân vật `focus` + camera `eye`).
 */
export function addTrees(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec['trees'], groundY?: GroundY, look?: LookSpec): ChumUpdate {
  const rand = seededRandom(spec.seed);
  const { ring } = spec;
  const ringTrees: Placed[] = [];
  for (let i = 0; i < ring.count; i++) {
    const a = (i / ring.count) * Math.PI * 2;
    const r = ring.radius + rand() * ring.spread;
    const scale = ring.scaleMin + rand() * (ring.scaleMax - ring.scaleMin);
    ringTrees.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, scale, collide: false });
  }
  const byKind: Record<NonNullable<TreePlace['kind']>, Placed[]> = { tan: [], truc: [], tung: [], lieu: [], mai: [], 'truc-mao': [], dao: [], bui: [] };
  const put = (kind: TreePlace['kind'], p: Placed): void => void byKind[kind ?? 'tan'].push(p);
  for (const t of spec.yard) put(t.kind, { ...t, collide: true });
  byKind.tan.push(...ringTrees);
  spec.groves.forEach((g, i) => groveTrees(g, spec.seed, i).forEach((p) => put(g.kind, p)));
  // địa hình: đặt gốc mọi cây lên mặt đất
  if (groundY) for (const list of Object.values(byKind)) for (const p of list) p.y = groundY(p.x, p.z);

  // `crown: "chum"` (V-58, V-60): mọi kiểu trừ trúc mao dựng bằng tán chùm nổi, LOD 2 bậc (cayChum.ts) — cảnh cũ / mềm đều dùng được
  const chum = spec.crown === 'chum' && look ? addChumTrees(scene, spec, byKind, look) : null;
  if (!chum) {
    broadleaf(scene, spec, byKind.tan, rand, look);
    bamboo(scene, spec, byKind.truc, spec.seed);
    addPine(scene, spec, byKind.tung, spec.seed, look);
    addPlum(scene, spec, byKind.mai, spec.seed);
    addPeach(scene, spec, byKind.dao, spec.seed);
    addBush(scene, spec, byKind.bui, spec.seed);
  }
  const willow = chum ? () => {} : addWillow(scene, spec, byKind.lieu, spec.seed);
  const mao = addTallBamboo(scene, spec, byKind['truc-mao'], spec.seed);
  const sway: ChumUpdate = (dt, focus, eye) => {
    willow(dt);
    mao(dt);
    chum?.update(dt, focus, eye);
  };
  // va chạm: thân cây, to nhỏ theo kiểu; bồn cây (R-VA-6) luôn chặn, bằng cỡ bồn (kể cả cụm `collide: false`)
  const pots: { x: number; z: number; y: number; r: number }[] = [];
  for (const [kind, list] of Object.entries(byKind) as [keyof typeof TRUNK_SIZE, Placed[]][]) {
    for (const t of list) {
      const side = TRUNK_SIZE[kind] * t.scale;
      if (t.planter) {
        pots.push({ x: t.x, z: t.z, y: t.y ?? 0, r: (side / 2) * spec.planter.size });
        colliders.add(t.x, t.z, side * spec.planter.size, side * spec.planter.size);
      } else if (t.collide) colliders.add(t.x, t.z, side, side);
    }
  }
  addPlanters(scene, pots, spec.planter);
  return sway;
}
