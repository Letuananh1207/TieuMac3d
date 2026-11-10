/**
 * Đặc tả cảnh: mọi thứ phiên thiết kế quyết (vị trí, kích thước, màu, đèn, camera).
 * Nguồn: `design/scene/scene.json` (đọc ở `loadSpec.ts`, kiểm ở `specCheck.ts`); thiếu file / thiếu trường →
 * `DEFAULT_SCENE` = cảnh gốc. File này thuần dữ liệu (không three, không DOM) để `vite.config.ts` import được.
 * Màu "#rrggbb"; góc `rotY` tính bằng độ (vật có va chạm: bội 90); `pitch` camera radian; toạ độ [x, z] mét.
 */

export type XZ = [number, number];

export const BUILDING_KINDS = ['giang-duong', 'dien', 'thap', 'nha-nho'] as const;
export const ROOF_KINDS = ['chop', 'cong'] as const;
export const SIDES = ['bac', 'nam', 'dong', 'tay'] as const;
export const PROP_KINDS = ['dai-ti-thi', 'gia-binh-khi', 'luong-thuoc', 'lo-dan'] as const;
export const TREE_KINDS = ['tan', 'truc'] as const;

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
  /** kiểu nhà: giảng đường (mặc định) · điện lớn mái hai tầng · tháp nhiều tầng · nhà nhỏ đệ tử */
  kind?: (typeof BUILDING_KINDS)[number];
  /** mái chóp (mặc định) · mái cong đầu đao */
  roof?: (typeof ROOF_KINDS)[number];
  /** số tầng của tháp (2–9, mặc định 5) */
  floors?: number;
}

export interface CameraView {
  dist: number;
  /** góc ngẩng, radian */
  pitch: number;
}

/** Khe cổng trên vòng tường: cạnh, tâm khe dọc theo cạnh (x với bắc/nam, z với đông/tây), rộng. */
export interface WallGate {
  side: (typeof SIDES)[number];
  at: number;
  width: number;
}

/** Đoạn tường thêm, thẳng trục (from / to cùng x hoặc cùng z), dày 1, màu như tường bao. */
export interface WallSegment {
  from: XZ;
  to: XZ;
  height?: number;
}

/** Lối lát đá: dải nền từ `from` tới `to`, góc tự do, không va chạm. */
export interface PathSpec {
  from: XZ;
  to: XZ;
  width: number;
  color?: string;
}

/** Cổng sơn môn: mái, hai cột, bảng hiệu; mặt trước nhìn +z trước khi quay. Va chạm chỉ ở hai cột. */
export interface GateSpec {
  id: string;
  x: number;
  z: number;
  rotY?: number;
  /** khoảng trống giữa hai cột */
  width: number;
  title: string;
}

/** Ao / hồ: tròn (`r`) hoặc chữ nhật (`w` × `d`); không đi xuống được. */
export interface WaterSpec {
  x: number;
  z: number;
  r?: number;
  w?: number;
  d?: number;
  rotY?: number;
}

export interface PropSpec {
  kind: (typeof PROP_KINDS)[number];
  x: number;
  z: number;
  rotY?: number;
  scale?: number;
}

/** Cụm cây rải ngẫu nhiên (theo `trees.seed`) trong hình chữ nhật tâm (x, z). */
export interface GroveSpec {
  kind: (typeof TREE_KINDS)[number];
  x: number;
  z: number;
  w: number;
  d: number;
  count: number;
  /** có va chạm không (mặc định có) */
  collide?: boolean;
}

