/**
 * Vật của Rừng trúc — hướng "Lan Đình nhã tập" (hồ sơ `docs/tham_khao/rung-truc.md`, mục Công phu hơn):
 * cổng trúc, giá phơi thẻ trúc, bó trúc chẻ, đèn trúc, đá khắc, ngỗng bơi, chỗ ngồi văn nhân. Mỗi hàm dựng vào `g`
 * (gốc ở chân vật, mặt trước +z) và trả về cỡ va chạm; `props.ts` đặt va chạm.
 */
import * as THREE from 'three';
import type { Style } from './buildings';
import { lambert } from './materials';
import { markDynamic } from './merge';
import { signMesh } from './signAtlas';
import { drawStoneSign } from './textures';

type Updater = (dt: number) => void;

const BAMBOO = '#9a9a52';
const BAMBOO_DRY = '#c8b27a';
const SLIP_GREEN = '#8fa05a';
const THATCH = '#b49a6a';
const CORD = '#6b4a2e';
const PAPER = '#f3e9d2';

function put(g: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  g.add(m);
  return m;
}

/** Thân trúc đứng cao `h`, ∅ `d`, có đốt mỗi ~0,5 m. */
function pole(g: THREE.Object3D, h: number, d: number, x: number, z: number, color = BAMBOO): void {
  const mat = lambert(color);
  put(g, new THREE.CylinderGeometry(d / 2, d / 2, h, 6), mat, x, h / 2, z);
  const knot = new THREE.CylinderGeometry(d / 2 + 0.02, d / 2 + 0.02, 0.05, 6);
  const node = lambert('#7f7f42');
  for (let y = 0.5; y < h - 0.1; y += 0.55) put(g, knot, node, x, y, z);
}

/** Cổng trúc (竹門): 2 trụ trúc, 2 xà ngang, mái tranh nón dẹt; lòng 3,5 m, cao 4,2 m. Va chạm = 2 trụ (trả về x trụ). */
export function congTruc(g: THREE.Group): number {
  const half = 1.95;
  for (const s of [-1, 1]) pole(g, 4.2, 0.3, s * half, 0);
  const beam = lambert(BAMBOO_DRY);
  for (const y of [3.6, 4.05]) {
    const m = put(g, new THREE.CylinderGeometry(0.11, 0.11, 2 * half + 0.8, 6), beam, 0, y, 0);
    m.rotation.z = Math.PI / 2;
  }
  // mái tranh: lăng trụ dẹt hai mái phủ trên xà
  const roof = put(g, new THREE.CylinderGeometry(0.05, 1.1, 0.7, 4, 1).scale(2.6, 1, 0.55), lambert(THATCH), 0, 4.55, 0);
  roof.rotation.y = Math.PI / 4;
  return half;
}

/** Giá phơi thẻ trúc 2,4 × 1,8 m: khung trúc, 4 hàng thẻ treo (vàng khô xen lục tươi). Va chạm hộp. */
export function giaThe(g: THREE.Group): [number, number] {
  for (const s of [-1, 1]) pole(g, 1.9, 0.09, s * 1.2, 0, BAMBOO_DRY);
  const rail = lambert(CORD);
  const slip = new THREE.BoxGeometry(0.06, 0.32, 0.012);
  const dry = lambert(BAMBOO_DRY);
  const fresh = lambert(SLIP_GREEN);
  for (let r = 0; r < 4; r++) {
    const y = 1.75 - r * 0.42;
    const m = put(g, new THREE.CylinderGeometry(0.02, 0.02, 2.4, 4), rail, 0, y, 0);
    m.rotation.z = Math.PI / 2;
    for (let i = 0; i < 18; i++) {
      const x = -1.05 + i * 0.124;
      put(g, slip, (i + r) % 5 === 0 ? fresh : dry, x, y - 0.18, ((i * 7) % 3) * 0.01);
    }
  }
  return [2.6, 0.5];
}

/** Bó trúc chẻ dựng nghiêng (dựa vách / cột): 9 thanh, dây buộc giữa. Va chạm tròn — trả về bán kính. */
export function boTruc(g: THREE.Group): number {
  const mat = lambert(BAMBOO_DRY);
  const rod = new THREE.CylinderGeometry(0.035, 0.035, 2.6, 4);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const m = put(g, rod, mat, Math.cos(a) * 0.09, 1.25, Math.sin(a) * 0.09 - 0.25);
    m.rotation.x = 0.22;
  }
  const tie = put(g, new THREE.TorusGeometry(0.13, 0.025, 4, 10), lambert(CORD), 0, 1.3, -0.28);
  tie.rotation.x = Math.PI / 2 + 0.22;
  return 0.35;
}

