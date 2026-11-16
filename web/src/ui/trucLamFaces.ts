/**
 * Chân dung 4 NPC trò chơi Trúc Lâm (thiết kế 2026-11-16.13): có ảnh `design/models/anh/<mã>-chan-dung.png` thì dùng ảnh,
 * chưa có model / ảnh → **chân dung giữ chỗ** vẽ như artboard (`LuuThuong-*`, `BanMang-*`: nền, áo, tóc, râu / mũ). Người
 * chơi (`null`) chưa có chân dung → ô tròn trơn (như HUD Kỳ Văn Uyển). Dựng bằng createElementNS, không innerHTML.
 */
import './trucLam.css';
import { portraitOf } from './dialogBox';

const SVG = 'http://www.w3.org/2000/svg';

type Part = [tag: 'circle' | 'path' | 'rect', attrs: Record<string, string | number>];

const BODY = 'M5 40 Q7 27 20 26 Q33 27 35 40Z';
const HAIR = 'M12.2 17 Q12 8.8 20 8.8 Q28 8.8 27.8 17 Q24.5 12.4 20 12.4 Q15.5 12.4 12.2 17Z';
const SKIN = '#F0CDB5';
const EYE = '#2A2422';

function base(bg: string, robe: string, hair: string): Part[] {
  return [
    ['circle', { cx: 20, cy: 20, r: 20, fill: bg }],
    ['path', { d: BODY, fill: robe, stroke: 'rgba(36,50,58,.2)', 'stroke-width': 0.6 }],
    ['circle', { cx: 20, cy: 17.5, r: 7.8, fill: SKIN }],
    ['path', { d: HAIR, fill: hair }],
    ['circle', { cx: 17.2, cy: 18.4, r: 0.9, fill: EYE }],
    ['circle', { cx: 22.8, cy: 18.4, r: 0.9, fill: EYE }],
  ];
}

/** Bảng vẽ theo mã NPC (màu như artboard). */
const FACES: Record<string, Part[]> = {
  'thi-ong': [
    ...base('#DCE6EE', '#7F98AE', '#EDEDE8'),
    ['path', { d: 'M15 21 Q20 33 25 21 Q20 24.5 15 21Z', fill: '#F6F6F2', stroke: 'rgba(36,50,58,.25)', 'stroke-width': 0.6 }],
    ['circle', { cx: 20, cy: 7, r: 3.4, fill: '#EDEDE8' }],
  ],
  'tu-tai': [
    ...base('#EFE9DC', '#E7DCC0', EYE),
    ['circle', { cx: 20, cy: 7, r: 3.4, fill: EYE }],
    ['rect', { x: 16, y: 6.3, width: 8, height: 1.2, fill: '#D4A64A' }],
  ],
  'tai-nu': [
    ...base('#E2ECDD', '#BFD6B8', EYE),
    ['circle', { cx: 13.5, cy: 9, r: 3.2, fill: EYE }],
    ['circle', { cx: 26.5, cy: 9, r: 3.2, fill: EYE }],
    ['circle', { cx: 26, cy: 11.5, r: 1.2, fill: '#E59AA8' }],
  ],
  'truc-ong': [
    ...base('#EBE1D2', '#8A6A48', '#9A9690'),
    ['path', { d: 'M4 15.5 L20 4 L36 15.5 Q20 18 4 15.5Z', fill: '#D8C08A', stroke: '#A88A50', 'stroke-width': 0.8 }],
    ['path', { d: 'M13 20 Q20 26 27 20', stroke: '#BDBAB4', 'stroke-width': 2, fill: 'none' }],
  ],
};

/** Chân dung tròn cỡ [size] của [npc] (`null` = người chơi → ô tròn trơn). */
export function trucLamFace(npc: string | null, size: number, cls = 'tl-face'): Element {
  const url = npc ? portraitOf(npc) : undefined;
  if (url) {
    const img = document.createElement('img');
    img.className = cls;
    img.src = url;
    img.alt = '';
    img.width = img.height = size;
    return img;
  }
  const parts = npc ? FACES[npc] : undefined;
  if (!parts) {
    const ph = document.createElement('span');
    ph.className = `${cls} ph`;
    ph.style.width = ph.style.height = `${size}px`;
    ph.setAttribute('aria-hidden', 'true');
    return ph;
  }
  const s = document.createElementNS(SVG, 'svg');
  s.setAttribute('class', cls);
  s.setAttribute('viewBox', '0 0 40 40');
  s.setAttribute('width', String(size));
  s.setAttribute('height', String(size));
  s.setAttribute('aria-hidden', 'true');
  for (const [tag, attrs] of parts) {
    const e = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    s.append(e);
  }
  return s;
}

/** Ô phím chữ nổi (máy tính): "1", "E", "Esc"… */
export function keyCap(text: string, cls = 'tl-key'): HTMLElement {
  const k = document.createElement('kbd');
  k.className = cls;
  k.textContent = text;
  k.setAttribute('aria-hidden', 'true');
  return k;
}
