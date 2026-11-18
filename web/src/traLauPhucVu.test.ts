import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from './collision/colliders';
import { LayeredGround } from './collision/ground';
import type { XZ } from './collision/gridPath';
import { RAIL_REACH } from './scene/kien_truc/do_pho';
import { MIN_FALLBACK, STAND_CLEAR } from './scene/kien_truc/tra_lau_phuc_vu';
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
const DEG = 180 / Math.PI;
/** chỗ tiểu nhị (đặc tả cảnh `npcs` → `tieu-nhi`) */
const HOME: XZ = [42.1, -36];
const { plat, yf } = traLauLayout(b, style);

function setup() {
  const colliders = new Colliders();
  const room = addWalkIn(new THREE.Scene(), colliders, b, style, traLau);
  return { room, colliders, ground: new LayeredGround(null, room.pads), svc: room.service!, seats: room.seats! };
}

/** điểm ở góc `deg` (so hướng nhìn, dương = phải), cách chỗ ngồi `d` m */
function at(s: { x: number; z: number; rotY: number }, deg: number, d: number): XZ {
  const a = deg / DEG;
  const fx = Math.sin(s.rotY);
  const fz = Math.cos(s.rotY);
  const rx = -Math.cos(s.rotY);
  const rz = Math.sin(s.rotY);
  return [s.x + (fx * Math.cos(a) + rx * Math.sin(a)) * d, s.z + (fz * Math.cos(a) + rz * Math.sin(a)) * d];
}
/** đứng được: trong sàn (cách mép ≥ STAND_CLEAR), cách vật cản mịn ≥ STAND_CLEAR, cách chỗ ngồi khác ≥ 0,5 m */
function standFree(f: TeaFloor, seats: readonly { x: number; z: number }[], me: object, x: number, z: number): boolean {
  const m = STAND_CLEAR - 1e-9;
  if (x < f.bounds.minX + m || x > f.bounds.maxX - m || z < f.bounds.minZ + m || z > f.bounds.maxZ - m) return false;
  if (clearanceAt(f, x, z) < m) return false;
  return !seats.some((o) => o !== me && Math.hypot(o.x - x, o.z - z) < 0.5 - 1e-9);
}

const inside = (f: TeaFloor, x: number, z: number): boolean => x >= f.bounds.minX && x <= f.bounds.maxX && z >= f.bounds.minZ && z <= f.bounds.maxZ;

type SeatXZ = { x: number; z: number; rotY: number; hold?: string; rail?: { d: number; h: number } };
/** gốc đo: chỗ ngồi — ghế lan can: mắt người ngồi nhoài tới lan can (`ngoiMat.ts`: trước chỗ ngồi max(eyeFwd, rail.d − RAIL_REACH)) */
function origin(s: SeatXZ): { x: number; z: number; rotY: number } {
  const k = s.hold === 'lan-can' && s.rail ? Math.max(DEFAULT_SCENE.camera.firstPerson.eyeFwd, s.rail.d - RAIL_REACH) : 0;
  return { x: s.x + Math.sin(s.rotY) * k, z: s.z + Math.cos(s.rotY) * k, rotY: s.rotY };
}
/** góc (độ) của điểm `p` nhìn từ `o` so với hướng nhìn của chỗ ngồi `s` — dương = phải */
function angleFrom(s: SeatXZ, o: { x: number; z: number }, p: XZ): number {
  const vx = p[0] - o.x;
  const vz = p[1] - o.z;
  return Math.atan2(-Math.cos(s.rotY) * vx + Math.sin(s.rotY) * vz, Math.sin(s.rotY) * vx + Math.cos(s.rotY) * vz) * DEG;
}
/** dải góc ứng viên (độ, so hướng nhìn): bàn 35–85°, ghế lan can (từ mắt) 60–82° */
const TABLE_BAND = [35, 85] as const;
const RAIL_BAND = [60, 82] as const;
/** phía `side` (1 phải, −1 trái) có điểm đứng được xa hơn `d` (từ d + 0,02 tới 1,6 m mỗi 0,01; góc trong dải mỗi 5° + mép dải)? */
function farther(f: TeaFloor, seats: readonly SeatXZ[], s: SeatXZ, side: number, band: readonly [number, number], d: number): boolean {
  const o = origin(s);
  const as: number[] = [];
  for (let a = band[0]; a < band[1]; a += 5) as.push(a);
  as.push(band[1]);
  for (const a of as)
    for (let dd = d + 0.02; dd <= 1.6 + 1e-9; dd += 0.01) {
      const [x, z] = at(o, side * a, dd);
      if (standFree(f, seats, s, x, z)) return true;
    }
  return false;
}

