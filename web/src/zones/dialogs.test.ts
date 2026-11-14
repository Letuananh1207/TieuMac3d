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

describe('Hội thoại NPC công trình', () => {
  const of = (id: string) => DIALOGS.find((d) => d.npc === id);
  const texts = (id: string): string[] => of(id)!.lines.flatMap((l) => l.choices.map((c) => c.text));

  it('R-NPC-3: Tiểu nhị chào "khách quan", hỏi được về trà, nhạc, chỗ ngồi / lên lầu', () => {
    const d = of('tieu-nhi')!;
    expect(d.han).toBeUndefined(); // tên nhân vật không kèm chữ Hán (người dùng 2026-11-14)
    expect(d.lines.find((l) => l.id === d.start)!.text).toContain('Khách quan');
    const all = texts('tieu-nhi').join(' | ');
    expect(all).toContain('trà');
    expect(all).toContain('nhạc');
    expect(all).toContain('lầu');
  });

  it('R-NPC-4: Quản sự giới thiệu Ngũ Tử Kỳ (5 quân liền) và Đấu chữ (10 câu, không ghi tiến độ)', () => {
    const d = of('quan-su')!;
    expect(d.han).toBeUndefined(); // tên nhân vật không kèm chữ Hán (người dùng 2026-11-14)
    const lines = d.lines.map((l) => l.text).join(' ');
    expect(lines).toContain('5 quân');
    expect(lines).toContain('10 câu');
    expect(lines).toContain('không ghi');
  });

  it('R-NPC-5: Trận sư có lựa chọn "Ta đi được những đâu?" đóng khung rồi đọc tiến độ', () => {
    const d = of('tran-su')!;
    expect(d.han).toBeUndefined(); // tên nhân vật không kèm chữ Hán (người dùng 2026-11-14)
    const c = d.lines.flatMap((l) => l.choices).find((x) => x.text === 'Ta đi được những đâu?')!;
    expect(c.action).toBe('journey');
    expect(c.next).toBeNull();
  });
});
