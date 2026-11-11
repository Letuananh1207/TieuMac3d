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
export const PROP_KINDS = [
  'dai-ti-thi',
  'gia-binh-khi',
  'luong-thuoc',
  'lo-dan',
  'da-thai-ho',
  'den-da',
  'dinh-dong',
] as const;
export const TREE_KINDS = ['tan', 'truc', 'tung', 'lieu', 'mai'] as const;
export const WALL_STYLES = ['gach', 'voi'] as const;

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
  /** biển chữ Hán giữa cổng (vd. "文淵宗"); thiếu thì biển ghi `title` */
  hanTitle?: string;
  /** màu ba mái nhỏ (ngói lưu ly lục); thiếu thì `buildingStyle.eave` */
  roofColor?: string;
}

/** Một khu có tên (hình chữ nhật từ góc `from` tới góc `to`) — chip HUD hiện tên khu đang đứng (R-HUD-1). */
export interface AreaSpec {
  name: string;
  /** chữ Hán của khu trên thẻ tên khu (R-HUD-3), vd. "外門"; thiếu thì thẻ chỉ hiện tên Việt */
  han?: string;
  from: XZ;
  to: XZ;
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

/** Bục phẳng (khu): đất trong hình chữ nhật `from`–`to` ép phẳng ở độ cao `y`; `pave` = lát gạch như sân. */
export interface PlateauSpec {
  from: XZ;
  to: XZ;
  y: number;
  pave?: boolean;
  /** khoảng chuyển (m) từ mép bục ra đất tự nhiên; thiếu thì `terrain.blend`. Nhỏ (≤ 1) = kè đá dựng đứng */
  blend?: number;
}

/** Đỉnh núi / đồi cộng vào địa hình: cao `h` ở tâm, thoải dần tới bán kính `r`. */
export interface PeakSpec {
  x: number;
  z: number;
  r: number;
  h: number;
}

/**
 * Bậc đá thẳng từ `from` lên `to`, rộng `width`: đất dọc bậc ép thành dốc đều giữa độ cao tự nhiên hai đầu (bục ở
 * đầu nào thì lấy độ cao bục), mỗi bậc cao ≈ 0,18 m. Dốc trung bình phải ≤ 35° (R-VA-2) — `scene:check` báo nếu quá.
 */
export interface StairSpec {
  from: XZ;
  to: XZ;
  width: number;
}

/** Thác: dải nước dựng đứng rộng `width` tại (x, z), đỉnh ở độ cao `top`, chân ở `bottom`; mặt nước quay `rotY` độ (0 = nhìn +z). */
export interface WaterfallSpec {
  x: number;
  z: number;
  top: number;
  bottom: number;
  width: number;
  rotY?: number;
}

/** Suối: dải nước uốn theo mặt đất qua các điểm `points`, rộng `width`; không va chạm (cạn, lội qua được). */
export interface StreamSpec {
  points: XZ[];
  width: number;
}

/** Một lớp núi xa (chỉ ngắm, không sương): vòng răng cưa bán kính `radius` quanh tâm địa hình. */
export interface MountainLayer {
  radius: number;
  /** đỉnh cao nhất của lớp (so với y = 0) */
  height: number;
  color: string;
  /** số đỉnh nhô quanh vòng */
  peaks: number;
  /** hệ số bề ngang đỉnh (1 = như cũ; 2 = đỉnh rộng chân gấp đôi, sườn thoải hơn) */
  width?: number;
  /** số đỉnh phụ mỗi bên đỉnh chính (thấp hơn, nằm trên sườn); 0 = không */
  spurs?: number;
}

export interface SceneSpec {
  /** tên nơi + các khu cho chip HUD; khu khai báo trước thắng khi chồng nhau */
  /** `han`: chữ Hán tên nơi trên màn tải (R-MAN-2), rỗng = chỉ tên Việt */
  site: { name: string; han: string; areas: AreaSpec[] };
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
  /**
   * Địa hình cao thấp (`enabled: false` = mặt sân phẳng `ground` như cũ). Đất tự nhiên = nhiễu nhẹ + các đỉnh;
   * bục khu và lối lát đá được ép phẳng; ngoài bán kính `edge.radius` (tính từ `center`) đất đổ xuống vực.
   * Màu theo độ dốc từng tam giác: < `slopeDirt`° cỏ · < `slopeRock`° đất · còn lại đá (đá sáng khi cao hơn `highFrom`).
   */
  terrain: {
    enabled: boolean;
    center: XZ;
    /** cạnh vùng lưới (m) và cạnh một ô (m) */
    size: number;
    cell: number;
    plateaus: PlateauSpec[];
    peaks: PeakSpec[];
    noise: { seed: number; amp: number; scale: number };
    /** mép cao nguyên: `wobble` = độ lượn của mép (m) cho đỡ tròn đều */
    edge: { radius: number; width: number; y: number; wobble: number };
    /** khoảng chuyển mặc định từ mép bục / lối lát ra đất tự nhiên (m) */
    blend: number;
    colors: { grass: [string, string, string]; dirt: string; rock: string; highRock: string; highFrom: number };
    slopeDirt: number;
    slopeRock: number;
    /** bậc đá lên núi (Thiên Bậc…) */
    stairs: StairSpec[];
    /** cỏ búi trên đất cỏ (dốc < 25°, ngoài bục lát / lối / bậc): `density` búi trên 100 m², 0 = tắt; 2 màu xen kẽ */
    grass: { density: number; colors: [string, string] };
    /** đá rải: `density` tảng trên 1000 m², 0 = tắt; nhiều hơn trên sườn dốc */
    rocks: { density: number; color: string };
    /** thác nước (Hậu Sơn…) */
    waterfalls: WaterfallSpec[];
    /** suối chảy theo mặt đất */
    streams: StreamSpec[];
  };
  /** núi xa nhiều lớp quanh tâm địa hình, chân ở `base`; rỗng = không có */
  farMountains: { layers: MountainLayer[]; base: number };
  /** biển mây phẳng dưới mép cao nguyên; `radius` 0 = tắt */
  cloudSea: { radius: number; y: number; color: string };
  /** tường bao: nằm ở ±half; `gates` = khe chừa lối đi */
  walls: {
    half: number;
    height: number;
    color: string;
    brickHue: number;
    capColor: string;
    gates: WallGate[];
    /** `gach` = vân gạch (cũ) · `voi` = tường vôi trơn, chân đá, mái ngói, khe cổng thành cổng trăng */
    style: (typeof WALL_STYLES)[number];
    /** tường vôi: cửa sổ hoa cách nhau bao nhiêu mét (0 = không có) */
    windows: number;
  };
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
    /** xà lam, vàng kim (biển, chấm xà), gỗ sẫm (khung, chân cửa) */
    beamBlue: string;
    gold: string;
    timber: string;
    /** hệ số chiều cao kiến trúc (nền, cột, tường thân, cửa, mái, tầng tháp, cổng sơn môn), 0,5–3; 1 = cỡ gốc.
     *  Thứ cỡ người (bậc, lan can, biển, đèn lồng, đồ đạc) giữ nguyên. */
    heightScale: number;
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
    /** liễu: tán, dải rủ */
    willow: [string, string];
    /** mai: cành, hoa đậm, hoa nhạt */
    plum: [string, string, string];
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
  // chưa đặt khu nào: chip luôn "Học xá · Sân chính" như bản gốc (R-HUD-1)
  site: { name: 'Học xá · Sân chính', han: '', areas: [] },
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
  // tắt: cảnh gốc phẳng. Giá trị dưới là gợi ý cho hướng "cao nguyên giữa biển mây" (docs/tham_khao/dia-hinh-tong-mon.md)
  terrain: {
    enabled: false,
    center: [0, 0],
    size: 300,
    cell: 2.5,
    plateaus: [],
    peaks: [],
    noise: { seed: 3, amp: 1.2, scale: 30 },
    edge: { radius: 110, width: 18, y: -30, wobble: 8 },
    blend: 6,
    colors: { grass: ['#7d9a5a', '#8aa864', '#6f8c50'], dirt: '#9c8466', rock: '#8d8a84', highRock: '#b9b6ae', highFrom: 20 },
    slopeDirt: 20,
    slopeRock: 35,
    stairs: [],
    grass: { density: 0, colors: ['#6f8c50', '#93ad66'] },
    rocks: { density: 0, color: '#8d8a84' },
    waterfalls: [],
    streams: [],
  },
  farMountains: { layers: [], base: -40 },
  cloudSea: { radius: 0, y: -10, color: '#f4f1ea' },
  walls: { half: 21, height: 2.6, color: '#4a2b24', brickHue: 8, capColor: '#6e2f26', gates: [], style: 'gach', windows: 0 },
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
    beamBlue: '#3f5fa0',
    gold: '#d4a64a',
    timber: '#3a2418',
    heightScale: 1,
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
    willow: ['#8fb35e', '#a6c470'],
    plum: ['#3a2418', '#e88aa4', '#f2b8c6'],
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

/* ---------------- nhà vào được (nội thất) ---------------- */

/** Kiểu nội thất: lớp học (bảng đen, bục, thầy, án thư) · thư viện (kệ sách, án đọc). Nội dung bài quyết kiểu. */
export const INTERIOR_KINDS = ['lop-hoc', 'thu-vien'] as const;
export type InteriorKind = (typeof INTERIOR_KINDS)[number];

/** Điểm học trong nhà (hệ toạ độ nhà, mặt trước +z) + bán kính — theo mặt bằng canvas `NoiThat-mat-bang`. */
export function interiorSpot(b: Pick<BuildingSpec, 'd'>, kind: InteriorKind): { dx: number; dz: number; r: number } {
  // lớp học: cách bảng đen (sát tường sau, mặt trong ở −(d − 0,8)/2) 2 m về phía cửa; thư viện: án đọc giữa phòng
  return kind === 'lop-hoc' ? { dx: 0, dz: round6(-(b.d - 0.8) / 2 + 1.9), r: 1.8 } : { dx: 0, dz: 0, r: 1.6 };
}

/**
 * Nhà nào thành nhà vào được: kiểu giảng đường (thân rỗng được) có `zone` mà nội dung bài cho một kiểu nội thất.
 * Trả về mã vùng → kiểu nội thất. Dùng chung cho dựng cảnh và `scene:check`.
 */
export function roomKinds(buildings: BuildingSpec[], interiors: Record<string, { kind: InteriorKind }>): Record<string, InteriorKind> {
  const out: Record<string, InteriorKind> = {};
  for (const b of buildings) {
    const use = b.zone ? interiors[b.zone.id] : undefined;
    if (use && (b.kind ?? 'giang-duong') === 'giang-duong' && b.zone) out[b.zone.id] = use.kind;
  }
  return out;
}

/**
 * Tâm vùng = tâm nhà + `front` theo hướng mặt trước (+z của nhà, quay `rotY`). Nhà có nội thất (`interiors[zone.id]`)
 * → vùng là điểm học trong nhà (R-VUNG-1), bỏ qua `front` / `r` của đặc tả.
 */
export function zoneAnchors(buildings: BuildingSpec[], interiors: Record<string, InteriorKind> = {}): ZoneAnchor[] {
  return buildings.flatMap((b) => {
    if (!b.zone) return [];
    const kind = interiors[b.zone.id];
    const spot = kind ? interiorSpot(b, kind) : { dx: 0, dz: b.zone.front, r: b.zone.r };
    const [dx, dz] = rotateXZ(spot.dx, spot.dz, b.rotY ?? 0);
    return [{ id: b.zone.id, x: round6(b.x + dx), z: round6(b.z + dz), r: spot.r }];
  });
}
