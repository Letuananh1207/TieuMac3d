/**
 * Vật sân đợt 4 của bộ asset chuẩn (`danh_muc_dot4.ts`), phần 2: nhật quỹ + gia lượng `nhat-quy` (M thêm rùa, hạc đồng
 * cặp), vạc nước `vac-nuoc` (cặp), đỉnh / lư hương `dinh-huong` (L = lò đan), giếng `gieng` (M có đình giếng), đèn đá
 * `den-da` (M hàng 3 đèn cách đều), bia `bia` (S bia đứng · M rùa đội bia · L đình bia). Phần 1: `mau_vat.ts`.
 * Toạ độ hệ mẫu, mặt trước nhìn +z; đông = +x, tây = −x. Dùng cho Catalog 3D; map chuyển sang ở GĐ 5.
 */
import * as THREE from 'three';
import { dayNightTag, lambert, lampMaterial } from '../materials';
import { than, type Build } from './bo_phan';
import { addSteps, type Style } from './chi_tiet';
import { cotSon, maiDua, ngoi } from './danh_muc';
import { box, column } from './hinh';
import { dungMai } from './mai_giong';
import { tuDi } from './mau_nen';
import { capX, MARBLE, MARBLE_CARVE, put } from './mau_vat';

/** Mực khắc (vạch giờ nhật quỹ, chữ bia) — cùng màu chữ nhật quỹ cũ (`props.ts`). */
const INK = '#24323a';
/** Mặt nước (vạc, giếng). */
const WATER = '#3d5f6a';

/** Vật hai mặt (vạc, thành giếng dựng bằng lathe — nhìn được cả trong lẫn ngoài). */
const doubleSide = (color: string): THREE.MeshLambertMaterial => lambert(color, { side: THREE.DoubleSide });

/** Nhóm con đặt tại (x, z) của `g`. */
function at(g: THREE.Group, x: number, z = 0): THREE.Group {
  const s = new THREE.Group();
  s.position.set(x, 0, z);
  g.add(s);
  return s;
}

/** Bệ đá nhỏ 3 lớp (chân · eo · mặt) cạnh `w`, cao `h`. */
function be(s: THREE.Group, w: number, h: number, style: Style): void {
  s.add(box(w, 0.2, w, style.base, 0, 0.1, 0));
  s.add(box(w - 0.3, h - 0.4, w - 0.3, style.stone, 0, 0.2 + (h - 0.4) / 2, 0));
  s.add(box(w, 0.2, w, style.base, 0, h - 0.1, 0));
}

/* ---------------- nhật quỹ 日晷 · gia lượng 嘉量 · rùa, hạc đồng ---------------- */

/** Mặt quỹ ngửa về bắc (−z), nghiêng 50° (như nhật quỹ điện Thái Hoà). */
export const NHAT_QUY = { be: 0.75, tam: 1.05, r: 0.6, nghieng: 50 };

/** Nhật quỹ: bệ, trụ, đĩa đá nghiêng có 12 vạch giờ, kim đồng xuyên tâm vuông góc mặt đĩa. Đỉnh ≈ 1,5 m. */
function nhatQuy(s: THREE.Group, style: Style): void {
  be(s, 1.3, NHAT_QUY.be, style);
  s.add(column(0.1, NHAT_QUY.tam - NHAT_QUY.be, style.stone, 0, NHAT_QUY.be, 0, 8));
  const dial = new THREE.Group();
  dial.position.y = NHAT_QUY.tam;
  dial.rotation.x = (-NHAT_QUY.nghieng * Math.PI) / 180;
  s.add(dial);
  put(dial, new THREE.CylinderGeometry(NHAT_QUY.r, NHAT_QUY.r, 0.1, 20), MARBLE, 0, 0, 0);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const t = put(dial, new THREE.BoxGeometry(0.035, 0.02, 0.13), INK, Math.sin(a) * 0.47, 0.06, Math.cos(a) * 0.47);
    t.rotation.y = a;
  }
  put(dial, new THREE.CylinderGeometry(0.025, 0.025, 0.9, 6), style.bronze, 0, 0, 0);
}

