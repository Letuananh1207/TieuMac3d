import { describe, expect, it } from 'vitest';
import { boardBeforeNpc, dailyBoardSpot, dailyBoardView, nearBoard, tasksLeft, type PropLike } from './dailyBoard';

describe('Bảng nhiệm vụ hằng ngày', () => {
  const board: PropLike = { kind: 'bang', x: -7.5, z: 18.8, text: 'Nhiệm vụ hằng ngày' };

  it('R-NV-3: tìm bảng trong đặc tả; đứng cách 2 m → trong tầm, 2,5 m → ngoài tầm', () => {
    const spot = dailyBoardSpot([{ kind: 'den-da', x: 0, z: 0 }, board]);
    expect(spot).toEqual({ x: -7.5, z: 18.8 });
    expect(nearBoard(spot!, -7.5, 20.8)).toBe(true);
    expect(nearBoard(spot!, -7.5, 21.3)).toBe(false);
    expect(dailyBoardSpot([{ kind: 'den-da', x: 0, z: 0 }])).toBeNull();
  });

  it('R-NV-3: cùng tầm nút "Nói chuyện" của Tiểu Mặc (−4,4; 19) → vật gần hơn thắng, cách đều → "Xem bảng"', () => {
    const tm = { x: -4.4, z: 19 };
    expect(boardBeforeNpc(board, tm, -6.2, 20.4)).toBe(true);
    expect(boardBeforeNpc(board, tm, -5.8, 20.2)).toBe(false);
    expect(boardBeforeNpc({ x: 0, z: 0 }, { x: 2, z: 0 }, 1, 1)).toBe(true);
  });

  it('R-NV-1: chấm son = số việc còn lại hôm nay', () => {
    expect(tasksLeft({ learned: 0, goal: 1, due: 4 }, false)).toBe(2);
    expect(tasksLeft({ learned: 1, goal: 1, due: 4 }, false)).toBe(1);
    expect(tasksLeft({ learned: 0, goal: 1, due: 0 }, true)).toBe(0); // học hết giáo trình, không có từ đến hạn
    expect(tasksLeft(null, false)).toBeNull();
  });
});

describe('Bảng nhiệm vụ trên web (dailyBoardView)', () => {
  it('R-NV-1/2: đang dở — 0/1, còn 4 từ, chuỗi giữ 5', () => {
    const v = dailyBoardView({ learned: 0, goal: 1, due: 4, streak: 5, best: 7 }, false, 10);
    expect(v.learn).toMatchObject({ done: false, dots: 0, count: '0/1' });
    expect(v.review).toMatchObject({ done: false, left: 4, sub: 'Còn 4 từ đến hạn hôm nay.' });
    expect(v.allDone).toBe(false);
    expect(v.footer).toContain('giữ 5');
  });

  it('R-NV-1: mới cài — 0/1, không từ đến hạn → Ôn tập xong, gợi ý bài đầu tiên', () => {
    const v = dailyBoardView({ learned: 0, goal: 1, due: 0, streak: 0, best: 0 }, false, 0);
    expect(v.review.done).toBe(true);
    expect(v.learn.sub).toContain('bài đầu tiên');
    expect(v.footer).toBe('Xong cả 2 việc hôm nay để bắt đầu chuỗi.');
  });

  it('R-NV-1: học hết giáo trình, không đến hạn → xong cả 2, không đếm n/1', () => {
    const v = dailyBoardView({ learned: 0, goal: 1, due: 0, streak: 23, best: 23 }, true, 50);
    expect(v.allDone).toBe(true);
    expect(v.learn.count).toBeNull();
    expect(v.footer).toContain('đã xong');
  });
});
