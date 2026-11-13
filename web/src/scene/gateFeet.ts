/**
 * Nén khối đá chân trụ của model cổng (L-5): model AI giữ tỉ lệ ảnh thiết kế nên đế đá cao ~1/6 cổng — co cổng cho vừa
 * cảnh thì đế vẫn cao hơn người. Hàm thuần (không three) trên mảng toạ độ xyz phẳng, toạ độ của cổng (đáy y = 0).
 */

export interface FeetOpts {
  /** chiều cao đế sau khi nén (m) — giữ cỡ người như lan can, biển */
  height: number;
  /** hệ số thu bề ngang đế quanh trục trụ */
  shrink: number;
}

/** Dải đo trục trụ (phần chiều cao cổng): chỉ có thân trụ, chưa tới xà thấp nhất (~0,47 H). */
const BAND: [number, number] = [0.2, 0.3];

function nearest(x: number, z: number, centers: readonly [number, number][]): [number, number, number] {
  let best = 0;
  let bd = Infinity;
  centers.forEach(([cx, cz], i) => {
    const d = Math.hypot(x - cx, z - cz);
    if (d < bd) [bd, best] = [d, i];
  });
  return [best, ...centers[best]] as [number, number, number];
}

/**
 * `pos` sửa tại chỗ. `centers`: tâm gần đúng của các trụ (vd. tâm hộp chân đế — lệch theo trống đá) → đo lại trục trụ ở dải
 * thân trụ, bán kính trụ = trung vị khoảng cách tới trục; đỉnh đế = điểm cao nhất (dưới 0,3 H) xa trục hơn 1,3 × bán kính.
 * Phần dưới đỉnh đế: co dọc về `height`, thu ngang `shrink` quanh trục; phần trên hạ xuống cho liền. Trả về độ hạ (m);
 * đế đã thấp hơn `height` → 0, không đổi gì.
 */
export function squashFeet(pos: Float32Array, centers: readonly [number, number][], o: FeetOpts): number {
  const n = pos.length / 3;
  if (!n || !centers.length) return 0;
  let H = 0;
  for (let i = 0; i < n; i++) H = Math.max(H, pos[3 * i + 1]);

  // trục từng trụ: giữa khung bao các điểm thân trụ gần nó
  const box = centers.map(() => [Infinity, -Infinity, Infinity, -Infinity]);
  for (let i = 0; i < n; i++) {
    const y = pos[3 * i + 1];
    if (y < BAND[0] * H || y > BAND[1] * H) continue;
    const [k] = nearest(pos[3 * i], pos[3 * i + 2], centers);
    const b = box[k];
    b[0] = Math.min(b[0], pos[3 * i]);
    b[1] = Math.max(b[1], pos[3 * i]);
    b[2] = Math.min(b[2], pos[3 * i + 2]);
    b[3] = Math.max(b[3], pos[3 * i + 2]);
  }
  const axes = centers.map(([cx, cz], k): [number, number] => {
    const [x0, x1, z0, z1] = box[k];
    return Number.isFinite(x0) ? [(x0 + x1) / 2, (z0 + z1) / 2] : [cx, cz];
  });

  const distTo = (i: number): number => {
    const [, ax, az] = nearest(pos[3 * i], pos[3 * i + 2], axes);
    return Math.hypot(pos[3 * i] - ax, pos[3 * i + 2] - az);
  };
  const radii: number[] = [];
  for (let i = 0; i < n; i++) {
    const y = pos[3 * i + 1];
    if (y >= BAND[0] * H && y <= BAND[1] * H) radii.push(distTo(i));
  }
  if (!radii.length) return 0;
  radii.sort((a, b) => a - b);
  const rp = radii[Math.floor(radii.length / 2)];

  let top = 0;
  for (let i = 0; i < n; i++) {
    const y = pos[3 * i + 1];
    if (y < BAND[1] * H && distTo(i) > 1.3 * rp) top = Math.max(top, y);
  }
  if (top <= o.height) return 0;

  const k = o.height / top;
  const drop = top - o.height;
  for (let i = 0; i < n; i++) {
    const y = pos[3 * i + 1];
    if (y > top + 1e-6) {
      pos[3 * i + 1] = y - drop;
      continue;
    }
    const [, ax, az] = nearest(pos[3 * i], pos[3 * i + 2], axes);
    pos[3 * i] = ax + (pos[3 * i] - ax) * o.shrink;
    pos[3 * i + 2] = az + (pos[3 * i + 2] - az) * o.shrink;
    pos[3 * i + 1] = y * k;
  }
  return drop;
}
