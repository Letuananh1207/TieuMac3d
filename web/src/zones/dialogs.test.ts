import { describe, expect, it } from 'vitest';
import { DIALOGS, checkDialog, dailyLine } from './dialogs';

describe('Hội thoại', () => {
  it('R-NPC-2: dữ liệu hội thoại hợp lệ (câu nào cũng có Tạm biệt, 1–3 lựa chọn, câu tiếp có thật)', () => {
    for (const d of DIALOGS) expect(checkDialog(d)).toEqual([]);
  });

  it('R-NV-3: Tiểu Mặc có lựa chọn "Hôm nay có việc gì?" mở bảng nhiệm vụ', () => {
    const tm = DIALOGS.find((d) => d.npc === 'tieu-mac')!;
    const chao = tm.lines.find((l) => l.id === tm.start)!;
    expect(chao.choices.some((c) => c.action === 'daily' && c.next === null)).toBe(true);
  });

  it('R-NV-1, R-NV-2: Tiểu Mặc đọc bảng — tiến độ Lĩnh hội, số bộ còn ôn, chuỗi ngày', () => {
    const line = dailyLine({ learned: 2, goal: 3, due: 4, streak: 5, best: 7 });
    expect(line).toContain('2/3');
    expect(line).toContain('còn 4 bộ cần ôn');
    expect(line).toContain('tu liền 5 ngày, kỷ lục 7');
    expect(dailyLine({ learned: 3, goal: 3, due: 0, streak: 1, best: 1 })).toContain('xong cả hai việc');
    expect(dailyLine(null)).toContain('3 bộ thủ mới');
  });
});
