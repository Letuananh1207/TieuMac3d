/**
 * Cổ hạc model (L-22): model bay vươn cổ ngang ra trước → code tìm **gốc cổ** (chỗ thân thắt lại thành cổ) và **khớp đầu**
 * (chỗ cổ mảnh nhất ngay sau đầu), chia trọng số mềm cho 2 xương để khi đứng cổ ngẩng cong chữ S, đầu giữ mỏ hướng trước.
 * Thuần (mảng số, không three).
 *
 * Cách tìm: cắt phần giữa (|x| nhỏ, bỏ cánh) thành lát theo z từ chỗ ngồi ra trước; bề dày lát (y cao − y thấp). Gốc cổ =
 * lát đầu tiên mỏng hơn `BASE_AT` bề dày thân ở chỗ ngồi; khớp đầu = lát mỏng nhất phía trước gốc cổ, trước khi bề dày
 * tăng lại (đầu) quá `HEAD_RISE` lần.
 */
import type { V3 } from './hacCanh';
import { smooth } from './hacChan';

export interface CraneNeck {
  /** gốc cổ (x = 0) */
  base: V3;
  /** khớp đầu (x = 0) */
  head: V3;
  /** nửa dải chuyển mềm theo z quanh gốc cổ / khớp đầu */
  band: number;
  headBand: number;
}

const BASE_AT = 0.55;
const HEAD_RISE = 1.35;

/**
 * Tìm cổ; `seatZ` z chỗ ngồi, `xLim` chỉ xét |x| < xLim; `index` tam giác (null = 3 đỉnh liên tiếp) — đo trên cạnh tam giác
 * (lưới thưa vẫn đủ điểm mỗi lát). Không thấy phần thắt ở phía trước → `null`.
 */
export function measureNeck(
  pos: ArrayLike<number>,
  index: ArrayLike<number> | null,
  seatZ: number,
  xLim: number,
  halfSpan: number,
): CraneNeck | null {
  const step = halfSpan / 30;
  let zMax = -Infinity;
  for (let i = 0; i < pos.length; i += 3) if (Math.abs(pos[i]) < xLim) zMax = Math.max(zMax, pos[i + 2]);
  const n = Math.floor((zMax - seatZ) / step);
  if (n < 6) return null;
  const lo = new Array<number>(n).fill(Infinity);
  const hi = new Array<number>(n).fill(-Infinity);
  const put = (y: number, z: number): void => {
    const k = Math.floor((z - seatZ) / step);
    if (k < 0 || k >= n) return;
    lo[k] = Math.min(lo[k], y);
    hi[k] = Math.max(hi[k], y);
  };
  const edge = (a: number, b: number): void => {
    if (Math.abs(pos[a * 3]) >= xLim && Math.abs(pos[b * 3]) >= xLim) return;
    const [ya, za, yb, zb] = [pos[a * 3 + 1], pos[a * 3 + 2], pos[b * 3 + 1], pos[b * 3 + 2]];
    const m = Math.min(64, Math.ceil(Math.abs(zb - za) / (step * 0.5)) + 1);
    for (let j = 0; j <= m; j++) put(ya + ((yb - ya) * j) / m, za + ((zb - za) * j) / m);
  };
  const nv = Math.floor(pos.length / 3);
  const tri = (a: number, b: number, c: number): void => (edge(a, b), edge(b, c), edge(c, a));
  if (index) for (let t = 0; t + 2 < index.length; t += 3) tri(index[t], index[t + 1], index[t + 2]);
  else for (let t = 0; t + 2 < nv; t += 3) tri(t, t + 1, t + 2);
  const thick = (k: number): number => (hi[k] > lo[k] ? hi[k] - lo[k] : 0);
  const zOf = (k: number): number => seatZ + (k + 0.5) * step;
  const yOf = (k: number): number => (lo[k] + hi[k]) / 2;
  const body = Math.max(thick(0), thick(1));
  let b = 1;
  while (b < n && !(thick(b) > 0 && thick(b) < body * BASE_AT)) b++;
  if (b >= n - 2) return null;
  let m = b;
  for (let k = b + 1; k < n; k++) {
    const t = thick(k);
    if (!(t > 0)) continue;
    if (t < thick(m)) m = k;
    else if (t > thick(m) * HEAD_RISE) break;
  }
  if (m <= b) m = Math.min(n - 1, b + 2);
  if (!(thick(m) > 0) || !Number.isFinite(yOf(b) + yOf(m))) return null;
  const band = Math.max(step * 2, (zOf(m) - zOf(b)) * 0.35);
  return { base: [0, yOf(b), zOf(b)], head: [0, yOf(m), zOf(m)], band, headBand: Math.max(step, band * 0.6) };
}

/** Trọng số cổ của một đỉnh: `w` (0…1, phần theo xương cổ) · `head` (phần của `w` theo xương đầu). */
export function neckWeight(z: number, N: CraneNeck): { w: number; head: number } {
  return { w: smooth(N.base[2] - N.band, N.base[2] + N.band, z), head: smooth(N.head[2] - N.headBand, N.head[2] + N.headBand, z) };
}
