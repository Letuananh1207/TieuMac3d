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

/** Nấm Mẹ giả (V-109): thang xoắn quanh tâm (0; 0) vành 2…4, chân ở phía +z (a0 0) cao 0, 1 m / rad, 1,5 vòng; mũ tròn r 8 cao 3π khoét giếng r 4. */
const span = Math.PI * 3;
const spiral = new LayeredGround(null, [
  { minX: -4, maxX: 4, minZ: -4, maxZ: 4, y: 0, upper: true, helix: { r0: 2, r1: 4, a0: 0, rise: 1, span } },
  { minX: -8, maxX: 8, minZ: -8, maxZ: 8, y: span, round: true, hole: 4, upper: true },
]);

describe('LayeredGround thang xoắn + mặt tròn khoét lỗ (V-109)', () => {
  it('R-VA-3: thang xoắn — cao theo góc từ chân thang; vòng trên chỉ với tới khi chân ở gần vòng đó', () => {
    expect(spiral.heightAt(0, 3, 0)).toBeCloseTo(0, 5); // chân thang (+z)
    expect(spiral.heightAt(3, 0, 1)).toBeCloseTo(Math.PI / 2, 5); // ¼ vòng (+x)
    // cùng chỗ (+z), vòng 2 cao 2π: đứng dưới đất → chân thang; đang ở vòng 2 → vòng 2
    expect(spiral.heightAt(0, 3, 0.2)).toBeCloseTo(0, 5);
    expect(spiral.heightAt(0, 3, Math.PI * 2 - 0.3)).toBeCloseTo(Math.PI * 2, 5);
    expect(spiral.heightAt(0, 3)).toBe(0); // không biết chân ở đâu → mặt đất
    expect(spiral.slopeAt(3, 0, 1)).toBeCloseTo((Math.atan(1 / 3) * 180) / Math.PI, 3);
  });

  it('R-VA-3: ngoài vành thang (trong thân / ngoài mép) → không phải thang', () => {
    expect(spiral.heightAt(0, 1, 0.3)).toBe(0);
    expect(spiral.heightAt(0, 5, 0.3)).toBe(0);
  });

  it('R-VA-3: mặt mũ khoét giếng — trên vành mũ cao 3π; trong giếng là thang bên dưới', () => {
    expect(spiral.heightAt(6, 0, span)).toBeCloseTo(span, 5);
    expect(spiral.heightAt(9, 0, span)).toBe(0); // ngoài mũ
    // trong giếng ở góc cuối thang (−z, 1,5 vòng): bậc cuối cao 3π
    expect(spiral.heightAt(0, -3, span)).toBeCloseTo(span, 5);
  });
});
