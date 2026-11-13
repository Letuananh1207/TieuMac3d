/**
 * Kiểm + ghép file đặc tả cảnh lên `DEFAULT_SCENE`. Sai / thiếu một trường → giữ giá trị mặc định của trường đó và
 * ghi vào `problems`; phần tử danh sách sai → bỏ phần tử đó. Không three, không DOM (chạy được trong node).
 */
import {
  BUILDING_KINDS,
  GOODS_KINDS,
  DEFAULT_SCENE,
  NPC_IDS,
  GAME_KINDS,
  PAVE_PATTERNS,
  PROP_KINDS,
  ROOF_KINDS,
  SIDES,
  TREE_KINDS,
  WALL_STYLES,
  type BuildingSpec,
  type SceneSpec,
  type XZ,
} from './spec';
import { daisLayout, ringTrigger } from './teleportLayout';
import { stairEnds, terrainHeightFn } from './terrainHeight';

export interface ResolvedScene {
  spec: SceneSpec;
  /** từng chỗ sai trong file (đã thay bằng giá trị mặc định); rỗng = file đúng */
  problems: string[];
}

type Obj = Record<string, unknown>;
type ItemParser = (raw: unknown, path: string, out: string[]) => Obj | null;

const HEX = /^#[0-9a-fA-F]{6}$/;
const ROTATIONS = [0, 90, 180, 270];
const XZ0: [number, number] = [0, 0];

