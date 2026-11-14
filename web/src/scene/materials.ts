import * as THREE from 'three';

/** Vật liệu Lambert: rẻ nhất trong các vật liệu có ánh sáng, hợp với low-poly trên điện thoại. */
export function lambert(
  color: THREE.ColorRepresentation,
  extra?: THREE.MeshLambertMaterialParameters,
): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color, ...extra });
}

/** Dòng tính độ sáng nắng của Lambert (three 0.170, `lights_lambert_pars_fragment`) — thay bằng wrap lighting. */
const DOT_NL = 'float dotNL = saturate( dot( geometryNormal, directLight.direction ) );';

/** Đoạn shader Lambert đã thay dòng sáng nắng bằng wrap lighting (`wrap` 0 = Lambert thường). */
export function wrapLambertChunk(wrap: number): string {
  const chunk = THREE.ShaderChunk.lights_lambert_pars_fragment;
  if (!chunk.includes(DOT_NL)) throw new Error('three đổi shader Lambert — sửa DOT_NL trong materials.ts');
  const w = wrap.toFixed(3);
  const d = (1 + wrap).toFixed(3);
  return chunk.replace(DOT_NL, `float dotNL = saturate( ( dot( geometryNormal, directLight.direction ) + ${w} ) / ${d} );`);
}

/**
 * Vật liệu cảnh "mềm" dùng chung (kế hoạch docs/tasks/2026-11-14-canh-dep.md, NV3): Lambert + màu theo đỉnh (màu khối đã
 * nướng bóng — `bake.ts`) + wrap lighting (mặt khuất nắng không đen). Mọi khối tĩnh dùng chung nên gộp được một draw call
 * dù khác màu (`mergeSoft`). Chi phí điểm ảnh như Lambert (thêm một phép cộng, một phép chia).
 */
export function softMaterial(wrap: number, side: THREE.Side = THREE.FrontSide): THREE.MeshLambertMaterial {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, side });
  const chunk = wrapLambertChunk(wrap);
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <lights_lambert_pars_fragment>', chunk);
  };
  // chương trình shader dùng lại theo `wrap` — hai giá trị wrap khác nhau không dùng nhầm bản đã biên dịch
  m.customProgramCacheKey = () => `soft-${wrap.toFixed(3)}`;
  m.userData.soft = true;
  return m;
}
