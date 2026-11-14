/**
 * Một ván Đấu chữ theo thời gian (R-DAU-2): câu của người → chờ chạm; câu của Mặc Ông → nghĩ 1–2 giây rồi chọn; chọn
 * xong → hiện nghĩa đúng ~1 giây → câu sau; hết 10 câu → `het`. Logic thuần — không three, không DOM.
 */
import { CharDuel, npcPick, type DuelQuestion, type Side } from './charDuel';

/** Hiện nghĩa đúng bao lâu (giây) rồi sang câu sau. */
export const REVEAL_SECONDS = 1;
/** Mặc Ông nghĩ trong khoảng [MIN, MIN + SPAN) giây. */
export const NPC_THINK_MIN = 1;
export const NPC_THINK_SPAN = 1;

export type DuelPhase = 'hoi' | 'nghi' | 'cham' | 'het';

export class DuelRound {
  readonly duel: CharDuel;
  /** kết quả từng câu đã chấm */
  readonly marks: boolean[] = [];
  phase: DuelPhase = 'hoi';
  /** chỉ số câu đang hiện (khi `cham`: câu vừa chấm) */
  shown = 0;
  /** ô vừa được chọn (khi `cham`) */
  picked: number | null = null;
  /** ai vừa trả lời, đúng không (khi `cham`) */
  lastBy: Side | null = null;
  lastRight = false;
  private timer = 0;

  constructor(
    questions: DuelQuestion[],
    private readonly rng: () => number = Math.random,
  ) {
    this.duel = new CharDuel(questions);
    this.begin();
  }

  /** Câu đang hiện. */
  get question(): DuelQuestion | undefined {
    return this.duel.questions[this.shown];
  }

  private begin(): void {
    const q = this.duel.current;
    if (!q) {
      this.phase = 'het'; // giữ câu cuối đang hiện (thẻ kết quả đè lên)
      return;
    }
    this.shown = this.duel.index;
    this.picked = null;
    this.lastBy = null;
    if (q.answerer === 'npc') {
      this.phase = 'nghi';
      this.timer = NPC_THINK_MIN + this.rng() * NPC_THINK_SPAN;
    } else this.phase = 'hoi';
  }

  private resolve(option: number): void {
    const q = this.duel.current;
    if (!q) return;
    this.lastBy = q.answerer;
    this.lastRight = this.duel.answer(option);
    this.marks.push(this.lastRight);
    this.picked = option;
    this.phase = 'cham';
    this.timer = REVEAL_SECONDS;
  }

  /** Người chạm một nghĩa (R-DAU-2: chạm là chọn). Không phải lượt người / đang chấm → `false`. */
  choose(option: number): boolean {
    if (this.phase !== 'hoi') return false;
    this.resolve(option);
    return true;
  }

  update(dt: number): void {
    if (this.phase === 'nghi') {
      this.timer -= dt;
      const q = this.duel.current;
      if (this.timer <= 0 && q) this.resolve(npcPick(q, this.rng));
    } else if (this.phase === 'cham') {
      this.timer -= dt;
      if (this.timer <= 0) this.begin();
    }
  }
}
