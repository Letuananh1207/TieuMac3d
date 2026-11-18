/**
 * Rừng Nấm Tiên (V-109, concept `design/concept/rung-nam-tien/`): nấm khổng lồ, cụm nấm nhỏ, luống thảo dược, nhà nấm.
 * Nấm lặp dựng bằng InstancedMesh (màu đỉnh tối dần xuống chân / gầm mũ × màu từng cây): thân 1 · mũ 3 dáng · chấm 1 ·
 * nấm nhỏ 2 · thảo dược 1 draw call cho cả rừng. Nhà nấm + thành luống là khối Lambert tĩnh → `mergeSoft` gộp. Nấm Mẹ +
 * Lò Thuốc Tiên ở `namMe.ts`.
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { finish } from './trees';
import { isSoft, type LookSpec } from './look';
import { lambert, softMaterial, windowMaterial } from './materials';
import { seededRandom } from './random';
import { CAP_SHAPES, type MushroomForestSpec } from './rungNamSpec';
import type { PathSpec } from './spec';
import type { GroundY } from './terrainHeight';

type Shape = (typeof CAP_SHAPES)[number];

/** Mặt cắt mũ nấm bán kính 1 (r, y), từ đỉnh xuống mép rồi vào gầm; y = 0 ở chân mũ (đỉnh thân). Lathe cần thứ tự ngược (gầm → đỉnh) cho pháp tuyến hướng ra. */
const CAP_PROFILE: Record<Shape, [number, number][]> = {
  vom: [
    [0, 0.62],
    [0.45, 0.58],
    [0.78, 0.43],
    [0.96, 0.2],
    [1, 0.06],
    [0.9, -0.03],
    [0.5, -0.09],
    [0.05, -0.11],
  ],
  non: [
    [0, 0.88],
    [0.32, 0.76],
    [0.66, 0.46],
    [0.93, 0.15],
    [1, 0.04],
    [0.88, -0.04],
    [0.42, -0.1],
    [0.05, -0.12],
  ],
  det: [
    [0, 0.3],
    [0.62, 0.28],
    [0.92, 0.19],
    [1, 0.07],
    [0.95, -0.04],
    [0.5, -0.1],
    [0.05, -0.12],
  ],
};

/** Thân nấm cao 1, bán kính 1 ở giữa: chân loe, thắt nhẹ, đầu nở đỡ mũ. */
const STEM_PROFILE: [number, number][] = [
  [1.3, -0.04],
  [1.02, 0.12],
  [0.92, 0.6],
  [1.05, 1.0],
  [0, 1.0],
];

/** Nấm nhỏ (cả trăm cây): thân + mũ ít mặt. */
const SMALL_STEM: [number, number][] = [
  [1.15, 0],
  [0.9, 0.55],
  [1.0, 1.0],
  [0, 1.0],
];
const SMALL_CAP: [number, number][] = [
  [0, 0.6],
  [0.7, 0.45],
  [1, 0.08],
  [0.4, -0.08],
  [0.05, -0.1],
];

