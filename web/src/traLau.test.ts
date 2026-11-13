import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from './collision/colliders';
import { LayeredGround } from './collision/ground';
import { PlayerController } from './player/controller';
import { flightSlope } from './scene/kien_truc/cau_thang';
import { traLau, traLauLayout } from './scene/kien_truc/tra_lau';
import { addWalkIn } from './scene/rooms';
import { nearestSeat } from './zones/seats';
import { DEFAULT_SCENE, type BuildingSpec } from './scene/spec';

// biển hiệu vẽ bằng canvas 2D: Node không có — canvas giả, mọi lệnh vẽ bỏ qua
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : () => {}) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) });

/** Phẩm Minh Các như design/scene/scene.json (19,2 × 11,2, kiến trúc × 1,6), đặt ở gốc toạ độ, mặt trước nhìn +z. */
const style = { ...DEFAULT_SCENE.buildingStyle, heightScale: 1.6 };
const b: BuildingSpec = { id: 'pham-minh-cac', kind: 'tra-lau', x: 0, z: 0, w: 19.2, d: 11.2, title: '品茗閣', roofColor: '#2b5446' };
const { plat, yf, iw, id, stairs: L, slabEdge, eaveRight } = traLauLayout(b, style);
const xc = (L.x0 + L.x1) / 2; // giữa vế thang
const zl = (L.zBack + L.zTop) / 2; // giữa chiếu nghỉ / cầu nối

function setup(): { scene: THREE.Scene; player: PlayerController; room: ReturnType<typeof addWalkIn>; colliders: Colliders } {
  const scene = new THREE.Scene();
  const colliders = new Colliders();
  const room = addWalkIn(scene, colliders, b, style, traLau);
  const root = new THREE.Object3D();
  const facing = new THREE.Object3D();
  root.add(facing);
  const player = new PlayerController({ root, facing, animate: () => {} }, colliders, new LayeredGround(null, room.pads));
  return { scene, player, room, colliders };
}

function walkTo(p: PlayerController, x: number, z: number): void {
  p.moveTarget = new THREE.Vector3(x, 0, z);
  for (let i = 0; i < 60 * 20 && p.moveTarget; i++) p.update(1 / 60, { x: 0, y: 0 }, 0, false);
}

function start(p: PlayerController, x: number, z: number): void {
  p.position.set(x, 0, z);
  p.snapToGround();
}

/** Từ mặt đất trước chân thang (ngoài hồi phải): đi thẳng lên chiếu nghỉ, qua cầu nối vào sàn tầng 2, ra giữa sàn. */
function climb(p: PlayerController): void {
  start(p, xc, L.zStart + 1.5);
  walkTo(p, xc, zl);
  walkTo(p, L.floorX - 1.5, zl);
  walkTo(p, L.floorX - 1.5, -0.2);
}

