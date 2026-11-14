/**
 * Phần nối đợt 3 của bộ asset chuẩn (`danh_muc_dot3.ts`) — cổng và tường: bài phường `bai-phuong`, sơn môn `son-mon`,
 * cổng trên tường (`cong-trang`, `cong-lau` gọi lại `addPlasterWalls` của `tuong.ts` — đúng cổng đang dùng trong cảnh;
 * `cong-thuy-hoa` mới), tường `tuong-voi` (tường vôi của `tuong.ts` + lậu song), `tuong-cung`, `tuong-thanh`, `tuong-dat`.
 * Toạ độ hệ mẫu, mặt trước nhìn +z, mẫu chạy dọc trục x. Dùng cho Catalog 3D; map chuyển sang ở GĐ 5.
 */
import * as THREE from 'three';
import { Colliders } from '../../collision/colliders';
import type { SceneSpec, WallSegment } from '../spec';
import { cotTheoGian, cuaVom, GACH, nen, than, type Build } from './bo_phan';
import { addSteps, type Style } from './chi_tiet';
import { cotSon, maiDua, ngoi, type Cap, type CoMau, type Giong } from './danh_muc';
import { box, column, frustum, prism } from './hinh';
import { ridge, roofMat } from './mai';
import { dungMai } from './mai_giong';
import { EARTH, EARTH_DARK, REED_LINE } from './mau_bien';
import { addPlasterWalls } from './tuong';

/** Tường son cung đình — cùng màu `cung_dien.ts`, `mau_nha_2.ts`. */
const RED = '#9b2f24';

/* ---------------- bài phường 牌坊 ---------------- */

/** Chồng xà trên mỗi gian bài phường: xà dưới 額枋 + bảng chữ / hoa bản + xà trên (m). */
const XA = { duoi: 0.45, bang: 0.9, tren: 0.35 };
const XA_CAO = XA.duoi + XA.bang + XA.tren;

/**
 * Cao lòng (tới đáy xà dưới) từng gian bài phường, trái → phải (thuần — test "xà thấp nhất ≥ 6 m"): gian ngoài cùng
 * = `cot`, mỗi gian vào trong cao thêm 1 m (3 gian) / 1,8 m (5 gian) — gian giữa cao nhất.
 */
export function longBaiPhuong(c: Pick<CoMau, 'gian' | 'cot'>): number[] {
  const step = c.gian >= 5 ? 1.8 : 1;
  return Array.from({ length: c.gian }, (_, i) => c.cot + step * Math.min(i, c.gian - 1 - i));
}

/**
 * Bài phường: `gian` + 1 trụ son (chân kẹp đá 夾杆石), mỗi gian một chồng xà; S không mái — trụ xuyên lên khỏi xà, mũ
 * mây sẫm (沖天柱); M / L mỗi gian một mái huyền sơn ở đỉnh chồng xà (bài lâu), gian giữa cao nhất, bảng vàng giữa.
 */
const baiPhuong: Build = (g, _m, c, giong, style) => {
  const xs = cotTheoGian(c.w, c.gian);
  const clear = longBaiPhuong(c);
  const tops = clear.map((h) => h + XA_CAO);
  const r = c.gian >= 5 ? 0.36 : c.gian >= 3 ? 0.3 : 0.24;
  const pillar = cotSon(c.cap) ? style.pillar : style.timber;
  const roof = ngoi(c.cap, giong);
  const noRoof = c.bien === 'khong-mai';
  xs.forEach((x, i) => {
    const top = Math.max(tops[i - 1] ?? 0, tops[i] ?? 0) + (noRoof ? 1.3 : 0.2);
    g.add(column(r, top, pillar, x, 0, 0));
    g.add(box(r * 3.4, 1.5, r * 4.4, style.stone, x, 0.75, 0)); // đá kẹp chân trụ
    if (noRoof) g.add(column(r * 1.25, 0.5, style.eave, x, top, 0, 8)); // mũ mây
  });
  clear.forEach((h, i) => {
    const bw = xs[i + 1] - xs[i];
    const cx = (xs[i] + xs[i + 1]) / 2;
    g.add(box(bw, XA.duoi, 0.4, style.eave, cx, h + XA.duoi / 2, 0));
    g.add(box(bw - 0.1, XA.bang, 0.2, style.beamBlue, cx, h + XA.duoi + XA.bang / 2, 0));
    g.add(box(bw + 0.2, XA.tren, 0.46, style.eave, cx, h + XA.duoi + XA.bang + XA.tren / 2, 0));
    const mid = i === (c.gian - 1) / 2;
    if (mid) for (const s of [-1, 1]) g.add(box(Math.min(2.6, bw * 0.5), XA.bang * 0.78, 0.06, style.gold, cx, h + XA.duoi + XA.bang / 2, s * 0.13));
    if (noRoof) return;
    const s = new THREE.Group();
    s.position.x = cx;
    g.add(s);
    dungMai(s, { kieu: 'huyen-son', w: bw - 0.1, d: c.d + 0.4, y: h + XA_CAO, over: 0.55, giong, color: roof, ridgeColor: style.ridge });
  });
};

