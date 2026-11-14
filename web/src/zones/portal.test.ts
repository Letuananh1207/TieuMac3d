import { describe, expect, it } from 'vitest';
import { PortalTrigger } from './portal';

// vùng chạm như lòng khoảnh tường cuối ngõ ở Khởi Nguyên Trấn: x −24,6 … −19,5, z 32,9 … 39,1
const AREA = { from: [-24.6, 32.9] as [number, number], to: [-19.5, 39.1] as [number, number] };
const ARRIVE = { x: -16.5, z: 36 };

/** Đi thẳng từ `a` tới `b` theo `steps` bước; trả số lần cổng báo sang. */
function walk(t: PortalTrigger, a: { x: number; z: number }, b: { x: number; z: number }, steps = 40, enabled = true): number {
  let fired = 0;
  for (let i = 0; i <= steps; i++) {
    const k = i / steps;
    if (t.update({ x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k }, enabled)) fired++;
  }
  return fired;
}

describe('cổng sang cảnh (R-HANH-4)', () => {
  it('R-HANH-4: vừa tới, đứng ở chỗ đứng ngoài vùng → không sang', () => {
    const t = new PortalTrigger(AREA, ARRIVE);
    for (let i = 0; i < 100; i++) expect(t.update(ARRIVE)).toBe(false);
  });

  it('R-HANH-4: từ ngoài bước vào vùng → sang ngay, đúng một lần', () => {
    const t = new PortalTrigger(AREA, ARRIVE);
    expect(walk(t, ARRIVE, { x: -22, z: 36 })).toBe(1);
    // đứng tiếp trong vùng, đi ra rồi vào lại → không báo nữa (đã sang)
    expect(walk(t, { x: -22, z: 36 }, ARRIVE)).toBe(0);
    expect(walk(t, ARRIVE, { x: -22, z: 36 })).toBe(0);
  });

  it('R-HANH-4: xuất hiện trong vùng → không tính; ra rồi vào lại mới sang', () => {
    const t = new PortalTrigger(AREA, { x: -22, z: 36 });
    expect(t.update({ x: -22, z: 36 })).toBe(false);
    expect(t.update({ x: -21, z: 36 })).toBe(false); // vẫn trong vùng
    expect(walk(t, { x: -21, z: 36 }, ARRIVE)).toBe(0); // ra
    expect(walk(t, ARRIVE, { x: -22, z: 36 })).toBe(1); // vào lại
  });

  it('R-HANH-4: đang bận (bản đồ / thoại / màn tải / trang trí) → không tính, phải ra rồi vào lại', () => {
    const t = new PortalTrigger(AREA, ARRIVE);
    expect(walk(t, ARRIVE, { x: -22, z: 36 }, 40, false)).toBe(0);
    // hết bận khi vẫn đứng trong vùng → không sang
    expect(t.update({ x: -22, z: 36 })).toBe(false);
    expect(walk(t, { x: -22, z: 36 }, ARRIVE)).toBe(0);
    expect(walk(t, ARRIVE, { x: -22, z: 36 })).toBe(1);
  });

  it('R-HANH-4: vùng ghi ngược chiều (from > to) vẫn đúng; mép vùng tính là trong', () => {
    const t = new PortalTrigger({ from: AREA.to, to: AREA.from }, ARRIVE);
    expect(t.update({ x: -19.5, z: 36 })).toBe(true);
  });

  it('R-HANH-4 R-NHA-1: ở nhà, đứng (0; 10) vừa tới → không ra; đi về nam qua cổng → về trấn', () => {
    const t = new PortalTrigger({ from: [-4, 12.5], to: [4, 16] }, { x: 0, z: 10 });
    expect(t.update({ x: 0, z: 10 })).toBe(false);
    expect(walk(t, { x: 0, z: 10 }, { x: 0, z: 14 })).toBe(1);
  });
});
