import { describe, expect, test } from 'vitest';
import { cauHoi, dangTheoBac, luotOn, SO_PHUONG_AN, TRAN_LUOT_ON } from './cauHoi';
import { TU_VUNG, tuTheoMa, type Tu } from './tu';

/** rng cố định (LCG) — câu hỏi lặp lại được */
function rng(seed = 7) {
  let s = seed;
  return () => ((s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
}
const tu = (id: string) => tuTheoMa(id)!;

describe('R-TU-2: dạng câu, 4 phương án', () => {
  test('mỗi dạng: 4 phương án khác nhau, đúng 1 ở `answer`', () => {
    const r = rng();
    for (const kind of ['chu-nghia', 'nghe-nghia', 'chu-pinyin', 'nghia-chu', 'nghe-chu'] as const) {
      for (const t of TU_VUNG.slice(0, 60)) {
        const q = cauHoi(kind, t, [], TU_VUNG, r);
        expect(q.options).toHaveLength(SO_PHUONG_AN);
        expect(new Set(q.options).size).toBe(SO_PHUONG_AN);
        const right = kind === 'chu-pinyin' ? t.pinyin : kind.endsWith('nghia') ? t.meaning : t.han;
        expect(q.options[q.answer]).toBe(right);
      }
    }
  });

  test('câu c: nhiễu cùng âm khác thanh trước', () => {
    const q = cauHoi('chu-pinyin', tu('谢谢'), [], TU_VUNG, rng(3));
    expect(new Set(q.options)).toEqual(new Set(['xièxie', 'xiēxie', 'xiéxie', 'xiěxie']));
  });

  test('không trùng nghĩa con với đáp án', () => {
    const fake: Tu[] = [tu('爸爸'), { ...tu('妈妈'), id: '父亲', han: '父亲', meaning: 'bố, cha' }, ...TU_VUNG.slice(10, 20)];
    for (let s = 1; s < 30; s++) {
      const q = cauHoi('chu-nghia', fake[0], [], fake, rng(s));
      expect(q.options).not.toContain('bố, cha');
    }
  });

  test('nhiễu ưu tiên từ đã học; câu d ưu tiên cùng số chữ', () => {
    const learned = ['朋友', '老师', '同学', '名字', '你'];
    const q = cauHoi('nghia-chu', tu('学生'), learned, TU_VUNG, rng(5));
    const nhieu = q.options.filter((_, i) => i !== q.answer);
    expect(nhieu.every((h) => learned.includes(h) && h.length === 2)).toBe(true);
  });
});

describe('R-ON-2: dạng câu theo bậc; chưa có âm đổi câu nghe', () => {
  test('bậc → hai dạng', () => {
    expect(dangTheoBac(0, true)).toEqual(['chu-nghia', 'nghe-nghia']);
    expect(dangTheoBac(1, true)).toEqual(['chu-nghia', 'nghe-nghia']);
    expect(dangTheoBac(2, true)).toEqual(['chu-pinyin', 'nghia-chu']);
    expect(dangTheoBac(3, true)).toEqual(['chu-pinyin', 'nghia-chu']);
    expect(dangTheoBac(4, true)).toEqual(['nghe-chu', 'chu-pinyin']);
    expect(dangTheoBac(7, true)).toEqual(['nghe-chu', 'chu-pinyin']);
  });

  test('chưa có âm: b → d, e → a', () => {
    expect(dangTheoBac(0, false)).toEqual(['chu-nghia', 'nghia-chu']);
    expect(dangTheoBac(5, false)).toEqual(['chu-nghia', 'chu-pinyin']);
  });
});

describe('R-ON-4: lượt ôn tối đa 20 từ, giữ thứ tự', () => {
  test('cắt 20, mã lạ bỏ qua, mỗi từ 2 câu', () => {
    const due = ['xx', ...TU_VUNG.slice(0, 30).map((t) => t.id)];
    const items = luotOn(due, [], [], rng());
    expect(items).toHaveLength(TRAN_LUOT_ON);
    expect(items[0].word.id).toBe('你');
    expect(items.every((m) => m.questions.length === 2)).toBe(true);
    expect(items[0].questions.map((q) => q.kind)).toEqual(['chu-nghia', 'nghia-chu']);
  });

  test('bậc theo `steps`', () => {
    const items = luotOn(['你', '好'], [0, 3], [], rng());
    expect(items[1].questions.map((q) => q.kind)).toEqual(['chu-pinyin', 'nghia-chu']);
  });
});
