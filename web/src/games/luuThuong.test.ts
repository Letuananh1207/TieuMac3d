import { describe, expect, it } from 'vitest';
import { thanhTuKhac } from './ghepTu';
import {
  canJoin,
  charOptions,
  emptyScores,
  ghepWords,
  LUU_NEED_LINE,
  LUU_NPCS,
  hostLine,
  rankTitle,
  thiKhoi,
  luuOutcome,
  makeQuestions,
  npcChoice,
  ranking,
  turnOrder,
  validOrder,
  type LuuSeat,
} from './luuThuong';
import { ghepCua, tuHaiChu } from './ghepTu';
import { tuTheoMa } from '../zones/tuVung/tu';

const LEARNED = ['谢谢', '再见', '名字', '朋友', '老师', '学生', '同学', '学校', '学习', '汉语'];

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('Lưu Thương — vào tiệc', () => {
  it('R-LUU-1: cần ≥ 3 từ hai chữ đã học', () => {
    expect(canJoin(['谢谢', '再见', '朋友'])).toBe(true);
    expect(canJoin(['谢谢', '再见', '你', '不客气'])).toBe(false); // 你 1 chữ, 不客气 3 chữ không tính
    expect(canJoin(['谢谢', '再见', 'la-hoan'])).toBe(false); // mã lạ không tính
    expect(ghepWords(['朋友', '谢谢', '谢谢']).map((t) => t.id)).toEqual(['谢谢', '朋友']);
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

describe('Lưu Thương — câu ghép từ', () => {
  it('R-LUU-3: 8 câu chỉ từ hai chữ đã học, không lặp từ trong ván', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const rng = seeded(seed);
      const qs = makeQuestions(LEARNED, turnOrder(rng), rng);
      expect(qs).toHaveLength(8);
      for (const q of qs) expect(LEARNED).toContain(q.ghep.word.id);
      expect(new Set(qs.map((q) => q.ghep.word.id)).size).toBe(8);
    }
  });

  it('R-LUU-3: 4 ô chữ khác nhau, đúng 1 ô là chữ thiếu, ô nhiễu không ghép thành từ HSK khác', () => {
    for (const t of tuHaiChu()) {
      for (const g of ghepCua(t)) {
        const opts = charOptions(g, LEARNED, seeded(t.han.codePointAt(0) ?? 1));
        expect(new Set(opts.map((o) => o.han)).size).toBe(4);
        expect(opts.filter((o) => o.han === g.missing)).toHaveLength(1);
        for (const o of opts) if (o.han !== g.missing) expect(thanhTuKhac(g, o.han)).toBe(false);
      }
    }
  });

  it('R-LUU-3: 朋友 ẩn chữ cuối → hiện 朋, ô đúng 友 ghi pinyin "you"; nhiễu ưu tiên chữ của từ đã học', () => {
    const g = ghepCua(tuTheoMa('朋友')!)[1];
    expect(g).toMatchObject({ shown: '朋', missing: '友', at: 'cuoi' });
    const opts = charOptions(g, ['朋友', '老师', '学生'], seeded(3));
    expect(opts.find((o) => o.han === '友')?.pinyin).toBe('you');
    const fromLearned = opts.filter((o) => ['老', '师', '学', '生'].includes(o.han));
    expect(fromLearned).toHaveLength(3);
  });

  it('R-LUU-3: chưa học từ hai chữ → không có câu', () => {
    expect(makeQuestions([], turnOrder(seeded(1)))).toEqual([]);
  });
});

describe('Lưu Thương — văn nhân', () => {
  it('R-LUU-4: xác suất đúng Thi Ông 75 %, Vần cô nương 70 %, A Chén 60 %', () => {
    expect(Object.fromEntries(LUU_NPCS.map((n) => [n.id, n.accuracy]))).toEqual({ 'thi-ong': 0.75, 'tai-nu': 0.7, 'tu-tai': 0.6 });
    const rng = seeded(11);
    const qs = makeQuestions(LEARNED, ['tu-tai', 'tu-tai', 'tu-tai', 'tu-tai', 'tu-tai', 'tu-tai', 'tu-tai', 'tu-tai'], rng);
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
    expect(hostLine('thang')).toBe('Hay! Chén này lão kính cháu.');
  });
});

describe('Lưu Thương — vào tiệc', () => {
  it('R-LUU-1: chưa đủ 3 từ hai chữ → Thi Ông nhắc tới Trúc Lão học thêm bài từ', () => {
    expect(canJoin(['谢谢', '再见'])).toBe(false);
    expect(LUU_NEED_LINE).toBe('Cháu hãy tới Trúc Lão học thêm vài bài từ, rồi lại đây cùng thả chén.');
  });
});
