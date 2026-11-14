import * as THREE from 'three';

/**
 * Bóng nướng sẵn vào màu đỉnh (baked AO) cho cảnh "hoạt hình mềm" (kế hoạch docs/tasks/2026-11-14-canh-dep.md, NV3;
 * hồ sơ docs/tham_khao/canh-hoat-hinh-mem.md kỹ thuật 3). Tính một lần lúc dựng trên CPU, GPU không tốn gì thêm:
 * chân tường / cột sẫm dần xuống đất, mặt hướng xuống (gầm mái, gầm hiên) sẫm nhất. Bóng không đen mà pha về màu
 * `aoTint` (tím nâu ấm). Thuần toán + BufferGeometry — test được không cần WebGL.
 */
export interface SoftLook {
  /** wrap lighting 0…1: 0 = Lambert thường, 0,5 = mặt khuất nắng vẫn nhận nửa sáng (không đen) */
  wrap: number;
  /** độ sẫm tối đa của bóng nướng 0…1 (gầm mái) */
  ao: number;
  /** chiều cao (m) vùng chân tường sẫm dần lên */
  foot: number;
  /** chân tường sẫm bằng bao nhiêu phần `ao` (gầm mái = 1) */
  footShare: number;
  /** màu bóng: chỗ tối nhất pha về màu này thay vì đen */
  aoTint: THREE.ColorRepresentation;
}

/**
 * Số mặc định cho lúc thử (chưa nối đặc tả). NV5 chuyển thành trường `look` của `SceneSpec` (quy tắc 8); khi đó cảnh chỉ
 * nướng bóng nếu đặc tả bật `look.style: "mem"` — mặc định tắt, cảnh cũ không đổi.
 */
export const SOFT_LOOK_TRY: SoftLook = { wrap: 0.5, ao: 0.4, foot: 0.8, footShare: 0.55, aoTint: '#6b5a70' };

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const smooth = (t: number): number => t * t * (3 - 2 * t);

/**
 * Hệ số sáng của một đỉnh: 1 = không bóng, `1 − ao` = tối nhất.
 * @param h độ cao đỉnh trên mặt đất (m); dưới đất coi như 0
 * @param ny thành phần y của pháp tuyến (−1 = mặt hướng thẳng xuống)
 */
export function aoFactor(h: number, ny: number, look: SoftLook): number {
  const foot = look.foot > 0 ? 1 - smooth(clamp01(h / look.foot)) : 0;
  const under = clamp01(-ny);
  return 1 - look.ao * Math.max(foot * look.footShare, under);
}

/** Màu đỉnh = màu gốc × (pha từ `tint` tới trắng theo hệ số `f`): f = 1 giữ nguyên màu gốc. */
export function shadeColor(base: THREE.Color, f: number, tint: THREE.Color, out = new THREE.Color()): THREE.Color {
  const k = clamp01(f);
  return out.setRGB(
    base.r * (tint.r + (1 - tint.r) * k),
    base.g * (tint.g + (1 - tint.g) * k),
    base.b * (tint.b + (1 - tint.b) * k),
  );
}

/**
 * Ghi thuộc tính `color` cho hình (toạ độ cảnh, pháp tuyến đã tính): mỗi đỉnh = `base` nướng bóng theo độ cao trên mặt
 * đất `groundY(x, z)` và hướng pháp tuyến. Hình không có pháp tuyến → tự tính.
 */
export function bakeSoftColors(
  geo: THREE.BufferGeometry,
  base: THREE.Color,
  look: SoftLook,
  groundY: (x: number, z: number) => number = () => 0,
): void {
  if (!geo.getAttribute('normal')) geo.computeVertexNormals();
  const pos = geo.getAttribute('position');
  const nrm = geo.getAttribute('normal');
  const tint = new THREE.Color(look.aoTint);
  const c = new THREE.Color();
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = Math.max(0, pos.getY(i) - groundY(x, z));
    shadeColor(base, aoFactor(h, nrm.getY(i), look), tint, c);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}