function isObj(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Ghép `raw` lên khuôn `def`: đúng kiểu thì lấy, sai / thiếu thì giữ `def` và ghi vấn đề. */
function merge(def: unknown, raw: unknown, path: string, out: string[]): unknown {
  if (raw === undefined) return def;
  if (typeof def === 'number') {
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    out.push(`${path}: cần một số`);
    return def;
  }
  if (typeof def === 'boolean') {
    if (typeof raw === 'boolean') return raw;
    out.push(`${path}: cần true / false`);
    return def;
  }
  if (typeof def === 'string') {
    if (typeof raw !== 'string') {
      out.push(`${path}: cần chữ`);
      return def;
    }
    if (def.startsWith('#') && !HEX.test(raw)) {
      out.push(`${path}: màu phải dạng "#rrggbb"`);
      return def;
    }
    return raw;
  }
  if (Array.isArray(def)) {
    const list = LISTS[path];
    if (list) return parseList(raw, def, path, out, list);
    // mảng không có trong LISTS = bộ cố định số phần tử (toạ độ, 3 màu lá…)
    if (!Array.isArray(raw) || raw.length !== def.length) {
      out.push(`${path}: cần mảng ${def.length} phần tử`);
      return def;
    }
    return def.map((d, i) => merge(d, raw[i], `${path}[${i}]`, out));
  }
  if (isObj(def)) {
    if (!isObj(raw)) {
      out.push(`${path}: cần một object`);
      return def;
    }
    const at = (k: string): string => (path ? `${path}.${k}` : k);
    for (const k of Object.keys(raw)) if (!(k in def)) out.push(`${at(k)}: trường lạ, bỏ qua`);
    const res: Obj = {};
    for (const k of Object.keys(def)) res[k] = merge(def[k], raw[k], at(k), out);
    return res;
  }
  return def;
}

function parseList(raw: unknown, def: unknown[], path: string, out: string[], parse: ItemParser): unknown[] {
  if (raw === undefined) return def;
  if (!Array.isArray(raw)) {
    out.push(`${path}: cần một mảng`);
    return def;
  }
  return raw.map((it, i) => parse(it, `${path}[${i}]`, out)).filter((it): it is Obj => it !== null);
}

/**
 * Một phần tử danh sách: mọi trường của `required` bắt buộc, `optional` có thì kiểm; `check` báo thêm lỗi riêng.
 * Có lỗi → bỏ cả phần tử (nửa vời còn tệ hơn thiếu).
 */
function item(required: Obj, optional: Obj = {}, check?: (o: Obj, path: string) => string[]): ItemParser {
  return (raw, path, out) => {
    if (!isObj(raw)) {
      out.push(`${path}: cần một object — bỏ`);
      return null;
    }
    const local: string[] = [];
    for (const k of Object.keys(required)) if (raw[k] === undefined) local.push(`${path}.${k}: thiếu`);
    const res: Obj = {};
    for (const k of Object.keys(required)) res[k] = merge(required[k], raw[k], `${path}.${k}`, local);
    for (const k of Object.keys(optional)) if (raw[k] !== undefined) res[k] = merge(optional[k], raw[k], `${path}.${k}`, local);
    for (const k of Object.keys(raw)) if (!(k in required) && !(k in optional)) out.push(`${path}.${k}: trường lạ, bỏ qua`);
    if (!local.length && check) local.push(...check(res, path));
    if (local.length) {
      out.push(...local, `${path}: bỏ phần tử này`);
      return null;
    }
    return res;
  };
}

/* ---------- kiểm riêng từng loại ---------- */

const oneOf =
  (field: string, allowed: readonly (string | number)[]) =>
  (o: Obj, path: string): string[] =>
    o[field] === undefined || allowed.includes(o[field] as string | number)
      ? []
      : [`${path}.${field}: chỉ ${allowed.join(' · ')}`];

const all =
  (...checks: ((o: Obj, path: string) => string[])[]) =>
  (o: Obj, path: string): string[] =>
    checks.flatMap((c) => c(o, path));

const positive =
  (...fields: string[]) =>
  (o: Obj, path: string): string[] =>
    fields.filter((f) => typeof o[f] === 'number' && (o[f] as number) <= 0).map((f) => `${path}.${f}: phải > 0`);

const axisAligned = (o: Obj, path: string): string[] => {
  const [a, b] = [o.from as number[], o.to as number[]];
  if (a[0] !== b[0] && a[1] !== b[1]) return [`${path}: đoạn tường phải thẳng trục (from, to cùng x hoặc cùng z)`];
  if (a[0] === b[0] && a[1] === b[1]) return [`${path}: from trùng to`];
  return [];
};

const waterShape = (o: Obj, path: string): string[] => {
  const round = o.r !== undefined;
  const rect = o.w !== undefined || o.d !== undefined;
  if (round === rect) return [`${path}: ao tròn ghi "r", ao chữ nhật ghi "w" và "d" — chỉ một trong hai`];
  if (rect && (o.w === undefined || o.d === undefined)) return [`${path}: ao chữ nhật cần cả "w" và "d"`];
  return [];
};

const floorsRange = (o: Obj, path: string): string[] =>
  o.floors === undefined || ((o.floors as number) >= 2 && (o.floors as number) <= 9 && Number.isInteger(o.floors))
    ? []
    : [`${path}.floors: số nguyên 2–9`];

const rot = oneOf('rotY', ROTATIONS);

/** Suối: `points` là danh sách [x, z] dài ngắn tuỳ ý (≥ 2), không đọc được bằng `item` (mảng cố định số phần tử). */
const streamItem: ItemParser = (raw, path, out) => {
  if (!isObj(raw)) {
    out.push(`${path}: cần một object — bỏ`);
    return null;
  }
  const local: string[] = [];
  const pts = raw.points;
  const okPts =
    Array.isArray(pts) &&
    pts.length >= 2 &&
    pts.every((p) => Array.isArray(p) && p.length === 2 && p.every((v) => typeof v === 'number' && Number.isFinite(v)));
  if (!okPts) local.push(`${path}.points: cần ít nhất 2 điểm [x, z]`);
  if (typeof raw.width !== 'number' || !(raw.width > 0)) local.push(`${path}.width: cần một số > 0`);
  for (const k of Object.keys(raw)) if (k !== 'points' && k !== 'width') out.push(`${path}.${k}: trường lạ, bỏ qua`);
  if (local.length) {
    out.push(...local, `${path}: bỏ phần tử này`);
    return null;
  }
  return { points: pts, width: raw.width };
};

/** Danh sách dài ngắn tuỳ ý trong đặc tả: đường dẫn → cách đọc một phần tử. Mảng khác = bộ cố định. */
const LISTS: Record<string, ItemParser> = {
  buildings: item(
    { id: '', x: 0, z: 0, w: 0, d: 0, title: '', roofColor: '#000000' },
    { rotY: 0, notice: ['', ''], zone: { id: '', front: 0, r: 0 }, kind: '', roof: '', floors: 0, sides: 0, trim: '#000000', pillarColor: '#000000', sign: '', goods: '' },
    all(rot, oneOf('kind', BUILDING_KINDS), oneOf('goods', GOODS_KINDS), oneOf('roof', ROOF_KINDS), oneOf('sides', [4, 6]), floorsRange, positive('w', 'd')),
  ),
  'walls.gates': item({ side: '', at: 0, width: 0 }, {}, all(oneOf('side', SIDES), positive('width'))),
  wallSegments: item({ from: XZ0, to: XZ0 }, { height: 0 }, all(axisAligned, positive('height'))),
  paths: item({ from: XZ0, to: XZ0, width: 0 }, { color: '#000000' }, positive('width')),
  gates: item({ id: '', x: 0, z: 0, width: 0, title: '' }, { rotY: 0, hanTitle: '', roofColor: '#000000', model: '' }, all(rot, positive('width'))),
  'site.areas': item({ name: '', from: XZ0, to: XZ0 }, { han: '' }),
  water: item({ x: 0, z: 0 }, { r: 0, w: 0, d: 0, rotY: 0 }, all(waterShape, rot, positive('r', 'w', 'd'))),
  props: item({ kind: '', x: 0, z: 0 }, { rotY: 0, scale: 0, text: '' }, all(oneOf('kind', PROP_KINDS), rot, positive('scale'))),
  npcs: item({ id: '', x: 0, z: 0 }, { rotY: 0 }, oneOf('id', NPC_IDS)),
  gameTables: item({ id: '', kind: '', x: 0, z: 0, npc: '' }, { rotY: 0 }, all(oneOf('kind', GAME_KINDS), oneOf('npc', NPC_IDS), rot)),
  'trees.yard': item({ x: 0, z: 0, scale: 0 }, { kind: '' }, all(oneOf('kind', TREE_KINDS), positive('scale'))),
  'trees.groves': item(
    { kind: '', x: 0, z: 0, w: 0, d: 0, count: 0 },
    { collide: true },
    all(oneOf('kind', TREE_KINDS), positive('w', 'd', 'count')),
  ),
  'floating.islands': item({ x: 0, y: 0, z: 0, scale: 0 }, {}, positive('scale')),
  'terrain.plateaus': item({ from: XZ0, to: XZ0, y: 0 }, { pave: true, blend: 0 }, positive('blend')),
  'terrain.peaks': item({ x: 0, z: 0, r: 0, h: 0 }, {}, positive('r')),
  'terrain.stairs': item({ from: XZ0, to: XZ0, width: 0 }, {}, positive('width')),
  'terrain.waterfalls': item({ x: 0, z: 0, top: 0, bottom: 0, width: 0 }, { rotY: 0 }, positive('width')),
  'terrain.streams': streamItem,
  'farMountains.layers': item(
    { radius: 0, height: 0, color: '#000000', peaks: 0 },
    { width: 1, spurs: 0 },
    all(positive('radius', 'height', 'peaks', 'width'), (o, p) =>
      typeof o.spurs === 'number' && (o.spurs < 0 || o.spurs > 3) ? [`${p}.spurs: 0…3`] : [],
    ),
  ),
};

/** Kiểm + ghép nội dung file đặc tả lên `DEFAULT_SCENE`. `raw === undefined` = chưa có file. */
export function resolveSceneSpec(raw: unknown): ResolvedScene {
  const problems: string[] = [];
  if (raw === undefined) return { spec: DEFAULT_SCENE, problems };
  if (!isObj(raw)) return { spec: DEFAULT_SCENE, problems: ['scene.json: cần một object — dùng cảnh mặc định'] };
  // merge giữ đúng hình của khuôn (LISTS kiểm từng phần tử) nên ép về SceneSpec là an toàn
  const spec = merge(DEFAULT_SCENE, raw, '', problems) as SceneSpec;
  problems.push(...checkConsistency(spec));
  return { spec, problems };
}

/** Lỗi giữa các trường với nhau (trùng mã, khoảng sai chiều). Chỉ báo, không sửa. */
function checkConsistency(s: SceneSpec): string[] {
  const out: string[] = [];
  const dup = (ids: string[], what: string): void => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) out.push(`${what} "${id}" bị trùng`);
      seen.add(id);
    }
  };
  dup(
    s.buildings.map((b: BuildingSpec) => b.id),
    'mã nhà',
  );
  dup(
    s.buildings.flatMap((b) => (b.zone ? [b.zone.id] : [])),
    'mã vùng',
  );
  dup(
    s.gates.map((g) => g.id),
    'mã cổng',
  );
  if (s.fog.near >= s.fog.far) out.push('fog: near phải nhỏ hơn far');
  const k = s.buildingStyle.heightScale;
  if (k < 0.5 || k > 3) out.push(`buildingStyle.heightScale: 0,5–3 (đang ${k}; code kẹp về khoảng này)`);
  if (s.camera.minDist > s.camera.maxDist) out.push('camera: minDist phải ≤ maxDist');
  if (s.trees.ring.scaleMin > s.trees.ring.scaleMax) out.push('trees.ring: scaleMin phải ≤ scaleMax');
  for (const g of s.walls.gates) {
    if (Math.abs(g.at) + g.width / 2 > s.walls.half) {
      out.push(`walls.gates (cạnh ${g.side}, at ${g.at}): khe vượt quá cạnh tường (±${s.walls.half})`);
    }
  }
  if (s.floating.clouds.count < 0) out.push('floating.clouds.count: phải ≥ 0');
  if (!PAVE_PATTERNS.includes(s.ground.pattern)) out.push(`ground.pattern: chỉ ${PAVE_PATTERNS.join(' · ')}`);
  if (!WALL_STYLES.includes(s.walls.style)) out.push(`walls.style: chỉ ${WALL_STYLES.join(' · ')}`);
  if (s.walls.windows < 0) out.push('walls.windows: phải ≥ 0');
  const t = s.terrain;
  if (t.cell <= 0 || t.size <= 0) out.push('terrain: size và cell phải > 0');
  else if (t.size / t.cell > 400) out.push(`terrain: size / cell = ${Math.round(t.size / t.cell)} ô mỗi cạnh — tối đa 400 (nặng cho điện thoại)`);
  if (t.slopeDirt > t.slopeRock) out.push('terrain: slopeDirt phải ≤ slopeRock');
  if (t.noise.scale <= 0) out.push('terrain.noise.scale: phải > 0');
  if (t.edge.width <= 0) out.push('terrain.edge.width: phải > 0');
  if (t.enabled && t.edge.radius + t.edge.width > t.size / 2) {
    out.push(`terrain.edge: mép vực (radius + width = ${t.edge.radius + t.edge.width}) vượt nửa vùng lưới (${t.size / 2}) — tăng size`);
  }
  out.push(...checkTeleport(s));
  if (s.cloudSea.radius < 0) out.push('cloudSea.radius: phải ≥ 0');
  if (t.enabled && t.size > 0 && t.cell > 0) out.push(...checkOnFlatGround(s));
  if (t.enabled) {
    t.stairs.forEach((st, i) => {
      const [ya, yb] = stairEnds(t, st);
      const len = Math.hypot(st.to[0] - st.from[0], st.to[1] - st.from[1]);
      const deg = (Math.atan2(Math.abs(yb - ya), len) * 180) / Math.PI;
      if (deg > 35) out.push(`terrain.stairs[${i}]: dốc ${deg.toFixed(0)}° > 35° — nhân vật không leo được (R-VA-2); kéo dài bậc hoặc hạ đầu trên`);
    });
  }
  return out;
}

