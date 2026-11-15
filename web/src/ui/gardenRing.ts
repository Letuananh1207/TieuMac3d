/**
 * Vòng công cụ quanh luống (thiết kế 2026-11-16.4 "Vườn rau kiểu Mole" — artboard `VuonMole-{trang-thai,trong-doc,luoi-hat-*,
 * hoang-doc,chin-doc,ngang,may}`; R-VUON-2/3): ô giữa Tay 58, 5 ô quanh 48 bán kính 64 trên vành kính sương, neo theo tâm
 * luống mỗi khung (dịch tránh HUD — `zones/vuonVongHud.ts`, mũi chỉ khi lệch xa), viền vàng quanh mặt luống, ô sáng / mờ /
 * nên làm / có số, tên ô khi giữ 0,4 s (máy: rê chuột), nhãn phím 1–6 + viên "1–6 chọn · Esc đóng" (máy), viên lý do khi
 * chạm ô mờ (1,6 s), lưới hạt (dọc: trên vòng; ngang: bên phải). Luật ô ở `zones/vuonVong.ts`; ghép ở `homeGarden.ts`.
 * DOM dựng bằng createElement (quy tắc 6).
 */
import './gardenRing.css';
import type { CropId } from '../zones/vuon';
import type { SeedCard } from '../zones/vuonHud';
import type { RingSlot, RingView, SlotId } from '../zones/vuonVong';
import { ringPlace, RING_SIZES, slotXY, suggestSlot, type Rect } from '../zones/vuonVongHud';
import { formatCoins } from '../zones/wallet';
import { h } from './chatText';
import { cropPicture } from './cropArt';
import { COIN, svgIcon } from './decorIcons';
import { hinhImg } from './hinh';
import { BUG_NET, FERT_BAG, HAND, WEED } from './vuonIcons';

/** Viên lý do hiện 1,6 s; giữ 0,4 s → tên ô / thẻ hạt; vòng thu về sau khi chọn 0,24 s. */
const WHY_MS = 1600;
const HOLD_MS = 400;
const OUT_MS = 240;
const NS = 'http://www.w3.org/2000/svg';

export interface GardenRingHandlers {
  slot(id: SlotId): void;
  seed(crop: CropId): void;
  /** nút về của lưới hạt */
  back(): void;
}

/** Một khung vẽ vòng: `null` view = đóng. */
export interface RingFrame {
  view: (RingView & { grid: readonly SeedCard[] | null }) | null;
  /** điểm màn tâm mặt luống; `null` = ra sau camera */
  anchor: { x: number; y: number } | null;
  /** 4 góc mặt luống trên màn (viền vàng) */
  corners: readonly { x: number; y: number }[] | null;
  unlockPrice: number | null;
  /** máy tính, trong rào, vòng đóng → viên nhắc "Click luống · E …" */
  hint: boolean;
}

/** Hình của ô (hình minh hoạ đợt 2 hoặc hình giữ chỗ). */
function slotArt(id: SlotId, size: number): Element {
  if (id === 'hat') return hinhImg('gieo', size);
  if (id === 'binh') return hinhImg('tuoi', size);
  if (id === 'mo') return hinhImg('mo-o', size);
  const art = { tay: HAND, sau: BUG_NET, co: WEED, phan: FERT_BAG }[id];
  return svgIcon(art, size, '0 0 48 48');
}

export class GardenRing {
  private readonly root = h('div');
  private readonly svg = document.createElementNS(NS, 'svg');
  private readonly glow = document.createElementNS(NS, 'polygon');
  private readonly edge = document.createElementNS(NS, 'polygon');
  private readonly line = document.createElementNS(NS, 'line');
  private readonly head = document.createElementNS(NS, 'polygon');
  private readonly ring = h('div', 'gr-ring');
  private readonly band = h('div', 'gr-band');
  private readonly keys = h('div', 'gr-keys');
  private readonly grid = h('div', 'gr-grid');
  private readonly why = h('div');
  private readonly hintEl = h('div');
  private readonly probe = h('div');
  private face = '';
  private gridFace = '';
  private whyTimer = 0;
  /** viên lý do đang hiện là của một ô (đóng vòng → ẩn theo) */
  private whyOnSlot = false;
  private outTimer = 0;
  private picked = false;
  private last: { x: number; y: number } | null = null;
  private avoid: Rect[] = [];
  private area: Rect = { left: 0, top: 0, right: 0, bottom: 0 };
  private measureIn = 0;

