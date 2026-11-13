/**
 * Vòng trận truyền tống (R-HANH-2), suy từ đặc tả. Thuần (không three, không DOM): dùng chung cho cảnh
 * (`truyenTong.ts`), kiểm đặc tả (`specCheck.ts`) và `main.ts`.
 */
import type { Pad } from '../collision/ground';
import type { DaisSpec, TeleportSpec, XZ } from './spec';

/** Ở trong vòng bấy nhiêu giây thì truyền tống (vòng sáng dần trong lúc đó). */
export const CHARGE_SECONDS = 1.2;

/** Bước vào vòng khi tâm nhân vật cách tâm vòng dưới bấy nhiêu mét (R-HANH-2: 0,8 × bán kính — 3,2 m với vòng 4 m). */
export function ringTrigger(tp: Pick<TeleportSpec, 'ringRadius'>): number {
  return tp.ringRadius * 0.8;
}

/**
 * Chỗ đứng khi về tông môn: phía tây vòng, nhìn về đông (rotY radian, 0 = nhìn +z). Không đài: ngoài vòng 1,5 m;
 * có đài: dưới chân lối bậc phía tây, cách chân bậc 1 m (lên bậc là thấy vòng).
 */
export function arrivalSpot(tp: Pick<TeleportSpec, 'center' | 'ringRadius'> & { dais?: DaisSpec }): { at: XZ; rotY: number } {
  const off = tp.dais && tp.dais.tiers > 0 ? daisLayout({ ringRadius: tp.ringRadius, dais: tp.dais }).footprint + 1 : tp.ringRadius + 1.5;
  return { at: [tp.center[0] - off, tp.center[1]], rotY: Math.PI / 2 };
}

/** Khoảng mặt tầng trên cùng nhô ra ngoài vòng trận (m). */
const TOP_MARGIN = 0.9;
/** Dốc bậc tối đa khi tính chiều dài lối bậc (độ) — dưới `MAX_SLOPE` 35° của R-VA-2 cho dễ đi. */
const STAIR_SLOPE = 28;
/** Lối bậc thò ra ngoài tầng dưới cùng ít nhất bấy nhiêu (m) — chân bậc rõ, không lẫn vào mép đài. */
const STAIR_OUT = 0.9;

/** Hình đài suy từ đặc tả (toạ độ quanh tâm vòng): bán kính từng tầng (dưới → trên), độ cao, lối bậc. */
export interface DaisLayout {
  /** bán kính mặt tầng i (0 = dưới cùng) */
  radii: number[];
  /** độ cao mặt tầng trên cùng */
  height: number;
  /** lối bậc: từ mép tầng trên (`radii` cuối) ra tới `stairEnd` theo mỗi hướng chính */
  stairEnd: number;
  /** bán kính chân đài kể cả lối bậc — ngoài đây là đất */
  footprint: number;
}

export function daisLayout(tp: Pick<TeleportSpec, 'ringRadius'> & { dais: DaisSpec }): DaisLayout {
  const { tiers, tierHeight, tierWidth } = tp.dais;
  const top = tp.ringRadius + TOP_MARGIN;
  const radii = Array.from({ length: tiers }, (_, i) => top + (tiers - 1 - i) * tierWidth);
  const height = tiers * tierHeight;
  const run = Math.max(height / Math.tan((STAIR_SLOPE * Math.PI) / 180), (radii[0] ?? top) - top + STAIR_OUT);
  const stairEnd = top + run;
  return { radii, height, stairEnd, footprint: Math.max(stairEnd, radii[0] ?? top) };
}

/** Bốn hướng chính (cos, sin) — lối bậc. */
export const STAIR_DIRS: readonly XZ[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/**
 * Mặt đất đi được của đài (toạ độ cảnh, `y0` = mặt đất tại tâm): 4 dốc bậc trước (thắng khi chồng), rồi mặt các tầng từ
 * trên xuống. Lên đài chỉ qua bậc vì mép tầng có lan can (`railPosts`).
 */
export function daisPads(tp: Pick<TeleportSpec, 'center' | 'ringRadius'> & { dais: DaisSpec }, y0: number): Pad[] {
  const L = daisLayout(tp);
  const [cx, cz] = tp.center;
  const top = L.radii[L.radii.length - 1];
  const hw = tp.dais.stairWidth / 2;
  const pads: Pad[] = [];
  for (const [dx, dz] of STAIR_DIRS) {
    const lo = Math.min(top * (dx + dz), L.stairEnd * (dx + dz));
    const hi = Math.max(top * (dx + dz), L.stairEnd * (dx + dz));
    const ramp = { axis: (dx ? 'x' : 'z') as 'x' | 'z', at0: (dx ? cx : cz) + top * (dx + dz), at1: (dx ? cx : cz) + L.stairEnd * (dx + dz), y1: y0 };
    pads.push(
      dx
        ? { minX: cx + lo, maxX: cx + hi, minZ: cz - hw, maxZ: cz + hw, y: y0 + L.height, ramp }
        : { minX: cx - hw, maxX: cx + hw, minZ: cz + lo, maxZ: cz + hi, y: y0 + L.height, ramp },
    );
  }
  for (let i = L.radii.length - 1; i >= 0; i--) {
    const r = L.radii[i];
    pads.push({ minX: cx - r, maxX: cx + r, minZ: cz - r, maxZ: cz + r, y: y0 + (i + 1) * tp.dais.tierHeight, round: true });
  }
  return pads;
}

/** Khoảng cách giữa hai trụ lan can (m) — nhỏ hơn đường kính nhân vật (1 m) để không lách qua. */
const POST_STEP = 0.8;

/**
 * Chân trụ lan can quanh mép mỗi tầng (toạ độ quanh tâm, kèm số tầng), chừa khe lối bậc rộng `stairWidth + 0,4`.
 * Dùng chung cho hình (trụ + thanh) và vật cản.
 */
export function railPosts(tp: Pick<TeleportSpec, 'ringRadius'> & { dais: DaisSpec }): { x: number; z: number; tier: number }[] {
  const L = daisLayout(tp);
  const out: { x: number; z: number; tier: number }[] = [];
  const gap = tp.dais.stairWidth / 2 + 0.2;
  L.radii.forEach((r0, tier) => {
    const r = r0 - 0.15;
    const half = Math.asin(Math.min(1, gap / r)); // nửa góc khe ở mỗi hướng chính
    for (let q = 0; q < 4; q++) {
      const a0 = (q * Math.PI) / 2 + half;
      const a1 = ((q + 1) * Math.PI) / 2 - half;
      const n = Math.max(1, Math.ceil(((a1 - a0) * r) / POST_STEP));
      for (let i = 0; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n;
        out.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, tier });
      }
    }
  });
  return out;
}

/** Trụ phù văn: trên tầng dưới cùng (giữa mép tầng và mép tầng trên), xen giữa lối bậc (lệch nửa khoảng chia). */
export function pillarSpots(tp: Pick<TeleportSpec, 'ringRadius'> & { dais: DaisSpec }): { x: number; z: number; y: number }[] {
  const L = daisLayout(tp);
  const n = tp.dais.pillars;
  if (L.radii.length < 2 || n <= 0) return [];
  const r = (L.radii[0] + L.radii[1]) / 2;
  return Array.from({ length: n }, (_, i) => {
    const a = ((i + 0.5) * Math.PI * 2) / n;
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, y: tp.dais.tierHeight };
  });
}
