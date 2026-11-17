import { describe, expect, it } from 'vitest';
import { sitButtonText } from './actionButtons';

// chuỗi theo design/l10n/vi.arb actionSit* (thiết kế 2026-11-14.10)
describe('Nút Tĩnh toạ — chữ', () => {
  it('R-DIEU-7: thường "Tĩnh toạ", không chấm', () => {
    expect(sitButtonText(false, null)).toEqual({ label: 'Tĩnh toạ', aria: 'Tĩnh toạ', badge: null });
  });

  it('R-DIEU-7: 4 từ đến hạn → chấm "4", trợ năng "còn 4 từ đến hạn"', () => {
    expect(sitButtonText(false, { n: 4, kind: 'due' })).toEqual({ label: 'Tĩnh toạ', aria: 'Tĩnh toạ, còn 4 từ đến hạn', badge: '4' });
  });

  it('R-DIEU-7: 47 từ đến hạn → chấm "47"; từ 100 → "99+"', () => {
    expect(sitButtonText(false, { n: 47, kind: 'due' })).toEqual({ label: 'Tĩnh toạ', aria: 'Tĩnh toạ, còn 47 từ đến hạn', badge: '47' });
    expect(sitButtonText(false, { n: 120, kind: 'due' }).badge).toBe('99+');
  });

  it('R-DIEU-7: đang ngồi → "Đang tĩnh toạ", ẩn chấm', () => {
    expect(sitButtonText(true, { n: 4, kind: 'due' })).toEqual({ label: 'Đang tĩnh toạ', aria: 'Đang tĩnh toạ, bấm để đứng dậy', badge: null });
  });
});
