/**
 * Mẫu nhà đợt 2 của bộ asset chuẩn (`danh_muc.ts`) — biên ải, tạm: nhà đất nện `nha-dat`, địch lâu `dich-lau`, phong hoả
 * đài `phong-hoa`, lều `leu` (+ `leu-chi-huy`). Cấp C6 (không ngói, không cột son); chòi trên địch lâu C5. Màu gạch / đất /
 * vải trùng vật biên ải cũ (`vat_bien_ai.ts`, `vat_sa_mac.ts`) để gộp chung một lần vẽ. Toạ độ hệ nhà, mặt trước +z.
 */
import * as THREE from 'three';
import { lambert } from '../materials';
import { cuaVom, GACH, rangCua, than, type Build } from './bo_phan';
import type { Style } from './chi_tiet';
import { maiDua, ngoi } from './danh_muc';
import { box, column, frustum, prism } from './hinh';
import { dungMai } from './mai_giong';

const EARTH = '#b9946a';
const EARTH_DARK = '#94714c';
const REED_LINE = '#8a7a52';
const TENT = '#d8cfb8';
const TENT_TRIM = '#7a3a2a';

/** Nhóm con đặt ở (x, z), xoay `ry`, đã gắn vào `g`. */
function sub(g: THREE.Group, x: number, z: number, ry = 0): THREE.Group {
  const s = new THREE.Group();
  s.position.set(x, 0, z);
  s.rotation.y = ry;
  g.add(s);
  return s;
}

/* ---------------- nhà đất nện ---------------- */

/** Một khối nhà đất `w` × `d` cao `h`: lớp nện (vạch lau sậy), mái bằng có gờ, đầu rui gỗ, `doors` cửa + cửa sổ mặt +z. */
function khoiDat(g: THREE.Group, w: number, d: number, h: number, doors: number, style: Style): void {
  g.add(box(w, h, d, EARTH, 0, h / 2, 0));
  g.add(box(w + 0.2, 0.5, d + 0.2, EARTH_DARK, 0, h + 0.25, 0));
  for (const y of [h / 3, (2 * h) / 3]) g.add(box(w + 0.06, 0.08, d + 0.06, REED_LINE, 0, y, 0));
  const n = Math.max(3, Math.round(w / 1.3));
  const rafter = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 5).rotateX(Math.PI / 2);
  const wood = lambert(style.timber);
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(rafter, wood);
    m.position.set(-w / 2 + ((i + 0.5) * w) / n, h - 0.3, d / 2 + 0.15);
    g.add(m);
  }
  for (let i = 0; i < doors; i++) {
    const x = -w / 2 + ((i + 0.5) * w) / doors;
    g.add(box(1.1, 2.1, 0.08, style.timber, x - 0.4, 1.05, d / 2 + 0.03));
    g.add(box(0.6, 0.5, 0.08, GACH.dark, x + 0.9, 1.6, d / 2 + 0.03));
  }
}

/** Nhà đất: S 1 ô · M 2 ô liền · L 3 ô quanh sân chữ U (mở về +z), cửa nhìn vào sân. */
const nhaDat: Build = (g, _m, c, _giong, style) => {
  if (c.bien !== 'chu-u') return khoiDat(g, c.w, c.d, c.cot, c.gian, style);
  const t = 5; // sâu mỗi dãy
  khoiDat(sub(g, 0, -c.d / 2 + t / 2), c.w, t, c.cot, 3, style);
  const len = c.d - t;
  for (const s of [-1, 1]) khoiDat(sub(g, s * (c.w / 2 - t / 2), -c.d / 2 + t + len / 2, (-s * Math.PI) / 2), len, t, c.cot, 1, style);
};

/* ---------------- địch lâu rỗng ---------------- */

/**
 * Địch lâu 空心敵台: chân đá, thân gạch cao tới mặt tường (6 m, có gờ đá), tầng rỗng trên có 3 cửa vòm mỗi mặt, mũ đá +
 * răng cưa quanh nóc, chòi 鋪房 3 gian mái ngạnh sơn (C5) giữa mặt nóc.
 */
const dichLau: Build = (g, _m, c, giong, style) => {
  const s = c.w;
  const top = c.cot - 1.1; // mặt mũ đá; răng cưa 1,1 m lên tới `cot`
  g.add(box(s + 0.4, 1.2, s + 0.4, GACH.cap, 0, 0.6, 0));
  g.add(box(s, top - 0.3, s, GACH.brick, 0, (top - 0.3) / 2, 0));
  g.add(box(s + 0.3, 0.3, s + 0.3, GACH.cap, 0, 6.15, 0)); // gờ ngang mặt tường
  g.add(box(s + 0.3, 0.3, s + 0.3, GACH.cap, 0, top - 0.15, 0));
  rangCua(g, s, s, top, GACH.brick, 0.05);
  for (const [ry, dx, dz] of [[0, 0, 1], [Math.PI, 0, -1], [Math.PI / 2, 1, 0], [-Math.PI / 2, -1, 0]] as const) {
    for (const k of [-s / 4, 0, s / 4]) {
      const x = dz !== 0 ? k : dx * (s / 2 + 0.02);
      const z = dz !== 0 ? dz * (s / 2 + 0.02) : k;
      cuaVom(g, x, 7.4, z, 1.2, 2.4, ry);
    }
  }
  const cap = 5;
  const y = than(g, { w: 6, d: 4.2, y0: top, cot: 2.6, gian: 3, cap, kieu: 'vach' }, style);
  dungMai(g, { kieu: 'nganh-son', w: 6, d: 4.2, y, over: maiDua(cap, 2.6), giong, color: ngoi(cap, giong), ridgeColor: style.ridge });
};

