/**
 * Cầu (R-VA-1): đi được trên mặt cầu (tấm `Pad` dốc như bậc hí đài), lan can hai bên chặn.
 * - `vom` cầu vòm đá (拱橋): lưng gù hai dốc thẳng lên giữa cầu cao `rise`, thành cầu đặc có lỗ vòm bán nguyệt.
 * - `da` cầu đá phẳng (金水橋): mặt cầu cao `rise` (≤ bước chân), lan can cẩm thạch trụ đầu sen.
 * - `treo` cầu treo (吊橋): ván gỗ trên mặt phẳng hai đầu, cột gỗ bốn góc, dây thừng võng làm tay vịn.
 * - `tau` cầu tàu ra mây (Bồng Lai): đầu −z trên đất, mặt đá phẳng hẫng trên trụ, lan can cả hai bên lẫn đầu xa.
 * Toạ độ cục bộ: cầu chạy dọc z, tâm ở (x, z), đáy = mặt đất cao hơn của hai đầu.
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import type { Style } from './buildings';
import { lambert } from './materials';
import { bridgeRise, rotateXZ, type BridgeSpec } from './spec';
import type { GroundY } from './terrainHeight';

/** Bề dày lan can (m) — hộp va chạm hai bên nằm trong bề rộng cầu. */
export const RAIL = 0.3;
const RAIL_H = 0.9;

const rot = (b: BridgeSpec): number => (((b.rotY ?? 0) % 360) + 360) % 360;

/** Điểm cục bộ (dx dọc ngang cầu, dz dọc cầu) → toạ độ thế giới. */
function world(b: BridgeSpec, dx: number, dz: number): [number, number] {
  const [ox, oz] = rotateXZ(dx, dz, rot(b));
  return [b.x + ox, b.z + oz];
}

/** Hộp thẳng trục bao chữ nhật cục bộ [x0, x1] × [z0, z1]. */
function worldBox(b: BridgeSpec, x0: number, x1: number, z0: number, z1: number): { minX: number; maxX: number; minZ: number; maxZ: number } {
  const pts = [world(b, x0, z0), world(b, x1, z1)];
  return {
    minX: Math.min(pts[0][0], pts[1][0]),
    maxX: Math.max(pts[0][0], pts[1][0]),
    minZ: Math.min(pts[0][1], pts[1][1]),
    maxZ: Math.max(pts[0][1], pts[1][1]),
  };
}

/** Độ cao giữa cầu so với hai đầu. */
export function riseOf(b: BridgeSpec): number {
  return b.rise ?? bridgeRise(b.kind, b.length);
}

/** Đáy cầu: mặt đất cao hơn của hai đầu. */
export function bridgeBase(b: BridgeSpec, groundY: GroundY): number {
  const h = b.length / 2;
  if (b.kind === 'tau') return groundY(...world(b, 0, -h));
  return Math.max(groundY(...world(b, 0, -h)), groundY(...world(b, 0, h)));
}

/**
 * Tấm đi được trên cầu. Vòm: hai tấm dốc (đầu → giữa, giữa → đầu); đá: một tấm phẳng cao `rise`; treo: phẳng ở đáy.
 * Thuần, không three.
 */
export function bridgePads(b: BridgeSpec, base: number): Pad[] {
  const w = b.width / 2;
  const h = b.length / 2;
  const rise = riseOf(b);
  if (b.kind !== 'vom') return [{ ...worldBox(b, -w, w, -h, h), y: base + (b.kind === 'da' ? rise : 0) }];
  const axis = rot(b) % 180 === 0 ? 'z' : 'x';
  const along = (dz: number): number => {
    const [x, z] = world(b, 0, dz);
    return axis === 'z' ? z : x;
  };
  return [
    { ...worldBox(b, -w, w, -h, 0), y: base, ramp: { axis, at0: along(-h), at1: along(0), y1: base + rise } },
    { ...worldBox(b, -w, w, 0, h), y: base + rise, ramp: { axis, at0: along(0), at1: along(h), y1: base } },
  ];
}

