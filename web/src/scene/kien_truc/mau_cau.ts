/**
 * Cầu — phần nối đợt 3 của bộ asset chuẩn (`danh_muc_dot3.ts`): cầu vòm `cau-vom` (1 / 3 nhịp, vòm cung tròn), cầu
 * bằng `cau-bang` (phiến đá trên trụ · cửu khúc 9 đoạn vuông góc), cầu có mái `cau-mai` (廊橋), cầu treo `cau-treo`
 * (gọi lại cầu treo của cảnh — `bridges.ts`). Cầu chạy dọc trục x (mặt bên nhìn ra camera), rộng theo z, mặt nước dưới.
 * Dùng cho Catalog 3D; map chuyển sang ở GĐ 5.
 */
import * as THREE from 'three';
import { Colliders } from '../../collision/colliders';
import { addBridges } from '../bridges';
import type { Build } from './bo_phan';
import type { Style } from './chi_tiet';
import { cotSon, ngoi, type CoMau } from './danh_muc';
import { box, column } from './hinh';
import { dungMai } from './mai_giong';

/** Đá trắng (lan can cung đình) — cùng màu `mau_nha_2.ts`. */
const MARBLE = '#e6e2d6';
/** Trụ giữa hai vòm (m). */
const PIER = 1.2;
/** Cao thành cầu vòm trên mặt cầu (m, không nhân K). */
const PARAPET = 0.85;

/** Mặt nước mỏng dưới cầu (nằm trên mặt đất Catalog). */
function water(g: THREE.Group, w: number, d: number, style: Style): void {
  g.add(box(w, 0.03, d, style.water, 0, 0.02, 0));
}

/* ---------------- cầu vòm 拱橋 ---------------- */

/** Nhịp các vòm (m, trái → phải; thuần — test): 1 nhịp = `cot`; 3 nhịp = 0,8 · 1 · 0,8 × `cot`. */
export function nhipCau(c: Pick<CoMau, 'gian' | 'cot'>): number[] {
  return c.gian >= 3 ? [0.8 * c.cot, c.cot, 0.8 * c.cot] : [c.cot];
}

/** Độ gù giữa cầu: cầu vườn một nhịp gù cao (0,22 × dài), cầu cung đình ba nhịp thoải (0,08 × dài). */
export const guCau = (c: Pick<CoMau, 'gian' | 'w'>): number => (c.gian >= 3 ? 0.08 : 0.22) * c.w;

/**
 * Cầu vòm: thân đá đùn theo bề rộng từ một hình cắt dọc — mặt trên gù parabol (đầu cầu dày 0,3), các lỗ vòm cung tròn
 * chân ở mặt nước, đỉnh vòm dưới mặt cầu 0,6; thành cầu đặc cao 0,85 theo lưng cầu; cầu cung đình (C1–C2) thành đá
 * trắng + trụ vọng 望柱 cách 1,9 m.
 */
const cauVom: Build = (g, _m, c, _giong, style) => {
  const L = c.w / 2;
  const rise = guCau(c);
  const top = (x: number): number => 0.3 + rise * Math.max(0, 1 - (x / L) ** 2);
  const N = 24;
  const xsTop = Array.from({ length: N + 1 }, (_, i) => L - (2 * L * i) / N); // phải → trái
  const s = new THREE.Shape();
  s.moveTo(-L, 0);
  const spans = nhipCau(c);
  let x = -(spans.reduce((a, b) => a + b, 0) + PIER * (spans.length - 1)) / 2;
  for (const sp of spans) {
    const xc = x + sp / 2;
    const a = Math.min(sp / 2, top(xc) - 0.6); // cao vòm
    const R = (sp * sp) / 4 / (2 * a) + a / 2;
    const cy = a - R;
    const t0 = Math.atan2(-cy, -sp / 2);
    const t1 = Math.atan2(-cy, sp / 2);
    s.lineTo(x, 0);
    for (let k = 1; k <= 12; k++) {
      const t = t0 + ((t1 - t0) * k) / 12;
      s.lineTo(xc + R * Math.cos(t), cy + R * Math.sin(t));
    }
    x += sp + PIER;
  }
  s.lineTo(L, 0);
  for (const xt of xsTop) s.lineTo(xt, top(xt));
  s.closePath();
  const body = new THREE.ExtrudeGeometry(s, { depth: c.d, bevelEnabled: false }).translate(0, 0, -c.d / 2);
  g.add(new THREE.Mesh(body, new THREE.MeshLambertMaterial({ color: style.stone })));
  const cung = c.cap <= 2;
  const rail = new THREE.Shape();
  rail.moveTo(-L, top(-L));
  for (const xt of [...xsTop].reverse().slice(1)) rail.lineTo(xt, top(xt));
  for (const xt of xsTop) rail.lineTo(xt, top(xt) + PARAPET);
  rail.closePath();
  const railMat = new THREE.MeshLambertMaterial({ color: cung ? MARBLE : style.stone });
  for (const z of [c.d / 2 - 0.3, -c.d / 2]) g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(rail, { depth: 0.3, bevelEnabled: false }).translate(0, 0, z), railMat));
  if (cung) {
    const n = Math.round(c.w / 1.9);
    for (let i = 0; i <= n; i++) {
      const px = -L + 0.2 + (i * (c.w - 0.4)) / n;
      for (const sz of [-1, 1]) g.add(box(0.3, PARAPET + 0.3, 0.36, MARBLE, px, top(px) + (PARAPET + 0.3) / 2, sz * (c.d / 2 - 0.15)));
    }
  }
  water(g, c.w + 6, c.d + 8, style);
};

