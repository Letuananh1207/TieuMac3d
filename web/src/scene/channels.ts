/**
 * Mương khúc thuỷ (曲水, Rừng trúc — hồ sơ `docs/tham_khao/rung-truc.md`): lòng nước hẹp uốn theo đường cong mềm qua
 * `points`, thành đá thấp hai bên, chén tai sơn mài (耳杯 — đỏ trong, đen ngoài) trôi chậm dọc mương rồi lặp lại.
 * Không va chạm (hẹp 0,6 m, như suối — R-VA-1). Thành đá gộp chung vật liệu (mergeStatic); chén: 2 InstancedMesh.
 * **Chén lệnh** (Lưu Thương — R-LUU-2): thêm 1 chén viền vàng vào cùng InstancedMesh (+0 draw call), vị trí do nơi ghép
 * đặt (`ChannelSet.command`); đường cong + điểm dừng trước đệm xuất ở `ChannelPath`.
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
/** Màu chén: thân đen, lòng đỏ; chén lệnh: thân + lòng vàng son (R-LUU-2). */
const CUP_BODY = '#2a1e1a';
const CUP_INNER = '#8e2b22';
const COMMAND_BODY = '#b8892e';
const COMMAND_INNER = '#e2b552';

export interface ChannelSample {
  x: number;
  z: number;
  /** hướng dòng chảy (rad, như rotation.y: 0 = +z) */
  heading: number;
}

const curveOf = (points: XZ[]): THREE.CatmullRomCurve3 =>
  new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');

/** Lấy mẫu đều ~`step` m dọc đường cong mềm (Catmull-Rom) qua `points`. Thuần (three chỉ dùng toán). */
export function channelSamples(points: XZ[], step = STEP): ChannelSample[] {
  const curve = curveOf(points);
  const n = Math.max(2, Math.ceil(curve.getLength() / step) + 1);
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const p = curve.getPointAt(t);
    const d = curve.getTangentAt(t);
    return { x: p.x, z: p.z, heading: Math.atan2(d.x, d.z) };
  });
}

/** Đường mương theo độ dài (t 0…1 đều theo mét) — chén lệnh trôi theo, tìm điểm dừng trước đệm. Thuần. */
export interface ChannelPath {
  length: number;
  pointAt(t: number): ChannelSample;
  /** t của điểm mương gần (x, z) nhất (lấy mẫu mỗi ~5 cm) */
  nearestT(x: number, z: number): number;
}

export function channelPath(points: XZ[]): ChannelPath {
  const curve = curveOf(points);
  const length = curve.getLength();
  const n = Math.max(20, Math.ceil(length / 0.05));
  const pts = Array.from({ length: n + 1 }, (_, i) => curve.getPointAt(i / n));
  return {
    length,
    pointAt(t) {
      const k = Math.min(1, Math.max(0, t));
      const p = curve.getPointAt(k);
      const d = curve.getTangentAt(k);
      return { x: p.x, z: p.z, heading: Math.atan2(d.x, d.z) };
    },
    nearestT(x, z) {
      let best = 0;
      let bestD = Infinity;
      pts.forEach((p, i) => {
        const d = (p.x - x) ** 2 + (p.z - z) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i / n;
        }
      });
      return best;
    },
  };
}

