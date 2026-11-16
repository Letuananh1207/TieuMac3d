/**
 * Đàn cầm ở bãi giữa Trúc Lâm (R-CAM-1…4): 10 phím ngũ cung Rê (đàn tự do), 3 bài tự soạn nốt rơi 5 làn (theo bài), chấm
 * Hay / Được / trượt, tỉ lệ → hạng → mã kết quả `earnGame` (`dan-cam`). Logic thuần — không three, không DOM, không Web
 * Audio (tiếng: `ui/zitherSound.ts` âm sắc `cam`). Bài tự soạn — không chép bản nhạc của ai.
 */

/** Ngũ cung Rê (như cổ tranh — `zones/danTranh.ts`): Rê · Mi · Fa♯ · La · Si, quãng 4 và quãng 5 (MIDI). */
export const CAM_LOW = [62, 64, 66, 69, 71] as const;
export const CAM_HIGH = [74, 76, 78, 81, 83] as const;
/** Tên năm âm ngũ cung, chỉ chữ Việt (R-HUD-4). */
export const CUNG_NAMES = ['Cung', 'Thương', 'Giốc', 'Chuỷ', 'Vũ'] as const;

/** Phím máy tính của đàn tự do (R-CAM-2): 1–5 quãng thấp, Q W E R T quãng cao — `KeyboardEvent.code` → MIDI. */
export const CAM_KEYS: Readonly<Record<string, number>> = {
  Digit1: CAM_LOW[0], Digit2: CAM_LOW[1], Digit3: CAM_LOW[2], Digit4: CAM_LOW[3], Digit5: CAM_LOW[4],
  KeyQ: CAM_HIGH[0], KeyW: CAM_HIGH[1], KeyE: CAM_HIGH[2], KeyR: CAM_HIGH[3], KeyT: CAM_HIGH[4],
};

/** Làn (0…4) của phím khi theo bài: cả hai hàng phím đều đánh được làn tương ứng. */
export function laneOfKey(code: string): number | null {
  const m = CAM_KEYS[code];
  if (m === undefined) return null;
  const i = CAM_LOW.indexOf(m as (typeof CAM_LOW)[number]);
  return i >= 0 ? i : CAM_HIGH.indexOf(m as (typeof CAM_HIGH)[number]);
}

/* ---------- theo bài (R-CAM-3) ---------- */

/** Phím làn khi theo bài trên máy tính (R-CAM-3, thiết kế 2026-11-16.13): chỉ **1–5** (trùng hàng Trầm của đàn tự do). */
export function songLaneOfKey(code: string): number | null {
  const i = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].indexOf(code);
  return i >= 0 ? i : null;
}

