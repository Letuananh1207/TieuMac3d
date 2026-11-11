import type * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { LayeredGround, type Ground } from '../collision/ground';
import { addBuilding } from './buildings';
import { addEnvironment, addFlatGround } from './environment';
import { addCloudSea, addFarMountains } from './farMountains';
import { addGate } from './gate';
import { mergeStatic } from './merge';
import { addPaths } from './paths';
import { addProps } from './props';
import { addFloating } from './sky';
import { addRoomBuilding, inRect, type InteriorUse, type Room } from './rooms';
import { roomKinds, zoneAnchors, type SceneSpec, type ZoneAnchor } from './spec';
import { addTerrain } from './terrain';
import { buildHeightfield, type GroundY } from './terrainHeight';
import { addTrees } from './trees';
import { addWalls } from './walls';
import { addWater } from './water';
import { addWell } from './well';

export interface World {
  /** mặt đất: đích của tia dò khi chạm để đi (sân phẳng hoặc lưới địa hình) */
  ground: THREE.Mesh;
  /** mặt đất cho nhân vật / camera: địa hình (hoặc phẳng y = 0) + nền nhà vào được */
  surface: Ground;
  /** nhà vào được (giảng đường, thư viện) */
  rooms: Room[];
  /** vị trí các vùng sự kiện, neo theo nhà trong đặc tả */
  zoneAnchors: ZoneAnchor[];
  /** gọi mỗi khung hình: khói lò đan, mây, đảo nổi, mờ mái nhà khi `player` đứng trong */
  update(dt: number, player?: { x: number; z: number }): void;
}

/**
 * Dựng toàn bộ cảnh theo đặc tả. Mọi vật cản đăng ký vào `colliders`.
 * `interiors` (mã vùng → kiểu nội thất, do nội dung bài quyết) biến nhà neo vùng đó thành nhà vào được.
 */
export function buildWorld(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec, interiors: Record<string, InteriorUse> = {}): World {
  const style = spec.buildingStyle;
  addEnvironment(scene, spec);
  const hf = spec.terrain.enabled ? buildHeightfield(spec.terrain, spec.paths) : null;
  // ngoài lưới (vực) → 0; nhà, tường, lối đi nằm trên bục phẳng nên không cần độ cao riêng
  const groundY: GroundY | undefined = hf
    ? (x, z) => {
        const h = hf.heightAt(x, z);
        return Number.isFinite(h) ? h : 0;
      }
    : undefined;
  const ground = hf ? addTerrain(scene, spec, hf) : addFlatGround(scene, spec.ground);
  addFarMountains(scene, spec);
  addCloudSea(scene, spec);
  addPaths(scene, spec.paths, style.path);
  addWalls(scene, colliders, spec.walls, spec.wallSegments, style);
  const kinds = roomKinds(spec.buildings, interiors);
  const rooms: Room[] = [];
  for (const b of spec.buildings) {
    const use = b.zone && kinds[b.zone.id] ? interiors[b.zone.id] : undefined;
    if (use) rooms.push(addRoomBuilding(scene, colliders, b, style, use));
    else addBuilding(scene, colliders, b, style);
  }
  for (const g of spec.gates) addGate(scene, colliders, g, style);
  addWater(scene, colliders, spec.water, style);
  const props = addProps(scene, colliders, spec.props, style, groundY);
  const trees = addTrees(scene, colliders, spec.trees, groundY);
  addWell(scene, colliders, spec.well);
  const floating = addFloating(scene, spec.floating, style, spec.trees.leaves[1], spec.trees.seed);
  // dựng xong mới gộp: khối đứng yên cùng vật liệu → một draw call (scene/merge.ts)
  mergeStatic(scene, new Set([ground]));
  return {
    ground,
    surface: new LayeredGround(hf, rooms.flatMap((r) => r.pads)),
    rooms,
    zoneAnchors: zoneAnchors(spec.buildings, kinds),
    update(dt, player) {
      props(dt);
      trees(dt);
      floating(dt);
      for (const r of rooms) r.update(dt, !!player && inRect(r.floor, player.x, player.z));
    },
  };
}
