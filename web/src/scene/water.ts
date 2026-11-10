import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Style } from './buildings';
import { lambert } from './materials';
import type { WaterSpec } from './spec';

/**
 * Ao / hồ: mặt nước phẳng sát mặt sân + bờ đá. Không đi xuống được: ao tròn = vật cản tròn bán kính r,
 * ao chữ nhật = hộp (quay bội 90 thì đổi rộng ↔ sâu).
 */
export function addWater(scene: THREE.Scene, colliders: Colliders, list: WaterSpec[], style: Style): void {
  if (list.length === 0) return;
  const waterMat = new THREE.MeshBasicMaterial({ color: style.water });
  const rimMat = lambert(style.stone);
  for (const p of list) {
    const g = new THREE.Group();
    g.position.set(p.x, 0, p.z);
    if (p.r !== undefined) {
      const surface = new THREE.Mesh(new THREE.CircleGeometry(p.r, 32), waterMat);
      surface.rotation.x = -Math.PI / 2;
      surface.position.y = 0.06;
      g.add(surface);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(p.r, 0.28, 5, 32), rimMat);
      rim.rotation.x = -Math.PI / 2;
      rim.position.y = 0.1;
      g.add(rim);
      colliders.addCircle(p.x, p.z, p.r);
    } else if (p.w !== undefined && p.d !== undefined) {
      const rot = p.rotY ?? 0;
      g.rotation.y = (rot * Math.PI) / 180;
      const surface = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.d), waterMat);
      surface.rotation.x = -Math.PI / 2;
      surface.position.y = 0.06;
      g.add(surface);
      const t = 0.5; // bề dày bờ
      const edges: [number, number, number, number][] = [
        [0, -p.d / 2, p.w + t, t],
        [0, p.d / 2, p.w + t, t],
        [-p.w / 2, 0, t, p.d + t],
        [p.w / 2, 0, t, p.d + t],
      ];
      for (const [x, z, w, d] of edges) {
        const e = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), rimMat);
        e.position.set(x, 0.15, z);
        g.add(e);
      }
      if (rot % 180 !== 0) colliders.add(p.x, p.z, p.d, p.w);
      else colliders.add(p.x, p.z, p.w, p.d);
    }
    scene.add(g);
  }
}
