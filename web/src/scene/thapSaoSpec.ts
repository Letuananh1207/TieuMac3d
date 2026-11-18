/**
 * Đặc tả Tháp Sáo Trúc (V-113, vùng `rung-truc` — concept `design/concept/thung-truc-gio-hat/`, phiếu
 * `docs/phieu_thiet_ke/2026-11-17-concept-thung-truc-gio-hat.md`): bó ống trúc to cao thấp như đàn ống trên đế đá tròn
 * hai bậc, ba vòng dây thừng, lỗ sáo, dải lụa ngũ sắc bay ở đỉnh; 5 cọc trúc thấp buộc nơ xếp cung phía nam; vài giá
 * chuông gió tre quanh bãi. Kiểu + mặc định (tắt = cảnh cũ không đổi). Dựng ở `thapSao.ts`.
 */

/** Giá chuông gió tre: hai cột trúc + xà ngang, 5 ống trúc ngắn treo lay theo gió, một dải lụa. Xà dọc trục x trước khi quay. */
export interface WindChimeSpec {
  x: number;
  z: number;
  /** độ, chỉ 0 · 90 · 180 · 270 (va chạm hộp) */
  rotY?: number;
}

export interface FluteTowerSpec {
  enabled: boolean;
  /** tâm đế */
  x: number;
  z: number;
  /** ống cao nhất, tính từ mặt đất (m, 8–16) */
  height: number;
  /** bán kính bậc đế ngoài (m, 3–6); bậc trên = 0,8 × */
  base: number;
  /** 5 cọc trúc buộc nơ xếp cung phía nam (+z) ngoài đế */
  posts: boolean;
  chimes: WindChimeSpec[];
  /** trúc (2 sắc), đốt, miệng ống trong, dây thừng, đá đế (2 bậc), 6 màu lụa đỉnh, 5 màu nơ cọc */
  colors: {
    bamboo: [string, string];
    node: string;
    hole: string;
    rope: string;
    stone: [string, string];
    ribbons: [string, string, string, string, string, string];
    bows: [string, string, string, string, string];
  };
}

/** Mặc định: không có tháp (cảnh cũ không đổi). */
export const DEFAULT_FLUTE_TOWER: FluteTowerSpec = {
  enabled: false,
  x: 0,
  z: 0,
  height: 14,
  base: 4.2,
  posts: true,
  chimes: [],
  colors: {
    bamboo: ['#c9c27a', '#a8b26a'],
    node: '#7e8a4e',
    hole: '#3b3a26',
    rope: '#b89c6a',
    stone: ['#bdb7aa', '#a9a397'],
    ribbons: ['#e07a5f', '#f2c14e', '#6fa8dc', '#8bc48a', '#c3a3e0', '#f4a6b8'],
    bows: ['#e07a5f', '#f2c14e', '#6fa8dc', '#c3a3e0', '#b89be0'],
  },
};

/**
 * Bó ống (toạ độ tương đối tâm đế, x đông, z nam): [dx, dz, bán kính, tỉ lệ cao so với `height`]. Ống cao nhất lệch về
 * tây bắc, thấp dần về đông / nam như đàn ống (concept `cong-trinh.png`).
 */
export const TUBES: readonly [number, number, number, number][] = [
  [-0.5, -0.25, 0.62, 1],
  [0.6, -0.4, 0.56, 0.84],
  [0.35, 0.72, 0.5, 0.68],
  [1.4, 0.3, 0.44, 0.6],
  [-0.55, 0.9, 0.46, 0.55],
  [-1.35, 0.2, 0.42, 0.47],
];

/** Bán kính bao bó ống (m) — vòng dây thừng ôm ngoài, va chạm thân tháp. */
export const BUNDLE_R = Math.max(...TUBES.map(([dx, dz, r]) => Math.hypot(dx, dz) + r));

/** Bậc đế: [bán kính, mặt trên y] — bậc ngoài thấp, bậc trên cao (bước ≤ 0,6 m — R-VA-3). */
export function baseSteps(t: FluteTowerSpec): [number, number][] {
  return [
    [t.base, 0.25],
    [t.base * 0.8, 0.5],
  ];
}

/** Cọc nơ: [x, z] quanh tâm, cung phía nam ngoài đế 1,1 m, chừa lối giữa (lối lát nam rộng ≤ 4 m). */
export function postSpots(t: FluteTowerSpec): [number, number][] {
  const r = t.base + 1.1;
  return [-58, -38, 34, 48, 62].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return [t.x + Math.sin(a) * r, t.z + Math.cos(a) * r];
  });
}

/** Kiểm tháp: cỡ hợp lý, đế đủ rộng cho bó ống + lối quanh, chuông gió ngoài đế, góc quay bội 90°. */
export function checkFluteTower(t: FluteTowerSpec): string[] {
  const out: string[] = [];
  if (!t.enabled) return out;
  const p = 'fluteTower';
  if (t.height < 8 || t.height > 16) out.push(`${p}.height: 8–16 m`);
  if (t.base < 3 || t.base > 6) out.push(`${p}.base: 3–6 m`);
  if (t.base * 0.8 < BUNDLE_R + 0.8) out.push(`${p}.base: bậc trên phải rộng hơn bó ống ≥ 0,8 m (base ≥ ${((BUNDLE_R + 0.8) / 0.8).toFixed(1)})`);
  t.chimes.forEach((c, i) => {
    if (Math.hypot(c.x - t.x, c.z - t.z) < t.base + 2.5) out.push(`${p}.chimes[${i}]: cách tâm tháp ≥ ${(t.base + 2.5).toFixed(1)} m`);
    if (c.rotY !== undefined && c.rotY % 90 !== 0) out.push(`${p}.chimes[${i}].rotY: chỉ 0 · 90 · 180 · 270`);
  });
  return out;
}
