/**
 * Lớp phủ cưỡi hạc theo thiết kế 2026-11-15.9 (`design/docs/screen_specs.md` "Cưỡi hạc", artboard `CuoiHac-nhip`):
 * độ mờ của màn mây / khối chữ / gợi ý theo giây của từng khúc + chuỗi. Thuần (không DOM) — test `craneView.test.ts`;
 * `craneHud.ts` chỉ áp số ra DOM.
 */
import { CRANE_TIMING, type CraneHint } from '../zones/cuoiHac';

/** chuỗi theo `design/l10n/vi.arb` (crane*) — chỉ tiếng Việt (R-HUD-4) */
export const CRANE_TEXT = {
  flyingTo: 'Cưỡi hạc tới',
  tapToSkip: 'Chạm để bỏ qua',
  almostThere: 'Sắp tới nơi',
} as const;

/** chữ gợi ý dưới màn theo trạng thái (đã chạm mà cảnh chưa xong → "Sắp tới nơi" + 3 chấm) */
export const hintText = (h: CraneHint): string => (h === 'sapToi' ? CRANE_TEXT.almostThere : CRANE_TEXT.tapToSkip);

/** Nhịp của bảng `CuoiHac-nhip` (giây). Phủ / tan mây lấy từ `CRANE_TIMING` (R-HANH-5). */
export const CRANE_UI = {
  /** khung hình đầu cảnh bay → nền mây + mây phồng mờ ra (ease-out) */
  cloudOut: 0.5,
  /** gợi ý chạm hiện trễ sau khung hình đầu… */
  hintDelay: 0.6,
  /** …rồi mờ vào */
  hintIn: 0.3,
} as const;

/** Độ mờ 0…1 của ba lớp. */
export interface CraneFrame {
  /** nền mây + mây phồng */
  veil: number;
  /** khối chữ trên (dòng phụ, tên nơi, vạch tiến độ) */
  text: number;
  /** gợi ý dưới */
  hint: number;
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const easeOut = (k: number): number => 1 - (1 - k) ** 2;

/**
 * Khúc bay (trang mới). `t`: giây từ lúc vẽ xong khung hình đầu cảnh bay (âm = chưa vẽ → màn mây kín);
 * `cover`: giây từ lúc hết bay, mây phủ lại (âm = chưa). Khối chữ đứng yên suốt lúc mây tan; khi phủ thì chữ + gợi ý
 * mờ đi cùng lúc mây phủ.
 */
export function flightFrame(t: number, cover = -1): CraneFrame {
  if (t < 0) return { veil: 1, text: 1, hint: 0 };
  const out = cover >= 0 ? clamp01(cover / CRANE_TIMING.cover) : 0;
  const veil = Math.max(1 - easeOut(clamp01(t / CRANE_UI.cloudOut)), out);
  const hint = clamp01((t - CRANE_UI.hintDelay) / CRANE_UI.hintIn);
  return { veil, text: 1 - out, hint: hint * (1 - out) };
}

/**
 * Khúc cất cánh (cảnh thật, trang cũ): `veil` = mây phủ của khúc (đồng hồ / bỏ qua). Cảnh thật không chữ, không gợi ý;
 * khối chữ hiện cùng mây phủ để lúc tải lại trang khớp màn mây của trang mới (không nhảy chữ).
 */
export function departFrame(veil: number): CraneFrame {
  const v = clamp01(veil);
  return { veil: v, text: v, hint: 0 };
}

/** Khúc hạ cánh / bỏ qua lúc cảnh đã xong: `t` giây từ lúc lộ cảnh thật — mây tan `CRANE_TIMING.uncover`, không chữ. */
export function landFrame(t: number): CraneFrame {
  return { veil: 1 - clamp01(t / CRANE_TIMING.uncover), text: 0, hint: 0 };
}
