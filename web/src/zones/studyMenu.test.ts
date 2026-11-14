import { describe, expect, it } from 'vitest';
import { RADICALS } from './radicals';
import { fallbackStudy, sitBadge, studyMenu } from './studyMenu';

const ids = RADICALS.map((r) => r.id);
const first5 = ids.slice(0, 5);

describe('Cuộn sách Ngồi ôn — bảng chọn', () => {
  it('R-ON-8: tông môn, 2 bộ đến hạn, đã học 5 → Ôn (2) nổi bật, Học bộ mới mờ "Học ở Rừng trúc", Xem bộ đã học', () => {
    const m = studyMenu({ due: ['truc', 'moc'], learned: first5, hasLessons: false });
    expect(m.items.map((i) => i.id)).toEqual(['review', 'learn', 'learned']);
    expect(m.items[0]).toEqual({ id: 'review', enabled: true, reason: null, count: 2 });
    expect(m.items[1]).toEqual({ id: 'learn', enabled: false, reason: 'learnInRegion', count: 0 });
    expect(m.items[2]).toEqual({ id: 'learned', enabled: true, reason: null, count: 5 });
    expect(m.highlight).toBe('review');
    expect(m.next).toBeNull();
  });

  it('R-ON-8: ôn xong → Ôn mờ "Hôm nay đã ôn xong"', () => {
    const m = studyMenu({ due: [], learned: first5, hasLessons: false });
    expect(m.items[0]).toEqual({ id: 'review', enabled: false, reason: 'reviewedToday', count: 0 });
    expect(m.highlight).toBeNull();
  });

  it('R-ON-8 / R-HANH-3: Rừng trúc, không bộ đến hạn → Học bộ mới nổi bật, bộ chưa học đầu tiên', () => {
    const m = studyMenu({ due: [], learned: ['truc'], hasLessons: true });
    expect(m.items[1]).toEqual({ id: 'learn', enabled: true, reason: null, count: RADICALS.length - 1 });
    expect(m.highlight).toBe('learn');
    expect(m.next?.id).toBe(ids[1]);
    expect(m.upcoming.map((r) => r.id)).toEqual(ids.slice(2));
  });

  it('R-ON-8: Rừng trúc còn bộ đến hạn → Ôn nổi bật dù học bộ mới được', () => {
    const m = studyMenu({ due: ['truc'], learned: ['truc'], hasLessons: true });
    expect(m.items[1].enabled).toBe(true);
    expect(m.highlight).toBe('review');
  });

  it('R-ON-8: học đủ 50 bộ → Học bộ mới mờ "Đã học đủ"', () => {
    const m = studyMenu({ due: [], learned: ids, hasLessons: true });
    expect(m.items[1]).toEqual({ id: 'learn', enabled: false, reason: 'allLearned', count: 0 });
    expect(m.next).toBeNull();
    expect(m.upcoming).toEqual([]);
    expect(m.highlight).toBeNull();
  });

  it('R-ON-8: chưa học bộ nào → Ôn mờ "Chưa có bộ nào để ôn", Xem bộ đã học mờ, không mục nổi bật', () => {
    const m = studyMenu({ due: [], learned: [], hasLessons: false });
    expect(m.items[0]).toEqual({ id: 'review', enabled: false, reason: 'noneLearned', count: 0 });
    expect(m.items[1]).toEqual({ id: 'learn', enabled: false, reason: 'learnInRegion', count: 0 });
    expect(m.items[2]).toEqual({ id: 'learned', enabled: false, reason: 'noneLearned', count: 0 });
    expect(m.highlight).toBeNull();
  });

  it('R-ON-8: mã lạ trong tiến độ bị bỏ qua khi đếm', () => {
    const m = studyMenu({ due: ['khong-co', 'truc'], learned: ['truc', 'khong-co'], hasLessons: false });
    expect(m.items[0].count).toBe(1);
    expect(m.items[2].count).toBe(1);
  });

  it('R-ON-8: không có Flutter → đến hạn thì ôn; không thì ở vùng có bài học → thẻ bộ mới; còn lại không mở gì', () => {
    expect(fallbackStudy(studyMenu({ due: ['truc'], learned: ['truc'], hasLessons: false }))).toBe('review');
    expect(fallbackStudy(studyMenu({ due: [], learned: [], hasLessons: true }))).toBe('learn');
    expect(fallbackStudy(studyMenu({ due: [], learned: first5, hasLessons: false }))).toBeNull();
    expect(fallbackStudy(studyMenu({ due: [], learned: ids, hasLessons: true }))).toBeNull();
  });
});

describe('Nút Ngồi ôn — chấm son', () => {
  it('R-DIEU-7: còn bộ đến hạn → số bộ đến hạn (tông môn cũng có)', () => {
    expect(sitBadge({ due: ['truc', 'moc', 'thuy', 'son'], learned: first5, hasLessons: false })).toEqual({ n: 4, kind: 'due' });
  });

  it('R-DIEU-7: Rừng trúc, không bộ đến hạn, học 3 bộ → 47', () => {
    expect(sitBadge({ due: [], learned: ids.slice(0, 3), hasLessons: true })).toEqual({ n: 47, kind: 'new' });
  });

  it('R-DIEU-7: tông môn không bộ đến hạn → không chấm; học đủ ở Rừng trúc → không chấm', () => {
    expect(sitBadge({ due: [], learned: first5, hasLessons: false })).toBeNull();
    expect(sitBadge({ due: [], learned: ids, hasLessons: true })).toBeNull();
  });
});
