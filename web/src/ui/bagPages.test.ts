import { describe, expect, it } from 'vitest';
import { bagPage } from './bagPages';

describe('lật trang túi đồ (R-TUI-1)', () => {
  it('R-TUI-1: lưới 3×4 = 12 ô / trang; ≤ 12 món → "1/1"; 13 món → 2 trang, trang 2 còn 1 món', () => {
    expect(bagPage([], 0)).toEqual({ items: [], page: 0, pages: 1, label: '1/1' });
    const xs = Array.from({ length: 13 }, (_, i) => i);
    expect(bagPage(xs.slice(0, 12), 0).label).toBe('1/1');
    expect(bagPage(xs, 0).items).toHaveLength(12);
    expect(bagPage(xs, 1)).toEqual({ items: [12], page: 1, pages: 2, label: '2/2' });
  });

  it('R-TUI-1: trang ngoài khoảng (món ít đi sau khi bán) → kẹp về trang có', () => {
    expect(bagPage([1, 2], 3).page).toBe(0);
    expect(bagPage([1, 2], -1).page).toBe(0);
  });
});
