import * as THREE from 'three';

/**
 * Nhìn từ mắt nhân vật khi ngồi (ngôi 1 — R-DIEU-7, R-NGOI-1, R-GIAO-1).
 * - `EyeLook`: kéo để nhìn quanh có giới hạn quanh hướng mặt; thả tay `returnDelay` giây thì êm dần nhìn lại tài liệu.
 * - `eyePose`: vị trí + hướng camera ở mắt.
 * - `blendCamera`: trộn camera ngôi 3 (OrbitCamera) ↔ ngôi 1 theo `w` 0 → 1 (vị trí tuyến tính, hướng quaternion, FOV).
 * Chỉ toán (three dùng cho vector) — không DOM; `ngoiMat.ts` ghép.
 */

/** Thông số (radian, giây) — đổi từ `camera.firstPerson` của đặc tả (độ) bằng `eyeSettings`. */
export interface EyeSettings {
  eyeY: number;
  eyeFwd: number;
  yawLimit: number;
  pitchUp: number;
  pitchDown: number;
  minHFov: number;
  blend: number;
  returnDelay: number;
  returnTime: number;
}

const DEG = Math.PI / 180;

/** Từ đặc tả (`FirstPersonSpec`, góc độ) sang radian. */
export function eyeSettings(s: {
  eyeY: number;
  eyeFwd: number;
  yawLimit: number;
  pitchUp: number;
  pitchDown: number;
  minHFov: number;
  blend: number;
  returnDelay: number;
  returnTime: number;
}): EyeSettings {
  return {
    eyeY: s.eyeY,
    eyeFwd: s.eyeFwd,
    yawLimit: s.yawLimit * DEG,
    pitchUp: s.pitchUp * DEG,
    pitchDown: s.pitchDown * DEG,
    minHFov: s.minHFov * DEG,
    blend: s.blend,
    returnDelay: s.returnDelay,
    returnTime: s.returnTime,
  };
}

/** Kéo bao nhiêu radian mỗi pixel — như OrbitCamera (0,006 ngang, 0,004 dọc). */
const PX_YAW = 0.006;
const PX_PITCH = 0.004;
/** R-DIEU-3: không xoay nhanh hơn (rad/s) — cả lúc nhìn lại */
const MAX_SPEED = 90 * DEG;

/** Êm đầu-cuối 0 → 1. */
export const smooth = (x: number): number => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** Lệch nhìn quanh (rad) so với hướng chuẩn (hướng mặt + góc cúi của chỗ ngồi). */
export class EyeLook {
  yaw = 0;
  pitch = 0;
  /** giây kể từ lần kéo cuối */
  private idle = Infinity;

  constructor(private readonly s: EyeSettings) {}

  /** Về thẳng (vừa ngồi xuống). */
  reset(): void {
    this.yaw = 0;
    this.pitch = 0;
    this.idle = Infinity;
  }

  /**
   * Kéo dx, dy pixel — cùng chiều OrbitCamera: kéo sang phải → nhìn sang phải, kéo xuống → cúi xuống. `base` = góc cúi chuẩn
   * (rad, âm = cúi): góc tuyệt đối `base + pitch` giữ trong [−pitchDown, pitchUp]; ngang giữ trong ±yawLimit.
   */
  look(dx: number, dy: number, base: number): void {
    this.idle = 0;
    this.yaw = Math.min(this.s.yawLimit, Math.max(-this.s.yawLimit, this.yaw - dx * PX_YAW));
    const abs = Math.min(this.s.pitchUp, Math.max(-this.s.pitchDown, base + this.pitch - dy * PX_PITCH));
    this.pitch = abs - base;
  }

  /** Mỗi khung: thả tay quá `returnDelay` → êm dần về 0 (~95 % sau `returnTime`), không nhanh hơn 90°/s. */
  update(dt: number): void {
    this.idle += dt;
    if (this.idle < this.s.returnDelay || dt <= 0) return;
    const k = 1 - Math.exp((-3 * dt) / Math.max(0.01, this.s.returnTime));
    const cap = MAX_SPEED * dt;
    const step = (v: number): number => {
      const d = -v * k;
      return v + Math.min(cap, Math.max(-cap, d));
    };
    this.yaw = step(this.yaw);
    this.pitch = step(this.pitch);
  }
}

/** Hướng nhìn (yaw quanh trục đứng, 0 = +z; pitch dương = ngẩng) → vector đơn vị. */
export function lookDir(yaw: number, pitch: number, out = new THREE.Vector3()): THREE.Vector3 {
  return out.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
}

/** Mắt người ngồi: chân `feet`, hướng mặt `faceYaw` → vị trí mắt. */
export function eyeAt(feet: THREE.Vector3, faceYaw: number, s: Pick<EyeSettings, 'eyeY' | 'eyeFwd'>, out = new THREE.Vector3()): THREE.Vector3 {
  return out.set(feet.x + Math.sin(faceYaw) * s.eyeFwd, feet.y + s.eyeY, feet.z + Math.cos(faceYaw) * s.eyeFwd);
}

const tmpDir = new THREE.Vector3();
const tmpM = new THREE.Matrix4();
const UP = new THREE.Vector3(0, 1, 0);

/** Đặt `cam` ở `eye`, nhìn theo (yaw, pitch). */
export function aimCamera(cam: THREE.Object3D, eye: THREE.Vector3, yaw: number, pitch: number): void {
  cam.position.copy(eye);
  lookDir(yaw, pitch, tmpDir).add(eye);
  // camera nhìn theo −z: lookAt của Matrix4 (mắt, đích, lên)
  tmpM.lookAt(eye, tmpDir, UP);
  cam.quaternion.setFromRotationMatrix(tmpM);
}

/**
 * FOV dọc (độ) khi ngồi: giữ `baseFov`, nhưng màn hẹp (dọc) thì nới để bề ngang thấy ít nhất `minHFov` (rad) — màn
 * 390 × 844 với 55° chỉ thấy ~27° ngang, không đủ chỗ cho cuộn sách / bàn cờ.
 */
export function eyeFov(baseFov: number, aspect: number, minHFov: number): number {
  const need = (2 * Math.atan(Math.tan(minHFov / 2) / Math.max(0.1, aspect))) / DEG;
  return Math.max(baseFov, need);
}

/** Tư thế camera để trộn. */
export interface CamPose {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  fov: number;
}

/**
 * Camera = trộn `third` (ngôi 3) và `first` (ngôi 1) theo `w` (0 = ngôi 3, 1 = ngôi 1; đã êm sẵn hoặc chưa — hàm tự
 * `smooth`). Đổi FOV thì cập nhật ma trận chiếu.
 */
export function blendCamera(cam: THREE.PerspectiveCamera, third: CamPose, first: CamPose, w: number): void {
  const t = smooth(w);
  cam.position.lerpVectors(third.position, first.position, t);
  cam.quaternion.slerpQuaternions(third.quaternion, first.quaternion, t);
  const fov = third.fov + (first.fov - third.fov) * t;
  if (Math.abs(cam.fov - fov) > 1e-3) {
    cam.fov = fov;
    cam.updateProjectionMatrix();
  }
}

/** Tiến độ chuyển ngôi: `w` đi về `on ? 1 : 0` đều trong `blend` giây. */
export function stepBlend(w: number, on: boolean, dt: number, blend: number): number {
  const d = dt / Math.max(0.01, blend);
  return on ? Math.min(1, w + d) : Math.max(0, w - d);
}

/** Từ mức chuyển này trở lên thì thân mình ẩn, tay + cuộn ngôi 1 hiện (camera đã sát đầu). */
export const BODY_HIDE_AT = 0.6;
