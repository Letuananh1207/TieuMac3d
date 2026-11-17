import { describe, expect, it } from 'vitest';
import { journeyLine } from './tranSu';

const places = [
  { id: 'van-uyen', ten: 'Văn Uyên Tông' },
  { id: 'rung-truc', ten: 'Trúc Lâm' },
  { id: 'giang-nam', ten: 'Yên Vũ Lâu' },
  { id: 'bong-lai', ten: 'Bồng Lai Đảo' },
];

describe('Trận sư đọc tiến độ', () => {
  it('R-NPC-5: 12 từ, 2 bài, chỉ Trúc Lâm có cảnh → đi được Trúc Lâm, sắp mở Yên Vũ Lâu, Bồng Lai Đảo', () => {
    expect(journeyLine({ words: 12, lessons: 2 }, places, new Set(['rung-truc']))).toBe(
      'Đạo hữu đã học 12 từ, 2 bài. Trận đồ đã sáng: Trúc Lâm — bước vào vòng trận là đi được. Sắp mở: Yên Vũ Lâu, Bồng Lai Đảo.',
    );
  });

  it('R-NPC-5: không nói chuyện khoá vùng — số từ nhiều hay ít, câu về vùng như nhau (R-HANH-1)', () => {
    const scenes = new Set(['rung-truc']);
    const tail = (n: number): string => journeyLine({ words: n, lessons: 0 }, places, scenes).split('. ').slice(1).join('. ');
    expect(tail(0)).toBe(tail(304));
    expect(journeyLine({ words: 0, lessons: 0 }, places, scenes)).not.toMatch(/khoá|thiếu/);
  });

  it('R-NPC-5: mọi vùng có cảnh → đã mở hết; không có tiến độ → bỏ phần đã học', () => {
    expect(journeyLine({ words: 6, lessons: 1 }, places, new Set(['rung-truc', 'giang-nam', 'bong-lai']))).toContain('Các vùng đều đã mở');
    expect(journeyLine(null, places, new Set(['rung-truc']))).toMatch(/^Trận đồ đã sáng: Trúc Lâm/);
  });
});
