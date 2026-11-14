/**
 * Mẫu nhà đợt 2 của bộ asset chuẩn (`danh_muc.ts`) — vườn, thờ, cổng: hành lang `lang`, thạch phảng `phuong`, từ miếu
 * `tu-mieu`, lầu trên đôn đài `lau-thanh`. Dựng từ bộ phận chung (`bo_phan.ts`) + mái chuẩn (`mai_giong.ts`), như đợt 1
 * (`mau_nha.ts`). Toạ độ hệ nhà, mặt trước nhìn +z. Dùng cho Catalog 3D; map chuyển sang ở GĐ 5.
 */
import * as THREE from 'three';
import { cuaVom, GACH, nen, rangCua, than, type Build } from './bo_phan';
import { addBeamBand, type Style } from './chi_tiet';
import { cotSon, DOC, maiDua, ngoi, type Cap, type Giong, type Mai } from './danh_muc';
import { box, column } from './hinh';
import { roofMat } from './mai';
import { dungMai, hienDuoi } from './mai_giong';

/** Tường cung đỏ + đá trắng viền (Ngọ Môn) — cùng màu `cung_dien.ts`. */
const RED = '#9b2f24';
const MARBLE = '#e6e2d6';

/** Nhóm con đặt ở (x, y, z), xoay `ry`, đã gắn vào `g`. */
function sub(g: THREE.Group, x: number, z: number, y = 0, ry = 0): THREE.Group {
  const s = new THREE.Group();
  s.position.set(x, y, z);
  s.rotation.y = ry;
  g.add(s);
  return s;
}

/* ---------------- hành lang 廊 ---------------- */

interface Doan {
  w: number;
  d: number;
  /** cao mặt nền đoạn (bò núi: mỗi gian cao dần) */
  y0: number;
  cot: number;
  gian: number;
  cap: Cap;
  giong: Giong;
  roof: string;
}

/** Một đoạn hành lang thẳng: nền đá, hai hàng cột chia gian đều, xà dọc + xà ngang, ghế thấp hai bên, mái quyển bồng. */
function doanLang(g: THREE.Group, o: Doan, style: Style): void {
  const pillar = cotSon(o.cap) ? style.pillar : style.timber;
  g.add(box(o.w + 0.4, o.y0 + 0.3, o.d + 0.4, style.base, 0, (o.y0 + 0.3) / 2, 0));
  const yf = o.y0 + 0.3;
  const r = o.cot / 22;
  const zs = [-o.d / 2 + r, o.d / 2 - r];
  for (let i = 0; i <= o.gian; i++) {
    const x = -o.w / 2 + (i * o.w) / o.gian;
    for (const z of zs) g.add(column(r, o.cot, pillar, x, yf, z));
    g.add(box(0.18, 0.25, o.d, style.eave, x, yf + o.cot - 0.125, 0)); // xà ngang đầu cột
  }
  for (const z of zs) {
    g.add(box(o.w + 0.3, 0.3, 0.22, style.eave, 0, yf + o.cot - 0.15, z)); // xà dọc
    g.add(box(o.w - 0.2, 0.45, 0.3, style.timber, 0, yf + 0.225, z * 0.92)); // ghế thấp giữa cột
  }
  dungMai(g, { kieu: 'quyen-bong', w: o.w, d: o.d, y: yf + o.cot, over: maiDua(o.cap, o.cot), giong: o.giong, color: o.roof, ridgeColor: style.ridge });
}

/**
 * Lang bồng ven kênh: tường vôi phía sau (lậu song), một hàng cột phía nước, mái một dốc theo giọng từ đỉnh tường xuống
 * mép hiên, ghế 美人靠 tựa ra nước.
 */
