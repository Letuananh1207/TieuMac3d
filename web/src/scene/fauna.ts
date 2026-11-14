/**
 * Thứ động chỉ để nhìn (không va chạm — R-VA-1): đàn hạc bay vòng (`flocks`), thuyền ô bồng trôi qua lại (`boats`).
 * Mỗi đàn hạc 3 InstancedMesh (thân, cánh trái, cánh phải) → 3 draw call bất kể số con; mỗi thuyền 2 draw call.
 */
import * as THREE from 'three';
import { lambert } from './materials';
import { markDynamic, mergeVertexColors } from './merge';
import type { BoatSpec, CaravanSpec, FlockSpec, SceneSpec, XZ } from './spec';
import { lacDa } from './vat_vung';
import type { GroundY } from './terrainHeight';

type Updater = (dt: number) => void;

/** Vị trí trên đường gấp khúc `path` khi đã đi `s` m, đi tới cuối thì quay lại (ping-pong). Thuần. */
export function alongPath(path: XZ[], s: number): { x: number; z: number; heading: number } {
  const segs = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  if (total === 0) return { x: path[0][0], z: path[0][1], heading: 0 };
  const m = ((s % (2 * total)) + 2 * total) % (2 * total);
  const back = m > total;
  let d = back ? 2 * total - m : m;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const t = segs[i] ? Math.min(1, d / segs[i]) : 0;
      const [a, b] = [path[i], path[i + 1]];
      const dx = (b[0] - a[0]) * (back ? -1 : 1);
      const dz = (b[1] - a[1]) * (back ? -1 : 1);
      return { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, heading: Math.atan2(dx, dz) };
    }
    d -= segs[i];
  }
  return { x: path[0][0], z: path[0][1], heading: 0 };
}

/** Thân hạc (mũi nhìn +z): thân trắng thon, cổ dài, chân duỗi sau. */
function craneBody(): THREE.BufferGeometry {
  return new THREE.OctahedronGeometry(0.5, 0).scale(0.45, 0.4, 1.6);
}

function wing(side: number): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  // tam giác: gốc cánh ở thân, đầu cánh xa 1,6 m (đầu cánh đen do màu vật liệu chung — đơn giản: cánh xám nhạt)
  const v = new Float32Array([0, 0, 0.35, 0, 0, -0.35, side * 1.6, 0, -0.25]);
  g.setAttribute('position', new THREE.BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

function addFlock(scene: THREE.Scene, f: FlockSpec, updaters: Updater[]): void {
  const n = Math.max(1, Math.round(f.count));
  const body = new THREE.InstancedMesh(craneBody(), lambert('#f4f2ec'), n);
  const wingMat = lambert('#d9d6cf', { side: THREE.DoubleSide });
  const wings = [-1, 1].map((s) => new THREE.InstancedMesh(wing(s), wingMat, n));
  for (const m of [body, ...wings]) {
    markDynamic(m);
    m.frustumCulled = false;
    scene.add(m);
  }
  const speed = f.speed ?? 4;
  const birds = Array.from({ length: n }, (_, i) => ({
    phase: (i / n) * 0.9, // xếp thành dải trên vòng
    lift: ((i * 7) % 5) * 0.6,
    rOff: ((i * 3) % 4) * 1.2,
    flap: i * 1.3,
  }));
  let t = 0;
  const o = new THREE.Object3D();
  const w = new THREE.Object3D();
  updaters.push((dt) => {
    t += dt;
    const ang0 = (t * speed) / f.radius;
    birds.forEach((b, i) => {
      const a = ang0 + b.phase;
      const r = f.radius + b.rOff;
      const y = f.y + b.lift + Math.sin(t * 0.7 + i) * 0.4;
      o.position.set(f.x + Math.cos(a) * r, y, f.z + Math.sin(a) * r);
      o.rotation.set(0, -a, 0); // bay theo tiếp tuyến (ngược chiều kim đồng hồ nhìn từ trên)
      o.updateMatrix();
      body.setMatrixAt(i, o.matrix);
      const beat = Math.sin(t * 5 + b.flap) * 0.5;
      [-1, 1].forEach((s, k) => {
        w.position.copy(o.position);
        w.rotation.set(0, -a, s * beat);
        w.updateMatrix();
        wings[k].setMatrixAt(i, w.matrix);
      });
    });
    body.instanceMatrix.needsUpdate = true;
    for (const m of wings) m.instanceMatrix.needsUpdate = true;
  });
}

/** Thuyền ô bồng (烏篷船): thân gỗ thon hai đầu, mui tre đen cong giữa thuyền. Mũi nhìn +z. */
function addBoat(scene: THREE.Scene, b: BoatSpec, groundY: GroundY, updaters: Updater[]): void {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 4.4, 8, 1).rotateX(Math.PI / 2).scale(1, 0.45, 1), lambert('#6a4a30'));
  hull.position.y = 0.05;
  const canopy = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.72, 1.8, 10, 1, true, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2),
    lambert(b.canopy ?? '#2a2622', { side: THREE.DoubleSide }),
  );
  canopy.rotation.z = Math.PI / 2;
  canopy.position.set(0, 0.35, -0.2);
  g.add(hull, canopy);
  if (b.cargo) addCargo(g);
  mergeVertexColors(g); // cả thuyền + hàng → 1 draw call
  markDynamic(g);
  scene.add(g);
  const speed = b.moored ? 0 : (b.speed ?? 1.2);
  const sunk = b.sunk ?? 0;
  let s = 0;
  let t = b.path[0][0] * 0.37; // khác pha dập dềnh giữa các thuyền
  updaters.push((dt) => {
    s += dt * speed;
    t += dt;
    const p = alongPath(b.path, s);
    g.position.set(p.x, groundY(p.x, p.z) - sunk + 0.06 + Math.sin(t * 1.6) * 0.03, p.z);
    g.rotation.set(Math.sin(t * 1.1) * 0.03, p.heading, Math.sin(t * 0.8) * 0.02);
  });
}

