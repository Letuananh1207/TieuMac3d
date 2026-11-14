import * as THREE from 'three';
import { markDynamic } from './merge';
import type { SceneSpec } from './spec';

/**
 * Vòm trời cho cảnh "mềm" (kế hoạch docs/tasks/2026-11-14-canh-dep.md, NV7): cầu 24 × 12 đoạn, màu theo đỉnh (chân trời →
 * giữa → đỉnh như `sky`) + quầng sáng quanh hướng mặt trời (`look.sunGlow`). 1 draw call, vẽ trước mọi thứ, không ghi độ
 * sâu, không chịu sương; đi theo camera nên không bao giờ bị cắt bởi tầm nhìn xa. Thay ảnh nền gradient của cảnh cũ.
 */
export function addSkyDome(scene: THREE.Scene, spec: SceneSpec, radius: number): THREE.Mesh {
  const geo = new THREE.SphereGeometry(radius, 24, 12);
  const pos = geo.getAttribute('position');
  const top = new THREE.Color(spec.sky.top);
  const mid = new THREE.Color(spec.sky.middle);
  const hor = new THREE.Color(spec.sky.horizon);
  const glow = new THREE.Color(spec.look.sunGlow);
  const sun = new THREE.Vector3(...spec.light.sunPosition).normalize();
  const d = new THREE.Vector3();
  const c = new THREE.Color();
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    d.fromBufferAttribute(pos, i).normalize();
    skyColor(d, sun, top, mid, hor, glow, spec.look.glowSize, c);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false });
  const dome = new THREE.Mesh(geo, mat);
  dome.renderOrder = -10;
  dome.frustumCulled = false;
  dome.onBeforeRender = (_r, _s, camera) => {
    dome.position.copy(camera.position);
    dome.updateMatrixWorld();
  };
  markDynamic(dome);
  scene.add(dome);
  return dome;
}

const smooth = (a: number, b: number, v: number): number => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Màu trời theo hướng nhìn `d` (đơn vị): dưới chân trời giữ màu chân trời; lên 0,3 → màu giữa; lên đỉnh → màu đỉnh;
 * quầng nắng: gần hướng mặt trời trong khoảng `size` (0…1 theo cos góc) pha về `glow`, đậm nhất 85 %.
 */
export function skyColor(
  d: THREE.Vector3,
  sun: THREE.Vector3,
  top: THREE.Color,
  mid: THREE.Color,
  hor: THREE.Color,
  glow: THREE.Color,
  size: number,
  out: THREE.Color,
): THREE.Color {
  const e = d.y;
  if (e <= 0.3) out.copy(hor).lerp(mid, smooth(0, 0.3, e));
  else out.copy(mid).lerp(top, smooth(0.3, 1, e));
  if (size > 0) {
    const s = d.dot(sun);
    out.lerp(glow, 0.85 * smooth(1 - size, 1, s));
  }
  return out;
}
