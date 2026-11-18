/**
 * Tháp Sáo Trúc (V-113, Thung Trúc Gió Hát — concept `design/concept/thung-truc-gio-hat/`): bó ống trúc to cao thấp như đàn
 * ống trên đế đá tròn hai bậc (đứng lên được), miệng ống vát, đốt trúc, lỗ sáo, ba vòng dây thừng, đai lụa đỏ san hô;
 * 6 dải lụa ngũ sắc bay ở đỉnh; 5 cọc trúc buộc nơ phía nam; giá chuông gió tre quanh bãi.
 * Khối tĩnh → một khối màu theo đỉnh (`mergeVertexColors`, 1 draw call); lụa + ống chuông lay bằng gió trong vertex shader
 * (`softMaterial` + `aSway`, 1 draw call, không cập nhật CPU). Không trong suốt, không bóng realtime.
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import { lambert, softMaterial } from './materials';
import { markDynamic, mergeVertexColors } from './merge';
import { addChimeFrame, addChimeHangers } from './chuongGio';
import type { GroundY } from './terrainHeight';
import { baseSteps, BUNDLE_R, postSpots, TUBES, type FluteTowerSpec } from './thapSaoSpec';
import { SwayBuilder } from './swayGeo';

/** Số cạnh ống trúc (lỗ sáo đặt giữa một mặt cạnh — không cắt cạnh). */
const SEG = 10;
/** Độ vát miệng ống (tan góc vát). */
const SLANT = 0.55;
/** Lụa đỉnh + ống chuông: biên độ gió (m) ở `aSway` = 1. */
const WIND_AMP = 0.45;

export interface FluteTower {
  /** bậc đế đứng lên được (tấm tròn — R-VA-3) */
  pads: Pad[];
}

/**
 * Ống trúc vát miệng: thành ngoài (màu trúc), vành miệng, lòng ống tối sâu 1,2 m. `dir` = hướng mặt vát nhìn lên (rad,
 * 0 = +z). Toạ độ trong `g` (gốc ống ở (x, y0, z)).
 */
function addTube(g: THREE.Group, x: number, z: number, r: number, y0: number, top: number, dir: number, colors: { wall: string; hole: string }): void {
  const dx = Math.sin(dir);
  const dz = Math.cos(dir);
  const ri = r * 0.8;
  const topAt = (px: number, pz: number): number => top - SLANT * r + SLANT * (px * dx + pz * dz);
  const ring = (R: number): [number, number][] => Array.from({ length: SEG + 1 }, (_, i) => [Math.sin((i / SEG) * Math.PI * 2) * R, Math.cos((i / SEG) * Math.PI * 2) * R]);
  const outer = ring(r);
  const inner = ring(ri);
  const wall: number[] = [];
  const wallN: number[] = [];
  const dark: number[] = [];
  const darkN: number[] = [];
  const quad = (pos: number[], nrm: number[], a: number[], b: number[], c: number[], d: number[], n: number[][]): void => {
    pos.push(...a, ...b, ...c, ...a, ...c, ...d);
    nrm.push(...n[0], ...n[1], ...n[2], ...n[0], ...n[2], ...n[3]);
  };
  const deep = top - SLANT * r * 2 - 1.2;
  const up = new THREE.Vector3(-SLANT * dx, 1, -SLANT * dz).normalize().toArray();
  for (let i = 0; i < SEG; i++) {
    const [ax, az] = outer[i];
    const [bx, bz] = outer[i + 1];
    const na = [ax / r, 0, az / r];
    const nb = [bx / r, 0, bz / r];
    quad(wall, wallN, [ax, y0, az], [bx, y0, bz], [bx, topAt(bx, bz), bz], [ax, topAt(ax, az), az], [na, nb, nb, na]);
    const [cx, cz] = inner[i];
    const [ex, ez] = inner[i + 1];
    // vành miệng (màu trúc) trên mặt vát
    quad(wall, wallN, [ax, topAt(ax, az), az], [bx, topAt(bx, bz), bz], [ex, topAt(ex, ez), ez], [cx, topAt(cx, cz), cz], [up, up, up, up]);
    // lòng ống: pháp tuyến hướng vào trong, đáy tối
    const ia = [-cx / ri, 0, -cz / ri];
    const ib = [-ex / ri, 0, -ez / ri];
    quad(dark, darkN, [cx, topAt(cx, cz), cz], [ex, topAt(ex, ez), ez], [ex, deep, ez], [cx, deep, cz], [ia, ib, ib, ia]);
    dark.push(0, deep, 0, ex, deep, ez, cx, deep, cz);
    darkN.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
  }
  const mesh = (pos: number[], nrm: number[], color: string): void => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
    const m = new THREE.Mesh(geo, lambert(color, { side: THREE.DoubleSide }));
    m.position.set(x, 0, z);
    g.add(m);
  };
  mesh(wall, wallN, colors.wall);
  mesh(dark, darkN, colors.hole);
}

