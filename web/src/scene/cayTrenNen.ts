import { seededRandom } from './random';
import type { GroveSpec, SceneSpec, XZ } from './spec';

/**
 * Cây không mọc trên nền lát (R-VA-6, V-63). Vòng thân va chạm của cây lẻ / cụm cây:
 * - không chạm **lối đi**: lối lát, bậc đá, mặt cầu, nền nhà, lòng cổng, đài truyền tống — kể cả có bồn;
 * - không chạm **sân lát** (bục `pave`, nền khu `floors`) trừ khi cây có bồn cây (`planter: true`).
 * Không kéo `three` — `scene:check` (qua `specCheck.ts`) và test dùng thẳng.
 */

/** Cây đã đặt (cây lẻ / cụm cây / vòng cây), trước khi dựng hình. */
export interface Placed {
  x: number;
  z: number;
  scale: number;
  collide: boolean;
  /** độ cao gốc cây (địa hình); thiếu = 0 */
  y?: number;
  /** có bồn cây quanh gốc */
  planter?: boolean;
}

/** Cạnh hộp va chạm thân cây (m) theo kiểu, nhân `scale`. */
export const TRUNK_SIZE = { tan: 0.8, truc: 1.2, tung: 0.9, lieu: 0.8, mai: 0.5, 'truc-mao': 1.1, dao: 0.6, bui: 0.9 } as const;
export type TreeKind = keyof typeof TRUNK_SIZE;

/** Cụm cây rải trong hình chữ nhật. Mỗi cụm một dãy ngẫu nhiên riêng: thêm cụm không xê dịch cây có sẵn. */
export function groveTrees(g: GroveSpec, seed: number, index: number): Placed[] {
  const rand = seededRandom(seed * 7919 + index + 1);
  return Array.from({ length: g.count }, () => ({
    x: g.x + (rand() - 0.5) * g.w,
    z: g.z + (rand() - 0.5) * g.d,
    scale: (0.8 + rand() * 0.5) * (g.scale ?? 1),
    collide: g.collide ?? true,
    planter: g.planter,
  }));
}

/** Một cây có gốc trên nền lát. */
export interface TreeOnPaving {
  /** `trees.yard[3]` · `trees.groves[1] cây 4` */
  tree: string;
  kind: TreeKind;
  x: number;
  z: number;
  /** nền nào, vd. `paths[2]` */
  on: string;
  /** `true` = sân lát (bồn cây thì được), `false` = lối đi (phải dời) */
  court: boolean;
}

type Hit = (x: number, z: number, r: number) => boolean;

function segment(from: XZ, to: XZ, width: number): Hit {
  return (x, z, r) => {
    const [ax, az] = from;
    const dx = to[0] - ax;
    const dz = to[1] - az;
    const k = Math.min(1, Math.max(0, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    return Math.hypot(x - (ax + dx * k), z - (az + dz * k)) < width / 2 + r;
  };
}

function rect(from: XZ, to: XZ): Hit {
  return (x, z, r) =>
    x > Math.min(from[0], to[0]) - r && x < Math.max(from[0], to[0]) + r && z > Math.min(from[1], to[1]) - r && z < Math.max(from[1], to[1]) + r;
}

/** Hình chữ nhật tâm (cx, cz), cạnh `w` (trục x trước khi quay) × `d`, quay `rotY` độ (bội 90). */
function box(cx: number, cz: number, w: number, d: number, rotY = 0): Hit {
  const side = Math.round(rotY / 90) % 2 !== 0;
  const hw = (side ? d : w) / 2;
  const hd = (side ? w : d) / 2;
  return rect([cx - hw, cz - hd], [cx + hw, cz + hd]);
}

/** Lối đi (cây không được chạm, có bồn cũng không). */
function lanes(s: SceneSpec): [string, Hit][] {
  const out: [string, Hit][] = [];
  s.paths.forEach((p, i) => out.push([`paths[${i}]`, segment(p.from, p.to, p.width)]));
  if (s.terrain.enabled) s.terrain.stairs.forEach((p, i) => out.push([`terrain.stairs[${i}]`, segment(p.from, p.to, p.width)]));
  s.buildings.forEach((b) => out.push([`nhà ${b.id}`, box(b.x, b.z, b.w, b.d, b.rotY)]));
  s.bridges.forEach((b, i) => out.push([`bridges[${i}]`, box(b.x, b.z, b.width, b.length, b.rotY)]));
  // lòng cổng: khe giữa hai cột, sâu 3 m
  s.gates.forEach((g) => out.push([`cổng ${g.id}`, box(g.x, g.z, g.width, 3, g.rotY)]));
  const t = s.teleport;
  if (t.enabled) {
    const R = t.ringRadius + 0.9 + Math.max(0, t.dais.tiers) * t.dais.tierWidth;
    out.push(['đài truyền tống', (x, z, r) => Math.hypot(x - t.center[0], z - t.center[1]) < R + r]);
  }
  return out;
}

/** Sân lát (cây có bồn thì được). */
function courts(s: SceneSpec): [string, Hit][] {
  if (!s.terrain.enabled) return [];
  const out: [string, Hit][] = [];
  s.terrain.plateaus.forEach((p, i) => p.pave && out.push([`terrain.plateaus[${i}] (sân lát)`, rect(p.from, p.to)]));
  s.terrain.floors.forEach((p, i) => out.push([`terrain.floors[${i}] (nền khu)`, rect(p.from, p.to)]));
  return out;
}

/** Cây (lẻ + cụm) có vòng thân chạm nền lát sai luật. Vòng cây ngoài tường (`ring`) chỉ trang trí ngoài sân — không xét. */
export function treesOnPaving(s: SceneSpec): TreeOnPaving[] {
  const lane = lanes(s);
  const court = courts(s);
  const found: TreeOnPaving[] = [];
  const test = (tree: string, kind: TreeKind, x: number, z: number, scale: number, planter?: boolean): void => {
    // có bồn: xét cả vòng bồn (bồn không được lấn lối đi)
    const r = ((TRUNK_SIZE[kind] * scale) / 2) * (planter ? s.trees.planter.size : 1);
    const l = lane.find(([, h]) => h(x, z, r));
    const c = l || planter ? undefined : court.find(([, h]) => h(x, z, r));
    const hit = l ?? c;
    if (hit) found.push({ tree, kind, x, z, on: hit[0], court: !l });
  };
  s.trees.yard.forEach((t, i) => test(`trees.yard[${i}]`, t.kind ?? 'tan', t.x, t.z, t.scale, t.planter));
  s.trees.groves.forEach((g, i) =>
    groveTrees(g, s.trees.seed, i).forEach((p, k) => test(`trees.groves[${i}] cây ${k}`, g.kind, p.x, p.z, p.scale, g.planter)),
  );
  return found;
}

const n = (v: number): string => String(Math.round(v * 10) / 10).replace('.', ',');

/** Câu báo lỗi cho `scene:check`. */
export function paveProblem(t: TreeOnPaving): string {
  const fix = t.court ? 'dời ra cỏ / đất, hoặc thêm "planter": true (bồn cây)' : 'dời ra khỏi lối đi';
  return `${t.tree} (${t.kind} ${n(t.x)}; ${n(t.z)}): gốc cây trên ${t.on} — ${fix} (R-VA-6)`;
}