/** Vòng trận (R-HANH-2): nằm trong sân; chỗ xuất phát của cảnh không nằm trong vòng (phải bước vào mới truyền tống). */
function checkTeleport(s: SceneSpec): string[] {
  const out: string[] = [];
  const tp = s.teleport;
  if (!tp.enabled) return out;
  if (tp.ringRadius <= 0) out.push('teleport.ringRadius: phải > 0');
  if (tp.radius > 0 && tp.ringRadius + 0.6 > tp.radius) out.push('teleport: vòng trận chạm viền sân (ringRadius + 0,6 > radius)');
  const d = Math.hypot(s.player.start[0] - tp.center[0], s.player.start[1] - tp.center[1]);
  if (d < ringTrigger(tp) + 1) out.push(`teleport: chỗ xuất phát (player.start) cách tâm vòng ${d.toFixed(1)} m — dời ra ngoài vòng (≥ ${ringTrigger(tp) + 1} m)`);
  const dz = tp.dais;
  if (dz.tiers > 0) {
    if (!Number.isInteger(dz.tiers) || dz.tiers > 3) out.push('teleport.dais.tiers: số nguyên 0…3');
    if (dz.tierHeight < 0.2 || dz.tierHeight > 0.8) out.push('teleport.dais.tierHeight: 0,2…0,8 m (cỡ bậc người bước)');
    if (dz.tierWidth < 1.2) out.push('teleport.dais.tierWidth: ≥ 1,2 m (đủ chỗ đi trên tầng)');
    if (dz.stairWidth < 1.6 || dz.stairWidth > 4) out.push('teleport.dais.stairWidth: 1,6…4 m');
    if (!Number.isInteger(dz.pillars) || dz.pillars < 0 || dz.pillars > 8) out.push('teleport.dais.pillars: số nguyên 0…8');
    if (tp.radius > 0) out.push('teleport: có đài (dais.tiers > 0) thì radius phải 0 — đài thay sân đá');
    const L = daisLayout(tp);
    if (d < L.footprint + 1) out.push(`teleport: chỗ xuất phát (player.start) nằm trên đài — dời ra ngoài (≥ ${(L.footprint + 1).toFixed(1)} m từ tâm)`);
  }
  return out;
}

