import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from './collision/colliders';
import { LayeredGround } from './collision/ground';
import { aimCamera, eyeFov } from './input/eyeCamera';
import type { XZ } from './collision/gridPath';
import { RAIL_REACH } from './scene/kien_truc/do_pho';
import { MIN_FALLBACK, RAIL_FAR, RAIL_NEAR, STAND_CLEAR } from './scene/kien_truc/tra_lau_phuc_vu';
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
/** dải ứng viên: góc (độ, so hướng nhìn) + khoảng chuẩn — bàn 35–85°, 1,4–1,6 m; ghế lan can (từ mắt) 60–100°, 1,9–2,1 m */
type Band = { a: readonly [number, number]; near: number; far: number };
const TABLE_BAND: Band = { a: [35, 85], near: 1.4, far: 1.6 };
const RAIL_BAND: Band = { a: [60, 100], near: RAIL_NEAR, far: RAIL_FAR };
/** phía `side` (1 phải, −1 trái) có điểm đứng được xa hơn `d` (từ d + 0,02 tới khoảng chuẩn xa nhất mỗi 0,01; góc trong dải
 *  mỗi 5° + mép dải)? */
function farther(f: TeaFloor, seats: readonly SeatXZ[], s: SeatXZ, side: number, band: Band, d: number): boolean {
  const o = origin(s);
  const as: number[] = [];
  for (let a = band.a[0]; a < band.a[1]; a += 5) as.push(a);
  as.push(band.a[1]);
  for (const a of as)
    for (let dd = d + 0.02; dd <= band.far + 1e-9; dd += 0.01) {
      const [x, z] = at(o, side * a, dd);
      if (standFree(f, seats, s, x, z)) return true;
    }
  return false;
}

/** tiểu nhị (chibi) cao 2,1 m (búi tóc); bề ngang thân cả tay ±0,45 m — đo ở ngang ngực */
const BODY_H = 2.1;
const BODY_HALF = 0.45;
const CHEST = 1.0;
/**
 * Nhìn từ mắt người ngồi `s` (gốc `o`, mắt cao `eyeY` trên sàn `y`) tới tiểu nhị đứng ở `p`: quay đầu sang phía tiểu nhị tối
 * đa `yawLimit`, ngẩng / cúi trong [−pitchDown, pitchUp] như lúc ngồi, khung `w × h` (FOV như `ngoiMat.ts` — màn dọc nới
 * dọc cho đủ `minHFov` ngang). Trả: `width` = phần bề ngang thân ở ngang ngực lọt khung (0–1, ở góc ngẩng tốt nhất),
 * `height` = thấy được từ chân (chân phải lọt khung) lên cao bao nhiêu m theo trục giữa thân (0 nếu không thấy chân).
 */
function view(s: SeatXZ, o: { x: number; z: number }, p: XZ, y: number, w: number, h: number): { width: number; height: number; pitch: number } {
  const fp = DEFAULT_SCENE.camera.firstPerson;
  const fov = eyeFov(DEFAULT_SCENE.camera.fov, w / h, fp.minHFov / DEG);
  const cam = new THREE.PerspectiveCamera(fov, w / h, 0.05, 100);
  const eye = new THREE.Vector3(o.x, y + fp.eyeY, o.z);
  const ang = angleFrom(s, o, p) / DEG;
  const turn = Math.sign(ang) * Math.min(fp.yawLimit / DEG, Math.abs(ang));
  const yaw = s.rotY - turn; // phải = yaw giảm (bên phải hướng rotY là rotY − 90°)
  const dx = p[0] - o.x;
  const dz = p[1] - o.z;
  const L = Math.hypot(dx, dz);
  const [px, pz] = [-dz / L, dx / L];
  const inFrame = (q: THREE.Vector3): boolean => {
    const v = q.clone().project(cam);
    return v.z < 1 && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1;
  };
  let best = { width: 0, height: 0, pitch: 0 };
  for (let pd = -fp.pitchDown; pd <= fp.pitchUp + 1e-9; pd += 0.25) {
    aimCamera(cam, eye, yaw, pd / DEG);
    cam.updateMatrixWorld();
    let n = 0;
    for (let k = -BODY_HALF; k <= BODY_HALF + 1e-9; k += 0.01) if (inFrame(new THREE.Vector3(p[0] + px * k, y + CHEST, p[1] + pz * k))) n++;
    const width = n / (Math.round((2 * BODY_HALF) / 0.01) + 1);
    let height = 0;
    if (inFrame(new THREE.Vector3(p[0], y, p[1]))) {
      while (height < BODY_H - 1e-9 && inFrame(new THREE.Vector3(p[0], y + height + 0.01, p[1]))) height += 0.01;
    }
    if (width > best.width + 1e-9 || (width >= best.width - 1e-9 && height > best.height + 1e-9)) best = { width, height: Math.min(height, BODY_H), pitch: pd };
  }
  return best;
}

