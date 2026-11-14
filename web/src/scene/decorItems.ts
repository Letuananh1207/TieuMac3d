/**
 * Đồ trang trí Nhà của ta (R-NHA-2): hình 13 vật trong danh mục (`zones/decor.ts` — lớp scene không import zones, nên
 * vật nhận theo mã), dựng bằng khối low-poly, gộp màu theo đỉnh → 1 draw call / vật (đèn lồng, tranh chữ: 2). Toạ độ
 * vật: tâm ô (0, 0), chân y = 0, mặt trước nhìn +z. Màu cây / đá / nước / đồng lấy từ đặc tả (`trees`, `buildingStyle`);
 * màu gỗ, giấy, gốm là màu đồ đạc như `kien_truc/noi_that.ts`. Đặt vào cảnh + va chạm: `decorLayer.ts`.
 */
import * as THREE from 'three';
import { lambert } from './materials';
import { mergeVertexColors } from './merge';
import type { SceneSpec } from './spec';
import { makeCanvasTex } from './textures';
import { box, column } from './kien_truc/hinh';
import { shelf } from './kien_truc/noi_that';

/** Khung bao một vật (m, khi `rotY` = 0): rộng `w` theo x, sâu `d` theo z, cao `h`; `round` = va chạm tròn đường kính `w`. */
export interface DecorShape {
  w: number;
  d: number;
  h: number;
  round?: boolean;
}

/**
 * Khung bao từng vật — hình dựng nằm gọn trong khung (test kiểm), va chạm vật to lấy đúng khung. Rộng / sâu ≤
 * `DECOR_SLOT_GAP` (1,8 m — hai ô gần nhất không chồng vật).
 */
export const DECOR_SHAPES: Readonly<Record<string, DecorShape>> = {
  'truc-canh': { w: 1.4, d: 1.4, h: 3.15 },
  mai: { w: 1.6, d: 1.4, h: 2.5 },
  tung: { w: 1.6, d: 1.6, h: 2.55 },
  'da-thai-ho': { w: 1.0, d: 0.8, h: 2.0 },
  'ao-sen': { w: 1.5, d: 1.5, h: 0.6, round: true },
  'den-long': { w: 0.76, d: 0.4, h: 1.8 },
  'ban-tra': { w: 1.76, d: 0.9, h: 0.95 },
  'chau-lan': { w: 0.6, d: 0.6, h: 1.2 },
  'lu-huong': { w: 0.6, d: 0.6, h: 1.05 },
  'tranh-chu': { w: 1.0, d: 0.4, h: 1.95 },
  'ke-sach': { w: 1.4, d: 0.45, h: 2.3 },
  'an-doc': { w: 1.2, d: 0.6, h: 0.9 },
  'binh-phong': { w: 1.7, d: 0.46, h: 1.75 },
};

/** Khung bao trên mặt sân khi quay `rotY` độ (bội 90): 90 / 270 đổi rộng ↔ sâu. Mã lạ → `undefined`. */
export function decorFootprint(itemId: string, rotY = 0): { w: number; d: number } | undefined {
  const s = DECOR_SHAPES[itemId];
  if (!s) return undefined;
  return (((rotY % 360) + 360) % 180 === 90 ? { w: s.d, d: s.w } : { w: s.w, d: s.d });
}

/** Vật cản của một vật đặt ở ô (toạ độ cảnh). */
export type DecorBlock = { kind: 'box'; x: number; z: number; w: number; d: number } | { kind: 'circle'; x: number; z: number; r: number };

/** Vật cản cho vật `itemId` ở ô (x, z, rotY) — chỉ vật to (`blocks` theo danh mục, R-NHA-2); vật nhỏ / mã lạ → `null`. */
export function decorBlock(slot: { x: number; z: number; rotY?: number }, itemId: string, blocks: boolean): DecorBlock | null {
  const s = DECOR_SHAPES[itemId];
  const f = decorFootprint(itemId, slot.rotY ?? 0);
  if (!blocks || !s || !f) return null;
  if (s.round) return { kind: 'circle', x: slot.x, z: slot.z, r: s.w / 2 };
  return { kind: 'box', x: slot.x, z: slot.z, w: f.w, d: f.d };
}

/* ---------- màu đồ đạc (chi tiết hình dạng, như noi_that.ts) ---------- */
const WOOD = '#3a2418';
const WOOD_MID = '#6b4a2e';
const PAPER = '#efe4c8';
const INK = '#2a2622';
const SOIL = '#4a3a2c';
const PORCELAIN = '#dfe4e2';
const COBALT = '#3d5f8a';
const ROCK_HOLE = '#4a4f52';
const LOTUS = '#e9a3b4';