/** Đốt trúc: vòng nhô quanh ống mỗi ~1,7 m; lỗ sáo tròn tối giữa các đốt, trên mặt cạnh nhìn `face` (rad). */
function addNodesAndHoles(g: THREE.Group, x: number, z: number, r: number, y0: number, top: number, face: number, node: THREE.Material, hole: THREE.Material, holes: number): void {
  const step = 1.7;
  const nodeGeo = new THREE.CylinderGeometry(r * 1.07, r * 1.07, 0.14, SEG);
  for (let y = y0 + 1.5; y < top - SLANT * r * 2 - 0.4; y += step) {
    const n = new THREE.Mesh(nodeGeo, node);
    n.position.set(x, y, z);
    g.add(n);
  }
  // mặt cạnh gần hướng `face` nhất: tâm mặt ở góc (i + ½) / SEG
  const k = Math.round(((((face / (Math.PI * 2)) * SEG - 0.5) % SEG) + SEG) % SEG);
  const a = ((k + 0.5) / SEG) * Math.PI * 2;
  const d = r * Math.cos(Math.PI / SEG) + 0.012;
  const holeGeo = new THREE.CircleGeometry(Math.min(0.11, r * 0.22), 8);
  for (let j = 0; j < holes; j++) {
    const y = y0 + 2.3 + j * step;
    if (y > top - SLANT * r * 2 - 0.7) break;
    const h = new THREE.Mesh(holeGeo, hole);
    h.position.set(x + Math.sin(a) * d, y, z + Math.cos(a) * d);
    h.rotation.y = a;
    g.add(h);
  }
}

/** Bao lồi (chuỗi đơn điệu) của các điểm 2D, ngược chiều kim đồng hồ. */
export function convexHull(pts: [number, number][]): [number, number][] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: [number, number], a: [number, number], b: [number, number]): number => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: [number, number][]): [number, number][] => {
    const h: [number, number][] = [];
    for (const q of list) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop();
      h.push(q);
    }
    h.pop();
    return h;
  };
  return [...half(p), ...half([...p].reverse())];
}

/** Vòng dây thừng ôm sát các ống còn tới độ cao `y` (ống dây chạy theo bao lồi các mặt cắt ống), quấn hai lượt. */
function addRope(g: THREE.Group, y: number, height: number, rope: THREE.Material): void {
  const there = TUBES.filter(([, , , k]) => k * height > y + 0.6);
  if (!there.length) return;
  const pts: [number, number][] = [];
  for (const [dx, dz, r] of there) for (let i = 0; i < 24; i++) pts.push([dx + Math.sin((i / 24) * Math.PI * 2) * (r * 1.08 + 0.1), dz + Math.cos((i / 24) * Math.PI * 2) * (r * 1.08 + 0.1)]);
  const hull = convexHull(pts);
  for (const [dy, rr] of [[0, 0.1], [0.19, 0.095]] as const) {
    const curve = new THREE.CatmullRomCurve3(hull.map(([x, z]) => new THREE.Vector3(x, y + dy, z)), true);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, rr, 5, true), rope));
  }
}

/** Cọc trúc thấp buộc nơ (chỗ trò "Trúc hát" sau này): ống vát, đai dây, nơ hai quai + hai đuôi nhìn ra ngoài tháp. */
function addPost(g: THREE.Group, t: FluteTowerSpec, px: number, pz: number, y0: number, i: number): void {
  const h = [1.25, 1.05, 1.0, 1.2, 1.35][i % 5];
  const out = Math.atan2(px - t.x, pz - t.z); // hướng ra ngoài tháp
  const pg = new THREE.Group();
  pg.position.set(px, y0, pz);
  addTube(pg, 0, 0, 0.2, -0.1, h, out + 2.4, { wall: t.colors.bamboo[i % 2], hole: t.colors.hole });
  const rope = lambert(t.colors.rope);
  for (const y of [0.22, 0.32]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.035, 4, 12).rotateX(Math.PI / 2), rope);
    ring.position.y = y;
    pg.add(ring);
  }
  const bow = lambert(t.colors.bows[i % 5]);
  const bg = new THREE.Group();
  bg.position.set(Math.sin(out) * 0.26, h * 0.62, Math.cos(out) * 0.26);
  bg.rotation.y = out;
  bg.scale.setScalar(1.4);
  const knot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.065, 0), bow);
  bg.add(knot);
  for (const s of [-1, 1]) {
    const loop = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 4).rotateZ((-s * Math.PI) / 2), bow);
    loop.position.set(s * 0.13, 0.03, 0);
    loop.scale.set(1, 1, 0.45);
    bg.add(loop);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, 0.015), bow);
    tail.position.set(s * 0.05, -0.15, 0.01);
    tail.rotation.z = s * 0.35;
    bg.add(tail);
  }
  // ruột ống đầy tới đai — cọc đứng vững (dưới mặt đất không thấy)
  pg.add(bg);
  g.add(pg);
}

