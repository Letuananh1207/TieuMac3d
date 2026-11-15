import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Ground } from '../collision/ground';
import type { Character, CharacterState } from './character';

/** R-DIEU-5: đi bộ tối đa (m/s) — đẩy joystick dưới `RUN_FROM` */
export const WALK_SPEED = 3.2;
/** R-DIEU-5: chạy (m/s) — đẩy joystick hết cỡ */
export const RUN_SPEED = 7;
/** R-DIEU-5: đẩy joystick từ phần này của bán kính trở lên là chạy */
export const RUN_FROM = 0.85;
/** R-DIEU-5: chạm để đi — điểm đến xa hơn (m) thì chạy */
export const TAP_RUN_DIST = 6;
/** tốc độ lớn nhất (m/s) */
export const SPEED = RUN_SPEED;
/** R-DIEU-6: vận tốc bật lên (m/s) và trọng lực (m/s²) — cao v²/2g ≈ 0,86 m, bay 2v/g ≈ 0,64 s */
export const JUMP_V = 5.4;
export const GRAVITY = 17;
/** R-DIEU-7: chào kéo dài (s) */
export const BOW_TIME = 1.6;

/** R-DIEU-5: độ đẩy joystick (0..1) → tốc độ (m/s): đi bộ nhanh dần tới WALK_SPEED, từ RUN_FROM vọt lên RUN_SPEED. */
export function speedFor(push: number): number {
  const m = Math.min(1, Math.max(0, push));
  if (m < RUN_FROM) return (WALK_SPEED * m) / RUN_FROM;
  const t = (m - RUN_FROM) / (1 - RUN_FROM);
  return WALK_SPEED + (RUN_SPEED - WALK_SPEED) * Math.min(1, t * 3); // vào chạy nhanh, không lửng lơ ở giữa
}
/** R-VUON-13: tự đi tới luống bị kẹt mà còn cách đích dưới chừng này (m) → coi như tới */
export const ARRIVE_NEAR = 1.2;
/** bán kính va chạm của nhân vật */
export const PLAYER_RADIUS = 0.5;
/** dốc tối đa đi được, độ (luật R-VA-2) */
export const MAX_SLOPE = 35;

/**
 * Luật R-VA-2: có bước từ (fromX, fromZ) tới (toX, toZ) trên địa hình được không.
 * Không vào mặt dốc hơn `MAX_SLOPE` (lên hay xuống), không ra ngoài lưới; đang trên mặt dốc thì chỉ đi xuống.
 */
export function canStep(ground: Ground, fromX: number, fromZ: number, toX: number, toZ: number, fromY?: number): boolean {
  const to = ground.heightAt(toX, toZ, fromY);
  if (!Number.isFinite(to)) return false;
  if (ground.slopeAt(toX, toZ, fromY) <= MAX_SLOPE) return true;
  // mặt mới dốc: chỉ cho khi đang mắc trên mặt dốc và bước này đi xuống (thoát ra được, không kẹt mãi)
  return ground.slopeAt(fromX, fromZ, fromY) > MAX_SLOPE && to <= ground.heightAt(fromX, fromZ, fromY);
}

/** Hướng điều khiển từ joystick / bàn phím: x sang phải, y xuống dưới (y = -1 là đi tới). */
export interface MoveInput {
  x: number;
  y: number;
}

/** Di chuyển nhân vật theo joystick (tương đối với hướng camera) hoặc tới điểm đã chạm. */
export class PlayerController {
  /** điểm đến khi chạm mặt đất; null = không có */
  moveTarget: THREE.Vector3 | null = null;
  private readonly before = new THREE.Vector3();
  /** trạng thái hành động (R-DIEU-5…8), đưa cho nhân vật dựng dáng */
  readonly state: CharacterState = { mps: 0, air: false, vy: 0, sit: 0, bow: 0, idle: 0 };
  /** cao hơn mặt đất (m) khi đang nhảy */
  private airY = 0;
  private sitting = false;
  private bowLeft = 0;
  /** biểu cảm đang diễn là Ngồi nghỉ (R-BIEU-2) */
  private emoteSits = false;
  /** chạm để đi: chạy hay đi bộ (chọn lúc đặt điểm đến) */
  private tapRun = false;
  private lastTarget: THREE.Vector3 | null = null;
  /** tự đi tới luống (R-VUON-13) */
  private auto: { target: THREE.Vector3; faceX: number; faceZ: number; onArrive: () => void; onCancel?: () => void } | null = null;
  /** hướng mặt (radian) phải quay về khi tới nơi / đang diễn; null = không ép */
  private faceYaw: number | null = null;
  private workDone: (() => void) | null = null;
  private workCancel: (() => void) | null = null;