/** Độ dài bài để hiện ("0:45"), làm tròn giây. */
export function songClock(s: CamSong): string {
  const sec = Math.round(songLength(s));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export const CAM_HAY = 0.12;
export const CAM_DUOC = 0.25;
/** Nốt đầu rơi tới vạch sau chừng này giây (kịp nhìn). */
export const CAM_LEAD_IN = 2;

export interface CamSong {
  id: 'suoi-truc' | 'mua-mang' | 'trang-tren-go';
  name: string;
  /** một phách (s) */
  beat: number;
  /** mỗi ký tự một phách: '1'…'5' = làn, '.' = nghỉ */
  score: string;
}

export const SONGS: readonly CamSong[] = [
  { id: 'suoi-truc', name: 'Suối trúc', beat: 0.6, score: '1.2.3.5.3.2.1...2.3.5.4.3.2.3...5.4.3.2.4.3.2.1.1.2.3.5.2.3.1...1...5...1.......' },
  {
    id: 'mua-mang',
    name: 'Mưa măng',
    beat: 0.5,
    score: '5.5.4.3.2.3.4...3.3.2.1.2.1.2...1.2.3.4.5.4.5...4343.2..4.3.2.3.1.......5.5.4.3.2.3.4...3.3.2.1.2121....1.......',
  },
  { id: 'trang-tren-go', name: 'Trăng trên gò', beat: 0.7, score: '1...3...5.4.3...2...4...3.2.1...5...4.5.3...2...1.3.2...1.......5...4.5.1.......' },
];

export type SongId = CamSong['id'];
export const songById = (id: string): CamSong | undefined => SONGS.find((s) => s.id === id);

export interface CamNote {
  /** giây từ lúc bắt đầu bài */
  t: number;
  lane: number;
}

/** Các nốt của bài theo thời gian. */
export function songNotes(s: CamSong): CamNote[] {
  const out: CamNote[] = [];
  [...s.score].forEach((ch, i) => {
    const lane = '12345'.indexOf(ch);
    if (lane >= 0) out.push({ t: CAM_LEAD_IN + i * s.beat, lane });
  });
  return out;
}

/** Dài bài (s, từ nốt đầu tới hết phách cuối). */
export const songLength = (s: CamSong): number => s.score.length * s.beat;

export type CamJudge = 'hay' | 'duoc';

/** Chấm một lần gảy lệch [offset] giây (R-CAM-3); trượt → `null`. */
export function judge(offset: number): CamJudge | null {
  const d = Math.abs(offset);
  if (d <= CAM_HAY) return 'hay';
  if (d <= CAM_DUOC) return 'duoc';
  return null;
}

export type CamRank = 'tri-am' | 'thanh-nha' | 'tap-dan';

/** Tỉ lệ → hạng (R-CAM-3): ≥ 85 % Tri âm · ≥ 60 % Thanh nhã · còn lại Tập đàn. */
export function camRank(ratio: number): CamRank {
  if (ratio >= 0.85) return 'tri-am';
  if (ratio >= 0.6) return 'thanh-nha';
  return 'tap-dan';
}

export const RANK_NAME: Readonly<Record<CamRank, string>> = { 'tri-am': 'Tri âm', 'thanh-nha': 'Thanh nhã', 'tap-dan': 'Tập đàn' };

/** Hạng → mã kết quả `earnGame` (R-CAM-4): Tri âm / Thanh nhã / Tập đàn = thắng / hoà / thua. */
export const rankOutcome = (r: CamRank): 'thang' | 'hoa' | 'thua' => (r === 'tri-am' ? 'thang' : r === 'thanh-nha' ? 'hoa' : 'thua');

/** Một lần chơi theo bài: gảy làn lúc [t] → chấm nốt gần nhất chưa chấm của làn; `update(t)` đánh trượt nốt đã qua. */
export class SongPlay {
  readonly notes: CamNote[];
  /** kết quả từng nốt (`undefined` = chưa tới, `null` = trượt) */
  readonly marks: (CamJudge | null | undefined)[];
  private readonly end: number;

  constructor(readonly song: CamSong) {
    this.notes = songNotes(song);
    this.marks = this.notes.map(() => undefined);
    this.end = CAM_LEAD_IN + songLength(song) + 0.5;
  }

  /** Gảy làn [lane] lúc [t] (giây từ đầu bài). Trả kết quả nốt vừa chấm; không có nốt nào trong tầm → `null`. */
  hit(lane: number, t: number): CamJudge | null {
    let best = -1;
    let bestD = CAM_DUOC;
    this.notes.forEach((n, i) => {
      if (n.lane !== lane || this.marks[i] !== undefined) return;
      const d = Math.abs(n.t - t);
      if (d <= bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best < 0) return null;
    const j = judge(this.notes[best].t - t);
    this.marks[best] = j;
    return j;
  }

  /** Nốt đã qua vạch quá tầm "Được" mà chưa gảy → trượt. */
  update(t: number): void {
    this.notes.forEach((n, i) => {
      if (this.marks[i] === undefined && t - n.t > CAM_DUOC) this.marks[i] = null;
    });
  }

  done(t: number): boolean {
    return t >= this.end;
  }

  /** (Hay × 1 + Được × 0,5) / số nốt. */
  get ratio(): number {
    const pts = this.marks.reduce<number>((s, m) => s + (m === 'hay' ? 1 : m === 'duoc' ? 0.5 : 0), 0);
    return this.notes.length ? pts / this.notes.length : 0;
  }

  get rank(): CamRank {
    return camRank(this.ratio);
  }
}

/** Chỗ ngồi sau đá đàn (R-CAM-1): toạ độ cảnh từ tâm đá + lệch `dx, dz` (trong hệ đá đã quay `rotY` độ). */
export function camSeatAt(prop: { x: number; z: number; rotY?: number }, seat: { dx: number; dz: number; rotY?: number }): { x: number; z: number; rotY: number } {
  const r = ((prop.rotY ?? 0) * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  // quay như three (rotation.y): x' = x cos + z sin, z' = −x sin + z cos
  return { x: prop.x + seat.dx * c + seat.dz * s, z: prop.z - seat.dx * s + seat.dz * c, rotY: (prop.rotY ?? 0) + (seat.rotY ?? 0) };
}

/** Tầm hiện nút "Ngồi đàn" (R-CAM-1 — như án thư, R-NGOI-1). */
export const CAM_SEAT_RANGE = 1.2;
