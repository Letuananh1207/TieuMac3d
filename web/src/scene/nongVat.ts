/**
 * Vật động của nông trại (V-114 — R-NONG-1…6): gà đi lại (một InstancedMesh), bò con (một khối màu đỉnh, có `bo-con.glb`
 * thì thay bằng model), thóc rải, trứng trong ổ, cỏ trong máng, xô sữa, phao + dây câu, lá / quả giàn. Mỗi thứ một lưới tô
 * màu theo đỉnh → ít draw call. Không biết luật — `nongTrai.ts` (ghép ở gốc) bật / tắt theo trạng thái.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { markDynamic, mergeVertexColors } from './merge';
import { loadStaticModel, staticModelUrl } from './staticModel';

/** Một mảnh: hình + màu + vị trí / xoay / co. */
export function part(geo: THREE.BufferGeometry, color: THREE.ColorRepresentation, pos: [number, number, number], scale: [number, number, number] = [1, 1, 1], rot: [number, number, number] = [0, 0, 0]): THREE.BufferGeometry {
  const m = new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(...scale));
  const out = geo.clone().applyMatrix4(m);
  out.deleteAttribute('uv');
  const c = new THREE.Color(color);
  const n = out.getAttribute('position').count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) c.toArray(arr, i * 3);
  out.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return out;
}

/** Gộp các mảnh (cùng có chỉ số) thành một hình tô màu đỉnh. */
export function joinParts(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(parts);
  if (!merged) throw new Error('nongVat: gộp mảnh lỗi');
  for (const p of parts) p.dispose();
  return merged;
}

export const vertexLambert = (): THREE.MeshLambertMaterial => new THREE.MeshLambertMaterial({ vertexColors: true });

const SPHERE = new THREE.SphereGeometry(1, 10, 8);
const BOX = new THREE.BoxGeometry(1, 1, 1);
const CONE = new THREE.ConeGeometry(1, 1, 6);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 8);
const LEAF = new THREE.IcosahedronGeometry(1, 0);

/** Gà (cao ≈ 0,45 m, nhìn +z): thân tròn, đầu, mào đỏ, mỏ vàng, đuôi. Màu thân ở màu instance. */
function chickenGeometry(): THREE.BufferGeometry {
  const W = '#ffffff';
  return joinParts([
    part(SPHERE, W, [0, 0.22, 0], [0.17, 0.15, 0.2]),
    part(SPHERE, W, [0, 0.37, 0.12], [0.09, 0.09, 0.09]),
    part(CONE, W, [0, 0.3, -0.18], [0.07, 0.14, 0.05], [-0.9, 0, 0]),
    part(BOX, '#d8443a', [0, 0.47, 0.12], [0.03, 0.06, 0.08]),
    part(CONE, '#e8a83a', [0, 0.36, 0.22], [0.025, 0.06, 0.025], [Math.PI / 2, 0, 0]),
    part(BOX, '#d8443a', [0, 0.32, 0.19], [0.03, 0.05, 0.02]),
    part(CYL, '#e8a83a', [0.06, 0.05, 0], [0.012, 0.1, 0.012]),
    part(CYL, '#e8a83a', [-0.06, 0.05, 0], [0.012, 0.1, 0.012]),
  ]);
}

/** Bò con khối (cao ≈ 1,1 m, nhìn +z). */
function cowGeometry(body: string): THREE.BufferGeometry {
  const leg = (x: number, z: number): THREE.BufferGeometry => part(CYL, body, [x, 0.22, z], [0.08, 0.44, 0.08]);
  return joinParts([
    part(SPHERE, body, [0, 0.62, 0], [0.38, 0.3, 0.55]),
    part(SPHERE, body, [0, 0.82, 0.55], [0.24, 0.22, 0.22]),
    part(SPHERE, '#f2c4b4', [0, 0.74, 0.74], [0.16, 0.11, 0.08]),
    part(SPHERE, '#2a2420', [0.1, 0.88, 0.72], [0.035, 0.035, 0.02]),
    part(SPHERE, '#2a2420', [-0.1, 0.88, 0.72], [0.035, 0.035, 0.02]),
    part(SPHERE, body, [0.24, 0.92, 0.5], [0.1, 0.05, 0.06]),
    part(SPHERE, body, [-0.24, 0.92, 0.5], [0.1, 0.05, 0.06]),
    part(CONE, '#efe6d2', [0.12, 1.04, 0.52], [0.035, 0.1, 0.035]),
    part(CONE, '#efe6d2', [-0.12, 1.04, 0.52], [0.035, 0.1, 0.035]),
    part(CYL, body, [0, 0.62, -0.58], [0.025, 0.4, 0.025], [0.5, 0, 0]),
    leg(0.2, 0.3),
    leg(-0.2, 0.3),
    leg(0.2, -0.3),
    leg(-0.2, -0.3),
  ]);
}

