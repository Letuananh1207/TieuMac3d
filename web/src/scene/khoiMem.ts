import * as THREE from 'three';

/**
 * Khối tròn mềm cho cảnh "mềm" (kế hoạch docs/tasks/2026-11-14-canh-dep.md, NV8): cầu 48 mặt (`detail` 0; 1 = 80 mặt), đáy cắt
 * phẳng ở `flat` (−1…1), màu theo đỉnh từ `bottom` (đáy, tối) → `mid` → `top` (đỉnh, sáng) — tán cây / đám lá tùng có sáng
 * trên tối dưới như được trời chiếu, không cần đèn thêm. Pháp tuyến giữ hướng ra từ tâm (mẹo tán lá mềm: không lộ mặt cắt).
 */
export function softBlob(
  bottom: THREE.ColorRepresentation,
  mid: THREE.ColorRepresentation,
  top: THREE.ColorRepresentation,
  flat = -0.45,
  detail = 0,
): THREE.BufferGeometry {
  // detail 0: cầu 8 × 4 đoạn (48 mặt) — viền tròn hơn cầu 20 mặt, vẫn trong ngân sách tam giác; 1 = cầu 80 mặt
  const g = detail > 0 ? new THREE.IcosahedronGeometry(1, detail) : new THREE.SphereGeometry(1, 8, 4);
  const pos = g.getAttribute('position');
  const nrm = g.getAttribute('normal');
  const lo = new THREE.Color(bottom);
  const md = new THREE.Color(mid);
  const hi = new THREE.Color(top);
  const c = new THREE.Color();
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    // pháp tuyến = hướng từ tâm (trước khi ép đáy) — mặt đáy phẳng vẫn "tròn" dưới ánh sáng
    const n = new THREE.Vector3(pos.getX(i), y, pos.getZ(i)).normalize();
    nrm.setXYZ(i, n.x, n.y, n.z);
    if (y < flat) pos.setY(i, flat);
    const t = (Math.max(y, flat) - flat) / (1 - flat); // 0 đáy → 1 đỉnh
    if (t < 0.5) c.copy(lo).lerp(md, t * 2);
    else c.copy(md).lerp(hi, (t - 0.5) * 2);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return g;
}
