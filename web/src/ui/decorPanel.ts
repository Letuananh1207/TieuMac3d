/**
 * Bảng danh mục trang trí + tấm báo (thiết kế 2026-11-14.13 `NhaTa-doc-o-*`, `NhaTa-ngang-o`; thẻ vật 2026-11-14.12
 * `TrangTri-the-vat`): đầu (loại ô, dòng phụ, "Gỡ"), lưới 3 cột thẻ vật đang đặt / đã có / khoá, chân bảng; kéo tay nắm
 * xuống → đóng. Không giữ luật — `zones/decorMode.ts` tính thẻ, lớp gốc `homeDecor.ts` xử lý chạm.
 */
import type { DecorSlotKind } from '../zones/decor';
import type { DecorCard } from '../zones/decorMode';
import { COIN, DECOR_PICTURES, ICON_CHECK, ICON_LOCK, ICON_REMOVE, ICON_SLOT, STROKE, svgIcon } from './decorIcons';

/** Kéo tay nắm / đầu bảng xuống quá ngần này (px) → đóng bảng. */
const SWIPE_CLOSE_PX = 60;
/** Tấm báo thẻ khoá hiện 3 s. */
const TOAST_MS = 3000;

function h<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function hanSpan(text: string): HTMLSpanElement {
  const s = h('span', 'han', text);
  s.lang = 'zh';
  return s;
}

export interface PanelView {
  kind: DecorSlotKind;
  name: string;
  han: string;
  sub: string;
  canRemove: boolean;
  cards: readonly DecorCard[];
}

export interface DecorPanelHandlers {
  card(itemId: string): void;
  remove(): void;
  close(): void;
}

export class DecorPanel {
  private readonly root = h('section');
  private readonly kind = h('span', 'dk-kind');
  private readonly title = h('h2');
  private readonly sub = h('span', 'dk-sub');
  private readonly removeBtn = h('button', 'dk-remove');
  private readonly grid = h('ul', 'dk-grid');
  private readonly toastEl = h('div');
  private toastTimer = 0;

  constructor(private readonly on: DecorPanelHandlers) {
    this.root.id = 'decorPanel';
    this.root.hidden = true;
    const grip = h('div', 'grip');
    grip.setAttribute('aria-hidden', 'true');
    const head = h('header', 'dk-head');
    const titles = h('div', 'dk-titles');
    titles.append(this.title, this.sub);
    this.removeBtn.type = 'button';
    this.removeBtn.append(svgIcon(ICON_REMOVE, 15, undefined, { ...STROKE, 'stroke-width': '2.4' }), 'Gỡ');
    this.removeBtn.addEventListener('click', () => on.remove());
    head.append(this.kind, titles, this.removeBtn);
    const foot = h('div', 'dk-foot');
    foot.append(svgIcon(COIN, 14, '0 0 100 100'), 'Vật có khoá: mua ở Tạp hoá phố chợ · mua một lần, đặt được nhiều ô');
    this.root.append(grip, head, this.grid, foot);
    this.swipeToClose(grip, titles, this.kind);
    this.toastEl.id = 'decorToast';
    this.toastEl.setAttribute('role', 'status');
    this.toastEl.hidden = true;
    document.body.append(this.root, this.toastEl);
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  /** Mở / vẽ lại bảng cho ô đang chọn. */
  show(v: PanelView): void {
    this.root.setAttribute('aria-label', `Danh mục cho ${v.name.toLowerCase()}`);
    this.kind.replaceChildren(svgIcon(ICON_SLOT[v.kind], 20, undefined, { ...STROKE, 'stroke-width': '2' }));
    this.title.replaceChildren(`${v.name} `, hanSpan(v.han));
    this.sub.textContent = v.sub;
    this.removeBtn.hidden = !v.canRemove;
    this.grid.replaceChildren(...v.cards.map((c) => this.card(c)));
    this.root.hidden = false;
    document.body.classList.add('decor-panel');
  }

  close(): void {
    this.root.hidden = true;
    document.body.classList.remove('decor-panel');
  }

  /** Tấm báo `slate` 3 s: "Mua **{vật}** ở Tạp hoá phố chợ — …" (vật in đậm). */
  toast(text: string, bold: string): void {
    const [before, after] = text.split(bold);
    const span = h('span');
    span.append(before ?? '', h('b', '', bold), after ?? '');
    this.toastEl.replaceChildren(svgIcon(COIN, 24, '0 0 100 100'), span);
    this.toastEl.hidden = false;
    clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => (this.toastEl.hidden = true), TOAST_MS);
  }

  private card({ item, state }: DecorCard): HTMLLIElement {
    const btn = h('button', `dk-card ${state}`);
    btn.type = 'button';
    const pic = h('span', 'dk-pic');
    const art = h('span', 'art');
    art.append(svgIcon(DECOR_PICTURES[item.id] ?? [], 50, '0 0 64 64', { fill: 'none' }));
    pic.append(art, hanSpan(item.han));
    const status = h('span', 'dk-state');
    if (state === 'locked') {
      const lock = h('span', 'dk-lock');
      lock.setAttribute('aria-hidden', 'true');
      lock.append(svgIcon(ICON_LOCK, 14, undefined, { ...STROKE, 'stroke-width': '2.6' }));
      pic.append(lock);
      status.append(svgIcon(COIN, 12, '0 0 100 100'), h('b', '', String(item.price)), ' · Tạp hoá');
      btn.setAttribute('aria-disabled', 'true');
      btn.setAttribute('aria-label', `${item.name}, chưa có, ${item.price} Văn tiền`);
    } else if (state === 'placed') {
      const tick = h('span', 'dk-tick');
      tick.setAttribute('aria-hidden', 'true');
      tick.append(svgIcon(ICON_CHECK, 11, undefined, { ...STROKE, 'stroke-width': '3.6' }));
      pic.append(tick);
      status.textContent = 'Đang đặt';
      btn.setAttribute('aria-label', `${item.name}, đang đặt ở ô này`);
    } else {
      status.textContent = 'Đã có';
      btn.setAttribute('aria-label', item.name);
    }
    btn.append(pic, h('span', 'dk-name', item.name), status);
    btn.addEventListener('click', () => this.on.card(item.id));
    const li = h('li');
    li.append(btn);
    return li;
  }

  /** Kéo tay nắm / đầu bảng xuống → đóng (vẫn ở chế độ trang trí). */
  private swipeToClose(...grips: HTMLElement[]): void {
    let y0: number | null = null;
    for (const g of grips) {
      g.addEventListener('pointerdown', (e) => {
        y0 = e.clientY;
        g.setPointerCapture(e.pointerId);
      });
      g.addEventListener('pointerup', (e) => {
        if (y0 !== null && e.clientY - y0 > SWIPE_CLOSE_PX) this.on.close();
        y0 = null;
      });
    }
  }
}
