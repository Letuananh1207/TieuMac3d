import { describe, expect, it } from 'vitest';
import { canStep } from './player/controller';
import { loadScene } from './scene/loadSpec';
import { buildHeightfield } from './scene/terrainHeight';
import { GIAN_TRONG_DOOR_Z } from './scene/kien_truc/gian_trong';
import type { Box } from './collision/colliders';
import { buildDecorArea } from './scene/decorArea';
import { DECOR_SHAPES } from './scene/decorItems';
import { fenceSegments } from './scene/vuonLayout';
import { inBag, type PlacedDecor } from './zones/decor';
import { LEGACY_SLOTS, migrateHome } from './zones/decorLegacy';
import { checkSpot, settleScene, type PlaceArea } from './zones/decorPlace';

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
    const north = walk(-12, -12, 0, -1, 60); // cánh cỏ tây, bên trái nhà chính (V-82)
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

  it('R-NHA-7: vùng đặt — sân "ngoai" trần 40, gian trong "trong" trần 20; chỗ xuất phát nằm trong vùng', () => {
    expect(spec.decorArea).toMatchObject({ where: 'ngoai', maxItems: 40, maxSlope: 0.35 });
    expect(loadScene('nha-ta-trong').spec.decorArea).toMatchObject({ where: 'trong', maxItems: 20 });
  });
});

/** Vùng đặt thật của sân (vật cản gần đúng: nhà chính, rào vườn, thùng — đủ cho luật chỗ đặt; cây / lan can bỏ). */
function homeArea(): PlaceArea {
  const house = spec.buildings.find((b) => b.id === 'chinh-phong')!;
  const g = spec.garden;
  const boxes: Box[] = [{ minX: house.x - house.w / 2, maxX: house.x + house.w / 2, minZ: house.z - house.d / 2, maxZ: house.z + house.d / 2, h: 5 }];
  for (const f of fenceSegments(g)) {
    boxes.push({ minX: Math.min(f.from[0], f.to[0]) - 0.1, maxX: Math.max(f.from[0], f.to[0]) + 0.1, minZ: Math.min(f.from[1], f.to[1]) - 0.1, maxZ: Math.max(f.from[1], f.to[1]) + 0.1, h: 0.6 });
  }
  boxes.push({ minX: g.bin.x - 0.4, maxX: g.bin.x + 0.4, minZ: g.bin.z - 0.6, maxZ: g.bin.z + 0.6, h: 0.75 });
  return buildDecorArea('nha-ta', spec, boxes, [], (x, z) => hf.heightAt(x, z))!;
}
const shapeOf = (id: string) => DECOR_SHAPES[id];
const at = (x: number, z: number, rot = 0) => ({ x, z, rot });

