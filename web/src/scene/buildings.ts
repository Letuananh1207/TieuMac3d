import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { lambert } from './materials';
import { signTex } from './textures';

export interface BuildingSpec {
  x: number;
  z: number;
  /** rộng (trục x trước khi xoay) */
  w: number;
  /** sâu (trục z trước khi xoay) */
  d: number;
  title: string;
  /** bảng giấy nhỏ cạnh cửa: [dòng 1, dòng 2] */
  notice?: [string, string];
  roofColor: number;
  /** chỉ dùng 0 hoặc π/2, vì va chạm là hộp thẳng trục */
  rotY?: number;
}

export const BUILDINGS: BuildingSpec[] = [
  { x: 0, z: -11, w: 13, d: 7, title: 'Lớp HSK 3', notice: ['Buổi tối', 'chữ 快'], roofColor: 0x8a3b2c },
  { x: -12.5, z: 4, w: 7, d: 6, title: 'Thư viện', roofColor: 0x5f3a2a, rotY: Math.PI / 2 },
];

/** Giảng đường kiểu mái chảy: nền đá, cột gỗ, mái hình chóp kéo giãn, biển hiệu, đèn lồng. */
export function addBuilding(scene: THREE.Scene, colliders: Colliders, b: BuildingSpec): THREE.Group {
  const { w, d } = b;
  const g = new THREE.Group();
  g.position.set(b.x, 0, b.z);
  g.rotation.y = b.rotY ?? 0;

  const base = new THREE.Mesh(new THREE.BoxGeometry(w + 1, 0.5, d + 1), lambert(0x77706a));
  base.position.y = 0.25;
  g.add(base);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), lambert(0x8a5a3c));
  floor.position.y = 0.56;
  g.add(floor);
  const back = new THREE.Mesh(new THREE.BoxGeometry(w - 0.4, 2.6, 0.25), lambert(0xe9dcc0));
  back.position.set(0, 1.9, -d / 2 + 0.3);
  g.add(back);

  const pillarMat = lambert(0x3a2418);
  const pillarGeo = new THREE.CylinderGeometry(0.16, 0.18, 3.1, 8);
  const cols = Math.round(w / 2.6);
  for (let i = 0; i <= cols; i++) {
    for (const zz of [-d / 2 + 0.3, d / 2 - 0.3]) {
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.position.set(-w / 2 + 0.3 + (i * (w - 0.6)) / cols, 2.1, zz);
      g.add(p);
    }
  }

  // mái chảy: hình chóp 4 cạnh bị kéo giãn
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4), lambert(b.roofColor));
  roof.rotation.y = Math.PI / 4;
  roof.scale.set((w / 2 + 1.6) / 0.707, 2.6, (d / 2 + 1.4) / 0.707);
  roof.position.y = 3.65 + 1.3;
  g.add(roof);
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(w * 0.45, 0.25, 0.3), lambert(0x4a2a20));
  ridge.position.y = 6.2;
  g.add(ridge);
  const eave = new THREE.Mesh(new THREE.BoxGeometry(w + 3, 0.2, d + 2.6), lambert(0x3a2418));
  eave.position.y = 3.65;
  g.add(eave);

  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.9), new THREE.MeshBasicMaterial({ map: signTex(b.title) }));
  sign.position.set(0, 3.15, d / 2 + 0.05);
  g.add(sign);
  if (b.notice) {
    const n = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 0.75),
      new THREE.MeshBasicMaterial({ map: signTex(b.notice[0], b.notice[1], { paper: true }) }),
    );
    n.position.set(-w / 2 + 1.4, 1.7, d / 2 - 0.1);
    n.rotation.y = 0.15;
    g.add(n);
  }

  const lanternMat = new THREE.MeshBasicMaterial({ color: 0xff6a3d });
  for (const x of [-w / 2 + 0.3, w / 2 - 0.3]) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), lanternMat);
    l.scale.y = 1.3;
    l.position.set(x, 3.0, d / 2 + 0.1);
    g.add(l);
  }

  scene.add(g);
  if (b.rotY) colliders.add(b.x, b.z, d + 1, w + 1);
  else colliders.add(b.x, b.z, w + 1, d + 1);
  return g;
}
