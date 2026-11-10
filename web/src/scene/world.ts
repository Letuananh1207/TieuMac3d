import type * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { addBuilding } from './buildings';
import { addEnvironment } from './environment';
import { addGate } from './gate';
import { mergeStatic } from './merge';
import { addPaths } from './paths';
import { addProps } from './props';
import { addFloating } from './sky';
import { zoneAnchors, type SceneSpec, type ZoneAnchor } from './spec';
import { addTrees } from './trees';
import { addWalls } from './walls';
import { addWater } from './water';
import { addWell } from './well';

export interface World {
  /** mặt sân: đích của tia dò khi chạm để đi */
  ground: THREE.Mesh;
  /** vị trí các vùng sự kiện, neo theo nhà trong đặc tả */
  zoneAnchors: ZoneAnchor[];
  /** gọi mỗi khung hình: khói lò đan, mây, đảo nổi */
  update(dt: number): void;
}

/** Dựng toàn bộ cảnh theo đặc tả. Mọi vật cản đăng ký vào `colliders`. */
export function buildWorld(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec): World {
  const style = spec.buildingStyle;
  const ground = addEnvironment(scene, spec);
  addPaths(scene, spec.paths, style.path);
  addWalls(scene, colliders, spec.walls, spec.wallSegments, style);
  for (const b of spec.buildings) addBuilding(scene, colliders, b, style);
  for (const g of spec.gates) addGate(scene, colliders, g, style);
  addWater(scene, colliders, spec.water, style);
  const props = addProps(scene, colliders, spec.props, style);
  const trees = addTrees(scene, colliders, spec.trees);
  addWell(scene, colliders, spec.well);
  const floating = addFloating(scene, spec.floating, style, spec.trees.leaves[1], spec.trees.seed);
  // dựng xong mới gộp: khối đứng yên cùng vật liệu → một draw call (scene/merge.ts)
  mergeStatic(scene, new Set([ground]));
  return {
    ground,
    zoneAnchors: zoneAnchors(spec.buildings),
    update(dt) {
      props(dt);
      trees(dt);
      floating(dt);
    },
  };
}
