/**
 * Hình + tiện ích dùng chung cho Cung Ngọc Đáy Biển (V-110): màu đỉnh theo độ cao, ống thon, cửa vòm, vật liệu InstancedMesh,
 * kiểm điểm trên lối đi. Dùng ở `cungVoSo.ts`, `dongBien.ts`, `vat_cung_ngoc.ts`.
 */
import * as THREE from 'three';
import { isSoft, type LookSpec } from './look';
import { softMaterial } from './materials';
import type { PathSpec } from './spec';

export type V3 = THREE.Vector3;
export const v3 = (x: number, y: number, z: number): V3 => new THREE.Vector3(x, y, z);


/** Màu đỉnh xám theo độ cao (bóng nướng cho InstancedMesh): chân `lo`, từ `top` m trở lên 1. */
export function shadeY<G extends THREE.BufferGeometry>(g: G, top: number, lo = 0.7): G {
  const pos = g.getAttribute('position');
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const k = lo + (1 - lo) * Math.min(1, Math.max(0, pos.getY(i) / top));
    col.set([k, k, k], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

/** Ống thon dọc đường gấp khúc `pts`: bán kính `r0` ở gốc → `r1` ở ngọn, `radial` cạnh, ngọn bịt nhọn. */
export function taperTube(pts: V3[], r0: number, r1: number, radial = 5): THREE.BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  const n = pts.length;
  let normal = v3(1, 0, 0);
  for (let i = 0; i < n; i++) {
    const t = pts[Math.min(n - 1, i + 1)].clone().sub(pts[Math.max(0, i - 1)]).normalize();
    // khung song song: bỏ thành phần dọc trục của pháp tuyến cũ
    normal = normal.sub(t.clone().multiplyScalar(normal.dot(t)));
    if (normal.lengthSq() < 1e-6) normal = Math.abs(t.y) < 0.9 ? v3(0, 1, 0).cross(t) : v3(1, 0, 0).cross(t);
    normal.normalize();
    const bin = t.clone().cross(normal);
    const r = r0 + (r1 - r0) * (i / (n - 1));
    for (let k = 0; k < radial; k++) {
      const a = (k / radial) * Math.PI * 2;
      const p = pts[i].clone().addScaledVector(normal, Math.cos(a) * r).addScaledVector(bin, Math.sin(a) * r);
      pos.push(p.x, p.y, p.z);
    }
  }
  for (let i = 0; i < n - 1; i++) {
    for (let k = 0; k < radial; k++) {
      const a = i * radial + k;
      const b = i * radial + ((k + 1) % radial);
      const c = a + radial;
      const d = b + radial;
      idx.push(a, b, c, b, d, c); // pháp tuyến hướng ra
    }
  }
  // chóp ngọn
  const tip = pts[n - 1].clone().add(pts[n - 1].clone().sub(pts[n - 2]).setLength(r1 * 1.5));
  const ti = pos.length / 3;
  pos.push(tip.x, tip.y, tip.z);
  for (let k = 0; k < radial; k++) idx.push((n - 1) * radial + k, (n - 1) * radial + ((k + 1) % radial), ti);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Bỏ mọi thuộc tính trừ vị trí + pháp tuyến, không chỉ mục — để `mergeGeometries` ghép được. */
export function plain(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const out = g.index ? g.toNonIndexed() : g;
  for (const name of Object.keys(out.attributes)) if (name !== 'position' && name !== 'normal') out.deleteAttribute(name);
  return out;
}

/** Cửa vòm (x giữa, đáy y 0): rộng `w`, cao `h` (đỉnh nửa tròn). Thứ tự điểm ngược kim (mặt nhìn +z). */
export function archPoints(w: number, h: number, seg = 8): THREE.Vector2[] {
  const r = w / 2;
  const pts = [new THREE.Vector2(r, 0), new THREE.Vector2(r, h - r)];
  for (let i = 1; i < seg; i++) {
    const a = (i / seg) * Math.PI;
    pts.push(new THREE.Vector2(Math.cos(a) * r, h - r + Math.sin(a) * r));
  }
  pts.push(new THREE.Vector2(-r, h - r), new THREE.Vector2(-r, 0));
  return pts;
}

/** Vật liệu InstancedMesh có màu đỉnh: cảnh mềm → vật liệu mềm chung (tuỳ gió), cảnh cũ → Lambert màu đỉnh. */
export function instMaterial(look: LookSpec, side: THREE.Side = THREE.FrontSide, wind?: { amp: number; tip: number }): THREE.MeshLambertMaterial {
  return isSoft(look) ? softMaterial(look.wrap, side, wind) : new THREE.MeshLambertMaterial({ vertexColors: true, side });
}

/** Điểm (x, z) nằm trên lối đi (cách trục lối < nửa rộng + `pad`). */
export function onPath(paths: PathSpec[], x: number, z: number, pad: number): boolean {
  return paths.some((p) => {
    const [ax, az] = p.from;
    const dx = p.to[0] - ax;
    const dz = p.to[1] - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    return Math.hypot(x - ax - dx * t, z - az - dz * t) < p.width / 2 + pad;
  });
}

