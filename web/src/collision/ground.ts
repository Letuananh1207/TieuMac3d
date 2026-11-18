/**
 * Mặt đất cho nhân vật / camera: địa hình (hoặc sân phẳng y = 0) cộng các "tấm" cao hơn — nền nhà vào được và dốc
 * bậc lên nền. Toán thuần, không three.
 */

/** Thứ trả lời được "đất cao bao nhiêu, dốc bao nhiêu" tại (x, z). `Heightfield` khớp hình này. */
export interface Ground {
  /** `fromY` = chân nhân vật đang ở độ cao nào (nhà nhiều tầng chọn mặt sàn với tới được); thiếu = tầng thấp nhất */
  heightAt(x: number, z: number, fromY?: number): number;
  /** độ dốc, độ (0 = phẳng) */
  slopeAt(x: number, z: number, fromY?: number): number;
}

/** Cao nhất bước lên được một lần (m): chọn mặt tầng trên khi chân cách mặt đó không quá chừng này (R-VA-3). */
export const STEP_UP = 0.6;

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
  /**
   * Tấm tầng trên (sàn tầng 2, cầu thang): chồng lên tấm khác, chỉ tính khi biết chân đang ở đâu (`fromY`) và mặt tấm
   * không cao hơn chân quá `STEP_UP` — đứng dưới sàn tầng 2 vẫn ở tầng 1.
   */
  upper?: boolean;
  /** tấm tròn (`round`) khoét lỗ tròn giữa bán kính `hole` — mặt mũ Nấm Mẹ quanh giếng thang (V-109) */
  hole?: number;
  /**
   * Thang xoắn (V-109, Nấm Mẹ): vành khăn quanh tâm hộp, bán kính `r0`…`r1`; mặt dốc đều theo góc phương vị (rad, 0 = +z,
   * π/2 = +x): tại `a0` cao `y`, mỗi rad thêm `rise` m, hết sau `span` rad. Các vòng chồng nhau — chọn vòng theo chân
   * (`fromY`) như tấm tầng trên, nên phải kèm `upper`. Hộp `min`/`max` = tâm ± `r1`.
   */
  helix?: { r0: number; r1: number; a0: number; rise: number; span: number };
}

const TAU = Math.PI * 2;

/** Mặt tấm `p` tại (x, z) cao bao nhiêu; ngoài tấm → `null`. Thang xoắn chọn vòng cao nhất chân với tới (`fromY`). */
function surfaceY(p: Pad, x: number, z: number, fromY?: number): number | null {
  if (!(x >= p.minX && x <= p.maxX && z >= p.minZ && z <= p.maxZ)) return null;
  const cx = (p.minX + p.maxX) / 2;
  const cz = (p.minZ + p.maxZ) / 2;
  if (p.helix) {
    const { r0, r1, a0, rise, span } = p.helix;
    const r = Math.hypot(x - cx, z - cz);
    if (r < r0 || r > r1 || fromY === undefined) return null;
    const t0 = (((Math.atan2(x - cx, z - cz) - a0) % TAU) + TAU) % TAU;
    let best: number | null = null;
    for (let t = t0; t <= span + 1e-9; t += TAU) {
      const y = p.y + rise * Math.min(t, span);
      if (y <= fromY + STEP_UP) best = y;
    }
    return best;
  }
  if (p.round) {
    const r = Math.hypot(x - cx, z - cz);
    if (r > (p.maxX - p.minX) / 2 || r < (p.hole ?? 0)) return null;
  }
  if (!p.ramp) return p.y;
  const { axis, at0, at1, y1 } = p.ramp;
  const t = Math.min(1, Math.max(0, ((axis === 'x' ? x : z) - at0) / (at1 - at0)));
  return p.y + (y1 - p.y) * t;
}

/** Độ dốc mặt tấm (độ). */
function padSlope(p: Pad, x: number, z: number): number {
  if (p.helix) {
    const r = Math.max(0.1, Math.hypot(x - (p.minX + p.maxX) / 2, z - (p.minZ + p.maxZ) / 2));
    return (Math.atan(Math.abs(p.helix.rise) / r) * 180) / Math.PI;
  }
  if (!p.ramp) return 0;
  return (Math.atan(Math.abs(p.ramp.y1 - p.y) / Math.abs(p.ramp.at1 - p.ramp.at0)) * 180) / Math.PI;
}

/** Địa hình + tấm. Tấm khai báo trước thắng khi chồng nhau; ngoài mọi tấm → `base` (thiếu = phẳng y 0). */
export class LayeredGround implements Ground {
  constructor(
    private readonly base: Ground | null,
    private readonly pads: Pad[],
  ) {}

  private padAt(x: number, z: number, fromY?: number): { p: Pad; y: number } | undefined {
    if (fromY !== undefined && Number.isFinite(fromY)) {
      // tầng trên: mặt cao nhất mà chân với tới
      let best: { p: Pad; y: number } | undefined;
      for (const p of this.pads) {
        if (!p.upper) continue;
        const y = surfaceY(p, x, z, fromY);
        if (y !== null && y <= fromY + STEP_UP && (!best || y > best.y)) best = { p, y };
      }
      if (best) return best;
    }
    for (const p of this.pads) {
      if (p.upper) continue;
      const y = surfaceY(p, x, z);
      if (y !== null) return { p, y };
    }
    return undefined;
  }

  heightAt(x: number, z: number, fromY?: number): number {
    const hit = this.padAt(x, z, fromY);
    if (hit) return hit.y;
    return this.base ? this.base.heightAt(x, z) : 0;
  }

  slopeAt(x: number, z: number, fromY?: number): number {
    const hit = this.padAt(x, z, fromY);
    if (hit) return padSlope(hit.p, x, z);
    return this.base ? this.base.slopeAt(x, z) : 0;
  }
}
