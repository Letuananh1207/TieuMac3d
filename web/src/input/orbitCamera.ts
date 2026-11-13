import * as THREE from 'three';
import { SPEED } from '../player/controller';

const MIN_PITCH = 0.12;
const MAX_PITCH = 1.2;
/** camera cách mặt đất tối thiểu (m) khi có địa hình */
const CAMERA_CLEARANCE = 0.8;
/** R-DIEU-3: sau khi kéo xoay camera, chờ bao lâu (s) mới tự xoay theo hướng đi */
const AUTO_DELAY = 1.5;
/** R-DIEU-3: tốc độ tự xoay (1/s, theo hàm mũ) khi đi hết tốc độ — ~0,7 s đi được nửa đường còn lại */
const AUTO_RATE = 1.0;
/** R-DIEU-3: hướng đi lệch hướng nhìn từ góc này trở lên (đi về phía camera) thì không tự xoay; mờ dần từ 100° */
const AUTO_MAX_OFF = (120 * Math.PI) / 180;
const AUTO_FADE = (20 * Math.PI) / 180;
/** R-DIEU-4: kéo lại gần nhanh (1/s), lùi ra chậm (1/s); đứng trước vật chắn cách nó bao nhiêu (m); gần nhất (m) */
const OCC_IN = 30;
const OCC_OUT = 2.5;
const OCC_MARGIN = 0.4;
const OCC_MIN = 1.2;

/** Bố cục: ngắm cao hơn tâm nhân vật một góc (rad) — nhân vật xuống ~1/3 dưới màn hình, chân trời lên gần giữa, thấy
 *  cảnh phía trước (như game góc nhìn thứ ba). Điểm ngắm nâng thêm `dist · LOOK_UP` mét. */
const LOOK_UP = 0.17;
/** R-DIEU-3: đang đi thì góc ngẩng trở dần về góc chuẩn (1/s, theo hàm mũ, khi đi hết tốc độ) */
const PITCH_RATE = 0.8;

/** Góc về (−π, π]. */
const wrap = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));

/** Dò tầm nhìn (R-DIEU-4): phần t ∈ (0, 1] đoạn đầu → camera bị che đầu tiên (1 = không che). y tính từ mặt đất. */
export type SightBlock = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => number;

/** trong nhà: camera cách nhân vật tối đa (m) — luật R-HUD-2 */
export const ROOM_MAX_DIST = 6;

/** Sàn nhà đang đứng (toạ độ cảnh): camera không ra khỏi đây. */
export interface RoomBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/** Thông số camera do thiết kế quyết (đặc tả cảnh `camera`). Trùng hình với `SceneSpec['camera']`. */
export interface OrbitSettings {
  minDist: number;
  maxDist: number;
  /** góc gần (mặc định) và góc cả sân: khoảng cách + góc ngẩng (radian) */
  near: { dist: number; pitch: number };
  far: { dist: number; pitch: number };
}

export const DEFAULT_ORBIT: OrbitSettings = {
  minDist: 5,
  maxDist: 22,
  near: { dist: 9, pitch: 0.42 },
  far: { dist: 17, pitch: 0.75 },
};

/** Camera bám theo nhân vật, quay quanh nó (yaw = quay ngang, pitch = ngẩng/cúi, dist = khoảng cách). */
export class OrbitCamera {
  yaw = 0;
  pitch: number;
  dist: number;
  near = true;
  /** giây kể từ lần cuối người chơi kéo xoay camera (R-DIEU-3) */
  private idle = AUTO_DELAY;
  /** khoảng cách đang dùng sau khi tránh vật chắn (R-DIEU-4) */
  private shown: number;
  private readonly want = new THREE.Vector3();
  private readonly target = new THREE.Vector3();

  /** Điểm camera đang ngắm (đã nâng LOOK_UP) — Canvas 3D dùng cho OrbitControls để ảnh chụp đúng bố cục app. */
  get lookTarget(): THREE.Vector3 {
    return this.target;
  }

  constructor(private readonly settings: OrbitSettings = DEFAULT_ORBIT) {
    this.pitch = settings.near.pitch;
    this.dist = settings.near.dist;
    this.shown = this.dist;
  }

  /** Kéo ngón tay dx, dy pixel. */
  rotate(dx: number, dy: number): void {
    this.idle = 0;
    this.yaw -= dx * 0.006;
    this.pitch = Math.min(MAX_PITCH, Math.max(MIN_PITCH, this.pitch + dy * 0.004));
  }

  /** Chụm 2 ngón: ratio = khoảng cách cũ / khoảng cách mới. */
  pinch(ratio: number): void {
    this.dist = this.clampDist(this.dist * ratio);
  }

  /** Lăn chuột (khi thử trên máy tính). */
  wheel(deltaY: number): void {
    this.dist = this.clampDist(this.dist + deltaY * 0.01);
  }

