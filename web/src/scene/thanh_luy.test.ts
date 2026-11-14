import { describe, expect, it } from 'vitest';
import { Colliders } from '../collision/colliders';
import { LayeredGround } from '../collision/ground';
import type { RampartSpec } from './spec';
import { rampartLayout } from './thanh_luy';

// R-VA-1: Trường Thành — một đoạn mặt tường đi được, lên bằng mã đạo; thân tường chặn người dưới đất, lan can chặn người trên
const wall: RampartSpec = {
  from: [-30, -10],
  to: [-7, -10],
  height: 6,
  width: 5,
  outSide: -1, // đoạ khẩu phía bắc (−z), mặt trong phía nam
  ramps: [{ at: -12, dir: -1, length: 12, width: 3 }],
};

function setup(): { ground: LayeredGround; col: Colliders } {
  const { pads, boxes } = rampartLayout(wall, 0);
  const col = new Colliders();
  for (const b of boxes) col.add(b.x, b.z, b.w, b.d, 0, b.range);
  return { ground: new LayeredGround(null, pads), col };
}

describe('mặt tường đi được (R-VA-1)', () => {
  it('mặt tường cao 6 m; mã đạo dốc từ đất lên tới khe', () => {
    const { ground } = setup();
    expect(ground.heightAt(-20, -10)).toBeCloseTo(6);
    // mã đạo nằm phía nam tường (z −7,5 … −4,5), đầu trên ở x −12, đầu dưới ở x −24
    expect(ground.heightAt(-12, -6)).toBeCloseTo(6);
    expect(ground.heightAt(-24, -6)).toBeCloseTo(0);
    expect(ground.heightAt(-18.75, -6)).toBeCloseTo(3);
    expect(ground.slopeAt(-18, -6)).toBeLessThan(35);
  });

  it('thân tường chặn người dưới đất, không chặn người trên mặt tường', () => {
    const { col } = setup();
    const atGround = col.boxes.filter((b) => b.minY === undefined || 0 >= b.minY).filter((b) => b.maxY === undefined || 0 <= b.maxY);
    expect(atGround.some((b) => -20 >= b.minX && -20 <= b.maxX && -10 >= b.minZ && -10 <= b.maxZ)).toBe(true);
    const atTop = col.boxes.filter((b) => (b.minY === undefined || 6 >= b.minY) && (b.maxY === undefined || 6 <= b.maxY));
    expect(atTop.some((b) => -20 >= b.minX && -20 <= b.maxX && -10 >= b.minZ && -10 <= b.maxZ)).toBe(false);
  });

  it('trên mặt tường: lan can hai bên chặn, khe mã đạo mở', () => {
    const { col } = setup();
    const top = col.boxes.filter((b) => b.minY !== undefined);
    const hits = (x: number, z: number): boolean => top.some((b) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ);
    expect(hits(-20, -12.3)).toBe(true); // đoạ khẩu (bắc)
    expect(hits(-20, -7.7)).toBe(true); // vũ tường (nam)
    expect(hits(-12, -7.7)).toBe(false); // khe chỗ mã đạo
  });
});
