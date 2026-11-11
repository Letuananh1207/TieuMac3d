/**
 * Lưới độ cao của địa hình: độ cao tại các đỉnh lưới vuông, mỗi ô chia hai tam giác.
 * Toán thuần (không three, không DOM) để bộ điều khiển nhân vật, camera và `scene:check` dùng chung với lưới vẽ.
 *
 * Cách chia ô PHẢI khớp `scene/terrain.ts`: ô (i, j) có 4 đỉnh a = (i, j), b = (i+1, j), c = (i, j+1), d = (i+1, j+1);
 * hai tam giác (a, c, b) và (b, c, d) — đường chéo nối b với c. Nhờ vậy nhân vật đứng đúng trên mặt đã vẽ.
 */
export class Heightfield {
  constructor(
    /** góc ô (0, 0) trong toạ độ cảnh */
    readonly originX: number,
    readonly originZ: number,
    /** cạnh một ô, mét */
    readonly cell: number,
    /** số ô theo x, theo z */
    readonly nx: number,
    readonly nz: number,
    /** độ cao tại (nx + 1) × (nz + 1) đỉnh, hàng theo z: chỉ số = j * (nx + 1) + i */
    readonly heights: Float32Array,
  ) {}

  /** Độ cao tại đỉnh lưới (i, j). */
  vertex(i: number, j: number): number {
    return this.heights[j * (this.nx + 1) + i];
  }

  /** Toạ độ ô + phần lẻ trong ô; ra ngoài lưới → null. */
  private locate(x: number, z: number): { i: number; j: number; fx: number; fz: number } | null {
    const gx = (x - this.originX) / this.cell;
    const gz = (z - this.originZ) / this.cell;
    if (!(gx >= 0 && gz >= 0 && gx <= this.nx && gz <= this.nz)) return null;
    const i = Math.min(Math.floor(gx), this.nx - 1);
    const j = Math.min(Math.floor(gz), this.nz - 1);
    return { i, j, fx: gx - i, fz: gz - j };
  }

  /** Độ cao mặt đất tại (x, z), đúng như lưới đã vẽ. Ngoài lưới → NaN. */
  heightAt(x: number, z: number): number {
    const p = this.locate(x, z);
    if (!p) return NaN;
    const { i, j, fx, fz } = p;
    const a = this.vertex(i, j);
    const b = this.vertex(i + 1, j);
    const c = this.vertex(i, j + 1);
    const d = this.vertex(i + 1, j + 1);
    if (fx + fz <= 1) return a + (b - a) * fx + (c - a) * fz;
    return d + (c - d) * (1 - fx) + (b - d) * (1 - fz);
  }

  /** Độ dốc (độ, 0 = phẳng) của tam giác chứa (x, z). Ngoài lưới → 90. */
  slopeAt(x: number, z: number): number {
    const p = this.locate(x, z);
    if (!p) return 90;
    const { i, j, fx, fz } = p;
    const s = this.cell;
    let dhdx: number;
    let dhdz: number;
    if (fx + fz <= 1) {
      const a = this.vertex(i, j);
      dhdx = (this.vertex(i + 1, j) - a) / s;
      dhdz = (this.vertex(i, j + 1) - a) / s;
    } else {
      const d = this.vertex(i + 1, j + 1);
      dhdx = (d - this.vertex(i, j + 1)) / s;
      dhdz = (d - this.vertex(i + 1, j)) / s;
    }
    return (Math.atan(Math.hypot(dhdx, dhdz)) * 180) / Math.PI;
  }
}
