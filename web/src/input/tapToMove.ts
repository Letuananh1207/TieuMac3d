import * as THREE from 'three';

/** Đổi điểm chạm trên màn hình thành điểm trên mặt sân (bắn một tia từ camera). */
export class GroundPicker {
  private readonly ray = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();

  constructor(
    private readonly camera: THREE.Camera,
    private readonly ground: THREE.Object3D,
  ) {}

  pick(clientX: number, clientY: number): THREE.Vector3 | null {
    this.ndc.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
    const hit = this.ray.intersectObject(this.ground, false)[0];
    return hit ? hit.point.clone() : null;
  }
}
