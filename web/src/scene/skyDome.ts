import * as THREE from 'three';
import { isColorManaged } from './look';
import { markDynamic } from './merge';
import type { SceneSpec } from './spec';

/**
 * Vòm trời cho cảnh "mềm" (kế hoạch docs/tasks/2026-11-14-canh-dep.md, NV7): cầu 24 × 12 đoạn, màu theo đỉnh (chân trời →
 * giữa → đỉnh như `sky`) + quầng sáng quanh hướng mặt trời (`look.sunGlow`). 1 draw call, vẽ trước mọi thứ, không ghi độ
 * sâu, không chịu sương; đi theo camera nên không bao giờ bị cắt bởi tầm nhìn xa. Thay ảnh nền gradient của cảnh cũ.
 */
export interface SkyDome {
  mesh: THREE.Mesh;
  /** tô lại màu đỉnh (ngày đêm — `apGio.ts`): 3 màu trời; `glowFade` 0…1 = quầng nắng mờ đi (đêm không còn quầng) */
  recolor(top: string, middle: string, horizon: string, glowFade?: number): void;
}

export function addSkyDome(scene: THREE.Scene, spec: SceneSpec, radius: number): SkyDome {
  const geo = new THREE.SphereGeometry(radius, 24, 12);
  const pos = geo.getAttribute('position');
  const top = new THREE.Color();
  const mid = new THREE.Color();
  const hor = new THREE.Color();
  const glow = new THREE.Color(spec.look.sunGlow);
  const sun = new THREE.Vector3(...spec.light.sunPosition).normalize();
  const d = new THREE.Vector3();
  const c = new THREE.Color();
  const colors = new Float32Array(pos.count * 3);
  const attr = new THREE.BufferAttribute(colors, 3);
  // đường màu cũ (`look.colorPipeline: "cu"`): Color giữ số sRGB thô, đầu ra lại mã hoá sRGB → đổi về tuyến tính để trời
  // đúng mã hex như ảnh nền gradient của cảnh cũ (không nhạt đi)
  const raw = !isColorManaged(spec.look);
  const recolor = (t: string, m: string, h: string, glowFade = 0): void => {
    top.set(t);
    mid.set(m);
    hor.set(h);
    const size = spec.look.glowSize * (1 - glowFade);
    for (let i = 0; i < pos.count; i++) {
      d.fromBufferAttribute(pos, i).normalize();
      skyColor(d, sun, top, mid, hor, glow, size, c, spec.look.skyBands);
      if (raw) c.convertSRGBToLinear();
      colors.set([c.r, c.g, c.b], i * 3);
    }
    attr.needsUpdate = true;
  };
  recolor(spec.sky.top, spec.sky.middle, spec.sky.horizon);
  geo.setAttribute('color', attr);
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false });
  const dome = new THREE.Mesh(geo, mat);
  dome.renderOrder = -10;
  dome.frustumCulled = false;
  dome.onBeforeRender = (_r, _s, camera) => {
    dome.position.copy(camera.position);
    dome.updateMatrixWorld();
  };
  mat.userData.ngayDem = 'bo'; // màu do `recolor`, không nhân màu đêm
  markDynamic(dome);
  scene.add(dome);
  return { mesh: dome, recolor };
}

const smooth = (a: number, b: number, v: number): number => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Màu trời theo hướng nhìn `d` (đơn vị): dưới chân trời giữ màu chân trời; lên `bands.mid` → màu giữa; lên `bands.top` →
 * màu đỉnh;
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
  bands: { mid: number; top: number } = { mid: 0.3, top: 1 },
): THREE.Color {
  const e = d.y;
  if (e <= bands.mid) out.copy(hor).lerp(mid, smooth(0, bands.mid, e));
  else out.copy(mid).lerp(top, smooth(bands.mid, bands.top, e));
  if (size > 0) {
    const s = d.dot(sun);
    out.lerp(glow, 0.85 * smooth(1 - size, 1, s));
  }
  return out;
}