/** Hộp va chạm lan can hai bên (tâm x, z, rộng, sâu). Thuần. */
export function bridgeRails(b: BridgeSpec): { x: number; z: number; w: number; d: number }[] {
  const w = b.width / 2;
  const h = b.length / 2;
  return [-1, 1].map((s) => {
    const r = worldBox(b, s * w - (s > 0 ? RAIL : 0), s * w + (s < 0 ? RAIL : 0), -h, h);
    return { x: (r.minX + r.maxX) / 2, z: (r.minZ + r.maxZ) / 2, w: r.maxX - r.minX, d: r.maxZ - r.minZ };
  });
}

/** Thành cầu vòm (mặt phẳng yz cục bộ, đùn theo x): trên theo lưng cầu, dưới có lỗ vòm bán nguyệt. */
function archSide(len: number, rise: number, depth: number, sunk: number): THREE.BufferGeometry {
  const h = len / 2;
  const r = Math.min(h * 0.62, rise); // đỉnh lỗ vòm (−0,3 + r) thấp hơn mặt cầu giữa cầu ≥ 0,35 m
  const foot = -0.3 - sunk; // chân thành cầu: chạm mặt nước (kênh có kè thì thấp hơn)
  const s = new THREE.Shape();
  s.moveTo(-h, foot);
  s.lineTo(-r, foot);
  s.lineTo(-r, -0.3);
  s.absarc(0, -0.3, r, Math.PI, 0, true);
  s.lineTo(r, foot);
  s.lineTo(h, foot);
  s.lineTo(h, 0.05);
  s.lineTo(0, rise + 0.05);
  s.lineTo(-h, 0.05);
  s.closePath();
  // hình vẽ trong mặt xy (x = dọc cầu) → quay để x hình → z cục bộ
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 10 })
    .translate(0, 0, -depth / 2)
    .rotateY(-Math.PI / 2);
}

/** Tấm dốc dài `len` từ (z0, y0) tới (z1, y1), rộng `w`, dày `t`, tâm x. */
function slab(w: number, t: number, z0: number, y0: number, z1: number, y1: number, x: number, mat: THREE.Material): THREE.Mesh {
  const len = Math.hypot(z1 - z0, y1 - y0);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, t, len), mat);
  m.position.set(x, (y0 + y1) / 2, (z0 + z1) / 2);
  m.rotation.x = -Math.atan2(y1 - y0, z1 - z0);
  return m;
}

function vom(g: THREE.Group, b: BridgeSpec, style: Style): void {
  const h = b.length / 2;
  const rise = riseOf(b);
  const stone = lambert(style.stone);
  g.add(new THREE.Mesh(archSide(b.length, rise, b.width, b.sunk ?? 0), stone));
  const deck = lambert(style.path);
  g.add(slab(b.width, 0.12, -h, 0.08, 0, rise + 0.08, 0, deck), slab(b.width, 0.12, 0, rise + 0.08, h, 0.08, 0, deck));
  for (const s of [-1, 1]) {
    const x = s * (b.width / 2 - RAIL / 2);
    g.add(slab(RAIL, RAIL_H * 0.7, -h, RAIL_H * 0.35, 0, rise + RAIL_H * 0.35, x, stone));
    g.add(slab(RAIL, RAIL_H * 0.7, 0, rise + RAIL_H * 0.35, h, RAIL_H * 0.35, x, stone));
  }
}

function da(g: THREE.Group, b: BridgeSpec, style: Style): void {
  const h = b.length / 2;
  const y = riseOf(b);
  const marble = lambert('#efe9dc');
  const foot = 0.5 + (b.sunk ?? 0);
  if (b.arch === 'vuong') {
    // lòng cầu rỗng: mặt cầu dày 0,4 trên hai mố đá ở hai đầu → lỗ vuông nhìn xuyên qua
    const deck = new THREE.Mesh(new THREE.BoxGeometry(b.width, 0.4, b.length), lambert(style.stone));
    deck.position.y = y - 0.2;
    g.add(deck);
    for (const e of [-1, 1]) {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(b.width, y + foot, 1.2), lambert(style.stone));
      pier.position.set(0, (y - foot) / 2, e * (h - 0.6));
      g.add(pier);
    }
  } else {
    const body = new THREE.Mesh(new THREE.BoxGeometry(b.width, y + foot, b.length), lambert(style.stone));
    body.position.y = (y - foot) / 2;
    g.add(body);
  }
  const posts = Math.max(2, Math.round(b.length / 1.4) + 1);
  for (const s of [-1, 1]) {
    const x = s * (b.width / 2 - RAIL / 2);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(RAIL * 0.7, 0.55, b.length), marble);
    rail.position.set(x, y + 0.42, 0);
    g.add(rail);
    for (let i = 0; i < posts; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(RAIL, RAIL_H, RAIL), marble);
      p.position.set(x, y + RAIL_H / 2, -h + (i * b.length) / (posts - 1));
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.17, 6, 4), marble);
      cap.position.set(x, y + RAIL_H + 0.1, p.position.z);
      g.add(p, cap);
    }
  }
}

