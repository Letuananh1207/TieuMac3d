import { describe, expect, it } from 'vitest';
import { LayeredGround, STEP_UP, type Pad } from './ground';

/** Nhà giả: nền 1 m (0…10 × 0…10), sàn tầng 2 cao 5 m phủ nửa tây, dốc thang từ 1 m (z 10) lên 5 m (z 0) ở x 6…8. */
const pads: Pad[] = [
  { minX: 0, maxX: 10, minZ: 0, maxZ: 10, y: 1 },
  { minX: 0, maxX: 5, minZ: 0, maxZ: 10, y: 5, upper: true },
  { minX: 6, maxX: 8, minZ: 0, maxZ: 10, y: 1, ramp: { axis: 'z', at0: 10, at1: 0, y1: 5 }, upper: true },
];
const g = new LayeredGround(null, pads);

describe('LayeredGround nhiều tầng', () => {
  it('R-VA-3: không biết chân ở đâu → tầng thấp như cũ (bỏ qua tấm tầng trên)', () => {
    expect(g.heightAt(2, 5)).toBe(1);
    expect(g.heightAt(7, 2)).toBe(1);
    expect(g.heightAt(20, 20)).toBe(0);
  });

  it('R-VA-3: đứng tầng 1 dưới sàn tầng 2 → vẫn cao tầng 1', () => {
    expect(g.heightAt(2, 5, 1)).toBe(1);
  });

  it('R-VA-3: chân ở tầng 2 → cao tầng 2', () => {
    expect(g.heightAt(2, 5, 5)).toBe(5);
  });

  it('R-VA-3: chân thang với tới từ tầng 1, giữa thang chỉ với tới khi đang trên thang', () => {
    expect(g.heightAt(7, 9.9, 1)).toBeCloseTo(1.04, 2);
    expect(g.heightAt(7, 5, 1)).toBe(1); // gầm thang
    expect(g.heightAt(7, 5, 2.9)).toBeCloseTo(3, 5);
    expect(g.slopeAt(7, 5, 2.9)).toBeGreaterThan(20);
    expect(g.slopeAt(7, 5, 1)).toBe(0);
  });

  it('R-VA-3: bước lên tối đa STEP_UP', () => {
    expect(g.heightAt(2, 5, 5 - STEP_UP)).toBe(5);
    expect(g.heightAt(2, 5, 5 - STEP_UP - 0.01)).toBe(1);
  });
});
