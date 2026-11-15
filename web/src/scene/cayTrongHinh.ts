/**
 * Cây vườn rau dựng bằng code (V-60 — `trees.crown: "chum"`, hồ sơ `docs/tham_khao/thuc-vat-dep-nhe.md` mục "Cây trồng"):
 * thay mẫu Kenney flat góc cạnh bằng 3 "viên gạch" mềm — **lá** (dải thon 2 khúc, hai mặt, màu đỉnh gốc → ngọn), **cụm lá**
 * (vòng lá quanh tâm), **quả** (cầu có pháp tuyến mượt, màu đỉnh tối dưới sáng trên; bí có múi, dưa có sọc). Mỗi giai đoạn
 * khác rõ ở **cỡ + màu + dáng** (Hay Day / AC): mầm 2 lá non → đang lớn xanh đậm → chín có màu quả / bông / hạt đặc trưng.
 * Hình mẫu ≈ 0,2–0,3 m lúc chín, `scale` trong `CODE_LOOKS` đưa về cỡ khóm Kenney cũ (rồi nhân `cropScale` ở `cayTrong.ts`). Mọi hình không chỉ mục, cùng thuộc tính
 * (vị trí, pháp tuyến, màu) để gộp một lưới. Mỗi khóm ≤ ~150 tam giác.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { softLimb, softStrip } from './khoiMem';

const v = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);
const UP = v(0, 1, 0);

/** Hình code của vườn: tên = cây-giai đoạn (mầm dùng chung trừ lúa / ngô). */
export type CodeShape =
  | 'dat'
  | 'mam'
  | 'mam-co'
  | 'cai-lon'
  | 'cai-chin'
  | 'cu-cai-lon'
  | 'cu-cai-chin'
  | 'ngo-lon'
  | 'ngo-chin'
  | 'lua-lon'
  | 'lua-chin'
  | 'bi-lon'
  | 'bi-chin'
  | 'cuc-lon'
  | 'cuc-chin'
  | 'dua-lon'
  | 'dua-chin'
  | 'tra-lon'
  | 'tra-chin';

export interface CodePart {
  shape: CodeShape;
  scale: number;
  count: 1 | 2 | 4;
}
const p = (shape: CodeShape, scale: number, count: 1 | 2 | 4): CodePart => ({ shape, scale, count });

/** Vừa gieo: 4 ụ đất (cây nào cũng vậy). */
export const CODE_SOWN = p('dat', 1, 4);

/** Dáng từng cây ở mầm · đang lớn · chín (cùng mã cây `zones/vuon.ts`). */
export const CODE_LOOKS: Readonly<Record<string, readonly [CodePart, CodePart, CodePart]>> = {
  cai: [p('mam', 1.35, 4), p('cai-lon', 1.5, 4), p('cai-chin', 1.72, 4)],
  'cu-cai': [p('mam', 1.35, 4), p('cu-cai-lon', 1.5, 4), p('cu-cai-chin', 1.65, 4)],
  ngo: [p('mam-co', 1.5, 4), p('ngo-lon', 1.5, 2), p('ngo-chin', 1.65, 2)],
  lua: [p('mam-co', 1.2, 4), p('lua-lon', 1.5, 4), p('lua-chin', 1.65, 4)],
  bi: [p('mam', 1.5, 2), p('bi-lon', 1.8, 2), p('bi-chin', 2.25, 1)],
  cuc: [p('mam', 1.35, 4), p('cuc-lon', 1.5, 4), p('cuc-chin', 1.72, 4)],
  dua: [p('mam', 1.5, 2), p('dua-lon', 1.8, 2), p('dua-chin', 2.25, 1)],
  tra: [p('mam', 1.35, 4), p('tra-lon', 1.5, 4), p('tra-chin', 1.95, 2)],
};

/** hai mặt dải → bỏ chỉ mục để gộp với phần khác */
const flat = (g: THREE.BufferGeometry): THREE.BufferGeometry => {
  if (!g.index) return g;
  const out = g.toNonIndexed();
  g.dispose();
  out.deleteAttribute('aSway');
  return out;
};

/**
 * Một lá: từ `at` toả theo góc `a`, dài `len`, rộng nhất `w` ở giữa, vồng lên `rise` rồi rủ `droop` ở ngọn. Pháp tuyến
 * pha hướng lên (lá sáng như mặt đất). 8 tam giác.
 */
