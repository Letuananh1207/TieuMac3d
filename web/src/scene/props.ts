import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Style } from './buildings';
import { lambert } from './materials';
import { markDynamic } from './merge';
import type { PropSpec } from './spec';
import type { GroundY } from './terrainHeight';

/** Thứ chuyển động trong cảnh (khói, mây…): gọi mỗi khung hình. */
export type Updater = (dt: number) => void;

const PUFFS = 4;
const SMOKE_RISE = 3.2; // khói bay lên bao cao rồi lặp lại

/** Đài tỉ thí: bục đá tròn hai cấp + 4 cột cờ. Va chạm tròn. */
function daiTiThi(g: THREE.Group, style: Style): number {
  const r = 6;
  const lower = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.3, 0.5, 24), lambert(style.stone));
  lower.position.y = 0.25;
  g.add(lower);
  const upper = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.6, r - 0.4, 0.4, 24), lambert(style.base));
  upper.position.y = 0.7;
  g.add(upper);
  const poleMat = lambert(style.pillar);
  const flagMat = new THREE.MeshBasicMaterial({ color: style.lantern, side: THREE.DoubleSide });
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 6), poleMat);
    pole.position.set(Math.cos(a) * (r - 0.3), 2.5, Math.sin(a) * (r - 0.3));
    g.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), flagMat);
    flag.position.set(pole.position.x + 0.45, 4.1, pole.position.z);
    g.add(flag);
  }
  return r;
}

/** Giá binh khí: khung gỗ 3 m, các cây thương dựng nghiêng. Va chạm hộp 3,2 × 0,8. */
function giaBinhKhi(g: THREE.Group, style: Style): void {
  const wood = lambert(style.pillar);
  for (const s of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.6, 0.15), wood);
    post.position.set(s * 1.5, 0.8, 0);
    g.add(post);
  }
  for (const y of [0.5, 1.4]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 0.12), wood);
    bar.position.y = y;
    g.add(bar);
  }
  const shaft = lambert(style.floor);
  const blade = lambert(style.stone);
  for (let i = 0; i < 6; i++) {
    const x = -1.2 + i * 0.48;
    const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 5), shaft);
    spear.position.set(x, 1.3, -0.15);
    spear.rotation.x = 0.12;
    g.add(spear);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.35, 5), blade);
    tip.position.set(x, 2.68, 0.01);
    tip.rotation.x = 0.12;
    g.add(tip);
  }
}

/** Luống thuốc: bờ đất 4 × 1,6 m; cây thuốc đưa vào `plants` để dựng chung một InstancedMesh. */
function luongThuoc(g: THREE.Group, style: Style, plants: THREE.Vector3[]): void {
  const bed = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, 1.6), lambert(style.floor));
  bed.position.y = 0.15;
  g.add(bed);
  g.updateMatrixWorld(true);
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 2; j++) {
      plants.push(new THREE.Vector3(-1.6 + i * 0.64, 0.5, -0.4 + j * 0.8).applyMatrix4(g.matrixWorld));
    }
  }
}

/** Lò đan đồng: thân tròn, ba chân, nắp; khói mờ bay lên. Va chạm tròn. */
function loDan(g: THREE.Group, style: Style, updaters: Updater[]): number {
  const bronze = lambert(style.bronze);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.7, 1.1, 12), bronze);
  body.position.y = 1.15;
  g.add(body);
  const lid = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.6, 12), bronze);
  lid.position.y = 2;
  g.add(lid);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.7, 6), bronze);
    leg.position.set(Math.cos(a) * 0.55, 0.35, Math.sin(a) * 0.55);
    g.add(leg);
  }
  addSmoke(g, 2.3, 1, style, updaters);
  return 1.1;
}

/** Khói mờ bay lên từ độ cao `y` rồi lặp lại (lò đan, đỉnh hương). `size` = to nhỏ của khói. */
function addSmoke(g: THREE.Group, y: number, size: number, style: Style, updaters: Updater[]): void {
  const puffs: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; t: number }[] = [];
  const puffGeo = new THREE.IcosahedronGeometry(0.35 * size, 0);
  for (let i = 0; i < PUFFS; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: style.smoke, transparent: true, opacity: 0, depthWrite: false });
    const mesh = new THREE.Mesh(puffGeo, mat);
    markDynamic(mesh);
    g.add(mesh);
    puffs.push({ mesh, mat, t: i / PUFFS });
  }
  updaters.push((dt) => {
    for (const p of puffs) {
      p.t = (p.t + dt * 0.25) % 1;
      p.mesh.position.set(Math.sin(p.t * 6) * 0.2 * size, y + p.t * SMOKE_RISE * size, 0);
      p.mesh.scale.setScalar(0.6 + p.t * 1.6);
      p.mat.opacity = 0.45 * Math.sin(p.t * Math.PI); // hiện dần rồi tan
    }
  });
}

