import * as THREE from 'three';
import { JOINTS, type Joint, type Pose } from './dongTac';

/** Khớp động tác → tên xương Mixamo (bỏ tiền tố `mixamorig`). */
const BONE: Record<Joint, string> = {
  hips: 'Hips',
  spine: 'Spine',
  chest: 'Spine1',
  upperChest: 'Spine2',
  neck: 'Neck',
  head: 'Head',
  armL: 'LeftArm',
  armR: 'RightArm',
  foreL: 'LeftForeArm',
  foreR: 'RightForeArm',
  handL: 'LeftHand',
  handR: 'RightHand',
  upLegL: 'LeftUpLeg',
  upLegR: 'RightUpLeg',
  legL: 'LeftLeg',
  legR: 'RightLeg',
  footL: 'LeftFoot',
  footR: 'RightFoot',
};
/** Thiếu một trong các xương này → không coi là xương chuẩn (về đường `autoRig`). */
const REQUIRED: readonly Joint[] = ['hips', 'spine', 'neck', 'head', 'armL', 'armR', 'foreL', 'foreR', 'upLegL', 'upLegR', 'legL', 'legR'];
/** Khung bao của lưới có xương nới ra để tay / chân vung không bị cắt bỏ khỏi khung nhìn. */
const SKIN_BOUND_PAD = 1.3;

/** Tên xương không tiền tố: `mixamorig:Hips` (GLTFLoader làm sạch thành `mixamorigHips`) → `Hips`. */
export const boneBaseName = (name: string): string => name.replace(/^mixamorig[:_]?/i, '');

interface Slot {
  bone: THREE.Bone;
  rest: THREE.Quaternion;
  /** hướng (quaternion) của xương cha ở tư thế gốc, trong khung của model, và nghịch đảo */
  wp: THREE.Quaternion;
  wpInv: THREE.Quaternion;
}

/** Xương chuẩn Mixamo đã nhận diện: áp dáng của `dongTac.ts` lên xương. */
export interface MixamoRig {
  /** đặt góc mọi khớp theo `pose` (góc trong khung nhân vật — quy ước ở `dongTac.ts`) */
  apply(pose: Pose): void;
}

/**
 * Nhận diện xương Mixamo trong [model] (model Tripo — R-NPC-10) và nhớ tư thế gốc. Gọi **trước** khi gắn model vào cây
 * cảnh (model chưa xoay — khung model = khung nhân vật: mặt trước +z). Không đủ xương → `null`.
 *
 * Mỗi xương có trục riêng (Mixamo đặt khác nhau từng khớp); góc động tác tính trong khung nhân vật nên đổi sang khung
 * xương: local = (Wp⁰)⁻¹ · D · Wp⁰ · L⁰ — D là phép xoay muốn thêm, Wp⁰ hướng xương cha ở tư thế gốc, L⁰ hướng gốc
 * của xương. Xương cha xoay thì con xoay theo (như cây xương thật).
 */
export function mixamoRig(model: THREE.Object3D): MixamoRig | null {
  const found = new Map<string, THREE.Bone>();
  model.traverse((o) => {
    if ((o as THREE.Bone).isBone) found.set(boneBaseName(o.name), o as THREE.Bone);
  });
  if (REQUIRED.some((j) => !found.has(BONE[j]))) return null;

  model.updateMatrixWorld(true);
  const rootInv = model.getWorldQuaternion(new THREE.Quaternion()).invert();
  const slots: Partial<Record<Joint, Slot>> = {};
  for (const j of JOINTS) {
    const bone = found.get(BONE[j]);
    if (!bone) continue;
    const wp = new THREE.Quaternion();
    if (bone.parent) bone.parent.getWorldQuaternion(wp);
    wp.premultiply(rootInv);
    slots[j] = { bone, rest: bone.quaternion.clone(), wp, wpInv: wp.clone().invert() };
  }

  model.traverse((o) => {
    const s = o as THREE.SkinnedMesh;
    if (!s.isSkinnedMesh) return;
    s.computeBoundingSphere();
    if (s.boundingSphere) s.boundingSphere.radius *= SKIN_BOUND_PAD;
  });

  const e = new THREE.Euler();
  const q = new THREE.Quaternion();
  return {
    apply(pose) {
      for (const j of JOINTS) {
        const s = slots[j];
        if (!s) continue;
        const [x, y, z] = pose.j[j];
        q.setFromEuler(e.set(x, y, z, 'XYZ'));
        s.bone.quaternion.copy(s.wpInv).multiply(q).multiply(s.wp).multiply(s.rest);
      }
    },
  };
}
