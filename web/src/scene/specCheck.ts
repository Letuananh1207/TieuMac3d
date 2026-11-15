/**
 * Kiểm + ghép file đặc tả cảnh lên `DEFAULT_SCENE`. Sai / thiếu một trường → giữ giá trị mặc định của trường đó và
 * ghi vào `problems`; phần tử danh sách sai → bỏ phần tử đó. Không three, không DOM (chạy được trong node).
 */
import { checkBounds } from './ranhDi';
import {
  BUILDING_KINDS,
  GOODS_KINDS,
  DEFAULT_SCENE,
  NPC_IDS,
  NPC_POSES,
  GAME_KINDS,
  GAME_SLOT,
  GATE_KINDS,
  BRIDGE_KINDS,
  HANG_KINDS,
  FENCE_KINDS,
  PAVE_PATTERNS,
  PROP_KINDS,
  FLOWER_POTS,
  PHAP_BAO,
  ROOF_KINDS,
  SEAT_KINDS,
  SIDES,
  TREE_KINDS,
  WALL_STYLES,
  type BuildingSpec,
  type SceneSpec,
  type XZ,
  bridgeRise,
  rotateXZ,
  type BridgeSpec,
  PORTAL_VIAS,
} from './spec';
import { checkDecorArea, parseDecorArea } from './decorArea';
import { paveProblem, treesOnPaving } from './cayTrenNen';
import { checkGarden, gardenFootprints } from './vuonLayout';
import { landingPad, START_HEADING } from './hacDuong';
import { checkPortals } from './portals';
import { checkLook } from './look';
import { checkDayNight } from './ngayDem';
import { checkTea } from './luongCheLayout';
import { checkMiniGames, parseMiniGame } from './miniGameCheck';
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

/** Trường khuôn `null` (không có = tắt) đọc bằng hàm riêng. */
const NULLABLE: Record<string, (raw: unknown, path: string, out: string[]) => unknown> = { decorArea: parseDecorArea };

