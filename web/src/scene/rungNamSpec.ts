/**
 * Đặc tả Rừng Nấm Tiên (V-109, vùng `tu-cam-thanh` — concept `design/concept/rung-nam-tien/`, phiếu
 * `docs/phieu_thiet_ke/2026-11-17-concept-rung-nam-tien.md`): nấm khổng lồ, nhà nấm, luống thảo dược, cụm nấm nhỏ và
 * Nấm Mẹ đội Lò Thuốc Tiên. Kiểu + mặc định (rỗng / tắt = cảnh cũ không đổi). Dựng ở `vat_rung_nam.ts`, `namMe.ts`.
 */

type XZ = [number, number];

/** Dáng mũ nấm: `vom` cầu dẹt · `non` nón tròn đầu · `det` mũ phẳng rộng (như Nấm Mẹ). */
export const CAP_SHAPES = ['vom', 'non', 'det'] as const;

/** Nấm khổng lồ: thân trắng ngà cao `h` m tới chân mũ, mũ bán kính `cap` m. Thân chặn người đi (vòng tròn). */
export interface GiantMushroomSpec {
  x: number;
  z: number;
  h: number;
  cap: number;
  shape?: (typeof CAP_SHAPES)[number];
  color: string;
  /** chấm kem trên mũ */
  spots?: boolean;
}

/** Nhà nấm (kín, không vào được): thân bầu trắng ngà, mũ nấm có ống khói nấm nhỏ, cửa tròn nhìn +z trước khi quay. */
export interface MushroomHouseSpec {
  x: number;
  z: number;
  /** độ, tuỳ ý (va chạm tròn) */
  rotY?: number;
  /** cao tới đỉnh mũ (m, 4–8) */
  h: number;
  color: string;
}

/** Luống thảo dược tròn, thành đất nung thấp — chặn người đi (vòng tròn). */
export interface HerbBedSpec {
  x: number;
  z: number;
  r: number;
}

/** Cụm nấm nhỏ (0,3–1,2 m) rải ngẫu nhiên trong vòng tròn — chỉ ngắm, không chặn. */
export interface MushroomClusterSpec {
  x: number;
  z: number;
  r: number;
  count: number;
}

/**
 * Nấm Mẹ + Lò Thuốc Tiên: thân bán kính `stem`, mũ phẳng bán kính `cap`, mặt mũ cao `h` (đi lên được); thang gỗ xoắn rộng
 * `stairWidth` quanh thân, chân thang ở góc `stairAt` (độ, 0 = phía +z / nam, 90 = +x / đông), xoắn `turns` vòng lên tới
 * giếng thang giữa mũ. Lò đỉnh đồng ba chân đặt lệch `cauldron` (m) so với tâm nấm trên mặt mũ.
 */
export interface MotherMushroomSpec {
  enabled: boolean;
  x: number;
  z: number;
  h: number;
  cap: number;
  stem: number;
  color: string;
  stairAt: number;
  turns: number;
  stairWidth: number;
  cauldron: XZ;
}

export interface MushroomForestSpec {
  giants: GiantMushroomSpec[];
  houses: MushroomHouseSpec[];
  herbBeds: HerbBedSpec[];
  clusters: MushroomClusterSpec[];
  mother: MotherMushroomSpec;
  /** hạt giống ngẫu nhiên (cụm nấm nhỏ, bụi thảo dược) */
  seed: number;
  /**
   * thân nấm, chấm mũ, 3 màu mũ nấm nhỏ, 2 màu thảo dược, thành luống, đất luống, gỗ (thang, cửa), dây thừng, khung cửa
   * sổ, đồng lò, gỉ ngọc, lửa, khói, 3 màu hũ, đá bàn
   */
  colors: {
    stem: string;
    spot: string;
    small: [string, string, string];
    herb: [string, string];
    bed: string;
    soil: string;
    wood: string;
    rope: string;
    window: string;
    bronze: string;
    patina: string;
    fire: string;
    smoke: string;
    jar: [string, string, string];
    table: string;
  };
}