type Colors = Pick<SceneSpec, 'trees' | 'buildingStyle'>;
const UP = new THREE.Vector3(0, 1, 0);

/** Đoạn trụ từ `a` tới `b` bán kính `r` (cành, thân, cuống). */
function limb(g: THREE.Group, a: THREE.Vector3, b: THREE.Vector3, r: number, color: string): void {
  const dir = b.clone().sub(a);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.75, r, dir.length(), 6), lambert(color));
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
  g.add(m);
}

/** Khối đá / tán / hoa: khối 20 mặt kéo giãn `s`, quay `ry`. */
function blob(g: THREE.Group, r: number, s: [number, number, number], color: string, x: number, y: number, z: number, ry = 0): void {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), lambert(color));
  m.position.set(x, y, z);
  m.scale.set(...s);
  m.rotation.set(0.3 * ry, ry, 0.2 * ry);
  g.add(m);
}

const v = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);

/* ---------- Vườn ---------- */

/** Khóm trúc trong bồn đá tròn: 6 thân cao 2,3–3,0 m, mỗi thân 2 chùm lá. */
function trucCanh(g: THREE.Group, c: Colors): void {
  const [stem, leaf] = c.trees.bamboo;
  g.add(column(0.58, 0.2, c.buildingStyle.stone, 0, 0, 0, 10));
  g.add(column(0.5, 0.03, SOIL, 0, 0.2, 0, 10));
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05 + 0.3;
    const rr = 0.12 + (i % 3) * 0.1;
    const [x, z] = [Math.cos(a) * rr, Math.sin(a) * rr];
    const h = 2.3 + ((i * 7) % 5) * 0.17;
    const top = v(x * 1.6, h, z * 1.6);
    limb(g, v(x, 0.2, z), top, 0.045, stem);
    blob(g, 0.3, [1, 0.35, 0.55], leaf, top.x * 1.2, h - 0.05, top.z * 1.2, a);
    blob(g, 0.24, [1, 0.35, 0.55], leaf, top.x * 0.9 - 0.08, h - 0.55, top.z * 0.9, a + 1.4);
  }
}

/** Mai bồn: thân thấp gãy khúc, 4 cành, chùm hoa hai màu ở đầu và giữa cành. */
function mai(g: THREE.Group, c: Colors): void {
  const [bark, deep, light] = c.trees.plum;
  g.add(column(0.48, 0.12, SOIL, 0, 0, 0, 9));
  const knee = v(0.12, 0.85, 0.05);
  const crown = v(-0.1, 1.45, -0.05);
  limb(g, v(0, 0.1, 0), knee, 0.11, bark);
  limb(g, knee, crown, 0.08, bark);
  const tips: [THREE.Vector3, THREE.Vector3][] = [
    [v(0.35, 1.7, 0.1), v(0.65, 2.1, 0.25)],
    [v(-0.4, 1.75, 0.05), v(-0.65, 2.25, -0.15)],
    [v(0.05, 1.95, -0.3), v(0.2, 2.35, -0.5)],
    [v(-0.15, 1.8, 0.35), v(-0.3, 2.15, 0.55)],
  ];
  tips.forEach(([mid, end], i) => {
    limb(g, crown, mid, 0.05, bark);
    limb(g, mid, end, 0.035, bark);
    blob(g, 0.13, [1, 0.85, 1], i % 2 ? deep : light, end.x, end.y, end.z, i);
    blob(g, 0.1, [1, 0.85, 1], i % 2 ? light : deep, mid.x, mid.y + 0.06, mid.z, i + 2);
  });
  blob(g, 0.11, [1, 0.85, 1], deep, knee.x + 0.1, knee.y + 0.1, knee.z + 0.05, 5);
}