/** Lathe + màu đỉnh: `shade(y, ny)` → độ sáng 0…1 (bóng nướng sẵn — gầm mũ, chân thân tối hơn). */
function lathe(profile: [number, number][], seg: number, shade: (y: number, ny: number) => number): THREE.BufferGeometry {
  const g = new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    seg,
  );
  g.deleteAttribute('uv');
  const pos = g.getAttribute('position');
  const nrm = g.getAttribute('normal');
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const k = shade(pos.getY(i), nrm.getY(i));
    col.set([k, k, k], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

const capGeo = (shape: Shape, seg = 14, profile = CAP_PROFILE[shape]): THREE.BufferGeometry => lathe([...profile].reverse(), seg, (_y, ny) => (ny < -0.2 ? 0.8 : 0.92 + 0.08 * Math.max(0, ny)));
const stemGeo = (profile = STEM_PROFILE, seg = 12): THREE.BufferGeometry => lathe(profile, seg, (y) => 0.74 + 0.26 * Math.min(1, Math.max(0, y) / 0.7));

/** Vật liệu cho InstancedMesh có màu đỉnh: cảnh mềm → vật liệu mềm chung, cảnh cũ → Lambert màu đỉnh. */
function instMaterial(look: LookSpec): THREE.MeshLambertMaterial {
  return isSoft(look) ? softMaterial(look.wrap) : new THREE.MeshLambertMaterial({ vertexColors: true });
}

/** Độ cao mũ (theo mặt cắt) ở bán kính tương đối `f` (0…1) và pháp tuyến gần đúng — đặt chấm kem lên mặt mũ. */
function capSurface(shape: Shape, f: number): { y: number; n: THREE.Vector3 } {
  const p = CAP_PROFILE[shape];
  for (let i = 0; i < p.length - 1; i++) {
    const [r0, y0] = p[i];
    const [r1, y1] = p[i + 1];
    if (f >= r0 && f <= r1) {
      const t = (f - r0) / (r1 - r0 || 1);
      return { y: y0 + (y1 - y0) * t, n: new THREE.Vector3(y0 - y1, r1 - r0, 0).normalize() };
    }
  }
  return { y: p[0][1], n: new THREE.Vector3(0, 1, 0) };
}

/** Bán kính thân theo cỡ nấm (thân to như concept — nấm cao hơn nhà phải chắc). */
export const stemRadius = (h: number, cap: number): number => 0.07 * h + 0.07 * cap + 0.15;

function giants(scene: THREE.Scene, colliders: Colliders, f: MushroomForestSpec, look: LookSpec, groundY: GroundY): void {
  const list = f.giants;
  if (!list.length) return;
  const mat = instMaterial(look);
  const stems = new THREE.InstancedMesh(stemGeo(), mat, list.length);
  const caps = Object.fromEntries(CAP_SHAPES.map((s) => [s, list.filter((g) => (g.shape ?? 'vom') === s)])) as Record<Shape, typeof list>;
  const capMeshes = CAP_SHAPES.filter((s) => caps[s].length).map((s) => ({ s, mesh: new THREE.InstancedMesh(capGeo(s), mat, caps[s].length) }));
  const spotted = list.filter((g) => g.spots);
  const SPOTS = 9;
  const spots = spotted.length ? new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0).scale(1, 0.28, 1), lambert(f.colors.spot), spotted.length * SPOTS) : null;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const color = new THREE.Color();
  const stemColor = new THREE.Color(f.colors.stem);
  const rand = seededRandom(f.seed + 101);
  list.forEach((g, i) => {
    const y = groundY(g.x, g.z);
    const sr = stemRadius(g.h, g.cap);
    q.setFromAxisAngle(up, rand() * Math.PI * 2);
    m.compose(new THREE.Vector3(g.x, y, g.z), q, new THREE.Vector3(sr, g.h, sr));
    stems.setMatrixAt(i, m);
    stems.setColorAt(i, color.copy(stemColor).multiplyScalar(0.96 + rand() * 0.06));
    colliders.addCircle(g.x, g.z, sr * 0.95);
  });
  for (const { s, mesh } of capMeshes) {
    caps[s].forEach((g, i) => {
      m.compose(new THREE.Vector3(g.x, groundY(g.x, g.z) + g.h, g.z), q.identity(), new THREE.Vector3(g.cap, g.cap, g.cap));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, color.set(g.color));
    });
  }
  if (spots) {
    let k = 0;
    for (const g of spotted) {
      const shape = g.shape ?? 'vom';
      const base = groundY(g.x, g.z) + g.h;
      for (let j = 0; j < SPOTS; j++) {
        const a = (j / SPOTS) * Math.PI * 2 + rand() * 0.5;
        const fr = j % 3 === 0 ? 0.28 : 0.55 + rand() * 0.3;
        const { y, n } = capSurface(shape, fr);
        const dir = new THREE.Vector3(Math.sin(a) * n.x, n.y, Math.cos(a) * n.x);
        q.setFromUnitVectors(up, dir.normalize());
        const sz = g.cap * (0.1 + rand() * 0.06);
        m.compose(new THREE.Vector3(g.x + Math.sin(a) * fr * g.cap, base + y * g.cap, g.z + Math.cos(a) * fr * g.cap), q, new THREE.Vector3(sz, sz, sz));
        spots.setMatrixAt(k++, m);
      }
    }
  }
  finish(scene as THREE.Scene, [stems, ...capMeshes.map((c) => c.mesh), ...(spots ? [spots] : [])]);
}