/** Hàng trên thuyền chợ (đuôi thuyền, ngoài mui): rổ rau, rổ quả, vò, bao trà. */
function addCargo(g: THREE.Group): void {
  const items: [THREE.BufferGeometry, string, number, number][] = [
    [new THREE.CylinderGeometry(0.32, 0.24, 0.3, 8), '#9a7a4a', 0.25, 1.2],
    [new THREE.CylinderGeometry(0.32, 0.24, 0.3, 8), '#9a7a4a', -0.25, 1.55],
    [new THREE.SphereGeometry(0.26, 6, 4).scale(1, 0.5, 1), '#6f9a3c', 0.25, 1.2],
    [new THREE.SphereGeometry(0.26, 6, 4).scale(1, 0.5, 1), '#e08a3a', -0.25, 1.55],
    [new THREE.SphereGeometry(0.22, 7, 5).scale(1, 1.2, 1), '#6a4a34', 0.2, 1.9],
    [new THREE.BoxGeometry(0.4, 0.25, 0.3), '#c8b27a', -0.22, 1.95],
  ];
  items.forEach(([geo, color, x, z], i) => {
    const m = new THREE.Mesh(geo, lambert(color));
    m.position.set(x, i < 2 ? 0.3 : i < 4 ? 0.48 : 0.36, z);
    g.add(m);
  });
}

/** Đoàn lạc đà: mỗi con dựng như `lac-da` (đầu ngẩng, gộp 1 draw call), nối nhau đi qua lại dọc đường, nhún theo bước. */
function addCaravan(scene: THREE.Scene, c: CaravanSpec, style: SceneSpec['buildingStyle'], groundY: GroundY, updaters: Updater[]): void {
  const n = Math.max(1, Math.round(c.count ?? 5));
  const gap = c.spacing ?? 3.2;
  const speed = c.speed ?? 0.9;
  const camels = Array.from({ length: n }, () => {
    const g = new THREE.Group();
    lacDa(g, style, 0, [], false);
    mergeVertexColors(g);
    markDynamic(g);
    scene.add(g);
    return g;
  });
  let s = n * gap;
  let t = 0;
  updaters.push((dt) => {
    s += dt * speed;
    t += dt;
    camels.forEach((g, i) => {
      const p = alongPath(c.path, s - i * gap);
      g.position.set(p.x, groundY(p.x, p.z) + Math.abs(Math.sin(t * 2.2 + i)) * 0.06, p.z);
      g.rotation.set(0, p.heading, Math.sin(t * 2.2 + i) * 0.03);
    });
  });
}

/** Dựng đàn hạc + thuyền + đoàn lạc đà của cảnh; trả về hàm cập nhật mỗi khung hình. */
export function addFauna(scene: THREE.Scene, spec: Pick<SceneSpec, 'flocks' | 'boats' | 'caravans' | 'buildingStyle'>, groundY: GroundY = () => 0): Updater {
  const updaters: Updater[] = [];
  for (const f of spec.flocks) addFlock(scene, f, updaters);
  for (const b of spec.boats) addBoat(scene, b, groundY, updaters);
  for (const c of spec.caravans) addCaravan(scene, c, spec.buildingStyle, groundY, updaters);
  return (dt) => {
    for (const u of updaters) u(dt);
  };
}