export interface Rect {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

interface Hen {
  x: number;
  z: number;
  tx: number;
  tz: number;
  rot: number;
  wait: number;
  peck: number;
}

/** Bầy gà đi lại trong sân [area] (tránh ô [avoid] — chuồng); có thóc → kéo về chỗ thóc mổ. */
export class Flock {
  readonly mesh: THREE.InstancedMesh;
  private readonly hens: Hen[] = [];
  private food: { x: number; z: number } | null = null;
  private readonly m = new THREE.Matrix4();
  private readonly q = new THREE.Quaternion();
  private readonly up = new THREE.Vector3(0, 1, 0);
  private seed = 7;

  constructor(
    scene: THREE.Scene,
    n: number,
    private readonly area: Rect,
    private readonly avoid: Rect,
    private readonly y: number,
    colors: [string, string],
  ) {
    this.mesh = new THREE.InstancedMesh(chickenGeometry(), vertexLambert(), Math.max(1, n));
    this.mesh.count = n;
    markDynamic(this.mesh);
    for (let i = 0; i < n; i++) {
      const p = this.pick();
      this.hens.push({ ...p, tx: p.x, tz: p.z, rot: this.rand() * 6.28, wait: this.rand() * 2, peck: 0 });
      this.mesh.setColorAt(i, new THREE.Color(colors[i % 2]));
    }
    scene.add(this.mesh);
    this.update(0);
  }

  private rand(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }

  private pick(): { x: number; z: number } {
    for (let t = 0; t < 20; t++) {
      const x = this.area.x0 + 0.5 + this.rand() * (this.area.x1 - this.area.x0 - 1);
      const z = this.area.z0 + 0.5 + this.rand() * (this.area.z1 - this.area.z0 - 1);
      const a = this.avoid;
      if (!(x > a.x0 - 0.3 && x < a.x1 + 0.3 && z > a.z0 - 0.3 && z < a.z1 + 0.3)) return { x, z };
    }
    return { x: (this.area.x0 + this.area.x1) / 2, z: this.area.z1 - 1 };
  }

  /** Có thóc rải ở [at] (`null` = hết thóc). */
  setFood(at: { x: number; z: number } | null): void {
    this.food = at;
  }

  update(dt: number): void {
    this.hens.forEach((h, i) => {
      const dx = h.tx - h.x;
      const dz = h.tz - h.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.05) {
        const step = Math.min(d, dt * 0.7);
        h.x += (dx / d) * step;
        h.z += (dz / d) * step;
        h.rot = Math.atan2(dx, dz);
        h.peck = 0;
      } else if ((h.wait -= dt) <= 0) {
        // tới đích: đứng mổ một lúc rồi đi chỗ khác (có thóc → quanh đống thóc)
        h.wait = 1.5 + this.rand() * 3;
        const f = this.food;
        const p = f ? { x: f.x + (this.rand() - 0.5) * 1.4, z: f.z + (this.rand() - 0.5) * 1.0 } : this.pick();
        h.tx = p.x;
        h.tz = p.z;
      } else h.peck += dt;
      const bob = h.peck > 0 ? Math.max(0, Math.sin(h.peck * 9)) * 0.35 : 0;
      this.q.setFromAxisAngle(this.up, h.rot);
      const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), bob);
      this.m.compose(new THREE.Vector3(h.x, this.y, h.z), this.q.clone().multiply(tilt), new THREE.Vector3(1, 1, 1));
      this.mesh.setMatrixAt(i, this.m);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

/** Bò con: khối tô màu đỉnh; có `design/models/bo-con.glb` → nạp model cao ≈ 1,1 m thay khối (chờ `/tai-nguyen`). */
export function addCow(scene: THREE.Scene, x: number, y: number, z: number, rotY: number, color: string): { root: THREE.Group; update(dt: number): void } {
  const root = new THREE.Group();
  root.position.set(x, y, z);
  root.rotation.y = rotY;
  const block = new THREE.Mesh(cowGeometry(color), vertexLambert());
  root.add(block);
  markDynamic(root);
  scene.add(root);
  const url = staticModelUrl('bo-con');
  if (url)
    loadStaticModel(url)
      .then((m) => {
        const h = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3()).y || 1;
        m.scale.setScalar(1.1 / h);
        root.remove(block);
        root.add(m);
      })
      .catch((e: unknown) => console.warn('bo-con.glb nạp lỗi — giữ bò khối', e));
  let t = 0;
  return {
    root,
    update(dt) {
      t += dt;
      root.scale.y = 1 + Math.sin(t * 1.6) * 0.012; // thở nhẹ
    },
  };
}

/** Một nhóm vật nhỏ bật / tắt cùng lúc (trứng, thóc, cỏ, sữa) — một lưới. */
export function toggleMesh(scene: THREE.Scene, parts: THREE.BufferGeometry[]): THREE.Mesh {
  const mesh = new THREE.Mesh(joinParts(parts), vertexLambert());
  mesh.visible = false;
  markDynamic(mesh);
  scene.add(mesh);
  return mesh;
}

/** Phao câu + dây + cần (R-NONG-3): `off` ẩn · `float` nhấp nhẹ · `bite` chìm + gợn. */
export class Bobber {
  private readonly float: THREE.Mesh;
  private readonly ring: THREE.Mesh;
  private readonly line: THREE.Line;
  private readonly rod: THREE.Mesh;
  private state: 'off' | 'float' | 'bite' = 'off';
  private t = 0;
  private readonly tip = new THREE.Vector3();

