import * as THREE from 'three';
import type { Style } from './buildings';
import { lambert } from './materials';
import { markDynamic } from './merge';
import type { Updater } from './props';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { isSoft, type LookSpec } from './look';
import type { SceneSpec } from './spec';
import { seededRandom } from './trees';

const PUFFS_PER_CLOUD = 3;

/** Đảo đá lơ lửng (đá chóp ngược + mặt cỏ, nhấp nhô chậm) và mây trôi vòng quanh cảnh. Không va chạm. */
export function addFloating(
  scene: THREE.Scene,
  spec: SceneSpec['floating'],
  style: Style,
  grass: string,
  seed: number,
  look?: LookSpec,
): Updater {
  const updaters: Updater[] = [];
  let time = 0;

  if (spec.islands.length) {
    const rock = lambert(style.stone);
    const top = lambert(grass);
    const rockGeo = new THREE.ConeGeometry(4, 6, 7);
    const topGeo = new THREE.CylinderGeometry(4.2, 4, 0.6, 7);
    const islands = spec.islands.map((it, i) => {
      const g = new THREE.Group();
      const r = new THREE.Mesh(rockGeo, rock);
      r.rotation.x = Math.PI; // mũi chóp chĩa xuống
      r.position.y = -3;
      const t = new THREE.Mesh(topGeo, top);
      t.position.y = 0.3;
      g.add(r, t);
      g.position.set(it.x, it.y, it.z);
      g.scale.setScalar(it.scale);
      markDynamic(g);
      scene.add(g);
      return { g, y: it.y, phase: i * 1.7 };
    });
    updaters.push(() => {
      for (const it of islands) it.g.position.y = it.y + Math.sin(time * 0.4 + it.phase) * 0.6;
    });
  }

  const { clouds } = spec;
  if (clouds.count > 0 && look && isSoft(look)) updaters.push(puffyClouds(scene, spec, look, seed, () => time));
  else if (clouds.count > 0) {
    const rand = seededRandom(seed * 31 + 5);
    const n = clouds.count * PUFFS_PER_CLOUD;
    const mesh = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(3, 0),
      new THREE.MeshLambertMaterial({ color: clouds.color, transparent: true, opacity: 0.85 }),
      n,
    );
    // mỗi cụm mây: góc trên vòng tròn, lệch bán kính / độ cao, 3 cục mây dẹt cạnh nhau
    const puffs = Array.from({ length: n }, (_, i) => {
      const c = Math.floor(i / PUFFS_PER_CLOUD);
      const base = (c / clouds.count) * Math.PI * 2;
      return {
        a: base + (rand() - 0.5) * 0.4 + (i % PUFFS_PER_CLOUD) * 0.06,
        r: clouds.radius + (rand() - 0.5) * 12,
        y: clouds.height + (rand() - 0.5) * 4,
        s: 0.8 + rand() * 0.8,
      };
    });
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const size = new THREE.Vector3();
    const place = (): void => {
      const turn = (time * clouds.speed) / clouds.radius; // tốc độ m/s trên vòng tròn
      puffs.forEach((p, i) => {
        const a = p.a + turn;
        pos.set(Math.cos(a) * p.r, p.y, Math.sin(a) * p.r);
        mesh.setMatrixAt(i, m.compose(pos, quat, size.set(p.s * 1.8, p.s * 0.6, p.s)));
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    place();
    mesh.frustumCulled = false; // cả vòng mây quanh cảnh, luôn có phần trong khung nhìn
    scene.add(mesh);
    updaters.push(place);
  }

  return (dt) => {
    time += dt;
    for (const u of updaters) u(dt);
  };
}

/** Đám mây phồng: 5 cầu lệch nhau gộp, đáy phẳng; màu theo đỉnh: trên trắng (`clouds.color`) → bụng `look.cloudBelly`. */
export function puffGeometry(body: THREE.ColorRepresentation, belly: THREE.ColorRepresentation): THREE.BufferGeometry {
  const parts: [number, number, number, number][] = [
    [0, 0.2, 0, 1.6],
    [-1.6, 0, 0.2, 1.15],
    [1.7, -0.05, -0.1, 1.2],
    [0.6, 0.55, 0.6, 1.0],
    [-0.7, 0.4, -0.7, 0.95],
  ];
  const geos = parts.map(([x, y, z, r]) => new THREE.IcosahedronGeometry(r, 1).translate(x, y, z));
  const g = mergeGeometries(geos);
  for (const p of geos) p.dispose();
  const pos = g.getAttribute('position');
  const top = new THREE.Color(body);
  const low = new THREE.Color(belly);
  const c = new THREE.Color();
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const y = Math.max(-0.35, pos.getY(i)); // đáy phẳng
    pos.setY(i, y);
    c.copy(low).lerp(top, Math.min(1, Math.max(0, (y + 0.35) / 1.6)));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

/**
 * Mây phồng cho cảnh mềm (kế hoạch 2026-11-14-canh-dep NV7): mỗi đám một instance, **đục** (không trong suốt — đỡ tô chồng),
 * không chịu sương, trôi vòng như mây cũ. 1 draw call.
 */
function puffyClouds(scene: THREE.Scene, spec: SceneSpec['floating'], look: LookSpec, seed: number, now: () => number): Updater {
  const { clouds } = spec;
  const rand = seededRandom(seed * 31 + 5);
  const mesh = new THREE.InstancedMesh(
    puffGeometry(clouds.color, look.cloudBelly),
    new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }),
    clouds.count,
  );
  const items = Array.from({ length: clouds.count }, (_, i) => ({
    a: (i / clouds.count) * Math.PI * 2 + (rand() - 0.5) * 0.4,
    r: clouds.radius + (rand() - 0.5) * 12,
    y: clouds.height + (rand() - 0.5) * 4,
    s: 1.6 + rand() * 1.2,
    turn: rand() * Math.PI,
  }));
  const m = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const size = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const place = (): void => {
    const turn = (now() * clouds.speed) / clouds.radius;
    items.forEach((p, i) => {
      const a = p.a + turn;
      pos.set(Math.cos(a) * p.r, p.y, Math.sin(a) * p.r);
      quat.setFromAxisAngle(up, p.turn - a);
      mesh.setMatrixAt(i, m.compose(pos, quat, size.set(p.s * 1.3, p.s * 0.8, p.s)));
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  place();
  mesh.frustumCulled = false;
  scene.add(mesh);
  return place;
}