describe('Mốc phục vụ trà lâu (R-TRA-1)', () => {
  it('R-TRA-1: cả 30 chỗ ngồi đều có chỗ đứng rót, chỗ ngồi gắn mã nhà để tiểu nhị mang tới', () => {
    const { svc, seats } = setup();
    expect(seats).toHaveLength(30);
    expect(svc.seats.filter(Boolean)).toHaveLength(30);
    seats.forEach((s, i) => expect(s.serve).toEqual({ room: b.id, i }));
    expect(svc.seats.filter((s) => s!.floor === 1)).toHaveLength(12);
  });

  it('R-TRA-1: chỗ đứng rót cách chỗ ngồi 1,4–1,6 m (ghế lan can: từ mắt 1,9–2,1 m; chỗ chật: xa nhất có thể), cùng tầng, ngoài vật cản mịn, phía trước – phải; phải < 1,4 m mà trái xa hơn → trước – trái', () => {
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
      const band = rail ? RAIL_BAND : TABLE_BAND;
      expect(d, `chỗ ${i}`).toBeGreaterThanOrEqual(MIN_FALLBACK - 1e-5);
      expect(d, `chỗ ${i}`).toBeLessThanOrEqual(band.far + 1e-5);
      expect(standFree(f, seats, s, ...t.stand), `chỗ ${i}`).toBe(true);
      dists.push(`${i}:${d.toFixed(2)}`);
      const side = Math.sign(t.angle);
      if (d < band.near - 1e-5) {
        // chỗ chật — xa nhất có thể cùng phía; phía kia (nếu là phải) cũng không xa hơn
        expect(farther(f, seats, s, side, band, d), `chỗ ${i} (d ${d.toFixed(2)}) phía ${side}`).toBe(false);
        expect(farther(f, seats, s, -side, band, d), `chỗ ${i} (d ${d.toFixed(2)}): phía ${-side} xa hơn`).toBe(false);
      }
      // đứng trái → phía phải không đạt khoảng chuẩn và không xa bằng chỗ đứng trái
      if (side < 0) expect(farther(f, seats, s, 1, band, Math.min(d, band.near) - 0.02), `chỗ ${i}: phía phải đứng được`).toBe(false);
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

  it('R-TRA-1: ghế lan can — cách mắt 1,9–2,1 m (≈ 2 m), lùi trong sàn chếch phải; quay đầu ≤ 60° thì bề ngang thân lọt khung 900 × 600, thấy từ chân lên — xa nhất / thấy nhiều nhất có thể', () => {
    const { svc, seats } = setup();
    const rails = seats.filter((s) => s.hold === 'lan-can');
    expect(rails).toHaveLength(4);
    const out: string[] = [];
    for (const s of rails) {
      const i = seats.indexOf(s);
      const t = svc.seats[i]!;
      const f = svc.floors[t.floor - 1];
      const o = origin(s);
      const d = Math.hypot(t.stand[0] - o.x, t.stand[1] - o.z);
      expect(d, `chỗ ${i}`).toBeGreaterThanOrEqual(RAIL_NEAR - 1e-5);
      expect(d, `chỗ ${i}`).toBeLessThanOrEqual(RAIL_FAR + 1e-5);
      // lùi vào trong sàn: không ra trước lan can
      const fwd = (t.stand[0] - s.x) * Math.sin(s.rotY) + (t.stand[1] - s.z) * Math.cos(s.rotY);
      expect(fwd, `chỗ ${i}`).toBeLessThan(s.rail!.d - STAND_CLEAR + 1e-6);
      const ang = angleFrom(s, o, t.stand);
      expect(ang, `chỗ ${i}`).toBeGreaterThan(0);
      const land = view(s, o, t.stand, f.y, 900, 600);
      // bề ngang thân (±0,45 m — cả tay, ngang ngực) + chân trong khung khi quay đầu ≤ 60°, ngẩng / cúi trong giới hạn lúc ngồi
      expect(land.width, `chỗ ${i}`).toBe(1);
      // trọn 2,1 m không đạt: lan can ép góc ≥ 80° nên thân lệch giữa khung ~20°, ở 2,1 m cắt 3–7 cm đỉnh búi tóc (cần ~2,4 m)
      expect(land.height, `chỗ ${i}`).toBeGreaterThanOrEqual(2.0);
      // không chỗ đứng được nào (cùng phía, 1,9–2,1 m, góc 60–100°) thấy được cao hơn đáng kể
      let best = 0;
      for (let a = 60; a <= 100; a += 1)
        for (let dd = RAIL_NEAR; dd <= RAIL_FAR + 1e-9; dd += 0.02) {
          const p = at(o, a, dd);
          if (standFree(f, seats, s, ...p)) best = Math.max(best, view(s, o, p, f.y, 900, 600).height);
        }
      expect(land.height, `chỗ ${i}: chỗ khác thấy ${best.toFixed(2)} m`).toBeGreaterThanOrEqual(best - 0.03);
      const port = view(s, o, t.stand, f.y, 390, 844);
      out.push(
        `${i}: ${d.toFixed(2)} m · ${ang.toFixed(0)}° — 900×600 thấy ${land.height.toFixed(2)}/${BODY_H} m (ngẩng ${land.pitch}°), ngang trọn · 390×844 ngang ${Math.round(port.width * 100)}% thân, cao ${port.height.toFixed(2)} m (tốt nhất trong 1,9–2,1: ${best.toFixed(2)} m)`,
      );
    }
    console.log(`R-TRA-1 ghế lan can:\n  ${out.join('\n  ')}`);
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
