import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from './collision/colliders';
import { LayeredGround } from './collision/ground';
import { PlayerController } from './player/controller';
import { flightSlope } from './scene/kien_truc/cau_thang';
import { hallFloor } from './scene/kien_truc/dien';
import { lauSach, lauSachStairs } from './scene/kien_truc/lau_sach';
import { addWalkIn } from './scene/rooms';
import { nearestSeat } from './zones/seats';
import { DEFAULT_SCENE, type BuildingSpec } from './scene/spec';

// biển hiệu vẽ bằng canvas 2D: Node không có — canvas giả, mọi lệnh vẽ bỏ qua
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : () => {}) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) });

/** Tàng Thư Các như design/scene/scene.json (18 × 9, kiến trúc × 1,6), đặt ở gốc toạ độ, mặt trước nhìn +z. */
const style = { ...DEFAULT_SCENE.buildingStyle, heightScale: 1.6 };
const b: BuildingSpec = { id: 'tang-thu-cac', kind: 'lau-sach', x: 0, z: 0, w: 18, d: 9, title: '藏書閣', roofColor: '#2f3236' };
const k = 1.6;
const plat = hallFloor(style);
const yf = plat + 3 * k + 0.5;
const id = b.d - 0.8;
const L = lauSachStairs(b, style);
const xc = (L.x0 + L.x1) / 2; // giữa vế thang
const zl = (L.zBack + L.zTop) / 2; // giữa chiếu nghỉ / cầu nối
const zMid = (L.zTop + L.zStart) / 2; // giữa vế

function setup(): { scene: THREE.Scene; player: PlayerController; room: ReturnType<typeof addWalkIn> } {
  const scene = new THREE.Scene();
  const colliders = new Colliders();
  const room = addWalkIn(scene, colliders, b, style, lauSach);
  const root = new THREE.Object3D();
  const facing = new THREE.Object3D();
  root.add(facing);
  const player = new PlayerController({ root, facing, animate: () => {} }, colliders, new LayeredGround(null, room.pads));
  return { scene, player, room };
}

/** Đi (chạm để đi) tới (x, z); dừng khi tới nơi hoặc kẹt. */
function walkTo(p: PlayerController, x: number, z: number): void {
  p.moveTarget = new THREE.Vector3(x, 0, z);
  for (let i = 0; i < 60 * 20 && p.moveTarget; i++) p.update(1 / 60, { x: 0, y: 0 }, 0, false);
}

function start(p: PlayerController, x: number, z: number): void {
  p.position.set(x, 0, z);
  p.snapToGround();
}

/** Từ mặt đất trước chân thang: đi thẳng lên chiếu nghỉ, qua cầu nối vào sàn tầng 2, ra giữa sàn (giữa hai hàng án). */
function climb(p: PlayerController): void {
  start(p, xc, L.zStart + 1.5);
  walkTo(p, xc, zl);
  walkTo(p, L.floorX - 1.5, zl);
  walkTo(p, L.floorX - 1.5, 0);
}

