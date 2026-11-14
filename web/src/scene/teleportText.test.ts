import { describe, expect, it } from 'vitest';
import { resolveSceneSpec } from './specCheck';

const on = { enabled: true, center: [0, 7], radius: 0, ringRadius: 4 };
const start = { player: { start: [0, 0] } };

// chữ khắc giữa vòng trận theo cảnh (design 2026-11-14.16): mặc định 起源, Nhà của ta 我家
describe('teleport.text', () => {
  it('thiếu → 起源 (cảnh cũ không đổi)', () => {
    const { spec, problems } = resolveSceneSpec({ ...start, teleport: on });
    expect(spec.teleport.text).toBe('起源');
    expect(problems.filter((p) => p.includes('teleport.text'))).toEqual([]);
  });

  it('Nhà của ta khắc 我家', () => {
    const { spec, problems } = resolveSceneSpec({ ...start, teleport: { ...on, text: '我家' } });
    expect(spec.teleport.text).toBe('我家');
    expect(problems.filter((p) => p.includes('teleport.text'))).toEqual([]);
  });

  it('rỗng, quá 3 chữ hoặc không phải chữ Hán → báo lỗi', () => {
    for (const text of ['', '起源鎮城', 'Nha']) {
      const { problems } = resolveSceneSpec({ ...start, teleport: { ...on, text } });
      expect(problems.some((p) => p.includes('teleport.text'))).toBe(true);
    }
  });
});
