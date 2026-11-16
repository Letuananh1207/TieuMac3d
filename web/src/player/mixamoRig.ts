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
  /** xương của khớp (thiếu → `undefined`) */
  bone(j: Joint): THREE.Bone | undefined;
  /** góc chữ A lúc gốc (rad, trung bình hai tay): góc giữa cánh tay (vai → cổ tay) và phương thẳng đứng xuống, trên mặt trước */
  readonly aPose: number;
  /** độ cao khớp háng lúc gốc (m, khung model: chân y = 0) — để tính độ hạ khi ngồi */
  readonly hipY: number;
  /** điểm nắm của bàn tay phải (gốc ngón giữa), toạ độ trong xương `RightHand` — chỗ gắn đồ cầm tay */
  readonly gripR: THREE.Vector3;
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

  const at = (j: Joint): THREE.Vector3 | null => slots[j]?.bone.getWorldPosition(new THREE.Vector3()) ?? null;
  // góc chữ A: vai → cổ tay (thiếu bàn tay → vai → khuỷu)
  const armAngle = (arm: Joint, hand: Joint, fore: Joint): number => {
    const a = at(arm)!;
    const b = (at(hand) ?? at(fore)!).sub(a).applyQuaternion(rootInv);
    return Math.atan2(Math.abs(b.x), -b.y);
  };
  const aPose = (armAngle('armL', 'handL', 'foreL') + armAngle('armR', 'handR', 'foreR')) / 2;
  const hipY = (at('upLegL')!.y + at('upLegR')!.y) / 2;
  const gripR = handGrip(slots.handR?.bone ?? slots.foreR!.bone, at('foreR')!);

  model.traverse((o) => {
    const s = o as THREE.SkinnedMesh;
    if (!s.isSkinnedMesh) return;
    suaNach(s, model); // L-19: thân / nách không bám theo tay (tư thế gốc — trước khi áp dáng)
    s.computeBoundingSphere();
    if (s.boundingSphere) s.boundingSphere.radius *= SKIN_BOUND_PAD;
  });

  const e = new THREE.Euler();
  const q = new THREE.Quaternion();
  return {
    aPose,
    hipY,
    gripR,
    bone: (j) => slots[j]?.bone,
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

/**
 * Điểm nắm của bàn tay (toạ độ trong xương [hand]): trung bình gốc các ngón (xương con của bàn tay — Mixamo `RightHandIndex1`,
 * `RightHandMiddle1`…); không có ngón → kéo dài cẳng tay thêm 35 % chiều dài bàn tay ước lượng.
 */
function handGrip(hand: THREE.Bone, elbow: THREE.Vector3): THREE.Vector3 {
  const wrist = hand.getWorldPosition(new THREE.Vector3());
  const fingers = hand.children.filter((c) => (c as THREE.Bone).isBone);
  const p = new THREE.Vector3();
  if (fingers.length) {
    for (const f of fingers) p.add(f.getWorldPosition(new THREE.Vector3()));
    p.divideScalar(fingers.length);
  } else p.copy(wrist).sub(elbow).multiplyScalar(0.35).add(wrist);
  return hand.worldToLocal(p);
}

/* ---------------- L-19: trọng số da vùng nách ---------------- */

/** Một cánh tay cho `chuyenTrongSoNach`: khớp vai (`LeftArm`) [a], khớp khuỷu [b] (tư thế gốc, khung model: ngang = x), các
 *  xương thuộc tay (cánh tay, cẳng tay, bàn tay, ngón — chỉ số trong `skinIndex`). */
export interface TayNach {
  a: readonly [number, number, number];
  b: readonly [number, number, number];
  bones: ReadonlySet<number>;
}

const smoothstep = (e0: number, e1: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/** Khoảng cách từ điểm (x, y, z) tới đoạn a–b, và tham số chiếu (0 ở a, 1 ở b). */
function toiDoan(x: number, y: number, z: number, a: TayNach['a'], b: TayNach['b']): [number, number] {
  const ux = b[0] - a[0];
  const uy = b[1] - a[1];
  const uz = b[2] - a[2];
  const L2 = ux * ux + uy * uy + uz * uz || 1e-12;
  const t = ((x - a[0]) * ux + (y - a[1]) * uy + (z - a[2]) * uz) / L2;
  const k = Math.min(1, Math.max(0, t));
  return [Math.hypot(x - a[0] - ux * k, y - a[1] - uy * k, z - a[2] - uz * k), t];
}

/**
 * L-19 (R-DIEU-8): model Tripo cho đỉnh thân cạnh nách (dưới khớp vai, phía trong theo phương ngang) một phần trọng số của
 * xương tay (`LeftArm`, cả `LeftForeArm` — đo trên `nhan-vat.glb`: tới 0,5) → tay giơ cao kéo thân phồng ra như cánh dơi.
 * Chuyển phần trọng số tay của các đỉnh "thuộc thân" sang xương [target] (`Spine2`), chuẩn hoá lại tổng = 1. Thuộc thân =
 * đồng thời: phía trong khớp vai theo x, thấp hơn khớp vai, xa trục cánh tay hơn cỡ ống tay áo `r` (trung vị khoảng cách tới
 * trục của các đỉnh bám chính cánh tay) — mỗi điều kiện chuyển mềm qua một dải để không rách lưới. Đỉnh ống tay áo (sát trục
 * tay, hay phía ngoài vai) giữ nguyên. Sửa [weight] tại chỗ; trả về số đỉnh đã đổi.
 * [pos] 3 số / đỉnh (khung model, tư thế gốc), [index] / [weight] 4 số / đỉnh (đổi tại chỗ).
 */
export function chuyenTrongSoNach(
  pos: ArrayLike<number>,
  index: { [i: number]: number; readonly length: number },
  weight: { [i: number]: number; readonly length: number },
  arms: readonly TayNach[],
  target: number,
): number {
  const n = Math.floor(pos.length / 3);
  const changed = new Set<number>();
  for (const arm of arms) {
    const side = Math.sign(arm.a[0]) || 1;
    const upper = [...arm.bones][0];
    // cỡ ống tay áo: trung vị khoảng cách tới trục cánh tay của các đỉnh bám chính xương cánh tay, chiếu nằm trong đoạn
    const ds: number[] = [];
    for (let i = 0; i < n; i++) {
      let w = 0;
      for (let k = 0; k < 4; k++) if (index[i * 4 + k] === upper) w += weight[i * 4 + k];
      if (w < 0.5) continue;
      const [d, t] = toiDoan(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], arm.a, arm.b);
      if (t >= 0 && t <= 1) ds.push(d);
    }
    if (!ds.length) continue;
    ds.sort((p, q) => p - q);
    const r = ds[Math.floor(ds.length / 2)];
    for (let i = 0; i < n; i++) {
      let wc = 0;
      for (let k = 0; k < 4; k++) if (arm.bones.has(index[i * 4 + k])) wc += weight[i * 4 + k];
      if (!(wc > 0)) continue;
      const x = pos[i * 3];
      const y = pos[i * 3 + 1];
      const z = pos[i * 3 + 2];
      const inside = smoothstep(0, 0.5 * r, side * (arm.a[0] - x));
      const below = smoothstep(0, 0.5 * r, arm.a[1] - y);
      const far = smoothstep(r, 1.6 * r, toiDoan(x, y, z, arm.a, arm.b)[0]);
      const f = inside * below * far;
      if (!(f > 1e-3)) continue; // sai số làm tròn ở mép dải: bỏ qua
      let moved = 0;
      let slot = -1;
      for (let k = 0; k < 4; k++) {
        const s = i * 4 + k;
        if (index[s] === target) slot = s;
        if (!arm.bones.has(index[s])) continue;
        moved += weight[s] * f;
        weight[s] *= 1 - f;
      }
      if (slot < 0) {
        // chưa có ô cho xương đích: lấy ô xương tay còn nhẹ nhất (phần còn lại của nó cũng sang thân), hay ô trống
        let best = -1;
        for (let k = 0; k < 4; k++) {
          const s = i * 4 + k;
          if (weight[s] === 0 || arm.bones.has(index[s])) if (best < 0 || weight[s] < weight[best]) best = s;
        }
        slot = best;
        moved += weight[slot];
        weight[slot] = 0;
        index[slot] = target;
      }
      weight[slot] += moved;
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += weight[i * 4 + k];
      if (sum > 0) for (let k = 0; k < 4; k++) weight[i * 4 + k] /= sum;
      changed.add(i);
    }
  }
  return changed.size;
}

/** Tên xương thuộc tay trái / phải (cánh tay, cẳng tay, bàn tay, ngón) — không gồm `Shoulder` (xương đòn, theo thân). */
const TAY = { L: /^Left(Arm|ForeArm|Hand.*)$/, R: /^Right(Arm|ForeArm|Hand.*)$/ };

/** Áp `chuyenTrongSoNach` lên một lưới có xương của model (tư thế gốc). Thiếu xương cần → bỏ qua. */
function suaNach(mesh: THREE.SkinnedMesh, model: THREE.Object3D): void {
  const bones = mesh.skeleton.bones;
  const names = bones.map((b) => boneBaseName(b.name));
  const target = ['Spine2', 'Spine1', 'Spine'].map((n) => names.indexOf(n)).find((i) => i >= 0) ?? -1;
  const idx = mesh.geometry.getAttribute('skinIndex');
  const wgt = mesh.geometry.getAttribute('skinWeight');
  if (target < 0 || !idx || !wgt) return;
  const toModel = model.matrixWorld.clone().invert();
  const at = (name: string): [number, number, number] | null => {
    const i = names.indexOf(name);
    if (i < 0) return null;
    const v = bones[i].getWorldPosition(new THREE.Vector3()).applyMatrix4(toModel);
    return [v.x, v.y, v.z];
  };
  const arms: TayNach[] = [];
  for (const [side, re] of [['Left', TAY.L], ['Right', TAY.R]] as const) {
    const a = at(`${side}Arm`);
    const b = at(`${side}ForeArm`);
    if (!a || !b) continue;
    const set = new Set<number>([names.indexOf(`${side}Arm`)]); // phần tử đầu = xương cánh tay (đo cỡ ống tay áo)
    names.forEach((n, i) => re.test(n) && set.add(i));
    arms.push({ a, b, bones: set });
  }
  if (!arms.length) return;
  const n = mesh.geometry.getAttribute('position').count;
  const pos = new Float32Array(n * 3);
  const v = new THREE.Vector3();
  const toModelMesh = toModel.clone().multiply(mesh.matrixWorld);
  for (let i = 0; i < n; i++) {
    mesh.getVertexPosition(i, v).applyMatrix4(toModelMesh);
    pos[i * 3] = v.x;
    pos[i * 3 + 1] = v.y;
    pos[i * 3 + 2] = v.z;
  }
  const index = Array.from({ length: n * 4 }, (_, k) => idx.getComponent(Math.floor(k / 4), k % 4));
  const weight = Array.from({ length: n * 4 }, (_, k) => wgt.getComponent(Math.floor(k / 4), k % 4));
  if (!chuyenTrongSoNach(pos, index, weight, arms, target)) return;
  for (let k = 0; k < n * 4; k++) {
    idx.setComponent(Math.floor(k / 4), k % 4, index[k]);
    wgt.setComponent(Math.floor(k / 4), k % 4, weight[k]);
  }
  idx.needsUpdate = true;
  wgt.needsUpdate = true;
}
