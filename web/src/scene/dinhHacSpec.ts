/**
 * Đặc tả Đỉnh Hạc Bay (V-111, vùng `truong-thanh` — concept `design/concept/dinh-hac-bay/`, phiếu
 * `docs/phieu_thiet_ke/2026-11-17-concept-dinh-hac-bay.md`): rừng cột đá vôi, cầu treo gỗ giữa các gờ / đỉnh cột, rừng tùng
 * lá kim dưới thung, phong đỏ; cột chính có bậc đá xoắn lên gờ giữa chừng rồi lên đỉnh — thềm cỏ có đình bát giác, tùng cổ,
 * hạc đứng. Kiểu + mặc định (rỗng / tắt = cảnh cũ không đổi) + toán thuần (bậc xoắn, kiểm). Dựng ở `vat_dinh_hac.ts`,
 * `dinhHac.ts`.
 */

type XZ = [number, number];

/** Cột đá phụ: thân khối xếp bo góc cao `h` (m từ chân), bán kính `r`; đỉnh thềm cỏ. Thân chặn người đi. */
export interface StonePillarSpec {
  x: number;
  z: number;
  h: number;
  r: number;
  /** gờ đá vòng quanh thân ở độ cao này (m từ chân), rộng `ledgeWidth` — đi được, đầu cầu treo; thiếu / 0 = không có */
  ledge?: number;
  /** số cây tùng trên đỉnh (0–3) */
  pines?: number;
  /** một cây phong đỏ trên đỉnh */
  maple?: boolean;
}

/** Cầu treo gỗ thẳng trục (from, to cùng x hoặc cùng z), mặt ván phẳng ở độ cao `y` (toạ độ cảnh); hai đầu nằm trên gờ / đỉnh cột. */
export interface PillarBridgeSpec {
  from: XZ;
  to: XZ;
  y: number;
}

/** Cụm tùng lá kim (dáng nón xếp tầng) rải trong hộp `w` × `d` quanh (x, z). Thân chặn người đi. */
export interface FirGroveSpec {
  x: number;
  z: number;
  w: number;
  d: number;
  count: number;
  scale?: number;
}

/** Một cây phong đỏ dưới thung (thân + tán đỏ cam). Thân chặn người đi. */
export interface MapleSpec {
  x: number;
  z: number;
  scale: number;
}

/**
 * Cột chính: cao `h`, bán kính `r`. Bậc đá rộng `stairWidth` xoắn quanh thân (dốc `stairSlope` độ ở mép trong) từ chân ở góc
 * `stairAt` (độ, 0 = phía +z / nam, 90 = +x / đông, tăng ngược chiều kim đồng hồ nhìn từ trên) lên **gờ** cao `ledge`, gờ chạy
 * tiếp quanh thân rồi bậc thứ hai lên **thềm đỉnh**. Trên đỉnh: đình bát giác (tâm lệch `pavilion.at` so với tâm cột, bán
 * kính nền `r`, cao `h` tới chóp), tùng cổ gốc ở `pine.at` nghiêng ra hướng `pine.dir` (độ), `cranes` con hạc đứng.
 */
export interface CranePeakSpec {
  enabled: boolean;
  x: number;
  z: number;
  h: number;
  r: number;
  ledge: number;
  stairAt: number;
  stairWidth: number;
  stairSlope: number;
  pavilion: { at: XZ; r: number; h: number };
  pine: { at: XZ; dir: number; scale: number };
  cranes: number;
}

export interface PillarValleySpec {
  peak: CranePeakSpec;
  pillars: StonePillarSpec[];
  /** bề rộng gờ quanh cột (m, tính từ mặt thân) */
  ledgeWidth: number;
  bridges: PillarBridgeSpec[];
  /** bề rộng mặt cầu treo (m) */
  bridgeWidth: number;
  firs: FirGroveSpec[];
  maples: MapleSpec[];
  /** hạt giống ngẫu nhiên (dáng khối đá, cây) */
  seed: number;
  /**
   * đá sáng / tối, cỏ đỉnh sáng / tối, 2 màu tùng lá kim + thân, 2 màu phong + thân, ván cầu, dây thừng, cột son, xà, lan can
   * vôi trắng, ngói xám, bờ nóc, nền đá đình, tùng cổ (thân + 3 lá), hạc (thân, lông đen, đỉnh đỏ, mỏ / chân)
   */
  colors: {
    rock: string;
    rockDark: string;
    grass: string;
    grassDark: string;
    fir: [string, string];
    firTrunk: string;
    maple: [string, string];
    mapleTrunk: string;
    plank: string;
    rope: string;
    column: string;
    beam: string;
    rail: string;
    roof: string;
    ridge: string;
    base: string;
    pineTrunk: string;
    pine: [string, string, string];
    crane: [string, string, string, string];
  };
}

