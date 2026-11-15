/**
 * Cây "tán chùm nổi" (`trees.crown: "chum"`, V-58 — hồ sơ `docs/tham_khao/thuc-vat-dep-nhe.md`): thân + tán một hình
 * (`softCrown` + `softLimb`, cùng `softMaterial`, gió theo độ cao — thân đứng yên, tán lay), mỗi kiểu một hình mẫu dùng
 * `InstancedMesh`; biến thể bằng xoay / co giãn / lệch sáng từng cây. LOD 2 bậc: gần nhân vật = hình đầy đủ, xa
 * (`trees.lodDistance`) hoặc nhìn từ trên = hình thô — 2 draw call / kiểu.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { softCrown, softLimb, type Lobe } from './khoiMem';
import type { LookSpec } from './look';
import { bambooGeometry, broadleafGeometry, peachGeometry, plumGeometry, willowGeometry } from './cayChumLoai';
import { softMaterial, type Wind } from './materials';
import { seededRandom } from './random';
import type { SceneSpec } from './spec';
import type { Placed } from './trees';

type Trees = SceneSpec['trees'];
type Tri = readonly [string, string, string];
const v = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);

/** Điểm (x, z) + độ cao — nhân vật / camera. */
export interface XYZ {
  x: number;
  y?: number;
  z: number;
}

/**
 * Bậc LOD từng cây: true = gần (hình đầy đủ). Chưa biết nhân vật → mọi cây gần; camera cao hơn nhân vật quá `dist`
 * (nhìn từ trên) → mọi cây xa; còn lại theo khoảng cách ngang tới nhân vật.
 */
export function lodNear(trees: readonly XYZ[], focus: XYZ | undefined, eye: XYZ | undefined, dist: number): boolean[] {
  if (!focus) return trees.map(() => true);
  if (eye && (eye.y ?? 0) - (focus.y ?? 0) > dist) return trees.map(() => false);
  return trees.map((t) => Math.hypot(t.x - focus.x, t.z - focus.z) <= dist);
}

/**
 * Tùng 松 tầng mây: 4 tầng dẹt so le hai bên thân, mỗi tầng 2–4 múi dẹt ghép (không phải một đĩa), mặt trên sáng, mép dưới
 * tối; thân vặn 2 khúc + gốc loe + 2 cành ngang chui vào tầng. Bậc xa: mỗi tầng một múi, thân một khúc.
 */
export function pineGeometry(trunk: string, leaves: Tri, far: boolean): THREE.BufferGeometry {
  // tầng: tâm (lệch khỏi thân), bán kính ngang, bán trục dọc, số múi
  const tiers = [
    { x: 0.8, y: 2.2, z: 0.2, r: 1.9, h: 0.46, n: 4 },
    { x: -0.75, y: 2.92, z: -0.25, r: 1.6, h: 0.44, n: 4 },
    { x: 0.45, y: 3.62, z: 0.3, r: 1.3, h: 0.42, n: 3 },
    { x: -0.05, y: 4.28, z: -0.05, r: 1.0, h: 0.4, n: 2 },
  ];
  const lobes: Lobe[] = [];
  for (const [ti, t] of tiers.entries()) {
    if (far) {
      lobes.push({ x: t.x, y: t.y, z: t.z, rx: t.r * 0.95, ry: t.h, rz: t.r * 0.88 });
      continue;
    }
    // múi giữa to + múi viền xếp quanh, lệch cao thấp chút cho viền tầng có nhịp
    lobes.push({ x: t.x, y: t.y + 0.05, z: t.z, rx: t.r * 0.7, ry: t.h, rz: t.r * 0.66 });
    for (let k = 1; k < t.n; k++) {
      const a = ti * 1.3 + (k / (t.n - 1)) * Math.PI * 2;
      const rr = t.r * (0.42 + 0.06 * (k % 2));
      lobes.push({ x: t.x + Math.cos(a) * rr, y: t.y - 0.04 + 0.05 * (k % 2), z: t.z + Math.sin(a) * rr * 0.9, rx: t.r * 0.55, ry: t.h * 0.85, rz: t.r * 0.5 });
    }
  }
  const crown = softCrown({ lobes, colors: leaves, seg: far ? [7, 4] : [8, 4], flat: -0.5, lobeShade: 0.6, noise: 0.1 });
  const limbs = far
    ? [softLimb([v(0, -0.1, 0), v(0.12, 2.1, 0.05), v(-0.05, 4.0, 0)], [0.3, 0.2, 0.1], trunk, 0.4)]
    : [
        // gốc loe → khúc 1 nghiêng → khúc 2 vặn ngược
        softLimb([v(0, -0.1, 0), v(0.03, 0.3, 0), v(0.3, 2.0, 0.08), v(-0.1, 3.6, -0.04), v(-0.05, 4.2, -0.04)], [0.38, 0.27, 0.2, 0.13, 0.08], trunk, 0.4),
        // cành ngang chui vào tầng 1 và tầng 2
        softLimb([v(0.27, 1.8, 0.07), v(1.0, 2.15, 0.25)], [0.1, 0.05], trunk, 0.3),
        softLimb([v(0.1, 2.7, 0.03), v(-0.7, 2.88, -0.25)], [0.09, 0.05], trunk, 0.3),
      ];
  const out = mergeGeometries([...limbs, crown]);
  for (const g of [...limbs, crown]) g.dispose();
  return out;
}

