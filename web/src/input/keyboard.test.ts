import { describe, expect, it } from 'vitest';
import { actionForKey } from './keyboard';

/** Phím đã có việc khác (đi, nhảy, chào, ngồi, tương tác, chat, Esc, xoay khi trang trí, đàn cầm, số). */
const RESERVED = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'f', 'c', 'e', 'enter', 'escape', 'q', 'r', 't', 'delete', 'shift'];

describe('Keyboard — phím máy tính', () => {
  it('R-THANH-1: M H G B J là 5 nút thanh công cụ; T / I cũ không còn', () => {
    expect(['m', 'h', 'g', 'b', 'j'].map(actionForKey)).toEqual(['tool', 'tool', 'tool', 'tool', 'tool']);
    expect(actionForKey('t')).toBeNull();
    expect(actionForKey('i')).toBeNull();
  });

  it('R-BANDO-5: N mở / đóng bản đồ lớn', () => {
    expect(actionForKey('n')).toBe('map');
  });

  it('R-THANH-1: phím thanh không trùng phím đang dùng', () => {
    for (const k of ['m', 'h', 'g', 'b', 'j', 'n']) expect(RESERVED, k).not.toContain(k);
    expect([' ', 'f', 'c', 'e', 'enter', 'escape'].map(actionForKey)).toEqual(['jump', 'bow', 'sit', 'seat', 'chat', 'back']);
  });
});
