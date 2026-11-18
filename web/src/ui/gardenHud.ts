/**
 * HUD nổi Vườn rau (thiết kế 2026-11-15.29 `VuonRau-*` + 2026-11-16.4 `VuonMole-*`): nút "Bán" ở thùng thu mua (kiểu nút
 * "Hướng dẫn": viên `jade` 46 + mũi nhọn), nhãn luống đang lớn khi vòng đóng (kính sương + vạch 96 × 3), hàng dấu trên luống
 * (≤ 3 đĩa trắng — sâu · cỏ · khô, bón được, chín — thấy ≤ 25 m), tấm báo `slate` cạnh bản đồ nhỏ (3 s, nối nhau, không chặn
 * bấm). Luống làm qua vòng công cụ (`gardenRing.ts`) — không còn nút nổi Gieo / Tưới / Thu / Mở ô. DOM dựng bằng
 * `createElement`; chọn việc ở `zones/vuonHud.ts`, ghép ở `homeGarden.ts`. Bảng kho / mở ô ở `gardenPanel.ts`.
 */
import * as THREE from 'three';
import './garden.css';
import { growingLabel, SELL_TEXT, type GardenSpot, type GardenToast } from '../zones/vuonHud';
import type { PlotBadge } from '../zones/vuonVongHud';
import type { CropId } from '../zones/vuon';
import { DROP, ICON_TICK, SPARKLE } from './cropArt';
import { itemPicture } from './nongArt';
import { STROKE, svgIcon } from './decorIcons';
import { hinhImg } from './hinh';
import { BUG, FERT_BAG, MARK_VIEW, WEED } from './vuonIcons';

/** Tấm báo hiện 3 s rồi tấm kế. */
const TOAST_MS = 3000;

function h<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

/** Hàng dấu trong cảnh ở luống (toạ độ cảnh đỉnh luống). */
export interface MarkAt {
  x: number;
  y: number;
  z: number;
  badges: readonly PlotBadge[];
}

/** Hình trong đĩa dấu (22; giọt / sao theo khung riêng). */
function badgeArt(b: PlotBadge): SVGElement {
  if (b === 'kho') return svgIcon(DROP, 17, '-8 -11 16 21');
  if (b === 'chin') return svgIcon(SPARKLE, 20, '-10 -10 20 20');
  if (b === 'sau') return svgIcon(BUG, 18, MARK_VIEW.sau);
  if (b === 'co') return svgIcon(WEED, 18, MARK_VIEW.co);
  return svgIcon(FERT_BAG, 18, MARK_VIEW.bon);
}

export class GardenHud {
  private readonly btnWrap = h('div');
  private readonly btn = h('button');
  private readonly label = h('div');
  private readonly labelText = h('span');
  private readonly labelBar = h('i');
  private readonly marksLayer = h('div');
  private readonly marks: HTMLElement[] = [];
  private readonly toastEl = h('div');
  private readonly at = new THREE.Vector3();
  private readonly v = new THREE.Vector3();
  private shown = false;
  private readonly queue: GardenToast[] = [];
  private toastTimer = 0;

  constructor(plotCount: number, onSell: () => void) {
    this.btnWrap.id = 'gardenBtn';
    this.btnWrap.hidden = true;
    this.btn.type = 'button';
    this.btn.addEventListener('click', () => onSell());
    const tip = h('div', 'tip');
    tip.setAttribute('aria-hidden', 'true');
    this.btnWrap.append(this.btn, tip);

    this.label.id = 'gardenLabel';
    this.label.hidden = true;
    this.label.setAttribute('role', 'status');
    const bar = h('span', 'bar');
    bar.append(this.labelBar);
    this.label.append(this.labelText, bar);

    this.marksLayer.id = 'gardenMarks';
    this.marksLayer.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < plotCount; i++) {
      const m = h('span', 'gm');
      m.hidden = true;
      m.style.setProperty('--phase', `${-((i * 0.37) % 1) * 2.4}s`); // lấp lánh lệch pha từng luống
      this.marks.push(m);
      this.marksLayer.append(m);
    }

