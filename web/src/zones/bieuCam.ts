/**
 * Biểu cảm nhân vật (R-BIEU-1/2 — kế hoạch docs/tasks/2026-11-15-thanh-cong-cu.md): 8 biểu cảm, tên Việt, thời lượng,
 * kiểu diễn. Thuần — test `bieuCam.test.ts`. Dáng 3D ở `player/bieuCamDang.ts` (theo mã), đồng hồ ở
 * `player/controller.ts` `emote()`; bảng chọn `ui/emotePanel.ts`, bong bóng hình `ui/emoteBubble.ts` (thiết kế 2026-11-15.35).
 */

export type EmoteId = 'vay-tay' | 'chap-tay' | 'cui-chao' | 'vo-tay' | 'cuoi' | 'nhay-mung' | 'suy-nghi' | 'ngoi-nghi';

export interface Emote {
  id: EmoteId;
  /** tên trên bảng (chỉ tiếng Việt — R-HUD-4) */
  name: string;
  /** số giây diễn; `Infinity` = giữ tới khi đi (Ngồi nghỉ) */
  seconds: number;
  /** ngồi xếp bằng (Ngồi nghỉ) — không mở cuộn sách, không tính học, nút Ngồi ôn không sáng */
  sits: boolean;
  /** gọi đúng động tác Chào có sẵn (`PlayerController.bow` — R-DIEU-7) thay vì dáng riêng */
  asBow: boolean;
  /** có bong bóng hình trên đầu (R-BIEU-1/3 — Chắp tay, Cúi chào, Ngồi nghỉ: không) */
  bubble: boolean;
}

const e = (id: EmoteId, name: string, seconds: number, o: Partial<Pick<Emote, 'sits' | 'asBow' | 'bubble'>> = {}): Emote => ({
  id,
  name,
  seconds,
  sits: o.sits ?? false,
  asBow: o.asBow ?? false,
  bubble: o.bubble ?? true,
});

/** Thứ tự trên bảng biểu cảm (R-BIEU-1); máy tính tạm: B rồi phím số 1…8 theo thứ tự này. */
export const EMOTES: readonly Emote[] = [
  e('vay-tay', 'Vẫy tay', 1.8),
  e('chap-tay', 'Chắp tay', 1.6, { asBow: true, bubble: false }),
  e('cui-chao', 'Cúi chào', 2, { bubble: false }),
  e('vo-tay', 'Vỗ tay', 1.6),
  e('cuoi', 'Cười', 1.8),
  e('nhay-mung', 'Nhảy mừng', 1.6),
  e('suy-nghi', 'Suy nghĩ', 2.5),
  e('ngoi-nghi', 'Ngồi nghỉ', Infinity, { sits: true, bubble: false }),
];

/** Bong bóng hình trên đầu hiện khoảng bấy nhiêu giây (R-BIEU-1). */
export const EMOTE_BUBBLE_SECONDS = 2.5;
/** Bong bóng hình: phóng 90 → 100 % trong 0,15 s, giữ, mờ 0,4 s (thiết kế 2026-11-15.35 `BieuCam-bong-bong`). */
export const EMOTE_BUBBLE_GROW_S = 0.15;
export const EMOTE_BUBBLE_FADE_S = 0.4;

/**
 * Bong bóng hình [age] giây sau khi chọn (R-BIEU-1/3): độ đậm + cỡ; hết (sau 2,5 s + 0,4 s mờ) → null. Giảm chuyển động →
 * hiện / tắt không phóng to (cỡ luôn 1).
 */
export function emoteBubbleLook(age: number, reducedMotion: boolean): { opacity: number; scale: number } | null {
  if (age < 0 || age >= EMOTE_BUBBLE_SECONDS + EMOTE_BUBBLE_FADE_S) return null;
  const opacity = age <= EMOTE_BUBBLE_SECONDS ? 1 : 1 - (age - EMOTE_BUBBLE_SECONDS) / EMOTE_BUBBLE_FADE_S;
  const scale = reducedMotion ? 1 : 0.9 + 0.1 * Math.min(1, age / EMOTE_BUBBLE_GROW_S);
  return { opacity, scale };
}

export function emoteById(id: string): Emote | undefined {
  return EMOTES.find((x) => x.id === id);
}

/** Phím số 1…8 (sau khi bấm B) → biểu cảm; ngoài khoảng → null. */
export function emoteByDigit(n: number): Emote | null {
  return Number.isInteger(n) && n >= 1 && n <= EMOTES.length ? EMOTES[n - 1] : null;
}
