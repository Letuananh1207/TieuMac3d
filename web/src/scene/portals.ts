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

/** Tâm vùng chạm (cũng là tâm vòng sáng). */
export function portalCenter(p: Pick<PortalSpec, 'area'>): { x: number; z: number } {
  const r = portalRect(p);
  return { x: (r.minX + r.maxX) / 2, z: (r.minZ + r.maxZ) / 2 };
}

/**
 * (x, z) có trong vùng của cổng không: cổng có `ring` (vòng sáng nhỏ trước cửa nhà — V-96) → trong vòng tròn bán kính `ring`
 * quanh tâm `area`; không có → trong ô `area` (như cũ). Thuần.
 */
export function portalContains(p: Pick<PortalSpec, 'area' | 'ring'>, x: number, z: number): boolean {
  if (p.ring) {
    const c = portalCenter(p);
    return Math.hypot(x - c.x, z - c.z) <= p.ring;
  }
  const r = portalRect(p);
  return x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ;
}

/** Khoảng cách từ (x, z) tới vùng của cổng (vòng nếu có `ring`, không thì ô `area`; 0 = trong vùng). */
function triggerGap(p: Pick<PortalSpec, 'area' | 'ring'>, x: number, z: number): number {
  if (!p.ring) return gapTo(p, x, z);
  const c = portalCenter(p);
  return Math.max(0, Math.hypot(x - c.x, z - c.z) - p.ring);
}

/** Hai cổng trong một cảnh phải cách nhau ít nhất bấy nhiêu mét (mép vùng chạm / chỗ đứng) — không trùng, không lỡ chân. */
const PORTAL_GAP = 3;

/**
 * Lỗi cổng trong một cảnh: cổng bấm nút thiếu nhãn, vùng rỗng, chỗ đứng trong / sát vùng, chỗ đứng quay mặt vào vòng (phải quay vào trong cảnh,
 * lưng về vòng — R-HANH-4), trùng cảnh đích, chồng vòng trận, hai cổng sát nhau.
 */
export function checkPortals(s: Pick<SceneSpec, 'portals' | 'teleport'>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  s.portals.forEach((p, i) => {
    const name = `portals[${i}] (→ ${p.scene || '?'})`;
    if (!p.scene) out.push(`${name}: thiếu cảnh đích (scene)`);
    else if (seen.has(p.scene)) out.push(`${name}: trùng cảnh đích — mỗi cảnh tối đa một cổng tới "${p.scene}"`);
    seen.add(p.scene);
    // cổng bấm nút (V-71): nhãn là chữ trên nút nổi — bắt buộc
    if (p.via === 'nut' && !p.label) out.push(`${name}: cổng "nut" cần label (chữ trên nút nổi)`);
    const r = portalRect(p);
    if (r.maxX - r.minX < 0.5 || r.maxZ - r.minZ < 0.5) out.push(`${name}: vùng chạm hẹp dưới 0,5 m — nới area`);
    if (p.ring !== undefined && p.ring > Math.min(r.maxX - r.minX, r.maxZ - r.minZ) / 2 + 1e-6) out.push(`${name}: vòng (ring ${p.ring} m) rộng hơn vùng area — nới area`);
    const [ax, az] = p.arrive.at;
    const gap = triggerGap(p, ax, az);
    // cổng bấm nút không tự sang: chỗ đứng chỉ cần ngoài vùng (vừa tới không hiện nút ngay); cổng đi bộ cách ≥ 1 m
    const minGap = p.via === 'nut' ? 0 : ARRIVE_GAP;
    if (p.via === 'nut' ? gap <= 0 : gap < minGap)
      out.push(`${name}: chỗ đứng (arrive) cách vùng ${gap.toFixed(1)} m — dời ra ngoài${minGap ? ` (≥ ${minGap} m)` : ''}`);
    // hướng nhìn (rotY 0 = +z) phải ra xa tâm vòng: vừa tới thấy cảnh, không thấy ngay vòng vừa bước ra
    const a = (p.arrive.rotY * Math.PI) / 180;
    const away = Math.sin(a) * (ax - (r.minX + r.maxX) / 2) + Math.cos(a) * (az - (r.minZ + r.maxZ) / 2);
    if (gap >= minGap && gap > 0 && away <= 0) out.push(`${name}: chỗ đứng nhìn về phía vòng (arrive.rotY ${p.arrive.rotY}°) — quay vào trong cảnh`);
    const tp = s.teleport;
    if (tp.enabled && gapTo(p, ...tp.center) < ringTrigger(tp)) out.push(`${name}: vùng chạm chồng lên vòng trận — dời cổng hoặc vòng`);
    s.portals.forEach((q, j) => {
      if (j === i) return;
      if (j > i && rectGap(p, q) < PORTAL_GAP) out.push(`${name}: vùng chạm sát cổng portals[${j}] (→ ${q.scene}) dưới ${PORTAL_GAP} m — tách xa`);
      if (gapTo(p, ...q.arrive.at) < PORTAL_GAP) out.push(`${name}: chỗ đứng của cổng portals[${j}] (→ ${q.scene}) sát vùng chạm này — vừa tới đã lỡ chân sang`);
    });
  });
  return out;
}

/** Khoảng cách giữa hai vùng chạm (0 = chồng nhau). */
function rectGap(p: Pick<PortalSpec, 'area'>, q: Pick<PortalSpec, 'area'>): number {
  const a = portalRect(p);
  const b = portalRect(q);
  return Math.hypot(Math.max(b.minX - a.maxX, 0, a.minX - b.maxX), Math.max(b.minZ - a.maxZ, 0, a.minZ - b.maxZ));
}

/**
 * Chỗ đứng + hướng (radian, 0 = nhìn +z) khi tới cảnh này qua cổng từ cảnh `from` (`?qua=`): `arrive` của cổng dẫn
 * về `from`. Không có cổng như thế (hoặc không có `?qua`) → `undefined` (đứng ở chỗ xuất phát `player.start`).
 */
export function arrivalFor(portals: readonly PortalSpec[], from: string | null): { at: XZ; rotY: number } | undefined {
  const p = from ? portals.find((q) => q.scene === from) : undefined;
  return p ? { at: [p.arrive.at[0], p.arrive.at[1]], rotY: (p.arrive.rotY * Math.PI) / 180 } : undefined;
}

/** Cổng bấm nút (`via: "nut"`, V-71) mà (x, z) đang đứng trong vùng (trong vòng nếu có `ring` — V-96) — nút nổi hiện khi có. Thuần. */
export function buttonPortalAt<T extends Pick<PortalSpec, 'area' | 'via' | 'ring'>>(portals: readonly T[], x: number, z: number): T | undefined {
  return portals.find((p) => p.via === 'nut' && portalContains(p, x, z));
}
