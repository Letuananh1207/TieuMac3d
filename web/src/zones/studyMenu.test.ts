import { describe, expect, it } from 'vitest';
import { scrollMenu, sitBadge } from './studyMenu';
import { TU_VUNG } from './tuVung/tu';

const ids = TU_VUNG.map((t) => t.id);
const first5 = ids.slice(0, 5);
const HSK1 = { title: 'HSK 1', subtitle: 'Nhập môn' };

describe('cuộn khi ngồi — bảng chọn chức năng (R-ON-8, V-45)', () => {
  it('R-ON-8: đang mượn sách, đã học 5 từ → 3 mục dùng được theo thứ tự Đọc sách · Từ đã học · Nhiệm vụ hôm nay', () => {
    const m = scrollMenu({ book: HSK1, learned: first5, tasksLeft: 1 });
    expect(m.map((i) => [i.id, i.enabled])).toEqual([
      ['book', true],
      ['learned', true],
      ['daily', true],
    ]);
    expect(m[1]!.count).toBe(5);
    expect(m[2]!.count).toBe(1);
  });

  it('R-ON-8: chưa mượn, chưa học → "Đọc sách" mờ (noBook), "Từ đã học" mờ (noneLearned), Nhiệm vụ vẫn dùng được', () => {
    const m = scrollMenu({ book: null, learned: [], tasksLeft: null });
    expect(m.map((i) => [i.id, i.enabled, i.reason])).toEqual([
      ['book', false, 'noBook'],
      ['learned', false, 'noneLearned'],
      ['daily', true, null],
    ]);
    expect(m[2]!.count).toBeNull();
  });

  it('R-ON-8: cuộn không còn mục ôn / học bài mới ở bất kỳ đâu (R-VUNG-1)', () => {
    const m = scrollMenu({ book: null, learned: ['khong-co', '你'], tasksLeft: 2 });
    expect(m.map((i) => i.id)).not.toContain('review');
    expect(m.map((i) => i.id)).not.toContain('learn');
    expect(m[1]!.count).toBe(1); // mã lạ không tính
  });
});

describe('chấm son nút Tĩnh toạ (R-DIEU-7)', () => {
  it('R-DIEU-7: 4 từ đến hạn → chấm "4" kiểu đến hạn', () => {
    expect(sitBadge(['你', '我', '好', '谢谢'])).toEqual({ n: 4, kind: 'due' });
  });

  it('R-DIEU-7: không từ đến hạn → không chấm (kể cả ở Trúc Lâm còn bài chưa học); mã lạ không tính', () => {
    expect(sitBadge([])).toBeNull();
    expect(sitBadge(['khong-co'])).toBeNull();
    expect(sitBadge(['khong-co', '你'])).toEqual({ n: 1, kind: 'due' });
  });
});
