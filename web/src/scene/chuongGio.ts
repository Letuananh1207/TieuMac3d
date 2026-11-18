/**
 * Giá chuông gió tre quanh Tháp Sáo Trúc (V-113): hai cột trúc + xà ngang (khối tĩnh, gộp màu theo đỉnh cùng tháp), 5 ống
 * trúc ngắn treo dây + một dải lụa lay theo gió (`SwayBuilder`). Xà dọc trục x trước khi quay `rotY`.
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { lambert } from './materials';
import type { SwayBuilder } from './swayGeo';
import type { FluteTowerSpec, WindChimeSpec } from './thapSaoSpec';

const HALF = 0.75; // nửa nhịp hai cột (m)
const POST_H = 2.5;
const BAR_Y = 2.42;
const TUBE_LEN = [0.42, 0.55, 0.36, 0.5, 0.3];

/** Điểm cục bộ (lx, lz) của giá → toạ độ cảnh. */
function at(c: WindChimeSpec, lx: number, lz: number): [number, number] {
  const a = ((c.rotY ?? 0) * Math.PI) / 180;
  return [c.x + lx * Math.cos(a) + lz * Math.sin(a), c.z - lx * Math.sin(a) + lz * Math.cos(a)];
}

export function addChimeFrame(root: THREE.Object3D, colliders: Colliders, c: WindChimeSpec, y0: number, colors: FluteTowerSpec['colors']): void {
  const bamboo = lambert(colors.bamboo[1]);
  const node = lambert(colors.node);
  const g = new THREE.Group();
  g.position.set(c.x, y0, c.z);
  g.rotation.y = ((c.rotY ?? 0) * Math.PI) / 180;
  for (const s of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, POST_H + 0.1, 6), bamboo);
    post.position.set(s * HALF, (POST_H + 0.1) / 2 - 0.1, 0);
    g.add(post);
    for (const y of [0.9, 1.8]) {
      const n = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 6), node);
      n.position.set(s * HALF, y, 0);
      g.add(n);
    }
    const [x, z] = at(c, s * HALF, 0);
    colliders.addCircle(x, z, 0.15);
  }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, HALF * 2 + 0.5, 6).rotateZ(Math.PI / 2), bamboo);
  bar.position.y = BAR_Y;
  g.add(bar);
  root.add(g);
}

/** Ống chuông + dây + dải lụa (lay): dây đứng yên ở xà, ống lay mạnh dần xuống đáy. */
export function addChimeHangers(b: SwayBuilder, c: WindChimeSpec, y0: number, colors: FluteTowerSpec['colors']): void {
  const string = 0.16;
  TUBE_LEN.forEach((len, i) => {
    const lx = -0.5 + i * 0.25;
    const [x, z] = at(c, lx, 0);
    const top = BAR_Y - 0.06;
    b.strip([new THREE.Vector3(x, y0 + top, z), new THREE.Vector3(x, y0 + top - string, z)], 0.008, colors.rope, (u) => u * 0.12);
    b.hangingTube(new THREE.Vector3(x, y0 + top - string, z), 0.045, len, colors.bamboo[i % 2], 0.12, 0.35);
  });
  const [rx, rz] = at(c, HALF + 0.1, 0);
  const pts = Array.from({ length: 6 }, (_, i) => new THREE.Vector3(rx, y0 + BAR_Y - 0.05 - i * 0.18, rz));
  const ribbon = colors.ribbons[Math.abs(Math.round(c.x * 3 + c.z)) % colors.ribbons.length];
  b.strip(pts, 0.06, ribbon, (u) => u * 0.6);
}
