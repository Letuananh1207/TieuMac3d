/**
 * Hạc truyền tống (R-HANH-5): hạc đỉnh đỏ (丹顶鹤) lớn chở nhân vật — thân trắng, cổ + đuôi + mép cánh đen, đỉnh đầu đỏ, mỏ
 * vàng xám, chân duỗi sau. Dài ~3 m, sải cánh ~5,6 m (× `crane.scale`). Dựng bằng khối (cần vỗ cánh — model AI không có
 * xương cánh): thân gộp màu theo đỉnh + 2 cánh = **3 draw call**, ~260 tam giác, một vật liệu Lambert (quy tắc 4).
 * Mũi nhìn +z, gốc ở mặt đất dưới thân. Neo `seat` trên lưng — chỗ nhân vật ngồi.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { lambert } from './materials';
import { markDynamic } from './merge';
import type { CraneSpec } from './spec';

/** Góc vỗ cánh (radian) — dùng chung cho đàn hạc nhỏ (`fauna.ts`) và hạc truyền tống. */
export function flapAngle(t: number, phase = 0, amp = 0.5, speed = 5): number {
  return Math.sin(t * speed + phase) * amp;
}

/** Vai cánh (toạ độ hạc, chưa nhân `scale`). */
const SHOULDER: [number, number, number] = [0.3, 1.55, 0.18];
/** Chỗ ngồi trên lưng (toạ độ hạc). */
export const SEAT_AT: [number, number, number] = [0, 1.82, -0.1];
/** Cánh xếp dọc thân khi đứng (radian quanh trục đứng). */
const FOLD_YAW = 1.35;

type Part = [THREE.BufferGeometry, string];

function painted(g: THREE.BufferGeometry, hex: string): THREE.BufferGeometry {
  const geo = g.index ? g.toNonIndexed() : g;
  if (geo !== g) g.dispose();
  geo.deleteAttribute('uv');
  const c = new THREE.Color(hex);
  const n = geo.getAttribute('position').count;
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}

/** Trục khối trụ / nón (trục y) quay theo hướng (0, dy, dz) rồi đặt giữa ở `at`. */
function along(g: THREE.BufferGeometry, dy: number, dz: number, at: [number, number, number]): THREE.BufferGeometry {
  return g.rotateX(Math.atan2(dz, dy)).translate(...at);
}

function bodyGeometry(s: CraneSpec): THREE.BufferGeometry {
  const parts: Part[] = [
    [new THREE.SphereGeometry(0.5, 10, 7).scale(0.74, 0.66, 1.55).translate(0, 1.38, 0), s.body],
    // "đuôi" đen (lông cánh thứ cấp phủ đuôi) chĩa ra sau
    [along(new THREE.ConeGeometry(0.3, 0.85, 6), 0, -1, [0, 1.44, -1.05]), s.tip],
    // cổ đen vươn chếch lên trước
    [along(new THREE.CylinderGeometry(0.065, 0.12, 1.18, 6), 0.62, 0.95, [0, 1.84, 1.1]), s.tip],
    [new THREE.SphereGeometry(0.15, 7, 5).scale(0.9, 0.9, 1.15).translate(0, 2.2, 1.66), s.body],
    [new THREE.SphereGeometry(0.075, 5, 4).translate(0, 2.32, 1.64), s.crest],
    [along(new THREE.ConeGeometry(0.045, 0.5, 5), -0.15, 1, [0, 2.15, 1.98]), s.beak],
    // chân duỗi chếch ra sau (bay) — đứng trên đất vẫn chạm
    ...[-1, 1].map((x): Part => [along(new THREE.CylinderGeometry(0.035, 0.028, 1.25, 4), 1.05, 0.6, [x * 0.12, 0.58, -0.62]), s.leg]),
  ];
  const geos = parts.map(([g, c]) => painted(g, c));
  const g = mergeGeometries(geos);
  for (const p of geos) p.dispose();
  g.computeVertexNormals();
  return g;
}

