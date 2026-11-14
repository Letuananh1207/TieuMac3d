import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Style } from './buildings';
import { lambert } from './materials';
import { markDynamic } from './merge';
import { rotateXZ, type PropSpec, type SceneSpec } from './spec';
import type { GroundY } from './terrainHeight';
import { banner, honorBoard, teaTable, umbrellaStall } from './kien_truc/do_pho';
import { signMesh } from './signAtlas';
import { drawSundial } from './textures';
import { hacDong, hang, lacDa, ruaDong } from './vat_vung';
import { trucProp } from './vat_truc';
import { giangNamProp } from './vat_giang_nam';
import { bongLaiProp } from './vat_bong_lai';
import { bienAiProp } from './vat_bien_ai';
import { cungDienProp } from './cung_dien';
import { saMacProp } from './vat_sa_mac';

/** Cột cờ đứng lẻ (cờ 茶 bên trà lâu): cao bằng hai tầng nhà. */
const BANNER_POLE = 9;
/** Bậc xuống nước (`ben-nuoc`): mặt nước thấp hơn bờ 1 m — khớp `water[].sunk` của Giang Nam. */
const KE_GIANG_NAM = 1;
/** Tấm ngự lộ (`ngu-lo`): cao bằng tầng trên Tam Đài Tử Cấm Thành. */
const TAM_DAI = 2.7;

/** Thứ chuyển động trong cảnh (khói, mây…): gọi mỗi khung hình. */
export type Updater = (dt: number) => void;

const PUFFS = 4;
const SMOKE_RISE = 3.2; // khói bay lên bao cao rồi lặp lại

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

/** chữ khắc trên mặt nhật quỹ */
const SUNDIAL_INK = '#24323a';
/** mặt quỹ song song xích đạo: ngửa về bắc (−z), nghiêng 50° so với mặt đất (vĩ độ ≈ 40°, như nhật quỹ điện Thái Hoà) */
const SUNDIAL_TILT = (50 * Math.PI) / 180;

/** Pha màu đá: k > 0 sáng về trắng, k < 0 tối về đen. */
function shade(hex: string, k: number): string {
  return `#${new THREE.Color(hex).lerp(new THREE.Color(k > 0 ? 0xffffff : 0x000000), Math.abs(k)).getHexString()}`;
}

/**
 * Nhật quỹ 日晷: bệ đá tu-di vuông 1,4 m cao 1,1 m (hai tầng, thắt eo), trụ đỡ, đĩa đá Ø 1,5 nghiêng ngửa về bắc, mặt
 * khắc 12 giờ (ảnh biển chung — không thêm draw call), kim đồng xuyên tâm vuông góc mặt đĩa. Trả về cạnh bệ (va chạm hộp).
 */
function nhatQuy(g: THREE.Group, style: Style): number {
  const stone = lambert(style.stone);
  const dark = lambert(shade(style.stone, -0.18));
  const light = shade(style.stone, 0.4);
  const slab = (w: number, h: number, y: number, m: THREE.Material): void => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), m);
    b.position.y = y + h / 2;
    g.add(b);
  };
  slab(1.4, 0.22, 0, dark); // chân
  slab(1.2, 0.12, 0.22, stone);
  slab(1.0, 0.4, 0.34, stone); // eo
  slab(1.2, 0.12, 0.74, stone);
  slab(1.4, 0.24, 0.86, dark); // mặt bệ, đỉnh 1,1 m
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.6, 8), stone);
  post.position.y = 1.4;
  g.add(post);

  const dial = new THREE.Group();
  dial.position.y = 1.75;
  dial.rotation.x = -SUNDIAL_TILT; // trục đĩa (y) → (0; sin 40°; −cos 40°): chĩa lên thiên cực bắc
  g.add(dial);
  dial.add(new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.12, 24), lambert(light)));
  // mặt khắc: ô ảnh vuông → đĩa tròn (đổi lưới, giữ toạ độ ảnh của ô)
  const face = signMesh(1.4, 1.4, 384, 384, (c, w, h) => drawSundial(c, w, h, light, SUNDIAL_INK));
  const uv = face.geometry.getAttribute('uv') as THREE.BufferAttribute;
  const [u0, u1, v0, v1] = [Math.min(uv.getX(0), uv.getX(1)), Math.max(uv.getX(0), uv.getX(1)), Math.min(uv.getY(0), uv.getY(2)), Math.max(uv.getY(0), uv.getY(2))];
  const disc = new THREE.CircleGeometry(0.7, 24);
  const duv = disc.getAttribute('uv') as THREE.BufferAttribute;
  for (let i = 0; i < duv.count; i++) duv.setXY(i, u0 + duv.getX(i) * (u1 - u0), v0 + duv.getY(i) * (v1 - v0));
  // xoay 180° quanh pháp tuyến rồi nằm ngửa: 子 ở mép cao (nam), 午 ở mép thấp (bắc) — bóng chính ngọ đổ về bắc
  disc.rotateZ(Math.PI).rotateX(-Math.PI / 2);
  face.geometry.dispose();
  face.geometry = disc;
  face.position.y = 0.061;
  // mặt nam cũng khắc (nhật quỹ thật dùng mặt này mùa đông) — người chơi vào từ cổng nam thấy chữ; lật quanh trục z
  // của đĩa: 子 vẫn ở mép cao
  const back = new THREE.Mesh(disc.clone().rotateZ(Math.PI), face.material);
  back.position.y = -0.061;
  dial.add(face, back);
  const gnomon = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.3, 6), lambert(style.bronze));
  dial.add(gnomon);
  return 1.4;
}

