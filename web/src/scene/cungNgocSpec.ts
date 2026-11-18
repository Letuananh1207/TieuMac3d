/**
 * Đặc tả Cung Ngọc Đáy Biển (V-110, vùng `bong-lai` — concept `design/concept/cung-ngoc-day-bien/`, phiếu
 * `docs/phieu_thiet_ke/2026-11-17-concept-cung-ngoc-day-bien.md`): Cung Vỏ Sò trên nền san hô, bãi cát trắng viền cuội,
 * hang đá, vỏ trai ngọc, cột san hô cửa lặn, san hô, rong, vệt nắng, bong bóng, đàn cá. Thuần dữ liệu (không three) —
 * `spec.ts` gộp vào `SceneSpec`, `vat_cung_ngoc.ts` dựng. Mặc định rỗng / tắt = cảnh cũ không đổi.
 */

type XZ = [number, number];

/**
 * Cung Vỏ Sò: nền san hô tròn hai bậc tâm (x, z) bán kính `plinthR`, mặt trên cao `plinthH` (mỗi bậc nửa — R-VA-3, ≤ 0,6 m),
 * đi lên được từ mọi phía. Vỏ ốc xà cừ nằm nghiêng: thân tròn bán kính `shellR` tâm lệch `shellAt` (m, hệ của nền — trước
 * khi quay), chóp xoắn dài `spireLength` chĩa về +x (lên, ra sau một chút). Cửa vòm `doorW` × `doorH` nhìn +z, hai cột san hô
 * cao `columnH` hai bên, mái san hô trên lưng (chóp giữa cao `crownH`), đèn ngọc quanh cửa. Quay `rotY` độ.
 */
export interface SeaPalaceSpec {
  enabled: boolean;
  x: number;
  z: number;
  rotY: number;
  plinthR: number;
  plinthH: number;
  shellR: number;
  shellAt: XZ;
  spireLength: number;
  doorW: number;
  doorH: number;
  columnH: number;
  crownH: number;
}

/** Bãi cát trắng tròn (mặt cát nổi 6 cm), viền cuội ở mép ngoài (chỗ không nằm trong bãi khác). Không chặn. */
export interface SandPatchSpec {
  x: number;
  z: number;
  r: number;
}

/** Hang đá (hang cá): gò đá cục mịch bán kính `r`, miệng hang tối nhìn +z trước khi quay `rotY` độ. Chặn (vòng tròn). */
export interface SeaCaveSpec {
  x: number;
  z: number;
  r: number;
  rotY?: number;
}

/** Vỏ trai mở có viên ngọc, cỡ `s` (1 ≈ ∅ 1,6 m), miệng nhìn +z trước khi quay. Chặn (vòng tròn). */
export interface ClamSpec {
  x: number;
  z: number;
  rotY?: number;
  s?: number;
}

/** Cột đá san hô (cửa lặn): chân vuông, thân sáu cạnh cao `h`, đầu khối đá mài. Chặn (vòng tròn). */
export interface CoralPillarSpec {
  x: number;
  z: number;
  h: number;
}

/** Cụm rải ngẫu nhiên trong vòng tròn (san hô, rong) — chỉ ngắm, không chặn; tránh lối đi, nền cung, bãi hạc. */
export interface ScatterSpec {
  x: number;
  z: number;
  r: number;
  count: number;
}

/** Vệt nắng xiên: dải sáng cộng màu từ trên xuống, chân ở (x, z), đầu trên nghiêng `tilt` độ về phía −x (nắng từ tây). */
export interface SunBeamSpec {
  x: number;
  z: number;
  /** rộng chân vệt (m) */
  w: number;
  tilt?: number;
}

/** Cột bong bóng bay lên từ (x, z), `count` bóng (động, một draw call chung). */
export interface BubbleSpec {
  x: number;
  z: number;
  count: number;
  /** toả ngang (m) */
  spread?: number;
}

/** Đàn cá nhỏ bơi vòng quanh (x, y, z) bán kính `r`, `speed` m/s (âm = ngược chiều kim). */
export interface FishSchoolSpec {
  x: number;
  y: number;
  z: number;
  r: number;
  count: number;
  speed: number;
}

