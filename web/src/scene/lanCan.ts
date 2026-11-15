/**
 * Lan can thấp quây sân (`fences` + `fenceStyle` trong đặc tả), hai kiểu (`fenceStyle.kind`):
 * - `go` (mặc định, như cũ): gỗ sơn son — trụ vuông có chóp vàng cách đều, ba thanh ngang (tay vịn, giữa, chân);
 * - `da` (V-42, Quảng Trường): đá trắng kiểu 石欄杆 — trụ vuông đầu sen (chụp vuông + búp tròn), tay vịn trên, tấm chắn
 *   (欄板) đặc giữa hai trụ, gờ chân. `color` thân đá, `cap` đầu sen + tay vịn.
 * Thấp hơn tầm camera nên không che; mỗi đoạn một vật cản dày 0,3 m (không chặn tầm nhìn camera).
 * Ngân sách: đứng yên, gộp theo màu (`mergeStatic` / cảnh mềm `mergeSoft`) → vài draw call cho mọi đoạn.
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { lambert } from './materials';
import { box } from './kien_truc/hinh';
import type { SceneSpec } from './spec';
import type { GroundY } from './terrainHeight';

const POST = 0.14;
const RAIL = 0.07;
const HIT = 0.3;
/** lan can đá: cạnh trụ, búp sen, dày tấm chắn, tay vịn */
const STONE_POST = 0.24;
const BUD_R = 0.12;
const PANEL = 0.1;
const HAND = 0.12;

export function addFences(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec, groundY?: GroundY): void {
  const st = spec.fenceStyle;
  const ground = (x: number, z: number): number => (groundY ? groundY(x, z) : 0);
  // búp sen 8 mặt (cầu 6 × 4 tốn ~5 lần tam giác — ~66 trụ quanh Quảng Trường)
  const bud = st.kind === 'da' ? new THREE.OctahedronGeometry(BUD_R, 0) : null;
  // hai đoạn gặp nhau ở góc (cùng điểm đầu / cuối) dùng chung một trụ góc — không dựng trùng (V-44: góc lan can liền)
  const posts: [number, number][] = [];
  const newPost = (x: number, z: number): boolean => {
    if (posts.some(([px, pz]) => Math.abs(px - x) < 0.05 && Math.abs(pz - z) < 0.05)) return false;
    posts.push([x, z]);
    return true;
  };
  for (const f of spec.fences) {
    const [ax, az] = f.from;
    const [bx, bz] = f.to;
    const len = Math.hypot(bx - ax, bz - az);
    const alongX = az === bz;
    const mx = (ax + bx) / 2;
    const mz = (az + bz) / 2;
    const y = ground(mx, mz);
    const n = Math.max(1, Math.round(len / st.postEvery));
    const along = (w: number, h: number, color: string, cy: number): THREE.Mesh =>
      alongX ? box(len, h, w, color, mx, cy, mz) : box(w, h, len, color, mx, cy, mz);
    if (st.kind === 'da') {
      const h = st.height;
      // trụ + chụp vuông + búp sen
      for (let i = 0; i <= n; i++) {
        const x = ax + ((bx - ax) * i) / n;
        const z = az + ((bz - az) * i) / n;
        if (!newPost(x, z)) continue;
        scene.add(box(STONE_POST, h, STONE_POST, st.color, x, y + h / 2, z));
        scene.add(box(STONE_POST + 0.06, 0.08, STONE_POST + 0.06, st.cap, x, y + h + 0.04, z));
        const m = new THREE.Mesh(bud!, lambert(st.cap));
        m.scale.y = 1.5;
        m.position.set(x, y + h + 0.08 + BUD_R, z);
        scene.add(m);
      }
      scene.add(along(HAND, 0.1, st.cap, y + h - 0.12)); // tay vịn
      scene.add(along(PANEL, h * 0.5, st.color, y + 0.12 + (h * 0.5) / 2)); // tấm chắn đặc
      scene.add(along(0.2, 0.1, st.color, y + 0.05)); // gờ chân
    } else {
      for (let i = 0; i <= n; i++) {
        const x = ax + ((bx - ax) * i) / n;
        const z = az + ((bz - az) * i) / n;
        if (!newPost(x, z)) continue;
        scene.add(box(POST, st.height, POST, st.color, x, y + st.height / 2, z));
        scene.add(box(POST + 0.08, 0.1, POST + 0.08, st.cap, x, y + st.height + 0.05, z));
      }
      for (const h of [st.height - 0.06, st.height * 0.55, 0.12]) {
        const w = h === st.height - 0.06 ? 0.1 : RAIL;
        scene.add(along(w, w, st.color, y + h));
      }
    }
    colliders.add(mx, mz, alongX ? len : HIT, alongX ? HIT : len);
  }
}
