/**
 * Cổng Thành Vùi Cát + đầu lạc đà đá (V-112, Thành Cát Ngủ Quên — concept `design/concept/thanh-cat-ngu-quen/`). Khối
 * Lambert tĩnh (cảnh mềm: `mergeSoft` gộp + nướng bóng). Cổng: thân đất nện đùn từ mặt cắt chữ U (vòm thông dọc z, đi qua
 * được), vành vòm gạch sẫm, hai cánh cửa gỗ mở áp vách vòm, lằn đất nện, gờ mái thành, răng cưa (trừ phía dốc cát), lầu gỗ
 * vách ván mái ngói xám hơi xệ. Va chạm theo `gateLayout` (thanhCatSpec.ts).
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import { cornerTips, roofMat } from './kien_truc/mai';
import { prism } from './kien_truc/hinh';
import { lambert } from './materials';
import { seededRandom } from './random';
import { gateLayout, PARAPET_T, towerZ, type SandCitySpec } from './thanhCatSpec';

/** Cát vùi chân: thân cổng đùn từ dưới mặt cát bao nhiêu m (địa hình gồ ghề không hở chân). */
const BURY = 4;
const DARK = '#3a2a20';

type Put = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => THREE.Mesh;

function putter(g: THREE.Group): Put {
  return (geo, mat, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };
}

/** Mặt cắt chữ U (rộng `w`, từ −BURY lên `h`) khoét vòm rộng `aw` cao `ah` (đáy vòm y = −BURY để mở xuống dưới mặt cát). */
function gateOutline(w: number, h: number, aw: number, ah: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, -BURY);
  s.lineTo(-aw / 2, -BURY);
  s.lineTo(-aw / 2, ah - aw / 2);
  s.absarc(0, ah - aw / 2, aw / 2, Math.PI, 0, true);
  s.lineTo(aw / 2, -BURY);
  s.lineTo(w / 2, -BURY);
  s.lineTo(w / 2, h);
  s.lineTo(-w / 2, h);
  s.closePath();
  return s;
}

/** Vành vòm: dải cong dày `t` ôm vòm (trong cách vách vòm 4 cm — không trùng mặt), chân từ −0,6 m. */
function archRing(aw: number, ah: number, t: number): THREE.Shape {
  const ri = aw / 2 + 0.04;
  const ro = ri + t;
  const cy = ah - aw / 2;
  const s = new THREE.Shape();
  s.moveTo(-ro, -0.6);
  s.lineTo(-ro, cy);
  s.absarc(0, cy, ro, Math.PI, 0, true);
  s.lineTo(ro, -0.6);
  s.lineTo(ri, -0.6);
  s.lineTo(ri, cy);
  s.absarc(0, cy, ri, 0, Math.PI, false);
  s.lineTo(-ri, -0.6);
  s.closePath();
  return s;
}

