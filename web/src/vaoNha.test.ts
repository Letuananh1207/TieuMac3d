import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from './collision/colliders';

// canvas 2D giả (biển vẽ bằng canvas) — như scene/nhaModel.test.ts
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : key === 'getImageData' ? () => ({ data: new Uint8ClampedArray(4) }) : () => ctx) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx }) });
vi.stubGlobal('window', { devicePixelRatio: 1, innerWidth: 390, innerHeight: 844, addEventListener: () => {} });

const { PlayerController } = await import('./player/controller');
const { loadScene, HOME_SCENE } = await import('./scene/loadSpec');
const { buttonPortalAt, checkPortals, portalContains } = await import('./scene/portals');
const { buildWorld } = await import('./scene/world');
const { HouseDoor, tapHitsHouse } = await import('./vaoNha');

/**
 * Vào nhà chính (R-NHA-1, V-96): bước qua ô cửa không tự vào; vòng sáng nhỏ trước cửa — đứng trong → nút "Vào nhà";
 * chạm nhà → vào (trong vòng) / tự đi tới vòng rồi vào (xa); joystick giữa đường → huỷ.
 */
const home = loadScene('nha-ta').spec;
const door = home.portals.find((p) => p.scene === 'nha-ta-trong')!;
const house = home.buildings.find((b) => b.kind === 'nha-o' && b.closed)!;
// nhà khối (bỏ `model` — test không nạp .glb): va chạm / nền như model (V-88)
const spec = { ...home, buildings: home.buildings.map((b) => (b === house ? { ...b, model: undefined } : b)) };
const colliders = new Colliders();
const world = buildWorld(new THREE.Scene(), colliders, spec);

function setup(x: number, z: number): { player: InstanceType<typeof PlayerController>; entered: string[]; door: InstanceType<typeof HouseDoor> } {
  const root = new THREE.Object3D();
  const facing = new THREE.Object3D();
  root.add(facing);
  const player = new PlayerController({ root, facing, animate: () => {} }, colliders, world.surface);
  player.position.set(x, 0, z);
  player.snapToGround();
  const entered: string[] = [];
  const hd = HouseDoor.find(spec.portals, world.closedHouses, { player, enter: (to) => entered.push(to), busy: () => false });
  if (!hd) throw new Error('nha-ta: không có cửa nhà chính');
  return { player, entered, door: hd };
}

/** Chạy `seconds` giây, `input` = joystick (0 = thả). */
function run(p: InstanceType<typeof PlayerController>, seconds: number, input = { x: 0, y: 0 }): void {
  for (let i = 0; i < seconds * 60; i++) p.update(1 / 60, input, 0, false);
}

