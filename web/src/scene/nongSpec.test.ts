import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkFarm, DEFAULT_FARM, farmKeepOut } from './nongSpec';
import { resolveSceneSpec } from './specCheck';

const nhaTa = resolveSceneSpec(JSON.parse(readFileSync(new URL('../../../design/scene/nha-ta.json', import.meta.url), 'utf8')));

describe('nông trại đặt sẵn (R-NONG-1)', () => {
  it('R-NONG-1: Nhà của ta bật nông trại đúng chỗ đã chốt, đặc tả không lỗi', () => {
    const f = nhaTa.spec.farm;
    expect(nhaTa.problems).toEqual([]);
    expect(f.enabled).toBe(true);
    expect([f.coop.x, f.coop.z, f.pond.x, f.pond.z, f.cowPen.x, f.cowPen.z]).toEqual([-13, -10, 18, 0, 12, 8]);
    expect([f.trellis.z0, f.trellis.z1, f.trellis.half]).toEqual([8, 11, 1.8]);
    expect(f.trellis.height).toBeGreaterThanOrEqual(2.6);
  });

  it('R-NHA-7: vùng cấm đặt đồ của Nhà của ta phủ cả 4 công trình (nhãn đúng lý do)', () => {
    const keep = nhaTa.spec.decorArea!.keepOut;
    for (const k of farmKeepOut(nhaTa.spec.farm)) {
      const hit = keep.find((x) => x.label === k.label);
      expect(hit, k.label).toBeDefined();
      expect(hit!.from[0]).toBeLessThanOrEqual(k.from[0] + 1e-9);
      expect(hit!.from[1]).toBeLessThanOrEqual(k.from[1] + 1e-9);
      expect(hit!.to[0]).toBeGreaterThanOrEqual(k.to[0] - 1e-9);
      expect(hit!.to[1]).toBeGreaterThanOrEqual(k.to[1] - 1e-9);
    }
  });

  it('R-NONG-1: cảnh khác tắt nông trại; giàn thấp / cột trên lối → báo lỗi', () => {
    expect(resolveSceneSpec({}).spec.farm.enabled).toBe(false);
    const on = { ...DEFAULT_FARM, enabled: true };
    expect(checkFarm(on)).toEqual([]);
    expect(checkFarm({ ...on, trellis: { ...on.trellis, height: 2.2 } }).join()).toContain('2,6');
    expect(checkFarm({ ...on, trellis: { ...on.trellis, half: 1.2 } }).join()).toContain('ngoài lối');
  });
});
