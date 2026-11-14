import * as THREE from 'three';

/** Vật liệu Lambert: rẻ nhất trong các vật liệu có ánh sáng, hợp với low-poly trên điện thoại. */
export function lambert(
  color: THREE.ColorRepresentation,
  extra?: THREE.MeshLambertMaterialParameters,
): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color, ...extra });
}

/**
 * Độ phát sáng của đèn (đèn lồng, ô sáng đèn đá, đèn giấy…) trong cảnh đang dựng — `light.lampGlow` của đặc tả, `world.ts`
 * đặt trước khi dựng (`setLampGlow`). 0 = đèn chỉ là vật (giấy / đá chịu sáng như mọi khối, không quầng) · 1 = phát sáng
 * hết cỡ. Ngày đêm (kế hoạch docs/tasks/2026-11-14-ngay-dem.md) sẽ đổi số này theo giờ.
 */
let lampGlow = 0;

export function setLampGlow(v: number): void {
  lampGlow = Math.min(1, Math.max(0, v));
}

export const currentLampGlow = (): number => lampGlow;

/**
 * Đèn đổi theo giờ (`dayNight.enabled` — kế hoạch docs/tasks/2026-11-14-ngay-dem.md, NV6): đèn / cửa sổ dựng với
 * `emissive` sẵn, `emissiveIntensity` 0 và nhãn `userData.lamp` (`den` · `cua`) để `apGio.ts` đổi độ sáng lúc chạy; các bước
 * gộp màu đỉnh bỏ qua chúng (giữ được phần sáng). `world.ts` đặt trước khi dựng.
 */
let lampDynamic = false;
let windowGlowColor = '#ffc870';

export function setLampMode(dynamic: boolean, windowColor = '#ffc870'): void {
  lampDynamic = dynamic;
  windowGlowColor = windowColor;
}

export const isLampDynamic = (): boolean => lampDynamic;

/**
 * Nhãn ngày đêm của vật liệu không chịu sáng (`apGio.ts`): `xa` = núi xa / mây / biển mây (tối theo trời) · `bo` = giữ
 * nguyên màu (vòm trời, vòng trận, ô ngồi, bàn cờ, lửa — R-NGAY-4: vẫn rõ ban đêm). Không nhãn = nhân màu "gần" nhẹ.
 */
export function dayNightTag<M extends THREE.Material>(m: M, tag: 'xa' | 'bo'): M {
  m.userData.ngayDem = tag;
  return m;
}

/**
 * Vật liệu phần "lòng đèn": tắt (`lampGlow` 0) = Lambert thường, gộp chung với khối cùng màu; bật = Lambert tự phát
 * sáng màu của chính nó (`emissive`) — không thêm đèn thật, không thêm draw call.
 */
export function lampMaterial(color: THREE.ColorRepresentation): THREE.MeshLambertMaterial {
  if (lampDynamic) {
    const m = lambert(color, { emissive: color, emissiveIntensity: 0 });
    m.userData.lamp = 'den';
    return m;
  }
  if (lampGlow <= 0) return lambert(color);
  return lambert(color, { emissive: color, emissiveIntensity: lampGlow });
}

/**
 * Giấy song cửa sổ nhà: ban ngày như mọi khối; có ngày đêm thì ban đêm sáng ấm (`dayNight.dem.windowColor`) — R-NGAY-3.
 */
export function windowMaterial(color: THREE.ColorRepresentation): THREE.MeshLambertMaterial {
  if (!lampDynamic) return lambert(color);
  const m = lambert(color, { emissive: windowGlowColor, emissiveIntensity: 0 });
  m.userData.lamp = 'cua';
  return m;
}

/** Vật liệu có tự phát sáng (đèn đang bật, hoặc đèn / cửa sổ đổi theo giờ) — các bước gộp màu đỉnh bỏ qua để không mất phần sáng. */
export const isGlowing = (m: THREE.MeshLambertMaterial): boolean => !!m.userData.lamp || (m.emissiveIntensity > 0 && m.emissive.getHex() !== 0);

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
export function softMaterial(wrap: number, side: THREE.Side = THREE.FrontSide, wind?: Wind): THREE.MeshLambertMaterial {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, side });
  const chunk = wrapLambertChunk(wrap);
  const sway = wind && wind.amp > 0 ? windChunk(wind) : null;
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <lights_lambert_pars_fragment>', chunk);
    if (sway) {
      shader.uniforms.uWindTime = WIND_TIME;
      shader.vertexShader = `uniform float uWindTime;
${shader.vertexShader.replace('#include <begin_vertex>', sway)}`;
    }
  };
  // chương trình shader dùng lại theo `wrap` + gió — cấu hình khác nhau không dùng nhầm bản đã biên dịch
  m.customProgramCacheKey = () => `soft-${wrap.toFixed(3)}-${sway ? `${wind?.amp.toFixed(3)}-${wind?.tip ?? 0}` : 'yen'}`;
  m.userData.soft = true;
  return m;
}

/**
 * Gió (cảnh mềm — cỏ, hoa, tán cây lay nhẹ): lệch đỉnh trong vertex shader bằng 2 sóng sin, pha theo vị trí instance (mỗi
 * cây / búi lay lệch nhau). `amp` biên độ (m); `tip` > 0 = chỉ ngọn lay, tỉ lệ theo độ cao đỉnh / `tip` (gốc đứng yên);
 * không có `tip` = cả khối lay đều (tán cây). Chi phí: ~10 phép tính mỗi đỉnh, không thêm draw call.
 */
export interface Wind {
  amp: number;
  tip?: number;
}

/** Đồng hồ gió dùng chung mọi vật liệu (giây) — `tickWind` mỗi khung. */
export const WIND_TIME = { value: 0 };

export function tickWind(dt: number): void {
  WIND_TIME.value = (WIND_TIME.value + dt) % 10000;
}

export function windChunk(w: Wind): string {
  const amp = w.amp.toFixed(4);
  const k = w.tip ? `clamp(position.y / ${w.tip.toFixed(3)}, 0.0, 1.5)` : '1.0';
  return `#include <begin_vertex>
#ifdef USE_INSTANCING
  vec3 wOrigin = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
#else
  vec3 wOrigin = vec3(modelMatrix[3][0], modelMatrix[3][1], modelMatrix[3][2]);
#endif
  float wPh = uWindTime + wOrigin.x * 0.21 + wOrigin.z * 0.17;
  float wK = ${amp} * ${k};
  transformed.x += (sin(wPh * 1.7) + 0.4 * sin(wPh * 3.1)) * wK;
  transformed.z += cos(wPh * 1.3) * wK * 0.6;`;
}
