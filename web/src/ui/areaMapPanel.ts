/**
 * Bản đồ lớn cả cảnh (R-BANDO-2, 4, 5; thiết kế 2026-11-14.20 `BanDoVung-lon-*`): cảnh tối 32 %, tờ giấy kẹp hai trục gỗ,
 * bắc lên trên, cả cảnh vừa khung (đệm 6 m), la bàn, biểu tượng, chữ theo ưu tiên (khu > nơi đến cổng > nhà > chỗ), chú
 * giải; nút "Đóng bản đồ" (ngang: "Đóng"). Chạm lên bản đồ không đi tới. Không chữ Hán (R-HUD-4): bỏ chữ Hán tên cảnh ở
 * đầu giấy, la bàn ghi "B".
 */
import type { AreaMap, IconKind, MapLabel, MapShape } from '../zones/areaMap';
import { bigArrow, placeLabels, toMap, type Box } from '../zones/areaMapView';
import { drawMapIcon, drawMe, legendIcon, MAP_PAPER } from './areaMapIcons';
import { paintAreaMap } from './areaMapPaint';

/** Đệm quanh cảnh trong khung (m). */
const FIT_PAD = 6;
const ICON = 22;
const LEGEND: [IconKind, string][] = [
  ['vong-tran', 'Vòng trận'],
  ['cong-canh', 'Cổng'],
  ['ban-co', 'Cờ'],
  ['ban-dau-chu', 'Đấu chữ'],
  ['tap-hoa', 'Tạp hoá'],
  ['tu-hoc', 'Tự học'],
  ['bang-nhiem-vu', 'Nhiệm vụ'],
];
const PRIORITY = { khu: 0, cong: 1, nha: 2, cho: 3 } as const;

function node<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function rod(): HTMLDivElement {
  const r = node('div', 'bm-rod');
  r.setAttribute('aria-hidden', 'true');
  r.append(node('span', 'bm-knob'), node('span', 'bm-knob'));
  return r;
}

function closeIcon(size: number): SVGSVGElement {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('width', String(size));
  s.setAttribute('height', String(size));
  s.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', 'M6 6l12 12M18 6L6 18');
  s.append(p);
  return s;
}

/** Loại dấu có trong chú giải: bản đồ không có vòng trận (vùng — V-65, nhà — V-47) → bỏ mục "Vòng trận" (R-BANDO-2). */
export function legendKinds(map: Pick<AreaMap, 'icons'>): IconKind[] {
  const ring = map.icons.some((i) => i.kind === 'vong-tran');
  return LEGEND.map(([k]) => k).filter((k) => ring || k !== 'vong-tran');
}

/** Chữ hiển thị của một nhãn (R-BANDO-2, R-BANDO-4). */
export function labelText(l: MapLabel): string {
  if (l.kind === 'khu') return l.text.toLocaleUpperCase('vi');
  if (l.kind === 'cong') return `→ ${l.text}`;
  return l.floor >= 2 ? `${l.text} · tầng 2` : l.text;
}

export interface BigMapFrame {
  x: number;
  z: number;
  facing: number;
  building: string | null;
}

export class AreaMapPanel {
  private readonly root = node('div', 'big-map');
  private readonly sheet = node('section', 'bm-sheet');
  private readonly frame = node('div', 'bm-frame');
  private readonly canvas = node('canvas', 'bm-canvas');
  private readonly title = node('h2', 'bm-title');
  private readonly cardTitle = node('div', 'bm-card-title');
  private map: AreaMap | null = null;
  private open = false;
  /** mục chú giải (hai bản: dưới giấy + cột phải) — ẩn loại không có trên bản đồ */
  private readonly legendItems: { kind: IconKind; el: HTMLElement }[] = [];