  constructor(
    readonly character: Character,
    private readonly colliders: Colliders,
    /** mặt đất (địa hình + nền nhà); null = sân phẳng y = 0 */
    private readonly ground: Ground | null = null,
  ) {}

  /** Đặt nhân vật lên mặt đất tại vị trí hiện tại (gọi khi xuất phát). */
  snapToGround(): void {
    if (!this.ground) return;
    const h = this.ground.heightAt(this.position.x, this.position.z);
    if (Number.isFinite(h)) this.position.y = h;
  }

  get position(): THREE.Vector3 {
    return this.character.root.position;
  }

  /** R-DIEU-6: nhảy — chỉ khi đang trên đất, không ngồi. Trả về true nếu bật lên. */
  /** đang ngồi thiền (R-DIEU-7) — nút Thiền sáng, nút Nhảy mờ */
  get isSitting(): boolean {
    return this.sitting;
  }

  /** đang chắp tay chào (R-DIEU-7) */
  get isBowing(): boolean {
    return this.bowLeft > 0;
  }

  /** đang diễn biểu cảm (R-BIEU-2) — kể cả Ngồi nghỉ (không tính là ngồi: không cuộn sách, không học) */
  get emoting(): boolean {
    return !!this.state.emote;
  }

  jump(): boolean {
    if (this.state.air || this.sitting) return false;
    this.bowLeft = 0;
    this.stopEmote(); // nhảy → thôi biểu cảm (R-BIEU-2)
    this.state.vy = JUMP_V;
    this.state.air = true;
    return true;
  }

  /** R-DIEU-7: ngồi thiền / đứng dậy. */
  toggleSit(): void {
    if (this.state.air) return;
    this.sitting = !this.sitting;
    this.bowLeft = 0;
    this.stopEmote();
  }

  /** R-DIEU-7: chắp tay chào (không khi đang bay / ngồi). */
  bow(): void {
    if (this.state.air || this.sitting) return;
    this.stopEmote();
    this.bowLeft = BOW_TIME;
  }

  /**
   * R-BIEU-2: diễn biểu cảm `id` trong `seconds` giây (`Infinity` = giữ tới khi đi); `sits` = ngồi xếp bằng (Ngồi nghỉ).
   * Không khi đang bay / ngồi. Đang diễn cái khác → thay ngay. Đi, nhảy, Ngồi ôn, Chào → thôi.
   */
  emote(id: string, seconds: number, sits = false): boolean {
    if (this.state.air || this.sitting) return false;
    this.bowLeft = 0;
    this.moveTarget = null;
    this.state.emote = { id, t: 0, len: seconds };
    this.emoteSits = sits;
    return true;
  }

  stopEmote(): void {
    this.state.emote = undefined;
    this.emoteSits = false;
  }

  /**
   * Tự đi tới (x, z) (đi bộ / chạy như chạm để đi — R-DIEU-5) rồi quay mặt về (faceX, faceZ) → `onArrive` (R-VUON-13: đi tới
   * mép luống). Người chơi đẩy joystick / phím, chạm đi chỗ khác, ngồi, nhảy, hay kẹt xa đích → `onCancel` (file ghép bỏ hàng
   * đợi). Gọi lại khi đang tự đi → thay đích (đích cũ không báo huỷ). Không khi đang bay / ngồi → false.
   */
  walkTo(x: number, z: number, faceX: number, faceZ: number, onArrive: () => void, onCancel?: () => void): boolean {
    if (this.state.air || this.sitting) return false;
    this.stopEmote();
    this.bowLeft = 0;
    const target = new THREE.Vector3(x, this.position.y, z);
    this.moveTarget = target;
    this.auto = { target, faceX, faceZ, onArrive, onCancel };
    return true;
  }

