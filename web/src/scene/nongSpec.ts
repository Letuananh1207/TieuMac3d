/**
 * Đặc tả nông trại Nhà của ta (V-114, concept `design/concept/nong-trai-nha/`, thiết kế 2026-11-18.11 — R-NONG-1): chuồng gà,
 * ao cá + bến câu, chuồng bò con, giàn bầu bí. Thuần dữ liệu (không three) — `spec.ts` gộp vào `SceneSpec` (`farm`),
 * `nongTrai.ts` / `nongVat.ts` dựng. Mặc định **tắt** = cảnh cũ không đổi; số mặc định là chỗ đã chốt ở Nhà của ta.
 */

type XZ = [number, number];

export interface FarmSpec {
  enabled: boolean;
  /** sân gà rào tre thấp: tâm, rộng (x), sâu (z); chuồng tre mái ngói ở góc tây bắc sân */
  coop: { x: number; z: number; w: number; d: number; chickens: number };
  /** ao tròn bờ đá; bến gỗ từ bờ tây chạy về +x, đầu bến ở `pierEnd` */
  pond: { x: number; z: number; r: number; pierFrom: XZ; pierEnd: XZ; pierWidth: number };
  /** chuồng bò con: tâm, rộng, sâu của rào; mái che nửa đông */
  cowPen: { x: number; z: number; w: number; d: number };
  /** giàn bầu bí vòm tre qua lối trục dọc z: cột ở x ± `half`, từ `z0` tới `z1`, đỉnh vòm cao `height` */
  trellis: { x: number; z0: number; z1: number; half: number; height: number };
  colors: {
    bamboo: string;
    wood: string;
    darkWood: string;
    tile: string;
    straw: string;
    stone: string;
    water: string;
    leaf: string;
    lily: string;
    chicken: string;
    hen: string;
    cow: string;
  };
}

/** Kích thước cố định (R-NONG-1) — Nhà của ta `farm.enabled: true` dùng đúng các số này. */
export const DEFAULT_FARM: FarmSpec = {
  enabled: false, // cảnh cũ không có nông trại
  coop: { x: -13, z: -10, w: 7, d: 5, chickens: 4 },
  pond: { x: 18, z: 0, r: 3.5, pierFrom: [13.6, 0], pierEnd: [16.6, 0], pierWidth: 1.4 },
  cowPen: { x: 12, z: 8, w: 5, d: 4 },
  trellis: { x: 0, z0: 8, z1: 11, half: 1.8, height: 2.9 },
  colors: {
    bamboo: '#c9a86a',
    wood: '#8a6448',
    darkWood: '#5a4636',
    tile: '#4a5050',
    straw: '#e0bf6a',
    stone: '#a39e94',
    water: '#5e9aa0',
    leaf: '#6f9a4e',
    lily: '#7fae5a',
    chicken: '#f6f1e6',
    hen: '#c88a52',
    cow: '#e2b04a',
  },
};

/** Ô chữ nhật (tâm, rộng, sâu) → `{from, to}`. */
const box = (x: number, z: number, w: number, d: number): { from: XZ; to: XZ } => ({ from: [x - w / 2, z - d / 2], to: [x + w / 2, z + d / 2] });

/** Vùng cấm đặt đồ trang trí của từng công trình (R-NHA-7, nới 0,5 m) — `scene:check` so với `decorArea.keepOut`. */
export function farmKeepOut(f: FarmSpec): { label: string; from: XZ; to: XZ }[] {
  if (!f.enabled) return [];
  const p = f.pond;
  const t = f.trellis;
  return [
    { label: 'Chuồng gà', ...box(f.coop.x, f.coop.z, f.coop.w + 1, f.coop.d + 1) },
    { label: 'Ao cá', from: [Math.min(p.x - p.r, p.pierFrom[0]) - 0.5, p.z - p.r - 0.5], to: [p.x + p.r + 0.5, p.z + p.r + 0.5] },
    { label: 'Chuồng bò', ...box(f.cowPen.x, f.cowPen.z, f.cowPen.w + 1, f.cowPen.d + 1) },
    { label: 'Giàn bầu bí', from: [t.x - t.half - 0.8, t.z0 - 0.5], to: [t.x + t.half + 0.8, t.z1 + 0.5] },
  ];
}

/** Kiểm nông trại: kích thước hợp lý, bến chạm ao, giàn đủ cao để đi qua (≥ 2,6 m), cột ngoài lối. */
export function checkFarm(f: FarmSpec, pathHalf = 1.2): string[] {
  if (!f.enabled) return [];
  const out: string[] = [];
  const pos = (n: number): boolean => Number.isFinite(n) && n > 0;
  if (!pos(f.coop.w) || !pos(f.coop.d) || f.coop.w < 4 || f.coop.d < 3) out.push('farm.coop: sân gà ≥ 4 × 3 m');
  if (f.coop.chickens < 0 || f.coop.chickens > 8) out.push('farm.coop.chickens: 0–8');
  if (!pos(f.pond.r) || f.pond.r < 2) out.push('farm.pond.r: ≥ 2 m');
  const end = f.pond.pierEnd;
  if (Math.hypot(end[0] - f.pond.x, end[1] - f.pond.z) >= f.pond.r) out.push('farm.pond.pierEnd: đầu bến phải nằm trên mặt ao');
  if (Math.hypot(f.pond.pierFrom[0] - f.pond.x, f.pond.pierFrom[1] - f.pond.z) <= f.pond.r) out.push('farm.pond.pierFrom: chân bến phải ở trên bờ');
  if (!pos(f.cowPen.w) || !pos(f.cowPen.d) || f.cowPen.w < 3 || f.cowPen.d < 3) out.push('farm.cowPen: ≥ 3 × 3 m');
  if (f.trellis.height < 2.6) out.push('farm.trellis.height: ≥ 2,6 m (người đi qua dưới giàn)');
  if (f.trellis.half <= pathHalf + 0.3) out.push(`farm.trellis.half: cột phải ngoài lối (> ${pathHalf + 0.3} m)`);
  if (f.trellis.z1 <= f.trellis.z0) out.push('farm.trellis: z1 phải > z0');
  return out;
}
