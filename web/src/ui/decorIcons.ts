/**
 * Hình vẽ của HUD trang trí (thiết kế 2026-11-14.13 / .12): biểu tượng nét 24 × 24 và hình phẳng 64 × 64 của 13 vật
 * (bản vẽ giữ chỗ trên thẻ danh mục — chép từ artboard `CuaHang-*`, `NhaTa-*`). Dựng bằng `createElementNS`, không HTML thô.
 */
import type { DecorSlotKind } from '../zones/decor';

/** Một nút SVG: thẻ, thuộc tính, con (hoặc chữ). */
export type SvgNode = readonly [tag: string, attrs: Readonly<Record<string, string>>, kids?: readonly SvgNode[] | string];

const NS = 'http://www.w3.org/2000/svg';

function build([tag, attrs, kids]: SvgNode): SVGElement {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (typeof kids === 'string') e.textContent = kids;
  else for (const k of kids ?? []) e.append(build(k));
  return e;
}

/** `<svg aria-hidden>` cỡ `size`, khung `view`, thuộc tính chung `base`. */
export function svgIcon(nodes: readonly SvgNode[], size: number, view = '0 0 24 24', base: Record<string, string> = {}): SVGElement {
  return build(['svg', { 'aria-hidden': 'true', width: String(size), height: String(size), viewBox: view, ...base }, nodes]);
}