/* ---------------- cầu bằng 平橋 · cửu khúc 九曲橋 ---------------- */

type P = [number, number];

/** Đường tim cửu khúc: 5 đoạn dọc x (mỗi đoạn w / 5) xen 4 đoạn lệch z 3 m — 9 đoạn vuông góc nhau, căn giữa. */
export function cuuKhuc(w: number, lech = 3): P[] {
  const dx = w / 5;
  const pts: P[] = [[-w / 2, 0]];
  for (let i = 0; i < 5; i++) {
    const [x, z] = pts[pts.length - 1];
    pts.push([x + dx, z]);
    if (i < 4) pts.push([x + dx, i % 2 === 0 ? lech : 0]);
  }
  return pts.map(([x, z]) => [x, z - lech / 2]);
}

/**
 * Lan can hai bên một đường gấp khúc `pts` (rộng lòng `W`): mỗi bên một thanh tay vịn + trụ đầu đoạn; ở góc trong thanh
 * ngắn lại, góc ngoài dài ra để hai thanh gặp nhau. Hai đầu đường để hở (lối lên).
 */
function lanCanGap(g: THREE.Group, pts: P[], W: number, y: number, color: string): void {
  const off = W / 2 - 0.08;
  const dir = (a: P, b: P): P => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  };
  for (let i = 0; i + 1 < pts.length; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    const u = dir(a, b);
    for (const s of [-1, 1]) {
      const n: P = [-u[1] * s, u[0] * s]; // pháp tuyến phía bên `s`
      const ext = (other: P | undefined, at: P): number => {
        if (!other) return 0;
        const v = dir(at, other); // hướng đoạn kề rời khỏi đỉnh
        return v[0] * n[0] + v[1] * n[1] > 0 ? -off : off; // đoạn kề rẽ về phía này → góc trong
      };
      const e0 = ext(pts[i - 1], a);
      const e1 = ext(pts[i + 2], b);
      const p0: P = [a[0] - u[0] * e0 + n[0] * off, a[1] - u[1] * e0 + n[1] * off];
      const p1: P = [b[0] + u[0] * e1 + n[0] * off, b[1] + u[1] * e1 + n[1] * off];
      const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
      const alongX = Math.abs(u[0]) > 0.5;
      const cx = (p0[0] + p1[0]) / 2;
      const cz = (p0[1] + p1[1]) / 2;
      g.add(alongX ? box(len, 0.1, 0.14, color, cx, y + 0.6, cz) : box(0.14, 0.1, len, color, cx, y + 0.6, cz));
      for (const p of [p0, p1]) g.add(box(0.16, 0.65, 0.16, color, p[0], y + 0.325, p[1]));
    }
  }
}

/** Cầu bằng: S phiến đá trên hai trụ, mố hai đầu, gờ thấp hai mép · M cửu khúc: 9 đoạn trên trụ đá ở mỗi góc, lan can. */
const cauBang: Build = (g, _m, c, _giong, style) => {
  const y = c.cot;
  if (c.bien === 'cuu-khuc') {
    const pts = cuuKhuc(c.w);
    for (let i = 0; i + 1 < pts.length; i++) {
      const [a, b] = [pts[i], pts[i + 1]];
      const alongX = a[1] === b[1];
      const len = Math.abs(alongX ? b[0] - a[0] : b[1] - a[1]) + c.d;
      g.add(box(alongX ? len : c.d, 0.3, alongX ? c.d : len, style.stone, (a[0] + b[0]) / 2, y - 0.15, (a[1] + b[1]) / 2));
    }
    for (const [px, pz] of pts) g.add(box(c.d * 0.7, y - 0.3, c.d * 0.7, style.base, px, (y - 0.3) / 2, pz));
    lanCanGap(g, pts, c.d, y, style.base);
    water(g, c.w + 6, c.d + 10, style);
    return;
  }
  g.add(box(c.w, 0.3, c.d, style.stone, 0, y - 0.15, 0));
  for (let k = 1; k < c.gian; k++) g.add(box(0.6, y - 0.3, c.d + 0.2, style.base, -c.w / 2 + (k * c.w) / c.gian, (y - 0.3) / 2, 0));
  for (const s of [-1, 1]) {
    g.add(box(0.8, y, c.d + 0.4, style.base, s * (c.w / 2 + 0.4), y / 2, 0)); // mố
    g.add(box(c.w, 0.25, 0.25, style.stone, 0, y + 0.125, s * (c.d / 2 - 0.125))); // gờ mép
  }
  water(g, c.w + 4, c.d + 6, style);
};

