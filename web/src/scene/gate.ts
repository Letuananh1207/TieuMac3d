import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Style } from './buildings';
import { addSign } from './kien_truc/chi_tiet';
import { box } from './kien_truc/hinh';
import { hipRoof } from './kien_truc/mai';
import { rotateXZ, type GateSpec } from './spec';

const P = 0.7; // cạnh trụ vuông
const SIDE = 3.5; // bề rộng gian bên
const LOW_BEAM = 6.2; // đáy xà thấp nhất của gian giữa: cao hơn camera (~4,9 m) để camera không lọt sau biển

/**
 * Cổng sơn môn (牌坊) 3 gian 4 trụ: gian giữa rộng `width`, cao hơn; hai gian bên 3,5 m; ba mái nhỏ đầu đao; biển chữ
 * (`hanTitle` hoặc `title`) giữa hai xà gian giữa; chân trụ đá. Va chạm chỉ ở bốn trụ.
 */
export function addGate(scene: THREE.Scene, colliders: Colliders, gate: GateSpec, style: Style): void {
  const rot = gate.rotY ?? 0;
  const roofColor = gate.roofColor ?? style.eave;
  const g = new THREE.Group();
  g.position.set(gate.x, 0, gate.z);
  g.rotation.y = (rot * Math.PI) / 180;

  const inner = gate.width / 2 + P / 2;
  const outer = inner + P + SIDE;
  const midTop = LOW_BEAM + 1.6;
  const sideBeam = LOW_BEAM - 1.4;
  const sideTop = sideBeam + 1.1;
  const pillars: [number, number][] = [
    [-outer, sideTop],
    [-inner, midTop],
    [inner, midTop],
    [outer, sideTop],
  ];
  for (const [x, h] of pillars) {
    g.add(box(P + 0.5, 1, P + 0.5, style.stone, x, 0.5, 0));
    g.add(box(P, h, P, style.pillar, x, h / 2, 0));
  }
  // gian giữa: hai xà, biển ở giữa, mái
  const midSpan = 2 * inner + P + 0.6;
  g.add(box(midSpan, 0.5, 0.6, style.eave, 0, LOW_BEAM + 0.25, 0));
  g.add(box(midSpan + 0.04, 0.12, 0.64, style.beamBlue, 0, LOW_BEAM + 0.25, 0));
  g.add(box(midSpan, 0.4, 0.55, style.eave, 0, LOW_BEAM + 1.4, 0));
  addSign(g, gate.hanTitle ?? gate.title, LOW_BEAM + 0.82, 0.32, Math.min(1.1, gate.width / 3));
  hipRoof(g, { y: midTop, w: 2 * inner + P, d: 1, over: 0.9, h: 1.3, color: roofColor, ridgeColor: style.ridge });
  // hai gian bên: xà + mái thấp hơn
  for (const s of [-1, 1]) {
    const cx = (s * (inner + outer)) / 2;
    g.add(box(SIDE + P, 0.4, 0.5, style.eave, cx, sideBeam + 0.2, 0));
    g.add(box(SIDE + P, 0.35, 0.5, style.eave, cx, sideTop - 0.25, 0));
    const side = new THREE.Group();
    side.position.x = cx;
    hipRoof(side, { y: sideTop, w: SIDE + P, d: 0.9, over: 0.7, h: 1, color: roofColor, ridgeColor: style.ridge });
    g.add(side);
  }

  scene.add(g);
  for (const [x] of pillars) {
    const [dx, dz] = rotateXZ(x, 0, rot);
    colliders.add(gate.x + dx, gate.z + dz, P + 0.5, P + 0.5);
  }
}
