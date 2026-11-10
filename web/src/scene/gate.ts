import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { addRoof, addSign, type Style } from './buildings';
import { lambert } from './materials';
import { rotateXZ, type GateSpec } from './spec';

const PILLAR = 0.7; // cạnh cột vuông
const HEIGHT = 5.2; // tới xà ngang

/** Cổng sơn môn: hai cột trên chân đá, xà ngang, mái cong, bảng hiệu lớn. Va chạm chỉ ở hai cột (đi qua giữa được). */
export function addGate(scene: THREE.Scene, colliders: Colliders, gate: GateSpec, style: Style): void {
  const rot = gate.rotY ?? 0;
  const g = new THREE.Group();
  g.position.set(gate.x, 0, gate.z);
  g.rotation.y = (rot * Math.PI) / 180;

  const half = gate.width / 2 + PILLAR / 2; // tâm cột cách tâm cổng
  const pillarMat = lambert(style.pillar);
  const stoneMat = lambert(style.stone);
  for (const s of [-1, 1]) {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(PILLAR + 0.5, 0.8, PILLAR + 0.5), stoneMat);
    foot.position.set(s * half, 0.4, 0);
    g.add(foot);
    const p = new THREE.Mesh(new THREE.BoxGeometry(PILLAR, HEIGHT, PILLAR), pillarMat);
    p.position.set(s * half, HEIGHT / 2, 0);
    g.add(p);
  }
  const span = gate.width + 2 * PILLAR;
  const beam = new THREE.Mesh(new THREE.BoxGeometry(span + 1.2, 0.5, 0.6), pillarMat);
  beam.position.y = HEIGHT - 0.6;
  g.add(beam);
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(span + 0.4, 0.35, 0.5), pillarMat);
  lintel.position.y = HEIGHT + 0.25;
  g.add(lintel);
  addRoof(g, { y: HEIGHT + 0.5, w: span, d: 1.2, over: [1.2, 0.8], height: 1.4, color: style.eave, curved: true }, style);
  addSign(g, gate.title, HEIGHT - 1.5, 0.35, Math.min(1.4, span / 3));

  scene.add(g);
  for (const s of [-1, 1]) {
    const [dx, dz] = rotateXZ(s * half, 0, rot);
    colliders.add(gate.x + dx, gate.z + dz, PILLAR + 0.5, PILLAR + 0.5);
  }
}