/** Đèn trúc (竹燈): cột trúc + lồng giấy vuông tự sáng (không đèn thật), cao 1,4 m. Va chạm tròn. */
export function denTruc(g: THREE.Group): number {
  pole(g, 1.0, 0.08, 0, 0, BAMBOO_DRY);
  put(g, new THREE.BoxGeometry(0.36, 0.42, 0.36), new THREE.MeshBasicMaterial({ color: '#ffd58a' }), 0, 1.2, 0);
  const frame = lambert(CORD);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    put(g, new THREE.BoxGeometry(0.03, 0.46, 0.03), frame, x * 0.18, 1.2, z * 0.18);
  }
  put(g, new THREE.ConeGeometry(0.3, 0.16, 4).rotateY(Math.PI / 4), lambert(THATCH), 0, 1.5, 0);
  put(g, new THREE.BoxGeometry(0.4, 0.04, 0.4), lambert(PAPER), 0, 0.99, 0);
  return 0.3;
}

/** Đá khắc ngang (vd. 曲水流觴): tảng đá thô 2,6 × 1,2 × 0,8 m, mặt trước phẳng khắc chữ (ảnh biển chung). Va chạm hộp. */
export function daKhac(g: THREE.Group, style: Style, text: string): [number, number] {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0).scale(1.45, 0.75, 0.5), lambert(style.stone));
  rock.position.y = 0.62;
  g.add(rock);
  const w = Math.min(2.2, 0.45 * [...text].length + 0.3);
  const face = signMesh(w, 0.6, Math.round(w * 160), 96, (cx, pw, ph) => drawStoneSign(cx, pw, ph, text, style.stone));
  face.position.set(0, 0.72, 0.44);
  face.rotation.x = -0.12;
  g.add(face);
  return [2.8, 1.1];
}

/** Ngỗng trắng (鵝) bơi vòng chậm quanh gốc, bán kính 1,5 m; cổ cong, mỏ cam. Không va chạm. */
export function ngong(g: THREE.Group, seed: number, updaters: Updater[]): void {
  const bird = new THREE.Group();
  const white = lambert('#f2f0e8');
  put(bird, new THREE.SphereGeometry(0.28, 8, 5).scale(0.8, 0.55, 1.3), white, 0, 0.08, 0);
  const neck = put(bird, new THREE.CylinderGeometry(0.05, 0.07, 0.5, 5), white, 0, 0.36, 0.28);
  neck.rotation.x = -0.25;
  put(bird, new THREE.SphereGeometry(0.08, 6, 4), white, 0, 0.6, 0.34);
  const beak = put(bird, new THREE.ConeGeometry(0.035, 0.14, 4), lambert('#d98a2b'), 0, 0.59, 0.46);
  beak.rotation.x = Math.PI / 2;
  bird.traverse((o) => markDynamic(o));
  g.add(bird);
  let t = seed;
  updaters.push((dt) => {
    t += dt * 0.25;
    bird.position.set(Math.cos(t) * 1.5, Math.sin(t * 3) * 0.02, Math.sin(t) * 1.5);
    bird.rotation.y = -t; // bơi theo tiếp tuyến
  });
}

/** Chỗ ngồi văn nhân: đá phẳng 0,9 × 0,25, bồ đoàn rơm, án nhỏ có nghiên + giấy phía trước (+z). Va chạm hộp. */
export function boDoan(g: THREE.Group, style: Style): [number, number] {
  put(g, new THREE.BoxGeometry(0.9, 0.25, 0.9), lambert(style.stone), 0, 0.125, 0);
  put(g, new THREE.CylinderGeometry(0.34, 0.36, 0.12, 10), lambert(THATCH), 0, 0.31, 0);
  put(g, new THREE.BoxGeometry(0.6, 0.06, 0.4), lambert(style.timber), 0, 0.3, 0.72);
  for (const s of [-1, 1]) put(g, new THREE.BoxGeometry(0.06, 0.27, 0.06), lambert(style.timber), s * 0.25, 0.135, 0.72);
  put(g, new THREE.BoxGeometry(0.16, 0.03, 0.11), lambert('#2a3036'), -0.14, 0.345, 0.72);
  put(g, new THREE.BoxGeometry(0.26, 0.01, 0.2), lambert(PAPER), 0.12, 0.335, 0.72);
  return [0.9, 1.4];
}

/** Va chạm của một vật: hộp [rộng, sâu] (theo hướng vật) · tròn bán kính · các trụ tròn (toạ độ cục bộ). */
export interface PropCollide {
  box?: [number, number];
  circle?: number;
  posts?: [number, number][];
  /** nhiều hộp cục bộ [x, z, rộng, sâu] (theo hướng vật) */
  boxes?: [number, number, number, number][];
}

/** Dựng vật Rừng trúc `kind` vào `g`; kiểu lạ → null. */
export function trucProp(kind: string, g: THREE.Group, style: Style, text: string | undefined, seed: number, updaters: Updater[]): PropCollide | null {
  switch (kind) {
    case 'cong-truc': {
      const half = congTruc(g);
      return { posts: [[-half, 0], [half, 0]] };
    }
    case 'gia-the':
      return { box: giaThe(g) };
    case 'bo-truc':
      return { circle: boTruc(g) };
    case 'den-truc':
      return { circle: denTruc(g) };
    case 'da-khac':
      return { box: daKhac(g, style, text ?? '竹') };
    case 'ngong':
      ngong(g, seed, updaters);
      return {};
    case 'bo-doan':
      return { box: boDoan(g, style) };
    default:
      return null;
  }
}
