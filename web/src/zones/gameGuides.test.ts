import { describe, expect, it } from 'vitest';
import { boldParts, gameGuide, gameSigns, signInRange } from './gameGuides';

const TABLES = [
  { kind: 'co', npc: 'tieu-mac', sign: { x: -30.5, z: 2.6, han: '五子棋', name: 'Ngũ Tử Kỳ' } },
  { kind: 'dau-chu', npc: 'su-phu', sign: { x: -37.5, z: 12.4, han: '鬥字', name: 'Đấu chữ' } },
  { kind: 'co', npc: 'tieu-mac' },
];

describe('Biển tên trò chơi — R-GIAO-2', () => {
  it('R-GIAO-2: chỉ bàn có biển; đứng dưới 2,5 m → biển gần nhất, xa hơn → không có', () => {
    const signs = gameSigns(TABLES);
    expect(signs.map((s) => s.name)).toEqual(['Ngũ Tử Kỳ', 'Đấu chữ']);
    expect(signInRange(signs, -29, 2.6)?.name).toBe('Ngũ Tử Kỳ');
    expect(signInRange(signs, -27, 2.6)).toBeNull();
    expect(signInRange(signs, -34, 7.5)).toBeNull(); // giữa hai bàn: cách 6 / 6 m → không
    expect(signInRange(signs, -36, 12.4)?.name).toBe('Đấu chữ');
  });

  it('R-GIAO-2: bảng cách chơi — đủ 4 mục theo thứ tự, mẹo của NPC bàn, Đấu chữ có ô "chưa học bộ nào"', () => {
    for (const kind of ['co', 'dau-chu']) {
      const g = gameGuide(kind)!;
      expect(g.sections.map((x) => x.title)).toEqual(['Mục tiêu', 'Mỗi lượt', 'Thắng · thua · hoà', 'Vào bàn · rời bàn']);
      expect(JSON.stringify(g)).not.toMatch(/[\u4e00-\u9fff]{2}/); // tên bảng không kèm chữ Hán (R-HUD-4); mẹo một chữ 木 là nội dung học
    }
    expect(gameGuide('co')!.tipBy).toBe('tieu-mac');
    expect(gameGuide('dau-chu')!.tipBy).toBe('su-phu');
    expect(gameGuide('co')!.none).toBeUndefined();
    expect(gameGuide('dau-chu')!.none?.title).toBe('Đạo hữu chưa học bộ thủ nào');
    expect(gameGuide('khac')).toBeNull();
  });

  it('R-GIAO-2: bảng nói đúng luật (R-CO-1, R-DAU-1/2)', () => {
    const all = (kind: string): string => {
      const g = gameGuide(kind)!;
      return [g.caption, ...g.sections.map((x) => x.body)].join(' ').replace(/\*\*/g, '');
    };
    expect(all('co')).toContain('13 × 13');
    expect(all('co')).toContain('5 quân');
    expect(all('co')).toContain('quân đen, đi trước');
    expect(all('dau-chu')).toContain('10 câu');
    expect(all('dau-chu')).toContain('4 nghĩa');
    expect(all('dau-chu')).toContain('không tính tiến độ');
  });

  it('chữ đậm: tách đoạn "**…**" thành phần thường / đậm', () => {
    expect(boldParts('Xếp **5 quân** liền')).toEqual([
      { text: 'Xếp ', bold: false },
      { text: '5 quân', bold: true },
      { text: ' liền', bold: false },
    ]);
  });
});
