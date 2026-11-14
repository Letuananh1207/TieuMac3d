/**
 * Cổng đi bộ sang cảnh (R-HANH-4), suy từ đặc tả. Thuần (không three, không DOM): dùng chung cho kiểm đặc tả
 * (`specCheck.ts`, `scripts/check-scene.mjs`) và `main.ts` (chỗ đứng khi tới qua cổng: `?qua=<cảnh vừa rời>`).
 */
import type { PortalSpec, SceneSpec, XZ } from './spec';
import { ringTrigger } from './teleportLayout';

/** Chỗ đứng phải cách mép vùng chạm ít nhất bấy nhiêu mét (vừa tới không chạm lại ngay). */
const ARRIVE_GAP = 1;

/** Vùng chạm đã chuẩn hoá (min ≤ max). */
export function portalRect(p: Pick<PortalSpec, 'area'>): { minX: number; maxX: number; minZ: number; maxZ: number } {
  const { from, to } = p.area;
  return { minX: Math.min(from[0], to[0]), maxX: Math.max(from[0], to[0]), minZ: Math.min(from[1], to[1]), maxZ: Math.max(from[1], to[1]) };
}

/** Khoảng cách từ (x, z) tới vùng chạm (0 = trong vùng). */
function gapTo(p: Pick<PortalSpec, 'area'>, x: number, z: number): number {
  const r = portalRect(p);
  const dx = Math.max(r.minX - x, 0, x - r.maxX);
  const dz = Math.max(r.minZ - z, 0, z - r.maxZ);
  return Math.hypot(dx, dz);
}

/** Lỗi cổng trong một cảnh: vùng rỗng, chỗ đứng trong / sát vùng, trùng cảnh đích, chồng vòng trận. */
export function checkPortals(s: Pick<SceneSpec, 'portals' | 'teleport'>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  s.portals.forEach((p, i) => {
    const name = `portals[${i}] (→ ${p.scene || '?'})`;
    if (!p.scene) out.push(`${name}: thiếu cảnh đích (scene)`);
    else if (seen.has(p.scene)) out.push(`${name}: trùng cảnh đích — mỗi cảnh tối đa một cổng tới "${p.scene}"`);
    seen.add(p.scene);
    const r = portalRect(p);
    if (r.maxX - r.minX < 0.5 || r.maxZ - r.minZ < 0.5) out.push(`${name}: vùng chạm hẹp dưới 0,5 m — nới area`);
    const gap = gapTo(p, ...p.arrive.at);
    if (gap < ARRIVE_GAP) out.push(`${name}: chỗ đứng (arrive) cách vùng chạm ${gap.toFixed(1)} m — dời ra ngoài (≥ ${ARRIVE_GAP} m)`);
    const tp = s.teleport;
    if (tp.enabled && gapTo(p, ...tp.center) < ringTrigger(tp)) out.push(`${name}: vùng chạm chồng lên vòng trận — dời cổng hoặc vòng`);
  });
  return out;
}

/**
 * Chỗ đứng + hướng (radian, 0 = nhìn +z) khi tới cảnh này qua cổng từ cảnh `from` (`?qua=`): `arrive` của cổng dẫn
 * về `from`. Không có cổng như thế (hoặc không có `?qua`) → `undefined` (đứng ở chỗ xuất phát `player.start`).
 */
export function arrivalFor(portals: readonly PortalSpec[], from: string | null): { at: XZ; rotY: number } | undefined {
  const p = from ? portals.find((q) => q.scene === from) : undefined;
  return p ? { at: [p.arrive.at[0], p.arrive.at[1]], rotY: (p.arrive.rotY * Math.PI) / 180 } : undefined;
}
