/**
 * Cung Ngọc Đáy Biển (V-110, concept `design/concept/cung-ngoc-day-bien/`): Cung Vỏ Sò trên nền san hô, bãi cát trắng
 * viền cuội, hang đá, vỏ trai ngọc, cột san hô cửa lặn, san hô, rong, vệt nắng xiên, bong bóng, đàn cá.
 *
 * "Dưới nước" không có hậu kỳ: màu trời / sương xanh ngọc (đặc tả cảnh) + vệt nắng là dải cộng màu cố định (1 draw call) +
 * bong bóng, cá InstancedMesh (mỗi thứ 1 draw call, động). Khối tĩnh (cung, nền, hang, trai, cột, cát) là Lambert → `mergeSoft`
 * gộp thành khối mềm bóng nướng sẵn. San hô 2 dáng, rong (lay theo gió chung), cuội, ngọc: InstancedMesh. Không đèn thật.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import type { SeaFloorSpec } from './cungNgocSpec';
import { addPalace } from './cungVoSo';
import { addBubbles, addFish } from './dongBien';
import { instMaterial, onPath, plain, shadeY, taperTube, v3, type V3 } from './hinhBien';
import { lambert } from './materials';
import { seededRandom } from './random';
import type { SceneSpec } from './spec';
import type { GroundY } from './terrainHeight';
import { finish } from './trees';

export interface SeaFloor3D {
  /** mặt nền san hô hai bậc (đi lên được) */
  pads: Pad[];
  update(dt: number): void;
}

/* ---------- san hô ---------- */

function branchCoralGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [taperTube([v3(0, 0, 0), v3(0, 0.35, 0), v3(0, 0.5, 0)], 0.13, 0.1, 6)];
  const arms: [number, number, number][] = [
    [0.38, 0.95, 0.05],
    [-0.36, 0.9, 0.12],
    [0.08, 1.05, -0.32],
    [-0.12, 1.0, -0.3],
    [0.02, 1.1, 0.34],
  ];
  for (const [x, y, z] of arms) {
    const pts = new THREE.CatmullRomCurve3([v3(0, 0.4, 0), v3(x * 0.55, 0.6, z * 0.55), v3(x * 0.85, y * 0.85, z * 0.85), v3(x, y, z)]).getPoints(5);
    parts.push(taperTube(pts, 0.085, 0.05, 5));
  }
  return shadeY(mergeGeometries(parts.map(plain))!, 0.9);
}

/** San hô ống (organ pipe): 5 ống nghiêng toả ra, miệng ống tối (màu đỉnh), cao ≈ 1 m. */
function tubeCoralGeometry(): THREE.BufferGeometry {
  const tubes: [number, number, number, number][] = [
    [0, 0, 1.0, 0],
    [0.22, 0.05, 0.8, 0.25],
    [-0.2, 0.1, 0.72, -0.25],
    [0.05, -0.22, 0.6, 0.18],
    [-0.08, 0.24, 0.52, -0.2],
  ];
  const parts = tubes.map(([x, z, h, lean]) => {
    const c = new THREE.CylinderGeometry(0.11, 0.13, h, 7).translate(0, h / 2, 0);
    c.rotateZ(-lean * 0.35).rotateX(z * 0.8).translate(x, 0, z);
    return plain(c);
  });
  const g = mergeGeometries(parts)!;
  shadeY(g, 0.7, 0.72);
  // miệng ống: mặt hướng lên ở đỉnh ống tối như lỗ
  const pos = g.getAttribute('position');
  const nrm = g.getAttribute('normal');
  const col = g.getAttribute('color');
  for (let i = 0; i < pos.count; i++) if (nrm.getY(i) > 0.8 && pos.getY(i) > 0.4) col.setXYZ(i, 0.45, 0.45, 0.45);
  return g;
}

/* ---------- vật rải quanh sân ---------- */