function langVenKenh(g: THREE.Group, o: Doan, style: Style): void {
  const pillar = cotSon(o.cap) ? style.pillar : style.timber;
  g.add(box(o.w + 0.4, 0.3, o.d + 0.4, style.base, 0, 0.15, 0));
  g.add(box(o.w + 4, 0.05, 4, style.water, 0, 0.025, o.d / 2 + 2.2)); // kênh trước mặt
  const yf = 0.3;
  const slope = (DOC[o.giong].hien * Math.PI) / 180;
  const over = 0.6;
  const yBack = yf + o.cot + o.d * Math.tan(slope); // mái chạm tường sau
  g.add(box(o.w, yBack + 0.2 - yf, 0.3, style.wall, 0, (yf + yBack + 0.2) / 2, -o.d / 2));
  for (const x of [-o.w / 4, o.w / 4]) g.add(box(0.9, 0.9, 0.05, style.timber, x, yf + 1.6, -o.d / 2 + 0.17)); // lậu song
  const r = o.cot / 22;
  for (let i = 0; i <= o.gian; i++) g.add(column(r, o.cot, pillar, -o.w / 2 + (i * o.w) / o.gian, yf, o.d / 2 - r));
  g.add(box(o.w + 0.3, 0.3, 0.22, style.eave, 0, yf + o.cot - 0.15, o.d / 2 - r));
  // mái một dốc: tấm từ đỉnh tường (z = −d/2) xuống mép hiên (z = d/2 + over)
  const run = o.d + over;
  const len = run / Math.cos(slope);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(o.w + 0.6, 0.15, len), roofMat(o.roof));
  slab.position.set(0, yBack - (run / 2) * Math.tan(slope) + 0.1, -o.d / 2 + run / 2);
  slab.rotation.x = slope;
  g.add(slab);
  g.add(box(o.w + 0.7, 0.25, 0.45, style.ridge, 0, yBack + 0.3, -o.d / 2)); // bờ đỉnh tường
  // 美人靠: ghế + lưng tựa ngả ra nước
  g.add(box(o.w - 0.2, 0.45, 0.35, style.timber, 0, yf + 0.225, o.d / 2 - 0.4));
  const back = new THREE.Mesh(new THREE.BoxGeometry(o.w - 0.2, 0.55, 0.06), new THREE.MeshLambertMaterial({ color: style.timber }));
  back.position.set(0, yf + 0.75, o.d / 2 - 0.2);
  back.rotation.x = 0.35;
  g.add(back);
}

/** Hành lang: S đoạn thẳng · M lang bồng ven kênh · L bò núi (mỗi gian cao hơn gian trước 0,6 m, mái từng gian). */
const lang: Build = (g, _m, c, giong, style) => {
  const o: Doan = { w: c.w, d: c.d, y0: 0, cot: c.cot, gian: c.gian, cap: c.cap, giong, roof: ngoi(c.cap, giong) };
  if (c.bien === 'ven-kenh') return langVenKenh(g, o, style);
  if (c.bien !== 'bo-nui') return doanLang(g, o, style);
  const bw = c.w / c.gian;
  for (let i = 0; i < c.gian; i++) doanLang(sub(g, -c.w / 2 + (i + 0.5) * bw, 0), { ...o, w: bw, gian: 1, y0: i * 0.6 }, style);
};

/* ---------------- thạch phảng 舫 ---------------- */

/**
 * Thạch phảng: thân thuyền đá mũi nhọn về +x nằm trên nước, ba đoạn — mũi (đình mở, yết sơn), khoang giữa (vách, quyển
 * bồng thấp), đuôi lầu 2 tầng (hiên lửng + yết sơn).
 */
const phuong: Build = (g, _m, c, giong, style) => {
  const roof = ngoi(c.cap, giong);
  const L = c.w / 2;
  const B = c.d / 2;
  g.add(box(c.w + 8, 0.05, c.d + 6, style.water, 0, 0.025, 0));
  const plan = new THREE.Shape();
  plan.moveTo(-L, -B);
  plan.lineTo(L - 2.2, -B);
  plan.lineTo(L, 0);
  plan.lineTo(L - 2.2, B);
  plan.lineTo(-L, B);
  plan.closePath();
  const deck = 1.1;
  g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(plan, { depth: deck, bevelEnabled: false }).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: style.stone })));
  const sd = c.d - 1; // lối đi quanh mép thuyền
  const over = maiDua(c.cap, c.cot);
  const seg = (x: number, w: number, d: number, cot: number, kieu: 'vach' | 'mo', mai: Mai, tang = 1): void => {
    const s = sub(g, x, 0);
    // bệ đá dưới đoạn (cùng màu thân thuyền): đáy vách / chân cửa nằm trên khối đặc, không lộ mặt đáy trùng nhau
    s.add(box(w + 0.6, 0.3, d + 0.4, style.stone, 0, deck - 0.15, 0));
    let y = than(s, { w, d, y0: deck, cot, gian: 1, cap: c.cap, kieu }, style);
    let ww = w;
    let dd = d;
    for (let t = 1; t < tang; t++) {
      // hiên lửng giữa hai tầng: váy mái từ mép hiên lên chân tầng trên (thu 0,9)
      const y2 = hienDuoi(s, ww, dd, y, over, ww * 0.9, dd * 0.9, giong, roof);
      ww *= 0.9;
      dd *= 0.9;
      s.add(box(ww + 0.3, 0.2, dd + 0.3, style.floor, 0, y2 - 0.1, 0)); // sàn tầng trên
      y = than(s, { w: ww, d: dd, y0: y2, cot: cot * 0.85, gian: 1, cap: c.cap, kieu: 'vach' }, style);
    }
    dungMai(s, { kieu: mai, w: ww, d: dd, y, over, giong, color: roof, ridgeColor: style.ridge });
  };
  seg(L - 2.2 - 2.4, 4.4, sd - 0.4, c.cot, 'mo', 'yet-son'); // mũi
  seg(-0.6, 4.8, sd - 0.2, c.cot * 0.85, 'vach', 'quyen-bong'); // khoang giữa
  seg(-L + 3.1, 5.4, sd, c.cot, 'vach', 'yet-son', c.tang ?? 2); // đuôi lầu
};

