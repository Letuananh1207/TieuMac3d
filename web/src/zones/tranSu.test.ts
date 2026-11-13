import { describe, expect, it } from 'vitest';
import { journeyLine } from './tranSu';

const places = [
  { id: 'van-uyen', ten: 'Văn Uyên Tông' },
  { id: 'rung-truc', ten: 'Rừng trúc' },
  { id: 'giang-nam', ten: 'Giang Nam' },
  { id: 'bong-lai', ten: 'Bồng Lai' },
];

describe('Trận sư đọc tiến độ', () => {
  it('R-NPC-5: 12 chữ, 3 bộ thủ, chỉ Rừng trúc có cảnh → đi được Rừng trúc, sắp mở Giang Nam, Bồng Lai', () => {
    expect(journeyLine({ chars: 12, radicals: 3 }, places, new Set(['rung-truc']))).toBe(
      'Đạo hữu đã học 12 chữ, 3 bộ thủ. Trận đồ đã sáng: Rừng trúc — bước vào vòng trận là đi được. Sắp mở: Giang Nam, Bồng Lai.',
    );
  });

  it('R-NPC-5: không nói chuyện khoá vùng — số chữ nhiều hay ít, câu về vùng như nhau (R-HANH-1)', () => {
    const scenes = new Set(['rung-truc']);
    const tail = (n: number): string => journeyLine({ chars: n, radicals: 0 }, places, scenes).split('. ').slice(1).join('. ');
    expect(tail(0)).toBe(tail(3000));
    expect(journeyLine({ chars: 0, radicals: 0 }, places, scenes)).not.toMatch(/khoá|thiếu/);
  });

  it('R-NPC-5: mọi vùng có cảnh → đã mở hết; không có tiến độ → bỏ phần đã học', () => {
    expect(journeyLine({ chars: 1, radicals: 1 }, places, new Set(['rung-truc', 'giang-nam', 'bong-lai']))).toContain('Các vùng đều đã mở');
    expect(journeyLine(null, places, new Set(['rung-truc']))).toMatch(/^Trận đồ đã sáng: Rừng trúc/);
  });
});
