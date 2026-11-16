import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createGardenProps, PROP_SCALE } from './doLamVuon';

describe('R-VUON-13: đồ cầm tay gắn xương bất kỳ', () => {
  /** thân nhân vật xoay 0,7 rad, model co 0,01 (như file Tripo đơn vị cm), bàn tay nằm sâu, xoay lung tung */
  function scene(): { body: THREE.Group; hand: THREE.Bone } {
    const body = new THREE.Group();
    body.rotation.y = 0.7;
    const model = new THREE.Group();
    model.scale.setScalar(0.01);
    body.add(model);
    const arm = new THREE.Bone();
    arm.rotation.set(0.9, -0.4, 1.2);
    arm.position.set(20, 120, 0);
    model.add(arm);
    const hand = new THREE.Bone();
    hand.rotation.set(-0.5, 0.3, 0.2);
    hand.position.set(0, 30, 0);
    arm.add(hand);
    body.updateMatrixWorld(true);
    return { body, hand };
  }
  it('R-VUON-13: đồ đứng thẳng theo thân (bỏ góc tay), nghiêng theo tilt; cỡ bù co giãn của xương', () => {
    const { body, hand } = scene();
    const props = createGardenProps(hand, new THREE.Vector3(0, 8, 0), { upright: body });
    props.show('binh');
    for (const tilt of [0, 1]) {
      props.pose(hand, tilt);
      body.updateMatrixWorld(true);
      const got = props.holder.getWorldQuaternion(new THREE.Quaternion());
      const want = body.getWorldQuaternion(new THREE.Quaternion()).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.9 * tilt));
      expect(got.angleTo(want)).toBeLessThan(1e-5);
      const s = props.holder.getWorldScale(new THREE.Vector3());
      expect(s.x).toBeCloseTo(PROP_SCALE, 4);
      expect(s.y).toBeCloseTo(PROP_SCALE, 4);
    }
    const tip = new THREE.Vector3();
    expect(props.tip(tip)).toBe(true);
    props.show('gio');
    expect(props.tip(tip)).toBe(false);
  });
  it('R-VUON-13: không có mốc (autoRig) — giữ cách cũ: bỏ góc của chính xương tay', () => {
    const arm = new THREE.Bone();
    arm.rotation.set(-0.8, 0, 0.5);
    const props = createGardenProps(arm, new THREE.Vector3());
    props.pose(arm, 0);
    expect(props.holder.quaternion.clone().premultiply(arm.quaternion).angleTo(new THREE.Quaternion())).toBeLessThan(1e-6);
    expect(props.holder.scale.x).toBe(PROP_SCALE);
  });
});