/** Màu cây tứ quân tử trong bồn hoa (lấy từ `trees` của đặc tả). */
export type Flora = Pick<SceneSpec['trees'], 'plum' | 'bamboo' | 'orchid' | 'mum'>;

const blossomGeo = new THREE.IcosahedronGeometry(0.08, 0);

/** Thêm một khối vào [g] tại (x; y; z), xoay quanh trục [rz] / [rx] (radian). */
function put(g: THREE.Group, geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, rx = 0, rz = 0): THREE.Mesh {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z);
  o.rotation.set(rx, 0, rz);
  g.add(o);
  return o;
}

/**
 * Bồn hoa đá lục giác (Ø ≈ 1,3 m, cao 0,6 m) trồng một cây tứ quân tử theo [plant]: 梅 mai (cành gãy khúc, hoa hồng) ·
 * 蘭 lan (lá dài cong rủ, vài hoa ngà) · 竹 trúc (5 thân, chỏm lá) · 菊 cúc (bụi tròn, hoa vàng). Trả về bán kính va chạm.
 */
function bonHoa(g: THREE.Group, style: Style, flora: Flora, plant: string): number {
  put(g, new THREE.CylinderGeometry(0.6, 0.48, 0.55, 6), lambert(style.stone), 0, 0.275, 0);
  put(g, new THREE.CylinderGeometry(0.66, 0.66, 0.08, 6), lambert(shade(style.stone, -0.18)), 0, 0.57, 0);
  put(g, new THREE.CylinderGeometry(0.55, 0.55, 0.04, 6), lambert(shade(style.floor, -0.45)), 0, 0.6, 0);
  const y0 = 0.6;
  if (plant === '梅') {
    const wood = lambert(flora.plum[0]);
    const tips: [number, number, number][] = [];
    // [x, z, nghiêng x, nghiêng z, dài] — cành gãy khúc toả từ gốc
    for (const [x, z, rx, rz, len] of [[0, 0, 0.1, 0.25, 1.2], [0.12, 0.05, -0.2, -0.55, 1.0], [-0.1, -0.05, 0.45, 0.35, 0.85], [0.05, -0.1, -0.5, 0.1, 0.75]] as const) {
      put(g, new THREE.CylinderGeometry(0.03, 0.06, len, 5).translate(0, len / 2, 0), wood, x, y0, z, rx, rz);
      // đầu cành: (0; len; 0) xoay Rz rồi Rx (Euler XYZ)
      tips.push([x - Math.sin(rz) * len, y0 + Math.cos(rz) * Math.cos(rx) * len, z + Math.cos(rz) * Math.sin(rx) * len]);
    }
    const pink = [lambert(flora.plum[1]), lambert(flora.plum[2])];
    tips.forEach(([x, y, z], i) => {
      for (let k = 0; k < 6; k++) {
        const a = i * 2.1 + k * 1.6;
        put(g, blossomGeo, pink[(i + k) % 2], x + Math.cos(a) * 0.15, y - k * 0.1, z + Math.sin(a) * 0.15);
      }
    });
  } else if (plant === '竹') {
    const culm = lambert(flora.bamboo[0]);
    const leaf = lambert(flora.bamboo[1]);
    const blade = new THREE.ConeGeometry(0.06, 0.42, 3).scale(1, 1, 0.3).translate(0, 0.21, 0);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const [x, z, h] = [Math.cos(a) * 0.22, Math.sin(a) * 0.22, 1.5 + (i % 3) * 0.35];
      put(g, new THREE.CylinderGeometry(0.035, 0.04, h, 5).translate(0, h / 2, 0), culm, x, y0, z, Math.sin(a) * 0.08, -Math.cos(a) * 0.08);
      // phiến lá nhỏ chĩa xiên xuống, từng chùm ở nửa trên thân
      for (let k = 0; k < 6; k++) {
        const b = a + k * 2.4;
        const y = y0 + h * (0.55 + (k % 3) * 0.17);
        put(g, blade, leaf, x + Math.cos(b) * 0.05, y, z + Math.sin(b) * 0.05, Math.sin(b) * 1.9, -Math.cos(b) * 1.9);
      }
    }
  } else if (plant === '蘭') {
    const leaf = lambert(flora.orchid[0]);
    const leafGeo = new THREE.ConeGeometry(0.05, 1.05, 3).scale(1, 1, 0.4).translate(0, 0.52, 0);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const tilt = 0.5 + (i % 3) * 0.25; // lá dài cong rủ ra ngoài
      put(g, leafGeo, leaf, 0, y0, 0, Math.sin(a) * tilt, -Math.cos(a) * tilt);
    }
    const flower = lambert(flora.orchid[1]);
    for (const a of [0.6, 1.4, 2.7, 3.5, 4.6, 5.4]) put(g, blossomGeo, flower, Math.cos(a) * 0.12, y0 + 0.62 + (a % 1) * 0.15, Math.sin(a) * 0.12);
  } else {
    put(g, new THREE.IcosahedronGeometry(0.45, 0).scale(1, 0.7, 1), lambert(flora.mum[0]), 0, y0 + 0.3, 0);
    const flower = lambert(flora.mum[1]);
    const head = new THREE.IcosahedronGeometry(0.1, 0).scale(1, 0.6, 1);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + (i % 2) * 0.3;
      const r = i % 3 === 0 ? 0.12 : 0.34;
      put(g, head, flower, Math.cos(a) * r, y0 + 0.58 - r * 0.45, Math.sin(a) * r);
    }
  }
  return 0.66;
}