export interface TreePlace {
  x: number;
  z: number;
  scale: number;
  kind?: (typeof TREE_KINDS)[number];
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
  /** tường bao: nằm ở ±half; `gates` = khe chừa lối đi */
  walls: { half: number; height: number; color: string; brickHue: number; capColor: string; gates: WallGate[] };
  wallSegments: WallSegment[];
  paths: PathSpec[];
  /** màu chung (từng nhà chỉ đổi màu mái); `water` mặt ao, `stone` bờ đá / chân cổng / đài, `path` lối lát,
   *  `bronze` lò đan / chóp tháp, `herb` cây thuốc, `smoke` khói lò */
  buildingStyle: {
    base: string;
    floor: string;
    wall: string;
    pillar: string;
    ridge: string;
    eave: string;
    lantern: string;
    stone: string;
    water: string;
    path: string;
    bronze: string;
    herb: string;
    smoke: string;
  };
  buildings: BuildingSpec[];
  gates: GateSpec[];
  water: WaterSpec[];
  props: PropSpec[];
  trees: {
    trunk: string;
    leaves: [string, string, string];
    /** thân và lá trúc */
    bamboo: [string, string];
    /** cây lẻ, có va chạm */
    yard: TreePlace[];
    groves: GroveSpec[];
    /** vòng cây ngoài tường, chỉ trang trí */
    ring: { count: number; radius: number; spread: number; scaleMin: number; scaleMax: number };
    /** hạt giống ngẫu nhiên: cùng số → cây giống hệt nhau trên Canvas 3D và trong app */
    seed: number;
  };
  well: { x: number; z: number; stone: string; water: string };
  /** đảo đá lơ lửng (chỉ ngắm) + mây trôi quanh tâm cảnh ở độ cao `height` */
  floating: {
    islands: { x: number; y: number; z: number; scale: number }[];
    clouds: { count: number; height: number; radius: number; speed: number; color: string };
  };
  player: { start: XZ };
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
  walls: { half: 21, height: 2.6, color: '#4a2b24', brickHue: 8, capColor: '#6e2f26', gates: [] },
  wallSegments: [],
  paths: [],
  buildingStyle: {
    base: '#77706a',
    floor: '#8a5a3c',
    wall: '#e9dcc0',
    pillar: '#3a2418',
    ridge: '#4a2a20',
    eave: '#3a2418',
    lantern: '#ff6a3d',
    stone: '#8d877f',
    water: '#2b4a6a',
    path: '#7d726a',
    bronze: '#8a6a3a',
    herb: '#5f9a48',
    smoke: '#d8d4cc',
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
  gates: [],
  water: [],
  props: [],
  trees: {
    trunk: '#4a3222',
    leaves: ['#2f4a2c', '#37552f', '#26402a'],
    bamboo: ['#7d9a4a', '#4f7a35'],
    yard: [
      { x: 14, z: -14, scale: 1.2 },
      { x: 15, z: 12, scale: 1.1 },
      { x: -15, z: 15, scale: 1.3 },
      { x: 8, z: 8, scale: 0.9 },
      { x: -6, z: 12, scale: 1 },
    ],
    groves: [],
    ring: { count: 26, radius: 25, spread: 6, scaleMin: 1.6, scaleMax: 2.4 },
    seed: 7,
  },
  well: { x: 6, z: 2, stone: '#6c6660', water: '#2b4a6a' },
  floating: {
    islands: [],
    clouds: { count: 0, height: 26, radius: 60, speed: 0.6, color: '#d9dce8' },
  },
  player: { start: [0, 6] },
  camera: { fov: 55, minDist: 5, maxDist: 22, near: { dist: 9, pitch: 0.42 }, far: { dist: 17, pitch: 0.75 } },
};

/* ---------------- suy ra từ đặc tả ---------------- */

/** Vị trí một vùng sự kiện, tính từ nhà nó neo vào. Trùng hình với `zones/ZoneAnchor`. */
export interface ZoneAnchor {
  id: string;
  x: number;
  z: number;
  r: number;
}

const round6 = (v: number): number => Math.round(v * 1e6) / 1e6;

/** Điểm (dx, dz) trong hệ của vật, quay `rotDeg` độ quanh trục đứng (như three: +z của vật → +x khi quay 90). */
export function rotateXZ(dx: number, dz: number, rotDeg: number): XZ {
  const a = (rotDeg * Math.PI) / 180;
  const s = Math.sin(a);
  const c = Math.cos(a);
  return [round6(dx * c + dz * s), round6(-dx * s + dz * c)];
}

/** Tâm vùng = tâm nhà + `front` theo hướng mặt trước (+z của nhà, quay `rotY`). */
export function zoneAnchors(buildings: BuildingSpec[]): ZoneAnchor[] {
  return buildings.flatMap((b) => {
    if (!b.zone) return [];
    const [dx, dz] = rotateXZ(0, b.zone.front, b.rotY ?? 0);
    return [{ id: b.zone.id, x: round6(b.x + dx), z: round6(b.z + dz), r: b.zone.r }];
  });
}