/** Bụi tán chùm thấp (`bui`): 4 múi đáy phẳng, hai màu xen (`trees.autumn`); bậc xa 3 múi thô. */
export function bushGeometry(colors: readonly [string, string], far: boolean): THREE.BufferGeometry {
  const tri = (c: string): Tri => {
    const base = new THREE.Color(c);
    return [`#${base.clone().multiplyScalar(0.62).getHexString()}`, c, `#${base.clone().lerp(new THREE.Color('#fff6e0'), 0.2).getHexString()}`];
  };
  const [a, b] = colors.map(tri);
  const ring = far ? 2 : 3;
  const lobes: Lobe[] = [{ x: 0, y: 0.5, z: 0, rx: 0.8, ry: 0.6, rz: 0.78, colors: a }];
  for (let k = 0; k < ring; k++) {
    const t = (k / ring) * Math.PI * 2 + 0.4;
    lobes.push({ x: Math.cos(t) * 0.5, y: 0.36, z: Math.sin(t) * 0.5, rx: 0.56, ry: 0.44, rz: 0.54, colors: k % 2 === 0 ? b : a });
  }
  return softCrown({ lobes, colors: a, seg: far ? [6, 3] : [8, 5], flat: -0.8, lobeShade: 0.5, rimAmount: 0.12, rim: '#f2d48a' });
}

/** Một kiểu cây chùm: 2 InstancedMesh (gần / xa) cùng vật liệu, chia lại cây theo vị trí nhân vật. */
export interface ChumKind {
  readonly near: THREE.InstancedMesh;
  readonly far: THREE.InstancedMesh;
  /** chia lại bậc LOD: trả về số cây gần */
  assign(focus: XYZ | undefined, eye: XYZ | undefined): number;
}

function chumKind(scene: THREE.Scene, nearGeo: THREE.BufferGeometry, farGeo: THREE.BufferGeometry, mat: THREE.Material, list: Placed[], seed: number, dist: number, tall = 0.06): ChumKind {
  const rand = seededRandom(seed);
  const near = new THREE.InstancedMesh(nearGeo, mat, list.length);
  const far = new THREE.InstancedMesh(farGeo, mat, list.length);
  const q = new THREE.Quaternion();
  const mats = list.map((t) => {
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI * 2);
    const s = t.scale;
    const w = 0.92 + rand() * 0.16;
    return new THREE.Matrix4().compose(v(t.x, t.y ?? 0, t.z), q, v(s * w, s * (1 - tall + rand() * tall * 2), s * (2 - w)));
  });
  // lệch sáng ±6 % + lệch sắc nhẹ: rừng không lặp
  const cols = list.map(() => {
    const b = 0.94 + rand() * 0.12;
    const h = (rand() - 0.5) * 0.06;
    return new THREE.Color(b - h * 0.5, b + h * 0.3, b - h);
  });
  // khung bao tính một lần với mọi cây ở cả hai bậc, rồi mới chia — chia lại không phải tính lại
  for (const m of [near, far]) {
    mats.forEach((x, i) => {
      m.setMatrixAt(i, x);
      m.setColorAt(i, cols[i]);
    });
    m.computeBoundingSphere();
    m.userData.chum = true;
    scene.add(m);
  }
  const pts = list.map((t) => ({ x: t.x, z: t.z }));
  return {
    near,
    far,
    assign(focus, eye) {
      const flags = lodNear(pts, focus, eye, dist);
      let n = 0;
      let f = 0;
      flags.forEach((isNear, i) => {
        const m = isNear ? near : far;
        const j = isNear ? n++ : f++;
        m.setMatrixAt(j, mats[i]);
        m.setColorAt(j, cols[i]);
      });
      near.count = n;
      far.count = f;
      for (const m of [near, far]) {
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
      }
      return n;
    },
  };
}

