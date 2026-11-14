/**
 * Vật Con đường tơ lụa (hồ sơ `docs/tham_khao/to-lua.md`): đoạn vách Mạc Cao 20 m (3 tầng cửa hang + sạn đạo gỗ), Cửu
 * Tầng Lâu áp vách (9 lớp hiên), nhà đất nện mái bằng, lều vải chợ phiên (màu theo vị trí, có hàng: lụa, nho, thảm,
 * bình), cụm lau sậy bờ hồ.
 */
import * as THREE from 'three';
import type { Style } from './buildings';
import { lambert } from './materials';
import { prism } from './kien_truc/hinh';
import type { PropCollide } from './vat_truc';

const ROCK = '#b07a4e';
const ROCK_HI = '#c08c5c';
const DARK = '#2a1e18';
const EARTH = '#b9946a';
const EARTH_DARK = '#94714c';
const REED_LINE = '#8a7a52';
const CLOTHS = ['#a8322a', '#2e4a7a', '#d4a64a', '#3e6b5a', '#e8dcc0'];

function put(g: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  g.add(m);
  return m;
}

/** Cửa hang vòm tối trên mặt +z. */
function cave(g: THREE.Object3D, x: number, y: number, z: number, w: number, h: number): void {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(-w / 2, h - w / 2);
  s.absarc(0, h - w / 2, w / 2, Math.PI, 0, true);
  s.lineTo(w / 2, 0);
  s.closePath();
  put(g, new THREE.ShapeGeometry(s, 5), new THREE.MeshBasicMaterial({ color: DARK }), x, y, z);
}

/**
 * Đoạn vách Mạc Cao dài 20 m, cao 16 m, mặt nhìn +z: khối cuội kết hơi nghiêng, 3 tầng cửa hang (5 / 4 / 3 cửa), sạn đạo
 * gỗ 棧道 có lan can trước tầng 2 và 3. Đặt nhiều đoạn liền nhau thành vách dài. Va chạm hộp.
 */
function vachHang(g: THREE.Group, style: Style): PropCollide {
  const rock = lambert(ROCK);
  put(g, new THREE.BoxGeometry(20, 16, 6), rock, 0, 8, -3);
  put(g, new THREE.BoxGeometry(20.4, 2.5, 7), lambert(ROCK_HI), 0, 16.5, -3.5);
  const rows: [number, number, number][] = [
    [1, 5, 2.6],
    [6.2, 4, 2.2],
    [11, 3, 1.8],
  ];
  const wood = lambert(style.timber);
  rows.forEach(([y, n, w], r) => {
    for (let i = 0; i < n; i++) cave(g, -8 + (16 * (i + 0.5)) / n, y, 0.04, w, w * 1.3);
    if (r > 0) {
      // sạn đạo: ván + cột chống + lan can
      put(g, new THREE.BoxGeometry(19, 0.15, 1.4), wood, 0, y - 0.1, 0.7);
      put(g, new THREE.BoxGeometry(19, 0.08, 0.08), wood, 0, y + 0.9, 1.35);
      for (let k = -9; k <= 9; k += 3) {
        put(g, new THREE.BoxGeometry(0.1, 1, 0.1), wood, k, y + 0.4, 1.35);
        const brace = put(g, new THREE.BoxGeometry(0.1, 1.6, 0.1), wood, k, y - 0.8, 0.7);
        brace.rotation.x = 0.6;
      }
    }
  });
  return { box: [20, 6.5] };
}

/** Cửu Tầng Lâu 九層樓: mặt lầu áp vách rộng 11, sâu 3, cao 21 m; 9 lớp hiên ngói xám thu dần, cột son, mái chóp. */
function lauVach(g: THREE.Group): PropCollide {
  const red = lambert('#b8402e');
  const col = lambert('#a8322a');
  const tile = lambert('#4f5a63');
  const levels = 9;
  for (let i = 0; i < levels; i++) {
    const y = i * 2.15;
    const w = 11 - i * 0.55;
    put(g, new THREE.BoxGeometry(w - 1, 2.15, 2.2), red, 0, y + 1.07, -0.6);
    for (const s of [-1, 1]) put(g, new THREE.CylinderGeometry(0.14, 0.14, 2.15, 6), col, s * (w / 2 - 0.8), y + 1.07, 0.55);
    // hiên: mái hai dốc nhô 1,4 m trước mặt lầu (nửa sau chìm vào thân)
    put(g, prism(w + 0.8, 3.2, 0.75), tile, 0, y + 1.75, -0.2);
  }
  put(g, new THREE.ConeGeometry(4, 2.6, 4).rotateY(Math.PI / 4).scale(1, 1, 0.6), tile, 0, levels * 2.15 + 1.2, -0.6);
  put(g, new THREE.BoxGeometry(2, 3, 0.05), new THREE.MeshBasicMaterial({ color: DARK }), 0, 1.5, 0.52);
  return { box: [11, 3] };
}

