/**
 * Vùng đặt đồ trang trí tự do của một cảnh (R-NHA-7 — V-69): đọc + kiểm `decorArea` của đặc tả, sinh vùng cấm từ phần còn lại của
 * cảnh (cổng, chỗ tới, chỗ xuất phát, bãi hạc, luống, thùng thu mua, khe cổng vườn) và các đích phải còn đường đi; dựng dữ liệu vùng
 * (cùng dạng `PlaceArea` ở `zones/decorPlace.ts` — hai lớp không import nhau, ghép ở lớp gốc). Thuần dữ liệu.
 */
import type { Box, Circle } from '../collision/colliders';
import { pointInPolygon, type Rect, type XZ } from '../collision/footprint';
import { DECOR_WHERES, type DecorAreaSpec, type SceneSpec } from './spec';
import { BIN_SIZE, fenceBox } from './vuonLayout';

/** Vùng cấm: chữ nhật / tròn + lý do (chữ `decorReason*`). */
export interface AreaKeepOut {
  label: string;
  rect?: Rect;
  circle?: Circle;
}

/** Dữ liệu vùng đặt của cảnh — đúng dạng `PlaceArea` (zones/decorPlace.ts). */
export interface DecorAreaData {
  scene: string;
  where: (typeof DECOR_WHERES)[number];
  bounds: readonly XZ[];
  keepOut: readonly AreaKeepOut[];
  maxItems: number;
  maxSlope: number;
  boxes: readonly Box[];
  circles: readonly Circle[];
  start: XZ;
  goals: readonly { at: XZ; r: number }[];
  heightAt?: (x: number, z: number) => number;
}

/** Lý do vùng cấm tự sinh (`decorReason*` — design/l10n/vi.arb). */
const PATH = 'Lối đi';
const DOOR = 'Cửa nhà';
const BED = 'Luống rau';
const CRATE = 'Thùng thu mua';

/** Hộp trục từ hai góc (+ nới [pad] m). */
function boxFrom(a: XZ, b: XZ, pad = 0): Rect {
  return { x: (a[0] + b[0]) / 2, z: (a[1] + b[1]) / 2, w: Math.abs(b[0] - a[0]) + pad * 2, d: Math.abs(b[1] - a[1]) + pad * 2, rot: 0 };
}

/** Vùng cấm tự sinh từ đặc tả (R-NHA-7). */
export function autoKeepOut(s: SceneSpec): AreaKeepOut[] {
  const out: AreaKeepOut[] = [];
  for (const p of s.portals) {
    // cổng nút (cửa nhà, thảm cửa phòng) / cổng không vòng sáng là cửa; cổng có vòng sáng là lối đi (Bến mây)
    out.push({ label: p.marker === false || p.via === 'nut' ? DOOR : PATH, rect: boxFrom(p.area.from, p.area.to, 1) });
    out.push({ label: PATH, circle: { x: p.arrive.at[0], z: p.arrive.at[1], r: 1.5 } });
  }
  const [sx, sz] = s.player.start;
  out.push({ label: PATH, circle: { x: sx, z: sz, r: 1.5 } });
  if (s.decorArea?.where === 'ngoai') out.push({ label: PATH, circle: { x: sx + s.crane.padOffset, z: sz, r: 1.5 } }); // bãi hạc (R-NHA-1)
  const g = s.garden;
  if (g.enabled) {
    for (const p of g.plots) out.push({ label: BED, rect: { x: p.x, z: p.z, w: g.size + 0.6, d: g.size + 0.6, rot: 0 } });
    const turned = Math.abs(g.bin.rotY) % 180 === 90;
    const [bw, bd] = turned ? [BIN_SIZE.d, BIN_SIZE.w] : [BIN_SIZE.w, BIN_SIZE.d];
    out.push({ label: CRATE, rect: { x: g.bin.x, z: g.bin.z, w: bw + 2, d: bd + 2, rot: 0 } });
    // khe cổng vườn (cạnh tây): hành lang 2 m trong + 2 m ngoài rào
    const f = fenceBox(g);
    out.push({ label: PATH, rect: { x: f.x0, z: g.fence.gate, w: 4, d: g.fence.gateWidth, rot: 0 } });
  }
  return out;
}

/** Đích phải còn đường đi (R-NHA-7): mọi cổng (vòng sáng Bến mây, ô cửa nhà / thảm cửa), cổng vườn, thùng thu mua. */
export function pathGoals(s: SceneSpec): { at: XZ; r: number }[] {
  const out: { at: XZ; r: number }[] = s.portals.map((p) => ({ at: [(p.area.from[0] + p.area.to[0]) / 2, (p.area.from[1] + p.area.to[1]) / 2] as XZ, r: 1.2 }));
  const g = s.garden;
  if (g.enabled) {
    const f = fenceBox(g);
    out.push({ at: [f.x0 - 1, g.fence.gate], r: 1 }, { at: [g.bin.x, g.bin.z], r: 1.6 });
  }
  return out;
}

