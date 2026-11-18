/**
 * Đỉnh Hạc Bay (V-111, concept `design/concept/dinh-hac-bay/`): cột đá vôi khối xếp bo góc (mặt vát, đá sáng xen tối), đỉnh
 * thềm cỏ có tùng / phong, gờ đá quanh thân; cầu treo gỗ (ván, cột, dây thừng võng) giữa các gờ / đỉnh; tùng lá kim + phong
 * đỏ dưới thung. Thân cột, gờ, cầu là khối Lambert tĩnh → `mergeSoft` / `mergeStatic` gộp; tùng lá kim, phong mỗi loại một
 * InstancedMesh (màu theo đỉnh). Mặt đi được: gờ, đỉnh (tầng trên — chỉ tới được bằng cầu), mặt cầu; mép gờ / đỉnh có cầu tới
 * chặn bằng rào vô hình, lan can cầu chặn. Cột chính (bậc, đình, tùng cổ, hạc) ở `dinhHac.ts`.
 */
import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import { addPine } from './cay_moi';
import { isSoft, type LookSpec } from './look';
import { lambert, softMaterial } from './materials';
import { seededRandom } from './random';
import { ledgeArc, type PillarBridgeSpec, type PillarValleySpec, type StonePillarSpec } from './dinhHacSpec';
import type { SceneSpec } from './spec';
import type { GroundY } from './terrainHeight';
import { finish, type Placed } from './trees';

type Colors = PillarValleySpec['colors'];

/** Thân cột cắm xuống dưới chân (m) — đất dốc không hở chân. */
const SINK = 2;
/** Cao một tầng đá xếp (m): ngẫu nhiên trong khoảng. */
const TIER: [number, number] = [5.5, 8];
/** Bề ngang một khối đá (m) — số khối mỗi tầng = chu vi / số này (ít nhất 4). */
const BLOCK_W = 5.6;
/** Rào vô hình quanh mép: khoảng cách cọc (m), cạnh cọc (m). */
const FENCE_GAP = 0.8;
const FENCE = 0.4;

/** Khối đá hộp vát mọi cạnh, cạnh 1 (24 đỉnh, 44 tam giác — rẻ hơn hộp bo tròn 108); co giãn theo từng khối như đá đẽo tay. */
let unitBlock: THREE.BufferGeometry | null = null;
function chamferBlock(): THREE.BufferGeometry {
  const a = 0.5;
  const b = 0.36; // mép vát
  const pts: THREE.Vector3[] = [];
  for (const sx of [-1, 1])
    for (const sy of [-1, 1])
      for (const sz of [-1, 1]) pts.push(new THREE.Vector3(sx * a, sy * b, sz * b), new THREE.Vector3(sx * b, sy * a, sz * b), new THREE.Vector3(sx * b, sy * b, sz * a));
  const g = new ConvexGeometry(pts);
  g.deleteAttribute('uv');
  return g;
}

/** Hộp chặn nhỏ tại (x, z), chỉ khi chân ở khoảng cao [lo, hi]. */
export function block(colliders: Colliders, x: number, z: number, lo: number, hi: number, size = FENCE): void {
  colliders.add(x, z, size, size, 0, { minY: lo, maxY: hi });
}

/**
 * Thân cột: lõi 8 mặt + từng tầng là vòng khối đá hộp bo góc lớn xếp quanh (mạch đá lệch giữa các tầng, khối to nhỏ / sáng
 * tối khác nhau — như concept). Toạ độ cục bộ, chân ở y = 0, đỉnh đúng `h`; góc ngoài khối không vượt bán kính `r`
 * (`tight`: méo ít — thân có bậc / gờ bám).
 */
