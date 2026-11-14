/**
 * Vật biên ải (Trường Thành — hồ sơ `docs/tham_khao/truong-thanh.md`): địch lâu 敵樓 vuông, cổng quan thành 關城 (đài
 * gạch cửa vòm + lầu hiên kép), phong hoả đài 烽火台 có lò khói, lều lính, soái trướng mở mặt trước, lửa trại + đôn,
 * ngựa cúi gặm, tường đề thơ 詩壁. Gạch xám xanh (không nâu đỏ).
 */
import * as THREE from 'three';
import type { Style } from './buildings';
import { lambert } from './materials';
import { markDynamic } from './merge';
import { signMesh } from './signAtlas';
import { drawStoneSign } from './textures';
import type { PropCollide } from './vat_truc';

type Updater = (dt: number) => void;

const BRICK = '#6a6e69';
const BRICK_DARK = '#5a5e59';
const CAP = '#8a8a82';
const DARK = '#24282a';
const TENT = '#d8cfb8';
const TENT_TRIM = '#7a3a2a';

function put(g: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  g.add(m);
  return m;
}

/** Răng cưa quanh mép trên một khối vuông cạnh `s` ở độ cao `y`. */
function crenels(g: THREE.Object3D, s: number, y: number, color = BRICK): void {
  const mat = lambert(color);
  const n = Math.max(3, Math.round(s / 2));
  const geo = new THREE.BoxGeometry(s / n - 0.5, 1.1, 0.5);
  for (let i = 0; i < n; i++) {
    const t = -s / 2 + (i + 0.5) * (s / n);
    for (const [x, z, r] of [[t, s / 2 - 0.25, 0], [t, -s / 2 + 0.25, 0], [s / 2 - 0.25, t, 1], [-s / 2 + 0.25, t, 1]] as const) {
      const m = put(g, geo, mat, x, y + 0.55, z);
      if (r) m.rotation.y = Math.PI / 2;
    }
  }
}

/** Cửa vòm tối trên mặt +z của khối (tâm x, đáy y). */
function archHole(g: THREE.Object3D, x: number, y: number, z: number, w: number, h: number, ry = 0): void {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(-w / 2, h - w / 2);
  s.absarc(0, h - w / 2, w / 2, Math.PI, 0, true);
  s.lineTo(w / 2, 0);
  s.closePath();
  const m = put(g, new THREE.ShapeGeometry(s, 6), new THREE.MeshBasicMaterial({ color: DARK }), x, y, z);
  m.rotation.y = ry;
}

/** Địch lâu 9 × 9 m, cao 13 m (mặt tường 6 + 7): thân gạch, 3 cửa vòm mỗi mặt ở tầng trên, răng cưa nóc, phô phòng gỗ. */
function dichLau(g: THREE.Group, style: Style): PropCollide {
  const s = 9;
  put(g, new THREE.BoxGeometry(s, 13, s), lambert(BRICK), 0, 6.5, 0);
  put(g, new THREE.BoxGeometry(s + 0.3, 0.3, s + 0.3), lambert(CAP), 0, 6.1, 0);
  for (const [ry, dx, dz] of [[0, 0, 1], [Math.PI, 0, -1], [Math.PI / 2, 1, 0], [-Math.PI / 2, -1, 0]] as const) {
    for (const k of [-2.6, 0, 2.6]) {
      const ox = dz !== 0 ? k : dx * (s / 2 + 0.02);
      const oz = dz !== 0 ? dz * (s / 2 + 0.02) : k;
      archHole(g, ox, 7.6, oz, 1.2, 2.4, ry);
    }
  }
  crenels(g, s, 13);
  // phô phòng 鋪房: chòi gỗ mái ngói xám
  put(g, new THREE.BoxGeometry(4, 2.6, 4), lambert(style.timber), 0, 14.3, 0);
  put(g, new THREE.ConeGeometry(3.4, 1.4, 4).rotateY(Math.PI / 4), lambert('#4a4a46'), 0, 16.3, 0);
  return { box: [s, s] };
}

