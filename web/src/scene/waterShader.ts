import * as THREE from 'three';
import type { LookSpec } from './look';
import { WIND_TIME } from './materials';

/**
 * Nước stylized cho cảnh "mềm" (kế hoạch docs/tasks/2026-11-14-canh-dep.md, NV4): nông (sát bờ) → sâu (giữa) theo
 * khoảng cách tới bờ tính sẵn vào thuộc tính đỉnh `shore` (mét, tỉ lệ 0…1); fresnel (nhìn xiên → pha màu trời); vệt sáng
 * gợn = sóng sin theo thời gian ngưỡng hoá; viền bọt quanh bờ (cùng shader, không thêm hình, không trong suốt). Không
 * depth texture (không thêm lượt vẽ). Chịu sương như vật khác. Đồng hồ dùng chung với gió (`WIND_TIME`).
 */
const VERT = /* glsl */ `
attribute vec2 shore;
varying vec2 vShore;
varying vec3 vWorld;
#include <fog_pars_vertex>
void main() {
  vShore = shore;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vec4 mvPosition = viewMatrix * world;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const FRAG = /* glsl */ `
uniform vec3 uShallow;
uniform vec3 uDeep;
uniform vec3 uFoam;
uniform vec3 uSky;
uniform float uRipple;
uniform float uTime;
varying vec2 vShore;
varying vec3 vWorld;
#include <common>
#include <fog_pars_fragment>
void main() {
  vec3 col = mix(uShallow, uDeep, smoothstep(0.0, 0.85, vShore.y));
  vec3 V = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - clamp(V.y, 0.0, 1.0), 3.0);
  col = mix(col, uSky, fres * 0.55);
  float r = sin(vWorld.x * 1.3 + uTime * 1.1) * sin(vWorld.z * 1.7 - uTime * 0.9) + 0.5 * sin((vWorld.x + vWorld.z) * 2.3 + uTime * 1.7);
  col = mix(col, vec3(1.0), smoothstep(1.0, 1.25, r) * uRipple * 0.6);
  float edge = 0.32 + 0.06 * sin(uTime * 1.5 + vWorld.x * 2.0 + vWorld.z * 1.3);
  col = mix(col, uFoam, (1.0 - smoothstep(edge * 0.55, edge, vShore.x)) * 0.9);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

/** `ripple`: false = không gợn (mức Thấp — R-HIEU-1). */
export function softWaterMaterial(look: LookSpec, sky: THREE.ColorRepresentation, ripple: boolean): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    fog: true,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uShallow: { value: new THREE.Color(look.water.shallow) },
        uDeep: { value: new THREE.Color(look.water.deep) },
        uFoam: { value: new THREE.Color(look.water.foam) },
        uSky: { value: new THREE.Color(sky) },
        uRipple: { value: ripple ? look.water.ripple : 0 },
      },
    ]),
  });
}

/** Gắn đồng hồ chung (UniformsUtils.merge chép giá trị nên gắn sau). */
export function linkWaterClock(m: THREE.ShaderMaterial): THREE.ShaderMaterial {
  m.uniforms.uTime = WIND_TIME;
  return m;
}

/**
 * Thuộc tính `shore` (mét tới bờ, tỉ lệ 0 bờ → 1 xa bờ nhất) cho mặt nước phẳng trong mặt xy (trước khi nằm ngang).
 * `edge(x, y)` = khoảng cách tới bờ (m) của một điểm; `max` = khoảng cách lớn nhất (tâm).
 */
export function setShore(geo: THREE.BufferGeometry, edge: (x: number, y: number) => number, max: number): void {
  const pos = geo.getAttribute('position');
  const out = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const e = Math.max(0, edge(pos.getX(i), pos.getY(i)));
    out[i * 2] = e;
    out[i * 2 + 1] = max > 0 ? Math.min(1, e / max) : 1;
  }
  geo.setAttribute('shore', new THREE.BufferAttribute(out, 2));
}

/** Khoảng cách tới bờ của hồ chữ nhật w × d (tâm gốc), hồ tròn bán kính r. */
export const rectEdge = (w: number, d: number) => (x: number, y: number): number => Math.min(w / 2 - Math.abs(x), d / 2 - Math.abs(y));
export const circleEdge = (r: number) => (x: number, y: number): number => r - Math.hypot(x, y);