/* ---------------- sơn môn 山門 ---------------- */

/**
 * Sơn môn: nền theo cấp (C3 đá 1,2 m, lan can), cột + xà + đấu củng (`than` kiểu mở), thân tường son lùi 0,4 m có ba
 * cửa vòm tối hai mặt (giữa lớn), biển sẫm trên cửa giữa, mái yết sơn đơn.
 */
const sonMon: Build = (g, m, c, giong, style) => {
  const y0 = nen(g, c.w, c.d, c.cap, style, 1, 4.4);
  const y = than(g, { w: c.w, d: c.d, y0, cot: c.cot, gian: c.gian, cap: c.cap, kieu: 'mo' }, style);
  const iw = c.w - 0.8;
  const id = c.d - 0.8;
  g.add(box(iw, c.cot, id, RED, 0, y0 + c.cot / 2, 0));
  const xs = cotTheoGian(iw, c.gian);
  for (let i = 0; i < c.gian; i++) {
    const mid = i === (c.gian - 1) / 2;
    const cx = (xs[i] + xs[i + 1]) / 2;
    const [w, h] = mid ? [2.4, 3.1] : [1.7, 2.5];
    for (const [z, ry] of [[id / 2 + 0.02, 0], [-id / 2 - 0.02, Math.PI]] as const) cuaVom(g, cx, y0, z, w, h, ry);
  }
  g.add(box(2.2, 0.5, 0.08, style.eave, 0, y0 + 3.5, id / 2 + 0.05));
  dungMai(g, { kieu: c.mai ?? m.mai, w: c.w, d: c.d, y, over: maiDua(c.cap, c.cot), giong, color: ngoi(c.cap, giong), ridgeColor: style.ridge });
};

/* ---------------- tường vôi + cổng trên tường (dùng lại tuong.ts) ---------------- */

/** Tường vôi của cảnh (`walls.style: voi`) cho mẫu: không tường bao, chỉ các đoạn thêm. */
function walls(style: Style, cap: Cap, giong: Giong, thickness: number, height: number): SceneSpec['walls'] {
  return { enabled: false, half: 0, height, thickness, color: style.wall, brickHue: 0, capColor: ngoi(cap, giong), gates: [], style: 'voi', windows: 0, brickSat: 40 };
}

/** Dựng các đoạn tường vôi bằng đúng hàm của cảnh (`addPlasterWalls`) rồi chuyển khối sang `g`. */
function tuongVoi(g: THREE.Group, w: SceneSpec['walls'], segs: WallSegment[], style: Style): void {
  const tmp = new THREE.Scene();
  addPlasterWalls(tmp, new Colliders(), w, segs, style);
  for (const o of [...tmp.children]) g.add(o);
}

/** Cổng trăng / môn lâu trên một đoạn tường vôi dài (khe + 3 m mỗi bên, tối thiểu 10 m). */
const congTrenTuong = (kind: 'trang' | 'lau'): Build => (g, _m, c, giong, style) => {
  const width = kind === 'trang' ? c.w : c.w + 0.6; // môn lâu: lối + khung gỗ 2 × 0,3 (`lauOpening`)
  const half = Math.max(5, width / 2 + 3);
  tuongVoi(g, walls(style, c.cap, giong, c.d, c.cot), [{ from: [-half, 0], to: [half, 0], gate: { at: 0, width, kind } }], style);
};

