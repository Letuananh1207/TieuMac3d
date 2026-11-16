/**
 * Hình vẽ nhỏ HUD Trúc Lâm (thiết kế 2026-11-16.13): chén lệnh son viền vàng, búp măng (thường / to), đàn cầm, nét 24 × 24.
 * Đường nét chép từ artboard (`LuuThuong-*`, `HaiMang-*`, `TrucLam-nut-trang-thai`). createElementNS, không innerHTML.
 */
const SVG = 'http://www.w3.org/2000/svg';

type Part = [tag: 'circle' | 'path' | 'ellipse' | 'rect', attrs: Record<string, string | number>];

function draw(view: string, w: number, h: number, parts: Part[], extra: Record<string, string> = {}): SVGSVGElement {
  const s = document.createElementNS(SVG, 'svg');
  s.setAttribute('viewBox', view);
  s.setAttribute('width', String(w));
  s.setAttribute('height', String(h));
  s.setAttribute('aria-hidden', 'true');
  for (const [k, v] of Object.entries(extra)) s.setAttribute(k, v);
  for (const [tag, attrs] of parts) {
    const e = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    s.append(e);
  }
  return s;
}

/** Biểu tượng nét (24 × 24, màu chữ). */
export function strokeIcon(size: number, paths: readonly string[], width = 2.2): SVGSVGElement {
  return draw(
    '0 0 24 24',
    size,
    size,
    paths.map((d) => ['path', { d }] as Part),
    { fill: 'none', stroke: 'currentColor', 'stroke-width': String(width), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  );
}

export const ICON_LEAVE = ['M10 4H5v16h5', 'M14 8l4 4-4 4', 'M18 12H9'];
export const ICON_BRUSH = ['M6 20c2-6 6-12 12-16', 'M8 13c3 0 5 1 6 3M11 9c2 0 4 .5 5 2'];
export const ICON_TICK = ['M5 12l5 5 9-10'];
export const ICON_CROSS = ['M6 6l12 12M18 6L6 18'];
export const ICON_AGAIN = ['M4 12a8 8 0 1 0 2.4-5.7', 'M4 4v4h4'];
export const ICON_BACK = ['M15 5l-7 7 7 7'];
export const ICON_PAUSE = ['M9 6v12M15 6v12'];
export const ICON_STAND = ['M12 4v10', 'M8 10l4 4 4-4', 'M5 20h14'];
export const ICON_NOTE = ['M9 18V6l10-2v12', 'M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3z', 'M19 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z'];
export const ICON_LIST = ['M8 6h12M8 12h12M8 18h12', 'M4 6h.01M4 12h.01M4 18h.01'];

/** Chén lệnh (son, viền vàng). */
export function cupIcon(size: number): SVGSVGElement {
  return draw('0 0 32 32', size, size, [
    ['ellipse', { cx: 16, cy: 22, rx: 12, ry: 5, fill: 'rgba(36,50,58,.25)' }],
    ['path', { d: 'M5 13 Q16 30 27 13Z', fill: '#B54A3A', stroke: '#D4A64A', 'stroke-width': 2.4 }],
    ['ellipse', { cx: 16, cy: 13, rx: 11, ry: 3.6, fill: '#F2EADA', stroke: '#D4A64A', 'stroke-width': 2.4 }],
  ]);
}

/** Búp măng; [big] = măng to (vỏ vàng sẫm hơn). */
export function shootIcon(size: number, big = false): SVGSVGElement {
  const line = big ? '#8A6A2A' : '#A9802F';
  return draw('0 0 48 48', size, size, [
    ['path', { d: 'M24 4 C20 14 14 27 13 38 Q24 45 35 38 C34 27 28 14 24 4Z', fill: big ? '#C99A3E' : '#D9B45E', stroke: line, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }],
    ['path', { d: 'M14.5 34 L24 25.5 L33.5 34', stroke: line, fill: 'none', 'stroke-width': 1.3 }],
    ['path', { d: 'M17 24.5 L24 17.5 L31 24.5', stroke: line, fill: 'none', 'stroke-width': 1.3 }],
    ['path', { d: 'M20 15 L24 10.5 L28 15', stroke: line, fill: 'none', 'stroke-width': 1.3 }],
    ['path', { d: 'M13 38 Q24 45 35 38 L35 41 Q24 48 13 41Z', fill: '#7A5A3E' }],
  ]);
}

/** Đàn cầm (nét). */
export function qinIcon(size: number): SVGSVGElement {
  return strokeIcon(size, ['M2.5 9.5 Q12 6.5 21.5 9.5 L21.5 14.5 Q12 17.5 2.5 14.5Z', 'M5 11h14M5 13h14'], 2);
}
