/**
 * Mặt đất cho nhân vật / camera: địa hình (hoặc sân phẳng y = 0) cộng các "tấm" cao hơn — nền nhà vào được và dốc
 * bậc lên nền. Toán thuần, không three.
 */

/** Thứ trả lời được "đất cao bao nhiêu, dốc bao nhiêu" tại (x, z). `Heightfield` khớp hình này. */
export interface Ground {
  heightAt(x: number, z: number): number;
  /** độ dốc, độ (0 = phẳng) */
  slopeAt(x: number, z: number): number;
}

/**
 * Tấm thẳng trục: phẳng ở `y`, hoặc dốc đều dọc trục `ramp.axis` từ `y` (tại `ramp.at0`) tới `ramp.y1` (tại `ramp.at1`).
 * `round` = tấm tròn nội tiếp hộp (tâm hộp, bán kính nửa cạnh x) — mặt tầng đài tròn.
 */
export interface Pad {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  y: number;
  ramp?: { axis: 'x' | 'z'; at0: number; at1: number; y1: number };
  round?: boolean;
}

function inside(p: Pad, x: number, z: number): boolean {
  if (!(x >= p.minX && x <= p.maxX && z >= p.minZ && z <= p.maxZ)) return false;
  if (!p.round) return true;
  const r = (p.maxX - p.minX) / 2;
  return Math.hypot(x - (p.minX + r), z - (p.minZ + p.maxZ) / 2) <= r;
}

function padHeight(p: Pad, x: number, z: number): number {
  if (!p.ramp) return p.y;
  const { axis, at0, at1, y1 } = p.ramp;
  const t = Math.min(1, Math.max(0, ((axis === 'x' ? x : z) - at0) / (at1 - at0)));
  return p.y + (y1 - p.y) * t;
}

/** Địa hình + tấm. Tấm khai báo trước thắng khi chồng nhau; ngoài mọi tấm → `base` (thiếu = phẳng y 0). */
export class LayeredGround implements Ground {
  constructor(
    private readonly base: Ground | null,
    private readonly pads: Pad[],
  ) {}

  private padAt(x: number, z: number): Pad | undefined {
    return this.pads.find((p) => inside(p, x, z));
  }

  heightAt(x: number, z: number): number {
    const p = this.padAt(x, z);
    if (p) return padHeight(p, x, z);
    return this.base ? this.base.heightAt(x, z) : 0;
  }

  slopeAt(x: number, z: number): number {
    const p = this.padAt(x, z);
    if (p) {
      if (!p.ramp) return 0;
      return (Math.atan(Math.abs(p.ramp.y1 - p.y) / Math.abs(p.ramp.at1 - p.ramp.at0)) * 180) / Math.PI;
    }
    return this.base ? this.base.slopeAt(x, z) : 0;
  }
}