/** Lậu song 漏窗 trên tường vôi: ô `size` m vuông, đáy cao `bottom`, cách nhau ~4 m (giống cửa sổ hoa của `tuong.ts`). */
function lauSong(g: THREE.Group, len: number, t: number, bottom: number, size: number, style: Style): void {
  const n = Math.max(1, Math.floor(len / 4));
  const y = bottom + size / 2;
  for (let i = 0; i < n; i++) {
    const x = -len / 2 + (i + 0.5) * (len / n);
    g.add(box(size, size, t + 0.14, style.timber, x, y, 0));
    g.add(box(size * 0.86, 0.08, t + 0.16, style.wall, x, y, 0));
    g.add(box(0.08, size * 0.86, t + 0.16, style.wall, x, y, 0));
  }
}

/** Đáy lậu song: 1,6 m theo danh mục; tường thấp (chia sân 2,5 m) hạ xuống cho ô cách đỉnh tường ≥ 0,4 m. */
export const lauSongDay = (h: number, size: number): number => Math.min(1.6, h - size - 0.4);

/** Tường vôi: một đoạn `w` × cao `cot` × dày `d` (thân vôi, chân đá, mái ngói của cảnh) + lậu song. */
const tuongVoiMau: Build = (g, _m, c, giong, style) => {
  tuongVoi(g, walls(style, c.cap, giong, c.d, c.cot), [{ from: [-c.w / 2, 0], to: [c.w / 2, 0] }], style);
  const size = c.cot < 3 ? 0.7 : 1;
  lauSong(g, c.w - 2, c.d, lauSongDay(c.cot, size), size, style);
};

/* ---------------- thuỳ hoa môn 垂花門 ---------------- */

/**
 * Thuỳ hoa môn (一殿一卷): bệ đá 2 bậc, hai trụ chính son giữa có cửa son (đường tường), hai trụ sau, hai trụ treo
 * phía trước không chạm đất — chân treo búp sen vàng 垂蓮; hoa tráo lam dưới xà trước; mái trước huyền sơn có bờ nóc,
 * mái sau quyển bồng. Hai đoạn tường vôi (cao `cot` − 1) nối vào hai trụ chính.
 */
const congThuyHoa: Build = (g, _m, c, giong, style) => {
  const pillar = cotSon(c.cap) ? style.pillar : style.timber;
  const roof = ngoi(c.cap, giong);
  const plinth = 0.45;
  const pd = c.d + 0.6;
  g.add(box(c.w + 0.8, plinth, pd, style.base, 0, plinth / 2, 0));
  addSteps(g, c.w * 0.7, pd / 2, plinth, style, 2);
  const y0 = plinth;
  const beamY = y0 + 2.75; // đáy xà ngang
  const zMain = -0.2;
  const zBack = -c.d / 2 + 0.3;
  const zFront = c.d / 2 - 0.3;
  const hx = c.w / 2;
  for (const s of [-1, 1]) {
    g.add(column(0.17, beamY + 0.3 - y0, pillar, s * hx, y0, zMain));
    g.add(column(0.15, beamY + 0.3 - y0, pillar, s * hx, y0, zBack));
    g.add(column(0.13, 1, pillar, s * hx, beamY - 0.7, zFront)); // trụ treo
    const lotus = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshLambertMaterial({ color: style.gold }));
    lotus.scale.y = 1.3;
    lotus.position.set(s * hx, beamY - 0.82, zFront);
    g.add(lotus);
    g.add(box(0.26, 0.3, c.d + 0.1, style.eave, s * hx, beamY + 0.15, 0)); // xà dọc (đỡ trụ treo)
  }
  for (const z of [zFront, zMain, zBack]) g.add(box(c.w + 0.3, 0.3, 0.26, style.eave, 0, beamY + 0.15, z));
  g.add(box(c.w - 0.5, 0.35, 0.08, style.beamBlue, 0, beamY - 0.2, zFront)); // hoa tráo
  g.add(box(c.w - 0.4, beamY - y0 - 0.15, 0.12, RED, 0, y0 + (beamY - y0 - 0.15) / 2, zMain)); // cửa son
  const yr = beamY + 0.3;
  const half = c.d / 2;
  for (const [z, kieu] of [[half / 2, 'huyen-son'], [-half / 2, 'quyen-bong']] as const) {
    const s = new THREE.Group();
    s.position.z = z;
    g.add(s);
    dungMai(s, { kieu, w: c.w + 0.4, d: half, y: yr, over: 0.4, giong, color: roof, ridgeColor: style.ridge });
  }
  const wh = c.cot - 1;
  const len = 4.5;
  tuongVoi(
    g,
    walls(style, 5, giong, 0.5, wh),
    [-1, 1].map((s): WallSegment => ({ from: [s * (hx + 0.2), zMain], to: [s * (hx + 0.2 + len), zMain] })),
    style,
  );
};

