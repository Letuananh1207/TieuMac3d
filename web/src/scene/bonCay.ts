import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { lambert } from './materials';
import { finish } from './trees';
import type { SceneSpec } from './spec';

/** Một bồn cây: tâm, độ cao mặt đất, bán kính (m). */
export interface PlanterSpot {
  x: number;
  z: number;
  y: number;
  r: number;
}

type Style = SceneSpec['trees']['planter'];

/** Tô một màu cho mọi đỉnh (vật liệu dùng màu đỉnh). */
function paint(g: THREE.BufferGeometry, hex: string): THREE.BufferGeometry {
  const c = new THREE.Color(hex);
  const n = g.getAttribute('position').count;
  g.setAttribute('color', new THREE.Float32BufferAttribute(Array.from({ length: n }, () => [c.r, c.g, c.b]).flat(), 3));
  return g;
}

/** Bồn bán kính 1: thành đá lục giác (không nắp, chân loe nhẹ) + mặt đất lục giác ngang miệng bồn — 18 tam giác. */
export function planterGeometry(style: Style): THREE.BufferGeometry {
  const h = style.height;
  const wall = paint(new THREE.CylinderGeometry(1, 1.06, h, 6, 1, true).translate(0, h / 2, 0), style.stone);
  const soil = paint(new THREE.CircleGeometry(0.97, 6).rotateX(-Math.PI / 2).translate(0, h - 0.04, 0), style.soil);
  const g = mergeGeometries([wall.toNonIndexed(), soil.toNonIndexed()]);
  if (!g) throw new Error('bồn cây: ghép hình lỗi');
  return g;
}

/**
 * Bồn cây 樹池 (R-VA-6) quanh gốc cây trên sân lát. Một InstancedMesh cho mọi bồn (1 draw call, 18 tam giác một bồn);
 * không bồn nào → không dựng gì.
 */
export function addPlanters(scene: THREE.Scene, spots: PlanterSpot[], style: Style): void {
  if (spots.length === 0) return;
  const mesh = new THREE.InstancedMesh(planterGeometry(style), lambert('#ffffff', { vertexColors: true }), spots.length);
  const m = new THREE.Matrix4();
  spots.forEach((p, i) => {
    // chân chìm 5 cm cho khỏi hở trên đất dốc nhẹ
    mesh.setMatrixAt(i, m.makeScale(p.r, 1, p.r).setPosition(p.x, p.y - 0.05, p.z));
  });
  finish(scene, [mesh]);
}