/** Gia lượng: bệ, đình đá nhỏ (sàn, 4 trụ, mái chóp) che đấu đo bằng đồng. */
function giaLuong(s: THREE.Group, style: Style): void {
  be(s, 1.3, NHAT_QUY.be, style);
  const y0 = NHAT_QUY.be;
  s.add(box(1.05, 0.1, 1.05, MARBLE, 0, y0 + 0.05, 0));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) s.add(box(0.12, 0.8, 0.12, MARBLE, x * 0.42, y0 + 0.5, z * 0.42));
  put(s, new THREE.ConeGeometry(0.85, 0.5, 4).rotateY(Math.PI / 4), MARBLE_CARVE, 0, y0 + 1.15, 0);
  put(s, new THREE.SphereGeometry(0.1, 6, 4), MARBLE_CARVE, 0, y0 + 1.45, 0);
  s.add(column(0.22, 0.35, style.bronze, 0, y0 + 0.1, 0, 10));
  s.add(box(0.3, 0.12, 0.3, style.bronze, 0, y0 + 0.51, 0));
}

/** Rùa đồng trên bệ: mai dẹt, cổ vươn, đầu ngẩng, bốn chân. */
function ruaDong(s: THREE.Group, style: Style): void {
  s.add(box(1.1, 0.5, 1.5, style.stone, 0, 0.25, 0));
  put(s, new THREE.SphereGeometry(0.5, 9, 6).scale(1, 0.5, 1.3), style.bronze, 0, 0.7, 0);
  put(s, new THREE.SphereGeometry(0.12, 6, 4), style.bronze, 0, 0.82, 0.62);
  put(s, new THREE.SphereGeometry(0.17, 7, 5).scale(1, 0.9, 1.2), style.bronze, 0, 0.98, 0.76);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) put(s, new THREE.SphereGeometry(0.14, 6, 4), style.bronze, x * 0.38, 0.56, z * 0.42);
}

/** Hạc đồng trên bệ: hai chân mảnh, thân, cổ cong chữ S, đầu, mỏ. */
function hacDong(s: THREE.Group, style: Style): void {
  s.add(box(1.1, 0.5, 1.5, style.stone, 0, 0.25, 0));
  for (const x of [-0.12, 0.12]) s.add(column(0.04, 0.85, style.bronze, x, 0.5, 0, 5));
  put(s, new THREE.SphereGeometry(0.33, 8, 6).scale(0.8, 0.75, 1.25), style.bronze, 0, 1.5, 0);
  const neck = new THREE.CatmullRomCurve3([[0, 1.6, 0.3], [0, 1.9, 0.4], [0, 2.15, 0.28], [0, 2.33, 0.38]].map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  s.add(new THREE.Mesh(new THREE.TubeGeometry(neck, 8, 0.05, 5), lambert(style.bronze)));
  put(s, new THREE.SphereGeometry(0.09, 6, 4), style.bronze, 0, 2.36, 0.42);
  put(s, new THREE.ConeGeometry(0.03, 0.24, 4).rotateX(Math.PI / 2), style.bronze, 0, 2.35, 0.58);
}

/** Nhật quỹ phía đông, gia lượng phía tây; bản đủ bộ (`du-bo`): + rùa (trước), hạc (sau) mỗi thứ một cặp ở giữa. */
const nhatQuyBo: Build = (g, _m, c, _giong, style) => {
  const [dong, tay] = capX(c.w, 0.8);
  nhatQuy(at(g, dong), style);
  giaLuong(at(g, tay), style);
  if (c.bien !== 'du-bo') return;
  for (const x of capX(c.w * 0.45, 0)) {
    ruaDong(at(g, x, 1.3), style);
    hacDong(at(g, x, -1.3), style);
  }
};

/* ---------------- vạc nước 銅缸 (cặp) ---------------- */

/** Vạc: thân cao 1,5, bụng ∅ 2, trên bệ đá 0,3 m (số đo cho test). */
export const VAC = { cao: 1.5, bung: 1, be: 0.3 };

/** Một vạc: bệ đá tròn, thân lathe bụng phình miệng loe, mặt nước, hai quai vòng + núm đầu thú hai bên. */
function vac(s: THREE.Group, color: string): void {
  put(s, new THREE.CylinderGeometry(1.05, 1.1, VAC.be, 10), MARBLE, 0, VAC.be / 2, 0);
  const prof = [[0, 0], [0.72, 0], [0.95, 0.45], [VAC.bung, 0.8], [0.93, 1.3], [0.96, 1.45], [0.99, VAC.cao]].map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 14), doubleSide(color));
  body.position.y = VAC.be;
  s.add(body);
  const water = put(s, new THREE.CircleGeometry(0.9, 14), WATER, 0, VAC.be + VAC.cao - 0.15, 0);
  water.rotation.x = -Math.PI / 2;
  for (const sx of [-1, 1]) {
    const ring = put(s, new THREE.TorusGeometry(0.17, 0.045, 5, 10), color, sx * 1.0, VAC.be + 1.05, 0);
    ring.rotation.y = Math.PI / 2;
    put(s, new THREE.SphereGeometry(0.13, 6, 4), color, sx * 0.97, VAC.be + 1.25, 0);
  }
}

