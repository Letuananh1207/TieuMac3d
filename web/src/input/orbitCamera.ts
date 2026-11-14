import * as THREE from 'three';

const MIN_PITCH = 0.12;
const MAX_PITCH = 1.2;
/** camera cách mặt đất tối thiểu (m) khi có địa hình */
const CAMERA_CLEARANCE = 0.8;
/** R-DIEU-3: sau khi kéo xoay camera, chờ bao lâu (s) mới tự xoay theo hướng đi */
const AUTO_DELAY = 1.5;
/** R-DIEU-3: thời gian "lò xo" tự về sau lưng (s) — càng lớn càng êm */
const AUTO_SMOOTH = 0.5;
/** R-DIEU-3: tự về sau lưng nhanh nhất (rad/s) ~75°/s — rẽ 90° ~2 s, quay đầu ~3 s; nhanh hơn dễ chóng mặt */
const AUTO_MAX_SPEED = (75 * Math.PI) / 180;
/** R-DIEU-3: tự về sau lưng tăng / giảm tốc tối đa (rad/s²) — bắt đầu xoay từ từ, ~0,4 s mới tới tốc độ lớn nhất */
const AUTO_ACCEL = (200 * Math.PI) / 180;
/** R-DIEU-3: cả dây kéo lẫn tự về sau lưng, camera không xoay nhanh hơn (rad/s) */
const YAW_MAX_SPEED = (90 * Math.PI) / 180;
/** R-DIEU-3: dây kéo — camera theo bao nhiêu phần góc bị kéo khi nhân vật đi ngang (1 = như buộc dây cứng) */
const LEASH = 0.6;
/** R-DIEU-3: nhân vật dừng thì tự xoay hãm lại (rad/s²) — ~0,2 s là đứng yên, không khựng, không xoay về chính diện */
const AUTO_BRAKE = (400 * Math.PI) / 180;
/** R-DIEU-3: đổi hướng joystick từ góc này trở lên thì thôi khoá hướng đi, tính lại theo camera */
const STEER_BREAK = (45 * Math.PI) / 180;
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
  /** khi ngồi vào án thư / bàn trà (R-NGOI-1); không có → `DEFAULT_ORBIT.seated` */
  seated?: { dist: number; pitch: number };
}

export const DEFAULT_ORBIT: OrbitSettings = {
  minDist: 5,
  maxDist: 22,
  near: { dist: 9, pitch: 0.42 },
  far: { dist: 17, pitch: 0.75 },
  seated: { dist: 5.5, pitch: 0.44 },
};

/** đầu nhân vật cao hơn chân (m): camera ngắm / dò vật chắn từ đây */
const HEAD_Y = 1.2;
/** R-NGOI-1: ngồi thì đầu thấp xuống (m) — trùng dáng ngồi của nhân vật (`glbCharacter` hạ 0,3 m) */
const SIT_DROP = 0.3;

/** Camera bám theo nhân vật, quay quanh nó (yaw = quay ngang, pitch = ngẩng/cúi, dist = khoảng cách). */
export class OrbitCamera {
  yaw = 0;
  pitch: number;
  dist: number;
  near = true;
  /** giây kể từ lần cuối người chơi kéo xoay camera (R-DIEU-3) */
  private idle = AUTO_DELAY;
  /** vận tốc góc tự xoay (rad/s) của lò xo R-DIEU-3 */
  private yawVel = 0;
  /** R-DIEU-3 khoá hướng đi: yaw dùng để đổi joystick ra hướng trên mặt đất; null = đang không giữ joystick */
  private steer: number | null = null;
  /** hướng joystick khung trước (rad) — đổi gắt thì mở khoá */
  private steerIn = 0;
  /** khoảng cách đang dùng sau khi tránh vật chắn (R-DIEU-4) */
  private shown: number;
  /** đang ngồi: khoảng cách + góc ngẩng trước khi ngồi, để đứng dậy trả lại (R-NGOI-1); null = đang đứng */
  private beforeSit: { dist: number; pitch: number } | null = null;
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

  /**
   * Ngồi vào án thư / bàn trà (R-NGOI-1): `true` → lùi ra, chúc xuống (`seated`), ngắm thấp theo người ngồi;
   * `false` → trả khoảng cách + góc ngẩng như trước khi ngồi. Gọi lặp cùng giá trị không sao.
   */
  sit(on: boolean): void {
    if (on === (this.beforeSit !== null)) return;
    if (on) {
      this.beforeSit = { dist: this.dist, pitch: this.pitch };
      const v = this.settings.seated ?? DEFAULT_ORBIT.seated!;
      this.dist = this.clampDist(v.dist);
      this.pitch = v.pitch;
    } else {
      const b = this.beforeSit!;
      this.beforeSit = null;
      this.dist = b.dist;
      this.pitch = b.pitch;
    }
    this.shown = this.dist;
  }

