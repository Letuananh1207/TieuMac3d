/**
 * Nông trại Nhà của ta (V-114 — R-NONG-1, concept `design/concept/nong-trai-nha/`): dựng 4 công trình đặt sẵn theo
 * `spec.farm` (`nongSpec.ts`): **chuồng gà** (sân rào tre + chuồng sàn mái ngói, máng, ổ rơm), **ao cá** (mặt nước tròn,
 * bờ đá, lá súng, bồn bồn, bến gỗ đi lên được), **chuồng bò con** (rào gỗ, mái ngói nửa đông, máng cỏ, đống rơm), **giàn
 * bầu bí** (3 vòm tre qua lối trục, đi qua dưới được). Khối đứng yên Lambert → `mergeStatic` / `mergeSoft` gộp; vật động
 * (`nongVat.ts`) đánh dấu `markDynamic`. Va chạm: rào sân gà, chuồng bò, ao (chừa bến) chặn; cột giàn chặn, lòng giàn không.
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import { lambert } from './materials';
import type { FarmSpec } from './nongSpec';
import type { GroundY } from './terrainHeight';
import { addTrellis } from './nongGian';
import { addCow, addStatic, Bobber, Flock, part, toggleMesh, type Rect, type VineLook } from './nongVat';

export type { Rect, VineLook };

const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 6);
const ROCK = new THREE.DodecahedronGeometry(1, 0);
const SPHERE = new THREE.SphereGeometry(1, 8, 6);

export interface Farm3D {
  coop: { rect: Rect; nest: THREE.Vector3 };
  pen: { rect: Rect; trough: THREE.Vector3 };
  /** chỗ đứng câu (đầu bến, phía bờ) + vùng bến */
  pier: { stand: THREE.Vector3; rect: Rect; float: THREE.Vector3 };
  trellis: { rect: Rect; roots: Record<'bau' | 'dua-leo', THREE.Vector3> };
  pads: Pad[];
  setCoop(grain: boolean, eggs: boolean): void;
  setPen(hay: boolean, milk: boolean): void;
  setVine(vine: 'bau' | 'dua-leo', look: VineLook): void;
  bobber: Bobber;
  /** [eye] = vị trí camera (giàn mờ khi camera dưới vòm) */
  update(dt: number, eye?: { x: number; y: number; z: number }): void;
}

/** Hộp màu [c] tâm (x, y, z) cỡ (w, h, d), xoay quanh y [ry]. */
function block(g: THREE.Group, c: string, x: number, y: number, z: number, w: number, h: number, d: number, ry = 0, rx = 0): THREE.Mesh {
  const m = new THREE.Mesh(BOX, lambert(c));
  m.position.set(x, y, z);
  m.scale.set(w, h, d);
  m.rotation.set(rx, ry, 0);
  g.add(m);
  return m;
}

/** Cột tròn đứng từ y0 cao h. */
function post(g: THREE.Group, c: string, x: number, y0: number, z: number, r: number, h: number): void {
  const m = new THREE.Mesh(CYL, lambert(c));
  m.position.set(x, y0 + h / 2, z);
  m.scale.set(r, h, r);
  g.add(m);
}

/** Mái hai dốc (nóc dọc trục x) phủ w × d, chân mái ở y, cao thêm rise; đầu hồi lấp bằng lăng trụ màu [gable]. */
function gableRoof(g: THREE.Group, tile: string, gable: string, x: number, y: number, z: number, w: number, d: number, rise: number): void {
  const half = d / 2;
  const slope = Math.atan2(rise, half);
  const len = Math.hypot(rise, half) + 0.15;
  for (const s of [-1, 1]) block(g, tile, x, y + rise / 2, z + (s * half) / 2, w + 0.3, 0.08, len, 0, s * slope);
  block(g, tile, x, y + rise + 0.03, z, w + 0.35, 0.1, 0.14);
  // đầu hồi: lăng trụ tam giác (mặt cắt trong yz) chạy dọc x
  const shape = new THREE.Shape([new THREE.Vector2(-half, 0), new THREE.Vector2(half, 0), new THREE.Vector2(0, rise * 0.95)]);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: w - 0.05, bevelEnabled: false }).translate(0, 0, -(w - 0.05) / 2).rotateY(Math.PI / 2);
  const p = new THREE.Mesh(geo, lambert(gable));
  p.position.set(x, y, z);
  g.add(p);
}

