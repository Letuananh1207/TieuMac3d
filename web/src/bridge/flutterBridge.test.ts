import { describe, expect, it } from 'vitest';
import { parseProgress } from './flutterBridge';

describe('getProgress (docs/bridge.md)', () => {
  it('R-SACH-2: đọc sổ từ đang mượn; thiếu / rỗng → không mượn', () => {
    expect(parseProgress({ chars: 0, book: 'hsk1' })?.book).toBe('hsk1');
    expect(parseProgress({ chars: 0, book: null })?.book).toBeNull();
    expect(parseProgress({ chars: 0 })?.book).toBeNull();
    expect(parseProgress({ chars: 0, book: '' })?.book).toBeNull();
  });

  it('R-HANH-1: không khoá vùng — trả lời không cần `open` / `need`, đọc chữ + bộ thủ đã học', () => {
    const p = parseProgress({ chars: 2, radicals: ['truc', 1] });
    expect(p?.chars).toBe(2);
    expect(p?.radicals).toEqual(['truc']);
    expect(p && 'open' in p).toBe(false);
    expect(p && 'need' in p).toBe(false);
  });
});
