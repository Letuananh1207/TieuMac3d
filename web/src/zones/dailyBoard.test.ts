import { describe, expect, it } from 'vitest';
import { dailyBoardSpot, dailyBoardView, nearBoard, tasksLeft, type PropLike } from './dailyBoard';

describe('Bảng nhiệm vụ 日課榜', () => {
  const board: PropLike = { kind: 'bang', x: 5.5, z: 19.2, text: '日課榜' };

  it('R-NV-3: tìm bảng trong đặc tả; đứng cách 2 m → trong tầm, 2,5 m → ngoài tầm', () => {
    const spot = dailyBoardSpot([{ kind: 'den-da', x: 0, z: 0 }, board]);
    expect(spot).toEqual({ x: 5.5, z: 19.2 });
    expect(nearBoard(spot!, 5.5, 17.2)).toBe(true);
    expect(nearBoard(spot!, 5.5, 16.7)).toBe(false);
    expect(dailyBoardSpot([{ kind: 'den-da', x: 0, z: 0 }])).toBeNull();
  });

  it('R-NV-1: chấm son = số việc còn lại hôm nay', () => {
    expect(tasksLeft({ learned: 2, goal: 3, due: 4 }, false)).toBe(2);
    expect(tasksLeft({ learned: 3, goal: 3, due: 4 }, false)).toBe(1);
    expect(tasksLeft({ learned: 0, goal: 3, due: 0 }, true)).toBe(0); // học hết 50 bộ, không có bộ đến hạn
    expect(tasksLeft(null, false)).toBeNull();
  });
});

describe('Bảng nhiệm vụ trên web (dailyBoardView)', () => {
  it('R-NV-1/2: đang dở — 2/3, còn 4 bộ, chuỗi giữ 5', () => {
    const v = dailyBoardView({ learned: 2, goal: 3, due: 4, streak: 5, best: 7 }, false, 10);
    expect(v.learn).toMatchObject({ done: false, dots: 2, count: '2/3' });
    expect(v.review).toMatchObject({ done: false, left: 4, sub: 'Còn 4 bộ đến hạn hôm nay.' });
    expect(v.allDone).toBe(false);
    expect(v.footer).toContain('giữ 5');
  });

  it('R-NV-1: mới cài — 0/3, không bộ đến hạn → Ôn tập xong, gợi ý bộ đầu tiên', () => {
    const v = dailyBoardView({ learned: 0, goal: 3, due: 0, streak: 0, best: 0 }, false, 0);
    expect(v.review.done).toBe(true);
    expect(v.learn.sub).toContain('bộ đầu tiên');
    expect(v.footer).toBe('Xong cả 2 việc hôm nay để bắt đầu chuỗi.');
  });

  it('R-NV-1: học đủ 50 bộ, không đến hạn → xong cả 2, không đếm n/3', () => {
    const v = dailyBoardView({ learned: 0, goal: 3, due: 0, streak: 23, best: 23 }, true, 50);
    expect(v.allDone).toBe(true);
    expect(v.learn.count).toBeNull();
    expect(v.footer).toContain('đã xong');
  });
});
