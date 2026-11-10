import * as THREE from 'three';
import { lambert } from '../scene/materials';
import type { Character } from './character';

/** Nhân vật dựng từ khối hình (gấu đội mũ, áo dài). Dùng làm bản dự phòng khi chưa có model .glb. */
export function createBlockCharacter(): Character {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const fur = lambert(0x9a6a40);
  const robe = lambert(0xe8e2d4);
  const hat = lambert(0x2f4f7a);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 0.9, 10), robe);
  torso.position.y = 0.75;
  body.add(torso);
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.1, 10), lambert(0x5b3a22));
  belt.position.y = 0.82;
  body.add(belt);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10), fur);
  head.position.y = 1.5;
  body.add(head);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), lambert(0xc89a6c));
  snout.position.set(0, 1.42, 0.36);
  body.add(snout);
  const eyeMat = lambert(0x1a120c);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), fur);
    ear.position.set(0.3 * s, 1.85, 0);
    body.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), eyeMat);
    eye.position.set(0.15 * s, 1.57, 0.37);
    body.add(eye);
  }
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), hat);
  cap.position.y = 1.78;
  body.add(cap);
  const legs: THREE.Mesh[] = [];
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.4, 6), fur);
    leg.position.set(0.2 * s, 0.2, 0);
    body.add(leg);
    legs.push(leg);
  }

  // bóng giả: một đĩa mờ dưới chân, rẻ hơn rất nhiều so với shadow realtime
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.6, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  let walkT = 0;
  return {
    root,
    facing: body,
    animate(dt, speed) {
      if (speed > 0.05) walkT += dt * 10 * speed;
      else walkT *= 0.85;
      body.position.y = Math.abs(Math.sin(walkT)) * 0.08;
      legs[0].position.z = Math.sin(walkT) * 0.15;
      legs[1].position.z = -Math.sin(walkT) * 0.15;
    },
  };
}
