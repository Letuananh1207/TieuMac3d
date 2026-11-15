/**
 * Kè đá khối (`terrain.plateaus[].rocky`, V-66): dọc mép bục, chỗ chênh cao với đất bên ngoài > 1 m, xếp hai hàng đá khối
 * lệch nhiều mặt (hàng trên lệch nửa nhịp với hàng dưới), cỡ / góc / màu đậm nhạt ngẫu nhiên có hạt giống — kè gò, gờ thác
 * bớt "mặt bê tông". Chừa chỗ bậc đá, lối lát cắt qua và màn thác. Không va chạm (kè dốc > 35° đã chặn — R-VA-2).
 * Một InstancedMesh cho cả cảnh (1 draw call). `rockyStones` thuần (không three) để test.
 */
import * as THREE from 'three';
import { seededRandom } from './random';
import type { PathSpec, SceneSpec, XZ } from './spec';
import type { GroundY } from './terrainHeight';

/** Một viên đá kè: tâm, cỡ ngang / cao (m), góc quay quanh trục đứng, độ sáng (nhân màu đá). */
export interface KeStone {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  rot: number;
  shade: number;
}

/** Nhịp viên đá dọc mép (m). */
const STEP = 1.6;
/** các hàng đá: phần bề ngang kè tính từ mép bục */
const ROWS = [0.3, 0.78];

function nearLane(lanes: { from: XZ; to: XZ; width: number }[], x: number, z: number): boolean {
  return lanes.some((s) => {
    const [ax, az] = s.from;
    const dx = s.to[0] - ax;
    const dz = s.to[1] - az;
    const k = Math.min(1, Math.max(0, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    return Math.hypot(x - (ax + dx * k), z - (az + dz * k)) < s.width / 2 + 1;
  });
}

/** Trước mặt thác (chừa màn nước, không che thác). */
function nearFall(falls: SceneSpec['terrain']['waterfalls'], x: number, z: number): boolean {
  return falls.some((f) => Math.hypot(x - f.x, z - f.z) < f.width / 2 + 2.5);
}

/** Các viên đá kè của mọi bục `rocky` (thuần — chỉ cần hàm độ cao mặt đất). */
export function rockyStones(t: SceneSpec['terrain'], paths: PathSpec[], groundY: GroundY, seed: number): KeStone[] {
  const rand = seededRandom(seed * 4337 + 19);
  const lanes = [...paths, ...t.stairs];
  const out: KeStone[] = [];
  for (const p of t.plateaus) {
    if (!p.rocky) continue;
    const x0 = Math.min(p.from[0], p.to[0]);
    const x1 = Math.max(p.from[0], p.to[0]);
    const z0 = Math.min(p.from[1], p.to[1]);
    const z1 = Math.max(p.from[1], p.to[1]);
    const band = Math.max(1, p.blend ?? t.blend);
    // 4 cạnh: điểm đầu, hướng dọc cạnh, pháp tuyến ra ngoài
    const sides: [number, number, number, number, number, number, number][] = [
      [x0, z0, 1, 0, 0, -1, x1 - x0],
      [x0, z1, 1, 0, 0, 1, x1 - x0],
      [x0, z0, 0, 1, -1, 0, z1 - z0],
      [x1, z0, 0, 1, 1, 0, z1 - z0],
    ];
    for (const [sx, sz, dx, dz, nx, nz, len] of sides) {
      // 3 hàng (gần mép bục → chân kè), nhịp + độ lùi lệch ngẫu nhiên: đá khối xô lệch, không thẳng hàng
      for (const frac of ROWS) {
        for (let a = 0.3 + rand() * STEP; a < len - 0.3; a += STEP * (0.7 + rand() * 0.6)) {
          const off = band * (frac + (rand() - 0.5) * 0.18);
          const x = sx + dx * a + nx * off;
          const z = sz + dz * a + nz * off;
          const drop = p.y - groundY(sx + dx * a + nx * (band + 0.6), sz + dz * a + nz * (band + 0.6));
          const s = 0.7 + rand() * 0.6;
          const rot = rand() * Math.PI;
          const shade = 0.74 + rand() * 0.34;
          if (Math.abs(drop) < 1 || nearLane(lanes, x, z) || nearFall(t.waterfalls, x, z)) continue;
          out.push({
            x,
            y: groundY(x, z),
            z,
            w: (1.1 + Math.min(1.4, Math.abs(drop) * 0.14)) * s,
            h: (0.8 + Math.min(1.6, Math.abs(drop) * 0.2)) * s,
            rot,
            shade,
          });
        }
      }
    }
  }
  return out;
}

/** Dựng kè đá: một InstancedMesh khối 20 mặt lệch (flat shading), màu đá `color` nhân độ sáng từng viên. */
export function addRockyKe(scene: THREE.Scene, t: SceneSpec['terrain'], paths: PathSpec[], groundY: GroundY, seed: number, color: string): void {
  const stones = rockyStones(t, paths, groundY, seed);
  if (!stones.length) return;
  // khối 20 mặt bẹt, các đỉnh xô lệch: đá khối nhiều mặt, không tròn
  const geo = new THREE.IcosahedronGeometry(0.6, 0);
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const jr = seededRandom(seed * 131 + 7);
  const moved = new Map<string, [number, number, number]>();
  for (let i = 0; i < pos.count; i++) {
    const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
    const d = moved.get(key) ?? [(jr() - 0.5) * 0.22, (jr() - 0.5) * 0.18, (jr() - 0.5) * 0.22];
    moved.set(key, d);
    pos.setXYZ(i, pos.getX(i) + d[0], Math.max(-0.35, pos.getY(i) + d[1]) * 0.85, pos.getZ(i) + d[2]);
  }
  geo.computeVertexNormals();
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ flatShading: true }), stones.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const base = new THREE.Color(color);
  const c = new THREE.Color();
  stones.forEach((st, i) => {
    m.compose(new THREE.Vector3(st.x, st.y, st.z), q.setFromAxisAngle(up, st.rot), new THREE.Vector3(st.w, st.h, st.w * 0.8));
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, c.copy(base).multiplyScalar(st.shade));
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  scene.add(mesh);
}
