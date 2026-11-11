import * as THREE from 'three';
import type { Style } from './kien_truc/chi_tiet';
import { lambert } from './materials';
import type { SceneSpec } from './spec';
import { stairEnds } from './terrainHeight';

/** Mỗi bậc cao khoảng bao nhiêu (m) — hồ sơ địa hình: 0,18 m, đều nhau trong một đoạn. */
const STEP_RISE = 0.18;

/**
 * Bậc đá (`terrain.stairs`): các khối bậc màu đá trắng (như nền nhà) đặt trên dốc đều mà địa hình đã ép, hai bên
 * có gờ đá chạy theo dốc. Chỉ để nhìn — nhân vật đi trên mặt dốc của địa hình (R-VA-2). Khối tĩnh, gộp sau.
 */
export function addStairs(scene: THREE.Scene, t: SceneSpec['terrain'], style: Style): void {
  for (const s of t.stairs) {
    const [ya, yb] = stairEnds(t, s);
    const dx = s.to[0] - s.from[0];
    const dz = s.to[1] - s.from[1];
    const len = Math.hypot(dx, dz);
    if (len < 0.5) continue;
    const n = Math.max(1, Math.round(Math.abs(yb - ya) / STEP_RISE));
    const run = len / n;
    const g = new THREE.Group();
    g.position.set(s.from[0], 0, s.from[1]);
    g.rotation.y = Math.atan2(dx, dz); // +z của nhóm chạy từ `from` tới `to`
    const tread = lambert(style.base);
    for (let i = 0; i < n; i++) {
      // mặt bậc i = mép cao hơn của đoạn dốc i (đi lên hay đi xuống đều đúng)
      const top = Math.max(ya + ((yb - ya) * i) / n, ya + ((yb - ya) * (i + 1)) / n);
      const h = 0.6;
      const step = new THREE.Mesh(new THREE.BoxGeometry(s.width, h, run + 0.02), tread);
      step.position.set(0, top - h / 2, (i + 0.5) * run);
      g.add(step);
    }
    // gờ đá hai bên, nghiêng theo dốc
    const pitch = Math.atan2(yb - ya, len);
    for (const side of [-1, 1]) {
      const kerb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, Math.hypot(len, yb - ya) + 0.3), lambert(style.stone));
      kerb.position.set(side * (s.width / 2 + 0.17), (ya + yb) / 2 + 0.12, len / 2);
      kerb.rotation.x = -pitch;
      g.add(kerb);
    }
    scene.add(g);
  }
}