/** Ngưỡng chênh độ cao (m) trong chân một vật để coi là "đất phẳng". */
const FLAT_TOLERANCE = 0.3;

/** Có địa hình: nhà, cổng, ao, giếng, tường, điểm xuất phát phải đứng trên đất phẳng (bục khu / lối lát). */
function checkOnFlatGround(s: SceneSpec): string[] {
  const h = terrainHeightFn(s.terrain, s.paths);
  const out: string[] = [];
  const flat = (what: string, pts: XZ[]): void => {
    const ys = pts.map(([x, z]) => h(x, z));
    const diff = Math.max(...ys) - Math.min(...ys);
    if (diff > FLAT_TOLERANCE) {
      out.push(`${what}: nằm trên đất dốc (chênh ${diff.toFixed(1)} m) — thêm / nới bục khu (terrain.plateaus) bao quanh`);
    }
  };
  const box = (x: number, z: number, w: number, d: number, rotDeg = 0): XZ[] => {
    const [ww, dd] = rotDeg % 180 !== 0 ? [d, w] : [w, d];
    return [[x, z], [x - ww / 2, z - dd / 2], [x + ww / 2, z - dd / 2], [x - ww / 2, z + dd / 2], [x + ww / 2, z + dd / 2]];
  };
  for (const b of s.buildings) flat(`nhà "${b.id}"`, box(b.x, b.z, b.w + 1, b.d + 1, b.rotY));
  for (const g of s.gates) flat(`cổng "${g.id}"`, box(g.x, g.z, g.width + 8, 2, g.rotY));
  for (const w of s.water) flat(`ao (${w.x}; ${w.z})`, box(w.x, w.z, w.r !== undefined ? w.r * 2 : (w.w ?? 0), w.r !== undefined ? w.r * 2 : (w.d ?? 0), w.rotY));
  for (const t of s.gameTables) flat(`bàn chơi "${t.id}"`, box(t.x, t.z, 3, 4, t.rotY));
  if (s.well.enabled) flat('giếng', box(s.well.x, s.well.z, 2.4, 2.4));
  const hw = s.walls.half;
  if (s.walls.enabled) flat('tường bao', [[-hw, -hw], [hw, -hw], [-hw, hw], [hw, hw], [0, -hw], [0, hw], [-hw, 0], [hw, 0]]);
  const tp = s.teleport;
  const pad = Math.max(tp.radius, tp.ringRadius + 0.7, tp.dais.tiers > 0 ? daisLayout(tp).footprint : 0) * 2;
  if (tp.enabled) flat('vòng trận (teleport)', box(tp.center[0], tp.center[1], pad, pad));
  s.wallSegments.forEach((w, i) => flat(`wallSegments[${i}]`, [w.from, w.to, [(w.from[0] + w.to[0]) / 2, (w.from[1] + w.to[1]) / 2]]));
  flat('điểm xuất phát (player.start)', box(s.player.start[0], s.player.start[1], 2, 2));
  return out;
}
