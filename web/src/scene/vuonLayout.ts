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

/** Bốn cạnh rào; cạnh tây tách đôi chừa khe cổng (tâm `gate`, rộng `gateWidth`). */
export function fenceSegments(g: GardenSpec): FenceSeg[] {
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
  if (!(g.fence.height > 0 && g.fence.height <= 1)) out.push(`garden.fence.height: 0 … 1 m (rào thấp)`);
  if (!(g.cropScale > 0 && g.cropScale <= 4)) out.push(`garden.cropScale: 0 … 4`);
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
