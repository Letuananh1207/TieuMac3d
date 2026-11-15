import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Khối tròn mềm cho cảnh "mềm" (kế hoạch docs/tasks/2026-11-14-canh-dep.md, NV8): cầu 48 mặt (`detail` 0; 1 = 80 mặt), đáy cắt
 * phẳng ở `flat` (−1…1), màu theo đỉnh từ `bottom` (đáy, tối) → `mid` → `top` (đỉnh, sáng) — tán cây / đám lá tùng có sáng
 * trên tối dưới như được trời chiếu, không cần đèn thêm. Pháp tuyến giữ hướng ra từ tâm (mẹo tán lá mềm: không lộ mặt cắt).
 */
export function softBlob(
  bottom: THREE.ColorRepresentation,
  mid: THREE.ColorRepresentation,
  top: THREE.ColorRepresentation,
  flat = -0.45,
  detail = 0,
): THREE.BufferGeometry {
  // detail 0: cầu 8 × 4 đoạn (48 mặt) — viền tròn hơn cầu 20 mặt, vẫn trong ngân sách tam giác; 1 = cầu 80 mặt
  const g = detail > 0 ? new THREE.IcosahedronGeometry(1, detail) : new THREE.SphereGeometry(1, 8, 4);
  const pos = g.getAttribute('position');
  const nrm = g.getAttribute('normal');
  const lo = new THREE.Color(bottom);
  const md = new THREE.Color(mid);
  const hi = new THREE.Color(top);
  const c = new THREE.Color();
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    // pháp tuyến = hướng từ tâm (trước khi ép đáy) — mặt đáy phẳng vẫn "tròn" dưới ánh sáng
    const n = new THREE.Vector3(pos.getX(i), y, pos.getZ(i)).normalize();
    nrm.setXYZ(i, n.x, n.y, n.z);
    if (y < flat) pos.setY(i, flat);
    const t = (Math.max(y, flat) - flat) / (1 - flat); // 0 đáy → 1 đỉnh
    if (t < 0.5) c.copy(lo).lerp(md, t * 2);
    else c.copy(md).lerp(hi, (t - 0.5) * 2);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return g;
}

/** Một múi của tán chùm: tâm + bán trục (hình mẫu, chưa nhân cỡ cây); `colors` riêng = bụi hai màu xen. */
export interface Lobe {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  colors?: readonly [THREE.ColorRepresentation, THREE.ColorRepresentation, THREE.ColorRepresentation];
}

export interface CrownOptions {
  lobes: readonly Lobe[];
  /** đáy (tối) → giữa → đỉnh (sáng) — thường là `trees.leaves` */
  colors: readonly [THREE.ColorRepresentation, THREE.ColorRepresentation, THREE.ColorRepresentation];
  /** số đoạn cầu mỗi múi [quanh, dọc]: [8, 4] = 48 tam giác; bậc xa dùng ít hơn */
  seg?: readonly [number, number];
  /** đáy mỗi múi cắt phẳng (−1…1 theo bán trục dọc) */
  flat?: number;
  /** phần pháp tuyến theo múi (còn lại theo cả tán) — hồ sơ thuc-vat-dep-nhe: 0,6 */
  normalBlend?: number;
  /** lõi tán tối đi bao nhiêu (0…1) */
  coreAo?: number;
  /** màu mép trên ấm + mức pha */
  rim?: THREE.ColorRepresentation;
  rimAmount?: number;
  /** phần màu theo độ cao của từng múi (còn lại theo cả tán): tùng tầng mây — mỗi tầng trên sáng dưới tối */
  lobeShade?: number;
  /** lệch đỉnh theo nhiễu (tỉ lệ bán kính) — múi không tròn hoàn hảo */
  noise?: number;
}

/** đáy tán: pháp tuyến không cúi quá −0,3 (bao hình nón) — mặt dưới không quay hẳn xuống đất */
export const CROWN_MIN_NY = -0.3;

/**
 * "Tán chùm nổi" (hồ sơ `docs/tham_khao/thuc-vat-dep-nhe.md`, V-58): nhiều múi cầu lệch nhiễu ghép một hình, pháp tuyến
 * pha trộn theo múi + theo cả tán (elip bao) để cả tán sáng tối liền một khối mà vẫn đọc ra nhịp múi; màu đỉnh theo độ
 * cao + lõi tối + mép trên sáng ấm. Đục, không texture; dùng với `softMaterial`. Không tính lại pháp tuyến hình học.
 */
