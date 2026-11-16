import { describe, expect, it } from 'vitest';
import { resolveSceneSpec } from './specCheck';

// V-88 NV1: `buildings[].model` — chỉ nhà kín `nha-o`; thiếu trường = như cũ
describe('đặc tả buildings[].model (V-88)', () => {
  const nha = { id: 'chinh-phong', x: -15, z: -8, w: 10.5, d: 6, title: 'Nhà của ta', roofColor: '#3b3f44', kind: 'nha-o', closed: true };

  it('nhà kín nha-o nhận model', () => {
    const { spec, problems } = resolveSceneSpec({ buildings: [{ ...nha, model: 'nha-ta' }] });
    expect(problems).toEqual([]);
    expect(spec.buildings[0].model).toBe('nha-ta');
  });

  it('thiếu model → không có trường (bản khối như cũ)', () => {
    const { spec, problems } = resolveSceneSpec({ buildings: [nha] });
    expect(problems).toEqual([]);
    expect(spec.buildings[0].model).toBeUndefined();
  });

  it('nhà không kín / kiểu khác / mã sai → lỗi, bỏ nhà', () => {
    for (const b of [{ ...nha, closed: false, model: 'nha-ta' }, { ...nha, kind: 'tra-lau', model: 'nha-ta' }, { ...nha, model: 'Nhà Ta' }]) {
      const { spec, problems } = resolveSceneSpec({ buildings: [b] });
      expect(problems.some((p) => p.includes('buildings[0].model'))).toBe(true);
      expect(spec.buildings).toEqual([]);
    }
  });
});