/** Mặc định: không có rừng nấm (cảnh cũ không đổi). */
export const DEFAULT_MUSHROOM_FOREST: MushroomForestSpec = {
  giants: [],
  houses: [],
  herbBeds: [],
  clusters: [],
  mother: {
    enabled: false,
    x: 0,
    z: 0,
    h: 10,
    cap: 12.5,
    stem: 2.6,
    color: '#e7a3a8',
    stairAt: 315,
    turns: 1.25,
    stairWidth: 1.6,
    cauldron: [0, -8.3],
  },
  seed: 7,
  colors: {
    stem: '#f6ebd9',
    spot: '#fbf3e6',
    small: ['#e7a3a8', '#f2b48a', '#f6ebd9'],
    herb: ['#6fae6a', '#8fb07a'],
    bed: '#a8644c',
    soil: '#6e5040',
    wood: '#a0704a',
    rope: '#d8b98a',
    window: '#8a5a3c',
    bronze: '#b08a4e',
    patina: '#7fb7a4',
    fire: '#ffb347',
    smoke: '#dccbee',
    jar: ['#f1ebe0', '#8a5a3c', '#a3a2ae'],
    table: '#a9a3a8',
  },
};

/** Số đo thang xoắn Nấm Mẹ (toạ độ cảnh, gốc thang y = 0): vành `r0`…`r1`, góc chân `a0` (rad, 0 = +z), dốc `rise` m / rad. */
export interface MotherStair {
  cx: number;
  cz: number;
  r0: number;
  r1: number;
  a0: number;
  rise: number;
  span: number;
}

/** Thang của Nấm Mẹ: ôm sát thân, rộng `stairWidth`, xoắn `turns` vòng lên đúng mặt mũ `h`. */
export function motherStair(m: MotherMushroomSpec): MotherStair {
  const span = m.turns * Math.PI * 2;
  return { cx: m.x, cz: m.z, r0: m.stem, r1: m.stem + m.stairWidth, a0: (m.stairAt * Math.PI) / 180, rise: m.h / span, span };
}

/** Điểm trên thang tại góc `t` (rad từ chân thang) ở bán kính `r`: [x, y, z] (y tính từ gốc thang). */
export function stairPoint(s: MotherStair, t: number, r: number): [number, number, number] {
  const a = s.a0 + t;
  return [s.cx + Math.sin(a) * r, s.rise * t, s.cz + Math.cos(a) * r];
}

/** Bán kính thân lò đỉnh (m) — mép chân / quai, dùng cho va chạm và kiểm chỗ đặt. */
export const CAULDRON_R = 2.8;

/** Kiểm rừng nấm: thang đi được (dốc ≤ 35°, đủ đầu), lò nằm trên mũ ngoài giếng thang, nấm khác không cắm vào mũ Nấm Mẹ. */
export function checkMushroomForest(f: MushroomForestSpec): string[] {
  const out: string[] = [];
  const m = f.mother;
  if (!m.enabled) return out;
  const p = 'mushroomForest.mother';
  if (m.stem <= 0 || m.stairWidth < 1.2) out.push(`${p}: stem > 0, stairWidth ≥ 1,2 m (người đi được)`);
  if (m.h < 4 || m.h > 16) out.push(`${p}.h: 4–16 m`);
  if (m.turns < 0.75 || m.turns > 3) out.push(`${p}.turns: 0,75–3 vòng`);
  const s = motherStair(m);
  if (m.cap < s.r1 + CAULDRON_R * 2 + 1.6) out.push(`${p}.cap: phải ≥ ${(s.r1 + CAULDRON_R * 2 + 1.6).toFixed(1)} m (giếng thang + lò)`);
  const deg = (Math.atan(s.rise / (m.stem + 0.5)) * 180) / Math.PI;
  if (deg > 35) out.push(`${p}: thang dốc ${deg.toFixed(0)}° > 35° (R-VA-2) — tăng turns hoặc stem`);
  if (m.h / m.turns < 2.6) out.push(`${p}: mỗi vòng thang chỉ cao ${(m.h / m.turns).toFixed(1)} m — vòng trên chạm đầu (≥ 2,6)`);
  const d = Math.hypot(...m.cauldron);
  if (d < s.r1 + 0.8 + CAULDRON_R || d > m.cap - 0.8 - CAULDRON_R) out.push(`${p}.cauldron: lò phải nằm trên mũ, ngoài giếng thang (cách tâm ${(s.r1 + 0.8 + CAULDRON_R).toFixed(1)}–${(m.cap - 0.8 - CAULDRON_R).toFixed(1)} m)`);
  f.giants.forEach((g, i) => {
    if (Math.hypot(g.x - m.x, g.z - m.z) < m.cap + 1) out.push(`mushroomForest.giants[${i}] (${g.x}; ${g.z}): thân nấm cắm vào mũ Nấm Mẹ — dời ra ngoài ${m.cap + 1} m`);
  });
  return out;
}