/** Một cánh dọc trục x (`side` ±1), gốc ở vai: 4 trạm dọc sải × 3 hàng dọc dây cánh; mép sau + đầu cánh đen. */
function wingGeometry(side: number, s: CraneSpec): THREE.BufferGeometry {
  const span = [0, 0.95, 1.9, 2.55];
  const lead = [0.34, 0.42, 0.3, 0.02];
  const trail = [-0.55, -0.82, -0.62, -0.28];
  const lift = [0, 0.06, 0.1, 0.12]; // nhị diện nhẹ
  const white = new THREE.Color(s.body);
  const black = new THREE.Color(s.tip);
  const pos: number[] = [];
  const col: number[] = [];
  const at = (i: number, row: number): [number, number, number, THREE.Color] => {
    const z = row === 0 ? lead[i] : row === 1 ? lead[i] + (trail[i] - lead[i]) * 0.62 : trail[i];
    const dark = row === 2 || (i === 3 && row > 0);
    return [side * span[i], lift[i], z, dark ? black : white];
  };
  for (let i = 0; i < 3; i++)
    for (let r = 0; r < 2; r++) {
      const q = [at(i, r), at(i + 1, r), at(i + 1, r + 1), at(i, r + 1)];
      for (const k of [0, 1, 2, 0, 2, 3]) {
        const [x, y, z, c] = q[k];
        pos.push(x, y, z);
        col.push(c.r, c.g, c.b);
      }
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

export class Crane {
  readonly root = new THREE.Group();
  /** neo chỗ ngồi trên lưng (con của `root`) */
  readonly seat = new THREE.Object3D();
  private readonly wings: { pivot: THREE.Object3D; side: number }[] = [];
  private readonly material: THREE.MeshLambertMaterial;
  private readonly geos: THREE.BufferGeometry[] = [];
  private t = 0;
  /** 0 = dang cánh bay · 1 = xếp dọc thân (đứng) */
  fold = 0;

  constructor(spec: CraneSpec) {
    // tự sáng nhẹ: mặt dưới cánh (pháp tuyến lật, ánh đất xanh của hemi) không bị xỉn màu rêu
    this.material = lambert('#ffffff', { vertexColors: true, side: THREE.DoubleSide, emissive: '#2b2b2b' });
    const body = new THREE.Mesh(bodyGeometry(spec), this.material);
    this.geos.push(body.geometry);
    this.root.add(body);
    for (const side of [-1, 1]) {
      const pivot = new THREE.Object3D();
      pivot.position.set(side * SHOULDER[0], SHOULDER[1], SHOULDER[2]);
      const w = new THREE.Mesh(wingGeometry(side, spec), this.material);
      this.geos.push(w.geometry);
      pivot.add(w);
      this.root.add(pivot);
      this.wings.push({ pivot, side });
    }
    this.seat.position.set(...SEAT_AT);
    this.root.add(this.seat);
    this.root.scale.setScalar(spec.scale);
    this.root.name = 'hac';
    markDynamic(this.root); // không gộp vào khối tĩnh của cảnh
    this.root.traverse((o) => (o.frustumCulled = false));
  }

  /** Mỗi khung: vỗ cánh biên độ `amp` (rad), nhịp `speed`; `glide` 0…1 giữ cánh hơi nâng khi lượn. */
  update(dt: number, amp: number, speed = 5, glide = 0): void {
    this.t += dt;
    const beat = flapAngle(this.t, 0, amp, speed) + glide * 0.12;
    for (const { pivot, side } of this.wings) pivot.rotation.set(0, side * FOLD_YAW * this.fold, side * beat * (1 - this.fold));
  }

  /** Vị trí chỗ ngồi trong toạ độ cảnh. */
  seatWorld(out: THREE.Vector3): THREE.Vector3 {
    this.root.updateMatrixWorld(true);
    return this.seat.getWorldPosition(out);
  }

  dispose(): void {
    this.root.removeFromParent();
    for (const g of this.geos) g.dispose();
    this.material.dispose();
  }
}
