/**
 * Cột chính Đỉnh Hạc Bay (V-111, concept `design/concept/dinh-hac-bay/{toan-canh,cong-trinh,vao}.png`): cột đá vôi cao
 * nhất giữa thung; bậc đá xoắn quanh thân từ chân lên **gờ** giữa chừng (đầu cầu treo), gờ chạy quanh thân, bậc thứ hai lên
 * **thềm cỏ** trên đỉnh: đình bát giác cột son, lan can vôi trắng, mái ngói xám cong vểnh góc; một cây tùng cổ nghiêng ra mép;
 * hạc trắng đỉnh đỏ đứng trên chóp / góc mái / cành tùng / thềm. Bậc, gờ, thềm, nền đình là tấm đi được tầng trên (`helix`,
 * tấm tròn); mép thềm, mép gờ, mép ngoài bậc chặn bằng hộp có khoảng cao. Khối tĩnh Lambert → `mergeSoft` gộp; hạc đứng
 * một InstancedMesh.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import { helixPoint, peakStairs, surfacesAt, type Helix, type PillarValleySpec } from './dinhHacSpec';
import { isSoft, type LookSpec } from './look';
import { lambert, softMaterial } from './materials';
import { seededRandom } from './random';
import type { SceneSpec } from './spec';
import type { GroundY } from './terrainHeight';
import { finish } from './trees';
import { addPillarValley, block, grassCap, ledgeShelf, onBridge, pillarBody, pillarCollider, rimFence } from './vat_dinh_hac';

type Colors = PillarValleySpec['colors'];
type V3 = [number, number, number];

/** Bậc: bước dọc bậc (m ở giữa), dày khối bậc dưới mặt (m). */
const STEP_RUN = 0.55;
const STEP_BLOCK = 0.9;
/** Khối bậc cắm sâu vào thân (m) — thân 8 mặt vát, mặt phẳng lõm hơn bán kính. */
const STEP_BURY = 1.1;
/** Chân bậc 1 (mặt ≤ 0,6 m — bước lên từ mọi phía): không lan can. */
const FOOT_RISE = 0.6;
/** Cung cuối bậc 2 mở vào thềm (rad). */
const EXIT_ARC = 0.55;
/** Đình: cao cột son (m), nền đá cao (m). */
const COL_H = 2.7;
const BASE_H = 0.45;

const put = (g: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number): THREE.Mesh => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  g.add(m);
  return m;
};

/** Khối bậc đá dọc vành xoắn `s` (toạ độ cục bộ cột); khối kéo xuống tận đất khi bậc còn thấp. Cọc đá thấp ở mép ngoài. */
function stairs(g: THREE.Group, s: Helix, c: Colors): void {
  const stone = lambert(c.base);
  const shade = lambert(c.rockDark);
  const rm = (s.r0 + s.r1) / 2;
  const n = Math.ceil((s.span * rm) / STEP_RUN);
  const width = s.r1 - s.r0 + STEP_BURY;
  const depth = ((s.span * rm) / n) * 1.15;
  for (let i = 0; i < n; i++) {
    const t = ((i + 0.5) / n) * s.span;
    const [x, y, z] = helixPoint(s, t, rm - STEP_BURY / 2);
    const h = Math.min(y + 0.05, STEP_BLOCK);
    const step = put(g, new THREE.BoxGeometry(depth, h, width), i % 4 === 3 ? shade : stone, x - s.cx, y - h / 2, z - s.cz);
    step.rotation.y = s.a0 + t;
    if (i % 4 === 0 && s.y0 + s.rise * t > FOOT_RISE) {
      const [px, py, pz] = helixPoint(s, t, s.r1 - 0.15);
      put(g, new THREE.CylinderGeometry(0.13, 0.16, 0.5, 5), shade, px - s.cx, py + 0.25, pz - s.cz);
    }
  }
}

