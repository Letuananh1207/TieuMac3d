import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { DongTac, TINH } from './dongTac';
import { boneBaseName, chuyenTrongSoNach, mixamoRig, type TayNach } from './mixamoRig';

/** Khung xương giả kiểu Mixamo: trục xương lệch lung tung (như file Tripo: Hips xoay −90° quanh y). */
function fakeSkeleton(): { root: THREE.Group; bone: (n: string) => THREE.Bone } {
  const root = new THREE.Group();
  const bones = new Map<string, THREE.Bone>();
  const add = (name: string, parent: THREE.Object3D, pos: [number, number, number], rot?: THREE.Euler): THREE.Bone => {
    const b = new THREE.Bone();
    b.name = `mixamorig${name}`;
    b.position.set(...pos);
    if (rot) b.quaternion.setFromEuler(rot);
    parent.add(b);
    bones.set(name, b);
    return b;
  };
  const hips = add('Hips', root, [0, 1, 0], new THREE.Euler(0, -Math.PI / 2, 0));
  const spine = add('Spine', hips, [0, 0.1, 0]);
  add('Spine1', spine, [0, 0.1, 0]);
  const neck = add('Neck', spine, [0, 0.3, 0], new THREE.Euler(0.2, -0.3, 0.1));
  add('Head', neck, [0, 0.1, 0]);
  // tay trái chỉ xuống chéo ra +x (chữ A), trục y của xương dọc theo tay
  for (const [side, sx] of [['Left', 1], ['Right', -1]] as const) {
    const arm = add(`${side}Arm`, spine, [0, 0.25, 0.15 * sx], new THREE.Euler(0.9 * sx, 0.3, -0.2));
    const fore = add(`${side}ForeArm`, arm, [0, 0.25, 0], new THREE.Euler(0.1, 0, 0.05));
    const hand = add(`${side}Hand`, fore, [0, 0.2, 0]);
    add(`${side}HandMiddle1`, hand, [0, 0.08, 0]);
    add(`${side}HandIndex1`, hand, [0.02, 0.07, 0]);
    const up = add(`${side}UpLeg`, hips, [0, -0.05, -0.1 * sx], new THREE.Euler(Math.PI, 0, 0));
    add(`${side}Leg`, up, [0, 0.4, 0]);
  }
  root.updateMatrixWorld(true);
  return { root, bone: (n) => bones.get(n)! };
}

const worldPos = (o: THREE.Object3D): THREE.Vector3 => {
  o.updateWorldMatrix(true, false);
  return o.getWorldPosition(new THREE.Vector3());
};