/** Nét biểu tượng: tô `currentColor`, đầu tròn. */
export const STROKE = { fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' } as const;
const path = (d: string): SvgNode => ['path', { d }];

/** Nút Trang trí: mái nhà + bút. */
export const ICON_DECOR: readonly SvgNode[] = [path('M3 11l9-7 9 7'), path('M5 10v10h8'), path('M14.5 20.5l1-3.5 5-5 2.5 2.5-5 5z')];
/** Bút (viên nhắc). */
export const ICON_PEN: readonly SvgNode[] = [path('M4 20l4-1 11-11-3-3L5 16z')];
/** Dấu ✓ (Xong, thẻ đang đặt). */
export const ICON_CHECK: readonly SvgNode[] = [path('M5 12l5 5 9-10')];
/** "+" (ô trống). */
export const ICON_PLUS: readonly SvgNode[] = [path('M12 5v14M5 12h14')];
/** Thùng rác (Gỡ). */
export const ICON_REMOVE: readonly SvgNode[] = [path('M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13')];
/** Khoá (thẻ chưa có). */
export const ICON_LOCK: readonly SvgNode[] = [['rect', { x: '5', y: '11', width: '14', height: '10', rx: '2' }], path('M8 11V8a4 4 0 0 1 8 0v3')];
/** Huy hiệu loại ô: lá (Vườn), đèn (Sân), mái nhà (Trong nhà). */
export const ICON_SLOT: Readonly<Record<DecorSlotKind, readonly SvgNode[]>> = {
  vuon: [path('M12 20V10M12 10c-4 0-6-3-6-6 4 0 6 2 6 6zM12 12c4 0 6-3 6-6-4 0-6 2-6 6z')],
  san: [path('M12 3v3M8 8h8l-1 9H9z M10 20h4')],
  trong: [path('M4 11l8-6 8 6M6 10v9h12v-9')],
};

/** Đồng xu Văn tiền (khung 0 0 100 100): vành, mặt, lỗ vuông. */
export const COIN: readonly SvgNode[] = [
  ['circle', { cx: '50', cy: '50', r: '48', fill: '#A9802F' }],
  ['circle', { cx: '50', cy: '50', r: '44', fill: '#D4A64A' }],
  ['rect', { x: '38', y: '38', width: '24', height: '24', fill: '#8A6A2A' }],
  ['rect', { x: '41', y: '41', width: '18', height: '18', fill: '#F4F0E6' }],
];

/** Hình phẳng 64 × 64 từng vật (mã `DECOR_ITEMS`). */
export const DECOR_PICTURES: Readonly<Record<string, readonly SvgNode[]>> = {
  'truc-canh': [['path', { d: 'M22 54V14M32 54V8M42 54V18', stroke: '#4E7A44', 'stroke-width': '4' }], ['path', { d: 'M22 26h0M32 20h0M42 30h0', stroke: '#2F5A2A', 'stroke-width': '5' }], ['path', { d: 'M32 16q10-6 16 0M22 22q-10-6-14 2M42 26q8-4 12 4', stroke: '#6E9A5E', 'stroke-width': '3', fill: 'none' }], ['rect', { x: '16', y: '52', width: '32', height: '8', rx: '2', fill: '#8A5A3A' }]],
  'mai': [['path', { d: 'M32 58V34Q30 22 18 16M32 34Q36 24 48 20', stroke: '#5A3A28', 'stroke-width': '3.5', fill: 'none' }], ['g', { fill: '#E9A2AE' }, [['circle', { cx: '18', cy: '16', r: '4' }], ['circle', { cx: '26', cy: '22', r: '3.5' }], ['circle', { cx: '48', cy: '20', r: '4' }], ['circle', { cx: '40', cy: '26', r: '3.5' }], ['circle', { cx: '34', cy: '14', r: '3.5' }]]], ['rect', { x: '20', y: '54', width: '24', height: '6', rx: '2', fill: '#8A5A3A' }]],
  'tung': [['path', { d: 'M32 58V40', stroke: '#5A3A28', 'stroke-width': '4' }], ['path', { d: 'M12 42h40L32 26zM16 32h32L32 16zM20 22h24L32 8z', fill: '#3F6A44' }]],
  'da-thai-ho': [['path', { d: 'M22 58C14 50 24 42 18 32 14 22 26 8 34 14 44 20 36 30 44 38 52 46 44 56 38 58Z', fill: '#9AA6A8', stroke: '#6E7A7C', 'stroke-width': '2' }], ['circle', { cx: '30', cy: '26', r: '3', fill: '#6E7A7C' }], ['circle', { cx: '36', cy: '44', r: '4', fill: '#6E7A7C' }]],
  'ao-sen': [['ellipse', { cx: '32', cy: '46', rx: '26', ry: '10', fill: '#6F9FB1' }], ['ellipse', { cx: '22', cy: '44', rx: '7', ry: '3', fill: '#5F8F52' }], ['ellipse', { cx: '42', cy: '48', rx: '6', ry: '2.6', fill: '#5F8F52' }], ['path', { d: 'M32 42q-6-10 0-16 6 6 0 16z', fill: '#E9A2AE' }], ['path', { d: 'M32 42q-10-4-10-12 8 2 10 12zM32 42q10-4 10-12-8 2-10 12z', fill: '#F2BCC5' }]],
  'den-long': [['path', { d: 'M32 6v8', stroke: '#3A2418', 'stroke-width': '2' }], ['rect', { x: '24', y: '12', width: '16', height: '4', rx: '1', fill: '#3A2418' }], ['ellipse', { cx: '32', cy: '32', rx: '16', ry: '18', fill: '#C8463A' }], ['path', { d: 'M24 18q-4 14 0 28M40 18q4 14 0 28M32 14v36', stroke: '#9E2E26', 'stroke-width': '1.5', fill: 'none' }], ['rect', { x: '24', y: '48', width: '16', height: '4', rx: '1', fill: '#3A2418' }], ['path', { d: 'M32 52v8', stroke: '#D4A64A', 'stroke-width': '3' }]],
  'ban-tra': [['ellipse', { cx: '32', cy: '30', rx: '26', ry: '8', fill: '#8A5A3A' }], ['rect', { x: '10', y: '30', width: '44', height: '6', fill: '#6B4429' }], ['path', { d: 'M16 36v20M48 36v20', stroke: '#5A3A28', 'stroke-width': '4' }], ['ellipse', { cx: '26', cy: '24', rx: '6', ry: '4', fill: '#E8EEF5', stroke: '#3A5A9A', 'stroke-width': '1.5' }], ['circle', { cx: '40', cy: '25', r: '3', fill: '#E8EEF5', stroke: '#3A5A9A', 'stroke-width': '1.5' }]],
  'chau-lan': [['path', { d: 'M20 40q-6-20 4-30M28 40q0-24 10-30M36 40q8-18 18-20M30 40q-12-10-22-8', stroke: '#4E7A44', 'stroke-width': '2.5', fill: 'none' }], ['circle', { cx: '38', cy: '14', r: '3', fill: '#C9A8D8' }], ['circle', { cx: '50', cy: '22', r: '3', fill: '#C9A8D8' }], ['path', { d: 'M18 40h28l-4 18H22z', fill: '#E8EEF5', stroke: '#3A5A9A', 'stroke-width': '2' }]],
  'lu-huong': [['path', { d: 'M14 30h36q0 18-18 18T14 30z', fill: '#7A6A4A' }], ['rect', { x: '12', y: '26', width: '40', height: '5', rx: '2', fill: '#8E7C55' }], ['path', { d: 'M20 48l-4 10M44 48l4 10M32 48v10', stroke: '#5A4A32', 'stroke-width': '3' }], ['path', { d: 'M26 22q-4-6 2-10M34 22q4-8-2-14M40 22q-2-4 2-8', stroke: '#B7BEC4', 'stroke-width': '2', fill: 'none' }]],
  'tranh-chu': [['rect', { x: '16', y: '6', width: '32', height: '4', rx: '2', fill: '#3A2418' }], ['rect', { x: '18', y: '10', width: '28', height: '44', fill: '#F2EADA', stroke: '#2B5446', 'stroke-width': '2' }], ['text', { x: '32', y: '40', 'text-anchor': 'middle', 'font-size': '22', 'font-family': 'Han Serif', 'font-weight': '700', fill: '#24323A' }, '書'], ['rect', { x: '16', y: '54', width: '32', height: '4', rx: '2', fill: '#3A2418' }]],
  'ke-sach': [['rect', { x: '12', y: '8', width: '40', height: '50', fill: '#8A5A3A' }], ['rect', { x: '16', y: '12', width: '32', height: '12', fill: '#5A3A28' }], ['rect', { x: '16', y: '28', width: '32', height: '12', fill: '#5A3A28' }], ['rect', { x: '16', y: '44', width: '32', height: '10', fill: '#5A3A28' }], ['g', { fill: '#C9B07A' }, [['rect', { x: '18', y: '14', width: '5', height: '10' }], ['rect', { x: '24', y: '15', width: '4', height: '9' }], ['rect', { x: '34', y: '30', width: '6', height: '10' }], ['rect', { x: '20', y: '46', width: '10', height: '4' }]]]],
  'an-doc': [['rect', { x: '8', y: '26', width: '48', height: '6', rx: '2', fill: '#8A5A3A' }], ['path', { d: 'M12 32v18M52 32v18', stroke: '#5A3A28', 'stroke-width': '4' }], ['path', { d: 'M8 26q-2-4 2-4M56 26q2-4-2-4', stroke: '#8A5A3A', 'stroke-width': '3', fill: 'none' }], ['rect', { x: '22', y: '20', width: '20', height: '6', fill: '#F2EADA', stroke: '#5A3A28' }]],
  'binh-phong': [['g', { stroke: '#5A3A28', 'stroke-width': '2' }, [['rect', { x: '8', y: '10', width: '15', height: '44', fill: '#F2EADA' }], ['rect', { x: '24.5', y: '10', width: '15', height: '44', fill: '#E8DEC6' }], ['rect', { x: '41', y: '10', width: '15', height: '44', fill: '#F2EADA' }]]], ['path', { d: 'M12 40q6-10 10-6M28 30q6-10 10-4M44 44q6-12 10-8', stroke: '#5F8F52', 'stroke-width': '2', fill: 'none' }]],
};
