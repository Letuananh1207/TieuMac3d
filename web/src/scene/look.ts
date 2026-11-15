/**
 * Kiểu nhìn của cảnh (kế hoạch docs/tasks/2026-11-14-canh-dep.md; quyết định decisions/0005-canh-hoat-hinh-mem.md):
 * `cu` = cảnh như trước (mặc định — map chưa chuyển không đổi gì) · `mem` = "hoạt hình mềm, màu ấm": quản lý màu đúng
 * chuẩn (hex hiểu là sRGB), vật liệu mềm + bóng nướng sẵn, vòm trời, mây phồng, cây tán tròn, cỏ gió + hoa, nước stylized,
 * quầng đèn, vignette. Khi `style` là `cu` mọi trường khác bị bỏ qua. Thuần (không three, không DOM).
 */
export const LOOK_STYLES = ['cu', 'mem'] as const;

/**
 * Đường màu của cảnh mềm: `chuan` = quản lý màu đúng chuẩn (hex hiểu là sRGB — decisions/0005) · `cu` = đường màu cũ
 * (ColorManagement tắt như cảnh `cu`: cùng mã hex cho ra đúng màu ảnh cũ, nhạt hơn) — giữ hiệu ứng mềm, màu như trước
 * (V-20261114-25). Cảnh `style: "cu"` luôn dùng đường cũ.
 */
export const COLOR_PIPELINES = ['chuan', 'cu'] as const;

export interface LookSpec {
  style: (typeof LOOK_STYLES)[number];
  /** đường màu khi `style` là `mem` (xem `COLOR_PIPELINES`) */
  colorPipeline: (typeof COLOR_PIPELINES)[number];
  /** wrap lighting 0…1 — mặt khuất nắng vẫn nhận phần sáng này (không đen) */
  wrap: number;
  /** bóng nướng sẵn: độ sẫm tối đa (gầm mái), chiều cao chân tường sẫm (m), chân tường = bao nhiêu phần `ao`, màu bóng */
  ao: number;
  foot: number;
  footShare: number;
  aoTint: string;
  /** vòm trời: màu quầng quanh mặt trời, độ rộng quầng (0…1 — 0 = không quầng) */
  sunGlow: string;
  glowSize: number;
  /**
   * vòm trời: độ cao hướng nhìn (sin góc ngẩng, 0…1) nơi trời đạt màu giữa (`mid`) và màu đỉnh (`top`). Thấp hơn = màu
   * đỉnh xuống gần chân trời — gần ảnh nền gradient theo màn hình của cảnh cũ khi nhìn ngang.
   */
  skyBands: { mid: number; top: number };
  /** mây phồng đục: màu bụng mây (thân dùng `floating.clouds.color`) */
  cloudBelly: string;
  /** dải sương giữa các lớp núi xa: màu, độ đặc (0 = không có) */
  mist: { color: string; opacity: number };
  /** hoa rải thành khóm trên đất cỏ: số bông trên 100 m² (0 = tắt), 4 màu */
  flowers: { density: number; colors: [string, string, string, string] };
  /** gió lay cỏ, hoa, tán cây: biên độ ở ngọn (m); 0 = đứng yên */
  wind: number;
  /** nước: nông (sát bờ), sâu (giữa), viền bọt, độ gợn sáng (0 = không gợn) */
  water: { shallow: string; deep: string; foam: string; ripple: number };
  /** quầng sáng giả quanh đèn lồng / đèn đá: màu, bán kính (m; 0 = tắt) */
  lanternGlow: { color: string; size: number };
  /** tối nhẹ mép màn (CSS, không tốn GPU): 0 = tắt … 1 = rất tối; màu tối ở mép */
  vignette: number;
  vignetteColor: string;
}

/** Mặc định: cảnh cũ. Các số còn lại là bảng màu A "Xuân ấm" (hồ sơ docs/tham_khao/canh-hoat-hinh-mem.md) để bật nhanh. */
export const DEFAULT_LOOK: LookSpec = {
  style: 'cu',
  colorPipeline: 'chuan',
  wrap: 0.5,
  ao: 0.4,
  foot: 0.8,
  footShare: 0.55,
  aoTint: '#6b5a70',
  sunGlow: '#fff2d0',
  glowSize: 0.35,
  skyBands: { mid: 0.3, top: 1 },
  cloudBelly: '#f4d9d0',
  mist: { color: '#f1e6d6', opacity: 0.55 },
  flowers: { density: 6, colors: ['#f4a7b9', '#fff6e5', '#f6cf5e', '#b9a3e3'] },
  wind: 0.06,
  water: { shallow: '#8fd3d0', deep: '#3e8fa8', foam: '#f4fbf8', ripple: 0.6 },
  lanternGlow: { color: '#ffc27a', size: 1.6 },
  vignette: 0.35,
  vignetteColor: '#3c2834',
};

/** Cảnh có bật kiểu mềm không. */
export const isSoft = (look: LookSpec): boolean => look.style === 'mem';

/** Bật quản lý màu đúng chuẩn không (`createStage({ colorManaged })`): chỉ cảnh mềm có đường màu `chuan`. */
export const isColorManaged = (look: LookSpec): boolean => isSoft(look) && look.colorPipeline === 'chuan';

/** Lỗi khoảng giá trị của `look` (bổ sung cho kiểm kiểu chung). */
export function checkLook(l: LookSpec): string[] {
  const out: string[] = [];
  if (!LOOK_STYLES.includes(l.style)) out.push(`look.style: chỉ ${LOOK_STYLES.join(' · ')}`);
  if (!COLOR_PIPELINES.includes(l.colorPipeline)) out.push(`look.colorPipeline: chỉ ${COLOR_PIPELINES.join(' · ')}`);
  const unit: [string, number][] = [
    ['wrap', l.wrap],
    ['ao', l.ao],
    ['footShare', l.footShare],
    ['glowSize', l.glowSize],
    ['mist.opacity', l.mist.opacity],
    ['water.ripple', l.water.ripple],
    ['vignette', l.vignette],
  ];
  for (const [k, v] of unit) if (v < 0 || v > 1) out.push(`look.${k}: 0…1 (đang ${v})`);
  const pos: [string, number][] = [
    ['foot', l.foot],
    ['flowers.density', l.flowers.density],
    ['wind', l.wind],
    ['lanternGlow.size', l.lanternGlow.size],
  ];
  for (const [k, v] of pos) if (v < 0) out.push(`look.${k}: phải ≥ 0`);
  const { mid, top } = l.skyBands;
  if (!(mid > 0 && mid < top && top <= 1)) out.push(`look.skyBands: cần 0 < mid < top ≤ 1 (đang ${mid}, ${top})`);
  if (l.flowers.density > 30) out.push(`look.flowers.density: tối đa 30 bông / 100 m² (đang ${l.flowers.density} — nặng cho điện thoại)`);
  return out;
}

/**
 * Tham số URL `?look=cu` (Canvas 3D / thử): ép kiểu cũ để so trước / sau — cả dáng cây (`trees.crown` → `cau`, V-60). Trả
 * đặc tả mới, không sửa đặc tả gốc.
 */
export function withLookParam<T extends { look: LookSpec; trees?: { crown: string } }>(spec: T, param: string | null): T {
  if (param !== 'cu') return spec;
  const oldTrees = !!spec.trees && spec.trees.crown !== 'cau';
  if (spec.look.style === 'cu' && !oldTrees) return spec;
  const out: T = { ...spec, look: { ...spec.look, style: 'cu' } };
  if (oldTrees) out.trees = { ...spec.trees, crown: 'cau' };
  return out;
}