export interface SeaFloorSpec {
  palace: SeaPalaceSpec;
  sand: SandPatchSpec[];
  caves: SeaCaveSpec[];
  clams: ClamSpec[];
  pillars: CoralPillarSpec[];
  corals: ScatterSpec[];
  kelp: ScatterSpec[];
  beams: SunBeamSpec[];
  bubbles: BubbleSpec[];
  fish: FishSchoolSpec[];
  /** độ đậm vệt nắng 0…1 (cộng màu `colors.beam` × số này — số nhỏ, vì cộng sau khi đổi sang sRGB) */
  beamOpacity: number;
  /** cuội viền hai mép lối đi (`paths`) */
  pathPebbles: boolean;
  /** viền cuội quanh bãi hạc (`stoneYard`) */
  yardPebbles: boolean;
  seed: number;
  /**
   * xà cừ (kem, hồng, tím), môi cửa, lòng cửa tối, nền san hô (thân, mặt), bậc cửa tím, cột cửa + mái san hô, rong, cát,
   * cuội (2), đá hang (2), lòng hang, vỏ trai (ngoài, trong), ngọc / đèn ngọc, san hô (3), vệt nắng, bong bóng, cá (2)
   */
  colors: {
    nacre: [string, string, string];
    lip: string;
    doorway: string;
    plinth: string;
    plinthTop: string;
    steps: string;
    coral: string;
    kelp: string;
    sand: string;
    pebble: [string, string];
    rock: [string, string];
    cave: string;
    clam: string;
    clamInner: string;
    pearl: string;
    corals: [string, string, string];
    beam: string;
    bubble: string;
    fish: [string, string];
  };
}

/** Mặc định: không có đáy biển (cảnh cũ không đổi). */
export const DEFAULT_SEA_FLOOR: SeaFloorSpec = {
  palace: {
    enabled: false,
    x: 0,
    z: 0,
    rotY: 0,
    plinthR: 10,
    plinthH: 1,
    shellR: 6.5,
    shellAt: [-2, -0.5],
    spireLength: 16,
    doorW: 2.6,
    doorH: 3.6,
    columnH: 4.4,
    crownH: 4.5,
  },
  sand: [],
  caves: [],
  clams: [],
  pillars: [],
  corals: [],
  kelp: [],
  beams: [],
  bubbles: [],
  fish: [],
  beamOpacity: 0.1,
  pathPebbles: false,
  yardPebbles: false,
  seed: 11,
  colors: {
    nacre: ['#f4e9dc', '#f2c6c2', '#d8c7e8'],
    lip: '#f8f1ea',
    doorway: '#3e5660',
    plinth: '#d9786a',
    plinthTop: '#e49484',
    steps: '#c9b6e0',
    coral: '#d9776a',
    kelp: '#5e9c6a',
    sand: '#efe6d2',
    pebble: ['#d6d2c8', '#b9b7ae'],
    rock: ['#9ea89e', '#b3ad9c'],
    cave: '#2f4448',
    clam: '#d9cfd8',
    clamInner: '#f2c6c2',
    pearl: '#fbf8f2',
    corals: ['#f08a7e', '#f4a261', '#b58bd6'],
    beam: '#d8fff4',
    bubble: '#eafcff',
    fish: ['#dfeef0', '#f6c79a'],
  },
};

/** Điểm (lx, lz) trong hệ nền cung (trước khi quay `rotY`) → toạ độ cảnh. Quay như three `rotation.y`. */
export function palaceToWorld(p: SeaPalaceSpec, lx: number, lz: number): XZ {
  const a = (p.rotY * Math.PI) / 180;
  return [p.x + lx * Math.cos(a) + lz * Math.sin(a), p.z - lx * Math.sin(a) + lz * Math.cos(a)];
}

/** Kiểm đáy biển: nền cung bước lên được (mỗi bậc ≤ 0,6 m), thân ốc + cửa nằm trên nền, cột không đè cửa. */
export function checkSeaFloor(f: SeaFloorSpec): string[] {
  const out: string[] = [];
  if (!(f.beamOpacity >= 0 && f.beamOpacity <= 1)) out.push(`seaFloor.beamOpacity: 0…1 (đang ${f.beamOpacity})`);
  const p = f.palace;
  if (!p.enabled) return out;
  const at = 'seaFloor.palace';
  if (p.plinthH <= 0 || p.plinthH / 2 > 0.6) out.push(`${at}.plinthH: 0 … 1,2 m (hai bậc, mỗi bậc ≤ 0,6 — R-VA-3)`);
  if (p.shellR < 3 || p.shellR > 10) out.push(`${at}.shellR: 3 … 10 m`);
  const [sx, sz] = p.shellAt;
  if (Math.hypot(sx, sz) + p.shellR * 0.8 > p.plinthR) out.push(`${at}: thân ốc lòi khỏi nền — tăng plinthR hoặc dời shellAt`);
  if (sz + p.shellR + 1.6 > p.plinthR - 1.5) out.push(`${at}: trước cửa còn dưới 1,5 m nền — tăng plinthR hoặc lùi shellAt`);
  if (p.doorW < 1.6 || p.doorH < 2.4) out.push(`${at}: cửa tối thiểu 1,6 × 2,4 m`);
  if (p.doorH > p.shellR * 1.2) out.push(`${at}.doorH: cửa cao quá thân ốc (≤ ${(p.shellR * 1.2).toFixed(1)} m)`);
  return out;
}