describe('Nhà của ta — chỗ đặt đồ trang trí tự do (R-NHA-7, V-69)', () => {
  const area = homeArea();

  it('R-NHA-7: Ao sen ở (0; 0) → đỏ "Lối đi"; cánh cỏ đông cạnh vườn (8; 4) → được; chỗ xuất phát / bãi hạc → "Lối đi"', () => {
    expect(checkSpot(area, [], shapeOf, 'ao-sen', at(0, 0))).toMatchObject({ ok: false, label: 'Lối đi' });
    expect(checkSpot(area, [], shapeOf, 'mai', at(8, 4)).ok).toBe(true);
    expect(checkSpot(area, [], shapeOf, 'chau-lan', at(0.5, 6.5))).toMatchObject({ ok: false, label: 'Lối đi' });
    expect(checkSpot(area, [], shapeOf, 'chau-lan', at(3, 6.5))).toMatchObject({ ok: false, label: 'Lối đi' }); // bãi hạc (2,5; 6,5)
  });

  it('R-NHA-7: trước cửa nhà chính → "Cửa nhà"; sát luống → "Luống rau"; cạnh thùng → "Thùng thu mua"', () => {
    expect(checkSpot(area, [], shapeOf, 'chau-lan', at(0, -7))).toMatchObject({ ok: false, label: 'Cửa nhà' });
    expect(checkSpot(area, [], shapeOf, 'chau-lan', at(6, 1.3))).toMatchObject({ ok: false, label: 'Luống rau' });
    expect(checkSpot(area, [], shapeOf, 'chau-lan', at(3.5, 4.5))).toMatchObject({ ok: false, label: 'Thùng thu mua' });
  });

  it('R-NHA-7: Mai trên lối trục giữa hai bên luống → "Lối đi"; Chậu lan trên nền đất vườn ngoài cột luống tây (cách ≥ 0,3 m) → được; Bàn trà ở cánh cỏ đông → được', () => {
    expect(checkSpot(area, [], shapeOf, 'mai', at(0, 1))).toMatchObject({ ok: false, label: 'Lối đi' });
    expect(checkSpot(area, [], shapeOf, 'chau-lan', at(-7.5, 0)).ok).toBe(true);
    expect(checkSpot(area, [], shapeOf, 'ban-tra', at(12, 0)).ok).toBe(true);
  });

  it('R-NHA-7: Mai ngoài đảo / trên Bến mây → không đặt được', () => {
    expect(checkSpot(area, [], shapeOf, 'mai', at(0, 17)).ok).toBe(false);
    expect(checkSpot(area, [], shapeOf, 'mai', at(-26, 0)).ok).toBe(false);
  });

  it('R-NHA-3: 12 ô cũ → món đúng chỗ ô; ô nay không hợp lệ tự dời tới chỗ hợp lệ gần nhất (≤ 8 m); không mất cái nào', () => {
    const placed: Record<string, string> = {};
    for (const s of LEGACY_SLOTS) placed[s.id] = s.scene === 'nha-ta' ? 'mai' : 'tranh-chu';
    const owned = { mai: 9, 'tranh-chu': 3 };
    const moved = migrateHome([], placed, owned);
    const { items } = settleScene(area, moved, shapeOf);
    const yard = items.filter((p) => p.scene === 'nha-ta');
    const home = { items, owned };
    expect(yard).toHaveLength(9);
    expect(inBag(home, 'mai')).toBe(0);
    // san-1 (−19; −3,2) — cánh cỏ tây: Mai đứng đúng chỗ ô (lưới 0,5)
    expect(yard).toContainEqual({ item: 'mai', scene: 'nha-ta', x: -19, z: -3, rot: 0 });
    for (const p of yard) {
      expect(checkSpot(area, yard.filter((q) => q !== p), shapeOf, 'mai', at(p.x, p.z)).ok).toBe(true);
      const slot = LEGACY_SLOTS.filter((s) => s.scene === 'nha-ta').map((s) => Math.hypot(s.x - p.x, s.z - p.z));
      expect(Math.min(...slot)).toBeLessThanOrEqual(8 + 0.3);
    }
    expect(items.filter((p) => p.scene === 'nha-ta-trong')).toHaveLength(3);
  });

  it('R-NHA-3: món đặt trước V-82 nay đè luống / nhà chính → tự dời ra chỗ trống gần nhất, đủ món, túi không đổi', () => {
    const old: PlacedDecor[] = [
      { item: 'mai', scene: 'nha-ta', x: -3, z: 0, rot: 0 },
      { item: 'ban-tra', scene: 'nha-ta', x: 0, z: -11, rot: 90 },
    ];
    const r = settleScene(area, old, shapeOf);
    expect(r.changed).toBe(true);
    expect(r.items).toHaveLength(2);
    for (const p of r.items) {
      expect(checkSpot(area, r.items.filter((q) => q !== p), shapeOf, p.item, at(p.x, p.z, p.rot)).ok).toBe(true);
      expect(p.rot).toBe(old.find((o) => o.item === p.item)!.rot);
    }
    expect(inBag({ items: r.items, owned: { mai: 1, 'ban-tra': 1 } }, 'ban-tra')).toBe(0);
  });
});