/* ---------------- phong hoả đài ---------------- */

/** Thang gỗ dựa mặt +z của tháp chóp cụt: chân ở z0 (mặt đáy), đỉnh lùi `lean` ở cao `h`. */
function thang(g: THREE.Group, z0: number, h: number, lean: number, style: Style): void {
  const len = Math.hypot(h, lean);
  const tilt = -Math.atan2(lean, h);
  const wood = lambert(style.timber);
  const rail = new THREE.BoxGeometry(0.1, len, 0.1);
  for (const x of [-0.35, 0.35]) {
    const m = new THREE.Mesh(rail, wood);
    m.position.set(x, h / 2, z0 + 0.25 - lean / 2);
    m.rotation.x = tilt;
    g.add(m);
  }
  const rung = new THREE.BoxGeometry(0.8, 0.06, 0.06);
  for (let y = 0.6; y < h - 0.2; y += 0.8) {
    const m = new THREE.Mesh(rung, wood);
    m.position.set(0, y, z0 + 0.25 - (lean * y) / h);
    g.add(m);
  }
}

/**
 * Phong hoả đài: S gạch — tháp chóp cụt đáy `w` cao `cot`, mũ đá + răng cưa, lò khói; M đất nện — tháp đáy 9 có vạch
 * nện, gờ đất trên nóc, sân 坞 13 × 11 phía trước (tường đất, khe cổng, nhà lính). Thang gỗ dựa mặt trước.
 */
const phongHoa: Build = (g, _m, c, _giong, style) => {
  const dat = c.bien === 'dat';
  const base = dat ? 9 : c.w;
  const tw = base * (dat ? 2 / 3 : 0.73);
  const h = c.cot;
  const zt = dat ? -c.d / 2 + base / 2 : 0;
  const t = sub(g, 0, zt);
  t.add(new THREE.Mesh(frustum(base, base, tw, tw, h), lambert(dat ? EARTH : GACH.brickDark)));
  const at = (y: number): number => base + ((tw - base) * y) / h; // bề rộng thân ở cao y
  if (dat) {
    for (const y of [h / 4, h / 2, (3 * h) / 4]) t.add(new THREE.Mesh(frustum(at(y) + 0.1, at(y) + 0.1, at(y + 0.15) + 0.1, at(y + 0.15) + 0.1, 0.15), lambert(EARTH_DARK)).translateY(y));
    const p = tw;
    for (const s of [-1, 1]) {
      t.add(box(p, 0.9, 0.4, EARTH_DARK, 0, h + 0.45, s * (p / 2 - 0.2)));
      t.add(box(0.4, 0.9, p - 0.8, EARTH_DARK, s * (p / 2 - 0.2), h + 0.45, 0));
    }
  } else {
    t.add(box(base + 0.4, 0.6, base + 0.4, GACH.cap, 0, 0.3, 0));
    t.add(box(tw + 0.4, 0.3, tw + 0.4, GACH.cap, 0, h + 0.15, 0));
    rangCua(t, tw + 0.1, tw + 0.1, h + 0.3, GACH.brickDark, 0.05);
  }
  t.add(column(0.7, 1.2, GACH.dark, 0, h + (dat ? 0 : 0.3), 0, 6)); // lò khói
  thang(t, base / 2, h, (base - tw) / 2, style);
  if (!dat) return;
  // sân 坞 trước tháp: tường đất cao 2,4 dày 0,8, khe cổng 2 m giữa mặt trước, nhà lính góc trái
  const sw = c.w;
  const z0 = zt + base / 2;
  const z1 = c.d / 2;
  const wh = 2.4;
  for (const s of [-1, 1]) {
    const fw = (sw - 2) / 2;
    g.add(box(fw, wh, 0.8, EARTH, s * (1 + fw / 2), wh / 2, z1 - 0.4));
    g.add(box(0.8, wh, z1 - 0.8 - z0, EARTH, s * (sw / 2 - 0.4), wh / 2, (z0 + z1 - 0.8) / 2));
    const bw = sw / 2 - 0.8 - base / 2 + 0.3;
    g.add(box(bw, wh, 0.8, EARTH, s * (base / 2 - 0.3 + bw / 2), wh / 2, z0 + 0.4));
  }
  const hut = sub(g, -sw / 2 + 0.8 + 2.2, z1 - 0.8 - 1.8);
  hut.add(box(4, 2.6, 3, EARTH, 0, 1.3, 0));
  hut.add(box(4.2, 0.3, 3.2, EARTH_DARK, 0, 2.75, 0));
  hut.add(box(1, 1.9, 0.08, style.timber, 1, 0.95, 1.53));
};