describe('Tàng Thư Các lên được tầng 2', () => {
  it('R-VA-3 (L-6): thang thẳng một vế ngoài trời, dốc ≤ 35°, nằm ngoài nhà và ngoài mép hiên', () => {
    expect(flightSlope(L)).toBeLessThanOrEqual(35);
    expect(L.x0).toBeGreaterThan(b.w / 2 + 1.5); // hiên lửng rộng w + 3
  });

  it('R-VA-3: đi từ mặt đất lên thang tới tầng 2, đi về phía tây vẫn ở tầng 2', () => {
    const { player } = setup();
    climb(player);
    expect(player.position.y).toBeCloseTo(yf, 2);
    walkTo(player, -5, 0);
    expect(player.position.x).toBeCloseTo(-5, 0);
    expect(player.position.y).toBeCloseTo(yf, 2);
  });

  it('R-VA-3 (L-6): đang trên thang đi ngang → lan can hai bên chặn, không rơi', () => {
    const { player } = setup();
    start(player, xc, L.zStart + 1.5);
    walkTo(player, xc, zMid);
    const y = player.position.y;
    expect(y).toBeGreaterThan(1);
    walkTo(player, L.x1 + 2, zMid);
    expect(player.position.x).toBeLessThan(L.x1);
    walkTo(player, L.x0 - 1.5, zMid);
    expect(player.position.x).toBeGreaterThan(L.x0);
    expect(player.position.y).toBeCloseTo(y, 1);
  });

  it('R-VA-3 (L-6): dưới đất không lọt vào gầm thang / khe giữa thang và nhà', () => {
    const { player } = setup();
    start(player, L.x1 + 1.5, zMid);
    walkTo(player, L.xWall + 0.3, zMid);
    expect(player.position.x).toBeGreaterThan(L.x1);
    expect(player.position.y).toBeCloseTo(0, 5);
  });

  it('R-VA-3: trên tầng 2 không đi ra ngoài qua cửa giữa, không ra mép hồi ngoài chỗ cầu nối', () => {
    const { player } = setup();
    climb(player);
    walkTo(player, 1, 0);
    walkTo(player, 1, id / 2 + 3);
    expect(player.position.z).toBeLessThan(id / 2);
    expect(player.position.y).toBeCloseTo(yf, 2);
    walkTo(player, L.floorX - 1, 0);
    walkTo(player, L.x1 + 1, 0);
    expect(player.position.x).toBeLessThan(L.floorX + 0.5);
    expect(player.position.y).toBeCloseTo(yf, 2);
  });

  it('R-VA-3: ở tầng 1 đi dưới sàn tầng 2 vẫn ở tầng 1', () => {
    const { player } = setup();
    start(player, 0, id / 2 - 1);
    walkTo(player, -5, 0.5);
    expect(player.position.x).toBeCloseTo(-5, 0);
    expect(player.position.y).toBeCloseTo(plat, 5);
  });

  it('R-VA-3: từ tầng 2 xuống lại mặt đất', () => {
    const { player } = setup();
    climb(player);
    walkTo(player, L.floorX - 1.5, zl);
    walkTo(player, xc, zl);
    walkTo(player, xc, L.zStart + 1);
    expect(player.position.y).toBeCloseTo(0, 5);
  });

  it('R-HUD-2: ở tầng 1 sàn tầng 2 mờ; đứng trên tầng 2 sàn hiện', () => {
    const { scene, room } = setup();
    const low = scene.children[0].children[1];
    const opacity = (): number => {
      let v = 1;
      low.traverse((o) => {
        if (o instanceof THREE.Mesh && !Array.isArray(o.material)) v = Math.min(v, o.material.opacity);
      });
      return v;
    };
    room.update(1, true, plat);
    expect(opacity()).toBeCloseTo(0.15, 5);
    room.update(1, true, yf);
    expect(opacity()).toBe(1);
  });
  it('R-VA-4: tầng 2 có 8 bồ đoàn trước án thư, cùng độ cao sàn tầng 2, nhìn về nam', () => {
    const { room } = setup();
    expect(room.seats).toHaveLength(8);
    for (const s of room.seats ?? []) {
      expect(s.y).toBeCloseTo(yf, 5);
      expect(s.rotY).toBe(0);
    }
  });

  it('R-VA-4: bấm Ngồi gần bồ đoàn chỉ chọn chỗ cùng tầng', () => {
    const { room } = setup();
    const seats = room.seats ?? [];
    const s = seats[0];
    expect(nearestSeat(seats, s.x + 0.8, s.z, 1.2, yf)).toBe(s);
    expect(nearestSeat(seats, s.x + 0.8, s.z, 1.2, plat)).toBeUndefined(); // tầng 1 ngay dưới → ngồi thiền tại chỗ
    expect(nearestSeat(seats, s.x - 2, s.z, 1.2, yf)).toBeUndefined(); // án đầu hàng: phía tây không còn bồ đoàn
  });

  it('R-VA-4: án thư chặn người ở tầng 2, không chặn người ở tầng 1 ngay dưới', () => {
    const { player, room } = setup();
    const s = (room.seats ?? [])[0];
    const deskZ = s.z + 0.7;
    climb(player);
    walkTo(player, s.x, deskZ + 1.2);
    walkTo(player, s.x, deskZ - 1.5); // đi thẳng xuyên qua án
    expect(player.position.z).toBeGreaterThan(deskZ);
    expect(player.position.y).toBeCloseTo(yf, 2);
    start(player, 0, id / 2 - 1);
    walkTo(player, s.x, deskZ + 1.2);
    walkTo(player, s.x, deskZ - 1);
    expect(player.position.z).toBeCloseTo(deskZ - 1, 0);
    expect(player.position.y).toBeCloseTo(plat, 5);
  });
});
