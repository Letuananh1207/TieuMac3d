/**
 * Lan can gỗ sơn son thấp quây sân (`fences` + `fenceStyle` trong đặc tả): trụ vuông có chóp vàng cách đều, ba thanh
 * ngang (tay vịn, giữa, chân). Thấp hơn tầm camera nên không che; mỗi đoạn một vật cản dày 0,3 m.
 * Ngân sách: đứng yên, `mergeStatic` gộp theo màu → 2 draw call cho mọi đoạn.
 */
import type * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { box } from './kien_truc/hinh';
import type { SceneSpec } from './spec';
import type { GroundY } from './terrainHeight';

const POST = 0.14;
const RAIL = 0.07;
const HIT = 0.3;

export function addFences(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec, groundY?: GroundY): void {
  const st = spec.fenceStyle;
  const ground = (x: number, z: number): number => (groundY ? groundY(x, z) : 0);
  for (const f of spec.fences) {
    const [ax, az] = f.from;
    const [bx, bz] = f.to;
    const len = Math.hypot(bx - ax, bz - az);
    const alongX = az === bz;
    const mx = (ax + bx) / 2;
    const mz = (az + bz) / 2;
    const y = ground(mx, mz);
    // trụ + chóp
    const n = Math.max(1, Math.round(len / st.postEvery));
    for (let i = 0; i <= n; i++) {
      const x = ax + ((bx - ax) * i) / n;
      const z = az + ((bz - az) * i) / n;
      scene.add(box(POST, st.height, POST, st.color, x, y + st.height / 2, z));
      scene.add(box(POST + 0.08, 0.1, POST + 0.08, st.cap, x, y + st.height + 0.05, z));
    }
    // thanh ngang
    for (const h of [st.height - 0.06, st.height * 0.55, 0.12]) {
      const w = h === st.height - 0.06 ? 0.1 : RAIL;
      scene.add(alongX ? box(len, w, w, st.color, mx, y + h, mz) : box(w, w, len, st.color, mx, y + h, mz));
    }
    colliders.add(mx, mz, alongX ? len : HIT, alongX ? HIT : len);
  }
}
