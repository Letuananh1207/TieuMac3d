import { describe, expect, it } from 'vitest';
import { sitButtonText } from './actionButtons';

// chuỗi theo design/l10n/vi.arb actionSit* (thiết kế 2026-11-14.10)
describe('Nút Ngồi ôn — chữ', () => {
  it('R-DIEU-7: thường "Ngồi ôn", không chấm', () => {
    expect(sitButtonText(false, null)).toEqual({ label: 'Ngồi ôn', aria: 'Ngồi ôn', badge: null });
  });

  it('R-DIEU-7: 4 bộ đến hạn → chấm "4", trợ năng "còn 4 bộ đến hạn"', () => {
    expect(sitButtonText(false, { n: 4, kind: 'due' })).toEqual({ label: 'Ngồi ôn', aria: 'Ngồi ôn, còn 4 bộ đến hạn', badge: '4' });
  });

  it('R-DIEU-7: Rừng trúc 47 bộ chưa học → chấm "47"; từ 100 → "99+"', () => {
    expect(sitButtonText(false, { n: 47, kind: 'new' })).toEqual({ label: 'Ngồi ôn', aria: 'Ngồi ôn, còn 47 bộ chưa học', badge: '47' });
    expect(sitButtonText(false, { n: 120, kind: 'due' }).badge).toBe('99+');
  });

  it('R-DIEU-7: đang ngồi → "Đang ôn", ẩn chấm', () => {
    expect(sitButtonText(true, { n: 4, kind: 'due' })).toEqual({ label: 'Đang ôn', aria: 'Đang ôn, bấm để đứng dậy', badge: null });
  });
});