  constructor(private readonly on: GardenRingHandlers) {
    this.root.id = 'gardenRing';
    this.root.hidden = true;
    this.svg.id = 'gardenRingSvg';
    this.svg.setAttribute('aria-hidden', 'true');
    this.glow.setAttribute('class', 'gr-glow');
    this.edge.setAttribute('class', 'gr-edge');
    this.line.setAttribute('class', 'gr-line');
    this.head.setAttribute('class', 'gr-head');
    this.svg.append(this.glow, this.edge, this.line, this.head);
    this.band.setAttribute('aria-hidden', 'true');
    this.ring.setAttribute('role', 'toolbar');
    this.ring.setAttribute('aria-label', 'Vòng công cụ');
    this.keys.setAttribute('aria-hidden', 'true');
    this.keys.append('1–6 chọn · ', h('kbd', '', 'Esc'), ' đóng'); // toolRingKeys
    this.grid.setAttribute('role', 'dialog');
    this.grid.setAttribute('aria-label', 'Chọn hạt để gieo');
    this.grid.hidden = true;
    this.root.append(this.band, this.ring, this.keys, this.grid);
    this.why.id = 'gardenWhy';
    this.why.setAttribute('role', 'status');
    this.why.hidden = true;
    this.hintEl.id = 'gardenRingHint';
    this.hintEl.hidden = true;
    this.hintEl.append('Click luống · ', h('kbd', '', 'E'), ' mở vòng ở luống gần nhất'); // toolRingOpenKey
    this.probe.id = 'gardenSafe';
    this.probe.setAttribute('aria-hidden', 'true');
    document.body.append(this.probe, this.svg, this.root, this.why, this.hintEl);
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  /** Mỗi khung: vẽ / dời vòng theo luống. */
  render(f: RingFrame, dt: number): void {
    this.hintEl.hidden = !f.hint;
    const v = f.view;
    if (!v || !f.anchor) {
      this.hide(!!v); // luống ra sau camera → ẩn ngay; vòng vừa đóng → thu về nếu vừa chọn
      return;
    }
    window.clearTimeout(this.outTimer);
    const opening = this.root.hidden || this.root.classList.contains('gr-out');
    this.root.classList.remove('gr-out');
    if (opening) {
      this.picked = false;
      this.measureIn = 0;
      this.face = '';
    }
    this.measureIn -= dt;
    if (this.measureIn <= 0) {
      this.measure();
      this.measureIn = 0.5;
    }
    this.root.hidden = false;
    this.svg.style.display = '';
    this.draw(v, f.unlockPrice, opening);
    const r = v.wild ? RING_SIZES.outerWild : RING_SIZES.outer;
    const at = ringPlace(f.anchor, r, this.area, this.avoid);
    this.last = at;
    this.root.style.transform = `translate(${at.x}px, ${at.y}px)`;
    this.drawPlot(f, at, r);
    this.drawGrid(v.grid, at);
  }

  /** Viên lý do (ô mờ — R-VUON-2) trên ô vừa chạm, kẹp trong màn, 1,6 s, không bay. */
  reason(text: string, slot: SlotId | null): void {
    const c = this.last;
    const s = slot ? this.ring.querySelector<HTMLElement>(`[data-slot="${slot}"]`) : null;
    let x = c?.x ?? window.innerWidth / 2;
    let y = (c?.y ?? window.innerHeight / 2) - RING_SIZES.outer;
    if (s && c) {
      const b = s.getBoundingClientRect();
      x = b.left + b.width / 2;
      y = b.top;
    }
    this.why.textContent = text;
    this.why.hidden = false;
    this.whyOnSlot = !!slot;
    const w = this.why.offsetWidth;
    const left = Math.min(Math.max(x - w / 2, this.area.left), this.area.right - w);
    this.why.style.transform = `translate(${Math.round(left)}px, ${Math.round(y - 36)}px)`;
    window.clearTimeout(this.whyTimer);
    this.whyTimer = window.setTimeout(() => (this.why.hidden = true), WHY_MS);
  }

  /** Đóng: vừa chọn ô sáng → thu về tâm 0,12 s (sau nảy 0,12 s); không thì ẩn ngay ([now] = luôn ẩn ngay). */
  private hide(now: boolean): void {
    if (this.root.hidden) return;
    if (this.whyOnSlot) this.why.hidden = true;
    this.svg.style.display = 'none';
    this.grid.hidden = true;
    this.gridFace = '';
    if (this.picked && !now && !this.root.classList.contains('gr-out')) {
      this.root.classList.add('gr-out');
      this.outTimer = window.setTimeout(() => this.reset(), OUT_MS);
      return;
    }
    if (!this.root.classList.contains('gr-out')) this.reset();
  }

  private reset(): void {
    this.root.hidden = true;
    this.root.classList.remove('gr-out', 'gr-dim');
    this.face = '';
    this.picked = false;
  }

  /** Safe area (lề dọc 16, ngang 55 — đặc tả "Đặt vòng") + các phần HUD phải tránh. */
  private measure(): void {
    const s = this.probe.getBoundingClientRect();
    const wide = window.innerWidth > window.innerHeight;
    const mx = wide ? 55 : 16;
    this.area = { left: s.left + mx, top: s.top + 16, right: s.right - mx, bottom: s.bottom - 16 };
    const sel = ['.mini-map', '#wallet', '#toolbar', '#joyGhost', '#actions .act', '#readBook', '#chatBtn', '#decorBtn'];
    this.avoid = [];
    for (const q of sel) {
      document.querySelectorAll<HTMLElement>(q).forEach((e) => {
        if (e.hidden || e.offsetParent === null && getComputedStyle(e).position !== 'fixed') return;
        const b = e.getBoundingClientRect();
        if (b.width > 0 && b.height > 0) this.avoid.push({ left: b.left, top: b.top, right: b.right, bottom: b.bottom });
      });
    }
  }

  /** Dựng ô (chỉ khi đổi). */
  private draw(v: RingView, unlockPrice: number | null, opening: boolean): void {
    const best = suggestSlot(v);
    const face = `${v.plot}|${v.slots.map((s) => `${s.id}${+s.lit}${s.count ?? ''}`).join(',')}|${best}|${unlockPrice}`;
    if (face === this.face) return;
    this.face = face;
    this.root.classList.toggle('gr-wild', v.wild);
    this.ring.replaceChildren(...v.slots.map((s) => this.slot(s, s.id === best, unlockPrice)));
    if (opening) {
      this.root.classList.remove('gr-bloom');
      void this.root.offsetWidth; // chạy lại hiệu ứng bung
      this.root.classList.add('gr-bloom');
    }
  }

  private slot(s: RingSlot, best: boolean, unlockPrice: number | null): HTMLElement {
    const mid = s.at === null;
    const size = mid ? RING_SIZES.center : RING_SIZES.slot;
    const { x, y } = slotXY(s.at);
    const b = h('button', `gr-slot${mid ? ' mid' : ''}${s.lit ? '' : ' off'}${best ? ' best' : ''}`);
    b.type = 'button';
    b.dataset.slot = s.id;
    b.style.setProperty('--dx', `${x}px`);
    b.style.setProperty('--dy', `${y}px`);
    b.style.left = `${x - size / 2}px`;
    b.style.top = `${y - size / 2}px`;
    const label = s.id === 'mo' && unlockPrice !== null ? `Mở ô · ${formatCoins(unlockPrice)}` : s.name; // toolUnlockPrice
    b.setAttribute('aria-label', s.lit ? label : `${label} — ${s.why ?? ''}`);
    b.setAttribute('aria-disabled', String(!s.lit));
    const art = h('span', 'gr-art');
    art.append(slotArt(s.id, Math.round(size * 0.86)));
    b.append(art);
    if (s.count !== null) b.append(h('span', `gr-n${s.count > 0 ? '' : ' zero'}`, String(s.count)));
    if (s.id !== 'mo') b.append(h('span', 'gr-key', String(s.key)));
    const name = h('span', s.id === 'mo' ? 'gr-name price' : 'gr-name');
    if (s.id === 'mo' && unlockPrice !== null) name.append('Mở ô · ', svgIcon(COIN, 13, '0 0 100 100'), formatCoins(unlockPrice));
    else name.textContent = s.name;
    b.append(name);
    this.holdName(b);
    b.addEventListener('click', () => {
      if (b.dataset.held === '1') {
        b.dataset.held = '';
        return;
      }
      if (s.lit && s.id !== 'hat') {
        this.picked = true;
        b.classList.add('pop');
      }
      this.on.slot(s.id);
    });
    return b;
  }

  /** Giữ 0,4 s → hiện tên ô (điện thoại); nhả không chọn. */
  private holdName(b: HTMLElement): void {
    let t = 0;
    b.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      t = window.setTimeout(() => {
        b.classList.add('named');
        b.dataset.held = '1';
      }, HOLD_MS);
    });
    const up = (): void => {
      window.clearTimeout(t);
      b.classList.remove('named');
    };
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('pointerleave', up);
  }

  /** Viền vàng quanh mặt luống + mũi chỉ nét đứt khi vòng lệch xa luống. */
  private drawPlot(f: RingFrame, at: { x: number; y: number; pointer: boolean }, r: number): void {
    const pts = f.corners?.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') ?? '';
    this.glow.setAttribute('points', pts);
    this.edge.setAttribute('points', pts);
    const a = f.anchor;
    const show = at.pointer && !!a;
    this.line.style.display = show ? '' : 'none';
    this.head.style.display = show ? '' : 'none';
    if (!show || !a) return;
    const dx = a.x - at.x;
    const dy = a.y - at.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const sx = at.x + ux * (r - 6);
    const sy = at.y + uy * (r - 6);
    const ex = a.x - ux * 12;
    const ey = a.y - uy * 12;
    this.line.setAttribute('x1', sx.toFixed(1));
    this.line.setAttribute('y1', sy.toFixed(1));
    this.line.setAttribute('x2', ex.toFixed(1));
    this.line.setAttribute('y2', ey.toFixed(1));
    // đầu tam giác 10 × 12 trỏ về luống
    const px = -uy * 5;
    const py = ux * 5;
    this.head.setAttribute('points', `${(a.x).toFixed(1)},${(a.y).toFixed(1)} ${(ex + px).toFixed(1)},${(ey + py).toFixed(1)} ${(ex - px).toFixed(1)},${(ey - py).toFixed(1)}`);
  }

  /** Lưới hạt (R-VUON-3): dọc trên vòng (mũi trỏ ô Hạt giống), ngang bên phải vòng (mũi trỏ trái); vòng sau mờ 50 %. */
  private drawGrid(cards: readonly SeedCard[] | null, at: { x: number; y: number }): void {
    this.root.classList.toggle('gr-dim', !!cards);
    if (!cards) {
      this.grid.hidden = true;
      this.gridFace = '';
      return;
    }
    const face = cards.map((c) => `${c.crop.id}${c.left}`).join(',');
    if (face !== this.gridFace) {
      this.gridFace = face;
      this.buildGrid(cards);
    }
    this.grid.hidden = false;
    const wide = window.innerWidth > window.innerHeight;
    this.grid.classList.toggle('side', wide);
    const w = this.grid.offsetWidth;
    const gh = this.grid.offsetHeight;
    let left: number;
    let top: number;
    if (wide) {
      left = RING_SIZES.radius + 13 + 40;
      top = -gh / 2;
      this.grid.style.setProperty('--tip', `${gh / 2}px`);
    } else {
      const want = -w / 2;
      left = Math.min(Math.max(want, this.area.left - at.x), this.area.right - at.x - w);
      top = -RING_SIZES.radius - RING_SIZES.slot / 2 - 14 - gh;
      this.grid.style.setProperty('--tip', `${-left}px`);
    }
    this.grid.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  }

  private buildGrid(cards: readonly SeedCard[]): void {
    const back = h('button', 'gr-back');
    back.type = 'button';
    back.setAttribute('aria-label', 'Về vòng công cụ');
    back.append(svgIcon([['path', { d: 'M14 6l-6 6 6 6' }]], 16, undefined, { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    back.addEventListener('click', () => this.on.back());
    const top = h('div', 'gr-gridHead');
    top.append(back, h('b', '', 'Chọn hạt để gieo'), h('span', 'gr-gridKeys', `1–${cards.length} chọn · Esc về`)); // gardenPickSeedTitle
    const cells = h('div', 'gr-cells');
    cells.style.setProperty('--cols', String(Math.min(3, cards.length)));
    const card = h('div', 'gr-card');
    card.hidden = true;
    cards.forEach((c, i) => {
      const b = h('button', 'gr-cell');
      b.type = 'button';
      b.setAttribute('aria-label', `Gieo ${c.crop.name}, còn ${c.left} hạt`);
      b.append(cropPicture(c.crop.id, 52), h('span', 'gr-n', String(c.left)), h('span', 'gr-key', String(i + 1)));
      let t = 0;
      let held = false;
      b.addEventListener('pointerdown', () => {
        held = false;
        t = window.setTimeout(() => {
          held = true;
          this.detail(card, c);
        }, HOLD_MS);
      });
      const up = (): void => window.clearTimeout(t);
      b.addEventListener('pointerup', up);
      b.addEventListener('pointerleave', () => {
        up();
        card.hidden = true;
      });
      b.addEventListener('mouseenter', () => this.detail(card, c));
      b.addEventListener('click', () => {
        if (held) {
          held = false;
          card.hidden = true;
          return;
        }
        this.picked = true;
        this.on.seed(c.crop.id);
      });
      cells.append(b);
    });
    this.grid.replaceChildren(top, cells, card, h('span', 'gr-tip'));
  }

  /** Thẻ chi tiết `slate` 176: tên · "Lớn trong {thời gian}" · "bán xu n / cái". */
  private detail(card: HTMLElement, c: SeedCard): void {
    const sell = h('span', 'gr-sell');
    sell.append('bán ', svgIcon(COIN, 12, '0 0 100 100'), ` ${c.crop.sell} / cái`); // gardenSellPrice
    card.replaceChildren(h('b', '', c.crop.name), h('span', '', `Lớn trong ${c.time}`), sell); // gardenSeedGrown
    card.hidden = false;
  }
}
