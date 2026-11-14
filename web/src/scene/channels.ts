/**
 * Mương khúc thuỷ (曲水, Rừng trúc — hồ sơ `docs/tham_khao/rung-truc.md`): lòng nước hẹp uốn theo đường cong mềm qua
 * `points`, thành đá thấp hai bên, chén tai sơn mài (耳杯 — đỏ trong, đen ngoài) trôi chậm dọc mương rồi lặp lại.
 * Không va chạm (hẹp 0,6 m, như suối — R-VA-1). Thành đá gộp chung vật liệu (mergeStatic); chén: 2 InstancedMesh.
 */
import * as THREE from 'three';
import type { Style } from './buildings';
import { lambert } from './materials';
import { markDynamic } from './merge';
import type { ChannelSpec, XZ } from './spec';
import type { GroundY } from './terrainHeight';

type Updater = (dt: number) => void;

const STEP = 0.4; // m giữa hai điểm lấy mẫu
const CURB_W = 0.18;
const CURB_H = 0.15;

export interface ChannelSample {
  x: number;
  z: number;
  /** hướng dòng chảy (rad, như rotation.y: 0 = +z) */
  heading: number;
}

/** Lấy mẫu đều ~`step` m dọc đường cong mềm (Catmull-Rom) qua `points`. Thuần (three chỉ dùng toán). */
export function channelSamples(points: XZ[], step = STEP): ChannelSample[] {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
  const n = Math.max(2, Math.ceil(curve.getLength() / step) + 1);
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const p = curve.getPointAt(t);
    const d = curve.getTangentAt(t);
    return { x: p.x, z: p.z, heading: Math.atan2(d.x, d.z) };
  });
}

/** Dải nước phẳng theo mẫu (tam giác dải), nằm sát mặt đất. */
function waterRibbon(samples: ChannelSample[], w: number, groundY: GroundY): THREE.BufferGeometry {
  const pos: number[] = [];
  for (const s of samples) {
    const nx = Math.cos(s.heading); // pháp tuyến ngang (vuông góc hướng chảy)
    const nz = -Math.sin(s.heading);
    const y = groundY(s.x, s.z) + 0.05;
    pos.push(s.x - (nx * w) / 2, y, s.z - (nz * w) / 2, s.x + (nx * w) / 2, y, s.z + (nz * w) / 2);
  }
  const idx: number[] = [];
  for (let i = 0; i < samples.length - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Chén tai: thân dẹt bầu dục (ngoài đen) + lòng đỏ, dài 0,35 m. */
function cupMeshes(n: number): [THREE.InstancedMesh, THREE.InstancedMesh] {
  const body = new THREE.SphereGeometry(0.17, 8, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).scale(0.75, 0.5, 1);
  const inner = new THREE.CircleGeometry(0.15, 10).rotateX(-Math.PI / 2).scale(0.72, 1, 0.95).translate(0, 0.002, 0);
  const meshes: [THREE.InstancedMesh, THREE.InstancedMesh] = [
    new THREE.InstancedMesh(body, lambert('#2a1e1a', { side: THREE.DoubleSide }), n),
    new THREE.InstancedMesh(inner, lambert('#8e2b22'), n),
  ];
  for (const m of meshes) {
    markDynamic(m);
    m.frustumCulled = false;
  }
  return meshes;
}

/** Dựng các mương; trả về hàm cập nhật (chén trôi). */
export function addChannels(scene: THREE.Scene, list: ChannelSpec[], style: Style, groundY: GroundY = () => 0): Updater {
  const updaters: Updater[] = [];
  const stone = lambert(style.stone);
  const waterMat = new THREE.MeshBasicMaterial({ color: style.water });
  for (const c of list) {
    const w = c.width ?? 0.6;
    const samples = channelSamples(c.points);
    scene.add(new THREE.Mesh(waterRibbon(samples, w, groundY), waterMat));
    for (let i = 0; i < samples.length - 1; i++) {
      const a = samples[i];
      const b = samples[i + 1];
      const len = Math.hypot(b.x - a.x, b.z - a.z) + 0.04;
      const heading = Math.atan2(b.x - a.x, b.z - a.z);
      const nx = Math.cos(heading);
      const nz = -Math.sin(heading);
      for (const side of [-1, 1]) {
        const off = side * (w / 2 + CURB_W / 2);
        const x = (a.x + b.x) / 2 + nx * off;
        const z = (a.z + b.z) / 2 + nz * off;
        const m = new THREE.Mesh(new THREE.BoxGeometry(CURB_W, CURB_H + 0.1, len), stone);
        m.position.set(x, groundY(x, z) + CURB_H / 2 - 0.05, z);
        m.rotation.y = heading;
        scene.add(m);
      }
    }
    const n = Math.max(0, Math.round(c.cups ?? 0));
    if (!n) continue;
    const [body, inner] = cupMeshes(n);
    scene.add(body, inner);
    const curve = new THREE.CatmullRomCurve3(c.points.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
    const total = curve.getLength();
    const speed = c.speed ?? 0.4;
    const ts = Array.from({ length: n }, (_, i) => i / n);
    const o = new THREE.Object3D();
    let clock = 0;
    updaters.push((dt) => {
      clock += dt;
      ts.forEach((t0, i) => {
        const t = (t0 + (clock * speed) / total) % 1;
        const p = curve.getPointAt(t);
        const d = curve.getTangentAt(t);
        o.position.set(p.x, groundY(p.x, p.z) + 0.1 + Math.sin(clock * 2 + i) * 0.01, p.z);
        o.rotation.set(0, Math.atan2(d.x, d.z) + Math.sin(clock * 0.7 + i) * 0.3, 0);
        o.updateMatrix();
        body.setMatrixAt(i, o.matrix);
        inner.setMatrixAt(i, o.matrix);
      });
      body.instanceMatrix.needsUpdate = true;
      inner.instanceMatrix.needsUpdate = true;
    });
  }
  return (dt) => {
    for (const u of updaters) u(dt);
  };
}
