/**
 * Giang Nam thuỷ trấn (hồ sơ `docs/tham_khao/giang-nam.md`): hiên lang bồng 廊棚 ven nước (`galleries`) và các vật nhỏ
 * kể chuyện — bậc xuống nước 河埠頭, giàn đèn đố 燈棚, vò rượu, chậu sen, sào phơi áo, mèo, chó.
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Style } from './buildings';
import { lambert } from './materials';
import type { GallerySpec } from './spec';
import type { GroundY } from './terrainHeight';
import type { PropCollide } from './vat_truc';

const TILE = '#33363a';
const WOOD = '#3a3430';
const WOOD_LIGHT = '#5a4636';
const LANTERN = '#a8322a';
const LANTERN_GLOW = '#f2b25c';
const PAPER = '#f3e9d2';
const INDIGO = '#3f5fa0';

function put(g: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  g.add(m);
  return m;
}

/** Đèn lồng đỏ tròn (vỏ son, lòng sáng), tâm ở (x, y, z). */
function lantern(g: THREE.Object3D, x: number, y: number, z: number, r = 0.28): void {
  put(g, new THREE.SphereGeometry(r, 8, 6).scale(1, 1.15, 1), new THREE.MeshBasicMaterial({ color: LANTERN }), x, y, z);
  put(g, new THREE.CylinderGeometry(r * 0.55, r * 0.55, 0.08, 8), lambert('#d4a64a'), x, y + r * 1.15, z);
  put(g, new THREE.CylinderGeometry(r * 0.8, r * 0.8, r * 1.4, 8), new THREE.MeshBasicMaterial({ color: LANTERN_GLOW, transparent: true, opacity: 0.35 }), x, y, z);
}

/**
 * Hiên lang bồng: dựng trong hệ cục bộ (dài theo x, phía nước +z) rồi quay về hướng thật. Cột gỗ mỗi ~3 m hai hàng,
 * mái một dốc ngói đen (cao 3,6 phía phố → 3,0 phía nước), ghế tựa 美人靠 phía nước, đèn lồng cách một gian.
 * Va chạm: cột phía phố (tròn) + dải ghế phía nước (hộp).
 */
export function addGalleries(scene: THREE.Scene, colliders: Colliders, list: GallerySpec[], groundY: GroundY = () => 0): void {
  const wood = lambert(WOOD);
  const tile = lambert(TILE);
  const seat = lambert(WOOD_LIGHT);
  for (const gs of list) {
    const alongX = gs.from[1] === gs.to[1];
    const len = Math.abs(alongX ? gs.to[0] - gs.from[0] : gs.to[1] - gs.from[1]);
    const w = gs.width ?? 3;
    const cx = (gs.from[0] + gs.to[0]) / 2;
    const cz = (gs.from[1] + gs.to[1]) / 2;
    const side = gs.waterSide >= 0 ? 1 : -1;
    const g = new THREE.Group();
    g.position.set(cx, groundY(cx, cz), cz);
    g.rotation.y = alongX ? (side > 0 ? 0 : Math.PI) : side > 0 ? Math.PI / 2 : -Math.PI / 2;
    const bays = Math.max(1, Math.round(len / 3));
    const step = len / bays;
    const hiStreet = 3.6;
    const hiWater = 3.0;
    for (let i = 0; i <= bays; i++) {
      const x = -len / 2 + i * step;
      put(g, new THREE.CylinderGeometry(0.1, 0.12, hiStreet, 6), wood, x, hiStreet / 2, -w / 2 + 0.15);
      put(g, new THREE.CylinderGeometry(0.1, 0.12, hiWater, 6), wood, x, hiWater / 2, w / 2 - 0.15);
      if (i < bays && i % 2 === 0) lantern(g, x + step / 2, hiWater - 0.6, w / 2 - 0.15);
    }
    // xà dọc hai hàng cột
    put(g, new THREE.BoxGeometry(len + 0.2, 0.16, 0.16), wood, 0, hiStreet - 0.08, -w / 2 + 0.15);
    put(g, new THREE.BoxGeometry(len + 0.2, 0.16, 0.16), wood, 0, hiWater - 0.08, w / 2 - 0.15);
    // mái một dốc
    const slope = Math.atan2(hiStreet - hiWater, w);
    const roof = put(g, new THREE.BoxGeometry(len + 0.6, 0.14, Math.hypot(w, hiStreet - hiWater) + 0.9), tile, 0, (hiStreet + hiWater) / 2 + 0.12, 0.2);
    roof.rotation.x = slope;
    // ghế tựa 美人靠: mặt ghế + lưng cong ngả ra nước
    put(g, new THREE.BoxGeometry(len, 0.08, 0.42), seat, 0, 0.48, w / 2 - 0.4);
    put(g, new THREE.BoxGeometry(len, 0.48, 0.06), seat, 0, 0.24, w / 2 - 0.2);
    const back = put(g, new THREE.BoxGeometry(len, 0.55, 0.05), seat, 0, 0.82, w / 2 - 0.08);
    back.rotation.x = 0.4;
    scene.add(g);
    // va chạm (thế giới, thẳng trục)
    for (let i = 0; i <= bays; i++) {
      const a = -len / 2 + i * step;
      const off = -side * (w / 2 - 0.15);
      if (alongX) colliders.addCircle(cx + a, cz + off, 0.18);
      else colliders.addCircle(cx + off, cz + a, 0.18);
    }
    const benchOff = side * (w / 2 - 0.3);
    if (alongX) colliders.add(cx, cz + benchOff, len, 0.6);
    else colliders.add(cx + benchOff, cz, 0.6, len);
  }
}