  constructor(
    scene: THREE.Scene,
    private readonly at: THREE.Vector3,
    stand: THREE.Vector3,
  ) {
    this.float = new THREE.Mesh(
      joinParts([part(SPHERE, '#f4f1ea', [0, 0.06, 0], [0.09, 0.07, 0.09]), part(SPHERE, '#d8443a', [0, 0, 0], [0.09, 0.07, 0.09]), part(CYL, '#d8443a', [0, 0.14, 0], [0.012, 0.12, 0.012])]),
      vertexLambert(),
    );
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.2, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#e8f2f0', transparent: true, opacity: 0.8, depthWrite: false }));
    // cần tre từ tay người đứng ở [stand] chĩa ra ao
    const dir = new THREE.Vector3().subVectors(at, stand).setY(0).normalize();
    const hand = stand.clone().add(dir.clone().multiplyScalar(0.35)).setY(stand.y + 0.9);
    this.tip.copy(hand).add(dir.clone().multiplyScalar(1.7)).setY(stand.y + 1.9);
    const len = hand.distanceTo(this.tip);
    this.rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.025, len, 5), new THREE.MeshLambertMaterial({ color: '#b8964e' }));
    this.rod.position.copy(hand).lerp(this.tip, 0.5);
    this.rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.tip.clone().sub(hand).normalize());
    this.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([this.tip, at]), new THREE.LineBasicMaterial({ color: '#f4f1ea' }));
    for (const o of [this.float, this.ring, this.line, this.rod]) {
      o.visible = false;
      markDynamic(o);
      scene.add(o);
    }
  }

  set(state: 'off' | 'float' | 'bite'): void {
    if (state === this.state) return;
    this.state = state;
    this.t = 0;
    const on = state !== 'off';
    this.float.visible = this.line.visible = this.rod.visible = on;
    this.ring.visible = state === 'bite';
  }

  update(dt: number): void {
    if (this.state === 'off') return;
    this.t += dt;
    const sink = this.state === 'bite' ? Math.min(1, this.t * 6) * 0.13 : 0;
    const y = this.at.y + Math.sin(this.t * (this.state === 'bite' ? 14 : 3)) * (this.state === 'bite' ? 0.03 : 0.015) - sink;
    this.float.position.set(this.at.x, y, this.at.z);
    this.ring.position.set(this.at.x, this.at.y + 0.01, this.at.z);
    const k = 1 + ((this.t * 1.5) % 1) * 1.6;
    this.ring.scale.set(k, 1, k);
    (this.ring.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - ((this.t * 1.5) % 1));
    const pos = this.line.geometry.getAttribute('position') as THREE.BufferAttribute;
    pos.setXYZ(1, this.at.x, y + 0.15, this.at.z);
    pos.needsUpdate = true;
  }
}

/** Dáng gốc giàn (chuỗi như `zones/nong.ts` `VineStage`). */
export type VineLook = 'trong' | 'mam' | 'leo' | 'phu' | 'chin';

/**
 * Lá + hoa + quả của một gốc giàn: các lá xếp theo độ cao (cột lên vòm) — `set(stage)` hiện phần dưới / cả vòm, quả khi chín.
 * Mỗi thứ một InstancedMesh; ẩn bằng co về 0.
 */
