import { describe, expect, it } from 'vitest';
import { laBanMay } from './cheDoNhap';

describe('laBanMay (R-DIEU-1, R-THANH-1)', () => {
  it('máy tính có chuột, chưa chạm → bản máy tính (ẩn joystick gợi ý, thanh sang trái)', () => {
    expect(laBanMay(true, false)).toBe(true);
  });
  it('máy tính màn cảm ứng: chạm lần đầu → về giao diện cảm ứng', () => {
    expect(laBanMay(true, true)).toBe(false);
  });
  it('điện thoại / máy tính bảng (không chuột) → giữ giao diện cảm ứng', () => {
    expect(laBanMay(false, false)).toBe(false);
    expect(laBanMay(false, true)).toBe(false);
  });
});