describe('vào nhà chính bằng vòng sáng + nút / chạm nhà (R-NHA-1, V-96)', () => {
  it('R-NHA-1: cửa nhà chính là cổng bấm nút, vòng sáng nhỏ (bán kính 0,75 m) ngay trước gian giữa, không chữ nổi', () => {
    expect(door).toMatchObject({ label: 'Vào nhà', marker: false, via: 'nut', ring: 0.75, arrive: { at: [-15, -2.6], rotY: 0 } });
    expect(door.ring).toBeLessThan(1.2); // nhỏ hơn vòng cổng sang cảnh (R-HANH-4)
    const cx = (door.area.from[0] + door.area.to[0]) / 2;
    const cz = (door.area.from[1] + door.area.to[1]) / 2;
    expect(cx).toBeCloseTo(house.x, 6); // giữa gian giữa
    expect(cz).toBeCloseTo(-3.4, 6); // trên sân trước chân dốc
    expect(cz).toBeGreaterThan(house.z + house.d / 2); // ngoài mặt tiền
    expect(world.surface.heightAt(cx, cz)).toBeCloseTo(0, 2); // tâm vòng trên mặt sân phẳng
    expect(checkPortals(spec)).toEqual([]);
  });

  it('R-NHA-1: bước qua ô cửa không vào — cửa không còn là cổng đi bộ, đi thẳng vào ô cửa không có nút', () => {
    expect(spec.portals.filter((p) => p.via !== 'nut').map((p) => p.scene)).not.toContain('nha-ta-trong');
    const { player } = setup(-15, -2);
    run(player, 3, { x: 0, y: -1 }); // đẩy lên (camera yaw 0: nhìn −z = về bắc, về nhà)
    expect(player.position.z).toBeLessThan(-4.4); // đã lên dốc tới ô cửa
    expect(player.position.z).toBeGreaterThan(house.z); // cửa đóng chặn, không vào trong nhà
    expect(buttonPortalAt(spec.portals, player.position.x, player.position.z)).toBeUndefined();
  });

  it('R-NHA-1: đứng trong vòng → nút "Vào nhà"; bước ra → ẩn; vừa ra sân (−15; −2,6) đứng ngoài vòng → không có nút', () => {
    expect(buttonPortalAt(spec.portals, -15, -3.4)).toBe(door);
    expect(buttonPortalAt(spec.portals, -14.5, -3.0)).toBe(door);
    expect(buttonPortalAt(spec.portals, -15, -2.6)).toBeUndefined();
    expect(buttonPortalAt(spec.portals, -14.3, -2.7)).toBeUndefined(); // góc ô bao, ngoài vòng tròn
    expect(buttonPortalAt(spec.portals, -15, -1.4)).toBeUndefined(); // lối nhánh tây
    expect(portalContains(door, -15.7, -3.4)).toBe(true);
  });

  it('R-NHA-1: đứng trong vòng, chạm nhà → vào ngay', () => {
    const { door: hd, entered } = setup(-15, -3.3);
    expect(hd.tapHouse()).toBe(true);
    expect(entered).toEqual(['nha-ta-trong']);
  });

  it('R-NHA-1: đứng giữa lối nhánh tây chạm nhà → tự đi tới vòng rồi vào', () => {
    const { door: hd, entered, player } = setup(-8, -1.4);
    expect(hd.tapHouse()).toBe(true);
    expect(hd.walking).toBe(true);
    expect(entered).toEqual([]);
    run(player, 8);
    expect(entered).toEqual(['nha-ta-trong']);
    expect(hd.walking).toBe(false);
    expect(portalContains(door, player.position.x, player.position.z)).toBe(true);
  });

  it('R-NHA-1: chạm nhà rồi đẩy joystick giữa đường → dừng tự đi, không vào', () => {
    const { door: hd, entered, player } = setup(-8, -1.4);
    hd.tapHouse();
    run(player, 0.5);
    run(player, 0.3, { x: 1, y: 0 }); // đẩy sang phải
    run(player, 8);
    expect(entered).toEqual([]);
    expect(hd.walking).toBe(false);
    expect(player.position.x).toBeGreaterThan(-13);
  });

  it('R-NHA-1: đang bận (trang trí, ngồi…) → chạm nhà không làm gì', () => {
    const { player } = setup(-8, -1.4);
    const entered: string[] = [];
    const hd = HouseDoor.find(spec.portals, world.closedHouses, { player, enter: (to) => entered.push(to), busy: () => true })!;
    expect(hd.tapHouse()).toBe(false);
    run(player, 3);
    expect(entered).toEqual([]);
  });

  it('R-NHA-1: chạm trúng mái / tường / cửa = tia trúng hộp bao nhà (cả mái), không bị mặt đất chắn trước', () => {
    const { box } = world.closedHouses[0];
    expect(box.max.y).toBeGreaterThan(3); // hộp phủ cả mái
    expect(box.min.x).toBeLessThanOrEqual(house.x - house.w / 2);
    expect(box.max.z).toBeGreaterThanOrEqual(house.z + house.d / 2);
    const eye = new THREE.Vector3(-15, 8, 10);
    const toRoof = new THREE.Ray(eye, new THREE.Vector3(-15, 4, -8).sub(eye).normalize());
    expect(toRoof.intersectBox(box, new THREE.Vector3())).not.toBeNull();
    const toYard = new THREE.Ray(eye, new THREE.Vector3(0, 0, 0).sub(eye).normalize());
    expect(toYard.intersectBox(box, new THREE.Vector3())).toBeNull();
    expect(tapHitsHouse(12, null)).toBe(true);
    expect(tapHitsHouse(12, 20)).toBe(true);
    expect(tapHitsHouse(12, 5)).toBe(false); // đồi / sân gần camera hơn
    expect(tapHitsHouse(null, 5)).toBe(false);
  });

  it('R-NHA-1: cảnh không có nhà kín có vòng cửa (Khởi Nguyên Trấn) → không bắt chạm nhà', () => {
    const town = loadScene(HOME_SCENE).spec;
    expect(HouseDoor.find(town.portals, [], { player: { position: { x: 0, z: 0 }, walkTo: () => false }, enter: () => {}, busy: () => false })).toBeNull();
  });
});
