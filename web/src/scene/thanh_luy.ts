/**
 * Trường Thành (hồ sơ `docs/tham_khao/truong-thanh.md`, hướng mặt tường X): đoạn tường **đi được** (`ramparts`) — thân
 * gạch đặc, mặt tường lát rộng ~5 m, đoạ khẩu 垛口 răng cưa phía ngoài, vũ tường 宇牆 thấp phía trong; lên bằng mã đạo
 * 馬道 (dốc men mặt trong tường). Va chạm theo độ cao chân (R-VA-1): thân tường chỉ chặn người dưới đất, hai lan can chỉ
 * chặn người đang ở trên mặt tường; lan can trong hở một khe đúng chỗ mã đạo lên tới.
 */
import * as THREE from 'three';
import type { Colliders, YRange } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import { lambert } from './materials';
import type { RampartSpec, SceneSpec } from './spec';
import type { GroundY } from './terrainHeight';

const PARAPET_OUT = 1.8; // đoạ khẩu cao
const PARAPET_IN = 1.1; // vũ tường cao
const PARA_T = 0.5; // dày lan can
const MERLON = 2.2; // một răng
const GAP = 0.6; // khe răng

export interface RampartBox {
  x: number;
  z: number;
  w: number;
  d: number;
  range?: YRange;
}

export interface RampartLayout {
  pads: Pad[];
  boxes: RampartBox[];
}

/**
 * Mặt bằng thuần (không three) của một đoạn tường đi được ở độ cao gốc `base`: tấm mặt tường + tấm dốc mã đạo, và các hộp
 * va chạm có khoảng cao. Đoạn chạy theo trục x hoặc z; phía ngoài (đoạ khẩu) là `outSide` của trục còn lại.
 */
export function rampartLayout(r: RampartSpec, base: number): RampartLayout {
  const alongX = r.from[1] === r.to[1];
  const a0 = Math.min(alongX ? r.from[0] : r.from[1], alongX ? r.to[0] : r.to[1]);
  const a1 = Math.max(alongX ? r.from[0] : r.from[1], alongX ? r.to[0] : r.to[1]);
  const fixed = alongX ? r.from[1] : r.from[0];
  const w = r.width ?? 5;
  const top = base + r.height;
  const out = r.outSide >= 0 ? 1 : -1;
  // hộp theo (dọc trục a, ngang trục c) → thế giới
  const box = (a: number, b: number, c: number, e: number, range?: YRange): RampartBox => {
    const [cx, cz, ww, dd] = alongX ? [(a + b) / 2, (c + e) / 2, b - a, Math.abs(e - c)] : [(c + e) / 2, (a + b) / 2, Math.abs(e - c), b - a];
    return { x: cx, z: cz, w: ww, d: dd, range };
  };
  const rect = (a: number, b: number, c: number, e: number): Omit<Pad, 'y'> =>
    alongX
      ? { minX: a, maxX: b, minZ: Math.min(c, e), maxZ: Math.max(c, e) }
      : { minX: Math.min(c, e), maxX: Math.max(c, e), minZ: a, maxZ: b };
  const pads: Pad[] = [{ ...rect(a0, a1, fixed - w / 2, fixed + w / 2), y: top }];
  const onTop: YRange = { minY: top - 0.5 };
  const below: YRange = { maxY: top - 0.5 };
  const boxes: RampartBox[] = [box(a0, a1, fixed - w / 2, fixed + w / 2, below)];
  // lan can ngoài (đoạ khẩu) cả đoạn
  const outC = fixed + out * (w / 2 - PARA_T / 2);
  boxes.push(box(a0, a1, outC - PARA_T / 2, outC + PARA_T / 2, onTop));
  // lan can trong, trừ khe mã đạo
  const inC = fixed - out * (w / 2 - PARA_T / 2);
  const gaps = (r.ramps ?? []).map((rp) => [rp.at - (rp.width ?? 3) / 2, rp.at + (rp.width ?? 3) / 2] as [number, number]).sort((p, q) => p[0] - q[0]);
  let s = a0;
  for (const [g0, g1] of gaps) {
    if (g0 > s) boxes.push(box(s, g0, inC - PARA_T / 2, inC + PARA_T / 2, onTop));
    s = Math.max(s, g1);
  }
  if (s < a1) boxes.push(box(s, a1, inC - PARA_T / 2, inC + PARA_T / 2, onTop));
  // mã đạo: dốc men mặt trong, đầu trên tại `at` (chạm khe), đi xuống theo `dir` dài `length`
  for (const rp of r.ramps ?? []) {
    const rw = rp.width ?? 3;
    const len = rp.length ?? 12;
    const c0 = fixed - out * (w / 2);
    const c1 = c0 - out * rw;
    const lo = rp.at + rp.dir * len; // đầu dưới
    // đầu trên lùi vào khe: đoạn dọc từ (at − rw/2 … at + rw/2) phía khe nằm ngang tầm mặt tường
    const topEnd = rp.at - rp.dir * (rw / 2);
    const ramp = { ...rect(Math.min(topEnd, lo), Math.max(topEnd, lo), c0, c1), y: top, ramp: { axis: alongX ? 'x' : 'z', at0: rp.at + rp.dir * (rw / 2), at1: lo, y1: base } } as Pad;
    pads.push(ramp);
    // lan can ngoài mép mã đạo (chặn cả người dưới đất lẫn người trên dốc)
    const rail = c1 - out * 0.15;
    boxes.push(box(Math.min(topEnd, lo), Math.max(topEnd, lo), rail - 0.15, rail + 0.15));
    // lan can đầu chiếu nghỉ (phía không có dốc): chặn rơi xuống đất
    boxes.push(box(topEnd - 0.15, topEnd + 0.15, Math.min(c0, c1), Math.max(c0, c1)));
  }
  return { pads, boxes };
}