/** Rào quanh ô [r]: trụ mỗi [every] m + [rails] thanh ngang (hoặc nan dọc dày nếu [slats]). */
function fence(g: THREE.Group, r: Rect, y: number, h: number, c: string, every: number, rails: number[], slats: boolean, skip?: (x: number, z: number) => boolean): void {
  const sides: [number, number, number, number][] = [
    [r.x0, r.z0, r.x1, r.z0],
    [r.x1, r.z0, r.x1, r.z1],
    [r.x1, r.z1, r.x0, r.z1],
    [r.x0, r.z1, r.x0, r.z0],
  ];
  for (const [ax, az, bx, bz] of sides) {
    const len = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.round(len / every));
    for (let i = 0; i <= n; i++) {
      const x = ax + ((bx - ax) * i) / n;
      const z = az + ((bz - az) * i) / n;
      if (!skip?.(x, z)) post(g, c, x, y, z, 0.055, h + 0.1);
    }
    const along = ax === bx ? 'z' : 'x';
    for (const ry of rails) block(g, c, (ax + bx) / 2, y + ry, (az + bz) / 2, along === 'x' ? len : 0.05, 0.05, along === 'z' ? len : 0.05);
    if (slats) {
      const m = Math.round(len / 0.16);
      for (let i = 1; i < m; i++) {
        const x = ax + ((bx - ax) * i) / m;
        const z = az + ((bz - az) * i) / m;
        post(g, c, x, y, z, 0.022, h - 0.04 * (i % 2));
      }
    }
  }
}

const rectOf = (x: number, z: number, w: number, d: number): Rect => ({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });

/** Chuồng gà + sân (R-NONG-1, R-NONG-2). */
function addCoop(scene: THREE.Scene, colliders: Colliders, f: FarmSpec, y: number) {
  const g = new THREE.Group();
  const c = f.colors;
  const { x, z, w, d } = f.coop;
  const r = rectOf(x, z, w, d);
  fence(g, r, y, 0.7, c.bamboo, 1.2, [0.18, 0.62], true);
  colliders.add(x, z, w, d);
  // chuồng sàn góc tây bắc: sàn cao 0,5 trên 4 chân, thân ván, mái ngói hai dốc, cửa nhìn nam
  const hx = r.x0 + 1.7;
  const hz = r.z0 + 1.3;
  const hy = y + 0.55;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) post(g, c.darkWood, hx + sx * 1.2, y, hz + sz * 0.85, 0.07, 0.6);
  block(g, c.wood, hx, hy + 0.04, hz, 2.8, 0.1, 2.0);
  block(g, c.wood, hx, hy + 0.72, hz, 2.6, 1.36, 1.8);
  block(g, '#3a2c22', hx - 0.45, hy + 0.55, hz + 0.91, 0.6, 0.8, 0.04); // ô cửa tối
  gableRoof(g, c.tile, c.wood, hx, hy + 1.4, hz, 2.8, 2.3, 0.85);
  block(g, c.wood, hx - 0.45, y + 0.3, hz + 1.45, 0.55, 0.05, 1.2, 0, -0.45); // cầu thang gà
  // ổ rơm bên phải cửa
  const nest = new THREE.Vector3(hx + 0.7, hy + 0.15, hz + 1.15);
  block(g, c.wood, nest.x, nest.y - 0.05, nest.z, 0.7, 0.12, 0.45);
  const straw = new THREE.Mesh(SPHERE, lambert(c.straw));
  straw.position.set(nest.x, nest.y + 0.02, nest.z);
  straw.scale.set(0.32, 0.08, 0.2);
  g.add(straw);
  // máng gỗ + đĩa nước đá
  block(g, c.wood, r.x1 - 1.5, y + 0.12, r.z1 - 0.8, 1.3, 0.22, 0.32);
  const dish = new THREE.Mesh(CYL, lambert(c.stone));
  dish.position.set(r.x0 + 0.9, y + 0.05, r.z1 - 0.8);
  dish.scale.set(0.35, 0.1, 0.35);
  g.add(dish);
  addStatic(scene, g);
  const eggs = toggleMesh(scene, [0, 1, 2].map((i) => part(SPHERE, '#f3e7d0', [nest.x - 0.13 + i * 0.13, nest.y + 0.09, nest.z + (i % 2) * 0.05], [0.055, 0.07, 0.055])));
  const grainAt = { x: x + 1, z: r.z1 - 1.5 };
  let seed = 3;
  const rnd = (): number => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const grain = toggleMesh(scene, Array.from({ length: 36 }, () => part(BOX, '#e6c25a', [grainAt.x + (rnd() - 0.5) * 1.4, y + 0.02, grainAt.z + (rnd() - 0.5) * 1.0], [0.04, 0.02, 0.04])));
  const flock = new Flock(scene, f.coop.chickens, r, { x0: hx - 1.4, x1: hx + 1.4, z0: hz - 1.0, z1: hz + 1.6 }, y, [c.chicken, c.hen]);
  return { rect: r, nest, eggs, grain, grainAt, flock };
}

