/**
 * Cung điện (Tử Cấm Thành — hồ sơ `docs/tham_khao/tu-cam-thanh.md`): lan can Hán bạch ngọc chạy theo mép bục
 * (`terrain.plateaus[].rail` — Tam Đài), tấm đá ngự lộ chạm rồng giữa hai lối bậc, Ngọ Môn chữ 凹 (hai cánh nhô + lầu),
 * sư tử đồng, khảo án thi Đình, giá sách bìa bốn màu Tứ Khố.
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Style } from './buildings';
import { lambert } from './materials';
import type { SceneSpec, XZ } from './spec';
import type { PropCollide } from './vat_truc';

const MARBLE = '#e6e2d6';
const BRONZE = '#4f5b52';
const RED = '#9b2f24';
const GOLD_TILE = '#d0962a';
const POST_EVERY = 2;

function put(g: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  g.add(m);
  return m;
}

/** Điểm (x, z) có nằm trong hành lang của một bậc đá (dải rộng `width` dọc đoạn from → to, nới 0,4 m) không. Thuần. */
export function inStairCorridor(x: number, z: number, stairs: SceneSpec['terrain']['stairs']): boolean {
  return stairs.some((s) => {
    const [ax, az] = s.from;
    const [bx, bz] = s.to;
    const dx = bx - ax;
    const dz = bz - az;
    const L2 = dx * dx + dz * dz || 1;
    const t = ((x - ax) * dx + (z - az) * dz) / L2;
    if (t < -0.1 || t > 1.1) return false;
    const px = ax + t * dx;
    const pz = az + t * dz;
    return Math.hypot(x - px, z - pz) <= s.width / 2 + 0.4;
  });
}

/**
 * Lan can đá trắng quanh mép các bục có `rail: true`: trụ đầu sen mỗi ~2 m + thanh vịn; chừa chỗ bậc đá đi qua.
 * Va chạm: mỗi đoạn một hộp mỏng (chặn rơi khỏi đài, chặn leo lên kè).
 */
export function addPlateauRails(scene: THREE.Scene, colliders: Colliders, terrain: SceneSpec['terrain']): void {
  const marble = lambert(MARBLE);
  const post = new THREE.BoxGeometry(0.28, 1.0, 0.28);
  const cap = new THREE.SphereGeometry(0.17, 6, 4);
  for (const p of terrain.plateaus) {
    if (!p.rail) continue;
    const [x0, x1] = [Math.min(p.from[0], p.to[0]), Math.max(p.from[0], p.to[0])];
    const [z0, z1] = [Math.min(p.from[1], p.to[1]), Math.max(p.from[1], p.to[1])];
    const edges: [XZ, XZ][] = [
      [[x0, z0], [x1, z0]],
      [[x0, z1], [x1, z1]],
      [[x0, z0], [x0, z1]],
      [[x1, z0], [x1, z1]],
    ];
    for (const [a, b] of edges) {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const n = Math.max(1, Math.round(len / POST_EVERY));
      for (let i = 0; i < n; i++) {
        const t0 = i / n;
        const t1 = (i + 1) / n;
        const mx = a[0] + (b[0] - a[0]) * ((t0 + t1) / 2);
        const mz = a[1] + (b[1] - a[1]) * ((t0 + t1) / 2);
        if (inStairCorridor(mx, mz, terrain.stairs)) continue;
        const sx = a[0] + (b[0] - a[0]) * t0;
        const sz = a[1] + (b[1] - a[1]) * t0;
        put(scene, post, marble, sx, p.y + 0.5, sz);
        put(scene, cap, marble, sx, p.y + 1.1, sz);
        const seg = len / n;
        const along = a[1] === b[1];
        put(scene, new THREE.BoxGeometry(along ? seg : 0.16, 0.16, along ? 0.16 : seg), marble, mx, p.y + 0.85, mz);
        put(scene, new THREE.BoxGeometry(along ? seg : 0.12, 0.5, along ? 0.12 : seg), marble, mx, p.y + 0.35, mz);
        colliders.add(mx, mz, along ? seg : 0.35, along ? 0.35 : seg);
      }
    }
  }
}

/** Tấm đá ngự lộ 御路 chạm rồng: dải đá dốc rộng 3 m dài 11 m (đầu −z cao `rise` m), mặt chạm rồng nổi. Không đi được. */
function nguLo(g: THREE.Group, rise: number): PropCollide {
  const L = 11;
  const W = 3;
  const slab = new THREE.Mesh(new THREE.BoxGeometry(W, 0.4, Math.hypot(L, rise)), lambert(MARBLE));
  slab.position.set(0, rise / 2, 0);
  slab.rotation.x = Math.atan2(rise, L);
  g.add(slab);
  // rồng mây nổi: chuỗi cục dọc giữa tấm
  const relief = lambert('#d8d2c2');
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const m = put(g, new THREE.SphereGeometry(0.32, 6, 4).scale(1.4, 0.4, 1), relief, Math.sin(t * Math.PI * 3) * 0.6, rise * (1 - t) + 0.25, -L / 2 + t * L);
    m.rotation.x = Math.atan2(rise, L);
  }
  return { box: [W, L] };
}

