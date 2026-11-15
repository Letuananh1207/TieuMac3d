import { describe, expect, it } from 'vitest';
import { canStep } from './player/controller';
import { loadScene } from './scene/loadSpec';
import { buildHeightfield } from './scene/terrainHeight';

/**
 * Nhà của ta làm lại (V-48): nhà là một đảo nhỏ trên biển mây — đi về mọi hướng đều dừng ở mép vực (R-VA-2), không có
 * cách nào ra ngoài đảo; lối ra duy nhất là vòng sáng "Khởi Nguyên Trấn" cuối Bến mây (R-NHA-5, R-NHA-1).
 * Chỉ dùng địa hình (heightfield + `canStep`) — chưa tính lan can / nhà / cây (chặn thêm, không mở thêm lối).
 */
const spec = loadScene('nha-ta').spec;
const hf = buildHeightfield(spec.terrain, spec.paths);
const [cx, cz] = spec.terrain.center;
const R = spec.terrain.edge.radius;

/** Đi thẳng từ (x, z) theo (dx, dz) tối đa `dist` m, bước 5 cm, dừng khi không bước được (R-VA-2). */
function walk(x: number, z: number, dx: number, dz: number, dist: number): { x: number; z: number; y: number } {
  const p = { x, z, y: hf.heightAt(x, z) };
  for (let s = 0; s < dist / 0.05; s++) {
    const nx = p.x + dx * 0.05;
    const nz = p.z + dz * 0.05;
    if (!canStep(hf, p.x, p.z, nx, nz)) break;
    p.x = nx;
    p.z = nz;
    p.y = hf.heightAt(nx, nz);
  }
  return p;
}

const DIRS: [number, number][] = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
  const r = (a * Math.PI) / 180;
  return [Math.sin(r), -Math.cos(r)];
});

describe('Nhà của ta — phạm vi nhà (V-48)', () => {
  it('R-NHA-5: từ 8 chỗ trong đảo đi thẳng 8 hướng 60 m → luôn dừng trong đảo (cách tâm < bán kính mép + 2 m), không rơi xuống vực', () => {
    const starts: [number, number][] = [[0, 6.5], [0, 10], [0, -4], [-13, -4], [13, -4], [-11, 4], [11, 4], [0, 18]];
    for (const [sx, sz] of starts) {
      for (const [dx, dz] of DIRS) {
        const p = walk(sx, sz, dx, dz, 60);
        expect(Math.hypot(p.x - cx, p.z - cz), `từ (${sx}; ${sz}) hướng (${dx.toFixed(2)}; ${dz.toFixed(2)})`).toBeLessThan(R + 2);
        expect(p.y).toBeGreaterThan(-2); // dừng ở mép, không bước xuống vách
      }
    }
  });

  it('R-NHA-5: từ (0; 0) đi thẳng tây → dừng ở mép x ≈ −26; đi thẳng bắc theo lối hông, sau nhà leo đồi rồi dừng trước z −30', () => {
    const west = walk(0, 0, -1, 0, 60);
    expect(west.x).toBeGreaterThan(-28);
    expect(west.x).toBeLessThan(-24);
    const north = walk(-6, -12, 0, -1, 60); // lối hông giữa nhà (x ≥ −5,25) và hành lang tây (x ≤ −6,9)
    expect(north.z).toBeGreaterThan(-30);
    expect(north.z).toBeLessThan(-18);
  });

  it('R-NHA-5: Bến mây là doi đất hẹp — hai bên là vực (đi ngang ra x ±5 thì dừng trước), lan can gỗ hai mép, cuối bến dừng trước mép', () => {
    // đầu bến (z 13 … 16) vách còn thoải — lan can gỗ hai mép x ±2,8 chặn suốt bến (R-VA-1)
    const rails = spec.fences.filter((f) => f.from[0] === f.to[0] && Math.abs(f.from[0]) === 2.8);
    expect(rails.map((f) => [f.from[1], f.to[1]])).toEqual([[13.2, 22.8], [13.2, 22.8]]);
    for (const z of [17, 19, 21]) {
      expect(walk(0, z, 1, 0, 10).x).toBeLessThan(4.5);
      expect(walk(0, z, -1, 0, 10).x).toBeGreaterThan(-4.5);
    }
    const end = walk(0, 18, 0, 1, 20);
    expect(end.z).toBeLessThan(27);
  });

  it('R-NHA-1, R-HANH-4: chỗ tới (0; 10) đi bộ, chỗ xuất phát (0; 6,5), vòng sáng về trấn trên Bến mây — đều phẳng ở y 0', () => {
    const portal = spec.portals.find((p) => p.scene === 'tong-mon')!;
    expect(portal.arrive.at).toEqual([0, 10]);
    expect(spec.player.start).toEqual([0, 6.5]);
    expect(portal.area).toEqual({ from: [-1.8, 19.5], to: [1.8, 22.5] });
    for (const [x, z] of [[0, 10], [0, 6.5], [2.5, 6.5], [0, 21]] as [number, number][]) {
      expect(hf.heightAt(x, z)).toBeCloseTo(0, 2);
      expect(hf.slopeAt(x, z)).toBeLessThan(1);
    }
    // từ chỗ tới đi thẳng nam tới vòng sáng — địa hình không chặn
    expect(walk(0, 10, 0, 1, 10).z).toBeGreaterThan(20);
  });

  it('R-NHA-2: 12 ô trang trí giữ mã, đứng phẳng trên đất (y 0)', () => {
    expect(spec.decorSlots.map((s) => s.id)).toEqual([
      'trong-1', 'trong-2', 'trong-3', 'san-1', 'san-2', 'san-3', 'vuon-1', 'vuon-2', 'vuon-3', 'vuon-4', 'vuon-5', 'vuon-6',
    ]);
    for (const s of spec.decorSlots) {
      expect(hf.heightAt(s.x, s.z), s.id).toBeCloseTo(0, 2);
      expect(hf.slopeAt(s.x, s.z), s.id).toBeLessThan(1);
    }
  });
});
