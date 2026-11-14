import { describe, expect, it } from 'vitest';
import { makeQuestions } from './charDuel';
import { DuelRound, NPC_THINK_MIN, REVEAL_SECONDS } from './duelRound';

/** Số giả ngẫu nhiên có hạt — test lặp lại được. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

describe('Vòng Đấu chữ — R-DAU-2', () => {
  it('R-DAU-2: câu 1 của người — chạm là chọn, hiện nghĩa đúng ~1 giây rồi sang câu 2 (Mặc Ông nghĩ 1–2 giây)', () => {
    const rng = seeded(7);
    const r = new DuelRound(makeQuestions(['moc', 'truc', 'thuy'], rng), rng);
    expect(r.phase).toBe('hoi');
    const q = r.question!;
    const wrong = (q.answer + 1) % 4;
    expect(r.choose(wrong)).toBe(true);
    expect(r.phase).toBe('cham');
    expect(r.marks).toEqual([false]);
    expect(r.picked).toBe(wrong);
    expect(r.lastBy).toBe('nguoi');
    expect(r.choose(q.answer)).toBe(false); // đang chấm: chạm không có gì
    r.update(REVEAL_SECONDS - 0.05);
    expect(r.phase).toBe('cham');
    r.update(0.1);
    expect(r.phase).toBe('nghi');
    expect(r.shown).toBe(1);
    expect(r.choose(0)).toBe(false); // lượt Mặc Ông: 4 ô không chạm được
    r.update(NPC_THINK_MIN - 0.05);
    expect(r.phase).toBe('nghi');
    r.update(1.1);
    expect(r.phase).toBe('cham');
    expect(r.lastBy).toBe('npc');
    expect(r.marks.length).toBe(2);
  });

  it('R-DAU-2: người đúng 4/5 → 4 điểm, điểm Mặc Ông = số câu Mặc Ông đúng; hết 10 câu → het', () => {
    const r = new DuelRound(makeQuestions(['moc', 'truc', 'thuy'], seeded(3)), seeded(3));
    let npcRight = 0;
    let you = 0;
    for (let k = 0; k < 10; k++) {
      const q = r.question!;
      if (q.answerer === 'nguoi') {
        r.choose(you < 4 ? q.answer : (q.answer + 1) % 4);
        you++;
      } else {
        // Mặc Ông nghĩ xong thì tự chọn (đúng ~70 %) — đếm số câu đúng
        while (r.phase === 'nghi') r.update(0.01);
        if (r.phase !== 'cham') throw new Error('NPC chưa chọn');
        npcRight += r.lastRight ? 1 : 0;
      }
      r.update(REVEAL_SECONDS + 0.01);
    }
    expect(r.phase).toBe('het');
    expect(r.duel.score.nguoi).toBe(4);
    expect(r.duel.score.npc).toBe(npcRight);
    expect(r.marks.length).toBe(10);
  });
});
