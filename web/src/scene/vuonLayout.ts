/**
 * Bố cục vườn rau (R-VUON-1): đoạn rào tre (chừa khe cổng cạnh tây), chân luống + thùng thu mua (kiểm đất phẳng), kiểm
 * đặc tả `garden`. Thuần dữ liệu — không three, không DOM (dựng: `vuonLuong.ts`; gọi kiểm từ `specCheck.ts`).
 */
import type { GardenSpec, SceneSpec, XZ } from './spec';

/** 12 mã luống theo thứ tự mở (luật `zones/vuon.ts`). */
export const GARDEN_PLOT_IDS: readonly string[] = Array.from({ length: 12 }, (_, i) => `o-${i + 1}`);

/** Chân thùng thu mua (m, trước khi xoay). */
export const BIN_SIZE = { w: 1.2, d: 0.8, h: 0.75 };

export interface FenceSeg {
  from: XZ;
  to: XZ;
}

/** Khung rào chuẩn hoá: x0 < x1, z0 < z1. */
export function fenceBox(g: GardenSpec): { x0: number; x1: number; z0: number; z1: number } {
  const [a, b] = [g.fence.from, g.fence.to];
  return { x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]), z0: Math.min(a[1], b[1]), z1: Math.max(a[1], b[1]) };
}

/** Bốn cạnh rào; cạnh tây tách đôi chừa khe cổng (tâm `gate`, rộng `gateWidth`). Vườn không rào (`layout: 'mo'`) → rỗng. */
export function fenceSegments(g: GardenSpec): FenceSeg[] {
  if (g.layout === 'mo') return [];
  const { x0, x1, z0, z1 } = fenceBox(g);
  const ga = g.fence.gate - g.fence.gateWidth / 2;
  const gb = g.fence.gate + g.fence.gateWidth / 2;
  const segs: FenceSeg[] = [
    { from: [x0, z0], to: [x1, z0] },
    { from: [x1, z0], to: [x1, z1] },
    { from: [x1, z1], to: [x0, z1] },
  ];
  if (ga > z0) segs.push({ from: [x0, z0], to: [x0, ga] });
  if (gb < z1) segs.push({ from: [x0, gb], to: [x0, z1] });
  return segs;
}

