/**
 * Đặc tả cảnh: mọi thứ phiên thiết kế quyết (vị trí, kích thước, màu, đèn, camera).
 * Nguồn: `design/scene/scene.json` (đọc ở `loadSpec.ts`); thiếu file / thiếu trường → `DEFAULT_SCENE` = cảnh gốc.
 * File này thuần dữ liệu (không three, không DOM) để `vite.config.ts` cũng import được.
 * Màu viết "#rrggbb"; góc nhà `rotY` tính bằng độ; `pitch` camera tính bằng radian.
 */

export interface BuildingSpec {
  /** mã nhà, duy nhất */
  id: string;
  x: number;
  z: number;
  /** rộng (trục x trước khi xoay) */
  w: number;
  /** sâu (trục z trước khi xoay); mặt trước (cửa, biển) nhìn về +z */
  d: number;
  /** 0 · 90 · 180 · 270 độ — va chạm là hộp thẳng trục nên chỉ quay được bội 90 */
  rotY?: number;
  title: string;
  /** bảng giấy nhỏ cạnh cửa: [dòng 1, dòng 2] */
  notice?: [string, string];
  roofColor: string;
  /** vùng sự kiện trước cửa: tâm cách tâm nhà `front` đơn vị theo hướng mặt trước, bán kính `r` */
  zone?: { id: string; front: number; r: number };
}

export interface CameraView {
  dist: number;
  /** góc ngẩng, radian */
  pitch: number;
}

export interface SceneSpec {
  /** trời: dải màu từ đỉnh xuống chân trời (điểm giữa ở 55%) */
  sky: { top: string; middle: string; horizon: string };
  fog: { color: string; near: number; far: number };
  light: {
    skyColor: string;
    groundColor: string;
    hemiIntensity: number;
    sunColor: string;
    sunIntensity: number;
    sunPosition: [number, number, number];
  };
  ground: { size: number; color: string; brickHue: number };
  /** tường bao: nằm ở ±half */
  walls: { half: number; height: number; color: string; brickHue: number; capColor: string };
  /** màu chung của mọi giảng đường (từng nhà chỉ đổi màu mái) */
  buildingStyle: {
    base: string;
    floor: string;
    wall: string;
    pillar: string;
    ridge: string;
    eave: string;
    lantern: string;
  };
  buildings: BuildingSpec[];
  trees: {
    trunk: string;
    leaves: [string, string, string];
    /** cây trong sân, có va chạm */
    yard: { x: number; z: number; scale: number }[];
    /** vòng cây ngoài tường, chỉ trang trí */
    ring: { count: number; radius: number; spread: number; scaleMin: number; scaleMax: number };
    /** hạt giống ngẫu nhiên: cùng số → cây giống hệt nhau trên Canvas 3D và trong app */
    seed: number;
  };
  well: { x: number; z: number; stone: string; water: string };
  player: { start: [number, number] };
  camera: { fov: number; minDist: number; maxDist: number; near: CameraView; far: CameraView };
}

export const DEFAULT_SCENE: SceneSpec = {
  sky: { top: '#0f1730', middle: '#33476e', horizon: '#8a7a86' },
  fog: { color: '#2c3a58', near: 28, far: 70 },
  light: {
    skyColor: '#bcc8ff',
    groundColor: '#4a3326',
    hemiIntensity: 0.75,
    sunColor: '#ffd8a8',
    sunIntensity: 0.85,
    sunPosition: [-12, 20, 8],
  },
  ground: { size: 90, color: '#5b3f37', brickHue: 10 },
  walls: { half: 21, height: 2.6, color: '#4a2b24', brickHue: 8, capColor: '#6e2f26' },
  buildingStyle: {
    base: '#77706a',
    floor: '#8a5a3c',
    wall: '#e9dcc0',
    pillar: '#3a2418',
    ridge: '#4a2a20',
    eave: '#3a2418',
    lantern: '#ff6a3d',
  },
  buildings: [
    {
      id: 'giang-duong',
      x: 0,
      z: -11,
      w: 13,
      d: 7,
      title: 'Lớp HSK 3',
      notice: ['Buổi tối', 'chữ 快'],
      roofColor: '#8a3b2c',
      zone: { id: 'lop-hsk3', front: 4.6, r: 2.6 },
    },
    {
      id: 'thu-vien',
      x: -12.5,
      z: 4,
      w: 7,
      d: 6,
      rotY: 90,
      title: 'Thư viện',
      roofColor: '#5f3a2a',
      zone: { id: 'thu-vien', front: 3.9, r: 2.4 },
    },
  ],
  trees: {
    trunk: '#4a3222',
    leaves: ['#2f4a2c', '#37552f', '#26402a'],
    yard: [
      { x: 14, z: -14, scale: 1.2 },
      { x: 15, z: 12, scale: 1.1 },
      { x: -15, z: 15, scale: 1.3 },
      { x: 8, z: 8, scale: 0.9 },
      { x: -6, z: 12, scale: 1 },
    ],
    ring: { count: 26, radius: 25, spread: 6, scaleMin: 1.6, scaleMax: 2.4 },
    seed: 7,
  },
  well: { x: 6, z: 2, stone: '#6c6660', water: '#2b4a6a' },
  player: { start: [0, 6] },
  camera: { fov: 55, minDist: 5, maxDist: 22, near: { dist: 9, pitch: 0.42 }, far: { dist: 17, pitch: 0.75 } },
};

/* ---------------- kiểm dữ liệu ---------------- */

