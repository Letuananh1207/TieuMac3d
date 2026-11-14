import { describe, expect, it } from 'vitest';
import { DECOR_ITEMS } from '../zones/decor';
import { parseProgress, shopPayload } from './flutterBridge';

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

describe('Văn tiền (docs/bridge.md)', () => {
  it('R-TIEN-1: getProgress đọc số dư + trò hôm nay; thiếu coins → ví ẩn (null)', () => {
    const p = parseProgress({ chars: 0, coins: 1280, gameCoinsToday: 24 });
    expect(p?.coins).toBe(1280);
    expect(p?.gameCoinsToday).toBe(24);
    expect(parseProgress({ chars: 0 })?.coins).toBeNull();
    expect(parseProgress({ chars: 0 })?.gameCoinsToday).toBe(0);
    expect(parseProgress({ chars: 0, coins: -3 })?.coins).toBe(0);
  });

  it('R-TIEN-4: openShop gửi đủ 13 vật với giá + số chữ Hán (một nguồn giá decor.ts)', () => {
    const items = shopPayload(DECOR_ITEMS);
    expect(items).toHaveLength(13);
    expect(items.find((i) => i.id === 'da-thai-ho')).toEqual({ id: 'da-thai-ho', name: 'Đá Thái Hồ', han: '石', slot: 'vuon', price: 160, priceHan: '一百六十文' });
  });
});