/** Vạc nước (cặp) hai bên điện chính: đồng ở C2, mạ vàng ở C1. */
const vacNuoc: Build = (g, _m, c, _giong, style) => {
  const color = c.cap <= 1 ? style.gold : style.bronze;
  for (const x of capX(c.w, 1.1)) vac(at(g, x), color);
};

/* ---------------- đỉnh 鼎 · lư hương 香爐 · lò đan ---------------- */

/** Đỉnh ba chân: bệ đá, ba chân, thân bụng tròn liền nắp vòm, núm, hai quai đứng trên miệng. Đỉnh ≈ 2,5 m. */
function dinh(s: THREE.Group, style: Style): void {
  put(s, new THREE.CylinderGeometry(1.05, 1.1, 0.2, 8), style.base, 0, 0.1, 0);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    s.add(column(0.1, 0.8, style.bronze, Math.sin(a) * 0.45, 0.2, Math.cos(a) * 0.45, 6));
  }
  const prof = [[0, 0.85], [0.6, 0.88], [0.82, 1.25], [0.74, 1.7], [0.82, 1.8], [0.55, 2.05], [0.2, 2.22], [0, 2.25]].map(([r, y]) => new THREE.Vector2(r, y));
  s.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 12), lambert(style.bronze)));
  put(s, new THREE.SphereGeometry(0.13, 6, 4), style.bronze, 0, 2.37, 0);
  for (const sx of [-1, 1]) put(s, new THREE.TorusGeometry(0.17, 0.045, 4, 8), style.bronze, sx * 0.62, 1.98, 0);
}

/** Lư hương vuông bốn chân: bệ, thân hộp, vành, nắp chóp cụt, tầng nhỏ, chóp. Đỉnh ≈ 2,5 m. */
function luHuong(s: THREE.Group, style: Style): void {
  s.add(box(1.5, 0.2, 1.5, style.base, 0, 0.1, 0));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) s.add(box(0.14, 0.5, 0.14, style.bronze, x * 0.38, 0.45, z * 0.38));
  s.add(box(1, 0.75, 1, style.bronze, 0, 1.075, 0));
  s.add(box(1.15, 0.1, 1.15, style.bronze, 0, 1.5, 0));
  put(s, new THREE.CylinderGeometry(0.28, 0.7, 0.45, 4, 1, true).rotateY(Math.PI / 4), style.bronze, 0, 1.775, 0);
  s.add(box(0.4, 0.3, 0.4, style.bronze, 0, 2.15, 0));
  put(s, new THREE.ConeGeometry(0.3, 0.25, 4).rotateY(Math.PI / 4), style.bronze, 0, 2.425, 0);
}

/** Lò đan (Bồng Lai): bệ bát giác, ba chân, thân bát giác có cửa lửa sáng mặt trước, nắp thu nhỏ, hồ lô vàng. */
function loDan(s: THREE.Group, style: Style): void {
  const oct = (rt: number, rb: number, h: number): THREE.BufferGeometry => new THREE.CylinderGeometry(rt, rb, h, 8).rotateY(Math.PI / 8);
  put(s, oct(1.25, 1.3, 0.25), style.base, 0, 0.125, 0);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    s.add(column(0.12, 0.65, style.bronze, Math.sin(a) * 0.55, 0.25, Math.cos(a) * 0.55, 6));
  }
  put(s, oct(0.95, 0.85, 1.1), style.bronze, 0, 1.4, 0);
  const fire = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.1), dayNightTag(new THREE.MeshBasicMaterial({ color: style.gold }), 'bo'));
  fire.position.set(0, 1.25, 0.84);
  s.add(fire);
  put(s, oct(0.45, 0.98, 0.45), style.bronze, 0, 2.175, 0);
  put(s, new THREE.SphereGeometry(0.18, 8, 6), style.gold, 0, 2.52, 0);
  put(s, new THREE.SphereGeometry(0.1, 6, 4), style.gold, 0, 2.72, 0);
}

