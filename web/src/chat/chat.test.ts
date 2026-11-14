import { describe, expect, it } from 'vitest';
import { BubbleTimer, bubbleLook, bubbleVisible } from './bubbleTimer';
import { LocalChannel, collapsedVisible } from './chatChannel';
import { checkSend, type ChatMessage, type Speaker } from './chatMessage';
import { CHATTER_MAX_S, CHATTER_MIN_S, NpcChatter } from './npcChatter';

const ta: Speaker = { id: 'player', name: 'Đạo hữu', kind: 'player' };
const tm: Speaker = { id: 'tieu-mac', name: 'Tiểu Mặc', kind: 'npc' };

/** Số giả ngẫu nhiên có hạt giống (mulberry32) — test lặp lại được. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('Gửi tin', () => {
  it('R-CHAT-1: bỏ khoảng trắng hai đầu, gộp khoảng trắng liền nhau', () => {
    expect(checkSend('  chào   đạo hữu  ', 0, undefined)).toEqual({ ok: true, text: 'chào đạo hữu' });
  });

  it('R-CHAT-1: tin rỗng / chỉ khoảng trắng → không gửi', () => {
    expect(checkSend('   ', 0, undefined)).toEqual({ ok: false, reason: 'rong' });
  });

  it('R-CHAT-1: 60 ký tự gửi được, 61 → quá dài; chữ Hán / có dấu đếm 1', () => {
    expect(checkSend('a'.repeat(60), 0, undefined).ok).toBe(true);
    expect(checkSend('a'.repeat(61), 0, undefined)).toEqual({ ok: false, reason: 'qua-dai' });
    expect(checkSend('好'.repeat(60), 0, undefined).ok).toBe(true);
    expect(checkSend('ệ'.repeat(60), 0, undefined).ok).toBe(true);
    // 'ệ' viết dạng tách dấu (e + 2 dấu) vẫn là 1 ký tự sau chuẩn hoá NFC
    expect(checkSend('ệ'.repeat(60), 0, undefined).ok).toBe(true);
  });

  it('R-CHAT-1: hai tin cách nhau dưới 1,5 giây → chờ', () => {
    const ch = new LocalChannel();
    expect(ch.send(ta, 'một', 10).ok).toBe(true);
    expect(ch.send(ta, 'hai', 11)).toEqual({ ok: false, reason: 'cho' });
    expect(ch.send(ta, 'hai', 11.5).ok).toBe(true);
    // người khác không bị chặn bởi tin của ta
    expect(ch.send(tm, 'chào', 10.2).ok).toBe(true);
  });

  it('R-CHAT-1: gửi được → mọi người nghe (kể cả người gửi); không gửi được → không ai nhận', () => {
    const ch = new LocalChannel();
    const a: ChatMessage[] = [];
    const b: ChatMessage[] = [];
    ch.subscribe((m) => a.push(m));
    const off = ch.subscribe((m) => b.push(m));
    ch.send(ta, '  xin chào ', 3);
    ch.send(ta, '', 9);
    expect(a).toEqual([{ speaker: ta, text: 'xin chào', at: 3 }]);
    expect(b).toHaveLength(1);
    off();
    ch.send(ta, 'nữa', 9);
    expect(a).toHaveLength(2);
    expect(b).toHaveLength(1);
  });
});

describe('Bong bóng', () => {
  const msg = (speaker: Speaker, text: string, at: number): ChatMessage => ({ speaker, text, at });

  it('R-CHAT-2: sống 6 giây; tin mới của cùng người thay ngay và đếm lại', () => {
    const t = new BubbleTimer();
    t.push(msg(ta, 'a', 0));
    expect(t.active(5.9).map((b) => b.text)).toEqual(['a']);
    t.push(msg(ta, 'b', 2));
    expect(t.active(2).map((b) => b.text)).toEqual(['b']);
    expect(t.active(7.9).map((b) => b.text)).toEqual(['b']);
    expect(t.active(8)).toEqual([]);
  });

  it('R-CHAT-2: mỗi người một bong bóng, nhiều người cùng lúc', () => {
    const t = new BubbleTimer();
    t.push(msg(ta, 'a', 0));
    t.push(msg(tm, 'chào', 1));
    expect(t.active(3).map((b) => b.speakerId).sort()).toEqual(['player', 'tieu-mac']);
    expect(t.active(6.5).map((b) => b.speakerId)).toEqual(['tieu-mac']);
  });

  it('R-CHAT-2: phóng 90 → 100 % lúc hiện, mờ dần trong giây cuối', () => {
    const t = new BubbleTimer();
    t.push(msg(ta, 'a', 0));
    const [b] = t.active(0);
    expect(bubbleLook(b, 0)).toEqual({ opacity: 1, scale: 0.9 });
    expect(bubbleLook(b, 3)).toEqual({ opacity: 1, scale: 1 });
    expect(bubbleLook(b, 5.5).opacity).toBeCloseTo(0.5);
  });

  it('R-CHAT-2: xa camera trên 25 m hoặc ở sau camera → không vẽ', () => {
    expect(bubbleVisible(25, true)).toBe(true);
    expect(bubbleVisible(25.1, true)).toBe(false);
    expect(bubbleVisible(3, false)).toBe(false);
  });
});

describe('Kênh chung', () => {
  it('R-CHAT-3: giữ 50 tin gần nhất theo thứ tự gửi', () => {
    const ch = new LocalChannel();
    for (let i = 1; i <= 51; i++) ch.send(ta, String(i), i * 2);
    const h = ch.history();
    expect(h).toHaveLength(50);
    expect(h[0].text).toBe('2');
    expect(h[49].text).toBe('51');
  });

  it('R-CHAT-3: khung thu gọn mờ hết sau 10 giây im lặng, tin mới hiện lại', () => {
    expect(collapsedVisible(undefined, 0)).toBe(false);
    expect(collapsedVisible(20, 29.9)).toBe(true);
    expect(collapsedVisible(20, 30)).toBe(false);
    expect(collapsedVisible(41, 41)).toBe(true);
  });

  it('R-CHAT-3: NPC nói cách nhau 40–90 giây, không lặp câu vừa nói', () => {
    const ch = new LocalChannel();
    const got: ChatMessage[] = [];
    ch.subscribe((m) => got.push(m));
    const chatter = new NpcChatter(ch, [tm], seeded(7), 0);
    for (let t = 0; t <= 3600; t += 0.1) chatter.update(t);
    expect(got.length).toBeGreaterThanOrEqual(Math.floor(3600 / CHATTER_MAX_S) - 1);
    expect(got.length).toBeLessThanOrEqual(Math.ceil(3600 / CHATTER_MIN_S));
    for (let i = 1; i < got.length; i++) {
      const gap = got[i].at - got[i - 1].at;
      expect(gap).toBeGreaterThanOrEqual(CHATTER_MIN_S - 0.11);
      expect(gap).toBeLessThanOrEqual(CHATTER_MAX_S + 0.11);
      expect(got[i].text).not.toBe(got[i - 1].text);
    }
    expect(got.every((m) => m.speaker.id === 'tieu-mac')).toBe(true);
  });

  it('R-CHAT-3: NPC không có câu có sẵn thì im lặng', () => {
    const ch = new LocalChannel();
    const chatter = new NpcChatter(ch, [{ id: 'la', name: 'Lạ', kind: 'npc' }], seeded(1), 0);
    for (let t = 0; t <= 600; t += 1) chatter.update(t);
    expect(ch.history()).toHaveLength(0);
  });
});
