import { describe, expect, it } from 'vitest';
import { resolveSceneSpec } from './specCheck';

const on = { enabled: true, center: [0, 7], radius: 0, ringRadius: 4 };
const start = { player: { start: [0, 0] } };

// chữ giữa vòng trận (R-HUD-4, người dùng 2026-11-14): mặc định không chữ — hoa văn; có thì tên Việt ngắn, không chữ Hán
describe('teleport.text', () => {
  it('R-HUD-4: thiếu → rỗng (vòng khắc hoa văn), không lỗi', () => {
    const { spec, problems } = resolveSceneSpec({ ...start, teleport: on });
    expect(spec.teleport.text).toBe('');
    expect(problems.filter((p) => p.includes('teleport.text'))).toEqual([]);
  });

  it('R-HUD-4: tên Việt ngắn được', () => {
    const { spec, problems } = resolveSceneSpec({ ...start, teleport: { ...on, text: 'Nhà của ta' } });
    expect(spec.teleport.text).toBe('Nhà của ta');
    expect(problems.filter((p) => p.includes('teleport.text'))).toEqual([]);
  });

  it('R-HUD-4: chữ Hán hoặc quá 14 ký tự → báo lỗi', () => {
    for (const text of ['起源', '我家', 'Khởi Nguyên Trấn cũ']) {
      const { problems } = resolveSceneSpec({ ...start, teleport: { ...on, text } });
      expect(problems.some((p) => p.includes('teleport.text')), text).toBe(true);
    }
  });
});
