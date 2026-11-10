import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { lambert } from './materials';
import type { SceneSpec } from './spec';

/** Giếng giữa sân (điểm nhấn). */
export function addWell(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec['well']): void {
  const { x, z } = spec;
  const well = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.8, 12), lambert(spec.stone));
  well.position.set(x, 0.4, z);
  scene.add(well);
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.9, 12), new THREE.MeshBasicMaterial({ color: spec.water }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(x, 0.78, z);
  scene.add(water);
  colliders.add(x, z, 2.2, 2.2);
}