/** Khung trục x0 < x1, z0 < z1. */
export interface Box2 {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

/**
 * Vùng "trong vườn" (R-VUON-2): vườn có rào → trong rào; vườn không rào (V-82) → khung bao các luống nới thêm `leave` m. Trong vùng
 * chạm luống mở vòng ngay; ra ngoài → đóng vòng.
 */
export function gardenZone(g: GardenSpec): Box2 {
  if (g.layout !== 'mo') return fenceBox(g);
  const m = g.size / 2 + g.leave;
  const xs = g.plots.map((p) => p.x);
  const zs = g.plots.map((p) => p.z);
  return { x0: Math.min(...xs) - m, x1: Math.max(...xs) + m, z0: Math.min(...zs) - m, z1: Math.max(...zs) + m };
}

/** Điểm (x; z) nằm trong khung [b]. */
export function inBox(b: Box2, x: number, z: number): boolean {
  return x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1;
}

/** Chạm luống thì làm gì (R-VUON-2): mở vòng ngay · tự đi tới rồi mở · không (đi như thường). */
export type TapPlan = 'mo-ngay' | 'di-toi' | 'khong';

/**
 * Chạm luống [plot] khi nhân vật ở [pos]: trong vườn → mở ngay; vườn không rào (V-82) mà luống cách ≤ `reach` m → tự đi tới rồi mở;
 * còn lại → không.
 */
export function tapPlan(g: GardenSpec, pos: { x: number; z: number }, plot: { x: number; z: number }): TapPlan {
  if (inBox(gardenZone(g), pos.x, pos.z)) return 'mo-ngay';
  if (g.layout === 'mo' && Math.hypot(plot.x - pos.x, plot.z - pos.z) <= g.reach) return 'di-toi';
  return 'khong';
}

/** Chân luống + thùng (kiểm đất phẳng ở `specCheck.ts`); vườn tắt → rỗng. */
export function gardenFootprints(g: GardenSpec): { what: string; x: number; z: number; w: number; d: number }[] {
  if (!g.enabled) return [];
  const turned = Math.abs(g.bin.rotY) % 180 === 90;
  return [
    ...g.plots.map((p) => ({ what: `garden.plots "${p.id}"`, x: p.x, z: p.z, w: g.size, d: g.size })),
    { what: 'garden.bin', x: g.bin.x, z: g.bin.z, w: turned ? BIN_SIZE.d : BIN_SIZE.w, d: turned ? BIN_SIZE.w : BIN_SIZE.d },
  ];
}

/** Lỗi đặc tả vườn (rỗng = đúng). Chỉ báo, không sửa. */
export function checkGarden(s: SceneSpec): string[] {
  const g = s.garden;
  if (!g.enabled) return [];
  const out: string[] = [];
  const ids = g.plots.map((p) => p.id);
  if (ids.length !== GARDEN_PLOT_IDS.length || GARDEN_PLOT_IDS.some((id) => ids.filter((x) => x === id).length !== 1)) {
    out.push(`garden.plots: cần đủ 12 luống mã ${GARDEN_PLOT_IDS[0]} … ${GARDEN_PLOT_IDS[11]}, mỗi mã một lần (đang: ${ids.join(', ')})`);
  }
  if (!(g.size >= 0.8 && g.size <= 3)) out.push(`garden.size: 0,8 … 3 m (đang ${g.size})`);
  if (!(g.height > 0 && g.height <= 0.35)) out.push(`garden.height: 0 … 0,35 m — luống thấp, không chặn người (đang ${g.height})`);
  if (!(g.cropScale > 0 && g.cropScale <= 4)) out.push(`garden.cropScale: 0 … 4`);
  if (g.layout !== 'rao' && g.layout !== 'mo') out.push(`garden.layout: chỉ rao · mo (đang ${String(g.layout)})`);
  if (g.layout === 'mo') return [...out, ...checkOpenGarden(g, s)];
  if (!(g.fence.height > 0 && g.fence.height <= 1)) out.push(`garden.fence.height: 0 … 1 m (rào thấp)`);
  const f = fenceBox(g);
  if (f.x1 - f.x0 < 2 || f.z1 - f.z0 < 2) out.push('garden.fence: khung rào quá nhỏ (cạnh ≥ 2 m)');
  if (g.fence.gate - g.fence.gateWidth / 2 < f.z0 || g.fence.gate + g.fence.gateWidth / 2 > f.z1) out.push('garden.fence.gate: khe cổng vượt cạnh tây');
  if (!(g.fence.gateWidth >= 1.2)) out.push('garden.fence.gateWidth: ≥ 1,2 m (nhân vật đi qua)');
  const half = g.size / 2;
  g.plots.forEach((p, i) => {
    if (p.x - half < f.x0 + 0.3 || p.x + half > f.x1 - 0.3 || p.z - half < f.z0 + 0.3 || p.z + half > f.z1 - 0.3) {
      out.push(`garden.plots "${p.id}": luống phải nằm trong rào, cách rào ≥ 0,3 m`);
    }
    for (const q of g.plots.slice(i + 1)) {
      if (Math.abs(p.x - q.x) < g.size + 0.4 && Math.abs(p.z - q.z) < g.size + 0.4) out.push(`garden.plots "${p.id}" và "${q.id}": chồng nhau — chừa lối ≥ 0,4 m`);
    }
  });
  const b = g.bin;
  if (b.x > f.x0 - 0.6 && b.x < f.x1 + 0.6 && b.z > f.z0 - 0.6 && b.z < f.z1 + 0.6) out.push('garden.bin: thùng thu mua đặt ngoài rào (cách ≥ 0,6 m)');
  const inFence = (x: number, z: number, m: number): boolean => x > f.x0 - m && x < f.x1 + m && z > f.z0 - m && z < f.z1 + m;
  const [px, pz] = s.player.start;
  if (inFence(px, pz, 0.5)) out.push('garden: điểm xuất phát (player.start) nằm trong rào vườn');
  for (const bd of s.buildings) {
    if (Math.abs(bd.x - (f.x0 + f.x1) / 2) < (bd.w + f.x1 - f.x0) / 2 && Math.abs(bd.z - (f.z0 + f.z1) / 2) < (bd.d + f.z1 - f.z0) / 2) {
      out.push(`garden: rào vườn đè nhà "${bd.id}"`);
    }
  }
  return out;
}

const box2 = (a: XZ, b: XZ): Box2 => ({ x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]), z0: Math.min(a[1], b[1]), z1: Math.max(a[1], b[1]) });
const overlap = (a: Box2, b: Box2, m = 0): boolean => a.x0 < b.x1 + m && b.x0 < a.x1 + m && a.z0 < b.z1 + m && b.z0 < a.z1 + m;

