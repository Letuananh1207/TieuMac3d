import { describe, expect, it } from 'vitest';
import { formsChar } from './ghepChu';
import {
  canJoin,
  emptyScores,
  ghepRadicals,
  LUU_NEED_LINE,
  LUU_NPCS,
  hostLine,
  rankTitle,
  thiKhoi,
  luuOutcome,
  makeQuestions,
  npcChoice,
  radicalOptions,
  ranking,
  turnOrder,
  validOrder,
  type LuuSeat,
} from './luuThuong';
import { GHEP_CHU } from './ghepChu';

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('Lưu Thương — vào tiệc', () => {
  it('R-LUU-1: cần ≥ 3 bộ đã học có chữ ghép', () => {
    expect(canJoin(['truc', 'moc', 'thuy'])).toBe(true);
    expect(canJoin(['truc', 'moc'])).toBe(false);
    expect(canJoin(['truc', 'moc', 'la-hoan'])).toBe(false); // mã lạ không tính
    expect(ghepRadicals(['truc', 'truc', 'moc'])).toEqual(['truc', 'moc']);
  });
});

describe('Lưu Thương — thứ tự lượt', () => {
  it('R-LUU-2: 8 lượt, người 4, mỗi văn nhân 1–2, người không quá 2 lượt liền', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const o = turnOrder(seeded(seed));
      expect(validOrder(o), o.join(',')).toBe(true);
    }
    const ok: LuuSeat[] = ['nguoi', 'thi-ong', 'nguoi', 'nguoi', 'tai-nu', 'tu-tai', 'nguoi', 'thi-ong'];
    expect(validOrder(ok)).toBe(true);
    const ba: LuuSeat[] = ['nguoi', 'nguoi', 'nguoi', 'thi-ong', 'tai-nu', 'tu-tai', 'nguoi', 'thi-ong'];
    expect(validOrder(ba)).toBe(false);
  });

  it('R-LUU-2: rng xấu (luôn 0) vẫn ra thứ tự hợp lệ', () => {
    expect(validOrder(turnOrder(() => 0))).toBe(true);
  });
});

describe('Lưu Thương — câu ghép chữ', () => {
  const learned = ['truc', 'moc', 'thuy'];

  it('R-LUU-3: 8 câu chỉ chữ có bộ đã học, không lặp chữ trong ván', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const rng = seeded(seed);
      const qs = makeQuestions(learned, turnOrder(rng), rng);
      expect(qs).toHaveLength(8);
      for (const q of qs) expect(learned).toContain(q.char.radical);
      expect(new Set(qs.map((q) => q.char.han)).size).toBe(8);
    }
  });

  it('R-LUU-3: 4 ô bộ thủ khác nhau, đúng 1 ô là bộ của chữ, ô nhiễu không ghép thành chữ khác', () => {
    for (const c of GHEP_CHU) {
      const opts = radicalOptions(c, learned, seeded(c.han.codePointAt(0) ?? 1));
      expect(new Set(opts).size).toBe(4);
      expect(opts.filter((o) => o === c.radical)).toHaveLength(1);
      for (const o of opts) if (o !== c.radical) expect(formsChar(o, c.rest)).toBe(false);
    }
  });

  it('R-LUU-3: ô nhiễu ưu tiên bộ đã học', () => {
    const c = GHEP_CHU.find((x) => x.han === '河');
    if (!c) throw new Error('thiếu 河');
    const opts = radicalOptions(c, ['thuy', 'truc', 'moc', 'son'], seeded(3));
    expect(new Set(opts)).toEqual(new Set(['thuy', 'truc', 'moc', 'son']));
  });

  it('R-LUU-3: chưa học bộ có chữ ghép → không có câu', () => {
    expect(makeQuestions([], turnOrder(seeded(1)))).toEqual([]);
  });
});

describe('Lưu Thương — văn nhân', () => {
  it('R-LUU-4: xác suất đúng Thi Ông 75 %, Tài Nữ 70 %, Tú Tài 60 %', () => {
    expect(Object.fromEntries(LUU_NPCS.map((n) => [n.id, n.accuracy]))).toEqual({ 'thi-ong': 0.75, 'tai-nu': 0.7, 'tu-tai': 0.6 });
    const rng = seeded(11);
    const qs = makeQuestions(['truc', 'moc', 'thuy'], ['tu-tai', 'tu-tai', 'tu-tai', 'tu-tai', 'tu-tai', 'tu-tai', 'tu-tai', 'tu-tai'], rng);
    let right = 0;
    const n = 4000;
    for (let i = 0; i < n; i++) if (npcChoice(qs[i % qs.length], rng) === qs[i % qs.length].answer) right++;
    expect(right / n).toBeGreaterThan(0.56);
    expect(right / n).toBeLessThan(0.64);
  });
});

describe('Lưu Thương — hết ván', () => {
  it('R-LUU-5: hạng 1 một mình = thắng, hạng 1 đồng = hoà, khác = thua', () => {
    expect(luuOutcome({ nguoi: 3, 'thi-ong': 2, 'tai-nu': 2, 'tu-tai': 1 })).toBe('thang');
    expect(luuOutcome({ nguoi: 3, 'thi-ong': 3, 'tai-nu': 1, 'tu-tai': 0 })).toBe('hoa');
    expect(luuOutcome({ nguoi: 2, 'thi-ong': 3, 'tai-nu': 0, 'tu-tai': 0 })).toBe('thua');
    expect(luuOutcome(emptyScores())).toBe('hoa'); // 0 cả bốn: hạng 1 đồng
  });

  it('R-LUU-5: bảng xếp hạng bằng điểm cùng hạng', () => {
    const r = ranking({ nguoi: 2, 'thi-ong': 3, 'tai-nu': 2, 'tu-tai': 0 });
    expect(r.map((x) => [x.seat, x.rank])).toEqual([
      ['thi-ong', 1],
      ['nguoi', 2],
      ['tai-nu', 2],
      ['tu-tai', 4],
    ]);
  });

  it('R-LUU-5: thẻ kết quả — dòng hạng, ấn "Thi khôi" chỉ khi hạng 1 một mình, lời Thi Ông', () => {
    const alone = { nguoi: 3, 'thi-ong': 2, 'tai-nu': 2, 'tu-tai': 1 };
    const tie = { nguoi: 3, 'thi-ong': 3, 'tai-nu': 1, 'tu-tai': 0 };
    expect([rankTitle(alone), thiKhoi(alone)]).toEqual(['Hạng nhất', true]);
    expect([rankTitle(tie), thiKhoi(tie)]).toEqual(['Đồng hạng nhất', false]);
    expect(rankTitle({ nguoi: 2, 'thi-ong': 3, 'tai-nu': 2, 'tu-tai': 0 })).toBe('Hạng nhì');
    expect(rankTitle({ nguoi: 0, 'thi-ong': 3, 'tai-nu': 2, 'tu-tai': 1 })).toBe('Hạng tư');
    expect(hostLine('thang')).toBe('Hay! Chén này xin kính đạo hữu.');
  });
});

describe('Lưu Thương — vào tiệc', () => {
  it('R-LUU-1: chưa đủ 3 bộ → Thi Ông nhắc "Tĩnh toạ" (tên nút mới)', () => {
    expect(canJoin(['truc', 'moc'])).toBe(false);
    expect(LUU_NEED_LINE).toBe('Đạo hữu hãy Tĩnh toạ học thêm vài bộ thủ, rồi lại đây cùng thả chén.');
  });
});