/** Ao cá + bến (R-NONG-1, R-NONG-3). */
function addPond(scene: THREE.Scene, colliders: Colliders, f: FarmSpec, y: number) {
  const g = new THREE.Group();
  const c = f.colors;
  const p = f.pond;
  const water = new THREE.Mesh(new THREE.CircleGeometry(p.r, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: c.water }));
  water.position.set(p.x, y + 0.06, p.z);
  g.add(water);
  const bed = new THREE.Mesh(new THREE.CircleGeometry(p.r + 0.3, 32).rotateX(-Math.PI / 2), lambert('#7d7466'));
  bed.position.set(p.x, y + 0.03, p.z);
  g.add(bed);
  // bờ đá: hòn đá quanh mép, chừa chỗ bến (phía chân bến)
  const pierAng = Math.atan2(p.pierFrom[1] - p.z, p.pierFrom[0] - p.x);
  const n = Math.round((2 * Math.PI * p.r) / 0.75);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const da = Math.abs(Math.atan2(Math.sin(a - pierAng), Math.cos(a - pierAng)));
    if (da < 0.2) continue;
    const s = 0.32 + ((i * 37) % 7) * 0.03;
    const rock = new THREE.Mesh(ROCK, lambert(c.stone));
    rock.position.set(p.x + Math.cos(a) * (p.r + 0.15), y + s * 0.35, p.z + Math.sin(a) * (p.r + 0.15));
    rock.scale.set(s, s * 0.7, s);
    rock.rotation.set(i, i * 2, 0);
    g.add(rock);
  }
  // lá súng + 2 hoa, bồn bồn góc đông bắc
  const lily = [
    [1.2, -1.5, 0.42],
    [1.9, -0.6, 0.34],
    [-0.4, 1.8, 0.38],
    [0.6, 2.2, 0.3],
    [2.2, 1.2, 0.36],
    [-1.4, -1.9, 0.32],
  ];
  for (const [dx, dz, s] of lily) {
    const l = new THREE.Mesh(CYL, lambert(c.lily));
    l.position.set(p.x + dx, y + 0.08, p.z + dz);
    l.scale.set(s, 0.02, s);
    g.add(l);
  }
  for (const [dx, dz] of [[1.2, -1.5], [-0.4, 1.8]]) {
    const fl = new THREE.Mesh(SPHERE, lambert('#f2b8c8'));
    fl.position.set(p.x + dx, y + 0.14, p.z + dz);
    fl.scale.set(0.12, 0.08, 0.12);
    g.add(fl);
  }
  for (let i = 0; i < 7; i++) {
    const a = -0.9 + i * 0.12;
    const rr = p.r - 0.35 + (i % 3) * 0.12;
    const bx = p.x + Math.cos(a) * rr;
    const bz = p.z + Math.sin(a) * rr;
    const h = 1.0 + (i % 3) * 0.2;
    post(g, '#7a9a4a', bx, y, bz, 0.02, h);
    const head = new THREE.Mesh(CYL, lambert('#7a5232'));
    head.position.set(bx, y + h - 0.12, bz);
    head.scale.set(0.045, 0.22, 0.045);
    g.add(head);
  }
  // bến gỗ: ván + cọc, đi lên được (tấm nền)
  const [ax, az] = p.pierFrom;
  const [bx, bz] = p.pierEnd;
  const len = Math.hypot(bx - ax, bz - az);
  const deckY = y + 0.25;
  const along = bx !== ax;
  const boards = Math.round(len / 0.3);
  for (let i = 0; i < boards; i++) {
    const t = (i + 0.5) / boards;
    const cx = ax + (bx - ax) * t;
    const cz = az + (bz - az) * t;
    block(g, i % 2 ? c.wood : '#94704f', cx, deckY - 0.04, cz, along ? 0.28 : p.pierWidth, 0.08, along ? p.pierWidth : 0.28);
  }
  const ox = along ? 0 : p.pierWidth / 2 - 0.08;
  const oz = along ? p.pierWidth / 2 - 0.08 : 0;
  for (const t of [0.05, 0.5, 0.97]) for (const s of [-1, 1]) post(g, c.darkWood, ax + (bx - ax) * t + s * ox, y - 0.2, az + (bz - az) * t + s * oz, 0.06, deckY - y + 0.32);
  addStatic(scene, g);
  // va chạm: lõi ao + vòng tròn quanh mép, chừa khe phía bến (đứng trên bến tới đầu lõi)
  const core = p.r * 0.63;
  colliders.addCircle(p.x, p.z, core);
  const ring = p.r - 0.5;
  for (let k = 0; k < 8; k++) {
    const a = pierAng + Math.PI / 4 + (k * Math.PI) / 4;
    if (k === 7) continue; // khe bến
    colliders.addCircle(p.x + Math.cos(a) * ring, p.z + Math.sin(a) * ring, 1.25);
  }
  const dir = new THREE.Vector3(Math.cos(pierAng), 0, Math.sin(pierAng)); // từ tâm ra chân bến
  const stand = new THREE.Vector3(p.x + dir.x * (core + 0.6), deckY, p.z + dir.z * (core + 0.6));
  const float = new THREE.Vector3(p.x - dir.x * 0.4 + dir.z * 0.5, y + 0.07, p.z - dir.z * 0.4 + dir.x * 0.5);
  const half = p.pierWidth / 2;
  const rect: Rect = { x0: Math.min(ax, bx) - (along ? 0 : half), x1: Math.max(ax, bx) + (along ? 0 : half), z0: Math.min(az, bz) - (along ? half : 0), z1: Math.max(az, bz) + (along ? half : 0) };
  const pad: Pad = { minX: rect.x0, maxX: rect.x1, minZ: rect.z0, maxZ: rect.z1, y: deckY };
  return { stand, float, rect, pad, bobber: new Bobber(scene, float, stand) };
}