/** Mái đình: lathe 32 cạnh ép về bát giác (góc ở `corner0` + kπ/4), mặt cong lõm, góc mái vểnh; có mặt gầm. */
function roof(r: number, base: number, top: number, corner0: number): THREE.BufferGeometry {
  const prof: [number, number][] = [
    [0.15, top],
    [r * 0.28, top - 0.55],
    [r * 0.55, base + 1.15],
    [r * 0.82, base + 0.45],
    [r, base + 0.12],
    [r, base - 0.08],
    [r * 0.7, base + 0.1],
    [r * 0.62, base - 0.05],
  ];
  const geo = new THREE.LatheGeometry(
    prof.map(([pr, py]) => new THREE.Vector2(pr, py)).reverse(),
    32,
  ).toNonIndexed();
  const pos = geo.getAttribute('position');
  const seg = Math.PI / 4;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const d = Math.hypot(x, z);
    if (d < 1e-4) continue;
    const a = Math.atan2(x, z) - corner0;
    const off = ((((a % seg) + seg) % seg) - seg / 2) / (seg / 2); // −1 … 1, ±1 ở góc
    const k = Math.cos(Math.PI / 8) / Math.cos((off * Math.PI) / 8); // ép lên cạnh bát giác
    const lift = 0.55 * (d / r) ** 3 * off * off; // góc vểnh
    pos.setXYZ(i, x * k, pos.getY(i) + lift, z * k);
  }
  geo.deleteAttribute('uv');
  geo.computeVertexNormals();
  return geo;
}

/** Đình bát giác (toạ độ cục bộ, gốc ở mặt thềm giữa đình), lối vào nhìn +z. Trả về chỗ đứng hạc (chóp + 2 góc mái). */
function pavilion(g: THREE.Group, r: number, h: number, c: Colors): V3[] {
  const corner0 = Math.PI / 8; // cột ở góc, mặt phẳng nhìn +z (lối vào)
  const base = lambert(c.base);
  const col = lambert(c.column);
  const beam = lambert(c.beam);
  const rail = lambert(c.rail);
  put(g, new THREE.CylinderGeometry(r + 0.3, r + 0.42, BASE_H, 8, 1, false, corner0), base, 0, BASE_H / 2, 0);
  // hai bậc thấp trước lối vào
  for (const [dz, sh] of [
    [0.15, 0.3],
    [0.45, 0.15],
  ])
    put(g, new THREE.BoxGeometry(1.8, sh, 0.3), base, 0, sh / 2, (r + 0.3) * Math.cos(Math.PI / 8) + dz);
  const at = (k: number, rr: number): [number, number] => [Math.sin(corner0 + (k * Math.PI) / 4) * rr, Math.cos(corner0 + (k * Math.PI) / 4) * rr];
  const chord = 2 * r * Math.sin(Math.PI / 8);
  for (let k = 0; k < 8; k++) {
    const [x, z] = at(k, r);
    put(g, new THREE.CylinderGeometry(0.15, 0.17, COL_H, 7), col, x, BASE_H + COL_H / 2, z);
    const mid = corner0 + ((k + 0.5) * Math.PI) / 4;
    const mr = r * Math.cos(Math.PI / 8);
    const yaw = mid;
    // xà trên đầu cột + diềm hoa gỗ
    put(g, new THREE.BoxGeometry(chord, 0.3, 0.2), beam, Math.sin(mid) * mr, BASE_H + COL_H - 0.05, Math.cos(mid) * mr).rotation.y = yaw + Math.PI / 2;
    put(g, new THREE.BoxGeometry(chord * 0.86, 0.14, 0.1), col, Math.sin(mid) * mr, BASE_H + COL_H - 0.4, Math.cos(mid) * mr).rotation.y = yaw + Math.PI / 2;
    // lan can vôi trắng (bỏ mặt lối vào nhìn +z — giữa cột 7 và 0)
    if (k === 7) continue;
    put(g, new THREE.BoxGeometry(chord - 0.3, 0.5, 0.12), rail, Math.sin(mid) * mr, BASE_H + 0.25, Math.cos(mid) * mr).rotation.y = yaw + Math.PI / 2;
    put(g, new THREE.BoxGeometry(chord - 0.2, 0.08, 0.2), col, Math.sin(mid) * mr, BASE_H + 0.54, Math.cos(mid) * mr).rotation.y = yaw + Math.PI / 2;
  }
  const eaveR = r + 1.15;
  const roofBase = BASE_H + COL_H + 0.15;
  const roofTop = h - 0.7;
  put(g, roof(eaveR, roofBase, roofTop, corner0), lambert(c.roof, { side: THREE.DoubleSide }), 0, 0, 0);
  // bờ nóc: 8 sống mái từ chóp xuống góc (vểnh theo góc mái)
  const ridge = lambert(c.ridge);
  for (let k = 0; k < 8; k++) {
    const [x1, z1] = at(k, eaveR + 0.1);
    const a = new THREE.Vector3(0, roofTop, 0);
    const mid = new THREE.Vector3(x1 * 0.55, roofBase + 1.25, z1 * 0.55);
    const b = new THREE.Vector3(x1, roofBase + 0.75, z1);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 6, 0.09, 4, false), ridge));
  }
  // chóp: bầu + búp
  put(g, new THREE.CylinderGeometry(0.22, 0.32, 0.3, 8), ridge, 0, roofTop + 0.1, 0);
  put(g, new THREE.SphereGeometry(0.3, 8, 6), ridge, 0, roofTop + 0.42, 0);
  put(g, new THREE.ConeGeometry(0.14, 0.4, 6), ridge, 0, roofTop + 0.85, 0);
  const corner = (k: number): V3 => {
    const [x, z] = at(k, eaveR - 0.1);
    return [x, roofBase + 0.6, z];
  };
  return [[0, roofTop + 1.05, 0], corner(2), corner(5)];
}

