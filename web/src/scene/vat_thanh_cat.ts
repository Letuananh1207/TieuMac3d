/**
 * Thành Cát Ngủ Quên (V-112, vùng `to-lua`): ghép cổng thành + lạc đà (`congThanh.ts`) với vật lặp — tường thành đổ nát
 * (khối tĩnh, `mergeSoft` gộp), ụ cát đào + cọc + cờ + hạt lấp lánh, cờ phướn, phiến đá lối cổ (InstancedMesh: mỗi loại 1
 * draw call cho cả vùng), cỏ ốc đảo + lều vải. Số đo, màu: `sandCity` (thanhCatSpec.ts).
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import { addCamelHead, addSandGate } from './congThanh';
import { lambert } from './materials';
import { seededRandom } from './random';
import { wallChunks, type SandCitySpec, type TentSpec } from './thanhCatSpec';
import { finish } from './trees';
import type { GroundY } from './terrainHeight';

/** Tường đổ nát: mỗi đoạn một khối đất nện chôn chân 1,2 m dưới chỗ cát thấp nhất, đỉnh lởm chởm 1–2 răng gãy. */
function ruinWalls(scene: THREE.Scene, colliders: Colliders, s: SandCitySpec, groundY: GroundY): void {
  const rand = seededRandom(s.seed + 21);
  const earth = lambert(s.colors.earth);
  const dark = lambert(s.colors.earthDark);
  for (const w of s.walls) {
    const z = w.from[1];
    const t = w.thick ?? 2.2;
    for (const c of wallChunks(w, rand)) {
      const ends = [c.x - c.len / 2, c.x, c.x + c.len / 2].flatMap((x) => [groundY(x, z - t / 2), groundY(x, z + t / 2)]);
      // đỉnh theo cát trung bình (đầu cao vùi sâu hơn, vẫn nhô ≥ 0,4 m) — không dựng thành cột cao bên sườn dốc
      const lo = Math.min(...ends) - 1.2;
      const top = Math.max(ends.reduce((a, b) => a + b, 0) / ends.length + c.h, Math.max(...ends) + 0.4);
      const m = new THREE.Mesh(new THREE.BoxGeometry(c.len, top - lo, t), earth);
      m.position.set(c.x, (top + lo) / 2, z);
      m.rotation.y = (rand() - 0.5) * 0.06;
      scene.add(m);
      // lằn đất nện + răng gãy trên đỉnh
      const band = new THREE.Mesh(new THREE.BoxGeometry(c.len - 0.1, 0.14, t + 0.08), dark);
      band.position.set(c.x, top - 0.55, z);
      band.rotation.y = m.rotation.y;
      scene.add(band);
      const teeth = c.len > 4 ? 2 : 1;
      for (let i = 0; i < teeth; i++) {
        const tw = 0.8 + rand() * 0.6;
        const th = 0.4 + rand() * 0.5;
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(tw, th, t * 0.7), earth);
        tooth.position.set(c.x + (rand() - 0.5) * (c.len - tw - 0.3), top + th / 2 - 0.05, z + (rand() - 0.5) * 0.3);
        tooth.rotation.set(0, (rand() - 0.5) * 0.3, (rand() - 0.5) * 0.15);
        scene.add(tooth);
      }
      colliders.add(c.x, z, c.len + 0.1, t + 0.1, 0);
    }
  }
}