export interface ResolvedScene {
  spec: SceneSpec;
  /** từng chỗ sai trong file (đã thay bằng giá trị mặc định); rỗng = file đúng */
  problems: string[];
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const ROTATIONS = [0, 90, 180, 270];

function isObj(v: unknown): v is Record<string, unknown> {
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
    // mảng trong khuôn = bộ cố định số phần tử (toạ độ, 3 màu lá…)
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
    const res: Record<string, unknown> = {};
    for (const k of Object.keys(def)) res[k] = merge(def[k], raw[k], at(k), out);
    return res;
  }
  return def;
}

/** Một phần tử danh sách: mọi trường của `required` bắt buộc; thiếu / sai → bỏ cả phần tử. */
function parseItem<T>(
  required: Record<string, unknown>,
  optional: Record<string, unknown>,
  raw: unknown,
  path: string,
  out: string[],
): T | null {
  if (!isObj(raw)) {
    out.push(`${path}: cần một object — bỏ`);
    return null;
  }
  const local: string[] = [];
  for (const k of Object.keys(required)) if (raw[k] === undefined) local.push(`${path}.${k}: thiếu`);
  const res: Record<string, unknown> = {};
  for (const k of Object.keys(required)) res[k] = merge(required[k], raw[k], `${path}.${k}`, local);
  for (const k of Object.keys(optional)) if (raw[k] !== undefined) res[k] = merge(optional[k], raw[k], `${path}.${k}`, local);
  for (const k of Object.keys(raw)) if (!(k in required) && !(k in optional)) out.push(`${path}.${k}: trường lạ, bỏ qua`);
  if (local.length) {
    out.push(...local, `${path}: bỏ phần tử này`);
    return null;
  }
  return res as T;
}

function parseList<T>(
  raw: unknown,
  def: T[],
  path: string,
  out: string[],
  parse: (item: unknown, path: string) => T | null,
): T[] {
  if (raw === undefined) return def;
  if (!Array.isArray(raw)) {
    out.push(`${path}: cần một mảng`);
    return def;
  }
  return raw.map((it, i) => parse(it, `${path}[${i}]`)).filter((it): it is T => it !== null);
}

function parseBuilding(raw: unknown, path: string, out: string[]): BuildingSpec | null {
  const b = parseItem<BuildingSpec>(
    { id: '', x: 0, z: 0, w: 0, d: 0, title: '', roofColor: '#000000' },
    { rotY: 0, notice: ['', ''], zone: { id: '', front: 0, r: 0 } },
    raw,
    path,
    out,
  );
  if (b && b.rotY !== undefined && !ROTATIONS.includes(b.rotY)) {
    out.push(`${path}.rotY: chỉ 0 · 90 · 180 · 270 — dùng 0`);
    b.rotY = 0;
  }
  return b;
}

/** Kiểm + ghép nội dung file đặc tả lên `DEFAULT_SCENE`. `raw === undefined` = chưa có file. */
export function resolveSceneSpec(raw: unknown): ResolvedScene {
  const problems: string[] = [];
  if (raw === undefined) return { spec: DEFAULT_SCENE, problems };
  if (!isObj(raw)) return { spec: DEFAULT_SCENE, problems: ['scene.json: cần một object — dùng cảnh mặc định'] };

  const { buildings, trees, ...rest } = raw;
  const { buildings: defB, trees: defT, ...defRest } = DEFAULT_SCENE;
  // merge giữ đúng hình của khuôn, nên ép kiểu về khuôn là an toàn
  const base = merge(defRest, rest, '', problems) as typeof defRest;

  let treeObj: Record<string, unknown> = {};
  if (isObj(trees)) treeObj = trees;
  else if (trees !== undefined) problems.push('trees: cần một object');
  const { yard, ...treeRest } = treeObj;
  const { yard: defYard, ...defTreeRest } = defT;
  const treeBase = merge(defTreeRest, treeRest, 'trees', problems) as typeof defTreeRest;
  const yardTrees = parseList(yard, defYard, 'trees.yard', problems, (it, p) =>
    parseItem<SceneSpec['trees']['yard'][number]>({ x: 0, z: 0, scale: 0 }, {}, it, p, problems),
  );

  const list = parseList(buildings, defB, 'buildings', problems, (it, p) => parseBuilding(it, p, problems));
  const spec: SceneSpec = { ...base, buildings: list, trees: { ...treeBase, yard: yardTrees } };
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
    s.buildings.map((b) => b.id),
    'mã nhà',
  );
  dup(
    s.buildings.flatMap((b) => (b.zone ? [b.zone.id] : [])),
    'mã vùng',
  );
  if (s.fog.near >= s.fog.far) out.push('fog: near phải nhỏ hơn far');
  if (s.camera.minDist > s.camera.maxDist) out.push('camera: minDist phải ≤ maxDist');
  if (s.trees.ring.scaleMin > s.trees.ring.scaleMax) out.push('trees.ring: scaleMin phải ≤ scaleMax');
  return out;
}

/* ---------------- suy ra từ đặc tả ---------------- */

/** Vị trí một vùng sự kiện, tính từ nhà nó neo vào. Trùng hình với `zones/ZoneAnchor`. */
export interface ZoneAnchor {
  id: string;
  x: number;
  z: number;
  r: number;
}

const round6 = (v: number): number => Math.round(v * 1e6) / 1e6;

/** Tâm vùng = tâm nhà + `front` theo hướng mặt trước (+z của nhà, quay `rotY`). */
export function zoneAnchors(buildings: BuildingSpec[]): ZoneAnchor[] {
  return buildings.flatMap((b) => {
    if (!b.zone) return [];
    const a = ((b.rotY ?? 0) * Math.PI) / 180;
    return [{ id: b.zone.id, x: round6(b.x + Math.sin(a) * b.zone.front), z: round6(b.z + Math.cos(a) * b.zone.front), r: b.zone.r }];
  });
}