describe('R-NPC-10: lớp nối xương Mixamo', () => {
  it('nhận tên xương có / không dấu hai chấm', () => {
    expect(boneBaseName('mixamorig:Hips')).toBe('Hips');
    expect(boneBaseName('mixamorigLeftArm')).toBe('LeftArm');
  });
  it('thiếu xương chuẩn → null (dùng autoRig)', () => {
    expect(mixamoRig(new THREE.Group())).toBeNull();
  });
  it('dáng 0 → giữ nguyên tư thế gốc', () => {
    const { root, bone } = fakeSkeleton();
    const before = worldPos(bone('LeftHand')).clone();
    const rig = mixamoRig(root)!;
    rig.apply(new DongTac(TINH['diem-tinh']).pose);
    root.updateMatrixWorld(true);
    expect(worldPos(bone('LeftHand')).distanceTo(before)).toBeLessThan(1e-6);
  });
  it('góc theo khung nhân vật, bất kể trục riêng của xương: tay x âm → ra trước (+z), tay trái z âm → khép xuống', () => {
    const { root, bone } = fakeSkeleton();
    const rig = mixamoRig(root)!;
    const p = new DongTac(TINH['diem-tinh']).pose;
    const shoulder = worldPos(bone('LeftArm')).clone();
    const d0 = worldPos(bone('LeftForeArm')).clone().sub(shoulder); // hướng tay ở tư thế gốc
    // khuỷu quay đúng phép xoay quanh vai trong khung nhân vật
    for (const [x, y, z] of [[-0.6, 0, 0], [0, 0, -0.5], [-0.3, 0.2, -0.4]] as const) {
      p.j.armL = [x, y, z];
      rig.apply(p);
      root.updateMatrixWorld(true);
      const want = d0.clone().applyEuler(new THREE.Euler(x, y, z, 'XYZ')).add(shoulder);
      expect(worldPos(bone('LeftForeArm')).distanceTo(want)).toBeLessThan(1e-6);
    }
    // tay chỉ xuống (−y): x âm → ra trước (+z)
    const down = new THREE.Vector3(0, -1, 0).applyEuler(new THREE.Euler(-0.6, 0, 0));
    expect(down.z).toBeGreaterThan(0.5);
  });
  it('đầu y dương → mặt quay về phía trái nhân vật (+x); con xoay theo cha', () => {
    const { root, bone } = fakeSkeleton();
    const rig = mixamoRig(root)!;
    const p = new DongTac(TINH['diem-tinh']).pose;
    const head = bone('Head');
    const fwd = (): THREE.Vector3 => {
      root.updateMatrixWorld(true);
      const q = head.getWorldQuaternion(new THREE.Quaternion());
      const q0 = rest.clone().invert();
      return new THREE.Vector3(0, 0, 1).applyQuaternion(q.multiply(q0));
    };
    root.updateMatrixWorld(true);
    const rest = head.getWorldQuaternion(new THREE.Quaternion());
    p.j.neck = [0, 0.5, 0];
    rig.apply(p);
    expect(fwd().x).toBeCloseTo(Math.sin(0.5), 5);
  });
  it('hiệu chỉnh đo từ xương: góc chữ A, độ cao háng, điểm nắm bàn tay phải (R-DIEU-7, R-VUON-13)', () => {
    const { root, bone } = fakeSkeleton();
    const rig = mixamoRig(root)!;
    const angle = (side: string): number => {
      const d = worldPos(bone(`${side}Hand`)).sub(worldPos(bone(`${side}Arm`)));
      return Math.atan2(Math.abs(d.x), -d.y);
    };
    expect(rig.aPose).toBeCloseTo((angle('Left') + angle('Right')) / 2, 6);
    expect(rig.aPose).toBeGreaterThan(0);
    expect(rig.hipY).toBeCloseTo(worldPos(bone('LeftUpLeg')).y, 6);
    expect(rig.bone('handR')).toBe(bone('RightHand'));
    // điểm nắm = trung bình gốc hai ngón, đổi về toạ độ bàn tay
    const want = worldPos(bone('RightHandMiddle1')).add(worldPos(bone('RightHandIndex1'))).multiplyScalar(0.5);
    const got = bone('RightHand').localToWorld(rig.gripR.clone());
    expect(got.distanceTo(want)).toBeLessThan(1e-6);
  });
});

