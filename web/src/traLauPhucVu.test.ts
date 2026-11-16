import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from './collision/colliders';
import { LayeredGround } from './collision/ground';
import type { XZ } from './collision/gridPath';
import { STAND_CLEAR } from './scene/kien_truc/tra_lau_phuc_vu';
import { traLau, traLauLayout } from './scene/kien_truc/tra_lau';
import { clearanceAt } from './scene/routeCheck';
import { addWalkIn } from './scene/rooms';
import { DEFAULT_SCENE, type BuildingSpec } from './scene/spec';
import { PATH_CLEAR, polyline, teaPath, type TeaFloor } from './scene/teaPath';

// biển hiệu vẽ bằng canvas 2D: Node không có — canvas giả, mọi lệnh vẽ bỏ qua
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : () => {}) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) });

/** Phẩm Minh Các đúng như design/scene/scene.json: (37; −36), 19,2 × 11,2, mặt tiền nhìn tây (rotY 270), kiến trúc × 1,6. */
const style = { ...DEFAULT_SCENE.buildingStyle, heightScale: 1.6 };
const b: BuildingSpec = { id: 'pham-minh-cac', kind: 'tra-lau', x: 37, z: -36, w: 19.2, d: 11.2, title: 'Trà lâu', roofColor: '#2b5446', rotY: 270 };
/** chỗ tiểu nhị (đặc tả cảnh `npcs` → `tieu-nhi`) */
const HOME: XZ = [42.1, -36];
const { plat, yf } = traLauLayout(b, style);

function setup() {
  const colliders = new Colliders();
  const room = addWalkIn(new THREE.Scene(), colliders, b, style, traLau);
  return { room, colliders, ground: new LayeredGround(null, room.pads), svc: room.service!, seats: room.seats! };
}

const inside = (f: TeaFloor, x: number, z: number): boolean => x >= f.bounds.minX && x <= f.bounds.maxX && z >= f.bounds.minZ && z <= f.bounds.maxZ;
const DEG = 180 / Math.PI;

describe('Mốc phục vụ trà lâu (R-TRA-1)', () => {
  it('R-TRA-1: cả 30 chỗ ngồi đều có chỗ đứng rót, chỗ ngồi gắn mã nhà để tiểu nhị mang tới', () => {
    const { svc, seats } = setup();
    expect(seats).toHaveLength(30);
    expect(svc.seats.filter(Boolean)).toHaveLength(30);
    seats.forEach((s, i) => expect(s.serve).toEqual({ room: b.id, i }));
    expect(svc.seats.filter((s) => s!.floor === 1)).toHaveLength(12);
  });

  it('R-TRA-1: chỗ đứng rót cách chỗ ngồi 0,8–1,2 m, cùng tầng, ngoài vật cản mịn, phía trước – phải (ghế lan can: bên phải)', () => {
    const { svc, seats } = setup();
    const angles: string[] = [];
    seats.forEach((s, i) => {
      const t = svc.seats[i]!;
      const f = svc.floors[t.floor - 1];
      expect(Math.abs(f.y - (s.y < yf - 1 ? plat : yf)) < 1e-9).toBe(true);
      const d = Math.hypot(t.stand[0] - s.x, t.stand[1] - s.z);
      expect(d).toBeGreaterThanOrEqual(0.8 - 1e-5);
      expect(d).toBeLessThanOrEqual(1.2 + 1e-5);
      expect(inside(f, ...t.stand)).toBe(true);
      expect(clearanceAt(f, ...t.stand)).toBeGreaterThanOrEqual(STAND_CLEAR - 1e-9);
      // góc thật trong cảnh so với hướng nhìn: dương = bên phải người ngồi
      const fx = Math.sin(s.rotY);
      const fz = Math.cos(s.rotY);
      const vx = t.stand[0] - s.x;
      const vz = t.stand[1] - s.z;
      const right = -Math.cos(s.rotY) * vx + Math.sin(s.rotY) * vz;
      const ang = Math.atan2(right, fx * vx + fz * vz) * DEG;
      expect(ang).toBeCloseTo(t.angle, 2);
      if (s.hold === 'lan-can') expect(Math.abs(ang - 90)).toBeLessThanOrEqual(20);
      angles.push(`${i}:${Math.round(ang)}°`);
      // quay mặt về chỗ ngồi
      expect(Math.abs(Math.atan2(Math.sin(t.face - Math.atan2(-vx, -vz)), Math.cos(t.face - Math.atan2(-vx, -vz))))).toBeLessThan(1e-6);
    });
    // phía trước (|góc| < 90°, trừ lan can), bên phải trừ chỗ bị chắn (sập: nửa quay lưng ra tường sau)
    const left = seats.filter((_, i) => svc.seats[i]!.angle < 0);
    for (const s of seats.filter((q) => q.hold !== 'lan-can')) expect(Math.abs(svc.seats[seats.indexOf(s)]!.angle)).toBeLessThan(90);
    expect(left.length, angles.join(' ')).toBeLessThanOrEqual(2);
    console.log(`R-TRA-1 góc chỗ đứng rót: ${angles.join(' ')}`);
  });

  it('R-TRA-1: cửa, mốc thang nằm trên nền đi được; cửa ở gian phía hồi phải (nam), đầu cầu nối trên sàn tầng 2', () => {
    const { svc, ground } = setup();
    const yDoor = ground.heightAt(...svc.door);
    expect(yDoor).toBeGreaterThanOrEqual(0);
    expect(yDoor).toBeLessThanOrEqual(plat);
    expect(svc.door[0]).toBeLessThan(b.x - b.d / 2); // trước mặt tiền (phía tây)
    expect(svc.door[1]).toBeGreaterThan(b.z); // gian phía nam
    const top = svc.stairs[svc.stairs.length - 1];
    expect(ground.heightAt(top[0], top[1], yf)).toBeCloseTo(yf, 5);
    expect(inside(svc.floors[1], ...top)).toBe(true);
  });
});

