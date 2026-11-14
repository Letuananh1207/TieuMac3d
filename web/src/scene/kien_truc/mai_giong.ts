/**
 * Mái chuẩn của bộ asset (`danh_muc.ts`): 7 kiểu × 4 giọng dốc. Mỗi mái gồm hai đoạn — đoạn dưới gần hiên dốc `hien`,
 * đoạn trên gần nóc dốc `noc` (Thanh: 27° → 42° nên mái lõm; Tống gần như thẳng) — rồi bờ nóc, đầu đao theo giọng.
 * `hinhMai` là toán thuần (để test độ dốc); `dungMai` dựng khối. Toạ độ theo hệ nhà (mặt trước nhìn +z).
 * Hồ sơ: `docs/tham_khao/kien-truc-chuan.md` mục 4 (舉架 / 舉折).
 */
import * as THREE from 'three';
import { lambert } from '../materials';
import { DOC, type Giong, type Mai } from './danh_muc';
import { frustum, prism } from './hinh';
import { ridge, roofMat } from './mai';

/** Phần bề sâu (nửa) dành cho đoạn dưới; phần còn lại là đoạn trên. */
const LOWER = 0.45;
const rad = (deg: number): number => (deg * Math.PI) / 180;

export interface MaiInput {
  kieu: Mai;
  /** thân (không kể mái đua) */
  w: number;
  d: number;
  /** chân mái (đỉnh dải xà) */
  y: number;
  /** mái đua mỗi bên */
  over: number;
  giong: Giong;
  color: string;
  ridgeColor: string;
  /** toản tiêm: số cạnh (4 / 6 / 8); thiếu = 4 */
  mat?: number;
}

/** Kích thước hai đoạn mái (thuần): mép `bw` × `bd`, lùi `r1` mỗi bên ở đoạn dưới cao `h1`, đoạn trên cao `h2`. */
export interface HinhMai {
  bw: number;
  bd: number;
  r1: number;
  h1: number;
  r2: number;
  h2: number;
  /** tổng cao mái (không kể bờ nóc) */
  cao: number;
}

export function hinhMai(o: Pick<MaiInput, 'kieu' | 'w' | 'd' | 'over' | 'giong'>): HinhMai {
  const doc = DOC[o.giong];
  const bw = o.w + 2 * o.over;
  const bd = o.d + 2 * o.over;
  if (o.kieu === 'bang') return { bw, bd, r1: 0, h1: 0.3, r2: 0, h2: 0, cao: 0.3 };
  // toản tiêm, vũ điện: dốc dồn về tâm theo cạnh ngắn; mái hai dốc: theo bề sâu
  const half = o.kieu === 'toan-tiem' ? Math.min(bw, bd) / 2 : bd / 2;
  const r1 = LOWER * half;
  const r2 = half - r1;
  const h1 = r1 * Math.tan(rad(doc.hien));
  const h2 = r2 * Math.tan(rad(doc.noc));
  return { bw, bd, r1, h1, r2, h2, cao: h1 + h2 };
}

const finialGeo = new THREE.ConeGeometry(0.28, 1.1, 8);
const tipGeo = new THREE.ConeGeometry(0.18, 1.2, 5);

/** Đầu đao ở các góc: `n` góc trên vòng bán kính `r` (chữ nhật: 4 góc `hw` × `hd`), ngả ra ngoài, chĩa lên. */
function tips(g: THREE.Group, y: number, corners: [number, number][], size: number, color: string): void {
  const mat = lambert(color);
  for (const [x, z] of corners) {
    const t = new THREE.Mesh(tipGeo, mat);
    t.scale.setScalar(size);
    t.position.set(x, y + 0.3 * size, z);
    t.rotation.order = 'YXZ';
    t.rotation.y = Math.atan2(x, z);
    t.rotation.x = 0.9;
    g.add(t);
  }
}

const rectCorners = (hw: number, hd: number): [number, number][] => [
  [-hw, -hd],
  [hw, -hd],
  [-hw, hd],
  [hw, hd],
];

/** Đa giác đều `n` cạnh có một cạnh nằm ngang ở mặt trước: bán kính đỉnh theo nửa bề rộng `a` (trung đoạn). */
const polyRadius = (a: number, n: number): number => a / Math.cos(Math.PI / n);

