/**
 * Hình cây phẳng 8 loại + gói hạt (thiết kế 2026-11-15.29 `VuonRau-*`, `CuaHang-hat-*`): khung `-24 -44 48 48` (gốc cây ở
 * (0, 0)), chép từ artboard; Dưa hấu + Trà artboard chưa vẽ → dựng cùng kiểu (lá elip + quả). Cùng dữ liệu với
 * `app/lib/lesson/crop_art.dart` (Tạp hoá Flutter) — đổi hình sửa cả hai. Dựng bằng `createElementNS` (`decorIcons.svgIcon`).
 */
import type { CropId } from '../zones/vuon';
import { svgIcon, type SvgNode } from './decorIcons';

/** Elip (xoay [rot] độ quanh tâm) · chữ nhật · tròn · đoạn thẳng · cong bậc 2 — đủ cho mọi hình cây. */
export type CropShape =
  | { e: [cx: number, cy: number, rx: number, ry: number, rot: number]; fill: string; stroke?: string }
  | { r: [x: number, y: number, w: number, h: number]; fill: string }
  | { c: [cx: number, cy: number, r: number]; fill: string }
  | { l: [x1: number, y1: number, x2: number, y2: number]; stroke: string; w: number }
  | { q: [x1: number, y1: number, qx: number, qy: number, x2: number, y2: number]; stroke: string; w: number };

/** 8 cánh hoa cúc quanh tâm ([d] = cách tâm, cánh [rx] × [ry], nhuỵ [rc]). */
function daisy(cx: number, cy: number, d: number, rx: number, ry: number, rc: number): CropShape[] {
  const out: CropShape[] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    out.push({ e: [cx + d * Math.cos(a), cy + d * Math.sin(a), rx, ry, 90 + 45 * k], fill: '#F2C53D' });
  }
  out.push({ c: [cx, cy, rc], fill: '#B07A2A' });
  return out;
}

