import type * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { addBuilding, BUILDINGS } from './buildings';
import { addEnvironment } from './environment';
import { addTrees } from './trees';
import { addWalls } from './walls';
import { addWell } from './well';

export interface World {
  /** mặt sân: đích của tia dò khi chạm để đi */
  ground: THREE.Mesh;
}

/** Dựng toàn bộ học xá. Mọi vật cản đăng ký vào `colliders`. */
export function buildWorld(scene: THREE.Scene, colliders: Colliders): World {
  const ground = addEnvironment(scene);
  addWalls(scene, colliders);
  for (const b of BUILDINGS) addBuilding(scene, colliders, b);
  addTrees(scene, colliders);
  addWell(scene, colliders);
  return { ground };
}
