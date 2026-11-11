import * as THREE from 'three';
import type { Heightfield } from '../collision/heightfield';
import { finish } from './trees';
import { seededRandom } from './random';
import type { PathSpec, SceneSpec } from './spec';

type Terrain = SceneSpec['terrain'];

/** Tối đa (giữ nhẹ cho điện thoại): mỗi loại một InstancedMesh = một draw call. */
const MAX_TUFTS = 3000;
const MAX_ROCKS = 400;
/** Cỏ chỉ mọc trên đất thoải hơn (độ). */
const GRASS_SLOPE = 25;

/** Búi cỏ: 3 lá tam giác mảnh xoè 120°, gốc ở y = 0. */
function tuftGeometry(): THREE.BufferGeometry {
  const pos: number[] = [];
  for (let k = 0; k < 3; k++) {
    const a = (k * Math.PI * 2) / 3;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const lean = 0.12;
    pos.push(-0.07 * c, 0, -0.07 * s, 0.07 * c, 0, 0.07 * s, lean * s, 0.5, -lean * c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** Điểm có nằm trên bục lát, lối lát hay bậc đá không (không mọc cỏ / đá ở đó). */
function onBuilt(t: Terrain, paths: PathSpec[], x: number, z: number): boolean {
  for (const p of t.plateaus) {
    if (!p.pave) continue;
    if (x >= Math.min(p.from[0], p.to[0]) - 0.5 && x <= Math.max(p.from[0], p.to[0]) + 0.5 && z >= Math.min(p.from[1], p.to[1]) - 0.5 && z <= Math.max(p.from[1], p.to[1]) + 0.5) {
      return true;
    }
  }
  for (const s of [...paths, ...t.stairs]) {
    const [ax, az] = s.from;
    const dx = s.to[0] - ax;
    const dz = s.to[1] - az;
    const k = Math.min(1, Math.max(0, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    if (Math.hypot(x - (ax + dx * k), z - (az + dz * k)) < s.width / 2 + 0.8) return true;
  }
  return false;
}

/**
 * Cỏ búi + đá rải trên địa hình (`terrain.grass`, `terrain.rocks`), rải ngẫu nhiên có hạt giống trong mép cao nguyên.
 * Không va chạm. Mỗi loại một InstancedMesh (màu từng búi / tảng khác nhau nhẹ).
 */
export function addGrassAndRocks(scene: THREE.Scene, t: Terrain, hf: Heightfield, paths: PathSpec[]): void {
  const [cx, cz] = t.center;
  const R = t.edge.radius - 2;
  const area = Math.PI * R * R;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const pos = new THREE.Vector3();
  const size = new THREE.Vector3();

  const sample = (rand: () => number): [number, number] => {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * R;
    return [cx + Math.cos(a) * r, cz + Math.sin(a) * r];
  };

  if (t.grass.density > 0) {
    const want = Math.min(MAX_TUFTS, Math.round((t.grass.density * area) / 100));
    const rand = seededRandom(t.noise.seed * 31 + 5);
    const mesh = new THREE.InstancedMesh(tuftGeometry(), new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), want);
    const colors = t.grass.colors.map((c) => new THREE.Color(c));
    const tint = new THREE.Color();
    let n = 0;
    for (let tries = 0; tries < want * 6 && n < want; tries++) {
      const [x, z] = sample(rand);
      const y = hf.heightAt(x, z);
      if (!Number.isFinite(y) || y < -1 || hf.slopeAt(x, z) > GRASS_SLOPE || onBuilt(t, paths, x, z)) continue;
      const s = 0.7 + rand() * 0.7;
      m.compose(pos.set(x, y - 0.02, z), q.setFromEuler(e.set(0, rand() * Math.PI * 2, 0)), size.set(s, s * (0.8 + rand() * 0.5), s));
      mesh.setMatrixAt(n, m);
      mesh.setColorAt(n, tint.copy(colors[n % colors.length]).lerp(colors[(n + 1) % colors.length], rand() * 0.4));
      n++;
    }
    mesh.count = n;
    if (n) finish(scene, [mesh]);
  }

  if (t.rocks.density > 0) {
    const want = Math.min(MAX_ROCKS, Math.round((t.rocks.density * area) / 1000));
    const rand = seededRandom(t.noise.seed * 53 + 9);
    const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.5, 0), new THREE.MeshLambertMaterial({ flatShading: true }), want);
    const base = new THREE.Color(t.rocks.color);
    const tint = new THREE.Color();
    let n = 0;
    for (let tries = 0; tries < want * 8 && n < want; tries++) {
      const [x, z] = sample(rand);
      const y = hf.heightAt(x, z);
      if (!Number.isFinite(y) || y < -1 || onBuilt(t, paths, x, z)) continue;
      // nhiều đá trên sườn dốc, thưa trên cỏ phẳng
      if (hf.slopeAt(x, z) < 20 && rand() > 0.35) continue;
      const s = 0.4 + rand() * 1.1;
      m.compose(
        pos.set(x, y - 0.12 * s, z),
        q.setFromEuler(e.set(rand() * 0.5, rand() * Math.PI * 2, rand() * 0.5)),
        size.set(s * (0.8 + rand() * 0.6), s * (0.5 + rand() * 0.4), s * (0.8 + rand() * 0.6)),
      );
      mesh.setMatrixAt(n, m);
      mesh.setColorAt(n, tint.copy(base).multiplyScalar(0.85 + rand() * 0.3));
      n++;
    }
    mesh.count = n;
    if (n) finish(scene, [mesh]);
  }
}