/** Bậc xuống nước: 5 bậc đá xanh đi xuống phía +z tới mặt nước thấp hơn `sunk` m, má đá hai bên, đá buộc thuyền. */
function benNuoc(g: THREE.Group, style: Style, sunk: number): PropCollide {
  const stone = lambert('#7e8580');
  const tread = lambert('#9a968c');
  const n = 5;
  const rise = sunk / n;
  for (let i = 0; i < n; i++) {
    const y = -rise * (i + 1);
    put(g, new THREE.BoxGeometry(1.8, rise, 0.32), tread, 0, y + rise / 2, 0.3 + i * 0.3);
    put(g, new THREE.BoxGeometry(1.8, sunk + y + 0.02, 0.32), stone, 0, (y - sunk) / 2, 0.3 + i * 0.3);
  }
  for (const s of [-1, 1]) put(g, new THREE.BoxGeometry(0.25, sunk + 0.3, 1.7), lambert(style.stone), s * 1.02, 0.15 - sunk / 2, 0.85);
  const ring = put(g, new THREE.TorusGeometry(0.12, 0.04, 4, 8), stone, 1.02, -0.2, 1.7);
  ring.rotation.y = Math.PI / 2;
  return {};
}

/** Giàn đèn đố (燈棚): 2 cột gỗ 2,7 m, xà 3 m, 2 hàng × 4 đèn giấy trắng (đèn đố) đỏ đầu. Va chạm: 2 cột. */
function gianDen(g: THREE.Group): PropCollide {
  const wood = lambert(WOOD);
  for (const s of [-1, 1]) put(g, new THREE.CylinderGeometry(0.08, 0.1, 2.7, 6), wood, s * 1.5, 1.35, 0);
  for (const y of [2.6, 1.9]) {
    const beam = put(g, new THREE.CylinderGeometry(0.04, 0.04, 3.2, 5), wood, 0, y, 0);
    beam.rotation.z = Math.PI / 2;
    for (let i = 0; i < 4; i++) {
      const x = -1.05 + i * 0.7;
      put(g, new THREE.CylinderGeometry(0.17, 0.17, 0.42, 8), new THREE.MeshBasicMaterial({ color: PAPER }), x, y - 0.35, 0);
      put(g, new THREE.CylinderGeometry(0.18, 0.18, 0.05, 8), new THREE.MeshBasicMaterial({ color: LANTERN }), x, y - 0.12, 0);
      put(g, new THREE.BoxGeometry(0.1, 0.24, 0.01), lambert('#e8e1d2'), x, y - 0.75, 0.02); // phiếu đố giấy treo dưới đèn
    }
  }
  return { posts: [[-1.5, 0], [1.5, 0]] };
}

/** Chồng vò rượu: 3 vò dưới + 2 vò trên, men nâu, nắp bùn đỏ. Va chạm tròn. */
function voRuou(g: THREE.Group): PropCollide {
  const jar = new THREE.SphereGeometry(0.32, 8, 6).scale(1, 1.15, 1);
  const glaze = lambert('#5a3a26');
  const lid = lambert('#9e3a28');
  const spots: [number, number, number][] = [[-0.36, 0.36, 0], [0.36, 0.36, 0], [0, 0.36, -0.55], [-0.18, 1.0, -0.2], [0.2, 1.0, -0.2]];
  for (const [x, y, z] of spots) {
    put(g, jar, glaze, x, y, z);
    put(g, new THREE.CylinderGeometry(0.15, 0.17, 0.14, 8), lid, x, y + 0.4, z);
  }
  return { circle: 0.75 };
}

