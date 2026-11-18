/**
 * Đặc tả Thành Cát Ngủ Quên (V-112, vùng `to-lua` — concept `design/concept/thanh-cat-ngu-quen/`, phiếu
 * `docs/phieu_thiet_ke/2026-11-17-concept-thanh-cat-ngu-quen.md`): Cổng Thành Vùi Cát (cổng đất nện + lầu gỗ, vòm đi qua
 * được, mặt thành lên được từ dốc cát), đầu lạc đà đá, tường thành đổ nát, ụ cát đào cắm cờ, cờ phướn, lối đá cổ lún dần
 * vào cát, cỏ ốc đảo + lều vải. Thuần dữ liệu + toán (không three) — `spec.ts` gộp vào `SceneSpec`, `congThanh.ts` /
 * `vat_thanh_cat.ts` dựng. Mặc định tắt / rỗng = cảnh cũ không đổi.
 */

type XZ = [number, number];

/** Phía mặt thành không có răng cưa (dốc cát dâng tới mép — lối lên): `tay` −x · `dong` +x · `` = kín bốn phía. */
export const CLIMB_SIDES = ['', 'tay', 'dong'] as const;

/**
 * Cổng thành vùi cát: khối đất nện tâm (x, z) rộng `w` (theo x), dày `d` (theo z), mặt thành cao `h` m trên nền lối vòm;
 * vòm cổng xuyên dọc z rộng `arch[0]`, cao `arch[1]` (phần còn hở trên cát — đi qua được). Trên mặt thành: răng cưa quanh
 * mép (trừ phía `climb`), lầu cổng gỗ `tower` (rộng × sâu × cao thân tới chân mái, mái cao `roof`, nghiêng `tilt` độ quanh
 * trục z — lầu cũ xệ), mặt trước lầu nhìn +z. Cát vùi do địa hình (`terrain.dunes`) — đặc tả tự lo cho dốc cát chạm mép
 * `climb` cao gần bằng mặt thành.
 */
export interface SandGateSpec {
  enabled: boolean;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  arch: [number, number];
  climb: (typeof CLIMB_SIDES)[number];
  tower: { w: number; d: number; h: number; roof: number; tilt: number };
}

/** Đầu lạc đà đá khổng lồ nhô khỏi cát: cao `h` m (từ mặt cát tới đỉnh đầu), mặt nhìn hướng `rotY` (độ, 0 = +z). */
export interface CamelHeadSpec {
  enabled: boolean;
  x: number;
  z: number;
  rotY: number;
  h: number;
}

/**
 * Tường thành đổ nát chạy dọc trục x (cùng z hai đầu) theo mặt cát: chia thành từng đoạn dài 4–8 m cao ≈ `h` m trên mặt
 * cát (± 40 %), giữa các đoạn có khe sập đi qua được (≥ 1,6 m). Mỗi đoạn chặn người đi.
 */
export interface RuinWallSpec {
  from: XZ;
  to: XZ;
  h: number;
  /** dày (m), thiếu = 2,2 */
  thick?: number;
}

/** Lều vải chữ A (ốc đảo): dài `len` m dọc trục quay `rotY` (độ), cửa lều nhìn +z trước khi quay. Chặn người đi. */
export interface TentSpec {
  x: number;
  z: number;
  rotY?: number;
  len?: number;
}

/** Một chỗ trên mặt cát. */
export interface SpotSpec {
  x: number;
  z: number;
}

