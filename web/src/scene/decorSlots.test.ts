import { describe, expect, it } from 'vitest';
import { DEFAULT_SCENE } from './spec';
import { resolveSceneSpec } from './specCheck';

// nhà chính 10 × 6 tâm (0; −10), cửa nhìn về +z; vòng trận tắt để chỉ kiểm ô
const base = {
  buildings: [{ id: 'nha-chinh', x: 0, z: -10, w: 10, d: 6, title: 'Nhà của ta', roofColor: '#555555' }],
  teleport: { enabled: false },
  player: { start: [0, 8] },
};
const slotProblems = (decorSlots: unknown[]): string[] =>
  resolveSceneSpec({ ...base, decorSlots }).problems.filter((p) => p.includes('decorSlots'));

describe('ô trang trí trong đặc tả cảnh (R-NHA-2)', () => {
  it('R-NHA-2: cảnh mặc định không có ô nào — cảnh cũ không đổi', () => {
    expect(DEFAULT_SCENE.decorSlots).toEqual([]);
    expect(resolveSceneSpec({}).spec.decorSlots).toEqual([]);
  });

  it('R-NHA-2: ô đúng (vườn, sân ngoài nhà; trong nhà cách tường) → nhận đủ, không lỗi', () => {
    const slots = [
      { id: 'vuon-1', kind: 'vuon', x: 8, z: 0 },
      { id: 'san-1', kind: 'san', x: 0, z: 0, rotY: 180 },
      { id: 'trong-1', kind: 'trong', x: -2, z: -10 },
    ];
    expect(slotProblems(slots)).toEqual([]);
    expect(resolveSceneSpec({ ...base, decorSlots: slots }).spec.decorSlots).toHaveLength(3);
  });

  it('R-NHA-2: loại ô lạ hoặc rotY lẻ → bỏ ô đó', () => {
    const { spec } = resolveSceneSpec({ ...base, decorSlots: [{ id: 'a', kind: 'mai', x: 8, z: 0 }, { id: 'b', kind: 'san', x: 0, z: 0, rotY: 45 }] });
    expect(spec.decorSlots).toEqual([]);
  });

  it('R-NHA-3: trùng mã ô → báo (mã là khoá lưu nhà)', () => {
    expect(slotProblems([{ id: 'x', kind: 'vuon', x: 8, z: 0 }, { id: 'x', kind: 'vuon', x: 12, z: 0 }]).some((p) => p.includes('trùng'))).toBe(true);
  });

  it('R-NHA-2: hai ô sát nhau dưới 1,8 m → báo', () => {
    expect(slotProblems([{ id: 'a', kind: 'vuon', x: 8, z: 0 }, { id: 'b', kind: 'vuon', x: 9, z: 0 }]).some((p) => p.includes('tối thiểu'))).toBe(true);
  });

  it('R-NHA-2: ô "trong" ngoài nhà / sát tường, ô "vuon" trong nhà → báo', () => {
    expect(slotProblems([{ id: 'a', kind: 'trong', x: 8, z: 0 }])).toHaveLength(1);
    expect(slotProblems([{ id: 'a', kind: 'trong', x: 4.6, z: -10 }])).toHaveLength(1); // cách tường 0,4 m
    expect(slotProblems([{ id: 'a', kind: 'vuon', x: 0, z: -10 }]).some((p) => p.includes('nha-chinh'))).toBe(true);
  });

  it('R-NHA-1: ô đè vòng trận hoặc điểm xuất phát → báo', () => {
    const tp = resolveSceneSpec({ ...base, teleport: { enabled: true, center: [10, 10] }, decorSlots: [{ id: 'a', kind: 'san', x: 10, z: 11 }] });
    expect(tp.problems.some((p) => p.includes('vòng trận') && p.includes('decorSlots'))).toBe(true);
    expect(slotProblems([{ id: 'a', kind: 'san', x: 0, z: 8.5 }]).some((p) => p.includes('xuất phát'))).toBe(true);
  });
});
