import * as THREE from 'three';
import { lambert } from '../materials';
import type { BuildingSpec } from '../spec';
import type { Style } from './chi_tiet';

/**
 * Đình nghỉ chân ở Rừng trúc (docs/tham_khao/rung-truc.md "Đình"): nền đá thấp, 4 / 6 cột gỗ mộc, mái chóp toản tiêm
 * (攢尖) ngói xám xanh hơi vểnh góc, chỏm gỗ; KHÔNG tường — đi vào được. Mộc mạc: không son, không ngói vàng (khác cấp
 * tông môn). Mặt bằng nội tiếp hình tròn đường kính min(w, d). Va chạm: chỉ chân cột (`dinhPillars`, buildings.ts).
 */

/** Toạ độ cột (trong hệ của đình, trước khi xoay) + bán kính cột — dùng cho va chạm. */
export function dinhPillars(b: Pick<BuildingSpec, 'w' | 'd' | 'sides'>): { x: number; z: number; r: number }[] {
  const n = b.sides === 6 ? 6 : 4;
  const R = Math.min(b.w, b.d) / 2 - 0.45;
  // 4 cột: đặt ở góc (lệch 45°) cho lối vào giữa cạnh; 6 cột: một cạnh quay về +z
  const a0 = n === 4 ? Math.PI / 4 : Math.PI / 6;
  return Array.from({ length: n }, (_, i) => {
    const a = a0 + (i * 2 * Math.PI) / n;
    return { x: Math.cos(a) * R, z: Math.sin(a) * R, r: 0.16 };
  });
}

export function dinh(g: THREE.Group, b: BuildingSpec, style: Style): void {
  const n = b.sides === 6 ? 6 : 4;
  const k = Math.min(3, Math.max(0.5, style.heightScale));
  const D = Math.min(b.w, b.d);
  const baseH = 0.3;
  const colH = 2.6 * k;
  const stone = lambert(style.stone);
  const wood = lambert(style.pillar);
  const roofMat = lambert(b.roofColor, { flatShading: true });
  const ridge = lambert(style.ridge);

  // nền đá: lăng trụ n cạnh (thấp — bước lên được, không cần bậc)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(D / 2, D / 2 + 0.15, baseH, n, 1, false, n === 4 ? Math.PI / 4 : 0), stone);
  base.position.y = baseH / 2;
  g.add(base);

  // cột + xà vòng
  const pillars = dinhPillars(b);
  for (const p of pillars) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, colH, 8), wood);
    c.position.set(p.x, baseH + colH / 2, p.z);
    g.add(c);
  }
  for (let i = 0; i < pillars.length; i++) {
    const a = pillars[i];
    const c = pillars[(i + 1) % pillars.length];
    const len = Math.hypot(c.x - a.x, c.z - a.z);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(len + 0.2, 0.18, 0.16), wood);
    beam.position.set((a.x + c.x) / 2, baseH + colH - 0.12, (a.z + c.z) / 2);
    beam.rotation.y = -Math.atan2(c.z - a.z, c.x - a.x);
    g.add(beam);
    // lan can thấp giữa các cột, chừa cạnh trước (+z) và cạnh sau làm lối vào
    const mz = (a.z + c.z) / 2;
    if (Math.abs(mz) > Math.abs((a.x + c.x) / 2) && n === 4) continue;
    if (n === 6 && Math.abs(mz) > D * 0.3) continue;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(len - 0.3, 0.1, 0.1), wood);
    rail.position.set((a.x + c.x) / 2, baseH + 0.55, mz);
    rail.rotation.y = beam.rotation.y;
    g.add(rail);
  }

  // mái chóp: hình chóp n cạnh, đáy vươn ra ngoài cột, vểnh nhẹ ở góc (đẩy đỉnh góc lên)
  const eave = D / 2 + 0.9;
  const roofH = D * 0.42 * k;
  const roofGeo = new THREE.ConeGeometry(eave, roofH, n, 3, true, n === 4 ? Math.PI / 4 : 0);
  const pos = roofGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < -roofH / 2 + 0.01) pos.setY(i, y + 0.28); // mép mái vểnh
    else if (y < 0) pos.setY(i, y - 0.08 * k); // võng nhẹ giữa sườn mái
  }
  roofGeo.computeVertexNormals();
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = baseH + colH + roofH / 2 - 0.05;
  g.add(roof);
  const under = new THREE.Mesh(new THREE.CylinderGeometry(eave * 0.92, eave * 0.92, 0.08, n, 1, false, n === 4 ? Math.PI / 4 : 0), wood);
  under.position.y = baseH + colH + 0.05;
  g.add(under);
  // chỏm: bầu gỗ + mũi
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), ridge);
  knob.position.y = baseH + colH + roofH + 0.05;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.45, 6), ridge);
  tip.position.y = knob.position.y + 0.3;
  g.add(knob, tip);
}