  /**
   * Diễn động tác làm vườn `id` trong `len` giây (R-VUON-13): đứng yên (joystick không đi), quay dần về hướng mặt đã đặt ở
   * `walkTo`; hết giờ → `onDone`. Joystick trong lúc diễn → vẫn diễn nốt, gọi `onCancel` một lần (bỏ phần còn lại của hàng
   * đợi). Không khi đang bay / ngồi → false.
   */
  work(id: string, len: number, onDone?: () => void, onCancel?: () => void): boolean {
    if (this.state.air || this.sitting) return false;
    this.stopEmote();
    this.bowLeft = 0;
    this.moveTarget = null;
    this.state.work = { id, t: 0, len };
    this.workDone = onDone ?? null;
    this.workCancel = onCancel ?? null;
    return true;
  }

  /** đang tự đi tới luống / đang diễn làm vườn */
  get autoWalking(): boolean {
    return !!this.auto;
  }
  get working(): boolean {
    return !!this.state.work;
  }

  /** Bỏ tự đi (không báo huỷ) — vd. ra khỏi vườn, mở màn che. Động tác đang diễn vẫn làm nốt. */
  cancelAuto(): void {
    if (this.auto && this.moveTarget === this.auto.target) this.moveTarget = null;
    this.auto = null;
  }

  /** Tự đi: tới nơi / bị huỷ. Gọi đầu `update` (trước khi joystick xoá điểm đến). */
  private checkAuto(userMove: boolean): void {
    const a = this.auto;
    if (a) {
      const lost = userMove || this.moveTarget !== a.target || this.sitting || this.state.air;
      const d = Math.hypot(a.target.x - this.position.x, a.target.z - this.position.z);
      if (!lost && d >= 0.25) return;
      this.auto = null;
      // kẹt (điểm đến bị bỏ vì vướng) mà đã gần → coi như tới
      if (!userMove && !this.sitting && (this.moveTarget === a.target || d < ARRIVE_NEAR)) {
        if (this.moveTarget === a.target) this.moveTarget = null;
        this.faceYaw = Math.atan2(a.faceX - this.position.x, a.faceZ - this.position.z);
        a.onArrive();
      } else a.onCancel?.();
    }
    if (userMove && this.state.work && this.workCancel) {
      const c = this.workCancel;
      this.workCancel = null;
      c();
    }
  }

