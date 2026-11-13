import { describe, expect, it } from 'vitest';
import { journeyLine } from './tranSu';

const places = [
  { id: 'van-uyen', ten: 'Văn Uyên Tông' },
  { id: 'rung-truc', ten: 'Rừng trúc' },
  { id: 'giang-nam', ten: 'Giang Nam' },
  { id: 'bong-lai', ten: 'Bồng Lai' },
];

describe('Trận sư đọc tiến độ', () => {
  it('R-NPC-5: 12 chữ, 3 bộ thủ, Giang Nam cần 50 bộ → còn thiếu 47 bộ', () => {
    const s = journeyLine({ chars: 12, radicals: 3, need: { 'giang-nam': { radicals: 50 }, 'bong-lai': { chars: 300 } } }, places);
    expect(s).toBe('Đạo hữu đã học 12 chữ, 3 bộ thủ. Vùng kế tiếp là Giang Nam: cần đủ 50 bộ thủ — còn thiếu 47 bộ.');
  });

  it('R-NPC-5: vùng khoá đầu tiên theo thứ tự hành trình; mốc theo chữ', () => {
    const s = journeyLine({ chars: 120, radicals: 50, need: { 'bong-lai': { chars: 300 } } }, places);
    expect(s).toContain('Vùng kế tiếp là Bồng Lai: cần 300 chữ — còn thiếu 180 chữ.');
  });

  it('R-NPC-5: không còn vùng khoá → đã mở hết; không có tiến độ → câu chung', () => {
    expect(journeyLine({ chars: 5000, radicals: 50, need: {} }, places)).toContain('các vùng đều đã mở cho đạo hữu');
    expect(journeyLine(null, places)).toContain('Rừng trúc');
  });
});
