/**
 * Đo dáng hạc model (Tripo, tư thế bay lướt, hai cánh dang ngang — kế hoạch docs/tasks/2026-11-16-hac-model.md) và chia
 * trọng số da cho 5 xương để code tự vỗ cánh. Thuần (mảng số, không three) — `hacModel.ts` dựng xương / SkinnedMesh.
 * Toạ độ vào: sải dọc x (đối xứng quanh x = 0), y lên, mũi ±z. Sải dọc z → `spanYaw` cho góc xoay về x.
 *
 * Cách đo: chia nửa sải |x| thành dải; mỗi dải đo bề dày y. Thân dày, cánh mỏng → **vai** = dải đầu tiên (từ giữa ra) mỏng
 * hơn ngưỡng (giữa bề dày thân và bề dày cánh). **Khớp đầu cánh** ở 55 % đoạn vai → mút cánh. **Đỉnh lưng** = điểm cao nhất
 * của thân quanh chỗ ngồi (giữa hai vai, theo z của vai); chỗ ngồi = đỉnh lưng + `seatLift`.
 */

import { legWeight, type CraneLegs } from './hacChan';
import { neckWeight, type CraneNeck } from './hacCo';

export type V3 = [number, number, number];

/**
 * Thứ tự xương: gốc (thân) · vai trái (x < 0) · đầu cánh trái · vai phải · đầu cánh phải · hông / gối / cổ chân trái ·
 * hông / gối / cổ chân phải (chân — L-22, `hacChan.ts`) · gốc cổ · đầu (cổ — L-22, `hacCo.ts`).
 */
export const CRANE_BONES = [
  'goc',
  'vai-trai',
  'dau-trai',
  'vai-phai',
  'dau-phai',
  'hong-trai',
  'goi-trai',
  'co-chan-trai',
  'hong-phai',
  'goi-phai',
  'co-chan-phai',
  'goc-co',
  'dau-hac',
] as const;
/** chỉ số xương theo tên */
export const BONE = Object.fromEntries(CRANE_BONES.map((n, i) => [n, i])) as Record<(typeof CRANE_BONES)[number], number>;

export interface CraneShape {
  /** nửa sải cánh (m) */
  halfSpan: number;
  /** vai phải (x > 0); vai trái đối xứng qua x = 0 */
  shoulder: V3;
  /** khớp đầu cánh phải */
  tip: V3;
  /** y cao nhất của lưng quanh chỗ ngồi */
  backTop: number;
  /** chỗ ngồi (giữa hai vai) */
  seat: V3;
  /** hai chân (đo riêng bằng `measureLegs` — cần tam giác); không có → không đứng được, chỉ gập cánh */
  legs?: CraneLegs | null;
  /** cổ (đo riêng bằng `measureNeck`); không có → cổ giữ dáng bay */
  neck?: CraneNeck | null;
}

const BINS = 48;
/** khớp đầu cánh: tỉ lệ dọc đoạn vai → mút cánh */
const TIP_AT = 0.55;

/** Góc quay quanh trục đứng để sải nằm dọc x: 0 (đã dọc x) hoặc π/2 (đang dọc z). */
export function spanYaw(pos: ArrayLike<number>): number {
  let x = 0;
  let z = 0;
  for (let i = 0; i < pos.length; i += 3) {
    x = Math.max(x, Math.abs(pos[i]));
    z = Math.max(z, Math.abs(pos[i + 2]));
  }
  return z > x * 1.05 ? Math.PI / 2 : 0;
}

/** Xoay các đỉnh quanh trục đứng (như `rotateY` của three: x' = x cos + z sin, z' = −x sin + z cos). */
export function yawed(pos: ArrayLike<number>, a: number): Float32Array {
  const out = Float32Array.from(pos);
  const c = Math.cos(a);
  const s = Math.sin(a);
  for (let i = 0; i < out.length; i += 3) {
    const x = out[i];
    const z = out[i + 2];
    out[i] = x * c + z * s;
    out[i + 2] = -x * s + z * c;
  }
  return out;
}

interface Bin {
  n: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  sumY: number;
}

const emptyBin = (): Bin => ({ n: 0, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity, sumY: 0 });
const thick = (b: Bin): number => (b.n ? b.maxY - b.minY : 0);

/** Gộp các dải [from, to) thành một (đo vai / khớp). */
function joined(bins: Bin[], from: number, to: number): Bin {
  const o = emptyBin();
  for (let i = Math.max(0, from); i < Math.min(bins.length, to); i++) {
    const b = bins[i];
    if (!b.n) continue;
    o.n += b.n;
    o.sumY += b.sumY;
    o.minY = Math.min(o.minY, b.minY);
    o.maxY = Math.max(o.maxY, b.maxY);
    o.minZ = Math.min(o.minZ, b.minZ);
    o.maxZ = Math.max(o.maxZ, b.maxZ);
  }
  return o;
}

export interface MeasureTune {
  /** ép x vai (m) — khi tự đo sai (model cánh dày ở gốc) */
  shoulderX?: number | null;
  /** chỗ ngồi cao hơn đỉnh lưng bấy nhiêu (m) */
  seatLift?: number;
}

