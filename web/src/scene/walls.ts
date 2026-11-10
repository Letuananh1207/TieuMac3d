import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { lambert } from './materials';
import { makeCanvasTex } from './textures';

/** Nửa cạnh sân (tường nằm ở ±WALL). */
export const WALL = 21;
const WALL_HEIGHT = 2.6;

export function addWalls(scene: THREE.Scene, colliders: Colliders): void {
  const wallTex = makeCanvasTex(
    256,
    128,
    (g) => {
      g.fillStyle = '#4a2b24';
      g.fillRect(0, 0, 256, 128);
      for (let y = 0; y < 8; y++) {
        for (let x = -1; x < 8; x++) {
          g.fillStyle = `hsl(8,${35 + Math.random() * 10}%,${30 + Math.random() * 8}%)`;
          g.fillRect(x * 34 + (y % 2) * 17 + 1, y * 16 + 1, 32, 14);
        }
      }
    },
    [10, 1],
  );
  const wallMat = lambert(0xffffff, { map: wallTex });
  const capMat = lambert(0x6e2f26);
  const sides: [number, number, number, number][] = [
    [0, -WALL, 2 * WALL + 1, 1],
    [0, WALL, 2 * WALL + 1, 1],
    [-WALL, 0, 1, 2 * WALL + 1],
    [WALL, 0, 1, 2 * WALL + 1],
  ];
  for (const [x, z, w, d] of sides) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, WALL_HEIGHT, d), wallMat);
    m.position.set(x, WALL_HEIGHT / 2, z);
    scene.add(m);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.35, d + 0.5), capMat);
    cap.position.set(x, WALL_HEIGHT + 0.17, z);
    scene.add(cap);
    colliders.add(x, z, w, d);
  }
}
