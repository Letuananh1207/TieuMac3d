/**
 * Đấu chữ với Mặc Ông (R-DAU-1, R-DAU-2): 10 câu, mỗi câu một bộ thủ ĐÃ HỌC + 4 nghĩa (1 đúng, 3 nhiễu từ 50 bộ của
 * Rừng trúc); câu lẻ người chọn, câu chẵn NPC chọn (đúng ~70 %). Chỉ ôn — không mở thẻ học, không ghi tiến độ (R-VUNG-1).
 * Logic thuần — không three, không DOM.
 */
import { RADICALS, type Radical } from '../zones/radicals';

export const DUEL_QUESTIONS = 10;
export const NPC_ACCURACY = 0.7;

export type Side = 'nguoi' | 'npc';

export interface DuelQuestion {
  radical: Radical;
  /** 4 nghĩa khác nhau */
  options: string[];
  /** chỉ số nghĩa đúng trong `options` */
  answer: number;
  /** ai trả lời câu này: câu 1, 3, 5… (chỉ số 0, 2, 4…) là người */
  answerer: Side;
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 10 câu từ các bộ đã học (`learnedIds` — mã trong `RADICALS`). Hai câu liền nhau không cùng bộ (trừ khi chỉ học 1 bộ).
 * Không học bộ nào (hoặc mã lạ hết) → mảng rỗng: không có ván (R-DAU-1).
 */
export function makeQuestions(
  learnedIds: readonly string[],
  rng: () => number = Math.random,
  pool: readonly Radical[] = RADICALS,
  count = DUEL_QUESTIONS,
): DuelQuestion[] {
  const learned = pool.filter((r) => learnedIds.includes(r.id));
  if (learned.length === 0) return [];
  const picks: Radical[] = [];
  let bag: Radical[] = [];
  while (picks.length < count) {
    if (bag.length === 0) bag = shuffle(learned, rng);
    const prev = picks[picks.length - 1];
    let k = bag.findIndex((r) => r !== prev);
    if (k < 0) k = 0; // chỉ còn đúng bộ vừa hỏi (học 1 bộ, hoặc túi mới bắt đầu bằng bộ đó và chỉ có nó)
    picks.push(bag.splice(k, 1)[0]);
  }
  const meanings = [...new Set(pool.map((r) => r.meaning))];
  return picks.map((radical, i) => {
    const wrong = shuffle(
      meanings.filter((m) => m !== radical.meaning),
      rng,
    ).slice(0, 3);
    const options = shuffle([radical.meaning, ...wrong], rng);
    return { radical, options, answer: options.indexOf(radical.meaning), answerer: i % 2 === 0 ? 'nguoi' : 'npc' };
  });
}

/** Lựa chọn của NPC: đúng với xác suất `accuracy`, sai thì chọn một nghĩa nhiễu. */
export function npcPick(q: DuelQuestion, rng: () => number = Math.random, accuracy = NPC_ACCURACY): number {
  if (rng() < accuracy) return q.answer;
  const wrong = q.options.map((_, i) => i).filter((i) => i !== q.answer);
  return wrong[Math.min(wrong.length - 1, Math.floor(rng() * wrong.length))];
}

export class CharDuel {
  index = 0;
  readonly score: Record<Side, number> = { nguoi: 0, npc: 0 };

  constructor(readonly questions: DuelQuestion[]) {}

  get current(): DuelQuestion | undefined {
    return this.questions[this.index];
  }

  get done(): boolean {
    return this.index >= this.questions.length;
  }

  /** Bên đang tới lượt trả lời câu hiện tại chọn `option`; trả về đúng / sai, sang câu sau. Ván xong → `false`. */
  answer(option: number): boolean {
    const q = this.current;
    if (!q) return false;
    const right = option === q.answer;
    if (right) this.score[q.answerer]++;
    this.index++;
    return right;
  }

  /** Kết quả khi xong: bên điểm cao hơn, bằng điểm → `null` (hoà). */
  winner(): Side | null {
    if (this.score.nguoi === this.score.npc) return null;
    return this.score.nguoi > this.score.npc ? 'nguoi' : 'npc';
  }
}

/** Nhãn một nghĩa trên ô chọn: âm Hán Việt của bộ có nghĩa đó + nghĩa — "mộc — cây" (R-DAU-1, thiết kế 2026-11-13.27). */
export function meaningLabel(meaning: string, pool: readonly Radical[] = RADICALS): string {
  const r = pool.find((x) => x.meaning === meaning);
  return r ? `${r.name} — ${meaning}` : meaning;
}

/** Dòng phụ sau khi chấm: "mộc · mù — cây". */
export function radicalDetail(r: Radical): string {
  return `${r.name} · ${r.pinyin} — ${r.meaning}`;
}
