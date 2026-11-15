/**
 * Ranh đi được của vùng (`bounds`, V-66 — hồ sơ docs/tham_khao/lam-lai-vung.md, nguyên tắc 5 "mép mềm"): bốn hộp va chạm
 * vô hình dày [BOUNDS_THICK] m nằm ngay ngoài hình chữ nhật đi được, đặt ở chân dải mép (tường trúc, đồi, sông) — mắt thấy
 * thế đất thật, chân chạm ranh. Thuần (không three) để `scene:check` và test dùng thẳng.
 */
import type { Colliders } from '../collision/colliders';
import type { SceneSpec, XZ } from './spec';

/** Bề dày mỗi hộp ranh (m) — dày hơn một bước đi một khung hình ở mọi tốc độ. */
export const BOUNDS_THICK = 2;

type Bounds = SceneSpec['bounds'];

/** Hình chữ nhật ranh đã xếp min / max. */
export function boundsRect(b: Bounds): { minX: number; maxX: number; minZ: number; maxZ: number } {
  return {
    minX: Math.min(b.from[0], b.to[0]),
    maxX: Math.max(b.from[0], b.to[0]),
    minZ: Math.min(b.from[1], b.to[1]),
    maxZ: Math.max(b.from[1], b.to[1]),
  };
}

/** Bốn hộp (tâm x, z, rộng, sâu) bao ngoài ranh; các góc chồng nhau để không hở. */
export function boundsBoxes(b: Bounds): [number, number, number, number][] {
  if (!b.enabled) return [];
  const r = boundsRect(b);
  const t = BOUNDS_THICK;
  const w = r.maxX - r.minX + 2 * t;
  const d = r.maxZ - r.minZ + 2 * t;
  const cx = (r.minX + r.maxX) / 2;
  const cz = (r.minZ + r.maxZ) / 2;
  return [
    [cx, r.minZ - t / 2, w, t],
    [cx, r.maxZ + t / 2, w, t],
    [r.minX - t / 2, cz, t, d],
    [r.maxX + t / 2, cz, t, d],
  ];
}

/** Đăng ký ranh vào va chạm (thấp — không che tầm nhìn camera). */
export function addBounds(colliders: Colliders, b: Bounds): void {
  for (const [x, z, w, d] of boundsBoxes(b)) colliders.add(x, z, w, d);
}

const inside = (b: Bounds, [x, z]: XZ, pad = 0): boolean => {
  const r = boundsRect(b);
  return x >= r.minX + pad && x <= r.maxX - pad && z >= r.minZ + pad && z <= r.maxZ - pad;
};

/** Lỗi ranh cho `scene:check`: ranh quá nhỏ; chỗ xuất phát, cổng đi bộ (vùng chạm + chỗ đứng khi tới) phải nằm trong. */
export function checkBounds(s: SceneSpec): string[] {
  const b = s.bounds;
  if (!b.enabled) return [];
  const out: string[] = [];
  const r = boundsRect(b);
  if (r.maxX - r.minX < 10 || r.maxZ - r.minZ < 10) out.push('bounds: ranh phải rộng ≥ 10 m mỗi cạnh');
  if (!inside(b, s.player.start, 0.5)) out.push(`bounds: chỗ xuất phát (${s.player.start.join('; ')}) phải nằm trong ranh, cách mép ≥ 0,5 m`);
  s.portals.forEach((p, i) => {
    for (const pt of [p.area.from, p.area.to, p.arrive.at]) {
      if (!inside(b, pt, 0.3)) out.push(`portals[${i}] (${p.scene}): điểm (${pt.join('; ')}) ngoài ranh đi được — dời vào trong (cách mép ≥ 0,3 m)`);
    }
  });
  return out;
}