  update(dt: number, input: MoveInput, camYaw: number, frozen: boolean): void {
    this.checkAuto(!frozen && !!(input.x || input.y));
    // đang diễn làm vườn: không đi (R-VUON-13)
    const locked = frozen || !!this.state.work;
    const ix = locked ? 0 : input.x;
    const iy = locked ? 0 : input.y;
    let mx = 0;
    let mz = 0;

    if (ix || iy) {
      // joystick ưu tiên hơn điểm chạm
      this.moveTarget = null;
      const fx = -Math.sin(camYaw);
      const fz = -Math.cos(camYaw);
      const rx = Math.cos(camYaw);
      const rz = -Math.sin(camYaw);
      mx = fx * -iy + rx * ix;
      mz = fz * -iy + rz * ix;
      const m = Math.hypot(mx, mz);
      if (m > 1) {
        mx /= m;
        mz /= m;
      }
    } else if (this.moveTarget && !frozen) {
      const dx = this.moveTarget.x - this.position.x;
      const dz = this.moveTarget.z - this.position.z;
      const d = Math.hypot(dx, dz);
      // điểm đến mới: xa hơn TAP_RUN_DIST thì chạy cả quãng, gần thì đi bộ (R-DIEU-5)
      if (this.moveTarget !== this.lastTarget) {
        this.lastTarget = this.moveTarget;
        this.tapRun = d > TAP_RUN_DIST;
      }
      if (d < 0.25) this.moveTarget = null;
      else {
        const push = this.tapRun ? 1 : RUN_FROM * 0.999;
        mx = (dx / d) * push;
        mz = (dz / d) * push;
      }
    }

    const push = Math.hypot(mx, mz);
    const mps = push > 0.05 ? speedFor(push) : 0;
    const st = this.state;
    // điều khiển đi → thôi ngồi / thôi chào (R-DIEU-7)
    if (mps > 0) {
      this.sitting = false;
      this.bowLeft = 0;
      this.stopEmote(); // đi → thôi biểu cảm (R-BIEU-2)
    }
    // chân đang ở độ cao nào (mặt đất dưới chân, không tính nhảy) — nhà nhiều tầng chọn đúng sàn (R-VA-3)
    const footY = this.position.y - this.airY;
    // nhảy: vận tốc dọc + trọng lực (R-DIEU-6); va chạm ngang vẫn như khi đi
    if (st.air) {
      st.vy -= GRAVITY * dt;
      this.airY += st.vy * dt;
      if (this.airY <= 0) {
        this.airY = 0;
        st.vy = 0;
        st.air = false;
      }
    }
    const pos = this.position;
    if (mps > 0) {
      const k = mps / push; // hướng (mx, mz) có độ dài = push
      this.before.copy(pos);
      pos.x += mx * k * dt;
      pos.z += mz * k * dt;
      this.colliders.resolve(pos, PLAYER_RADIUS, footY);
      const g = this.ground;
      if (g && !canStep(g, this.before.x, this.before.z, pos.x, pos.z, footY)) {
        // dốc quá: thử trượt dọc một trục (như chạm tường), không được thì đứng yên
        const tx = pos.x;
        const tz = pos.z;
        if (canStep(g, this.before.x, this.before.z, tx, this.before.z, footY)) pos.set(tx, pos.y, this.before.z);
        else if (canStep(g, this.before.x, this.before.z, this.before.x, tz, footY)) pos.set(this.before.x, pos.y, tz);
        else pos.set(this.before.x, pos.y, this.before.z);
      }
      // kẹt tường khi đang đi tới điểm chạm: bỏ điểm đến
      if (this.moveTarget && Math.hypot(pos.x - this.before.x, pos.z - this.before.z) < mps * dt * 0.2) this.moveTarget = null;

      const facing = this.character.facing;
      const targetRot = Math.atan2(mx, mz);
      let dr = targetRot - facing.rotation.y;
      dr = Math.atan2(Math.sin(dr), Math.cos(dr));
      facing.rotation.y += dr * Math.min(1, dt * 12);
    }
    // độ cao: mặt đất (+ đang nhảy)
    const g = this.ground;
    const h = g ? g.heightAt(pos.x, pos.z, footY) : 0;
    if (Number.isFinite(h)) pos.y = h + this.airY;
    // chào: đếm lùi; ngồi: hoà mượt 0 ↔ 1; đứng lâu: đếm giây (R-DIEU-7, R-DIEU-8)
    this.bowLeft = Math.max(0, this.bowLeft - dt);
    st.bow = this.bowLeft > 0 ? Math.min(1, (BOW_TIME - this.bowLeft) / 0.3, this.bowLeft / 0.3) : 0;
    // biểu cảm: đếm tới hết thời lượng rồi về dáng đứng (R-BIEU-2); Ngồi nghỉ ngồi như Ngồi ôn (chỉ dáng)
    const em = st.emote;
    if (em) {
      em.t += dt;
      if (em.t >= em.len) this.stopEmote();
    }
    // tới luống / đang diễn: quay mặt về luống (R-VUON-13); đi → thôi
    if (this.faceYaw !== null) {
      const facing = this.character.facing;
      const dr = Math.atan2(Math.sin(this.faceYaw - facing.rotation.y), Math.cos(this.faceYaw - facing.rotation.y));
      if (mps > 0) this.faceYaw = null;
      else {
        facing.rotation.y += dr * Math.min(1, dt * 12);
        if (Math.abs(dr) < 0.01 && !st.work) this.faceYaw = null;
      }
    }
    // làm vườn: đếm tới hết thời lượng → onDone (có thể nối việc kế trong hàng đợi)
    const wk = st.work;
    if (wk) {
      wk.t += dt;
      if (wk.t >= wk.len) {
        st.work = undefined;
        this.workCancel = null;
        const done = this.workDone;
        this.workDone = null;
        done?.();
      }
    }
    st.sit += ((this.sitting || this.emoteSits ? 1 : 0) - st.sit) * Math.min(1, dt * 5);
    // sau biểu cảm đếm đứng lâu lại từ 0 (R-BIEU-2, R-DIEU-8)
    const still = mps === 0 && !st.air && !this.sitting && this.bowLeft === 0 && !st.emote && !st.work && !this.auto;
    st.idle = still ? st.idle + dt : 0;
    st.mps = mps;
    this.character.animate(dt, mps / RUN_SPEED, st);
  }
}
