import { describe, expect, it } from 'vitest';
import { RADICALS } from './radicals';
import { scrollMenu, sitBadge } from './studyMenu';

const ids = RADICALS.map((r) => r.id);
const first5 = ids.slice(0, 5);
const HSK1 = { title: 'HSK 1', subtitle: 'Nhập môn' };

describe('cuộn khi ngồi — bảng chọn chức năng (R-ON-8, V-45)', () => {
  it('R-ON-8: đang mượn sách, đã học 5 bộ → 3 mục dùng được theo thứ tự Đọc sách · Bộ đã học · Nhiệm vụ hôm nay', () => {
    const m = scrollMenu({ book: HSK1, learned: first5, tasksLeft: 1 });
    expect(m.map((i) => [i.id, i.enabled])).toEqual([
      ['book', true],
      ['learned', true],
      ['daily', true],
    ]);
    expect(m[1]!.count).toBe(5);
    expect(m[2]!.count).toBe(1);
  });

  it('R-ON-8: chưa mượn, chưa học → "Đọc sách" mờ (noBook), "Bộ đã học" mờ (noneLearned), Nhiệm vụ vẫn dùng được', () => {
    const m = scrollMenu({ book: null, learned: [], tasksLeft: null });
    expect(m.map((i) => [i.id, i.enabled, i.reason])).toEqual([
      ['book', false, 'noBook'],
      ['learned', false, 'noneLearned'],
      ['daily', true, null],
    ]);
    expect(m[2]!.count).toBeNull();
  });

  it('R-ON-8: cuộn không còn mục ôn / học bộ mới ở bất kỳ đâu (R-VUNG-1)', () => {
    const m = scrollMenu({ book: null, learned: ['khong-co', 'truc'], tasksLeft: 2 });
    expect(m.map((i) => i.id)).not.toContain('review');
    expect(m.map((i) => i.id)).not.toContain('learn');
    expect(m[1]!.count).toBe(1); // mã lạ không tính
  });
});

describe('chấm son nút Ngồi ôn (R-DIEU-7)', () => {
  it('R-DIEU-7: 4 bộ đến hạn → chấm "4" kiểu đến hạn', () => {
    expect(sitBadge(['truc', 'moc', 'thuy', 'son'])).toEqual({ n: 4, kind: 'due' });
  });

  it('R-DIEU-7: không bộ đến hạn → không chấm (kể cả ở Trúc Lâm còn bộ chưa học); mã lạ không tính', () => {
    expect(sitBadge([])).toBeNull();
    expect(sitBadge(['khong-co'])).toBeNull();
    expect(sitBadge(['khong-co', 'truc'])).toEqual({ n: 1, kind: 'due' });
  });
});