/** Dựng mái vào `g`. Trả về độ cao đỉnh mái (kể bờ nóc / bảo đỉnh). */
export function dungMai(g: THREE.Group, o: MaiInput): number {
  const h = hinhMai(o);
  const doc = DOC[o.giong];
  const mat = roofMat(o.color);
  const add = (geo: THREE.BufferGeometry, y: number): void => {
    const m = new THREE.Mesh(geo, mat);
    m.position.y = y;
    g.add(m);
  };
  const { bw, bd, r1, h1, h2 } = h;
  const y2 = o.y + h1;
  const top = o.y + h.cao;
  switch (o.kieu) {
    case 'bang': {
      add(new THREE.BoxGeometry(bw, 0.3, bd), o.y + 0.15);
      return o.y + 0.3;
    }
    case 'toan-tiem': {
      const n = o.mat ?? 4;
      const R = polyRadius(Math.min(bw, bd) / 2, n);
      const R1 = polyRadius(Math.min(bw, bd) / 2 - r1, n);
      const lower = new THREE.CylinderGeometry(R1, R, h1, n, 1, true).rotateY(Math.PI / n);
      add(lower.translate(0, h1 / 2, 0), o.y);
      const upper = new THREE.ConeGeometry(R1, h2, n, 1, true).rotateY(Math.PI / n);
      add(upper.translate(0, h2 / 2, 0), y2);
      const fin = new THREE.Mesh(finialGeo, lambert(o.ridgeColor));
      fin.position.y = top + 0.5;
      g.add(fin);
      const corners = Array.from({ length: n }, (_, i): [number, number] => {
        const a = Math.PI / n + (i * 2 * Math.PI) / n + Math.PI / 2;
        return [Math.cos(a) * (R - 0.1), Math.sin(a) * (R - 0.1)];
      });
      tips(g, o.y, corners, doc.vinh, o.ridgeColor);
      return top + 1.05;
    }
    case 'vu-dien': {
      // bốn mặt dốc: đoạn dưới lùi đều r1, đoạn trên dồn về nóc dài (bw − bd)
      add(frustum(bw, bd, bw - 2 * r1, bd - 2 * r1, h1), o.y);
      const len = Math.max(0.6, bw - bd);
      add(frustum(bw - 2 * r1, bd - 2 * r1, len, 0, h2), y2);
      ridge(g, top, len + 0.6, o.ridgeColor);
      tips(g, o.y, rectCorners(bw / 2 - 0.1, bd / 2 - 0.1), doc.vinh, o.ridgeColor);
      return top + 0.7;
    }
    case 'yet-son': {
      // dưới: váy bốn mặt; trên: hai mái có đầu hồi tam giác (mái prism)
      add(frustum(bw, bd, bw - 2 * r1, bd - 2 * r1, h1), o.y);
      add(prism(bw - 2 * r1, bd - 2 * r1, h2), y2 - 0.02);
      ridge(g, top - 0.02, bw - 2 * r1 + 0.4, o.ridgeColor);
      tips(g, o.y, rectCorners(bw / 2 - 0.1, bd / 2 - 0.1), doc.vinh, o.ridgeColor);
      return top + 0.7;
    }
    case 'huyen-son':
    case 'nganh-son':
    case 'quyen-bong': {
      // hai dốc: đoạn dưới chỉ lùi theo bề sâu (đầu hồi đứng), rồi mái trên; huyền sơn vươn quá hồi, ngạnh sơn sát hồi
      const ww = o.kieu === 'nganh-son' ? o.w + 0.3 : bw;
      add(frustum(ww, bd, ww, bd - 2 * r1, h1), o.y);
      if (o.kieu === 'quyen-bong') {
        // quyển bồng: vẫn hai dốc, chỉ nóc bo tròn (không bờ nóc, không sừng) — đỉnh mái thấp hơn một chút để
        // ống tròn nằm vắt qua nóc (bán kính ≈ 1/4 bề sâu đoạn trên)
        const rr = Math.min(0.9, (bd - 2 * r1) / 4);
        const hp = h2 - rr * 0.6;
        add(prism(ww, bd - 2 * r1, hp), y2 - 0.02);
        const roll = new THREE.CylinderGeometry(rr, rr, ww, 10).rotateZ(Math.PI / 2);
        add(roll, y2 + hp - rr * 0.75);
        return o.y + h1 + hp + rr * 0.25;
      }
      add(prism(ww, bd - 2 * r1, h2), y2 - 0.02);
      ridge(g, top - 0.02, ww + 0.2, o.ridgeColor, o.kieu === 'huyen-son');
      return top + 0.4;
    }
  }
}
