/**
 * Dây đèn lồng đỏ (`lanternStrings` + `lanternStyle` trong đặc tả): cột gỗ ở hai đầu, dây võng hình parabol, đèn lồng
 * treo đều dọc dây. Chỉ để ngắm — va chạm chỉ ở cột.
 * Ngân sách: mọi khối đứng yên, `mergeStatic` gộp theo màu → ≈ 4 draw call cho mọi dây (cột · dây · thân đèn · chóp + tua);
 * mỗi đèn ≈ 48 tam giác (thân 6 cạnh).
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { box, column } from './kien_truc/hinh';
import { lambert } from './materials';
import type { SceneSpec, XZ } from './spec';
import type { GroundY } from './terrainHeight';

/** Số đoạn thẳng nối thành một dây võng. */
const ROPE_SEGMENTS = 14;
/** Cột: bán kính, vật cản (m). */
const POLE_R = 0.12;
const POLE_HIT = 0.3;
/** Đèn: bán kính, cao thân, khoảng treo dưới dây (m). */
const LANTERN_R = 0.2;
const LANTERN_H = 0.36;
const HANG = 0.14;
/** Bề ngang dải tua rua (m). */
const TASSEL_W = 0.14;

/** Điểm trên dây ở `t` ∈ [0, 1]: x, z nội suy thẳng, y võng parabol (thấp nhất `sag` ở giữa). */
function ropeAt(from: XZ, to: XZ, y0: number, y1: number, top: number, sag: number, t: number): THREE.Vector3 {
  const y = y0 + (y1 - y0) * t + top - sag * 4 * t * (1 - t);
  return new THREE.Vector3(from[0] + (to[0] - from[0]) * t, y, from[1] + (to[1] - from[1]) * t);
}

export function addLanternStrings(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec, groundY?: GroundY): void {
  const st = spec.lanternStyle;
  const ground = (x: number, z: number): number => (groundY ? groundY(x, z) : 0);
  const g = new THREE.Group();
  scene.add(g);
  const ropeMat = lambert(st.rope);
  const bodyGeo = new THREE.CylinderGeometry(LANTERN_R, LANTERN_R, LANTERN_H, 6);
  for (const l of spec.lanternStrings) {
    const y0 = ground(l.from[0], l.from[1]);
    const y1 = ground(l.to[0], l.to[1]);
    // cột hai đầu + chóp trang trí
    for (const [[x, z], y] of [[l.from, y0], [l.to, y1]] as const) {
      g.add(column(POLE_R, st.height + 0.2, st.pole, x, y, z, 6));
      g.add(box(0.34, 0.12, 0.34, st.trim, x, y + st.height + 0.26, z));
      colliders.addCircle(x, z, POLE_HIT);
    }
    // dây: các đoạn thẳng nối điểm võng
    const pts = Array.from({ length: ROPE_SEGMENTS + 1 }, (_, i) => ropeAt(l.from, l.to, y0, y1, st.height, st.sag, i / ROPE_SEGMENTS));
    for (let i = 0; i < ROPE_SEGMENTS; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, a.distanceTo(b)), ropeMat);
      seg.position.copy(a).add(b).multiplyScalar(0.5);
      seg.lookAt(b);
      g.add(seg);
    }
    // vật treo: cách đều theo `spacing`, chừa hai đầu — đèn lồng, hoặc dải tua (xen đèn mỗi `lanternEvery` dải)
    const len = Math.hypot(l.to[0] - l.from[0], l.to[1] - l.from[1]);
    const n = Math.max(1, Math.floor(len / st.spacing) - 1);
    const across = Math.atan2(l.to[0] - l.from[0], l.to[1] - l.from[1]); // dải tua dẹt nằm dọc theo dây
    for (let k = 1; k <= n; k++) {
      const p = ropeAt(l.from, l.to, y0, y1, st.height, st.sag, k / (n + 1));
      const lantern = st.hang === 'den' || (st.lanternEvery > 0 && k % st.lanternEvery === 0);
      if (lantern) {
        const cy = p.y - HANG - LANTERN_H / 2;
        const body = new THREE.Mesh(bodyGeo, lambert(st.lantern));
        body.position.set(p.x, cy, p.z);
        g.add(body);
        g.add(box(0.26, 0.05, 0.26, st.trim, p.x, cy + LANTERN_H / 2 + 0.02, p.z));
        g.add(box(0.05, 0.22, 0.05, st.trim, p.x, cy - LANTERN_H / 2 - 0.11, p.z));
        continue;
      }
      // dải tua: nút vàng trên dây + dải đỏ dẹt rủ xuống, dài ngắn xen kẽ cho mềm
      const drop = st.drop * (k % 2 ? 1 : 0.8);
      g.add(box(0.12, 0.08, 0.12, st.trim, p.x, p.y - 0.06, p.z));
      const ribbon = box(TASSEL_W, drop, 0.02, st.lantern, p.x, p.y - 0.1 - drop / 2, p.z);
      ribbon.rotation.y = across;
      g.add(ribbon);
    }
  }
}