function leaf(at: THREE.Vector3, a: number, len: number, w: number, rise: number, droop: number, base: string, tip: string, up = 0): THREE.BufferGeometry {
  const out = v(Math.cos(a), 0, Math.sin(a));
  const pts = [at, at.clone().addScaledVector(out, len * 0.5).add(v(0, rise + up * 0.5, 0)), at.clone().addScaledVector(out, len).add(v(0, rise + up - droop, 0))];
  const n = out.clone().multiplyScalar(0.35).add(UP).normalize();
  return flat(softStrip(pts, [w * 0.35, w, 0], v(-Math.sin(a), 0, Math.cos(a)), () => n, base, tip));
}

/** Cụm `n` lá quanh tâm (cải, củ cải, cúc): lá lệch góc đều + lệch nhẹ độ dài. */
function rosette(n: number, len: number, w: number, rise: number, droop: number, base: string, tip: string, y = 0, turn = 0): THREE.BufferGeometry[] {
  return Array.from({ length: n }, (_, k) => leaf(v(0, y, 0), turn + (k / n) * Math.PI * 2, len * (0.88 + 0.12 * (k % 2)), w, rise, droop, base, tip));
}

/**
 * Quả / bụi tròn: elip `r` tại `c`, pháp tuyến elip (mượt), màu đáy → giữa → đỉnh; `ribs` > 0 = múi (bí), `stripe` = màu
 * sọc dọc (dưa hấu). Không chỉ mục.
 */
