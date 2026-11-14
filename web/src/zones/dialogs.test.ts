import { describe, expect, it } from 'vitest';
import { DIALOGS, checkDialog } from './dialogs';

describe('Hội thoại', () => {
  it('R-NPC-2: dữ liệu hội thoại hợp lệ (câu nào cũng có Tạm biệt, 1–3 lựa chọn, câu tiếp có thật)', () => {
    for (const d of DIALOGS) expect(checkDialog(d)).toEqual([]);
  });

  it('R-NV-3: Tiểu Mặc có lựa chọn "Hôm nay có việc gì?" mở bảng nhiệm vụ', () => {
    const tm = DIALOGS.find((d) => d.npc === 'tieu-mac')!;
    const chao = tm.lines.find((l) => l.id === tm.start)!;
    expect(chao.choices.some((c) => c.action === 'daily' && c.next === null)).toBe(true);
  });
});

// người dùng 2026-11-14: tên nhân vật không kèm chữ Hán (hộp thoại, thẻ Nói chuyện, bàn chơi, trò chuyện)
describe('tên nhân vật', () => {
  it('không có chữ Hán', async () => {
    const { DIALOGS } = await import('./dialogs');
    const { librarianDialog } = await import('./library');
    const all = [...DIALOGS, librarianDialog(null, false)];
    for (const d of all) {
      expect(d.han).toBeUndefined();
      expect(d.name).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
