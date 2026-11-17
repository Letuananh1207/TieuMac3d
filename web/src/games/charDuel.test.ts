import { describe, expect, it } from 'vitest';
import { TU_VUNG, tuTheoMa } from '../zones/tuVung/tu';
import { CharDuel, makeQuestions, npcPick, wordDetail } from './charDuel';

/** Số giả ngẫu nhiên có hạt — test lặp lại được. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('Đấu chữ — câu hỏi', () => {
  it('R-DAU-1: 10 câu, chỉ hỏi từ đã học, không hai câu liền nhau trùng từ', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const qs = makeQuestions(['你', '好', '谢谢'], seeded(seed));
      expect(qs).toHaveLength(10);
      for (const [i, q] of qs.entries()) {
        expect(['你', '好', '谢谢']).toContain(q.word.id);
        if (i > 0) expect(q.word.id).not.toBe(qs[i - 1].word.id);
      }
    }
  });

  it('R-DAU-1: 4 nghĩa khác nhau, đúng một nghĩa của từ', () => {
    const qs = makeQuestions(['好', '朋友'], seeded(7));
    for (const q of qs) {
      expect(new Set(q.options).size).toBe(4);
      expect(q.options[q.answer]).toBe(q.word.meaning);
      expect(q.options.filter((o) => o === q.word.meaning)).toHaveLength(1);
      for (const o of q.options) expect(TU_VUNG.some((t) => t.meaning === o)).toBe(true);
    }
  });

  it('R-DAU-1: chưa học từ nào → không có ván', () => {
    expect(makeQuestions([], seeded(1))).toEqual([]);
    expect(makeQuestions(['khong-co'], seeded(1))).toEqual([]);
  });

  it('R-DAU-1: học đúng 1 từ → cả 10 câu là từ đó', () => {
    const qs = makeQuestions(['好'], seeded(3));
    expect(qs).toHaveLength(10);
    expect(qs.every((q) => q.word.id === '好')).toBe(true);
  });

  it('R-DAU-1: học đủ 10 từ trở lên → không từ nào lặp', () => {
    const ids = TU_VUNG.slice(0, 12).map((t) => t.id);
    const qs = makeQuestions(ids, seeded(9));
    expect(new Set(qs.map((q) => q.word.id)).size).toBe(10);
  });
});

describe('Đấu chữ — lượt và điểm', () => {
  it('R-DAU-2: câu 1, 3, 5, 7, 9 người trả lời; câu chẵn NPC', () => {
    const qs = makeQuestions(['你', '好'], seeded(2));
    expect(qs.map((q) => q.answerer)).toEqual(['nguoi', 'npc', 'nguoi', 'npc', 'nguoi', 'npc', 'nguoi', 'npc', 'nguoi', 'npc']);
  });

  it('R-DAU-2: đúng được 1 điểm; người 4 : NPC 3 → người thắng', () => {
    const duel = new CharDuel(makeQuestions(['你', '好', '谢谢'], seeded(4)));
    const plan = [true, true, true, true, true, true, true, false, false, false]; // người đúng câu 1,3,5,7 · NPC đúng 2,4,6
    for (const right of plan) {
      const q = duel.current!;
      duel.answer(right ? q.answer : (q.answer + 1) % 4);
    }
    expect(duel.done).toBe(true);
    expect(duel.score).toEqual({ nguoi: 4, npc: 3 });
    expect(duel.winner()).toBe('nguoi');
  });

  it('R-DAU-2: bằng điểm → hoà', () => {
    const duel = new CharDuel(makeQuestions(['你', '好'], seeded(5)));
    while (!duel.done) duel.answer(duel.current!.answer);
    expect(duel.score).toEqual({ nguoi: 5, npc: 5 });
    expect(duel.winner()).toBeNull();
  });

  it('R-DAU-2: NPC đúng khoảng 70 %', () => {
    const rng = seeded(11);
    const qs = makeQuestions(TU_VUNG.map((t) => t.id), rng);
    let right = 0;
    const n = 4000;
    for (let i = 0; i < n; i++) if (npcPick(qs[i % qs.length], rng) === qs[i % qs.length].answer) right++;
    expect(right / n).toBeGreaterThan(0.66);
    expect(right / n).toBeLessThan(0.74);
  });

  it('R-DAU-2: NPC trả lời sai thì chọn một nghĩa nhiễu có thật', () => {
    const q = makeQuestions(['好'], seeded(6))[0];
    const pick = npcPick(q, () => 0.99, 0.7);
    expect(pick).not.toBe(q.answer);
    expect(pick).toBeGreaterThanOrEqual(0);
    expect(pick).toBeLessThan(4);
  });
});

describe('Nhãn Đấu chữ — R-DAU-2', () => {
  it('R-DAU-2: viên báo "Chưa đúng — <pinyin> · <nghĩa>"; nghĩa nhiễu ưu tiên từ đã học', () => {
    expect(wordDetail(tuTheoMa('好')!)).toBe('hǎo · tốt, hay, khỏe');
    const learned = ['你', '我', '好', '谢谢', '再见'];
    const q = makeQuestions(learned, seeded(8))[0];
    const meanings = learned.map((id) => tuTheoMa(id)!.meaning);
    expect(q.options.every((o) => meanings.includes(o))).toBe(true);
  });
});