/** Hang đá: gò đá cục mịch + 2 tảng, vòm đá + miệng hang tối nhìn +z (trước quay). */
function addCave(scene: THREE.Scene, colliders: Colliders, cv: SeaFloorSpec['caves'][number], i: number, f: SeaFloorSpec, y: number, rand: () => number): void {
  const g = new THREE.Group();
  g.position.set(cv.x, y, cv.z);
  g.rotation.y = ((cv.rotY ?? 0) * Math.PI) / 180;
  const r = cv.r;
  const rock = f.colors.rock[i % 2];
  const mound = new THREE.IcosahedronGeometry(1, 1);
  const mp = mound.getAttribute('position');
  for (let k = 0; k < mp.count; k++) {
    const j = 0.9 + rand() * 0.2;
    mp.setXYZ(k, mp.getX(k) * j, mp.getY(k) * j, mp.getZ(k) * j);
  }
  // đỉnh cùng chỗ của các mặt khác nhau lệch khác nhau → nứt; gộp lại theo vị trí gốc
  mound.deleteAttribute('normal');
  mound.deleteAttribute('uv');
  const merged = mergeVerticesByIndex(mound);
  merged.scale(r, r * 0.62, r * 0.75);
  merged.computeVertexNormals();
  const add = (geo: THREE.BufferGeometry, color: string, x: number, yy: number, z: number): void => {
    const m = new THREE.Mesh(geo, lambert(color));
    m.position.set(x, yy, z);
    g.add(m);
  };
  add(merged, rock, 0, 0, 0);
  add(new THREE.DodecahedronGeometry(r * 0.42, 0), f.colors.rock[(i + 1) % 2], r * 0.78, r * 0.08, -r * 0.18);
  add(new THREE.DodecahedronGeometry(r * 0.32, 0), rock, -r * 0.82, r * 0.02, -r * 0.05);
  const hole = 0.4 * r;
  add(new THREE.TorusGeometry(hole, 0.13 * r, 5, 10, Math.PI), rock, 0, 0, 0.8 * r);
  add(new THREE.CircleGeometry(hole, 10, 0, Math.PI), f.colors.cave, 0, 0, 0.8 * r);
  scene.add(g);
  colliders.addCircle(cv.x, cv.z, r * 0.85);
}

/** Gộp đỉnh trùng vị trí (Icosahedron không chỉ mục) để méo đỉnh không làm nứt mặt: dựng lại có chỉ mục. */
function mergeVerticesByIndex(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const pos = g.getAttribute('position');
  const key = new Map<string, number>();
  const out: number[] = [];
  const idx: number[] = [];
  const first: [number, number, number][] = [];
  for (let i = 0; i < pos.count; i++) {
    // làm tròn theo vị trí trước méo: dùng hướng (đỉnh trên mặt cầu đơn vị ±20 %) — hướng chuẩn hoá đủ phân biệt
    const v = v3(pos.getX(i), pos.getY(i), pos.getZ(i));
    const d = v.clone().normalize();
    const k = `${d.x.toFixed(3)},${d.y.toFixed(3)},${d.z.toFixed(3)}`;
    let at = key.get(k);
    if (at === undefined) {
      at = out.length / 3;
      key.set(k, at);
      out.push(v.x, v.y, v.z);
      first.push([v.x, v.y, v.z]);
    }
    idx.push(at);
  }
  const res = new THREE.BufferGeometry();
  res.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  res.setIndex(idx);
  return res;
}

/** Vỏ trai mở: nửa dưới + nửa trên mở ~60° (bản lề phía sau), lòng hồng; ngọc trả về để dựng chung. */
function addClam(scene: THREE.Scene, colliders: Colliders, cl: SeaFloorSpec['clams'][number], f: SeaFloorSpec, y: number): { at: V3; r: number } {
  const s = cl.s ?? 1;
  const g = new THREE.Group();
  g.position.set(cl.x, y, cl.z);
  g.rotation.y = ((cl.rotY ?? 0) * Math.PI) / 180;
  g.scale.setScalar(s);
  const c = f.colors;
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).scale(1, 0.38, 0.85), lambert(c.clam));
  bowl.position.y = 0.3;
  g.add(bowl);
  const innerB = new THREE.Mesh(new THREE.CircleGeometry(0.76, 12).rotateX(-Math.PI / 2).scale(1, 1, 0.85), lambert(c.clamInner));
  innerB.position.y = 0.31;
  g.add(innerB);
  const hinge = new THREE.Group();
  hinge.position.set(0, 0.32, -0.66);
  hinge.rotation.x = -1.0;
  const lid = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.42, 0.85), lambert(c.clam));
  lid.position.z = 0.66;
  hinge.add(lid);
  const innerT = new THREE.Mesh(new THREE.CircleGeometry(0.76, 12).rotateX(Math.PI / 2).scale(1, 1, 0.85), lambert(c.clamInner));
  innerT.position.set(0, -0.01, 0.66);
  hinge.add(innerT);
  g.add(hinge);
  scene.add(g);
  colliders.addCircle(cl.x, cl.z, 0.75 * s);
  g.updateMatrixWorld(true);
  return { at: v3(0, 0.55, 0.05).applyMatrix4(g.matrixWorld), r: 0.26 * s };
}

