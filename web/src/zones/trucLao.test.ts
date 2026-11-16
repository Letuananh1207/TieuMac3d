import { describe, expect, it } from 'vitest';
import { RADICALS } from './radicals';
import { dueCount, nextRadical, TRUC_LAO, trucLaoDialog } from './trucLao';

const ids = RADICALS.map((r) => r.id);
const texts = (d: ReturnType<typeof trucLaoDialog>): string[] => d.lines[0]!.choices.map((c) => c.text);
const HAN = /\p{Script=Han}/u;

describe('thầy Trúc Lão (R-HANH-8)', () => {
  it('R-HANH-8: chưa học bộ nào → "Học bộ mới — bộ trúc", "Tạm biệt"; chọn học mở bộ 竹', () => {
    const d = trucLaoDialog({ learned: [], due: [] });
    expect(d.npc).toBe(TRUC_LAO);
    expect(d.name).toBe('Trúc Lão');
    expect(texts(d)).toEqual(['Học bộ mới — bộ trúc', 'Tạm biệt']);
    expect(d.lines[0]!.choices[0]).toMatchObject({ action: 'truc', truc: 'hoc', next: null });
    expect(nextRadical([])?.form).toBe('竹');
  });

  it('R-HANH-3: học xong 竹 → mở lại câu "học tiếp" với "Học bộ mới — bộ mộc"', () => {
    const d = trucLaoDialog({ learned: ['truc'], due: [] }, true);
    expect(texts(d)[0]).toBe('Học bộ mới — bộ mộc');
    expect(d.lines[0]!.text).toContain('học tiếp');
  });

  it('R-HANH-8: 2 bộ đến hạn → thêm "Ôn bộ đến hạn (2)"; ôn 1 bộ → "(1)"', () => {
    const learned = ids.slice(0, 5);
    expect(texts(trucLaoDialog({ learned, due: ['truc', 'moc'] }))).toEqual([`Học bộ mới — bộ ${RADICALS[5]!.name}`, 'Ôn bộ đến hạn (2)', 'Tạm biệt']);
    const on = trucLaoDialog({ learned, due: ['moc'] }).lines[0]!.choices[1]!;
    expect(on).toMatchObject({ text: 'Ôn bộ đến hạn (1)', action: 'truc', truc: 'on' });
  });

  it('R-HANH-8: học đủ 50 bộ, không bộ đến hạn → chỉ "Tạm biệt", thầy nói đã học đủ', () => {
    const d = trucLaoDialog({ learned: ids, due: [] });
    expect(texts(d)).toEqual(['Tạm biệt']);
    expect(d.lines[0]!.text).toContain('đã học đủ');
    expect(nextRadical(ids)).toBeNull();
  });

  it('R-HANH-8: mã lạ trong bộ đến hạn không tính; R-HUD-4: lựa chọn và lời thoại không có chữ Hán', () => {
    expect(dueCount(['khong-co', 'truc'])).toBe(1);
    for (const d of [trucLaoDialog({ learned: [], due: [] }), trucLaoDialog({ learned: ids.slice(0, 9), due: ids.slice(0, 3) }, true), trucLaoDialog({ learned: ids, due: ['truc'] })]) {
      expect(d.lines[0]!.choices.length).toBeLessThanOrEqual(3);
      for (const s of [d.name, d.lines[0]!.text, ...texts(d)]) expect(s).not.toMatch(HAN);
    }
  });
});