function isObj(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Ghép `raw` lên khuôn `def`: đúng kiểu thì lấy, sai / thiếu thì giữ `def` và ghi vấn đề. */
function merge(def: unknown, raw: unknown, path: string, out: string[]): unknown {
  if (raw === undefined) return def;
  if (def === null) return NULLABLE[path]?.(raw, path, out) ?? null;
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

/** Số `field` (nếu có) nằm trong [lo, hi]. */
const range =
  (field: string, lo: number, hi: number) =>
  (o: Obj, path: string): string[] =>
    typeof o[field] === 'number' && ((o[field] as number) < lo || (o[field] as number) > hi) ? [`${path}.${field}: ${lo} … ${hi}`] : [];

const axisAligned = (o: Obj, path: string): string[] => {
  const [a, b] = [o.from as number[], o.to as number[]];
  if (a[0] !== b[0] && a[1] !== b[1]) return [`${path}: đoạn tường phải thẳng trục (from, to cùng x hoặc cùng z)`];
  if (a[0] === b[0] && a[1] === b[1]) return [`${path}: from trùng to`];
  return [];
};

/** Độ dày tường hợp lý: mỏng hơn 0,2 thì như tấm giấy, dày hơn 1,2 thì như thành luỹ. */
export const WALL_THICKNESS: [number, number] = [0.2, 1.2];

const thicknessOk = (o: Obj, path: string): string[] =>
  typeof o.thickness === 'number' && (o.thickness < WALL_THICKNESS[0] || o.thickness > WALL_THICKNESS[1])
    ? [`${path}.thickness: ${WALL_THICKNESS[0]}…${WALL_THICKNESS[1]} m`]
    : [];

/** Biển cổng: mỗi mặt tối đa 20 ký tự (biển một dòng, dài hơn thì chữ bị bóp). */
const SIGN_MAX = 20;
const signsOk = (signs: unknown, path: string): string[] =>
  isObj(signs)
    ? Object.entries(signs)
        .filter(([, v]) => typeof v === 'string' && [...v].length > SIGN_MAX)
        .map(([k]) => `${path}.signs.${k}: tối đa ${SIGN_MAX} ký tự`)
    : [];

/** `clearHeight` chỉ cho cổng mái ngói `lau`, 2–8 m; thiếu / 0 = mặc định. */
const clearOk = (o: Obj, path: string): string[] => {
  const h = o.clearHeight;
  if (h === undefined || h === 0) return [];
  if (o.kind !== 'lau') return [`${path}.clearHeight: chỉ dùng với kind "lau"`];
  return (h as number) < 2 || (h as number) > 8 ? [`${path}.clearHeight: 2–8 m (đang ${h as number})`] : [];
};

/** `roof: false` (bỏ mái ngói cổng) chỉ có nghĩa với cổng mái ngói `lau`. */
const roofOk = (o: Obj, path: string): string[] =>
  o.roof === false && o.kind !== 'lau' ? [`${path}.roof: chỉ dùng với kind "lau"`] : [];

const gateLook = (o: Obj, path: string): string[] => [
  ...oneOf('kind', GATE_KINDS)(o, path),
  ...signsOk(o.signs, path),
  ...clearOk(o, path),
  ...roofOk(o, path),
];

/** Cổng trên đoạn tường: rộng > 0; khe + 1 m mỗi bên (tấm cổng) nằm trong đoạn. */
const segmentGateOk = (o: Obj, path: string): string[] => {
  const g = o.gate as Obj | undefined;
  if (!g) return [];
  const p = `${path}.gate`;
  const [at, width] = [g.at as number, g.width as number];
  if (width <= 0) return [`${p}.width: phải > 0`];
  const [a, b] = [o.from as number[], o.to as number[]];
  const k = a[1] === b[1] ? 0 : 1; // đoạn chạy theo x (cùng z) → toạ độ dọc đoạn là x
  const [lo, hi] = [Math.min(a[k], b[k]), Math.max(a[k], b[k])];
  const out = gateLook(g, p);
  if (at - width / 2 - 1 < lo || at + width / 2 + 1 > hi) {
    out.push(`${p}: khe (at ${at}, rộng ${width}) + 1 m mỗi bên phải nằm trong đoạn ${lo}…${hi}`);
  }
  return out;
};

const waterShape = (o: Obj, path: string): string[] => {
  const round = o.r !== undefined;
  const rect = o.w !== undefined || o.d !== undefined;
  if (round === rect) return [`${path}: ao tròn ghi "r", ao chữ nhật ghi "w" và "d" — chỉ một trong hai`];
  if (rect && (o.w === undefined || o.d === undefined)) return [`${path}: ao chữ nhật cần cả "w" và "d"`];
  return [];
};

/** Dốc lưng cầu vòm (rise trên nửa dài) không quá 35° như mặt đất (R-VA-2). */
const bridgeSlope = (o: Obj, path: string): string[] => {
  const len = o.length as number;
  const rise = (o.rise as number | undefined) ?? bridgeRise(o.kind as BridgeSpec['kind'], len);
  return Math.atan2(rise, len / 2) > (35 * Math.PI) / 180 ? [`${path}.rise: lưng cầu dốc quá 35° — giảm rise hoặc tăng length`] : [];
};



const floorsRange = (o: Obj, path: string): string[] =>
  o.floors === undefined || ((o.floors as number) >= 2 && (o.floors as number) <= 9 && Number.isInteger(o.floors))
    ? []
    : [`${path}.floors: số nguyên 2–9`];

const rot = oneOf('rotY', ROTATIONS);

/** Cổng cỡ người (`gates[].height`): 6–12 m — thấp hơn 6 thì lòng cổng dưới 3 m, camera gần chạm xà. */
export const GATE_HEIGHT: [number, number] = [6, 12];
const gateHeightOk = (o: Obj, path: string): string[] =>
  o.height === undefined || ((o.height as number) >= GATE_HEIGHT[0] && (o.height as number) <= GATE_HEIGHT[1])
    ? []
    : [`${path}.height: ${GATE_HEIGHT[0]}–${GATE_HEIGHT[1]} m`];

const boardsRange = (o: Obj, path: string): string[] =>
  o.boards === undefined || ((o.boards as number) >= 1 && (o.boards as number) <= 4 && Number.isInteger(o.boards))
    ? []
    : [`${path}.boards: số nguyên 1–4`];

/** Biển tên trò chơi (R-GIAO-2): quay bội 90, có đủ tên Hán + Việt. */
const signRot = (o: Obj, path: string): string[] => {
  const sg = o.sign as Obj | undefined;
  if (!sg) return [];
  const out = rot(sg, `${path}.sign`);
  // `han` rỗng được: biển chỉ ghi tên Việt (`gameSign`)
  if (!sg.name) out.push(`${path}.sign: cần name (tên trò bằng chữ Việt)`);
  return out;
};

/** Suối: `points` là danh sách [x, z] dài ngắn tuỳ ý (≥ 2), không đọc được bằng `item` (mảng cố định số phần tử). */
/** Phần tử có một danh sách điểm `field` dài tuỳ ý (≥ 2 điểm [x, z]); các trường còn lại kiểm bằng `rest`. */
const withPoints =
  (field: string, rest: ItemParser): ItemParser =>
  (raw, path, out) => {
    if (!isObj(raw)) {
      out.push(`${path}: cần một object — bỏ`);
      return null;
    }
    const pts = raw[field];
    const ok =
      Array.isArray(pts) &&
      pts.length >= 2 &&
      pts.every((p) => Array.isArray(p) && p.length === 2 && p.every((v) => typeof v === 'number' && Number.isFinite(v)));
    if (!ok) {
      out.push(`${path}.${field}: cần ít nhất 2 điểm [x, z]`, `${path}: bỏ phần tử này`);
      return null;
    }
    const others = Object.fromEntries(Object.entries(raw).filter(([k]) => k !== field));
    const res = rest(others, path, out);
    return res ? { ...(res as Obj), [field]: pts } : null;
  };

/**
 * NPC có đường đi (R-NPC-7): `route` không bắt buộc; có thì ≥ 3 điểm [x, z], không hai điểm liền nhau trùng nhau (kể cả
 * điểm cuối → điểm đầu, đường khép kín). Cách vật cản / dốc / nền: `scene/routeCheck.ts` (`scene:check`, test cảnh).
 */
const withRoute =
  (rest: ItemParser): ItemParser =>
  (raw, path, out) => {
    if (!isObj(raw) || raw.route === undefined) return rest(raw, path, out);
    const pts = raw.route;
    const ok =
      Array.isArray(pts) &&
      pts.length >= 3 &&
      pts.every((p) => Array.isArray(p) && p.length === 2 && p.every((v) => typeof v === 'number' && Number.isFinite(v)));
    const pp = pts as number[][];
    const dup = ok && pp.some((p, i) => Math.hypot(p[0] - pp[(i + 1) % pp.length][0], p[1] - pp[(i + 1) % pp.length][1]) < 0.05);
    if (!ok || dup) {
      out.push(`${path}.route: ${ok ? 'hai điểm liền nhau trùng nhau' : 'cần ít nhất 3 điểm [x, z]'}`, `${path}: bỏ phần tử này`);
      return null;
    }
    const others = Object.fromEntries(Object.entries(raw).filter(([k]) => k !== 'route'));
    const res = rest(others, path, out);
    return res ? { ...(res as Obj), route: pts } : null;
  };

/** Trường `open` (danh sách hướng bac · nam · dong · tay, dài tuỳ ý) — kiểm riêng, phần còn lại kiểm bằng `rest`. */
const withSides =
  (rest: ItemParser): ItemParser =>
  (raw, path, out) => {
    if (!isObj(raw) || raw.open === undefined) return rest(raw, path, out);
    const sides = raw.open;
    if (!Array.isArray(sides) || !sides.every((v) => (SIDES as readonly unknown[]).includes(v))) {
      out.push(`${path}.open: danh sách trong ${SIDES.join(' · ')}`, `${path}: bỏ phần tử này`);
      return null;
    }
    const res = rest(Object.fromEntries(Object.entries(raw).filter(([k]) => k !== 'open')), path, out);
    return res ? { ...res, open: sides } : null;
  };

/** `ramparts[].ramps`: danh sách mã đạo dài tuỳ ý, mỗi cái { at, dir: ±1, length?, width? }. */
const rampItem = item({ at: 0, dir: 0 }, { length: 0, width: 0 }, all(oneOf('dir', [1, -1]), positive('length', 'width')));
const withRamps =
  (rest: ItemParser): ItemParser =>
  (raw, path, out) => {
    if (!isObj(raw) || raw.ramps === undefined) return rest(raw, path, out);
    if (!Array.isArray(raw.ramps)) {
      out.push(`${path}.ramps: cần danh sách`, `${path}: bỏ phần tử này`);
      return null;
    }
    const ramps = raw.ramps.map((r, i) => rampItem(r, `${path}.ramps[${i}]`, out)).filter((r) => r !== null);
    const res = rest(Object.fromEntries(Object.entries(raw).filter(([k]) => k !== 'ramps')), path, out);
    return res ? { ...res, ramps } : null;
  };

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
  const depth = raw.depth;
  if (depth !== undefined && (typeof depth !== 'number' || !(depth >= 0) || depth > 6)) local.push(`${path}.depth: cần một số 0…6 (m)`);
  for (const k of Object.keys(raw)) if (k !== 'points' && k !== 'width' && k !== 'depth') out.push(`${path}.${k}: trường lạ, bỏ qua`);
  if (local.length) {
    out.push(...local, `${path}: bỏ phần tử này`);
    return null;
  }
  return typeof depth === 'number' ? { points: pts, width: raw.width, depth } : { points: pts, width: raw.width };
};

/** Danh sách dài ngắn tuỳ ý trong đặc tả: đường dẫn → cách đọc một phần tử. Mảng khác = bộ cố định. */
/** khuôn biển cổng: thiếu mặt nào thì rỗng (không biển) */
const SIGNS0 = { bac: '', nam: '', dong: '', tay: '' };

const LISTS: Record<string, ItemParser> = {
  buildings: item(
    { id: '', x: 0, z: 0, w: 0, d: 0, title: '', roofColor: '#000000' },
    { rotY: 0, notice: ['', ''], zone: { id: '', front: 0, r: 0 }, kind: '', roof: '', floors: 0, sides: 0, trim: '#000000', pillarColor: '#000000', sign: '', goods: '', closed: false, eaves: 0, pillarH: 0, benches: false },
    all(rot, oneOf('kind', BUILDING_KINDS), oneOf('goods', GOODS_KINDS), oneOf('roof', ROOF_KINDS), oneOf('sides', [4, 6]), oneOf('eaves', [1, 2]), floorsRange, positive('w', 'd'), range('pillarH', 2, 6)),
  ),
  'walls.gates': item({ side: '', at: 0, width: 0 }, { kind: '', signs: SIGNS0, clearHeight: 0, roof: true }, all(oneOf('side', SIDES), positive('width'), gateLook)),
  wallSegments: item(
    { from: XZ0, to: XZ0 },
    { height: 0, thickness: 0, follow: true, gate: { at: 0, width: 0, kind: 'trang', signs: SIGNS0, clearHeight: 0, roof: true } },
    all(axisAligned, positive('height', 'thickness'), thicknessOk, segmentGateOk),
  ),
  paths: item({ from: XZ0, to: XZ0, width: 0 }, { color: '#000000', edge: true, dirt: true }, positive('width')),
  gates: item(
    { id: '', x: 0, z: 0, width: 0, title: '' },
    { rotY: 0, hanTitle: '', roofColor: '#000000', model: '', modelScale: 0, height: 0, backTitle: '' },
    all(rot, positive('width', 'modelScale'), gateHeightOk),
  ),
  'site.areas': item({ name: '', from: XZ0, to: XZ0 }, { han: '' }),
  water: withSides(item({ x: 0, z: 0 }, { r: 0, w: 0, d: 0, rotY: 0, sunk: 0, shape: 'trang' }, all(waterShape, rot, positive('r', 'w', 'd')))),
  props: item({ kind: '', x: 0, z: 0 }, { rotY: 0, scale: 0, text: '', y: 0 }, all(oneOf('kind', PROP_KINDS), rot, positive('scale'))),
  channels: withPoints('points', item({}, { width: 0, cups: 0, speed: 0 }, positive('width', 'speed'))),
  bridges: item(
    { kind: '', x: 0, z: 0, length: 0, width: 0 },
    { rotY: 0, rise: 0, water: true, sunk: 0, arch: 'vuong' },
    all(oneOf('kind', BRIDGE_KINDS), oneOf('arch', ['vuong']), rot, positive('length', 'width'), bridgeSlope),
  ),
  flocks: item({ x: 0, z: 0, y: 0, radius: 0, count: 0 }, { speed: 0 }, positive('radius', 'count', 'speed')),
  boats: withPoints('path', item({}, { speed: 0, canopy: '#000000', sunk: 0, moored: true, cargo: true }, positive('speed'))),
  mirages: item({ x: 0, y: 0, z: 0, width: 0 }, { rotY: 0, period: 0 }, positive('width', 'period')),
  ramparts: withRamps(item({ from: XZ0, to: XZ0, height: 0, outSide: 0 }, { width: 0 }, all(axisAligned, positive('height', 'width')))),
  caravans: withPoints('path', item({}, { count: 0, spacing: 0, speed: 0 }, positive('count', 'spacing', 'speed'))),
  galleries: item({ from: XZ0, to: XZ0, waterSide: 0 }, { width: 0 }, all(axisAligned, positive('width'))),
  npcs: withRoute(item({ id: '', x: 0, z: 0 }, { rotY: 0, pose: '', scale: 0, speed: 0 }, all(oneOf('id', NPC_IDS), oneOf('pose', NPC_POSES), positive('scale', 'speed')))),
  lanternStrings: item({ from: XZ0, to: XZ0 }, {}),
  fences: item({ from: XZ0, to: XZ0 }, {}, axisAligned),
  // đài đá thấp (V-66 B3): mặt trên bước lên được (≤ 0,6 m — R-VA-3)
  terraces: item({ x: 0, z: 0, w: 0, d: 0, h: 0 }, { rotY: 0 }, all(rot, positive('w', 'd'), range('h', 0.1, 0.6))),
  seats: item({ x: 0, z: 0 }, { rotY: 0, kind: '' }, oneOf('kind', SEAT_KINDS)),
  // trò nhỏ Trúc Lâm (V-66 B4) — mỗi loại một dạng: miniGameCheck.ts
  miniGames: parseMiniGame,
  teaRows: item({ from: XZ0, to: XZ0 }, { width: 0, height: 0 }, all(axisAligned, positive('width', 'height'))),
  gameTables: item(
    { id: '', kind: '', x: 0, z: 0, npc: '' },
    { rotY: 0, boards: 0, npcStand: true, sign: { x: 0, z: 0, rotY: 0, han: '', name: '' } },
    all(oneOf('kind', GAME_KINDS), oneOf('npc', NPC_IDS), rot, boardsRange, signRot),
  ),
  'garden.plots': item({ id: '', x: 0, z: 0 }, {}),
  // cổng đi bộ (R-HANH-4): kiểm vùng / chỗ đứng / cặp cổng ở `portals.ts` + `scripts/check-scene.mjs`
  portals: item({ scene: '', area: { from: XZ0, to: XZ0 }, arrive: { at: XZ0, rotY: 0 } }, { label: '', marker: true, via: '' }, (o, path) => [
    ...(typeof o.label === 'string' && [...o.label].length > 20 ? [`${path}.label: tối đa 20 ký tự (nhãn một dòng)`] : []),
    ...oneOf('via', PORTAL_VIAS)(o, path),
  ]),
  'trees.yard': item({ x: 0, z: 0, scale: 0 }, { kind: '', planter: true }, all(oneOf('kind', TREE_KINDS), positive('scale'))),
  'trees.groves': item(
    { kind: '', x: 0, z: 0, w: 0, d: 0, count: 0 },
    { collide: true, planter: true, scale: 0 },
    all(oneOf('kind', TREE_KINDS), positive('w', 'd', 'count', 'scale')),
  ),
  'floating.islands': item({ x: 0, y: 0, z: 0, scale: 0 }, {}, positive('scale')),
  'terrain.plateaus': item({ from: XZ0, to: XZ0, y: 0 }, { pave: true, blend: 0, rail: true, edge: true, rocky: true }, positive('blend')),
  'terrain.peaks': item({ x: 0, z: 0, r: 0, h: 0 }, {}, positive('r')),
  'terrain.dunes': item({ x: 0, z: 0, len: 0, h: 0 }, { rotY: 0, width: 0 }, positive('len', 'h', 'width')),
  'terrain.stairs': item({ from: XZ0, to: XZ0, width: 0 }, { cut: true }, positive('width')),
  'terrain.waterfalls': item({ x: 0, z: 0, top: 0, bottom: 0, width: 0 }, { rotY: 0 }, positive('width')),
  'terrain.streams': streamItem,
  'terrain.floors': item({ from: XZ0, to: XZ0, color: '#000000' }, { y: 0, pattern: '' }, oneOf('pattern', PAVE_PATTERNS)),
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
  if (!['phien', 'san'].includes(s.buildingStyle.pathLook)) out.push(`buildingStyle.pathLook: "phien" | "san" (đang "${s.buildingStyle.pathLook}")`);
  const k = s.buildingStyle.heightScale;
  if (k < 0.5 || k > 3) out.push(`buildingStyle.heightScale: 0,5–3 (đang ${k}; code kẹp về khoảng này)`);
  if (s.camera.minDist > s.camera.maxDist) out.push('camera: minDist phải ≤ maxDist');
  const fr = s.camera.frame;
  if (fr.enabled) {
    if (fr.pitchMin > fr.pitchMax || fr.pitchMin < 0.12 || fr.pitchMax > 1.4) out.push('camera.frame: 0,12 ≤ pitchMin ≤ pitchMax ≤ 1,4 (radian)');
    if (s.camera.near.pitch < fr.pitchMin || s.camera.near.pitch > fr.pitchMax) out.push('camera.frame: near.pitch phải nằm trong pitchMin … pitchMax');
    if (fr.yawLimit < 0 || fr.yawLimit > 90) out.push('camera.frame.yawLimit: 0–90 (độ)');
    if (fr.follow < 0 || fr.follow > 1) out.push('camera.frame.follow: 0–1');
    if (fr.half[0] <= 0 || fr.half[1] <= 0) out.push('camera.frame.half: phải > 0');
  }
  if (s.trees.ring.scaleMin > s.trees.ring.scaleMax) out.push('trees.ring: scaleMin phải ≤ scaleMax');
  if (!['cau', 'chum'].includes(s.trees.crown)) out.push(`trees.crown: "cau" | "chum" (đang "${s.trees.crown}")`);
  if (s.trees.lodDistance <= 0) out.push('trees.lodDistance: phải > 0');
  if (s.trees.planter.size < 1 || s.trees.planter.height <= 0) out.push('trees.planter: size ≥ 1, height > 0');
  out.push(...treesOnPaving(s).map(paveProblem));
  for (const p of s.props) {
    if (p.kind === 'phap-bao' && !PHAP_BAO.includes(p.text ?? '')) out.push(`props phap-bao (${p.x}; ${p.z}): text là một trong ${PHAP_BAO.join(' ')}`);
    if (p.kind === 'bon-hoa' && !FLOWER_POTS.includes(p.text ?? '')) out.push(`props bon-hoa (${p.x}; ${p.z}): text là một trong ${FLOWER_POTS.join(' ')} (đang "${p.text ?? ''}")`);
  }
  for (const g of s.walls.gates) {
    if (Math.abs(g.at) + g.width / 2 > s.walls.half) {
      out.push(`walls.gates (cạnh ${g.side}, at ${g.at}): khe vượt quá cạnh tường (±${s.walls.half})`);
    }
  }
  if (s.floating.clouds.count < 0) out.push('floating.clouds.count: phải ≥ 0');
  if (!PAVE_PATTERNS.includes(s.ground.pattern)) out.push(`ground.pattern: chỉ ${PAVE_PATTERNS.join(' · ')}`);
  if (!WALL_STYLES.includes(s.walls.style)) out.push(`walls.style: chỉ ${WALL_STYLES.join(' · ')}`);
  if (s.walls.windows < 0) out.push('walls.windows: phải ≥ 0');
  out.push(...thicknessOk(s.walls, 'walls'));
  const t = s.terrain;
  if (t.cell <= 0 || t.size <= 0) out.push('terrain: size và cell phải > 0');
  else if (t.size / t.cell > 400) out.push(`terrain: size / cell = ${Math.round(t.size / t.cell)} ô mỗi cạnh — tối đa 400 (nặng cho điện thoại)`);
  if (t.slopeDirt > t.slopeRock) out.push('terrain: slopeDirt phải ≤ slopeRock');
  if (t.noise.scale <= 0) out.push('terrain.noise.scale: phải > 0');
  if (t.edge.width <= 0) out.push('terrain.edge.width: phải > 0');
  if (t.enabled && t.edge.radius + t.edge.width > t.size / 2) {
    out.push(`terrain.edge: mép vực (radius + width = ${t.edge.radius + t.edge.width}) vượt nửa vùng lưới (${t.size / 2}) — tăng size`);
  }
  out.push(...checkTeleport(s), ...checkStoneYardEmpty(s),...checkLanterns(s), ...checkDecorArea(s), ...checkPortals(s), ...checkLook(s.look), ...checkDayNight(s.dayNight), ...checkTea(s), ...checkGarden(s), ...checkMiniGames(s));
  out.push(...hanOnDisplay(s).map((h) => `${h.path}: biển / tên trong game chỉ tiếng Việt, không chữ Hán (R-HUD-4) — đang là "${h.text}"`));
  if (s.cloudSea.radius < 0) out.push('cloudSea.radius: phải ≥ 0');
  out.push(...checkCrane(s));
  out.push(...checkBounds(s));
  if (!(s.light.lampGlow >= 0 && s.light.lampGlow <= 1)) out.push(`light.lampGlow: 0…1 (đang ${s.light.lampGlow})`);
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

/** Prop mà `text` chỉ là mã chọn hình (không vẽ lên cảnh): bồn hoa tứ quân tử, pháp bảo Bát Tiên. */
const TEXT_IS_KEY = new Set(['bon-hoa', 'phap-bao']);

/** Prop mà `text` là NỘI DUNG HỌC (được có chữ Hán — R-HUD-4): bia khắc thơ ở Vườn Bia (Hán + pinyin + nghĩa Việt). */
const TEXT_IS_LESSON = new Set(['bia', 'bia-rua']);

/**
 * Chuỗi có chữ Hán ở chỗ hiện trong game (biển, cờ, cổng, tên nơi / khu, vòng trận, tên NPC…) — R-HUD-4: chỉ tiếng Việt.
 * Bỏ qua: `site.han`, `site.areas[].han` (dữ liệu giữ, không hiển thị); `text` của prop là mã hình (`TEXT_IS_KEY`);
 * `buildings[].notice` (bảng bài học — nội dung học); `text` của bia khắc thơ (`TEXT_IS_LESSON`).
 */
export function hanOnDisplay(s: SceneSpec): { path: string; text: string }[] {
  const out: { path: string; text: string }[] = [];
  const walk = (v: unknown, path: string): void => {
    if (typeof v === 'string') {
      if (/\p{Script=Han}/u.test(v)) out.push({ path, text: v });
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (isObj(v)) for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k);
  };
  walk(s, '');
  return out.filter(({ path }) => {
    if (/^site(\.areas\[\d+\])?\.han$/.test(path) || /^buildings\[\d+\]\.notice/.test(path)) return false;
    const m = /^props\[(\d+)\]\.text$/.exec(path);
    if (!m) return true;
    const kind = s.props[Number(m[1])].kind;
    return !(TEXT_IS_KEY.has(kind) || TEXT_IS_LESSON.has(kind));
  });
}

/** Nửa bề ngang chỗ hạc chiếm khi đáp (m, cánh xếp) — bãi đáp phải cách nhà / ao chừng này. */
const CRANE_CLEAR = 1.3;

/**
 * Bãi đáp hạc (R-HANH-5): tới cảnh bằng bản đồ truyền tống → hạc đáp `crane.padOffset` m bên phải chỗ xuất phát (hướng
 * nhìn mặc định: bắc). Kiểm ở mọi cảnh, kể cả cảnh không có vòng trận (Nhà của ta — V-47): bản đồ ở nơi khác vẫn tới
 * được. Bãi đáp không nằm trong nhà / ao (độ phẳng: `checkOnFlatGround`).
 */
export function craneProblems(s: SceneSpec): string[] {
  const out: string[] = [];
  const c = s.crane;
  if (!(c.scale >= 0.3 && c.scale <= 3)) out.push(`crane.scale: 0,3–3 (đang ${c.scale})`);
  if (!(c.padOffset >= 0 && c.padOffset <= 10)) out.push(`crane.padOffset: 0–10 m (đang ${c.padOffset})`);
  const [px, pz] = landingPad(s.player.start, START_HEADING, c.padOffset);
  const r = CRANE_CLEAR * c.scale;
  const where = `crane: bãi đáp (${px.toFixed(1)}; ${pz.toFixed(1)})`;
  for (const b of s.buildings) {
    // gian trong (cảnh "Trong nhà" — V-68): không có trên bản đồ truyền tống, hạc không bao giờ đáp ở đây
    if (b.kind === 'gian-trong') continue;
    const [w, d] = (b.rotY ?? 0) % 180 !== 0 ? [b.d, b.w] : [b.w, b.d];
    if (Math.abs(px - b.x) < w / 2 + r && Math.abs(pz - b.z) < d / 2 + r) out.push(`${where} nằm trong nhà "${b.id}" — đổi crane.padOffset hoặc dời player.start`);
  }
  for (const w of s.water) {
    const inside = w.r !== undefined ? Math.hypot(px - w.x, pz - w.z) < w.r + r : Math.abs(px - w.x) < (w.w ?? 0) / 2 + r && Math.abs(pz - w.z) < (w.d ?? 0) / 2 + r;
    if (inside) out.push(`${where} nằm trong ao (${w.x}; ${w.z})`);
  }
  return out;
}
const checkCrane = craneProblems;

/** Vòng trận (R-HANH-2): nằm trong sân; chỗ xuất phát của cảnh không nằm trong vòng (phải bước vào mới truyền tống). */
function checkTeleport(s: SceneSpec): string[] {
  const out: string[] = [];
  const tp = s.teleport;
  const yard = s.stoneYard;
  if (yard.enabled && (yard.radius < 2 || yard.radius > 8)) out.push('stoneYard.radius: 2 … 8 m');
  if (!tp.enabled) return out;
  if (tp.ringRadius <= 0) out.push('teleport.ringRadius: phải > 0');
  // chữ khắc giữa vòng: rỗng = hoa văn; có thì tên Việt ngắn (chữ Hán bị `hanOnDisplay` bắt — R-HUD-4)
  if ([...tp.text].length > 14) out.push(`teleport.text: tối đa 14 ký tự (đang là "${tp.text}")`);
  if (tp.radius > 0 && tp.ringRadius + 0.6 > tp.radius) out.push('teleport: vòng trận chạm viền sân (ringRadius + 0,6 > radius)');
  const d = Math.hypot(s.player.start[0] - tp.center[0], s.player.start[1] - tp.center[1]);
  if (d < ringTrigger(tp) + 1) out.push(`teleport: chỗ xuất phát (player.start) cách tâm vòng ${d.toFixed(1)} m — dời ra ngoài vòng (≥ ${ringTrigger(tp) + 1} m)`);
  const dz = tp.dais;
  if (s.stoneYard.enabled) out.push('stoneYard: cảnh có vòng trận thì không cần sân đá trống (V-65: sân đá thay vòng ở vùng)');
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

/** Sân đá trống (V-65) phải trống — bãi hạc đáp: không vật, cây, bàn, NPC, ô trang trí nào đứng trên sân. */
export function checkStoneYardEmpty(s: SceneSpec): string[] {
  const y = s.stoneYard;
  if (!y.enabled) return [];
  const [cx, cz] = y.center;
  const on = (x: number, z: number, pad = 0): boolean => Math.hypot(x - cx, z - cz) < y.radius + pad;
  const out: string[] = [];
  const hit = (what: string): number => out.push(`stoneYard: ${what} đứng trên sân đá trống — dời ra ngoài (tâm (${cx}; ${cz}), bán kính ${y.radius} m)`);
  for (const p of s.props) if (on(p.x, p.z, 0.3)) hit(`vật "${p.kind}" (${p.x}; ${p.z})`);
  for (const t of s.gameTables) if (on(t.x, t.z, 1)) hit(`bàn chơi "${t.id}"`);
  for (const n of s.npcs) if (on(n.x, n.z, 0.3)) hit(`NPC "${n.id}"`);
  for (const t of s.trees.yard) if (on(t.x, t.z, 0.5)) hit(`cây (${t.x}; ${t.z})`);
  for (const g of s.trees.groves) {
    // điểm gần tâm sân nhất trong khóm (hình chữ nhật trục)
    const nx = Math.max(g.x - g.w / 2, Math.min(cx, g.x + g.w / 2));
    const nz = Math.max(g.z - g.d / 2, Math.min(cz, g.z + g.d / 2));
    if (on(nx, nz)) hit(`khóm cây (${g.x}; ${g.z})`);
  }
  for (const b of s.buildings) {
    const half = Math.max(b.w, b.d) / 2 + y.radius; // thô: bỏ qua hướng nhà
    if (Math.abs(b.x - cx) < half && Math.abs(b.z - cz) < half) hit(`nhà "${b.id}"`);
  }
  return out;
}

/** Dây đèn lồng: đèn thấp nhất (giữa dây, kể thân đèn ~0,7 m) phải cao hơn đầu người để đi dưới không vướng mắt. */
function checkLanterns(s: SceneSpec): string[] {
  const out: string[] = [];
  const st = s.lanternStyle;
  if (!s.lanternStrings.length) return out;
  if (st.spacing < 0.8) out.push('lanternStyle.spacing: ≥ 0,8 m');
  if (st.sag < 0) out.push('lanternStyle.sag: ≥ 0');
  if (!(HANG_KINDS as readonly string[]).includes(st.hang)) out.push(`lanternStyle.hang: một trong ${HANG_KINDS.join(', ')}`);
  const low = st.hang === 'tua' ? Math.max(st.drop, st.lanternEvery > 0 ? 0.7 : 0) : 0.7;
  if (st.height - st.sag - low < 2.4) out.push('lanternStyle: vật treo thấp nhất dưới 2,4 m — tăng height hoặc giảm sag / drop');
  if (st.drop <= 0) out.push('lanternStyle.drop: > 0');
  if (s.fences.length && (s.fenceStyle.height <= 0 || s.fenceStyle.postEvery < 0.5)) out.push('fenceStyle: height > 0, postEvery ≥ 0,5');
  if (!FENCE_KINDS.includes(s.fenceStyle.kind)) out.push(`fenceStyle.kind: chỉ ${FENCE_KINDS.join(' · ')}`);
  if (s.ground.variation < 0 || s.ground.variation > 0.4) out.push('ground.variation: 0 … 0,4');
  const pe = s.buildingStyle.pathEdge;
  if (pe.width < 0 || pe.width > 1 || pe.height < 0 || pe.height > 0.3) out.push('buildingStyle.pathEdge: width 0 … 1, height 0 … 0,3 (gờ thấp)');
  s.lanternStrings.forEach((l, i) => {
    if (Math.hypot(l.to[0] - l.from[0], l.to[1] - l.from[1]) < 2) out.push(`lanternStrings[${i}]: dây ngắn hơn 2 m`);
  });
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
  // kênh có kè (`sunk`): lòng kênh là bục thấp có chủ ý — không đòi phẳng
  for (const w of s.water.filter((w) => !w.sunk)) flat(`ao (${w.x}; ${w.z})`, box(w.x, w.z, w.r !== undefined ? w.r * 2 : (w.w ?? 0), w.r !== undefined ? w.r * 2 : (w.d ?? 0), w.rotY));
  for (const t of s.gameTables) flat(`bàn chơi "${t.id}"`, box(t.x, t.z, (t.boards ?? 1) * GAME_SLOT + 1, 4, t.rotY));
  for (const t of s.gameTables) if (t.sign) flat(`biển bàn "${t.id}"`, box(t.sign.x, t.sign.z, 2, 1, t.sign.rotY));
  for (const g of gardenFootprints(s.garden)) flat(g.what, box(g.x, g.z, g.w, g.d));
  if (s.well.enabled) flat('giếng', box(s.well.x, s.well.z, 2.4, 2.4));
  const hw = s.walls.half;
  if (s.walls.enabled) flat('tường bao', [[-hw, -hw], [hw, -hw], [-hw, hw], [hw, hw], [0, -hw], [0, hw], [-hw, 0], [hw, 0]]);
  const tp = s.teleport;
  const pad = Math.max(tp.radius, tp.ringRadius + 0.7, tp.dais.tiers > 0 ? daisLayout(tp).footprint : 0) * 2;
  if (tp.enabled) flat('vòng trận (teleport)', box(tp.center[0], tp.center[1], pad, pad));
  const yard = s.stoneYard;
  if (yard.enabled) flat('sân đá trống (stoneYard)', box(yard.center[0], yard.center[1], yard.radius * 2, yard.radius * 2));
  for (const t of s.terraces) flat(`đài đá (${t.x}; ${t.z})`, box(t.x, t.z, t.w, t.d, t.rotY));
  s.fences.forEach((w, i) => flat(`fences[${i}]`, [w.from, w.to, [(w.from[0] + w.to[0]) / 2, (w.from[1] + w.to[1]) / 2]]));
  for (const b of s.bridges) {
    const [ex, ez] = rotateXZ(0, b.length / 2, b.rotY ?? 0);
    const ends = [[b.x - ex, b.z - ez], [b.x + ex, b.z + ez]] as XZ[];
    if (b.kind === 'tau') {
      flat(`đầu cầu tàu (${ends[0][0]}; ${ends[0][1]})`, box(...ends[0], 1, 1));
      continue;
    }
    for (const [x, z] of ends) flat(`đầu cầu (${x}; ${z})`, box(x, z, 1, 1));
    const dy = Math.abs(h(...ends[0]) - h(...ends[1]));
    if (dy > FLAT_TOLERANCE) out.push(`cầu (${b.x}; ${b.z}): hai đầu chênh ${dy.toFixed(1)} m — hai bờ phải cùng độ cao`);
  }
  s.wallSegments.forEach((w, i) => !w.follow && flat(`wallSegments[${i}]`, [w.from, w.to, [(w.from[0] + w.to[0]) / 2, (w.from[1] + w.to[1]) / 2]]));
  flat('điểm xuất phát (player.start)', box(s.player.start[0], s.player.start[1], 2, 2));
  flat('bãi đáp hạc (crane)', box(...landingPad(s.player.start, START_HEADING, s.crane.padOffset), 2, 2));
  s.portals.forEach((p, i) => flat(`portals[${i}] chỗ đứng (arrive)`, box(p.arrive.at[0], p.arrive.at[1], 2, 2)));
  // vòng sáng nằm phẳng trên mặt đất ở giữa vùng chạm (R-HANH-4) — vùng chạm phải phẳng, không vắt sườn / mép vực
  s.portals.forEach((p, i) => {
    const [a, b] = [p.area.from, p.area.to];
    flat(`portals[${i}] vùng chạm (area)`, box((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])));
  });
  return out;
}
