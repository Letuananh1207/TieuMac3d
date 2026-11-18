/**
 * Vật động đáy biển (V-110): bong bóng bay lên theo cột, đàn cá bơi vòng — mỗi thứ một InstancedMesh (1 draw call), cập nhật
 * ma trận mỗi khung. Không chịu gộp (`markDynamic`).
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { SeaFloorSpec } from './cungNgocSpec';
import { instMaterial, plain, v3 } from './hinhBien';
import type { LookSpec } from './look';
import { markDynamic } from './merge';
import { seededRandom } from './random';
import type { GroundY } from './terrainHeight';

export function addBubbles(scene: THREE.Scene, f: SeaFloorSpec, groundY: GroundY): (dt: number) => void {
  const total = f.bubbles.reduce((a, b) => a + b.count, 0);
  if (!total) return () => {};
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: f.colors.bubble, transparent: true, opacity: 0.55, depthWrite: false }), total);
  markDynamic(mesh);
  const rand = seededRandom(f.seed + 29);
  const RISE = 16;
  const items = f.bubbles.flatMap((b) =>
    Array.from({ length: b.count }, () => ({
      x: b.x + (rand() - 0.5) * (b.spread ?? 0.6),
      z: b.z + (rand() - 0.5) * (b.spread ?? 0.6),
      y: groundY(b.x, b.z),
      u: rand(),
      speed: (0.7 + rand() * 0.6) / RISE,
      size: 0.05 + rand() * rand() * 0.2,
      ph: rand() * 6,
    })),
  );
  const m = new THREE.Matrix4();
  let time = 0;
  const update = (dt: number): void => {
    time += dt;
    items.forEach((b, i) => {
      b.u = (b.u + b.speed * dt) % 1;
      const wob = Math.sin(time * 2 + b.ph) * 0.18 * b.u;
      const s = b.size * (0.8 + b.u * 0.6);
      m.makeScale(s, s, s).setPosition(b.x + wob, b.y + 0.3 + b.u * RISE, b.z + Math.cos(time * 1.7 + b.ph) * 0.12 * b.u);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  update(0);
  mesh.frustumCulled = false; // bóng bay khắp cột — hộp bao tính một lần sẽ sai
  scene.add(mesh);
  return update;
}

function fishGeometry(): THREE.BufferGeometry {
  const body = new THREE.SphereGeometry(1, 6, 4).scale(0.11, 0.13, 0.3);
  const tail = new THREE.ConeGeometry(0.13, 0.18, 3).rotateX(-Math.PI / 2).scale(0.4, 1, 1).translate(0, 0, -0.36);
  const g = mergeGeometries([plain(body), plain(tail)])!;
  const col = new Float32Array(g.getAttribute('position').count * 3).fill(1);
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

export function addFish(scene: THREE.Scene, f: SeaFloorSpec, look: LookSpec, groundY: GroundY): (dt: number) => void {
  const total = f.fish.reduce((a, s) => a + s.count, 0);
  if (!total) return () => {};
  const mesh = new THREE.InstancedMesh(fishGeometry(), instMaterial(look), total);
  markDynamic(mesh);
  const rand = seededRandom(f.seed + 41);
  const color = new THREE.Color();
  const fish = f.fish.flatMap((s, si) =>
    Array.from({ length: s.count }, (_, j) => ({
      s,
      base: groundY(s.x, s.z),
      lag: j * 0.22 + rand() * 0.1,
      dr: (rand() - 0.5) * 1.6,
      dy: (rand() - 0.5) * 1.0,
      size: 0.75 + rand() * 0.4,
      ph: rand() * 6,
      tint: si % 2,
    })),
  );
  fish.forEach((fi, i) => mesh.setColorAt(i, color.set(f.colors.fish[fi.tint]).multiplyScalar(0.94 + rand() * 0.1)));
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = v3(0, 1, 0);
  let time = 0;
  const update = (dt: number): void => {
    time += dt;
    fish.forEach((fi, i) => {
      const { s } = fi;
      const r = s.r + fi.dr;
      const a = (s.speed / s.r) * time - fi.lag * Math.sign(s.speed || 1);
      const x = s.x + Math.sin(a) * r;
      const z = s.z + Math.cos(a) * r;
      // hướng bơi = tiếp tuyến vòng (đạo hàm theo a nhân dấu tốc độ)
      const head = Math.atan2(Math.cos(a), -Math.sin(a)) + (s.speed < 0 ? Math.PI : 0);
      q.setFromAxisAngle(up, head + Math.sin(time * 6 + fi.ph) * 0.12);
      m.compose(v3(x, fi.base + s.y + fi.dy + Math.sin(time * 0.9 + fi.ph) * 0.15, z), q, v3(fi.size, fi.size, fi.size));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  update(0);
  mesh.frustumCulled = false;
  scene.add(mesh);
  return update;
}

