/**
 * Đấu chữ với Mặc Ông (R-DAU-1, R-DAU-2, V-80): 10 câu, mỗi câu một **từ ĐÃ HỌC** (thẻ hiện chữ Hán) + 4 nghĩa (1 đúng, 3
 * nhiễu — dạng a của R-TU-2: ưu tiên từ đã học, không trùng nghĩa); câu lẻ người chọn, câu chẵn NPC chọn (đúng ~70 %). Chỉ ôn
 * — không mở bài học, không ghi tiến độ (R-VUNG-1). Logic thuần — không three, không DOM.
 */
import { cauHoi } from '../zones/tuVung/cauHoi';
import { TU_VUNG, type Tu } from '../zones/tuVung/tu';

export const DUEL_QUESTIONS = 10;
export const NPC_ACCURACY = 0.7;

export type Side = 'nguoi' | 'npc';

export interface DuelQuestion {
  word: Tu;
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
 * 10 câu từ các từ đã học (`learnedIds` — mã từ). Hai câu liền nhau không cùng từ (trừ khi chỉ học 1 từ).
 * Không học từ nào (hoặc mã lạ hết) → mảng rỗng: không có ván (R-DAU-1).
 */
export function makeQuestions(
  learnedIds: readonly string[],
  rng: () => number = Math.random,
  pool: readonly Tu[] = TU_VUNG,
  count = DUEL_QUESTIONS,
): DuelQuestion[] {
  const learned = pool.filter((t) => learnedIds.includes(t.id));
  if (learned.length === 0) return [];
  const picks: Tu[] = [];
  let bag: Tu[] = [];
  while (picks.length < count) {
    if (bag.length === 0) bag = shuffle(learned, rng);
    const prev = picks[picks.length - 1];
    let k = bag.findIndex((t) => t !== prev);
    if (k < 0) k = 0; // chỉ còn đúng từ vừa hỏi (học 1 từ)
    picks.push(bag.splice(k, 1)[0]);
  }
  return picks.map((word, i) => {
    const q = cauHoi('chu-nghia', word, learnedIds, pool, rng);
    return { word, options: q.options, answer: q.answer, answerer: i % 2 === 0 ? 'nguoi' : 'npc' };
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

/** Dòng phụ sau khi chấm: "hǎo · tốt, hay, khỏe" (viên báo "Chưa đúng — <pinyin> · <nghĩa>" — R-DAU-2). */
export function wordDetail(t: Tu): string {
  return `${t.pinyin} · ${t.meaning}`;
}
