/**
 * Cây kiểu Trung Hoa theo bản mẫu `design/source/PhongCach-CayNhanVat.dc.html`: tùng (đám lá mây dẹt xếp tầng),
 * liễu (tán vòm + dải rủ đung đưa), mai (cành gãy khúc + chùm hoa). Mỗi kiểu vài InstancedMesh cho mọi cây.
 */
import * as THREE from 'three';
import { lambert } from './materials';
import type { Updater } from './props';
import { seededRandom } from './random';
import type { SceneSpec } from './spec';
import { finish, type Placed } from './trees';

type Trees = SceneSpec['trees'];
const UP = new THREE.Vector3(0, 1, 0);
const unitCyl = new THREE.CylinderGeometry(0.7, 1, 1, 6); // cao 1, kéo theo đoạn cành
const discGeo = new THREE.CylinderGeometry(1, 1, 1, 7);

/** Ma trận cho một đoạn hình trụ từ `from` theo hướng `dir` (đã chuẩn hoá) dài `len`, bán kính `r`. */
function segment(m: THREE.Matrix4, from: THREE.Vector3, dir: THREE.Vector3, len: number, r: number): THREE.Matrix4 {
  const q = new THREE.Quaternion().setFromUnitVectors(UP, dir);
  const pos = from.clone().addScaledVector(dir, len / 2);
  return m.compose(pos, q, new THREE.Vector3(r, len, r));
}

/** Tùng: thân cong hai khúc, 4 đám lá dẹt so le, mặt trên mỗi đám sáng hơn. */
export function addPine(scene: THREE.Scene, spec: Trees, list: Placed[], seed: number): void {
  if (!list.length) return;
  const rand = seededRandom(seed * 4099 + 11);
  const CLOUDS = 4;
  const trunk = new THREE.InstancedMesh(unitCyl, lambert(spec.trunk), list.length * 2);
  const clouds = new THREE.InstancedMesh(discGeo, lambert(spec.leaves[0]), list.length * CLOUDS);
  const caps = new THREE.InstancedMesh(discGeo, lambert(spec.leaves[2]), list.length * CLOUDS);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  list.forEach((t, i) => {
    const s = t.scale;
    const base = new THREE.Vector3(t.x, 0, t.z);
    const lean = rand() * Math.PI * 2;
    const d1 = new THREE.Vector3(Math.cos(lean) * 0.35, 1, Math.sin(lean) * 0.35).normalize();
    const d2 = new THREE.Vector3(-Math.cos(lean) * 0.45, 1, -Math.sin(lean) * 0.45).normalize();
    trunk.setMatrixAt(i * 2, segment(m, base, d1, 2.2 * s, 0.3 * s));
    const mid = base.clone().addScaledVector(d1, 2.2 * s);
    trunk.setMatrixAt(i * 2 + 1, segment(m, mid, d2, 1.8 * s, 0.2 * s));
    const top = mid.clone().addScaledVector(d2, 1.8 * s);
    for (let k = 0; k < CLOUDS; k++) {
      const side = k % 2 === 0 ? 1 : -1;
      const a = lean + side * 1.2 + (rand() - 0.5) * 0.6;
      const off = (0.9 - k * 0.15) * s;
      const y = (2.1 + k * 0.75) * s;
      const r = (1.6 - k * 0.25 + rand() * 0.3) * s;
      const cx = (k === CLOUDS - 1 ? top.x : t.x + Math.cos(a) * off);
      const cz = (k === CLOUDS - 1 ? top.z : t.z + Math.sin(a) * off);
      q.setFromAxisAngle(UP, rand() * Math.PI);
      clouds.setMatrixAt(i * CLOUDS + k, m.compose(new THREE.Vector3(cx, y, cz), q, new THREE.Vector3(r, 0.42 * s, r)));
      caps.setMatrixAt(i * CLOUDS + k, m.compose(new THREE.Vector3(cx, y + 0.22 * s, cz), q, new THREE.Vector3(r * 0.86, 0.1 * s, r * 0.86)));
    }
  });
  finish(scene, [trunk, clouds, caps]);
}