/** Nhà đất nện mái bằng 8 × 6 × 3,6 m: tường đất có sọc lau, tường chắn mái, đầu xà gỗ, cửa tối. Va chạm hộp. */
function nhaDat(g: THREE.Group, style: Style): PropCollide {
  const earth = lambert(EARTH);
  put(g, new THREE.BoxGeometry(8, 3.6, 6), earth, 0, 1.8, 0);
  put(g, new THREE.BoxGeometry(8.2, 0.5, 6.2), lambert(EARTH_DARK), 0, 3.85, 0);
  for (const y of [1.2, 2.4]) put(g, new THREE.BoxGeometry(8.05, 0.08, 6.05), lambert(REED_LINE), 0, y, 0);
  for (let i = 0; i < 6; i++) put(g, new THREE.CylinderGeometry(0.1, 0.1, 0.5, 5).rotateX(Math.PI / 2), lambert(style.timber), -3.3 + i * 1.32, 3.35, 3.2);
  put(g, new THREE.BoxGeometry(1.4, 2.2, 0.05), new THREE.MeshBasicMaterial({ color: DARK }), 0, 1.1, 3.03);
  return { box: [8, 6] };
}

/** Lều vải chợ phiên 3 × 3 m: 4 cọc, mái vải (màu theo `seed`), bàn hàng: cuộn lụa, sọt nho, thảm cuộn, bình gốm. */
function leuVai(g: THREE.Group, style: Style, seed: number): PropCollide {
  const cloth = lambert(CLOTHS[Math.abs(Math.round(seed)) % CLOTHS.length], { side: THREE.DoubleSide });
  const wood = lambert(style.timber);
  for (const [x, z] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]] as const) put(g, new THREE.CylinderGeometry(0.06, 0.06, 2.6, 5), wood, x, 1.3, z);
  const roof = put(g, new THREE.PlaneGeometry(3.4, 3.4, 2, 2), cloth, 0, 2.6, 0);
  roof.rotation.x = -Math.PI / 2 + 0.12;
  put(g, new THREE.BoxGeometry(2.6, 0.7, 1), wood, 0, 0.35, -0.6);
  // cuộn lụa nằm cạnh nhau (cách 0,26 > đường kính 0,24) — trước xếp nối đuôi cùng trục, lồng vào nhau gây chớp (L-10)
  CLOTHS.slice(0, 3).forEach((c, i) => put(g, new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8).rotateZ(Math.PI / 2), lambert(c), -0.6, 0.82, -0.86 + i * 0.26));
  put(g, new THREE.CylinderGeometry(0.28, 0.2, 0.3, 8), lambert('#8a6a3a'), 0.55, 0.85, -0.6);
  put(g, new THREE.SphereGeometry(0.22, 7, 5).scale(1, 0.6, 1), lambert('#6a3a6a'), 0.55, 1.05, -0.6);
  put(g, new THREE.SphereGeometry(0.2, 8, 6).scale(1, 1.3, 1), lambert('#3f7a8a'), 1.05, 0.95, -0.6);
  put(g, new THREE.CylinderGeometry(0.22, 0.22, 1.6, 8).rotateZ(Math.PI / 2), lambert('#8e3a2a'), 0, 0.22, 1.1);
  return { box: [3.2, 3.2] };
}

/** Cụm lau sậy bờ hồ: 14 lá thẳng nghiêng + vài bông. Không va chạm. */
function lauSay(g: THREE.Group, seed: number): PropCollide {
  const leaf = lambert('#7d8a4a');
  const head = lambert('#c8b27a');
  for (let i = 0; i < 14; i++) {
    const a = (i * 2.4 + seed) % (Math.PI * 2);
    const r = 0.15 + ((i * 37) % 10) / 20;
    const h = 1.2 + ((i * 53) % 10) / 12;
    const m = put(g, new THREE.ConeGeometry(0.04, h, 3), leaf, Math.cos(a) * r, h / 2, Math.sin(a) * r);
    m.rotation.set(Math.sin(a) * 0.2, 0, Math.cos(a) * 0.2);
    if (i % 4 === 0) put(g, new THREE.CylinderGeometry(0.05, 0.03, 0.3, 4), head, Math.cos(a) * r, h + 0.1, Math.sin(a) * r);
  }
  return {};
}

/** Dựng vật Con đường tơ lụa `kind`; kiểu lạ → null. */
export function saMacProp(kind: string, g: THREE.Group, style: Style, seed: number): PropCollide | null {
  switch (kind) {
    case 'vach-hang':
      return vachHang(g, style);
    case 'lau-vach':
      return lauVach(g);
    case 'nha-dat':
      return nhaDat(g, style);
    case 'leu-vai':
      return leuVai(g, style, seed);
    case 'lau-say':
      return lauSay(g, seed);
    default:
      return null;
  }
}
