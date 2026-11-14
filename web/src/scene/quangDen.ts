import * as THREE from 'three';
import type { LookSpec } from './look';
import { markDynamic } from './merge';
import { makeCanvasTex } from './textures';

/**
 * Quầng sáng giả quanh đèn lồng / đèn đá (cảnh mềm — kế hoạch docs/tasks/2026-11-14-canh-dep.md, NV12): mỗi đèn một tấm
 * vuông luôn quay về camera (InstancedMesh, xoay lại trước mỗi lần vẽ), ảnh quầng tròn mờ dần vẽ bằng canvas, cộng màu,
 * không ghi độ sâu. 1 draw call cho mọi đèn, mỗi quầng chỉ phủ vài nghìn điểm ảnh — thay cho bloom (hậu kỳ toàn màn, đắt
 * trên GPU điện thoại). Không dùng `Points`: cỡ điểm tối đa của GPU điện thoại có máy chỉ 64 px.
 */
export function addLanternGlow(scene: THREE.Scene, spots: THREE.Vector3[], look: LookSpec): THREE.InstancedMesh | null {
  if (!spots.length || look.lanternGlow.size <= 0) return null;
  const tex = makeCanvasTex(64, 64, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.3, 'rgba(255,255,255,0.45)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  });
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    color: look.lanternGlow.color,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
  const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), mat, spots.length);
  const m = new THREE.Matrix4();
  const size = new THREE.Vector3().setScalar(look.lanternGlow.size * 2);
  const face = (q: THREE.Quaternion): void => {
    spots.forEach((p, i) => mesh.setMatrixAt(i, m.compose(p, q, size)));
    mesh.instanceMatrix.needsUpdate = true;
  };
  face(new THREE.Quaternion());
  mesh.computeBoundingSphere();
  mesh.onBeforeRender = (_r, _s, camera) => face(camera.quaternion);
  mesh.renderOrder = 2;
  markDynamic(mesh);
  scene.add(mesh);
  return mesh;
}
