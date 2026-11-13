import { describe, expect, it } from 'vitest';
import { checkDialog, DialogRunner } from './dialogs';
import { gameSigns, guideDialog, signInRange } from './gameGuides';

const TABLES = [
  { kind: 'co', npc: 'tieu-mac', sign: { x: -29.5, z: 4, han: '五子棋', name: 'Ngũ Tử Kỳ' } },
  { kind: 'dau-chu', npc: 'su-phu', sign: { x: -29.5, z: 11, han: '鬥字', name: 'Đấu chữ' } },
  { kind: 'co', npc: 'tieu-mac' },
];

describe('Biển tên trò chơi — R-GIAO-2', () => {
  it('R-GIAO-2: chỉ bàn có biển; đứng dưới 2,5 m → biển gần nhất, xa hơn → không có', () => {
    const signs = gameSigns(TABLES);
    expect(signs.map((s) => s.name)).toEqual(['Ngũ Tử Kỳ', 'Đấu chữ']);
    expect(signInRange(signs, -28, 4)?.name).toBe('Ngũ Tử Kỳ');
    expect(signInRange(signs, -26, 4)).toBeNull();
    expect(signInRange(signs, -29.5, 8)).toBeNull(); // cách 4 / 3 m → không
    expect(signInRange(signs, -29.5, 9)?.name).toBe('Đấu chữ');
  });

  it('R-GIAO-2: lời giảng là thoại hợp lệ của NPC bàn, "Tiếp" đi hết các trang, trang cuối chỉ "Đã hiểu"', () => {
    for (const s of gameSigns(TABLES)) {
      const d = guideDialog(s);
      expect(checkDialog(d)).toEqual([]);
      expect(d.npc).toBe(s.npc);
      expect(d.lines.length).toBeGreaterThanOrEqual(3);
      const r = new DialogRunner(d);
      let line = r.start();
      let pages = 1;
      while (line.choices[0].text === 'Tiếp') {
        line = r.choose(0)!;
        pages++;
      }
      expect(pages).toBe(d.lines.length);
      expect(line.choices.map((c) => c.text)).toEqual(['Đã hiểu']);
      expect(r.choose(0)).toBeNull();
    }
  });

  it('R-GIAO-2: lời giảng nói đúng luật (R-CO-1, R-DAU-1/2)', () => {
    const co = guideDialog({ kind: 'co', npc: 'tieu-mac' }).lines.map((l) => l.text).join(' ');
    expect(co).toContain('13 × 13');
    expect(co).toContain('5 quân');
    expect(co).toContain('đen');
    const dau = guideDialog({ kind: 'dau-chu', npc: 'su-phu' }).lines.map((l) => l.text).join(' ');
    expect(dau).toContain('10 câu');
    expect(dau).toContain('4 nghĩa');
    expect(guideDialog({ kind: 'dau-chu', npc: 'su-phu' }).name).toBe('Mặc Ông');
  });
});
