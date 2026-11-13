/** Đặt rạp phim (`rap-phim`) vào cảnh: hình + va chạm + màn video + chỗ ngồi theo toạ độ cảnh (R-RAP-1). */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Style } from './kien_truc/chi_tiet';
import { rapPhim } from './kien_truc/rap_phim';
import { rotateXZ, type BuildingSpec } from './spec';
import { VideoScreen } from './videoScreen';

export interface Seat {
  x: number;
  y: number;
  z: number;
  /** hướng nhìn của người ngồi (radian, 0 = nhìn +z) — về phía màn */
  rotY: number;
}

export interface Cinema {
  screen: VideoScreen;
  seats: Seat[];
}

export function addCinema(scene: THREE.Scene, colliders: Colliders, b: BuildingSpec, style: Style, y0 = 0): Cinema {
  const rot = b.rotY ?? 0;
  const a = (rot * Math.PI) / 180;
  const g = new THREE.Group();
  g.position.set(b.x, y0, b.z);
  g.rotation.y = a;
  const shape = rapPhim(g, b, style);
  scene.add(g);
  const at = (x: number, z: number): [number, number] => {
    const [dx, dz] = rotateXZ(x, z, rot);
    return [b.x + dx, b.z + dz];
  };
  for (const l of shape.boxes) {
    const [cx, cz] = at(l.x, l.z);
    const [w, d] = rot % 180 !== 0 ? [l.d, l.w] : [l.w, l.d];
    colliders.add(cx, cz, w, d, l.h ?? 0);
  }
  for (const c of shape.circles) {
    const [cx, cz] = at(c.x, c.z);
    colliders.addCircle(cx, cz, c.r);
  }
  const seats = shape.seats.map((s) => {
    const [x, z] = at(s.x, s.z);
    return { x, y: y0, z, rotY: a + Math.PI };
  });
  return { screen: new VideoScreen(shape.screen), seats };
}