/** Tùng bồn: thân cong hai khúc trên gò đất, 3 đám lá mây dẹt so le + mặt sáng. */
function tung(g: THREE.Group, c: Colors): void {
  const { trunk, leaves } = c.trees;
  g.add(column(0.5, 0.14, c.buildingStyle.stone, 0, 0, 0, 9));
  const knee = v(0.2, 1.1, 0.05);
  const top = v(-0.12, 2.0, 0);
  limb(g, v(0, 0.14, 0), knee, 0.14, trunk);
  limb(g, knee, top, 0.1, trunk);
  const clouds: [number, number, number, number][] = [
    [0.12, 1.25, 0.08, 0.68],
    [-0.22, 1.75, -0.05, 0.56],
    [-0.1, 2.3, 0.02, 0.48],
  ];
  for (const [x, y, z, r] of clouds) {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.9, 0.3, 7), lambert(leaves[0]));
    disc.position.set(x, y, z);
    g.add(disc);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r * 0.85, 0.08, 7), lambert(leaves[2]));
    cap.position.set(x, y + 0.18, z);
    g.add(cap);
  }
}

/** Đá Thái Hồ: 4 khối đá chồng nghiêng trên bệ, vài lỗ thủng sẫm. */
function daThaiHo(g: THREE.Group, c: Colors): void {
  const stone = c.buildingStyle.stone;
  g.add(box(0.95, 0.14, 0.75, WOOD_MID, 0, 0.07, 0));
  blob(g, 0.36, [1.15, 0.9, 0.9], stone, 0, 0.42, 0, 0.4);
  blob(g, 0.3, [0.9, 1.3, 0.8], stone, 0.1, 0.95, -0.02, 1.1);
  blob(g, 0.26, [1.1, 1.1, 0.8], stone, -0.08, 1.45, 0.03, 2.2);
  blob(g, 0.2, [1.2, 0.9, 0.9], stone, 0.08, 1.8, 0, 0.7);
  for (const [x, y, z] of [[0.18, 0.55, 0.28], [-0.12, 1.05, 0.25], [0.1, 1.5, 0.22]] as const) blob(g, 0.08, [1, 1.2, 0.5], ROCK_HOLE, x, y, z);
}

/** Ao sen nhỏ: thành đá tròn ∅ 1,5, mặt nước, 4 lá sen + 2 hoa. */
function aoSen(g: THREE.Group, c: Colors): void {
  const { stone, water } = c.buildingStyle;
  g.add(column(0.75, 0.3, stone, 0, 0, 0, 14));
  g.add(column(0.64, 0.02, water, 0, 0.3, 0, 14));
  const pads: [number, number, number][] = [[0.3, 0.2, 0.17], [-0.28, 0.25, 0.2], [0.1, -0.32, 0.18], [-0.3, -0.2, 0.14]];
  for (const [x, z, r] of pads) g.add(column(r, 0.02, c.trees.leaves[1], x, 0.33, z, 8));
  for (const [x, z, h] of [[0.15, 0.05, 0.5], [-0.2, -0.05, 0.42]] as const) {
    limb(g, v(x, 0.3, z), v(x, h, z), 0.015, c.trees.leaves[1]);
    const bud = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.14, 6), lambert(LOTUS));
    bud.position.set(x, h + 0.04, z);
    bud.rotation.x = Math.PI;
    g.add(bud);
  }
}

/* ---------- Sân ---------- */

/** Đèn lồng treo cột gỗ: bệ đá, cột, tay vươn, đèn đỏ (không chịu sáng, như `addLanterns`) + chóp vàng, tua. */
function denLong(g: THREE.Group, c: Colors): void {
  const { stone, lantern, gold } = c.buildingStyle;
  g.add(box(0.36, 0.12, 0.36, stone, -0.12, 0.06, 0));
  g.add(column(0.05, 1.68, WOOD, -0.12, 0.12, 0));
  g.add(box(0.46, 0.05, 0.06, WOOD, 0.03, 1.72, 0));
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), new THREE.MeshBasicMaterial({ color: lantern }));
  lamp.scale.y = 1.3;
  lamp.position.set(0.17, 1.33, 0);
  g.add(lamp);
  g.add(column(0.09, 0.05, gold, 0.17, 1.58, 0));
  g.add(column(0.09, 0.05, gold, 0.17, 1.03, 0));
  g.add(box(0.03, 0.22, 0.03, gold, 0.17, 0.92, 0));
  limb(g, v(0.17, 1.63, 0), v(0.17, 1.72, 0), 0.01, WOOD);
}

