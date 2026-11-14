/**
 * Bản đồ nhỏ tròn góc trên trái (R-BANDO-1, 3, 4; thiết kế 2026-11-14.20 `BanDoVung-HUD-*`, `BanDoVung-nho-trang-thai`):
 * tấm mặt bằng vẽ sẵn (`areaMapPaint`) chỉ dịch + xoay bằng CSS transform; lớp trên (biểu tượng đứng thẳng, dấu mép, mũi
 * tên "mình") vẽ lại khi mình dời > 5 cm / xoay > 0,5°. Dấu bắc trên vành chạy theo góc xoay. Chạm cả vòng → bản đồ lớn
 * (nút DOM nằm trên canvas cảnh → không thành joystick — R-DIEU-1). Dấu bắc ghi "B" (R-BANDO-3, R-HUD-4 — không 北).
 */
import type { AreaMap } from '../zones/areaMap';
import { EDGE_KINDS, edgeMarks, MINI_RADIUS, EDGE_MARGIN, miniArrow, miniPoint, miniRotation, toMap } from '../zones/areaMapView';
import { drawEdgeMark, drawMapIcon, drawMe } from './areaMapIcons';
import { paintAreaMap } from './areaMapPaint';
import './areaMap.css';

/** Lần mở app đầu tiên có gợi ý "Chạm để mở bản đồ" (thiết kế: 2 lần đầu, 4 s). */
const HINT_TIMES = 2;
const HINT_SECONDS = 4;
const HINT_KEY = 'hocxa.miniMapHint';
const MOVE_EPS = 0.05;
const TURN_EPS = (0.5 * Math.PI) / 180;