describe('Trà lâu lên được tầng 2 (Phẩm Minh Các)', () => {
  it('R-VA-3 (L-6): thang thẳng một vế ngoài trời, dốc ≤ 35°', () => {
    expect(flightSlope(L)).toBeLessThanOrEqual(35);
  });

  it('R-VA-3 (L-6): thang áp sát nhà — giữa lan can thang và mép sàn tầng 2 không còn khe hở', () => {
    expect(L.x0 - slabEdge).toBeLessThanOrEqual(0.15); // cầu nối gỗ phủ nốt phần còn lại
    expect(L.x0 - L.xWall).toBeLessThanOrEqual(0.05); // thang sát mép nền
  });

  it('(L-6): mái hiên lửng phía hồi phải lùi vào, không đâm vào thang', () => {
    expect(eaveRight).toBeLessThanOrEqual(L.x0);
  });

  it('R-VA-3: đi từ mặt đất lên thang tới tầng 2, đi về phía tây vẫn ở tầng 2', () => {
    const { player } = setup();
    climb(player);
    expect(player.position.y).toBeCloseTo(yf, 2);
    walkTo(player, -4.5, -0.2);
    expect(player.position.x).toBeCloseTo(-4.5, 0);
    expect(player.position.y).toBeCloseTo(yf, 2);
  });

  it('R-VA-3: tầng 2 thoáng nhưng lan can mặt tiền chặn, không rơi ra ngoài', () => {
    const { player } = setup();
    climb(player);
    walkTo(player, -4.5, -0.2);
    walkTo(player, -4.5, b.d / 2 + 3);
    expect(player.position.z).toBeLessThan(b.d / 2);
    expect(player.position.y).toBeCloseTo(yf, 2);
  });

  it('R-VA-3: ở tầng 1 đi dưới sàn tầng 2 vẫn ở tầng 1; tầng 1 còn đi vào được', () => {
    const { player } = setup();
    start(player, 0, b.d / 2 + 2);
    walkTo(player, 0, b.d / 2 - 1);
    walkTo(player, -4.5, -0.2);
    expect(player.position.x).toBeCloseTo(-4.5, 0);
    expect(player.position.y).toBeCloseTo(plat, 5);
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

  type S = NonNullable<ReturnType<typeof addWalkIn>['seats']>[number];
  /** điểm cách chỗ ngồi 1,5 m theo hướng nhìn nằm ngoài sàn tầng 2 = người ngồi quay ra ngoài */
  const facesOut = (s: S): boolean => {
    const x = s.x + Math.sin(s.rotY) * 1.5;
    const z = s.z + Math.cos(s.rotY) * 1.5;
    return Math.abs(x) > iw / 2 || Math.abs(z) > id / 2;
  };
  /** chỗ đứng trống (nhân vật bán kính 0,5 không bị đẩy) trên sàn tầng 2 */
  const free = (c: Colliders, x: number, z: number): boolean => {
    if (Math.abs(x) > iw / 2 - 0.5 || Math.abs(z) > id / 2 - 0.5) return false;
    const p = { x, z };
    c.resolve(p, 0.5, yf);
    return Math.hypot(p.x - x, p.z - z) < 1e-6;
  };

  it('R-VA-4: tầng 2 trà lâu có 18 chỗ — 2 sập trà (4 chỗ trên sập), 4 ghế đơn quay ra ngoài, bàn dài 6 chỗ, 2 bàn trà đôi', () => {
    const { room } = setup();
    const seats = room.seats ?? [];
    expect(seats).toHaveLength(18);
    const onBed = seats.filter((s) => s.y > yf + 0.1);
    expect(onBed).toHaveLength(4);
    for (const s of onBed) expect(s.y).toBeCloseTo(yf + 0.35, 5);
    for (const s of seats.filter((s) => s.y <= yf + 0.1)) expect(s.y).toBeCloseTo(yf, 5);
    // sập: hai chỗ mỗi sập quay mặt vào nhau (dọc trục x)
    for (const s of onBed) expect(Math.abs(Math.abs(s.rotY) - Math.PI / 2)).toBeLessThan(1e-9);
    const out = seats.filter(facesOut);
    expect(out).toHaveLength(4);
    expect(out.filter((s) => Math.abs(s.rotY) < 1e-9)).toHaveLength(2); // mặt trước: nhìn về nam (+z)
    expect(out.filter((s) => Math.abs(s.rotY + Math.PI / 2) < 1e-9)).toHaveLength(2); // hồi trái: nhìn về tây
  });

  it('R-VA-4: chỗ nào cũng tới được từ cầu nối thang, đứng đó có nút Ngồi đúng chỗ; dải phía đông để trống', () => {
    const { room, colliders } = setup();
    const seats = room.seats ?? [];
    const step = 0.25;
    const key = (i: number, j: number): string => `${i},${j}`;
    const at = (i: number, j: number): [number, number] => [i * step, j * step];
    const startX = Math.round((L.floorX - 1) / step);
    const startZ = Math.round(zl / step);
    expect(free(colliders, ...at(startX, startZ))).toBe(true);
    const seen = new Set([key(startX, startZ)]);
    const queue: [number, number][] = [[startX, startZ]];
    while (queue.length) {
      const [i, j] = queue.pop()!;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = key(i + di, j + dj);
        if (seen.has(k) || !free(colliders, ...at(i + di, j + dj))) continue;
        seen.add(k);
        queue.push([i + di, j + dj]);
      }
    }
    for (const s of seats) {
      let ok = false;
      for (const k of seen) {
        const [x, z] = at(...(k.split(',').map(Number) as [number, number]));
        if (Math.hypot(x - s.x, z - s.z) < 1.2 && nearestSeat(seats, x, z, 1.2, yf) === s) {
          ok = true;
          break;
        }
      }
      expect(ok, `chỗ (${s.x.toFixed(2)}; ${s.z.toFixed(2)})`).toBe(true);
    }
    // lối từ cầu nối dọc mép đông xuống mặt trước không vướng gì
    for (let z = zl; z <= id / 2 - 0.6; z += 0.1) expect(free(colliders, L.floorX - 1, z)).toBe(true);
  });

  it('R-VA-4: ngồi trên sập cao theo mặt sập; điều khiển đi → bước xuống sàn trước sập', () => {
    const { room, player, colliders } = setup();
    const s = (room.seats ?? []).find((q) => q.y > yf + 0.1)!;
    player.position.set(s.x, s.y, s.z);
    player.toggleSit();
    for (let i = 0; i < 30; i++) player.update(1 / 60, { x: 0, y: 0 }, 0, false);
    expect(player.position.y).toBeCloseTo(yf + 0.35, 5);
    expect(player.isSitting).toBe(true);
    for (let i = 0; i < 30; i++) player.update(1 / 60, { x: 0, y: -1 }, 0, false);
    expect(player.isSitting).toBe(false);
    expect(player.position.y).toBeCloseTo(yf, 5);
    expect(free(colliders, player.position.x, player.position.z)).toBe(true);
  });

  it('R-VA-4: chỗ ngồi tầng 2 khác tầng với người ở tầng 1', () => {
    const { room } = setup();
    const seats = room.seats ?? [];
    expect(nearestSeat(seats, seats[0].x + 0.8, seats[0].z, 1.2, plat)).toBeUndefined();
  });
});
