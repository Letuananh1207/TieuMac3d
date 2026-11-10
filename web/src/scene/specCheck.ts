/**
 * Kiểm + ghép file đặc tả cảnh lên `DEFAULT_SCENE`. Sai / thiếu một trường → giữ giá trị mặc định của trường đó và
 * ghi vào `problems`; phần tử danh sách sai → bỏ phần tử đó. Không three, không DOM (chạy được trong node).
 */
import {
  BUILDING_KINDS,
  DEFAULT_SCENE,
  PROP_KINDS,
  ROOF_KINDS,
  SIDES,
  TREE_KINDS,
  WALL_STYLES,
  type BuildingSpec,
  type SceneSpec,
} from './spec';

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

/** Danh sách dài ngắn tuỳ ý trong đặc tả: đường dẫn → cách đọc một phần tử. Mảng khác = bộ cố định. */
const LISTS: Record<string, ItemParser> = {
  buildings: item(
    { id: '', x: 0, z: 0, w: 0, d: 0, title: '', roofColor: '#000000' },
    { rotY: 0, notice: ['', ''], zone: { id: '', front: 0, r: 0 }, kind: '', roof: '', floors: 0 },
    all(rot, oneOf('kind', BUILDING_KINDS), oneOf('roof', ROOF_KINDS), floorsRange, positive('w', 'd')),
  ),
  'walls.gates': item({ side: '', at: 0, width: 0 }, {}, all(oneOf('side', SIDES), positive('width'))),
  wallSegments: item({ from: XZ0, to: XZ0 }, { height: 0 }, all(axisAligned, positive('height'))),
  paths: item({ from: XZ0, to: XZ0, width: 0 }, { color: '#000000' }, positive('width')),
  gates: item({ id: '', x: 0, z: 0, width: 0, title: '' }, { rotY: 0, hanTitle: '', roofColor: '#000000' }, all(rot, positive('width'))),
  'site.areas': item({ name: '', from: XZ0, to: XZ0 }),
  water: item({ x: 0, z: 0 }, { r: 0, w: 0, d: 0, rotY: 0 }, all(waterShape, rot, positive('r', 'w', 'd'))),
  props: item({ kind: '', x: 0, z: 0 }, { rotY: 0, scale: 0 }, all(oneOf('kind', PROP_KINDS), rot, positive('scale'))),
  'trees.yard': item({ x: 0, z: 0, scale: 0 }, { kind: '' }, all(oneOf('kind', TREE_KINDS), positive('scale'))),
  'trees.groves': item(
    { kind: '', x: 0, z: 0, w: 0, d: 0, count: 0 },
    { collide: true },
    all(oneOf('kind', TREE_KINDS), positive('w', 'd', 'count')),
  ),
  'floating.islands': item({ x: 0, y: 0, z: 0, scale: 0 }, {}, positive('scale')),
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
  if (s.camera.minDist > s.camera.maxDist) out.push('camera: minDist phải ≤ maxDist');
  if (s.trees.ring.scaleMin > s.trees.ring.scaleMax) out.push('trees.ring: scaleMin phải ≤ scaleMax');
  for (const g of s.walls.gates) {
    if (Math.abs(g.at) + g.width / 2 > s.walls.half) {
      out.push(`walls.gates (cạnh ${g.side}, at ${g.at}): khe vượt quá cạnh tường (±${s.walls.half})`);
    }
  }
  if (s.floating.clouds.count < 0) out.push('floating.clouds.count: phải ≥ 0');
  if (!WALL_STYLES.includes(s.walls.style)) out.push(`walls.style: chỉ ${WALL_STYLES.join(' · ')}`);
  if (s.walls.windows < 0) out.push('walls.windows: phải ≥ 0');
  return out;
}