  /** Kéo ngón tay dx, dy pixel. */
  rotate(dx: number, dy: number): void {
    this.idle = 0;
    this.yawVel = 0;
    this.yaw -= dx * 0.006;
    if (this.steer !== null) this.steer -= dx * 0.006; // kéo tay khi đang đi → hướng đi xoay theo
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
   * Yaw để đổi joystick (ix, iy) ra hướng đi (R-DIEU-3 khoá hướng). Đang giữ cùng hướng → giữ yaw lúc bắt đầu bấm, nên
   * camera tự xoay (kể cả quay đầu đi về phía camera) không làm nhân vật đi vòng. Thả tay / đổi hướng ≥ 45° → theo camera.
   * Gọi mỗi khung hình, kể cả khi không bấm (để mở khoá).
   */
  steerYaw(ix: number, iy: number): number {
    if (!ix && !iy) {
      this.steer = null;
      return this.yaw;
    }
    const a = Math.atan2(ix, iy);
    if (this.steer === null || Math.abs(wrap(a - this.steerIn)) >= STEER_BREAK) this.steer = this.yaw;
    this.steerIn = a;
    return this.steer;
  }

  /**
   * Camera bám nhân vật khi đi (R-DIEU-3), êm như game góc nhìn thứ ba:
   * - dây kéo: nhân vật đi ngang (`dx`, `dz` = quãng vừa đi) thì camera bị kéo vòng theo `LEASH` phần;
   * - tự về sau lưng hướng quay mặt (`facing` = rotation.y nhân vật) bằng lò xo giảm chấn, tối đa `AUTO_MAX_SPEED`;
   *   không làm khi vừa kéo camera chưa tới `AUTO_DELAY`; nhân vật dừng thì hãm lại (`AUTO_BRAKE`), không xoay về
   *   chính diện khi đứng yên.
   * Tổng tốc độ xoay không quá `YAW_MAX_SPEED`. Đi về phía camera cũng về sau lưng — hướng đi đã khoá ở `steerYaw`.
   */
  follow(dt: number, dx: number, dz: number, facing: number, moving: boolean): void {
    this.idle += dt;
    if (dt <= 0) return;
    const from = this.yaw;
    // dây kéo: camera đứng yên, nhân vật dịch (dx, dz) → hướng từ nhân vật tới camera lệch đi
    if (moving && (dx || dz)) {
      const h = this.dist * Math.cos(this.pitch);
      const vx = Math.sin(this.yaw) * h - dx;
      const vz = Math.cos(this.yaw) * h - dz;
      this.yaw += wrap(Math.atan2(vx, vz) - this.yaw) * LEASH;
    }
    if (!moving) {
      // dừng: trượt nốt rồi đứng yên trong ~0,2 s — không tự xoay về sau lưng khi đứng
      const v = Math.max(0, Math.abs(this.yawVel) - AUTO_BRAKE * dt);
      this.yawVel = Math.sign(this.yawVel) * v;
      this.yaw += this.yawVel * dt;
    } else if (this.idle < AUTO_DELAY) this.yawVel = 0;
    else this.recenter(dt, facing + Math.PI);
    // không xoay nhanh hơn YAW_MAX_SPEED (chống chóng mặt)
    const step = wrap(this.yaw - from);
    const cap = YAW_MAX_SPEED * dt;
    this.yaw = wrap(from + Math.min(cap, Math.max(-cap, step)));
    // góc ngẩng về góc chuẩn của chế độ đang dùng (gần / cả sân) — chỉ khi đang đi
    if (moving) {
      const base = this.near ? this.settings.near.pitch : this.settings.far.pitch;
      this.pitch += (base - this.pitch) * (1 - Math.exp(-dt * PITCH_RATE));
    }
  }

  /**
   * Lò xo giảm chấn tới hạn (SmoothDamp) đưa yaw về `want`: vận tốc góc không quá `AUTO_MAX_SPEED`, tăng / giảm tốc
   * không quá `AUTO_ACCEL` (khởi động êm), không vọt quá.
   */
  private recenter(dt: number, want: number): void {
    const off = wrap(want - this.yaw);
    const goal = this.yaw + off;
    const omega = 2 / AUTO_SMOOTH;
    const x = omega * dt;
    const k = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = this.yaw - goal;
    const temp = (this.yawVel + omega * change) * dt;
    const next = goal + (change + temp) * k;
    const clamp = (v: number, m: number): number => Math.min(m, Math.max(-m, v));
    const wantVel = clamp((next - this.yaw) / dt, AUTO_MAX_SPEED);
    this.yawVel += clamp(wantVel - this.yawVel, AUTO_ACCEL * dt);
    const step = this.yawVel * dt;
    if (Math.sign(step) === Math.sign(off) && Math.abs(step) >= Math.abs(off)) {
      this.yaw = goal; // tới nơi: dừng đúng sau lưng, không vọt quá
      this.yawVel = 0;
      return;
    }
    this.yaw += step;
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
    // độ cao đầu nhân vật tính từ chân; ngồi thì thấp xuống (R-NGOI-1)
    const head = this.beforeSit ? HEAD_Y - SIT_DROP : HEAD_Y;
    // tránh vật chắn (R-DIEU-4): tường / nhà cắt tầm nhìn đầu → camera thì đứng trước nó; kéo vào nhanh, lùi ra chậm
    if (sight && !room) {
      const h = dist * Math.cos(this.pitch);
      const t = sight(focus.x, head, focus.z, focus.x + Math.sin(this.yaw) * h, head + dist * Math.sin(this.pitch), focus.z + Math.cos(this.yaw) * h);
      const goal = t < 1 ? Math.max(OCC_MIN, t * dist - OCC_MARGIN) : dist;
      const rate = goal < this.shown ? OCC_IN : OCC_OUT;
      this.shown = snap ? goal : this.shown + (goal - this.shown) * (1 - Math.exp(-dt * rate));
      dist = Math.min(dist, this.shown);
    } else this.shown = dist;
    const horiz = dist * Math.cos(this.pitch);
    this.want.set(
      focus.x + Math.sin(this.yaw) * horiz,
      focus.y + head + dist * Math.sin(this.pitch),
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
    this.target.set(focus.x, focus.y + head + dist * LOOK_UP, focus.z);
    camera.lookAt(this.target);
  }

  private clampDist(d: number): number {
    return Math.min(this.settings.maxDist, Math.max(this.settings.minDist, d));
  }
}