/** Tùng cổ (toạ độ cục bộ, gốc ở mặt thềm, nghiêng theo +x): thân xoắn ba khúc, 3 cành, 7 đám lá dẹt. Trả về chỗ đứng hạc trên cành. */
function oldPine(g: THREE.Group, c: Colors, rand: () => number): V3[] {
  const bark = lambert(c.pineTrunk);
  const tube = (pts: V3[], r: number): void => {
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 10, r, 6, false), bark));
  };
  const trunk: V3[] = [
    [0, -0.3, 0],
    [0.15, 1.2, 0.1],
    [0.9, 2.6, -0.2],
    [2.2, 3.4, 0.1],
    [3.6, 4.1, -0.1],
    [4.9, 5.0, 0.2],
    [5.8, 5.9, 0],
  ];
  tube(trunk.slice(0, 4), 0.48);
  tube(trunk.slice(2, 6), 0.34);
  tube(trunk.slice(4), 0.22);
  put(g, new THREE.SphereGeometry(0.75, 7, 5).scale(1, 0.5, 1), bark, 0, 0, 0); // gốc phình
  const branches: V3[][] = [
    [trunk[2], [0.4, 3.9, -1.1], [-0.4, 4.9, -1.6]],
    [trunk[3], [2.6, 4.6, 1.2], [3.0, 5.6, 1.9]],
    [trunk[4], [4.1, 4.4, -1.3], [4.6, 4.6, -2.2]],
  ];
  for (const b of branches) tube(b, 0.14);
  const pads: V3[] = [trunk[6], ...branches.map((b) => b[2]), [1.4, 4.4, 0.6], [5.2, 6.4, -0.6], [2.8, 5.0, -0.9]];
  pads.forEach(([x, y, z], i) => {
    const r = 1.25 + rand() * 0.5;
    const pad = put(g, new THREE.IcosahedronGeometry(1, 1).scale(r, 0.42, r * 0.85), lambert(c.pine[i % 2]), x, y + 0.35, z);
    pad.rotation.y = rand() * Math.PI;
    put(g, new THREE.IcosahedronGeometry(1, 1).scale(r * 0.7, 0.26, r * 0.6), lambert(c.pine[2]), x, y + 0.62, z);
  });
  return [
    [pads[0][0], pads[0][1] + 0.85, pads[0][2]],
    [pads[2][0], pads[2][1] + 0.85, pads[2][2]],
  ];
}

/** Hạc đứng (mũi nhìn +z, chân trên y = 0): thân trắng, cổ + đuôi đen, đỉnh đỏ, mỏ / chân xám; cao ~1,55 m. */
function standingCrane(c: Colors): THREE.BufferGeometry {
  const [white, black, red, leg] = c.crane.map((h) => new THREE.Color(h));
  const parts: [THREE.BufferGeometry, THREE.Color][] = [
    [new THREE.SphereGeometry(0.28, 9, 6).scale(0.8, 0.75, 1.35).translate(0, 0.98, -0.05), white],
    [new THREE.ConeGeometry(0.17, 0.5, 6).rotateX(-Math.PI / 2 - 0.5).translate(0, 0.96, -0.42), black],
    [new THREE.CylinderGeometry(0.04, 0.07, 0.52, 6).rotateX(0.18).translate(0, 1.32, 0.2), black],
    [new THREE.SphereGeometry(0.085, 7, 5).scale(0.9, 0.95, 1.2).translate(0, 1.6, 0.25), white],
    [new THREE.SphereGeometry(0.05, 5, 4).translate(0, 1.67, 0.25), red],
    [new THREE.ConeGeometry(0.025, 0.26, 4).rotateX(Math.PI / 2 + 0.2).translate(0, 1.57, 0.43), leg],
    ...[-1, 1].map((s): [THREE.BufferGeometry, THREE.Color] => [new THREE.CylinderGeometry(0.018, 0.022, 0.78, 4).translate(s * 0.07, 0.39, 0), leg]),
  ];
  const geos = parts.map(([geo, col]) => {
    const g = geo.toNonIndexed();
    geo.dispose();
    g.deleteAttribute('uv');
    const n = g.getAttribute('position').count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) arr.set([col.r, col.g, col.b], i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    return g;
  });
  const out = mergeGeometries(geos);
  for (const g of geos) g.dispose();
  out.computeVertexNormals();
  return out;
}

