import { describe, expect, it } from 'vitest';
import { checkPlaceNames, mapPlaceId } from './placeNames';

const places = [
  { id: 'van-uyen', ten: 'Khởi Nguyên Trấn' },
  { id: 'rung-truc', ten: 'Rừng Trúc Rì Rào' },
];

describe('tên nơi: đặc tả cảnh khớp bản đồ (R-HANH-1, V-50)', () => {
  it('R-HANH-1: site.name trùng ten cùng mã → không lỗi; tông môn đọc là van-uyen; cảnh không có trên bản đồ bỏ qua', () => {
    const scenes = new Map([
      ['tong-mon', 'Khởi Nguyên Trấn'],
      ['rung-truc', 'Rừng Trúc Rì Rào'],
      ['thu-nghiem', 'Tên gì cũng được'],
    ]);
    expect(checkPlaceNames(scenes, places)).toEqual([]);
    expect(mapPlaceId('tong-mon')).toBe('van-uyen');
  });

  it('R-HANH-1: đặc tả lệch tên bản đồ → báo lỗi', () => {
    const errs = checkPlaceNames(new Map([['rung-truc', 'Rừng trúc']]), places);
    expect(errs).toHaveLength(1);
    expect(errs[0]).toContain('rung-truc');
  });

  it('R-HUD-4: tên nơi quá dài hoặc có chữ Hán → báo lỗi', () => {
    expect(checkPlaceNames(new Map(), [{ id: 'a', ten: 'Một Cái Tên Dài Quá Mức Cho Phép' }])).toHaveLength(1);
    expect(checkPlaceNames(new Map(), [{ id: 'b', ten: 'Rừng 竹' }])).toHaveLength(1);
  });
});