describe('Nhà của ta — bố cục "Trục giữa": nhà cuối lối trục, vườn hai bên lối (V-82)', () => {
  const house = spec.buildings.find((b) => b.id === 'chinh-phong')!;
  const door = spec.portals.find((p) => p.scene === 'nha-ta-trong')!;
  const inside = loadScene('nha-ta-trong').spec;
  const room = inside.buildings[0];
  const doorAt = { x: (door.area.from[0] + door.area.to[0]) / 2, z: (door.area.from[1] + door.area.to[1]) / 2 };
  const [sx, sz] = spec.player.start;

  it('R-NHA-5: nhà chính (0; −11,5) kín, nhìn nam, cuối lối trục, lưng dựa đồi trúc; cả nhà trong đảo; một lối lát trục x 0, không lối nhánh, không rào vườn', () => {
    expect([house.x, house.z, house.w, house.d, house.kind, house.closed, house.rotY ?? 0]).toEqual([0, -11.5, 10.5, 6, 'nha-o', true, 0]);
    expect(spec.galleries).toEqual([]);
    for (const [ax, az] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      expect(Math.hypot(house.x + (ax * house.w) / 2 - cx, house.z + (az * house.d) / 2 - cz)).toBeLessThan(R - 4);
    }
    // lưng nhà cách chân đồi trúc (mép bắc nền phẳng z −18) ≤ 4 m
    expect(house.z - house.d / 2 - -18).toBeLessThanOrEqual(4);
    expect(hf.heightAt(0, -22)).toBeGreaterThan(1); // sau nhà là đồi
    // mọi lối lát nằm trên trục x 0, chạy từ Bến mây tới sân trước nhà
    expect(spec.paths.every((p) => p.from[0] === 0 && p.to[0] === 0)).toBe(true);
    expect(Math.min(...spec.paths.flatMap((p) => [p.from[1], p.to[1]]))).toBeLessThanOrEqual(house.z + house.d / 2 + 3);
    expect(spec.garden.layout).toBe('mo');
    expect(fenceSegments(spec.garden)).toEqual([]);
  });

  it('R-NHA-5, R-VUON-1: quãng đi từ chỗ xuất hiện — luống gần ≤ 6 m, luống xa ≤ 14 m, cửa nhà ≤ 16 m đi thẳng không rẽ, thùng ≤ 3 m', () => {
    const d = spec.garden.plots.map((p) => Math.hypot(p.x - sx, p.z - sz));
    expect(Math.min(...d)).toBeLessThanOrEqual(6);
    expect(Math.max(...d)).toBeLessThanOrEqual(14);
    expect(doorAt.x).toBe(sx); // cùng trục: đi thẳng, 0 rẽ
    expect(sz - doorAt.z).toBeLessThanOrEqual(16);
    expect(Math.hypot(spec.garden.bin.x - sx, spec.garden.bin.z - sz)).toBeLessThanOrEqual(3);
    // đi thẳng bắc từ chỗ xuất hiện tới vòng cửa — địa hình không chặn, cả lối phẳng
    expect(walk(sx, sz, 0, -1, sz - doorAt.z).z).toBeCloseTo(doorAt.z, 1);
  });

  it('R-NHA-1, R-HANH-4: vào nhà chính bằng nút "Vào nhà" ở vòng sáng nhỏ trước cửa (V-96) → gian trong; gian trong 14 × 10, ra bằng nút "Ra sân" trên thảm trước cửa hồi tây (V-71), vào đứng (−3,8; 2,6) quay vào phòng; ra đứng (0; −6,1) quay ra sân', () => {
    expect(door).toMatchObject({ area: { from: [-0.75, -7.65], to: [0.75, -6.15] }, arrive: { at: [0, -6.1], rotY: 0 }, label: 'Vào nhà', marker: false, via: 'nut', ring: 0.75 });
    const front = house.z + house.d / 2;
    expect(door.area.from[1]).toBeGreaterThan(front); // vòng ngoài mặt tiền (z −8,5), trên sân trước cửa
    expect([room.kind, room.w, room.d]).toEqual(['gian-trong', 14, 10]);
    const out = inside.portals[0];
    expect(out).toMatchObject({ scene: 'nha-ta', arrive: { at: [-3.8, 2.6], rotY: 90 }, label: 'Ra sân', marker: false, via: 'nut' });
    // vùng hiện nút = thảm trước cửa hồi tây (mặt trong tường x −6,76), phủ tâm cửa
    expect(out.area.from[0]).toBeLessThan(-room.w / 2 + 0.3);
    expect(out.area.to[0]).toBeLessThanOrEqual(-5);
    expect(out.area.from[1]).toBeLessThan(GIAN_TRONG_DOOR_Z);
    expect(out.area.to[1]).toBeGreaterThan(GIAN_TRONG_DOOR_Z);
    expect(inside.player.start).toEqual([-3.8, 2.6]);
    expect(inside.site).toMatchObject({ name: 'Nhà của ta', loadName: 'Trong nhà' });
  });

  it('R-HANH-4: đứng ở chỗ ra (0; −6,1) và lối trục tới cửa đều phẳng (y 0)', () => {
    for (const [x, z] of [[0, -6.1], [0, -4.9], [0, 2], [3, -6]] as [number, number][]) {
      expect(hf.heightAt(x, z)).toBeCloseTo(0, 2);
      expect(hf.slopeAt(x, z)).toBeLessThan(1);
    }
  });
});