/**
 * Cổng quan thành: đài gạch 14 × 10 m cao 8 m, cửa vòm xuyên 4,5 × 5,5 m (dọc z), lầu cổng hiên kép trên đài, biển
 * `text`. Va chạm: hai khối đài hai bên lối (lối đi giữa thông).
 */
/** Bảng màu gạch xám (Trường Thành) / đất nện (Dương Quan — Con đường tơ lụa). */
const GACH = { body: BRICK, cap: CAP, hall: '#7a2e24', roof: '#4a4a46' };
const DAT = { body: '#b9946a', cap: '#94714c', hall: '#8a5a3a', roof: '#6a5a44' };

function quanThanh(g: THREE.Group, text: string, pal = GACH): PropCollide {
  const W = 14;
  const D = 10;
  const H = 8;
  const o = 2.25; // nửa lối
  const brick = lambert(pal.body);
  for (const s of [-1, 1]) put(g, new THREE.BoxGeometry(W / 2 - o, H, D), brick, s * (o + (W / 2 - o) / 2), H / 2, 0);
  // vòm trên lối
  const shape = new THREE.Shape();
  shape.moveTo(-o, 3.25);
  shape.absarc(0, 3.25, o, Math.PI, 0, true);
  shape.lineTo(o, H);
  shape.lineTo(-o, H);
  shape.closePath();
  put(g, new THREE.ExtrudeGeometry(shape, { depth: D, bevelEnabled: false, curveSegments: 10 }).translate(0, 0, -D / 2), brick, 0, 0, 0);
  put(g, new THREE.BoxGeometry(W + 0.4, 0.4, D + 0.4), lambert(pal.cap), 0, H + 0.2, 0);
  crenels(g, W, H + 0.4, pal.body);
  // lầu cổng 2 tầng mái
  const red = lambert(pal.hall);
  put(g, new THREE.BoxGeometry(10, 3.4, 6), red, 0, H + 2.1, 0);
  put(g, new THREE.ConeGeometry(8.4, 1.6, 4).rotateY(Math.PI / 4).scale(1, 1, 0.65), lambert(pal.roof), 0, H + 4.6, 0);
  put(g, new THREE.BoxGeometry(7, 2.2, 4.2), red, 0, H + 6.3, 0);
  put(g, new THREE.ConeGeometry(6.2, 1.8, 4).rotateY(Math.PI / 4).scale(1, 1, 0.62), lambert(pal.roof), 0, H + 8.2, 0);
  const sign = signMesh(3.2, 1, 256, 80, (c, pw, ph) => drawStoneSign(c, pw, ph, text, '#3a2a20'));
  sign.position.set(0, H - 1.4, D / 2 + 0.03);
  g.add(sign);
  return {
    boxes: [
      [-(o + (W / 2 - o) / 2), 0, W / 2 - o, D],
      [o + (W / 2 - o) / 2, 0, W / 2 - o, D],
    ],
  };
}

/** Khói cột thẳng (phong hoả / lửa trại): vài cục mờ bay lên lặp lại. */
function smoke(g: THREE.Object3D, y: number, size: number, color: string, updaters: Updater[], rise = 4): void {
  const geo = new THREE.IcosahedronGeometry(0.4 * size, 0);
  const puffs = Array.from({ length: 4 }, (_, i) => {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false });
    const m = new THREE.Mesh(geo, mat);
    markDynamic(m);
    g.add(m);
    return { m, mat, t: i / 4 };
  });
  updaters.push((dt) => {
    for (const p of puffs) {
      p.t = (p.t + dt * 0.2) % 1;
      p.m.position.set(Math.sin(p.t * 5) * 0.3 * size, y + p.t * rise * size, 0);
      p.m.scale.setScalar(0.7 + p.t * 1.8);
      p.mat.opacity = 0.5 * Math.sin(p.t * Math.PI);
    }
  });
}