/** Điểm (x, z) nằm trên lối đi (cách trục lối < nửa rộng + `pad`). */
function onPath(paths: PathSpec[], x: number, z: number, pad: number): boolean {
  return paths.some((p) => {
    const [ax, az] = p.from;
    const [bx, bz] = p.to;
    const dx = bx - ax;
    const dz = bz - az;
    const L = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L));
    return Math.hypot(x - ax - dx * t, z - az - dz * t) < p.width / 2 + pad;
  });
}

/** Cụm nấm nhỏ: thân + mũ hai InstancedMesh, tránh lối đi. */
function smallMushrooms(scene: THREE.Scene, f: MushroomForestSpec, look: LookSpec, groundY: GroundY, paths: PathSpec[]): void {
  const total = f.clusters.reduce((a, c) => a + c.count, 0);
  if (!total) return;
  const mat = instMaterial(look);
  const stems = new THREE.InstancedMesh(stemGeo(SMALL_STEM, 6), mat, total);
  const caps = new THREE.InstancedMesh(capGeo('vom', 7, SMALL_CAP), mat, total);
  const rand = seededRandom(f.seed);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const color = new THREE.Color();
  let n = 0;
  for (const c of f.clusters) {
    for (let i = 0; i < c.count; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * c.r;
      const x = c.x + Math.sin(a) * d;
      const z = c.z + Math.cos(a) * d;
      const h = 0.3 + rand() * rand() * 1.1;
      if (onPath(paths, x, z, 0.2)) continue;
      const y = groundY(x, z);
      q.setFromEuler(new THREE.Euler((rand() - 0.5) * 0.25, rand() * 6, (rand() - 0.5) * 0.25));
      const cap = h * (0.55 + rand() * 0.3);
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(h * 0.16, h, h * 0.16));
      stems.setMatrixAt(n, m);
      stems.setColorAt(n, color.set(f.colors.stem));
      m.compose(new THREE.Vector3(x, y + h, z), q, new THREE.Vector3(cap, cap, cap));
      caps.setMatrixAt(n, m);
      caps.setColorAt(n, color.set(f.colors.small[Math.floor(rand() * 3)]));
      n++;
    }
  }
  stems.count = n;
  caps.count = n;
  finish(scene, [stems, caps]);
}

/** Luống thảo dược: thành đất nung + đất (khối tĩnh), bụi lá một InstancedMesh cho mọi luống. */
function herbBeds(scene: THREE.Scene, colliders: Colliders, f: MushroomForestSpec, look: LookSpec, groundY: GroundY): void {
  if (!f.herbBeds.length) return;
  const rim = lambert(f.colors.bed);
  const soil = lambert(f.colors.soil);
  const per = f.herbBeds.map((b) => Math.max(4, Math.round(b.r * b.r * 4)));
  const leafGeo = new THREE.IcosahedronGeometry(0.5, 0);
  const pos = leafGeo.getAttribute('position');
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const k = 0.72 + 0.28 * Math.max(0, pos.getY(i) / 0.5);
    col.set([k, k, k], i * 3);
  }
  leafGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const leaves = new THREE.InstancedMesh(leafGeo, instMaterial(look), per.reduce((a, b) => a + b, 0));
  const rand = seededRandom(f.seed + 7);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const color = new THREE.Color();
  let n = 0;
  f.herbBeds.forEach((b, bi) => {
    const y = groundY(b.x, b.z);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(b.r, 0.17, 5, Math.max(12, Math.round(b.r * 8))).rotateX(Math.PI / 2), rim);
    ring.position.set(b.x, y + 0.16, b.z);
    scene.add(ring);
    const dirt = new THREE.Mesh(new THREE.CylinderGeometry(b.r - 0.05, b.r - 0.05, 0.36, Math.max(12, Math.round(b.r * 8))), soil);
    dirt.position.set(b.x, y + 0.06, b.z);
    scene.add(dirt);
    colliders.addCircle(b.x, b.z, b.r + 0.1);
    for (let i = 0; i < per[bi]; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * (b.r - 0.45);
      const s = 0.5 + rand() * 0.4;
      q.setFromEuler(new THREE.Euler(0, rand() * 6, 0));
      m.compose(new THREE.Vector3(b.x + Math.sin(a) * d, y + 0.28 + s * 0.15, b.z + Math.cos(a) * d), q, new THREE.Vector3(s, s * 0.7, s));
      leaves.setMatrixAt(n, m);
      leaves.setColorAt(n++, color.set(f.colors.herb[i % 2]).multiplyScalar(0.92 + rand() * 0.16));
    }
  });
  finish(scene, [leaves]);
}