function node<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** Số lần gợi ý đã hiện (lưu trong trình duyệt; lỗi / chặn lưu → coi như lần đầu, không ghi). */
function hintCount(): number {
  try {
    return Number(localStorage.getItem(HINT_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

export interface MiniFrame {
  x: number;
  z: number;
  /** hướng nhân vật quay mặt (`facing.rotation.y`) */
  facing: number;
  /** hướng camera nhìn (`orbit.yaw + π`) */
  view: number;
  /** nhà đang đứng trong + tầng (R-BANDO-4) */
  building: string | null;
  floor: number;
}

export class MiniMap {
  readonly root = node('div', 'mini-map');
  private readonly btn = node('button', 'mm-btn');
  private readonly base = node('canvas', 'mm-base');
  private readonly over = node('canvas', 'mm-over');
  private readonly north = node('span', 'mm-north', 'B');
  private readonly floorTag = node('span', 'mm-floor', 'Tầng 2');
  private readonly hint = node('div', 'mm-hint');
  private map: AreaMap | null = null;
  private here: string | null = null;
  private last = { x: NaN, z: NaN, facing: NaN, view: NaN, size: 0 };
  private shown = false;
  private hintLeft = 0;
  private hintDone = false;

  constructor(onOpen: () => void) {
    this.btn.type = 'button';
    this.btn.setAttribute('aria-label', 'Bản đồ — chạm để mở');
    const clip = node('div', 'mm-clip');
    clip.append(this.base, this.over);
    this.btn.append(clip, node('span', 'mm-ring'));
    this.north.setAttribute('aria-hidden', 'true');
    this.floorTag.hidden = true;
    this.root.append(this.btn, this.north, this.floorTag);
    this.hint.setAttribute('role', 'status');
    const chev = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chev.setAttribute('viewBox', '0 0 24 24');
    chev.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M15 6l-6 6 6 6');
    chev.append(p);
    this.hint.append(chev, document.createTextNode('Chạm để mở bản đồ'));
    this.hint.hidden = true;
    this.root.hidden = true;
    this.btn.addEventListener('click', () => onOpen());
    document.body.append(this.root, this.hint);
  }

  /** Vào cảnh: vẽ tấm mặt bằng ở tỉ lệ bản đồ nhỏ. */
  setMap(map: AreaMap): void {
    this.map = map;
    this.repaint();
  }

  /** Vòng trên màn (px) — cho kiểm chạm / chụp. */
  get circle(): { cx: number; cy: number; r: number } {
    const r = this.btn.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, r: r.width / 2 };
  }

  /** Ẩn / hiện (R-BANDO-1); hiện lại mờ vào 0,2 s (CSS). */
  setShown(on: boolean): void {
    if (on === this.shown) return;
    this.shown = on;
    this.root.hidden = !on;
    if (!on) this.hint.hidden = true;
  }

  update(dt: number, f: MiniFrame): void {
    if (!this.map || !this.shown) return;
    this.tickHint(dt);
    const size = this.btn.clientWidth || 104;
    if (f.building !== this.here) {
      this.here = f.building;
      this.repaint();
      this.last.size = 0;
    }
    this.floorTag.hidden = f.floor < 2;
    const l = this.last;
    const moved = Math.hypot(f.x - l.x, f.z - l.z) > MOVE_EPS || Number.isNaN(l.x);
    const turned = Math.abs(f.view - l.view) > TURN_EPS || Math.abs(f.facing - l.facing) > TURN_EPS;
    if (!moved && !turned && size === l.size) return;
    if (size !== l.size) this.repaint(size);
    this.last = { x: f.x, z: f.z, facing: f.facing, view: f.view, size };
    this.place(f, size);
  }

  private scale(size: number): number {
    return size / 2 / MINI_RADIUS;
  }

  private repaint(size = this.btn.clientWidth || 104): void {
    if (!this.map) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    paintAreaMap(this.base, this.map, { scale: this.scale(size), dpr, big: false, here: this.here });
    this.over.width = this.over.height = Math.round(size * dpr);
  }

  private place(f: MiniFrame, size: number): void {
    const map = this.map;
    if (!map) return;
    const s = this.scale(size);
    const half = size / 2;
    const rot = miniRotation(f.view);
    const p = toMap(map.bounds, s, f.x, f.z);
    this.base.style.transform = `translate(${half}px,${half}px) rotate(${rot}rad) translate(${-p.x}px,${-p.y}px)`;
    // dấu bắc trên vành, theo góc xoay
    const rim = half;
    this.north.style.transform = `translate(${half + rim * Math.sin(rot) - 10}px,${half - rim * Math.cos(rot) - 10}px)`;
    const c = this.over.getContext('2d');
    if (!c) return;
    const dpr = this.over.width / size;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, size, size);
    const me = { x: f.x, z: f.z };
    const inner = MINI_RADIUS - EDGE_MARGIN;
    for (const i of map.icons) {
      if (i.kind === 'son-mon') continue;
      const d = Math.hypot(i.x - f.x, i.z - f.z);
      if (d > inner) continue;
      const q = miniPoint(me, f.view, i.x, i.z);
      drawMapIcon(c, i.kind, half + q.x * half, half + q.y * half, 15);
    }
    for (const m of edgeMarks(map, me, f.view, inner)) {
      if (!EDGE_KINDS.includes(m.kind)) continue;
      const r = half - 9;
      drawEdgeMark(c, m.kind, half + r * Math.sin(m.angle), half - r * Math.cos(m.angle), m.angle);
    }
    drawMe(c, half, half, miniArrow(f.facing, f.view), 0.9);
  }

  private tickHint(dt: number): void {
    if (this.hintDone) {
      if (this.hintLeft > 0 && (this.hintLeft -= dt) <= 0) this.hint.hidden = true;
      return;
    }
    this.hintDone = true;
    const n = hintCount();
    if (n >= HINT_TIMES) return;
    try {
      localStorage.setItem(HINT_KEY, String(n + 1));
    } catch {
      /* không lưu được → lần sau vẫn gợi ý */
    }
    this.hintLeft = HINT_SECONDS;
    this.hint.hidden = false;
  }

  /** Chạm mở bản đồ lớn → tắt gợi ý ngay. */
  dismissHint(): void {
    this.hintLeft = 0;
    this.hint.hidden = true;
  }
}