export class VineLeaves {
  readonly leaves: THREE.InstancedMesh;
  readonly fruit: THREE.InstancedMesh;
  private readonly leafAt: THREE.Matrix4[];
  private readonly fruitAt: THREE.Matrix4[];
  private readonly flowerIdx: number[];
  private readonly zero = new THREE.Matrix4().makeScale(0, 0, 0);
  private look: VineLook | null = null;

  /** [path] = điểm dọc cột + vòm của gốc này (từ gốc lên đỉnh, sang nửa bên kia), [fruitSpots] = chỗ treo quả. */
  constructor(scene: THREE.Scene, path: THREE.Vector3[], fruitSpots: THREE.Vector3[], leaf: string, fruitGeo: THREE.BufferGeometry) {
    const rnd = ((s) => () => ((s = (s * 16807) % 2147483647) / 2147483647))(path.length * 131 + 3);
    this.leafAt = [];
    this.flowerIdx = [];
    for (let i = 0; i < path.length; i++) {
      const p = path[i];
      for (let k = 0; k < 2; k++) {
        const s = 0.2 + rnd() * 0.1;
        const pos = p.clone().add(new THREE.Vector3((rnd() - 0.5) * 0.35, (rnd() - 0.5) * 0.25, (rnd() - 0.5) * 0.35));
        this.leafAt.push(new THREE.Matrix4().compose(pos, new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 3, rnd() * 3, rnd() * 3)), new THREE.Vector3(s, s * 0.35, s)));
        if (k === 0 && i % 3 === 1) this.flowerIdx.push(this.leafAt.length - 1);
      }
    }
    const leafGeo = joinParts([part(LEAF, leaf, [0, 0, 0])]);
    this.leaves = new THREE.InstancedMesh(leafGeo, vertexLambert(), this.leafAt.length);
    this.fruitAt = fruitSpots.map((p) => new THREE.Matrix4().makeTranslation(p.x, p.y, p.z));
    this.fruit = new THREE.InstancedMesh(fruitGeo, vertexLambert(), Math.max(1, this.fruitAt.length));
    for (const m of [this.leaves, this.fruit]) {
      markDynamic(m);
      scene.add(m);
    }
    this.set('trong');
  }

  set(look: VineLook): void {
    if (look === this.look) return;
    this.look = look;
    const n = this.leafAt.length;
    // phần lá hiện theo dáng: mầm vài lá ở gốc · leo tới nửa cột · phủ / chín cả vòm
    const shown = look === 'trong' ? 0 : look === 'mam' ? 3 : look === 'leo' ? Math.round(n * 0.3) : n;
    const flower = new THREE.Color('#f2c53d');
    const green = new THREE.Color('#ffffff');
    for (let i = 0; i < n; i++) {
      this.leaves.setMatrixAt(i, i < shown ? this.leafAt[i] : this.zero);
      this.leaves.setColorAt(i, look === 'phu' && this.flowerIdx.includes(i) ? flower : green);
    }
    this.fruitAt.forEach((m, i) => this.fruit.setMatrixAt(i, look === 'chin' ? m : this.zero));
    this.leaves.instanceMatrix.needsUpdate = true;
    if (this.leaves.instanceColor) this.leaves.instanceColor.needsUpdate = true;
    this.fruit.instanceMatrix.needsUpdate = true;
  }
}

/** Quả bầu hồ lô (treo, gốc ở đỉnh) và dưa leo. */
export function gourdGeometry(): THREE.BufferGeometry {
  return joinParts([part(SPHERE, '#a9c46a', [0, -0.42, 0], [0.16, 0.2, 0.16]), part(SPHERE, '#a9c46a', [0, -0.18, 0], [0.1, 0.12, 0.1]), part(CYL, '#6f8a3e', [0, -0.03, 0], [0.015, 0.08, 0.015])]);
}
export function cucumberGeometry(): THREE.BufferGeometry {
  return joinParts([part(SPHERE, '#5f8f3e', [0, -0.25, 0], [0.06, 0.24, 0.06]), part(CYL, '#4a6a2e', [0, -0.02, 0], [0.012, 0.06, 0.012])]);
}

/**
 * Khối đứng yên của một công trình → một khối màu theo đỉnh (1 draw call / công trình dù nhiều màu), rồi đánh dấu để
 * `mergeStatic` không gộp lại với vật liệu khác (mặt nước Basic giữ riêng).
 */
export function addStatic(scene: THREE.Scene, g: THREE.Group): void {
  mergeVertexColors(g);
  markDynamic(g);
  scene.add(g);
}