/** Đo dáng hạc từ các đỉnh (x, y, z liên tiếp). */
export function measureCrane(pos: ArrayLike<number>, tune: MeasureTune = {}): CraneShape {
  let half = 0;
  for (let i = 0; i < pos.length; i += 3) half = Math.max(half, Math.abs(pos[i]));
  if (!(half > 0)) throw new Error('hacCanh: lưới không có sải cánh');
  const bins = Array.from({ length: BINS }, emptyBin);
  const binOf = (ax: number): number => Math.min(BINS - 1, Math.floor((ax / half) * BINS));
  for (let i = 0; i < pos.length; i += 3) {
    const b = bins[binOf(Math.abs(pos[i]))];
    const y = pos[i + 1];
    const z = pos[i + 2];
    b.n++;
    b.sumY += y;
    b.minY = Math.min(b.minY, y);
    b.maxY = Math.max(b.maxY, y);
    b.minZ = Math.min(b.minZ, z);
    b.maxZ = Math.max(b.maxZ, z);
  }
  // bề dày thân = dải giữa; bề dày cánh = trung vị nửa ngoài
  const body = Math.max(thick(bins[0]), thick(bins[1]));
  const outer = bins.slice(BINS / 2).filter((b) => b.n).map(thick).sort((a, b) => a - b);
  const wing = outer.length ? outer[Math.floor(outer.length / 2)] : 0;
  const limit = wing + 0.25 * (body - wing);
  let sb = 1;
  while (sb < BINS / 2 && (!bins[sb].n || thick(bins[sb]) >= limit)) sb++;
  const sx = tune.shoulderX ?? (sb * half) / BINS;
  const near = Math.max(2, Math.round(BINS * 0.1));
  const root = joined(bins, binOf(sx), binOf(sx) + near);
  const shoulder: V3 = [sx, root.n ? root.sumY / root.n : 0, root.n ? (root.minZ + root.maxZ) / 2 : 0];
  const tx = sx + TIP_AT * (half - sx);
  const tb = joined(bins, binOf(tx) - 1, binOf(tx) + 2);
  const tip: V3 = [tx, tb.n ? tb.sumY / tb.n : shoulder[1], tb.n ? (tb.minZ + tb.maxZ) / 2 : shoulder[2]];
  // đỉnh lưng: thân giữa hai vai, quanh z của vai (không lấy cổ / đầu vươn trước, đuôi sau)
  const sz = shoulder[2];
  const band = Math.max(0.3, sx);
  let top = -Infinity;
  for (let i = 0; i < pos.length; i += 3) {
    if (Math.abs(pos[i]) < sx * 0.6 && Math.abs(pos[i + 2] - sz) < band) top = Math.max(top, pos[i + 1]);
  }
  if (!Number.isFinite(top)) top = shoulder[1];
  return { halfSpan: half, shoulder, tip, backTop: top, seat: [0, top + (tune.seatLift ?? 0.11), sz] };
}

const smooth = (a: number, b: number, v: number): number => {
  const k = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/** Dải chuyển mềm (m) quanh vai / khớp đầu cánh — tính theo nửa sải. */
export function blendBands(s: CraneShape): { shoulder: [number, number]; tip: [number, number] } {
  const w = 0.08 * s.halfSpan;
  return { shoulder: [s.shoulder[0] * 0.7, s.shoulder[0] + w], tip: [s.tip[0] - w, s.tip[0] + w] };
}

/**
 * Trọng số da: mỗi đỉnh 4 chỉ số xương + 4 trọng số (tổng 1). Thân (gốc) → vai (dải chuyển mềm quanh vai, phần thân sát
 * vai uốn theo một ít — không rách) → đầu cánh (dải chuyển quanh khớp). Bên theo dấu x. Phần thân (ngoài cánh) chia tiếp:
 * quanh chân → hông / gối / cổ chân (`legWeight`), phía trước gốc cổ → cổ / đầu (`neckWeight`). Giữ 4 xương nặng nhất.
 */
export function craneWeights(pos: ArrayLike<number>, s: CraneShape): { index: Uint16Array; weight: Float32Array } {
  const n = Math.floor(pos.length / 3);
  const index = new Uint16Array(n * 4);
  const weight = new Float32Array(n * 4);
  const bands = blendBands(s);
  for (let i = 0; i < n; i++) {
    const x = pos[i * 3];
    const y = pos[i * 3 + 1];
    const z = pos[i * 3 + 2];
    const ax = Math.abs(x);
    const wing = smooth(bands.shoulder[0], bands.shoulder[1], ax);
    const hand = smooth(bands.tip[0], bands.tip[1], ax);
    const left = x < 0;
    // phần thân (không cánh) chia tiếp cho chân / cổ
    const core = 1 - wing;
    const leg = s.legs ? legWeight(x, y, z, s.legs) : { w: 0, knee: 0, foot: 0 };
    const neck = s.neck ? neckWeight(z, s.neck) : { w: 0, head: 0 };
    const lw = core * leg.w;
    const nw = core * (1 - leg.w) * neck.w;
    const parts: [number, number][] = [
      [BONE.goc, core - lw - nw],
      [left ? BONE['vai-trai'] : BONE['vai-phai'], wing * (1 - hand)],
      [left ? BONE['dau-trai'] : BONE['dau-phai'], wing * hand],
      [left ? BONE['hong-trai'] : BONE['hong-phai'], lw * (1 - leg.knee)],
      [left ? BONE['goi-trai'] : BONE['goi-phai'], lw * (leg.knee - leg.foot)],
      [left ? BONE['co-chan-trai'] : BONE['co-chan-phai'], lw * leg.foot],
      [BONE['goc-co'], nw * (1 - neck.head)],
      [BONE['dau-hac'], nw * neck.head],
    ];
    // giữ 4 phần lớn nhất (mỗi đỉnh chỉ 4 xương), chuẩn lại tổng 1
    parts.sort((a, b) => b[1] - a[1]);
    const top = parts.slice(0, 4);
    const sum = top.reduce((t, p) => t + Math.max(0, p[1]), 0) || 1;
    index.set(top.map((p) => p[0]), i * 4);
    weight.set(top.map((p) => Math.max(0, p[1]) / sum), i * 4);
  }
  return { index, weight };
}