/** Cột đá san hô cửa lặn: chân vuông, thân sáu cạnh, mũ, khối đá mài trên đỉnh. */
function addPillar(scene: THREE.Scene, colliders: Colliders, pl: SeaFloorSpec['pillars'][number], color: string, y: number): void {
  const add = (geo: THREE.BufferGeometry, yy: number): void => {
    const m = new THREE.Mesh(geo, lambert(color));
    m.position.set(pl.x, y + yy, pl.z);
    scene.add(m);
  };
  add(new THREE.BoxGeometry(1.1, 0.5, 1.1), 0.25);
  add(new THREE.CylinderGeometry(0.36, 0.42, pl.h, 6), 0.5 + pl.h / 2);
  add(new THREE.CylinderGeometry(0.55, 0.45, 0.3, 6), 0.65 + pl.h);
  add(new THREE.DodecahedronGeometry(0.6, 0).scale(1, 1.15, 1), 1.4 + pl.h);
  colliders.addCircle(pl.x, pl.z, 0.62);
}

/* ---------- ghép ---------- */

/**
 * Dựng đáy biển theo `spec.seaFloor`. Không có gì trong đặc tả → không dựng (cảnh cũ không đổi). Trả về tấm đi được (nền
 * cung) và hàm cập nhật (bong bóng, cá).
 */
