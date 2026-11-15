/**
 * Một ván Lưu Thương theo thời gian (R-LUU-2…5): mỗi lượt `tha` (Thi Ông thả chén lệnh) → `troi` (chén trôi 3–6 s, chậm
 * dần rồi dừng trước người tới lượt) → `hoi` (người chơi: chạm là chọn, hết 20 s = sai) hoặc `nghi` (văn nhân 1,5–3 s) →
 * `cham` (hiện chữ đúng) → lượt sau; hết 8 lượt → `het`. Logic thuần — không three, không DOM; nơi ghép đặt chén theo
 * `drift` và đọc `phase` để vẽ.
 */
import { emptyScores, luuOutcome, makeQuestions, npcChoice, turnOrder, type LuuQuestion, type LuuScores, type LuuSeat } from './luuThuong';

/** Thi Ông thả chén (s). */
export const LUU_RELEASE = 0.6;
/** Chén trôi trong khoảng [MIN, MIN + SPAN) giây (R-LUU-2). */
export const LUU_DRIFT_MIN = 3;
export const LUU_DRIFT_SPAN = 3;
/** Người chơi có chừng này giây để chọn (R-LUU-3). */
export const LUU_ANSWER_SECONDS = 20;
/** Văn nhân nghĩ trong khoảng [MIN, MIN + SPAN) giây (R-LUU-4). */
export const LUU_THINK_MIN = 1.5;
export const LUU_THINK_SPAN = 1.5;
/** Hiện chữ đúng bao lâu rồi sang lượt sau. */
export const LUU_REVEAL = 1.6;

export type LuuPhase = 'tha' | 'troi' | 'hoi' | 'nghi' | 'cham' | 'het';

/** Chậm dần khi tới đích (xoáy chậm rồi dừng): 0 → 0, 1 → 1, đạo hàm cuối = 0. */
export const easeStop = (k: number): number => 1 - (1 - Math.min(1, Math.max(0, k))) ** 2;

export class LuuThuongRound {
  readonly questions: LuuQuestion[];
  readonly scores: LuuScores = emptyScores();
  /** kết quả từng lượt đã chấm */
  readonly marks: boolean[] = [];
  phase: LuuPhase = 'tha';
  /** chỉ số lượt đang chơi */
  turn = 0;
  /** ô vừa chọn khi `cham` (`null` = hết giờ) */
  picked: number | null = null;
  lastRight = false;
  private timer = LUU_RELEASE;
  private span = 0;

  constructor(
    learnedIds: readonly string[],
    private readonly rng: () => number = Math.random,
    order: readonly LuuSeat[] = turnOrder(rng),
  ) {
    this.questions = makeQuestions(learnedIds, order, rng);
    if (!this.questions.length) this.phase = 'het';
  }

  get question(): LuuQuestion | undefined {
    return this.questions[this.turn];
  }

  /** Người tới lượt. */
  get seat(): LuuSeat | undefined {
    return this.question?.by;
  }

  /** Chén lệnh đi được bao nhiêu phần đường (0…1, đã chậm dần) — 0 khi `tha`, 1 từ lúc dừng. */
  get drift(): number {
    if (this.phase === 'tha') return 0;
    if (this.phase !== 'troi') return 1;
    return easeStop(1 - this.timer / this.span);
  }

  /** Giây còn lại để chọn (chỉ khi `hoi`). */
  get left(): number {
    return this.phase === 'hoi' ? Math.max(0, this.timer) : 0;
  }

  /** Kết quả của người chơi khi `het` (R-LUU-5). */
  get outcome(): 'thang' | 'hoa' | 'thua' {
    return luuOutcome(this.scores);
  }

  /** Người chạm ô [option] (chạm là chọn). Không phải lượt người / đang chấm → `false`. */
  choose(option: number): boolean {
    if (this.phase !== 'hoi') return false;
    this.resolve(option);
    return true;
  }

  /** Vừa xong pha `troi` trong khung này (chén vừa dừng — tiếng gỗ, R-LUU-2). */
  stoppedNow = false;

  update(dt: number): void {
    this.stoppedNow = false;
    if (this.phase === 'het') return;
    this.timer -= dt;
    if (this.timer > 0) return;
    const q = this.question;
    if (!q) return;
    if (this.phase === 'tha') {
      this.phase = 'troi';
      this.span = LUU_DRIFT_MIN + this.rng() * LUU_DRIFT_SPAN;
      this.timer = this.span;
    } else if (this.phase === 'troi') {
      this.stoppedNow = true;
      if (q.by === 'nguoi') {
        this.phase = 'hoi';
        this.timer = LUU_ANSWER_SECONDS;
      } else {
        this.phase = 'nghi';
        this.timer = LUU_THINK_MIN + this.rng() * LUU_THINK_SPAN;
      }
    } else if (this.phase === 'hoi') this.resolve(null); // hết 20 s = sai
    else if (this.phase === 'nghi') this.resolve(npcChoice(q, this.rng));
    else if (this.phase === 'cham') {
      this.turn++;
      this.picked = null;
      if (this.turn >= this.questions.length) this.phase = 'het';
      else {
        this.phase = 'tha';
        this.timer = LUU_RELEASE;
      }
    }
  }

  private resolve(option: number | null): void {
    const q = this.question;
    if (!q) return;
    this.picked = option;
    this.lastRight = option === q.answer;
    if (this.lastRight) this.scores[q.by]++;
    this.marks.push(this.lastRight);
    this.phase = 'cham';
    this.timer = LUU_REVEAL;
  }
}
