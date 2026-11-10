import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { lambert } from './materials';

/** Giếng giữa sân (điểm nhấn). */
export function addWell(scene: THREE.Scene, colliders: Colliders): void {
  const well = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.8, 12), lambert(0x6c6660));
  well.position.set(6, 0.4, 2);
  scene.add(well);
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.9, 12), new THREE.MeshBasicMaterial({ color: 0x2b4a6a }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(6, 0.78, 2);
  scene.add(water);
  colliders.add(6, 2, 2.2, 2.2);
}
