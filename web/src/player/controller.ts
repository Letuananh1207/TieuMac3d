import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Character } from './character';

/** mét / giây */
export const SPEED = 4.2;
/** bán kính va chạm của nhân vật */
export const PLAYER_RADIUS = 0.5;

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
  ) {}

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
