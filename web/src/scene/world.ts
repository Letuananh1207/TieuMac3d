import type * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { addBuilding } from './buildings';
import { addEnvironment } from './environment';
import { zoneAnchors, type SceneSpec, type ZoneAnchor } from './spec';
import { addTrees } from './trees';
import { addWalls } from './walls';
import { addWell } from './well';

export interface World {
  /** mặt sân: đích của tia dò khi chạm để đi */
  ground: THREE.Mesh;
  /** vị trí các vùng sự kiện, neo theo nhà trong đặc tả */
  zoneAnchors: ZoneAnchor[];
}

/** Dựng toàn bộ học xá theo đặc tả cảnh. Mọi vật cản đăng ký vào `colliders`. */
export function buildWorld(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec): World {
  const ground = addEnvironment(scene, spec);
  addWalls(scene, colliders, spec.walls);
  for (const b of spec.buildings) addBuilding(scene, colliders, b, spec.buildingStyle);
  addTrees(scene, colliders, spec.trees);
  addWell(scene, colliders, spec.well);
  return { ground, zoneAnchors: zoneAnchors(spec.buildings) };
}