/* ---------------- tường cung · thành · đất ---------------- */

/** Tường cung: chân đá, thân son dày `d`, dải xà sẫm dưới mũ, mũ ngói theo cấp (C1 vàng) hai mái + bờ nóc. */
const tuongCung: Build = (g, _m, c, giong, style) => {
  const roof = ngoi(c.cap, giong);
  g.add(box(c.w + 0.1, 0.9, c.d + 0.3, style.stone, 0, 0.45, 0));
  g.add(box(c.w, c.cot, c.d, RED, 0, c.cot / 2, 0));
  g.add(box(c.w + 0.2, 0.35, c.d + 0.3, style.eave, 0, c.cot + 0.175, 0));
  const cap = new THREE.Mesh(prism(c.w + 0.6, c.d + 1.4, 0.9), roofMat(roof));
  cap.position.y = c.cot + 0.35;
  g.add(cap);
  ridge(g, c.cot + 1.25, c.w + 0.6, style.ridge, false);
};

/**
 * Tường thành gạch Minh: thân chóp cụt (chân rộng hơn mặt 0,9 m mỗi bên), chân đá, mặt lát đá rộng `d` (đi được),
 * đoạ khẩu 垛口 phía ngoài (+z): tường thấp 0,9 + răng 1,6 × 0,9 có lỗ nhìn 望孔 — tổng 1,8; tường thấp 宇牆 phía trong.
 */
const tuongThanh: Build = (g, _m, c, _giong) => {
  const batter = 0.9;
  g.add(new THREE.Mesh(frustum(c.w, c.d + 2 * batter, c.w, c.d, c.cot), new THREE.MeshLambertMaterial({ color: GACH.brick })));
  g.add(box(c.w + 0.1, 1, c.d + 2 * batter + 0.2, GACH.cap, 0, 0.5, 0));
  g.add(box(c.w + 0.06, 0.25, c.d + 0.2, GACH.cap, 0, c.cot, 0));
  const yTop = c.cot + 0.125;
  const zo = c.d / 2 - 0.25;
  g.add(box(c.w, 0.9, 0.5, GACH.brick, 0, yTop + 0.45, zo));
  const n = Math.floor(c.w / 2.1);
  const step = c.w / n;
  for (let i = 0; i < n; i++) {
    const x = -c.w / 2 + (i + 0.5) * step;
    g.add(box(1.6, 0.9, 0.5, GACH.brick, x, yTop + 1.35, zo));
    g.add(box(0.25, 0.25, 0.52, GACH.dark, x, yTop + 1.35, zo));
  }
  g.add(box(c.w, 1, 0.4, GACH.brick, 0, yTop + 0.5, -c.d / 2 + 0.2));
};

/** Tường đất nện: thân chóp cụt (chân dày hơn 0,5, mặt mỏng hơn 0,3), hai vạch lau sậy, mũ đất sẫm. */
const tuongDat: Build = (g, _m, c) => {
  const bd = c.d + 0.5;
  const td = c.d - 0.3;
  const h = c.cot;
  const at = (y: number): number => bd + ((td - bd) * y) / h;
  g.add(new THREE.Mesh(frustum(c.w, bd, c.w, td, h), new THREE.MeshLambertMaterial({ color: EARTH })));
  for (const y of [h / 3, (2 * h) / 3]) g.add(new THREE.Mesh(frustum(c.w + 0.06, at(y) + 0.06, c.w + 0.06, at(y + 0.12) + 0.06, 0.12), new THREE.MeshLambertMaterial({ color: REED_LINE })).translateY(y));
  g.add(box(c.w + 0.1, 0.35, td + 0.2, EARTH_DARK, 0, h + 0.175 - 0.05, 0));
};

/** Hàm dựng phần nối đợt 3 (cổng, tường) — `mau_nha.ts` gộp vào bảng chung. */
export const BUILD_NOI: Record<string, Build> = {
  'bai-phuong': baiPhuong,
  'son-mon': sonMon,
  'cong-trang': congTrenTuong('trang'),
  'cong-lau': congTrenTuong('lau'),
  'cong-thuy-hoa': congThuyHoa,
  'tuong-voi': tuongVoiMau,
  'tuong-cung': tuongCung,
  'tuong-thanh': tuongThanh,
  'tuong-dat': tuongDat,
};