/** Chuồng bò con (R-NONG-1, R-NONG-4). */
function addCowPen(scene: THREE.Scene, colliders: Colliders, f: FarmSpec, y: number) {
  const g = new THREE.Group();
  const c = f.colors;
  const { x, z, w, d } = f.cowPen;
  const r = rectOf(x, z, w, d);
  fence(g, r, y, 0.95, c.wood, 1.25, [0.45, 0.85], false);
  colliders.add(x, z, w, d);
  // mái ngói che nửa đông: 4 cột + mái hai dốc (nóc dọc x)
  const sx0 = x + 0.1;
  const sx1 = r.x1 - 0.2;
  for (const px of [sx0, sx1]) for (const pz of [r.z0 + 0.25, r.z1 - 0.25]) post(g, c.darkWood, px, y, pz, 0.08, 2.0);
  gableRoof(g, c.tile, c.darkWood, (sx0 + sx1) / 2, y + 2.0, z, sx1 - sx0 + 0.4, d - 0.1, 0.8);
  // đống rơm dưới mái, máng cỏ sát rào tây (đứng ngoài rào cho ăn)
  for (const [dx, dz, s] of [[0.9, -0.9, 0.55], [1.4, 0.6, 0.45], [0.5, 0.9, 0.4]]) {
    const hay = new THREE.Mesh(SPHERE, lambert(c.straw));
    hay.position.set(x + dx, y + s * 0.4, z + dz);
    hay.scale.set(s, s * 0.6, s * 0.9);
    g.add(hay);
  }
  const trough = new THREE.Vector3(r.x0 + 0.45, y, z);
  block(g, c.wood, trough.x, y + 0.25, trough.z, 0.45, 0.3, 1.6);
  block(g, '#3a2c22', trough.x, y + 0.38, trough.z, 0.33, 0.06, 1.45);
  // ghế đẩu + bình sữa ngoài góc đông nam
  const jx = r.x1 + 0.55;
  const jz = r.z1 - 0.4;
  block(g, c.wood, jx, y + 0.3, jz, 0.42, 0.06, 0.42);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) post(g, c.wood, jx + a * 0.15, y, jz + b * 0.15, 0.025, 0.3);
  const jug = new THREE.Mesh(SPHERE, lambert('#b07a52'));
  jug.position.set(jx, y + 0.55, jz);
  jug.scale.set(0.16, 0.22, 0.16);
  g.add(jug);
  colliders.add(jx, jz, 0.5, 0.5);
  addStatic(scene, g);
  const hayIn = toggleMesh(scene, [part(BOX, c.straw, [trough.x, y + 0.44, trough.z], [0.32, 0.1, 1.4]), part(SPHERE, c.straw, [trough.x, y + 0.5, trough.z], [0.18, 0.08, 0.6])]);
  const milk = toggleMesh(scene, [part(CYL, '#9aa0a0', [jx - 0.55, y + 0.17, jz], [0.15, 0.34, 0.15]), part(CYL, '#fbfaf4', [jx - 0.55, y + 0.35, jz], [0.13, 0.02, 0.13])]);
  const cow = addCow(scene, x - 0.2, y, z, -Math.PI / 2, c.cow);
  return { rect: r, trough, hayIn, milk, cow };
}