/** Mặc định: không có rừng cột đá (cảnh cũ không đổi). */
export const DEFAULT_PILLAR_VALLEY: PillarValleySpec = {
  peak: {
    enabled: false,
    x: 0,
    z: 0,
    h: 40,
    r: 7.5,
    ledge: 10.5,
    stairAt: 330,
    stairWidth: 1.6,
    stairSlope: 32,
    pavilion: { at: [0, -1.2], r: 3, h: 7 },
    pine: { at: [3.6, 2.6], dir: 120, scale: 1 },
    cranes: 6,
  },
  pillars: [],
  ledgeWidth: 2.6,
  bridges: [],
  bridgeWidth: 1.8,
  firs: [],
  maples: [],
  seed: 11,
  colors: {
    rock: '#c9c2b5',
    rockDark: '#9f988b',
    grass: '#86a85e',
    grassDark: '#6f9a52',
    fir: ['#4f7a5a', '#3f6a4c'],
    firTrunk: '#6a4a34',
    maple: ['#d9774a', '#c8583a'],
    mapleTrunk: '#5a3e2c',
    plank: '#a07a52',
    rope: '#c9a878',
    column: '#8a2a20',
    beam: '#70241c',
    rail: '#f1ece2',
    roof: '#6c7278',
    ridge: '#4e5358',
    base: '#cfc8ba',
    pineTrunk: '#4a3022',
    pine: ['#3f6a4c', '#4f7a5a', '#6f9a6a'],
    crane: ['#f7f5f0', '#2c2a2a', '#c8423a', '#8a8478'],
  },
};

/** Bậc xoắn / gờ (toán thuần): vành `r0`…`r1` quanh (cx, cz); tại góc `a0` (rad, 0 = +z) cao `y0`, mỗi rad thêm `rise`, dài `span` rad. */
export interface Helix {
  cx: number;
  cz: number;
  r0: number;
  r1: number;
  a0: number;
  y0: number;
  rise: number;
  span: number;
}

/** Khe (rad) giữa cuối gờ và chân bậc 1 — gờ không chồng lên bậc 1 ở cùng góc. */
export const LEDGE_GAP = 0.3;
/** Khoảng trống trên đầu (m) giữa hai mặt đi chồng nhau — nhân vật cao ~1,7 m. */
export const HEADROOM = 2.6;

const TAU = Math.PI * 2;
const rad = (deg: number): number => (deg * Math.PI) / 180;

/** Bậc 1 (chân → gờ), gờ (phẳng), bậc 2 (gờ → đỉnh) của cột chính; y tính từ chân cột. */
export function peakStairs(p: CranePeakSpec, ledgeWidth: number): { s1: Helix; ledge: Helix; s2: Helix } {
  const rise = p.r * Math.tan(rad(p.stairSlope));
  const base = { cx: p.x, cz: p.z, r0: p.r, r1: p.r + p.stairWidth, rise };
  const s1: Helix = { ...base, a0: rad(p.stairAt), y0: 0, span: p.ledge / rise };
  const ledge: Helix = { ...base, r1: p.r + ledgeWidth, a0: s1.a0 + s1.span, y0: p.ledge, rise: 0, span: Math.PI * 2 - s1.span - LEDGE_GAP };
  const s2: Helix = { ...base, a0: ledge.a0 + ledge.span, y0: p.ledge, span: (p.h - p.ledge) / rise };
  return { s1, ledge, s2 };
}

/** Điểm trên vành xoắn tại `t` rad tính từ đầu, bán kính `r`: [x, y, z] (y tính từ chân cột). */
export function helixPoint(h: Helix, t: number, r: number): [number, number, number] {
  const a = h.a0 + t;
  return [h.cx + Math.sin(a) * r, h.y0 + h.rise * t, h.cz + Math.cos(a) * r];
}