export function pillarBody(g: THREE.Group, h: number, r: number, c: Colors, rand: () => number, tight = false): void {
  unitBlock ??= chamferBlock();
  const spread = tight ? 0.03 : 0.1;
  const mats = [lambert(c.rock), lambert(new THREE.Color(c.rock).lerp(new THREE.Color(c.rockDark), 0.4)), lambert(new THREE.Color(c.rock).lerp(new THREE.Color(c.rockDark), 0.8))];
  const n = Math.max(4, Math.round((Math.PI * 2 * r) / BLOCK_W));
  const face = r * Math.cos(Math.PI / n); // mặt ngoài khối: góc khối chạm đúng vòng `r`
  const core = new THREE.Mesh(new THREE.CylinderGeometry(face * 0.9, face * 0.9, h + SINK, 8), mats[2]);
  core.position.y = (h - SINK) / 2;
  g.add(core);
  let y = -SINK;
  while (y < h - 0.01) {
    const left = h - y;
    const th = left < TIER[1] + 2 ? left : TIER[0] + rand() * (TIER[1] - TIER[0]);
    const top = y + th >= h - 0.01;
    const yaw = rand() * Math.PI * 2;
    for (let k = 0; k < n; k++) {
      const a = yaw + (k / n) * Math.PI * 2;
      const shrink = top ? 1 : 1 - rand() * spread;
      const depth = r * (0.42 + rand() * 0.12);
      const d = face * shrink - depth / 2;
      const pick = rand();
      const m = new THREE.Mesh(unitBlock, mats[pick < 0.5 ? 0 : pick < 0.85 ? 1 : 2]);
      m.position.set(Math.sin(a) * d, y + th / 2, Math.cos(a) * d);
      m.rotation.y = a;
      m.scale.set(2 * r * Math.sin(Math.PI / n) * shrink * (1.02 + rand() * 0.06), th * (top ? 1 : 0.97 + rand() * 0.03), depth);
      g.add(m);
    }
    y += th;
  }
}

/** Thềm cỏ phủ đỉnh cột: đĩa cỏ hơi tràn mép, mép rủ xuống. Mặt cỏ cao `h` + 0,03. */
export function grassCap(g: THREE.Group, h: number, r: number, c: Colors): void {
  const prof: [number, number][] = [
    [r * 0.94, h - 0.55],
    [r + 0.18, h - 0.3],
    [r + 0.12, h - 0.02],
    [r * 0.8, h + 0.03],
    [0, h + 0.03],
  ];
  const geo = new THREE.LatheGeometry(
    prof.map(([pr, py]) => new THREE.Vector2(pr, py)),
    14,
  );
  g.add(new THREE.Mesh(geo, lambert(c.grass)));
}

/** Gờ đá vành khăn quanh thân (cung từ góc `a0`, dài `span` rad; cả vòng = 2π): mặt trên ở `y`, gầm vát vào thân. */
export function ledgeShelf(g: THREE.Group, y: number, r: number, width: number, c: Colors, a0 = 0, span = Math.PI * 2): void {
  const seg = Math.max(6, Math.ceil(span / 0.26));
  const outer = new THREE.CylinderGeometry(r + width, r - 0.2, 0.75, seg, 1, false, a0, span);
  const m = new THREE.Mesh(outer, lambert(c.rockDark));
  m.position.y = y - 0.375;
  g.add(m);
}

/** Cầu treo gỗ: ván ngang, dầm hai mép, cột đầu cầu, dây tay vịn võng + dây treo. Toạ độ cảnh. */
function ropeBridge(scene: THREE.Scene, b: PillarBridgeSpec, w: number, c: Colors): void {
  const g = new THREE.Group();
  const [x0, z0] = b.from;
  const [x1, z1] = b.to;
  const len = Math.hypot(x1 - x0, z1 - z0);
  g.position.set(x0, b.y, z0);
  g.rotation.y = Math.atan2(x1 - x0, z1 - z0); // cục bộ: cầu chạy dọc +z
  scene.add(g);
  const plank = lambert(c.plank);
  const darkPlank = lambert(new THREE.Color(c.plank).multiplyScalar(0.82));
  const rope = lambert(c.rope);
  const n = Math.ceil(len / 0.36);
  const plankGeo = new THREE.BoxGeometry(w, 0.08, 0.3);
  for (let i = 0; i < n; i++) {
    const p = new THREE.Mesh(plankGeo, i % 3 === 1 ? darkPlank : plank);
    p.position.set(0, -0.04, (i + 0.5) * (len / n));
    g.add(p);
  }
  for (const s of [-1, 1]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, len), darkPlank);
    beam.position.set(s * (w / 2 - 0.06), -0.12, len / 2);
    g.add(beam);
    for (const z of [0.15, len - 0.15]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.3, 6), plank);
      post.position.set(s * (w / 2 + 0.02), 0.6, z);
      g.add(post);
    }
    // tay vịn võng giữa nhịp + dây treo xuống mép ván
    const sag = Math.min(0.45, len * 0.04);
    const pts: THREE.Vector3[] = [];
    const k = Math.max(4, Math.ceil(len / 1.2));
    for (let i = 0; i <= k; i++) {
      const t = i / k;
      pts.push(new THREE.Vector3(s * (w / 2 + 0.02), 1.15 - sag * 4 * t * (1 - t), t * len));
    }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), k * 2, 0.035, 4, false), rope));
    for (let i = 1; i < k; i++) {
      const p = pts[i];
      const hang = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, p.y, 3), rope);
      hang.position.set(p.x, p.y / 2, p.z);
      g.add(hang);
    }
  }
}

