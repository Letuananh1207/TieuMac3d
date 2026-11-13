import { describe, expect, it } from 'vitest';
import { dailyBoardSpot, nearBoard, tasksLeft, type PropLike } from './dailyBoard';

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
