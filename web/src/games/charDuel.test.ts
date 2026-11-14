import { describe, expect, it } from 'vitest';
import { RADICALS } from '../zones/radicals';
import { CharDuel, makeQuestions, meaningLabel, npcPick, radicalDetail } from './charDuel';

/** Số giả ngẫu nhiên có hạt — test lặp lại được. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('Đấu chữ — câu hỏi', () => {
  it('R-DAU-1: 10 câu, chỉ hỏi bộ đã học, không hai câu liền nhau trùng bộ', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const qs = makeQuestions(['truc', 'moc', 'thuy'], seeded(seed));
      expect(qs).toHaveLength(10);
      for (const [i, q] of qs.entries()) {
        expect(['truc', 'moc', 'thuy']).toContain(q.radical.id);
        if (i > 0) expect(q.radical.id).not.toBe(qs[i - 1].radical.id);
      }
    }
  });

  it('R-DAU-1: 4 nghĩa khác nhau, đúng một nghĩa của bộ', () => {
    const qs = makeQuestions(['moc', 'son'], seeded(7));
    for (const q of qs) {
      expect(new Set(q.options).size).toBe(4);
      expect(q.options[q.answer]).toBe(q.radical.meaning);
      expect(q.options.filter((o) => o === q.radical.meaning)).toHaveLength(1);
      for (const o of q.options) expect(RADICALS.some((r) => r.meaning === o)).toBe(true);
    }
  });

  it('R-DAU-1: chưa học bộ nào → không có ván', () => {
    expect(makeQuestions([], seeded(1))).toEqual([]);
    expect(makeQuestions(['khong-co'], seeded(1))).toEqual([]);
  });

  it('R-DAU-1: học đúng 1 bộ → cả 10 câu là bộ đó', () => {
    const qs = makeQuestions(['moc'], seeded(3));
    expect(qs).toHaveLength(10);
    expect(qs.every((q) => q.radical.id === 'moc')).toBe(true);
  });

  it('R-DAU-1: học đủ 10 bộ trở lên → không bộ nào lặp', () => {
    const ids = RADICALS.slice(0, 12).map((r) => r.id);
    const qs = makeQuestions(ids, seeded(9));
    expect(new Set(qs.map((q) => q.radical.id)).size).toBe(10);
  });
});

describe('Đấu chữ — lượt và điểm', () => {
  it('R-DAU-2: câu 1, 3, 5, 7, 9 người trả lời; câu chẵn NPC', () => {
    const qs = makeQuestions(['truc', 'moc'], seeded(2));
    expect(qs.map((q) => q.answerer)).toEqual(['nguoi', 'npc', 'nguoi', 'npc', 'nguoi', 'npc', 'nguoi', 'npc', 'nguoi', 'npc']);
  });

  it('R-DAU-2: đúng được 1 điểm; người 4 : NPC 3 → người thắng', () => {
    const duel = new CharDuel(makeQuestions(['truc', 'moc', 'thuy'], seeded(4)));
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
    const duel = new CharDuel(makeQuestions(['truc', 'moc'], seeded(5)));
    while (!duel.done) duel.answer(duel.current!.answer);
    expect(duel.score).toEqual({ nguoi: 5, npc: 5 });
    expect(duel.winner()).toBeNull();
  });

  it('R-DAU-2: NPC đúng khoảng 70 %', () => {
    const rng = seeded(11);
    const qs = makeQuestions(RADICALS.map((r) => r.id), rng);
    let right = 0;
    const n = 4000;
    for (let i = 0; i < n; i++) if (npcPick(qs[i % qs.length], rng) === qs[i % qs.length].answer) right++;
    expect(right / n).toBeGreaterThan(0.66);
    expect(right / n).toBeLessThan(0.74);
  });

  it('R-DAU-2: NPC trả lời sai thì chọn một nghĩa nhiễu có thật', () => {
    const q = makeQuestions(['moc'], seeded(6))[0];
    const pick = npcPick(q, () => 0.99, 0.7);
    expect(pick).not.toBe(q.answer);
    expect(pick).toBeGreaterThanOrEqual(0);
    expect(pick).toBeLessThan(4);
  });
});

describe('Nhãn nghĩa Đấu chữ — R-DAU-1', () => {
  it('R-DAU-1: mỗi nghĩa kèm âm Hán Việt của bộ có nghĩa đó; dòng chấm "âm · pinyin — nghĩa"', () => {
    const moc = RADICALS.find((r) => r.id === 'moc')!;
    expect(meaningLabel(moc.meaning)).toBe('mộc — cây');
    expect(radicalDetail(moc)).toBe('mộc · mù — cây');
    expect(meaningLabel('không có')).toBe('không có');
  });
});