/** Tùng lá kim: thân + 3 nón xếp tầng (màu theo đỉnh: chân tán tối, ngọn sáng); cao ~7 m × scale. */
function firGeometry(c: Colors): THREE.BufferGeometry {
  const top = new THREE.Color(c.fir[0]);
  const low = new THREE.Color(c.fir[1]);
  const paint = (g: THREE.BufferGeometry, f: (y: number) => THREE.Color): THREE.BufferGeometry => {
    const geo = g.toNonIndexed();
    geo.deleteAttribute('uv');
    const pos = geo.getAttribute('position');
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const cc = f(pos.getY(i));
      col.set([cc.r, cc.g, cc.b], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    return geo;
  };
  const parts = [
    paint(new THREE.CylinderGeometry(0.16, 0.24, 1.6, 5).translate(0, 0.8, 0), () => new THREE.Color(c.firTrunk)),
    ...[
      [2.0, 2.8, 2.6],
      [1.55, 2.4, 4.1],
      [1.05, 2.1, 5.5],
    ].map(([r, h, y]) => paint(new THREE.ConeGeometry(r, h, 7).translate(0, y, 0), (py) => low.clone().lerp(top, Math.min(1, Math.max(0, (py - y + h / 2) / h))))),
  ];
  const g = mergeGeometries(parts);
  for (const p of parts) p.dispose();
  return g;
}

/** Phong đỏ: thân chạc đôi + 4 khối tán dẹt đỏ cam (màu theo đỉnh). Cao ~5 m × scale. */
function mapleGeometry(c: Colors): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const add = (g: THREE.BufferGeometry, color: THREE.Color, k = 1): void => {
    const geo = g.index ? g.toNonIndexed() : g;
    geo.deleteAttribute('uv');
    const pos = geo.getAttribute('position');
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const lit = k === 1 ? 1 : 0.78 + 0.22 * Math.min(1, Math.max(0, (pos.getY(i) - 2.6) / 2));
      col.set([color.r * lit, color.g * lit, color.b * lit], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    parts.push(geo);
  };
  const trunk = new THREE.Color(c.mapleTrunk);
  add(new THREE.CylinderGeometry(0.14, 0.24, 2.6, 5).translate(0, 1.3, 0), trunk);
  add(new THREE.CylinderGeometry(0.08, 0.12, 1.4, 4).rotateZ(0.6).translate(-0.45, 2.7, 0), trunk);
  add(new THREE.CylinderGeometry(0.08, 0.12, 1.4, 4).rotateZ(-0.6).translate(0.45, 2.7, 0), trunk);
  const a = new THREE.Color(c.maple[0]);
  const b = new THREE.Color(c.maple[1]);
  (
    [
      [0, 3.6, 0, 1.7, a],
      [-1.1, 3.2, 0.3, 1.25, b],
      [1.0, 3.3, -0.3, 1.3, b],
      [0.2, 4.4, 0.2, 1.15, a],
    ] as [number, number, number, number, THREE.Color][]
  ).forEach(([x, y, z, r, col]) => add(new THREE.IcosahedronGeometry(r, 1).scale(1, 0.72, 1).translate(x, y, z), col, 0));
  const g = mergeGeometries(parts);
  for (const p of parts) p.dispose();
  return g;
}

/** Một InstancedMesh cho mọi cây cùng dáng (màu theo đỉnh × màu từng cây hơi lệch). */
function plant(scene: THREE.Scene, geo: THREE.BufferGeometry, look: LookSpec, list: Placed[], rand: () => number): void {
  if (!list.length) return;
  const mat = isSoft(look) ? softMaterial(look.wrap) : new THREE.MeshLambertMaterial({ vertexColors: true });
  const mesh = new THREE.InstancedMesh(geo, mat, list.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const col = new THREE.Color();
  list.forEach((t, i) => {
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI * 2);
    mesh.setMatrixAt(i, m.compose(new THREE.Vector3(t.x, t.y ?? 0, t.z), q, new THREE.Vector3(t.scale, t.scale * (0.9 + rand() * 0.2), t.scale)));
    const k = 0.9 + rand() * 0.14;
    mesh.setColorAt(i, col.setRGB(k, k, k));
  });
  finish(scene, [mesh]);
}

/** Hộp va chạm thân cột: 3 hộp thẳng trục nội tiếp vòng `r` (gần như 12 cạnh); chặn khi chân thấp hơn đỉnh. */
export function pillarCollider(colliders: Colliders, x: number, z: number, r: number, top: number): void {
  for (const a of [15, 45, 75]) {
    const k = (a * Math.PI) / 180;
    colliders.add(x, z, 2 * r * Math.cos(k), 2 * r * Math.sin(k), 0, { maxY: top - 0.5 });
  }
}

/** (x, z) có nằm trên mặt cầu nào (nới `pad` m mỗi bên) không. */
export function onBridge(bridges: PillarBridgeSpec[], w: number, x: number, z: number, pad: number): boolean {
  return bridges.some((b) => {
    const [minX, maxX] = [Math.min(b.from[0], b.to[0]), Math.max(b.from[0], b.to[0])];
    const [minZ, maxZ] = [Math.min(b.from[1], b.to[1]), Math.max(b.from[1], b.to[1])];
    const alongX = b.from[1] === b.to[1];
    const hw = w / 2 + pad;
    return alongX ? x >= minX - pad && x <= maxX + pad && Math.abs(z - b.from[1]) <= hw : z >= minZ - pad && z <= maxZ + pad && Math.abs(x - b.from[0]) <= hw;
  });
}

/** Rào vô hình theo vòng bán kính `r` quanh (x, z) từ góc `a0` dài `span`, ở độ cao `y`; chừa chỗ đầu cầu. */
export function rimFence(colliders: Colliders, v: PillarValleySpec, x: number, z: number, r: number, y: number, a0 = 0, span = Math.PI * 2): void {
  const n = Math.ceil((span * r) / FENCE_GAP);
  for (let i = 0; i <= n; i++) {
    const a = a0 + (i / n) * span;
    const px = x + Math.sin(a) * r;
    const pz = z + Math.cos(a) * r;
    if (onBridge(v.bridges, v.bridgeWidth, px, pz, 0.35)) continue;
    block(colliders, px, pz, y - 0.6, y + 2);
  }
}

/** Mặt đi được của cầu: cầu nằm trên gờ / đỉnh bao nhiêu thì lan can bỏ đoạn đó (đi ra gờ được). */
function bridgeRails(colliders: Colliders, b: PillarBridgeSpec, w: number, onTop: (x: number, z: number) => boolean): void {
  const len = Math.hypot(b.to[0] - b.from[0], b.to[1] - b.from[1]);
  const dx = (b.to[0] - b.from[0]) / len;
  const dz = (b.to[1] - b.from[1]) / len;
  for (let s = 0.2; s < len; s += 0.5) {
    const x = b.from[0] + dx * s;
    const z = b.from[1] + dz * s;
    if (onTop(x, z)) continue;
    for (const side of [-1, 1]) block(colliders, x + dz * side * (w / 2 + 0.1), z - dx * side * (w / 2 + 0.1), b.y - 0.6, b.y + 2, 0.3);
  }
}

/**
 * Dựng cột phụ, cầu treo, tùng lá kim, phong. `surfaceAt(x, z)` = có gờ / đỉnh nào (kể cả cột chính) ở đó — để lan can cầu
 * chừa đoạn nằm trên gờ. Trả về tấm đi được (gờ, đỉnh, mặt cầu — tầng trên).
 */
export function addPillarValley(
  scene: THREE.Scene,
  colliders: Colliders,
  v: PillarValleySpec,
  trees: SceneSpec['trees'],
  look: LookSpec,
  groundY: GroundY,
  surfaceAt: (x: number, z: number) => boolean,
): Pad[] {
  const c = v.colors;
  const rand = seededRandom(v.seed * 7477 + 3);
  const pads: Pad[] = [];
  const pines: Placed[] = [];
  const maples: Placed[] = [];
  const reached = (x: number, z: number, r: number): boolean => v.bridges.some((b) => [b.from, b.to].some(([bx, bz]) => Math.hypot(bx - x, bz - z) <= r + 0.05));
  v.pillars.forEach((p: StonePillarSpec) => {
    const base = groundY(p.x, p.z);
    const g = new THREE.Group();
    g.position.set(p.x, base, p.z);
    pillarBody(g, p.h, p.r, c, rand, !!p.ledge);
    grassCap(g, p.h, p.r, c);
    const arc = ledgeArc(v, p);
    if (arc && p.ledge) ledgeShelf(g, p.ledge, p.r, v.ledgeWidth, c, arc.a0, arc.span);
    scene.add(g);
    pillarCollider(colliders, p.x, p.z, p.r, base + p.h);
    const top = base + p.h;
    pads.push({ minX: p.x - p.r, maxX: p.x + p.r, minZ: p.z - p.r, maxZ: p.z + p.r, y: top, round: true, upper: true });
    if (reached(p.x, p.z, p.r)) rimFence(colliders, v, p.x, p.z, p.r - 0.35, top);
    if (arc && p.ledge) {
      // gờ chỉ là cung quanh các đầu cầu (tấm phẳng dạng `helix` không dốc); hai đầu cung chặn ngang
      const R = p.r + v.ledgeWidth;
      const L = base + p.ledge;
      pads.push({ minX: p.x - R, maxX: p.x + R, minZ: p.z - R, maxZ: p.z + R, y: L, upper: true, helix: { r0: p.r, r1: R, a0: arc.a0, rise: 0, span: arc.span } });
      rimFence(colliders, v, p.x, p.z, R - 0.25, L, arc.a0, arc.span);
      for (const a of [arc.a0 - 0.1, arc.a0 + arc.span + 0.1])
        for (let rr = p.r + 0.3; rr <= R; rr += 0.35) block(colliders, p.x + Math.sin(a) * rr, p.z + Math.cos(a) * rr, L - 0.6, L + 2);
    }
    // cây trên đỉnh: tùng lệch tâm, phong một bên
    const n = p.pines ?? 0;
    const a0 = rand() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / Math.max(1, n)) * Math.PI * 2;
      const d = p.r * (0.35 + rand() * 0.3);
      pines.push({ x: p.x + Math.sin(a) * d, z: p.z + Math.cos(a) * d, y: top, scale: 0.8 + rand() * 0.4, collide: false });
    }
    if (p.maple) maples.push({ x: p.x + Math.sin(a0 + Math.PI) * p.r * 0.45, z: p.z + Math.cos(a0 + Math.PI) * p.r * 0.45, y: top, scale: 0.8, collide: false });
  });
  for (const b of v.bridges) {
    ropeBridge(scene, b, v.bridgeWidth, c);
    const hw = v.bridgeWidth / 2;
    pads.push({
      minX: Math.min(b.from[0], b.to[0]) - (b.from[0] === b.to[0] ? hw : 0),
      maxX: Math.max(b.from[0], b.to[0]) + (b.from[0] === b.to[0] ? hw : 0),
      minZ: Math.min(b.from[1], b.to[1]) - (b.from[1] === b.to[1] ? hw : 0),
      maxZ: Math.max(b.from[1], b.to[1]) + (b.from[1] === b.to[1] ? hw : 0),
      y: b.y,
      upper: true,
    });
    bridgeRails(colliders, b, v.bridgeWidth, surfaceAt);
  }
  // tùng lá kim + phong dưới thung (thân chặn)
  const firs: Placed[] = [];
  v.firs.forEach((f, i) => {
    const r = seededRandom(v.seed * 131 + i * 17 + 5);
    for (let k = 0; k < f.count; k++) {
      const x = f.x + (r() - 0.5) * f.w;
      const z = f.z + (r() - 0.5) * f.d;
      firs.push({ x, z, y: groundY(x, z) - 0.1, scale: (0.75 + r() * 0.55) * (f.scale ?? 1), collide: true });
    }
  });
  for (const m of v.maples) maples.push({ x: m.x, z: m.z, y: groundY(m.x, m.z) - 0.1, scale: m.scale, collide: true });
  for (const t of [...firs, ...maples]) if (t.collide) colliders.add(t.x, t.z, 0.7 * t.scale, 0.7 * t.scale);
  plant(scene, firGeometry(c), look, firs, rand);
  plant(scene, mapleGeometry(c), look, maples, rand);
  addPine(scene, trees, pines, v.seed, look);
  return pads;
}
