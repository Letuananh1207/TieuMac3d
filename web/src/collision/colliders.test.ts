import { describe, expect, it } from 'vitest';
import { Colliders } from './colliders';

describe('Colliders theo độ cao', () => {
  it('R-VA-3: hộp không khoảng cao chặn mọi độ cao như cũ', () => {
    const c = new Colliders();
    c.add(0, 0, 2, 2);
    for (const y of [undefined, 0, 5]) {
      const p = { x: 1.2, z: 0 };
      c.resolve(p, 0.5, y);
      expect(p.x).toBeCloseTo(1.5, 5);
    }
  });

  it('R-VA-3: lan can tầng 2 (minY) không chặn chân ở tầng 1, chặn chân ở tầng 2', () => {
    const c = new Colliders();
    c.add(0, 0, 2, 2, 0, { minY: 4.6 });
    const low = { x: 1.2, z: 0 };
    c.resolve(low, 0.5, 1);
    expect(low.x).toBe(1.2);
    const high = { x: 1.2, z: 0 };
    c.resolve(high, 0.5, 5);
    expect(high.x).toBeCloseTo(1.5, 5);
  });

  it('R-VA-3: kệ tầng 1 (maxY) không chặn chân ở tầng 2', () => {
    const c = new Colliders();
    c.add(0, 0, 2, 2, 0, { maxY: 2.5 });
    const high = { x: 1.2, z: 0 };
    c.resolve(high, 0.5, 5);
    expect(high.x).toBe(1.2);
    const low = { x: 1.2, z: 0 };
    c.resolve(low, 0.5, 1);
    expect(low.x).toBeCloseTo(1.5, 5);
  });

  it('R-NHA-2: gỡ vật to khỏi ô → hết chặn (hộp và tròn)', () => {
    const c = new Colliders();
    const b = c.add(0, 0, 2, 2);
    const r = c.addCircle(5, 0, 1);
    c.remove(b);
    c.remove(r);
    c.remove(b); // gỡ lần hai không lỗi
    const p = { x: 0.5, z: 0 };
    c.resolve(p, 0.5);
    expect(p).toEqual({ x: 0.5, z: 0 });
    const q = { x: 5.5, z: 0 };
    c.resolve(q, 0.5);
    expect(q).toEqual({ x: 5.5, z: 0 });
  });
});
