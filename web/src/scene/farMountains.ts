import * as THREE from 'three';
import { seededRandom } from './random';
import type { MountainLayer, SceneSpec } from './spec';

/**
 * Núi xa nhiều lớp (thâm viễn 深遠): mỗi lớp một vòng răng cưa quanh tâm địa hình, màu đặc, KHÔNG chịu sương
 * (sương cảnh chỉ tới vài trăm mét — núi xa phải tự pha màu khí quyển: lớp càng xa càng nhạt, chân chìm vào mây).
 * Cả các lớp gộp một lưới, một draw call. Chỉ ngắm, không va chạm.
 */
export function addFarMountains(scene: THREE.Scene, spec: SceneSpec): void {
  const { layers, base } = spec.farMountains;
  if (!layers.length) return;
  const mist = new THREE.Color(spec.cloudSea.radius > 0 ? spec.cloudSea.color : spec.fog.color);
  const pos: number[] = [];
  const col: number[] = [];
  layers.forEach((layer, li) => ring(layer, base, spec.terrain.center, spec.terrain.noise.seed * 31 + li, mist, pos, col));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, side: THREE.DoubleSide });
  scene.add(new THREE.Mesh(geo, mat));
}

/** Góc về khoảng [0, 2π). */
const wrap = (a: number): number => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

function ring(
  layer: MountainLayer,
  base: number,
  [cx, cz]: [number, number],
  seed: number,
  mist: THREE.Color,
  pos: number[],
  col: number[],
): void {
  const rand = seededRandom(seed);
  const widen = layer.width ?? 1;
  const peaks = Array.from({ length: layer.peaks }, () => ({
    a: rand() * Math.PI * 2,
    w: (0.06 + rand() * 0.2) * widen, // nửa bề ngang đỉnh, radian
    h: 0.45 + rand() * 0.55,
  }));
  // đỉnh phụ: thấp hơn, hẹp hơn, nằm trên sườn hai bên đỉnh chính (bộ số ngẫu nhiên riêng → lớp không có đỉnh phụ
  // giữ đúng hình cũ)
  const spurs = Math.round(layer.spurs ?? 0);
  if (spurs > 0) {
    const srand = seededRandom(seed * 7 + 13);
    for (const p of [...peaks]) {
      for (let i = 1; i <= spurs; i++) {
        for (const side of [-1, 1]) {
          peaks.push({
            a: wrap(p.a + side * p.w * (0.3 + 0.28 * i + srand() * 0.12)),
            w: p.w * (0.32 + srand() * 0.12),
            h: p.h * (0.82 - 0.14 * i) * (0.85 + srand() * 0.15),
          });
        }
      }
    }
  }
  // đỉnh rộng thì sườn bớt lõm (đỉnh tròn hơn, đỡ nhọn như băng); width 1 = số mũ cũ 1,6
  const sharp = Math.max(0.9, 1.6 / Math.sqrt(widen));
  const segs = Math.max(240, layer.peaks * 24);
  const top = new THREE.Color(layer.color);
  const foot = top.clone().lerp(mist, 0.45); // chân núi nhạt dần vào mây / sương
  // gợn răng cưa theo góc: tổng vài sóng lệch pha → sống núi lởm chởm, không phải tam giác đều
  const phases = Array.from({ length: 4 }, () => rand() * Math.PI * 2);
  const jag = (a: number): number =>
    0.5 * Math.sin(a * 23 + phases[0]) + 0.3 * Math.sin(a * 51 + phases[1]) + 0.2 * Math.sin(a * 97 + phases[2]);
  const height = (a: number): number => {
    let h = 0.2 + 0.07 * Math.sin(a * 5 + phases[3]) + 0.05 * jag(a); // sống núi thấp nối các đỉnh
    for (const p of peaks) {
      let d = Math.abs(a - p.a);
      d = Math.min(d, Math.PI * 2 - d);
      if (d >= p.w) continue;
      const k = 1 - d / p.w;
      // sườn lõm, đỉnh nhọn + nấc đá theo gợn (đỉnh phụ hai bên)
      h = Math.max(h, p.h * Math.pow(k, sharp) * (0.88 + 0.12 * jag(a * 1.7)));
    }
    return base + (layer.height - base) * h;
  };
  const point = (k: number): [number, number, number, number] => {
    const a = (k / segs) * Math.PI * 2;
    const r = layer.radius * (1 + (rand() - 0.5) * 0.04);
    return [cx + Math.cos(a) * r, cz + Math.sin(a) * r, height(a), a];
  };
  let prev = point(0);
  const first = prev;
  for (let k = 1; k <= segs; k++) {
    const cur = k === segs ? first : point(k);
    const [x0, z0, h0] = prev;
    const [x1, z1, h1] = cur;
    // hai tam giác: chân (base) → đỉnh
    const quad = [
      [x0, base, z0, foot],
      [x1, base, z1, foot],
      [x0, h0, z0, top],
      [x1, base, z1, foot],
      [x1, h1, z1, top],
      [x0, h0, z0, top],
    ] as const;
    for (const [x, y, z, c] of quad) {
      pos.push(x, y, z);
      col.push(c.r, c.g, c.b);
    }
    prev = cur;
  }
}

/** Biển mây phẳng dưới mép cao nguyên (hướng "cao nguyên giữa biển mây"), không chịu sương. */
export function addCloudSea(scene: THREE.Scene, spec: SceneSpec): void {
  const { radius, y, color } = spec.cloudSea;
  if (radius <= 0) return;
  const sea = new THREE.Mesh(new THREE.CircleGeometry(radius, 64), new THREE.MeshBasicMaterial({ color, fog: false }));
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(spec.terrain.center[0], y, spec.terrain.center[1]);
  scene.add(sea);
}

/** Tầm nhìn camera cần để thấy hết núi xa / biển mây (far plane). */
export function viewDistance(spec: SceneSpec): number {
  const far = Math.max(0, ...spec.farMountains.layers.map((l) => l.radius * 1.15 + 60), spec.cloudSea.radius);
  return Math.max(200, far);
}