/**
 * Dữ liệu vùng đặt của cảnh [scene] ([s] có `decorArea`); [boxes] / [circles] = vật cản tĩnh (không gồm món trang trí); [heightAt] =
 * độ cao nền. Cảnh không trang trí được → `null`.
 */
export function buildDecorArea(scene: string, s: SceneSpec, boxes: readonly Box[], circles: readonly Circle[], heightAt?: (x: number, z: number) => number): DecorAreaData | null {
  const a = s.decorArea;
  if (!a) return null;
  return {
    scene,
    where: a.where,
    bounds: a.bounds,
    keepOut: [...a.keepOut.map((k) => ({ label: k.label, rect: boxFrom(k.from, k.to) })), ...autoKeepOut(s)],
    maxItems: a.maxItems,
    maxSlope: a.maxSlope,
    boxes,
    circles,
    start: s.player.start,
    goals: pathGoals(s),
    heightAt,
  };
}

const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const xz = (v: unknown): v is XZ => Array.isArray(v) && v.length === 2 && num(v[0]) && num(v[1]);

/** Đọc `decorArea` của file đặc tả (khuôn mặc định `null` — `specCheck.ts` gọi); sai → báo + `null` (cảnh không trang trí được). */
export function parseDecorArea(raw: unknown, path: string, out: string[]): DecorAreaSpec | null {
  if (raw === null) return null;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    out.push(`${path}: cần một object hoặc null`);
    return null;
  }
  const o = raw as Record<string, unknown>;
  const local: string[] = [];
  for (const k of Object.keys(o)) if (!['where', 'bounds', 'keepOut', 'maxItems', 'maxSlope'].includes(k)) out.push(`${path}.${k}: trường lạ, bỏ qua`);
  if (!DECOR_WHERES.includes(o.where as (typeof DECOR_WHERES)[number])) local.push(`${path}.where: chỉ ${DECOR_WHERES.join(' · ')}`);
  if (!Array.isArray(o.bounds) || o.bounds.length < 3 || !o.bounds.every(xz)) local.push(`${path}.bounds: cần ≥ 3 điểm [x, z]`);
  const keep = o.keepOut === undefined ? [] : o.keepOut;
  if (!Array.isArray(keep) || !keep.every((k) => k && typeof k === 'object' && xz((k as Record<string, unknown>).from) && xz((k as Record<string, unknown>).to) && typeof (k as Record<string, unknown>).label === 'string')) {
    local.push(`${path}.keepOut: mỗi phần tử cần from, to [x, z] + label`);
  }
  if (!num(o.maxItems) || o.maxItems < 1 || o.maxItems > 40 || !Number.isInteger(o.maxItems)) local.push(`${path}.maxItems: số nguyên 1 … 40`);
  if (!num(o.maxSlope) || o.maxSlope < 0 || o.maxSlope > 1) local.push(`${path}.maxSlope: 0 … 1 m`);
  if (local.length) {
    out.push(...local, `${path}: bỏ — cảnh không trang trí được`);
    return null;
  }
  return {
    where: o.where as DecorAreaSpec['where'],
    bounds: (o.bounds as XZ[]).map((p) => [p[0], p[1]]),
    keepOut: (keep as { from: XZ; to: XZ; label: string }[]).map((k) => ({ from: [k.from[0], k.from[1]], to: [k.to[0], k.to[1]], label: k.label })),
    maxItems: o.maxItems as number,
    maxSlope: o.maxSlope as number,
  };
}

/** Kiểm vùng đặt với phần còn lại của cảnh (rỗng = đúng): chỗ xuất phát + chỗ tới các cổng nằm trong vùng đi lại được. */
export function checkDecorArea(s: SceneSpec): string[] {
  const a = s.decorArea;
  if (!a) return [];
  const out: string[] = [];
  const [sx, sz] = s.player.start;
  if (!pointInPolygon(a.bounds, sx, sz)) out.push(`decorArea.bounds: chỗ xuất phát (${sx}; ${sz}) nằm ngoài vùng — kiểm còn đường đi không chạy`);
  for (const k of a.keepOut) if (![...k.label].length || [...k.label].length > 16) out.push(`decorArea.keepOut "${k.label}": nhãn 1 … 16 ký tự (viên lý do đỏ)`);
  return out;
}
