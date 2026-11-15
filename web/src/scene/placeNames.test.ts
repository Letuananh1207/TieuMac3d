import { describe, expect, it } from 'vitest';
import { checkPlaceNames, checkPortalLabels, HOME_INSIDE, isHomeScene, mapPlaceId } from './placeNames';

const places = [
  { id: 'van-uyen', ten: 'Khởi Nguyên Trấn' },
  { id: 'rung-truc', ten: 'Trúc Lâm' },
];

describe('tên nơi: đặc tả cảnh khớp bản đồ (R-HANH-1, V-50)', () => {
  it('R-HANH-1: site.name trùng ten cùng mã → không lỗi; tông môn đọc là van-uyen; cảnh không có trên bản đồ bỏ qua', () => {
    const scenes = new Map([
      ['tong-mon', 'Khởi Nguyên Trấn'],
      ['rung-truc', 'Trúc Lâm'],
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

describe('nhãn vòng sáng cổng đi bộ = tên nơi đến (R-HANH-4, V-59)', () => {
  const map = [...places, { id: 'nha-ta', ten: 'Nhà của ta' }];
  it('R-HANH-4: nhãn trùng ten của nơi đến (trấn đọc là van-uyen); cổng về Nhà của ta ghi "Về nhà"; cổng không nhãn bỏ qua', () => {
    const portals = new Map([
      ['tong-mon', [{ scene: 'rung-truc', label: 'Trúc Lâm' }, { scene: 'nha-ta', label: 'Về nhà' }]],
      ['rung-truc', [{ scene: 'tong-mon', label: 'Khởi Nguyên Trấn' }, { scene: 'thu-nghiem' }]],
    ]);
    expect(checkPortalLabels(portals, map)).toEqual([]);
  });

  it('R-HANH-4: nhãn lệch tên bản đồ → báo lỗi', () => {
    const errs = checkPortalLabels(new Map([['tong-mon', [{ scene: 'rung-truc', label: 'Rừng trúc' }]]]), map);
    expect(errs).toHaveLength(1);
    expect(errs[0]).toContain('Trúc Lâm');
  });
});

describe('Nhà của ta: sân + gian trong là một nơi (V-68)', () => {
  it('R-HANH-7: sân (nha-ta) và gian trong (nha-ta-trong) đều là "đang ở Nhà của ta"; nơi khác không', () => {
    expect([isHomeScene('nha-ta'), isHomeScene(HOME_INSIDE), isHomeScene('tong-mon'), isHomeScene(null)]).toEqual([true, true, false, false]);
  });

  it('R-HANH-4: cửa nhà chính ↔ gian trong ghi nhãn cửa ("Vào nhà" / "Ra sân") — không bắt bằng tên nơi', () => {
    const portals = new Map([
      ['nha-ta', [{ scene: HOME_INSIDE, label: 'Vào nhà' }]],
      [HOME_INSIDE, [{ scene: 'nha-ta', label: 'Ra sân' }]],
    ]);
    expect(checkPortalLabels(portals, [{ id: 'nha-ta', ten: 'Nhà của ta' }])).toEqual([]);
  });
});
