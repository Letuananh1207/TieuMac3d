import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Heightfield } from '../collision/heightfield';
import type { Character } from './character';

/** mét / giây */
export const SPEED = 4.2;
/** bán kính va chạm của nhân vật */
export const PLAYER_RADIUS = 0.5;
/** dốc tối đa đi được, độ (luật R-VA-2) */
export const MAX_SLOPE = 35;

/**
 * Luật R-VA-2: có bước từ (fromX, fromZ) tới (toX, toZ) trên địa hình được không.
 * Không vào mặt dốc hơn `MAX_SLOPE` (lên hay xuống), không ra ngoài lưới; đang trên mặt dốc thì chỉ đi xuống.
 */
export function canStep(ground: Heightfield, fromX: number, fromZ: number, toX: number, toZ: number): boolean {
  const to = ground.heightAt(toX, toZ);
  if (!Number.isFinite(to)) return false;
  if (ground.slopeAt(toX, toZ) <= MAX_SLOPE) return true;
  // mặt mới dốc: chỉ cho khi đang mắc trên mặt dốc và bước này đi xuống (thoát ra được, không kẹt mãi)
  return ground.slopeAt(fromX, fromZ) > MAX_SLOPE && to <= ground.heightAt(fromX, fromZ);
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

  constructor(
    readonly character: Character,
    private readonly colliders: Colliders,
    /** địa hình; null = sân phẳng y = 0 */
    private readonly ground: Heightfield | null = null,
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

  update(dt: number, input: MoveInput, camYaw: number, frozen: boolean): void {
    const ix = frozen ? 0 : input.x;
    const iy = frozen ? 0 : input.y;
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
      if (d < 0.25) this.moveTarget = null;
      else {
        mx = dx / d;
        mz = dz / d;
      }
    }

    const speed = Math.hypot(mx, mz);
    if (speed > 0.05) {
      const pos = this.position;
      this.before.copy(pos);
      pos.x += mx * SPEED * dt;
      pos.z += mz * SPEED * dt;
      this.colliders.resolve(pos, PLAYER_RADIUS);
      const g = this.ground;
      if (g && !canStep(g, this.before.x, this.before.z, pos.x, pos.z)) {
        // dốc quá: thử trượt dọc một trục (như chạm tường), không được thì đứng yên
        const tx = pos.x;
        const tz = pos.z;
        if (canStep(g, this.before.x, this.before.z, tx, this.before.z)) pos.set(tx, pos.y, this.before.z);
        else if (canStep(g, this.before.x, this.before.z, this.before.x, tz)) pos.set(this.before.x, pos.y, tz);
        else pos.set(this.before.x, pos.y, this.before.z);
      }
      if (g) {
        const h = g.heightAt(pos.x, pos.z);
        if (Number.isFinite(h)) pos.y = h;
      }
      // kẹt tường khi đang đi tới điểm chạm: bỏ điểm đến
      if (this.moveTarget && pos.distanceTo(this.before) < SPEED * dt * 0.2) this.moveTarget = null;

      const facing = this.character.facing;
      const targetRot = Math.atan2(mx, mz);
      let dr = targetRot - facing.rotation.y;
      dr = Math.atan2(Math.sin(dr), Math.cos(dr));
      facing.rotation.y += dr * Math.min(1, dt * 12);
    }
    this.character.animate(dt, speed);
  }
}
