/** Chi tiết dùng chung của kiến trúc: biển hiệu, đèn lồng, lan can đá, dải xà vẽ, cửa bức bàn, bậc thềm. */
import * as THREE from 'three';
import type { SceneSpec } from '../spec';
import { signTex } from '../textures';
import { box } from './hinh';

export type Style = SceneSpec['buildingStyle'];

export function addSign(g: THREE.Group, title: string, y: number, z: number, scale = 1): void {
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8 * scale, 0.9 * scale),
    new THREE.MeshBasicMaterial({ map: signTex(title) }),
  );
  sign.position.set(0, y, z);
  g.add(sign);
}

const lanternGeo = new THREE.SphereGeometry(0.22, 10, 8);

/** Đèn lồng đỏ treo tại các điểm [x, y, z]. */
export function addLanterns(g: THREE.Group, at: [number, number, number][], style: Style): void {
  const mat = new THREE.MeshBasicMaterial({ color: style.lantern });
  for (const [x, y, z] of at) {
    const l = new THREE.Mesh(lanternGeo, mat);
    l.scale.y = 1.3;
    l.position.set(x, y, z);
    g.add(l);
  }
}

/**
 * Lan can đá quanh mép nền `w` × `d` ở độ cao `y`: trụ thấp cách ~1,4 m + thanh ngang.
 * Mép trước chừa lối lên bậc rộng `gap`.
 */
export function addRailing(g: THREE.Group, w: number, d: number, y: number, gap: number, style: Style): void {
  const postH = 0.6;
  const hw = w / 2 - 0.15;
  const hd = d / 2 - 0.15;
  const post = (x: number, z: number): void => void g.add(box(0.18, postH, 0.18, style.base, x, y + postH / 2, z));
  const rail = (len: number, x: number, z: number, alongX: boolean): void =>
    void g.add(alongX ? box(len, 0.1, 0.12, style.base, x, y + 0.45, z) : box(0.12, 0.1, len, style.base, x, y + 0.45, z));
  const along = (from: number, to: number, fixed: number, alongX: boolean): void => {
    const len = to - from;
    if (len <= 0.2) return;
    const n = Math.max(1, Math.round(len / 1.4));
    for (let i = 0; i <= n; i++) {
      const v = from + (i * len) / n;
      if (alongX) post(v, fixed);
      else post(fixed, v);
    }
    rail(len, alongX ? (from + to) / 2 : fixed, alongX ? fixed : (from + to) / 2, alongX);
  };
  along(-hw, hw, -hd, true); // sau
  along(-hd, hd, -hw, false); // trái
  along(-hd, hd, hw, false); // phải
  along(-hw, -gap / 2, hd, true); // trước, hai bên lối bậc
  along(gap / 2, hw, hd, true);
}

/** Bậc thềm trước nền: rộng `w`, từ mép nền `z0` đi ra +z, cao dần tới `h`. */
export function addSteps(g: THREE.Group, w: number, z0: number, h: number, style: Style, steps = 3): void {
  const depth = 0.45;
  for (let i = 0; i < steps; i++) {
    const sh = (h * (steps - i)) / (steps + 1);
    g.add(box(w, sh, depth, style.base, 0, sh / 2, z0 + depth / 2 + i * depth));
  }
}

/** Dải xà vẽ quanh thân `w` × `d` ở `y` (đáy dải): nền lục, vạch lam giữa, chấm vàng kim mặt trước. */
export function addBeamBand(g: THREE.Group, w: number, d: number, y: number, style: Style): void {
  g.add(box(w + 0.3, 0.5, d + 0.3, style.eave, 0, y + 0.25, 0));
  g.add(box(w + 0.36, 0.12, d + 0.36, style.beamBlue, 0, y + 0.25, 0));
  const n = Math.max(2, Math.round(w / 1.6));
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + ((i + 0.5) * w) / n;
    g.add(box(0.16, 0.16, 0.06, style.gold, x, y + 0.25, (d + 0.36) / 2 + 0.02));
  }
}

/**
 * Cửa bức bàn giữa các cột mặt trước: tấm vôi + song gỗ dọc + chân cửa gỗ nâu.
 * `xs` = vị trí các cột; `doors` = số gian giữa làm cửa (còn lại để tường).
 */
export function addDoors(g: THREE.Group, xs: number[], y0: number, h: number, z: number, style: Style, doors = 3, open = -1): void {
  const bays = xs.length - 1;
  const first = Math.floor((bays - doors) / 2);
  for (let i = 0; i < bays; i++) {
    if (i === open) continue; // gian để trống: lối vào nhà (nhà vào được)
    const a = xs[i] + 0.22;
    const b = xs[i + 1] - 0.22;
    const w = b - a;
    const cx = (a + b) / 2;
    const isDoor = i >= first && i < first + doors;
    g.add(box(w, h - 0.3, 0.12, style.wall, cx, y0 + (h - 0.3) / 2, z));
    g.add(box(w, 0.55, 0.16, style.timber, cx, y0 + 0.275, z + 0.01));
    if (!isDoor) continue;
    for (const f of [0.25, 0.5, 0.75]) g.add(box(0.06, h - 0.9, 0.16, style.timber, a + w * f, y0 + 0.55 + (h - 0.9) / 2, z + 0.02));
  }
}
