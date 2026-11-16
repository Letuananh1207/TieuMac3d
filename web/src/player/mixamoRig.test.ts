import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { DongTac, TINH } from './dongTac';
import { boneBaseName, mixamoRig } from './mixamoRig';

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
    add(`${side}Hand`, fore, [0, 0.2, 0]);
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
});