export function addSeaFloor(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec, groundY: GroundY): SeaFloor3D {
  const f = spec.seaFloor;
  const look = spec.look;
  const p = f.palace;
  const empty = !p.enabled && !f.sand.length && !f.caves.length && !f.clams.length && !f.pillars.length && !f.corals.length && !f.kelp.length && !f.beams.length && !f.bubbles.length && !f.fish.length;
  if (empty) return { pads: [], update: () => {} };
  const rand = seededRandom(f.seed);
  const c = f.colors;
  const pearls: { at: V3; r: number }[] = [];
  const coralSpots: { at: V3; s: number; kind: number }[] = [];
  let pads: Pad[] = [];
  const py = p.enabled ? groundY(p.x, p.z) : 0;
  /** mặt đứng của vật trang trí: trên nền cung (hai bậc) hoặc mặt đất */
  const floorY = (x: number, z: number): number => {
    if (!p.enabled) return groundY(x, z);
    const d = Math.hypot(x - p.x, z - p.z);
    return d < p.plinthR - 0.8 ? py + p.plinthH : d < p.plinthR ? py + p.plinthH / 2 : groundY(x, z);
  };
  if (p.enabled) {
    const pal = addPalace(scene, colliders, f, py, c.kelp);
    pads = pal.pads;
    pearls.push(...pal.pearls);
    for (const t of pal.coralTops) coralSpots.push({ at: t, s: 0.9, kind: 0 });
  }
  // bãi cát trắng (cùng màu)
  // bãi sau nổi cao hơn bãi trước 4 mm: chỗ chồng nhau luôn thấy một mặt (không chớp, không lộ vệt màu nướng lệch)
  f.sand.forEach((s, i) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(s.r, s.r, 0.06, Math.max(24, Math.round(s.r * 7))), lambert(c.sand));
    m.position.set(s.x, groundY(s.x, s.z) + 0.03 + i * 0.004, s.z);
    scene.add(m);
  });
  f.caves.forEach((cv, i) => addCave(scene, colliders, cv, i, f, groundY(cv.x, cv.z), rand));
  for (const cl of f.clams) pearls.push(addClam(scene, colliders, cl, f, groundY(cl.x, cl.z)));
  for (const pl of f.pillars) addPillar(scene, colliders, pl, c.coral, groundY(pl.x, pl.z));

  // chỗ không rải san hô / rong: lối đi, bãi hạc, cổng, quanh thân ốc + trước cửa
  const yard = spec.stoneYard;
  const blocked = (x: number, z: number): boolean => {
    if (onPath(spec.paths, x, z, 0.35)) return true;
    if (yard.enabled && Math.hypot(x - yard.center[0], z - yard.center[1]) < yard.radius + 0.4) return true;
    if (spec.portals.some((pt) => x > pt.area.from[0] - 1 && x < pt.area.to[0] + 1 && z > pt.area.from[1] - 1 && z < pt.area.to[1] + 1)) return true;
    if (colliders.circles.some((cc) => Math.hypot(x - cc.x, z - cc.z) < cc.r + 0.3)) return true;
    if (p.enabled) {
      const a = (-p.rotY * Math.PI) / 180;
      const lx = (x - p.x) * Math.cos(a) + (z - p.z) * Math.sin(a);
      const lz = -(x - p.x) * Math.sin(a) + (z - p.z) * Math.cos(a);
      if (Math.abs(lx) < p.doorW / 2 + 1.0 && lz > p.shellAt[1]) return true; // lối bậc lên cửa
      const d = Math.hypot(x - p.x, z - p.z);
      if (d > p.plinthR - 1.0 && d < p.plinthR + 0.3) return true; // mép bậc nền
    }
    return false;
  };
  for (const sc of f.corals) {
    for (let i = 0; i < sc.count; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * sc.r;
      const x = sc.x + Math.sin(a) * d;
      const z = sc.z + Math.cos(a) * d;
      const kind = rand() < 0.55 ? 0 : 1;
      const s = 1.0 + rand() * 0.9;
      if (blocked(x, z)) continue;
      coralSpots.push({ at: v3(x, floorY(x, z), z), s, kind });
    }
  }
  const coralMat = instMaterial(look);
  const coralMeshes = [branchCoralGeometry(), tubeCoralGeometry()].map((geo, kind) => {
    const list = coralSpots.filter((s) => s.kind === kind);
    return { list, mesh: list.length ? new THREE.InstancedMesh(geo, coralMat, list.length) : null };
  });
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const color = new THREE.Color();
  const crand = seededRandom(f.seed + 5);
  for (const { list, mesh } of coralMeshes) {
    if (!mesh) continue;
    list.forEach((s, i) => {
      q.setFromAxisAngle(v3(0, 1, 0), crand() * Math.PI * 2);
      m.compose(s.at, q, v3(s.s, s.s, s.s));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, color.set(c.corals[Math.floor(crand() * 3)]).multiplyScalar(0.95 + crand() * 0.1));
    });
    finish(scene, [mesh]);
  }

  // rong: dải lượn, lay theo gió chung (gốc đứng yên)
  const kelpSpots: { x: number; y: number; z: number; h: number }[] = [];
  for (const k of f.kelp) {
    for (let i = 0; i < k.count; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * k.r;
      const x = k.x + Math.sin(a) * d;
      const z = k.z + Math.cos(a) * d;
      const h = 1.8 + rand() * 2.4;
      if (blocked(x, z)) continue;
      kelpSpots.push({ x, y: floorY(x, z), z, h });
    }
  }
  if (kelpSpots.length) {
    const geo = new THREE.PlaneGeometry(0.26, 1, 1, 6).translate(0, 0.5, 0);
    const kp = geo.getAttribute('position');
    for (let i = 0; i < kp.count; i++) {
      const y = kp.getY(i);
      kp.setX(i, kp.getX(i) * (1 - y * 0.55) + Math.sin(y * 5) * 0.07);
    }
    geo.computeVertexNormals();
    shadeY(geo, 1, 0.65);
    const mesh = new THREE.InstancedMesh(geo, instMaterial(look, THREE.DoubleSide, { amp: look.wind * 4, tip: 1 }), kelpSpots.length);
    kelpSpots.forEach((s, i) => {
      q.setFromAxisAngle(v3(0, 1, 0), rand() * Math.PI);
      m.compose(v3(s.x, s.y, s.z), q, v3(1 + rand() * 0.3, s.h, 1));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, color.set(c.kelp).multiplyScalar(0.85 + rand() * 0.3));
    });
    finish(scene, [mesh]);
  }

  // cuội viền: mép ngoài bãi cát, hai mép lối đi, quanh bãi hạc
  const pebbles: { x: number; z: number }[] = [];
  const inSand = (x: number, z: number, pad: number): boolean => f.sand.some((s) => Math.hypot(x - s.x, z - s.z) < s.r - pad);
  const inYard = (x: number, z: number): boolean => yard.enabled && Math.hypot(x - yard.center[0], z - yard.center[1]) < yard.radius + 0.25;
  const onPlinth = (x: number, z: number): boolean => p.enabled && Math.hypot(x - p.x, z - p.z) < p.plinthR + 0.3;
  for (const s of f.sand) {
    const n = Math.round((Math.PI * 2 * s.r) / 0.55);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = s.x + Math.sin(a) * (s.r + 0.08);
      const z = s.z + Math.cos(a) * (s.r + 0.08);
      if (!inSand(x, z, 0.02) && !inYard(x, z) && !onPlinth(x, z) && !onPath(spec.paths, x, z, 0.1)) pebbles.push({ x, z });
    }
  }
  if (f.pathPebbles) {
    for (const pt of spec.paths) {
      const dx = pt.to[0] - pt.from[0];
      const dz = pt.to[1] - pt.from[1];
      const L = Math.hypot(dx, dz);
      const n = Math.round(L / 0.55);
      for (const side of [-1, 1]) {
        const off = pt.width / 2 + 0.2;
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const x = pt.from[0] + dx * t + (-dz / L) * off * side;
          const z = pt.from[1] + dz * t + (dx / L) * off * side;
          if (!inSand(x, z, -0.3) && !inYard(x, z) && !onPlinth(x, z) && !onPath(spec.paths, x, z, 0.05)) pebbles.push({ x, z });
        }
      }
    }
  }
  if (f.yardPebbles && yard.enabled) {
    const R = yard.radius + 0.2;
    const n = Math.round((Math.PI * 2 * R) / 0.55);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = yard.center[0] + Math.sin(a) * R;
      const z = yard.center[1] + Math.cos(a) * R;
      if (!onPath(spec.paths, x, z, 0.05)) pebbles.push({ x, z });
    }
  }
  if (pebbles.length) {
    const geo = shadeY(new THREE.IcosahedronGeometry(1, 0), 0.5, 0.75);
    const mesh = new THREE.InstancedMesh(geo, instMaterial(look), pebbles.length);
    pebbles.forEach((pb, i) => {
      q.setFromAxisAngle(v3(0, 1, 0), rand() * Math.PI);
      const s = 0.85 + rand() * 0.35;
      m.compose(v3(pb.x, groundY(pb.x, pb.z) + 0.04, pb.z), q, v3(0.3 * s, 0.13 * s, 0.22 * s));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, color.set(c.pebble[i % 3 === 0 ? 1 : 0]));
    });
    finish(scene, [mesh]);
  }

  // ngọc (trong trai) + đèn ngọc: không chịu sáng → trắng sáng nhẹ, một draw call
  if (pearls.length) {
    const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), new THREE.MeshBasicMaterial({ color: c.pearl }), pearls.length);
    pearls.forEach((pr, i) => mesh.setMatrixAt(i, m.makeScale(pr.r, pr.r, pr.r).setPosition(pr.at)));
    finish(scene, [mesh]);
  }

  // vệt nắng: ống loe hở hai đầu, sáng ở trên, tắt dần về đáy; cộng màu, không sương, không ghi độ sâu
  if (f.beams.length) {
    const L = 44;
    const geo = new THREE.CylinderGeometry(0.32, 0.5, L, 6, 6, true).translate(0, L / 2, 0);
    const bp = geo.getAttribute('position');
    const col = new Float32Array(bp.count * 3);
    for (let i = 0; i < bp.count; i++) {
      const k = Math.min(1, Math.max(0, (bp.getY(i) - 1) / 14)) * (1 - 0.35 * (bp.getY(i) / L));
      col.set([k, k, k], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.MeshBasicMaterial({ color: c.beam,
      opacity: f.beamOpacity, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const mesh = new THREE.InstancedMesh(geo, mat, f.beams.length);
    f.beams.forEach((b, i) => {
      q.setFromAxisAngle(v3(0, 0, 1), ((b.tilt ?? 0) * Math.PI) / 180);
      m.compose(v3(b.x, groundY(b.x, b.z), b.z), q, v3(b.w, 1, b.w * 0.6));
      mesh.setMatrixAt(i, m);
    });
    mesh.renderOrder = 2;
    finish(scene, [mesh]);
  }

  const bubbles = addBubbles(scene, f, groundY);
  const fish = addFish(scene, f, look, groundY);
  return {
    pads,
    update(dt) {
      bubbles(dt);
      fish(dt);
    },
  };
}
