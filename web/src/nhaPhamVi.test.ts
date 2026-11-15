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
    const north = walk(-6, -12, 0, -1, 60); // bãi cỏ giữa nhà chính (x ≤ −9,75) và lối trục (V-68)
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

  it('R-NHA-2: 12 ô trang trí giữ mã — 9 ô sân / vườn ngoài sân, 3 ô trong nhà ở gian trong (V-68); ô ngoài sân đứng phẳng trên đất (y 0)', () => {
    expect(spec.decorSlots.map((s) => s.id)).toEqual(['san-1', 'san-2', 'san-3', 'vuon-1', 'vuon-2', 'vuon-3', 'vuon-4', 'vuon-5', 'vuon-6']);
    for (const s of spec.decorSlots) {
      expect(hf.heightAt(s.x, s.z), s.id).toBeCloseTo(0, 2);
      expect(hf.slopeAt(s.x, s.z), s.id).toBeLessThan(1);
    }
    const inside = loadScene('nha-ta-trong').spec;
    expect(inside.decorSlots.map((s) => [s.id, s.kind])).toEqual([['trong-1', 'trong'], ['trong-2', 'trong'], ['trong-3', 'trong']]);
  });
});

describe('Nhà của ta — nhà chính sát mép trái, vườn giữa, gian trong riêng (V-68)', () => {
  const house = spec.buildings.find((b) => b.id === 'chinh-phong')!;
  const door = spec.portals.find((p) => p.scene === 'nha-ta-trong')!;
  const inside = loadScene('nha-ta-trong').spec;
  const room = inside.buildings[0];

  it('R-NHA-5: nhà chính (−15; −8) kín, không hành lang mái; cả nhà trong đảo (cách mép ≥ 4 m), phía tây lối trục; vườn rau giữa đảo cạnh lối trục', () => {
    expect([house.x, house.z, house.kind, house.closed]).toEqual([-15, -8, 'nha-o', true]);
    expect(spec.galleries).toEqual([]);
    for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      expect(Math.hypot(house.x + (sx * house.w) / 2 - cx, house.z + (sz * house.d) / 2 - cz)).toBeLessThan(R - 4);
    }
    expect(house.x + house.w / 2).toBeLessThan(-1.2 - 5); // xa lối trục x 0
    const f = spec.garden.fence;
    expect([f.from, f.to, f.gate]).toEqual([[3.5, -16], [16.5, -3], -9.5]);
    // lối trục chạy tới ngang cổng vườn, lối nhánh vào khe cổng
    expect(spec.paths.some((p) => p.from[0] === 0 && p.to[0] === 0 && p.to[1] === f.gate)).toBe(true);
  });

  it('R-NHA-1, R-HANH-4: bước vào ô cửa nhà chính (vùng chạm phủ mép cửa, không vòng sáng) → gian trong; ra đứng (−15; −2,6) quay ra sân; gian trong 14 × 10, ô cửa "Ra sân", vào đứng (0; 1,2) quay vào phòng', () => {
    expect(door).toMatchObject({ area: { from: [-16.2, -5.6], to: [-13.8, -4.6] }, arrive: { at: [-15, -2.6], rotY: 0 }, label: 'Vào nhà', marker: false });
    const front = house.z + house.d / 2;
    expect(door.area.from[1]).toBeLessThan(front); // phủ mép cửa (mặt tiền z −5)
    expect(door.area.to[1]).toBeGreaterThan(front);
    expect([room.kind, room.w, room.d]).toEqual(['gian-trong', 14, 10]);
    const out = inside.portals[0];
    expect(out).toMatchObject({ scene: 'nha-ta', arrive: { at: [0, 1.2], rotY: 180 }, label: 'Ra sân', marker: false });
    expect(out.area.from[1]).toBeLessThan(room.d / 2); // vùng chạm phủ ô cửa (tường trước z 5)
    expect(out.area.to[1]).toBeGreaterThan(room.d / 2);
    expect(inside.player.start).toEqual([0, 1.2]);
    expect(inside.site).toMatchObject({ name: 'Nhà của ta', loadName: 'Trong nhà' });
  });

  it('R-HANH-4: đứng ở chỗ ra (−15; −2,6) và đường tới cửa đều phẳng (y 0)', () => {
    for (const [x, z] of [[-15, -2.6], [-15, -1.4], [-8, -1.4]] as [number, number][]) {
      expect(hf.heightAt(x, z)).toBeCloseTo(0, 2);
      expect(hf.slopeAt(x, z)).toBeLessThan(1);
    }
  });
});
