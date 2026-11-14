import { describe, expect, it } from 'vitest';
import { applyVariant, matches } from './bienThe';

describe('biến thể bố cục (V-42)', () => {
  const base = {
    walls: { enabled: true, half: 17, gates: [{ side: 'nam' }] },
    paths: [
      { from: [0, 17], to: [0, 47], width: 8 },
      { from: [17, 8], to: [38.5, 8], width: 3 },
    ],
    terrain: { stairs: [{ from: [0, -20], to: [0, -53], width: 6.4 }] },
  };

  it('object ghép đệ quy, khoá thiếu giữ nguyên', () => {
    const out = applyVariant(base, { walls: { enabled: false } }) as typeof base;
    expect(out.walls).toEqual({ enabled: false, half: 17, gates: [{ side: 'nam' }] });
    expect(out.terrain).toBe(base.terrain);
  });

  it('bo / them trên mảng: bỏ phần tử khớp mẫu, thêm vào cuối, phần còn lại giữ', () => {
    const out = applyVariant(base, { paths: { bo: [{ from: [17, 8] }], them: [{ from: [17, 4], to: [38.5, 4], width: 5 }] } }) as typeof base;
    expect(out.paths).toEqual([base.paths[0], { from: [17, 4], to: [38.5, 4], width: 5 }]);
    expect(base.paths).toHaveLength(2); // không sửa bản gốc
  });

  it('mẫu bo không khớp → báo', () => {
    const problems: string[] = [];
    applyVariant(base, { paths: { bo: [{ width: 99 }] } }, problems);
    expect(problems[0]).toMatch(/paths\.bo/);
  });

  it('mảng thường thay hẳn; khoá ghi chú `_` bỏ qua', () => {
    const out = applyVariant(base, { _ghi: 'x', walls: { gates: [], _vi: 'y' } }) as Record<string, unknown>;
    expect(out._ghi).toBeUndefined();
    expect(out.walls).toEqual({ enabled: true, half: 17, gates: [] });
  });

  it('khớp mẫu so sâu, chỉ các trường của mẫu', () => {
    expect(matches({ kind: 'den-da', x: 20, z: 5.4 }, { kind: 'den-da', x: 20 })).toBe(true);
    expect(matches({ from: [17, 3], to: [42, 3] }, { from: [17, 3] })).toBe(true);
    expect(matches({ from: [17, 3] }, { from: [17, 4] })).toBe(false);
    expect(matches({ from: [17, 3] }, { _vi: 'ghi chú', from: [17, 3] })).toBe(true);
  });

  it('phần tử thêm bỏ ghi chú', () => {
    const out = applyVariant(base, { paths: { them: [{ _vi: 'x', from: [1, 1], to: [2, 1], width: 1 }] } }) as typeof base;
    expect(out.paths[2]).toEqual({ from: [1, 1], to: [2, 1], width: 1 });
  });
});