/** Ụ cát đào: gò thấp + cọc gỗ + cờ vải trơn + hạt lấp lánh; cờ phướn lẻ: cột + cờ dọc. Không va chạm. */
function moundsAndFlags(scene: THREE.Scene, s: SandCitySpec, groundY: GroundY): void {
  const n = s.mounds.length;
  const total = n + s.flags.length;
  if (!total) return;
  const rand = seededRandom(s.seed + 33);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const sc = new THREE.Vector3();
  const color = new THREE.Color();
  const mound = n ? new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 9, 2).translate(0, 0.5, 0), lambert(s.colors.mound), n) : null;
  const stake = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.07, 1, 5).translate(0, 0.5, 0), lambert(s.colors.stake), total);
  // cờ: tấm vải đuôi nheo (hai tam giác), gốc ở cán, bay về +x; hai mặt
  const cloth = new THREE.BufferGeometry();
  cloth.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, -0.15, 0.04, 0, -0.62, 0, 1, -0.15, 0.04, 0.78, -0.5, 0.06, 0, -0.62, 0], 3));
  cloth.computeVertexNormals();
  const flags = new THREE.InstancedMesh(cloth, lambert('#ffffff', { side: THREE.DoubleSide }), total);
  const SPARK = 5;
  const spark = n ? new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.07, 0), lambert('#fff1c2', { emissive: '#7a6230' }), n * SPARK) : null;
  const place = (i: number, x: number, z: number, y: number, pole: number, fw: number): void => {
    const lean = (rand() - 0.5) * 0.12;
    e.set(lean, 0, (rand() - 0.5) * 0.12);
    m.compose(v.set(x, y - 0.2, z), q.setFromEuler(e), sc.set(1, pole + 0.2, 1));
    stake.setMatrixAt(i, m);
    e.set(lean, rand() * Math.PI * 2, 0);
    m.compose(v.set(x, y + pole - 0.05, z), q.setFromEuler(e), sc.set(fw, fw, fw));
    flags.setMatrixAt(i, m);
    flags.setColorAt(i, color.set(s.colors.flag[i % 2]));
  };
  s.mounds.forEach(({ x, z }, i) => {
    const y = groundY(x, z);
    const r = 1.0 + rand() * 0.5;
    const h = 0.45 + rand() * 0.3;
    m.compose(v.set(x, y - 0.12, z), q.setFromEuler(e.set(0, rand() * 6, 0)), sc.set(r, h, r * (0.8 + rand() * 0.3)));
    mound?.setMatrixAt(i, m);
    for (let k = 0; k < SPARK; k++) {
      const a = rand() * Math.PI * 2;
      const d = rand() * r * 0.7;
      const yy = y - 0.12 + h * (1 - d / r) + 0.02;
      m.compose(v.set(x + Math.cos(a) * d, yy, z + Math.sin(a) * d), q.setFromEuler(e.set(rand(), rand(), rand())), sc.setScalar(0.7 + rand() * 0.6));
      spark?.setMatrixAt(i * SPARK + k, m);
    }
    // cọc cắm mép ụ
    const a = rand() * Math.PI * 2;
    place(i, x + Math.cos(a) * r * 0.8, z + Math.sin(a) * r * 0.8, y, 1.5, 0.6);
  });
  s.flags.forEach(({ x, z }, j) => place(n + j, x, z, groundY(x, z), 3.0, 1.1));
  finish(scene, [stake, flags, ...(mound ? [mound] : []), ...(spark ? [spark] : [])]);
}

/** Lối đá cổ: lưới phiến 1,1 × 0,8 m; càng về `to` càng mất phiến, phiến còn lại nghiêng + lún sâu hơn. Một InstancedMesh. */
function oldRoad(scene: THREE.Scene, s: SandCitySpec, groundY: GroundY): void {
  const R = s.road;
  if (R.width <= 0) return;
  const [ax, az] = R.from;
  const dx = R.to[0] - ax;
  const dz = R.to[1] - az;
  const len = Math.hypot(dx, dz);
  if (len < 1) return;
  const ux = dx / len;
  const uz = dz / len;
  const yaw = Math.atan2(ux, uz);
  const rand = seededRandom(s.seed + 47);
  const cols = Math.max(1, Math.round(R.width / 1.15));
  const rows = Math.floor(len / 0.85);
  const slab = new THREE.InstancedMesh(new THREE.BoxGeometry(1.06, 0.2, 0.78), lambert('#ffffff'), cols * rows);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);
  const color = new THREE.Color();
  let k = 0;
  for (let r = 0; r < rows; r++) {
    const f = r / rows; // 0 ở đầu sân, 1 ở chân cổng
    for (let c = 0; c < cols; c++) {
      if (rand() < f * 0.8) continue; // lún mất dưới cát
      const off = (c - (cols - 1) / 2) * 1.15 + (r % 2 ? 0.3 : 0);
      if (Math.abs(off) > R.width / 2) continue;
      const along = (r + 0.5) * 0.85;
      const x = ax + ux * along + uz * off;
      const z = az + uz * along - ux * off;
      const tilt = 0.02 + f * 0.12;
      e.set((rand() - 0.5) * tilt, yaw + (rand() - 0.5) * 0.1, (rand() - 0.5) * tilt, 'YXZ');
      // mặt phiến cao hơn mặt cát 2–8 cm (đầu sân) → thấp dần (phần lún chìm dưới cát)
      m.compose(v.set(x, groundY(x, z) - 0.1 + 0.08 - f * 0.05 + rand() * 0.02, z), q.setFromEuler(e), one);
      slab.setMatrixAt(k, m);
      slab.setColorAt(k++, color.set(s.colors.road).multiplyScalar(0.9 + rand() * 0.16));
    }
  }
  slab.count = k;
  finish(scene, [slab]);
}