/** Khung viền vườn không rào (đặc tả `garden.border`). */
export function borderBoxes(g: GardenSpec): Box2[] {
  return g.layout === 'mo' ? g.border.map((b) => box2(b.from, b.to)) : [];
}

/** Kiểm vườn không rào (V-82): luống trong một khung viền (cách viền ≥ 0,3 m), lối giữa luống ≥ 1 m, thùng ngoài viền, không đè nhà / chỗ xuất phát. */
function checkOpenGarden(g: GardenSpec, s: SceneSpec): string[] {
  const out: string[] = [];
  if (!(g.reach >= 2 && g.reach <= 40)) out.push(`garden.reach: 2 … 40 m (đang ${g.reach})`);
  if (!(g.leave >= 0.5 && g.leave <= 10)) out.push(`garden.leave: 0,5 … 10 m (đang ${g.leave})`);
  const boxes = borderBoxes(g);
  if (!boxes.length) out.push('garden.border: vườn không rào cần ≥ 1 khung viền');
  const half = g.size / 2;
  const plotBox = (p: { x: number; z: number }): Box2 => ({ x0: p.x - half, x1: p.x + half, z0: p.z - half, z1: p.z + half });
  g.plots.forEach((p, i) => {
    const pb = plotBox(p);
    if (!boxes.some((b) => pb.x0 >= b.x0 + 0.3 && pb.x1 <= b.x1 - 0.3 && pb.z0 >= b.z0 + 0.3 && pb.z1 <= b.z1 - 0.3)) {
      out.push(`garden.plots "${p.id}": luống phải nằm trong một khung viền (garden.border), cách viền ≥ 0,3 m`);
    }
    for (const q of g.plots.slice(i + 1)) {
      if (overlap(pb, plotBox(q), 1 - 1e-6)) out.push(`garden.plots "${p.id}" và "${q.id}": lối giữa hai luống < 1 m`);
    }
  });
  const turned = Math.abs(g.bin.rotY) % 180 === 90;
  const [bw, bd] = turned ? [BIN_SIZE.d, BIN_SIZE.w] : [BIN_SIZE.w, BIN_SIZE.d];
  const bin: Box2 = { x0: g.bin.x - bw / 2, x1: g.bin.x + bw / 2, z0: g.bin.z - bd / 2, z1: g.bin.z + bd / 2 };
  if (boxes.some((b) => overlap(bin, b, 0.3))) out.push('garden.bin: thùng thu mua đặt ngoài khung viền vườn (cách ≥ 0,3 m)');
  const [px, pz] = s.player.start;
  if (boxes.some((b) => inBox(b, px, pz))) out.push('garden: điểm xuất phát (player.start) nằm trong khung viền vườn');
  for (const h of s.buildings) {
    const hb: Box2 = { x0: h.x - h.w / 2, x1: h.x + h.w / 2, z0: h.z - h.d / 2, z1: h.z + h.d / 2 };
    if (boxes.some((b) => overlap(hb, b))) out.push(`garden: khung viền vườn đè nhà "${h.id}"`);
  }
  return out;
}
