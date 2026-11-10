/**
 * Va chạm 2D trên mặt sân: mọi vật cản là hộp chữ nhật thẳng trục (AABB), người chơi là hình tròn.
 * Đủ cho một sân có tường, nhà, cây; không cần thư viện vật lý (cannon, rapier…), vốn nặng
 * và thừa khi không có trọng lực hay vật đẩy nhau.
 */
export interface Box {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface PointXZ {
  x: number;
  z: number;
}

/** Vật cản tròn trên mặt sân: ao tròn, đài tỉ thí, lò đan… */
export interface Circle {
  x: number;
  z: number;
  r: number;
}

export class Colliders {
  readonly boxes: Box[] = [];
  readonly circles: Circle[] = [];

  /** Thêm hộp tâm (x, z), rộng w theo trục x, sâu d theo trục z. */
  add(x: number, z: number, w: number, d: number): void {
    this.boxes.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  }

  /** Thêm vật cản tròn tâm (x, z), bán kính r. */
  addCircle(x: number, z: number, r: number): void {
    this.circles.push({ x, z, r });
  }

  /** Đẩy hình tròn bán kính `r` tại `pos` ra khỏi mọi vật cản nó lấn vào. Sửa trực tiếp `pos`. */
  resolve(pos: PointXZ, r: number): void {
    for (const c of this.boxes) {
      const cx = Math.max(c.minX, Math.min(pos.x, c.maxX));
      const cz = Math.max(c.minZ, Math.min(pos.z, c.maxZ));
      const dx = pos.x - cx;
      const dz = pos.z - cz;
      const d = Math.hypot(dx, dz);
      if (d < r) {
        if (d > 1e-4) {
          pos.x = cx + (dx / d) * r;
          pos.z = cz + (dz / d) * r;
        } else {
          pos.z = c.maxZ + r; // tâm nằm hẳn trong hộp: đẩy ra phía nam
        }
      }
    }
    for (const c of this.circles) {
      const dx = pos.x - c.x;
      const dz = pos.z - c.z;
      const d = Math.hypot(dx, dz);
      const min = c.r + r;
      if (d < min) {
        if (d > 1e-4) {
          pos.x = c.x + (dx / d) * min;
          pos.z = c.z + (dz / d) * min;
        } else {
          pos.z = c.z + min; // đứng đúng tâm: đẩy ra phía nam, như hộp
        }
      }
    }
  }
}