/**
 * Ngọ Môn 午門 chữ 凹: hai cánh tường son nhô về +z (cục bộ) dài 16 m, rộng 7, cao 7, mỗi đầu cánh một lầu vuông mái vàng
 * (Ngũ Phượng Lâu). Đặt gốc ở giữa mép tường thành phía nam; cổng chính là cổng tường `thanh`. Va chạm: hai cánh.
 */
function ngoMon(g: THREE.Group): PropCollide {
  const red = lambert(RED);
  const tile = lambert(GOLD_TILE);
  const boxes: [number, number, number, number][] = [];
  for (const s of [-1, 1]) {
    const x = s * 15;
    put(g, new THREE.BoxGeometry(7, 7, 16), red, x, 3.5, 8);
    put(g, new THREE.BoxGeometry(7.6, 0.4, 16.6), lambert(MARBLE), x, 7.2, 8);
    for (const z of [3, 14]) {
      put(g, new THREE.BoxGeometry(5, 3, 5), red, x, 8.9, z);
      put(g, new THREE.ConeGeometry(4.6, 2, 4).rotateY(Math.PI / 4), tile, x, 11.4, z);
    }
    // hành lang mái dọc cánh
    put(g, new THREE.BoxGeometry(3, 2.2, 6), red, x, 8.5, 8.5);
    put(g, new THREE.ConeGeometry(3, 1.4, 4).rotateY(Math.PI / 4).scale(0.8, 1, 1.6), tile, x, 10.3, 8.5);
    boxes.push([x, 8, 7, 16]);
  }
  return { boxes };
}

/** Sư tử đồng ngồi trên bệ đá (cặp trước cổng). Va chạm hộp. */
function suTuDong(g: THREE.Group): PropCollide {
  put(g, new THREE.BoxGeometry(1.8, 1.2, 2.4), lambert(MARBLE), 0, 0.6, 0);
  const b = lambert(BRONZE);
  put(g, new THREE.SphereGeometry(0.6, 8, 6).scale(1, 1.2, 1.1), b, 0, 1.9, -0.2);
  put(g, new THREE.SphereGeometry(0.55, 8, 6), b, 0, 2.8, 0.3);
  put(g, new THREE.SphereGeometry(0.6, 8, 6).scale(1.1, 0.9, 0.7), lambert('#3f4a42'), 0, 2.8, 0.05); // bờm
  for (const s of [-1, 1]) put(g, new THREE.CylinderGeometry(0.15, 0.18, 0.9, 6), b, s * 0.35, 1.6, 0.5);
  put(g, new THREE.SphereGeometry(0.28, 6, 5), b, 0.5, 1.4, 0.75); // tú cầu dưới chân
  return { box: [1.8, 2.4] };
}

/** Khảo án 考案: bàn thấp sơn đỏ + nệm vàng + nghiên, giấy; cho sân thi Đình. Va chạm hộp. */
function khaoAn(g: THREE.Group, style: Style): PropCollide {
  put(g, new THREE.BoxGeometry(1.4, 0.08, 0.7), lambert(RED), 0, 0.5, 0);
  for (const [x, z] of [[-0.6, -0.28], [0.6, -0.28], [-0.6, 0.28], [0.6, 0.28]] as const) put(g, new THREE.BoxGeometry(0.08, 0.5, 0.08), lambert(style.timber), x, 0.25, z);
  put(g, new THREE.BoxGeometry(0.5, 0.01, 0.35), lambert('#f3e9d2'), 0.2, 0.545, 0);
  put(g, new THREE.BoxGeometry(0.18, 0.04, 0.12), lambert('#2a3036'), -0.4, 0.56, 0);
  put(g, new THREE.BoxGeometry(0.9, 0.12, 0.8), lambert('#d4a64a'), 0, 0.06, 0.9);
  return { box: [1.4, 1.8] };
}

/** Giá sách Tứ Khố: khung gỗ 3 × 2,4 m, 4 tầng hộp sách bìa Kinh lục · Sử đỏ · Tử lam · Tập xám. Va chạm hộp. */
function giaSach(g: THREE.Group, style: Style): PropCollide {
  const wood = lambert(style.timber);
  for (const s of [-1, 1]) put(g, new THREE.BoxGeometry(0.1, 2.4, 0.6), wood, s * 1.5, 1.2, 0);
  const covers = ['#4f7a4a', '#9b3a2a', '#3f5fa0', '#7a7a76'];
  covers.forEach((c, i) => {
    const y = 0.25 + i * 0.58;
    put(g, new THREE.BoxGeometry(3, 0.06, 0.6), wood, 0, y - 0.05, 0);
    put(g, new THREE.BoxGeometry(2.8, 0.42, 0.42), lambert(c), 0, y + 0.2, 0.02);
  });
  return { box: [3.1, 0.6] };
}

/** Dựng vật cung điện `kind`; kiểu lạ → null. `rise` = độ cao Tam Đài (ngự lộ). */
export function cungDienProp(kind: string, g: THREE.Group, style: Style, rise: number): PropCollide | null {
  switch (kind) {
    case 'ngu-lo':
      return nguLo(g, rise);
    case 'ngo-mon':
      return ngoMon(g);
    case 'su-tu-dong':
      return suTuDong(g);
    case 'khao-an':
      return khaoAn(g, style);
    case 'gia-sach':
      return giaSach(g, style);
    default:
      return null;
  }
}
