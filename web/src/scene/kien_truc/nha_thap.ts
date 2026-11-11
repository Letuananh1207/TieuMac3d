/** Nhà nhỏ đệ tử (`nha-nho`) và tháp bát giác (`thap`) theo bản mẫu kiến trúc. */
import * as THREE from 'three';
import { lambert } from '../materials';
import type { BuildingSpec } from '../spec';
import { addSign, hk, type Style } from './chi_tiet';
import { box } from './hinh';
import { gableRoof, roofMat } from './mai';

/**
 * Một tầng, nền đá 0,5 m, tường vôi, khung gỗ sẫm lộ, cửa gỗ giữa, hai cửa sổ tròn song chữ thập, mái hai mái.
 * Chiều cao nhân `hk(style)`; cửa sổ tròn, biển giữ cỡ.
 */
export function nhaNho(g: THREE.Group, b: BuildingSpec, style: Style): void {
  const { w, d } = b;
  const k = hk(style);
  const plat = 0.5 * k;
  const wallH = 2.4 * k;
  g.add(box(w + 0.8, plat, d + 0.8, style.base, 0, plat / 2, 0));
  g.add(box(w, wallH, d, style.wall, 0, plat + wallH / 2, 0));
  // khung gỗ: cột góc + xà đầu tường + giằng giữa mặt trước
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) g.add(box(0.22, wallH, 0.22, style.timber, (sx * w) / 2, plat + wallH / 2, (sz * d) / 2));
  }
  const top = plat + wallH - 0.1;
  for (const sz of [-1, 1]) g.add(box(w + 0.1, 0.2, 0.24, style.timber, 0, top, (sz * d) / 2));
  for (const sx of [-1, 1]) g.add(box(0.24, 0.2, d + 0.1, style.timber, (sx * w) / 2, top, 0));
  g.add(box(w, 0.14, 0.2, style.timber, 0, plat + 0.9 * k, d / 2 + 0.02));
  // cửa + hai cửa sổ tròn
  g.add(box(1.1, 1.9 * k, 0.12, style.timber, 0, plat + 0.95 * k, d / 2 + 0.05));
  const winGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 12).rotateX(Math.PI / 2);
  const winMat = lambert(style.timber);
  for (const sx of [-1, 1]) {
    const x = (sx * w) / 4 + sx * 0.2;
    const win = new THREE.Mesh(winGeo, winMat);
    const wy = plat + 1.5 * k;
    win.position.set(x, wy, d / 2 + 0.05);
    g.add(win);
    g.add(box(0.72, 0.06, 0.04, style.wall, x, wy, d / 2 + 0.11));
    g.add(box(0.06, 0.72, 0.04, style.wall, x, wy, d / 2 + 0.11));
  }
  gableRoof(g, { y: plat + wallH, w, d, over: 0.7, h: 1.5 * k, color: b.roofColor, ridgeColor: style.ridge });
  addSign(g, b.title, plat + wallH - 0.25, d / 2 + 0.13, 0.42);
}

/** Bán kính tâm-đỉnh của tầng `i` (mỗi tầng hẹp 0,4 m mỗi bên). */
const floorR = (r0: number, i: number): number => r0 - 0.4 * i;

/**
 * Tháp bát giác: chân đá, mỗi tầng thân vôi + cột son ở góc + vành hiên cong có đầu đao; trên cùng mái nhọn, cột đồng,
 * hồ lô hai bầu. Mặt phẳng của bát giác quay ra trước (+z).
 */
export function thap(g: THREE.Group, b: BuildingSpec, style: Style): void {
  const r0 = Math.min(b.w, b.d) / 2;
  const floors = b.floors ?? 5;
  const k = hk(style);
  const tower = new THREE.Group();
  tower.rotation.y = Math.PI / 8; // three đặt đỉnh bát giác ở +z; quay 22,5° để mặt phẳng nhìn ra trước
  g.add(tower);
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(r0 + 0.8, r0 + 1, 0.6 * k, 8), lambert(style.base));
  plinth.position.y = 0.3 * k;
  tower.add(plinth);
  const wallMat = lambert(style.wall);
  const pillarMat = lambert(style.pillar);
  const roof = roofMat(b.roofColor);
  const tipGeo = new THREE.ConeGeometry(0.14, 0.9, 5);
  const tipMat = lambert(style.ridge);
  let y = 0.6 * k;
  for (let i = 0; i < floors; i++) {
    const r = floorR(r0, i);
    const h = (i === 0 ? 3 : 2.2) * k;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 8), wallMat);
    body.position.y = y + h / 2;
    tower.add(body);
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, h, 5), pillarMat);
      p.position.set(Math.sin(a) * r, y + h / 2, Math.cos(a) * r);
      tower.add(p);
    }
    y += h;
    const eave = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.75, r + 1.1, 0.7 * k, 8, 1, true), roof);
    eave.position.y = y + 0.35 * k;
    tower.add(eave);
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(Math.sin(a) * (r + 1.05), y + 0.15 * k, Math.cos(a) * (r + 1.05));
      tip.rotation.order = 'YXZ';
      tip.rotation.y = a;
      tip.rotation.x = 0.9;
      tower.add(tip);
    }
    y += 0.55 * k;
  }
  const rTop = floorR(r0, floors - 1);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(rTop + 0.4, 1.8 * k, 8), roof);
  cap.position.y = y + 0.9 * k;
  tower.add(cap);
  const bronze = lambert(style.bronze);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6 * k, 5), bronze);
  pole.position.y = y + 2.4 * k;
  tower.add(pole);
  for (const [ry, rr] of [
    [y + 2.1 * k, 0.26],
    [y + 2.55 * k, 0.18],
  ]) {
    const gourd = new THREE.Mesh(new THREE.SphereGeometry(rr, 8, 6), bronze);
    gourd.position.y = ry;
    tower.add(gourd);
  }
  g.add(box(1.1, 2 * k, 0.12, style.timber, 0, 1.6 * k, r0 * Math.cos(Math.PI / 8) + 0.02));
  addSign(g, b.title, 3.6 * k - 0.55, floorR(r0, 0) * Math.cos(Math.PI / 8) + 0.08, 0.7);
}