/** Mai: thân thấp, 4 cành gãy khúc (2 khúc mỗi cành), không lá; chùm hoa hai màu ở dọc / đầu cành. */
export function addPlum(scene: THREE.Scene, spec: Trees, list: Placed[], seed: number): void {
  if (!list.length) return;
  const rand = seededRandom(seed * 6151 + 17);
  const BR = 4;
  const PER = 8; // hoa mỗi màu mỗi cây
  const wood = new THREE.InstancedMesh(unitCyl, lambert(spec.plum[0]), list.length * (1 + BR * 2));
  const flowerGeo = new THREE.IcosahedronGeometry(0.17, 0);
  const deep = new THREE.InstancedMesh(flowerGeo, lambert(spec.plum[1]), list.length * PER);
  const pale = new THREE.InstancedMesh(flowerGeo, lambert(spec.plum[2]), list.length * PER);
  const m = new THREE.Matrix4();
  let w = 0;
  let fd = 0;
  let fp = 0;
  for (const t of list) {
    const s = t.scale;
    const base = new THREE.Vector3(t.x, 0, t.z);
    wood.setMatrixAt(w++, segment(m, base, UP, 1.4 * s, 0.14 * s));
    const fork = new THREE.Vector3(t.x, 1.4 * s, t.z);
    const tips: THREE.Vector3[] = [];
    for (let b = 0; b < BR; b++) {
      const a = (b / BR) * Math.PI * 2 + rand();
      const d1 = new THREE.Vector3(Math.cos(a) * 0.8, 0.9, Math.sin(a) * 0.8).normalize();
      const l1 = (0.9 + rand() * 0.5) * s;
      wood.setMatrixAt(w++, segment(m, fork, d1, l1, 0.07 * s));
      const knee = fork.clone().addScaledVector(d1, l1);
      const d2 = new THREE.Vector3(Math.cos(a + 0.9) * 0.6, 1, Math.sin(a + 0.9) * 0.6).normalize(); // gãy khúc
      const l2 = (0.7 + rand() * 0.4) * s;
      wood.setMatrixAt(w++, segment(m, knee, d2, l2, 0.045 * s));
      tips.push(knee, knee.clone().addScaledVector(d2, l2));
    }
    for (let k = 0; k < PER * 2; k++) {
      const p = tips[k % tips.length].clone().add(new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.45 * s));
      m.makeTranslation(p.x, p.y, p.z).scale(new THREE.Vector3(s, s, s));
      if (k % 2 === 0) deep.setMatrixAt(fd++, m);
      else pale.setMatrixAt(fp++, m);
    }
  }
  finish(scene, [wood, deep, pale]);
}

/** Liễu: thân, tán vòm dẹt, dải lá rủ quanh mép tán đung đưa nhẹ (trả về hàm cập nhật). */
export function addWillow(scene: THREE.Scene, spec: Trees, list: Placed[], seed: number): Updater {
  if (!list.length) return () => {};
  const rand = seededRandom(seed * 8191 + 23);
  const STRANDS = 12;
  const trunk = new THREE.InstancedMesh(unitCyl, lambert(spec.trunk), list.length);
  const crown = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
    lambert(spec.willow[0]),
    list.length,
  );
  const strandGeo = new THREE.BoxGeometry(0.14, 1, 0.04).translate(0, -0.5, 0); // gốc ở đầu trên để đung đưa
  const strands = new THREE.InstancedMesh(strandGeo, lambert(spec.willow[1], { side: THREE.DoubleSide }), list.length * STRANDS);
  const m = new THREE.Matrix4();
  const hangs: { pos: THREE.Vector3; yaw: number; len: number; phase: number; s: number }[] = [];
  list.forEach((t, i) => {
    const s = t.scale;
    trunk.setMatrixAt(i, segment(m, new THREE.Vector3(t.x, 0, t.z), UP, 2.6 * s, 0.26 * s));
    crown.setMatrixAt(i, m.compose(new THREE.Vector3(t.x, 2.5 * s, t.z), new THREE.Quaternion(), new THREE.Vector3(2 * s, 1.3 * s, 2 * s)));
    for (let k = 0; k < STRANDS; k++) {
      const a = (k / STRANDS) * Math.PI * 2 + rand() * 0.3;
      const r = (1.75 + rand() * 0.2) * s;
      hangs.push({
        pos: new THREE.Vector3(t.x + Math.cos(a) * r, 2.6 * s, t.z + Math.sin(a) * r),
        yaw: -a,
        len: (1.8 + rand() * 0.8) * s,
        phase: rand() * Math.PI * 2,
        s,
      });
    }
  });
  const q = new THREE.Quaternion();
  const e = new THREE.Euler(0, 0, 0, 'YXZ');
  const size = new THREE.Vector3();
  let time = 0;
  const place = (): void => {
    hangs.forEach((h, i) => {
      q.setFromEuler(e.set(Math.sin(time * 1.3 + h.phase) * 0.12, h.yaw, 0));
      strands.setMatrixAt(i, m.compose(h.pos, q, size.set(h.s, h.len, h.s)));
    });
    strands.instanceMatrix.needsUpdate = true;
  };
  place();
  finish(scene, [trunk, crown, strands]);
  return (dt) => {
    time += dt;
    place();
  };
}