/* ---------------- cầu có mái 廊橋 ---------------- */

/**
 * Cầu có mái: mặt cầu đá cao 2 m trên 4 trụ, mố + bậc hai đầu; trên mặt cầu một dãy hành lang `gian` gian — cột (son
 * từ C4), ghế dài hai bên, xà dọc + xà ngang, mái huyền sơn suốt cầu.
 */
const cauMai: Build = (g, _m, c, giong, style) => {
  const deck = 2;
  const L = c.w / 2;
  g.add(box(c.w, 0.4, c.d, style.base, 0, deck - 0.2, 0));
  for (let k = 1; k < c.gian; k++) g.add(box(1.2, deck - 0.4, c.d + 0.4, style.stone, -L + (k * c.w) / c.gian, (deck - 0.4) / 2, 0));
  const sw = 4;
  for (const s of [-1, 1]) {
    g.add(box(1.5, deck, c.d + 0.4, style.stone, s * (L + 0.75), deck / 2, 0));
    // bậc ra hai đầu: 8 bậc 0,25 × 0,4
    for (let k = 1; k < 8; k++) g.add(box(0.4 * (8 - k), k * 0.25, sw, style.base, s * (L + 1.5 + (0.4 * (8 - k)) / 2), (k * 0.25) / 2, 0));
  }
  const pillar = cotSon(c.cap) ? style.pillar : style.timber;
  const zc = c.d / 2 - 0.35;
  for (let k = 0; k <= c.gian; k++) {
    const x = -L + 0.2 + (k * (c.w - 0.4)) / c.gian;
    for (const s of [-1, 1]) g.add(column(0.16, c.cot, pillar, x, deck, s * zc));
    g.add(box(0.2, 0.3, 2 * zc + 0.2, style.eave, x, deck + c.cot - 0.15, 0));
  }
  for (const s of [-1, 1]) {
    g.add(box(c.w + 0.3, 0.3, 0.25, style.eave, 0, deck + c.cot - 0.15, s * zc));
    g.add(box(c.w - 0.6, 0.45, 0.4, style.timber, 0, deck + 0.225, s * (zc - 0.3)));
  }
  dungMai(g, { kieu: 'huyen-son', w: c.w, d: c.d, y: deck + c.cot, over: 0.8, giong, color: ngoi(c.cap, giong), ridgeColor: style.ridge });
  water(g, c.w + 6, c.d + 8, style);
};

/* ---------------- cầu treo 索橋 ---------------- */

/** Cầu treo: đúng cầu treo của cảnh (`bridges.ts` kiểu `treo`) bắc giữa hai mỏm đá cao `cot`, suối dưới. */
const cauTreo: Build = (g, _m, c, _giong, style) => {
  const tmp = new THREE.Scene();
  addBridges(tmp, new Colliders(), [{ kind: 'treo', x: 0, z: 0, rotY: 90, length: c.w, width: c.d + 0.2 }], style, () => c.cot);
  for (const o of [...tmp.children]) g.add(o);
  // mỏm đá lấn vào dưới đầu cầu 0,4 m: che mặt đáy trụ gỗ / ván đầu cầu (cùng cao 0, ở cảnh nằm sát đất nên không lộ)
  for (const s of [-1, 1]) g.add(box(4, c.cot, c.d + 3, style.stone, s * (c.w / 2 + 1.6), c.cot / 2, 0));
  water(g, c.w + 2, c.d + 6, style);
};

/** Hàm dựng cầu đợt 3 — `mau_nha.ts` gộp vào bảng chung. */
export const BUILD_CAU: Record<string, Build> = {
  'cau-vom': cauVom,
  'cau-bang': cauBang,
  'cau-mai': cauMai,
  'cau-treo': cauTreo,
};