/** Bàn trà nhỏ 0,9 vuông cao 0,75 + 2 đôn đông / tây + ấm, 2 chén (đôn không ngồi được — mốc sau). */
function banTra(g: THREE.Group): void {
  const top = 0.75;
  g.add(box(0.9, 0.06, 0.9, WOOD_MID, 0, top - 0.03, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.08, top - 0.06, 0.08, WOOD_MID, sx * 0.37, (top - 0.06) / 2, sz * 0.37));
  for (const sx of [-1, 1]) g.add(column(0.2, 0.5, '#8a5a3c', sx * 0.68, 0, 0, 8));
  const pot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), lambert('#5a3a2a'));
  pot.position.set(-0.12, top + 0.1, 0);
  pot.scale.y = 0.8;
  g.add(pot);
  for (const dx of [0.15, 0.3]) g.add(column(0.05, 0.07, '#f3e6c8', dx, top, 0.12, 6));
}

/** Chậu lan trên giá gỗ thấp: chậu sứ trắng viền lam, 7 lá dài cong ra ngoài, 4 nụ hoa. */
function chauLan(g: THREE.Group, c: Colors): void {
  const [leaf, flower] = c.trees.orchid;
  g.add(box(0.5, 0.05, 0.5, WOOD, 0, 0.4, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.05, 0.38, 0.05, WOOD, sx * 0.21, 0.19, sz * 0.21));
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.14, 0.3, 8), lambert(PORCELAIN));
  pot.position.set(0, 0.58, 0);
  g.add(pot);
  g.add(column(0.205, 0.05, COBALT, 0, 0.64, 0, 8));
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const reach = 0.18 + (i % 3) * 0.04;
    limb(g, v(0, 0.72, 0), v(Math.cos(a) * reach, 1.05 + (i % 2) * 0.1, Math.sin(a) * reach), 0.018, leaf);
  }
  for (let i = 0; i < 4; i++) {
    const a = i * 1.6 + 0.5;
    blob(g, 0.045, [1, 1, 1], flower, Math.cos(a) * 0.1, 1.1 + (i % 2) * 0.05, Math.sin(a) * 0.1, i);
  }
}

/** Lư hương đồng trên bệ đá: thân tròn, 3 chân, 2 quai, nắp chóp + núm vàng. */
function luHuong(g: THREE.Group, c: Colors): void {
  const { stone, bronze, gold } = c.buildingStyle;
  g.add(box(0.6, 0.35, 0.6, stone, 0, 0.175, 0));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
    g.add(column(0.035, 0.16, bronze, Math.cos(a) * 0.17, 0.35, Math.sin(a) * 0.17, 6));
  }
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.2, 0.26, 10), lambert(bronze));
  body.position.set(0, 0.64, 0);
  g.add(body);
  for (const s of [-1, 1]) g.add(box(0.05, 0.12, 0.05, bronze, s * 0.27, 0.82, 0));
  const lid = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.16, 10), lambert(bronze));
  lid.position.set(0, 0.85, 0);
  g.add(lid);
  blob(g, 0.05, [1, 1.3, 1], gold, 0, 0.97, 0);
}

/* ---------- Trong nhà ---------- */

let scrollTex: THREE.CanvasTexture | null | undefined;
/** Mặt tranh chữ 書 (vẽ một lần, dùng chung); không có DOM (test) → không chữ. */
function scrollTexture(): THREE.CanvasTexture | null {
  if (scrollTex === undefined) {
    scrollTex = typeof document === 'undefined'
      ? null
      : makeCanvasTex(128, 256, (ctx, w, h) => {
          ctx.fillStyle = PAPER;
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = INK;
          ctx.font = '700 96px "Han Serif", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('書', w / 2, h * 0.42);
          ctx.fillStyle = '#a8322a'; // ấn son
          ctx.fillRect(w * 0.62, h * 0.74, 18, 18);
        });
  }
  return scrollTex;
}

/** Tranh chữ treo giá gỗ đứng: hai cột chân chữ T, xà trên, cuộn giấy 0,62 × 1,3 có trục trên / dưới. */
function tranhChu(g: THREE.Group): void {
  for (const s of [-1, 1]) {
    g.add(box(0.08, 0.06, 0.4, WOOD, s * 0.46, 0.03, 0));
    g.add(column(0.035, 1.86, WOOD, s * 0.46, 0.06, 0));
  }
  g.add(box(1.0, 0.05, 0.06, WOOD, 0, 1.9, 0));
  g.add(box(0.72, 0.04, 0.04, WOOD_MID, 0, 1.8, 0));
  g.add(box(0.72, 0.05, 0.05, WOOD_MID, 0, 0.45, 0));
  g.add(box(0.62, 1.3, 0.015, '#c9b48a', 0, 1.13, 0)); // nền bồi
  const tex = scrollTexture();
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 1.04), tex ? lambert('#ffffff', { map: tex }) : lambert(PAPER));
  face.position.set(0, 1.14, 0.01);
  g.add(face);
}

