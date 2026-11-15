/**
 * Sương sớm trên bậc chè (V-46): mỗi bậc một tấm sương nằm ngang mỏng (mép mờ bằng alpha màu đỉnh — không texture), trôi
 * chậm qua lại; mọi tấm một `InstancedMesh` (1 draw call), trong suốt, không ghi chiều sâu, không hậu kỳ. Độ đặc theo giờ
 * (`mistLevel` — mặc định 5–9 giờ sáng, giờ VN) — ngoài giờ ẩn hẳn (không tốn gì). Mức đồ hoạ Thấp không dựng.
 */
import * as THREE from 'three';
import { markDynamic } from './merge';

/** Một tấm: hình chữ nhật trên bậc (tâm, rộng x, sâu z), độ cao chân bậc. */
export interface MistSheet {
  x: number;
  z: number;
  w: number;
  d: number;
  y: number;
}

export interface Mist {
  mesh: THREE.InstancedMesh;
  update(dt: number): void;
  /** độ đặc 0…1 (nhân `opacity` của đặc tả); 0 = ẩn */
  setLevel(k: number): void;
}

/** cao tấm sương trên mặt bậc (m) — là là trên mặt hái (thấp hơn thì cắt ngang luống thành vệt trắng cứng) */
const LIFT = 1.05;
/** số ô lưới mỗi chiều: viền alpha 0, trong alpha 1 → mép mềm */
const COLS = 4;
const ROWS = 2;

/** Tấm 1 × 1 nằm ngang, màu đỉnh RGBA: viền trong suốt, giữa đặc (trắng — màu ở vật liệu). */
export function mistGeometry(): THREE.BufferGeometry {
  const g = new THREE.PlaneGeometry(1, 1, COLS, ROWS).rotateX(-Math.PI / 2);
  g.deleteAttribute('uv');
  const n = g.getAttribute('position').count;
  const rgba = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const ix = i % (COLS + 1);
    const iz = Math.floor(i / (COLS + 1));
    const edge = ix === 0 || ix === COLS || iz === 0 || iz === ROWS;
    rgba.set([1, 1, 1, edge ? 0 : 1], i * 4);
  }
  g.setAttribute('color', new THREE.BufferAttribute(rgba, 4));
  return g;
}

export function addMist(scene: THREE.Scene, sheets: MistSheet[], color: string, opacity: number): Mist | null {
  if (!sheets.length || opacity <= 0) return null;
  const mat = new THREE.MeshBasicMaterial({ color, vertexColors: true, transparent: true, depthWrite: false, opacity: 0 });
  const mesh = new THREE.InstancedMesh(mistGeometry(), mat, sheets.length);
  mesh.renderOrder = 2; // sau vật đặc
  mesh.visible = false;
  mesh.frustumCulled = false;
  markDynamic(mesh);
  scene.add(mesh);
  const o = new THREE.Object3D();
  let t = 0;
  const place = (): void => {
    sheets.forEach((s, i) => {
      // trôi chậm dọc bậc ± 1,2 m, phồng / co nhẹ
      o.position.set(s.x + Math.sin(t * 0.05 + i * 2.1) * 1.2, s.y + LIFT + Math.sin(t * 0.13 + i) * 0.12, s.z + Math.sin(t * 0.04 + i) * 0.3);
      o.scale.set(s.w * (1 + 0.04 * Math.sin(t * 0.09 + i)), 1, s.d);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  place();
  return {
    mesh,
    update(dt) {
      t += dt;
      if (mesh.visible) place();
    },
    setLevel(k) {
      mat.opacity = opacity * Math.min(1, Math.max(0, k));
      mesh.visible = mat.opacity > 0.005;
    },
  };
}