/** Dựng nông trại (`spec.farm.enabled`); tắt → `null`. Nền nhà nằm trên bục phẳng → độ cao lấy ở tâm từng công trình. */
export function addFarm(scene: THREE.Scene, colliders: Colliders, f: FarmSpec, groundY: GroundY): Farm3D | null {
  if (!f.enabled) return null;
  const coop = addCoop(scene, colliders, f, groundY(f.coop.x, f.coop.z));
  const pond = addPond(scene, colliders, f, groundY(f.pond.x, f.pond.z));
  const pen = addCowPen(scene, colliders, f, groundY(f.cowPen.x, f.cowPen.z));
  const tr = addTrellis(scene, colliders, f, groundY);
  return {
    coop: { rect: coop.rect, nest: coop.nest },
    pen: { rect: pen.rect, trough: pen.trough },
    pier: { stand: pond.stand, rect: pond.rect, float: pond.float },
    trellis: { rect: tr.rect, roots: tr.roots },
    pads: [pond.pad],
    bobber: pond.bobber,
    setCoop(grain, eggs) {
      coop.grain.visible = grain;
      coop.eggs.visible = eggs;
      coop.flock.setFood(grain ? coop.grainAt : null);
    },
    setPen(hay, milk) {
      pen.hayIn.visible = hay;
      pen.milk.visible = milk;
    },
    setVine(vine, look) {
      tr.vines[vine].set(look);
    },
    update(dt, eye) {
      tr.fade(dt, eye);
      coop.flock.update(dt);
      pen.cow.update(dt);
      pond.bobber.update(dt);
    },
  };
}