/* ---------------- từ miếu 祠廟 ---------------- */

/** Tường viện vôi `w` × `d` cao `h`, mũ ngói, chừa khe cổng `gw` giữa mặt trước. */
function tuongVien(g: THREE.Group, w: number, d: number, h: number, gw: number, style: Style, roof: string): void {
  const t = 0.5;
  const piece = (pw: number, pd: number, x: number, z: number, capW: number, capD: number): void => {
    g.add(box(pw, h, pd, style.wall, x, h / 2, z));
    g.add(box(capW, 0.25, capD, roof, x, h + 0.125, z));
  };
  piece(w, t, 0, -d / 2 + t / 2, w + 0.3, 0.8);
  for (const s of [-1, 1]) {
    piece(t, d - 2 * t, s * (w / 2 - t / 2), 0, 0.8, d - 2 * t);
    const fw = (w - gw) / 2;
    piece(fw, t, s * (gw / 2 + fw / 2), d / 2 - t / 2, fw + 0.15, 0.8);
  }
}

/** Một nhà trong viện: nền (thấp nhất C4), thân, mái yết sơn đơn. */
function nhaVien(g: THREE.Group, w: number, d: number, cot: number, gian: number, cap: Cap, kieu: 'vach' | 'mo', giong: Giong, style: Style): void {
  const y0 = nen(g, w, d, cap, style, 0.5, Math.min(4, w * 0.3));
  const y = than(g, { w, d, y0, cot, gian, cap, kieu }, style);
  dungMai(g, { kieu: 'yet-son', w, d, y, over: maiDua(cap, cot), giong, color: ngoi(cap, giong), ridgeColor: style.ridge });
}

/**
 * Từ miếu một viện: tường vôi bao `w` × `d`, cổng 3 gian trên tường trước, lối đá giữa sân, điện thờ cuối sân; cỡ M thêm
 * hưởng đường 享堂 (nhà tế mở) trước điện. Cổng + hưởng đường luôn nền C4; điện theo cấp của cỡ.
 */
const tuMieu: Build = (g, _m, c, giong, style) => {
  const lon = c.d >= 30;
  const gw = lon ? 7 : 6;
  tuongVien(g, c.w, c.d, 3, gw, style, ngoi(4, giong)); // mũ tường cùng ngói cổng; chỉ điện được ngói theo cấp
  nhaVien(sub(g, 0, c.d / 2 - 0.25), gw, 3.5, c.cot * 0.85, 3, 4, 'vach', giong, style);
  // điện: S 3 gian 10 × 7 · M 5 gian 14 × 8 — sát tường sau, chừa 0,3 m
  const hw = lon ? 14 : 10;
  const hd = lon ? 8 : 7;
  const hz = -c.d / 2 + 0.5 + 0.3 + (hd + 1) / 2;
  nhaVien(sub(g, 0, hz), hw, hd, c.cot, lon ? 5 : 3, c.cap, 'vach', giong, style);
  let front = hz + (hd + 1) / 2 + 2.4; // mép trước bậc điện
  if (lon) {
    const xz = front + 0.5 + 3.5;
    nhaVien(sub(g, 0, xz), 12, 6, c.cot * 0.9, 3, 4, 'mo', giong, style);
    front = xz + 3.5 + 1;
  }
  const back = c.d / 2 - 0.25 - 3.5 / 2 - 0.5; // sau nền cổng
  if (back > front) g.add(box(2.4, 0.06, back - front, style.path, 0, 0.03, (back + front) / 2));
};

/* ---------------- lầu trên đôn đài 城樓 ---------------- */

/**
 * Lầu trên đôn: thân vách, rồi (2 tầng) hiên lửng + tầng trên thu 0,86, hoặc (1 tầng, mái kép) hiên dưới + thân trên
 * thấp như điện; cuối cùng là mái theo kiểu.
 */