/** Chậu sen 荷花缸: vại sành lớn, lá sen tròn, một búp hồng. Va chạm tròn. */
function chauSen(g: THREE.Group): PropCollide {
  put(g, new THREE.CylinderGeometry(0.5, 0.38, 0.7, 10), lambert('#4f5a50'), 0, 0.35, 0);
  put(g, new THREE.CircleGeometry(0.46, 10).rotateX(-Math.PI / 2), lambert('#557f7a'), 0, 0.66, 0);
  const leaf = lambert('#5e7f4a', { side: THREE.DoubleSide });
  for (const [x, z, y] of [[-0.15, 0.1, 0.8], [0.18, -0.12, 0.95], [0.05, 0.25, 0.72]] as const) {
    put(g, new THREE.CircleGeometry(0.22, 8).rotateX(-Math.PI / 2 + 0.2), leaf, x, y, z);
  }
  put(g, new THREE.ConeGeometry(0.08, 0.2, 5), lambert('#e8a6b4'), 0.05, 1.12, -0.05);
  return { circle: 0.55 };
}

/** Sào phơi áo: hai cọc chạc, sào tre 3 m, 3 tấm áo / vải lam in hoa phơi. Va chạm: 2 cọc. */
function saoAo(g: THREE.Group): PropCollide {
  const wood = lambert(WOOD_LIGHT);
  for (const s of [-1, 1]) put(g, new THREE.CylinderGeometry(0.05, 0.06, 2.4, 5), wood, s * 1.5, 1.2, 0);
  const pole = put(g, new THREE.CylinderGeometry(0.04, 0.04, 3.4, 5), lambert('#9a9a52'), 0, 2.35, 0);
  pole.rotation.z = Math.PI / 2;
  const cloth = [INDIGO, '#e8e1d2', '#8e5e44'];
  cloth.forEach((c, i) => {
    put(g, new THREE.PlaneGeometry(0.7, 0.9), lambert(c, { side: THREE.DoubleSide }), -0.9 + i * 0.9, 1.88, 0);
  });
  return { posts: [[-1.5, 0], [1.5, 0]] };
}

/** Mèo cam nằm cuộn (猫 — có trong HSK 1). Không va chạm. */
function meo(g: THREE.Group): PropCollide {
  const fur = lambert('#d98a3a');
  put(g, new THREE.SphereGeometry(0.2, 7, 5).scale(1, 0.6, 1.3), fur, 0, 0.12, 0);
  put(g, new THREE.SphereGeometry(0.11, 6, 5), fur, 0, 0.16, 0.26);
  for (const s of [-1, 1]) put(g, new THREE.ConeGeometry(0.035, 0.08, 3), fur, s * 0.06, 0.27, 0.27);
  const tail = put(g, new THREE.TorusGeometry(0.16, 0.03, 4, 8, Math.PI), fur, 0.05, 0.05, -0.1);
  tail.rotation.x = Math.PI / 2;
  return {};
}

/** Chó vàng ngồi (狗 — có trong HSK 1). Va chạm tròn. */
function cho(g: THREE.Group): PropCollide {
  const fur = lambert('#b98a55');
  const body = put(g, new THREE.SphereGeometry(0.22, 7, 5).scale(0.8, 1.2, 1), fur, 0, 0.3, 0);
  body.rotation.x = -0.4;
  put(g, new THREE.SphereGeometry(0.15, 7, 5).scale(1, 1, 1.2), fur, 0, 0.6, 0.12);
  put(g, new THREE.BoxGeometry(0.1, 0.08, 0.14), lambert('#7a5634'), 0, 0.57, 0.28);
  for (const s of [-1, 1]) put(g, new THREE.BoxGeometry(0.06, 0.12, 0.04), lambert('#7a5634'), s * 0.1, 0.72, 0.08);
  for (const s of [-1, 1]) put(g, new THREE.CylinderGeometry(0.04, 0.04, 0.3, 4), fur, s * 0.08, 0.15, 0.12);
  return { circle: 0.3 };
}

/** Dựng vật Giang Nam `kind` vào `g`; kiểu lạ → null. `sunk` = mặt nước thấp hơn mặt đất (bậc bến). */
export function giangNamProp(kind: string, g: THREE.Group, style: Style, sunk: number): PropCollide | null {
  switch (kind) {
    case 'ben-nuoc':
      return benNuoc(g, style, sunk);
    case 'gian-den':
      return gianDen(g);
    case 'vo-ruou':
      return voRuou(g);
    case 'chau-sen':
      return chauSen(g);
    case 'sao-ao':
      return saoAo(g);
    case 'meo':
      return meo(g);
    case 'cho':
      return cho(g);
    default:
      return null;
  }
}
