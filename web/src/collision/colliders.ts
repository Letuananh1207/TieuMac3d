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
  /** cao bao nhiêu thì che tầm nhìn camera (m, từ mặt đất); 0 = vật thấp, không che (R-DIEU-4) */
  h: number;
  /**
   * Chỉ chặn khi chân nhân vật ở khoảng cao này (m, toạ độ cảnh) — nhà nhiều tầng: lan can tầng 2 không chặn người ở
   * tầng 1, kệ tầng 1 không chặn người ở tầng 2. Thiếu = chặn mọi độ cao.
   */
  minY?: number;
  maxY?: number;
}

/** Khoảng cao chân nhân vật mà một hộp chặn (xem `Box.minY` / `maxY`). */
export interface YRange {
  minY?: number;
  maxY?: number;
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

  /** Thêm hộp tâm (x, z), rộng w theo trục x, sâu d theo trục z. `h` > 0: vật cao che tầm nhìn camera (tường, nhà). */
  add(x: number, z: number, w: number, d: number, h = 0, range?: YRange): void {
    this.boxes.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, h, ...range });
  }

  /**
   * Tầm nhìn (R-DIEU-4): đoạn từ (x0, y0, z0) tới (x1, y1, z1) — y tính từ mặt đất chỗ nhân vật — đi vào hộp che tầm nhìn
   * đầu tiên ở phần t ∈ (0, 1] nào, mà tại đó đoạn còn thấp hơn đỉnh hộp. Không bị che → 1. Bỏ hộp chứa điểm đầu.
   */
  sightBlock(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): number {
    const dx = x1 - x0;
    const dz = z1 - z0;
    let best = 1;
    for (const b of this.boxes) {
      if (b.h <= 0) continue;
      let t0 = 0;
      let t1 = 1;
      // cắt đoạn với hai cặp mặt phẳng x, z (slab)
      for (const [o, d, lo, hi] of [
        [x0, dx, b.minX, b.maxX],
        [z0, dz, b.minZ, b.maxZ],
      ]) {
        if (Math.abs(d) < 1e-9) {
          if (o < lo || o > hi) t0 = 2; // song song, ngoài hộp
          continue;
        }
        let a = (lo - o) / d;
        let c = (hi - o) / d;
        if (a > c) [a, c] = [c, a];
        t0 = Math.max(t0, a);
        t1 = Math.min(t1, c);
      }
      if (t0 > t1 || t0 <= 0 || t0 >= best) continue;
      if (y0 + (y1 - y0) * t0 < b.h) best = t0;
    }
    return best;
  }

  /** Thêm vật cản tròn tâm (x, z), bán kính r. */
  addCircle(x: number, z: number, r: number): void {
    this.circles.push({ x, z, r });
  }

  /**
   * Đẩy hình tròn bán kính `r` tại `pos` ra khỏi mọi vật cản nó lấn vào. Sửa trực tiếp `pos`. `y` = chân nhân vật
   * (bỏ hộp có khoảng cao không chứa `y`); thiếu = mọi hộp.
   */
  resolve(pos: PointXZ, r: number, y?: number): void {
    for (const c of this.boxes) {
      if (y !== undefined && ((c.minY !== undefined && y < c.minY) || (c.maxY !== undefined && y > c.maxY))) continue;
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