/** Thân cổng + vành vòm + cửa gỗ + lằn đất nện + gờ mái + răng cưa. Gốc nhóm = tâm cổng trên nền lối vòm. */
function body(g: THREE.Group, s: SandCitySpec): void {
  const { gate: G, colors: c } = s;
  const put = putter(g);
  const earth = lambert(c.earth);
  const dark = lambert(c.earthDark);
  const [aw, ah] = G.arch;
  const geo = new THREE.ExtrudeGeometry(gateOutline(G.w, G.h, aw, ah), { depth: G.d, bevelEnabled: false, curveSegments: 8 });
  put(geo, earth, 0, 0, -G.d / 2);
  // vành vòm hai mặt (nhô 0,12 ra ngoài mặt cổng)
  const ring = new THREE.ExtrudeGeometry(archRing(aw, ah, 0.55), { depth: 0.3, bevelEnabled: false, curveSegments: 8 });
  put(ring, dark, 0, 0, G.d / 2 - 0.18);
  put(ring, dark, 0, 0, -G.d / 2 - 0.12);
  // hai cánh cửa gỗ mở áp hai vách vòm, sát mặt nam
  const wood = lambert(c.wood);
  const doorH = ah - aw / 2 + 0.6; // đỉnh cánh dưới vòm cong
  for (const sx of [-1, 1]) put(new THREE.BoxGeometry(0.14, doorH, aw / 2 - 0.1), wood, sx * (aw / 2 - 0.09), doorH / 2 - 0.2, G.d / 2 - aw / 4 - 0.6);
  // lằn đất nện: dải sẫm nhô 4 cm hai bên vòm, hai mặt
  const side = G.w / 2 - aw / 2 - 0.7;
  for (const y of [G.h * 0.3, G.h * 0.58]) {
    for (const sz of [-1, 1]) {
      for (const sx of [-1, 1]) put(new THREE.BoxGeometry(side, 0.14, 0.08), dark, sx * (G.w / 2 - 0.1 - side / 2), y, sz * (G.d / 2 + 0.02));
    }
  }
  // gờ mái thành (dưới mặt thành 2 cm, nhô 0,15 ra quanh)
  put(new THREE.BoxGeometry(G.w + 0.3, 0.38, G.d + 0.3), dark, 0, G.h - 0.21, 0);
  // vết nứt / mảng vá: vài khối sẫm nhô nhẹ trên mặt nam
  const rand = seededRandom(s.seed + 3);
  for (let i = 0; i < 5; i++) {
    const x = (rand() < 0.5 ? -1 : 1) * (aw / 2 + 1 + rand() * (G.w / 2 - aw / 2 - 2.2));
    put(new THREE.BoxGeometry(0.5 + rand() * 0.9, 0.18 + rand() * 0.3, 0.1), dark, x, 1.2 + rand() * (G.h - 3.5), G.d / 2 + 0.03);
  }
  parapet(g, s, earth, rand);
}

/** Răng cưa quanh mặt thành: tường thấp liền + răng 1 × 0,6 m cách 2 m; vài răng sập. Phía `climb` bỏ trống. */
function parapet(g: THREE.Group, s: SandCitySpec, earth: THREE.Material, rand: () => number): void {
  const G = s.gate;
  const put = putter(g);
  const t = PARAPET_T;
  const y0 = G.h - 0.04;
  const runs: [number, number, number, number][] = [
    // [tâm x, tâm z, dài, quay (0 = dọc x)]
    [0, G.d / 2 - t / 2 - 0.06, G.w - 0.12, 0],
    [0, -G.d / 2 + t / 2 + 0.06, G.w - 0.12, 0],
  ];
  if (G.climb !== 'dong') runs.push([G.w / 2 - t / 2 - 0.06, 0, G.d - 2 * t - 0.2, Math.PI / 2]);
  if (G.climb !== 'tay') runs.push([-G.w / 2 + t / 2 + 0.06, 0, G.d - 2 * t - 0.2, Math.PI / 2]);
  for (const [x, z, len, ry] of runs) {
    const wall = put(new THREE.BoxGeometry(len, 0.7, t), earth, x, y0 + 0.35, z);
    wall.rotation.y = ry;
    const n = Math.floor(len / 2);
    for (let i = 0; i < n; i++) {
      if (rand() < 0.18) continue; // răng sập
      const a = -len / 2 + (i + 0.5) * (len / n);
      const m = put(new THREE.BoxGeometry(1, 0.62, t + 0.08), earth, x + Math.cos(ry) * a, y0 + 0.7 + 0.29, z - Math.sin(ry) * a);
      m.rotation.y = ry;
    }
  }
  // đá đổ trên mép phía dốc cát (chỉ ngắm)
  if (G.climb) {
    const sx = G.climb === 'tay' ? -1 : 1;
    for (let i = 0; i < 4; i++) {
      const m = put(new THREE.BoxGeometry(0.6 + rand() * 0.5, 0.45, 0.5 + rand() * 0.4), earth, sx * (G.w / 2 - 0.6 - rand() * 0.8), G.h + 0.12, -G.d / 2 + 1.2 + rand() * (G.d - 2.4));
      m.rotation.set(rand() * 0.4, rand() * 3, rand() * 0.3);
    }
  }
}