/** Phong hoả đài: tháp gạch chóp cụt 6 → 4,5 m, cao 8 m, lan can răng cưa, lò khói trên nóc (khói đen xám). */
function phongHoa(g: THREE.Group, updaters: Updater[], color = BRICK_DARK): PropCollide {
  put(g, new THREE.CylinderGeometry(4.5 / Math.SQRT2, 6 / Math.SQRT2, 8, 4).rotateY(Math.PI / 4), lambert(color), 0, 4, 0);
  crenels(g, 4.5, 8, color);
  put(g, new THREE.CylinderGeometry(0.6, 0.8, 1, 6), lambert(DARK), 0, 8.5, 0);
  smoke(g, 9.2, 1.6, '#5a5a5a', updaters, 5);
  return { box: [6, 6] };
}

/** Lều lính 4 × 4 × 3 m: chóp vải ngà viền đỏ, cửa tối. */
function leu(g: THREE.Group): PropCollide {
  put(g, new THREE.ConeGeometry(2.8, 3, 4).rotateY(Math.PI / 4), lambert(TENT), 0, 1.5, 0);
  put(g, new THREE.CylinderGeometry(0.06, 0.06, 0.8, 4), lambert(TENT_TRIM), 0, 3.3, 0);
  put(g, new THREE.PlaneGeometry(1, 1.4), new THREE.MeshBasicMaterial({ color: DARK }), 0, 0.7, 1.42);
  return { box: [3.8, 3.8] };
}

/** Soái trướng 8 × 6 × 4 m mở mặt trước (+z): vách vải ba mặt, mái hai dốc, bàn sa bàn giữa. Va chạm: ba vách. */
function soaiTruong(g: THREE.Group, style: Style): PropCollide {
  const cloth = lambert(TENT, { side: THREE.DoubleSide });
  put(g, new THREE.BoxGeometry(8, 3, 0.1), cloth, 0, 1.5, -3);
  for (const s of [-1, 1]) put(g, new THREE.BoxGeometry(0.1, 3, 6), cloth, s * 4, 1.5, 0);
  for (const s of [-1, 1]) {
    const r = put(g, new THREE.BoxGeometry(8.4, 0.1, 3.6), lambert(TENT_TRIM, { side: THREE.DoubleSide }), 0, 3.6, s * 1.55);
    r.rotation.x = s * 0.45;
  }
  for (const s of [-1, 1]) put(g, new THREE.CylinderGeometry(0.08, 0.08, 4.2, 5), lambert(style.timber), s * 4, 2.1, 3);
  // sa bàn 沙盤: bàn 3 × 2 m, mặt cát có gò
  put(g, new THREE.BoxGeometry(3, 0.8, 2), lambert(style.timber), 0, 0.4, -0.5);
  put(g, new THREE.BoxGeometry(2.8, 0.06, 1.8), lambert('#c8b27a'), 0, 0.83, -0.5);
  for (const [x, z, r] of [[-0.8, -0.8, 0.35], [0.5, -0.3, 0.25], [0.9, -1, 0.3]] as const) put(g, new THREE.ConeGeometry(r, 0.3, 5), lambert('#9a8a5a'), x, 1, z);
  return {
    boxes: [
      [0, -3, 8, 0.3],
      [-4, 0, 0.3, 6],
      [4, 0, 0.3, 6],
      [0, -0.5, 3, 2],
    ],
  };
}

/** Lửa trại: củi xếp, lửa (nón cam tự sáng, lập loè), khói nhẹ, 6 đôn gỗ quanh ∅ 6 m. Va chạm: lửa + đôn. */
function luaTrai(g: THREE.Group, style: Style, updaters: Updater[]): PropCollide {
  const log = lambert('#5a3a24');
  for (let i = 0; i < 4; i++) {
    const m = put(g, new THREE.CylinderGeometry(0.1, 0.1, 1.4, 5), log, 0, 0.15, 0);
    m.rotation.set(Math.PI / 2, 0, (i * Math.PI) / 4);
  }
  const fire = put(g, new THREE.ConeGeometry(0.5, 1.2, 6), new THREE.MeshBasicMaterial({ color: '#f2a03a' }), 0, 0.8, 0);
  const core = put(g, new THREE.ConeGeometry(0.28, 0.8, 6), new THREE.MeshBasicMaterial({ color: '#ffe08a' }), 0, 0.6, 0);
  markDynamic(fire);
  markDynamic(core);
  let t = 0;
  updaters.push((dt) => {
    t += dt;
    fire.scale.set(1 + Math.sin(t * 9) * 0.08, 1 + Math.sin(t * 7.3) * 0.15, 1 + Math.cos(t * 8) * 0.08);
    core.scale.y = 1 + Math.sin(t * 11) * 0.2;
  });
  smoke(g, 1.6, 0.8, '#bdb8ae', updaters, 4);
  const stool = new THREE.CylinderGeometry(0.3, 0.32, 0.45, 8);
  const posts: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    put(g, stool, lambert(style.timber), Math.cos(a) * 3, 0.22, Math.sin(a) * 3);
    posts.push([Math.cos(a) * 3, Math.sin(a) * 3]);
  }
  return { circle: 0.9, posts };
}