export interface SandCitySpec {
  gate: SandGateSpec;
  camel: CamelHeadSpec;
  walls: RuinWallSpec[];
  /** ụ cát đào lấp lánh, mỗi ụ một cọc gỗ cắm cờ vải trơn (chỉ ngắm, không chặn) */
  mounds: SpotSpec[];
  /** cờ phướn lẻ cắm rải rác (cột gỗ cao ≈ 3 m, cờ vải đuôi nheo trơn — không chữ) */
  flags: SpotSpec[];
  /**
   * Lối lát đá cổ từ `from` tới `to` rộng `width`: gần `from` lát đủ, càng về `to` càng nhiều phiến mất / nghiêng / bị cát
   * phủ (lún dần vào cát). Rỗng (`width` 0) = không có.
   */
  road: { from: XZ; to: XZ; width: number };
  /** cỏ ốc đảo: đĩa cỏ tâm (x, z) bán kính `r` (0 = không có) — nước + cây đặt ở `water` / `trees.yard` */
  oasis: { x: number; z: number; r: number };
  tents: TentSpec[];
  /** hạt giống ngẫu nhiên (khe tường, phiến đá mất, góc cờ) */
  seed: number;
  /** đất nện, đất nện bóng / viền, gỗ, ngói, bờ nóc, đá lạc đà, đá lạc đà sẫm, cát ụ, cọc, 2 màu cờ, đá lối, cỏ, vải lều */
  colors: {
    earth: string;
    earthDark: string;
    wood: string;
    roof: string;
    ridge: string;
    camel: string;
    camelDark: string;
    mound: string;
    stake: string;
    flag: [string, string];
    road: string;
    grass: string;
    tent: string;
  };
}

/** Mặc định: không có gì (cảnh cũ không đổi). */
export const DEFAULT_SAND_CITY: SandCitySpec = {
  gate: { enabled: false, x: 0, z: 0, w: 20, d: 11, h: 8, arch: [3.6, 3.6], climb: 'tay', tower: { w: 10, d: 5, h: 3.4, roof: 3, tilt: 2 } },
  camel: { enabled: false, x: 0, z: 0, rotY: 0, h: 8 },
  walls: [],
  mounds: [],
  flags: [],
  road: { from: [0, 0], to: [0, 0], width: 0 },
  oasis: { x: 0, z: 0, r: 0 },
  tents: [],
  seed: 112,
  colors: {
    earth: '#c9a06a',
    earthDark: '#a97e50',
    wood: '#7a5a40',
    roof: '#6e6a66',
    ridge: '#55514d',
    camel: '#d8c3a0',
    camelDark: '#5a4636',
    mound: '#e6bd7c',
    stake: '#6e4e34',
    flag: ['#efe6d2', '#d9c8a8'],
    road: '#b9ab94',
    grass: '#6fa87a',
    tent: '#d9c9a6',
  },
};

/** Dày răng cưa (m) và khoảng cao chân nhân vật coi là "đang trên mặt thành" (dưới mặt thành 0,5 m trở lên). */
export const PARAPET_T = 0.5;
const ON_TOP = 0.5;

export interface GateBox {
  x: number;
  z: number;
  w: number;
  d: number;
  /** che camera (m) — thân cổng cao; vật trên mặt thành 0 */
  h: number;
  minY?: number;
  maxY?: number;
}

/** Tấm đi được (cùng dạng `collision/ground.ts` `Pad` — không import để file này thuần dữ liệu). */
export interface GatePad {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  y: number;
  upper: boolean;
}

/**
 * Mặt bằng va chạm của cổng thành ở độ cao nền `base` (toạ độ cảnh): hai khối thân hai bên vòm (chặn người dưới mặt thành),
 * răng cưa ba / bốn phía + lầu cổng (chỉ chặn người trên mặt thành), mặt thành là tấm tầng trên (`upper` — người đi dưới
 * vòm vẫn ở mặt cát). Vòm hở trọn chiều sâu: đi xuyên được dọc z.
 */