describe('Trọng số da vùng nách (L-19, R-DIEU-8)', () => {
  // xương: 0 Spine1, 1 Spine2, 2 LeftArm, 3 LeftForeArm, 4 RightArm, 5 RightForeArm; vai ở x ±0,12, y 0,52; tay chữ A
  const SPINE1 = 0;
  const SPINE2 = 1;
  const arms: TayNach[] = [
    { a: [0.12, 0.52, 0], b: [0.16, 0.47, 0], bones: new Set([2, 3]) },
    { a: [-0.12, 0.52, 0], b: [-0.16, 0.47, 0], bones: new Set([4, 5]) },
  ];
  /** Lưới giả: ống tay áo bán kính 0,03 quanh hai cánh tay (bám hẳn tay) + các đỉnh cần soát. */
  function mesh(extra: { p: [number, number, number]; j: number[]; w: number[] }[]) {
    const pos: number[] = [];
    const index: number[] = [];
    const weight: number[] = [];
    for (const [side, bone] of [[1, 2], [-1, 4]] as const) {
      for (let t = 0.1; t < 1; t += 0.2) {
        for (let k = 0; k < 8; k++) {
          const ang = (k / 8) * Math.PI * 2;
          // trục tay (0,04, −0,05) — vuông góc trong mặt đứng: (0,05, 0,04)/|…|, và z
          const nx = 0.05 / Math.hypot(0.05, 0.04);
          const ny = 0.04 / Math.hypot(0.05, 0.04);
          pos.push(side * (0.12 + 0.04 * t + 0.03 * Math.cos(ang) * nx), 0.52 - 0.05 * t + 0.03 * Math.cos(ang) * ny, 0.03 * Math.sin(ang));
          index.push(bone, 0, 0, 0);
          weight.push(1, 0, 0, 0);
        }
      }
    }
    const first = pos.length / 3;
    for (const e of extra) {
      pos.push(...e.p);
      index.push(...e.j);
      weight.push(...e.w);
    }
    return { pos, index, weight, first };
  }
  const at = (m: { index: number[]; weight: number[] }, i: number, bone: number): number =>
    [0, 1, 2, 3].reduce((s, k) => s + (m.index[i * 4 + k] === bone ? m.weight[i * 4 + k] : 0), 0);

  it('R-DIEU-8 (L-19): đỉnh thân cạnh nách bám tay → chuyển sang Spine2, tổng 1; ống tay áo và đỉnh vai giữ nguyên', () => {
    const m = mesh([
      // 0: sườn trái dưới nách, phía trước (như nhan-vat.glb: Spine2 0,5 · LeftArm 0,3 · LeftForeArm 0,2)
      { p: [0.09, 0.42, 0.05], j: [SPINE2, 2, 3, 0], w: [0.5, 0.3, 0.2, 0] },
      // 1: sườn phải, không có ô Spine2 (Spine1 · RightArm)
      { p: [-0.09, 0.44, -0.05], j: [SPINE1, 4, 0, 0], w: [0.6, 0.4, 0, 0] },
      // 2: đỉnh vai trái (trên khớp vai) — theo tay như cơ vai
      { p: [0.1, 0.57, 0], j: [2, SPINE2, 0, 0], w: [0.4, 0.6, 0, 0] },
      // 3: ống tay áo phía ngoài vai
      { p: [0.15, 0.49, 0.031], j: [2, SPINE2, 0, 0], w: [0.7, 0.3, 0, 0] },
    ]);
    const before = [...m.weight];
    const n = chuyenTrongSoNach(m.pos, m.index, m.weight, arms, SPINE2);
    const f = m.first;
    expect(n).toBe(2);
    expect(at(m, f, 2) + at(m, f, 3)).toBeCloseTo(0, 9);
    expect(at(m, f, SPINE2)).toBeCloseTo(1, 9);
    expect(at(m, f + 1, 4)).toBeCloseTo(0, 9);
    expect(at(m, f + 1, SPINE2)).toBeCloseTo(0.4, 9);
    expect(at(m, f + 1, SPINE1)).toBeCloseTo(0.6, 9);
    // đỉnh vai, ống tay áo, toàn bộ lưới tay: không đổi
    expect(m.weight.slice(0, (f + 2) * 4).filter((_, k) => k < f * 4)).toEqual(before.slice(0, f * 4));
    expect(m.weight.slice((f + 2) * 4)).toEqual(before.slice((f + 2) * 4));
    // chạy lại: không còn gì để chuyển
    expect(chuyenTrongSoNach(m.pos, m.index, m.weight, arms, SPINE2)).toBe(0);
  });

  it('R-DIEU-8 (L-19): đỉnh ở dải chuyển (sát mép ống tay áo) chỉ chuyển một phần, tổng vẫn 1', () => {
    // cách trục tay ~1,3 lần bán kính ống tay áo, phía trong vai, dưới vai
    const m = mesh([{ p: [0.105, 0.475, 0.0], j: [SPINE2, 2, 0, 0], w: [0.5, 0.5, 0, 0] }]);
    chuyenTrongSoNach(m.pos, m.index, m.weight, arms, SPINE2);
    const arm = at(m, m.first, 2);
    expect(arm).toBeGreaterThan(0);
    expect(arm).toBeLessThan(0.5);
    expect(arm + at(m, m.first, SPINE2)).toBeCloseTo(1, 9);
  });
});
