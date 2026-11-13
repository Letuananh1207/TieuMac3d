import { describe, expect, it } from 'vitest';
import { parseProgress } from './flutterBridge';

describe('getProgress (docs/bridge.md)', () => {
  it('R-SACH-2: đọc sổ từ đang mượn; thiếu / rỗng → không mượn', () => {
    expect(parseProgress({ open: ['rung-truc'], book: 'hsk1' })?.book).toBe('hsk1');
    expect(parseProgress({ open: ['rung-truc'], book: null })?.book).toBeNull();
    expect(parseProgress({ open: ['rung-truc'] })?.book).toBeNull();
    expect(parseProgress({ open: ['rung-truc'], book: '' })?.book).toBeNull();
  });
});
