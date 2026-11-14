/**
 * Nhịp cuộn sách trên tay khi Ngồi ôn (R-HANH-3, R-ON-8 — thiết kế 2026-11-14.10 "Ngồi ôn", tờ `NgoiOn-cuon-sach`).
 * Hàm thuần, không three — `cuonSach.ts` dựng hình theo dáng tính ở đây.
 *   0 → 0,3 s     chưa hiện (vòng sáng dưới đệm nở — `nhapDinh.ts`)
 *   0,3 → 0,45 s  hai trục hiện chập nhau, phóng 0 → 1
 *   0,45 → 1 s    hai trục trượt ra, giấy giãn ngang (chậm dần)
 *   ≥ 1 s         mở hết, giữ mở (thẻ học / màn ôn / Bộ đã học mở rồi đóng — không chạy lại nhịp)
 *   đứng dậy trước 1 s → tắt dần 0,2 s · đứng dậy khi đã mở (hay "Đứng dậy" trên bảng) → hai trục chập về giữa 0,25 s → tắt
 */

/**
 * Chỗ cầm cuộn (m, theo `facing` của nhân vật, gốc = chân): tâm cao `CUON_CAO`, trước tâm thân `CUON_TRUOC` — trước ngực
 * người ngồi xếp bằng (nhân vật cao 2,1 m, ngồi hạ ~0,3 m). Dáng tay chibi tính theo chỗ này (`player/chibiPose.ts`).
 */
export const CUON_CAO = 0.55;
export const CUON_TRUOC = 0.55;
/** nửa bề ngang cuộn mở hết (tới mép ngoài đầu trục) — tay cầm ngoài mép này */
export const CUON_NUA_NGANG = 0.15;

export const CUON_HIEN = 0.3;
export const CUON_PHONG = 0.15;
export const CUON_MO_XONG = 1;
export const CUON_TAT = 0.2;
export const CUON_CUON_LAI = 0.25;

/**
 * Trạng thái: `an` không có cuộn · `ngoi` đang ngồi ôn được `t` giây · `tat` tắt dần từ dáng lúc `tu` giây, đã `k` giây ·
 * `cuon` đang cuộn lại, đã `k` giây · `xong` cuộn lại xong mà còn ngồi (chờ đứng dậy, không hiện lại).
 */
export type CuonState =
  | { readonly kind: 'an' }
  | { readonly kind: 'ngoi'; readonly t: number }
  | { readonly kind: 'tat'; readonly tu: number; readonly k: number }
  | { readonly kind: 'cuon'; readonly k: number }
  | { readonly kind: 'xong' };

export const CUON_AN: CuonState = { kind: 'an' };

/** Dáng để vẽ: `scale` cỡ hai trục (0 → 1) · `mo` độ mở giấy (0 chập, 1 mở hết) · `alpha` độ hiện (tắt dần). */
export interface CuonPose {
  readonly visible: boolean;
  readonly scale: number;
  readonly mo: number;
  readonly alpha: number;
}

const HIDDEN: CuonPose = { visible: false, scale: 0, mo: 0, alpha: 0 };
const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
/** chậm dần */
const easeOut = (x: number): number => 1 - (1 - clamp01(x)) ** 3;
const easeInOut = (x: number): number => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/** Dáng khi đã ngồi ôn `t` giây. */
export function poseAt(t: number): CuonPose {
  if (t < CUON_HIEN) return HIDDEN;
  const scale = easeOut((t - CUON_HIEN) / CUON_PHONG);
  const moTu = CUON_HIEN + CUON_PHONG;
  const mo = easeOut((t - moTu) / (CUON_MO_XONG - moTu));
  return { visible: true, scale, mo, alpha: 1 };
}

/** Cuộn đã mở hết (bảng chọn đã hiện) ở trạng thái này chưa. */
export function isOpen(s: CuonState): boolean {
  return s.kind === 'ngoi' && s.t >= CUON_MO_XONG;
}

/**
 * Một khung. `sitT` = số giây đã ngồi ôn, `null` = không ngồi ôn (đứng dậy / ngồi vào chỗ ngồi).
 * `rollUp` = "Đứng dậy" trên bảng: cuộn lại trước, nhân vật vẫn ngồi tới khi xong.
 */
export function stepCuon(s: CuonState, dt: number, sitT: number | null, rollUp = false): CuonState {
  if (s.kind === 'cuon') {
    const k = s.k + dt;
    if (k < CUON_CUON_LAI) return { kind: 'cuon', k };
    return sitT === null ? CUON_AN : { kind: 'xong' };
  }
  if (s.kind === 'xong') return sitT === null ? CUON_AN : s;
  if (rollUp && isOpen(s)) return { kind: 'cuon', k: 0 };
  if (sitT !== null) return { kind: 'ngoi', t: sitT };
  if (s.kind === 'ngoi') {
    if (s.t >= CUON_MO_XONG) return { kind: 'cuon', k: 0 };
    return s.t < CUON_HIEN ? CUON_AN : { kind: 'tat', tu: s.t, k: dt };
  }
  if (s.kind === 'tat') {
    const k = s.k + dt;
    return k < CUON_TAT ? { kind: 'tat', tu: s.tu, k } : CUON_AN;
  }
  return s;
}

/** Dáng để vẽ theo trạng thái. */
export function poseOf(s: CuonState): CuonPose {
  switch (s.kind) {
    case 'ngoi':
      return poseAt(s.t);
    case 'tat': {
      const p = poseAt(s.tu);
      return { ...p, alpha: 1 - clamp01(s.k / CUON_TAT) };
    }
    case 'cuon':
      return { visible: true, scale: 1, mo: 1 - easeInOut(s.k / CUON_CUON_LAI), alpha: 1 };
    default:
      return HIDDEN;
  }
}

/**
 * Cuộn sách trước mắt khi nhìn từ mắt (R-DIEU-7, R-ON-8): đặt vừa khung màn thay vì cố định theo mét — màn dọc hẹp
 * (~36° ngang sau khi nới FOV), màn ngang rộng. `fovDeg` FOV dọc đang dùng, `aspect` rộng / cao, `halfW` / `halfH` nửa bề
 * ngang / nửa chiều cao cả cuộn (m). Trả `dist` khoảng cách từ mắt tới tâm cuộn theo hướng nhìn chuẩn, `side` dời ngang
 * (m, dương = sang phải người cầm — màn ngang: cuộn lệch phải, cảnh bên trái).
 * Dọc: cuộn rộng ~74 % bề ngang (chừa chỗ cho hai bàn tay ở hai mép); ngang: cao ~62 % chiều cao, lệch phải ~30 % nửa màn. Khoảng cách giữ trong tầm tay.
 */
export const CUON_GAN = 0.3;
export const CUON_XA = 0.7;

export function fitScroll(fovDeg: number, aspect: number, halfW: number, halfH: number): { dist: number; side: number } {
  const tv = Math.tan((fovDeg * Math.PI) / 360);
  const th = tv * aspect;
  const byW = halfW / (0.74 * th);
  const byH = halfH / (0.62 * tv);
  const dist = Math.min(CUON_XA, Math.max(CUON_GAN, byW, byH));
  const side = aspect > 1 ? 0.3 * th * dist : 0;
  return { dist, side };
}