/** Các độ cao mặt của vành xoắn tại góc phương vị `a` (rad) — vành nhiều vòng có nhiều mặt chồng nhau. */
function heightsAt(h: Helix, a: number): number[] {
  const out: number[] = [];
  for (let t = (((a - h.a0) % TAU) + TAU) % TAU; t <= h.span + 1e-9; t += TAU) out.push(h.y0 + h.rise * t);
  return out;
}

const inArc = (a: number, a0: number, span: number): boolean => ((((a - a0) % TAU) + TAU) % TAU) <= span + 1e-9;

/** Cung đủ hai bên mỗi đầu cầu trên gờ cột phụ (rad). */
const LEDGE_MARGIN = 0.75;

/**
 * Gờ cột phụ chỉ là **cung** ôm các đầu cầu chạm gờ (mỗi bên thêm `LEDGE_MARGIN`): `{ a0, span }` (rad, 0 = +z); không cầu nào
 * chạm gờ → `null` (không dựng gờ).
 */
export function ledgeArc(v: PillarValleySpec, c: StonePillarSpec): { a0: number; span: number } | null {
  if (!c.ledge) return null;
  const R = c.r + v.ledgeWidth;
  const angles = v.bridges
    .flatMap((b) => [b.from, b.to])
    .filter(([x, z]) => {
      const d = Math.hypot(x - c.x, z - c.z);
      return d >= c.r - 0.05 && d <= R + 0.05;
    })
    .map(([x, z]) => (((Math.atan2(x - c.x, z - c.z)) % TAU) + TAU) % TAU)
    .sort((m, n) => m - n);
  if (!angles.length) return null;
  // cung ngắn nhất phủ mọi góc = bỏ khe lớn nhất giữa hai góc liền nhau
  let gap = TAU - (angles[angles.length - 1] - angles[0]);
  let start = angles[0];
  for (let i = 1; i < angles.length; i++) {
    if (angles[i] - angles[i - 1] > gap) {
      gap = angles[i] - angles[i - 1];
      start = angles[i];
    }
  }
  const span = Math.min(TAU - 0.3, TAU - gap + LEDGE_MARGIN * 2);
  return { a0: start - LEDGE_MARGIN, span };
}