describe('Mốc phục vụ trà lâu (R-TRA-1)', () => {
  it('R-TRA-1: cả 30 chỗ ngồi đều có chỗ đứng rót, chỗ ngồi gắn mã nhà để tiểu nhị mang tới', () => {
    const { svc, seats } = setup();
    expect(seats).toHaveLength(30);
    expect(svc.seats.filter(Boolean)).toHaveLength(30);
    seats.forEach((s, i) => expect(s.serve).toEqual({ room: b.id, i }));
    expect(svc.seats.filter((s) => s!.floor === 1)).toHaveLength(12);
  });

  it('R-TRA-1: chỗ đứng rót cách chỗ ngồi 1,4–1,6 m (chỗ chật: xa nhất có thể), cùng tầng, ngoài vật cản mịn, phía trước – phải; phải < 1,4 m mà trái xa hơn → trước – trái', () => {
    const { svc, seats } = setup();
    const angles: string[] = [];
    const dists: string[] = [];
    seats.forEach((s, i) => {
      const t = svc.seats[i]!;
      const f = svc.floors[t.floor - 1];
      expect(Math.abs(f.y - (s.y < yf - 1 ? plat : yf)) < 1e-9).toBe(true);
      const rail = s.hold === 'lan-can';
      const o = origin(s); // ghế lan can: tính từ mắt
      const d = Math.hypot(t.stand[0] - o.x, t.stand[1] - o.z);
      expect(d, `chỗ ${i}`).toBeGreaterThanOrEqual(MIN_FALLBACK - 1e-5);
      expect(d, `chỗ ${i}`).toBeLessThanOrEqual(1.6 + 1e-5);
      expect(standFree(f, seats, s, ...t.stand), `chỗ ${i}`).toBe(true);
      dists.push(`${i}:${d.toFixed(2)}`);
      const band = rail ? RAIL_BAND : TABLE_BAND;
      const side = Math.sign(t.angle);
      if (d < 1.4 - 1e-5) {
        // chỗ chật — xa nhất có thể cùng phía; phía kia (nếu là phải) cũng không xa hơn
        expect(farther(f, seats, s, side, band, d), `chỗ ${i} (d ${d.toFixed(2)}) phía ${side}`).toBe(false);
        expect(farther(f, seats, s, -side, band, d), `chỗ ${i} (d ${d.toFixed(2)}): phía ${-side} xa hơn`).toBe(false);
      }
      // đứng trái → phía phải không đạt 1,4 m và không xa bằng chỗ đứng trái
      if (side < 0) expect(farther(f, seats, s, 1, band, Math.min(d, 1.4) - 0.02), `chỗ ${i}: phía phải đứng được`).toBe(false);
      // góc thật trong cảnh so với hướng nhìn từ chỗ ngồi: dương = bên phải người ngồi
      expect(angleFrom(s, s, t.stand)).toBeCloseTo(t.angle, 2);
      const ang = angleFrom(s, o, t.stand);
      angles.push(`${i}:${Math.round(ang)}°`);
      expect(Math.abs(ang), `chỗ ${i}`).toBeLessThan(90); // phía trước (ghế lan can: trước mắt)
      // quay mặt về chỗ ngồi
      const vx = t.stand[0] - s.x;
      const vz = t.stand[1] - s.z;
      expect(Math.abs(Math.atan2(Math.sin(t.face - Math.atan2(-vx, -vz)), Math.cos(t.face - Math.atan2(-vx, -vz))))).toBeLessThan(1e-6);
    });
    // trái chỉ ở chỗ phía phải không đủ: 2 chỗ sập quay lưng ra tường + 2 chỗ đầu bàn dài mà bên phải là ghế cạnh
    const left = seats.flatMap((_, i) => (svc.seats[i]!.angle < 0 ? [i] : []));
    expect(left, angles.join(' ')).toEqual([13, 15, 21, 24]);
    // chỉ 2 chỗ giữa bàn dài (ghế cạnh cả hai bên) chưa đủ 1,4 m
    expect(dists.filter((q) => Number(q.split(':')[1]) >= 1.4 - 1e-5).length, dists.join(' ')).toBeGreaterThanOrEqual(28);
    console.log(`R-TRA-1 góc chỗ đứng rót (lan can: từ mắt): ${angles.join(' ')}`);
    console.log(`R-TRA-1 khoảng chỗ đứng rót (m, lan can: từ mắt): ${dists.join(' ')}`);
  });

  it('R-TRA-1: ghế lan can — cách mắt 1,4–1,6 m, lùi trong sàn chếch phải; quay đầu sang phải ≤ 60° thì cả bề ngang thân tiểu nhị lọt khung, thấy cả chân', () => {
    const { svc, seats } = setup();
    const fp = DEFAULT_SCENE.camera.firstPerson;
    const vHalf = DEFAULT_SCENE.camera.fov / 2 / DEG; // khung 900 × 600: FOV dọc 55°
    const hHalf = Math.atan(Math.tan(vHalf) * (900 / 600));
    const rails = seats.filter((s) => s.hold === 'lan-can');
    expect(rails).toHaveLength(4);
    for (const s of rails) {
      const i = seats.indexOf(s);
      const t = svc.seats[i]!;
      const o = origin(s);
      const d = Math.hypot(t.stand[0] - o.x, t.stand[1] - o.z);
      expect(d, `chỗ ${i}`).toBeGreaterThanOrEqual(1.4 - 1e-5);
      expect(d, `chỗ ${i}`).toBeLessThanOrEqual(1.6 + 1e-5);
      // lùi vào trong sàn: không ra trước lan can, gần chỗ ngồi theo hướng nhìn hơn lan can
      const fwd = (t.stand[0] - s.x) * Math.sin(s.rotY) + (t.stand[1] - s.z) * Math.cos(s.rotY);
      expect(fwd, `chỗ ${i}`).toBeLessThan(s.rail!.d - STAND_CLEAR + 1e-6);
      const ang = angleFrom(s, o, t.stand) / DEG; // rad, dương = phải
      expect(ang, `chỗ ${i}`).toBeGreaterThan(0);
      // quay đầu tối đa yawLimit sang phải: cả bề ngang thân (±0,45 m — cả tay) trong khung
      const yaw = Math.min(fp.yawLimit / DEG, ang);
      const half = Math.atan(0.45 / d);
      expect(ang + half, `chỗ ${i}: mép thân ${((ang + half) * DEG).toFixed(0)}° > ${((yaw + hHalf) * DEG).toFixed(0)}°`).toBeLessThanOrEqual(yaw + hHalf);
      expect(ang - half).toBeGreaterThanOrEqual(yaw - hHalf);
      // chân trong khung khi nhìn cúi như chỗ ngồi (pitch.seat)
      const feet = Math.atan(fp.eyeY / d);
      expect(feet, `chỗ ${i}`).toBeLessThanOrEqual(-fp.pitch.seat / DEG + vHalf);
    }
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