describe('Đường tiểu nhị mang trà (R-TRA-1)', () => {
  it('R-TRA-1: cả 30 chỗ có đường; cách vật cản ≥ 0,3 (sau quầy, chặng cuối ≥ 0,2); mặt đất liền, không bậc cao; tầng 1 ≤ 15 m, tầng 2 ≤ 60 m', () => {
    const { svc, colliders, ground } = setup();
    const lens: string[] = [];
    svc.seats.forEach((t, i) => {
      const pts = teaPath(svc, i, HOME);
      expect(pts, `chỗ ${i}`).not.toBeNull();
      const p = pts!;
      expect(p[0]).toEqual(HOME);
      expect(Math.hypot(p[p.length - 1][0] - t!.stand[0], p[p.length - 1][1] - t!.stand[1])).toBeLessThan(1e-9);
      const L = polyline(p).length;
      lens.push(`${i}:${L.toFixed(1)}`);
      expect(L).toBeLessThanOrEqual(t!.floor === 1 ? 15 : 60);
      let y = ground.heightAt(...HOME);
      for (let k = 1; k < p.length; k++) {
        const [ax, az] = p[k - 1];
        const [bx, bz] = p[k];
        const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.25));
        const tight = k <= svc.behind[0].length || k === p.length - 1; // sau quầy · chặng cuối tới chỗ rót
        for (let j = 1; j <= n; j++) {
          const x = ax + ((bx - ax) * j) / n;
          const z = az + ((bz - az) * j) / n;
          const ny = ground.heightAt(x, z, y);
          expect(Number.isFinite(ny)).toBe(true);
          expect(Math.abs(ny - y), `chỗ ${i} đoạn ${k} (${x.toFixed(2)}; ${z.toFixed(2)})`).toBeLessThanOrEqual(0.35);
          y = ny;
          const f = svc.floors.find((q) => inside(q, x, z) && Math.abs(q.y - y) < 0.5);
          const c = f ? clearanceAt(f, x, z) : clearanceAt(colliders, x, z, y);
          expect(c, `chỗ ${i} đoạn ${k} (${x.toFixed(2)}; ${z.toFixed(2)}; y ${y.toFixed(2)})`).toBeGreaterThanOrEqual((tight ? STAND_CLEAR : PATH_CLEAR) - 1e-6);
        }
      }
      expect(y).toBeCloseTo(svc.floors[t!.floor - 1].y, 5); // tới đúng tầng chỗ ngồi
    });
    console.log(`R-TRA-1 dài đường (m): ${lens.join(' ')}`);
  });
});