  constructor(onClose: () => void) {
    this.root.hidden = true;
    this.sheet.setAttribute('role', 'dialog');
    const paper = node('div', 'bm-paper');
    const head = node('header', 'bm-head');
    head.append(node('span', 'bm-eyebrow', 'Bản đồ'), this.title);
    this.canvas.setAttribute('role', 'img');
    this.frame.append(this.canvas);
    const legend = (): HTMLDivElement => {
      const l = node('div', 'bm-legend');
      l.setAttribute('aria-label', 'Chú giải');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const [kind, text] of LEGEND) {
        const it = node('span', 'bm-legend-item');
        it.append(legendIcon(kind, dpr), document.createTextNode(text));
        this.legendItems.push({ kind, el: it });
        l.append(it);
      }
      return l;
    };
    paper.append(head, this.frame, legend());
    this.sheet.append(rod(), paper, rod());
    // ngang: cột phải — thẻ tên cảnh, chú giải dọc, nút "Đóng"
    const side = node('aside', 'bm-side');
    const card = node('div', 'bm-card');
    card.append(node('div', 'bm-eyebrow', 'Bản đồ'), this.cardTitle);
    const sideLegend = node('div', 'bm-card bm-card-legend');
    sideLegend.append(legend());
    const closeSide = node('button', 'bm-close bm-close-side');
    closeSide.type = 'button';
    closeSide.append(closeIcon(16), document.createTextNode('Đóng'));
    side.append(card, sideLegend, closeSide);
    const close = node('button', 'bm-close bm-close-bottom');
    close.type = 'button';
    close.append(closeIcon(18), document.createTextNode('Đóng bản đồ'));
    for (const b of [close, closeSide]) b.addEventListener('click', () => onClose());
    // chạm lên bản đồ không đi tới (R-BANDO-5): lớp phủ nuốt mọi chạm
    this.root.append(node('div', 'bm-dim'), this.sheet, side, close);
    document.body.append(this.root);
    window.addEventListener('resize', () => this.open && this.paint(this.lastFrame));
  }

  private lastFrame: BigMapFrame = { x: 0, z: 0, facing: 0, building: null };

  setMap(map: AreaMap): void {
    this.map = map;
    const shown = new Set(legendKinds(map));
    for (const it of this.legendItems) it.el.hidden = !shown.has(it.kind);
    this.title.textContent = map.name;
    this.cardTitle.textContent = map.name;
    this.sheet.setAttribute('aria-label', `Bản đồ ${map.name}`);
    this.canvas.setAttribute('aria-label', `Bản đồ ${map.name}`);
  }

  get isOpen(): boolean {
    return this.open;
  }

  show(on: boolean, f?: BigMapFrame): void {
    this.open = on;
    this.root.hidden = !on;
    document.body.classList.toggle('area-map', on);
    if (on && f) {
      this.lastFrame = f;
      this.paint(f);
    }
  }

  private paint(f: BigMapFrame): void {
    const map = this.map;
    if (!map) return;
    const box = this.frame.getBoundingClientRect();
    const fw = Math.max(1, box.width);
    const fh = Math.max(1, box.height);
    // vừa khung, đệm 6 m, căn giữa: khung bản đồ = bounds nới ra cho cùng tỉ lệ với khung
    const b = map.bounds;
    const bw = b.maxX - b.minX + FIT_PAD * 2;
    const bh = b.maxZ - b.minZ + FIT_PAD * 2;
    const scale = Math.min(fw / bw, fh / bh);
    const cx = (b.minX + b.maxX) / 2;
    const cz = (b.minZ + b.maxZ) / 2;
    const view: AreaMap = {
      ...map,
      bounds: { minX: cx - fw / scale / 2, maxX: cx + fw / scale / 2, minZ: cz - fh / scale / 2, maxZ: cz + fh / scale / 2 },
    };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    paintAreaMap(this.canvas, view, { scale, dpr, big: true, here: f.building });
    const c = this.canvas.getContext('2d');
    if (!c) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const at = (x: number, z: number): { x: number; y: number } => toMap(view.bounds, scale, x, z);
    // biểu tượng
    const blocks: Box[] = [];
    for (const i of map.icons) {
      if (i.kind === 'son-mon') continue;
      const p = at(i.x, i.z);
      drawMapIcon(c, i.kind, p.x, p.y, ICON);
      blocks.push({ x: p.x, y: p.y, w: ICON + 2, h: ICON + 2 });
    }
    const me = at(f.x, f.z);
    this.paintLabels(c, map, view, scale, fh, blocks);
    drawMe(c, me.x, me.y, bigArrow(f.facing), 1.15, true);
    this.compass(c, fw);
  }

  private paintLabels(c: CanvasRenderingContext2D, map: AreaMap, view: AreaMap, scale: number, fh: number, blocks: Box[]): void {
    const at = (x: number, z: number): { x: number; y: number } => toMap(view.bounds, scale, x, z);
    const font = (l: MapLabel): string => {
      if (l.kind === 'khu') return `700 ${fh < 400 ? 10 : 12}px "Be Vietnam Pro", system-ui, sans-serif`;
      if (l.kind === 'cong') return '700 11px "Be Vietnam Pro", system-ui, sans-serif';
      if (l.kind === 'nha') return '500 11px "Be Vietnam Pro", system-ui, sans-serif';
      return '500 10px "Be Vietnam Pro", system-ui, sans-serif';
    };
    const areaRect = (l: MapLabel): Extract<MapShape, { kind: 'khu' }> | undefined =>
      map.shapes.find((s): s is Extract<MapShape, { kind: 'khu' }> => s.kind === 'khu' && s.index === l.area);
    const items = map.labels.map((l) => {
      c.font = font(l);
      c.letterSpacing = l.kind === 'khu' ? '0.5px' : '0px';
      const text = labelText(l);
      const w = c.measureText(text).width + 4;
      const h = l.kind === 'khu' ? 14 : 13;
      const p = at(l.x, l.z);
      let spots: { x: number; y: number }[];
      const r = l.kind === 'khu' ? areaRect(l) : undefined;
      if (r) {
        const top = at(r.x, r.z - r.d / 2).y;
        const bottom = at(r.x, r.z + r.d / 2).y;
        // sát mép trên + 15, giữa, sát mép dưới − 6 (đường chân chữ) → tâm hộp
        spots = [top + 15, p.y + 4, bottom - 6].map((base) => ({ x: p.x, y: base - h / 2 + 2 }));
      } else if (l.kind === 'nha') spots = [{ x: p.x, y: p.y }];
      else spots = [{ x: p.x, y: p.y + 24 - h / 2 + 2 }]; // dưới biểu tượng
      return { item: { l, text }, priority: PRIORITY[l.kind], w, h, spots, keep: l.kind === 'khu' };
    });
    for (const { item, x, y } of placeLabels(items, blocks)) {
      const l = item.l;
      c.font = font(l);
      c.letterSpacing = l.kind === 'khu' ? '0.5px' : '0px';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.lineJoin = 'round';
      c.lineWidth = 3.5;
      c.strokeStyle = MAP_PAPER;
      c.strokeText(item.text, x, y);
      c.fillStyle = l.kind === 'cong' ? '#2b5446' : l.kind === 'cho' ? '#5e6a70' : '#24323a';
      c.fillText(item.text, x, y);
    }
    c.letterSpacing = '0px';
  }

  /** La bàn tròn r 17 góc trên phải, kim son chỉ bắc, chữ "B". */
  private compass(c: CanvasRenderingContext2D, fw: number): void {
    c.save();
    c.translate(fw - 26, 34);
    c.beginPath();
    c.arc(0, 0, 17, 0, Math.PI * 2);
    c.fillStyle = '#f7f1e4';
    c.fill();
    c.strokeStyle = 'rgba(58,48,36,.6)';
    c.lineWidth = 1.2;
    c.stroke();
    c.fillStyle = '#a8322a';
    c.fill(new Path2D('M0 -13 L4 0 L0 -2 L-4 0 Z'));
    c.fillStyle = 'rgba(58,48,36,.6)';
    c.fill(new Path2D('M0 13 L4 0 L0 2 L-4 0 Z'));
    c.font = '700 12px "Be Vietnam Pro", system-ui, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'alphabetic';
    c.lineWidth = 3;
    c.strokeStyle = MAP_PAPER;
    c.strokeText('B', 0, -19);
    c.fillStyle = '#24323a';
    c.fillText('B', 0, -19);
    c.restore();
  }
}