  /**
   * Tự xoay ra sau lưng nhân vật khi đi (R-DIEU-3). `dx`, `dz` = quãng nhân vật vừa đi trong `dt` (gồm joystick, phím,
   * chạm để đi). Không xoay khi vừa kéo camera chưa tới `AUTO_DELAY`, khi đứng yên, khi đi về phía camera (lệch ≥ 120°).
   */
  follow(dt: number, dx: number, dz: number): void {
    this.idle += dt;
    const moved = Math.hypot(dx, dz);
    if (dt <= 0 || moved < 1e-4 || this.idle < AUTO_DELAY) return;
    const speed = Math.min(1, moved / dt / SPEED);
    // camera đứng ở hướng `yaw` tính từ nhân vật; sau lưng hướng đi (dx, dz) là hướng ngược lại
    const delta = wrap(Math.atan2(-dx, -dz) - this.yaw);
    const off = Math.abs(delta); // = góc lệch giữa hướng đi và hướng camera đang nhìn
    const w = Math.min(1, Math.max(0, (AUTO_MAX_OFF - off) / AUTO_FADE));
    this.yaw += delta * w * (1 - Math.exp(-dt * AUTO_RATE * speed));
    // góc ngẩng về góc chuẩn của chế độ đang dùng (gần / cả sân)
    const base = this.near ? this.settings.near.pitch : this.settings.far.pitch;
    this.pitch += (base - this.pitch) * (1 - Math.exp(-dt * PITCH_RATE * speed));
  }

  /** Đổi giữa góc gần và góc cả sân. Trả về true nếu đang ở góc gần. */
  toggleView(): boolean {
    this.near = !this.near;
    const v = this.near ? this.settings.near : this.settings.far;
    this.dist = v.dist;
    this.pitch = v.pitch;
    return this.near;
  }

  /**
   * Đặt camera nhìn vào `focus`. `snap` = nhảy ngay, không trượt mượt.
   * `groundAt` (có địa hình) = độ cao mặt đất: camera luôn cao hơn đất ít nhất `CAMERA_CLEARANCE`.
   */
  update(
    camera: THREE.Camera,
    focus: THREE.Vector3,
    dt: number,
    snap = false,
    groundAt?: (x: number, z: number) => number,
    room?: RoomBounds,
    sight?: SightBlock,
  ): void {
    // trong nhà (R-HUD-2): kéo gần tối đa ROOM_MAX_DIST, không ra sau tường (giữ camera trong sàn nhà)
    let dist = room ? Math.min(this.dist, ROOM_MAX_DIST) : this.dist;
    // tránh vật chắn (R-DIEU-4): tường / nhà cắt tầm nhìn đầu → camera thì đứng trước nó; kéo vào nhanh, lùi ra chậm
    if (sight && !room) {
      const h = dist * Math.cos(this.pitch);
      const t = sight(focus.x, 1.2, focus.z, focus.x + Math.sin(this.yaw) * h, 1.2 + dist * Math.sin(this.pitch), focus.z + Math.cos(this.yaw) * h);
      const goal = t < 1 ? Math.max(OCC_MIN, t * dist - OCC_MARGIN) : dist;
      const rate = goal < this.shown ? OCC_IN : OCC_OUT;
      this.shown = snap ? goal : this.shown + (goal - this.shown) * (1 - Math.exp(-dt * rate));
      dist = Math.min(dist, this.shown);
    } else this.shown = dist;
    const horiz = dist * Math.cos(this.pitch);
    this.want.set(
      focus.x + Math.sin(this.yaw) * horiz,
      focus.y + 1.2 + dist * Math.sin(this.pitch),
      focus.z + Math.cos(this.yaw) * horiz,
    );
    if (room) {
      this.want.x = Math.min(room.maxX, Math.max(room.minX, this.want.x));
      this.want.z = Math.min(room.maxZ, Math.max(room.minZ, this.want.z));
    }
    if (groundAt) {
      const g = groundAt(this.want.x, this.want.z);
      if (Number.isFinite(g)) this.want.y = Math.max(this.want.y, g + CAMERA_CLEARANCE);
    }
    // lerp theo hàm mũ: mượt như nhau dù fps cao hay thấp
    if (snap) camera.position.copy(this.want);
    else camera.position.lerp(this.want, 1 - Math.exp(-dt * 8));
    // ngắm cao hơn đầu nhân vật (LOOK_UP): nhân vật nằm 1/3 dưới màn hình, thấy xa phía trước
    this.target.set(focus.x, focus.y + 1.2 + dist * LOOK_UP, focus.z);
    camera.lookAt(this.target);
  }

  private clampDist(d: number): number {
    return Math.min(this.settings.maxDist, Math.max(this.settings.minDist, d));
  }
}