/** Lều vải chữ A dài `len` (mặc định 3 m): mái vải hai dốc, hai cọc, cửa lều tối mặt +z. */
function tent(scene: THREE.Scene, colliders: Colliders, t: TentSpec, s: SandCitySpec, groundY: GroundY): void {
  const len = t.len ?? 3;
  const g = new THREE.Group();
  g.position.set(t.x, groundY(t.x, t.z), t.z);
  g.rotation.y = ((t.rotY ?? 0) * Math.PI) / 180;
  const cloth = lambert(s.colors.tent, { side: THREE.DoubleSide });
  const W = 2.4;
  const H = 1.9;
  // hai mái: lăng trụ tam giác rỗng đáy (dọc z)
  const roof = new THREE.BufferGeometry();
  const hw = W / 2;
  const hl = len / 2;
  roof.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([-hw, 0, hl, 0, H, hl, 0, H, -hl, -hw, 0, hl, 0, H, -hl, -hw, 0, -hl, hw, 0, -hl, 0, H, -hl, 0, H, hl, hw, 0, -hl, 0, H, hl, hw, 0, hl, -hw, 0, -hl, 0, H, -hl, hw, 0, -hl], 3),
  );
  roof.computeVertexNormals();
  g.add(new THREE.Mesh(roof, cloth));
  // cửa lều: tam giác tối lùi 5 cm trong mép trước
  const door = new THREE.BufferGeometry();
  door.setAttribute('position', new THREE.Float32BufferAttribute([-hw * 0.55, 0.02, hl - 0.05, hw * 0.55, 0.02, hl - 0.05, 0, H * 0.75, hl - 0.05], 3));
  door.computeVertexNormals();
  g.add(new THREE.Mesh(door, lambert('#5a4632', { side: THREE.DoubleSide })));
  const pole = lambert(s.colors.stake);
  for (const sz of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, H + 0.35, 5), pole);
    p.position.set(0, (H + 0.35) / 2 - 0.05, sz * (hl + 0.08));
    g.add(p);
  }
  scene.add(g);
  const rot = (t.rotY ?? 0) % 180 !== 0;
  colliders.add(t.x, t.z, rot ? len + 0.2 : W + 0.2, rot ? W + 0.2 : len + 0.2, 0);
}

/** Đĩa cỏ ốc đảo: đa giác mép gợn, cao hơn mặt cát 3 cm (nằm trên bục phẳng). */
function oasisGrass(scene: THREE.Scene, s: SandCitySpec, groundY: GroundY): void {
  const O = s.oasis;
  if (O.r <= 0) return;
  const rand = seededRandom(s.seed + 59);
  const shape = new THREE.Shape();
  const N = 22;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = O.r * (0.88 + rand() * 0.18);
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();
  const disc = new THREE.Mesh(new THREE.ShapeGeometry(shape).rotateX(-Math.PI / 2), lambert(s.colors.grass));
  disc.position.set(O.x, groundY(O.x, O.z) + 0.03, O.z);
  scene.add(disc);
}

/** Dựng Thành Cát Ngủ Quên theo `sandCity` (tắt / rỗng → không dựng gì); trả tấm đi được (mặt thành). */
export function addSandCity(scene: THREE.Scene, colliders: Colliders, s: SandCitySpec, groundY: GroundY): Pad[] {
  const pads = s.gate.enabled ? addSandGate(scene, colliders, s, groundY(s.gate.x, s.gate.z)) : [];
  if (s.camel.enabled) addCamelHead(scene, colliders, s, groundY(s.camel.x, s.camel.z));
  ruinWalls(scene, colliders, s, groundY);
  moundsAndFlags(scene, s, groundY);
  oldRoad(scene, s, groundY);
  oasisGrass(scene, s, groundY);
  for (const t of s.tents) tent(scene, colliders, t, s, groundY);
  return pads;
}