/** Lầu cổng gỗ trên mặt thành: sàn, cột, vách ván có nẹp, cửa tối mặt nam, mái yết sơn ngói xám, nghiêng `tilt`. */
function tower(g: THREE.Group, s: SandCitySpec): void {
  const { gate: G, colors: c } = s;
  const T = G.tower;
  const t = new THREE.Group();
  t.position.set(0, G.h, towerZ(G) - G.z);
  t.rotation.z = (T.tilt * Math.PI) / 180;
  g.add(t);
  const put = putter(t);
  const wood = lambert(c.wood);
  const plank = lambert('#8c6a4c');
  put(new THREE.BoxGeometry(T.w + 0.4, 0.3, T.d + 0.4), wood, 0, 0.11, 0);
  // vách ván lùi 0,25 sau hàng cột
  put(new THREE.BoxGeometry(T.w - 0.5, T.h + 0.06, T.d - 0.5), plank, 0, 0.23 + T.h / 2, 0);
  const cols = Math.max(3, Math.round(T.w / 2.4) + 1);
  for (let i = 0; i < cols; i++) {
    const x = -T.w / 2 + 0.2 + (i * (T.w - 0.4)) / (cols - 1);
    for (const sz of [-1, 1]) put(new THREE.CylinderGeometry(0.17, 0.19, T.h + 0.06, 6), wood, x, 0.23 + T.h / 2, sz * (T.d / 2 - 0.2));
  }
  for (const sx of [-1, 1]) put(new THREE.CylinderGeometry(0.17, 0.19, T.h + 0.06, 6), wood, sx * (T.w / 2 - 0.2), 0.23 + T.h / 2, 0);
  // xà đầu cột
  put(new THREE.BoxGeometry(T.w - 0.3, 0.16, T.d - 0.3), wood, 0, 0.26 + T.h - 0.15, 0);
  // cửa tối giữa mặt nam
  put(new THREE.BoxGeometry(1.6, 2.3, 0.06), lambert(DARK), 0, 0.26 + 1.15, T.d / 2 - 0.2);
  // mái: váy dốc + mái hai mái, bờ nóc sẫm, đầu đao
  const y = 0.26 + T.h;
  const over = 0.9;
  const bw = T.w + 2 * over;
  const bd = T.d + 2 * over;
  const skirtH = T.roof * 0.38;
  const roof = roofMat(c.roof);
  const sk = new THREE.Mesh(skirtGeo(bw, bd, T.w + 0.3, T.d * 0.72, skirtH), roof);
  sk.position.y = y - 0.15;
  t.add(sk);
  put(prism(T.w + 0.7, T.d * 0.72 + 0.6, T.roof - skirtH), roof, 0, y - 0.2 + skirtH, 0);
  const ridge = lambert(c.ridge);
  put(new THREE.BoxGeometry(T.w + 1.1, 0.3, 0.34), ridge, 0, y - 0.2 + T.roof, 0);
  for (const sx of [-1, 1]) {
    const horn = put(new THREE.BoxGeometry(0.24, 0.8, 0.32), ridge, sx * (T.w / 2 + 0.45), y + T.roof + 0.1, 0);
    horn.rotation.z = -sx * 0.45;
  }
  cornerTips(t, y - 0.15, bw / 2 - 0.1, bd / 2 - 0.1, c.ridge, 0.9);
  // ngói vỡ: vài mảng sẫm trên mái nam
  const rand = seededRandom(s.seed + 9);
  const run = (bd - T.d * 0.72) / 2;
  for (let i = 0; i < 4; i++) {
    const dz = 0.5 + rand() * 0.4; // lùi từ mép hiên vào trên dốc váy
    const m = put(new THREE.BoxGeometry(0.7 + rand() * 0.6, 0.06, 0.5), lambert(DARK), -T.w / 2 + 1 + rand() * (T.w - 2), y - 0.15 + (dz / run) * skirtH + 0.05, bd / 2 - dz);
    m.rotation.x = Math.atan2(skirtH, run);
  }
}

/** Chóp cụt mái váy (như `kien_truc/mai.ts` skirt, nhưng trả hình để đặt trong nhóm nghiêng). */
function skirtGeo(bw: number, bd: number, tw: number, td: number, h: number): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(Math.SQRT1_2, Math.SQRT1_2, 1, 4, 1, true).rotateY(Math.PI / 4);
  const pos = g.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const up = pos.getY(i) > 0;
    pos.setXYZ(i, Math.sign(pos.getX(i)) * (up ? tw : bw) / 2, up ? h : 0, Math.sign(pos.getZ(i)) * (up ? td : bd) / 2);
  }
  g.deleteAttribute('normal');
  const flat = g.toNonIndexed();
  flat.computeVertexNormals();
  return flat;
}