/** 6 dải lụa từ đai đỏ đỉnh ống cao nhất: bay ra ngoài rồi rủ dần, gợn theo chiều dài; `aSway` 0 ở nút → 1 ở đuôi. */
function addRibbons(b: SwayBuilder, t: FluteTowerSpec, y0: number): void {
  const [dx, dz, r, k] = TUBES[0];
  const knotY = y0 + k * t.height - 1.35;
  t.colors.ribbons.forEach((color, i) => {
    const a = (i / t.colors.ribbons.length) * Math.PI * 2 + 0.4;
    const d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const side = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const start = new THREE.Vector3(t.x + dx, knotY, t.z + dz).addScaledVector(d, r * 1.1);
    const L = 4.8 + (i % 3) * 0.8;
    const n = 12;
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s <= n; s++) {
      const u = s / n;
      pts.push(
        start
          .clone()
          .addScaledVector(d, u * L * 0.78)
          .addScaledVector(side, Math.sin(u * Math.PI * 1.6 + i) * 0.3 * u)
          .add(new THREE.Vector3(0, 0.25 * u - Math.pow(u, 1.7) * L * 0.5, 0)),
      );
    }
    b.strip(pts, 0.28, color, (u) => u);
  });
}

/** Dựng tháp + cọc nơ + chuông gió; va chạm thân tháp, cọc, cột chuông; trả bậc đế đi được. */
export function addFluteTower(scene: THREE.Scene, colliders: Colliders, t: FluteTowerSpec, groundY: GroundY): FluteTower {
  if (!t.enabled) return { pads: [] };
  const y0 = groundY(t.x, t.z);
  const root = new THREE.Group();
  const g = new THREE.Group();
  g.position.set(t.x, y0, t.z);
  root.add(g);
  const steps = baseSteps(t);
  steps.forEach(([R, top], i) => {
    const bottom = i === 0 ? -0.15 : steps[i - 1][1] - 0.05;
    const tier = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 1.02, top - bottom, 24), lambert(t.colors.stone[i]));
    tier.position.y = (top + bottom) / 2;
    g.add(tier);
  });
  const deckY = steps[steps.length - 1][1];
  const node = lambert(t.colors.node);
  const hole = lambert(t.colors.hole);
  TUBES.forEach(([dx, dz, r, k], i) => {
    const top = k * t.height;
    const face = Math.atan2(dx, dz + 0.6) + (i % 2 ? 0.5 : -0.5); // lỗ sáo nhìn ra ngoài, lệch về nam
    addTube(g, dx, dz, r, deckY - 0.05, top, Math.atan2(dx, dz) + 0.9 * (i % 2 ? 1 : -1), { wall: t.colors.bamboo[i % 2], hole: t.colors.hole });
    addNodesAndHoles(g, dx, dz, r, deckY, top, face, node, hole, 5);
  });
  // ba vòng dây thừng (thấp, giữa, trên — vòng trên chỉ ôm các ống còn cao tới đó)
  const rope = lambert(t.colors.rope);
  for (const f of [0.17, 0.36, 0.55]) addRope(g, deckY + f * t.height, t.height, rope);
  // đai lụa san hô quấn đỉnh ống cao nhất — chỗ buộc các dải lụa
  const [tx, tz, tr, tk] = TUBES[0];
  const band = new THREE.Mesh(new THREE.CylinderGeometry(tr * 1.1, tr * 1.1, 0.42, SEG), lambert(t.colors.ribbons[0]));
  band.position.set(tx, tk * t.height - 1.35, tz);
  g.add(band);
  colliders.addCircle(t.x, t.z, BUNDLE_R + 0.1);

  if (t.posts)
    postSpots(t).forEach(([px, pz], i) => {
      addPost(root, t, px, pz, groundY(px, pz), i);
      colliders.addCircle(px, pz, 0.3);
    });
  const sway = new SwayBuilder();
  addRibbons(sway, t, y0);
  for (const c of t.chimes) {
    const cy = groundY(c.x, c.z);
    addChimeFrame(root, colliders, c, cy, t.colors);
    addChimeHangers(sway, c, cy, t.colors);
  }
  scene.add(root);
  mergeVertexColors(root);
  markDynamic(root); // khối màu theo đỉnh: không để mergeStatic gộp lại (sẽ mất màu đỉnh)
  const wind = sway.mesh(softMaterial(0.5, THREE.DoubleSide, { amp: WIND_AMP, sway: true }));
  markDynamic(wind);
  scene.add(wind);
  return {
    pads: [...steps]
      .reverse()
      .map(([R, top]) => ({ minX: t.x - R, maxX: t.x + R, minZ: t.z - R, maxZ: t.z + R, y: y0 + top, round: true })),
  };
}