/** S: một đỉnh · M (`dinh-lu`): đỉnh trước, lư hương sau trên trục · L (`lo-dan`): lò đan. */
const dinhHuong: Build = (g, _m, c, _giong, style) => {
  if (c.bien === 'lo-dan') return loDan(at(g, 0), style);
  if (c.bien !== 'dinh-lu') return dinh(at(g, 0), style);
  dinh(at(g, 0, c.d / 2 - 1.1), style);
  luHuong(at(g, 0, -c.d / 2 + 1.1), style);
};

/* ---------------- giếng 井 (+ đình giếng) ---------------- */

/** Giếng ∅ 1,4: thành đá rỗng (lathe), mặt nước thấp hơn miệng 0,2 m (số đo cho test). */
export const GIENG = { r: 0.7, mieng: 0.7, nuoc: 0.5 };

/** Giếng trên tấm đá nền cạnh `pad`; có ròng rọc gỗ (`rong`) hoặc gàu đặt trên miệng. */
function gieng(s: THREE.Group, pad: number, rong: boolean, style: Style): void {
  s.add(box(pad, 0.1, pad, style.base, 0, 0.05, 0));
  const { r, mieng, nuoc } = GIENG;
  const prof = [[r + 0.05, 0.1], [r, mieng], [r - 0.15, mieng], [r - 0.15, nuoc]].map(([x, y]) => new THREE.Vector2(x, y));
  s.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 12), doubleSide(style.stone)));
  const w = put(s, new THREE.CircleGeometry(r - 0.15, 12), WATER, 0, nuoc, 0);
  w.rotation.x = -Math.PI / 2;
  if (!rong) {
    s.add(column(0.14, 0.22, style.timber, r - 0.05, mieng, 0, 6)); // gàu trên miệng
    return;
  }
  for (const sx of [-1, 1]) s.add(box(0.12, 1.3, 0.12, style.timber, sx * 0.85, 0.75, 0));
  put(s, new THREE.CylinderGeometry(0.08, 0.08, 1.82, 6).rotateZ(Math.PI / 2), style.timber, 0, 1.3, 0);
  s.add(box(0.02, 0.45, 0.02, style.timber, 0, 0.995, 0)); // dây
  s.add(column(0.13, 0.22, style.timber, 0, 0.55, 0, 6)); // gàu
}

/** S: giếng có ròng rọc · M (`dinh-gieng`): giếng trong đình giếng vuông (4 cột, xà, mái chóp). */
const giengBo: Build = (g, _m, c, giong, style) => {
  if (c.bien !== 'dinh-gieng') return gieng(at(g, 0), c.w, true, style);
  gieng(at(g, 0), c.w + 0.5, false, style);
  const pillar = cotSon(c.cap) ? style.pillar : style.timber;
  const h = c.w / 2 - 0.15;
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) g.add(column(0.11, c.cot, pillar, x * h, 0.1, z * h, 8));
  const y = 0.1 + c.cot;
  for (const z of [-h, h]) g.add(box(c.w, 0.25, 0.2, style.timber, 0, y + 0.125, z));
  for (const x of [-h, h]) g.add(box(0.2, 0.25, c.w - 0.4, style.timber, x, y + 0.125, 0));
  dungMai(g, { kieu: 'toan-tiem', w: c.w, d: c.w, y: y + 0.25, over: 0.5, giong, color: ngoi(c.cap, giong), ridgeColor: style.ridge, mat: 4 });
};

/* ---------------- đèn đá 石燈 ---------------- */

/** Một đèn đá lục giác cao 1,9: đế, trụ, đài, hộp lửa có ô sáng bốn mặt, mái lục giác, ngọc trên đỉnh. */
function denDa(s: THREE.Group, style: Style): void {
  const hex = (rt: number, rb: number, h: number, y: number): void => void put(s, new THREE.CylinderGeometry(rt, rb, h, 6), style.stone, 0, y + h / 2, 0);
  hex(0.4, 0.45, 0.2, 0);
  hex(0.13, 0.16, 0.7, 0.2);
  hex(0.38, 0.3, 0.14, 0.9);
  hex(0.26, 0.26, 0.36, 1.04);
  const glow = lampMaterial(style.gold); // ô giấy: sáng khi đèn bật (`light.lampGlow`)
  for (const [w, d] of [[0.16, 0.6], [0.6, 0.16]] as const) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), glow);
    m.position.y = 1.22;
    s.add(m);
  }
  put(s, new THREE.ConeGeometry(0.46, 0.32, 6), style.stone, 0, 1.56, 0);
  put(s, new THREE.SphereGeometry(0.09, 6, 4), style.stone, 0, 1.81, 0);
}

