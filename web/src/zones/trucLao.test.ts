import { describe, expect, it } from 'vitest';
import { dueCount, TRUC_LAO, trucLaoDialog } from './trucLao';
import { BAI_HOC } from './tuVung/bai';
import { baiKeTiep } from './tuVung/tu';

const ids = BAI_HOC.map((b) => b.id);
const texts = (d: ReturnType<typeof trucLaoDialog>): string[] => d.lines[0]!.choices.map((c) => c.text);
const HAN = /\p{Script=Han}/u;

describe('thầy Trúc Lão (R-HANH-8)', () => {
  it('R-HANH-8: chưa học bài nào → "Học bài mới — Chào hỏi", "Tạm biệt"; chọn học mở bài 1', () => {
    const d = trucLaoDialog({ learned: [], due: [] });
    expect(d.npc).toBe(TRUC_LAO);
    expect(d.name).toBe('Trúc Lão');
    expect(texts(d)).toEqual(['Học bài mới — Chào hỏi', 'Tạm biệt']);
    expect(d.lines[0]!.choices[0]).toMatchObject({ action: 'truc', truc: 'hoc', next: null });
    expect(baiKeTiep([])?.id).toBe('bai-01');
  });

  it('R-HANH-3: học xong bài 1 → mở lại câu "học tiếp" với "Học bài mới — Lễ phép"', () => {
    const d = trucLaoDialog({ learned: ['bai-01'], due: [] }, true);
    expect(texts(d)[0]).toBe('Học bài mới — Lễ phép');
    expect(d.lines[0]!.text).toContain('học tiếp');
  });

  it('R-HANH-8: 12 từ đến hạn → "Ôn từ đến hạn (12)"; còn 7 → "(7)"', () => {
    const due12 = ['你', '我', '好', '谢谢', '再见', '不客气', '对不起', '没关系', '请', '喂', '叫', '名字'];
    expect(texts(trucLaoDialog({ learned: ids.slice(0, 2), due: due12 }))).toEqual([`Học bài mới — ${BAI_HOC[2]!.ten}`, 'Ôn từ đến hạn (12)', 'Tạm biệt']);
    const on = trucLaoDialog({ learned: ids.slice(0, 2), due: due12.slice(5) }).lines[0]!.choices[1]!;
    expect(on).toMatchObject({ text: 'Ôn từ đến hạn (7)', action: 'truc', truc: 'on' });
  });

  it('R-HANH-8: học hết giáo trình, không từ đến hạn → chỉ "Tạm biệt", thầy nói đã học hết', () => {
    const d = trucLaoDialog({ learned: ids, due: [] });
    expect(texts(d)).toEqual(['Tạm biệt']);
    expect(d.lines[0]!.text).toContain('đã học hết');
  });

  it('R-HANH-8: mã lạ trong từ đến hạn không tính; R-HUD-4: lựa chọn và lời thoại không có chữ Hán', () => {
    expect(dueCount(['khong-co', '你'])).toBe(1);
    for (const d of [trucLaoDialog({ learned: [], due: [] }), trucLaoDialog({ learned: ids.slice(0, 9), due: ['你', '好'] }, true), trucLaoDialog({ learned: ids, due: ['你'] })]) {
      expect(d.lines[0]!.choices.length).toBeLessThanOrEqual(3);
      for (const s of [d.name, d.lines[0]!.text, ...texts(d)]) expect(s).not.toMatch(HAN);
    }
  });
});