/** Ngựa nâu đứng, cổ cúi gặm rồi ngẩng (như lạc đà). Va chạm hộp. */
function ngua(g: THREE.Group, seed: number, updaters: Updater[]): PropCollide {
  const coat = lambert('#7a4a2a');
  const mane = lambert('#2a1e18');
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]] as const) put(g, new THREE.CylinderGeometry(0.07, 0.06, 1.2, 5), coat, sx * 0.2, 0.6, sz * 0.6);
  put(g, new THREE.SphereGeometry(0.45, 8, 6).scale(0.75, 0.75, 1.5), coat, 0, 1.4, 0);
  put(g, new THREE.CylinderGeometry(0.05, 0.08, 0.9, 4), mane, 0, 1.2, -0.85).rotation.x = -0.5;
  const head = new THREE.Group();
  head.position.set(0, 1.6, 0.6);
  put(head, new THREE.CylinderGeometry(0.12, 0.17, 0.85, 6).translate(0, 0.42, 0), coat, 0, 0, 0);
  put(head, new THREE.BoxGeometry(0.2, 0.22, 0.55), coat, 0, 0.88, 0.2);
  put(head, new THREE.BoxGeometry(0.06, 0.5, 0.3), mane, 0, 0.5, -0.12);
  head.traverse((o) => markDynamic(o));
  g.add(head);
  let t = seed;
  updaters.push((dt) => {
    t += dt;
    head.rotation.x = 0.45 + 1.1 * Math.max(0, Math.sin(t * 0.8)) ** 2;
  });
  return { box: [0.7, 2] };
}

/** Tường đề thơ 詩壁: mảng tường gạch 7 × 3 m, câu thơ `text` khắc trên tấm đá giữa. Va chạm hộp. */
function thoBich(g: THREE.Group, text: string): PropCollide {
  put(g, new THREE.BoxGeometry(7, 3, 0.8), lambert(BRICK), 0, 1.5, 0);
  put(g, new THREE.BoxGeometry(7.4, 0.3, 1.1), lambert(CAP), 0, 3.15, 0);
  const w = Math.min(6.4, 0.55 * [...text].length + 0.6);
  const face = signMesh(w, 0.9, Math.round(w * 110), 100, (c, pw, ph) => drawStoneSign(c, pw, ph, text, '#b9b4a8'));
  face.position.set(0, 1.8, 0.42);
  g.add(face);
  return { box: [7, 0.8] };
}

/** Dựng vật biên ải `kind`; kiểu lạ → null. */
export function bienAiProp(kind: string, g: THREE.Group, style: Style, text: string | undefined, seed: number, updaters: Updater[]): PropCollide | null {
  switch (kind) {
    case 'dich-lau':
      return dichLau(g, style);
    case 'quan-thanh':
      return quanThanh(g, text ?? '長城');
    case 'phong-hoa':
      return phongHoa(g, updaters);
    case 'phong-hoa-dat':
      return phongHoa(g, updaters, DAT.body);
    case 'cong-quan':
      return quanThanh(g, text ?? '陽關', DAT);
    case 'leu':
      return leu(g);
    case 'soai-truong':
      return soaiTruong(g, style);
    case 'lua-trai':
      return luaTrai(g, style, updaters);
    case 'ngua':
      return ngua(g, seed, updaters);
    case 'tho-bich':
      return thoBich(g, text ?? '黃河遠上白雲間');
    default:
      return null;
  }
}