/** Khoảng cách đèn đá dọc lối (m) — cách đều để dẫn đường. */
export const DEN_CACH = 6;

/** S: một đèn · M (`hang`): `gian` đèn cách đều `DEN_CACH` dọc trục x. */
const denDaBo: Build = (g, _m, c, _giong, style) => {
  for (let i = 0; i < c.gian; i++) denDa(at(g, (i - (c.gian - 1) / 2) * DEN_CACH), style);
};

/* ---------------- bia 碑 · rùa đội bia · đình bia ---------------- */

/** Thân bia đá trắng rộng `w` cao `h` (tới chân đầu bia) từ `y0`, đầu bia nửa tròn, ô chữ khắc hai mặt. */
function thanBia(s: THREE.Group, w: number, h: number, t: number, y0: number): void {
  s.add(box(w, h, t, MARBLE, 0, y0 + h / 2, 0));
  const head = put(s, new THREE.CylinderGeometry(w / 2, w / 2, t, 14).rotateX(Math.PI / 2), MARBLE, 0, y0 + h, 0);
  head.name = 'dau-bia';
  for (const sz of [-1, 1]) {
    s.add(box(w * 0.66, h * 0.72, 0.02, MARBLE_CARVE, 0, y0 + h * 0.52, sz * (t / 2 + 0.01)));
    for (let i = 0; i < 4; i++) s.add(box(0.04, h * 0.6, 0.01, INK, (i - 1.5) * w * 0.14, y0 + h * 0.52, sz * (t / 2 + 0.025)));
  }
}

/** Rùa đội bia (C1–C2): tấm nền, rùa đá (mai, đầu, bốn chân), đế bia trên mai, bia cao tới `cot`. */
function ruaBia(s: THREE.Group, cot: number, style: Style): void {
  s.add(box(2.8, 0.25, 4.4, style.base, 0, 0.125, 0));
  put(s, new THREE.SphereGeometry(1, 10, 6).scale(1.25, 0.5, 1.85), style.stone, 0, 0.6, 0);
  put(s, new THREE.SphereGeometry(0.38, 8, 5).scale(1, 0.9, 1.2), style.stone, 0, 0.85, 2);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) put(s, new THREE.SphereGeometry(0.32, 6, 4), style.stone, x * 1.0, 0.45, z * 1.2);
  s.add(box(1.6, 0.3, 0.65, MARBLE_CARVE, 0, 1.15, 0));
  thanBia(s, 1.4, cot - 1.3 - 0.7, 0.45, 1.3);
}

/**
 * S: bia đứng trên đế đá (cao 2,5) · M (`rua`): rùa đội bia cao 4 · L (`dinh-bia`): rùa đội bia trong đình bia vuông
 * mở (nền tu di 0,9 m + bậc, 4 cột, xà, mái yết sơn theo cấp).
 */
const biaBo: Build = (g, m, c, giong, style) => {
  if (c.bien === 'rua') return ruaBia(at(g, 0), c.cot, style);
  if (c.bien !== 'dinh-bia') {
    const s = at(g, 0);
    s.add(box(c.w, 0.5, c.d, style.stone, 0, 0.25, 0));
    thanBia(s, 1.2, c.cot - 0.5 - 0.6, 0.35, 0.5);
    return;
  }
  const nen = 0.9;
  tuDi(g, 0, 0, c.w + 1.2, c.d + 1.2, 0, nen, style);
  addSteps(g, 2.4, (c.d + 1.2) / 2, nen, style, 5);
  const inner = at(g, 0);
  inner.position.y = nen;
  ruaBia(inner, c.cot, style);
  const y = than(g, { w: c.w, d: c.d, y0: nen, cot: c.cot + 0.6, gian: 1, cap: c.cap, kieu: 'mo' }, style);
  dungMai(g, { kieu: c.mai ?? m.mai, w: c.w, d: c.d, y, over: maiDua(c.cap, c.cot), giong, color: ngoi(c.cap, giong), ridgeColor: style.ridge });
};

/** Hàm dựng vật sân đợt 4 (phần 2) — `mau_nha.ts` gộp vào bảng chung. */
export const BUILD_VAT_2: Record<string, Build> = {
  'nhat-quy': nhatQuyBo,
  'vac-nuoc': vacNuoc,
  'dinh-huong': dinhHuong,
  gieng: giengBo,
  'den-da': denDaBo,
  bia: biaBo,
};