/** Nhà nấm (cao chuẩn 6 m, co theo `h`): thân bầu, mũ có ống khói nấm, cửa tròn gỗ, hai cửa sổ tròn song chữ thập. */
function house(scene: THREE.Scene, colliders: Colliders, hs: MushroomForestSpec['houses'][number], c: MushroomForestSpec['colors'], groundY: GroundY): void {
  const g = new THREE.Group();
  const s = hs.h / 6;
  g.position.set(hs.x, groundY(hs.x, hs.z), hs.z);
  g.rotation.y = ((hs.rotY ?? 0) * Math.PI) / 180;
  g.scale.setScalar(s);
  const put = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number): THREE.Mesh => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    g.add(mesh);
    return mesh;
  };
  const bodyP: [number, number][] = [
    [2.05, -0.3],
    [2.32, 0.4],
    [2.45, 1.2],
    [2.38, 2.1],
    [2.1, 2.9],
    [1.7, 3.35],
    [0, 3.4],
  ];
  put(new THREE.LatheGeometry(bodyP.map(([r, y]) => new THREE.Vector2(r, y)), 16), lambert(c.stem), 0, 0, 0);
  const capP: [number, number][] = [
    [0, 5.9],
    [1.4, 5.65],
    [2.6, 4.85],
    [3.3, 3.75],
    [3.42, 3.25],
    [3.0, 3.05],
    [1.5, 3.1],
    [0, 3.15],
  ];
  put(new THREE.LatheGeometry(capP.map(([r, y]) => new THREE.Vector2(r, y)).reverse(), 18), lambert(hs.color), 0, 0, 0);
  // ống khói nấm nhỏ trên mũ
  const chim = put(new THREE.CylinderGeometry(0.2, 0.26, 1.0, 6), lambert(c.stem), -1.2, 5.55, -0.5);
  chim.rotation.z = 0.25;
  put(new THREE.SphereGeometry(0.45, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.75, 1), lambert(c.wood), -1.33, 6.0, -0.5);
  // cửa tròn (bầu dục đứng) + khung + núm
  const wood = lambert(c.wood);
  const frame = lambert(c.window);
  put(new THREE.CylinderGeometry(0.72, 0.72, 0.16, 14).rotateX(Math.PI / 2).scale(1, 1.3, 1), wood, 0, 1.0, 2.36);
  put(new THREE.TorusGeometry(0.74, 0.08, 4, 16).scale(1, 1.3, 1), frame, 0, 1.0, 2.42);
  put(new THREE.SphereGeometry(0.07, 6, 4), lambert('#5a3c28'), 0.42, 1.0, 2.47);
  put(new THREE.BoxGeometry(1.6, 0.12, 0.8), lambert('#b4aaa6'), 0, 0.02, 2.75);
  // cửa sổ tròn hai bên cửa
  const glass = windowMaterial('#f1dcb0');
  for (const a of [-0.75, 0.75]) {
    const r = 2.34;
    const w = new THREE.Group();
    w.position.set(Math.sin(a) * r, 2.0, Math.cos(a) * r);
    w.rotation.y = a;
    g.add(w);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.34, 10), glass);
    disc.position.z = 0.04;
    w.add(disc);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.07, 4, 12), frame);
    ring.position.z = 0.06;
    w.add(ring);
    for (const rot of [0, Math.PI / 2]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.05, 0.05), frame);
      bar.position.z = 0.07;
      bar.rotation.z = rot;
      w.add(bar);
    }
  }
  scene.add(g);
  colliders.addCircle(hs.x, hs.z, 2.45 * s);
}

/**
 * Dựng rừng nấm (trừ Nấm Mẹ): nấm khổng lồ, cụm nấm nhỏ, luống thảo dược, nhà nấm. Không có gì trong đặc tả → không dựng.
 */
export function addMushroomForest(scene: THREE.Scene, colliders: Colliders, f: MushroomForestSpec, look: LookSpec, groundY: GroundY, paths: PathSpec[]): void {
  giants(scene, colliders, f, look, groundY);
  smallMushrooms(scene, f, look, groundY, paths);
  herbBeds(scene, colliders, f, look, groundY);
  for (const h of f.houses) house(scene, colliders, h, f.colors, groundY);
}