/** Dựng các đoạn tường đi được; trả về tấm đi được cho `LayeredGround`. */
export function addRamparts(scene: THREE.Scene, colliders: Colliders, list: RampartSpec[], walls: SceneSpec['walls'], groundY: GroundY = () => 0): Pad[] {
  const pads: Pad[] = [];
  const brick = lambert(walls.color);
  const cap = lambert(walls.capColor);
  const paving = lambert('#9a9890');
  for (const r of list) {
    const alongX = r.from[1] === r.to[1];
    const cx = (r.from[0] + r.to[0]) / 2;
    const cz = (r.from[1] + r.to[1]) / 2;
    const base = groundY(cx, cz);
    const layout = rampartLayout(r, base);
    pads.push(...layout.pads);
    for (const b of layout.boxes) colliders.add(b.x, b.z, b.w, b.d, b.range?.maxY !== undefined ? r.height : 0, b.range);
    // hình: dựng cục bộ (dọc x, ngoài = +z) rồi quay
    const len = Math.abs(alongX ? r.to[0] - r.from[0] : r.to[1] - r.from[1]);
    const w = r.width ?? 5;
    const out = r.outSide >= 0 ? 1 : -1;
    const g = new THREE.Group();
    g.position.set(cx, base, cz);
    g.rotation.y = alongX ? (out > 0 ? 0 : Math.PI) : out > 0 ? Math.PI / 2 : -Math.PI / 2;
    const flip = alongX ? (out > 0 ? 1 : -1) : out > 0 ? -1 : 1; // trục dọc cục bộ so với trục thế giới
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number): void => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      g.add(m);
    };
    add(new THREE.BoxGeometry(len, r.height, w), brick, 0, r.height / 2, 0);
    add(new THREE.BoxGeometry(len, 0.08, w - 2 * PARA_T), paving, 0, r.height + 0.04, 0);
    // đoạ khẩu: răng + khe, có lỗ châu mai (tối)
    const n = Math.floor(len / (MERLON + GAP));
    add(new THREE.BoxGeometry(len, 0.9, PARA_T), brick, 0, r.height + 0.45, w / 2 - PARA_T / 2);
    for (let i = 0; i < n; i++) {
      const x = -len / 2 + (i + 0.5) * (len / n);
      add(new THREE.BoxGeometry(len / n - GAP, PARAPET_OUT - 0.9, PARA_T), brick, x, r.height + 0.9 + (PARAPET_OUT - 0.9) / 2, w / 2 - PARA_T / 2);
      add(new THREE.BoxGeometry(len / n - GAP + 0.1, 0.12, PARA_T + 0.1), cap, x, r.height + PARAPET_OUT + 0.06, w / 2 - PARA_T / 2);
    }
    // vũ tường (trong) trừ khe mã đạo
    const gaps = (r.ramps ?? []).map((rp) => {
      const local = (rp.at - (alongX ? cx : cz)) * flip;
      return [local - (rp.width ?? 3) / 2, local + (rp.width ?? 3) / 2] as [number, number];
    }).sort((p, q) => p[0] - q[0]);
    let s = -len / 2;
    for (const [g0, g1] of [...gaps, [len / 2, len / 2] as [number, number]]) {
      if (g0 > s + 0.05) add(new THREE.BoxGeometry(g0 - s, PARAPET_IN, PARA_T), brick, (s + g0) / 2, r.height + PARAPET_IN / 2, -(w / 2 - PARA_T / 2));
      s = Math.max(s, g1);
    }
    // mã đạo: khối nêm (dốc) men mặt trong + lan can ngoài
    for (const rp of r.ramps ?? []) {
      const rw = rp.width ?? 3;
      const rl = rp.length ?? 12;
      const at = (rp.at - (alongX ? cx : cz)) * flip;
      const dir = rp.dir * flip;
      const L = rl - rw / 2; // phần dốc (chiếu nghỉ rw × rw ngay khe)
      const landing = new THREE.Mesh(new THREE.BoxGeometry(rw, r.height, rw), brick);
      landing.position.set(at, r.height / 2, -w / 2 - rw / 2);
      g.add(landing);
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(L, 0);
      shape.lineTo(0, r.height);
      shape.closePath();
      const wedge = new THREE.ExtrudeGeometry(shape, { depth: rw, bevelEnabled: false });
      // hình nêm: x 0 (đầu trên) → rl (đầu dưới), đùn theo z
      const mesh = new THREE.Mesh(wedge, brick);
      mesh.scale.x = dir >= 0 ? 1 : -1;
      mesh.position.set(at + (dir >= 0 ? rw / 2 : -rw / 2), 0, -w / 2 - rw);
      g.add(mesh);
      const top = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.06, rw), paving);
      top.position.set(at, r.height + 0.03, -w / 2 - rw / 2);
      g.add(top);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(rl + rw / 2, 0.9, 0.3), cap);
      rail.position.set(at + (dir * (rl + rw / 2)) / 2 - (dir * rw) / 4, r.height * 0.5 + 0.45, -w / 2 - rw - 0.15);
      rail.rotation.z = -Math.atan2(r.height, rl) * dir;
      g.add(rail);
    }
    scene.add(g);
  }
  return pads;
}
