import { describe, expect, test } from 'vitest';
import { bienThanh, datThanh, khopSoChu, tachAmTiet, thanhCua } from './thanh';

describe('R-TU-4: pinyin → âm tiết + thanh', () => {
  test('tách âm tiết, thanh nhẹ = 0', () => {
    expect(thanhCua('māma')).toEqual([1, 0]);
    expect(thanhCua('bú kèqi')).toEqual([2, 4, 0]);
    expect(thanhCua('Zhōngguó')).toEqual([1, 2]);
    expect(thanhCua('piàoliang')).toEqual([4, 0]);
    expect(thanhCua('gōnggòng qìchē')).toEqual([1, 4, 4, 1]);
    expect(thanhCua("nǚ'ér")).toEqual([3, 2]);
    expect(thanhCua('érzi')).toEqual([2, 0]);
  });

  test('儿 hoá "-r" gắn vào âm trước; số chữ khớp', () => {
    const am = tachAmTiet('yìdiǎnr')!;
    expect(am.map((a) => a.thanh)).toEqual([4, 3]);
    expect(am[1].erhua).toBe(true);
    expect(khopSoChu('一点儿', 'yìdiǎnr')).toBe(true);
    expect(khopSoChu('哪儿', 'nǎr')).toBe(true);
  });

  test('số âm tiết khác số chữ → không khớp; "…" bỏ qua', () => {
    expect(khopSoChu('朋友', 'péng')).toBe(false);
    expect(khopSoChu('朋友', 'péngyou')).toBe(true);
    expect(khopSoChu('虽然…但是', 'suīrán…dànshì')).toBe(true);
  });

  test('pinyin sai không tách được', () => {
    expect(tachAmTiet('xyz')).toBeNull();
  });
});

describe('R-TU-2: nhiễu cùng âm khác thanh', () => {
  test('đặt dấu đúng chỗ', () => {
    expect(datThanh('ma', 3)).toBe('mǎ');
    expect(datThanh('hǎo', 4)).toBe('hào');
    expect(datThanh('gou', 2)).toBe('góu');
    expect(datThanh('xie', 1)).toBe('xiē');
    expect(datThanh('gui', 4)).toBe('guì');
    expect(datThanh('Bei', 1)).toBe('Bēi');
  });

  test('mā → má / mǎ / mà; âm đầu trước', () => {
    expect(bienThanh('mā')).toEqual(['má', 'mǎ', 'mà']);
    expect(bienThanh('xièxie').slice(0, 3)).toEqual(['xiēxie', 'xiéxie', 'xiěxie']);
    expect(bienThanh('ba')).toEqual(['bā', 'bá', 'bǎ', 'bà']);
    expect(bienThanh('yìdiǎnr')[0]).toBe('yīdiǎnr');
  });
});
