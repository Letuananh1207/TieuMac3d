import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { lambert } from './materials';
import type { BuildingSpec, SceneSpec } from './spec';
import { signTex } from './textures';

export type Style = SceneSpec['buildingStyle'];

export interface RoofOpts {
  /** độ cao mép mái (tấm diềm) */
  y: number;
  w: number;
  d: number;
  /** độ vươn của mái ra ngoài tường (x, z) */
  over: [number, number];
  height: number;
  color: string;
  curved: boolean;
  /**
   * Dáng mái của prototype: xoay 45° SAU khi kéo giãn nên nhìn từ trên thấy mái xiên hình thoi, lệch khỏi nhà.
   * Chỉ giảng đường dùng (giữ cảnh cũ y nguyên); kiểu nhà mới dùng mái thẳng với tường.
   */
  legacy?: boolean;
}

// chóp 4 cạnh đã xoay sẵn 45°: 4 góc đáy nằm ở (±0,707; ±0,707) nên kéo giãn ra đúng hình chữ nhật
const squareRoofGeo = new THREE.ConeGeometry(1, 1, 4).rotateY(Math.PI / 4);

/**
 * Mái chảy: chóp 4 cạnh kéo giãn + tấm diềm + bờ nóc. `curved` = mái cong đầu đao: thêm 4 mũi cong vểnh lên ở góc.
 * Giảng đường dùng đúng số cũ (y 3,65, vươn 1,6 / 1,4, cao 2,6).
 */
export function addRoof(g: THREE.Group, o: RoofOpts, style: Style): void {
  const [ox, oz] = o.over;
  const roof = new THREE.Mesh(o.legacy ? new THREE.ConeGeometry(1, 1, 4) : squareRoofGeo, lambert(o.color));
  if (o.legacy) roof.rotation.y = Math.PI / 4;
  roof.scale.set((o.w / 2 + ox) / 0.707, o.height, (o.d / 2 + oz) / 0.707);
  roof.position.y = o.y + o.height / 2;
  g.add(roof);
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(o.w * 0.45, 0.25, 0.3), lambert(style.ridge));
  ridge.position.y = o.y + o.height - 0.05;
  g.add(ridge);
  const eave = new THREE.Mesh(new THREE.BoxGeometry(o.w + 2 * ox - 0.2, 0.2, o.d + 2 * oz - 0.2), lambert(style.eave));
  eave.position.y = o.y;
  g.add(eave);
  if (!o.curved) return;
  // đầu đao: khối chóp nhỏ nằm theo đường chéo góc, vểnh lên ~40°
  const tipGeo = new THREE.ConeGeometry(0.22, 1.4, 5);
  const tipMat = lambert(style.ridge);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(sx * (o.w / 2 + ox - 0.1), o.y + 0.35, sz * (o.d / 2 + oz - 0.1));
      tip.rotation.order = 'YXZ';
      tip.rotation.y = Math.atan2(sx, sz);
      tip.rotation.x = 0.85; // ngả ra ngoài theo hướng góc, mũi chĩa lên
      g.add(tip);
    }
  }
}

export function addSign(g: THREE.Group, title: string, y: number, z: number, scale = 1): void {
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8 * scale, 0.9 * scale),
    new THREE.MeshBasicMaterial({ map: signTex(title) }),
  );
  sign.position.set(0, y, z);
  g.add(sign);
}

function addLanterns(g: THREE.Group, xs: number[], y: number, z: number, style: Style): void {
  const mat = new THREE.MeshBasicMaterial({ color: style.lantern });
  for (const x of xs) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), mat);
    l.scale.y = 1.3;
    l.position.set(x, y, z);
    g.add(l);
  }
}

/** Hàng cột trước + sau dọc chiều rộng, khoảng 2,6 m một cột. */
function addPillars(g: THREE.Group, w: number, d: number, h: number, baseY: number, style: Style): void {
  const mat = lambert(style.pillar);
  const geo = new THREE.CylinderGeometry(0.16, 0.18, h, 8);
  const cols = Math.max(1, Math.round(w / 2.6));
  for (let i = 0; i <= cols; i++) {
    for (const zz of [-d / 2 + 0.3, d / 2 - 0.3]) {
      const p = new THREE.Mesh(geo, mat);
      p.position.set(-w / 2 + 0.3 + (i * (w - 0.6)) / cols, baseY + h / 2, zz);
      g.add(p);
    }
  }
}

function box(w: number, h: number, d: number, color: string, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lambert(color));
  m.position.set(x, y, z);
  return m;
}

/** Giảng đường kiểu mái chảy: nền đá, cột gỗ, tường hậu, biển hiệu, đèn lồng (hình như bản gốc). */
function giangDuong(g: THREE.Group, b: BuildingSpec, style: Style): void {
  const { w, d } = b;
  g.add(box(w + 1, 0.5, d + 1, style.base, 0, 0.25, 0));
  g.add(box(w, 0.12, d, style.floor, 0, 0.56, 0));
  g.add(box(w - 0.4, 2.6, 0.25, style.wall, 0, 1.9, -d / 2 + 0.3));
  addPillars(g, w, d, 3.1, 0.55, style);
  addRoof(
    g,
    { y: 3.65, w, d, over: [1.6, 1.4], height: 2.6, color: b.roofColor, curved: b.roof === 'cong', legacy: true },
    style,
  );
  addSign(g, b.title, 3.15, d / 2 + 0.05);
  addLanterns(g, [-w / 2 + 0.3, w / 2 - 0.3], 3.0, d / 2 + 0.1, style);
}