export const CROP_ART: Readonly<Record<CropId, readonly CropShape[]>> = {
  cai: [
    { e: [-7, -12, 5.4, 12, -50], fill: '#5E9C4E' },
    { e: [-2.8, -12, 5.4, 12, -20], fill: '#7FB069' },
    { e: [2.8, -12, 5.4, 12, 20], fill: '#5E9C4E' },
    { e: [7, -12, 5.4, 12, 50], fill: '#7FB069' },
    { e: [0, -18, 5.4, 12, 0], fill: '#5E9C4E' },
    { r: [-3, -8, 6, 8], fill: '#DDEBC8' },
  ],
  'cu-cai': [
    { e: [0, -6, 9, 8, 0], fill: '#F4F0E6', stroke: '#D9D2C2' },
    { l: [0, 2, 0, 8], stroke: '#D9D2C2', w: 2 },
    { e: [-6, -22, 4.5, 10, -30], fill: '#5E9C4E' },
    { e: [0, -22, 4.5, 10, 0], fill: '#5E9C4E' },
    { e: [6, -22, 4.5, 10, 30], fill: '#5E9C4E' },
  ],
  ngo: [
    { l: [0, 0, 0, -40], stroke: '#6F9A4A', w: 3.5 },
    { e: [-7, -18, 4.95, 11, -40], fill: '#7FB069' },
    { e: [7, -26, 4.95, 11, 40], fill: '#6F9A4A' },
    { e: [5, -30, 4, 9, 0], fill: '#E8C24A', stroke: '#C9A035' },
    { l: [5, -40, 7, -44], stroke: '#B88A3A', w: 1.5 },
  ],
  lua: [
    { q: [-10, 0, -9, -20, -4, -30], stroke: '#B8A050', w: 2 },
    { e: [-3, -30, 2.6, 6, 30], fill: '#E2C25A' },
    { q: [-4, 0, -3, -20, 2, -32], stroke: '#B8A050', w: 2 },
    { e: [3, -32, 2.6, 6, 30], fill: '#E2C25A' },
    { q: [2, 0, 3, -20, 8, -34], stroke: '#B8A050', w: 2 },
    { e: [9, -34, 2.6, 6, 30], fill: '#E2C25A' },
    { q: [8, 0, 9, -20, 14, -36], stroke: '#B8A050', w: 2 },
    { e: [15, -36, 2.6, 6, 30], fill: '#E2C25A' },
  ],
  bi: [
    { e: [-14, -6, 4.05, 9, -60], fill: '#5E9C4E' },
    { e: [14, -6, 4.05, 9, 60], fill: '#6F9A4A' },
    { e: [-5, -10, 8, 10, 0], fill: '#D9762E' },
    { e: [5, -10, 8, 10, 0], fill: '#E3863A' },
    { e: [0, -10, 6, 10, 0], fill: '#EA9445' },
    { r: [-1.5, -23, 3, 5], fill: '#5A7A3A' },
  ],
  cuc: [
    { l: [0, 0, 0, -22], stroke: '#5E9C4E', w: 2 },
    { l: [-8, 0, -8, -16], stroke: '#5E9C4E', w: 2 },
    { l: [8, 0, 8, -18], stroke: '#5E9C4E', w: 2 },
    ...daisy(0, -26, 4.9, 1.73, 3.85, 2.45),
    ...daisy(-8, -19, 3.85, 1.36, 3.03, 1.93),
    ...daisy(8, -21, 4.2, 1.49, 3.3, 2.1),
  ],
  dua: [
    { e: [-16, -4, 4, 8, -60], fill: '#5E9C4E' },
    { e: [16, -4, 4, 8, 60], fill: '#6F9A4A' },
    { e: [0, -11, 14, 10, 0], fill: '#4E8F45', stroke: '#3B6E34' },
    { q: [-8, -19, -10, -11, -8, -3], stroke: '#2F5E2A', w: 2 },
    { q: [0, -21, -1, -11, 0, -1], stroke: '#2F5E2A', w: 2 },
    { q: [8, -19, 10, -11, 8, -3], stroke: '#2F5E2A', w: 2 },
    { e: [-6, -15, 3, 1.6, -30], fill: '#8CC37A' },
  ],
  tra: [
    { r: [-1.5, -5, 3, 5], fill: '#7A5A3A' },
    { c: [-8, -13, 9], fill: '#4E8A44' },
    { c: [8, -13, 9], fill: '#4E8A44' },
    { c: [0, -20, 10], fill: '#5E9C4E' },
    { e: [-6, -26, 2, 3.6, -20], fill: '#A8D08D' },
    { e: [5, -28, 2, 3.6, 15], fill: '#A8D08D' },
    { e: [12, -18, 2, 3.6, 40], fill: '#A8D08D' },
  ],
};

const n = (v: number): string => String(Math.round(v * 100) / 100);

function shapeNode(s: CropShape): SvgNode {
  if ('e' in s) {
    const [cx, cy, rx, ry, rot] = s.e;
    const a: Record<string, string> = { cx: n(cx), cy: n(cy), rx: n(rx), ry: n(ry), fill: s.fill };
    if (rot) a.transform = `rotate(${rot} ${n(cx)} ${n(cy)})`;
    if (s.stroke) a.stroke = s.stroke;
    return ['ellipse', a];
  }
  if ('r' in s) {
    const [x, y, w, h] = s.r;
    return ['rect', { x: n(x), y: n(y), width: n(w), height: n(h), fill: s.fill }];
  }
  if ('c' in s) return ['circle', { cx: n(s.c[0]), cy: n(s.c[1]), r: n(s.c[2]), fill: s.fill }];
  if ('l' in s) {
    const [x1, y1, x2, y2] = s.l;
    return ['path', { d: `M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}`, stroke: s.stroke, 'stroke-width': n(s.w), fill: 'none' }];
  }
  const [x1, y1, qx, qy, x2, y2] = s.q;
  return ['path', { d: `M${n(x1)} ${n(y1)}Q${n(qx)} ${n(qy)} ${n(x2)} ${n(y2)}`, stroke: s.stroke, 'stroke-width': n(s.w), fill: 'none' }];
}

/** Hình cây chín cỡ [size] (vuông). */
export function cropPicture(id: CropId, size: number): SVGElement {
  return svgIcon(CROP_ART[id].map(shapeNode), size, '-24 -44 48 48');
}

