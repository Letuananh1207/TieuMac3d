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
    this.aim(clientX, clientY);
    const hit = this.ray.intersectObject(this.ground, false)[0];
    return hit ? hit.point.clone() : null;
  }

  /** Vật đầu tiên tia chạm trúng trong `objects` (hộp bắt chạm vật học), hoặc null. */
  pickObject(clientX: number, clientY: number, objects: THREE.Object3D[]): THREE.Object3D | null {
    if (!objects.length) return null;
    this.aim(clientX, clientY);
    return this.ray.intersectObjects(objects, false)[0]?.object ?? null;
  }

  private aim(clientX: number, clientY: number): void {
    this.ndc.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
  }
}