/**
 * Dựng cột chính (chân ở mặt đất `base`). Trả về tấm đi được: bậc 1, gờ, bậc 2, thềm đỉnh, nền đình (tầng trên).
 */
export function addCranePeak(scene: THREE.Scene, colliders: Colliders, v: PillarValleySpec, look: LookSpec, base: number): Pad[] {
  const p = v.peak;
  const c = v.colors;
  const rand = seededRandom(v.seed * 911 + 7);
  const { s1, ledge, s2 } = peakStairs(p, v.ledgeWidth);
  const g = new THREE.Group();
  g.position.set(p.x, base, p.z);
  scene.add(g);
  pillarBody(g, p.h, p.r, c, rand, true);
  grassCap(g, p.h, p.r, c);
  ledgeShelf(g, p.ledge, p.r, v.ledgeWidth, c, ledge.a0, ledge.span);
  stairs(g, s1, c);
  stairs(g, s2, c);
  // trên thềm: đình, tùng cổ, hạc
  const [px, pz] = p.pavilion.at;
  const pav = new THREE.Group();
  pav.position.set(px, p.h, pz);
  g.add(pav);
  const perches: V3[] = pavilion(pav, p.pavilion.r, p.pavilion.h, c).map(([x, y, z]) => [x + px, y + p.h, z + pz]);
  const [tx, tz] = p.pine.at;
  const tree = new THREE.Group();
  tree.position.set(tx, p.h, tz);
  tree.rotation.y = ((p.pine.dir - 90) * Math.PI) / 180; // +x cục bộ → hướng `dir`
  tree.scale.setScalar(p.pine.scale);
  g.add(tree);
  tree.updateMatrix();
  for (const q of oldPine(tree, c, rand)) perches.push(new THREE.Vector3(...q).applyMatrix4(tree.matrix).toArray() as V3);
  perches.push([px - p.pavilion.r - 1.1, p.h, pz + 0.6]);
  const n = Math.min(p.cranes, perches.length);
  if (n > 0) {
    const mesh = new THREE.InstancedMesh(standingCrane(c), isSoft(look) ? softMaterial(look.wrap) : new THREE.MeshLambertMaterial({ vertexColors: true }), n);
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const [x, y, z] = perches[i];
      const yaw = Math.atan2(x - px, z - pz) + (rand() - 0.5) * 1.2; // nhìn ra ngoài
      mesh.setMatrixAt(i, m.compose(new THREE.Vector3(p.x + x, base + y, p.z + z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw), new THREE.Vector3(1, 1, 1)));
    }
    finish(scene, [mesh]);
  }

  // va chạm (toạ độ cảnh)
  const H = base + p.h;
  pillarCollider(colliders, p.x, p.z, p.r, H);
  const wp = (h: Helix, t: number, r: number): [number, number, number] => {
    const [x, y, z] = helixPoint(h, t, r);
    return [x, base + y, z];
  };
  // mép ngoài bậc: cọc chặn quanh độ cao bậc đó (người dưới đất cạnh bậc thấp cũng bị chặn); bỏ chân bậc 1, cuối bậc 1 (ra gờ)
  for (const s of [s1, s2]) {
    const k = Math.ceil((s.span * s.r1) / 0.5);
    for (let i = 0; i <= k; i++) {
      const t = (i / k) * s.span;
      if (s.y0 + s.rise * t < FOOT_RISE) continue;
      const [x, y, z] = wp(s, t, s.r1 - 0.05);
      block(colliders, x, z, y - 2, y + 0.9, 0.3);
    }
  }
  // gầm bậc 1 thấp (mặt bậc 0,6–2,3 m): người dưới đất không chui vào
  const rm = (s1.r0 + s1.r1) / 2;
  for (let t = FOOT_RISE / s1.rise; t <= 2.3 / s1.rise; t += 0.4 / rm) {
    for (const r of [s1.r0 + 0.4, rm, s1.r1 - 0.4]) {
      const [x, , z] = wp(s1, t, r);
      block(colliders, x, z, -Infinity, base + 0.12, 0.5);
    }
  }
  // gờ: rào mép ngoài (chừa đầu cầu) + chặn hai đầu gờ phần rộng hơn bậc
  const L = base + p.ledge;
  rimFence(colliders, v, p.x, p.z, ledge.r1 - 0.25, L, ledge.a0 - 0.12, ledge.span + 0.24);
  for (const t of [-0.08, ledge.span + 0.08]) {
    for (let r = s1.r1 + 0.1; r <= ledge.r1 + 0.1; r += 0.3) {
      const [x, , z] = wp(ledge, t, r);
      if (!onBridge(v.bridges, v.bridgeWidth, x, z, 0.2)) block(colliders, x, z, L - 0.6, L + 2, 0.45);
    }
  }
  // thềm đỉnh: rào mép (chừa cung lối ra bậc 2) + chắn ngang sau bậc cuối
  const end = s2.a0 + s2.span;
  rimFence(colliders, v, p.x, p.z, p.r - 0.35, H, end + 0.05, Math.PI * 2 - EXIT_ARC - 0.05);
  for (let r = s2.r0 + 0.1; r <= s2.r1 + 0.05; r += 0.35) {
    const [x, , z] = wp(s2, s2.span + 0.12, r);
    block(colliders, x, z, H - 1.2, H + 2);
  }
  // đình: cột + lan can (trừ lối vào phía +z), gốc tùng, hạc đứng trên thềm
  const cx = p.x + px;
  const cz = p.z + pz;
  const pr = p.pavilion.r;
  for (let k = 0; k < 8; k++) {
    const a0 = Math.PI / 8 + (k * Math.PI) / 4;
    block(colliders, cx + Math.sin(a0) * pr, cz + Math.cos(a0) * pr, H - 0.6, H + 3, 0.4);
    if (k === 7) continue;
    for (let f = 0.2; f < 1; f += 0.2) {
      const a = a0 + (f * Math.PI) / 4;
      const rr = pr * Math.cos(Math.PI / 8) / Math.cos(a - a0 - Math.PI / 8);
      block(colliders, cx + Math.sin(a) * rr, cz + Math.cos(a) * rr, H - 0.6, H + 3, 0.35);
    }
  }
  block(colliders, p.x + tx, p.z + tz, H - 0.6, H + 3, 0.9 * p.pine.scale);
  if (n >= perches.length) {
    const [x, , z] = perches[perches.length - 1];
    block(colliders, p.x + x, p.z + z, H - 0.6, H + 3, 0.5);
  }

  const helixPad = (h: Helix): Pad => ({
    minX: h.cx - h.r1,
    maxX: h.cx + h.r1,
    minZ: h.cz - h.r1,
    maxZ: h.cz + h.r1,
    y: base + h.y0,
    upper: true,
    helix: { r0: h.r0, r1: h.r1, a0: h.a0, rise: h.rise, span: h.span },
  });
  const PR = pr + 0.3;
  return [
    helixPad(s1),
    helixPad(ledge),
    helixPad(s2),
    { minX: p.x - p.r, maxX: p.x + p.r, minZ: p.z - p.r, maxZ: p.z + p.r, y: H, round: true, upper: true },
    { minX: cx - PR, maxX: cx + PR, minZ: cz - PR, maxZ: cz + PR, y: H + BASE_H, round: true, upper: true },
  ];
}

/** Đỉnh Hạc Bay cả cảnh: cột chính (nếu bật) + cột phụ, cầu treo, cây. Trả về tấm đi được (tầng trên). Rỗng / tắt = không dựng gì. */
export function addDinhHac(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec, groundY: GroundY): Pad[] {
  const v = spec.pillarValley;
  if (!v.peak.enabled && !v.pillars.length && !v.bridges.length && !v.firs.length && !v.maples.length) return [];
  const peak = v.peak.enabled ? addCranePeak(scene, colliders, v, spec.look, groundY(v.peak.x, v.peak.z)) : [];
  const onTop = (x: number, z: number): boolean => surfacesAt(v, x, z, groundY).length > 0;
  return [...peak, ...addPillarValley(scene, colliders, v, spec.trees, spec.look, groundY, onTop)];
}