/** Đá Thái Hồ: khối đá xám cao gầy, vặn, có vài lỗ sẫm. Va chạm tròn. */
function daThaiHo(g: THREE.Group, style: Style): number {
  const stone = lambert(style.stone);
  const parts: [number, number, number, number][] = [
    [0, 0.7, 0, 0.9],
    [0.25, 1.6, 0.1, 0.7],
    [-0.15, 2.3, -0.05, 0.55],
  ];
  for (const [x, y, z, r] of parts) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), stone);
    m.position.set(x, y, z);
    m.scale.set(1, 1.3, 0.8);
    m.rotation.set(x * 2, y, z * 3);
    g.add(m);
  }
  const holeMat = lambert(style.timber);
  for (const [x, y, z] of [
    [0.35, 0.9, 0.55],
    [-0.3, 1.7, 0.45],
    [0.2, 2.35, 0.35],
  ]) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 4), holeMat);
    h.position.set(x, y, z);
    h.scale.z = 0.4;
    g.add(h);
  }
  return 0.9;
}

/** Đèn đá: chân, trụ, hộp đèn có ô sáng vàng ấm, mái nhỏ, núm. Va chạm tròn. */
function denDa(g: THREE.Group, style: Style): number {
  const stone = lambert(style.stone);
  const add = (geo: THREE.BufferGeometry, y: number, mat: THREE.Material = stone): void => {
    const m = new THREE.Mesh(geo, mat);
    m.position.y = y;
    g.add(m);
  };
  add(new THREE.BoxGeometry(0.8, 0.3, 0.8), 0.15);
  add(new THREE.CylinderGeometry(0.16, 0.2, 0.9, 6), 0.75);
  add(new THREE.BoxGeometry(0.7, 0.15, 0.7), 1.25);
  add(new THREE.BoxGeometry(0.55, 0.5, 0.55), 1.57);
  add(new THREE.BoxGeometry(0.3, 0.3, 0.58), 1.57, new THREE.MeshBasicMaterial({ color: style.gold })); // ô sáng
  add(new THREE.BoxGeometry(0.58, 0.3, 0.3), 1.57, new THREE.MeshBasicMaterial({ color: style.gold }));
  add(new THREE.ConeGeometry(0.62, 0.45, 4).rotateY(Math.PI / 4), 2.05);
  add(new THREE.SphereGeometry(0.1, 6, 4), 2.35);
  return 0.5;
}

/** Đỉnh đồng: thân tròn bụng phình, ba chân, hai quai, khói hương nhẹ. Va chạm tròn. */
function dinhDong(g: THREE.Group, style: Style, updaters: Updater[]): number {
  const bronze = lambert(style.bronze);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 6, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65), bronze);
  body.position.y = 1.35;
  g.add(body);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 10), bronze);
  rim.position.y = 1.78;
  g.add(rim);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.9, 6), bronze);
    leg.position.set(Math.cos(a) * 0.45, 0.45, Math.sin(a) * 0.45);
    g.add(leg);
  }
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 4, 8), bronze);
    ear.position.set(s * 0.5, 1.98, 0);
    g.add(ear);
  }
  addSmoke(g, 1.9, 0.6, style, updaters);
  return 0.85;
}

/** Vật trang trí trong các khu. Trả về hàm cập nhật cho thứ chuyển động (khói lò đan, khói hương). */
export function addProps(scene: THREE.Scene, colliders: Colliders, list: PropSpec[], style: Style, groundY: GroundY = () => 0): Updater {
  const updaters: Updater[] = [];
  const plants: THREE.Vector3[] = [];
  for (const p of list) {
    const rot = p.rotY ?? 0;
    const s = p.scale ?? 1;
    const g = new THREE.Group();
    g.position.set(p.x, groundY(p.x, p.z), p.z);
    g.rotation.y = (rot * Math.PI) / 180;
    g.scale.setScalar(s);
    const box = (w: number, d: number): void => {
      const [ww, dd] = rot % 180 !== 0 ? [d, w] : [w, d];
      colliders.add(p.x, p.z, ww * s, dd * s);
    };
    switch (p.kind) {
      case 'dai-ti-thi':
        colliders.addCircle(p.x, p.z, daiTiThi(g, style) * s);
        break;
      case 'gia-binh-khi':
        giaBinhKhi(g, style);
        box(3.2, 0.8);
        break;
      case 'luong-thuoc':
        luongThuoc(g, style, plants);
        box(4, 1.6);
        break;
      case 'lo-dan':
        colliders.addCircle(p.x, p.z, loDan(g, style, updaters) * s);
        break;
      case 'da-thai-ho':
        colliders.addCircle(p.x, p.z, daThaiHo(g, style) * s);
        break;
      case 'den-da':
        colliders.addCircle(p.x, p.z, denDa(g, style) * s);
        break;
      case 'dinh-dong':
        colliders.addCircle(p.x, p.z, dinhDong(g, style, updaters) * s);
        break;
    }
    scene.add(g);
  }
  if (plants.length) {
    const herbs = new THREE.InstancedMesh(new THREE.ConeGeometry(0.22, 0.5, 5), lambert(style.herb), plants.length);
    const m = new THREE.Matrix4();
    plants.forEach((pos, i) => herbs.setMatrixAt(i, m.makeTranslation(pos.x, pos.y, pos.z)));
    herbs.instanceMatrix.needsUpdate = true;
    herbs.computeBoundingSphere();
    scene.add(herbs);
  }
  return (dt) => {
    for (const u of updaters) u(dt);
  };
}
