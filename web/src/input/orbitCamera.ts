import * as THREE from 'three';

const MIN_DIST = 5;
const MAX_DIST = 22;
const MIN_PITCH = 0.12;
const MAX_PITCH = 1.2;

/** Camera bám theo nhân vật, quay quanh nó (yaw = quay ngang, pitch = ngẩng/cúi, dist = khoảng cách). */
export class OrbitCamera {
  yaw = 0;
  pitch = 0.42;
  dist = 9;
  near = true;
  private readonly want = new THREE.Vector3();
  private readonly target = new THREE.Vector3();

  /** Kéo ngón tay dx, dy pixel. */
  rotate(dx: number, dy: number): void {
    this.yaw -= dx * 0.006;
    this.pitch = Math.min(MAX_PITCH, Math.max(MIN_PITCH, this.pitch + dy * 0.004));
  }

  /** Chụm 2 ngón: ratio = khoảng cách cũ / khoảng cách mới. */
  pinch(ratio: number): void {
    this.dist = clampDist(this.dist * ratio);
  }

  /** Lăn chuột (khi thử trên máy tính). */
  wheel(deltaY: number): void {
    this.dist = clampDist(this.dist + deltaY * 0.01);
  }

  /** Đổi giữa góc gần và góc cả sân. Trả về true nếu đang ở góc gần. */
  toggleView(): boolean {
    this.near = !this.near;
    this.dist = this.near ? 9 : 17;
    this.pitch = this.near ? 0.42 : 0.75;
    return this.near;
  }

  /** Đặt camera nhìn vào `focus`. `snap` = nhảy ngay, không trượt mượt. */
  update(camera: THREE.Camera, focus: THREE.Vector3, dt: number, snap = false): void {
    const horiz = this.dist * Math.cos(this.pitch);
    this.want.set(
      focus.x + Math.sin(this.yaw) * horiz,
      focus.y + 1.2 + this.dist * Math.sin(this.pitch),
      focus.z + Math.cos(this.yaw) * horiz,
    );
    // lerp theo hàm mũ: mượt như nhau dù fps cao hay thấp
    if (snap) camera.position.copy(this.want);
    else camera.position.lerp(this.want, 1 - Math.exp(-dt * 8));
    this.target.set(focus.x, focus.y + 1.2, focus.z);
    camera.lookAt(this.target);
  }
}

function clampDist(d: number): number {
  return Math.min(MAX_DIST, Math.max(MIN_DIST, d));
}