function lau(g: THREE.Group, w: number, d: number, y0: number, cot: number, gian: number, cap: Cap, tang: number, kep: boolean, kieu: Mai, giong: Giong, style: Style): void {
  const roof = ngoi(cap, giong);
  const over = maiDua(cap, cot);
  let y = than(g, { w, d, y0, cot, gian, cap, kieu: 'vach' }, style);
  if (tang >= 2) {
    const y2 = hienDuoi(g, w, d, y, over * 1.4, w * 0.86, d * 0.86, giong, roof);
    w *= 0.86;
    d *= 0.86;
    g.add(box(w + 0.3, 0.2, d + 0.3, style.floor, 0, y2 - 0.1, 0)); // sàn tầng trên: che mặt đáy vách / chân cửa
    y = than(g, { w, d, y0: y2, cot: cot * 0.85, gian, cap, kieu: 'vach' }, style);
  } else if (kep) {
    const uw = w * 0.78;
    const ud = d * 0.7;
    const y2 = hienDuoi(g, w, d, y, over * 1.6, uw, ud, giong, roof);
    const upH = cot * 0.4;
    g.add(box(uw, upH, ud, style.wall, 0, y2 + upH / 2, 0));
    addBeamBand(g, uw, ud, y2 + upH, style);
    y = y2 + upH + 0.5;
    w = uw;
    d = ud;
  }
  dungMai(g, { kieu, w, d, y, over, giong, color: roof, ridgeColor: style.ridge, mat: 4 });
}

/** Khối đôn đài `w` × `d` cao `h` (tâm x, z): chân đá, thân, mũ đá; trả về mặt trên. */
function don(g: THREE.Group, x: number, z: number, w: number, d: number, h: number, body: string, cap: string): number {
  g.add(box(w + 0.3, 0.4, d + 0.3, cap, x, 0.2, z));
  g.add(box(w, h, d, body, x, h / 2, z));
  g.add(box(w + 0.3, 0.3, d + 0.3, cap, x, h + 0.15, z));
  return h + 0.3;
}

/**
 * Lầu thành: đôn gạch có cửa vòm xuyên (S, M — gạch xám, răng cưa quanh nóc) hoặc đôn chữ 凹 tường son đá trắng viền
 * (L — Ngọ Môn: thân giữa 3 cửa vòm, hai cánh chìa ra trước, lầu 9 gian vũ điện kép, hai đình vuông ở đầu cánh).
 */
const lauThanh: Build = (g, m, c, giong, style) => {
  const H = c.don ?? 6;
  const kieu = c.mai ?? m.mai;
  if (c.bien !== 'chu-ao') {
    const top = don(g, 0, 0, c.w, c.d, H, GACH.brick, GACH.cap);
    rangCua(g, c.w, c.d, top, GACH.brick, 0.05);
    const aw = c.w >= 20 ? 4.2 : 3.2;
    for (const [z, ry] of [[c.d / 2 + 0.02, 0], [-c.d / 2 - 0.02, Math.PI]] as const) cuaVom(g, 0, 0.4, z, aw, aw + 1.4, ry);
    lau(g, c.w * 0.68, c.d * 0.6, top, c.cot, c.gian, c.cap, c.tang ?? 1, c.kep ?? false, kieu, giong, style);
    return;
  }
  const cd = 14; // sâu thân giữa
  const ww = 9; // rộng mỗi cánh
  const zc = -c.d / 2 + cd / 2;
  const top = don(g, 0, zc, c.w, cd, H, RED, MARBLE);
  for (const s of [-1, 1]) don(g, s * (c.w / 2 - ww / 2), -c.d / 2 + cd + (c.d - cd) / 2, ww, c.d - cd, H, RED, MARBLE);
  for (const [z, ry] of [[zc + cd / 2 + 0.02, 0], [zc - cd / 2 - 0.02, Math.PI]] as const) {
    cuaVom(g, 0, 0.4, z, 3.6, 5.6, ry);
    for (const s of [-1, 1]) cuaVom(g, s * 6, 0.4, z, 2.8, 4.6, ry);
  }
  lau(sub(g, 0, zc), 32, 9, top, c.cot, c.gian, c.cap, 1, true, kieu, giong, style);
  for (const s of [-1, 1]) lau(sub(g, s * (c.w / 2 - ww / 2), c.d / 2 - 4), 5, 5, top, c.cot * 0.8, 1, c.cap, 1, false, 'toan-tiem', giong, style);
};

/** Hàm dựng mẫu đợt 2 (vườn, thờ, cổng) — `mau_nha.ts` gộp vào bảng chung. */
export const BUILD_2: Record<string, Build> = {
  lang,
  phuong,
  'tu-mieu': tuMieu,
  'lau-thanh': lauThanh,
};
