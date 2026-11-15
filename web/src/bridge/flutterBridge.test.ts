import { describe, expect, it } from 'vitest';
import { DECOR_ITEMS } from '../zones/decor';
import { parseAlmsReply, parseProgress, shopPayload } from './flutterBridge';

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
    expect(items.find((i) => i.id === 'da-thai-ho')).toEqual({ id: 'da-thai-ho', name: 'Đá Thái Hồ', where: 'ngoai', price: 160 });
  });
});

describe('giveAlms + getProgress.alms (docs/bridge.md)', () => {
  it('R-TIEN-8: getProgress.alms đọc ngày cho + số lần; thiếu (bản cũ) → chưa cho lần nào', () => {
    expect(parseProgress({ chars: 0, alms: { lastDay: 20771, count: 3 } })?.alms).toEqual({ lastDay: 20771, count: 3 });
    expect(parseProgress({ chars: 0 })?.alms).toEqual({ lastDay: -1, count: 0 });
  });

  it('R-TIEN-8: câu trả lời giveAlms — được / đã cho / thiếu; sai dạng → null', () => {
    expect(parseAlmsReply({ ok: true, balance: 7, alms: { lastDay: 20771, count: 1 } })).toEqual({ ok: true, balance: 7, alms: { lastDay: 20771, count: 1 } });
    expect(parseAlmsReply({ ok: false, reason: 'short', balance: 3 })).toEqual({ ok: false, reason: 'short', balance: 3 });
    expect(parseAlmsReply({ ok: false, reason: 'given', balance: 7 })).toEqual({ ok: false, reason: 'given', balance: 7 });
    for (const v of [null, true, { ok: true, balance: 7 }, { ok: false, reason: 'x', balance: 1 }, { ok: true, balance: -1, alms: { lastDay: 1, count: 1 } }]) {
      expect(parseAlmsReply(v)).toBeNull();
    }
  });
});