/** Mặt đi được trên đỉnh / gờ cột tại (x, z) có độ cao (toạ độ cảnh, chân cột ở `baseAt`) nào. */
export function surfacesAt(v: PillarValleySpec, x: number, z: number, baseAt: (x: number, z: number) => number): number[] {
  const out: number[] = [];
  const p = v.peak;
  if (p.enabled) {
    const b = baseAt(p.x, p.z);
    const d = Math.hypot(x - p.x, z - p.z);
    if (d <= p.r) out.push(b + p.h);
    const { ledge } = peakStairs(p, v.ledgeWidth);
    if (d >= ledge.r0 && d <= ledge.r1) {
      const t = (((Math.atan2(x - p.x, z - p.z) - ledge.a0) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      if (t <= ledge.span) out.push(b + p.ledge);
    }
  }
  for (const c of v.pillars) {
    const b = baseAt(c.x, c.z);
    const d = Math.hypot(x - c.x, z - c.z);
    if (d <= c.r) out.push(b + c.h);
    const arc = c.ledge ? ledgeArc(v, c) : null;
    if (arc && c.ledge && d >= c.r && d <= c.r + v.ledgeWidth && inArc(Math.atan2(x - c.x, z - c.z), arc.a0, arc.span)) out.push(b + c.ledge);
  }
  return out;
}

/**
 * Kiểm rừng cột: bậc đi được (dốc ≤ 35°, đủ khoảng đầu giữa các vòng), đình / tùng nằm trên thềm, lối ra bậc không vào đình,
 * cột không chồng nhau, cầu thẳng trục và hai đầu nằm đúng trên gờ / đỉnh cùng độ cao. `baseAt` = mặt đất (chân cột).
 */
export function checkPillarValley(v: PillarValleySpec, baseAt: (x: number, z: number) => number): string[] {
  const out: string[] = [];
  const p = v.peak;
  const all: { x: number; z: number; r: number; name: string }[] = v.pillars.map((c, i) => ({ ...c, name: `pillarValley.pillars[${i}]` }));
  if (p.enabled) {
    const at = 'pillarValley.peak';
    all.unshift({ x: p.x, z: p.z, r: p.r + v.ledgeWidth, name: at });
    if (p.stairSlope > 34) out.push(`${at}.stairSlope: ≤ 34° (R-VA-2 — mép trong bậc)`);
    if (p.stairWidth < 1.2 || p.stairWidth > v.ledgeWidth) out.push(`${at}.stairWidth: 1,2 m … ledgeWidth (${v.ledgeWidth})`);
    if (p.ledge < 4 || p.ledge > p.h - 8) out.push(`${at}.ledge: 4 … h − 8 m`);
    const { s1, ledge, s2 } = peakStairs(p, v.ledgeWidth);
    if (ledge.span < 1) out.push(`${at}: bậc 1 quá dài (${((s1.span * 180) / Math.PI).toFixed(0)}°) — gờ không còn chỗ; tăng stairSlope hoặc hạ ledge`);
    for (let a = 0; a < Math.PI * 2; a += 0.05) {
      const ys = [s1, ledge, s2].flatMap((h) => heightsAt(h, a)).sort((m, n) => m - n);
      for (let i = 1; i < ys.length; i++) {
        if (ys[i] - ys[i - 1] > 0.01 && ys[i] - ys[i - 1] < HEADROOM) {
          out.push(`${at}: hai vòng bậc / gờ chồng sát nhau (${ys[i - 1].toFixed(1)} và ${ys[i].toFixed(1)} m ở góc ${((a * 180) / Math.PI).toFixed(0)}°) — cần ≥ ${HEADROOM} m`);
          a = Math.PI * 2;
          break;
        }
      }
    }
    const [px, pz] = p.pavilion.at;
    if (Math.hypot(px, pz) + p.pavilion.r > p.r - 0.6) out.push(`${at}.pavilion: đình phải nằm trong thềm (cách mép ≥ 0,6 m)`);
    const [tx, tz] = p.pine.at;
    if (Math.hypot(tx, tz) > p.r - 0.8) out.push(`${at}.pine: gốc tùng phải trên thềm (cách mép ≥ 0,8 m)`);
    if (Math.hypot(tx - px, tz - pz) < p.pavilion.r + 1) out.push(`${at}.pine: gốc tùng chạm nền đình`);
    const [ex, , ez] = helixPoint(s2, s2.span, p.r - 1);
    if (Math.hypot(ex - p.x - px, ez - p.z - pz) < p.pavilion.r + 1.2) out.push(`${at}: lối ra bậc trên đỉnh bị nền đình chắn — dời đình hoặc stairAt`);
  }
  v.pillars.forEach((c, i) => {
    const at = `pillarValley.pillars[${i}]`;
    if (c.ledge && (c.ledge < 4 || c.ledge > c.h - 3)) out.push(`${at}.ledge: 4 … h − 3 m`);
    if ((c.pines ?? 0) > 3) out.push(`${at}.pines: 0 … 3`);
  });
  for (let i = 0; i < all.length; i++)
    for (let k = i + 1; k < all.length; k++) {
      const [a, b] = [all[i], all[k]];
      if (Math.hypot(a.x - b.x, a.z - b.z) < a.r + b.r + 1) out.push(`${b.name} (${b.x}; ${b.z}): chồng lên ${a.name} — cách nhau ≥ tổng bán kính + 1 m`);
    }
  v.bridges.forEach((b, i) => {
    const at = `pillarValley.bridges[${i}]`;
    if (b.from[0] !== b.to[0] && b.from[1] !== b.to[1]) return void out.push(`${at}: cầu phải thẳng trục (from, to cùng x hoặc cùng z)`);
    if (Math.hypot(b.to[0] - b.from[0], b.to[1] - b.from[1]) < 2) out.push(`${at}: dài ít nhất 2 m`);
    for (const end of [b.from, b.to]) {
      if (!surfacesAt(v, end[0], end[1], baseAt).some((y) => Math.abs(y - b.y) < 0.05)) {
        out.push(`${at} đầu (${end[0]}; ${end[1]}): không nằm trên gờ / đỉnh cột cao ${b.y} m`);
      }
    }
  });
  return out;
}
