import { describe, expect, it } from 'vitest';
import { coWebp, kiemHinh, nganSach, tenDart, tenFile, TONG_TOI_DA } from './hinh-kiem.mjs';

/** WebP VP8X giả cỡ w × h, dài `len` byte. */
function webp(w, h, len = 4000) {
  const b = Buffer.alloc(Math.max(len, 30));
  b.write('RIFF', 0, 'ascii');
  b.write('WEBP', 8, 'ascii');
  b.write('VP8X', 12, 'ascii');
  b.writeUIntLE(w - 1, 24, 3);
  b.writeUIntLE(h - 1, 27, 3);
  return b;
}

const bang = (...hinh) => ({ hinh });

describe('hinh-kiem — ngân sách hình minh hoạ (V-72)', () => {
  it('đọc cỡ WebP VP8X; không phải WebP → null', () => {
    expect(coWebp(webp(160, 160))).toEqual({ w: 160, h: 160 });
    expect(coWebp(Buffer.from('not a webp image at all, nope!!'))).toBeNull();
  });

  it('tên file: cỡ đầu không hậu tố, cỡ khác @cỡ', () => {
    expect(tenFile('ban-do', 160, 160)).toBe('ban-do.webp');
    expect(tenFile('ban-do', 256, 160)).toBe('ban-do@256.webp');
    expect(tenDart('nhay-nut')).toBe('nhayNut');
  });

  it('trần: 16 KB cho 160, 32 KB cho 256', () => {
    expect(nganSach(160)).toBe(16 * 1024);
    expect(nganSach(256)).toBe(32 * 1024);
    expect(nganSach(512)).toBe(32 * 1024);
  });

  it('bảng đúng → không lỗi, chép đủ', () => {
    const r = kiemHinh(bang({ ma: 'ban-do', dot: 1, co: [160, 256] }), new Map([['ban-do.webp', webp(160, 160)], ['ban-do@256.webp', webp(256, 256)]]));
    expect(r.loi).toEqual([]);
    expect(r.chep.map((c) => c.ten)).toEqual(['ban-do.webp', 'ban-do@256.webp']);
  });

  it('thiếu file, sai cỡ, quá trần, mã sai, trùng mã → lỗi', () => {
    const r = kiemHinh(
      bang(
        { ma: 'thieu', dot: 1, co: [160] },
        { ma: 'sai-co', dot: 1, co: [160] },
        { ma: 'nang', dot: 1, co: [160] },
        { ma: 'Bản Đồ', dot: 1, co: [160] },
        { ma: 'nang', dot: 1, co: [160] },
      ),
      new Map([['sai-co.webp', webp(128, 128)], ['nang.webp', webp(160, 160, 17 * 1024)]]),
    );
    expect(r.loi.some((l) => l.includes('thieu') && l.includes('thiếu file'))).toBe(true);
    expect(r.loi.some((l) => l.includes('128×128'))).toBe(true);
    expect(r.loi.some((l) => l.startsWith('nang.webp') && l.includes('> 16 KB'))).toBe(true);
    expect(r.loi.some((l) => l.includes('mã không hợp lệ'))).toBe(true);
    expect(r.loi.some((l) => l.includes('trùng mã'))).toBe(true);
  });

  it('tổng vượt 1,5 MB → lỗi; file lạ trong xuat/ → chỉ cảnh báo', () => {
    const n = Math.ceil(TONG_TOI_DA / (15 * 1024)) + 1;
    const hinh = Array.from({ length: n }, (_, i) => ({ ma: `h${i}`, dot: 3, co: [160] }));
    const files = new Map(hinh.map((m) => [`${m.ma}.webp`, webp(160, 160, 15 * 1024)]));
    files.set('la.webp', webp(160, 160));
    const r = kiemHinh(bang(...hinh), files);
    expect(r.loi.some((l) => l.startsWith('tổng'))).toBe(true);
    expect(r.canh).toEqual(['xuat/la.webp không có trong hinh.json — bỏ qua']);
  });
});