export function gateLayout(g: SandGateSpec, base: number): { boxes: GateBox[]; pads: GatePad[] } {
  const top = base + g.h;
  const below = { maxY: top - ON_TOP };
  const above = { minY: top - ON_TOP };
  const half = g.arch[0] / 2;
  const side = g.w / 2 - half;
  const boxes: GateBox[] = [
    { x: g.x - half - side / 2, z: g.z, w: side, d: g.d, h: g.h, ...below },
    { x: g.x + half + side / 2, z: g.z, w: side, d: g.d, h: g.h, ...below },
    // răng cưa nam + bắc (cả bề rộng), đông / tây trừ phía dốc cát
    { x: g.x, z: g.z + g.d / 2 - PARAPET_T / 2, w: g.w, d: PARAPET_T, h: 0, ...above },
    { x: g.x, z: g.z - g.d / 2 + PARAPET_T / 2, w: g.w, d: PARAPET_T, h: 0, ...above },
  ];
  if (g.climb !== 'dong') boxes.push({ x: g.x + g.w / 2 - PARAPET_T / 2, z: g.z, w: PARAPET_T, d: g.d, h: 0, ...above });
  if (g.climb !== 'tay') boxes.push({ x: g.x - g.w / 2 + PARAPET_T / 2, z: g.z, w: PARAPET_T, d: g.d, h: 0, ...above });
  // lầu cổng: lệch về bắc nửa khoảng dư, hộp nới 0,3 m cho phần nghiêng
  boxes.push({ x: g.x, z: towerZ(g), w: g.tower.w + 0.3, d: g.tower.d + 0.3, h: 0, ...above });
  const pads: GatePad[] = [{ minX: g.x - g.w / 2, maxX: g.x + g.w / 2, minZ: g.z - g.d / 2, maxZ: g.z + g.d / 2, y: top, upper: true }];
  return { boxes, pads };
}

/** Tâm z của lầu cổng: lùi về bắc để lối đi phía nam (trước mặt lầu) rộng hơn phía bắc. */
export const towerZ = (g: SandGateSpec): number => g.z - (g.d - g.tower.d) * 0.15;

export interface WallChunk {
  /** tâm x, độ dài đoạn */
  x: number;
  len: number;
  /** cao trên mặt cát (m) */
  h: number;
}

/**
 * Chia một đoạn tường đổ nát thành các đoạn còn đứng + khe sập (thuần, có hạt giống): đoạn 4–8 m, khe 1,8–2,6 m, cao
 * `h` × 0,6…1,4. Đoạn cuối ngắn hơn 1,5 m thì bỏ.
 */
export function wallChunks(w: RuinWallSpec, rand: () => number): WallChunk[] {
  const a = Math.min(w.from[0], w.to[0]);
  const b = Math.max(w.from[0], w.to[0]);
  const out: WallChunk[] = [];
  let x = a;
  while (x < b) {
    const len = Math.min(4 + rand() * 4, b - x);
    if (len >= 1.5) out.push({ x: x + len / 2, len, h: w.h * (0.6 + rand() * 0.8) });
    x += len + 1.8 + rand() * 0.8;
  }
  return out;
}

/** Kiểm thành cát: kích thước cổng đi qua được, lầu vừa mặt thành chừa lối, tường chạy dọc trục x. */
export function checkSandCity(s: SandCitySpec): string[] {
  const out: string[] = [];
  const g = s.gate;
  if (g.enabled) {
    const p = 'sandCity.gate';
    if (g.arch[0] < 2 || g.arch[1] < 2.6) out.push(`${p}.arch: vòm rộng ≥ 2 m, cao ≥ 2,6 m (người đi qua được)`);
    if (g.arch[0] > g.w - 4) out.push(`${p}.arch: vòm rộng quá — hai bên vòm còn ≥ 2 m thân`);
    if (g.arch[1] > g.h - 1.5) out.push(`${p}.arch: vòm cao quá — trên vòm còn ≥ 1,5 m thân`);
    if (!CLIMB_SIDES.includes(g.climb)) out.push(`${p}.climb: chỉ ${CLIMB_SIDES.map((c) => `"${c}"`).join(' · ')}`);
    const t = g.tower;
    if (t.w > g.w - 2 * PARAPET_T - 2 || t.d > g.d - 2 * PARAPET_T - 3) out.push(`${p}.tower: lầu phải chừa lối ≥ 1 m quanh (mặt thành ${g.w} × ${g.d})`);
    if (Math.abs(t.tilt) > 5) out.push(`${p}.tower.tilt: nghiêng tối đa 5°`);
  }
  s.walls.forEach((w, i) => {
    if (w.from[1] !== w.to[1]) out.push(`sandCity.walls[${i}]: tường chạy dọc trục x (from / to cùng z)`);
  });
  return out;
}