/** Kệ sách đứng 1,4 m (kệ `noi_that.ts`, 4 tầng gáy sách). */
function keSach(g: THREE.Group): void {
  shelf(g, 1.4, 0, 0, 0, 0, 5);
}

/** Án đọc thấp: mặt 1,2 × 0,55, hai chân tấm, sách mở, ống bút, nghiên mực. */
function anDoc(g: THREE.Group): void {
  g.add(box(1.2, 0.06, 0.55, WOOD, 0, 0.7, 0));
  for (const s of [-1, 1]) {
    g.add(box(0.06, 0.67, 0.48, WOOD, s * 0.52, 0.335, 0));
    g.add(box(0.1, 0.04, 0.6, WOOD, s * 0.52, 0.02, 0));
  }
  for (const s of [-1, 1]) {
    const page = box(0.3, 0.02, 0.4, PAPER, s * 0.155, 0.75, 0.02);
    page.rotation.z = -s * 0.1;
    g.add(page);
  }
  g.add(column(0.06, 0.16, PORCELAIN, 0.45, 0.73, -0.12, 8));
  for (const dx of [-0.02, 0.02]) limb(g, v(0.45 + dx, 0.85, -0.12), v(0.45 + dx * 3, 0.9, -0.12), 0.01, WOOD_MID);
  g.add(box(0.18, 0.04, 0.12, INK, -0.44, 0.75, -0.12));
}

/** Bình phong 4 tấm gấp chữ chi: khung gỗ sẫm, lòng giấy vẽ núi mực, chân đế. */
function binhPhong(g: THREE.Group): void {
  const pw = 0.41;
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Group();
    p.position.set((i - 1.5) * pw, 0, i % 2 ? -0.07 : 0.07);
    p.rotation.y = i % 2 ? 0.3 : -0.3;
    p.add(box(pw, 1.6, 0.05, WOOD, 0, 0.95, 0));
    p.add(box(pw - 0.08, 1.2, 0.06, PAPER, 0, 1.0, 0));
    const peak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 4), lambert(INK));
    peak.position.set(0, 0.95 + (i % 2) * 0.15, 0.03);
    peak.scale.z = 0.15;
    p.add(peak);
    p.add(box(0.08, 0.15, 0.3, WOOD, 0, 0.075, 0));
    g.add(p);
  }
}

type Builder = (g: THREE.Group, c: Colors) => void;
const BUILDERS: Readonly<Record<string, Builder>> = {
  'truc-canh': trucCanh,
  mai,
  tung,
  'da-thai-ho': daThaiHo,
  'ao-sen': aoSen,
  'den-long': denLong,
  'ban-tra': banTra,
  'chau-lan': chauLan,
  'lu-huong': luHuong,
  'tranh-chu': tranhChu,
  'ke-sach': keSach,
  'an-doc': anDoc,
  'binh-phong': binhPhong,
};

/** Mã vật có hình (để kiểm khớp danh mục). */
export const DECOR_BUILT_IDS: readonly string[] = Object.keys(BUILDERS);

/**
 * Hình một vật (nhóm, gốc ở tâm ô, chân y = 0, mặt trước +z); khối Lambert không texture gộp làm một theo màu đỉnh.
 * Mã lạ → `null`.
 */
export function buildDecorItem(itemId: string, colors: Colors): THREE.Group | null {
  const build = BUILDERS[itemId];
  if (!build) return null;
  const g = new THREE.Group();
  g.name = `decor:${itemId}`;
  build(g, colors);
  const parts: THREE.Mesh[] = [];
  g.traverse((o) => {
    if (o instanceof THREE.Mesh) parts.push(o);
  });
  mergeVertexColors(g);
  // khối đã gộp: bỏ geometry / vật liệu gốc (texture tranh chữ dùng chung — không bỏ)
  for (const m of parts) {
    if (m.parent) continue;
    m.geometry.dispose();
    (m.material as THREE.Material).dispose();
  }
  return g;
}

/** Bỏ geometry + vật liệu của một vật đã dựng (khi gỡ / thay). Texture tranh chữ dùng chung, giữ lại. */
export function disposeDecorItem(g: THREE.Object3D): void {
  g.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    o.geometry.dispose();
    (o.material as THREE.Material).dispose();
  });
}