export function softCrown(o: CrownOptions): THREE.BufferGeometry {
  const [ws, hs] = o.seg ?? [8, 4];
  const flat = o.flat ?? -0.45;
  const blend = o.normalBlend ?? 0.6;
  const coreAo = o.coreAo ?? 0.35;
  const rim = new THREE.Color(o.rim ?? '#b5c46e');
  const rimAmount = o.rimAmount ?? 0.2;
  const lobeShade = o.lobeShade ?? 0.4;
  const noise = o.noise ?? 0.08;
  // elip bao cả tán
  const lo = new THREE.Vector3(Infinity, Infinity, Infinity);
  const hi = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  for (const l of o.lobes) {
    lo.min(new THREE.Vector3(l.x - l.rx, l.y + flat * l.ry, l.z - l.rz));
    hi.max(new THREE.Vector3(l.x + l.rx, l.y + l.ry, l.z + l.rz));
  }
  const C = lo.clone().add(hi).multiplyScalar(0.5);
  const R = hi.clone().sub(lo).multiplyScalar(0.5);
  const pal = (c: CrownOptions['colors']): THREE.Color[] => c.map((x) => new THREE.Color(x));
  const base = pal(o.colors);
  const parts = o.lobes.map((l, li) => {
    const g = new THREE.SphereGeometry(1, ws, hs);
    g.deleteAttribute('uv');
    const [cLo, cMd, cHi] = l.colors ? pal(l.colors) : base;
    const pos = g.getAttribute('position');
    const nrm = g.getAttribute('normal');
    const col = new Float32Array(pos.count * 3);
    const d = new THREE.Vector3();
    const v = new THREE.Vector3();
    const nl = new THREE.Vector3();
    const nc = new THREE.Vector3();
    const q = new THREE.Vector3();
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      d.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();
      // nhiễu tần số thấp theo hướng (đỉnh trùng chỗ nối cầu ra cùng số → không hở)
      const n = Math.sin(d.x * 2.9 + li * 1.7) * Math.cos(d.z * 2.3 - li) * 0.7 + Math.sin(d.y * 3.1 + li * 0.9) * 0.3;
      const k = 1 + n * noise;
      v.set(d.x * k * l.rx + l.x, Math.max(d.y, flat) * k * l.ry + l.y, d.z * k * l.rz + l.z);
      pos.setXYZ(i, v.x, v.y, v.z);
      nl.set(d.x / l.rx, d.y / l.ry, d.z / l.rz).normalize();
      q.copy(v).sub(C).divide(R);
      nc.copy(q).normalize();
      const nn = nl.multiplyScalar(blend).addScaledVector(nc, 1 - blend).normalize();
      if (nn.y < CROWN_MIN_NY) {
        let h = Math.hypot(nn.x, nn.z);
        if (h < 1e-4) [nn.x, nn.z, h] = [1, 0, 1];
        const s = Math.sqrt(1 - CROWN_MIN_NY * CROWN_MIN_NY) / h;
        nn.set(nn.x * s, CROWN_MIN_NY, nn.z * s);
      }
      nrm.setXYZ(i, nn.x, nn.y, nn.z);
      // màu: độ cao (pha múi / cả tán) → lõi tối → mép trên ấm
      const tLobe = (Math.max(d.y, flat) - flat) / (1 - flat);
      const tCrown = THREE.MathUtils.clamp((v.y - lo.y) / (hi.y - lo.y), 0, 1);
      const t = lobeShade * tLobe + (1 - lobeShade) * tCrown;
      if (t < 0.5) c.copy(cLo).lerp(cMd, t * 2);
      else c.copy(cMd).lerp(cHi, (t - 0.5) * 2);
      const r = Math.min(1, q.length());
      c.multiplyScalar(1 - coreAo * (1 - r));
      const rimK = rimAmount * THREE.MathUtils.clamp((nn.y - 0.5) / 0.5, 0, 1) * THREE.MathUtils.clamp((r - 0.7) / 0.3, 0, 1);
      c.lerp(rim, rimK);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  });
  const out = mergeGeometries(parts);
  for (const p of parts) p.dispose();
  return out;
}

/**
 * Thân / cành ống thon gộp chung hình với tán (cùng `softMaterial`): mỗi đoạn `points[i] → points[i+1]` một ống hở
 * `sides` cạnh, bán kính `radii[i] → radii[i+1]`; màu `color` tối dần về ngọn (`aoTop` — chỗ chui vào tán).
 */
export function softLimb(
  points: readonly THREE.Vector3[],
  radii: readonly number[],
  color: THREE.ColorRepresentation,
  aoTop = 0.35,
  sides = 6,
): THREE.BufferGeometry {
  const base = new THREE.Color(color);
  const parts: THREE.BufferGeometry[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const n = points.length - 1;
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dir = b.clone().sub(a);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(radii[i + 1], radii[i], len, sides, 1, true);
    g.deleteAttribute('uv');
    const pos = g.getAttribute('position');
    const col = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let j = 0; j < pos.count; j++) {
      // đầu dưới đoạn i (y < 0 trước khi xoay): tỉ lệ i / n, đầu trên (i + 1) / n
      const top = pos.getY(j) > 0 ? 1 : 0;
      c.copy(base).multiplyScalar(1 - aoTop * ((i + top) / n));
      col.set([c.r, c.g, c.b], j * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, dir.normalize()));
    g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    parts.push(g);
  }
  const out = mergeGeometries(parts);
  for (const p of parts) p.dispose();
  return out;
}

/** Số tam giác của một hình (có / không chỉ mục). */
export function triangleCount(g: THREE.BufferGeometry): number {
  return (g.index ? g.index.count : g.getAttribute('position').count) / 3;
}