/** Bộ cập nhật LOD của mọi kiểu cây chùm: chia lại mỗi 0,5 s, hoặc ngay khi vừa chuyển sang / khỏi nhìn từ trên. */
export type ChumUpdate = (dt: number, focus?: XYZ, eye?: XYZ) => void;

/** Cây theo kiểu (`trees.ts` chia sẵn) — các kiểu dựng bằng tán chùm. */
export type ChumLists = Record<'tung' | 'bui' | 'tan' | 'mai' | 'dao' | 'lieu' | 'truc', Placed[]>;

/**
 * Mọi kiểu cây `chum`: tùng, bụi (V-58) + cây tán, mai, đào, liễu, trúc (V-60). Mỗi kiểu có cây thì 2 InstancedMesh (gần /
 * xa). Gió theo độ cao (`tip` — gốc đứng yên, tán lay); liễu theo `aSway` (dải rủ lay ở ngọn). Trả về các kiểu + bộ cập nhật LOD.
 */
export function addChumTrees(scene: THREE.Scene, spec: Trees, lists: ChumLists, look: LookSpec): { kinds: ChumKind[]; update: ChumUpdate } {
  const kinds: ChumKind[] = [];
  const dist = spec.lodDistance;
  const w = look.wind;
  const peach: Tri = [spec.peach[0], spec.peach[1], spec.peach[2]];
  const kindsDef: [Placed[], (far: boolean) => THREE.BufferGeometry, Wind, number, number?][] = [
    [lists.tung, (far) => pineGeometry(spec.trunk, spec.leaves, far), { amp: w * 0.6, tip: 2 }, spec.seed * 4099 + 23],
    [lists.bui, (far) => bushGeometry(spec.autumn, far), { amp: w * 0.5, tip: 1 }, spec.seed * 3571 + 29],
    [lists.tan, (far) => broadleafGeometry(spec.trunk, spec.leaves, far), { amp: w * 0.5, tip: 2.4 }, spec.seed * 7919 + 31],
    [lists.mai, (far) => plumGeometry(spec.plum, far), { amp: w * 0.5, tip: 1.4 }, spec.seed * 6151 + 37],
    [lists.dao, (far) => peachGeometry(peach, far), { amp: w * 0.5, tip: 2.1 }, spec.seed * 7919 + 41],
    // liễu: gió theo `aSway` của hình (ngọn dải lay ~0,25 m khi `look.wind` 0,06)
    [lists.lieu, (far) => willowGeometry(spec.trunk, spec.willow, far), { amp: w * 3, sway: true }, spec.seed * 8191 + 43],
    // trúc: khóm cao thấp khác nhau ±15 % (một hình cho mọi khóm)
    [lists.truc, (far) => bambooGeometry(spec.bamboo, far), { amp: w * 0.8, tip: 5 }, spec.seed * 104729 + 47, 0.15],
  ];
  for (const [list, geo, wind, seed, tall] of kindsDef) {
    if (!list.length) continue;
    const mat = softMaterial(look.wrap, THREE.FrontSide, wind);
    kinds.push(chumKind(scene, geo(false), geo(true), mat, list, seed, dist, tall));
  }
  let acc = Infinity;
  let top: boolean | null = null;
  const update: ChumUpdate = (dt, focus, eye) => {
    acc += dt;
    const nowTop = !!focus && !!eye && (eye.y ?? 0) - (focus.y ?? 0) > dist;
    if (acc < 0.5 && nowTop === top) return;
    acc = 0;
    top = nowTop;
    for (const k of kinds) k.assign(focus, eye);
  };
  update(0); // chưa biết nhân vật: mọi cây bậc gần
  return { kinds, update };
}