/** Gói hạt 26 (góc dưới phải thẻ hạt ở Tạp hoá). */
export const SEED_PACK: readonly SvgNode[] = [
  ['path', { d: 'M5 4h16v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z', fill: '#E8D8A8', stroke: '#B89A5A' }],
  ['circle', { cx: '10', cy: '14', r: '1.6', fill: '#8A6A48' }],
  ['circle', { cx: '15', cy: '12', r: '1.6', fill: '#8A6A48' }],
  ['circle', { cx: '14', cy: '17', r: '1.6', fill: '#8A6A48' }],
];

/* ---------- biểu tượng nét 24 (chép artboard `VuonRau-*`) ---------- */
const path = (d: string): SvgNode => ['path', { d }];
const dot = (cx: number, cy: number): SvgNode => ['circle', { cx: String(cx), cy: String(cy), r: '1' }];

/** Tay rắc hạt (đầu bảng chọn hạt; nút nổi "Gieo" dùng hình minh hoạ từ 2026-11-16.3). */
export const ICON_SOW: readonly SvgNode[] = [path('M7 13c0-2 1.5-3 3-3h3l3-3'), path('M5 20l3-6h7l1.5 3'), dot(17, 11), dot(19.5, 14), dot(16.5, 16)];
/** Túi hạt. */
export const ICON_BAG: readonly SvgNode[] = [path('M8 6h8l-1 2c3 1.5 5 4.5 5 8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4c0-3.5 2-6.5 5-8z'), path('M8 4l1 2M16 4l-1 2')];
/** Thùng thu mua (đầu bảng kho; nút nổi "Bán" dùng hình minh hoạ). */
export const ICON_CRATE: readonly SvgNode[] = [path('M3 9h18v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z'), path('M3 9l2-4h14l2 4'), path('M3 14h18M9 9v11M15 9v11')];
/** Dấu ✓ (tấm báo mở ô). */
export const ICON_TICK: readonly SvgNode[] = [path('M5 12.5l4.5 4.5L19 7.5')];
/** Khoá mở (hình hộp mở ô). */
export const ICON_UNLOCK: readonly SvgNode[] = [['rect', { x: '5', y: '11', width: '14', height: '10', rx: '2' }], path('M8 11V8a4 4 0 0 1 7.5-2')];

/** Sao 4 cánh trên quầng (luống chín; tấm báo "đã chín") — khung `-10 -10 20 20`. */
export const SPARKLE: readonly SvgNode[] = [
  ['circle', { r: '9', fill: 'rgba(255,236,190,.55)' }],
  ['path', { d: 'M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z', fill: '#F7D774', stroke: '#D4A64A', 'stroke-width': '.8' }],
];
/** Giọt nước "khát" (`garden-water` viền trắng 1,4) — khung `-8 -11 16 21`. */
export const DROP: readonly SvgNode[] = [
  ['path', { d: 'M0 -9 C4 -3 6 0 6 3 A6 6 0 0 1 -6 3 C-6 0 -4 -3 0 -9Z', fill: '#5B9BC4', stroke: '#FFFFFF', 'stroke-width': '1.4' }],
  ['ellipse', { cx: '-2', cy: '2', rx: '1.4', ry: '2.2', fill: 'rgba(255,255,255,.7)' }],
];
/** Đất hoang + khoá mở (hình 76 của hộp mở ô) — khung `0 0 76 76`. */
export const UNLOCK_PICTURE: readonly SvgNode[] = [
  ['path', { d: 'M14 46h48l6 14H8z', fill: '#B7A27A', stroke: '#8A7A5A', 'stroke-width': '1.5' }],
  ['rect', { x: '12', y: '28', width: '4', height: '26', fill: '#8A5A3A' }],
  ['rect', { x: '60', y: '28', width: '4', height: '26', fill: '#8A5A3A' }],
  ['path', { d: 'M24 56l-2-8M28 57l2-7M44 56l-2-8M48 57l2-7', stroke: '#7FA05A', 'stroke-width': '2' }],
  ['circle', { cx: '46', cy: '24', r: '11', fill: '#2B5446' }],
  ['rect', { x: '41', y: '24', width: '10', height: '8', rx: '1.5', fill: 'none', stroke: '#fff', 'stroke-width': '2' }],
  ['path', { d: 'M43 24v-3a3 3 0 0 1 5.6-1.5', fill: 'none', stroke: '#fff', 'stroke-width': '2', 'stroke-linecap': 'round' }],
];
