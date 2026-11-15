/**
 * Tiếng đàn cổ tranh ở Quảng Trường (R-AM-2, nhạc công R-NPC-9): bản nhạc ngũ cung lặp vòng kiểu "đài phát" (nốt nào
 * theo đồng hồ thật — mọi người nghe cùng một đoạn), âm lượng theo khoảng cách, lên / xuống mượt. Thuần (không DOM,
 * không Web Audio) — `ui/zitherSound.ts` tổng hợp tiếng dây, `danTranh.ts` (gốc) ghép.
 */

/** Gần hơn chừng này (m) → đầy; xa từ `DAN_SILENT` trở lên → không nghe (R-AM-2). */
export const DAN_FULL = 3;
export const DAN_SILENT = 15;
/** Lên / xuống giữa 0 và đầy mất chừng này giây (màn che, màn tải, đổi cảnh). */
export const DAN_RAMP_SECONDS = 1;
/** Một phách (s) — nhịp chậm, khoan thai. */
export const DAN_BEAT = 0.75;
/** Khung dài hơn chừng này (s) thì không phát bù các nốt đã lỡ (app vừa về từ nền, khung bị lỡ). */
export const DAN_MAX_GAP = 0.5;

export interface DanNote {
  /** giây trong vòng */
  t: number;
  /** cao độ MIDI (62 = Rê 4) */
  midi: number;
  /** lực gảy 0…1 */
  vel: number;
}

/** Ngũ cung Rê (Rê · Mi · Fa♯ · La · Si) — cách lên dây phổ biến của cổ tranh 21 dây. */
const D3 = 50;
const A3 = 57;
const D4 = 62;
const E4 = 64;
const FS4 = 66;
const A4 = 69;
const B4 = 71;
const D5 = 74;
const E5 = 76;
const FS5 = 78;
const A5 = 81;
const GLISS = [A5, FS5, E5, D5, B4, A4, FS4, E4, D4];

/** Vuốt dây (quát tấu) — chuỗi nốt nhanh cách nhau 0,06 s, đặc trưng cổ tranh. */
const gliss = (beat: number, notes: readonly number[]): [number, number, number][] => notes.map((m, i) => [beat + (i * 0.06) / DAN_BEAT, m, 0.45]);

/** [phách, MIDI, lực] — 40 phách = 30 s, tự soạn (không chép bản nhạc của ai). */
const SCORE: [number, number, number][] = [
  ...gliss(0, GLISS),
  [2, A4, 0.8], [3, B4, 0.6], [3.5, A4, 0.6], [4, FS4, 0.75], [6, E4, 0.7], [6.5, FS4, 0.6], [7, A4, 0.7], [8, D5, 0.9],
  [10, B4, 0.7], [11, A4, 0.6], [11.5, B4, 0.6], [12, D5, 0.8], [13, E5, 0.75], [14, D5, 0.7], [14.5, B4, 0.6], [15, A4, 0.75],
  ...gliss(16, [...GLISS].reverse()),
  [18, FS5, 0.8], [19, E5, 0.7], [19.5, D5, 0.6], [20, B4, 0.75], [22, A4, 0.7], [23, B4, 0.6], [23.5, A4, 0.6], [24, FS4, 0.7],
  [25, E4, 0.65], [26, D4, 0.85], [28, A3, 0.7], [29, D4, 0.65], [29.5, E4, 0.6], [30, FS4, 0.7], [31, A4, 0.75], [32, B4, 0.7],
  [33, A4, 0.65], [33.5, FS4, 0.6], [34, E4, 0.7], [36, D4, 0.8], [36, D3, 0.7],
];

/** Các nốt của vòng, theo thời gian tăng dần. */
export const DAN_NOTES: readonly DanNote[] = SCORE.map(([b, midi, vel]) => ({ t: b * DAN_BEAT, midi, vel })).sort((a, b) => a.t - b.t);
/** Dài một vòng (s). */
export const DAN_LOOP = 40 * DAN_BEAT;

/** Tần số (Hz) của nốt MIDI. */
export const midiHz = (midi: number): number => 440 * 2 ** ((midi - 69) / 12);

/** Âm lượng 0…1 theo khoảng cách (chỉ x, z): ≤ 3 m → 1, giảm đều, ≥ 15 m → 0 (R-AM-2). */
export function danVolume(dist: number): number {
  if (!(dist > DAN_FULL)) return 1;
  if (dist >= DAN_SILENT) return 0;
  return (DAN_SILENT - dist) / (DAN_SILENT - DAN_FULL);
}

/** Bước âm lượng `v` về `target` trong `dt` giây, đi hết 0 ↔ 1 trong `DAN_RAMP_SECONDS`. */
export function danRamp(v: number, target: number, dt: number): number {
  const step = Math.max(0, dt) / DAN_RAMP_SECONDS;
  return v < target ? Math.min(target, v + step) : Math.max(target, v - step);
}

/**
 * Các nốt rơi vào khoảng (`fromSec`, `toSec`] (giây đồng hồ thật, từ 1970) — vòng lặp theo `DAN_LOOP`. Khoảng ≤ 0 hoặc dài
 * hơn `maxGap` → không nốt nào (không phát bù).
 */
export function danNotesBetween(fromSec: number, toSec: number, maxGap = DAN_MAX_GAP): DanNote[] {
  const gap = toSec - fromSec;
  if (!(gap > 0) || gap > maxGap) return [];
  const a = ((fromSec % DAN_LOOP) + DAN_LOOP) % DAN_LOOP;
  const b = a + gap;
  return DAN_NOTES.filter((n) => (n.t > a && n.t <= b) || (n.t + DAN_LOOP > a && n.t + DAN_LOOP <= b));
}

/** Tay phải nhạc công: 0 ngay lúc gảy, nhấc dần lên 1 sau 0,25 s. */
export const pluckLift = (sinceNote: number): number => Math.min(1, Math.max(0, sinceNote / 0.25));
