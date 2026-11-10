/** Hình khối dựng kiến trúc: chóp cụt (mái hiên, mái chái), lăng trụ tam giác (mái hai mái), khối hộp. */
import * as THREE from 'three';
import { lambert } from '../materials';

function fromTriangles(points: number[]): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  // uv giả (không dùng texture) để gộp chung được với khối có uv
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((points.length / 3) * 2).fill(0), 2));
  g.computeVertexNormals(); // không chỉ mục → mỗi mặt phẳng một pháp tuyến, đúng kiểu low-poly
  return g;
}

type V = [number, number, number];
const quad = (a: V, b: V, c: V, d: V): number[] => [...a, ...b, ...c, ...a, ...c, ...d];

/**
 * Chóp cụt đáy chữ nhật: đáy `bw` × `bd` ở y = 0, đỉnh `tw` × `td` ở y = `h` (đỉnh 0 = nhọn / thành nóc).
 * Mái chái (hip): `tw = bw − bd`, `td = 0` → nóc dài nằm ngang. Không có mặt đáy (nhìn từ dưới lên thấy qua).
 */
export function frustum(bw: number, bd: number, tw: number, td: number, h: number): THREE.BufferGeometry {
  const [x0, z0, x1, z1] = [bw / 2, bd / 2, Math.max(0, tw) / 2, Math.max(0, td) / 2];
  const b: V[] = [
    [-x0, 0, z0],
    [x0, 0, z0],
    [x0, 0, -z0],
    [-x0, 0, -z0],
  ];
  const t: V[] = [
    [-x1, h, z1],
    [x1, h, z1],
    [x1, h, -z1],
    [-x1, h, -z1],
  ];
  const pts: number[] = [];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    pts.push(...quad(b[i], b[j], t[j], t[i]));
  }
  if (x1 > 0 && z1 > 0) pts.push(...quad(t[0], t[1], t[2], t[3]));
  return fromTriangles(pts);
}

/** Lăng trụ tam giác (mái hai mái): dài `w` theo x, rộng `d` theo z, nóc cao `h`, hai đầu hồi tam giác. */
export function prism(w: number, d: number, h: number): THREE.BufferGeometry {
  const [x, z] = [w / 2, d / 2];
  const pts = [
    ...quad([-x, 0, z], [x, 0, z], [x, h, 0], [-x, h, 0]),
    ...quad([x, 0, -z], [-x, 0, -z], [-x, h, 0], [x, h, 0]),
    ...[-x, 0, -z, -x, 0, z, -x, h, 0],
    ...[x, 0, z, x, 0, -z, x, h, 0],
  ];
  return fromTriangles(pts);
}

/** Khối hộp đặt tâm (x, y, z) — y là tâm theo chiều cao. */
export function box(w: number, h: number, d: number, color: string, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lambert(color));
  m.position.set(x, y, z);
  return m;
}

/** Trụ tròn đứng (cột), chân ở `y0`. */
export function column(r: number, h: number, color: string, x: number, y0: number, z: number, sides = 8): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r, h, sides), lambert(color));
  m.position.set(x, y0 + h / 2, z);
  return m;
}