/** Vật trang trí trong các khu. Trả về hàm cập nhật cho thứ chuyển động (khói lò đan, khói hương). */
export function addProps(
  scene: THREE.Scene,
  colliders: Colliders,
  list: PropSpec[],
  style: Style,
  flora: Flora,
  groundY: GroundY = () => 0,
): Updater {
  const updaters: Updater[] = [];
  const plants: THREE.Vector3[] = [];
  for (const p of list) {
    const rot = p.rotY ?? 0;
    const s = p.scale ?? 1;
    const g = new THREE.Group();
    g.position.set(p.x, p.y ?? groundY(p.x, p.z), p.z);
    g.rotation.y = (rot * Math.PI) / 180;
    g.scale.setScalar(s);
    const box = (w: number, d: number): void => {
      const [ww, dd] = rot % 180 !== 0 ? [d, w] : [w, d];
      colliders.add(p.x, p.z, ww * s, dd * s);
    };
    switch (p.kind) {
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
      case 'bon-hoa':
        colliders.addCircle(p.x, p.z, bonHoa(g, style, flora, p.text ?? '梅') * s);
        break;
      case 'nhat-quy': {
        const w = nhatQuy(g, style);
        box(w, w);
        break;
      }
      case 'ban-tra': {
        const t = teaTable(g, 0, 0);
        box(t.w, t.d);
        break;
      }
      case 'sap-o': {
        const t = umbrellaStall(g, style);
        box(t.w, t.d);
        break;
      }
      case 'co':
        updaters.push(banner(g, style, p.text ?? '茶', BANNER_POLE, p.x + p.z));
        colliders.addCircle(p.x, p.z, 0.25 * s);
        break;
      case 'bang': {
        const t = honorBoard(g, style, p.text ?? 'Bảng vinh danh');
        box(t.w, t.d);
        break;
      }
      case 'hac-dong':
        colliders.addCircle(p.x, p.z, hacDong(g, style) * s);
        break;
      case 'rua-dong':
        box(...ruaDong(g, style));
        break;
      case 'lac-da':
        box(...lacDa(g, style, p.x * 0.7 + p.z, updaters));
        break;
      case 'hang':
        box(...hang(g, style));
        break;
      default: {
        // vật Rừng trúc (vat_truc.ts) · Giang Nam (vat_giang_nam.ts; bậc bến theo kè cao 1 m)
        const c =
          trucProp(p.kind, g, style, p.text, p.x + p.z, updaters) ??
          giangNamProp(p.kind, g, style, KE_GIANG_NAM) ??
          bongLaiProp(p.kind, g, style, p.text, p.x + p.z, updaters) ??
          bienAiProp(p.kind, g, style, p.text, p.x + p.z, updaters) ??
          cungDienProp(p.kind, g, style, TAM_DAI) ??
          saMacProp(p.kind, g, style, p.x * 3 + p.z);
        if (c?.box) box(...c.box);
        if (c?.circle) colliders.addCircle(p.x, p.z, c.circle * s);
        for (const [bx, bz, bw, bd] of c?.boxes ?? []) {
          const [wx, wz] = rotateXZ(bx * s, bz * s, rot);
          const [ww, dd] = rot % 180 !== 0 ? [bd, bw] : [bw, bd];
          colliders.add(p.x + wx, p.z + wz, ww * s, dd * s);
        }
        for (const [dx, dz] of c?.posts ?? []) {
          const [wx, wz] = rotateXZ(dx * s, dz * s, rot);
          colliders.addCircle(p.x + wx, p.z + wz, 0.3 * s);
        }
      }
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