function ball(c: THREE.Vector3, r: THREE.Vector3, cols: readonly [string, string, string], seg: [number, number], ribs = 0, stripe?: string): THREE.BufferGeometry {
  const g0 = new THREE.SphereGeometry(1, seg[0], seg[1]);
  g0.deleteAttribute('uv');
  const g = flat(g0);
  const pos = g.getAttribute('position');
  const nrm = g.getAttribute('normal');
  const col = new Float32Array(pos.count * 3);
  const [lo, md, hi] = cols.map((x) => new THREE.Color(x));
  const st = stripe ? new THREE.Color(stripe) : null;
  const d = new THREE.Vector3();
  const k = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    d.fromBufferAttribute(pos, i);
    const phi = Math.atan2(d.z, d.x);
    const m = ribs ? 1 + 0.07 * Math.cos(ribs * phi) * Math.sqrt(Math.max(0, 1 - d.y * d.y)) : 1;
    pos.setXYZ(i, c.x + d.x * r.x * m, c.y + d.y * r.y * (ribs ? 0.92 + 0.08 * m : 1), c.z + d.z * r.z * m);
    const n = v(d.x / r.x, d.y / r.y, d.z / r.z).normalize();
    nrm.setXYZ(i, n.x, n.y, n.z);
    const t = (d.y + 1) / 2;
    if (t < 0.5) k.copy(lo).lerp(md, t * 2);
    else k.copy(md).lerp(hi, (t - 0.5) * 2);
    if (ribs) k.multiplyScalar(0.85 + 1.07 * (m - 0.93)); // rãnh múi (m nhỏ) tối hơn sống múi ~15 %
    if (st && Math.cos(8 * phi) > 0.2) k.lerp(st, 0.7);
    col.set([k.r, k.g, k.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

/** Thân / cuống tròn nhỏ (ngô, cuống bí) — ống `sides` cạnh. */
const stalk = (from: THREE.Vector3, to: THREE.Vector3, r0: number, r1: number, color: string, sides = 4): THREE.BufferGeometry =>
  flat(softLimb([from, to], [r0, r1], color, -0.1, sides));

/** Bông hoa dẹt `n` cạnh (cúc): mặt trên nhị cam → cánh vàng, mặt dưới cánh sẫm. 2n tam giác. */
function disc(c: THREE.Vector3, r: number, n: number, petal: string, heart: string): THREE.BufferGeometry {
  const pc = new THREE.Color(petal);
  const hc = new THREE.Color(heart);
  const under = pc.clone().multiplyScalar(0.75);
  const pos: number[] = [];
  const col: number[] = [];
  const top = c.clone().add(v(0, r * 0.25, 0));
  const rim = (k: number): THREE.Vector3 => c.clone().add(v(Math.cos((k / n) * Math.PI * 2) * r, 0, Math.sin((k / n) * Math.PI * 2) * r));
  for (let k = 0; k < n; k++) {
    const a = rim(k);
    const b = rim(k + 1);
    for (const [q, cc] of [[top, hc], [b, pc], [a, pc], [c, under], [a, under], [b, under]] as const) {
      pos.push(q.x, q.y, q.z);
      col.push(cc.r, cc.g, cc.b);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(Array.from({ length: pos.length / 3 }, () => [0, 1, 0]).flat(), 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return g;
}

const G = { young: '#7fbf4f', youngTip: '#b4e07c', leaf: '#4f8f3a', leafTip: '#86c25a', deep: '#3d7a34', deepTip: '#6fae4c' };

function build(shape: CodeShape): THREE.BufferGeometry[] {
  switch (shape) {
    case 'dat': {
      const g = flat(new THREE.SphereGeometry(0.16, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.4, 1));
      g.deleteAttribute('uv');
      const c = new THREE.Color('#7a5a40');
      g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.getAttribute('position').count * 3).map((_, i) => [c.r, c.g, c.b][i % 3]), 3));
      return [g];
    }
    case 'mam': // 2 lá mầm tròn trên cuống ngắn
      return [stalk(v(0, -0.01, 0), v(0, 0.07, 0), 0.008, 0.006, G.young), leaf(v(0, 0.07, 0), 0.3, 0.07, 0.06, 0.02, 0, G.young, G.youngTip), leaf(v(0, 0.07, 0), 0.3 + Math.PI, 0.07, 0.06, 0.02, 0, G.young, G.youngTip)];
    case 'mam-co': // 3 lá kim thẳng (ngô, lúa)
      return [0, 2.1, 4.2].map((a) => leaf(v(0, 0, 0), a, 0.03, 0.025, 0.14, 0, G.young, G.youngTip, 0.02));
    case 'cai-lon':
      return rosette(5, 0.16, 0.09, 0.12, 0.02, '#cfe0a8', G.leaf);
    case 'cai-chin': // cải ngọt: bẹ trắng, lá xanh đậm to, lõi non sáng
      return [...rosette(7, 0.22, 0.13, 0.2, 0.03, '#e2e8c4', '#3f7f34'), ...rosette(3, 0.12, 0.08, 0.16, 0, '#e2e8c4', '#6fae4c', 0.01, 0.5)];
    case 'cu-cai-lon':
      return rosette(5, 0.2, 0.07, 0.18, 0.05, G.leaf, G.leafTip);
    case 'cu-cai-chin': // củ trắng nhú khỏi đất + lá
      return [ball(v(0, 0.05, 0), v(0.07, 0.1, 0.07), ['#cfd2c2', '#f4f4ec', '#d6e6b0'], [6, 4]), ...rosette(5, 0.2, 0.07, 0.2, 0.06, G.leaf, G.leafTip, 0.14)];
    case 'ngo-lon': {
      const parts = [stalk(v(0, -0.01, 0), v(0, 0.38, 0), 0.022, 0.014, '#6fa548')];
      for (let k = 0; k < 4; k++) parts.push(leaf(v(0, 0.08 + k * 0.08, 0), k * 2.4, 0.18, 0.05, 0.06, 0.09, G.leaf, G.leafTip));
      return parts;
    }
    case 'ngo-chin': {
      const parts = [stalk(v(0, -0.01, 0), v(0, 0.58, 0), 0.026, 0.016, '#86a84a')];
      for (let k = 0; k < 5; k++) parts.push(leaf(v(0, 0.08 + k * 0.09, 0), k * 2.4, 0.22, 0.055, 0.06, 0.1, '#5f9a3e', '#a9c46a'));
      for (const [a, y] of [[0.6, 0.27], [3.5, 0.34]] as const) {
        const out = v(Math.cos(a), 0, Math.sin(a));
        parts.push(ball(v(0, y, 0).addScaledVector(out, 0.05), v(0.032, 0.075, 0.032), ['#c99a2e', '#f2c84b', '#f8dc7a'], [5, 3]));
      }
      for (let k = 0; k < 3; k++) parts.push(leaf(v(0, 0.56, 0), k * 2.1, 0.06, 0.02, 0.1, 0.02, '#c9a85a', '#ead79a', 0.04));
      return parts;
    }
    case 'lua-lon':
      return Array.from({ length: 7 }, (_, k) => leaf(v(0, 0, 0), k * 0.9, 0.08 + 0.02 * (k % 3), 0.026, 0.26, 0.04, '#4f8f3a', '#8cc860', 0.02));
    case 'lua-chin': // bông lúa vàng rủ
      return [
        ...Array.from({ length: 7 }, (_, k) => leaf(v(0, 0, 0), k * 0.9, 0.08 + 0.02 * (k % 3), 0.026, 0.28, 0.05, '#a99a42', '#d8c470', 0.02)),
        ...Array.from({ length: 4 }, (_, k) => leaf(v(0, 0.24, 0), 0.4 + k * 1.57, 0.13, 0.045, 0.06, 0.14, '#d9ab3c', '#f2d27a')),
      ];
    case 'bi-lon': // lá to tròn sát đất + dây
      return [0, 2.2, 4.3].map((a, k) => leaf(v(0, 0.02, 0), a, 0.2, 0.18, 0.06 + 0.02 * k, 0.03, G.deep, G.deepTip));
    case 'bi-chin':
      return [
        ball(v(0, 0.1, 0), v(0.14, 0.1, 0.14), ['#b8561c', '#e8822e', '#f6a654'], [10, 5], 10),
        stalk(v(0, 0.18, 0), v(0.02, 0.24, 0.01), 0.014, 0.01, '#6b5a2a'),
        leaf(v(0.1, 0.02, 0), -0.4, 0.17, 0.15, 0.05, 0.02, G.deep, G.deepTip),
        leaf(v(-0.1, 0.02, 0.02), 2.8, 0.15, 0.14, 0.05, 0.02, G.deep, G.deepTip),
      ];
    case 'cuc-lon':
      return rosette(6, 0.12, 0.05, 0.18, 0.03, G.deep, G.leafTip);
    case 'cuc-chin': // khóm lá + 3 bông cúc vàng trên cuống
      return [
        ...rosette(5, 0.12, 0.055, 0.16, 0.03, G.deep, G.leafTip),
        ...[0, 2.1, 4.2].flatMap((a, k) => {
          const top = v(Math.cos(a) * 0.05, 0.22 + 0.04 * k, Math.sin(a) * 0.05);
          return [stalk(v(0, 0.02, 0), top, 0.006, 0.005, G.leaf, 3), disc(top, 0.06, 7, '#f6c93a', '#e88a2a')];
        }),
      ];
    case 'dua-lon':
      return [0.4, 2.5, 4.4].map((a, k) => leaf(v(0, 0.02, 0), a, 0.19, 0.14, 0.04 + 0.02 * k, 0.03, '#3f7f36', '#79b453'));
    case 'dua-chin': // dưa hấu sọc nằm trên lá
      return [
        ball(v(0, 0.1, 0), v(0.17, 0.11, 0.12), ['#24521f', '#3f8a35', '#5fae4a'], [8, 6], 0, '#1f4a1c'),
        leaf(v(0.12, 0.02, 0), -0.5, 0.15, 0.12, 0.04, 0.02, '#3f7f36', '#79b453'),
        leaf(v(-0.12, 0.02, 0), 2.7, 0.14, 0.12, 0.04, 0.02, '#3f7f36', '#79b453'),
      ];
    case 'tra-lon': // bụi chè nhỏ: 2 khối lá
      return [ball(v(0, 0.08, 0), v(0.1, 0.08, 0.1), ['#2f5f2c', '#3f7a38', '#5f9a48'], [6, 3]), ball(v(0.05, 0.13, -0.03), v(0.07, 0.06, 0.07), ['#2f5f2c', '#447f3a', '#6aa84f'], [6, 3])];
    case 'tra-chin': // bụi to, ngọn búp non sáng
      return [
        ball(v(0, 0.1, 0), v(0.15, 0.1, 0.14), ['#2a5628', '#3a7434', '#5b9446'], [7, 4]),
        ball(v(0.07, 0.16, 0.04), v(0.09, 0.07, 0.09), ['#335f2e', '#4a8a3e', '#9ccc66'], [6, 3]),
        ball(v(-0.06, 0.17, -0.04), v(0.08, 0.06, 0.08), ['#335f2e', '#4a8a3e', '#a8d470'], [6, 3]),
      ];
  }
}

const cache = new Map<CodeShape, THREE.BufferGeometry>();

/** Hình một khóm (dựng một lần, dùng lại). */
export function codeShape(shape: CodeShape): THREE.BufferGeometry {
  let g = cache.get(shape);
  if (!g) {
    const parts = build(shape);
    g = parts.length > 1 ? mergeGeometries(parts) : parts[0];
    if (parts.length > 1) for (const x of parts) x.dispose();
    cache.set(shape, g);
  }
  return g;
}

/** Thời gian "nảy" khi luống đổi dáng (s) — hồ sơ: 0,2–0,25 s. */
export const POP_S = 0.25;

/** Cỡ lúc nảy theo thời gian từ khi đổi dáng: 0,6 → 1,1 (60 % thời gian) → 1,0; hết `POP_S` = 1. */
export function popScale(t: number): number {
  const u = t / POP_S;
  if (u >= 1) return 1;
  if (u < 0) return 0.6;
  return u < 0.6 ? 0.6 + 0.5 * (u / 0.6) : 1.1 - 0.1 * ((u - 0.6) / 0.4);
}
