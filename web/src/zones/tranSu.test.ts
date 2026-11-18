import { describe, expect, it } from 'vitest';
import { journeyLine } from './tranSu';

const places = [
  { id: 'van-uyen', ten: 'Văn Uyên Tông' },
  { id: 'rung-truc', ten: 'Thung Trúc Gió Hát' },
  { id: 'giang-nam', ten: 'Chợ Đêm Đèn Hoa' },
  { id: 'bong-lai', ten: 'Cung Ngọc Đáy Biển' },
];

describe('La đại thúc đọc tiến độ', () => {
  it('R-NPC-5: 12 từ, 2 bài, chỉ Thung Trúc Gió Hát có cảnh → đi được Thung Trúc Gió Hát, sắp mở Chợ Đêm Đèn Hoa, Cung Ngọc Đáy Biển', () => {
    expect(journeyLine({ words: 12, lessons: 2 }, places, new Set(['rung-truc']))).toBe(
      'Cháu đã học 12 từ, 2 bài. Trận đồ đã sáng: Thung Trúc Gió Hát — bước vào vòng trận là đi được. Sắp mở: Chợ Đêm Đèn Hoa, Cung Ngọc Đáy Biển.',
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
    expect(journeyLine(null, places, new Set(['rung-truc']))).toMatch(/^Trận đồ đã sáng: Thung Trúc Gió Hát/);
  });
});