    this.toastEl.id = 'gardenToast';
    this.toastEl.setAttribute('role', 'status');
    this.toastEl.hidden = true;
    document.body.append(this.marksLayer, this.btnWrap, this.label, this.toastEl);
  }

  /** Việc ở chỗ đứng (`null` = ẩn nút + nhãn) neo ở [anchor] (toạ độ cảnh). */
  set(spot: GardenSpot | null, anchor: THREE.Vector3 | null): void {
    const bin = spot?.kind === 'bin';
    this.btnWrap.hidden = !bin;
    this.label.hidden = spot?.kind !== 'grow';
    if (anchor) this.at.copy(anchor);
    if (spot?.kind === 'grow') {
      const t = growingLabel(spot);
      if (this.labelText.dataset.t !== t) {
        this.labelText.dataset.t = t;
        this.labelText.replaceChildren(h('b', '', spot.crop.name), ` · còn ${spot.text}`);
      }
      this.labelBar.style.width = `${Math.round(spot.frac * 100)}%`;
    }
    if (!bin || this.shown) return;
    this.shown = true;
    this.btn.replaceChildren(hinhImg('ban', 28), SELL_TEXT); // hình minh hoạ 28 (2026-11-16.3)
    this.btn.setAttribute('aria-label', 'Bán nông sản');
  }

  /** Mỗi khung: nút / nhãn bám điểm neo; điểm ra sau camera thì giấu. */
  follow(camera: THREE.Camera): void {
    const el = !this.btnWrap.hidden ? this.btnWrap : !this.label.hidden ? this.label : null;
    if (!el) return;
    const p = this.v.copy(this.at).project(camera);
    el.style.visibility = p.z > 1 ? 'hidden' : 'visible';
    const w = window.innerWidth;
    const hh = window.innerHeight;
    el.style.left = `${Math.min(w - 90, Math.max(90, ((p.x + 1) / 2) * w))}px`;
    el.style.top = `${Math.min(hh - 140, Math.max(120, ((1 - p.y) / 2) * hh))}px`;
  }

  /** Hàng dấu luống theo camera; [show] = false → giấu hết (màn phủ cảnh). */
  marksFollow(camera: THREE.Camera, marks: readonly (MarkAt | null)[], show: boolean): void {
    this.marksLayer.hidden = !show;
    if (!show) return;
    const w = window.innerWidth;
    const hh = window.innerHeight;
    this.marks.forEach((el, i) => {
      const m = marks[i];
      if (!m || !m.badges.length) {
        el.hidden = true;
        return;
      }
      const p = this.v.set(m.x, m.y, m.z).project(camera);
      const off = p.z > 1 || Math.abs(p.x) > 1.1 || Math.abs(p.y) > 1.1;
      el.hidden = off;
      if (off) return;
      const k = m.badges.join(',');
      if (el.dataset.k !== k) {
        el.dataset.k = k;
        el.replaceChildren(
          ...m.badges.map((b) => {
            const d = h('span', `gm-d ${b}`);
            d.append(badgeArt(b));
            return d;
          }),
        );
      }
      // hàng dấu căn giữa trên luống
      el.style.transform = `translate(${((p.x + 1) / 2) * w}px, ${((1 - p.y) / 2) * hh}px) translateX(-50%)`;
    });
  }

  /** Thêm tấm báo vào hàng (3 s mỗi tấm, nối nhau). */
  toast(t: GardenToast): void {
    this.queue.push(t);
    if (this.toastEl.hidden) this.nextToast();
  }

  private nextToast(): void {
    const t = this.queue.shift();
    if (!t) {
      this.toastEl.hidden = true;
      return;
    }
    const pic = h('span', `pic ${t.kind}`);
    if (t.kind === 'chin') pic.append(svgIcon(SPARKLE, 30, '-10 -10 20 20'));
    else if (t.kind === 'thu' && (t.item || t.crop)) pic.append(itemPicture((t.item ?? t.crop) as CropId, 30));
    else pic.append(svgIcon(ICON_TICK, 16, undefined, { ...STROKE, 'stroke-width': '2.6' }));
    const txt = h('span', 'txt');
    txt.append(h('b', '', t.title));
    if (t.sub) txt.append(h('span', 'sub', t.sub));
    this.toastEl.replaceChildren(pic, txt);
    this.toastEl.hidden = false;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.nextToast(), TOAST_MS);
  }
}