/* ---------------- lều · sạp ---------------- */

/**
 * Lều: S sạp 4 cọc, quầy, mái vải nghiêng (màu `cloth`) · M lều quân hai dốc (sống dọc), vách chân, viền đỏ, cửa tối ·
 * L lều tròn 穹廬 (vách nỉ 12 cạnh, mái nón, vòng đỉnh gỗ, cửa gỗ).
 */
const leu: Build = (g, _m, c, _giong, style) => {
  const wood = lambert(style.timber);
  if (c.bien === 'sap') {
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) g.add(column(0.06, c.cot - (z > 0 ? 0.3 : 0), style.timber, (x * c.w) / 2.2, 0, (z * c.d) / 2.2, 5));
    g.add(box(c.w * 0.8, 0.8, 0.7, style.timber, 0, 0.4, c.d / 2 - 0.55));
    const roof = new THREE.Mesh(new THREE.BoxGeometry(c.w + 0.5, 0.05, c.d + 0.6), lambert(style.cloth, { side: THREE.DoubleSide }));
    roof.position.set(0, c.cot - 0.12, 0);
    roof.rotation.x = 0.16; // dốc ra trước (+z thấp)
    g.add(roof);
    return;
  }
  if (c.bien === 'tron') {
    const r = c.w / 2;
    const n = 12;
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, c.cot, n), lambert(TENT)).translateY(c.cot / 2));
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(r + 0.03, r + 0.03, 0.18, n, 1, true), lambert(TENT_TRIM)).translateY(c.cot - 0.3));
    g.add(new THREE.Mesh(new THREE.ConeGeometry(r + 0.25, 1.6, n), lambert(TENT)).translateY(c.cot + 0.8));
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8), wood).translateY(c.cot + 1.55));
    g.add(box(0.9, 1.5, 0.12, style.timber, 0, 0.75, r - 0.02));
    return;
  }
  // lều quân: sống chạy dọc z, đầu hồi trước có cửa
  const wall = 0.6;
  g.add(box(c.w, wall, c.d, TENT, 0, wall / 2, 0));
  g.add(box(c.w + 0.06, 0.12, c.d + 0.06, TENT_TRIM, 0, wall, 0));
  g.add(new THREE.Mesh(prism(c.d, c.w, c.cot - wall).rotateY(Math.PI / 2), lambert(TENT)).translateY(wall));
  g.add(box(1, 1.7, 0.08, GACH.dark, 0, 0.85, c.d / 2 + 0.05));
  for (const z of [-c.d / 2 - 0.3, c.d / 2 + 0.3]) g.add(column(0.05, c.cot + 0.4, style.timber, 0, 0, z, 5)); // cọc sống
};

/** Lều chỉ huy 8 × 10: vách vải, mái chái vải, mái hiên trước trên hai cọc, cửa tối, cột cờ có phướn đỏ. */
const leuChiHuy: Build = (g, _m, c, _giong, style) => {
  const wall = 2.2;
  g.add(box(c.w, wall, c.d, TENT, 0, wall / 2, 0));
  g.add(box(c.w + 0.06, 0.14, c.d + 0.06, TENT_TRIM, 0, wall - 0.2, 0));
  g.add(new THREE.Mesh(frustum(c.w + 0.5, c.d + 0.5, 0.6, c.d - c.w + 0.6, c.cot - 1), lambert(TENT, { side: THREE.DoubleSide })).translateY(wall));
  g.add(box(2.4, 1.9, 0.08, GACH.dark, 0, 0.95, c.d / 2 + 0.05));
  const awn = new THREE.Mesh(new THREE.BoxGeometry(4, 0.06, 2.6), lambert(TENT_TRIM, { side: THREE.DoubleSide }));
  awn.position.set(0, wall + 0.05, c.d / 2 + 1.25);
  awn.rotation.x = 0.2;
  g.add(awn);
  for (const s of [-1, 1]) g.add(column(0.07, wall - 0.25, style.timber, s * 1.9, 0, c.d / 2 + 2.4, 5));
  g.add(column(0.09, 7, style.timber, c.w / 2 + 1.2, 0, c.d / 2 - 0.5, 6));
  g.add(box(0.05, 2.2, 1.2, TENT_TRIM, c.w / 2 + 1.2, 5.6, c.d / 2 + 0.15));
};

/** Hàm dựng mẫu đợt 2 (biên ải, tạm) — `mau_nha.ts` gộp vào bảng chung. */
export const BUILD_BIEN: Record<string, Build> = {
  'nha-dat': nhaDat,
  'dich-lau': dichLau,
  'phong-hoa': phongHoa,
  leu,
  'leu-chi-huy': leuChiHuy,
};