/** Dựng cổng thành vùi cát ở nền `base`; trả tấm mặt thành. */
export function addSandGate(scene: THREE.Scene, colliders: Colliders, s: SandCitySpec, base: number): Pad[] {
  const G = s.gate;
  const g = new THREE.Group();
  g.position.set(G.x, base, G.z);
  body(g, s);
  tower(g, s);
  scene.add(g);
  const lay = gateLayout(G, base);
  for (const b of lay.boxes) colliders.add(b.x, b.z, b.w, b.d, b.h, { minY: b.minY, maxY: b.maxY });
  return lay.pads;
}

/**
 * Đầu lạc đà đá hiền ngủ quên (cao chuẩn 6,6 m, co theo `h`): cổ ngắn mập nhô khỏi cát, đầu to dài, mõm tròn, tai nhỏ,
 * mắt nhắm cong, miệng mỉm — đá nhiều mặt. Gốc ở mặt cát; cổ chặn người đi (vòng tròn), đầu vươn trước cao trên đầu người.
 */
export function addCamelHead(scene: THREE.Scene, colliders: Colliders, s: SandCitySpec, base: number): void {
  const C = s.camel;
  const k = C.h / 6.6;
  const g = new THREE.Group();
  g.position.set(C.x, base, C.z);
  g.rotation.y = (C.rotY * Math.PI) / 180;
  g.scale.setScalar(k);
  const put = putter(g);
  const stone = lambert(s.colors.camel);
  const dark = lambert(s.colors.camelDark);
  const ico = (r: number, d = 1): THREE.BufferGeometry => new THREE.IcosahedronGeometry(r, d);
  // cổ: trụ mập hơi chúi về trước, chân chôn dưới cát; gáy tròn nối đầu
  const neck = put(new THREE.CylinderGeometry(1.45, 1.9, 5, 10), stone, 0, 1.5, -0.4);
  neck.rotation.x = 0.18;
  put(ico(1.4), stone, 0, 3.9, 0);
  // đầu: khối dài nằm ngang về trước (+z), mõm tròn, môi dưới
  put(ico(1.0).scale(1.5, 1.3, 2.3), stone, 0, 4.6, 1.2);
  put(ico(1.0).scale(1.25, 1.05, 1.3), stone, 0, 4.1, 3.3);
  put(ico(0.8).scale(1.1, 0.5, 1.0), stone, 0, 3.45, 3.25);
  // tai + mào lông
  for (const sx of [-1, 1]) {
    const ear = put(new THREE.ConeGeometry(0.32, 0.85, 5), stone, sx * 0.95, 5.75, 0.6);
    ear.rotation.set(-0.5, 0, -sx * 0.55);
  }
  put(ico(0.6, 0).scale(1.3, 0.7, 1.4), stone, 0, 5.85, 1.0);
  // mắt nhắm cong (vệt sẫm), lỗ mũi, miệng mỉm
  for (const sx of [-1, 1]) {
    const eye = put(new THREE.TorusGeometry(0.26, 0.05, 3, 8, Math.PI), dark, sx * 1.36, 5.0, 2.0);
    eye.rotation.set(0, sx * 1.2, Math.PI);
    const nos = put(new THREE.SphereGeometry(0.1, 5, 4).scale(1, 0.6, 1), dark, sx * 0.4, 4.35, 4.47);
    nos.rotation.y = sx * 0.3;
  }
  const smile = put(new THREE.TorusGeometry(0.5, 0.05, 3, 10, Math.PI * 0.8), dark, 0, 3.92, 4.52);
  smile.rotation.set(0.3, 0, Math.PI + Math.PI * 0.1);
  scene.add(g);
  // cổ lùi sau tâm 0,4 m (đầu vươn về trước, cao trên đầu người)
  const a = g.rotation.y;
  colliders.addCircle(C.x - Math.sin(a) * 0.4 * k, C.z - Math.cos(a) * 0.4 * k, 1.95 * k);
}