/** Điểm dừng chén trước đệm (x, z) (R-LUU-2): điểm mương gần đệm nhất, kèm khoảng cách. */
export function stopPoint(path: ChannelPath, seat: { x: number; z: number }): { t: number; x: number; z: number; dist: number } {
  const t = path.nearestT(seat.x, seat.z);
  const p = path.pointAt(t);
  return { t, x: p.x, z: p.z, dist: Math.hypot(p.x - seat.x, p.z - seat.z) };
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

/** Chén tai: thân dẹt bầu dục + lòng, dài 0,35 m; màu theo từng chén (instanceColor, vật liệu trắng). */
function cupMeshes(n: number): [THREE.InstancedMesh, THREE.InstancedMesh] {
  const body = new THREE.SphereGeometry(0.17, 8, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).scale(0.75, 0.5, 1);
  const inner = new THREE.CircleGeometry(0.15, 10).rotateX(-Math.PI / 2).scale(0.72, 1, 0.95).translate(0, 0.002, 0);
  const meshes: [THREE.InstancedMesh, THREE.InstancedMesh] = [
    new THREE.InstancedMesh(body, lambert('#ffffff', { side: THREE.DoubleSide }), n),
    new THREE.InstancedMesh(inner, lambert('#ffffff'), n),
  ];
  for (const m of meshes) {
    markDynamic(m);
    m.frustumCulled = false;
  }
  return meshes;
}

/** Chén lệnh của một mương: `place(t)` đặt chén ở phần đường t (0…1) và xoay [spin] rad; `null` = cất (ẩn). */
export interface CommandCup {
  place(t: number | null, spin?: number): void;
}

export interface ChannelSet {
  update: Updater;
  /** đường từng mương (theo thứ tự `channels`) */
  paths: ChannelPath[];
  /** chén lệnh của mương [i] — chỉ mương có trong `commands` khi dựng; không có → `null` */
  command(i: number): CommandCup | null;
}

/** Dựng các mương; [commands] = chỉ số mương có chén lệnh (Lưu Thương). */
export function addChannels(scene: THREE.Scene, list: ChannelSpec[], style: Style, groundY: GroundY = () => 0, commands: ReadonlySet<number> = new Set()): ChannelSet {
  const updaters: Updater[] = [];
  const cups = new Map<number, CommandCup>();
  const stone = lambert(style.stone);
  const waterMat = new THREE.MeshBasicMaterial({ color: style.water });
  const paths: ChannelPath[] = [];
  list.forEach((c, ci) => {
    const w = c.width ?? 0.6;
    const samples = channelSamples(c.points);
    paths.push(channelPath(c.points));
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
    const cmd = commands.has(ci) ? 1 : 0;
    if (!n && !cmd) return;
    const [body, inner] = cupMeshes(n + cmd);
    const tint = new THREE.Color();
    for (let i = 0; i < n + cmd; i++) {
      body.setColorAt(i, tint.set(i < n ? CUP_BODY : COMMAND_BODY));
      inner.setColorAt(i, tint.set(i < n ? CUP_INNER : COMMAND_INNER));
    }
    scene.add(body, inner);
    const path = paths[ci];
    const speed = c.speed ?? 0.4;
    const ts = Array.from({ length: n }, (_, i) => i / n);
    const o = new THREE.Object3D();
    let clock = 0;
    const put = (i: number, t: number, yaw: number, bob: number): void => {
      const p = path.pointAt(t);
      o.position.set(p.x, groundY(p.x, p.z) + 0.1 + bob, p.z);
      o.rotation.set(0, p.heading + yaw, 0);
      o.scale.setScalar(1);
      o.updateMatrix();
      body.setMatrixAt(i, o.matrix);
      inner.setMatrixAt(i, o.matrix);
    };
    if (cmd) {
      const hide = (): void => {
        o.position.set(0, -50, 0);
        o.scale.setScalar(0.0001);
        o.updateMatrix();
        body.setMatrixAt(n, o.matrix);
        inner.setMatrixAt(n, o.matrix);
      };
      hide();
      cups.set(ci, {
        place(t, spin = 0) {
          if (t === null) hide();
          else put(n, t, spin, Math.sin(clock * 2.3) * 0.01);
          body.instanceMatrix.needsUpdate = true;
          inner.instanceMatrix.needsUpdate = true;
        },
      });
    }
    updaters.push((dt) => {
      clock += dt;
      ts.forEach((t0, i) => put(i, (t0 + (clock * speed) / path.length) % 1, Math.sin(clock * 0.7 + i) * 0.3, Math.sin(clock * 2 + i) * 0.01));
      body.instanceMatrix.needsUpdate = true;
      inner.instanceMatrix.needsUpdate = true;
    });
  });
  return {
    update: (dt) => {
      for (const u of updaters) u(dt);
    },
    paths,
    command: (i) => cups.get(i) ?? null,
  };
}