function treo(g: THREE.Group, b: BridgeSpec, style: Style): void {
  const h = b.length / 2;
  const plank = lambert(style.floor);
  const n = Math.max(4, Math.round(b.length / 0.5));
  for (let i = 0; i < n; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(b.width - 0.2, 0.08, (b.length / n) * 0.8), plank);
    p.position.set(0, 0.04, -h + ((i + 0.5) * b.length) / n);
    g.add(p);
  }
  const wood = lambert(style.timber);
  const rope = lambert('#b89a6a');
  for (const s of [-1, 1]) {
    const x = s * (b.width / 2 - RAIL / 2);
    for (const e of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.8, 6), wood);
      post.position.set(x, 0.9, e * h);
      g.add(post);
    }
    // dây tay vịn võng xuống giữa: chuỗi đoạn thẳng
    const seg = 8;
    for (const top of [1.5, 0.8]) {
      for (let i = 0; i < seg; i++) {
        const t0 = i / seg;
        const t1 = (i + 1) / seg;
        const sag = (t: number): number => top - 0.45 * Math.sin(Math.PI * t);
        g.add(slab(0.05, 0.05, -h + t0 * b.length, sag(t0), -h + t1 * b.length, sag(t1), x, rope));
      }
    }
  }
}

function tau(g: THREE.Group, b: BridgeSpec, style: Style): void {
  const h = b.length / 2;
  const stone = lambert(style.stone);
  const marble = lambert('#efe9dc');
  const deck = new THREE.Mesh(new THREE.BoxGeometry(b.width, 0.4, b.length), stone);
  deck.position.y = -0.2;
  g.add(deck);
  // trụ đá đỡ, chìm xuống mây
  for (let z = -h + 3; z <= h; z += 4) {
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.6, 14, 0.6), stone);
      p.position.set(s * (b.width / 2 - 0.4), -7.2, z);
      g.add(p);
    }
  }
  const rail = (w: number, d: number, x: number, z: number): void => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.7, d), marble);
    m.position.set(x, 0.35, z);
    g.add(m);
  };
  for (const s of [-1, 1]) rail(RAIL, b.length, s * (b.width / 2 - RAIL / 2), 0);
  rail(b.width, RAIL, 0, h - RAIL / 2);
}

/** Dựng các cầu; trả về tấm đi được để ghép vào `LayeredGround`. */
export function addBridges(scene: THREE.Scene, colliders: Colliders, list: BridgeSpec[], style: Style, groundY: GroundY = () => 0): Pad[] {
  const pads: Pad[] = [];
  const waterMat = new THREE.MeshBasicMaterial({ color: style.water });
  for (const b of list) {
    const base = bridgeBase(b, groundY);
    const g = new THREE.Group();
    g.position.set(b.x, base, b.z);
    g.rotation.y = (rot(b) * Math.PI) / 180;
    ({ vom, da, treo, tau })[b.kind](g, b, style);
    if (b.water) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(b.width + 0.6, b.length), waterMat);
      w.rotation.x = -Math.PI / 2;
      w.position.y = 0.06 - (b.sunk ?? 0);
      g.add(w);
    }
    scene.add(g);
    pads.push(...bridgePads(b, base));
    for (const r of bridgeRails(b)) colliders.add(r.x, r.z, r.w, r.d);
    if (b.kind === 'tau') {
      // lan can đầu xa: chặn rơi xuống mây
      const [ex, ez] = world(b, 0, b.length / 2 - RAIL / 2);
      const ew = rot(b) % 180 === 0 ? b.width : RAIL;
      const ed = rot(b) % 180 === 0 ? RAIL : b.width;
      colliders.add(ex, ez, ew, ed);
    }
  }
  return pads;
}
