import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { autoRig } from './autoRig';

describe('Gắn xương tự động — cắt bỏ ngoài khung nhìn (kế hoạch 2026-11-14-muot-ma-nhu-game)', () => {
  it('model có xương vẫn cắt bỏ được, khung bao rộng hơn dáng đứng (tay / chân vung không biến mất)', () => {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.1, 0.5), new THREE.MeshBasicMaterial());
    body.position.y = 1.05;
    const { group } = autoRig(body, 2.1);
    const skinned = group.getObjectsByProperty('isSkinnedMesh', true) as THREE.SkinnedMesh[];
    expect(skinned.length).toBeGreaterThan(0);
    for (const s of skinned) {
      expect(s.frustumCulled).toBe(true);
      s.geometry.computeBoundingSphere();
      expect(s.boundingSphere!.radius).toBeGreaterThan(s.geometry.boundingSphere!.radius * 1.4);
    }
  });

  it('nhân vật sau lưng camera → không nằm trong khung nhìn (không phải vẽ)', () => {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.1, 0.5), new THREE.MeshBasicMaterial());
    body.position.y = 1.05;
    const { group } = autoRig(body, 2.1);
    group.position.set(0, 0, 10); // camera ở gốc nhìn về −z → nhân vật ở sau lưng
    group.updateMatrixWorld(true);
    const cam = new THREE.PerspectiveCamera(55, 0.5, 0.1, 200);
    cam.updateMatrixWorld(true);
    const f = new THREE.Frustum().setFromProjectionMatrix(cam.projectionMatrix.clone().multiply(cam.matrixWorldInverse));
    const s = group.getObjectsByProperty('isSkinnedMesh', true)[0] as THREE.SkinnedMesh;
    expect(f.intersectsObject(s)).toBe(false);
    group.position.set(0, 0, -10); // trước mặt
    group.updateMatrixWorld(true);
    expect(f.intersectsObject(s)).toBe(true);
  });
});