/** Điện lớn: nền đá hai cấp, tường ba mặt + cửa giữa, mái hai tầng (tầng trên nhỏ hơn). */
function dien(g: THREE.Group, b: BuildingSpec, style: Style): void {
  const { w, d } = b;
  g.add(box(w + 2, 0.5, d + 2, style.stone, 0, 0.25, 0));
  g.add(box(w + 1, 0.4, d + 1, style.base, 0, 0.7, 0));
  g.add(box(w, 0.12, d, style.floor, 0, 0.96, 0));
  const wallH = 3.6;
  g.add(box(w - 0.4, wallH, 0.3, style.wall, 0, 1 + wallH / 2, -d / 2 + 0.4));
  for (const s of [-1, 1]) g.add(box(0.3, wallH, d - 0.8, style.wall, s * (w / 2 - 0.4), 1 + wallH / 2, 0));
  // mặt trước: hai mảng tường hai bên, chừa cửa 1/3 ở giữa
  const side = w / 3;
  for (const s of [-1, 1]) g.add(box(side - 0.4, wallH, 0.3, style.wall, s * (w / 2 - side / 2), 1 + wallH / 2, d / 2 - 0.6));
  addPillars(g, w, d, wallH + 0.5, 1, style);
  const y1 = 1 + wallH + 0.5;
  addRoof(g, { y: y1, w, d, over: [1.8, 1.6], height: 2.2, color: b.roofColor, curved: b.roof === 'cong' }, style);
  // tầng mái trên: thân nhỏ + mái nhỏ
  const w2 = w * 0.6;
  const d2 = d * 0.6;
  g.add(box(w2, 1.4, d2, style.wall, 0, y1 + 1.6, 0));
  addRoof(g, { y: y1 + 2.3, w: w2, d: d2, over: [1.4, 1.2], height: 2.2, color: b.roofColor, curved: b.roof === 'cong' }, style);
  addSign(g, b.title, y1 - 0.9, d / 2 + 0.05, 1.2);
  addLanterns(g, [-w / 2 + 0.3, w / 2 - 0.3], y1 - 1, d / 2 + 0.1, style);
}

/** Tháp nhiều tầng: thân vuông nhỏ dần, mỗi tầng một mái, trên đỉnh có chóp nhọn. */
function thap(g: THREE.Group, b: BuildingSpec, style: Style): void {
  const size = Math.min(b.w, b.d);
  const floors = b.floors ?? 5;
  g.add(box(size + 1.5, 0.6, size + 1.5, style.stone, 0, 0.3, 0));
  let y = 0.6;
  for (let i = 0; i < floors; i++) {
    const s = size * (1 - (i / floors) * 0.45);
    const h = i === 0 ? 3 : 2.2;
    g.add(box(s, h, s, style.wall, 0, y + h / 2, 0));
    y += h;
    addRoof(g, { y, w: s, d: s, over: [0.9, 0.9], height: 0.9, color: b.roofColor, curved: b.roof !== 'chop' }, style);
    y += 0.6;
  }
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.25, 2.2, 6), lambert(style.bronze));
  spire.position.y = y + 1.1;
  g.add(spire);
  addSign(g, b.title, 2.4, size / 2 + 0.05, 0.8);
}

/** Nhà nhỏ đệ tử: nền thấp, thân kín, cửa, mái chóp nhỏ. */
function nhaNho(g: THREE.Group, b: BuildingSpec, style: Style): void {
  const { w, d } = b;
  g.add(box(w + 0.6, 0.3, d + 0.6, style.base, 0, 0.15, 0));
  g.add(box(w, 2.4, d, style.wall, 0, 1.5, 0));
  g.add(box(1.1, 1.9, 0.08, style.pillar, 0, 1.25, d / 2 + 0.03));
  addRoof(g, { y: 2.7, w, d, over: [0.8, 0.7], height: 1.6, color: b.roofColor, curved: b.roof === 'cong' }, style);
  addSign(g, b.title, 2.35, d / 2 + 0.05, 0.5);
}

const KINDS = { 'giang-duong': giangDuong, dien, thap, 'nha-nho': nhaNho } as const;

/** Dựng một nhà theo `kind` (mặc định giảng đường). Va chạm = nền nhà (rộng + 1 × sâu + 1). */
export function addBuilding(scene: THREE.Scene, colliders: Colliders, b: BuildingSpec, style: Style): THREE.Group {
  const rot = b.rotY ?? 0;
  const g = new THREE.Group();
  g.position.set(b.x, 0, b.z);
  g.rotation.y = (rot * Math.PI) / 180;
  KINDS[b.kind ?? 'giang-duong'](g, b, style);
  if (b.notice) {
    const n = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 0.75),
      new THREE.MeshBasicMaterial({ map: signTex(b.notice[0], b.notice[1], { paper: true }) }),
    );
    n.position.set(-b.w / 2 + 1.4, 1.7, b.d / 2 - 0.1);
    n.rotation.y = 0.15;
    g.add(n);
  }
  scene.add(g);
  const [w, d] = b.kind === 'thap' ? [Math.min(b.w, b.d) + 1.5, Math.min(b.w, b.d) + 1.5] : [b.w + 1, b.d + 1];
  // quay 90 / 270 thì hộp va chạm đổi rộng ↔ sâu
  if (rot % 180 !== 0) colliders.add(b.x, b.z, d, w);
  else colliders.add(b.x, b.z, w, d);
  return g;
}
