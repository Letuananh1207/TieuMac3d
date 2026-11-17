import { describe, expect, it } from 'vitest';
import { DECOR_ITEMS } from '../zones/decor';
import { parseAlmsReply, parseProgress, shopPayload } from './flutterBridge';

describe('getProgress (docs/bridge.md)', () => {
  it('R-SACH-2: đọc sổ từ đang mượn; thiếu / rỗng → không mượn', () => {
    expect(parseProgress({ lessons: [], book: 'hsk1' })?.book).toBe('hsk1');
    expect(parseProgress({ lessons: [], book: null })?.book).toBeNull();
    expect(parseProgress({ lessons: [] })?.book).toBeNull();
    expect(parseProgress({ lessons: [], book: '' })?.book).toBeNull();
  });

  it('R-HANH-1: không khoá vùng — trả lời không cần `open` / `need`, đọc bài + từ đã học', () => {
    const p = parseProgress({ lessons: ['bai-01', 1], words: ['你', 2] });
    expect(p?.lessons).toEqual(['bai-01']);
    expect(p?.words).toEqual(['你']);
    expect(p && 'open' in p).toBe(false);
    expect(p && 'need' in p).toBe(false);
  });

  it('R-ON-2: bậc của từ đến hạn đi kèm `due`; thiếu → 0; R-TU-5: khoá bộ thủ cũ không đọc', () => {
    const p = parseProgress({ due: ['你', '好'], dueSteps: [3], radicals: ['truc'], chars: 4 });
    expect(p?.dueSteps).toEqual([3, 0]);
    expect(p?.lessons).toEqual([]);
    expect(p && 'radicals' in p).toBe(false);
  });
});

describe('Văn tiền (docs/bridge.md)', () => {
  it('R-TIEN-1: getProgress đọc số dư + trò hôm nay; thiếu coins → ví ẩn (null)', () => {
    const p = parseProgress({ lessons: [], coins: 1280, gameCoinsToday: 24 });
    expect(p?.coins).toBe(1280);
    expect(p?.gameCoinsToday).toBe(24);
    expect(parseProgress({ lessons: [] })?.coins).toBeNull();
    expect(parseProgress({ lessons: [] })?.gameCoinsToday).toBe(0);
    expect(parseProgress({ lessons: [], coins: -3 })?.coins).toBe(0);
  });

  it('R-TIEN-4: openShop gửi đủ 13 vật với giá + số chữ Hán (một nguồn giá decor.ts)', () => {
    const items = shopPayload(DECOR_ITEMS);
    expect(items).toHaveLength(13);
    expect(items.find((i) => i.id === 'da-thai-ho')).toEqual({ id: 'da-thai-ho', name: 'Đá Thái Hồ', where: 'ngoai', price: 160 });
  });
});

describe('giveAlms + getProgress.alms (docs/bridge.md)', () => {
  it('R-TIEN-8: getProgress.alms đọc ngày cho + số lần; thiếu (bản cũ) → chưa cho lần nào', () => {
    expect(parseProgress({ lessons: [], alms: { lastDay: 20771, count: 3 } })?.alms).toEqual({ lastDay: 20771, count: 3 });
    expect(parseProgress({ lessons: [] })?.alms).toEqual({ lastDay: -1, count: 0 });
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
